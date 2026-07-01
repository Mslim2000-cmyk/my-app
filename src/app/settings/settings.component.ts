import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '@shared/components';
import { AuthService, UserService } from '@core/services';
import { User } from '@core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="settings-container">
      <app-page-header 
        title="Settings" 
        subtitle="Manage your profile and account settings.">
      </app-page-header>

      <mat-tab-group class="settings-tabs">
        <!-- Profile Tab -->
        <mat-tab label="Profile">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Profile Information</mat-card-title>
                <mat-card-subtitle>Update your personal details</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  <div class="avatar-section">
                    <div class="avatar">
                      {{ userInitials }}
                    </div>
                    <div class="avatar-info">
                      <h3>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h3>
                      <p>{{ currentUser?.email }}</p>
                      <span class="role-badge">{{ currentUser?.role | titlecase }}</span>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName">
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName">
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email">
                      <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                        Please enter a valid email
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Company Name</mat-label>
                      <input matInput formControlName="companyName">
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="profileForm.invalid || savingProfile">
                      <mat-spinner *ngIf="savingProfile" diameter="20"></mat-spinner>
                      {{ savingProfile ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Security Tab -->
        <mat-tab label="Security">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Change Password</mat-card-title>
                <mat-card-subtitle>Update your password to keep your account secure</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input matInput formControlName="currentPassword" 
                           [type]="showCurrentPassword ? 'text' : 'password'">
                    <button mat-icon-button matSuffix type="button"
                            (click)="showCurrentPassword = !showCurrentPassword">
                      <mat-icon>{{ showCurrentPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                      Current password is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Password</mat-label>
                    <input matInput formControlName="newPassword" 
                           [type]="showNewPassword ? 'text' : 'password'">
                    <button mat-icon-button matSuffix type="button"
                            (click)="showNewPassword = !showNewPassword">
                      <mat-icon>{{ showNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      New password is required
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      Password must be at least 8 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirm New Password</mat-label>
                    <input matInput formControlName="confirmPassword" 
                           [type]="showConfirmPassword ? 'text' : 'password'">
                    <button mat-icon-button matSuffix type="button"
                            (click)="showConfirmPassword = !showConfirmPassword">
                      <mat-icon>{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      Please confirm your password
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('mismatch')">
                      Passwords do not match
                    </mat-error>
                  </mat-form-field>

                  <div class="password-requirements">
                    <p>Password must:</p>
                    <ul>
                      <li [class.met]="passwordForm.get('newPassword')?.value?.length >= 8">
                        Be at least 8 characters long
                      </li>
                      <li [class.met]="hasUppercase(passwordForm.get('newPassword')?.value)">
                        Include an uppercase letter
                      </li>
                      <li [class.met]="hasLowercase(passwordForm.get('newPassword')?.value)">
                        Include a lowercase letter
                      </li>
                      <li [class.met]="hasNumber(passwordForm.get('newPassword')?.value)">
                        Include a number
                      </li>
                    </ul>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="passwordForm.invalid || changingPassword">
                      <mat-spinner *ngIf="changingPassword" diameter="20"></mat-spinner>
                      {{ changingPassword ? 'Changing...' : 'Change Password' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="danger-zone">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>warning</mat-icon>
                  Danger Zone
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="danger-item">
                  <div class="danger-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button mat-raised-button color="warn">Delete Account</button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Notifications Tab -->
        <mat-tab label="Notifications">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Notification Preferences</mat-card-title>
                <mat-card-subtitle>Choose how you want to be notified</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="notification-settings">
                  <div class="notification-item">
                    <div class="notification-info">
                      <h4>Email Notifications</h4>
                      <p>Receive important updates via email</p>
                    </div>
                    <mat-icon class="check-icon active">check_circle</mat-icon>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="notification-item">
                    <div class="notification-info">
                      <h4>Alert Notifications</h4>
                      <p>Get notified when alerts are triggered</p>
                    </div>
                    <mat-icon class="check-icon active">check_circle</mat-icon>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="notification-item">
                    <div class="notification-info">
                      <h4>Billing Notifications</h4>
                      <p>Receive billing and payment reminders</p>
                    </div>
                    <mat-icon class="check-icon active">check_circle</mat-icon>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="notification-item">
                    <div class="notification-info">
                      <h4>Marketing Emails</h4>
                      <p>Receive product updates and tips</p>
                    </div>
                    <mat-icon class="check-icon">radio_button_unchecked</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .settings-tabs {
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    mat-card {
      border-radius: 8px;
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 500;
    }

    .avatar-info {
      h3 {
        margin: 0 0 4px;
        font-size: 1.25rem;
      }

      p {
        margin: 0 0 8px;
        color: #666;
      }
    }

    .role-badge {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 24px;
    }

    .full-width {
      grid-column: span 2;
    }

    mat-form-field {
      width: 100%;
    }

    .form-actions {
      margin-top: 24px;

      button {
        min-width: 150px;

        mat-spinner {
          display: inline-block;
          margin-right: 8px;
        }
      }
    }

    .password-requirements {
      margin: 16px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;

      p {
        margin: 0 0 8px;
        font-weight: 500;
      }

      ul {
        margin: 0;
        padding-left: 20px;
      }

      li {
        color: #999;
        margin-bottom: 4px;

        &.met {
          color: #4caf50;
        }
      }
    }

    .danger-zone {
      border: 1px solid #ffcdd2;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #c62828;

        mat-icon {
          color: #c62828;
        }
      }
    }

    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0 0 4px;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 13px;
      }
    }

    .notification-settings {
      max-width: 500px;
    }

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;

      h4 {
        margin: 0 0 4px;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 13px;
      }
    }

    .check-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #ccc;

      &.active {
        color: #4caf50;
      }
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: span 1;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .danger-item {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  savingProfile = false;
  changingPassword = false;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  get userInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadCurrentUser();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      companyName: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    // Add password match validator
    this.passwordForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
  }

  validatePasswordMatch(): void {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
    
    if (confirmPassword && newPassword !== confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ mismatch: true });
    }
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          companyName: user.companyName || ''
        });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.savingProfile = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.savingProfile = false;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.savingProfile = false;
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.changingPassword = true;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

this.userService.changePassword({
  currentPassword,
  newPassword,
  confirmPassword
}).subscribe({
  next: () => {
    this.changingPassword = false;
    this.passwordForm.reset();
    this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
  },
  error: () => {
    this.changingPassword = false;
    this.snackBar.open('Failed to change password', 'Close', { duration: 3000 });
  }
});

  }

  hasUppercase(value: string): boolean {
    return value ? /[A-Z]/.test(value) : false;
  }

  hasLowercase(value: string): boolean {
    return value ? /[a-z]/.test(value) : false;
  }

  hasNumber(value: string): boolean {
    return value ? /[0-9]/.test(value) : false;
  }
}