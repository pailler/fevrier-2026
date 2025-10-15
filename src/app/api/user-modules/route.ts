import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    ;
    
    // Récupérer les modules de l'utilisateur
    const { data: userModules, error: userModulesError } = await supabase
      .from('user_modules')
      .select('*')
      .eq('user_id', '4ff83788-7bdb-4633-a693-3ad98006fed5')
      .order('created_at', { ascending: false });
    
    if (userModulesError) {
      console.error('❌ Erreur user_modules:', userModulesError);
      return NextResponse.json({ error: 'Erreur user_modules', details: userModulesError }, { status: 500 });
    }
    
    console.log('✅ Modules récupérés:', userModules?.length || 0);
    
    return NextResponse.json({
      success: true,
      modules: userModules || []
    });
    
  } catch (error) {
    console.error('❌ Erreur API user-modules:', error);
    return NextResponse.json({ error: 'Erreur générale', details: error }, { status: 500 });
  }
}
