/* HORRORVERSE Alpha 0.5 — Deck Builder bridge (no card editing) */
(function(root){'use strict';
const DRAFT='horrorverse.builder.draft.v05';
const catalogue=root.HV_DATA.CARD_LIBRARY;
const conversion=c=>c.kind==='ser'?(c.rarity==='comum'?'common':'special'):(c.kind==='item'?'item':'magic');
const toView=c=>({id:c.id,name:c.name,type:conversion(c),subtype:c.subtype||'',packRarity:root.HV_PROGRESS.rarity(c),cardSubtype:c.cardSubtype||'',affinity:c.affinity||'',atk:c.atk??0,def:c.def??0,terror:c.terror??0,periculosidade:c.periculosidade,condition:c.summon?Object.entries(c.summon).filter(([k])=>!['sacrificeAffinity','sacrificeMinimum','discardKind','serFearOnly'].includes(k)).map(([k,v])=>({discard:`Descarte ${v} ${c.summon.discardKind==='item'?'Item(ns)':'carta(s)'} da mão`,sacrifices:`Sacrifique ${v} Ser(es) aliado(s)${c.summon.sacrificeAffinity?' (pelo menos '+c.summon.sacrificeMinimum+' '+c.summon.sacrificeAffinity+')':''}`,banish:`Bana ${v} Ser(es) do descarte`,sanity:`Perca ${v} Sanidade`,onlyBy:`Somente pelo efeito de ${catalogue.find(card=>card.id===v)?.name}`,items:`Consuma ${v} Item(ns) aliado(s)`,spells:`Consuma ${v} Magia(s) aliada(s)`,fearSpend:`Remova ${v} Contadores de Medo`,fearRequired:`Tenha ${v} Contadores de Medo no campo`,zeroAllyDef:'Zere a DEF de 1 Ser aliado até o fim do turno'}[k]||`${k}: ${v}`)).join(' + '):'',effect:c.text||'',art:c.art||'',emoji:c.emoji||'🎴'});
const read=key=>{try{return JSON.parse(localStorage.getItem(key))}catch{return null}};
const store=(key,obj)=>{try{localStorage.setItem(key,JSON.stringify(obj));return true}catch{return false}};
const valid=root.HV_DATA.validDeck;
const progress=root.HV_PROGRESS;
const inventory=()=>{
 const p=progress.profile();
 return {packs:p.packs,owned:progress.collection(p),discoveries:p.discoveries||{}};
};
let overlay=null,frame=null,opener=null;
function send(){
 if(!frame?.contentWindow)return;
 const saved=root.hvMenu?.getDeck()||[],raw=read(DRAFT),stock=inventory();
 const draft=valid(raw?.deck,{draft:true})?raw.deck:null;
 const ownedCards=catalogue.filter(c=>stock.owned[c.id]>0).map(toView);
 frame.contentWindow.postMessage({source:'hv-game',action:'init',reduced:root.hvMenu.reduced(),cards:ownedCards,starter:root.HV_DATA.DEFAULT_DECK,...stock,deck:saved,draft},'*');
}
function open(){overlay=document.getElementById('hvEditorOverlay');frame=document.getElementById('hvEditorFrame');opener=document.activeElement;overlay.hidden=false;frame.focus();send()}
function close(){if(!overlay)return;overlay.hidden=true;root.hvMenu?.show('home');opener?.focus?.()}
root.HV_EDITOR={open,close,validDeck:valid};
window.addEventListener('message',e=>{if(!frame||e.source!==frame.contentWindow||e.data?.source!=='hv-builder')return;
 const m=e.data;
 if(m.action==='sound'&&['tear','discover','inspect','remove'].includes(m.kind)){root.hvMenu.sound(m.kind);return;}
 if(m.action==='ready'){send();return}
 if(m.action==='markSeen'){
  try{progress.markSeen(m.id);}catch(error){console.warn(error.message);}
  return;
 }
 if(m.action==='openPack'){
  try{const results=progress.open(m.type).map(c=>({...toView(c),isNew:c.isNew}));
   frame.contentWindow.postMessage({source:'hv-game',action:'packResult',type:m.type,results,...inventory()},'*');
  }catch(error){frame.contentWindow.postMessage({source:'hv-game',action:'packResult',error:error.message},'*');}
  return;
 }
 if(m.action==='close'){
  if(valid(m.draft,{draft:true}))store(DRAFT,{deck:m.draft});
  close();return;
 }
 if(m.action!=='save')return;
 if(!valid(m.deck)||!progress.ownsDeck(m.deck)){document.getElementById('hvEditorStatus').textContent='Baralho inválido; nada foi salvo.';return}
 root.hvMenu?.setDeck(m.deck);const ok=store('horrorverse.deck.v1',m.deck);store(DRAFT,{deck:m.deck});
 document.getElementById('hvEditorStatus').textContent=ok?'✓ Baralho salvo. Pronto para jogar!':'Baralho aplicado nesta sessão; armazenamento do navegador indisponível.';
});
})(window);