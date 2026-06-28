import { Filter } from "../common/Filter";

export type SortMode = 'newest' | 'most-prestigious' | 'longest';

export type DateRange = 'last-30-days' | 'last-3-months' | 'last-12-months' | 'any';

export interface ExploreFilter {
  petFriendly?: boolean;
  difficultyLevelCode?: string;
  terrainTypeCode?: string;
  trailTypeCode?: string;
  maxDistance?: number;
  maxElevationGain?: number;
  maxAltitude?: number;
  dateRange?: DateRange;
  sortMode: SortMode;
  filter: Filter;
}
