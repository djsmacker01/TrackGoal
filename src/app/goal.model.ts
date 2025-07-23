export type Category = 'Health' | 'Career' | 'Personal' | 'Financial' | 'Habits';
export type GoalType = 'binary' | 'numerical' | 'percentage';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface Progress {
  percent: number; // 0-100
  currentValue?: number;
  targetValue?: number;
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

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: Category;
  goal_type: GoalType;
  target_value?: number;
  current_value?: number;
  unit?: string;
  deadline?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  
  // Computed properties for compatibility
  progress?: Progress;
  nextMilestone?: string;
  milestones?: Milestone[];
  
  // Legacy properties for backward compatibility
  targetValue?: number;
  targetUnit?: string;
}

export interface GoalFormData {
  title: string;
  description: string;
  category: Category;
  goalType: GoalType;
  targetValue?: number;
  targetUnit?: string;
  deadline: Date;
}

// Helper function to convert Supabase Goal to local Goal
export function convertSupabaseGoal(supabaseGoal: any): Goal {
  const progress = {
    percent: supabaseGoal.current_value && supabaseGoal.target_value 
      ? Math.round((supabaseGoal.current_value / supabaseGoal.target_value) * 100)
      : 0,
    currentValue: supabaseGoal.current_value,
    targetValue: supabaseGoal.target_value
  };

  return {
    ...supabaseGoal,
    progress,
    nextMilestone: '', // Will be populated by service
    milestones: [], // Will be populated by service
    // Legacy property mapping
    targetValue: supabaseGoal.target_value,
    targetUnit: supabaseGoal.unit
  };
}

// Helper function to convert local Goal to Supabase format
export function convertToSupabaseGoal(goal: Goal): any {
  return {
    id: goal.id,
    user_id: goal.user_id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    goal_type: goal.goal_type,
    target_value: goal.target_value || goal.targetValue,
    current_value: goal.current_value,
    unit: goal.unit || goal.targetUnit,
    deadline: goal.deadline,
    status: goal.status,
    created_at: goal.created_at,
    updated_at: goal.updated_at
  };
} 