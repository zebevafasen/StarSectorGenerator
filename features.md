# Future Features Roadmap

This document outlines prioritized ideas for the expansion of the Star Sector Generator, focusing on world-building, gameplay depth, and visual polish.

## Priority 1: Political & Territorial Layer (High)
*   **Faction Territories**: Implement 3-5 major procedural factions. Sectors or clusters of systems should be "painted" with faction colors on the map.
*   **Political State**: Assign systems a status (Core, Contested, Border, Independent) that affects station density and POI types.
*   **Faction Logos**: Procedurally generated or icon-based faction sigils in the Inspector.

## Priority 2: Galactic Biomes & Regions (High)
*   **Regional Variance**: Divide the infinite grid into large "Regions" (e.g., 10x10 sectors).
*   **Biome Logic**: 
    *   *The Core*: High system density, bright backgrounds, low hazards.
    *   *The Maelstrom*: High nebula density, many hazards, rare resource POIs.
    *   *The Void*: Low density, ghost signals, derelict stations.
*   **Visual Distinction**: Tint the `MapBackground` and Galaxy View based on the current region's biome.

## Priority 3: Economy & Trade (Medium)
*   **Resource Distribution**: Planets and Stations produce/consume specific goods (Fuel, Food, Ore, Tech).
*   **Trade Routes**: Visualize "Supply Lines" between Core Systems and their satellite clusters.
*   **Logistics HUD**: A tab in the Inspector showing a system's Surplus and Deficit.

## Priority 4: Dynamic Planet Visuals (Medium)
*   **SVG Planet Generator**: Move away from static colors to dynamic SVG generation for planets (stripes for Gas Giants, continents for Terrestrials, ice caps for Arctics), similar to the current Star rendering.
*   **Atmospheric Effects**: Add a glowing "ring" around planets with Breathable or Thick atmospheres.

## Priority 5: Navigation Polish (Medium)
*   **Jump Transition**: A brief "Hyperspace" animation (warping stars effect) when clicking a Jump-Gate or using navigation arrows.
*   **Minimap**: A small HUD element in Sector View showing the immediate 8 neighboring sectors and your current position.

## Priority 6: Discovery & Logs (Low)
*   **Exploration Log**: A dedicated panel listing all "Interesting" finds (Super-Earths, Relics, Anomalies) across the entire explored universe.
*   **Search/Filter**: A search bar to find a specific system by name or a planet by resource type across archived sectors.

## Priority 7: Content Expansion (Low)
*   **Mega-Structures**: Extremely rare POIs (Dyson Swarms, Gate Hubs, Ruined Ringworlds) that span multiple hexes.
*   **System Events**: Rare flags like "Supernova Imminent" or "Pirate Blockade" that change system descriptions.
