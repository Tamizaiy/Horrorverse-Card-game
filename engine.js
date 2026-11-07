/* HORRORVERSE — motor independente da interface; nenhuma dependência 3D. */
(function(root){
'use strict';
const {CARD_LIBRARY,DEFAULT_CONFIG,DEFAULT_DECK,validDeck,E}=root.HV_DATA;
class HorrorverseEngine{
 constructor(config={}){this.cfg={...DEFAULT_CONFIG,...config,lanes:{...DEFAULT_CONFIG.lanes,...(config.lanes||{})}};this.serial=0;this.reset();}
 uid(){return 'c'+(++this.serial)}
 clone(c,owner){return {...c,uid:this.uid(),owner,controller:owner,damage:0,terrorCurrent:Math.max(1,c.terror||1),mods:[],counters:{},shields:0,sealedUntil:0,controlUntil:0,hasAttacked:false,token:false}}
 reset(){
  this.serial=0;
  this.fieldOrder=0;
  this.turn=1;
  this.active=0;
  this.over=null;
  this.pending=null;
  this.choices=[];
  this.afterChoices=[];
  this.fearAuras=new Map();
  this.log=[];
  const deckLists=this.deckLists||[DEFAULT_DECK,DEFAULT_DECK];
  this.players=deckLists.map((ids,owner)=>{
   const deck=this.shuffle(ids.map(id=>this.clone(CARD_LIBRARY.find(card=>card.id===id),owner)));
   const startedWithSer=deck.some(card=>card.kind==='ser');
   return {
    sanity:this.cfg.startingSanity,counters:{},
    hand:deck.splice(0,this.cfg.initialHandSize),
    deck,startedWithSer,
    field:{ser:Array(this.cfg.lanes.ser).fill(null),support:Array(this.cfg.lanes.support).fill(null)},
    grave:[],commonUsed:0,specialUsed:0
   };
  });
  this.info('Duelo iniciado. Cada jogador recebe até '+this.cfg.initialHandSize+' cartas.');
  this.draw(this.active,this.cfg.drawPerTurn);
  return this;
 }
 setDecks(deck0,deck1){
  if(!validDeck(deck0,this.cfg)||!validDeck(deck1,this.cfg))this.fail('Baralho inválido.');
  this.deckLists=[deck0.slice(),deck1.slice()];
  return this.reset();
 }
 activeField(){
  const fields=this.players.flatMap(player=>player.field.support).filter(card=>card?.subtype==='field');
  return fields.reduce((latest,card)=>!latest||card.fieldOrder>latest.fieldOrder?card:latest,null);
 }
 shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 p(i=this.active){return this.players[i]}
 info(s){this.log.unshift('T'+this.turn+' · '+s);this.log.length=Math.min(this.log.length,90)}
 fail(s){throw Error(s)}
 find(uid){for(let owner=0;owner<2;owner++){let p=this.p(owner);let i=p.hand.findIndex(c=>c.uid===uid);if(i>=0)return {card:p.hand[i],owner,zone:'hand',index:i};i=p.grave.findIndex(c=>c.uid===uid);if(i>=0)return {card:p.grave[i],owner,zone:'grave',index:i};for(const lane of ['ser','support']){let j=p.field[lane].findIndex(c=>c&&c.uid===uid);if(j>=0)return {card:p.field[lane][j],owner,zone:lane,index:j}}}return null}
 fieldCards(owner){
  return this.p(owner).field.support.filter(card=>card?.subtype==='field');
 }
 allSer(owner){return this.p(owner).field.ser.filter(Boolean)}
 fieldSer(){return [...this.allSer(0),...this.allSer(1)]}
 fieldEffects(owner,op){
  return this.fieldCards(owner).flatMap(card=>card.effects.flatMap((effect,index)=>
   effect.op===op?[{card,effect,index}]:[]));
 }
 baseStat(card,key){
  let value=card[key]||0;
  for(const mod of card.mods||[])if(mod.stat===key)value+=mod.amount;
  for(const {effect} of this.fieldEffects(card.controller,E.FIELD)){
   if(effect.stat===key&&effect.affinity===card.affinity)value+=effect.amount;
  }
  return value;
 }
 stat(card,key){
  if(key==='def'&&card.zeroDefTurn===this.turn)return 0;
  let value=this.baseStat(card,key);
  if(this.fieldSer().includes(card)){
   for(const source of this.fieldSer()){
    for(const e of source.effects||[]){
     if(e.op!==E.AURA||e.stat!==key)continue;
     if(e.allyOnly&&card.controller!==source.controller)continue;
     if(e.excludeSource&&card===source)continue;
     if(e.minFear&&!this.fearAuras.get(source.uid+'>'+card.uid))continue;
     if(e.maxAttack!==undefined&&this.baseStat(card,'atk')>e.maxAttack)continue;
     value+=e.amount;
    }
   }
  }
  return Math.max(key==='terror'?1:0,value);
 }
 remainingTerror(card){
  const base=Math.max(1,card.terror||1);
  return Math.max(0,(card.terrorCurrent??base)+this.stat(card,'terror')-base);
 }
 battleAtk(card){
  return this.stat(card,'atk')+this.fieldEffects(card.controller,E.BATTLE_ATK)
   .filter(({effect})=>effect.affinity===card.affinity)
   .reduce((bonus,{effect})=>bonus+effect.amount,0);
 }
 fear(card){return card.counters?.medo||0}
 fearTotal(){return this.fieldSer().reduce((sum,card)=>sum+this.fear(card),0)}
 used(card,index){return card.effectTurns?.[index]===this.turn}
 markUsed(card,index){(card.effectTurns??={})[index]=this.turn}
 needsTarget(e){return ['allySer','enemySer','enemySupport','allySupport','anySer','anySupport','allyGraveSer'].includes(e?.target)}
 targets(e,actor=this.active){
  if(!e||!this.needsTarget(e))return [];
  const target=e.target;
  if(target==='allyGraveSer')return this.p(actor).grave.filter(c=>c.kind==='ser').map(c=>c.uid);
  const sides=target.startsWith('ally')?[actor]:target.startsWith('enemy')?[1-actor]:[0,1];
  const lane=target.endsWith('Support')?'support':'ser';
  return sides.flatMap(owner=>this.p(owner).field[lane].filter(Boolean))
   .filter(card=>(!e.minFear||this.fear(card)>=e.minFear)&&(!e.targetAffinity||card.affinity===e.targetAffinity))
   .map(card=>card.uid);
 }
 preventDef(card,actor){
  if(card.controller===actor||this.stat(card,'def')<=0)return false;
  const protection=this.fieldEffects(card.controller,E.PREVENT_DEF)
   .find(({card:field,effect,index})=>effect.affinity===card.affinity&&!this.used(field,index));
  if(!protection)return false;
  this.markUsed(protection.card,protection.index);
  this.info(protection.card.name+' anulou a redução de DEF de '+card.name+'.');
  return true;
 }
 refreshFearAuras(){
  const previous=this.fearAuras;
  const current=new Map();
  const beings=this.fieldSer();
  for(const source of beings){
   for(const effect of source.effects||[]){
    if(effect.op!==E.AURA||!effect.minFear)continue;
    for(const target of beings){
     if(this.fear(target)<effect.minFear)continue;
     const key=source.uid+'>'+target.uid;
     current.set(key,previous.has(key)?previous.get(key):!this.preventDef(target,source.controller));
    }
   }
  }
  this.fearAuras=current;
 }
 changeFear(target,amount,description){
  target.counters??={};
  target.counters.medo=Math.max(0,this.fear(target)+amount);
  this.info(description);
 }
 gainFear(card,amount){
  if(amount<=0)return;
  this.changeFear(card,amount,card.name+' recebeu '+amount+' Contador(es) de Medo.');
  this.refreshFearAuras();
  this.trigger(card,'onFearGain',card.controller);
 }
 fearPayment(ids,amount){
  if(!Array.isArray(ids)||ids.length!==amount)this.fail('Escolha '+amount+' Contadores de Medo.');
  const payment=new Map();
  for(const id of ids){
   const found=this.find(id);
   const count=(payment.get(id)||0)+1;
   if(found?.zone!=='ser'||this.fear(found.card)<count)this.fail('Contadores de Medo insuficientes no alvo.');
   payment.set(id,count);
  }
  return payment;
 }
 spendFear(payment){
  for(const [id,count] of payment){
   const {card}=this.find(id);
   this.changeFear(card,-count,card.name+' perdeu '+count+' Contador(es) de Medo.');
  }
  this.refreshFearAuras();
 }
 autoFearPayment(amount,actor=this.active){
  return [...this.allSer(1-actor),...this.allSer(actor)].flatMap(card=>Array(this.fear(card)).fill(card.uid)).slice(0,amount);
 }
 manualEffect(card){
  return (card.effects||[]).find(e=>e.when==='manual');
 }
 activateSer(uid,targetUid=null,fearCosts=[]){
  const source=this.find(uid);
  if(this.over||this.pending||source?.zone!=='ser'||source.card.controller!==this.active)this.fail('Habilidade indisponível.');
  const {card}=source;
  const effect=this.manualEffect(card);
  const index=card.effects.indexOf(effect);
  if(!effect||this.used(card,index))this.fail('Habilidade indisponível neste turno.');
  if(!this.isValidTarget(effect,targetUid,this.active))this.fail('Alvo inválido.');
  const payment=this.fearPayment(fearCosts,effect.fearSpend||0);
  this.markUsed(card,index);
  this.spendFear(payment);
  this.runEffects([effect],uid,targetUid,this.active);
 }
 changeSanity(owner,amount){
  const player=this.p(owner);
  if(amount<0&&player.sanity>0){
   const reduction=this.fieldEffects(owner,E.PREVENT_SANITY).find(({card,effect,index})=>
    !this.used(card,index)&&this.allSer(owner).filter(ser=>ser.affinity===effect.affinity).length>=2);
   if(reduction){
    this.markUsed(reduction.card,reduction.index);
    amount=Math.min(0,amount+reduction.effect.amount);
    this.info(reduction.card.name+' protegeu a Sanidade.');
   }
  }
  player.sanity=Math.max(0,Math.min(this.cfg.startingSanity,player.sanity+amount));
  return player.sanity;
 }
 summonChoices(card,actor=this.active,opts={}){const materials=new Set(['sacrifices','items','spells'].flatMap(k=>opts[k]||[]));return (card.effects||[]).map((effect,index)=>({effect,index,ids:this.targets(effect,actor).filter(id=>!materials.has(id)&&(!effect.excludeSource||id!==card.uid))})).filter(x=>x.effect.when==='onSummon'&&this.needsTarget(x.effect))}
 summonPlan(card,actor,opts){const plan={};for(const {effect,index,ids} of this.summonChoices(card,actor,opts)){const selected=opts.summonTargets?.[index]??ids.slice(0,effect.maxTargets||1);if(!Array.isArray(selected)||new Set(selected).size!==selected.length||selected.length>(effect.maxTargets||1)||(!effect.optional&&ids.length&&selected.length!==1)||!selected.every(id=>ids.includes(id)))this.fail('Alvos da habilidade de Invocação inválidos.');plan[index]=selected}return plan}
 trigger(card,when,actor,plan={},event={}){
  for(const [index,e] of (card.effects||[]).entries()){
   if(e.when!==when||(e.once&&this.used(card,index)))continue;
   if(e.enemyFear&&!this.allSer(1-actor).some(target=>this.fear(target)>=e.enemyFear))continue;
   if(e.target==='combatTarget'&&this.find(event.target)?.zone!=='ser')continue;
   if(e.op===E.TRANSFER_FEAR){
    const beings=this.fieldSer();
    const from=beings.filter(target=>this.fear(target)>0);
    if(from.length&&beings.length>1)this.offerChoice({kind:'transfer',card,e,actor,ids:from.map(target=>target.uid)});
    continue;
   }
   if(e.cardId&&e.op===E.SUMMON){
    const ids=this.p(actor).hand.filter(target=>target.id===e.cardId).map(target=>target.uid);
    if(ids.length&&this.p(actor).field.ser.includes(null))this.offerChoice({kind:'summon',card,e,actor,ids});
    continue;
   }
   if(e.once)this.markUsed(card,index);
   if(this.needsTarget(e)){
    for(const id of plan[index]||[])if(this.isValidTarget(e,id,actor))this.runEffects([e],card.uid,id,actor);
   }else this.runEffects([e],card.uid,event.target??null,actor);
   if(this.over)break;
  }
 }
 offerChoice(choice){
  this.choices.push(choice);
  if(!this.cfg.deferChoices){
   const first=this.choices[0];
   if(first.kind==='transfer'){
    const to=this.fieldSer().find(card=>card.uid!==first.ids[0]);
    this.resolveChoice({from:first.ids[0],to:to.uid,amount:Math.min(2,this.fear(this.find(first.ids[0]).card))});
   }else this.resolveChoice({target:first.ids[0]});
  }
 }
 resolveChoice(selection=null){
  const choice=this.choices[0];
  if(!choice)return;
  if(!selection&&choice.required)selection={target:choice.ids[0]};
  if(selection){
   if(choice.kind==='transfer'){
    const from=this.find(selection.from),to=this.find(selection.to),amount=selection.amount;
    if(from?.zone!=='ser'||to?.zone!=='ser'||from.card===to.card||!choice.ids.includes(selection.from)||
      !Number.isInteger(amount)||amount<1||amount>2||this.fear(from.card)<amount)this.fail('Transferência inválida.');
   }else if(!choice.ids.includes(selection.target))this.fail('Alvo inválido.');
  }
  this.choices.shift();
  if(selection&&choice.kind==='transfer'){
   const from=this.find(selection.from).card,to=this.find(selection.to).card;
   this.changeFear(from,-selection.amount,from.name+' transferiu '+selection.amount+' Contador(es) de Medo para '+to.name+'.');
   this.gainFear(to,selection.amount);
  }else if(selection&&choice.kind==='summon'){
   this.summonByEffect(selection.target,choice.actor);
  }else if(selection&&this.find(selection.target)?.zone==='ser'){
   if(!choice.e.once||!this.used(choice.card,choice.index)){
    if(choice.e.once)this.markUsed(choice.card,choice.index);
    this.runEffects([choice.e],choice.card.uid,selection.target,choice.actor);
   }
  }
  this.checkWin();
 }
 triggerFields(owner,when,eventCard){
  for(const card of this.fieldCards(owner)){
   for(const [index,e] of card.effects.entries()){
    if(e.when!==when||(e.affinity&&e.affinity!==eventCard.affinity)||(e.once&&this.used(card,index)))continue;
    if(e.target==='enemyPlayer')this.runEffects([e],card.uid,null,owner);
    else{
     const ids=e.target==='eventSer'?[eventCard.uid]:this.targets(e,owner);
     if(ids.length)this.offerChoice({kind:'target',card,e,index,actor:owner,ids,required:!e.optional});
    }
   }
  }
 }
 enterSer(card,actor,{summon=false,plan={},playEffects=false}={}){
  this.refreshFearAuras();
  if(playEffects)this.trigger(card,'onSummon',actor,plan);
  this.trigger(card,'onEnter',actor);
  this.triggerFields(actor,'onAllyEnter',card);
  if(summon)this.triggerFields(actor,'onAllySummon',card);
 }
 summonByEffect(uid,actor){
  const player=this.p(actor),found=this.find(uid),slot=player.field.ser.indexOf(null);
  if(found?.zone!=='hand'||found.owner!==actor||found.card.kind!=='ser'||slot<0)return;
  player.hand.splice(found.index,1);
  player.field.ser[slot]=found.card;
  this.info(found.card.name+' invocado por efeito.');
  this.enterSer(found.card,actor,{summon:true,playEffects:true});
 }
 isValidTarget(e,uid,actor){return !this.needsTarget(e)||this.targets(e,actor).includes(uid)}
 draw(player,amount=1){let count=0;while(count<amount&&this.p(player).deck.length){this.p(player).hand.push(this.p(player).deck.shift());count++}this.info('Jogador '+(player+1)+' comprou '+count+' carta(s).');return count}
 placeFromHand(uid,slot,opts={}){
  if(this.over)this.fail('Partida encerrada.');if(this.pending)this.fail('Resolva a reação pendente.');let f=this.find(uid);if(!f||f.owner!==this.active||f.zone!=='hand')this.fail('Carta não está na sua mão.');let c=f.card,p=this.p(),lane=c.kind==='ser'?'ser':'support';if(!Number.isInteger(slot)||slot<0||slot>=p.field[lane].length||p.field[lane][slot])this.fail('Posição ocupada ou inválida.');
  const summonPlan=c.kind==='ser'?this.summonPlan(c,this.active,opts):{};
  if(c.kind==='ser'){
   if(c.rarity==='comum'){if(p.commonUsed>=this.cfg.commonSummonsPerTurn)this.fail('Limite de invocações comuns neste turno.');p.commonUsed++}
   else {
    const req=c.summon||{};
    if(this.fearTotal()<(req.fearRequired||0))this.fail('Faltam '+req.fearRequired+' Contadores de Medo no campo.');
    const payment=this.fearPayment(opts.fearCosts||[],req.fearSpend||0);
    const defCost=req.zeroAllyDef?this.allSer(this.active).find(card=>card.uid===opts.defCost):null;
    if(req.zeroAllyDef&&!defCost)this.fail('Escolha 1 Ser aliado para ignorar a DEF.');
    if(p.specialUsed>=this.cfg.specialSummonsPerTurn)this.fail('Limite de invocações especiais neste turno.');for(const [k,num] of Object.entries({sacrifices:req.sacrifices||0,items:req.items||0,spells:req.spells||0})){let ids=opts[k]||[];if(ids.length!==num||new Set(ids).size!==ids.length)this.fail('Requisito de '+k+': escolha '+num+' carta(s).');let allowed=k==='sacrifices'?this.allSer(this.active):this.p().field.support.filter(x=>x&&(k==='items'?x.kind==='item':x.kind==='magia'));if(!ids.every(id=>allowed.some(x=>x.uid===id)))this.fail('Material de invocação inválido.')}for(const k of ['sacrifices','items','spells'])for(const id of opts[k]||[])this.destroy(id,{bypassProtection:true,sacrifice:true});this.spendFear(payment);if(defCost)defCost.zeroDefTurn=this.turn;p.specialUsed++}
  }
  p.hand.splice(p.hand.indexOf(c),1);p.field[lane][slot]=c;this.info('Jogador '+(this.active+1)+' posicionou '+c.name+'.');
  if(c.kind==='ser'){this.enterSer(c,this.active,{summon:true,plan:summonPlan,playEffects:true});this.checkWin();return}
  if(c.subtype==='field'){c.fieldOrder=++this.fieldOrder;this.info('Campo ativo: '+c.name);this.triggerFields(this.active,'onSupportActivation',c);return}
  if(c.subtype==='reaction'){this.info(c.name+' armada para uma reação.');return}
  // Suportes permanecem preparados no campo até o jogador ativá-los.
  // Isso permite utilizá-los como material de invocação e evita consumo automático.
  this.info(c.name+' preparada(o): clique para ativar quando desejar.');

 }
 activate(uid,targetUid){
  if(this.over)this.fail('Partida encerrada.');if(this.pending)this.fail('Já existe uma reação pendente.');let f=this.find(uid);if(!f||f.zone!=='support'||f.owner!==this.active)this.fail('Use uma carta de suporte sua em campo.');let c=f.card;if(c.subtype==='field')this.fail('Efeitos de Campo são permanentes.');if(c.subtype==='reaction')this.fail('Carta de reação só pode ser usada em resposta.');if(!c.effects?.length)this.fail('Carta sem efeitos.');if(c.__activated)this.fail('Esta carta já foi utilizada.');let e=c.effects[0];if(!this.isValidTarget(e,targetUid,this.active))this.fail('Alvo inválido.');c.__activated=true;
  // Janela de resposta: jogador rival pode negar a ativação usando magia de reação preparada.
  let reactions=this.p(1-this.active).field.support.filter(x=>x&&x.subtype==='reaction'&&!x.reactionEvent&&!x.__activated);if(reactions.length){this.pending={actor:this.active,cardUid:uid,targetUid,responder:1-this.active,reactions:reactions.map(x=>x.uid)};this.info('Janela de reação aberta para Jogador '+(2-this.active)+'.');return 'pending'}
  this.resolve({actor:this.active,cardUid:uid,targetUid});return 'resolved'
 }
 respond(reactionUid=null){if(!this.pending)this.fail('Nenhuma reação pendente.');let a=this.pending;this.pending=null;if(reactionUid){if(!a.reactions.includes(reactionUid))this.fail('Reação inválida.');let r=this.find(reactionUid);r.card.__activated=true;this.info(r.card.name+' NEGOU '+(this.find(a.cardUid)?.card.name||'a carta')+'.');this.destroy(reactionUid,{bypassProtection:true,consumed:true});const source=this.find(a.cardUid)?.card;this.destroy(a.cardUid,{bypassProtection:true,consumed:true});if(source&&!this.over)this.triggerFields(a.actor,'onSupportActivation',source);if(!this.over)this.triggerFields(a.responder,'onSupportActivation',r.card);return}this.resolve(a)}
 resolve({actor,cardUid,targetUid}){let f=this.find(cardUid);if(!f)return;this.runEffects(f.card.effects,cardUid,targetUid,actor);if(!this.over)this.triggerFields(actor,'onSupportActivation',f.card);if(f.card.subtype!=='field'&&f.card.subtype!=='reaction')this.destroy(cardUid,{bypassProtection:true,consumed:true});this.checkWin()}
 runEffects(effects,sourceUid,targetUid,actor){for(const e of effects){const t=e.target==='selfSer'?sourceUid:targetUid;switch(e.op){
  case E.DRAW:this.draw(actor,e.amount||1);break;
  case E.SANITY:case E.HEAL:{
   const owner=e.target==='selfPlayer'?actor:1-actor;
   this.info('Sanidade J'+(owner+1)+': '+this.changeSanity(owner,e.amount||0));
   break;
  }
  case E.BUFF:{
   const card=this.find(t)?.card;
   if(!card)break;
   const amount=e.perFear?e.amount*Math.floor(this.fear(card)/e.perFear):e.amount;
   if(!amount||(e.stat==='def'&&amount<0&&this.preventDef(card,actor)))break;
   card.mods.push({stat:e.stat,amount,expires:this.turn+Math.max(0,(e.duration??1)-1)});
   this.info(card.name+': '+(amount>0?'+':'')+amount+' '+e.stat.toUpperCase());
   break;
  }
  case E.DESTROY:if(t)this.destroy(t,{sourceUid});break;
  case E.PROTECT:{const card=this.find(t)?.card;if(card){card.shields+=(e.amount||1);this.info(card.name+' recebeu proteção.')}break}
  case E.COUNTER:{
   if(e.target==='enemyPlayer'){
    const owner=1-actor;
    this.changeFear(this.p(owner),e.amount||1,'Jogador '+(owner+1)+' recebeu um Contador de Medo.');
   }else if(e.target==='allEnemySer'){
    for(const card of this.allSer(1-actor))this.gainFear(card,e.amount||1);
   }else{
    const found=this.find(t);
    if(found?.zone==='ser')this.gainFear(found.card,e.amount||1);
   }
   break;
  }
  case E.TOKEN:{let lane=this.p(actor).field.ser;let i=lane.findIndex(x=>!x);if(i>=0){let card=this.clone({id:'token',name:e.name||'Token',kind:'ser',rarity:'token',atk:e.atk||1,def:e.def||1,terror:1,emoji:'🌑',effects:[]},actor);card.token=true;lane[i]=card;this.info('Token invocado: '+card.name);this.enterSer(card,actor,{summon:true})}break}
  case E.SEAL:{let f=this.find(t);if(f){f.card.sealedUntil=this.turn+Math.max(0,(e.duration??1)-1);this.info(f.card.name+' foi selado.')}break}
  case E.CONTROL:{let f=this.find(t);if(f){let to=actor;let dest=this.p(to).field.ser.findIndex(x=>!x);if(dest<0)break;this.p(f.owner).field.ser[f.index]=null;f.card.controller=to;f.card.controlUntil=this.turn+Math.max(0,(e.duration??1)-1);this.p(to).field.ser[dest]=f.card;this.info('Controle de '+f.card.name+' alterado.');this.enterSer(f.card,to)}break}
  case E.REVIVE:{let dead=this.p(actor).grave.find(x=>x.uid===t&&x.kind==='ser');let s=this.p(actor).field.ser.findIndex(x=>!x);if(dead&&s>=0){this.p(actor).grave=this.p(actor).grave.filter(x=>x.uid!==t);dead.damage=0;dead.terrorCurrent=Math.max(1,dead.terror||1);dead.mods=[];dead.counters={};dead.shields=0;dead.sealedUntil=0;dead.hasAttacked=false;dead.controlUntil=0;dead.controller=actor;this.p(actor).field.ser[s]=dead;this.info(dead.name+' ressuscitou.');this.enterSer(dead,actor,{summon:true})}break}
  case E.SUMMON:this.summonByEffect(t,actor);break;
  case E.FIELD:case E.NEGATE:case E.BATTLE_ATK:case E.PREVENT_DEF:case E.PREVENT_SANITY:break;
  default:this.info('Efeito não reconhecido: '+e.op)}this.checkWin();if(this.over)break}}
 destructionImmune(card,source,attackValue){
  const immunity=card.effects?.find(e=>e.op===E.IMMUNE_LOW_ATK);
  return !!(immunity&&source?.kind==='ser'&&(attackValue??this.stat(source,'atk'))<=immunity.amount);
 }
 destroy(uid,{bypassProtection=false,sacrifice=false,consumed=false,sourceUid=null,combat=false,check=true}={}){
  const found=this.find(uid);
  if(!found||!['ser','support'].includes(found.zone))return false;
  const {card,owner,zone,index}=found;
  if(!bypassProtection&&this.destructionImmune(card,this.find(sourceUid)?.card)){
   this.info(card.name+' resistiu ao efeito destrutivo.');
   return false;
  }
  if(card.shields&&!bypassProtection){
   this.consumeShield(card);
   this.info(card.name+' resistiu à destruição (escudo consumido).');
   return false;
  }
  const controller=card.controller;
  this.p(owner).field[zone][index]=null;
  if(!card.token){
   Object.assign(card,{damage:0,mods:[],shields:0,counters:{},sealedUntil:0,hasAttacked:false,controlUntil:0,controller:card.owner,__activated:false,zeroDefTurn:0,roundShields:[]});
   this.p(card.owner).grave.push(card);
  }
  this.refreshFearAuras();
  this.info(card.name+(sacrifice?' sacrificado(a).':consumed?' consumido(a).':' destruído(a).'));
  if(!sacrifice&&!consumed)this.trigger(card,'onDestroyed',controller);
  if(combat)this.trigger(card,'onCombatDestroyed',controller);
  if(card.subtype==='field'){
   for(const ser of this.fieldSer()){
    if(this.remainingTerror(ser)===0)this.destroy(ser.uid,{bypassProtection:true,check:false});
   }
  }
  if(check)this.checkWin();
  return true;
 }
 // Um turno por jogador forma a primeira rodada. Ataques à Sanidade só a partir de T3.
 canDirectAttack(attackerUid){
  if(this.over||this.pending||this.turn<=2||this.allSer(1-this.active).length)return false;
  const a=this.find(attackerUid);
  return !!(a&&a.zone==='ser'&&a.card.controller===this.active&&!a.card.hasAttacked&&a.card.sealedUntil<this.turn);
 }
 directDamage(atk){return Math.max(1,Math.min(4,Math.ceil(Math.max(0,atk)/3)))}
 attackDirect(attackerUid){
  if(this.over||this.pending)this.fail('Ação indisponível.');
  if(this.turn<=2)this.fail('Ataques diretos à Sanidade são proibidos durante a primeira rodada (turnos 1 e 2).');
  if(this.allSer(1-this.active).length)this.fail('O adversário ainda possui Seres protegendo a Sanidade.');
  const a=this.find(attackerUid);
  if(!a||a.zone!=='ser'||a.card.controller!==this.active)this.fail('Atacante inválido.');
  if(a.card.hasAttacked)this.fail('Este Ser já atacou no turno.');
  if(a.card.sealedUntil>=this.turn)this.fail('Este Ser está selado.');
  const card=a.card,owner=1-this.active,atk=this.battleAtk(card),before=this.p(owner).sanity;
  const after=this.changeSanity(owner,-this.directDamage(atk));
  const damage=before-after;
  card.hasAttacked=true;
  this.info(card.name+' atacou diretamente a Sanidade do Jogador '+(owner+1)+' ('+before+' → '+after+'; dano '+damage+').');
  if(damage>0)this.trigger(card,'onCombatDamage',this.active);
  if(!this.over)this.trigger(card,'onZeroDefenseAttack',this.active);
  this.checkWin();
  return {direct:true,attacker:{uid:card.uid,id:card.id,name:card.name,emoji:card.emoji,art:card.art,atk},
    defender:{name:'Sanidade do Jogador '+(owner+1),emoji:'🧠'},atk,def:0,damage,before,after,
    maxTerror:this.cfg.startingSanity,blocked:false,shielded:false,destroyed:after===0};
 }
 attack(attackerUid,targetUid){
  if(this.over||this.pending)this.fail('Ação indisponível.');
  const a=this.find(attackerUid),d=this.find(targetUid);
  if(!a||a.zone!=='ser'||a.card.controller!==this.active)this.fail('Atacante inválido.');
  if(!d||d.zone!=='ser'||d.card.controller===this.active)this.fail('Escolha um Ser inimigo.');
  if(a.card.hasAttacked)this.fail('Este ser já atacou no turno.');
  if(a.card.sealedUntil>=this.turn)this.fail('Este ser está selado.');
  const attacker=a.card,defender=d.card;
  const atk=this.battleAtk(attacker),def=this.stat(defender,'def');
  const total=this.stat(defender,'terror');
  const before=this.remainingTerror(defender);
  const rawDamage=Math.max(0,atk-def);
  let damage=Math.min(rawDamage,before),shielded=false,destroyed=false;
  attacker.hasAttacked=true;
  if(damage>0&&damage>=before&&this.destructionImmune(defender,attacker,atk)){
    damage=Math.max(0,before-1);
    this.info(defender.name+' resistiu ao golpe fatal.');
  }else if(damage>0&&damage>=before&&defender.shields>0){
    this.consumeShield(defender);shielded=true;
    damage=Math.max(0,before-1);
    this.info(defender.name+' sobreviveu ao golpe fatal graças a um Escudo.');
  }
  const after=Math.max(0,before-damage);
  defender.terrorCurrent=after-total+Math.max(1,defender.terror||1);
  defender.damage=total-after; // compatibilidade de exibição com sistemas antigos
  if(!rawDamage)this.info(defender.name+' BLOQUEOU o ataque de '+attacker.name+'.');
  else this.info(attacker.name+' causou '+damage+' de dano ao TERROR de '+defender.name+' ('+before+' → '+after+').');
  if(after===0){destroyed=this.destroy(defender.uid,{bypassProtection:true,combat:true,check:false})}
  if(damage>0)this.trigger(attacker,'onCombatDamage',this.active,{}, {target:targetUid});
  if(def===0)this.trigger(attacker,'onZeroDefenseAttack',this.active);
  if(destroyed){
   this.trigger(attacker,'onCombatDestroy',this.active);
   this.triggerFields(this.active,'onAllyCombatDestroy',attacker);
  }
  this.checkWin();
  return {attacker:{uid:attacker.uid,id:attacker.id,name:attacker.name,emoji:attacker.emoji,art:attacker.art,atk},
    defender:{uid:defender.uid,id:defender.id,name:defender.name,emoji:defender.emoji,art:defender.art,def},
    atk,def,damage,before,after,maxTerror:total,blocked:rawDamage===0,shielded,destroyed};
 }

 endTurn(){if(this.over||this.pending)this.fail('Não é possível encerrar o turno agora.');for(const card of this.allSer(this.active)){this.trigger(card,'onTurnEnd',this.active);if(this.over)return;}this.active=1-this.active;this.turn++;let p=this.p();p.commonUsed=0;p.specialUsed=0;for(let owner=0;owner<2;owner++){for(const c of this.allSer(owner)){c.mods=c.mods.filter(m=>m.expires>=this.turn);if(c.sealedUntil<this.turn)c.sealedUntil=0;if(c.controller===this.active)c.hasAttacked=false;}for(const s of this.p(owner).field.support)if(s&&s.mods)s.mods=s.mods.filter(m=>m.expires>=this.turn)}this.draw(this.active,this.cfg.drawPerTurn);this.info('Turno de Jogador '+(this.active+1)+'.');if(this.turn>=this.cfg.maxTurns)this.info('Aviso: atingido limite sugerido de turnos, sem resultado automático.');this.checkWin()}
 checkWin(){if(this.over)return this.over;for(let i=0;i<2;i++)if(this.p(i).sanity<=0){this.over={winner:1-i,reason:'loucura'};this.info('Vitória J'+(2-i)+' por LOUCURA!');return this.over}if(this.cfg.winByExtermination&&!this.choices.length){for(let i=0;i<2;i++){let player=this.p(i);if(!player.startedWithSer)continue;const hasSer=[...player.hand,...player.deck,...this.allSer(0),...this.allSer(1)].some(card=>card.kind==='ser'&&!card.token&&card.owner===i);if(!hasSer){this.over={winner:1-i,reason:'extermínio'};this.info('Vitória J'+(2-i)+' por EXTERMÍNIO!');return this.over}}}return null}
 getState(){return {turn:this.turn,active:this.active,players:this.players,pending:this.pending,over:this.over,log:this.log,config:this.cfg}}
}
root.HorrorverseEngine=HorrorverseEngine;
})(typeof window!=='undefined'?window:globalThis);
