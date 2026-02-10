// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSectorGenerator } from './useSectorGenerator';

const initialSettings = {
  pendingGridSize: { width: 4, height: 4 },
  densityMode: 'preset',
  densityPreset: 'standard',
  manualCount: 4,
  rangeLimits: { min: 2, max: 4 },
  seed: 'SMOKESEED',
  autoGenerateSeed: false
};

describe('useSectorGenerator seed reproducibility', () => {
  it('generates identical output for same seed and settings', () => {
    const outputs = [];
    const onGenerate = (systems, gridSize) => {
      outputs.push(JSON.stringify({ systems, gridSize }));
    };

    const { result } = renderHook(() => useSectorGenerator(onGenerate, initialSettings));

    act(() => {
      result.current.generate();
      result.current.generate();
    });

    expect(outputs).toHaveLength(2);
    expect(outputs[0]).toBe(outputs[1]);
  });

  it('changes output when seed changes', () => {
    const outputA = [];
    const outputB = [];

    const hookA = renderHook(() => useSectorGenerator((systems, gridSize) => {
      outputA.push(JSON.stringify({ systems, gridSize }));
    }, { ...initialSettings, seed: 'SMOKESEED_A' }));

    const hookB = renderHook(() => useSectorGenerator((systems, gridSize) => {
      outputB.push(JSON.stringify({ systems, gridSize }));
    }, { ...initialSettings, seed: 'SMOKESEED_B' }));

    act(() => {
      hookA.result.current.generate();
      hookB.result.current.generate();
    });

    expect(outputA[0]).not.toBe(outputB[0]);
  });
});
