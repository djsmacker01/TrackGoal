import { Injectable } from '@angular/core';
import { GoalUpdate, FieldChange, UpdateHistory } from '../models/update-history.model';
import { Goal } from '../goal.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateHistoryService {
  private updateHistory: Map<string, GoalUpdate[]> = new Map();

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    // Mock data for existing goals
    const mockUpdates: GoalUpdate[] = [
      {
        id: '1',
        goalId: '1',
        timestamp: new Date('2024-01-20T10:30:00'),
        updateType: 'edit',
        changes: [
          {
            field: 'title',
            oldValue: 'Run 5km 2x/week',
            newValue: 'Run 5km 3x/week',
            fieldLabel: 'Goal Title'
          },
          {
            field: 'targetValue',
            oldValue: 8,
            newValue: 12,
            fieldLabel: 'Target Value'
          }
        ],
        previousValues: {
          title: 'Run 5km 2x/week',
          targetValue: 8
        },
        newValues: {
          title: 'Run 5km 3x/week',
          targetValue: 12
        }
      },
      {
        id: '2',
        goalId: '1',
        timestamp: new Date('2024-01-18T14:15:00'),
        updateType: 'progress',
        changes: [
          {
            field: 'progress',
            oldValue: 60,
            newValue: 70,
            fieldLabel: 'Progress'
          }
        ],
        previousValues: { progress: 60 },
        newValues: { progress: 70 }
      },
      {
        id: '3',
        goalId: '2',
        timestamp: new Date('2024-01-15T09:45:00'),
        updateType: 'edit',
        changes: [
          {
            field: 'description',
            oldValue: 'Read more books this year',
            newValue: 'Expand knowledge and develop reading habit by completing 12 books this year. Focus on personal development and business books.',
            fieldLabel: 'Description'
          }
        ],
        previousValues: {
          description: 'Read more books this year'
        },
        newValues: {
          description: 'Expand knowledge and develop reading habit by completing 12 books this year. Focus on personal development and business books.'
        }
      }
    ];

    // Group updates by goalId
    mockUpdates.forEach(update => {
      const existing = this.updateHistory.get(update.goalId) || [];
      existing.push(update);
      this.updateHistory.set(update.goalId, existing);
    });
  }

  recordGoalUpdate(
    goalId: string,
    previousGoal: Goal,
    updatedGoal: Goal,
    userNote?: string
  ): GoalUpdate {
    const changes: FieldChange[] = [];
    const previousValues: any = {};
    const newValues: any = {};

    // Compare all relevant fields
    const fieldsToTrack = [
      { key: 'title', label: 'Goal Title' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'deadline', label: 'Deadline' },
      { key: 'targetValue', label: 'Target Value' },
      { key: 'targetUnit', label: 'Target Unit' },
      { key: 'status', label: 'Status' }
    ];

    fieldsToTrack.forEach(field => {
      const oldValue = (previousGoal as any)[field.key];
      const newValue = (updatedGoal as any)[field.key];

      if (this.hasValueChanged(oldValue, newValue)) {
        changes.push({
          field: field.key,
          oldValue: this.formatValue(oldValue),
          newValue: this.formatValue(newValue),
          fieldLabel: field.label
        });

        previousValues[field.key] = oldValue;
        newValues[field.key] = newValue;
      }
    });

    const update: GoalUpdate = {
      id: this.generateId(),
      goalId,
      timestamp: new Date(),
      updateType: 'edit',
      changes,
      previousValues,
      newValues,
      userNote
    };

    // Store the update
    const existingUpdates = this.updateHistory.get(goalId) || [];
    existingUpdates.unshift(update); // Add to beginning (most recent first)
    this.updateHistory.set(goalId, existingUpdates);

    // In a real app, this would be saved to a database
    console.log('Goal update recorded:', update);

    return update;
  }

  getGoalUpdateHistory(goalId: string): GoalUpdate[] {
    return this.updateHistory.get(goalId) || [];
  }

  getUpdateHistorySummary(goalId: string): UpdateHistory {
    const updates = this.getGoalUpdateHistory(goalId);
    return {
      goalId,
      updates,
      totalUpdates: updates.length,
      lastUpdated: updates.length > 0 ? updates[0].timestamp : new Date()
    };
  }

  getAllUpdateHistory(): Map<string, GoalUpdate[]> {
    return new Map(this.updateHistory);
  }

  private hasValueChanged(oldValue: any, newValue: any): boolean {
    if (oldValue === newValue) return false;
    
    // Handle date comparisons
    if (oldValue instanceof Date && newValue instanceof Date) {
      return oldValue.getTime() !== newValue.getTime();
    }
    
    // Handle null/undefined cases
    if (oldValue == null && newValue == null) return false;
    if (oldValue == null || newValue == null) return true;
    
    // Handle string comparisons
    if (typeof oldValue === 'string' && typeof newValue === 'string') {
      return oldValue.trim() !== newValue.trim();
    }
    
    // Handle number comparisons
    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      return oldValue !== newValue;
    }
    
    // Default comparison
    return oldValue !== newValue;
  }

  private formatValue(value: any): string {
    if (value == null) return 'Not set';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Method to get recent updates across all goals
  getRecentUpdates(limit: number = 10): GoalUpdate[] {
    const allUpdates: GoalUpdate[] = [];
    this.updateHistory.forEach(updates => {
      allUpdates.push(...updates);
    });

    return allUpdates
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Method to get update statistics
  getUpdateStatistics(goalId: string): {
    totalUpdates: number;
    lastUpdated: Date | null;
    mostChangedField: string | null;
    updateFrequency: number; // updates per week
  } {
    const updates = this.getGoalUpdateHistory(goalId);
    
    if (updates.length === 0) {
      return {
        totalUpdates: 0,
        lastUpdated: null,
        mostChangedField: null,
        updateFrequency: 0
      };
    }

    // Count field changes
    const fieldCounts: { [key: string]: number } = {};
    updates.forEach(update => {
      update.changes.forEach(change => {
        fieldCounts[change.field] = (fieldCounts[change.field] || 0) + 1;
      });
    });

    // Find most changed field
    let mostChangedField: string | null = null;
    let maxCount = 0;
    Object.entries(fieldCounts).forEach(([field, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostChangedField = field;
      }
    });

    // Calculate update frequency (updates per week)
    const firstUpdate = updates[updates.length - 1];
    const lastUpdate = updates[0];
    const weeksDiff = (lastUpdate.timestamp.getTime() - firstUpdate.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 7);
    const updateFrequency = weeksDiff > 0 ? updates.length / weeksDiff : updates.length;

    return {
      totalUpdates: updates.length,
      lastUpdated: lastUpdate.timestamp,
      mostChangedField,
      updateFrequency: Math.round(updateFrequency * 100) / 100
    };
  }
} 