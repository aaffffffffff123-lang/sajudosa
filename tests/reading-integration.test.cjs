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
test('125 readings retain selected scenes and evidence with one heading, one verdict and one note',()=>{
 const reached=new Set();
 for(const {result,view} of rows){
  const snapshot=JSON.stringify(result),baseline=old.v5Reading(result,NOW);
  assert.deepEqual(plain(view.portrait),plain(baseline.portrait));assert.deepEqual(plain(view.origin),plain(baseline.origin));assert.deepEqual(plain(view.core),plain(baseline.core));
  for(const d of view.domains){const b=baseline.domains.find(x=>x.id===d.id);reached.add(d.id);
   assert.equal(d.closing.length,1,d.id+' restarted its verdict');
   assert(!d.note||!d.note.addition,d.id+' has a second note');
   assert(!d.paragraphs.includes(d.head),d.id+' repeats its heading as a paragraph');
   if(d.selectionDecision){assert(d.selectionDecision.discarded.some(x=>x.source==='saju'));assert(d.originalSelection);continue;}
   assert.equal(d.head,b.head);
   assert.deepEqual(plain(d.poolIds),plain(b.poolIds));assert.deepEqual(plain(d.westernAddedIds),plain(b.westernAddedIds));
   const text=d.paragraphs.join(' ');for(const t of b.paragraphs)assert(text.includes(t),d.id+' lost selected scene '+t);
   if(b.note)for(const item of b.note.value.split(/\s*·\s*/))assert(d.note.value.includes(item));
  }
  const end=baseline.verdict.match(/[^.!?]+[.!?]+$/)[0].trim();assert(view.verdict.endsWith(end));
  assert(!view.verdict.includes('그 사이에서도 당신은'));
  assert.equal((view.verdict.match(/당신은|검토 님은/g)||[]).length,1);
  assert.equal(JSON.stringify(result),snapshot);assert(!/[\u3040-\u30ff]|undefined|NaN/.test(JSON.stringify(view)));
  const finished=JSON.stringify(view);I.finish(view,result);assert.equal(JSON.stringify(view),finished);
 }
 assert.equal(reached.size,7);
});
test('an eligible but unselected housing scene does not change a silence judgment',()=>{
 const d=rows[0].view.domains.find(x=>x.id==='home');
 assert(d.candidates.some(x=>x.id==='L3'&&x.western));
 assert(!d.poolIds.includes('L3'));assert.equal(d.closing[0],d.integration.originalClosing[0]);
 assert(!d.note.value.includes('집을 마련할 몫'));assert.match(d.head,/연락은 끊깁니다/);
});

test('physical wear enters the checking judgment only when its scene is displayed',()=>{
 for(const {view} of rows){const d=view.domains.find(x=>x.id==='body');
  if(d.ruleKey!=='checking')continue;
  if(d.poolIds.some(x=>['B2','B6'].includes(x)))assert.match(d.closing[0],/걱정.*닳은 몸/);
  else assert.equal(d.closing[0],d.integration.originalClosing[0]);
 }
});

test('family editing preserves stated support and shows a single coherent scene',()=>{
 const v=rows[2].view,d=v.domains.find(x=>x.id==='family');assert.equal(v.origin.key,'shown');
 assert(d.lifeSelected);assert.equal(d.paragraphs.length,2);assert.equal(d.poolIds.length,0);
 assert(!/받을 것 없이|배울 돈이 없|물려받을 것 없/.test(d.paragraphs.join(' ')));
 assert.equal(d.paragraphs[0],d.detail);assert.equal(d.paragraphs[1],d.rule);
 assert.equal(d.closing.length,1);
});

test('a displayed secondary move keeps the primary work judgment and discarded moves stay out',()=>{
 const candidates=rows.map(x=>x.view.domains.find(d=>d.id==='work')).filter(d=>d.candidates.some(x=>x.id==='W4'));
 const shown=candidates.filter(d=>d.poolIds.includes('W4'));
 assert(shown.length>0);assert(candidates.length>shown.length);
 for(const d of candidates){assert.equal(d.closing[0],d.fates[0]);assert.equal(d.head,d.integration.originalHead);
  assert.equal(d.paragraphs.some(t=>t.includes('이력서')),d.poolIds.includes('W4'));
 }
});

test('already coherent money and authority endings stay last',()=>{
 for(const {result,view} of rows){const b=old.v5Reading(result,NOW);for(const id of ['money','office']){const d=view.domains.find(x=>x.id===id),before=b.domains.find(x=>x.id===id);if(!d.selectionDecision)assert.equal(d.closing.at(-1),before.closing.at(-1));}}
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
test('discarded physical-wear candidates cannot return through notes or judgments',()=>{
 const d=rows[4].view.domains.find(x=>x.id==='body');
 assert(d.candidates.some(x=>x.id==='B6'));assert(!d.poolIds.includes('B6'));
 assert(!d.paragraphs.some(t=>t.includes('손목이나 무릎')));
 assert.equal(d.closing[0],d.integration.originalClosing[0]);
});

test('natal help conflict uses the adverse grounded branch and retains the previous selection for audit',()=>{
 const v=plain(old.v5Reading(rows[4].result,NOW)),g=v.domains.find(x=>x.id==='gwiin');g.cause='present';
 I.choose(v,{input:{unknown:false},western:{available:true,unknown:false,planets:[{id:'Jupiter',house:8}],aspects:[{a:'Jupiter',b:'Saturn',angle:90,orb:1}]}},api.V5);
 assert.equal(g.cause,'absent');assert.equal(g.originalSelection.cause,'present');assert(g.selectionDecision.chosen.some(x=>x.source==='western'));assert.equal(g.detail,api.V5.gwiin.absent.detail);
});
test('helper endings keep presence or absence and refine only a displayed condition',()=>{
 const reached=new Set();
 for(const {view} of rows){
  const g=view.domains.find(x=>x.id==='gwiin'),id=g.integration.closingSourceId;
  if(!id){assert.equal(g.closing[0],g.integration.originalClosing[0]);continue;}
  reached.add(id);assert(g.poolIds.includes(id));assert.equal(g.closing.length,1);
  assert.equal(g.head,g.integration.originalHead);assert.equal(g.fates[0],g.integration.originalClosing[0]);
  if(g.cause==='absent')assert(!['G1','G4','G6'].includes(id));
  const v=plain(view),copy=v.domains.find(x=>x.id==='gwiin');
  delete v.integration;copy.poolIds=[];copy.closing=g.integration.originalClosing.slice();
  I.finish(v,{});assert.equal(copy.closing[0],g.integration.originalClosing[0]);assert.equal(copy.integration.closingSourceId,null);
 }
 assert(reached.size>=4,[...reached].join(','));
});

test('a provincial move retains its costs in the money body and has just one fate',()=>{
 let found=0;for(let i=0;i<30;i++){const {view}=api.read({y:1980+i,m:1+i%12,d:1+i%28},{h:2,mi:0},false,'busan');const d=view.domains.find(d=>d.id==='money');if(!d.relocationCost)continue;found++;assert.equal(d.closing.length,1);assert.match(d.paragraphs.join(' '),/이사비|주거비/);assert.match(d.note.value,/이사비와 주거비/);}
 assert(found>0);
});

