import { Country } from "./Country";
import { State } from "./State";

export interface City {
  code: string;
  name: string;
  stateId: number;
  state?: State;
  stateCode: string;
  countryId: number;
  country?: Country;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  flag: boolean;
  wikiDataId?: string;
}

export interface CitySummary {
  code: string | null;
  name: string;
}
