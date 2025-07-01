import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Goal, Category } from '../../goal.model';
import { GoalService } from '../../services/goal.service';
import { CategoryService, CategoryConfig } from '../../services/category.service';
import { AddCategoryDialogComponent } from '../add-category-dialog/add-category-dialog.component';
import { Subscription } from 'rxjs';

interface CategoryStats {
  name: string;
  icon: string;
  color: string;
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  overdueGoals: number;
  averageProgress: number;
  recentActivity: string[];
  goals: Goal[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule
  ],
  styleUrls: ['./categories.component.scss'],
  template: `
    <div class="categories-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">Categories</h1>
            <p class="page-subtitle">Organize and manage your goals by category</p>
          </div>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search categories</mat-label>
              <input matInput [(ngModel)]="searchTerm" placeholder="Search goals or categories...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button class="add-category-btn" (click)="addNewCategory()">
              <mat-icon>add</mat-icon>
              New Category
            </button>
          </div>
        </div>
      </header>

      <!-- Category Overview Stats -->
      <section class="overview-section">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ totalGoals }}</div>
              <div class="stat-label">Total Goals</div>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ completedGoals }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">{{ activeGoals }}</div>
              <div class="stat-label">Active</div>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ overdueGoals }}</div>
              <div class="stat-label">Overdue</div>
            </div>
          </mat-card>
        </div>
      </section>

      <!-- Categories Grid -->
      <section class="categories-section">
        <div class="categories-grid">
          <mat-card 
            *ngFor="let category of filteredCategories" 
            class="category-card"
            [ngClass]="'category-' + category.name.toLowerCase()"
            [class.expanded]="expandedCategory === category.name"
            (click)="toggleCategory(category.name)">
            
            <!-- Category Header -->
            <div class="category-header">
              <div class="category-info">
                <div class="category-icon">{{ category.icon }}</div>
                <div class="category-details">
                  <h3 class="category-name">{{ category.name }}</h3>
                  <div class="category-stats">
                    <span class="goal-count">{{ category.totalGoals }} goals</span>
                    <span class="completion-rate">{{ category.averageProgress }}% avg</span>
                  </div>
                </div>
              </div>
              <div class="category-actions">
                <button 
                  mat-icon-button 
                  class="action-btn"
                  (click)="addGoalToCategory(category.name, $event)"
                  matTooltip="Add goal to {{ category.name }}">
                  <mat-icon>add</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  class="action-btn"
                  (click)="viewAllGoals(category.name, $event)"
                  matTooltip="View all {{ category.name }} goals">
                  <mat-icon>list</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  class="expand-btn"
                  [class.expanded]="expandedCategory === category.name">
                  <mat-icon>{{ expandedCategory === category.name ? 'expand_less' : 'expand_more' }}</mat-icon>
                </button>
              </div>
            </div>

            <!-- Category Progress -->
            <div class="category-progress">
              <div class="progress-stats">
                <div class="stat-item">
                  <span class="stat-label">Active</span>
                  <span class="stat-value">{{ category.activeGoals }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completed</span>
                  <span class="stat-value">{{ category.completedGoals }}</span>
                </div>
                <div class="stat-item" *ngIf="category.overdueGoals > 0">
                  <span class="stat-label overdue">Overdue</span>
                  <span class="stat-value overdue">{{ category.overdueGoals }}</span>
                </div>
              </div>
              <div class="progress-bar-container">
                <mat-progress-bar 
                  [value]="category.averageProgress" 
                  [ngClass]="'progress-' + category.name.toLowerCase()"
                  class="category-progress-bar">
                </mat-progress-bar>
                <span class="progress-text">{{ category.averageProgress }}% complete</span>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity" *ngIf="category.recentActivity.length > 0">
              <h4 class="activity-title">Recent Activity</h4>
              <div class="activity-list">
                <div *ngFor="let activity of category.recentActivity.slice(0, 2)" class="activity-item">
                  <mat-icon class="activity-icon">check_circle</mat-icon>
                  <span class="activity-text">{{ activity }}</span>
                </div>
              </div>
            </div>

            <!-- Expanded Goals Section -->
            <div class="expanded-goals" *ngIf="expandedCategory === category.name">
              <div class="goals-header">
                <h4 class="goals-title">{{ category.name }} Goals</h4>
                <div class="goals-filters">
                  <button 
                    mat-button 
                    class="filter-btn"
                    [class.active]="selectedFilter === 'all'"
                    (click)="setFilter('all', $event)">
                    All ({{ category.totalGoals }})
                  </button>
                  <button 
                    mat-button 
                    class="filter-btn"
                    [class.active]="selectedFilter === 'active'"
                    (click)="setFilter('active', $event)">
                    Active ({{ category.activeGoals }})
                  </button>
                  <button 
                    mat-button 
                    class="filter-btn"
                    [class.active]="selectedFilter === 'completed'"
                    (click)="setFilter('completed', $event)">
                    Completed ({{ category.completedGoals }})
                  </button>
                </div>
              </div>

              <!-- Goals List -->
              <div class="goals-list" *ngIf="getFilteredGoals(category).length > 0">
                <mat-card 
                  *ngFor="let goal of getFilteredGoals(category)" 
                  class="goal-card"
                  (click)="viewGoal(goal.id, $event)">
                  <div class="goal-header">
                    <h5 class="goal-title">{{ goal.title }}</h5>
                    <mat-chip [ngClass]="'status-chip status-' + goal.status">
                      {{ goal.status }}
                    </mat-chip>
                  </div>
                  <div class="goal-progress">
                    <mat-progress-bar 
                      [value]="goal.progress.percent" 
                      class="goal-progress-bar">
                    </mat-progress-bar>
                    <span class="progress-percentage">{{ goal.progress.percent }}%</span>
                  </div>
                  <div class="goal-milestone">
                    <mat-icon class="milestone-icon">flag</mat-icon>
                    <span class="milestone-text">{{ goal.nextMilestone }}</span>
                  </div>
                </mat-card>
              </div>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="getFilteredGoals(category).length === 0">
                <div class="empty-icon">🎯</div>
                <h4 class="empty-title">No goals found</h4>
                <p class="empty-text">
                  {{ selectedFilter === 'all' ? 'No goals in this category yet.' : 'No ' + selectedFilter + ' goals found.' }}
                </p>
                <button 
                  mat-raised-button 
                  class="add-goal-btn"
                  (click)="addGoalToCategory(category.name, $event)">
                  <mat-icon>add</mat-icon>
                  Add Goal to {{ category.name }}
                </button>
              </div>
            </div>
          </mat-card>
        </div>
      </section>
    </div>
  `
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: CategoryStats[] = [];
  expandedCategory: string | null = null;
  selectedFilter: string = 'all';
  searchTerm: string = '';
  private subscription!: Subscription;

