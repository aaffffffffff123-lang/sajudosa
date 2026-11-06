const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function ldCrystalData('),end=html.indexOf('function ldCrystal(t)',start);
const data=vm.runInNewContext(html.slice(start,end)+';ldCrystalData',{esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')});
const result=()=>({reading:{pillars:[{known:true,stem:'甲',branch:'子'},{known:false}]},western:{available:true,unknown:false,asc:{longitude:0},planets:[{id:'Sun',longitude:0},{id:'Moon',longitude:90}],aspects:[{a:'Sun',b:'Moon'}]}});
test('orb uses the supplied pillars and actual planet positions',()=>{const a=data(result());assert(a.glyphs.includes('甲'));assert(a.glyphs.includes('子'));assert(a.glyphs.includes('—'));assert(a.chart.includes('cx="-22.00" cy="0.00"'));assert(a.chart.includes('cx="0.00" cy="22.00"'));assert(a.chart.includes('M-22.00 0.00L0.00 22.00'));});
test('unknown time or failed calculation never fabricates an orb chart',()=>{let r=result();r.western.unknown=true;assert.equal(data(r).chart,'');r.western={available:false};assert.equal(data(r).chart,'');assert.equal(data(null).chart,'');r=result();r.western.planets=[{id:'Sun',longitude:null}];assert.equal(data(r).chart,'');});
