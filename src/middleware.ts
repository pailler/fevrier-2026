import { NextRequest, NextResponse } from 'next/server';
import { CACHE_BUST_QUERY_KEYS } from '@/utils/cacheBustQueryParams';
import {
  CODE_LEARNING_LANDING_URL,
  isCodeLearningPublicHost,
  isCvGeneratorPublicHost,
  isIahomeMainHost,
  isMetubePublicHost,
  isPhotoboothPublicHost,
  isPsitransferPublicHost,
  isApprendreAutrementPublicHost,
  isDetecteurIaPublicHost,
  isResasSystemPublicHost,
  isReveilPublicHost,
  isRuinedFooocusPublicHost,
  isStableDiffusionPublicHost,
  METUBE_LANDING_URL,
  PHOTOBOOTH_LANDING_URL,
  PSITRANSFER_LANDING_URL,
  APPRENDRE_AUTREMENT_LANDING_URL,
  DETECTEUR_IA_LANDING_URL,
  RESAS_SYSTEM_LANDING_URL,
  REVEIL_LANDING_URL,
  RUINEDFOOOCUS_LANDING_URL,
  STABLEDIFFUSION_LANDING_URL,
  resolveRequestHost,
} from '@/utils/productLandingHosts';

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/stablediffusion-proxy',
  '/stablediffusion-direct',
  '/stablediffusion-iframe',
  '/stablediffusion-iframe-secure',
  '/stablediffusion-simple',
  '/stablediffusion-redirect',
  '/simple-stablediffusion',
  '/module',
  '/modules-access',
  '/secure-access',
  '/admin/dashboard'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  const host = resolveRequestHost(request);

  // Ancienne landing exemple → sous-domaine public
  if (request.method === 'GET' && pathname.startsWith('/exemple-seo/code-learning')) {
    return NextResponse.redirect(`${CODE_LEARNING_LANDING_URL}/`, 301);
  }

  // Landing publique sur code-learning.iahome.fr
  if (isCodeLearningPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/code-learning';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/code-learning';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/code-learning';
      return NextResponse.rewrite(url);
    }
  }

  // Landing publique sur detecteur-ia.iahome.fr
  if (isDetecteurIaPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/detecteur-ia';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/detecteur-ia';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/ai-detector' || pathname.startsWith('/ai-detector/')) {
      const dest = new URL('https://iahome.fr/ai-detector');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const dest = new URL('https://iahome.fr/ai-detector');
        dest.searchParams.set('token', token);
        return NextResponse.redirect(dest.toString(), 302);
      }
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/detecteur-ia';
      return NextResponse.rewrite(url);
    }
  }

  // API JSON PsiTransfer sur le sous-domaine public (extensions .json exclues par le matcher général)
  if (
    isPsitransferPublicHost(host) &&
    (pathname === '/config.json' ||
      pathname === '/lang.json' ||
      /^\/[^/]+\.json$/.test(pathname) ||
      pathname.startsWith('/files/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    url.pathname = `/api/proxy-psitransfer/${subPath}`;
    return NextResponse.rewrite(url);
  }

  // Assets statiques PsiTransfer sur le sous-domaine public (matcher inclut /assets et /app)
  if (
    isPsitransferPublicHost(host) &&
    (pathname.startsWith('/assets/') || pathname.startsWith('/app/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    url.pathname = `/api/proxy-psitransfer/${subPath}`;
    return NextResponse.rewrite(url);
  }

  // psitransfer.iahome.fr : landing SEO sans token, app + partages via proxy Docker
  if (isPsitransferPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/psitransfer';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/psitransfer';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      const url = request.nextUrl.clone();
      if (token) {
        // App avec jeton (accès direct historique psitransfer.iahome.fr/?token=)
        url.pathname = '/api/proxy-psitransfer';
        return NextResponse.rewrite(url);
      }
      url.pathname = '/product-landing/psitransfer';
      return NextResponse.rewrite(url);
    }
    // Liens de partage, assets, API… → service PsiTransfer (:8087)
    const url = request.nextUrl.clone();
    const subPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    url.pathname = subPath ? `/api/proxy-psitransfer/${subPath}` : '/api/proxy-psitransfer';
    return NextResponse.rewrite(url);
  }

  // cv.iahome.fr : landing + app via proxy vers cv-generator (:3003)
  if (isCvGeneratorPublicHost(host)) {
    const url = request.nextUrl.clone();
    const subPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    url.pathname = subPath ? `/api/proxy-cv-generator/${subPath}` : '/api/proxy-cv-generator';
    return NextResponse.rewrite(url);
  }

  // Landing publique sur metube.iahome.fr
  if (isMetubePublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/metube';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/metube';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/metube' || pathname.startsWith('/metube/')) {
      const dest = new URL('https://iahome.fr/metube');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/metube';
      return NextResponse.rewrite(url);
    }
  }

  // Landing publique sur ruinedfooocus.iahome.fr
  if (isRuinedFooocusPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/ruinedfooocus';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/ruinedfooocus';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/ruinedfooocus' || pathname.startsWith('/ruinedfooocus/')) {
      const dest = new URL('https://iahome.fr/ruinedfooocus');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const dest = new URL('https://iahome.fr/ruinedfooocus');
        dest.searchParams.set('token', token);
        return NextResponse.redirect(dest.toString(), 302);
      }
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/ruinedfooocus';
      return NextResponse.rewrite(url);
    }
  }

  // Landing publique sur stablediffusion.iahome.fr
  if (isStableDiffusionPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/stablediffusion';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/stablediffusion';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/stablediffusion' || pathname.startsWith('/stablediffusion/')) {
      const dest = new URL('https://iahome.fr/stablediffusion');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const dest = new URL('https://iahome.fr/stablediffusion');
        dest.searchParams.set('token', token);
        return NextResponse.redirect(dest.toString(), 302);
      }
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/stablediffusion';
      return NextResponse.rewrite(url);
    }
  }

  // Landing publique sur resas.iahome.fr
  if (isResasSystemPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/resas-system';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/resas-system';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/resas-system' || pathname.startsWith('/resas-system/')) {
      const dest = new URL('https://iahome.fr/resas-system');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const dest = new URL('https://iahome.fr/resas-system');
        dest.searchParams.set('token', token);
        return NextResponse.redirect(dest.toString(), 302);
      }
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/resas-system';
      return NextResponse.rewrite(url);
    }
  }

  // Landing publique sur apprendre-autrement.iahome.fr
  if (isApprendreAutrementPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/apprendre-autrement';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/apprendre-autrement';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/apprendre-autrement' || pathname.startsWith('/apprendre-autrement/')) {
      const dest = new URL('https://iahome.fr/apprendre-autrement');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const dest = new URL('https://iahome.fr/apprendre-autrement');
        dest.searchParams.set('token', token);
        return NextResponse.redirect(dest.toString(), 302);
      }
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/apprendre-autrement';
      return NextResponse.rewrite(url);
    }
  }

  // Landing publique sur reveil.iahome.fr
  if (isReveilPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/reveil';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/reveil';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/reveil' || pathname.startsWith('/reveil/')) {
      const dest = new URL('https://iahome.fr/reveil');
      const token = request.nextUrl.searchParams.get('token');
      if (token) dest.searchParams.set('token', token);
      return NextResponse.redirect(dest.toString(), 302);
    }
    if (pathname === '/' || pathname === '') {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const dest = new URL('https://iahome.fr/reveil');
        dest.searchParams.set('token', token);
        return NextResponse.redirect(dest.toString(), 302);
      }
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/reveil';
      return NextResponse.rewrite(url);
    }
  }

  // Ancien host → landing SEO reveil.iahome.fr
  if (
    host === 'reveil-intelligent.iahome.fr' ||
    host === 'www.reveil-intelligent.iahome.fr'
  ) {
    const dest = new URL(`${REVEIL_LANDING_URL}/`);
    const token = request.nextUrl.searchParams.get('token');
    if (token) {
      dest.pathname = '/';
      const app = new URL('https://iahome.fr/reveil');
      app.searchParams.set('token', token);
      return NextResponse.redirect(app.toString(), 302);
    }
    return NextResponse.redirect(dest.toString(), 301);
  }

  // Landing publique sur photobooth.iahome.fr
  if (isPhotoboothPublicHost(host)) {
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-sitemaps/photobooth';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/product-robots/photobooth';
      return NextResponse.rewrite(url);
    }
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = '/product-landing/photobooth';
      return NextResponse.rewrite(url);
    }
  }

  // App PsiTransfer (proxy interne iframe → service :8087)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/psitransfer/embed' || pathname.startsWith('/psitransfer/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/psitransfer/embed'
        ? ''
        : pathname.slice('/psitransfer/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-psitransfer/${subPath}`
      : '/api/proxy-psitransfer';
    return NextResponse.rewrite(url);
  }

  // App MeTube (proxy interne iframe → service :8081)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/metube/embed' || pathname.startsWith('/metube/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/metube/embed'
        ? ''
        : pathname.slice('/metube/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-metube-embed/${subPath}`
      : '/api/proxy-metube-embed';
    return NextResponse.rewrite(url);
  }

  // MeTube Socket.IO : pathname + "socket.io" → /metube/embedsocket.io (sans slash)
  if (
    isIahomeMainHost(host) &&
    (pathname.startsWith('/metube/embedsocket.io') ||
      pathname.startsWith('/metube/embed/socket.io'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/proxy-metube-socket';
    return NextResponse.rewrite(url);
  }

  // App Photobooth (proxy interne iframe → service :7885)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/photobooth/embed' || pathname.startsWith('/photobooth/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/photobooth/embed'
        ? ''
        : pathname.slice('/photobooth/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-photobooth/${subPath}`
      : '/api/proxy-photobooth';
    return NextResponse.rewrite(url);
  }

  // App RuinedFooocus (proxy interne iframe → service :7870)
  // root Gradio doit finir par / (réécrit dans le proxy) ; l’URL page peut être sans slash (Next trailingSlash).
  if (
    isIahomeMainHost(host) &&
    (pathname === '/ruinedfooocus/embed' ||
      pathname === '/ruinedfooocus/embed/' ||
      pathname.startsWith('/ruinedfooocus/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/ruinedfooocus/embed' || pathname === '/ruinedfooocus/embed/'
        ? ''
        : pathname.slice('/ruinedfooocus/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-ruinedfooocus/${subPath}`
      : '/api/proxy-ruinedfooocus';
    return NextResponse.rewrite(url);
  }

  // App Stable Diffusion (proxy interne iframe → service :7880)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/stablediffusion/embed' ||
      pathname === '/stablediffusion/embed/' ||
      pathname.startsWith('/stablediffusion/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/stablediffusion/embed' || pathname === '/stablediffusion/embed/'
        ? ''
        : pathname.slice('/stablediffusion/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-stablediffusion/${subPath}`
      : '/api/proxy-stablediffusion';
    return NextResponse.rewrite(url);
  }

  // App Resas System (proxy interne iframe → service :5000)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/resas-system/embed' || pathname.startsWith('/resas-system/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/resas-system/embed'
        ? ''
        : pathname.slice('/resas-system/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-resas-system/${subPath}`
      : '/api/proxy-resas-system';
    return NextResponse.rewrite(url);
  }

  // App Apprendre Autrement (proxy interne iframe → service :9001)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/apprendre-autrement/embed' || pathname.startsWith('/apprendre-autrement/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/apprendre-autrement/embed'
        ? ''
        : pathname.slice('/apprendre-autrement/embed/'.length);
    url.pathname = subPath
      ? `/api/proxy-apprendre-autrement/${subPath}`
      : '/api/proxy-apprendre-autrement';
    return NextResponse.rewrite(url);
  }

  // App Réveil Intelligent (proxy interne iframe → service :7891)
  if (
    isIahomeMainHost(host) &&
    (pathname === '/reveil/embed' ||
      pathname === '/reveil/embed/' ||
      pathname.startsWith('/reveil/embed/'))
  ) {
    const url = request.nextUrl.clone();
    const subPath =
      pathname === '/reveil/embed' || pathname === '/reveil/embed/'
        ? ''
        : pathname.slice('/reveil/embed/'.length);
    url.pathname = subPath ? `/api/proxy-reveil/${subPath}` : '/api/proxy-reveil';
    return NextResponse.rewrite(url);
  }

  // App sans token → landing publique sur le sous-domaine
  if (
    request.method === 'GET' &&
    isIahomeMainHost(host) &&
    pathname === '/metube' &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/metube', request.url), 302);
    }
    return NextResponse.redirect(`${METUBE_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique RuinedFooocus (sous-domaine).
  // Avec ?token= → passerelle /ruinedfooocus → /ruinedfooocus/embed (Gradio).
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    isIahomeMainHost(host) &&
    (pathname === '/ruinedfooocus' || pathname === '/ruinedfooocus/') &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/ruinedfooocus', request.url), 302);
    }
    return NextResponse.redirect(`${RUINEDFOOOCUS_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique Stable Diffusion (sous-domaine).
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    isIahomeMainHost(host) &&
    (pathname === '/stablediffusion' || pathname === '/stablediffusion/') &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/stablediffusion', request.url), 302);
    }
    return NextResponse.redirect(`${STABLEDIFFUSION_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique Resas (sous-domaine).
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    isIahomeMainHost(host) &&
    (pathname === '/resas-system' || pathname === '/resas-system/') &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/resas-system', request.url), 302);
    }
    return NextResponse.redirect(`${RESAS_SYSTEM_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique Apprendre Autrement (sous-domaine).
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    isIahomeMainHost(host) &&
    (pathname === '/apprendre-autrement' || pathname === '/apprendre-autrement/') &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/apprendre-autrement', request.url), 302);
    }
    return NextResponse.redirect(`${APPRENDRE_AUTREMENT_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique Réveil (sous-domaine).
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    isIahomeMainHost(host) &&
    (pathname === '/reveil' || pathname === '/reveil/') &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/reveil', request.url), 302);
    }
    return NextResponse.redirect(`${REVEIL_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique sur le sous-domaine
  if (
    request.method === 'GET' &&
    isIahomeMainHost(host) &&
    pathname === '/psitransfer' &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/psitransfer', request.url), 302);
    }
    return NextResponse.redirect(`${PSITRANSFER_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique sur le sous-domaine
  if (
    request.method === 'GET' &&
    isIahomeMainHost(host) &&
    pathname === '/photobooth' &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/photobooth', request.url), 302);
    }
    return NextResponse.redirect(`${PHOTOBOOTH_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique sur le sous-domaine
  if (
    request.method === 'GET' &&
    isIahomeMainHost(host) &&
    pathname === '/code-learning' &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/code-learning', request.url), 302);
    }
    return NextResponse.redirect(`${CODE_LEARNING_LANDING_URL}/`, 302);
  }

  // App sans token → landing publique Détecteur IA (sous-domaine).
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    isIahomeMainHost(host) &&
    (pathname === '/ai-detector' || pathname === '/ai-detector/') &&
    !request.nextUrl.searchParams.get('token')
  ) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL('/product-landing/detecteur-ia', request.url), 302);
    }
    return NextResponse.redirect(`${DETECTEUR_IA_LANDING_URL}/`, 302);
  }

  // Normaliser les URL avec paramètres techniques (301/308 → URL canonique sans _v, _h, …)
  if (request.method === 'GET') {
    const u = new URL(request.url);
    let stripped = false;
    for (const key of CACHE_BUST_QUERY_KEYS) {
      if (u.searchParams.has(key)) {
        u.searchParams.delete(key);
        stripped = true;
      }
    }
    if (stripped) {
      return NextResponse.redirect(u, 308);
    }
  }

  // Hi3DGen : sur localhost:8095, la racine sert l'app (réécriture — l'URL reste http://…:8095/)
  if ((hostname === 'localhost:8095' || hostname === '127.0.0.1:8095') && (pathname === '/' || pathname === '')) {
    const url = request.nextUrl.clone();
    url.pathname = '/card/hi3dgen';
    return NextResponse.rewrite(url);
  }

  // Hunyuan3D (sous-domaine legacy) → Hi3DGen intégré dans Next.js
  if (
    (hostname === 'hunyuan3d.iahome.fr' || hostname === 'www.hunyuan3d.iahome.fr') &&
    (pathname === '/' || pathname === '')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/card/hi3dgen';
    return NextResponse.rewrite(url);
  }

  // Protection LibreSpeed : Si accès via librespeed.iahome.fr
  // Avec Redirect Rules Cloudflare, cette protection est déjà gérée par Redirect Rules
  // Le middleware ne fait que vérifier le token et laisser passer si valide
  const isLibreSpeed = hostname === 'librespeed.iahome.fr' || 
                       hostname.includes('librespeed.iahome.fr') ||
                       xForwardedHost === 'librespeed.iahome.fr' ||
                       xForwardedHost.includes('librespeed.iahome.fr');
  
  if (isLibreSpeed) {
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('🔒 LibreSpeed détecté - Token:', token ? 'présent' : 'absent');
    
    if (token) {
      // Token présent - laisser passer vers LibreSpeed
      // Rewrite vers le service LibreSpeed local via Cloudflare Tunnel
      console.log('✅ LibreSpeed: Token présent, laisser passer vers LibreSpeed');
      // Ne pas rediriger, laisser Cloudflare Tunnel gérer le routage
      // Le service localhost:8085 sera accessible via Cloudflare Tunnel
      return NextResponse.next();
    } else {
      // Aucun token - Redirect Rules devrait avoir déjà intercepté
      // Si on arrive ici, c'est que Redirect Rules n'a pas fonctionné
      // Rediriger vers la route de protection
      console.log('🛡️ LibreSpeed: Accès direct bloqué (pas de token), redirection vers iahome.fr');
      return NextResponse.redirect('https://iahome.fr/api/librespeed-redirect', 302);
    }
  }

  // Middleware simplifié pour éviter les boucles infinies
  // Ne fait que les redirections essentielles
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Pour l'instant, rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    const returnPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', returnPath);
    return NextResponse.redirect(loginUrl);
  }

  // Bloquer complètement /token-generated AVANT toute autre chose
  if (pathname === '/token-generated') {
    // Retourner une 404 immédiatement, sans passer par le reste du middleware
    return new NextResponse('Page non trouvée', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Réécritures Socket.IO (MeTube) — path racine /socket.io ou variante embed
  if (pathname.startsWith('/socket.io')) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/proxy-metube-socket';
    return NextResponse.rewrite(url);
  }

  // Pages admin : pas de cache (toujours fraîches)
  const noCachePaths = ['/admin'];
  if (noCachePaths.some(p => pathname.startsWith(p))) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sitemap.xml',
    '/robots.txt',
    // Proxies embed + assets PsiTransfer/Photobooth (extensions .css/.js exclues par la règle ci-dessous)
    '/psitransfer/embed/:path*',
    '/photobooth/embed/:path*',
    '/metube/embed/:path*',
    '/metube/embedsocket.io/:path*',
    '/ruinedfooocus/embed',
    '/ruinedfooocus/embed/',
    '/ruinedfooocus/embed/:path*',
    '/stablediffusion/embed',
    '/stablediffusion/embed/',
    '/stablediffusion/embed/:path*',
    '/resas-system/embed/:path*',
    '/apprendre-autrement/embed/:path*',
    '/reveil/embed',
    '/reveil/embed/',
    '/reveil/embed/:path*',
    '/socket.io/:path*',
    '/assets/:path*',
    '/app/:path*',
    '/config.json',
    '/lang.json',
    '/files/:path*',
    '/:bucket.json',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}; 