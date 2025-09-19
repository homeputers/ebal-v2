import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import MembersPage from '@/pages/members/MembersPage';

const membersNamespaces = ['members', 'common'] as const;

export default function MembersRoute() {
  return (
    <MissingTranslationBoundary
      componentName="MembersPage"
      namespaces={membersNamespaces}
    >
      <MembersPage />
    </MissingTranslationBoundary>
  );
}
