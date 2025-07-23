import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-test-supabase',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Supabase Connection Test</mat-card-title>
          <mat-card-subtitle>Test your Supabase configuration</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="test-section">
            <h3>Database Connection</h3>
            <button mat-raised-button color="primary" (click)="testConnection()" [disabled]="isTesting">
              <mat-icon>wifi</mat-icon>
              Test Connection
            </button>
            <div *ngIf="connectionResult" class="result" [ngClass]="connectionResult.success ? 'success' : 'error'">
              {{ connectionResult.message }}
            </div>
          </div>

          <div class="test-section">
            <h3>Authentication Test</h3>
            <button mat-raised-button color="accent" (click)="testSignUp()" [disabled]="isTesting">
              <mat-icon>person_add</mat-icon>
              Test Sign Up (with test email)
            </button>
            <button mat-raised-button color="primary" (click)="testSignUpWithRealEmail()" [disabled]="isTesting">
              <mat-icon>email</mat-icon>
              Test Sign Up (with your email)
            </button>
            <button mat-raised-button color="primary" (click)="testSignIn()" [disabled]="isTesting">
              <mat-icon>login</mat-icon>
              Test Sign In
            </button>
            <button mat-raised-button color="warn" (click)="testSignOut()" [disabled]="isTesting">
              <mat-icon>logout</mat-icon>
              Test Sign Out
            </button>
            <div *ngIf="authResult" class="result" [ngClass]="authResult.success ? 'success' : 'error'">
              {{ authResult.message }}
            </div>
          </div>

          <div class="test-section">
            <h3>Email Verification Test</h3>
            <button mat-raised-button color="warn" (click)="testEmailVerification()" [disabled]="isTesting">
              <mat-icon>email</mat-icon>
              Test Email Verification
            </button>
            <div *ngIf="emailResult" class="result" [ngClass]="emailResult.success ? 'success' : 'error'">
              {{ emailResult.message }}
            </div>
          </div>

          <div class="test-section">
            <h3>Goals CRUD Test</h3>
            <button mat-raised-button color="primary" (click)="testGoalsCRUD()" [disabled]="isTesting">
              <mat-icon>list</mat-icon>
              Test Goals CRUD
            </button>
            <div *ngIf="goalsResult" class="result" [ngClass]="goalsResult.success ? 'success' : 'error'">
              {{ goalsResult.message }}
            </div>
          </div>

          <div class="test-section">
            <h3>Current User</h3>
            <div *ngIf="currentUser" class="user-info">
              <p><strong>Email:</strong> {{ currentUser.email }}</p>
              <p><strong>ID:</strong> {{ currentUser.id }}</p>
              <p><strong>Email Confirmed:</strong> {{ currentUser.email_confirmed_at ? 'Yes' : 'No' }}</p>
            </div>
            <div *ngIf="!currentUser" class="no-user">
              No user currently signed in
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .test-card {
      margin-bottom: 2rem;
    }
    
    .test-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    
    .test-section h3 {
      margin-top: 0;
      color: #333;
    }
    
    .result {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .result.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .result.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .user-info {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }
    
    .user-info p {
      margin: 0.25rem 0;
    }
    
    .no-user {
      color: #6c757d;
      font-style: italic;
    }
    
    button {
      margin-right: 1rem;
    }
  `]
})
export class TestSupabaseComponent {
  isTesting = false;
  connectionResult: any = null;
  authResult: any = null;
  emailResult: any = null;
  goalsResult: any = null;
  currentUser: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    try {
      this.currentUser = await this.supabaseService.getCurrentUser();
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  async testConnection() {
    this.isTesting = true;
    this.connectionResult = null;
    
    try {
      const result = await this.supabaseService.testConnection();
      this.connectionResult = {
        success: result,
        message: result ? 'Database connection successful!' : 'Database connection failed!'
      };
    } catch (error) {
      console.error('Connection test error:', error);
      this.connectionResult = {
        success: false,
        message: `Connection failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }

  async testSignUp() {
    this.isTesting = true;
    this.authResult = null;
    
    try {
      // Generate a unique test email with a valid domain
      const testEmail = `test-${Date.now()}@gmail.com`;
      const testPassword = 'TestPassword123!';
      
      console.log('Testing signup with email:', testEmail);
      
      const result = await this.authService.signUp(testEmail, testPassword);
      
      if (result.success) {
        this.authResult = {
          success: true,
          message: `Signup successful! Check your email (${testEmail}) for verification.`
        };
        
        // Update current user
        await this.loadCurrentUser();
        
        this.notificationService.success(
          'Signup Test Successful',
          `Test account created with email: ${testEmail}`,
          5000
        );
      } else {
        this.authResult = {
          success: false,
          message: `Signup failed: ${result.error?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Signup test error:', error);
      this.authResult = {
        success: false,
        message: `Signup test failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }

  async testSignUpWithRealEmail() {
    this.isTesting = true;
    this.authResult = null;
    
    try {
      // Prompt user for their real email
      const userEmail = prompt('Enter your real email address for testing:');
      
      if (!userEmail) {
        this.authResult = {
          success: false,
          message: 'No email provided. Test cancelled.'
        };
        return;
      }
      
      const testPassword = 'TestPassword123!';
      
      console.log('Testing signup with real email:', userEmail);
      
      const result = await this.authService.signUp(userEmail, testPassword);
      
      if (result.success) {
        // Try to sign in immediately after signup
        console.log('Attempting to sign in after signup...');
        const signInResult = await this.authService.signIn(userEmail, testPassword);
        
        if (signInResult.success) {
          this.authResult = {
            success: true,
            message: `Signup and sign-in successful! You are now signed in as ${userEmail}. Check your email for verification.`
          };
        } else {
          this.authResult = {
            success: true,
            message: `Signup successful! Check your email (${userEmail}) for verification. You may need to verify your email before signing in.`
          };
        }
        
        // Update current user
        await this.loadCurrentUser();
        
        this.notificationService.success(
          'Signup Test Successful',
          `Test account created with email: ${userEmail}`,
          5000
        );
      } else {
        this.authResult = {
          success: false,
          message: `Signup failed: ${result.error?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Signup test error:', error);
      this.authResult = {
        success: false,
        message: `Signup test failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }

  async testSignIn() {
    this.isTesting = true;
    this.authResult = null;
    
    try {
      const userEmail = prompt('Enter your email address to sign in:');
      
      if (!userEmail) {
        this.authResult = {
          success: false,
          message: 'No email provided. Sign-in cancelled.'
        };
        return;
      }
      
      const password = prompt('Enter your password:');
      
      if (!password) {
        this.authResult = {
          success: false,
          message: 'No password provided. Sign-in cancelled.'
        };
        return;
      }
      
      console.log('Testing sign in with email:', userEmail);
      
      const result = await this.authService.signIn(userEmail, password);
      
      if (result.success) {
        this.authResult = {
          success: true,
          message: `Sign-in successful! You are now signed in as ${userEmail}.`
        };
        
        // Update current user
        await this.loadCurrentUser();
        
        this.notificationService.success(
          'Sign-in Successful',
          `Signed in as ${userEmail}`,
          3000
        );
      } else {
        this.authResult = {
          success: false,
          message: `Sign-in failed: ${result.error?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Sign-in test error:', error);
      this.authResult = {
        success: false,
        message: `Sign-in test failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }

  async testSignOut() {
    this.isTesting = true;
    this.authResult = null;
    
    try {
      console.log('Testing sign out...');
      
      const result = await this.authService.signOut();
      
      if (result.success) {
        this.authResult = {
          success: true,
          message: 'Sign-out successful! You are now signed out.'
        };
        
        // Update current user
        await this.loadCurrentUser();
        
        this.notificationService.success(
          'Sign-out Successful',
          'You have been signed out',
          3000
        );
      } else {
        this.authResult = {
          success: false,
          message: `Sign-out failed: ${result.error?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Sign-out test error:', error);
      this.authResult = {
        success: false,
        message: `Sign-out test failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }

  async testEmailVerification() {
    this.isTesting = true;
    this.emailResult = null;
    
    try {
      // Get current user
      const user = await this.supabaseService.getCurrentUser();
      
      if (!user?.email) {
        this.emailResult = {
          success: false,
          message: 'No user signed in. Please sign up first using one of the signup buttons above.'
        };
        return;
      }
      
      console.log('Testing email verification for:', user.email);
      
      // Try to resend verification email
      const result = await this.authService.resendEmailVerification();
      
      if (result.success) {
        this.emailResult = {
          success: true,
          message: `Verification email sent to ${user.email}. Check your inbox and spam folder.`
        };
        
        this.notificationService.success(
          'Email Sent',
          `Verification email sent to ${user.email}`,
          5000
        );
      } else {
        this.emailResult = {
          success: false,
          message: `Failed to send verification email: ${result.error?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Email verification test error:', error);
      this.emailResult = {
        success: false,
        message: `Email verification test failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }

  async testGoalsCRUD() {
    this.isTesting = true;
    this.goalsResult = null;
    
    try {
      // Check if user is authenticated first
      const user = await this.supabaseService.getCurrentUser();
      
      if (!user) {
        this.goalsResult = {
          success: false,
          message: 'No authenticated user. Please sign up first using one of the signup buttons above.'
        };
        return;
      }
      
      // Test creating a goal
      const testGoal = {
        title: 'Test Goal',
        description: 'This is a test goal',
        category: 'Personal' as const,
        goal_type: 'binary' as const,
        status: 'active' as const
      };
      
      const createdGoal = await this.supabaseService.createGoal(testGoal);
      console.log('Created goal:', createdGoal);
      
      // Test reading goals
      const goals = await this.supabaseService.getGoals();
      console.log('Retrieved goals:', goals);
      
      // Test updating goal
      const updatedGoal = await this.supabaseService.updateGoal(createdGoal.id, {
        title: 'Updated Test Goal'
      });
      console.log('Updated goal:', updatedGoal);
      
      // Test deleting goal
      await this.supabaseService.deleteGoal(createdGoal.id);
      console.log('Deleted goal');
      
      this.goalsResult = {
        success: true,
        message: 'Goals CRUD operations successful! Created, read, updated, and deleted a test goal.'
      };
      
      this.notificationService.success(
        'Goals Test Successful',
        'All CRUD operations completed successfully!',
        3000
      );
    } catch (error) {
      console.error('Goals CRUD test error:', error);
      this.goalsResult = {
        success: false,
        message: `Goals CRUD test failed: ${error}`
      };
    } finally {
      this.isTesting = false;
    }
  }
} 