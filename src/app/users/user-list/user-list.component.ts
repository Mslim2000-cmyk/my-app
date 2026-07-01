import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '@core/services';
import { User, UserRole, UserStatus } from '@core/models';
import { PageHeaderComponent, StatusBadgeComponent, ConfirmDialogComponent } from '@shared/components';
import { RelativeTimePipe } from '@shared/pipes';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDividerModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    RelativeTimePipe
  ],
  template: `
    <div class="user-list-container">
      <app-page-header
        title="Users Management"
        subtitle="Manage tenant users and their access">
        <button mat-raised-button color="primary" (click)="openAddUserDialog()">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </app-page-header>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search users</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Name, email..." #searchInput>
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Role</mat-label>
            <mat-select [(value)]="selectedRole" (selectionChange)="applyFilters()">
              <mat-option value="all">All Roles</mat-option>
              <mat-option value="tenant_admin">Tenant Admin</mat-option>
              <mat-option value="tenant_user">Tenant User</mat-option>
              <mat-option value="end_user">End User</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
              <mat-option value="all">All Statuses</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="disabled">Disabled</mat-option>
              <mat-option value="pending">Pending</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="refreshUsers()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <mat-card *ngIf="!loading" class="table-card">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="users-table">
            <!-- User Column -->
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="firstName">User</th>
              <td mat-cell *matCellDef="let user">
                <div class="user-cell">
                  <div class="user-avatar" [style.background]="getAvatarColor(user)">
                    {{ getInitials(user) }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-badge" [ngClass]="user.role">
                  {{ formatRole(user.role) }}
                </span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let user">
                <app-status-badge [status]="user.status"></app-status-badge>
              </td>
            </ng-container>

            <!-- Usage Column -->
            <ng-container matColumnDef="usage">
              <th mat-header-cell *matHeaderCellDef>Usage</th>
              <td mat-cell *matCellDef="let user">
                <div class="usage-cell" *ngIf="user.usage">
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="getUsagePercentage(user)"
                    [color]="getUsageColor(user)">
                  </mat-progress-bar>
                  <span class="usage-text">{{ user.usage.requestsUsed }} / {{ user.usage.requestsLimit }}</span>
                </div>
                <span *ngIf="!user.usage" class="no-usage">N/A</span>
              </td>
            </ng-container>

            <!-- Last Login Column -->
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Login</th>
              <td mat-cell *matCellDef="let user">
                <span *ngIf="user.lastLogin" class="last-login">
                  {{ user.lastLogin | relativeTime }}
                </span>
                <span *ngIf="!user.lastLogin" class="never-login">Never</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <mat-slide-toggle 
                  [checked]="user.status === 'active'"
                  (change)="toggleUserStatus(user, $event)"
                  matTooltip="Enable/Disable user"
                  class="status-toggle">
                </mat-slide-toggle>
                <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/users', user.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editUser(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="resetPassword(user)">
                    <mat-icon>lock_reset</mat-icon>
                    <span>Reset Password</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item class="delete-action" (click)="deleteUser(user)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                class="table-row"
                [routerLink]="['/users', row.id]"></tr>

            <!-- No Data Row -->
            <tr class="mat-row no-data-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                <div class="no-data">
                  <mat-icon>group_off</mat-icon>
                  <p>No users found</p>
                  <span>Try adjusting your search or filter criteria</span>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator 
          [pageSizeOptions]="[5, 10, 25, 50]"
          [pageSize]="10"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>

      <!-- Stats Summary -->
      <div *ngIf="!loading" class="stats-summary">
        <div class="stat-item">
          <span class="stat-value">{{ getTotalCount() }}</span>
          <span class="stat-label">Total Users</span>
        </div>
        <div class="stat-item active">
          <span class="stat-value">{{ getActiveCount() }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat-item disabled">
          <span class="stat-value">{{ getDisabledCount() }}</span>
          <span class="stat-label">Disabled</span>
        </div>
        <div class="stat-item admin">
          <span class="stat-value">{{ getAdminCount() }}</span>
          <span class="stat-label">Admins</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-list-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters-card {
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 12px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filter-field {
      width: 160px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
    }

    .table-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-email {
      font-size: 12px;
      color: #666;
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

    .usage-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 120px;
    }

    .usage-text {
      font-size: 11px;
      color: #666;
      text-align: right;
    }

    .no-usage {
      color: #999;
      font-style: italic;
    }

    .last-login {
      color: #666;
      font-size: 14px;
    }

    .never-login {
      color: #999;
      font-style: italic;
    }

    .status-toggle {
      margin-right: 8px;
    }

    .delete-action {
      color: #dc3545;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .no-data p {
      font-size: 18px;
      margin-bottom: 8px;
    }

    .stats-summary {
      display: flex;
      gap: 24px;
      margin-top: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 24px;
      border-right: 1px solid #dee2e6;
    }

    .stat-item:last-child {
      border-right: none;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stat-item.active .stat-value {
      color: #28a745;
    }

    .stat-item.disabled .stat-value {
      color: #dc3545;
    }

    .stat-item.admin .stat-value {
      color: #667eea;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .user-list-container {
        padding: 16px;
      }

      .filters-row {
        flex-direction: column;
      }

      .search-field,
      .filter-field {
        width: 100%;
      }

      .stats-summary {
        flex-wrap: wrap;
        justify-content: center;
      }

      .stat-item {
        border-right: none;
        padding: 12px 24px;
      }
    }
  `]
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  users: User[] = [];
  dataSource = new MatTableDataSource<User>();
  displayedColumns = ['user', 'role', 'status', 'usage', 'lastLogin', 'actions'];
  loading = true;
  selectedRole = 'all';
  selectedStatus = 'all';

  private avatarColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
    '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'
  ];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.firstName.toLowerCase().includes(searchStr) ||
             data.lastName.toLowerCase().includes(searchStr) ||
             data.email.toLowerCase().includes(searchStr);
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.dataSource.data = users;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        }
      });
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(u => u.status === this.selectedStatus);
    }

    this.dataSource.data = filtered;
  }

  getInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(user: User): string {
    const index = user.email.charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  formatRole(role: UserRole): string {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getUsagePercentage(user: User): number {
    if (!user.usage) return 0;
    return (user.usage.requests / user.usage.requestsLimit) * 100;
  }

  getUsageColor(user: User): string {
    const percentage = this.getUsagePercentage(user);
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  getTotalCount(): number {
    return this.users.length;
  }

  getActiveCount(): number {
    return this.users.filter(u => u.status === UserStatus.ACTIVE).length;
  }

  getDisabledCount(): number {
    return this.users.filter(u => u.status === UserStatus.DISABLED).length;
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === UserRole.TENANT_ADMIN).length;
  }

  toggleUserStatus(user: User, event: any): void {
    event.stopPropagation();
    
    const action = user.status === UserStatus.ACTIVE ? 'disable' : 'enable';
    const service$ = user.status === UserStatus.ACTIVE 
      ? this.userService.disableUser(user.id)
      : this.userService.enableUser(user.id);

    service$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        user.status = user.status === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
        this.snackBar.open(`User ${action}d successfully`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open(`Failed to ${action} user`, 'Close', { duration: 3000 });
      }
    });
  }

  openAddUserDialog(): void {
    this.snackBar.open('Add user dialog - implement with MatDialog', 'Close', { duration: 3000 });
  }

  editUser(user: User): void {
    this.snackBar.open(`Edit user: ${user.firstName} ${user.lastName}`, 'Close', { duration: 3000 });
  }

  resetPassword(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reset Password',
        message: `Send password reset email to ${user.email}?`,
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

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
              this.loadUsers();
            },
            error: () => {
              this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }
}
