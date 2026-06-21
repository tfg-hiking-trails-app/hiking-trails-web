import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  signal,
  ViewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';
import * as L from 'leaflet';

import { Recommender } from '../../interfaces/hiking-trail/Recommender';
import { isDarkMode } from '../../Utils/Utils';

export type RecommenderFiltersValue = Pick<Recommender, 'kilometers' | 'locationLatitude' | 'locationLongitude'>;

@Component({
  selector: 'app-recommender-filters',
  imports: [
    CommonModule,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './recommender-filters.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommenderFilters implements AfterViewInit, OnDestroy {

  // Kept in sync with the backend validation ([Range(1, 25)] on RecommenderDto.Kilometers)
  readonly minKilometers = 1;
  readonly maxKilometers = 25;

  // Fallback map center (Madrid) used until the browser geolocation resolves
  private readonly defaultCenter: L.LatLngTuple = [40.41650000, -3.70256000];

  @Output() search = new EventEmitter<RecommenderFiltersValue>();

  @ViewChild('mapContainer', { static: false }) mapContainer?: ElementRef<HTMLDivElement>;

  kilometersControl = new FormControl<number>(10, {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.min(this.minKilometers),
      Validators.max(this.maxKilometers),
    ],
  });

  selectedLatitude = signal<number | null>(null);
  selectedLongitude = signal<number | null>(null);

  private map!: L.Map;
  private marker?: L.Marker;
  private destroyed = false;
  private resizeObserver?: ResizeObserver;
  private resizeRaf?: number;

  private lightTileLayer!: L.TileLayer;
  private darkTileLayer!: L.TileLayer;

  private onThemeChange = (event: CustomEvent) => {
    this.applyTheme(event.detail.isDarkMode ?? isDarkMode());
  };

  ngAfterViewInit(): void {
    const load = () => {
      if (!this.mapContainer?.nativeElement) {
        requestAnimationFrame(load);
        return;
      }

      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.defaultCenter,
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

      isDarkMode()
        ? this.darkTileLayer.addTo(this.map)
        : this.lightTileLayer.addTo(this.map);

      this.registerClickHandler();

      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeRaf)
          cancelAnimationFrame(this.resizeRaf);

        this.resizeRaf = requestAnimationFrame(() => this.map.invalidateSize());
      });
      this.resizeObserver.observe(this.mapContainer.nativeElement);

      window.addEventListener('theme-changed', this.onThemeChange as EventListener);

      this.centerOnBrowserLocation();
    };

    load();
  }

  private centerOnBrowserLocation(): void {
    if (!navigator.geolocation)
      return;

    navigator.geolocation.getCurrentPosition(
      position => {
        if (this.destroyed)
          return;

        const { latitude, longitude } = position.coords;
        this.map.setView([latitude, longitude], 13);
      },
      // Permission denied or location unavailable: keep the default center
      () => { },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private registerClickHandler(): void {
    const icon = L.icon({
      iconUrl: '/images/mark.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (this.marker)
        this.map.removeLayer(this.marker);

      this.marker = L.marker([lat, lng], { icon })
        .addTo(this.map)
        .bindPopup(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup();

      this.selectedLatitude.set(lat);
      this.selectedLongitude.set(lng);
    });
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

  hasLocation(): boolean {
    return this.selectedLatitude() !== null && this.selectedLongitude() !== null;
  }

  canSearch(): boolean {
    return this.hasLocation() && this.kilometersControl.valid;
  }

  onSearch(): void {
    this.kilometersControl.markAsTouched();

    if (!this.canSearch())
      return;

    this.search.emit({
      kilometers: this.kilometersControl.value,
      locationLatitude: this.selectedLatitude()!,
      locationLongitude: this.selectedLongitude()!,
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    window.removeEventListener('theme-changed', this.onThemeChange as EventListener);

    if (this.resizeRaf)
      cancelAnimationFrame(this.resizeRaf);

    this.resizeObserver?.disconnect();

    if (this.map)
      this.map.remove();
  }

}
