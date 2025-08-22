import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Account } from '../interfaces/account/Account';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getAccountLogged: `${ environment.apiGatewayUrl }/account/logged`,
    getByCode: `${ environment.apiGatewayUrl }/account/:code`, // /{code}
  };

  getLogged(): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getAccountLogged);
  }

  getByCode(code: string): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getByCode.replace(':code', code));
  }

}
