import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      // Wait a bit for auth to be initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Wait for the session to be initialized
      const session = await this.supabaseService.client.auth.getSession();
      const user = session.data.session?.user;
      
      if (!user) {
        console.log('No authenticated user found, redirecting to login');
        this.router.navigate(['/login']);
        return false;
      }

      console.log('User authenticated:', user.email);

      // Check if user has completed onboarding
      const profile = await this.supabaseService.getUserProfile();
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      
      console.log('User profile:', profile);
      console.log('Onboarding complete from localStorage:', onboardingComplete);
      
      const profileOnboardingComplete = profile?.onboarding_completed || false;
      const localStorageOnboardingComplete = onboardingComplete || false;
      const needsOnboarding = !profileOnboardingComplete && !localStorageOnboardingComplete;
      
      if (needsOnboarding) {
        console.log('User needs onboarding, redirecting to onboarding');
        this.router.navigate(['/onboarding']);
        return false;
      }
      
      console.log('User can access protected route');
      return true;
    } catch (error) {
      console.error('Error in auth guard:', error);
      // If there's an error, redirect to login
      this.router.navigate(['/login']);
      return false;
    }
  }
} 