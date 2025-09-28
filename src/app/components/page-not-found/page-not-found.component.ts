import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-404',
  imports: [
    MaterialModules,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './page-not-found.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {
  @Input() message: string = '';
}
