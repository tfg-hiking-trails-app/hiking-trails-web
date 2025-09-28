import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartDataset } from 'chart.js';

import { GraphicsData } from '../../interfaces/fit-data/GraphicsData';
import { LangService } from '../../services/lang.service';
import { LineChartComponent } from '../line-chart/line-chart.component';

@Component({
  selector: 'app-graphics',
  imports: [
    LineChartComponent,
  ],
  templateUrl: './graphics.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicsComponent implements OnChanges {
  @Input() graphicsData: GraphicsData[] = [];

  labels: string[] = [];
  heartRateData: ChartDataset<'line'>[] = [];
  altitudeData: ChartDataset<'line'>[] = [];
  cadenceData: ChartDataset<'line'>[] = [];
  speedData: ChartDataset<'line'>[] = [];
  distanceData: ChartDataset<'line'>[] = [];

  constructor(
    private translateService: TranslateService,
    private langService: LangService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const labels: string[] = new Array<string>(this.graphicsData.length);
    const heartRate: number[] = new Array<number>(this.graphicsData.length);
    const altitude: number[] = new Array<number>(this.graphicsData.length);
    const cadence: number[] = new Array<number>(this.graphicsData.length);
    const speed: number[] = new Array<number>(this.graphicsData.length);
    const distance: number[] = new Array<number>(this.graphicsData.length);

    for (let i = 0; i < this.graphicsData.length; i++) {
      labels[i] = this.getLocaleDate(this.graphicsData[i].timestamp);
      heartRate[i] = this.graphicsData[i].heartRate ?? 0;
      altitude[i] = this.graphicsData[i].altitude ?? 0;
      cadence[i] = this.graphicsData[i].cadence ?? 0;
      speed[i] = this.graphicsData[i].speed ?? 0;
      distance[i] = this.graphicsData[i].distance ?? 0;
    }

    this.labels = labels;

    const base = {
      tension: 0.2,
      fill: 'origin',
      borderWidth: 1,
      pointRadius: 0,
      pointHoverRadius: 0,
      spanGaps: true
    }

    this.heartRateData = this.getHeartRateData(heartRate, base);
    this.altitudeData = this.getAltitudeData(altitude, base);
    this.cadenceData = this.getCadenceData(cadence, base);
    this.speedData = this.getSpeedData(speed, base);
    this.distanceData = this.getDistanceData(distance, base);
  }

  private getLocaleDate(date: Date | undefined): string {
    return date
      ? new Date(date).toLocaleTimeString(this.langService.getLocale(), {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      : '';
  }

  private getHeartRateData(data: number[], options: {}): ChartDataset<'line'>[] {
    return [{
      label: this.translateService.instant('graphics.heart_rate'),
      data: data,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      ...options
    }];
  }

  private getAltitudeData(data: number[], options: {}): ChartDataset<'line'>[] {
    return [{
      label: this.translateService.instant('graphics.altitude'),
      data: data,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      ...options
    }];
  }

  private getCadenceData(data: number[], options: {}): ChartDataset<'line'>[] {
    return [{
      label: this.translateService.instant('graphics.cadence'),
      data: data,
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderColor: 'rgba(255, 206, 86, 1)',
      ...options
    }];
  }

  private getSpeedData(data: number[], options: {}): ChartDataset<'line'>[] {
    return [{
      label: this.translateService.instant('graphics.speed'),
      data: data,
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      ...options
    }];
  }

  private getDistanceData(data: number[], options: {}): ChartDataset<'line'>[] {
    return [{
      label: this.translateService.instant('graphics.distance'),
      data: data,
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      ...options
    }];
  }

}
