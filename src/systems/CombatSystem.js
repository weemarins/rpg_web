import { randInt, rollDrop } from '../utils/rng.js';
import { ITEM_DB } from '../data/items.js';
import { MONSTER_DB } from '../data/monsters.js';
import { getCombatStats, gainXp } from './CharacterSystem.js';
import { addItem } from './InventorySystem.js';
import { updateKillQuest } from './QuestSystem.js';

const clampDamage = (value) => Math.max(1, Math.floor(value));

export function computeBasicDamage(attacker, defender) {
  const variance = randInt(-2, 3);
  const raw = attacker.str * 1.2 - defender.def * 0.8 + variance;
  return clampDamage(raw);
}

export function computeSkillDamage(attacker, defender) {
  const variance = randInt(0, 6);
  const raw = attacker.str * 1.8 - defender.def * 0.6 + variance;
  return clampDamage(raw);
}

export function buildEnemy(monsterId) {
  const base = MONSTER_DB[monsterId];
  return {
    ...base,
    hp: base.maxHp,
    mp: base.maxMp
  };
}

export function monsterAction(enemy, playerCombatStats) {
  const useSkill = enemy.mp >= 5 && Math.random() < 0.25;
  if (useSkill) {
    enemy.mp -= 5;
    return {
      action: 'skill',
      damage: computeSkillDamage({ str: enemy.str + 1 }, playerCombatStats)
    };
  }

  return {
    action: 'attack',
    damage: computeBasicDamage({ str: enemy.str }, playerCombatStats)
  };
}

export function resolveVictory(globalState, enemy) {
  const { player, inventory, quests } = globalState;
  player.kills[enemy.id] += 1;
  updateKillQuest(quests, enemy.id);

  const goldEarned = randInt(enemy.gold[0], enemy.gold[1]);
  player.gold += goldEarned;

  const levelUps = gainXp(player, enemy.xp);
  const dropped = rollDrop(enemy.dropTable);
  let dropMsg = 'Nenhum item dropado.';
  if (dropped) {
    if (addItem(inventory, dropped, 1)) {
      dropMsg = `Drop: ${ITEM_DB[dropped].name}`;
    } else {
      dropMsg = `Inventário cheio, drop perdido: ${ITEM_DB[dropped].name}`;
    }
  }

  return {
    xp: enemy.xp,
    gold: goldEarned,
    levelUps,
    dropMsg
  };
}

export function getPlayerCombatStats(character) {
  return getCombatStats(character);
}
