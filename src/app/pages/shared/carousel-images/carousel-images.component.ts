import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { Images } from '../../../interfaces/hiking-trail/Images';

@Component({
  selector: 'app-carousel-images',
  imports: [],
  templateUrl: './carousel-images.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselImagesComponent {
  @Input({ required: true }) images: Images[] = [];
  index = signal<number>(0);

  next(): void {
    this.index.update(i => (i + 1) % this.images.length);
  }

  prev(): void {
    this.index.update(i => (i - 1 + this.images.length) % this.images.length);
  }
}
