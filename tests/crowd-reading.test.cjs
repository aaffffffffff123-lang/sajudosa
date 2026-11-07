const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const C=require('../crowd-lines.js'),ReadingPool=require('../reading-pool.js'),W=require('../western.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),fight=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const part=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i,a);return s.slice(i,j)};
const slice=(a,b)=>part(html,a,b),cut=(a,b)=>part(fight,a,b);
const source=slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('/* ---------- 자리 문서(V5)','/* 현재 월운:')+slice('function buildResult(inp,sd){','function resetAll(){');
const core=vm.runInNewContext(source+';({buildResult,v5Reading,PLACES})',{Date,Intl,Western:W,ReadingPool});
const NOW=Date.UTC(2026,10,7),HOUR=3600000;
const places=Object.fromEntries(core.PLACES.flatMap(g=>g[1].map(p=>[p[0],{name:p[1],lon:p[2],lat:W.LATITUDES[p[0]],tz:p[3]||'KR',std:p[4]==null?9:p[4]}])));
function read(y,m,d,h=12,unknown=false,pk='seoul',male=true){
 const date={y,m,d},inp={name:'',cal:'solar',date,time:{h,mi:0},unknown,male,placeKey:pk,place:places[pk],occurrence:0};
 const result=core.buildResult(inp,date),view=core.v5Reading(result,NOW);
 return {result,view};
}
// Execute the same bridge as renderResult; the combat module can load after the reading is displayed.
function snapshot(result,view){
 const R={solarDate:result.solarDate};
 vm.runInNewContext(slice(' R.paper={'," $('caution').innerHTML"),{R,v:view,now:NOW,HOUR,Date});
 return C.fromReading(R.paper.crowd,R.paper.crowd.age);
}
const ALL=[];
for(let i=0;i<96;i++)ALL.push(read(1960+i%46,1+i%12,1+(i*7)%28,(i*11)%24,i%5===0,i%2?'seoul':'busan',i%3!==0));
ALL.push(read(1991,3,13,1),read(2018,4,7,12,true),read(2009,7,4));

test('real readings hand their displayed branches and paragraphs to the crowd, including unknown times',()=>{
 const origins=new Set(),offices=new Set(),heard=new Set();let min=Infinity,max=0,westernChanges=0;
 for(const {result,view} of ALL){
  const s=snapshot(result,view),pool=C.eligible(s),gw=view.domains.find(d=>d.id==='gwiin').cause,office=view.domains.find(d=>d.id==='office').cause;
  assert(pool.length>=3,'each real reading has multiple coherent exchanges');min=Math.min(min,pool.length);max=Math.max(max,pool.length);
  origins.add(view.origin.key);offices.add(office);pool.forEach(e=>heard.add(e.id));
  assert.equal(pool.some(e=>e.id.startsWith('origin-empty')),view.origin.key==='absent');
  assert.equal(pool.some(e=>e.id.startsWith('origin-backed')),view.origin.key==='shown');
  assert.equal(pool.some(e=>e.id.startsWith('no-helper')),gw==='absent');
  assert.equal(pool.some(e=>e.id.startsWith('helped')),gw==='present');
  assert.equal(pool.some(e=>e.id.startsWith('supported-office')),office==='supported');
  if(result.input.unknown)assert(!pool.some(e=>e.id.startsWith('no-officer')),'missing birth time is not proof of absent officer stars');
  if(2026-result.solarDate.y<20)assert(!pool.some(e=>e.needs.some(n=>n.includes('adult'))));
  for(const tag of s.tags.filter(t=>t.startsWith('pool:')))assert(view.domains.some(d=>(d.poolIds||[]).includes(tag.slice(5))));
  const base=core.v5Reading({...result,western:{available:false}},NOW),baseIds=new Set(C.eligible(snapshot(result,base)).map(e=>e.id));
  westernChanges+=pool.some(e=>!baseIds.has(e.id))?1:0;
 }
 assert.equal(origins.size,3);assert(offices.size>=5);assert(heard.size>=45);assert(westernChanges>0,'actual western paragraphs must affect eligible dialogue');
 console.log('rare branches:',C.entries.filter(e=>!heard.has(e.id)).map(e=>e.id).join(', '));
 console.log(`crowd audit: ${ALL.length} charts; ${min}–${max} eligible sets; ${heard.size}/${C.entries.length} sets reached; ${westernChanges} western-expanded pools`);
});

test('missing or excluded paragraphs cannot authorize insults or a western attribution',()=>{
 const view={origin:{key:'shown'},marks:{},domains:[{id:'work',cause:'skill',paragraphs:['실제로 보인 문단'],poolIds:[],westernAddedIds:['W1']}]};
 let s=C.fromReading(view,36);assert(!s.westernIds.includes('W1'));assert(!C.eligible(s).some(e=>e.id.startsWith('extra-work')));
 view.domains[0].poolIds=['W1'];s=C.fromReading(view,36);
 const e=C.entries.find(e=>e.id==='extra-work-0'),used=new Set(C.eligible(s).filter(x=>x.id!==e.id).map(x=>x.id));
 assert.equal(C.choose(s,used,()=>0).say,e.western.say);
 view.domains[0].westernAddedIds=[];s=C.fromReading(view,36);
 assert.equal(C.choose(s,used,()=>0).say,e.say,'same paragraph from saju must not be attributed to astrology');
 assert.equal(C.choose(null),null);assert.equal(C.choose(C.fromReading(null)),null);
});

test('education and birth support produce different contempt instead of contradicting the reading',()=>{
 const make=(origin,cause,ids=[])=>C.eligible(C.fromReading({origin:{key:origin},marks:{},domains:[{id:'money',cause,paragraphs:['풀이'],poolIds:ids}]},35));
 assert(make('absent','interrupted').some(e=>e.id.startsWith('study-stopped')));
 assert(!make('shown','reserve',['learning']).some(e=>e.id.startsWith('study-gap')));
 assert(make('shown','reserve',['learning']).some(e=>e.id.startsWith('study-funded')));
 assert(!make('shown','reserve').some(e=>e.id.startsWith('study-funded')));
 assert(!make('absent','poor').some(e=>e.id.startsWith('study-funded')));
 // Weak authority is not the same claim as literally no officer stars.
 const weak=C.fromReading({origin:{key:'hidden'},marks:{noOfficer:false},domains:[{id:'office',cause:'weak',detail:'약하지만 있음'}]},35);
 assert(C.eligible(weak).some(e=>e.id==='weak-office-0'));assert(!C.eligible(weak).some(e=>e.id.startsWith('no-officer')));
});

test('all three voices stay on one subject, finish within the existing walk, and cancel together',()=>{
 const timing=vm.runInNewContext(cut('const TYPE=','/* 스프링:')+cut('const VOICE={','/* 말풍선:')+';({typeTime,VOICE})');
 for(const entry of C.entries)for(const say of [entry.say,...(entry.western?[entry.western.say]:[])]){
  const pair={...entry,say},STARE={on:true,t0:0,talk:[],used:new Set(),exchange:{pair,side:1,aside:null,say}},G={time:0},WALK={dur:4.35,on:true,t:0};
  const said=[],a={pi:1-entry.who},b={pi:4};
  const scope={STARE,G,WALK,...timing,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),CROWD:{witness(){}},walkSpeaker:(side,end,reply)=>reply?a:b,sayWhisper:(who,text)=>said.push(text)};
  const api=vm.runInNewContext(cut(' function planWhispers(){',' function anchorOf(')+cut(' function updateWhispers(){',' // 매 프레임:')+cut(' function stareReset(){',' function forPlaces(')+';({planWhispers,updateWhispers,stareReset})',scope);
  api.planWhispers();assert.equal(STARE.talk.length,2);assert.equal(STARE.talk[0].text,say);assert.equal(STARE.talk[1].text,entry.end);
  const span=(text,who)=>Math.max(1.5,timing.typeTime(text,timing.VOICE.crowd[who.pi].speed*1.08)+.68);
  assert(STARE.talk[0].at+span(say,a)<=STARE.talk[1].at,entry.id+' overlapping dialogue');
  assert(STARE.talk[1].at+span(entry.end,b)<=WALK.dur-.1,entry.id+' unread last line');
  api.stareReset();WALK.t=4.3;api.updateWhispers();assert.equal(said.length,0);assert.equal(STARE.exchange,null);
 }
});

test('the deferred scene loads dialogue before combat and can retry a failed load',async()=>{
 const calls=[],window={};let fail=true;
 const loadScript=async(src,ready)=>{if(ready())return;calls.push(src[0]);if(src[0].startsWith('crowd-lines')&&fail){fail=false;throw Error('temporary network error');}if(src[0].startsWith('crowd-lines'))window.CrowdLines=C;};
 const load=vm.runInNewContext('let fightScripts=null;'+slice('function loadFight(){',"if('IntersectionObserver'")+';loadFight',{window,loadScript,THREE_SRC:['three.min.js']});
 await assert.rejects(load(),/temporary/);await load();
 assert(calls.indexOf('crowd-lines.js?v=20261107-reading-crowd')<calls.indexOf('fight.js?v=20261107-reading-crowd'));
});
