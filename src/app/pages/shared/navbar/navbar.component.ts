import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { AccountIconComponent } from '../account-icon/account-icon.component';
import { OptionsMenuComponent } from '../account-icon/options-menu/options-menu.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-navbar',
  imports: [
    AccountIconComponent,
    MaterialModules,
    OptionsMenuComponent,
    RouterLink,
    SearchBarComponent,
    ThemeToggleComponent,
    TranslatePipe,
],
  templateUrl: './navbar.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavbarComponent { }
