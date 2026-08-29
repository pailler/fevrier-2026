import { getCardModuleServer } from '@/utils/getCardModuleServer';
import CardInteractive from '../[id]/CardInteractive';

export const revalidate = 3600;

export default async function CogStudioCardPage() {
  const initialModule = await getCardModuleServer('cogstudio');
  return <CardInteractive initialModule={initialModule} />;
}
