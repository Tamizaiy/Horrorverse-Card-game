/* HORRORVERSE Alpha 2.3 — turn phases, continuous spells and card effects. */
(function(root){
'use strict';
const P=root.HorrorverseEngine.prototype;
const base=Object.fromEntries([
 'draw','stat','targets','fearTotal','fearBatch','resolveChoice',
 'customEffect','effectAvailable','changeSanity','activate','attackDirect','respond'
].map(name=>[name,P[name]]));
const phases=[['draw','Compra'],['automatic','Efeitos automáticos'],['main','Fase Principal'],['combat','Combate'],['end','Fim de turno']];
root.HV_PHASES=phases;
const activeSpell=(card,id)=>card?.id===id&&card.continuousActive;

P.setPhase=function(phase){
 this.phase=phase;
 this.effectChain=null;
 this.phaseTrace.push({id:++this.phaseSerial,phase,turn:this.turn});
 this.phaseTrace.splice(0,Math.max(0,this.phaseTrace.length-8));
};
P.requirePhase=function(...phases){
 if(this.cfg.turnPhases&&(!phases.includes(this.phase)||this.choices.length))this.fail('Ação indisponível nesta fase do turno.');
};
P.startCombat=function(){
 this.requirePhase('main');
 if(this.over||this.pending||this.choices.length)this.fail('Resolva os efeitos pendentes primeiro.');
 if(this.phase!=='combat')this.setPhase('combat');
};
P.runAfterEffects=function(job){
 if(this.choices.length||this.pending)(this.afterChoices??=[]).push(job);
 else if(!this.over)job();
};
P.runPhaseEffects=function(jobs,done){
 const run=()=>{
  if(this.over)return;
  if(!jobs.length)return done();
  jobs.shift()();
  this.runAfterEffects(run);
 };
 return this.runAfterEffects(run);
};
P.resolveChoice=function(selection){
 const queued=this.afterChoices.splice(0);
 try{return base.resolveChoice.call(this,selection);}
 finally{this.afterChoices.push(...queued);this.flushEffects();}
};
P.waitPhase=function(phase,job){
 this.setPhase(phase);
 if(this.cfg.pausePhases)this.phaseWaiting=true,this.phaseJob=job;
 else job();
};
P.advancePhase=function(){
 const job=this.phaseJob;
 this.phaseWaiting=false;delete this.phaseJob;
 job?.();
};
P.startTurn=function(){
 this.waitPhase('draw',()=>this.resolveDrawPhase());
};
P.resolveDrawPhase=function(){
 if(this.p().skipDraw){this.p().skipDraw--;this.info('Compra do turno negada.');}
 else this.draw(this.active,this.cfg.drawPerTurn);
 this.runAfterEffects(()=>this.waitPhase('automatic',()=>{
  const actor=this.active;
  // The active player has priority, then the other player. Within each lane, use slot order.
  const jobs=[];
  for(const owner of [actor,1-actor]){
   for(const c of this.p(owner).field.support.filter(Boolean)){
    if(activeSpell(c,'campo_drenagem')&&this.turn%2===1)jobs.push(()=>{
     if(this.find(c.uid)?.zone==='support'){this.effectChain=null;this.recordEffect?.(c,owner);this.damageGroup(this.fieldSer(),1,c,{send:true});}
    });
    if(owner===actor&&activeSpell(c,'parasita_vertiginoso'))jobs.push(()=>{this.effectChain=null;if(this.find(c.boundUid)?.zone==='ser')this.recordEffect?.(c,owner);this.advanceParasite(c);});
   }
   if(owner===actor)for(const c of this.allSer(owner))jobs.push(()=>{
    if(this.find(c.uid)?.zone==='ser'){this.effectChain=null;this.trigger(c,'onTurnStart',owner);}
   });
  }
  this.runPhaseEffects(jobs,()=>{this.setPhase('main');this.checkWin();});
 }));
};
P.endPhase=function(advance){
 this.requirePhase('main','combat');
 this.waitPhase('end',()=>this.resolveEndPhase(advance));
};
P.resolveEndPhase=function(advance){
 const actor=this.active,round=Math.ceil(this.turn/2);
 const jobs=this.allSer(actor).map(c=>()=>{if(this.find(c.uid)?.zone==='ser'){this.effectChain=null;this.trigger(c,'onTurnEnd',actor);}});
 if(this.turn%2===0){
  jobs.push(()=>{
   const field=this.players.flatMap(p=>p.field.support).find(c=>c?.id==='circulo_colapso'&&!c.fieldPending);
   if(field){
    this.effectChain=null;this.recordEffect?.(field,field.controller);
    for(const c of this.fieldSer())this.destroy(c.uid,{sourceUid:field.uid,check:false});
    this.info('Círculo do Colapso: destruição de todos os Seres ao fim da rodada.');
   }
   for(const c of this.fieldSer().filter(c=>c.revivalRound===round))this.destroy(c.uid,{bypassProtection:true,consumed:true,check:false});
   for(const c of this.fieldSer()){
    const shields=c.roundShields||[];
    c.shields=Math.max(0,c.shields-shields.filter(r=>r<=round).length);
    c.roundShields=shields.filter(r=>r>round);
   }
   this.checkWin();
  });
 }
 this.runPhaseEffects(jobs,advance);
};
P.affinityMatches=function(c,affinity){return c.affinity===affinity||!!c.extraAffinities?.includes(affinity);};
P.targets=function(e,actor=this.active){
 return base.targets.call(this,e?.targetAffinity?{...e,targetAffinity:null}:e,actor).filter(id=>{
  const c=this.find(id)?.card;
  return (!e.targetAffinity||this.affinityMatches(c,e.targetAffinity))&&(e.maxTerror===undefined||this.remainingTerror(c)<=e.maxTerror)
   &&(e.action!=='corruptRevive'||this.canCorruptRevive(c,actor));
 });
};
P.continuous=function(id,owner){
 const sides=owner===undefined?[this.active,1-this.active]:[owner];
 return sides.flatMap(i=>this.p(i).field.support.filter(c=>activeSpell(c,id)));
};
P.fearTotal=function(){return base.fearTotal.call(this)+this.continuous('queda_continua_desesperada').reduce((n,c)=>n+this.fear(c),0);};
P.fearPayment=function(ids,amount,pool=null){
 if(!Array.isArray(ids)||ids.length!==amount)this.fail('Escolha '+amount+' Contadores de Medo.');
 const allowed=new Set((pool||[...this.fieldSer(),...this.continuous('queda_continua_desesperada')]).map(c=>c.uid));
 const payment=new Map();
 for(const id of ids){
  const count=(payment.get(id)||0)+1,card=this.find(id)?.card;
  if(!allowed.has(id)||!card||this.fear(card)<count)this.fail('Contadores de Medo insuficientes no alvo.');
  payment.set(id,count);
 }
 return payment;
};
P.fearPool=function(req={},actor=this.active){
 if(req.enemyFearCost)return this.allSer(1-actor);
 const seres=[...this.allSer(1-actor),...this.allSer(actor)];
 return req.serFearOnly?seres:[...seres,...this.continuous('queda_continua_desesperada')];
};
P.autoFearPayment=function(amount,actor=this.active,req={},target){
 return this.fearPool(req,actor).flatMap(c=>Array(Math.max(0,this.fear(c)-(req.enemyFearCost&&c.uid===target?1:0))).fill(c.uid)).slice(0,amount);
};
P.fearBatch=function(gains,source,beforeApply=()=>{}){
 const redirect=this.continuous('queda_continua_desesperada')[0];
 if(!redirect){const growing=this.gekGrowing;return base.fearBatch.call(this,gains,source,()=>{this.gekGrowing=growing;beforeApply();},()=>{this.gekGrowing=null;});}
 const amount=gains.reduce((sum,gain)=>sum+Math.max(0,gain.amount),0);
 beforeApply();
 if(amount){
  this.changeFear(redirect,amount,redirect.name+' recebeu '+amount+' Medo redirecionado.');
  this.refreshFearAuras();
 }
};
P.stat=function(card,key){
 let value=base.stat.call(this,card,key);
 if(!this.fieldSer().includes(card))return value;
 if(key==='atk'){
  if(this.affinityMatches(card,'Humano')){
   const humans=this.fieldSer().filter(c=>this.affinityMatches(c,'Humano')).length;
   value+=Math.min(5,humans)*this.continuous('forca_resistencia',card.controller).length;
  }
  if(card.id==='sussurrante')value+=Math.floor(this.players.flatMap(p=>p.grave).filter(c=>c.kind==='item').length/2);
 }
 if(key==='def'){
  if(card.zeroDefTurn===this.turn)return 0;
  for(const c of this.continuous('queda_continua_desesperada',1-card.controller))value-=Math.floor(this.fear(c)/2);
 }
 return Math.max(0,value);
};
P.fieldCardsWithBinding=function(uid){return this.continuous('parasita_vertiginoso').filter(c=>c.boundUid===uid);};
P.advanceParasite=function(source){
 if(this.find(source.uid)?.zone!=='support')return;
 const target=this.find(source.boundUid);
 if(target?.zone!=='ser')return;
 this.modify(target.card,'atk',-1,source,{permanent:true,bound:true});
 this.modify(target.card,'def',-1,source,{permanent:true,bound:true});
};
P.modify=function(card,stat,amount,source,{permanent=false,duration=1,bound=false}={}){
 if(!amount||(stat==='def'&&amount<0&&this.preventDef(card,source.controller)))return;
 card.mods.push({stat,amount,expires:permanent?Number.MAX_SAFE_INTEGER:this.turn+duration-1,...(bound?{bound:source.uid}:{})});
 this.info(card.name+': '+(amount>0?'+':'')+amount+' '+stat.toUpperCase());
};
P.draw=function(owner,amount=1){
 const p=this.p(owner),old=p.hand.length;
 const count=base.draw.call(this,owner,amount);this.recordDraw?.(owner,count);
 const source=this.continuous('sistema_cambio_oculto',owner)[0];
 if(!source)return count;
 const drawn=p.hand.slice(old).filter(c=>c.kind==='magia');
 const jobs=drawn.map(card=>()=>{
  if(!activeSpell(this.find(source.uid)?.card,source.id)||!p.hand.includes(card))return;
  if(p.exchangeTurn!==this.turn){p.exchangeTurn=this.turn;p.exchanges=0;}
  if(p.exchanges>=2)return;
  this.pick(source,owner,'Devolver o Feitiço comprado e comprar outra carta?', [card],0,1,ids=>{
   if(!ids.length)return;
   this.recordEffect?.(source,owner);p.exchanges++;p.deck.push(p.hand.splice(p.hand.indexOf(card),1)[0]);this.shuffle(p.deck);
   this.draw(owner,1);
  },{optional:true,ai:()=>[]});
 });
 this.runPhaseEffects(jobs,()=>{});
 return count;
};
P.changeSanity=function(owner,amount,actor){
 const before=this.p(owner).sanity;
 const previous=this.sanityActor;this.sanityActor=actor;
 let result;try{result=base.changeSanity.call(this,owner,amount);}finally{this.sanityActor=previous;}
 if(result<before)for(const c of this.fieldSer())this.trigger(c,'onSanityLoss',c.controller);
 return result;
};
P.effectSanity=function(owner,amount,actor,source,done=()=>{}){
 const guardian=amount<0&&owner!==actor&&this.p(owner).hand.length&&this.allSer(owner)
  .find(c=>c.id==='guardia_ultimo_limiar'&&!this.used(c,'sanityGuard'));
 const apply=()=>{this.changeSanity(owner,amount,actor);done();this.checkWin();};
 if(!guardian)return apply();
 this.pick(guardian,owner,'Descarte 1 carta para negar a perda de Sanidade?',this.p(owner).hand.slice(),0,1,ids=>{
  if(!ids.length)return apply();
  this.recordEffect?.(guardian,owner);this.markUsed(guardian,'sanityGuard');this.discardCards(owner,ids);
  this.info(guardian.name+' negou a perda de Sanidade.');done();
 },{optional:true,context:{sanityLoss:-amount,source:source?.name}});
};
P.damageGroup=function(cards,amount,source,{send=false,done=()=>{}}={}){
 const jobs=cards.map(c=>()=>this.damageTerror(c,amount,source,{send}));
 this.runPhaseEffects(jobs,()=>{done();this.checkWin();});
};
P.damageTerror=function(card,amount,source,{send=false}={}){
 if(!card||this.find(card.uid)?.zone!=='ser')return;
 const before=this.remainingTerror(card);
 let damage=Math.min(amount,before);
 if(!send&&damage>=before&&this.effectDestructionImmune(card)){damage=Math.max(0,before-1);}
 else if(!send&&damage>=before&&card.shields){this.consumeShield(card);damage=Math.max(0,before-1);}
 if(this.stats&&source?.controller!==undefined&&source.controller!==card.controller)this.stats[source.controller].terrorDamage+=damage;
 card.terrorCurrent-=damage;
 card.damage=Math.max(0,this.stat(card,'terror')-this.remainingTerror(card));
 if(damage)this.info(card.name+' perdeu '+damage+' TERROR.');
 if(!this.remainingTerror(card))this.destroy(card.uid,{bypassProtection:true,sourceUid:source?.uid,consumed:send,check:false});
};
P.effectDestructionImmune=function(card){return card.id==='organismo_primordial'&&this.remainingTerror(card)>=5;};
P.restoreTerror=function(card,amount){
 if(!card||this.find(card.uid)?.zone!=='ser')return;
 card.terrorCurrent=Math.min(card.terror,card.terrorCurrent+amount);
 card.damage=Math.max(0,this.stat(card,'terror')-this.remainingTerror(card));
};
P.gravePick=function(source,actor,label,filter,done){
 const cards=this.p(actor).grave.filter(filter);
 if(cards.length)this.pick(source,actor,label,cards,1,1,done);
};
P.summonFrom=function(source,actor,id,clean=false){
 const p=this.p(actor);
  const hand=p.hand.find(c=>c.id===id),deck=p.deck.find(c=>c.id===id);
 if(!(hand||deck)||!p.field.ser.includes(null))return;
 const summon=c=>{
  if(p.deck.includes(c)){p.deck.splice(p.deck.indexOf(c),1);p.hand.push(c);this.shuffle(p.deck);}
  if(id==='gek_pulliax')c.gekTrack={clean:clean&&!c.gekReturned,own:0};
  this.summonByEffect(c.uid,actor,source.id);
  if(id==='gek_omelliax'&&clean&&!c.gekReturned&&this.find(c.uid)?.zone==='ser'&&this.stats)this.stats[actor].gek=true;
 };
 if(hand&&deck)this.pick(source,actor,'Invocar da mão ou do baralho?',[
  {uid:hand.uid,name:hand.name+' · Mão'},{uid:deck.uid,name:deck.name+' · Baralho'}
 ],1,1,ids=>summon(ids[0]===hand.uid?hand:deck));
 else summon(hand||deck);
};
P.customEffect=function(e,source,target,actor){
 const found=this.find(target)?.card,p=this.p(actor);
 switch(e.action){
 case 'exchangeSpell':case 'redirectFear':case 'roundDrain':case 'combatReturn':case 'humanAura':case 'slipAttack':return;
 case 'bindParasite':source.boundUid=target;return;
 case 'damageTerror':return this.damageTerror(found,e.amount,source);
 case 'enemyTerrorDamage':return this.damageGroup(this.allSer(1-actor),e.amount,source);
 case 'soulDrain':return this.damageGroup(this.fieldSer(),2,source,{done:()=>this.effectSanity(1-actor,-1,actor,source,()=>this.changeSanity(actor,-1))});
 case 'fearExecution':case 'markedExecution':{
  const marked=found&&this.fear(found)>0;
  if(found&&this.destroy(target,{sourceUid:source.uid})&&marked&&e.action==='fearExecution')this.effectSanity(1-actor,-1,actor,source);
  return;
 }
 case 'sanityBuff':this.changeSanity(actor,-1);return this.modify(source,'atk',2,source);
 case 'recoverSpectral':case 'recoverSpell':
  return this.gravePick(source,actor,'Escolha a carta que volta do descarte para sua mão',c=>e.action==='recoverSpell'?c.kind==='magia':c.kind==='ser'&&this.affinityMatches(c,'Espectral'),ids=>this.takeGrave(actor,ids,'hand'));
 case 'extraDirect':source.extraDirectTurn=this.turn;return;
 case 'restoreTerror':return this.restoreTerror(source,e.amount);
 case 'equipHumans':for(const c of this.allSer(actor).filter(c=>this.affinityMatches(c,'Humano')))this.modify(c,'atk',2,source,{permanent:true});return;
 case 'halveDefense':return this.modify(found,'def',-Math.floor(this.stat(found,'def')/2),source,{permanent:true});
 case 'commanderChoice':return this.discardChoice(source,actor,1,()=>{
  const spells=p.grave.filter(c=>c.kind==='magia'), humans=this.allSer(actor).filter(c=>this.affinityMatches(c,'Humano'));
  const option={uid:'human_defense',name:'Dar +2 DEF aos seus Humanos'};
  const choices=humans.length?[option,...spells]:spells;
  if(choices.length)this.pick(source,actor,'Escolha 1 Feitiço para recuperar ou dê +2 DEF aos seus Humanos',choices,1,1,ids=>{
   if(ids[0]===option.uid){for(const c of humans)this.modify(c,'def',2,source);}
   else this.takeGrave(actor,ids,'hand');
  });
 });
 case 'corruptRevive':{
  if(!this.destroy(target,{sourceUid:source.uid,check:false}))return;
  const pool=p.grave.filter(c=>c.kind==='ser'&&!c.summon?.onlyBy);
  const count=Math.min(2,p.field.ser.filter(c=>!c).length,pool.length);
  if(count)this.pick(source,actor,'Escolha os Seres para invocar do descarte',pool,count,count,ids=>{
   for(const id of ids){
    const c=p.grave.find(c=>c.uid===id),i=p.field.ser.indexOf(null);
    if(!c||i<0)continue;
    p.grave.splice(p.grave.indexOf(c),1);
    c.revivalRound=Math.ceil(this.turn/2);p.field.ser[i]=c;
    this.info(c.name+' voltou até o fim da rodada.');
    this.enterSer(c,actor,{summon:true,playEffects:true});
   }
  });
  return;
 }
 case 'plagueAmulet':return this.discardChoice(source,actor,1,()=>this.pick(source,actor,'Escolha 2 Seres para perderem 2 ATK',this.fieldSer(),2,2,ids=>{
  for(const id of ids){const c=this.find(id)?.card;if(c)this.modify(c,'atk',-2,source,{permanent:true});}
 }));
 case 'summonRastejante':return this.summonFrom(source,actor,'rastejante');
 case 'gekEvolve':{
  this.gekGrowing=source.uid;
  this.fearBatch([{card:source,amount:1}],source);
  this.gekGrowing=null;
  return this.runAfterEffects(()=>{
   if(this.find(source.uid)?.zone==='ser'&&this.fear(source)>=e.threshold){
    const clean=!source.gekReturned&&!!source.gekTrack?.clean&&source.gekTrack.own===e.threshold&&this.fear(source)===e.threshold;
    this.destroy(source.uid,{bypassProtection:true,consumed:true,check:false});
    this.summonFrom(source,actor,e.next,clean);this.checkWin();
   }
  });
 }
 case 'gekClear':{
  let removed=0;
  for(const c of this.fieldSer())if(c!==source&&this.destroy(c.uid,{sourceUid:source.uid,bypassProtection:true,consumed:true,check:false}))removed++;
  if(removed){this.draw(actor,removed);this.draw(1-actor,removed);}
  return;
 }
 case 'retaliate':return this.modify(source,'atk',1,source,{permanent:true});
 default:return base.customEffect.call(this,e,source,target,actor);
 }
};
P.canCorruptRevive=function(card,actor){
 const p=this.p(actor),grave=p.grave.filter(c=>c.kind==='ser'&&!c.summon?.onlyBy).length;
 const addsCard=!card.token&&!card.summon?.onlyBy&&card.id!=='intangivel';
 return p.field.ser.includes(null)&&!card.shields&&!this.effectDestructionImmune(card)&&grave+Number(addsCard)>=2;
};
P.effectAvailable=function(card,actor){
 const e=card.kind==='ser'?this.manualEffect(card):card.effects?.[0];
 if(!e)return false;
 if((e.discardCost||card.discardCost||0)>this.p(actor).hand.length)return false;
 if(e.fearSelf&&this.fear(card)<e.fearSelf)return false;
 if(e.fearSpend&&this.autoFearPayment(e.fearSpend+Number(!!e.enemyFearCost),actor,e).length<e.fearSpend+Number(!!e.enemyFearCost))return false;
 if(e.action==='recoverSpectral')return this.p(actor).grave.some(c=>c.kind==='ser'&&this.affinityMatches(c,'Espectral'));
 if(e.action==='sanityBuff')return this.p(actor).sanity>1;
 if(e.action==='plagueAmulet')return this.fieldSer().length>=2;
 if(e.action==='corruptRevive'){
  return this.targets(e,actor).length>0;
 }
 if(e.action==='commanderChoice')return this.allSer(actor).some(c=>this.affinityMatches(c,'Humano'))||this.p(actor).grave.some(c=>c.kind==='magia')||this.p(actor).hand.some(c=>c.kind==='magia');
 return card.kind==='ser'&&e!==card.effects?.[0]?(!this.needsTarget(e)||!!this.targets(e,actor).length):base.effectAvailable.call(this,card,actor);
};
P.spellActivated=function(card){
 if(card.kind!=='magia')return;
 const jobs=[this.active,1-this.active].flatMap(owner=>this.allSer(owner).filter(c=>c.id==='fios_prata').map(c=>()=>{
  if(this.find(c.uid)?.zone==='ser')this.trigger(c,'onSpellActivation',owner);
 }));
 this.runPhaseEffects(jobs,()=>{});
};
P.activate=function(uid,target){
 this.requirePhase('main');
 return base.activate.call(this,uid,target);
};
P.offerArchmage=function(event,resolve){
 const card=this.find(event.cardUid)?.card;
 const wizard=card?.kind==='magia'&&this.p(1-event.actor).hand.length&&this.allSer(1-event.actor)
  .find(c=>c.id==='arquimago_veu_partido'&&!this.used(c,'spellNegation'));
 if(!wizard)return resolve();
 const actor=wizard.controller;
 this.pick(wizard,actor,'Descarte 1 carta para negar o Feitiço '+card.name,this.p(actor).hand.slice(),0,1,ids=>{
  if(!ids.length)return resolve();
  if(!this.effectChain)this.effectChain={count:1,actors:[event.actor]};
  this.recordEffect?.(wizard,actor);
  this.pending=null;this.markUsed(wizard,'spellNegation');this.discardCards(actor,ids);
  this.destroy(card.uid,{bypassProtection:true,consumed:true});
  this.info(wizard.name+' negou '+card.name+'.');this.spellActivated(card);
 },{optional:true,context:{negateSpell:card.id}});
};
P.summonMaterials=function(c,actor=this.active){
 const req=c.summon||{},p=this.p(actor),allies=this.allSer(actor);
 return {
  sacrifices:req.sacrificeAffinity&&req.sacrificeMinimum===req.sacrifices?allies.filter(x=>this.affinityMatches(x,req.sacrificeAffinity)):allies,
  items:p.field.support.filter(x=>x?.kind==='item'),
  spells:p.field.support.filter(x=>x?.kind==='magia'),
  discard:p.hand.filter(x=>x!==c&&(!req.discardKind||x.kind===req.discardKind)),
  banish:p.grave.filter(x=>x.kind==='ser')
 };
};
P.validateSummonExtras=function(card,opts,actor=this.active){
 const req=card.summon||{},p=this.p(actor),pool=this.summonMaterials(card,actor);
 if(req.onlyBy)this.fail(card.name+' só pode ser invocado pelo efeito de '+root.HV_DATA.CARD_LIBRARY.find(c=>c.id===req.onlyBy).name+'.');
 if(req.sanity&&p.sanity<=req.sanity)this.fail('Sanidade insuficiente para pagar a invocação.');
 if(req.sacrificeAffinity&&(!Array.isArray(opts.sacrifices)||opts.sacrifices.filter(id=>this.allSer(actor).some(c=>c.uid===id&&this.affinityMatches(c,req.sacrificeAffinity))).length<req.sacrificeMinimum))
  this.fail('Sacrifique pelo menos '+req.sacrificeMinimum+' Ser(es) '+req.sacrificeAffinity+'.');
 for(const key of ['banish','discard']){
  if(!req[key])continue;
  const ids=opts[key]||[];
  if(!Array.isArray(ids)||ids.length!==req[key]||new Set(ids).size!==ids.length||!ids.every(id=>pool[key].some(c=>c.uid===id)))this.fail('Custo de '+(key==='banish'?'banimento':'descarte')+' inválido.');
 }
};
P.paySummonExtras=function(card,opts,actor){
 const req=card.summon||{},p=this.p(actor);
 if(req.banish){
  p.banished??=[];
  for(const id of opts.banish)p.banished.push(p.grave.splice(p.grave.findIndex(c=>c.uid===id),1)[0]);
 }
 if(req.discard)this.discardCards(actor,opts.discard);
 if(req.sanity)this.changeSanity(actor,-req.sanity);
};
P.preventCombatDeath=function(card){
 const protector=this.allSer(card.controller).find(c=>c!==card&&c.id==='soberana_esquecidos'&&!this.used(c,'combatGuard'));
 if(!protector)return false;
 this.markUsed(protector,'combatGuard');this.gainFear(protector,1);
 this.info(protector.name+' impediu a destruição de '+card.name+'.');return true;
};
P.canAttackWith=function(card,direct=false){
 return (!this.cfg.turnPhases||this.phase==='combat')&&card.sealedUntil<this.turn&&
  (!card.hasAttacked||(direct&&card.extraDirectTurn===this.turn));
};
P.attackDirect=function(uid,skipReaction=false){
 this.requirePhase('combat');
 const c=this.find(uid)?.card;
 if(!skipReaction&&this.canDirectAttack(uid)){
  const responder=1-this.active;
  const reactions=this.p(responder).field.support.filter(c=>c?.id==='escorregao'&&!c.__activated);
  if(reactions.length){
   this.pending={kind:'attack',actor:this.active,cardUid:uid,targetUid:null,responder,reactions:reactions.map(c=>c.uid)};
   return {pending:true};
  }
 }
 const extra=c?.hasAttacked&&c.extraDirectTurn===this.turn;
 const result=base.attackDirect.call(this,uid);
 if(extra){delete c.extraDirectTurn;this.damageTerror(c,2,c,{send:true});this.checkWin();}
 return result;
};
P.respond=function(uid=null,redirect=null){
 const event=this.pending;
 if(event?.kind==='attack'&&uid&&!event.reactions.includes(uid))this.fail('Reação inválida.');
 const reaction=uid?this.find(uid)?.card:null,source=event&&this.find(event.cardUid)?.card;
 if(event?.kind==='attack'&&(reaction?.id==='escorregao'||event.targetUid===null)){
  if(reaction?.id==='escorregao'||reaction?.id==='cobertura_defensiva'){
   this.pending=null;this.recordReaction?.(reaction,event.responder,event.actor);this.destroy(uid,{bypassProtection:true,consumed:true});
   const c=this.find(event.cardUid)?.card;
   if(c){
    if(c.hasAttacked)delete c.extraDirectTurn;
    c.hasAttacked=true;
    if(reaction.id==='escorregao')this.modify(c,'def',-1,reaction,{duration:2});
   }
   this.info(reaction.name+' negou o ataque.');
   this.triggerFields(event.responder,'onSupportActivation',reaction);this.spellActivated(reaction);
   this.flushEffects();return {negated:true};
  }
  this.pending=null;return this.attackDirect(event.cardUid,true);
 }
 const result=base.respond.call(this,uid,redirect);
 if(reaction){if(event?.kind!=='attack'&&source)this.spellActivated(source);this.spellActivated(reaction);}
 this.flushEffects();return result;
};
})(typeof window!=='undefined'?window:globalThis);
