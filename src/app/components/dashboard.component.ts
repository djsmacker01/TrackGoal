import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { Goal, Category, Progress } from '../goal.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgClass],
  styleUrls: ['./dashboard.component.scss'],
  template: `
    <header class="dashboard-header">
      <span class="app-title">Goal Tracker</span>
      <nav class="nav">
        <button class="menu-btn" aria-label="Menu">☰</button>
      </nav>
    </header>
    <section class="welcome-section">
      <h2>Welcome back, Alex!</h2>
      <p>Let's crush your goals today 🚀</p>
    </section>
    <section class="stats-section">
      <div class="stat-card">
        <div class="stat-value">4</div>
        <div class="stat-label">Total Goals</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">2</div>
        <div class="stat-label">Completed This Week</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">5</div>
        <div class="stat-label">Current Streak</div>
      </div>
    </section>
    <section class="goals-section">
      <h3>Your Active Goals</h3>
      <div class="goals-list">
        <div *ngFor="let goal of goals" class="goal-card" tabindex="0">
          <div class="goal-header">
            <span class="goal-title">{{ goal.title }}</span>
            <span class="category-chip" [ngClass]="'cat-' + goal.category.toLowerCase()">{{ goal.category }}</span>
          </div>
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="goal.progress.percent"></div>
            </div>
            <span class="progress-label">{{ goal.progress.percent }}%</span>
          </div>
          <div class="goal-milestone">
            <span>Next: {{ goal.nextMilestone }}</span>
          </div>
        </div>
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
      nextMilestone: 'Complete 2 more runs'
    },
    {
      title: 'Read 12 books',
      category: 'Personal',
      progress: { percent: 50 },
      nextMilestone: 'Finish "Atomic Habits"'
    },
    {
      title: 'Save $5,000',
      category: 'Financial',
      progress: { percent: 40 },
      nextMilestone: 'Reach $2,000 saved'
    },
    {
      title: 'Get a promotion',
      category: 'Career',
      progress: { percent: 20 },
      nextMilestone: 'Complete leadership course'
    }
  ];

  recentActivity: string[] = [
    'Completed a run (Health)',
    'Read 30 pages (Personal)',
    'Saved $200 (Financial)',
    'Attended team meeting (Career)'
  ];
} 