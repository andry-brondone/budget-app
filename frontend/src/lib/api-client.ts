import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthResponse } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // requis pour envoyer le cookie httpOnly de refresh
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const resolvePendingRequests = (token: string | null): void => {
  pendingRequests.forEach((callback) => {
    callback(token);
  });
  pendingRequests = [];
};

/**
 * Intercepteur de rafraîchissement automatique : sur un 401, tente
 * un /auth/refresh (via le cookie httpOnly) puis rejoue la requête
 * originale avec le nouveau token. Les requêtes concurrentes pendant
 * le refresh sont mises en file d'attente pour éviter plusieurs
 * appels /refresh simultanés.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      const newToken = response.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      resolvePendingRequests(newToken);
      originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
      return await apiClient(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(null);
      useAuthStore.getState().clearSession();
      const normalizedError =
        refreshError instanceof Error
          ? refreshError
          : new Error('Échec du rafraîchissement de session');
      return await Promise.reject(normalizedError);
    } finally {
      isRefreshing = false;
    }
  },
);
