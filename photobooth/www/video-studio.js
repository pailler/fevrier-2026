/**
 * Courte vidéo souvenir : MediaRecorder → data URL → POST /api/events/:id/videos
 */
const page = document.querySelector(".page");
const authBanner = document.getElementById("auth-banner");
const metaEl = document.getElementById("video-studio-meta");
const hintEl = document.getElementById("video-hint");
const startCamBtn = document.getElementById("video-start-camera");
const recordBtn = document.getElementById("video-record");
const stopBtn = document.getElementById("video-stop");
const preview = document.getElementById("video-preview");
const feedbackEl = document.getElementById("video-feedback");
const recordBadge = document.getElementById("video-record-badge");
const recordSecondsEl = document.getElementById("video-record-seconds");
const backLink = document.getElementById("video-back");
const galleryLink = document.getElementById("video-link-gallery");

const MODULE_ID = "photobooth";
const SESSION_EVENT_KEY = "photobooth_current_event";
const MAX_RECORD_MS = 15000;
const INACTIVITY_MS = 120 * 1000;

let hasValidAccess = false;
let inactivityTimer = null;
let currentEvent = null;
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let selectedMime = "";
let recordStartedAt = 0;
let recordTimerId = null;
let maxDurationTimerId = null;
let isUploading = false;

function setFeedback(message = "", type = "") {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.className = "feedback";
  if (type) feedbackEl.classList.add(type);
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
    } catch {
      /* noop */
    }
    return null;
  }

  try {
    const decoded = raw.includes("%")
      ? (() => {
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        })()
      : raw;
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
  } catch {
    /* pass */
  }
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

  function doFetch() {
    return fetch(url, fetchOpts).then(function (response) {
      return response
        .json()
        .catch(function () {
          return {};
        })
        .then(function (data) {
          if (!response.ok) throw new Error(data.error || "Erreur API");
          return data;
        });
    });
  }

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

function getCurrentEventId() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("eventId");
  if (fromQuery) return fromQuery;
  try {
    const inSession = JSON.parse(sessionStorage.getItem(SESSION_EVENT_KEY) || "null");
    if (inSession && inSession.id) return inSession.id;
  } catch {
    return null;
  }
  return null;
}

function getChoicePageUrl() {
  const eventId = getCurrentEventId();
  const token = readTokenFromUrl();
  const url = new URL("./index.html", window.location.href);
  if (eventId) url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

function configureNavLinks() {
  const eventId = getCurrentEventId();
  const token = readTokenFromUrl();
  if (backLink) backLink.href = getChoicePageUrl();
  if (galleryLink && eventId) {
    const g = new URL("./gallery.html", window.location.href);
    g.searchParams.set("eventId", eventId);
    if (token) g.searchParams.set("token", token);
    galleryLink.href = g.toString();
  }
}

function pickRecorderMime() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
  }
  return "";
}

function isLocalRuntime() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isPhotoboothNativeApp() {
  try {
    var C = window.Capacitor;
    if (C && typeof C.isNativePlatform === "function" && C.isNativePlatform()) {
      return true;
    }
  } catch (e) {
    /* noop */
  }
  try {
    var p = String(window.location.protocol || "").toLowerCase();
    if (p === "capacitor:" || p === "ionic:") return true;
  } catch (e2) {
    /* noop */
  }
  return false;
}

function canUseCameraInThisContext() {
  if (isPhotoboothNativeApp()) return true;
  if (typeof window.isSecureContext !== "boolean") return true;
  if (window.isSecureContext) return true;
  return isLocalRuntime();
}

/**
 * iPad / Safari : parfois `mediaDevices.getUserMedia` n'est pas exposé tant qu'on n'a pas
 * branché l'API héritée `webkitGetUserMedia`, ou l'objet `mediaDevices` est partiel.
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

function isLikelyIosStandaloneApp() {
  try {
    if (navigator.standalone === true) return true;
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) {
      const ua = navigator.userAgent || "";
      if (/iPad|iPhone|iPod/i.test(ua)) return true;
    }
  } catch (e) {
    /* noop */
  }
  return false;
}

/**
 * Contraintes audio explicites : certains modes WebKit (PWA écran d'accueil) gèrent mieux
 * micro + caméra quand l'audio n'est pas seulement `true`.
 */
