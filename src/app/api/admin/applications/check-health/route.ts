import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import {
  checkApplicationUrl,
  getModuleUrlForSlug,
  getModuleSlug,
  runAllModulesHealthCheck,
} from '@/utils/applicationHealthCheck';
import { notifyTelegramAppHealthFailures } from '@/utils/telegramNotify';

const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module_id, check_all } = body;

    if (check_all) {
      const results = await runAllModulesHealthCheck(supabase);
      void notifyTelegramAppHealthFailures(results).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `${results.length} applications vérifiées`,
        results,
      });
    }

    if (module_id) {
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('id, title')
        .eq('id', module_id)
        .single();

      if (moduleError || !module) {
        return NextResponse.json({ success: false, error: 'Module non trouvé' }, { status: 404 });
      }

      const moduleSlug = getModuleSlug(module.id, module.title);
      const moduleUrl = getModuleUrlForSlug(module.id, module.title);

      if (!moduleUrl) {
        return NextResponse.json({
          success: true,
          module_id: module.id,
          module_name: module.title,
          url: null,
          isValid: true,
          isSkipped: true,
          errorMessage: `Module ignoré (hors périmètre IAHome) - slug: ${moduleSlug}`,
          responseTime: 0,
        });
      }

      const checkResult = await checkApplicationUrl(moduleUrl, { moduleSlug });

      return NextResponse.json({
        success: true,
        module_id: module.id,
        module_name: module.title,
        url: moduleUrl,
        ...checkResult,
      });
    }

    return NextResponse.json(
      { success: false, error: 'module_id ou check_all requis' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('❌ Erreur lors de la vérification de la santé des applications:', error);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Utilisez POST pour vérifier la santé des applications',
  });
}
