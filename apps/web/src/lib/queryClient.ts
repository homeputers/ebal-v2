import { QueryClient } from '@tanstack/react-query';

import { getAppLanguage } from '../i18n';

export const withLangKey = <TKey extends readonly unknown[]>(baseKey: TKey) =>
  [...baseKey, getAppLanguage()] as const;

export const queryClient = new QueryClient();
