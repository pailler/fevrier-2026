const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");
const { promisify } = require("util");
const { exec } = require("child_process");
const { pipeline, Transform } = require("stream");
const multer = require("multer");
const execAsync = promisify(exec);
const QRCode = require("qrcode");

/** Jetons jetables : récupération d'une photo sur le téléphone (QR / NFC / SMS). */
const pickupTokens = new Map();
const PICKUP_TTL_MS = Number(process.env.PHOTOBOOTH_PICKUP_TTL_MS || 48 * 60 * 60 * 1000);
const smsCooldownByIp = new Map();
/** Cooldown impression directe (borne → imprimante sans dialogue navigateur) */
const boothPrintCooldownByIp = new Map();
/** Sessions JPEG portrait temporaires (AirPrint iPad — URL image seule, sans page HTML) */
const printPortraitSessions = new Map();
const PRINT_PORTRAIT_TTL_MS = 15 * 60 * 1000;

function cleanupPrintPortraitSessions() {
  const now = Date.now();
  for (const [token, entry] of printPortraitSessions) {
    if (now - entry.createdAt > PRINT_PORTRAIT_TTL_MS) printPortraitSessions.delete(token);
  }
}
setInterval(cleanupPrintPortraitSessions, 60 * 1000);

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
const DEFAULT_MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const MAX_VIDEO_CHUNK_BYTES = 3 * 1024 * 1024;
const UPLOAD_TEMP_ROOT = path.join(STORAGE_ROOT, "upload-temp");

app.use(express.json({ limit: "450mb" }));

app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
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

function smartphoneDir(eventId) {
  return path.join(eventDir(eventId), "smartphone");
}

function smartphoneVideosDir(eventId) {
  return path.join(eventDir(eventId), "smartphone-videos");
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
  const base = path.basename(String(name).trim().replace(/\\/g, "/"));
  if (!base || base === "." || base === "..") return null;
  if (!/\.(png|jpg|jpeg|webp)$/i.test(base)) return null;
  if (base.includes("..")) return null;
  return base;
}

/** URL publique /storage/... avec nom de fichier encodé (espaces, accents, parentheses). */
function storagePublicUrl(eventId, kind, filename) {
  const id = String(eventId || "");
  const file = String(filename || "");
  const folder =
    kind === "videos"
      ? "videos"
      : kind === "smartphone-videos"
        ? "smartphone-videos"
        : kind === "smartphone"
          ? "smartphone"
          : "photos";
  return `/storage/events/${id}/${folder}/${encodeURIComponent(file)}`;
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

app.use(
  "/storage",
  express.static(STORAGE_ROOT, {
    setHeaders(res, filePath) {
      const p = String(filePath || "").toLowerCase();
      if (/\.mp4$/i.test(p) || /\.m4v$/i.test(p)) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Accept-Ranges", "bytes");
      } else if (/\.webm$/i.test(p)) {
        res.setHeader("Content-Type", "video/webm");
        res.setHeader("Accept-Ranges", "bytes");
      } else if (/\.mov$/i.test(p)) {
        res.setHeader("Content-Type", "video/quicktime");
        res.setHeader("Accept-Ranges", "bytes");
      }
    },
  })
);
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
  fs.mkdirSync(smartphoneDir(id), { recursive: true });
  fs.mkdirSync(smartphoneVideosDir(id), { recursive: true });
  fs.writeFileSync(
    path.join(eventDir(id), "event.json"),
    JSON.stringify(eventRecord, null, 2),
    "utf-8"
  );

  return res.status(201).json({ event: eventRecord });
});

function readEventRecord(eventId) {
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return null;
  const eventJsonPath = path.join(eventDir(eventId), "event.json");
  if (fs.existsSync(eventJsonPath)) {
    try {
      const extra = JSON.parse(fs.readFileSync(eventJsonPath, "utf-8"));
      return { ...event, ...extra, id: event.id, pin: event.pin };
    } catch {
      /* ignore */
    }
  }
  return event;
}

app.get("/api/events/by-pin/:pin", (req, res) => {
  const pin = String(req.params.pin || "");
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "PIN invalide." });
  }
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.pin === pin);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  const merged = readEventRecord(event.id) || event;
  return res.json({ event: merged });
});

