const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const code=source.slice(source.indexOf(' const music={'),source.indexOf(' function makeIR('));
function setup(){
 const sources=[],gains=[];let resolve;
 const pending=new Promise(r=>resolve=r);
 const ctx={currentTime:0,decodeAudioData:async()=>({duration:128*60/196}),createBufferSource(){const s={connect(){},disconnect(){},start(t,offset){this.offset=offset;this.started=true},stop(t){this.stopped=t}};sources.push(s);return s},createGain(){const g={gain:{value:0,setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},setTargetAtTime(v){this.value=v},cancelScheduledValues(){}},connect(){},disconnect(){}};gains.push(g);return g}};
 const api=vm.runInNewContext(code+';({music,loadMusic,updateMusic,stopMusic})',{ctx,comp:{},fetch:()=>pending,Promise});
 return {...api,ctx,sources,gains,resolve:()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('preload is silent; combat starts exactly one looping source and ducks under dialogue',async()=>{
 const h=setup();const load=h.loadMusic();h.resolve();await load;assert.equal(h.sources.length,0);
 for(let i=0;i<200;i++)h.updateMusic(true,false);
 assert.equal(h.sources.length,1);assert(h.sources[0].loop);assert.equal(h.sources[0].loopEnd,128*60/196);
 const loud=h.gains[0].gain.value;h.updateMusic(true,true);assert(h.gains[0].gain.value<loud*.3);
 h.updateMusic(true,false);assert.equal(h.gains[0].gain.value,loud);
});
test('leaving while the file loads cannot produce late music',async()=>{
 const h=setup();h.updateMusic(true);h.stopMusic();h.resolve();await flush();
 assert.equal(h.sources.length,0);assert(!h.music.wanted);
});
test('background pause resumes at the saved beat; restarting clears the offset',async()=>{
 const h=setup();h.updateMusic(true);h.resolve();await flush();h.ctx.currentTime=7;
 h.stopMusic(false,0);assert.equal(h.music.offset,7);assert.equal(h.sources.length,1);
 h.ctx.currentTime=100;h.updateMusic(true);assert.equal(h.sources[1].offset,7);
 h.stopMusic(true,0);h.updateMusic(true);assert.equal(h.sources[2].offset,0);
});
test('death stops the loop and repeated idle frames do not schedule another stop or playback',async()=>{
 const h=setup();h.updateMusic(true);h.resolve();await flush();h.stopMusic(true,.22);
 for(let i=0;i<120;i++)h.updateMusic(false);
 assert.equal(h.sources.length,1);assert.equal(h.music.source,null);assert.equal(h.music.offset,0);
});
test('saved defeat count survives reload and ignores corrupt or inaccessible storage',()=>{
 const progressCode=source.slice(source.indexOf('const PROGRESS='),source.indexOf('function updateDefeatCount'))+';PROGRESS';
 const data=new Map();const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 let p=vm.runInNewContext(progressCode,{localStorage});assert.equal(p.defeated,0);p.add();p.add();
 p=vm.runInNewContext(progressCode,{localStorage});assert.equal(p.defeated,2);p.add();assert.equal(data.get('palja.defeated'),'3');
 for(const bad of ['bad','-1','1.5','Infinity']){data.set('palja.defeated',bad);assert.equal(vm.runInNewContext(progressCode,{localStorage}).defeated,0)}
 p=vm.runInNewContext(progressCode,{localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}});assert.equal(p.add(),1);
});
