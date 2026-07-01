export interface Tenant {
  id: string;
  company_name: string;
  email: string;
  industry: 'electricity_billing' | 'agriculture' | 'manufacturing' | 'smart_building' | 'other';
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  created_at: Date;
  device_token: string;
}
export interface PlatformUser {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: 'tenant_admin' | 'tenant_user';
  created_at: Date;
  last_login?: Date;
}

export interface TenantRegistrationRequest {
  company_name: string;
  email: string;
  password: string;
  industry: string;
}

export interface TenantRegistrationResponse {
  status: string;
  tenant_id: string;
  user_id: string;
  jwt_token: string;
  device_token: string;
  message: string;
}

export interface TenantLoginRequest {
  email: string;
  password: string;
}

export interface TenantLoginResponse {
  status: string;
  token: string;
  user_id: string;
  tenant_id: string;
  role: 'tenant_admin' | 'tenant_user';
  name: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

export interface DeviceTokenResponse {
  status: string;
  device_token: string;
  message: string;
}