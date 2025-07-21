import { ChangeDetectionStrategy, Component } from '@angular/core';

import { UserService } from '../../../services/user.service';
import { MaterialModules } from '@material/material.modules';

@Component({
  selector: 'app-feed',
  imports: [
    MaterialModules
  ],
  templateUrl: './feed.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {

  constructor(
    private userService: UserService,
  ) {}

  onButtonClick(): void {
    this.userService.getUsers().subscribe(users => {
      console.log(users);
    });
  }
}
