# Pipeline: Core Systems Overhaul

This document outlines the architectural plan for implementing **Core Systems** as the primary anchors of sector development.

## 1. Phase One: The Macro-Placement (Sector [Q, R] Logic)
Instead of picking a random hex, we deterministically calculate the **Ideal Core Hex** for a Sector based on its Galactic Coordinates.

*   **Drift Logic**: At `[0,0]`, the Core is near the center. As `Q` or `R` increases, the Core hex drifts towards the "expansion front" (neighboring borders).
*   **Safety Check**: Ensure the Ideal Core Hex is always within the grid boundaries (clamped).
*   **Result**: Every sector now has a "High Priority Coordinate" designated as the landing site for early explorers.

## 2. Phase Two: Clustering Overhaul (The Anchor)
Modify `sectorGeneration.js` to integrate the Core Hex into the distribution algorithm.

*   **Primary Anchor**: The calculated Core Hex is forced as the first `clusterCenter`.
*   **Gravity Boost**: This specific center gets a higher weight and larger radius, ensuring it becomes the "Capital Region" of the sector.
*   **Fixed Density**: When `distributionMode === 'clustered'`, the system density UI is ignored. The number of systems is calculated strictly based on sector size (e.g., `totalHexes * 0.2`) to ensure clusters have enough "void" between them to remain distinct.
*   **System Guarantee**: We ensure a system *always* spawns at the Core Hex, even if the density is set to "Void".

## 3. Phase Three: System-Level "Bending" (The Super-System)
When the system at the Core Hex is generated, it triggers specialized rules in `systemGeneration.js` and `planetGeneration.js`.

*   **Stellar Age**: The primary star's age is boosted (representing the oldest known sun in the sector).
*   **Habitability Bias**: 
    *   Forced "Super-Earth": At least one large Terrestrial world with Ideal/Temperate climate and Breathable atmosphere.
    *   Weight bias towards Terrestrial/Oceanic worlds for remaining bodies.
*   **Population Surge**: Apply a `CORE_SYSTEM_POP_MULTIPLIER` (e.g., 5x - 10x).
*   **Infrastructure**: Automatic generation of high-tier stations (Trade Hubs or Shipyards).

## 4. Phase Four: UI & Visual Identity
Providing clear feedback to the user that they have found a Core System.

*   **Map Icon**: The Core Star gets a unique visual indicator (e.g., a subtle secondary outer ring or a more intense "pulsing" glow).
*   **Inspector Header**: A gold/amber **"CORE SYSTEM"** badge appears in the Selection Header.
*   **Galaxy View**: Core systems are highlighted with a distinct marker to show the "Chain of Command" across the explored universe.

## Data Structure Changes
*   `system_generation_config.json`: Add `CORE_SYSTEM_SETTINGS` object.
*   `systems` object: Add `isCore: true` flag.
*   `planet` object: Add `isCoreWorld: true` for the primary habitable planet in a Core System.

---
**Status**: Pending Approval.
**Next Step**: Once approved, I will begin Phase One.
