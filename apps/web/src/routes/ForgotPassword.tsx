import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

const forgotNamespaces = ['auth', 'validation', 'common'] as const;

export default function ForgotPasswordRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ForgotPasswordPage"
      namespaces={forgotNamespaces}
    >
      <ForgotPasswordPage />
    </MissingTranslationBoundary>
  );
}
