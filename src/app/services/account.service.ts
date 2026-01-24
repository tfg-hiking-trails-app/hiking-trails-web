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
    getByCode: (code: string) => `${ environment.apiGatewayUrl }/account/${ code }`,
    update: (code: string) => `${ environment.apiGatewayUrl }/account/${ code }`,
    getAllGenders: `${ environment.apiGatewayUrl }/gender/all`,
    search: (query: string, numberResults: number = 5) =>
      `${ environment.apiGatewayUrl }/account/searcher?search=${ encodeURIComponent(query) }&numberResults=${ numberResults }`
  };

  getLogged(): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getAccountLogged);
  }

  getByCode(code: string): Observable<Account> {
    return this.apiService.get<Account>(this.routes.getByCode(code));
  }

  update(code: string, account: AccountUpdate): Observable<Account> {
    const formData = new FormData();

    for (const [key, value] of Object.entries(account)) {
      if (value !== null && value !== undefined)
        formData.append(key, value);
    }

    return this.apiService.put<Account>(
      this.routes.update(code),
      formData
    );
  }

  getAllGenders(): Observable<Gender[]> {
    return this.apiService.get<Gender[]>(this.routes.getAllGenders);
  }

  search(query: string, numberResults: number = 5): Observable<Account[]> {
    return this.apiService.get<Account[]>(
      this.routes.search(query, numberResults)
    );
  }

}
