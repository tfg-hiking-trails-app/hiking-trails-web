import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MaterialModules } from '@material/material.modules';

import { AccountService } from '../../../services/account.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-account-icon',
  imports: [
    MaterialModules,
    JsonPipe
  ],
  templateUrl: './account-icon.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountIconComponent {

  private accountService: AccountService = inject(AccountService);

  readonly account = toSignal(this.accountService.getLogged());

}
