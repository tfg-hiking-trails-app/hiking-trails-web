import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { NavbarPublicComponent } from '../../public/navbar/navbar.component';
import { NavbarPrivateComponent } from '../../private/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    NavbarPrivateComponent,
    NavbarPublicComponent,
    RouterOutlet
],
  templateUrl: './layout.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {

  logged = signal<boolean>(false);

  constructor(
    private authService: AuthService
  ) {
    this.logged.set(this.authService.isAuthenticated());
  }

}
