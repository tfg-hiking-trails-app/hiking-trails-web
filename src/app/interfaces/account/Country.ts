import { Region } from "./Region";
import { Subregion } from "./Subregion";

export interface Country {
  id: number;
  code: string;
  name: string;
  iso3?: string;
  numericCode?: string;
  iso2?: string;
  phoneCode?: string;
  capital?: string;
  currency?: string;
  currencyName?: string;
  currencySymbol?: string;
  tld?: string;
  native?: string;
  region?: string;
  regionId?: number;
  regionEntity?: Region;
  subregion?: string;
  subregionId?: number;
  subregionEntity?: Subregion;
  nationality?: string;
  timezones?: string;
  translations?: string;
  latitude?: number;
  longitude?: number;
  emoji?: string;
  emojiU?: string;
  flag: boolean;
  wikiDataId?: string;
}

export interface CountrySummary {
  code: string | null;
  name: string;
}
