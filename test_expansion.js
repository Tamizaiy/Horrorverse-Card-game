const assert=require('node:assert/strict');require('./cards.js');require('./engine.js');require('./expansion.js');
const def=id=>HV_DATA.CARD_LIBRARY.find(c=>c.id===id);
const game=()=>{const g=new HorrorverseEngine({deferChoices:true,winByExtermination:false});g.players.forEach(p=>{p.hand=[];p.grave=[];p.field.ser.fill(null);p.field.support.fill(null)});return g;};
const add=(g,id,owner=0,zone='ser')=>{const c=g.clone(def(id),owner);if(['hand','grave'].includes(zone))g.p(owner)[zone].push(c);else g.p(owner).field[zone][g.p(owner).field[zone].indexOf(null)]=c;return c;};
const select=(g,...values)=>g.resolveChoice({values});
const activate=(g,id,target)=>{const c=add(g,id,0,'support');g.activate(c.uid,target);return c;};
// Zombie: selected enemy Ser, no player counter; no legal target is a no-op.
{const g=game(),z=add(g,'zumbi'),a=add(g,'cultista',1),b=add(g,'vigia',1);g.destroy(z.uid);assert.equal(g.choices.length,1);g.resolveChoice({target:b.uid});assert.equal(g.fear(a),0);assert.equal(g.fear(b),1);assert.equal(g.fear(g.p(1)),0);}
{const g=game();g.destroy(add(g,'zumbi').uid);assert.equal(g.choices.length,0);}
// All three lists are legal and different, each has 30 cards.
for(const r of HV_RIVALS){assert(HV_DATA.validDeck(r.deck));assert.equal(r.deck.length,30);}
// Attack is paused before damage; cover negates without destroying the attacker.
{const g=game(),a=add(g,'fera'),b=add(g,'cultista',1),r=add(g,'cobertura_defensiva',1,'support');const before=b.terrorCurrent;assert(g.attack(a.uid,b.uid).pending);assert.equal(b.terrorCurrent,before);assert(g.respond(r.uid).negated);assert(a.hasAttacked);assert.equal(g.find(a.uid).zone,'ser');assert.equal(g.find(r.uid).zone,'grave');}
{const g=game(),a=add(g,'fera'),b=add(g,'cultista',1),c=add(g,'mumia',1),r=add(g,'desvio_alvo',1,'support');g.attack(a.uid,b.uid);assert.throws(()=>g.respond(r.uid,b.uid));assert(g.pending);const result=g.respond(r.uid,c.uid);assert.equal(result.defender.uid,c.uid);assert.equal(b.terrorCurrent,b.terror);}
// Attack-only reactions cannot negate a spell, and generic reaction cannot negate attack.
{const g=game(),r=add(g,'cobertura_defensiva',1,'support');activate(g,'leitura_tatica');assert.equal(g.pending,null);select(g);assert.equal(g.find(r.uid).zone,'support');}
// Fear reaction cancels the whole mass-counter event and Witness does not draw.
{const g=game(),a=add(g,'testemunha',1),b=add(g,'cultista',1),r=add(g,'veu_lucidez',1,'support');const n=g.p(1).hand.length;g.runEffects([{op:'COUNTER',target:'allEnemySer',amount:2}],null,null,0);select(g,r.uid);assert.equal(g.fear(a),0);assert.equal(g.fear(b),0);assert.equal(g.p(1).hand.length,n);}
// Costs: insufficient hand does not mark used; paying creates the correct draw.
{const g=game(),a=add(g,'arquivista_proibido');assert.throws(()=>g.activateSer(a.uid));assert(!g.used(a,0));const cost=add(g,'vigia',0,'hand');g.activateSer(a.uid);assert.equal(g.p(0).hand.length,1);select(g,cost.uid);assert.equal(g.p(0).hand.length,2);assert.equal(g.find(cost.uid).zone,'grave');assert.throws(()=>g.activateSer(a.uid));}
{const g=game(),v=add(g,'veterano_noite',0,'hand'),a=add(g,'vigia',0,'hand'),b=add(g,'cultista',0,'hand');assert.throws(()=>g.placeFromHand(v.uid,0,{discard:[a.uid,a.uid]}));assert.equal(g.find(v.uid).zone,'hand');g.placeFromHand(v.uid,0,{discard:[a.uid,b.uid]});assert.equal(g.p(0).hand.length,1);assert.equal(g.p(0).grave.length,2);}
{const g=game(),a=add(g,'medica_vigilia'),c=add(g,'vigia',0,'hand'),d=add(g,'cultista',0,'hand');g.p(0).sanity=9;g.activateSer(a.uid);select(g,c.uid,d.uid);assert.equal(g.p(0).sanity,10);}
{const g=game(),a=add(g,'engenheira_refugio'),c=add(g,'vigia',0,'hand'),b=add(g,'cultista');g.activateSer(a.uid);select(g,c.uid);select(g,b.uid);assert.equal(b.shields,1);}
{const g=game(),a=add(g,'cacador_anomalias'),c=add(g,'vigia',0,'hand');g.activateSer(a.uid);select(g,c.uid);assert.equal(g.stat(a,'atk'),6);g.endTurn();assert.equal(g.stat(a,'atk'),4);}
// Investigator: selection and bottom order, no transient cards lost.
{const g=game(),a=add(g,'investigadora_nevoa'),cost=add(g,'vigia',0,'hand'),top=g.p(0).deck.slice(0,3);g.activateSer(a.uid);select(g,cost.uid);select(g,top[1].uid);select(g,top[2].uid,top[0].uid);assert(g.p(0).hand.includes(top[1]));assert.deepEqual(g.p(0).deck.slice(-2),[top[2],top[0]]);}
{const g=game(),a=add(g,'professor_oculto'),cost=add(g,'leitura_tatica',0,'hand');g.activateSer(a.uid);select(g,cost.uid);select(g,cost.uid);assert.equal(g.p(0).deck.at(-1),cost);}
{const g=game(),a=add(g,'lider_remanescentes'),c=add(g,'vigia',0,'hand'),d=add(g,'cultista',0,'hand');g.activateSer(a.uid);select(g,c.uid,d.uid);select(g,a.uid,a.uid);assert.equal(g.stat(a,'atk'),5);assert.equal(g.stat(a,'def'),7);g.endTurn();assert.equal(g.stat(a,'atk'),3);}
// Distinct discard semantics: mutual sending ignores shields and death triggers.
{const g=game(),a=add(g,'sobrevivente_desesperado'),b=add(g,'zumbi',1);a.shields=2;b.shields=2;activate(g,'destruicao_mutua');select(g,a.uid);select(g,b.uid);assert.equal(g.p(0).hand.length,0);assert.equal(g.choices.length,0);assert.equal(g.find(a.uid).zone,'grave');assert.equal(g.find(b.uid).zone,'grave');}
// Recovery does not recover its own resolving card.
{const g=game(),a=add(g,'vigia',0,'hand'),b=add(g,'cultista',0,'hand');const source=activate(g,'arquivador_restos');select(g,a.uid,b.uid);assert(!g.choices[0].ids.includes(source.uid));select(g,a.uid,b.uid);assert.equal(g.p(0).hand.length,2);assert.equal(g.find(source.uid).zone,'grave');}
{const g=game(),a=add(g,'cacador_anomalias',0,'grave'),b=add(g,'reporter_inexplicavel',0,'grave');activate(g,'distintivo_sobrevivente');assert.deepEqual(g.choices[0].ids,[b.uid]);select(g,b.uid);assert.equal(g.find(b.uid).zone,'hand');}
{const g=game(),a=add(g,'cultista');a.counters.medo=7;g.p(0).sanity=5;activate(g,'calice_serenidade');assert.equal(g.p(0).sanity,8);assert.equal(g.fearTotal(),0);a.counters.medo=5;activate(g,'ampulheta_colapso');assert.equal(g.p(1).sanity,8);}
// Redistribution conserves counts, chooser controls remainder and destinations.
{const g=game(),a=add(g,'cultista'),b=add(g,'vigia',1),c=add(g,'testemunha');a.counters.medo=5;activate(g,'balanca_pavor');select(g,b.uid,c.uid);assert.deepEqual([g.fear(a),g.fear(b),g.fear(c)],[1,2,2]);assert.equal(g.fearTotal(),5);assert.equal(g.p(0).hand.length,1);}
{const g=game(),a=add(g,'cultista'),b=add(g,'vigia',1),c=add(g,'testemunha',1);a.counters.medo=5;activate(g,'drenagem_pavor');select(g,a.uid);select(g,'3');select(g,b.uid,c.uid,b.uid);assert.deepEqual([g.fear(a),g.fear(b),g.fear(c)],[2,2,1]);assert.equal(g.fearTotal(),5);}
// Shields last until end of round, consuming temporary protection preserves permanent shield.
{const g=game(),a=add(g,'cultista');a.shields=1;activate(g,'protecao_emergencia');assert.equal(a.shields,2);g.destroy(a.uid);assert.equal(a.shields,1);g.endTurn();assert.equal(a.shields,1);g.endTurn();assert.equal(a.shields,1);}
{const g=game(),a=add(g,'cultista');activate(g,'protecao_emergencia');g.endTurn();assert.equal(a.shields,1);g.endTurn();assert.equal(a.shields,0);}
// Collapse recalculates attack dynamically and wipes only at the round boundary.
{const g=game(),a=add(g,'cultista'),b=add(g,'vigia',1);add(g,'circulo_colapso',0,'support');a.counters.medo=3;assert.equal(g.stat(a,'atk'),3);b.counters.medo=1;assert.equal(g.stat(a,'atk'),4);g.endTurn();assert.equal(g.fieldSer().length,2);g.endTurn();assert.equal(g.fieldSer().length,0);}
// Every custom action can be invoked with legal fixtures and its choices settle.
for(const card of HV_DATA.CARD_LIBRARY.filter(c=>c.effects?.some(e=>e.op==='CUSTOM')&&c.subtype!=='field'&&c.subtype!=='reaction')){
 const g=game();g.cfg.deferChoices=false;const source=add(g,card.id,0,card.kind==='ser'?'ser':'support'),human=add(g,'testemunha'),enemy=add(g,'cultista',1);human.counters.medo=4;enemy.counters.medo=3;human.terrorCurrent=1;
 for(let i=0;i<4;i++)add(g,i%2?'leitura_tatica':'vigia',0,'hand');add(g,'leitura_tatica',0,'grave');add(g,'reporter_inexplicavel',0,'grave');
 g.runEffects(card.effects,source.uid,human.uid,0);g.drainChoices();assert.equal(g.choices.length,0,card.name);assert(g.fieldSer().every(c=>g.fear(c)>=0));
}
console.log('OK: 91 cards; rivals; Zombie targets; Human costs; reactions; recovery; counters; round timing; every custom effect.');
