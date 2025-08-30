import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LangService } from './services/lang.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslateModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    private translate: TranslateService,
    private langService: LangService
  ) {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');

    this.translate.use(this.langService.getCurrentLanguage() || 'es');
  }
}