app.get("/api/events/:eventId", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const event = readEventRecord(eventId);
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
        url: storagePublicUrl(eventId, "photos", file),
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
      url: storagePublicUrl(eventId, "photos", filename),
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
        url: storagePublicUrl(eventId, "videos", file),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ videos: files });
});

function listSmartphonePhotos(eventId) {
  const folder = smartphoneDir(eventId);
  fs.mkdirSync(folder, { recursive: true });
  return fs
    .readdirSync(folder)
    .filter((file) => /\.(png|jpg|jpeg|webp|heic|heif)$/i.test(file))
    .map((file) => {
      const fullPath = path.join(folder, file);
      const stat = fs.statSync(fullPath);
      return {
        id: path.parse(file).name,
        filename: file,
        createdAt: stat.mtime.toISOString(),
        url: storagePublicUrl(eventId, "smartphone", file),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

app.get("/api/events/:eventId/smartphone-photos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  return res.json({ photos: listSmartphonePhotos(eventId) });
});

app.post("/api/events/:eventId/smartphone-photos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const imageDataUrl = String(req.body?.imageDataUrl || "");

  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const parsedMain = parseImageDataUrl(imageDataUrl);
  if (!parsedMain) {
    return res.status(400).json({ error: "Format image invalide (JPEG, PNG ou WebP)." });
  }

  const extByKind = { png: "png", jpeg: "jpg", webp: "webp" };
  const ext = extByKind[parsedMain.kind] || "jpg";
  const buffer = Buffer.from(parsedMain.base64Payload, "base64");
  const maxBytes = Number(process.env.PHOTOBOOTH_MAX_SMARTPHONE_BYTES || 25 * 1024 * 1024);
  if (buffer.length > maxBytes) {
    return res.status(413).json({ error: "Photo trop volumineuse." });
  }

  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `phone-${baseId}.${ext}`;

  fs.mkdirSync(smartphoneDir(eventId), { recursive: true });
  fs.writeFileSync(path.join(smartphoneDir(eventId), filename), buffer);

  return res.status(201).json({
    photo: {
      id: path.parse(filename).name,
      filename,
      createdAt: new Date().toISOString(),
      url: storagePublicUrl(eventId, "smartphone", filename),
    },
  });
});

function listSmartphoneVideos(eventId) {
  const folder = smartphoneVideosDir(eventId);
  fs.mkdirSync(folder, { recursive: true });
  return fs
    .readdirSync(folder)
    .filter((file) => /\.(webm|mp4|mov|m4v)$/i.test(file))
    .map((file) => {
      const fullPath = path.join(folder, file);
      const stat = fs.statSync(fullPath);
      return {
        id: path.parse(file).name,
        filename: file,
        createdAt: stat.mtime.toISOString(),
        url: storagePublicUrl(eventId, "smartphone-videos", file),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

app.get("/api/events/:eventId/smartphone-videos", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  return res.json({ videos: listSmartphoneVideos(eventId) });
});

function saveSmartphoneVideoBuffer(eventId, buffer, ext) {
  const maxBytes = Number(
    process.env.PHOTOBOOTH_MAX_SMARTPHONE_VIDEO_BYTES ||
      process.env.PHOTOBOOTH_MAX_VIDEO_BYTES ||
      DEFAULT_MAX_VIDEO_BYTES
  );
  if (buffer.length > maxBytes) {
    const err = new Error("VIDEO_TOO_LARGE");
    err.status = 413;
    throw err;
  }
  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `phone-${baseId}.${ext}`;
  fs.mkdirSync(smartphoneVideosDir(eventId), { recursive: true });
  fs.writeFileSync(path.join(smartphoneVideosDir(eventId), filename), buffer);
  return {
    id: path.parse(filename).name,
    filename,
    createdAt: new Date().toISOString(),
    url: storagePublicUrl(eventId, "smartphone-videos", filename),
  };
}

function getMaxSmartphoneVideoBytes() {
  return Number(
    process.env.PHOTOBOOTH_MAX_SMARTPHONE_VIDEO_BYTES ||
      process.env.PHOTOBOOTH_MAX_VIDEO_BYTES ||
      DEFAULT_MAX_VIDEO_BYTES
  );
}

function getMaxEventVideoBytes() {
  return Number(process.env.PHOTOBOOTH_MAX_VIDEO_BYTES || DEFAULT_MAX_VIDEO_BYTES);
}

function chunkTempDir(eventId, uploadId) {
  return path.join(UPLOAD_TEMP_ROOT, eventId, uploadId);
}

function chunkPartName(index) {
  return `part-${String(index).padStart(6, "0")}`;
}

function readChunkMeta(tempDir) {
  const metaPath = path.join(tempDir, "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    return null;
  }
}

function writeChunkMeta(tempDir, meta) {
  fs.writeFileSync(path.join(tempDir, "meta.json"), JSON.stringify(meta), "utf-8");
}

function cleanupUploadTempDir(tempDir) {
  if (!tempDir || !fs.existsSync(tempDir)) return;
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {
    console.warn("upload temp cleanup", e);
  }
}

function safeVideoFilename(name) {
  if (!name || typeof name !== "string") return null;
  const base = path.basename(String(name).trim().replace(/\\/g, "/"));
  if (!base || base === "." || base === "..") return null;
  if (!/\.(webm|mp4|mov|m4v)$/i.test(base)) return null;
  if (base.includes("..")) return null;
  return base;
}

function hasValidVideoContainer(absPath, ext) {
  try {
    const buf = Buffer.alloc(65536);
    const fd = fs.openSync(absPath, "r");
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    if (n < 4) return false;
    if (ext === "webm") {
      return buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
    }
    const head = buf.slice(0, n).toString("latin1");
    return head.includes("ftyp") || head.includes("moov") || head.includes("mdat");
  } catch {
    return false;
  }
}

function remuxVideoFaststart(absPath) {
  if (String(process.env.PHOTOBOOTH_SKIP_VIDEO_REMUX || "") === "1") {
    return Promise.resolve();
  }
  const tmpPath = `${absPath}.faststart.tmp`;
  const qIn =
    process.platform === "win32"
      ? `"${String(absPath).replace(/"/g, '""')}"`
      : `'${String(absPath).replace(/'/g, "'\\''")}'`;
  const qOut =
    process.platform === "win32"
      ? `"${String(tmpPath).replace(/"/g, '""')}"`
      : `'${String(tmpPath).replace(/'/g, "'\\''")}'`;
  const command = `ffmpeg -y -hide_banner -loglevel error -i ${qIn} -c copy -movflags +faststart ${qOut}`;
  return execAsync(command, { timeout: 600000, maxBuffer: 4 * 1024 * 1024, windowsHide: true })
    .then(() => {
      fs.renameSync(tmpPath, absPath);
    })
    .catch((err) => {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      throw err;
    });
}

function finalizeUploadedVideoFile(absPath, ext) {
  if (!hasValidVideoContainer(absPath, ext)) {
    fs.unlinkSync(absPath);
    const err = new Error("INVALID_VIDEO");
    err.status = 400;
    return Promise.reject(err);
  }
  if (ext !== "mp4" && ext !== "mov") {
    return Promise.resolve();
  }
  return remuxVideoFaststart(absPath).catch((err) => {
    console.warn("ffmpeg faststart skipped", err instanceof Error ? err.message : err);
  });
}

function mergeChunkParts(tempDir, destPath, totalChunks) {
  let expectedSize = 0;
  for (let i = 0; i < totalChunks; i++) {
    const partPath = path.join(tempDir, chunkPartName(i));
    if (!fs.existsSync(partPath)) {
      throw Object.assign(new Error("MISSING_CHUNK"), { status: 400 });
    }
    const partStat = fs.statSync(partPath);
    expectedSize += partStat.size;
    const data = fs.readFileSync(partPath);
    if (i === 0) fs.writeFileSync(destPath, data);
    else fs.appendFileSync(destPath, data);
  }
  const finalStat = fs.statSync(destPath);
  if (finalStat.size !== expectedSize) {
    fs.unlinkSync(destPath);
    throw Object.assign(new Error("CHUNK_SIZE_MISMATCH"), { status: 400 });
  }
}

function allChunksReceived(meta, totalChunks) {
  if (!meta || !meta.received) return false;
  for (let i = 0; i < totalChunks; i++) {
    if (!meta.received[String(i)]) return false;
  }
  return true;
}

function streamBodyToFile(req, res, options) {
  const { destPath, maxBytes, onSuccess, onErrorLabel } = options;
  let received = 0;
  let settled = false;

  const limiter = new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      if (received > maxBytes) {
        callback(Object.assign(new Error("PAYLOAD_TOO_LARGE"), { status: 413 }));
        return;
      }
      callback(null, chunk);
    },
  });

  const writeStream = fs.createWriteStream(destPath);

  pipeline(req, limiter, writeStream, (err) => {
    if (settled) return;
    settled = true;
    if (err) {
      fs.unlink(destPath, () => {});
      if (err.status === 413 || err.message === "PAYLOAD_TOO_LARGE") {
        if (!res.headersSent) res.status(413).json({ error: "Video trop volumineuse." });
        return;
      }
      console.warn(onErrorLabel || "stream upload", err);
      if (!res.headersSent) res.status(500).json({ error: "Enregistrement video impossible." });
      return;
    }
    if (received === 0) {
      fs.unlink(destPath, () => {});
      if (!res.headersSent) res.status(400).json({ error: "Donnees video vides." });
      return;
    }
    onSuccess(received);
  });
}

function streamVideoUploadToDisk(req, res, options) {
  const { eventId, destDir, filenamePrefix, storageKind, maxBytes } = options;
  const ext =
    videoExtFromContentType(req.headers["content-type"], req.query.ext) ||
    videoExtFromContentType("", "mp4");
  if (!ext) {
    return res.status(400).json({ error: "Type video non supporte (webm ou mp4)." });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > maxBytes) {
    return res.status(413).json({ error: "Video trop volumineuse." });
  }

  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `${filenamePrefix}${baseId}.${ext}`;
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);

  streamBodyToFile(req, res, {
    destPath,
    maxBytes,
    onErrorLabel: "video stream upload",
    onSuccess() {
      const video = {
        id: path.parse(filename).name,
        filename,
        createdAt: new Date().toISOString(),
        url: storagePublicUrl(eventId, storageKind, filename),
      };
      finalizeUploadedVideoFile(destPath, ext)
        .then(() => {
          if (!res.headersSent) res.status(201).json({ video });
        })
        .catch((err) => {
          if (err && err.status === 400) {
            if (!res.headersSent) {
              res.status(400).json({ error: "Fichier video invalide ou incomplet." });
            }
            return;
          }
          if (!res.headersSent) res.status(201).json({ video });
        });
    },
  });
}

function parseChunkUploadParams(req) {
  const uploadId = String(req.headers["x-upload-id"] || req.query.uploadId || "").trim();
  const chunkIndex = Number(req.headers["x-chunk-index"] ?? req.query.chunkIndex);
  const totalChunks = Number(req.headers["x-chunk-total"] ?? req.query.chunkTotal);
  const ext =
    videoExtFromContentType(req.headers["content-type"], req.query.ext) ||
    videoExtFromContentType("", req.query.ext) ||
    videoExtFromContentType("", "mp4");
  return { uploadId, chunkIndex, totalChunks, ext };
}

function validateChunkUploadParams(res, params) {
  const { uploadId, chunkIndex, totalChunks, ext } = params;
  if (!uploadId || !/^[a-zA-Z0-9_-]+$/.test(uploadId)) {
    res.status(400).json({ error: "Identifiant upload invalide." });
    return false;
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    res.status(400).json({ error: "Index de morceau invalide." });
    return false;
  }
  if (!Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > 160) {
    res.status(400).json({ error: "Nombre de morceaux invalide." });
    return false;
  }
  if (chunkIndex >= totalChunks) {
    res.status(400).json({ error: "Index de morceau hors limites." });
    return false;
  }
  if (!ext) {
    res.status(400).json({ error: "Type video non supporte (webm ou mp4)." });
    return false;
  }
  return true;
}

function afterChunkPartStored(req, res, eventId, params) {
  const { uploadId, chunkIndex, totalChunks, ext } = params;
  const tempDir = chunkTempDir(eventId, uploadId);

  let meta = readChunkMeta(tempDir);
  if (!meta) {
    meta = { ext, totalChunks, received: {} };
  }
  meta.ext = ext;
  meta.totalChunks = totalChunks;
  meta.received[String(chunkIndex)] = true;
  writeChunkMeta(tempDir, meta);

  const receivedCount = Object.keys(meta.received).length;
  if (!allChunksReceived(meta, totalChunks)) {
    return res.json({
      ok: true,
      chunkIndex,
      received: receivedCount,
      totalChunks,
      complete: false,
    });
  }

  const maxBytes = getMaxSmartphoneVideoBytes();
  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `phone-${baseId}.${ext}`;
  const destDir = smartphoneVideosDir(eventId);
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);

  try {
    mergeChunkParts(tempDir, destPath, totalChunks);
    const stat = fs.statSync(destPath);
    if (stat.size > maxBytes) {
      fs.unlinkSync(destPath);
      cleanupUploadTempDir(tempDir);
      return res.status(413).json({ error: "Video trop volumineuse." });
    }
    cleanupUploadTempDir(tempDir);
    const video = {
      id: path.parse(filename).name,
      filename,
      createdAt: new Date().toISOString(),
      url: storagePublicUrl(eventId, "smartphone-videos", filename),
    };
    finalizeUploadedVideoFile(destPath, ext)
      .then(() => {
        if (!res.headersSent) res.status(201).json({ video, complete: true });
      })
      .catch((finalizeErr) => {
        if (finalizeErr && finalizeErr.status === 400) {
          if (!res.headersSent) {
            res.status(400).json({ error: "Fichier video invalide ou incomplet." });
          }
          return;
        }
        if (!res.headersSent) res.status(201).json({ video, complete: true });
      });
  } catch (e) {
    console.warn("video chunk merge", e);
    cleanupUploadTempDir(tempDir);
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Assemblage video impossible." });
    }
  }
}

