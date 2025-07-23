import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Goal, Milestone } from '../../goal.model';
import { NotificationService } from '../../services/notification.service';
import { GoalService } from '../../services/goal.service';

@Component({
  selector: 'app-add-milestone',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  styleUrls: ['./add-milestone.component.scss'],
  template: `
    <div class="add-milestone-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">Add Milestone</h1>
            <p class="page-subtitle" *ngIf="goal">Add a new milestone to "{{ goal.title }}"</p>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content" *ngIf="goal">
        <!-- Goal Context Card -->
        <section class="goal-context-section">
          <mat-card class="goal-context-card">
            <div class="goal-summary">
              <div class="goal-header">
                <div class="goal-info">
                  <h3 class="goal-title">{{ goal.title }}</h3>
                  <mat-chip class="category-chip">
                    <span class="chip-icon">{{ getCategoryIcon(goal.category) }}</span>
                    {{ goal.category }}
                  </mat-chip>
                </div>
                <div class="goal-progress">
                  <div class="progress-circle">
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        stroke="rgba(99, 102, 241, 0.2)"
                        stroke-width="4"
                        fill="none"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        stroke="url(#progressGradient)"
                        stroke-width="4"
                        fill="none"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="getProgressCircumference()"
                        [attr.stroke-dashoffset]="getProgressOffset()"
                        transform="rotate(-90 30 30)"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span class="progress-text">{{ goal.progress?.percent || 0 }}%</span>
                  </div>
                </div>
              </div>
              <div class="goal-stats">
                <div class="stat-item">
                  <mat-icon>flag</mat-icon>
                  <span>{{ goal.milestones?.length || 0 }} milestones</span>
                </div>
                <div class="stat-item">
                  <mat-icon>check_circle</mat-icon>
                  <span>{{ getCompletedMilestones() }} completed</span>
                </div>
                <div class="stat-item" *ngIf="goal.deadline">
                  <mat-icon>event</mat-icon>
                  <span>{{ getDaysRemaining(goal.deadline) }}</span>
                </div>
              </div>
            </div>
          </mat-card>
        </section>

        <!-- Milestone Form -->
        <section class="milestone-form-section">
          <mat-card class="form-card">
            <div class="card-header">
              <h3 class="card-title">
                <mat-icon>add_task</mat-icon>
                New Milestone Details
              </h3>
            </div>
            <form [formGroup]="milestoneForm" (ngSubmit)="onSubmit()" class="milestone-form">
              
              <!-- Milestone Title -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Milestone Title</mat-label>
                <input matInput formControlName="title" placeholder="e.g., Complete first week of training" required>
                <mat-icon matSuffix>flag</mat-icon>
                <mat-error *ngIf="milestoneForm.get('title')?.hasError('required')">
                  Milestone title is required
                </mat-error>
                <mat-error *ngIf="milestoneForm.get('title')?.hasError('minlength')">
                  Title must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <!-- Milestone Description -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Description (Optional)</mat-label>
                <textarea matInput formControlName="description" 
                          placeholder="Describe what this milestone represents and how to achieve it..."
                          rows="3"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>



              <!-- Target Value (for numerical goals) -->
              <mat-form-field appearance="outline" class="form-field" *ngIf="isNumericalGoal()">
                <mat-label>Target Value (Optional)</mat-label>
                <input matInput type="number" formControlName="targetValue" 
                       placeholder="Enter target value for this milestone">
                <mat-icon matSuffix>target</mat-icon>
                <mat-error *ngIf="milestoneForm.get('targetValue')?.hasError('min')">
                  Target value must be greater than 0
                </mat-error>
              </mat-form-field>

              <!-- Sequence Number -->
              <div class="sequence-info">
                <mat-icon>sort</mat-icon>
                <span>This will be milestone #{{ getNextSequenceNumber() }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button type="button" mat-button class="cancel-btn" (click)="goBack()">
                  <mat-icon>close</mat-icon>
                  Cancel
                </button>
                <button type="submit" mat-raised-button class="save-btn" 
                        [disabled]="milestoneForm.invalid || isSubmitting">
                  <mat-icon>add</mat-icon>
                  {{ isSubmitting ? 'Adding...' : 'Add Milestone' }}
                </button>
              </div>
            </form>
          </mat-card>
        </section>

        <!-- Preview Section -->
        <section class="preview-section">
          <mat-card class="preview-card">
            <div class="card-header">
              <h3 class="card-title">
                <mat-icon>preview</mat-icon>
                Milestone Preview
              </h3>
            </div>
            <div class="preview-content">
              <div class="milestone-preview" *ngIf="milestoneForm.get('title')?.value">
                <div class="milestone-item">
                  <div class="milestone-status">
                    <mat-icon>radio_button_unchecked</mat-icon>
                  </div>
                  <div class="milestone-info">
                    <h4 class="milestone-title">{{ milestoneForm.get('title')?.value }}</h4>
                    <p class="milestone-description" *ngIf="milestoneForm.get('description')?.value">
                      {{ milestoneForm.get('description')?.value }}
                    </p>
                    <div class="milestone-meta">
                      <span class="target-value" *ngIf="milestoneForm.get('targetValue')?.value">
                        <mat-icon>target</mat-icon>
                        {{ milestoneForm.get('targetValue')?.value }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="no-preview" *ngIf="!milestoneForm.get('title')?.value">
                <mat-icon>preview</mat-icon>
                <p>Start typing a milestone title to see a preview</p>
              </div>
            </div>
          </mat-card>
        </section>
      </main>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="!goal">
        <mat-card class="loading-card">
          <div class="loading-content">
            <div class="loading-spinner">⏳</div>
            <h3>Loading goal details...</h3>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class AddMilestoneComponent implements OnInit {
  milestoneForm!: FormGroup;
  goal: Goal | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private goalService: GoalService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const goalId = params['goalId'];
      this.loadGoal(goalId);
    });
  }

  loadGoal(goalId: string) {
    this.goalService.getGoal(goalId).subscribe({
      next: (goal) => {
        this.goal = goal;
        if (this.goal) {
          this.initForm();
        }
      },
      error: (error) => {
        console.error('Error loading goal:', error);
        this.notificationService.error(
          'Error', 
          'Failed to load goal details. Please try again.', 
          5000
        );
        this.router.navigate(['/goals-list']);
      }
    });
  }

  initForm() {
    this.milestoneForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      targetValue: [null, [Validators.min(1)]]
    });
  }

  isNumericalGoal(): boolean {
    return !!(this.goal?.targetValue);
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

  getProgressCircumference(): string {
    const radius = 25;
    return (2 * Math.PI * radius).toString();
  }

  getProgressOffset(): string {
    if (!this.goal?.progress) {
      return '0';
    }
    const circumference = 2 * Math.PI * 25;
    const offset = circumference - (this.goal.progress.percent / 100) * circumference;
    return offset.toString();
  }

  getCompletedMilestones(): number {
    if (!this.goal?.milestones) {
      return 0;
    }
    return this.goal.milestones.filter(m => m.completed).length;
  }

  getDaysRemaining(deadline: string | undefined): string {
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

  getNextSequenceNumber(): number {
    if (!this.goal?.milestones) {
      return 1;
    }
    return this.goal.milestones.length + 1;
  }

  onSubmit() {
    console.log('Form submitted');
    console.log('Form valid:', this.milestoneForm.valid);
    console.log('Form value:', this.milestoneForm.value);
    console.log('Goal:', this.goal);
    
    if (this.milestoneForm.valid && this.goal) {
      this.isSubmitting = true;
      
      const formData = this.milestoneForm.value;
      
      // Create new milestone
      const newMilestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'> = {
        goal_id: this.goal.id,
        title: formData.title,
        description: formData.description || undefined,
        target_value: formData.targetValue || undefined,
        completed: false
      };
      
      console.log('Creating milestone:', newMilestone);
      
      // Add milestone to database
      this.goalService.createMilestone(newMilestone).subscribe({
        next: (createdMilestone) => {
          console.log('Milestone created successfully:', createdMilestone);
          this.isSubmitting = false;
          
          this.notificationService.success(
            'Milestone Added', 
            `"${createdMilestone.title}" has been added to your goal!`, 
            5000
          );
          
          // Navigate back to goal detail page
          this.router.navigate(['/goal-detail', this.goal!.id]);
        },
        error: (error) => {
          console.error('Error creating milestone:', error);
          this.isSubmitting = false;
          
          this.notificationService.error(
            'Error', 
            'Failed to create milestone. Please try again.', 
            5000
          );
        }
      });
    } else {
      console.log('Form is invalid or goal is null');
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.milestoneForm.controls).forEach(key => {
      const control = this.milestoneForm.get(key);
      control?.markAsTouched();
    });
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  goBack() {
    if (this.goal?.id) {
      this.router.navigate(['/goal-detail', this.goal.id]);
    } else {
      this.router.navigate(['/goals-list']);
    }
  }
} 