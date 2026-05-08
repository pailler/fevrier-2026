const page = document.querySelector(".page");
const authBanner = document.getElementById("auth-banner");
const studioEventMeta = document.getElementById("studio-event-meta");
const studioFeedback = document.getElementById("studio-feedback");
const galleryGrid = document.getElementById("gallery-grid");
const galleryCount = document.getElementById("gallery-count");
const backToEvents = document.getElementById("back-to-events");
const galleryQrImage = document.getElementById("gallery-qr-image");
const galleryLink = document.getElementById("gallery-link");
const lastPhotoQr = document.getElementById("last-photo-qr");
const copyPickupUrlBtn = document.getElementById("copy-pickup-url");

const studioVideoGrid = document.getElementById("studio-video-grid");
const studioVideoCount = document.getElementById("studio-video-count");
const studioOpenVideoStudio = document.getElementById("studio-open-video-studio");
const studioVideoModal = document.getElementById("studio-video-modal");
const studioVideoModalBackdrop = document.getElementById("studio-video-modal-backdrop");
const studioVideoModalClose = document.getElementById("studio-video-modal-close");
const studioVideoModalPlayer = document.getElementById("studio-video-modal-player");

const captureBtn = document.getElementById("capture-photo");
const activateCameraBtn = document.getElementById("activate-camera-btn");
const layoutSelect = document.getElementById("layout-select");
const timerSelect = document.getElementById("timer-select");
const filterSelect = document.getElementById("filter-select");
const propSelect = document.getElementById("prop-select");

const cameraFeed = document.getElementById("camera-feed");
const captureLayer = document.getElementById("capture-layer");
const countdownOverlay = document.getElementById("countdown-overlay");
const captureCtx = captureLayer ? captureLayer.getContext("2d") : null;

const cameraZone = document.getElementById("camera-zone");
const cameraActivateHint = document.getElementById("camera-activate-hint");

const validateStepPanel = document.getElementById("validate-step-panel");
const validateStepPendingOnly = document.getElementById("validate-step-pending-only");
const validateStepPreview = document.getElementById("validate-step-preview");
const validateStepConfirmBtn = document.getElementById("validate-step-confirm");
const validateStepCancelBtn = document.getElementById("validate-step-cancel");
const fileCameraInput = document.getElementById("studio-camera-file");
const fileCaptureBtn = document.getElementById("studio-file-capture-btn");

function updateStudioCaptureUi() {
  if (cameraZone) {
    cameraZone.setAttribute(
      "aria-label",
      mediaStream
        ? "Aperçu caméra actif. Utilisez « 2. Prendre la photo » pour le décompte et la prise, puis validez ou rejetez dans le panneau."
        : "Aperçu caméra. Utilisez d’abord « 1. Ouvrir la caméra », puis « 2. Prendre la photo »."
    );
  }
  var camBlocked =
    !hasValidAccess ||
    !currentEvent ||
    !!pendingSelfieCanvas ||
    !!filePickSession ||
    isCapturing;
  if (activateCameraBtn) {
    activateCameraBtn.disabled = camBlocked || !!isCameraStartPending || !!mediaStream;
  }
  if (captureBtn) {
    var lede = captureBtn.querySelector(".btn-activate-camera-lede");
    if (lede) {
      lede.textContent = mediaStream
        ? "2. Prendre la photo, puis valider"
        : "2. Prendre la photo — ouvrez la caméra d’abord";
    }
    captureBtn.disabled = camBlocked || !mediaStream;
  }
  if (cameraActivateHint) {
    var isIpadUi =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("ipad-studio");
    if (!isIpadUi || mediaStream) {
      cameraActivateHint.hidden = true;
    } else {
      cameraActivateHint.hidden = !!camBlocked;
      cameraActivateHint.disabled = !!isCameraStartPending;
    }
  }
}

if (window.PhotoFaceGuide && typeof PhotoFaceGuide.syncPreviewFaceGuideUi === "function") {
  const camZoneFace = document.getElementById("camera-zone");
  if (camZoneFace) {
    PhotoFaceGuide.syncPreviewFaceGuideUi(camZoneFace, null);
  }
}

let pendingSelfieCanvas = null;
let pipelineUploadInFlight = false;
let validateStepTimerId = null;
const VALIDATE_STEP_MS = 60 * 1000;

function clearValidateStepTimer() {
  if (validateStepTimerId != null) {
    clearTimeout(validateStepTimerId);
    validateStepTimerId = null;
  }
}

function startValidateStepTimer() {
  clearValidateStepTimer();
  validateStepTimerId = setTimeout(function () {
    validateStepTimerId = null;
    if (pipelineUploadInFlight) return;
    if (!pendingSelfieCanvas) return;
    if (!validateStepPendingOnly || validateStepPendingOnly.hidden) return;
    closeValidateStepPanel();
    setFeedback("Délai écoulé : la photo n'a pas été ajoutée à la galerie.", "error");
  }, VALIDATE_STEP_MS);
}

function cloneCanvasForPipeline(source) {
  const c = document.createElement("canvas");
  c.width = source.width;
  c.height = source.height;
  c.getContext("2d").drawImage(source, 0, 0);
  return c;
}

function refreshValidateStepPreview() {
  if (!validateStepPreview || !pendingSelfieCanvas) return;
  validateStepPreview.src = pendingSelfieCanvas.toDataURL("image/jpeg", 0.88);
}

function scrollValidateStepIntoView() {
  const target = validateStepPanel;
  if (!target) return;
  var smooth = true;
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) smooth = false;
  } catch {
    /* noop */
  }
  function doScroll() {
    try {
      target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start", inline: "nearest" });
    } catch {
      try {
        target.scrollIntoView(true);
      } catch {
        /* noop */
      }
    }
  }
  doScroll();
  window.setTimeout(doScroll, 320);
}

