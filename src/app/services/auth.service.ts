import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../interfaces/auth/Login';
import { ApiService } from './api.service';

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
    private apiService: ApiService
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

  logout(): Observable<void> {
    return this.apiService.post<void>(this.routes.logoutPath);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('access_token');
  }

}
