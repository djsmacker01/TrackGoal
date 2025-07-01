import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Goal, Category, Progress } from '../goal.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgClass, MatCardModule, MatButtonModule, MatProgressBarModule, MatIconModule, MatChipsModule],
  styleUrls: ['./dashboard.component.scss'],
  template: `
    <div class="dashboard-container">
      <!-- Hero Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="app-title">
              <span class="title-icon">🎯</span>
              Goal Tracker
            </h1>
            <p class="header-subtitle">Transform your dreams into achievements</p>
          </div>
          <nav class="header-nav">
            <button mat-icon-button class="nav-btn" aria-label="Notifications">
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button class="nav-btn" aria-label="Settings">
              <mat-icon>settings</mat-icon>
            </button>
            <div class="user-avatar">
              <span>👤</span>
            </div>
          </nav>
        </div>
      </header>

      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-content">
            <h2 class="welcome-title">Welcome back, Alex! 👋</h2>
            <p class="welcome-message">You're making incredible progress. Keep up the momentum!</p>
            <div class="motivation-stats">
              <div class="motivation-stat">
                <span class="stat-icon">🔥</span>
                <span class="stat-text">5 day streak</span>
              </div>
              <div class="motivation-stat">
                <span class="stat-icon">⭐</span>
                <span class="stat-text">70% completion rate</span>
              </div>
            </div>
          </div>
          <div class="welcome-illustration">
            <div class="floating-elements">
              <span class="floating-icon">🎯</span>
              <span class="floating-icon">🚀</span>
              <span class="floating-icon">💪</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Overview -->
      <section class="stats-section">
        <div class="stats-grid">
          <mat-card class="stat-card primary-stat">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon>flag</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">4</div>
                <div class="stat-label">Active Goals</div>
              </div>
            </div>
            <div class="stat-trend positive">
              <mat-icon>trending_up</mat-icon>
              <span>+2 this month</span>
            </div>
          </mat-card>

          <mat-card class="stat-card success-stat">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">2</div>
                <div class="stat-label">Completed This Week</div>
              </div>
            </div>
            <div class="stat-trend positive">
              <mat-icon>trending_up</mat-icon>
              <span>+50% vs last week</span>
            </div>
          </mat-card>

          <mat-card class="stat-card warning-stat">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon>local_fire_department</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">5</div>
                <div class="stat-label">Day Streak</div>
              </div>
            </div>
            <div class="stat-trend positive">
              <mat-icon>trending_up</mat-icon>
              <span>Personal best!</span>
            </div>
          </mat-card>
        </div>
      </section>

      <!-- Goals Section -->
      <section class="goals-section">
        <div class="section-header">
          <h3 class="section-title">Your Active Goals</h3>
          <button mat-raised-button color="primary" class="add-goal-btn">
            <mat-icon>add</mat-icon>
            Add Goal
          </button>
        </div>
        
        <div class="goals-grid">
          <mat-card *ngFor="let goal of goals; let i = index" class="goal-card" [ngClass]="'goal-' + (i + 1)" tabindex="0">
            <div class="goal-header">
              <div class="goal-title-section">
                <h4 class="goal-title">{{ goal.title }}</h4>
                <mat-chip [ngClass]="'category-chip cat-' + goal.category.toLowerCase()">
                  {{ goal.category }}
                </mat-chip>
              </div>
              <button mat-icon-button class="goal-menu-btn" aria-label="Goal options">
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>

            <div class="goal-progress-section">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-percentage">{{ goal.progress.percent }}%</span>
              </div>
              <mat-progress-bar 
                [value]="goal.progress.percent" 
                class="custom-progress-bar"
                [ngClass]="'progress-' + goal.category.toLowerCase()">
              </mat-progress-bar>
            </div>

            <div class="goal-next-milestone">
              <mat-icon class="milestone-icon">next_plan</mat-icon>
              <span class="milestone-text">{{ goal.nextMilestone }}</span>
            </div>

            <div class="milestones-section">
              <div class="milestones-header">
                <h5 class="milestones-title">Milestones</h5>
                <span class="milestones-count">{{ goal.milestones.filter(m => m.completed).length }}/{{ goal.milestones.length }}</span>
              </div>
              <div class="milestones-list">
                <div *ngFor="let milestone of goal.milestones" class="milestone-item" [ngClass]="{ 'completed': milestone.completed }">
                  <div class="milestone-checkbox">
                    <mat-icon *ngIf="milestone.completed" class="check-icon">check_circle</mat-icon>
                    <div *ngIf="!milestone.completed" class="empty-checkbox"></div>
                  </div>
                  <span class="milestone-title">{{ milestone.title }}</span>
                </div>
              </div>
            </div>

            <div class="goal-actions">
              <button mat-button class="action-btn">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button class="action-btn">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
            </div>
          </mat-card>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section">
        <div class="section-header">
          <h3 class="section-title">Recent Activity</h3>
          <button mat-button class="view-all-btn">View All</button>
        </div>
        
        <mat-card class="activity-card">
          <div class="activity-list">
            <div *ngFor="let activity of recentActivity; let i = index" class="activity-item" [ngClass]="'activity-' + (i + 1)">
              <div class="activity-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity }}</p>
                <span class="activity-time">2 hours ago</span>
              </div>
            </div>
          </div>
        </mat-card>
      </section>
    </div>
  `
})
export class DashboardComponent {
  goals: Goal[] = [
    {
      title: 'Run 5km 3x/week',
      category: 'Health',
      progress: { percent: 70 },
      nextMilestone: 'Complete 2 more runs',
      milestones: [
        { id: '1', title: 'Run 5km once', completed: true },
        { id: '2', title: 'Run 5km twice', completed: true },
        { id: '3', title: 'Run 5km 3 times', completed: false },
        { id: '4', title: 'Maintain for 4 weeks', completed: false }
      ]
    },
    {
      title: 'Read 12 books',
      category: 'Personal',
      progress: { percent: 50 },
      nextMilestone: 'Finish "Atomic Habits"',
      milestones: [
        { id: '1', title: 'Read 3 books', completed: true },
        { id: '2', title: 'Read 6 books', completed: true },
        { id: '3', title: 'Read 9 books', completed: false },
        { id: '4', title: 'Read 12 books', completed: false }
      ]
    },
    {
      title: 'Save $5,000',
      category: 'Financial',
      progress: { percent: 40 },
      nextMilestone: 'Reach $2,000 saved',
      milestones: [
        { id: '1', title: 'Save $1,000', completed: true },
        { id: '2', title: 'Save $2,000', completed: false },
        { id: '3', title: 'Save $3,500', completed: false },
        { id: '4', title: 'Save $5,000', completed: false }
      ]
    },
    {
      title: 'Get a promotion',
      category: 'Career',
      progress: { percent: 20 },
      nextMilestone: 'Complete leadership course',
      milestones: [
        { id: '1', title: 'Complete leadership course', completed: false },
        { id: '2', title: 'Update resume', completed: false },
        { id: '3', title: 'Apply for positions', completed: false },
        { id: '4', title: 'Get promoted', completed: false }
      ]
    }
  ];

  recentActivity: string[] = [
    'Completed a run (Health)',
    'Read 30 pages (Personal)',
    'Saved $200 (Financial)',
    'Attended team meeting (Career)'
  ];
} 