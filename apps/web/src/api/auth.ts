import {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import apiClient from './client';
import { registerAxiosInterceptor } from './axios';
import type { paths } from './types';
import { RequestBodyOf, ResponseOf } from './type-helpers';

type LoginPath = keyof paths & '/auth/login';
type RefreshPath = keyof paths & '/auth/refresh';
type ForgotPasswordPath = keyof paths & '/auth/forgot-password';
type ResetPasswordPath = keyof paths & '/auth/reset-password';
type ChangePasswordPath = keyof paths & '/auth/change-password';
type MePath = keyof paths & '/auth/me';

type AuthTokenPair = ResponseOf<LoginPath, 'post', 200>;
type RefreshResponse = ResponseOf<RefreshPath, 'post', 200>;
export type CurrentUser = ResponseOf<MePath, 'get', 200>;

export type LoginRequest = RequestBodyOf<LoginPath, 'post'>;
export type LoginResponse = AuthTokenPair;
export type ForgotPasswordRequest = RequestBodyOf<ForgotPasswordPath, 'post'>;
export type ResetPasswordRequest = RequestBodyOf<ResetPasswordPath, 'post'>;
export type ChangePasswordRequest = RequestBodyOf<ChangePasswordPath, 'post'>;
export type Role = CurrentUser['roles'][number];

export type AuthTokens = AuthTokenPair & { expiresAt: number };

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type StoredCurrentUser = Pick<
  CurrentUser,
  'id' | 'email' | 'displayName' | 'roles' | 'isActive' | 'createdAt' | 'updatedAt'
>;

type AuthSessionClearReason = 'logout' | 'session-expired';

const AUTH_STORAGE_KEY = 'ebal.auth.tokens';
const AUTH_ME_STORAGE_KEY = 'ebal.auth.me';

const loadStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthTokens>;
    if (
      typeof parsed?.accessToken === 'string' &&
      typeof parsed?.refreshToken === 'string' &&
      typeof parsed?.expiresAt === 'number'
    ) {
      return parsed as AuthTokens;
    }
  } catch {
    // ignore and reset storage below
  }

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures
  }
  return null;
};

const persistTokens = (tokens: AuthTokens | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!tokens) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.)
  }
};

const loadStoredCurrentUser = (): StoredCurrentUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_ME_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCurrentUser>;
    if (
      typeof parsed?.id === 'string' &&
      typeof parsed?.email === 'string' &&
      typeof parsed?.displayName === 'string' &&
      Array.isArray(parsed?.roles) &&
      typeof parsed?.isActive === 'boolean' &&
      typeof parsed?.createdAt === 'string' &&
      typeof parsed?.updatedAt === 'string'
    ) {
      return parsed as StoredCurrentUser;
    }
  } catch {
    // ignore malformed payloads and clean up below
  }

  try {
    window.localStorage.removeItem(AUTH_ME_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures
  }

  return null;
};

const persistCurrentUser = (value: StoredCurrentUser | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!value) {
      window.localStorage.removeItem(AUTH_ME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_ME_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.)
  }
};

const subscribers = new Set<() => void>();
const sessionExpirationListeners = new Set<() => void>();

let currentTokens: AuthTokens | null = loadStoredTokens();
let storedCurrentUser: StoredCurrentUser | null = loadStoredCurrentUser();
let refreshPromise: Promise<AuthTokenPair> | null = null;

const notifySubscribers = () => {
  subscribers.forEach((listener) => listener());
};

const notifySessionExpired = () => {
  sessionExpirationListeners.forEach((listener) => listener());
};

const setCurrentTokens = (tokens: AuthTokenPair) => {
  currentTokens = {
    ...tokens,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  } satisfies AuthTokens;
  persistTokens(currentTokens);
  notifySubscribers();
};

export const getAuthTokens = () => {
  if (!currentTokens) {
    currentTokens = loadStoredTokens();
  }

  return currentTokens;
};

export const getStoredCurrentUser = () => {
  if (!storedCurrentUser) {
    storedCurrentUser = loadStoredCurrentUser();
  }

  return storedCurrentUser;
};

