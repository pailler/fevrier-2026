import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    const { photoId, userId } = await request.json();

    if (!photoId || !userId) {
      return NextResponse.json(
        { error: 'Photo ID et User ID requis' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Supprimer la photo de la base de données
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erreur suppression photo:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    // Supprimer le fichier du storage (optionnel)
    try {
      const { error: storageError } = await supabase.storage
        .from('photo-portfolio')
        .remove([`${userId}/${photoId}`]);

      if (storageError) {
        console.warn('Erreur suppression storage:', storageError);
        // Ne pas échouer si le fichier n'existe pas dans le storage
      }
    } catch (storageError) {
      console.warn('Erreur suppression storage:', storageError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Photo supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur API suppression photo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


























