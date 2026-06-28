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
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
import { AccountListDialogComponent } from '../../../components/account-list-dialog/account-list-dialog.component';
import { AccountService } from '../../../services/account.service';
import { AlertManagerService } from '../../../services/alert-manager.service';
import { AuthService } from '../../../services/auth.service';
import { CollectionsPanelComponent } from '../../../components/collections-panel/collections-panel.component';
import { DialogConfirmComponent } from '../../../components/dialog-confirm/dialog-confirm.component';
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
    CollectionsPanelComponent,
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
  isFollowing = signal<boolean>(false);
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
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private dialog: MatDialog,
    private hikingTrailService: HikingTrailService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
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

          this.resetHikingTrails();

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

                const checkFollowStatus = this.authService.isAuthenticated()
                  && this.accountLoggedCode() !== account.code;

                return forkJoin({
                    followedCount: this.accountFollowService.getFollowedCountByAccountCode(account.code),
                    followersCount: this.accountFollowService.getFollowersCountByAccountCode(account.code),
                    isFollowing: checkFollowStatus
                      ? this.accountFollowService.isFollowing(account.code)
                      : of(false),
                  }).pipe(
                    catchError(err => {
                      console.error('search error', err);
                      return of({ followedCount: 0, followersCount: 0, isFollowing: false });
                    })
                  );
                }),
                tap(({ followedCount, followersCount, isFollowing }) => {
                  this.followedCount.set(followedCount);
                  this.followersCount.set(followersCount);
                  this.isFollowing.set(isFollowing);
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

  openFollowers(): void {
    this.openAccountList('followers');
  }

  openFollowed(): void {
    this.openAccountList('followed');
  }

  private openAccountList(type: 'followers' | 'followed'): void {
    const account = this.account();

    if (!account) {
      return;
    }

    this.dialog.open(AccountListDialogComponent, {
      data: { accountCode: account.code, type },
      width: '420px',
      maxHeight: '80vh'
    });
  }

  canSeeFollowButton(): boolean {
    if (this.isOwnProfile() || this.isGuestUser()) {
      return false;
    }

    return !this.isFollowing();
  }

  canSeeUnfollowButton(): boolean {
    if (this.isOwnProfile() || this.isGuestUser()) {
      return false;
    }

    return this.isFollowing();
  }

  follow(): void {
    const account = this.account();

    if (!account) {
      return;
    }

    this.accountFollowService
      .follow(account.code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isFollowing.set(true);
          this.followersCount.update(count => count + 1);
        },
        error: error => this.alertManagerService.manageError(error)
      });
  }

  unfollow(): void {
    const account = this.account();

    if (!account) {
      return;
    }

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('profile.unfollow-confirm-title'),
        message: this.translateService.instant('profile.unfollow-confirm-message', { username: account.username }),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.accountFollowService
        .unfollow(account.code)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isFollowing.set(false);
            this.followersCount.update(count => Math.max(0, count - 1));
          },
          error: error => this.alertManagerService.manageError(error)
        });
    });
  }

  resetHikingTrails(): void {
    this.hikingTrails.set([]);
    this.page.set(1);
    this.totalPages.set(null);
    this.error.set(null);
    this.isLoadingHikingTrails.set(false);
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
          if (this.account()?.code !== account.code) {
            return;
          }

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

  isOwnProfile(): boolean {
    return !!this.accountLoggedCode() && this.accountLoggedCode() === this.account()?.code;
  }

  isGuestUser() {
    return !this.authService.isAuthenticated();
  }

}
