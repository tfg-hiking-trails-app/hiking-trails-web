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

  options: { key: string, label: string }[] = [
    { key: 'profile', label: 'settings.options.profile' },
    { key: 'account', label: 'settings.options.account' },
    { key: 'screen', label: 'settings.options.screen' },
  ];

  constructor(
    private router: Router
  ) {
    this.url = this.router.url;
    console.log(this.url);
  }

}
