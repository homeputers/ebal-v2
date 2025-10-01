import type { ReactNode } from 'react';
import { toast as sonnerToast, type ExternalToast } from 'sonner';

import { announce, type PolitenessSetting } from '@/lib/announcer';
import { scheduleToastAccessibility } from '@/lib/toastAccessibility';

const ASSERTIVE_TYPES = new Set(['error', 'warning']);

type ToastContent = Parameters<typeof sonnerToast>[0];
type ToastOptions = Parameters<typeof sonnerToast>[1];

type AccessibleToastOptions = (ToastOptions extends undefined
  ? ExternalToast
  : ToastOptions) & {
  politeness?: PolitenessSetting;
};

type ToastMethod = (content: ToastContent, options?: AccessibleToastOptions) => string | number;

type SonnerToast = typeof sonnerToast;

function sanitizeOptions(options?: AccessibleToastOptions) {
  if (!options) {
    return { sanitized: undefined as ToastOptions | undefined, politeness: undefined };
  }

  const { politeness, ...rest } = options;

  return { sanitized: rest as ToastOptions, politeness };
}

function announceIfNeeded(content: ToastContent, politeness: PolitenessSetting) {
  const message = resolveMessage(content);

  if (typeof message === 'string') {
    announce(message, politeness);
  }
}

function resolveMessage(content: ToastContent): ReactNode {
  return typeof content === 'function' ? content() : content;
}

function getDefaultPoliteness(type?: string): PolitenessSetting {
  if (type && ASSERTIVE_TYPES.has(type)) {
    return 'assertive';
  }

  return 'polite';
}

function wrapToastMethod(
  method: ToastMethod,
  defaultPoliteness: PolitenessSetting,
): ToastMethod {
  return (content, options) => {
    const { sanitized, politeness } = sanitizeOptions(options);
    const resolvedPoliteness = politeness ?? defaultPoliteness;

    announceIfNeeded(content, resolvedPoliteness);

    const result = method(content, sanitized);
    scheduleToastAccessibility();

    return result;
  };
}

const toast = ((content: ToastContent, options?: AccessibleToastOptions) => {
  const { sanitized, politeness } = sanitizeOptions(options);
  const resolvedPoliteness = politeness ?? 'polite';

  announceIfNeeded(content, resolvedPoliteness);

  const result = sonnerToast(content, sanitized);
  scheduleToastAccessibility();

  return result;
}) as SonnerToast;

toast.success = wrapToastMethod(sonnerToast.success.bind(sonnerToast), getDefaultPoliteness('success'));
toast.info = wrapToastMethod(sonnerToast.info.bind(sonnerToast), getDefaultPoliteness('info'));
toast.warning = wrapToastMethod(sonnerToast.warning.bind(sonnerToast), getDefaultPoliteness('warning'));
toast.error = wrapToastMethod(sonnerToast.error.bind(sonnerToast), getDefaultPoliteness('error'));
toast.message = wrapToastMethod(sonnerToast.message.bind(sonnerToast), getDefaultPoliteness('default'));
toast.loading = wrapToastMethod(sonnerToast.loading.bind(sonnerToast), getDefaultPoliteness('loading'));

toast.dismiss = sonnerToast.dismiss.bind(sonnerToast);
toast.custom = ((renderer, options) => {
  const result = sonnerToast.custom(renderer, options);
  scheduleToastAccessibility();
  return result;
}) as typeof sonnerToast.custom;

toast.promise = ((promise, data) => {
  const result = sonnerToast.promise(promise, data);
  scheduleToastAccessibility();
  return result;
}) as typeof sonnerToast.promise;
toast.getHistory = sonnerToast.getHistory.bind(sonnerToast);
toast.getToasts = sonnerToast.getToasts.bind(sonnerToast);

type ToastWithAnnouncement = typeof toast;

export { toast };
export type { AccessibleToastOptions, ToastWithAnnouncement };
