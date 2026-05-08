/**
 * Pipeline « identité d’abord » : le rendu ajoute décor / typo autour du sujet,
 * sans recadrage ni warp du visage (l’IA lourde — InstantID / IP-Adapter — reste branchée côté serveur si besoin).
 */
(function (global) {
  "use strict";

  var STYLES = ["none", "royal", "cinema", "luxe", "disney", "magazine"];

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function normalizeStyleKey(styleKey) {
    var s = String(styleKey || "");
    return STYLES.indexOf(s) >= 0 ? s : "none";
  }

  /** Calque final : image source au centre, marges décoratives pour le style. */
  function renderStyledPhoto(sourceCanvas, styleKey, meta) {
    var style = normalizeStyleKey(styleKey);
    var w = sourceCanvas.width;
    var h = sourceCanvas.height;
    if (!w || !h) return sourceCanvas;

    var margin = Math.round(Math.min(w, h) * 0.06);
    if (style === "none") margin = 0;
    var outW = w + margin * 2;
    var outH = h + margin * 2;

    var out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    var ctx = out.getContext("2d");

    // Fond selon style
    if (style === "none") {
      ctx.drawImage(sourceCanvas, 0, 0);
      return out;
    }

    var bgGrad = ctx.createLinearGradient(0, 0, outW, outH);
    switch (style) {
      case "royal":
        bgGrad.addColorStop(0, "#1a0f2e");
        bgGrad.addColorStop(0.5, "#2d1b4e");
        bgGrad.addColorStop(1, "#0f172a");
        break;
      case "cinema":
        bgGrad.addColorStop(0, "#0c0c0c");
        bgGrad.addColorStop(1, "#1c1917");
        break;
      case "luxe":
        bgGrad.addColorStop(0, "#faf7f2");
        bgGrad.addColorStop(0.5, "#e8e0d5");
        bgGrad.addColorStop(1, "#cfc4b5");
        break;
      case "disney":
        bgGrad.addColorStop(0, "#4c1d95");
        bgGrad.addColorStop(0.4, "#7c3aed");
        bgGrad.addColorStop(1, "#312e81");
        break;
      case "magazine":
        bgGrad.addColorStop(0, "#f8fafc");
        bgGrad.addColorStop(1, "#e2e8f0");
        break;
      default:
        bgGrad.addColorStop(0, "#0f172a");
        bgGrad.addColorStop(1, "#334155");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, outW, outH);

    // Légère ombre portée sous la photo (effet premium)
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = margin * 0.8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = margin * 0.15;
    ctx.drawImage(sourceCanvas, margin, margin, w, h);
    ctx.shadowColor = "transparent";

    var title = (meta && meta.eventName) || "Souvenir";
    var dateStr = (meta && meta.dateStr) || "";

    ctx.save();
    if (style === "royal") {
      drawRoyalFrame(ctx, outW, outH, margin, title, dateStr);
    } else if (style === "cinema") {
      drawCinemaFrame(ctx, outW, outH, margin, title);
    } else if (style === "luxe") {
      drawLuxeFrame(ctx, outW, outH, margin, title, dateStr);
    } else if (style === "disney") {
      drawDisneyFrame(ctx, outW, outH, margin, title);
    } else if (style === "magazine") {
      drawMagazineFrame(ctx, outW, outH, margin, title, dateStr);
    }
    ctx.restore();

    return out;
  }

  function drawRoyalFrame(ctx, W, H, m, title, dateStr) {
    var line = Math.max(3, Math.floor(m * 0.12));
    ctx.strokeStyle = "rgba(212,175,55,0.95)";
    ctx.lineWidth = line;
    ctx.strokeRect(m * 0.35, m * 0.35, W - m * 0.7, H - m * 0.7);

    ctx.font =
      "600 " + Math.floor(clamp(H * 0.028, 14, 22)) + "px 'Georgia','Times New Roman',serif";
    ctx.fillStyle = "rgba(253,230,138,0.95)";
    ctx.textAlign = "center";
    ctx.fillText("✦ " + title + " ✦", W / 2, H - m * 0.45);
    if (dateStr) {
      ctx.font = "400 " + Math.floor(clamp(H * 0.022, 11, 16)) + "px Georgia,serif";
      ctx.fillStyle = "rgba(254,243,199,0.85)";
      ctx.fillText(dateStr, W / 2, H - m * 0.25);
    }
    ctx.textAlign = "left";
  }

  function drawCinemaFrame(ctx, W, H, m, title) {
    var band = Math.floor(H * 0.06);
    ctx.fillStyle = "rgba(0,0,0,0.92)";
    ctx.fillRect(0, 0, W, band);
    ctx.fillRect(0, H - band, W, band);
    ctx.font = "700 " + Math.floor(clamp(H * 0.032, 12, 20)) + "px 'Arial Narrow',Arial,sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.fillText(title.toUpperCase(), W / 2, band * 0.62);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (var i = 0; i < 400; i++) {
      var x = Math.random() * W;
      var y = Math.random() * H;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function drawLuxeFrame(ctx, W, H, m, title, dateStr) {
    ctx.strokeStyle = "rgba(120,113,108,0.55)";
    ctx.lineWidth = Math.max(1, Math.floor(m * 0.06));
    ctx.strokeRect(m * 0.5, m * 0.5, W - m, H - m);

    ctx.font =
      "300 " + Math.floor(clamp(H * 0.026, 12, 18)) + "px 'Helvetica Neue',Helvetica,Arial,sans-serif";
    ctx.fillStyle = "rgba(68,64,60,0.9)";
    ctx.textAlign = "center";
    ctx.letterSpacing = "0.12em";
    ctx.fillText(title.toUpperCase(), W / 2, H - m * 0.35);
    ctx.letterSpacing = "normal";
    if (dateStr) {
      ctx.font = "300 " + Math.floor(clamp(H * 0.02, 10, 14)) + "px Helvetica,Arial,sans-serif";
      ctx.fillStyle = "rgba(87,83,78,0.75)";
      ctx.fillText(dateStr, W / 2, H - m * 0.18);
    }
    ctx.textAlign = "left";
  }

  function drawDisneyFrame(ctx, W, H, m, title) {
    ctx.font = Math.floor(clamp(H * 0.04, 18, 32)) + "px serif";
    ctx.textAlign = "center";
    ctx.fillText("✨", m * 0.55, m * 0.65);
    ctx.fillText("✨", W - m * 0.55, m * 0.65);
    ctx.fillText("✨", m * 0.55, H - m * 0.5);
    ctx.fillText("✨", W - m * 0.55, H - m * 0.5);

    ctx.strokeStyle = "rgba(253,224,71,0.5)";
    ctx.lineWidth = Math.max(2, Math.floor(m * 0.1));
    ctx.beginPath();
    var r = Math.min(W, H) * 0.04;
    roundRectPath(ctx, m * 0.25, m * 0.25, W - m * 0.5, H - m * 0.5, r);
    ctx.stroke();

    ctx.font =
      "600 " + Math.floor(clamp(H * 0.03, 14, 24)) + "px 'Comic Sans MS','Segoe UI',cursive,sans-serif";
    ctx.fillStyle = "rgba(254,249,195,0.98)";
    ctx.fillText(title, W / 2, H - m * 0.35);
    ctx.textAlign = "left";
  }

  function drawMagazineFrame(ctx, W, H, m, title, dateStr) {
    var mh = Math.floor(H * 0.12);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, mh);
    ctx.font =
      "800 italic " + Math.floor(clamp(mh * 0.45, 16, 28)) + "px 'Georgia',serif";
    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "left";
    ctx.fillText("MOMENTS", m * 0.4, mh * 0.62);

    ctx.font = "600 " + Math.floor(clamp(H * 0.022, 10, 15)) + "px Helvetica,Arial,sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Souvenir d'une belle journée", m * 0.4, H - m * 0.42);

    ctx.font = "700 " + Math.floor(clamp(H * 0.038, 16, 28)) + "px Georgia,serif";
    ctx.fillStyle = "#1e293b";
    ctx.textAlign = "center";
    wrapText(ctx, title, W / 2, H - m * 0.28, W * 0.75, Math.floor(clamp(H * 0.04, 14, 22)));
    if (dateStr) {
      ctx.font = "400 " + Math.floor(clamp(H * 0.02, 10, 14)) + "px Arial,sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(dateStr, W / 2, H - m * 0.12);
    }
    ctx.textAlign = "left";
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = String(text).split(/\s+/);
    var line = "";
    var yy = y;
    for (var n = 0; n < words.length; n++) {
      var test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), x, yy);
        line = words[n] + " ";
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), x, yy);
  }

  global.PhotoPipelineStyles = {
    STYLES: STYLES,
    normalizeStyleKey: normalizeStyleKey,
    renderStyledPhoto: renderStyledPhoto,
    styleLabels: {
      none: "Original (sans décor)",
      royal: "Royal",
      cinema: "Cinéma",
      luxe: "Luxe",
      disney: "Conte enchanté",
      magazine: "Magazine",
    },
  };
})(typeof window !== "undefined" ? window : this);