function openValidateStepPanel() {
  if (!pendingSelfieCanvas || !validateStepPreview) {
    setFeedback("Erreur : recharger la page studio (validation indisponible).", "error");
    console.error("openValidateStepPanel: requis manquant", { pendingSelfieCanvas: !!pendingSelfieCanvas, validateStepPreview });
    return;
  }
  clearValidateStepTimer();
  exitCameraFullscreen();
  refreshValidateStepPreview();
  if (validateStepPanel) validateStepPanel.classList.add("validate-step-panel--active");
  if (validateStepPendingOnly) validateStepPendingOnly.hidden = false;
  startValidateStepTimer();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      scrollValidateStepIntoView();
    });
  });
}

function closeValidateStepPanel() {
  clearValidateStepTimer();
  if (validateStepPanel) validateStepPanel.classList.remove("validate-step-panel--active");
  if (validateStepPendingOnly) validateStepPendingOnly.hidden = true;
  if (validateStepPreview) validateStepPreview.removeAttribute("src");
  pendingSelfieCanvas = null;
  updateStudioCaptureUi();
}

async function confirmValidateStepAndUpload() {
  if (pipelineUploadInFlight) return;
  if (!pendingSelfieCanvas || !currentEvent || !validateStepConfirmBtn) return;
  clearValidateStepTimer();
  pipelineUploadInFlight = true;
  validateStepConfirmBtn.disabled = true;
  try {
    const finalDataUrl = pendingSelfieCanvas.toDataURL("image/jpeg", 0.94);
    lastCaptureDataUrl = finalDataUrl;
    const uploaded = await uploadEventPhoto(currentEvent.id, finalDataUrl, {
      originalDataUrl: finalDataUrl,
      pipelineStyle: "",
    });
    if (captureLayer && captureCtx) {
      captureLayer.width = pendingSelfieCanvas.width;
      captureLayer.height = pendingSelfieCanvas.height;
      captureCtx.clearRect(0, 0, captureLayer.width, captureLayer.height);
      captureCtx.drawImage(pendingSelfieCanvas, 0, 0);
    }
    const optimistic = {
      id: uploaded.id,
      filename: uploaded.filename,
      createdAt: uploaded.createdAt || new Date().toISOString(),
      url: uploaded.url,
    };
    currentPhotos = [optimistic, ...currentPhotos.filter((p) => p.filename !== optimistic.filename)];
    renderGallery();
    try {
      await refreshGallery();
    } catch (galErr) {
      console.warn("refreshGallery after upload", galErr);
    }
    mergeUploadedIfMissing(uploaded);
    if (!currentPhotos.some((p) => p.filename === uploaded.filename)) {
      await wait(300);
      try {
        await refreshGallery();
      } catch (e2) {
        console.warn("refreshGallery 2e tentative", e2);
      }
      mergeUploadedIfMissing(uploaded);
    }
    await refreshPickupUi(uploaded.filename);
    setFeedback("Souvenir enregistre (galerie + QR).", "success");
    closeValidateStepPanel();
  } catch (e) {
    setFeedback(e instanceof Error ? e.message : "Erreur enregistrement.", "error");
  } finally {
    pipelineUploadInFlight = false;
    validateStepConfirmBtn.disabled = false;
  }
}

function bindTapOrClick(el, handler) {
  if (!el || typeof handler !== "function") return;
  var startX = 0;
  var startY = 0;
  var moved = false;
  el.addEventListener(
    "touchstart",
    function (e) {
      moved = false;
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );
  el.addEventListener(
    "touchmove",
    function (e) {
      if (!e.touches || !e.touches[0]) return;
      var dx = Math.abs(e.touches[0].clientX - startX);
      var dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > 14 || dy > 14) moved = true;
    },
    { passive: true }
  );
  el.addEventListener(
    "touchend",
    function (e) {
      if (moved) return;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      var dx = Math.abs(t.clientX - startX);
      var dy = Math.abs(t.clientY - startY);
      if (dx > 14 || dy > 14) return;
      e.preventDefault();
      handler();
    },
    { passive: false }
  );
  el.addEventListener("click", function () {
    handler();
  });
}

if (validateStepConfirmBtn) bindTapOrClick(validateStepConfirmBtn, function () {
  void confirmValidateStepAndUpload();
});
if (validateStepCancelBtn)
  bindTapOrClick(validateStepCancelBtn, function () {
    setFeedback("Photo rejetée — vous pouvez refaire une prise.", "");
    closeValidateStepPanel();
  });

const MODULE_ID = "photobooth";
const SESSION_EVENT_KEY = "photobooth_current_event";
const INACTIVITY_MS = 60 * 1000; // 1 minute

let hasValidAccess = false;
let inactivityTimer = null;
let currentEvent = null;
let mediaStream = null;
let lastCaptureDataUrl = "";
let lastPickupUrl = "";
let isCapturing = false;
/** Prise via input file + capture : plusieurs taps pour strip/grid (iOS exige un geste par ouverture). */
let filePickSession = null;
let currentPhotos = [];
let currentVideos = [];
let isCameraFullscreen = false;
let isCameraStartPending = false;

function setFeedback(message = "", type = "") {
  if (!studioFeedback) return;
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

/** iPad / Safari : contexte non sécurisé (http + IP) bloque souvent getUserMedia ; HTTPS ou localhost requis. */
function canUseCameraInThisContext() {
  if (typeof window.isSecureContext !== "boolean") return true;
  if (window.isSecureContext) return true;
  return isLocalRuntime();
}

/**
 * iPad / Web App : parfois `mediaDevices.getUserMedia` incomplet sans pont webkit.
 */
function patchMediaDevicesIfNeeded() {
  try {
    if (typeof navigator === "undefined") return;
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {};
    }
    var md = navigator.mediaDevices;
    if (typeof md.getUserMedia !== "function") {
      var legacy =
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.getUserMedia ||
        navigator.msGetUserMedia;
      if (typeof legacy === "function") {
        md.getUserMedia = function (constraints) {
          return new Promise(function (resolve, reject) {
            legacy.call(navigator, constraints, resolve, reject);
          });
        };
      }
    }
  } catch (e) {
    console.warn("patchMediaDevicesIfNeeded", e);
  }
}

