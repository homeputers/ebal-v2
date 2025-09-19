import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import SongDetailPage from '@/pages/songs/SongDetailPage';

const songDetailNamespaces = ['songs', 'arrangements', 'common'] as const;

export default function SongDetailRoute() {
  return (
    <MissingTranslationBoundary
      componentName="SongDetailPage"
      namespaces={songDetailNamespaces}
    >
      <SongDetailPage />
    </MissingTranslationBoundary>
  );
}
