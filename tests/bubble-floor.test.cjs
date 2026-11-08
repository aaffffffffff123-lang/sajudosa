const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){this.parent?.remove(this);return this};
const slice=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i);return src.slice(i,j)},V3=(...a)=>new THREE.Vector3(...a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function canvasContext(){const ellipses=[];return new Proxy({ellipses,font:'20px',ellipse(...args){ellipses.push(args)},measureText(s){return {width:s.length*parseFloat(this.font.replace('700 ',''))*.55}}},{get(t,k){return k in t?t[k]:()=>{}}});}
function floorRig(){
 const textures=[],scene=new THREE.Scene(),PREF={blood:true},ctx={THREE,V3,PI:Math.PI,TAU:Math.PI*2,rnd:(a,b)=>(a+b)/2,clamp,PREF,scene,
 grp(parent,p,name){const o=new THREE.Group();o.name=name||'';parent.add(o);return o},
 canvasTex(){const t=new THREE.Texture();t.userData={ctx:canvasContext()};textures.push(t);return t},
 STD:(color,o)=>new THREE.MeshStandardMaterial({color,...o}),
 mk(geo,mat,parent,o){const m=new THREE.Mesh(geo,mat);m.position.set(...o.p);m.rotation.set(...o.r);parent.add(m);return m}};
 return {...vm.runInNewContext(slice(' const FL={min:', ' // 등받이 판')+';({paintFloor,poolUnder,floorBlob,updateFloor,clearFloor,floorTiles,pool,FL,floorRoot,floorGeo})',ctx),PREF,textures};
}
test('blood crosses all old square edges and new tile seams with the same ellipse',()=>{
 const f=floorRig();for(const [x,z] of [[-1.61,0],[1.61,0],[0,-1.46],[0,1.76],[3,3]]){f.clearFloor();f.paintFloor(x,z,.01,0);assert([...f.floorTiles.values()].some(t=>t.ctx.ellipses.length));}
 f.clearFloor();f.floorBlob(0,0,30,'blue',.5);assert.equal(f.floorTiles.size,4);
 const shapes=[...f.floorTiles.values()].map(t=>{const [x,z,rx,ry,angle]=t.ctx.ellipses[0],scale=f.FL.res/f.FL.size;return [(x-f.FL.pad)/scale+t.x,(z-f.FL.pad)/scale+t.z,rx,ry,angle]});
 for(const a of shapes)for(let i=0;i<a.length;i++)assert(Math.abs(a[i]-shapes[0][i])<1e-12,'same world ellipse on both sides of each seam');
 for(const v of f.floorGeo.attributes.uv.array)assert(v>0&&v<1,'filtering samples a painted gutter rather than the texture edge');
});
test('floor allocations are lazy, reuse tiles, upload only dirty tiles, reset releases textures',()=>{
 const f=floorRig();assert.equal(f.floorTiles.size,0);f.paintFloor(.5,.5,.0001,0);assert.equal(f.floorTiles.size,1);
 const t=[...f.floorTiles.values()][0],version=t.tex.version;f.updateFloor(.02);assert.equal(t.tex.version,version);f.updateFloor(.05);assert.equal(t.tex.version,version+1);f.updateFloor(1);assert.equal(t.tex.version,version+1);
 for(let i=0;i<2000;i++)f.paintFloor(.5,.5,.0001,0);assert.equal(f.floorTiles.size,1);assert.equal(f.pool.size,1);
 let disposed=0;t.tex.addEventListener('dispose',()=>disposed++);f.clearFloor();assert.equal(disposed,1);assert.equal(f.floorRoot.children.length,0);assert.equal(f.pool.size,0);
 f.PREF.blood=false;f.paintFloor(0,0,.01,0);f.poolUnder(0,0,.01);f.updateFloor(.1);assert.equal(f.floorTiles.size,0);assert.equal(f.floorRoot.visible,false);
 f.PREF.blood=true;for(const [x,z] of [[8,0],[0,-8],[NaN,0]]){f.paintFloor(x,z,1,0);f.poolUnder(x,z,1);}assert.equal(f.floorTiles.size,0);assert.equal(f.pool.size,0);
});
function bubbleRig(w,h){
 let now=0;const context=canvasContext(),canvas={width:0,height:0,getContext:()=>context},G={time:0},scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,w/h,.1,100);camera.position.set(0,1.3,3);camera.lookAt(0,1.3,0);camera.updateMatrixWorld(true);
 const ctx={THREE,V3,PI:Math.PI,TAU:Math.PI*2,ZERO3:V3(),clamp,G,camera,vmCam:camera,innerWidth:w,innerHeight:h,window:{devicePixelRatio:1},document:{},performance:{now:()=>now},
 $:s=>s==='#speech'?canvas:s==='#fight .ftop'?{hidden:false,getBoundingClientRect:()=>({bottom:40})}:null,
 LINES:{grab:[],wall:[],wail:[],pray:[],cheer:[],submit:[],whisper:[]},VOICE:{crowd:[{speed:1}]},typeSteps:()=>({total:0,steps:[]}),uncannyVoiceBusy:()=>false,
 AUDIO:{speak:()=>({stop(){this.stopped=true}})},visibleChain:o=>{for(;o;o=o.parent)if(!o.visible)return false;return true}};
 const api=vm.runInNewContext(slice('const BUB=','/* 팔 붙잡기 장면 배치')+slice('function bossAnchor(E){','function updateTalk(dt){')+';({BUB,bossAnchor})',ctx);
 const face=new THREE.Group(),repFaceG=new THREE.Group();scene.add(face,repFaceG);face.position.y=repFaceG.position.y=1.3;
 return {...api,face,repFaceG,E:{face,repFaceG,headKind:'human'},G,draw(){now+=16;G.time+=.016;api.BUB.draw()}};
}
test('quip follows the current face, keeps its side through recoil, and stops following severed heads',()=>{
 for(const [w,h] of [[360,640],[390,844],[1280,800]]){
  const r=bubbleRig(w,h);assert.equal(r.bossAnchor(r.E).obj,r.face);r.E.headKind='rep';assert.equal(r.bossAnchor(r.E).obj,r.repFaceG);
  const b=r.BUB.say({...r.bossAnchor(r.E),toMouth:true},'운명 최고',2,{size:1.35});r.draw();const side=b.mouthSide;let last=b.x;
  for(let i=0;i<80;i++){r.repFaceG.position.x=(i%2?.002:-.002);r.draw();assert.equal(b.mouthSide,side);assert(Math.abs(b.x-last)<3,'no left/right teleport');last=b.x;assert(b.x-b.m.rx>=7.9&&b.x+b.m.rx<=w-7.9);}
  const tail=[b.tx,b.ty],voice=b.voice;r.repFaceG.userData.detached=true;r.repFaceG.position.x=2;r.draw();assert(voice.stopped);assert.equal(b.voice,null);assert.deepEqual([b.tx,b.ty],tail,'tail never follows the loose head');
 }
});
