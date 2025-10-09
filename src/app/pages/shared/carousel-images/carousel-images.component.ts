import { ChangeDetectionStrategy, Component, HostListener, Input, signal } from '@angular/core';

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
  expandedImage: string | null = null;

  next(): void {
    this.index.update(i => (i + 1) % this.images.length);
  }

  prev(): void {
    this.index.update(i => (i - 1 + this.images.length) % this.images.length);
  }

  openImage(url: string) {
    this.expandedImage = url;
    console.log(url);
  }

  closeImage() {
    this.expandedImage = null;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeImage();
  }

}
