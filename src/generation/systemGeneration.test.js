import { describe, it, expect } from 'vitest';
import systemConfig from '../data/system_generation_config.json';
import { appendCompanionStars } from './systemGeneration';
import { findBaseNameFor, makeSystem } from './systemPostProcessingTestHelpers';

describe('systemGeneration - appendCompanionStars', () => {
  it('adds companion stars when binary roll succeeds', () => {
    const binaryChance = systemConfig.MULTI_STAR?.binaryChance ?? 0.15;
    const baseName = findBaseNameFor('binary', (value) => value < binaryChance);
    const system = makeSystem(baseName, { bodies: [] });
    const seedBase = `0,0|${baseName}`;

    const stars = appendCompanionStars({
      stars: [system.star],
      seedBase,
      baseStarName: system.star.name,
      baseStarAgeUnit: system.star.ageUnit
    });

    expect(stars.length).toBeGreaterThanOrEqual(2);
    expect(stars[1].name).toMatch(new RegExp(`^${baseName} Major\\s`));
  });
});
