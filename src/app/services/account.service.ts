import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Account } from '../interfaces/account/Account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiService: ApiService = inject(ApiService);

  private routes = {
    getAccountLogged: `${ environment.apiGatewayUrl }/account/logged`,
  };

  getLogged(): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getAccountLogged);
  }

}
