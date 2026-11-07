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
      "text": "Enquanto este Campo permanecer em jogo, todos os Seres ganham +1 ATK para cada 2 Contadores de Medo no campo (arredondando para baixo). Ao final de cada rodada, destrua todos os Seres no campo.",
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
root.HV_DATA.randomDeck=function(){
 const pool=CARD_LIBRARY.flatMap(card=>Array(DEFAULT_CONFIG.maxCopies).fill(card.id));
 for(let i=pool.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [pool[i],pool[j]]=[pool[j],pool[i]];
 }
 return pool.slice(0,DEFAULT_CONFIG.maxDeckSize);
};
root.HV_DATA.DEFAULT_DECK=root.HV_DATA.randomDeck();
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
