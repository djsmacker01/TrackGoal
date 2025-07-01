import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddGoalComponent } from './components/add-goal/add-goal.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-goal', component: AddGoalComponent },
];
