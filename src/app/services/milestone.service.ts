import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Milestone } from '../goal.model';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private milestonesSubject = new BehaviorSubject<Milestone[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private supabaseService: SupabaseService) {}

  get milestones$(): Observable<Milestone[]> {
    return this.milestonesSubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  // Get milestones for a specific goal
  getMilestones(goalId: string): Observable<Milestone[]> {
    return from(this.supabaseService.getMilestones(goalId)).pipe(
      map(milestones => {
        this.milestonesSubject.next(milestones);
        return milestones;
      }),
      catchError(error => {
        console.error('Error fetching milestones:', error);
        return [];
      })
    );
  }

  // Create a new milestone
  createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Observable<Milestone> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.createMilestone(milestone)).pipe(
      map(newMilestone => {
        // Refresh milestones for this goal
        this.getMilestones(milestone.goal_id).subscribe();
        this.loadingSubject.next(false);
        return newMilestone;
      }),
      catchError(error => {
        console.error('Error creating milestone:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Update an existing milestone
  updateMilestone(id: string, updates: Partial<Milestone>): Observable<Milestone> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.updateMilestone(id, updates)).pipe(
      map(updatedMilestone => {
        // Refresh milestones for this goal
        if (updatedMilestone.goal_id) {
          this.getMilestones(updatedMilestone.goal_id).subscribe();
        }
        this.loadingSubject.next(false);
        return updatedMilestone;
      }),
      catchError(error => {
        console.error('Error updating milestone:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Delete a milestone
  deleteMilestone(id: string, goalId?: string): Observable<void> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.deleteMilestone(id)).pipe(
      map(() => {
        // Refresh milestones for this goal if goalId is provided
        if (goalId) {
          this.getMilestones(goalId).subscribe();
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error deleting milestone:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Mark milestone as completed
  completeMilestone(id: string, goalId?: string): Observable<Milestone> {
    this.loadingSubject.next(true);
    
    return from(this.supabaseService.completeMilestone(id)).pipe(
      map(completedMilestone => {
        // Refresh milestones for this goal if goalId is provided
        if (goalId) {
          this.getMilestones(goalId).subscribe();
        }
        this.loadingSubject.next(false);
        return completedMilestone;
      }),
      catchError(error => {
        console.error('Error completing milestone:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Get completed milestones for a goal
  getCompletedMilestones(goalId: string): Observable<Milestone[]> {
    return this.getMilestones(goalId).pipe(
      map(milestones => milestones.filter(m => m.completed))
    );
  }

  // Get incomplete milestones for a goal
  getIncompleteMilestones(goalId: string): Observable<Milestone[]> {
    return this.getMilestones(goalId).pipe(
      map(milestones => milestones.filter(m => !m.completed))
    );
  }

  // Get milestone completion percentage for a goal
  getMilestoneCompletionPercentage(goalId: string): Observable<number> {
    return this.getMilestones(goalId).pipe(
      map(milestones => {
        if (milestones.length === 0) {
          return 0;
        }
        const completed = milestones.filter(m => m.completed).length;
        return Math.round((completed / milestones.length) * 100);
      })
    );
  }

  // Reorder milestones
  reorderMilestones(goalId: string, milestoneIds: string[]): Observable<void> {
    this.loadingSubject.next(true);
    
    const updates = milestoneIds.map((id, index) => ({
      id,
      order_index: index
    }));

    return from(Promise.all(updates.map(update => 
      this.supabaseService.updateMilestone(update.id, { order_index: update.order_index })
    ))).pipe(
      map(() => {
        // Refresh milestones for this goal
        this.getMilestones(goalId).subscribe();
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error reordering milestones:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Error handling utilities
  handleError(error: any, operation: string): void {
    console.error(`Error in ${operation}:`, error);
    // You can add toast notifications here
  }
} 