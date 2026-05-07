(function () {
  const $ = (id) => document.getElementById(id);

  const CLIENT_KEY = "vote_iahome_client_id";

  function randomId() {
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch {
      /* noop */
    }
    return "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
  }

  function getClientId() {
    try {
      let id = localStorage.getItem(CLIENT_KEY);
      if (!id || id.length < 8) {
        id = randomId();
        localStorage.setItem(CLIENT_KEY, id);
      }
      return id;
    } catch {
      return randomId();
    }
  }

  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    $("hint").textContent = "Ouvrez la page depuis le lien ou le QR fourni.";
    $("bad").classList.remove("hidden");
  } else {
    load(slug);
  }

  async function load(slugVal) {
    try {
      const res = await fetch(`/api/public/${encodeURIComponent(slugVal)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        $("hint").textContent = data.error || "Erreur.";
        $("bad").classList.remove("hidden");
        return;
      }
      $("hint").textContent = "Une réponse par appareil.";
      $("question").textContent = data.poll.title;

      const box = $("choices");
      box.innerHTML = "";
      (data.options || []).forEach((o, i) => {
        const id = "opt_" + i;
        const lab = document.createElement("label");
        lab.style.cssText =
          "display:flex;align-items:center;gap:0.5rem;padding:0.5rem;border:1px solid var(--border);border-radius:8px;margin-bottom:0.4rem;cursor:pointer";
        lab.innerHTML = `<input type="radio" name="voteopt" value="${escapeAttr(o.id)}" id="${id}" /> <span>${escapeHtml(o.label)}</span>`;
        box.appendChild(lab);
      });

      $("panel").classList.remove("hidden");
    } catch {
      $("hint").textContent = "Connexion impossible.";
      $("bad").classList.remove("hidden");
    }
  }

  $("btn-send").addEventListener("click", async () => {
    const err = $("voteErr");
    err.classList.add("hidden");
    const picked = document.querySelector('input[name="voteopt"]:checked');
    if (!picked) {
      err.textContent = "Choisissez un participant.";
      err.classList.remove("hidden");
      return;
    }

    const btn = $("btn-send");
    btn.disabled = true;
    btn.textContent = "Envoi…";

    try {
      const res = await fetch(`/api/public/${encodeURIComponent(slug)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: picked.value, clientId: getClientId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        $("doneMsg").textContent = "Vous avez déjà voté avec cet appareil.";
        $("panel").classList.add("hidden");
        $("done").classList.remove("hidden");
        return;
      }
      if (!res.ok) {
        err.textContent = data.error || "Erreur.";
        err.classList.remove("hidden");
        return;
      }
      $("panel").classList.add("hidden");
      $("done").classList.remove("hidden");
    } catch {
      err.textContent = "Connexion impossible.";
      err.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "Envoyer";
    }
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }
})();
