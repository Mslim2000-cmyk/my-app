// Development environment configuration
export const environment = {
  production: false,
  mockApi: true,
  apiUrl: 'http://localhost:8081',
  
  // API Endpoints
  endpoints: {
    // Auth
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    
    // Boards
    boards: '/api/boards',
    
    // Users
    users: '/api/users',
    
    // Config
    config: '/api/config',
    
    // Billing
    billingCalculate: '/api/billing/calculate',
    
    // Device Token
    deviceTokenRegenerate: '/api/tenant/device-token/regenerate'
  },
  
  // JWT Token Key
  tokenKey: 'iot_jwt_token',
  userKey: 'iot_current_user'
};