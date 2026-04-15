'use client';

/**
 * Redirection vers ModuleAccessButton.
 * Accès aux applis par consommation de crédits (tokens).
 */
import ModuleAccessButton from './ModuleAccessButton';

interface ModuleActivationButtonProps {
  moduleId: string;
  moduleName: string;
  moduleCost: number;
  moduleDescription?: string;
  accessUrl?: string;
  className?: string;
  onActivationSuccess?: () => void;
  onActivationError?: (error: string) => void;
}

export default function ModuleActivationButton(props: ModuleActivationButtonProps) {
  return (
    <ModuleAccessButton
      moduleId={props.moduleId}
      moduleName={props.moduleName}
      moduleCost={props.moduleCost}
      moduleDescription={props.moduleDescription}
      accessUrl={props.accessUrl}
      className={props.className}
      onAccessSuccess={props.onActivationSuccess}
      onAccessError={props.onActivationError}
    />
  );
}
