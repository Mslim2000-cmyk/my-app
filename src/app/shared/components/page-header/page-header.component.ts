import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule,MatDividerModule, MatIconModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <button 
            *ngIf="showBack" 
            mat-icon-button 
            class="back-button"
            (click)="backClick.emit()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="title-wrapper">
            <h1 class="page-title">{{ title }}</h1>
            <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div class="actions-section">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .title-section {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .back-button {
      margin-top: 4px;
    }

    .title-wrapper {
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
      line-height: 1.3;
    }

    .page-subtitle {
      font-size: 14px;
      color: #666;
      margin: 4px 0 0;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .page-title {
        font-size: 22px;
      }

      .header-content {
        flex-direction: column;
      }

      .actions-section {
        width: 100%;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBack: boolean = false;
  @Output() backClick = new EventEmitter<void>();
}