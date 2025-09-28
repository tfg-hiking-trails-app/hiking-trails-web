import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { EditPasswordComponent } from './edit-password/edit-password.component';
import { EditUsernameComponent } from './edit-username/edit-username.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../../../components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-account-settings',
  imports: [
    EditPasswordComponent,
    EditUsernameComponent,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './account-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent {

  constructor(
    private dialog: MatDialog,
        private translateService: TranslateService
  ) { }

  deleteAccount() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('settings.account.delete-account-confirmation'),
        message: this.translateService.instant('settings.account.delete-account-message'),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

}
