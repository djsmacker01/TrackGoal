import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CategoryConfig {
  name: string;
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<CategoryConfig[]>(this.getDefaultCategories());
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  private getDefaultCategories(): CategoryConfig[] {
    return [
      { name: 'Health', icon: '🏃‍♂️', color: '#4CAF50' },
      { name: 'Career', icon: '💼', color: '#2196F3' },
      { name: 'Personal', icon: '📚', color: '#9C27B0' },
      { name: 'Financial', icon: '💰', color: '#FF9800' },
      { name: 'Habits', icon: '🔄', color: '#607D8B' }
    ];
  }

  private loadCategories(): void {
    const stored = localStorage.getItem('trackgoal_categories');
    if (stored) {
      try {
        const categories = JSON.parse(stored);
        this.categoriesSubject.next(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        this.categoriesSubject.next(this.getDefaultCategories());
      }
    }
  }

  private saveCategories(categories: CategoryConfig[]): void {
    localStorage.setItem('trackgoal_categories', JSON.stringify(categories));
  }

  getCategories(): CategoryConfig[] {
    return this.categoriesSubject.value;
  }

  addCategory(category: CategoryConfig): void {
    const currentCategories = this.categoriesSubject.value;
    
    // Check if category name already exists
    if (currentCategories.some(cat => cat.name.toLowerCase() === category.name.toLowerCase())) {
      throw new Error('Category with this name already exists');
    }

    const updatedCategories = [...currentCategories, category];
    this.categoriesSubject.next(updatedCategories);
    this.saveCategories(updatedCategories);
  }

  updateCategory(oldName: string, updatedCategory: CategoryConfig): void {
    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = currentCategories.map(cat => 
      cat.name === oldName ? updatedCategory : cat
    );
    
    this.categoriesSubject.next(updatedCategories);
    this.saveCategories(updatedCategories);
  }

  deleteCategory(categoryName: string): void {
    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = currentCategories.filter(cat => cat.name !== categoryName);
    
    this.categoriesSubject.next(updatedCategories);
    this.saveCategories(updatedCategories);
  }

  getCategoryByName(name: string): CategoryConfig | undefined {
    return this.categoriesSubject.value.find(cat => cat.name === name);
  }

  resetToDefault(): void {
    this.categoriesSubject.next(this.getDefaultCategories());
    this.saveCategories(this.getDefaultCategories());
  }
} 