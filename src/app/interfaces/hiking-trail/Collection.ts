export interface Collection {
  code: string;
  accountCode: string;
  name: string;
  isDefault: boolean;
  trailCount: number;
  createdAt?: Date;
}

export interface CreateCollection {
  name: string;
}

export interface UpdateCollection {
  name: string;
}
