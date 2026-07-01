import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { RegisterRequest } from '../../../interfaces/auth/Register';
import { AlertManagerService } from '../../../services/alert-manager.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './register.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  @Output() registered = new EventEmitter<void>();

  registerForm: FormGroup;
  submitted: boolean = false;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  confirmPasswordMatcher = new ConfirmPasswordStateMatcher();

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private alertManagerService: AlertManagerService,
    private translateService: TranslateService
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [
        Validators.required
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
    }, { validators: passwordsMatchValidator });
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    const registerDto: RegisterRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
    };

    this.authService.register(registerDto).subscribe({
      next: () => {
        // No auto-login: notify the user and switch to the login tab so they can sign in.
        this.alertManagerService.alertSuccess(
          this.translateService.instant('register.registerSuccess')
        );

        this.registerForm.reset();
        this.submitted = false;
        this.registered.emit();
      },
      error: (error) => {
        this.alertManagerService.manageError(error);
      }
    });
  }

}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
}

class ConfirmPasswordStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const submitted = !!form?.submitted;
    const interacted = !!(control?.dirty || control?.touched || submitted);

    const controlInvalid = !!(control?.invalid && interacted);
    const groupMismatch = !!(form?.form.hasError('passwordMismatch') && interacted);

    return controlInvalid || groupMismatch;
  }
}
