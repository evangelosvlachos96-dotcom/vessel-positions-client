export interface ICreatePositionInput {
  vesselId: number;
  receivedTimeUtc: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface ICreatePositionError {
  index: number;
  reasons: string[];
}

export interface ICreatePositionsResult {
  received: number;
  inserted: number;
  duplicates: number;
  rejected: number;
  errors: ICreatePositionError[];
}
