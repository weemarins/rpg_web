export const ITEM_DB = {
  potion_small: {
    id: 'potion_small',
    name: 'Poção Pequena',
    type: 'consumable',
    subtype: 'hp',
    power: 40,
    value: 20,
    rarity: 'common',
    description: 'Recupera 40 HP.'
  },
  ether_small: {
    id: 'ether_small',
    name: 'Éter Pequeno',
    type: 'consumable',
    subtype: 'mp',
    power: 25,
    value: 25,
    rarity: 'common',
    description: 'Recupera 25 MP.'
  },
  bronze_sword: {
    id: 'bronze_sword',
    name: 'Espada de Bronze',
    type: 'weapon',
    power: 4,
    value: 80,
    rarity: 'common',
    description: 'Arma básica de ataque.'
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Espada de Ferro',
    type: 'weapon',
    power: 8,
    value: 190,
    rarity: 'rare',
    description: 'Arma intermediária.'
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Armadura de Couro',
    type: 'armor',
    power: 3,
    value: 75,
    rarity: 'common',
    description: 'Aumenta defesa em +3.'
  },
  steel_armor: {
    id: 'steel_armor',
    name: 'Armadura de Aço',
    type: 'armor',
    power: 7,
    value: 210,
    rarity: 'rare',
    description: 'Aumenta defesa em +7.'
  },
  wolf_pelt: {
    id: 'wolf_pelt',
    name: 'Pele de Lobo',
    type: 'material',
    value: 15,
    rarity: 'common',
    description: 'Item de missão / venda.'
  },
  slime_core: {
    id: 'slime_core',
    name: 'Núcleo de Slime',
    type: 'material',
    value: 18,
    rarity: 'common',
    description: 'Item gelatinoso valioso.'
  }
};

export const SHOP_ITEMS = ['potion_small', 'ether_small', 'bronze_sword', 'leather_armor'];
