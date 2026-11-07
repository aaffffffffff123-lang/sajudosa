const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
function slice(a,b){const i=code.indexOf(a),j=code.indexOf(b,i);assert(i>=0&&j>i);return code.slice(i,j)}
function setup(){
 const G={mode:'fight',time:20,t0:0,started:true,bar:60,E:{state:'stand'}};
 const TALK={cur:null,q:[],gap:0},QUIP={last:-99,next:0};
 const calls={hush:[],stopped:0};let random=0,ready=true;
 const AUDIO={combatLineReady:()=>ready,hushCombatAccent:all=>calls.hush.push(!!all)};
 const api=vm.runInNewContext(slice('const COMBAT_LINES=','/* ---- 추임새:')+
  ';({deityHasReptileVoice,COMBAT_LINES,COMBAT_VOICE,combatHitLine,combatVoiceReset,uncannyVoiceAllowed,uncannyVoiceStarted,uncannyVoiceBusy,combatPlayerVoiceBusy,clearCombatAccent})',{
  G,TALK,QUIP,AUDIO,Math:{random:()=>random,max:Math.max},
  talkBusy:()=>!!(TALK.cur||TALK.q.length||TALK.gap),
  clearTalk(){if(TALK.cur)calls.stopped++;TALK.cur=null;TALK.q.length=0;TALK.gap=0},
  queueTalk(lines){for(const n of lines)TALK.q.push({who:n[0],text:n[1],tts:n[5]})}
 });
 return {...api,G,TALK,QUIP,calls,setRandom(v){random=v},setReady(v){ready=v},
  hit(tool='hand',kind=tool==='gun'?'shot':tool==='knife'?'stab':'hook',result={},extra={},part='chest'){
   return api.combatHitLine(tool,kind,{part},{dmg:1,...result},extra)
  },finish(){TALK.q.length=0;TALK.cur=null;G.time+=20}
 };
}
test('a successful hit speaks the matching line; a weapon cannot repeat and a round is capped at two',()=>{
 const h=setup();assert(h.hit());assert.equal(h.TALK.q[0].text,'탈운명 펀치!');
 h.finish();assert(!h.hit());assert(h.hit('knife'));assert.equal(h.TALK.q[0].text,'탈운명 칼빵!');
 h.finish();assert(!h.hit('gun'));assert.equal(h.COMBAT_VOICE.n,2);
 h.combatVoiceReset();assert(h.hit('gun'));assert.equal(h.TALK.q[0].text,'탈운명 샷!');
});
test('changing tools, elapsed time, and unsuccessful contacts cannot announce an attack',()=>{
 const h=setup();h.G.tool='knife';h.G.time=300;assert.equal(h.TALK.q.length,0);
 for(const result of [{blocked:true},{halo:true},{dmg:0}])assert(!h.hit('hand','hook',result));
 for(const extra of [{stomp:true},{quiet:true},{through:true}])assert(!h.hit('hand','hook',{},extra));
 for(const part of ['crown','halo','tablet'])assert(!h.hit('gun','shot',{}, {},part));
 assert(!h.hit('hand','shove'));h.setReady(false);assert(!h.hit('knife'));assert.equal(h.COMBAT_VOICE.n,0);
});
test('opening, first seconds, story beats, pause and final fall block both optional voices',()=>{
 for(const change of [
  {mode:'submit'},{started:false},{opening:true},{walking:true},{inputLocked:true},
  {paused:true},{ended:true},{revival:{}},{revivalPending:true},{crowdBeatUntil:30},
  {offerPending:true},{offerOpen:true},{time:3},{E:{state:'dead'}},{E:{state:'stand',down:{type:'final'}}}
 ]){
  const h=setup();Object.assign(h.G,change);assert(!h.hit());assert(!h.uncannyVoiceAllowed('scream'));
 }
});
test('ordinary early cries stay human; double-throat cries remain sparse even with constant hits',()=>{
 const h=setup();h.G.bar=90;assert(!h.uncannyVoiceAllowed('scream'));h.G.bar=60;
 assert(!h.uncannyVoiceAllowed('grunt'));assert(!h.uncannyVoiceAllowed('oof'));
 assert(h.uncannyVoiceAllowed('scream'));h.uncannyVoiceStarted();assert(h.uncannyVoiceBusy());
 for(let i=0;i<150;i++){h.G.time+=.1;assert(!h.uncannyVoiceAllowed('scream'))}
 h.G.time+=2;assert(!h.uncannyVoiceAllowed('yelp'),'human cannot consume the reptile opportunity');
 h.G.E.headKind='rep';assert(h.uncannyVoiceAllowed('reptile'));h.uncannyVoiceStarted();
 h.G.time+=30;assert(!h.uncannyVoiceAllowed('scream'));assert.equal(h.COMBAT_VOICE.uncannyN,2);
 h.combatVoiceReset();assert(!h.uncannyVoiceBusy());assert(h.uncannyVoiceAllowed('scream'));
});
test('player lines and the other throat leave each other space and do not interrupt authored dialogue',()=>{
 const h=setup();h.uncannyVoiceStarted();assert(!h.hit());h.G.time+=2;assert(!h.hit());
 h.G.time+=3;assert(h.hit());assert(!h.uncannyVoiceAllowed('scream'));
 h.finish();h.TALK.cur={text:'암백ㅋ'};assert(!h.hit('knife'));assert(!h.uncannyVoiceAllowed('scream'));
 h.clearCombatAccent();assert.equal(h.TALK.cur.text,'암백ㅋ','preserve the authored revival line');
 h.TALK.cur={text:'탈운명 펀치!'};h.clearCombatAccent();assert.equal(h.TALK.cur,null);
 assert.equal(h.calls.stopped,1);assert(!h.combatPlayerVoiceBusy());assert(!h.uncannyVoiceBusy());
});
test('skipped opportunities never build a delayed queue or consume the round quota',()=>{
 const h=setup();h.setRandom(.9);for(let i=0;i<20;i++){h.G.time++;assert(!h.hit())}
 assert.equal(h.TALK.q.length,0);assert.equal(h.COMBAT_VOICE.n,0);
 h.setRandom(0);assert(h.hit());h.clearCombatAccent();assert.equal(h.TALK.q.length,0);
 h.G.time+=4;assert(!h.hit('knife'),'cooldown remains after an interrupted line');
});
test('all deployed optional audio is local and the cry index fits the actual PCM file',()=>{
 const root=path.join(__dirname,'../assets');
 for(const tool of ['punch','knife','shot'])assert(fs.statSync(path.join(root,`player-unfate-${tool}-ko-male.mp3`)).size>4000);
 const index=JSON.parse(fs.readFileSync(path.join(root,'uncanny-cries-v2.json')));
 const wav=fs.readFileSync(path.join(root,'uncanny-cries-v2.wav'));assert.equal(wav.toString('ascii',0,4),'RIFF');
 assert.equal(wav.readUInt32LE(24),index.sampleRate);assert.equal(index.clips['uncanny-human'].length,3);assert.equal(index.clips['uncanny-reptile'].length,3);assert.equal(index.clips['reptile-present'].length,8);
 let at=12,data;
 while(at+8<=wav.length){const len=wav.readUInt32LE(at+4);if(wav.toString('ascii',at,at+4)==='data'){data=wav.subarray(at+8,at+8+len);break}at+=8+len+(len%2)}
 assert(data);
 for(const [kind,clips] of Object.entries(index.clips))for(const [start,len] of clips){
  assert((start+len)*2<=data.length);assert(len/index.sampleRate<1.5);
  let peak=0,tail=0;
  for(let i=0;i<len;i++){const x=Math.abs(data.readInt16LE((start+i)*2));peak=Math.max(peak,x);if(i>index.sampleRate*.8)tail+=x*x}
  assert(peak>5000&&peak<31000);if(kind.startsWith('uncanny-'))assert(tail>1e6,'the second throat leaves an audible, bounded tail');
 }
});

