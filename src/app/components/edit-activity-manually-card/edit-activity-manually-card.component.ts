import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
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

import { AddImagesComponent } from '../add-images/add-images.component';
import { AlertManagerService } from '../../services/alert-manager.service';
import { AuthService } from '../../services/auth.service';
import { CreateMetrics, Metrics } from '../../interfaces/hiking-trail/Metrics';
import { DifficultyLevel } from '../../interfaces/hiking-trail/DifficultyLevel';
import { EventBusService } from '../../services/event-bus.service';
import { formatDate } from '@angular/common';
import { HikingTrail, UpdateHikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../services/hiking-trail.service';
import { isDarkMode, removeEmptyFields } from '../../Utils/Utils';
import { LangService } from '../../services/lang.service';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { TerrainType } from '../../interfaces/hiking-trail/TerrainType';
import { TrailType } from '../../interfaces/hiking-trail/TrailType';

interface Combos {
  difficultyLevels: DifficultyLevel[];
  terrainTypes: TerrainType[];
  trailTypes: TrailType[];
}

@Component({
  selector: 'app-add-activity-manually-card',
  imports: [
    AddImagesComponent,
    FormsModule,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe,
    LoadingSpinnerComponent,
],
  templateUrl: './edit-activity-manually-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditActivityManuallyCardComponent implements AfterViewInit, OnDestroy {

  @ViewChild('mapContainer', { static: false }) mapContainer?: ElementRef<HTMLDivElement>;

  editHikingTrailForm: FormGroup;
  difficultyLevels: DifficultyLevel[] = [];
  isLoading = signal<boolean>(true);
  submitted: boolean = false;
  terrainTypes: TerrainType[] = [];
  trailTypes: TrailType[] = [];

  private marker!: L.Marker;
  private map!: L.Map;
  private resizeObserver?: ResizeObserver;
  private resizeRaf?: number;

  private lightTileLayer!: L.TileLayer;
  private darkTileLayer!: L.TileLayer;

  private onThemeChange = (event: CustomEvent) => {
    this.applyTheme(event.detail.isDarkMode ?? isDarkMode());
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HikingTrail,
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<EditActivityManuallyCardComponent>,
    private eventBusService: EventBusService,
    private formBuilder: FormBuilder,
    private hikingTrailService: HikingTrailService,
    private langService: LangService,
    private router: Router,
    private translateService: TranslateService,
  ) {
    const metrics: Metrics = data.metrics.length ? data.metrics[0] : {} as Metrics;

    this.editHikingTrailForm = this.formBuilder.group({
      averageCadence: [{value: metrics.averageCadence, disabled: !!data.generatedByFitFile}, []],
      averageHeartRate: [{value: metrics.averageHeartRate, disabled: data.generatedByFitFile}, []],
      averagePace: [{value: metrics.averagePace, disabled: data.generatedByFitFile}, []],
      averageSpeed: [{value: metrics.averageSpeed, disabled: data.generatedByFitFile}, []],
      calories: [{value: metrics.calories, disabled: data.generatedByFitFile}, []],
      description: [data.description, []],
      difficultyLevel: [data.difficultyLevel.code, []],
      distance: [{value: metrics.distance, disabled: data.generatedByFitFile}, [Validators.required, Validators.min(0)]],
      duration: [{value: metrics.duration, disabled: data.generatedByFitFile}, []],
      elevationGain: [{value: metrics.elevationGain, disabled: data.generatedByFitFile}, []],
      elevationLoss: [{value: metrics.elevationLoss, disabled: data.generatedByFitFile}, []],
      endDate: [{value: formatDate(data.endTime, 'yyyy-MM-dd', this.langService.getLocale()), disabled: data.generatedByFitFile}, [Validators.required]],
      endTime: [{value: data.endTime, disabled: data.generatedByFitFile}, [Validators.required]],
      images: [null],
      locationLatitude: [data.locationLatitude, []],
      locationLongitude: [data.locationLongitude, []],
      maxAltitude: [{value: metrics.maxAltitude, disabled: data.generatedByFitFile}, []],
      maxCadence: [{value: metrics.maxCadence, disabled: data.generatedByFitFile}, []],
      maxHeartRate: [{value: metrics.maxHeartRate, disabled: data.generatedByFitFile}, []],
      maxPace: [{value: metrics.maxPace, disabled: data.generatedByFitFile}, []],
      maxSpeed: [{value: metrics.maxSpeed, disabled: data.generatedByFitFile}, []],
      minAltitude: [{value: metrics.minAltitude, disabled: data.generatedByFitFile}, []],
      minHeartRate: [{value: metrics.minHeartRate, disabled: data.generatedByFitFile}, []],
      name: [data.name, [Validators.required]],
      petFriendly: [data.petFriendly, []],
      startDate: [{value: formatDate(data.startTime, 'yyyy-MM-dd', this.langService.getLocale()), disabled: data.generatedByFitFile}, [Validators.required]],
      startTime: [{value: data.startTime, disabled: data.generatedByFitFile}, [Validators.required]],
      steps: [{value: metrics.steps, disabled: data.generatedByFitFile}, []],
      terrainType: [data.terrainType.code, []],
      trailType: [data.trailType.code, []],
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

      const lat = this.editHikingTrailForm.value.locationLatitude || null;
      const lng = this.editHikingTrailForm.value.locationLongitude || null;

      this.map = L.map(this.mapContainer?.nativeElement, {
        center: [
          lat || 40.416775,
          lng || -3.703790
        ],
        zoom: 14,
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

      if (lat && lng) {
        const icon = L.icon({
          iconUrl: '/images/mark.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        this.marker = L.marker([lat, lng], { draggable: !this.data.generatedByFitFile, icon })
          .addTo(this.map);

        this.marker.on('dragend', () => {
          const pos = (this.marker.getLatLng && this.marker.getLatLng()) as L.LatLng;
          this.editHikingTrailForm.patchValue({
            locationLatitude: pos.lat,
            locationLongitude: pos.lng
          }, { emitEvent: false });
        });
      }

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

      const ctrlLat = this.editHikingTrailForm.get('locationLatitude');
      if (ctrlLat) {
        ctrlLat.setValue(lat);
        ctrlLat.markAsDirty();
        ctrlLat.markAsTouched();
      }

      const ctrlLng = this.editHikingTrailForm.get('locationLongitude');
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

  get editHikingTrailControls() {
    return this.editHikingTrailForm.controls;
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

  editdHikingTrail(): void {
    this.submitted = true;

    if (this.editHikingTrailForm.invalid) {
      this.editHikingTrailForm.markAllAsTouched();
      return;
    }

    const startDate = this.combineDates(new Date(this.editHikingTrailForm.value.startDate), new Date(this.editHikingTrailForm.value.startTime));
    const endDate = this.combineDates(new Date(this.editHikingTrailForm.value.endDate), new Date(this.editHikingTrailForm.value.endTime));

    if (endDate <= startDate) {
      const message: string = this.translateService.instant('card.hiking-trail-form.invalid-dates');
      this.alertManagerService.alertError(message);
      return;
    }

    const duration = (endDate.getTime() - startDate.getTime());

    const createMetrics = removeEmptyFields<CreateMetrics>({
      distance: this.editHikingTrailForm.value.distance * 1000,
      duration,
      steps: this.editHikingTrailForm.value.steps,
      calories: this.editHikingTrailForm.value.calories,
      averagePace: this.editHikingTrailForm.value.averagePace,
      maxPace: this.editHikingTrailForm.value.maxPace,
      elevationGain: this.editHikingTrailForm.value.elevationGain,
      elevationLoss: this.editHikingTrailForm.value.elevationLoss,
      averageSpeed: this.editHikingTrailForm.value.averageSpeed,
      maxSpeed: this.editHikingTrailForm.value.maxSpeed,
      averageHeartRate: this.editHikingTrailForm.value.averageHeartRate,
      maxHeartRate: this.editHikingTrailForm.value.maxHeartRate,
      minHeartRate: this.editHikingTrailForm.value.minHeartRate,
      averageCadence: this.editHikingTrailForm.value.averageCadence,
      maxCadence: this.editHikingTrailForm.value.maxCadence,
      maxAltitude: this.editHikingTrailForm.value.maxAltitude,
      minAltitude: this.editHikingTrailForm.value.minAltitude
    });

    const updateHikingTrail = removeEmptyFields<UpdateHikingTrail>({
      accountCode: this.authService.getUserCode() || '',
      difficultyLevelCode: this.editHikingTrailForm.value.difficultyLevel,
      terrainTypeCode: this.editHikingTrailForm.value.terrainType,
      trailTypeCode: this.editHikingTrailForm.value.trailType,
      name: this.editHikingTrailForm.value.name,
      description: this.editHikingTrailForm.value.description,
      petFriendly: this.editHikingTrailForm.value.petFriendly,
      startTime: startDate,
      endTime: endDate,
      locationLatitude: this.editHikingTrailForm.value.locationLatitude,
      locationLongitude: this.editHikingTrailForm.value.locationLongitude,
      metrics: createMetrics,
      images: this.editHikingTrailForm.value.images,
    });

    this.hikingTrailService
      .edit(this.data.code, updateHikingTrail)
      .subscribe({
        next: () => {
          const message: string = this.translateService.instant('card.hiking-trail-form.edit-success');
          this.alertManagerService.alertSuccess(message);

          this.eventBusService.refreshHikingTrail();
          this.router.navigate(['/hiking-trail', this.data.code]);
          this.close();
        },
        error: (error) => {
          this.alertManagerService.manageError(error);
        }
      });
  }

  private combineDates(date: Date, time: Date): Date {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return combined;
  }

  onSelectedImages(files: File[]): void {
    this.editHikingTrailForm.patchValue({ images: files });
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

}
