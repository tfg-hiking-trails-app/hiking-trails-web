import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class LangService {

  constructor(
    private translate: TranslateService
  ) { }

  getLocale(): string {
    const lang = (this.translate.currentLang || navigator.language);

    if (lang.startsWith('en')) {
      return 'en-GB';
    }

    return 'es-ES';
  }
}
