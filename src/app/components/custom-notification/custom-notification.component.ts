import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showClose?: boolean;
}

@Component({
  selector: 'app-custom-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="notification-container" [ngClass]="notificationClass" [@slideInOut]>
      <div class="notification-content">
        <div class="notification-icon">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <div class="notification-text">
          <h4 class="notification-title">{{ data.title }}</h4>
          <p class="notification-message">{{ data.message }}</p>
        </div>
        <button 
          *ngIf="data.showClose !== false" 
          mat-icon-button 
          class="close-btn" 
          (click)="close()"
          aria-label="Close notification">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="notification-progress" *ngIf="data.duration">
        <div class="progress-bar" [style.width.%]="progressPercent"></div>
      </div>
    </div>
  `,
  styleUrls: ['./custom-notification.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('void => in', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out')
      ]),
      transition('in => out', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class CustomNotificationComponent implements OnInit, OnDestroy {
  @Input() data!: NotificationData;
  @Output() closeNotification = new EventEmitter<void>();

  progressPercent = 100;
  private progressInterval: any;
  private closeTimeout: any;

  get notificationClass(): string {
    return `notification-${this.data.type}`;
  }

  ngOnInit() {
    if (this.data.duration && this.data.duration > 0) {
      this.startProgress();
    }
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  getIcon(): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[this.data.type] || 'info';
  }

  startProgress() {
    const duration = this.data.duration || 5000;
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const decrement = 100 / steps;

    this.progressInterval = setInterval(() => {
      this.progressPercent -= decrement;
      if (this.progressPercent <= 0) {
        this.close();
      }
    }, interval);
  }

  close() {
    this.clearTimers();
    this.closeNotification.emit();
  }

  private clearTimers() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  }
} 