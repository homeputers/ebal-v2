import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';

const changeNamespaces = ['auth', 'validation', 'common'] as const;

export default function ChangePasswordRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ChangePasswordPage"
      namespaces={changeNamespaces}
    >
      <ChangePasswordPage />
    </MissingTranslationBoundary>
  );
}
