import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Goal, Category } from '../../goal.model';
import { NotificationService } from '../../services/notification.service';
import { UpdateHistoryService } from '../../services/update-history.service';

@Component({
  selector: 'app-edit-goal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  styleUrls: ['./edit-goal.component.scss'],
  template: `
    <div class="edit-goal-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">Edit Goal</h1>
            <p class="page-subtitle">Update your goal details and settings</p>
          </div>
        </div>
      </header>

      <!-- Main Form -->
      <main class="main-content">
        <mat-card class="form-card" *ngIf="goal">
          <form [formGroup]="goalForm" (ngSubmit)="onSubmit()" class="goal-form">
            
            <!-- Goal Title -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Goal Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g., Run a marathon" required>
              <mat-icon matSuffix>flag</mat-icon>
              <mat-error *ngIf="goalForm.get('title')?.hasError('required')">
                Goal title is required
              </mat-error>
              <mat-error *ngIf="goalForm.get('title')?.hasError('minlength')">
                Title must be at least 3 characters
              </mat-error>
            </mat-form-field>

            <!-- Goal Description -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" 
                        placeholder="Describe your goal and why it's important to you..."
                        rows="4"></textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <!-- Category Selection -->
            <div class="form-field">
              <label class="field-label">Category</label>
              <div class="category-grid">
                <div *ngFor="let category of categories" 
                     class="category-option" 
                     [ngClass]="{ 'selected': goalForm.get('category')?.value === category.value }"
                     (click)="selectCategory(category.value)">
                  <div class="category-icon">{{ category.icon }}</div>
                  <span class="category-name">{{ category.label }}</span>
                </div>
              </div>
              <mat-error *ngIf="goalForm.get('category')?.hasError('required') && goalForm.get('category')?.touched">
                Please select a category
              </mat-error>
            </div>

            <!-- Goal Type Selection -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Goal Type</mat-label>
              <mat-select formControlName="goalType" required>
                <mat-option *ngFor="let type of goalTypes" [value]="type.value">
                  <div class="goal-type-option">
                    <mat-icon>{{ type.icon }}</mat-icon>
                    <span>{{ type.label }}</span>
                  </div>
                </mat-option>
              </mat-select>
              <mat-error *ngIf="goalForm.get('goalType')?.hasError('required')">
                Please select a goal type
              </mat-error>
            </mat-form-field>

            <!-- Target Value (for numerical goals) -->
            <div *ngIf="isNumericalGoal()" class="target-section">
              <div class="target-inputs">
                <mat-form-field appearance="outline" class="target-field">
                  <mat-label>Target Value</mat-label>
                  <input matInput type="number" formControlName="targetValue" 
                         placeholder="Enter target value" required>
                  <mat-error *ngIf="goalForm.get('targetValue')?.hasError('required')">
                    Target value is required
                  </mat-error>
                  <mat-error *ngIf="goalForm.get('targetValue')?.hasError('min')">
                    Target value must be greater than 0
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="target-field">
                  <mat-label>Unit</mat-label>
                  <input matInput formControlName="targetUnit" 
                         placeholder="e.g., km, books, dollars" required>
                  <mat-error *ngIf="goalForm.get('targetUnit')?.hasError('required')">
                    Unit is required
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Deadline -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Target Deadline</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="deadline" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="goalForm.get('deadline')?.hasError('required')">
                Deadline is required
              </mat-error>
              <mat-error *ngIf="goalForm.get('deadline')?.hasError('invalidDate')">
                Please select a valid future date
              </mat-error>
            </mat-form-field>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button type="button" mat-button class="cancel-btn" (click)="goBack()">
                <mat-icon>close</mat-icon>
                Cancel
              </button>
              <button type="submit" mat-raised-button class="save-btn" 
                      [disabled]="goalForm.invalid || isSubmitting">
                <mat-icon>save</mat-icon>
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </mat-card>

        <!-- Loading State -->
        <mat-card class="loading-card" *ngIf="!goal">
          <div class="loading-content">
            <div class="loading-spinner">⏳</div>
            <h3>Loading goal details...</h3>
          </div>
        </mat-card>
      </main>
    </div>
  `
})
export class EditGoalComponent implements OnInit {
  goalForm!: FormGroup;
  goal: Goal | null = null;
  isSubmitting = false;
  originalGoalData: Goal | null = null;

