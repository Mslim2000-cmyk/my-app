import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { PageHeaderComponent, StatsCardComponent } from '@shared/components';
import { BillingService } from '@core/services';
import { Bill, BillStatus } from '@core/models';

@Component({
  selector: 'app-bill-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    PageHeaderComponent,
    StatsCardComponent
  ],
  template: `
    <div class="bill-details-container">
      <app-page-header 
        [title]="'Bill #' + (bill?.id || '')"
        [subtitle]="bill ? ((bill.periodStart | date:'MMMM yyyy') || 'Unknown') : ''"
        [showBack]="true">
        <button mat-raised-button color="primary" (click)="downloadBill()" *ngIf="bill">
          <mat-icon>download</mat-icon>
          Download PDF
        </button>
      </app-page-header>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Loading bill details...</span>
      </div>

      <div class="bill-content" *ngIf="!loading && bill">
        <!-- Status Banner -->
        <div class="status-banner" [class]="bill.status">
          <mat-icon>{{ getStatusIcon() }}</mat-icon>
          <div class="status-info">
            <span class="status-label">{{ bill.status | titlecase }}</span>
            <span class="status-detail" *ngIf="bill.status === 'paid' && bill.paidAt">
              Paid on {{ bill.paidAt | date:'mediumDate' }}
            </span>
            <span class="status-detail" *ngIf="bill.status === 'pending'">
              Due by {{ bill.dueDate | date:'mediumDate' }}
            </span>
            <span class="status-detail" *ngIf="bill.status === 'overdue'">
              Was due on {{ bill.dueDate | date:'mediumDate' }}
            </span>
          </div>
        </div>

        <!-- Stats Overview -->
          <div class="stats-grid">
          <app-stats-card
            icon="developer_board"
            [value]="bill.breakdown?.users?.length || 0"
            label="Active Devices"
            color="primary">
          </app-stats-card>
          <app-stats-card
            icon="sync"
            [value]="bill.breakdown?.dataPoints?.total || 0"
            label="Messages Processed"
            color="info">
          </app-stats-card>
          <app-stats-card
            icon="storage"
            [value]="bill.breakdown?.storage?.totalGb || 0"
            label="Storage Used"
            color="warning">
          </app-stats-card>
          <app-stats-card
            icon="api"
            [value]="bill.breakdown?.apiCalls?.total || 0"
            label="API Calls"
            color="success">
          </app-stats-card>
        </div>

        <!-- Billing Details -->
        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>Billing Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Bill ID</span>
                <span class="value">{{ bill.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Billing Period</span>
                <span class="value">{{ bill.periodStart | date:'mediumDate' }} - {{ bill.periodEnd | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Generated On</span>
                <span class="value">{{ bill.createdAt | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Due Date</span>
                <span class="value">{{ bill.dueDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Line Items -->
        <mat-card class="items-card">
          <mat-card-header>
            <mat-card-title>Line Items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of bill.lineItems">
                  <td>{{ item.description }}</td>
                  <td>
                    <span class="type-chip">{{ item.type }}</span>
                  </td>
                  <td>{{ item.quantity | number }}</td>
                  <td>{{ item.unitPrice | currency }}</td>
                  <td>{{ item.amount | currency }}</td>
                </tr>
              </tbody>
            </table>

            <mat-divider></mat-divider>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>{{ bill.subtotal | currency }}</span>
              </div>
              <div class="total-row">
                <span>Tax</span>
                <span>{{ bill.tax | currency }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total</span>
                <span>{{ bill.total | currency }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Usage Breakdown -->
        <mat-card class="usage-card" *ngIf="bill.breakdown">
          <mat-card-header>
            <mat-card-title>Usage Breakdown</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="usage-grid">
              <div class="usage-item">
                <mat-icon>dashboard_customize</mat-icon>
                <div class="usage-info">
                  <span class="usage-label">Boards</span>
                  <span class="usage-value">{{ bill.breakdown.boards?.length || 0 }}</span>
                </div>
              </div>
              <div class="usage-item">
                <mat-icon>people</mat-icon>
                <div class="usage-info">
                  <span class="usage-label">Users</span>
                  <span class="usage-value">{{ bill.breakdown.users?.length || 0 }}</span>
                </div>
              </div>
              <div class="usage-item">
                <mat-icon>message</mat-icon>
                <div class="usage-info">
                  <span class="usage-label">Data Points</span>
                  <span class="usage-value">{{ bill.breakdown.dataPoints?.total | number }}</span>
                </div>
              </div>
              <div class="usage-item">
                <mat-icon>cloud_upload</mat-icon>
                <div class="usage-info">
                  <span class="usage-label">Storage</span>
                  <span class="usage-value">{{ (bill.breakdown.storage?.totalGb || 0) + ' GB' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="not-found" *ngIf="!loading && !bill">
        <mat-icon>error_outline</mat-icon>
        <h3>Bill not found</h3>
        <p>The requested bill could not be found.</p>
        <button mat-raised-button color="primary" routerLink="/billing/history">
          Back to History
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bill-details-container {
      max-width: 1000px;
      margin: 0 auto;
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

    .status-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-radius: 12px;
      margin-bottom: 24px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &.paid {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        color: #2e7d32;
      }

      &.pending {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        color: #ef6c00;
      }

      &.overdue {
        background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
        color: #c62828;
      }

      &.draft {
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
        color: #666;
      }
    }

    .status-info {
      display: flex;
      flex-direction: column;
    }

    .status-label {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .status-detail {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    mat-card {
      border-radius: 12px;
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .value {
        font-size: 15px;
        font-weight: 500;
      }
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;

      th, td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f5f5f5;
        font-weight: 500;
        color: #666;
        font-size: 13px;
      }

      td:last-child, th:last-child {
        text-align: right;
      }
    }

    .type-chip {
      display: inline-block;
      padding: 2px 8px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
    }

    .totals {
      padding-top: 16px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      font-size: 14px;

      &.grand-total {
        background: #f5f5f5;
        border-radius: 8px;
        font-size: 18px;
        font-weight: 700;
        color: #4caf50;
        margin-top: 8px;
      }
    }

    .usage-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .usage-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #666;
      }
    }

    .usage-info {
      display: flex;
      flex-direction: column;
    }

    .usage-label {
      font-size: 12px;
      color: #666;
    }

    .usage-value {
      font-size: 16px;
      font-weight: 500;
    }

    .not-found {
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
        margin: 0 0 24px;
      }
    }

    @media (max-width: 600px) {
      .details-grid, .usage-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class BillDetailsComponent implements OnInit {
  loading = true;
  bill: Bill | null = null;

  constructor(
    private route: ActivatedRoute,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    const billId = this.route.snapshot.paramMap.get('id');
    if (billId) {
      this.loadBill(billId);
    } else {
      this.loading = false;
    }
  }

  loadBill(id: string): void {
    this.loading = true;
    this.billingService.getBillById(id).subscribe({
      next: (bill) => {
        this.bill = bill;
        this.loading = false;
      },
      error: () => {
        this.bill = null;
        this.loading = false;
      }
    });
  }

  getStatusIcon(): string {
    if (!this.bill) return 'receipt';
    const icons: Record<BillStatus, string> = {
      [BillStatus.PAID]: 'check_circle',
      [BillStatus.PENDING]: 'schedule',
      [BillStatus.OVERDUE]: 'error',
      [BillStatus.DRAFT]: 'edit',
      [BillStatus.CANCELLED]: 'cancel'
    };
    return icons[this.bill.status] || 'receipt';
  }

  downloadBill(): void {
    if (this.bill) {
      this.billingService.downloadBillPdf(this.bill.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bill-${this.bill!.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      });
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  formatStorage(mb: number): string {
    if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB';
    return mb + ' MB';
  }
}