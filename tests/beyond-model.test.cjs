const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),source=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const scope={THREE,PI:Math.PI,TAU:Math.PI*2,V3:(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),col:h=>new THREE.Color(h),smooth,canvasTex:()=>new THREE.Texture()};
const build=slice('function createBeyondEye(){','const BEYOND=');
// Geometry tests skip texture rasterization but exhaust the same sliced builder.
const model=vm.runInNewContext(build+';eyeCanvasTex=function*(){return new THREE.Texture()};createBeyondEye()',scope);
test('the ending eye uses a rotating sphere and a curved iris behind fixed opaque lids',()=>{
 assert.equal(model.ball.children[0].geometry.type,'SphereGeometry');
 const iris=model.ball.children.find(x=>x.material.name==='beyond-iris'),p=iris.geometry.attributes.position;
 for(let i=0;i<p.count;i+=17){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);assert(Math.abs(z-Math.sqrt(4.9**2-x*x-y*y)-.012)<1e-5);}
 const lidRotation=model.lids.quaternion.clone(),initial=model.ball.quaternion.clone();model.setGaze(new THREE.Vector2(0,-.16),.13);
 assert(model.ball.quaternion.angleTo(initial)>.15);assert.equal(model.lids.quaternion.angleTo(lidRotation),0);
 const lp=model.lids.geometry.attributes.position;
 for(let i=0;i<lp.count;i++){const x=lp.getX(i),y=lp.getY(i),z=lp.getZ(i);if(x*x+y*y<4.9**2)assert(z>=Math.sqrt(4.9**2-x*x-y*y)+.07,'eyeball cannot poke through the surrounding skin');}
});
test('dilation changes pupil width on the sphere, and contact points at the actual viewer',()=>{
 let prev=0;
 for(const width of [.13,.2,.27,.34]){
  model.setGaze(new THREE.Vector2(0,0),width);const p=model.pupil.geometry.attributes.position;let max=0;
  for(let i=0;i<p.count;i+=7){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);max=Math.max(max,Math.abs(x));assert(Number.isFinite(x+y+z));assert(Math.abs(z-Math.sqrt(4.9**2-x*x-y*y)-.027)<1e-5);}
  assert(max>prev);prev=max;
 }
 for(const fov of [32,48,65]){const pitch=Math.atan(Math.tan(fov*Math.PI/360)*.18);model.setContactPitch(pitch);model.setGaze(new THREE.Vector2(),.34);const forward=new THREE.Vector3(0,0,1).applyQuaternion(model.ball.quaternion),viewer=new THREE.Vector3(0,-Math.tan(pitch),1).normalize();assert(forward.dot(viewer)>1-1e-12);}
});
test('first encounter hides both counters through the ending; the successor shows the exact total',()=>{
 const elements=new Map(),$=s=>{if(!elements.has(s))elements.set(s,{});return elements.get(s)},G={defeatCountVisible:false},PROGRESS={defeated:0};
 const update=vm.runInNewContext(slice('function updateDefeatCount(){','const OUTFITS=')+';updateDefeatCount',{$,G,PROGRESS});
 for(const count of [0,1]){PROGRESS.defeated=count;update();assert($('#defeatCount').hidden);assert($('#endDefeatCount').hidden);}
 G.defeatCountVisible=true;update();assert(!$('#defeatCount').hidden);assert(!$('#endDefeatCount').hidden);assert.equal($('#endDefeatCount').textContent,'족친 천지신명 1놈');
 PROGRESS.defeated=2;update();assert.equal($('#defeatCount').textContent,'족친 천지신명 2놈');assert.equal($('#endDefeatCount').textContent,'족친 천지신명 2놈');
});
