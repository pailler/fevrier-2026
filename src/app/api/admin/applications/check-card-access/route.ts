import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import {
  checkCardAccessForModule,
  runAllCardAccessChecks,
} from '@/utils/cardAccessButtonCheck';
import { getModuleSlug } from '@/utils/applicationHealthCheck';

const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module_id, check_all } = body;

    if (check_all) {
      const results = await runAllCardAccessChecks(supabase);
      const failed = results.filter((r) => !r.isValid && !r.isSkipped);
      const passed = results.filter((r) => r.isValid);

      return NextResponse.json({
        success: true,
        message: `${results.length} fiches vérifiées — ${passed.length} OK, ${failed.length} en erreur`,
        results,
        summary: {
          total: results.length,
          passed: passed.length,
          failed: failed.length,
        },
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

      const cardSlug = getModuleSlug(module.id, module.title || module.id);
      const result = await checkCardAccessForModule({
        moduleId: module.id,
        moduleName: module.title || module.id,
        cardSlug,
      });

      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'module_id ou check_all requis' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('❌ Erreur vérification boutons d\'accès fiches:', error);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Utilisez POST avec { check_all: true } pour vérifier les boutons d\'accès des fiches /card/*',
  });
}
