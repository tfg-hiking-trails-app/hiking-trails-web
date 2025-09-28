import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { AccountIconComponent } from '../../shared/account-icon/account-icon.component';
import { AddActivityMenuComponent } from '../../../components/add-activity-menu/add-activity-menu.component';
import { OptionsMenuComponent } from '../../shared/account-icon/options-menu/options-menu.component';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-private-navbar',
  imports: [
    AccountIconComponent,
    AddActivityMenuComponent,
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
