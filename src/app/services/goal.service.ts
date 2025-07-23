import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Goal, Milestone, convertSupabaseGoal } from '../goal.model';
import { Observable, from, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface GoalFilters {
  category?: string;
  status?: string;
  search?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  private recentActivitySubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private supabaseService: SupabaseService) {
    this.loadGoals();
    this.loadRecentActivity();
  }

  get goals$(): Observable<Goal[]> {
    return this.goalsSubject.asObservable();
  }

  get recentActivity$(): Observable<any[]> {
    return this.recentActivitySubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  private async loadGoals() {
    try {
      this.loadingSubject.next(true);
      const supabaseGoals = await this.supabaseService.getGoals();
      const goals = supabaseGoals.map(convertSupabaseGoal);
      
      // Load milestones for each goal
      for (const goal of goals) {
        const milestones = await this.supabaseService.getMilestones(goal.id);
        goal.milestones = milestones;
        goal.nextMilestone = this.getNextMilestone(milestones);
      }
      
      this.goalsSubject.next(goals);
    } catch (error) {
      console.error('Error loading goals:', error);
      this.goalsSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async loadRecentActivity() {
    try {
      const userId = this.supabaseService.currentUserValue?.id;
      if (!userId) {
        this.recentActivitySubject.next([]);
        return;
      }

      // Get recent activity from progress entries, milestones, and goals
      const recentActivity = await this.getRecentActivityFromDatabase();
      this.recentActivitySubject.next(recentActivity);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      this.recentActivitySubject.next([]);
    }
  }

  private async getRecentActivityFromDatabase(): Promise<any[]> {
    const userId = this.supabaseService.currentUserValue?.id;
    if (!userId) return [];

    try {
      // Get recent progress entries
      const { data: progressEntries, error: progressError } = await this.supabaseService.client
        .from('progress_entries')
        .select(`
          *,
          goals!inner(title, category, unit)
        `)
        .eq('goals.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (progressError) throw progressError;

      // Get recent milestone completions
      const { data: milestones, error: milestoneError } = await this.supabaseService.client
        .from('milestones')
        .select(`
          *,
          goals!inner(title, category)
        `)
        .eq('goals.user_id', userId)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (milestoneError) throw milestoneError;

      // Get recent goal creations/updates
      const { data: goals, error: goalError } = await this.supabaseService.client
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (goalError) throw goalError;

      // Combine and format activities
      const activities: any[] = [];

      // Add progress entries
      progressEntries?.forEach((entry: any) => {
        activities.push({
          type: 'progress',
          title: `Updated progress for "${entry.goals.title}"`,
          description: `Added ${entry.value} ${entry.goals.unit || 'units'}`,
          timestamp: entry.created_at,
          icon: 'trending_up',
          category: entry.goals.category
        });
      });

      // Add milestone completions
      milestones?.forEach((milestone: any) => {
        activities.push({
          type: 'milestone',
          title: `Completed milestone: "${milestone.title}"`,
          description: `Goal: ${milestone.goals.title}`,
          timestamp: milestone.completed_at,
          icon: 'flag',
          category: milestone.goals.category
        });
      });

      // Add goal activities
      goals?.forEach((goal: any) => {
        const action = goal.status === 'completed' ? 'completed' : 
                      goal.status === 'archived' ? 'archived' : 'updated';
        activities.push({
          type: 'goal',
          title: `${action.charAt(0).toUpperCase() + action.slice(1)} goal: "${goal.title}"`,
          description: goal.description || `Goal in ${goal.category} category`,
          timestamp: goal.updated_at,
          icon: action === 'completed' ? 'check_circle' : 'edit',
          category: goal.category
        });
      });

      // Sort by timestamp and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    } catch (error) {
      console.error('Error getting recent activity from database:', error);
      return [];
    }
  }

  private addActivity(activity: any) {
    const currentActivities = this.recentActivitySubject.value;
    const updatedActivities = [activity, ...currentActivities].slice(0, 10);
    this.recentActivitySubject.next(updatedActivities);
  }

  private getNextMilestone(milestones: Milestone[]): string {
    const nextMilestone = milestones.find(m => !m.completed);
    return nextMilestone?.title || '';
  }

  // Enhanced goal methods with filtering
  getGoals(filters?: GoalFilters): Observable<Goal[]> {
    return from(this.supabaseService.getGoalsWithFilters(filters)).pipe(
      map(supabaseGoals => supabaseGoals.map(convertSupabaseGoal)),
      catchError(error => {
        console.error('Error fetching goals:', error);
        return [];
      })
    );
  }

  getGoalsByCategory(category: string): Observable<Goal[]> {
    return this.getGoals({ category });
  }

  getGoalsByStatus(status: string): Observable<Goal[]> {
    return this.getGoals({ status });
  }

  searchGoals(searchTerm: string): Observable<Goal[]> {
    return this.getGoals({ search: searchTerm });
  }

  getGoal(id: string): Observable<Goal | null> {
    return from(this.supabaseService.getGoalWithDetails(id)).pipe(
      map(supabaseGoal => supabaseGoal ? convertSupabaseGoal(supabaseGoal) : null),
      catchError(error => {
        console.error('Error fetching goal:', error);
        return of(null);
      })
    );
  }

  // Get a specific goal by ID
  getGoalById(goalId: string): Observable<Goal | null> {
    return from(this.getGoalByIdFromDatabase(goalId));
  }

  private async getGoalByIdFromDatabase(goalId: string): Promise<Goal | null> {
    try {
      const userId = this.supabaseService.currentUserValue?.id;
      if (!userId) return null;

      const { data: goal, error } = await this.supabaseService.client
        .from('goals')
        .select(`
          *,
          milestones(*),
          progress_entries(*)
        `)
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return goal;
    } catch (error) {
      console.error('Error fetching goal by ID:', error);
      return null;
    }
  }

  createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Observable<Goal> {
    return from(this.supabaseService.createGoal(goal)).pipe(
      map(convertSupabaseGoal),
      switchMap(newGoal => {
        // Refresh goals list after creation
        this.loadGoals();
        this.addActivity({ type: 'goal', title: `Created goal: "${newGoal.title}"`, description: newGoal.description || `Goal in ${newGoal.category} category`, timestamp: newGoal.created_at, icon: 'add_circle', category: newGoal.category });
        return [newGoal];
      })
    );
  }

  updateGoal(id: string, updates: Partial<Goal>): Observable<Goal> {
    return from(this.supabaseService.updateGoal(id, updates)).pipe(
      map(convertSupabaseGoal),
      switchMap(updatedGoal => {
        // Refresh goals list after update
        this.loadGoals();
        this.addActivity({ type: 'goal', title: `Updated goal: "${updatedGoal.title}"`, description: updatedGoal.description || `Goal in ${updatedGoal.category} category`, timestamp: updatedGoal.updated_at, icon: 'edit', category: updatedGoal.category });
        return [updatedGoal];
      })
    );
  }

  deleteGoal(id: string): Observable<void> {
    return from(this.supabaseService.deleteGoal(id)).pipe(
      switchMap(() => {
        // Refresh goals list after deletion
        this.loadGoals();
        this.addActivity({ type: 'goal', title: `Deleted goal`, description: `Goal with ID: ${id}`, timestamp: new Date(), icon: 'delete', category: 'Deleted' });
        return [];
      })
    );
  }

  // Goal status management
  markGoalComplete(goalId: string): Observable<Goal> {
    return this.updateGoal(goalId, { status: 'completed' }).pipe(
      switchMap(completedGoal => {
        this.addActivity({ type: 'goal', title: `Completed goal: "${completedGoal.title}"`, description: `Goal in ${completedGoal.category} category`, timestamp: completedGoal.updated_at, icon: 'check_circle', category: completedGoal.category });
        return [completedGoal];
      })
    );
  }

  archiveGoal(goalId: string): Observable<Goal> {
    return this.updateGoal(goalId, { status: 'archived' }).pipe(
      switchMap(archivedGoal => {
        this.addActivity({ type: 'goal', title: `Archived goal: "${archivedGoal.title}"`, description: `Goal in ${archivedGoal.category} category`, timestamp: archivedGoal.updated_at, icon: 'archive', category: archivedGoal.category });
        return [archivedGoal];
      })
    );
  }

  activateGoal(goalId: string): Observable<Goal> {
    return this.updateGoal(goalId, { status: 'active' }).pipe(
      switchMap(activatedGoal => {
        this.addActivity({ type: 'goal', title: `Activated goal: "${activatedGoal.title}"`, description: `Goal in ${activatedGoal.category} category`, timestamp: activatedGoal.updated_at, icon: 'play_arrow', category: activatedGoal.category });
        return [activatedGoal];
      })
    );
  }

  pauseGoal(goalId: string): Observable<Goal> {
    return this.updateGoal(goalId, { status: 'paused' }).pipe(
      switchMap(pausedGoal => {
        this.addActivity({ type: 'goal', title: `Paused goal: "${pausedGoal.title}"`, description: `Goal in ${pausedGoal.category} category`, timestamp: pausedGoal.updated_at, icon: 'pause', category: pausedGoal.category });
        return [pausedGoal];
      })
    );
  }

  duplicateGoal(goal: Goal): Observable<Goal> {
    const { id, user_id, created_at, updated_at, ...goalData } = goal;
    const duplicatedGoal = {
      ...goalData,
      title: `${goal.title} (Copy)`,
      status: 'active' as const
    };
    return this.createGoal(duplicatedGoal).pipe(
      switchMap(newGoal => {
        this.addActivity({ type: 'goal', title: `Duplicated goal: "${newGoal.title}"`, description: `Goal in ${newGoal.category} category`, timestamp: newGoal.created_at, icon: 'content_copy', category: newGoal.category });
        return [newGoal];
      })
    );
  }

  // Milestone methods
  getMilestones(goalId: string): Observable<Milestone[]> {
    return from(this.supabaseService.getMilestones(goalId));
  }

  createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Observable<Milestone> {
    console.log('GoalService: Creating milestone:', milestone);
    return from(this.supabaseService.createMilestone(milestone)).pipe(
      map(result => {
        console.log('GoalService: Milestone created:', result);
        return result;
      }),
      catchError(error => {
        console.error('GoalService: Error creating milestone:', error);
        throw error;
      })
    );
  }

  updateMilestone(id: string, updates: Partial<Milestone>): Observable<Milestone> {
    console.log('GoalService: Updating milestone:', id, updates);
    return from(this.supabaseService.updateMilestone(id, updates)).pipe(
      map(result => {
        console.log('GoalService: Milestone updated:', result);
        return result;
      }),
      catchError(error => {
        console.error('GoalService: Error updating milestone:', error);
        throw error;
      })
    );
  }

  deleteMilestone(id: string): Observable<void> {
    return from(this.supabaseService.deleteMilestone(id));
  }

  completeMilestone(id: string): Observable<Milestone> {
    console.log('GoalService: Completing milestone:', id);
    return from(this.supabaseService.completeMilestone(id)).pipe(
      map(result => {
        console.log('GoalService: Milestone completed:', result);
        return result;
      }),
      catchError(error => {
        console.error('GoalService: Error completing milestone:', error);
        throw error;
      })
    );
  }

  // Progress methods
  getProgressEntries(goalId: string): Observable<any[]> {
    return from(this.supabaseService.getProgressEntries(goalId));
  }

  createProgressEntry(entry: any): Observable<any> {
    return from(this.supabaseService.createProgressEntry(entry)).pipe(
      switchMap((newEntry: any) => {
        // Get the goal details for the activity
        this.supabaseService.client
          .from('goals')
          .select('title, category, unit')
          .eq('id', newEntry.goal_id)
          .single()
          .then(({ data: goal }) => {
            if (goal) {
              this.addActivity({ 
                type: 'progress', 
                title: `Updated progress for "${goal.title}"`, 
                description: `${newEntry.value} ${goal.unit || 'units'}`, 
                timestamp: newEntry.created_at, 
                icon: 'trending_up', 
                category: goal.category 
              });
            }
          });
        return [newEntry];
      })
    );
  }

  updateProgressEntry(id: string, updates: any): Observable<any> {
    return from(this.supabaseService.updateProgressEntry(id, updates));
  }

  deleteProgressEntry(id: string): Observable<void> {
    return from(this.supabaseService.deleteProgressEntry(id));
  }

  // Analytics and statistics
  getGoalsStatistics(): Observable<any> {
    return from(this.supabaseService.getGoalsStatistics());
  }

  getGoalsByCategoryStats(): Observable<any> {
    return from(this.supabaseService.getGoalsByCategory());
  }

  // Dynamic statistics methods
  async getDynamicStatistics(): Promise<any> {
    const userId = this.supabaseService.currentUserValue?.id;
    if (!userId) return this.getDefaultStatistics();

    try {
      // Get all goals for the user
      const { data: goals, error: goalsError } = await this.supabaseService.client
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (goalsError) {
        throw goalsError;
      }

      // Get recent progress entries for streak calculation
      const { data: progressEntries, error: progressError } = await this.supabaseService.client
        .from('progress_entries')
        .select('created_at, goals!inner(user_id)')
        .eq('goals.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (progressError) {
        throw progressError;
      }

      // Calculate statistics
      const activeGoals = goals?.filter(g => g.status === 'active').length || 0;
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
      const totalGoals = goals?.length || 0;
      
      // Calculate overall progress based on completed goals and progress-based goals
      let overallProgress = 0;
      if (totalGoals > 0) {
        const completedProgress = (completedGoals / totalGoals) * 100;
        
        // Also consider progress-based goals
        const progressGoals = goals?.filter(g => g.status === 'active' && g.progress_type === 'percentage') || [];
        let progressSum = 0;
        progressGoals.forEach(goal => {
          progressSum += goal.progress?.percent || 0;
        });
        
        const averageProgress = progressGoals.length > 0 ? progressSum / progressGoals.length : 0;
        
        // Weight the calculation: 70% from completed goals, 30% from progress
        overallProgress = Math.round((completedProgress * 0.7) + (averageProgress * 0.3));
      }
      
      // Calculate streak (consecutive days with activity)
      const streak = this.calculateStreak(progressEntries || []);
      
      // Calculate weekly completion
      const thisWeek = this.getCompletedThisWeek(goals || []);
      
      // Calculate progress trend
      const trend = this.calculateProgressTrend(goals || []);

      return {
        activeGoals,
        completedGoals,
        totalGoals,
        overallProgress,
        streak,
        thisWeek,
        trend
      };
    } catch (error) {
      console.error('Error getting dynamic statistics:', error);
      return this.getDefaultStatistics();
    }
  }

  private getDefaultStatistics() {
    return {
      activeGoals: 0,
      completedGoals: 0,
      totalGoals: 0,
      overallProgress: 0,
      streak: 0,
      thisWeek: 0,
      trend: 'neutral'
    };
  }

  private calculateStreak(progressEntries: any[]): number {
    if (progressEntries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Get unique dates from progress entries
    const dates = progressEntries.map(entry => {
      const date = new Date(entry.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a); // Sort descending
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check consecutive days starting from today
    while (true) {
      const dateTime = currentDate.getTime();
      if (uniqueDates.includes(dateTime)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getCompletedThisWeek(goals: any[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    return goals.filter(goal => {
      if (goal.status !== 'completed') return false;
      const completedDate = new Date(goal.updated_at);
      return completedDate >= oneWeekAgo;
    }).length;
  }

  private calculateProgressTrend(goals: any[]): string {
    if (goals.length === 0) return 'neutral';
    
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalGoals = goals.length;
    const completionRate = completedGoals / totalGoals;
    
    if (completionRate >= 0.7) return 'positive';
    if (completionRate >= 0.4) return 'neutral';
    return 'negative';
  }

  // Refresh goals data
  refreshGoals(): void {
    this.loadGoals();
  }

  // Subscribe to real-time goal updates
  subscribeToGoals(callback: (payload: any) => void) {
    return this.supabaseService.subscribeToGoals((payload) => {
      callback(payload);
      this.loadGoals(); // Refresh goals when changes occur
      this.loadRecentActivity(); // Refresh recent activity
    });
  }

  // Subscribe to real-time milestone updates
  subscribeToMilestones(callback: (payload: any) => void) {
    return this.supabaseService.subscribeToMilestones((payload) => {
      callback(payload);
      this.loadGoals(); // Refresh goals/milestones when changes occur
      this.loadRecentActivity(); // Refresh recent activity
    });
  }

  // Subscribe to real-time progress entry updates
  subscribeToAllProgress(callback: (payload: any) => void) {
    return this.supabaseService.subscribeToAllProgress((payload) => {
      callback(payload);
      this.loadGoals(); // Refresh goals/progress when changes occur
      this.loadRecentActivity(); // Refresh recent activity
    });
  }

  // Error handling utilities
  handleError(error: any, operation: string): void {
    console.error(`Error in ${operation}:`, error);
    // You can add toast notifications here
  }

  // Get activity for a specific goal
  getGoalActivity(goalId: string): Observable<any[]> {
    return from(this.getGoalActivityFromDatabase(goalId));
  }

  private async getGoalActivityFromDatabase(goalId: string): Promise<any[]> {
    try {
      // Get progress entries for this goal
      const { data: progressEntries, error: progressError } = await this.supabaseService.client
        .from('progress_entries')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (progressError) throw progressError;

      // Get milestone completions for this goal
      const { data: milestones, error: milestoneError } = await this.supabaseService.client
        .from('milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (milestoneError) throw milestoneError;

      // Combine and format activities
      const activities: any[] = [];

      // Add progress entries
      progressEntries?.forEach(entry => {
        activities.push({
          id: `progress_${entry.id}`,
          type: 'progress_updated',
          title: 'Progress Updated',
          description: `Updated progress to ${entry.progress_value}%`,
          value: entry.progress_value,
          created_at: entry.created_at
        });
      });

      // Add milestone completions
      milestones?.forEach(milestone => {
        if (milestone.completed) {
          activities.push({
            id: `milestone_${milestone.id}`,
            type: 'milestone_completed',
            title: 'Milestone Completed',
            description: `Completed "${milestone.title}" milestone`,
            created_at: milestone.updated_at || milestone.created_at
          });
        }
      });

      // Sort by date (most recent first) and limit to 10
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

    } catch (error) {
      console.error('Error fetching goal activity:', error);
      return [];
    }
  }
} 