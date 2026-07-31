const titleNode = document.getElementById("smartphone-video-title");
const countNode = document.getElementById("smartphone-video-count");
const gridNode = document.getElementById("smartphone-video-grid");
const uploadBtn = document.getElementById("smartphone-video-upload-btn");
const fileInput = document.getElementById("smartphone-video-file-input");
const feedbackNode = document.getElementById("smartphone-video-upload-feedback");
const backLink = document.getElementById("smartphone-video-back-gallery");

const GALLERY_JWT_STORAGE = "photobooth_gallery_jwt";
const GALLERY_EVENT_ID_STORAGE = "photobooth_gallery_event_id";
const MAX_VIDEO_FILE_BYTES = 300 * 1024 * 1024;
/** Au-delà, pas de repli data URL (trop lourd pour la mémoire du téléphone). */
const DATA_URL_FALLBACK_MAX_BYTES = 32 * 1024 * 1024;
/** Cloudflare / mobile : morceaux ~512–768 Ko selon appareil. */
const DEFAULT_VIDEO_CHUNK_SIZE = 768 * 1024;
const ANDROID_VIDEO_CHUNK_SIZE = 512 * 1024;
const CHUNKED_UPLOAD_THRESHOLD = 70 * 1024 * 1024;
const CHUNK_UPLOAD_MAX_ATTEMPTS = 4;
const CHUNK_UPLOAD_PAUSE_MS = 150;
const ANDROID_CHUNK_UPLOAD_PAUSE_MS = 80;
/** Doit rester ≤ limite serveur (640) — 300 Mo ÷ 512 Ko ≈ 600. */
const MAX_UPLOAD_CHUNKS = 640;

/** @type {Array<{ url: string, filename: string }>} */
let smartphoneVideos = [];
let lightboxIndex = 0;
let touchStartX = null;
/** @type {string | null} */
let pinnedEventId = null;

(function hoistGalleryParamsFromUrl() {
  try {
    var u = new URL(window.location.href);
    var eid = u.searchParams.get("eventId");
    if (eid) {
      pinnedEventId = eid;
      try {
        sessionStorage.setItem(GALLERY_EVENT_ID_STORAGE, eid);
      } catch (e) {}
    }
    var tk = u.searchParams.get("token");
    if (tk) {
      try {
        sessionStorage.setItem(GALLERY_JWT_STORAGE, tk);
      } catch (e) {}
      u.searchParams.delete("token");
      history.replaceState(
        null,
        "",
        u.pathname + (u.searchParams.toString() ? "?" + u.searchParams.toString() : "") + u.hash
      );
    }
  } catch (e) {}
})();

function getLightboxEl() {
  return document.getElementById("smartphone-video-lightbox");
}

function getEventId() {
  if (pinnedEventId) return pinnedEventId;
  try {
    var fromUrl = new URL(window.location.href).searchParams.get("eventId");
    if (fromUrl) {
      pinnedEventId = fromUrl;
      try {
        sessionStorage.setItem(GALLERY_EVENT_ID_STORAGE, fromUrl);
      } catch (e) {}
      return fromUrl;
    }
    var fromSess = sessionStorage.getItem(GALLERY_EVENT_ID_STORAGE);
    if (fromSess) {
      pinnedEventId = fromSess;
      return fromSess;
    }
  } catch (e) {}
  return null;
}

function getToken() {
  try {
    var fromSess = sessionStorage.getItem(GALLERY_JWT_STORAGE);
    if (fromSess) return fromSess;
  } catch (e) {}
  try {
    return new URL(window.location.href).searchParams.get("token") || "";
  } catch (e) {
    return "";
  }
}

function getMainGalleryUrl() {
  const eventId = getEventId();
  const token = getToken();
  const url = new URL("./gallery.html", window.location.href);
  if (eventId) url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

function setFeedback(text, isError) {
  if (!feedbackNode) return;
  feedbackNode.textContent = text || "";
  feedbackNode.classList.toggle("error", !!isError);
}

async function fetchJson(url, options) {
  const response = await fetch(url, Object.assign(
    { credentials: "same-origin", referrerPolicy: "no-referrer" },
    options || {}
  ));
  const data = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) throw new Error(data.error || "Erreur chargement");
  return data;
}

function normalizeStorageMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  const m = url.match(/^(\/storage\/events\/[^/]+\/(?:photos|videos|smartphone-videos|smartphone)\/)([\s\S]*)$/);
  if (!m) return url;
  let file = m[2];
  try {
    file = encodeURIComponent(decodeURIComponent(file));
  } catch {
    try {
      file = encodeURIComponent(file);
    } catch {
      return url;
    }
  }
  return m[1] + file;
}

function bindTapOrClick(el, handler) {
  var startX = 0;
  var startY = 0;
  var moved = false;
  var lastTouchEnd = 0;
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
      if (Math.abs(e.touches[0].clientX - startX) > 14 || Math.abs(e.touches[0].clientY - startY) > 14) {
        moved = true;
      }
    },
    { passive: true }
  );
  el.addEventListener(
    "touchend",
    function (e) {
      if (moved) return;
      e.preventDefault();
      lastTouchEnd = Date.now();
      handler();
    },
    { passive: false }
  );
  el.addEventListener("click", function () {
    if (Date.now() - lastTouchEnd < 450) return;
    handler();
  });
}

function inferVideoMimeFromUrl(url) {
  var u = String(url || "").split("?")[0].toLowerCase();
  if (u.endsWith(".mov")) return "video/quicktime";
  if (u.endsWith(".mp4") || u.endsWith(".m4v")) return "video/mp4";
  if (u.endsWith(".webm")) return "video/webm";
  return "";
}

function showVideoPlaybackError(errorEl, url, clip) {
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.appendChild(
    document.createTextNode(
      "Lecture impossible dans ce navigateur (vidéo volumineuse ou codec). "
    )
  );
  var link = document.createElement("a");
  link.href = url;
  link.textContent = "Ouvrir / télécharger la vidéo";
  link.setAttribute("download", clip && clip.filename ? clip.filename : "");
  link.target = "_blank";
  link.rel = "noopener";
  errorEl.appendChild(link);
  errorEl.hidden = false;
}

function repairSmartphoneVideo(eventId, filename) {
  if (!eventId || !filename) return Promise.resolve(false);
  return fetch(
    "/api/events/" +
      encodeURIComponent(eventId) +
      "/smartphone-videos/" +
      encodeURIComponent(filename) +
      "/repair",
    { method: "POST", credentials: "same-origin" }
  )
    .then(function (resp) {
      return resp.ok;
    })
    .catch(function () {
      return false;
    });
}

function isVideoWebmProbablyUnsupported() {
  var probe = document.createElement("video");
  return (
    probe.canPlayType("video/webm") === "" &&
    probe.canPlayType('video/webm; codecs="vp8, vorbis"') === ""
  );
}

function resetVideoPlayerElement(player) {
  if (!player) return;
  player.pause();
  player.onerror = null;
  player.removeAttribute("src");
  while (player.firstChild) player.removeChild(player.firstChild);
  try {
    player.load();
  } catch (e) {
    /* pass */
  }
}

function playVideoInPlayer(player, url, errorEl, clip) {
  if (!player || !url) return Promise.resolve();
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
  player.playsInline = true;
  player.setAttribute("playsinline", "");
  player.setAttribute("webkit-playsinline", "");
  player.controls = true;
  player.preload = "auto";
  resetVideoPlayerElement(player);

  var mime = inferVideoMimeFromUrl(url);
  if (mime === "video/webm" && isVideoWebmProbablyUnsupported() && errorEl) {
    errorEl.textContent =
      "Ce navigateur ne lit pas les vidéos WebM. Choisissez une vidéo au format MP4.";
    errorEl.hidden = false;
  }

  if (mime === "video/mp4" || mime === "video/quicktime" || !mime) {
    player.src = url;
  } else {
    var source = document.createElement("source");
    source.src = url;
    if (mime) source.type = mime;
    player.appendChild(source);
  }
  var repaired = false;
  player.onerror = function () {
    if (!errorEl) return;
    var eventId = getEventId();
    var filename = clip && clip.filename ? clip.filename : "";
    if (!repaired && eventId && filename) {
      repaired = true;
      errorEl.textContent = "Optimisation de la vidéo pour la lecture…";
      errorEl.hidden = false;
      repairSmartphoneVideo(eventId, filename).then(function (ok) {
        if (ok) {
          player.onerror = function () {
            showVideoPlaybackError(errorEl, url, clip);
          };
          player.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
          player.load();
          player.play().catch(function () {});
          return;
        }
        showVideoPlaybackError(errorEl, url, clip);
      });
      return;
    }
    showVideoPlaybackError(errorEl, url, clip);
  };
  player.load();
  return player.play().catch(function () {
    /* lecture via contrôles natifs */
  });
}

