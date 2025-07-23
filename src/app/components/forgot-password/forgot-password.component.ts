import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-forgot-password',
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
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="forgot-container">
      <!-- Left Side - Form -->
      <div class="form-section">
        <div class="form-content">
          <div class="form-header">
            <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1 class="page-title">Forgot Password?</h1>
            <p class="page-subtitle">Enter your email to receive a reset link</p>
          </div>

          <!-- Success State -->
          <div *ngIf="pageState === 'success'" class="success-state">
            <div class="success-icon">📧</div>
            <h3 class="success-title">Check Your Email</h3>
            <p class="success-message">
              We've sent a password reset link to <strong>{{ email }}</strong>. 
              Please check your email and click the link to reset your password.
            </p>
            <div class="success-actions">
              <button mat-raised-button class="resend-btn" (click)="resendEmail()" [disabled]="isResending">
                <mat-icon *ngIf="!isResending">refresh</mat-icon>
                <mat-icon *ngIf="isResending" class="spinning">refresh</mat-icon>
                {{ isResending ? 'Sending...' : 'Resend Email' }}
              </button>
              <button mat-outlined-button class="back-to-login-btn" routerLink="/login">
                Back to Sign In
              </button>
            </div>
          </div>

          <!-- Form State -->
          <form *ngIf="pageState === 'form'" [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
            <!-- Email Field -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email address" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="forgotForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="forgotForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <!-- Submit Button -->
            <button type="submit" 
                    mat-raised-button 
                    class="submit-btn" 
                    [disabled]="forgotForm.invalid || isSubmitting">
              <mat-icon *ngIf="!isSubmitting">send</mat-icon>
              <mat-icon *ngIf="isSubmitting" class="spinning">refresh</mat-icon>
              {{ isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link' }}
            </button>

            <!-- Back to Sign In Link -->
            <div class="signin-link">
              <p>Remember your password? 
                <a routerLink="/login" class="link">Back to Sign In</a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Side - Welcome Content -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">🔑</div>
          <h2 class="welcome-title">Reset Your Password</h2>
          <p class="welcome-subtitle">We'll help you get back to your account</p>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <mat-icon class="benefit-icon">security</mat-icon>
              <span>Secure password reset process</span>
            </div>
            <div class="benefit-item">
              <mat-icon class="benefit-icon">email</mat-icon>
              <span>Reset link sent to your email</span>
            </div>
            <div class="benefit-item">
              <mat-icon class="benefit-icon">speed</mat-icon>
              <span>Quick and easy recovery</span>
            </div>
            <div class="benefit-item">
              <mat-icon class="benefit-icon">verified</mat-icon>
              <span>Verified email delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  isSubmitting = false;
  isResending = false;
  pageState: 'form' | 'success' = 'form';
  email = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotForm.valid) {
      this.isSubmitting = true;
      this.email = this.forgotForm.get('email')?.value;
      
      try {
        const result = await this.authService.resetPassword(this.email);
        
        if (result.success) {
          this.pageState = 'success';
        } else {
          this.notificationService.error(
            'Reset Failed', 
            result.error?.message || 'Failed to send reset link. Please try again.', 
            5000
          );
        }
        
      } catch (error) {
        console.error('Password reset error:', error);
        this.notificationService.error(
          'Reset Failed', 
          'An unexpected error occurred. Please try again.', 
          5000
        );
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async resendEmail() {
    this.isResending = true;
    
    try {
      const result = await this.authService.resetPassword(this.email);
      
      if (result.success) {
        this.notificationService.success(
          'Email Resent', 
          'Reset link resent successfully!', 
          4000
        );
      } else {
        this.notificationService.error(
          'Resend Failed', 
          result.error?.message || 'Failed to resend reset link. Please try again.', 
          5000
        );
      }
      
    } catch (error) {
      console.error('Resend error:', error);
      this.notificationService.error(
        'Resend Failed', 
        'An unexpected error occurred. Please try again.', 
        5000
      );
    } finally {
      this.isResending = false;
    }
  }

  markFormGroupTouched() {
    Object.keys(this.forgotForm.controls).forEach(key => {
      const control = this.forgotForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
} 