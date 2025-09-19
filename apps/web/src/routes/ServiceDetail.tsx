import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ServiceDetailPage from '@/pages/services/ServiceDetailPage';

const serviceDetailNamespaces = [
  'services',
  'songs',
  'arrangements',
  'common',
] as const;

export default function ServiceDetailRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ServiceDetailPage"
      namespaces={serviceDetailNamespaces}
    >
      <ServiceDetailPage />
    </MissingTranslationBoundary>
  );
}
