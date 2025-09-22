import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  signal,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { filter, finalize, tap } from 'rxjs';

import { Account } from '../../interfaces/account/Account';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { Comment, CreateComment } from '../../interfaces/hiking-trail/Comment';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { getDefaultProfileImageUrl } from '../../Utils/Utils';
import { HikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../services/hiking-trail.service';

@Component({
  selector: 'app-comments-card',
  imports: [
    FormsModule,
    MaterialModules,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: 'comments-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsCardComponent {

  @ViewChild('dialogComment', { static: true }) dialogComponentRef!: ElementRef;
  accounts = new Map<string, Account | null>();
  commentForm: FormGroup;
  hikingTrail = signal<HikingTrail | null>(null);
  submitted: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) hikingTrail: HikingTrail,
    private accountService: AccountService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CommentsCardComponent>,
    private formBuilder: FormBuilder,
    private hikingTrailService: HikingTrailService,
    private translateService: TranslateService,
  ) {
    this.hikingTrail.set(hikingTrail);
    this.commentForm = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(1)]]
    });

    hikingTrail.comments.forEach(comment => {
      this.accounts.set(comment.code, null);

      this.accountService
        .getByCode(comment.accountCode)
        .subscribe({
          next: (account: Account) => {
            this.accounts.set(comment.code, account);
            this.cdr.markForCheck();
          },
          error: () => {
            this.accounts.set(comment.code, null);
            this.cdr.markForCheck();
          }
        });
    });

    // Close the dialog when clicking outside
    this.dialogRef
      .backdropClick()
      .subscribe(() => this.close());

    // Close the dialog when pressing the Escape key
    this.dialogRef
      .keydownEvents()
        .pipe(
          filter(ev => ev.key === 'Escape')
        )
        .subscribe(() => this.close());
  }

  get commentControls() {
    return this.commentForm.controls;
  }

  addComment(): void {
    this.submitted = true;

    if (!this.commentForm.valid)
      return;

    const createComment: CreateComment = {
      hikingTrailCode: this.hikingTrail()?.code!,
      accountCode: this.authService.getUserCode()!,
      commentText: this.commentForm.value.comment
    };

    this.hikingTrailService.addComment(createComment)
      .pipe(
        tap((comment: Comment) => {
          this.hikingTrail.update(ht => {
            if (!ht) return ht;

            return {
              ...ht!,
              comments: [...ht!.comments, comment]
            } as HikingTrail;
          });
        }),
        tap((comment: Comment) => {
          this.accounts.set(comment.code, null);

          this.accountService
            .getByCode(comment.accountCode)
            .subscribe({
              next: (account: Account) => {
                this.accounts.set(comment.code, account);
                this.cdr.markForCheck();
              },
              error: () => {
                this.accounts.set(comment.code, null);
                this.cdr.markForCheck();
              }
            });
        }),
        finalize(() => {
          this.commentForm.reset();
          this.submitted = false;
        })
      )
      .subscribe();
  }

  deleteComment(commentCode: string): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.translateService.instant('comments.delete-comment-title'),
        message: this.translateService.instant('comments.delete-comment-message'),
        focusCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result)
        return;

      this.hikingTrailService
        .removeComment(commentCode)
        .subscribe({
          next: () => {
            this.hikingTrail.update(ht => {
              if (!ht) return ht;

              return {
                ...ht!,
                comments: ht!.comments.filter(c => c.code !== commentCode)
              } as HikingTrail;
            });
          },
          error: () => {
            this.cdr.markForCheck();
          }
        });
    });
  }

  defaultProfileImage(gender: string): string {
    return getDefaultProfileImageUrl(gender);
  }

  close(): void {
    const updated = { ...this.hikingTrail()!, comments: [...this.hikingTrail()!.comments] };
    this.dialogRef.close(updated);
  }

}
