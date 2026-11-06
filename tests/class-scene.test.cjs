const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),THREE=require('../three.min.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
function slice(a,b){const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)}

test('a speaking follower keeps the original model and returns to the stage after cancellation',()=>{
 const root=new THREE.Group(),congregation=new THREE.Group();
 const people=Array.from({length:6},(_,i)=>{const p={i,s:.85+i*.01,root:new THREE.Group(),body:new THREE.Group(),paper:new THREE.Group(),head:new THREE.Group(),stamp:{visible:true}};root.add(p.root);return p});
 const mood=(p,m)=>p.mood=m;
 const api=vm.runInNewContext(slice(' function witness(v){',' function poseWitness(v){')+';({witness,releaseWitnesses})',{root,congregation,people,mood,stance(){},LEG_LIFT:.12});
 const v={pi:1,cx:.1,cy:0,z:5,scale:1.6,turn:Math.PI},p=people[1];
 for(let n=0;n<3;n++){
  assert.equal(api.witness(v),p);assert.equal(v.actor,p);assert.equal(p.root.parent,congregation);assert(p.root.visible);
  p.head.rotation.x=.5;p.mood='concern';api.releaseWitnesses();
  assert.equal(v.actor,null);assert.equal(p.witness,null);assert.equal(p.root.parent,root);assert(!p.root.visible);
  assert.equal(p.root.scale.x,p.s);assert.equal(p.head.rotation.x,0);assert.equal(p.mood,'normal');
  api.releaseWitnesses();assert.equal(root.children.length,6);
 }
});

test('certificate holders only relax after their own new stamp lands; cancelled events stay cancelled',()=>{
 const G={time:10},state={at:10,ev:[]},root={position:{x:0,z:0}},CAM={pos:{x:0,z:4}};
 const people=Array.from({length:6},(_,i)=>({i,x:i-3,z:0,stamp:{visible:true},stampT:-1,goal:{},mood:'pray'}));
 const scope={G,state,root,CAM,people,stance(p,k){p.pose=k},mood(p,m){p.mood=m},goTo(){},AUDIO:{stamp(){}}};
 const api=vm.runInNewContext(slice(' function setMode(m,at){',' const faceDir=')+slice(' function restamp(){',' function cheer(){')+';({restamp,runEvents,clearEvents})',scope);
 api.restamp();let relaxed=0;
 for(let n=0;n<110;n++){
  G.time=10+n/100;api.runEvents();
  for(const p of people)if(p.mood==='relieved'){relaxed++;assert(p.stamp.visible);assert(G.time-p.stampT>=.2);assert.equal(p.pose,'inspect');}
 }
 assert(relaxed>0);assert(people.every(p=>p.mood==='relieved'));
 api.clearEvents();G.time=20;api.restamp();api.clearEvents();
 for(const p of people){p.mood='normal';p.certCheckAt=-1;p.stampT=-1;}
 G.time=30;api.runEvents();assert(people.every(p=>p.mood==='normal'&&p.certCheckAt===-1&&p.stampT===-1));
});
