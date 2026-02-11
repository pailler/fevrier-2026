import { redirect } from 'next/navigation';

/**
 * Ancienne URL /pricing : redirection vers la page tarifs /pricing2.
 */
export default function PricingRedirect() {
  redirect('/pricing2');
}
