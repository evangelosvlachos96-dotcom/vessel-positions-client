import axios from 'axios';
import type { IPositionsPage, IVesselTripSummary } from '../types/trip';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export const PAGE_SIZE = 50;

export const fetchTripSummaries = async (): Promise<IVesselTripSummary[]> => {
  const { data } = await api.get<IVesselTripSummary[]>('/positions/trips');
  return data;
};

export const fetchTripPositions = async (
  vesselId: number,
  offset: number,
  limit = PAGE_SIZE,
): Promise<IPositionsPage> => {
  const { data } = await api.get<IPositionsPage>(
    `/positions/trips/${vesselId}/positions`,
    { params: { limit, offset } },
  );
  return data;
};
