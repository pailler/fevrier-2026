const hint = document.getElementById("hint");
const bad = document.getElementById("bad");
const formPanel = document.getElementById("formPanel");
const qTitle = document.getElementById("qTitle");
const optionsEl = document.getElementById("options");
const voteErr = document.getElementById("voteErr");
const btnSend = document.getElementById("btnSend");
const donePanel = document.getElementById("donePanel");

function params() {
  return new URLSearchParams(window.location.search);
}

function randomDeviceId() {
  try {
    if (crypto.randomUUID) return crypto.randomUUID();
  } catch (_) {}
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function getOrCreateDeviceId() {
  const key = "iahome_vote_client";
  let id = "";
  try {
    id = localStorage.getItem(key) || "";
  } catch (_) {}
  if (!id || id.length < 8) {
    id = randomDeviceId();
    try {
      localStorage.setItem(key, id);
    } catch (_) {}
  }
  return id;
}

function showVoteErr(msg) {
  if (!msg) {
    voteErr.classList.add("hidden");
    voteErr.textContent = "";
    return;
  }
  voteErr.textContent = msg;
  voteErr.classList.remove("hidden");
}

async function load() {
  const slug = params().get("slug") || "";
  if (slug.length < 4) {
    hint.textContent = "";
    bad.classList.remove("hidden");
    return;
  }

  const res = await fetch(`/api/public/${encodeURIComponent(slug)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    hint.textContent = "";
    bad.classList.remove("hidden");
    return;
  }

  hint.textContent = "Choisissez une option puis validez.";
  qTitle.textContent = data.poll.title;
  optionsEl.innerHTML = "";
  for (const o of data.options || []) {
    const id = `opt_${o.id}`;
    const lab = document.createElement("label");
    lab.className = "opt";
    lab.innerHTML = `<input type="radio" name="vote" value="${o.id}" id="${id}" /> ${escapeHtml(o.label)}`;
    optionsEl.appendChild(lab);
  }
  formPanel.classList.remove("hidden");

  btnSend.addEventListener("click", async () => {
    showVoteErr("");
    const picked = optionsEl.querySelector('input[name="vote"]:checked');
    if (!picked) {
      showVoteErr("Sélectionnez une option.");
      return;
    }
    btnSend.disabled = true;
    const prev = btnSend.textContent;
    btnSend.textContent = "Envoi…";
    const clientId = getOrCreateDeviceId();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(`/api/public/${encodeURIComponent(slug)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: picked.value, clientId }),
        signal: ctrl.signal,
      });
      const body = await r.json().catch(() => ({}));
      if (r.status === 409) {
        showVoteErr(body.error || "Déjà voté.");
        btnSend.disabled = false;
        btnSend.textContent = prev;
        return;
      }
      if (!r.ok) {
        showVoteErr(body.error || "Erreur réseau.");
        btnSend.disabled = false;
        btnSend.textContent = prev;
        return;
      }
      formPanel.classList.add("hidden");
      donePanel.classList.remove("hidden");
    } catch (e) {
      showVoteErr(e.name === "AbortError" ? "Délai dépassé, réessayez." : "Erreur réseau.");
      btnSend.disabled = false;
      btnSend.textContent = prev;
    } finally {
      clearTimeout(t);
    }
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

load();
