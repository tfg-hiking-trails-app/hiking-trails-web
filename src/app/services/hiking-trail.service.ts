import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ApiService } from "./api.service";
import { Comment, CreateComment } from "../interfaces/hiking-trail/Comment";
import { CreatePrestige, DeletePrestige, Prestige } from "../interfaces/hiking-trail/Prestige";
import { DifficultyLevel } from "../interfaces/hiking-trail/DifficultyLevel";
import { environment } from "../../environments/environment";
import { Filter } from "../interfaces/common/Filter";
import { CreateHikingTrail, HikingTrail, UpdateHikingTrail } from "../interfaces/hiking-trail/HikingTrail";
import { HikingTrailFilter } from "../interfaces/hiking-trail/HikingTrailFilter";
import { Pagination } from "../interfaces/common/Pagination";
import { TerrainType } from "../interfaces/hiking-trail/TerrainType";
import { TrailType } from "../interfaces/hiking-trail/TrailType";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HikingTrailService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    add: `${ environment.apiGatewayUrl }/hiking-trail`,
    addComment: `${ environment.apiGatewayUrl }/comment`,
    addPrestige: `${ environment.apiGatewayUrl }/prestige`,
    edit: (code: string) => `${ environment.apiGatewayUrl }/hiking-trail/${ code }`,
    delete: (code: string) => `${ environment.apiGatewayUrl }/hiking-trail/${ code }`,
    getAllDifficultyLevels: `${ environment.apiGatewayUrl }/difficulty-level/all`,
    getAllTerrainTypes: `${ environment.apiGatewayUrl }/terrain-type/all`,
    getAllTrailTypes: `${ environment.apiGatewayUrl }/trail-type/all`,
    getByAccountCodesPaged: `${ environment.apiGatewayUrl }/hiking-trail/account-codes`,
    getByCode: (code: string) => `${ environment.apiGatewayUrl }/hiking-trail/${ code }`,
    getNewestPaged: `${ environment.apiGatewayUrl }/hiking-trail/newest`,
    removeComment: (code: string) => `${ environment.apiGatewayUrl }/comment/${ code }`,
    removePrestige: `${ environment.apiGatewayUrl }/prestige`,
    search: (query: string, numberResults: number) => `${ environment.apiGatewayUrl }/hiking-trail/searcher?search=${ encodeURIComponent(query) }&numberResults=${ numberResults }`,
    uploadFitFile: `${ environment.apiGatewayUrl }/activity-files`,
  };

  add(hikingTrail: CreateHikingTrail | Partial<CreateHikingTrail>): Observable<HikingTrail> {
    const url: string = this.routes.add;

    const formData = new FormData();

    const { images, metrics, ...rest } = hikingTrail;

    for (const [key, value] of Object.entries(rest)) {
      if (value !== null && value !== undefined)
        formData.append(key, String(value));
    }

    if (metrics) {
      for (const [key, value] of Object.entries(metrics)) {
        if (value !== null && value !== undefined)
          formData.append(`metrics.${ key }`, String(value));
      }
    }

    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i], images[i].name);
      }
    }

    return this.apiService.post<HikingTrail>(url, formData);
  }

  edit(code: string, hikingTrail: UpdateHikingTrail | Partial<UpdateHikingTrail>): Observable<HikingTrail> {
    const url: string = this.routes.edit(code);

    const formData = new FormData();

    const { images, metrics, ...rest } = hikingTrail;

    for (const [key, value] of Object.entries(rest)) {
      if (value !== null && value !== undefined)
        formData.append(key, String(value));
    }

    if (metrics) {
      for (const [key, value] of Object.entries(metrics)) {
        if (value !== null && value !== undefined)
          formData.append(`metrics.${ key }`, String(value));
      }
    }

    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i], images[i].name);
      }
    }

    return this.apiService.put<HikingTrail>(url, formData);
  }

  delete(code: string): Observable<void> {
    const url: string = this.routes.delete(code);
    return this.apiService.delete<void>(url);
  }

  getByCode(code: string): Observable<HikingTrail> {
    const url: string = this.routes.getByCode(code);
    return this.apiService.get<HikingTrail>(url);
  }

  getByAccountCodesPaged(accountCodes: string[], filter: Filter): Observable<Pagination<HikingTrail>> {
    const url: string = this.routes.getByAccountCodesPaged;
    const body: HikingTrailFilter = { accountCodes, filter };

    return this.apiService.post<Pagination<HikingTrail>>(url, body);
  }

  getNewestPaged(filter: Filter): Observable<Pagination<HikingTrail>> {
    const url: string = this.routes.getNewestPaged;
    const params = new HttpParams({ fromObject: {
      pageNumber: filter.pageNumber ?? 1,
      pageSize: filter.pageSize ?? 10,
      sortField: filter.sortField ?? 'StartTime',
      sortDirection: filter.sortDirection ?? 'desc',
    }});

    return this.apiService.get<Pagination<HikingTrail>>(url, { params });
  }

  getAllDifficultyLevels(): Observable<DifficultyLevel[]> {
    const url: string = this.routes.getAllDifficultyLevels;
    return this.apiService.get<DifficultyLevel[]>(url);
  }

  getAllTerrainTypes(): Observable<TerrainType[]> {
    const url: string = this.routes.getAllTerrainTypes;
    return this.apiService.get<TerrainType[]>(url);
  }

  getAllTrailTypes(): Observable<TrailType[]> {
    const url: string = this.routes.getAllTrailTypes;
    return this.apiService.get<TrailType[]>(url);
  }

  search(query: string, numberResults: number = 5): Observable<HikingTrail[]> {
    const url: string = this.routes.search(query, numberResults);
    return this.apiService.get<HikingTrail[]>(url);
  }

  addPrestige(prestige: CreatePrestige): Observable<Prestige> {
    const url: string = this.routes.addPrestige;
    return this.apiService.post<Prestige>(url, prestige);
  }

  removePrestige(deletePrestige: DeletePrestige): Observable<string> {
    const url: string = this.routes.removePrestige;
    return this.apiService.deleteWithBody<string>(url, deletePrestige);
  }

  addComment(comment: CreateComment): Observable<Comment> {
    const url: string = this.routes.addComment;
    return this.apiService.post<Comment>(url, comment);
  }

  removeComment(code: string): Observable<string> {
    const url: string = this.routes.removeComment(code);
    return this.apiService.delete<string>(url);
  }

  uploadFitFile(file: File): Observable<string> {
    const url: string = this.routes.uploadFitFile;
    const formData: FormData = new FormData();
    formData.append('ActivityFile', file, file.name);

    return this.apiService.post<string>(url, formData);
  }

}
