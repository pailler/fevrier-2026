const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");
const { promisify } = require("util");
const { exec } = require("child_process");
const execAsync = promisify(exec);
const QRCode = require("qrcode");

/** Jetons jetables : récupération d'une photo sur le téléphone (QR / NFC / SMS). */
const pickupTokens = new Map();
const PICKUP_TTL_MS = Number(process.env.PHOTOBOOTH_PICKUP_TTL_MS || 48 * 60 * 60 * 1000);
const smsCooldownByIp = new Map();
/** Cooldown impression directe (borne → imprimante sans dialogue navigateur) */
const boothPrintCooldownByIp = new Map();

const BOOTH_PRINT_FLAG = String(process.env.PHOTOBOOTH_BOOTH_PRINT || "").toLowerCase();
const BOOTH_PRINT_CMD = String(process.env.PHOTOBOOTH_BOOTH_PRINT_CMD || "");
const BOOTH_PRINT_COOLDOWN_MS = Number(process.env.PHOTOBOOTH_BOOTH_PRINT_COOLDOWN_MS || 3000);

function isBoothPrintConfigured() {
  if (BOOTH_PRINT_FLAG !== "1" && BOOTH_PRINT_FLAG !== "true" && BOOTH_PRINT_FLAG !== "yes") {
    return false;
  }
  if (!BOOTH_PRINT_CMD || !BOOTH_PRINT_CMD.includes("{{file}}")) {
    return false;
  }
  return true;
}

function fileUnderDirectory(filePath, dirPath) {
  const resolved = path.resolve(filePath);
  const base = path.resolve(dirPath);
  const rel = path.relative(base, resolved);
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function absoluteEventPhotoPath(eventId, filename) {
  const safe = safePhotoFilename(filename);
  if (!safe) return null;
  const full = path.join(photosDir(eventId), safe);
  if (!fileUnderDirectory(full, photosDir(eventId))) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

/**
 * Remplace {{file}} par le chemin absolu, correctement escapé pour la ligne de commande.
 * Ex. Linux : PHOTOBOOTH_BOOTH_PRINT_CMD=lp -o fit-to-page -d "Canon_SELPHY" {{file}}
 */
function buildBoothPrintShellCommand(template, absFile) {
  const q =
    process.platform === "win32"
      ? `"${String(absFile).replace(/"/g, '""')}"`
      : `'${String(absFile).replace(/'/g, "'\\''")}'`;
  return template.split("{{file}}").join(q);
}

/**
 * data:image/...;base64,... avec variantes MIME (Safari / vieux clients).
 * @returns {{ kind: "png" | "jpeg" | "webp", base64Payload: string } | null}
 */
function parseImageDataUrl(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const m = raw.match(/^data:image\/([^;,]+);base64,([\s\S]+)$/i);
  if (!m) return null;
  let mime = m[1].trim().toLowerCase();
  const base64Payload = String(m[2]).replace(/\s/g, "");
  if (!base64Payload) return null;
  if (mime === "jpg" || mime === "jpe" || mime === "pjpeg") mime = "jpeg";
  if (mime === "x-png") mime = "png";
  if (mime !== "png" && mime !== "jpeg" && mime !== "webp") return null;
  return { kind: mime, base64Payload };
}

async function runBoothPrintCommand(absFile) {
  const command = buildBoothPrintShellCommand(BOOTH_PRINT_CMD, absFile);
  const opts = { maxBuffer: 2 * 1024 * 1024, timeout: 120000, windowsHide: true };
  await execAsync(command, opts);
}

const app = express();
const PORT = Number(process.env.PHOTOBOOTH_PORT || 7885);

// Trust reverse proxy headers (nginx, Traefik) for X-Forwarded-Proto, Host
app.set("trust proxy", 1);
const STORAGE_ROOT = path.join(__dirname, "storage");
const EVENTS_ROOT = path.join(STORAGE_ROOT, "events");
const INDEX_FILE = path.join(STORAGE_ROOT, "events-index.json");

app.use(express.json({ limit: "50mb" }));

app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  next();
});