function videoExtFromFile(file) {
  const t = String(file.type || "").toLowerCase();
  if (t === "video/webm" || t === "video/x-matroska") return "webm";
  if (t === "video/quicktime") return "mov";
  if (t === "video/mp4" || t === "video/x-m4v") return "mp4";
  if (t === "video/3gpp" || t === "video/3gpp2") return "mp4";
  const n = String(file.name || "").toLowerCase();
  if (n.endsWith(".webm")) return "webm";
  if (n.endsWith(".mov")) return "mov";
  if (n.endsWith(".3gp")) return "mp4";
  if (n.endsWith(".mp4") || n.endsWith(".m4v")) return "mp4";
  return null;
}

function isAndroid() {
  try {
    return /Android/i.test(navigator.userAgent || "");
  } catch (e) {
    return false;
  }
}

function defaultChunkSizeForDevice() {
  return isAndroid() ? ANDROID_VIDEO_CHUNK_SIZE : DEFAULT_VIDEO_CHUNK_SIZE;
}

function chunkPauseMsForDevice() {
  return isAndroid() ? ANDROID_CHUNK_UPLOAD_PAUSE_MS : CHUNK_UPLOAD_PAUSE_MS;
}

function effectiveChunkSize(fileSize, preferredSize) {
  var preferred = preferredSize || defaultChunkSizeForDevice();
  if (!fileSize || fileSize <= 0) return preferred;
  var minForFile = Math.ceil(fileSize / MAX_UPLOAD_CHUNKS);
  return Math.max(preferred, minForFile);
}

async function acquireUploadWakeLock() {
  if (!navigator.wakeLock || !navigator.wakeLock.request) return null;
  try {
    return await navigator.wakeLock.request("screen");
  } catch (e) {
    return null;
  }
}

function releaseUploadWakeLock(lock) {
  if (lock && typeof lock.release === "function") {
    lock.release().catch(function () {});
  }
}

function formatUploadError(status, data) {
  if (data && data.error) return String(data.error);
  if (status === 413) return "Vidéo trop volumineuse (max. 300 Mo).";
  if (status === 502 || status === 504) {
    return "Délai dépassé pendant l'envoi — vérifiez votre connexion et réessayez.";
  }
  if (status === 0) {
    return "Connexion interrompue — vérifiez le Wi‑Fi ou la 4G et réessayez.";
  }
  return "Envoi échoué (" + status + ").";
}

function buildChunkUploadUrl(eventId, uploadId, chunkIndex, totalChunks, ext) {
  var params = new URLSearchParams();
  params.set("ext", ext);
  params.set("uploadId", uploadId);
  params.set("chunkIndex", String(chunkIndex));
  params.set("chunkTotal", String(totalChunks));
  return (
    "/api/events/" +
    encodeURIComponent(eventId) +
    "/smartphone-videos/upload-chunk?" +
    params.toString()
  );
}

function buildChunkUploadApiUrl(eventId) {
  return (
    "/api/events/" +
    encodeURIComponent(eventId) +
    "/smartphone-videos/upload-chunk"
  );
}

function readBlobAsBase64(blob) {
  return new Promise(function (resolve, reject) {
    if (!blob || !blob.size) {
      reject(new Error("Impossible de lire la vidéo — réessayez ou choisissez un autre fichier."));
      return;
    }
    if (typeof blob.arrayBuffer === "function") {
      blob
        .arrayBuffer()
        .then(function (buf) {
          resolve(arrayBufferToBase64(buf));
        })
        .catch(function () {
          reject(new Error("Lecture vidéo impossible — réessayez."));
        });
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var result = String(reader.result || "");
      var idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = function () {
      reject(new Error("Lecture vidéo impossible — réessayez."));
    };
    reader.readAsDataURL(blob);
  });
}

function arrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer);
  var sliceLen = 0x8000;
  var parts = [];
  for (var i = 0; i < bytes.length; i += sliceLen) {
    parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + sliceLen)));
  }
  return btoa(parts.join(""));
}

