const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
require('./cards');require('./booster-catalogue');require('./progression');
const storage=new Map(),catalogue=HV_DATA.CARD_LIBRARY;
const ctx={HV_DATA,HV_BOOSTERS,HV_PROGRESS:{...HV_PROGRESS},crypto,Event:class{},dispatchEvent(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('cloud-progress.js','utf8'),ctx);
const guestBalance=ctx.HV_PROGRESS.profile().balance;
const stock=Object.fromEntries(HV_DATA.DEFAULT_DECK.map(id=>[id,HV_DATA.DEFAULT_DECK.filter(c=>c===id).length]));
function server(){
 const s={rubedio:1000,tutorial_reward_claimed:false,card_ids:[...HV_DATA.DEFAULT_DECK],collection:Object.entries(stock).map(([card_id,quantity])=>({card_id,quantity,is_new:false})),inventory:[],history:[]},receipts=new Map();
 let loseResponse=false,failSnapshot=false;
 return {state:s,lose(){loseResponse=true;},failSnapshot(){failSnapshot=true;},async rpc(name,a){
  if(name==='hv_initialize_account')return {data:null};
  if(name==='hv_get_state'){if(failSnapshot){failSnapshot=false;return {error:{message:'offline'}};}return {data:structuredClone(s)};}
  if(name==='hv_save_deck'){s.card_ids=a.p_card_ids;return {data:null};}
  if(name==='hv_mark_card_seen'){s.collection.find(c=>c.card_id===a.p_card_id).is_new=false;return {data:null};}
  if(receipts.has(a.p_request_id))return {data:receipts.get(a.p_request_id)};
  let result=null;
  if(name==='hv_buy_packs'){
   const cost=HV_BOOSTERS.get(a.p_pack_id).price*a.p_quantity;
   if(s.rubedio<cost)return {error:{code:'P0001',message:'insuficiente'}};
   s.rubedio-=cost;let p=s.inventory.find(p=>p.pack_id===a.p_pack_id);
   if(!p)s.inventory.push(p={pack_id:a.p_pack_id,quantity:0});p.quantity+=a.p_quantity;
  }
  if(name==='hv_open_pack'){
   const p=s.inventory.find(p=>p.pack_id===a.p_pack_id);p.quantity--;
   const id=HV_BOOSTERS.get(a.p_pack_id).cards[0];let c=s.collection.find(c=>c.card_id===id);
   const isNew=!c;if(!c)s.collection.push(c={card_id:id,quantity:0,is_new:true});c.quantity+=5;
   result={cards:Array.from({length:5},(_,i)=>({card_id:id,is_new:isNew&&i===0}))};
  }
  if(name==='hv_claim_tutorial_reward'&&!s.tutorial_reward_claimed){s.tutorial_reward_claimed=true;s.rubedio+=1000;}
  if(name==='hv_reset_account'){s.rubedio=0;s.tutorial_reward_claimed=false;s.inventory=[];s.collection=s.collection.filter(c=>stock[c.card_id]).map(c=>({...c,quantity:stock[c.card_id]}));s.card_ids=[...HV_DATA.DEFAULT_DECK];}
  if(a.p_request_id)receipts.set(a.p_request_id,result);
  if(loseResponse){loseResponse=false;return {error:{message:'Resposta perdida'}};}
  return {data:result};
 }};
}
(async()=>{
 const a=server(),b=server(),P=ctx.HV_PROGRESS,C=ctx.HV_CLOUD;
 await C.connect(a,'A');assert.equal(Object.values(P.collection()).reduce((a,b)=>a+b),24);
 a.lose();await assert.rejects(P.buy('cosmico',1));assert.equal(a.state.rubedio,750);
 await P.buy('cosmico',1);assert.equal(a.state.rubedio,750);assert.equal(P.profile().packs.cosmico,1);
 a.failSnapshot();await assert.rejects(P.buy('medo',1));await P.buy('medo',1);assert.equal(a.state.rubedio,650);
 const cards=await P.open('cosmico');assert.equal(cards.length,5);assert.equal(cards.filter(c=>c.isNew).length,1);
 await P.markSeen(cards[0].id);assert(!P.profile().discoveries[cards[0].id]);
 await C.saveDeck([...HV_DATA.DEFAULT_DECK]);assert(P.ownsDeck(a.state.card_ids));
 await C.connect(b,'B');assert.equal(P.profile().balance,1000);assert(!P.collection()[cards[0].id]);assert(C.draftKey().includes('B'));
 await C.connect(a,'A');assert.equal(P.profile().balance,650);await P.completeTutorial();assert.equal(P.profile().balance,1650);assert.equal(await P.completeTutorial(),null);
 await P.resetAccount();assert.equal(P.profile().balance,0);assert(!P.profile().tutorial);assert.equal(Object.values(P.collection()).reduce((a,b)=>a+b),24);
 C.disconnect();assert.equal(P.profile().balance,guestBalance);
 console.log('OK: isolamento de contas/visitante, saldo e coleção, compra com resposta perdida, retry após snapshot falho, abertura, deck, tutorial e reset.');
})().catch(e=>{console.error(e);process.exitCode=1});