export const subscribeToAuthTokens = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

export const subscribeToSessionExpiration = (listener: () => void) => {
  sessionExpirationListeners.add(listener);
  return () => {
    sessionExpirationListeners.delete(listener);
  };
};

export const clearAuthTokens = (
  reason: AuthSessionClearReason = 'logout',
) => {
  currentTokens = null;
  persistTokens(null);
  storedCurrentUser = null;
  persistCurrentUser(null);
  notifySubscribers();
  if (reason === 'session-expired') {
    notifySessionExpired();
  }
};

export const login = async (body: LoginRequest) => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', body);
  setCurrentTokens(data);
  return data;
};

export const requestPasswordReset = async (
  body: ForgotPasswordRequest,
) => {
  await apiClient.post('/auth/forgot-password', body);
};

export const resetPassword = async (body: ResetPasswordRequest) => {
  await apiClient.post('/auth/reset-password', body);
};

export const changePassword = async (body: ChangePasswordRequest) => {
  await apiClient.post('/auth/change-password', body);
};

const requestTokenRefresh = async () => {
  if (!currentTokens?.refreshToken) {
    throw new Error('Missing refresh token');
  }

  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', {
    refreshToken: currentTokens.refreshToken,
  });

  setCurrentTokens(data);
  return data;
};

const queueTokenRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const refreshTokens = () => queueTokenRefresh();

const toStoredCurrentUser = (value: CurrentUser): StoredCurrentUser => ({
  id: value.id,
  email: value.email,
  displayName: value.displayName,
  roles: [...value.roles],
  isActive: value.isActive,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});

export const getCurrentUser = async () => {
  const { data } = await apiClient.get<CurrentUser>('/auth/me');
  const snapshot = toStoredCurrentUser(data);
  storedCurrentUser = snapshot;
  persistCurrentUser(snapshot);
  return data;
};

export const logout = () => {
  clearAuthTokens('logout');
};

const UNAUTHENTICATED_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/me/confirm-email',
] as const;

const SENSITIVE_AUTH_ENDPOINTS = ['/me/change-password', '/me/change-email'] as const;

const createEndpointMatcher = (endpoints: readonly string[]) => (url?: string) => {
  if (!url) {
    return false;
  }

  const normalized = url.split('?')[0] ?? url;
  return endpoints.some((endpoint) => normalized.endsWith(endpoint));
};

const shouldSkipAuthHeader = createEndpointMatcher(UNAUTHENTICATED_ENDPOINTS);

const AUTH_RETRY_BYPASS_ENDPOINTS = [
  ...UNAUTHENTICATED_ENDPOINTS,
  ...SENSITIVE_AUTH_ENDPOINTS,
] as const;

const AUTH_RETRY_LOGOUT_ENDPOINTS = ['/auth/refresh'] as const;

const shouldBypassAuthRetry = createEndpointMatcher(AUTH_RETRY_BYPASS_ENDPOINTS);
const shouldClearTokensOnBypass = createEndpointMatcher(AUTH_RETRY_LOGOUT_ENDPOINTS);

const attachAuthInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use((config) => {
    const token = currentTokens?.accessToken;

    if (token && !shouldSkipAuthHeader(config.url)) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const { config, response } = error;

      if (!config || !response || response.status !== 401) {
        return Promise.reject(error);
      }

      const originalRequest = config as AuthenticatedRequestConfig;

      if (originalRequest._retry) {
        clearAuthTokens('session-expired');
        return Promise.reject(error);
      }

      if (shouldBypassAuthRetry(originalRequest.url)) {
        if (shouldClearTokensOnBypass(originalRequest.url)) {
          clearAuthTokens('session-expired');
        }
        return Promise.reject(error);
      }

      if (!currentTokens?.refreshToken) {
        clearAuthTokens('session-expired');
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;
        await queueTokenRefresh();
        return instance(originalRequest);
      } catch (refreshError) {
        clearAuthTokens('session-expired');
        return Promise.reject(refreshError);
      }
    },
  );

  return instance;
};

registerAxiosInterceptor(attachAuthInterceptors);
