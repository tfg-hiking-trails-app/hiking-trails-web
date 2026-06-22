import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { AccountService } from '../../../services/account.service';
import { AlertManagerService } from '../../../services/alert-manager.service';
import { AuthService } from '../../../services/auth.service';
import { Collection } from '../../../interfaces/hiking-trail/Collection';
import { CollectionService } from '../../../services/collection.service';
import { DialogConfirmComponent } from '../../../components/dialog-confirm/dialog-confirm.component';
import { Filter } from '../../../interfaces/common/Filter';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailCardComponent } from '../../../components/hiking-trail-card/hiking-trail-card.component';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Pagination } from '../../../interfaces/common/Pagination';
import { UpButtonComponent } from '../../shared/up-button/up-button.component';

@Component({
  selector: 'app-collection-detail',
  imports: [
    HikingTrailCardComponent,
    LoadingSpinnerComponent,
    MaterialModules,
    TranslatePipe,
    UpButtonComponent
  ],
  templateUrl: './collection-detail.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  accountLoggedCode = signal<string | null>(null);
  collection = signal<Collection | null>(null);
  isLoading = signal<boolean>(true);

  error = signal<string | null>(null);
  hikingTrails = signal<HikingTrail[]>([]);
  isLoadingHikingTrails = signal<boolean>(false);
  page = signal<number>(1);
  pageSize = 10;
  totalPages = signal<number | null>(null);

  private collectionCode!: string;
  private observer?: IntersectionObserver;

  @ViewChild('sentinela', { static: false }) sentinela!: ElementRef<HTMLDivElement>;

  constructor(
    private accountService: AccountService,
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private collectionService: CollectionService,
    private destroyRef: DestroyRef,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.accountLoggedCode.set(this.authService.getUserCode());

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const code = params.get('code');

        if (!code) {
          this.router.navigate(['/feed']);
          return;
        }

        this.collectionCode = code;
        this.isLoading.set(true);
        this.hikingTrails.set([]);
        this.page.set(1);
        this.totalPages.set(null);

        this.collectionService.getByCode(code)
          .pipe(
            tap((collection: Collection) => this.collection.set(collection)),
            catchError(err => {
              console.error(err);
              this.router.navigate(['/feed']);
              return of(null);
            }),
            finalize(() => this.isLoading.set(false)),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((collection) => {
            if (collection) {
              this.loadNextPage();
            }
          });
      });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const sentinela = this.sentinela?.nativeElement;

      if (!sentinela) {
        return;
      }

      this.observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.loadNextPage();
        }
      }, {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0
      });

      this.observer.observe(sentinela);
    });

    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadNextPage(): void {
    if (this.isLoadingHikingTrails() || this.isLastPage() || !this.collectionCode) {
      return;
    }

    this.isLoadingHikingTrails.set(true);
    this.error.set(null);

    const filter: Filter = {
      pageNumber: this.page(),
      pageSize: this.pageSize,
      sortField: 'StartTime',
      sortDirection: 'desc'
    };

    this.collectionService.getTrailsPaged(this.collectionCode, filter)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((pageData: Pagination<HikingTrail>) => {
          const content = pageData.content ?? [];

          if (content.length === 0) {
            return of({ ...pageData, content: [] as HikingTrail[] });
          }

          const observables = content.map(trail =>
            this.accountService.getByCode(trail.accountCode).pipe(
              map(account => ({ ...trail, account })),
              catchError(() => of(trail))
            )
          );

          return forkJoin(observables).pipe(
            map(contentWithAccounts => ({ ...pageData, content: contentWithAccounts }))
          );
        }),
        tap((pageData: Pagination<HikingTrail>) => {
          this.hikingTrails.update(prev => [...prev, ...pageData.content]);
          this.totalPages.set(pageData.totalPages);
          this.page.update(p => ++p);
        }),
        catchError(err => {
          this.error.set(this.translateService.instant('collections.error'));
          return of(null);
        }),
        finalize(() => this.isLoadingHikingTrails.set(false))
      )
      .subscribe();
  }

  removeTrail(trail: HikingTrail): void {
    const ref = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('collections.remove-trail-title'),
        message: this.translateService.instant('collections.remove-trail-message'),
        focusCancel: true
      }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.collectionService.removeTrail(this.collectionCode, trail.code)
        .subscribe({
          next: () => {
            this.hikingTrails.update(prev => prev.filter(t => t.code !== trail.code));
            this.collection.update(c => c ? { ...c, trailCount: Math.max(0, c.trailCount - 1) } : c);
            this.collectionService.markTrailUnsaved(trail.code);
            this.alertManagerService.alertSuccess(this.translateService.instant('collections.remove-trail-success'));
          },
          error: (error) => this.alertManagerService.manageError(error)
        });
    });
  }

  goBack(): void {
    this.router.navigate(['/profile', this.accountLoggedCode()]);
  }

  isLastPage(): boolean {
    if (!this.totalPages()) {
      return false;
    }

    return this.page() > this.totalPages()!;
  }

}
