import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Account } from '../../../interfaces/account/Account';
import { getDefaultProfileImageUrl } from '../../../Utils/Utils';

@Component({
  selector: 'app-profile-picture',
  imports: [],
  templateUrl: './profile-picture.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePictureComponent {

  @Input() account?: Account;

  get ProfilePicture(): string {
    if (this.account?.profilePicture) {
      return this.account?.profilePicture;
    }

    const gender = this.account?.gender?.genderValue;

    return getDefaultProfileImageUrl(gender);
  }

}
