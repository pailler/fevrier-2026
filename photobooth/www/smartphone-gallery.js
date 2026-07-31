const titleNode = document.getElementById("smartphone-title");
const countNode = document.getElementById("smartphone-count");
const gridNode = document.getElementById("smartphone-grid");
const uploadBtn = document.getElementById("smartphone-upload-btn");
const fileInput = document.getElementById("smartphone-file-input");
const feedbackNode = document.getElementById("smartphone-upload-feedback");
const backLink = document.getElementById("smartphone-back-gallery");

const GALLERY_JWT_STORAGE = "photobooth_gallery_jwt";
const SLIDESHOW_INTERVAL_MS = 4500;

/** @type {Array<{ url: string, filename: string }>} */
let smartphonePhotos = [];
let lightboxIndex = 0;
let slideshowTimerId = null;
let slideshowBtnLastFire = 0;
let touchStartX = null;

(function hoistGalleryJwtFromUrl() {
  try {
    var u = new URL(window.location.href);
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
  return document.getElementById("smartphone-lightbox");
}

function getLightboxImg() {
  return document.getElementById("smartphone-lightbox-img");
}

function getEventId() {
  return new URL(window.location.href).searchParams.get("eventId");
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

async function fetchJson(url) {
  const response = await fetch(url, {
    credentials: "same-origin",
    referrerPolicy: "no-referrer",
  });
  const data = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) throw new Error(data.error || "Erreur chargement");
  return data;
}

function normalizeStorageMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  const m = url.match(/^(\/storage\/events\/[^/]+\/(?:photos|videos|smartphone)\/)([\s\S]*)$/);
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

function fileToJpegDataUrl(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const dataUrl = String(reader.result || "");
      if (!/^data:image\//i.test(dataUrl)) {
        reject(new Error("Format non supporté"));
        return;
      }
      const img = new Image();
      img.onload = function () {
        const maxSide = 2400;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (!w || !h) {
          reject(new Error("Image invalide"));
          return;
        }
        const scale = Math.min(1, maxSide / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = function () {
        reject(new Error("Impossible de lire l'image"));
      };
      img.src = dataUrl;
    };
    reader.onerror = function () {
      reject(new Error("Lecture fichier impossible"));
    };
    reader.readAsDataURL(file);
  });
}

async function uploadSmartphoneFile(file) {
  const eventId = getEventId();
  if (!eventId) throw new Error("Événement manquant");
  const imageDataUrl = await fileToJpegDataUrl(file);
  const response = await fetch("/api/events/" + encodeURIComponent(eventId) + "/smartphone-photos", {
    method: "POST",
    credentials: "same-origin",
    referrerPolicy: "no-referrer",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl: imageDataUrl }),
  });
  const data = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) throw new Error(data.error || "Envoi impossible");
  return data.photo;
}

function showLightboxAt(index) {
  if (!smartphonePhotos.length) return;
  const n = smartphonePhotos.length;
  lightboxIndex = ((index % n) + n) % n;
  const p = smartphonePhotos[lightboxIndex];
  if (!p) return;
  var lb = getLightboxEl();
  var img = getLightboxImg();
  if (!lb || !img) return;
  img.hidden = false;
  img.src = p.url;
  img.alt = "Photo smartphone " + (lightboxIndex + 1) + " sur " + n;
  lb.classList.add("active");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  updateNavButtons();
  if (img.decode) {
    img.decode().catch(function () {});
  }
}

function stopSlideshow() {
  if (slideshowTimerId) {
    clearInterval(slideshowTimerId);
    slideshowTimerId = null;
  }
  updateSlideshowButton();
}

function updateSlideshowButton() {
  const btn = document.getElementById("smartphone-lightbox-slideshow");
  const lb = getLightboxEl();
  if (!btn) return;
  const active = lb && lb.classList.contains("active");
  const multi = smartphonePhotos.length > 1;
  const show = active && multi;
  btn.hidden = !show;
  if (show) btn.removeAttribute("hidden");
  if (!show) return;
  var playing = !!slideshowTimerId;
  btn.setAttribute("aria-pressed", playing ? "true" : "false");
  btn.textContent = playing ? "⏸ Pause" : "▶ Diaporama";
  btn.setAttribute(
    "aria-label",
    playing ? "Mettre le diaporama en pause" : "Lancer le diaporama des photos en plein ecran"
  );
  btn.classList.toggle("photo-lightbox-slideshow--playing", playing);
}

