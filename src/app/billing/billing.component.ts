import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PageHeaderComponent, StatsCardComponent } from '@shared/components';
import { BillingService } from '@core/services';
import { Bill, BillBreakdown, DeviceToken } from '@core/models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatsCardComponent
  ],
  template: `
    <div class="billing-container">
      <app-page-header 
        title="Billing" 
        subtitle="Calculate bills, view history, and manage your device token.">
        <button mat-raised-button routerLink="history">
          <mat-icon>history</mat-icon>
          View History
        </button>
      </app-page-header>

      <!-- Device Token Section -->
      <mat-card class="token-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>key</mat-icon>
            Device Token
          </mat-card-title>
          <mat-card-subtitle>Your unique device authentication token for API access</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="token-display" *ngIf="deviceToken">
            <code class="token-value">{{ showToken ? deviceToken.token : deviceToken.maskedToken }}</code>
            <div class="token-actions">
              <button mat-icon-button 
                      [matTooltip]="showToken ? 'Hide token' : 'Show token'"
                      (click)="showToken = !showToken">
                <mat-icon>{{ showToken ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <button mat-icon-button 
                      matTooltip="Copy token"
                      (click)="copyToken()">
                <mat-icon>content_copy</mat-icon>
              </button>
              <button mat-icon-button 
                      color="warn"
                      matTooltip="Regenerate token"
                      (click)="regenerateToken()">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          </div>
          <div class="token-meta" *ngIf="deviceToken">
            <span>Created: {{ deviceToken.createdAt | date:'medium' }}</span>
            <span *ngIf="deviceToken.lastUsedAt">Last used: {{ deviceToken.lastUsedAt | date:'medium' }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bill Calculator -->
      <mat-card class="calculator-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>calculate</mat-icon>
            Calculate Bill
          </mat-card-title>
          <mat-card-subtitle>Generate a bill for a specific period</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="calculator-form">
            <mat-form-field appearance="outline">
              <mat-label>Billing Period</mat-label>
              <mat-select [(value)]="selectedMonth">
                <mat-option *ngFor="let month of months" [value]="month.value">
                  {{ month.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button 
                    color="primary" 
                    (click)="calculateBill()"
                    [disabled]="calculating">
              <mat-spinner *ngIf="calculating" diameter="20"></mat-spinner>
              <mat-icon *ngIf="!calculating">receipt_long</mat-icon>
              {{ calculating ? 'Calculating...' : 'Calculate Bill' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bill Results -->
      <mat-card class="results-card" *ngIf="currentBill">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>receipt</mat-icon>
            Bill Summary
          </mat-card-title>
          <mat-card-subtitle>{{ currentBill.periodStart | date:'MMMM yyyy' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <!-- Stats Overview -->
          <div class="bill-stats">
            <app-stats-card
              icon="developer_board"
              [value]="currentBill.breakdown?.users?.length || 0"
              label="Active Devices"
              color="primary">
            </app-stats-card>
            <app-stats-card
              icon="sync"
              [value]="currentBill.breakdown?.dataPoints?.total || 0"
              label="Messages Processed"
              color="info">
            </app-stats-card>
            <app-stats-card
              icon="storage"
              [value]="currentBill.breakdown?.storage?.totalGb || 0"
              label="Storage Used"
              color="warning">
            </app-stats-card>
            <app-stats-card
              icon="attach_money"
              [value]="currentBill.total"
              label="Total Amount"
              color="success">
            </app-stats-card>
          </div>

          <mat-divider></mat-divider>

          <!-- Line Items -->
          <div class="line-items">
            <h4>Breakdown</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of currentBill.lineItems">
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity | number }}</td>
                  <td>{{ item.unitPrice | currency }}</td>
                  <td>{{ item.amount | currency }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="subtotal">
                  <td colspan="3">Subtotal</td>
                  <td>{{ currentBill.subtotal | currency }}</td>
                </tr>
                <tr class="tax">
                  <td colspan="3">Tax</td>
                  <td>{{ currentBill.tax | currency }}</td>
                </tr>
                <tr class="total">
                  <td colspan="3">Total</td>
                  <td>{{ currentBill.total | currency }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="bill-actions">
            <button mat-raised-button color="primary" (click)="downloadBill()">
              <mat-icon>download</mat-icon>
              Download PDF
            </button>
            <button mat-button [routerLink]="['/billing', currentBill.id]">
              <mat-icon>open_in_new</mat-icon>
              View Details
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .billing-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      border-radius: 12px;
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          color: #666;
        }
      }
    }

    .token-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
    }

    .token-display {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #1a1a2e;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .token-value {
      flex: 1;
      color: #4ade80;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 14px;
      word-break: break-all;
    }

    .token-actions {
      display: flex;
      gap: 4px;

      button {
        color: white;
      }
    }

    .token-meta {
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: #666;
    }

    .calculator-form {
      display: flex;
      gap: 16px;
      align-items: flex-start;

      mat-form-field {
        flex: 1;
        max-width: 300px;
      }

      button {
        height: 56px;
        padding: 0 24px;

        mat-spinner {
          margin-right: 8px;
        }

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .bill-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .line-items {
      margin: 24px 0;

      h4 {
        margin-bottom: 16px;
        font-weight: 500;
      }
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f5f5f5;
        font-weight: 500;
        color: #666;
      }

      td:last-child, th:last-child {
        text-align: right;
      }

      tfoot {
        tr {
          &.subtotal td {
            border-top: 2px solid #eee;
            font-weight: 500;
          }

          &.tax td {
            color: #666;
          }

          &.total td {
            font-size: 1.1rem;
            font-weight: 700;
            color: #4caf50;
          }
        }
      }
    }

    .bill-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;

      button mat-icon {
        margin-right: 8px;
      }
    }

    @media (max-width: 600px) {
      .calculator-form {
        flex-direction: column;

        mat-form-field {
          max-width: none;
        }

        button {
          width: 100%;
        }
      }

      .bill-stats {
        grid-template-columns: 1fr;
      }

      .items-table {
        font-size: 13px;

        th, td {
          padding: 8px;
        }
      }
    }
  `]
})
export class BillingComponent implements OnInit {
  deviceToken: DeviceToken | null = null;
  showToken = false;
  selectedMonth: string = '';
  calculating = false;
  currentBill: Bill | null = null;

