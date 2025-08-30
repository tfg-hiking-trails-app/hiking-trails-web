import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../../services/theme.service';

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
export class ThemeToggleComponent {
  darkModeIcon: string = 'nightlight';
  lightModeIcon: string = 'light_mode';

  constructor(private themeService: ThemeService) { }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get themeIcon(): string {
    return this.themeService.isDarkMode ? this.darkModeIcon : this.lightModeIcon;
  }

  get themeTooltip(): string {
    return this.themeService.isDarkMode ? 'theme.darkMode' : 'theme.lightMode';
  }

}
