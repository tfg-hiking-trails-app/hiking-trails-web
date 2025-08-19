import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../interfaces/auth/Login';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private routes = {
    loginPath: `${ environment.apiGatewayUrl }/auth/login`,
    refreshPath: `${ environment.apiGatewayUrl }/auth/refresh`,
    logoutPath: `${ environment.apiGatewayUrl }/auth/logout`,
  };

  constructor(
    private apiService: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse, LoginRequest>(
      this.routes.loginPath,
      { withCredentials: true },
      request
    );
  }

  refresh(): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(
      this.routes.refreshPath,
      { withCredentials: true }
    );
  }

  logout(): void {
    this.apiService.post<void>(
      this.routes.logoutPath,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.tokenService.clearToken();
        this.router.navigate(['/auth']);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  getUserCode(): string | null {
    const payload = this.tokenService.getPayload();

    if (!payload) {
      this.logout();
    }

    return payload?.userCode || null;
  }

  getUserName(): string | null {
    const payload = this.tokenService.getPayload();

    if (!payload) {
      this.logout();
    }

    return payload?.username || null;
  }

}
