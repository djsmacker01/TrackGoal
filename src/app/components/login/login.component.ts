import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SupabaseLoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <!-- Left Side - Form -->
      <div class="form-section">
        <div class="form-content">
          <div class="form-header">
            <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1 class="page-title">Welcome Back</h1>
            <p class="page-subtitle">Sign in to continue your journey</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <!-- Password Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" 
                     formControlName="password" 
                     placeholder="Enter your password" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="togglePasswordVisibility()" 
                      [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <mat-checkbox formControlName="rememberMe" class="remember-me">
                Remember me
              </mat-checkbox>
              <a routerLink="/forgot-password" class="forgot-password">Forgot Password?</a>
            </div>

            <!-- Sign In Button -->
            <button type="submit" 
                    mat-raised-button 
                    class="login-btn" 
                    [disabled]="loginForm.invalid || isSubmitting">
              <mat-icon *ngIf="!isSubmitting">login</mat-icon>
              <mat-icon *ngIf="isSubmitting" class="spinning">refresh</mat-icon>
              {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
            </button>

            <!-- Divider -->
            <div class="divider">
              <mat-divider></mat-divider>
              <span class="divider-text">or continue with</span>
              <mat-divider></mat-divider>
            </div>

            <!-- Social Login Buttons -->
            <div class="social-login">
              <button type="button" mat-outlined-button class="social-btn google-btn" (click)="signInWithGoogle()">
                <mat-icon>google</mat-icon>
                Google
              </button>
              <button type="button" mat-outlined-button class="social-btn github-btn" (click)="signInWithGitHub()">
                <mat-icon>code</mat-icon>
                GitHub
              </button>
            </div>

            <!-- Sign Up Link -->
            <div class="signup-link">
              <p>Don't have an account? 
                <a routerLink="/signup" class="link">Sign Up</a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Side - Welcome Content -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">🚀</div>
          <h2 class="welcome-title">Welcome Back to TrackGoal</h2>
          <p class="welcome-subtitle">Continue your journey towards success</p>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <mat-icon class="benefit-icon">trending_up</mat-icon>
              <span>Track your progress and achievements</span>
            </div>
            <div class="benefit-item">
              <mat-icon class="benefit-icon">notifications</mat-icon>
              <span>Get reminders and stay motivated</span>
            </div>
            <div class="benefit-item">
              <mat-icon class="benefit-icon">analytics</mat-icon>
              <span>View detailed analytics and insights</span>
            </div>
            <div class="benefit-item">
              <mat-icon class="benefit-icon">group</mat-icon>
              <span>Share goals with friends and family</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      
      // Prepare data for Supabase
      const formData: LoginData = this.loginForm.value;
      const supabaseData: SupabaseLoginData = {
        email: formData.email,
        password: formData.password
      };

      // Simulate Supabase login (replace with actual Supabase call)
      setTimeout(() => {
        console.log('Supabase login data:', supabaseData);
        console.log('Remember me:', formData.rememberMe);
        
        // Simulate success
        this.snackBar.open('Welcome back! You have successfully signed in.', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
        
        this.router.navigate(['/']);
        this.isSubmitting = false;
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  signInWithGoogle() {
    // Simulate Google OAuth (replace with actual Supabase social auth)
    this.snackBar.open('Google sign-in coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }

  signInWithGitHub() {
    // Simulate GitHub OAuth (replace with actual Supabase social auth)
    this.snackBar.open('GitHub sign-in coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }

  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
} 