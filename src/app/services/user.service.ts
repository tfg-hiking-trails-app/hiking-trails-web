import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../interfaces/auth/Login';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private routes = {
    loginPath: `${ environment.apiGatewayUrl }/auth/login`,
  };

  constructor(
    private apiService: ApiService
  ) { }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginRequest, LoginResponse>(
      this.routes.loginPath,
      request,
      { withCredentials: true }
    );
  }

}
