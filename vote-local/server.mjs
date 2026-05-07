import { randomUUID } from "node:crypto";
import express from "express";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.VOTE_PORT || 8765);
const STORE_PATH = path.join(__dirname, "data", "store.json");

const app = express();
app.use(express.json({ limit: "64kb" }));

function ensureDataDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadStore() {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { sessions: {}, votes: [] };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    return {
      sessions: data.sessions || {},
      votes: Array.isArray(data.votes) ? data.votes : [],
    };
  } catch {
    return { sessions: {}, votes: [] };
  }
}

function saveStore(store) {
  ensureDataDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function getLanIPv4s() {
  const nets = os.networkInterfaces();
  const out = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const fam = net.family;
      const v4 = fam === "IPv4" || fam === 4;
      if (v4 && !net.internal) out.push(net.address);
    }
  }
  return sortLanIPv4s([...new Set(out)]);
}

/** Priorise les adresses privées ; 172.16.x utile sur certains LAN / VPN. */
function sortLanIPv4s(ips) {
  const rank = (ip) => {
    if (ip.startsWith("192.168.")) return 0;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return 1;
    if (ip.startsWith("10.")) return 2;
    return 9;
  };
  return [...ips].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

function normalizePublicBase() {
  const raw = process.env.VOTE_PUBLIC_BASE?.trim();
  if (raw && /^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  return null;
}

function normalizeLanIp() {
  const raw = process.env.VOTE_LAN_IP?.trim();
  if (!raw) return null;
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(raw) ? raw : null;
}

/** URLs proposées pour le QR ; peut forcer une IP type 172.16.53.144 via VOTE_LAN_IP. */
function buildSuggestedBases(ips) {
  const auto = ips.map((ip) => `http://${ip}:${PORT}`);
  const pub = normalizePublicBase();
  if (pub) {
    return [pub, ...auto.filter((u) => u !== pub)];
  }
  const forced = normalizeLanIp();
  if (forced) {
    const primary = `http://${forced}:${PORT}`;
    return [primary, ...auto.filter((u) => u !== primary)];
  }
  return auto;
}

function buildVoteUrl(baseUrl, sessionId) {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/vote.html?s=${encodeURIComponent(sessionId)}`;
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/network", (_req, res) => {
  const ips = getLanIPv4s();
  const suggestedBases = buildSuggestedBases(ips);
  res.json({
    port: PORT,
    suggestedBases,
    loopback: `http://127.0.0.1:${PORT}`,
  });
});

app.post("/api/sessions", (req, res) => {
  const { question, options } = req.body || {};
  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "question requise" });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "au moins 2 options (texte)" });
  }
  const cleaned = options
    .map((o) => (typeof o === "string" ? o.trim() : ""))
    .filter(Boolean);
  if (cleaned.length < 2) {
    return res.status(400).json({ error: "au moins 2 options non vides" });
  }

  const store = loadStore();
  const id = randomUUID();
  const session = {
    id,
    question: question.trim(),
    options: cleaned,
    createdAt: new Date().toISOString(),
    closed: false,
  };
  store.sessions[id] = session;
  saveStore(store);
  res.status(201).json(session);
});

app.get("/api/sessions/:id", (req, res) => {
  const store = loadStore();
  const s = store.sessions[req.params.id];
  if (!s) return res.status(404).json({ error: "session introuvable" });
  res.json(s);
});

app.post("/api/sessions/:id/close", (req, res) => {
  const store = loadStore();
  const s = store.sessions[req.params.id];
  if (!s) return res.status(404).json({ error: "session introuvable" });
  s.closed = true;
  saveStore(store);
  res.json(s);
});

app.post("/api/sessions/:id/open", (req, res) => {
  const store = loadStore();
  const s = store.sessions[req.params.id];
  if (!s) return res.status(404).json({ error: "session introuvable" });
  s.closed = false;
  saveStore(store);
  res.json(s);
});

app.post("/api/vote", (req, res) => {
  const body = req.body || {};
  const sessionId = body.sessionId;
  let optionIndex = body.optionIndex;
  const deviceId = body.deviceId;

  if (typeof sessionId !== "string" || !sessionId) {
    return res.status(400).json({ error: "sessionId manquant" });
  }
  if (typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 128) {
    return res.status(400).json({ error: "deviceId invalide" });
  }

  if (typeof optionIndex === "string") {
    optionIndex = parseInt(optionIndex, 10);
  } else if (typeof optionIndex === "number") {
    optionIndex = Math.trunc(optionIndex);
  }
  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    return res.status(400).json({ error: "optionIndex invalide" });
  }

  const store = loadStore();
  const session = store.sessions[sessionId];
  if (!session) return res.status(404).json({ error: "session introuvable" });
  if (session.closed) return res.status(403).json({ error: "vote fermé" });
  if (optionIndex >= session.options.length) {
    return res.status(400).json({ error: "option inexistante" });
  }

  const dup = store.votes.some(
    (v) => v.sessionId === sessionId && v.deviceId === deviceId
  );
  if (dup) {
    return res.status(409).json({ error: "cet appareil a déjà voté" });
  }

  store.votes.push({
    sessionId,
    deviceId,
    optionIndex,
    votedAt: new Date().toISOString(),
  });
  saveStore(store);
  res.status(201).json({ ok: true });
});

app.get("/api/results/:id", (req, res) => {
  const store = loadStore();
  const session = store.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: "session introuvable" });

  const counts = session.options.map(() => 0);
  for (const v of store.votes) {
    if (v.sessionId !== session.id) continue;
    if (v.optionIndex >= 0 && v.optionIndex < counts.length) {
      counts[v.optionIndex] += 1;
    }
  }
  const total = counts.reduce((a, b) => a + b, 0);
  res.json({
    session: {
      id: session.id,
      question: session.question,
      options: session.options,
      closed: !!session.closed,
      createdAt: session.createdAt,
    },
    counts,
    total,
    voters: store.votes.filter((v) => v.sessionId === session.id).length,
  });
});

app.get("/api/qrcode.png", async (req, res) => {
  const sessionId = req.query.session;
  let baseUrl = req.query.base;
  if (typeof sessionId !== "string" || !sessionId) {
    return res.status(400).send("paramètre session requis");
  }
  const store = loadStore();
  if (!store.sessions[sessionId]) {
    return res.status(404).send("session introuvable");
  }
  if (typeof baseUrl !== "string" || !baseUrl.startsWith("http")) {
    const host = req.get("host") || `127.0.0.1:${PORT}`;
    const proto = req.protocol === "https" ? "https" : "http";
    baseUrl = `${proto}://${host}`;
  }
  const url = buildVoteUrl(baseUrl, sessionId);
  try {
    const png = await QRCode.toBuffer(url, {
      type: "png",
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.send(png);
  } catch (e) {
    res.status(500).send(String(e?.message || e));
  }
});

ensureDataDir();
const server = http.createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  const ips = getLanIPv4s();
  const suggested = buildSuggestedBases(ips);
  const primary = suggested[0];
  const lanLine =
    suggested.length > 0
      ? suggested.join(", ")
      : "(aucune URL LAN configurée ou détectée)";
  console.log(`Adresse QR / téléphones — ${primary || `http://127.0.0.1:${PORT}`}`);
  console.log(`Toutes les URLs LAN — ${lanLine}`);
  console.log(`Ce PC seulement — http://127.0.0.1:${PORT}/admin.html`);
  console.log(`Stockage: ${STORE_PATH}`);
});
