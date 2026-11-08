// 칼로 목을 세 번 가로질러 그으면 머리가 떨어진다. 두 번째(동맥) 뒤에 남은 목이 가려지지 않아야 한다.
// 예전: 두 번째 베임 뒤 머리가 앞으로 늘어지고(.42) 두 손으로 3.2초 목을 움켜쥐며 고개까지 숙여서, 턱·얼굴·손이 남은 목을 덮었다.
// 보통 사람은 세 번째를 긋지 못했다(한 사람이 실제로 그어 보는 시험에서 15~26번).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),test=require('node:test');
const THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const section=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
class Spring{constructor(){this.t=0;this.x=0;this.kicks=[]}kick(v){this.kicks.push(v)}step(){}}
function rig(){
 const neck=new THREE.Group(),acts=[];
 const E={bones:{neck},loll:{sp:new Spring(),sr:new Spring()},sp:{head:{kick(){}},neck:{x:{},y:{},z:{}}},state:'stand',acts,
  doFlinch(){},setEmotion(){},screenSplat(){},doAct(name,o){acts.push([name,o]);return true},neckBack:0,neckCut:{hits:0},voiceCool:0};
 return E;
}
const ctx={THREE,V3,G:{time:0},BLOOD:{addWound(){},spray(){}},AUDIO:{spurt(){},voice(){}},FX:{word(){}},_invB:b=>b.matrixWorld,Spring};
const methods=vm.runInNewContext('({'+section(" neckStage(k,pt,n,dir,side,seg='neck'){",' updateHeadDamage(dt){')+'})',ctx);

test('second throat cut: the head falls back to the side and the gash faces the player',()=>{
 for(const side of [-1,1]){
  const E=rig();E.neckStage=methods.neckStage;E.severHead=()=>assert.fail('not yet');
  E.neckCut.hits=2;E.neckStage(2,V3(0,1.3,.2),V3(0,0,1),V3(1,0,0),side);
  assert(E.loll.sp.t<-.2,'head hangs back, not forward: '+E.loll.sp.t);
  assert.equal(Math.sign(E.loll.sr.t),side);
  const clutch=E.acts.find(a=>a[0]==='clutch');assert(clutch,'still grabs the throat');
  assert(clutch[1].dur<=1.2,'only briefly: '+clutch[1].dur);assert(clutch[1].noBow,'without bowing the head over it');
 }
});
test('third throat cut takes the head off',()=>{
 const E=rig();E.neckStage=methods.neckStage;let off=0;E.severHead=()=>off++;E.neckStage(3,V3(),V3(0,0,1),V3(1,0,0),1);assert.equal(off,1);
});
test('the neck clutch does not bow the head; other clutches still do',()=>{
 const clutch=section("   case 'clutch':{"," case 'face':{");
 assert.match(clutch,/if\(!a\.noBow\)\{out\.sF\+=[^}]*out\.hF\+=/);
});
test('knife strokes across the throat do not raise the boxing guard, and nothing covers the opened throat',()=>{
 const hit=section(' // 막기 시작(두 번째 다운 이후','  // 크게 휘청');
 assert.match(hit,/const throat=part==='neck'\|\|\(HEAD_FLESH\.test\(part\)&&this\.inThroat\(this\.headLocal\(pt\)\)\)/);
 assert.match(hit,/if\(isHead&&!throat&&!neckOpen&&/);
 const idle=section("   if(this.noseBleeding&&!this.wiped)","  if(!c.length)return;");
 assert.match(idle,/if\(this\.phase>=3&&!neckOpen\)c\.push\(\['beg',3\]\)/);assert.match(idle,/if\(this\.phase>=2&&!neckOpen\)c\.push\(\['face',2\]\)/);
});
