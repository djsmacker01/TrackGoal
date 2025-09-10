import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Public routes (no auth required, but guests only) - Lazy loaded
  { 
    path: 'signup', 
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [GuestGuard] 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard] 
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [GuestGuard] 
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./components/reset-password/reset-password').then(m => m.ResetPasswordComponent),
    canActivate: [GuestGuard] 
  },
  { 
    path: 'verify-email', 
    loadComponent: () => import('./components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent)
  },
  
  // Public routes (no auth required, accessible to all) - Lazy loaded
  { 
    path: 'onboarding', 
    loadComponent: () => import('./components/onboarding/onboarding').then(m => m.Onboarding)
  },
  { 
    path: 'test-supabase', 
    loadComponent: () => import('./components/test-supabase/test-supabase.component').then(m => m.TestSupabaseComponent)
  },
  { 
    path: 'simple-test', 
    loadComponent: () => import('./components/simple-test/simple-test.component').then(m => m.SimpleTestComponent)
  },
  { 
    path: 'auth-test', 
    loadComponent: () => import('./components/auth-test/auth-test.component').then(m => m.AuthTestComponent)
  },
  
  // Protected routes (auth required) - Lazy loaded
  { 
    path: '', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'add-goal', 
    loadComponent: () => import('./components/add-goal/add-goal.component').then(m => m.AddGoalComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'goals-list', 
    loadComponent: () => import('./components/goals-list/goals-list.component').then(m => m.GoalsListComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'goal-detail/:id', 
    loadComponent: () => import('./components/goal-detail/goal-detail.component').then(m => m.GoalDetailComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'edit-goal/:id', 
    loadComponent: () => import('./components/edit-goal/edit-goal.component').then(m => m.EditGoalComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'add-milestone/:goalId', 
    loadComponent: () => import('./components/add-milestone/add-milestone.component').then(m => m.AddMilestoneComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'update-progress/:goalId', 
    loadComponent: () => import('./components/update-progress/update-progress.component').then(m => m.UpdateProgressComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'categories', 
    loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard] 
  },
  
  // Redirect to login for any unmatched routes
  { path: '**', redirectTo: '/login' }
];
