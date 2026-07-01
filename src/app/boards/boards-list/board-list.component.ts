import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { BoardService } from '@core/services';
import { Board, BoardStatus } from '@core/models';
import { PageHeaderComponent, StatusBadgeComponent, ConfirmDialogComponent } from '@shared/components';
import { RelativeTimePipe } from '@shared/pipes';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
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
    MatTooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    RelativeTimePipe
  ],
  template: `
    <div class="board-list-container">
      <app-page-header
        title="Boards Management"
        subtitle="Manage your IoT devices and boards">
        <button mat-raised-button color="primary" (click)="openAddBoardDialog()">
          <mat-icon>add</mat-icon>
          Add Board
        </button>
      </app-page-header>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search boards</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Name, serial number..." #searchInput>
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="status-filter">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="selectedStatus" (selectionChange)="filterByStatus()">
              <mat-option value="all">All Statuses</mat-option>
              <mat-option value="online">Online</mat-option>
              <mat-option value="offline">Offline</mat-option>
              <mat-option value="maintenance">Maintenance</mat-option>
              <mat-option value="error">Error</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="refreshBoards()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading boards...</p>
      </div>

      <!-- Boards Table -->
      <mat-card *ngIf="!loading" class="table-card">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="boards-table">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let board">
                <div class="board-name-cell">
                  <mat-icon class="board-icon">developer_board</mat-icon>
                  <div class="board-info">
                    <span class="board-name">{{ board.name }}</span>
                    <span class="board-serial">{{ board.serialNumber }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let board">
                <app-status-badge [status]="board.status"></app-status-badge>
              </td>
            </ng-container>

            <!-- Firmware Column -->
            <ng-container matColumnDef="firmwareVersion">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Firmware</th>
              <td mat-cell *matCellDef="let board">
                <span class="firmware-badge">v{{ board.firmwareVersion }}</span>
              </td>
            </ng-container>

            <!-- Last Seen Column -->
            <ng-container matColumnDef="lastSeen">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Seen</th>
              <td mat-cell *matCellDef="let board">
                <span *ngIf="board.lastSeen" class="last-seen">
                  {{ board.lastSeen | relativeTime }}
                </span>
                <span *ngIf="!board.lastSeen" class="never-seen">Never</span>
              </td>
            </ng-container>

            <!-- Users Column -->
            <ng-container matColumnDef="users">
              <th mat-header-cell *matHeaderCellDef>Users</th>
              <td mat-cell *matCellDef="let board">
                <div class="users-cell">
                  <mat-icon>people</mat-icon>
                  <span>{{ board.assignedUsers?.length || 0 }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let board">
                <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/boards', board.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editBoard(board)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="sendCommand(board)">
                    <mat-icon>terminal</mat-icon>
                    <span>Send Command</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item class="delete-action" (click)="deleteBoard(board)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                class="table-row" 
                [routerLink]="['/boards', row.id]"></tr>

            <!-- No Data Row -->
            <tr class="mat-row no-data-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                <div class="no-data">
                  <mat-icon>inbox</mat-icon>
                  <p>No boards found</p>
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
          <span class="stat-label">Total Boards</span>
        </div>
        <div class="stat-item online">
          <span class="stat-value">{{ getOnlineCount() }}</span>
          <span class="stat-label">Online</span>
        </div>
        <div class="stat-item offline">
          <span class="stat-value">{{ getOfflineCount() }}</span>
          <span class="stat-label">Offline</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-list-container {
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

    .status-filter {
      width: 180px;
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

    .boards-table {
      width: 100%;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .board-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .board-icon {
      color: #667eea;
      background: #eef0ff;
      padding: 8px;
      border-radius: 8px;
    }

    .board-info {
      display: flex;
      flex-direction: column;
    }

    .board-name {
      font-weight: 500;
      color: #333;
    }

    .board-serial {
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }

    .firmware-badge {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    .last-seen {
      color: #666;
      font-size: 14px;
    }

    .never-seen {
      color: #999;
      font-style: italic;
    }

    .users-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
    }

    .users-cell mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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

    .stat-item.online .stat-value {
      color: #28a745;
    }

    .stat-item.offline .stat-value {
      color: #dc3545;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .board-list-container {
        padding: 16px;
      }

      .filters-row {
        flex-direction: column;
      }

      .search-field,
      .status-filter {
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
export class BoardListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  boards: Board[] = [];
  dataSource = new MatTableDataSource<Board>();
  displayedColumns = ['name', 'status', 'firmwareVersion', 'lastSeen', 'users', 'actions'];
  loading = true;
  selectedStatus = 'all';

  constructor(
    private boardService: BoardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBoards(): void {
    this.loading = true;
    this.boardService.getBoards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boards) => {
          this.boards = boards;
          this.dataSource.data = boards;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load boards', 'Close', { duration: 3000 });
        }
      });
  }

  refreshBoards(): void {
    this.loadBoards();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(): void {
    if (this.selectedStatus === 'all') {
      this.dataSource.data = this.boards;
    } else {
      this.dataSource.data = this.boards.filter(b => b.status === this.selectedStatus);
    }
  }

  getTotalCount(): number {
    return this.boards.length;
  }

  getOnlineCount(): number {
    return this.boards.filter(b => b.status === BoardStatus.ONLINE).length;
  }

  getOfflineCount(): number {
    return this.boards.filter(b => b.status === BoardStatus.OFFLINE).length;
  }

  openAddBoardDialog(): void {
    this.snackBar.open('Add board dialog - implement with MatDialog', 'Close', { duration: 3000 });
  }

  editBoard(board: Board): void {
    this.snackBar.open(`Edit board: ${board.name}`, 'Close', { duration: 3000 });
  }

  sendCommand(board: Board): void {
    this.snackBar.open(`Send command to: ${board.name}`, 'Close', { duration: 3000 });
  }

  deleteBoard(board: Board): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Board',
        message: `Are you sure you want to delete "${board.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.deleteBoard(board.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Board deleted successfully', 'Close', { duration: 3000 });
              this.loadBoards();
            },
            error: () => {
              this.snackBar.open('Failed to delete board', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }
}
