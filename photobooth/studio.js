const page = document.querySelector(".page");
const authBanner = document.getElementById("auth-banner");
const studioEventMeta = document.getElementById("studio-event-meta");
const studioFeedback = document.getElementById("studio-feedback");
const galleryGrid = document.getElementById("gallery-grid");
const galleryCount = document.getElementById("gallery-count");
const backToEvents = document.getElementById("back-to-events");
const galleryQrImage = document.getElementById("gallery-qr-image");
const galleryLink = document.getElementById("gallery-link");

const startCameraBtn = document.getElementById("start-camera");
const captureBtn = document.getElementById("capture-photo");
const downloadLastBtn = document.getElementById("download-last");
const layoutSelect = document.getElementById("layout-select");
const timerSelect = document.getElementById("timer-select");
const filterSelect = document.getElementById("filter-select");
const propSelect = document.getElementById("prop-select");

const cameraFeed = document.getElementById("camera-feed");
const captureLayer = document.getElementById("capture-layer");
const countdownOverlay = document.getElementById("countdown-overlay");
const captureCtx = captureLayer ? captureLayer.getContext("2d") : null;

const SESSION_EVENT_KEY = "photobooth_current_event";
const MODULE_ID = "photobooth";

let hasValidAccess = false;
let currentEvent = null;
let mediaStream = null;
let lastCaptureDataUrl = "";
let isCapturing = false;
let currentPhotos = [];

function setFeedback(message = "", type = "") {
  studioFeedback.textContent = message;
  studioFeedback.className = "feedback";
  if (type) studioFeedback.classList.add(type);
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Erreur API");
  }
  return data;
}

async function getEventById(eventId) {
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}`);
  return data.event;
}

async function getEventPhotos(eventId) {
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}/photos`);
  return data.photos || [];
}

async function uploadEventPhoto(eventId, imageDataUrl) {
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl }),
  });
  return data.photo;
}

async function getGalleryQr(eventId) {
  const token = readTokenFromUrl();
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return fetchJson(`/api/events/${encodeURIComponent(eventId)}/qrcode${query}`);
}

function getCurrentEventId() {
  const url = new URL(window.location.href);
  const eventIdFromQuery = url.searchParams.get("eventId");
  if (eventIdFromQuery) return eventIdFromQuery;

  try {
    const inSession = JSON.parse(sessionStorage.getItem(SESSION_EVENT_KEY) || "null");
    if (inSession?.id) return inSession.id;
  } catch {
    return null;
  }
  return null;
}

function getLayoutShots() {
  const layout = layoutSelect.value;
  if (layout === "strip") return 3;
  if (layout === "grid") return 4;
  return 1;
}

function getFilterCss(value) {
  switch (value) {
    case "bw":
      return "grayscale(1)";
    case "warm":
      return "saturate(1.15) sepia(0.2) hue-rotate(-8deg)";
    case "cool":
      return "saturate(1.08) hue-rotate(10deg)";
    case "vintage":
      return "contrast(1.08) sepia(0.32) saturate(0.9)";
    default:
      return "none";
  }
}

function applyPreviewFilter() {
  const cssFilter = getFilterCss(filterSelect.value);
  cameraFeed.style.filter = cssFilter;
}

function drawProp(ctx, width, height, prop) {
  if (prop === "none") return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (prop === "glasses") {
    ctx.font = `${Math.floor(width * 0.22)}px serif`;
    ctx.fillText("🕶️", width / 2, height * 0.36);
  } else if (prop === "mustache") {
    ctx.font = `${Math.floor(width * 0.22)}px serif`;
    ctx.fillText("👨", width / 2, height * 0.6);
  } else if (prop === "hat") {
    ctx.font = `${Math.floor(width * 0.24)}px serif`;
    ctx.fillText("🎩", width / 2, height * 0.2);
  } else if (prop === "hearts") {
    ctx.font = `${Math.floor(width * 0.13)}px serif`;
    ctx.fillText("💚 💛 💚", width / 2, height * 0.17);
  }
  ctx.restore();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCountdown(seconds) {
  countdownOverlay.classList.add("active");
  for (let value = seconds; value >= 1; value -= 1) {
    countdownOverlay.textContent = String(value);
    await wait(1000);
  }
  countdownOverlay.textContent = "📸";
  await wait(350);
  countdownOverlay.classList.remove("active");
  countdownOverlay.textContent = "";
}

function ensureCaptureLayerSize() {
  const width = cameraFeed.videoWidth || 1280;
  const height = cameraFeed.videoHeight || 720;
  captureLayer.width = width;
  captureLayer.height = height;
}

function snapSingleFrame() {
  ensureCaptureLayerSize();
  const width = captureLayer.width;
  const height = captureLayer.height;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.save();
  tempCtx.filter = getFilterCss(filterSelect.value);
  tempCtx.translate(width, 0);
  tempCtx.scale(-1, 1);
  tempCtx.drawImage(cameraFeed, 0, 0, width, height);
  tempCtx.restore();
  drawProp(tempCtx, width, height, propSelect.value);
  return tempCanvas;
}

function composeShots(shots, layout, eventData) {
  const output = document.createElement("canvas");
  const ctx = output.getContext("2d");
  if (layout === "strip") {
    output.width = 1080;
    output.height = 1920;
  } else if (layout === "grid") {
    output.width = 1440;
    output.height = 1440;
  } else {
    output.width = 1080;
    output.height = 1350;
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, output.width, output.height);
  const title = `${eventData.name} • ${new Date().toLocaleDateString("fr-FR")}`;
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 34px Inter, Arial, sans-serif";
  ctx.fillText(title, 36, 52);
  if (layout === "single") {
    const pad = 36;
    ctx.drawImage(shots[0], pad, 80, output.width - pad * 2, output.height - 128);
  } else if (layout === "strip") {
    const pad = 36;
    const top = 96;
    const gap = 24;
    const slotHeight = Math.floor((output.height - top - gap * 2 - 36) / 3);
    const slotWidth = output.width - pad * 2;
    for (let i = 0; i < 3; i += 1) {
      const y = top + i * (slotHeight + gap);
      ctx.drawImage(shots[i], pad, y, slotWidth, slotHeight);
    }
  } else {
    const pad = 36;
    const top = 90;
    const gap = 20;
    const cellW = Math.floor((output.width - pad * 2 - gap) / 2);
    const cellH = Math.floor((output.height - top - pad - gap) / 2);
    for (let i = 0; i < 4; i += 1) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = pad + col * (cellW + gap);
      const y = top + row * (cellH + gap);
      ctx.drawImage(shots[i], x, y, cellW, cellH);
    }
  }
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, output.width - 16, output.height - 16);
  return output;
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function renderGallery() {
  if (!currentEvent) return;
  galleryGrid.innerHTML = "";
  galleryCount.textContent = `${currentPhotos.length} photo${currentPhotos.length > 1 ? "s" : ""}`;
  currentPhotos.forEach((photo, index) => {
    const item = document.createElement("article");
    item.className = "gallery-item";
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = `Photo ${index + 1}`;
    item.appendChild(image);
    const dl = document.createElement("button");
    dl.type = "button";
    dl.textContent = "Telecharger";
    dl.addEventListener("click", () => {
      const absolute = new URL(photo.url, window.location.origin).toString();
      downloadDataUrl(absolute, `${currentEvent.name}-photo-${index + 1}.png`);
    });
    item.appendChild(dl);
    galleryGrid.appendChild(item);
  });
}

