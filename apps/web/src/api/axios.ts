import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';

import { getAppLanguage } from '@/i18n';

type InterceptorAttacher = (instance: AxiosInstance) => AxiosInstance;

const interceptorAttachers: InterceptorAttacher[] = [];
const axiosInstances = new Set<AxiosInstance>([axios]);

const applyInterceptors = (instance: AxiosInstance): AxiosInstance => {
  interceptorAttachers.forEach((attacher) => {
    attacher(instance);
  });
  return instance;
};

export const registerAxiosInterceptor = (
  attacher: InterceptorAttacher,
) => {
  interceptorAttachers.push(attacher);
  axiosInstances.forEach((instance) => {
    attacher(instance);
  });
};

const withAcceptLanguage = (
  config: InternalAxiosRequestConfig,
  language: string,
): InternalAxiosRequestConfig => {
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Accept-Language', language);
  config.headers = headers;
  return config;
};

const attachAcceptLanguageInterceptor: InterceptorAttacher = (instance) => {
  instance.interceptors.request.use((config) => {
    const language = getAppLanguage();
    return withAcceptLanguage(config, language);
  });
  return instance;
};

registerAxiosInterceptor(attachAcceptLanguageInterceptor);

export const createAxiosInstance = (
  config?: CreateAxiosDefaults,
): AxiosInstance => {
  const instance = axios.create(config);
  axiosInstances.add(instance);
  return applyInterceptors(instance);
};

export const httpClient = createAxiosInstance();

export default httpClient;
