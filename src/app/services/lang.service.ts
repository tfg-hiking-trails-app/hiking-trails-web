import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class LangService {

  private localStorageKey = 'lang';

  constructor(
    private translate: TranslateService
  ) {
    const store = localStorage.getItem(this.localStorageKey);
    const lang = store || (navigator.language.startsWith('en') ? 'en' : 'es');

    this.translate.use(lang);
  }

  getLocale(): string {
    const lang = this.getCurrentLanguage();

    if (lang.startsWith('en')) {
      return 'en-GB';
    }

    return 'es-ES';
  }

  getCurrentLanguage(): string {
    return localStorage.getItem(this.localStorageKey) || this.translate.currentLang;
  }

  setLanguage(lang: string): void {
    localStorage.setItem(this.localStorageKey, lang);
    this.translate.use(lang);
  }

}
