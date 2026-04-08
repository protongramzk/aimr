import { browser } from '$app/environment';

export type ThemeName = 'Default' | 'Tenper' | 'Orangrape';

export interface ThemeConfig {
  primary: string;
  accent: string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  Default: {
    primary: '#E8437A', // Raspberry
    accent: '#6B8AFF'   // Blueberry
  },
  Tenper: {
    primary: '#6B8AFF', // Blueberry
    accent: '#32CD32'   // Lime Green
  },
  Orangrape: {
    primary: '#FF8C00', // Orange
    accent: '#8A2BE2'   // Violet
  }
};

class ThemeStore {
  currentTheme = $state<ThemeName>('Default');

  constructor() {
    if (browser) {
      const savedTheme = localStorage.getItem('aipm_theme') as ThemeName;
      if (savedTheme && themes[savedTheme]) {
        this.currentTheme = savedTheme;
      }
    }
  }

  setTheme(name: ThemeName) {
    if (themes[name]) {
      this.currentTheme = name;
      if (browser) {
        localStorage.setItem('aipm_theme', name);
        this.applyTheme();
      }
    }
  }

  applyTheme() {
    if (!browser) return;
    const theme = themes[this.currentTheme];
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-accent', theme.accent);
    // Also update aliases if used in CSS
    document.documentElement.style.setProperty('--c-primary', theme.primary);
  }
}

export const themeStore = new ThemeStore();
