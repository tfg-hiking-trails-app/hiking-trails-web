import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  signal
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { Observable } from 'rxjs';

import { Account } from '../../interfaces/account/Account';
import { AccountFollowService } from '../../services/account-follow.service';
import { AccountService } from '../../services/account.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ProfilePictureComponent } from '../../pages/shared/profile-picture/profile-picture.component';

export type AccountListType = 'followers' | 'followed' | 'prestiges';

export interface AccountListData {
  type: AccountListType;
  accountCode?: string;
  accountCodes?: string[];
}

@Component({
  selector: 'app-account-list-dialog',
  imports: [
    MaterialModules,
    TranslatePipe,
    RouterModule,
    LoadingSpinnerComponent,
    ProfilePictureComponent
  ],
  templateUrl: './account-list-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountListDialogComponent implements OnInit {

  accounts = signal<Account[]>([]);
  loading = signal<boolean>(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AccountListData,
    public dialogRef: MatDialogRef<AccountListDialogComponent>,
    private accountFollowService: AccountFollowService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.resolveRequest().subscribe({
      next: (accounts: Account[]) => {
        this.accounts.set(accounts);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('account list error', error);
        this.accounts.set([]);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private resolveRequest(): Observable<Account[]> {
    switch (this.data.type) {
      case 'followers':
        return this.accountFollowService.getAllFollowersByAccountCode(this.data.accountCode!);
      case 'followed':
        return this.accountFollowService.getAllFollowedByAccountCode(this.data.accountCode!);
      case 'prestiges':
        return this.accountService.getByCodes(this.data.accountCodes ?? []);
    }
  }

  get titleKey(): string {
    switch (this.data.type) {
      case 'followers':
        return 'profile.followers';
      case 'followed':
        return 'profile.followed';
      case 'prestiges':
        return 'hiking-trail-card.prestiges-title';
    }
  }

  get emptyKey(): string {
    switch (this.data.type) {
      case 'followers':
        return 'profile.no-followers';
      case 'followed':
        return 'profile.no-followed';
      case 'prestiges':
        return 'hiking-trail-card.no-prestiges';
    }
  }

}
