import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HEX_SIZE, HEX_HEIGHT, SIDEBAR_WIDTH } from './constants';
import GeneratorPanel from './components/GeneratorPanel';
import InspectorPanel from './components/InspectorPanel';
import StarMap from './components/StarMap';
import namesData from './data/names.json';
import planetSizes from './data/planet_sizes.json';
import { getPlanetByType } from './utils/planetUtils.js';
import starsData from './data/stars.json';
import systemConfig from './data/system_generation_config.json';
import beltsData from './data/belts.json';
import stationsData from './data/stations.json';
import { DEFAULT_GENERATOR_SETTINGS } from './hooks/useSectorGenerator';

// --- Constants & Data Models ---

const ADDITIONAL_STAR_TYPES = ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'Neutron', 'Black Hole'];
const MULTI_STAR_SUFFIXES = [
  namesData?.GREEK_LETTERS?.[1] || 'B',
  namesData?.GREEK_LETTERS?.[2] || 'G'
];

const hashToUnit = (text) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967296;
};

const getRandomPlanetSize = (seed, planetType) => {
  const planetData = getPlanetByType(planetType);
  const sizeModifiers = planetData?.data?.sizeModifier || {};

  // Create a new set of weights for this planet type, filtering out zero-weight sizes
  const weightedSizes = planetSizes
    .map(size => ({
      name: size.name,
      // Use the base weight and multiply by the type-specific modifier. Default modifier is 1.0.
      weight: (size.weight || 0) * (sizeModifiers[size.name] ?? 1.0)
    }))
    .filter(size => size.weight > 0);

  // If no sizes are possible (e.g. all modifiers are 0), fallback to Medium.
  if (weightedSizes.length === 0) {
    return "Medium";
  }

  const totalWeight = weightedSizes.reduce((sum, size) => sum + size.weight, 0);

  let value = hashToUnit(seed) * totalWeight;
  for (const size of weightedSizes) {
    value -= size.weight;
    if (value <= 0) {
      return size.name;
    }
  }

  // Fallback to the last possible size in case of floating point issues
  return weightedSizes[weightedSizes.length - 1].name;
};

