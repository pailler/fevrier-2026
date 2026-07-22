import { getCardModuleServer } from '@/utils/getCardModuleServer';
import CardInteractive from './CardInteractive';

export const revalidate = 3600;

export default async function CardPage() {
  const initialModule = await getCardModuleServer('hi3dgen');
  return <CardInteractive initialModule={initialModule} />;
}
