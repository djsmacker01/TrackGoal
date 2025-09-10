import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { SeoService } from './services/seo.service';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { OfflineModeComponent } from './components/offline-mode/offline-mode.component';
import { SupabaseService } from './services/supabase.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingSpinnerComponent, OfflineModeComponent],
  template: `
    <div class="app-container">
      <div *ngIf="isLoading" class="loading-overlay">
        <app-loading-spinner></app-loading-spinner>
      </div>
      <app-offline-mode *ngIf="isOfflineMode"></app-offline-mode>
      <router-outlet *ngIf="!isOfflineMode"></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--gradient-primary);
      background-attachment: fixed;
      position: relative;
      color: var(--text-primary);
      transition: background-color 0.3s ease, color 0.3s ease;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-pattern);
        pointer-events: none;
      }
    }
    
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }
  `]
})
export class AppComponent implements OnInit {
  isLoading = false;
  isOfflineMode = false;

  constructor(
    private themeService: ThemeService,
    private seoService: SeoService,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Theme service is initialized in constructor
    // This ensures theme is applied on app startup
    
    // Check if Supabase is available
    try {
      this.supabaseService.client;
      this.isOfflineMode = false;
    } catch (error) {
      console.warn('Supabase not available, running in offline mode');
      this.isOfflineMode = true;
    }
    
    // Set up loading state for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.isLoading = true;
    });
    
    // Set up SEO for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoading = false;
      this.updateSEOForCurrentRoute();
    });
    
    // Set initial SEO
    this.updateSEOForCurrentRoute();
  }

  private updateSEOForCurrentRoute(): void {
    const currentUrl = this.router.url;
    
    if (currentUrl === '/') {
      this.seoService.setDashboardSEO();
    } else if (currentUrl === '/goals-list') {
      this.seoService.setGoalsListSEO();
    } else if (currentUrl === '/analytics') {
      this.seoService.setAnalyticsSEO();
    } else if (currentUrl === '/login') {
      this.seoService.setLoginSEO();
    } else if (currentUrl === '/signup') {
      this.seoService.setSignupSEO();
    } else if (currentUrl.startsWith('/goal-detail/')) {
      // For goal detail pages, we'll need to get the goal data
      // This will be handled in the goal detail component
      this.seoService.updateSEO({
        title: 'Goal Details - TrackGoal',
        description: 'View and manage your goal progress and milestones.',
        keywords: 'goal details, goal tracking, progress management, milestone tracking'
      });
    } else {
      // Default SEO for other pages
      this.seoService.updateSEO();
    }
  }
} 