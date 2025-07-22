import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly ACCESS_TOKEN: string = 'access_token';

  setToken(token: string, remember: boolean): void {
    localStorage.setItem('remember', JSON.stringify(remember));

    remember
      ? localStorage.setItem(this.ACCESS_TOKEN, token)
      : sessionStorage.setItem(this.ACCESS_TOKEN, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN) ?? localStorage.getItem(this.ACCESS_TOKEN);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.ACCESS_TOKEN);
  }

}
