import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationSettings {
  emailNotifications: boolean;
  goalReminders: boolean;
  milestoneCelebrations: boolean;
  weeklyReports: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {
  private settings = new BehaviorSubject<NotificationSettings>({
    emailNotifications: true,
    goalReminders: true,
    milestoneCelebrations: true,
    weeklyReports: false
  });

  constructor() {
    this.loadSettings();
  }

  get settings$() {
    return this.settings.asObservable();
  }

  get currentSettings(): NotificationSettings {
    return this.settings.value;
  }

  private loadSettings() {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings.next({ ...this.settings.value, ...parsed });
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>) {
    const updated = { ...this.settings.value, ...newSettings };
    this.settings.next(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  }

  shouldSendEmailNotification(): boolean {
    return this.settings.value.emailNotifications;
  }

  shouldSendGoalReminder(): boolean {
    return this.settings.value.goalReminders;
  }

  shouldSendMilestoneCelebration(): boolean {
    return this.settings.value.milestoneCelebrations;
  }

  shouldSendWeeklyReport(): boolean {
    return this.settings.value.weeklyReports;
  }

  // Notification methods
  async sendGoalReminder(goalTitle: string, userId: string) {
    if (!this.shouldSendGoalReminder()) {
      return;
    }

    // TODO: Implement actual notification sending
    console.log(`Sending goal reminder for: ${goalTitle} to user: ${userId}`);
  }

  async sendMilestoneCelebration(milestoneTitle: string, goalTitle: string, userId: string) {
    if (!this.shouldSendMilestoneCelebration()) {
      return;
    }

    // TODO: Implement actual notification sending
    console.log(`Sending milestone celebration for: ${milestoneTitle} in goal: ${goalTitle} to user: ${userId}`);
  }

  async sendWeeklyReport(userId: string, reportData: any) {
    if (!this.shouldSendWeeklyReport()) {
      return;
    }

    // TODO: Implement actual weekly report sending
    console.log(`Sending weekly report to user: ${userId}`, reportData);
  }

  async sendEmailNotification(subject: string, message: string, userId: string) {
    if (!this.shouldSendEmailNotification()) {
      return;
    }

    // TODO: Implement actual email sending
    console.log(`Sending email notification: ${subject} to user: ${userId}`);
  }
} 