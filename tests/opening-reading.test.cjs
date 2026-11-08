// 원문 보존, 별자리의 실제 조건, 생시 미상 제외, 화면 삽입을 함께 검사한다.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const OpeningReading=require('../opening-reading.js'),Western=require('../western.js'),ReadingPool=require('../reading-pool.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a);return html.slice(i,j);};
const source=slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('/* ---------- 자리 문서(V5)','/* 현재 월운:')+slice('function buildResult(inp,sd){','function resetAll(){');
const api=vm.runInNewContext(source+';({buildResult,v5Reading,V5})',{Date,Intl,Western,ReadingPool,OpeningReading,console});
const baseline=vm.runInNewContext(source+';({v5Reading})',{Date,Intl,Western,ReadingPool,console});
const plain=x=>JSON.parse(JSON.stringify(x)),NOW=Date.UTC(2026,10,8);
const entries=x=>[...Object.values(x.portrait).flat(),...x.origin,...x.boss,...x.core];
function read(y,m,d,{h=12,unknown=false,pk='seoul',male=true}={}){
 const place=pk==='seoul'?{name:'서울',lon:126.978,lat:37.5665,tz:'KR',std:9}:{name:'뉴욕',lon:-74.006,lat:40.7128,tz:'America/New_York',std:-5};
 const date={y,m,d},input={name:'검토',cal:'solar',date,time:{h,mi:17},unknown,placeKey:pk,place,occurrence:0,male};
 const result=api.buildResult(input,date);return {result,view:api.v5Reading(result,NOW)};
}
const ALL=[];
for(let i=0;i<120;i++)ALL.push(read(1957+i%57,1+(i*7)%12,1+(i*11)%28,{h:(i*13)%24,unknown:i%5===0,male:i%2===0,pk:i%3?'seoul':'newyork'}));
ALL.push(read(1991,3,13,{h:2}),read(2020,7,16,{unknown:true}));

