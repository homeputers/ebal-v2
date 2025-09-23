import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import UsersListPage from '@/pages/admin/users/UsersListPage';

const namespaces = ['adminUsers', 'common'] as const;

export default function AdminUsersListRoute() {
  return (
    <MissingTranslationBoundary
      componentName="AdminUsersListPage"
      namespaces={namespaces}
    >
      <UsersListPage />
    </MissingTranslationBoundary>
  );
}
