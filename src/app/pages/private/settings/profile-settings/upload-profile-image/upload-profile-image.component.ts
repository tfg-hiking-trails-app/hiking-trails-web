import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  signal
} from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, tap } from 'rxjs';

import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';
import { Account } from '../../../../../interfaces/account/Account';
import { AccountService } from '../../../../../services/account.service';

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
    private accountService: AccountService
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
    if (this.previewUrl() && this.previewUrl() !== this.currentImageUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }

    this.previewUrl.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0)
      return;

    this.file = input.files[0];
    this.previewUrl.set(URL.createObjectURL(this.file));
    this.imageChanged.emit(this.file);
  }

  removeFile(): void {
    this.file = null;
    this.imageChanged.emit(this.file);
  }

}
