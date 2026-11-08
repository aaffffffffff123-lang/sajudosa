// 설교 장면 → 족치기로 넘어갈 때.
// 1) 종이를 다 구겨도 천지신명의 꾸짖음(「윗사람을 거스르는 자에게는 화가 백 가지라 하였느니라.」)이 끝날 때까지 서 있다가 걸음을 뗀다.
// 2) 회중(합쳐 둔 군중)에서 말한 사람 자리가 족치기 무대의 추종자를 끌고 가지 않는다.
//    예전(두 쌍 판): 같은 얼굴이 두 자리에서 말하면 앞 자리에 그 사람 표시가 남아, 족치기 무대에서 그 추종자가 매 프레임 회중 자리로 옮겨졌다
//    (등을 보인 채 크게 앞을 막고 다른 추종자와 몸이 겹치고, 그 사람의 눈물은 원래 서 있던 빈자리에서 튀었다).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),test=require('node:test');
const THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const section=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};

test('after the paper is crumpled the walk waits for the scolding to be spoken, then a short beat',()=>{
 // 종이를 다 구긴 때(doneAt)=5초. 꾸짖음이 그 뒤로 scold초 더 남아 있으면 끝나고 .5초 뒤, 없으면 예전처럼 .32초 뒤
 for(const [scold,expect] of [[2.1,7.6],[0,5.32],[.1,5.6]]){
  const G={mode:'submit',time:5},CRUMPLE={done:true,doneAt:5,quietAt:0,c:1},WALK={on:false};let started=null;
  const ctx={G,CRUMPLE,WALK,INTRO:{stage:'arrived',hintAt:0},bossTalkLeft:()=>5+scold-G.time,walkStart(){started=G.time;WALK.on=true;}};
  const api=vm.runInNewContext(section('function updateCrumple(dt){','// 걸어서 도착할 자리')+';({updateCrumple})',ctx);
  for(let f=0;f<=60*4&&started==null;f++){G.time=5+f/60;api.updateCrumple(1/60);}
  assert(started!=null,'the walk starts');
  assert(started>=expect-1e-9&&started<expect+1/60+1e-9,`scolding ${scold}s → walk at ${started}`);
 }
 // 혹시 말이 끝나지 않아도 오래 붙잡아 두지는 않는다
 const G={mode:'submit',time:0},CRUMPLE={done:true,doneAt:0,quietAt:0},WALK={on:false};let started=null;
 const api=vm.runInNewContext(section('function updateCrumple(dt){','// 걸어서 도착할 자리')+';({updateCrumple})',
  {G,CRUMPLE,WALK,INTRO:{stage:'arrived',hintAt:0},bossTalkLeft:()=>99,walkStart(){started=G.time;WALK.on=true;}});
 for(let f=0;f<=60*10&&started==null;f++){G.time=f/60;api.updateCrumple(1/60);}
 assert(started>8&&started<8.1);
});

test('one person stands in one congregation place; leaving the congregation clears every place',()=>{
 const people=[0,1,2].map(i=>{const root=new THREE.Group(),head=new THREE.Group(),paper=new THREE.Group(),body=new THREE.Group();root.add(body);body.add(head);
  return {i,root,head,paper,body,stamp:{visible:true},witness:null};});
 const root=new THREE.Group(),congregation=new THREE.Group();root.name='fate-beneficiaries';
 for(const p of people)root.add(p.root);
 const api=vm.runInNewContext(section(' function witness(v){',' function poseWitness(v){')+';({witness,releaseWitnesses})',
  {people,root,congregation,LEG_LIFT:.2,stance(){},mood(){}});
 const a={pi:1,cx:.3,z:2,scale:1.5,turn:Math.PI},b={pi:1,cx:-.4,z:3,scale:1.5,turn:Math.PI};
 api.witness(a);assert.equal(a.actor,people[1]);
 api.witness(b);assert.equal(b.actor,people[1]);assert.equal(a.actor,null,'the earlier place lets go of the same person');
 api.releaseWitnesses();assert.equal(b.actor,null);assert.equal(people[1].root.parent,root);assert.equal(people[1].witness,null);
});

test('resetting the congregation forgets actors, and nothing poses the stage crowd once the congregation is hidden',()=>{
 const stale={actor:{i:4},x:.1,z:2,turn:3.2,pi:4},plain={x:-1,z:3,turn:3.1,pi:2};
 let released=0,written=0;const crowd={visible:true,userData:{place:[[plain],[stale]]}};
 const reset=vm.runInNewContext(section(' function resetCrowd(){',' function part(')+';({resetCrowd})',
  {CROWD:{releaseWitnesses(){released++}},PART:{on:true},stareReset(){},crowd,writeCrowd(){written++}});
 reset.resetCrowd();assert.equal(released,1);assert.equal(stale.actor,null);assert.equal(written,1);
 // 회중이 치워진 뒤(족치기 무대): 남은 표시가 있더라도 아무도 회중 자리로 옮기지 않는다
 stale.actor={i:4};crowd.visible=false;let posed=0,stared=0;
 const part=vm.runInNewContext(section(' function updatePart(){',' /* ---- 설교를 끊으면')+';({updatePart})',
  {crowd,PART:{on:false},G:{time:0},CROWD:{poseWitness(){posed++}},updateStare(){stared++;return false},writeCrowd(){},lerp:(a,b,t)=>a+(b-a)*t,smoother:t=>t,PI:Math.PI,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
   forPlaces:fn=>{for(const list of crowd.userData.place)for(const v of list)fn(v);}});
 part.updatePart();assert.equal(posed,0);
 crowd.visible=true;part.updatePart();assert.equal(posed,1,'while the congregation is shown its speakers are posed as before');
});
