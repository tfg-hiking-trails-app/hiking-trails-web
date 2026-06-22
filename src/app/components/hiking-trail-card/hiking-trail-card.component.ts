import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  signal
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertManagerService } from '../../services/alert-manager.service';
import { AuthService } from '../../services/auth.service';
import { CarouselImagesComponent } from '../../pages/shared/carousel-images/carousel-images.component';
import { CommentsCardComponent } from '../comments-card/comments-card.component';
import { CreatePrestige, DeletePrestige, Prestige } from '../../interfaces/hiking-trail/Prestige';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { EditActivityManuallyCardComponent } from '../edit-activity-manually-card/edit-activity-manually-card.component';
import { EventBusService } from '../../services/event-bus.service';
import { FriendlyDatePipe } from '../../pipes/FriendlyDatePipe';
import { getWindowWidth } from '../../Utils/Utils';
import { HikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../services/hiking-trail.service';
import { Metric } from '../../interfaces/display/Metric';
import { Metrics } from '../../interfaces/hiking-trail/Metrics';
import { ProfilePictureComponent } from '../../pages/shared/profile-picture/profile-picture.component';
import { SaveToCollectionDialogComponent } from '../save-to-collection-dialog/save-to-collection-dialog.component';

@Component({
  selector: 'app-hiking-trail-card',
  imports: [
    CarouselImagesComponent,
    MaterialModules,
    ProfilePictureComponent,
    RouterModule,
    TranslatePipe,
    FriendlyDatePipe,
],
  templateUrl: './hiking-trail-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HikingTrailCardComponent implements OnInit {
  @Input({ required: true }) hikingTrail!: HikingTrail;
  @Input() belongLoggedUser: boolean = false;
  @Input() showResume: boolean = false;

  metricsValues: Record<string, any | undefined> = {};
  userGavePrestige = signal<boolean>(false);
  prestiges = signal<Prestige[]>([]);

  constructor(
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private eventBusService: EventBusService,
    private hikingService: HikingTrailService,
    private router: Router,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.eventBusService.refreshHikingTrailDetail$
      .subscribe(() => {
        this.hikingService.getByCode(this.hikingTrail.code)
          .subscribe({
            next: (hikingTrail: HikingTrail) => {
              this.hikingTrail = hikingTrail;
              this.checkPrestige();
              this.prestiges.set(this.hikingTrail.prestiges || []);
              this.cdr.markForCheck();
            }
          });
      });

    this.metricsValues = {
      distance: this.distance,
      calories: this.calories,
      duration: this.duration,
      steps: this.steps,
      averagePace: this.averagePace,
      maxPace: this.maxPace,
      elevationGain: this.elevationGain,
      elevationLoss: this.elevationLoss,
      averageSpeed: this.averageSpeed,
      maxSpeed: this.maxSpeed,
      averageHeartRate: this.averageHeartRate,
      maxHeartRate: this.maxHeartRate,
      minHeartRate: this.minHeartRate,
      averageCadence: this.averageCadence,
      maxCadence: this.maxCadence,
      maxAltitude: this.maxAltitude,
      minAltitude: this.minAltitude,
    };

    this.checkPrestige();
    this.prestiges.set(this.hikingTrail.prestiges || []);
  }

  togglePrestige(): void {
    this.userGavePrestige.update(value => !value);

    const body: CreatePrestige | DeletePrestige = {
      hikingTrailCode: this.hikingTrail.code,
      receiverAccountCode: this.hikingTrail.accountCode,
      giverAccountCode: this.authService.getUserCode() || ''
    };

    if (this.userGavePrestige()) {
      this.hikingService
        .addPrestige(body)
        .subscribe({
          next: (prestige: Prestige) => this.prestiges.update(prestiges => [...prestiges, prestige]),
          error: () => this.userGavePrestige.set(false)
        });
    } else {
      this.hikingService
        .removePrestige(body)
        .subscribe({
          next: (code: string) => this.prestiges.update(prestiges => prestiges.filter(p => p.code !== code)),
          error: () => this.userGavePrestige.set(true)
        });
    }
  }

  checkPrestige(): void {
    const userCode = this.authService.getUserCode();
    const prestiges = this.hikingTrail?.prestiges || [];

    if (!userCode) {
      this.userGavePrestige.set(false);
      return;
    }

    this.userGavePrestige.set(prestiges.some(p => p?.giverAccountCode === userCode));
  }

  edit(): void {
    this.dialog.open(EditActivityManuallyCardComponent, {
      width: getWindowWidth(),
      maxHeight: '80vh',
      data: this.hikingTrail
    });
  }

  delete(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('hiking-trail-card.delete-hiking-trail-title'),
        message: this.translateService.instant('hiking-trail-card.delete-hiking-trail-message'),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.hikingService
        .delete(this.hikingTrail.code)
        .subscribe({
          next: () => {
            const message = this.translateService.instant('hiking-trail-card.delete-success');
            this.alertManagerService.alertSuccess(message);

            if (this.router.url === '/feed')
              this.eventBusService.refreshFeed();
            else
              this.router.navigate(['/feed']);
          },
          error: (error) => {
            this.alertManagerService.manageError(error);
          }
        });
    });
  }

  openCommentsDialog(): void {
    const dialogRef = this.dialog.open(CommentsCardComponent, {
      data: this.hikingTrail,
      width: getWindowWidth()
    });

    dialogRef.afterClosed().subscribe((updated: HikingTrail) => {
      if (updated) {
        this.hikingTrail = updated;
        this.cdr.markForCheck();
      }
    });
  }

  openSaveToCollection(): void {
    this.dialog.open(SaveToCollectionDialogComponent, {
      data: {
        hikingTrailCode: this.hikingTrail.code,
        trailName: this.hikingTrail.name
      },
      width: '420px',
      maxWidth: '90vw',
      maxHeight: '80vh'
    });
  }

  get canSaveToCollection(): boolean {
    return this.authService.isAuthenticated();
  }

  get metricsDisplay(): Metric[] {
    const isHidden: boolean = !this.showResume;
    return [
      { key: 'distance',          icon: 'mdi-map-marker-radius',      label: 'metrics.distance',          unit: 'km',       display: true },
      { key: 'calories',          icon: 'mdi-fire',                   label: 'metrics.calories',          unit: 'Kcal',     display: true },
      { key: 'duration',          icon: 'timer',                      label: 'metrics.duration',          unit: '',         display: true },
      { key: 'steps',             icon: 'mdi-shoe-print',             label: 'metrics.steps',             unit: '',         display: isHidden },
      { key: 'averagePace',       icon: 'mdi-timer-outline',          label: 'metrics.averagePace',       unit: 'min/km',   display: isHidden },
      { key: 'maxPace',           icon: 'mdi-timer',                  label: 'metrics.maxPace',           unit: 'min/km',   display: isHidden },
      { key: 'elevationGain',     icon: 'mdi-elevation-rise',         label: 'metrics.elevationGain',     unit: 'm',        display: isHidden },
      { key: 'elevationLoss',     icon: 'mdi-elevation-decline',      label: 'metrics.elevationLoss',     unit: 'm',        display: isHidden },
      { key: 'averageSpeed',      icon: 'mdi-speedometer-medium',     label: 'metrics.averageSpeed',      unit: 'km/h',     display: isHidden },
      { key: 'maxSpeed',          icon: 'mdi-speedometer',            label: 'metrics.maxSpeed',          unit: 'km/h',     display: isHidden },
      { key: 'averageHeartRate',  icon: 'mdi-heart-multiple-outline', label: 'metrics.averageHeartRate',  unit: 'bpm',      display: isHidden },
      { key: 'maxHeartRate',      icon: 'mdi-heart-plus',             label: 'metrics.maxHeartRate',      unit: 'bpm',      display: isHidden },
      { key: 'minHeartRate',      icon: 'mdi-heart-minus',            label: 'metrics.minHeartRate',      unit: 'bpm',      display: isHidden },
      { key: 'averageCadence',    icon: 'mdi-walk',                   label: 'metrics.averageCadence',    unit: 'spm',      display: isHidden },
      { key: 'maxCadence',        icon: 'mdi-walk',                   label: 'metrics.maxCadence',        unit: 'spm',      display: isHidden },
      { key: 'maxAltitude',       icon: 'mdi-arrow-top-right',        label: 'metrics.maxAltitude',       unit: 'm',        display: isHidden },
      { key: 'minAltitude',       icon: 'mdi-arrow-bottom-right',     label: 'metrics.minAltitude',       unit: 'm',        display: isHidden },
    ];
  }

  get metric(): Metrics | undefined {
    if (this.hikingTrail.metrics.length === 0 || !this.hikingTrail.metrics[0]) {
      return undefined;
    }

    return this.hikingTrail.metrics[0];
  }

  get distance(): number | undefined {
    if (!this.metric?.distance) {
      return undefined;
    }

    const kms = this.metric.distance / 1000;

    return Math.round(kms * 100) / 100;
  }

  get calories(): number | undefined {
    if (!this.metric?.calories) {
      return undefined;
    }

    return this.metric.calories;
  }

  get steps(): number | undefined {
    if (!this.metric?.steps) {
      return undefined;
    }

    return this.metric.steps;
  }

  get duration(): string {
    const startTime = new Date(this.hikingTrail.startTime);
    const endTime = new Date(this.hikingTrail.endTime);

    const date: Date = new Date(endTime.getTime() - startTime.getTime());

    const hours: string = date.getUTCHours().toString().padStart(2, '0');
    const minutes: string = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds: string = date.getUTCSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}'${seconds}`;
  }

  get averagePace(): number | undefined {
    if (!this.metric?.averagePace) {
      return undefined;
    }

    return Math.round(this.metric.averagePace * 100 / 60) / 100;
  }

  get maxPace(): number | undefined {
    if (!this.metric?.maxPace) {
      return undefined;
    }

    return Math.round(this.metric.maxPace * 100 / 60) / 100;
  }

  get elevationGain(): number | undefined {
    if (!this.metric?.elevationGain) {
      return undefined;
    }

    return Math.round(this.metric.elevationGain * 100) / 100;
  }

  get elevationLoss(): number | undefined {
    if (!this.metric?.elevationLoss) {
      return undefined;
    }

    return Math.round(this.metric.elevationLoss * 100) / 100;
  }

  get averageSpeed(): number | undefined {
    if (!this.metric?.averageSpeed) {
      return undefined;
    }

    return Math.round(this.metric.averageSpeed * 3.6 * 100) / 100;
  }

  get maxSpeed(): number | undefined {
    if (!this.metric?.maxSpeed) {
      return undefined;
    }

    return Math.round(this.metric.maxSpeed * 3.6 * 100) / 100;
  }

  get averageHeartRate(): number | undefined {
    if (!this.metric?.averageHeartRate) {
      return undefined;
    }

    return this.metric.averageHeartRate;
  }

  get maxHeartRate(): number | undefined {
    if (!this.metric?.maxHeartRate) {
      return undefined;
    }

    return this.metric.maxHeartRate;
  }

  get minHeartRate(): number | undefined {
    if (!this.metric?.minHeartRate) {
      return undefined;
    }

    return this.metric.minHeartRate;
  }

  get averageCadence(): number | undefined {
    if (!this.metric?.averageCadence) {
      return undefined;
    }

    return Math.round(this.metric.averageCadence * 100) / 100;
  }

  get maxCadence(): number | undefined {
    if (!this.metric?.maxCadence) {
      return undefined;
    }

    return Math.round(this.metric.maxCadence * 100) / 100;
  }

  get maxAltitude(): number | undefined {
    if (!this.metric?.maxAltitude) {
      return undefined;
    }

    return Math.round(this.metric.maxAltitude * 100) / 100;
  }

  get minAltitude(): number | undefined {
    if (!this.metric?.minAltitude) {
      return undefined;
    }

    return Math.round(this.metric.minAltitude * 100) / 100;
  }

}