function isLikelyIosStandaloneApp() {
  try {
    if (navigator.standalone === true) return true;
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch (e) {
    /* noop */
  }
  return false;
}

/** iPhone / iPad / iPadOS (y compris « MacIntel » tactile). Utile pour messages WebView / kiosque. */
function isLikelyIosOrIpados() {
  try {
    var ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/i.test(ua)) return true;
    if (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1) return true;
    if (navigator.platform === "iPad") return true;
  } catch (e) {
    /* noop */
  }
  return false;
}

function ensureGetUserMedia() {
  patchMediaDevicesIfNeeded();
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
    return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  }
  const legacy =
    navigator.webkitGetUserMedia ||
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  if (!legacy) return null;
  return function (constraints) {
    return new Promise(function (resolve, reject) {
      legacy.call(navigator, constraints, resolve, reject);
    });
  };
}

/**
 * Selfie : contraintes progressives (anciens iPad : facingMode + idéal largeur → OverconstrainedError).
 * IMPORTANT (Safari iPad / iPhone / PWA) : `getUserMedia` doit être appelé dans la pile synchrone du
 * geste utilisateur. Un `async` qui fait `await` avant le premier `gum()` casse souvent l’activation.
 */
function getSelfieCameraStream() {
  const gum = ensureGetUserMedia();
  if (!gum) {
    return Promise.reject(Object.assign(new Error("NO_GUM"), { name: "NoGetUserMedia" }));
  }
  if (!canUseCameraInThisContext()) {
    return Promise.reject(Object.assign(new Error("INSECURE"), { name: "InsecureContext" }));
  }
  const attempts = isLikelyIosStandaloneApp()
    ? [
        { audio: false, video: true },
        { audio: false, video: { facingMode: "user" } },
      ]
    : [
        { audio: false, video: { facingMode: "user" } },
        { audio: false, video: true },
      ];
  function tryAttempt(index, lastErr) {
    if (index >= attempts.length) {
      return Promise.reject(lastErr || new Error("CAMERA_FAILED"));
    }
    return gum(attempts[index]).catch(function (err) {
      return tryAttempt(index + 1, err);
    });
  }
  return tryAttempt(0, null);
}

async function primeIosVideo(videoEl) {
  if (!videoEl) return;
  videoEl.setAttribute("playsinline", "");
  videoEl.setAttribute("webkit-playsinline", "");
  videoEl.muted = true;
  videoEl.defaultMuted = true;
  try {
    await videoEl.play();
  } catch {
    /* Safari peut exiger un second essai une fois une frame disponible */
    await new Promise(function (r) {
      setTimeout(r, 120);
    });
    try {
      await videoEl.play();
    } catch {
      /* laisser l’autoplay natif tenter le reste */
    }
  }
}

function setLockedMode(locked, message, type = "error") {
  if (page) page.classList.toggle("locked", locked);
  if (!authBanner) return;
  authBanner.className = "auth-banner";
  if (type) authBanner.classList.add(type);
  authBanner.textContent = message;
  authBanner.style.display = message ? "" : "none";
}

function validateAccessToken() {
  const rawToken = readTokenFromUrl();

  if (!rawToken) {
    setLockedMode(false, "", "");
    return true;
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

const EVENT_FETCH_TIMEOUT_MS = 20000;

async function fetchJson(url, options = {}) {
  const timeoutMs = options.timeoutMs;
  const fetchOpts = Object.assign({}, options);
  delete fetchOpts.timeoutMs;

  const methodUpper = String(fetchOpts.method || "GET").toUpperCase();
  if (methodUpper === "GET" && fetchOpts.cache == null) {
    fetchOpts.cache = "no-store";
  }

  function doFetch() {
    return fetch(url, fetchOpts).then(function (response) {
      return response
        .json()
        .catch(function () {
          return {};
        })
        .then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || "Erreur API");
          }
          return data;
        });
    });
  }

  /* Toujours un délai max (certains WebKit ne rejettent pas fetch après AbortController.abort). */
  if (typeof timeoutMs === "number" && timeoutMs > 0) {
    return Promise.race([
      doFetch(),
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        }, timeoutMs);
      }),
    ]);
  }
  return doFetch();
}

async function getEventById(eventId) {
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}`, {
    timeoutMs: EVENT_FETCH_TIMEOUT_MS,
  });
  if (!data || !data.event || typeof data.event.id !== "string" || !data.event.id) {
    const err = new Error("INVALID_EVENT");
    err.name = "InvalidEventResponse";
    throw err;
  }
  return data.event;
}

async function getEventPhotos(eventId) {
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}/photos`);
  return data.photos || [];
}

async function getEventVideos(eventId) {
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}/videos`);
  return data.videos || [];
}

async function uploadEventPhoto(eventId, imageDataUrl, options) {
  var body = { imageDataUrl: imageDataUrl };
  if (options) {
    if (options.originalDataUrl) body.originalDataUrl = options.originalDataUrl;
    if (options.pipelineStyle) body.pipelineStyle = options.pipelineStyle;
  }
  const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return data.photo;
}

async function getGalleryQr(eventId) {
  const token = readTokenFromUrl();
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return fetchJson(`/api/events/${encodeURIComponent(eventId)}/qrcode${query}`);
}

async function refreshPickupUi(photoFilename) {
  if (!currentEvent || !photoFilename || !lastPhotoQr) return;
  try {
    const data = await fetchJson(`/api/events/${encodeURIComponent(currentEvent.id)}/pickup-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: photoFilename }),
    });
    lastPickupUrl = data.pickupUrl || "";
    lastPhotoQr.src = data.qrDataUrl;
    lastPhotoQr.hidden = false;
    if (copyPickupUrlBtn) copyPickupUrlBtn.hidden = false;
  } catch {
    lastPickupUrl = "";
    lastPhotoQr.hidden = true;
    if (copyPickupUrlBtn) copyPickupUrlBtn.hidden = true;
  }
}

