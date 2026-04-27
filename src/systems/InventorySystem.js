import { MAX_INVENTORY_SLOTS } from '../config.js';
import { ITEM_DB } from '../data/items.js';

export function createInventory() {
  return [];
}

export function addItem(inventory, itemId, quantity = 1) {
  if (inventory.length >= MAX_INVENTORY_SLOTS) return false;
  const item = ITEM_DB[itemId];
  if (!item) return false;

  const stackable = item.type === 'consumable' || item.type === 'material';
  if (stackable) {
    const slot = inventory.find((s) => s.itemId === itemId);
    if (slot) {
      slot.quantity += quantity;
      return true;
    }
  }

  inventory.push({ itemId, quantity });
  return true;
}

export function removeItem(inventory, itemId, quantity = 1) {
  const idx = inventory.findIndex((s) => s.itemId === itemId);
  if (idx === -1) return false;

  inventory[idx].quantity -= quantity;
  if (inventory[idx].quantity <= 0) inventory.splice(idx, 1);
  return true;
}

export function useConsumable(character, inventory, itemId) {
  const item = ITEM_DB[itemId];
  if (!item || item.type !== 'consumable') return { ok: false, msg: 'Item inválido.' };

  const slot = inventory.find((s) => s.itemId === itemId);
  if (!slot) return { ok: false, msg: 'Você não possui este item.' };

  if (item.subtype === 'hp') {
    const before = character.hp;
    character.hp = Math.min(character.stats.maxHp, character.hp + item.power);
    if (character.hp === before) return { ok: false, msg: 'HP já está cheio.' };
  } else {
    const before = character.mp;
    character.mp = Math.min(character.stats.maxMp, character.mp + item.power);
    if (character.mp === before) return { ok: false, msg: 'MP já está cheio.' };
  }

  removeItem(inventory, itemId, 1);
  return { ok: true, msg: `${item.name} usado.` };
}

export function equipItem(character, inventory, itemId) {
  const item = ITEM_DB[itemId];
  if (!item || (item.type !== 'weapon' && item.type !== 'armor')) {
    return { ok: false, msg: 'Este item não pode ser equipado.' };
  }
  const slot = inventory.find((s) => s.itemId === itemId);
  if (!slot) return { ok: false, msg: 'Item não encontrado no inventário.' };

  const gearSlot = item.type;
  if (character.equipment[gearSlot]) {
    inventory.push({ itemId: character.equipment[gearSlot].id, quantity: 1 });
  }

  character.equipment[gearSlot] = { ...item };
  removeItem(inventory, itemId, 1);
  return { ok: true, msg: `${item.name} equipado.` };
}

export function sellItem(character, inventory, itemId) {
  const slot = inventory.find((s) => s.itemId === itemId);
  if (!slot) return { ok: false, msg: 'Item inexistente.' };
  const item = ITEM_DB[itemId];
  character.gold += Math.floor(item.value * 0.5);
  removeItem(inventory, itemId, 1);
  return { ok: true, msg: `${item.name} vendido.` };
}
