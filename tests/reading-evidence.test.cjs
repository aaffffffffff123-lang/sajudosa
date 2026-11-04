// 이 파일은 풀이 엔진(makeReading이 만드는 r.fate·r.sections·r.verdict·r.cautions)만 검사한다.
// 엔진 문장은 화면에 나가지 않는다. 화면 문장은 자리 문서(V5, v5Reading)가 엔진 판정을 근거로 만들고 reading-flow.test.cjs가 검사한다.
// 그래서 '물려받을 것 없이' 같은 팔자 줄은 엔진 문장에는 없어야 하고, 화면에는 사주 조건이 맞을 때만 나온다.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('/* ===== 1. 달력 데이터'),html.indexOf('const PLACE_MAP={};'));
const api=vm.runInNewContext(source+';({computeChart,makeReading,modernizeReadingDisplay,luckPressureV4});',{Intl,Date});
const place={name:'서울',lon:126.978,tz:'KR',std:9};
function read(y,m,d,unknown=false,male=true){
 const input={name:'',cal:'solar',date:{y,m,d},time:{h:12,mi:0},unknown,male,place,placeKey:'seoul'};
 const chart=api.computeChart({y,m,d,h:12,mi:0,unknown,male,place});
 return api.modernizeReadingDisplay(api.makeReading(chart,input,Date.UTC(2026,10,4)));
}
const section=(r,id)=>r.sections.find(s=>s.id===id),text=r=>JSON.stringify({core:r.core,sections:r.sections,verdict:r.verdict,cautions:r.cautions,sinsal:r.sinsal});
test('wealth in secondary hidden stems is present even without a visible or main wealth stem',()=>{
 const r=read(1980,4,15),w=r.fate.wealth;
 assert.equal(r.pillars.map(p=>p.gz).join(' '),'庚申 庚辰 戊午 戊午');
 assert.equal(w.visible.length,0);assert.deepEqual(Array.from(w.hidden,x=>x.stem),['壬','癸']);
 assert(w.hidden.every(x=>x.depth>0));assert(w.present);assert.match(section(r,'money').body.join(' '),/태어난 해·달의 아래 글자 안에 숨어/);
 assert(!/없습니다/.test(w.fact));assert(!/물려받을 것 없이|가난을 물려/.test(text(r)));
});
test('engine text: an absent wealth symbol is stated as a fact and carries no fate line of its own',()=>{
 const r=read(1970,9,15);assert.equal(r.fate.wealth.present,false);assert.match(r.fate.wealth.fact,/숨은 기운에는.*없습니다/);
 assert(!/가난|상속|물려받을 것|서른에 가진|자식에게 그대로/.test(text(r)));
});
test('unknown time scopes absence to the known pillars and never infers children from an invented hour',()=>{
 const r=read(1970,9,15,true);assert.equal(r.pillars[3].known,false);assert.match(r.fate.wealth.fact,/태어난 시간을 제외한/);
 assert(r.fate.wealth.hidden.every(x=>x.pos!==3));assert(!/자녀를 나타내는 태어난 시간|자식에게 그대로/.test(text(r)));
});
test('a supported balanced structure retains its advantage while the narrator demands obedience',()=>{
 const r=read(1971,10,15);assert.equal(r.a.strength.label,'중화');assert.equal(r.a.structure.failure.length,0);assert(r.a.structure.success.includes('관인상생'));
 assert.equal(r.dominant.key,'supported_structure');assert.match(r.core.text,/책임과 배움이 서로 이어져/);
 assert.equal(section(r,'work').basisKey,'work:success:관인상생');assert.match(r.verdict,/배은망덕/);assert.match(r.cautions[0],/자유가 아닙니다/);
});
test('productive income support is acknowledged without declaring wealth impossible',()=>{
 const r=read(1970,11,15),m=section(r,'money');assert(r.a.structure.success.includes('식상생재'));assert.equal(m.basisKey,'money:success:식상생재');
 assert.match(m.body.join(' '),/벌 수 있는 힘/);assert.match(m.body.join(' '),/쉬겠다는 선택/);assert(!/한 칸도 올라가지|물려받을 것 없이/.test(text(r)));
});
test('mixed charts retain both the supporting condition and the actual work conflict',()=>{
 const r=read(1970,7,15),w=section(r,'work');assert(r.a.structure.success.includes('상관생재'));assert(r.a.structure.failure.some(x=>x.id==='hurt_officer'));
 assert.equal(r.dominant.key,'hurt_officer');assert(w.evidenceIds.includes('success:상관생재'));assert.match(w.body.join(' '),/부딪히는 조건까지 없어지는 것은 아닙니다/);
});
test('a real outlet prevents the unsupported uncontrolled-peer finding',()=>{
 const r=read(1972,3,15);assert.equal(r.a.strength.label,'극강');assert.equal(r.a.families.비겁.level,'strong');assert(r.a.structure.success.includes('식상설기'));
 assert(!r.ziping.findings.some(f=>f.key==='strong_peer'));assert.equal(r.fate.support.group,'outlet');
});
test('cycle narration follows the actual presence of support and adversity',()=>{
 assert.equal(api.luckPressureV4(null),'');
 assert.match(api.luckPressureV4({evidence:[{valence:'support'}]}),/받쳐 주는 작용이 들어오는/);
 assert.match(api.luckPressureV4({evidence:[{valence:'support'},{valence:'adverse'}]}),/함께 있습니다/);
 assert.match(api.luckPressureV4({evidence:[{valence:'adverse'}]}),/부딪히는 조건이 있는/);
 assert.match(api.luckPressureV4({evidence:[{valence:'mixed'}]}),/관계나 역할을 다시 맞추는/);
 assert.match(api.luckPressureV4({evidence:[]}),/새 조건은 적습니다/);
 const r=read(1971,10,15),current=r.luck.cycles.find(c=>c.current);
 assert.match(api.luckPressureV4(current),/다시 맞추는 작용/);
});
test('engine text: six readable domains with evidence, and the fate lines stay out of the engine across inputs',()=>{
 const dates=[[1970,9,15],[1971,10,15],[1972,3,15],[1976,8,15],[1980,4,15],[1987,8,14],[1990,1,1],[2001,6,21]];
 for(const date of dates)for(const unknown of [true,false])for(const male of [true,false]){
  const r=read(...date,unknown,male);assert.equal(r.sections.length,6);assert(r.verdict.includes('팔자'));
  for(const s of r.sections){assert(s.head);assert(s.body.length,s.id);assert(s.evidenceIds.length,s.id);}
  if(r.fate.support)assert(r.a.structure.success.includes(r.fate.support.key));
  assert.equal(r.fate.wealth.present,r.a.families.재성.level!=='absent');
  assert.equal(r.fate.officer.present,r.a.families.관성.level!=='absent');
  assert(!/직원이 다섯|천한 사주|가난을 물려|집값이 다 오른 뒤에 태어나|한 칸도 올라가지|undefined|NaN/.test(text(r)));
 }
});
