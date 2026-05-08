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
const layoutSelect = document.getElementById("layout-select");
const timerSelect = document.getElementById("timer-select");
/** Défaut si le select est absent ou valeur invalide (aligné sur l’option `selected` du HTML). */
const DEFAULT_STUDIO_COUNTDOWN_SEC = 10;
const filterSelect = document.getElementById("filter-select");
const propSelect = document.getElementById("prop-select");

const countdownOverlay = document.getElementById("countdown-overlay");

const cameraZone = document.getElementById("camera-zone");
const cameraTapHint = document.getElementById("camera-tap-hint");

const CAPTURE_LEDE_IDLE = "Décompte puis appareil photo (captures natives)";
const CAPTURE_LEDE_MULTI_PREFIX = "Photo suivante";

const validateStepPanel = document.getElementById("validate-step-panel");
const validateStepPendingOnly = document.getElementById("validate-step-pending-only");
const validateStepPreview = document.getElementById("validate-step-preview");
const validateStepConfirmBtn = document.getElementById("validate-step-confirm");
const validateStepCancelBtn = document.getElementById("validate-step-cancel");
const fileCameraInput = document.getElementById("studio-camera-file");

function updateCaptureButtonLede(text) {
  if (!captureBtn) return;
  var lede = captureBtn.querySelector(".btn-activate-camera-lede");
  if (lede) lede.textContent = text || CAPTURE_LEDE_IDLE;
}

