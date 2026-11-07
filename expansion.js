/* Alpha 2.0: explicit choices, discard costs, Human tactics and attack reactions. */
(function(root){'use strict';
const P=root.HorrorverseEngine.prototype, D=root.HV_DATA;
const original={};for(const name of ['runEffects','resolveChoice','offerChoice','activate','activateSer','placeFromHand','trigger','attack','respond','endTurn','stat','gainFear'])original[name]=P[name];
P.consumeShield=function(card){card.shields=Math.max(0,card.shields-1);if(card.roundShields?.length)card.roundShields.shift();};
P.pick=function(card,actor,label,cards,min,max,done,{repeat=false,ordered=false,optional=false,ai=null,context=null}={}){
 const options=cards.map(c=>({value:c.uid,label:c.name,card:c}));
 this.choices.push({kind:'pick',card,actor,label,ids:options.map(o=>o.value),options,min,max,repeat,ordered,optional,done,ai,context});
 this.drainChoices();
};
P.drainChoices=function(){
 if(this.cfg.deferChoices||this.drainingChoices)return;
 this.drainingChoices=true;
 try{while(this.choices.length){const c=this.choices[0];this.resolveChoice(this.autoChoice(c));}}finally{this.drainingChoices=false;}
};
P.autoChoice=function(c){
 if(c.kind==='pick')return {values:c.ai?c.ai():c.repeat?Array.from({length:c.max},(_,i)=>c.ids[i%c.ids.length]):c.ids.slice(0,c.max)};
 if(c.kind==='transfer'){const from=c.ids.map(id=>this.find(id)?.card).find(x=>x?.controller===c.actor);const to=this.allSer(1-c.actor)[0];return from&&to?{from:from.uid,to:to.uid,amount:Math.min(2,this.fear(from))}:null;}
 return {target:c.ids[0]};
};
P.resolveChoice=function(selection){
 const c=this.choices[0];
 if(c?.kind==='transfer'&&selection){
  const from=this.find(selection.from),to=this.find(selection.to),n=selection.amount;
  if(from?.zone!=='ser'||to?.zone!=='ser'||from.card===to.card||!c.ids.includes(selection.from)||!Number.isInteger(n)||n<1||n>2||this.fear(from.card)<n)this.fail('Transferência inválida.');
  this.choices.shift();const rest=this.choices.splice(0);this.fearBatch([{card:to.card,amount:n}],c.card,()=>{this.changeFear(from.card,-n,from.card.name+' transferiu '+n+' Contador(es) de Medo.');this.refreshFearAuras();});this.choices.push(...rest);this.flushEffects();this.checkWin();return;
 }
 if(c?.kind!=='pick'){const result=original.resolveChoice.call(this,selection);this.flushEffects();return result;}
 const values=selection?.values??(c.optional?[]:c.ids.slice(0,c.min));
 if(values.length<c.min||values.length>c.max||(!c.repeat&&new Set(values).size!==values.length)||!values.every(id=>c.ids.includes(id)))this.fail('Seleção inválida. Confira a quantidade e não repita cartas.');
 this.choices.shift();const rest=this.choices.splice(0);c.done(values);this.choices.push(...rest);this.flushEffects();this.checkWin();this.drainChoices();
};
P.flushEffects=function(){if(!this.choices.length){const jobs=this.afterChoices||[];this.afterChoices=[];for(const done of jobs)done();}};
P.resolve=function({actor,cardUid,targetUid}){const found=this.find(cardUid);if(!found)return;const card=found.card;this.runEffects(card.effects,cardUid,targetUid,actor);const done=()=>{if(!this.over)this.triggerFields(actor,'onSupportActivation',card);if(card.subtype!=='field'&&card.subtype!=='reaction')this.destroy(cardUid,{bypassProtection:true,consumed:true});this.checkWin();};if(this.choices.length)(this.afterChoices??=[]).push(done);else done();};
P.discardCards=function(actor,ids){
 const p=this.p(actor);if(new Set(ids).size!==ids.length||!ids.every(id=>p.hand.some(c=>c.uid===id)))this.fail('Descarte inválido.');
 for(const id of ids){const i=p.hand.findIndex(c=>c.uid===id),c=p.hand.splice(i,1)[0];p.grave.push(c);this.info(c.name+' descartado(a) da mão.');}
};
P.discardChoice=function(card,actor,count,done){
 if(!count)return done();
 const pool=this.p(actor).hand;
 if(pool.length<count)this.fail('Você precisa de '+count+' cartas na mão para descartar.');
 this.pick(card,actor,'Escolha '+count+' carta(s) para descartar',pool,count,count,ids=>{this.discardCards(actor,ids);done();},{ai:()=>this.p(actor).hand.slice().sort((a,b)=>this.cardValue(a,actor)-this.cardValue(b,actor)).slice(0,count).map(c=>c.uid)});
};
P.cardValue=function(c,actor){return c.kind==='ser'?(c.atk||0)+(c.def||0)*.6+(c.terror||0)*.4+(c.rarity==='comum'?2:0):c.subtype==='field'?4:3;};
P.takeGrave=function(actor,ids,destination,shuffle=false){
 const p=this.p(actor);for(const id of ids){const i=p.grave.findIndex(c=>c.uid===id);if(i<0)continue;const c=p.grave.splice(i,1)[0];delete c.effectTurns;delete c.__activated;c.controller=actor;p[destination].push(c);this.info(c.name+' voltou '+(destination==='hand'?'à mão.':'ao baralho.'));}if(shuffle)this.shuffle(p.deck);
};
P.effectAvailable=function(card,actor){
 const e=card.effects?.[0];if(!e)return false;
 if(this.p(actor).hand.length<(card.discardCost||e.discardCost||0))return false;
 const a=e.action;
 if(a==='mutual')return this.allSer(actor).length>0&&this.allSer(1-actor).length>0;
 if(a==='recoverHuman')return this.p(actor).grave.some(c=>c.kind==='ser'&&c.affinity==='Humano'&&c.atk<=3);
 if(a==='engineer')return this.allSer(actor).length>0;
 if(a==='professor')return this.p(actor).grave.some(c=>c.kind==='magia')||this.p(actor).hand.some(c=>c.kind==='magia');
 if(a==='investigate')return this.p(actor).deck.length>0;
 if(a==='drainFear'||a==='refugeFear'){const from=a==='drainFear'?actor:1-actor;return this.allSer(from).some(c=>this.fear(c))&&this.allSer(1-from).length>0;}
 return !this.needsTarget(e)||this.targets(e,actor).length>0;
};
P.activate=function(uid,target){const c=this.find(uid)?.card;if(c&&!this.effectAvailable(c,this.active))this.fail('Não há cartas ou alvos suficientes para esse efeito.');return original.activate.call(this,uid,target);};
P.activateSer=function(uid,target,costs){const c=this.find(uid)?.card;if(c&&!this.effectAvailable(c,this.active))this.fail('Não há cartas ou alvos suficientes para essa habilidade.');return original.activateSer.call(this,uid,target,costs);};
P.placeFromHand=function(uid,slot,opts={}){
 const c=this.find(uid)?.card,count=c?.summon?.discard||0;
 if(count){const ids=opts.discard||[];if(ids.length!==count||new Set(ids).size!==count||ids.includes(uid)||!ids.every(id=>this.p().hand.some(c=>c.uid===id)))this.fail('Escolha '+count+' outras cartas da mão para descartar.');}
 // Base validates the entire summon first. Draw triggers are resolved after the discard payment.
 const queued=this.choices.length,previousDefer=this.cfg.deferChoices;this.cfg.deferChoices=true;
 try{original.placeFromHand.call(this,uid,slot,opts);if(count)this.discardCards(this.active,opts.discard);}finally{this.cfg.deferChoices=previousDefer;}
 this.drainChoices();
};
P.trigger=function(card,when,actor,plan={},event={}){
 const expanded={...plan};
 for(const [i,e] of (card.effects||[]).entries())if(e.when===when&&this.needsTarget(e)&&!Object.hasOwn(plan,i)){
  const ids=this.targets(e,actor);if(ids.length)this.offerChoice({kind:'target',card,e,index:i,actor,ids,required:!e.optional});expanded[i]=[];
 }
 return original.trigger.call(this,card,when,actor,expanded,event);
};
P.runEffects=function(effects,sourceUid,targetUid,actor){
 for(const e of effects){
  if(e.op==='CUSTOM')this.customEffect(e,this.find(sourceUid)?.card||{uid:sourceUid,name:'Efeito'},targetUid,actor);
  else if(e.op==='COUNTER'&&e.target!=='enemyPlayer'){
   const cards=e.target==='allEnemySer'?this.allSer(1-actor):[this.find(e.target==='selfSer'?sourceUid:targetUid)?.card].filter(c=>c&&this.find(c.uid)?.zone==='ser');
   this.fearBatch(cards.map(card=>({card,amount:e.amount||1})),this.find(sourceUid)?.card);
  }else original.runEffects.call(this,[e],sourceUid,targetUid,actor);
  this.checkWin();if(this.over)break;
 }
};
P.fearBatch=function(gains,source,beforeApply=()=>{}){
 const apply=()=>{beforeApply();for(const {card,amount} of gains)if(this.find(card.uid)?.zone==='ser')original.gainFear.call(this,card,amount);};
 const owners=[...new Set(gains.filter(x=>x.amount>0).map(x=>x.card.controller))];
 const respond=i=>{if(i>=owners.length)return apply();const actor=owners[i];const reactions=this.p(actor).field.support.filter(c=>c?.reactionEvent==='fear'&&!c.__activated);
  if(!reactions.length)return respond(i+1);
  this.pick(source||{name:'Contadores de Medo'},actor,'Negar a colocação de Medo com Véu da Lucidez?',reactions,0,1,ids=>{
   if(ids.length){this.destroy(ids[0],{bypassProtection:true,consumed:true});this.info('Véu da Lucidez negou o efeito de colocação de Medo.');}
   else respond(i+1);
  },{optional:true,ai:()=>[reactions[0].uid],context:{gains:gains.map(x=>({uid:x.card.uid,amount:x.amount}))}});
 };respond(0);
};
P.gainFear=function(card,amount){this.fearBatch([{card,amount}]);};
P.customEffect=function(e,source,target,actor){
 const p=this.p(actor),action=e.action;
 const execute=()=>{
 switch(action){
 case 'drawOne':this.draw(actor,1);break;
 case 'drawTwo':this.draw(actor,2);break;
 case 'drawThree':this.draw(actor,3);break;
 case 'reporter':this.draw(actor,1);if(p.hand.length)this.discardChoice(source,actor,1,()=>{});break;
 case 'healSanity':this.changeSanity(actor,2);break;
 case 'hunter':original.runEffects.call(this,[{op:'BUFF',stat:'atk',amount:2,target:'selfSer'}],source.uid,null,actor);break;
 case 'engineer':this.pick(source,actor,'Ser aliado que recebe 1 Escudo',this.allSer(actor),1,1,ids=>{const c=this.find(ids[0])?.card;if(c)c.shields++;});break;
 case 'healTerror':{const c=this.find(target)?.card;if(c)c.terrorCurrent=Math.min(c.terror,c.terrorCurrent+1);break;}
 case 'resetStats':{const c=this.find(target)?.card;if(c){c.mods=c.mods.filter(m=>!['atk','def'].includes(m.stat));c.zeroDefTurn=0;this.info('Alterações aplicadas de ATK/DEF removidas de '+c.name+'. Bônus contínuos de Campo permanecem ativos.');}break;}
 case 'roundShield':for(const c of this.fieldSer()){c.shields++;(c.roundShields??=[]).push(Math.ceil(this.turn/2));}break;
 case 'fearDamage':case 'fearHeal':{const amount=Math.floor(this.fearTotal()/2);for(const c of this.fieldSer())c.counters.medo=0;this.refreshFearAuras();this.changeSanity(action==='fearHeal'?actor:1-actor,action==='fearHeal'?amount:-amount);break;}
 case 'mutual':this.pick(source,actor,'Escolha seu Ser para enviar ao descarte',this.allSer(actor),1,1,allies=>{
  this.pick(source,actor,'Escolha o Ser inimigo para enviar ao descarte',this.allSer(1-actor),1,1,enemies=>{for(const id of [...allies,...enemies])this.destroy(id,{bypassProtection:true,consumed:true,check:false});this.checkWin();});
 });break;
 case 'recoverHuman':{const cards=p.grave.filter(c=>c.kind==='ser'&&c.affinity==='Humano'&&c.atk<=3);if(cards.length)this.pick(source,actor,'Humano que retorna à mão',cards,1,1,ids=>this.takeGrave(actor,ids,'hand'));break;}
 case 'recoverTwo':this.pick(source,actor,'Recupere até 2 cartas do descarte',p.grave.slice(),0,Math.min(2,p.grave.length),ids=>this.takeGrave(actor,ids,'hand'),{optional:true});break;
 case 'recycle':{const cards=p.grave.filter(c=>c.kind!=='ser');this.pick(source,actor,'Embaralhe até 2 Itens / Feitiços no baralho',cards,0,Math.min(2,cards.length),ids=>this.takeGrave(actor,ids,'deck',true),{optional:true});break;}
 case 'rebuild':this.pick(source,actor,'Embaralhe até 5 cartas do descarte no baralho',p.grave.slice(),0,Math.min(5,p.grave.length),ids=>{this.takeGrave(actor,ids,'deck',true);this.draw(actor,2);if(p.hand.length)this.discardChoice(source,actor,1,()=>{});},{optional:true});break;
 case 'professor':{const cards=p.grave.filter(c=>c.kind==='magia');if(cards.length)this.pick(source,actor,'Feitiço que volta ao fundo do baralho',cards,1,1,ids=>this.takeGrave(actor,ids,'deck'));break;}
 case 'investigate':{const top=p.deck.slice(0,3);if(!top.length)break;this.pick(source,actor,'Escolha 1 das 3 cartas do topo para sua mão',top,1,1,ids=>{
  const chosen=top.find(c=>c.uid===ids[0]);p.deck.splice(0,top.length);p.hand.push(chosen);const rest=top.filter(c=>c!==chosen);
  if(rest.length)this.pick(source,actor,'Ordem das cartas no fundo (primeira fica acima)',rest,rest.length,rest.length,order=>p.deck.push(...order.map(id=>rest.find(c=>c.uid===id))),{ordered:true});
 });break;}
 case 'reveal':{const cards=this.p(1-actor).hand.slice();this.pick(source,actor,cards.length?'Mão revelada do oponente — confira as cartas':'O oponente está sem cartas na mão',cards,0,0,()=>{}, {optional:true});break;}
 case 'leader':this.pick(source,actor,'Descarte até 2 cartas para fortalecer Humanos',p.hand.slice(),0,Math.min(2,p.hand.length),ids=>{
  this.discardCards(actor,ids);const humans=this.allSer(actor).filter(c=>c.affinity==='Humano');if(ids.length&&humans.length)this.pick(source,actor,'Um Humano por carta descartada (pode repetir)',humans,ids.length,ids.length,targets=>{for(const id of targets)original.runEffects.call(this,[{op:'BUFF',stat:'atk',amount:1},{op:'BUFF',stat:'def',amount:1}],source.uid,id,actor);},{repeat:true});
 },{optional:true});break;
 case 'balance':{const cards=this.fieldSer(),total=this.fearTotal();if(!cards.length)break;const each=Math.floor(total/cards.length),extra=total%cards.length;
  const apply=ids=>{const gains=[],reductions=[];for(const c of cards){const amount=each+(ids.includes(c.uid)?1:0),old=this.fear(c);if(amount>old)gains.push({card:c,amount:amount-old});else reductions.push({card:c,amount});}this.fearBatch(gains,source,()=>{for(const {card,amount} of reductions)card.counters.medo=amount;this.refreshFearAuras();});};
  if(extra)this.pick(source,actor,'Escolha os Seres que recebem 1 contador excedente',cards,extra,extra,apply);else apply([]);break;}
 case 'drainFear':case 'refugeFear':{const fromOwner=action==='drainFear'?actor:1-actor,cards=this.allSer(fromOwner).filter(c=>this.fear(c)>0),dest=this.allSer(1-fromOwner);if(!cards.length||!dest.length)break;
  this.pick(source,actor,'Escolha de qual Ser remover Medo',cards,1,1,ids=>{const from=this.find(ids[0]).card,max=this.fear(from);
   const amounts=Array.from({length:max+1},(_,i)=>({uid:String(i),name:String(i)}));
   this.pick(source,actor,'Quantidade de contadores para transferir',amounts,1,1,counts=>{const n=Number(counts[0]);if(!n)return;
    this.pick(source,actor,'Destino de cada contador (pode repetir)',dest,n,n,targets=>{const gains=[...new Set(targets)].map(id=>({card:this.find(id).card,amount:targets.filter(x=>x===id).length}));this.fearBatch(gains,source,()=>{this.changeFear(from,-n,from.name+' transferiu '+n+' Medo.');this.refreshFearAuras();});},{repeat:true,ai:()=>Array(n).fill(dest.slice().sort((a,b)=>this.fear(b)-this.fear(a))[0].uid)});
   },{ai:()=>[String(max)]});
  });break;}
 case 'collapse':case 'fearNegate':break;
 default:this.fail('Efeito sem implementação: '+action);
 }
 this.checkWin();
 };
 const cost=e.discardCost||source.discardCost||0;
 if(cost)this.discardChoice(source,actor,cost,execute);else execute();
};
P.stat=function(card,key){let v=original.stat.call(this,card,key);if(key==='atk'&&this.fieldSer().includes(card)){const fields=this.players.flatMap(p=>p.field.support).filter(c=>c?.id==='circulo_colapso');v+=fields.length*Math.floor(this.fearTotal()/2);}return v;};
P.attack=function(attacker,target,skipReaction=false){
 const a=this.find(attacker),t=this.find(target);
 if(!skipReaction&&!this.over&&!this.pending&&a?.zone==='ser'&&a.owner===this.active&&!a.card.hasAttacked&&a.card.sealedUntil<this.turn&&t?.zone==='ser'&&t.owner!==this.active){
  const reactions=this.p(t.owner).field.support.filter(c=>c?.reactionEvent==='attack'&&!c.__activated&&(c.id!=='desvio_alvo'||this.allSer(t.owner).length>1));
  if(reactions.length){this.pending={kind:'attack',actor:this.active,cardUid:attacker,targetUid:target,responder:t.owner,reactions:reactions.map(c=>c.uid)};return {pending:true};}
 }
 return original.attack.call(this,attacker,target);
};
P.respond=function(uid=null,redirect=null){
 const pending=this.pending;
 if(pending?.kind!=='attack')return original.respond.call(this,uid);
 if(uid&&!pending.reactions.includes(uid))this.fail('Reação inválida.');
 const r=uid?this.find(uid)?.card:null;
 if(r?.id==='desvio_alvo'&&(!this.allSer(pending.responder).some(c=>c.uid===redirect)||redirect===pending.targetUid))this.fail('Escolha outro Ser aliado para receber o ataque.');
 this.pending=null;
 if(r){r.__activated=true;this.destroy(uid,{bypassProtection:true,consumed:true});this.triggerFields(pending.responder,'onSupportActivation',r);
  if(r.id==='cobertura_defensiva'){const a=this.find(pending.cardUid)?.card;if(a)a.hasAttacked=true;this.info('Cobertura Defensiva negou o ataque.');return {negated:true};}
 }
 return this.attack(pending.cardUid,redirect||pending.targetUid,true);
};
P.endTurn=function(){
 if(this.over||this.pending||this.choices.length)this.fail('Resolva as escolhas antes de encerrar o turno.');
 const round=Math.ceil(this.turn/2);
 for(const c of this.allSer(this.active))this.trigger(c,'onTurnEnd',this.active);
 const finish=()=>{
  if(this.over)return;
  if(this.turn%2===0){
   if(this.players.some(p=>p.field.support.some(c=>c?.id==='circulo_colapso'))){for(const c of this.fieldSer())this.destroy(c.uid,{check:false});this.info('Círculo do Colapso: destruição de todos os Seres ao fim da rodada.');}
   for(const c of this.fieldSer()){const expired=(c.roundShields||[]).filter(r=>r<=round).length;c.shields=Math.max(0,c.shields-expired);c.roundShields=(c.roundShields||[]).filter(r=>r>round);}
  }
  const advance=()=>{
   if(this.over)return;this.active=1-this.active;this.turn++;const p=this.p();p.commonUsed=0;p.specialUsed=0;
   for(const c of this.fieldSer()){c.mods=c.mods.filter(m=>m.expires>=this.turn);if(c.sealedUntil<this.turn)c.sealedUntil=0;if(c.controller===this.active)c.hasAttacked=false;}
   for(const player of this.players)for(const c of player.field.support)if(c?.mods)c.mods=c.mods.filter(m=>m.expires>=this.turn);
   this.draw(this.active,this.cfg.drawPerTurn);this.info('Turno de Jogador '+(this.active+1)+'.');this.checkWin();
  };
  if(this.choices.length)(this.afterChoices??=[]).push(advance);else advance();
 };
 if(this.choices.length)(this.afterChoices??=[]).push(finish);else finish();
};
root.HV_RIVALS=[
 {id:'carrasco',name:'O Carrasco',level:'Iniciante',description:'Um executor que prefere resolver tudo no combate. Cartas simples e jogadas diretas para aprender o duelo.',style:'Combate básico',ids:['ghostface','cultista','vigia','sobrevivente','espectro','michael','esqueleto','morcego','lamina','amuleto','velas','manuscrito','corte','exorcismo','frenesi']},
 {id:'guardia',name:'A Guardiã',level:'Intermediária',description:'Protege os sobreviventes do refúgio. Usa Humanos, escudos, descarte e recuperação para manter sua equipe em campo.',style:'Humanos e recuperação',ids:['reporter_inexplicavel','arquivista_proibido','medica_vigilia','cacador_anomalias','engenheira_refugio','investigadora_nevoa','sobrevivente_desesperado','veterano_noite','professor_oculto','lider_remanescentes','refugio','bandagens_campanha','distintivo_sobrevivente','cobertura_defensiva','cofre_reconstituicao']},
 {id:'oraculo',name:'A Oráculo',level:'Avançada',description:'Espalha Medo e explora cada contador. Combina maldições, transferências e execução de Seres marcados.',style:'Contadores e controle',ids:['boneca','portador','testemunha','zumbi','oraculo','executor','carcaca','eco','noiva','cobrador','vigario','correntes_condenacao','ampulheta_colapso','drenagem_pavor','veu_lucidez']}
];
for(const rival of root.HV_RIVALS){rival.deck=rival.ids.flatMap(id=>[id,id]);if(!D.validDeck(rival.deck))throw Error('Baralho inválido: '+rival.name);}
})(typeof window!=='undefined'?window:globalThis);
