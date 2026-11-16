export type CrewLocation = "habitat" | "rover";

/** What the astronaut enters in the daily check-in. */
export interface CheckinValues {
  sleepQuality: number; // 1 to 10
  stress: number;       // 1 to 5
  energy: number;       // 1 to 5
  mood: string;         // "Low" | "Steady" | "Good"
}

export interface DemoPageProps {
  anomalyActive: boolean;
  location: CrewLocation;
  /** The props below are supplied by the simulator. They are optional so the pages still work standalone. */
  now?: Date;
  missionDay?: number;
  heartRate?: number;
  spo2?: number;
  co2Ppm?: number;
  onCheckin?: (values: CheckinValues) => void;
}
