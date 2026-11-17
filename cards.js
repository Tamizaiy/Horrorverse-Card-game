/* HORRORVERSE Alpha 19 — catálogo atualizado pelas artes. IDs estáveis preservam os baralhos salvos. */
(function(root){
root.HV_DATA={
  "E": {
    "DRAW": "DRAW",
    "BUFF": "BUFF",
    "DESTROY": "DESTROY",
    "NEGATE": "NEGATE",
    "PROTECT": "PROTECT",
    "SANITY": "SANITY",
    "COUNTER": "COUNTER",
    "TOKEN": "TOKEN",
    "FIELD": "FIELD",
    "REVIVE": "REVIVE",
    "SEAL": "SEAL",
    "CONTROL": "CONTROL",
    "HEAL": "HEAL",
    "SUMMON": "SUMMON",
    "AURA": "AURA",
    "BATTLE_ATK": "BATTLE_ATK",
    "PREVENT_DEF": "PREVENT_DEF",
    "PREVENT_SANITY": "PREVENT_SANITY",
    "IMMUNE_LOW_ATK": "IMMUNE_LOW_ATK",
    "TRANSFER_FEAR": "TRANSFER_FEAR"
  },
  "CARD_LIBRARY": [
    {
      "id": "ghostface",
      "name": "O Rosto do Silêncio",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Assassino",
      "atk": 4,
      "def": 3,
      "terror": 2,
      "emoji": "🔪",
      "art": "assets/ghostface.webp",
      "text": "Invocação comum: você pode Invocar este Ser sem consumir materiais.\n\nQuando este Ser causar dano de combate, o oponente perde 1 ponto de Sanidade.",
      "effects": [
        {
          "op": "SANITY",
          "target": "enemyPlayer",
          "amount": -1,
          "when": "onCombatDamage"
        }
      ]
    },
    {
      "id": "cultista",
      "name": "Cultista do Véu",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Ocultista",
      "atk": 2,
      "def": 4,
      "terror": 2,
      "emoji": "🕯️",
      "text": "Invocação comum: você pode Invocar este Ser sem consumir materiais.\n\nEste Ser não possui habilidade adicional.",
      "effects": [],
      "art": "assets/cultista.webp"
    },
    {
      "id": "vigia",
      "name": "Vigia Sombrio",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espectral",
      "atk": 3,
      "def": 3,
      "terror": 1,
      "emoji": "👁️",
      "text": "Invocação comum: você pode Invocar este Ser sem consumir materiais.\n\nEste Ser não possui habilidade adicional.",
      "effects": [],
      "art": "assets/vigia.webp"
    },
    {
      "id": "sadako",
      "name": "A Dama da Frequência Morta",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Espectral",
      "atk": 5,
      "def": 5,
      "terror": 7,
      "emoji": "👻",
      "art": "assets/sadako.webp",
      "summon": {
        "items": 1
      },
      "text": "Invocação especial: consuma 1 Item aliado no campo.\n\nAo ser Invocada, coloque 1 contador de Medo em até 2 Seres inimigos.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "enemySer",
          "counter": "medo",
          "amount": 1,
          "maxTargets": 2,
          "optional": true,
          "when": "onSummon"
        }
      ]
    },
    {
      "id": "jason",
      "name": "O Carrasco do Lago",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Carnificina",
      "atk": 7,
      "def": 7,
      "terror": 3,
      "emoji": "🪓",
      "art": "assets/jason.webp",
      "summon": {
        "sacrifices": 1
      },
      "text": "Invocação especial: sacrifique 1 Ser aliado.\n\nAo ser Invocado, destrua 1 Item ou Magia no campo.",
      "effects": [
        {
          "op": "DESTROY",
          "target": "anySupport",
          "when": "onSummon"
        }
      ]
    },
    {
      "id": "pennywise",
      "name": "O Bufão da Agonia",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Entidade",
      "atk": 5,
      "def": 5,
      "terror": 8,
      "emoji": "🎈",
      "summon": {
        "spells": 1
      },
      "text": "Invocação especial: consuma 1 Magia aliada no campo.\n\nAo ser Invocado, o oponente perde 1 ponto de Sanidade.",
      "effects": [
        {
          "op": "SANITY",
          "amount": -1,
          "target": "enemyPlayer",
          "when": "onSummon"
        }
      ],
      "art": "assets/pennywise.webp"
    },
    {
      "id": "xenomorfo",
      "name": "O Predador Quitinoso",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Aberração",
      "atk": 7,
      "def": 5,
      "terror": 3,
      "emoji": "👽",
      "summon": {
        "sacrifices": 1
      },
      "text": "Invocação especial: sacrifique 1 Ser aliado.\n\nQuando este Ser destruir um inimigo em combate, compre 1 carta.",
      "effects": [
        {
          "op": "DRAW",
          "target": "selfPlayer",
          "amount": 1,
          "when": "onCombatDestroy"
        }
      ],
      "art": "assets/xenomorfo.webp"
    },
    {
      "id": "cthulhu",
      "name": "O Devorador de Constelações",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Cósmico",
      "atk": 9,
      "def": 9,
      "terror": 9,
      "emoji": "🐙",
      "summon": {
        "sacrifices": 2,
        "items": 1
      },
      "text": "Invocação especial: sacrifique 2 Seres aliados e consuma 1 Item aliado no campo.\n\nAo ser Invocado, o oponente perde 2 pontos de Sanidade.",
      "effects": [
        {
          "op": "SANITY",
          "amount": -2,
          "target": "enemyPlayer",
          "when": "onSummon"
        }
      ],
      "art": "assets/cthulhu.webp"
    },
    {
      "id": "fita",
      "name": "Fita Amaldiçoada",
      "kind": "item",
      "emoji": "📼",
      "art": "assets/fita.webp",
      "text": "Escolha 1 Ser inimigo em campo e coloque 1 Contador de Medo nele. O contador é removido quando esse Ser deixa o campo.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "enemySer",
          "counter": "medo",
          "amount": 1
        }
      ],
      "cardSubtype": "Artefato"
    },
    {
      "id": "necro",
      "name": "Necronomicon",
      "kind": "item",
      "emoji": "📖",
      "text": "Compre 1 carta do seu monte. Se não houver cartas nesse monte, não compre nenhuma.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "DRAW",
          "target": "selfPlayer",
          "amount": 1
        }
      ],
      "art": "assets/necro.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "amuleto",
      "name": "Amuleto Corrompido",
      "kind": "item",
      "emoji": "🧿",
      "text": "Escolha 1 Ser aliado em campo. Ele recebe 1 Escudo. Quando seria destruído por combate ou efeito, remova o Escudo em vez de destruí-lo.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "PROTECT",
          "target": "allySer",
          "amount": 1
        }
      ],
      "art": "assets/amuleto.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "lamina",
      "name": "Lâmina Ritual",
      "kind": "item",
      "emoji": "🗡️",
      "text": "Escolha 1 Ser aliado em campo. Ele recebe +2 ATK até a segunda transição de turno.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "BUFF",
          "target": "allySer",
          "stat": "atk",
          "amount": 2,
          "duration": 2
        }
      ],
      "art": "assets/lamina.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "moeda",
      "name": "Moeda dos Mortos",
      "kind": "item",
      "emoji": "🪙",
      "text": "Invoque 1 Token “Sombra Invocada” (ATK 1 / DEF 1 / TERROR 1) na primeira casa livre da sua fileira de Seres. Se não houver casa livre, não invoque o Token.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "TOKEN",
          "target": "selfPlayer",
          "atk": 1,
          "def": 1,
          "name": "Sombra Invocada"
        }
      ],
      "art": "assets/moeda.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "rlyeh",
      "name": "Círculo de R’lyeh",
      "kind": "magia",
      "subtype": "field",
      "emoji": "🌀",
      "art": "assets/rlyeh.webp",
      "text": "Enquanto este Feitiço de Campo estiver na sua fileira de suporte, todos os seus Seres de afinidade Cósmica recebem +2 ATK.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Cósmico",
          "stat": "atk",
          "amount": 2
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "corte",
      "name": "Corte Sangrento",
      "kind": "magia",
      "emoji": "🩸",
      "text": "Escolha 1 Ser inimigo em campo e tente destruí-lo. Se o alvo tiver um Escudo, remova 1 Escudo em vez de destruí-lo.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "DESTROY",
          "target": "enemySer"
        }
      ],
      "art": "assets/corte.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "exorcismo",
      "name": "Exorcismo",
      "kind": "magia",
      "emoji": "✝️",
      "text": "Escolha e destrua 1 Item ou Feitiço na fileira de suporte do adversário. Um Feitiço de Campo ou uma Reação preparada também pode ser escolhido.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "DESTROY",
          "target": "enemySupport"
        }
      ],
      "art": "assets/exorcismo.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "pesadelo",
      "name": "Pesadelo Persistente",
      "kind": "magia",
      "emoji": "🌒",
      "text": "O adversário perde 2 pontos de Sanidade. Se a Sanidade chegar a 0, o duelo termina por Loucura.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "SANITY",
          "target": "enemyPlayer",
          "amount": -2
        }
      ],
      "art": "assets/pesadelo.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "ritual",
      "name": "Ritual de Ruína",
      "kind": "magia",
      "emoji": "🔮",
      "text": "Escolha 1 Ser inimigo em campo. Ele recebe −2 DEF até a segunda transição de turno. A DEF efetiva nunca fica abaixo de 0.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "BUFF",
          "target": "enemySer",
          "stat": "def",
          "amount": -2,
          "duration": 2
        }
      ],
      "art": "assets/ritual.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "selo",
      "name": "Selo do Silêncio",
      "kind": "magia",
      "emoji": "🔒",
      "text": "Escolha 1 Ser inimigo em campo. Ele não pode declarar ataques até a segunda transição de turno. O selo não impede habilidades passivas nem o uso como material de Invocação.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "SEAL",
          "target": "enemySer",
          "duration": 2
        }
      ],
      "art": "assets/selo.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "interdicao",
      "name": "Interdição Arcana",
      "kind": "magia",
      "subtype": "reaction",
      "emoji": "⚡",
      "text": "Prepare esta carta na sua fileira de suporte. Quando o adversário ativar um Item ou Feitiço comum, você pode consumir esta carta para negar o efeito. Não reage a ataques, Invocações ou Feitiços de Campo.",
      "effects": [
        {
          "op": "NEGATE",
          "target": "pending"
        }
      ],
      "art": "assets/interdicao.webp",
      "cardSubtype": "Reação"
    },
    {
      "id": "michael",
      "name": "O Vulto de Outubro",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Assassino",
      "atk": 4,
      "def": 3,
      "terror": 2,
      "emoji": "🎃",
      "text": "Invocação comum: você pode Invocar este Ser sem consumir materiais.\n\nQuando este Ser for Invocado, ele recebe +1 DEF até o fim do turno.",
      "effects": [
        {
          "op": "BUFF",
          "target": "selfSer",
          "stat": "def",
          "amount": 1,
          "duration": 0,
          "when": "onSummon"
        }
      ],
      "art": "assets/michael.webp"
    },
    {
      "id": "sobrevivente",
      "name": "Sobrevivente Tenaz",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Humano",
      "atk": 2,
      "def": 5,
      "terror": 1,
      "emoji": "🔦",
      "text": "Invocação comum: você pode Invocar este Ser sem consumir materiais.\n\nEste Ser não possui habilidade adicional.",
      "effects": [],
      "art": "assets/sobrevivente.webp"
    },
    {
      "id": "espectro",
      "name": "Espectro Errante",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espiritual",
      "atk": 3,
      "def": 3,
      "terror": 4,
      "emoji": "🌫️",
      "text": "Invocação comum: você pode Invocar este Ser sem consumir materiais.\n\nEste Ser não possui habilidade adicional.",
      "effects": [],
      "art": "assets/espectro.webp"
    },
    {
      "id": "pinhead",
      "name": "O Confessor de Ferro",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Infernal",
      "atk": 6,
      "def": 6,
      "terror": 6,
      "emoji": "⛓️",
      "summon": {
        "items": 1
      },
      "text": "Invocação especial: consuma 1 Item aliado no campo.\n\nAo ser Invocado, conceda 1 Escudo a outro Ser aliado.",
      "effects": [
        {
          "op": "PROTECT",
          "target": "allySer",
          "excludeSource": true,
          "amount": 1,
          "when": "onSummon"
        }
      ],
      "art": "assets/pinhead.webp"
    },
    {
      "id": "bruxa",
      "name": "Bruxa do Eclipse",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Ocultista",
      "atk": 5,
      "def": 5,
      "terror": 6,
      "emoji": "🧙",
      "summon": {
        "spells": 1
      },
      "text": "Invocação especial: consuma 1 Magia aliada preparada no campo.\n\nEste Ser não possui habilidade adicional.",
      "effects": [],
      "art": "assets/bruxa.webp",
      "periculosidade": 4
    },
    {
      "id": "fera",
      "name": "Aberração Escarlate",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Aberração",
      "atk": 8,
      "def": 5,
      "terror": 2,
      "emoji": "🧬",
      "summon": {
        "sacrifices": 1
      },
      "text": "Invocação especial: sacrifique 1 Ser aliado no campo.\n\nEste Ser não possui habilidade adicional.",
      "effects": [],
      "art": "assets/fera.webp",
      "periculosidade": 3
    },
    {
      "id": "espelho",
      "name": "Espelho Possuído",
      "kind": "item",
      "emoji": "🪞",
      "text": "Recupere 1 ponto de Sanidade. Sua Sanidade não pode ultrapassar 10.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "HEAL",
          "target": "selfPlayer",
          "amount": 1
        }
      ],
      "art": "assets/espelho.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "grilhoes",
      "name": "Grilhões Enferrujados",
      "kind": "item",
      "emoji": "🔗",
      "text": "Escolha 1 Ser inimigo em campo. Ele recebe −1 ATK até a segunda transição de turno. O ATK efetivo nunca fica abaixo de 0.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "BUFF",
          "target": "enemySer",
          "stat": "atk",
          "amount": -1,
          "duration": 2
        }
      ],
      "art": "assets/grilhoes.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "velas",
      "name": "Velas do Ritual",
      "kind": "item",
      "emoji": "🕯️",
      "text": "Compre 1 carta do seu monte. Se não houver cartas nesse monte, não compre nenhuma.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "DRAW",
          "target": "selfPlayer",
          "amount": 1
        }
      ],
      "art": "assets/velas.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "manuscrito",
      "name": "Manuscrito Proibido",
      "kind": "item",
      "emoji": "📜",
      "text": "Escolha 1 Ser aliado em campo. Ele recebe 1 Escudo. Quando seria destruído por combate ou efeito, remova o Escudo em vez de destruí-lo.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "PROTECT",
          "target": "allySer",
          "amount": 1
        }
      ],
      "art": "assets/manuscrito.webp",
      "cardSubtype": "Artefato"
    },
    {
      "id": "bruma",
      "name": "Bruma do Medo",
      "kind": "magia",
      "emoji": "🌫️",
      "text": "O adversário perde 1 ponto de Sanidade. Se a Sanidade chegar a 0, o duelo termina por Loucura.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "SANITY",
          "target": "enemyPlayer",
          "amount": -1
        }
      ],
      "art": "assets/bruma.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "reviver",
      "name": "Rito de Retorno",
      "kind": "magia",
      "emoji": "⚰️",
      "text": "Escolha 1 Ser do seu descarte. Traga-o de volta à primeira casa livre na sua fileira de Seres, sem dano acumulado ou modificadores temporários. Sem espaço livre ou Ser no descarte, a ressurreição não ocorre.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "REVIVE",
          "target": "allyGraveSer"
        }
      ],
      "art": "assets/reviver.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "cripta",
      "name": "Cripta Vazia",
      "kind": "magia",
      "subtype": "field",
      "emoji": "🏚️",
      "text": "Enquanto este Feitiço de Campo estiver na sua fileira de suporte, todos os seus Seres de afinidade Espectral recebem +1 DEF.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Espectral",
          "stat": "def",
          "amount": 1
        }
      ],
      "art": "assets/cripta.webp",
      "cardSubtype": "Campo"
    },
    {
      "id": "frenesi",
      "name": "Frenesi Sangrento",
      "kind": "magia",
      "emoji": "⚔️",
      "text": "Escolha 1 Ser aliado em campo. Ele recebe +2 ATK até a segunda transição de turno.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "BUFF",
          "target": "allySer",
          "stat": "atk",
          "amount": 2,
          "duration": 2
        }
      ],
      "art": "assets/frenesi.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "amaldicoar",
      "name": "Marca da Loucura",
      "kind": "magia",
      "emoji": "👁️",
      "text": "Escolha 1 Ser inimigo em campo e coloque 2 Contadores de Medo nele. Os contadores somem se o alvo deixar o campo e não reduzem a Sanidade automaticamente.\n\nA carta é consumida após resolver o efeito.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "enemySer",
          "counter": "medo",
          "amount": 2
        }
      ],
      "art": "assets/amaldicoar.webp",
      "cardSubtype": "Normal"
    },
    {
      "id": "testemunha",
      "name": "Testemunha do Horror",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Humano",
      "atk": 1,
      "terror": 3,
      "periculosidade": 2,
      "art": "assets/testemunha.webp",
      "text": "Quando receber 1 ou mais Contadores de Medo, compre 1 carta. Uma vez por turno.",
      "effects": [
        {
          "op": "DRAW",
          "when": "onFearGain",
          "once": true,
          "amount": 1
        }
      ],
      "def": 4
    },
    {
      "id": "cobrador",
      "name": "Cobrador do Abismo",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Cósmico",
      "atk": 6,
      "terror": 6,
      "periculosidade": 4,
      "art": "assets/cobrador.webp",
      "text": "Invocação especial: remova 3 Contadores de Medo do campo. Ao ser invocado, coloque 1 Contador de Medo em cada Ser inimigo.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "allEnemySer",
          "when": "onSummon",
          "amount": 1
        }
      ],
      "def": 5,
      "summon": {
        "fearSpend": 3
      }
    },
    {
      "id": "vigario",
      "name": "Vigário da Loucura",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Ocultista",
      "atk": 4,
      "terror": 5,
      "periculosidade": 3,
      "art": "assets/vigario.webp",
      "text": "Invocação especial: invoque sem consumir contadores se houver ao menos 4 Contadores de Medo no campo.",
      "effects": [],
      "def": 4,
      "summon": {
        "fearRequired": 4
      }
    },
    {
      "id": "executor",
      "name": "Executor da Agonia",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Carnificina",
      "atk": 5,
      "terror": 4,
      "periculosidade": 3,
      "art": "assets/executor.webp",
      "text": "Uma vez por turno, destrua 1 Ser no campo com 3 ou mais Contadores de Medo.",
      "effects": [
        {
          "op": "DESTROY",
          "target": "anySer",
          "minFear": 3,
          "when": "manual"
        }
      ],
      "def": 4
    },
    {
      "id": "devorador_pavor",
      "name": "Devorador de Pavor",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Entidade",
      "atk": 5,
      "terror": 5,
      "periculosidade": 4,
      "art": "assets/devorador_pavor.webp",
      "text": "Uma vez por turno, remova 2 Contadores de Medo do campo. Este Ser ganha +2 ATK até o fim do turno.",
      "effects": [
        {
          "op": "BUFF",
          "target": "selfSer",
          "stat": "atk",
          "amount": 2,
          "when": "manual",
          "fearSpend": 2
        }
      ],
      "def": 5
    },
    {
      "id": "carcaca",
      "name": "Carcaça do Pânico",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Aberração",
      "atk": 3,
      "terror": 4,
      "periculosidade": 3,
      "art": "assets/carcaca.webp",
      "text": "Enquanto estiver no campo, cada Ser com 2 ou mais Contadores de Medo perde 1 DEF.",
      "effects": [
        {
          "op": "AURA",
          "stat": "def",
          "amount": -1,
          "minFear": 2
        }
      ],
      "def": 6
    },
    {
      "id": "eco",
      "name": "Eco da Ruína Interior",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espectral",
      "atk": 2,
      "terror": 6,
      "periculosidade": 3,
      "art": "assets/eco.webp",
      "text": "Ao fim do seu turno, se houver um Ser inimigo com 2 ou mais Contadores de Medo, o adversário perde 1 Sanidade.",
      "effects": [
        {
          "op": "SANITY",
          "target": "enemyPlayer",
          "when": "onTurnEnd",
          "enemyFear": 2,
          "amount": -1
        }
      ],
      "def": 4
    },
    {
      "id": "noiva",
      "name": "Noiva do Lamento",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espiritual",
      "atk": 3,
      "terror": 5,
      "periculosidade": 3,
      "art": "assets/noiva.webp",
      "text": "Ao entrar em campo, você pode transferir 1 ou 2 Contadores de Medo de um Ser para outro.",
      "effects": [
        {
          "op": "TRANSFER_FEAR",
          "when": "onEnter",
          "maxTargets": 2
        }
      ],
      "def": 4
    },
    {
      "id": "oraculo",
      "name": "Oráculo da Penumbra",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Ocultista",
      "atk": 2,
      "terror": 4,
      "periculosidade": 3,
      "art": "assets/oraculo.webp",
      "text": "Uma vez por turno, escolha 1 Ser. Ele perde 1 ATK para cada 2 Contadores de Medo que tiver, até o fim do turno.",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "atk",
          "amount": -1,
          "perFear": 2,
          "when": "manual"
        }
      ],
      "def": 5
    },
    {
      "id": "portador",
      "name": "Portador da Máscara Oca",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Assassino",
      "atk": 4,
      "terror": 3,
      "periculosidade": 3,
      "art": "assets/portador.webp",
      "text": "Ao causar dano de combate a um Ser inimigo que sobreviver, coloque 1 Contador de Medo nele.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "combatTarget",
          "when": "onCombatDamage",
          "amount": 1
        }
      ],
      "def": 3
    },
    {
      "id": "zumbi",
      "name": "Zumbi Errante",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espectral",
      "atk": 2,
      "terror": 3,
      "periculosidade": 2,
      "art": "assets/zumbi.webp",
      "text": "Quando este Ser é destruído, coloque 1 Contador de Medo em 1 Ser do oponente.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "enemySer",
          "when": "onDestroyed",
          "amount": 1
        }
      ],
      "def": 4
    },
    {
      "id": "esqueleto",
      "name": "Esqueleto Reanimado",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espiritual",
      "atk": 3,
      "terror": 2,
      "periculosidade": 2,
      "art": "assets/esqueleto.webp",
      "text": "Quando atacar um Ser com DEF 0 ou atacar diretamente, o adversário perde 1 ponto adicional de Sanidade.",
      "effects": [
        {
          "op": "SANITY",
          "target": "enemyPlayer",
          "when": "onZeroDefenseAttack",
          "amount": -1
        }
      ],
      "def": 2
    },
    {
      "id": "espantalho",
      "name": "Espantalho Maldito",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Ocultista",
      "atk": 2,
      "terror": 4,
      "periculosidade": 3,
      "art": "assets/espantalho.webp",
      "text": "Enquanto estiver em campo, outros Seres aliados com ATK 3 ou menos (antes deste tipo de bônus) recebem +1 ATK.",
      "effects": [
        {
          "op": "AURA",
          "stat": "atk",
          "amount": 1,
          "maxAttack": 3,
          "allyOnly": true,
          "excludeSource": true
        }
      ],
      "def": 6
    },
    {
      "id": "morcego",
      "name": "Morcego Vampírico",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Aberração",
      "atk": 3,
      "terror": 3,
      "periculosidade": 3,
      "art": "assets/morcego.webp",
      "text": "Quando causar dano de combate, compre 1 carta.",
      "effects": [
        {
          "op": "DRAW",
          "when": "onCombatDamage",
          "amount": 1
        }
      ],
      "def": 2
    },
    {
      "id": "boneca",
      "name": "Boneca Possuída",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Entidade",
      "atk": 2,
      "terror": 4,
      "periculosidade": 3,
      "art": "assets/boneca.webp",
      "text": "Uma vez por turno, você pode colocar 1 Contador de Medo em 1 Ser no campo.",
      "effects": [
        {
          "op": "COUNTER",
          "target": "anySer",
          "when": "manual",
          "amount": 1
        }
      ],
      "def": 5
    },
    {
      "id": "lobisomem_jovem",
      "name": "Lobisomem Jovem",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Aberração",
      "atk": 5,
      "terror": 3,
      "periculosidade": 4,
      "art": "assets/lobisomem_jovem.webp",
      "text": "Se for destruído em combate, você pode invocar 1 Lobisomem Adulto da mão sem pagar seu custo.",
      "effects": [
        {
          "op": "SUMMON",
          "when": "onCombatDestroyed",
          "cardId": "lobisomem_adulto"
        }
      ],
      "def": 3
    },
    {
      "id": "mumia",
      "name": "Múmia Desperta",
      "kind": "ser",
      "rarity": "comum",
      "affinity": "Espiritual",
      "atk": 3,
      "terror": 5,
      "periculosidade": 4,
      "art": "assets/mumia.webp",
      "text": "Não pode ser destruída por cartas que tenham ATK 4 ou menos.",
      "effects": [
        {
          "op": "IMMUNE_LOW_ATK",
          "amount": 4
        }
      ],
      "def": 6
    },
    {
      "id": "aparicao",
      "name": "Aparição Noturna",
      "kind": "ser",
      "rarity": "especial",
      "affinity": "Espectral",
      "atk": 2,
      "terror": 5,
      "periculosidade": 3,
      "art": "assets/aparicao.webp",
      "text": "Invocação especial: escolha 1 Ser aliado em campo. Ignore toda a DEF dele até o fim do turno como custo.",
      "effects": [],
      "def": 4,
      "summon": {
        "zeroAllyDef": 1
      }
    },
    {
      "id": "beco",
      "name": "Beco da Última Respiração",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/beco.webp",
      "text": "Seus Assassinos recebem +1 ATK. Quando um Assassino aliado destruir um Ser inimigo em combate, o adversário perde 1 Sanidade.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Assassino",
          "stat": "atk",
          "amount": 1
        },
        {
          "op": "SANITY",
          "target": "enemyPlayer",
          "when": "onAllyCombatDestroy",
          "affinity": "Assassino",
          "amount": -1
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "fenda",
      "name": "Fenda Rubra",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/fenda.webp",
      "text": "Seus Seres Infernais recebem +1 ATK e +1 TERROR.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Infernal",
          "stat": "atk",
          "amount": 1
        },
        {
          "op": "FIELD",
          "affinity": "Infernal",
          "stat": "terror",
          "amount": 1
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "santuario",
      "name": "Santuário do Véu Negro",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/santuario.webp",
      "text": "Seus Ocultistas recebem +1 DEF. Uma vez por turno, ao ativar um Item ou Feitiço, escolha 1 Ocultista aliado: ele recebe +1 ATK até o fim do turno.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Ocultista",
          "stat": "def",
          "amount": 1
        },
        {
          "op": "BUFF",
          "when": "onSupportActivation",
          "target": "allySer",
          "targetAffinity": "Ocultista",
          "stat": "atk",
          "amount": 1,
          "once": true
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "matadouro",
      "name": "Matadouro Profano",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/matadouro.webp",
      "text": "Quando um Ser Carnificina aliado declarar um ataque no seu turno, ele recebe +2 ATK apenas para aquela batalha.",
      "effects": [
        {
          "op": "BATTLE_ATK",
          "affinity": "Carnificina",
          "amount": 2
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "poco",
      "name": "Poço Mutagênico",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/poco.webp",
      "text": "Suas Aberrações recebem +1 DEF. Uma vez por turno, anule a primeira redução de DEF que um efeito do oponente aplicar a uma Aberração aliada.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Aberração",
          "stat": "def",
          "amount": 1
        },
        {
          "op": "PREVENT_DEF",
          "affinity": "Aberração",
          "once": true
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "trono",
      "name": "Trono do Véu Eterno",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/trono.webp",
      "text": "Suas Entidades recebem +1 TERROR. Uma vez por turno, ao invocar uma Entidade, você pode conceder 1 Escudo a ela.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Entidade",
          "stat": "terror",
          "amount": 1
        },
        {
          "op": "PROTECT",
          "when": "onAllySummon",
          "affinity": "Entidade",
          "target": "eventSer",
          "amount": 1,
          "once": true,
          "optional": true
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "refugio",
      "name": "Refúgio dos Sobreviventes",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/refugio.webp",
      "text": "Seus Humanos recebem +1 DEF. Se controlar ao menos 2 Humanos, reduza em 1 a primeira perda de Sanidade de cada turno.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Humano",
          "stat": "def",
          "amount": 1
        },
        {
          "op": "PREVENT_SANITY",
          "affinity": "Humano",
          "amount": 1,
          "once": true
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "limiar",
      "name": "Limiar das Almas",
      "kind": "magia",
      "subtype": "field",
      "art": "assets/limiar.webp",
      "text": "Seus Seres Espirituais recebem +1 TERROR. Uma vez por turno, quando um Espiritual entrar no seu campo, você pode colocar 1 Contador de Medo em 1 Ser inimigo.",
      "effects": [
        {
          "op": "FIELD",
          "affinity": "Espiritual",
          "stat": "terror",
          "amount": 1
        },
        {
          "op": "COUNTER",
          "when": "onAllyEnter",
          "affinity": "Espiritual",
          "target": "enemySer",
          "amount": 1,
          "once": true,
          "optional": true
        }
      ],
      "cardSubtype": "Campo"
    },
    {
      "id": "cobertura_defensiva",
      "name": "Cobertura Defensiva",
      "kind": "magia",
      "subtype": "reaction",
      "text": "Ative quando 1 Ser inimigo declarar um ataque contra 1 Ser seu. Negue esse ataque.",
      "art": "assets/cobertura_defensiva.webp",
      "effects": [
        {
          "op": "NEGATE"
        }
      ],
      "reactionEvent": "attack",
      "cardSubtype": "Reação",
      "periculosidade": 3
    },
    {
      "id": "bandagens_campanha",
      "name": "Bandagens de Campanha",
      "kind": "magia",
      "subtype": "normal",
      "text": "Escolha 1 Ser Humano que você controla. Cure 1 ponto de Terror desse Ser.",
      "art": "assets/bandagens_campanha.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "healTerror",
          "target": "allySer",
          "targetAffinity": "Humano"
        }
      ],
      "cardSubtype": "Suporte",
      "periculosidade": 2
    },
    {
      "id": "correntes_condenacao",
      "name": "Correntes da Condenação",
      "kind": "item",
      "subtype": "normal",
      "text": "Escolha 1 Ser inimigo com 1 ou mais Contadores de Medo. Destrua esse Ser. Sem um alvo válido, este Item não pode ser ativado.",
      "art": "assets/correntes_condenacao.webp",
      "effects": [
        {
          "op": "DESTROY",
          "target": "enemySer",
          "minFear": 1
        }
      ],
      "cardSubtype": "Relíquia",
      "periculosidade": 5
    },
    {
      "id": "leitura_tatica",
      "name": "Leitura Tática",
      "kind": "magia",
      "subtype": "normal",
      "text": "Olhe todas as cartas na mão do seu oponente.",
      "art": "assets/leitura_tatica.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "reveal"
        }
      ],
      "cardSubtype": "Investigação",
      "periculosidade": 2
    },
    {
      "id": "balanca_pavor",
      "name": "Balança do Pavor",
      "kind": "item",
      "subtype": "normal",
      "text": "Redistribua todos os Contadores de Medo igualmente entre todos os Seres do campo. Escolha quais Seres recebem os contadores excedentes.",
      "art": "assets/balanca_pavor.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "balance"
        }
      ],
      "cardSubtype": "Artefato",
      "periculosidade": 4
    },
    {
      "id": "destruicao_mutua",
      "name": "Destruição Mútua Assegurada",
      "kind": "magia",
      "subtype": "normal",
      "text": "Escolha 1 Ser seu e 1 Ser do oponente. Envie ambos para a pilha de descarte.",
      "art": "assets/destruicao_mutua.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "mutual"
        }
      ],
      "cardSubtype": "Sacrifício",
      "periculosidade": 5
    },
    {
      "id": "distintivo_sobrevivente",
      "name": "Distintivo do Sobrevivente",
      "kind": "item",
      "subtype": "normal",
      "text": "Escolha 1 Ser Humano no seu descarte com ATK 3 ou menos. Adicione essa carta à sua mão.",
      "art": "assets/distintivo_sobrevivente.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "recoverHuman"
        }
      ],
      "cardSubtype": "Insígnia",
      "periculosidade": 2
    },
    {
      "id": "protecao_emergencia",
      "name": "Proteção de Emergência",
      "kind": "magia",
      "subtype": "normal",
      "text": "Até o final da rodada, todos os Seres em campo recebem 1 Escudo.",
      "art": "assets/protecao_emergencia.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "roundShield"
        }
      ],
      "cardSubtype": "Tática",
      "periculosidade": 3
    },
    {
      "id": "ampulheta_colapso",
      "name": "Ampulheta do Colapso",
      "kind": "item",
      "subtype": "normal",
      "text": "Remova todos os Contadores de Medo dos Seres no campo. Seu oponente perde Sanidade igual à metade do total removido, arredondando para baixo.",
      "art": "assets/ampulheta_colapso.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "fearDamage"
        }
      ],
      "cardSubtype": "Artefato",
      "periculosidade": 6
    },
    {
      "id": "desvio_alvo",
      "name": "Desvio de Alvo",
      "kind": "magia",
      "subtype": "reaction",
      "text": "Ative quando 1 Ser inimigo declarar um ataque contra 1 Ser seu. Escolha outro alvo válido que você controla. O ataque passa a mirar o novo alvo.",
      "art": "assets/desvio_alvo.webp",
      "effects": [
        {
          "op": "REDIRECT"
        }
      ],
      "reactionEvent": "attack",
      "cardSubtype": "Reação",
      "periculosidade": 4
    },
    {
      "id": "cofre_reconstituicao",
      "name": "Cofre da Reconstituição",
      "kind": "item",
      "subtype": "normal",
      "text": "Escolha até 5 cartas no seu descarte e embaralhe-as no baralho. Depois, compre 2 cartas e descarte 1 carta da sua mão.",
      "art": "assets/cofre_reconstituicao.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "rebuild"
        }
      ],
      "cardSubtype": "Reserva",
      "periculosidade": 5
    },
    {
      "id": "arquivador_restos",
      "name": "Arquivador dos Restos",
      "kind": "item",
      "subtype": "normal",
      "text": "Descarte 2 cartas da sua mão. Depois, escolha até 2 cartas no seu descarte e adicione-as à sua mão.",
      "art": "assets/arquivador_restos.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "recoverTwo"
        }
      ],
      "discardCost": 2,
      "cardSubtype": "Artefato",
      "periculosidade": 4
    },
    {
      "id": "relicario_retomada",
      "name": "Relicário da Retomada",
      "kind": "item",
      "subtype": "normal",
      "text": "Escolha até 2 Itens e/ou Feitiços no seu descarte. Embaralhe essas cartas no seu baralho.",
      "art": "assets/relicario_retomada.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "recycle"
        }
      ],
      "cardSubtype": "Relicário",
      "periculosidade": 3
    },
    {
      "id": "calice_serenidade",
      "name": "Cálice da Serenidade Profana",
      "kind": "item",
      "subtype": "normal",
      "text": "Remova todos os Contadores de Medo dos Seres no campo. Recupere Sanidade igual à metade do total removido, arredondando para baixo.",
      "art": "assets/calice_serenidade.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "fearHeal"
        }
      ],
      "cardSubtype": "Relíquia",
      "periculosidade": 4
    },
    {
      "id": "bolsa_triagem",
      "name": "Bolsa da Triagem Sombria",
      "kind": "item",
      "subtype": "normal",
      "text": "Descarte exatamente 3 cartas da sua mão. Depois, compre 3 cartas.",
      "art": "assets/bolsa_triagem.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "drawThree"
        }
      ],
      "discardCost": 3,
      "cardSubtype": "Suprimento",
      "periculosidade": 3
    },
    {
      "id": "recalibrar_postura",
      "name": "Recalibrar Postura",
      "kind": "magia",
      "subtype": "normal",
      "text": "Escolha 1 Ser em campo. Remova todas as alterações de ATK e DEF aplicadas a esse Ser.",
      "art": "assets/recalibrar_postura.webp",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "resetStats",
          "target": "anySer"
        }
      ],
      "cardSubtype": "Ajuste",
      "periculosidade": 3
    },
    {
      "id": "veu_lucidez",
      "name": "Véu da Lucidez",
      "kind": "magia",
      "subtype": "reaction",
      "text": "Reação: quando um ou mais Contadores de Medo forem colocados em Seres aliados, negue esse efeito.",
      "art": "assets/veu_lucidez.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "fearNegate"
        }
      ],
      "cardSubtype": "Reação",
      "reactionEvent": "fear",
      "periculosidade": 2
    },
    {
      "id": "drenagem_pavor",
      "name": "Drenagem do Pavor",
      "kind": "magia",
      "subtype": "normal",
      "text": "Remova qualquer quantidade de Contadores de Medo de 1 Ser aliado; distribua essa mesma quantidade entre Seres inimigos como desejar.",
      "art": "assets/drenagem_pavor.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "drainFear"
        }
      ],
      "cardSubtype": "Normal",
      "periculosidade": 3
    },
    {
      "id": "refugio_panico",
      "name": "Refúgio do Pânico",
      "kind": "magia",
      "subtype": "normal",
      "text": "Remova qualquer quantidade de Contadores de Medo de 1 Ser inimigo; distribua essa mesma quantidade entre Seres aliados como desejar.",
      "art": "assets/refugio_panico.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "refugeFear"
        }
      ],
      "cardSubtype": "Normal",
      "periculosidade": 3
    },
    {
      "id": "circulo_colapso",
      "name": "Círculo do Colapso",
      "kind": "magia",
      "subtype": "field",
      "text": "Enquanto este Campo permanecer em jogo, todos os Seres ganham +1 ATK para cada 2 Contadores de Medo no campo (arredondado para baixo). Ao final de cada rodada, destrua todos os Seres no campo.",
      "art": "assets/circulo_colapso.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "collapse"
        }
      ],
      "cardSubtype": "Campo",
      "periculosidade": 4
    },
    {
      "id": "reporter_inexplicavel",
      "name": "Repórter do Inexplicável",
      "kind": "ser",
      "subtype": "",
      "text": "Quando este Ser for Invocado, compre 1 carta e depois descarte 1 carta.",
      "art": "assets/reporter_inexplicavel.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "reporter",
          "when": "onSummon",
          "discardCost": 0
        }
      ],
      "atk": 2,
      "terror": 3,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 3,
      "periculosidade": 2
    },
    {
      "id": "arquivista_proibido",
      "name": "Arquivista do Proibido",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, descarte 1 carta; compre 2 cartas.",
      "art": "assets/arquivista_proibido.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "drawTwo",
          "when": "manual",
          "discardCost": 1
        }
      ],
      "atk": 1,
      "terror": 4,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 5,
      "periculosidade": 3
    },
    {
      "id": "medica_vigilia",
      "name": "Médica da Última Vigília",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, descarte 2 cartas; recupere 2 pontos de Sanidade (máximo 10).",
      "art": "assets/medica_vigilia.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "healSanity",
          "when": "manual",
          "discardCost": 2
        }
      ],
      "atk": 1,
      "terror": 4,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 6,
      "periculosidade": 3
    },
    {
      "id": "cacador_anomalias",
      "name": "Caçador de Anomalias",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, descarte 1 carta; este Ser recebe +2 ATK até o fim do turno.",
      "art": "assets/cacador_anomalias.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "hunter",
          "when": "manual",
          "discardCost": 1
        }
      ],
      "atk": 4,
      "terror": 3,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 3,
      "periculosidade": 3
    },
    {
      "id": "engenheira_refugio",
      "name": "Engenheira do Refúgio",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, descarte 1 carta; escolha 1 Ser aliado, que recebe 1 Escudo.",
      "art": "assets/engenheira_refugio.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "engineer",
          "when": "manual",
          "discardCost": 1
        }
      ],
      "atk": 2,
      "terror": 3,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 6,
      "periculosidade": 3
    },
    {
      "id": "investigadora_nevoa",
      "name": "Investigadora da Névoa",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, descarte 1 carta; olhe as 3 primeiras cartas do deck, escolha 1 para a mão e devolva as outras ao fundo, na ordem que desejar.",
      "art": "assets/investigadora_nevoa.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "investigate",
          "when": "manual",
          "discardCost": 1
        }
      ],
      "atk": 2,
      "terror": 4,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 4,
      "periculosidade": 3
    },
    {
      "id": "sobrevivente_desesperado",
      "name": "Sobrevivente Desesperado",
      "kind": "ser",
      "subtype": "",
      "text": "Quando este Ser for destruído, compre 1 carta.",
      "art": "assets/sobrevivente_desesperado.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "drawOne",
          "when": "onDestroyed",
          "discardCost": 0
        }
      ],
      "atk": 2,
      "terror": 2,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 4,
      "periculosidade": 2
    },
    {
      "id": "veterano_noite",
      "name": "Veterano da Noite Eterna",
      "kind": "ser",
      "subtype": "",
      "text": "Invocação Especial: descarte 2 cartas. Quando este Ser for Invocado, compre 1 carta.",
      "art": "assets/veterano_noite.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "drawOne",
          "when": "onSummon",
          "discardCost": 0
        }
      ],
      "atk": 4,
      "terror": 5,
      "affinity": "Humano",
      "rarity": "especial",
      "def": 5,
      "summon": {
        "discard": 2
      },
      "periculosidade": 4
    },
    {
      "id": "professor_oculto",
      "name": "Professor do Oculto",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, descarte 1 carta; escolha 1 Feitiço no seu descarte e devolva-o ao fundo do deck.",
      "art": "assets/professor_oculto.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "professor",
          "when": "manual",
          "discardCost": 1
        }
      ],
      "atk": 1,
      "terror": 5,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 4,
      "periculosidade": 3
    },
    {
      "id": "lider_remanescentes",
      "name": "Líder dos Remanescentes",
      "kind": "ser",
      "subtype": "",
      "text": "Uma vez por turno, pode descartar até 2 cartas. Para cada carta descartada, escolha 1 Ser Humano aliado; ele recebe +1 ATK e +1 DEF até o fim do turno.",
      "art": "assets/lider_remanescentes.png",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "leader",
          "when": "manual",
          "discardCost": 0
        }
      ],
      "atk": 3,
      "terror": 5,
      "affinity": "Humano",
      "rarity": "comum",
      "def": 5,
      "periculosidade": 3
    },
    {
      "id": "sistema_cambio_oculto",
      "name": "Sistema de Câmbio Oculto",
      "kind": "magia",
      "periculosidade": 3,
      "text": "Enquanto este Feitiço permanecer em campo, sempre que você comprar um Feitiço, você pode devolvê-lo ao baralho, embaralhar e comprar outra carta. Até duas vezes por turno.",
      "art": "assets/sistema_cambio_oculto.webp",
      "subtype": "continuous",
      "cardSubtype": "Contínuo",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "exchangeSpell"
        }
      ]
    },
    {
      "id": "queda_continua_desesperada",
      "name": "Queda Contínua Desesperada",
      "kind": "magia",
      "periculosidade": 4,
      "text": "Enquanto este Feitiço permanecer em campo, redirecione para esta carta os Contadores de Medo que um efeito colocaria. Para cada 2 Contadores de Medo nesta carta, todos os Seres inimigos recebem −1 DEF.",
      "art": "assets/queda_continua_desesperada.webp",
      "subtype": "continuous",
      "cardSubtype": "Contínuo",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "redirectFear"
        }
      ]
    },
    {
      "id": "campo_drenagem",
      "name": "Campo de Drenagem",
      "kind": "magia",
      "periculosidade": 5,
      "text": "No início de cada rodada, todos os Seres perdem 1 TERROR. Seres que chegarem a 0 TERROR são enviados para a pilha de descarte.",
      "art": "assets/campo_drenagem.webp",
      "subtype": "continuous",
      "cardSubtype": "Contínuo",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "roundDrain"
        }
      ]
    },
    {
      "id": "fila_espera_submundo",
      "name": "Fila de Espera do Submundo",
      "kind": "magia",
      "periculosidade": 4,
      "text": "Enquanto este Feitiço permanecer em campo, sempre que um Ser for removido do campo por combate, devolva-o para a mão de seu dono.",
      "art": "assets/fila_espera_submundo.webp",
      "subtype": "continuous",
      "cardSubtype": "Contínuo",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "combatReturn"
        }
      ]
    },
    {
      "id": "parasita_vertiginoso",
      "name": "Parasita Vertiginoso",
      "kind": "magia",
      "periculosidade": 3,
      "text": "Vincule este Feitiço a 1 Ser inimigo. A cada um dos seus turnos, esse Ser recebe −1 ATK e −1 DEF cumulativos enquanto esta carta permanecer em campo. Ao sair, as reduções deste Feitiço são removidas.",
      "art": "assets/parasita_vertiginoso.webp",
      "subtype": "continuous",
      "cardSubtype": "Contínuo",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "bindParasite",
          "target": "enemySer"
        }
      ]
    },
    {
      "id": "forca_resistencia",
      "name": "Força da Resistência",
      "kind": "magia",
      "periculosidade": 4,
      "text": "Enquanto esta carta estiver em campo, seus Seres Humanos recebem +1 ATK por Ser Humano em campo, até +5 ATK.",
      "art": "assets/forca_resistencia.webp",
      "subtype": "continuous",
      "cardSubtype": "Contínuo",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "humanAura"
        }
      ]
    },
    {
      "id": "grande_impacto",
      "name": "Grande Impacto",
      "kind": "magia",
      "periculosidade": 2,
      "text": "Cause 2 de dano ao TERROR de 1 Ser em campo.",
      "art": "assets/grande_impacto.webp",
      "subtype": "normal",
      "cardSubtype": "Normal",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "damageTerror",
          "target": "anySer",
          "amount": 2
        }
      ]
    },
    {
      "id": "ultimo_rosto",
      "name": "O Último Rosto",
      "kind": "ser",
      "periculosidade": 5,
      "text": "Invocação especial com 2 Assassinos aliados e descarte de 1 carta. Uma vez por turno, destrua 1 Ser inimigo com TERROR 3 ou menos. Se ele tinha Medo, o oponente perde 1 Sanidade.",
      "art": "assets/ultimo_rosto.webp",
      "affinity": "Assassino",
      "atk": 8,
      "terror": 7,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "fearExecution",
          "target": "enemySer",
          "maxTerror": 3,
          "when": "manual"
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Assassino",
        "sacrificeMinimum": 2,
        "discard": 1
      },
      "def": 6
    },
    {
      "id": "imperador_cinzas_eternas",
      "name": "Imperador das Cinzas Eternas",
      "kind": "ser",
      "periculosidade": 6,
      "text": "Invocação especial com 2 Infernais aliados, 1 Item aliado destruído e perda de 2 Sanidade. Ao ser invocado, cause 2 de dano ao TERROR de todos os Seres inimigos. Uma vez por turno, perca 1 Sanidade para ganhar +2 ATK até o fim do turno.",
      "art": "assets/imperador_cinzas_eternas.webp",
      "affinity": "Infernal",
      "atk": 9,
      "terror": 8,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "enemyTerrorDamage",
          "when": "onSummon",
          "amount": 2
        },
        {
          "op": "CUSTOM",
          "action": "sanityBuff",
          "when": "manual"
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Infernal",
        "sacrificeMinimum": 2,
        "items": 1,
        "sanity": 2
      },
      "def": 7
    },
    {
      "id": "soberana_esquecidos",
      "name": "A Soberana dos Esquecidos",
      "kind": "ser",
      "periculosidade": 6,
      "text": "Invocação especial com 2 Espectrais aliados e banimento de 2 Seres do seu descarte. Uma vez por turno, impeça a destruição por combate de outro aliado e coloque 1 Medo nesta carta. Remova 3 Medos desta carta para recuperar 1 Espectral do descarte para a mão.",
      "art": "assets/soberana_esquecidos.webp",
      "affinity": "Espectral",
      "atk": 6,
      "terror": 8,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "recoverSpectral",
          "when": "manual",
          "repeatable": true,
          "fearSelf": 3
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Espectral",
        "sacrificeMinimum": 2,
        "banish": 2
      },
      "def": 9
    },
    {
      "id": "arquimago_veu_partido",
      "name": "Arquimago do Véu Partido",
      "kind": "ser",
      "periculosidade": 5,
      "text": "Invocação especial com 1 Ocultista aliado e 2 Feitiços aliados enviados ao descarte. Ao ser invocado, recupere 1 Feitiço do descarte para a mão. Uma vez por turno, descarte 1 carta para negar a ativação de 1 Feitiço inimigo.",
      "art": "assets/arquimago_veu_partido.webp",
      "affinity": "Ocultista",
      "atk": 6,
      "terror": 8,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "recoverSpell",
          "when": "onSummon"
        }
      ],
      "summon": {
        "sacrifices": 1,
        "sacrificeAffinity": "Ocultista",
        "sacrificeMinimum": 1,
        "spells": 2
      },
      "def": 7
    },
    {
      "id": "tita_massacre",
      "name": "O Titã do Massacre",
      "kind": "ser",
      "periculosidade": 6,
      "text": "Invocação especial com 3 Seres aliados, sendo pelo menos 2 Carnificina. Se destruir um Ser por combate, pode atacar mais uma vez neste turno. O ataque adicional é direto à Sanidade e, depois dele, este Ser perde 2 TERROR.",
      "art": "assets/tita_massacre.webp",
      "affinity": "Carnificina",
      "atk": 10,
      "terror": 8,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "extraDirect",
          "when": "onCombatDestroy"
        }
      ],
      "summon": {
        "sacrifices": 3,
        "sacrificeAffinity": "Carnificina",
        "sacrificeMinimum": 2
      },
      "def": 5
    },
    {
      "id": "organismo_primordial",
      "name": "O Organismo Primordial",
      "kind": "ser",
      "periculosidade": 7,
      "text": "Invocação especial com 2 Aberrações aliadas e descarte de 2 cartas. Enquanto tiver TERROR 5 ou mais, efeitos não podem destruí-lo. Uma vez por turno, remova 2 Medos de Seres no campo para recuperar 1 TERROR.",
      "art": "assets/organismo_primordial.webp",
      "affinity": "Aberração",
      "atk": 7,
      "terror": 9,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "restoreTerror",
          "when": "manual",
          "target": "selfSer",
          "fearSpend": 2,
          "amount": 1
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Aberração",
        "sacrificeMinimum": 2,
        "discard": 2
      },
      "def": 10
    },
    {
      "id": "monarca_pavor_absoluto",
      "name": "O Monarca do Pavor Absoluto",
      "kind": "ser",
      "periculosidade": 6,
      "text": "Invocação especial com 2 Entidades aliadas e remoção de 5 Medos de Seres no campo. Ao ser invocado, coloque 1 Medo em cada inimigo. Uma vez por turno, remova 3 Medos de Seres inimigos para destruir 1 Ser inimigo que tenha Medo.",
      "art": "assets/monarca_pavor_absoluto.webp",
      "affinity": "Entidade",
      "atk": 8,
      "terror": 8,
      "rarity": "especial",
      "effects": [
        {
          "op": "COUNTER",
          "target": "allEnemySer",
          "amount": 1,
          "when": "onSummon"
        },
        {
          "op": "CUSTOM",
          "action": "markedExecution",
          "target": "enemySer",
          "minFear": 1,
          "fearSpend": 3,
          "enemyFearCost": true,
          "when": "manual"
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Entidade",
        "sacrificeMinimum": 2,
        "fearSpend": 5,
        "serFearOnly": true
      },
      "def": 8
    },
    {
      "id": "ultimo_comandante",
      "name": "O Último Comandante",
      "kind": "ser",
      "periculosidade": 5,
      "text": "Invocação especial com 2 Humanos aliados e descarte de 2 cartas. Ao ser invocado, compre 2 cartas. Uma vez por turno, descarte 1 carta para colocar 1 Feitiço do descarte na mão ou dar +2 DEF aos seus Humanos até o fim do turno.",
      "art": "assets/ultimo_comandante.webp",
      "affinity": "Humano",
      "atk": 5,
      "terror": 7,
      "rarity": "especial",
      "effects": [
        {
          "op": "DRAW",
          "when": "onSummon",
          "amount": 2
        },
        {
          "op": "CUSTOM",
          "action": "commanderChoice",
          "when": "manual",
          "discardCost": 1
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Humano",
        "sacrificeMinimum": 2,
        "discard": 2
      },
      "def": 8
    },
    {
      "id": "guardia_ultimo_limiar",
      "name": "A Guardiã do Último Limiar",
      "kind": "ser",
      "periculosidade": 6,
      "text": "Invocação especial com 2 Espirituais aliados e 1 Feitiço aliado consumido. Ao ser invocada, recupere 2 Sanidade. Uma vez por turno, quando um efeito inimigo reduzir sua Sanidade, você pode descartar 1 carta para negar essa redução.",
      "art": "assets/guardia_ultimo_limiar.webp",
      "affinity": "Espiritual",
      "atk": 5,
      "terror": 9,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "healSanity",
          "when": "onSummon"
        }
      ],
      "summon": {
        "sacrifices": 2,
        "sacrificeAffinity": "Espiritual",
        "sacrificeMinimum": 2,
        "spells": 1
      },
      "def": 9
    },
    {
      "id": "drenagem_almas",
      "name": "Drenagem de Almas",
      "kind": "magia",
      "periculosidade": 4,
      "text": "Cause 2 de dano a todos os Seres em campo. Em seguida, cada jogador perde 1 ponto de Sanidade.",
      "art": "assets/drenagem_almas.webp",
      "subtype": "normal",
      "cardSubtype": "Normal",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "soulDrain"
        }
      ]
    },
    {
      "id": "equipamentos_basicos",
      "name": "Equipamentos Básicos",
      "kind": "magia",
      "periculosidade": 3,
      "text": "Seres Humanos que você controla recebem +2 ATK até que cada um deixe o campo.",
      "art": "assets/equipamentos_basicos.webp",
      "subtype": "normal",
      "cardSubtype": "Suporte",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "equipHumans"
        }
      ]
    },
    {
      "id": "selo_enfraquecimento",
      "name": "Selo de Enfraquecimento",
      "kind": "magia",
      "periculosidade": 2,
      "text": "Reduza a DEF de 1 Ser pela metade, arredondando para cima, até que esse Ser deixe o campo.",
      "art": "assets/selo_enfraquecimento.webp",
      "subtype": "normal",
      "cardSubtype": "Maldição",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "halveDefense",
          "target": "anySer"
        }
      ]
    },
    {
      "id": "escorregao",
      "name": "Escorregão",
      "kind": "magia",
      "periculosidade": 2,
      "text": "Negue o ataque de 1 Ser inimigo. Depois, esse Ser perde 1 DEF até o próximo turno.",
      "art": "assets/escorregao.webp",
      "subtype": "reaction",
      "cardSubtype": "Reação",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "slipAttack"
        }
      ],
      "reactionEvent": "attack"
    },
    {
      "id": "afiar_garras",
      "name": "Afiar Garras",
      "kind": "magia",
      "periculosidade": 1,
      "text": "1 Ser Aberração recebe +2 ATK até o fim do turno.",
      "art": "assets/afiar_garras.webp",
      "subtype": "normal",
      "cardSubtype": "Normal",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "atk",
          "amount": 2,
          "targetAffinity": "Aberração"
        }
      ]
    },
    {
      "id": "metamorfose_corrupta",
      "name": "Metamorfose Corrupta",
      "kind": "magia",
      "periculosidade": 5,
      "text": "Destrua 1 Ser que você controla. Em seguida, invoque 2 Seres do seu descarte até o fim da rodada. Depois, envie-os de volta ao descarte.",
      "art": "assets/metamorfose_corrupta.webp",
      "subtype": "normal",
      "cardSubtype": "Ritual",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "corruptRevive",
          "target": "allySer"
        }
      ]
    },
    {
      "id": "impeto_besta",
      "name": "Ímpeto da Besta",
      "kind": "item",
      "periculosidade": 2,
      "text": "1 Ser Aberração em campo recebe +2 ATK enquanto permanecer em campo.",
      "art": "assets/impeto_besta.webp",
      "subtype": "normal",
      "cardSubtype": "Equipamento",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "atk",
          "amount": 2,
          "targetAffinity": "Aberração",
          "permanent": true
        }
      ]
    },
    {
      "id": "prisma_possuido",
      "name": "Prisma do Possuído",
      "kind": "item",
      "periculosidade": 2,
      "text": "1 Ser Espectral em campo recebe +2 ATK enquanto permanecer em campo.",
      "art": "assets/prisma_possuido.webp",
      "subtype": "normal",
      "cardSubtype": "Relíquia",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "atk",
          "amount": 2,
          "targetAffinity": "Espectral",
          "permanent": true
        }
      ]
    },
    {
      "id": "dardos_quebra_dedos",
      "name": "Dardos Quebra-Dedos",
      "kind": "item",
      "periculosidade": 2,
      "text": "1 Ser em campo recebe −1 ATK até ser enviado para a pilha de descarte.",
      "art": "assets/dardos_quebra_dedos.webp",
      "subtype": "normal",
      "cardSubtype": "Armadilha",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "atk",
          "amount": -1,
          "permanent": true,
          "untilGrave": true
        }
      ]
    },
    {
      "id": "cutelo_enferrujado",
      "name": "Cutelo Enferrujado",
      "kind": "item",
      "periculosidade": 2,
      "text": "1 Ser Carnificina em campo recebe +2 ATK enquanto permanecer em campo.",
      "art": "assets/cutelo_enferrujado.webp",
      "subtype": "normal",
      "cardSubtype": "Arma",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "atk",
          "amount": 2,
          "targetAffinity": "Carnificina",
          "permanent": true
        }
      ]
    },
    {
      "id": "amuleto_praga",
      "name": "Amuleto da Praga",
      "kind": "item",
      "periculosidade": 3,
      "text": "Descarte 1 carta da sua mão. Escolha 2 Seres em campo. Ambos recebem −2 ATK enquanto permanecerem em campo.",
      "art": "assets/amuleto_praga.webp",
      "subtype": "normal",
      "cardSubtype": "Amuleto",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "plagueAmulet",
          "discardCost": 1
        }
      ]
    },
    {
      "id": "rastejante",
      "name": "Rastejante",
      "kind": "ser",
      "periculosidade": 1,
      "text": "Quando este Ser for destruído, invoque 1 Rastejante da mão ou do baralho.",
      "art": "assets/rastejante.webp",
      "affinity": "Aberração",
      "atk": 3,
      "terror": 2,
      "rarity": "comum",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "summonRastejante",
          "when": "onDestroyed"
        }
      ],
      "def": 2
    },
    {
      "id": "papa_sonhos",
      "name": "Papa Sonhos",
      "kind": "ser",
      "periculosidade": 2,
      "text": "",
      "art": "assets/papa_sonhos.webp",
      "affinity": "Aberração",
      "atk": 4,
      "terror": 3,
      "rarity": "comum",
      "effects": [],
      "def": 1
    },
    {
      "id": "gek_felliax",
      "name": "Gek Felliax",
      "kind": "ser",
      "periculosidade": 1,
      "text": "No início de cada um dos seus turnos, coloque 1 Medo nesta carta. Se ela tiver 3 ou mais Medos, envie-a ao descarte e invoque 1 Gek Pulliax da mão ou do baralho.",
      "art": "assets/gek_felliax.webp",
      "affinity": "Aberração",
      "atk": 0,
      "terror": 1,
      "rarity": "comum",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "gekEvolve",
          "when": "onTurnStart",
          "threshold": 3,
          "next": "gek_pulliax"
        }
      ],
      "def": 5
    },
    {
      "id": "gek_pulliax",
      "name": "Gek Pulliax",
      "kind": "ser",
      "periculosidade": 1,
      "text": "Só pode ser invocado pelo efeito de Gek Felliax. No início de cada um dos seus turnos, coloque 1 Medo nesta carta. Com 2 ou mais Medos, envie-a ao descarte e invoque 1 Gek Omelliax da mão ou do baralho.",
      "art": "assets/gek_pulliax.webp",
      "affinity": "Aberração",
      "atk": 0,
      "terror": 2,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "gekEvolve",
          "when": "onTurnStart",
          "threshold": 2,
          "next": "gek_omelliax"
        }
      ],
      "summon": {
        "onlyBy": "gek_felliax"
      },
      "def": 4
    },
    {
      "id": "gek_omelliax",
      "name": "Gek Omelliax",
      "kind": "ser",
      "periculosidade": 5,
      "text": "Só pode ser invocado pelo efeito de Gek Pulliax. Ao ser invocado, envie todos os outros Seres ao descarte. Depois, cada jogador compra 1 carta para cada Ser enviado por este efeito.",
      "art": "assets/gek_omelliax.webp",
      "affinity": "Aberração",
      "atk": 8,
      "terror": 6,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "gekClear",
          "when": "onSummon"
        }
      ],
      "summon": {
        "onlyBy": "gek_pulliax"
      },
      "def": 6
    },
    {
      "id": "lobisomem_adulto",
      "name": "Lobisomem Adulto",
      "kind": "ser",
      "periculosidade": 3,
      "text": "Invocação especial com 1 Aberração aliada. Sempre que causar dano de combate a um Ser, recupere 1 TERROR.",
      "art": "assets/lobisomem_adulto.webp",
      "affinity": "Aberração",
      "atk": 6,
      "terror": 5,
      "rarity": "especial",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "restoreTerror",
          "target": "combatTarget",
          "when": "onCombatDamage",
          "amount": 1
        }
      ],
      "summon": {
        "sacrifices": 1,
        "sacrificeAffinity": "Aberração",
        "sacrificeMinimum": 1
      },
      "def": 4
    },
    {
      "id": "corredor_carmesin",
      "name": "Corredor Carmesin",
      "kind": "ser",
      "periculosidade": 1,
      "text": "",
      "art": "assets/corredor_carmesin.webp",
      "affinity": "Assassino",
      "atk": 3,
      "terror": 3,
      "rarity": "comum",
      "effects": [],
      "def": 1
    },
    {
      "id": "retaliante",
      "name": "Retaliante",
      "kind": "ser",
      "periculosidade": 2,
      "text": "Sempre que um jogador perder Sanidade, este Ser recebe +1 ATK permanente.",
      "art": "assets/retaliante.webp",
      "affinity": "Assassino",
      "atk": 2,
      "terror": 4,
      "rarity": "comum",
      "effects": [
        {
          "op": "CUSTOM",
          "action": "retaliate",
          "when": "onSanityLoss"
        }
      ],
      "def": 3
    },
    {
      "id": "fios_prata",
      "name": "Fios de Prata",
      "kind": "ser",
      "periculosidade": 2,
      "text": "Sempre que um Feitiço for ativado, escolha 1 Ser em campo. Ele recebe −1 DEF até o fim do turno.",
      "art": "assets/fios_prata.webp",
      "affinity": "Assassino",
      "atk": 5,
      "terror": 5,
      "rarity": "comum",
      "effects": [
        {
          "op": "BUFF",
          "target": "anySer",
          "stat": "def",
          "amount": -1,
          "when": "onSpellActivation"
        }
      ],
      "def": 1
    },
    {
      "id": "intangivel",
      "name": "O Intangível",
      "kind": "ser",
      "periculosidade": 2,
      "text": "Este Ser também é considerado Espectral. Se for removido do campo por um Feitiço, devolva-o para a sua mão.",
      "art": "assets/intangivel.webp",
      "affinity": "Assassino",
      "atk": 6,
      "terror": 1,
      "rarity": "comum",
      "effects": [],
      "extraAffinities": [
        "Espectral"
      ],
      "def": 1
    },
    {
      "id": "sussurrante",
      "name": "A Sussurrante",
      "kind": "ser",
      "periculosidade": 4,
      "text": "Invocação especial com descarte de 2 Itens da mão. Este Ser recebe +1 ATK para cada 2 Itens nas pilhas de descarte dos dois jogadores.",
      "art": "assets/sussurrante.webp",
      "affinity": "Assassino",
      "atk": 6,
      "terror": 6,
      "rarity": "especial",
      "effects": [],
      "summon": {
        "discard": 2,
        "discardKind": "item"
      },
      "def": 4
    }
  ],
  "DEFAULT_CONFIG": {
    "maxDeckSize": 30,
    "maxCopies": 2,
    "startingSanity": 10,
    "initialHandSize": 5,
    "drawPerTurn": 1,
    "lanes": {
      "ser": 5,
      "support": 5
    },
    "commonSummonsPerTurn": 1,
    "specialSummonsPerTurn": 1,
    "attacksPerSerPerTurn": 1,
    "maxTurns": 40,
    "winByExtermination": true,
    "winBySanity": true,
    "damagePersistent": true,
    "turnDurationSeconds": 0,
    "minDeckSize": 20
  }
};
const {CARD_LIBRARY,DEFAULT_CONFIG}=root.HV_DATA;
root.HV_DATA.randomDeck=function(collection){
 const pool=CARD_LIBRARY.flatMap(card=>Array(collection?Math.min(DEFAULT_CONFIG.maxCopies,collection[card.id]||0):DEFAULT_CONFIG.maxCopies).fill(card.id));
 for(let i=pool.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [pool[i],pool[j]]=[pool[j],pool[i]];
 }
 return pool.slice(0,DEFAULT_CONFIG.maxDeckSize);
};
root.HV_DATA.DEFAULT_DECK=Object.freeze([
 ...['cultista','vigia','sobrevivente','espectro','papa_sonhos','corredor_carmesin','ghostface','velas','grande_impacto'].flatMap(id=>[id,id]),
 'lamina','amuleto','espelho','corte','ritual','bruma'
]);
root.HV_DATA.validDeck=function(ids,{draft=false,minDeckSize,maxDeckSize,maxCopies}={}){
 const maxSize=maxDeckSize??DEFAULT_CONFIG.maxDeckSize;
 const copiesLimit=maxCopies??DEFAULT_CONFIG.maxCopies;
 if(!Array.isArray(ids)||ids.length>maxSize||(!draft&&ids.length<(minDeckSize??DEFAULT_CONFIG.minDeckSize)))return false;
 const copies=new Map();
 for(const id of ids){
  const count=(copies.get(id)||0)+1;
  if(count>copiesLimit||!CARD_LIBRARY.some(card=>card.id===id))return false;
  copies.set(id,count);
 }
 return true;
};
})(typeof window!=='undefined'?window:globalThis);
