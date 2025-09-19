import { createAxiosInstance } from './axios';

export const apiClient = createAxiosInstance({
  baseURL: '/api/v1',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// response interceptor with minimal dev logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      const status = error?.response?.status;
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', status, error?.response?.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
