import { describe, it, expect } from 'vitest';
import systemConfig from '../data/system_generation_config.json';
import beltsData from '../data/belts.json';
import { generateBelts } from './beltGeneration';
import { findBaseNameFor } from './systemPostProcessingTestHelpers';

describe('beltGeneration', () => {
  it('adds a belt when belt roll succeeds', () => {
    const beltChance = systemConfig.BELTS?.chance ?? 0.35;
    const baseName = findBaseNameFor('has_belt', (value) => value < beltChance);

    const belts = generateBelts({
      seedBase: `0,0|${baseName}`,
      systemName: `${baseName} System`,
      beltsData
    });

    expect(belts.length).toBeGreaterThan(0);
    expect(belts[0].name).toContain(`${baseName} System`);
  });
});
