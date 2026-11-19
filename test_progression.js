const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('./cards.js');
require('./engine.js');
require('./expansion.js');
require('./alpha23.js');
require('./duel-stats.js');
require('./booster-catalogue.js');
require('./progression.js');

const g=new HorrorverseEngine({turnPhases:true,pausePhases:true,deferChoices:true});
const phases=()=>{while(g.phaseWaiting)g.advancePhase();};
const make=(id,owner)=>g.clone(HV_DATA.CARD_LIBRARY.find(c=>c.id===id),owner);
assert.equal(g.phase,'draw');assert.equal(g.p().hand.length,5);
g.advancePhase();assert.equal(g.phase,'automatic');assert.equal(g.p().hand.length,6);
g.advancePhase();assert.equal(g.phase,'main');
const code=fs.readFileSync('game.js','utf8').split('let lesson=null;')[1].split('function tutorialAllows(')[0];
const context={engine:g,catalogue:HV_DATA.CARD_LIBRARY};vm.createContext(context);vm.runInContext('let lesson=null;'+code,context);
context.setupTutorial();
const place=(id,slot)=>{const c=g.p().hand.find(c=>c.id===id);g.placeFromHand(c.uid,slot);return c;};
for(const [id,slot,activate,target] of [['papa_sonhos',0,false],['lamina',0,true,0],['grande_impacto',1,true,1]]){
 assert.equal(context.tutorialStep()[0],'place');assert.equal(context.tutorialStep()[1],id);
 const card=place(id,slot);
 if(activate){assert.equal(context.tutorialStep()[0],'activate');g.activate(card.uid,g.allSer(target)[0].uid);}
}
const attacker=g.allSer(0)[0];
assert.equal(context.tutorialStep()[0],'combat');
g.startCombat();assert.equal(context.tutorialStep()[0],'attack');
g.attack(attacker.uid,g.allSer(1)[0].uid);
assert.equal(context.tutorialStep()[0],'end');
g.endTurn();assert.equal(g.phase,'end');phases();g.endTurn();phases();
g.startCombat();assert.equal(context.tutorialStep()[0],'attack');
g.attackDirect(attacker.uid);
assert.equal(g.over.winner,0);assert.equal(g.over.reason,'loucura');
const s=g.stats[0];assert.equal(s.spells,1);assert.equal(s.items,1);assert.equal(s.terrorDamage,3);assert.equal(s.sanityDamage,2);assert(s.exact);
assert.equal(HV_PROGRESS.completeTutorial().total,1000);assert.equal(HV_PROGRESS.completeTutorial(),null);
const ownedBefore=HV_PROGRESS.collection();
assert.equal(Object.values(ownedBefore).reduce((sum,n)=>sum+n,0),24);
assert(HV_DATA.validDeck(HV_DATA.DEFAULT_DECK));
assert(HV_PROGRESS.ownsDeck(HV_DATA.DEFAULT_DECK));
assert(!HV_PROGRESS.ownsDeck([...HV_DATA.DEFAULT_DECK,'zumbi']));
assert.deepEqual(HV_BOOSTERS.packs.map(pack=>pack.cards.length),[17,18,15,20,20,12,12,12]);
const set=new Set(HV_BOOSTERS.packs.flatMap(pack=>pack.cards));
assert.equal(set.size,126);
assert(!HV_DATA.DEFAULT_DECK.some(id=>set.has(id)));
assert([...set].every(id=>HV_DATA.CARD_LIBRARY.some(c=>c.id===id)));
HV_PROGRESS.buy('aberracoes',2);
const drops=HV_PROGRESS.open('aberracoes',()=>0);
assert.equal(drops.length,5);assert(drops.every(c=>c.id===drops[0].id));
assert.deepEqual(drops.map(c=>c.isNew),[true,false,false,false,false]);
assert(HV_PROGRESS.profile().discoveries[drops[0].id]);
HV_PROGRESS.markSeen(drops[0].id);
assert(!HV_PROGRESS.profile().discoveries[drops[0].id]);
assert(HV_PROGRESS.ownsDeck([...HV_DATA.DEFAULT_DECK,drops[0].id,drops[0].id]));
assert(!HV_PROGRESS.ownsDeck([...HV_DATA.DEFAULT_DECK,drops[0].id,drops[0].id,drops[0].id]));
assert.equal(HV_PROGRESS.profile().packs.aberracoes,1);assert.equal(HV_PROGRESS.profile().owned[drops[0].id],5);
assert.equal(HV_PROGRESS.profile().balance,800);assert.throws(()=>HV_PROGRESS.buy('aberracoes',9),/insuficiente/);
const rows=HV_PROGRESS.score(s,g.p(0).sanity);
assert(rows.some(r=>r.label==='Dano Exato'));assert(rows.some(r=>r.label==='Vitória Intacta'));
const reward=HV_PROGRESS.award(g.duelId,rows,s,'Contra CPU');
assert.equal(HV_PROGRESS.award(g.duelId,rows,s,'Contra CPU').total,reward.total);
assert.equal(HV_PROGRESS.profile().balance,800+reward.total);

