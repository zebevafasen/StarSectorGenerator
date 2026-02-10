import { describe, it, expect } from 'vitest';
import { pickAtmosphereName, pickTemperatureName } from './environmentData';

describe('environmentData pickers', () => {
  it('respects allowed names even when weights are zero', () => {
    const atmosphere = pickAtmosphereName('seed-atm', {
      Breathable: 0,
      Toxic: 0,
      Corrosive: 0,
      Thin: 0,
      Dense: 0
    }, ['Toxic', 'Corrosive']);

    const temperature = pickTemperatureName('seed-temp', {
      Temperate: 0,
      Cold: 0,
      Hot: 0,
      Frozen: 0,
      Scorching: 0
    }, ['Hot', 'Scorching']);

    expect(['Toxic', 'Corrosive']).toContain(atmosphere);
    expect(['Hot', 'Scorching']).toContain(temperature);
  });
});