function getCurrentEventId() {
  const url = new URL(window.location.href);
  const eventIdFromQuery = url.searchParams.get("eventId");
  if (eventIdFromQuery) return eventIdFromQuery;

  try {
    const inSession = JSON.parse(sessionStorage.getItem(SESSION_EVENT_KEY) || "null");
    if (inSession && inSession.id) return inSession.id;
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

async function runCountdown(seconds, countdownAudio) {
  if (!countdownOverlay) return;
  countdownOverlay.classList.add("active");
  try {
    for (let value = seconds; value >= 1; value -= 1) {
      countdownOverlay.textContent = String(value);
      await wait(1000);
    }
    countdownOverlay.textContent = "📸";
    await wait(350);
  } finally {
    if (countdownAudio) {
      countdownAudio.pause();
      countdownAudio.currentTime = 0;
    }
    countdownOverlay.classList.remove("active");
    countdownOverlay.textContent = "";
  }
}

function startCountdownAudio(seconds) {
  var src = seconds === 3 ? "/sounds/countdown2.mp3" : "/sounds/countdown.mp3";
  var audio = new Audio(src);
  audio.volume = 0.9;
  audio.play().catch(function () {});
  return audio;
}

/** WebKit iOS / iPadOS : ctx.filter + drawImage(video) peut produire un cadre noir ; la vidéo garde le filtre CSS. */
function useCanvas2dFilterOnVideoCapture() {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return false;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return false;
  return true;
}

function waitForCameraDimensions(videoEl, maxWaitMs = 3500) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    function check() {
      if (
        videoEl &&
        videoEl.videoWidth > 0 &&
        videoEl.videoHeight > 0 &&
        videoEl.readyState >= 2
      ) {
        resolve(true);
        return;
      }
      if (Date.now() - t0 >= maxWaitMs) {
        resolve(false);
        return;
      }
      requestAnimationFrame(check);
    }
    check();
  });
}

function advanceVideoFrame(videoEl) {
  return new Promise((resolve) => {
    if (videoEl && typeof videoEl.requestVideoFrameCallback === "function") {
      try {
        videoEl.requestVideoFrameCallback(() => resolve());
        return;
      } catch {
        /* pass */
      }
    }
    requestAnimationFrame(() => resolve());
  });
}

/** Retourne false si la vidéo n’a pas encore de taille intrinsèque (Safari / WebKit). */
function ensureCaptureLayerSize() {
  const vw = cameraFeed.videoWidth;
  const vh = cameraFeed.videoHeight;
  if (!vw || !vh || !captureLayer) return false;
  captureLayer.width = vw;
  captureLayer.height = vh;
  return true;
}

function snapSingleFrame() {
  if (!ensureCaptureLayerSize()) {
    throw new Error("CAMERA_NOT_READY");
  }
  const width = captureLayer.width;
  const height = captureLayer.height;
  const vw = cameraFeed.videoWidth;
  const vh = cameraFeed.videoHeight;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.save();
  const cssFilter = getFilterCss(filterSelect.value);
  tempCtx.filter = useCanvas2dFilterOnVideoCapture() ? cssFilter : "none";
  tempCtx.translate(width, 0);
  tempCtx.scale(-1, 1);
  tempCtx.drawImage(cameraFeed, 0, 0, vw, vh, 0, 0, width, height);
  tempCtx.restore();
  drawProp(tempCtx, width, height, propSelect.value);
  return tempCanvas;
}

function pickOneImageFile() {
  return new Promise(function (resolve, reject) {
    var input = fileCameraInput;
    if (!input) {
      reject(new Error("NO_INPUT"));
      return;
    }
    function onChange() {
      input.removeEventListener("change", onChange);
      var f = input.files && input.files[0];
      input.value = "";
      if (!f) {
        reject(new Error("NO_FILE"));
        return;
      }
      resolve(f);
    }
    input.addEventListener("change", onChange);
    try {
      input.click();
    } catch (err) {
      input.removeEventListener("change", onChange);
      reject(err);
    }
  });
}

function fileToShotCanvas(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      try {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        if (!w || !h) {
          reject(new Error("IMAGE_EMPTY"));
          return;
        }
        var c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        var cx = c.getContext("2d");
        var cssFilter = getFilterCss(filterSelect.value);
        cx.save();
        cx.filter = cssFilter && cssFilter !== "none" ? cssFilter : "none";
        cx.translate(w, 0);
        cx.scale(-1, 1);
        cx.drawImage(img, 0, 0, w, h);
        cx.restore();
        drawProp(cx, w, h, propSelect.value);
        resolve(c);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_LOAD"));
    };
    img.src = url;
  });
}

function resetFileCaptureButtonUi() {
  if (!fileCaptureBtn) return;
  fileCaptureBtn.textContent = "Selfie (caméra avant)";
  fileCaptureBtn.disabled = false;
}

