export interface IPosition {
  id: number;
  vesselId: number;
  receivedTimeUtc: string;
  latitude: number;
  longitude: number;
}

export interface IVesselTrip {
  vesselId: number;
  positions: IPosition[];
}
