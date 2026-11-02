const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const THREE=require('../three.min.js');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const V3=(...args)=>new THREE.Vector3(...args);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
function setup({width=390,height=844,pitch=.8,nx=0,ny=0,code=source}={}){
 const camera=new THREE.PerspectiveCamera(44,width/height,.1,100);
 camera.rotation.x=-pitch;camera.updateMatrixWorld(true);
 const target=V3(nx,ny,0).unproject(camera),boot=new THREE.Object3D();
 const shin=new THREE.Object3D(),thigh=new THREE.Object3D(),knee=new THREE.Object3D();
 boot.add(shin,thigh,knee);
 const hit=[],sound=[],shake=[];
 const scope={Math,PI:Math.PI,THREE,V3,UP:V3(0,1,0),clamp,smooth,easeIn3:n=>n*n*n,lerp:(a,b,t)=>a+(b-a)*t,
  innerWidth:width,innerHeight:height,camera,
  COMBAT_STAGE:{boot,shin,thigh,knee,dust:new THREE.Object3D()},
  COMBAT:{foot:{t:0,local:V3(),obj:{parent:{},userData:{},localToWorld:()=>target.clone()},part:'chest',done:false,swung:false}},
  G:{E:{},mode:'fight',tool:'hand',inputLocked:false,hitstop:0},
  VM:{at:(x,y,d)=>V3(x*Math.tan(Math.PI/6)*width/height*d,y*Math.tan(Math.PI/6)*d,-d),grip(){}},
  AUDIO:{whoosh:()=>sound.push('swing'),fall:()=>sound.push('impact')},
  combatActive:()=>false,resolveHit:(...args)=>hit.push(args),camHit:o=>shake.push(o)};
 const start=code.includes('function stompLegPose(')?code.indexOf('function stompLegPose('):code.indexOf('function combatEffects(');
 vm.createContext(scope);vm.runInContext(code.slice(start,code.indexOf('function combatCancel(',start)),scope);
 return {scope,boot,knee,hit,sound,shake,pose(t){scope.COMBAT.foot.t=t;scope.combatEffects(0);boot.updateMatrixWorld(true);return {ankle:boot.localToWorld(V3(.002,.18,.073)),knee:knee.getWorldPosition(V3()),hip:thigh.localToWorld(V3(0,.5,0)),up:V3(0,1,0).applyQuaternion(camera.quaternion.clone().invert())};}};
}

test('stomp keeps exact leg lengths, a raised knee and forward knee bend across the screen',()=>{
 for(const [width,height] of [[390,844],[844,390],[360,640]])
 for(const pitch of [.35,.6,.8,1.1])for(const nx of [-.9,0,.9])for(const ny of [-.9,0,.9]){
  const h=setup({width,height,pitch,nx,ny});
  for(let i=0;i<=144;i++){
   const p=h.pose(i/240);
   assert.ok(Math.abs(p.hip.distanceTo(p.knee)-.5)<1e-8,'thigh must not stretch');
   assert.ok(Math.abs(p.knee.distanceTo(p.ankle)-.5)<1e-8,'shin must not stretch');
   assert.ok(p.knee.clone().sub(p.ankle).dot(p.up)>0,'knee must stay above ankle');
   const forward=V3(0,0,-1).addScaledVector(p.up,p.up.z).normalize();
   const mid=p.hip.clone().add(p.ankle).multiplyScalar(.5);
   assert.ok(p.knee.clone().sub(mid).dot(forward)>0,'knee must bend toward toes, not backward');
  }
 }
});

test('knee moves continuously through lift, swing, contact and recovery',()=>{
 for(const pitch of [.35,.6,.8,1.1])for(const ny of [-.9,0,.9]){
  const h=setup({pitch,ny});let previous;
  for(let i=0;i<=600;i++){
   const p=h.pose(i/1000);
   if(previous)assert.ok(p.knee.distanceTo(previous)<.06,`no pole flip: pitch=${pitch} ny=${ny} t=${i/1000} distance=${p.knee.distanceTo(previous)}`);
   previous=p.knee;
  }
 }
});

test('a stomp contacts once at .27s, retains impact feedback, and ends after .6s',()=>{
 const h=setup();h.pose(.269);assert.equal(h.hit.length,0);
 h.pose(.27);assert.equal(h.hit.length,1);assert.equal(h.hit[0][4].powerMul,1.8);
 assert.equal(h.hit[0][4].stomp,true);assert.equal(h.scope.G.hitstop,.055);
 assert.equal(h.scope.COMBAT.landKick,1.6);assert.equal(h.shake[0].shake,.045);
 h.pose(.35);assert.equal(h.hit.length,1);assert.deepEqual(h.sound,['swing','impact']);
 h.pose(.601);assert.equal(h.scope.COMBAT.foot,null);assert.equal(h.boot.visible,false);
});

test('interrupting the stomp clears its visible foot without causing an impact',()=>{
 for(const change of [s=>s.G.inputLocked=true,s=>s.G.tool='knife']){
  const h=setup();h.pose(.15);change(h.scope);h.scope.combatEffects(1/60);
  assert.equal(h.scope.COMBAT.foot,null);assert.equal(h.boot.visible,false);assert.equal(h.hit.length,0);
 }
});
