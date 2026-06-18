import type { ITripFilters } from '../types/interfaces';

export const DEFAULT_PAGE_LIMIT = 50;

export const PAGE_LIMIT_OPTIONS = [25, 50, 100, 200] as const;

export const emptyTripFilters = (): ITripFilters => ({
  vesselId: null,
  from: '',
  to: '',
  region: '',
  limit: DEFAULT_PAGE_LIMIT,
});

export const toApiDateRange = (
  filters: ITripFilters,
): { from?: string; to?: string; region?: string } => {
  const params: { from?: string; to?: string; region?: string } = {};

  if (filters.from) {
    params.from = `${filters.from}T00:00:00.000Z`;
  }

  if (filters.to) {
    params.to = `${filters.to}T23:59:59.999Z`;
  }

  if (filters.region) {
    params.region = filters.region;
  }

  return params;
};
