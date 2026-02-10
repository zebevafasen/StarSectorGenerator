// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import InspectorPanel from './InspectorPanel';

afterEach(() => {
  cleanup();
});

const baseSystem = {
  name: 'Aldos System',
  baseName: 'Aldos',
  star: {
    name: 'Aldos Major',
    type: 'G',
    age: 4.2,
    ageUnit: 'B Years'
  },
  stars: [
    {
      name: 'Aldos Major',
      type: 'G',
      age: 4.2,
      ageUnit: 'B Years'
    }
  ],
  globalLocation: { sectorQ: 0, sectorR: 0 },
  bodies: [
    {
      name: 'Prime',
      type: 'Terrestrial',
      size: 'Medium',
      isInhabited: true,
      namingStyle: 'suffix'
    }
  ],
  stations: [
    {
      name: 'Kerman Shipyard',
      type: 'Shipyard',
      description: 'Ship construction and refit station.'
    }
  ],
  belts: [
    {
      name: 'Aldos Asteroid',
      type: 'Asteroid Belt'
    }
  ]
};

describe('InspectorPanel', () => {
  it('renders selected system details and section counts', () => {
    render(
      <InspectorPanel
        gridSize={{ width: 8, height: 10 }}
        systems={{ '1,2': baseSystem }}
        selectedCoords={{ q: 1, r: 2 }}
        setSelectedCoords={() => {}}
      />
    );

    expect(screen.getByText('Aldos System')).toBeInTheDocument();
    expect(screen.getByText('Stars (1)')).toBeInTheDocument();
    expect(screen.getByText('Planets (1)')).toBeInTheDocument();
    expect(screen.getByText('Stations (1)')).toBeInTheDocument();
    expect(screen.getByText('Belts and Fields (1)')).toBeInTheDocument();
  });

  it('toggles section visibility', () => {
    render(
      <InspectorPanel
        gridSize={{ width: 8, height: 10 }}
        systems={{ '1,2': baseSystem }}
        selectedCoords={{ q: 1, r: 2 }}
        setSelectedCoords={() => {}}
      />
    );

    expect(screen.getByText('Aldos Prime')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Planets \(1\)/i }));
    expect(screen.queryByText('Aldos Prime')).not.toBeInTheDocument();
  });

  it('shows tooltip content for hovered station type', () => {
    render(
      <InspectorPanel
        gridSize={{ width: 8, height: 10 }}
        systems={{ '1,2': baseSystem }}
        selectedCoords={{ q: 1, r: 2 }}
        setSelectedCoords={() => {}}
      />
    );

    fireEvent.mouseEnter(screen.getByText('Shipyard'));

    expect(screen.getAllByText('Kerman Shipyard').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Ship construction and refit station.')).toBeInTheDocument();
  });
});
