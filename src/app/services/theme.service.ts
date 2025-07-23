import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>('light');
  private systemTheme = new BehaviorSubject<'light' | 'dark'>('light');

  constructor() {
    this.initializeTheme();
  }

  get theme$() {
    return this.currentTheme.asObservable();
  }

  get currentThemeValue(): Theme {
    return this.currentTheme.value;
  }

  private initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      this.checkSystemTheme();
      this.setTheme('auto');
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        this.checkSystemTheme();
        if (this.currentTheme.value === 'auto') {
          this.applyTheme();
        }
      });
    }
  }

  private checkSystemTheme() {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.systemTheme.next('dark');
    } else {
      this.systemTheme.next('light');
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  private applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.body.className = `theme-${effectiveTheme}`;
  }

  private getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme.value === 'auto') {
      return this.systemTheme.value;
    }
    return this.currentTheme.value;
  }

  toggleTheme() {
    const current = this.currentTheme.value;
    if (current === 'light') {
      this.setTheme('dark');
    } else if (current === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('light');
    }
  }

  isDarkMode(): boolean {
    return this.getEffectiveTheme() === 'dark';
  }

  isLightMode(): boolean {
    return this.getEffectiveTheme() === 'light';
  }

  isAutoMode(): boolean {
    return this.currentTheme.value === 'auto';
  }
} 