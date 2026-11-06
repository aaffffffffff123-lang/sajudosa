const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ReadingProse=require('../reading-prose.js'),Western=require('../western.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),slice=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
const source=slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('/* ---------- 자리 문서(V5)','/* 현재 월운:')+slice('function buildResult(inp,sd){','function resetAll(){');
const api=vm.runInNewContext(source+';({buildResult,v5Reading,V5,currentMonthView:undefined})',{Date,Intl,console,Western,ReadingProse});
const NOW=Date.UTC(2026,10,6),place={name:'서울',lon:126.978,lat:37.5665,tz:'KR',std:9};
function read(y,m,d,{unknown=false,male=true,h=12}={}){const date={y,m,d},input={cal:'solar',date,time:{h,mi:0},unknown,male,place,placeKey:'seoul'},result=api.buildResult(input,date);return {result,view:api.v5Reading(result,NOW)};}
const cases=[];for(const y of [1968,1980,1990,2001])for(const m of [1,4,7,10])for(const unknown of [false,true])cases.push(read(y,m,15,{unknown,male:m%2===1}));
test('all non-money domains deliver their complete scene for known and unknown times',()=>{
 for(const {result,view} of cases)for(const d of view.domains){if(d.id==='money')continue;
  assert(d.paragraphs.length>=4,d.id);assert(d.paragraphs.join(' ').length>=260,d.id);assert(d.closing.endsWith('팔자입니다.'),d.id);
  assert.equal(new Set(d.paragraphs).size,d.paragraphs.length);
  assert(!/undefined|NaN|あなた|언젠가는|힘내세요/.test(d.paragraphs.join(' ')));
  if(result.input.unknown)assert(!d.paragraphs.join(' ').includes('하우스'),d.id);
 }
});
test('every existing cause has a written scene, including every relationship branch',()=>{
 for(const key of Object.keys(api.V5.work))assert(ReadingProse.WORK[key],key);
 for(const item of api.V5.love)assert(ReadingProse.LOVE[item.key],item.key);
 for(const key of Object.keys(api.V5.familyScene))assert(ReadingProse.FAMILY[key],key);
 for(const key of Object.keys(api.V5.office))assert(ReadingProse.OFFICE[key],key);
 for(const [key] of api.V5.body)assert(ReadingProse.BODY[key],key);
});
test('same cause keeps the same manuscript and absent western charts still get complete readings',()=>{
 for(const {result,view} of cases.slice(0,4)){
  assert.deepEqual(api.v5Reading(result,NOW),view);
  const noSky={...result,western:{available:false}},fallback=api.v5Reading(noSky,NOW);
  for(const d of fallback.domains.filter(d=>d.id!=='money')){assert(d.paragraphs.length>=4);assert(!d.paragraphs.join(' ').includes('서양 출생차트'));}
 }
});
test('forecast expansion is tied to that exact period evidence and preserves dates and scores',()=>{
 for(const {result,view} of cases){
  const original=result.reading;
  const pairs=[...view.past.map(p=>[p,p,true]),...view.years.map((y,i)=>[y,original.years[i],false]),...view.luck.cycles.map(x=>[x,x.c,false]),...view.years.flatMap(y=>y.months.map(m=>[m,m,false]))];
  for(const [display,source,past]of pairs){const e=display.expansion;if(!e)continue;assert(source.evidence.some(x=>x.id===e.evidenceId));assert(e.text.length>25);if(past)assert(!/올해|내년|지금|이번/.test(e.text));}
  view.years.forEach((y,i)=>{const old=original.years[i];assert.equal(y.year,old.year);assert.equal(y.periodStart,old.periodStart);assert.equal(y.periodEnd,old.periodEnd);assert.equal(y.score,old.score);});
  assert(!original.years.some(y=>'expansion' in y));
 }
 assert.equal(ReadingProse.periodDetail({evidence:[]}),null);
 const e={id:'favorable:금:관성:정관',domain:'balance',level:2,valence:'support',title:'책임을 받쳐 주는',effect:'힘을 받습니다.'},p={title:e.title,text:e.effect,evidence:[e]};
 assert.equal(ReadingProse.periodDetail(p).tone,'support');assert.notEqual(ReadingProse.periodDetail(p).text,ReadingProse.periodDetail(p,false,'cycle').text);assert.notEqual(ReadingProse.periodDetail(p).text,ReadingProse.periodDetail(p,false,'month').text);
});
if(process.env.PRINT_PROSE){const {view}=read(1990,1,1);for(const d of view.domains.filter(d=>['work','home','office'].includes(d.id)))console.log(d.title+'\n'+d.paragraphs.join('\n\n')+'\n'+d.closing+'\n');}
