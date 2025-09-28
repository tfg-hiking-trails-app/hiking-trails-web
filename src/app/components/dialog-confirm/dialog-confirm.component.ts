import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

interface Data {
  title: string;
  message: string;
  focusCancel?: boolean;
}

@Component({
  imports: [
    CommonModule,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './dialog-confirm.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmComponent {

  constructor (
    @Inject(MAT_DIALOG_DATA)
    public data: Data
  ) {}

  public deleteConfirmed(): boolean {
    return true;
  }

  get focusCancel(): boolean {
    return !!this.data.focusCancel;
  }

}
