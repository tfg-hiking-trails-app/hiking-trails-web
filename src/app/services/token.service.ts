import { Injectable } from "@angular/core";

import { jwtDecode } from "jwt-decode";
import { Payload } from "../interfaces/token/payload";

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

  getPayload(): Payload | null {
    const token = this.getToken();

    if (!token)
      return null;

    return jwtDecode<Payload>(token);
  }

}
