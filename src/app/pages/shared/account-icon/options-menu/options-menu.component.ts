import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile-options-menu',
  imports: [
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './options-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsMenuComponent {

  constructor(
    private authService: AuthService,
  ) { }

  logout() {
    this.authService.logout();
  }

}
