const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight-free.js'),'utf8'),cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function rig(){let time=0;const S={jobs:[]},ctx={THREE,V3,S,Float32Array,Uint8Array,Uint32Array,Int32Array,PI:Math.PI,TAU:Math.PI*2,_m:new THREE.Matrix4(),clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),performance:{now:()=>++time}};
 const api=vm.runInNewContext(cut(' const LIN=',' function snapMesh(')+cut(' function jobRun(job){',' const snapCell=')+';({newJob,jobMesh,jobFinish,jobRun,stepJobs,TEXS})',ctx);
 const root=new THREE.Group(),geo=new THREE.SphereGeometry(.3,128,96),colors=new Uint8Array(geo.attributes.position.count*3);
 for(let i=0;i<colors.length;i++)colors[i]=20+(i*13%190);geo.setAttribute('color',new THREE.BufferAttribute(colors,3,true));
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xd1c2aa,vertexColors:true}));mesh.position.set(.2,.4,-.3);mesh.rotation.set(.2,.4,.1);root.add(mesh);
 // A second mesh catches resume errors in base vertex offsets.
 root.add(new THREE.Mesh(new THREE.BoxGeometry(.1,.2,.3),new THREE.MeshStandardMaterial({color:0x233044})));
 root.updateMatrixWorld(true);return {...api,S,root,mesh,now:()=>time};
}
const equal=(a,b)=>{for(const k of ['p','c','i'])assert(Buffer.from(a[k].buffer).equals(Buffer.from(b[k].buffer)),k+' must be byte-identical');};
test('snapshot vertices, triangle filtering and final packing yield while retaining identical output',()=>{
 const h=rig(),direct=h.jobRun(h.newJob(h.root,h.root,.012,()=>{}));let result,calls=0;
 const job=h.newJob(h.root,h.root,.012,sn=>{result=sn;calls++;});h.S.jobs.push(job);
 h.stepJobs(2);assert(job.meshWork&&job.meshWork.v<h.mesh.geometry.attributes.position.count,'one large mesh cannot consume a whole frame');assert.equal(calls,0);
 let frames=1,packedFrames=0;while(h.S.jobs.length&&frames<1000){h.stepJobs(2);frames++;if(job.fin?.pack)packedFrames++;}
 assert(frames>10&&frames<1000);assert(packedFrames>1,'packing also respects the frame budget');assert.equal(calls,1);equal(result,direct);
});
test('leaving the factory can finish a partially processed mesh or packing job without data loss',()=>{
 for(const phase of ['mesh','pack']){
  const h=rig(),direct=h.jobRun(h.newJob(h.root,h.root,.012,()=>{})),job=h.newJob(h.root,h.root,.012,()=>{});h.S.jobs.push(job);
  h.stepJobs(2);if(phase==='pack')for(let n=0;n<1000&&!job.fin?.pack;n++)h.stepJobs(2);
  assert(phase==='mesh'?!!job.meshWork:!!job.fin?.pack);equal(h.jobRun(job),direct);
 }
});
test('adding the fifth hung body schedules unfinished snapshots instead of blocking on them',()=>{
 const S={items:Array.from({length:5},()=>({real:{}}))},queued=[],converted=[];
 const trim=vm.runInNewContext(cut(' function trimReals(){',' function disposeItem(')+';trimReals',{S,realCap:()=>4,startSnap:it=>queued.push(it),toProxy:it=>{assert(it.snap,'no forced synchronous bake');converted.push(it);it.real=null;}});
 trim();assert.equal(queued.length,1);assert.equal(converted.length,0);S.items[0].snap={};trim();assert.equal(converted.length,1);
});
