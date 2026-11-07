/* Dedicated LAN presentation; CPU and same-computer modes remain independent. */
(function(){'use strict';
const $=s=>document.querySelector(s),esc=HV_UI.esc;let socket,room=null,engine=null,token=null,pending=new Map(),serial=0,connected=false,prompting=false,lastPrompt=-1,retry=null,leaving=false,selected=null,previousCards=new Map();
const store=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v));}catch{}};
const read=k=>{try{return JSON.parse(sessionStorage.getItem(k));}catch{return null;}};
function status(s){$('#lanStatus').textContent=s;$('#lanMatchStatus').textContent=s;}
function address(){let raw=$('#lanAddress').value.trim();if(!raw)throw Error('Informe o endereço do computador servidor.');if(!/^[a-z]+:\/\//i.test(raw))raw='ws://'+raw;const u=new URL(raw);if(!['ws:','wss:','http:','https:'].includes(u.protocol))throw Error('Endereço inválido.');u.protocol=['https:','wss:'].includes(u.protocol)?'wss:':'ws:';u.pathname='/lan';u.search='';u.hash='';if(!u.port)u.port='3000';return u.href;}
function request(action,data={}){return new Promise((resolve,reject)=>{if(!connected)return reject(Error('Conexão perdida. Aguarde a reconexão.'));const id=++serial;const timer=setTimeout(()=>{pending.delete(id);reject(Error('O servidor não respondeu.'));},10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,version:'2.2',action,revision:room?.revision,...data}));});}
function connect(action){leaving=false;clearTimeout(retry);const url=address();if(socket)socket.close();status('Conectando ao servidor local…');store('hv.lan.address',url);
 const ws=new WebSocket(url);socket=ws;ws.onopen=async()=>{if(socket!==ws)return;connected=true;try{const result=await request(action,{name:$('#lanName').value,code:$('#lanCode').value.trim(),token:token||undefined});if(result?.token){token=result.token;store('hv.lan.session',{token,url});}status('Conectado. Confirme seu baralho quando os dois estiverem na sala.');}catch(e){status(e.message);if(token){token=null;store('hv.lan.session',null);}leaving=true;ws.close();}};
 ws.onmessage=event=>{if(socket!==ws)return;let m;try{m=JSON.parse(event.data);}catch{return;}if(m.type==='state'){room=m;refresh();return;}const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.ok?p.resolve(m.result):p.reject(Error(m.error));}};
 ws.onerror=()=>status('Não foi possível conectar. Confira IP, porta, servidor e a permissão de rede local do navegador.');
 ws.onclose=()=>{if(socket!==ws)return;connected=false;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Conexão interrompida.'));}pending.clear();if(room){room.paused=true;refresh();}status('Desconectado. '+(token&&!leaving?'Tentando reconectar…':'Confira o servidor e tente novamente.'));if(token&&!leaving)retry=setTimeout(()=>{try{connect('resume');}catch(e){status(e.message);}},2000);};
}
function launch(action){if(room){status('Saia da sala atual antes de entrar em outra.');return;}token=null;try{connect(action);}catch(e){status(e.message);}}
async function send(action,args=[]){try{await request(action,{args});HV_LAN_UI.sound('click');}catch(e){lastPrompt=-1;status(e.message);}}
function field(label,cards,optional=false){return {label,cards,options:[...(optional?[{value:'skip',label:'Não selecionar'}]:[]),...cards.map(c=>({value:c.uid,label:c.name+(c.kind==='ser'?' · Medo '+engine.fear(c):'')}))]};}
function choose(title,fields=[],options={}){return HV_LAN_UI.choose(title,fields,options);}
function myTurn(){return !!room?.started&&connected&&!room.paused&&!engine.over&&!engine.pending&&!engine.choices.length&&engine.active===room.seat;}
function cardMarkup(c,stats=false){let html=HV_UI.markup(c);if(stats&&c.kind==='ser')html+=`<span class="lan-stats">ATK ${engine.stat(c,'atk')} · DEF ${engine.stat(c,'def')} · TR ${engine.remainingTerror(c)}${c.shields?' · ◇'+c.shields:''}${engine.fear(c)?' · M'+engine.fear(c):''}</span>`;return html;}
function refresh(){
 $('#lanRoom').hidden=!room;$('#lanConnect').hidden=!!room;if(!room)return;
 $('#lanRoomCode').textContent=room.code;$('#lanRoster').textContent=room.players.map((p,i)=>p?(i+1)+'. '+p.name+(p.connected?'':' (desconectado)')+(p.ready?' — pronto':' — aguardando'):(i+1)+'. Aguardando jogador').join('\n');
 $('#lanReady').disabled=!connected||!!room.started;$('#lanReady').textContent=room.players[room.seat]?.ready?'Cancelar confirmação':'Confirmar meu baralho';
 if(!room.started)return;
 if(!engine)HV_LAN_UI.audio(true);engine??=new HorrorverseEngine({deferChoices:true});Object.assign(engine,room.state);engine.fearAuras=new Map(room.state.fearAuras);$('#lanDuel').hidden=false;$('#menuRoot').hidden=true;$('#duel').hidden=true;
 const own=room.seat,other=1-own;$('#lanTitle').textContent='SALA '+room.code+' · TURNO '+engine.turn;
 $('#lanPlayers').textContent=room.players.map((p,i)=>(i===own?'VOCÊ · ':'')+(p?.name||'Jogador')+' · Sanidade '+engine.p(i).sanity).join('  ×  ');
 status(engine.over?(engine.over.winner===own?'Você venceu!':'O adversário venceu.'):(room.paused?'Duelo pausado. Aguardando reconexão.':engine.choices.length?'Aguardando escolha de '+room.players[engine.choices[0].actor]?.name:engine.pending?'Janela de reação aberta.':engine.active===own?'Sua vez.':'Vez de '+room.players[other]?.name));
 $('#lanEnd').disabled=!myTurn();$('#lanBoard').replaceChildren();
 for(const [owner,lane] of [[other,'support'],[other,'ser'],[own,'ser'],[own,'support']]){
  const row=document.createElement('div');row.className='lan-board-row';for(let i=0;i<5;i++){const c=engine.p(owner).field[lane][i],b=document.createElement('button');b.className='lan-slot';if(c)b.dataset.uid=c.uid;b.setAttribute('aria-label',c?.name||'Posição vazia');b.innerHTML=c?cardMarkup(c,true):'<span>'+(lane==='ser'?'SER':'SUPORTE')+'</span>';b.onclick=()=>{if(c)select(c.uid);};row.append(b);}$('#lanBoard').append(row);
 }
 $('#lanHand').replaceChildren();for(const c of engine.p(own).hand){const b=document.createElement('button');b.className='lan-hand-card';b.innerHTML=cardMarkup(c);b.onclick=()=>select(c.uid);$('#lanHand').append(b);}
 $('#lanHandLabel').textContent='SUA MÃO · '+engine.p(own).hand.length+' | MONTE '+engine.p(own).deck.length+' | MÃO INIMIGA '+engine.p(other).hand.length;
 $('#lanLog').textContent=engine.log.slice(0,8).join('\n');
 const nextCards=new Map();for(const c of engine.fieldSer()){const now={atk:engine.stat(c,'atk'),def:engine.stat(c,'def'),fear:engine.fear(c),terror:engine.remainingTerror(c),shields:c.shields},old=previousCards.get(c.uid);nextCards.set(c.uid,now);if(old){if(now.terror<old.terror)HV_LAN_UI.sound('impact');if(now.shields<old.shields)HV_LAN_UI.sound('block');const text=[];if(now.fear!==old.fear){text.push('◉ '+(now.fear>old.fear?'+':'')+(now.fear-old.fear)+' MEDO');HV_LAN_UI.sound(now.fear>old.fear?'fear':'fearRemove');}for(const stat of ['atk','def'])if(now[stat]!==old[stat]){const delta=now[stat]-old[stat];text.push((delta>0?'▲ +':'▼ ')+delta+' '+stat.toUpperCase());HV_LAN_UI.sound(delta>0?'buff':'debuff');}if(text.length){const badge=document.createElement('span');badge.className='lan-change';badge.style.color=now.atk<old.atk||now.def<old.def?'#ff747c':'#b6efa4';badge.textContent=text.join('\n');$('#lanBoard').querySelector(`[data-uid="${c.uid}"]`)?.append(badge);}}else if(previousCards.size)HV_LAN_UI.sound('summon');}if([...previousCards.keys()].some(id=>!nextCards.has(id)))HV_LAN_UI.sound('death');previousCards=nextCards;if(engine.over)HV_LAN_UI.audio(false);renderSelection();promptChoice();
}
function select(uid){selected=uid;renderSelection();}
function renderSelection(){const panel=$('#lanSelection');panel.replaceChildren();const f=engine?.find(selected);if(!f)return;const c=f.card,h=document.createElement('h3');h.textContent=c.name;panel.append(h);const desc=document.createElement('p');desc.textContent=c.text||'';panel.append(desc);
 const button=(text,fn)=>{const b=document.createElement('button');b.className='small-primary';b.textContent=text;b.disabled=!myTurn();b.onclick=fn;panel.append(b);};
 if(f.owner!==room.seat)return;
 if(f.zone==='hand')button(c.kind==='ser'?'Invocar':'Preparar',()=>play(c));
 if(f.zone==='support'&&!['reaction','field'].includes(c.subtype)&&!c.__activated)button('Ativar efeito',()=>activate(c,false));
 if(f.zone==='ser'){
  const e=engine.manualEffect(c);if(e&&!engine.used(c,c.effects.indexOf(e)))button('Usar habilidade',()=>activate(c,true));
  if(!c.hasAttacked&&c.sealedUntil<engine.turn)button('Atacar',()=>attack(c));
 }
}
async function play(c){if(!myTurn())return;const lane=c.kind==='ser'?'ser':'support',slots=engine.p(room.seat).field[lane].flatMap((c,i)=>c?[]:[{value:String(i),label:'Posição '+(i+1)}]);if(!slots.length)return status('Não há posição livre.');
 const req=c.summon||{},opts={sacrifices:[],items:[],spells:[],discard:[],summonTargets:{}};
 const materials={sacrifices:engine.allSer(room.seat),items:engine.p(room.seat).field.support.filter(c=>c?.kind==='item'),spells:engine.p(room.seat).field.support.filter(c=>c?.kind==='magia'),discard:engine.p(room.seat).hand.filter(x=>x!==c)};
 const fields=[{label:'Posição no campo',options:slots}],keys=[];for(const [key,cards] of Object.entries(materials)){if(cards.length<(req[key]||0))return status('Faltam materiais ou cartas para descartar.');for(let i=0;i<(req[key]||0);i++){keys.push(key);fields.push(field(({sacrifices:'Sacrificar Ser',items:'Consumir Item',spells:'Consumir Feitiço',discard:'Descartar carta'})[key],cards));}}
 let values=await choose('Jogar '+c.name,fields,{validate:v=>new Set(v.slice(1)).size!==v.length-1?'Escolha materiais diferentes.':null});if(!values)return;const slot=Number(values[0]);values.slice(1).forEach((id,i)=>opts[keys[i]].push(id));
 if(req.fearSpend){const pool=engine.fieldSer().filter(c=>engine.fear(c));if(engine.fearTotal()<req.fearSpend)return status('Contadores de Medo insuficientes.');values=await choose('Pagar Medo',Array.from({length:req.fearSpend},()=>field('Ser de onde remover 1 contador',pool)),{validate:ids=>{try{engine.fearPayment(ids,req.fearSpend);}catch(e){return e.message;}}});if(!values)return;opts.fearCosts=values;}
 if(req.zeroAllyDef){if(!materials.sacrifices.length)return status('Você precisa de um Ser aliado.');values=await choose('Custo de DEF',[field('Ser que ficará com DEF 0',materials.sacrifices)]);if(!values)return;opts.defCost=values[0];}
 for(const {effect,index,ids} of engine.summonChoices(c,room.seat,opts)){if(!ids.length)continue;values=await choose('Habilidade de invocação',Array.from({length:Math.min(effect.maxTargets||1,ids.length)},()=>field('Alvo',ids.map(id=>engine.find(id).card),effect.optional)),{validate:v=>new Set(v.filter(x=>x!=='skip')).size!==v.filter(x=>x!=='skip').length?'Escolha alvos diferentes.':null});if(!values)return;opts.summonTargets[index]=values.filter(id=>id!=='skip');}
 await send('play',[c.uid,slot,opts]);
}
async function activate(c,ability){if(!myTurn())return;const e=ability?engine.manualEffect(c):c.effects?.[0];if(!e)return;let target=null,costs=[];
 if(engine.needsTarget(e)){const pool=engine.targets(e,room.seat).map(id=>engine.find(id).card);if(!pool.length)return status('Nenhum alvo válido.');const values=await choose(c.name,[field('Escolha o alvo',pool)]);if(!values)return;target=values[0];}
 if(e.fearSpend){const pool=engine.fieldSer().filter(c=>engine.fear(c));if(engine.fearTotal()<e.fearSpend)return status('Medo insuficiente.');const values=await choose('Custo de Medo',Array.from({length:e.fearSpend},()=>field('Remover 1 contador',pool)),{validate:ids=>{try{engine.fearPayment(ids,e.fearSpend);}catch(e){return e.message;}}});if(!values)return;costs=values;}
 await send(ability?'ability':'activate',ability?[c.uid,target,costs]:[c.uid,target]);
}
async function attack(c){if(!myTurn())return;const enemies=engine.allSer(1-room.seat);if(enemies.length){const v=await choose('Declarar ataque',[field('Ser inimigo',enemies)]);if(v)await send('attack',[c.uid,v[0]]);}else await send('direct',[c.uid]);}
async function promptChoice(){if(prompting||!connected||room.paused||engine.over||room.revision===lastPrompt)return;const c=engine.choices[0],r=engine.pending;if(c?.actor!==room.seat&&r?.responder!==room.seat)return;
 if($('#choiceDialog').open){setTimeout(promptChoice,250);return;}
 prompting=true;lastPrompt=room.revision;try{
 if(c&&c.actor===room.seat){let selection=null;
  if(c.kind==='pick'){const fields=Array.from({length:c.max},()=>({label:c.label,cards:c.options.map(o=>o.card),options:[...(c.min<c.max?[{value:'skip',label:'Não selecionar'}]:[]),...c.options]}));const v=await choose(c.card.name,fields,{description:c.label,reveal:c.max===0?c.options.map(o=>o.card):null,cancel:c.optional||c.min===0,validate:v=>{const ids=v.filter(x=>x!=='skip');return ids.length<c.min?'Selecione pelo menos '+c.min:!c.repeat&&new Set(ids).size!==ids.length?'Escolha cartas diferentes.':null;}});selection={values:v?v.filter(x=>x!=='skip'):[]};}
  else if(c.kind==='transfer'){const fromCards=c.ids.map(id=>engine.find(id)?.card).filter(Boolean),v=await choose(c.card.name,[field('Origem dos contadores',fromCards)]);if(v){const from=engine.find(v[0]).card,other=engine.fieldSer().filter(x=>x!==from),w=await choose('Transferir Medo',[field('Destino',other),{label:'Quantidade',options:Array.from({length:Math.min(2,engine.fear(from))},(_,i)=>({value:String(i+1),label:String(i+1)}))}]);if(w)selection={from:from.uid,to:w[0],amount:Number(w[1])};}}
  else {const cards=c.ids.map(id=>engine.find(id)?.card).filter(Boolean),v=await choose(c.card.name,[field('Escolha o alvo',cards)],{cancel:!c.required});if(v)selection={target:v[0]};}
  await send('choice',[selection]);
 }else if(r?.responder===room.seat){const cards=r.reactions.map(id=>engine.find(id).card),v=await choose('Janela de reação',[{label:r.kind==='attack'?'Resposta ao ataque':'Resposta à ativação',options:[{value:'pass',label:'Permitir'},...cards.map(c=>({value:c.uid,label:c.name}))]}]);let uid=v?.[0]&&v[0]!=='pass'?v[0]:null,redirect=null;if(uid&&engine.find(uid).card.id==='desvio_alvo'){const w=await choose('Desviar ataque',[field('Novo alvo aliado',engine.allSer(room.seat).filter(c=>c.uid!==r.targetUid))]);if(w)redirect=w[0];else uid=null;}await send('respond',[uid,redirect]);}
 }finally{prompting=false;setTimeout(()=>{if(engine)promptChoice();},100);}
}
async function exit(){leaving=true;clearTimeout(retry);try{if(connected)await request('leave');}catch{}token=null;room=null;selected=null;engine=null;previousCards=new Map();HV_LAN_UI.audio(false);lastPrompt=-1;store('hv.lan.session',null);socket?.close();connected=false;$('#lanDuel').hidden=true;$('#menuRoot').hidden=false;$('#lanRoom').hidden=true;$('#lanConnect').hidden=false;hvMenu.show('lan');status('Escolha criar ou entrar em uma sala.');}
$('#lanCreate').onclick=()=>launch('create');$('#lanJoin').onclick=()=>launch('join');$('#lanReady').onclick=async()=>{try{await request('ready',{ready:!room.players[room.seat].ready,deck:hvMenu.getDeck()});}catch(e){status(e.message);}};$('#lanLeave').onclick=exit;$('#lanExitMatch').onclick=async()=>{const v=await choose('Sair do duelo LAN?',[],{description:'O outro jogador vencerá por abandono.',confirm:'Sair'});if(v)exit();};$('#lanEnd').onclick=()=>send('end');$('#lanMenu').onclick=()=>{$('#lanDuel').hidden=true;$('#menuRoot').hidden=false;hvMenu.show('lan');};$('#lanBackMatch').onclick=()=>{if(room?.started){$('#lanDuel').hidden=false;$('#menuRoot').hidden=true;}};
const saved=read('hv.lan.session');const addr=read('hv.lan.address');if(addr)$('#lanAddress').value=addr;else if(location.protocol==='http:')$('#lanAddress').value=location.host;$('#lanReconnect').onclick=()=>{const saved=read('hv.lan.session');if(!saved?.token)return status('Nenhuma sessão salva nesta aba.');token=saved.token;$('#lanAddress').value=saved.url;connect('resume');};$('#lanReconnect').hidden=!saved?.token;
setInterval(()=>{if(connected&&room)request('ping').catch(()=>{});},20000);
})();
