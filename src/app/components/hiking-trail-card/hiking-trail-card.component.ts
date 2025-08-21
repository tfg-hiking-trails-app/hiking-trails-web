import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { HikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { CarouselImagesComponent } from '../../pages/shared/carousel-images/carousel-images.component';
import { ProfilePictureComponent } from '../../pages/shared/profile-picture/profile-picture.component';

@Component({
  selector: 'app-hiking-trail-card',
  imports: [
    CarouselImagesComponent,
    MaterialModules,
    ProfilePictureComponent,
    RouterModule,
    TranslatePipe,
],
  templateUrl: './hiking-trail-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HikingTrailCardComponent {
  @Input({ required: true }) hikingTrail!: HikingTrail;
  @Input({ required: true }) accountLoggedCode: string | null = null;

  constructor(
    private translateService: TranslateService,
  ) { }

  getLocale(): string {
    return this.translateService.currentLang;
  }

  getDistance(): number | null {
    if (this.hikingTrail.metrics.length === 0 || !this.hikingTrail.metrics[0].distance) {
      return null;
    }

    const kms = this.hikingTrail.metrics[0].distance / 1000;

    return Math.round(kms * 100) / 100;
  }

  getCalories(): number | null {
    if (this.hikingTrail.metrics.length === 0 || !this.hikingTrail.metrics[0].calories) {
      return null;
    }

    return this.hikingTrail.metrics[0].calories;
  }

  getDuration(): number {
    const startTime = new Date(this.hikingTrail.startTime);
    const endTime = new Date(this.hikingTrail.endTime);

    return new Date(endTime.getTime() - startTime.getTime())
      .getUTCHours();
  }

}
