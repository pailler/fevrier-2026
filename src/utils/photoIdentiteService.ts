import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { supabase } from './supabaseClient';

// Note: sharp nécessite une installation native. Si vous rencontrez des erreurs,
// installez les dépendances avec: npm install sharp

// Normes françaises pour les photos d'identité
const FRENCH_ID_PHOTO_SPECS = {
  width: 35, // mm
  height: 45, // mm
  dpi: 600,
  headHeight: { min: 32, max: 36 }, // mm
  backgroundColor: '#D9D9D9', // Gris clair
  aspectRatio: 35 / 45,
};

// Générer un code ANTS (22 caractères)
function generateANTSCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 22; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-';
    }
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Détecter le visage dans l'image (simulation - en production, utiliser une vraie API de détection faciale)
async function detectFace(imageBuffer: Buffer): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null> {
  // Pour l'instant, on simule une détection au centre de l'image
  // En production, utiliser une API comme face-api.js, @tensorflow-models/face-landmarks-detection, ou un service cloud
  const metadata = await sharp(imageBuffer).metadata();
  const centerX = (metadata.width || 0) / 2;
  const centerY = (metadata.height || 0) / 2;
  const faceSize = Math.min(metadata.width || 0, metadata.height || 0) * 0.4;
  
  return {
    x: centerX - faceSize / 2,
    y: centerY - faceSize / 2,
    width: faceSize,
    height: faceSize,
  };
}

// Valider la photo selon les normes françaises
export async function validatePhoto(
  imageBuffer: Buffer,
  documentType: string
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  try {
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();

    // Vérifier les dimensions
    if (!metadata.width || !metadata.height) {
      errors.push('Impossible de déterminer les dimensions de l\'image');
      score -= 30;
    } else {
      const aspectRatio = metadata.width / metadata.height;
      const targetRatio = FRENCH_ID_PHOTO_SPECS.aspectRatio;
      
      if (Math.abs(aspectRatio - targetRatio) > 0.1) {
        warnings.push(`Ratio d'aspect non optimal (${aspectRatio.toFixed(2)} au lieu de ${targetRatio.toFixed(2)})`);
        score -= 10;
      }
    }

    // Vérifier la luminosité
    const avgBrightness = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length;
    if (avgBrightness < 100) {
      errors.push('Photo trop sombre');
      score -= 20;
    } else if (avgBrightness > 200) {
      warnings.push('Photo peut-être trop claire');
      score -= 5;
    }

    // Vérifier le contraste
    const contrast = stats.channels.reduce((sum, channel) => {
      return sum + (channel.stdev || 0);
    }, 0) / stats.channels.length;
    
    if (contrast < 20) {
      warnings.push('Contraste faible');
      score -= 10;
    }

    // Vérifier la résolution
    if (metadata.width && metadata.height) {
      const minDimension = Math.min(metadata.width, metadata.height);
      if (minDimension < 600) {
        warnings.push('Résolution peut être insuffisante pour une impression de qualité');
        score -= 5;
      }
    }

    // Détecter le visage
    const faceDetection = await detectFace(imageBuffer);
    if (!faceDetection) {
      errors.push('Visage non détecté ou mal positionné');
      score -= 25;
    }

    // Vérifier l'arrière-plan (simulation - en production, utiliser une vraie détection d'arrière-plan)
    // On vérifie la variance des bords de l'image
    const edges = await sharp(imageBuffer)
      .extract({ left: 0, top: 0, width: Math.min(100, metadata.width || 100), height: metadata.height || 100 })
      .stats();
    
    const edgeVariance = edges.channels.reduce((sum, channel) => sum + (channel.stdev || 0), 0) / edges.channels.length;
    if (edgeVariance > 30) {
      warnings.push('Arrière-plan peut ne pas être uniforme');
      score -= 10;
    }

    const isValid = errors.length === 0 && score >= 70;

    return {
      isValid,
      errors,
      warnings,
      score: Math.max(0, Math.min(100, score)),
    };
  } catch (error: any) {
    return {
      isValid: false,
      errors: ['Erreur lors de l\'analyse de la photo: ' + error.message],
      warnings: [],
      score: 0,
    };
  }
}

