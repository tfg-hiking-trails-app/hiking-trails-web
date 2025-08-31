import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-edit-password',
  imports: [
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
    private formBuilder: FormBuilder,
  ) {
    this.editPasswordForm = this.formBuilder.group({
      currentPassword: ['currentPassword', [
        Validators.required,
        Validators.minLength(6)
      ]],
      newPassword: ['newPassword', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['confirmPassword', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false],
    });
  }

  get editPasswordControls() {
    return this.editPasswordForm.controls;
  }

}
