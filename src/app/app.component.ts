import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { SeoService } from './services/seo.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
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
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit() {
    // Theme service is initialized in constructor
    // This ensures theme is applied on app startup
    
    // Set up SEO for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
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