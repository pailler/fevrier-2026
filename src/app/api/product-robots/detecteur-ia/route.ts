import { getDetecteurIaRobotsTxt } from '@/utils/productSitemap';

export async function GET() {
  return new Response(getDetecteurIaRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
