import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Account } from '../../../interfaces/account/Account';

@Component({
  selector: 'app-profile-picture',
  imports: [],
  templateUrl: './profile-picture.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePictureComponent {

  @Input() account?: Account;

  private readonly defaultProfilePicture = '/images/default-profile-picture-male.png';

  get ProfilePicture(): string {
    if (this.account?.profilePicture) {
      return this.account?.profilePicture;
    }

    const gender = this.account?.gender?.genderValue;

    return gender === 'female'
      ? this.defaultProfilePicture.replace("male", `${gender}`)
      : this.defaultProfilePicture;
  }

}
