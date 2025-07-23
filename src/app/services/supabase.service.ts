import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthResponse, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

// Database types
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  timeFormat?: string;
  notification_settings?: {
    emailNotifications?: boolean;
    goalReminders?: boolean;
    milestoneCelebrations?: boolean;
    weeklyReports?: boolean;
  };
  privacy_settings?: {
    profileVisible?: boolean;
    goalSharing?: boolean;
    analyticsSharing?: boolean;
  };
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'Health' | 'Career' | 'Personal' | 'Financial' | 'Habits';
  goal_type: 'binary' | 'numerical' | 'percentage';
  target_value?: number;
  current_value?: number;
  unit?: string;
  deadline?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_value?: number;
  completed: boolean;
  completed_at?: string;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressEntry {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  entry_date: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  private currentSession = new BehaviorSubject<Session | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.initializeAuth();
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  get session$(): Observable<Session | null> {
    return this.currentSession.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUser.value;
  }

  private async initializeAuth() {
    try {
      // Get initial session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting initial session:', error);
      }
      
      this.currentSession.next(session);
      this.currentUser.next(session?.user ?? null);

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        this.currentSession.next(session);
        this.currentUser.next(session?.user ?? null);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  // Check if auth is ready (session has been loaded)
  async isAuthReady(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return true;
    } catch (error) {
      console.error('Error checking auth readiness:', error);
      return false;
    }
  }

  // Authentication Methods
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const response = await this.supabase.auth.signUp({
      email,
      password
    });
    
    // Don't create profile here - it will be created when user first logs in
    // or we can create it in a separate step after email confirmation
    console.log('Signup response:', response);
    
    return response;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (response.data.user && !response.error) {
      // Check if user profile exists, if not create one
      try {
        const profile = await this.getUserProfile(response.data.user.id);
        if (!profile) {
          console.log('Creating user profile for:', response.data.user.id);
          await this.createUserProfile(response.data.user.id);
        }
      } catch (error) {
        console.log('Error checking/creating user profile:', error);
        // Try to create profile anyway
        try {
          await this.createUserProfile(response.data.user.id);
        } catch (profileError) {
          console.error('Failed to create user profile:', profileError);
        }
      }
    }
    
    return response;
  }

  async signOut(): Promise<{ error: any }> {
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<any> {
    return this.supabase.auth.resetPasswordForEmail(email);
  }

  async updatePassword(password: string): Promise<any> {
    return this.supabase.auth.updateUser({ password });
  }

  // User Profile Methods
  async createUserProfile(userId: string): Promise<any> {
    const profile: Partial<UserProfile> = {
      id: userId,
      onboarding_completed: false
    };
    
    return this.supabase
      .from('users')
      .insert(profile);
  }

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const id = userId || this.currentUserValue?.id;
    if (!id) {
      return null;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<any> {
    const userId = this.currentUserValue?.id;
    if (!userId) {
      throw new Error('No authenticated user');
    }

    // First check if user profile exists, if not create it
    try {
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        console.log('Creating user profile before update:', userId);
        await this.createUserProfile(userId);
      }
    } catch (error) {
      console.log('Error checking user profile, creating new one:', error);
      await this.createUserProfile(userId);
    }

    return this.supabase
      .from('users')
      .update(profile)
      .eq('id', userId);
  }

  async completeOnboarding(): Promise<any> {
    return this.updateUserProfile({ onboarding_completed: true });
  }

  // Goals Methods
  async getGoals(): Promise<Goal[]> {
    const userId = this.currentUserValue?.id;
    if (!userId) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getGoalsWithFilters(filters?: { category?: string, status?: string, search?: string }): Promise<Goal[]> {
    const userId = this.currentUserValue?.id;
    if (!userId) {
      throw new Error('No authenticated user');
    }

    let query = this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getGoal(id: string): Promise<Goal | null> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getGoalWithDetails(id: string): Promise<Goal | null> {
    const { data, error } = await this.supabase
      .from('goals')
      .select(`
        *,
        milestones(*),
        progress_entries(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const userId = this.currentUserValue?.id;
    if (!userId) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await this.supabase
      .from('goals')
      .insert({
        ...goal,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteGoal(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Enhanced statistics methods
  async getGoalsStatistics(): Promise<any> {
    const userId = this.currentUserValue?.id;
    if (!userId) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await this.supabase
      .from('goals')
      .select('status, category')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(g => g.status === 'active').length,
      completed: data.filter(g => g.status === 'completed').length,
      paused: data.filter(g => g.status === 'paused').length,
      archived: data.filter(g => g.status === 'archived').length,
      byCategory: {} as any
    };

    // Count by category
    data.forEach(goal => {
      if (!stats.byCategory[goal.category]) {
        stats.byCategory[goal.category] = 0;
      }
      stats.byCategory[goal.category]++;
    });

    return stats;
  }

  // Milestones Methods
  async getMilestones(goalId: string): Promise<Milestone[]> {
    const { data, error } = await this.supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Promise<Milestone> {
    console.log('SupabaseService: Creating milestone:', milestone);
    
    const { data, error } = await this.supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) {
      console.error('SupabaseService: Error creating milestone:', error);
      throw error;
    }
    
    console.log('SupabaseService: Milestone created successfully:', data);
    return data;
  }

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const { data, error } = await this.supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMilestone(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async completeMilestone(id: string): Promise<Milestone> {
    return this.updateMilestone(id, {
      completed: true,
      completed_at: new Date().toISOString()
    });
  }

  // Progress Entries Methods
  async getProgressEntries(goalId: string): Promise<ProgressEntry[]> {
    const { data, error } = await this.supabase
      .from('progress_entries')
      .select('*')
      .eq('goal_id', goalId)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createProgressEntry(entry: Omit<ProgressEntry, 'id' | 'created_at'>): Promise<ProgressEntry> {
    const { data, error } = await this.supabase
      .from('progress_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProgressEntry(id: string, updates: Partial<ProgressEntry>): Promise<ProgressEntry> {
    const { data, error } = await this.supabase
      .from('progress_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProgressEntry(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('progress_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Analytics Methods
  async getGoalProgress(goalId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('progress_entries')
      .select('*')
      .eq('goal_id', goalId)
      .order('entry_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getGoalsByCategory(): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_goals_by_category');

    if (error) throw error;
    return data || [];
  }

  // Real-time subscriptions
  subscribeToGoals(callback: (payload: any) => void) {
    return this.supabase
      .channel('goals')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goals' }, 
        callback
      )
      .subscribe();
  }

  subscribeToMilestones(callback: (payload: any) => void) {
    return this.supabase
      .channel('milestones')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'milestones' },
        callback
      )
      .subscribe();
  }

  subscribeToAllProgress(callback: (payload: any) => void) {
    return this.supabase
      .channel('progress_entries')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'progress_entries' },
        callback
      )
      .subscribe();
  }

  subscribeToProgress(goalId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`progress-${goalId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'progress_entries', filter: `goal_id=eq.${goalId}` }, 
        callback
      )
      .subscribe();
  }

  // Test methods for the simple test component
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('goals')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async testDatabase(): Promise<any> {
    try {
      // Test basic database operations
      const userId = this.currentUserValue?.id;
      if (!userId) {
        return { error: 'No authenticated user' };
      }

      // Test creating a goal
      const testGoal = {
        title: `Test Goal ${new Date().toISOString()}`,
        description: 'This is a test goal',
        category: 'Health' as const,
        goal_type: 'numerical' as const,
        target_value: 100,
        unit: 'steps',
        status: 'active' as const
      };

      const { data: createdGoal, error: createError } = await this.supabase
        .from('goals')
        .insert(testGoal)
        .select()
        .single();

      if (createError) {
        return { error: `Create goal failed: ${createError.message}` };
      }

      // Test getting goals
      const { data: goals, error: getError } = await this.supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (getError) {
        return { error: `Get goals failed: ${getError.message}` };
      }

      // Test deleting the test goal
      if (createdGoal) {
        await this.supabase
          .from('goals')
          .delete()
          .eq('id', createdGoal.id);
      }

      return {
        success: true,
        goalsCount: goals?.length || 0,
        testGoalCreated: !!createdGoal
      };
    } catch (error) {
      return { error: `Database test failed: ${error}` };
    }
  }
} 