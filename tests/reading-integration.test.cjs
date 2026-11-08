const test=require('node:test'),assert=require('node:assert/strict');
const I=require('../reading-integration.js'),P=require('../period-reading.js'),make=require('./helpers/reading-api.cjs');
const api=make(),old=make(false),NOW=Date.UTC(2026,10,8),plain=x=>JSON.parse(JSON.stringify(x));
const inputs=[
 [{y:1971,m:11,d:19},{h:14,mi:19},false,'sydney',false],
 [{y:1982,m:7,d:8},{h:1,mi:47},false,'newyork',false],
 [{y:1954,m:7,d:24},{h:1,mi:6},false,'sydney',true],
 [{y:1996,m:4,d:5},{h:16,mi:53},false,'seoul',true],
 [{y:1991,m:3,d:13},{h:2,mi:0},false,'seoul',true]
];
for(let i=0;i<120;i++)inputs.push([{y:1955+i%60,m:1+i*7%12,d:1+i*11%28},{h:i*13%24,mi:i*17%60},i%5===0,['seoul','newyork','sydney'][i%3],i%2===0]);
const rows=inputs.map(args=>api.read(...args));
test('original manuscript remains displayed in 125 varied readings; only explained conflict selection may change branch',()=>{
 const reached=new Set();let changed=0;
 for(const {result,view} of rows){
  const snapshot=JSON.stringify(result),baseline=old.v5Reading(result,NOW);
  assert.deepEqual(plain(view.portrait),plain(baseline.portrait));assert.deepEqual(plain(view.origin),plain(baseline.origin));assert.deepEqual(plain(view.core),plain(baseline.core));
  for(const d of view.domains){const b=baseline.domains.find(x=>x.id===d.id);reached.add(d.id);
   if(d.selectionDecision){changed++;assert(d.selectionDecision.discarded.some(x=>x.source==='saju'));assert(d.originalSelection);continue;}
   const text=[d.head,...d.paragraphs,...d.closing].join('\n');for(const t of [b.head,...b.paragraphs,...b.closing])assert(text.includes(t),d.id+' lost '+t);
   assert(!b.note||d.note.value.includes(b.note.value));
  }
  const end=baseline.verdict.match(/[^.!?]+[.!?]+$/)[0].trim();assert(view.verdict.endsWith(end));
  for(const s of baseline.verdict.match(/[^.!?]+[.!?]+/g)||[])assert(view.verdict.includes(s.trim()));
  assert.equal(JSON.stringify(result),snapshot);assert(!/[\u3040-\u30ff]|undefined|NaN/.test(JSON.stringify(view)));
 }
 assert.equal(reached.size,7);
});
test('relationship costs reach the final judgment only with the selected housing or wedding conditions',()=>{
 const d=rows[0].view.domains.find(x=>x.id==='home');assert(d.westernAddedIds.includes('L3'));assert.match(d.closing.at(-1),/함께 살 비용/);assert.match(d.head,/말하지 못한/);assert.match(d.note.addition.value,/집을 마련할 몫/);
});
test('mental checking and physical recovery are connected in the body final',()=>{
 const d=rows[1].view.domains.find(x=>x.id==='body');assert.equal(d.ruleKey,'checking');assert.match(d.closing.at(-1),/걱정과 몸/);assert(d.paragraphs.some(x=>x.includes('마음과 몸에서 따로')));
});
test('starting support is preserved while housing and career guidance are distinguished',()=>{
 const v=rows[2].view,d=v.domains.find(x=>x.id==='family');assert.equal(v.origin.key,'shown');assert(d.paragraphs.some(x=>x.includes('생활과 배움을 받쳐 준 도움과')));assert(d.paragraphs.some(x=>x.includes('배울 돈을 받았다는 사실과')));
});
test('moving work requires fresh proof in the title and ending, without removing the old work scene',()=>{
 const d=rows[3].view.domains.find(x=>x.id==='work');assert(d.westernAddedIds.includes('W4'));assert.match(d.head,/옮겨서/);assert.match(d.closing.at(-1),/떠난 뒤/);assert(d.paragraphs.includes(d.integration.originalHead));assert(d.integration.originalClosing.every(x=>d.closing.includes(x)));
});
test('already coherent money, helper and authority endings stay last',()=>{
 for(const {result,view} of rows){const b=old.v5Reading(result,NOW);for(const id of ['money','gwiin','office']){const d=view.domains.find(x=>x.id===id),before=b.domains.find(x=>x.id===id);if(!d.selectionDecision)assert.equal(d.closing.at(-1),before.closing.at(-1));}}
 const d=rows[4].view.domains.find(x=>x.id==='money');assert.match(d.closing.at(-1),/오늘을 덜 힘들게/);
});
test('conflict policy chooses either system when adverse, but only for identical subject, axis and period',()=>{
 const a={source:'saju',axis:'income',scope:'2026',subject:'self',direction:'up',valence:'support',evidence:[{id:'a'}]};
 const b={...a,source:'western',direction:'down',valence:'adverse',evidence:[{id:'b'}]};
 assert.equal(I.resolve([a,b]).chosen[0].source,'western');assert.equal(I.resolve([{...a,valence:'adverse'},{...b,valence:'support'}]).chosen[0].source,'saju');
 for(const changes of [{axis:'housing'},{scope:'2027'},{subject:'parent'}])assert.equal(I.resolve([a,{...b,...changes}]).chosen.length,2);
 assert.equal(I.resolve([a,{...b,direction:'up',valence:'support'}]).discarded.length,0);
 assert.equal(I.resolve([a,{...b,evidence:[]}]).chosen.length,1);
});
test('mixed-result wording changes without relabeling actual saju evidence',()=>{
 assert.equal(I.normalize('돈을 마련하는 팔자입니다. 반복하는 사주입니다.'),'돈을 마련하는 운명입니다. 반복하는 운명입니다.');assert.equal(I.normalize('당신의 사주에서 재성은'),'당신의 사주에서 재성은');
});
test('shared saju and astrology paragraphs also reach the final body judgment',()=>{
 const d=rows[4].view.domains.find(x=>x.id==='body');assert(d.poolIds.includes('B6'));assert.match(d.closing.at(-1),/걱정과 몸/);assert.match(d.note.addition.label,/일이 끝나도/);
});
test('natal help conflict uses the adverse grounded branch and retains the previous selection for audit',()=>{
 const v=plain(old.v5Reading(rows[4].result,NOW)),g=v.domains.find(x=>x.id==='gwiin');g.cause='present';
 I.choose(v,{input:{unknown:false},western:{available:true,unknown:false,planets:[{id:'Jupiter',house:8}],aspects:[{a:'Jupiter',b:'Saturn',angle:90,orb:1}]}},api.V5);
 assert.equal(g.cause,'absent');assert.equal(g.originalSelection.cause,'present');assert(g.selectionDecision.chosen.some(x=>x.source==='western'));assert.equal(g.detail,api.V5.gwiin.absent.detail);
});
test('missing help is not turned into help already received by the connection text',()=>{
 for(const {view} of rows){const g=view.domains.find(x=>x.id==='gwiin');if(g.cause==='absent'&&g.integration)assert.match(g.integration.summary,/받게 된 뒤/);}
});
