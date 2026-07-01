import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';

import { BoardService, UserService, ConfigService } from '@core/services';
import { Board, BoardStatus, User, Alert, AlertSeverity } from '@core/models';
import { StatsCardComponent, StatusBadgeComponent, PageHeaderComponent } from '@shared/components';
import { RelativeTimePipe } from '@shared/pipes';
import { MatDividerModule } from '@angular/material/divider';

interface DashboardStats {
  totalBoards: number;
  onlineBoards: number;
  offlineBoards: number;
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    StatsCardComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
    RelativeTimePipe
  ],
  template: `
    <div class="dashboard-container">
      <app-page-header
        title="Dashboard"
        subtitle="Welcome to your IoT Protocol Engine control center">
      </app-page-header>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Stats Grid -->
      <div *ngIf="!loading" class="stats-grid">
        <app-stats-card
          icon="developer_board"
          [value]="stats.totalBoards"
          label="Total Boards"
          subtitle="Registered devices"
          color="primary">
        </app-stats-card>

        <app-stats-card
          icon="wifi"
          [value]="stats.onlineBoards"
          label="Online"
          [subtitle]="getOnlinePercentage() + '% of total'"
          color="success">
        </app-stats-card>

        <app-stats-card
          icon="wifi_off"
          [value]="stats.offlineBoards"
          label="Offline"
          [subtitle]="getOfflinePercentage() + '% of total'"
          color="danger">
        </app-stats-card>

        <app-stats-card
          icon="people"
          [value]="stats.totalUsers"
          label="Total Users"
          subtitle="Registered accounts"
          color="info">
        </app-stats-card>

        <app-stats-card
          icon="person_check"
          [value]="stats.activeUsers"
          label="Active Users"
          [subtitle]="getActivePercentage() + '% of total'"
          color="success">
        </app-stats-card>

        <app-stats-card
          icon="person_off"
          [value]="stats.disabledUsers"
          label="Disabled Users"
          [subtitle]="getDisabledPercentage() + '% of total'"
          color="warning">
        </app-stats-card>
      </div>

      <!-- Recent Activity Section -->
      <div *ngIf="!loading" class="activity-section">
        <!-- Recent Boards -->
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">developer_board</mat-icon>
            <mat-card-title>Recent Boards</mat-card-title>
            <mat-card-subtitle>Latest registered devices</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentBoards.length === 0" class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>No boards registered yet</p>
            </div>
            <div *ngIf="recentBoards.length > 0" class="activity-list">
              <div *ngFor="let board of recentBoards" class="activity-item" [routerLink]="['/boards', board.id]">
                <div class="activity-info">
                  <span class="activity-name">{{ board.name }}</span>
                  <span class="activity-detail">{{ board.serialNumber }}</span>
                </div>
                <app-status-badge [status]="board.status"></app-status-badge>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/boards">
              View All Boards
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Recent Alerts -->
        <mat-card class="activity-card alerts-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon alert-icon">notifications_active</mat-icon>
            <mat-card-title>Recent Alerts</mat-card-title>
            <mat-card-subtitle>System notifications</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentAlerts.length === 0" class="empty-state">
              <mat-icon>check_circle</mat-icon>
              <p>No recent alerts</p>
            </div>
            <div *ngIf="recentAlerts.length > 0" class="alert-list">
              <div *ngFor="let alert of recentAlerts" 
                   class="alert-item"
                   [class.critical]="alert.severity === 'critical'"
                   [class.warning]="alert.severity === 'warning'"
                   [class.info]="alert.severity === 'info'">
                <div class="alert-icon-wrapper" [ngClass]="alert.severity">
                  <mat-icon>{{ getAlertIcon(alert.severity) }}</mat-icon>
                </div>
                <div class="alert-content">
                  <span class="alert-message">{{ alert.message }}</span>
                  <span class="alert-time">{{ alert.createdAt | relativeTime }}</span>
                </div>
                <button mat-icon-button 
                        *ngIf="!alert.acknowledged"
                        matTooltip="Acknowledge"
                        (click)="acknowledgeAlert(alert.id)">
                  <mat-icon>check</mat-icon>
                </button>
                <mat-icon *ngIf="alert.acknowledged" class="acknowledged-icon" matTooltip="Acknowledged">
                  done_all
                </mat-icon>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/configuration">
              Manage Alerts
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="activity-card quick-actions-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">flash_on</mat-icon>
            <mat-card-title>Quick Actions</mat-card-title>
            <mat-card-subtitle>Common tasks</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions-grid">
              <button mat-stroked-button color="primary" routerLink="/boards" class="quick-action-btn">
                <mat-icon>add_circle</mat-icon>
                <span>Add Board</span>
              </button>
              <button mat-stroked-button color="primary" routerLink="/users" class="quick-action-btn">
                <mat-icon>person_add</mat-icon>
                <span>Add User</span>
              </button>
              <button mat-stroked-button color="primary" routerLink="/configuration" class="quick-action-btn">
                <mat-icon>settings</mat-icon>
                <span>Configuration</span>
              </button>
              <button mat-stroked-button color="primary" routerLink="/billing" class="quick-action-btn">
                <mat-icon>receipt_long</mat-icon>
                <span>Generate Bill</span>
              </button>
              <button mat-stroked-button color="primary" routerLink="/settings/device-token" class="quick-action-btn">
                <mat-icon>key</mat-icon>
                <span>Device Token</span>
              </button>
              <button mat-stroked-button color="primary" routerLink="/settings/profile" class="quick-action-btn">
                <mat-icon>account_circle</mat-icon>
                <span>Profile</span>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 14px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .activity-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .activity-card {
      border-radius: 12px;
    }

    .activity-card mat-card-header {
      margin-bottom: 16px;
    }

    .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px !important;
      height: 48px !important;
      font-size: 24px !important;
    }

    .alert-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background: #e9ecef;
      transform: translateX(4px);
    }

    .activity-info {
      display: flex;
      flex-direction: column;
    }

    .activity-name {
      font-weight: 500;
      color: #333;
    }

    .activity-detail {
      font-size: 12px;
      color: #666;
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .alert-item.critical {
      background: #fff5f5;
      border-left: 3px solid #dc3545;
    }

    .alert-item.warning {
      background: #fffbeb;
      border-left: 3px solid #ffc107;
    }

    .alert-item.info {
      background: #f0f9ff;
      border-left: 3px solid #17a2b8;
    }

    .alert-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-icon-wrapper.critical {
      background: #dc3545;
      color: white;
    }

    .alert-icon-wrapper.warning {
      background: #ffc107;
      color: #333;
    }

    .alert-icon-wrapper.info {
      background: #17a2b8;
      color: white;
    }

    .alert-icon-wrapper mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .alert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .alert-message {
      font-weight: 500;
      font-size: 14px;
    }

    .alert-time {
      font-size: 12px;
      color: #666;
    }

    .acknowledged-icon {
      color: #28a745;
    }

    .quick-actions-card {
      grid-column: span 1;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      height: auto;
      gap: 8px;
    }

    .quick-action-btn mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .quick-action-btn span {
      font-size: 12px;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
    }

    mat-card-actions button mat-icon {
      margin-left: 4px;
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .activity-section {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  stats: DashboardStats = {
    totalBoards: 0,
    onlineBoards: 0,
    offlineBoards: 0,
    totalUsers: 0,
    activeUsers: 0,
    disabledUsers: 0
  };
  
  recentBoards: Board[] = [];
  recentAlerts: Alert[] = [];

  constructor(
    private boardService: BoardService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      boards: this.boardService.getBoards().pipe(catchError(() => of([]))),
      users: this.userService.getUsers().pipe(catchError(() => of([]))),
      alerts: this.configService.getRecentAlerts().pipe(catchError(() => of([])))
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ boards, users, alerts }) => {
        // Calculate board stats
        this.stats.totalBoards = boards.length;
        this.stats.onlineBoards = boards.filter(b => b.status === BoardStatus.ONLINE).length;
        this.stats.offlineBoards = boards.filter(b => b.status === BoardStatus.OFFLINE).length;

        // Calculate user stats
        this.stats.totalUsers = users.length;
        this.stats.activeUsers = users.filter(u => u.status === 'active').length;
        this.stats.disabledUsers = users.filter(u => u.status === 'disabled').length;

        // Recent boards (last 5)
        this.recentBoards = boards
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Recent alerts (last 5)
        this.recentAlerts = alerts.slice(0, 5);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getOnlinePercentage(): string {
    if (this.stats.totalBoards === 0) return '0';
    return ((this.stats.onlineBoards / this.stats.totalBoards) * 100).toFixed(0);
  }

  getOfflinePercentage(): string {
    if (this.stats.totalBoards === 0) return '0';
    return ((this.stats.offlineBoards / this.stats.totalBoards) * 100).toFixed(0);
  }

  getActivePercentage(): string {
    if (this.stats.totalUsers === 0) return '0';
    return ((this.stats.activeUsers / this.stats.totalUsers) * 100).toFixed(0);
  }

  getDisabledPercentage(): string {
    if (this.stats.totalUsers === 0) return '0';
    return ((this.stats.disabledUsers / this.stats.totalUsers) * 100).toFixed(0);
  }

  getAlertIcon(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'error';
      case AlertSeverity.WARNING: return 'warning';
      case AlertSeverity.INFO: return 'info';
      default: return 'notifications';
    }
  }

  acknowledgeAlert(alertId: string): void {
    this.configService.acknowledgeAlert(alertId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const alert = this.recentAlerts.find(a => a.id === alertId);
          if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date();
          }
        }
      });
  }
}
