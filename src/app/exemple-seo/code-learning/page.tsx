import { redirect } from 'next/navigation';
import { CODE_LEARNING_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

export default function CodeLearningSeoExampleRedirectPage() {
  redirect(`${CODE_LEARNING_PUBLIC_ORIGIN}/`);
}
