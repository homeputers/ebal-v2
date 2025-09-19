import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ServicePrintPage from '@/pages/services/ServicePrintPage';

const servicePrintNamespaces = ['services', 'arrangements', 'common'] as const;

export default function ServicePrintRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ServicePrintPage"
      namespaces={servicePrintNamespaces}
    >
      <ServicePrintPage />
    </MissingTranslationBoundary>
  );
}
