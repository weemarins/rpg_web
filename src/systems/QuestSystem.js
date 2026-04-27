export const QUESTS = {
  hunt_wolves: {
    id: 'hunt_wolves',
    title: 'Caçada na Floresta',
    description: 'Derrote 3 Lobos Selvagens.',
    type: 'kill',
    target: 'wolf',
    required: 3,
    reward: { xp: 80, gold: 60, itemId: 'potion_small' }
  },
  collect_cores: {
    id: 'collect_cores',
    title: 'Pesquisa Arcana',
    description: 'Entregue 2 Núcleos de Slime.',
    type: 'fetch',
    itemId: 'slime_core',
    required: 2,
    reward: { xp: 65, gold: 50, itemId: 'ether_small' }
  }
};

export function createQuestLog() {
  return {
    active: {},
    completed: []
  };
}

export function acceptQuest(log, questId) {
  if (!QUESTS[questId] || log.active[questId] || log.completed.includes(questId)) return false;
  log.active[questId] = { progress: 0, done: false };
  return true;
}

export function updateKillQuest(log, monsterId) {
  Object.entries(log.active).forEach(([questId, status]) => {
    const quest = QUESTS[questId];
    if (quest.type === 'kill' && quest.target === monsterId && !status.done) {
      status.progress += 1;
      if (status.progress >= quest.required) status.done = true;
    }
  });
}

export function updateFetchQuest(log, inventory) {
  Object.entries(log.active).forEach(([questId, status]) => {
    const quest = QUESTS[questId];
    if (quest.type === 'fetch') {
      const count = inventory
        .filter((slot) => slot.itemId === quest.itemId)
        .reduce((acc, slot) => acc + slot.quantity, 0);
      status.progress = count;
      status.done = count >= quest.required;
    }
  });
}

export function completeQuest(log, questId) {
  if (!log.active[questId] || !log.active[questId].done) return false;
  delete log.active[questId];
  log.completed.push(questId);
  return true;
}
