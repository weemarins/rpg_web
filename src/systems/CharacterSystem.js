import { CLASS_PRESETS, XP_BASE, XP_GROWTH } from '../config.js';

export function xpToNextLevel(level) {
  return Math.floor(XP_BASE * Math.pow(level, XP_GROWTH));
}

export function createCharacter(name, className = 'Guerreiro') {
  const preset = CLASS_PRESETS[className] || CLASS_PRESETS.Guerreiro;
  return {
    name,
    className,
    level: 1,
    xp: 0,
    xpToNext: xpToNextLevel(1),
    gold: 70,
    stats: {
      maxHp: preset.hp,
      maxMp: preset.mp,
      str: preset.str,
      def: preset.def,
      agi: preset.agi
    },
    hp: preset.hp,
    mp: preset.mp,
    equipment: {
      weapon: null,
      armor: null
    },
    kills: {
      slime: 0,
      wolf: 0,
      skeleton: 0
    }
  };
}

export function gainXp(character, amount) {
  character.xp += amount;
  const levelUps = [];
  while (character.xp >= character.xpToNext) {
    character.xp -= character.xpToNext;
    character.level += 1;

    // Progressão escalonada inspirada em JRPG clássico
    character.stats.maxHp += 12 + character.level * 2;
    character.stats.maxMp += 6 + Math.floor(character.level * 1.5);
    character.stats.str += 2;
    character.stats.def += 2;
    character.stats.agi += 1;

    character.hp = character.stats.maxHp;
    character.mp = character.stats.maxMp;

    character.xpToNext = xpToNextLevel(character.level);
    levelUps.push(character.level);
  }
  return levelUps;
}

export function getCombatStats(character) {
  const weaponBonus = character.equipment.weapon?.power ?? 0;
  const armorBonus = character.equipment.armor?.power ?? 0;
  return {
    str: character.stats.str + weaponBonus,
    def: character.stats.def + armorBonus,
    agi: character.stats.agi
  };
}
