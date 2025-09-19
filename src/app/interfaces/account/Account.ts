import { Gender } from "./Gender";

export interface Account {
  code: string;
  gender?: Gender;
  username: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  biography?: string;
  dateOfBirth?: Date;
  weight?: number;
  height?: number;
  private?: boolean;
  profilePicture?: string;
}

export interface AccountUpdate {
  genderCode?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  biography?: string;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  private?: boolean;
  profilePicture?: string;
  uploadImage?: File;
  removedImage?: boolean;
}
