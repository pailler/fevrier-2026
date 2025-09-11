import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { moduleId, moduleName, expirationHours } = await request.json();
    
    if (!moduleId || !moduleName) {
      return NextResponse.json(
        { error: 'moduleId et moduleName requis' },
        { status: 400 }
      );
    }

    // Définir la durée d'expiration (par défaut 72h, ou la valeur spécifiée)
    const defaultExpirationHours = 72;
    const hours = expirationHours || defaultExpirationHours;

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Générer le token JWT directement (sans vérifier l'abonnement)
    const payload = {
      userId: user.id,
      userEmail: user.email,
      moduleId: moduleId,
      moduleName: moduleName,
      accessLevel: 'premium',
      expiresAt: Date.now() + (hours * 60 * 60 * 1000), // Heures spécifiées
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now()
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: `${hours}h` });
    
    // Récupérer les informations du module
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('title, category, price')
      .eq('id', moduleId)
      .single();

    if (moduleError) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    // Stocker le token dans la base de données
    const tokenData = {
      name: `Token ${moduleData.title} - ${user.email}`,
      description: `Token d'accès pour ${moduleData.title} généré automatiquement`,
      module_id: moduleId,
      module_name: moduleData.title,
      access_level: 'premium',
      permissions: payload.permissions,
      max_usage: 100,
      current_usage: 0,
      is_active: true,
      created_by: user.id,
      expires_at: new Date(Date.now() + (hours * 60 * 60 * 1000)).toISOString(),
      jwt_token: accessToken
    };

    const { data: storedToken, error: storeError } = await supabase
      .from('access_tokens')
      .insert([tokenData])
      .select()
      .single();

    if (storeError) {
      return NextResponse.json(
        { error: `Erreur lors du stockage du token: ${storeError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accessToken,
      expiresIn: `${hours}h`,
      moduleName,
      permissions: payload.permissions,
      userEmail: user.email,
      issuedAt: new Date().toISOString(),
      token: storedToken
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 