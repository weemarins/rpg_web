import { CLASS_PRESETS } from '../config.js';
import { createCharacter } from '../systems/CharacterSystem.js';
import { createInventory, addItem } from '../systems/InventorySystem.js';
import { createQuestLog } from '../systems/QuestSystem.js';
import { loadGame, clearSave } from '../utils/storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    this.add.text(80, 60, 'SNES PIXEL RPG - MVP', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#ffd166'
    });

    this.add.text(80, 130, 'Novo Jogo (N)\nCarregar Save (C)\nApagar Save (DEL)', {
      fontFamily: 'monospace',
      fontSize: '22px',
      lineSpacing: 10
    });

    this.input.keyboard.on('keydown-N', () => this.startNewGame());
    this.input.keyboard.on('keydown-C', () => this.loadSavedGame());
    this.input.keyboard.on('keydown-DELETE', () => {
      clearSave();
      this.flash('Save apagado.');
    });

    this.flash('Pressione N para começar.');
  }

  flash(message) {
    if (this.msgText) this.msgText.destroy();
    this.msgText = this.add.text(80, 260, message, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#92f0c1'
    });
  }

  startNewGame() {
    const classNames = Object.keys(CLASS_PRESETS);
    const classHint = classNames.map((c, i) => `${i + 1}: ${c}`).join(' | ');

    const name = window.prompt('Digite o nome do herói:', 'Arus') || 'Arus';
    const classSelection = Number(
      window.prompt(`Escolha classe:\n${classHint}`, '1')
    );
    const className = classNames[classSelection - 1] || 'Guerreiro';

    const player = createCharacter(name, className);
    const inventory = createInventory();
    addItem(inventory, 'potion_small', 3);
    addItem(inventory, 'bronze_sword', 1);
    addItem(inventory, 'leather_armor', 1);

    this.scene.start('world', {
      globalState: {
        player,
        inventory,
        quests: createQuestLog(),
        world: { x: 7, y: 6, zone: 'village' }
      }
    });
  }

  loadSavedGame() {
    const save = loadGame();
    if (!save) {
      this.flash('Nenhum save encontrado.');
      return;
    }
    this.scene.start('world', { globalState: save });
  }
}
