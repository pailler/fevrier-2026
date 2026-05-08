const titleNode = document.getElementById("gallery-title");
const countNode = document.getElementById("gallery-count");
const gridNode = document.getElementById("gallery-grid");
const videoGridNode = document.getElementById("gallery-video-grid");
const videoCountNode = document.getElementById("gallery-video-count");
const selfieBtn = document.getElementById("gallery-add-selfie");
const videoAddBtn = document.getElementById("gallery-add-video");

const INACTIVITY_MS = 60 * 1000; // 1 minute
let inactivityTimer = null;

/** @type {Array<{ url: string, filename: string, id?: string }>} */
let galleryPhotos = [];
/** @type {Array<{ url: string, filename: string, id?: string }>} */
let galleryVideos = [];
let lightboxIndex = 0;
let lightboxVideoMode = false;
let videoLightboxIndex = 0;
let touchStartX = null;
let boothDirectPrint = false;
let boothPrintBusy = false;
let slideshowTimerId = null;
const SLIDESHOW_INTERVAL_MS = 4500;
let slideshowBtnLastFire = 0;

/**
 * iPad / iOS : le clic synthétique après un tap est parfois absent ou retardé ;
 * on ouvre sur touchend si le geste est un tap (pas un scroll).
 */
function bindTapOrClick(el, handler) {
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

function getEventId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("eventId");
}

function getToken() {
  const url = new URL(window.location.href);
  return url.searchParams.get("token") || "";
}

function getChoicePageUrl() {
  const eventId = getEventId();
  const token = getToken();
  if (!eventId) return "./index.html";
  const url = new URL("./index.html", window.location.href);
  url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

function getStudioUrl() {
  const eventId = getEventId();
  const token = getToken();
  const url = new URL("./studio.html", window.location.href);
  if (eventId) url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

function getVideoStudioUrl() {
  const eventId = getEventId();
  const token = getToken();
  const url = new URL("./video-studio.html", window.location.href);
  if (eventId) url.searchParams.set("eventId", eventId);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

function goToStudio() {
  const url = getStudioUrl();
  if (typeof window.navigateInApp === "function") {
    window.navigateInApp(url);
  } else {
    window.location.href = url;
  }
}

function setupGallerySelfieCta() {
  if (!selfieBtn) return;
  selfieBtn.addEventListener("click", function (e) {
    if (!getEventId()) return;
    e.preventDefault();
    resetInactivityTimer();
    goToStudio();
  });
}

function setupGalleryVideoCta() {
  if (!videoAddBtn) return;
  videoAddBtn.addEventListener("click", function (e) {
    if (!getEventId()) return;
    e.preventDefault();
    resetInactivityTimer();
    const url = getVideoStudioUrl();
    if (typeof window.navigateInApp === "function") {
      window.navigateInApp(url);
    } else {
      window.location.href = url;
    }
  });
}

function goBackToChoice() {
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

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erreur chargement");
  return data;
}

function setPrintFeedback(text, isError) {
  const el = document.getElementById("photo-lightbox-print-feedback");
  if (!el) return;
  if (!text) {
    el.textContent = "";
    el.hidden = true;
    el.classList.remove("error");
    return;
  }
  el.textContent = text;
  el.hidden = false;
  el.classList.toggle("error", !!isError);
}

function applyBoothPrintUi() {
  const bar = document.getElementById("photo-lightbox-booth-bar");
  const boothBtn = document.getElementById("photo-lightbox-booth-print");
  const fallback = document.getElementById("photo-lightbox-print-fallback");
  if (bar) {
    bar.hidden = false;
  }
  if (boothBtn) {
    if (boothDirectPrint) {
      boothBtn.textContent = "Imprimer sur la borne";
      boothBtn.setAttribute(
        "aria-label",
        "Envoyer à l'imprimante de la borne sans passer par le dialogue du navigateur"
      );
    } else {
      boothBtn.textContent = "Imprimer (AirPrint / partage)";
      boothBtn.setAttribute(
        "aria-label",
        "Imprimer ou partager la photo (AirPrint sur iPad, boîte de dialogue du système)"
      );
    }
  }
  if (fallback) {
    fallback.hidden = !boothDirectPrint;
  }
}

function primaryLightboxPrint(e) {
  if (e) e.stopPropagation();
  if (boothDirectPrint) {
    requestBoothPrint();
  } else {
    printLightboxImage();
  }
}

function requestBoothPrint() {
  if (boothPrintBusy || lightboxVideoMode) return;
  const eventId = getEventId();
  const p = galleryPhotos[lightboxIndex];
  if (!eventId || !p || !p.filename) {
    setPrintFeedback("Fichier ou evenement manquant — impossible d'imprimer en direct.");
    return;
  }
  boothPrintBusy = true;
  setPrintFeedback("Impression en cours…");
  fetch("/api/events/" + encodeURIComponent(eventId) + "/print-to-booth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: p.filename }),
  })
    .then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error((data && data.error) || "Echec");
        return data;
      });
    })
    .then(function () {
      setPrintFeedback("Envoyé à l'imprimante.");
    })
    .catch(function (e) {
      setPrintFeedback(e instanceof Error ? e.message : "Erreur d'impression", true);
    })
    .finally(function () {
      boothPrintBusy = false;
      setTimeout(function () {
        setPrintFeedback("");
      }, 5000);
    });
}

