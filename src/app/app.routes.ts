import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddGoalComponent } from './components/add-goal/add-goal.component';
import { GoalsListComponent } from './components/goals-list/goals-list.component';
import { GoalDetailComponent } from './components/goal-detail/goal-detail.component';
import { EditGoalComponent } from './components/edit-goal/edit-goal.component';
import { AddMilestoneComponent } from './components/add-milestone/add-milestone.component';
import { UpdateProgressComponent } from './components/update-progress/update-progress.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-goal', component: AddGoalComponent },
  { path: 'goals-list', component: GoalsListComponent },
  { path: 'goal-detail/:id', component: GoalDetailComponent },
  { path: 'edit-goal/:id', component: EditGoalComponent },
  { path: 'add-milestone/:goalId', component: AddMilestoneComponent },
  { path: 'update-progress/:goalId', component: UpdateProgressComponent },
];
