import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    NavbarComponent,
    RouterOutlet
],
  templateUrl: './layout.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent { }
