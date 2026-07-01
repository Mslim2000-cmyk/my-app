import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@core/services';
import { User, UserRole } from '@core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  badge?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <!-- Show full layout only when authenticated -->
    <ng-container *ngIf="isAuthenticated; else authLayout">
      <mat-sidenav-container class="app-container">
        <!-- Sidebar -->
        <mat-sidenav #sidenav 
                     [mode]="sidenavMode" 
                     [opened]="sidenavOpened"
                     class="app-sidenav">
          <!-- Logo -->
          <div class="sidenav-header">
            <div class="logo">
              <mat-icon class="logo-icon">developer_board</mat-icon>
              <span class="logo-text">IoT Engine</span>
            </div>
          </div>

          <!-- Navigation -->
          <mat-nav-list class="nav-list">
            <ng-container *ngFor="let item of filteredNavItems">
              <a mat-list-item 
                 [routerLink]="item.route" 
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                 class="nav-item">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle>{{ item.label }}</span>
                <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
              </a>
            </ng-container>
          </mat-nav-list>

          <!-- Bottom section -->
          <div class="sidenav-footer">
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/settings" routerLinkActive="active" class="nav-item">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Settings</span>
            </a>
          </div>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content class="app-content">
          <!-- Header -->
          <mat-toolbar class="app-header">
            <button mat-icon-button (click)="sidenav.toggle()" class="menu-toggle">
              <mat-icon>menu</mat-icon>
            </button>

            <span class="page-title">{{ pageTitle }}</span>

            <span class="toolbar-spacer"></span>

            <!-- Notifications -->
            <button mat-icon-button matTooltip="Notifications" [matMenuTriggerFor]="notificationMenu">
              <mat-icon [matBadge]="notificationCount" 
                       [matBadgeHidden]="notificationCount === 0"
                       matBadgeColor="warn"
                       matBadgeSize="small">
                notifications
              </mat-icon>
            </button>
            <mat-menu #notificationMenu="matMenu" class="notification-menu">
              <div class="notification-header">
                <span>Notifications</span>
                <button mat-button color="primary" *ngIf="notificationCount > 0">Mark all read</button>
              </div>
              <mat-divider></mat-divider>
              <div class="notification-empty" *ngIf="notificationCount === 0">
                <mat-icon>notifications_none</mat-icon>
                <span>No new notifications</span>
              </div>
              <button mat-menu-item *ngFor="let notification of notifications">
                <mat-icon [class]="notification.type">{{ notification.icon }}</mat-icon>
                <span>{{ notification.message }}</span>
              </button>
            </mat-menu>

            <!-- User menu -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
              <div class="user-avatar">
                {{ userInitials }}
              </div>
              <span class="user-name hide-xs">{{ currentUser?.firstName }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="user-menu-header">
                <div class="user-avatar large">{{ userInitials }}</div>
                <div class="user-info">
                  <strong>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</strong>
                  <span>{{ currentUser?.email }}</span>
                  <span class="role-badge">{{ currentUser?.role | titlecase }}</span>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </mat-toolbar>

          <!-- Page content -->
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <!-- Auth layout (no sidebar) -->
    <ng-template #authLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }

    .app-sidenav {
      width: 260px;
      background: linear-gradient(180deg, #1a237e 0%, #283593 100%);
      border: none;
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #7c4dff;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .nav-list {
      flex: 1;
      padding: 16px 12px;
    }

    .nav-item {
      border-radius: 8px !important;
      margin-bottom: 4px;
      color: rgba(255,255,255,0.7) !important;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255,255,255,0.1) !important;
        color: white !important;
      }

      &.active {
        background: rgba(124, 77, 255, 0.3) !important;
        color: white !important;

        mat-icon {
          color: #b388ff;
        }
      }

      mat-icon {
        color: rgba(255,255,255,0.7);
        margin-right: 16px;
      }
    }

    .nav-badge {
      background: #ff5252;
      color: white;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: auto;
    }

    .sidenav-footer {
      padding: 12px;
      
      mat-divider {
        background-color: rgba(255,255,255,0.1);
        margin-bottom: 12px;
      }
    }

    .app-content {
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .app-header {
      background: white;
      color: #333;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .menu-toggle {
      margin-right: 16px;
    }

    .page-title {
      font-size: 1.1rem;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 24px;
      margin-left: 8px;

      &:hover {
        background: #f5f5f5;
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;

      &.large {
        width: 48px;
        height: 48px;
        font-size: 18px;
      }
    }

    .user-name {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      min-width: 250px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        font-size: 14px;
      }

      span {
        font-size: 12px;
        color: #666;
      }
    }

    .role-badge {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px !important;
      margin-top: 4px;
      width: fit-content;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      font-weight: 500;
    }

    .notification-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      color: #999;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
      }
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    @media (max-width: 768px) {
      .app-sidenav {
        width: 100%;
        max-width: 280px;
      }

      .main-content {
        padding: 16px;
      }

      .hide-xs {
        display: none !important;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isAuthenticated = false;
  currentUser: User | null = null;
  pageTitle = 'Dashboard';
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  notificationCount = 2;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Boards', icon: 'developer_board', route: '/boards' },
    { label: 'Users', icon: 'people', route: '/users', roles: [UserRole.TENANT_ADMIN] },
    { label: 'Configuration', icon: 'tune', route: '/configuration', roles: [UserRole.TENANT_ADMIN] },
    { label: 'Billing', icon: 'receipt_long', route: '/billing', roles: [UserRole.TENANT_ADMIN] }
  ];

  notifications = [
    { type: 'warning', icon: 'warning', message: 'Board ESP32-001 went offline' },
    { type: 'info', icon: 'info', message: 'New firmware update available' }
  ];

  get filteredNavItems(): NavItem[] {
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => this.authService.hasRole(role));
    });
  }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        this.updateResponsiveLayout();
      });

    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Update page title based on route
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(event=> {
        this.updatePageTitle(event.urlAfterRedirects);
        console.log(event.urlAfterRedirects);
      });

    // Handle responsive layout
    this.updateResponsiveLayout();
    window.addEventListener('resize', () => this.updateResponsiveLayout());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle(url: string): void {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/boards': 'Boards',
      '/users': 'Users',
      '/configuration': 'Configuration',
      '/billing': 'Billing',
      '/settings': 'Settings'
    };

    for (const [path, title] of Object.entries(titles)) {
      if (url.startsWith(path)) {
        this.pageTitle = title;
        return;
      }
    }
    this.pageTitle = 'IoT Protocol Engine';
  }

  private updateResponsiveLayout(): void {
    const isMobile = window.innerWidth < 768;
    this.sidenavMode = isMobile ? 'over' : 'side';
    this.sidenavOpened = !isMobile && this.isAuthenticated;
  }

  logout(): void {
    this.authService.logout();
  }
}