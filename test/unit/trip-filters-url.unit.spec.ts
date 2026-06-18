import { describe, expect, it } from 'vitest';
import type { LocationQuery } from 'vue-router';
import {
  buildTripsQuery,
  parseOffsetsFromQuery,
  parseTripFiltersFromQuery,
} from '../../src/utils/trip-filters-url';
import { emptyTripFilters } from '../../src/utils/trip-filters';

describe('parseTripFiltersFromQuery', () => {
  it('returns defaults for an empty query', () => {
    expect(parseTripFiltersFromQuery({})).toEqual(emptyTripFilters());
  });

  it('parses valid vessel, dates, region, and limit', () => {
    const query: LocationQuery = {
      vessel: '5091',
      from: '2017-12-20',
      to: '2017-12-31',
      region: 'Caribbean Sea',
      limit: '25',
    };

    expect(parseTripFiltersFromQuery(query)).toEqual({
      vesselId: 5091,
      from: '2017-12-20',
      to: '2017-12-31',
      region: 'Caribbean Sea',
      limit: 25,
    });
  });

  it('ignores invalid vessel id and limit values', () => {
    const query: LocationQuery = {
      vessel: 'abc',
      limit: '999',
    };

    expect(parseTripFiltersFromQuery(query)).toMatchObject({
      vesselId: null,
      limit: 50,
    });
  });

  it('uses the first value when query params are arrays', () => {
    const query: LocationQuery = {
      vessel: ['5091', '4378'],
      region: ['Caribbean Sea', 'Indian Ocean'],
    };

    expect(parseTripFiltersFromQuery(query)).toMatchObject({
      vesselId: 5091,
      region: 'Caribbean Sea',
    });
  });
});

describe('parseOffsetsFromQuery', () => {
  it('returns an empty object when offsets are missing', () => {
    expect(parseOffsetsFromQuery({})).toEqual({});
  });

  it('parses vessel:offset pairs', () => {
    expect(parseOffsetsFromQuery({ offsets: '5091:10,4378:25' })).toEqual({
      5091: 10,
      4378: 25,
    });
  });

  it('skips malformed or invalid entries', () => {
    expect(parseOffsetsFromQuery({ offsets: '5091:10,bad,0:-1,4378:5' })).toEqual({
      5091: 10,
      4378: 5,
    });
  });
});

describe('buildTripsQuery', () => {
  it('omits default limit and zero offsets', () => {
    expect(buildTripsQuery(emptyTripFilters(), { 5091: 0 })).toEqual({});
  });

  it('serializes active filters and positive offsets', () => {
    const query = buildTripsQuery(
      {
        vesselId: 5091,
        from: '2017-12-20',
        to: '2017-12-31',
        region: 'Caribbean Sea',
        limit: 25,
      },
      { 5091: 10, 4378: 25 },
    );

    expect(query).toEqual({
      vessel: '5091',
      from: '2017-12-20',
      to: '2017-12-31',
      region: 'Caribbean Sea',
      limit: '25',
      offsets: '4378:25,5091:10',
    });
  });

  it('round-trips filters and offsets through parse helpers', () => {
    const filters = {
      vesselId: 5091,
      from: '2017-12-20',
      to: '',
      region: 'Caribbean Sea',
      limit: 100,
    };
    const offsets = { 5091: 50, 4378: 0 };

    const query = buildTripsQuery(filters, offsets);
    expect(parseTripFiltersFromQuery(query)).toEqual(filters);
    expect(parseOffsetsFromQuery(query)).toEqual({ 5091: 50 });
  });
});
