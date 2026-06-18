export interface IPosition {
  id: number;
  vesselId: number;
  receivedTimeUtc: string;
  latitude: number;
  longitude: number;
}

export interface IVesselTripSummary {
  vesselId: number;
  total: number;
  firstPosition: IPosition;
  lastPosition: IPosition;
}

export interface IPositionsPage {
  items: IPosition[];
  total: number;
  limit: number;
  offset: number;
}
