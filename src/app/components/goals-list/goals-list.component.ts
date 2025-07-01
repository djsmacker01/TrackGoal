import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { Goal, Category, Progress } from '../../goal.model';
import { GoalService } from '../../services/goal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-goals-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatMenuModule,
    MatBadgeModule
  ],
  styleUrls: ['./goals-list.component.scss'],
  template: `
    <div class="goals-list-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">My Goals</h1>
            <p class="page-subtitle">Track and manage all your goals in one place</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button class="add-goal-btn" (click)="navigateToAddGoal()">
              <mat-icon>add</mat-icon>
              Add Goal
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Search and Filters Section -->
        <section class="filters-section">
          <mat-card class="filters-card">
            <!-- Search Bar -->
            <div class="search-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search goals</mat-label>
                <input matInput 
                       [value]="searchTerm"
                       (input)="onSearchChange($event)"
                       placeholder="Search by goal title...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>

            <!-- Category Filter Tabs -->
            <div class="category-filters">
              <div class="filter-label">Categories</div>
              <div class="category-tabs">
                <button 
                  *ngFor="let category of allCategories" 
                  class="category-tab"
                  [ngClass]="{ 'active': selectedCategory === category.value }"
                  (click)="selectCategory(category.value)">
                  <span class="category-icon">{{ category.icon }}</span>
                  <span class="category-name">{{ category.label }}</span>
                  <span class="category-count" *ngIf="getCategoryCount(category.value) > 0">
                    {{ getCategoryCount(category.value) }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="status-filters">
              <div class="filter-label">Status</div>
              <div class="status-tabs">
                <button 
                  *ngFor="let status of statusOptions" 
                  class="status-tab"
                  [ngClass]="{ 'active': selectedStatus === status.value }"
                  (click)="selectStatus(status.value)">
                  <mat-icon class="status-icon">{{ status.icon }}</mat-icon>
                  <span class="status-name">{{ status.label }}</span>
                  <span class="status-count" *ngIf="getStatusCount(status.value) > 0">
                    {{ getStatusCount(status.value) }}
                  </span>
                </button>
              </div>
            </div>
          </mat-card>
        </section>

        <!-- Results Summary -->
        <section class="results-summary">
          <div class="summary-content">
            <div class="results-info">
              <span class="results-count">
                Showing {{ filteredGoals.length }} of {{ allGoals.length }} goals
              </span>
              <span class="results-text" *ngIf="hasActiveFilters()">
                (filtered results)
              </span>
            </div>
            <button 
              *ngIf="hasActiveFilters()" 
              mat-button 
              class="clear-filters-btn"
              (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </section>

        <!-- Goals Grid -->
        <section class="goals-section">
          <div class="goals-grid" *ngIf="filteredGoals.length > 0">
            <mat-card *ngFor="let goal of filteredGoals; let i = index" 
                      class="goal-card" 
                      [ngClass]="'goal-' + goal.category.toLowerCase() + ' status-' + getGoalStatus(goal).toLowerCase()"
                      tabindex="0"
                      (click)="viewGoal(goal)"
                      [style.cursor]="'pointer'">
              
              <!-- Goal Header -->
              <div class="goal-header">
                <div class="goal-info">
                  <h3 class="goal-title">{{ goal.title }}</h3>
                  <mat-chip [ngClass]="'category-chip cat-' + goal.category.toLowerCase()">
                    <span class="chip-icon">{{ getCategoryIcon(goal.category) }}</span>
                    {{ goal.category }}
                  </mat-chip>
                </div>
                <div class="goal-status">
                  <div class="status-indicator" [ngClass]="'status-' + getGoalStatus(goal).toLowerCase()">
                    <mat-icon>{{ getStatusIcon(getGoalStatus(goal)) }}</mat-icon>
                    <span>{{ getGoalStatus(goal) }}</span>
                  </div>
                </div>
              </div>

              <!-- Goal Progress -->
              <div class="goal-progress">
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

              <!-- Goal Details -->
              <div class="goal-details">
                <div class="detail-item">
                  <mat-icon class="detail-icon">flag</mat-icon>
                  <span class="detail-text">{{ goal.nextMilestone }}</span>
                </div>
                <div class="detail-item" *ngIf="goal.deadline">
                  <mat-icon class="detail-icon">schedule</mat-icon>
                  <span class="detail-text">{{ getDaysRemaining(goal.deadline) }}</span>
                </div>
              </div>

              <!-- Goal Actions -->
              <div class="goal-actions" (click)="$event.stopPropagation()">
                <button mat-button class="action-btn view-btn" (click)="viewGoal(goal)">
                  <mat-icon>visibility</mat-icon>
                  View
                </button>
                <button mat-button class="action-btn edit-btn" (click)="editGoal(goal)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-button class="action-btn complete-btn" 
                        *ngIf="getGoalStatus(goal) === 'Active'"
                        (click)="markComplete(goal)">
                  <mat-icon>check_circle</mat-icon>
                  Complete
                </button>
                <button mat-icon-button class="more-btn" [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="duplicateGoal(goal)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicate</span>
                  </button>
                  <button mat-menu-item (click)="archiveGoal(goal)">
                    <mat-icon>archive</mat-icon>
                    <span>Archive</span>
                  </button>
                  <button mat-menu-item class="delete-option" (click)="deleteGoal(goal)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </div>
            </mat-card>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="filteredGoals.length === 0">
            <mat-card class="empty-card">
              <div class="empty-content">
                <div class="empty-icon">🎯</div>
                <h3 class="empty-title">
                  {{ hasActiveFilters() ? 'No goals found' : 'No goals yet' }}
                </h3>
                <p class="empty-subtitle">
                  {{ hasActiveFilters() 
                    ? 'Try adjusting your filters or search terms' 
                    : 'Start by creating your first goal to track your progress' }}
                </p>
                <button mat-raised-button class="create-goal-btn" (click)="navigateToAddGoal()">
                  <mat-icon>add</mat-icon>
                  Create Your First Goal
                </button>
              </div>
            </mat-card>
          </div>
        </section>
      </main>
    </div>
  `
})
export class GoalsListComponent implements OnInit, OnDestroy {
  allGoals: Goal[] = [];
  filteredGoals: Goal[] = [];
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';
  searchTerm: string = '';