export default function App() {
  // Load session from localStorage on mount
  const [initialSession] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('ssg_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load session", e);
      return null;
    }
  });

  const initialGeneratorSettings = useMemo(() => {
    const saved = initialSession?.generatorSettings || {};
    return {
      ...DEFAULT_GENERATOR_SETTINGS,
      ...saved,
      pendingGridSize: {
        ...DEFAULT_GENERATOR_SETTINGS.pendingGridSize,
        ...(saved.pendingGridSize || initialSession?.gridSize || {})
      },
      rangeLimits: {
        ...DEFAULT_GENERATOR_SETTINGS.rangeLimits,
        ...(saved.rangeLimits || {})
      }
    };
  }, [initialSession]);

  // Settings State
  const [gridSize, setGridSize] = useState(initialSession?.gridSize || { width: 8, height: 10 });
  const [generatorSettings, setGeneratorSettings] = useState(initialGeneratorSettings);
  
  // Data State
  const [systems, setSystems] = useState(initialSession?.systems || {});
  const [selectedCoords, setSelectedCoords] = useState(null);
  
  // Viewport State
  const [showLeftSidebar, setShowLeftSidebar] = useState(initialSession?.showLeftSidebar ?? true);
  const [showRightSidebar, setShowRightSidebar] = useState(initialSession?.showRightSidebar ?? true);
  const [viewState, setViewState] = useState(initialSession?.viewState || { scale: 1, x: 0, y: 0 });
  const [autoGenerateOnMount, setAutoGenerateOnMount] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (initialSession?.systems && Object.keys(initialSession.systems).length > 0) return false;
    return window.sessionStorage.getItem('ssg_auto_generated') !== '1';
  });

  const resetView = useCallback((size = gridSize) => {
    // Center logic roughly approximates centering the grid
    const sidebarWidth = (showLeftSidebar ? SIDEBAR_WIDTH : 0) + (showRightSidebar ? SIDEBAR_WIDTH : 0);
    const centerX = (window.innerWidth - sidebarWidth) / 2;
    const centerY = window.innerHeight / 2;
    const gridPixelWidth = size.width * 1.5 * HEX_SIZE;
    const gridPixelHeight = size.height * HEX_HEIGHT;
    
    setViewState({ 
      scale: 1, 
      x: centerX - (gridPixelWidth / 2), 
      y: centerY - (gridPixelHeight / 2) 
    });
  }, [gridSize, showLeftSidebar, showRightSidebar]);

  // --- Generation Logic ---

  const handleSectorGenerated = useCallback((newSystems, newGridSize) => {
    // Post-process systems to add deterministic multi-star variants.
    const processedSystems = Object.fromEntries(
      Object.entries(newSystems).map(([coords, system]) => {
        const stars = system.stars ? [...system.stars] : (system.star ? [system.star] : []);
        const seedBase = `${coords}|${system.baseName || system.name || system.star?.name || 'system'}`;
        let processedBodies = system.bodies;

        // Ensure at least one habitable planet if possible for systems with planets.
        if (processedBodies && processedBodies.length > 0) {
          const hasHabitable = processedBodies.some(body => {
            const planetInfo = getPlanetByType(body.type);
            return planetInfo?.data?.habitable;
          });

          if (!hasHabitable) {
            const primaryStar = system.star || stars[0];
            const starInfo = primaryStar ? starsData.find(s => s.type === primaryStar.type) : null;
            const possiblePlanetTypes = starInfo?.data?.planetTypeWeights || {};

            const canHaveHabitable = Object.entries(possiblePlanetTypes).some(([type, weight]) => {
              if (weight > 0) {
                const planetInfo = getPlanetByType(type);
                return planetInfo?.data?.habitable;
              }
              return false;
            });

            if (canHaveHabitable) {
              const habitableTypes = Object.keys(possiblePlanetTypes).filter(type => {
                const planetInfo = getPlanetByType(type);
                return planetInfo?.data?.habitable && possiblePlanetTypes[type] > 0;
              });

              if (habitableTypes.length > 0) {
                const bodyIndexToChange = Math.floor(hashToUnit(`${seedBase}:habitable_fix`) * processedBodies.length);
                const newType = habitableTypes[Math.floor(hashToUnit(`${seedBase}:habitable_fix_type`) * habitableTypes.length)];
                
                const newBodies = [...processedBodies];
                newBodies[bodyIndexToChange] = { ...newBodies[bodyIndexToChange], type: newType };
                processedBodies = newBodies;
              }
            }
          }
        }

        // Determine which planets are inhabited.
        let bodiesWithPopulation = processedBodies;
        if (processedBodies && processedBodies.length > 0) {
            const habitablePlanetIndices = processedBodies
                .map((body, index) => ({ body, index }))
                .filter(({ body }) => getPlanetByType(body.type)?.data?.habitable)
                .map(({ index }) => index);

            if (habitablePlanetIndices.length > 0) {
                // Create a mutable copy of bodiesWithPopulation for in-place modifications
                bodiesWithPopulation = processedBodies.map(body => ({ ...body, isInhabited: false }));

                // Deterministically shuffle the habitable planets
                const shuffledHabitable = [...habitablePlanetIndices];
                for (let i = shuffledHabitable.length - 1; i > 0; i--) {
                    const j = Math.floor(hashToUnit(`${seedBase}:inhabit_shuffle:${i}`) * (i + 1));
                    [shuffledHabitable[i], shuffledHabitable[j]] = [shuffledHabitable[j], shuffledHabitable[i]];
                }

                let inhabitedCount = 0;
                let primaryInhabitedPlanetIndex = -1;

                // Guarantee at least one inhabited planet
                if (shuffledHabitable.length > 0) {
                    primaryInhabitedPlanetIndex = shuffledHabitable.shift();
                    const primaryPlanet = bodiesWithPopulation[primaryInhabitedPlanetIndex];
                    const suffix = namesData.PRIMARY_PLANET_SUFFIXES[
                        Math.floor(hashToUnit(`${seedBase}:primary_suffix`) * namesData.PRIMARY_PLANET_SUFFIXES.length)
                    ] || 'Prime';

                    // Rename the primary inhabited planet and mark it as inhabited
                    primaryPlanet.name = suffix;
                    primaryPlanet.isInhabited = true;
                    primaryPlanet.namingStyle = 'suffix'; // Primary is always a suffix
                    inhabitedCount++;
                }

                const secondaryInhabitedIndices = []; // Track indices of secondary inhabited planets
                // Decide which other habitable planets are also inhabited, respecting MAX_INHABITED_PLANETS
                for (const planetIndex of shuffledHabitable) {
                    if (inhabitedCount >= systemConfig.MAX_INHABITATED_PLANETS) {
                        break;
                    }

                    // The chance decreases for each additional inhabited planet
                    const chance = systemConfig.POPULATION.CHANCE / inhabitedCount;
                    if (hashToUnit(`${seedBase}:inhabited_chance:${planetIndex}`) < chance) {
                        bodiesWithPopulation[planetIndex].isInhabited = true;
                        secondaryInhabitedIndices.push(planetIndex);
                        inhabitedCount++;
                    }
                }

                // Decide on the naming scheme for uninhabited planets in this system
                const useGreekAlphabet = hashToUnit(`${seedBase}:naming_scheme`) < 0.5;
                const namingList = useGreekAlphabet ? namesData.GREEK_ALPHABET : namesData.ROMAN_NUMERALS;

                // Pool of available secondary names (prefixes and suffixes)
                const availableSecondaryNamesPool = [
                    ...(namesData.SECONDARY_PLANET_PREFIXES || []).map(p => ({ name: p, style: 'prefix' })),
                    ...(namesData.SECONDARY_PLANET_SUFFIXES || []).map(s => ({ name: s, style: 'suffix' }))
                ];

                // Deterministically shuffle the entire pool once per system to ensure unique assignments
                const shuffledSecondaryNamesPool = [...availableSecondaryNamesPool].sort(
                    (a, b) => hashToUnit(`${seedBase}:secondary_pool_shuffle:${a.name}`) - hashToUnit(`${seedBase}:secondary_pool_shuffle:${b.name}`)
                );

                let secondaryNamePoolIndex = 0; // To pick names from the shuffled pool

                // Re-assign names to all non-primary planets.
                // Secondary inhabited planets get special names (prefix/suffix only), others get sequential Roman numerals/numbers.
                let uninhabitedSequentialCounter = 0; // Counter specifically for uninhabited planets
                bodiesWithPopulation = bodiesWithPopulation.map((body, index) => {
                    if (index === primaryInhabitedPlanetIndex) {
                        return body; // Keep the 'Prime' name for the primary inhabited planet
                    }

                    let newName, namingStyle;
                    if (secondaryInhabitedIndices.includes(index)) {
                        // It's a secondary inhabited planet, use a unique prefix/suffix name.
                        if (secondaryNamePoolIndex < shuffledSecondaryNamesPool.length) {
                            const chosenOption = shuffledSecondaryNamesPool[secondaryNamePoolIndex];
                            newName = chosenOption.name;
                            namingStyle = chosenOption.style;
                            secondaryNamePoolIndex++;
                        } else {
                            // Fallback if unique secondary names are exhausted.
                            console.warn(`Ran out of unique secondary planet names for system ${system.name}. Falling back to generic "Outpost".`);
                            newName = `Outpost`;
                            namingStyle = 'suffix';
                        }
                    } else {
                        // It's an uninhabited planet.
                        uninhabitedSequentialCounter++;
                        newName = namingList[uninhabitedSequentialCounter - 1] || uninhabitedSequentialCounter.toString();
                        namingStyle = 'suffix';
                    }

                    return { ...body, name: newName, namingStyle };
                });
            }
        }
        const stations = [];
        const hasInhabitedPlanet = bodiesWithPopulation?.some(p => p.isInhabited);

        if (hasInhabitedPlanet && stationsData.length > 0) {
            const availableStationTypes = [...stationsData];

            const getRandomStation = (seed, pool) => {
                if (pool.length === 0) {
                    return null;
                }
                const totalWeight = pool.reduce((sum, s) => sum + (s.data?.generationWeight || 0), 0);
                let value = hashToUnit(seed) * totalWeight;

                for (let i = 0; i < pool.length; i++) {
                    const stationType = pool[i];
                    value -= (stationType.data?.generationWeight || 0);
                    if (value <= 0) {
                        pool.splice(i, 1); // Remove selected station from the pool
                        return { ...stationType }; // Create a copy
                    }
                }
                // Fallback: return and remove the last station from the pool
                return { ...pool.pop() };
            };

            // Guarantee at least one station
            const firstStation = getRandomStation(`${seedBase}:station_0`, availableStationTypes);
            if (firstStation) stations.push(firstStation);

            // Chance for more stations, up to MAX_STATIONS, biased around 2.
            for (let i = 1; i < systemConfig.MAX_STATIONS; i++) {
                const chance = 0.8 - (i * 0.25); // Biases towards 2 stations, with a sharp drop-off.
                if (hashToUnit(`${seedBase}:has_station_${i}`) < chance) {
                    const nextStation = getRandomStation(`${seedBase}:station_${i}`, availableStationTypes);
                    if (nextStation) stations.push(nextStation);
                } else {
                    break;
                }
            }

            // Post-process to assign unique names from prefixes/suffixes
            stations.forEach((station, index) => {
                const stationTypeKey = station.type.toUpperCase().replace(/ /g, '_');
                const prefixesKey = `${stationTypeKey}_PREFIXES`;
                const suffixesKey = `${stationTypeKey}_SUFFIXES`;

                const prefixes = namesData[prefixesKey] || [];
                const suffixes = namesData[suffixesKey] || [];

                let newName = station.name; // Fallback to original name

                if (prefixes.length > 0 && suffixes.length > 0) {
                    const prefix = prefixes[Math.floor(hashToUnit(`${seedBase}:station_name_prefix_${index}`) * prefixes.length)];
                    const suffix = suffixes[Math.floor(hashToUnit(`${seedBase}:station_name_suffix_${index}`) * suffixes.length)];
                    newName = `${prefix} ${suffix}`;
                } else if (prefixes.length > 0) {
                    newName = prefixes[Math.floor(hashToUnit(`${seedBase}:station_name_prefix_${index}`) * prefixes.length)];
                } else if (suffixes.length > 0) {
                    newName = suffixes[Math.floor(hashToUnit(`${seedBase}:station_name_suffix_${index}`) * suffixes.length)];
                }
                station.name = newName;
            });
        }

        // Add sizes to planets
        const bodiesWithSize = bodiesWithPopulation?.map((body, index) => ({
            ...body,
            size: getRandomPlanetSize(`${seedBase}:body:${index}:size`, body.type),
        }));

        // ~15% chance for a binary system
        if (stars.length > 0 && hashToUnit(`${seedBase}:binary`) < 0.15) {
          const type2 = ADDITIONAL_STAR_TYPES[
            Math.floor(hashToUnit(`${seedBase}:type2`) * ADDITIONAL_STAR_TYPES.length)
          ];
          const age2 = +(1 + hashToUnit(`${seedBase}:age2`) * 9).toFixed(2);

          stars.push({
            ...system.star,
            name: `${system.star.name} ${MULTI_STAR_SUFFIXES[0]}`,
            type: type2,
            age: age2,
            ageUnit: system.star?.ageUnit || 'B Years'
          });

          // ~1.5% chance for a trinary system (10% of binary systems)
          if (hashToUnit(`${seedBase}:trinary`) < 0.10) {
            const type3 = ADDITIONAL_STAR_TYPES[
              Math.floor(hashToUnit(`${seedBase}:type3`) * ADDITIONAL_STAR_TYPES.length)
            ];
            const age3 = +(1 + hashToUnit(`${seedBase}:age3`) * 9).toFixed(2);

            stars.push({
              ...system.star,
              name: `${system.star.name} ${MULTI_STAR_SUFFIXES[1]}`,
              type: type3,
              age: age3,
              ageUnit: system.star?.ageUnit || 'B Years'
            });
          }
        }

        const belts = [];
        // To guarantee data for testing, temporarily set the chance to 100%.
        // Also, ensure the belts.json file is not empty before trying to use it.
        if (beltsData.length > 0 && hashToUnit(`${seedBase}:has_belt`) < 0.35) { // 35% chance to have a belt/field
            const beltType = beltsData[Math.floor(hashToUnit(`${seedBase}:belt_type`) * beltsData.length)];
            // Defensive check in case beltType is somehow undefined
            if (beltType) {
                belts.push({
                    name: `${system.name} ${beltType.split(' ')[0]}`,
                    type: beltType,
                });
            }
        }

        return [coords, {
          ...system,
          stars,
          bodies: bodiesWithSize || system.bodies, // Use bodiesWithSize which is based on processedBodies
          belts,
          stations,
        }];
      })
    );

    setSystems(processedSystems);
    setGridSize(newGridSize);
    setSelectedCoords(null);
    resetView(newGridSize);
    if (autoGenerateOnMount && typeof window !== 'undefined') {
      window.sessionStorage.setItem('ssg_auto_generated', '1');
      setAutoGenerateOnMount(false);
    }
  }, [autoGenerateOnMount, resetView]);

  // Auto-save session
  useEffect(() => {
    const timer = setTimeout(() => {
      const session = {
        gridSize,
        systems,
        generatorSettings,
        showLeftSidebar,
        showRightSidebar,
        viewState
      };
      localStorage.setItem('ssg_session', JSON.stringify(session));
    }, 500); // Debounce save to avoid performance hit during drag/resize
    return () => clearTimeout(timer);
  }, [gridSize, systems, generatorSettings, showLeftSidebar, showRightSidebar, viewState]);

  const generatorStyle = useMemo(() => ({ display: showLeftSidebar ? 'flex' : 'none' }), [showLeftSidebar]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">

        {/* LEFT COLUMN: Generator Settings */}
        <GeneratorPanel
          onGenerate={handleSectorGenerated}
          style={generatorStyle}
          autoGenerateOnMount={autoGenerateOnMount}
          initialSettings={generatorSettings}
          onSettingsChange={setGeneratorSettings}
        />

        {/* CENTER COLUMN: Map View */}
        <StarMap
          gridSize={gridSize}
          systems={systems}
          selectedCoords={selectedCoords}
          setSelectedCoords={setSelectedCoords}
          viewState={viewState}
          setViewState={setViewState}
          showLeftSidebar={showLeftSidebar}
          setShowLeftSidebar={setShowLeftSidebar}
          showRightSidebar={showRightSidebar}
          setShowRightSidebar={setShowRightSidebar}
        />

        {/* RIGHT COLUMN: Inspector */}
        {showRightSidebar && (
          <InspectorPanel
            gridSize={gridSize}
            systems={systems}
            selectedCoords={selectedCoords}
            setSelectedCoords={setSelectedCoords}
          />
        )}

    </div>
  );
}
