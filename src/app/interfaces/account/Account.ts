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