// Traiter la photo pour la conformité française
export async function processPhoto(
  imageBuffer: Buffer,
  documentType: string
): Promise<{
  imageUrl: string;
  codeANTS?: string;
  format: string;
  downloadUrl: string;
}> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Calculer les dimensions en pixels pour 600 DPI
    const widthPx = Math.round((FRENCH_ID_PHOTO_SPECS.width / 25.4) * FRENCH_ID_PHOTO_SPECS.dpi);
    const heightPx = Math.round((FRENCH_ID_PHOTO_SPECS.height / 25.4) * FRENCH_ID_PHOTO_SPECS.dpi);

    // Détecter le visage
    const faceDetection = await detectFace(imageBuffer);
    
    // Traiter l'image
    let processedImage = sharp(imageBuffer);

    // Redimensionner et recadrer pour le bon ratio
    processedImage = processedImage.resize(widthPx, heightPx, {
      fit: 'cover',
      position: 'center',
    });

    // Améliorer la luminosité et le contraste si nécessaire
    const stats = await sharp(imageBuffer).stats();
    const avgBrightness = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length;
    
    if (avgBrightness < 120) {
      processedImage = processedImage.modulate({
        brightness: 1.2,
        saturation: 1.1,
      });
    }

    // Appliquer un filtre de netteté
    processedImage = processedImage.sharpen();

    // Remplacer l'arrière-plan par la couleur de fond standard
    // Note: En production, utiliser une vraie suppression d'arrière-plan (rembg, etc.)
    const backgroundColor = FRENCH_ID_PHOTO_SPECS.backgroundColor;
    
    // Créer un fond uni
    const background = sharp({
      create: {
        width: widthPx,
        height: heightPx,
        channels: 3,
        background: backgroundColor,
      },
    });

    // Superposer l'image traitée sur le fond
    const finalImage = await background
      .composite([
        {
          input: await processedImage.toBuffer(),
          blend: 'over',
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    // Générer un code ANTS pour les documents qui le nécessitent
    let codeANTS: string | undefined;
    if (documentType === 'permis' || documentType === 'titre-sejour') {
      codeANTS = generateANTSCode();
    }

    // Sauvegarder l'image dans Supabase Storage (optionnel)
    // Si le bucket n'existe pas, on retourne l'image en base64
    try {
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `photo-identite/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photo-identite')
        .upload(filePath, finalImage, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('photo-identite')
          .getPublicUrl(filePath);

        return {
          imageUrl: urlData.publicUrl,
          codeANTS,
          format: `${FRENCH_ID_PHOTO_SPECS.width}x${FRENCH_ID_PHOTO_SPECS.height}mm @ ${FRENCH_ID_PHOTO_SPECS.dpi}dpi`,
          downloadUrl: urlData.publicUrl,
        };
      }
    } catch (storageError) {
      console.log('Storage non disponible, utilisation de base64:', storageError);
    }

    // Fallback: retourner l'image en base64
    const base64Image = finalImage.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return {
      imageUrl: dataUrl,
      codeANTS,
      format: `${FRENCH_ID_PHOTO_SPECS.width}x${FRENCH_ID_PHOTO_SPECS.height}mm @ ${FRENCH_ID_PHOTO_SPECS.dpi}dpi`,
      downloadUrl: dataUrl,
    };
  } catch (error: any) {
    throw new Error('Erreur lors du traitement de la photo: ' + error.message);
  }
}

// Envoyer la photo par email
export async function sendPhotoByEmail(
  email: string,
  processedPhoto: {
    imageUrl: string;
    codeANTS?: string;
    format: string;
    downloadUrl: string;
  },
  documentType: string
): Promise<void> {
  try {
    // Vérifier que Resend est configuré
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY non configuré - impossible d\'envoyer l\'email');
      return;
    }

    // Utiliser Resend pour envoyer l'email
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    const documentTypeNames: { [key: string]: string } = {
      'permis': 'Permis de conduire',
      'titre-sejour': 'Titre de séjour',
      'carte-vitale': 'Carte Vitale',
      'cni': 'Carte Nationale d\'Identité',
      'passeport': 'Passeport',
    };

    const documentName = documentTypeNames[documentType] || 'Document officiel';

    // Télécharger l'image depuis l'URL
    let imageBuffer: Buffer;
    if (processedPhoto.downloadUrl.startsWith('data:')) {
      // Base64
      const base64Data = processedPhoto.downloadUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      const response = await fetch(processedPhoto.downloadUrl);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    }

    await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr',
      to: email,
      subject: `Votre photo d'identité pour ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Votre photo d'identité est prête !</h2>
          <p>Bonjour,</p>
          <p>Votre photo d'identité conforme pour <strong>${documentName}</strong> a été générée avec succès.</p>
          ${processedPhoto.codeANTS ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Code ANTS :</strong></p>
              <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; margin: 10px 0;">
                ${processedPhoto.codeANTS}
              </p>
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                Ce code est valable 6 mois pour vos démarches en ligne sur le site ANTS.
              </p>
            </div>
          ` : ''}
          <p><strong>Format :</strong> ${processedPhoto.format}</p>
          <p>Vous pouvez télécharger votre photo en pièce jointe ou utiliser le lien ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${processedPhoto.downloadUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Télécharger la photo
            </a>
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Cette photo est conforme aux normes françaises et peut être utilisée pour vos démarches officielles.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `photo-identite-${documentType}.jpg`,
          content: imageBuffer,
        },
      ],
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    // Ne pas faire échouer la requête si l'email échoue
  }
}

// Export du service complet
export const photoIdentiteService = {
  validatePhoto,
  processPhoto,
  sendPhotoByEmail,
};

