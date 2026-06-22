import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, Observable } from "rxjs";

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

  private savedTrailCodes$ = new BehaviorSubject<Set<string> | null>(null);
  private savedRequested = false;

  private routes = {
    getLogged: `${ environment.apiGatewayUrl }/collection/logged`,
    savedTrails: `${ environment.apiGatewayUrl }/collection/saved-trails`,
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

  getSavedTrailCodes(): Observable<Set<string>> {
    if (!this.savedRequested) {
      this.savedRequested = true;
      this.loadSavedTrailCodes();
    }

    return this.savedTrailCodes$.pipe(
      filter((set): set is Set<string> => set !== null)
    );
  }

  markTrailSaved(trailCode: string): void {
    const set = new Set(this.savedTrailCodes$.value ?? []);
    set.add(trailCode);
    this.savedTrailCodes$.next(set);
  }

  markTrailUnsaved(trailCode: string): void {
    const set = new Set(this.savedTrailCodes$.value ?? []);
    set.delete(trailCode);
    this.savedTrailCodes$.next(set);
  }

  refreshSavedTrailCodes(): void {
    this.savedRequested = true;
    this.loadSavedTrailCodes();
  }

  private loadSavedTrailCodes(): void {
    this.apiService.get<string[]>(this.routes.savedTrails)
      .subscribe({
        next: (codes: string[]) => this.savedTrailCodes$.next(new Set(codes)),
        error: () => this.savedTrailCodes$.next(new Set<string>())
      });
  }

}
