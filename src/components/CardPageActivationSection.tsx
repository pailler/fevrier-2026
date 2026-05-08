'use client';

/**
 * Redirection vers CardPageAccessSection.
 * Wrapper vers l’accès par crédits (tokens) — pas de notion d’« activation » côté utilisateur.
 */
import CardPageAccessSection from './CardPageAccessSection';

interface CardPageActivationSectionProps {
  moduleId: string;
  moduleName: string;
  tokenCost: number;
  tokenUnit?: string;
  showCostSummaryOnButton?: boolean;
  apiEndpoint?: string;
  gradientColors?: string;
  icon?: string;
  isModuleActivated?: boolean;
  onActivationSuccess?: () => void;
  moduleTitle?: string;
  moduleDescription?: string;
  moduleCategory?: string;
  moduleUrl?: string;
  customRequestBody?: (userId: string, email: string, moduleId: string) => Record<string, unknown>;
  accessUrl?: string;
}

export default function CardPageActivationSection(props: CardPageActivationSectionProps) {
  return (
    <CardPageAccessSection
      moduleId={props.moduleId}
      moduleName={props.moduleName}
      tokenCost={props.tokenCost}
      tokenUnit={props.tokenUnit}
      showCostSummaryOnButton={props.showCostSummaryOnButton}
      gradientColors={props.gradientColors}
      icon={props.icon}
      moduleTitle={props.moduleTitle}
      moduleDescription={props.moduleDescription}
      moduleCategory={props.moduleCategory}
      moduleUrl={props.moduleUrl}
      accessUrl={props.accessUrl}
    />
  );
}
