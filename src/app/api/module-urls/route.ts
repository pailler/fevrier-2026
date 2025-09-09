import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');

    // Configuration des URLs des modules (URLs externes directes)
    const moduleUrls: { [key: string]: string } = {
      'metube': 'https://metube.iahome.fr',
      'librespeed': 'https://librespeed.iahome.fr',
      'pdf': 'https://pdf.iahome.fr',
      'psitransfer': 'https://psitransfer.iahome.fr',
      'qrcodes': 'https://qrcodes.iahome.fr',
      'stablediffusion': 'https://stablediffusion.iahome.fr',
      'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
      'invoke': 'https://invoke.iahome.fr',
      'comfyui': 'https://comfyui.iahome.fr',
      'cogstudio': 'https://cogstudio.iahome.fr',
      'sdnext': 'https://sdnext.iahome.fr'
    };

    if (moduleName) {
      // Retourner l'URL d'un module spécifique
      const url = moduleUrls[moduleName];
      if (url) {
        return NextResponse.json({ url });
      } else {
        return NextResponse.json(
          { error: 'Module non trouvé' },
          { status: 404 }
        );
      }
    } else {
      // Retourner toutes les URLs
      return NextResponse.json({ moduleUrls });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
} 