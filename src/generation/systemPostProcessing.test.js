import { describe, it, expect } from 'vitest';
import { postProcessSystems } from './systemPostProcessing';

describe('systemPostProcessing', () => {
  it('correctly coordinates multiple processing steps', () => {
    const rawSystems = {
      '0,0': {
        name: 'Test',
        star: { name: 'Test Star', type: 'G Class', age: 5, ageUnit: 'B Years' },
        bodies: [{ name: 'Test Prime', type: 'Terrestrial' }]
      }
    };

    const processed = postProcessSystems(rawSystems);
    const system = processed['0,0'];

    expect(system.stars).toBeDefined();
    expect(system.bodies[0].size).toBeDefined();
    expect(system.belts).toBeDefined();
    expect(system.stations).toBeDefined();
  });
});
