import { MissingTranslationBoundary } from '@/components/MissingTranslationBoundary';
import ServicePlanViewPage from '@/pages/services/ServicePlanViewPage';

const servicePlanViewNamespaces = ['services', 'arrangements', 'common'] as const;

export default function ServicePlanViewRoute() {
  return (
    <MissingTranslationBoundary
      componentName="ServicePlanViewPage"
      namespaces={servicePlanViewNamespaces}
    >
      <ServicePlanViewPage />
    </MissingTranslationBoundary>
  );
}
