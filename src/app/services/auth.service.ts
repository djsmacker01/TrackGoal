import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.initializeAuth();
  }

  get authState$(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  get currentUser(): any | null {
    return this.authState.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  get isLoading(): boolean {
    return this.authState.value.isLoading;
  }

  private initializeAuth() {
    // Subscribe to Supabase auth changes
    this.supabaseService.user$.subscribe(user => {
      this.authState.next({
        isAuthenticated: !!user,
        user: user,
        isLoading: false
      });

      console.log('Auth state updated:', { user, isAuthenticated: !!user });
    });
  }

  async signUp(email: string, password: string, metadata?: any): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      const response = await this.supabaseService.signUp(email, password);
      
      if (response.error) {
        const error = this.parseSupabaseError(response.error);
        return { success: false, error };
      }

      // If signup is successful and we have metadata, create a user profile
      if (response.data.user && metadata) {
        try {
          // Create user profile
          await this.supabaseService.createUserProfile(response.data.user.id);
          
          // Update the profile with metadata
          const profileData: any = {};
          if (metadata.display_name) profileData.display_name = metadata.display_name;
          if (metadata.first_name) profileData.first_name = metadata.first_name;
          if (metadata.last_name) profileData.last_name = metadata.last_name;
          
          if (Object.keys(profileData).length > 0) {
            await this.supabaseService.updateUserProfile(profileData);
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }
      
      this.notificationService.success(
        'Account Created', 
        'Welcome to TrackGoal! Please check your email to confirm your account.', 
        5000
      );
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during signup' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      const response = await this.supabaseService.signIn(email, password);
      
      if (response.error) {
        const error = this.parseSupabaseError(response.error);
        return { success: false, error };
      }
      
      this.notificationService.success(
        'Welcome Back', 
        'You have been successfully signed in.', 
        3000
      );
      
      return { success: true };
    } catch (error) {
      console.error('Signin error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during sign in' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  async signOut(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      await this.supabaseService.signOut();
      
      // Clear local storage
      localStorage.removeItem('userProfile');
      localStorage.removeItem('onboardingComplete');
      
      this.notificationService.success(
        'Signed Out', 
        'You have been successfully signed out.', 
        3000
      );
      
      this.router.navigate(['/login']);
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      return { 
        success: false, 
        error: { message: 'Failed to sign out. Please try again.' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      const response = await this.supabaseService.resetPassword(email);
      
      if (response.error) {
        const error = this.parseSupabaseError(response.error);
        return { success: false, error };
      }
      
      this.notificationService.success(
        'Reset Email Sent', 
        'Please check your email for password reset instructions.', 
        5000
      );
      
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during password reset' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      const response = await this.supabaseService.updatePassword(newPassword);
      
      if (response.error) {
        const error = this.parseSupabaseError(response.error);
        return { success: false, error };
      }
      
      this.notificationService.success(
        'Password Updated', 
        'Your password has been successfully updated.', 
        3000
      );
      
      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during password update' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      return await this.supabaseService.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await this.supabaseService.completeOnboarding();
      localStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
      console.error('Onboarding completion error:', error);
      throw error;
    }
  }

  isOnboardingComplete(): boolean {
    return localStorage.getItem('onboardingComplete') === 'true';
  }

  async verifyEmail(token: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      // Get current user to get email
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      
      if (!user?.email) {
        return { 
          success: false, 
          error: { message: 'No email address found for the current user' }
        };
      }
      
      const response = await this.supabaseService.client.auth.verifyOtp({
        type: 'email',
        email: user.email,
        token: token
      });
      
      if (response.error) {
        const error = this.parseSupabaseError(response.error);
        return { success: false, error };
      }
      
      this.notificationService.success(
        'Email Verified', 
        'Your email has been successfully verified!', 
        3000
      );
      
      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during email verification' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  async resendEmailVerification(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.setLoading(true);
      
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      
      if (!user?.email) {
        return { 
          success: false, 
          error: { message: 'No email address found for the current user' }
        };
      }
      
      const response = await this.supabaseService.client.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (response.error) {
        const error = this.parseSupabaseError(response.error);
        return { success: false, error };
      }
      
      this.notificationService.success(
        'Email Sent', 
        'Verification email has been resent. Check your inbox.', 
        3000
      );
      
      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred while resending verification email' }
      };
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(isLoading: boolean) {
    this.authState.next({
      ...this.authState.value,
      isLoading
    });
  }

  private parseSupabaseError(error: any): AuthError {
    // Common Supabase auth error messages
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please check your email and confirm your account',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long',
      'Unable to validate email address': 'Please enter a valid email address',
      'Signup is disabled': 'Signup is currently disabled',
      'Too many requests': 'Too many attempts. Please try again later',
      'Invalid email': 'Please enter a valid email address',
      'User not found': 'No account found with this email address'
    };

    const message = errorMessages[error.message] || error.message || 'An authentication error occurred';
    
    return {
      message,
      code: error.status || error.code
    };
  }
} 