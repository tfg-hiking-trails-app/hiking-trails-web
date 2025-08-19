import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ApiService } from "./api.service";
import { environment } from "../../environments/environment";
import { Filter } from "../interfaces/common/Filter";
import { HikingTrail } from "../interfaces/hiking-trail/HikingTrail";
import { HikingTrailFilter } from "../interfaces/hiking-trail/HikingTrailFilter";
import { Pagination } from "../interfaces/common/Pagination";

@Injectable({
  providedIn: 'root'
})
export class HikingTrailService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getByAccountCodesPaged: `${ environment.apiGatewayUrl }/hiking-trail/account-codes`,
  };

  getByAccountCodesPaged(accountCodes: string[], filter: Filter): Observable<Pagination<HikingTrail>> {
    const url: string = this.routes.getByAccountCodesPaged;
    const body: HikingTrailFilter = { accountCodes, filter };

    return this.apiService.post<Pagination<HikingTrail>, HikingTrailFilter>(url, {}, body);
  }

}
