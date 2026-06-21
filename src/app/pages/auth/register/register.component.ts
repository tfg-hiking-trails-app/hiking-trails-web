import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { RegisterRequest } from '../../../interfaces/auth/Register';
import { AuthService } from '../../../services/auth.service';
import { TokenService } from '../../../services/token.service';

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
  registerForm: FormGroup;
  submitted: boolean = false;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  confirmPasswordMatcher = new ConfirmPasswordStateMatcher();

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['test3', [
        Validators.required
      ]],
      email: ['test3@test3.com', [
        Validators.required,
        Validators.email
      ]],
      password: ['12345678', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['12345678', [
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
      next: (response) => {
        const { access_token } = response;

        this.tokenService.setToken(access_token, false);

        this.router.navigate(['feed']);
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
