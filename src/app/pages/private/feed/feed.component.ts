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
import { takeUntilDestroyed, } from '@angular/core/rxjs-interop';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';

import { HikingTrailCardComponent } from '../../../components/hiking-trail-card/hiking-trail-card.component';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Account } from '../../../interfaces/account/Account';
import { Filter } from '../../../interfaces/common/Filter';
import { Pagination } from '../../../interfaces/common/Pagination';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { AccountFollowService } from '../../../services/account-follow.service';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { HikingTrailService } from '../../../services/hiking-trail.service';
import { UpButtonComponent } from '../../shared/up-button/up-button.component';

@Component({
  selector: 'app-feed',
  imports: [
    HikingTrailCardComponent,
    LoadingSpinnerComponent,
    MaterialModules,
    TranslatePipe,
    UpButtonComponent,
  ],
  templateUrl: './feed.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {

  accountLoggedCode: string | null = null;
  error = signal<string | null>(null);
  followedAccounts = signal<Account[]>([]);
  hikingTrails = signal<HikingTrail[]>([]);
  loading = signal<boolean>(false);
  page = signal<number>(1);
  pageSize = 10;
  totalPages = signal<number | null>(null);

  private observer?: IntersectionObserver;

  @ViewChild('sentinela', { static: true }) sentinela!: ElementRef<HTMLDivElement>;

  constructor(
    private accountFollowService: AccountFollowService,
    private accountService: AccountService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private hikingTrailService: HikingTrailService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
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

  loadNextPage(): void {
    if (this.loading() || this.isLastPage())
      return;

    this.accountLoggedCode = this.authService.getUserCode();

    if (!this.accountLoggedCode)
      return;

    this.loading.set(true);
    this.error.set(null);
    const filter: Filter = {
      pageNumber: this.page(),
      pageSize: this.pageSize,
      sortField: "StartTime",
      sortDirection: "desc"
    };

    this.accountFollowService
      .getAllFollowedByAccountCode(this.accountLoggedCode)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((followed: Account[]) => {
          return this.accountService.getLogged().pipe(
            map(logged => [...followed, logged])
          );
        }),
        tap((followed: Account[]) => {
          this.followedAccounts.set(followed);
        }),
        switchMap((followed: Account[]) => {
          const accountCodes: string[] = Array.from(new Set(followed.map(f => f.code)));

          if (accountCodes.length === 0) {
            const res: Pagination<HikingTrail> = {
              content: [],
              pageNumber: filter.pageNumber ?? 1,
              pageSize: filter.pageSize ?? this.pageSize,
              totalCount: 0,
              totalPages: 0
            }

            return of(res);
          }

          return this.hikingTrailService.getByAccountCodesPaged(accountCodes, filter);
        }),
        tap((pageData: Pagination<HikingTrail>) => {
          pageData.content = pageData.content.map(trail => {
            trail.account = this.followedAccounts().find(f => f.code === trail.accountCode);
            return trail;
          });

          this.hikingTrails.update(prev => [...prev, ...pageData.content]);
          this.totalPages.set(pageData.totalPages);
          this.page.update(p => ++p);
        }),
        catchError(err => {
          this.error.set(this.translate.instant('feed.error'));
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  isLastPage(): boolean {
    if (!this.totalPages())
      return false;

    return this.page() > this.totalPages()!;
  }

}
