/**
 * Creates a generic weighted picker function.
 * 
 * @param {Array} items - Array of items to pick from.
 * @param {Function} getWeight - Function to extract weight from an item.
 * @returns {Function} A function that takes an RNG and returns a picked item.
 */
export const createWeightedPicker = (items, getWeight) => {
  const filteredItems = items
    .map(item => ({ item, weight: getWeight(item) || 0 }))
    .filter(({ weight }) => weight > 0);

  const totalWeight = filteredItems.reduce((sum, { weight }) => sum + weight, 0);

  return (rng) => {
    if (totalWeight <= 0 || filteredItems.length === 0) {
      return items[0];
    }

    let roll = rng() * totalWeight;
    for (const { item, weight } of filteredItems) {
      roll -= weight;
      if (roll <= 0) return item;
    }

    return filteredItems[filteredItems.length - 1].item;
  };
};

/**
 * Picks a single item from an array using weights without pre-creating a picker.
 * 
 * @param {Array} items - Array of items.
 * @param {Function} getWeight - Function to extract weight.
 * @param {number} roll - A random value between 0 and total weight.
 * @returns {any} The picked item.
 */
export const pickWeighted = (items, getWeight, roll) => {
  const totalWeight = items.reduce((sum, item) => sum + (getWeight(item) || 0), 0);
  let value = roll * totalWeight;

  for (const item of items) {
    const weight = getWeight(item) || 0;
    if (weight <= 0) continue;
    value -= weight;
    if (value <= 0) return item;
  }

  return items[items.length - 1];
};
