import { Region } from "./Region";

export interface Subregion {
  code: string;
  name: string;
  translations?: string;
  regionId: number;
  region?: Region;
  flag: boolean;
  wikiDataId?: string;
}
