import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { CitySummary } from "../interfaces/location/City";
import { CountrySummary } from "../interfaces/location/Country";
import { StateSummary } from "../interfaces/location/State";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getAllCountriesSummary: `${ environment.apiGatewayUrl }/country/all/summary`,
    getStatesByCountrySummary: (countryCode: string) => `${ environment.apiGatewayUrl }/state/country/${ countryCode }/all/summary`,
    getCitiesByStateSummary: (stateCode: string) => `${ environment.apiGatewayUrl }/city/state/${ stateCode }/all/summary`,
  };

  getAllCountriesSummary(): Observable<CountrySummary[]> {
    return this.apiService.get<CountrySummary[]>(this.routes.getAllCountriesSummary);
  }

  getStatesByCountrySummary(countryCode: string): Observable<StateSummary[]> {
    return this.apiService.get<StateSummary[]>(this.routes.getStatesByCountrySummary(countryCode));
  }

  getCitiesByStateSummary(stateCode: string): Observable<CitySummary[]> {
    return this.apiService.get<CitySummary[]>(this.routes.getCitiesByStateSummary(stateCode));
  }

}
