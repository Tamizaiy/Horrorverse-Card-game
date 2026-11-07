/* HORRORVERSE 2.2 LAN. Node built-ins only; server is the only rules authority. */
const http=require('node:http'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
require('../cards.js');require('../engine.js');require('../expansion.js');
const VERSION='2.2',rooms=new Map(),sessions=new Map();
const key=()=>crypto.randomBytes(24).toString('hex');
function serializeChoice(c){if(!c)return null;const {done,ai,...publicChoice}=c;return JSON.parse(JSON.stringify(publicChoice));}
function state(room,seat){const g=room.game;if(!g)return null;const players=g.players.map((p,i)=>({...p,hand:i===seat?p.hand:p.hand.map((_,n)=>({uid:'hidden-hand-'+n,hidden:true})),deck:p.deck.map((_,n)=>({uid:'hidden-deck-'+i+'-'+n,hidden:true}))}));const choice=g.choices[0];return {players,turn:g.turn,active:g.active,over:g.over,pending:g.pending,log:g.log,cfg:g.cfg,fieldOrder:g.fieldOrder,fearAuras:[...g.fearAuras],choices:choice?[choice.actor===seat?serializeChoice(choice):{actor:choice.actor,waiting:true}]:[]};}
function envelope(room,seat){return {type:'state',version:VERSION,code:room.code,seat,revision:room.revision,players:room.members.map(m=>m?{name:m.name,ready:m.ready,connected:!!m.ws}:null),started:!!room.game,paused:room.members.some(m=>!m||!m.ws),state:state(room,seat)};}
function publish(room){for(const m of room.members)if(m?.ws)m.ws.send(envelope(room,m.seat));}
function command(member,msg){const room=member.room,g=room.game;room.touched=Date.now();
 if(msg.action==='ready'){if(g)throw Error('Duelo já iniciado.');if(!HV_DATA.validDeck(msg.deck))throw Error('Escolha um deck de 20–30 cartas, até 2 cópias.');member.ready=!!msg.ready;member.deck=msg.deck.slice();if(room.members.every(m=>m?.ready&&m.ws)){room.game=new HorrorverseEngine({deferChoices:true});room.game.setDecks(room.members[0].deck,room.members[1].deck);}room.revision++;return;}
 if(!g)throw Error('Aguarde os dois jogadores confirmarem os decks.');
 if(room.members.some(m=>!m?.ws))throw Error('Duelo pausado: aguarde a reconexão do outro jogador.');
 if(msg.revision!==room.revision)throw Error('A mesa mudou. Tente novamente.');
 const a=msg.action,args=msg.args||[];if(!Array.isArray(args)||args.length>4)throw Error('Comando inválido.');
 if(g.over)throw Error('Duelo encerrado. Saia para criar outra sala.');
 if(g.choices.length){if(a!=='choice'||g.choices[0].actor!==member.seat)throw Error('Aguarde a escolha pendente.');return finish(g.resolveChoice(args[0]));}
 if(g.pending){if(a!=='respond'||g.pending.responder!==member.seat)throw Error('Aguarde a reação.');if(args[0]&&!g.pending.reactions.includes(args[0]))throw Error('Reação inválida.');return finish(g.respond(...args));}
 if(g.active!==member.seat)throw Error('Aguarde seu turno.');
 const methods={play:'placeFromHand',activate:'activate',ability:'activateSer',attack:'attack',direct:'attackDirect',end:'endTurn'};if(!methods[a])throw Error('Ação inválida.');
 return finish(g[methods[a]](...args));
 function finish(result){room.revision++;return result;}
}
function attach(ws,msg){if(msg.version!==VERSION)throw Error('Atualize o jogo e o servidor para o Patch 2.2.');
 if(msg.token){const m=sessions.get(msg.token);if(!m||!rooms.has(m.room.code))throw Error('Sessão expirada. Entre em uma sala novamente.');if(m.ws&&m.ws!==ws)m.ws.close();m.ws=ws;ws.member=m;m.room.touched=Date.now();publish(m.room);return {token:m.token};}
 const name=String(msg.name||'Jogador').trim().slice(0,28)||'Jogador';let room,seat;
 if(msg.action==='create'){if(rooms.size>=100)throw Error('Servidor cheio.');let code;do{code=crypto.randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));room={code,members:[null,null],revision:0,game:null,touched:Date.now()};rooms.set(code,room);seat=0;}
 else if(msg.action==='join'){room=rooms.get(String(msg.code||'').toUpperCase());if(!room)throw Error('Sala não encontrada.');if(room.game)throw Error('Duelo já iniciado.');seat=room.members.findIndex(m=>!m);if(seat<0)throw Error('Sala cheia.');}
 else throw Error('Conecte-se à sala primeiro.');
 const m={name,seat,token:key(),ws,room,ready:false,deck:null};room.members[seat]=m;sessions.set(m.token,m);ws.member=m;room.revision++;publish(room);return {token:m.token};
}
function leave(ws){const m=ws.member;if(!m)return;const r=m.room;sessions.delete(m.token);r.members[m.seat]=null;ws.member=null;if(r.game){r.game.over={winner:1-m.seat,reason:'abandono'};r.game.info(m.name+' saiu do duelo.');}if(!r.members.some(Boolean))rooms.delete(r.code);else {r.revision++;publish(r);}}
function startServer({port=Number(process.env.PORT)||3000,host='0.0.0.0',origin=process.env.HV_NETLIFY_ORIGIN||'',listen=true}={}){
 const allowedOrigin=origin?new URL(origin).origin:'';
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({game:'Horrorverse',version:VERSION}));return;}
 // Offline fallback serves the same client from this computer. Never exposes server files.
 let file;try{file=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}if(file==='/')file='/index.html';const root=path.resolve(__dirname,'..'),full=path.resolve(root,'.'+file);
 if(!full.startsWith(root+path.sep)||file.includes('lan-server')||!/^\/(assets\/[^?]+|[\w.-]+\.(html|css|js))$/.test(file)){res.writeHead(404);return res.end();}
 fs.stat(full,(e,st)=>{if(e||!st.isFile()){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.wav':'audio/wav'})[path.extname(full)]||'application/octet-stream'});fs.createReadStream(full).pipe(res);});});
 server.on('upgrade',(req,socket)=>{
  const origin=req.headers.origin||'';let local=false;try{const o=new URL(origin);local=o.protocol==='http:'&&o.host===req.headers.host;}catch{}
  if(req.url!=='/lan'||(!local&&origin!==allowedOrigin)||req.headers['sec-websocket-version']!=='13'||!req.headers['sec-websocket-key']){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
  const accept=crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  const ws={member:null,send(value){if(!socket.destroyed)socket.write(frame(1,Buffer.from(JSON.stringify(value))));},close(){socket.end(frame(8,Buffer.alloc(0)));}};let buffer=Buffer.alloc(0),last=Date.now(),count=0;
  socket.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);try{while(buffer.length>=2){const opcode=buffer[0]&15;if((buffer[0]&128)===0||(buffer[0]&112)||!(buffer[1]&128))throw Error('Frame inválido');let n=buffer[1]&127,offset=2;if(n===126){if(buffer.length<4)return;n=buffer.readUInt16BE(2);offset=4;}else if(n===127){if(buffer.length<10)return;const big=buffer.readBigUInt64BE(2);if(big>65536n)throw Error('Mensagem muito grande');n=Number(big);offset=10;}if(n>65536)throw Error('Mensagem muito grande');if(buffer.length<offset+4+n)return;const mask=buffer.subarray(offset,offset+4),body=Buffer.from(buffer.subarray(offset+4,offset+4+n));buffer=buffer.subarray(offset+4+n);for(let i=0;i<n;i++)body[i]^=mask[i%4];if(opcode===8){ws.close();return;}if(opcode===9){socket.write(frame(10,body));continue;}if(opcode===10)continue;if(opcode!==1)throw Error('Mensagem inválida');if(Date.now()-last>1000){last=Date.now();count=0;}if(++count>30)throw Error('Muitas mensagens');let msg;try{msg=JSON.parse(body.toString('utf8'));if(!msg||typeof msg!=='object')throw Error('Mensagem inválida');if(msg.action==='ping'){ws.send({id:msg.id,ok:true});continue;}if(msg.action==='leave'){leave(ws);ws.send({id:msg.id,ok:true});continue;}const result=ws.member?command(ws.member,msg):attach(ws,msg);ws.send({id:msg.id,ok:true,result});if(ws.member)publish(ws.member.room);}catch(e){ws.send({id:msg?.id,ok:false,error:e.message});if(ws.member)ws.send(envelope(ws.member.room,ws.member.seat));}}
  }catch{socket.destroy();}});
  socket.on('error',()=>{});socket.on('close',()=>{const m=ws.member;if(m?.ws===ws){m.ws=null;m.room.revision++;publish(m.room);}});
 });
 const cleanup=setInterval(()=>{for(const [code,r] of rooms)if(Date.now()-r.touched>2*60*60*1000){for(const m of r.members)if(m){sessions.delete(m.token);m.ws?.close();}rooms.delete(code);}},60000);cleanup.unref();server.on('close',()=>clearInterval(cleanup));
 if(listen)server.listen(port,host,()=>{console.log('\nHORRORVERSE 2.2 — LAN pronto.');console.log('Acesso neste computador: http://127.0.0.1:'+server.address().port);let interfaces={};try{interfaces=os.networkInterfaces();}catch{console.log('Consulte o IP local com ipconfig (Windows) ou ip addr (Linux).');}for(const addresses of Object.values(interfaces))for(const a of addresses||[])if(a.family==='IPv4'&&!a.internal)console.log('Servidor: '+a.address+':'+server.address().port+' | Alternativa local: http://'+a.address+':'+server.address().port);console.log('Site autorizado: '+(allowedOrigin||'somente acesso local. Configure HV_NETLIFY_ORIGIN para liberar seu site.'));});return server;
}
function frame(op,body){let head;if(body.length<126)head=Buffer.from([128|op,body.length]);else if(body.length<65536){head=Buffer.alloc(4);head[0]=128|op;head[1]=126;head.writeUInt16BE(body.length,2);}else{head=Buffer.alloc(10);head[0]=128|op;head[1]=127;head.writeBigUInt64BE(BigInt(body.length),2);}return Buffer.concat([head,body]);}
if(require.main===module)startServer();module.exports={startServer,rooms,sessions,state,command,attach};
