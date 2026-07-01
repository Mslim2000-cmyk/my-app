// User model interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  boardId?: string;
  status: UserStatus;
  usage?: UserUsage;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  companyName?: string;
}

export enum UserRole {
  TENANT_ADMIN = 'tenant_admin',
  TENANT_USER = 'tenant_user',
  END_USER = 'end_user'
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  PENDING = 'pending'
}

export interface UserUsage {
  requests: number;
  requestsLimit: number;
  dataTransferred: number;
  dataLimit: number;
  storageUsed: number;
  storageLimit: number;
  periodStart: string;
  periodEnd: string;
}

export interface UsageHistoryItem {
  date: Date;
  usage: number;
  unit: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}