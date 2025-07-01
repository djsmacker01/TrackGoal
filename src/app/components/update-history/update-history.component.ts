import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { GoalUpdate, UpdateHistory } from '../../models/update-history.model';

@Component({
  selector: 'app-update-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatChipsModule
  ],
  template: `
    <div class="update-history-container" *ngIf="updateHistory && updateHistory.updates.length > 0">
      <div class="history-header">
        <h3 class="history-title">
          <mat-icon>history</mat-icon>
          Update History
        </h3>
        <div class="history-stats">
          <span class="stat-item">
            <mat-icon>update</mat-icon>
            {{ updateHistory.totalUpdates }} updates
          </span>
          <span class="stat-item">
            <mat-icon>schedule</mat-icon>
            Last: {{ getLastUpdateTime() }}
          </span>
        </div>
      </div>

      <div class="updates-list">
        <mat-card class="update-card" *ngFor="let update of updateHistory.updates; trackBy: trackByUpdateId">
          <div class="update-header">
            <div class="update-meta">
              <div class="update-type">
                <mat-icon [ngClass]="getUpdateTypeIcon(update.updateType).class">
                  {{ getUpdateTypeIcon(update.updateType).icon }}
                </mat-icon>
                <span class="type-label">{{ getUpdateTypeLabel(update.updateType) }}</span>
              </div>
              <div class="update-time">
                {{ formatTimestamp(update.timestamp) }}
              </div>
            </div>
            <div class="update-summary">
              <span class="changes-count">{{ update.changes.length }} change{{ update.changes.length !== 1 ? 's' : '' }}</span>
            </div>
          </div>

          <div class="update-details">
            <div class="changes-list">
              <div class="change-item" *ngFor="let change of update.changes">
                <div class="change-field">
                  <span class="field-label">{{ change.fieldLabel }}:</span>
                </div>
                <div class="change-values">
                  <div class="old-value">
                    <mat-icon>remove</mat-icon>
                    <span class="value-text">{{ change.oldValue }}</span>
                  </div>
                  <div class="new-value">
                    <mat-icon>add</mat-icon>
                    <span class="value-text">{{ change.newValue }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="update-note" *ngIf="update.userNote">
              <mat-icon>note</mat-icon>
              <span class="note-text">{{ update.userNote }}</span>
            </div>
          </div>
        </mat-card>
      </div>

      <div class="no-updates" *ngIf="!updateHistory || updateHistory.updates.length === 0">
        <mat-card class="empty-card">
          <div class="empty-content">
            <mat-icon>history</mat-icon>
            <h4>No Updates Yet</h4>
            <p>This goal hasn't been updated yet. Changes will appear here once you make edits.</p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./update-history.component.scss']
})
export class UpdateHistoryComponent implements OnInit {
  @Input() updateHistory: UpdateHistory | null = null;

  constructor() {}

  ngOnInit() {}

  trackByUpdateId(index: number, update: GoalUpdate): string {
    return update.id;
  }

  getUpdateTypeIcon(type: string): { icon: string; class: string } {
    const icons = {
      edit: { icon: 'edit', class: 'edit-icon' },
      milestone: { icon: 'flag', class: 'milestone-icon' },
      progress: { icon: 'trending_up', class: 'progress-icon' },
      status_change: { icon: 'swap_horiz', class: 'status-icon' }
    };
    return icons[type as keyof typeof icons] || { icon: 'update', class: 'default-icon' };
  }

  getUpdateTypeLabel(type: string): string {
    const labels = {
      edit: 'Goal Edited',
      milestone: 'Milestone Updated',
      progress: 'Progress Updated',
      status_change: 'Status Changed'
    };
    return labels[type as keyof typeof labels] || 'Updated';
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getLastUpdateTime(): string {
    if (!this.updateHistory || this.updateHistory.updates.length === 0) {
      return 'Never';
    }
    return this.formatTimestamp(this.updateHistory.updates[0].timestamp);
  }
} 