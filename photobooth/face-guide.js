/**
 * Détection de visages côté navigateur (FaceDetector : Chromium).
 * — Safari / WebKit : pas d’API → pas de cadres live (usage cible iPad).
 * — Avec détecteur : cadres numérotés + statut, sans repère ovale (désactivé produit).
 */
(function (global) {
  "use strict";

  var detector = null;
  var raf = 0;
  var lastContainer = null;

  var MAX_FACES = 12;

  function canUseFaceDetector() {
    return typeof FaceDetector !== "undefined";
  }

  function ensureDetector() {
    if (!canUseFaceDetector()) return null;
    if (!detector) {
      try {
        detector = new FaceDetector({ fastMode: false, maxDetectedFaces: MAX_FACES });
      } catch (e) {
        detector = null;
      }
    }
    return detector;
  }

  function readFaceRect(bb) {
    if (!bb) return null;
    var x = bb.x != null ? bb.x : bb.left;
    var y = bb.y != null ? bb.y : bb.top;
    var w = bb.width;
    var h = bb.height;
    if (x == null || y == null || !w || !h) return null;
    return { x: x, y: y, width: w, height: h };
  }

  function sortFacesReadingOrder(faces) {
    if (!faces || !faces.length) return [];
    return faces.slice().sort(function (a, b) {
      var ra = readFaceRect(a.boundingBox);
      var rb = readFaceRect(b.boundingBox);
      if (!ra || !rb) return 0;
      if (ra.x !== rb.x) return ra.x - rb.x;
      return ra.y - rb.y;
    });
  }

  function faceUnionBBox(faces) {
    var sorted = sortFacesReadingOrder(faces);
    if (!sorted.length) return null;
    var minX = Infinity;
    var minY = Infinity;
    var maxX = 0;
    var maxY = 0;
    sorted.forEach(function (f) {
      var b = readFaceRect(f.boundingBox);
      if (!b) return;
      var x = b.x;
      var y = b.y;
      var rw = b.width;
      var rh = b.height;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + rw);
      maxY = Math.max(maxY, y + rh);
    });
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /**
   * @param {HTMLCanvasElement | HTMLImageElement | HTMLVideoElement} source
   * @returns {Promise<Array>}
   */
  function detectFaces(source) {
    var det = ensureDetector();
    if (!det || !source) return Promise.resolve([]);
    return det.detect(source).then(sortFacesReadingOrder).catch(function () {
      return [];
    });
  }

  function mapVideoRectToOverlay(faceBox, videoEl, containerEl, ctx) {
    var vw = videoEl.videoWidth;
    var vh = videoEl.videoHeight;
    if (!vw || !vh || !containerEl) return null;
    var cw = containerEl.clientWidth;
    var ch = containerEl.clientHeight;
    if (!cw || !ch) return null;
    var scale = Math.max(cw / vw, ch / vh);
    var dispW = vw * scale;
    var dispH = vh * scale;
    var offX = (cw - dispW) / 2;
    var offY = (ch - dispH) / 2;
    var bx = faceBox.x;
    var by = faceBox.y;
    var bw = faceBox.width;
    var bh = faceBox.height;
    var x = offX + bx * scale;
    var y = offY + by * scale;
    var w = bw * scale;
    var h = bh * scale;
    x = cw - x - w;
    var dpr = ctx ? ctx.canvas.width / cw : 1;
    return { x: x * dpr, y: y * dpr, w: w * dpr, h: h * dpr };
  }

  function drawOverlayFaces(ctx, facesOrdered, videoEl, containerEl) {
    if (!ctx || !videoEl || !containerEl) return;
    var cw = containerEl.clientWidth;
    var ch = containerEl.clientHeight;
    if (!cw || !ch) return;
    var hues = [142, 330, 200, 38, 270, 24, 190, 310, 160, 280];
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = Math.max(3, Math.round(ctx.canvas.width / 280));
    ctx.font = "700 " + Math.round(ctx.canvas.width * 0.042) + "px system-ui, 'Segoe UI', sans-serif";
    ctx.textBaseline = "top";

    facesOrdered.forEach(function (face, i) {
      var rect = readFaceRect(face.boundingBox);
      if (!rect) return;
      var r = mapVideoRectToOverlay(rect, videoEl, containerEl, ctx);
      if (!r) return;
      var hue = hues[i % hues.length];
      ctx.strokeStyle = "hsla(" + hue + ", 85%, 48%, 0.98)";
      ctx.fillStyle = "hsla(" + hue + ", 85%, 48%, 0.22)";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      var label = String(i + 1);
      var pad = ctx.lineWidth * 2;
      var tw = ctx.measureText(label).width;
      var lh = Math.max(18, Math.round(ctx.canvas.width * 0.04));
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(r.x + pad, r.y + pad, tw + pad * 2, lh + pad);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, r.x + pad * 2, r.y + pad * 1.15);
    });
    ctx.restore();
  }

  function sizeOverlayCanvas(canvas, container) {
    if (!canvas || !container) return 1;
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var w = container.clientWidth;
    var h = container.clientHeight;
    var nw = Math.floor(w * dpr);
    var nh = Math.floor(h * dpr);
    if (canvas.width !== nw || canvas.height !== nh) {
      canvas.width = nw;
      canvas.height = nh;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
    return dpr;
  }

  /** Repère ovale désactivé : cadres numérotés + statut conservés si FaceDetector. */
  function setPreviewFaceGuideOvalVisible(containerEl, ovalEl) {
    if (containerEl) {
      containerEl.classList.add("no-face-detector");
    }
    if (ovalEl) {
      ovalEl.hidden = true;
      ovalEl.classList.remove("face-guide-oval--active");
    }
  }

  /** Au chargement studio : pas d’ovale. */
  function syncPreviewFaceGuideUi(containerEl, ovalEl) {
    setPreviewFaceGuideOvalVisible(containerEl, ovalEl);
  }

  function describeFaceCount(n) {
    if (!canUseFaceDetector()) {
      return "Pas de détection auto (Safari / WebKit) — placez-vous au centre de l’image, lumière de face.";
    }
    if (n <= 0) return "Aucun visage détecté pour l’instant — centrez-vous dans l’image.";
    if (n === 1)
      return "1 visage — cadre n°1 à l’écran. Ajoutez une 2e personne pour voir les sujets 1, 2, 3… de gauche à droite.";
    return (
      n +
      " visages — sujets numérotés 1, 2, 3… de gauche à droite sur l’image."
    );
  }

  function startFaceGuide(videoEl, statusEl, ovalEl, overlayCanvas, containerEl) {
    stopFaceGuide();
    lastContainer = containerEl || null;
    var det = ensureDetector();
    setPreviewFaceGuideOvalVisible(containerEl, ovalEl);
    if (!det || !videoEl) {
      if (statusEl) {
        if (!videoEl) {
          statusEl.textContent =
            "Conseil : placez-vous face à la lumière, fond neutre si possible, regardez l’objectif.";
        } else if (!canUseFaceDetector()) {
          statusEl.textContent =
            "Sur iPad / Safari : pas de cadres visage auto — centrez-vous, lumière de face, regardez l’objectif.";
        } else {
          statusEl.textContent =
            "Repère visage indisponible sur cet appareil — placez-vous au centre, lumière de face.";
        }
        statusEl.className = "face-guide-status face-guide-status--hint";
      }
      return;
    }

    var inFlight = false;

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!videoEl.videoWidth) return;
      if (overlayCanvas && containerEl) {
        sizeOverlayCanvas(overlayCanvas, containerEl);
      }
      if (inFlight) return;
      inFlight = true;
      det
        .detect(videoEl)
        .then(function (faces) {
          var ordered = sortFacesReadingOrder(faces || []);
          if (containerEl) {
            containerEl.classList.toggle("has-multi-face-guides", ordered.length > 1);
          }
          if (statusEl) {
            statusEl.textContent = describeFaceCount(ordered.length);
            if (ordered.length > 1) {
              statusEl.className = "face-guide-status face-guide-status--group";
            } else if (ordered.length === 1) {
              statusEl.className = "face-guide-status face-guide-status--ok";
            } else {
              statusEl.className = "face-guide-status face-guide-status--warn";
            }
          }
          if (ovalEl) {
            ovalEl.classList.toggle("face-guide-oval--active", ordered.length > 0);
          }
          if (overlayCanvas && containerEl) {
            var ctx = overlayCanvas.getContext("2d");
            if (ordered.length) {
              drawOverlayFaces(ctx, ordered, videoEl, containerEl);
            } else {
              ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            }
          }
        })
        .catch(function () {
          if (containerEl) {
            containerEl.classList.remove("has-multi-face-guides");
          }
          if (statusEl) {
            statusEl.textContent =
              "Analyse momentanément indisponible — recentrez-vous, bonne lumière, puis réessayez.";
            statusEl.className = "face-guide-status face-guide-status--hint";
          }
          if (overlayCanvas) {
            var ctx2 = overlayCanvas.getContext("2d");
            ctx2.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          }
        })
        .finally(function () {
          inFlight = false;
        });
    }

    raf = requestAnimationFrame(tick);
  }

  function stopFaceGuide() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (lastContainer) {
      lastContainer.classList.remove("has-multi-face-guides");
    }
  }

  global.PhotoFaceGuide = {
    canUseFaceDetector: canUseFaceDetector,
    syncPreviewFaceGuideUi: syncPreviewFaceGuideUi,
    startFaceGuide: startFaceGuide,
    stopFaceGuide: stopFaceGuide,
    detectFaces: detectFaces,
    faceUnionBBox: faceUnionBBox,
    sortFacesReadingOrder: sortFacesReadingOrder,
    describeFaceCount: describeFaceCount,
  };
})(typeof window !== "undefined" ? window : this);
