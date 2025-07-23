import { Injectable } from '@angular/core';
import { SupabaseService, UserProfile } from './supabase.service';

export interface ExportData {
  userProfile: UserProfile;
  goals: any[];
  milestones: any[];
  progressEntries: any[];
  exportDate: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataExportService {
  constructor(private supabaseService: SupabaseService) {}

  async exportUserData(): Promise<ExportData> {
    try {
      const user = this.supabaseService.currentUserValue;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get user profile
      const profile = await this.supabaseService.getUserProfile(user.id);
      
      // Get all user data
      const goals = await this.supabaseService.getGoals();
      const milestones = await this.getAllMilestones(goals);
      const progressEntries = await this.getAllProgressEntries(goals);

      const exportData: ExportData = {
        userProfile: profile!,
        goals,
        milestones,
        progressEntries,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  private async getAllMilestones(goals: any[]): Promise<any[]> {
    const allMilestones = [];
    for (const goal of goals) {
      try {
        const milestones = await this.supabaseService.getMilestones(goal.id);
        allMilestones.push(...milestones);
      } catch (error) {
        console.error(`Error getting milestones for goal ${goal.id}:`, error);
      }
    }
    return allMilestones;
  }

  private async getAllProgressEntries(goals: any[]): Promise<any[]> {
    const allProgressEntries = [];
    for (const goal of goals) {
      try {
        const progressEntries = await this.supabaseService.getProgressEntries(goal.id);
        allProgressEntries.push(...progressEntries);
      } catch (error) {
        console.error(`Error getting progress entries for goal ${goal.id}:`, error);
      }
    }
    return allProgressEntries;
  }

  downloadDataAsJSON(data: ExportData): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `goaltracker-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  downloadDataAsCSV(data: ExportData): void {
    // Create CSV content for goals
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Goals CSV
    csvContent += 'Goals\n';
    csvContent += 'Title,Category,Status,Target Value,Current Value,Deadline,Created At\n';
    
    data.goals.forEach(goal => {
      csvContent += `"${goal.title}","${goal.category}","${goal.status}","${goal.target_value || ''}","${goal.current_value || ''}","${goal.deadline || ''}","${goal.created_at}"\n`;
    });
    
    csvContent += '\nMilestones\n';
    csvContent += 'Title,Goal,Completed,Completed At\n';
    
    data.milestones.forEach(milestone => {
      const goal = data.goals.find(g => g.id === milestone.goal_id);
      csvContent += `"${milestone.title}","${goal?.title || ''}","${milestone.completed}","${milestone.completed_at || ''}"\n`;
    });
    
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `goaltracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  async clearAllUserData(): Promise<void> {
    try {
      const user = this.supabaseService.currentUserValue;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get all user data first
      const goals = await this.supabaseService.getGoals();
      
      // Delete progress entries
      for (const goal of goals) {
        const progressEntries = await this.supabaseService.getProgressEntries(goal.id);
        for (const entry of progressEntries) {
          await this.supabaseService.deleteProgressEntry(entry.id);
        }
      }
      
      // Delete milestones
      for (const goal of goals) {
        const milestones = await this.supabaseService.getMilestones(goal.id);
        for (const milestone of milestones) {
          await this.supabaseService.deleteMilestone(milestone.id);
        }
      }
      
      // Delete goals
      for (const goal of goals) {
        await this.supabaseService.deleteGoal(goal.id);
      }
      
      // Note: We don't delete the user profile as it's needed for the account
      console.log('All user data cleared successfully');
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
} 