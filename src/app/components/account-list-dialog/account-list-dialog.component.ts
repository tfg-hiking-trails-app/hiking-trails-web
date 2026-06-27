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

import { Account } from '../../interfaces/account/Account';
import { AccountFollowService } from '../../services/account-follow.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ProfilePictureComponent } from '../../pages/shared/profile-picture/profile-picture.component';

export type AccountListType = 'followers' | 'followed';

export interface AccountListData {
  accountCode: string;
  type: AccountListType;
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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const request$ = this.data.type === 'followers'
      ? this.accountFollowService.getAllFollowersByAccountCode(this.data.accountCode)
      : this.accountFollowService.getAllFollowedByAccountCode(this.data.accountCode);

    request$.subscribe({
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

  get titleKey(): string {
    return this.data.type === 'followers' ? 'profile.followers' : 'profile.followed';
  }

  get emptyKey(): string {
    return this.data.type === 'followers' ? 'profile.no-followers' : 'profile.no-followed';
  }

}
