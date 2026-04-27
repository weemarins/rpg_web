import { TILE_SIZE } from '../config.js';
import { HUD } from '../ui/HUD.js';
import { MONSTER_DB, ZONE_MONSTERS } from '../data/monsters.js';
import { ITEM_DB, SHOP_ITEMS } from '../data/items.js';
import { addItem, equipItem, sellItem, useConsumable } from '../systems/InventorySystem.js';
import {
  QUESTS,
  acceptQuest,
  completeQuest,
  updateFetchQuest
} from '../systems/QuestSystem.js';
import { gainXp } from '../systems/CharacterSystem.js';
import { randInt } from '../utils/rng.js';
import { saveGame } from '../utils/storage.js';

const MAP_STRINGS = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'WGGGGGGGGGGGGGGGGGGGGGGGGGGGGW',
  'WGVVVVVVGGGGGGGGGGGGGGGGGGGGGW',
  'WGVPPPPVGGGGGGGGGGGDDDDGGGGGGW',
  'WGVPPPPVGGGGGGGGGGGDDDDGGGGGGW',
  'WGVVVVVVGGGGGGGGGGGDDDDGGGGGGW',
  'WGGGGGGGGGGPPPPPPPGGDDDDGGGGGW',
  'WGGGGGGGGGGPPPPPPPGGGGGGGGGGGW',
  'WGGGGGGGGGGPPPPPPPGGGGGGGGGGGW',
  'WGGGGGGGGGGGGGGGGGGGGGGGGGGGGW',
  'WGGGGGGGGGGGGGGGGGGGGGGGGGGGGW',
  'WGGGGGGGGGGGGGGGGGGGGGGGGGGGGW',
  'WGGGGGGGGGGGGGGGGGGGGGGGGGGGGW',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
];

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('world');
  }

  init(data) {
    this.globalState = data.globalState;
  }

  create() {
    this.physics.world.setBounds(0, 0, MAP_STRINGS[0].length * TILE_SIZE, MAP_STRINGS.length * TILE_SIZE);
    this.drawMap();

    this.playerSprite = this.physics.add.sprite(
      this.globalState.world.x * TILE_SIZE + TILE_SIZE / 2,
      this.globalState.world.y * TILE_SIZE + TILE_SIZE / 2,
      'player'
    );

    this.playerSprite.setCollideWorldBounds(true);
    this.playerSpeed = 145;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,I,Q,K');

    this.hud = new HUD(this);
    this.hud.update(this.globalState);

    this.createNPCs();
    this.createMonsters();
    this.createItemCollectibles();

    this.physics.add.overlap(this.playerSprite, this.monsters, (_, monster) => {
      this.startBattle(monster.getData('monsterId'));
    });

    this.input.keyboard.on('keydown-E', () => this.handleInteract());
    this.input.keyboard.on('keydown-I', () => this.openInventoryPanel());
    this.input.keyboard.on('keydown-Q', () => this.openQuestPanel());
    this.input.keyboard.on('keydown-K', () => this.manualSave());

    this.time.addEvent({
      delay: 5500,
      callback: () => this.spawnMonsterCycle(),
      loop: true
    });

    this.events.on('resume', (_, data) => {
      if (data?.battleResult) {
        this.hud.setMessage(data.battleResult.summary);
        this.hud.update(this.globalState);
      }
    });
  }

  drawMap() {
    this.blocked = new Set();
    for (let y = 0; y < MAP_STRINGS.length; y += 1) {
      for (let x = 0; x < MAP_STRINGS[y].length; x += 1) {
        const c = MAP_STRINGS[y][x];
        const key = c === 'W' ? 'tile_water' : c === 'D' ? 'tile_stone' : c === 'P' ? 'tile_path' : 'tile_grass';
        this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, key);
        if (c === 'W') this.blocked.add(`${x},${y}`);
      }
    }
  }

  createNPCs() {
    this.npcs = this.physics.add.staticGroup();

    const elder = this.npcs.create(8 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 'npc');
    elder.setData('type', 'questgiver');
    elder.setData('dialog', 'Ancião: Herói, aceite missões para ganhar poder!');

    const merchant = this.npcs.create(10 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 'shopkeeper');
    merchant.setData('type', 'merchant');
    merchant.setData('dialog', 'Mercador: Itens fresquinhos! Comprar ou vender?');

    this.physics.add.collider(this.playerSprite, this.npcs);
  }

  createMonsters() {
    this.monsters = this.physics.add.group();
    for (let i = 0; i < 8; i += 1) this.spawnMonsterCycle();
  }

  spawnMonsterCycle() {
    if (this.monsters.countActive(true) > 14) return;

    const x = randInt(14, 27);
    const y = randInt(2, 12);
    if (this.blocked.has(`${x},${y}`)) return;

    const zone = x >= 20 ? 'dungeon' : 'field';
    const table = ZONE_MONSTERS[zone];
    const monsterId = table[randInt(0, table.length - 1)];

    const m = this.monsters.create(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'monster');
    m.setData('monsterId', monsterId);
    m.setData('zone', zone);
    m.setBounce(1, 1);
    m.setVelocity(randInt(-40, 40), randInt(-40, 40));
    m.setCollideWorldBounds(true);
  }

  createItemCollectibles() {
    this.collectibles = this.physics.add.group();
    for (let i = 0; i < 6; i += 1) {
      const x = randInt(12, 28);
      const y = randInt(2, 12);
      const crystal = this.collectibles.create(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'tile_stone');
      crystal.setScale(0.5);
    }

    this.physics.add.overlap(this.playerSprite, this.collectibles, (_, collectible) => {
      collectible.destroy();
      const drop = Math.random() < 0.55 ? 'slime_core' : 'potion_small';
      if (addItem(this.globalState.inventory, drop)) {
        this.hud.setMessage(`Você coletou ${ITEM_DB[drop].name}.`);
      } else {
        this.hud.setMessage('Inventário cheio!');
      }
      updateFetchQuest(this.globalState.quests, this.globalState.inventory);
    });
  }

  handleInteract() {
    const npc = this.getNearbyNPC();
    if (!npc) return;

    const dialog = npc.getData('dialog');
    this.hud.setMessage(dialog);

    if (npc.getData('type') === 'questgiver') {
      this.handleQuestNPC();
    } else if (npc.getData('type') === 'merchant') {
      this.handleShopNPC();
    }
  }

  getNearbyNPC() {
    let nearby = null;
    this.npcs.children.iterate((npc) => {
      if (!npc) return;
      const distance = Phaser.Math.Distance.Between(
        this.playerSprite.x,
        this.playerSprite.y,
        npc.x,
        npc.y
      );
      if (distance < 60) nearby = npc;
    });
    return nearby;
  }

  handleQuestNPC() {
    const options = Object.values(QUESTS)
      .map((q) => `- ${q.id}: ${q.title}`)
      .join('\n');
    const choice = window.prompt(`Missões:\n${options}\n\nDigite id para aceitar/entregar.`);
    if (!choice || !QUESTS[choice]) return;

    const log = this.globalState.quests;
    if (!log.active[choice] && !log.completed.includes(choice)) {
      if (acceptQuest(log, choice)) this.hud.setMessage(`Missão aceita: ${QUESTS[choice].title}`);
      return;
    }

    updateFetchQuest(log, this.globalState.inventory);
    if (log.active[choice]?.done && completeQuest(log, choice)) {
      const reward = QUESTS[choice].reward;
      this.globalState.player.gold += reward.gold;
      const levels = gainXp(this.globalState.player, reward.xp);
      addItem(this.globalState.inventory, reward.itemId, 1);
      this.hud.setMessage(
        `Missão concluída! +${reward.xp} XP, +${reward.gold} ouro ${levels.length ? ' (Level Up!)' : ''}`
      );

      if (QUESTS[choice].type === 'fetch') {
        // Consome itens requisitados de missão de coleta
        const needed = QUESTS[choice].required;
        let remaining = needed;
        this.globalState.inventory = this.globalState.inventory
          .map((slot) => {
            if (slot.itemId === QUESTS[choice].itemId && remaining > 0) {
              const take = Math.min(slot.quantity, remaining);
              remaining -= take;
              return { ...slot, quantity: slot.quantity - take };
            }
            return slot;
          })
          .filter((slot) => slot.quantity > 0);
      }
      this.hud.update(this.globalState);
    }
  }

  handleShopNPC() {
    const mode = window.prompt('Loja: digite B para comprar ou S para vender');
    if (!mode) return;

    if (mode.toUpperCase() === 'B') {
      const menu = SHOP_ITEMS.map((id) => `${id} (${ITEM_DB[id].value}g)`).join('\n');
      const pick = window.prompt(`Comprar:\n${menu}\nDigite o id do item:`);
      if (!pick || !ITEM_DB[pick]) return;
      const item = ITEM_DB[pick];
      if (this.globalState.player.gold < item.value) return this.hud.setMessage('Ouro insuficiente.');
      if (!addItem(this.globalState.inventory, pick, 1)) return this.hud.setMessage('Inventário cheio.');
      this.globalState.player.gold -= item.value;
      this.hud.setMessage(`Comprou ${item.name}.`);
    }

    if (mode.toUpperCase() === 'S') {
      const inventoryList = this.globalState.inventory.map((s) => `${s.itemId} x${s.quantity}`).join('\n');
      const pick = window.prompt(`Vender qual item?\n${inventoryList}`);
      if (!pick) return;
      const result = sellItem(this.globalState.player, this.globalState.inventory, pick);
      this.hud.setMessage(result.msg);
    }

    this.hud.update(this.globalState);
  }

  openInventoryPanel() {
    const lines = this.globalState.inventory.map((slot) => {
      const item = ITEM_DB[slot.itemId];
      return `${slot.itemId} x${slot.quantity} (${item.type})`;
    });

    const equipWeapon = this.globalState.player.equipment.weapon?.name ?? '---';
    const equipArmor = this.globalState.player.equipment.armor?.name ?? '---';

    const action = window.prompt(
      `Inventário (${this.globalState.inventory.length}/20)\n${lines.join('\n') || 'vazio'}\n\n` +
        `Equipado: arma=${equipWeapon}, armadura=${equipArmor}\n` +
        'Ações: U itemId (usar), E itemId (equipar), ENTER cancelar'
    );

    if (!action) return;
    const [cmd, itemId] = action.split(' ');
    if (!itemId) return;

    if (cmd.toUpperCase() === 'U') {
      const result = useConsumable(this.globalState.player, this.globalState.inventory, itemId);
      this.hud.setMessage(result.msg);
    } else if (cmd.toUpperCase() === 'E') {
      const result = equipItem(this.globalState.player, this.globalState.inventory, itemId);
      this.hud.setMessage(result.msg);
    }
    updateFetchQuest(this.globalState.quests, this.globalState.inventory);
    this.hud.update(this.globalState);
  }

  openQuestPanel() {
    updateFetchQuest(this.globalState.quests, this.globalState.inventory);
    const active = Object.entries(this.globalState.quests.active)
      .map(([id, status]) => {
        const q = QUESTS[id];
        return `${q.title}: ${status.progress}/${q.required} ${status.done ? '[PRONTA]' : ''}`;
      })
      .join('\n');

    const completed = this.globalState.quests.completed.map((id) => QUESTS[id].title).join(', ');

    window.alert(`Missões ativas:\n${active || 'Nenhuma'}\n\nConcluídas:\n${completed || 'Nenhuma'}`);
  }

  startBattle(monsterId) {
    this.globalState.world.x = Math.floor(this.playerSprite.x / TILE_SIZE);
    this.globalState.world.y = Math.floor(this.playerSprite.y / TILE_SIZE);

    this.scene.pause();
    this.scene.launch('battle', { globalState: this.globalState, monsterId });
  }

  manualSave() {
    this.globalState.world.x = Math.floor(this.playerSprite.x / TILE_SIZE);
    this.globalState.world.y = Math.floor(this.playerSprite.y / TILE_SIZE);
    saveGame(this.globalState);
    this.hud.setMessage('Jogo salvo no LocalStorage.');
  }

  update() {
    const vel = this.playerSpeed;
    this.playerSprite.setVelocity(0);
    if (this.cursors.left.isDown || this.keys.A.isDown) this.playerSprite.setVelocityX(-vel);
    else if (this.cursors.right.isDown || this.keys.D.isDown) this.playerSprite.setVelocityX(vel);

    if (this.cursors.up.isDown || this.keys.W.isDown) this.playerSprite.setVelocityY(-vel);
    else if (this.cursors.down.isDown || this.keys.S.isDown) this.playerSprite.setVelocityY(vel);

    this.hud.update(this.globalState);
  }
}
