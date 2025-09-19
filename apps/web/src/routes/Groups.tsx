import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import GroupsPage from '@/pages/groups/GroupsPage';

const groupsNamespaces = ['groups', 'common'] as const;

export default function GroupsRoute() {
  return (
    <MissingTranslationBoundary
      componentName="GroupsPage"
      namespaces={groupsNamespaces}
    >
      <GroupsPage />
    </MissingTranslationBoundary>
  );
}
