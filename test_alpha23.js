const assert=require('node:assert/strict');
const fs=require('node:fs');
require('./cards.js');
require('./engine.js');
require('./expansion.js');
require('./alpha23.js');

const catalogue=HV_DATA.CARD_LIBRARY;
const game=()=>{
 const g=new HorrorverseEngine({turnPhases:true,deferChoices:true,winByExtermination:false});
 for(const p of g.players){p.deck=[];p.hand=[];p.grave=[];}
 return g;
};
const card=(g,id,owner)=>g.clone(catalogue.find(c=>c.id===id),owner);
const add=(g,id,owner,zone='ser')=>{
 const c=card(g,id,owner),p=g.p(owner);
 if(p[zone])p[zone].push(c);
 else p.field[zone][p.field[zone].indexOf(null)]=c;
 return c;
};
const spell=(g,id,target)=>{
 const c=add(g,id,g.active,'hand');
 g.placeFromHand(c.uid,g.p().field.support.indexOf(null));
 g.activate(c.uid,target?.uid);
 return c;
};

assert.equal(catalogue.length,162);
assert.equal(new Set(catalogue.map(c=>c.id)).size,162);
assert.equal(catalogue.filter(c=>c.subtype==='continuous').length,10);
assert(catalogue.every(c=>!c.art||fs.existsSync(c.art)));
assert.equal(catalogue.find(c=>c.id==='drenagem_pavor').subtype,'normal');
assert.equal(catalogue.find(c=>c.id==='circulo_colapso').subtype,'field');

