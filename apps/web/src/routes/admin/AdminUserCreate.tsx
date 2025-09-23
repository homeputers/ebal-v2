import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import UserCreatePage from '@/pages/admin/users/UserCreatePage';

const namespaces = ['adminUsers', 'common'] as const;

export default function AdminUserCreateRoute() {
  return (
    <MissingTranslationBoundary
      componentName="AdminUserCreatePage"
      namespaces={namespaces}
    >
      <UserCreatePage />
    </MissingTranslationBoundary>
  );
}
