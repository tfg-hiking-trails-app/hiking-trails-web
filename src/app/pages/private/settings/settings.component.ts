import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { SettingsOptionsComponent } from './settings-options/settings-options.component';

@Component({
  selector: 'app-settings',
  imports: [
    MaterialModules,
    RouterOutlet,
    SettingsOptionsComponent,
    TranslatePipe
  ],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent { }
