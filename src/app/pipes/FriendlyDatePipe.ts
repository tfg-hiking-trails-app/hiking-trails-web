import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
  name: "friendlyDate",
  standalone: true,
  pure: false
})
export class FriendlyDatePipe implements PipeTransform {

  constructor(
    private translate: TranslateService
  ) { }

  private getLocale(): string {
    const lang = (this.translate.currentLang || navigator.language);

    if (lang.startsWith('en')) {
      return 'en-GB';
    }

    return 'es-ES';
  }

  private sameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  transform(value: Date | string | number): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    const now = new Date();
    const locale = this.getLocale();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    if (this.sameDay(date, now)) {
      const time = new Intl.DateTimeFormat(locale, timeOptions).format(date);
      return this.translate.instant('date.today_at', { time });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (this.sameDay(date, yesterday)) {
      const time = new Intl.DateTimeFormat(locale, timeOptions).format(date);
      return this.translate.instant('date.yesterday_at', { time });
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const formattedDate = new Intl.DateTimeFormat(locale, dateOptions).format(date);
    const formattedTime = new Intl.DateTimeFormat(locale, timeOptions).format(date);

    return this.translate.instant('date.on_date_at', { date: formattedDate, time: formattedTime });
  }

}
