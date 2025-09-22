import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { Filter } from "../interfaces/common/Filter";
import { Pagination } from "../interfaces/common/Pagination";
import { HikingTrail } from "../interfaces/hiking-trail/HikingTrail";
import { HikingTrailFilter } from "../interfaces/hiking-trail/HikingTrailFilter";
import { ApiService } from "./api.service";
import { CreatePrestige, DeletePrestige, Prestige } from "../interfaces/hiking-trail/Prestige";
import { Comment, CreateComment } from "../interfaces/hiking-trail/Comment";

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
    search: (query: string, numberResults: number) =>
      `${ environment.apiGatewayUrl }/hiking-trail/searcher?search=${ encodeURIComponent(query) }&numberResults=${ numberResults }`,
    addPrestige: `${ environment.apiGatewayUrl }/prestige`,
    removePrestige: `${ environment.apiGatewayUrl }/prestige`,
    addComment: `${ environment.apiGatewayUrl }/comment`,
    removeComment: (code: string) => `${ environment.apiGatewayUrl }/comment/${ code }`
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

  search(query: string, numberResults: number = 5): Observable<HikingTrail[]> {
    const url: string = this.routes.search(query, numberResults);
    return this.apiService.get<HikingTrail[]>(url);
  }

  addPrestige(prestige: CreatePrestige): Observable<Prestige> {
    const url: string = this.routes.addPrestige;
    return this.apiService.post<Prestige>(url, {}, prestige);
  }

  removePrestige(deletePrestige: DeletePrestige): Observable<string> {
    const url: string = this.routes.removePrestige;
    return this.apiService.deleteWithBody<string>(url, deletePrestige);
  }

  addComment(comment: CreateComment): Observable<Comment> {
    const url: string = this.routes.addComment;
    return this.apiService.post<Comment>(url, {}, comment);
  }

  removeComment(code: string): Observable<string> {
    const url: string = this.routes.removeComment(code);
    return this.apiService.delete<string>(url);
  }

}
