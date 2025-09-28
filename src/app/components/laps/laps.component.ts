import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { Metric } from '../../interfaces/display/Metric';
import { Lap } from '../../interfaces/fit-data/Lap';

@Component({
  selector: 'app-laps',
  imports: [
    MaterialModules,
    TranslatePipe,
  ],
  templateUrl: './laps.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LapsComponent implements OnInit {
  @Input({ required: true }) laps: Lap[] = [];

  get metricsDisplay(): Metric[] {
    return [
      { key: 'averagePace', icon: 'mdi-timer-outline', label: 'metrics.averagePace', unit: 'min/km', display: true },
      { key: 'maxPace', icon: 'mdi-timer', label: 'metrics.maxPace', unit: 'min/km', display: true },
      { key: 'distance', icon: 'mdi-map-marker-radius', label: 'metrics.distance', unit: 'km', display: true },
      { key: 'calories', icon: 'mdi-fire', label: 'metrics.calories', unit: 'Kcal', display: true },
      { key: 'averageSpeed', icon: 'mdi-speedometer-medium', label: 'metrics.averageSpeed', unit: 'km/h', display: true },
      { key: 'maxSpeed', icon: 'mdi-speedometer', label: 'metrics.maxSpeed', unit: 'km/h', display: true },
      { key: 'totalAscent', icon: 'mdi-elevation-rise', label: 'metrics.totalAscent', unit: 'm', display: true },
      { key: 'totalDescent', icon: 'mdi-elevation-decline', label: 'metrics.totalDescent', unit: 'm', display: true },
      { key: 'averageHeartRate', icon: 'mdi-heart-multiple-outline', label: 'metrics.averageHeartRate', unit: 'bpm', display: true },
      { key: 'maxHeartRate', icon: 'mdi-heart-plus', label: 'metrics.maxHeartRate', unit: 'bpm', display: true },
      { key: 'averageCadence', icon: 'mdi-walk', label: 'metrics.averageCadence', unit: 'spm', display: true },
      { key: 'maxCadence', icon: 'mdi-walk', label: 'metrics.maxCadence', unit: 'spm', display: true },
      { key: 'averagePower', icon: '', label: 'metrics.averagePower', unit: 'W', display: false },
      { key: 'maxPower', icon: '', label: 'metrics.maxPower', unit: 'W', display: false },
      { key: 'averageTemperature', icon: '', label: 'metrics.averageTemperature', unit: '°C', display: false },
      { key: 'maxTemperature', icon: '', label: 'metrics.maxTemperature', unit: '°C', display: false },
    ];
  }

  readonly panelOpenState = signal(false);

  accordion = viewChild.required(MatAccordion);
  metricsValues?: Record<string, any | undefined>[];

  ngOnInit(): void {
    this.metricsValues = new Array(this.laps.length);

    for (let i = 0; i < this.laps.length; i++) {
      this.metricsValues[i] = {
        averagePace: this.getAveragePace(i),
        maxPace: this.getMaxPace(i),
        distance: this.getDistance(i),
        calories: this.getCalories(i),
        averageSpeed: this.getAverageSpeed(i),
        maxSpeed: this.getMaxSpeed(i),
        totalAscent: this.getTotalAscent(i),
        totalDescent: this.getTotalDescent(i),
        averageHeartRate: this.getAverageHeartRate(i),
        maxHeartRate: this.getMaxHeartRate(i),
        averageCadence: this.getAverageCadence(i),
        maxCadence: this.getMaxCadence(i),
        averagePower: this.getAveragePower(i),
        maxPower: this.getMaxPower(i),
        averageTemperature: this.getAverageTemperature(i),
        maxTemperature: this.getMaxTemperature(i),
      };
    }
  }

  getMetricValue(index: number, key: string): number | undefined {
    return this.metricsValues?.[index]?.[key];
  }

  getKilometer(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    let kms = this.laps[0].totalDistance ?? 0;

    for (let i = 1; i <= index; i++) {
      kms += (this.laps[i].totalDistance ?? 0);
    }

    return Math.round(kms / 1000 * 100) / 100;
  }

  getDistance(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    const dist = (this.laps[index].totalDistance ?? 0) / 1000;

    return Math.round(dist * 100) / 100;
  }

  getDuration(index: number): string {
    if (index < 0 || index >= this.laps.length) {
      return '';
    }

    const duration = this.laps[index].totalElapsedTime ?? 0;

    const hours = Math.floor(duration / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((duration % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(duration % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}'${seconds}`;
  }

  getCalories(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].totalCalories ?? 0;
  }

  getAverageSpeed(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    const speed = this.laps[index].avgSpeed ?? 0;

    return Math.round(speed * 3.6 * 100) / 100;
  }

  getMaxSpeed(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    const speed = this.laps[index].maxSpeed ?? 0;

    return Math.round(speed * 3.6 * 100) / 100;
  }

  getAverageHeartRate(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].avgHeartRate ?? 0;
  }

  getMaxHeartRate(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].maxHeartRate ?? 0;
  }

  getAverageCadence(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].avgCadence ?? 0;
  }

  getMaxCadence(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].maxCadence ?? 0;
  }

  getAveragePower(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].avgPower ?? 0;
  }

  getMaxPower(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].maxPower ?? 0;
  }

  getTotalAscent(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].totalAscent ?? 0;
  }

  getTotalDescent(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].totalDescent ?? 0;
  }

  getAverageTemperature(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].avgTemperature ?? 0;
  }

  getMaxTemperature(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    return this.laps[index].maxTemperature ?? 0;
  }

  getAveragePace(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    const pace = this.laps[index].avgPace ?? 0;

    return Math.round(pace * 100 / 60) / 100;
  }

  getMaxPace(index: number): number {
    if (index < 0 || index >= this.laps.length) {
      return 0;
    }

    const pace = this.laps[index].maxPace ?? 0;

    return Math.round(pace * 100 / 60) / 100;
  }

}
