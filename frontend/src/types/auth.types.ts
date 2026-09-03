export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
