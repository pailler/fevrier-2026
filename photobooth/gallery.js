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
  window.location.href = getChoicePageUrl();
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

function renderPhotos(photos) {
  gridNode.innerHTML = "";
  countNode.textContent = `${photos.length} photo${photos.length > 1 ? "s" : ""}`;

  photos.forEach((photo, idx) => {
    const item = document.createElement("article");
    item.className = "gallery-item";
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = `Photo ${idx + 1}`;
    item.appendChild(image);
    gridNode.appendChild(item);
  });
}

async function boot() {
  const eventId = getEventId();
  if (!eventId) {
    titleNode.textContent = "Aucun evenement specifie.";
    backBtn.href = "./index.html";
    backBtn.addEventListener("click", (e) => { e.preventDefault(); goBackToChoice(); });
    setupInactivityListener();
    return;
  }
  backBtn.href = getChoicePageUrl();
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    goBackToChoice();
  });
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
