import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MaterialModules } from '@material/material.modules';

import { AccountService } from '../../../services/account.service';
import { Account } from '../../../interfaces/account/Account';
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

  @ViewChild('profileMenu', { static: true }) menuRef!: ElementRef;
  profileOpen = false;

  private readonly defaultProfilePicture = '/images/default-profile-picture.png';
  private accountService: AccountService = inject(AccountService);

  readonly account: Signal<Account | undefined> = toSignal(this.accountService.getLogged());

  get ProfilePicture() {
    if (this.account()?.profilePicture) {
      return this.account()?.profilePicture;
    }

    if (this.account()?.gender?.genderValue && this.account()?.gender?.genderValue !== 'non-binary') {
      return this.defaultProfilePicture.replace(/\.png$/, `-${this.account()?.gender?.genderValue}.png`);
    }

    return this.defaultProfilePicture;
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  closeProfile() {
    this.profileOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    if (!this.menuRef.nativeElement.contains(event.target)) this.profileOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.profileOpen = false;
  }

}
