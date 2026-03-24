const titleNode = document.getElementById("gallery-title");
const countNode = document.getElementById("gallery-count");
const gridNode = document.getElementById("gallery-grid");
const backBtn = document.getElementById("gallery-back");

const INACTIVITY_MS = 60 * 1000; // 1 minute
let inactivityTimer = null;

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

function openPhotoFullscreen(url, alt) {
  var lb = document.getElementById("photo-lightbox");
  var img = document.getElementById("photo-lightbox-img");
  if (!lb || !img) return;
  img.src = url;
  img.alt = alt || "Photo";
  lb.classList.add("active");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePhotoFullscreen() {
  var lb = document.getElementById("photo-lightbox");
  if (!lb) return;
  lb.classList.remove("active");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  var img = document.getElementById("photo-lightbox-img");
  if (img) img.src = "";
}

function setupPhotoLightbox() {
  var lb = document.getElementById("photo-lightbox");
  var closeBtn = lb && lb.querySelector(".photo-lightbox-close");
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("photo-lightbox-close")) {
        closePhotoFullscreen();
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closePhotoFullscreen);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePhotoFullscreen();
  });
}

function renderPhotos(photos) {
  gridNode.innerHTML = "";
  countNode.textContent = `${photos.length} photo${photos.length > 1 ? "s" : ""}`;

  photos.forEach((photo, idx) => {
    const item = document.createElement("article");
    item.className = "gallery-item";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", "Voir la photo " + (idx + 1) + " en plein écran");
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = "Photo " + (idx + 1);
    item.appendChild(image);
    item.addEventListener("click", function () {
      openPhotoFullscreen(photo.url, image.alt);
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPhotoFullscreen(photo.url, image.alt);
      }
    });
    gridNode.appendChild(item);
  });
}

async function boot() {
  setupPhotoLightbox();
  const eventId = getEventId();
  if (!eventId) {
    titleNode.textContent = "Aucun evenement specifie.";
    backBtn.href = "./index.html";
    setupInactivityListener();
    return;
  }
  backBtn.href = getChoicePageUrl();
  setupInactivityListener();
  try {
    const eventData = await fetchJson(`/api/events/${encodeURIComponent(eventId)}`);
    titleNode.textContent = `Galerie: ${eventData.event.name}`;
    const photosData = await fetchJson(`/api/events/${encodeURIComponent(eventId)}/photos`);
    renderPhotos(photosData.photos || []);
  } catch (error) {
    titleNode.textContent = "Impossible de charger la galerie.";
  }
}

boot();