for(const externalFear of [false,true]){
 g.cfg.winByExtermination=false;g.reset();phases();
 for(const p of g.players){p.hand=[];p.deck=[];}
 const fell=make('gek_felliax',0);
 g.p().hand.push(fell,make('gek_pulliax',0),make('gek_omelliax',0));
 g.placeFromHand(fell.uid,0);
 if(externalFear)g.gainFear(fell,1);
 for(let i=0;i<10;i++){g.endTurn();phases();while(g.choices.length){g.resolveChoice(g.autoChoice(g.choices[0]));phases();}}
 assert(g.allSer(0).some(c=>c.id==='gek_omelliax'));
 assert.equal(g.stats[0].gek,!externalFear);
}
{
 g.cfg.winByExtermination=false;g.reset();phases();
 const witness=make('testemunha',1),thread=make('fios_prata',0);
 const p=g.p();g.p(1).field.ser[0]=witness;p.field.ser[1]=thread;
 const mark=HV_DATA.CARD_LIBRARY.find(c=>c.name==='Marca da Loucura');
 p.hand.push(g.clone(mark,0));
 const c=place(mark.id,0);
 g.activate(c.uid,witness.uid);
 while(g.choices.length)g.resolveChoice({target:g.choices[0].ids[0]});
 assert.equal(g.stats[0].chain,3);
 assert.deepEqual(g.chainEvents.map(e=>e.count),[2,3]);
}
console.log('OK: tutorial guiado, fases pausadas, bônus, compras, duplicatas, evolução natural e corrente ×3.');

{
 // A saved deck from the open catalogue keeps the copies needed to play it.
 const legacy=[...HV_DATA.DEFAULT_DECK.slice(0,23),'zumbi'];
 HV_PROGRESS.preserveLegacyDeck(legacy);
 assert(HV_PROGRESS.ownsDeck(legacy));
 HV_PROGRESS.preserveLegacyDeck([...legacy.slice(0,23),'necro']);
 assert(!HV_PROGRESS.collection().necro);
 const profile=HV_PROGRESS.profile();
 profile.packs['Humano']=1;
 const oldPack=HV_PROGRESS.open('Humano',()=>0);
 assert.equal(oldPack.length,3);
 assert(oldPack.every(c=>c.kind==='ser'&&c.affinity==='Humano'));
 assert.equal(profile.packs.Humano,0);
 assert.throws(()=>HV_PROGRESS.buy('Humano',1));
 const pick=HV_BOOSTERS.get('medo');
 assert.equal(pick.art,'assets/progression/pack-medo.webp');
}

{
 const cards=HV_DATA.CARD_LIBRARY;
 const starter=new Set(HV_DATA.DEFAULT_DECK);
 
 for(const [type,id] of [['item','itens'],['magia','feiticos']]){
  const pack=HV_BOOSTERS.get(id);
  const prerelease=new Set(HV_BOOSTERS.packs.filter(p=>p.id!==id).flatMap(p=>p.cards));
  const eligible=cards.filter(c=>c.kind===type&&!starter.has(c.id)&&!prerelease.has(c.id)).map(c=>c.id);
  assert.deepEqual(new Set(pack.cards),new Set(eligible));
  assert(fs.existsSync(pack.art));
  HV_PROGRESS.buy(id,1);
  const pulls=HV_PROGRESS.open(id,()=>0);
  assert.equal(pulls.length,5);
  assert(pulls.every(c=>c.kind===type&&pack.cards.includes(c.id)));
  assert(HV_PROGRESS.collection()[pulls[0].id]>0);
 }
 assert.equal(cards.filter(c=>!HV_BOOSTERS.isReleased(c.id)).length,21);
 const profile=HV_PROGRESS.profile();
 profile.owned.michael=2;
 profile.legacyDeck.michael=1;
 assert(!HV_PROGRESS.collection().michael);
 assert(!HV_PROGRESS.ownsDeck([...HV_DATA.DEFAULT_DECK,'michael']));
 assert.equal(profile.owned.michael,2);
 assert(!HV_BOOSTERS.get('Assassino').cards.includes('michael'));
 for(const rival of HV_RIVALS)assert(rival.deck.every(HV_BOOSTERS.isReleased));
 const opponent=HV_BOOSTERS.opponentDeck();
 assert(HV_DATA.validDeck(opponent));
 assert(opponent.every(HV_BOOSTERS.isReleased));
}
