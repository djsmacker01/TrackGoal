import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface PasswordRequirement {
  name: string;
  validator: (password: string) => boolean;
  met: boolean;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  isSubmitting = false;
  showNewPassword = false;
  showConfirmPassword = false;
  pageState: 'loading' | 'form' | 'success' | 'error' = 'loading';
  redirectCountdown = 5;
  private countdownInterval: any;

  passwordRequirements: PasswordRequirement[] = [
    {
      name: 'Minimum 8 characters',
      validator: (password: string) => password.length >= 8,
      met: false
    },
    {
      name: 'At least one uppercase letter',
      validator: (password: string) => /[A-Z]/.test(password),
      met: false
    },
    {
      name: 'At least one lowercase letter',
      validator: (password: string) => /[a-z]/.test(password),
      met: false
    },
    {
      name: 'At least one number',
      validator: (password: string) => /\d/.test(password),
      met: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.validateResetToken();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  initForm() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    this.resetForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.updatePasswordRequirements(password);
    });
  }

  passwordMatchValidator(group: AbstractControl) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (group.get('confirmPassword')?.hasError('passwordMismatch')) {
      group.get('confirmPassword')?.setErrors(null);
    }

    return null;
  }

  updatePasswordRequirements(password: string) {
    this.passwordRequirements.forEach(requirement => {
      requirement.met = requirement.validator(password);
    });
  }

  validateResetToken() {
    const token = this.route.snapshot.queryParams['access_token'];
    if (!token) {
      this.pageState = 'error';
      return;
    }
    setTimeout(() => {
      this.pageState = 'form';
    }, 1000);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.resetForm.valid) {
      this.isSubmitting = true;
      
      const newPassword = this.resetForm.get('newPassword')?.value;
      
      try {
        const result = await this.authService.updatePassword(newPassword);
        
        if (result.success) {
          this.pageState = 'success';
          this.startRedirectCountdown();
        } else {
          this.notificationService.error(
            'Update Failed', 
            result.error?.message || 'Failed to update password. Please try again.', 
            5000
          );
        }
      } catch (error) {
        console.error('Password update error:', error);
        this.notificationService.error(
          'Update Failed', 
          'An unexpected error occurred. Please try again.', 
          5000
        );
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  startRedirectCountdown() {
    this.countdownInterval = setInterval(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  markFormGroupTouched() {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
