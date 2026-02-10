import { describe, it, expect } from 'vitest';
import stationsData from '../data/stations.json';
import { generateStations } from './stationGeneration';

describe('stationGeneration', () => {
  it('returns at least one station when inhabited planets exist', () => {
    const stations = generateStations({
      seedBase: '0,0|StationSeed',
      hasInhabitedPlanet: true,
      stationsData
    });

    expect(stations.length).toBeGreaterThanOrEqual(1);
    expect(stations[0].name).toBeTypeOf('string');
    expect(stations[0].type).toBeTypeOf('string');
  });

  it('returns no stations for uninhabited systems', () => {
    const stations = generateStations({
      seedBase: '0,0|StationSeed',
      hasInhabitedPlanet: false,
      stationsData
    });

    expect(stations).toEqual([]);
  });
});
