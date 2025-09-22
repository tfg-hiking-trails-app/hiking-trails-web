import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModules } from '@material/material.modules';
import { TranslatePipe } from '@ngx-translate/core';

import { Account } from '../../interfaces/account/Account';
import { AccountService } from '../../services/account.service';
import { getDefaultProfileImageUrl } from '../../Utils/Utils';
import { HikingTrail } from '../../interfaces/hiking-trail/HikingTrail';
import { HikingTrailService } from '../../services/hiking-trail.service';
import { Comment, CreateComment } from '../../interfaces/hiking-trail/Comment';
import { AuthService } from '../../services/auth.service';
import { finalize, tap } from 'rxjs';

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

  accounts = new Map<string, Account | null>();
  commentForm: FormGroup;
  hikingTrail = signal<HikingTrail | null>(null);
  submitted: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) hikingTrail: HikingTrail,
    private accountService: AccountService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private hikingTrailService: HikingTrailService,
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

  defaultProfileImage(gender: string): string {
    return getDefaultProfileImageUrl(gender);
  }

}
