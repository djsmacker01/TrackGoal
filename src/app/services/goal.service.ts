import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  public goals$ = this.goalsSubject.asObservable();
  
  private recentActivitySubject = new BehaviorSubject<string[]>([
    'Completed a 5km run',
    'Read 30 pages of "Atomic Habits"',
    'Saved $200 towards financial goal',
    'Attended leadership meeting'
  ]);
  public recentActivity$ = this.recentActivitySubject.asObservable();

  constructor() {
    this.initializeGoals();
  }

  private initializeGoals() {
    const initialGoals: Goal[] = [
      {
        id: '1',
        title: 'Run 5km 3x/week',
        category: 'Health',
        progress: { percent: 70 },
        nextMilestone: 'Complete 2 more runs',
        deadline: new Date('2024-02-15'),
        status: 'active',
        targetValue: 12,
        targetUnit: 'runs',
        description: 'Build endurance and improve cardiovascular health by running 5km three times per week. This will help me prepare for a half marathon later this year.',
        milestones: [
          { id: '1', title: 'Run 5km once', completed: true, dueDate: new Date('2024-01-15'), description: 'Complete your first 5km run to establish the baseline for your training program.' },
          { id: '2', title: 'Run 5km twice', completed: true, dueDate: new Date('2024-01-22'), description: 'Run 5km twice in one week to build consistency and endurance.' },
          { id: '3', title: 'Run 5km 3 times', completed: false, dueDate: new Date('2024-01-29'), description: 'Achieve the target frequency of running 5km three times per week.' },
          { id: '4', title: 'Maintain for 4 weeks', completed: false, dueDate: new Date('2024-02-26'), description: 'Sustain the 3x/week running schedule for a full month to establish the habit.' }
        ]
      },
      {
        id: '2',
        title: 'Read 12 books',
        category: 'Personal',
        progress: { percent: 50 },
        nextMilestone: 'Finish "Atomic Habits"',
        deadline: new Date('2024-12-31'),
        status: 'active',
        targetValue: 12,
        targetUnit: 'books',
        description: 'Expand knowledge and develop reading habit by completing 12 books this year. Focus on personal development and business books.',
        milestones: [
          { id: '1', title: 'Read 3 books', completed: true, dueDate: new Date('2024-03-31'), description: 'Complete the first quarter of your reading goal by finishing 3 books.' },
          { id: '2', title: 'Read 6 books', completed: true, dueDate: new Date('2024-06-30'), description: 'Reach the halfway point of your annual reading challenge.' },
          { id: '3', title: 'Read 9 books', completed: false, dueDate: new Date('2024-09-30'), description: 'Complete 75% of your reading goal with 9 books finished.' },
          { id: '4', title: 'Read 12 books', completed: false, dueDate: new Date('2024-12-31'), description: 'Achieve your complete reading goal of 12 books for the year.' }
        ]
      },
      {
        id: '3',
        title: 'Save $5,000',
        category: 'Financial',
        progress: { percent: 40 },
        nextMilestone: 'Reach $2,000 saved',
        deadline: new Date('2024-06-30'),
        status: 'active',
        targetValue: 5000,
        targetUnit: 'dollars',
        description: 'Build financial security by saving $5,000 for emergency fund and future investments. This will provide a safety net and enable better financial planning.',
        milestones: [
          { id: '1', title: 'Save $1,000', completed: true, dueDate: new Date('2024-02-28'), description: 'Reach the first milestone of $1,000 saved for your emergency fund.' },
          { id: '2', title: 'Save $2,000', completed: false, dueDate: new Date('2024-03-31'), description: 'Double your savings to $2,000, building a solid foundation.' },
          { id: '3', title: 'Save $3,500', completed: false, dueDate: new Date('2024-05-31'), description: 'Reach 70% of your savings goal with $3,500 accumulated.' },
          { id: '4', title: 'Save $5,000', completed: false, dueDate: new Date('2024-06-30'), description: 'Achieve your complete savings goal of $5,000 for financial security.' }
        ]
      },
      {
        id: '4',
        title: 'Get a promotion',
        category: 'Career',
        progress: { percent: 20 },
        nextMilestone: 'Complete leadership course',
        deadline: new Date('2024-03-15'),
        status: 'overdue',
        targetValue: 1,
        targetUnit: 'promotion',
        description: 'Advance my career by securing a promotion to senior level. This involves developing leadership skills, taking on more responsibilities, and demonstrating value to the organization.',
        milestones: [
          { id: '1', title: 'Complete leadership course', completed: false, dueDate: new Date('2024-02-15'), description: 'Finish the required leadership development program to qualify for promotion.' },
          { id: '2', title: 'Update resume', completed: false, dueDate: new Date('2024-02-28'), description: 'Revise and enhance your resume to highlight recent achievements and skills.' },
          { id: '3', title: 'Apply for positions', completed: false, dueDate: new Date('2024-03-10'), description: 'Submit applications for senior-level positions within the company.' },
          { id: '4', title: 'Get promoted', completed: false, dueDate: new Date('2024-03-15'), description: 'Successfully secure the promotion to senior level position.' }
        ]
      },
      {
        id: '5',
        title: 'Learn Spanish basics',
        category: 'Personal',
        progress: { percent: 100 },
        nextMilestone: 'Goal completed!',
        deadline: new Date('2024-01-31'),
        status: 'completed',
        targetValue: 1,
        targetUnit: 'language level',
        description: 'Learn basic Spanish conversation skills to enhance travel experiences and cultural understanding. Focus on practical phrases and everyday communication.',
        milestones: [
          { id: '1', title: 'Complete beginner course', completed: true, dueDate: new Date('2024-01-10'), description: 'Finish the introductory Spanish course covering basic grammar and vocabulary.' },
          { id: '2', title: 'Practice for 30 days', completed: true, dueDate: new Date('2024-01-20'), description: 'Consistently practice Spanish for 30 consecutive days to build fluency.' },
          { id: '3', title: 'Have first conversation', completed: true, dueDate: new Date('2024-01-25'), description: 'Successfully hold your first conversation in Spanish with a native speaker.' },
          { id: '4', title: 'Master basic phrases', completed: true, dueDate: new Date('2024-01-31'), description: 'Achieve proficiency in essential Spanish phrases for everyday situations.' }
        ]
      }
    ];

    this.goalsSubject.next(initialGoals);
  }

  getGoals(): Observable<Goal[]> {
    return this.goals$;
  }

  getGoalsSnapshot(): Goal[] {
    return this.goalsSubject.value;
  }

  getGoalById(id: string): Goal | undefined {
    return this.goalsSubject.value.find(goal => goal.id === id);
  }

  addGoal(goal: Goal): void {
    const currentGoals = this.goalsSubject.value;
    this.goalsSubject.next([...currentGoals, goal]);
  }

  updateGoal(updatedGoal: Goal): void {
    const currentGoals = this.goalsSubject.value;
    const updatedGoals = currentGoals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    this.goalsSubject.next(updatedGoals);
  }

  deleteGoal(goalId: string): void {
    const currentGoals = this.goalsSubject.value;
    const filteredGoals = currentGoals.filter(goal => goal.id !== goalId);
    this.goalsSubject.next(filteredGoals);
  }

  duplicateGoal(goal: Goal): void {
    const duplicatedGoal: Goal = {
      ...goal,
      id: (this.goalsSubject.value.length + 1).toString(),
      title: `${goal.title} (Copy)`,
      progress: { percent: 0 },
      status: 'active' as const,
      milestones: goal.milestones.map(milestone => ({
        ...milestone,
        id: (Math.random() * 1000).toString(),
        completed: false
      }))
    };
    
    this.addGoal(duplicatedGoal);
  }

  markGoalComplete(goalId: string): void {
    const currentGoals = this.goalsSubject.value;
    const updatedGoals = currentGoals.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress: { percent: 100 }, status: 'completed' as const }
        : goal
    );
    this.goalsSubject.next(updatedGoals);
  }

  archiveGoal(goalId: string): void {
    const currentGoals = this.goalsSubject.value;
    const updatedGoals = currentGoals.map(goal => 
      goal.id === goalId 
        ? { ...goal, status: 'archived' as const }
        : goal
    );
    this.goalsSubject.next(updatedGoals);
  }
} 