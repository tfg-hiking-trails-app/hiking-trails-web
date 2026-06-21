import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  Output
} from '@angular/core';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Preview } from '../../interfaces/hiking-trail/Images';

@Component({
  selector: 'app-add-images',
  imports: [
    CommonModule,
    DragDropModule,
    MaterialModules,
    TranslatePipe
  ],
  templateUrl: './add-images.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddImagesComponent implements OnDestroy {

  errorUploadFile: string = '';
  files: File[] = [];
  isDragOver = false;
  previews: Preview[] = [];

  @Output() filesChange = new EventEmitter<File[]>();

  readonly maxSizeMB = 10;
  readonly allowedTypes = ['image/png', 'image/jpeg'];

  constructor(
    private translateService: TranslateService,
  ) {}

  ngOnDestroy(): void {
    for (const p of this.previews) {
      URL.revokeObjectURL(p.url);
    }
  }

  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDragOver = false;

    const dt = evt.dataTransfer;
    if (!dt)
      return;

    const dropped = Array.from(dt.files || []);
    this.handleFiles(dropped);
  }

  onFileInput(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    this.handleFiles(selected);
    input.value = '';
  }

  private handleFiles(files: File[]) {
    const accepted: File[] = [];

    for (const file of files) {
      if (this.isValidImage(file))
        accepted.push(file);
    }

    this.files = [...this.files, ...accepted];
    this.filesChange.emit(this.files);

    const newPreviews: Preview[] = accepted.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    this.previews = [...this.previews, ...newPreviews];
  }

  private isValidImage(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      this.errorUploadFile = this.translateService.instant('card.hiking-trail-form.error-file-not-supported');
      return false;
    }

    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.errorUploadFile = this.translateService.instant('card.hiking-trail-form.error-file-too-large', { maxSize: this.maxSizeMB });
      return false;
    }

    return true;
  }

  drop(event: CdkDragDrop<Preview[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

  moveItemInArray(this.previews, event.previousIndex, event.currentIndex);
    this.files = this.previews.map(p => p.file);
    this.filesChange.emit(this.files);
  }

  removePreview(previewToRemove: Preview): void {
    this.previews = this.previews.filter(p => p !== previewToRemove);
    this.files = this.files.filter(f => f !== previewToRemove.file);
    this.filesChange.emit(this.files);
    URL.revokeObjectURL(previewToRemove.url);
  }

 }
