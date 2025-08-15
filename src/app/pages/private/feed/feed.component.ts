import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MaterialModules } from '@material/material.modules';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-feed',
  imports: [
    MaterialModules,
    NavbarComponent
  ],
  templateUrl: './feed.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {

}
