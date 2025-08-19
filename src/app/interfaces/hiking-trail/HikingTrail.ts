import { DifficultyLevel } from "./DifficultyLevel";
import { TerrainType } from './TerrainType';
import { TrailType } from "./TrailType";

export interface HikingTrail {
  code: string;
  accountCode: string;
  difficultyLevel: DifficultyLevel;
  terrainType: TerrainType;
  trailType: TrailType,
  name: string;
  description: string;
  petFriendly: boolean;
  startTime: Date;
  endTime: Date;
  ubicationLatitude: number;
  ubicationLongitude: number;
  generatedByFitFile: boolean;
}