  constructor(
    private router: Router,
    private goalService: GoalService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.subscription = this.goalService.getGoals().subscribe(goals => {
      this.categories = this.calculateCategoryStats(goals);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get filteredCategories(): CategoryStats[] {
    if (!this.searchTerm) {
      return this.categories;
    }
    
    const search = this.searchTerm.toLowerCase();
    return this.categories.filter(category => 
      category.name.toLowerCase().includes(search) ||
      category.goals.some(goal => 
        goal.title.toLowerCase().includes(search) ||
        goal.description?.toLowerCase().includes(search)
      )
    );
  }

  get totalGoals(): number {
    return this.categories.reduce((sum, cat) => sum + cat.totalGoals, 0);
  }

  get completedGoals(): number {
    return this.categories.reduce((sum, cat) => sum + cat.completedGoals, 0);
  }

  get activeGoals(): number {
    return this.categories.reduce((sum, cat) => sum + cat.activeGoals, 0);
  }

  get overdueGoals(): number {
    return this.categories.reduce((sum, cat) => sum + cat.overdueGoals, 0);
  }

  calculateCategoryStats(goals: Goal[]): CategoryStats[] {
    const categoryConfigs = this.categoryService.getCategories();

    return categoryConfigs.map(config => {
      const categoryGoals = goals.filter(goal => goal.category === config.name);
      const completedGoals = categoryGoals.filter(goal => goal.status === 'completed').length;
      const activeGoals = categoryGoals.filter(goal => goal.status === 'active').length;
      const overdueGoals = categoryGoals.filter(goal => goal.status === 'overdue').length;
      const averageProgress = categoryGoals.length > 0 
        ? Math.round(categoryGoals.reduce((sum, goal) => sum + goal.progress.percent, 0) / categoryGoals.length)
        : 0;

      // Generate recent activity based on goals
      const recentActivity = this.generateRecentActivity(categoryGoals);

      return {
        name: config.name,
        icon: config.icon,
        color: config.color,
        totalGoals: categoryGoals.length,
        completedGoals,
        activeGoals,
        overdueGoals,
        averageProgress,
        recentActivity,
        goals: categoryGoals
      };
    });
  }

  generateRecentActivity(goals: Goal[]): string[] {
    const activities: string[] = [];
    
    goals.forEach(goal => {
      if (goal.status === 'completed') {
        activities.push(`Completed "${goal.title}"`);
      } else if (goal.progress.percent > 50) {
        activities.push(`Made progress on "${goal.title}"`);
      } else if (goal.status === 'overdue') {
        activities.push(`"${goal.title}" is overdue`);
      }
    });

    return activities.slice(0, 3); // Return top 3 activities
  }

  toggleCategory(categoryName: string) {
    this.expandedCategory = this.expandedCategory === categoryName ? null : categoryName;
    this.selectedFilter = 'all'; // Reset filter when expanding
  }

  setFilter(filter: string, event: Event) {
    event.stopPropagation();
    this.selectedFilter = filter;
  }

  getFilteredGoals(category: CategoryStats): Goal[] {
    switch (this.selectedFilter) {
      case 'active':
        return category.goals.filter(goal => goal.status === 'active');
      case 'completed':
        return category.goals.filter(goal => goal.status === 'completed');
      case 'overdue':
        return category.goals.filter(goal => goal.status === 'overdue');
      default:
        return category.goals;
    }
  }

  addGoalToCategory(categoryName: string, event: Event) {
    event.stopPropagation();
    // Navigate to add goal with pre-selected category
    this.router.navigate(['/add-goal'], { 
      queryParams: { category: categoryName } 
    });
  }

  viewAllGoals(categoryName: string, event: Event) {
    event.stopPropagation();
    // Navigate to goals list with category filter
    this.router.navigate(['/goals-list'], { 
      queryParams: { category: categoryName } 
    });
  }

  viewGoal(goalId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/goal-detail', goalId]);
  }

  addNewCategory() {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: CategoryConfig | undefined) => {
      if (result) {
        try {
          this.categoryService.addCategory(result);
          this.snackBar.open(`Category "${result.name}" created successfully!`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          
          // Refresh the categories display
          this.goalService.getGoals().subscribe(goals => {
            this.categories = this.calculateCategoryStats(goals);
          });
        } catch (error) {
          this.snackBar.open(error instanceof Error ? error.message : 'Failed to create category', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }
} 