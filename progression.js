(function(root){
'use strict';
const cards=root.HV_DATA.CARD_LIBRARY;
const key='horrorverse.progression.v1';

const boosters=root.HV_BOOSTERS;
const starter=root.HV_DATA.DEFAULT_DECK.reduce((counts,id)=>(counts[id]=(counts[id]||0)+1,counts),{});
const cardsById=new Map(cards.map(c=>[c.id,c]));
function collection(p=profile()){
 const counts={...starter};
 for(const source of [p.owned,p.legacyDeck||{}]){
  for(const [id,count] of Object.entries(source)){
   if(boosters.isReleased(id)&&Number.isSafeInteger(count)&&count>0)counts[id]=(counts[id]||0)+count;
  }
 }
 return counts;
}
function ownsDeck(ids,p=profile()){
 if(!root.HV_DATA.validDeck(ids,{draft:true}))return false;
 const counts=collection(p);
 return ids.every(id=>counts[id]-- >0);
}
function preserveLegacyDeck(ids){
 const p=profile();
 if(p.legacyDeck||!root.HV_DATA.validDeck(ids))return;
 const available=collection(p);
 p.legacyDeck={};
 for(const id of ids){
  if(!boosters.isReleased(id))continue;
  if((available[id]||0)>0)available[id]--;
  else p.legacyDeck[id]=(p.legacyDeck[id]||0)+1;
 }
 persist(p);
}
const rarity=c=>c.periculosidade>=6?'UR':c.periculosidade>=5?'SR':c.periculosidade>=3?'R':'C';
const tiers=[['C',70],['R',22],['SR',7],['UR',1]];
let memory=null;
function profile(){
 try{return JSON.parse(root.localStorage.getItem(key))||memory||fresh();}catch{return memory||fresh();}
}
function fresh(){return {balance:0,packs:{},owned:{},history:[],tutorial:false};}
function persist(p){
 if(root.localStorage)root.localStorage.setItem(key,JSON.stringify(p));
 memory=p;
 return p;
}
function buy(type,quantity){
 const p=profile();
 if(!boosters.packs.some(pack=>pack.id===type)||!Number.isSafeInteger(quantity)||quantity<1||quantity>99)throw Error('Escolha de 1 a 99 pacotes.');
 const cost=boosters.get(type).price;
 if(p.balance<cost*quantity)throw Error('Rubédio insuficiente para essa compra.');
 p.balance-=cost*quantity;
 p.packs[type]=(p.packs[type]||0)+quantity;
 return persist(p);
}
function open(type,random=Math.random){
 const p=profile();
 const pack=boosters.get(type);
 if(!pack||!p.packs[type])throw Error('Você não tem esse pacote.');
 const pool=pack.cards.map(id=>cardsById.get(id));
 if(!pool.length||pool.some(card=>!card))throw Error('O catálogo deste pacote está indisponível.');
 const available=tiers.map(([code,weight])=>({weight,pool:pool.filter(c=>rarity(c)===code)})).filter(t=>t.pool.length);
 const total=available.reduce((sum,t)=>sum+t.weight,0);
 const results=Array.from({length:pack.size},()=>{
  let roll=random()*total;
  const t=available.find(t=>(roll-=t.weight)<0)||available.at(-1);
  return t.pool[Math.floor(random()*t.pool.length)];
 });
 p.packs[type]--;
 const counts=collection(p);
 const discoveries=p.discoveries??={};
 const pulls=results.map(card=>{
  const isNew=!counts[card.id];
  counts[card.id]=(counts[card.id]||0)+1;
  p.owned[card.id]=(p.owned[card.id]||0)+1;
  if(isNew)discoveries[card.id]=true;
  return {...card,isNew};
 });
 persist(p);
 return pulls;
}
function markSeen(id){
 const p=profile();
 if(!p.discoveries?.[id])return;
 delete p.discoveries[id];persist(p);
}
function score(stats,sanity){
 const rules=[
  ['Vitória',30],
  ['Dano ao TERROR inimigo',Math.min(20,stats.terrorDamage)],
  ['Dano à Sanidade inimiga',Math.min(20,stats.sanityDamage*2)],
  ['Sanidade recuperada',Math.min(10,stats.healed*2)],
  ['Feitiços resolvidos',Math.min(12,stats.spells*2)],
  ['Itens resolvidos',Math.min(12,stats.items*2)],
  ['Vitória sem Feitiços',stats.spellAttempts===0?6:0],
  ['Vitória sem Itens',stats.itemAttempts===0?6:0],
  ['Compra em série',stats.peakDraw>=3?8:0],
  ['Efeito em Corrente',stats.chain>=3?Math.min(24,12+(stats.chain-3)*3):0],
  ['Efeitos marcantes',Math.min(15,stats.important.length*5)],
  ['Dano Exato',stats.exact?15:0],
  ['Evolução natural de Gek Omelliax',stats.gek?20:0],
  ['Vitória Intacta',stats.lost===0?15:0],
  ['Por um Fio',sanity===1?15:0]
 ];
 return rules.filter(([,points])=>points>0).map(([label,points])=>({label,points}));
}
function award(id,rows,stats,mode){
 const p=profile(),existing=p.history.find(row=>row.id===id);
 if(existing)return existing;
 const result={id,rows,stats,mode,total:rows.reduce((sum,row)=>sum+row.points,0)};
 p.balance+=result.total;p.history.unshift(result);
 persist(p);return result;
}
function completeTutorial(){
 const p=profile();
 if(p.tutorial)return null;
 p.tutorial=true;p.balance+=1000;
 const result={id:'tutorial',mode:'Tutorial',total:1000,rows:[{label:'Tutorial concluído',points:1000}]};
 p.history.unshift(result);persist(p);return result;
}
function resetAccount(){
 const storage=root.localStorage;
 if(!storage)throw Error('Armazenamento indisponível.');
 storage.removeItem('horrorverse.deck.v1');
 storage.removeItem('horrorverse.builder.draft.v05');
 persist(fresh());
}
root.HV_PROGRESS={profile,buy,open,rarity,collection,ownsDeck,preserveLegacyDeck,markSeen,score,award,completeTutorial,resetAccount};
})(typeof window!=='undefined'?window:globalThis);
