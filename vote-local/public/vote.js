const DEVICE_KEY = "vote_local_device_id";

function $(id) {
  return document.getElementById(id);
}

function params() {
  return new URLSearchParams(window.location.search);
}

/** UUID sans dépendre uniquement de crypto.randomUUID (HTTP / anciens navigateurs). */
function randomDeviceId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback */
  }
  const t = Date.now().toString(36);
  const r = () => Math.random().toString(36).slice(2, 10);
  return `v_${t}_${r()}${r()}`.slice(0, 128);
}

function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id || id.length < 8) {
      id = randomDeviceId();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return randomDeviceId();
  }
}

function show(which) {
  ["panel", "done", "closed", "bad"].forEach((k) => {
    $(k).classList.add("hidden");
  });
  $(which).classList.remove("hidden");
}

function showVoteErr(msg) {
  const el = $("voteErr");
  el.textContent = msg;
  el.hidden = false;
  try {
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  } catch {
    /* ignore */
  }
}

async function main() {
  const sessionId = params().get("s");
  if (!sessionId) {
    $("hint").textContent = "Ouvrez cette page via le QR code de la manche.";
    show("bad");
    return;
  }

  const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`).catch(() => null);
  if (!res || !res.ok) {
    $("hint").textContent = "Session introuvable ou serveur injoignable.";
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
      showVoteErr("Choisissez une option.");
      return;
    }

    const optionIndex = parseInt(String(picked.value), 10);
    if (!Number.isFinite(optionIndex) || optionIndex < 0) {
      showVoteErr("Option invalide. Réessayez.");
      return;
    }

    const btn = $("submitBtn");
    const prevLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Envoi…";

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);

    try {
      let deviceId;
      try {
        deviceId = getOrCreateDeviceId();
      } catch (err) {
        showVoteErr("Impossible d’identifier cet appareil (stockage bloqué ?).");
        return;
      }

      if (!deviceId || String(deviceId).length < 8) {
        showVoteErr("Identifiant appareil invalide.");
        return;
      }

      const vr = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, optionIndex, deviceId }),
        signal: ctrl.signal,
      });

      const data = await vr.json().catch(() => ({}));

      if (vr.status === 409) {
        $("doneMsg").textContent =
          "Ce navigateur ou cet appareil a déjà voté pour cette manche.";
        show("done");
        return;
      }
      if (!vr.ok) {
        showVoteErr(data.error || `Erreur serveur (${vr.status}). Réessayez.`);
        return;
      }

      $("doneMsg").textContent =
        "Merci, votre vote a bien été enregistré pour cet appareil.";
      show("done");
    } catch (err) {
      const aborted = err && err.name === "AbortError";
      showVoteErr(
        aborted
          ? "Délai dépassé : vérifiez le Wi‑Fi et que le serveur tourne toujours."
          : "Connexion impossible. Vérifiez le réseau local."
      );
    } finally {
      clearTimeout(timer);
      btn.disabled = false;
      btn.textContent = prevLabel;
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

main().catch(() => {
  $("hint").textContent = "Erreur de chargement de la page.";
  show("bad");
});