async function handleFileCaptureClick() {
  if (!hasValidAccess || !currentEvent) {
    setFeedback("Accès non valide : ouvrez le studio avec le lien ou le jeton fourni.", "error");
    return;
  }
  if (!fileCameraInput || !fileCaptureBtn) return;
  if (pendingSelfieCanvas) {
    setFeedback("Terminez la validation de la photo avant une nouvelle prise.", "error");
    return;
  }
  if (isCapturing && !filePickSession) return;

  var shotCount = getLayoutShots();
  var layoutKey = layoutSelect.value;

  if (!filePickSession) {
    filePickSession = { shots: [], total: shotCount, layoutKey: layoutKey };
    isCapturing = true;
    updateStudioCaptureUi();
  }

  try {
    if (filePickSession.shots.length === 0) {
      setFeedback("Ouverture de la caméra avant (selfie)…", "");
    } else {
      setFeedback(
        "Selfie " + (filePickSession.shots.length + 1) + "/" + filePickSession.total + " — ouverture…",
        ""
      );
    }
    var file = await pickOneImageFile();
    var shot = await fileToShotCanvas(file);
    filePickSession.shots.push(shot);

    if (filePickSession.shots.length < filePickSession.total) {
      setFeedback(
        "Selfie " +
          filePickSession.shots.length +
          "/" +
          filePickSession.total +
          " enregistré. Touchez encore « Selfie » pour la suite.",
        "success"
      );
      fileCaptureBtn.textContent =
        "Selfie suivant (" + (filePickSession.shots.length + 1) + "/" + filePickSession.total + ")";
      return;
    }

    var output = await composeShotsWithFaces(filePickSession.shots, filePickSession.layoutKey, currentEvent);
    pendingSelfieCanvas = cloneCanvasForPipeline(output);
    filePickSession = null;
    resetFileCaptureButtonUi();
    isCapturing = false;
    updateStudioCaptureUi();
    setFeedback("Validez ou rejetez la photo.", "success");
    openValidateStepPanel();
  } catch (e) {
    console.warn("handleFileCaptureClick", e);
    filePickSession = null;
    resetFileCaptureButtonUi();
    isCapturing = false;
    updateStudioCaptureUi();
    var msg = "Impossible d'utiliser la photo.";
    if (e && e.message === "NO_FILE") {
      msg = "Aucune photo choisie.";
    } else if (
      (e && e.message === "IMAGE_LOAD") ||
      (e && e.message === "IMAGE_EMPTY")
    ) {
      msg = "Image illisible. Réessayez.";
    }
    setFeedback(msg, "error");
  }
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Dessine l'image en "cover" dans (dx,dy,dW,dH), centré ; si focusRect (union des visages),
 * centre le crop sur cette zone (meilleur cadrage groupe en sortie portrait).
 */
function drawImageCoverFocus(ctx, img, dx, dy, dW, dH, focusRect) {
  const iw = img.width;
  const ih = img.height;
  if (!iw || !ih) return;
  const destRatio = dW / dH;
  let sx;
  let sy;
  let sw;
  let sh;

  if (focusRect && focusRect.width > 4 && focusRect.height > 4) {
    const pad = Math.max(focusRect.width, focusRect.height) * 0.45;
    const fx0 = clamp(focusRect.x - pad, 0, iw);
    const fy0 = clamp(focusRect.y - pad, 0, ih);
    const fx1 = clamp(focusRect.x + focusRect.width + pad, 0, iw);
    const fy1 = clamp(focusRect.y + focusRect.height + pad, 0, ih);
    const fw = fx1 - fx0;
    const fh = fy1 - fy0;
    const fcx = (fx0 + fx1) / 2;
    const fcy = (fy0 + fy1) / 2;

    if (fw / fh > destRatio) {
      sh = fh;
      sw = fh * destRatio;
    } else {
      sw = fw;
      sh = fw / destRatio;
    }
    sw = Math.min(sw, iw);
    sh = Math.min(sh, ih);
    sx = clamp(fcx - sw / 2, 0, iw - sw);
    sy = clamp(fcy - sh / 2, 0, ih - sh);
  } else {
    const srcRatio = iw / ih;
    if (srcRatio > destRatio) {
      sh = ih;
      sw = ih * destRatio;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = iw / destRatio;
      sx = 0;
      sy = (ih - sh) / 2;
    }
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dW, dH);
}

async function detectFocusForShot(canvas) {
  if (!window.PhotoFaceGuide || !PhotoFaceGuide.detectFaces) return null;
  const faces = await PhotoFaceGuide.detectFaces(canvas);
  if (!faces || !faces.length) return null;
  return PhotoFaceGuide.faceUnionBBox(faces);
}

async function composeShotsWithFaces(shots, layout, eventData) {
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
    const dx = pad;
    const dy = 80;
    const dW = output.width - pad * 2;
    const dH = output.height - 128;
    const focus = await detectFocusForShot(shots[0]);
    drawImageCoverFocus(ctx, shots[0], dx, dy, dW, dH, focus);
  } else if (layout === "strip") {
    const pad = 36;
    const top = 96;
    const gap = 24;
    const slotHeight = Math.floor((output.height - top - gap * 2 - 36) / 3);
    const slotWidth = output.width - pad * 2;
    for (let i = 0; i < 3; i += 1) {
      const y = top + i * (slotHeight + gap);
      const focus = await detectFocusForShot(shots[i]);
      drawImageCoverFocus(ctx, shots[i], pad, y, slotWidth, slotHeight, focus);
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
      const focus = await detectFocusForShot(shots[i]);
      drawImageCoverFocus(ctx, shots[i], x, y, cellW, cellH, focus);
    }
  }
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, output.width - 16, output.height - 16);
  return output;
}

function galleryPhotoSrc(photo, index) {
  const base = photo && photo.url ? String(photo.url) : "";
  if (!base) return "";
  const token = encodeURIComponent(String(photo.filename || photo.id || photo.createdAt || index || ""));
  const sep = base.indexOf("?") >= 0 ? "&" : "?";
  return `${base}${sep}_cb=${token}`;
}

