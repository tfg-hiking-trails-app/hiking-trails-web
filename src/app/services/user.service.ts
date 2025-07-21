import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private routes = {
    getUsers: `${ environment.apiGatewayUrl }/users`,
  };

  constructor(
    private apiService: ApiService
  ) { }

  /* BORRAR */
  getUsers() {
    return this.apiService.get(
      this.routes.getUsers,
      { withCredentials: true }
    );
  }

}
