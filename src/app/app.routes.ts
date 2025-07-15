import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddGoalComponent } from './components/add-goal/add-goal.component';
import { GoalsListComponent } from './components/goals-list/goals-list.component';
import { GoalDetailComponent } from './components/goal-detail/goal-detail.component';
import { EditGoalComponent } from './components/edit-goal/edit-goal.component';
import { AddMilestoneComponent } from './components/add-milestone/add-milestone.component';
import { UpdateProgressComponent } from './components/update-progress/update-progress.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { Onboarding } from './components/onboarding/onboarding';
import { TestSupabaseComponent } from './components/test-supabase/test-supabase.component';
import { SimpleTestComponent } from './components/simple-test/simple-test.component';
import { AuthTestComponent } from './components/auth-test/auth-test.component';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Public routes (no auth required, but guests only)
  { path: 'signup', component: SignupComponent, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [GuestGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [GuestGuard] },
  
  // Public routes (no auth required, accessible to all)
  { path: 'onboarding', component: Onboarding },
  { path: 'test-supabase', component: TestSupabaseComponent },
  { path: 'simple-test', component: SimpleTestComponent },
  { path: 'auth-test', component: AuthTestComponent },
  
  // Protected routes (auth required)
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'add-goal', component: AddGoalComponent, canActivate: [AuthGuard] },
  { path: 'goals-list', component: GoalsListComponent, canActivate: [AuthGuard] },
  { path: 'goal-detail/:id', component: GoalDetailComponent, canActivate: [AuthGuard] },
  { path: 'edit-goal/:id', component: EditGoalComponent, canActivate: [AuthGuard] },
  { path: 'add-milestone/:goalId', component: AddMilestoneComponent, canActivate: [AuthGuard] },
  { path: 'update-progress/:goalId', component: UpdateProgressComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  
  // Redirect to login for any unmatched routes
  { path: '**', redirectTo: '/login' }
];