function renderGallery() {
  if (!currentEvent || !galleryGrid || !galleryCount) return;
  galleryGrid.innerHTML = "";
  galleryCount.textContent = `${currentPhotos.length} photo${currentPhotos.length > 1 ? "s" : ""}`;
  currentPhotos.forEach((photo, index) => {
    const item = document.createElement("article");
    item.className = "gallery-item gallery-item--preview-only";
    const image = document.createElement("img");
    image.src = galleryPhotoSrc(photo, index);
    image.alt = `Photo ${index + 1}`;
    image.draggable = false;
    item.appendChild(image);
    galleryGrid.appendChild(item);
  });
}

function renderStudioVideos() {
  if (!currentEvent || !studioVideoGrid || !studioVideoCount) return;
  studioVideoGrid.innerHTML = "";
  const n = currentVideos.length;
  studioVideoCount.textContent = `${n} vidéo${n !== 1 ? "s" : ""}`;
  currentVideos.forEach((clip, idx) => {
    const item = document.createElement("article");
    item.className = "gallery-item gallery-item-video";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", "Lire la vidéo " + (idx + 1));
    const thumb = document.createElement("video");
    thumb.src = clip.url;
    thumb.muted = true;
    thumb.playsInline = true;
    thumb.setAttribute("playsinline", "");
    thumb.setAttribute("webkit-playsinline", "");
    thumb.preload = "metadata";
    thumb.className = "gallery-video-thumb";
    item.appendChild(thumb);
    const badge = document.createElement("span");
    badge.className = "gallery-video-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "▶";
    item.appendChild(badge);
    bindTapOrClick(item, function () {
      openStudioVideoModal(clip);
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openStudioVideoModal(clip);
      }
    });
    studioVideoGrid.appendChild(item);
  });
}

function openStudioVideoModal(clip) {
  if (!studioVideoModal || !studioVideoModalPlayer || !clip || !clip.url) return;
  studioVideoModalPlayer.src = clip.url;
  try {
    studioVideoModalPlayer.play();
  } catch {
    /* pass */
  }
  studioVideoModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeStudioVideoModal() {
  if (studioVideoModalPlayer) {
    studioVideoModalPlayer.pause();
    studioVideoModalPlayer.removeAttribute("src");
    try {
      studioVideoModalPlayer.load();
    } catch {
      /* pass */
    }
  }
  if (studioVideoModal) studioVideoModal.hidden = true;
  document.body.style.overflow = "";
}

if (studioVideoModalClose) bindTapOrClick(studioVideoModalClose, closeStudioVideoModal);
if (studioVideoModalBackdrop) {
  studioVideoModalBackdrop.addEventListener("click", closeStudioVideoModal);
  studioVideoModalBackdrop.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      closeStudioVideoModal();
    },
    { passive: false }
  );
}

function mergeUploadedIfMissing(uploaded) {
  if (!uploaded || !uploaded.filename || !currentEvent) return;
  if (currentPhotos.some((p) => p.filename === uploaded.filename)) return;
  const row = {
    id: uploaded.id,
    filename: uploaded.filename,
    createdAt: uploaded.createdAt || new Date().toISOString(),
    url: uploaded.url,
  };
  currentPhotos = [row, ...currentPhotos.filter((p) => p.filename !== row.filename)];
  renderGallery();
}

async function refreshGallery() {
  if (!currentEvent) return;
  currentPhotos = await getEventPhotos(currentEvent.id);
  renderGallery();
  try {
    currentVideos = await getEventVideos(currentEvent.id);
  } catch (vidErr) {
    console.warn("refreshGallery: videos", vidErr);
    currentVideos = [];
  }
  renderStudioVideos();
}

async function updateGalleryQr() {
  if (!currentEvent) return;
  if (!galleryQrImage || !galleryLink) return;
  const data = await getGalleryQr(currentEvent.id);
  galleryQrImage.src = data.qrDataUrl;
  galleryLink.href = data.galleryUrl;
}

/** Chaîne .then (pas async/await) pour garder le geste utilisateur aussi proche que possible de getUserMedia (Safari PWA / iPad). */
function startCamera() {
  if (filePickSession) {
    setFeedback("Terminez la série de selfies ou rechargez la page.", "error");
    return;
  }
  if (!hasValidAccess) {
    setFeedback("Accès non valide : ouvrez le studio avec le lien ou le jeton fourni.", "error");
    return;
  }
  if (mediaStream) {
    setFeedback("Camera deja active.", "success");
    updateStudioCaptureUi();
    return;
  }
  if (isCameraStartPending) {
    return;
  }
  isCameraStartPending = true;
  updateStudioCaptureUi();
  patchMediaDevicesIfNeeded();
  getSelfieCameraStream()
    .then(function (stream) {
      mediaStream = stream;
      if (cameraFeed) {
        cameraFeed.srcObject = stream;
      }
      return primeIosVideo(cameraFeed);
    })
    .then(function () {
      applyPreviewFilter();
      try {
        if (window.PhotoFaceGuide) {
          const faceOverlay = document.getElementById("face-overlay");
          const camZone = document.getElementById("camera-zone");
          window.PhotoFaceGuide.startFaceGuide(cameraFeed, null, null, faceOverlay, camZone);
        }
      } catch (guideErr) {
        console.warn("PhotoFaceGuide.startFaceGuide", guideErr);
      }
      setFeedback("Camera activee avec succes.", "success");
    })
    .catch(function (e) {
      console.warn("startCamera", e);
      exitCameraFullscreen();
      var msg = "Impossible d'activer la camera. Verifie les permissions.";
      var name = e && e.name ? String(e.name) : "";
      if (name === "InsecureContext" || !canUseCameraInThisContext()) {
        msg =
          "Sur iPad/iPhone : ouvrez cette page en HTTPS (certificat) ou via localhost — le navigateur bloque la camera en HTTP sur une adresse IP.";
      } else if (name === "NoGetUserMedia") {
        if (isLikelyIosStandaloneApp()) {
          msg =
            "Caméra indisponible en mode app : ouvrez ce lien dans Safari une fois pour autoriser le site, puis réessayez depuis l’icône, ou mettez à jour iPadOS.";
        } else if (isLikelyIosOrIpados()) {
          msg =
            "Caméra indisponible dans ce navigateur intégré (souvent les apps « Web Kiosk »). Causes fréquentes : page en http:// ou sur une IP sans HTTPS — utilisez une URL https:// valide ; l’app kiosque ne délègue pas getUserMedia / WebRTC — essayez Safari ou une autre app kiosque à jour ; dans les réglages de l’app, activez caméra / média si l’option existe.";
        } else {
          msg = "Camera indisponible : navigateur trop ancien, mode restreint ou API masquee.";
        }
      } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        msg = isLikelyIosStandaloneApp()
          ? "Caméra refusée : Réglages iPad → Photobooth (ou Safari) → autoriser Appareil photo pour ce site. Ou ouvrez studio.html dans Safari."
          : "Autorisation refusee : Reglages > Safari > (site) > Camera > Autoriser.";
      } else if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
        msg = "Camera : contraintes non supportees — reessayez ou mettez a jour iPadOS.";
      } else if (name === "AbortError") {
        msg = "Ouverture de la camera interrompue — reessayez.";
      }
      setFeedback(msg, "error");
    })
    .finally(function () {
      isCameraStartPending = false;
      updateStudioCaptureUi();
    });
}

