import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';

import { EditPasswordComponent } from './edit-password/edit-password.component';
import { EditUsernameComponent } from './edit-username/edit-username.component';

@Component({
  selector: 'app-account-settings',
  imports: [
    EditPasswordComponent,
    EditUsernameComponent,
    MaterialModules
  ],
  templateUrl: './account-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent {




}