function startSlideshow() {
  if (smartphonePhotos.length <= 1) return;
  stopSlideshow();
  void enterLightboxNativeFullscreen().then(function () {
    updateFullscreenButton();
  });
  slideshowTimerId = setInterval(function () {
    var lb = getLightboxEl();
    if (!lb || !lb.classList.contains("active")) {
      stopSlideshow();
      return;
    }
    showLightboxAt(lightboxIndex + 1);
  }, SLIDESHOW_INTERVAL_MS);
  updateSlideshowButton();
}

function toggleSlideshow() {
  if (smartphonePhotos.length <= 1) return;
  if (slideshowTimerId) stopSlideshow();
  else startSlideshow();
}

function onSlideshowButtonActivate(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  var t = Date.now();
  if (t - slideshowBtnLastFire < 450) return;
  slideshowBtnLastFire = t;
  toggleSlideshow();
}

function getNativeFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

function isLightboxNativeFullscreen() {
  var lb = getLightboxEl();
  if (!lb) return false;
  return getNativeFullscreenElement() === lb;
}

function exitLightboxNativeFullscreen() {
  var active = getNativeFullscreenElement();
  if (!active) return;
  var exit =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.webkitCancelFullScreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;
  if (typeof exit !== "function") return;
  try {
    var p = exit.call(document);
    if (p && typeof p.then === "function") p.catch(function () {});
  } catch (e) {
    /* pass */
  }
}

function updateFullscreenButton() {
  var btn = document.getElementById("smartphone-lightbox-fullscreen");
  var lb = getLightboxEl();
  if (!btn) return;
  var active = lb && lb.classList.contains("active");
  btn.hidden = !active;
  if (!active) return;
  var fs = isLightboxNativeFullscreen();
  btn.setAttribute("aria-pressed", fs ? "true" : "false");
  btn.textContent = fs ? "⤓ Fenêtre" : "⛶ Plein écran";
  btn.setAttribute("aria-label", fs ? "Quitter le plein écran du navigateur" : "Afficher en plein écran le diaporama");
}

function enterLightboxNativeFullscreen() {
  var lb = getLightboxEl();
  if (!lb || !lb.classList.contains("active")) return Promise.resolve();
  if (isLightboxNativeFullscreen()) {
    updateFullscreenButton();
    return Promise.resolve();
  }
  var req = lb.requestFullscreen || lb.webkitRequestFullscreen || lb.webkitEnterFullscreen;
  if (typeof req !== "function") {
    return Promise.resolve(false);
  }
  try {
    var p = req.call(lb);
    if (p && typeof p.then === "function") {
      return p.then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }
    return Promise.resolve(true);
  } catch (e) {
    return Promise.resolve(false);
  }
}

function toggleLightboxNativeFullscreen() {
  if (isLightboxNativeFullscreen()) exitLightboxNativeFullscreen();
  else {
    void enterLightboxNativeFullscreen().then(function () {
      updateFullscreenButton();
    });
  }
}

function updateNavButtons() {
  const prev = document.getElementById("smartphone-lightbox-prev");
  const next = document.getElementById("smartphone-lightbox-next");
  if (!prev || !next) return;
  const single = smartphonePhotos.length <= 1;
  prev.hidden = single;
  next.hidden = single;
  if (!single) {
    prev.removeAttribute("hidden");
    next.removeAttribute("hidden");
  }
  prev.setAttribute("aria-disabled", String(single));
  next.setAttribute("aria-disabled", String(single));
  updateSlideshowButton();
  updateFullscreenButton();
}

function lightboxStep(delta) {
  if (smartphonePhotos.length <= 1) return;
  showLightboxAt(lightboxIndex + delta);
}

function closePhotoFullscreen() {
  stopSlideshow();
  exitLightboxNativeFullscreen();
  var lb = getLightboxEl();
  if (!lb) return;
  var img = getLightboxImg();
  if (img) {
    img.hidden = false;
    img.removeAttribute("src");
    img.alt = "";
  }
  lb.classList.remove("active");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  touchStartX = null;
  updateFullscreenButton();
}

function openGalleryItem(_photo, idx) {
  showLightboxAt(idx);
}

