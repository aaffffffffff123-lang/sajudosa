const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight-free.js'),'utf8');
const slice=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
function setup(width=390,height=844){
 const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,classList:{add(){},toggle(k,v){this[k]=v}},setAttribute(k,v){this[k]=v}});return nodes.get(id)};
 const obj=v=>({visible:v}),E={root:obj(true),crown:obj(false),tablet:obj(true),tie:obj(true),halo:{root:obj(true)}};
 const G={E,tool:'hand'},S={on:true,total:24,view:false,viewHidden:[],items:[],ui:'',tool:'hand'};
 const VM={root:obj(true)},COMBAT_STAGE={contact:obj(true)},CAM={pos:new THREE.Vector3(),look:new THREE.Vector3(),goalPos:new THREE.Vector3(),goalLook:new THREE.Vector3()};
 let cleared=0;
 const api=vm.runInNewContext(slice(' function setView(on){',' /* ---- 「되살리기」')+slice(' function syncUI(){',' // 이 모드에는 배경음악이 없다')+';({setView,syncUI,camera3})',
  {S,G,VM,COMBAT_STAGE,CAM,$,innerWidth:width,innerHeight:height,ROW_Z0:-2,PI:Math.PI,clearPointers(){cleared++},clearCombatAccent(){},clearTalk(){},focusCanvas(){},canNext:()=>true,canRevive:()=>true});
 return {...api,S,G,VM,COMBAT_STAGE,CAM,$,get cleared(){return cleared}};
}
test('overview keeps the return control reachable and restores the same opponent and tool',()=>{
 const h=setup(),E=h.G.E;assert(h.setView(true));assert(h.G.inputLocked);assert(!E.root.visible);assert(!h.VM.root.visible);
 assert.equal(h.$('#freeBar').hidden,false);assert.equal(h.$('#freeView').textContent,'돌아가기');assert(h.$('#freeNext').disabled&&h.$('#freeRevive').disabled);
 assert.equal(h.$('#freeCount').textContent,'걸어 둔 천지신명 24놈');assert.equal(h.$('#dock').hidden,true);
 assert(h.setView(false));assert(!h.G.inputLocked);assert.equal(h.G.E,E);assert.equal(h.G.tool,'hand');assert(E.root.visible);assert(!E.crown.visible);assert(E.tablet.visible);assert(h.VM.root.visible);
 assert.equal(h.S.viewHidden.length,0);assert.equal(h.$('#freeView').textContent,'둘러보기');assert.equal(h.cleared,2);
});
test('overview cannot interrupt a hanging sequence, pause, or an empty collection',()=>{
 for(const [where,change] of [['S',{seq:{}}],['S',{total:0}],['S',{on:false}],['G',{paused:true}],['G',{inputLocked:true}]]){
  const h=setup();Object.assign(h[where],change);assert(!h.setView(true));assert(h.G.E.root.visible);assert.equal(h.S.view,false);}
 const h=setup();h.setView(true);h.G.paused=true;assert(h.setView(false),'leaving/resetting must restore even from a paused overview');
});
test('portrait and landscape gallery cameras contain the first four bodies and show the depth of the rows',()=>{
 for(const [w,h] of [[360,640],[390,844],[412,915],[1280,800],[844,390]]){
  const rig=setup(w,h);rig.setView(true);rig.camera3(10);
  const c=new THREE.PerspectiveCamera(rig.CAM.fovBase,w/h,.05,65);c.position.copy(rig.CAM.pos);c.lookAt(rig.CAM.look);c.updateMatrixWorld(true);
  for(const x of [-1.5,-.7,.7,1.5])for(const y of [.25,2.5])for(const z of [-2,-2.8]){
   const p=new THREE.Vector3(x,y,z).project(c);assert(Math.abs(p.x)<.98,`${w}x${h}: body inside side edge ${p.x}`);assert(p.y<.78&&p.y>-.96,`${w}x${h}: body clear of header ${p.y}`);}
  const front=new THREE.Vector3(1.1,2.2,-2).project(c),back=new THREE.Vector3(1.1,2.2,-10).project(c);assert(back.y>front.y,'farther heads rise behind the front row');
 }
});
test('full original models remain capped at four, reducing only after sustained low performance',()=>{
 let level=0;const cap=vm.runInNewContext(slice(' const realCap=',' // 걸린 몸 본뜨기')+';realCap',{lite:()=>level});
 assert.equal(cap(),4);level=1;assert.equal(cap(),4);level=2;assert.equal(cap(),2);
});
