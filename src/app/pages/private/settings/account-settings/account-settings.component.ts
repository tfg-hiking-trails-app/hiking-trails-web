import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { EditPasswordComponent } from './edit-password/edit-password.component';

@Component({
  selector: 'app-account-settings',
  imports: [
    MaterialModules,
    TranslatePipe,
    EditPasswordComponent
],
  templateUrl: './account-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent {




}
