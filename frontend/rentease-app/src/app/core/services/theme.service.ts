import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// theme types
export type Theme = 'light' | 'dark' | 'system';

// Theme service - handles dark mode
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'rentease_theme';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // theme signal
  private readonly themeSignal = signal<Theme>('system');

  // computed signals
  public readonly theme = this.themeSignal.asReadonly();
  public readonly currentTheme = computed(() => {
    const theme = this.themeSignal();
    if (theme === 'system') {
      return this.getSystemTheme();
    }
    return theme;
  });
  public readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // init from storage
    if (this.isBrowser) {
      this.themeSignal.set(this.getThemeFromStorage());
    }

    // apply theme to DOM
    effect(() => {
      if (!this.isBrowser) return;
      const theme = this.currentTheme();
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
    });

    // listen for system changes
    if (this.isBrowser) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.themeSignal() === 'system') {
          this.themeSignal.set('system');
        }
      });
    }
  }

  // set theme
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  // toggle dark/light
  toggleTheme(): void {
    const current = this.currentTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  // get system theme
  private getSystemTheme(): 'light' | 'dark' {
    if (!this.isBrowser) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // get theme from storage
  private getThemeFromStorage(): Theme {
    if (!this.isBrowser) return 'system';
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored as Theme) || 'system';
  }
}
