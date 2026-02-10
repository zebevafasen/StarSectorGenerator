import { hashToUnit } from '../utils/rng';

export const findBaseNameFor = (label, predicate, maxAttempts = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const name = `TestName_${i}`;
    const value = hashToUnit(`0,0|${name}:${label}`);
    if (predicate(value)) return name;
  }
  return 'FallbackName';
};

export const makeSystem = (name, overrides = {}) => ({
  name: `${name} System`,
  star: {
    name: `${name} Major`,
    type: 'G Class',
    age: 5,
    ageUnit: 'B Years',
    ...(overrides.star || {})
  },
  bodies: overrides.bodies || [
    {
      name: `${name} Prime`,
      type: 'Terrestrial'
    }
  ],
  ...overrides
});