async function ensureVideoReadable(file) {
  if (!file || !file.size) {
    throw new Error("Fichier vidéo vide ou inaccessible.");
  }
  var headSize = Math.min(65536, file.size);
  await readBlobAsBase64(file.slice(0, headSize));
}

function updateChunkProgressFeedback(chunkIndex, totalChunks, fileSize, baseOffset, chunkLoaded) {
  if (!feedbackNode || !fileSize) return;
  var globalLoaded = Math.min(fileSize, baseOffset + (chunkLoaded || 0));
  var pct = Math.round((globalLoaded / fileSize) * 100);
  var loadedMo = (globalLoaded / (1024 * 1024)).toFixed(1);
  var totalMo = (fileSize / (1024 * 1024)).toFixed(1);
  setFeedback(
    "Envoi morceau " +
      (chunkIndex + 1) +
      "/" +
      totalChunks +
      " — " +
      pct +
      "% (" +
      loadedMo +
      " / " +
      totalMo +
      " Mo)"
  );
}

function randomUploadId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 12);
}

function postVideoBinary(uploadUrl, blob, contentType) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    var stallTimer = null;
    var lastProgressAt = 0;
    xhr.open("POST", uploadUrl, true);
    xhr.responseType = "json";
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = function (ev) {
      if (!feedbackNode) return;
      if (!ev.lengthComputable) {
        setFeedback("Envoi en cours…");
        return;
      }
      var loadedMo = (ev.loaded / (1024 * 1024)).toFixed(1);
      var totalMo = (ev.total / (1024 * 1024)).toFixed(1);
      if (ev.total > 0 && ev.loaded >= ev.total) {
        setFeedback("Enregistrement sur le serveur… (" + totalMo + " Mo)");
      } else {
        var pct = Math.round((ev.loaded / ev.total) * 100);
        setFeedback("Envoi en cours… " + pct + "% (" + loadedMo + " / " + totalMo + " Mo)");
      }
      if (stallTimer) clearTimeout(stallTimer);
      if (ev.lengthComputable && ev.loaded < ev.total) {
        lastProgressAt = Date.now();
        var slowLoadedMo = loadedMo;
        var slowTotalMo = totalMo;
        stallTimer = setTimeout(function () {
          if (Date.now() - lastProgressAt >= 40000) {
            setFeedback(
              "Envoi lent — patientez, ne fermez pas la page… (" +
                slowLoadedMo +
                " / " +
                slowTotalMo +
                " Mo)"
            );
          }
        }, 45000);
      }
    };
    xhr.onload = function () {
      if (stallTimer) clearTimeout(stallTimer);
      var ok = xhr.status >= 200 && xhr.status < 300;
      var data = xhr.response;
      if (!data && xhr.responseText) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch (e) {
          data = {};
        }
      }
      if (ok) resolve(data);
      else reject(new Error(formatUploadError(xhr.status, data)));
    };
    xhr.onerror = function () {
      if (stallTimer) clearTimeout(stallTimer);
      reject(new Error("Réseau indisponible pendant l'envoi."));
    };
    xhr.ontimeout = function () {
      if (stallTimer) clearTimeout(stallTimer);
      reject(new Error("Délai dépassé pendant l'envoi — réessayez avec une connexion stable."));
    };
    xhr.timeout = 15 * 60 * 1000;
    xhr.send(blob);
  });
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function postVideoChunkRaw(eventId, uploadId, chunkIndex, totalChunks, chunkBlob, ext, fileSize, baseOffset) {
  updateChunkProgressFeedback(chunkIndex, totalChunks, fileSize, baseOffset, 0);
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    var url = buildChunkUploadUrl(eventId, uploadId, chunkIndex, totalChunks, ext);
    xhr.open("POST", url, true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = function (ev) {
      if (!ev.lengthComputable) return;
      updateChunkProgressFeedback(
        chunkIndex,
        totalChunks,
        fileSize,
        baseOffset,
        ev.loaded
      );
    };
    xhr.onload = function () {
      var ok = xhr.status >= 200 && xhr.status < 300;
      var data = xhr.response;
      if (!data && xhr.responseText) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch (e) {
          data = {};
        }
      }
      if (ok) resolve(data);
      else reject(new Error(formatUploadError(xhr.status, data)));
    };
    xhr.onerror = function () {
      reject(
        new Error(
          "Connexion interrompue sur le morceau " +
            (chunkIndex + 1) +
            " — vérifiez le Wi‑Fi ou la 4G."
        )
      );
    };
    xhr.ontimeout = function () {
      reject(new Error("Délai dépassé sur le morceau " + (chunkIndex + 1) + "."));
    };
    xhr.timeout = 10 * 60 * 1000;
    xhr.send(chunkBlob);
  });
}

