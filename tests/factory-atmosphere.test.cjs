const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight-free.js'),'utf8'),fight=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const cut=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i,a);return s.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),scope={THREE,V3,PI:Math.PI,TAU:Math.PI*2,Float32Array,Uint8Array,Uint32Array,Int32Array};
const strip=vm.runInNewContext(cut(src,' function stripStoredHalo(',' function snapMesh(')+';stripStoredHalo',scope);
function snapshot(geos){const p=[],c=[],idx=[];for(const g of geos){const base=p.length/3;p.push(...g.attributes.position.array);for(let i=0;i<g.attributes.position.count;i++)c.push(90,70,50);idx.push(...Array.from(g.index.array,x=>x+base))}return {p:new Float32Array(p),c:new Uint8Array(c),i:new Uint32Array(idx)}}
test('old halo rings are removed while the original head, body and cut caps are retained',()=>{
 for(const angle of [0,.4,-.96]){
  const body=new THREE.BoxGeometry(.5,1,.35).translate(0,-.6,.1),head=new THREE.SphereGeometry(.22,18,14).translate(0,.35,.1),cap=new THREE.RingGeometry(.08,.12,64).rotateX(Math.PI/2).translate(.1,-.3,0);
  const halo=new THREE.RingGeometry(.236,.418,128).rotateX(angle).translate(0,.34,-.12),rim=new THREE.TorusGeometry(.333,.0058,6,128).rotateX(angle).translate(0,.34,-.12);
  const original=snapshot([body,head,cap,halo,rim]),result=strip(original);
  assert.equal(result.i.length,body.index.count+head.index.count+cap.index.count);assert.deepEqual(Array.from(result.p),Array.from(original.p));assert.deepEqual(Array.from(result.c),Array.from(original.c));assert.equal(result.v,3);
  assert.equal(strip(result),result,'migration runs once');
 }
});
test('welded legacy shoulder rings are detected without erasing the original saved arrays',()=>{
 const body=new THREE.BoxGeometry(.3,.8,.22).translate(0,-.5,.1),cap=new THREE.CircleGeometry(.12,32).translate(0,.14823,.33735);
 const normal=V3(-.16,.42,Math.sqrt(1-.16*.16-.42*.42)),q=new THREE.Quaternion().setFromUnitVectors(V3(0,0,1),normal);
 const ring=new THREE.RingGeometry(.236,.333,160,3).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)).translate(0,.14823,.33735);
 const sn=snapshot([body,cap,ring]),saved=sn.i.slice();
 // Connect a halo vertex to the body, as the old vertex clustering did.
 const linked=new Uint32Array(sn.i.length+3);linked.set(sn.i);linked.set([0,1,body.attributes.position.count+cap.attributes.position.count],sn.i.length);sn.i=linked;
 const after=strip(sn);assert(after.i.length<sn.i.length-ring.index.count*.95);assert.equal(after.p,sn.p);assert.equal(after.c,sn.c);assert.deepEqual(sn.i.slice(0,-3),saved);
 assert.deepEqual(Array.from(after.i.slice(0,body.index.count+cap.index.count)),Array.from(sn.i.slice(0,body.index.count+cap.index.count)));
});
test('legacy migration uses one worker and exit resolves queued work without losing source data',async()=>{
 const workers=[],revoked=[];
 class Worker{constructor(url){this.url=url;workers.push(this)}postMessage(data){(this.sent||(this.sent=[])).push(data)}terminate(){this.stopped=true}}
 const URLMock=class extends URL{};URLMock.createObjectURL=()=> 'blob:worker';URLMock.revokeObjectURL=x=>revoked.push(x);
 const api=vm.runInNewContext(cut(src,' let haloWorker=',' function snapMesh(')+';({migrateStoredHalo,stopHaloWorker})',{Worker,Blob,URL:URLMock,document:{baseURI:'https://example.com/game/'},stripStoredHalo:strip});
 const a={v:2,p:[1]},b={v:2,p:[2]},pa=api.migrateStoredHalo(a),pb=api.migrateStoredHalo(b);assert.equal(workers.length,1);assert.deepEqual(revoked,['blob:worker']);
 workers[0].onmessage({data:{id:workers[0].sent[0].id,sn:{v:3}}});assert.equal((await pa).v,3);
 api.stopHaloWorker();assert.equal(await pb,b);assert(workers[0].stopped);
});
test('stored upright fragments rotate rigidly onto the floor, retaining shape and location',()=>{
 const ground=vm.runInNewContext(cut(src,' function groundStoredPiece(',' function migrateHeads(')+';groundStoredPiece',scope);
 const original=snapshot([new THREE.CylinderGeometry(.12,.15,.8,16).translate(.5,.5,-7)]),after=ground(original),b=new THREE.Box3();
 for(let i=0;i<after.p.length;i+=3)b.expandByPoint(V3().fromArray(after.p,i));
 assert(Math.abs(b.min.y-.012)<1e-6);assert(b.max.y<.33);assert(Math.abs(b.getCenter(V3()).x-.5)<1e-6);assert(Math.abs(b.getCenter(V3()).z+7)<1e-6);
 for(let i=3;i<original.p.length;i+=9){const d=V3().fromArray(original.p).distanceTo(V3().fromArray(original.p,i)),e=V3().fromArray(after.p).distanceTo(V3().fromArray(after.p,i));assert(Math.abs(d-e)<1e-6,'no stretching or scale change');}
 assert.deepEqual(Array.from(after.i),Array.from(original.i));
});
function baking(){
 const ctx={...scope,performance:{now:()=>0},_m:new THREE.Matrix4(),clamp:(n,a,b)=>Math.max(a,Math.min(b,n))};
 return vm.runInNewContext(cut(src,' const LIN=',' function snapMesh(')+';({newJob,jobMesh,jobFinish,TEXS})',ctx);
}
test('new body snapshots exclude the halo and normalize byte vertex colors',()=>{
 const b=baking(),root=new THREE.Group(),halo=new THREE.Group();halo.name='halo';root.add(halo);halo.add(new THREE.Mesh(new THREE.TorusGeometry(.3,.01,6,64)));
 const geo=new THREE.BoxGeometry(.2,.3,.2),color=new Uint8Array(geo.attributes.position.count*3);for(let i=0;i<color.length;i+=3)color.set([40,70,95],i);geo.setAttribute('color',new THREE.BufferAttribute(color,3,true));
 root.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,color:0xffffff})));root.updateMatrixWorld(true);
 const job=b.newJob(root,root,.001,()=>{});assert.equal(job.meshes.length,1);for(const m of job.meshes)b.jobMesh(job,m);const sn=b.jobFinish(job,Infinity);
 for(let i=0;i<sn.c.length;i+=3)assert.deepEqual(Array.from(sn.c.slice(i,i+3)),[40,70,95]);assert.equal(sn.v,3);
});
test('fully transparent texture triangles do not become opaque white debris in a baked model',()=>{
 const b=baking(),root=new THREE.Group(),texture=new THREE.Texture({width:1,height:1});
 const geo=new THREE.PlaneGeometry(.2,.2),mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.2}));root.add(mesh);
 b.TEXS.set(texture,{w:1,h:1,d:new Uint8Array([255,255,255,0]),rx:1,ry:1,ox:0,oy:0,flip:false,srgb:false});
 const job=b.newJob(root,root,.001,()=>{});b.jobMesh(job,mesh);const sn=b.jobFinish(job,Infinity);assert.equal(sn.i.length,0);
});
test('factory ambience owns only two looping sources and stops on exit, mute and audio shutdown',()=>{
 const nodes=[],events=[],live=new Set();let ready=true;
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){}});
 const node=()=>{const n={gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){this.disconnected=true},start(){this.started=true},stop(){this.stopped=true}};nodes.push(n);return n};
 const ctx={currentTime:0,createGain:node,createBiquadFilter:node,createBufferSource:node,createOscillator:node};
 const api=vm.runInNewContext(cut(fight,' let factoryHum=',' // 천지신명 정육공장: 사슬')+';({factoryRoom,stopFactoryRoom})',{ctx,ready:()=>ready,noise:{},bus:{},live,track:n=>live.add(n),R:(a,b)=>(a+b)/2,out:()=>({}),ring:()=>events.push('ring'),nz:()=>events.push('noise'),osc:()=>events.push('drip')});
 for(let i=0;i<600;i++)api.factoryRoom(true,true,1/60);assert.equal(nodes.length,5);assert.equal(live.size,2);assert(events.length<=3,'sparse events, not per-frame sound sources');
 ready=false;api.factoryRoom(true,true,.1);assert.equal(live.size,0);assert(nodes.every(n=>n.disconnected));ready=true;api.factoryRoom(true,true,.1);assert.equal(live.size,2);api.factoryRoom(false,true,0);assert.equal(live.size,0);
 assert.match(cut(fight,'function stop(keepMusic=',' function out('),/stopFactoryRoom\(\)/);
});
