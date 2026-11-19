/* Account progress adapter. Guest storage remains owned by progression.js. */
(function(root){
'use strict';
const P=root.HV_PROGRESS,local={...P};
let connection=null,state=null,accountEpoch=0,pending=new Map(),tail=Promise.resolve();
const uuid=()=>crypto.randomUUID();
const storageKey=()=>connection?'horrorverse.cloud.pending.'+connection.userId:null;
function savePending(){
 try{localStorage.setItem(storageKey(),JSON.stringify([...pending]));}
 catch{throw Error('O navegador não conseguiu registrar a operação. Libere o armazenamento e tente novamente.');}
}
function assertAccount(epoch){
 if(!connection||accountEpoch!==epoch)throw Error('A conta mudou. Entre novamente para conferir o progresso.');
}
async function rpc(name,args,epoch){
 assertAccount(epoch);
 const {data,error}=await connection.db.rpc(name,args);
 assertAccount(epoch);
 if(error){const failure=Error(error.code==='PGRST202'?'Execute o arquivo FINALIZAR_237.sql no Supabase antes de usar esta build.':error.message||'Não foi possível salvar seu progresso.');failure.code=error.code;throw failure;}
 return data;
}
async function refresh(epoch=accountEpoch){
 const data=await rpc('hv_get_state',{},epoch);
 if(!data||!Array.isArray(data.collection)||!Array.isArray(data.card_ids))throw Error('O progresso da conta está incompleto. Confira a instalação do SQL.');
 state={cloud:true,balance:Number(data.rubedio),tutorial:data.tutorial_reward_claimed,
  owned:Object.fromEntries(data.collection.map(c=>[c.card_id,c.quantity])),
  discoveries:Object.fromEntries(data.collection.filter(c=>c.is_new).map(c=>[c.card_id,true])),
  packs:Object.fromEntries(data.inventory.map(c=>[c.pack_id,c.quantity])),
  history:data.history,deck:data.card_ids};
 root.dispatchEvent(new Event('hv-progress-updated'));
 return state;
}
function operation(key,name,args){
 const epoch=accountEpoch;
 const run=async()=>{
  assertAccount(epoch);
  // An unresolved operation must keep its identifier through reconnects.
  let request=pending.get(key);
  if(!request){request={name,args:{...args,p_request_id:uuid()}};pending.set(key,request);savePending();}
  savePending();
  let data;
  try{data=await rpc(request.name,request.args,epoch);}
  catch(error){
   if(connection&&epoch===accountEpoch&&error.code&&error.code!=='FETCH_ERROR'&&!String(error.code).startsWith('5')){
    pending.delete(key);savePending();
   }
   throw error;
  }
  await refresh(epoch);
  pending.delete(key);savePending();
  return data;
 };
 const result=tail.then(run);
 tail=result.catch(()=>{});
 return result;
}
P.profile=()=>connection?(state||{cloud:true,balance:0,owned:{},packs:{},history:[],tutorial:false}):local.profile();
P.collection=function(p=P.profile()){
 return p.cloud?{...p.owned}:local.collection(p);
};
P.ownsDeck=function(ids,p=P.profile()){
 if(!root.HV_DATA.validDeck(ids,{draft:true}))return false;
 const counts=P.collection(p);
 return ids.every(id=>counts[id]-- >0);
};
P.preserveLegacyDeck=ids=>{if(!connection)return local.preserveLegacyDeck(ids);};
P.buy=async(type,quantity)=>{
 if(!connection)return local.buy(type,quantity);
 await operation('buy:'+type+':'+quantity,'hv_buy_packs',{p_pack_id:type,p_quantity:quantity});
 return P.profile();
};
P.open=async(type)=>{
 if(!connection)return local.open(type);
 const result=await operation('open:'+type,'hv_open_pack',{p_pack_id:type});
 return result.cards.map(pull=>{
  const card=root.HV_DATA.CARD_LIBRARY.find(c=>c.id===pull.card_id);
  if(!card)throw Error('Atualize o jogo para visualizar as cartas recebidas.');
  return {...card,isNew:pull.is_new};
 });
};
P.markSeen=async id=>{
 if(!connection)return local.markSeen(id);
 const epoch=accountEpoch;
 await rpc('hv_mark_card_seen',{p_card_id:id},epoch);
 if(state)delete state.discoveries[id];
};
P.completeTutorial=async()=>{
 if(!connection)return local.completeTutorial();
 const already=state.tutorial;
 await rpc('hv_claim_tutorial_reward',{},accountEpoch);
 await refresh();
 return already?null:{id:'tutorial',mode:'Tutorial',total:1000,rows:[{label:'Tutorial concluído',points:1000}]};
};
P.award=async(id,rows,stats,mode,sanity)=>{
 if(!connection)return local.award(id,rows,stats,mode);
 return operation('reward:'+id,'hv_award_duel',{p_duel_id:id,p_stats:stats,p_mode:mode,p_sanity:sanity});
};
P.resetAccount=async()=>{
 if(!connection)return local.resetAccount();
 await operation('reset','hv_reset_account',{});
 try{localStorage.removeItem(root.HV_CLOUD.draftKey());}catch{}
};
async function saveDeck(ids){
 if(!P.ownsDeck(ids)||!root.HV_DATA.validDeck(ids))throw Error('Confira as cartas do baralho.');
 if(!connection){
  localStorage.setItem('horrorverse.deck.v1',JSON.stringify(ids));return;
 }
 await rpc('hv_save_deck',{p_card_ids:ids},accountEpoch);
 state.deck=ids.slice();
}
async function connect(db,userId){
 const epoch=++accountEpoch;
 connection={db,userId};state=null;tail=Promise.resolve();pending=new Map();
 try{
  const raw=localStorage.getItem(storageKey());
  if(raw){try{pending=new Map(JSON.parse(raw));}catch{pending=new Map();}}
  await rpc('hv_initialize_account',{},epoch);
  await refresh(epoch);
  // Resolve uncertain requests before allowing new mutations.
  for(const [key,request] of [...pending]){
   try{await rpc(request.name,request.args,epoch);}catch(error){
    if(!error.code||String(error.code).startsWith('5'))throw error;
   }
  }
  await refresh(epoch);pending.clear();savePending();
 }catch(error){throw Error('Não foi possível carregar a conta. '+error.message);}
 return state.deck.slice();
}
function disconnect(){
 ++accountEpoch;connection=null;state=null;pending=new Map();tail=Promise.resolve();
 let ids;try{ids=JSON.parse(localStorage.getItem('horrorverse.deck.v1'));}catch{}
 return P.ownsDeck(ids)&&root.HV_DATA.validDeck(ids)?ids:root.HV_DATA.DEFAULT_DECK.slice();
}
root.HV_CLOUD={connect,disconnect,saveDeck,refresh,active:()=>!!connection,
 draftKey:()=>connection?'horrorverse.builder.draft.account.'+connection.userId:'horrorverse.builder.draft.v05'};
})(window);
