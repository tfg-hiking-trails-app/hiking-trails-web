export interface Lap {
  timestamp?: Date;
  startTime?: Date;
  totalElapsedTime?: number;
  totalTimerTime?: number;
  totalDistance?: number;
  totalCalories?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgCadence?: number;
  maxCadence?: number;
  avgPower?: number;
  maxPower?: number;
  totalAscent?: number;
  totalDescent?: number;
  intensity?: number;
  lapTrigger?: number;
  sport?: number;
  avgTemperature?: number;
  maxTemperature?: number;
  avgPace?: number; // s/km
  maxPace?: number; // s/km
}