function renderPhotos(photos) {
  if (!gridNode || !countNode) return;
  gridNode.innerHTML = "";
  smartphonePhotos = photos || [];
  const n = smartphonePhotos.length;
  countNode.textContent = n + " photo" + (n !== 1 ? "s" : "");
  smartphonePhotos.forEach(function (photo, idx) {
    const item = document.createElement("article");
    item.className = "gallery-item";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", "Voir la photo smartphone " + (idx + 1) + " en diaporama");
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = "Photo smartphone " + (idx + 1);
    image.draggable = false;
    image.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    item.appendChild(image);
    bindTapOrClick(item, function () {
      openGalleryItem(photo, idx);
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGalleryItem(photo, idx);
      }
    });
    gridNode.appendChild(item);
  });
}

function setupPhotoLightbox() {
  var lb = getLightboxEl();
  var lbImg = getLightboxImg();
  if (lbImg) {
    lbImg.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
  }
  var closeBtn = lb && lb.querySelector(".photo-lightbox-close");
  var prevBtn = document.getElementById("smartphone-lightbox-prev");
  var nextBtn = document.getElementById("smartphone-lightbox-next");
  var backdrop = lb && lb.querySelector(".photo-lightbox-backdrop");

  if (backdrop) {
    backdrop.addEventListener("click", function (e) {
      e.stopPropagation();
      closePhotoFullscreen();
    });
  }
  if (closeBtn) {
    bindTapOrClick(closeBtn, closePhotoFullscreen);
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
  var slideshowBtn = document.getElementById("smartphone-lightbox-slideshow");
  if (slideshowBtn) {
    bindTapOrClick(slideshowBtn, onSlideshowButtonActivate);
  }
  var fullscreenBtn = document.getElementById("smartphone-lightbox-fullscreen");
  if (fullscreenBtn) {
    bindTapOrClick(fullscreenBtn, toggleLightboxNativeFullscreen);
  }
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

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
      closePhotoFullscreen();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      lightboxStep(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      lightboxStep(1);
    } else if (e.key === " " || e.code === "Space") {
      if (smartphonePhotos.length > 1) {
        e.preventDefault();
        toggleSlideshow();
      }
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleLightboxNativeFullscreen();
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopSlideshow();
  });
}

function setupUpload() {
  if (!uploadBtn || !fileInput) return;
  uploadBtn.addEventListener("click", function () {
    fileInput.click();
  });
  fileInput.addEventListener("change", async function () {
    const files = Array.from(fileInput.files || []).filter(function (f) {
      return f && /^image\//i.test(f.type || "");
    });
    fileInput.value = "";
    if (!files.length) return;
    const total = files.length;
    uploadBtn.disabled = true;
    var uploaded = 0;
    var lastError = null;
    for (var i = 0; i < total; i++) {
      setFeedback(total > 1 ? "Envoi " + (i + 1) + "/" + total + "…" : "Envoi en cours…");
      try {
        await uploadSmartphoneFile(files[i]);
        uploaded++;
      } catch (e) {
        lastError = e;
      }
    }
    try {
      await loadPhotos();
    } catch (e) {
      /* pass */
    }
    if (uploaded === total) {
      setFeedback(
        total > 1
          ? uploaded + " photos ajoutées. Vous pouvez en ajouter d'autres."
          : "Photo ajoutée. Vous pouvez en ajouter d'autres."
      );
    } else if (uploaded > 0) {
      setFeedback(
        uploaded + " photo" + (uploaded !== 1 ? "s" : "") + " ajoutée" + (uploaded !== 1 ? "s" : "") +
          ", " + (total - uploaded) + " échec" + (total - uploaded !== 1 ? "s" : "") + ".",
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

async function loadPhotos() {
  const eventId = getEventId();
  if (!eventId) return;
  const data = await fetchJson("/api/events/" + encodeURIComponent(eventId) + "/smartphone-photos");
  const photos = (data.photos || []).map(function (p) {
    return Object.assign({}, p, { url: normalizeStorageMediaUrl(p.url) });
  });
  renderPhotos(photos);
}

async function boot() {
  setupBackLink();
  setupUpload();
  setupPhotoLightbox();
  const eventId = getEventId();
  if (!eventId) {
    if (titleNode) titleNode.textContent = "Aucun événement spécifié.";
    if (uploadBtn) uploadBtn.hidden = true;
    return;
  }
  try {
    const eventData = await fetchJson("/api/events/" + encodeURIComponent(eventId));
    if (titleNode) titleNode.textContent = eventData.event.name;
    await loadPhotos();
  } catch (e) {
    if (titleNode) titleNode.textContent = "Impossible de charger l'album.";
    setFeedback(e instanceof Error ? e.message : "Erreur", true);
  }
}

boot();
