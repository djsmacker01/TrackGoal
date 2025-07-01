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
    <header class="dashboard-header">
      <span class="app-title">Goal Tracker</span>
      <nav class="nav">
        <button mat-icon-button aria-label="Menu"><mat-icon>menu</mat-icon></button>
      </nav>
    </header>
    <section class="welcome-section">
      <h2>Welcome back, Alex!</h2>
      <p>Let's crush your goals today 🚀</p>
    </section>
    <section class="stats-section">
      <mat-card class="stat-card">
        <div class="stat-value">4</div>
        <div class="stat-label">Total Goals</div>
      </mat-card>
      <mat-card class="stat-card">
        <div class="stat-value">2</div>
        <div class="stat-label">Completed This Week</div>
      </mat-card>
      <mat-card class="stat-card">
        <div class="stat-value">5</div>
        <div class="stat-label">Current Streak</div>
      </mat-card>
    </section>
    <section class="goals-section">
      <h3>Your Active Goals</h3>
      <div class="goals-list">
        <mat-card *ngFor="let goal of goals" class="goal-card" tabindex="0">
          <div class="goal-header">
            <span class="goal-title">{{ goal.title }}</span>
            <mat-chip [ngClass]="'cat-' + goal.category.toLowerCase()">{{ goal.category }}</mat-chip>
          </div>
          <div class="goal-progress">
            <mat-progress-bar [value]="goal.progress.percent"></mat-progress-bar>
            <span class="progress-label">{{ goal.progress.percent }}%</span>
          </div>
          <div class="goal-milestone">
            <span>Next: {{ goal.nextMilestone }}</span>
          </div>
          <div class="milestones-section">
            <h4>Milestones</h4>
            <div class="milestones-list">
              <div *ngFor="let milestone of goal.milestones" class="milestone-item" [ngClass]="{ 'completed': milestone.completed }">
                <span class="milestone-checkbox">{{ milestone.completed ? '✓' : '○' }}</span>
                <span class="milestone-title">{{ milestone.title }}</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </section>
    <section class="activity-section">
      <h3>Recent Activity</h3>
      <ul class="activity-list">
        <li *ngFor="let activity of recentActivity">{{ activity }}</li>
      </ul>
    </section>
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