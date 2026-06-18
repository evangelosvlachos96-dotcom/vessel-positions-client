import { IPosition } from './position.interface';

export interface IVesselTripSummary {
  vesselId: number;
  total: number;
  firstPosition: IPosition;
  lastPosition: IPosition;
}
