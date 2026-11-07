const fs=require('fs'),vm=require('vm'),assert=require('assert');require('./cards.js');require('./engine.js');require('./expansion.js');require('./ai.js');
const code=fs.readFileSync(__dirname+'/game.js','utf8');const start=code.indexOf('async function computerTurn('),end=code.indexOf("window.addEventListener('resize'",start);const cpuCode=code.slice(start,end);let total=0;
(async()=>{for(const rival of HV_RIVALS)for(let trial=0;trial<6;trial++){
 const engine=new HorrorverseEngine({deferChoices:true,winByExtermination:false});engine.setDecks(HV_RIVALS[0].deck,rival.deck);const settle=()=>{let guard=0;while(engine.choices.length){assert(++guard<100);engine.resolveChoice(new HV_Tactics(engine,rival.id,engine.choices[0].actor).choice(engine.choices[0]));}if(engine.pending){const p=engine.pending,r=p.reactions.map(id=>engine.find(id)?.card).find(c=>c.id!=='desvio_alvo');engine.respond(r?.uid);settle();}};
 const context={window:{HV_Tactics},engine,rival,mode:'pvc',delay:async()=>{},awaitTable:async()=>!engine.over,runAction:async(fn)=>{const result=fn();settle();return result??true},endTurn:async()=>{engine.endTurn();settle();}};vm.createContext(context);vm.runInContext(cpuCode,context);
 for(let turn=0;turn<12&&!engine.over;turn++){
  if(engine.active===0){const slot=engine.p().field.ser.indexOf(null),c=engine.p().hand.find(c=>c.kind==='ser'&&c.rarity==='comum');if(slot>=0&&c){engine.placeFromHand(c.uid,slot);settle();}engine.endTurn();settle();}
  if(!engine.over){await context.computerTurn(1);assert(engine.active===0||engine.over,'CPU failed to end turn');total++;}
  assert(engine.fieldSer().every(c=>engine.fear(c)>=0));
 }
}console.log('OK: actual CPU turn code, 3 rivals / 18 matches / '+total+' turns, no blocked choices or invalid actions.');})();
