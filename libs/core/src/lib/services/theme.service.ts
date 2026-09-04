import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'ocean' | 'forest';
export type Font = 'Outfit' | 'Inter' | 'Syne' | 'Playfair Display';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly FONT_KEY = 'app-font';
  
  // Using Signals for theme and font state
  theme = signal<Theme>(this.getInitialTheme());
  font = signal<Font>(this.getInitialFont());

  constructor() {
    // Effect to apply theme class to body and save to localStorage
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      localStorage.setItem(this.THEME_KEY, currentTheme);
    });

    // Effect to apply font-family and save to localStorage
    effect(() => {
      const currentFont = this.font();
      this.applyFont(currentFont);
      localStorage.setItem(this.FONT_KEY, currentFont);
    });
  }

  toggleTheme(): void {
    this.theme.update((t) => {
      if (t === 'light') return 'dark';
      if (t === 'dark') return 'ocean';
      if (t === 'ocean') return 'forest';
      return 'light';
    });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  setFont(font: Font): void {
    this.font.set(font);
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'ocean' || savedTheme === 'forest') {
      return savedTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getInitialFont(): Font {
    const savedFont = localStorage.getItem(this.FONT_KEY) as Font;
    if (savedFont === 'Outfit' || savedFont === 'Inter' || savedFont === 'Syne' || savedFont === 'Playfair Display') {
      return savedFont;
    }
    return 'Outfit';
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    // Remove all possible theme classes
    root.classList.remove('light', 'dark', 'ocean', 'forest');
    // Add current theme class
    root.classList.add(theme);
  }

  private applyFont(font: Font): void {
    const root = document.documentElement;
    // Apply font custom variable
    root.style.setProperty('--font-family', `'${font}', sans-serif`);
  }
}

