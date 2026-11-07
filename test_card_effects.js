const assert=require('node:assert/strict');
require('./cards.js');require('./engine.js');
require('./expansion.js');
const {CARD_LIBRARY}=HV_DATA;
const fresh=()=>new HorrorverseEngine();
const put=(g,id,owner,lane,slot)=>{
  const c=g.clone(CARD_LIBRARY.find(x=>x.id===id),owner);
  if(lane==='hand')g.p(owner).hand.push(c);else g.p(owner).field[lane][slot]=c;
  return c;
};
// Rosto: only positive damage triggers loss, including a direct hit.
{
 const g=fresh(),a=put(g,'ghostface',0,'ser',0),d=put(g,'cultista',1,'ser',0);
 assert.equal(g.attack(a.uid,d.uid).damage,0);assert.equal(g.p(1).sanity,10);
 d.def=3;a.hasAttacked=false;assert.equal(g.attack(a.uid,d.uid).damage,1);assert.equal(g.p(1).sanity,9);
 g.destroy(d.uid);g.endTurn();g.endTurn();g.attackDirect(a.uid);assert.equal(g.p(1).sanity,6);
}
// Vulto: defense wears off immediately at the end of its summoning turn.
{
 const g=fresh(),a=put(g,'michael',0,'hand');g.placeFromHand(a.uid,0);
 assert.equal(g.stat(a,'def'),4);g.endTurn();assert.equal(g.stat(a,'def'),3);
}
// Carrasco can target either side; an invalid target never spends the sacrifice.
{
 const g=fresh(),a=put(g,'jason',0,'hand'),cost=put(g,'cultista',0,'ser',0),ally=put(g,'fita',0,'support',0),enemy=put(g,'rlyeh',1,'support',0);
 assert.throws(()=>g.placeFromHand(a.uid,1,{sacrifices:[cost.uid],summonTargets:{0:[cost.uid]}}),/Alvos/);assert.equal(g.find(cost.uid).zone,'ser');
 g.placeFromHand(a.uid,1,{sacrifices:[cost.uid],summonTargets:{0:[enemy.uid]}});
 assert.equal(g.find(cost.uid).zone,'grave');assert.equal(g.find(enemy.uid).zone,'grave');assert.equal(g.find(ally.uid).zone,'support');
}
// Dama: distinct enemy targets, no mandatory count, fear clears on exit.
for(const count of [0,1,2]){
 const g=fresh(),a=put(g,'sadako',0,'hand'),cost=put(g,'fita',0,'support',0),targets=[put(g,'cultista',1,'ser',0),put(g,'vigia',1,'ser',1)];
 assert.throws(()=>g.placeFromHand(a.uid,0,{items:[cost.uid],summonTargets:{0:[targets[0].uid,targets[0].uid]}}),/Alvos/);
 g.placeFromHand(a.uid,0,{items:[cost.uid],summonTargets:{0:targets.slice(0,count).map(c=>c.uid)}});
 targets.forEach((c,i)=>assert.equal(c.counters.medo??0,i<count?1:0));assert.equal(g.p(1).sanity,10);
 g.destroy(targets[0].uid);assert.equal(targets[0].counters.medo,undefined);
}
// Confessor: CPU/default target selection works and cannot shield itself.
for(const hasAlly of [false,true]){
 const g=fresh(),a=put(g,'pinhead',0,'hand'),cost=put(g,'fita',0,'support',0),ally=hasAlly?put(g,'cultista',0,'ser',0):null;
 g.placeFromHand(a.uid,1,{items:[cost.uid]});assert.equal(a.shields,0);if(ally)assert.equal(ally.shields,1);
}
// Predador only draws on an actual combat kill, not on damage or a shield save.
{
 const g=fresh(),a=put(g,'xenomorfo',0,'ser',0),d=put(g,'cultista',1,'ser',0),before=g.p(0).hand.length;
 d.shields=1;assert.equal(g.attack(a.uid,d.uid).shielded,true);assert.equal(g.p(0).hand.length,before);
 a.hasAttacked=false;assert.equal(g.attack(a.uid,d.uid).destroyed,true);assert.equal(g.p(0).hand.length,before+1);
}
console.log('OK: cinco habilidades novas, alvos, custos, combate e limpeza dos contadores.');
