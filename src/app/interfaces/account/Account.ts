import { CitySummary } from "./City";
import { CountrySummary } from "./Country";
import { Gender } from "./Gender";
import { StateSummary } from "./State";

export interface Account {
  code: string;
  gender?: Gender;
  username: string;
  firstName?: string;
  lastName?: string;
  country?: CountrySummary;
  state?: StateSummary;
  city?: CitySummary;
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
