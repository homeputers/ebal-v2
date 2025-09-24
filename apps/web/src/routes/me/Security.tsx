import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import SecurityPage from '@/pages/me/SecurityPage';

const securityNamespaces = ['me', 'validation'] as const;

export default function SecurityRoute() {
  return (
    <MissingTranslationBoundary
      componentName="SecurityPage"
      namespaces={securityNamespaces}
    >
      <SecurityPage />
    </MissingTranslationBoundary>
  );
}
