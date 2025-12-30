import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

// Fonction pour vérifier une URL
async function checkUrl(url: string): Promise<{
  isValid: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IAHome-URL-Checker/1.0)'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    // Considérer comme valide si le status code est entre 200 et 399
    const isValid = response.status >= 200 && response.status < 400;

    return {
      isValid,
      statusCode: response.status,
      responseTime,
      errorMessage: isValid ? undefined : `Status code: ${response.status}`
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      isValid: false,
      errorMessage: error.message || 'Erreur inconnue',
      responseTime
    };
  }
}

// POST - Vérifier une URL spécifique ou toutes les URLs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service_id, check_all } = body;

    if (check_all) {
      // Vérifier toutes les URLs actives
      const { data: services, error: fetchError } = await supabase
        .from('administration_services')
        .select('id, url, name')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const results = [];
      for (const service of services || []) {
        const checkResult = await checkUrl(service.url);
        
        // Enregistrer le résultat dans la base de données
        const { error: insertError } = await supabase
          .from('administration_url_checks')
          .insert([{
            service_id: service.id,
            url: service.url,
            status_code: checkResult.statusCode,
            is_valid: checkResult.isValid,
            error_message: checkResult.errorMessage,
            response_time_ms: checkResult.responseTime,
            last_checked_at: new Date().toISOString()
          }]);

        results.push({
          service_id: service.id,
          service_name: service.name,
          url: service.url,
          ...checkResult
        });
      }

      return NextResponse.json({
        success: true,
        message: `${results.length} URLs vérifiées`,
        results
      });
    } else if (service_id) {
      // Vérifier une URL spécifique
      const { data: service, error: fetchError } = await supabase
        .from('administration_services')
        .select('id, url, name')
        .eq('id', service_id)
        .single();

      if (fetchError) throw fetchError;

      const checkResult = await checkUrl(service.url);

      // Enregistrer le résultat dans la base de données
      const { error: insertError } = await supabase
        .from('administration_url_checks')
        .insert([{
          service_id: service.id,
          url: service.url,
          status_code: checkResult.statusCode,
          is_valid: checkResult.isValid,
          error_message: checkResult.errorMessage,
          response_time_ms: checkResult.responseTime,
          last_checked_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Erreur lors de l\'enregistrement du check:', insertError);
      }

      return NextResponse.json({
        success: true,
        service_id: service.id,
        service_name: service.name,
        url: service.url,
        ...checkResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'service_id ou check_all requis'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification des URLs:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET - Récupérer l'historique des vérifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('administration_url_checks')
      .select(`
        *,
        service:administration_services(id, name, url)
      `)
      .order('last_checked_at', { ascending: false })
      .limit(limit);

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}








