import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

const resetNamespaces = ['auth', 'validation', 'common'] as const;

export default function ResetPasswordRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ResetPasswordPage"
      namespaces={resetNamespaces}
    >
      <ResetPasswordPage />
    </MissingTranslationBoundary>
  );
}
