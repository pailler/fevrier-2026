import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    console.log('🗑️ Suppression de l\'historique pour userId:', userId);

    // Supprimer l'historique pour cet utilisateur
    const { error: deleteError } = await supabase
      .from('token_usage_history')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Erreur suppression historique:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'historique' },
        { status: 500 }
      );
    }

    console.log('✅ Historique supprimé avec succès pour userId:', userId);

    return NextResponse.json({
      success: true,
      message: 'Historique supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur API clear-token-history:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
