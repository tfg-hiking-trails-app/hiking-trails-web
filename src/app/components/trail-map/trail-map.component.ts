import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

import { Coordinates } from '../../interfaces/fit-data/Coordinates';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-trail-map',
  imports: [],
  templateUrl: './trail-map.component.html',
  styleUrls: ['./trail-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrailMapComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) coordinates: Coordinates[] = [];
  @Input({ required: true }) center!: Coordinates;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private polyline?: L.Polyline;
  private markerStart?: L.Marker;
  private markerEnd?: L.Marker;

  constructor(
    private translate: TranslateService
  ) { }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.center.positionLat, this.center.positionLong],
      zoom: 12
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.drawPolyline();
  }

  private drawPolyline(): void {
    if (!this.coordinates || this.coordinates.length === 0) {
      if (this.polyline) {
        this.map.removeLayer(this.polyline);
        this.polyline = undefined;
      }
      if (this.markerStart) {
        this.map.removeLayer(this.markerStart);
        this.markerStart = undefined;
      }
      if (this.markerEnd) {
        this.map.removeLayer(this.markerEnd);
        this.markerEnd = undefined;
      }

      return;
    }

    const polyline: L.LatLngExpression[] = this.coordinates.map(c => [c.positionLat, c.positionLong]);
    const start: L.LatLngExpression = [this.coordinates[0].positionLat, this.coordinates[0].positionLong];
    const end: L.LatLngExpression = [this.coordinates[this.coordinates.length - 1].positionLat, this.coordinates[this.coordinates.length - 1].positionLong];

    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }

    this.polyline = L.polyline(polyline, { color: 'red', weight: 4 }).addTo(this.map);

    if (this.markerStart) {
      this.map.removeLayer(this.markerStart);
    }

    console.log(this.translate.instant('hiking-trail.start'));
    this.markerStart = L.marker(start)
                        .addTo(this.map)
                        .bindPopup(this.translate.instant('hiking-trail.start'));
    this.markerEnd = L.marker(end)
                        .addTo(this.map)
                        .bindPopup(this.translate.instant('hiking-trail.end'));

    const bounds = this.polyline.getBounds();

    bounds.extend(this.markerStart.getLatLng());
    bounds.extend(this.markerEnd.getLatLng());

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, {
        padding: [16, 16],
        animate: false
      });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

}