function postVideoChunkJson(eventId, uploadId, chunkIndex, totalChunks, chunkBlob, ext, fileSize, baseOffset) {
  updateChunkProgressFeedback(chunkIndex, totalChunks, fileSize, baseOffset, 0);
  if (feedbackNode) {
    setFeedback(
      "Préparation morceau " + (chunkIndex + 1) + "/" + totalChunks + "…"
    );
  }
  return readBlobAsBase64(chunkBlob).then(function (chunkData) {
    var url = buildChunkUploadApiUrl(eventId);
    var payload = JSON.stringify({
      uploadId: uploadId,
      chunkIndex: chunkIndex,
      chunkTotal: totalChunks,
      ext: ext,
      chunkData: chunkData,
    });
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.upload.onprogress = function (ev) {
        if (!ev.lengthComputable) return;
        updateChunkProgressFeedback(
          chunkIndex,
          totalChunks,
          fileSize,
          baseOffset,
          ev.loaded
        );
      };
      xhr.onload = function () {
        var ok = xhr.status >= 200 && xhr.status < 300;
        var data = xhr.response;
        if (!data && xhr.responseText) {
          try {
            data = JSON.parse(xhr.responseText);
          } catch (e) {
            data = {};
          }
        }
        if (ok) {
          updateChunkProgressFeedback(chunkIndex, totalChunks, fileSize, baseOffset, chunkBlob.size);
          resolve(data);
        } else {
          reject(new Error(formatUploadError(xhr.status, data)));
        }
      };
      xhr.onerror = function () {
        reject(
          new Error(
            "Connexion interrompue sur le morceau " +
              (chunkIndex + 1) +
              " — vérifiez le Wi‑Fi ou la 4G."
          )
        );
      };
      xhr.ontimeout = function () {
        reject(new Error("Délai dépassé sur le morceau " + (chunkIndex + 1) + "."));
      };
      xhr.timeout = 10 * 60 * 1000;
      xhr.send(payload);
    });
  });
}

function postVideoChunk(eventId, uploadId, chunkIndex, totalChunks, chunkBlob, ext, fileSize, baseOffset) {
  if (isAndroid()) {
    return postVideoChunkRaw(
      eventId,
      uploadId,
      chunkIndex,
      totalChunks,
      chunkBlob,
      ext,
      fileSize,
      baseOffset
    ).catch(function (rawErr) {
      if (chunkIndex > 0) throw rawErr;
      return postVideoChunkJson(
        eventId,
        uploadId,
        chunkIndex,
        totalChunks,
        chunkBlob,
        ext,
        fileSize,
        baseOffset
      );
    });
  }
  return postVideoChunkJson(
    eventId,
    uploadId,
    chunkIndex,
    totalChunks,
    chunkBlob,
    ext,
    fileSize,
    baseOffset
  );
}

function postVideoChunkWithRetry(eventId, uploadId, chunkIndex, totalChunks, chunkBlob, ext, fileSize, baseOffset) {
  var lastErr = null;
  var attempt = 0;
  function tryOnce() {
    attempt++;
    if (attempt > 1 && feedbackNode) {
      setFeedback(
        "Nouvel essai morceau " +
          (chunkIndex + 1) +
          "/" +
          totalChunks +
          " (tentative " +
          attempt +
          "/" +
          CHUNK_UPLOAD_MAX_ATTEMPTS +
          ")…"
      );
    }
    return postVideoChunk(
      eventId,
      uploadId,
      chunkIndex,
      totalChunks,
      chunkBlob,
      ext,
      fileSize,
      baseOffset
    ).catch(function (err) {
      var msg = err instanceof Error ? err.message : String(err);
      if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        lastErr = new Error(
          "Connexion interrompue sur le morceau " +
            (chunkIndex + 1) +
            " — vérifiez le Wi‑Fi ou la 4G."
        );
      } else {
        lastErr = err instanceof Error ? err : new Error(msg);
      }
      if (attempt >= CHUNK_UPLOAD_MAX_ATTEMPTS) {
        throw lastErr;
      }
      return sleep(1200 * attempt).then(tryOnce);
    });
  }
  return tryOnce();
}

