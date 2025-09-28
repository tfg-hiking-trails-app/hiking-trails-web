import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile-options-menu',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],
  templateUrl: './options-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsMenuComponent {

  @Input() mobileView = false;
  logged = signal<boolean>(false);
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
    this.logged.set(authService.isAuthenticated());
  }

  logout() {
    this.authService.logout();
  }

}
