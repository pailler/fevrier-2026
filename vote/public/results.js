const hint = document.getElementById("hint");
const panel = document.getElementById("panel");
const bad = document.getElementById("bad");
const titleEl = document.getElementById("title");
const resultsEl = document.getElementById("results");
const updatedEl = document.getElementById("updated");

function slugFromUrl() {
  return new URLSearchParams(window.location.search).get("slug") || "";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function tick() {
  const slug = slugFromUrl();
  if (slug.length < 4) {
    hint.textContent = "";
    bad.classList.remove("hidden");
    return;
  }

  const res = await fetch(`/api/public/${encodeURIComponent(slug)}/results`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    hint.textContent = "";
    bad.classList.remove("hidden");
    return;
  }

  hint.textContent = "Mise à jour automatique.";
  bad.classList.add("hidden");
  panel.classList.remove("hidden");
  titleEl.textContent = data.title;

  let max = 1;
  for (const r of data.results || []) max = Math.max(max, r.votes || 0);
  const total = data.total || 0;

  resultsEl.innerHTML = "";
  for (const r of data.results || []) {
    const v = r.votes || 0;
    const pct = total ? Math.round((v / total) * 100) : 0;
    const w = max ? Math.round((v / max) * 100) : 0;
    const div = document.createElement("div");
    div.className = "results-bar";
    div.innerHTML = `<div class="label">${escapeHtml(r.label)} — ${v} (${pct}%)</div>
      <div class="bar"><i style="width:${w}%"></i></div>`;
    resultsEl.appendChild(div);
  }
  updatedEl.textContent = `Total : ${total} — ${new Date().toLocaleTimeString("fr-FR")}`;
}

tick();
setInterval(tick, 2500);
