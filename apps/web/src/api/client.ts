import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

apiClient.interceptors.request.use((config) => config);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
