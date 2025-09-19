import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import GroupDetailPage from '@/pages/groups/GroupDetailPage';

const groupDetailNamespaces = ['groups', 'common'] as const;

export default function GroupDetailRoute() {
  return (
    <MissingTranslationBoundary
      componentName="GroupDetailPage"
      namespaces={groupDetailNamespaces}
    >
      <GroupDetailPage />
    </MissingTranslationBoundary>
  );
}
