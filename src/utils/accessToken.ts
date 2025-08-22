import { supabase } from './supabaseClient';

export interface AccessTokenData {
  moduleName: string;
  userId: string;
  expiresAt: Date;
  isValid: boolean;
}

export async function validateAccessToken(token: string): Promise<AccessTokenData | null> {
  try {
    // Récupérer le magic link depuis Supabase
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      // .eq('is_used', false) // COMMENTÉ POUR PERMETTRE LA RÉUTILISATION
      .single();

    console.log('Token récupéré avec succès');

    if (error) {
      return null;
    }

    if (!data) {
      return null;
    }

    // Vérifier l'expiration
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    console.log('Vérification d\'expiration:', {
      expiresAt: expiresAt.toISOString(),
      isExpired: expiresAt < now
    });

    if (expiresAt < now) {
      return null;
    }

    // Marquer comme utilisé (COMMENTÉ POUR PERMETTRE LA RÉUTILISATION)
    // // await supabase
    //   .from('magic_links')
    //   .update({ is_used: true })
    //   .eq('token', token);

    return {
      moduleName: data.module_name,
      userId: data.user_id,
      expiresAt: expiresAt,
      isValid: true
    };

  } catch (error) {
    return null;
  }
}

export function hasPermission(tokenData: AccessTokenData, permission: string): boolean {
  // Pour l'instant, on considère que tous les tokens valides ont les permissions
  // Vous pouvez ajouter une logique plus complexe ici si nécessaire
  return tokenData.isValid;
}

export function generateAccessToken(userId: string, moduleName: string, permissions?: string[]): string {
  // Générer un token simple pour l'instant
  // En production, vous devriez utiliser une méthode plus sécurisée
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const token = `${userId}-${moduleName}-${timestamp}-${randomString}`;
  
  // Encoder en base64 pour masquer les détails
  return Buffer.from(token).toString('base64');
}