import { getCardModuleServer } from '@/utils/getCardModuleServer';
import CardInteractive from './CardInteractive';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DynamicCardPage({ params }: PageProps) {
  const { id } = await params;
  const initialModule = await getCardModuleServer(id);
  return <CardInteractive initialModule={initialModule} />;
}
