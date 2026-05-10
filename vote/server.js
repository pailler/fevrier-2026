const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");
const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

const PORT = Number(process.env.VOTE_PORT || process.env.PORT || 7890);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicBase = String(process.env.VOTE_PUBLIC_BASE_URL || "").replace(/\/$/, "");

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket },
});

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

function buildPublicVoteUrl(req, slug) {
  if (publicBase) {
    return `${publicBase}/vote.html?slug=${encodeURIComponent(slug)}`;
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${proto}://${host}/vote.html?slug=${encodeURIComponent(slug)}`;
}

async function generateUniquePin() {
  for (let i = 0; i < 80; i += 1) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const { data, error } = await supabase.from("vote_polls").select("id").eq("pin", pin).maybeSingle();
    if (error) throw error;
    if (!data) return pin;
  }
  throw new Error("Impossible de générer un PIN unique.");
}

async function generateUniqueSlug() {
  for (let i = 0; i < 80; i += 1) {
    const slug = crypto.randomBytes(9).toString("base64url").replace(/=/g, "");
    const { data, error } = await supabase.from("vote_polls").select("id").eq("public_slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return slug;
  }
  throw new Error("Impossible de générer un lien public unique.");
}

app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, filePath) {
      if (/\.html$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }
    },
  })
);

app.get("/health", (req, res) => {
  res.type("text").send("ok");
});

app.post("/api/polls", async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const rawOpts = Array.isArray(req.body?.options) ? req.body.options : [];
    const options = rawOpts.map((o) => String(o).trim()).filter(Boolean);

    if (title.length < 2) {
      return res.status(400).json({ error: "Titre trop court." });
    }
    if (options.length < 2) {
      return res.status(400).json({ error: "Au moins 2 participants requis." });
    }

    const pin = await generateUniquePin();
    const public_slug = await generateUniqueSlug();

    const { data: poll, error: e1 } = await supabase
      .from("vote_polls")
      .insert({ title, pin, public_slug })
      .select()
      .single();
    if (e1) return res.status(500).json({ error: e1.message });

    const rows = options.map((label, sort_order) => ({ poll_id: poll.id, label, sort_order }));
    const { error: e2 } = await supabase.from("vote_options").insert(rows);
    if (e2) {
      await supabase.from("vote_polls").delete().eq("id", poll.id);
      return res.status(500).json({ error: e2.message });
    }

    const voteUrl = buildPublicVoteUrl(req, public_slug);
    return res.status(201).json({ poll: { ...poll, voteUrl } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/api/polls/by-pin/:pin", async (req, res) => {
  const pin = String(req.params.pin || "");
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "PIN invalide." });
  }

  const { data: poll, error } = await supabase.from("vote_polls").select("*").eq("pin", pin).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!poll) return res.status(404).json({ error: "Scrutin introuvable." });

  const { data: options, error: oErr } = await supabase
    .from("vote_options")
    .select("*")
    .eq("poll_id", poll.id)
    .order("sort_order");
  if (oErr) return res.status(500).json({ error: oErr.message });

  const { data: votes, error: vErr } = await supabase.from("vote_votes").select("option_id").eq("poll_id", poll.id);
  if (vErr) return res.status(500).json({ error: vErr.message });

  const counts = {};
  for (const o of options || []) counts[o.id] = 0;
  for (const v of votes || []) {
    counts[v.option_id] = (counts[v.option_id] || 0) + 1;
  }

  const voteUrl = buildPublicVoteUrl(req, poll.public_slug);
  return res.json({
    poll,
    options: (options || []).map((o) => ({ ...o, votes: counts[o.id] || 0 })),
    voteUrl,
  });
});

app.get("/api/public/:slug", async (req, res) => {
  const slug = String(req.params.slug || "");
  if (slug.length < 4) {
    return res.status(400).json({ error: "Lien invalide." });
  }

  const { data: poll, error } = await supabase
    .from("vote_polls")
    .select("id,title,public_slug")
    .eq("public_slug", slug)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!poll) return res.status(404).json({ error: "Vote introuvable." });

  const { data: options, error: oErr } = await supabase
    .from("vote_options")
    .select("id,label,sort_order")
    .eq("poll_id", poll.id)
    .order("sort_order");
  if (oErr) return res.status(500).json({ error: oErr.message });

  return res.json({ poll: { title: poll.title }, options: options || [] });
});

app.post("/api/public/:slug/vote", async (req, res) => {
  const slug = String(req.params.slug || "");
  const optionId = String(req.body?.optionId || "");
  const clientId = String(req.body?.clientId || "").trim();

  if (slug.length < 4) {
    return res.status(400).json({ error: "Lien invalide." });
  }
  if (!optionId || clientId.length < 8 || clientId.length > 128) {
    return res.status(400).json({ error: "Données invalides." });
  }

  const { data: poll, error } = await supabase.from("vote_polls").select("id").eq("public_slug", slug).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!poll) return res.status(404).json({ error: "Vote introuvable." });

  const { data: opt, error: optErr } = await supabase
    .from("vote_options")
    .select("id")
    .eq("id", optionId)
    .eq("poll_id", poll.id)
    .maybeSingle();
  if (optErr) return res.status(500).json({ error: optErr.message });
  if (!opt) return res.status(400).json({ error: "Choix invalide." });

  const { error: insErr } = await supabase.from("vote_votes").insert({
    poll_id: poll.id,
    option_id: optionId,
    client_id: clientId,
  });

  if (insErr) {
    if (insErr.code === "23505") {
      return res.status(409).json({ error: "Vous avez déjà voté sur cet appareil." });
    }
    return res.status(500).json({ error: insErr.message });
  }
  return res.status(201).json({ ok: true });
});

app.get("/api/public/:slug/results", async (req, res) => {
  const slug = String(req.params.slug || "");
  const { data: poll, error } = await supabase.from("vote_polls").select("id,title").eq("public_slug", slug).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!poll) return res.status(404).json({ error: "Vote introuvable." });

  const { data: options, error: oErr } = await supabase
    .from("vote_options")
    .select("*")
    .eq("poll_id", poll.id)
    .order("sort_order");
  if (oErr) return res.status(500).json({ error: oErr.message });

  const { data: votes, error: vErr } = await supabase.from("vote_votes").select("option_id").eq("poll_id", poll.id);
  if (vErr) return res.status(500).json({ error: vErr.message });

  const counts = {};
  for (const o of options || []) counts[o.id] = 0;
  for (const v of votes || []) {
    counts[v.option_id] = (counts[v.option_id] || 0) + 1;
  }

  return res.json({
    title: poll.title,
    results: (options || []).map((o) => ({ label: o.label, optionId: o.id, votes: counts[o.id] || 0 })),
    total: (votes || []).length,
  });
});

app.get("/api/qr.png", async (req, res) => {
  const url = String(req.query.url || "");
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).send("bad url");
  }
  try {
    const png = await QRCode.toBuffer(url, { type: "png", width: 320, margin: 2 });
    res.type("png").send(png);
  } catch (e) {
    res.status(500).send("qr fail");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vote (NODE_ENV=${process.env.NODE_ENV || "development"}) écoute sur le port ${PORT}`);
});
