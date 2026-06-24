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
import { ExploreFilter, SortMode } from '../../../interfaces/hiking-trail/ExploreFilter';
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

  // "Mostrar" (sort)
  sortMode = signal<SortMode>('newest');

  // page title changes with the selected sort option
  titleKey = computed<string>(() => {
    switch (this.sortMode()) {
      case 'most-prestigious': return 'explore.titles.most-voted';
      case 'longest': return 'explore.titles.longest';
      default: return 'explore.titles.newest';
    }
  });

  // "Filtro" (filter) catalogs
  difficultyLevels: DifficultyLevel[] = [];
  terrainTypes: TerrainType[] = [];
  trailTypes: TrailType[] = [];

  // "Filtro" panel open state + draft values bound in the panel
  filterPanelOpen = signal<boolean>(false);
  draftPetFriendly = false;
  draftDifficultyLevelCode = '';
  draftTerrainTypeCode = '';
  draftTrailTypeCode = '';

  // currently applied filter criteria + active count (for the badge)
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

  // "Mostrar" — change sort and reload from page 1
  setSortMode(mode: SortMode): void {
    if (this.sortMode() === mode)
      return;

    this.sortMode.set(mode);
    this.reload();
  }

  // "Filtro" — open/close the panel
  toggleFilterPanel(): void {
    this.filterPanelOpen.update(open => !open);
  }

  closeFilterPanel(): void {
    this.filterPanelOpen.set(false);
  }

  applyFilters(): void {
    this.appliedCriteria = {
      petFriendly: this.draftPetFriendly ? true : undefined,
      difficultyLevelCode: this.draftDifficultyLevelCode || undefined,
      terrainTypeCode: this.draftTerrainTypeCode || undefined,
      trailTypeCode: this.draftTrailTypeCode || undefined,
    };

    this.activeFilterCount.set(
      (this.draftPetFriendly ? 1 : 0) +
      (this.draftDifficultyLevelCode ? 1 : 0) +
      (this.draftTerrainTypeCode ? 1 : 0) +
      (this.draftTrailTypeCode ? 1 : 0)
    );

    this.closeFilterPanel();
    this.reload();
  }

  clearFilters(): void {
    this.draftPetFriendly = false;
    this.draftDifficultyLevelCode = '';
    this.draftTerrainTypeCode = '';
    this.draftTrailTypeCode = '';
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
