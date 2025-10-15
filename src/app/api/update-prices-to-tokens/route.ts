import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Mise à jour des prix en tokens...');

    // Définir les nouveaux coûts en tokens selon les spécifications
    const tokenCosts = {
      // Applications IA : 100 tokens
      'whisper-ia': 100,
      'stablediffusion': 100,
      'whisper': 100,
      'invoke': 100,
      'comfyui': 100,
      'sdnext': 100,
      'cogstudio': 100,
      'ruinedfooocus': 100,
      
      // MeTube et LibreSpeed : 10 tokens
      'metube': 10,
      'librespeed': 10,
      
      // QR Codes, PDF, PsiTransfer : 10 tokens
      'qr-generator': 10,
      'qrcodes': 10,
      'pdf': 10,
      'psitransfer': 10
    };

    // Récupérer tous les modules existants
    const { data: modules, error: fetchError } = await supabase
      .from('modules')
      .select('id, title, price');

    if (fetchError) {
      console.error('❌ Erreur récupération modules:', fetchError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des modules' },
        { status: 500 }
      );
    }

    console.log('📋 Modules trouvés:', modules?.length);

    // Mettre à jour chaque module avec le nouveau coût en tokens
    const updates = [];
    for (const module of modules || []) {
      const newTokenCost = tokenCosts[module.id];
      
      if (newTokenCost !== undefined) {
        updates.push({
          id: module.id,
          title: module.title,
          old_price: module.price,
          new_token_cost: newTokenCost
        });

        const { error: updateError } = await supabase
          .from('modules')
          .update({ 
            price: newTokenCost,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour ${module.id}:`, updateError);
        } else {
          console.log(`✅ ${module.title}: ${module.price}€ → ${newTokenCost} tokens`);
        }
      } else {
        console.log(`⚠️ Pas de coût défini pour: ${module.id} (${module.title})`);
      }
    }

    console.log('🎉 Mise à jour terminée !');
    ;
    updates.forEach(update => {
      console.log(`  - ${update.title}: ${update.old_price}€ → ${update.new_token_cost} tokens`);
    });

    return NextResponse.json({
      success: true,
      message: 'Prix mis à jour en tokens avec succès',
      updates: updates,
      total_updated: updates.length
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour prix:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
