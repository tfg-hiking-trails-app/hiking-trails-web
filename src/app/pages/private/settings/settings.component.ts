import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SettingsOptionsComponent } from './settings-options/settings-options.component';

@Component({
  selector: 'app-settings',
  imports: [
    RouterOutlet,
    SettingsOptionsComponent
  ],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent { }
