import { Injectable } from "@angular/core";

import { environment } from "../../environments/environment";
import { Coordinates } from "../interfaces/fit-data/Coordinates";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class FitDataService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getCoordinates: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/coordinates`,
  };

  getCoordinates(hikingTrailCode: string) {
    const url: string = this.routes.getCoordinates(hikingTrailCode);

    return this.apiService.get<Coordinates[]>(url);
  }

}
