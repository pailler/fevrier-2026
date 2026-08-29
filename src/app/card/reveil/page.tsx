import { getCardModuleServer } from '@/utils/getCardModuleServer';
import CardInteractive from '../reveil-intelligent/CardInteractive';

export const revalidate = 3600;

/** Alias public demandé : /card/reveil → même module reveil-intelligent */
export default async function CardPage() {
  const initialModule = await getCardModuleServer('reveil-intelligent');
  return <CardInteractive initialModule={initialModule} />;
}
