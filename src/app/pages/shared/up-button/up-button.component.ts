import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-up-button',
  imports: [],
  templateUrl: './up-button.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpButtonComponent {
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
