import { getResasSystemSitemapXml } from '@/utils/productSitemap';

export async function GET() {
  const xml = getResasSystemSitemapXml();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
