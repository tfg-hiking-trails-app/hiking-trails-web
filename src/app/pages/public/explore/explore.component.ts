import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
import { DifficultyLevel } from '../../../interfaces/hiking-trail/DifficultyLevel';
import { DateRange, ExploreFilter, SortMode } from '../../../interfaces/hiking-trail/ExploreFilter';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { Pagination } from '../../../interfaces/common/Pagination';
import { TerrainType } from '../../../interfaces/hiking-trail/TerrainType';
import { TrailType } from '../../../interfaces/hiking-trail/TrailType';
import { AccountService } from '../../../services/account.service';
import { HikingTrailService } from '../../../services/hiking-trail.service';
import { UpButtonComponent } from '../../shared/up-button/up-button.component';

@Component({
  selector: 'app-explore',
  imports: [
    FormsModule,
    LoadingSpinnerComponent,
    TranslatePipe,
    MaterialModules,
    HikingTrailCardComponent,
    UpButtonComponent
  ],
  templateUrl: './explore.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoading = signal<boolean>(false);

  // lazy load hiking trails
  error = signal<string | null>(null);
  hikingTrails = signal<HikingTrail[]>([]);
  page = signal<number>(1);
  pageSize = 10;
  totalPages = signal<number | null>(null);

  sortMode = signal<SortMode>('newest');

  titleKey = computed<string>(() => {
    switch (this.sortMode()) {
      case 'most-prestigious': return 'explore.titles.most-voted';
      case 'longest': return 'explore.titles.longest';
      default: return 'explore.titles.newest';
    }
  });

  difficultyLevels: DifficultyLevel[] = [];
  terrainTypes: TerrainType[] = [];
  trailTypes: TrailType[] = [];

  readonly maxDistanceKmLimit = 50;
  readonly maxElevationGainLimit = 9000;
  readonly maxAltitudeLimit = 9000;

  filterPanelOpen = signal<boolean>(false);
  draftPetFriendly = false;
  draftDifficultyLevelCode = '';
  draftTerrainTypeCode = '';
  draftTrailTypeCode = '';
  draftMaxDistanceKm = this.maxDistanceKmLimit;
  draftMaxElevationGain = this.maxElevationGainLimit;
  draftMaxAltitude = this.maxAltitudeLimit;
  draftDateRange: DateRange = 'any';

  private appliedCriteria: Partial<ExploreFilter> = {};
  activeFilterCount = signal<number>(0);

  private observer?: IntersectionObserver;

  @ViewChild('sentinela', { static: false }) sentinela!: ElementRef<HTMLDivElement>;

  constructor(
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private hikingTrailService: HikingTrailService
  ) { }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadNextPage();
  }

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

  private loadCatalogs(): void {
    forkJoin({
      difficultyLevels: this.hikingTrailService.getAllDifficultyLevels()
        .pipe(catchError(() => of([] as DifficultyLevel[]))),
      terrainTypes: this.hikingTrailService.getAllTerrainTypes()
        .pipe(catchError(() => of([] as TerrainType[]))),
      trailTypes: this.hikingTrailService.getAllTrailTypes()
        .pipe(catchError(() => of([] as TrailType[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ difficultyLevels, terrainTypes, trailTypes }) => {
        this.difficultyLevels = difficultyLevels;
        this.terrainTypes = terrainTypes;
        this.trailTypes = trailTypes;
      });
  }

  loadNextPage(): void {
    if (this.isLoading() || this.isLastPage())
      return;

    this.isLoading.set(true);
    this.error.set(null);

    const request: ExploreFilter = {
      ...this.appliedCriteria,
      sortMode: this.sortMode(),
      filter: {
        pageNumber: this.page(),
        pageSize: this.pageSize
      }
    };

    this.hikingTrailService
      .getExplorePaged(request)
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

  setSortMode(mode: SortMode): void {
    if (this.sortMode() === mode)
      return;

    this.sortMode.set(mode);
    this.reload();
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update(open => !open);
  }

  closeFilterPanel(): void {
    this.filterPanelOpen.set(false);
  }

  applyFilters(): void {
    const maxDistance = this.draftMaxDistanceKm < this.maxDistanceKmLimit
      ? this.draftMaxDistanceKm * 1000
      : undefined;

    const maxElevationGain = this.draftMaxElevationGain < this.maxElevationGainLimit
      ? this.draftMaxElevationGain
      : undefined;

    const maxAltitude = this.draftMaxAltitude < this.maxAltitudeLimit
      ? this.draftMaxAltitude
      : undefined;

    const dateRange = this.draftDateRange !== 'any' ? this.draftDateRange : undefined;

    this.appliedCriteria = {
      petFriendly: this.draftPetFriendly ? true : undefined,
      difficultyLevelCode: this.draftDifficultyLevelCode || undefined,
      terrainTypeCode: this.draftTerrainTypeCode || undefined,
      trailTypeCode: this.draftTrailTypeCode || undefined,
      maxDistance,
      maxElevationGain,
      maxAltitude,
      dateRange,
    };

    this.activeFilterCount.set(
      (this.draftPetFriendly ? 1 : 0) +
      (this.draftDifficultyLevelCode ? 1 : 0) +
      (this.draftTerrainTypeCode ? 1 : 0) +
      (this.draftTrailTypeCode ? 1 : 0) +
      (maxDistance !== undefined ? 1 : 0) +
      (maxElevationGain !== undefined ? 1 : 0) +
      (maxAltitude !== undefined ? 1 : 0) +
      (dateRange !== undefined ? 1 : 0)
    );

    this.closeFilterPanel();
    this.reload();
  }

  clearFilters(): void {
    this.draftPetFriendly = false;
    this.draftDifficultyLevelCode = '';
    this.draftTerrainTypeCode = '';
    this.draftTrailTypeCode = '';
    this.draftMaxDistanceKm = this.maxDistanceKmLimit;
    this.draftMaxElevationGain = this.maxElevationGainLimit;
    this.draftMaxAltitude = this.maxAltitudeLimit;
    this.draftDateRange = 'any';
    this.appliedCriteria = {};
    this.activeFilterCount.set(0);

    this.closeFilterPanel();
    this.reload();
  }

  private reload(): void {
    this.hikingTrails.set([]);
    this.page.set(1);
    this.totalPages.set(null);
    this.loadNextPage();
  }

}
