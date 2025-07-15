import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  termsAccepted: boolean;
}

export interface SupabaseSignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
    };
  };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="signup-container">
      <!-- Left Side - Form -->
      <div class="form-section">
        <div class="form-content">
          <div class="form-header">
            <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1 class="page-title">Create Account</h1>
            <p class="page-subtitle">Join TrackGoal and start achieving your dreams</p>
          </div>

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
            <!-- Email Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="signupForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <!-- Password Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" 
                     formControlName="password" 
                     placeholder="Create a strong password" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="togglePasswordVisibility()" 
                      [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="signupForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('passwordStrength')">
                Password must contain uppercase, lowercase, and number
              </mat-error>
            </mat-form-field>

            <!-- Password Strength Indicator -->
            <div class="password-strength" *ngIf="signupForm.get('password')?.value">
              <div class="strength-bar">
                <mat-progress-bar 
                  [value]="passwordStrength.score" 
                  [ngClass]="'strength-' + passwordStrength.level">
                </mat-progress-bar>
              </div>
              <span class="strength-text" [ngClass]="'strength-' + passwordStrength.level">
                {{ passwordStrength.message }}
              </span>
            </div>

            <!-- Confirm Password Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="showConfirmPassword ? 'text' : 'password'" 
                     formControlName="confirmPassword" 
                     placeholder="Confirm your password" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="toggleConfirmPasswordVisibility()" 
                      [attr.aria-label]="showConfirmPassword ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <!-- Full Name Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Full Name (Optional)</mat-label>
              <input matInput formControlName="fullName" placeholder="Enter your full name">
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <!-- Terms and Privacy -->
            <div class="checkbox-section">
              <mat-checkbox formControlName="termsAccepted" class="checkbox-field">
                I agree to the 
                <a href="#" class="link">Terms of Service</a>
                and 
                <a href="#" class="link">Privacy Policy</a>
              </mat-checkbox>
              <mat-error *ngIf="signupForm.get('termsAccepted')?.hasError('required') && signupForm.get('termsAccepted')?.touched">
                You must accept the Terms of Service and Privacy Policy
              </mat-error>
            </div>

            <!-- Submit Button -->
            <button type="submit" 
                    mat-raised-button 
                    class="signup-btn" 
                    [disabled]="signupForm.invalid || isSubmitting">
              <mat-icon *ngIf="!isSubmitting">person_add</mat-icon>
              <mat-icon *ngIf="isSubmitting" class="spinning">refresh</mat-icon>
              {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
            </button>

            <!-- Divider -->
            <div class="divider">
              <mat-divider></mat-divider>
              <span class="divider-text">or continue with</span>
              <mat-divider></mat-divider>
            </div>

            <!-- Social Login Buttons -->
            <div class="social-login">
              <button type="button" mat-outlined-button class="social-btn google-btn" (click)="signUpWithGoogle()">
                <mat-icon>google</mat-icon>
                Google
              </button>
              <button type="button" mat-outlined-button class="social-btn github-btn" (click)="signUpWithGitHub()">
                <mat-icon>code</mat-icon>
                GitHub
              </button>
            </div>

            <!-- Sign In Link -->
            <div class="signin-link">
              <p>Already have an account? 
                <a routerLink="/login" class="link">Sign In</a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Side - Welcome Content -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">🎯</div>
          <h2 class="welcome-title">Welcome to TrackGoal</h2>
          <p class="welcome-subtitle">Your personal goal tracking companion</p>
          
          <div class="features-list">
            <div class="feature-item">
              <mat-icon class="feature-icon">check_circle</mat-icon>
              <span>Set and track your goals with ease</span>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">check_circle</mat-icon>
              <span>Organize goals by categories</span>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">check_circle</mat-icon>
              <span>Monitor progress with analytics</span>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">check_circle</mat-icon>
              <span>Stay motivated with milestones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = { score: 0, level: 'weak', message: '' };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.setupPasswordStrengthMonitoring();
  }

  initForm() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
      fullName: [''],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  setupPasswordStrengthMonitoring() {
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      if (password) {
        this.passwordStrength = this.calculatePasswordStrength(password);
      } else {
        this.passwordStrength = { score: 0, level: 'weak', message: '' };
      }
    });
  }

  passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return { passwordStrength: true };
      }

      return null;
    };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (group.get('confirmPassword')?.hasError('passwordMismatch')) {
      group.get('confirmPassword')?.setErrors(null);
    }

    return null;
  }

  calculatePasswordStrength(password: string) {
    let score = 0;
    let message = '';

    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    // Determine level and message
    if (score < 50) {
      message = 'Weak password';
    } else if (score < 75) {
      message = 'Fair password';
    } else if (score < 90) {
      message = 'Good password';
    } else {
      message = 'Strong password';
    }

    const level = score < 50 ? 'weak' : score < 75 ? 'fair' : score < 90 ? 'good' : 'strong';

    return { score, level, message };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      
      const formData: SignUpData = this.signupForm.value;
      
      // Prepare metadata for user profile
      const metadata: any = {};
      if (formData.fullName) {
        metadata.display_name = formData.fullName;
        // Split full name into first and last name
        const nameParts = formData.fullName.trim().split(' ');
        if (nameParts.length > 0) {
          metadata.first_name = nameParts[0];
          if (nameParts.length > 1) {
            metadata.last_name = nameParts.slice(1).join(' ');
          }
        }
      }
      
      // Call AuthService signup with metadata
      this.authService.signUp(formData.email, formData.password, metadata)
        .then(result => {
          if (result.success) {
            // Navigate to onboarding
            this.router.navigate(['/onboarding']);
          } else {
            this.notificationService.error(
              'Signup Failed', 
              result.error?.message || 'Failed to create account. Please try again.', 
              5000
            );
          }
        })
        .catch(error => {
          console.error('Signup error:', error);
          this.notificationService.error(
            'Signup Failed', 
            'An unexpected error occurred. Please try again.', 
            5000
          );
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  signUpWithGoogle() {
    this.snackBar.open('Google signup coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  signUpWithGitHub() {
    this.snackBar.open('GitHub signup coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
} 