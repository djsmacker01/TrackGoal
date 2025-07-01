export type Category = string;
export type GoalType = 'binary' | 'numerical' | 'percentage';

export interface Progress {
  percent: number; // 0-100
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  description?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: Category;
  progress: Progress;
  nextMilestone: string;
  deadline?: Date;
  status?: 'active' | 'completed' | 'overdue' | 'archived';
  targetValue?: number;
  targetUnit?: string;
  description?: string;
  milestones: Milestone[];
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