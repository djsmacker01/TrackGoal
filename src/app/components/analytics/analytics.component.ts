import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Goal } from '../../goal.model';

interface AnalyticsData {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  completionRate: number;
  goalsCompletedThisMonth: number;
  currentStreak: number;
  bestStreak: number;
  averageCompletionTime: number;
  mostProductiveWeek: string;
  categoryBreakdown: CategoryData[];
  weeklyProgress: WeeklyProgress[];
  goalPerformance: GoalPerformance[];
  achievements: Achievement[];
  recommendations: Recommendation[];
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  color: string;
  averageTime: number;
}

interface WeeklyProgress {
  week: string;
  completed: number;
  target: number;
  rate: number;
}

interface GoalPerformance {
  title: string;
  category: string;
  timeToComplete: number;
  status: 'fastest' | 'longest' | 'current';
  progress: number;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface Recommendation {
  type: 'focus' | 'schedule' | 'optimize';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  dateRange: string = '30';
  analyticsData: AnalyticsData;
  selectedCategory: string = 'all';
  chartData: any = {};

  constructor(private router: Router) {
    this.analyticsData = this.generateAnalyticsData();
  }

  ngOnInit(): void {
    this.updateChartData();
  }

  onDateRangeChange(): void {
    this.analyticsData = this.generateAnalyticsData();
    this.updateChartData();
  }

  onCategoryChange(): void {
    this.updateChartData();
  }

  private generateAnalyticsData(): AnalyticsData {
    // Sample data generation
    const totalGoals = 24;
    const completedGoals = 18;
    const activeGoals = 6;
    const completionRate = Math.round((completedGoals / totalGoals) * 100);
    const goalsCompletedThisMonth = 5;
    const currentStreak = 12;
    const bestStreak = 28;
    const averageCompletionTime = 45;

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      completionRate,
      goalsCompletedThisMonth,
      currentStreak,
      bestStreak,
      averageCompletionTime,
      mostProductiveWeek: 'Week 3, December',
      categoryBreakdown: [
        { category: 'Health & Fitness', count: 8, percentage: 33, color: '#4CAF50', averageTime: 42 },
        { category: 'Career & Learning', count: 6, percentage: 25, color: '#2196F3', averageTime: 60 },
        { category: 'Personal Development', count: 5, percentage: 21, color: '#9C27B0', averageTime: 38 },
        { category: 'Relationships', count: 3, percentage: 12, color: '#FF9800', averageTime: 55 },
        { category: 'Financial', count: 2, percentage: 9, color: '#F44336', averageTime: 90 }
      ],
      weeklyProgress: [
        { week: 'Week 1', completed: 3, target: 4, rate: 75 },
        { week: 'Week 2', completed: 2, target: 4, rate: 50 },
        { week: 'Week 3', completed: 5, target: 4, rate: 125 },
        { week: 'Week 4', completed: 4, target: 4, rate: 100 },
        { week: 'Week 5', completed: 3, target: 4, rate: 75 },
        { week: 'Week 6', completed: 1, target: 4, rate: 25 }
      ],
      goalPerformance: [
        { title: 'Learn Spanish Basics', category: 'Career & Learning', timeToComplete: 30, status: 'fastest', progress: 100 },
        { title: 'Run 5K Race', category: 'Health & Fitness', timeToComplete: 45, status: 'current', progress: 75 },
        { title: 'Save $10,000', category: 'Financial', timeToComplete: 180, status: 'longest', progress: 60 },
        { title: 'Read 12 Books', category: 'Personal Development', timeToComplete: 52, status: 'current', progress: 85 }
      ],
      achievements: [
        { title: 'Goal Crusher', description: 'Completed 10 goals', icon: 'emoji_events', unlocked: true, date: '2024-01-15' },
        { title: 'Streak Master', description: 'Maintained 20-day streak', icon: 'local_fire_department', unlocked: true, date: '2024-01-20' },
        { title: 'Category Explorer', description: 'Set goals in 5 categories', icon: 'explore', unlocked: true, date: '2024-01-10' },
        { title: 'Speed Demon', description: 'Complete 3 goals in 30 days', icon: 'speed', unlocked: false },
        { title: 'Consistency King', description: '30-day perfect streak', icon: 'crown', unlocked: false }
      ],
      recommendations: [
        { type: 'focus', title: 'Focus on Health Goals', description: 'You\'re most successful with health goals. Consider setting more fitness targets.', priority: 'high' },
        { type: 'schedule', title: 'Optimize Your Schedule', description: 'Tuesday and Thursday are your most productive days. Schedule important goals then.', priority: 'medium' },
        { type: 'optimize', title: 'Break Down Large Goals', description: 'Financial goals take longer. Consider breaking them into smaller milestones.', priority: 'medium' }
      ]
    };
  }

  private updateChartData(): void {
    // Generate chart data based on selected filters
    this.chartData = {
      categoryChart: this.generateCategoryChartData(),
      progressChart: this.generateProgressChartData(),
      statusChart: this.generateStatusChartData()
    };
  }

  private generateCategoryChartData(): any {
    const data = this.selectedCategory === 'all' 
      ? this.analyticsData.categoryBreakdown 
      : this.analyticsData.categoryBreakdown.filter(cat => cat.category === this.selectedCategory);

    return {
      labels: data.map(cat => cat.category),
      datasets: [{
        data: data.map(cat => cat.count),
        backgroundColor: data.map(cat => cat.color),
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  }

  private generateProgressChartData(): any {
    const weeks = this.analyticsData.weeklyProgress.map(w => w.week);
    const rates = this.analyticsData.weeklyProgress.map(w => w.rate);

    return {
      labels: weeks,
      datasets: [{
        label: 'Completion Rate (%)',
        data: rates,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  private generateStatusChartData(): any {
    const active = this.analyticsData.activeGoals;
    const completed = this.analyticsData.completedGoals;
    const overdue = Math.max(0, this.analyticsData.totalGoals - active - completed);

    return {
      labels: ['Active', 'Completed', 'Overdue'],
      datasets: [{
        data: [active, completed, overdue],
        backgroundColor: ['#4CAF50', '#2196F3', '#F44336'],
        borderWidth: 0
      }]
    };
  }

  getCategoryColor(category: string): string {
    const cat = this.analyticsData.categoryBreakdown.find(c => c.category === category);
    return cat?.color || '#6B7280';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  }

  getRecommendationIcon(type: string): string {
    switch (type) {
      case 'focus': return 'target';
      case 'schedule': return 'schedule';
      case 'optimize': return 'tune';
      default: return 'lightbulb';
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/']);
  }
} 