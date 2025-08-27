import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { HikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { CarouselImagesComponent } from '../../pages/shared/carousel-images/carousel-images.component';
import { ProfilePictureComponent } from '../../pages/shared/profile-picture/profile-picture.component';
import { FriendlyDatePipe } from '../../pipes/FriendlyDatePipe';
import { Metrics } from '../../interfaces/hiking-trail/Metrics';
import { Metric } from '../../interfaces/display/Metric';

@Component({
  selector: 'app-hiking-trail-card',
  imports: [
    CarouselImagesComponent,
    MaterialModules,
    ProfilePictureComponent,
    RouterModule,
    TranslatePipe,
    FriendlyDatePipe
],
  templateUrl: './hiking-trail-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HikingTrailCardComponent implements OnInit {
  @Input({ required: true }) hikingTrail!: HikingTrail;
  @Input() belongLoggedUser: boolean = false;
  @Input() showResume: boolean = false;

  get metricsDisplay(): Metric[] {
    const isHidden: boolean = !this.showResume;
    return [
      { key: 'distance', icon: 'mdi-map-marker-radius', label: 'metrics.distance', unit: 'km', display: true },
      { key: 'calories', icon: 'mdi-fire', label: 'metrics.calories', unit: 'Kcal', display: true },
      { key: 'duration', icon: 'timer', label: 'metrics.duration', unit: '', display: true },
      { key: 'steps', icon: 'mdi-shoe-print', label: 'metrics.steps', unit: '', display: isHidden },
      { key: 'averagePace', icon: 'mdi-timer-outline', label: 'metrics.averagePace', unit: 'min/km', display: isHidden },
      { key: 'maxPace', icon: 'mdi-timer', label: 'metrics.maxPace', unit: 'min/km', display: isHidden },
      { key: 'elevationGain', icon: 'mdi-elevation-rise', label: 'metrics.elevationGain', unit: 'm', display: isHidden },
      { key: 'elevationLoss', icon: 'mdi-elevation-decline', label: 'metrics.elevationLoss', unit: 'm', display: isHidden },
      { key: 'averageSpeed', icon: 'mdi-speedometer-medium', label: 'metrics.averageSpeed', unit: 'km/h', display: isHidden },
      { key: 'maxSpeed', icon: 'mdi-speedometer', label: 'metrics.maxSpeed', unit: 'km/h', display: isHidden },
      { key: 'averageHeartRate', icon: 'mdi-heart-multiple-outline', label: 'metrics.averageHeartRate', unit: 'bpm', display: isHidden },
      { key: 'maxHeartRate', icon: 'mdi-heart-plus', label: 'metrics.maxHeartRate', unit: 'bpm', display: isHidden },
      { key: 'minHeartRate', icon: 'mdi-heart-minus', label: 'metrics.minHeartRate', unit: 'bpm', display: isHidden },
      { key: 'averageCadence', icon: 'mdi-walk', label: 'metrics.averageCadence', unit: 'spm', display: isHidden },
      { key: 'maxCadence', icon: 'mdi-walk', label: 'metrics.maxCadence', unit: 'spm', display: isHidden },
      { key: 'maxAltitude', icon: 'mdi-arrow-top-right', label: 'metrics.maxAltitude', unit: 'm', display: isHidden },
      { key: 'minAltitude', icon: 'mdi-arrow-bottom-right', label: 'metrics.minAltitude', unit: 'm', display: isHidden },
    ];
  }

  metricsValues: Record<string, any | undefined> = {};

  ngOnInit(): void {
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
  }

  get metrics(): Metrics | undefined {
    if (this.hikingTrail.metrics.length === 0 || !this.hikingTrail.metrics[0]) {
      return undefined;
    }

    return this.hikingTrail.metrics[0];
  }

  get distance(): number | undefined {
    if (!this.metrics?.distance) {
      return undefined;
    }

    const kms = this.metrics.distance / 1000;

    return Math.round(kms * 100) / 100;
  }

  get calories(): number | undefined {
    if (!this.metrics?.calories) {
      return undefined;
    }

    return this.metrics.calories;
  }

  get steps(): number | undefined {
    if (!this.metrics?.steps) {
      return undefined;
    }

    return this.metrics.steps;
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
    if (!this.metrics?.averagePace) {
      return undefined;
    }

    return Math.round(this.metrics.averagePace * 100 / 60) / 100;
  }

  get maxPace(): number | undefined {
    if (!this.metrics?.maxPace) {
      return undefined;
    }

    return Math.round(this.metrics.maxPace * 100 / 60) / 100;
  }

  get elevationGain(): number | undefined {
    if (!this.metrics?.elevationGain) {
      return undefined;
    }

    return Math.round(this.metrics.elevationGain * 100) / 100;
  }

  get elevationLoss(): number | undefined {
    if (!this.metrics?.elevationLoss) {
      return undefined;
    }

    return Math.round(this.metrics.elevationLoss * 100) / 100;
  }

  get averageSpeed(): number | undefined {
    if (!this.metrics?.averageSpeed) {
      return undefined;
    }

    return Math.round(this.metrics.averageSpeed * 3.6 * 100) / 100;
  }

  get maxSpeed(): number | undefined {
    if (!this.metrics?.maxSpeed) {
      return undefined;
    }

    return Math.round(this.metrics.maxSpeed * 3.6 * 100) / 100;
  }

  get averageHeartRate(): number | undefined {
    if (!this.metrics?.averageHeartRate) {
      return undefined;
    }

    return this.metrics.averageHeartRate;
  }

  get maxHeartRate(): number | undefined {
    if (!this.metrics?.maxHeartRate) {
      return undefined;
    }

    return this.metrics.maxHeartRate;
  }

  get minHeartRate(): number | undefined {
    if (!this.metrics?.minHeartRate) {
      return undefined;
    }

    return this.metrics.minHeartRate;
  }

  get averageCadence(): number | undefined {
    if (!this.metrics?.averageCadence) {
      return undefined;
    }

    return Math.round(this.metrics.averageCadence * 100) / 100;
  }

  get maxCadence(): number | undefined {
    if (!this.metrics?.maxCadence) {
      return undefined;
    }

    return Math.round(this.metrics.maxCadence * 100) / 100;
  }

  get maxAltitude(): number | undefined {
    if (!this.metrics?.maxAltitude) {
      return undefined;
    }

    return Math.round(this.metrics.maxAltitude * 100) / 100;
  }

  get minAltitude(): number | undefined {
    if (!this.metrics?.minAltitude) {
      return undefined;
    }

    return Math.round(this.metrics.minAltitude * 100) / 100;
  }

}
