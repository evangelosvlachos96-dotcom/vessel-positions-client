import { describe, expect, it } from 'vitest';
import {
  OCEAN_REGION_NAMES,
  formatCoordinates,
  getLocationFromCoordinates,
} from '../../src/utils/location';

describe('formatCoordinates', () => {
  it('formats northern/eastern hemispheres', () => {
    expect(formatCoordinates(25.91658, 79.50869)).toBe('25.92°N, 79.51°E');
  });

  it('formats southern/western hemispheres', () => {
    expect(formatCoordinates(-25.91658, -79.50869)).toBe('25.92°S, 79.51°W');
  });
});

describe('getLocationFromCoordinates', () => {
  it('labels a sample position with region and coordinates', () => {
    expect(getLocationFromCoordinates(25.91658, -79.50869)).toBe(
      'North Atlantic · 25.92°N, 79.51°W',
    );
  });

  it('labels Mediterranean coordinates', () => {
    expect(getLocationFromCoordinates(35, 15)).toMatch(/^Mediterranean Sea ·/);
  });

  it('labels high-latitude points as Arctic', () => {
    expect(getLocationFromCoordinates(70, 0)).toMatch(/^Arctic Ocean ·/);
  });

  it('falls back to northern or southern waters outside known basins', () => {
    expect(getLocationFromCoordinates(10, 10)).toMatch(/^Northern waters ·/);
    expect(getLocationFromCoordinates(-10, 10)).toMatch(/^Southern waters ·/);
  });
});

describe('OCEAN_REGION_NAMES', () => {
  it('lists every region exactly once', () => {
    const unique = new Set(OCEAN_REGION_NAMES);
    expect(unique.size).toBe(OCEAN_REGION_NAMES.length);
  });
});