  months: { value: string; label: string }[] = [];

  constructor(
    private billingService: BillingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.generateMonthOptions();
    this.loadDeviceToken();
  }

  generateMonthOptions(): void {
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      this.months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
    this.selectedMonth = this.months[0].value;
  }

  loadDeviceToken(): void {
    this.billingService.getDeviceToken().subscribe({
      next: (token) => {
        this.deviceToken = token;
      }
    });
  }

  copyToken(): void {
    if (this.deviceToken) {
      navigator.clipboard.writeText(this.deviceToken.token).then(() => {
        this.snackBar.open('Token copied to clipboard', 'Close', { duration: 2000 });
      });
    }
  }

regenerateToken(): void {
  if (confirm('Are you sure? This will invalidate your current token.')) {
    this.billingService.regenerateDeviceToken().subscribe({
      next: (response) => {
        const fullToken = response.token.token;

        this.deviceToken = {
          ...response.token,
          maskedToken:
            fullToken.substring(0, 8) +
            '...' +
            fullToken.substring(fullToken.length - 4),
          createdAt: new Date()
        };

        this.snackBar.open('Token regenerated successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to regenerate token', 'Close', { duration: 3000 });
      }
    });
  }
}


calculateBill(): void {
  const [year, month] = this.selectedMonth.split('-');
  const startDate = new Date(+year, +month - 1, 1);
  const endDate = new Date(+year, +month, 0);

  this.calculating = true;

  this.billingService.calculateBill({
    periodStart: startDate,
    periodEnd: endDate,
    includeBreakdown: true
  }).subscribe({
    next: (response) => {
      this.currentBill = response.bill;
      this.calculating = false;
    },
    error: () => {
      this.calculating = false;
      this.snackBar.open('Failed to calculate bill', 'Close', { duration: 3000 });
    }
  });
}


  downloadBill(): void {
    if (this.currentBill) {
      this.billingService.downloadBillPdf(this.currentBill.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bill-${this.currentBill!.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackBar.open('Failed to download bill', 'Close', { duration: 3000 });
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