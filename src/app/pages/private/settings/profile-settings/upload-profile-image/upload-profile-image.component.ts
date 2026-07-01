import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  signal
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize, tap } from 'rxjs';

import { DialogConfirmComponent } from '../../../../../components/dialog-confirm/dialog-confirm.component';
import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';
import { Account } from '../../../../../interfaces/account/Account';
import { AccountService } from '../../../../../services/account.service';
import { AlertManagerService } from '../../../../../services/alert-manager.service';

@Component({
  selector: 'app-upload-profile-image',
  imports: [
    LoadingSpinnerComponent,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './upload-profile-image.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadProfileImageComponent implements OnDestroy {
  @Output() imageChanged = new EventEmitter<File | null>();

  isLoading = signal<boolean>(true);
  currentImageUrl = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  file: File | null = null;

  constructor(
    private accountService: AccountService,
    private alertManagerService: AlertManagerService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.accountService
      .getLogged()
      .pipe(
        tap((account: Account) => {
          if (account.profilePicture) {
            this.currentImageUrl.set(account.profilePicture);
            this.previewUrl.set(account.profilePicture);
          }
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.revokePreviewObjectUrl();
    this.previewUrl.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0)
      return;

    this.revokePreviewObjectUrl();
    this.file = input.files[0];
    this.previewUrl.set(URL.createObjectURL(this.file));
    this.imageChanged.emit(this.file);
  }

  removeFile(): void {
    if (this.file) {
      this.revokePreviewObjectUrl();
      this.file = null;
      this.previewUrl.set(this.currentImageUrl());
      this.imageChanged.emit(null);
      return;
    }

    if (!this.currentImageUrl())
      return;

    this.confirmAndDeleteProfilePicture();
  }

  private confirmAndDeleteProfilePicture(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('settings.profile.remove-image-confirmation'),
        message: this.translateService.instant('settings.profile.remove-image-message'),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed)
        return;

      this.deleteProfilePicture();
    });
  }

  private deleteProfilePicture(): void {
    this.accountService
      .deleteProfilePicture()
      .subscribe({
        next: () => {
          this.currentImageUrl.set(null);
          this.previewUrl.set(null);
          this.file = null;
          this.imageChanged.emit(null);

          this.alertManagerService.alertSuccess(
            this.translateService.instant('settings.profile.image-removed-successfully')
          );
        },
        error: (error) => this.alertManagerService.manageError(error)
      });
  }

  private revokePreviewObjectUrl(): void {
    const preview = this.previewUrl();

    if (preview && preview !== this.currentImageUrl())
      URL.revokeObjectURL(preview);
  }

}
