import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { SettingsOptionsComponent } from './settings-options/settings-options.component';

@Component({
  selector: 'app-settings',
  imports: [
    MaterialModules,
    RouterOutlet,
    SettingsOptionsComponent,
    TranslatePipe
  ],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {

  isMobile = signal<boolean>(false);

  constructor(
    private breakPointObserver: BreakpointObserver
  ) { }

  ngOnInit() {
    this.breakPointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((state) => this.isMobile.set(state.matches));
  }

}
