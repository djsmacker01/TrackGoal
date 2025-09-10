import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-offline-mode',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="offline-container">
      <mat-card class="offline-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>cloud_off</mat-icon>
            TrackGoal Offline Mode
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>TrackGoal is currently running in offline mode.</p>
          <p>This could be due to:</p>
          <ul>
            <li>Network connectivity issues</li>
            <li>Supabase service configuration</li>
            <li>Development environment setup</li>
          </ul>
          <p>You can still explore the application interface, but data persistence features are not available.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="reload()">
            <mat-icon>refresh</mat-icon>
            Reload Application
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .offline-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .offline-card {
      max-width: 500px;
      width: 100%;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    ul {
      margin: 16px 0;
      padding-left: 20px;
    }
    
    li {
      margin: 8px 0;
    }
  `]
})
export class OfflineModeComponent {
  reload() {
    window.location.reload();
  }
}
