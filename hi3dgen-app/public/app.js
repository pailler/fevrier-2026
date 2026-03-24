(function () {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const placeholder = document.getElementById('placeholder');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const fileName = document.getElementById('fileName');
  const changeImage = document.getElementById('changeImage');
  const generateBtn = document.getElementById('generateBtn');
  const errorEl = document.getElementById('error');
  const loadingEl = document.getElementById('loading');
  const resultEl = document.getElementById('result');
  const downloadLink = document.getElementById('downloadLink');

  let currentFile = null;

  function show(element) {
    element.classList.remove('hidden');
  }
  function hide(element) {
    element.classList.add('hidden');
  }

  function setPreview(file) {
    if (!file) {
      currentFile = null;
      show(placeholder);
      hide(imagePreview);
      generateBtn.disabled = true;
      return;
    }
    currentFile = file;
    hide(placeholder);
    show(imagePreview);
    previewImg.src = URL.createObjectURL(file);
    fileName.textContent = file.name;
    generateBtn.disabled = false;
    hide(errorEl);
    hide(resultEl);
  }

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setPreview(file);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) setPreview(file);
  });

  changeImage.addEventListener('click', () => {
    fileInput.value = '';
    setPreview(null);
  });

  generateBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    hide(errorEl);
    hide(resultEl);
    show(loadingEl);
    generateBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('image', currentFile);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.detail || data?.error || `Erreur ${res.status}`;
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = 'hi3dgen-output.glb';
      show(resultEl);
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Erreur lors de la génération';
      if (msg.startsWith('[object ') || !msg.trim()) {
        msg = 'Erreur lors de la génération. Vérifiez que le serveur Hi3DGen tourne (port 8095).';
      }
      errorEl.textContent = msg;
      show(errorEl);
    } finally {
      hide(loadingEl);
      generateBtn.disabled = false;
    }
  });
})();
