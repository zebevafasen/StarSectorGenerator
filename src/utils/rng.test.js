import { describe, it, expect } from 'vitest';
import { createRNG, stringToSeed, hashToUnit } from './rng';

describe('rng utils', () => {
  describe('createRNG', () => {
    it('produces deterministic values for the same seed', () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(12345);
      expect(rng1()).toBe(rng2());
      expect(rng1()).toBe(rng2());
    });

    it('produces values in [0, 1)', () => {
      const rng = createRNG(999);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('stringToSeed', () => {
    it('produces deterministic seed for the same string', () => {
      expect(stringToSeed('hello')).toBe(stringToSeed('hello'));
    });

    it('produces different seeds for different strings', () => {
      expect(stringToSeed('hello')).not.toBe(stringToSeed('world'));
    });
  });

  describe('hashToUnit', () => {
    it('produces deterministic unit hash in [0,1)', () => {
      const a = hashToUnit('sample-seed');
      const b = hashToUnit('sample-seed');

      expect(a).toBe(b);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(1);
    });
  });
});
