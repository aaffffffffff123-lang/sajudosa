const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=code.indexOf(a),j=code.indexOf(b,i);assert(i>=0&&j>i,a);return code.slice(i,j)};
function setup(free=true){
 const spoken=[],G={mode:'fight',free,started:true,time:1,E:{state:'stand',face:{},panic:.8,setEmotion(v){this.emotion=v}}},FREE={busy:false};
 const VOICE={boss:{speed:.95},player:{speed:1.1}},LINES={quip:'운명 최고',freeApology:vm.runInNewContext(code.match(/freeApology:(\[[^\n]*\])/)[1])};
 const BUB={say(anchor,text,dur,o){const b={until:G.time+3,voice:{stop(){b.stopped=true}}};spoken.push({anchor,text,dur,o,b});return b},cut(b){b.voice.stop()}};
 const scope={G,FREE,VOICE,LINES,BUB,V3:()=>({}),AUDIO:{hushCombatAccent(){}},typeTime:()=>2,rnd:(a,b)=>(a+b)/2,
  uncannyVoiceBusy:()=>false,combatPlayerVoiceBusy:()=>false,deityHasReptileVoice:E=>!!E&&!E.headGone&&E.headKind==='rep'};
 const h=vm.runInNewContext(slice('const TALK=','// 천지신명이 지금 하는 말')+slice('function bossAnchor(E){','function startEncounter(){')+slice('const QUIP=','/* ---- 맞히기:')+';({TALK,QUIP,updateQuip,updateTalk,clearTalk,quipReset})',scope);
 return {...h,G,FREE,VOICE,spoken,due(){h.updateQuip();G.time=h.QUIP.next;h.updateQuip();h.updateTalk(.016)}};
}
test('only the two approved apologies alternate with a long cooldown and the sermon voice',()=>{
 const h=setup();h.updateQuip();assert(h.QUIP.next>=11&&h.QUIP.next<=19);assert.equal(h.TALK.q.length,0);
 const expected=['좆같은 운명을 줘서 미안해','천지신명도 천지신명이 처음이라 미안해','좆같은 운명을 줘서 미안해'];
 for(const text of expected){h.G.time=h.QUIP.next;h.updateQuip();h.updateTalk(.016);const last=h.spoken.at(-1);
  assert.equal(last.text,text);assert.equal(last.o.voice,h.VOICE.boss);assert.equal(last.o.tts,null);assert.equal(h.G.E.panic,.8);assert.equal(h.G.E.emotion,undefined);
  assert(h.QUIP.next-h.G.time>=24&&h.QUIP.next-h.G.time<=38);h.clearTalk();}
});
test('hanging, pause, other dialogue and missing mouth postpone speech without building a queue',()=>{
 for(const change of [{inputLocked:true},{paused:true},{walking:true},{opening:true},{started:false}]){
  const h=setup();h.updateQuip();Object.assign(h.G,change);h.G.time=100;h.updateQuip();assert.equal(h.TALK.q.length,0);}
 for(const change of [{headGone:true},{jawGone:true},{headDestroyed:true},{state:'dead'}]){
  const h=setup();h.updateQuip();Object.assign(h.G.E,change);h.G.time=100;h.updateQuip();assert.equal(h.TALK.q.length,0);}
 const h=setup();h.FREE.busy=true;h.G.time=100;h.updateQuip();h.G.time=200;h.updateQuip();assert.equal(h.TALK.q.length,0);
 h.FREE.busy=false;h.TALK.cur={who:'player'};h.G.time=300;h.updateQuip();assert.equal(h.TALK.q.length,0);
 h.TALK.cur=null;h.G.E.headKind='rep';h.G.E.headDestroyed=true;h.due();assert.equal(h.spoken.length,1);
});
test('losing the head cuts an apology; restart clears both the voice and its timer',()=>{
 const h=setup();h.due();h.G.E.headGone=true;h.updateTalk(.016);assert.equal(h.TALK.cur,null);assert(h.spoken[0].b.stopped);
 h.G.E.headGone=false;h.due();h.clearTalk();h.quipReset();assert(h.spoken[1].b.stopped);assert.equal(h.TALK.q.length,0);assert.equal(h.QUIP.next,0);assert.equal(h.QUIP.n,0);
});
test('ordinary fights retain their original line and smug reaction',()=>{
 const h=setup(false);h.due();assert.equal(h.spoken[0].text,'운명 최고');assert.equal(h.G.E.emotion,'smug');assert.equal(h.G.E.panic,0);
});
