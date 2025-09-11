import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { moduleId, moduleName, expiresIn, permissions } = await request.json();
    
    if (!moduleId || !moduleName) {
      return NextResponse.json(
        { error: 'moduleId et moduleName requis' },
        { status: 400 }
      );
    }

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

    // Utiliser les paramètres personnalisés ou les valeurs par défaut
    const customExpiresIn = expiresIn || '72h';
    const customPermissions = permissions || ['read', 'access', 'write', 'advanced_features'];

    // Générer le token JWT avec les paramètres personnalisés
    const payload = {
      userId: user.id,
      userEmail: user.email,
      moduleId: moduleId,
      moduleName: moduleName,
      accessLevel: 'premium',
      expiresAt: Date.now() + (parseInt(customExpiresIn) * 60 * 60 * 1000), // Convertir en millisecondes
      permissions: customPermissions,
      issuedAt: Date.now(),
      customExpiresIn: customExpiresIn // Inclure la durée personnalisée dans le payload
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: customExpiresIn });
    
    return NextResponse.json({
      success: true,
      accessToken,
      expiresIn: customExpiresIn,
      moduleName,
      permissions: customPermissions,
      userEmail: user.email,
      issuedAt: new Date().toISOString(),
      customSettings: {
        expiresIn: customExpiresIn,
        permissions: customPermissions
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 