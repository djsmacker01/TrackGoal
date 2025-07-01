import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { Goal, Milestone } from '../../goal.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-update-progress',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSliderModule,
    MatDividerModule
  ],
  styleUrls: ['./update-progress.component.scss'],
  template: `
    <div class="update-progress-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">Update Progress</h1>
            <p class="page-subtitle" *ngIf="goal">Update progress for "{{ goal.title }}"</p>
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
                    <span class="progress-text">{{ goal.progress.percent }}%</span>
                  </div>
                </div>
              </div>
              <div class="goal-stats">
                <div class="stat-item">
                  <mat-icon>flag</mat-icon>
                  <span>{{ goal.milestones.length }} milestones</span>
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

        <!-- Progress Update Form -->
        <section class="progress-form-section">
          <mat-card class="form-card">
            <div class="card-header">
              <h3 class="card-title">
                <mat-icon>trending_up</mat-icon>
                Update Progress
              </h3>
            </div>
            <form [formGroup]="progressForm" (ngSubmit)="onSubmit()" class="progress-form">
              
              <!-- Progress Input based on Goal Type -->
              <div class="progress-input-section">
                <h4 class="section-title">Progress Update</h4>
                
                <!-- Binary Goal Progress -->
                <div class="binary-progress" *ngIf="isBinaryGoal()">
                  <div class="completion-toggle">
                    <mat-checkbox formControlName="isCompleted" class="completion-checkbox">
                      Mark goal as completed
                    </mat-checkbox>
                    <div class="toggle-description">
                      <p>Check this box if you have achieved your goal</p>
                    </div>
                  </div>
                </div>

                <!-- Numerical Goal Progress -->
                <div class="numerical-progress" *ngIf="isNumericalGoal()">
                  <div class="current-value-input">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Current Value</mat-label>
                      <input matInput type="number" formControlName="currentValue" 
                             [placeholder]="'Enter current ' + goal.targetUnit">
                      <mat-icon matSuffix>{{ getCategoryIcon(goal.category) }}</mat-icon>
                      <mat-error *ngIf="progressForm.get('currentValue')?.hasError('required')">
                        Current value is required
                      </mat-error>
                      <mat-error *ngIf="progressForm.get('currentValue')?.hasError('min')">
                        Value must be greater than or equal to 0
                      </mat-error>
                      <mat-error *ngIf="progressForm.get('currentValue')?.hasError('max')">
                        Value cannot exceed target of {{ goal.targetValue }} {{ goal.targetUnit }}
                      </mat-error>
                    </mat-form-field>
                    <div class="target-reference">
                      <span class="target-label">Target: {{ goal.targetValue }} {{ goal.targetUnit }}</span>
                      <span class="current-label">Current: {{ getCurrentValue() }} {{ goal.targetUnit }}</span>
                    </div>
                  </div>
                </div>

                <!-- Percentage Goal Progress -->
                <div class="percentage-progress" *ngIf="isPercentageGoal()">
                  <div class="percentage-input">
                    <label class="percentage-label">Progress Percentage</label>
                    <div class="slider-container">
                      <mat-slider formControlName="percentage" 
                                 [min]="0" 
                                 [max]="100" 
                                 [step]="1"
                                 class="progress-slider">
                      </mat-slider>
                      <div class="percentage-display">
                        <span class="percentage-value">{{ progressForm.get('percentage')?.value || 0 }}%</span>
                      </div>
                    </div>
                    <div class="percentage-range">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progress Notes -->
              <div class="notes-section">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Progress Notes (Optional)</mat-label>
                  <textarea matInput formControlName="notes" 
                            placeholder="Describe what you accomplished, challenges faced, or next steps..."
                            rows="3"></textarea>
                  <mat-icon matSuffix>note</mat-icon>
                </mat-form-field>
              </div>

              <!-- Progress Date -->
              <div class="date-section">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Progress Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="progressDate">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
              </div>

              <!-- Milestone Completion Section -->
              <div class="milestones-section" *ngIf="getIncompleteMilestones().length > 0">
                <mat-divider></mat-divider>
                <h4 class="section-title">Complete Milestones</h4>
                <p class="section-description">Check milestones you've completed with this progress update:</p>
                
                <div class="milestones-list">
                  <div class="milestone-item" *ngFor="let milestone of getIncompleteMilestones()">
                    <mat-checkbox [value]="milestone.id" 
                                 (change)="onMilestoneToggle($event, milestone)"
                                 class="milestone-checkbox">
                      <div class="milestone-info">
                        <span class="milestone-title">{{ milestone.title }}</span>
                        <span class="milestone-due" *ngIf="milestone.dueDate">
                          Due: {{ milestone.dueDate | date:'MMM dd, yyyy' }}
                        </span>
                      </div>
                    </mat-checkbox>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button type="button" mat-button class="cancel-btn" (click)="goBack()">
                  <mat-icon>close</mat-icon>
                  Cancel
                </button>
                <button type="submit" mat-raised-button class="save-btn" 
                        [disabled]="progressForm.invalid || isSubmitting">
                  <mat-icon>save</mat-icon>
                  {{ isSubmitting ? 'Updating...' : 'Update Progress' }}
                </button>
              </div>
            </form>
          </mat-card>
        </section>

        <!-- Progress Preview -->
        <section class="preview-section">
          <mat-card class="preview-card">
            <div class="card-header">
              <h3 class="card-title">
                <mat-icon>preview</mat-icon>
                Progress Preview
              </h3>
            </div>
            <div class="preview-content">
              <!-- Before/After Comparison -->
              <div class="progress-comparison">
                <div class="comparison-item">
                  <span class="comparison-label">Current Progress</span>
                  <div class="progress-bar-container">
                    <mat-progress-bar 
                      [value]="goal.progress.percent" 
                      class="progress-bar current-progress">
                    </mat-progress-bar>
                    <span class="progress-text">{{ goal.progress.percent }}%</span>
                  </div>
                </div>
                
                <div class="comparison-item" *ngIf="getNewProgressPercent() !== goal.progress.percent">
                  <span class="comparison-label">New Progress</span>
                  <div class="progress-bar-container">
                    <mat-progress-bar 
                      [value]="getNewProgressPercent()" 
                      class="progress-bar new-progress">
                    </mat-progress-bar>
                    <span class="progress-text">{{ getNewProgressPercent() }}%</span>
                  </div>
                </div>
              </div>

              <!-- Celebration Message -->
              <div class="celebration-message" *ngIf="getNewProgressPercent() === 100 && goal.progress.percent < 100">
                <mat-icon class="celebration-icon">🎉</mat-icon>
                <h4>Congratulations!</h4>
                <p>You're about to complete your goal! This update will mark it as 100% complete.</p>
              </div>

              <!-- Milestone Completion Preview -->
              <div class="milestone-preview" *ngIf="getSelectedMilestones().length > 0">
                <h4>Milestones to Complete:</h4>
                <div class="milestone-preview-list">
                  <div class="milestone-preview-item" *ngFor="let milestone of getSelectedMilestones()">
                    <mat-icon>check_circle</mat-icon>
                    <span>{{ milestone.title }}</span>
                  </div>
                </div>
              </div>

              <!-- No Changes Message -->
              <div class="no-changes" *ngIf="!hasChanges()">
                <mat-icon>info</mat-icon>
                <p>Make changes to see the preview</p>
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
export class UpdateProgressComponent implements OnInit {
  progressForm!: FormGroup;
  goal: Goal | null = null;
  isSubmitting = false;
  selectedMilestones: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const goalId = params['goalId'];
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
      this.initForm();
    }
  }

  initForm() {
    if (!this.goal) return;

    const formControls: any = {
      notes: [''],
      progressDate: [new Date()]
    };

    // Add goal type specific controls
    if (this.isBinaryGoal()) {
      formControls.isCompleted = [this.goal.progress.percent === 100];
    } else if (this.isNumericalGoal()) {
      const currentValue = Math.round((this.goal.progress.percent / 100) * (this.goal.targetValue || 0));
      formControls.currentValue = [
        currentValue, 
        [
          Validators.required, 
          Validators.min(0), 
          Validators.max(this.goal.targetValue || 0)
        ]
      ];
    } else if (this.isPercentageGoal()) {
      formControls.percentage = [
        this.goal.progress.percent,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ];
    }

    this.progressForm = this.fb.group(formControls);
  }

  isBinaryGoal(): boolean {
    return !this.goal?.targetValue;
  }

  isNumericalGoal(): boolean {
    return !!(this.goal?.targetValue && this.goal?.targetUnit);
  }

  isPercentageGoal(): boolean {
    return !!(this.goal?.targetValue && !this.goal?.targetUnit);
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
    if (!this.goal) return '0';
    const circumference = 2 * Math.PI * 25;
    const offset = circumference - (this.goal.progress.percent / 100) * circumference;
    return offset.toString();
  }

  getCompletedMilestones(): number {
    if (!this.goal) return 0;
    return this.goal.milestones.filter(m => m.completed).length;
  }

  getDaysRemaining(deadline: Date): string {
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

  getCurrentValue(): number {
    if (!this.goal?.targetValue) return 0;
    return Math.round((this.goal.progress.percent / 100) * this.goal.targetValue);
  }

  getNewProgressPercent(): number {
    if (!this.goal) return 0;

    if (this.isBinaryGoal()) {
      return this.progressForm.get('isCompleted')?.value ? 100 : 0;
    } else if (this.isNumericalGoal()) {
      const currentValue = this.progressForm.get('currentValue')?.value || 0;
      const targetValue = this.goal.targetValue || 1;
      return Math.round((currentValue / targetValue) * 100);
    } else if (this.isPercentageGoal()) {
      return this.progressForm.get('percentage')?.value || 0;
    }

    return this.goal.progress.percent;
  }

  getIncompleteMilestones(): Milestone[] {
    if (!this.goal) return [];
    return this.goal.milestones.filter(m => !m.completed);
  }

  getSelectedMilestones(): Milestone[] {
    if (!this.goal) return [];
    return this.goal.milestones.filter(m => this.selectedMilestones.has(m.id));
  }

  onMilestoneToggle(event: any, milestone: Milestone) {
    if (event.checked) {
      this.selectedMilestones.add(milestone.id);
    } else {
      this.selectedMilestones.delete(milestone.id);
    }
  }

  hasChanges(): boolean {
    if (!this.goal) return false;

    const newProgress = this.getNewProgressPercent();
    const hasProgressChange = newProgress !== this.goal.progress.percent;
    const hasMilestoneChanges = this.selectedMilestones.size > 0;
    const hasNotes = this.progressForm.get('notes')?.value?.trim();

    return hasProgressChange || hasMilestoneChanges || hasNotes;
  }

  onSubmit() {
    if (this.progressForm.valid && this.goal) {
      this.isSubmitting = true;
      
      const formData = this.progressForm.value;
      const newProgressPercent = this.getNewProgressPercent();
      const progressChange = newProgressPercent - this.goal.progress.percent;
      
      // Update goal progress
      this.goal.progress.percent = newProgressPercent;
      
      // Update milestone completion status
      this.selectedMilestones.forEach(milestoneId => {
        const milestone = this.goal!.milestones.find(m => m.id === milestoneId);
        if (milestone) {
          milestone.completed = true;
        }
      });
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        
        // Show success message
        let message = `Progress updated to ${newProgressPercent}%`;
        if (progressChange > 0) {
          message += ` (+${progressChange}%)`;
        }
        if (this.selectedMilestones.size > 0) {
          message += ` and ${this.selectedMilestones.size} milestone(s) completed`;
        }
        
        this.notificationService.success(
          'Progress Updated', 
          message, 
          5000
        );
        
        // Navigate back to goal detail page
        this.router.navigate(['/goal-detail', this.goal!.id]);
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.progressForm.controls).forEach(key => {
      const control = this.progressForm.get(key);
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