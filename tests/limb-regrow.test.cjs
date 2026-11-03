const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a);assert(i>=0,a);const j=source.indexOf(b,i);assert(j>i,b);return source.slice(i,j)};
const api=vm.runInNewContext(slice('const REGROW={','const ARM_CHAIN=')+';({REGROW,regrowTimeline})',{});
test('regrowth runs bone, then flesh, then scales, then waking, in order along the limb',()=>{
 for(const [n,arm] of [[3,true],[2,true],[1,true],[0,true],[3,false],[2,false],[1,false]]){
  const T=api.regrowTimeline(n,arm),RG=api.REGROW;
  for(let j=0;j<n;j++){
   if(j)assert(T.bone[j]>T.bone[j-1]);
   assert(T.raw[j]>T.bone[j]+RG.boneDur,'flesh waits for the bone of its segment');
   assert(T.sc[j]>T.raw[j]+RG.rawLen,'scales wait for the flesh of their segment');
   if(j)assert(T.sc[j]>T.sc[j-1]&&T.raw[j]>T.raw[j-1]);
  }
  assert(T.boneHand>=(n?T.bone[n-1]:0));assert(T.rawHand>T.boneHand);assert(T.scHand>T.rawHand);
  if(n){assert(T.sc[0]>T.rawHand-RG.rawStep*n,'scales start only after the flesh reached the end');assert(T.scHand>T.sc[n-1]);}
  assert(T.wake>T.scHand);assert.equal(T.dur,T.wake+RG.wakeDur*(arm?1:1.12));
 }
});
test('a whole arm regrows in under three seconds; a whole leg takes slightly longer',()=>{
 const arm=api.regrowTimeline(3,true).dur,leg=api.regrowTimeline(3,false).dur;
 assert(arm>2&&arm<3,String(arm));assert(leg>arm&&leg<3.4,String(leg));
});
test('the old balloon finish and item-pickup sparkle are gone from the regrowth',()=>{
 const grow=slice('updateRegrow(dt){','// 도마뱀 팔다리 한 마디');
 assert(!/FX\.add\('glint'/.test(grow));assert(!/AUDIO\.pop\(/.test(grow));
 assert(/boneOut\(/.test(grow)&&/squelch\(/.test(grow)&&/scaleSet\(/.test(grow)&&/hiss\(/.test(grow));
});
