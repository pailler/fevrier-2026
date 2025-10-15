import { NextRequest, NextResponse } from 'next/server';
import { MeTubeAccessService } from './utils/metubeAccess';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Vérifier si c'est une requête vers MeTube
  if (pathname.startsWith('/metube') || pathname.startsWith('/api/metube')) {
    console.log('🔒 MeTube Middleware: Vérification d\'accès pour', pathname);
    
    // Récupérer le token depuis l'URL
    const token = url.searchParams.get('token');
    
    if (!token) {
      ;
      return NextResponse.redirect('https://iahome.fr/login?redirect=/encours', 302);
    }
    
    // Valider le token
    const metubeService = MeTubeAccessService.getInstance();
    const tokenValidation = await metubeService.validateToken(token);
    
    if (!tokenValidation.hasAccess) {
      console.log('❌ MeTube Middleware: Token invalide -', tokenValidation.reason);
      return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(tokenValidation.reason || 'Accès refusé')}`, 302);
    }
    
    // Incrémenter le compteur d'utilisation
    if (tokenValidation.userId) {
      await metubeService.incrementUsage(tokenValidation.userId);
    }
    
    ;
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/metube/:path*',
    '/api/metube/:path*'
  ]
};
