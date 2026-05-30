import { UserRole } from './domain';

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
}

export type LoginResponse = ApiResponse<AuthResponse>;
export type RegisterResponse = ApiResponse<AuthResponse>;
