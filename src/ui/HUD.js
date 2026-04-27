export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.root = scene.add.container(10, 10).setScrollFactor(0).setDepth(1000);
    this.bg = scene.add.rectangle(0, 0, 365, 130, 0x000000, 0.62).setOrigin(0, 0);
    this.text = scene.add
      .text(12, 10, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        lineSpacing: 6
      })
      .setOrigin(0, 0);

    this.message = scene.add
      .text(12, 94, '', { fontFamily: 'monospace', fontSize: '14px', color: '#ffe28a' })
      .setOrigin(0, 0);

    this.root.add([this.bg, this.text, this.message]);
  }

  update(state) {
    const p = state.player;
    this.text.setText([
      `${p.name} (${p.className}) Nv.${p.level}  Ouro: ${p.gold}`,
      `HP ${p.hp}/${p.stats.maxHp}  MP ${p.mp}/${p.stats.maxMp}`,
      `XP ${p.xp}/${p.xpToNext}  STR ${p.stats.str} DEF ${p.stats.def} AGI ${p.stats.agi}`
    ]);
  }

  setMessage(msg) {
    this.message.setText(msg);
    this.scene.time.delayedCall(3600, () => {
      this.message.setText('');
    });
  }
}
