import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule,
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
          <div *ngIf="!resetSuccess && !tokenError">
            <h2 class="auth-title">Reset Password</h2>
            <p class="auth-subtitle">Enter your new password below.</p>
            
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Password</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword ? 'password' : 'text'" 
                  formControlName="newPassword"
                  placeholder="Enter new password">
                <mat-icon matPrefix>lock</mat-icon>
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="resetForm.get('newPassword')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="resetForm.get('newPassword')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
                <mat-hint>Minimum 8 characters</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm Password</mat-label>
                <input 
                  matInput 
                  [type]="hideConfirmPassword ? 'password' : 'text'" 
                  formControlName="confirmPassword"
                  placeholder="Confirm new password">
                <mat-icon matPrefix>lock</mat-icon>
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hideConfirmPassword = !hideConfirmPassword">
                  <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('required')">
                  Please confirm your password
                </mat-error>
                <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                class="submit-button"
                [disabled]="resetForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">Reset Password</span>
              </button>
            </form>
          </div>

          <div *ngIf="resetSuccess" class="success-state">
            <div class="success-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <h2 class="auth-title">Password Reset!</h2>
            <p class="auth-subtitle">
              Your password has been successfully reset.<br>
              You can now sign in with your new password.
            </p>
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/auth/login"
              class="submit-button">
              Sign In
            </button>
          </div>

          <div *ngIf="tokenError" class="error-state">
            <div class="error-icon">
              <mat-icon>error_outline</mat-icon>
            </div>
            <h2 class="auth-title">Invalid or Expired Link</h2>
            <p class="auth-subtitle">
              This password reset link is invalid or has expired.<br>
              Please request a new password reset.
            </p>
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/auth/forgot-password"
              class="submit-button">
              Request New Link
            </button>
          </div>

          <div class="auth-footer" *ngIf="!resetSuccess">
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

    .success-state,
    .error-state {
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

    .error-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .success-icon mat-icon,
    .error-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
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
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  resetSuccess = false;
  tokenError = false;
  private token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get token from URL
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    if (!this.token) {
      this.tokenError = true;
      return;
    }

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;

    const request = {
      token: this.token,
      newPassword: this.resetForm.get('newPassword')?.value,
      confirmPassword: this.resetForm.get('confirmPassword')?.value
    };

    this.authService.resetPassword(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetSuccess = true;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          this.tokenError = true;
        } else {
          this.snackBar.open(
            error.message || 'Failed to reset password. Please try again.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      }
    });
  }
}