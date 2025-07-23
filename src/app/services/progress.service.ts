import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ProgressEntry {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  entry_date: string;
  created_at: string;
}

export interface ProgressUpdate {
  goalId: string;
  value: number;
  notes?: string;
  entryDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private progressSubject = new BehaviorSubject<ProgressEntry[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private supabaseService: SupabaseService) {}

  get progress$(): Observable<ProgressEntry[]> {
    return this.progressSubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  // Get progress entries for a specific goal
  getProgressEntries(goalId: string): Observable<ProgressEntry[]> {
    return from(this.supabaseService.getProgressEntries(goalId)).pipe(
      map(entries => {
        this.progressSubject.next(entries);
        return entries;
      }),
      catchError(error => {
        console.error('Error fetching progress entries:', error);
        return [];
      })
    );
  }

  // Create a new progress entry
  createProgressEntry(entry: Omit<ProgressEntry, 'id' | 'created_at'>): Observable<ProgressEntry> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.createProgressEntry(entry)).pipe(
      map(newEntry => {
        // Refresh progress for this goal
        this.getProgressEntries(entry.goal_id).subscribe();
        this.loadingSubject.next(false);
        return newEntry;
      }),
      catchError(error => {
        console.error('Error creating progress entry:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Update an existing progress entry
  updateProgressEntry(id: string, updates: Partial<ProgressEntry>): Observable<ProgressEntry> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.updateProgressEntry(id, updates)).pipe(
      map(updatedEntry => {
        // Refresh progress for this goal
        if (updatedEntry.goal_id) {
          this.getProgressEntries(updatedEntry.goal_id).subscribe();
        }
        this.loadingSubject.next(false);
        return updatedEntry;
      }),
      catchError(error => {
        console.error('Error updating progress entry:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Delete a progress entry
  deleteProgressEntry(id: string, goalId?: string): Observable<void> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.deleteProgressEntry(id)).pipe(
      map(() => {
        // Refresh progress for this goal if goalId is provided
        if (goalId) {
          this.getProgressEntries(goalId).subscribe();
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error deleting progress entry:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Get goal progress summary
  getGoalProgress(goalId: string): Observable<any> {
    return from(this.supabaseService.getGoalProgress(goalId)).pipe(
      catchError(error => {
        console.error('Error fetching goal progress:', error);
        return [];
      })
    );
  }

  // Calculate progress percentage for a goal
  calculateProgressPercentage(goalId: string, targetValue: number): Observable<number> {
    return this.getProgressEntries(goalId).pipe(
      map(entries => {
        if (entries.length === 0 || targetValue === 0) {
          return 0;
        }
        const latestEntry = entries.sort((a, b) => 
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
        )[0];
        return Math.round((latestEntry.value / targetValue) * 100);
      })
    );
  }

  // Get progress trend (increasing, decreasing, stable)
  getProgressTrend(goalId: string): Observable<'increasing' | 'decreasing' | 'stable'> {
    return this.getProgressEntries(goalId).pipe(
      map(entries => {
        if (entries.length < 2) {
          return 'stable';
        }
        
        const sortedEntries = entries.sort((a, b) => 
          new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
        );
        
        const recent = sortedEntries.slice(-2);
        const difference = recent[1].value - recent[0].value;
        
        if (difference > 0) {
          return 'increasing';
        }
        if (difference < 0) {
          return 'decreasing';
        }
        return 'stable';
      })
    );
  }

  // Get progress entries for a date range
  getProgressForDateRange(goalId: string, startDate: string, endDate: string): Observable<ProgressEntry[]> {
    return this.getProgressEntries(goalId).pipe(
      map(entries => entries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end;
      }))
    );
  }

  // Get latest progress entry for a goal
  getLatestProgress(goalId: string): Observable<ProgressEntry | null> {
    return this.getProgressEntries(goalId).pipe(
      map(entries => {
        if (entries.length === 0) {
          return null;
        }
        return entries.sort((a, b) => 
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
        )[0];
      })
    );
  }

  // Bulk update progress (for batch operations)
  bulkUpdateProgress(updates: ProgressUpdate[]): Observable<void> {
    this.loadingSubject.next(true);
    
    const promises = updates.map(update => 
      this.createProgressEntry({
        goal_id: update.goalId,
        value: update.value,
        notes: update.notes,
        entry_date: update.entryDate || new Date().toISOString()
      })
    );
    
    return from(Promise.all(promises)).pipe(
      map(() => {
        // Refresh progress for all affected goals
        const goalIds = [...new Set(updates.map(u => u.goalId))];
        goalIds.forEach(goalId => {
          this.getProgressEntries(goalId).subscribe();
        });
      }),
      catchError(error => {
        console.error('Error in bulk progress update:', error);
        throw error;
      }),
      map(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  // Error handling utilities
  handleError(error: any, operation: string): void {
    console.error(`Error in ${operation}:`, error);
    // You can add toast notifications here
  }
} 