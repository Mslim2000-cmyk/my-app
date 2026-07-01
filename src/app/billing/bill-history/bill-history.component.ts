import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { PageHeaderComponent, StatusBadgeComponent } from '@shared/components';
import { BillingService } from '@core/services';
import { Bill, BillStatus } from '@core/models';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-bill-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="history-container">
      <app-page-header 
        title="Bill History" 
        subtitle="View all your past billing statements."
        [showBack]="true">
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <div class="loading-container" *ngIf="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Loading bill history...</span>
          </div>

          <table mat-table [dataSource]="bills" class="bills-table" *ngIf="!loading">
            <!-- Period Column -->
            <ng-container matColumnDef="period">
              <th mat-header-cell *matHeaderCellDef>Period</th>
              <td mat-cell *matCellDef="let bill">
                {{ bill.periodStart | date:'MMM yyyy' }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let bill">
                <span class="status-chip" [class]="bill.status">
                  {{ bill.status | titlecase }}
                </span>
              </td>
            </ng-container>

            <!-- Devices Column -->
            <ng-container matColumnDef="devices">
              <th mat-header-cell *matHeaderCellDef>Devices</th>
              <td mat-cell *matCellDef="let bill">
                {{ bill.breakdown?.users?.length || '-' }}
              </td>
            </ng-container>

            <!-- Messages Column -->
            <ng-container matColumnDef="messages">
              <th mat-header-cell *matHeaderCellDef>Messages</th>
              <td mat-cell *matCellDef="let bill">
                {{ (bill.breakdown?.dataPoints?.total || 0) | number }}
              </td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let bill" class="amount-cell">
                {{ bill.total | currency }}
              </td>
            </ng-container>

            <!-- Due Date Column -->
            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let bill">
                {{ bill.dueDate | date:'mediumDate' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let bill">
                <button mat-icon-button [routerLink]="['/billing', bill.id]" matTooltip="View details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="downloadBill(bill)" matTooltip="Download PDF">
                  <mat-icon>download</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                [routerLink]="['/billing', row.id]"
                class="clickable-row"></tr>
          </table>

          <div class="empty-state" *ngIf="!loading && bills.length === 0">
            <mat-icon>receipt_long</mat-icon>
            <h3>No bills yet</h3>
            <p>Your billing history will appear here once bills are generated.</p>
          </div>

          <mat-paginator 
            *ngIf="!loading && bills.length > 0"
            [length]="totalBills"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      border-radius: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
      color: #666;
    }

    .bills-table {
      width: 100%;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f5f5f5;
      }
    }

    .status-chip {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;

      &.paid {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.pending {
        background: #fff3e0;
        color: #ef6c00;
      }

      &.overdue {
        background: #ffebee;
        color: #c62828;
      }

      &.draft {
        background: #f5f5f5;
        color: #666;
      }
    }

    .amount-cell {
      font-weight: 500;
      color: #333;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px;
        color: #666;
      }

      p {
        margin: 0;
      }
    }
  `]
})
export class BillHistoryComponent implements OnInit {
  loading = true;
  bills: Bill[] = [];
  totalBills = 0;
  pageSize = 10;
  currentPage = 0;

  displayedColumns = ['period', 'status', 'devices', 'messages', 'amount', 'dueDate', 'actions'];

  constructor(private billingService: BillingService) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.loading = true;
    this.billingService.getBillHistory(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.bills = response.bills;
        this.totalBills = response.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBills();
  }

  downloadBill(bill: Bill): void {
    this.billingService.downloadBillPdf(bill.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-${bill.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}