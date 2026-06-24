import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';

import { MetricsScore } from '../../interfaces/hiking-trail/MetricsScore';
import { AuthService } from '../../services/auth.service';
import { HikingTrailService } from '../../services/hiking-trail.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { AlertManagerService } from '../../services/alert-manager.service';

interface MetricsScoreDisplay {
  key: keyof Omit<MetricsScore, 'accountCode'>;
  label: string;
  icon: string;
  value: number;
}

@Component({
  selector: 'app-metrics-score-slider',
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    MaterialModules,
    TranslatePipe,
  ],
  templateUrl: './metrics-score-slider.component.html',
  styleUrl: './metrics-score-slider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsScoreSliderComponent implements OnInit {

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  disabled: boolean = false;
  max: number = 10;
  metrics: MetricsScoreDisplay[] = [];
  min: number = 0;
  showTicks: boolean = false;
  step: number = 1;
  thumbLabel: boolean = false;

  // Single source of truth for the metrics shown (label + icon), reused on load/error
  private readonly metricDefinitions: Omit<MetricsScoreDisplay, 'value'>[] = [
    { key: 'distance',  label: 'metrics-score.distance',   icon: 'straighten' },
    { key: 'duration',  label: 'metrics-score.duration',   icon: 'schedule' },
    { key: 'steps',     label: 'metrics-score.steps',      icon: 'directions_walk' },
    { key: 'calories',  label: 'metrics-score.calories',   icon: 'local_fire_department' },
    { key: 'pace',      label: 'metrics-score.pace',       icon: 'speed' },
    { key: 'elevation', label: 'metrics-score.elevation',  icon: 'terrain' },
    { key: 'heartRate', label: 'metrics-score.heart_rate', icon: 'favorite' },
    { key: 'speed',     label: 'metrics-score.speed',      icon: 'bolt' },
  ];

  constructor(
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private hikingTrailService: HikingTrailService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.loadMetricsScore();
  }

  loadMetricsScore(): void {
    const accountCode = this.authService.getUserCode();

    if (!accountCode) {
      this.authService.logout();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.hikingTrailService
      .getMetricsScoreByAccountCode(accountCode)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((metricsScore: MetricsScore | null) => {
          this.metrics = this.metricDefinitions.map(definition => ({
            ...definition,
            value: metricsScore?.[definition.key] ?? 0
          }));
        }),
        catchError(err => {
          this.error.set('Error loading metrics score');
          this.metrics = this.metricDefinitions.map(definition => ({
            ...definition,
            value: 0
          }));
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  saveChanges(): void {
    const metricsScore: MetricsScore = {
      accountCode: this.authService.getUserCode()!,
      distance: 0,
      duration: 0,
      steps: 0,
      calories: 0,
      pace: 0,
      elevation: 0,
      heartRate: 0,
      speed: 0
    };

    this.metrics.forEach(item => {
      metricsScore[item.key] = item.value;
    });

    this.hikingTrailService
      .updateMetricsScore(metricsScore)
      .subscribe({
        next: () => {
          const message: string = this.translateService.instant('metrics-score.changes-saved-successfully');

          this.alertManagerService.alertSuccess(message);
        },
        error: (error) => {
          this.error.set('Error saving metrics score');
          this.alertManagerService.manageError(error);
        }
      });
  }

}
