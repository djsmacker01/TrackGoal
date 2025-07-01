export interface GoalUpdate {
  id: string;
  goalId: string;
  timestamp: Date;
  updateType: 'edit' | 'milestone' | 'progress' | 'status_change';
  changes: FieldChange[];
  previousValues: any;
  newValues: any;
  userNote?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  fieldLabel: string;
}

export interface UpdateHistory {
  goalId: string;
  updates: GoalUpdate[];
  totalUpdates: number;
  lastUpdated: Date;
} 