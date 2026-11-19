(function(){
'use strict';
const $=id=>document.getElementById(id);
const {esc}=HV_UI,P=HV_PROGRESS;
const image='assets/progression/';
const format=n=>n.toLocaleString('pt-BR');
const greeter='Escolha um pacote nos ganchos. Cinco cartas em cada… e todo Rubédio é bem-vindo.';
let shownChain=0,chainTimer=null,match=null,selected=HV_BOOSTERS.packs[0];
let frame=0,checkout=null;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduced-motion');
function wallet(){
 const p=P.profile();
 $('walletValue').textContent=format(p.balance);
 if(!frame)$('shopBalance').textContent=format(p.balance);
}
function selectPack(pack){
 selected=pack;
 $('packPreview').src=pack.art;
 if(!reduced())$('packPreview').animate([{opacity:.5,transform:'translateY(4px) rotate(-2deg)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
 $('inspectPack').textContent='Ver as '+pack.cards.length+' cartas possíveis';
 $('shopError').textContent='';
 $('selectedPack').textContent=pack.name;
 $('packDescription').textContent=pack.description;
 for(const button of $('shopPacks').children)button.setAttribute('aria-pressed',String(button.dataset.pack===pack.id));
 quote();
}
for(const pack of HV_BOOSTERS.packs){
 const button=document.createElement('button');
 button.type='button';button.className='shop-pack';button.dataset.pack=pack.id;
 button.innerHTML=`<img class="booster-wrapper" src="${pack.art}" alt=""><span><b>${esc(pack.name)}</b><small>${pack.size} cartas · ${format(pack.price)} Rubédio</small></span>`;
 button.onclick=()=>{selectPack(pack);window.hvMenu.sound('inspect');};
 $('shopPacks').append(button);
}
const catalogue=new Map(HV_DATA.CARD_LIBRARY.map(card=>[card.id,card]));
$('inspectPack').onclick=()=>{
 $('packContentsTitle').textContent=selected.name;
 $('packContentsCount').textContent=selected.cards.length+' cartas possíveis · 5 por pacote';
 $('possiblePulls').innerHTML=selected.cards.map(id=>catalogue.get(id)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(card=>
  '<li><img loading="lazy" src="'+esc(card.art)+'" alt=""><span>'+esc(card.name)+'</span></li>').join('');
 $('packContents').showModal();window.hvMenu.sound('inspect');
};
$('goOpenPacks').onclick=()=>window.hvMenu.show('builder');
const sellerHappy=new Image();
sellerHappy.src=image+'vendor-sale.webp';
function shop(){
 $('shopScreen').hidden=false;
 $('goOpenPacks').hidden=!Object.values(P.profile().packs).some(n=>n>0);
 $('shopVendor').src=image+'vendor.webp';
 $('shopVendor').classList.remove('sale');
 $('vendorLine').textContent=greeter;
 $('shopCount').value='1';
 $('shopError').textContent='';
 selectPack(HV_BOOSTERS.packs[0]);wallet();$('shopBack').focus();
}
function closeShop(){
 $('shopScreen').hidden=true;
 if($('confirmPurchase').open)$('confirmPurchase').close();
 cancelAnimationFrame(frame);frame=0;
 $('shopParticles').replaceChildren();
}
function leaveShop(){window.hvMenu.show('home');}
$('shopBack').onclick=leaveShop;
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!$('shopScreen').hidden&&!$('confirmPurchase').open&&!$('packContents').open&&!e.defaultPrevented){e.preventDefault();leaveShop();}
});
function quote(){
 const count=$('shopCount').valueAsNumber;
 const valid=Number.isInteger(count)&&count>=1&&count<=99;
 $('shopTotal').textContent=valid?format(count*selected.price)+' Rubédio':'Selecione de 1 a 99 pacotes';
 const missing=valid?Math.max(0,count*selected.price-P.profile().balance):0;
 $('shopConfirm').disabled=!valid||missing>0;
 $('shopConfirm').title=missing?'Saldo insuficiente':'';
 $('shopError').textContent=missing?'Faltam '+format(missing)+' Rubédios para essa compra.':'';
 $('shopMinus').disabled=count<=1;
 $('shopPlus').disabled=count>=99;
}
$('shopCount').oninput=quote;
for(const [id,delta] of [['shopMinus',-1],['shopPlus',1]])$(id).onclick=()=>{
 const input=$('shopCount');
 input.value=String(Math.min(99,Math.max(1,(Math.trunc(input.valueAsNumber)||1)+delta)));quote();
};
$('buyPack').onsubmit=e=>{
 e.preventDefault();
 $('shopError').textContent='';
 const count=$('shopCount').valueAsNumber;
 if(!Number.isInteger(count)||count<1||count>99)return;
 if(count*selected.price>P.profile().balance){$('shopError').textContent='Rubédio insuficiente para essa compra.';return;}
 checkout={pack:selected,count};$('checkoutArt').src=selected.art;
 $('purchaseText').textContent=`${count} × ${selected.name} por ${format(count*selected.price)} Rubédio. Abra os pacotes no Deck Builder.`;
 $('confirmPurchase').showModal();
};
function saleAnimation(before,after){
 const balance=$('shopBalance');
 const visible=Number(balance.textContent.replace(/\D/g,''));
 cancelAnimationFrame(frame);frame=0;
 if(reduced()){balance.textContent=format(after);return;}
 const from=Math.max(before,visible);
 const start=performance.now();
 const tick=now=>{
  const t=Math.min(1,(now-start)/950);
  balance.textContent=format(Math.round(after+(from-after)*(1-t)**2));
  frame=t<1?requestAnimationFrame(tick):0;
 };
 frame=requestAnimationFrame(tick);
 const layer=$('shopParticles'),target=$('shopRegister').getBoundingClientRect();
 layer.replaceChildren();
 for(let i=0;i<12;i++){
  const gem=document.createElement('img');
  gem.src=image+'rubedio.webp';gem.alt='';gem.className='falling-rubedio';
  gem.style.left=`${target.left+target.width*(.1+.8*Math.random())}px`;
  gem.style.top=`${target.top-145-Math.random()*95}px`;
  gem.style.setProperty('--drop',`${145+Math.random()*125}px`);
  gem.style.setProperty('--drift',`${-33+Math.random()*66}px`);
  gem.style.setProperty('--spin',`${-200+Math.random()*400}deg`);
  gem.style.animationDelay=i*29+'ms';
  gem.addEventListener('animationend',()=>gem.remove(),{once:true});
  layer.append(gem);
 }
}
$('purchaseYes').onclick=async()=>{
 if(!checkout)return;
 const {pack,count}=checkout;checkout=null;
 $('purchaseYes').disabled=true;
 try{
  const before=P.profile().balance;
  const after=(await P.buy(pack.id,count)).balance;
  $('confirmPurchase').close();
  saleAnimation(before,after);wallet();quote();$('goOpenPacks').hidden=false;window.hvMenu.sound('purchase');
  const vendor=$('shopVendor');
  vendor.src=sellerHappy.src;vendor.classList.remove('sale');void vendor.offsetWidth;vendor.classList.add('sale');
  $('vendorLine').textContent='Ah, o brilho do Rubédio… Volte sempre. De preferência com os bolsos cheios.';
  $('shopError').textContent=`${count} ${count===1?'pacote disponível':'pacotes disponíveis'} no Deck Builder.`;
 }catch(error){$('confirmPurchase').close();$('shopError').textContent=error.message;}finally{$('purchaseYes').disabled=false;}
};
$('purchaseNo').onclick=()=>$('confirmPurchase').close();
$('confirmPurchase').addEventListener('close',()=>{checkout=null;});
function statsHTML(result,full=false){
 const s=result?.stats,rows=result?.rows||[];
 const lines=(full?rows:rows.slice().sort((a,b)=>b.points-a.points).slice(0,3));
 return `<ul class="bonus-lines">${lines.map(r=>`<li><span>${esc(r.label)}</span><b>+${r.points}</b></li>`).join('')}</ul>${full&&s?`<dl class="duel-details">${[
  ['Dano ao TERROR inimigo',s.terrorDamage],['Dano à Sanidade inimiga',s.sanityDamage],['Sanidade perdida',s.lost],['Sanidade curada',s.healed],
  ['Feitiços resolvidos',s.spells],['Feitiços tentados',s.spellAttempts],['Itens resolvidos',s.items],['Itens tentados',s.itemAttempts],['Cartas compradas',s.draws],['Compras num turno',s.peakDraw],
  ['Maior corrente de ×3 ou mais',s.chain>=3?s.chain:'—'],['Cartas com efeito marcante',s.important.join(', ')||'—']
 ].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}`;
}
function showHistory(){
 const all=P.profile().history;
 $('historyList').innerHTML=all.length?all.map(r=>`<details><summary>${esc(r.id==='tutorial'?'Tutorial':r.mode)} · +${format(r.total)} Rubédio</summary>${statsHTML(r,true)}</details>`).join(''):'<p>Conclua um duelo para registrar sua pontuação aqui.</p>';
}
let rewardSerial=0;
async function showReward(engine,seat,mode){
 const serial=++rewardSerial;
 const won=engine.over.winner===seat&&engine.over.reason!=='abandono';
 const stats=engine.stats?.[seat];
 let result=null;
 $('rewardPanel').hidden=false;$('rewardTotal').textContent='Salvando…';$('rewardBreakdown').replaceChildren();$('rewardDetails').hidden=true;
 try{
 if(mode==='Tutorial'){
  if(won)result=await P.completeTutorial();
 }else if(won&&stats){
  result=await P.award(engine.duelId+':'+seat,P.score(stats,engine.p(seat).sanity),stats,mode,engine.p(seat).sanity);
 }
 }catch(error){
 if(serial!==rewardSerial)return null;
 $('rewardTotal').textContent='Recompensa pendente';
 $('rewardBreakdown').textContent=error.message;
 $('rewardDetails').hidden=false;$('rewardDetails').textContent='Tentar salvar novamente';
 $('rewardDetails').onclick=()=>showReward(engine,seat,mode);return null;
 }
 if(serial!==rewardSerial)return null;
 $('rewardDetails').textContent='Ver estatísticas';
 $('rewardPanel').hidden=!result;
 if(result){
  $('rewardTotal').textContent='+'+format(result.total)+' Rubédio';
  $('rewardBreakdown').innerHTML=statsHTML(result);
  $('rewardDetails').onclick=()=>{$('rewardBreakdown').innerHTML=statsHTML(result,true);$('rewardDetails').hidden=true;};
  $('rewardDetails').hidden=false;
 }
 wallet();return result;
}
function chain(engine){
 if(match!==engine.duelId){match=engine.duelId;shownChain=0;clearTimeout(chainTimer);$('chainNotice').hidden=true;}
 const events=engine.chainEvents?.filter(e=>e.id>shownChain)||[];
 if(!events.length)return;
 shownChain=events.at(-1).id;
 clearTimeout(chainTimer);
 const notice=$('chainNotice'),steps=events.slice(-12);
 const show=()=>{
  if(!steps.length){chainTimer=setTimeout(()=>{notice.hidden=true;},850);return;}
  notice.textContent='Efeito em Corrente ×'+steps.shift().count;
  notice.hidden=false;chainTimer=setTimeout(show,210);
 };
 show();
}
function tutorial(){
 const claimed=P.profile().tutorial;
 $('tutorialReward').textContent=claimed?'Recompensa de 1.000 Rubédios já resgatada. Você pode repetir o tutorial à vontade.':'Ganhe 1.000 Rubédios na primeira conclusão.';
 $('startTutorial').textContent=claimed?'Repetir tutorial':'Começar tutorial';
}
function story(){
 const complete=P.profile().tutorial;
 $('storyScene').style.backgroundImage=`linear-gradient(0deg,#120b11d9,#140c1644),url("${image+(complete?'resistance':'city')}.webp")`;
 $('storyTitle').textContent=complete?'A Resistência':'Depois da Convergência';
 $('storySpeaker').textContent=complete?'Líder dos Remanescentes':'Sobrevivente';
 $('storyFace').src=image+(complete?'leader':'mentor')+'.webp';
 $('storyLine').textContent=complete?'Entre. Se conseguiu chegar até aqui, já aprendeu o suficiente pra começar.':'A cidade caiu. A Resistência fica logo adiante, mas antes preciso ver se você sabe sobreviver a um duelo.';
 $('storyNext').hidden=!complete;$('storyShop').hidden=!complete;
 $('storyStart').textContent=complete?'Repetir tutorial':'Começar tutorial';
}
$('storyNext').onclick=()=>{
 const engineer=$('storySpeaker').textContent==='Engenheira do Refúgio';
 $('storyFace').src=image+(engineer?'leader':'engineer')+'.webp';
 $('storySpeaker').textContent=engineer?'Líder dos Remanescentes':'Engenheira do Refúgio';
 $('storyLine').textContent=engineer?'O Rubédio ajuda a consertar o que sobrou. Dá uma passada no balcão antes de voltar lá pra fora.':'As luzes ainda funcionam. Se encontrar mais cristais de Rubédio, traga pra cá. A gente usa isso pra recuperar quase tudo.';
};
$('storyStart').onclick=()=>hvMenu.onStart('tutorial');
window.addEventListener('storage',wallet);
window.HV_PROGRESSION_UI={wallet,shop,closeShop,story,tutorial,showHistory,showReward,chain};
wallet();
})();
