import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { Filter } from "../interfaces/common/Filter";
import { Pagination } from "../interfaces/common/Pagination";
import { HikingTrail } from "../interfaces/hiking-trail/HikingTrail";
import { HikingTrailFilter } from "../interfaces/hiking-trail/HikingTrailFilter";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class HikingTrailService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getByCode: (code: string) => `${ environment.apiGatewayUrl }/hiking-trail/${ code }`,
    getByAccountCodesPaged: `${ environment.apiGatewayUrl }/hiking-trail/account-codes`,
  };

  getByCode(code: string): Observable<HikingTrail> {
    const url: string = this.routes.getByCode(code);
    return this.apiService.get<HikingTrail>(url);
  }

  getByAccountCodesPaged(accountCodes: string[], filter: Filter): Observable<Pagination<HikingTrail>> {
    const url: string = this.routes.getByAccountCodesPaged;
    const body: HikingTrailFilter = { accountCodes, filter };

    return this.apiService.post<Pagination<HikingTrail>>(url, {}, body);
  }

}
