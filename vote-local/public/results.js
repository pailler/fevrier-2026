function $(id) {
  return document.getElementById(id);
}

function params() {
  return new URLSearchParams(window.location.search);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(data) {
  $("question").textContent = data.session.question;
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
  const sum = document.createElement("p");
  sum.className = "total";
  sum.textContent = `Total : ${data.total} vote(s) — ${data.voters} appareil(s)`;
  host.appendChild(sum);
  $("updated").textContent = `Dernière mise à jour : ${new Date().toLocaleTimeString("fr-FR")}`;
}

async function fetchOnce(sessionId) {
  const res = await fetch(`/api/results/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error("fetch");
  return res.json();
}

async function main() {
  const sessionId = params().get("s") || params().get("session");
  if (!sessionId) {
    $("hint").textContent = "Paramètre manquant.";
    $("bad").classList.remove("hidden");
    return;
  }

  $("hint").textContent = "Mise à jour automatique toutes les 2 secondes.";

  const tick = async () => {
    try {
      const data = await fetchOnce(sessionId);
      render(data);
      $("panel").classList.remove("hidden");
      $("bad").classList.add("hidden");
    } catch {
      $("hint").textContent = "Impossible de joindre le serveur. Vérifiez le Wi‑Fi et l’URL.";
      $("bad").classList.remove("hidden");
    }
  };

  await tick();
  setInterval(tick, 2000);
}

main();