function showLightboxAt(index) {
  if (!galleryPhotos.length) return;
  const n = galleryPhotos.length;
  lightboxIndex = ((index % n) + n) % n;
  const p = galleryPhotos[lightboxIndex];
  if (!p) return;
  var lb = document.getElementById("photo-lightbox");
  var img = document.getElementById("photo-lightbox-img");
  var player = document.getElementById("video-lightbox-player");
  var boothBar = document.getElementById("photo-lightbox-booth-bar");
  if (!lb || !img) return;
  lightboxVideoMode = false;
  if (player) {
    player.pause();
    player.removeAttribute("src");
    player.hidden = true;
  }
  img.hidden = false;
  if (boothBar) boothBar.hidden = false;
  img.src = p.url;
  img.alt = "Photo " + (lightboxIndex + 1) + " sur " + n;
  lb.classList.add("active");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setPrintFeedback("");
  updateNavButtons();
  if (img.decode) {
    img.decode().catch(function () {});
  }
}

function openPhotoFullscreen(url, alt, index) {
  const idx =
    typeof index === "number"
      ? index
      : galleryPhotos.findIndex(function (p) {
          return p.url === url;
        });
  if (idx >= 0) {
    showLightboxAt(idx);
  } else {
    galleryPhotos = [{ url: url, id: "single" }];
    lightboxIndex = 0;
    showLightboxAt(0);
  }
  var img = document.getElementById("photo-lightbox-img");
  if (img && alt) img.alt = alt;
}

function stopSlideshow() {
  if (slideshowTimerId) {
    clearInterval(slideshowTimerId);
    slideshowTimerId = null;
  }
  updateSlideshowButton();
}

function updateSlideshowButton() {
  const btn = document.getElementById("photo-lightbox-slideshow");
  const lb = document.getElementById("photo-lightbox");
  if (!btn) return;
  const active = lb && lb.classList.contains("active");
  const multi = galleryPhotos.length > 1;
  const photoMode = !lightboxVideoMode;
  const show = active && photoMode && multi;
  btn.hidden = !show;
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
  if (lightboxVideoMode || galleryPhotos.length <= 1) return;
  stopSlideshow();
  slideshowTimerId = setInterval(function () {
    var lb = document.getElementById("photo-lightbox");
    if (!lb || !lb.classList.contains("active") || lightboxVideoMode) {
      stopSlideshow();
      return;
    }
    showLightboxAt(lightboxIndex + 1);
  }, SLIDESHOW_INTERVAL_MS);
  updateSlideshowButton();
}

