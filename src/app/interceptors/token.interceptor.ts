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
  finalize,
  Observable,
  switchMap,
  take,
  throwError
} from "rxjs";

import { LoginResponse } from '../interfaces/auth/Login';
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing: boolean = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuthLogin = request.url.includes('/auth/login');
    const isAuthRefresh = request.url.includes('/auth/refresh');

    if (!isAuthLogin && !isAuthRefresh) {
      // embed the token in the request
      const token = this.tokenService.getToken();

      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${ token }`
          }
        });
      }
    }

    return next.handle(request).pipe(
      //if the access_token is expired start the refresh process
      catchError(err => {
        if ((err.status === 401 || err.status === 403) && !isAuthLogin && !isAuthRefresh) {
          return this.handleAuthError(request, next);
        }

        if ((err.status === 401 || err.status === 403) && isAuthRefresh) {
          this.tokenService.clearToken();
          this.router.navigate(['auth']);
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
          const retried = originalRequest.clone({
            setHeaders: {
              Authorization: `Bearer ${ token }`
            }
          });
          return next.handle(retried);
        })
      );
    }

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.authService.refresh().pipe(
      switchMap((response: LoginResponse) => {
        // the new access token is obtained
        const newToken = response.access_token;

        this.tokenService.setToken(newToken, JSON.parse(localStorage.getItem('remember') || 'false'));
        this.refreshSubject.next(newToken);

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
        this.tokenService.clearToken();
        this.router.navigate(['auth']);

        return throwError(() => err);
      }),
      finalize(() => this.isRefreshing = false)
    );
  }

}
