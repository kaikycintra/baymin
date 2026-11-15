export type CrewLocation = "habitat" | "rover";

export interface DemoPageProps {
  anomalyActive: boolean;
  location: CrewLocation;
  /** The props below are supplied by the simulator. They are optional so the pages still work standalone. */
  now?: Date;
  missionDay?: number;
  heartRate?: number;
  spo2?: number;
  co2Ppm?: number;
}
