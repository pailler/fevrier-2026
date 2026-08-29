import { APPRENDRE_AUTREMENT_PUBLIC_ORIGIN, CODE_LEARNING_PUBLIC_ORIGIN, DETECTEUR_IA_PUBLIC_ORIGIN, METUBE_PUBLIC_ORIGIN, PHOTOBOOTH_PUBLIC_ORIGIN, PSITRANSFER_PUBLIC_ORIGIN, RESAS_SYSTEM_PUBLIC_ORIGIN, REVEIL_PUBLIC_ORIGIN, RUINEDFOOOCUS_PUBLIC_ORIGIN, STABLEDIFFUSION_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
      if (entry.priority != null) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function getCodeLearningSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${CODE_LEARNING_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getPhotoboothSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${PHOTOBOOTH_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getPsiTransferSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${PSITRANSFER_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getMeTubeSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${METUBE_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getRuinedFooocusSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${RUINEDFOOOCUS_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getResasSystemSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${RESAS_SYSTEM_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getPhotoboothRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${PHOTOBOOTH_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${PHOTOBOOTH_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getCodeLearningRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${CODE_LEARNING_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${CODE_LEARNING_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getPsiTransferRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${PSITRANSFER_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${PSITRANSFER_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getMeTubeRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /metube/',
    '',
    `Sitemap: ${METUBE_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${METUBE_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getRuinedFooocusRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /ruinedfooocus/',
    '',
    `Sitemap: ${RUINEDFOOOCUS_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${RUINEDFOOOCUS_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getResasSystemRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /resas-system/',
    '',
    `Sitemap: ${RESAS_SYSTEM_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${RESAS_SYSTEM_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getApprendreAutrementSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${APPRENDRE_AUTREMENT_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getApprendreAutrementRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /apprendre-autrement/',
    '',
    `Sitemap: ${APPRENDRE_AUTREMENT_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${APPRENDRE_AUTREMENT_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getReveilSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${REVEIL_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getReveilRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /reveil/',
    '',
    `Sitemap: ${REVEIL_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${REVEIL_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getStableDiffusionSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${STABLEDIFFUSION_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getStableDiffusionRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /stablediffusion/',
    '',
    `Sitemap: ${STABLEDIFFUSION_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${STABLEDIFFUSION_PUBLIC_ORIGIN}`,
  ].join('\n');
}

export function getDetecteurIaSitemapXml(lastModified = new Date()): string {
  return buildSitemapXml([
    {
      loc: `${DETECTEUR_IA_PUBLIC_ORIGIN}/`,
      lastmod: lastModified.toISOString(),
      changefreq: 'weekly',
      priority: 1,
    },
  ]);
}

export function getDetecteurIaRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /ai-detector/',
    '',
    `Sitemap: ${DETECTEUR_IA_PUBLIC_ORIGIN}/sitemap.xml`,
    `Host: ${DETECTEUR_IA_PUBLIC_ORIGIN}`,
  ].join('\n');
}
