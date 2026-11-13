const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight-free.js'),'utf8'),fight=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const slice=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i,a);return s.slice(i,j)};
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){if(this.parent)this.parent.remove(this);return this;};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const corners=vm.runInNewContext('({'+slice(fight,'limbCorners(root){','detachLimb(joint,')+'})',{THREE,V3}).limbCorners;
function rig(){
 const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);
 const storage=new Map(),db=new Map(),released=[],S={on:true,items:[],slides:[],jobs:[],gen:1},mat=new THREE.MeshStandardMaterial({vertexColors:true});
 const scope={THREE,Float32Array,Uint8Array,Uint32Array,V3,clamp,scene,root,S,PI:Math.PI,TAU:Math.PI*2,UP:V3(0,1,0),HALL_W:2.5,snapMat:mat,MOBILE_GPU:false,lite:()=>0,
 rnd:(a,b)=>(a+b)/2,smooth:x=>x*x*(3-2*x),AUDIO:new Proxy({},{get:()=>()=>{}}),PREF:{blood:false},Emperor:{prototype:{limbCorners:corners}},
 DB:{get:k=>Promise.resolve(db.get(k)),put:(k,v)=>{db.set(k,v);return Promise.resolve()},del:k=>db.delete(k)},
 localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},saveRecord(){scope.savedRecords=(scope.savedRecords||0)+1},
 releaseObj(obj){obj.removeFromParent();released.push(obj);obj.traverse(o=>o.geometry?.dispose())},
 proxyHead(){return new THREE.Mesh(new THREE.SphereGeometry(.18,12,8),new THREE.MeshStandardMaterial({color:0x947e62}))},
 _mgM:new THREE.Matrix4()};
 const code=slice(fight,'function mergeMeshes(','/* 한 부모 아래')+slice(src,' function rng(seed){',' /* ---- 대역 모형')+slice(src,' function packSnapshot(sn){',' function newJob(')+slice(src,' function snapMesh(sn){',' // 한 번에 끝까지')+slice(src,' /* ---- 바닥 조각:',' /* ---- 걸이(');
 // Snapshot scheduling is asynchronous in the game; keep that lifecycle, and bake real transformed geometry for these tests.
 scope.newJob=(obj,space,cell,done)=>({obj,cell,done});
 scope.jobRun=job=>{job.obj.updateWorldMatrix(true,true);const meshes=[];job.obj.traverse(o=>{if(o.isMesh)meshes.push(o)});
  const geo=scope.merge(meshes,new THREE.Matrix4(),m=>m.material.color),c=Uint8Array.from(geo.attributes.color.array,x=>Math.round(x*255));
  job.done({p:geo.attributes.position.array,c,i:geo.index.array});geo.dispose();};
 const api=vm.runInNewContext(code+';({HEAP,HEAP_MAX,heapSpot,heapVertices,heapPose,heapAdd,toHeap,overflow,updateHeap,updateHeapBatches,flushHeap,clearHeap,loadHeap,saveHeap,migrateHeads,mergeMeshes})',scope);scope.merge=api.mergeMeshes;
 return {...api,S,scene,root,storage,db,released,scope,drain(){while(S.jobs.length)scope.jobRun(S.jobs.shift())}};
}
function piece(h,dimensions=[.16,.9,.2]){
 const obj=new THREE.Mesh(new THREE.BoxGeometry(...dimensions),new THREE.MeshStandardMaterial({color:0x856a4e}));obj.position.set(.4,.3,1);h.scene.add(obj);
 const owner={bits:[],severed:[obj],severedHeads:[obj],headPieces:[obj],looseEyes:[],keepBits:true,limbCorners:corners};
 const b={obj,body:true,r:.15,sound:'head',corners:corners(obj),twitch:{},bleed:{}};owner.bits.push(b);return {obj,owner,b};
}
async function settle(){for(let i=0;i<8;i++)await Promise.resolve()}
test('debris spreads toward the back wall, stays on the floor, and preserves deterministic positions',()=>{
 const h=rig();let far=0;const xs=[];
 for(let id=1;id<=280;id++){
  const p=h.heapSpot(id,id%2?1:-1);assert(p.z<-.9&&p.z>-44);assert(Math.abs(p.x)<2.4);far=Math.min(far,p.z);xs.push(p.x);
  assert.deepEqual(p.toArray(),h.heapSpot(id,id%2?1:-1).toArray());
  const {obj,b}=piece(h,id%3?[.15,.85,.19]:[.38,.46,.4]);const pose=h.heapPose(obj,h.heapVertices(obj),id,id%2?1:-1);
  assert(Math.abs(pose.bounds.min.y-.012)<1e-8,'bottom touches floor without sinking');assert(pose.bounds.max.y<.65);
  assert(pose.bounds.min.x>=-2.381&&pose.bounds.max.x<=2.381);assert([...pose.to.toArray(),...pose.q.toArray()].every(Number.isFinite));obj.removeFromParent();
 }
 assert(far<-41);assert(Math.min(...xs)<-1.7&&Math.max(...xs)>1.7);
});
test('head and limb leave their owner, land without teleporting, and survive snapshot/save/reload',async()=>{
 const h=rig(),{obj,owner,b}=piece(h);const start=obj.position.clone();assert(h.overflow(owner,obj));assert.equal(owner.bits.length,0);assert.equal(owner.severedHeads.length,0);
 assert.equal(b.twitch,null);assert.equal(b.bleed,null);h.updateHeap(.016);assert(obj.position.distanceTo(start)<.2);
 for(let i=0;i<100;i++)h.updateHeap(.016);h.drain();assert.equal(h.HEAP.list.length,1);assert.equal(h.HEAP.fly.length,0);assert.equal(h.HEAP.wait.length,0);assert(h.released.includes(obj));
 const original=Array.from(h.HEAP.list[0].mesh.geometry.attributes.position.array);h.clearHeap();h.loadHeap();await settle();
 assert.equal(h.HEAP.list.length,1);assert.deepEqual(Array.from(h.HEAP.list[0].mesh.geometry.attributes.position.array),original);
});
test('rounded cut torso surfaces touch the floor despite stale bounds and unreferenced vertices',()=>{
 const h=rig(),{obj,owner,b}=piece(h);
 const geo=new THREE.SphereGeometry(.3,20,16).scale(1,1.9,.7),pos=geo.attributes.position.array;
 // The cutter can leave unused source vertices behind; they are never rendered.
 const points=new Float32Array(pos.length+3);points.set(pos);points.set([0,-8,0],pos.length);
 geo.setAttribute('position',new THREE.BufferAttribute(points,3));geo.computeBoundingBox();obj.geometry=geo;
 obj.rotation.set(.6,.9,.4);obj.scale.set(1.2,.8,1.1);b.corners=corners(obj);
 assert(h.toHeap(owner,b));
 const f=h.HEAP.fly[0],v=V3();let landing=Infinity;
 for(const i of geo.index.array)landing=Math.min(landing,v.fromBufferAttribute(geo.attributes.position,i).multiply(obj.scale).applyQuaternion(f.q1).add(f.to).y);
 assert(Math.abs(landing-.012)<1e-6,'the original model touches the floor before snapshotting');
 h.flushHeap();const sn=h.db.get('h1');
 let lowest=Infinity;for(const i of sn.i)lowest=Math.min(lowest,sn.p[i*3+1]);
 assert(Math.abs(lowest-.012)<1e-6,'the rendered surface, not an empty box corner, touches the floor: '+lowest);
});
test('hidden ancestors and discarded halo geometry cannot prop up a body fragment',()=>{
 const h=rig(),obj=new THREE.Group();h.scene.add(obj);
 const body=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),new THREE.MeshStandardMaterial());obj.add(body);
 for(const kind of ['hidden','halo','discard','material']){
  const parent=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(20,20,20),new THREE.MeshStandardMaterial());parent.add(mesh);obj.add(parent);
  if(kind==='hidden')parent.visible=false;if(kind==='halo')parent.name='halo';if(kind==='discard')parent.userData.factoryDiscard=true;if(kind==='material')mesh.material.visible=false;
 }
 const points=h.heapVertices(obj),pose=h.heapPose(obj,points,1,1);
 assert(points.length>0&&points.length<2000);assert(pose.bounds.getSize(V3()).length()<1.1);
 assert(Math.abs(pose.bounds.min.y-.012)<1e-6);
});
test('version 3 floating saves are grounded once without losing the saved piece',async()=>{
 const h=rig(),{owner,b}=piece(h);h.toHeap(owner,b);h.flushHeap();h.clearHeap();
 const old=h.db.get('h1');for(let i=1;i<old.p.length;i+=3)old.p[i]+=1.1;
 h.storage.set('palja.heap',JSON.stringify({v:3,q:1,l:[[1,1,3]]}));h.loadHeap();await settle();
 assert.equal(h.HEAP.list.length,1);assert(Math.abs(h.HEAP.list[0].bounds.min.y-.012)<1e-6);
 assert.equal(JSON.parse(h.storage.get('palja.heap')).v,4);
 const fixed=Array.from(h.db.get('h1').p);h.clearHeap();h.loadHeap();await settle();assert.deepEqual(Array.from(h.db.get('h1').p),fixed);
});
test('overlapping bounding boxes do not lift pieces into empty space',()=>{
 const h=rig(),{obj,b}=piece(h,[.4,.45,.4]),pose=h.heapPose(obj,h.heapVertices(obj),1,1);
 h.HEAP.list.push({bounds:new THREE.Box3(V3(pose.to.x-.4,0,pose.to.z-.4),V3(pose.to.x+.4,.2,pose.to.z+.4))});
 const stacked=h.heapPose(obj,h.heapVertices(obj),1,1);assert(Math.abs(stacked.bounds.min.y-.012)<1e-8);assert(stacked.bounds.max.y<.9);
});
test('old two-pile saves and spike heads migrate once; reload retains the exact migrated geometry',async()=>{
 const h=rig(),{owner,b}=piece(h);h.toHeap(owner,b);h.flushHeap();const before=h.db.get('h1');
 h.clearHeap();h.storage.set('palja.heap',JSON.stringify({q:1,l:[[1,1]]}));h.S.items.push({head:2,seed:19});h.loadHeap();await settle();
 assert.equal(h.HEAP.legacy.length,1);h.updateHeap(.016);h.drain();assert.equal(h.S.items[0].head,0);assert.equal(h.HEAP.list.length,2);
 const saved=Array.from(h.db.get('h1').p);assert.equal(JSON.parse(h.storage.get('palja.heap')).v,4);
 h.clearHeap();h.loadHeap();await settle();h.updateHeap(.016);h.drain();assert.equal(h.HEAP.list.length,2);assert.deepEqual(Array.from(h.db.get('h1').p),saved);
});
test('saving during asynchronous restore keeps unread records and cancelled reads do not reappear after cleaning',async()=>{
 const h=rig(),{owner,b}=piece(h);h.toHeap(owner,b);h.flushHeap();h.clearHeap();let resolve;
 h.scope.DB.get=()=>new Promise(r=>resolve=r);h.loadHeap();h.saveHeap();assert.equal(JSON.parse(h.storage.get('palja.heap')).l.length,1);
 h.S.gen++;h.clearHeap();resolve(h.db.get('h1'));await settle();assert.equal(h.HEAP.list.length,0);assert.equal(h.HEAP.pending.size,0);
});
test('long sessions have bounded geometry and batch colors stay identical to the unbatched pieces',()=>{
 const h=rig();for(let n=0;n<350;n++){const {owner,b}=piece(h);h.toHeap(owner,b);h.flushHeap();h.S.jobs.length=0;h.updateHeapBatches();}
 for(let n=0;n<30;n++)h.updateHeapBatches();assert.equal(h.HEAP.list.length,280);assert.equal(h.db.size,280);
 const batches=[...h.HEAP.batches.values()].filter(b=>b.mesh);assert(batches.length<=16);assert(h.HEAP.list.filter(h=>h.mesh.visible).length<40);
 for(const b of batches){const c=b.mesh.geometry.attributes.color;assert(c.normalized);assert(c.array instanceof Uint8Array);assert(c.array.some(x=>x>0&&x<255));}
 const sample=h.HEAP.list.find(x=>x.batch>=0),batch=h.HEAP.batches.get(sample.batch).mesh;
 assert.deepEqual(Array.from(batch.geometry.attributes.color.array.slice(0,3)),Array.from(sample.mesh.geometry.attributes.color.array.slice(0,3)));
 const all=[...h.HEAP.list.map(o=>o.mesh.geometry),...batches.map(b=>b.mesh.geometry)];let disposed=0;all.forEach(g=>g.addEventListener('dispose',()=>disposed++));
 h.clearHeap();assert.equal(disposed,all.length);assert.equal(h.root.children.length,0);assert.equal(h.HEAP.batches.size,0);
});