async function captureSequence(opts) {
  opts = opts || {};
  const countdownAudio = opts.countdownAudio || null;

  if (!hasValidAccess || !currentEvent) return;
  if (filePickSession) {
    setFeedback("Terminez les selfies (bouton gris) avant la capture directe.", "error");
    return;
  }
  if (!mediaStream) {
    setFeedback("Ouvrez d’abord la caméra avec le bouton 1.", "error");
    return;
  }
  if (pendingSelfieCanvas) {
    setFeedback("Terminez la validation de la photo avant une nouvelle prise.", "error");
    return;
  }
  if (isCapturing) return;

  isCapturing = true;
  updateStudioCaptureUi();

  if (!isCameraFullscreen) {
    enterCameraFullscreen();
  }
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  try {
    const shotCount = getLayoutShots();
    const timerValue = Number(timerSelect.value);
    const shots = [];
    const layoutKey = layoutSelect.value;
    setFeedback(
      shotCount > 1 ? `Template ${layoutKey} : ${shotCount} photos à prendre.` : "Capture en cours...",
      ""
    );
    for (let index = 0; index < shotCount; index += 1) {
      await runCountdown(timerValue, index === 0 ? countdownAudio : null);
      const dimsOk = await waitForCameraDimensions(cameraFeed);
      if (!dimsOk) {
        throw new Error("CAMERA_NOT_READY");
      }
      await advanceVideoFrame(cameraFeed);
      shots.push(snapSingleFrame());
      setFeedback(`Prise ${index + 1}/${shotCount} capturee.`, "success");
      if (index < shotCount - 1) {
        await wait(250);
      }
    }
    const output = await composeShotsWithFaces(shots, layoutKey, currentEvent);
    pendingSelfieCanvas = cloneCanvasForPipeline(output);
    exitCameraFullscreen();
    setFeedback("Validez ou rejetez la photo.", "success");
    openValidateStepPanel();
  } catch (e) {
    console.warn("captureSequence", e);
    const notReady = e instanceof Error && e.message === "CAMERA_NOT_READY";
    if (notReady) {
      setFeedback("La caméra n’est pas prête (attente image). Réessayez dans une seconde.", "error");
    } else {
      setFeedback("Erreur pendant la capture photo.", "error");
    }
    exitCameraFullscreen();
  } finally {
    exitCameraFullscreen();
    isCapturing = false;
    updateStudioCaptureUi();
  }
}

async function setupEventSession() {
  const eventId = getCurrentEventId();
  if (!eventId) {
    if (studioEventMeta) studioEventMeta.textContent = "Aucun evenement selectionne.";
    setFeedback("Retourne a la gestion des evenements pour ouvrir une session.", "error");
    return false;
  }
  if (studioEventMeta) {
    studioEventMeta.textContent = "Chargement de l'evenement…";
  }
  try {
    currentEvent = await getEventById(eventId);
    sessionStorage.setItem(SESSION_EVENT_KEY, JSON.stringify(currentEvent));
    configureVideoStudioLink();
    if (studioEventMeta) {
      studioEventMeta.textContent = "Application proposée par Régis Pailler, pour IAHome.fr";
    }
  } catch (e) {
    const aborted = e && e.name === "AbortError";
    const invalid = e && e.name === "InvalidEventResponse";
    if (studioEventMeta) {
      studioEventMeta.textContent = aborted
        ? "Delai depasse — serveur injoignable."
        : invalid
          ? "Evenement introuvable ou reponse invalide."
          : "Evenement introuvable.";
    }
    setFeedback(
      aborted
        ? "Verifiez que le photobooth tourne (port 7885) et le reseau, puis rechargez."
        : invalid
          ? "L'API ne renvoie pas l'evenement attendu (proxy ou URL). Revenez a l'accueil."
          : "Impossible de charger la session evenement.",
      "error"
    );
    return false;
  }
  try {
    await refreshGallery();
    await updateGalleryQr();
    if (currentPhotos.length > 0) {
      await refreshPickupUi(currentPhotos[0].filename);
    }
  } catch (err) {
    console.warn("setupEventSession secondary", err);
    setFeedback("Session ouverte : galerie ou liens partiellement indisponibles.", "error");
  }
  return true;
}

