import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  Subject,
  switchMap,
  tap
} from 'rxjs';

import { Account } from '../../../interfaces/account/Account';
import { AccountService } from '../../../services/account.service';
import { HikingTrail } from '../../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../../services/hiking-trail.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  imports: [
    TranslatePipe,
    RouterModule
  ],
  templateUrl: './search-bar.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit {

  accountsFound = signal<Account[]>([]);
  hikingTrailsFound = signal<HikingTrail[]>([]);
  isLoading = signal(false);
  searcher$ = new Subject<string>();

  private numberResults: number = 5;

  constructor(
    private accountService: AccountService,
    private hikingTrailService: HikingTrailService
  ) { }

  ngOnInit(): void {
    this.searcher$
      .pipe(
        debounceTime(110),
        map((query: string) => query.trim()),
        map((query: string) => query.toLowerCase()),
        distinctUntilChanged(),
        tap(() => this.isLoading.set(true)),
        switchMap((query: string) => {
          if (!query)
            return of({ accounts: [], hikingTrails: [] });

          return forkJoin({
            accounts: this.accountService.search(query, this.numberResults),
            hikingTrails: this.hikingTrailService.search(query, this.numberResults),
          }).pipe(
            catchError(err => {
              console.error('search error', err);
              return of({ accounts: [], hikingTrails: [] });
            })
          );
        }),
        tap(({ accounts, hikingTrails }) => {
          this.accountsFound.set(accounts);
          this.hikingTrailsFound.set(hikingTrails);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  search(query: string): void {
    this.searcher$.next(query);
  }

}
