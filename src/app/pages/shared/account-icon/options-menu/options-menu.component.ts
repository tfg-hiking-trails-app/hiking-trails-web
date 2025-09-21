import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

  userLoggedCode = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const code: string | null = this.authService.getUserCode();

    if (!code) {
      this.router.navigate(['/feed']);
      return;
    }

    this.userLoggedCode.set(code);
  }

  logout() {
    this.authService.logout();
  }

}
