import { NextRequest, NextResponse } from 'next/server';
import { PhotoAnalysisService, PhotoUploadData } from '@/utils/photoAnalysisService';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const collectionId = formData.get('collectionId') as string;
    const customDescription = formData.get('customDescription') as string;
    const customTags = formData.get('customTags') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Fichier et userId requis' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10MB)' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification via les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || user.id !== userId) {
      console.error('Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Non autorisé - Token invalide' },
        { status: 401 }
      );
    }

    // Créer un objet URL temporaire pour l'analyse
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const imageUrl = URL.createObjectURL(blob);

    try {
      // Analyser la photo avec l'IA
      const analysis = await PhotoAnalysisService.analyzePhoto(imageUrl);

      // Préparer les données d'upload
      const photoData: PhotoUploadData = {
        file,
        userId,
        collectionId: collectionId || undefined,
        customDescription: customDescription || undefined,
        customTags: customTags ? customTags.split(',').map(tag => tag.trim()) : undefined,
      };

      // Sauvegarder la photo et ses métadonnées
      const photoId = await PhotoAnalysisService.savePhotoWithAnalysis(photoData, analysis);

      return NextResponse.json({
        success: true,
        photoId,
        analysis,
        message: 'Photo uploadée et analysée avec succès'
      });

    } finally {
      // Nettoyer l'URL temporaire
      URL.revokeObjectURL(imageUrl);
    }

  } catch (error) {
    console.error('Erreur upload photo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    );
  }
}
