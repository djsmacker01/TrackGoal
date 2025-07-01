import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  styleUrls: ['./delete-confirmation.component.scss'],
  template: `
    <div class="delete-confirmation-overlay" (click)="onOverlayClick($event)">
      <div class="delete-confirmation-dialog">
        <mat-card class="confirmation-card">
          <div class="card-header">
            <div class="warning-icon">
              <mat-icon>warning</mat-icon>
            </div>
            <h2 class="dialog-title">Delete Goal</h2>
          </div>
          
          <div class="card-content">
            <p class="confirmation-message">
              Are you sure you want to delete <strong>"{{ goalTitle }}"</strong>?
            </p>
            <p class="warning-message">
              This action cannot be undone. All progress, milestones, and history will be permanently removed.
            </p>
            
            <div class="goal-summary" *ngIf="goalDetails">
              <div class="summary-item">
                <mat-icon>flag</mat-icon>
                <span>{{ goalDetails.milestonesCount }} milestones</span>
              </div>
              <div class="summary-item">
                <mat-icon>trending_up</mat-icon>
                <span>{{ goalDetails.progressPercent }}% complete</span>
              </div>
              <div class="summary-item" *ngIf="goalDetails.daysActive">
                <mat-icon>schedule</mat-icon>
                <span>{{ goalDetails.daysActive }} days active</span>
              </div>
            </div>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="card-actions">
            <button mat-button class="cancel-btn" (click)="onCancel()">
              <mat-icon>close</mat-icon>
              Cancel
            </button>
            <button mat-raised-button class="delete-btn" (click)="onConfirm()">
              <mat-icon>delete</mat-icon>
              Delete Goal
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class DeleteConfirmationComponent {
  @Input() goalTitle: string = '';
  @Input() goalDetails?: {
    milestonesCount: number;
    progressPercent: number;
    daysActive?: number;
  };
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  onOverlayClick(event: Event) {
    // Close dialog when clicking on overlay
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
} 