function toggleSlideshow() {
  if (lightboxVideoMode || galleryPhotos.length <= 1) return;
  if (slideshowTimerId) stopSlideshow();
  else startSlideshow();
}

/** Évite touchend + click (iOS) qui enchaînerait start puis stop. */
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

function updateNavButtons() {
  const prev = document.getElementById("photo-lightbox-prev");
  const next = document.getElementById("photo-lightbox-next");
  if (!prev || !next) return;
  const listLen = lightboxVideoMode ? galleryVideos.length : galleryPhotos.length;
  const single = listLen <= 1;
  prev.hidden = single;
  next.hidden = single;
  prev.setAttribute("aria-disabled", String(single));
  next.setAttribute("aria-disabled", String(single));
  updateSlideshowButton();
}

function lightboxStep(delta) {
  if (lightboxVideoMode) {
    if (galleryVideos.length <= 1) return;
    openVideoLightboxAt(videoLightboxIndex + delta);
    return;
  }
  if (galleryPhotos.length <= 1) return;
  showLightboxAt(lightboxIndex + delta);
}

function closePhotoFullscreen() {
  stopSlideshow();
  var lb = document.getElementById("photo-lightbox");
  if (!lb) return;
  var player = document.getElementById("video-lightbox-player");
  if (player) {
    player.pause();
    player.removeAttribute("src");
    player.hidden = true;
  }
  var img = document.getElementById("photo-lightbox-img");
  if (img) {
    img.hidden = false;
    img.removeAttribute("src");
    img.alt = "";
  }
  var boothBar = document.getElementById("photo-lightbox-booth-bar");
  if (boothBar) boothBar.hidden = false;
  lightboxVideoMode = false;
  lb.classList.remove("active");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  touchStartX = null;
}

function printLightboxImage() {
  const img = document.getElementById("photo-lightbox-img");
  if (!img || !img.getAttribute("src")) return;
  const doPrint = function () {
    document.body.classList.add("print-lightbox-only");
    window.print();
  };
  if (!img.complete) {
    img.addEventListener("load", doPrint, { once: true });
    return;
  }
  doPrint();
}

function setupPhotoLightbox() {
  var lb = document.getElementById("photo-lightbox");
  var lbImg = document.getElementById("photo-lightbox-img");
  if (lbImg) {
    lbImg.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
  }
  var closeBtn = lb && lb.querySelector(".photo-lightbox-close");
  var printFallbackBtn = document.getElementById("photo-lightbox-print-fallback");
  var prevBtn = document.getElementById("photo-lightbox-prev");
  var nextBtn = document.getElementById("photo-lightbox-next");
  var backdrop = lb && lb.querySelector(".photo-lightbox-backdrop");

  if (backdrop) {
    backdrop.addEventListener("click", function (e) {
      e.stopPropagation();
      closePhotoFullscreen();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      closePhotoFullscreen();
    });
  }
  var boothPrintBtn = document.getElementById("photo-lightbox-booth-print");
  if (boothPrintBtn) {
    boothPrintBtn.addEventListener("click", primaryLightboxPrint);
  }
  if (printFallbackBtn) {
    printFallbackBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      printLightboxImage();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      lightboxStep(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      lightboxStep(1);
    });
  }
  var slideshowBtn = document.getElementById("photo-lightbox-slideshow");
  if (slideshowBtn) {
    bindTapOrClick(slideshowBtn, function () {
      onSlideshowButtonActivate();
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
    var activeLb = document.getElementById("photo-lightbox");
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
      if (!lightboxVideoMode && galleryPhotos.length > 1) {
        e.preventDefault();
        toggleSlideshow();
      }
    }
  });

  function syncPrintClass() {
    const lb = document.getElementById("photo-lightbox");
    if (lb && lb.classList.contains("active")) {
      document.body.classList.add("print-lightbox-only");
    } else {
      document.body.classList.remove("print-lightbox-only");
    }
  }
  window.addEventListener("beforeprint", syncPrintClass);
  window.addEventListener("afterprint", function () {
    document.body.classList.remove("print-lightbox-only");
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopSlideshow();
  });
}