  categories = [
    { value: 'Health', label: 'Health', icon: '🏃‍♂️' },
    { value: 'Career', label: 'Career', icon: '💼' },
    { value: 'Personal', label: 'Personal', icon: '📚' },
    { value: 'Financial', label: 'Financial', icon: '💰' },
    { value: 'Habits', label: 'Habits', icon: '🔄' }
  ];

  goalTypes = [
    { value: 'binary', label: 'Binary (Complete/Incomplete)', icon: 'check_circle' },
    { value: 'numerical', label: 'Numerical Target', icon: 'trending_up' },
    { value: 'percentage', label: 'Percentage-based', icon: 'pie_chart' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private updateHistoryService: UpdateHistoryService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const goalId = params['id'];
      this.loadGoal(goalId);
    });
  }

  loadGoal(goalId: string) {
    // Mock data - in real app this would come from a service
    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Run 5km 3x/week',
        category: 'Health',
        progress: { percent: 70 },
        nextMilestone: 'Complete 2 more runs',
        deadline: new Date('2024-02-15'),
        status: 'active',
        targetValue: 12,
        targetUnit: 'runs',
        description: 'Build endurance and improve cardiovascular health by running 5km three times per week. This will help me prepare for a half marathon later this year.',
        milestones: [
          { id: '1', title: 'Run 5km once', completed: true, dueDate: new Date('2024-01-15'), description: 'Complete your first 5km run to establish the baseline for your training program.' },
          { id: '2', title: 'Run 5km twice', completed: true, dueDate: new Date('2024-01-22'), description: 'Run 5km twice in one week to build consistency and endurance.' },
          { id: '3', title: 'Run 5km 3 times', completed: false, dueDate: new Date('2024-01-29'), description: 'Achieve the target frequency of running 5km three times per week.' },
          { id: '4', title: 'Maintain for 4 weeks', completed: false, dueDate: new Date('2024-02-26'), description: 'Sustain the 3x/week running schedule for a full month to establish the habit.' }
        ]
      },
      {
        id: '2',
        title: 'Read 12 books',
        category: 'Personal',
        progress: { percent: 50 },
        nextMilestone: 'Finish "Atomic Habits"',
        deadline: new Date('2024-12-31'),
        status: 'active',
        targetValue: 12,
        targetUnit: 'books',
        description: 'Expand knowledge and develop reading habit by completing 12 books this year. Focus on personal development and business books.',
        milestones: [
          { id: '1', title: 'Read 3 books', completed: true, dueDate: new Date('2024-03-31'), description: 'Complete the first quarter of your reading goal by finishing 3 books.' },
          { id: '2', title: 'Read 6 books', completed: true, dueDate: new Date('2024-06-30'), description: 'Reach the halfway point of your annual reading challenge.' },
          { id: '3', title: 'Read 9 books', completed: false, dueDate: new Date('2024-09-30'), description: 'Complete 75% of your reading goal with 9 books finished.' },
          { id: '4', title: 'Read 12 books', completed: false, dueDate: new Date('2024-12-31'), description: 'Achieve your complete reading goal of 12 books for the year.' }
        ]
      }
    ];

    this.goal = mockGoals.find(g => g.id === goalId) || null;
    
    if (this.goal) {
      // Store original data for comparison
      this.originalGoalData = { ...this.goal };
      this.initForm();
    }
  }

  initForm() {
    if (!this.goal) return;

    // Determine goal type based on existing data
    const goalType = this.goal.targetValue ? 'numerical' : 'binary';

    this.goalForm = this.fb.group({
      title: [this.goal.title, [Validators.required, Validators.minLength(3)]],
      description: [this.goal.description || ''],
      category: [this.goal.category, Validators.required],
      goalType: [goalType, Validators.required],
      targetValue: [this.goal.targetValue || null],
      targetUnit: [this.goal.targetUnit || ''],
      deadline: [this.goal.deadline, [Validators.required, this.futureDateValidator()]]
    });

    // Watch goal type changes to show/hide target inputs
    this.goalForm.get('goalType')?.valueChanges.subscribe(type => {
      if (type === 'numerical' || type === 'percentage') {
        this.goalForm.get('targetValue')?.setValidators([Validators.required, Validators.min(1)]);
        this.goalForm.get('targetUnit')?.setValidators([Validators.required]);
      } else {
        this.goalForm.get('targetValue')?.clearValidators();
        this.goalForm.get('targetUnit')?.clearValidators();
      }
      this.goalForm.get('targetValue')?.updateValueAndValidity();
      this.goalForm.get('targetUnit')?.updateValueAndValidity();
    });
  }

  selectCategory(category: string) {
    this.goalForm.patchValue({ category });
  }

  isNumericalGoal(): boolean {
    const goalType = this.goalForm.get('goalType')?.value;
    return goalType === 'numerical' || goalType === 'percentage';
  }

  futureDateValidator() {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      // Allow any date selection - removed future date restriction
      return null;
    };
  }

  onSubmit() {
    if (this.goalForm.valid && this.goal && this.originalGoalData) {
      this.isSubmitting = true;
      
      // Update the goal with new form data
      const formData = this.goalForm.value;
      
      // Store original values for comparison
      const originalTitle = this.goal.title;
      const originalCategory = this.goal.category;
      
      // Create updated goal object
      const updatedGoal: Goal = {
        ...this.goal,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        deadline: formData.deadline
      };
      
      if (formData.goalType === 'numerical' || formData.goalType === 'percentage') {
        updatedGoal.targetValue = formData.targetValue;
        updatedGoal.targetUnit = formData.targetUnit;
      } else {
        updatedGoal.targetValue = undefined;
        updatedGoal.targetUnit = undefined;
      }
      
      // Record the update in history
      const recordedUpdate = this.updateHistoryService.recordGoalUpdate(
        this.goal.id,
        this.originalGoalData,
        updatedGoal
      );
      
      // Update the current goal
      Object.assign(this.goal, updatedGoal);
      
      // Store goal ID for navigation
      const goalId = this.goal.id;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        
        // Show success notification with details of what was updated
        this.showSuccessNotification(originalTitle, originalCategory, recordedUpdate);
        
        // Navigate back to goal detail page
        this.router.navigate(['/goal-detail', goalId]);
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  showSuccessNotification(originalTitle: string, originalCategory: string, recordedUpdate: any) {
    const changes = [];
    
    if (this.goal) {
      if (this.goal.title !== originalTitle) {
        changes.push(`Title: "${originalTitle}" → "${this.goal.title}"`);
      }
      if (this.goal.category !== originalCategory) {
        changes.push(`Category: "${originalCategory}" → "${this.goal.category}"`);
      }
      if (this.goal.description !== this.originalGoalData?.description) {
        changes.push('Description updated');
      }
      if (this.goal.deadline !== this.originalGoalData?.deadline) {
        changes.push('Deadline updated');
      }
      if (this.goal.targetValue !== this.originalGoalData?.targetValue) {
        changes.push('Target value updated');
      }
      if (this.goal.targetUnit !== this.originalGoalData?.targetUnit) {
        changes.push('Target unit updated');
      }
    }

    let message: string;
    if (changes.length > 0) {
      message = `Goal updated successfully! Changes: ${changes.join(', ')}`;
    } else {
      message = 'Goal updated successfully!';
    }

    // Add update history info
    if (recordedUpdate && recordedUpdate.changes.length > 0) {
      message += ` (Update #${recordedUpdate.id} recorded)`;
    }

    this.notificationService.success('Goal Updated', message, 5000);
  }

  markFormGroupTouched() {
    Object.keys(this.goalForm.controls).forEach(key => {
      const control = this.goalForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    if (this.goal?.id) {
      this.router.navigate(['/goal-detail', this.goal.id]);
    } else {
      this.router.navigate(['/goals-list']);
    }
  }
} 