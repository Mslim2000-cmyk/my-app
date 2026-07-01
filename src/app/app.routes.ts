import { Title } from '@angular/platform-browser';
import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from '@core/guards';

export const routes: Routes = [

    {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    title: 'Dashboard - IoT Protocol Engine'
  },
  {
    path: 'boards',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./boards/boards-list/board-list.component').then(m => m.BoardListComponent),
        title: 'Boards - IoT Protocol Engine'
      },
      {
        path: ':id',
        loadComponent: () => import('./boards/boards-details/board-details.component').then(m => m.BoardDetailsComponent),
        title: 'Board Details - IoT Protocol Engine'
      }
    ]
  },
  {
    path: 'users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant_admin'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent),
        title: 'Users - IoT Protocol Engine'
      },
      {
        path: ':id',
        loadComponent: () => import('./users/user-details/user-details.component').then(m => m.UserDetailsComponent),
        title: 'User Details - IoT Protocol Engine'
      }
    ]
  },
  {
    path: 'configuration',
    loadComponent: () => import('./configuration/configuration.component').then(m => m.ConfigurationComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant_admin'] },
    title: 'Configuration - IoT Protocol Engine'
  },
  {
    path: 'billing',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant_admin'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent),
        title: 'Billing - IoT Protocol Engine'
      },
      {
        path: 'history',
        loadComponent: () => import('./billing/bill-history/bill-history.component').then(m => m.BillHistoryComponent),
        title: 'Bill History - IoT Protocol Engine'
      },
      {
        path: ':id',
        loadComponent: () => import('./billing/bill-details/bill-details.component').then(m => m.BillDetailsComponent),
        title: 'Bill Details - IoT Protocol Engine'
      }
    ]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard],
    title: 'Settings - IoT Protocol Engine'
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - Page Not Found'
  }
];