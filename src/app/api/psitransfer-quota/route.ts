import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, fileSize, action } = await request.json();
    
    if (!userId || !fileSize || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    console.log(`🔍 PSitransfer Quota - Action: ${action}, User: ${userId}, FileSize: ${fileSize} bytes`);

    // Récupérer l'accès utilisateur pour PSitransfer
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, quota_used, quota_limit')
      .eq('user_id', userId)
      .eq('module_id', 'psitransfer')
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('❌ PSitransfer Quota - Aucun accès trouvé pour l\'utilisateur');
      return NextResponse.json(
        { error: 'Aucun accès PSitransfer trouvé' },
        { status: 404 }
      );
    }

    // Convertir la taille du fichier en Go
    const fileSizeGB = fileSize / (1024 * 1024 * 1024);
    const currentUsageGB = userAccess.quota_used || 0;
    const maxUsageGB = userAccess.max_usage || 10; // 10 Go par défaut

    if (action === 'check') {
      // Vérifier si l'ajout du fichier dépasserait le quota
      const newUsageGB = currentUsageGB + fileSizeGB;
      
      if (newUsageGB > maxUsageGB) {
        return NextResponse.json({
          success: false,
          allowed: false,
          reason: `Quota dépassé. Utilisation actuelle: ${currentUsageGB.toFixed(2)} Go / ${maxUsageGB} Go`,
          currentUsage: currentUsageGB,
          maxUsage: maxUsageGB,
          fileSize: fileSizeGB
        });
      }

      return NextResponse.json({
        success: true,
        allowed: true,
        currentUsage: currentUsageGB,
        maxUsage: maxUsageGB,
        fileSize: fileSizeGB,
        remainingQuota: maxUsageGB - currentUsageGB
      });
    }

    if (action === 'add') {
      // Ajouter la taille du fichier à l'utilisation
      const newUsageGB = currentUsageGB + fileSizeGB;
      
      if (newUsageGB > maxUsageGB) {
        return NextResponse.json({
          success: false,
          allowed: false,
          reason: `Quota dépassé. Utilisation actuelle: ${currentUsageGB.toFixed(2)} Go / ${maxUsageGB} Go`,
          currentUsage: currentUsageGB,
          maxUsage: maxUsageGB,
          fileSize: fileSizeGB
        });
      }

      // Mettre à jour l'utilisation
      const { error: updateError } = await supabase
        .from('user_applications')
        .update({
          quota_used: newUsageGB,
          usage_count: (userAccess.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userAccess.id);

      if (updateError) {
        console.error('❌ PSitransfer Quota - Erreur lors de la mise à jour:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du quota' },
          { status: 500 }
        );
      }

      console.log(`✅ PSitransfer Quota - Utilisation mise à jour: ${newUsageGB.toFixed(2)} Go / ${maxUsageGB} Go`);

      return NextResponse.json({
        success: true,
        allowed: true,
        currentUsage: newUsageGB,
        maxUsage: maxUsageGB,
        fileSize: fileSizeGB,
        remainingQuota: maxUsageGB - newUsageGB
      });
    }

    if (action === 'remove') {
      // Retirer la taille du fichier de l'utilisation
      const newUsageGB = Math.max(0, currentUsageGB - fileSizeGB);

      const { error: updateError } = await supabase
        .from('user_applications')
        .update({
          quota_used: newUsageGB,
          updated_at: new Date().toISOString()
        })
        .eq('id', userAccess.id);

      if (updateError) {
        console.error('❌ PSitransfer Quota - Erreur lors de la mise à jour:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du quota' },
          { status: 500 }
        );
      }

      console.log(`✅ PSitransfer Quota - Utilisation mise à jour: ${newUsageGB.toFixed(2)} Go / ${maxUsageGB} Go`);

      return NextResponse.json({
        success: true,
        currentUsage: newUsageGB,
        maxUsage: maxUsageGB,
        fileSize: fileSizeGB,
        remainingQuota: maxUsageGB - newUsageGB
      });
    }

    if (action === 'get') {
      // Récupérer les informations de quota
      return NextResponse.json({
        success: true,
        currentUsage: currentUsageGB,
        maxUsage: maxUsageGB,
        remainingQuota: maxUsageGB - currentUsageGB,
        usagePercentage: (currentUsageGB / maxUsageGB) * 100
      });
    }

    return NextResponse.json(
      { error: 'Action non supportée' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ PSitransfer Quota Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}











