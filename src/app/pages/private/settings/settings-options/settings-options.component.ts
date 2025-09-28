import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-options',
  imports: [
    TranslatePipe,
    RouterLink,
    RouterLinkActive
],
  templateUrl: './settings-options.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsOptionsComponent {

  url: string = '';

  options: { key: string, label: string, icon: string }[] = [
    { key: 'profile', label: 'settings.options.profile', icon: 'person' },
    { key: 'account', label: 'settings.options.account', icon: 'account_circle' },
    { key: 'screen', label: 'settings.options.screen', icon: 'computer' },
  ];

  constructor(
    private router: Router
  ) {
    this.url = this.router.url;
  }

}
