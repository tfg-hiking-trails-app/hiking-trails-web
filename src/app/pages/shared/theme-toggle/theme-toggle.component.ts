import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-theme-toggle',
  imports: [
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './theme-toggle.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode: boolean = false;
  darkModeIcon: string = 'nightlight';
  lightModeIcon: string = 'light_mode';

  ngOnInit(): void {
    document.documentElement.classList.toggle(
      'dark',
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');

    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  get themeIcon(): string {
    return this.isDarkMode ? this.darkModeIcon : this.lightModeIcon;
  }

  get themeTooltip(): string {
    return this.isDarkMode ? 'theme.darkMode' : 'theme.lightMode';
  }

}
