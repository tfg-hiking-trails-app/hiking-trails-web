import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  tap,
  throwError
} from "rxjs";

import { LoginResponse } from '../interfaces/auth/Login';
import { AuthService } from "../services/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing: boolean = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // the login does not carry the token
    if (request.url.includes('/auth/login')) {
      return next.handle(request);
    }

    // embed the token in the request
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`
      }
    });

    return next.handle(request).pipe(
      //if the access_token is expired start the refresh process
      catchError(err => {
        if (err.status === 401 || err.status === 403) {
          return this.handleAuthError(request, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handleAuthError(originalRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token: string | null) => {
          const request = originalRequest.clone({
            setHeaders: {
              Authorization: `Bearer ${ token }`
            }
          });
          return next.handle(request);
        })
      );
    }

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.authService.refresh().pipe(
      tap((response: LoginResponse) => {
        // the new access token is obtained
        const newToken = response.access_token;

        sessionStorage.setItem('access_token', newToken);
        this.refreshSubject.next(newToken);
        this.isRefreshing = false;
      }),
      switchMap((response: LoginResponse) => {
        // the request is re-requested with the new token.
        const request = originalRequest.clone({
          setHeaders: {
            Authorization: `Bearer ${ response.access_token }`
          }
        });

        return next.handle(request);
      }),
      catchError(err => {
        // an error occurred while trying to refresh the token
        this.isRefreshing = false;
        sessionStorage.removeItem('access_token');
        this.router.navigate(['auth']);

        return throwError(() => err);
      })
    );
  }

}
