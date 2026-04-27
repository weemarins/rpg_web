import {
  buildEnemy,
  computeBasicDamage,
  computeSkillDamage,
  getPlayerCombatStats,
  monsterAction,
  resolveVictory
} from '../systems/CombatSystem.js';
import { useConsumable } from '../systems/InventorySystem.js';
import { saveGame } from '../utils/storage.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle');
  }

  init(data) {
    this.globalState = data.globalState;
    this.enemy = buildEnemy(data.monsterId);
    this.turn = 'player';
  }

  create() {
    this.add.rectangle(480, 320, 960, 640, 0x111122, 0.92);

    this.add.text(40, 28, 'COMBATE POR TURNOS', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#ffd166'
    });

    this.playerSprite = this.add.sprite(180, 320, 'player').setScale(2.2);
    this.enemySprite = this.add.sprite(740, 280, 'monster').setScale(2.3);

    this.enemyText = this.add.text(580, 100, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff9aa3'
    });

    this.playerText = this.add.text(40, 430, '', {
      fontFamily: 'monospace',
      fontSize: '19px',
      color: '#d7ecff',
      lineSpacing: 6
    });

    this.logText = this.add.text(40, 540, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffe28a'
    });

    this.controlText = this.add.text(40, 600, '1: Ataque | 2: Habilidade (10 MP) | 3: Poção | 4: Fugir', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#d0d3ff'
    });

    this.input.keyboard.on('keydown-ONE', () => this.playerAction('attack'));
    this.input.keyboard.on('keydown-TWO', () => this.playerAction('skill'));
    this.input.keyboard.on('keydown-THREE', () => this.playerAction('potion'));
    this.input.keyboard.on('keydown-FOUR', () => this.playerAction('flee'));

    this.refreshUI();
    this.writeLog(`Um ${this.enemy.name} apareceu!`);
  }

  refreshUI() {
    const p = this.globalState.player;
    this.enemyText.setText(`${this.enemy.name}\nHP: ${this.enemy.hp}/${this.enemy.maxHp}`);
    this.playerText.setText(
      `${p.name}  Nv.${p.level}\nHP: ${p.hp}/${p.stats.maxHp}\nMP: ${p.mp}/${p.stats.maxMp}`
    );
  }

  writeLog(msg) {
    this.logText.setText(msg);
  }

  playerAction(type) {
    if (this.turn !== 'player') return;
    const p = this.globalState.player;
    const playerStats = getPlayerCombatStats(p);

    if (type === 'flee') {
      if (Math.random() < 0.45) return this.endBattle('Você fugiu com sucesso.');
      this.writeLog('Falha ao fugir!');
      this.turn = 'enemy';
      return this.time.delayedCall(450, () => this.enemyTurn());
    }

    if (type === 'potion') {
      const result = useConsumable(p, this.globalState.inventory, 'potion_small');
      if (!result.ok) return this.writeLog(result.msg);
      this.writeLog(result.msg);
      this.turn = 'enemy';
      this.refreshUI();
      return this.time.delayedCall(450, () => this.enemyTurn());
    }

    let damage = 0;
    if (type === 'attack') {
      damage = computeBasicDamage(playerStats, this.enemy);
    }

    if (type === 'skill') {
      if (p.mp < 10) return this.writeLog('MP insuficiente para habilidade.');
      p.mp -= 10;
      damage = computeSkillDamage({ str: playerStats.str + 2 }, this.enemy);
    }

    this.enemy.hp -= damage;
    this.writeLog(`Você causou ${damage} de dano.`);

    if (this.enemy.hp <= 0) {
      const rewards = resolveVictory(this.globalState, this.enemy);
      const summary = `Vitória! +${rewards.xp} XP, +${rewards.gold}g. ${rewards.dropMsg}`;
      saveGame(this.globalState);
      return this.endBattle(summary, { battleResult: { summary } });
    }

    this.turn = 'enemy';
    this.refreshUI();
    this.time.delayedCall(450, () => this.enemyTurn());
  }

  enemyTurn() {
    if (this.turn !== 'enemy') return;
    const p = this.globalState.player;
    const playerStats = getPlayerCombatStats(p);
    const action = monsterAction(this.enemy, playerStats);

    p.hp -= action.damage;
    this.writeLog(`${this.enemy.name} usou ${action.action === 'skill' ? 'golpe especial' : 'ataque'} e causou ${action.damage}.`);

    if (p.hp <= 0) {
      p.hp = Math.floor(p.stats.maxHp * 0.45);
      p.mp = Math.floor(p.stats.maxMp * 0.45);
      p.gold = Math.max(0, p.gold - 25);
      saveGame(this.globalState);
      return this.endBattle('Você foi derrotado... perdeu 25 ouro e recuou para a vila.', {
        battleResult: { summary: 'Derrota! Você perdeu ouro.' }
      });
    }

    this.turn = 'player';
    this.refreshUI();
  }

  endBattle(message, data = { battleResult: { summary: message } }) {
    this.writeLog(message);
    this.time.delayedCall(1200, () => {
      this.scene.stop();
      this.scene.resume('world', data);
    });
  }
}
