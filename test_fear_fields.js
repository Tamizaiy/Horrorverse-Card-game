const assert=require('node:assert/strict');
require('./cards.js');
require('./engine.js');
require('./expansion.js');
const {CARD_LIBRARY,DEFAULT_DECK,validDeck,E}=HV_DATA;
const make=()=>new HorrorverseEngine({deferChoices:true});
const add=(g,id,owner,lane='ser',slot=null)=>{
 const card=g.clone(CARD_LIBRARY.find(c=>c.id===id),owner),player=g.p(owner);
 if(lane==='hand')player.hand.push(card);
 else player.field[lane][slot??player.field[lane].indexOf(null)]=card;
 return card;
};
const play=(g,id,lane='ser',opts={})=>{
 const card=add(g,id,g.active,'hand');
 g.placeFromHand(card.uid,g.p().field[lane].indexOf(null),opts);
 return card;
};
const fear=(g,card,amount)=>g.gainFear(card,amount);
assert.equal(CARD_LIBRARY.length,91);
assert.equal(DEFAULT_DECK.length,30);
assert(validDeck(DEFAULT_DECK));
assert(!validDeck(DEFAULT_DECK.slice(0,19)));
assert(validDeck(DEFAULT_DECK.slice(0,20)));

// A transfer fires the recipient's trigger once, independently of its size.
{
 const g=make(),source=add(g,'cultista',1),witness=add(g,'testemunha',0);
 fear(g,source,2);
 const before=g.p(0).hand.length;
 play(g,'noiva');
 assert.equal(g.choices[0].kind,'transfer');
 assert.throws(()=>g.resolveChoice({from:source.uid,to:source.uid,amount:2}),/inválida/);
 g.resolveChoice({from:source.uid,to:witness.uid,amount:2});
 fear(g,witness,1);
 assert.equal(g.fear(source),0);
 assert.equal(g.fear(witness),3);
 assert.equal(g.p(0).hand.length,before+1);
 g.endTurn();
 fear(g,witness,1);
 assert.equal(g.p(0).hand.length,before+2);
}
// Split cost validation is atomic; Cobrador marks all enemy beings.
{
 const g=make(),ally=add(g,'cultista',0),enemy=add(g,'vigia',1),other=add(g,'testemunha',1);
 fear(g,ally,1);fear(g,enemy,2);
 const c=add(g,'cobrador',0,'hand');
 assert.throws(()=>g.placeFromHand(c.uid,1,{fearCosts:[ally.uid,ally.uid,enemy.uid]}),/insuficientes/);
 assert.equal(g.fearTotal(),3);
 g.placeFromHand(c.uid,1,{fearCosts:[ally.uid,enemy.uid,enemy.uid]});
 assert.equal(g.fear(ally),0);assert.equal(g.fear(enemy),1);assert.equal(g.fear(other),1);
 g.endTurn();
 const v=add(g,'vigario',1,'hand');
 assert.throws(()=>g.placeFromHand(v.uid,2),/Faltam 4/);
 fear(g,other,2);
 g.placeFromHand(v.uid,2);
 assert.equal(g.fearTotal(),4);
}
// Manual skills, thresholds, aura, turn expiration and loss of Sanidade.
{
 const g=make(),oracle=add(g,'oraculo',0),devourer=add(g,'devorador_pavor',0),executioner=add(g,'executor',0);
 add(g,'eco',0);add(g,'carcaca',0);
 const a=add(g,'ghostface',1),b=add(g,'cultista',1),doll=add(g,'boneca',1);
 fear(g,a,4);fear(g,b,3);
 assert.equal(g.stat(a,'def'),a.def-1);
 g.activateSer(oracle.uid,a.uid);
 assert.equal(g.stat(a,'atk'),a.atk-2);
 assert.throws(()=>g.activateSer(oracle.uid,a.uid),/indisponível/);
 g.activateSer(devourer.uid,null,[a.uid,a.uid]);
 assert.equal(g.stat(devourer,'atk'),devourer.atk+2);
 assert.throws(()=>g.activateSer(executioner.uid,a.uid),/Alvo/);
 b.shields=1;g.activateSer(executioner.uid,b.uid);
 assert.equal(g.find(b.uid).zone,'ser');assert.equal(b.shields,0);
 g.endTurn();
 assert.equal(g.p(1).sanity,9);
 assert.equal(g.stat(a,'atk'),a.atk);
 g.activateSer(doll.uid,a.uid);
 assert.equal(g.fear(a),3);
}
// Portador marks surviving targets. Morcego draws and Zumbi marks the player.
{
 const g=make(),portador=add(g,'portador',0),bat=add(g,'morcego',0),zombie=add(g,'zumbi',1),target=add(g,'ghostface',1);
 target.def=1;
 g.attack(portador.uid,target.uid);
 assert.equal(g.find(target.uid).zone,'grave');assert.equal(g.fear(target),0);
 zombie.def=1;
 portador.hasAttacked=false;portador.atk=3;
 g.attack(portador.uid,zombie.uid);
 assert.equal(g.fear(zombie),1);
 const before=g.p(0).hand.length;
 g.attack(bat.uid,zombie.uid);
 assert.equal(g.p(0).hand.length,before+1);
 assert.equal(g.fear(g.p(0)),0);assert.equal(g.choices[0].kind,'target');g.resolveChoice({target:portador.uid});assert.equal(g.fear(portador),1);assert.equal(g.fearTotal(),1);
}
// Passive effects from the grid.
{
 const g=make(),skeleton=add(g,'esqueleto',0),scarecrow=add(g,'espantalho',0),mummy=add(g,'mumia',1);
 assert.equal(g.stat(skeleton,'atk'),4);assert.equal(g.stat(scarecrow,'atk'),2);
 mummy.def=0;mummy.terrorCurrent=1;
 assert(!g.attack(skeleton.uid,mummy.uid).destroyed);assert.equal(g.p(1).sanity,9);
 const spell=add(g,'corte',0,'support');
 g.activate(spell.uid,mummy.uid);assert.equal(g.find(mummy.uid).zone,'grave');
 play(g,'aparicao','ser',{defCost:skeleton.uid});assert.equal(g.stat(skeleton,'def'),0);
 g.endTurn();assert.equal(g.stat(skeleton,'def'),2);
}
// All field variations and how their triggers interact with combat and counters.
{
 const g=make(),spiritual=add(g,'espectro',0),enemy=add(g,'xenomorfo',1);
 const threshold=play(g,'limiar','support');
 assert.equal(g.remainingTerror(spiritual),spiritual.terror+1);
 const noiva=play(g,'noiva');
 assert.equal(g.choices[0].card,threshold);
 g.resolveChoice({target:enemy.uid});assert.equal(g.fear(enemy),1);
 assert.equal(g.remainingTerror(noiva),6);
 g.destroy(threshold.uid);assert.equal(g.remainingTerror(noiva),5);
}
{
 const g=make(),field=play(g,'trono','support'),doll=play(g,'boneca');
 assert.equal(g.choices[0].card,field);
 g.resolveChoice({target:doll.uid});assert.equal(doll.shields,1);assert.equal(g.remainingTerror(doll),5);
}
{
 const g=make(),pool=play(g,'poco','support'),ally=add(g,'xenomorfo',0),carcass=add(g,'carcaca',1);
 fear(g,ally,2);
 assert.equal(g.stat(ally,'def'),ally.def+1);
 g.runEffects([{op:E.BUFF,target:'enemySer',stat:'def',amount:-2}],carcass.uid,ally.uid,1);
 assert.equal(g.stat(ally,'def'),ally.def-1);
 g.endTurn();assert.equal(g.stat(ally,'def'),ally.def+1);
 g.destroy(pool.uid);assert.equal(g.stat(ally,'def'),ally.def);
}
{
 const g=make(),refuge=play(g,'refugio','support'),human=add(g,'testemunha',0);
 add(g,'sobrevivente',0);
 assert.equal(g.stat(human,'def'),human.def+1);
 g.changeSanity(0,-2);g.changeSanity(0,-2);assert.equal(g.p(0).sanity,7);
 g.destroy(refuge.uid);
}
{
 const g=make(),assassin=add(g,'portador',0),carnage=add(g,'executor',0),infernal=add(g,'pinhead',0),enemy=add(g,'cultista',1);
 play(g,'beco','support');play(g,'matadouro','support');play(g,'fenda','support');
 assert.equal(g.stat(assassin,'atk'),5);
 assert.equal(g.stat(carnage,'atk'),5);assert.equal(g.battleAtk(carnage),7);
 assert.equal(g.stat(infernal,'atk'),infernal.atk+1);assert.equal(g.remainingTerror(infernal),infernal.terror+1);
 enemy.terrorCurrent=1;
 assert(g.attack(assassin.uid,enemy.uid).destroyed);
 assert.equal(g.p(1).sanity,9);
}
{
 const g=make(),occult=add(g,'cultista',0),sanctuary=play(g,'santuario','support');
 g.resolveChoice({target:occult.uid});assert.equal(g.stat(occult,'atk'),occult.atk+1);
 assert.equal(g.stat(occult,'def'),occult.def+1);
 const draw=add(g,'necro',0,'support');g.activate(draw.uid);assert.equal(g.choices.length,0);
 assert.equal(g.activeField().uid,sanctuary.uid);
}
// The absent adult is a real dependency, tested with a temporary fixture.
{
 const adult={id:'lobisomem_adulto',name:'Lobisomem Adulto',kind:'ser',rarity:'especial',affinity:'Aberração',atk:6,def:4,terror:4,effects:[]};
 CARD_LIBRARY.push(adult);
 try{
  const g=make(),attacker=add(g,'jason',0),cub=add(g,'lobisomem_jovem',1),next=add(g,adult.id,1,'hand');
  assert(g.attack(attacker.uid,cub.uid).destroyed);
  assert.equal(g.choices[0].kind,'summon');
  g.resolveChoice({target:next.uid});
  assert.equal(g.find(next.uid).zone,'ser');
 }finally{CARD_LIBRARY.pop()}
}
console.log('OK: deck 20–30, fear, triggers, eight Fields and summon mechanics.');
