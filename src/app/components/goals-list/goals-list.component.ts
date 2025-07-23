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

  private subscription!: Subscription;

  constructor(
    private router: Router,
    private goalService: GoalService
  ) {}

  ngOnInit() {
    this.loadGoals();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initForm() {
    // Form initialization if needed
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  loadGoals() {
    this.subscription = this.goalService.goals$.subscribe({
      next: (goals) => {
        this.allGoals = goals;
        this.applyFilters();
        console.log('Goals loaded:', goals.length);
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.allGoals = [];
        this.filteredGoals = [];
      }
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
    let filtered = [...this.allGoals];

    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === this.selectedCategory);
    }

    // Apply status filter
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchLower) ||
        goal.description?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredGoals = filtered;
  }

  getGoalStatus(goal: Goal): string {
    if (goal.status === 'completed') {
      return 'Completed';
    }
    if (goal.progress?.percent === 100) {
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
    this.goalService.markGoalComplete(goal.id);
    console.log(`Goal "${goal.title}" marked as completed!`);
  }

  duplicateGoal(goal: Goal) {
    console.log('Duplicate goal:', goal);
    this.goalService.duplicateGoal(goal);
    console.log(`Goal "${goal.title}" duplicated successfully!`);
  }

  archiveGoal(goal: Goal) {
    console.log('Archive goal:', goal);
    this.goalService.archiveGoal(goal.id);
    console.log(`Goal "${goal.title}" archived successfully!`);
  }

  deleteGoal(goal: Goal) {
    console.log('Delete goal:', goal);
    this.goalService.deleteGoal(goal.id);
    console.log(`Goal "${goal.title}" deleted successfully!`);
  }

  navigateToAddGoal() {
    this.router.navigate(['/add-goal']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
} 