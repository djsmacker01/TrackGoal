import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService, UserProfile } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./profile.component.scss'],
  template: `
    <div class="profile-container">
      <!-- Header -->
      <header class="profile-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="page-title">Profile</h1>
          <div class="header-actions">
            <button mat-button class="save-btn" 
                    [disabled]="!profileForm.valid || !profileForm.dirty || saving"
                    (click)="saveProfile()">
              <mat-icon *ngIf="!saving">save</mat-icon>
              <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="profile-content">
        <div class="profile-grid">
          <!-- Profile Information Card -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon>
                Personal Information
              </mat-card-title>
              <mat-card-subtitle>Update your profile details</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="profileForm" class="profile-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="first_name" placeholder="Enter your first name">
                    <mat-error *ngIf="profileForm.get('first_name')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="last_name" placeholder="Enter your last name">
                    <mat-error *ngIf="profileForm.get('last_name')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Display Name</mat-label>
                  <input matInput formControlName="display_name" placeholder="How should we call you?">
                  <mat-hint>This is how your name appears in the app</mat-hint>
                  <mat-error *ngIf="profileForm.get('display_name')?.hasError('required')">
                    Display name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Email</mat-label>
                  <input matInput [value]="userEmail" readonly>
                  <mat-hint>Email cannot be changed from this page</mat-hint>
                </mat-form-field>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Account Information Card -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>account_circle</mat-icon>
                Account Information
              </mat-card-title>
              <mat-card-subtitle>Your account details</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Member Since</span>
                  <span class="info-value">{{ memberSince | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Updated</span>
                  <span class="info-value">{{ lastUpdated | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Onboarding Status</span>
                  <span class="info-value" [ngClass]="onboardingStatus">
                    {{ onboardingCompleted ? 'Completed' : 'Incomplete' }}
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Preferences Card -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>settings</mat-icon>
                Preferences
              </mat-card-title>
              <mat-card-subtitle>Customize your experience</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="preferences-form">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Timezone</mat-label>
                  <input matInput formControlName="timezone" placeholder="e.g., America/New_York">
                  <mat-hint>Your local timezone for accurate timestamps</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Language</mat-label>
                  <input matInput formControlName="language" placeholder="e.g., en-US">
                  <mat-hint>Your preferred language</mat-hint>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions Card -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>security</mat-icon>
                Account Actions
              </mat-card-title>
              <mat-card-subtitle>Manage your account</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="actions-grid">
                <button mat-button class="action-btn" (click)="changePassword()">
                  <mat-icon>lock</mat-icon>
                  Change Password
                </button>
                <button mat-button class="action-btn" (click)="exportData()">
                  <mat-icon>download</mat-icon>
                  Export Data
                </button>
                <button mat-button class="action-btn danger" (click)="deleteAccount()">
                  <mat-icon>delete_forever</mat-icon>
                  Delete Account
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </main>
    </div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  userEmail: string = '';
  saving = false;
  loading = true;
  private authSubscription: Subscription;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      display_name: ['', Validators.required],
      timezone: [''],
      language: ['']
    });

    this.authSubscription = this.supabaseService.user$.subscribe(user => {
      if (user) {
        this.userEmail = user.email || '';
      }
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private async loadUserProfile() {
    try {
      this.loading = true;
      const user = this.supabaseService.currentUserValue;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      const profile = await this.supabaseService.getUserProfile(user.id);
      if (profile) {
        this.userProfile = profile;
        this.populateForm(profile);
      } else {
        // Create profile if it doesn't exist
        await this.supabaseService.createUserProfile(user.id);
        const newProfile = await this.supabaseService.getUserProfile(user.id);
        if (newProfile) {
          this.userProfile = newProfile;
          this.populateForm(newProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.notificationService.error('Error', 'Failed to load profile data', 5000);
    } finally {
      this.loading = false;
    }
  }

  private populateForm(profile: UserProfile) {
    this.profileForm.patchValue({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      display_name: profile.display_name || '',
      timezone: profile.timezone || '',
      language: profile.language || ''
    });
  }

  async saveProfile() {
    if (!this.profileForm.valid || !this.userProfile) {
      return;
    }

    try {
      this.saving = true;
      const updates = this.profileForm.value;
      
      await this.supabaseService.updateUserProfile(updates);
      
      this.notificationService.success(
        'Profile Updated', 
        'Your profile has been updated successfully!', 
        3000
      );
      
      // Reload profile to get updated data
      await this.loadUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      this.notificationService.error(
        'Error', 
        'Failed to update profile. Please try again.', 
        5000
      );
    } finally {
      this.saving = false;
    }
  }

  changePassword() {
    this.router.navigate(['/reset-password']);
  }

  exportData() {
    // TODO: Implement data export functionality
    this.notificationService.info(
      'Coming Soon', 
      'Data export feature will be available soon!', 
      3000
    );
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      // TODO: Implement account deletion
      this.notificationService.warning(
        'Account Deletion', 
        'Account deletion feature will be implemented soon. Please contact support for now.', 
        5000
      );
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  get memberSince(): string {
    return this.userProfile?.created_at || '';
  }

  get lastUpdated(): string {
    return this.userProfile?.updated_at || '';
  }

  get onboardingCompleted(): boolean {
    return this.userProfile?.onboarding_completed || false;
  }

  get onboardingStatus(): string {
    return this.onboardingCompleted ? 'completed' : 'incomplete';
  }
} 