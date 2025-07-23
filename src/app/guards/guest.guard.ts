import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const user = this.supabaseService.currentUserValue;
    
    if (user) {
      // User is already authenticated, redirect to dashboard
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
} 