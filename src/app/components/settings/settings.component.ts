import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService, UserProfile } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationManagerService } from '../../services/notification-manager.service';
import { LanguageService } from '../../services/language.service';
import { DataExportService } from '../../services/data-export.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
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
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  styleUrls: ['./settings.component.scss'],
  template: `
    <div class="settings-container">
      <!-- Header -->
      <header class="settings-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="page-title">Settings</h1>
          <div class="header-actions">
            <button mat-button class="save-btn" 
                    [disabled]="!settingsForm.dirty || saving"
                    (click)="saveSettings()">
              <mat-icon *ngIf="!saving">save</mat-icon>
              <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="settings-content">
        <div class="settings-grid">
          <!-- Notification Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>notifications</mat-icon>
                Notification Settings
              </mat-card-title>
              <mat-card-subtitle>Manage how you receive notifications</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="settingsForm" class="settings-form">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive notifications via email</p>
                  </div>
                  <mat-slide-toggle formControlName="emailNotifications" color="primary"></mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Goal Reminders</h4>
                    <p>Get reminded about your goals</p>
                  </div>
                  <mat-slide-toggle formControlName="goalReminders" color="primary"></mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Milestone Celebrations</h4>
                    <p>Celebrate when you complete milestones</p>
                  </div>
                  <mat-slide-toggle formControlName="milestoneCelebrations" color="primary"></mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Weekly Progress Reports</h4>
                    <p>Receive weekly progress summaries</p>
                  </div>
                  <mat-slide-toggle formControlName="weeklyReports" color="primary"></mat-slide-toggle>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Privacy Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>security</mat-icon>
                Privacy Settings
              </mat-card-title>
              <mat-card-subtitle>Control your privacy preferences</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="settingsForm" class="settings-form">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Profile Visibility</h4>
                    <p>Make your profile visible to others</p>
                  </div>
                  <mat-slide-toggle formControlName="profileVisible" color="primary"></mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Goal Sharing</h4>
                    <p>Allow others to see your goals</p>
                  </div>
                  <mat-slide-toggle formControlName="goalSharing" color="primary"></mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Analytics Sharing</h4>
                    <p>Share anonymous usage data</p>
                  </div>
                  <mat-slide-toggle formControlName="analyticsSharing" color="primary"></mat-slide-toggle>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Display Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>display_settings</mat-icon>
                Display Settings
              </mat-card-title>
              <mat-card-subtitle>Customize your app appearance</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="settingsForm" class="settings-form">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Theme</h4>
                    <p>Choose your preferred theme</p>
                  </div>
                  <mat-form-field appearance="outline" class="theme-select">
                    <mat-select formControlName="theme" (selectionChange)="onThemeChange($event)">
                      <mat-option value="light">Light</mat-option>
                      <mat-option value="dark">Dark</mat-option>
                      <mat-option value="auto">Auto</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Language</h4>
                    <p>Select your preferred language</p>
                  </div>
                  <mat-form-field appearance="outline" class="language-select">
                    <mat-select formControlName="language" (selectionChange)="onLanguageChange($event)">
                      <mat-option *ngFor="let lang of availableLanguages" [value]="lang.code">
                        {{ getLanguageDisplayName(lang.code) }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Time Format</h4>
                    <p>Choose your time format</p>
                  </div>
                  <mat-form-field appearance="outline" class="time-format-select">
                    <mat-select formControlName="timeFormat" (selectionChange)="onTimeFormatChange($event)">
                      <mat-option value="12">12-hour</mat-option>
                      <mat-option value="24">24-hour</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Data Management -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>storage</mat-icon>
                Data Management
              </mat-card-title>
              <mat-card-subtitle>Manage your data and account</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="data-actions">
                <button mat-button class="action-btn" (click)="exportData()">
                  <mat-icon>download</mat-icon>
                  Export My Data
                </button>
                
                <button mat-button class="action-btn" (click)="clearData()">
                  <mat-icon>clear_all</mat-icon>
                  Clear All Data
                </button>
                
                <button mat-button class="action-btn danger" (click)="deleteAccount()">
                  <mat-icon>delete_forever</mat-icon>
                  Delete Account
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Account Security -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>lock</mat-icon>
                Account Security
              </mat-card-title>
              <mat-card-subtitle>Manage your account security</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="security-actions">
                <button mat-button class="action-btn" (click)="changePassword()">
                  <mat-icon>vpn_key</mat-icon>
                  Change Password
                </button>
                
                <button mat-button class="action-btn" (click)="enableTwoFactor()">
                  <mat-icon>security</mat-icon>
                  Enable Two-Factor Auth
                </button>
                
                <button mat-button class="action-btn" (click)="viewLoginHistory()">
                  <mat-icon>history</mat-icon>
                  Login History
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- About -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>info</mat-icon>
                About
              </mat-card-title>
              <mat-card-subtitle>App information and support</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="about-info">
                <div class="info-item">
                  <span class="info-label">Version</span>
                  <span class="info-value">1.0.0</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Updated</span>
                  <span class="info-value">{{ lastUpdated | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Support</span>
                  <span class="info-value">support&#64;goaltracker.com</span>
                </div>
              </div>
              
              <div class="about-actions">
                <button mat-button class="action-btn" (click)="openHelp()">
                  <mat-icon>help</mat-icon>
                  Help & Support
                </button>
                
                <button mat-button class="action-btn" (click)="openPrivacyPolicy()">
                  <mat-icon>privacy_tip</mat-icon>
                  Privacy Policy
                </button>
                
                <button mat-button class="action-btn" (click)="openTerms()">
                  <mat-icon>description</mat-icon>
                  Terms of Service
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </main>
    </div>
  `
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  userProfile: UserProfile | null = null;
  saving = false;
  loading = true;
  private authSubscription: Subscription;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private notificationManager: NotificationManagerService,
    private languageService: LanguageService,
    private snackBar: MatSnackBar,
    private dataExportService: DataExportService
  ) {
    this.settingsForm = this.fb.group({
      // Notification settings
      emailNotifications: [true],
      goalReminders: [true],
      milestoneCelebrations: [true],
      weeklyReports: [false],
      
      // Privacy settings
      profileVisible: [false],
      goalSharing: [false],
      analyticsSharing: [true],
      
      // Display settings
      theme: ['light'],
      language: ['en'],
      timeFormat: ['12']
    });

    this.authSubscription = this.supabaseService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    // Listen for theme changes to update form
    this.themeService.theme$.subscribe(theme => {
      if (this.settingsForm.get('theme')?.value !== theme) {
        this.settingsForm.patchValue({ theme });
      }
    });

    // Listen for language changes to update form
    this.languageService.language$.subscribe(language => {
      if (this.settingsForm.get('language')?.value !== language) {
        this.settingsForm.patchValue({ language });
      }
    });
  }

  ngOnInit() {
    this.loadUserSettings();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private async loadUserSettings() {
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
        this.populateSettings(profile);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      this.notificationService.error('Error', 'Failed to load settings', 5000);
    } finally {
      this.loading = false;
    }
  }

  private populateSettings(profile: UserProfile) {
    // Load notification settings from profile
    const notificationSettings = profile.notification_settings || {};
    const privacySettings = profile.privacy_settings || {};
    
    this.settingsForm.patchValue({
      emailNotifications: notificationSettings.emailNotifications ?? true,
      goalReminders: notificationSettings.goalReminders ?? true,
      milestoneCelebrations: notificationSettings.milestoneCelebrations ?? true,
      weeklyReports: notificationSettings.weeklyReports ?? false,
      
      profileVisible: privacySettings.profileVisible ?? false,
      goalSharing: privacySettings.goalSharing ?? false,
      analyticsSharing: privacySettings.analyticsSharing ?? true,
      
      theme: profile.theme || 'light',
      language: profile.language || 'en',
      timeFormat: profile.timeFormat || '12'
    });
  }

  async saveSettings() {
    if (!this.settingsForm.dirty) {
      return;
    }
    
    if (!this.userProfile) {
      return;
    }

    try {
      this.saving = true;
      const formValue = this.settingsForm.value;
      
      // Update theme immediately for better UX
      if (formValue.theme !== this.themeService.currentThemeValue) {
        this.themeService.setTheme(formValue.theme);
      }
      
      // Update language immediately
      if (formValue.language !== this.languageService.currentLanguageValue) {
        this.languageService.setLanguage(formValue.language);
      }
      
      // Update notification manager settings
      this.notificationManager.updateSettings({
        emailNotifications: formValue.emailNotifications,
        goalReminders: formValue.goalReminders,
        milestoneCelebrations: formValue.milestoneCelebrations,
        weeklyReports: formValue.weeklyReports
      });
      
      const updates: Partial<UserProfile> = {
        notification_settings: {
          emailNotifications: formValue.emailNotifications,
          goalReminders: formValue.goalReminders,
          milestoneCelebrations: formValue.milestoneCelebrations,
          weeklyReports: formValue.weeklyReports
        },
        privacy_settings: {
          profileVisible: formValue.profileVisible,
          goalSharing: formValue.goalSharing,
          analyticsSharing: formValue.analyticsSharing
        },
        theme: formValue.theme,
        language: formValue.language,
        timeFormat: formValue.timeFormat
      };
      
      await this.supabaseService.updateUserProfile(updates);
      
      this.notificationService.success(
        'Settings Saved', 
        'Your settings have been updated successfully!', 
        3000
      );
      
      // Reload settings to get updated data
      await this.loadUserSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      this.notificationService.error(
        'Error', 
        'Failed to save settings. Please try again.', 
        5000
      );
    } finally {
      this.saving = false;
    }
  }

  changePassword() {
    this.router.navigate(['/reset-password']);
  }

  async exportData() {
    try {
      this.notificationService.info('Exporting Data', 'Preparing your data for export...', 2000);
      
      const data = await this.dataExportService.exportUserData();
      this.dataExportService.downloadDataAsJSON(data);
      
      this.notificationService.success(
        'Data Exported', 
        'Your data has been exported successfully!', 
        3000
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      this.notificationService.error(
        'Export Failed', 
        'Failed to export data. Please try again.', 
        5000
      );
    }
  }

  async clearData() {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      try {
        this.notificationService.info('Clearing Data', 'Clearing all your data...', 2000);
        
        await this.dataExportService.clearAllUserData();
        
        this.notificationService.success(
          'Data Cleared', 
          'All your data has been cleared successfully!', 
          3000
        );
      } catch (error) {
        console.error('Error clearing data:', error);
        this.notificationService.error(
          'Clear Failed', 
          'Failed to clear data. Please try again.', 
          5000
        );
      }
    }
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

  enableTwoFactor() {
    // TODO: Implement two-factor authentication
    this.notificationService.info(
      'Coming Soon', 
      'Two-factor authentication will be available soon!', 
      3000
    );
  }

  viewLoginHistory() {
    // TODO: Implement login history
    this.notificationService.info(
      'Coming Soon', 
      'Login history feature will be available soon!', 
      3000
    );
  }

  openHelp() {
    // TODO: Open help documentation
    this.notificationService.info(
      'Help', 
      'Help documentation will be available soon!', 
      3000
    );
  }

  openPrivacyPolicy() {
    // TODO: Open privacy policy
    this.notificationService.info(
      'Privacy Policy', 
      'Privacy policy will be available soon!', 
      3000
    );
  }

  openTerms() {
    // TODO: Open terms of service
    this.notificationService.info(
      'Terms of Service', 
      'Terms of service will be available soon!', 
      3000
    );
  }

  goBack() {
    this.router.navigate(['/']);
  }

  get lastUpdated(): string {
    return this.userProfile?.updated_at || '';
  }

  // Real-time theme preview
  onThemeChange(event: any) {
    const newTheme = event.value;
    this.themeService.setTheme(newTheme);
  }

  // Real-time language change
  onLanguageChange(event: any) {
    const newLanguage = event.value;
    this.languageService.setLanguage(newLanguage);
  }

  // Real-time time format change
  onTimeFormatChange(event: any) {
    const newTimeFormat = event.value;
    // Update time format display throughout the app
    localStorage.setItem('timeFormat', newTimeFormat);
  }

  // Get available languages for the select
  get availableLanguages() {
    return this.languageService.availableLanguages;
  }

  // Get language display name
  getLanguageDisplayName(code: string): string {
    const lang = this.languageService.getLanguageConfig(code as any);
    return lang ? `${lang.flag} ${lang.nativeName}` : code;
  }
} 