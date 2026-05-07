"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { createClient } = require("@supabase/supabase-js");

const PORT = Number(process.env.VOTE_PORT || 7890);
const PUBLIC_BASE = (process.env.VOTE_PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[vote] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant — les routes API echoueront."
  );
}

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "256kb" }));

function sb() {
  if (!supabase) {
    const err = new Error("Supabase non configure sur ce serveur");
    err.status = 503;
    throw err;
  }
  return supabase;
}

function buildPublicVoteUrl(req, slug) {
  if (PUBLIC_BASE) {
    return `${PUBLIC_BASE}/vote.html?slug=${encodeURIComponent(slug)}`;
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host") || `localhost:${PORT}`;
  return `${proto}://${host}/vote.html?slug=${encodeURIComponent(slug)}`;
}

async function generateUniquePin() {
  const client = sb();
  for (let i = 0; i < 80; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const { data, error } = await client
      .from("vote_polls")
      .select("id")
      .eq("pin", pin)
      .maybeSingle();
    if (error) throw error;
    if (!data) return pin;
  }
  throw new Error("Impossible de generer un PIN unique");
}

async function generateUniqueSlug() {
  const client = sb();
  for (let i = 0; i < 80; i++) {
    const slug = crypto.randomBytes(12).toString("base64url").slice(0, 16);
    const { data, error } = await client
      .from("vote_polls")
      .select("id")
      .eq("public_slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return slug;
  }
  throw new Error("Impossible de generer un lien public");
}

async function loadPollByPin(pin) {
  const client = sb();
  const { data: poll, error: pe } = await client
    .from("vote_polls")
    .select("id,title,pin,public_slug,created_at")
    .eq("pin", pin)
    .maybeSingle();
  if (pe) throw pe;
  return poll;
}

async function loadPollBySlug(slug) {
  const client = sb();
  const { data: poll, error: pe } = await client
    .from("vote_polls")
    .select("id,title,public_slug")
    .eq("public_slug", slug)
    .maybeSingle();
  if (pe) throw pe;
  return poll;
}

async function loadOptions(pollId) {
  const client = sb();
  const { data, error } = await client
    .from("vote_options")
    .select("id,label,sort_order")
    .eq("poll_id", pollId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

async function countVotesByOption(pollId) {
  const client = sb();
  const { data: votes, error } = await client
    .from("vote_votes")
    .select("option_id")
    .eq("poll_id", pollId);
  if (error) throw error;
  const counts = {};
  for (const row of votes || []) {
    counts[row.option_id] = (counts[row.option_id] || 0) + 1;
  }
  return counts;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vote" });
});

app.post("/api/polls", async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const participants = req.body?.participants;
    if (title.length < 2) {
      return res.status(400).json({ error: "Nom du vote trop court." });
    }
    if (!Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ error: "Au moins deux participants." });
    }
    const labels = participants
      .map((p) => String(p || "").trim())
      .filter(Boolean);
    if (labels.length < 2) {
      return res.status(400).json({ error: "Au moins deux participants valides." });
    }

    const pin = await generateUniquePin();
    const slug = await generateUniqueSlug();
    const client = sb();

    const { data: poll, error: insertPollErr } = await client
      .from("vote_polls")
      .insert({ title, pin, public_slug: slug })
      .select("id,title,pin,public_slug,created_at")
      .single();
    if (insertPollErr) throw insertPollErr;

    const rows = labels.map((label, idx) => ({
      poll_id: poll.id,
      label,
      sort_order: idx,
    }));
    const { error: optErr } = await client.from("vote_options").insert(rows);
    if (optErr) throw optErr;

    return res.status(201).json({ poll });
  } catch (e) {
    console.error(e);
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "Erreur serveur" });
  }
});

app.post("/api/admin/session", async (req, res) => {
  try {
    const pin = String(req.body?.pin || "").trim();
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: "PIN invalide (4 chiffres)." });
    }
    const poll = await loadPollByPin(pin);
    if (!poll) return res.status(404).json({ error: "Vote introuvable." });

    const options = await loadOptions(poll.id);
    const counts = await countVotesByOption(poll.id);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return res.json({
      poll,
      options: options.map((o) => ({
        ...o,
        votes: counts[o.id] || 0,
      })),
      totalVotes: total,
    });
  } catch (e) {
    console.error(e);
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "Erreur serveur" });
  }
});

app.get("/api/public/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ error: "Lien invalide." });
    const poll = await loadPollBySlug(slug);
    if (!poll) return res.status(404).json({ error: "Vote introuvable." });
    const options = await loadOptions(poll.id);
    return res.json({
      poll: { id: poll.id, title: poll.title },
      options: options.map((o) => ({ id: o.id, label: o.label })),
    });
  } catch (e) {
    console.error(e);
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "Erreur serveur" });
  }
});

app.post("/api/public/:slug/vote", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const optionId = String(req.body?.optionId || "").trim();
    const clientId = String(req.body?.clientId || "").trim();

    if (!slug) return res.status(400).json({ error: "Lien invalide." });
    if (!optionId) return res.status(400).json({ error: "Choix manquant." });
    if (!clientId || clientId.length < 8 || clientId.length > 128) {
      return res.status(400).json({ error: "Identifiant appareil invalide." });
    }

    const poll = await loadPollBySlug(slug);
    if (!poll) return res.status(404).json({ error: "Vote introuvable." });

    const options = await loadOptions(poll.id);
    const okOpt = options.some((o) => o.id === optionId);
    if (!okOpt) return res.status(400).json({ error: "Choix invalide." });

    const client = sb();
    const { error: insErr } = await client.from("vote_votes").insert({
      poll_id: poll.id,
      option_id: optionId,
      client_id: clientId,
    });

    if (insErr) {
      if (insErr.code === "23505") {
        return res.status(409).json({ error: "Vous avez deja vote avec cet appareil." });
      }
      throw insErr;
    }

    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "Erreur serveur" });
  }
});

app.get("/api/admin/qrcode.png", async (req, res) => {
  try {
    const pin = String(req.query.pin || "").trim();
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).send("PIN invalide");
    }
    const poll = await loadPollByPin(pin);
    if (!poll) return res.status(404).send("Introuvable");

    const url = buildPublicVoteUrl(req, poll.public_slug);
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
    console.error(e);
    res.status(500).send(String(e.message));
  }
});

app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, filePath) {
      if (/\.html$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store");
      }
    },
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[vote] ecoute sur le port ${PORT}`);
  if (PUBLIC_BASE) {
    console.log(`[vote] URL publique QR: ${PUBLIC_BASE}`);
  }
});
