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
type MePath = keyof paths & '/auth/me';

type AuthTokenPair = ResponseOf<LoginPath, 'post', 200>;
type RefreshResponse = ResponseOf<RefreshPath, 'post', 200>;
export type CurrentUser = ResponseOf<MePath, 'get', 200>;

export type LoginRequest = RequestBodyOf<LoginPath, 'post'>;
export type LoginResponse = AuthTokenPair;
export type Role = CurrentUser['roles'][number];

export type AuthTokens = AuthTokenPair & { expiresAt: number };

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_STORAGE_KEY = 'ebal.auth.tokens';

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

const subscribers = new Set<() => void>();

let currentTokens: AuthTokens | null = loadStoredTokens();
let refreshPromise: Promise<AuthTokenPair> | null = null;

const notifySubscribers = () => {
  subscribers.forEach((listener) => listener());
};

const setCurrentTokens = (tokens: AuthTokenPair) => {
  currentTokens = {
    ...tokens,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  } satisfies AuthTokens;
  persistTokens(currentTokens);
  notifySubscribers();
};

export const getAuthTokens = () => currentTokens;

export const subscribeToAuthTokens = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

export const clearAuthTokens = () => {
  currentTokens = null;
  persistTokens(null);
  notifySubscribers();
};

export const login = async (body: LoginRequest) => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', body);
  setCurrentTokens(data);
  return data;
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

export const getCurrentUser = async () => {
  const { data } = await apiClient.get<CurrentUser>('/auth/me');
  return data;
};

export const logout = () => {
  clearAuthTokens();
};

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'];

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  const normalized = url.split('?')[0] ?? url;
  return AUTH_ENDPOINTS.some((endpoint) => normalized.endsWith(endpoint));
};

const attachAuthInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use((config) => {
    const token = currentTokens?.accessToken;

    if (token && !isAuthEndpoint(config.url)) {
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

      if (originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      if (!currentTokens?.refreshToken) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;
        await queueTokenRefresh();
        return instance(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        return Promise.reject(refreshError);
      }
    },
  );

  return instance;
};

registerAxiosInterceptor(attachAuthInterceptors);
