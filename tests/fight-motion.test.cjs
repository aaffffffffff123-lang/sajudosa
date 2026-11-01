const test=require('node:test');
const assert=require('node:assert/strict');
const {Body}=require('../fight-motion.js');
const step=(body,seconds,dt=1/60)=>{for(let t=0;t<seconds-1e-8;t+=dt)body.step(Math.min(dt,seconds-t));};

test('a hit displaces the opponent and does not spring back to the original spot',()=>{
 const b=new Body(false);b.z=1;b.hit({kind:'jab',dx:1,dz:0,power:.6});step(b,2);
 const x=b.x;assert.ok(x>.05);step(b,4);assert.ok(Math.abs(b.x-x)<.001);
});
test('the seated opponent leaves the throne continuously',()=>{
 const b=new Body();b.hit({kind:'jab'});let z=b.z;
 for(let i=0;i<60;i++){b.step(1/60);assert.ok(Math.abs(b.z-z)<.1);z=b.z;}
 assert.ok(b.z>=.85);
});
test('directional hits accumulate balance loss, with a single floor contact per fall',()=>{
 const b=new Body(false);b.z=1;b.hit({kind:'hook',dx:1,power:1.5});b.hit({kind:'hook',dx:1,power:1.5});
 assert.equal(b.mode,'fall');step(b,1);assert.equal(b.mode,'ground');
 assert.equal(b.drain().filter(e=>e.type==='land').length,1);
 step(b,.5);assert.equal(b.drain().filter(e=>e.type==='land').length,0);
});
test('ground attacks postpone recovery; a new hit interrupts getting up',()=>{
 const b=new Body(false);b.z=1;b.fall(1,0);step(b,1);
 for(let i=0;i<8;i++){b.hit({kind:'stomp'});step(b,.5);assert.equal(b.mode,'ground');}
 step(b,3.3);assert.equal(b.mode,'rise');b.hit({kind:'jab'});assert.equal(b.mode,'fall');
});
test('dragging lifts a grounded body; side release throws it',()=>{
 const b=new Body(false);b.z=1;b.fall();step(b,1);
 assert.equal(b.beginGrab(),true);b.drag(0,-.45);assert.equal(b.grab.lift,1);
 b.release();assert.equal(b.mode,'stand');
 b.beginGrab();b.drag(.4,0);assert.equal(b.release(),true);assert.equal(b.mode,'fall');
 assert.ok(b.vx>0);assert.ok(b.drain().some(e=>e.type==='throw'));
});
test('cancelling a gesture never throws or leaves a stale grip',()=>{
 const b=new Body(false);b.z=1;b.beginGrab();b.drag(.8,.3);assert.equal(b.release(true),false);
 assert.equal(b.grab,null);assert.equal(b.drain().some(e=>e.type==='throw'),false);
});
test('sustained inputs stay finite and within the fighting space at different frame rates',()=>{
 for(const dt of [1/30,1/60,1/120]){
  const b=new Body(false);b.z=1;
  for(let i=0;i<500;i++){b.hit({kind:i%3?'jab':'hook',dx:Math.sin(i)*2,dz:-1,power:1.5});b.step(dt);}
  for(const k of ['x','z','yaw','vx','vz'])assert.ok(Number.isFinite(b[k]));
  assert.ok(Math.abs(b.x)<=1.18);assert.ok(b.z>=.85&&b.z<=2);
 }
});
test('missing legs do not trigger automatic standing',()=>{
 const b=new Body(false);b.z=1;b.canRise=false;b.fall();step(b,10);assert.equal(b.mode,'ground');
});
