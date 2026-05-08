(function () {
  const statusEl = document.getElementById("pickup-status");
  const imgWrap = document.getElementById("pickup-img-wrap");
  const imgEl = document.getElementById("pickup-img");
  const actionsEl = document.getElementById("pickup-actions");
  const downloadEl = document.getElementById("pickup-download");
  const shareBtn = document.getElementById("pickup-share");
  const smsEl = document.getElementById("pickup-sms");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("t") || params.get("token");

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle("error", Boolean(isError));
  }

  if (!token || !/^[a-f0-9]{40,64}$/i.test(token)) {
    setStatus("Lien incomplet ou invalide.", true);
    return;
  }

  fetch(`/api/pickup-info?token=${encodeURIComponent(token)}`)
    .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
    .then(({ ok, d }) => {
      if (!ok || !d.imageUrl) {
        setStatus(d.error || "Lien expiré ou invalide.", true);
        return;
      }
      setStatus("Enregistrez ou partagez votre cliché ci-dessous.", false);
      imgEl.src = d.imageUrl;
      imgWrap.hidden = false;

      downloadEl.href = d.imageUrl;
      downloadEl.setAttribute("download", "photobooth-photo.jpg");

      const body = encodeURIComponent(`Photo Photobooth : ${d.pickupUrl || window.location.href}`);
      smsEl.href = `sms:?&body=${body}`;

      shareBtn.addEventListener("click", async () => {
        const url = d.pickupUrl || window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Photo Photobooth",
              text: "Voici ma photo du photobooth.",
              url,
            });
          } catch (e) {
            if (e && e.name !== "AbortError") setStatus("Partage annulé ou indisponible.", true);
          }
        } else {
          setStatus("Partage non supporté sur ce navigateur — utilisez Télécharger ou SMS.", true);
        }
      });

      actionsEl.hidden = false;
    })
    .catch(() => {
      setStatus("Impossible de charger la photo.", true);
    });
})();
