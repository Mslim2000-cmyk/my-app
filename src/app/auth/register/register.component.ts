import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-register',
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
    MatSnackBarModule,
    MatCheckboxModule
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
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Start your IoT journey today</p>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="First name">
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Last name">
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Company Name (Optional)</mat-label>
              <input matInput formControlName="companyName" placeholder="Your company">
              <mat-icon matPrefix>business</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password"
                placeholder="Create a password">
              <mat-icon matPrefix>lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
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
                placeholder="Confirm your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <mat-checkbox formControlName="agreeTerms" class="terms-checkbox">
              I agree to the <a href="#" (click)="$event.preventDefault()">Terms of Service</a> 
              and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a>
            </mat-checkbox>
            <mat-error *ngIf="registerForm.get('agreeTerms')?.touched && registerForm.get('agreeTerms')?.hasError('requiredTrue')" class="terms-error">
              You must agree to the terms
            </mat-error>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="submit-button"
              [disabled]="registerForm.invalid || isLoading">
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Create Account</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/auth/login">Sign In</a></p>
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
      max-width: 480px;
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
    }

    .name-row {
      display: flex;
      gap: 16px;
    }

    .name-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .terms-checkbox {
      margin: 16px 0;
      display: block;
    }

    .terms-checkbox a {
      color: #667eea;
      text-decoration: none;
    }

    .terms-checkbox a:hover {
      text-decoration: underline;
    }

    .terms-error {
      font-size: 12px;
      margin-top: -12px;
      margin-bottom: 16px;
      display: block;
    }

    .submit-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .submit-button mat-spinner {
      display: inline-block;
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
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    ::ng-deep .mat-mdc-card-header {
      justify-content: center;
    }

    @media (max-width: 500px) {
      .name-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      companyName: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    const { confirmPassword, agreeTerms, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.message || 'Registration successful! Please login.',
          'Close',
          { duration: 5000, panelClass: ['success-snackbar'] }
        );
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.message || 'Registration failed. Please try again.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }
}