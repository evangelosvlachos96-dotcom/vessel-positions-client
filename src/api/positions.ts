import axios from 'axios';
import type {
  ICreatePositionInput,
  ICreatePositionsResult,
} from '../types/interfaces';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export const createPositions = async (
  payload: ICreatePositionInput[],
): Promise<ICreatePositionsResult> => {
  const { data } = await api.post<ICreatePositionsResult>('/positions', payload);
  return data;
};

export interface ICreatePositionsFailure {
  errors: { index: number; reasons: string[] }[];
  generalMessages: string[];
}

export const parseCreatePositionsFailure = (
  error: unknown,
): ICreatePositionsFailure => {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return {
      errors: [],
      generalMessages: [
        error instanceof Error ? error.message : 'Request failed',
      ],
    };
  }

  const data = error.response.data as Record<string, unknown>;
  const payload =
    typeof data.message === 'object' && data.message !== null && !Array.isArray(data.message)
      ? (data.message as Record<string, unknown>)
      : data;

  const errors = Array.isArray(payload.errors)
    ? (payload.errors as { index: number; reasons: string[] }[])
    : [];

  const generalMessages: string[] = [];
  if (typeof payload.errorMessage === 'string') {
    generalMessages.push(payload.errorMessage);
  } else if (typeof data.message === 'string') {
    generalMessages.push(data.message);
  }

  return { errors, generalMessages };
};

export const createPosition = async (
  payload: ICreatePositionInput,
): Promise<ICreatePositionsResult> => createPositions([payload]);