test('all original reading fields are identical with and without opening additions',()=>{
 for(const {result,view} of ALL){
  const old=plain(baseline.v5Reading(result,NOW)),now=plain(view);delete now.opening;
  assert.deepEqual(now,old,'no original sentence, branch, conclusion or domain changes');
  const snapshot=JSON.stringify([result,view]);OpeningReading.compose(view,result);
  assert.equal(JSON.stringify([result,view]),snapshot,'addition calculation never mutates its inputs');
  assert.deepEqual(plain(OpeningReading.compose(view,result)),plain(view.opening));
 }
});
test('every displayed addition has actual chart evidence, with no duplicate sentences in additions',()=>{
 const signs=new Set(),causes=new Set(),origins=new Set();
 for(const {result,view} of ALL){
  const W=result.western,e=entries(view.opening);assert(e.length>0);
  assert.equal(e.length,new Set(e.map(x=>x.id)).size);
  if(!W.unknown)assert.equal(e.length,9);
  const sentences=new Set();
  for(const x of e){
   assert(x.text.length>=65,x.id);assert(!/undefined|NaN|제\d+하우스|서양 차트|서양 점성술/.test(x.text));
   for(const sentence of x.text.split(/(?<=\.)\s+/)){assert(!sentences.has(sentence),sentence);sentences.add(sentence);}
   for(const f of x.evidence){
    if(f.kind==='sign'){assert.equal(W.planets.find(p=>p.id===f.planet).sign,f.sign);signs.add(f.planet+':'+f.sign);}
    else if(f.kind==='house'){assert(!W.unknown);assert.equal(W.planets.find(p=>p.id===f.planet).house,f.house);}
    else if(f.kind==='asc'){assert(!W.unknown);assert.equal(W.asc.sign,f.sign);}
    else if(f.kind==='houseSign'){assert(!W.unknown);assert.equal((W.asc.sign+f.house-1)%12,f.sign);}
    else if(f.kind==='core')assert.equal(view.core.cause,f.cause);
    else if(f.kind==='aspect')assert(W.aspects.some(a=>a.a===f.a&&a.b===f.b&&a.angle===f.angle));
    else assert.fail(f.kind);
   }
  }
  causes.add(view.core.cause);origins.add(view.origin.key);
 }
 assert(signs.size>=35);assert(causes.size>=10);assert.equal(origins.size,3);
});
test('unknown birth time rejects houses, ascendant, aspects and ambiguous signs, even if supplied accidentally',()=>{
 const {result,view}=ALL[0];
 const forged={...result,input:{...result.input,unknown:true},western:{available:true,unknown:true,asc:{sign:0},planets:[
  {id:'Sun',sign:0,candidates:[0],house:4},{id:'Moon',sign:2,candidates:[2,3],house:4},
  {id:'Mercury',sign:1,candidates:[1],house:3},{id:'Saturn',sign:5,candidates:[5],house:12}
 ],aspects:[{a:'Sun',b:'Saturn',angle:90}]}};
 const x=OpeningReading.compose(view,forged),all=entries(x);
 assert.equal(x.portrait.relationships.length,0);assert.equal(x.origin.length,0);
 assert(all.every(p=>p.evidence.every(e=>e.kind==='core'||e.kind==='sign'&&e.planet!=='Moon')));
 assert.equal(x.core[0].id,'core-sun-0');
 forged.western.unknown=false;assert.deepEqual(OpeningReading.compose(view,forged),x,'input unknown also controls exclusions');
});
test('a real date with both Sun and Moon on sign boundaries does not invent their opening or core text',()=>{
 const {result,view}=read(2002,4,20,{unknown:true,pk:'newyork'});
 assert.equal(result.western.planets.find(p=>p.id==='Sun').sign,null);
 assert.equal(result.western.planets.find(p=>p.id==='Moon').sign,null);
 assert(!view.opening.portrait.opening.some(x=>x.id.startsWith('sun-')));
 assert(view.opening.portrait.opening.every(x=>x.id.startsWith('venus-')));
 assert.equal(view.opening.portrait.relationships.length,0);
 assert.equal(view.opening.origin.length,0);assert.equal(view.opening.core.length,0);
 assert(view.opening.portrait.daily.length&&view.opening.boss.length);
});
test('unavailable or empty charts simply leave every original paragraph alone',()=>{
 const {result,view}=ALL[0];
 for(const western of [null,{available:false},{available:true,planets:[],aspects:[]}])assert.equal(entries(OpeningReading.compose(view,{...result,western})).length,0);
});
test('all twelve sign branches, three origin states and all house branches return complete text',()=>{
 const {result,view}=ALL[0];
 for(let n=0;n<12;n++)for(const key of ['shown','hidden','absent']){
  const planets=['Sun','Moon','Mercury','Saturn','Venus','Mars'].map(id=>({id,sign:n,candidates:[n],house:id==='Saturn'?n+1:1}));
  const x=OpeningReading.compose({...view,origin:{...view.origin,key}}, {...result,input:{...result.input,unknown:false},western:{available:true,unknown:false,asc:{sign:n},planets,aspects:[]}});
  assert.equal(entries(x).length,9);assert(entries(x).every(p=>typeof p.text==='string'&&!/undefined/.test(p.text)));
 }
});

