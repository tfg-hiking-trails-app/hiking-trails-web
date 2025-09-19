import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Account, AccountUpdate } from '../interfaces/account/Account';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Gender } from '../interfaces/account/Gender';

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
    update: `${ environment.apiGatewayUrl }/account/:code`,
    getAllGenders: `${ environment.apiGatewayUrl }/gender/all`
  };

  getLogged(): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getAccountLogged);
  }

  getByCode(code: string): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getByCode.replace(':code', code));
  }

  update(code: string, account: AccountUpdate): Observable<Account> {
    const formData = new FormData();

    for (const [key, value] of Object.entries(account)) {
      formData.append(key, value);
    }

    return this.apiService.put<Account>(
      this.routes.update.replace(':code', code),
      formData
    );
  }

  getAllGenders(): Observable<Gender[]> {
    return this.apiService.get<Gender[]>(this.routes.getAllGenders);
  }

}
