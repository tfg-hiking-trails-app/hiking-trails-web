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
    GetFollowersByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followers/${ accountCode }`,
    GetAllFollowersByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followers/${ accountCode }/all`,
    GetFollowedByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followed/${ accountCode }`,
    GetAllFollowedByAccountCode: (accountCode: string) => `${ environment.apiGatewayUrl }/account-follow/followed/${ accountCode }/all`,
  };

  getFollowersByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.GetFollowersByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getAllFollowersByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.GetAllFollowersByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getFollowedByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.GetFollowedByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

  getAllFollowedByAccountCode(accountCode: string): Observable<Account[]> {
    const url = this.routes.GetAllFollowedByAccountCode(accountCode);
    return this.apiService.get<Account[]>(url);
  }

}
