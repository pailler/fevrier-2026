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
    const token = request.nextUrl.searchParams.get('token');
    
    console.log(`🔍 QR Manage GET: ${qrId} (token: ${token ? 'présent' : 'absent'})`);
    
    // Récupérer les données du QR code depuis Supabase
    const { data: qrData, error } = await supabase
      .from('dynamic_qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();
    
    if (error || !qrData) {
      console.error('❌ Erreur récupération QR code:', error);
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    // Vérifier le token si fourni
    if (token && qrData.management_token !== token) {
      return NextResponse.json({ error: 'Token de gestion invalide' }, { status: 403 });
    }
    
    // Retourner les informations de gestion
    return NextResponse.json({
      success: true,
      qr_id: qrId,
      name: qrData.name || null,
      url: qrData.url,
      scans: qrData.scans || 0,
      created_at: qrData.created_at,
      last_scan: qrData.last_scan || null,
      qr_url: qrData.qr_url || `https://qrcodes.iahome.fr/r/${qrId}`
    });
    
  } catch (error) {
    console.error('❌ Erreur QR Manage:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const body = await request.json();
    const { url, name, token } = body;
    
    console.log(`🔍 QR Update PUT: ${qrId} -> ${url}`);
    
    if (!url || !token) {
      return NextResponse.json({ 
        error: 'URL et token requis' 
      }, { status: 400 });
    }
    
    // Vérifier que le QR code existe et que le token correspond
    const { data: existingQr, error: fetchError } = await supabase
      .from('dynamic_qr_codes')
      .select('management_token')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();
    
    if (fetchError || !existingQr) {
      console.error('❌ QR Code non trouvé:', fetchError);
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    if (existingQr.management_token !== token) {
      console.error('❌ Token invalide');
      return NextResponse.json({ error: 'Token de gestion invalide' }, { status: 403 });
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (url) {
      updateData.url = url.trim();
    }
    
    if (name !== undefined) {
      updateData.name = name ? name.trim() : null;
    }
    
    // Mettre à jour dans Supabase
    const { data: updatedQr, error: updateError } = await supabase
      .from('dynamic_qr_codes')
      .update(updateData)
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .select()
      .single();
    
    if (updateError || !updatedQr) {
      console.error('❌ Erreur mise à jour QR code:', updateError);
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour',
        details: updateError?.message 
      }, { status: 500 });
    }
    
    console.log(`✅ QR Update réussi: ${qrId} -> ${updatedQr.url}`);
    
    return NextResponse.json({
      success: true,
      message: 'QR Code mis à jour avec succès',
      qr_id: qrId,
      url: updatedQr.url,
      name: updatedQr.name,
      updated_at: updatedQr.updated_at
    });
    
  } catch (error) {
    console.error('❌ Erreur QR Update:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
