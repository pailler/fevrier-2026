import { NextRequest, NextResponse } from 'next/server';
import { initializeUserSession } from '../../../utils/sessionDurationCheck';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId et userEmail sont requis' },
        { status: 400 }
      );
    }

    // Initialiser la session dans user_sessions
    try {
      await initializeUserSession(userId, userEmail);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      // Si c'est une erreur de table non trouvée, retourner succès quand même
      if (error?.message?.includes('does not exist') || 
          error?.code === '42P01' || 
          error?.code === 'PGRST116') {
        console.warn('⚠️ Table user_sessions n\'existe pas encore, initialisation ignorée');
        return NextResponse.json({ success: true, warning: 'Table user_sessions non disponible' });
      }
      // Pour les autres erreurs, retourner succès pour ne pas bloquer la connexion
      console.error('Erreur initialisation session (non bloquant):', error);
      return NextResponse.json({ success: true, error: 'Initialisation ignorée' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session:', error);
    // Retourner succès même en cas d'erreur pour ne pas bloquer la connexion
    return NextResponse.json({ success: true, error: 'Initialisation ignorée' });
  }
}
