import { Country } from "./Country";

export interface State {
  code: string;
  name: string;
  countryId: number;
  country?: Country;
  countrCode: string;
  fipsCode?: string;
  iso2?: string;
  iso3166_2?: string;
  type?: string;
  level?: number;
  parentId?: number;
  native?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  flag: boolean;
  wikiDataId?: string;
}

export interface StateSummary {
  code: string | null;
  name: string;
}
