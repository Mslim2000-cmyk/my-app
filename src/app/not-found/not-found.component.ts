import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule,} from '@angular/material/divider';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule,MatDividerModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <button mat-raised-button color="primary" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .not-found-content {
      text-align: center;
      background: white;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 72px;
      font-weight: 700;
      color: #333;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 24px;
      font-weight: 500;
      color: #666;
      margin: 8px 0 16px;
    }

    p {
      color: #999;
      margin-bottom: 24px;
    }

    button {
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class NotFoundComponent {}
