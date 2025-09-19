import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModules } from '@material/material.modules';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';

import { AccountService } from '../../../../services/account.service';
import { Account, AccountUpdate } from '../../../../interfaces/account/Account';
import { AlertManagerService } from '../../../../services/alert-manager.service';
import { AuthService } from '../../../../services/auth.service';
import { Gender } from '../../../../interfaces/account/Gender';
import { UploadProfileImageComponent } from './upload-profile-image/upload-profile-image.component';
import { DialogConfirmComponent } from '../../../../components/dialog-confirm/dialog-confirm.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-profile-settings',
  imports: [
    FormsModule,
    MaterialModules,
    ReactiveFormsModule,
    UploadProfileImageComponent,
    TranslatePipe
  ],
  templateUrl: './profile-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent {
  editProfileInfoForm: FormGroup;
  accountUpdate: AccountUpdate | null = null;
  genders = signal<Gender[]>([]);
  countries = signal<string[]>(['Spain', 'Portugal', 'USA']); // TODO: API?
  states = signal<string[]>(['State 1', 'State 2']); // TODO: API?
  cities = signal<string[]>(['City 1', 'City 2']); // TODO: API?
  submitted: boolean = false;

  private accountCode: string | null = null;

  constructor(
    private alertManagerService: AlertManagerService,
    private accountService: AccountService,
    private authService: AuthService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.editProfileInfoForm = this.formBuilder.group({
      gender: ['', []],
      firstName: ['', []],
      lastName: ['', []],
      country: ['', []],
      state: ['', []],
      city: ['', []],
      biography: ['', [Validators.maxLength(500)]],
      dateOfBirth: ['', []],
      weight: ['', [Validators.min(1), Validators.max(500)]],
      height: ['', [Validators.min(1), Validators.max(300)]],
      privateProfile: [false, []]
    });

    this.accountCode = this.authService.getUserCode();

    if (!this.accountCode) {
      return;
    }

    this.accountService
      .getLogged()
        .pipe(
        tap((account: Account) => {
          this.editProfileInfoForm.patchValue({
            gender: account.gender?.code,
            firstName: account.firstName,
            lastName: account.lastName,
            country: account.country,
            state: account.state,
            city: account.city,
            biography: account.biography,
            dateOfBirth: account.dateOfBirth,
            weight: account.weight,
            height: account.height,
            privateProfile: account.private
          });

          this.accountUpdate = {
            ...this.editProfileInfoForm.value,
            genderCode: account.gender?.code,
            username: account.username
          } as AccountUpdate;
        })
      ).subscribe();

    this.accountService
      .getAllGenders()
        .pipe(
        tap((genders: Gender[]) => {
          this.genders.set([
            {
              genderValue: 'prefer-not-to-say',
              code: undefined
            },
            ...genders
          ]);
        })
      ).subscribe();
  }

  get editProfileInfoControls() {
    return this.editProfileInfoForm.controls;
  }

  onImageChange(file: File | null): void {
    this.accountUpdate = {
      ...this.accountUpdate,
      uploadImage: file || undefined
    };

    if (file === null && this.accountUpdate?.profilePicture) {
      this.accountUpdate.removedImage = true;
    }

    if (file) {
      this.accountUpdate.removedImage = false;
    }
  }

  saveChanges(): void {
    this.submitted = true;

    if (this.editProfileInfoForm.invalid)
      return;

    this.accountUpdate = {
      ...this.accountUpdate,
      firstName: this.editProfileInfoControls['firstName'].value,
      lastName: this.editProfileInfoControls['lastName'].value,
      genderCode: this.editProfileInfoControls['gender'].value,
      country: this.editProfileInfoControls['country'].value,
      state: this.editProfileInfoControls['state'].value,
      city: this.editProfileInfoControls['city'].value,
      biography: this.editProfileInfoControls['biography'].value,
      dateOfBirth: formatDate(this.editProfileInfoControls['dateOfBirth'].value, 'yyyy-MM-dd', 'en-US'),
      weight: this.editProfileInfoControls['weight'].value,
      height: this.editProfileInfoControls['height'].value,
      private: this.editProfileInfoControls['privateProfile'].value
    };

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('settings.profile.confirm-changes')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !this.accountCode || !this.accountUpdate)
        return;

      this.accountService
        .update(this.accountCode, this.accountUpdate)
        .subscribe({
          next: () => {
            this.submitted = false;
            const successMessage = this.translateService.instant('settings.profile.profile-updated-successfully');
            this.alertManagerService.alertSuccess(successMessage);
          },
          error: (error) => {
            this.submitted = false;
            this.alertManagerService.manageError(error);
          }
        });
    });
  }

}
