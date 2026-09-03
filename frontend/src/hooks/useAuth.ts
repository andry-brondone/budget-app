import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { extractErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthResponse, AuthUser } from '@/types/auth.types';
import type { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schema';

/**
 * Restaure la session au chargement de l'app en échangeant le cookie
 * httpOnly de refresh contre un nouvel access token. Si aucune session
 * valide n'existe, échoue silencieusement (l'utilisateur est redirigé
 * vers /login par les routes protégées).
 */
export const useBootstrapSession = () => {
  const setSession = useAuthStore((state) => state.setSession);

  const query = useQuery({
    queryKey: ['auth', 'bootstrap'],
    queryFn: async () => {
      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      setSession(response.data.user, response.data.accessToken);
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return { isLoading: query.isLoading };
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const payload = {
        name: values.name,
        password: values.password,
        email: values.email ? values.email : undefined,
        phone: values.phone ? values.phone : undefined,
      };
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      toast.success(`Bienvenue ${data.user.name} 👋`);
      void navigate('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', values);
      return response.data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      toast.success('Connexion réussie');
      void navigate('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      void navigate('/login');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useCurrentUser = (): AuthUser | null => useAuthStore((state) => state.user);
