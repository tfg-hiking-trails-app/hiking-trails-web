import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
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
    TranslatePipe,
],
  templateUrl: './hiking-trail-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HikingTrailCardComponent {
  @Input() hikingTrail!: HikingTrail;
  @Input() accountLoggedCode: string | null = null;

  constructor(
    private translateService: TranslateService
  ) { }

  getLocale(): string {
    return this.translateService.currentLang;
  }

  getDuration(): number {
    const startTime = new Date(this.hikingTrail.startTime);
    const endTime = new Date(this.hikingTrail.endTime);

    return new Date(endTime.getTime() - startTime.getTime())
      .getUTCHours();
  }

}
