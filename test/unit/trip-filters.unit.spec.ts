import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGE_LIMIT,
  emptyTripFilters,
  toApiDateRange,
} from '../../src/utils/trip-filters';

describe('emptyTripFilters', () => {
  it('returns empty filters with the default page limit', () => {
    expect(emptyTripFilters()).toEqual({
      vesselId: null,
      from: '',
      to: '',
      region: '',
      limit: DEFAULT_PAGE_LIMIT,
    });
  });
});

describe('toApiDateRange', () => {
  it('returns an empty object when no date or region filters are set', () => {
    expect(toApiDateRange(emptyTripFilters())).toEqual({});
  });

  it('expands date-only filters to full UTC day bounds', () => {
    expect(
      toApiDateRange({
        vesselId: null,
        from: '2017-12-20',
        to: '2017-12-31',
        region: '',
        limit: DEFAULT_PAGE_LIMIT,
      }),
    ).toEqual({
      from: '2017-12-20T00:00:00.000Z',
      to: '2017-12-31T23:59:59.999Z',
    });
  });

  it('includes region when provided', () => {
    expect(
      toApiDateRange({
        vesselId: 5091,
        from: '',
        to: '',
        region: 'Caribbean Sea',
        limit: 25,
      }),
    ).toEqual({ region: 'Caribbean Sea' });
  });
});