function updateCameraTapHintUi() {
  if (cameraTapHint) {
    cameraTapHint.hidden = false;
    cameraTapHint.disabled = !!nativePickLocked;
  }
  if (cameraZone) {
    cameraZone.setAttribute(
      "aria-label",
      "Lance le compte à rebours puis l’appareil photo du système."
    );
  }
  if (filePickSession && filePickSession.shots.length > 0) {
    updateCaptureButtonLede(
      CAPTURE_LEDE_MULTI_PREFIX +
        " (" +
        (filePickSession.shots.length + 1) +
        "/" +
        filePickSession.total +
        ")"
    );
  } else {
    updateCaptureButtonLede(CAPTURE_LEDE_IDLE);
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
let lastCaptureDataUrl = "";
let lastPickupUrl = "";
let isCapturing = false;
/** Prise via input file + capture : plusieurs taps pour strip/grid (iOS exige un geste par ouverture). */
let filePickSession = null;
let currentPhotos = [];
let currentVideos = [];
/** Évite deux ouvertures « fichier » concurrentes. */
let nativePickLocked = false;

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

function isLikelyIosStandaloneApp() {
  try {
    if (navigator.standalone === true) return true;
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch (e) {
    /* noop */
  }
  return false;
}

/** iPhone / iPad / iPadOS (y compris « MacIntel » tactile). */
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

/**
 * Après un décompte asynchrone, WebKit iOS n’ouvre souvent plus le file picker sans nouveau geste utilisateur.
 */
function needsDeferredFilePickerGesture() {
  try {
    if (isLikelyIosStandaloneApp()) return true;
    if (isLikelyIosOrIpados()) return true;
  } catch (e) {
    /* noop */
  }
  return false;
}

function waitForContinueTapToOpenCamera() {
  return new Promise(function (resolve, reject) {
    var overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:1rem;box-sizing:border-box;";
    var panel = document.createElement("div");
    panel.style.cssText =
      "background:#1e293b;color:#f8fafc;padding:1.25rem 1.5rem;border-radius:14px;max-width:22rem;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.35);";
    var title = document.createElement("p");
    title.style.cssText = "margin:0 0 1rem;font-weight:600;";
    title.textContent = "Prêt ?";
    var hint = document.createElement("p");
    hint.style.cssText = "margin:0 0 1.15rem;font-size:.9rem;opacity:.9;line-height:1.4;";
    hint.textContent =
      "Sur iPad / iPhone, touchez le bouton ci-dessous pour ouvrir la caméra (requis après le décompte).";
    var row = document.createElement("div");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;";
    var openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Ouvrir la caméra";
    openBtn.className = "btn-capture";
    openBtn.style.cssText = "min-width:10rem;";
    var cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Annuler";
    cancelBtn.className = "btn-secondary";
    function close() {
      try {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      } catch (e) {
        /* noop */
      }
    }
    openBtn.addEventListener("click", function () {
      close();
      resolve();
    });
    cancelBtn.addEventListener("click", function () {
      close();
      var err = new Error("USER_CANCEL");
      err.name = "AbortError";
      reject(err);
    });
    row.appendChild(openBtn);
    row.appendChild(cancelBtn);
    panel.appendChild(title);
    panel.appendChild(hint);
    panel.appendChild(row);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
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

function resetNativeCaptureSessionUi() {
  nativePickLocked = false;
  updateCameraTapHintUi();
}

async function handleFileCaptureClick() {
  if (!hasValidAccess || !currentEvent) {
    setFeedback("Accès non valide : ouvrez le studio avec le lien ou le jeton fourni.", "error");
    return;
  }
  if (!fileCameraInput) return;
  if (pendingSelfieCanvas) {
    setFeedback("Terminez la validation de la photo avant une nouvelle prise.", "error");
    return;
  }
  if (nativePickLocked) return;
  if (isCapturing && !filePickSession) return;

  var shotCount = getLayoutShots();
  var layoutKey = layoutSelect.value;

  if (!filePickSession) {
    filePickSession = { shots: [], total: shotCount, layoutKey: layoutKey };
    isCapturing = true;
  }

  nativePickLocked = true;
  updateCameraTapHintUi();

  try {
    if (filePickSession.shots.length === 0) {
      setFeedback("Préparation…", "");
    } else {
      setFeedback(
        "Photo " + (filePickSession.shots.length + 1) + "/" + filePickSession.total + " — préparation…",
        ""
      );
    }
    var countdownBeforeEl = document.getElementById("countdown-after-open");
    var wantCountdown = !countdownBeforeEl || countdownBeforeEl.checked;
    if (wantCountdown) {
      var timerValueForFile =
        Number((timerSelect && timerSelect.value) || DEFAULT_STUDIO_COUNTDOWN_SEC) ||
        DEFAULT_STUDIO_COUNTDOWN_SEC;
      var cdAudioFile = startCountdownAudio(timerValueForFile);
      await runCountdown(timerValueForFile, cdAudioFile);
      if (needsDeferredFilePickerGesture()) {
        await waitForContinueTapToOpenCamera();
      }
    }
    var file = await pickOneImageFile();
    var shot = await fileToShotCanvas(file);
    filePickSession.shots.push(shot);

    if (filePickSession.shots.length < filePickSession.total) {
      setFeedback(
        "Photo " +
          filePickSession.shots.length +
          "/" +
          filePickSession.total +
          " reçue. Touchez encore la zone ou le bouton vert pour la suite.",
        "success"
      );
      nativePickLocked = false;
      updateCameraTapHintUi();
      return;
    }

    var output = await composeShotsWithFaces(filePickSession.shots, filePickSession.layoutKey, currentEvent);
    pendingSelfieCanvas = cloneCanvasForPipeline(output);
    filePickSession = null;
    resetNativeCaptureSessionUi();
    isCapturing = false;
    setFeedback("Validez ou rejetez la photo.", "success");
    openValidateStepPanel();
  } catch (e) {
    console.warn("handleFileCaptureClick", e);
    filePickSession = null;
    resetNativeCaptureSessionUi();
    isCapturing = false;
    var msg = "Impossible d'utiliser la photo.";
    if (e && e.message === "USER_CANCEL") {
      msg = "Annulé.";
    } else if (e && e.message === "NO_FILE") {
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
    if (captureBtn) captureBtn.addEventListener("click", () => void handleFileCaptureClick());
    updateCameraTapHintUi();
  } catch (e) {
    console.warn("initStudioPage", e);
    if (studioEventMeta) {
      studioEventMeta.textContent = "Erreur au chargement. Rechargez la page ou revenez a l'accueil.";
    }
    setFeedback(e instanceof Error ? e.message : String(e), "error");
  }
}

initStudioPage();

function handleCameraZoneInteraction(e) {
  e.preventDefault();
  e.stopPropagation();
  void handleFileCaptureClick();
}

if (cameraTapHint) {
  cameraTapHint.addEventListener("click", function (e) {
    e.stopPropagation();
    void handleFileCaptureClick();
  });
  cameraTapHint.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      void handleFileCaptureClick();
    },
    { passive: false }
  );
}

if (cameraZone) {
  cameraZone.addEventListener("click", handleCameraZoneInteraction);
  cameraZone.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      handleCameraZoneInteraction(e);
    },
    { passive: false }
  );
  cameraZone.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    handleCameraZoneInteraction(e);
  });
}

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
