export const MONSTER_DB = {
  slime: {
    id: 'slime',
    name: 'Slime Azul',
    maxHp: 45,
    maxMp: 10,
    str: 7,
    def: 3,
    agi: 4,
    xp: 18,
    gold: [8, 16],
    dropTable: [
      { itemId: 'slime_core', chance: 0.35 },
      { itemId: 'potion_small', chance: 0.12 }
    ]
  },
  wolf: {
    id: 'wolf',
    name: 'Lobo Selvagem',
    maxHp: 70,
    maxMp: 5,
    str: 10,
    def: 4,
    agi: 8,
    xp: 30,
    gold: [12, 24],
    dropTable: [
      { itemId: 'wolf_pelt', chance: 0.45 },
      { itemId: 'ether_small', chance: 0.1 }
    ]
  },
  skeleton: {
    id: 'skeleton',
    name: 'Esqueleto',
    maxHp: 95,
    maxMp: 20,
    str: 14,
    def: 7,
    agi: 7,
    xp: 56,
    gold: [22, 38],
    dropTable: [
      { itemId: 'iron_sword', chance: 0.08 },
      { itemId: 'steel_armor', chance: 0.06 },
      { itemId: 'potion_small', chance: 0.2 }
    ]
  }
};

export const ZONE_MONSTERS = {
  field: ['slime', 'wolf'],
  dungeon: ['wolf', 'skeleton']
};
