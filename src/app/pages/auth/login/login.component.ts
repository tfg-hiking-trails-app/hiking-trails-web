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
import { Router } from '@angular/router';

import { LoginRequest } from '../../../interfaces/auth/Login';
import { AuthService } from '../../../services/auth.service';
import { TokenService } from '../../../services/token.service';

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
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['test', [
        Validators.required
      ]],
      password: ['password', [
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

    const remember = this.loginForm.value.rememberMe;

    this.authService.login(loginDto).subscribe({
      next: (response) => {
        const { access_token } = response;

        this.tokenService.setToken(access_token, remember);

        this.router.navigate(['feed']);
      },
      error: (error) => {
        console.error("Login failed", error);
      }
    });

    this.loginForm.reset();
    this.submitted = false;
  }

}
