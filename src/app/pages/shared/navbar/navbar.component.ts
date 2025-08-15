import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';

import { AccountIconComponent } from '../account-icon/account-icon.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { SearchBarComponent } from '../SearchBar/search-bar.component';

@Component({
  selector: 'app-navbar',
  imports: [
    AccountIconComponent,
    MaterialModules,
    SearchBarComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './navbar.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent { }
