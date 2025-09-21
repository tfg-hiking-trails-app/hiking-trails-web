import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Account, AccountUpdate } from '../interfaces/account/Account';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Gender } from '../interfaces/account/Gender';
import { CountrySummary } from '../interfaces/account/Country';
import { StateSummary } from '../interfaces/account/State';
import { CitySummary } from '../interfaces/account/City';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getAccountLogged: `${ environment.apiGatewayUrl }/account/logged`,
    getByCode: `${ environment.apiGatewayUrl }/account/:code`,
    update: `${ environment.apiGatewayUrl }/account/:code`,
    getAllGenders: `${ environment.apiGatewayUrl }/gender/all`,
    getAllCountriesSummary: `${ environment.apiGatewayUrl }/country/all/summary`,
    getStatesByCountrySummary: `${ environment.apiGatewayUrl }/state/country/:countryCode/all/summary`,
    getCitiesByStateSummary: `${ environment.apiGatewayUrl }/city/state/:stateCode/all/summary`,
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
      if (value !== null && value !== undefined)
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

  getAllCountriesSummary(): Observable<CountrySummary[]> {
    return this.apiService.get<CountrySummary[]>(this.routes.getAllCountriesSummary);
  }

  getStatesByCountrySummary(countryCode: string): Observable<StateSummary[]> {
    return this.apiService.get<StateSummary[]>(this.routes.getStatesByCountrySummary.replace(':countryCode', countryCode));
  }

  getCitiesByStateSummary(stateCode: string): Observable<CitySummary[]> {
    return this.apiService.get<CitySummary[]>(this.routes.getCitiesByStateSummary.replace(':stateCode', stateCode));
  }

}
