import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Essayer de récupérer depuis la table user_token_usage si elle existe
    let usageHistory = [];
    let historyError = null;

    try {
      const { data: tokenUsage, error: tokenError } = await supabase
        .from('user_token_usage')
        .select(`
          id,
          module_name,
          action_type,
          tokens_consumed,
          usage_date,
          details
        `)
        .eq('user_id', userId)
        .order('usage_date', { ascending: false })
        .limit(limit);

      if (!tokenError && tokenUsage) {
        usageHistory = tokenUsage.map(usage => ({
          id: usage.id,
          module_name: usage.module_name,
          action_type: usage.action_type || 'accès',
          tokens_consumed: usage.tokens_consumed || 10,
          usage_date: usage.usage_date,
          description: usage.details || `${usage.action_type} ${usage.module_name}`
        }));
      } else {
        historyError = tokenError;
      }
    } catch (error) {
      historyError = error;
    }

    // Si pas de données dans user_token_usage, créer des données de démonstration
    if (usageHistory.length === 0) {
      console.log('📊 Aucune donnée d\'utilisation trouvée, génération de données de démonstration...');
      
      const demoData = [
        {
          id: 'demo-1',
          module_name: 'librespeed',
          action_type: 'accès',
          tokens_consumed: 10,
          usage_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Il y a 30 minutes
          description: 'Test de vitesse internet'
        },
        {
          id: 'demo-2',
          module_name: 'metube',
          action_type: 'téléchargement',
          tokens_consumed: 10,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Il y a 2 heures
          description: 'Téléchargement vidéo YouTube'
        },
        {
          id: 'demo-3',
          module_name: 'whisper',
          action_type: 'transcription',
          tokens_consumed: 20,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // Il y a 4 heures
          description: 'Transcription audio en texte'
        },
        {
          id: 'demo-4',
          module_name: 'qrcodes',
          action_type: 'génération',
          tokens_consumed: 1,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // Il y a 6 heures
          description: 'Génération QR code'
        },
        {
          id: 'demo-5',
          module_name: 'pdf',
          action_type: 'génération',
          tokens_consumed: 1,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // Il y a 8 heures
          description: 'Génération PDF'
        },
        {
          id: 'demo-6',
          module_name: 'stablediffusion',
          action_type: 'génération',
          tokens_consumed: 50,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // Il y a 12 heures
          description: 'Génération image IA'
        },
        {
          id: 'demo-7',
          module_name: 'psitransfer',
          action_type: 'upload',
          tokens_consumed: 10,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Il y a 1 jour
          description: 'Upload fichier sécurisé'
        },
        {
          id: 'demo-8',
          module_name: 'meeting-reports',
          action_type: 'génération',
          tokens_consumed: 100,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // Il y a 1.5 jour
          description: 'Génération rapport de réunion'
        },
        {
          id: 'demo-9',
          module_name: 'comfyui',
          action_type: 'accès',
          tokens_consumed: 10,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Il y a 2 jours
          description: 'Accès ComfyUI'
        },
        {
          id: 'demo-10',
          module_name: 'librespeed',
          action_type: 'accès',
          tokens_consumed: 10,
          usage_date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // Il y a 3 jours
          description: 'Test de vitesse internet'
        }
      ];

      usageHistory = demoData.slice(0, limit);
    }

    console.log('📊 Historique d\'utilisation récupéré pour:', userProfile.email, '-', usageHistory.length, 'entrées');

    return NextResponse.json({
      success: true,
      history: usageHistory,
      total: usageHistory.length,
      isDemo: usageHistory.length > 0 && usageHistory[0].id.startsWith('demo-')
    });

  } catch (error) {
    console.error('Erreur API usage-history:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
