import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

export interface CollectionFormData {
  title: string;
  name?: string;
}

@Component({
  selector: 'app-collection-form-dialog',
  imports: [
    ReactiveFormsModule,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './collection-form-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionFormDialogComponent {

  nameControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(100)]
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CollectionFormData,
    private dialogRef: MatDialogRef<CollectionFormDialogComponent>
  ) {
    if (data.name) {
      this.nameControl.setValue(data.name);
    }
  }

  save(): void {
    if (this.nameControl.invalid) {
      this.nameControl.markAsTouched();
      return;
    }

    this.dialogRef.close(this.nameControl.value.trim());
  }

}
