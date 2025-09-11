import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    badge?: number;
}

@Component({
    selector: 'app-mobile-navigation',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
    template: `
    <nav class="mobile-nav" *ngIf="isMobile">
      <div class="nav-items">
        <a 
          *ngFor="let item of navItems" 
          [routerLink]="item.route"
          class="nav-item"
          [class.active]="isActiveRoute(item.route)"
          (click)="onNavClick(item)"
        >
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
          <span *ngIf="item.badge && item.badge > 0" class="nav-badge">{{ item.badge }}</span>
        </a>
      </div>
    </nav>
  `,
    styles: [`
    .mobile-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding: 8px 0;
      z-index: 1000;
      display: none;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    }

    .nav-items {
      display: flex;
      justify-content: space-around;
      align-items: center;
      max-width: 600px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-radius: 12px;
      transition: all 0.2s ease;
      color: var(--text-secondary);
      text-decoration: none;
      min-width: 60px;
      position: relative;
      cursor: pointer;
      
      &:active {
        transform: scale(0.95);
      }
      
      &.active {
        color: var(--primary-color);
        background: rgba(102, 126, 234, 0.1);
      }
      
      .nav-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      
      .nav-label {
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
      }
      
      .nav-badge {
        position: absolute;
        top: 4px;
        right: 8px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        min-width: 18px;
      }
    }

    @media (max-width: 768px) {
      .mobile-nav {
        display: block;
      }
    }

    /* Dark theme support */
    [data-theme="dark"] .mobile-nav {
      background: rgba(26, 32, 44, 0.95);
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    [data-theme="dark"] .nav-item {
      color: var(--text-secondary);
      
      &.active {
        color: var(--primary-color);
        background: rgba(102, 126, 234, 0.2);
      }
    }
  `]
})
export class MobileNavigationComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    isMobile = false;
    currentRoute = '';

    navItems: NavItem[] = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Goals', icon: 'flag', route: '/goals' },
        { label: 'Categories', icon: 'category', route: '/categories' },
        { label: 'Analytics', icon: 'analytics', route: '/analytics' },
        { label: 'Profile', icon: 'person', route: '/profile' }
    ];

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.checkMobile();
        this.trackRouteChanges();

        // Listen for window resize events
        window.addEventListener('resize', () => this.checkMobile());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        window.removeEventListener('resize', () => this.checkMobile());
    }

    private checkMobile(): void {
        this.isMobile = window.innerWidth <= 768;
    }

    private trackRouteChanges(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event: NavigationEnd) => {
                this.currentRoute = event.url;
            });
    }

    isActiveRoute(route: string): boolean {
        return this.currentRoute.startsWith(route);
    }

    onNavClick(item: NavItem): void {
        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Track navigation for analytics
        console.log(`Mobile nav: Navigated to ${item.label}`);
    }
}
