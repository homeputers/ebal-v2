import { useEffect, type ReactNode } from 'react';

import i18n from '@/i18n';

const isDevEnvironment = import.meta.env.DEV;

type MissingTranslationBoundaryProps = {
  componentName: string;
  namespaces?: readonly string[] | string;
  children: ReactNode;
};

export function MissingTranslationBoundary({
  componentName,
  namespaces,
  children,
}: MissingTranslationBoundaryProps) {
  useEffect(() => {
    if (!isDevEnvironment) {
      return;
    }

    const namespaceFilter =
      namespaces === undefined
        ? null
        : new Set(
            Array.isArray(namespaces)
              ? namespaces
              : ([namespaces] as const),
          );

    const seenKeys = new Set<string>();

    const handleMissingKey = (_lng: string, ns: string, key: string) => {
      if (namespaceFilter && !namespaceFilter.has(ns)) {
        return;
      }

      const identifier = `${ns}:${key}`;
      if (seenKeys.has(identifier)) {
        return;
      }

      seenKeys.add(identifier);

      // eslint-disable-next-line no-console
      console.warn(
        `[i18n][${componentName}] Missing translation key "${key}" in namespace "${ns}".`,
      );
    };

    i18n.on('missingKey', handleMissingKey);

    return () => {
      i18n.off('missingKey', handleMissingKey);
    };
  }, [componentName, namespaces]);

  return <>{children}</>;
}

