const titleNode = document.getElementById("gallery-title");
const countNode = document.getElementById("gallery-count");
const gridNode = document.getElementById("gallery-grid");

function getEventId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("eventId");
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
    return;
  }
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
