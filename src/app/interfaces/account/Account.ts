import { Gender } from "./Gender";

export interface Account {
  code: string;
  gender?: Gender;
  username: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  stateCode?: string;
  cityCode?: string;
  biography?: string;
  dateOfBirth?: Date;
  weight?: number;
  height?: number;
  profilePicture?: string;
}

export interface AccountUpdate {
  genderCode?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  stateCode?: string;
  cityCode?: string;
  biography?: string;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  profilePicture?: string;
  uploadImage?: File;
  removedImage?: boolean;
}
