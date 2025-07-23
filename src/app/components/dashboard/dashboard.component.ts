import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Goal, Category, Progress } from '../../goal.model';
import { GoalService } from '../../services/goal.service';
import { SupabaseService, UserProfile } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressBarModule, MatIconModule, MatChipsModule, MatMenuModule, MatDividerModule, MatProgressSpinnerModule],
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
            <button mat-icon-button class="nav-btn" aria-label="Notifications" (click)="navigateToNotifications()">
              <mat-icon>notifications</mat-icon>
              <span class="notification-badge" *ngIf="hasNotifications">3</span>
            </button>
            <button mat-icon-button class="nav-btn" aria-label="Add Goal" (click)="navigateToAddGoal()">
              <mat-icon>add</mat-icon>
            </button>
            <div class="user-menu">
              <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-avatar">
                <span>👤</span>
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item (click)="navigateToProfile()">
                  <mat-icon>person</mat-icon>
                  <span>Profile</span>
                </button>
                <button mat-menu-item (click)="navigateToSettings()">
                  <mat-icon>settings</mat-icon>
                  <span>Settings</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Sign Out</span>
                </button>
              </mat-menu>
            </div>
          </nav>
        </div>
      </header>

      <!-- Main content area -->
      <main class="main-content">
        <!-- Welcome section with animated greeting -->
        <section class="welcome-section">
          <div class="welcome-card">
            <div class="welcome-content">
              <h2 class="welcome-title">Welcome back, {{ displayName }}! 👋</h2>
              <p class="welcome-subtitle">You're making incredible progress. Keep up the momentum!</p>
              <div class="motivation-badge" *ngIf="statistics.streak > 0">
                <span class="badge-icon">🔥</span>
                <span class="badge-text">{{ statistics.streak }} Day Streak</span>
              </div>
              <div class="motivation-badge" *ngIf="statistics.streak === 0">
                <span class="badge-icon">🚀</span>
                <span class="badge-text">Ready to Start</span>
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

        <!-- Enhanced stats section with loading states -->
        <section class="stats-section">
          <div class="stats-grid">
            <mat-card class="stat-card stat-primary">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value" *ngIf="!loadingStatistics; else loadingSpinner">{{ statistics.activeGoals }}</div>
                <ng-template #loadingSpinner>
                  <mat-spinner diameter="24"></mat-spinner>
                </ng-template>
                <div class="stat-label">Active Goals</div>
                <div class="stat-trend" [ngClass]="statistics.trend">
                  {{ statistics.thisWeek > 0 ? '+' + statistics.thisWeek : '0' }} this week
                </div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-success">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value" *ngIf="!loadingStatistics; else loadingSpinner2">{{ statistics.completedGoals }}</div>
                <ng-template #loadingSpinner2>
                  <mat-spinner diameter="24"></mat-spinner>
                </ng-template>
                <div class="stat-label">Completed Goals</div>
                <div class="stat-trend" [ngClass]="statistics.trend">
                  {{ statistics.completedGoals > 0 ? '+' + statistics.completedGoals : '0' }} total
                </div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-warning">
              <div class="stat-icon">🔥</div>
              <div class="stat-content">
                <div class="stat-value" *ngIf="!loadingStatistics; else loadingSpinner3">{{ statistics.streak }}</div>
                <ng-template #loadingSpinner3>
                  <mat-spinner diameter="24"></mat-spinner>
                </ng-template>
                <div class="stat-label">Day Streak</div>
                <div class="stat-trend" [ngClass]="statistics.streak > 0 ? 'positive' : 'neutral'">
                  {{ statistics.streak > 0 ? 'Keep it up!' : 'Start your streak!' }}
                </div>
              </div>
            </mat-card>
            <mat-card class="stat-card stat-info">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value" *ngIf="!loadingStatistics; else loadingSpinner4">{{ statistics.overallProgress }}%</div>
                <ng-template #loadingSpinner4>
                  <mat-spinner diameter="24"></mat-spinner>
                </ng-template>
                <div class="stat-label">Overall Progress</div>
                <div class="stat-trend" [ngClass]="statistics.trend">
                  {{ statistics.totalGoals > 0 ? statistics.totalGoals + ' goals' : 'No goals yet' }}
                </div>
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

        <!-- Enhanced goals section with loading states -->
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
          
          <!-- Loading state for goals -->
          <div *ngIf="loadingGoals" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading your goals...</p>
          </div>

          <!-- Empty state for goals -->
          <div *ngIf="!loadingGoals && goals.length === 0" class="empty-state">
            <div class="empty-icon">🎯</div>
            <h3>No goals yet</h3>
            <p>Start your journey by creating your first goal!</p>
            <button mat-raised-button color="primary" (click)="navigateToAddGoal()">
              <mat-icon>add</mat-icon>
              Create Your First Goal
            </button>
          </div>

          <!-- Goals grid -->
          <div *ngIf="!loadingGoals && goals.length > 0" class="goals-grid">
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
                  <button mat-icon-button class="action-btn" aria-label="Edit goal" (click)="editGoal(goal)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button class="action-btn" [matMenuTriggerFor]="goalMenu" aria-label="More options">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #goalMenu="matMenu">
                    <button mat-menu-item (click)="viewGoalDetails(goal)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    <button mat-menu-item (click)="updateProgress(goal)">
                      <mat-icon>trending_up</mat-icon>
                      <span>Update Progress</span>
                    </button>
                    <button mat-menu-item (click)="addMilestone(goal)">
                      <mat-icon>add_task</mat-icon>
                      <span>Add Milestone</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="duplicateGoal(goal)">
                      <mat-icon>content_copy</mat-icon>
                      <span>Duplicate</span>
                    </button>
                    <button mat-menu-item (click)="archiveGoal(goal)">
                      <mat-icon>archive</mat-icon>
                      <span>Archive</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteGoal(goal)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
              
              <div class="goal-progress-section">
                <div class="progress-header">
                  <span class="progress-label">Progress</span>
                  <span class="progress-percentage">{{ goal?.progress?.percent || 0 }}%</span>
                </div>
                <div class="progress-container">
                  <mat-progress-bar 
                    [value]="goal?.progress?.percent || 0" 
                    [ngClass]="'progress-' + goal.category.toLowerCase()"
                    class="custom-progress-bar">
                  </mat-progress-bar>
                </div>
              </div>

              <div class="goal-milestone">
                <div class="milestone-preview">
                  <mat-icon class="milestone-icon">flag</mat-icon>
                  <span class="milestone-text">Next: {{ goal.nextMilestone || 'No milestones yet' }}</span>
                </div>
              </div>

              <div class="milestones-section">
                <div class="milestones-header">
                  <h5 class="milestones-title">Milestones</h5>
                  <span class="milestones-count">{{ getCompletedMilestones(goal?.milestones) }}/{{ goal?.milestones?.length || 0 }}</span>
                </div>
                <div class="milestones-list">
                  <div *ngIf="!goal?.milestones || goal?.milestones?.length === 0" class="no-milestones">
                    <p>No milestones yet. Add some milestones to track your progress!</p>
                  </div>
                  <div *ngFor="let milestone of goal?.milestones || []; let i = index" class="milestone-item" [ngClass]="{ 'completed': milestone.completed }" (click)="toggleMilestone(milestone, goal)" style="cursor: pointer;">
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

        <!-- Recent Activity Section with loading states -->
        <section class="recent-activity-section">
          <div class="section-header">
            <h3 class="section-title">Recent Activity</h3>
            <button mat-button class="view-all-btn" (click)="navigateToAnalytics()">
              <mat-icon>analytics</mat-icon>
              View Analytics
            </button>
          </div>
          
          <!-- Loading state for recent activity -->
          <div *ngIf="loadingRecentActivity" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading recent activity...</p>
          </div>

          <!-- Empty state for recent activity -->
          <div *ngIf="!loadingRecentActivity && recentActivity.length === 0" class="no-activity">
            <mat-icon class="no-activity-icon">schedule</mat-icon>
            <p class="no-activity-text">No recent activity yet</p>
            <p class="no-activity-subtext">Start working on your goals to see your progress here!</p>
          </div>

          <!-- Activity list -->
          <div *ngIf="!loadingRecentActivity && recentActivity.length > 0" class="activity-list">
            <div *ngFor="let activity of recentActivity; let i = index" class="activity-item" [ngClass]="'activity-' + activity.type">
              <div class="activity-icon">
                <mat-icon [ngClass]="'icon-' + activity.category?.toLowerCase()">{{ activity.icon }}</mat-icon>
              </div>
              <div class="activity-content">
                <h4 class="activity-title">{{ activity.title }}</h4>
                <p class="activity-description">{{ activity.description }}</p>
                <span class="activity-time">{{ getActivityTimeFromTimestamp(activity.timestamp) }}</span>
              </div>
              <div class="activity-category" *ngIf="activity.category">
                <mat-chip [ngClass]="'category-chip cat-' + activity.category.toLowerCase()">
                  <span class="chip-icon">{{ getCategoryIcon(activity.category) }}</span>
                  {{ activity.category }}
                </mat-chip>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private goalsSubscription!: Subscription;
  private recentActivitySubscription!: Subscription;
  private milestoneRealtimeSub: any;
  private progressRealtimeSub: any;
  private goalsRealtimeSub: any;
  private statisticsSubscription!: Subscription;

  constructor(
    private router: Router, 
    private goalService: GoalService, 
    private supabaseService: SupabaseService, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  
  goals: Goal[] = [];
  recentActivity: any[] = [];
  userProfile: UserProfile | null = null;
  displayName: string = 'GoalTracker User';
  
  // Loading states
  loadingGoals = true;
  loadingRecentActivity = true;
  loadingStatistics = true;
  
  // Statistics with default values
  statistics: any = {
    activeGoals: 0,
    completedGoals: 0,
    totalGoals: 0,
    overallProgress: 0,
    streak: 0,
    thisWeek: 0,
    trend: 'neutral'
  };

  ngOnInit() {
    this.initializeDashboard();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }

  private async initializeDashboard() {
    try {
      // Load user profile first
      await this.loadUserProfile();
      
      // Load all data in parallel
      await Promise.all([
        this.loadGoals(),
        this.loadRecentActivity(),
        this.loadStatistics()
      ]);

      // Set up real-time subscriptions
      this.setupRealTimeSubscriptions();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      this.notificationService.error('Error', 'Failed to load dashboard data. Please refresh the page.', 5000);
    }
  }

  private async loadUserProfile() {
    try {
      this.userProfile = await this.supabaseService.getUserProfile();
      this.updateDisplayName();
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.displayName = 'GoalTracker User';
    }
  }

  private async loadGoals() {
    this.loadingGoals = true;
    try {
      this.goalsSubscription = this.goalService.goals$.subscribe({
        next: (goals) => {
          this.goals = goals;
          console.log('Goals loaded:', goals.length);
          this.loadingGoals = false;
        },
        error: (error) => {
          console.error('Error loading goals:', error);
          this.goals = [];
          this.loadingGoals = false;
          this.notificationService.error('Error', 'Failed to load goals. Please try again.', 3000);
        }
      });
    } catch (error) {
      console.error('Error setting up goals subscription:', error);
      this.loadingGoals = false;
    }
  }

  private async loadRecentActivity() {
    this.loadingRecentActivity = true;
    try {
      this.recentActivitySubscription = this.goalService.recentActivity$.subscribe({
        next: (activities: any[]) => {
          this.recentActivity = activities;
          this.loadingRecentActivity = false;
        },
        error: (error: any) => {
          console.error('Error loading recent activity:', error);
          this.recentActivity = [];
          this.loadingRecentActivity = false;
        }
      });
    } catch (error) {
      console.error('Error setting up recent activity subscription:', error);
      this.loadingRecentActivity = false;
    }
  }

  private async loadStatistics() {
    this.loadingStatistics = true;
    try {
      const stats = await this.goalService.getDynamicStatistics();
      this.statistics = stats;
      this.loadingStatistics = false;
    } catch (error) {
      console.error('Error loading statistics:', error);
      this.loadingStatistics = false;
    }
  }

  private setupRealTimeSubscriptions() {
    // Subscribe to real-time goals
    this.goalsRealtimeSub = this.goalService.subscribeToGoals(() => {
      this.refreshStatistics();
    });

    // Subscribe to real-time milestones
    this.milestoneRealtimeSub = this.goalService.subscribeToMilestones(() => {
      this.refreshStatistics();
    });

    // Subscribe to real-time progress entries
    this.progressRealtimeSub = this.goalService.subscribeToAllProgress(() => {
      this.refreshStatistics();
    });
  }

  private async refreshStatistics() {
    try {
      const stats = await this.goalService.getDynamicStatistics();
      this.statistics = stats;
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    }
  }

  private cleanupSubscriptions() {
    if (this.goalsSubscription) this.goalsSubscription.unsubscribe();
    if (this.recentActivitySubscription) this.recentActivitySubscription.unsubscribe();
    if (this.statisticsSubscription) this.statisticsSubscription.unsubscribe();
    if (this.milestoneRealtimeSub) this.milestoneRealtimeSub.unsubscribe();
    if (this.progressRealtimeSub) this.progressRealtimeSub.unsubscribe();
    if (this.goalsRealtimeSub) this.goalsRealtimeSub.unsubscribe();
  }

  private updateDisplayName() {
    if (this.userProfile?.display_name) {
      this.displayName = this.userProfile.display_name;
    } else if (this.userProfile?.first_name) {
      this.displayName = this.userProfile.first_name;
    } else if (this.userProfile?.last_name) {
      this.displayName = this.userProfile.last_name;
    } else {
      this.displayName = 'GoalTracker User';
    }
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

  getActivityTimeFromTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  }

  getCompletedMilestones(milestones: any[] | undefined): number {
    if (!milestones) {
      return 0;
    }
    return milestones.filter(m => m.completed).length;
  }

  // Navigation methods
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

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  get hasNotifications(): boolean {
    // For now, return false. You can implement actual notification logic later
    return false;
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  // Goal action methods
  editGoal(goal: Goal) {
    this.router.navigate(['/edit-goal', goal.id]);
  }

  viewGoalDetails(goal: Goal) {
    this.router.navigate(['/goal-detail', goal.id]);
  }

  updateProgress(goal: Goal) {
    this.router.navigate(['/update-progress', goal.id]);
  }

  addMilestone(goal: Goal) {
    this.router.navigate(['/add-milestone', goal.id]);
  }

  duplicateGoal(goal: Goal) {
    this.goalService.duplicateGoal(goal).subscribe({
      next: (duplicatedGoal) => {
        console.log('Goal duplicated successfully:', duplicatedGoal);
        this.notificationService.success(
          'Goal Duplicated', 
          `"${goal.title}" has been duplicated successfully!`, 
          3000
        );
      },
      error: (error) => {
        console.error('Error duplicating goal:', error);
        this.notificationService.error(
          'Error', 
          'Failed to duplicate goal. Please try again.', 
          5000
        );
      }
    });
  }

  archiveGoal(goal: Goal) {
    this.goalService.archiveGoal(goal.id).subscribe({
      next: (archivedGoal) => {
        console.log('Goal archived successfully:', archivedGoal);
        this.notificationService.success(
          'Goal Archived', 
          `"${goal.title}" has been archived successfully!`, 
          3000
        );
      },
      error: (error) => {
        console.error('Error archiving goal:', error);
        this.notificationService.error(
          'Error', 
          'Failed to archive goal. Please try again.', 
          5000
        );
      }
    });
  }

  deleteGoal(goal: Goal) {
    if (confirm(`Are you sure you want to delete "${goal.title}"? This action cannot be undone.`)) {
      this.goalService.deleteGoal(goal.id).subscribe({
        next: () => {
          console.log('Goal deleted successfully');
          this.notificationService.success(
            'Goal Deleted', 
            `"${goal.title}" has been deleted successfully!`, 
            3000
          );
        },
        error: (error) => {
          console.error('Error deleting goal:', error);
          this.notificationService.error(
            'Error', 
            'Failed to delete goal. Please try again.', 
            5000
          );
        }
      });
    }
  }

  toggleMilestone(milestone: any, goal: Goal) {
    console.log('Toggle milestone clicked:', milestone);
    console.log('Current completed status:', milestone.completed);
    console.log('Goal:', goal.title);
    
    if (milestone.completed) {
      // Uncomplete milestone
      this.goalService.updateMilestone(milestone.id, { completed: false, completed_at: undefined }).subscribe({
        next: (updatedMilestone) => {
          console.log('Milestone uncompleted:', updatedMilestone);
          this.notificationService.success(
            'Milestone Uncompleted', 
            `"${milestone.title}" has been marked as incomplete.`, 
            2000
          );
        },
        error: (error) => {
          console.error('Error updating milestone:', error);
          this.notificationService.error(
            'Error', 
            'Failed to update milestone. Please try again.', 
            5000
          );
        }
      });
    } else {
      // Complete milestone
      this.goalService.completeMilestone(milestone.id).subscribe({
        next: (completedMilestone) => {
          console.log('Milestone completed:', completedMilestone);
          this.notificationService.success(
            'Milestone Completed! 🎉', 
            `"${milestone.title}" has been completed!`, 
            3000
          );
        },
        error: (error) => {
          console.error('Error completing milestone:', error);
          this.notificationService.error(
            'Error', 
            'Failed to complete milestone. Please try again.', 
            5000
          );
        }
      });
    }
  }
} 