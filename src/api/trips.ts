import axios from 'axios';
import type { IPositionsPage, ITripFilters, IVesselTripSummary } from '../types/interfaces';
import { DEFAULT_PAGE_LIMIT, toApiDateRange } from '../utils/trip-filters';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export const fetchTripSummaries = async (): Promise<IVesselTripSummary[]> => {
  const { data } = await api.get<IVesselTripSummary[]>('/positions/trips');
  return data;
};

export const fetchTripPositions = async (
  vesselId: number,
  offset: number,
  filters: ITripFilters,
): Promise<IPositionsPage> => {
  const { data } = await api.get<IPositionsPage>(
    `/positions/trips/${vesselId}/positions`,
    {
      params: {
        limit: filters.limit || DEFAULT_PAGE_LIMIT,
        offset,
        ...toApiDateRange(filters),
      },
    },
  );
  return data;
};
