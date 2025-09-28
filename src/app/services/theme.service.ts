import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode: boolean = false;

  private readonly dark = 'dark';
  private readonly light = 'light';
  private readonly default = 'default';

  constructor() {
    document.documentElement.classList.toggle(
      this.dark,
      localStorage.getItem('theme') === this.dark ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    this.isDarkMode = document.documentElement.classList.contains(this.dark);

    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDarkMode: this.isDarkMode } }));
  }

  getCurrentTheme(): string {
    if (!localStorage.getItem('theme'))
      return this.default;

    return this.isDarkMode ? this.dark : this.light;
  }

  setTheme(theme: string): void {
    if (theme !== this.dark && theme !== this.light) {
      return;
    }

    if (this.isDarkMode && theme === this.light) {
      this.toggleTheme();
    } else if (!this.isDarkMode && theme === this.dark) {
      this.toggleTheme();
    }

  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    localStorage.setItem('theme', this.isDarkMode ? this.dark : this.light);

    document.documentElement.classList.toggle(this.dark, this.isDarkMode);

    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDarkMode: this.isDarkMode } }));
  }

  setDefaultBrowserTheme(): void {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    document.documentElement.classList.toggle(this.dark, isDarkMode);

    localStorage.removeItem('theme');
  }

}
