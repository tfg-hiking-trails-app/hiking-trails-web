import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../services/auth.service';
import { TokenService } from '../../../../services/token.service';

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

  private authService: AuthService = inject(AuthService);
  private tokenService: TokenService = inject(TokenService);
  private router: Router = inject(Router);

  logout() {
    this.authService
      .logout()
      .subscribe({
        next: () => {
          this.tokenService.clearToken();
          this.router.navigate(['/auth']);
        },
        error: (error) => console.error(error), // Handle error gracefully
      });
  }

}
