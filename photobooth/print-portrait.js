/**
 * Impression portrait Postcard 4×6 — iPad / AirPrint / SELPHY.
 * Priorité : about:blank (sans URL dans le pied de page Safari) → iframe about:blank → fallbacks.
 */
(function (global) {
  "use strict";

  var PRINT_ROTATION_DEG = 90;
  var PRINT_EXPORT_WIDTH = 1200;
  var PRINT_EXPORT_HEIGHT = 1800;
  /** Sur-échelle JPEG (cover + rognage) — plus élevé sur iPad / PWA écran d'accueil. */
  var PRINT_BLEED_SCALE = 1.28;
  var PRINT_BLEED_SCALE_IOS = 1.38;
  var PRINT_BLEED_SCALE_IOS_STANDALONE = 1.48;
  var PRINT_PAGE_SIZE = "4in 6in";

  function getEffectiveBleedScale() {
    if (isIosLikeDevice() && isStandaloneWebApp()) return PRINT_BLEED_SCALE_IOS_STANDALONE;
    if (isIosLikeDevice()) return PRINT_BLEED_SCALE_IOS;
    return PRINT_BLEED_SCALE;
  }

  function getPrintBleedInsets() {
    if (isIosLikeDevice() && isStandaloneWebApp()) {
      return { top: "-0.26in", left: "-0.26in", width: "4.52in", height: "6.52in" };
    }
    if (isIosLikeDevice()) {
      return { top: "-0.2in", left: "-0.2in", width: "4.4in", height: "6.4in" };
    }
    return { top: "-0.14in", left: "-0.14in", width: "4.28in", height: "6.28in" };
  }

  function isIosLikeDevice() {
    var ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function isStandaloneWebApp() {
    if (navigator.standalone === true) return true;
    try {
      return !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    } catch (_e) {
      return false;
    }
  }

  function isLegacyIosWebKit() {
    if (!isIosLikeDevice()) return false;
    var m = (navigator.userAgent || "").match(/OS (\d+)[_.]/);
    if (m) return parseInt(m[1], 10) <= 12;
    return false;
  }

  function dataUrlToBlobUrl(dataUrl) {
    var parts = String(dataUrl || "").match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (!parts) return null;
    try {
      var binary = atob(String(parts[2]).replace(/\s/g, ""));
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes], { type: parts[1] }));
    } catch (_e) {
      return null;
    }
  }

  function isPostcardPortrait(w, h) {
    if (!w || !h || h <= w) return false;
    var ratio = w / h;
    return ratio > 0.62 && ratio < 0.72;
  }

  /** Ratio 2:3 portrait (après rotation d’un paysage 3:2) — pas de rognage cover. */
  function isNearPostcardPortraitRatio(w, h) {
    if (!w || !h) return false;
    var ratio = w / h;
    if (h > w) return ratio > 0.62 && ratio < 0.72;
    return Math.abs(ratio - 1.5) < 0.04;
  }

  function buildPrintCss() {
    var bleed = getPrintBleedInsets();
    return (
      "@page{margin:0;size:" +
      PRINT_PAGE_SIZE +
      " portrait;size:portrait}" +
      "@page :first{margin:0}" +
      "html,body{width:4in;height:6in;margin:0!important;padding:0!important;" +
      "overflow:hidden!important;background:#000!important;" +
      "page-break-after:avoid;page-break-inside:avoid;" +
      "-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      "body *{display:none!important}" +
      "img#pb-print-img{display:block!important;visibility:visible!important;" +
      "position:fixed!important;top:0!important;left:0!important;" +
      "width:4in!important;height:6in!important;min-width:4in!important;min-height:6in!important;" +
      "max-width:none!important;max-height:none!important;" +
      "margin:0!important;padding:0!important;border:0!important;" +
      "object-fit:fill!important;object-position:center center!important;" +
      "page-break-before:avoid!important;page-break-after:avoid!important;page-break-inside:avoid!important;" +
      "-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      "@media print{@page{margin:0;size:" +
      PRINT_PAGE_SIZE +
      " portrait;size:portrait}" +
      "@page :first{margin:0}" +
      "html,body{width:4in!important;height:6in!important;max-height:6in!important;" +
      "overflow:hidden!important;page-break-after:avoid!important}" +
      "img#pb-print-img{top:" +
      bleed.top +
      "!important;left:" +
      bleed.left +
      "!important;" +
      "width:" +
      bleed.width +
      "!important;height:" +
      bleed.height +
      "!important;object-fit:fill!important;" +
      "page-break-before:avoid!important;page-break-after:avoid!important;page-break-inside:avoid!important}}"
    );
  }

  function buildAutoPrintScript() {
    var delay = isLegacyIosWebKit() ? 950 : 450;
    return (
      "<script>(function(){var d=false;var i=document.getElementById('pb-print-img');" +
      "function f(){if(d)return;d=true;setTimeout(function(){try{window.focus();window.print();}catch(e){}}," +
      delay +
      ");}" +
      "window.addEventListener('afterprint',function(){setTimeout(function(){try{window.close();}catch(e){}},500);});" +
      "if(i){i.onload=f;if(i.complete&&i.naturalWidth)f();}else f();" +
      "setTimeout(f," +
      (delay + 2200) +
      ");})();<\/script>"
    );
  }

  function buildPrintStandaloneDocument(imageSrc, withAutoPrintScript) {
    var src = String(imageSrc || "").replace(/"/g, "&quot;");
    var autoPrint = withAutoPrintScript !== false ? buildAutoPrintScript() : "";
    return (
      "<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">" +
      "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">" +
      "<title> </title><style>" +
      buildPrintCss() +
      "</style></head><body>" +
      "<img id=\"pb-print-img\" src=\"" +
      src +
      "\" alt=\"\">" +
      autoPrint +
      "</body></html>"
    );
  }

  function buildPrintPortraitDataUrl(sourceImg) {
    if (!sourceImg) return null;
    var srcW = sourceImg.naturalWidth || sourceImg.width;
    var srcH = sourceImg.naturalHeight || sourceImg.height;
    if (!srcW || !srcH) return null;

    var outW = PRINT_EXPORT_WIDTH;
    var outH = PRINT_EXPORT_HEIGHT;
    var finalCanvas = document.createElement("canvas");
    finalCanvas.width = outW;
    finalCanvas.height = outH;
    var outCtx = finalCanvas.getContext("2d");
    if (!outCtx) return null;
    outCtx.fillStyle = "#000";
    outCtx.fillRect(0, 0, outW, outH);

    var isPortraitPostcard = isPostcardPortrait(srcW, srcH);
    var sourceForDraw = sourceImg;
    var rotW = srcW;
    var rotH = srcH;

    if (!isPortraitPostcard) {
      var rotCanvas = document.createElement("canvas");
      rotCanvas.width = srcH;
      rotCanvas.height = srcW;
      var rotCtx = rotCanvas.getContext("2d");
      if (!rotCtx) return null;
      rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rotCtx.rotate((PRINT_ROTATION_DEG * Math.PI) / 180);
      rotCtx.drawImage(sourceImg, -srcW / 2, -srcH / 2);
      sourceForDraw = rotCanvas;
      rotW = srcH;
      rotH = srcW;
    }

    /* Paysage 3:2 ou portrait 2:3 : remplissage exact — conserve cadre + légende incrustés. */
    if (isNearPostcardPortraitRatio(rotW, rotH)) {
      outCtx.drawImage(sourceForDraw, 0, 0, outW, outH);
    } else {
      var scale = Math.max(outW / rotW, outH / rotH) * getEffectiveBleedScale();
      var drawW = rotW * scale;
      var drawH = rotH * scale;
      var offsetX = drawW > outW ? (outW - drawW) / 2 : 0;
      var offsetY = drawH > outH ? (outH - drawH) / 2 : 0;
      outCtx.drawImage(sourceForDraw, offsetX, offsetY, drawW, drawH);
    }

    try {
      return finalCanvas.toDataURL("image/jpeg", 0.92);
    } catch (_e) {
      return null;
    }
  }

  function buildPrintPortraitDataUrlFromCanvas(canvas) {
    if (!canvas || !canvas.width || !canvas.height) return null;
    return buildPrintPortraitDataUrl(canvas);
  }

  function getPrintIframe() {
    var frame = document.getElementById("photo-print-iframe");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "photo-print-iframe";
      frame.setAttribute("aria-hidden", "true");
      frame.title = "Impression photo";
      frame.style.cssText =
        "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
      document.body.appendChild(frame);
    }
    return frame;
  }

  function notifyFeedback(opts, text, isError) {
    if (opts && typeof opts.onFeedback === "function") {
      opts.onFeedback(text, isError);
    }
  }

  function printViaServerJpegThenBlank(dataUrl, opts) {
    if (!isIosLikeDevice()) return Promise.resolve(false);
    return fetch("/api/print-portrait", {
      method: "POST",
      credentials: "same-origin",
      referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: dataUrl }),
    })
      .then(function (resp) {
        return resp.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!resp.ok || !data.imageUrl) throw new Error("prep");
          var origin = window.location.origin || "";
          var imgUrl = origin + data.imageUrl;
          var printWin = window.open("about:blank", "photobooth_print");
          if (!printWin) return false;
          printWin.document.open();
          printWin.document.write(buildPrintStandaloneDocument(imgUrl, true));
          printWin.document.close();
          notifyFeedback(
            opts,
            "Page 1 — photo agrandie pour remplir la carte postale.",
            false
          );
          return true;
        });
      })
      .catch(function () {
        return false;
      });
  }

  function printViaAboutBlankWindow(dataUrl, opts) {
    var blobUrl = dataUrlToBlobUrl(dataUrl);
    var imageSrc = blobUrl || dataUrl;
    var printWin;
    try {
      /* Sans noopener : iPad / Safari 2015 doit pouvoir écrire dans la fenêtre et éviter le pied de page URL. */
      printWin = window.open("about:blank", "photobooth_print");
    } catch (_e) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return false;
    }
    if (!printWin) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return false;
    }

    try {
      printWin.document.open();
      printWin.document.write(buildPrintStandaloneDocument(imageSrc, true));
      printWin.document.close();
    } catch (_writeErr) {
      try {
        printWin.close();
      } catch (_closeErr) {
        /* pass */
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return false;
    }

    if (blobUrl) {
      setTimeout(function () {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_e) {
          /* pass */
        }
      }, 180000);
    }

    notifyFeedback(opts, "AirPrint : carte postale, page 1, photo agrandie.", false);
    return true;
  }

  function printViaAboutBlankIframe(dataUrl, opts) {
    var frame = getPrintIframe();
    var blobUrl = dataUrlToBlobUrl(dataUrl);
    var imageSrc = blobUrl || dataUrl;
    var printed = false;
    var delay = isLegacyIosWebKit() ? 950 : 450;

    function doPrint() {
      if (printed) return;
      printed = true;
      setTimeout(function () {
        try {
          var win = frame.contentWindow;
          if (!win) throw new Error("iframe");
          win.focus();
          win.print();
          notifyFeedback(opts, "AirPrint : carte postale, page 1, photo agrandie.", false);
        } catch (_e) {
          notifyFeedback(opts, "Erreur impression. Réessayez.", true);
        }
      }, delay);
    }

    function writeDoc(doc) {
      doc.open();
      doc.write(buildPrintStandaloneDocument(imageSrc, false));
      doc.close();
      var img = doc.getElementById("pb-print-img");
      if (img) {
        img.onload = doPrint;
        if (img.complete && img.naturalWidth) doPrint();
      } else {
        doPrint();
      }
      setTimeout(doPrint, delay + 2200);
    }

    try {
      frame.onload = function () {
        try {
          writeDoc(frame.contentDocument);
        } catch (_e) {
          notifyFeedback(opts, "Erreur impression. Réessayez.", true);
        }
      };
      frame.removeAttribute("srcdoc");
      frame.src = "about:blank";
    } catch (_e) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return false;
    }

    if (blobUrl) {
      setTimeout(function () {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_e2) {
          /* pass */
        }
      }, 180000);
    }
    return true;
  }

  function openPrintWindow(url, opts) {
    var printWin = window.open(url, "photobooth_print");
    if (printWin) {
      notifyFeedback(opts, "AirPrint : carte postale, page 1, photo agrandie.", false);
      return true;
    }
    return false;
  }

  function triggerIframeSrcdocPrint(dataUrl, opts) {
    var frame = getPrintIframe();
    var printed = false;
    var delay = isLegacyIosWebKit() ? 950 : 450;
    frame.onload = function () {
      if (printed) return;
      printed = true;
      setTimeout(function () {
        try {
          var win = frame.contentWindow;
          if (!win) throw new Error("iframe");
          win.focus();
          win.print();
          notifyFeedback(opts, "AirPrint : carte postale, page 1, photo agrandie.", false);
        } catch (_e) {
          notifyFeedback(opts, "Erreur impression. Réessayez.", true);
        }
      }, delay);
    };
    frame.onerror = function () {
      notifyFeedback(opts, "Erreur chargement image.", true);
    };
    frame.removeAttribute("src");
    frame.srcdoc = buildPrintStandaloneDocument(dataUrl, false);
    return true;
  }

  function openPortraitPrintPageFallback(dataUrl, opts) {
    try {
      sessionStorage.setItem("pb-print-src", dataUrl);
      sessionStorage.setItem("pb-print-return", window.location.href);
      if (openPrintWindow("./print.html", opts)) return true;
      window.location.href = "./print.html";
      return true;
    } catch (_storageErr) {
      /* pass */
    }

    return fetch("/api/print-portrait", {
      method: "POST",
      credentials: "same-origin",
      referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: dataUrl }),
    })
      .then(function (resp) {
        return resp.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!resp.ok) throw new Error(data.error || "Erreur preparation");
          if (openPrintWindow(data.printSheetUrl, opts)) return true;
          window.location.href = data.printSheetUrl;
          return true;
        });
      })
      .catch(function () {
        triggerIframeSrcdocPrint(dataUrl, opts);
        return true;
      });
  }

  /**
   * @param {string} dataUrl JPEG data URL (paysage ou portrait)
   * @param {{ onFeedback?: function(string, boolean): void }} [opts]
   */
  function openPortraitPrintPage(dataUrl, opts) {
    if (!dataUrl) {
      notifyFeedback(opts, "Impossible de preparer l'impression.", true);
      return false;
    }
    notifyFeedback(opts, "Ouverture du pilote d'impression…", false);

    if (isIosLikeDevice()) {
      printViaServerJpegThenBlank(dataUrl, opts).then(function (ok) {
        if (ok) return;
        if (printViaAboutBlankWindow(dataUrl, opts)) return;
        if (printViaAboutBlankIframe(dataUrl, opts)) return;
        var fallback = openPortraitPrintPageFallback(dataUrl, opts);
        if (fallback && typeof fallback.then === "function") {
          fallback.catch(function () {
            notifyFeedback(opts, "Erreur impression. Réessayez.", true);
          });
        }
      });
      return true;
    }

    if (printViaAboutBlankWindow(dataUrl, opts)) return true;
    if (printViaAboutBlankIframe(dataUrl, opts)) return true;

    var fallback = openPortraitPrintPageFallback(dataUrl, opts);
    if (fallback && typeof fallback.then === "function") {
      fallback.catch(function () {
        notifyFeedback(opts, "Erreur impression. Réessayez.", true);
      });
    }
    return true;
  }

  function printFromImageElement(img, opts) {
    if (!img) return false;
    var run = function () {
      var dataUrl = buildPrintPortraitDataUrl(img);
      if (!dataUrl) {
        notifyFeedback(opts, "Impossible de preparer l'impression.", true);
        return;
      }
      openPortraitPrintPage(dataUrl, opts);
    };
    if (!img.complete || !img.naturalWidth) {
      img.addEventListener("load", run, { once: true });
      return true;
    }
    run();
    return true;
  }

  function requestBoothPrint(eventId, filename, opts) {
    if (!eventId || !filename) {
      notifyFeedback(opts, "Fichier ou evenement manquant.", true);
      return Promise.reject(new Error("missing"));
    }
    notifyFeedback(opts, "Impression en cours…", false);
    return fetch("/api/events/" + encodeURIComponent(eventId) + "/print-to-booth", {
      method: "POST",
      credentials: "same-origin",
      referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: filename }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error((data && data.error) || "Echec");
          return data;
        });
      })
      .then(function () {
        notifyFeedback(opts, "Envoyé à l'imprimante.", false);
      });
  }

  global.PhotoboothPrint = {
    buildPrintCss: buildPrintCss,
    buildPrintStandaloneDocument: buildPrintStandaloneDocument,
    buildPrintPortraitDataUrl: buildPrintPortraitDataUrl,
    buildPrintPortraitDataUrlFromCanvas: buildPrintPortraitDataUrlFromCanvas,
    openPortraitPrintPage: openPortraitPrintPage,
    printFromImageElement: printFromImageElement,
    requestBoothPrint: requestBoothPrint,
    isIosLikeDevice: isIosLikeDevice,
    isStandaloneWebApp: isStandaloneWebApp,
    isLegacyIosWebKit: isLegacyIosWebKit,
  };
})(typeof window !== "undefined" ? window : this);
