(function(root){
'use strict';
const P=root.HorrorverseEngine.prototype;
const notable=new Set(['gek_omelliax','ultimo_rosto','imperador_cinzas_eternas','arquimago_veu_partido','tita_massacre','monarca_pavor_absoluto','guardia_ultimo_limiar','circulo_colapso','metamorfose_corrupta','executor']);
P.resetStats=function(){
 this.duelId=root.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
 this.stats=[0,1].map(()=>({spells:0,items:0,spellAttempts:0,itemAttempts:0,sanityDamage:0,terrorDamage:0,lost:0,healed:0,draws:0,peakDraw:0,drawTurn:0,turnDraws:0,chain:0,important:[],exact:false,gek:false}));
 this.effectChain=null;this.chainEvents=[];this.chainSerial=0;
};
P.recordDraw=function(owner,count){
 const s=this.stats[owner];if(!count)return;
 if(this.turn!==s.drawTurn){s.drawTurn=this.turn;s.turnDraws=0;}
 s.draws+=count;s.turnDraws+=count;s.peakDraw=Math.max(s.peakDraw,s.turnDraws);
};
P.recordSanity=function(owner,before,amount,after){
 const s=this.stats[owner],change=after-before;
 if(change>0)s.healed+=change;
 if(change>=0)return;
 s.lost-=change;
 const actor=this.sanityActor;
 if(actor===undefined||actor===owner)return;
 this.stats[actor].sanityDamage-=change;
 if(after===0)this.stats[actor].exact=-amount===before;
};
P.recordEffect=function(source,actor){
 if(!source||!this.stats[actor])return;
 const chain=this.effectChain??={count:0,actors:[]};
 chain.count++;
 if(!chain.actors.includes(actor))chain.actors.push(actor);
 for(const owner of chain.actors)this.stats[owner].chain=Math.max(this.stats[owner].chain,chain.count);
 if(chain.count>=2){
  this.chainEvents.push({id:++this.chainSerial,count:chain.count});
  if(this.chainEvents.length>32)this.chainEvents.shift();
 }
 const list=this.stats[actor].important;
 if(notable.has(source.id)&&!list.includes(source.name))list.push(source.name);
};
P.recordAttempt=function(c,actor){
 this.stats[actor][c.kind==='item'?'itemAttempts':'spellAttempts']++;
};
P.recordSupport=function(c,actor){
 this.stats[actor][c.kind==='item'?'items':'spells']++;
 this.recordEffect(c,actor);
};
P.recordReaction=function(c,actor,triggeringActor){
 if(!this.effectChain&&triggeringActor!==undefined)this.effectChain={count:1,actors:[triggeringActor]};
 this.recordAttempt(c,actor);this.recordSupport(c,actor);
};
for(const name of ['placeFromHand','activate','activateSer','attack','attackDirect','endTurn']){
 const original=P[name];
 P[name]=function(...args){
  if(!this.statAction&&!this.statRespond)this.effectChain=null;
  this.statAction=(this.statAction||0)+1;
  try{return original.apply(this,args);}finally{this.statAction--;}
 };
}
const respond=P.respond;
P.respond=function(...args){
 this.statRespond=true;
 try{return respond.apply(this,args);}finally{this.statRespond=false;}
};
})(typeof window!=='undefined'?window:globalThis);
