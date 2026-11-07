const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const ctx={console};ctx.globalThis=ctx;vm.createContext(ctx);
for(const n of ['cards.js','engine.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+n,'utf8'),ctx);
const {HorrorverseEngine}=ctx;
function seed(atk=7){const g=new HorrorverseEngine(),a=g.clone({id:'hero',name:'Hero',kind:'ser',atk,def:3,terror:5},0);g.p(0).field.ser[0]=a;return {g,a}}
// First full round protected, even with an empty opponent field.
{let {g,a}=seed();assert.equal(g.canDirectAttack(a.uid),false);assert.throws(()=>g.attackDirect(a.uid),/primeira rodada/);g.endTurn();assert.throws(()=>g.attackDirect(a.uid),/primeira rodada/);g.endTurn();assert.equal(g.canDirectAttack(a.uid),true);let r=g.attackDirect(a.uid);assert.equal(r.direct,true);assert.equal(r.damage,3);assert.equal(r.before,10);assert.equal(r.after,7);assert.equal(g.p(1).sanity,7);assert.equal(a.hasAttacked,true);assert.throws(()=>g.attackDirect(a.uid),/já atacou/)}
// If opponent has a being, direct attack is not allowed.
{let {g,a}=seed();g.endTurn();g.endTurn();g.p(1).field.ser[0]=g.clone({id:'blocker',name:'Blocker',kind:'ser',atk:1,def:1,terror:2},1);assert.equal(g.canDirectAttack(a.uid),false);assert.throws(()=>g.attackDirect(a.uid),/Seres protegendo/)}
// Damage brackets, clamp and terminal victory.
for(const [atk,expected] of [[1,1],[3,1],[4,2],[6,2],[7,3],[9,3],[10,4],[20,4]]){let {g,a}=seed(atk);g.endTurn();g.endTurn();assert.equal(g.attackDirect(a.uid).damage,expected)}
{let {g,a}=seed(20);g.endTurn();g.endTurn();g.p(1).sanity=3;const r=g.attackDirect(a.uid);assert.equal(r.damage,3);assert.equal(r.after,0);assert.equal(g.over.reason,'loucura');assert.equal(g.over.winner,0)}
// Computer player can directly attack the human player after first round.
{let {g,a}=seed();g.endTurn();g.endTurn();g.endTurn();const cpu=g.clone({id:'cpu',name:'CPU',kind:'ser',atk:6,def:3,terror:4},1);g.p(1).field.ser[0]=cpu;assert.equal(g.canDirectAttack(cpu.uid),false);g.p(0).field.ser[0]=null;assert.equal(g.canDirectAttack(cpu.uid),true);assert.equal(g.attackDirect(cpu.uid).damage,2);assert.equal(g.p(0).sanity,8)}
console.log('OK: abertura protegida, ataque à Sanidade com alvo vazio, bloqueio com defensores, escala de dano, vitória, CPU.');
