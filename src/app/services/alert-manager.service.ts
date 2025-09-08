import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { concatMap, Subject } from "rxjs";

type Alerts = 'success' | 'info' | 'warning' | 'error';

interface Alert {
  message: string;
  level: Alerts;
  config?: MatSnackBarConfig;
}

@Injectable({
  providedIn: 'root',
})
export class AlertManagerService {

  private readonly unknownErrorKey: string = 'errors.unknown-error';
  private snackBar = inject(MatSnackBar);
  private translateService= inject(TranslateService);
  private queue$ = new Subject<Alert>();

  constructor() {
    this.queue$
      .pipe(
        concatMap(item => {
          const ref = this.alert(item.message, item.level, item.config);
          return ref.afterDismissed();
        })
      ).subscribe();
  }

  manageError(error: HttpErrorResponse): void {
    let message: string | string[];

    switch (error.status) {
      case 0:
        message = 'errors.server-unreachable';
        break;
      case 400:
        message = this.extractErrorMessage(error);
        break;
      case 401:
        message = 'errors.unauthorized';
        break;
      case 403:
        message = 'errors.forbidden';
        break;
      case 404:
        message = 'errors.not-found';
        break;
      case 409:
        message = this.extractErrorMessage(error);
        break;
      case 500:
        message = 'errors.internal-server-error';
        break;
      default:
        message = this.unknownErrorKey;
        break;
    }

    if (Array.isArray(message))
      message.forEach(m => {
        const msg: string = this.translateService.instant(m) === m ? this.unknownErrorKey : m;
        this.alertQueue(this.translateService.instant(msg), 'error')
      });
    else {
      // Not existing translation
      if (this.translateService.instant(message) === message) {
        message = this.unknownErrorKey;
      }

      this.alertError(this.translateService.instant(message));
    }
  }

  alertQueue(message: string, level: Alerts = 'info', config?: MatSnackBarConfig): void {
    this.queue$.next({ message, level, config });
  }

  alert(message: string, level: Alerts = 'info', config?: MatSnackBarConfig) {
    const defaultConfig: MatSnackBarConfig = {
      duration: level === 'error' ? 6000 : 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    }

    return this.snackBar.open(message, this.translateService.instant('close'), { ...defaultConfig, ...config });
  }

  alertSuccess(message: string, config?: MatSnackBarConfig) {
    return this.alert(message, 'success', config);
  }

  alertInfo(message: string, config?: MatSnackBarConfig) {
    return this.alert(message, 'info', config);
  }

  alertWarning(message: string, config?: MatSnackBarConfig) {
    return this.alert(message, 'warning', config);
  }

  alertError(message: string, config?: MatSnackBarConfig) {
    return this.alert(message, 'error', config);
  }

  extractErrorMessage(error: HttpErrorResponse): string | string[] {
    const err = error.error;

    if (!err) {
      return this.unknownErrorKey;
    }

    if (typeof err === 'string') {
      return `errors.${this.formatErrorMessageToTranslate(err)}`;
    }

    if (typeof err.message === 'string') {
      return `errors.${this.formatErrorMessageToTranslate(err.message)}`;
    }

    if (err.errors && typeof err.errors === 'object') {
      const msgs: string[] = [];

      for (const key of Object.keys(err.errors)) {
        const v = err.errors[key];

        if (Array.isArray(v)) {
          for (const m of v) {
            if (typeof m === 'string') {
              msgs.push(`errors.${this.formatErrorMessageToTranslate(m)}`);
            }
          }
        } else if (typeof v === 'string') {
          msgs.push(`errors.${this.formatErrorMessageToTranslate(v)}`);
        }
      }

      return msgs;
    }

    return this.unknownErrorKey;
  }

  private formatErrorMessageToTranslate(msg: string) {
    return msg
        .toString()
        .normalize('NFD').replace(/\p{M}+/gu, '') // remove accents
        .toLowerCase()
        .replace(/[^\p{L}\s]+/gu, '') // remove special characters
        .trim()
        .replace(/\s+/g, '-') // replace spaces with dashes
        .replace(/^-|-$/g, ''); // remove leading and trailing dashes
  }

}