{
 const g=game(),a=add(g,'papa_sonhos',0),b=add(g,'papa_sonhos',1),c=add(g,'cultista',0,'hand');
 assert.deepEqual(g.phaseTrace.map(e=>e.phase),['draw','automatic','main']);
 assert.throws(()=>g.attack(a.uid,b.uid),/fase/);
 g.startCombat();
 assert.throws(()=>g.placeFromHand(c.uid,2),/fase/);
 assert(g.attack(a.uid,b.uid).destroyed);
 g.p(1).skipDraw=1;add(g,'vigia',1,'deck');
 g.endTurn();
 assert.equal(g.p(1).hand.length,0);
 assert.deepEqual(g.phaseTrace.slice(-4).map(e=>e.phase),['end','draw','automatic','main']);
}
{
 const g=game(),gek=add(g,'gek_felliax',0),boneca=add(g,'boneca',1);
 spell(g,'sistema_cambio_oculto');
 const pull=add(g,'gek_pulliax',0,'deck');
 const omelliax=add(g,'gek_omelliax',0,'hand');
 gek.counters.medo=2;
 g.p(0).deck.unshift(card(g,'grande_impacto',0),card(g,'afiar_garras',0));
 g.shuffle=deck=>deck;
 g.endTurn();g.endTurn();
 assert.equal(g.phase,'draw');assert.equal(g.choices.length,1);assert.equal(g.fear(gek),2);
 assert.throws(()=>g.startCombat(),/fase/);
 for(let i=0;i<2;i++){
  const choice=g.choices[0];assert.equal(choice.card.id,'sistema_cambio_oculto');
  g.resolveChoice({values:[choice.ids[0]]});
 }
 assert.equal(g.phase,'main');assert.equal(g.p(0).exchanges,2);
 assert.equal(g.find(gek.uid).zone,'grave');assert.equal(g.find(pull.uid).zone,'ser');
 pull.counters.medo=1;
 g.endTurn();g.endTurn();
 while(g.choices.length)g.resolveChoice({values:[]});
 assert.equal(g.find(omelliax.uid).zone,'ser');assert.equal(g.find(boneca.uid).zone,'grave');
 assert.equal(g.phase,'main');
}
{
 const g=game(),t=add(g,'papa_sonhos',1);
 const parasite=spell(g,'parasita_vertiginoso',t);
 const fearSink=spell(g,'queda_continua_desesperada');
 const fearSource=add(g,'boneca',0);
 g.activateSer(fearSource.uid,t.uid);
 g.gainFear(t,1);
 assert.equal(g.fear(t),0);assert.equal(g.fear(fearSink),2);
 assert.equal(g.stat(t,'def'),0);
 g.endTurn();g.endTurn();
 assert.equal(g.stat(t,'atk'),3);
 g.destroy(parasite.uid);g.destroy(fearSink.uid);
 assert.equal(g.stat(t,'atk'),4);assert.equal(g.stat(t,'def'),1);
}
{
 const g=game(),ally=add(g,'papa_sonhos',0),enemy=add(g,'papa_sonhos',1);
 spell(g,'fila_espera_submundo');
 g.startCombat();g.attack(ally.uid,enemy.uid);
 assert.equal(g.find(enemy.uid).zone,'hand');
 assert.equal(g.remainingTerror(enemy),3);
}
{
 const g=game(),enemy=add(g,'papa_sonhos',1);
 add(g,'fios_prata',0);
 const wizard=add(g,'arquimago_veu_partido',1);
 const payment=add(g,'vigia',1,'hand');
 const spellCard=spell(g,'grande_impacto',enemy);
 assert.equal(g.choices[0].actor,1);
 g.resolveChoice({values:[payment.uid]});
 assert(g.used(wizard,'spellNegation'));
 assert.equal(g.find(spellCard.uid).zone,'grave');
 assert.equal(g.remainingTerror(enemy),3);
 assert.equal(g.choices[0].card.id,'fios_prata');
 g.resolveChoice({target:enemy.uid});
 assert.equal(g.stat(enemy,'def'),0);
}
{
 const g=game(),ally=add(g,'papa_sonhos',0),enemy=add(g,'retaliante',1);
 const guardian=add(g,'guardia_ultimo_limiar',1);
 const payment=add(g,'vigia',1,'hand');
 spell(g,'drenagem_almas');
 assert.equal(g.choices[0].actor,1);assert.equal(g.p(0).sanity,10);
 g.resolveChoice({values:[payment.uid]});
 assert(g.used(guardian,'sanityGuard'));
 assert.equal(g.p(1).sanity,10);assert.equal(g.p(0).sanity,9);
 assert.equal(g.stat(enemy,'atk'),3);assert.equal(g.remainingTerror(ally),1);
}
{
 const g=game(),s=add(g,'sussurrante',0,'hand'),wrong=add(g,'vigia',0,'hand'),i1=add(g,'lamina',0,'hand'),i2=add(g,'amuleto',0,'hand');
 assert.throws(()=>g.placeFromHand(s.uid,0,{discard:[wrong.uid,i1.uid]}),/descarte/);
 assert.equal(g.p().grave.length,0);
 g.placeFromHand(s.uid,0,{discard:[i1.uid,i2.uid]});
 assert.equal(g.stat(s,'atk'),7);
 const gek=add(g,'gek_pulliax',0,'hand');
 assert.throws(()=>g.placeFromHand(gek.uid,1),/só pode/);
}
{
 const g=game(),ally=add(g,'papa_sonhos',0),grave=add(g,'retaliante',0,'grave');
 spell(g,'metamorfose_corrupta',ally);
 g.resolveChoice({values:[grave.uid,ally.uid]});
 assert.equal(g.allSer(0).length,2);
 g.endTurn();g.endTurn();
 assert.equal(g.allSer(0).length,0);
 assert.equal(g.p(0).grave.filter(c=>c.kind==='ser').length,2);
}
{
 const g=game(),titan=add(g,'tita_massacre',0),weak=add(g,'papa_sonhos',1);
 add(g,'papa_sonhos',1);g.turn=3;g.startCombat();
 g.attack(titan.uid,weak.uid);
 assert(g.canDirectAttack(titan.uid));
 g.attackDirect(titan.uid);
 assert.equal(g.p(1).sanity,6);assert.equal(g.remainingTerror(titan),6);
 assert(!g.canDirectAttack(titan.uid));
}
{
 const g=game(),ally=add(g,'papa_sonhos',0),enemy=add(g,'papa_sonhos',1);
 const slip=add(g,'escorregao',1,'support');
 g.startCombat();assert(g.attack(ally.uid,enemy.uid).pending);
 assert(g.respond(slip.uid).negated);
 assert.equal(g.remainingTerror(enemy),3);assert.equal(g.stat(ally,'def'),0);
 g.endTurn();assert.equal(g.stat(ally,'def'),0);
 g.endTurn();assert.equal(g.stat(ally,'def'),1);
}
{
 const g=game(),gek=add(g,'gek_felliax',0);
 const veil=add(g,'veu_lucidez',0,'support');
 g.endTurn();g.endTurn();
 assert.equal(g.phase,'automatic');assert.equal(g.fear(gek),0);
 assert.throws(()=>g.endTurn(),/escolhas/);
 g.resolveChoice({values:[veil.uid]});
 assert.equal(g.phase,'main');assert.equal(g.fear(gek),0);
}
{
 const g=game(),human=add(g,'sobrevivente',0),other=add(g,'sobrevivente',1),gek=add(g,'gek_felliax',1);
 const resistance=spell(g,'forca_resistencia');
 assert.equal(g.stat(human,'atk'),human.atk+2);
 assert.equal(g.stat(other,'atk'),other.atk);
 spell(g,'campo_drenagem');
 g.endTurn();assert.equal(g.remainingTerror(gek),1);
 g.endTurn();assert.equal(g.find(gek.uid).zone,'grave');
 g.destroy(resistance.uid);assert.equal(g.stat(human,'atk'),human.atk);
}
{
 const g=game(),a=add(g,'papa_sonhos',0),b=add(g,'papa_sonhos',1);
 const collapse=add(g,'circulo_colapso',0,'hand');
 g.placeFromHand(collapse.uid,0);
 g.gainFear(a,2);g.gainFear(b,1);
 assert.equal(g.stat(a,'atk'),5);assert.equal(g.stat(b,'atk'),5);
 g.endTurn();assert.equal(g.fieldSer().length,2);
 g.endTurn();assert.equal(g.fieldSer().length,0);
}
console.log('OK: 38 novas cartas, 6 Contínuos, ordem de fases e escolhas, evolução Gek, proteções, custos e ataques adicionais.');
