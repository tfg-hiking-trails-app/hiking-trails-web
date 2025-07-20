import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Filter } from "../interfaces/common/Filter";
import { HttpOptions } from "../interfaces/common/HttpOptions";

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private http = inject(HttpClient);

  get<TResponse>(url: string): Observable<TResponse> {
    return this.http.get<TResponse>(url);
  }

  getPaged<TResponse>(url: string, filter: Filter): Observable<TResponse> {
    let params = new HttpParams();

    Object.keys(filter).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<TResponse>(url, { params });
  }

  post<TBody, TResponse>(
    url: string,
    body: TBody,
    options: HttpOptions = {}
  ): Observable<TResponse> {
    return this.http.post<TResponse>(url, body, options);
  }

  patch<TBody, TResponse>(url: string, body: TBody): Observable<TResponse> {
    return this.http.patch<TResponse>(url, body);
  }

  delete<TResponse>(url: string): Observable<TResponse> {
    return this.http.delete<TResponse>(url);
  }

}
