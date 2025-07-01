import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Goal, Category, Progress } from '../../goal.model';
import { GoalService } from '../../services/goal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressBarModule, MatIconModule, MatChipsModule],
  styleUrls: ['./dashboard.component.scss'],
  template: `
    <div class="dashboard-container">
      <!-- Header with gradient background -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <div class="app-brand">
              <div class="brand-icon">🎯</div>
              <h1 class="app-title">GoalTracker</h1>
            </div>
            <p class="app-subtitle">Transform your dreams into achievements</p>
          </div>
          <nav class="nav">
            <button mat-icon-button class="nav-btn" aria-label="Categories" (click)="navigateToCategories()">
              <mat-icon>category</mat-icon>
            </button>
            <button mat-icon-button class="nav-btn" aria-label="Analytics" (click)="navigateToAnalytics()">
              <mat-icon>analytics</mat-icon>
            </button>
            <button mat-icon-button class="nav-btn" aria-label="Notifications">
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button class="nav-btn" aria-label="Settings">
              <mat-icon>settings</mat-icon>
            </button>
            <div class="user-avatar">
              <span>👤</span>
            </div>
            <button mat-icon-button class="nav-btn" aria-label="Add Goal" (click)="navigateToAddGoal()">
              <mat-icon>add</mat-icon>
            </button>
          </nav>
        </div>
      </header>

      <!-- Main content area -->
      <main class="main-content">
        <!-- Welcome section with animated greeting -->
        <section class="welcome-section">
          <div class="welcome-card">
            <div class="welcome-content">
              <h2 class="welcome-title">Welcome back, Alex! 👋</h2>
              <p class="welcome-subtitle">You're making incredible progress. Keep up the momentum!</p>
              <div class="motivation-badge">
                <span class="badge-icon">🔥</span>
                <span class="badge-text">On Fire Streak</span>
              </div>
            </div>
            <div class="welcome-illustration">
              <div class="floating-elements">
                <div class="floating-icon">⭐</div>
                <div class="floating-icon">💪</div>
                <div class="floating-icon">🚀</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Enhanced stats section -->
        <section class="stats-section">
          <div class="stats-grid">
            <mat-card class="stat-card stat-primary">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">4</div>
                <div class="stat-label">Active Goals</div>
                <div class="stat-trend positive">+2 this month</div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-success">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">2</div>
                <div class="stat-label">Completed This Week</div>
                <div class="stat-trend positive">+50% vs last week</div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-warning">
              <div class="stat-icon">🔥</div>
              <div class="stat-content">
                <div class="stat-value">5</div>
                <div class="stat-label">Day Streak</div>
                <div class="stat-trend positive">Personal best!</div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-info">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value">78%</div>
                <div class="stat-label">Overall Progress</div>
                <div class="stat-trend positive">+12% this week</div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-analytics" (click)="navigateToAnalytics()">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">View</div>
                <div class="stat-label">Analytics</div>
                <div class="stat-trend positive">Detailed insights</div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-categories" (click)="navigateToCategories()">
              <div class="stat-icon">📂</div>
              <div class="stat-content">
                <div class="stat-value">View</div>
                <div class="stat-label">Categories</div>
                <div class="stat-trend positive">Organized view</div>
              </div>
            </mat-card>
          </div>
        </section>

        <!-- Enhanced goals section -->
        <section class="goals-section">
          <div class="section-header">
            <h3 class="section-title">Your Active Goals</h3>
            <div class="section-actions">
              <button mat-button class="view-all-btn" (click)="navigateToGoalsList()">
                <mat-icon>list</mat-icon>
                View All Goals
              </button>
              <button mat-button class="add-goal-btn" (click)="navigateToAddGoal()">
                <mat-icon>add</mat-icon>
                Add Goal
              </button>
            </div>
          </div>
          <div class="goals-grid">
            <mat-card *ngFor="let goal of goals; let i = index" class="goal-card" [ngClass]="'goal-' + goal.category.toLowerCase()" tabindex="0">
              <div class="goal-header">
                <div class="goal-info">
                  <h4 class="goal-title">{{ goal.title }}</h4>
                  <mat-chip [ngClass]="'category-chip cat-' + goal.category.toLowerCase()">
                    <span class="chip-icon">{{ getCategoryIcon(goal.category) }}</span>
                    {{ goal.category }}
                  </mat-chip>
                </div>
                <div class="goal-actions">
                  <button mat-icon-button class="action-btn" aria-label="Edit goal">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button class="action-btn" aria-label="More options">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </div>
              </div>
              
              <div class="goal-progress-section">
                <div class="progress-header">
                  <span class="progress-label">Progress</span>
                  <span class="progress-percentage">{{ goal.progress.percent }}%</span>
                </div>
                <div class="progress-container">
                  <mat-progress-bar 
                    [value]="goal.progress.percent" 
                    [ngClass]="'progress-' + goal.category.toLowerCase()"
                    class="custom-progress-bar">
                  </mat-progress-bar>
                </div>
              </div>

              <div class="goal-milestone">
                <div class="milestone-preview">
                  <mat-icon class="milestone-icon">flag</mat-icon>
                  <span class="milestone-text">Next: {{ goal.nextMilestone }}</span>
                </div>
              </div>

              <div class="milestones-section">
                <div class="milestones-header">
                  <h5 class="milestones-title">Milestones</h5>
                  <span class="milestones-count">{{ getCompletedMilestones(goal.milestones) }}/{{ goal.milestones.length }}</span>
                </div>
                <div class="milestones-list">
                  <div *ngFor="let milestone of goal.milestones" class="milestone-item" [ngClass]="{ 'completed': milestone.completed }">
                    <div class="milestone-checkbox">
                      <div class="checkbox-inner" [ngClass]="{ 'checked': milestone.completed }">
                        <mat-icon *ngIf="milestone.completed" class="check-icon">check</mat-icon>
                      </div>
                    </div>
                    <span class="milestone-title">{{ milestone.title }}</span>
                  </div>
                </div>
              </div>
            </mat-card>
          </div>
        </section>

        <!-- Enhanced activity section -->
        <section class="activity-section">
          <div class="section-header">
            <h3 class="section-title">Recent Activity</h3>
            <button mat-button class="view-all-btn">View All</button>
          </div>
          <mat-card class="activity-card">
            <div class="activity-list">
              <div *ngFor="let activity of recentActivity; let i = index" class="activity-item" [ngClass]="'activity-' + (i % 4)">
                <div class="activity-icon">
                  <mat-icon>{{ getActivityIcon(activity) }}</mat-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-text">{{ activity }}</p>
                  <span class="activity-time">{{ getActivityTime(i) }}</span>
                </div>
              </div>
            </div>
          </mat-card>
        </section>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private goalsSubscription!: Subscription;
  private recentActivitySubscription!: Subscription;

  constructor(private router: Router, private goalService: GoalService) {}
  
  goals: Goal[] = [];
  recentActivity: string[] = [];

  ngOnInit() {
    this.goalsSubscription = this.goalService.goals$.subscribe(goals => {
      this.goals = goals;
    });

    this.recentActivitySubscription = this.goalService.recentActivity$.subscribe(activity => {
      this.recentActivity = activity;
    });
  }

  ngOnDestroy() {
    this.goalsSubscription.unsubscribe();
    this.recentActivitySubscription.unsubscribe();
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Health': '🏃‍♂️',
      'Career': '💼',
      'Personal': '📚',
      'Financial': '💰',
      'Habits': '🔄'
    };
    return icons[category] || '🎯';
  }

  getActivityIcon(activity: string): string {
    if (activity.includes('run')) {
      return 'directions_run';
    }
    if (activity.includes('Read')) {
      return 'book';
    }
    if (activity.includes('Saved')) {
      return 'account_balance_wallet';
    }
    if (activity.includes('meeting')) {
      return 'groups';
    }
    return 'check_circle';
  }

  getActivityTime(index: number): string {
    const times = ['2 hours ago', '4 hours ago', '1 day ago', '2 days ago'];
    return times[index] || 'Recently';
  }

  getCompletedMilestones(milestones: any[]): number {
    return milestones.filter(m => m.completed).length;
  }

  navigateToAddGoal() {
    this.router.navigate(['/add-goal']);
  }

  navigateToGoalsList() {
    this.router.navigate(['/goals-list']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/analytics']);
  }

  navigateToCategories() {
    this.router.navigate(['/categories']);
  }
} 