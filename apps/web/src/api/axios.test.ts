import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AxiosHeaders, type AxiosAdapter } from 'axios';

import i18n from '@/i18n';
import httpClient, { createAxiosInstance } from './axios';

describe('axios Accept-Language interceptor', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('injects the current language into the Accept-Language header', async () => {
    await i18n.changeLanguage('es');

    const adapter = vi.fn<Parameters<AxiosAdapter>, ReturnType<AxiosAdapter>>(async (config) => ({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: AxiosHeaders.from({}),
      config,
    }));

    await httpClient.get('/test', { adapter });

    const requestConfig = adapter.mock.calls[0][0];
    const headers = AxiosHeaders.from(requestConfig.headers ?? {});

    expect(headers.get('Accept-Language')).toBe('es');
  });

  it('applies the interceptor to new axios instances', async () => {
    const instance = createAxiosInstance();

    await i18n.changeLanguage('es');

    const adapter = vi.fn<Parameters<AxiosAdapter>, ReturnType<AxiosAdapter>>(async (config) => ({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: AxiosHeaders.from({}),
      config,
    }));

    await instance.get('/other', { adapter });

    const requestConfig = adapter.mock.calls[0][0];
    const headers = AxiosHeaders.from(requestConfig.headers ?? {});

    expect(headers.get('Accept-Language')).toBe('es');
  });
});