const smartphoneChunkMulter = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      try {
        const eventId = String(req.params.eventId || "");
        const uploadId = String(req.query.uploadId || "").trim();
        const dir = chunkTempDir(eventId, uploadId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      } catch (e) {
        cb(e);
      }
    },
    filename(req, _file, cb) {
      const chunkIndex = Number(req.query.chunkIndex);
      cb(null, chunkPartName(chunkIndex));
    },
  }),
  limits: { fileSize: MAX_VIDEO_CHUNK_BYTES, files: 1 },
});

function handleSmartphoneVideoChunkUpload(req, res, eventId) {
  const params = parseChunkUploadParams(req);
  if (!validateChunkUploadParams(res, params)) return;

  const { uploadId, chunkIndex, totalChunks, ext } = params;
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > MAX_VIDEO_CHUNK_BYTES) {
    return res.status(413).json({ error: "Morceau trop volumineux." });
  }

  const tempDir = chunkTempDir(eventId, uploadId);
  fs.mkdirSync(tempDir, { recursive: true });
  const partPath = path.join(tempDir, chunkPartName(chunkIndex));

  streamBodyToFile(req, res, {
    destPath: partPath,
    maxBytes: MAX_VIDEO_CHUNK_BYTES,
    onErrorLabel: "video chunk upload",
    onSuccess() {
      afterChunkPartStored(req, res, eventId, params);
    },
  });
}

