import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { PageNotFoundComponent } from '../../../components/page-not-found/page-not-found.component';
import { TrailMapComponent } from '../../../components/trail-map/trail-map.component';
import { Coordinates } from '../../../interfaces/fit-data/Coordinates';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { FitDataService } from '../../../services/fit-data.service';
import { HikingTrailService } from '../../../services/hiking-trail.service';

@Component({
  selector: 'app-hiking-trail-detail',
  imports: [
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
  coordinates = signal<Coordinates[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private fitDataService: FitDataService,
    private hikingTrailService: HikingTrailService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const hikingTrailCode = params['code'];

      this.hikingTrailService
        .getByCode(hikingTrailCode)
        .subscribe({
          next: ht => {
            this.hikingTrail.set(ht);

            this.fitDataService.getCoordinates(hikingTrailCode).subscribe({
              next: coordinates => {
                this.coordinates.set(coordinates);
                this.loading.set(false);
              },
              error: err => this.loading.set(false)
            });
          },
          error: err => this.loading.set(false)
        });
    });
  }

  getCenterPosition(): Coordinates {
    const lat = this.hikingTrail()?.ubicationLatitude ?? 40.4168;
    const long = this.hikingTrail()?.ubicationLongitude ?? -3.7038;

    return { positionLat: lat, positionLong: long };
  }

}

