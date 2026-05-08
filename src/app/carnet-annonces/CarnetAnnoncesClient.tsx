'use client';

import { useEffect, useState } from 'react';
import { Calendar, Euro, ExternalLink, Home, MapPin, Square } from 'lucide-react';

export type CarnetProperty = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  surface?: number | null;
  rooms?: number | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  region?: string | null;
  source: string;
  url: string;
  images?: string[] | null;
  is_new?: boolean | null;
  first_seen_at: string;
};

export default function CarnetAnnoncesClient() {
  const [items, setItems] = useState<CarnetProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/real-estate/carnet-annonces', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Erreur ${res.status}`);
        }
        if (!cancelled) {
          setItems(Array.isArray(data.properties) ? data.properties : []);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Chargement impossible');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-600">
        <div className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p>Chargement des annonces…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 max-w-xl mx-auto">
        {err}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Home className="w-14 h-14 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium text-gray-700">Aucun bien en base pour le moment</p>
        <p className="text-sm mt-2">Les biens issus des recherches apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => {
        const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
        return (
          <article
            key={p.id}
            className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="h-44 w-full object-cover bg-gray-100" />
            ) : (
              <div className="h-44 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Home className="w-12 h-12 text-slate-400" />
              </div>
            )}
            <div className="p-4 flex flex-col flex-1 gap-2">
              <h2 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{p.title}</h2>
              {p.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-gray-700 mt-auto pt-2">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  <Euro className="w-4 h-4" />
                  {Number(p.price).toLocaleString('fr-FR')} €
                </span>
                {p.surface != null && (
                  <span className="inline-flex items-center gap-1">
                    <Square className="w-4 h-4 text-gray-400" />
                    {p.surface} m²
                  </span>
                )}
                {p.rooms != null && (
                  <span className="inline-flex items-center gap-1">
                    <Home className="w-4 h-4 text-gray-400" />
                    {p.rooms} pièces
                  </span>
                )}
              </div>
              {(p.city || p.address) && (
                <div className="flex items-start gap-1 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">
                    {[p.address, p.postal_code, p.city].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span className="truncate max-w-[50%]" title={p.source}>
                  {p.source}
                </span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(p.first_seen_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {p.is_new && (
                <span className="self-start text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Nouveau
                </span>
              )}
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 mt-2 w-full py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 transition-colors"
              >
                Voir l&apos;annonce
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
