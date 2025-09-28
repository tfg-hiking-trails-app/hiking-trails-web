import { Account } from "../account/Account";
import { Comment } from "./Comment";
import { DifficultyLevel } from "./DifficultyLevel";
import { Images } from "./Images";
import { CreateMetrics, Metrics } from "./Metrics";
import { Prestige } from "./Prestige";
import { TerrainType } from './TerrainType';
import { TrailType } from "./TrailType";

export interface HikingTrail {
  code: string;
  accountCode: string;
  account?: Account;
  difficultyLevel: DifficultyLevel;
  terrainType: TerrainType;
  trailType: TrailType;
  name: string;
  description: string;
  petFriendly: boolean;
  startTime: Date;
  endTime: Date;
  locationLatitude: number;
  locationLongitude: number;
  generatedByFitFile: boolean;
  images: Images[];
  metrics: Metrics[];
  prestiges: Prestige[];
  comments: Comment[];
  productName?: string;
}

export interface CreateHikingTrail {
  accountCode: string;
  difficultyLevelCode?: string;
  terrainTypeCode?: string;
  trailTypeCode?: string;
  name: string;
  description?: string;
  petFriendly?: boolean;
  startTime: Date;
  endTime: Date;
  locationLatitude?: number;
  locationLongitude?: number;
  metrics: Partial<CreateMetrics>;
}
