export interface Comment {
  code: string;
  accountCode: string;
  commentText: string;
  createdAt: Date;
}

export interface CreateComment {
  hikingTrailCode: string;
  accountCode: string;
  commentText: string;
}
