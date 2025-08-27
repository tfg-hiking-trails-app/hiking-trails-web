import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

import { Coordinates } from '../../interfaces/fit-data/Coordinates';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-trail-map',
  imports: [],
  templateUrl: './trail-map.component.html',
  styles: ``,
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
  private resizeObserver?: ResizeObserver;
  private resizeRaf?: number;

  private lightTileLayer!: L.TileLayer;
  private darkTileLayer!: L.TileLayer;

  private onThemeChange = (event: CustomEvent) => {
    const isDarkMode = event.detail.isDarkMode ?? this.isDarkMode();
    this.applyTheme(isDarkMode);
  };

  constructor(
    private translate: TranslateService
  ) { }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.center.positionLat, this.center.positionLong],
      zoom: 12,
      scrollWheelZoom: false
    });

    this.lightTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this.darkTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: 'map-tiles'
    });

    this.isDarkMode()
      ? this.darkTileLayer.addTo(this.map)
      : this.lightTileLayer.addTo(this.map);

    this.drawPolyline();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeRaf)
        cancelAnimationFrame(this.resizeRaf);

      this.resizeRaf = requestAnimationFrame(() => this.map.invalidateSize());
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);

    window.addEventListener('theme-changed', this.onThemeChange as EventListener);
  }

  private isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  private applyTheme(isDarkMode: boolean): void {
    if (this.map.hasLayer(this.darkTileLayer))
      this.map.removeLayer(this.darkTileLayer);

    if (this.map.hasLayer(this.lightTileLayer))
      this.map.removeLayer(this.lightTileLayer);

    isDarkMode
      ? this.map.addLayer(this.darkTileLayer)
      : this.map.addLayer(this.lightTileLayer);
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
    if (this.markerEnd) {
      this.map.removeLayer(this.markerEnd);
    }

    const icon = L.icon({
      iconUrl: '/images/mark.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.markerStart = L.marker(start, { icon })
                        .addTo(this.map)
                        .bindPopup(this.translate.instant('hiking-trail.start'));
    this.markerEnd = L.marker(end, { icon })
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
