import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { LoginRequest } from '../../../interfaces/auth/Login';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './login.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted: boolean = false;
  showPassword = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false],
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const loginDto: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    }

    this.userService.login(loginDto).subscribe({
      next: (response) => {
        const { access_token } = response;

        sessionStorage.setItem('access_token', access_token);
      },
      error: (error) => {
        console.error("Login failed", error);
      }
    });

    this.loginForm.reset();
    this.submitted = false;
  }

}
