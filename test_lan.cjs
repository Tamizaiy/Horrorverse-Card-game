const assert=require('node:assert/strict'),{EventEmitter}=require('node:events');const {startServer,rooms,sessions,state,command}=require('./lan-server/server.cjs');require('./ai.js');
const server=startServer({origin:'https://horrorverse.netlify.app',listen:false});
class Socket extends EventEmitter{constructor(){super();this.writes=[];this.destroyed=false;}write(b){this.writes.push(b);return true;}end(b){if(b)this.write(b);this.destroyed=true;this.emit('close');}destroy(){this.end();}}
function packet(m){const body=Buffer.from(JSON.stringify(m)),mask=Buffer.from([1,4,2,8]);let h;if(body.length<126)h=Buffer.from([129,128|body.length]);else{h=Buffer.alloc(4);h[0]=129;h[1]=254;h.writeUInt16BE(body.length,2);}const payload=Buffer.from(body);for(let i=0;i<payload.length;i++)payload[i]^=mask[i%4];return Buffer.concat([h,mask,payload]);}
function messages(s){return s.writes.filter(Buffer.isBuffer).filter(b=>(b[0]&15)===1).map(b=>{const n=b[1]&127,offset=n===126?4:n===127?10:2;return JSON.parse(b.subarray(offset).toString());});}
function connect(origin='https://horrorverse.netlify.app'){const s=new Socket();server.emit('upgrade',{url:'/lan',headers:{origin,host:'192.168.1.10:3000','sec-websocket-version':'13','sec-websocket-key':'dGhlIHNhbXBsZSBub25jZQ=='}},s);return s;}
let serial=0;function send(s,msg){const id=++serial;s.emit('data',packet({id,version:'2.2',...msg}));const reply=messages(s).find(m=>m.id===id);assert(reply,'Server must acknowledge');return reply;}
const bad=connect('https://untrusted.example');assert(bad.destroyed);assert(String(bad.writes[0]).includes('403'));
const a=connect(),b=connect();assert(String(a.writes[0]).includes('101 Switching Protocols'));const created=send(a,{action:'create',name:'Alice'});assert(created.ok);const aToken=created.result.token;const code=messages(a).find(m=>m.type==='state').code;
assert(send(b,{action:'join',name:'Bruno',code}).ok);const room=rooms.get(code),ma=room.members[0],mb=room.members[1];
assert(!send(connect(),{action:'join',name:'Terceiro',code}).ok);
assert(!send(a,{action:'ready',ready:true,deck:['invalid']}).ok);assert.equal(ma.ready,false);
const deck=HV_RIVALS[0].deck;assert(send(a,{action:'ready',ready:true,deck}).ok);assert(!room.game);assert(send(b,{action:'ready',ready:true,deck:HV_RIVALS[1].deck}).ok);assert(room.game);
// Both clients receive their seat and only their own hidden hand identities.
const sa=state(room,0),sb=state(room,1);assert(sa.players[0].hand.every(c=>c.name));assert(sa.players[1].hand.every(c=>c.hidden&&!c.id&&!c.name));assert(sb.players[0].hand.every(c=>c.hidden));assert(sa.players.every(p=>p.deck.every(c=>c.hidden&&!c.id)));assert(!('deckLists' in sa));
const rev=room.revision;assert(!send(b,{action:'end',revision:rev}).ok);assert.equal(room.revision,rev);assert(send(a,{action:'end',revision:rev}).ok);assert.equal(room.game.active,1);assert(!send(a,{action:'end',revision:rev}).ok);
// Dropping a socket pauses the duel. The session token restores the same seat.
a.destroy();assert.equal(ma.ws,null);assert(!send(b,{action:'end',revision:room.revision}).ok);const ar=connect();assert(send(ar,{action:'resume',token:aToken}).ok);assert.equal(ma.ws.member,ma);
// Resolve actual engine choices and server-validated moves through both seats.
let moves=0;for(let i=0;i<65&&!room.game.over;i++){
 const g=room.game,c=g.choices[0];if(c){const seat=c.actor;command(room.members[seat],{action:'choice',revision:room.revision,args:[new HV_Tactics(g,'guardia',seat).choice(c)]});continue;}
 if(g.pending){const seat=g.pending.responder,r=new HV_Tactics(g,'guardia',seat).reaction();command(room.members[seat],{action:'respond',revision:room.revision,args:[r.uid,r.redirect]});continue;}
 const seat=g.active,ai=new HV_Tactics(g,seat?'guardia':'carrasco',seat),action=ai.best();let wire;if(!action)wire={action:'end',args:[]};else{const map={place:'play',activate:'activate',ability:'ability',attack:action.target?'attack':'direct'};wire={action:map[action.kind],args:action.kind==='place'?[action.uid,action.slot,action.opts]:action.kind==='ability'?[action.uid,action.target,action.costs]:[action.uid,action.target]};}command(room.members[seat],{...wire,revision:room.revision});moves++;
}
// Opponent choices contain no card options; only the chooser gets a private reveal.
const g=room.game;g.over=null;g.choices=[];g.pending=null;g.active=0;g.pick({name:'Reveal'},0,'Mão revelada',g.p(1).hand,0,0,()=>{});assert(state(room,1).choices[0].waiting);assert(state(room,0).choices[0].options.every(o=>o.card.name));g.choices=[];
assert(send(ar,{action:'leave'}).ok);assert.equal(room.game.over.winner,1);assert(!sessions.has(aToken));server.close();
console.log('OK: actual WebSocket handshake/frames, room lifecycle, decks, masked hands/decks, turn/revision validation, disconnect/rejoin, private choices and '+moves+' validated moves. Transport exercised in memory.');