function openVideoLightboxAt(index) {
  stopSlideshow();
  if (!galleryVideos.length) return;
  const n = galleryVideos.length;
  videoLightboxIndex = ((index % n) + n) % n;
  const clip = galleryVideos[videoLightboxIndex];
  if (!clip) return;
  var lb = document.getElementById("photo-lightbox");
  var img = document.getElementById("photo-lightbox-img");
  var player = document.getElementById("video-lightbox-player");
  var boothBar = document.getElementById("photo-lightbox-booth-bar");
  if (!lb || !player) return;
  lightboxVideoMode = true;
  if (img) img.hidden = true;
  player.hidden = false;
  player.src = clip.url;
  try {
    player.play();
  } catch {
    /* pass */
  }
  if (boothBar) boothBar.hidden = true;
  lb.classList.add("active");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setPrintFeedback("");
  updateNavButtons();
}

function openGalleryVideoItem(_clip, idx) {
  openVideoLightboxAt(idx);
}

function openGalleryItem(photo, idx) {
  showLightboxAt(idx);
}

function renderPhotos(photos) {
  gridNode.innerHTML = "";
  countNode.textContent = `${photos.length} photo${photos.length > 1 ? "s" : ""}`;
  galleryPhotos = photos;

  photos.forEach((photo, idx) => {
    const item = document.createElement("article");
    item.className = "gallery-item";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", "Voir la photo " + (idx + 1) + " en diaporama");
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = "Photo " + (idx + 1);
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

function renderVideos(videos) {
  if (!videoGridNode || !videoCountNode) return;
  videoGridNode.innerHTML = "";
  galleryVideos = videos || [];
  const n = galleryVideos.length;
  videoCountNode.textContent = `${n} vidéo${n !== 1 ? "s" : ""}`;
  galleryVideos.forEach((clip, idx) => {
    const item = document.createElement("article");
    item.className = "gallery-item gallery-item-video";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", "Lire la vidéo " + (idx + 1));
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
      openGalleryVideoItem(clip, idx);
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGalleryVideoItem(clip, idx);
      }
    });
    videoGridNode.appendChild(item);
  });
}

async function boot() {
  setupGallerySelfieCta();
  setupGalleryVideoCta();
  setupPhotoLightbox();
  try {
    const cfg = await fetchJson("/api/booth-print-config");
    boothDirectPrint = !!cfg.directPrint;
  } catch {
    boothDirectPrint = false;
  }
  applyBoothPrintUi();
  const eventId = getEventId();
  if (!eventId) {
    titleNode.textContent = "Aucun evenement specifie.";
    if (selfieBtn) selfieBtn.hidden = true;
    if (videoAddBtn) videoAddBtn.hidden = true;
    setupInactivityListener();
    return;
  }
  if (selfieBtn) {
    selfieBtn.hidden = false;
    selfieBtn.href = getStudioUrl();
  }
  if (videoAddBtn) {
    videoAddBtn.hidden = false;
    videoAddBtn.href = getVideoStudioUrl();
  }
  setupInactivityListener();
  try {
    const eventData = await fetchJson(`/api/events/${encodeURIComponent(eventId)}`);
    titleNode.textContent = `Galerie: ${eventData.event.name}`;
    const [photosData, videosData] = await Promise.all([
      fetchJson(`/api/events/${encodeURIComponent(eventId)}/photos`),
      fetchJson(`/api/events/${encodeURIComponent(eventId)}/videos`),
    ]);
    renderPhotos(photosData.photos || []);
    renderVideos(videosData.videos || []);
  } catch (error) {
    titleNode.textContent = "Impossible de charger la galerie.";
  }
}

boot();