function ensureStorage() {
  fs.mkdirSync(EVENTS_ROOT, { recursive: true });
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify({ events: [] }, null, 2), "utf-8");
  }
}

function readIndex() {
  ensureStorage();
  const raw = fs.readFileSync(INDEX_FILE, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.events) ? parsed : { events: [] };
}

function writeIndex(indexData) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2), "utf-8");
}

function generatePin(existingEvents) {
  let pin = "";
  do {
    pin = String(Math.floor(1000 + Math.random() * 9000));
  } while (existingEvents.some((item) => item.pin === pin));
  return pin;
}

function eventDir(eventId) {
  return path.join(EVENTS_ROOT, eventId);
}

function photosDir(eventId) {
  return path.join(eventDir(eventId), "photos");
}

function videosDir(eventId) {
  return path.join(eventDir(eventId), "videos");
}

function buildBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

function cleanupPickupTokens() {
  const now = Date.now();
  for (const [k, v] of pickupTokens) {
    if (v.expires < now) pickupTokens.delete(k);
  }
}

function safePhotoFilename(name) {
  if (!name || typeof name !== "string") return null;
  const base = path.basename(name);
  if (!/^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)$/i.test(base)) return null;
  return base;
}

function getLatestPhotoFilename(eventId) {
  const folder = photosDir(eventId);
  if (!fs.existsSync(folder)) return null;
  const files = fs.readdirSync(folder).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  if (!files.length) return null;
  const sorted = files
    .map((f) => ({ f, t: fs.statSync(path.join(folder, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return sorted[0].f;
}

function photoFileExists(eventId, filename) {
  const safe = safePhotoFilename(filename);
  if (!safe) return false;
  const full = path.join(photosDir(eventId), safe);
  return fs.existsSync(full);
}

function normalizeSmsTo(raw) {
  let t = String(raw || "").replace(/\s/g, "");
  if (!t) return "";
  if (t.startsWith("00")) t = `+${t.slice(2)}`;
  if (/^0[67]\d{8}$/.test(t)) t = `+33${t.slice(1)}`;
  if (/^\d{10,15}$/.test(t)) t = `+${t}`;
  return t;
}

function sendTwilioSms({ to, body }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const msid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!sid || !authToken) {
    return Promise.reject(new Error("Twilio non configure (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)."));
  }
  const params = { To: to, Body: body };
  if (msid) params.MessagingServiceSid = msid;
  else if (from) params.From = from;
  else {
    return Promise.reject(new Error("Definir TWILIO_MESSAGING_SERVICE_SID ou TWILIO_FROM_NUMBER."));
  }
  const postData = querystring.stringify(params);
  const auth = Buffer.from(`${sid}:${authToken}`).toString("base64");
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.twilio.com",
        path: `/2010-04-01/Accounts/${sid}/Messages.json`,
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve({ raw: data });
            }
          } else {
            reject(new Error(data || `Twilio HTTP ${res.statusCode}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

app.use("/storage", express.static(STORAGE_ROOT));
app.use(
  express.static(__dirname, {
    /* Safari / Web App iPad : sans cela, .js et .css restent en cache même avec ?v= */
    etag: false,
    lastModified: false,
    setHeaders(res, filePath) {
      const p = String(filePath || "").toLowerCase();
      if (/\.(html|js|css|json)$/i.test(p) || p.endsWith(".webmanifest")) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    },
  })
);

app.get("/api/pipeline-config", (_req, res) => {
  const instantId = Boolean(String(process.env.PHOTOBOOTH_INSTANTID_URL || "").trim());
  res.json({
    instantIdHook: instantId,
    pipelineVersion: "1",
    styles: ["none", "royal", "cinema", "luxe", "disney", "magazine"],
    hint:
      "Les styles ajoutent cadre et typo autour de votre portrait sans déformer le visage. Branchez PHOTOBOOTH_INSTANTID_URL pour une génération InstantID / IP-Adapter côté worker.",
  });
});

/**
 * Proxy optionnel vers un worker (ComfyUI, API interne) — POST JSON { imageDataUrl, style } → { imageDataUrl }
 */
app.post("/api/pipeline-instantid", async (req, res) => {
  const hook = String(process.env.PHOTOBOOTH_INSTANTID_URL || "").trim();
  if (!hook) {
    return res.status(503).json({
      error: "Non configure",
      message: "Definissez PHOTOBOOTH_INSTANTID_URL vers votre service InstantID / IP-Adapter.",
    });
  }

  const imageDataUrl = String(req.body?.imageDataUrl || "");
  const style = String(req.body?.style || "none");
  const match = imageDataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "Format image invalide." });
  }

  const payload = JSON.stringify({ image: imageDataUrl, style, mode: "identity_preserving" });

  try {
    const u = new URL(hook);
    const isHttps = u.protocol === "https:";
    const lib = isHttps ? https : require("http");
    const resultBuf = await new Promise((resolve, reject) => {
      const opt = {
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + (u.search || ""),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };
      const reqOut = lib.request(opt, (inc) => {
        const chunks = [];
        inc.on("data", (c) => chunks.push(c));
        inc.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (inc.statusCode < 200 || inc.statusCode >= 300) {
            reject(new Error(String(buf.slice(0, 200)) || `HTTP ${inc.statusCode}`));
          } else {
            resolve(buf);
          }
        });
      });
      reqOut.on("error", reject);
      reqOut.write(payload);
      reqOut.end();
    });

    let outDataUrl;
    try {
      const j = JSON.parse(resultBuf.toString("utf-8"));
      if (j.imageDataUrl && /^data:image\//.test(j.imageDataUrl)) {
        outDataUrl = j.imageDataUrl;
      } else if (j.image_base64) {
        outDataUrl = `data:image/png;base64,${j.image_base64}`;
      }
    } catch {
      /* binary PNG */
    }
    if (!outDataUrl && resultBuf.length > 100) {
      outDataUrl = `data:image/png;base64,${resultBuf.toString("base64")}`;
    }
    if (!outDataUrl) {
      return res.status(502).json({ error: "Reponse worker invalide." });
    }
    return res.json({ imageDataUrl: outDataUrl });
  } catch (e) {
    console.error("pipeline-instantid:", e);
    return res.status(502).json({
      error: e instanceof Error ? e.message : "Worker inaccessible",
    });
  }
});

app.post("/api/events", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const host = String(req.body?.host || "").trim();

  if (name.length < 3) {
    return res.status(400).json({ error: "Nom d'evenement invalide." });
  }
  if (host.length < 2) {
    return res.status(400).json({ error: "Nom d'organisateur invalide." });
  }

  const indexData = readIndex();
  const id = crypto.randomUUID();
  const pin = generatePin(indexData.events);
  const now = new Date().toISOString();

  const eventRecord = { id, name, host, pin, createdAt: now };
  indexData.events.push(eventRecord);
  writeIndex(indexData);

  fs.mkdirSync(photosDir(id), { recursive: true });
  fs.mkdirSync(videosDir(id), { recursive: true });
  fs.writeFileSync(
    path.join(eventDir(id), "event.json"),
    JSON.stringify(eventRecord, null, 2),
    "utf-8"
  );

  return res.status(201).json({ event: eventRecord });
});

app.get("/api/events/by-pin/:pin", (req, res) => {
  const pin = String(req.params.pin || "");
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "PIN invalide." });
  }
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.pin === pin);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  return res.json({ event });
});

app.get("/api/events/:eventId", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  return res.json({ event });
});

app.get("/api/events/:eventId/photos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const folder = photosDir(eventId);
  fs.mkdirSync(folder, { recursive: true });
  const files = fs
    .readdirSync(folder)
    .filter((file) => {
      if (!/\.(png|jpg|jpeg|webp)$/i.test(file)) return false;
      if (/-raw\.(png|jpg|jpeg|webp)$/i.test(file)) return false;
      return true;
    })
    .map((file) => {
      const fullPath = path.join(folder, file);
      const stat = fs.statSync(fullPath);
      return {
        id: path.parse(file).name,
        filename: file,
        createdAt: stat.mtime.toISOString(),
        url: `/storage/events/${eventId}/photos/${file}`,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ photos: files });
});

app.post("/api/events/:eventId/photos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const imageDataUrl = String(req.body?.imageDataUrl || "");
  const originalDataUrl = String(req.body?.originalDataUrl || "");
  const pipelineStyle = req.body?.pipelineStyle != null ? String(req.body.pipelineStyle) : "";

  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const parsedMain = parseImageDataUrl(imageDataUrl);
  if (!parsedMain) {
    return res.status(400).json({ error: "Format image invalide." });
  }

  const extByKind = { png: "png", jpeg: "jpg", webp: "webp" };
  const ext = extByKind[parsedMain.kind] || "png";
  const buffer = Buffer.from(parsedMain.base64Payload, "base64");
  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `${baseId}.${ext}`;

  fs.mkdirSync(photosDir(eventId), { recursive: true });
  fs.writeFileSync(path.join(photosDir(eventId), filename), buffer);

  let originalFilename = null;
  if (originalDataUrl) {
    const parsedOrig = parseImageDataUrl(originalDataUrl);
    if (parsedOrig) {
      const oext = extByKind[parsedOrig.kind] || "jpg";
      const obuf = Buffer.from(parsedOrig.base64Payload, "base64");
      originalFilename = `${baseId}-raw.${oext}`;
      fs.writeFileSync(path.join(photosDir(eventId), originalFilename), obuf);
    }
  }

  if (pipelineStyle) {
    try {
      const metaPath = path.join(photosDir(eventId), `${baseId}-pipeline.json`);
      fs.writeFileSync(
        metaPath,
        JSON.stringify(
          {
            style: pipelineStyle,
            composed: filename,
            raw: originalFilename,
            at: new Date().toISOString(),
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (e) {
      console.warn("pipeline meta:", e);
    }
  }

  return res.status(201).json({
    photo: {
      id: path.parse(filename).name,
      filename,
      originalFilename,
      pipelineStyle: pipelineStyle || null,
      createdAt: new Date().toISOString(),
      url: `/storage/events/${eventId}/photos/${filename}`,
    },
  });
});

app.get("/api/events/:eventId/videos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const folder = videosDir(eventId);
  fs.mkdirSync(folder, { recursive: true });
  const files = fs
    .readdirSync(folder)
    .filter((file) => /\.(webm|mp4)$/i.test(file))
    .map((file) => {
      const fullPath = path.join(folder, file);
      const stat = fs.statSync(fullPath);
      return {
        id: path.parse(file).name,
        filename: file,
        createdAt: stat.mtime.toISOString(),
        url: `/storage/events/${eventId}/videos/${file}`,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ videos: files });
});

app.post("/api/events/:eventId/videos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const videoDataUrl = String(req.body?.videoDataUrl || "");

  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const b64Marker = ";base64,";
  const b64Idx = videoDataUrl.indexOf(b64Marker);
  if (b64Idx === -1 || !/^data:video\//i.test(videoDataUrl)) {
    return res.status(400).json({ error: "Format video invalide (data URL attendue)." });
  }

  const metaPart = videoDataUrl.slice(5, b64Idx).trim();
  const base64Payload = videoDataUrl.slice(b64Idx + b64Marker.length);
  if (!base64Payload) {
    return res.status(400).json({ error: "Donnees video vides." });
  }

  const mainMime = metaPart.split(";")[0].trim().toLowerCase();
  const ext =
    mainMime === "video/webm" || mainMime === "video/x-matroska"
      ? "webm"
      : mainMime === "video/mp4" || mainMime === "video/quicktime"
        ? "mp4"
        : null;
  if (!ext) {
    return res.status(400).json({ error: "Type video non supporte (webm ou mp4)." });
  }
  const buffer = Buffer.from(base64Payload, "base64");
  const maxBytes = Number(process.env.PHOTOBOOTH_MAX_VIDEO_BYTES || 45 * 1024 * 1024);
  if (buffer.length > maxBytes) {
    return res.status(413).json({ error: "Video trop volumineuse." });
  }

  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `${baseId}.${ext}`;

  fs.mkdirSync(videosDir(eventId), { recursive: true });
  fs.writeFileSync(path.join(videosDir(eventId), filename), buffer);

  return res.status(201).json({
    video: {
      id: path.parse(filename).name,
      filename,
      createdAt: new Date().toISOString(),
      url: `/storage/events/${eventId}/videos/${filename}`,
    },
  });
});

app.get("/api/events/:eventId/qrcode", async (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const token = String(req.query.token || "");
  const galleryUrl = new URL(`${buildBaseUrl(req)}/gallery.html`);
  galleryUrl.searchParams.set("eventId", eventId);
  if (token) galleryUrl.searchParams.set("token", token);

  const qrDataUrl = await QRCode.toDataURL(galleryUrl.toString(), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
  });

  return res.json({ galleryUrl: galleryUrl.toString(), qrDataUrl });
});

app.get("/api/pickup-config", (_req, res) => {
  const twilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
  );
  res.json({ twilio, pickupTtlHours: Math.round(PICKUP_TTL_MS / 3600000) });
});

app.get("/api/booth-print-config", (_req, res) => {
  res.json({
    directPrint: isBoothPrintConfigured(),
    hint: isBoothPrintConfigured()
      ? "Impression cote machine serveur (sans fenetre du navigateur). Configurez PHOTOBOOTH_BOOTH_PRINT_CMD."
      : "Pour un gros bouton sans options pilote, activez l'impression cote serveur (voir .env).",
  });
});

app.post("/api/events/:eventId/print-to-booth", async (req, res) => {
  if (!isBoothPrintConfigured()) {
    return res.status(503).json({ error: "Impression directe non configuree sur le serveur." });
  }
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) {
    return res.status(404).json({ error: "Evenement introuvable." });
  }

  const filename = String(req.body?.filename || "");
  const abs = absoluteEventPhotoPath(eventId, filename);
  if (!abs) {
    return res.status(400).json({ error: "Fichier photo introuvable." });
  }

  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
  const last = boothPrintCooldownByIp.get(ip) || 0;
  if (Date.now() - last < BOOTH_PRINT_COOLDOWN_MS) {
    return res.status(429).json({ error: "Attendez un instant avant reimprimer." });
  }

  try {
    await runBoothPrintCommand(abs);
    boothPrintCooldownByIp.set(ip, Date.now());
    return res.json({ ok: true });
  } catch (e) {
    console.error("print-to-booth:", e);
    var stderr = "";
    if (e) {
      if (typeof e.stderr === "string") stderr = e.stderr;
      else if (e.stderr && e.stderr.toString) stderr = e.stderr.toString();
    }
    const msg = stderr ? String(stderr).trim().slice(0, 200) : "";
    return res.status(500).json({
      error:
        "Echec impression. Verifiez la file d'impression / la commande PHOTOBOOTH_BOOTH_PRINT_CMD sur le serveur." +
        (msg ? " (" + msg + ")" : ""),
    });
  }
});

app.get("/api/pickup-info", (req, res) => {
  cleanupPickupTokens();
  const token = String(req.query.token || "").trim();
  if (!/^[a-f0-9]{40,64}$/i.test(token) || !pickupTokens.has(token)) {
    return res.status(404).json({ error: "Lien expire ou invalide." });
  }
  const entry = pickupTokens.get(token);
  if (!entry || entry.expires < Date.now()) {
    pickupTokens.delete(token);
    return res.status(404).json({ error: "Lien expire ou invalide." });
  }
  const base = buildBaseUrl(req);
  const imageUrl = `${base}/storage/events/${entry.eventId}/photos/${encodeURIComponent(entry.filename)}`;
  const pickupUrl = `${base}/pickup.html?t=${encodeURIComponent(token)}`;
  return res.json({ imageUrl, pickupUrl, filename: entry.filename });
});

app.post("/api/events/:eventId/pickup-token", async (req, res) => {
  cleanupPickupTokens();
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  let filename = safePhotoFilename(req.body?.filename);
  if (!filename) filename = getLatestPhotoFilename(eventId);
  if (!filename || !photoFileExists(eventId, filename)) {
    return res.status(404).json({ error: "Photo introuvable." });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expires = Date.now() + PICKUP_TTL_MS;
  pickupTokens.set(token, { eventId, filename, expires });

  const base = buildBaseUrl(req);
  const pickupUrl = `${base}/pickup.html?t=${encodeURIComponent(token)}`;
  const imageUrl = `${base}/storage/events/${eventId}/photos/${encodeURIComponent(filename)}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(pickupUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
    });
    return res.json({
      token,
      pickupUrl,
      imageUrl,
      qrDataUrl,
      expiresAt: new Date(expires).toISOString(),
    });
  } catch (err) {
    console.error("pickup-token QR:", err);
    return res.status(500).json({ error: "Erreur generation QR." });
  }
});

app.post("/api/pickup-sms", async (req, res) => {
  const token = String(req.body?.token || "").trim();
  const rawTo = req.body?.to;
  const to = normalizeSmsTo(rawTo);
  if (!/^[a-f0-9]{40,64}$/i.test(token) || !pickupTokens.has(token)) {
    return res.status(400).json({ error: "Jeton invalide." });
  }
  if (!/^\+[1-9]\d{7,14}$/.test(to)) {
    return res.status(400).json({ error: "Numero invalide (format international, ex. +33612345678)." });
  }

  const entry = pickupTokens.get(token);
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ error: "Lien expire." });
  }

  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const last = smsCooldownByIp.get(ip) || 0;
  if (Date.now() - last < 60000) {
    return res.status(429).json({ error: "Attendez une minute avant un nouvel envoi." });
  }

  const base = buildBaseUrl(req);
  const pickupUrl = `${base}/pickup.html?t=${encodeURIComponent(token)}`;
  const body = `Photo Photobooth — recuperez-la ici (lien valable encore un moment) :\n${pickupUrl}`;

  try {
    await sendTwilioSms({ to, body });
    smsCooldownByIp.set(ip, Date.now());
    return res.json({ ok: true });
  } catch (e) {
    console.error("pickup-sms:", e);
    return res.status(500).json({ error: e instanceof Error ? e.message : "SMS non envoye." });
  }
});

