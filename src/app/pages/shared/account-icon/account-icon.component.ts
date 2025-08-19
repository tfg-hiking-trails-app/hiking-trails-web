import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  Signal,
  ViewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MaterialModules } from '@material/material.modules';

import { Account } from '../../../interfaces/account/Account';
import { AccountService } from '../../../services/account.service';
import { OptionsMenuComponent } from "./options-menu/options-menu.component";

@Component({
  selector: 'app-account-icon',
  imports: [
    MaterialModules,
    OptionsMenuComponent
],
  templateUrl: './account-icon.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountIconComponent {

  @Input({ required: false }) mobileView = false;
  @ViewChild('profileMenu', { static: true }) menuRef!: ElementRef;

  readonly account: Signal<Account | undefined>;
  profileOpen = false;
  private readonly defaultProfilePicture = '/images/default-profile-picture-male.png';

  constructor(
    private readonly accountService: AccountService
  ) {
    this.account = toSignal(this.accountService.getLogged());
  }

  get ProfilePicture(): string {
    const account = this.account();

    if (account?.profilePicture) {
      return account.profilePicture;
    }

    const gender = account?.gender?.genderValue;

    return gender === 'female'
      ? this.defaultProfilePicture.replace(/\.png$/, `-${gender}.png`)
      : this.defaultProfilePicture;
  }

  toggleProfile(): void {
    if (this.mobileView) {
      this.profileOpen = false;
      return;
    }

    this.profileOpen = !this.profileOpen;
  }

  closeProfile(): void {
    this.profileOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.menuRef.nativeElement.contains(event.target))
      this.profileOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.profileOpen = false;
  }

}