function preferredAudioConstraints() {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };
}

async function getVideoStudioCameraStream() {
  const gum = ensureGetUserMedia();
  if (!gum) {
    const err = new Error("NO_GUM");
    err.name = "NoGetUserMedia";
    throw err;
  }
  if (!canUseCameraInThisContext()) {
    const err = new Error("INSECURE");
    err.name = "InsecureContext";
    throw err;
  }
  /*
   * App iPad « sur l'écran d'accueil » (WebKit standalone) : demander caméra + micro d'un coup
   * échoue souvent (aucune piste vidéo). Toujours ouvrir la caméra SANS audio d'abord, puis
   * joindre le micro dans un 2e getUserMedia — la caméra s'active comme dans Safari.
   */
  let lastErr = null;
  let vStream = null;
  const videoAttempts = [
    { audio: false, video: { facingMode: "user" } },
    { audio: false, video: true },
  ];
  for (let i = 0; i < videoAttempts.length; i += 1) {
    try {
      vStream = await gum(videoAttempts[i]);
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!vStream) {
    throw lastErr || new Error("CAMERA_FAILED");
  }
  const audioTries = [{ audio: true, video: false }, { audio: preferredAudioConstraints(), video: false }];
  for (let j = 0; j < audioTries.length; j += 1) {
    try {
      const aOnly = await gum(audioTries[j]);
      const tracks = aOnly.getAudioTracks();
      for (let k = 0; k < tracks.length; k += 1) {
        vStream.addTrack(tracks[k]);
      }
      break;
    } catch (ae) {
      lastErr = ae;
      console.warn("getVideoStudioCameraStream: micro optionnel", ae);
    }
  }
  return vStream;
}

async function primeIosVideoPreview(videoEl) {
  if (!videoEl) return;
  videoEl.setAttribute("playsinline", "");
  videoEl.setAttribute("webkit-playsinline", "");
  videoEl.muted = true;
  videoEl.defaultMuted = true;
  try {
    await videoEl.play();
  } catch {
    await new Promise(function (r) {
      setTimeout(r, 120);
    });
    try {
      await videoEl.play();
    } catch {
      /* pass */
    }
  }
}

async function setupEventSession() {
  const eventId = getCurrentEventId();
  if (!eventId) {
    if (metaEl) metaEl.textContent = "Aucun evenement selectionne.";
    setFeedback("Retournez à l’accueil pour choisir un événement.", "error");
    return false;
  }
  if (metaEl) metaEl.textContent = "Chargement de l'evenement…";
  try {
    const data = await fetchJson(`/api/events/${encodeURIComponent(eventId)}`, {
      timeoutMs: EVENT_FETCH_TIMEOUT_MS,
    });
    if (!data || !data.event || typeof data.event.id !== "string" || !data.event.id) {
      const err = new Error("INVALID_EVENT");
      err.name = "InvalidEventResponse";
      throw err;
    }
    currentEvent = data.event;
    sessionStorage.setItem(SESSION_EVENT_KEY, JSON.stringify(currentEvent));
    if (metaEl) metaEl.textContent = currentEvent.name + " — jusqu'à 15 s";
    configureNavLinks();
    return true;
  } catch (e) {
    const aborted = e && e.name === "AbortError";
    const invalid = e && e.name === "InvalidEventResponse";
    if (metaEl) {
      metaEl.textContent = aborted
        ? "Delai depasse — serveur injoignable."
        : invalid
          ? "Evenement introuvable ou reponse invalide."
          : "Evenement introuvable.";
    }
    setFeedback(
      aborted
        ? "Verifiez le serveur photobooth et le reseau, puis rechargez."
        : invalid
          ? "Revenez a l'accueil et rouvrez l'evenement."
          : "Impossible de charger l’événement.",
      "error"
    );
    return false;
  }
}

function stopTracks() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (preview) {
    preview.srcObject = null;
  }
}

function clearRecordTimers() {
  if (recordTimerId) {
    clearInterval(recordTimerId);
    recordTimerId = null;
  }
  if (maxDurationTimerId) {
    clearTimeout(maxDurationTimerId);
    maxDurationTimerId = null;
  }
}

function finishRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    try {
      mediaRecorder.stop();
    } catch {
      /* pass */
    }
  }
}

async function startCamera() {
  if (!hasValidAccess || !currentEvent) return;
  setFeedback("");
  startCamBtn.disabled = true;
  try {
    patchMediaDevicesIfNeeded();
    stopTracks();
    mediaStream = await getVideoStudioCameraStream();
    preview.srcObject = mediaStream;
    await primeIosVideoPreview(preview);
    recordBtn.disabled = false;
    var hasAudio = mediaStream && mediaStream.getAudioTracks().length > 0;
    if (hintEl) {
      if (hasAudio) {
        hintEl.textContent =
          "Caméra et micro prêts. Touchez « Enregistrer » pour démarrer.";
      } else if (isLikelyIosStandaloneApp()) {
        hintEl.textContent =
          "Caméra prête — micro non joint (autorisez le micro si demandé, ou en Réglages). Touchez « Enregistrer » ; la vidéo peut être sans son.";
      } else {
        hintEl.textContent =
          "Caméra prête (micro non actif sur cet appareil — vidéo sans son). Touchez « Enregistrer ».";
      }
    }
    startCamBtn.textContent = "Caméra active — relancer";
    startCamBtn.disabled = false;
  } catch (e) {
    console.warn("startCamera", e);
    startCamBtn.disabled = false;
    var name = e && e.name ? String(e.name) : "";
    var msg =
      "Impossible d’accéder à la caméra ou au micro. Vérifiez les autorisations du navigateur.";
    if (name === "InsecureContext" || !canUseCameraInThisContext()) {
      msg =
        "Sur iPad/iPhone : utilisez HTTPS ou localhost — la caméra est bloquée en HTTP sur une adresse IP. En app native Photobooth (Capacitor), utilisez npm run cap:sync:lan avec le serveur joignable.";
    } else if (name === "NoGetUserMedia") {
      msg =
        "Caméra indisponible sur ce navigateur ou ce mode d’affichage. Sur iPad : utilisez Safari, désactivez « Version bureau » pour le site, ou rouvrez depuis Safari si l’app est sur l’écran d’accueil. Vérifiez iPadOS à jour.";
    } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      msg = isLikelyIosStandaloneApp()
        ? "Caméra ou micro refusés. Réglages iPad : Photobooth (app écran d’accueil) ou Safari → autoriser Appareil photo et Microphone pour ce site. Vous pouvez aussi ouvrir le lien dans Safari."
        : "Autorisation refusée : Réglages > Safari > (site) > Caméra / Micro.";
    } else if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
      msg = "Caméra : contraintes non prises en charge — réessayez ou mettez à jour iPadOS.";
    }
    setFeedback(msg, "error");
  }
}

function onRecorderStop() {
  clearRecordTimers();
  recordBadge.hidden = true;
  stopBtn.disabled = true;
  recordBtn.disabled = !mediaStream;
  if (!isUploading && recordedChunks.length) {
    const firstType =
      recordedChunks[0] && recordedChunks[0].type
        ? recordedChunks[0].type
        : (selectedMime && selectedMime.split(";")[0]) || "video/webm";
    const blob = new Blob(recordedChunks, { type: firstType });
    void uploadBlob(blob);
  }
  recordedChunks = [];
  mediaRecorder = null;
}

