import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  signal
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertManagerService } from '../../services/alert-manager.service';
import { Collection } from '../../interfaces/hiking-trail/Collection';
import { CollectionService } from '../../services/collection.service';
import {
  CollectionFormDialogComponent,
  CollectionFormData
} from '../collection-form-dialog/collection-form-dialog.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

export interface SaveToCollectionData {
  hikingTrailCode: string;
  trailName?: string;
}

@Component({
  selector: 'app-save-to-collection-dialog',
  imports: [
    MaterialModules,
    TranslatePipe,
    LoadingSpinnerComponent
  ],
  templateUrl: './save-to-collection-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveToCollectionDialogComponent implements OnInit {

  collections = signal<Collection[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SaveToCollectionData,
    private dialogRef: MatDialogRef<SaveToCollectionDialogComponent>,
    private collectionService: CollectionService,
    private dialog: MatDialog,
    private alertManagerService: AlertManagerService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.loading.set(true);

    this.collectionService.getLogged()
      .subscribe({
        next: (collections: Collection[]) => {
          this.collections.set(collections);
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.alertManagerService.manageError(error);
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  select(collection: Collection): void {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);

    this.collectionService.addTrail(collection.code, this.data.hikingTrailCode)
      .subscribe({
        next: () => {
          const message = this.translateService.instant('collections.saved-success', { name: collection.name });
          this.alertManagerService.alertSuccess(message);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.saving.set(false);

          if (error?.status === 409) {
            this.alertManagerService.alertInfo(this.translateService.instant('collections.already-in-collection'));
          } else {
            this.alertManagerService.manageError(error);
          }

          this.cdr.markForCheck();
        }
      });
  }

  createNew(): void {
    const formData: CollectionFormData = { title: 'collections.create-title' };

    const ref = this.dialog.open(CollectionFormDialogComponent, {
      data: formData,
      width: '420px'
    });

    ref.afterClosed().subscribe((name?: string) => {
      if (!name) {
        return;
      }

      this.collectionService.create({ name })
        .subscribe({
          next: (created: Collection) => {
            this.collections.update(prev => [...prev, created]);
            this.cdr.markForCheck();
            this.select(created);
          },
          error: (error) => this.alertManagerService.manageError(error)
        });
    });
  }

}
