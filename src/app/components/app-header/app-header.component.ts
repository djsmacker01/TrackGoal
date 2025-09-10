import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="app-header">
      <div class="header-content">
        <!-- TrackGoal Logo and Title -->
        <div class="logo-section" routerLink="/">
          <img src="/logo-large.svg" alt="TrackGoal Logo" class="logo">
        </div>
        
        <!-- Navigation Menu -->
        <nav class="nav-menu">
          <button mat-button routerLink="/" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          <button mat-button routerLink="/goals-list" routerLinkActive="active">
            <mat-icon>list</mat-icon>
            Goals
          </button>
          <button mat-button routerLink="/analytics" routerLinkActive="active">
            <mat-icon>analytics</mat-icon>
            Analytics
          </button>
        </nav>
        
        <!-- User Menu -->
        <div class="user-section">
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              Profile
            </button>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              Settings
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
      color: white;
    }
    
    .logo {
      height: 40px;
      width: auto;
    }
    
    .nav-menu {
      display: flex;
      gap: 8px;
    }
    
    .nav-menu button {
      color: white;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }
    
    .nav-menu button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .nav-menu button.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .user-section button {
      color: white;
    }
    
    .user-section button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 0 8px;
      }
      
      
      .nav-menu {
        display: none;
      }
      
      .logo {
        height: 32px;
        width: auto;
      }
    }
  `]
})
export class AppHeaderComponent {
  logout() {
    // Implement logout logic here
    console.log('Logout clicked');
  }
}
