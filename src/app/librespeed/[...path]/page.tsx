import { redirect } from 'next/navigation';

export default async function LibreSpeedProxy({ params }: { params: Promise<{ path: string[] }> }) {
  // Rediriger vers l'API proxy
  const resolvedParams = await params;
  const path = resolvedParams.path ? '/' + resolvedParams.path.join('/') : '/';
  redirect(`/api/proxy-librespeed${path}`);
}
