import beltsData from '../data/belts.json';
import stationsData from '../data/stations.json';
import { generateBelts } from './beltGeneration';
import { processPlanetBodies } from './planetGeneration';
import { generateStations } from './stationGeneration';
import { appendCompanionStars } from './systemGeneration';
import { hashToUnit } from '../utils/rng';

export { hashToUnit };

export const postProcessSystems = (systems) =>
  Object.fromEntries(
    Object.entries(systems).map(([coords, system]) => {
      const stars = system.stars ? [...system.stars] : (system.star ? [system.star] : []);
      const seedBase = `${coords}|${system.baseName || system.name || system.star?.name || 'system'}`;

      const bodiesWithSize = processPlanetBodies({
        bodies: system.bodies,
        stars,
        seedBase
      });

      const starsWithCompanions = appendCompanionStars({
        stars,
        seedBase,
        baseStarName: system.star?.name || system.name,
        baseStarAgeUnit: system.star?.ageUnit
      });

      const hasInhabitedPlanet = bodiesWithSize?.some((planet) => planet.isInhabited);
      const stations = generateStations({
        seedBase,
        hasInhabitedPlanet,
        stationsData
      });
      const belts = generateBelts({
        seedBase,
        systemName: system.name,
        beltsData
      });

      return [
        coords,
        {
          ...system,
          stars: starsWithCompanions,
          bodies: bodiesWithSize || system.bodies,
          belts,
          stations
        }
      ];
    })
  );
