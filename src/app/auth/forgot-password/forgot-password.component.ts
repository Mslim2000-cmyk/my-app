import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <div class="logo-section">
              <mat-icon class="logo-icon">developer_board</mat-icon>
              <span class="logo-text">IoT Protocol Engine</span>
            </div>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="!emailSent">
            <h2 class="auth-title">Forgot Password?</h2>
            <p class="auth-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input 
                  matInput 
                  type="email" 
                  formControlName="email" 
                  placeholder="Enter your email">
                <mat-icon matPrefix>email</mat-icon>
                <mat-error *ngIf="forgotForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="forgotForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                class="submit-button"
                [disabled]="forgotForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">Send Reset Link</span>
              </button>
            </form>
          </div>

          <div *ngIf="emailSent" class="success-state">
            <div class="success-icon">
              <mat-icon>mark_email_read</mat-icon>
            </div>
            <h2 class="auth-title">Check Your Email</h2>
            <p class="auth-subtitle">
              We've sent a password reset link to<br>
              <strong>{{ forgotForm.get('email')?.value }}</strong>
            </p>
            <p class="hint-text">
              Didn't receive the email? Check your spam folder or 
              <a href="#" (click)="resetForm(); $event.preventDefault()">try again</a>.
            </p>
          </div>

          <div class="auth-footer">
            <p><a routerLink="/auth/login"><mat-icon>arrow_back</mat-icon> Back to Sign In</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .logo-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #667eea;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .auth-title {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 24px 0 8px;
    }

    .auth-subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .submit-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 8px;
    }

    .submit-button mat-spinner {
      display: inline-block;
    }

    .success-state {
      text-align: center;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .success-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }

    .hint-text {
      font-size: 14px;
      color: #888;
    }

    .hint-text a {
      color: #667eea;
      text-decoration: none;
    }

    .hint-text a:hover {
      text-decoration: underline;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .auth-footer a mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    ::ng-deep .mat-mdc-card-header {
      justify-content: center;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
      },
      error: (error) => {
        this.isLoading = false;
        // Show success even on error for security (don't reveal if email exists)
        this.emailSent = true;
        console.warn('Forgot password error (shown as success for security):', error);
      }
    });
  }

  resetForm(): void {
    this.emailSent = false;
    this.forgotForm.reset();
  }
}