const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
const api=vm.runInNewContext(slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('function cycleAgeLabel(', 'function luckGraph(')+';({computeChart,makeReading,modernizeReadingDisplay,cycleAgeLabel,pastReadingText})',{Intl,Date});
const place={name:'서울',lon:126.978,tz:'KR',std:9};
function reading(y,m,d,unknown=true,male=true){
 const input={name:'',cal:'solar',date:{y,m,d},unknown,male,place,placeKey:'seoul',time:{h:9,mi:30}};
 const chart=api.computeChart({y,m,d,h:9,mi:30,unknown,male,place});
 return api.modernizeReadingDisplay(api.makeReading(chart,input,Date.UTC(2026,10,3)));
}
test('historical years never refer to this year, now or next year',()=>{
 for(const y of [1965,1980,1990,2000,2010])for(const unknown of [true,false])for(const male of [true,false]){
  const r=reading(y,1,1,unknown,male);
  for(const h of r.pastHits){assert(h.year<2026);assert(!/올해|이번|지금|내년/.test(h.title+' '+h.text),JSON.stringify(h));}
 }
});
test('unknown birth time has year-level age; even known time omits false day/hour precision',()=>{
 const cy={age:28,ageMonths:3,ageDays:28,ageHours:6};
 assert.equal(api.cycleAgeLabel(cy,true),'약 만 28세 무렵');
 assert.equal(api.cycleAgeLabel(cy,false),'만 28세 3개월');
});
test('actual readings retain six substantive domains without duplicate body sentences',()=>{
 for(const args of [[1990,1,1],[1987,8,14],[2001,6,21],[1972,11,9]]){
  const r=reading(...args),seen=new Set();assert.equal(r.sections.length,6);
  for(const sec of r.sections){assert(sec.head);assert(sec.body.length,sec.id);for(const b of sec.body)for(const sentence of b.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]){const s=sentence.trim();assert(!seen.has(s),s);seen.add(s);}}
  assert(r.cautions.length);assert(r.verdict.includes('팔자'));
 }
});
if(process.env.PRINT_READING){const r=reading(1990,1,1);console.log(JSON.stringify({sections:r.sections,past:r.pastHits.map(({year,title,text})=>({year,title,text})),years:r.years.map(({year,title,text})=>({year,title,text})),cycles:r.luck.cycles.filter(c=>c.i>=r.luck.current&&c.i<r.luck.current+3).map(({title,text})=>({title,text})),verdict:r.verdict,cautions:r.cautions},null,2));}
