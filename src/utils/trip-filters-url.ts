import type { LocationQuery } from 'vue-router';
import type { ITripFilters } from '../types/interfaces';
import {
  DEFAULT_PAGE_LIMIT,
  PAGE_LIMIT_OPTIONS,
  emptyTripFilters,
} from './trip-filters';

const readQueryString = (value: LocationQuery[string]): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return Array.isArray(value) ? (value[0] ?? '') : value;
};

export const parseTripFiltersFromQuery = (query: LocationQuery): ITripFilters => {
  const defaults = emptyTripFilters();

  const vesselRaw = readQueryString(query.vessel);
  let vesselId: number | null = null;
  if (vesselRaw !== '') {
    const parsed = Number(vesselRaw);
    if (Number.isInteger(parsed) && parsed >= 1) {
      vesselId = parsed;
    }
  }

  const limitRaw = readQueryString(query.limit);
  let limit = defaults.limit;
  if (limitRaw !== '') {
    const parsed = Number(limitRaw);
    if (PAGE_LIMIT_OPTIONS.includes(parsed as (typeof PAGE_LIMIT_OPTIONS)[number])) {
      limit = parsed;
    }
  }

  return {
    vesselId,
    from: readQueryString(query.from),
    to: readQueryString(query.to),
    region: readQueryString(query.region),
    limit,
  };
};

export const parseOffsetsFromQuery = (query: LocationQuery): Record<number, number> => {
  const raw = readQueryString(query.offsets);
  if (raw === '') {
    return {};
  }

  const offsets: Record<number, number> = {};

  for (const part of raw.split(',')) {
    const [vesselPart, offsetPart] = part.split(':');
    const vesselId = Number(vesselPart);
    const offset = Number(offsetPart);

    if (
      Number.isInteger(vesselId) &&
      vesselId >= 1 &&
      Number.isInteger(offset) &&
      offset >= 0
    ) {
      offsets[vesselId] = offset;
    }
  }

  return offsets;
};

export const buildTripsQuery = (
  filters: ITripFilters,
  offsets: Record<number, number>,
): Record<string, string> => {
  const query: Record<string, string> = {};

  if (filters.vesselId !== null) {
    query.vessel = String(filters.vesselId);
  }

  if (filters.from !== '') {
    query.from = filters.from;
  }

  if (filters.to !== '') {
    query.to = filters.to;
  }

  if (filters.region !== '') {
    query.region = filters.region;
  }

  if (filters.limit !== DEFAULT_PAGE_LIMIT) {
    query.limit = String(filters.limit);
  }

  const offsetParts = Object.entries(offsets)
    .filter(([, offset]) => offset > 0)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([vesselId, offset]) => `${vesselId}:${offset}`);

  if (offsetParts.length > 0) {
    query.offsets = offsetParts.join(',');
  }

  return query;
};
