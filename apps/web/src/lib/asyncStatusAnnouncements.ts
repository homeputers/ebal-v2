import type { QueryClient } from '@tanstack/react-query';

import i18n from '@/i18n';
import { announce } from './announcer';

const fallbackMessages = {
  loading: 'Loading data…',
  loaded: 'Finished loading.',
  error: 'Failed to load data.',
  submitting: 'Submitting form…',
  submitted: 'Form submitted.',
  submitError: 'Form submission failed.',
} as const;

type FallbackKey = keyof typeof fallbackMessages;

type QueryStatus = 'pending' | 'error' | 'success';
type FetchStatus = 'idle' | 'fetching' | 'paused';
type MutationStatus = 'idle' | 'pending' | 'success' | 'error';

type QuerySnapshot = {
  status: QueryStatus;
  fetchStatus: FetchStatus;
};

type MutationSnapshot = {
  status: MutationStatus;
};

type QueryLike = {
  state: QuerySnapshot;
};

type MutationLike = {
  state: MutationSnapshot;
};

type QueryCacheEvent = {
  type: string;
  query?: QueryLike;
};

type MutationCacheEvent = {
  type: string;
  mutation?: MutationLike;
};

const querySnapshots = new WeakMap<QueryLike, QuerySnapshot>();
const mutationSnapshots = new WeakMap<MutationLike, MutationSnapshot>();

function getMessage(key: FallbackKey) {
  return i18n.t(`common:announcements.${key}`, {
    defaultValue: fallbackMessages[key],
  });
}

function handleQueryUpdate(query: QueryLike) {
  const state = query.state;
  const previous = querySnapshots.get(query);

  if (state.fetchStatus === 'fetching' && previous?.fetchStatus !== 'fetching') {
    announce(getMessage('loading'));
  }

  if (previous?.fetchStatus === 'fetching' && state.fetchStatus !== 'fetching') {
    const message = state.status === 'error' ? 'error' : 'loaded';
    announce(getMessage(message));
  }

  querySnapshots.set(query, {
    status: state.status,
    fetchStatus: state.fetchStatus,
  });
}

function handleMutationUpdate(mutation: MutationLike) {
  const state = mutation.state;
  const previous = mutationSnapshots.get(mutation);

  if (state.status === 'pending' && previous?.status !== 'pending') {
    announce(getMessage('submitting'));
  }

  if (previous?.status === 'pending') {
    if (state.status === 'success') {
      announce(getMessage('submitted'));
    } else if (state.status === 'error') {
      announce(getMessage('submitError'));
    }
  }

  mutationSnapshots.set(mutation, { status: state.status });
}

export function setupAsyncStatusAnnouncements(queryClient: QueryClient) {
  const unsubscribeQuery = queryClient.getQueryCache().subscribe(
    (event: QueryCacheEvent) => {
      if (event.type === 'updated' && event.query) {
        handleQueryUpdate(event.query);
      }
    },
  );

  const unsubscribeMutation = queryClient.getMutationCache().subscribe(
    (event: MutationCacheEvent) => {
      if (event.type === 'updated' && event.mutation) {
        handleMutationUpdate(event.mutation);
      }
    },
  );

  return () => {
    unsubscribeQuery();
    unsubscribeMutation();
  };
}