test('all twelve rising signs add physical detail and preserve their original first-impression passage',()=>{
 const {result,view}=ALL[1],seen=new Set();
 for(let sign=0;sign<12;sign++){
  const western={available:true,unknown:false,asc:{sign,longitude:sign*30+12},planets:[],aspects:[]};
  const x=OpeningReading.compose({...view,portrait:[]},{...result,input:{unknown:false},western}).portrait.relationships[0];
  assert.equal(x.id,'asc-'+sign);assert(x.text.split('.').length>=5);
  const first=x.text.split('.')[0];assert.match(first,/눈|턱|목|어깨|팔다리|볼|이마|몸선|얼굴|체격|뼈대/);seen.add(first);
  assert.deepEqual(x.evidence,[{kind:'asc',sign}]);
  const missing=OpeningReading.compose(view,{...result,input:{unknown:false},western:{...western,asc:null}});
  assert.equal(missing.portrait.relationships.length,0);
 }
 assert.equal(seen.size,12);
});
test('existing saju body descriptions are kept without a second anatomy claim from astrology',()=>{
 const {result,view}=ALL[1];
 const anatomical=[...Object.values(api.V5.portraitFeature.flourishing),...Object.values(api.V5.portraitFeature.weak)].filter(t=>!/소리/.test(t));
 const western={available:true,unknown:false,asc:{sign:3,longitude:95},planets:[],aspects:[]};
 for(const feature of anatomical){
  const out={...view,portrait:[view.portrait[0],feature+' '+view.portrait[1],view.portrait[2]]},snapshot=JSON.stringify(out);
  const x=OpeningReading.compose(out,{...result,input:{unknown:false},western}).portrait.relationships[0];
  assert(!x.text.includes('볼과 턱선에 둥근 느낌'));assert(x.text.includes('입가와 눈 주변의 긴장'));
  assert.equal(JSON.stringify(out),snapshot,'retain the original feature and prose');
 }
});
test('the nearest first-house planet supplies one visible gesture, and unknown time removes it',()=>{
 const {result,view}=ALL[1],western={available:true,unknown:false,asc:{sign:0,longitude:15},planets:[
  {id:'Venus',sign:0,longitude:16,house:1},{id:'Mars',sign:0,longitude:9,house:1},
  {id:'Saturn',sign:11,longitude:14.8,house:12}
 ],aspects:[]};
 const get=W=>OpeningReading.compose({...view,portrait:[]},{...result,input:{unknown:W.unknown},western:W});
 const x=get(western).portrait.relationships[0];
 assert(x.text.includes('머리카락과 옷깃'));assert(!x.text.includes('쥔 손'));assert(!x.text.includes('손을 모으고'));
 assert.deepEqual(x.evidence,[{kind:'asc',sign:0},{kind:'house',planet:'Venus',house:1}]);
 assert.deepEqual(get({...western,planets:[...western.planets].reverse()}),get(western),'input order never chooses the planet');
 assert.equal(get({...western,unknown:true}).portrait.relationships.length,0);
 const withoutDegrees=get({...western,asc:{sign:0}}).portrait.relationships[0];
 assert(!withoutDegrees.text.includes('머리카락과 옷깃'));assert(withoutDegrees.text.includes('상체가 먼저'));
});

test('taste and refusal have twelve distinct grounded branches and stay in their intended portrait sections',()=>{
 const {result,view}=ALL[1],tastes=new Set(),reactions=new Set();
 for(let v=0;v<12;v++)for(let m=0;m<12;m++){
  const western={available:true,unknown:false,asc:null,planets:[{id:'Venus',sign:v},{id:'Mars',sign:m}],aspects:[]};
  const x=OpeningReading.compose(view,{...result,input:{unknown:false},western});
  assert.equal(x.portrait.opening.length,1);assert.equal(x.portrait.daily.length,1);assert.equal(x.portrait.relationships.length,0);
  const taste=x.portrait.opening[0],reaction=x.portrait.daily[0];
  assert.equal(taste.id,'venus-'+v);assert.equal(reaction.id,'mars-'+m);
  assert.deepEqual(taste.evidence,[{kind:'sign',planet:'Venus',sign:v}]);
  assert.deepEqual(reaction.evidence,[{kind:'sign',planet:'Mars',sign:m}]);
  for(const entry of [taste,reaction]){
   assert.equal(entry.text.match(/\./g).length,3,'three connected sentences');
   assert.doesNotMatch(entry.text,/undefined|NaN|금성|화성|하우스|운명|팔자|행운의|질병|해야 합니다/);
  }
  tastes.add(taste.text);reactions.add(reaction.text);
 }
 assert.equal(tastes.size,12);assert.equal(reactions.size,12);
});
test('unknown-time taste and refusal use only independently confirmed whole-day signs',()=>{
 const {result,view}=ALL[1];
 const run=(venus,mars,unknown=true)=>OpeningReading.compose(view,{...result,input:{unknown},western:{available:true,unknown,planets:[{id:'Venus',...venus},{id:'Mars',...mars}],aspects:[]}}).portrait;
 const confirmed={sign:1,candidates:[1]},boundary={sign:1,candidates:[1,2]};
 assert.equal(run(confirmed,confirmed).opening[0].id,'venus-1');assert.equal(run(confirmed,confirmed).daily[0].id,'mars-1');
 assert.equal(run(boundary,confirmed).opening.length,0);assert.equal(run(boundary,confirmed).daily.length,1);
 assert.equal(run(confirmed,boundary).opening.length,1);assert.equal(run(confirmed,boundary).daily.length,0);
 for(const invalid of [{sign:null,candidates:[1,2]},{sign:1},{sign:1,candidates:[]},{sign:1,candidates:[2]},{sign:12,candidates:[12]}]){
  assert.equal(run(invalid,invalid).opening.length,0);assert.equal(run(invalid,invalid).daily.length,0);
 }
 assert.equal(run({sign:1},{sign:2},false).opening.length,1,'known birth times use the calculated sign');
});
test('changing taste or refusal changes only that topic, without rewriting existing personality or judgments',()=>{
 const {result,view}=ALL[1],western={...result.western,asc:null,planets:result.western.planets.map(p=>({...p,house:null}))};
 const compose=W=>plain(OpeningReading.compose(view,{...result,input:{...result.input,unknown:false},western:W}));
 const before=compose(western),snapshot=JSON.stringify([view,result]);
 for(const [id,section] of [['Venus','opening'],['Mars','daily']]){
  const changed=compose({...western,planets:western.planets.map(p=>p.id===id?{...p,sign:(p.sign+1)%12}:p)});
  const prefix=id.toLowerCase()+'-';
  assert.notEqual(changed.portrait[section].find(x=>x.id.startsWith(prefix)).text,before.portrait[section].find(x=>x.id.startsWith(prefix)).text);
  const strip=x=>{const y=plain(x);y.portrait[section]=y.portrait[section].filter(p=>!p.id.startsWith(prefix));return y;};
  assert.deepEqual(strip(changed),strip(before));
 }
 assert.equal(JSON.stringify([view,result]),snapshot);
});

