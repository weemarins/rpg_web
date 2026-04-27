import { TILE_SIZE } from '../config.js';

const SHEET_KEY = 'rpg_full_sheet';
const SHEET_PATH = 'assets/rpg-snes-sheet.png';

// Coordenadas extraídas do spritesheet mestre (2048x1533).
// Caso use outro arquivo, ajuste os recortes abaixo.
const SPRITE_REGIONS = {
  tile_grass: { x: 1438, y: 572, w: 56, h: 56 },
  tile_path: { x: 1758, y: 572, w: 56, h: 56 },
  tile_water: { x: 1629, y: 572, w: 56, h: 56 },
  tile_stone: { x: 1566, y: 572, w: 56, h: 56 },
  player: { x: 1488, y: 946, w: 56, h: 56 },
  npc: { x: 66, y: 589, w: 98, h: 116 },
  shopkeeper: { x: 193, y: 589, w: 98, h: 116 },
  monster: { x: 717, y: 106, w: 102, h: 106 }
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    this.load.image(SHEET_KEY, SHEET_PATH);
  }

  create() {
    if (this.textures.exists(SHEET_KEY)) {
      this.createTexturesFromSheet();
    } else {
      this.createFallbackTextures();
    }

    this.scene.start('menu');
  }

  createTexturesFromSheet() {
    Object.entries(SPRITE_REGIONS).forEach(([key, region]) => {
      this.createTextureFromRegion(SHEET_KEY, key, region);
    });
  }

  createTextureFromRegion(sourceKey, outputKey, region) {
    const sourceImage = this.textures.get(sourceKey).getSourceImage();
    const texture = this.textures.createCanvas(outputKey, region.w, region.h);

    if (!texture) return;

    const ctx = texture.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, region.w, region.h);
    ctx.drawImage(
      sourceImage,
      region.x,
      region.y,
      region.w,
      region.h,
      0,
      0,
      region.w,
      region.h
    );

    texture.refresh();
  }

  createFallbackTextures() {
    this.createTileTexture('tile_grass', 0x3a7f4e);
    this.createTileTexture('tile_path', 0xa38d62);
    this.createTileTexture('tile_water', 0x2f5f9f);
    this.createTileTexture('tile_stone', 0x5d5d66);

    this.createCharacterTexture('player', 0x4ec9f2, 0x124055);
    this.createCharacterTexture('npc', 0xe4a672, 0x573b2f);
    this.createCharacterTexture('shopkeeper', 0x7be080, 0x285f2f);
    this.createCharacterTexture('monster', 0xe06c75, 0x5f252a);
  }

  createTileTexture(key, color) {
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
