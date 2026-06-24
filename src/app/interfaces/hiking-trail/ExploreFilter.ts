import { Filter } from "../common/Filter";

export type SortMode = 'newest' | 'most-prestigious' | 'longest';

export interface ExploreFilter {
  petFriendly?: boolean;
  difficultyLevelCode?: string;
  terrainTypeCode?: string;
  trailTypeCode?: string;
  sortMode: SortMode;
  filter: Filter;
}
