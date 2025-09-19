import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import SongSetsPage from '@/pages/sets/SongSetsPage';

const songSetsNamespaces = ['songSets', 'common'] as const;

export default function SongSetsRoute() {
  return (
    <MissingTranslationBoundary
      componentName="SongSetsPage"
      namespaces={songSetsNamespaces}
    >
      <SongSetsPage />
    </MissingTranslationBoundary>
  );
}
