import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ServicesPage from '@/pages/services/ServicesPage';

const servicesNamespaces = ['services', 'common'] as const;

export default function ServicesRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ServicesPage"
      namespaces={servicesNamespaces}
    >
      <ServicesPage />
    </MissingTranslationBoundary>
  );
}
