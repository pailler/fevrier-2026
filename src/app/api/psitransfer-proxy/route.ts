import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { supabase } from '../../../utils/supabaseClient';

const PSITRANSFER_SERVICE_URL = process.env.PSITRANSFER_SERVICE_URL || 'http://localhost:8084';

// Fonction pour wrapper le contenu HTML avec la bannière IAHome
function wrapWithIAHomeBanner(html: string): string {
  const bannerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; z-index: 999999; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-bottom: 3px solid #1d4ed8; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; height: 3.5rem;">
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <a href="/" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit;">
              <div style="width: 2rem; height: 2rem; background: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
                <span style="color: #1e40af; font-weight: bold; font-size: 1rem;">I</span>
              </div>
              <span style="font-size: 1.25rem; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">IAhome</span>
            </a>
            <div style="display: flex; align-items: center; gap: 1rem; color: #e0e7ff; font-size: 0.875rem; font-weight: 500;">
              <span>Applications</span>
              <span style="color: #c7d2fe;">•</span>
              <span style="background: rgba(255, 255, 255, 0.2); padding: 0.375rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.3);">PsiTransfer</span>
            </div>
            <a href="/account" style="display: flex; align-items: center; gap: 0.5rem; color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; transition: all 0.3s; background: rgba(255, 255, 255, 0.15); border: 2px solid rgba(255, 255, 255, 0.3);" onmouseover="this.style.background='rgba(255, 255, 255, 0.25)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.transform='translateY(0)'">
              <span style="font-size: 1.1rem;">📱</span>
              <span>Mes applis</span>
            </a>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <a href="/" style="color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; transition: all 0.3s; background: rgba(255, 255, 255, 0.15); border: 2px solid rgba(255, 255, 255, 0.3);" onmouseover="this.style.background='rgba(255, 255, 255, 0.25)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.transform='translateY(0)'">
              ← Retour à IAhome
            </a>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top: 3.5rem;"></div>
  `;

  // Insérer la bannière après l'ouverture du body
  return html.replace('<body', '<body>' + bannerHTML);
}

function rewritePsitransferUrls(html: string): string {
  let modified = html;
  
  // Remplacer les URLs absolues de PsiTransfer (ancien et nouveau)
  modified = modified.replace(/https?:\/\/psitransfer\.regispailler\.fr\//g, '/api/psitransfer-proxy/');
  modified = modified.replace(/https?:\/\/localhost:8084\//g, '/api/psitransfer-proxy/');
  
  // Remplacer le base href pour pointer vers le proxy
  modified = modified.replace(/<base href="\/">/g, '<base href="/api/psitransfer-proxy/">');
  
  // Remplacer les chemins relatifs pour les ressources (sans slash initial)
  modified = modified.replace(/href="assets\//g, 'href="/api/psitransfer-proxy/assets/');
  modified = modified.replace(/src="app\//g, 'src="/api/psitransfer-proxy/app/');
  modified = modified.replace(/src="assets\//g, 'src="/api/psitransfer-proxy/assets/');
  
  // Remplacer les chemins absolus (avec slash initial)
  modified = modified.replace(/href="\/assets\//g, 'href="/api/psitransfer-proxy/assets/');
  modified = modified.replace(/src="\/app\//g, 'src="/api/psitransfer-proxy/app/');
  modified = modified.replace(/src="\/assets\//g, 'src="/api/psitransfer-proxy/assets/');
  
  // Remplacer les chemins dans les attributs style (url())
  modified = modified.replace(/url\(assets\//g, 'url(/api/psitransfer-proxy/assets/');
  modified = modified.replace(/url\(app\//g, 'url(/api/psitransfer-proxy/app/');
  modified = modified.replace(/url\(\/assets\//g, 'url(/api/psitransfer-proxy/assets/');
  modified = modified.replace(/url\(\/app\//g, 'url(/api/psitransfer-proxy/app/');
  
  // Remplacer les URLs dans les attributs data ou autres
  modified = modified.replace(/"(https?:\/\/psitransfer\.regispailler\.fr\/[^"]*)"/g, '"/api/psitransfer-proxy/$1"');
  modified = modified.replace(/"(https?:\/\/localhost:8084\/[^"]*)"/g, '"/api/psitransfer-proxy/$1"');
  
  // Wrapper avec la bannière IAHome
  modified = wrapWithIAHomeBanner(modified);
  
  return modified;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    if (!response.ok) {
      return new NextResponse(`PsiTransfer service error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const modifiedHtml = rewritePsitransferUrls(html);
      
      // Gérer le code de statut 304 qui n'est pas valide pour NextResponse
      const status = response.status === 304 ? 200 : response.status;
      
      return new NextResponse(modifiedHtml, {
        status: status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'content-type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': "frame-ancestors 'self' https://iahome.fr;",
          'X-Proxy-By': 'IAHome-PsiTransfer-Proxy',
          'content-encoding': 'identity',
          'cache-control': 'no-cache, no-store, must-revalidate'
        },
      });
    } else {
      const data = await response.arrayBuffer();
      return new NextResponse(data, {
        status: response.status,
        headers: response.headers,
      });
    }
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Vérifier le quota si c'est un upload de fichier
    const contentType = request.headers.get('content-type') || '';
    const contentLength = request.headers.get('content-length');
    
    if (contentType.includes('multipart/form-data') && contentLength) {
      const fileSize = parseInt(contentLength);
      
      // Récupérer l'utilisateur depuis les cookies
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const supabaseWithCookies = createClient(
          getSupabaseUrl(),
          getSupabaseAnonKey(),
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
            global: {
              headers: {
                cookie: cookieHeader,
              },
            },
          }
        );

        const { data: { session } } = await supabaseWithCookies.auth.getSession();
        
        if (session?.user?.id) {
          // Vérifier le quota
          const quotaResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/psitransfer-quota`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              fileSize: fileSize,
              action: 'check'
            })
          });

          if (quotaResponse.ok) {
            const quotaResult = await quotaResponse.json();
            if (!quotaResult.allowed) {
              return NextResponse.json({
                error: 'Quota dépassé',
                message: quotaResult.reason,
                currentUsage: quotaResult.currentUsage,
                maxUsage: quotaResult.maxUsage
              }, { status: 413 });
            }
          }
        }
      }
    }
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${searchParams ? `?${searchParams}` : ''}`;
    
    const body = await request.arrayBuffer();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
      body,
    });

    const data = await response.arrayBuffer();
    
    // Si l'upload a réussi, incrémenter le quota
    if (response.ok && contentType.includes('multipart/form-data') && contentLength) {
      const fileSize = parseInt(contentLength);
      const cookieHeader = request.headers.get('cookie');
      
      if (cookieHeader) {
        const supabaseWithCookies = createClient(
          getSupabaseUrl(),
          getSupabaseAnonKey(),
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
            global: {
              headers: {
                cookie: cookieHeader,
              },
            },
          }
        );

        const { data: { session } } = await supabaseWithCookies.auth.getSession();
        
        if (session?.user?.id) {
          // Incrémenter le quota
          try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/psitransfer-quota`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: session.user.id,
                fileSize: fileSize,
                action: 'add'
              })
            });
          } catch (quotaError) {
            console.error('❌ Erreur lors de l\'incrémentation du quota:', quotaError);
            // Ne pas bloquer la réponse pour cette erreur
          }
        }
      }
    }
    
    // Gérer le code de statut 304 qui n'est pas valide pour NextResponse
    const status = response.status === 304 ? 200 : response.status;
    
    return new NextResponse(data, {
      status: status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'identity',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' https://iahome.fr;",
        'X-Proxy-By': 'IAHome-PsiTransfer-Proxy'
      },
    });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'OPTIONS',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    // Gérer le code de statut 304 qui n'est pas valide pour NextResponse
    const status = response.status === 304 ? 200 : response.status;
    
    return new NextResponse(null, {
      status: status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'identity',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' https://iahome.fr;",
        'X-Proxy-By': 'IAHome-PsiTransfer-Proxy'
      },
    });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