// 간단한 DOM 대역에서 실제 삽입 함수를 실행해 원문 문단의 순서와 텍스트를 검사한다.
class Paragraph{
 constructor(text,cls=''){this.innerHTML=text;this.className=cls;this.dataset={};}
 insert(offset,nodes){const siblings=this.parent.children,index=siblings.indexOf(this)+offset;nodes.forEach(n=>n.parent=this.parent);siblings.splice(index,0,...nodes);}
 after(...nodes){this.insert(1,nodes);} before(...nodes){this.insert(0,nodes);}
 get previousElementSibling(){return this.parent.children[this.parent.children.indexOf(this)-1];}
}
class Block{
 constructor(nodes){this.children=nodes;nodes.forEach(n=>n.parent=this);}
 get lastElementChild(){return this.children.at(-1);}
 querySelector(){return this.children.find(n=>n.className==='fate');}
}
test('actual renderer preserves the explanation chain and places added evidence before the final judgment',()=>{
 for(const {view:v} of ALL){
  const blocks={
   'portrait-text':new Block(v.portrait.map(t=>new Paragraph(t))),
   origin:new Block([new Paragraph(v.origin.fact,'basis'),new Paragraph(v.origin.rule,'origin-text'),new Paragraph(v.origin.fate,'fate')]),
   'boss-line':new Block(v.elements[1].split('\n\n').map(t=>new Paragraph(t))),
   'core-body':new Block([...v.core.body.map(t=>new Paragraph(t)),new Paragraph(v.core.rule),new Paragraph(v.core.fate,'fate')])
  };
  const before=Object.fromEntries(Object.entries(blocks).map(([k,b])=>[k,b.children.slice()]));
  const render=vm.runInNewContext(slice('function renderOpeningAdditions(v){','function renderResult(R){')+';renderOpeningAdditions',{
   $:id=>blocks[id],el:(_,cls,text)=>new Paragraph(text,cls),esc:s=>s
  });
  render(v);
  for(const [k,b] of Object.entries(blocks))assert.deepEqual(b.children.filter(p=>!p.dataset.readingId),before[k]);
  assert.equal(blocks.origin.lastElementChild.innerHTML,v.origin.fate);
  assert.equal(blocks['core-body'].lastElementChild.innerHTML,v.core.fate);
  assert.equal(blocks['boss-line'].lastElementChild,before['boss-line'].at(-1));
  assert.equal(blocks['boss-line'].lastElementChild.previousElementSibling.dataset.readingId,v.opening.boss.at(-1).id);
  assert.equal(Object.values(blocks).flatMap(b=>b.children).filter(p=>p.dataset.readingId).length,entries(v.opening).length);
 }
});
