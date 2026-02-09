/**
 * Utilitaire pour vérifier la durée de session
 * Limite les sessions à 60 minutes (1 heure) pour tous les utilisateurs
 * Exception: Les comptes admin n'ont jamais de déconnexion automatique
 */

import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes (1 heure) en millisecondes

import { isAdminEmail } from './adminEmails';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export interface SessionDurationCheckResult {
  isValid: boolean;
  reason?: string;
  remainingMinutes?: number;
}

/**
 * Décode un JWT token pour extraire les informations (iat, exp, etc.)
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur décodage JWT:', error);
    return null;
  }
}

/**
 * Récupère la date de création de la session active depuis la table user_sessions
 * Ne crée PAS de nouvelle session - doit être créée via initializeUserSession lors de la connexion
 */
async function getSessionRecord(userId: string): Promise<Date | null> {
  try {
    // Récupérer la session active la plus récente pour cet utilisateur (peu importe son âge)
    const { data: existingSession, error: fetchError } = await supabase
      .from('user_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!fetchError && existingSession) {
      return new Date(existingSession.created_at);
    }

    // Si aucune session active n'existe, retourner null
    // La session doit être créée via initializeUserSession lors de la connexion
    return null;
  } catch (error) {
    console.error('Erreur récupération session:', error);
    return null;
  }
}

/**
 * Initialise une nouvelle session dans user_sessions (à appeler lors de la connexion)
 */
export async function initializeUserSession(userId: string, userEmail: string): Promise<void> {
  try {
    // Désactiver toutes les sessions précédentes pour cet utilisateur
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Créer une nouvelle session
    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        user_email: userEmail,
        created_at: new Date().toISOString(),
        is_active: true,
        last_accessed_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('❌ Erreur initialisation session:', error);
      throw error;
    }
    
    console.log(`✅ Session initialisée pour ${userEmail}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la session:', error);
    throw error;
  }
}

/**
 * Vérifie si une session Supabase est toujours valide selon la durée de session
 * @param session - La session Supabase à vérifier
 * @returns Résultat de la vérification avec isValid et reason si invalide
 */
export async function checkSessionDuration(session: any): Promise<SessionDurationCheckResult> {
  try {
    // Si pas de session, elle est invalide
    if (!session || !session.user) {
      return {
        isValid: false,
        reason: 'Session non valide'
      };
    }

    const userEmail = session.user.email;
    const userId = session.user.id;

    // Exception: Le compte admin n'a jamais de déconnexion automatique
    if (isAdminUser(userEmail)) {
      console.log(`👑 Session admin (${userEmail}) - Pas de limite de durée`);
      return {
        isValid: true,
        remainingMinutes: undefined // Illimité pour l'admin
      };
    }

    // Tous les autres utilisateurs ont une limite de 1 heure
    let sessionCreatedAt: Date | null = null;

    // Méthode 1: Récupérer depuis la table user_sessions (la plus fiable car ne change pas lors du rafraîchissement du token)
    try {
      const sessionRecordDate = await getSessionRecord(userId);
      if (sessionRecordDate) {
        sessionCreatedAt = sessionRecordDate;
        console.log('✅ Date de création depuis user_sessions:', sessionCreatedAt);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération depuis user_sessions:', error);
    }

    // Méthode 2: Utiliser created_at ou issued_at de la session si disponible (fallback)
    if (!sessionCreatedAt) {
      if (session.created_at) {
        sessionCreatedAt = new Date(session.created_at);
        console.log('✅ Date de création depuis created_at:', sessionCreatedAt);
      } else if (session.issued_at) {
        sessionCreatedAt = new Date(session.issued_at);
        console.log('✅ Date de création depuis issued_at:', sessionCreatedAt);
      }
    }

    // Méthode 3: Essayer d'extraire depuis le JWT token (iat) - moins fiable car change lors du rafraîchissement
    // Utilisé uniquement comme dernier recours
    if (!sessionCreatedAt && session.access_token) {
      try {
        const decoded = decodeJWT(session.access_token);
        if (decoded && decoded.iat) {
          sessionCreatedAt = new Date(decoded.iat * 1000);
          console.log('⚠️ Date de création depuis JWT iat (peut être incorrecte si token rafraîchi):', sessionCreatedAt);
        }
      } catch (error) {
        console.warn('⚠️ Impossible de décoder le token JWT:', error);
      }
    }

    // Méthode 4: Estimer depuis expires_at (supposant durée par défaut Supabase de 1h)
    if (!sessionCreatedAt && session.expires_at) {
      const expiresAt = new Date(session.expires_at);
      sessionCreatedAt = new Date(expiresAt.getTime() - 60 * 60 * 1000);
      console.log('⚠️ Date estimée depuis expires_at:', sessionCreatedAt);
    }

    // Si on ne peut toujours pas déterminer, considérer comme valide pour éviter de bloquer
    if (!sessionCreatedAt) {
      console.warn('⚠️ Impossible de déterminer la date de création pour', userEmail, '- Session considérée comme valide');
      return {
        isValid: true
      };
    }

    // DÉSACTIVÉ : Plus de vérification de durée de session - toujours valide
    // La déconnexion automatique après 1 heure est désactivée
    console.log(`✅ Session valide pour ${userEmail} (déconnexion automatique désactivée)`);
    return {
      isValid: true,
      remainingMinutes: undefined // Illimité
    };

    // CODE DÉSACTIVÉ - Ancienne logique de vérification de durée
    // Calculer l'âge de la session
    // const now = new Date();
    // const sessionAge = now.getTime() - sessionCreatedAt.getTime();

    // // Si l'âge calculé est négatif (problème de synchronisation), considérer comme valide
    // if (sessionAge < 0) {
    //   console.warn('⚠️ Âge de session négatif détecté, considérer comme valide');
    //   return {
    //     isValid: true
    //   };
    // }

    // // Vérifier si la session a dépassé 60 minutes
    // if (sessionAge > SESSION_DURATION_MS) {
    //   const exceededMinutes = Math.floor((sessionAge - SESSION_DURATION_MS) / (60 * 1000));
    //   console.log(`❌ Session expirée pour ${userEmail}: ${exceededMinutes} minutes au-delà de la limite`);
    //   return {
    //     isValid: false,
    //     reason: `Session expirée (durée maximale de 60 minutes dépassée de ${exceededMinutes} minutes)`
    //   };
    // }

    // // Calculer le temps restant
    // const remainingMs = SESSION_DURATION_MS - sessionAge;
    // const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

    // console.log(`✅ Session valide pour ${userEmail}: ${remainingMinutes} minutes restantes`);

    // return {
    //   isValid: true,
    //   remainingMinutes: Math.max(0, remainingMinutes)
    // };
  } catch (error) {
    // En cas d'erreur, considérer la session comme valide pour éviter de bloquer les utilisateurs
    console.error('❌ Erreur lors de la vérification de durée de session:', error);
    return {
      isValid: true
    };
  }
}

/**
 * Vérifie si un utilisateur est admin (présent dans la liste admin)
 * Note: Les admins n'ont pas de limite de session (session illimitée)
 */
export function isAdminUser(email: string | undefined | null): boolean {
  return isAdminEmail(email);
}





