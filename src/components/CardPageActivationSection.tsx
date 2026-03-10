'use client';

/**
 * Redirection vers CardPageAccessSection.
 * Le système d'activation n'existe plus - accès direct par crédits uniquement.
 */
import CardPageAccessSection from './CardPageAccessSection';

interface CardPageActivationSectionProps {
  moduleId: string;
  moduleName: string;
  tokenCost: number;
  tokenUnit?: string;
  apiEndpoint?: string;
  gradientColors?: string;
  icon?: string;
  isModuleActivated?: boolean;
  onActivationSuccess?: () => void;
  moduleTitle?: string;
  moduleDescription?: string;
  moduleCategory?: string;
  moduleUrl?: string;
  customRequestBody?: (userId: string, email: string, moduleId: string) => any;
  accessUrl?: string;
}

export default function CardPageActivationSection(props: CardPageActivationSectionProps) {
  return (
    <CardPageAccessSection
      moduleId={props.moduleId}
      moduleName={props.moduleName}
      tokenCost={props.tokenCost}
      tokenUnit={props.tokenUnit}
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
