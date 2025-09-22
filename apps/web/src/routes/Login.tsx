import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import LoginPage from '@/pages/auth/LoginPage';

const loginNamespaces = ['auth', 'validation', 'common'] as const;

export default function LoginRoute() {
  return (
    <MissingTranslationBoundary
      componentName="LoginPage"
      namespaces={loginNamespaces}
    >
      <LoginPage />
    </MissingTranslationBoundary>
  );
}