  allCategories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'Health', label: 'Health', icon: '🏃‍♂️' },
    { value: 'Career', label: 'Career', icon: '💼' },
    { value: 'Personal', label: 'Personal', icon: '📚' },
    { value: 'Financial', label: 'Financial', icon: '💰' },
    { value: 'Habits', label: 'Habits', icon: '🔄' }
  ];

  statusOptions = [
    { value: 'all', label: 'All Status', icon: 'list' },
    { value: 'active', label: 'Active', icon: 'play_circle' },
    { value: 'completed', label: 'Completed', icon: 'check_circle' },
    { value: 'overdue', label: 'Overdue', icon: 'warning' }
  ];

  private subscription: Subscription;

  constructor(
    private router: Router,
    private goalService: GoalService
  ) {}

  ngOnInit() {
    this.loadGoals();
    this.initForm();
    this.applyFilters();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initForm() {
    // Form initialization is no longer needed since we're using template-driven approach
    console.log('Form initialized');
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value || '';
    this.applyFilters();
  }

  loadGoals() {
    console.log('Loading goals...');
    this.subscription = this.goalService.getAllGoals().subscribe(goals => {
      this.allGoals = goals;
      console.log('All goals loaded:', this.allGoals.length);
      console.log('Goals with IDs 3, 4, 5:', this.allGoals.filter(g => ['3', '4', '5'].includes(g.id)));
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    console.log('Applying filters...', { 
      allGoalsLength: this.allGoals?.length, 
      selectedCategory: this.selectedCategory, 
      selectedStatus: this.selectedStatus, 
      searchTerm: this.searchTerm 
    });

    if (!this.allGoals || this.allGoals.length === 0) {
      this.filteredGoals = [];
      return;
    }

    this.filteredGoals = this.allGoals.filter(goal => {
      // Category filter
      const categoryMatch = this.selectedCategory === 'all' || goal.category === this.selectedCategory;
      
      // Status filter
      const goalStatus = this.getGoalStatus(goal);
      const statusMatch = this.selectedStatus === 'all' || goalStatus === this.selectedStatus;
      
      // Search filter
      const searchMatch = !this.searchTerm || 
        goal.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const isIncluded = categoryMatch && statusMatch && searchMatch;
      
      // Debug logging for goals 3, 4, 5
      if (['3', '4', '5'].includes(goal.id)) {
        console.log(`Goal ${goal.id} (${goal.title}):`, {
          categoryMatch,
          statusMatch,
          searchMatch,
          isIncluded,
          goalStatus,
          selectedCategory: this.selectedCategory,
          selectedStatus: this.selectedStatus
        });
      }
      
      return isIncluded;
    });

    console.log('Filtered goals:', this.filteredGoals.length);
    console.log('Goals 3, 4, 5 in filtered results:', this.filteredGoals.filter(g => ['3', '4', '5'].includes(g.id)).map(g => g.id));
  }

  getGoalStatus(goal: Goal): string {
    if (goal.status === 'completed') {
      return 'Completed';
    }
    if (goal.progress.percent === 100) {
      return 'Completed';
    }
    
    if (!goal.deadline) {
      return 'Active';
    }
    
    const today = new Date();
    const deadline = new Date(goal.deadline);
    
    if (deadline < today) {
      return 'Overdue';
    }
    return 'Active';
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

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Active': 'play_circle',
      'Completed': 'check_circle',
      'Overdue': 'warning'
    };
    return icons[status] || 'help';
  }

  getDaysRemaining(deadline: Date | undefined): string {
    if (!deadline) {
      return 'No deadline set';
    }
    
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

  getCategoryCount(category: string): number {
    if (category === 'all') {
      return this.allGoals.length;
    }
    return this.allGoals.filter(goal => goal.category === category).length;
  }

  getStatusCount(status: string): number {
    if (status === 'all') {
      return this.allGoals.length;
    }
    return this.allGoals.filter(goal => this.getGoalStatus(goal) === status).length;
  }

  hasActiveFilters(): boolean {
    return this.selectedCategory !== 'all' || 
           this.selectedStatus !== 'all' || 
           this.searchTerm.trim() !== '';
  }

  clearFilters() {
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  // Action methods
  viewGoal(goal: Goal) {
    console.log('View goal clicked:', goal);
    if (goal.id) {
      this.router.navigate(['/goal-detail', goal.id]);
    } else {
      console.error('Goal ID is missing:', goal);
    }
  }

  editGoal(goal: Goal) {
    console.log('Edit goal:', goal);
    if (goal.id) {
      this.router.navigate(['/edit-goal', goal.id]);
    } else {
      console.error('Goal ID is missing for editing:', goal);
    }
  }

  markComplete(goal: Goal) {
    console.log('Mark complete:', goal);
    goal.progress.percent = 100;
    goal.status = 'completed';
    this.applyFilters();
    // Show success notification
    console.log(`Goal "${goal.title}" marked as completed!`);
  }

  duplicateGoal(goal: Goal) {
    console.log('Duplicate goal:', goal);
    // Create a copy of the goal with a new ID
    const duplicatedGoal: Goal = {
      ...goal,
      id: (this.allGoals.length + 1).toString(),
      title: `${goal.title} (Copy)`,
      progress: { percent: 0 },
      status: 'active',
      milestones: goal.milestones.map(milestone => ({
        ...milestone,
        id: (Math.random() * 1000).toString(),
        completed: false
      }))
    };
    
    this.allGoals.push(duplicatedGoal);
    this.applyFilters();
    console.log(`Goal "${goal.title}" duplicated successfully!`);
  }

  archiveGoal(goal: Goal) {
    console.log('Archive goal:', goal);
    // Mark goal as archived (you could add an archived property to the Goal interface)
    goal.status = 'archived';
    this.applyFilters();
    console.log(`Goal "${goal.title}" archived successfully!`);
  }

  deleteGoal(goal: Goal) {
    console.log('Delete goal:', goal);
    // Remove the goal from the list
    this.allGoals = this.allGoals.filter(g => g.id !== goal.id);
    this.applyFilters();
    console.log(`Goal "${goal.title}" deleted successfully!`);
  }

  navigateToAddGoal() {
    this.router.navigate(['/add-goal']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
} 