import { IPosition } from './position.interface';

export interface IPositionsPage {
  items: IPosition[];
  total: number;
  limit: number;
  offset: number;
}