function uploadBlob(blob) {
  if (!currentEvent || !blob.size) return Promise.resolve();
  isUploading = true;
  recordBtn.disabled = true;
  stopBtn.disabled = true;
  setFeedback("Envoi de la vidéo…", "");
  return new Promise(function (resolve) {
    const reader = new FileReader();
    reader.onloadend = function () {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        isUploading = false;
        setFeedback("Lecture du fichier impossible.", "error");
        recordBtn.disabled = !mediaStream;
        resolve();
        return;
      }
      fetchJson(`/api/events/${encodeURIComponent(currentEvent.id)}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoDataUrl: dataUrl }),
      })
        .then(function () {
          setFeedback("Vidéo enregistrée. Retrouvez-la dans la galerie (section Vidéos).", "success");
        })
        .catch(function (err) {
          setFeedback(err instanceof Error ? err.message : "Envoi échoué", "error");
        })
        .finally(function () {
          isUploading = false;
          recordBtn.disabled = !mediaStream;
          resolve();
        });
    };
    reader.onerror = function () {
      isUploading = false;
      setFeedback("Erreur lecture vidéo.", "error");
      recordBtn.disabled = !mediaStream;
      resolve();
    };
    reader.readAsDataURL(blob);
  });
}

function startRecording() {
  if (!mediaStream || !currentEvent) return;
  if (typeof MediaRecorder === "undefined") {
    setFeedback("Enregistrement vidéo non supporté sur ce navigateur.", "error");
    return;
  }
  recordedChunks = [];
  selectedMime = pickRecorderMime();
  try {
    mediaRecorder = selectedMime
      ? new MediaRecorder(mediaStream, { mimeType: selectedMime })
      : new MediaRecorder(mediaStream);
  } catch (e) {
    console.warn("MediaRecorder", e);
    try {
      mediaRecorder = new MediaRecorder(mediaStream);
    } catch (e2) {
      setFeedback("Impossible de démarrer l’enregistrement.", "error");
      return;
    }
  }
  mediaRecorder.ondataavailable = function (e) {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = onRecorderStop;
  try {
    mediaRecorder.start(200);
  } catch (e) {
    setFeedback("Démarrage enregistrement impossible.", "error");
    mediaRecorder = null;
    return;
  }
  recordBtn.disabled = true;
  stopBtn.disabled = false;
  recordBadge.hidden = false;
  recordStartedAt = Date.now();
  recordSecondsEl.textContent = "0";
  recordTimerId = setInterval(function () {
    const s = Math.floor((Date.now() - recordStartedAt) / 1000);
    recordSecondsEl.textContent = String(Math.min(s, MAX_RECORD_MS / 1000));
  }, 250);
  maxDurationTimerId = setTimeout(function () {
    finishRecording();
  }, MAX_RECORD_MS);
  setFeedback("Enregistrement… Touchez « Arrêter » ou attendez la fin automatique.", "");
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(function () {
    var url = getChoicePageUrl();
    if (typeof window.navigateInApp === "function") window.navigateInApp(url);
    else window.location.href = url;
  }, INACTIVITY_MS);
}

function setupInactivity() {
  ["click", "touchstart", "keydown"].forEach(function (ev) {
    document.addEventListener(
      ev,
      function () {
        resetInactivityTimer();
      },
      { passive: true }
    );
  });
  resetInactivityTimer();
}

function initVideoStudio() {
  try {
    patchMediaDevicesIfNeeded();
    hasValidAccess = validateAccessToken();
    configureNavLinks();
    void setupEventSession()
      .then(function (ok) {
        if (ok && hasValidAccess) setupInactivity();
      })
      .catch(function (err) {
        console.warn("setupEventSession", err);
        if (metaEl) metaEl.textContent = "Erreur de chargement. Rechargez la page.";
        setFeedback("Une erreur empeche le chargement. Rechargez.", "error");
      });
    if (startCamBtn) {
      startCamBtn.addEventListener("click", function () {
        void startCamera();
      });
      startCamBtn.addEventListener(
        "touchend",
        function (e) {
          e.preventDefault();
          void startCamera();
        },
        { passive: false }
      );
    }
    if (recordBtn) {
      recordBtn.addEventListener("click", function () {
        if (!hasValidAccess || !currentEvent) return;
        startRecording();
      });
    }
    if (stopBtn) {
      stopBtn.addEventListener("click", function () {
        finishRecording();
      });
    }
    if (typeof MediaRecorder === "undefined") {
      if (hintEl) {
        hintEl.textContent =
          "Votre navigateur ne permet pas d’enregistrer une vidéo ici. Essayez Chrome ou Edge à jour, ou un autre appareil.";
      }
      if (recordBtn) recordBtn.disabled = true;
    }
  } catch (e) {
    console.warn("initVideoStudio", e);
    if (metaEl) metaEl.textContent = "Erreur au chargement. Rechargez la page.";
    setFeedback(e instanceof Error ? e.message : String(e), "error");
  }
}

initVideoStudio();

window.addEventListener("beforeunload", function () {
  stopTracks();
});
