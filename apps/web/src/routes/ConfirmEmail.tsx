import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ConfirmEmailPage from '@/pages/auth/ConfirmEmailPage';

const confirmEmailNamespaces = ['me', 'common'] as const;

export default function ConfirmEmailRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ConfirmEmailPage"
      namespaces={confirmEmailNamespaces}
    >
      <ConfirmEmailPage />
    </MissingTranslationBoundary>
  );
}
