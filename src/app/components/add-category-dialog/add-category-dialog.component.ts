import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-add-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Create New Category</h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter category name">
            <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
              Category name is required
            </mat-error>
            <mat-error *ngIf="categoryForm.get('name')?.hasError('minlength')">
              Category name must be at least 2 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Icon</mat-label>
            <mat-select formControlName="icon">
              <mat-option *ngFor="let icon of availableIcons" [value]="icon.emoji">
                <span class="icon-option">
                  <span class="icon-emoji">{{ icon.emoji }}</span>
                  <span class="icon-name">{{ icon.name }}</span>
                </span>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="categoryForm.get('icon')?.hasError('required')">
              Please select an icon
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Color</mat-label>
            <mat-select formControlName="color">
              <mat-option *ngFor="let color of availableColors" [value]="color.value">
                <div class="color-option">
                  <div class="color-preview" [style.background-color]="color.value"></div>
                  <span class="color-name">{{ color.name }}</span>
                </div>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="categoryForm.get('color')?.hasError('required')">
              Please select a color
            </mat-error>
          </mat-form-field>
        </div>

        <div class="dialog-actions">
          <button type="button" mat-button (click)="onCancel()" class="cancel-btn">
            Cancel
          </button>
          <button 
            type="submit" 
            mat-raised-button 
            [disabled]="categoryForm.invalid"
            class="create-btn">
            <mat-icon>add</mat-icon>
            Create Category
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./add-category-dialog.component.scss']
})
export class AddCategoryDialogComponent {
  categoryForm: FormGroup;

  availableIcons = [
    { emoji: '🏃‍♂️', name: 'Fitness' },
    { emoji: '💼', name: 'Career' },
    { emoji: '📚', name: 'Learning' },
    { emoji: '💰', name: 'Finance' },
    { emoji: '🔄', name: 'Habits' },
    { emoji: '🎯', name: 'Goals' },
    { emoji: '🏠', name: 'Home' },
    { emoji: '✈️', name: 'Travel' },
    { emoji: '🎨', name: 'Creative' },
    { emoji: '🧘‍♀️', name: 'Wellness' },
    { emoji: '👨‍👩‍👧‍👦', name: 'Family' },
    { emoji: '🌱', name: 'Growth' },
    { emoji: '⚡', name: 'Energy' },
    { emoji: '🎪', name: 'Fun' },
    { emoji: '🔧', name: 'Skills' }
  ];

  availableColors = [
    { name: 'Green', value: '#4CAF50' },
    { name: 'Blue', value: '#2196F3' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Red', value: '#F44336' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Teal', value: '#009688' },
    { name: 'Indigo', value: '#3F51B5' },
    { name: 'Brown', value: '#795548' },
    { name: 'Gray', value: '#607D8B' },
    { name: 'Lime', value: '#CDDC39' },
    { name: 'Cyan', value: '#00BCD4' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.dialogRef.close(this.categoryForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 