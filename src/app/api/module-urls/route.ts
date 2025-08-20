import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');

    // Configuration des URLs des modules (URLs externes directes)
    const moduleUrls: { [key: string]: string } = {
      'metube': 'https://metube.regispailler.fr',
      'librespeed': 'https://librespeed.regispailler.fr',
      'pdf': 'https://pdf.regispailler.fr',
      'psitransfer': 'https://psitransfer.regispailler.fr',
      'qrcodes': 'https://qrcodes.regispailler.fr',
      'stablediffusion': 'https://stablediffusion.regispailler.fr',
      'ruinedfooocus': 'https://ruinedfooocus.regispailler.fr',
      'invoke': 'https://invoke.regispailler.fr',
      'comfyui': 'https://comfyui.regispailler.fr',
      'cogstudio': 'https://cogstudio.regispailler.fr',
      'sdnext': 'https://sdnext.regispailler.fr'
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
    console.error('❌ Erreur module-urls:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
} 