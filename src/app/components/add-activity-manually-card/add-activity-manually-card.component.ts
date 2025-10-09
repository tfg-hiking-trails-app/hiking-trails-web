import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  Observable,
  of,
  shareReplay,
  tap
} from 'rxjs';

import { AlertManagerService } from '../../services/alert-manager.service';
import { AuthService } from '../../services/auth.service';
import { CreateHikingTrail, HikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { CreateMetrics } from '../../interfaces/hiking-trail/Metrics';
import { DifficultyLevel } from '../../interfaces/hiking-trail/DifficultyLevel';
import { HikingTrailService } from '../../services/hiking-trail.service';
import { isDarkMode, removeEmptyFields } from '../../Utils/Utils';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { TerrainType } from '../../interfaces/hiking-trail/TerrainType';
import { TrailType } from '../../interfaces/hiking-trail/TrailType';
import { AddImagesComponent } from '../add-images/add-images.component';

interface Combos {
  difficultyLevels: DifficultyLevel[];
  terrainTypes: TerrainType[];
  trailTypes: TrailType[];
}

@Component({
  selector: 'app-add-activity-manually-card',
  imports: [
    AddImagesComponent,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './add-activity-manually-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddActivityManuallyCardComponent implements AfterViewInit, OnDestroy {

  @ViewChild('mapContainer', { static: false }) mapContainer?: ElementRef<HTMLDivElement>;

  addHikingTrailForm: FormGroup;
  difficultyLevels: DifficultyLevel[] = [];
  files: File[] = [];
  isCreating = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  submitted: boolean = false;
  terrainTypes: TerrainType[] = [];
  trailTypes: TrailType[] = [];

  private map!: L.Map;
  private resizeObserver?: ResizeObserver;
  private resizeRaf?: number;

  private lightTileLayer!: L.TileLayer;
  private darkTileLayer!: L.TileLayer;

  private onThemeChange = (event: CustomEvent) => {
    this.applyTheme(event.detail.isDarkMode ?? isDarkMode());
  };

  constructor(
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<AddActivityManuallyCardComponent>,
    private formBuilder: FormBuilder,
    private hikingTrailService: HikingTrailService,
    private router: Router,
    private translateService: TranslateService,
  ) {
    this.addHikingTrailForm = this.formBuilder.group({
      averageCadence: ['', []],
      averageHeartRate: ['', []],
      averagePace: ['', []],
      averageSpeed: ['', []],
      calories: ['', []],
      description: ['', []],
      difficultyLevel: ['', []],
      distance: ['', [Validators.required, Validators.min(0)]],
      duration: ['', []],
      elevationGain: ['', []],
      elevationLoss: ['', []],
      endDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      locationLatitude: ['', []],
      locationLongitude: ['', []],
      maxAltitude: ['', []],
      maxCadence: ['', []],
      maxHeartRate: ['', []],
      maxPace: ['', []],
      maxSpeed: ['', []],
      minAltitude: ['', []],
      minHeartRate: ['', []],
      name: ['', [Validators.required]],
      petFriendly: [false],
      startDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      steps: ['', []],
      terrainType: ['', []],
      trailType: ['', []],
    });

    this.loadCombos()
      .pipe(
        tap(({ difficultyLevels, terrainTypes, trailTypes }) => {
          this.difficultyLevels = difficultyLevels;
          this.terrainTypes = terrainTypes;
          this.trailTypes = trailTypes;
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();

    // Close the dialog when clicking outside
    this.dialogRef
      .backdropClick()
      .subscribe(() => this.close());

    // Close the dialog when pressing the Escape key
    this.dialogRef
      .keydownEvents()
        .pipe(
          filter(ev => ev.key === 'Escape')
        )
        .subscribe(() => this.close());
  }

  ngAfterViewInit(): void {
    const load = () => {
      if (!this.mapContainer?.nativeElement) {
        requestAnimationFrame(load);
        return;
      }

      this.map = L.map(this.mapContainer?.nativeElement, {
        center: [40.41650000, -3.70256000],
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

      this.drawMap();

      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeRaf)
          cancelAnimationFrame(this.resizeRaf);

        this.resizeRaf = requestAnimationFrame(() => this.map.invalidateSize());
      });
      this.resizeObserver.observe(this.mapContainer.nativeElement);

      window.addEventListener('theme-changed', this.onThemeChange as EventListener);
    };

    load();
  }

  private drawMap(): void {
    const icon = L.icon({
      iconUrl: '/images/mark.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    let clickMarker: L.Marker | null = null;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (clickMarker) {
        this.map.removeLayer(clickMarker);
      }

      clickMarker = L.marker([lat, lng], { icon }).addTo(this.map);
      clickMarker.bindPopup(`${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();

      const ctrlLat = this.addHikingTrailForm.get('locationLatitude');
      if (ctrlLat) {
        ctrlLat.setValue(lat);
        ctrlLat.markAsDirty();
        ctrlLat.markAsTouched();
      }

      const ctrlLng = this.addHikingTrailForm.get('locationLongitude');
      if (ctrlLng) {
        ctrlLng.setValue(lng);
        ctrlLng.markAsDirty();
        ctrlLng.markAsTouched();
      }
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

  get addHikingTrailControls() {
    return this.addHikingTrailForm.controls;
  }

  loadCombos(): Observable<Combos> {
    return forkJoin({
      difficultyLevels: this.hikingTrailService.getAllDifficultyLevels()
        .pipe(catchError(() => of([] as DifficultyLevel[]))),
      terrainTypes: this.hikingTrailService.getAllTerrainTypes()
        .pipe(catchError(() => of([] as TerrainType[]))),
      trailTypes: this.hikingTrailService.getAllTrailTypes()
        .pipe(catchError(() => of([] as TrailType[]))),
    }).pipe(
      shareReplay(1)
    );
  }

  addHikingTrail(): void {
    this.submitted = true;

    if (this.addHikingTrailForm.invalid) {
      return;
    }

    const startDate = this.combineDates(new Date(this.addHikingTrailForm.value.startDate), new Date(this.addHikingTrailForm.value.startTime));
    const endDate = this.combineDates(new Date(this.addHikingTrailForm.value.endDate), new Date(this.addHikingTrailForm.value.endTime));

    if (endDate <= startDate) {
      const message: string = this.translateService.instant('card.hiking-trail-form.invalid-dates');
      this.alertManagerService.alertError(message);
      return;
    }

    const duration = (endDate.getTime() - startDate.getTime());

    const createMetrics = removeEmptyFields<CreateMetrics>({
      distance: this.addHikingTrailForm.value.distance * 1000,
      duration,
      steps: this.addHikingTrailForm.value.steps,
      calories: this.addHikingTrailForm.value.calories,
      averagePace: this.addHikingTrailForm.value.averagePace,
      maxPace: this.addHikingTrailForm.value.maxPace,
      elevationGain: this.addHikingTrailForm.value.elevationGain,
      elevationLoss: this.addHikingTrailForm.value.elevationLoss,
      averageSpeed: this.addHikingTrailForm.value.averageSpeed,
      maxSpeed: this.addHikingTrailForm.value.maxSpeed,
      averageHeartRate: this.addHikingTrailForm.value.averageHeartRate,
      maxHeartRate: this.addHikingTrailForm.value.maxHeartRate,
      minHeartRate: this.addHikingTrailForm.value.minHeartRate,
      averageCadence: this.addHikingTrailForm.value.averageCadence,
      maxCadence: this.addHikingTrailForm.value.maxCadence,
      maxAltitude: this.addHikingTrailForm.value.maxAltitude,
      minAltitude: this.addHikingTrailForm.value.minAltitude
    });

    const createHikingTrail = removeEmptyFields<CreateHikingTrail>({
      accountCode: this.authService.getUserCode() || '',
      description: this.addHikingTrailForm.value.description,
      difficultyLevelCode: this.addHikingTrailForm.value.difficultyLevel,
      endTime: endDate.toISOString(),
      images: this.files,
      locationLatitude: this.addHikingTrailForm.value.locationLatitude,
      locationLongitude: this.addHikingTrailForm.value.locationLongitude,
      metrics: createMetrics,
      name: this.addHikingTrailForm.value.name,
      petFriendly: this.addHikingTrailForm.value.petFriendly,
      startTime: startDate.toISOString(),
      terrainTypeCode: this.addHikingTrailForm.value.terrainType,
      trailTypeCode: this.addHikingTrailForm.value.trailType,
    });

    this.isCreating.set(true);

    this.hikingTrailService
      .add(createHikingTrail)
      .pipe(
        tap((hikingTrail: HikingTrail) => {
          const message: string = this.translateService.instant('card.hiking-trail-form.added-success');
          this.alertManagerService.alertSuccess(message);
          this.router.navigate(['/hiking-trail', hikingTrail.code]);
          this.close();
        }),
        catchError(error => {
          this.alertManagerService.manageError(error);
          return of(null);
        }),
        finalize(() => this.isCreating.set(false))
      )
      .subscribe();
  }

  private combineDates(date: Date, time: Date): Date {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return combined;
  }

  close(): void {
    this.dialogRef.close();
  }

  onSelectedImages(files: File[]): void {
    this.files = files;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

}
