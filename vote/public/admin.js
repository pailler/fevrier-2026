const pinPanel = document.getElementById("pinPanel");
const pinInput = document.getElementById("pin");
const pinErr = document.getElementById("pinErr");
const btnLoad = document.getElementById("btnLoad");
const titleInput = document.getElementById("title");
const optsInput = document.getElementById("opts");
const createErr = document.getElementById("createErr");
const btnCreate = document.getElementById("btnCreate");
const dashPanel = document.getElementById("dashPanel");
const dashTitle = document.getElementById("dashTitle");
const dashPin = document.getElementById("dashPin");
const voteUrlEl = document.getElementById("voteUrl");
const resultsUrlEl = document.getElementById("resultsUrl");
const qrImg = document.getElementById("qr");
const resultsBlock = document.getElementById("resultsBlock");
const btnRefresh = document.getElementById("btnRefresh");
const copyVote = document.getElementById("copyVote");
const copyResults = document.getElementById("copyResults");

let activePin = "";

function showErr(el, msg) {
  if (!msg) {
    el.classList.add("hidden");
    el.textContent = "";
    return;
  }
  el.textContent = msg;
  el.classList.remove("hidden");
}

async function loadByPin(pin) {
  const res = await fetch(`/api/polls/by-pin/${encodeURIComponent(pin)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur chargement");
  return data;
}

function renderResults(options, total) {
  let max = 1;
  for (const o of options) max = Math.max(max, o.votes || 0);
  resultsBlock.innerHTML = "";
  const t = document.createElement("p");
  t.className = "sub";
  t.textContent = `Total des bulletins : ${total}`;
  resultsBlock.appendChild(t);
  for (const o of options) {
    const v = o.votes || 0;
    const pct = total ? Math.round((v / total) * 100) : 0;
    const w = max ? Math.round((v / max) * 100) : 0;
    const div = document.createElement("div");
    div.className = "results-bar";
    div.innerHTML = `<div class="label">${escapeHtml(o.label)} — ${v} (${pct}%)</div>
      <div class="bar"><i style="width:${w}%"></i></div>`;
    resultsBlock.appendChild(div);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function refreshDash() {
  if (!activePin) return;
  try {
    const data = await loadByPin(activePin);
    const total = data.options.reduce((a, o) => a + (o.votes || 0), 0);
    renderResults(data.options, total);
    voteUrlEl.textContent = data.voteUrl;
    const ru = new URL("/results.html", window.location.origin);
    ru.searchParams.set("slug", data.poll.public_slug);
    resultsUrlEl.textContent = ru.toString();
    qrImg.src = `/api/qr.png?url=${encodeURIComponent(data.voteUrl)}`;
    qrImg.classList.remove("hidden");
  } catch (e) {
    showErr(pinErr, String(e.message || e));
  }
}

btnLoad.addEventListener("click", async () => {
  showErr(pinErr, "");
  const pin = String(pinInput.value || "").trim();
  if (!/^\d{4}$/.test(pin)) {
    showErr(pinErr, "Saisissez un PIN à 4 chiffres.");
    return;
  }
  btnLoad.disabled = true;
  try {
    const data = await loadByPin(pin);
    activePin = pin;
    dashTitle.textContent = data.poll.title;
    dashPin.textContent = `PIN : ${data.poll.pin}`;
    voteUrlEl.textContent = data.voteUrl;
    const ru = new URL("/results.html", window.location.origin);
    ru.searchParams.set("slug", data.poll.public_slug);
    resultsUrlEl.textContent = ru.toString();
    qrImg.src = `/api/qr.png?url=${encodeURIComponent(data.voteUrl)}`;
    qrImg.classList.remove("hidden");
    const total = data.options.reduce((a, o) => a + (o.votes || 0), 0);
    renderResults(data.options, total);
    dashPanel.classList.remove("hidden");
  } catch (e) {
    showErr(pinErr, String(e.message || e));
  } finally {
    btnLoad.disabled = false;
  }
});

btnCreate.addEventListener("click", async () => {
  showErr(createErr, "");
  const title = String(titleInput.value || "").trim();
  const lines = String(optsInput.value || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (title.length < 2) {
    showErr(createErr, "Nom du vote trop court.");
    return;
  }
  if (lines.length < 2) {
    showErr(createErr, "Au moins deux lignes (participants).");
    return;
  }
  btnCreate.disabled = true;
  try {
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, options: lines }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Création impossible");
    pinInput.value = data.poll.pin;
    activePin = data.poll.pin;
    dashTitle.textContent = data.poll.title;
    dashPin.textContent = `PIN : ${data.poll.pin}`;
    voteUrlEl.textContent = data.voteUrl;
    const ru = new URL("/results.html", window.location.origin);
    ru.searchParams.set("slug", data.poll.public_slug);
    resultsUrlEl.textContent = ru.toString();
    qrImg.src = `/api/qr.png?url=${encodeURIComponent(data.voteUrl)}`;
    qrImg.classList.remove("hidden");
    await refreshDash();
    dashPanel.classList.remove("hidden");
    titleInput.value = "";
    optsInput.value = "";
  } catch (e) {
    showErr(createErr, String(e.message || e));
  } finally {
    btnCreate.disabled = false;
  }
});

btnRefresh.addEventListener("click", refreshDash);

async function copyText(txt) {
  try {
    await navigator.clipboard.writeText(txt);
  } catch {
    window.prompt("Copier :", txt);
  }
}

copyVote.addEventListener("click", () => copyText(voteUrlEl.textContent));
copyResults.addEventListener("click", () => copyText(resultsUrlEl.textContent));

setInterval(() => {
  if (!dashPanel.classList.contains("hidden") && activePin) refreshDash();
}, 4000);
