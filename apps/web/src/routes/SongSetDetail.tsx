import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import SongSetDetailPage from '@/pages/sets/SongSetDetailPage';

const songSetDetailNamespaces = [
  'songSets',
  'arrangements',
  'songs',
  'common',
] as const;

export default function SongSetDetailRoute() {
  return (
    <MissingTranslationBoundary
      componentName="SongSetDetailPage"
      namespaces={songSetDetailNamespaces}
    >
      <SongSetDetailPage />
    </MissingTranslationBoundary>
  );
}
