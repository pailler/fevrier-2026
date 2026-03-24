'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export default function Hi3DGenPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('A 3D model with detailed geometry and texture');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const handleGenerate = async () => {
    if (!image) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', prompt);

      const res = await fetch('/api/hi3dgen/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const e = data?.error;
        let errMsg: string;
        if (typeof e === 'string') errMsg = e;
        else if (e?.message != null) errMsg = typeof e.message === 'string' ? e.message : JSON.stringify(e.message);
        else if (e != null) errMsg = JSON.stringify(e);
        else errMsg = `Erreur ${res.status}`;
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      let msg: string;
      if (err instanceof Event) {
        msg = 'Erreur lors de la génération';
      } else if (err instanceof Error) {
        msg = err.message;
      } else if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        msg = (err as { message: string }).message;
      } else {
        msg = 'Erreur lors de la génération';
      }
      if (msg.startsWith('[object ') || !msg.trim()) {
        msg = 'Erreur lors de la génération. Vérifiez que ComfyUI est bien lancé (port 8188) avec ComfyUI-Hi3DGen.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Hi3DGen — Image vers 3D' },
          ]}
        />

        <div className="mt-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hi3DGen — Image vers 3D
          </h1>
          <p className="text-gray-600 mb-8">
            Générez un modèle 3D à partir d&apos;une image. Haute fidélité géométrique grâce à Hi3DGen (ComfyUI-Hi3DGen).
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${image ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-300 bg-gray-50/50'}
            `}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
                <p className="text-sm text-gray-600">{image.name}</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Changer d&apos;image
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-2">Glissez une image ici ou cliquez pour sélectionner</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  Choisir une image
                </label>
              </>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt (optionnel)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Description pour guider la génération 3D..."
            />
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading || !image}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Génération en cours (2–5 min)...
                </span>
              ) : (
                'Générer le modèle 3D'
              )}
            </button>
            <Link
              href="/card/comfyui"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              ComfyUI complet
            </Link>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {resultUrl && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="font-semibold text-emerald-900 mb-2">Modèle 3D généré</h3>
              <p className="text-sm text-emerald-800 mb-4">
                Téléchargez le fichier GLB pour l&apos;utiliser dans Blender, Unity, etc.
              </p>
              <a
                href={resultUrl}
                download="hi3dgen-output.glb"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Télécharger le fichier GLB
              </a>
            </div>
          )}

          <p className="mt-8 text-sm text-gray-500">
            ComfyUI doit être lancé (port 8188) avec le custom node <strong>ComfyUI-Hi3DGen</strong>. Accès : http://localhost:8095
          </p>
        </div>
      </div>
    </div>
  );
}
