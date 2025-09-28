export interface Metrics {
  code: string;
  distance: number;
  duration: number;
  steps: number;
  calories: number;
  averagePace: number;
  maxPace: number;
  elevationGain: number;
  elevationLoss: number;
  averageSpeed: number;
  maxSpeed: number;
  averageHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  averageCadence: number;
  maxCadence: number;
  maxAltitude: number;
  minAltitude: number;
  totalTrainingEffect: number;
  trainingStressScore: number;
}

export interface CreateMetrics {
  hikingTrailCode?: string;
  distance: number;
  duration?: number;
  steps?: number;
  calories?: number;
  averagePace?: number;
  maxPace?: number;
  elevationGain?: number;
  elevationLoss?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  averageCadence?: number;
  maxCadence?: number;
  maxAltitude?: number;
  minAltitude?: number;
}