async function refreshGallery() {
  if (!currentEvent) return;
  currentPhotos = await getEventPhotos(currentEvent.id);
  renderGallery();
}

async function updateGalleryQr() {
  if (!currentEvent) return;
  const data = await getGalleryQr(currentEvent.id);
  galleryQrImage.src = data.qrDataUrl;
  galleryLink.href = data.galleryUrl;
}

async function startCamera() {
  if (!hasValidAccess) return;
  if (mediaStream) {
    setFeedback("Camera deja active.", "success");
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    cameraFeed.srcObject = mediaStream;
    applyPreviewFilter();
    setFeedback("Camera activee avec succes.", "success");
  } catch {
    setFeedback("Impossible d'activer la camera. Verifie les permissions.", "error");
  }
}

async function captureSequence() {
  if (!hasValidAccess || !currentEvent) return;
  if (!mediaStream) {
    setFeedback("Active d'abord la camera.", "error");
    return;
  }
  if (isCapturing) return;

  isCapturing = true;
  captureBtn.disabled = true;
  try {
    const shotCount = getLayoutShots();
    const timerValue = Number(timerSelect.value);
    const shots = [];
    setFeedback("Capture en cours...", "");
    for (let index = 0; index < shotCount; index += 1) {
      await runCountdown(timerValue);
      const snap = snapSingleFrame();
      shots.push(snap);
      setFeedback(`Prise ${index + 1}/${shotCount} capturee.`, "success");
      await wait(250);
    }
    const output = composeShots(shots, layoutSelect.value, currentEvent);
    const dataUrl = output.toDataURL("image/png");
    lastCaptureDataUrl = dataUrl;
    await uploadEventPhoto(currentEvent.id, dataUrl);
    if (captureLayer && captureCtx) {
      captureLayer.width = output.width;
      captureLayer.height = output.height;
      captureCtx.clearRect(0, 0, output.width, output.height);
      captureCtx.drawImage(output, 0, 0);
    }
    await refreshGallery();
    setFeedback("Photo enregistree dans le dossier de l'evenement.", "success");
  } catch {
    setFeedback("Erreur pendant la capture photo.", "error");
  } finally {
    captureBtn.disabled = false;
    isCapturing = false;
  }
}

async function setupEventSession() {
  const eventId = getCurrentEventId();
  if (!eventId) {
    studioEventMeta.textContent = "Aucun evenement selectionne.";
    setFeedback("Retourne a la gestion des evenements pour ouvrir une session.", "error");
    return false;
  }
  try {
    currentEvent = await getEventById(eventId);
    sessionStorage.setItem(SESSION_EVENT_KEY, JSON.stringify(currentEvent));
    studioEventMeta.textContent = `${currentEvent.name} • PIN ${currentEvent.pin} • Host ${currentEvent.host}`;
    await refreshGallery();
    await updateGalleryQr();
    return true;
  } catch {
    studioEventMeta.textContent = "Evenement introuvable.";
    setFeedback("Impossible de charger la session evenement.", "error");
    return false;
  }
}

function configureBackLink() {
  const token = readTokenFromUrl();
  if (!token) return;
  const url = new URL("./index.html", window.location.href);
  url.searchParams.set("token", token);
  backToEvents.href = url.toString();
}

hasValidAccess = validateAccessToken();
configureBackLink();
setupEventSession();

filterSelect.addEventListener("change", applyPreviewFilter);
startCameraBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", captureSequence);

downloadLastBtn.addEventListener("click", () => {
  if (!lastCaptureDataUrl || !currentEvent) {
    setFeedback("Aucune photo a telecharger pour le moment.", "error");
    return;
  }
  downloadDataUrl(lastCaptureDataUrl, `${currentEvent.name}-latest.png`);
});
