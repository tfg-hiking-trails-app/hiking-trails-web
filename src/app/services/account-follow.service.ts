import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { Account } from "../interfaces/account/Account";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class AccountFollowService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getFollowersByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followers/${ accountCode }`,
    getAllFollowersByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followers/${ accountCode }/all`,
    getFollowedByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followed/${ accountCode }`,
    getAllFollowedByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followed/${ accountCode }/all`,
    getFollowedCountByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followed/${ accountCode }/count`,
    getFollowersCountByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followers/${ accountCode }/count`,
  };

  getFollowersByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.getFollowersByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getAllFollowersByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.getAllFollowersByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getFollowedByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.getFollowedByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getAllFollowedByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.getAllFollowedByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getFollowedCountByAccountCode(accountCode: string): Observable<number> {
    const url = this.routes.getFollowedCountByAccountCode(accountCode);
    return this.apiService.get<number>(url);
  }

  getFollowersCountByAccountCode(accountCode: string): Observable<number> {
    const url = this.routes.getFollowersCountByAccountCode(accountCode);
    return this.apiService.get<number>(url);
  }

}