async function fetchChunkUploadConfig(eventId) {
  var fallback = defaultChunkSizeForDevice();
  try {
    var url =
      "/api/events/" +
      encodeURIComponent(eventId) +
      "/smartphone-videos/upload-chunk?probe=1";
    var res = await fetch(url, { method: "GET", credentials: "same-origin" });
    if (!res.ok) return { chunkSize: fallback, mode: isAndroid() ? "raw" : "json" };
    var data = await res.json();
    var recommended = Number(data.recommendedChunkBytes) || fallback;
    var max = Number(data.maxChunkBytes) || 3 * 1024 * 1024;
    var maxChunks = Number(data.maxChunks) || MAX_UPLOAD_CHUNKS;
    var chunkSize = Math.min(isAndroid() ? ANDROID_VIDEO_CHUNK_SIZE : recommended, max);
    chunkSize = effectiveChunkSize(0, chunkSize);
    return {
      chunkSize: chunkSize,
      maxChunks: maxChunks,
      mode: isAndroid() ? "raw" : String(data.preferredMode || "json"),
    };
  } catch (e) {
    return { chunkSize: fallback, mode: isAndroid() ? "raw" : "json" };
  }
}

async function uploadSmartphoneVideoChunked(file, eventId, ext) {
  await ensureVideoReadable(file);
  const config = await fetchChunkUploadConfig(eventId);
  const chunkSize = effectiveChunkSize(file.size, config.chunkSize || defaultChunkSizeForDevice());
  const totalChunks = Math.ceil(file.size / chunkSize);
  if (totalChunks > MAX_UPLOAD_CHUNKS) {
    throw new Error(
      "Vidéo trop longue pour l'envoi par morceaux (max. " + MAX_UPLOAD_CHUNKS + " morceaux)."
    );
  }
  const uploadId = randomUploadId();
  const wakeLock = await acquireUploadWakeLock();
  if (feedbackNode) {
    setFeedback(
      "Envoi en " +
        totalChunks +
        " morceaux (~" +
        Math.round(chunkSize / 1024) +
        " Ko" +
        (isAndroid() ? ", mode direct" : "") +
        ")…"
    );
  }
  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const data = await postVideoChunkWithRetry(
        eventId,
        uploadId,
        i,
        totalChunks,
        chunk,
        ext,
        file.size,
        start
      );
      if (data && data.complete && data.video) {
        return data;
      }
      if (i + 1 < totalChunks) {
        await sleep(chunkPauseMsForDevice());
      }
    }
    throw new Error("Assemblage vidéo incomplet — réessayez.");
  } finally {
    releaseUploadWakeLock(wakeLock);
  }
}

function postVideoDataUrl(eventId, file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onloadend = function () {
      var dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("Lecture du fichier impossible."));
        return;
      }
      fetchJson("/api/events/" + encodeURIComponent(eventId) + "/smartphone-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoDataUrl: dataUrl }),
      })
        .then(resolve)
        .catch(reject);
    };
    reader.onerror = function () {
      reject(new Error("Erreur lecture vidéo."));
    };
    reader.readAsDataURL(file);
  });
}

async function uploadSmartphoneVideoFile(file, eventId) {
  const id = eventId || getEventId();
  if (!id) throw new Error("Événement manquant — rouvrez la page depuis la galerie.");
  const ext = videoExtFromFile(file);
  if (!ext) throw new Error("Format vidéo non supporté (MP4 ou WebM).");
  if (file.size > CHUNKED_UPLOAD_THRESHOLD) {
    return uploadSmartphoneVideoChunked(file, id, ext);
  }
  const uploadUrl =
    "/api/events/" +
    encodeURIComponent(id) +
    "/smartphone-videos/upload?ext=" +
    encodeURIComponent(ext);
  try {
    await postVideoBinary(uploadUrl, file, file.type || "");
  } catch (binErr) {
    if (file.size > DATA_URL_FALLBACK_MAX_BYTES) {
      throw binErr instanceof Error ? binErr : new Error(String(binErr));
    }
    await postVideoDataUrl(id, file);
  }
}

