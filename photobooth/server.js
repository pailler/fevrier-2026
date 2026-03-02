const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");

const app = express();
const PORT = Number(process.env.PHOTOBOOTH_PORT || 7885);

// Trust reverse proxy headers (nginx, Traefik) for X-Forwarded-Proto, Host
app.set("trust proxy", 1);
const STORAGE_ROOT = path.join(__dirname, "storage");
const EVENTS_ROOT = path.join(STORAGE_ROOT, "events");
const INDEX_FILE = path.join(STORAGE_ROOT, "events-index.json");

app.use(express.json({ limit: "30mb" }));

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

function buildBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

app.use("/storage", express.static(STORAGE_ROOT));
app.use(express.static(__dirname));

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
    .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
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

  const indexData = readIndex();
  const event = indexData.events.find((item) => item.id === eventId);
  if (!event) return res.status(404).json({ error: "Evenement introuvable." });

  const match = imageDataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "Format image invalide." });
  }

  const extByMime = { png: "png", jpeg: "jpg", jpg: "jpg", webp: "webp" };
  const ext = extByMime[match[1]] || "png";
  const base64Payload = match[2];
  const buffer = Buffer.from(base64Payload, "base64");
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  fs.mkdirSync(photosDir(eventId), { recursive: true });
  fs.writeFileSync(path.join(photosDir(eventId), filename), buffer);

  return res.status(201).json({
    photo: {
      id: path.parse(filename).name,
      filename,
      createdAt: new Date().toISOString(),
      url: `/storage/events/${eventId}/photos/${filename}`,
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

app.get("/health", (_req, res) => {
  res.json({ ok: true, storage: EVENTS_ROOT });
});

ensureStorage();
app.listen(PORT, () => {
  console.log(`Photobooth server running on http://0.0.0.0:${PORT}`);
  console.log(`Storage root: ${EVENTS_ROOT}`);
});
