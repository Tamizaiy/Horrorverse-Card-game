const assert=require('node:assert/strict');
for(const file of ['cards','engine','expansion','alpha23','booster-catalogue','progression'])require('./'+file);
const progress=HV_PROGRESS;
progress.completeTutorial();
for(const [id,count] of [['cosmico',2],['alta_magia',1],['infernal',1]]){
 const before=progress.profile().balance;
 progress.buy(id,count);assert.equal(progress.profile().balance,before-count*250);
 for(let i=0;i<count;i++){
  const pulls=progress.open(id);assert.equal(pulls.length,5);
  assert(pulls.every(c=>HV_BOOSTERS.get(id).cards.includes(c.id)));
 }
}
assert.throws(()=>progress.buy('medo',1),/insuficiente/);
const game=new HorrorverseEngine({winByExtermination:false,turnPhases:true});
game.p().hand=[];
function add(id,owner,zone){
 const card=game.clone(HV_DATA.CARD_LIBRARY.find(c=>c.id===id),owner);
 if(zone==='hand')game.p(owner).hand.push(card);
 else{const lane=game.p(owner).field[zone];lane[lane.indexOf(null)]=card;}
 return card;
}
const king=add('killmagor',0,'hand'),materials={};
for(const id of ['reyna','helial','basil','groma'])materials[id]=[add(id,0,id==='reyna'?'ser':'hand').uid];
game.placeFromHand(king.uid,1,materials);
assert.equal(game.p().grave.length,4);assert.equal(game.p().sanity,5);assert.equal(game.p(1).sanity,5);
const nova=add('supernova',0,'support');game.activate(nova.uid);assert.equal(game.fieldSer().length,0);
const lock=add('negacao_passagem',0,'support');game.activate(lock.uid);
const target=add('pinhead',0,'hand');assert.throws(()=>game.placeFromHand(target.uid,0),/Negação de Passagem/);
assert.equal(game.find(target.uid).zone,'hand');
console.log('OK: compras premium, inventário, Killmagor, Supernova e Negação de Passagem.');
