import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  catchError,
  concat,
  concatMap,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { GraphicsComponent } from '../../../components/graphics/graphics.component';
import { HikingTrailCardComponent } from '../../../components/hiking-trail-card/hiking-trail-card.component';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { PageNotFoundComponent } from '../../../components/page-not-found/page-not-found.component';
import { TrailMapComponent } from '../../../components/trail-map/trail-map.component';
import { Account } from '../../../interfaces/account/Account';
import { Coordinates } from '../../../interfaces/fit-data/Coordinates';
import { FileId } from '../../../interfaces/fit-data/FileId';
import { GraphicsData } from '../../../interfaces/fit-data/GraphicsData';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { FitDataService } from '../../../services/fit-data.service';
import { HikingTrailService } from '../../../services/hiking-trail.service';

@Component({
  selector: 'app-hiking-trail-detail',
  imports: [
    HikingTrailCardComponent,
    GraphicsComponent,
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
  graphicsData = signal<GraphicsData[]>([]);
  loadingView = signal<boolean>(true);
  loadingGraphicsData = signal<boolean>(true);

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private fitDataService: FitDataService,
    private hikingTrailService: HikingTrailService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.accountLoggedCode = this.authService.getUserCode();

    this.route.params
      .pipe(
        map(p => p['code'] as string),
        distinctUntilChanged(),
        tap(() => {
          this.loadingView.set(true);
          this.loadingGraphicsData.set(true);
        }),
        switchMap(code => concat(
          this.hikingDetail$(code),
          this.graphicsData$(code)
        )),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
  }

  private hikingDetail$(hikingTrailCode: string) {
    return this.hikingTrailService
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
        concatMap((ht: HikingTrail) =>
          ht.generatedByFitFile
            ? this.fitDataService
              .getFileId(hikingTrailCode)
              .pipe(
                tap((fl: FileId) => ht.productName = fl.productName),
                map(() => ht),
              )
            : of(ht)
        ),
        tap((ht: HikingTrail) => this.hikingTrail.set(ht)),
        switchMap(() => this.fitDataService.getCoordinates(hikingTrailCode)),
        tap((coordinates: Coordinates[]) => this.coordinates.set(coordinates)),
        finalize(() => this.loadingView.set(false))
      );
  }

  private graphicsData$(hikingTrailCode: string) {
    return this.fitDataService
      .getGraphicsData(hikingTrailCode)
      .pipe(
        tap((graphicsData: GraphicsData[]) => this.graphicsData.set(graphicsData)),
        finalize(() => this.loadingGraphicsData.set(false))
      );
  }

  getCenterPosition(): Coordinates {
    const lat = this.hikingTrail()?.ubicationLatitude ?? 40.4168;
    const long = this.hikingTrail()?.ubicationLongitude ?? -3.7038;

    return { positionLat: lat, positionLong: long };
  }

}

