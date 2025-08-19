import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { AccountFollowService } from '../../../services/account-follow.service';
import { AuthService } from '../../../services/auth.service';
import { Filter } from '../../../interfaces/common/Filter';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../../services/hiking-trail.service';
import { Pagination } from '../../../interfaces/common/Pagination';

@Component({
  selector: 'app-feed',
  imports: [
    MaterialModules,
  ],
  templateUrl: './feed.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {

  hikingTrails!: Signal<Pagination<HikingTrail> | undefined>;

  constructor(
    private accountFollowService: AccountFollowService,
    private authService: AuthService,
    private hikingTrailService: HikingTrailService,
  ) {
    const accountCode: string | null = this.authService.getUserCode();

    if (!accountCode)
      return;

    const filter: Filter = {
      pageNumber: 1,
      pageSize: 10,
      sortField: "StartTime",
      sortDirection: "asc"
    };

    this.hikingTrails = toSignal(this.getHikingTrails(accountCode, filter));
  }

  private getHikingTrails(
    accountCode: string,
    filter: Filter
  ): Observable<Pagination<HikingTrail> | undefined> {
    return this.accountFollowService
      .getAllFollowedByAccountCode(accountCode)
      .pipe(
        map(followed => followed.map(f => f.code)),
        switchMap(codes => codes.length > 0
          ? this.hikingTrailService.getByAccountCodesPaged(codes, filter)
          : of(undefined)),
        catchError(err => {
          console.log(err);
          return of(undefined);
        })
      );
  }

}
