import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { PageNotFoundComponent } from '../../../components/page-not-found/page-not-found.component';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../../services/hiking-trail.service';

@Component({
  selector: 'app-hiking-trail-detail',
  imports: [
    LoadingSpinnerComponent,
    PageNotFoundComponent,
    TranslatePipe,
],
  templateUrl: './hiking-trail-detail.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HikingTrailDetailComponent implements OnInit {

  hikingTrail = signal<HikingTrail | null>(null);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private hikingTrailService: HikingTrailService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const hikingTrailCode = params['code'];

      this.hikingTrailService
        .getByCode(hikingTrailCode)
        .subscribe({
          next: ht => {
            this.hikingTrail.set(ht);
            this.loading.set(false);
          },
          error: err => this.loading.set(false)
        });
    });
  }

}

