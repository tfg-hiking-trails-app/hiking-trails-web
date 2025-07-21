import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MaterialModules } from '@material/material.modules';

@Component({
  selector: 'app-feed',
  imports: [
    MaterialModules
  ],
  templateUrl: './feed.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {

}
