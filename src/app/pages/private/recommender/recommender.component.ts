import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';
import {
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { HikingTrailCardComponent } from '../../../components/hiking-trail-card/hiking-trail-card.component';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MetricsScoreSlider } from '../../../components/metrics-score-slider/metrics-score-slider';
import { Filter } from '../../../interfaces/common/Filter';
import { Pagination } from '../../../interfaces/common/Pagination';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { Recommender } from '../../../interfaces/hiking-trail/Recommender';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { HikingTrailService } from '../../../services/hiking-trail.service';
import { UpButtonComponent } from '../../shared/up-button/up-button.component';

@Component({
  selector: 'app-recommender',
  imports: [
    HikingTrailCardComponent,
    LoadingSpinnerComponent,
    MaterialModules,
    MetricsScoreSlider,
    TranslatePipe,
    UpButtonComponent,
  ],
  templateUrl: './recommender.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommenderComponent implements AfterViewInit, OnDestroy {

  isLoading = signal<boolean>(false);
  canLoadHikingTrails = signal<boolean>(false);

  // lazy load hiking trails
  error = signal<string | null>(null);
  hikingTrails = signal<HikingTrail[]>([]);
  page = signal<number>(1);
  pageSize = 10;
  totalPages = signal<number | null>(null);

  private observer?: IntersectionObserver;

  @ViewChild('sentinela', { static: false }) sentinela!: ElementRef<HTMLDivElement>;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private hikingTrailService: HikingTrailService
  ) { }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting)
        this.loadNextPage();
    }, {
      root: null,
      rootMargin: '0px 0px 200px 0px',
      threshold: 0
    });

    this.observer.observe(this.sentinela.nativeElement);

    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadNextPage(): void {
    if (this.isLoading() || this.isLastPage() || !this.canLoadHikingTrails())
      return;

    this.isLoading.set(true);
    this.error.set(null);

    const recommenderDto: Recommender = {
      accountCode: this.authService.getUserCode(),
      kilometers: 5,
      locationLatitude: 48.856600,
      locationLongitude: 2.352200
    }

    const filter: Filter = {
      pageNumber: this.page(),
      pageSize: this.pageSize,
      sortField: "StartTime",
      sortDirection: "desc"
    };

    this.hikingTrailService
      .getRecommendedPaged(recommenderDto, filter)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((pageData: Pagination<HikingTrail>) => {
          const content = pageData.content ?? [];
          if (content.length === 0) {
            return of({ ...pageData, content: [] as HikingTrail[] });
          }

          const observables = content.map(trail =>
            this.accountService.getByCode(trail.accountCode).pipe(
              map(account => ({ ...trail, account }))
            )
          );

          return forkJoin(observables).pipe(
            map(contentWithAccounts => ({ ...pageData, content: contentWithAccounts }))
          );
        }),
        tap(pageData => {
          this.hikingTrails.update(prev => [...prev, ...pageData.content]);
          this.totalPages.set(pageData.totalPages);
          this.page.update(p => ++p);
        }),
        catchError(err => {
          this.error.set('Error loading hiking trails');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  isLastPage(): boolean {
    if (!this.totalPages())
      return false;

    return this.page() > this.totalPages()!;
  }

}
