import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule,MatIconModule],
  template: `
    <mat-card class="stats-card" [ngClass]="color">
      <mat-card-content>
        <div class="stats-content">
          <div class="stats-icon">
            <mat-icon>{{ icon }}</mat-icon>
          </div>
          <div class="stats-info">
            <span class="stats-value">{{ value | number }}</span>
            <span class="stats-label">{{ label }}</span>
          </div>
        </div>
        <div *ngIf="subtitle" class="stats-subtitle">
          {{ subtitle }}
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-card {
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stats-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stats-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stats-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .stats-info {
      display: flex;
      flex-direction: column;
    }

    .stats-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      color: #1a1a2e;
    }

    .stats-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .stats-subtitle {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
      font-size: 13px;
      color: #888;
    }

    /* Color variants */
    .stats-card.primary .stats-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stats-card.success .stats-icon {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .stats-card.warning .stats-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stats-card.info .stats-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stats-card.danger .stats-icon {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
    }
  `]
})
export class StatsCardComponent {
  @Input() icon: string = 'analytics';
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() subtitle: string = '';
  @Input() color: 'primary' | 'success' | 'warning' | 'info' | 'danger' = 'primary';
}