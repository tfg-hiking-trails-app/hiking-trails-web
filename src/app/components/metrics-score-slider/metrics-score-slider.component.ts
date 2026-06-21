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
          this.metrics = [
            { key: 'distance',    label: 'metrics-score.distance',    value: metricsScore?.distance ?? 0 },
            { key: 'duration',    label: 'metrics-score.duration',    value: metricsScore?.duration ?? 0 },
            { key: 'steps',       label: 'metrics-score.steps',       value: metricsScore?.steps ?? 0 },
            { key: 'calories',    label: 'metrics-score.calories',    value: metricsScore?.calories ?? 0 },
            { key: 'pace',        label: 'metrics-score.pace',        value: metricsScore?.pace ?? 0 },
            { key: 'elevation',   label: 'metrics-score.elevation',   value: metricsScore?.elevation ?? 0 },
            { key: 'heartRate',   label: 'metrics-score.heart_rate',  value: metricsScore?.heartRate ?? 0 },
            { key: 'speed',       label: 'metrics-score.speed',       value: metricsScore?.speed ?? 0 }
          ];
        }),
        catchError(err => {
          this.error.set('Error loading metrics score');
          this.metrics = [
            { key: 'distance',    label: 'metrics-score.distance',    value: 0 },
            { key: 'duration',    label: 'metrics-score.duration',    value: 0 },
            { key: 'steps',       label: 'metrics-score.steps',       value: 0 },
            { key: 'calories',    label: 'metrics-score.calories',    value: 0 },
            { key: 'pace',        label: 'metrics-score.pace',        value: 0 },
            { key: 'elevation',   label: 'metrics-score.elevation',   value: 0 },
            { key: 'heartRate',   label: 'metrics-score.heart_rate',  value: 0 },
            { key: 'speed',       label: 'metrics-score.speed',       value: 0 }
          ];
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
