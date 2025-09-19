import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';

import { getAppLanguage } from '@/i18n';

const withAcceptLanguage = (
  config: InternalAxiosRequestConfig,
  language: string,
): InternalAxiosRequestConfig => {
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Accept-Language', language);
  config.headers = headers;
  return config;
};

const injectAcceptLanguage = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const language = getAppLanguage();
  return withAcceptLanguage(config, language);
};

export const attachAcceptLanguageInterceptor = (
  instance: AxiosInstance,
): AxiosInstance => {
  instance.interceptors.request.use(injectAcceptLanguage);
  return instance;
};

attachAcceptLanguageInterceptor(axios);

export const createAxiosInstance = (
  config?: CreateAxiosDefaults,
): AxiosInstance => {
  const instance = axios.create(config);
  return attachAcceptLanguageInterceptor(instance);
};

export const httpClient = createAxiosInstance();

export default httpClient;
