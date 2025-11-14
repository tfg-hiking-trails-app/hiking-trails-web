import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { finalize, forkJoin, Observable, switchMap, tap } from 'rxjs';

import { DialogConfirmComponent } from '../../../../components/dialog-confirm/dialog-confirm.component';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { Account, AccountUpdate } from '../../../../interfaces/account/Account';
import { Gender } from '../../../../interfaces/account/Gender';
import { CitySummary } from '../../../../interfaces/location/City';
import { CountrySummary } from '../../../../interfaces/location/Country';
import { StateSummary } from '../../../../interfaces/location/State';
import { AccountService } from '../../../../services/account.service';
import { AlertManagerService } from '../../../../services/alert-manager.service';
import { AuthService } from '../../../../services/auth.service';
import { isEmptyCode } from '../../../../Utils/Utils';
import { UploadProfileImageComponent } from './upload-profile-image/upload-profile-image.component';

@Component({
  selector: 'app-profile-settings',
  imports: [
    FormsModule,
    LoadingSpinnerComponent,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe,
    UploadProfileImageComponent,
  ],
  templateUrl: './profile-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent {
  accountUpdate: AccountUpdate | null = null;
  cities = signal<CitySummary[]>([]);
  countries = signal<CountrySummary[]>([]);
  editProfileInfoForm: FormGroup;
  enableCitySelect = signal<boolean>(false);
  enableStateSelect = signal<boolean>(false);
  genders = signal<Gender[]>([]);
  isLoading = signal<boolean>(true);
  states = signal<StateSummary[]>([]);
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
      countryCode: this.editProfileInfoControls['country'].value,
      stateCode: this.editProfileInfoControls['state'].value,
      cityCode: this.editProfileInfoControls['city'].value,
      biography: this.editProfileInfoControls['biography'].value,
      dateOfBirth: formatDate(this.editProfileInfoControls['dateOfBirth'].value, 'yyyy-MM-dd', 'en-US'),
      weight: this.editProfileInfoControls['weight'].value,
      height: this.editProfileInfoControls['height'].value
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

  resetForm(): void {
    this.loadUserData();
  }

  onSelectCountry(): void {
    const countryId = this.editProfileInfoControls['country'].value;

    if (!countryId) {
      this.editProfileInfoControls['state'].disable();
      this.editProfileInfoControls['city'].disable();
      return;
    }

    this.loadStates(countryId);
  }

  onSelectState(): void {
    const stateId = this.editProfileInfoControls['state'].value;

    if (!stateId) {
      this.editProfileInfoControls['city'].disable();
      return;
    }

    this.loadCities(stateId);
  }

  private loadUserData(): void {
    this.accountService
      .getLogged()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((account: Account) => {
            this.editProfileInfoForm.patchValue({
              gender: account.gender?.code,
              firstName: account.firstName,
              lastName: account.lastName,
              country: account.countryCode,
              state: account.stateCode,
              city: account.cityCode,
              biography: account.biography,
              dateOfBirth: account.dateOfBirth,
              weight: account.weight,
              height: account.height
            });

            if (!isEmptyCode(account.countryCode)) {
              this.editProfileInfoControls['state'].enable();
              this.loadStates(account.countryCode!);
            }

            if (!isEmptyCode(account.stateCode)){
              this.editProfileInfoControls['city'].enable();
              this.loadCities(account.stateCode!);
            }

            this.accountUpdate = {
              ...this.editProfileInfoForm.getRawValue(),
              username: account.username
            } as AccountUpdate;
          }),
          switchMap(() => forkJoin([
            this.loadGenders(),
            this.loadCountries()
          ])),
          finalize(() => this.isLoading.set(false))
        ).subscribe();
  }

  private loadGenders(): Observable<Gender[]> {
    return this.accountService
      .getAllGenders()
        .pipe(
        tap((genders: Gender[]) => {
          this.genders.set([
            {
              code: null,
              genderValue: 'prefer-not-to-say'
            },
            ...genders
          ]);
        })
      );
  }

  private loadCountries(): Observable<CountrySummary[]> {
    return this.accountService
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
      );
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
