import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { LanguageOption } from '../../interfaces/common/LanguageOption';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    LoginComponent,
    MaterialModules,
    RegisterComponent,
    TranslatePipe
  ],
  templateUrl: './auth.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private translate: TranslateService = inject(TranslateService);

  languages: LanguageOption[] = [
    { code: 'es', label: 'auth.spanish', icon: 'images/es.png' },
    { code: 'en', label: 'auth.english', icon: 'images/en.png' }
  ];
  currentLang = signal(this.translate.currentLang || this.translate.currentLang || 'es');

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }
}