function showLightboxAt(index) {
  if (!smartphoneVideos.length) return;
  const n = smartphoneVideos.length;
  lightboxIndex = ((index % n) + n) % n;
  const clip = smartphoneVideos[lightboxIndex];
  if (!clip) return;
  var lb = getLightboxEl();
  var player = document.getElementById("smartphone-video-lightbox-player");
  var errorEl = document.getElementById("smartphone-video-lightbox-error");
  if (!lb || !player) return;
  void playVideoInPlayer(player, clip.url, errorEl, clip);
  lb.classList.add("active");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  updateNavButtons();
}

function updateNavButtons() {
  const prev = document.getElementById("smartphone-video-lightbox-prev");
  const next = document.getElementById("smartphone-video-lightbox-next");
  if (!prev || !next) return;
  const single = smartphoneVideos.length <= 1;
  prev.hidden = single;
  next.hidden = single;
  if (!single) {
    prev.removeAttribute("hidden");
    next.removeAttribute("hidden");
  }
  prev.setAttribute("aria-disabled", String(single));
  next.setAttribute("aria-disabled", String(single));
}

function lightboxStep(delta) {
  if (smartphoneVideos.length <= 1) return;
  var player = document.getElementById("smartphone-video-lightbox-player");
  if (player) player.pause();
  showLightboxAt(lightboxIndex + delta);
}

function closeVideoLightbox() {
  var lb = getLightboxEl();
  var player = document.getElementById("smartphone-video-lightbox-player");
  var errorEl = document.getElementById("smartphone-video-lightbox-error");
  if (player) resetVideoPlayerElement(player);
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
  if (!lb) return;
  lb.classList.remove("active");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  touchStartX = null;
}

function openGalleryItem(_clip, idx) {
  showLightboxAt(idx);
}

function renderVideos(videos) {
  if (!gridNode || !countNode) return;
  gridNode.innerHTML = "";
  smartphoneVideos = videos || [];
  const n = smartphoneVideos.length;
  countNode.textContent = n + " vidéo" + (n !== 1 ? "s" : "");
  smartphoneVideos.forEach(function (clip, idx) {
    const item = document.createElement("article");
    item.className = "gallery-item gallery-item-video";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", "Lire la vidéo smartphone " + (idx + 1));
    const thumb = document.createElement("video");
    thumb.src = clip.url;
    thumb.muted = true;
    thumb.playsInline = true;
    thumb.preload = "metadata";
    thumb.className = "gallery-video-thumb";
    item.appendChild(thumb);
    const badge = document.createElement("span");
    badge.className = "gallery-video-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "▶";
    item.appendChild(badge);
    bindTapOrClick(item, function () {
      openGalleryItem(clip, idx);
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGalleryItem(clip, idx);
      }
    });
    gridNode.appendChild(item);
  });
}

