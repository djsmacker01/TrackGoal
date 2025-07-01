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
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { CategoryService, CategoryConfig } from '../../services/category.service';
import { Category } from '../../goal.model';

@Component({
  selector: 'app-add-goal',
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
  styleUrls: ['./add-goal.component.scss'],
  template: `
    <div class="add-goal-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">Add New Goal</h1>
            <p class="page-subtitle">Set your next achievement in motion</p>
          </div>
        </div>
      </header>

      <!-- Main Form -->
      <main class="main-content">
        <mat-card class="form-card">
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
                     [ngClass]="{ 'selected': goalForm.get('category')?.value === category.name }"
                     (click)="selectCategory(category.name)">
                  <div class="category-icon">{{ category.icon }}</div>
                  <span class="category-name">{{ category.name }}</span>
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
                {{ isSubmitting ? 'Saving...' : 'Save Goal' }}
              </button>
            </div>
          </form>
        </mat-card>
      </main>
    </div>
  `
})
export class AddGoalComponent implements OnInit {
  goalForm!: FormGroup;
  isSubmitting = false;
  categories: CategoryConfig[] = [];

  goalTypes = [
    { value: 'binary', label: 'Binary (Complete/Incomplete)', icon: 'check_circle' },
    { value: 'numerical', label: 'Numerical Target', icon: 'trending_up' },
    { value: 'percentage', label: 'Percentage-based', icon: 'pie_chart' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.initForm();
  }

  loadCategories() {
    this.categories = this.categoryService.getCategories();
  }

  initForm() {
    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      goalType: ['', Validators.required],
      targetValue: [null],
      targetUnit: [''],
      deadline: ['', [Validators.required, this.futureDateValidator()]]
    });

    // Pre-select category if passed via query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.goalForm.patchValue({ category: params['category'] });
      }
    });
  }

  selectCategory(category: string) {
    this.goalForm.patchValue({ category });
  }

  isNumericalGoal(): boolean {
    return this.goalForm.get('goalType')?.value === 'numerical';
  }

  futureDateValidator() {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return { pastDate: true };
      }
      return null;
    };
  }

  onSubmit() {
    if (this.goalForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.notificationService.showSuccess('Goal created successfully!');
        this.router.navigate(['/dashboard']);
        this.isSubmitting = false;
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.goalForm.controls).forEach(key => {
      const control = this.goalForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
} 