/**
 * PWA / plein ecran iOS : garder la navigation dans la meme fenetre (ne pas ouvrir Safari).
 * @see https://gist.github.com/irae/1042167
 *
 * iPadOS / Safari recents : un clic programme sur <a> (synthetic) peut etre ignore hors geste
 * utilisateur direct ; on utilise location.assign pour navigateInApp (retour, inactivite, etc.).
 */
(function (document, window, navigator, standalone) {
  function isLegacyStandalone() {
    return standalone in navigator && navigator[standalone];
  }

  function isDisplayModeStandalone() {
    try {
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
        return true;
      }
      if (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) {
        return true;
      }
    } catch (e) {
      /* noop */
    }
    return false;
  }

  function isStandalone() {
    return isLegacyStandalone() || isDisplayModeStandalone();
  }

  if (isStandalone()) {
    var pageLoc = document.location;

    function isSameAppOrigin(href) {
      if (!href) return false;
      if (String(href).indexOf("#") === 0) return true;
      try {
        var target = new URL(href, pageLoc.href);
        var current = new URL(pageLoc.href);
        return target.origin === current.origin;
      } catch (e) {
        return false;
      }
    }

    var stop = /^(a|html)$/i;
    document.addEventListener(
      "click",
      function (e) {
        var curnode = e.target;
        while (curnode && !stop.test(curnode.nodeName)) {
          curnode = curnode.parentNode;
        }
        if (!curnode || curnode.nodeName.toLowerCase() !== "a") return;
        var chref = curnode.href;
        if (isSameAppOrigin(chref)) {
          e.preventDefault();
          pageLoc.href = chref;
        }
      },
      false
    );
  }

  /**
   * Navigation depuis le JS (retour, minuterie, etc.) : assign() fonctionne sur iOS recents
   * quand un .click() synthetique ne declenche plus la navigation.
   */
  window.navigateInApp = function (url) {
    if (typeof url !== "string" || !url) return;
    try {
      window.location.assign(url);
    } catch (e) {
      window.location.href = url;
    }
  };
})(document, window, window.navigator, "standalone");
