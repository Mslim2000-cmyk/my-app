import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [ MatDividerModule,CommonModule],
  template: `
    <span class="status-badge" [ngClass]="getStatusClass()">
      <span class="status-dot"></span>
      {{ status | titlecase }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    /* Online / Active / Success */
    .status-badge.online,
    .status-badge.active,
    .status-badge.success,
    .status-badge.completed,
    .status-badge.paid {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.online .status-dot,
    .status-badge.active .status-dot,
    .status-badge.success .status-dot,
    .status-badge.completed .status-dot,
    .status-badge.paid .status-dot {
      background-color: #4caf50;
    }

    /* Offline / Disabled / Error */
    .status-badge.offline,
    .status-badge.disabled,
    .status-badge.error,
    .status-badge.failed,
    .status-badge.overdue {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-badge.offline .status-dot,
    .status-badge.disabled .status-dot,
    .status-badge.error .status-dot,
    .status-badge.failed .status-dot,
    .status-badge.overdue .status-dot {
      background-color: #f44336;
    }

    /* Maintenance / Warning / Pending */
    .status-badge.maintenance,
    .status-badge.warning,
    .status-badge.pending,
    .status-badge.draft {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-badge.maintenance .status-dot,
    .status-badge.warning .status-dot,
    .status-badge.pending .status-dot,
    .status-badge.draft .status-dot {
      background-color: #ff9800;
    }

    /* Info */
    .status-badge.info,
    .status-badge.executing {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-badge.info .status-dot,
    .status-badge.executing .status-dot {
      background-color: #2196f3;
    }

    /* Critical */
    .status-badge.critical {
      background-color: #fce4ec;
      color: #ad1457;
    }

    .status-badge.critical .status-dot {
      background-color: #e91e63;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  getStatusClass(): string {
    return this.status.toLowerCase().replace(/[^a-z]/g, '');
  }
}