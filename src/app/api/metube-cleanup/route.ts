import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Nettoyage des sessions MeTube demandé');

    // Vérifier que le conteneur est en cours d'exécution
    const { stdout: containerStatus } = await execAsync(
      'docker ps --filter name=metube-iahome --format "{{.Status}}"'
    );

    if (!containerStatus.trim()) {
      return NextResponse.json(
        { error: 'Le conteneur MeTube n\'est pas en cours d\'exécution' },
        { status: 500 }
      );
    }

    // Nettoyer les fichiers de session MeTube
    console.log('📋 Nettoyage des fichiers de session...');
    
    try {
      // Supprimer les fichiers de session
      await execAsync(
        'docker exec metube-iahome sh -c "rm -f /downloads/.metube/completed /downloads/.metube/pending /downloads/.metube/queue"'
      );
      console.log('✅ Fichiers de session supprimés');
    } catch (error) {
      console.error('⚠️ Erreur lors de la suppression des fichiers de session:', error);
    }

    // Nettoyer les fichiers temporaires
    try {
      await execAsync(
        'docker exec metube-iahome sh -c "rm -rf /downloads/.metube/tmp/* /tmp/metube-* 2>/dev/null"'
      );
      console.log('✅ Fichiers temporaires supprimés');
    } catch (error) {
      console.error('⚠️ Erreur lors de la suppression des fichiers temporaires:', error);
    }

    // Vérifier si un nettoyage complet est demandé
    const body = await request.json().catch(() => ({}));
    const fullCleanup = body.fullCleanup === true;

    if (fullCleanup) {
      console.log('📋 Nettoyage complet des fichiers téléchargés...');
      try {
        await execAsync(
          'docker exec metube-iahome sh -c "find /downloads -type f ! -path \'/downloads/.metube/*\' -delete"'
        );
        console.log('✅ Tous les fichiers téléchargés supprimés');
      } catch (error) {
        console.error('⚠️ Erreur lors de la suppression des fichiers téléchargés:', error);
      }
    }

    console.log('✅ Nettoyage terminé');

    return NextResponse.json({
      success: true,
      message: 'Sessions MeTube nettoyées avec succès',
      fullCleanup: fullCleanup
    });

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des sessions MeTube:', error);
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage des sessions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'état du nettoyage
    const { stdout: containerStatus } = await execAsync(
      'docker ps --filter name=metube-iahome --format "{{.Status}}"'
    );

    if (!containerStatus.trim()) {
      return NextResponse.json({
        containerRunning: false,
        message: 'Le conteneur MeTube n\'est pas en cours d\'exécution'
      });
    }

    // Vérifier la taille des fichiers de session
    try {
      const { stdout: sessionSize } = await execAsync(
        'docker exec metube-iahome sh -c "du -sh /downloads/.metube/* 2>/dev/null | head -3"'
      );

      return NextResponse.json({
        containerRunning: true,
        sessionFiles: sessionSize.trim().split('\n').filter(Boolean),
        message: 'État du nettoyage vérifié'
      });
    } catch (error) {
      return NextResponse.json({
        containerRunning: true,
        message: 'Impossible de vérifier la taille des fichiers de session'
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'état:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'état' },
      { status: 500 }
    );
  }
}


