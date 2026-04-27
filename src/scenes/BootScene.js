import { TILE_SIZE } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    // Placeholders em pixel art criados por código.
    // Substitua por spritesheets reais no futuro mantendo as mesmas keys.
    this.createTexture('tile_grass', 0x3a7f4e);
    this.createTexture('tile_path', 0xa38d62);
    this.createTexture('tile_water', 0x2f5f9f);
    this.createTexture('tile_stone', 0x5d5d66);

    this.createCharacterTexture('player', 0x4ec9f2, 0x124055);
    this.createCharacterTexture('npc', 0xe4a672, 0x573b2f);
    this.createCharacterTexture('shopkeeper', 0x7be080, 0x285f2f);
    this.createCharacterTexture('monster', 0xe06c75, 0x5f252a);

    this.scene.start('menu');
  }

  createTexture(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
  }

  createCharacterTexture(key, colorA, colorB) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(colorA, 1);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.fillStyle(colorB, 1);
    g.fillRect(6, 6, 20, 20);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
  }
}