function getChoicePageUrl() {
  const eventId = getCurrentEventId();
  const token = readTokenFromUrl();
  const url = new URL("./index.html", window.location.href);
  if (eventId) url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

function goBackToChoice() {
  closeValidateStepPanel();
  var url = getChoicePageUrl();
  if (typeof window.navigateInApp === "function") {
    window.navigateInApp(url);
  } else {
    window.location.href = url;
  }
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(goBackToChoice, INACTIVITY_MS);
}

function setupInactivityListener() {
  const events = ["click", "touchstart", "touchmove", "scroll", "keydown"];
  events.forEach((ev) => document.addEventListener(ev, resetInactivityTimer, { passive: true }));
  resetInactivityTimer();
}

function configureBackLink() {
  if (backToEvents) backToEvents.href = getChoicePageUrl();
}

function configureVideoStudioLink() {
  if (!studioOpenVideoStudio) return;
  const eventId = getCurrentEventId();
  const token = readTokenFromUrl();
  const url = new URL("./video-studio.html", window.location.href);
  if (eventId) url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  studioOpenVideoStudio.href = url.toString();
}

function initStudioPage() {
  try {
    hasValidAccess = validateAccessToken();
    configureBackLink();
    configureVideoStudioLink();
    void setupEventSession().catch(function (err) {
      console.warn("setupEventSession", err);
      if (studioEventMeta) {
        studioEventMeta.textContent = "Erreur de chargement. Rechargez la page.";
      }
      setFeedback("Une erreur empeche le chargement. Rechargez.", "error");
    });
    setupInactivityListener();
    if (filterSelect) filterSelect.addEventListener("change", applyPreviewFilter);
    if (captureBtn) captureBtn.addEventListener("click", handleCaptureButtonClick);
    if (activateCameraBtn) activateCameraBtn.addEventListener("click", () => startCamera());
    if (cameraActivateHint) {
      cameraActivateHint.addEventListener("click", function (e) {
        e.stopPropagation();
        startCamera();
      });
      cameraActivateHint.addEventListener(
        "touchend",
        function (e) {
          if (!document.documentElement.classList.contains("ipad-studio")) return;
          if (mediaStream || isCameraStartPending || cameraActivateHint.disabled) return;
          e.preventDefault();
          e.stopPropagation();
          startCamera();
        },
        { passive: false }
      );
    }
    if (fileCaptureBtn) fileCaptureBtn.addEventListener("click", () => void handleFileCaptureClick());
    updateStudioCaptureUi();
  } catch (e) {
    console.warn("initStudioPage", e);
    if (studioEventMeta) {
      studioEventMeta.textContent = "Erreur au chargement. Rechargez la page ou revenez a l'accueil.";
    }
    setFeedback(e instanceof Error ? e.message : String(e), "error");
  }
}

initStudioPage();

function tryEnterDomFullscreenCameraZone() {
  if (!cameraZone) return;
  var req = cameraZone.requestFullscreen || cameraZone.webkitRequestFullscreen;
  if (typeof req !== "function") return;
  try {
    var p = req.call(cameraZone);
    if (p && typeof p.then === "function") p.catch(function () {});
  } catch (e) {
    /* iPad / Safari : refus, API absente ou pas dans un geste utilisateur */
  }
}

function syncExitDomFullscreen() {
  if (typeof document === "undefined") return;
  var active = document.fullscreenElement || document.webkitFullscreenElement;
  if (!active) return;
  var exitFn = document.exitFullscreen || document.webkitExitFullscreen;
  if (typeof exitFn !== "function") return;
  try {
    var p = exitFn.call(document);
    if (p && typeof p.then === "function") p.catch(function () {});
  } catch (e) {
    /* ignore */
  }
}

function enterCameraFullscreen() {
  if (isCameraFullscreen) return;
  isCameraFullscreen = true;
  document.documentElement.classList.add("camera-zone-fullscreen-html");
  document.body.classList.add("camera-zone-fullscreen");
  try {
    window.scrollTo(0, 0);
  } catch (e) {
    /* ignore */
  }
  /* Même synchrone que le clic : avant tout await dans captureSequence (activation utilisateur). */
  tryEnterDomFullscreenCameraZone();
  if (captureLayer && captureCtx) {
    ensureCaptureLayerSize();
    captureCtx.clearRect(0, 0, captureLayer.width, captureLayer.height);
  }
}

function exitCameraFullscreen() {
  if (!isCameraFullscreen) return;
  isCameraFullscreen = false;
  document.documentElement.classList.remove("camera-zone-fullscreen-html");
  document.body.classList.remove("camera-zone-fullscreen");
  syncExitDomFullscreen();
}

async function handleCaptureButtonClick() {
  if (!hasValidAccess) {
    setFeedback("Accès non valide : ouvrez le studio avec le lien ou le jeton fourni.", "error");
    return;
  }
  if (filePickSession) {
    setFeedback("Terminez les selfies avec le bouton gris, ou rechargez la page.", "error");
    return;
  }
  if (!mediaStream) {
    setFeedback("Ouvrez d’abord la caméra avec le bouton 1.", "error");
    return;
  }
  if (!currentEvent) {
    setFeedback("Aucun evenement selectionne.", "error");
    return;
  }
  const countdown = Number((timerSelect && timerSelect.value) || 8) || 8;
  const countdownAudio = startCountdownAudio(countdown);
  await captureSequence({ countdownAudio });
}

window.addEventListener("pageshow", function (ev) {
  if (ev.persisted) {
    exitCameraFullscreen();
  }
});

if (copyPickupUrlBtn) {
  copyPickupUrlBtn.addEventListener("click", async () => {
    const url = (lastPickupUrl || "").trim();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Lien copie dans le presse-papiers.", "success");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        setFeedback("Lien copie (navigateur ancien).", "success");
      } catch {
        setFeedback("Copie impossible — scannez le QR.", "error");
      }
    }
  });
}
