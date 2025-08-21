import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';

@Component({
  selector: 'app-loading-spinner',
  imports: [
    MaterialModules
  ],
  templateUrl: './loading-spinner.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent { }
