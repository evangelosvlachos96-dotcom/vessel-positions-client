/** Frontend-only: turn coordinates into a readable location label. */
export const formatCoordinates = (
  latitude: number,
  longitude: number,
): string => {
  const latHemisphere = latitude >= 0 ? 'N' : 'S';
  const lonHemisphere = longitude >= 0 ? 'E' : 'W';

  return `${Math.abs(latitude).toFixed(2)}°${latHemisphere}, ${Math.abs(longitude).toFixed(2)}°${lonHemisphere}`;
};

const getOceanRegion = (latitude: number, longitude: number): string => {
  const lat = latitude;
  const lon = longitude;

  if (lat > 66.5) return 'Arctic Ocean';
  if (lat < -66.5) return 'Southern Ocean';

  if (lon >= -85 && lon < -30 && lat >= 5 && lat <= 45) return 'North Atlantic';
  if (lon >= -60 && lon < -5 && lat >= -55 && lat < 5) return 'South Atlantic';
  if (lon >= -170 && lon < -60 && lat >= 5 && lat <= 70) return 'North Pacific';
  if (lon >= 120 && lon <= 180 && lat >= 5 && lat <= 70) return 'North Pacific';
  if (lon >= -180 && lon < -80 && lat >= -55 && lat < 5) return 'South Pacific';
  if (lon >= 100 && lon <= 180 && lat >= -55 && lat < 5) return 'South Pacific';
  if (lon >= 40 && lon < 120 && lat >= -30 && lat <= 30) return 'Indian Ocean';
  if (lon >= -10 && lon < 40 && lat >= 30 && lat <= 46) return 'Mediterranean Sea';
  if (lon >= 100 && lon < 130 && lat >= 0 && lat <= 45) return 'South China Sea';
  if (lon >= -90 && lon < -70 && lat >= 18 && lat <= 32) return 'Gulf of Mexico';
  if (lon >= -82 && lon < -60 && lat >= 20 && lat <= 32) return 'Caribbean Sea';

  return lat >= 0 ? 'Northern waters' : 'Southern waters';
};

export const getLocationFromCoordinates = (
  latitude: number,
  longitude: number,
): string => {
  const region = getOceanRegion(latitude, longitude);
  const coordinates = formatCoordinates(latitude, longitude);
  return `${region} · ${coordinates}`;
};
