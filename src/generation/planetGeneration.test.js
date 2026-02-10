import { describe, it, expect } from 'vitest';
import { processPlanetBodies } from './planetGeneration';
import { makeSystem } from './systemPostProcessingTestHelpers';

describe('planetGeneration', () => {
  it('adds sizes, guarantees habitable candidate conversion, and marks at least one inhabited planet', () => {
    const baseName = 'CoreTest';
    const system = makeSystem(baseName);

    const bodies = processPlanetBodies({
      bodies: system.bodies,
      stars: [system.star],
      seedBase: `0,0|${baseName}`,
      systemName: system.name
    });

    expect(bodies).toHaveLength(1);
    expect(bodies[0].size).toBeTypeOf('string');
    expect(bodies[0].atmosphere).toBeTypeOf('string');
    expect(bodies[0].temperature).toBeTypeOf('string');
    expect(typeof bodies[0].habitabilityRate).toBe('number');
    expect(bodies[0].type).not.toBe('Gas Giant');
    expect(bodies[0].isInhabited).toBe(true);
  });

  it('never marks 0% habitability planets as inhabited', () => {
    const system = makeSystem('VoidTest', {
      star: {
        name: 'VoidTest Major',
        type: 'Black Hole',
        age: 1,
        ageUnit: 'M Years'
      },
      bodies: [{ name: 'I', type: 'Gas Giant' }]
    });

    const bodies = processPlanetBodies({
      bodies: system.bodies,
      stars: [system.star],
      seedBase: '0,0|VoidTest',
      systemName: system.name
    });

    expect(bodies).toHaveLength(1);
    expect(bodies[0].habitabilityRate).toBe(0);
    expect(bodies[0].isInhabited).not.toBe(true);
  });
});
