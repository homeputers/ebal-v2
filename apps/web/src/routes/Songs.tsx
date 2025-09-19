import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import SongsPage from '@/pages/songs/SongsPage';

const songsNamespaces = ['songs', 'common'] as const;

export default function SongsRoute() {
  return (
    <MissingTranslationBoundary
      componentName="SongsPage"
      namespaces={songsNamespaces}
    >
      <SongsPage />
    </MissingTranslationBoundary>
  );
}