test('only a regrown reptile head changes the base voice; exposing the human face does not',()=>{
 const h=setup();
 assert(h.deityHasReptileVoice({headKind:'rep'}));
 for(const e of [{headKind:'human'},{headKind:'human',unmasked:true},{headKind:'human',repFull:true},{unmasked:true,repFull:true},{repFlash:1},{headKind:'rep',headGone:true},{headKind:'rep',headDestroyed:true}])assert(!h.deityHasReptileVoice(e));
});

test('unmasking keeps human cries; regrowth switches to reptile cries with 420 ms of protection',()=>{
 const h=setup(),played=[],ctx={currentTime:0};h.G.E={headKind:'rep'};
 const scope={G:h.G,ctx,ready:()=>true,baking:false,combatPlayerVoiceBusy:()=>false,uncannyVoiceBusy:()=>false,
  reactionNames:['grunt','oof','yelp','scream','groan','gasp','cough','reptile'],deityHasReptileVoice:h.deityHasReptileVoice,
  jawGoneV:false,lastV:-99,SFX:{},uncannyVoiceAllowed:()=>false,playReaction:(name,k)=>{played.push(name);return true}};
 const say=vm.runInNewContext(slice(' function say(name,k=1,raw){','  // 비웃음은 첫 대화')+'}\nsay',scope);
 for(const at of [0,.105,.21,.315,.42,.525,.63,.735,.84]){ctx.currentTime=at;say('yelp',1)}
 assert.deepEqual(played,['reptile','reptile','reptile']);
 for(const exposed of [{headKind:'human'},{headKind:'human',unmasked:true},{headKind:'human',repFull:true}]){
  h.G.E=exposed;ctx.currentTime+=1;say('yelp',1);assert.equal(played.at(-1),'yelp');
 }
 for(const form of ['human','reptile']){
  h.G.E=form==='reptile'?{headKind:'rep'}:{headKind:'human',unmasked:true,repFull:true};scope.SFX['v:uncanny-'+form]=[{}];scope.uncannyVoiceAllowed=()=>true;scope.uncannyVoiceStarted=()=>{};ctx.currentTime+=2;say('scream',1);
  assert.equal(played.at(-1),'uncanny-'+form);
 }
});
