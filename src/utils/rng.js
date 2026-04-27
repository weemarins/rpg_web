export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function rollDrop(dropTable) {
  for (const drop of dropTable) {
    if (Math.random() <= drop.chance) {
      return drop.itemId;
    }
  }
  return null;
}
