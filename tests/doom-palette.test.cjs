// 결과 화면을 내려갈수록 바탕이 독초색으로 물드는 동안(DOOM) 안의 칸과 글씨가 바탕에 묻히지 않는지 검사한다.
// 색은 처음 색에서 끝 색으로 채널마다 곧게 섞이므로, 처음엔 바탕보다 진하고 끝엔 바탕보다 연한 색은 도중에 바탕과 같아진다.
// 이 검사가 깨지면 숫자를 맞추려고 기준을 낮추지 말고 끝 색을 바탕과 같은 쪽으로 옮긴다.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');

const hex=h=>[0,2,4].map(i=>parseInt(h.replace('#','').slice(i,i+2),16));
const doomSrc=html.slice(html.indexOf('const DOOM={'),html.indexOf('function doomBuild('));
const bg=[...doomSrc.matchAll(/bg([01]):\[(\d+),(\d+),(\d+)\]/g)].sort((a,b)=>a[1]-b[1]).map(m=>[+m[2],+m[3],+m[4]]);
const VARS=Object.fromEntries([...doomSrc.matchAll(/'([a-z0-9-]+)':\['([0-9a-f]{6})','([0-9a-f]{6})'\]/g)].map(m=>[m[1],[hex(m[2]),hex(m[3])]]));
VARS.page=bg;

// 스크립트의 doomMix와 같은 섞기(채널마다 반올림)
const mix=(a,b,e)=>a.map((v,i)=>Math.round(v+(b[i]-v)*e));
const at=(name,e)=>{const v=VARS[name];assert(v,name);return mix(v[0],v[1],e);};
const lin=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);};
const lum=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const oklab=c=>{const [r,g,b]=c.map(lin),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];};
const dE=(a,b)=>{const x=oklab(a),y=oklab(b);return 100*Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);};
const dL=(a,b)=>100*(oklab(a)[0]-oklab(b)[0]);
const STEPS=Array.from({length:41},(_,i)=>i/40);

test('palette starts where the stylesheet starts, so nothing jumps when the colors take over',()=>{
 const block=sel=>{const i=html.indexOf(sel+'{');assert(i>=0,sel);return html.slice(i,html.indexOf('\n}',i));};
 const css=Object.assign({},...[':root','#result-screen'].map(s=>Object.fromEntries([...block(s).matchAll(/--([a-z0-9-]+):\s*#([0-9a-fA-F]{6})/g)].map(m=>[m[1],m[2].toLowerCase()]))));
 for(const [name,[a]] of Object.entries(VARS)){
  if(name==='page'){assert.deepEqual(a,hex(css.paper),'page');continue;}
  assert.equal(css[name],a.map(v=>v.toString(16).padStart(2,'0')).join(''),name);
 }
});

test('boxes that are told apart only by their tint stay visible all the way down',()=>{
 // [칸 색, 그 밑 바탕, 쓰는 곳]. lightSide: 처음과 끝이 바탕보다 같은 쪽(진함/연함)에 있어야 하는 칸
 const pairs=[
  ['soft','page','칸 끝 「~ 부담」 상자(.note)',true],['soft','card','카드 안 강조 줄(.wy)',true],
  ['inset','paper-2','사주 「나」 기둥·출생차트 띠',true],['inset','card','카드 안 들어간 칸',true],
  ['mark','page','형광펜 밑줄(strong.hl)',true],['gold','page','왼쪽 위 「사주도사」 글자',true],
  ['card','page','카드',true],['paper-2','page','책자·출생 카드',true],
  ['current-surface','page','연표 「올해·지금」 줄',false],['warning-surface','page','연표 「마찰이 겹침」 줄',false],
  ['lav','card','보라 알약',false]
 ];
 for(const [s,b,where,lightSide] of pairs){
  const d=STEPS.map(e=>dE(at(s,e),at(b,e))),ends=Math.min(d[0],d[d.length-1]),low=Math.min(...d),e=STEPS[d.indexOf(low)];
  assert(low>=2,`${where}: ${s} on ${b} nearly vanishes (ΔE ${low.toFixed(2)} at ${e})`);
  assert(low>=ends*.9,`${where}: ${s} on ${b} dips mid-way (ΔE ${low.toFixed(2)} at ${e}, ends ${d[0].toFixed(2)}/${d[d.length-1].toFixed(2)})`);
  if(lightSide){const a=dL(at(s,0),at(b,0)),z=dL(at(s,1),at(b,1));assert(Math.sign(a)===Math.sign(z),`${where}: ${s} flips from ${a>0?'lighter':'darker'} to ${z>0?'lighter':'darker'} than ${b}`);}
 }
});

test('type keeps its contrast while the paper darkens',()=>{
 const pairs=[['ink','page'],['ink-2','page'],['muted','page'],['caption','page'],['red-d','page'],['section-late','page'],
  ['ink','soft'],['red-d','soft'],['ink','card'],['ink-2','card'],['muted','card'],['muted','paper-2'],['caption','paper-2'],['indigo','card'],['indigo','paper-2']];
 for(const [t,b] of pairs){
  const r=STEPS.map(e=>ratio(at(t,e),at(b,e))),floor=Math.max(4.5,.85*Math.min(r[0],7)),low=Math.min(...r);
  assert(low>=floor,`${t} on ${b}: contrast ${low.toFixed(2)} at ${STEPS[r.indexOf(low)]} (start ${r[0].toFixed(2)}, floor ${floor.toFixed(2)})`);
 }
});

test('the end palette is reached at the bottom even on tall screens',()=>{
 const src=html.slice(html.indexOf('function doomProg(){'),html.indexOf('function doomApply(){'));
 assert(/Math\.min\([^;]*document\.documentElement\.scrollHeight-H\)/.test(src),'progress end is clamped to the last scroll position');
});
