export type Category = 'Health' | 'Career' | 'Personal' | 'Financial' | 'Habits';

export interface Progress {
  percent: number; // 0-100
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

export interface Goal {
  title: string;
  category: Category;
  progress: Progress;
  nextMilestone: string;
  milestones: Milestone[];
} 