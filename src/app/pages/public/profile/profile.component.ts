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
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModules } from '@material/material.modules';
import {
  catchError,
  finalize,
  forkJoin,
  of,
  switchMap,
  tap
} from 'rxjs';

import { Account } from '../../../interfaces/account/Account';
import { AccountFollowService } from '../../../services/account-follow.service';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { Filter } from '../../../interfaces/common/Filter';
import { getDefaultProfileImageUrl } from '../../../Utils/Utils';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailCardComponent } from '../../../components/hiking-trail-card/hiking-trail-card.component';
import { HikingTrailService } from '../../../services/hiking-trail.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Pagination } from '../../../interfaces/common/Pagination';
import { UpButtonComponent } from '../../shared/up-button/up-button.component';

@Component({
  selector: 'app-profile',
  imports: [
    LoadingSpinnerComponent,
    TranslatePipe,
    MaterialModules,
    HikingTrailCardComponent,
    UpButtonComponent
],
  templateUrl: './profile.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  account = signal<Account | null>(null);
  accountLoggedCode = signal<string | null>(null);
  followedCount = signal<number>(0);
  followersCount = signal<number>(0);
  isLoading = signal<boolean>(true);

  // lazy load hiking trails
  error = signal<string | null>(null);
  hikingTrails = signal<HikingTrail[]>([]);
  isLoadingHikingTrails = signal<boolean>(false);
  page = signal<number>(1);
  pageSize = 10;
  totalPages = signal<number | null>(null);

  private observer?: IntersectionObserver;

  @ViewChild('sentinela', { static: false }) sentinela!: ElementRef<HTMLDivElement>;

  constructor(
    private accountFollowService: AccountFollowService,
    private accountService: AccountService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private hikingTrailService: HikingTrailService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.accountLoggedCode.set(this.authService.getUserCode());

    this.route.paramMap
      .subscribe({
        next: params => {
          this.isLoading.set(true);
          const code = params.get('code');

          if (!code) {
            this.router.navigate(['/feed']);
            return;
          }

          this.accountService.getByCode(code)
            .pipe(
              tap(account => {
                if (!account) {
                  this.router.navigate(['/feed']);
                  return;
                }

                this.account.set(account);
              }),
              catchError(err => {
                console.error(err);
                this.router.navigate(['/feed']);
                return [];
              }),
              switchMap((account: Account) => {
                this.loadNextPage(account);

                return forkJoin({
                    followedCount: this.accountFollowService.getFollowedCountByAccountCode(account.code),
                    followersCount: this.accountFollowService.getFollowersCountByAccountCode(account.code),
                  }).pipe(
                    catchError(err => {
                      console.error('search error', err);
                      return of({ followedCount: 0, followersCount: 0, hikingTrails: [] });
                    })
                  );
                }),
                tap(({ followedCount, followersCount }) => {
                  this.followedCount.set(followedCount);
                  this.followersCount.set(followersCount);
                }),
              finalize(() => this.isLoading.set(false)),
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();

        },
        error: err => {
          console.error(err);
          this.router.navigate(['/feed']);
        }
      });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const sentinela = this.sentinela?.nativeElement;

      if (!sentinela)
        return;

      this.observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting)
          this.loadNextPage(this.account()!);
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


  getDefaultProfileImageUrl(gender?: string): string {
    return getDefaultProfileImageUrl(gender);
  }

  canSeeFollowButton(): boolean {
    if (this.isUserLogged()) {
      return false;
    }

    // TODO: implementar llamada api para ver si el usuario logueado sigue a la cuenta que se está viendo
    return true;
  }

  canSeeUnfollowButton(): boolean {
    if (this.isUserLogged()) {
      return false;
    }

    // TODO: implementar llamada api para ver si el usuario logueado sigue a la cuenta que se está viendo
    return true;
  }

  loadNextPage(account: Account): void {
    if (this.isLoadingHikingTrails() || this.isLastPage())
      return;

    this.isLoadingHikingTrails.set(true);
    this.error.set(null);
    const filter: Filter = {
      pageNumber: this.page(),
      pageSize: this.pageSize,
      sortField: "StartTime",
      sortDirection: "desc"
    };

    this.hikingTrailService
      .getByAccountCodesPaged([account.code], filter)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((pageData: Pagination<HikingTrail>) => {
          pageData.content = pageData.content.map(trail => {
            if (this.account()) {
              trail.account = this.account()!;
            }
            return trail;
          });

          this.hikingTrails.update(prev => [...prev, ...pageData.content]);
          this.totalPages.set(pageData.totalPages);
          this.page.update(p => ++p);
        }),
        catchError(err => {
          this.error.set('Error loading hiking trails');
          return of(null);
        }),
        finalize(() => this.isLoadingHikingTrails.set(false))
      )
      .subscribe();
  }

   isLastPage(): boolean {
    if (!this.totalPages())
      return false;

    return this.page() > this.totalPages()!;
  }

  private isUserLogged(): boolean {
    return !!this.accountLoggedCode() && this.accountLoggedCode() === this.account()?.code;
  }

}
