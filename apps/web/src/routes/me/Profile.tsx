import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ProfilePage from '@/pages/me/ProfilePage';

const profileNamespaces = ['me', 'common', 'adminUsers', 'validation'] as const;

export default function ProfileRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ProfilePage"
      namespaces={profileNamespaces}
    >
      <ProfilePage />
    </MissingTranslationBoundary>
  );
}
