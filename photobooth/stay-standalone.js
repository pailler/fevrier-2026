/**
 * Stay Standalone - Garde le mode plein écran iOS lors de la navigation
 * Empêche les liens internes d'ouvrir Safari au lieu de rester dans l'app web
 * @see https://gist.github.com/irae/1042167
 */
(function (document, navigator, standalone) {
  function isStandalone() {
    return standalone in navigator && navigator[standalone];
  }

  if (isStandalone()) {
    var location = document.location;
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
        var isInternal =
          chref &&
          chref.replace(location.href, "").indexOf("#") !== 0 &&
          (!/^[a-z+.\\-]+:/i.test(chref) ||
            chref.indexOf(location.protocol + "//" + location.host) === 0);
        if (isInternal) {
          e.preventDefault();
          location.href = chref;
        }
      },
      false
    );
  }

  window.navigateInApp = function (url) {
    if (isStandalone()) {
      var a = document.createElement("a");
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      location.href = url;
    }
  };
})(document, window.navigator, "standalone");
