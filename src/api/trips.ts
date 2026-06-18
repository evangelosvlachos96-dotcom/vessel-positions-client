import axios from 'axios';
import type { IVesselTrip } from '../types/trip';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export const fetchTrips = async (): Promise<IVesselTrip[]> => {
  const { data } = await api.get<IVesselTrip[]>('/positions/trips');
  return data;
};
