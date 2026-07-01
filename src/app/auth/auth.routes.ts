import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Sign In - IoT Protocol Engine'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Create Account - IoT Protocol Engine'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Forgot Password - IoT Protocol Engine'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Reset Password - IoT Protocol Engine'
  }
];