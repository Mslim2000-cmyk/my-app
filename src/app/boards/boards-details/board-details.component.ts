import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, switchMap, catchError, of, forkJoin } from 'rxjs';

import { BoardService, UserService } from '@core/services';
import { Board, BoardUser, CommandHistory, CommandStatus, User } from '@core/models';
import { PageHeaderComponent, StatusBadgeComponent, ConfirmDialogComponent } from '@shared/components';
import { RelativeTimePipe } from '@shared/pipes';

@Component({
  selector: 'app-board-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    RelativeTimePipe
  ],
  template: `
    <div class="board-details-container">
      <app-page-header
        [title]="board?.name || 'Board Details'"
        [subtitle]="board?.serialNumber || ''"
        [showBack]="true">
        <button mat-stroked-button color="primary" (click)="editBoard()" *ngIf="board">
          <mat-icon>edit</mat-icon>
          Edit
        </button>
      </app-page-header>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading board details...</p>
      </div>

      <!-- Board Not Found -->
      <mat-card *ngIf="!loading && !board" class="not-found-card">
        <mat-card-content>
          <div class="not-found">
            <mat-icon>error_outline</mat-icon>
            <h2>Board Not Found</h2>
            <p>The requested board could not be found.</p>
            <button mat-raised-button color="primary" routerLink="/boards">
              Back to Boards
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Board Content -->
      <div *ngIf="!loading && board" class="board-content">
        <!-- Board Info Card -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="board-avatar">developer_board</mat-icon>
            <mat-card-title>{{ board.name }}</mat-card-title>
            <mat-card-subtitle>
              <app-status-badge [status]="board.status"></app-status-badge>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>qr_code</mat-icon>
                <div class="info-content">
                  <span class="info-label">Serial Number</span>
                  <span class="info-value monospace">{{ board.serialNumber }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>memory</mat-icon>
                <div class="info-content">
                  <span class="info-label">Firmware Version</span>
                  <span class="info-value">v{{ board.firmware }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <div class="info-content">
                  <span class="info-label">Last Seen</span>
                  <span class="info-value">{{ board.lastSeen ? (board.lastSeen | relativeTime) : 'Never' }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>event</mat-icon>
                <div class="info-content">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ board.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="info-item" *ngIf="board.metadata?.location">
                <mat-icon>location_on</mat-icon>
                <div class="info-content">
                  <span class="info-label">Location</span>
                  <span class="info-value">{{ board.metadata?.location }}</span>
                </div>
              </div>
              <div class="info-item" *ngIf="board.metadata?.description">
                <mat-icon>description</mat-icon>
                <div class="info-content">
                  <span class="info-label">Description</span>
                  <span class="info-value">{{ board.metadata?.description }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabs Section -->
        <mat-card class="tabs-card">
          <mat-tab-group animationDuration="200ms">
            <!-- Assigned Users Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>people</mat-icon>
                <span>Users ({{ assignedUsers.length }})</span>
              </ng-template>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Assigned Users</h3>
                  <button mat-stroked-button color="primary" (click)="assignUser()">
                    <mat-icon>person_add</mat-icon>
                    Assign User
                  </button>
                </div>

                <div *ngIf="assignedUsers.length === 0" class="empty-state">
                  <mat-icon>group_off</mat-icon>
                  <p>No users assigned to this board</p>
                  <button mat-stroked-button color="primary" (click)="assignUser()">
                    Assign First User
                  </button>
                </div>

                <mat-list *ngIf="assignedUsers.length > 0" class="users-list">
                  <mat-list-item *ngFor="let user of assignedUsers" class="user-item">
                    <mat-icon matListItemIcon>account_circle</mat-icon>
                    <div matListItemTitle>{{ user.firstName }} {{ user.lastName }}</div>
                    <div matListItemLine>{{ user.email }}</div>
                    <div matListItemMeta>
                      <span class="role-badge">{{ user.role }}</span>
                      <button mat-icon-button color="warn" matTooltip="Remove user" (click)="removeUser(user)">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                    </div>
                  </mat-list-item>
                </mat-list>
              </div>
            </mat-tab>

            <!-- Command History Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>terminal</mat-icon>
                <span>Commands ({{ commandHistory.length }})</span>
              </ng-template>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Command History</h3>
                  <button mat-stroked-button color="primary" (click)="openSendCommandDialog()">
                    <mat-icon>send</mat-icon>
                    Send Command
                  </button>
                </div>

                <div *ngIf="commandHistory.length === 0" class="empty-state">
                  <mat-icon>code_off</mat-icon>
                  <p>No commands sent to this board yet</p>
                </div>

                <mat-accordion *ngIf="commandHistory.length > 0" class="commands-accordion">
                  <mat-expansion-panel *ngFor="let cmd of commandHistory" class="command-panel">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <div class="command-title">
                          <span class="command-name monospace">{{ cmd.command }}</span>
                          <span class="command-status" [ngClass]="cmd.status">
                            {{ cmd.status }}
                          </span>
                        </div>
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ cmd.executedAt | relativeTime }} • {{ cmd.executedBy }}
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    <div class="command-details">
                      <div class="detail-row" *ngIf="cmd.payload">
                        <span class="detail-label">Payload:</span>
                        <pre class="detail-value">{{ cmd.payload | json }}</pre>
                      </div>
                      <div class="detail-row" *ngIf="cmd.response">
                        <span class="detail-label">Response:</span>
                        <pre class="detail-value">{{ cmd.response | json }}</pre>
                      </div>
                      <div class="detail-row" *ngIf="cmd.status === 'failed'">
                        <span class="detail-label error">Error:</span>
                        <span class="detail-value error">{{ cmd.response }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Executed At:</span>
                        <span class="detail-value">{{ cmd.executedAt | date:'medium' }}</span>
                      </div>
                    </div>
                  </mat-expansion-panel>
                </mat-accordion>
              </div>
            </mat-tab>

            <!-- Metadata Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>info</mat-icon>
                <span>Metadata</span>
              </ng-template>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Board Metadata</h3>
                  <button mat-stroked-button color="primary" (click)="editMetadata()">
                    <mat-icon>edit</mat-icon>
                    Edit Metadata
                  </button>
                </div>

                <div class="metadata-container">
                  <pre class="metadata-json">{{ board.metadata | json }}</pre>
                </div>

                <mat-divider></mat-divider>

                <div class="tags-section" *ngIf="board.metadata?.tags?.length">
                  <h4>Tags</h4>
                  <mat-chip-set>
                    <mat-chip *ngFor="let tag of board.metadata?.tags">{{ tag }}</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>

        <!-- Send Command Dialog -->
        <mat-card *ngIf="showCommandDialog" class="command-dialog-card">
          <mat-card-header>
            <mat-card-title>Send Command</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="commandForm" (ngSubmit)="sendCommand()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Command</mat-label>
                <mat-select formControlName="command">
                  <mat-option value="restart">Restart Device</mat-option>
                  <mat-option value="update_firmware">Update Firmware</mat-option>
                  <mat-option value="read_sensors">Read Sensors</mat-option>
                  <mat-option value="reset_config">Reset Configuration</mat-option>
                  <mat-option value="diagnostic">Run Diagnostic</mat-option>
                  <mat-option value="custom">Custom Command</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width" *ngIf="commandForm.get('command')?.value === 'custom'">
                <mat-label>Custom Command</mat-label>
                <input matInput formControlName="customCommand" placeholder="Enter custom command">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Payload (JSON)</mat-label>
                <textarea matInput formControlName="payload" rows="4" placeholder='{"key": "value"}'></textarea>
              </mat-form-field>

              <div class="dialog-actions">
                <button mat-button type="button" (click)="closeCommandDialog()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="commandForm.invalid || sendingCommand">
                  <mat-spinner *ngIf="sendingCommand" diameter="20"></mat-spinner>
                  <span *ngIf="!sendingCommand">Send</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .board-details-container {
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

    .board-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-card {
      border-radius: 12px;
    }

    .board-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 56px !important;
      height: 56px !important;
      font-size: 28px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px !important;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 16px;
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

    .monospace {
      font-family: 'Monaco', 'Consolas', monospace;
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

    .empty-state p {
      margin-bottom: 16px;
    }

    .users-list {
      background: #f8f9fa;
      border-radius: 8px;
    }

    .user-item {
      border-bottom: 1px solid #eee;
    }

    .user-item:last-child {
      border-bottom: none;
    }

    .role-badge {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      text-transform: capitalize;
      margin-right: 8px;
    }

    .commands-accordion {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .command-panel {
      border-radius: 8px !important;
    }

    .command-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .command-name {
      font-weight: 500;
    }

    .command-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
    }

    .command-status.success {
      background: #d4edda;
      color: #155724;
    }

    .command-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .command-status.failed {
      background: #f8d7da;
      color: #721c24;
    }

    .command-status.timeout {
      background: #e2e3e5;
      color: #383d41;
    }

    .command-details {
      padding: 16px 0;
    }

    .detail-row {
      margin-bottom: 12px;
    }

    .detail-label {
      font-size: 12px;
      color: #666;
      display: block;
      margin-bottom: 4px;
    }

    .detail-label.error {
      color: #dc3545;
    }

    .detail-value {
      font-size: 14px;
      color: #333;
    }

    .detail-value.error {
      color: #dc3545;
    }

    pre.detail-value {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0;
    }

    .metadata-container {
      margin-bottom: 24px;
    }

    .metadata-json {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
    }

    .tags-section {
      margin-top: 24px;
    }

    .tags-section h4 {
      margin-bottom: 12px;
      color: #666;
    }

    .command-dialog-card {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .board-details-container {
        padding: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .tab-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class BoardDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  boardId: string = '';
  board: Board | null = null;
  assignedUsers: User[] = [];
  commandHistory: CommandHistory[] = [];
  loading = true;
  
  showCommandDialog = false;
  sendingCommand = false;
  commandForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.commandForm = this.fb.group({
      command: ['', Validators.required],
      customCommand: [''],
      payload: ['']
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          this.boardId = params['id'];
          return this.loadBoardData();
        })
      )
      .subscribe({
      next: ({ board, users, commands }) => {
        this.board = board;
        this.assignedUsers = users;
        this.commandHistory = commands;
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

  private loadBoardData() {
    this.loading = true;
    
    return forkJoin({
      board: this.boardService.getBoardById(this.boardId).pipe(catchError(() => of(null))),
      users: this.userService.getUsersByBoard(this.boardId).pipe(catchError(() => of([]))),
      commands: this.boardService.getCommandHistory(this.boardId).pipe(catchError(() => of([])))
    });
  }

  editBoard(): void {
    this.snackBar.open('Edit board functionality', 'Close', { duration: 3000 });
  }

  editMetadata(): void {
    this.snackBar.open('Edit metadata functionality', 'Close', { duration: 3000 });
  }

  assignUser(): void {
    this.snackBar.open('Assign user dialog - implement with MatDialog', 'Close', { duration: 3000 });
  }

  removeUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove User',
        message: `Remove ${user.firstName} ${user.lastName} from this board?`,
        confirmText: 'Remove',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.removeUserFromBoard(this.boardId, user.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.assignedUsers = this.assignedUsers.filter(u => u.id !== user.id);
              this.snackBar.open('User removed from board', 'Close', { duration: 3000 });
            },
            error: () => {
              this.snackBar.open('Failed to remove user', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }

  openSendCommandDialog(): void {
    this.showCommandDialog = true;
    this.commandForm.reset();
  }

  closeCommandDialog(): void {
    this.showCommandDialog = false;
    this.commandForm.reset();
  }

  sendCommand(): void {
    if (this.commandForm.invalid) return;

    this.sendingCommand = true;
    const formValue = this.commandForm.value;
    
    const command = formValue.command === 'custom' ? formValue.customCommand : formValue.command;
    let payload = {};
    
    try {
      if (formValue.payload) {
        payload = JSON.parse(formValue.payload);
      }
    } catch (e) {
      this.snackBar.open('Invalid JSON payload', 'Close', { duration: 3000 });
      this.sendingCommand = false;
      return;
    }

    this.boardService.sendCommand(this.boardId, command, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.commandHistory.unshift(result);
          this.snackBar.open('Command sent successfully', 'Close', { duration: 3000 });
          this.closeCommandDialog();
          this.sendingCommand = false;
        },
        error: () => {
          this.snackBar.open('Failed to send command', 'Close', { duration: 3000 });
          this.sendingCommand = false;
        }
      });
  }
}
