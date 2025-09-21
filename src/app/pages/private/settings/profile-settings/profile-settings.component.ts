import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';

import { Account, AccountUpdate } from '../../../../interfaces/account/Account';
import { AccountService } from '../../../../services/account.service';
import { AlertManagerService } from '../../../../services/alert-manager.service';
import { AuthService } from '../../../../services/auth.service';
import { CitySummary } from '../../../../interfaces/account/City';
import { CountrySummary } from '../../../../interfaces/account/Country';
import { DialogConfirmComponent } from '../../../../components/dialog-confirm/dialog-confirm.component';
import { Gender } from '../../../../interfaces/account/Gender';
import { StateSummary } from '../../../../interfaces/account/State';
import { UploadProfileImageComponent } from './upload-profile-image/upload-profile-image.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  countries = signal<CountrySummary[]>([]);
  states = signal<StateSummary[]>([]);
  enableStateSelect = signal<boolean>(false);
  cities = signal<CitySummary[]>([]);
  enableCitySelect = signal<boolean>(false);
  submitted: boolean = false;

  private accountCode: string | null = null;

  constructor(
    private accountService: AccountService,
    private alertManagerService: AlertManagerService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.editProfileInfoForm = this.formBuilder.group({
      gender: ['', []],
      firstName: ['', []],
      lastName: ['', []],
      country: ['', []],
      state: [{ value: '', disabled: true }, []],
      city: [{ value: '', disabled: true }, []],
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

    this.loadUserData();
    this.loadGenders();
    this.loadCountries();
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
      countryCode: this.editProfileInfoControls['country'].value.code,
      stateCode: this.editProfileInfoControls['state'].value.code,
      cityCode: this.editProfileInfoControls['city'].value.code,
      biography: this.editProfileInfoControls['biography'].value,
      dateOfBirth: formatDate(this.editProfileInfoControls['dateOfBirth'].value, 'yyyy-MM-dd', 'en-US'),
      weight: this.editProfileInfoControls['weight'].value,
      height: this.editProfileInfoControls['height'].value,
      private: this.editProfileInfoControls['privateProfile'].value
    };

    console.log(this.accountUpdate);

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

  resetForm(): void {
    this.loadUserData();
  }

  onSelectCountry(): void {
    const countryId = this.editProfileInfoControls['country'].value;

    this.loadStates(countryId);
  }

  onSelectState(): void {
    const stateId = this.editProfileInfoControls['state'].value;

    this.loadCities(stateId);
  }

  private loadUserData(): void {
    this.accountService
      .getLogged()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((account: Account) => {
            if (account.country) {
              this.editProfileInfoControls['state'].enable();
            }
            if (account.state) {
              this.editProfileInfoControls['city'].enable();
            }

            this.editProfileInfoForm.patchValue({
              gender: account.gender?.code,
              firstName: account.firstName,
              lastName: account.lastName,
              country: account.country?.code,
              state: account.state?.code,
              city: account.city?.code,
              biography: account.biography,
              dateOfBirth: account.dateOfBirth,
              weight: account.weight,
              height: account.height,
              privateProfile: account.private
            });

            if (account.country?.code)
              this.loadStates(account.country.code);

            if (account.state?.code)
              this.loadCities(account.state.code);

            this.accountUpdate = {
              ...this.editProfileInfoForm.value,
              genderCode: account.gender?.code,
              username: account.username
            } as AccountUpdate;
          })
        ).subscribe();
  }

  private loadGenders(): void {
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

  private loadCountries(): void {
    this.accountService
      .getAllCountriesSummary()
        .pipe(
        tap((countries: CountrySummary[]) => {
          this.countries.set([
            {
              code: null,
              name: this.translateService.instant('settings.profile.none')
            },
            ...countries
          ]);
        })
      ).subscribe();
  }

  private loadStates(countryCode: string): void {
    this.accountService
      .getStatesByCountrySummary(countryCode)
        .pipe(
        tap((states: StateSummary[]) => {
          this.states.set([
            {
              code: null,
              name: this.translateService.instant('settings.profile.none')
            },
            ...states
          ]);
          this.editProfileInfoControls['state'].enable();
        })
      ).subscribe();
  }

  private loadCities(stateCode: string): void {
    this.accountService
      .getCitiesByStateSummary(stateCode)
        .pipe(
        tap((cities: CitySummary[]) => {
          this.cities.set([
            {
              code: null,
              name: this.translateService.instant('settings.profile.none')
            },
            ...cities
          ]);
          this.editProfileInfoControls['city'].enable();
        })
      ).subscribe();
  }

}
