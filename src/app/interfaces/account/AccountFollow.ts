import { Account } from "./Account";

export interface AccountFollow {
  code: string;
  followerAccount: Account;
  followedAccount: Account;
}
