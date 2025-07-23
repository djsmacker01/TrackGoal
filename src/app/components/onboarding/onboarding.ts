import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { SupabaseService } from '../../services/supabase.service';

// Dummy goal model for integration (replace with actual model/service)
interface Goal {
  title: string;
  category: string;
  startDate: string;
  target: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.scss'],
  animations: [
    trigger('stepTransition', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class Onboarding implements OnInit {
  step = 1;
  maxStep = 5;
  completed = false;
  onboardingState: any = {};

  // Step 3: Goal form
  goalForm: FormGroup;
  // Step 4: Preferences form
  preferencesForm: FormGroup;

  categories = [
    { key: 'Health', icon: '❤️', label: 'Health', desc: 'Fitness, wellness, nutrition' },
    { key: 'Career', icon: '💼', label: 'Career', desc: 'Job, learning, skills' },
    { key: 'Personal', icon: '👤', label: 'Personal', desc: 'Growth, hobbies, travel' },
    { key: 'Financial', icon: '💰', label: 'Financial', desc: 'Savings, investing, debt' },
    { key: 'Habits', icon: '🔄', label: 'Habits', desc: 'Daily routines, new habits' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.goalForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      startDate: ['', Validators.required],
      target: ['', Validators.required]
    });
    this.preferencesForm = this.fb.group({
      notifications: [true],
      reminderFrequency: ['Daily', Validators.required],
      privacy: ['Private', Validators.required]
    });
  }

  ngOnInit() {
    // Restore onboarding state if present
    const saved = localStorage.getItem('onboardingState');
    if (saved) {
      this.onboardingState = JSON.parse(saved);
      this.step = this.onboardingState.step || 1;
      if (this.onboardingState.goal) this.goalForm.patchValue(this.onboardingState.goal);
      if (this.onboardingState.preferences) this.preferencesForm.patchValue(this.onboardingState.preferences);
    }
  }

  saveState() {
    this.onboardingState.step = this.step;
    this.onboardingState.goal = this.goalForm.value;
    this.onboardingState.preferences = this.preferencesForm.value;
    localStorage.setItem('onboardingState', JSON.stringify(this.onboardingState));
  }

  next() {
    if (this.step === 3 && this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }
    if (this.step === 4 && this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }
    if (this.step < this.maxStep) {
      this.step++;
      this.saveState();
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
      this.saveState();
    }
  }

  skipGoal() {
    this.step = 4;
    this.saveState();
  }

  skipPreferences() {
    this.step = 5;
    this.saveState();
  }

  toggleCategory(categoryKey: string) {
    if (!this.onboardingState.selectedCategories) {
      this.onboardingState.selectedCategories = [];
    }
    
    const index = this.onboardingState.selectedCategories.indexOf(categoryKey);
    if (index > -1) {
      this.onboardingState.selectedCategories.splice(index, 1);
    } else {
      this.onboardingState.selectedCategories.push(categoryKey);
    }
    
    this.saveState();
  }

  async completeOnboarding() {
    try {
      console.log('Starting onboarding completion...');
      this.completed = true;
      
      // Check if user is authenticated
      const currentUser = this.supabaseService.currentUserValue;
      if (!currentUser) {
        console.error('No authenticated user found');
        // Navigate to login if not authenticated
        this.router.navigate(['/login']);
        return;
      }
      
      console.log('User authenticated:', currentUser.email);
      
      // Update user profile with onboarding completion
      console.log('Completing onboarding in Supabase...');
      await this.supabaseService.completeOnboarding();
      console.log('Onboarding completed in Supabase');
      
      // Create first goal if provided
      if (this.goalForm.valid && this.goalForm.value.title) {
        console.log('Creating first goal:', this.goalForm.value);
        const goalData = {
          title: this.goalForm.value.title,
          category: this.goalForm.value.category,
          goal_type: 'numerical' as const,
          target_value: parseFloat(this.goalForm.value.target) || 0,
          unit: 'units',
          deadline: this.goalForm.value.startDate,
          status: 'active' as const
        };
        
        await this.supabaseService.createGoal(goalData);
        console.log('First goal created successfully');
      } else {
        console.log('Skipping goal creation - form invalid or no title');
      }
      
      // Update user preferences
      const preferences = this.preferencesForm.value;
      console.log('Updating user preferences:', preferences);
      await this.supabaseService.updateUserProfile({
        notification_settings: {
          emailNotifications: preferences.notifications,
          goalReminders: preferences.notifications,
          milestoneCelebrations: preferences.notifications,
          weeklyReports: false
        },
        privacy_settings: {
          profileVisible: preferences.privacy === 'Public',
          goalSharing: false,
          analyticsSharing: true
        }
      });
      console.log('User preferences updated');
      
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.removeItem('onboardingState');
      
      console.log('Onboarding completed successfully, navigating to dashboard...');
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1200);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Show error to user
      alert('There was an error completing onboarding. Please try again.');
      this.completed = false;
    }
  }

  resetOnboarding() {
    localStorage.removeItem('onboardingState');
    localStorage.removeItem('onboardingComplete');
    this.step = 1;
    this.completed = false;
    this.goalForm.reset();
    this.preferencesForm.reset({ notifications: true, reminderFrequency: 'Daily', privacy: 'Private' });
  }

  // For dev/testing: expose reset in profile/settings
  static resetOnboardingForDev() {
    localStorage.removeItem('onboardingState');
    localStorage.removeItem('onboardingComplete');
  }
}
