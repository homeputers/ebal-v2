import { useEffect } from 'react';
import { Toaster, type ToasterProps } from 'sonner';
import { useTranslation } from 'react-i18next';

import {
  observeToastAccessibility,
  scheduleToastAccessibility,
  setToastDismissLabel,
} from '@/lib/toastAccessibility';

type AccessibleToasterProps = ToasterProps;

export function AccessibleToaster({ toastOptions, closeButton = true, ...props }: AccessibleToasterProps) {
  const { t } = useTranslation('common');
  const dismissLabel = t('notifications.dismiss', {
    defaultValue: 'Dismiss notification',
  });

  useEffect(() => {
    setToastDismissLabel(dismissLabel);
    scheduleToastAccessibility();
    const teardown = observeToastAccessibility();

    return () => {
      teardown();
    };
  }, [dismissLabel]);

  return (
    <Toaster
      richColors
      closeButton={closeButton}
      toastOptions={{
        duration: 6000,
        ...toastOptions,
      }}
      closeButtonAriaLabel={dismissLabel}
      {...props}
    />
  );
}
