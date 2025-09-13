import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// request interceptor (placeholder for auth headers later)
apiClient.interceptors.request.use((config) => config);

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
