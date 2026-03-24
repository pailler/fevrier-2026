import { NextRequest, NextResponse } from 'next/server';

const COMFYUI_URL = process.env.COMFYUI_URL || process.env.COMFYUI_INTERNAL_URL || 'http://localhost:8188';

function toErrorString(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string')
    return (e as { message: string }).message;
  return e != null ? JSON.stringify(e) : 'Erreur inconnue';
}

function buildHi3DGenWorkflow(imageFilename: string, projectName: string) {
  // ComfyUI-Hi3DGen : IF_TrellisCheckpointLoader + IF_TrellisImageTo3D
  return {
    '1': {
      class_type: 'LoadImage',
      inputs: { image: imageFilename },
    },
    '2': {
      class_type: 'IF_TrellisCheckpointLoader',
      inputs: {
        model_name: 'trellis-normal-v0-1',
        dinov2_model: 'dinov2_vitl14_reg',
        use_fp16: true,
        attn_backend: 'xformers',
        sparse_backend: 'spconv',
        spconv_algo: 'implicit_gemm',
        smooth_k: true,
      },
    },
    '3': {
      class_type: 'IF_TrellisImageTo3D',
      inputs: {
        model: ['2', 0],
        mode: 'single',
        images: ['1', 0],
        seed: Math.floor(Math.random() * 2147483647),
        ss_guidance_strength: 7.5,
        ss_sampling_steps: 12,
        slat_guidance_strength: 3.0,
        slat_sampling_steps: 12,
        mesh_simplify: 0.95,
        multimode: 'stochastic',
        project_name: projectName,
      },
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    formData.get('prompt'); // optionnel pour Hi3DGen

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', image, image.name || 'input.png');

    const uploadRes = await fetch(`${COMFYUI_URL}/upload/image`, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Hi3DGen ComfyUI upload error:', uploadRes.status, errText);
      return NextResponse.json(
        { error: `Erreur upload ComfyUI: ${uploadRes.status}` },
        { status: 502 }
      );
    }

    const uploadResult = await uploadRes.json();
    const imageFilename = uploadResult?.name || image.name || 'input.png';

    const projectName = `hi3dgen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const workflow = buildHi3DGenWorkflow(imageFilename, projectName);

    const promptRes = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!promptRes.ok) {
      const errData = await promptRes.json().catch(() => ({}));
      console.error('Hi3DGen ComfyUI prompt error:', promptRes.status, errData);
      const errStr = toErrorString(errData?.error) || `Erreur prompt ComfyUI: ${promptRes.status}`;
      return NextResponse.json({ error: errStr }, { status: 502 });
    }

    const { prompt_id, node_errors } = await promptRes.json();

    if (node_errors && Object.keys(node_errors).length > 0) {
      return NextResponse.json(
        { error: 'Erreur nodes ComfyUI', details: node_errors },
        { status: 502 }
      );
    }

    let history: Record<string, unknown> | null = null;
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const historyRes = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
      if (!historyRes.ok) continue;
      const data = await historyRes.json();
      if (data[prompt_id]) {
        history = data[prompt_id];
        break;
      }
    }

    if (!history) {
      return NextResponse.json(
        { error: 'Time-out: la génération a pris trop de temps' },
        { status: 504 }
      );
    }

    const outputs = (history as { outputs?: Record<string, { strings?: string[]; text?: string[] }> }).outputs;
    const node3 = outputs?.['3'];
    const modelPathRaw = node3?.strings?.[0] ?? node3?.text?.[0];

    if (!modelPathRaw) {
      return NextResponse.json(
        { error: 'Pas de sortie 3D trouvée', history: outputs },
        { status: 502 }
      );
    }

    const lines = String(modelPathRaw).trim().split('\n');
    const firstPath = lines[0]?.trim() || '';
    const pathParts = firstPath.split(/[/\\]/).filter(Boolean);
    const filename = pathParts.pop() || 'output.glb';
    const subfolder = pathParts.length > 0 ? pathParts.join('/') : '';

    const viewUrl = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&type=output${subfolder ? `&subfolder=${encodeURIComponent(subfolder)}` : ''}`;
    const glbRes = await fetch(viewUrl);

    if (!glbRes.ok) {
      return NextResponse.json(
        { error: 'Fichier GLB non accessible', filename },
        { status: 502 }
      );
    }

    const glbBuffer = await glbRes.arrayBuffer();

    return new NextResponse(glbBuffer, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Hi3DGen API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
