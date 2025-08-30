import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { LangService } from '../../../../services/lang.service';
import { ThemeService } from '../../../../services/theme.service';

interface Selector {
  key: string;
  label: string;
}

interface Option {
  label: string;
  icon: string;
  selectors: Selector[];
  selected?: string;
}

@Component({
  selector: 'app-screen-settings',
  imports: [
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './screen-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenSettingsComponent {

  private langService: LangService = inject(LangService);
  private themeService: ThemeService = inject(ThemeService);

  options: Option[] = [
    {
      label: 'theme',
      icon: 'mdi-theme-light-dark',
      selected: this.themeService.getCurrentTheme(),
      selectors: [
        { key: 'light', label: 'light-mode' },
        { key: 'dark', label: 'dark-mode' },
        { key: 'default', label: 'browser-default' }
      ]
    },
    {
      label: 'language',
      icon: 'language',
      selected: this.langService.getCurrentLanguage(),
      selectors: [
        { key: 'es', label: 'spanish' },
        { key: 'en', label: 'english' }
      ]
    }
  ];

  onChange(label: string, value: string) {
    const option = this.options.find(o => o.label === label);
    if (option) {
      option.selected = value;

      switch (label) {
        case 'theme':
          this.applyTheme(value);
          break;
        case 'language':
          this.applyLanguage(value);
          break;
      }
    }
  }

  private applyTheme(theme: string) {
    if (theme === 'default') {
      this.themeService.setDefaultBrowserTheme();
      return;
    }

    this.themeService.setTheme(theme);
  }

  private applyLanguage(lang: string) {
    this.langService.setLanguage(lang);
  }
}
