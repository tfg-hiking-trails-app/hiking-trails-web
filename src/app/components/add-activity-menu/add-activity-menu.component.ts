import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { AlertManagerService } from '../../services/alert-manager.service';
import { HikingTrailService } from '../../services/hiking-trail.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { AddActivityManuallyCardComponent } from '../add-activity-manually-card/add-activity-manually-card.component';
import { getWindowWidth } from '../../Utils/Utils';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-add-activity-menu',
  imports: [
    LoadingSpinnerComponent,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './add-activity-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddActivityMenuComponent {

  isUploading = signal<boolean>(false);

  constructor(
    private alertManagerService: AlertManagerService,
    private dialog: MatDialog,
    private hikingTrailService: HikingTrailService,
    private router: Router,
    private translateService: TranslateService,
  ) { }

  openAddActivityManuallyDialog(): void {
    this.dialog.open(AddActivityManuallyCardComponent, {
      width: getWindowWidth(),
      maxHeight: '80vh'
    });
  }

  uploadFitFile(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      input.value = '';
      return;
    }

    const file = input.files[0];

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('navbar.add-activity-menu.confirm-upload-fit-file'),
        message: file.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        input.value = '';
        return;
      }

      this.isUploading.set(true);

      this.hikingTrailService.uploadFitFile(file)
        .pipe(
          finalize(() => {
            this.isUploading.set(false);
            input.value = '';
          })
        )
        .subscribe({
          next: (code: string) => {
            const message = this.translateService.instant('navbar.add-activity-menu.hiking-trail-climbed-correctly');
            this.alertManagerService.alertSuccess(message);

            this.router.navigate(['/hiking-trail', code]);
          },
          error: (error) => {
            this.alertManagerService.manageError(error);
          }
        });
    });
  }

}
