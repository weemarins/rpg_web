# SNES Pixel RPG (MVP Web)

Jogo RPG 2D no navegador com estética pixel art inspirada em SNES, usando **HTML + CSS + JavaScript + Phaser.js**.

## Como executar

1. Abra a pasta do projeto.
2. Inicie um servidor local simples (necessário por causa de módulos ES):

```bash
python3 -m http.server 8080
```

3. Abra `http://localhost:8080` no navegador.
4. Na tela inicial:
   - `N` = novo jogo
   - `C` = carregar save
   - `DEL` = apagar save

## Estrutura de pastas

```text
.
├── index.html
├── styles.css
├── src
│   ├── main.js
│   ├── config.js
│   ├── data
│   │   ├── items.js
│   │   └── monsters.js
│   ├── scenes
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── WorldScene.js
│   │   └── BattleScene.js
│   ├── systems
│   │   ├── CharacterSystem.js
│   │   ├── CombatSystem.js
│   │   ├── InventorySystem.js
│   │   └── QuestSystem.js
│   ├── ui
│   │   └── HUD.js
│   └── utils
│       ├── rng.js
│       └── storage.js
└── README.md
```

## Funcionalidades implementadas

- Criação de personagem (nome + classe).
- Atributos: HP, MP, Força, Defesa, Agilidade.
- Level up com curva de XP progressiva.
- Combate por turnos:
  - Ataque básico
  - Habilidade especial (custo de MP)
  - Uso de poção
  - Fuga
- IA de inimigo simples (ataque ou skill).
- Monstros por zonas (campo e dungeon).
- Spawn periódico no mapa.
- Sistema de drops com raridade/chance.
- XP e ouro por vitória.
- Inventário com limite de slots.
- Tipos de itens: armas, armaduras, consumíveis, materiais.
- Equipar, usar e vender itens.
- NPC de missões e NPC mercador.
- Missões de matar monstros e coletar item.
- Mapa em tiles com colisão (água bloqueia passagem).
- Persistência com LocalStorage (manual e automática após combate).
- HUD com informações de status.

## Assets e substituição futura

Agora a `BootScene` já tenta carregar automaticamente o arquivo `assets/rpg-snes-sheet.png` e recorta os sprites principais para os locais corretos (`player`, `npc`, `shopkeeper`, `monster`, `tile_grass`, `tile_path`, `tile_water`, `tile_stone`).

Se o arquivo não existir, o jogo entra em modo fallback com placeholders gerados em código.

Para usar arte real:

1. Salve a imagem-base enviada neste projeto em: `assets/rpg-snes-sheet.png`.
2. Mantenha as keys usadas no projeto (`player`, `monster`, `tile_grass`, etc.) para não quebrar cenas.
3. Se usar outro spritesheet, ajuste as coordenadas em `src/scenes/BootScene.js` (`SPRITE_REGIONS`).

## Observações

- O jogo foi modularizado para facilitar expansão.
- Pontos naturais de expansão:
  - árvores de habilidades
  - múltiplos mapas carregados por tilemap JSON real
  - sistema de áudio (SFX/BGM)
  - crafting e equipamentos por slot avançado
  - diálogo com múltiplas escolhas
