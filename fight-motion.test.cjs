const test=require('node:test');
const assert=require('node:assert/strict');
const {Body,TIMING}=require('../fight-motion.js');
const step=(body,seconds,dt=1/60)=>{for(let t=0;t<seconds-1e-8;t+=dt)body.step(Math.min(dt,seconds-t));};
// 서 있는 몸을 비틀거릴 때까지 때린다. 몇 대 걸렸는지 돌려준다
const punchUntilStagger=(b,kind='jab',power=1.15,max=60)=>{let n=0;while(b.mode==='stand'&&n<max){b.hit({kind,dx:0,dz:-1,power});n++;}return n;};

test('a hit displaces the opponent and does not spring back to the original spot',()=>{
 const b=new Body(false);b.z=1;b.hit({kind:'jab',dx:1,dz:0,power:.6});step(b,2);
 const x=b.x;assert.ok(x>.05);step(b,4);assert.ok(Math.abs(b.x-x)<.001);
});
test('the seated opponent leaves the throne continuously',()=>{
 const b=new Body();b.hit({kind:'jab'});let z=b.z;
 for(let i=0;i<60;i++){b.step(1/60);assert.ok(Math.abs(b.z-z)<.1);z=b.z;}
 assert.ok(b.z>=.85);
});
test('a fresh opponent takes nearly thirty jabs before he even staggers, then falls once',()=>{
 const b=new Body(false);b.z=1;
 const n=punchUntilStagger(b);
 assert.ok(n>=30&&n<=36,'jabs before stagger: '+n);assert.equal(b.mode,'stagger');
 step(b,TIMING.stagger+.05);assert.equal(b.mode,'fall');
 step(b,1);assert.equal(b.mode,'ground');
 assert.equal(b.drain().filter(e=>e.type==='land').length,1);
 step(b,.5);assert.equal(b.drain().filter(e=>e.type==='land').length,0);
});
test('hooks cost more than jabs but still need several',()=>{
 const b=new Body(false);b.z=1;
 const n=punchUntilStagger(b,'hook',1.5);
 assert.ok(n>=10&&n<=13,'hooks before stagger: '+n);
});
test('a heavy hit during the stagger finishes the fall at once',()=>{
 const b=new Body(false);b.z=1;punchUntilStagger(b);
 b.hit({kind:'hook',dx:1,dz:-1,power:1.5});assert.equal(b.mode,'fall');assert.equal(b.downs,1);
});
test('lower poise means fewer hits before staggering',()=>{
 const fresh=new Body(false);fresh.z=1;const tired=new Body(false);tired.z=1;tired.setPoise(.5);
 assert.ok(punchUntilStagger(tired)<punchUntilStagger(fresh)-3);
});
test('standing still restores balance up to the current poise',()=>{
 const b=new Body(false);b.z=1;b.setPoise(.6);for(let i=0;i<4;i++)b.hit({kind:'jab'});
 const low=b.balance;step(b,3);assert.ok(b.balance>low);assert.ok(b.balance<=.6+1e-9);
});
test('ground attacks postpone recovery; one hit while rising only staggers, many knock him back down',()=>{
 const b=new Body(false);b.z=1;b.fall(1,0);step(b,1);
 for(let i=0;i<8;i++){b.hit({kind:'stomp'});step(b,.5);assert.equal(b.mode,'ground');}
 step(b,1);assert.equal(b.mode,'rise');
 b.hit({kind:'jab'});assert.equal(b.mode,'rise');
 for(let i=0;i<12&&b.mode==='rise';i++)b.hit({kind:'jab',power:1.15});
 assert.equal(b.mode,'fall');
});
test('an uninterrupted knockdown returns to the feet within 2.8 seconds',()=>{
 const b=new Body(false);b.z=1;b.fall();step(b,2.8);assert.equal(b.mode,'stand');
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
  for(const k of ['x','z','yaw','vx','vz','balance'])assert.ok(Number.isFinite(b[k]));
  assert.ok(Math.abs(b.x)<=1.18);assert.ok(b.z>=.85&&b.z<=2);
 }
});
test('missing legs do not trigger automatic standing',()=>{
 const b=new Body(false);b.z=1;b.canRise=false;b.fall();step(b,10);assert.equal(b.mode,'ground');
});
