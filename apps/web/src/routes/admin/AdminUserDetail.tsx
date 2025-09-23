import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import UserDetailPage from '@/pages/admin/users/UserDetailPage';

const namespaces = ['adminUsers', 'common'] as const;

export default function AdminUserDetailRoute() {
  return (
    <MissingTranslationBoundary
      componentName="AdminUserDetailPage"
      namespaces={namespaces}
    >
      <UserDetailPage />
    </MissingTranslationBoundary>
  );
}
