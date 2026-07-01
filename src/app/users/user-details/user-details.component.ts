import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil, switchMap, catchError, of, forkJoin } from 'rxjs';
import { UsageHistoryItem } from '@core/models';

import { UserService, BoardService } from '@core/services';
import { User, UserRole, UserStatus, UserUsage, Board } from '@core/models';
import { PageHeaderComponent, StatusBadgeComponent, ConfirmDialogComponent } from '@shared/components';
import { RelativeTimePipe } from '@shared/pipes';


@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    RelativeTimePipe
  ],
  template: `
    <div class="user-details-container">
      <app-page-header
        [title]="user ? user.firstName + ' ' + user.lastName : 'User Details'"
        [subtitle]="user?.email || ''"
        [showBack]="true">
        <mat-slide-toggle 
          *ngIf="user"
          [checked]="user.status === 'active'"
          (change)="toggleUserStatus()"
          class="status-toggle">
          {{ user.status === 'active' ? 'Active' : 'Disabled' }}
        </mat-slide-toggle>
        <button mat-stroked-button color="primary" (click)="editUser()" *ngIf="user">
          <mat-icon>edit</mat-icon>
          Edit
        </button>
      </app-page-header>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading user details...</p>
      </div>

      <!-- User Not Found -->
      <mat-card *ngIf="!loading && !user" class="not-found-card">
        <mat-card-content>
          <div class="not-found">
            <mat-icon>person_off</mat-icon>
            <h2>User Not Found</h2>
            <p>The requested user could not be found.</p>
            <button mat-raised-button color="primary" routerLink="/users">
              Back to Users
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- User Content -->
      <div *ngIf="!loading && user" class="user-content">
        <!-- User Info Card -->
        <mat-card class="info-card">
          <mat-card-content>
            <div class="user-header">
              <div class="user-avatar" [style.background]="avatarColor">
                {{ getInitials() }}
              </div>
              <div class="user-main-info">
                <h2>{{ user.firstName }} {{ user.lastName }}</h2>
                <span class="user-email">{{ user.email }}</span>
                <div class="user-badges">
                  <span class="role-badge" [ngClass]="user.role">
                    {{ formatRole(user.role) }}
                  </span>
                  <app-status-badge [status]="user.status"></app-status-badge>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="info-grid">
              <div class="info-item">
                <mat-icon>business</mat-icon>
                <div class="info-content">
                  <span class="info-label">Company</span>
                  <span class="info-value">{{ user.companyName || 'Not specified' }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>login</mat-icon>
                <div class="info-content">
                  <span class="info-label">Last Login</span>
                  <span class="info-value">{{ user.lastLoginAt ? (user.lastLoginAt | relativeTime) : 'Never' }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>event</mat-icon>
                <div class="info-content">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ user.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>update</mat-icon>
                <div class="info-content">
                  <span class="info-label">Updated</span>
                  <span class="info-value">{{ user.updatedAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Usage Card -->
        <mat-card class="usage-card" *ngIf="user.usage">
          <mat-card-header>
            <mat-icon mat-card-avatar class="usage-icon">analytics</mat-icon>
            <mat-card-title>Usage Statistics</mat-card-title>
            <mat-card-subtitle>Current billing period</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="usage-metrics">
              <div class="metric">
                <div class="metric-header">
                  <span class="metric-label">API Requests</span>
                  <span class="metric-value">{{ user.usage.requests }} / {{ user.usage.requestsLimit }}</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="getRequestsPercentage()"
                  [color]="getUsageColor(getRequestsPercentage())">
                </mat-progress-bar>
                <span class="metric-percentage">{{ getRequestsPercentage().toFixed(1) }}% used</span>
              </div>

              <div class="metric">
                <div class="metric-header">
                  <span class="metric-label">Data Transferred</span>
                  <span class="metric-value">{{ formatDataSize(user.usage.dataTransferred) }} / {{ formatDataSize(user.usage.dataLimit) }}</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="getDataPercentage()"
                  [color]="getUsageColor(getDataPercentage())">
                </mat-progress-bar>
                <span class="metric-percentage">{{ getDataPercentage().toFixed(1) }}% used</span>
              </div>

              <div class="metric">
                <div class="metric-header">
                  <span class="metric-label">Storage Used</span>
                  <span class="metric-value">{{ formatDataSize(user.usage.storageUsed) }} / {{ formatDataSize(user.usage.storageLimit) }}</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="getStoragePercentage()"
                  [color]="getUsageColor(getStoragePercentage())">
                </mat-progress-bar>
                <span class="metric-percentage">{{ getStoragePercentage().toFixed(1) }}% used</span>
              </div>
            </div>

            <div class="period-info">
              <mat-icon>date_range</mat-icon>
              <span>Period: {{ user.usage.periodStart | date:'mediumDate' }} - {{ user.usage.periodEnd | date:'mediumDate' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabs Section -->
        <mat-card class="tabs-card">
          <mat-tab-group animationDuration="200ms">
            <!-- Assigned Boards Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>developer_board</mat-icon>
                <span>Boards ({{ assignedBoards.length }})</span>
              </ng-template>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Assigned Boards</h3>
                </div>

                <div *ngIf="assignedBoards.length === 0" class="empty-state">
                  <mat-icon>developer_board</mat-icon>
                  <p>No boards assigned to this user</p>
                </div>

                <mat-list *ngIf="assignedBoards.length > 0" class="boards-list">
                  <mat-list-item *ngFor="let board of assignedBoards" class="board-item" [routerLink]="['/boards', board.id]">
                    <mat-icon matListItemIcon>developer_board</mat-icon>
                    <div matListItemTitle>{{ board.name }}</div>
                    <div matListItemLine>{{ board.serialNumber }}</div>
                    <app-status-badge matListItemMeta [status]="board.status"></app-status-badge>
                  </mat-list-item>
                </mat-list>
              </div>
            </mat-tab>

            <!-- Usage History Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>history</mat-icon>
                <span>Usage History</span>
              </ng-template>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Usage History (Last 30 Days)</h3>
                </div>

                <div class="usage-history">
                  <table mat-table [dataSource]="usageHistory" class="history-table">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let item">{{ item.date | date:'mediumDate' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="requests">
                      <th mat-header-cell *matHeaderCellDef>Requests</th>
                      <td mat-cell *matCellDef="let item">{{ item.requests | number }}</td>
                    </ng-container>

                    <ng-container matColumnDef="dataTransferred">
                      <th mat-header-cell *matHeaderCellDef>Data Transferred</th>
                      <td mat-cell *matCellDef="let item">{{ formatDataSize(item.dataTransferred) }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>
                  </table>
                </div>
              </div>
            </mat-tab>

            <!-- Activity Log Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>receipt_long</mat-icon>
                <span>Activity Log</span>
              </ng-template>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Recent Activity</h3>
                </div>

                <div class="activity-log">
                  <div *ngFor="let activity of activityLog" class="activity-item">
                    <div class="activity-icon" [ngClass]="activity.type">
                      <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                    </div>
                    <div class="activity-content">
                      <span class="activity-description">{{ activity.description }}</span>
                      <span class="activity-time">{{ activity.timestamp | relativeTime }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-stroked-button (click)="resetPassword()">
                <mat-icon>lock_reset</mat-icon>
                Reset Password
              </button>
              <button mat-stroked-button (click)="resendVerification()" *ngIf="user.status === 'pending'">
                <mat-icon>email</mat-icon>
                Resend Verification
              </button>
              <button mat-stroked-button color="warn" (click)="deleteUser()">
                <mat-icon>delete</mat-icon>
                Delete User
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .user-details-container {
      padding: 24px;
      max-width: 1200px;
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
    }

    .not-found-card {
      margin-top: 24px;
    }

    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;
    }

    .not-found mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
      margin-bottom: 16px;
    }

    .not-found h2 {
      margin-bottom: 8px;
      color: #333;
    }

    .not-found p {
      color: #666;
      margin-bottom: 24px;
    }

    .status-toggle {
      margin-right: 16px;
    }

    .user-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-card {
      border-radius: 12px;
    }

    .user-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 28px;
    }

    .user-main-info h2 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .user-email {
      color: #666;
      display: block;
      margin-bottom: 12px;
    }

    .user-badges {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .role-badge.tenant_admin {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .role-badge.tenant_user {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.end_user {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    mat-divider {
      margin: 24px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .info-item mat-icon {
      color: #667eea;
      margin-top: 2px;
    }

    .info-content {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }

    .usage-card {
      border-radius: 12px;
    }

    .usage-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 48px !important;
      height: 48px !important;
      font-size: 24px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px !important;
    }

    .usage-metrics {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 16px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-weight: 500;
      color: #333;
    }

    .metric-value {
      font-size: 14px;
      color: #666;
    }

    .metric-percentage {
      font-size: 12px;
      color: #999;
      text-align: right;
    }

    .period-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
      font-size: 14px;
    }

    .tabs-card {
      border-radius: 12px;
    }

    .tab-content {
      padding: 24px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .tab-header h3 {
      margin: 0;
      color: #333;
    }

    mat-tab-group ::ng-deep .mat-mdc-tab {
      min-width: 120px;
    }

    mat-tab-group ::ng-deep .mat-mdc-tab mat-icon {
      margin-right: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .boards-list {
      background: #f8f9fa;
      border-radius: 8px;
    }

    .board-item {
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }

    .board-item:last-child {
      border-bottom: none;
    }

    .board-item:hover {
      background: #e9ecef;
    }

    .history-table {
      width: 100%;
    }

    .activity-log {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .activity-icon.login {
      background: #28a745;
    }

    .activity-icon.logout {
      background: #6c757d;
    }

    .activity-icon.api {
      background: #667eea;
    }

    .activity-icon.update {
      background: #ffc107;
    }

    .activity-icon.error {
      background: #dc3545;
    }

    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .activity-description {
      font-weight: 500;
      color: #333;
    }

    .activity-time {
      font-size: 12px;
      color: #666;
    }

    .actions-card {
      border-radius: 12px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .user-details-container {
        padding: 16px;
      }

      .user-header {
        flex-direction: column;
        text-align: center;
      }

      .user-badges {
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  userId: string = '';
  user: User | null = null;
  assignedBoards: Board[] = [];
  usageHistory: UsageHistoryItem[] = [];
  activityLog: any[] = [];
  loading = true;
  avatarColor = '#667eea';
  historyColumns = ['date', 'requests', 'dataTransferred'];

  private avatarColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
    '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private boardService: BoardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
      switchMap(params => {
        this.userId = params['id'];
        return this.loadUserData();
      })
    )
        .subscribe({
      next: ({ user, boards, usageHistory }) => {
        this.user = user;
        if (user) {
          this.avatarColor = this.avatarColors[user.email.charCodeAt(0) % this.avatarColors.length];
          // Filter boards assigned to this user
          this.assignedBoards = boards.filter(b => 
            b.assignedUsers?.some((u: User) => u.id === this.userId)
          );
        }
        this.usageHistory = usageHistory;
        this.generateMockActivityLog();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
    }
  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData() {
    this.loading = true;
    
    return forkJoin({
      user: this.userService.getUserById(this.userId).pipe(catchError(() => of(null))),
      boards: this.boardService.getBoards().pipe(catchError(() => of([]))),
      usageHistory: this.userService.getUserUsageHistory(this.userId).pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$)
    );
  }

  

  private generateMockActivityLog(): void {
    // Mock activity log - in real app, this would come from API
    this.activityLog = [
      { type: 'login', description: 'User logged in from Chrome on Windows', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { type: 'api', description: 'API request to /api/boards', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { type: 'update', description: 'Profile updated', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { type: 'api', description: 'API request to /api/config', timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000) },
      { type: 'login', description: 'User logged in from Safari on macOS', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    ];
  }

  getInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  formatRole(role: UserRole): string {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getRequestsPercentage(): number {
    if (!this.user?.usage) return 0;
    return (this.user.usage.requests / this.user.usage.requestsLimit) * 100;
  }

  getDataPercentage(): number {
    if (!this.user?.usage) return 0;
    return (this.user.usage.dataTransferred / this.user.usage.dataLimit) * 100;
  }

  getStoragePercentage(): number {
    if (!this.user?.usage) return 0;
    return (this.user.usage.storageUsed / this.user.usage.storageLimit) * 100;
  }

  getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  formatDataSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'login': return 'login';
      case 'logout': return 'logout';
      case 'api': return 'api';
      case 'update': return 'edit';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  toggleUserStatus(): void {
    if (!this.user) return;
    
    const action = this.user.status === UserStatus.ACTIVE ? 'disable' : 'enable';
    const service$ = this.user.status === UserStatus.ACTIVE 
      ? this.userService.disableUser(this.user.id)
      : this.userService.enableUser(this.user.id);

    service$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (this.user) {
          this.user.status = this.user.status === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
        }
        this.snackBar.open(`User ${action}d successfully`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open(`Failed to ${action} user`, 'Close', { duration: 3000 });
      }
    });
  }

  editUser(): void {
    this.snackBar.open('Edit user functionality', 'Close', { duration: 3000 });
  }

  resetPassword(): void {
    if (!this.user) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reset Password',
        message: `Send password reset email to ${this.user.email}?`,
        confirmText: 'Send',
        confirmColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password reset email sent', 'Close', { duration: 3000 });
      }
    });
  }

  resendVerification(): void {
    this.snackBar.open('Verification email sent', 'Close', { duration: 3000 });
  }

  deleteUser(): void {
    if (!this.user) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete "${this.user.firstName} ${this.user.lastName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/users']);
            },
            error: () => {
              this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }
}
