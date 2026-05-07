(function () {
  const $ = (id) => document.getElementById(id);

  function showFb(el, msg, ok) {
    el.textContent = msg || "";
    el.classList.toggle("hidden", !msg);
    el.classList.toggle("ok", !!ok);
    el.classList.toggle("feedback", true);
  }

  function setTab(name) {
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === name);
    });
    document.querySelectorAll(".panel").forEach((p) => {
      p.classList.toggle("active", p.id === "panel-" + name);
    });
  }

  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => setTab(t.dataset.tab));
  });

  $("btn-create").addEventListener("click", async () => {
    const title = $("vote-title").value.trim();
    const raw = $("participants").value.split("\n").map((s) => s.trim()).filter(Boolean);
    const fb = $("fb-create");
    showFb(fb, "");

    if (title.length < 2) {
      showFb(fb, "Indiquez un nom de vote.");
      return;
    }
    if (raw.length < 2) {
      showFb(fb, "Au moins deux participants (une ligne chacun).");
      return;
    }

    const btn = $("btn-create");
    btn.disabled = true;
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, participants: raw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showFb(fb, data.error || "Erreur création.");
        return;
      }
      showFb(fb, "Vote créé. Notez le PIN ci-dessous (onglet Admin).", true);
      $("admin-pin").value = data.poll.pin;
      setTab("admin");
      await loadAdminSession(data.poll.pin);
    } catch {
      showFb(fb, "Connexion au serveur impossible.");
    } finally {
      btn.disabled = false;
    }
  });

  let currentPin = "";

  async function loadAdminSession(pin) {
    const fb = $("fb-admin");
    showFb(fb, "");
    if (!/^\d{4}$/.test(pin)) {
      showFb(fb, "PIN à 4 chiffres requis.");
      return;
    }
    currentPin = pin;
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showFb(fb, data.error || "PIN inconnu.");
        $("admin-content").classList.add("hidden");
        return;
      }

      $("admin-content").classList.remove("hidden");
      $("display-pin").textContent = data.poll.pin;

      const origin = window.location.origin;
      const slug = data.poll.public_slug;
      $("public-url").textContent = `${origin}/vote.html?slug=${encodeURIComponent(slug)}`;

      $("qr-img").src = `/api/admin/qrcode.png?pin=${encodeURIComponent(pin)}&t=${Date.now()}`;

      renderResults(data);
      showFb(fb, "Session chargée.", true);
    } catch {
      showFb(fb, "Connexion au serveur impossible.");
      $("admin-content").classList.add("hidden");
    }
  }

  function renderResults(data) {
    const host = $("results");
    host.innerHTML = "";
    const opts = data.options || [];
    const max = Math.max(1, ...opts.map((o) => o.votes || 0));
    opts.forEach((o) => {
      const n = o.votes || 0;
      const pct = Math.round((n / max) * 100);
      const div = document.createElement("div");
      div.className = "barline";
      div.innerHTML = `
        <div class="barlabel"><span>${escapeHtml(o.label)}</span><span>${n}</span></div>
        <div class="bartrack"><div class="barfill" style="width:${pct}%"></div></div>`;
      host.appendChild(div);
    });
    const total = document.createElement("p");
    total.className = "mono";
    total.style.marginTop = "0.75rem";
    total.textContent = `Total : ${data.totalVotes || 0} vote(s)`;
    host.appendChild(total);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  $("btn-load-admin").addEventListener("click", () => loadAdminSession($("admin-pin").value.trim()));

  $("btn-refresh").addEventListener("click", () => {
    if (currentPin) loadAdminSession(currentPin);
  });

  $("btn-copy-url").addEventListener("click", async () => {
    const t = $("public-url").textContent;
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      /* ignore */
    }
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("tab") === "admin") setTab("admin");
})();
