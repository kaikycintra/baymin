export type CrewLocation = "habitat" | "rover";

/** What the astronaut enters in the daily check-in. */
export interface CheckinValues {
  /** 1 to 10 */
  sleepQuality: number;
  /** 1 to 5 */
  stress: number;
  /** 1 to 5 */
  energy: number;
  /** "Low" | "Steady" | "Good" */
  mood: string;
}

export interface DemoPageProps {
  anomalyActive: boolean;
  location: CrewLocation;
  /** The props below are supplied by the simulator. They are optional so the pages still work standalone. */
  now?: Date;
  missionDay?: number;
  /** Day on the Mars surface (1 = landing day). Undefined while the crew is still in transit. */
  marsDay?: number;
  heartRate?: number;
  spo2?: number;
  co2Ppm?: number;
  /** Called when the astronaut saves the daily check-in, so it can be added to the shared health history. */
  onCheckin?: (values: CheckinValues) => void;
}