function handleSmartphoneVideoChunkMultipart(req, res, eventId) {
  const params = parseChunkUploadParams(req);
  if (!validateChunkUploadParams(res, params)) return;
  if (!req.file || !req.file.size) {
    return res.status(400).json({ error: "Donnees morceau vides." });
  }
  afterChunkPartStored(req, res, eventId, params);
}

function handleSmartphoneVideoChunkJson(req, res, eventId) {
  const body = req.body || {};
  const uploadId = String(body.uploadId || "").trim();
  const chunkIndex = Number(body.chunkIndex);
  const totalChunks = Number(body.chunkTotal);
  const ext =
    videoExtFromContentType("", body.ext) ||
    videoExtFromContentType("", "mp4");
  const params = { uploadId, chunkIndex, totalChunks, ext };
  if (!validateChunkUploadParams(res, params)) return;

  const chunkData = String(body.chunkData || "").replace(/\s/g, "");
  if (!chunkData) {
    return res.status(400).json({ error: "Donnees morceau vides." });
  }

  let buffer;
  try {
    buffer = Buffer.from(chunkData, "base64");
  } catch (e) {
    return res.status(400).json({ error: "Donnees morceau invalides." });
  }
  if (!buffer.length) {
    return res.status(400).json({ error: "Donnees morceau vides." });
  }
  if (buffer.length > MAX_VIDEO_CHUNK_BYTES) {
    return res.status(413).json({ error: "Morceau trop volumineux." });
  }

  const tempDir = chunkTempDir(eventId, uploadId);
  fs.mkdirSync(tempDir, { recursive: true });
  const partPath = path.join(tempDir, chunkPartName(chunkIndex));
  fs.writeFileSync(partPath, buffer);
  afterChunkPartStored(req, res, eventId, params);
}

