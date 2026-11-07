/* HORRORVERSE 2.1 — public-board tactical planner and individual rival policies. */
(function(root){'use strict';
const profiles={
 carrasco:{attack:1.4,defense:.65,engine:1,hand:2,shield:1.5,beam:3,fear:1},
 guardia:{attack:1,defense:1.2,engine:1.5,hand:2.8,shield:2.5,beam:6,fear:.8},
 oraculo:{attack:1.1,defense:.85,engine:1.8,hand:2.4,shield:1.8,beam:7,fear:1.7}
};
class Tactics{
 constructor(engine,id='carrasco',actor=1){this.g=engine;this.id=id;this.actor=actor;this.p=profiles[id]||profiles.carrasco;}
 at(g){return new Tactics(g,this.id,this.actor);}
 threat(c,g=this.g){
  let n=0;for(const e of c.effects||[]){if(['DRAW','DESTROY','CONTROL','REVIVE','SUMMON'].includes(e.op))n+=3;if(e.op==='AURA')n+=2;if(e.op==='COUNTER')n+=2;if(e.op==='CUSTOM')n+=['drawTwo','healSanity','engineer','leader','investigate'].includes(e.action)?4:1;}
  return 4+g.stat(c,'atk')*.85+g.stat(c,'def')*.45+g.remainingTerror(c)*.65+n*this.p.engine;
 }
 handValue(c){return c.kind==='ser'?(c.atk||0)*.5+(c.def||0)*.25+(c.rarity==='comum'?2:0)+(c.affinity==='Humano'&&this.id==='guardia'?2:0):['DESTROY','NEGATE','CONTROL'].includes(c.effects?.[0]?.op)?5:3;}
 fearValue(c,g=this.g){const side=c.controller,foes=g.allSer(1-side),fear=g.fear(c);let penalty=0;
  if(foes.some(x=>x.id==='executor'))penalty+=fear>=3?7:fear*1.1;
  if(foes.some(x=>x.id==='oraculo'))penalty+=Math.floor(fear/2)*1.8;
  if(g.fieldSer().some(x=>x.id==='carcaca'))penalty+=fear>=2?2:0;
  if(foes.some(x=>x.id==='eco')&&fear>=2)penalty+=2;
  // Counters remain a resource for removal, transfer and special summons.
  if(foes.some(x=>['boneca','portador','cobrador'].includes(x.id)))penalty+=fear*.3;
  return -penalty*this.p.fear;
 }
 evaluate(g=this.g){
  if(g.over)return g.over.winner===this.actor?100000:-100000;
  const sideValue=owner=>{
   const p=g.p(owner),beings=g.allSer(owner);let v=p.sanity*9+(p.sanity<=3?-15:0)+p.hand.length*this.p.hand;
   for(const c of beings){v+=this.threat(c,g)+g.stat(c,'atk')*(this.p.attack-.8)+g.stat(c,'def')*(this.p.defense-.7)+c.shields*this.p.shield+this.fearValue(c,g);if(g.players.some(p=>p.field.support.some(x=>x?.id==='circulo_colapso'))&&!c.shields)v-=this.threat(c,g)*(g.turn%2===0?.8:.4);if(c.sealedUntil>=g.turn)v-=3;for(const m of c.mods||[]){if(m.stat==='atk'&&c.hasAttacked)v-=Math.max(0,m.amount)*1.1;if(m.stat==='def'&&m.expires===g.turn)v-=Math.max(0,m.amount)*.5;}
    const expected=g.allSer(1-owner).reduce((m,a)=>Math.max(m,Math.max(0,g.battleAtk(a)-g.stat(c,'def'))),0);
    if(expected>=g.remainingTerror(c)&&!c.shields)v-=Math.min(6,this.threat(c,g)*.25);
   }
   for(const c of p.field.support.filter(Boolean)){
    if(c.subtype==='field')v+=c.id==='circulo_colapso'?0:1;
    else if(c.subtype==='reaction')v+=this.p.hand+1.5;
    else if(!c.__activated)v+=this.p.hand-.15; // prepared cards retain option value
   }
   if(!beings.length){const damage=g.allSer(1-owner).reduce((s,a)=>s+g.directDamage(g.battleAtk(a)),0);v-=Math.min(20,damage*3);}
   return v;
  };
  return sideValue(this.actor)-sideValue(1-this.actor);
 }
 fork(){const g=Object.create(Object.getPrototypeOf(this.g));for(const [k,v] of Object.entries(this.g)){if(['choices','afterChoices'].includes(k))g[k]=[];else g[k]=structuredClone(v);}g.cfg.deferChoices=true;
  // Unknown cards do not influence planning. No access to opponent hand or deck order.
  for(let owner=0;owner<2;owner++){
   g.p(owner).deck=g.p(owner).deck.map((c,i)=>({uid:'unknownDeck'+owner+'_'+i,id:'unknown',kind:'ser',name:'Carta desconhecida',owner,controller:owner,atk:0,def:0,terror:1,effects:[]}));
   if(owner!==this.actor)g.p(owner).hand=g.p(owner).hand.map((c,i)=>({uid:'unknownHand'+i,id:'unknown',kind:'ser',name:'Carta desconhecida',owner,controller:owner,effects:[]}));
  }return g;
 }
 settle(g){let n=0;while(g.choices.length&&!g.over){if(++n>100)throw Error('Tactical choice limit');const c=g.choices[0];g.resolveChoice(new Tactics(g,this.id,c.actor).choice(c));}if(g.pending&&!g.over){const ai=new Tactics(g,this.id,g.pending.responder),r=ai.reaction(false);g.respond(r.uid,r.redirect);if(g.choices.length)this.settle(g);}}
 simulate(action){try{const g=this.fork();this.apply(g,action);this.settle(g);return g;}catch{return null;}}
 apply(g,a){if(a.kind==='place')return g.placeFromHand(a.uid,a.slot,a.opts);if(a.kind==='activate')return g.activate(a.uid,a.target);if(a.kind==='ability')return g.activateSer(a.uid,a.target,a.costs);if(a.kind==='attack')return a.target?g.attack(a.uid,a.target):g.attackDirect(a.uid);if(a.kind==='respond')return g.respond(a.uid,a.redirect);}
 effectTargets(e,g=this.g){return g.needsTarget(e)?g.targets(e,this.actor):[null];}
 actions(known=null){const g=this.g,p=g.p(this.actor),out=[];if(g.over||g.pending||g.active!==this.actor)return out;
  const commonSlot=p.field.ser.indexOf(null),supportSlot=p.field.support.indexOf(null);
  for(const c of p.hand){if(c.id==='unknown'||known&&!known.has(c.uid))continue;
   if(c.kind!=='ser'){if(supportSlot>=0&&!(c.subtype==='field'&&p.field.support.some(x=>x?.id===c.id)))out.push({kind:'place',uid:c.uid,slot:supportSlot,opts:{}});continue;}
   if(commonSlot<0)continue;
   if(c.rarity==='comum'){if(p.commonUsed>=g.cfg.commonSummonsPerTurn)continue;}else if(p.specialUsed>=g.cfg.specialSummonsPerTurn)continue;
   const req=c.summon||{},opts={};let legal=true;
   for(const [key,pool] of Object.entries({sacrifices:g.allSer(this.actor),items:p.field.support.filter(x=>x?.kind==='item'),spells:p.field.support.filter(x=>x?.kind==='magia'),discard:p.hand.filter(x=>x!==c)})){
    const count=req[key]||0;if(pool.length<count){legal=false;break;}opts[key]=pool.slice().sort((a,b)=>key==='sacrifices'?this.threat(a)-this.threat(b):this.handValue(a)-this.handValue(b)).slice(0,count).map(x=>x.uid);
   }
   if(!legal||g.fearTotal()<Math.max(req.fearSpend||0,req.fearRequired||0))continue;
   opts.fearCosts=g.autoFearPayment(req.fearSpend||0,this.actor);if(req.zeroAllyDef){const a=g.allSer(this.actor).sort((a,b)=>g.stat(a,'def')-g.stat(b,'def'))[0];if(!a)continue;opts.defCost=a.uid;}
   opts.summonTargets={};for(const {effect,index,ids} of g.summonChoices(c,this.actor,opts)){opts.summonTargets[index]=ids.slice().sort((a,b)=>this.targetScore(effect,b)-this.targetScore(effect,a)).slice(0,effect.maxTargets||1);}
   out.push({kind:'place',uid:c.uid,slot:commonSlot,opts});
  }
  for(const c of p.field.support.filter(Boolean))if(!['reaction','field'].includes(c.subtype)&&!c.__activated&&g.effectAvailable(c,this.actor))for(const target of this.effectTargets(c.effects?.[0]))out.push({kind:'activate',uid:c.uid,target});
  for(const c of g.allSer(this.actor)){
   if(c.sealedUntil>=g.turn)continue;const e=g.manualEffect(c);
   if(e&&!g.used(c,c.effects.indexOf(e))&&g.effectAvailable(c,this.actor)&&g.fearTotal()>=(e.fearSpend||0))for(const target of this.effectTargets(e))out.push({kind:'ability',uid:c.uid,target,costs:g.autoFearPayment(e.fearSpend||0,this.actor)});
   if(!c.hasAttacked){for(const t of g.allSer(1-this.actor))if(g.battleAtk(c)>g.stat(t,'def'))out.push({kind:'attack',uid:c.uid,target:t.uid});if(g.canDirectAttack(c.uid))out.push({kind:'attack',uid:c.uid,target:null});}
  }return out;
 }
 targetScore(e,id){const c=this.g.find(id)?.card;if(!c)return 0;const friendly=c.controller===this.actor;
  if(e.op==='COUNTER')return this.fearDestination(c);
  if(e.op==='BUFF'&&e.amount<0)return friendly?-30:this.threat(c);
  if(['DESTROY','CONTROL','SEAL'].includes(e.op))return friendly?-this.threat(c):this.threat(c);
  return friendly?this.threat(c):0;
 }
 fearDestination(c){const g=this.g,f=g.fear(c);if(c.controller===this.actor)return c.id==='testemunha'&&!g.used(c,0)?10:-4+this.fearValue(c);return 2+(g.allSer(this.actor).some(x=>x.id==='executor')?(f<3?5:0):0)+(f===1&&g.fieldSer().some(x=>x.id==='carcaca')?4:0)+this.threat(c)*.05;}
 choice(c){const g=this.g;
  if(c.kind==='transfer'){const pairs=[];for(const id of c.ids){const from=g.find(id)?.card;if(!from)continue;for(const to of g.fieldSer())if(from!==to)pairs.push({from:id,to:to.uid,amount:Math.min(2,g.fear(from)),score:this.fearDestination(to)-this.fearDestination(from)});}pairs.sort((a,b)=>b.score-a.score);return pairs[0]?.score>0?pairs[0]:null;}
  if(c.kind!=='pick'){const ids=c.ids.slice().sort((a,b)=>this.targetScore(c.e,b)-this.targetScore(c.e,a));return {target:ids[0]};}
  if(!c.max)return {values:[]};const label=c.label||'',cards=c.options.map(o=>o.card),action=c.card.effects?.[0]?.action;
  if(c.options.some(o=>o.card.id==='veu_lucidez')){let harm=0;for(const gain of c.context?.gains||[]){const x=g.find(gain.uid)?.card;if(!x)continue;const old=g.fear(x),before=this.fearValue(x);x.counters.medo=old+gain.amount;harm+=before-this.fearValue(x);x.counters.medo=old;if(x.id==='testemunha'&&!g.used(x,0))harm-=this.p.hand;}return {values:harm>1.5?c.ids.slice(0,1):[]};}
  if(cards.every(x=>/^\d+$/.test(x.uid)))return {values:[cards.at(-1).uid]};
  const score=x=>{
   if(/descart/i.test(label))return -this.handValue(x);
   if(/remover Medo|tirar os contadores/i.test(label))return -this.fearDestination(x)+g.fear(x)*.2;
   if(/contador|Medo|excedente/i.test(label))return this.fearDestination(x);
   if(action==='mutual')return x.controller===this.actor?-this.threat(x):this.threat(x);
   if(/Escudo/.test(label)){const danger=g.allSer(1-this.actor).some(a=>g.battleAtk(a)-g.stat(x,'def')>=g.remainingTerror(x));return this.threat(x)+(danger?10:0)-x.shields*8;}
   if(/Humano por/.test(label))return g.stat(x,'atk')+(x.hasAttacked?-10:4);
   return this.handValue(x)+(x.kind==='ser'&&x.affinity==='Humano'&&this.id==='guardia'?2:0);
  };
  cards.sort((a,b)=>score(b)-score(a));let count=c.max;
  if(c.optional&&/descart/i.test(label)&&action==='leader')count=Math.min(count,g.allSer(this.actor).some(x=>!x.hasAttacked)?1:0);
  return {values:c.repeat?Array(count).fill(cards[0]?.uid):cards.slice(0,count).map(x=>x.uid)};
 }
 reaction(search=true){const g=this.g,p=g.pending;if(!p)return {uid:null};const options=[{kind:'respond',uid:null}];
  for(const uid of p.reactions){const c=g.find(uid)?.card;if(c?.id==='desvio_alvo'){for(const t of g.allSer(p.responder))if(t.uid!==p.targetUid)options.push({kind:'respond',uid,redirect:t.uid});}else options.push({kind:'respond',uid});}
  const ranked=options.map(a=>{const copy=this.fork();try{copy.respond(a.uid,a.redirect);this.settle(copy);return {...a,score:this.evaluate(copy)-(a.uid?1:0)};}catch{return {...a,score:-Infinity};}}).sort((a,b)=>b.score-a.score);return ranked[0]||{uid:null};
 }
 best(){const baseline=this.evaluate(),known=new Set(this.g.p(this.actor).hand.map(c=>c.uid));const first=this.actions().map(a=>{const state=this.simulate(a);return state?{a,state,score:this.evaluate(state)-.2}:null;}).filter(Boolean).sort((a,b)=>b.score-a.score);
  // Keep preparation moves in the beam: useful spells often need place -> activate.
  const beam=[...first.slice(0,this.p.beam),...first.filter(x=>x.a.kind==='place'&&x.state.find(x.a.uid)?.card.kind!=='ser')];
  for(const item of beam){if(item.state.over)continue;const next=this.at(item.state);for(const a of next.actions(known)){const s=next.simulate(a);if(s)item.score=Math.max(item.score,this.evaluate(s)-.5);}}
  first.sort((a,b)=>b.score-a.score);return first[0]?.score>baseline+.05?{...first[0].a,score:first[0].score-baseline}:null;
 }
}
root.HV_Tactics=Tactics;
})(typeof window!=='undefined'?window:globalThis);
