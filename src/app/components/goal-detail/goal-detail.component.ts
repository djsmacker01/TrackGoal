import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Goal, Category, Progress, Milestone } from '../../goal.model';
import { UpdateHistoryComponent } from '../update-history/update-history.component';
import { UpdateHistoryService } from '../../services/update-history.service';
import { UpdateHistory } from '../../models/update-history.model';
import { NotificationService } from '../../services/notification.service';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { GoalService } from '../../services/goal.service';
import { Subscription } from 'rxjs';

interface ProgressUpdate {
  id: string;
  date: Date;
  type: 'milestone' | 'progress' | 'note';
  title: string;
  description: string;
  value?: number;
  icon: string;
}

interface GoalStatistics {
  createdDate: Date;
  lastUpdated: Date;
  completionRate: number;
  averageProgressPerWeek: number;
  totalMilestones: number;
  completedMilestones: number;
}

@Component({
  selector: 'app-goal-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    UpdateHistoryComponent,
    DeleteConfirmationComponent
  ],
  styleUrls: ['./goal-detail.component.scss'],
  template: `
    <div class="goal-detail-container" *ngIf="goal">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">{{ goal.title }}</h1>
            <mat-chip [ngClass]="'category-chip cat-' + goal.category.toLowerCase()">
              <span class="chip-icon">{{ getCategoryIcon(goal.category) }}</span>
              {{ goal.category }}
            </mat-chip>
          </div>
          <div class="header-actions">
            <button mat-icon-button class="action-btn" [matMenuTriggerFor]="menu" aria-label="More actions">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="editGoal()">
                <mat-icon>edit</mat-icon>
                <span>Edit Goal</span>
              </button>
              <button mat-menu-item (click)="addMilestone()">
                <mat-icon>add_task</mat-icon>
                <span>Add Milestone</span>
              </button>
              <button mat-menu-item (click)="updateProgress()">
                <mat-icon>trending_up</mat-icon>
                <span>Update Progress</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item class="delete-option" (click)="deleteGoal()">
                <mat-icon>delete</mat-icon>
                <span>Delete Goal</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Hero Progress Section -->
        <section class="hero-section">
          <mat-card class="progress-card">
            <div class="progress-hero">
              <div class="circular-progress">
                <div class="progress-ring" [ngClass]="'progress-' + goal.category.toLowerCase()">
                  <div class="progress-circle">
                    <div class="progress-value">{{ goal.progress?.percent || 0 }}%</div>
                    <div class="progress-label">Complete</div>
                  </div>
                  <svg class="progress-svg" viewBox="0 0 120 120">
                    <circle class="progress-bg" cx="60" cy="60" r="54"></circle>
                    <circle class="progress-fill" 
                            cx="60" cy="60" r="54"
                            [style.stroke-dasharray]="getProgressCircumference()"
                            [style.stroke-dashoffset]="getProgressOffset()">
                    </circle>
                  </svg>
                </div>
              </div>
              <div class="progress-info">
                <div class="status-indicator" [ngClass]="'status-' + getGoalStatus().toLowerCase()">
                  <mat-icon>{{ getStatusIcon(getGoalStatus()) }}</mat-icon>
                  <span>{{ getGoalStatus() }}</span>
                </div>
                <div class="progress-details">
                  <div class="detail-item" *ngIf="goal.deadline">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ getDaysRemaining(goal.deadline) }}</span>
                  </div>
                  <div class="detail-item">
                    <mat-icon>flag</mat-icon>
                    <span>{{ goal.nextMilestone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </section>

        <!-- Goal Information -->
        <section class="goal-info-section">
          <mat-card class="info-card">
            <div class="card-header">
              <h3 class="card-title">Goal Information</h3>
            </div>
            <div class="info-content">
              <div class="info-row">
                <div class="info-label">Description</div>
                <div class="info-value">{{ goal.description || 'No description provided' }}</div>
              </div>
              <div class="info-row" *ngIf="goal.deadline">
                <div class="info-label">Deadline</div>
                <div class="info-value">{{ goal.deadline | date:'longDate' }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Goal Type</div>
                <div class="info-value">{{ getGoalType() }}</div>
              </div>
              <div class="info-row" *ngIf="goal.targetValue">
                <div class="info-label">Target</div>
                <div class="info-value">{{ goal.targetValue }} {{ goal.targetUnit }}</div>
              </div>
            </div>
          </mat-card>
        </section>

        <!-- Statistics -->
        <section class="statistics-section">
          <mat-card class="stats-card">
            <div class="card-header">
              <h3 class="card-title">Statistics</h3>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                  <div class="stat-value">{{ getDaysSinceCreated() }}</div>
                  <div class="stat-label">Days Active</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                  <div class="stat-value">{{ getCompletionRate() }}%</div>
                  <div class="stat-label">Completion Rate</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                  <div class="stat-value">{{ getCompletedMilestones() }}/{{ getTotalMilestones() }}</div>
                  <div class="stat-label">Milestones</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                  <div class="stat-value">{{ getAverageProgressPerWeek() }}%</div>
                  <div class="stat-label">Avg Progress/Week</div>
                </div>
              </div>
            </div>
          </mat-card>
        </section>

        <!-- Milestones Section -->
        <section class="milestones-section">
          <mat-card class="milestones-card">
            <div class="card-header">
              <h3 class="card-title">Milestones</h3>
              <button mat-button class="add-milestone-btn" (click)="addMilestone()">
                <mat-icon>add</mat-icon>
                Add Milestone
              </button>
            </div>
            <div class="milestones-list">
              <mat-expansion-panel *ngFor="let milestone of goal.milestones; let i = index" 
                                  class="milestone-panel"
                                  [ngClass]="{ 'completed': milestone.completed }">
                <mat-expansion-panel-header>
                  <div class="milestone-header">
                    <div class="milestone-checkbox" (click)="$event.stopPropagation(); toggleMilestone(milestone)">
                      <div class="checkbox-inner" [ngClass]="{ 'checked': milestone.completed }">
                        <mat-icon *ngIf="milestone.completed" class="check-icon">check</mat-icon>
                      </div>
                    </div>
                    <div class="milestone-info">
                      <div class="milestone-title">{{ milestone.title }}</div>
                      <div class="milestone-status" *ngIf="milestone.completed">
                        <mat-icon>check_circle</mat-icon>
                        <span>Completed</span>
                      </div>
                    </div>
                    <div class="milestone-actions">
                      <button mat-icon-button class="milestone-action-btn" 
                              (click)="$event.stopPropagation(); editMilestone(milestone)"
                              matTooltip="Edit milestone">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-expansion-panel-header>
                <div class="milestone-content">
                  <div class="milestone-details" *ngIf="milestone.description">
                    <p>{{ milestone.description }}</p>
                  </div>

                </div>
              </mat-expansion-panel>
            </div>
          </mat-card>
        </section>

        <!-- Update History Section -->
        <section class="history-section">
          <app-update-history [updateHistory]="goalUpdateHistory"></app-update-history>
        </section>

        <!-- Activity Timeline -->
        <section class="activity-section">
          <mat-card class="activity-card">
            <div class="card-header">
              <h3 class="card-title">Recent Activity</h3>
            </div>
            <div class="activity-timeline">
              <div *ngFor="let activity of recentActivity; let i = index" 
                   class="activity-item"
                   [ngClass]="'activity-' + (i % 3)">
                <div class="activity-icon">
                  <mat-icon>{{ activity.icon }}</mat-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ activity.date | date:'short' }}</div>
                </div>
              </div>
            </div>
          </mat-card>
        </section>

        <!-- Action Buttons -->
        <section class="actions-section">
          <div class="action-buttons">
            <button mat-raised-button class="action-btn edit-btn" (click)="editGoal()">
              <mat-icon>edit</mat-icon>
              Edit Goal
            </button>
            <button mat-raised-button class="action-btn progress-btn" (click)="updateProgress()">
              <mat-icon>trending_up</mat-icon>
              Update Progress
            </button>
            <button mat-raised-button class="action-btn milestone-btn" (click)="addMilestone()">
              <mat-icon>add_task</mat-icon>
              Add Milestone
            </button>
            <button mat-stroked-button class="action-btn delete-btn" (click)="deleteGoal()">
              <mat-icon>delete</mat-icon>
              Delete Goal
            </button>
          </div>
        </section>
      </main>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="!goal">
      <mat-card class="loading-card">
        <div class="loading-content">
          <div class="loading-spinner">⏳</div>
          <h3>Loading goal details...</h3>
        </div>
      </mat-card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-delete-confirmation
      *ngIf="showDeleteConfirmation"
      [goalTitle]="goal?.title || ''"
      [goalDetails]="getGoalDetailsForDelete()"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()">
    </app-delete-confirmation>
  `
})
export class GoalDetailComponent implements OnInit, OnDestroy {
  goal: Goal | null = null;
  recentActivity: ProgressUpdate[] = [];
  goalUpdateHistory: UpdateHistory | null = null;
  showDeleteConfirmation = false;
  private subscription!: Subscription;
  private goalRealtimeSub: any;
  private milestoneRealtimeSub: any;
  private progressRealtimeSub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private updateHistoryService: UpdateHistoryService,
    private notificationService: NotificationService,
    private goalService: GoalService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const goalId = params['id'];
      this.loadGoal(goalId);
      this.setupRealtimeSubscriptions(goalId);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.goalRealtimeSub?.unsubscribe();
    this.milestoneRealtimeSub?.unsubscribe();
    this.progressRealtimeSub?.unsubscribe();
  }

  private setupRealtimeSubscriptions(goalId: string) {
    // Subscribe to real-time goal updates
    this.goalRealtimeSub = this.goalService.subscribeToGoals(() => {
      // Reload goal data when changes occur
      this.loadGoal(goalId);
    });

    // Subscribe to real-time milestone updates
    this.milestoneRealtimeSub = this.goalService.subscribeToMilestones(() => {
      // Reload goal data when milestones change
      this.loadGoal(goalId);
    });

    // Subscribe to real-time progress updates
    this.progressRealtimeSub = this.goalService.subscribeToAllProgress(() => {
      // Reload goal data when progress changes
      this.loadGoal(goalId);
    });
  }

  loadGoal(goalId: string) {
    this.subscription = this.goalService.getGoalById(goalId).subscribe({
      next: (goal: Goal | null) => {
        if (goal) {
          this.goal = goal;
          console.log('Loaded goal:', goal);
          console.log('Goal milestones:', goal.milestones);
          console.log('Goal progress:', goal.progress);
          this.loadRecentActivity();
          this.loadUpdateHistory();
        } else {
          // Goal not found, navigate back
          this.notificationService.error('Goal not found', 'The requested goal could not be found');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        console.error('Error loading goal:', error);
        this.notificationService.error('Error loading goal details', 'Failed to load goal information');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadRecentActivity() {
    if (!this.goal) {
      return;
    }

    // Load real activity data from the database for this specific goal
    this.goalService.getGoalActivity(this.goal.id).subscribe({
      next: (activities) => {
        this.recentActivity = activities.map(activity => ({
          id: activity.id,
          date: new Date(activity.created_at),
          type: activity.type as 'milestone' | 'progress' | 'note',
          title: activity.title,
          description: activity.description,
          value: activity.value,
          icon: this.getActivityIcon(activity.type)
        }));
      },
      error: (error) => {
        console.error('Error loading recent activity:', error);
        this.recentActivity = [];
      }
    });
  }

  private getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'milestone': 'check_circle',
      'progress': 'trending_up',
      'note': 'note',
      'goal_created': 'flag',
      'milestone_completed': 'check_circle',
      'progress_updated': 'trending_up'
    };
    return icons[type] || 'info';
  }

  loadUpdateHistory() {
    if (!this.goal) {
      return;
    }
    
    this.goalUpdateHistory = this.updateHistoryService.getUpdateHistorySummary(this.goal.id);
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

  getGoalStatus(): string {
    if (!this.goal) {
      return 'Unknown';
    }
    if (this.goal.status === 'completed') {
      return 'Completed';
    }
    if (this.goal.progress?.percent === 100) {
      return 'Completed';
    }
    
    if (!this.goal.deadline) {
      return 'Active';
    }
    
    const today = new Date();
    const deadline = new Date(this.goal.deadline);
    
    if (deadline < today) {
      return 'Overdue';
    }
    return 'Active';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Active': 'play_circle',
      'Completed': 'check_circle',
      'Overdue': 'warning'
    };
    return icons[status] || 'help';
  }

  getDaysRemaining(deadline: string | undefined): string {
    if (!deadline) return 'No deadline set';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } 
    if (diffDays === 0) {
      return 'Due today';
    } 
    if (diffDays === 1) {
      return 'Due tomorrow';
    } 
    return `${diffDays} days left`;
  }

  getGoalType(): string {
    if (!this.goal) return 'Unknown';
    if (this.goal.targetValue) return 'Numerical Target';
    return 'Binary (Complete/Incomplete)';
  }

  getProgressCircumference(): string {
    const radius = 54;
    return (2 * Math.PI * radius).toString();
  }

  getProgressOffset(): string {
    if (!this.goal || !this.goal.progress) return '0';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (this.goal.progress.percent / 100) * circumference;
    return offset.toString();
  }

  getDaysSinceCreated(): number {
    if (!this.goal) return 0;
    const createdDate = new Date(this.goal.created_at || new Date());
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCompletionRate(): number {
    if (!this.goal || !this.goal.milestones || this.goal.milestones.length === 0) {
      return 0;
    }
    const completed = this.goal.milestones.filter(m => m.completed).length;
    const total = this.goal.milestones.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getCompletedMilestones(): number {
    if (!this.goal?.milestones) return 0;
    return this.goal.milestones.filter(m => m.completed).length;
  }

  getTotalMilestones(): number {
    if (!this.goal?.milestones) return 0;
    return this.goal.milestones.length;
  }

  getAverageProgressPerWeek(): number {
    if (!this.goal || !this.goal.progress) return 0;
    const daysSinceCreated = this.getDaysSinceCreated();
    if (daysSinceCreated <= 0) return 0;
    const weeks = Math.max(daysSinceCreated / 7, 1); // Minimum 1 week
    const progressPercent = this.goal.progress.percent || 0;
    return Math.round(progressPercent / weeks);
  }

  toggleMilestone(milestone: Milestone) {
    if (!this.goal || !this.goal.milestones || !this.goal.progress) return;
    
    milestone.completed = !milestone.completed;
    // Update goal progress based on completed milestones
    const completedCount = this.goal.milestones.filter(m => m.completed).length;
    this.goal.progress.percent = Math.round((completedCount / this.goal.milestones.length) * 100);
    
    // Update the goal in the service
    this.goalService.updateGoal(this.goal.id, this.goal);
  }

  editGoal() {
    if (this.goal) {
      this.router.navigate(['/edit-goal', this.goal.id]);
    }
  }

  addMilestone() {
    if (this.goal) {
      this.router.navigate(['/add-milestone', this.goal.id]);
    }
  }

  updateProgress() {
    if (this.goal) {
      this.router.navigate(['/update-progress', this.goal.id]);
    }
  }

  deleteGoal() {
    this.showDeleteConfirmation = true;
  }

  confirmDelete() {
    if (this.goal) {
      // Delete the goal using the service
      this.goalService.deleteGoal(this.goal.id);
      
      // Show success notification
      this.notificationService.success(
        'Goal Deleted', 
        `"${this.goal!.title}" has been successfully deleted.`, 
        5000
      );
      this.showDeleteConfirmation = false;
      this.router.navigate(['/goals-list']);
    }
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
  }

  getGoalDetailsForDelete() {
    if (!this.goal || !this.goal.milestones || !this.goal.progress) return undefined;
    
    return {
      milestonesCount: this.goal.milestones.length,
      progressPercent: this.goal.progress.percent,
      daysActive: this.getDaysSinceCreated()
    };
  }

  editMilestone(milestone: Milestone) {
    console.log('Edit milestone:', milestone);
    // Open edit milestone dialog
  }

  goBack() {
    this.router.navigate(['/goals-list']);
  }
} 