app.post("/api/events/:eventId/smartphone-videos/:filename/repair", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const filename = safeVideoFilename(req.params.filename);
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  if (!filename) return res.status(400).json({ error: "Nom de video invalide." });
  const absPath = path.join(smartphoneVideosDir(eventId), filename);
  if (!fs.existsSync(absPath)) return res.status(404).json({ error: "Video introuvable." });
  const ext = path.extname(filename).slice(1).toLowerCase();
  finalizeUploadedVideoFile(absPath, ext)
    .then(() => {
      res.json({
        ok: true,
        url: storagePublicUrl(eventId, "smartphone-videos", filename),
      });
    })
    .catch((err) => {
      console.warn("smartphone-videos/repair", err);
      res.status(500).json({ error: "Reparation video impossible." });
    });
});

app.get("/api/events/:eventId/smartphone-videos/upload-chunk", (req, res) => {
  if (String(req.query.probe || "") !== "1") {
    return res.status(404).json({ error: "Not found." });
  }
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });
  return res.json({
    ok: true,
    maxChunkBytes: MAX_VIDEO_CHUNK_BYTES,
    recommendedChunkBytes: 768 * 1024,
    preferredMode: "json-base64",
  });
});

app.post("/api/events/:eventId/smartphone-videos/upload-chunk", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("application/json")) {
    return handleSmartphoneVideoChunkJson(req, res, eventId);
  }
  if (contentType.includes("multipart/form-data")) {
    return smartphoneChunkMulter.single("chunk")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "Morceau trop volumineux." });
        }
        console.warn("video chunk multipart", err);
        return res.status(400).json({ error: "Upload morceau invalide." });
      }
      return handleSmartphoneVideoChunkMultipart(req, res, eventId);
    });
  }

  return handleSmartphoneVideoChunkUpload(req, res, eventId);
});