function setupVideoLightbox() {
  var lb = getLightboxEl();
  var closeBtn = lb && lb.querySelector(".photo-lightbox-close");
  var prevBtn = document.getElementById("smartphone-video-lightbox-prev");
  var nextBtn = document.getElementById("smartphone-video-lightbox-next");
  var backdrop = lb && lb.querySelector(".photo-lightbox-backdrop");

  if (backdrop) {
    backdrop.addEventListener("click", function (e) {
      e.stopPropagation();
      closeVideoLightbox();
    });
  }
  if (closeBtn) {
    bindTapOrClick(closeBtn, closeVideoLightbox);
  }
  if (prevBtn) {
    bindTapOrClick(prevBtn, function () {
      lightboxStep(-1);
    });
  }
  if (nextBtn) {
    bindTapOrClick(nextBtn, function () {
      lightboxStep(1);
    });
  }

  var content = lb && lb.querySelector(".photo-lightbox-content");
  if (content && lb) {
    content.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    content.addEventListener(
      "touchstart",
      function (e) {
        if (!lb.classList.contains("active")) return;
        if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    content.addEventListener(
      "touchend",
      function (e) {
        e.stopPropagation();
        if (!lb.classList.contains("active")) {
          touchStartX = null;
          return;
        }
        if (touchStartX == null) return;
        const endX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
        if (endX == null) {
          touchStartX = null;
          return;
        }
        const dx = endX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) < 50) return;
        e.preventDefault();
        if (dx > 0) lightboxStep(-1);
        else lightboxStep(1);
      },
      { passive: false }
    );
  }

  document.addEventListener("keydown", function (e) {
    var activeLb = getLightboxEl();
    if (!activeLb || !activeLb.classList.contains("active")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeVideoLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      lightboxStep(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      lightboxStep(1);
    }
  });
}

function setupUpload() {
  if (!uploadBtn || !fileInput) return;
  uploadBtn.addEventListener("click", function () {
    fileInput.click();
  });
  fileInput.addEventListener("change", async function () {
    const eventId = getEventId();
    if (!eventId) {
      setFeedback("Événement manquant — rouvrez la page depuis la galerie.", true);
      fileInput.value = "";
      return;
    }
    const files = Array.from(fileInput.files || []).filter(function (f) {
      return f && (/^video\//i.test(f.type || "") || videoExtFromFile(f));
    });
    fileInput.value = "";
    if (!files.length) {
      setFeedback("Format vidéo non reconnu (MP4 ou WebM).", true);
      return;
    }
    const total = files.length;
    uploadBtn.disabled = true;
    var uploaded = 0;
    var lastError = null;
    for (var i = 0; i < total; i++) {
      if (files[i].size > MAX_VIDEO_FILE_BYTES) {
        lastError = new Error(
          "Vidéo trop volumineuse (max. 300 Mo) : " + (files[i].name || "fichier " + (i + 1))
        );
        continue;
      }
      const sizeKo = Math.round(files[i].size / 1024);
      setFeedback(
        total > 1
          ? "Envoi " + (i + 1) + "/" + total + "… (" + sizeKo + " Ko)"
          : "Envoi en cours… (" + sizeKo + " Ko)"
      );
      try {
        await uploadSmartphoneVideoFile(files[i], eventId);
        uploaded++;
      } catch (e) {
        lastError = e;
      }
    }
    try {
      await loadVideos();
    } catch (e) {
      /* pass */
    }
    if (uploaded === total) {
      setFeedback(
        total > 1
          ? uploaded + " vidéos ajoutées. Vous pouvez en ajouter d'autres."
          : "Vidéo ajoutée. Vous pouvez en ajouter d'autres."
      );
    } else if (uploaded > 0) {
      setFeedback(
        uploaded +
          " vidéo" +
          (uploaded !== 1 ? "s" : "") +
          " ajoutée" +
          (uploaded !== 1 ? "s" : "") +
          ", " +
          (total - uploaded) +
          " échec" +
          (total - uploaded !== 1 ? "s" : "") +
          ".",
        true
      );
    } else {
      setFeedback(lastError instanceof Error ? lastError.message : "Envoi impossible.", true);
    }
    uploadBtn.disabled = false;
  });
}

function setupBackLink() {
  if (!backLink) return;
  backLink.href = getMainGalleryUrl();
  backLink.addEventListener("click", function (e) {
    e.preventDefault();
    const url = getMainGalleryUrl();
    if (typeof window.navigateInApp === "function") {
      window.navigateInApp(url);
    } else {
      window.location.href = url;
    }
  });
}

async function loadVideos() {
  const eventId = getEventId();
  if (!eventId) return;
  const data = await fetchJson("/api/events/" + encodeURIComponent(eventId) + "/smartphone-videos");
  const videos = (data.videos || []).map(function (v) {
    return Object.assign({}, v, { url: normalizeStorageMediaUrl(v.url) });
  });
  renderVideos(videos);
}

async function boot() {
  setupBackLink();
  setupUpload();
  setupVideoLightbox();
  const eventId = getEventId();
  if (!eventId) {
    if (titleNode) titleNode.textContent = "Aucun événement spécifié.";
    if (uploadBtn) uploadBtn.hidden = true;
    setFeedback("Ouvrez cette page depuis la galerie de l'événement.", true);
    return;
  }
  pinnedEventId = eventId;
  try {
    const eventData = await fetchJson("/api/events/" + encodeURIComponent(eventId));
    if (titleNode) titleNode.textContent = eventData.event.name;
    await loadVideos();
  } catch (e) {
    if (titleNode) titleNode.textContent = "Impossible de charger l'album.";
    setFeedback(e instanceof Error ? e.message : "Erreur", true);
  }
}

boot();
