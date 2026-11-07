/* HORRORVERSE Alpha 1.9 — offline interface, updated card catalogue and effects. */
(function(){'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],{esc,markup,label,symbol}=window.HV_UI;
const catalogue=window.HV_DATA.CARD_LIBRARY,engine=new window.HorrorverseEngine({deferChoices:true});window.hvEngine=engine;
const {DEFAULT_DECK:defaultDeck,validDeck,DEFAULT_CONFIG,randomDeck}=window.HV_DATA;
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const store=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
let deck=load('horrorverse.deck.v1',defaultDeck);if(!validDeck(deck))deck=defaultDeck.slice();
let settings={music:100,sfx:100,outline:'#b59164',sanity:'#80bbab',speed:1,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,...load('horrorverse.options.v1',{})};
settings.music=Math.max(0,Math.min(100,Number(settings.music)||0));settings.sfx=Math.max(0,Math.min(100,Number(settings.sfx)||0));settings.speed=Number(settings.speed)===1.65?1.65:1;
let rival=window.HV_RIVALS[0];
let mode='pvc',started=false,busy=false,selected=null,preview=null,view=0,epoch=0,aiRunning=false,toastTimer=0,bannerTimer=0,drag=null,lastResult=null;
let audio=null,musicTimer=null,musicGain=null,musicNodes=[],audioUnlocked=false;
const back='<div class="card-back"><span>H</span></div>';
const duration=ms=>settings.reduced?Math.min(90,ms):ms/settings.speed;
const delay=ms=>new Promise(r=>setTimeout(r,duration(ms)));
async function motion(el,frames,ms=500,options={}){if(!el)return;const a=el.animate(frames,{duration:duration(ms),easing:'cubic-bezier(.2,.75,.25,1)',...options});try{await a.finished}catch{}return a}
function unlockAudio(){audioUnlocked=true;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();updateMusic()}catch{}}
function tone(freq,end,time=.2,volume=.2,shape='sine',offset=0){if(!audio)return;let now=audio.currentTime+offset,o=audio.createOscillator(),g=audio.createGain();o.type=shape;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),now+time);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*settings.sfx/100*.3),now+.009);g.gain.exponentialRampToValueAtTime(.0001,now+time);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+time+.02)}
function noise(time=.17,volume=.12,cutoff=1800){if(!audio)return;let buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*time),audio.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);let n=audio.createBufferSource(),g=audio.createGain(),f=audio.createBiquadFilter();n.buffer=buffer;f.type='lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(volume*settings.sfx/100*.4,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+time);n.connect(f);f.connect(g);g.connect(audio.destination);n.start();n.stop(audio.currentTime+time)}
function sound(kind='click'){if(!audioUnlocked||settings.sfx<=0)return;try{if(audio?.state==='suspended')audio.resume();const supplied={click:'fx05',set:'fx01',summon:'fx04',block:'fx06',magic:'fx04',death:'fx07',impact:'fx08',turn:'fx05',fear:'fx02',fearRemove:'fx06',buff:'fx03',debuff:'fx06'};if(supplied[kind]){playSample(supplied[kind]);return;}switch(kind){case'draw':playDraw();break;case'set':noise(.17,.2,600);tone(130,50,.25,.4);break;case'summon':tone(70,150,.6,.4);tone(330,660,.55,.1,'triangle',.08);noise(.4,.1,1700);break;case'attack':noise(.22,.4,3000);tone(340,60,.3,.35,'triangle');break;case'impact':noise(.3,.5,800);tone(90,28,.35,.6);break;case'block':tone(780,500,.45,.2,'triangle');tone(1140,760,.4,.1,'sine',.04);break;case'magic':tone(200,700,.5,.15,'triangle');tone(300,1000,.6,.07,'sine',.08);break;case'death':noise(.5,.25,1800);tone(180,30,.6,.25);break;case'turn':tone(220,220,.25,.15);tone(330,330,.35,.12,'sine',.09);break;case'victory':[220,277.18,329.63,440].forEach((n,i)=>tone(n,n,1,.14,'triangle',i*.16));break;default:tone(420,280,.07,.12)}}catch{}}
let tracks=null,trackPromise=null,duelMusicNodes=[],musicStarted=false,musicOffset=0,musicBegan=0;
function loadTracks(){if(trackPromise)return trackPromise;trackPromise=Promise.all(Object.entries(window.HV_AUDIO).map(async([key,b64])=>{const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));return [key,await audio.decodeAudioData(bytes.buffer)];})).then(entries=>tracks=Object.fromEntries(entries)).catch(()=>{toast('Não foi possível carregar o áudio.');return null;});return trackPromise;}
const sampleTimes={};
function playSample(key){if(performance.now()-(sampleTimes[key]||-1000)<120)return;sampleTimes[key]=performance.now();loadTracks().then(t=>{if(!t?.[key]||settings.sfx<=0)return;const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=t[key];gain.gain.value=settings.sfx/100;source.connect(gain);gain.connect(audio.destination);source.start();});}
function playDraw(){loadTracks().then(t=>{if(!t||!audio||settings.sfx<=0)return;const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=t.draw;gain.gain.value=settings.sfx/100*.65;source.connect(gain);gain.connect(audio.destination);source.start();});}
function stopMusic(){if(musicStarted&&audio)musicOffset+=Math.max(0,audio.currentTime-musicBegan);for(const node of duelMusicNodes){try{node.stop()}catch{}}duelMusicNodes=[];musicStarted=false;}
function resetDuelMusic(){stopMusic();musicOffset=0;updateMusic();}
async function updateMusic(){if(!audioUnlocked||!audio)return;const audible=()=>!document.hidden&&settings.music>0&&(window.HV_LAN_ACTIVE||(started&&$('#menuRoot').hidden&&!engine.over));if(!audible()){stopMusic();return;}if(!musicGain){musicGain=audio.createGain();musicGain.connect(audio.destination);}musicGain.gain.setTargetAtTime(settings.music/100,audio.currentTime,.15);const t=await loadTracks();if(!t||musicStarted||!audible())return;const now=audio.currentTime+.025;musicBegan=now;musicStarted=true;const introLength=t.intro.duration;let loopTime=now,loopOffset=0;
 if(musicOffset<introLength){const intro=audio.createBufferSource();intro.buffer=t.intro;intro.connect(musicGain);intro.start(now,musicOffset);duelMusicNodes.push(intro);loopTime=now+introLength-musicOffset;}else loopOffset=(musicOffset-introLength)%t.loop.duration;
 const loop=audio.createBufferSource();loop.buffer=t.loop;loop.loop=true;loop.connect(musicGain);loop.start(loopTime,loopOffset);duelMusicNodes.push(loop);
}
document.addEventListener('visibilitychange',()=>document.hidden?stopMusic():updateMusic());
function applySettings(){document.documentElement.style.setProperty('--card-outline',/^#[a-f\d]{6}$/i.test(settings.outline)?settings.outline:'#b59164');document.documentElement.style.setProperty('--sanity-color',/^#[a-f\d]{6}$/i.test(settings.sanity)?settings.sanity:'#80bbab');document.body.classList.toggle('reduced-motion',!!settings.reduced);$('#musicVolume').value=settings.music;$('#sfxVolume').value=settings.sfx;$('#musicVal').textContent=settings.music+'%';$('#sfxVal').textContent=settings.sfx+'%';$('#animationSpeed').value=settings.speed;$('#reducedMotion').checked=!!settings.reduced;$('#outlineColor').value=settings.outline;$('#sanityColor').value=settings.sanity;updateMusic()}
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3300)}
function updateDeckCount(){
 $('#menuDeckCount').textContent=deck.length+'/'+DEFAULT_CONFIG.maxDeckSize;
 $('#soloDeckCount').textContent=deck.length+' cartas';
}
function showScreen(id){if(id==='builder'){window.HV_EDITOR?.open();return}$$('.menu-screen').forEach(el=>el.classList.toggle('active',el.dataset.screen===id));$$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.screenGo===id||id==='pvc'&&el.dataset.screenGo==='home'||id==='pvp'&&el.dataset.screenGo==='home'));$('.menu-content').scrollTop=0;if(id==='options')applySettings();sound()}
window.hvMenu={show:showScreen,getDeck:()=>deck.slice(),setDeck(ids){if(validDeck(ids)){deck=ids.slice();updateDeckCount()}},sound:()=>sound(),onStart:null};
$$('[data-screen-go]').forEach(el=>el.onclick=()=>{unlockAudio();showScreen(el.dataset.screenGo)});
$('.brand').onclick=e=>{e.preventDefault();showScreen('home')};
$('#quickPlay').onclick=()=>{unlockAudio();showScreen('pvc')};$('#startPVC').onclick=()=>beginMatch('pvc');$('#startLocal').onclick=()=>beginMatch('local');
for(const [id,key]of[['musicVolume','music'],['sfxVolume','sfx']])$('#'+id).oninput=e=>{unlockAudio();settings[key]=Number(e.target.value);applySettings();if(key==='sfx')sound()};
for(const[id,key]of[['outlineColor','outline'],['sanityColor','sanity'],['animationSpeed','speed']])$('#'+id).oninput=e=>{settings[key]=key==='speed'?Number(e.target.value):e.target.value;applySettings()};
$('#reducedMotion').onchange=e=>{settings.reduced=e.target.checked;applySettings()};
$('#optionsSave').onclick=()=>{applySettings();$('#optionsMessage').textContent=store('horrorverse.options.v1',settings)?'Preferências salvas. Seu próximo ritual está pronto.':'Preferências aplicadas nesta sessão; o navegador bloqueou o salvamento.';sound('magic')};
$('#closeEditor').onclick=()=>window.HV_EDITOR?.close();
for(let i=0;i<22;i++){const e=document.createElement('i');e.className='ember';e.style.cssText=`left:${15+Math.random()*84}%;bottom:${Math.random()*55}%;--life:${8+Math.random()*14}s;animation-delay:${-Math.random()*22}s`;$('#embers').append(e)}
function canInput(){return started&&!busy&&!engine.over&&!engine.pending&&!engine.choices.length&&!(mode==='pvc'&&engine.active===1)&&$('#menuRoot').hidden&&!$('#choiceDialog').open}
function nodeFor(uid){return document.querySelector(`[data-uid="${uid}"]`)}
function rect(el){if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,x:r.left+r.width/2,y:r.top+r.height/2}}
function snapshot(){return{turn:engine.turn,active:engine.active,sanity:engine.players.map(p=>p.sanity),hand:engine.players.map(p=>p.hand.map(c=>({...c}))),field:engine.players.flatMap((p,owner)=>['ser','support'].flatMap(lane=>p.field[lane].flatMap((c,i)=>c?[{card:{...c,counters:{...c.counters},liveAtk:engine.stat(c,'atk'),liveDef:engine.stat(c,'def')},owner,lane,i,rect:rect(nodeFor(c.uid))}]:[]))),rects:Object.fromEntries($$('[data-uid]').map(n=>[n.dataset.uid,rect(n)]))}}
function createBoard(){const b=$('#board');for(const[owner,lane]of[[1,'support'],[1,'ser'],[0,'ser'],[0,'support']]){const row=document.createElement('div');row.className='board-row';row.dataset.owner=owner;row.dataset.lane=lane;row.dataset.label=lane==='ser'?'SERES':'SUPORTES';for(let i=0;i<5;i++){const s=document.createElement('button');s.className='slot';s.dataset.owner=owner;s.dataset.lane=lane;s.dataset.index=i;s.type='button';s.setAttribute('aria-label',`Jogador ${owner+1}, ${lane==='ser'?'ser':'suporte'}, posição ${i+1}`);s.innerHTML='<span class="slot-mark">'+(lane==='ser'?'◇':'✧')+'</span>';s.onclick=()=>onSlot(owner,lane,i);row.append(s)}b.append(row)}}
function fieldSlot(owner,lane,i){return document.querySelector(`.slot[data-owner="${owner}"][data-lane="${lane}"][data-index="${i}"]`)}
function liveValues(node,c){if(c.kind!=='ser')return;const values=[engine.stat(c,'atk'),engine.stat(c,'def'),engine.remainingTerror(c)];node.querySelectorAll('.art-stat-bar b, .card-footer b').forEach((el,i)=>{if(i<3)el.textContent=values[i]})}
function renderField(){for(const owner of[0,1])for(const lane of['ser','support'])engine.p(owner).field[lane].forEach((c,i)=>{const slot=fieldSlot(owner,lane,i);let node=slot.querySelector('.field-card');if(!c){node?.remove();slot.classList.remove('occupied');slot.setAttribute('aria-label',`Jogador ${owner+1}, ${lane==='ser'?'ser':'suporte'}, posição ${i+1}`);return}if(!node||node.dataset.uid!==c.uid){node?.remove();node=document.createElement('div');node.className='field-card';node.dataset.uid=c.uid;node.innerHTML=markup(c)+'<span class="field-badge"></span>';node.addEventListener('pointerenter',()=>{if(!selected)inspect(c.uid)});node.addEventListener('pointerleave',()=>{if(!selected)inspect(null)});slot.append(node)}liveValues(node,c);slot.classList.add('occupied');slot.setAttribute('aria-label',c.name+', Jogador '+(owner+1));node.classList.toggle('selected',selected===c.uid);node.classList.toggle('spent',c.kind==='ser'&&c.hasAttacked);const badge=node.querySelector('.field-badge');badge.classList.toggle('shielded',c.shields>0);badge.textContent=c.kind==='ser'?`${engine.stat(c,'atk')} / ${engine.stat(c,'def')} · ${engine.remainingTerror(c)} TR${c.shields?' ◇'+c.shields:''}${c.counters?.medo?' · M'+c.counters.medo:''}${c.sealedUntil>=engine.turn?' · SELADO':''}`:c.subtype==='field'?'CAMPO ATIVO':c.subtype==='reaction'?'REAÇÃO':'PREPARADO';})}
function renderHand(){const positions=new Map($$('#hand .hand-card').map(el=>[el.dataset.uid,rect(el)]));const holder=$('#hand'),visible=!(mode==='pvc'&&engine.active===1),cards=visible?engine.p(view).hand:[],ids=new Set(cards.map(c=>c.uid));holder.querySelector('.waiting-hand')?.remove();$$('#hand .hand-card').forEach(el=>{if(!ids.has(el.dataset.uid))el.remove()});cards.forEach((c,i)=>{let el=holder.querySelector(`[data-uid="${c.uid}"]`);if(!el){el=document.createElement('button');el.type='button';el.className='hand-card';el.dataset.uid=c.uid;el.innerHTML=markup(c);el.setAttribute('aria-label',c.name+', '+label(c));el.addEventListener('pointerenter',()=>{if(!selected)inspect(c.uid);soundHover()});el.addEventListener('pointerleave',()=>{if(!selected&&!drag)inspect(null)});el.addEventListener('focus',()=>{if(!selected)inspect(c.uid)});el.addEventListener('pointerdown',e=>startDrag(e,c));el.onclick=()=>{if(drag?.moved)return;selectHand(c.uid)};holder.append(el)}el.style.setProperty('--angle',`${innerWidth<=580?0:(i-(cards.length-1)/2)*Math.min(1.7,16/cards.length)}deg`);el.style.setProperty('--lift',`${innerWidth<=580?0:Math.abs(i-(cards.length-1)/2)*1.2}px`);el.style.setProperty('--overlap',`${innerWidth<=580?18:Math.max(18,(cards.length*parseFloat(getComputedStyle(el).flexBasis)-(holder.clientWidth-70))/Math.max(1,cards.length-1))}px`);el.style.zIndex=i+1;el.classList.toggle('selected',selected===c.uid);el.classList.toggle('unavailable',c.kind==='ser'&&(c.rarity==='comum'?engine.p(view).commonUsed>=1:engine.p(view).specialUsed>=1));el.disabled=!canInput()});if(!visible){holder.innerHTML='<p class="waiting-hand">O pesadelo está preparando sua jogada…</p>'}if(!settings.reduced)$$('#hand .hand-card').forEach(el=>{const old=positions.get(el.dataset.uid),now=rect(el);if(old&&now&&Math.abs(old.x-now.x)>2)motion(el,[{translate:`${old.x-now.x}px 0`},{translate:'0 0'}],320)});$('#handCount').textContent=visible?`${cards.length} CARTAS`:'';$('#handTitle').textContent=mode==='local'?`MÃO DO JOGADOR ${view+1}`:'SUA MÃO'}
let hoverTime=0;function soundHover(){if(performance.now()-hoverTime>140){tone(240,320,.025,.025);hoverTime=performance.now()}}
function renderHud(){for(const owner of[0,1]){const p=engine.p(owner),h=$('#hud'+owner);h.classList.toggle('active',engine.active===owner);h.innerHTML=`<div class="avatar"><svg><use href="#${owner===view?'i-eye':'i-shield'}"/></svg></div><div class="hud-name">${mode==='pvc'?(owner===0?'VOCÊ':esc(rival.name)):'JOGADOR '+(owner+1)}</div><div class="sanity-number">${p.sanity}<small> / ${engine.cfg.startingSanity}</small></div><div class="sanity-track"><i style="width:${100*p.sanity/engine.cfg.startingSanity}%"></i></div><div class="hud-label">SANIDADE${engine.fear(p)?' · MEDO '+engine.fear(p):''}</div>`;h.classList.toggle('self-hud',owner===view);h.classList.toggle('enemy-hud',owner!==view)}$('#deckCount').textContent=engine.p(view).deck.length;$('#graveCount').textContent=engine.p(view).grave.length;$('#roundLabel').textContent=`RODADA ${String(Math.ceil(engine.turn/2)).padStart(2,'0')}`;$('#turnIndicator').textContent=engine.over?'DUELO ENCERRADO':(mode==='pvc'?(engine.active===0?'SUA VEZ':'VEZ DE '+rival.name.toUpperCase()):`VEZ DO JOGADOR ${engine.active+1}`)+` · T${engine.turn}`;$('#end').disabled=!canInput();$('#menuInGame').disabled=busy;$('#reset').disabled=busy;$('#rulesInGame').disabled=busy;$('#hint').textContent=engine.over?'O ritual terminou.':engine.pending?'Uma reação aguarda resposta.':busy?'O ritual está em movimento…':selected?engine.find(selected)?.zone==='hand'?'Escolha uma posição iluminada no campo.':'Escolha uma ação para esta carta.':engine.turn<=2?'Proteção inicial · ataques diretos bloqueados':'Selecione ou arraste uma carta para jogar';const enemy=engine.p(1-view);$('#rivalHand').replaceChildren();for(let i=0;i<Math.min(11,enemy.hand.length);i++){const b=document.createElement('div');b.innerHTML=back;const el=b.firstChild;el.style.setProperty('--r',`${(i-(Math.min(11,enemy.hand.length)-1)/2)*3}deg`);$('#rivalHand').append(el)}}
function renderFieldBackground(){
 const image=$('#fieldBackground');
 const path=settings.reduced?'':engine.activeField()?.backgroundGif;
 if(image.getAttribute('src')===(path||null))return;
 image.hidden=true;
 if(path)image.src=path;
 else image.removeAttribute('src');
}
$('#fieldBackground').addEventListener('load',renderLoadedFieldBackground);
function renderLoadedFieldBackground(event){
 const image=event.currentTarget;
 image.hidden=!image.hasAttribute('src')||!image.naturalWidth||settings.reduced;
}
$('#fieldBackground').addEventListener('error',event=>{event.currentTarget.hidden=true});
function render(){if(!started)return;const newView=mode==='pvc'?0:engine.active;if(newView!==view){view=newView;$('#hand').replaceChildren();for(const row of $$('.board-row')){const own=Number(row.dataset.owner)===view;row.style.gridRow=own?(row.dataset.lane==='ser'?4:5):(row.dataset.lane==='ser'?2:1)}}renderField();renderFieldBackground();renderHud();renderHand();highlightSlots();inspect(selected||preview);$('#log').replaceChildren(...engine.log.slice(0,16).map(s=>{let n=document.createElement('div');n.textContent=s;return n}));}
function highlightSlots(){const c=engine.find(selected)?.card;$$('.slot').forEach(s=>s.classList.toggle('valid',canInput()&&!!c&&engine.find(selected)?.zone==='hand'&&Number(s.dataset.owner)===engine.active&&s.dataset.lane===(c.kind==='ser'?'ser':'support')&&!engine.p().field[s.dataset.lane][Number(s.dataset.index)]))}
function inspect(uid){preview=uid;const f=engine.find(uid);$('.inspector').classList.toggle('has-selection',!!selected);if(!f){$('#inspectCard').innerHTML='<div class="empty-inspect">✧</div>';$('#detail').innerHTML='<h2>Conheça suas cartas.</h2><p>Passe o mouse ou selecione uma carta para ver seus atributos e habilidades.</p>';$('#actions').replaceChildren();return}const c=f.card;$('#inspectCard').innerHTML=markup(c);liveValues($('#inspectCard'),c);$('#detail').innerHTML=`<div class="detail-type">${label(c)} · ${esc(c.affinity||c.subtype||'SUPORTE')}</div><h2>${esc(c.name)}</h2>${c.kind==='ser'?`<div class="detail-stats"><span>ATAQUE<b>${engine.stat(c,'atk')}</b></span><span>DEFESA<b>${engine.stat(c,'def')}</b></span><span>TERROR<b>${engine.remainingTerror(c)}/${engine.stat(c,'terror')}</b></span></div>${c.counters?.medo?`<p>Contadores de Medo: ${c.counters.medo}</p>`:''}`:''}<p>${esc(c.text||'Ser invocado pelo ritual.')}</p>`;const a=$('#actions');a.replaceChildren();if(selected!==uid)return;function button(text,fn,primary=true){const el=document.createElement('button');el.className=primary?'small-primary':'text-button';el.textContent=text;el.disabled=!canInput();el.onclick=fn;a.append(el)}if(f.zone==='hand'){const note=document.createElement('div');note.className='action-note';note.textContent='Escolha uma posição iluminada ou arraste esta carta até o campo.';a.append(note)}else if(f.owner===engine.active&&f.zone==='ser'){if(c.sealedUntil>=engine.turn){a.innerHTML='<p class="action-note">Este ser está selado.</p>'}else if(c.hasAttacked){a.innerHTML='<p class="action-note">Este ser já atacou neste turno.</p>'}else{if(engine.allSer(1-engine.active).length)button('⚔ Atacar',()=>chooseAttack(c));else if(engine.canDirectAttack(c.uid))button('⚔ Atacar sanidade',()=>performAttack(c.uid,null));else a.innerHTML='<p class="action-note">Proteção inicial: ataque direto liberado no turno 3.</p>'}const effect=engine.manualEffect(c);if(effect&&!engine.used(c,c.effects.indexOf(effect)))button('✧ Usar habilidade',()=>activateSer(c,effect));}else if(f.owner===engine.active&&f.zone==='support'){if(c.subtype==='field'||c.subtype==='reaction'){a.innerHTML='<p class="action-note">'+(c.subtype==='field'?'Campo ativo. Seu efeito é contínuo.':'Reação armada. Ativa quando ocorrer a condição descrita na carta.')+'</p>'}else if(!c.__activated)button('✧ Ativar efeito',()=>activateSupport(c))}button('Ver carta e detalhes',()=>showCardDetails(c),false);button('× Fechar seleção',()=>{selected=null;preview=null;render()},false)}
function showCardDetails(c){choose('Arquivo: '+c.name,[],{description:c.text||'Ser invocado pelo ritual.',card:c,confirm:'Fechar',cancel:false})}
function selectHand(uid){if(!canInput())return;selected=selected===uid?null:uid;preview=selected;sound();render()}
function onSlot(owner,lane,i){if(!canInput())return;const target=engine.p(owner).field[lane][i],f=engine.find(selected);if(f?.zone==='hand'&&owner===engine.active&&!target){if(lane!==(f.card.kind==='ser'?'ser':'support'))return toast('Seres na frente; itens e magias na fileira de suporte.');return placeCard(f.card,i)}if(target){selected=selected===target.uid?null:target.uid;preview=selected;sound();render()}else{selected=null;preview=null;render()}}
function startDrag(e,c){if(e.pointerType==='touch'&&innerWidth<=850)return;if(!canInput()||e.button!==0)return;drag={uid:c.uid,x:e.clientX,y:e.clientY,moved:false,el:e.currentTarget};drag.el.setPointerCapture?.(e.pointerId)}
window.addEventListener('pointermove',e=>{if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;selected=drag.uid;drag.el.classList.add('dragging');$('#dragGhost').innerHTML=markup(engine.find(drag.uid).card);$('#dragGhost').hidden=false;highlightSlots();inspect(drag.uid)}if(drag.moved){$('#dragGhost').style.left=e.clientX+'px';$('#dragGhost').style.top=e.clientY+'px'}});
window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;if(d.moved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.slot');d.el.classList.remove('dragging');$('#dragGhost').hidden=true;e.preventDefault();if(target&&Number(target.dataset.owner)===engine.active&&canInput()){const c=engine.find(d.uid)?.card;if(c&&target.dataset.lane===(c.kind==='ser'?'ser':'support'))placeCard(c,Number(target.dataset.index));else toast('Solte na fileira correspondente à carta.')}else toast('Escolha uma posição livre do seu lado.');setTimeout(()=>{if(drag===d)drag=null},0)}else drag=null});
window.addEventListener('pointercancel',()=>{drag?.el.classList.remove('dragging');drag=null;$('#dragGhost').hidden=true});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#choiceDialog').open&&!$('#resultDialog').open){if(!$('#hvEditorOverlay').hidden){window.HV_EDITOR?.close();return}if(!canInput())return;selected=null;preview=null;render()}});
/* Dialogs keep all choices explicit, including distinct special-summon materials. */
function choose(title,fields=[],options={}){return new Promise(resolve=>{const dialog=$('#choiceDialog');if(dialog.open){resolve(null);return}const returnFocus=document.activeElement;$('#choiceTitle').textContent=title;$('#choiceError').textContent='';$('#choiceBody').replaceChildren();const controls=[];if(options.card){const face=document.createElement('div');face.style.cssText='width:145px;height:203px;margin:20px auto';face.innerHTML=markup(options.card);$('#choiceBody').append(face)}if(options.reveal){const list=document.createElement('div');list.className='revealed-cards';list.innerHTML=options.reveal.map(c=>'<div>'+markup(c)+'</div>').join('');$('#choiceBody').append(list)}if(options.description){const p=document.createElement('p');p.style.whiteSpace='pre-line';p.textContent=options.description;$('#choiceBody').append(p)}for(const f of fields){const labelEl=document.createElement('label');labelEl.textContent=f.label;const select=document.createElement('select');for(const option of f.options){let o=document.createElement('option');o.value=option.value;o.textContent=option.label;select.append(o)}controls.push(select);if(f.cards){const list=document.createElement('div');list.className='target-choice';for(const option of f.options){const c=f.cards.find(c=>c.uid===option.value),b=document.createElement('button');b.type='button';b.className='target-option';b.setAttribute('aria-label',option.label);b.innerHTML=(c?markup(c):'')+`<span>${esc(option.label)}</span>`;b.onclick=()=>{select.value=option.value;list.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b))};if(option.value===select.value)b.classList.add('active');list.append(b)}select.style.display='none';labelEl.append(list)}labelEl.append(select);$('#choiceBody').append(labelEl)}$('#choiceCancel').hidden=options.cancel===false;$('#choiceCancel').textContent=options.cancelLabel||'Cancelar';$('#choiceConfirm').textContent=options.confirm||'Confirmar';let done=false;function finish(value){if(done)return;done=true;dialog.close();dialog.removeEventListener('cancel',onCancel);$('#choiceForm').onsubmit=null;resolve(value);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})}function onCancel(e){e.preventDefault();if(options.cancel!==false)finish(null)}$('#choiceCancel').onclick=()=>finish(null);dialog.addEventListener('cancel',onCancel);$('#choiceForm').onsubmit=e=>{e.preventDefault();const values=controls.map(x=>x.value),error=options.validate?.(values);if(error){$('#choiceError').textContent=error;return}finish(values)};dialog.showModal()})}
function fearLabel(card){
 return card.name+' · Medo '+engine.fear(card)+' · J'+(card.controller+1);
}
async function chooseFearPayment(title,amount){
 if(engine.fearTotal()<amount){toast('Faltam Contadores de Medo no campo.');return null}
 const pool=engine.fieldSer().filter(card=>engine.fear(card)>0);
 const options=pool.map(card=>({value:card.uid,label:fearLabel(card)}));
 const fields=Array.from({length:amount},(_,i)=>({label:'Contador '+(i+1)+'/'+amount,options}));
 return choose(title,fields,{
  description:'Escolha de quais Seres remover os contadores. Você pode usar o mesmo Ser mais de uma vez se ele tiver contadores suficientes.',
  validate:ids=>{try{engine.fearPayment(ids,amount);return null}catch(error){return error.message}}
 });
}
async function placeCard(c,i){
 if(!canInput())return;
 const req=c.summon||{},fields=[];
 const materials={sacrifices:engine.allSer(engine.active),items:engine.p().field.support.filter(x=>x?.kind==='item'),spells:engine.p().field.support.filter(x=>x?.kind==='magia')};
 const labels={sacrifices:'Sacrifício',items:'Consumir item',spells:'Consumir magia'};
 const opts={sacrifices:[],items:[],spells:[],summonTargets:{}};
 if(engine.fearTotal()<(req.fearRequired||0)){toast('Faltam '+req.fearRequired+' Contadores de Medo no campo.');return}
 for(const [key,pool] of Object.entries(materials)){
  const count=req[key]||0;
  if(pool.length<count){toast('Faltam materiais: '+labels[key]+'.');return}
  for(let n=0;n<count;n++)fields.push({key,label:labels[key]+' '+(n+1)+'/'+count,options:pool.map(card=>({value:card.uid,label:card.name}))});
 }
 if(fields.length){
  const values=await choose('Invocar '+c.name,fields,{
   description:'Os materiais escolhidos serão enviados para o descarte.',
   validate:values=>new Set(values).size!==values.length?'Escolha materiais diferentes.':null
  });
  if(!values)return;
  values.forEach((value,n)=>opts[fields[n].key].push(value));
 }
 if(req.discard){
  const cards=engine.p().hand.filter(x=>x.uid!==c.uid);if(cards.length<req.discard)return toast('Faltam cartas na mão para descartar.');
  const values=await choose('Custo de invocação · '+c.name,Array.from({length:req.discard},(_,i)=>targetField('Descarte '+(i+1),cards)),{validate:ids=>new Set(ids).size!==ids.length?'Escolha cartas diferentes.':null});
  if(!values)return;opts.discard=values;
 }
 if(req.fearSpend){
  opts.fearCosts=await chooseFearPayment('Invocar '+c.name,req.fearSpend);
  if(!opts.fearCosts)return;
 }
 if(req.zeroAllyDef){
  const allies=materials.sacrifices;
  if(!allies.length){toast('Você precisa de um Ser aliado em campo.');return}
  const values=await choose('Invocar '+c.name,[targetField('Ser aliado que ficará com DEF 0',allies)]);
  if(!values)return;
  opts.defCost=values[0];
 }
 for(const {effect,index,ids} of engine.summonChoices(c,engine.active,opts)){
  if(!ids.length)continue;
  const cards=ids.map(id=>engine.find(id).card);
  const targets=Array.from({length:Math.min(effect.maxTargets||1,ids.length)},(_,n)=>targetField('Alvo '+(n+1)+' da habilidade',cards,effect.optional));
  const values=await choose('Habilidade · '+c.name,targets,{
   description:c.text,
   confirm:'Invocar e resolver',
   validate:values=>{const ids=values.filter(v=>v!=='skip');return new Set(ids).size!==ids.length?'Escolha alvos diferentes.':null}
  });
  if(!values)return;
  opts.summonTargets[index]=values.filter(v=>v!=='skip');
 }
 await runAction(()=>engine.placeFromHand(c.uid,i,opts),{kind:c.kind==='ser'?'summon':'set'});
}
function targetField(label,cards,optional=false){
 return {label,cards,options:[...(optional?[{value:'skip',label:'Não selecionar'}]:[]),...cards.map(card=>({value:card.uid,label:card.kind==='ser'?fearLabel(card):card.name}))]};
}
async function activateSer(c,effect){
 if(!canInput())return;
 let target=null;
 if(engine.needsTarget(effect)){
  const cards=engine.targets(effect).map(id=>engine.find(id).card);
  if(!cards.length){toast('Nenhum alvo válido para esta habilidade.');return}
  const values=await choose('Habilidade · '+c.name,[targetField('Escolha o alvo',cards)],{description:c.text});
  if(!values)return;
  target=values[0];
 }
 const payment=effect.fearSpend?await chooseFearPayment('Habilidade · '+c.name,effect.fearSpend):[];
 if(payment)await runAction(()=>engine.activateSer(c.uid,target,payment),{source:c.uid,target});
}
async function selectEffectChoice(choice){
 const cpu=mode==='pvc'&&choice.actor===1;
 if(cpu)return new window.HV_Tactics(engine,rival.id,1).choice(choice);
 const title='Habilidade · '+choice.card.name;
 const cards=choice.ids.map(id=>engine.find(id)?.card).filter(Boolean);
 if(choice.kind==='pick'){
  if(cpu)return engine.autoChoice(choice);
  const pool=choice.options.map(o=>o.card),fields=Array.from({length:choice.max},(_,i)=>({label:choice.label+(choice.max>1?' · '+(i+1):''),cards:pool,options:[...(choice.min<choice.max?[{value:'skip',label:'Não selecionar'}]:[]),...choice.options]}));
  const values=await choose(title,fields,{description:choice.label,reveal:choice.max===0?pool:null,confirm:'Resolver',cancel:choice.optional||choice.min===0,validate:values=>{const ids=values.filter(id=>id!=='skip');return ids.length<choice.min?'Selecione pelo menos '+choice.min+' carta(s).':!choice.repeat&&new Set(ids).size!==ids.length?'Escolha cartas diferentes.':null;}});
  return {values:values?values.filter(id=>id!=='skip'):choice.min?choice.ids.slice(0,choice.min):[]};
 }

 if(choice.kind==='transfer'){
  const first=cpu?cards.find(card=>card.controller===choice.actor):null;
  if(cpu&&!first)return null;
  const origin=cpu?[first.uid]:await choose(title,[targetField('De qual Ser tirar os contadores?',cards)],{description:choice.card.text});
  if(!origin)return null;
  const from=engine.find(origin[0]).card;
  const targets=engine.fieldSer().filter(card=>card!==from);
  const max=Math.min(2,engine.fear(from));
  if(cpu){
   const enemy=targets.find(card=>card.controller!==choice.actor);
   return enemy?{from:from.uid,to:enemy.uid,amount:max}:null;
  }
  const options=Array.from({length:max},(_,i)=>({value:String(i+1),label:String(i+1)}));
  const values=await choose(title,[targetField('Para qual Ser?',targets),{label:'Quantidade',options}]);
  return values?{from:from.uid,to:values[0],amount:Number(values[1])}:null;
 }
 const target=cpu?[choice.ids[0]]:await choose(title,[targetField('Escolha o alvo',cards)],{
  description:choice.card.text,
  confirm:'Resolver habilidade',
  cancelLabel:choice.required?'Usar primeiro alvo':'Dispensar efeito'
 });
 return target?{target:target[0]}:null;
}
async function chooseAttack(c){const enemies=engine.allSer(1-engine.active);if(!enemies.length)return;const values=await choose('Escolha seu alvo',[{label:'Ser adversário',options:enemies.map(x=>({value:x.uid,label:x.name})),cards:enemies}],{description:'ATK '+engine.stat(c,'atk')+' · O dano é descontado do TERROR do defensor.',confirm:'Declarar ataque'});if(values)performAttack(c.uid,values[0])}
async function activateSupport(c){if(!canInput())return;const effect=c.effects?.[0];if(!effect)return;let target=null;if(engine.needsTarget(effect)){const ids=engine.targets(effect);if(!ids.length)return toast('Nenhum alvo válido para este efeito.');const cards=ids.map(id=>engine.find(id).card),values=await choose('Ativar '+c.name,[{label:'Escolha o alvo',options:cards.map(x=>({value:x.uid,label:x.name})),cards}],{confirm:'Ativar efeito'});if(!values)return;target=values[0]}await runAction(()=>engine.activate(c.uid,target),{kind:'magic',source:c.uid,target})}
function pulseAt(p,color='#dcbe8c',count=24){if(!p)return;const layer=$('#fxLayer'),ring=document.createElement('div');ring.className='fx-ring';ring.style.cssText=`left:${p.x-40}px;top:${p.y-40}px;--fx-color:${color}`;layer.append(ring);motion(ring,[{transform:'scale(.3) rotate(0)',opacity:0},{opacity:.8,offset:.15},{transform:'scale(2.1) rotate(50deg)',opacity:0}],800).then(()=>ring.remove());if(settings.reduced)return;for(let i=0;i<count;i++){const dot=document.createElement('i'),a=Math.random()*Math.PI*2,d=30+Math.random()*85;dot.className='fx-particle';dot.style.cssText=`left:${p.x}px;top:${p.y}px;--fx-color:${color};width:${i%4===0?2:3}px;height:${i%4===0?12:3}px`;layer.append(dot);motion(dot,[{transform:'translate(0,0) scale(.3)',opacity:0},{opacity:1,offset:.1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-35}px) rotate(${a}rad) scale(.2)`,opacity:0}],600+Math.random()*500).then(()=>dot.remove())}}
function fxLabel(p,text,color='#ead4b0'){if(!p)return;const el=document.createElement('div');el.className='fx-label';el.style.cssText=`left:${p.x}px;top:${p.y}px;color:${color}`;el.textContent=text;$('#fxLayer').append(el);motion(el,[{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 -15px',offset:.2},{opacity:0,translate:'0 -48px'}],1100).then(()=>el.remove())}
async function flyCard(c,from,to,{draw=false,remove=false,ms=580}={}){if(!from||!to)return;const f=document.createElement('div');f.className='flying-card';f.style.cssText=`left:${to.left}px;top:${to.top}px;width:${to.width}px;height:${to.height}px`;f.innerHTML=markup(c)+(draw?back:'');$('#fxLayer').append(f);const dx=from.x-to.x,dy=from.y-to.y,sx=from.width/to.width,sy=from.height/to.height;const rot=remove?-18:draw?22:-8;if(draw){const b=f.querySelector('.card-back');motion(b,[{opacity:1,transform:'rotateY(0)'},{opacity:1,transform:'rotateY(90deg)',offset:.48},{opacity:0,transform:'rotateY(100deg)',offset:.5},{opacity:0}],ms);const front=f.querySelector('.playing-card');motion(front,[{transform:'rotateY(-180deg)'},{transform:'rotateY(-90deg)',offset:.48},{transform:'rotateY(0)'}],ms)}await motion(f,[{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy}) rotate(${rot}deg)`,opacity:1},{transform:`translate(${dx*.25}px,${dy*.35-35}px) scale(1.15) rotate(-4deg)`,opacity:1,offset:.6},{transform:`translate(0,0) scale(${remove?.4:1}) rotate(${remove?15:0}deg)`,opacity:remove?0:1}],ms);f.remove()}
async function effectBeam(from,to){if(!from||!to)return;const beam=document.createElement('div'),len=Math.hypot(to.x-from.x,to.y-from.y);beam.className='fx-beam';beam.style.cssText=`left:${from.x}px;top:${from.y}px;width:${len}px;rotate:${Math.atan2(to.y-from.y,to.x-from.x)}rad`;$('#fxLayer').append(beam);await motion(beam,[{transform:'scaleX(0)',opacity:0},{transform:'scaleX(1)',opacity:1,offset:.6},{transform:'scaleX(1)',opacity:0}],430);beam.remove();pulseAt(to,'#b5a4de',16)}
function changeBadge(p,text,color,coin=false){if(!p)return;const el=document.createElement('div');el.className='card-change'+(coin?' fear-coin':'');el.style.cssText=`left:${p.x}px;top:${p.y-20}px;--change-color:${color}`;el.textContent=text;$('#fxLayer').append(el);return motion(el,settings.reduced?[{opacity:1},{opacity:0}]:[{opacity:0,transform:'translate(-50%,12px) scale(.4)'+(coin?' rotateY(150deg)':'')},{opacity:1,transform:'translate(-50%,-18px) scale(1.15)',offset:.25},{opacity:1,offset:.65},{opacity:0,transform:'translate(-50%,-60px) scale(.9)'}],1400).then(()=>el.remove());}
function animateCardChanges(entry,previous){const c=entry.card,p=rect(nodeFor(c.uid)),old=previous.card,fear=(c.counters?.medo||0)-(old.counters?.medo||0);if(fear){changeBadge(p,(fear>0?'+':'')+fear+' MEDO','#d7a0ef',true);sound(fear>0?'fear':'fearRemove');}
 const changes=['Atk','Def'].map(k=>({key:k.toUpperCase(),delta:c['live'+k]-old['live'+k]})).filter(x=>x.delta);
 changes.forEach((x,i)=>changeBadge({...p,y:p.y+30+i*28},(x.delta>0?'▲ +':'▼ ')+x.delta+' '+x.key,x.delta>0?'#72ee9c':'#ff747c'));
 if(changes.length)sound(changes.some(x=>x.delta<0)?'debuff':'buff');
}
async function animateChanges(before,options={}){const after=snapshot(),jobs=[];const removed=before.field.filter(x=>!after.field.some(y=>y.card.uid===x.card.uid)),arrived=after.field.filter(x=>!before.field.some(y=>y.card.uid===x.card.uid&&y.owner===x.owner&&y.i===x.i));if(options.source){const source=before.field.find(x=>x.card.uid===options.source);if(source){sound('magic');pulseAt(source.rect,'#baa2d9');const effect=source.card.effects?.[0],target=before.field.find(x=>x.card.uid===options.target)?.rect||rect($(effect?.op==='DRAW'?'#deckPile':'#hud'+(effect?.target==='selfPlayer'?before.active:1-before.active)));await effectBeam(source.rect,target);if(options.target)fxLabel(target,effect?.op==='PROTECT'?'PROTEGIDO':'EFEITO ATIVADO','#cebae8')}}for(const old of removed){if(options.combat&&old.card.uid===options.result?.defender?.uid)continue;const r=old.rect;if(!r)continue;const grave=rect($('#gravePile'));if(old.card.kind==='ser'){sound('death');pulseAt(r,'#c2666f',17)}jobs.push(flyCard(old.card,r,grave,{remove:true,ms:480}))}for(const entry of arrived){const node=nodeFor(entry.card.uid),to=rect(node);if(!node||!to)continue;const from=before.rects[entry.card.uid]||before.field.find(x=>x.card.uid===entry.card.uid)?.rect||rect($('#deckPile'));node.style.visibility='hidden';jobs.push((async()=>{sound(entry.card.kind==='ser'?'summon':'set');await flyCard(entry.card,from,to,{ms:entry.card.kind==='ser'?650:500});node.style.visibility='';pulseAt(to,entry.card.kind==='magia'?'#b6a7dc':'#e0c59b',entry.card.kind==='ser'?30:17);fxLabel(to,entry.card.kind==='ser'?'INVOCAÇÃO':entry.card.subtype==='reaction'?'REAÇÃO PREPARADA':'CARTA PREPARADA');await motion(node,[{transform:'translateY(-9px) scale(1.12)',filter:'brightness(1.5)'},{transform:'translateY(0) scale(1)',filter:'brightness(1)'}],350)})())}for(const entry of after.field){const previous=before.field.find(x=>x.card.uid===entry.card.uid);if(!previous)continue;animateCardChanges(entry,previous);const fear=(entry.card.counters?.medo||0)-(previous.card.counters?.medo||0),shield=entry.card.shields-previous.card.shields;if(fear>0||shield>0){const r=rect(nodeFor(entry.card.uid));if(r){const color=fear>0?'#b88bdd':'#a8dae2';pulseAt(r,color,14);fxLabel(r,fear>0?'+'+fear+' MEDO':'+'+shield+' ESCUDO',color)}}}for(const owner of[0,1]){const draws=after.hand[owner].filter(c=>!before.hand[owner].some(x=>x.uid===c.uid)&&!before.field.some(x=>x.card.uid===c.uid));for(let i=0;i<draws.length;i++){const c=draws[i],n=nodeFor(c.uid);jobs.push((async()=>{await delay(i*100);sound('draw');if(n){const to=rect(n);n.style.visibility='hidden';await flyCard(c,rect($('#deckPile')),to,{draw:true});n.style.visibility='';await motion(n,[{filter:'brightness(1.6)'},{filter:'brightness(1)'}],240)}else{const pile=$('#rivalHand');await motion(pile,[{transform:'translateX(-50%) translateY(-8px)'},{transform:'translateX(-50%) translateY(0)'}],350)}})())}const delta=after.sanity[owner]-before.sanity[owner];if(delta){const h=$('#hud'+owner);jobs.push(motion(h,[{filter:`brightness(1.9) drop-shadow(0 0 15px ${delta<0?'#d74055':'#8bbdaa'})`},{filter:'brightness(1)'}],700));fxLabel(rect(h),(delta>0?'+':'')+delta+' SANIDADE',delta<0?'#ee8c8c':'#a8d8b7')}}await Promise.all(jobs)}
async function runAction(fn,options={}){
 if(busy||!started)return null;
 busy=true;
 const before=snapshot();
 let result,ok=false;
 try{
  result=fn();
  ok=true;
  selected=null;
  preview=null;
  render();
  if(options.combat&&result?.attacker)await animateCombat(result);
  await animateChanges(before,{...options,result});
  while(engine.choices.length&&!engine.over){
   const choice=engine.choices[0];
   const selection=await selectEffectChoice(choice);
   const previous=snapshot();
   engine.resolveChoice(selection);
   render();
   await animateChanges(previous);
  }
 }catch(error){toast(error.message);console.warn('Horrorverse:',error.message)}
 finally{busy=false;render()}
 if(!ok)return null;
 if(engine.pending)await resolveReaction();
 if(engine.over)showResult();
 else scheduleAI();
 return result===undefined?true:result;
}
async function resolveReaction(){
 if(!engine.pending)return;const pending=engine.pending,isAttack=pending.kind==='attack';let reaction=null,redirect=null;
 const cards=pending.reactions.map(id=>engine.find(id)?.card).filter(Boolean),cpu=mode==='pvc'&&pending.responder===1;
 if(cpu){const response=new window.HV_Tactics(engine,rival.id,1).reaction();reaction=response.uid||null;redirect=response.redirect||null;}
 else{const values=await choose('Janela de reação',[{label:isAttack?'Resposta ao ataque':'Resposta ao suporte',options:[{value:'pass',label:'Permitir'},...cards.map(c=>({value:c.uid,label:c.name}))]}],{description:isAttack?'O ataque ainda não causou dano. Você pode negar ou desviar usando uma reação preparada.':'Use uma reação preparada para negar a ativação.',confirm:'Resolver reação',cancelLabel:'Permitir'});reaction=values?.[0]&&values[0]!=='pass'?values[0]:null;}
 if(reaction&&engine.find(reaction)?.card.id==='desvio_alvo'){
  const allies=engine.allSer(pending.responder).filter(c=>c.uid!==pending.targetUid);
  if(cpu)redirect=redirect||allies.sort((a,b)=>engine.stat(b,'def')-engine.stat(a,'def'))[0]?.uid;
  else{const values=await choose('Desviar o ataque',[targetField('Novo alvo aliado',allies)],{confirm:'Desviar'});if(values)redirect=values[0];else reaction=null;}
 }
 await runAction(()=>engine.respond(reaction,redirect),isAttack?{combat:true}:{kind:'magic',source:reaction||pending.cardUid,target:pending.targetUid});
}
async function performAttack(attacker,target){if(!canInput())return;return runAction(()=>target===null?engine.attackDirect(attacker):engine.attack(attacker,target),{combat:true})}
async function animateCombat(r){if(!r)return;const overlay=$('#combat'),a=$('#combatAttacker'),d=$('#combatDefender'),number=$('#combatDamage'),shield=$('#combatShield'),slash=$('.combat-slash');const ac={kind:'ser',...engine.find(r.attacker.uid)?.card,...catalogue.find(x=>x.id===r.attacker.id),...r.attacker},dc={kind:'ser',...catalogue.find(x=>x.id===r.defender.id),...r.defender,terror:r.maxTerror,terrorCurrent:r.before};a.innerHTML=markup(ac);d.innerHTML=r.direct?`<div class="sanity-face"><svg><use href="#i-eye"/></svg><b>${r.before} / 10</b><small>SANIDADE DO ADVERSÁRIO</small></div>`:markup(dc);[a,d,number,shield,slash].forEach(el=>{el.getAnimations().forEach(x=>x.cancel());el.style.opacity='';el.style.transform=''});$('#combatTitle').textContent=r.direct?'INVASÃO DA MENTE':'CONFRONTO';$('#combatHealth').style.width=(r.before/r.maxTerror*100)+'%';$('#combatResult').textContent=r.attacker.name+' desafia o abismo';$('#combatStats').textContent=`ATK ${r.atk}  /  ${r.direct?'SANIDADE '+r.before:'DEF '+r.def+' · TERROR '+r.before}`;number.textContent='−'+r.damage;shield.querySelector('span').textContent=r.shielded?'PROTEÇÃO':'BLOQUEIO';overlay.hidden=false;await Promise.all([motion(overlay,[{opacity:0},{opacity:1}],200),motion(a,[{transform:'translateX(-120px) rotateY(55deg) rotate(-14deg)',opacity:0},{transform:'translateX(0) rotateY(0) rotate(-5deg)',opacity:1}],550,{fill:'forwards'}),motion(d,[{transform:'translateX(120px) rotateY(-55deg) rotate(14deg)',opacity:0},{transform:'translateX(0) rotateY(0) rotate(5deg)',opacity:1}],550,{fill:'forwards'})]);await delay(550);sound('attack');motion(a,[{transform:'translateX(0) rotate(-5deg)'},{transform:'translateX(-28px) rotate(-12deg)',offset:.25},{transform:'translateX(85px) rotate(8deg) scale(1.08)',offset:.58},{transform:'translateX(0) rotate(-5deg)'}],570,{fill:'forwards'});await delay(270);if(r.blocked||r.shielded){sound('block');motion(shield,[{opacity:0,transform:'scale(.5)'},{opacity:1,transform:'scale(1.05)',offset:.25},{opacity:1,transform:'scale(1.1)',offset:.7},{opacity:0,transform:'scale(1.4)'}],900);pulseAt(rect(d),'#a8dae2',25);$('#combatResult').textContent=r.blocked?'DEFESA IMPECÁVEL':'O ESCUDO RESISTIU'}else{sound('impact');if(!settings.reduced){motion(slash,[{opacity:1,strokeDashoffset:600},{opacity:1,strokeDashoffset:0,offset:.45},{opacity:0,strokeDashoffset:-200}],360);motion($('.combat-stage'),[{transform:'translate(0)'},{transform:'translate(-7px,4px)'},{transform:'translate(6px,-3px)'},{transform:'translate(-3px,1px)'},{transform:'translate(0)'}],350);motion($('#flash'),[{opacity:0},{opacity:.65,offset:.2},{opacity:0}],400)}pulseAt(rect(d),'#de9b87',25);$('#combatResult').textContent=r.direct?'A SANIDADE SE DESFAZ':'O TERROR SENTE O GOLPE'}if(r.damage>0){motion(d,[{transform:'rotate(5deg)'},{transform:'translate(16px,-4px) rotate(12deg)',filter:'brightness(2)'},{transform:'translate(-8px,2px) rotate(2deg)',filter:'brightness(1)'},{transform:'rotate(5deg)'}],430,{fill:'forwards'});motion(number,[{opacity:0,transform:'translate(-50%,20px) scale(.4)'},{opacity:1,transform:'translate(-50%,-5px) scale(1.2)',offset:.2},{opacity:1,offset:.65},{opacity:0,transform:'translate(-50%,-50px) scale(1)'}],1050);const fill=$('#combatHealth');motion(fill,[{width:100*r.before/r.maxTerror+'%'},{width:100*r.after/r.maxTerror+'%'}],650,{fill:'forwards'});for(let n=r.before-1;n>=r.after;n--){$('#combatStats').textContent=`ATK ${r.atk} / ${r.direct?'SANIDADE':'TERROR'} ${n} → ${r.after}`;if(r.direct)d.querySelector('b').textContent=n+' / 10';await delay(Math.min(70,420/Math.max(1,r.damage)))}}await delay(440);if(r.destroyed){sound('death');$('#combatResult').textContent=r.direct?'A MENTE FOI CONSUMIDA':'DEVOLVIDO AO ABISMO';pulseAt(rect(d),'#d5857c',35);await motion(d,[{opacity:1,transform:'rotate(5deg)',filter:'brightness(1)'},{opacity:1,transform:'scale(1.05) rotate(5deg)',filter:'brightness(2)',offset:.15},{opacity:0,transform:'translateY(30px) scale(.8) rotate(12deg)',filter:'blur(8px) brightness(.3)'}],650,{fill:'forwards'})}$('#combatStats').textContent=`${r.direct?'SANIDADE':'TERROR'} ${r.after} / ${r.maxTerror}  ·  ${r.blocked?'SEM DANO':r.damage+' DE DANO'}`;await delay(650);await motion(overlay,[{opacity:1},{opacity:0}],250);overlay.hidden=true;[a,d,number,shield,slash,$('#combatHealth')].forEach(el=>el.getAnimations().forEach(x=>x.cancel()))}
function turnBanner(){const b=$('#turnBanner');$('#turnMain').textContent=mode==='pvc'?(engine.active===0?'Sua vez':rival.name+' desperta'):'Vez do Jogador '+(engine.active+1);$('#turnSub').textContent=`RODADA ${Math.ceil(engine.turn/2)} · ${engine.turn<=2?'PROTEÇÃO INICIAL ATIVA':'PREPARE SEU PRÓXIMO MOVIMENTO'}`;b.classList.add('show');clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>b.classList.remove('show'),duration(1450));sound('turn')}
async function endTurn(internal=false){if(!internal&&!canInput())return;await runAction(()=>engine.endTurn(),{kind:'turn'});if(!engine.over)turnBanner()}
async function beginMatch(nextMode=mode){if(busy)return;unlockAudio();epoch++;mode=nextMode;started=true;lastResult=null;selected=null;preview=null;view=0;busy=true;engine.setDecks(deck,mode==='pvc'?rival.deck:randomDeck());resetDuelMusic();$('#resultDialog').close();$('#menuRoot').hidden=true;$('#duel').hidden=false;updateMusic();$('#resumeGame').hidden=false;$('#hand').replaceChildren();for(const row of $$('.board-row'))row.style.gridRow=Number(row.dataset.owner)===0?(row.dataset.lane==='ser'?4:5):(row.dataset.lane==='ser'?2:1);$('#fxLayer').replaceChildren();render();const cards=engine.p(0).hand;const jobs=cards.map((c,i)=>(async()=>{const n=nodeFor(c.uid);if(!n)return;const to=rect(n);n.style.visibility='hidden';await delay(i*65+(i>=engine.cfg.initialHandSize?480:0));sound('draw');await flyCard(c,rect($('#deckPile')),to,{draw:true,ms:520});n.style.visibility='';})());await Promise.all(jobs);busy=false;render();turnBanner()}
window.hvMenu.onStart=beginMatch;
function openMenu(screen='home'){if(busy)return;selected=null;preview=null;$('#menuRoot').hidden=false;$('#duel').hidden=true;showScreen(screen);updateMusic();$('#resumeGame').hidden=!started;sound()}
function resume(){if(!started)return;$('#menuRoot').hidden=true;$('#duel').hidden=false;render();updateMusic();sound();scheduleAI()}
$('#menuInGame').onclick=()=>openMenu();$('#resumeGame').onclick=resume;$('#rulesInGame').onclick=()=>openMenu('rules');$('#end').onclick=()=>endTurn();
$('#reset').onclick=async()=>{if(!canInput()&&!(started&&!busy&&!engine.pending))return;const yes=await choose('Preparar outra mesa?',[],{description:'O duelo atual será encerrado e as cartas serão embaralhadas novamente.',confirm:'Reiniciar duelo'});if(yes)beginMatch(mode)};
$('#logToggle').onclick=()=>{const log=$('#log');log.hidden=!log.hidden;$('#logToggle').setAttribute('aria-expanded',String(!log.hidden))};
function showResult(){if(!engine.over||lastResult===engine.over)return;lastResult=engine.over;stopMusic();sound('victory');$('#resultTitle').textContent=mode==='pvc'?(engine.over.winner===0?'Você venceu o medo.':rival.name+' venceu.'):('Jogador '+(engine.over.winner+1)+' venceu.');$('#resultReason').textContent=engine.over.reason==='loucura'?'A última centelha de sanidade se apagou.':'Nenhum ser do adversário restou para contar a história.';$('#resultDialog').showModal();pulseAt({x:innerWidth/2,y:innerHeight*.42},'#d7b27b',45)}
$('#playAgain').onclick=()=>{$('#resultDialog').close();beginMatch(mode)};$('#resultMenu').onclick=()=>{$('#resultDialog').close();openMenu()};
async function awaitTable(token){while(token===epoch&&!$('#menuRoot').hidden)await new Promise(r=>setTimeout(r,120));return token===epoch&&!engine.over}
function scheduleAI(){if(mode!=='pvc'||!started||engine.active!==1||engine.over||engine.pending||busy||aiRunning||!$('#menuRoot').hidden)return;const token=epoch;aiRunning=true;setTimeout(async()=>{try{await computerTurn(token)}catch(e){console.warn('IA:',e);toast('O adversário encerrou sua jogada.');if(token===epoch&&!engine.over&&engine.active===1&&!engine.pending&&!busy)await runAction(()=>engine.endTurn())}finally{aiRunning=false;if(token===epoch){render();scheduleAI()}else scheduleAI()}},duration(700))}
async function computerTurn(token){
 const ready=async()=>await awaitTable(token)&&mode==='pvc'&&engine.active===1;
 for(let n=0;n<45&&await ready();n++){
  const ai=new window.HV_Tactics(engine,rival.id,1),action=ai.best();if(!action)break;
  await delay(320);if(!await ready())return;
  const before=engine.log[0];const result=await runAction(()=>ai.apply(engine,action),{combat:action.kind==='attack',source:['activate','ability'].includes(action.kind)?action.uid:null,target:action.target});
  if(result===null&&before===engine.log[0])break;
 }
 if(await ready())await endTurn(true);
}
window.addEventListener('resize',()=>{if(started&&!busy)renderHand()});
function renderRivals(){const holder=$('#rivalChoices');holder.replaceChildren();for(const r of window.HV_RIVALS){const b=document.createElement('button');b.className='rival-option'+(r===rival?' selected':'');b.setAttribute('aria-pressed',String(r===rival));b.innerHTML=`<img src="assets/cpu/${r.id}.webp" alt="${esc(r.name)}"><span class="rival-level">${r.level}</span><h3>${r.name}</h3><strong>${r.style}</strong><p>${r.description}</p>`;b.onclick=()=>{rival=r;renderRivals();sound()};holder.append(b)}$('#startPVC span').textContent='DESAFIAR '+rival.name.toUpperCase();}
renderRivals();
window.HV_LAN_UI={choose,sound,audio(active){const was=window.HV_LAN_ACTIVE;window.HV_LAN_ACTIVE=active;if(active){unlockAudio();if(!was)resetDuelMusic();}else stopMusic();}};
createBoard();applySettings();updateDeckCount();
/* Small, read-only diagnostics for reporting state without changing the rules. */
window.hvPresentation={get busy(){return busy},get mode(){return mode},get version(){return'2.2'},get rival(){return rival.id},get selected(){return selected}};
})();
