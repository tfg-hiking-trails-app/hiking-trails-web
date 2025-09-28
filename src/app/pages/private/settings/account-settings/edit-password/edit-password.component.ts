import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { EditPasswordRequest } from '../../../../../interfaces/auth/Auth';
import { AlertManagerService } from '../../../../../services/alert-manager.service';
import { AuthService } from '../../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../../../../components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-settings-edit-password',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './edit-password.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPasswordComponent {
  editPasswordForm: FormGroup;
  submitted: boolean = false;
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.editPasswordForm = this.formBuilder.group({
      currentPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  get editPasswordControls() {
    return this.editPasswordForm.controls;
  }

  changePassword(): void {
    this.submitted = true;

    if (this.editPasswordForm.invalid)
      return;

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('settings.account.change-password'),
        message: this.translateService.instant('settings.account.confirm-password-change'),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result)
        return;

      const request: EditPasswordRequest = {
        password: this.editPasswordControls['currentPassword'].value,
        newPassword: this.editPasswordControls['newPassword'].value,
        confirmNewPassword: this.editPasswordControls['confirmPassword'].value
      };

      this.authService
        .editPassword(request)
        .subscribe({
          next: () => {
            this.submitted = false;
            this.editPasswordForm.reset();

            const successMessage = this.translateService.instant('settings.account.password-changed-successfully');
            this.alertManagerService.alertSuccess(successMessage);
          },
          error: (error) => {
            this.submitted = false;
            this.alertManagerService.manageError(error);
          }
        });
    });
  }

}