const OFFER_QR_MEDIA = new Set(["pin", "token", "organic"]);

app.get("/api/offer-qr.png", async (req, res) => {
  const medium = OFFER_QR_MEDIA.has(String(req.query.medium || ""))
    ? String(req.query.medium)
    : "pin";
  const url =
    "https://iahome.fr/pricing2?promo=BIENVENUE10&utm_source=photobooth_guest&utm_medium=" +
    medium;
  try {
    const buf = await QRCode.toBuffer(url, {
      type: "png",
      width: 240,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#065f46ff", light: "#ffffffff" },
    });
    res.type("png");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(buf);
  } catch (err) {
    res.status(500).type("text").send("QR generation failed");
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, storage: EVENTS_ROOT });
});

ensureStorage();
const server = app.listen(PORT, () => {
  console.log(`Photobooth server running on http://0.0.0.0:${PORT}`);
  console.log(`Storage root: ${EVENTS_ROOT}`);
  if (isBoothPrintConfigured()) {
    console.log("Borne: impression directe (PHOTOBOOTH_BOOTH_PRINT_CMD) — l'iPad n'ouvre plus la fenetre du pilote.");
  }
});
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `[Photobooth] Port ${PORT} deja utilise (EADDRINUSE). ` +
        `Arretez l'autre processus, ou lancez avec PHOTOBOOTH_PORT=autre_port (defaut 7885).`
    );
    process.exit(1);
  }
  throw err;
});
