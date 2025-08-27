import { Injectable } from "@angular/core";

import { ApiService } from "./api.service";
import { Coordinates } from "../interfaces/fit-data/Coordinates";
import { environment } from "../../environments/environment";
import { FileId } from "../interfaces/fit-data/FileId";
import { GraphicsData } from "../interfaces/fit-data/GraphicsData";
import { Lap } from "../interfaces/fit-data/Lap";

@Injectable({
  providedIn: 'root'
})
export class FitDataService {

  constructor(
    private apiService: ApiService
  ) { }

  private routes = {
    getFileId: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/file-id/${ hikingTrailCode }`,
    getLaps: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/laps/${ hikingTrailCode }`,
    getCoordinates: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/coordinates`,
    getGraphicsData: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/graphics-data`,
    getHeartRateData: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/heart-rate`,
    getAltitudeData: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/altitude`,
    getCadenceData: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/cadence`,
    getDistanceData: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/distance`,
    getSpeedData: (hikingTrailCode: string) => `${ environment.apiGatewayUrl }/fit-file-data/records/${ hikingTrailCode }/speed`,
  };

  getFileId(hikingTrailCode: string) {
    const url: string = this.routes.getFileId(hikingTrailCode);

    return this.apiService.get<FileId>(url);
  }

  getLaps(hikingTrailCode: string) {
    const url: string = this.routes.getLaps(hikingTrailCode);

    return this.apiService.get<Lap[]>(url);
  }

  getCoordinates(hikingTrailCode: string) {
    const url: string = this.routes.getCoordinates(hikingTrailCode);

    return this.apiService.get<Coordinates[]>(url);
  }

  getGraphicsData(hikingTrailCode: string) {
    const url: string = this.routes.getGraphicsData(hikingTrailCode);

    return this.apiService.get<GraphicsData[]>(url);
  }

  getHeartRateData(hikingTrailCode: string) {
    const url: string = this.routes.getHeartRateData(hikingTrailCode);

    return this.apiService.get<GraphicsData[]>(url);
  }

  getAltitudeData(hikingTrailCode: string) {
    const url: string = this.routes.getAltitudeData(hikingTrailCode);

    return this.apiService.get<GraphicsData[]>(url);
  }

  getCadenceData(hikingTrailCode: string) {
    const url: string = this.routes.getCadenceData(hikingTrailCode);

    return this.apiService.get<GraphicsData[]>(url);
  }

  getDistanceData(hikingTrailCode: string) {
    const url: string = this.routes.getDistanceData(hikingTrailCode);

    return this.apiService.get<GraphicsData[]>(url);
  }

  getSpeedData(hikingTrailCode: string) {
    const url: string = this.routes.getSpeedData(hikingTrailCode);

    return this.apiService.get<GraphicsData[]>(url);
  }

}
