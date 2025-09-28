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
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';
import { OptionsMenuComponent } from "./options-menu/options-menu.component";

@Component({
  selector: 'app-account-icon',
  imports: [
    MaterialModules,
    OptionsMenuComponent,
    ProfilePictureComponent,
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

  constructor(
    private readonly accountService: AccountService
  ) {
    this.account = toSignal(this.accountService.getLogged());
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
