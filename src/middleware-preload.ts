import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Intercepter les réponses HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    response.headers.set('Content-Type', 'text/html; charset=utf-8');
    
    // Ajouter un script pour supprimer les preloads immédiatement
    const script = `
      <script>
        (function() {
          // Supprimer immédiatement les preloads problématiques
          function removePreloads() {
            const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
            fontLinks.forEach(link => {
              console.log('🗑️ Middleware: Suppression preload police:', link.getAttribute('href'));
              link.remove();
            });
            
            const imageLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
            imageLinks.forEach(link => {
              console.log('🗑️ Middleware: Suppression preload image:', link.getAttribute('href'));
              link.remove();
            });
          }
          
          // Exécuter immédiatement
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removePreloads);
          } else {
            removePreloads();
          }
          
          // Répéter la suppression
          setInterval(removePreloads, 50);
        })();
      </script>
    `;
    
    // Injecter le script dans le HTML
    response.headers.set('X-Preload-Cleaner', 'enabled');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};