export type Category = 'Health' | 'Career' | 'Personal' | 'Financial' | 'Habits';

export interface Progress {
  percent: number; // 0-100
}

export interface Goal {
  title: string;
  category: Category;
  progress: Progress;
  nextMilestone: string;
} 