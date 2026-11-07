const assert=require('node:assert/strict');require('./cards.js');require('./engine.js');require('./expansion.js');require('./ai.js');
const fresh=()=>{const g=new HorrorverseEngine({deferChoices:true,winByExtermination:false});g.active=1;g.turn=4;g.players.forEach(p=>{p.hand=[];p.field.ser.fill(null);p.field.support.fill(null)});return g;};
const add=(g,id,owner=1,zone='ser')=>{const c=g.clone(HV_DATA.CARD_LIBRARY.find(c=>c.id===id),owner);if(zone==='hand')g.p(owner).hand.push(c);else g.p(owner).field[zone][g.p(owner).field[zone].indexOf(null)]=c;return c;};
// Save expensive removal when there is no target; do not attack for zero damage.
{const g=fresh(),a=add(g,'cultista'),d=add(g,'mumia',0);assert.equal(new HV_Tactics(g,'guardia').best(),null);assert(!a.hasAttacked);}
// Direct lethal overrides all setup priorities.
for(const id of ['carrasco','guardia','oraculo']){const g=fresh(),a=add(g,'fera');g.p(0).sanity=1;const move=new HV_Tactics(g,id).best();assert.equal(move.kind,'attack');assert.equal(move.target,null);}
// Removal values a dangerous recurring draw engine over an ordinary weak target.
{const g=fresh(),weak=add(g,'cultista',0),danger=add(g,'arquivista_proibido',0),spell=add(g,'correntes_condenacao',1,'support');weak.counters.medo=1;danger.counters.medo=1;const a=new HV_Tactics(g,'oraculo').best();assert.equal(a.kind,'activate');assert.equal(a.target,danger.uid);}
// Reaction passes a harmless attack and preserves the card; negates lethal damage to a valuable engine.
{const g=fresh(),a=add(g,'cultista',0),d=add(g,'mumia'),r=add(g,'cobertura_defensiva',1,'support');g.active=0;g.attack(a.uid,d.uid);assert.equal(new HV_Tactics(g,'guardia').reaction().uid,null);}
{const g=fresh(),a=add(g,'fera',0),d=add(g,'arquivista_proibido'),r=add(g,'cobertura_defensiva',1,'support');d.terrorCurrent=1;g.active=0;g.attack(a.uid,d.uid);assert.equal(new HV_Tactics(g,'guardia').reaction().uid,r.uid);}
// Planning leaves the real state unchanged and ignores enemy hand identity / hidden deck order.
{const g=fresh();add(g,'cultista');add(g,'vigia',0);add(g,'corte',1,'hand');const serialized=JSON.stringify(g);const a=new HV_Tactics(g,'oraculo').best();assert.equal(JSON.stringify(g),serialized);g.p(0).hand=[g.clone(HV_DATA.CARD_LIBRARY[0],0)];const b=new HV_Tactics(g,'oraculo').best();g.p(0).hand=[g.clone(HV_DATA.CARD_LIBRARY[7],0)];const c=new HV_Tactics(g,'oraculo').best();assert.equal(b?.kind,c?.kind);assert.equal(b?.target,c?.target);}
console.log('OK: tactical threats, no-op avoidance, lethal, reaction timing, isolation and hidden information.');
