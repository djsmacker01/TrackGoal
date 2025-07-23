import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationService } from '../../services/notification.service';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  styleUrls: ['./email-verification.component.scss'],
  template: `
    <div class="verification-container">
      <div class="verification-card">
        <!-- Header -->
        <div class="verification-header">
          <div class="header-icon">
            <mat-icon>mail</mat-icon>
          </div>
          <h1 class="verification-title">Verify Your Email</h1>
          <p class="verification-subtitle">Please confirm your email address to continue</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="loading-text">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div *ngIf="isVerified && !isLoading" class="success-state">
          <div class="success-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h2 class="success-title">Email Verified!</h2>
          <p class="success-message">Your email has been successfully verified. Redirecting...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage && !isLoading" class="error-state">
          <div class="error-icon">
            <mat-icon>error</mat-icon>
          </div>
          <h2 class="error-title">Verification Failed</h2>
          <p class="error-message">{{ errorMessage }}</p>
        </div>

        <!-- Main Content (when not loading/verified) -->
        <div *ngIf="!isLoading && !isVerified && !errorMessage" class="verification-content">
          <!-- Email Display -->
          <div class="email-display">
            <mat-icon class="email-icon">email</mat-icon>
            <div class="email-info">
              <p class="email-label">Verification email sent to:</p>
              <p class="email-address">{{ userEmail }}</p>
            </div>
          </div>

          <!-- Instructions -->
          <div class="instructions">
            <p class="instruction-text">
              Check your inbox and spam folder for the confirmation email. 
              Click the verification link in the email to complete your registration.
            </p>
          </div>

          <!-- Resend Section -->
          <div class="resend-section">
            <p class="resend-text">Didn't receive the email?</p>
            <button 
              mat-raised-button 
              color="primary" 
              class="resend-button"
              [disabled]="resendCooldown > 0 || isResending"
              (click)="resendVerificationEmail()"
            >
              <mat-icon *ngIf="!isResending">refresh</mat-icon>
              <mat-spinner *ngIf="isResending" diameter="20"></mat-spinner>
              <span *ngIf="resendCooldown > 0">
                Resend in {{ resendCooldown }}s
              </span>
              <span *ngIf="resendCooldown === 0 && !isResending">
                Resend Verification Email
              </span>
            </button>
          </div>

          <!-- Divider -->
          <mat-divider class="divider"></mat-divider>

          <!-- Navigation Links -->
          <div class="navigation-links">
            <button 
              mat-button 
              color="primary" 
              class="signin-link"
              (click)="navigateToSignIn()"
            >
              Already verified? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isLoading = false;
  isVerified = false;
  isResending = false;
  errorMessage = '';
  userEmail = '';
  resendCooldown = 0;
  private cooldownTimer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUserEmail();
    this.handleUrlVerification();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  private async loadUserEmail() {
    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      this.userEmail = user?.email || '';
    } catch (error) {
      console.error('Error loading user email:', error);
    }
  }

  private async handleUrlVerification() {
    // Check for verification tokens in URL
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];
      const type = params['type'];

      if (accessToken && type === 'email') {
        this.isLoading = true;
        this.errorMessage = '';

        try {
          // Verify the email using the auth service
          const result = await this.authService.verifyEmail(accessToken);

          if (result.success) {
            console.log('Email verified successfully');
            this.isVerified = true;
            this.isLoading = false;

            // Redirect after a short delay
            setTimeout(() => {
              this.redirectAfterVerification();
            }, 2000);
          } else {
            console.error('Verification error:', result.error);
            this.errorMessage = result.error?.message || 'Email verification failed. Please try again.';
            this.isLoading = false;
          }
        } catch (error) {
          console.error('Unexpected error during verification:', error);
          this.errorMessage = 'An unexpected error occurred. Please try again.';
          this.isLoading = false;
        }
      }
    });
  }



  private redirectAfterVerification() {
    // Check if user has completed onboarding
    this.supabaseService.getUserProfile().then(profile => {
      if (profile?.onboarding_completed) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/onboarding']);
      }
    }).catch(() => {
      // If profile fetch fails, go to onboarding
      this.router.navigate(['/onboarding']);
    });
  }

  async resendVerificationEmail() {
    if (this.resendCooldown > 0 || this.isResending) {
      return;
    }

    this.isResending = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.resendEmailVerification();

      if (result.success) {
        console.log('Verification email resent successfully');
        // Start cooldown timer
        this.startCooldownTimer();
      } else {
        console.error('Resend error:', result.error);
        this.errorMessage = result.error?.message || 'Failed to resend verification email. Please try again.';
      }
    } catch (error) {
      console.error('Unexpected error resending email:', error);
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    } finally {
      this.isResending = false;
    }
  }

  private startCooldownTimer() {
    this.resendCooldown = 60;
    
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }

  navigateToSignIn() {
    this.router.navigate(['/login']);
  }
} 