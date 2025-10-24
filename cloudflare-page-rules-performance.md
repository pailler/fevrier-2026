# 🚀 Configuration Page Rules Cloudflare pour les Performances

## **Page Rules Recommandées (dans l'ordre de priorité)**

### **1. Cache des Assets Statiques**
- **URL Pattern**: `iahome.fr/_next/static/*`
- **Settings**:
  - Cache Level: `Cache Everything`
  - Edge Cache TTL: `1 month`
  - Browser Cache TTL: `1 month`

### **2. Cache des Images**
- **URL Pattern**: `iahome.fr/images/*`
- **Settings**:
  - Cache Level: `Cache Everything`
  - Edge Cache TTL: `1 week`
  - Browser Cache TTL: `1 week`

### **3. Cache des Fonts**
- **URL Pattern**: `iahome.fr/fonts/*`
- **Settings**:
  - Cache Level: `Cache Everything`
  - Edge Cache TTL: `1 month`
  - Browser Cache TTL: `1 month`

### **4. Optimisation des API**
- **URL Pattern**: `iahome.fr/api/*`
- **Settings**:
  - Cache Level: `Bypass Cache`
  - Browser Cache TTL: `Respect Existing Headers`

### **5. Compression et Optimisations**
- **URL Pattern**: `iahome.fr/*`
- **Settings**:
  - Auto Minify: `HTML, CSS, JS`
  - Brotli: `On`
  - Rocket Loader: `On`
  - Mirage: `On`

## **Configuration Cloudflare Speed**

### **Speed Tab Settings**
1. **Auto Minify**: ✅ HTML, CSS, JS
2. **Brotli**: ✅ On
3. **Rocket Loader**: ✅ On
4. **Mirage**: ✅ On
5. **Polish**: ✅ Lossless
6. **WebP**: ✅ On

### **Caching Tab Settings**
1. **Caching Level**: Standard
2. **Browser Cache TTL**: 4 hours
3. **Always Online**: ✅ On
4. **Development Mode**: ❌ Off (en production)

## **Configuration Cloudflare Workers (Optionnel)**

Pour des optimisations avancées, vous pouvez utiliser Cloudflare Workers :

```javascript
// Worker pour optimiser les performances
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Optimisations pour les assets statiques
  if (url.pathname.startsWith('/_next/static/')) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return newResponse
  }
  
  // Optimisations pour les images
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Cache-Control', 'public, max-age=2592000')
    return newResponse
  }
  
  return fetch(request)
}
```

## **Monitoring des Performances**

### **Métriques à Surveiller**
1. **Time to First Byte (TTFB)**: < 200ms
2. **First Contentful Paint (FCP)**: < 1.8s
3. **Largest Contentful Paint (LCP)**: < 2.5s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **First Input Delay (FID)**: < 100ms

### **Outils de Monitoring**
- Cloudflare Analytics
- Google PageSpeed Insights
- WebPageTest
- Lighthouse (Chrome DevTools)