app.post("/api/events/:eventId/smartphone-videos/upload", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  streamVideoUploadToDisk(req, res, {
    eventId,
    destDir: smartphoneVideosDir(eventId),
    filenamePrefix: "phone-",
    storageKind: "smartphone-videos",
    maxBytes: getMaxSmartphoneVideoBytes(),
  });
});

app.post("/api/events/:eventId/smartphone-videos", (req, res) => {
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
  let video;
  try {
    video = saveSmartphoneVideoBuffer(eventId, buffer, ext);
  } catch (e) {
    if (e && e.status === 413) {
      return res.status(413).json({ error: "Video trop volumineuse." });
    }
    console.warn("smartphone-videos data-url", e);
    return res.status(500).json({ error: "Enregistrement video impossible." });
  }

  return res.status(201).json({ video });
});

function videoExtFromContentType(contentType, fallbackExt) {
  const ct = String(contentType || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (ct === "video/webm" || ct === "video/x-matroska") return "webm";
  if (ct === "video/quicktime") return "mov";
  if (ct === "video/mp4" || ct === "video/x-m4v") return "mp4";
  const fb = String(fallbackExt || "")
    .trim()
    .toLowerCase();
  if (fb === "webm" || fb === "mp4" || fb === "mov") return fb;
  return null;
}

function saveEventVideoBuffer(eventId, buffer, ext) {
  const maxBytes = Number(process.env.PHOTOBOOTH_MAX_VIDEO_BYTES || DEFAULT_MAX_VIDEO_BYTES);
  if (buffer.length > maxBytes) {
    const err = new Error("VIDEO_TOO_LARGE");
    err.status = 413;
    throw err;
  }
  const baseId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const filename = `${baseId}.${ext}`;
  fs.mkdirSync(videosDir(eventId), { recursive: true });
  fs.writeFileSync(path.join(videosDir(eventId), filename), buffer);
  return {
    id: path.parse(filename).name,
    filename,
    createdAt: new Date().toISOString(),
    url: storagePublicUrl(eventId, "videos", filename),
  };
}

app.post("/api/events/:eventId/videos/upload", (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  streamVideoUploadToDisk(req, res, {
    eventId,
    destDir: videosDir(eventId),
    filenamePrefix: "",
    storageKind: "videos",
    maxBytes: getMaxEventVideoBytes(),
  });
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
  let video;
  try {
    video = saveEventVideoBuffer(eventId, buffer, ext);
  } catch (e) {
    if (e && e.status === 413) {
      return res.status(413).json({ error: "Video trop volumineuse." });
    }
    console.warn("videos data-url", e);
    return res.status(500).json({ error: "Enregistrement video impossible." });
  }

  return res.status(201).json({ video });
});

app.get("/api/events/:eventId/qrcode", async (req, res) => {
  const eventId = String(req.params.eventId || "");
  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const token = String(req.query.token || "");
  const section = String(req.query.section || "").toLowerCase();
  const pageName =
    section === "smartphone"
      ? "smartphone-gallery.html"
      : section === "smartphone-videos"
        ? "smartphone-video-gallery.html"
        : "gallery.html";
  const galleryUrl = new URL(`${buildBaseUrl(req)}/${pageName}`);
  galleryUrl.searchParams.set("eventId", eventId);
  if (token) galleryUrl.searchParams.set("token", token);
  if (section === "videos") galleryUrl.hash = "videos";

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

/** JPEG portrait temporaire pour AirPrint (pas de page HTML — fichier image brut). */
app.post("/api/print-portrait", (req, res) => {
  cleanupPrintPortraitSessions();
  const parsed = parseImageDataUrl(req.body?.imageDataUrl);
  if (!parsed || parsed.kind !== "jpeg") {
    return res.status(400).json({ error: "Image JPEG invalide." });
  }
  let buffer;
  try {
    buffer = Buffer.from(parsed.base64Payload, "base64");
  } catch {
    return res.status(400).json({ error: "Payload image invalide." });
  }
  if (!buffer.length) {
    return res.status(400).json({ error: "Image vide." });
  }
  const token = crypto.randomBytes(12).toString("hex");
  printPortraitSessions.set(token, { buffer, createdAt: Date.now() });
  return res.json({
    ok: true,
    token,
    imageUrl: `/api/print-portrait/${token}.jpg`,
    printSheetUrl: `/api/print-portrait/${token}/sheet`,
  });
});

/** Feuille 1 page Postcard 4×6" (≈ 10×15 cm) — plein cadre, sans marge. */
app.get("/api/print-portrait/:token/sheet", (req, res) => {
  cleanupPrintPortraitSessions();
  const token = String(req.params.token || "");
  if (!/^[a-f0-9]{24}$/.test(token)) {
    return res.status(400).send("Token invalide");
  }
  if (!printPortraitSessions.has(token)) {
    return res.status(404).send("Image introuvable ou expiree");
  }
  const imgUrl = `/api/print-portrait/${token}.jpg`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<title> </title>
<style>
@page{margin:0;size:4in 6in portrait;size:portrait}
html,body{width:4in;height:6in;margin:0!important;padding:0!important;overflow:hidden!important;background:#000!important}
body *{display:none!important}
img#print-only{display:block!important;visibility:visible!important;
position:fixed!important;top:0!important;left:0!important;
width:4in!important;height:6in!important;margin:0!important;padding:0!important;border:0!important;
object-fit:fill!important;object-position:center center!important;
page-break-before:avoid;page-break-after:avoid;page-break-inside:avoid;
-webkit-print-color-adjust:exact;print-color-adjust:exact}
@media print{
@page{margin:0;size:4in 6in portrait;size:portrait}
html,body{width:4in!important;height:6in!important;overflow:hidden!important}
img#print-only{top:-0.14in!important;left:-0.14in!important;
width:4.28in!important;height:6.28in!important;object-fit:fill!important}
}
</style>
</head>
<body>
<img id="print-only" src="${imgUrl}" alt="">
<script>
(function(){
  var done=false;
  var delay=450;
  try{if(/iPad|iPhone|iPod/i.test(navigator.userAgent||"")){var m=(navigator.userAgent||"").match(/OS (\\d+)[_.]/);if(m&&parseInt(m[1],10)<=12)delay=950;}}catch(e){}
  function go(){if(done)return;done=true;setTimeout(function(){window.focus();window.print();},delay);}
  window.addEventListener("afterprint",function(){
    setTimeout(function(){
      if(window.opener&&!window.opener.closed){try{window.opener.focus();}catch(e){}window.close();}
    },600);
  });
  var img=document.getElementById("print-only");
  if(img){img.onload=go;if(img.complete&&img.naturalWidth)go();}else go();
  setTimeout(go,delay+2200);
})();
</script>
</body>
</html>`);
});

app.get("/api/print-portrait/:token", (req, res) => {
  cleanupPrintPortraitSessions();
  const token = String(req.params.token || "").replace(/\.jpg$/i, "");
  if (!/^[a-f0-9]{24}$/.test(token)) {
    return res.status(400).send("Token invalide");
  }
  const entry = printPortraitSessions.get(token);
  if (!entry) {
    return res.status(404).send("Image introuvable ou expiree");
  }
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Content-Disposition", 'inline; filename="photobooth-print.jpg"');
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.send(entry.buffer);
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
  const body = `Photo Photobooth/Videobooth connecté — recuperez-la ici (lien valable encore un moment) :\n${pickupUrl}`;

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
const OFFER_LANDING_URL = "https://iahome.fr/photobooth-decouverte.html";

async function sendOfferQrPng(res, medium) {
  const url = OFFER_LANDING_URL;
  const buf = await QRCode.toBuffer(url, {
    type: "png",
    width: 240,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#065f46ff", light: "#ffffffff" },
  });
  res.type("png");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("CDN-Cache-Control", "no-store");
  res.set("Cloudflare-CDN-Cache-Control", "no-store");
  res.send(buf);
}

app.get("/api/offer-qr-decouverte.png", async (req, res) => {
  const medium = OFFER_QR_MEDIA.has(String(req.query.medium || ""))
    ? String(req.query.medium)
    : "pin";
  try {
    await sendOfferQrPng(res, medium);
  } catch (err) {
    res.status(500).type("text").send("QR generation failed");
  }
});

app.get("/api/offer-qr.png", async (req, res) => {
  const medium = OFFER_QR_MEDIA.has(String(req.query.medium || ""))
    ? String(req.query.medium)
    : "pin";
  try {
    await sendOfferQrPng(res, medium);
  } catch (err) {
    res.status(500).type("text").send("QR generation failed");
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, storage: EVENTS_ROOT });
});

ensureStorage();
const server = app.listen(PORT, () => {
  console.log(`Photobooth/Videobooth connecté server running on http://0.0.0.0:${PORT}`);
  console.log(`Storage root: ${EVENTS_ROOT}`);
  if (isBoothPrintConfigured()) {
    console.log("Borne: impression directe (PHOTOBOOTH_BOOTH_PRINT_CMD) — l'iPad n'ouvre plus la fenetre du pilote.");
  }
});
server.requestTimeout = 15 * 60 * 1000;
server.headersTimeout = 16 * 60 * 1000;
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `[Photobooth/Videobooth connecté] Port ${PORT} deja utilise (EADDRINUSE). ` +
        `Arretez l'autre processus, ou lancez avec PHOTOBOOTH_PORT=autre_port (defaut 7885).`
    );
    process.exit(1);
  }
  throw err;
});
