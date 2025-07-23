import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="auth-test-container">
      <mat-card class="auth-test-card">
        <mat-card-header>
          <mat-card-title>Authentication Test</mat-card-title>
          <mat-card-subtitle>Test signup and login functionality</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="test-section">
            <h3>Sign Up Test</h3>
            <form [formGroup]="signupForm" (ngSubmit)="testSignup()">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="test@example.com">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="password123">
              </mat-form-field>
              
              <button type="submit" mat-raised-button color="primary" [disabled]="signupForm.invalid">
                Test Sign Up
              </button>
            </form>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="test-section">
            <h3>Sign In Test</h3>
            <form [formGroup]="loginForm" (ngSubmit)="testLogin()">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="test@example.com">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="password123">
              </mat-form-field>
              
              <button type="submit" mat-raised-button color="accent" [disabled]="loginForm.invalid">
                Test Sign In
              </button>
            </form>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="test-section">
            <h3>Current Auth State</h3>
            <div class="auth-state">
              <p><strong>Authenticated:</strong> {{ authState.isAuthenticated ? 'Yes' : 'No' }}</p>
              <p><strong>User ID:</strong> {{ authState.user?.id || 'None' }}</p>
              <p><strong>Email:</strong> {{ authState.user?.email || 'None' }}</p>
            </div>
            
            <button mat-raised-button color="warn" (click)="testSignOut()" 
                    [disabled]="!authState.isAuthenticated">
              Test Sign Out
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-test-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .auth-test-card {
      margin-bottom: 20px;
    }
    
    .test-section {
      margin: 20px 0;
    }
    
    .form-field {
      width: 100%;
      margin-bottom: 10px;
    }
    
    .auth-state {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    .auth-state p {
      margin: 5px 0;
    }
  `]
})
export class AuthTestComponent {
  signupForm!: FormGroup;
  loginForm!: FormGroup;
  authState: { isAuthenticated: boolean; user: any } = { isAuthenticated: false, user: null };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.initForms();
    this.subscribeToAuthState();
  }

  private initForms() {
    this.signupForm = this.fb.group({
      email: ['test@example.com', [Validators.required, Validators.email]],
      password: ['password123', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm = this.fb.group({
      email: ['test@example.com', [Validators.required, Validators.email]],
      password: ['password123', [Validators.required]]
    });
  }

  private subscribeToAuthState() {
    this.authService.authState$.subscribe(state => {
      this.authState = {
        isAuthenticated: state.isAuthenticated,
        user: state.user
      };
    });
  }

  async testSignup() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;
      
      try {
        const result = await this.authService.signUp(email, password);
        
        if (result.success) {
          this.notificationService.success('Signup Test', 'User created successfully!', 3000);
        } else {
          this.notificationService.error('Signup Test', result.error?.message || 'Signup failed', 3000);
        }
      } catch (error) {
        this.notificationService.error('Signup Test', 'An error occurred during signup', 3000);
      }
    }
  }

  async testLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      try {
        const result = await this.authService.signIn(email, password);
        
        if (result.success) {
          this.notificationService.success('Login Test', 'User signed in successfully!', 3000);
        } else {
          this.notificationService.error('Login Test', result.error?.message || 'Login failed', 3000);
        }
      } catch (error) {
        this.notificationService.error('Login Test', 'An error occurred during login', 3000);
      }
    }
  }

  async testSignOut() {
    try {
      await this.authService.signOut();
      this.notificationService.success('Signout Test', 'User signed out successfully!', 3000);
    } catch (error) {
      this.notificationService.error('Signout Test', 'An error occurred during signout', 3000);
    }
  }
} 