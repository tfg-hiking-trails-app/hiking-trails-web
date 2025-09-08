import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Filter } from "../interfaces/common/Filter";
import { HttpOptions } from "../interfaces/common/HttpOptions";

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  get<TResponse>(
    url: string,
    options: HttpOptions = {}
  ): Observable<TResponse> {
    return this.http.get<TResponse>(url, options);
  }

  getPaged<TResponse>(
    url: string,
    filter: Filter,
    options: HttpOptions = {}
  ): Observable<TResponse> {
    let params = new HttpParams();

    Object.keys(filter).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<TResponse>(url, { params, ...options });
  }

  post<TResponse>(
    url: string,
    options: HttpOptions = {},
    body?: any
  ): Observable<TResponse> {
    return this.http.post<TResponse>(url, body, options);
  }

  put<TResponse>(
    url: string,
    body: any,
    options: HttpOptions = {}
  ): Observable<TResponse> {
    return this.http.put<TResponse>(url, body, options);
  }

  patch<TResponse>(
    url: string,
    body: any,
    options: HttpOptions = {}
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(url, body, options);
  }

  delete<TResponse>(
    url: string,
    options: HttpOptions = {}
  ): Observable<TResponse> {
    return this.http.delete<TResponse>(url, options);
  }

}
