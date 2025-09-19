import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MaterialModules } from '@material/material.modules';

import { AlertManagerService } from '../../../../../services/alert-manager.service';
import { AuthService } from '../../../../../services/auth.service';
import { EditUsernameRequest } from '../../../../../interfaces/auth/Auth';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../../../../components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-settings-edit-username',
  imports: [
    FormsModule,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './edit-username.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUsernameComponent {
  editUsernameForm: FormGroup;
  submitted: boolean = false;
  showUsername = signal(false);

  constructor(
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.editUsernameForm = this.formBuilder.group({
      username: ['', [Validators.required]]
    });
  }

  get editUsernameControls() {
    return this.editUsernameForm.controls;
  }

  changeUsername(): void {
    this.submitted = true;

    if (this.editUsernameForm.invalid)
      return;

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('settings.account.change-username'),
        message: this.translateService.instant('settings.account.confirm-username-change'),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result)
        return;

      const request: EditUsernameRequest = {
        username: this.editUsernameControls['username'].value
      };

      this.authService
        .editUsername(request)
        .subscribe({
          next: () => {
            this.submitted = false;
            this.editUsernameForm.reset();

            const successMessage = this.translateService.instant('settings.account.username-changed-successfully');
            this.alertManagerService.alertSuccess(successMessage);
            this.authService.logout();
          },
          error: (error) => {
            this.submitted = false;
            this.alertManagerService.manageError(error);
          }
        });
    });
  }

}
