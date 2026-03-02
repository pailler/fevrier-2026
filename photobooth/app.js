const tabs = document.querySelectorAll(".card");
const panels = {
  join: document.getElementById("panel-join"),
  create: document.getElementById("panel-create"),
};

const page = document.querySelector(".page");
const authBanner = document.getElementById("auth-banner");
const joinInput = document.getElementById("event-code");
const joinFeedback = document.getElementById("join-feedback");
const createFeedback = document.getElementById("create-feedback");

const EVENTS_KEY = "photobooth_events";
const SESSION_EVENT_KEY = "photobooth_current_event";
const MODULE_ID = "photobooth";
let hasValidAccess = false;

function setFeedback(node, message = "", type = "") {
  node.textContent = message;
  node.className = "feedback";
  if (type) node.classList.add(type);
}

function showTab(tabName) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  Object.entries(panels).forEach(([name, el]) => {
    el.classList.toggle("active", name === tabName);
  });
}

function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const raw = String(token).trim();
  if (!raw) return null;

  function ensurePadding(s) {
    const n = s.length % 4;
    if (n === 0) return s;
    if (n === 2) return s + "==";
    if (n === 3) return s + "=";
    return s;
  }

  function tryDecodeBase64(s) {
    if (!s) return null;
    const urlSafe = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded = ensurePadding(urlSafe);
    try {
      const dec = atob(padded);
      const out = JSON.parse(dec);
      if (out && (out.moduleId || out.userId || out.userEmail)) return out;
    } catch { /* noop */ }
    return null;
  }

  try {
    const decoded = raw.includes("%") ? (() => { try { return decodeURIComponent(raw); } catch { return raw; } })() : raw;
    const cleaned = decoded.replace(/ /g, "+").replace(/[\t\n\r]/g, "");

    const parts = cleaned.split(".");
    if (parts.length >= 2) {
      const out = tryDecodeBase64(parts[1]);
      if (out) return out;
    }

    for (const s of [cleaned, decoded, raw]) {
      const out = tryDecodeBase64(s);
      if (out) return out;
    }
  } catch { /* pass */ }
  return null;
}

function readTokenFromUrl() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("token");
  if (fromQuery) return fromQuery;
  const hash = url.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    return hashParams.get("token");
  }
  return null;
}

function isLocalRuntime() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function setLockedMode(locked, message, type = "error") {
  page.classList.toggle("locked", locked);
  authBanner.className = "auth-banner";
  if (type) authBanner.classList.add(type);
  authBanner.textContent = message;
}

function validateAccessToken() {
  const rawToken = readTokenFromUrl();
  const localRuntime = isLocalRuntime();

  if (!rawToken && localRuntime) {
    setLockedMode(
      false,
      "Mode local detecte: acces autorise sans token (developpement).",
      "ok"
    );
    return true;
  }

  if (!rawToken) {
    setLockedMode(
      true,
      "Acces refuse: token manquant. Ouvre Photobooth depuis IAHome.",
      "error"
    );
    return false;
  }

  const payload = parseJwtPayload(rawToken);
  if (!payload) {
    setLockedMode(true, "Acces refuse: token invalide.", "error");
    return false;
  }

  const isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000);
  if (isExpired) {
    setLockedMode(true, "Acces refuse: token expire.", "error");
    return false;
  }

  if ((payload.moduleId || "").toLowerCase() !== MODULE_ID) {
    setLockedMode(true, "Acces refuse: module non autorise.", "error");
    return false;
  }

  const user = payload.userEmail || payload.userId || "utilisateur";
  setLockedMode(false, `Acces connecte valide pour ${user}.`, "ok");
  return true;
}

function openStudio(eventData) {
  sessionStorage.setItem(SESSION_EVENT_KEY, JSON.stringify(eventData));
  const currentToken = readTokenFromUrl();
  const url = new URL("./studio.html", window.location.href);
  url.searchParams.set("eventId", eventData.id);
  if (currentToken) url.searchParams.set("token", currentToken);
  window.location.href = url.toString();
}

async function createEvent(name, host) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, host }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Impossible de creer l'evenement.");
  }
  const data = await response.json();
  return data.event;
}

async function findEventByPin(pin) {
  const response = await fetch(`/api/events/by-pin/${encodeURIComponent(pin)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Evenement introuvable.");
  }
  const data = await response.json();
  return data.event;
}

hasValidAccess = validateAccessToken();

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

joinInput.addEventListener("input", () => {
  joinInput.value = joinInput.value.replace(/\D/g, "").slice(0, 4);
});

document.getElementById("verify-code").addEventListener("click", () => {
  (async () => {
  if (!hasValidAccess) {
    setFeedback(joinFeedback, "Acces refuse. Verifiez que vous avez ouvert Photobooth depuis IAHome avec un token valide.", "error");
    return;
  }

  const code = joinInput.value.trim();
  setFeedback(joinFeedback, "");

  if (!/^\d{4}$/.test(code)) {
    setFeedback(joinFeedback, "Le code doit contenir exactement 4 chiffres.", "error");
    return;
  }

  try {
    const eventData = await findEventByPin(code);
    setFeedback(
      joinFeedback,
      `Code valide. Redirection vers le studio "${eventData.name}"...`,
      "success"
    );
    setTimeout(() => openStudio(eventData), 300);
  } catch (error) {
    setFeedback(
      joinFeedback,
      String(error.message || "Code non trouve. Verifie le PIN."),
      "error"
    );
  }
  })();
});

document.getElementById("create-event").addEventListener("click", () => {
  (async () => {
  if (!hasValidAccess) {
    setFeedback(createFeedback, "Acces refuse. Verifiez que vous avez ouvert Photobooth depuis IAHome avec un token valide.", "error");
    return;
  }

  const eventName = document.getElementById("event-name").value.trim();
  const hostName = document.getElementById("host-name").value.trim();
  setFeedback(createFeedback, "");

  if (eventName.length < 3) {
    setFeedback(createFeedback, "Ajoute un nom d'evenement (min. 3 caracteres).", "error");
    return;
  }

  if (hostName.length < 2) {
    setFeedback(
      createFeedback,
      "Ajoute le prenom de l'organisateur (min. 2 caracteres).",
      "error"
    );
    return;
  }

  try {
    const created = await createEvent(eventName, hostName);
    localStorage.setItem(
      EVENTS_KEY,
      JSON.stringify([created])
    );
    setFeedback(
      createFeedback,
      `Evenement cree. PIN ${created.pin}. Redirection vers le studio...`,
      "success"
    );
    document.getElementById("event-name").value = "";
    document.getElementById("host-name").value = "";
    setTimeout(() => openStudio(created), 300);
  } catch (error) {
    setFeedback(
      createFeedback,
      String(error.message || "Impossible de creer l'evenement."),
      "error"
    );
  }
  })();
});
