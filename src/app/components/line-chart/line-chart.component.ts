import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ChartConfiguration, ChartData, ChartDataset, ChartType } from 'chart.js';
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: 'app-line-chart',
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) datasets: ChartDataset<'line'>[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  type: ChartType = 'line';

  data: ChartData<'line'> = {
    labels: this.labels,
    datasets: this.datasets
  };

  options: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    color: '#fff',
    plugins: {
      legend: {
        labels: { color: '#fff' }
      },
      tooltip: {
        titleColor: '#fff',
        bodyColor: '#fff',
        footerColor: '#fff'
      },
      decimation: {
        enabled: true,
        algorithm: 'lttb',
        samples: 300
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid:  { color: 'rgba(255,255,255,.2)' }
      },
      y: {
        grace: '10%',
        ticks: { color: '#fff' },
        grid:  { color: 'rgba(255,255,255,.2)' }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.data = {
      labels: this.labels,
      datasets: this.datasets
    };

    queueMicrotask(() => this.chart?.update());
  }

  ngAfterViewInit(): void {
    this.chart?.update();
  }

}
