import { PHOTOBOOTH_LANDING_REEL_URL } from '@/data/photobooth-landing-seo';
import { extractYouTubeVideoId, normalizeYouTubeEmbedUrl } from '@/utils/youtubeUtils';

const REEL_VIDEO_ID = extractYouTubeVideoId(PHOTOBOOTH_LANDING_REEL_URL) ?? 'LYnGoUxKKZs';

const EMBED_URL = normalizeYouTubeEmbedUrl(
  `https://www.youtube.com/watch?v=${REEL_VIDEO_ID}`,
  {
    autoplay: 0,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
    origin: 'https://photobooth.iahome.fr',
  }
);

/** Shorts YouTube 9:16 — dimensions explicites (pas de classes Tailwind arbitraires). */
const REEL_WIDTH_PX = 300;
const REEL_HEIGHT_PX = Math.round((REEL_WIDTH_PX * 16) / 9);

export default function PhotoboothReelEmbed() {
  return (
    <div
      className="mx-auto overflow-hidden rounded-2xl bg-black shadow-2xl shadow-amber-400/10 ring-1 ring-white/15"
      style={{
        width: '100%',
        maxWidth: REEL_WIDTH_PX,
        height: REEL_HEIGHT_PX,
      }}
    >
      <iframe
        src={EMBED_URL}
        title="Photobooth IAHome — reel événement"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
