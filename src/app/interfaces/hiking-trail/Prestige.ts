export interface Prestige {
  code: string;
  receiverAccountCode: string;
  giverAccountCode: string;
}

export interface CreatePrestige {
  hikingTrailCode: string;
  receiverAccountCode: string;
  giverAccountCode: string;
}

export interface DeletePrestige {
  hikingTrailCode: string;
  receiverAccountCode: string;
  giverAccountCode: string;
}
