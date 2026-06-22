import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertManagerService } from '../../services/alert-manager.service';
import { Collection } from '../../interfaces/hiking-trail/Collection';
import { CollectionService } from '../../services/collection.service';
import {
  CollectionFormDialogComponent,
  CollectionFormData
} from '../collection-form-dialog/collection-form-dialog.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-collections-panel',
  imports: [
    MaterialModules,
    TranslatePipe,
    RouterModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './collections-panel.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsPanelComponent implements OnInit {

  collections = signal<Collection[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private collectionService: CollectionService,
    private dialog: MatDialog,
    private alertManagerService: AlertManagerService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
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

  open(collection: Collection): void {
    this.router.navigate(['/collection', collection.code]);
  }

  create(): void {
    const data: CollectionFormData = { title: 'collections.create-title' };

    const ref = this.dialog.open(CollectionFormDialogComponent, { data, width: '420px' });

    ref.afterClosed().subscribe((name?: string) => {
      if (!name) {
        return;
      }

      this.collectionService.create({ name })
        .subscribe({
          next: (created: Collection) => {
            this.collections.update(prev => [...prev, created]);
            this.cdr.markForCheck();
          },
          error: (error) => this.alertManagerService.manageError(error)
        });
    });
  }

  rename(collection: Collection, event: Event): void {
    event.stopPropagation();

    const data: CollectionFormData = { title: 'collections.rename-title', name: collection.name };

    const ref = this.dialog.open(CollectionFormDialogComponent, { data, width: '420px' });

    ref.afterClosed().subscribe((name?: string) => {
      if (!name || name === collection.name) {
        return;
      }

      this.collectionService.rename(collection.code, { name })
        .subscribe({
          next: () => {
            this.collections.update(prev =>
              prev.map(c => c.code === collection.code ? { ...c, name } : c));
            this.cdr.markForCheck();
          },
          error: (error) => this.alertManagerService.manageError(error)
        });
    });
  }

  delete(collection: Collection, event: Event): void {
    event.stopPropagation();

    const ref = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('collections.delete-title'),
        message: this.translateService.instant('collections.delete-message', { name: collection.name }),
        focusCancel: true
      }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.collectionService.delete(collection.code)
        .subscribe({
          next: () => {
            this.collections.update(prev => prev.filter(c => c.code !== collection.code));
            this.collectionService.refreshSavedTrailCodes();
            this.alertManagerService.alertSuccess(this.translateService.instant('collections.delete-success'));
            this.cdr.markForCheck();
          },
          error: (error) => this.alertManagerService.manageError(error)
        });
    });
  }

}
