import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios';

import i18n from '@/i18n';
import httpClient, { createAxiosInstance } from './axios';
import apiClient from './client';
import * as auth from './auth';

const successAdapterResponse = (config: Parameters<AxiosAdapter>[0]) => ({
  data: null,
  status: 200,
  statusText: 'OK',
  headers: AxiosHeaders.from({}),
  config,
});

beforeEach(async () => {
  await i18n.changeLanguage('en');
  auth.logout();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(async () => {
  auth.logout();
  window.localStorage.clear();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
});

describe('axios Accept-Language interceptor', () => {
  it('injects the current language into the Accept-Language header', async () => {
    await i18n.changeLanguage('es');

    const adapter = vi.fn<Parameters<AxiosAdapter>, ReturnType<AxiosAdapter>>(async (config) =>
      successAdapterResponse(config),
    );

    await httpClient.get('/test', { adapter });

    const requestConfig = adapter.mock.calls[0][0];
    const headers = AxiosHeaders.from(requestConfig.headers ?? {});

    expect(headers.get('Accept-Language')).toBe('es');
  });

  it('applies the interceptor to new axios instances', async () => {
    const instance = createAxiosInstance();

    await i18n.changeLanguage('es');

    const adapter = vi.fn<Parameters<AxiosAdapter>, ReturnType<AxiosAdapter>>(async (config) =>
      successAdapterResponse(config),
    );

    await instance.get('/other', { adapter });

    const requestConfig = adapter.mock.calls[0][0];
    const headers = AxiosHeaders.from(requestConfig.headers ?? {});

    expect(headers.get('Accept-Language')).toBe('es');
  });
});

describe('axios auth interceptor', () => {
  it('attaches Authorization header when an access token is present', async () => {
    const tokenPair = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 60,
    };

    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: tokenPair } as never);

    await auth.login({ email: 'user@example.com', password: 'secret' });

    const adapter = vi.fn<Parameters<AxiosAdapter>, ReturnType<AxiosAdapter>>(async (config) =>
      successAdapterResponse(config),
    );

    const instance = createAxiosInstance();
    await instance.get('/secure', { adapter });

    const headers = AxiosHeaders.from(adapter.mock.calls[0][0].headers ?? {});
    expect(headers.get('Authorization')).toBe(`Bearer ${tokenPair.accessToken}`);
  });

  it('refreshes tokens once on 401 responses and retries the original request', async () => {
    const initialTokens = {
      accessToken: 'expired-access',
      refreshToken: 'refresh-token',
      expiresIn: 60,
    };
    const refreshedTokens = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 120,
    };

    vi.spyOn(apiClient, 'post').mockImplementation(async (url, ...rest) => {
      if (url === '/auth/login') {
        return { data: initialTokens } as never;
      }

      if (url === '/auth/refresh') {
        return { data: refreshedTokens } as never;
      }

      throw new Error(`Unexpected POST to ${url} with ${JSON.stringify(rest)}`);
    });

    await auth.login({ email: 'user@example.com', password: 'secret' });

    let callCount = 0;
    const adapter = vi.fn<Parameters<AxiosAdapter>, ReturnType<AxiosAdapter>>(async (config) => {
      callCount += 1;

      if (callCount === 1) {
        throw new AxiosError(
          'Unauthorized',
          '401',
          config,
          undefined,
          {
            data: null,
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
          },
        );
      }

      return successAdapterResponse(config);
    });

    const instance = createAxiosInstance();
    await instance.get('/needs-refresh', { adapter });

    expect(callCount).toBe(2);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: initialTokens.refreshToken,
    });

    const retryHeaders = AxiosHeaders.from(adapter.mock.calls[1][0].headers ?? {});
    expect(retryHeaders.get('Authorization')).toBe(`Bearer ${refreshedTokens.accessToken}`);
    expect(auth.getAuthTokens()).toMatchObject({ accessToken: refreshedTokens.accessToken });
  });
});
