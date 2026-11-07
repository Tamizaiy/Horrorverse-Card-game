const assert=require('assert'),fs=require('fs'),vm=require('vm');const ctx={console};ctx.globalThis=ctx;vm.createContext(ctx);for(const name of ['cards.js','engine.js','expansion.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+name,'utf8'),ctx);const {HorrorverseEngine,HV_DATA}=ctx;const {E}=HV_DATA;
const {CARD_LIBRARY,DEFAULT_DECK,validDeck}=HV_DATA;
const thirty=CARD_LIBRARY.slice(0,15).flatMap(card=>[card.id,card.id]);
assert.equal(validDeck(thirty),true);
assert.equal(validDeck([...thirty,CARD_LIBRARY[15].id]),false);
assert.equal(validDeck(['fita','fita','fita']),false);
assert.equal(validDeck(CARD_LIBRARY.filter(card=>card.kind==='magia').slice(0,30).map(card=>card.id)),true);
assert.equal(validDeck(['inexistente']),false);
assert.equal(validDeck([]),false);
assert.equal(validDeck([],{draft:true}),true);

let g=new HorrorverseEngine();
assert.equal(g.p(0).hand.length,6);
assert.equal(g.p(1).hand.length,5);
assert.equal(g.p(0).deck.length,DEFAULT_DECK.length-6);
g.endTurn();
assert.equal(g.p(1).hand.length,6);
assert.equal(g.p(1).deck.length,DEFAULT_DECK.length-6);

// Put all beings below the opening hand. They still prevent extermination.
const ordered=new HorrorverseEngine({minDeckSize:1});
ordered.shuffle=cards=>cards;
const supports=['fita','necro','lamina','espelho','rlyeh','cripta'];
ordered.setDecks([...supports,'cultista'],supports);
assert.equal(ordered.p(0).hand.some(card=>card.kind==='ser'),false);
assert.equal(ordered.checkWin(),null);
const necro=ordered.p(0).hand.find(card=>card.id==='necro');
ordered.placeFromHand(necro.uid,0);
ordered.activate(necro.uid);
const onlySer=ordered.p(0).hand.find(card=>card.id==='cultista');
assert(onlySer,'O item compra Seres do mesmo monte');
ordered.placeFromHand(onlySer.uid,0);
ordered.destroy(onlySer.uid);
assert.equal(ordered.over.reason,'extermínio');
assert.equal(ordered.over.winner,1);

ordered.setDecks(['fita'],['necro']);
assert.equal(ordered.p(0).hand.length,1);
ordered.endTurn();
assert.equal(ordered.p(1).hand.length,1);
assert.equal(ordered.checkWin(),null);
assert.throws(()=>ordered.setDecks(['fita','fita','fita'],supports),/inválido/);
assert.equal(ordered.p(1).hand.length,1);

ordered.setDecks(supports,supports);
const placeField=id=>{
 const card=ordered.p().hand.find(card=>card.id===id);
 ordered.placeFromHand(card.uid,0);
 return card.uid;
};
const circle=placeField('rlyeh');
assert.equal(ordered.activeField().id,'rlyeh');
ordered.endTurn();
const crypt=placeField('cripta');
assert.equal(ordered.activeField().id,'cripta');
ordered.destroy(crypt);
assert.equal(ordered.activeField().id,'rlyeh');
ordered.destroy(circle);
assert.equal(ordered.activeField(),null);

const classic=CARD_LIBRARY.slice(0,20).map(card=>card.id);
g.setDecks(classic,classic);
const card=(id,p=g.active)=>{let h=g.p(p).hand.find(c=>c.id===id);if(!h){let idx=g.p(p).deck.findIndex(c=>c.id===id);if(idx>=0){h=g.p(p).deck.splice(idx,1)[0];g.p(p).hand.push(h)}}return h};const place=(id,slot,options)=>g.placeFromHand(card(id).uid,slot,options);
place('ghostface',0);assert.equal(g.p().field.ser[0].id,'ghostface');
assert.throws(()=>place('cultista',1),/Limite/);
place('fita',0);assert.equal(g.p().field.support[0].id,'fita');
place('sadako',1,{items:[g.p().field.support[0].uid]});assert.equal(g.p(1).sanity,10);assert.equal(g.p().field.ser[1].name,'A Dama da Frequência Morta');
g.endTurn();place('cultista',0);place('selo',0);let seal=g.p().field.support[0].uid;g.activate(seal,g.p(0).field.ser[0].uid);assert(g.p(0).field.ser[0].sealedUntil>=g.turn);
// Protection and buff: direct calls on pure engine
let enemy=g.p().field.ser[0];g.runEffects([{op:E.PROTECT,target:'allySer',amount:1}],null,enemy.uid,1);assert.equal(enemy.shields,1);g.runEffects([{op:E.DESTROY,target:'enemySer'}],null,enemy.uid,0);assert.equal(enemy.shields,0);assert(g.find(enemy.uid)?.zone==='ser');
g.runEffects([{op:E.BUFF,target:'enemySer',stat:'atk',amount:3,duration:2}],null,enemy.uid,0);assert.equal(g.stat(enemy,'atk'),5);
g.runEffects([{op:E.COUNTER,target:'enemySer',counter:'medo',amount:2}],null,enemy.uid,0);assert.equal(enemy.counters.medo,2);
g.runEffects([{op:E.TOKEN,target:'selfPlayer',name:'Teste',atk:1,def:1}],null,null,1);assert(g.allSer(1).some(c=>c.token));
g.runEffects([{op:E.SANITY,target:'enemyPlayer',amount:-10}],null,null,0);assert.equal(g.over?.reason,'loucura');
let r=new HorrorverseEngine();r.p(1).field.support[0]=r.clone(HV_DATA.CARD_LIBRARY.find(x=>x.id==='interdicao'),1);let m=r.p(0).hand.find(x=>x.id==='pesadelo'); // may be in deck: use catalog to seed
if(!m){m=r.clone(HV_DATA.CARD_LIBRARY.find(x=>x.id==='pesadelo'),0);r.p(0).hand.push(m)}r.placeFromHand(m.uid,0);assert.equal(r.activate(m.uid),'pending');let reaction=r.p(1).field.support[0].uid;r.respond(reaction);assert.equal(r.p(1).sanity,10);
console.log('OK: shared draw pile, deck limits, field order, deck zones, common/special summon, cost, draw, protection, buffs, counters, tokens, sanity win, negate reaction.');

// Combate Alpha 1.0 — ATK-DEF, TERROR como vida, bloqueio e eliminação.
let b=new HorrorverseEngine();
let ca=b.clone({id:'atacante',name:'Atacante',kind:'ser',atk:7,def:1,terror:4,effects:[]},0);
let cb=b.clone({id:'defensor',name:'Defensor',kind:'ser',atk:1,def:5,terror:4,effects:[]},1);
b.p(0).field.ser[0]=ca;b.p(1).field.ser[0]=cb;
let hit=b.attack(ca.uid,cb.uid);
assert.equal(hit.damage,2);assert.equal(hit.before,4);assert.equal(hit.after,2);assert.equal(cb.terrorCurrent,2);
ca.hasAttacked=false;ca.atk=4;
let block=b.attack(ca.uid,cb.uid);assert.equal(block.blocked,true);assert.equal(block.after,2);
ca.hasAttacked=false;ca.atk=8;
let kill=b.attack(ca.uid,cb.uid);assert.equal(kill.destroyed,true);assert.equal(b.p(1).grave.some(x=>x.uid===cb.uid),true);
console.log('OK: ATK - DEF, TERROR restante, bloqueio e eliminação.');
