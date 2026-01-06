import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

// Initialiser Supabase avec la clé de service pour bypasser RLS
const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    
    console.log(`🔍 QR Redirect Next.js: ${qrId}`);
    
    // Récupérer les données du QR code depuis Supabase
    const { data: qrData, error } = await supabase
      .from('dynamic_qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();
    
    if (error || !qrData) {
      console.error('❌ QR Code non trouvé:', error);
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    // Incrémenter le compteur de scans dans Supabase
    const { error: updateError } = await supabase
      .from('dynamic_qr_codes')
      .update({
        scans: (qrData.scans || 0) + 1,
        last_scan: new Date().toISOString()
      })
      .eq('qr_id', qrId)
      .eq('is_active', true);
    
    if (updateError) {
      console.error('❌ Erreur mise à jour scans:', updateError);
      // Continuer quand même la redirection même si l'incrémentation échoue
    }
    
    console.log(`✅ QR Redirect: ${qrData.url} (scans: ${(qrData.scans || 0) + 1})`);
    
    // Rediriger vers l'URL de destination
    return NextResponse.redirect(qrData.url, 302);
    
  } catch (error) {
    console.error('❌ Erreur QR Redirect:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
