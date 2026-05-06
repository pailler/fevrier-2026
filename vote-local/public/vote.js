const DEVICE_KEY = "vote_local_device_id";

function $(id) {
  return document.getElementById(id);
}

function params() {
  return new URLSearchParams(window.location.search);
}

function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id || id.length < 8) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function show(which) {
  ["panel", "done", "closed", "bad"].forEach((k) => {
    $(k).classList.add("hidden");
  });
  $(which).classList.remove("hidden");
}

async function main() {
  const sessionId = params().get("s");
  if (!sessionId) {
    $("hint").textContent = "Ouvrez cette page via le QR code de la manche.";
    show("bad");
    return;
  }

  const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    $("hint").textContent = "Session introuvable.";
    show("bad");
    return;
  }

  const session = await res.json();
  $("hint").textContent = "Une réponse par appareil.";
  $("question").textContent = session.question;

  if (session.closed) {
    show("closed");
    return;
  }

  const choices = $("choices");
  choices.innerHTML = "";
  session.options.forEach((label, i) => {
    const id = `opt_${i}`;
    const lab = document.createElement("label");
    lab.innerHTML = `<input type="radio" name="opt" value="${i}" id="${id}" /> <span>${escapeHtml(
      label
    )}</span>`;
    choices.appendChild(lab);
  });

  show("panel");

  $("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("voteErr").hidden = true;
    const picked = choices.querySelector('input[name="opt"]:checked');
    if (!picked) {
      $("voteErr").textContent = "Choisissez une option.";
      $("voteErr").hidden = false;
      return;
    }
    const optionIndex = parseInt(picked.value, 10);
    const deviceId = getOrCreateDeviceId();
    const vr = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, optionIndex, deviceId }),
    });
    const data = await vr.json().catch(() => ({}));
    if (vr.status === 409) {
      $("doneMsg").textContent =
        "Ce navigateur ou cet appareil a déjà voté pour cette manche.";
      show("done");
      return;
    }
    if (!vr.ok) {
      $("voteErr").textContent = data.error || "Impossible d’enregistrer le vote.";
      $("voteErr").hidden = false;
      return;
    }
    $("doneMsg").textContent =
      "Merci, votre vote a bien été enregistré pour cet appareil.";
    show("done");
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main();
