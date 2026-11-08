const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js'),source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const start=source.indexOf('vomitCoins(n,power=1){'),end=source.indexOf('updateBelly(dt){',start);
function setup(rep=false){
 const emitted=[],sounds=[],G={time:10},F=new THREE.Group();
 const scope={G,V3:(...v)=>new THREE.Vector3(...v),rnd:(a,b)=>(a+b)/2,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),AUDIO:{coinGush:n=>sounds.push(n)},COINS:{spawn:(p,v,type)=>emitted.push({p,v,type})}};
 const methods=vm.runInNewContext('({'+source.slice(start,end)+'})',scope);
 const E={...methods,state:'stand',headKind:rep?'rep':'human',headFrame:()=>F,mouthCoinCool:0,mouthCoinQ:0,mouthCoinPower:0,mouthCoinUntil:0};
 return {E,G,F,emitted,sounds,step(n=60){for(let i=0;i<n;i++){G.time+=1/60;E.updateMouthCoins(1/60);}}};
}
test('an intact belly can eject the requested coins from either mouth and finish its queue',()=>{
 for(const rep of [false,true]){
  const h=setup(rep);h.E.vomitCoins(14,1);h.step();
  assert.equal(h.emitted.length,14);assert.equal(h.sounds.length,1);assert.equal(h.E.mouthCoinQ,0);
  for(const coin of h.emitted){assert.ok(coin.p.distanceTo(new THREE.Vector3(0,rep?-.118:-.126,rep?.196:.226))<1e-9);assert.ok(coin.v.z>1);}
 }
});
test('emission follows a rotated and moving head after a fall',()=>{
 const h=setup();h.E.vomitCoins(14,1.8);
 h.F.position.set(1,.4,-.5);h.F.rotation.set(-1.4,.3,.2);h.F.updateMatrixWorld(true);h.step(10);
 const first=h.emitted[0];assert.ok(first.p.distanceTo(h.F.localToWorld(new THREE.Vector3(0,-.126,.226)))<1e-9);
 const localVelocity=first.v.clone().sub(new THREE.Vector3(0,.15,0)).transformDirection(new THREE.Matrix4().copy(h.F.matrixWorld).invert());
 assert.ok(localVelocity.z>.95);assert.ok(localVelocity.y<0);
 h.F.position.x+=.3;h.step(10);assert.ok(h.emitted.at(-1).p.x-first.p.x>.29);
});
test('rapid hits have a bounded queue; no head, no jaw, and death stop emission',()=>{
 const h=setup();h.E.vomitCoins(18,1.8);h.E.vomitCoins(18,1.8);assert.equal(h.E.mouthCoinQ,18);
 for(let i=0;i<15;i++){h.G.time+=.17;h.E.vomitCoins(18,1.8);}assert.equal(h.E.mouthCoinQ,38);
 for(const flag of ['headGone','headDestroyed','jawGone','dead']){
  const h=setup();h.E.vomitCoins(14);if(flag==='dead')h.E.state='dead';else h.E[flag]=true;
  h.step();h.E.vomitCoins(14);assert.equal(h.E.mouthCoinQ,0);assert.equal(h.emitted.length,0);assert.equal(h.E.mouthCoinUntil,0);
 }
});
test('actual hit handling ejects from blunt belly hits while preserving the open-belly stream',()=>{
 const a=source.indexOf(' takeHit(h){'),b=source.indexOf(' handFor(pt){',a);
 const takeHit=vm.runInNewContext('({'+source.slice(a,b)+'}).takeHit',{Math,HEADS:/^(head|face)$/,HEAD_FLESH:/^(head|face)$/});
 for(const [part,tool,kind,open,expectedMouth,expectedBelly] of [
  ['belly','hand','jab',false,1,0],['belly','hand','hook',false,1,0],['belly','hand','jab',true,1,1],
  ['chest','hand','jab',false,0,0],['belly','gun','shot',true,0,1],['belly','knife','slash',true,0,0]]){
  let mouth=0,belly=0;const noop=()=>{};
  const E={state:'down',panic:0,phase:0,guard:0,abdomenOpen:open,headGone:true,
   kickBody:noop,doFlinch:noop,voiceHit:noop,bluntHit:noop,makeWound:noop,applyDeform:noop,
   nearSlit:()=>true,coinBurst:()=>belly++,vomitCoins:()=>mouth++,takeHit};
  E.takeHit({part,tool,kind,power:1.8,point:new THREE.Vector3(),normal:new THREE.Vector3(0,1,0),dir:new THREE.Vector3(0,-1,0)});
  assert.equal(mouth,expectedMouth,part+' '+tool+' '+kind);assert.equal(belly,expectedBelly);
 }
});
test('the leg pass keeps separate depth from the hand pass and restores the camera layer',()=>{
 const start=source.indexOf('function render(dt=0){'),end=source.indexOf('function frame(',start),events=[];
 const scene={},vmScene={},fx={},camera={},vmCam={layers:{mask:1,set(n){this.mask=1<<n;}}},COMBAT_STAGE={boot:{visible:true}};
 const renderer={clear(){},clearDepth(){events.push('clearDepth');},render(s,c){events.push(s===scene?'world':s===fx?'fx':'vm:'+c.layers.mask);}};
 const scope={renderer,scene,vmScene,camera,vmCam,COMBAT_STAGE,BEYOND:{active:false},FX:{scene:fx},BUB:{draw(){}},VM:{afterRender(){}},gunLT:0};
 vm.runInNewContext(source.slice(start,end)+'render();',scope);
 assert.deepEqual(events,['world','clearDepth','vm:2','clearDepth','vm:1','clearDepth','fx']);assert.equal(vmCam.layers.mask,1);
 events.length=0;COMBAT_STAGE.boot.visible=false;vm.runInNewContext(source.slice(start,end)+'render();',scope);
 assert.deepEqual(events,['world','clearDepth','vm:1','clearDepth','fx']);
});
