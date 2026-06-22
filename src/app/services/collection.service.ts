import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { Collection, CreateCollection, UpdateCollection } from "../interfaces/hiking-trail/Collection";
import { Filter } from "../interfaces/common/Filter";
import { HikingTrail } from "../interfaces/hiking-trail/HikingTrail";
import { Pagination } from "../interfaces/common/Pagination";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getLogged: `${ environment.apiGatewayUrl }/collection/logged`,
    getByCode: (code: string) => `${ environment.apiGatewayUrl }/collection/${ code }`,
    getTrails: (code: string) => `${ environment.apiGatewayUrl }/collection/${ code }/trails`,
    create: `${ environment.apiGatewayUrl }/collection`,
    update: (code: string) => `${ environment.apiGatewayUrl }/collection/${ code }`,
    delete: (code: string) => `${ environment.apiGatewayUrl }/collection/${ code }`,
    addTrail: (code: string) => `${ environment.apiGatewayUrl }/collection/${ code }/trails`,
    removeTrail: (code: string, trailCode: string) => `${ environment.apiGatewayUrl }/collection/${ code }/trails/${ trailCode }`,
  };

  getLogged(): Observable<Collection[]> {
    return this.apiService.get<Collection[]>(this.routes.getLogged);
  }

  getByCode(code: string): Observable<Collection> {
    return this.apiService.get<Collection>(this.routes.getByCode(code));
  }

  getTrailsPaged(code: string, filter: Filter): Observable<Pagination<HikingTrail>> {
    const params = new HttpParams({ fromObject: {
      pageNumber: filter.pageNumber ?? 1,
      pageSize: filter.pageSize ?? 10,
      sortField: filter.sortField ?? 'StartTime',
      sortDirection: filter.sortDirection ?? 'desc',
    }});

    return this.apiService.get<Pagination<HikingTrail>>(this.routes.getTrails(code), { params });
  }

  create(collection: CreateCollection): Observable<Collection> {
    return this.apiService.post<Collection>(this.routes.create, collection);
  }

  rename(code: string, collection: UpdateCollection): Observable<string> {
    return this.apiService.put<string>(this.routes.update(code), collection);
  }

  delete(code: string): Observable<void> {
    return this.apiService.delete<void>(this.routes.delete(code));
  }

  addTrail(code: string, hikingTrailCode: string): Observable<void> {
    return this.apiService.post<void>(this.routes.addTrail(code), { hikingTrailCode });
  }

  removeTrail(code: string, trailCode: string): Observable<void> {
    return this.apiService.delete<void>(this.routes.removeTrail(code, trailCode));
  }

}
