const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const start=code.indexOf(' let tts=null,backBuffer=null,backLoad=null;');
const end=code.indexOf(' const live=new Set();',start);
function setup(ok=true){
 const played=[],spoken=[];let release;
 const pending=new Promise(resolve=>release=resolve);
 const ctx={decodeAudioData:async()=>({duration:.528}),createBufferSource(){const s={connect(){},disconnect(){},start(){played.push(s)},stop(){s.stopped=true}};return s}};
 const scope={ctx,vbus:{},on:true,Promise,fetch:()=>pending,window:{
  SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
  speechSynthesis:{getVoices:()=>[{name:'English male',lang:'en-US'},{name:'Korean female',lang:'ko-KR'},{name:'Korean male',lang:'ko-KR'}],speak:u=>spoken.push(u),cancel(){}}
 }};
 vm.createContext(scope);vm.runInContext(code.slice(start,end)+';this.speak=speakTTS;this.preload=loadBackVoice;',scope);
 return {scope,played,spoken,release:()=>release({ok,arrayBuffer:async()=>new ArrayBuffer(8)})};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('revival uses the fixed clip and finishes when the clip ends',async()=>{
 const h=setup();const preload=h.scope.preload();h.release();await preload;
 const voice=h.scope.speak('암백');assert.equal(h.played.length,1);assert.equal(h.spoken.length,0);assert.equal(voice.started,true);
 h.played[0].onended();assert.equal(voice.busy,false);
});
test('leaving or restarting before the clip loads cannot play a late voice',async()=>{
 const h=setup(),voice=h.scope.speak('암백');voice.stop();h.release();await flush();
 assert.equal(h.played.length,0);assert.equal(h.spoken.length,0);assert.equal(voice.busy,false);
});
test('a missing clip falls back to Korean text with an available male Korean voice',async()=>{
 const h=setup(false);h.scope.speak('암백');h.release();await flush();
 assert.equal(h.spoken.length,1);assert.equal(h.spoken[0].text,'암백');assert.equal(h.spoken[0].lang,'ko-KR');assert.equal(h.spoken[0].voice.name,'Korean male');
});
test('muted speech creates no playback',()=>{
 const h=setup();h.scope.on=false;assert.equal(h.scope.speak('암백'),null);assert.equal(h.played.length,0);assert.equal(h.spoken.length,0);
});

test('opening line uses the fixed Korean voice clip',async()=>{
 const h=setup();const voice=h.scope.speak('넌 뭐야?');h.release();await flush();
 assert.equal(h.played.length,1);assert.equal(h.spoken.length,0);assert.equal(voice.started,true);
 h.played[0].onended();assert.equal(voice.busy,false);
});
test('interrupting the opening cannot play its clip after the first hit',async()=>{
 const h=setup(),voice=h.scope.speak('넌 뭐야?');voice.stop();h.release();await flush();
 assert.equal(h.played.length,0);assert.equal(voice.busy,false);
});

test('player greeting uses its clip and cannot resume after an early attack',async()=>{
 const h=setup(),greeting=h.scope.speak('천지신명이시여...');
 const attack=h.scope.speak('죽어!');
 h.release();await flush();
 assert.equal(greeting.busy,false);
 assert.equal(h.played.length,0);
 assert.equal(h.spoken.length,1);
 assert.equal(h.spoken[0].text,'죽어!');
 assert.equal(h.spoken[0].lang,'ko-KR');
 assert.equal(h.spoken[0].rate,1.15);
 attack.stop();assert.equal(attack.busy,false);
});

test('player greeting can complete normally',async()=>{
 const h=setup(),voice=h.scope.speak('천지신명이시여...');h.release();await flush();
 assert.equal(h.played.length,1);assert.equal(h.spoken.length,0);
 h.played[0].onended();assert.equal(voice.busy,false);
});
