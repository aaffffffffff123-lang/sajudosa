const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {wrap,paginate,plainText,zipFiles}=require('../reading-export.js');
const types={body:[42,63],heading:[44,64],closing:[44,65],note:[32,48]};
const measure=(s,k)=>Array.from(s).reduce((n,c)=>n+types[k][0]*(c.codePointAt(0)>255?1:.52),0);
test('pagination preserves every word, keeps readable font sizes, and never crosses the footer',()=>{
 for(const length of [1,40,120,500,2000]){
  const blocks=[{kind:'heading',text:'돈을 벌고 쓰는 일'},{kind:'body',text:'생활비가 먼저 옵니다. '.repeat(length)},{kind:'closing',text:'당신은 오늘을 덜 힘들게 넘기려고 쓴 돈을 내일의 품으로 메웁니다.'}];
  const pages=paginate({id:'money',title:'돈',blocks},measure);
  assert(pages.length);assert.equal(pages.flatMap(p=>p.items).map(x=>x.text).join('').replace(/\s/g,''),blocks.map(b=>b.text).join('').replace(/\s/g,''));
  pages.forEach((p,i)=>{assert.equal(p.part,i+1);assert.equal(p.parts,pages.length);assert(p.items.length);let previous=0;for(const item of p.items){assert(item.y>=238&&item.y+types[item.kind][1]<=1184);assert(item.y>=previous);previous=item.y+types[item.kind][1];}});
 }
});
test('paragraphs which fit stay together instead of leaving a fragment on the next page',()=>{
 const section={id:'x',title:'일',blocks:Array.from({length:9},(_,i)=>({kind:'body',text:(i+'번째 문단입니다. ').repeat(12)}))};
 const pages=paginate(section,measure);
 for(let i=0;i<9;i++)assert.equal(pages.filter(p=>p.items.some(x=>x.text.includes(i+'번째'))).length,1);
});
test('copy uses only the selected snapshot and never computes another fortune',()=>{
 const data={sections:[{id:'money',title:'돈',blocks:[{text:'읽은 문장 그대로.'}]},{id:'work',title:'일',blocks:[{text:'다른 항목.'}]}]};
 const text=plainText(data,new Set(['money']));assert(text.includes('읽은 문장 그대로.'));assert(!text.includes('다른 항목.'));assert(!text.includes('족친'));assert(text.includes('sajudosa/'));
});
test('ZIP retains byte-for-byte PNGs and Korean filenames',async()=>{
 const bytes=new Uint8Array([137,80,78,71,0,255,13,10]),blob=await zipFiles([{name:'사주도사_01_돈.png',blob:new Blob([bytes])},{name:'사주도사_02_일.png',blob:new Blob([bytes])}]);
 const b=Buffer.from(await blob.arrayBuffer());assert.equal(b.readUInt32LE(0),0x04034b50);assert.equal(b.readUInt32LE(b.length-22),0x06054b50);assert.equal(b.readUInt16LE(b.length-12),2);const size=b.readUInt16LE(26);assert.equal(b.subarray(30,30+size).toString(),'사주도사_01_돈.png');assert.deepEqual(b.subarray(30+size,38+size),Buffer.from(bytes));
});
test('the save trigger stays in the completed ending and snapshot stays out of persistent storage',()=>{
 const fight=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8'),html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),module=fs.readFileSync(path.join(__dirname,'../reading-export.js'),'utf8');
 const view=html.slice(html.indexOf('<main id="result-screen"'),html.indexOf('</main>',html.indexOf('<main id="result-screen"')));assert(!view.includes('readingSaveBtn'));
 const handler=fight.slice(fight.indexOf("$('#readingSaveBtn').addEventListener"),fight.indexOf('const CRUMPLE='));assert(handler.includes("$('#again').hidden||!G.ended"));assert(!/localStorage|sessionStorage|fetch\(/.test(module));assert(html.includes('R.savedReading=window.PaljaReadingExport.capture'));
});
