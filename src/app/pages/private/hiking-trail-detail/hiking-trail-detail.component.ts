import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';

import { HikingTrailCardComponent } from '../../../components/hiking-trail-card/hiking-trail-card.component';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { PageNotFoundComponent } from '../../../components/page-not-found/page-not-found.component';
import { TrailMapComponent } from '../../../components/trail-map/trail-map.component';
import { Account } from '../../../interfaces/account/Account';
import { Coordinates } from '../../../interfaces/fit-data/Coordinates';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { FitDataService } from '../../../services/fit-data.service';
import { HikingTrailService } from '../../../services/hiking-trail.service';

@Component({
  selector: 'app-hiking-trail-detail',
  imports: [
    HikingTrailCardComponent,
    LoadingSpinnerComponent,
    PageNotFoundComponent,
    TrailMapComponent,
    TranslatePipe,
],
  templateUrl: './hiking-trail-detail.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HikingTrailDetailComponent implements OnInit {

  hikingTrail = signal<HikingTrail | null>(null);
  accountLoggedCode: string | null = null;
  coordinates = signal<Coordinates[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private fitDataService: FitDataService,
    private hikingTrailService: HikingTrailService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const hikingTrailCode = params['code'];

      this.hikingTrailService
        .getByCode(hikingTrailCode)
        .pipe(
          switchMap((ht: HikingTrail) =>
            this.accountService
              .getByCode(ht.accountCode)
              .pipe(
                map((ac: Account) => ({ ...ht, account: ac } as HikingTrail)),
                catchError(() => of(ht))
              )
          ),
          tap((ht: HikingTrail) => this.hikingTrail.set(ht)),
          switchMap(() => this.fitDataService.getCoordinates(hikingTrailCode)),
          tap((coordinates: Coordinates[]) => this.coordinates.set(coordinates)),
          finalize(() => this.loading.set(false))
        )
        .subscribe();
    });

    this.accountLoggedCode = this.authService.getUserCode();
  }

  getCenterPosition(): Coordinates {
    const lat = this.hikingTrail()?.ubicationLatitude ?? 40.4168;
    const long = this.hikingTrail()?.ubicationLongitude ?? -3.7038;

    return { positionLat: lat, positionLong: long };
  }

}

