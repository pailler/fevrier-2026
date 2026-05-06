const STORAGE_KEY = "vote_local_admin_session";

function $(id) {
  return document.getElementById(id);
}

function getSessionIdFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const s = p.get("s") || p.get("session");
  return s && s.trim().length >= 8 ? s.trim() : null;
}

function getActiveSessionId() {
  return getSessionIdFromUrl() || sessionStorage.getItem(STORAGE_KEY);
}

function rememberSession(id) {
  sessionStorage.setItem(STORAGE_KEY, id);
  const url = new URL(window.location.href);
  url.searchParams.set("s", id);
  history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function getSelectedBase() {
  const custom = $("baseCustom").value.trim();
  if (custom.startsWith("http")) return custom.replace(/\/+$/, "");
  const pick = $("basePick").value;
  return pick || `${window.location.origin}`;
}

async function fetchNetwork() {
  const sel = $("basePick");
  sel.innerHTML = "";
  try {
    const r = await fetch("/api/network");
    const j = await r.json();
    const bases = [j.loopback, ...(j.suggestedBases || [])];
    bases.forEach((b, i) => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = i === 0 ? `${b} (cette machine)` : b;
      sel.appendChild(opt);
    });
    const preferred =
      (j.suggestedBases && j.suggestedBases[0]) || j.loopback || window.location.origin;
    sel.value = preferred;
  } catch {
    sel.innerHTML = `<option value="${window.location.origin}">${window.location.origin}</option>`;
  }
}

function updateQr(sessionId) {
  const base = getSelectedBase();
  const voteUrl = `${base}/vote.html?s=${encodeURIComponent(sessionId)}`;
  $("voteUrl").textContent = voteUrl;
  $("resultsUrl").textContent = `${base}/results.html?s=${encodeURIComponent(sessionId)}`;
  const encBase = encodeURIComponent(base);
  $("qr").src = `/api/qrcode.png?session=${encodeURIComponent(sessionId)}&base=${encBase}&t=${Date.now()}`;
}

async function createSession() {
  $("createErr").hidden = true;
  const question = $("question").value.trim();
  const raw = $("options").value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, options: raw }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    $("createErr").textContent = data.error || "Erreur création";
    $("createErr").hidden = false;
    return;
  }
  rememberSession(data.id);
  showSession(data);
}

function showSession(s) {
  $("sessionPanel").classList.remove("hidden");
  $("sessQuestion").textContent = s.question;
  const ul = $("sessOptions");
  ul.innerHTML = "";
  s.options.forEach((o) => {
    const li = document.createElement("li");
    li.textContent = o;
    ul.appendChild(li);
  });
  $("toggleClose").textContent = s.closed ? "Rouvrir les votes" : "Fermer les votes";
  updateQr(s.id);
  refreshResults();
}

async function loadStoredSession() {
  const fromUrl = getSessionIdFromUrl();
  const id = fromUrl || sessionStorage.getItem(STORAGE_KEY);
  if (!id) return;
  sessionStorage.setItem(STORAGE_KEY, id);
  const res = await fetch(`/api/sessions/${encodeURIComponent(id)}`);
  if (!res.ok) {
    sessionStorage.removeItem(STORAGE_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete("s");
    url.searchParams.delete("session");
    history.replaceState({}, "", `${url.pathname}${url.search}`);
    return;
  }
  const s = await res.json();
  showSession(s);
}

async function toggleClose() {
  const id = getActiveSessionId();
  if (!id) return;
  const s = await (await fetch(`/api/sessions/${encodeURIComponent(id)}`)).json();
  const path = s.closed ? "open" : "close";
  const res = await fetch(`/api/sessions/${encodeURIComponent(id)}/${path}`, {
    method: "POST",
  });
  if (!res.ok) return;
  const next = await res.json();
  $("toggleClose").textContent = next.closed ? "Rouvrir les votes" : "Fermer les votes";
}

async function refreshResults() {
  const id = getActiveSessionId();
  if (!id) return;
  const res = await fetch(`/api/results/${encodeURIComponent(id)}`);
  if (!res.ok) return;
  const data = await res.json();
  const host = $("results");
  host.innerHTML = "";
  const max = Math.max(1, ...data.counts);
  data.session.options.forEach((label, i) => {
    const n = data.counts[i] || 0;
    const pct = Math.round((n / max) * 100);
    const line = document.createElement("div");
    line.className = "barline";
    line.innerHTML = `
      <div class="barlabel"><span>${escapeHtml(label)}</span><span>${n}</span></div>
      <div class="bartrack"><div class="barfill" style="width:${pct}%"></div></div>`;
    host.appendChild(line);
  });
  const t = document.createElement("p");
  t.className = "total";
  t.textContent = `Total : ${data.total} vote(s) — ${data.voters} appareil(s)`;
  host.appendChild(t);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

$("create").addEventListener("click", createSession);
$("basePick").addEventListener("change", () => {
  const id = getActiveSessionId();
  if (id) updateQr(id);
});
$("baseCustom").addEventListener("input", () => {
  const id = getActiveSessionId();
  if (id) updateQr(id);
});
$("copyUrl").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("voteUrl").textContent);
  } catch {
    /* ignore */
  }
});
$("copyResultsUrl").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("resultsUrl").textContent);
  } catch {
    /* ignore */
  }
});
$("toggleClose").addEventListener("click", toggleClose);
$("refreshResults").addEventListener("click", refreshResults);

fetchNetwork().then(loadStoredSession);
