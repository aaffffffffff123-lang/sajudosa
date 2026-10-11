/* 사주도사 · 족치기 화면 (fight.js)
 * index.html이 three.min.js 다음에 불러 쓴다. 이 파일 하나에 족치기 화면의 모양(CSS)·틀(HTML)·게임 코드가 다 들어 있다.
 * 쓰는 법: window.PaljaBoot() → window.PaljaGame.enter(사주 결과, 'fight' 또는 'submit')
 * 'submit'은 운명에 순응하기(옥황상제가 비웃는 화면), 'fight'는 운명 설계자 족치기.
 * 화면을 닫을 때는 index.html의 window.__paljaLeave()를 부른다.
 */
(function(){
'use strict';
const FIGHT_CSS=":root{--safe-t:env(safe-area-inset-top,0px);--safe-b:env(safe-area-inset-bottom,0px)}\n#fight{--ink:#261f3d;--muted:#7a7290;--line:#e7e1d6;--plum:#3e2f8f;--plum-soft:#ece3ff;--red:#e0402a;--gold:#d99a00;\n --serif:\"Gowun Batang\",\"Noto Serif KR\",serif;--sans:\"IBM Plex Sans KR\",\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif;color:var(--ink)}\n#fight[hidden]{display:none!important}\n#fight [hidden]{display:none!important}\n#fight button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}\n#fight .btn{display:block;width:100%;min-height:54px;padding:12px 16px;border:2.5px solid var(--ink);border-radius:15px;background:#fff;color:var(--ink);font-size:17px;font-weight:700;line-height:1.3;text-align:center;box-shadow:0 4px 0 var(--ink)}\n#fight .btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}\n#fight .btn.danger{background:var(--red);color:#fff}\n#fight .btn.outline{background:#fff}\n#fight .btn.small{min-height:46px;font-size:15px}\n#fight .switch{width:52px;height:31px;border-radius:16px;border:0;background:#d8cfb6;position:relative;flex:none;padding:0}\n#fight .switch::after{content:\"\";position:absolute;top:3px;left:3px;width:25px;height:25px;border-radius:50%;background:#fff;transition:left .15s;box-shadow:0 1px 3px rgba(0,0,0,.2)}\n#fight .switch[aria-checked=true]{background:var(--plum)}\n#fight .switch[aria-checked=true]::after{left:24px}\n#fight{position:fixed;inset:0;z-index:10;background:#bfe3ff;overflow:hidden;user-select:none;-webkit-user-select:none;overscroll-behavior:none;font-family:var(--sans)}\n#fight #world{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}\n#fight #fx{position:absolute;inset:0;pointer-events:none;overflow:hidden}\n#fight #flash{position:absolute;inset:0;pointer-events:none;background:#fff;opacity:0}\n#fight .ftop{position:absolute;left:0;right:0;top:0;padding:calc(10px + var(--safe-t)) 54px 0 12px;display:flex;align-items:flex-start;gap:8px;pointer-events:none;z-index:5}\n#fight .ftop > *{pointer-events:auto}\n#fight .pill{height:40px;min-width:40px;border:0;background:rgba(255,255,255,.92);border-radius:12px;box-shadow:0 2px 8px rgba(30,30,60,.18);display:flex;align-items:center;justify-content:center;gap:5px;padding:0 9px;font-weight:700;font-size:13px;white-space:nowrap;flex:none;color:var(--ink)}\n#fight .pill:active{transform:translateY(1px)}\n#fight .pill svg{width:20px;height:20px;flex:none}\n#fight .pill[aria-pressed=true] svg .wave{display:none}\n#fight .gauge{flex:1;min-width:0;pointer-events:none;background:rgba(255,255,255,.92);border-radius:12px;box-shadow:0 2px 8px rgba(30,30,60,.18);padding:5px 10px 6px;display:flex;flex-direction:column;gap:3px}\n#fight .gauge .row{display:flex;justify-content:space-between;align-items:baseline;font-size:11.5px;font-weight:700;line-height:1}\n#fight .gauge .row small{font-weight:700;color:var(--muted)}\n#fight .gauge .bar{height:9px;border-radius:6px;background:#e9e4ec;overflow:hidden;position:relative}\n#fight .gauge .bar i{position:absolute;inset:0;transform-origin:left;background:linear-gradient(90deg,#c9a24f,#e8cf84);transition:transform .25s}\n#fight .gauge .bar b{position:absolute;inset:0;transform-origin:left;background:#c8463a;opacity:.7;transition:transform .9s cubic-bezier(.2,.8,.2,1)}\n#fight .gauge .phase{font-size:10.5px;font-weight:700;color:var(--plum);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}\n#fight .dock{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,640px);padding:0 10px calc(10px + var(--safe-b));z-index:5;display:flex;flex-direction:column;gap:7px;pointer-events:none}\n#fight .dock > *{pointer-events:auto}\n#fight .hint{align-self:center;background:rgba(43,40,51,.85);color:#fff;font-size:12px;font-weight:500;border-radius:99px;padding:6px 13px;text-align:center;line-height:1.35;max-width:100%;pointer-events:none;transition:opacity .3s}\n#fight .hint.off{opacity:0}\n#fight .pcap{align-self:flex-start;position:relative;background:#fff;border:2px solid var(--ink);border-radius:14px;padding:7px 12px;font-weight:700;font-size:15px;line-height:1.3;margin-left:12px;max-width:88%;word-break:keep-all;opacity:0;transform:translateY(6px);transition:opacity .15s,transform .15s;pointer-events:none}\n#fight .pcap.show{opacity:1;transform:none}\n#fight .pcap::after{content:\"\";position:absolute;left:22px;bottom:-9px;width:14px;height:14px;background:#fff;border-right:2px solid var(--ink);border-bottom:2px solid var(--ink);transform:rotate(45deg)}\n#fight .panel{background:rgba(255,255,255,.94);border-radius:18px;box-shadow:0 2px 10px rgba(30,30,60,.18);padding:7px}\n#fight .tools{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}\n#fight .tool{position:relative;border:0;border-radius:12px;background:transparent;padding:4px 0 5px;display:flex;flex-direction:column;align-items:center;gap:1px;font-size:11px;font-weight:700;letter-spacing:-.4px;color:var(--ink);min-width:0}\n#fight .tool svg{width:40px;height:40px}\n#fight .tool.on{background:var(--plum-soft);box-shadow:inset 0 0 0 1.5px var(--plum)}\n#fight .tool .ammo{position:absolute;top:2px;right:calc(50% - 28px);min-width:18px;height:18px;border-radius:9px;background:var(--red);color:#fff;font-size:10.5px;line-height:18px;padding:0 4px;font-weight:700}\n#fight .tool .ammo.reload{background:#6b6577;letter-spacing:-.5px}\n#fight #submitDock .btn{box-shadow:0 2px 10px rgba(30,30,60,.2)}\n#fight #bubble{position:absolute;left:0;top:0;width:max-content;max-width:200px;background:#fff;border:2px solid var(--ink);border-radius:16px;padding:8px 12px;font-weight:700;font-size:16px;line-height:1.3;letter-spacing:-.3px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:4;word-break:keep-all;overflow-wrap:anywhere}\n#fight #bubble.show{opacity:1}\n#fight #bubble.shout{background:#fff0ec;font-size:20px}\n#fight #bubble::after{content:\"\";position:absolute;width:14px;height:14px;background:inherit;top:var(--ty,50%);left:-9px;border-left:2px solid var(--ink);border-bottom:2px solid var(--ink);transform:translateY(-50%) rotate(45deg)}\n#fight #bubble.left::after{left:auto;right:-9px;border:0;border-right:2px solid var(--ink);border-top:2px solid var(--ink)}\n#fight .pop{position:absolute;font-weight:900;color:#fff;-webkit-text-stroke:6px var(--ink);paint-order:stroke fill;white-space:nowrap;transform:translate(-50%,-50%);animation:popin .55s cubic-bezier(.2,1.5,.4,1) forwards;text-shadow:0 4px 0 var(--ink);pointer-events:none}\n@keyframes popin{0%{transform:translate(-50%,-50%) scale(.3) rotate(var(--r));opacity:1}30%{transform:translate(-50%,-50%) scale(1.15) rotate(var(--r))}70%{opacity:1}100%{transform:translate(-50%,-70%) scale(1) rotate(var(--r));opacity:0}}\n#fight .milestone{position:absolute;left:50%;top:22%;transform:translate(-50%,-50%);font-weight:900;font-size:32px;color:#fff;-webkit-text-stroke:7px #432b50;paint-order:stroke fill;text-shadow:0 5px 0 #432b50;white-space:nowrap;animation:milein 1.9s cubic-bezier(.2,1.4,.4,1) forwards;pointer-events:none;z-index:6;letter-spacing:.02em}\n@keyframes milein{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}18%{transform:translate(-50%,-50%) scale(1.1);opacity:1}80%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-80%) scale(1)}}\n#fight .modal{position:absolute;inset:0;background:rgba(43,40,51,.5);display:flex;align-items:center;justify-content:center;padding:16px;z-index:20}\n#fight .msheet{width:min(100%,400px);max-height:calc(100% - 20px);overflow:auto;background:#fff;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.25);padding:18px 18px 16px}\n#fight .msheet h2{margin:0 0 10px;font-size:20px;font-weight:700}\n#fight .msheet .close{float:right;margin:-4px -4px 0 0;box-shadow:none;background:#f1ede6}\n#fight .row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid var(--line);font-weight:700;font-size:14.5px}\n#fight .row small{display:block;font-weight:400;color:var(--muted);font-size:11.5px;margin-top:2px}\n#fight #ending{position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;padding:18px;pointer-events:none}\n#fight #ending .card2{pointer-events:auto;width:min(100%,380px);background:#fff;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:24px 20px 18px;animation:cardin .5s cubic-bezier(.2,1.4,.4,1) both;text-align:center}\n@keyframes cardin{from{transform:translateY(40px) scale(.9);opacity:0}to{transform:none;opacity:1}}\n#fight #ending .kicker{font-family:var(--serif);font-size:11.5px;letter-spacing:.3em;color:var(--gold)}\n#fight #ending h2{font-family:var(--serif);font-size:24px;margin:8px 0 10px;line-height:1.4}\n#fight #ending p{margin:0;font-size:14.5px;line-height:1.8;color:#48434e;word-break:keep-all}\n#fight #ending .stats{display:flex;justify-content:center;gap:18px;margin:16px 0 6px;font-size:12px;color:var(--muted)}\n#fight #ending .stats b{display:block;font-size:20px;color:var(--ink);font-weight:700}\n#fight #ending .btn{margin-top:12px}\n#fight #ending.dim{pointer-events:auto;background:rgba(43,40,51,.35)}\n#fight #fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px;font-weight:700;z-index:30;background:#bfe3ff;flex-direction:column;gap:8px}\n#fight #fallback small{color:var(--muted);font-weight:400}\n@media (min-width:760px){#fight .tool svg{width:46px;height:46px}\n#fight .tool{font-size:12px}}\n@media (max-width:380px){#fight .tool svg{width:36px;height:36px}\n#fight .tool{font-size:10.5px}}\n@media (prefers-reduced-motion:reduce){#fight .pop,#fight .milestone,#fight #ending .card2{animation-duration:.01s}}\n#fight{background:#b5c7bb}\n#fight #bubble,#fight .pcap{display:none!important}\n#fight .ftop{padding-right:55px}\n#fight .gauge{padding:7px 10px;gap:5px}\n#fight .gauge .phase:empty{display:none}\n#fight .gauge .bar{height:6px}\n#fight .gauge .bar i{background:linear-gradient(90deg,#865738,#c49b55)}\n#fight .dock{max-width:560px}\n#fight .panel{background:rgba(255,252,244,.95);border:1px solid rgba(115,78,40,.14)}\n#fight .tool.on{background:#eaddbd;box-shadow:inset 0 0 0 1.5px #856530}\n#fight .hint{font-size:11px;background:rgba(44,37,30,.8)}\n#fight #afterFight{position:absolute;bottom:calc(105px + var(--safe-b));left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:8;white-space:nowrap}\n#fight #afterFight button{border:1px solid rgba(110,81,53,.3);border-radius:20px;background:rgba(255,251,238,.94);padding:7px 14px;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.1)}\n@media(min-width:760px){#fight #afterFight{bottom:calc(111px + var(--safe-b))}}";
const FIGHT_HTML="<section id=\"fight\" hidden>\n <canvas id=\"world\" aria-label=\"옥황상제가 서 있는 화면. 누르거나 쓸어서 때리고, 상처 난 팔다리를 꾹 잡아당겨 뜯습니다.\"></canvas>\n <div id=\"fx\"></div>\n <div id=\"flash\"></div>\n \n <header class=\"ftop\">\n  <button class=\"pill\" id=\"fightBack\" aria-label=\"사주 풀이로 돌아가기\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 5l-7 7 7 7\"/></svg></button>\n  <div class=\"gauge\" aria-live=\"off\"><div class=\"row\"><span>옥황상제</span><small id=\"gaugePct\">100%</small></div><div class=\"bar\"><b id=\"gaugeLag\"></b><i id=\"gaugeFill\"></i></div><div class=\"phase\" id=\"gaugePhase\"></div></div>\n  <button class=\"pill\" id=\"soundBtn\" aria-label=\"소리\" aria-pressed=\"false\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9h4l5-4v14l-5-4H4z\"/><path class=\"wave\" d=\"M16 8c3 2 3 6 0 8M19 5c5 4 5 10 0 14\"/></svg></button>\n  <button class=\"pill\" id=\"settingsBtn\" aria-label=\"설정\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M4 7h16M4 17h16\"/><circle cx=\"9\" cy=\"7\" r=\"2.6\" fill=\"#fff\"/><circle cx=\"15\" cy=\"17\" r=\"2.6\" fill=\"#fff\"/></svg></button>\n </header>\n <div class=\"dock\" id=\"dock\">\n  <div class=\"hint\" id=\"hint\"></div>\n  \n  <div class=\"panel\"><div class=\"tools\" id=\"tools\" role=\"group\" aria-label=\"도구\">\n   <button class=\"tool on\" data-tool=\"hand\"><svg viewBox=\"0 0 48 48\"><use href=\"#i-fist\"/></svg>맨손</button>\n   <button class=\"tool\" data-tool=\"pipe\"><svg viewBox=\"0 0 48 48\"><use href=\"#i-pipe\"/></svg>쇠파이프</button>\n   <button class=\"tool\" data-tool=\"hammer\"><svg viewBox=\"0 0 48 48\"><use href=\"#i-hammer\"/></svg>망치</button>\n   <button class=\"tool\" data-tool=\"knife\"><svg viewBox=\"0 0 48 48\"><use href=\"#i-knife\"/></svg>칼</button>\n   <button class=\"tool\" data-tool=\"gun\"><svg viewBox=\"0 0 48 48\"><use href=\"#i-gun\"/></svg>총<span class=\"ammo\" id=\"ammo\">8</span></button>\n  </div></div>\n </div>\n <div class=\"dock\" id=\"submitDock\" hidden><button type=\"button\" class=\"btn danger\" id=\"submitFight\">운명 설계자 족치기</button></div>\n <div class=\"modal\" id=\"settingsModal\" hidden>\n  <div class=\"msheet\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"setTitle\">\n   <button class=\"pill close\" data-close aria-label=\"닫기\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg></button>\n   <h2 id=\"setTitle\">설정</h2>\n   <div class=\"row\">소리<button class=\"switch\" id=\"swSound\" role=\"switch\" aria-checked=\"true\" aria-label=\"소리\"></button></div>\n   <div class=\"row\">진동<button class=\"switch\" id=\"swVibe\" role=\"switch\" aria-checked=\"true\" aria-label=\"진동\"></button></div>\n   <div class=\"row\">화면 흔들림<button class=\"switch\" id=\"swShake\" role=\"switch\" aria-checked=\"true\" aria-label=\"화면 흔들림\"></button></div>\n   <div class=\"row\"><div>피<small>끄면 피 대신 먼지가 납니다.</small></div><button class=\"switch\" id=\"swBlood\" role=\"switch\" aria-checked=\"true\" aria-label=\"피\"></button></div>\n   <button class=\"btn small outline\" id=\"resetFight\" style=\"margin-top:16px\">처음부터 다시</button>\n  </div>\n </div>\n <div id=\"afterFight\" hidden><button type=\"button\" id=\"roundAgain\">처음부터</button><button type=\"button\" id=\"roundHome\">사주 풀이로</button></div><div id=\"ending\" hidden></div>\n <div id=\"fallback\" hidden><div id=\"fallbackTitle\">불러오는 중…</div><small id=\"fallbackDetail\">잠깐만요.</small><button class=\"btn small\" id=\"retryGame\" type=\"button\" hidden style=\"width:auto;margin-top:10px\">다시 시도</button></div>\n</section>\n";
const FIGHT_ICONS="<symbol id=\"i-fist\" viewBox=\"0 0 48 48\"><path d=\"M13 35c-4-3-5-8-4-13l2-7c1-2 4-2 5 0 1-3 4-3 6-1 1-2 5-2 6 0 2-1 5 0 5 3v3c3 0 5 2 5 5 0 7-4 12-9 13l-1 4H15z\" fill=\"#ffc9a3\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/><path d=\"M16 15v7M22 14v8M28 14v8M34 18c-4 0-9 1-10 5 4 1 7 3 7 6\" fill=\"none\" stroke=\"#27242b\" stroke-width=\"2.3\" stroke-linecap=\"round\"/><path d=\"M14 41h16v5H14z\" fill=\"#2b3a67\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/></symbol>\n<symbol id=\"i-knife\" viewBox=\"0 0 48 48\"><path d=\"M6 42l9-9\" stroke=\"#27242b\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M6 42l9-9\" stroke=\"#3b2a1a\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M13 30L30 6c6-2 14 2 13 11L19 36z\" fill=\"#e8eef3\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/><path d=\"M18 31L35 11\" stroke=\"#fff\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path d=\"M14 31l5 5\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><path d=\"M38 18c2 3 1 7-1 9\" stroke=\"#d93a2b\" stroke-width=\"2.5\" stroke-linecap=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-gun\" viewBox=\"0 0 48 48\"><path d=\"M5 15h36v9H26l-2 4h-7l-1-4H9l-1 10h-4z\" fill=\"#3b3b44\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/><path d=\"M8 24l-2 10\" stroke=\"#8b5a2b\" stroke-width=\"3.5\"/><path d=\"M19 24c0 5 2 7 4 7\" fill=\"none\" stroke=\"#27242b\" stroke-width=\"2.4\"/><path d=\"M8 17h30\" stroke=\"#6e6e7a\" stroke-width=\"2\"/><path d=\"M43 19l3 0\" stroke=\"#27242b\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><path d=\"M44 13l-3 3M44 25l-3-3\" stroke=\"#f4b942\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-pipe\" viewBox=\"0 0 48 48\"><path d=\"M8 40L40 8\" stroke=\"#27242b\" stroke-width=\"11\" stroke-linecap=\"round\"/><path d=\"M8 40L40 8\" stroke=\"#8d939c\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M12 36L36 12\" stroke=\"#c9cfd6\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M34 6l8 8\" stroke=\"#27242b\" stroke-width=\"12\" stroke-linecap=\"round\"/><path d=\"M34 6l8 8\" stroke=\"#5e636c\" stroke-width=\"8\" stroke-linecap=\"round\"/><path d=\"M6 34l8 8\" stroke=\"#27242b\" stroke-width=\"12\" stroke-linecap=\"round\"/><path d=\"M6 34l8 8\" stroke=\"#5e636c\" stroke-width=\"8\" stroke-linecap=\"round\"/><path d=\"M20 24l5 5\" stroke=\"#7a4a2a\" stroke-width=\"3\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-hammer\" viewBox=\"0 0 48 48\"><path d=\"M10 42L26 26\" stroke=\"#27242b\" stroke-width=\"9\" stroke-linecap=\"round\"/><path d=\"M10 42L26 26\" stroke=\"#b07a3e\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M20 10l8-4 14 14-4 8-6-6-4 4-8-8 4-4z\" fill=\"#c7ccd3\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/><path d=\"M28 6l10 10\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M18 14c-6-2-10 2-9 8\" fill=\"none\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><path d=\"M22 18c-6-1-9 3-8 8\" fill=\"none\" stroke=\"#27242b\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></symbol>\n";
let booted=false;
window.PaljaBoot=function(){
 if(booted)return;booted=true;
 const st=document.createElement('style');st.id='fight-style';st.textContent=FIGHT_CSS;document.head.appendChild(st);
 const box=document.createElement('div');box.innerHTML=FIGHT_HTML.trim();document.body.appendChild(box.firstElementChild);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';
 svg.innerHTML='<defs>'+FIGHT_ICONS+'</defs>';document.body.appendChild(svg);
 runGame();
};
function runGame(){
(function(){
'use strict';
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){if(this.parent)this.parent.remove(this);return this;};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const TAU=Math.PI*2, V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), lerp=(a,b,t)=>a+(b-a)*t, rnd=(a,b)=>a+Math.random()*(b-a);
const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:new THREE.Color(c).convertSRGBToLinear(),roughness:.58,...o});
const M=(g,m,p,x=0,y=0,z=0)=>{const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;p.add(a);return a;};
const PREF={sound:true,blood:true,vibe:true,shake:true};
try{const p=JSON.parse(localStorage.getItem('palja.prefs')||'{}');for(const k of Object.keys(PREF))if(typeof p[k]==='boolean')PREF[k]=p[k];}catch(_){}
const G={time:0,mode:'fight',tool:'hand',ammo:8,reloading:0,running:false,raf:0,hp:100,zombie:false,shake:0,ptr:null,stats:{hits:0,tools:{}},nextHand:1,round:0,paused:false};
let E=null;
const canvas=$('#world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
const scene=new THREE.Scene();scene.background=new THREE.Color('#b5c7bb');scene.fog=new THREE.Fog('#b5c7bb',16,40);
const camera=new THREE.PerspectiveCamera(32,1,.05,70), cameraBase=V3();
scene.add(new THREE.HemisphereLight('#fff2d7','#746b5a',.8));
const key=new THREE.DirectionalLight('#fff1ce',1.55);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-2,near:.5,far:18});key.shadow.bias=-.0003;scene.add(key);
const fill=new THREE.DirectionalLight('#b7d8ff',.5);fill.position.set(4,3,5);scene.add(fill);
const rim=new THREE.DirectionalLight('#ffe8b0',.7);rim.position.set(2,4,-4);scene.add(rim);
const palace=new THREE.Group();scene.add(palace);
(function(){
 const gold=mat('#bd8731',{metalness:.65,roughness:.28}),jade=mat('#315d50'),dark=mat('#5c262a'),ivory=mat('#e3dac0',{roughness:.83});
 const floor=M(new THREE.CylinderGeometry(5.8,5.9,.22,64),ivory,palace,0,-.13,0);
 const rug=M(new THREE.CircleGeometry(2.15,64),mat('#784a38',{roughness:.95}),palace,0,.004,.1);rug.rotation.x=-Math.PI/2;
 for(const r of [1.96,2.08]){const t=M(new THREE.TorusGeometry(r,.012,6,64),gold,palace,0,.008,.1);t.rotation.x=-Math.PI/2;}
 for(let i=0;i<12;i++){const a=i*TAU/12;const tile=M(new THREE.BoxGeometry(.016,.004,4.7),mat('#c0b291'),palace,Math.cos(a)*3,.003,Math.sin(a)*3);tile.rotation.y=-a;}
 // The throne sits behind the figure: its framing supports the costume.
 const throne=new THREE.Group();throne.position.set(0,0,-1.6);palace.add(throne);
 M(new THREE.BoxGeometry(2.2,.48,.9),gold,throne,0,.27,0);
 M(new THREE.BoxGeometry(1.95,.13,.86),dark,throne,0,.57,.02);
 M(new THREE.BoxGeometry(2.28,2.55,.18),gold,throne,0,1.74,-.4);
 M(new THREE.BoxGeometry(1.98,2.22,.07),dark,throne,0,1.71,-.28);
 const arch=M(new THREE.TorusGeometry(1.15,.1,10,40,Math.PI),gold,throne,0,2.95,-.4);
 for(const s of [-1,1]){M(new THREE.CylinderGeometry(.11,.12,1.14,12),gold,throne,s*1.04,.94,.29);M(new THREE.SphereGeometry(.16,12,8),gold,throne,s*1.04,1.6,.29);}
 for(const x of [-3.1,3.1]){M(new THREE.CylinderGeometry(.24,.29,5.2,20),jade,palace,x,2.4,-3.1);for(const y of [.03,.28,4.76,5])M(new THREE.CylinderGeometry(.39,.39,.12,18),gold,palace,x,y,-3.1);for(let i=0;i<6;i++){const band=M(new THREE.TorusGeometry(.252,.022,6,20),gold,palace,x,.75+i*.64,-3.1);band.rotation.x=Math.PI/2;}}
 M(new THREE.BoxGeometry(7.2,.3,.52),jade,palace,0,5.13,-3.1);
 const c=document.createElement('canvas');c.width=768;c.height=192;const g=c.getContext('2d');g.fillStyle='#293f38';g.fillRect(0,0,768,192);g.strokeStyle='#b48a43';g.lineWidth=8;g.strokeRect(8,8,752,176);g.fillStyle='#dfc48c';g.font='bold 100px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('凌 霄 寶 殿',384,96);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;M(new THREE.BoxGeometry(2.8,.7,.07),new THREE.MeshStandardMaterial({map:t,roughness:.8}),palace,0,4.38,-2.82);
 const cloudmat=mat('#e8e8dc',{roughness:1});for(let i=0;i<26;i++){const a=i/26*TAU;const c=M(new THREE.SphereGeometry(rnd(.45,.85),12,8),cloudmat,palace,Math.cos(a)*6,-.35+rnd(-.2,.2),Math.sin(a)*5);c.scale.y=.45;}
})();
function screenPoint(nx,ny,dist=2.3){const p=V3(nx,ny,.5).unproject(camera);return camera.position.clone().addScaledVector(p.sub(camera.position).normalize(),dist);}
function project(v){const p=v.clone().project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-.5*p.y+.5)*innerHeight};}
function planePoint(x,y,z=1){const p=V3(x/innerWidth*2-1,1-y/innerHeight*2,.5).unproject(camera),d=p.sub(camera.position).normalize();return camera.position.clone().addScaledVector(d,(z-camera.position.z)/d.z);}
function disposeTree(root){const gs=new Set(),ms=new Set(),ts=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){ms.add(m);for(const k of ['map','normalMap','roughnessMap'])if(m[k])ts.add(m[k]);}});gs.forEach(g=>g.dispose());ts.forEach(t=>t.dispose());ms.forEach(m=>m.dispose());}
/* Procedural impact audio. Nothing speaks; scheduled sources are tracked and stopped on exit. */
const AUDIO = (() => {
  let ctx = null, master = null, mix = null, noiseBuffer = null;
  let enabled = !!PREF.sound;
  const sources = new Set();
  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    mix = ctx.createDynamicsCompressor();
    mix.threshold.value = -13; mix.knee.value = 7; mix.ratio.value = 5;
    mix.attack.value = .001; mix.release.value = .12;
    master = ctx.createGain(); master.gain.value = enabled ? .64 : 0;
    mix.connect(master); master.connect(ctx.destination);
    noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 2), ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  function ready() { return ctx && enabled && ctx.state === 'running'; }
  function track(source, chain) {
    if (sources.size > 90) {
      const oldest = sources.values().next().value;
      try { oldest.stop(); } catch (_) {}
    }
    sources.add(source);
    source.onended = () => {
      sources.delete(source);
      source.disconnect();
      for (const node of chain) node.disconnect();
    };
  }
  function envelope(node, t, volume, dur, attack = .001) {
    node.gain.setValueAtTime(.0001, t);
    node.gain.linearRampToValueAtTime(Math.max(.0001, volume), t + attack);
    node.gain.exponentialRampToValueAtTime(.0001, t + attack + dur);
  }
  function tone(t, hz, endHz, duration, volume, type = 'sine') {
    const source = ctx.createOscillator(), gain = ctx.createGain();
    source.type = type;
    source.frequency.setValueAtTime(hz, t);
    source.frequency.exponentialRampToValueAtTime(Math.max(2, endHz), t + duration);
    envelope(gain, t, volume, duration);
    source.connect(gain); gain.connect(mix);
    track(source, [gain]); source.start(t); source.stop(t + duration + .02);
  }
  function noise(t, dur, volume, freq, endFreq = freq, type = 'bandpass', q = .8, attack = .001) {
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = noiseBuffer;
    filter.type = type; filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + dur);
    envelope(gain, t, volume, dur, attack);
    source.connect(filter); filter.connect(gain); gain.connect(mix);
    track(source, [filter, gain]);
    source.start(t, Math.random() * 1.2); source.stop(t + dur + attack + .02);
  }
  function ticks(t, n, span, volume = .2, freq = 2400) {
    for (let i = 0; i < n; i++) noise(t + Math.random() * span, .008 + Math.random() * .012,
      volume * (.45 + Math.random() * .55), freq * (.7 + Math.random() * .65), freq * .55, 'bandpass', 2.6);
  }
  function meat(t, volume, heavy = false) {
    tone(t, heavy ? 155 : 125, 35, heavy ? .26 : .19, volume * .7);
    noise(t, .075, volume * .6, 1000, 390, 'lowpass', 1.2);
    noise(t + .016, .13, volume * .42, 1450, 570, 'bandpass', 1.4);
    noise(t + .025, .11, volume * .22, 3400, 1550, 'highpass');
  }
  const api = {
    unlock() {
      try {
        init();
        if (ctx && ctx.state !== 'running') {
          const p = ctx.resume(); if (p && p.catch) p.catch(() => {});
        }
      } catch (_) {}
    },
    setOn(on) {
      enabled = !!on; PREF.sound = enabled;
      if (master) master.gain.setTargetAtTime(enabled ? .64 : 0, ctx.currentTime, .02);
      if (!enabled) api.stop();
    },
    onHit(tool, part, power = 1) {
      if (!ready()) return;
      const t = ctx.currentTime + .004, p = Math.max(.25, Math.min(1.8, power));
      const head = typeof part === 'string' && /head|face|jaw|neck/.test(part);
      if (tool === 'knife') {
        noise(t, .1, .47 * p, 2800, 850, 'bandpass', 1.3);
        meat(t + .008, .54 * p);
        noise(t + .038, .17, .42 * p, 700, 210, 'lowpass', .7);
        ticks(t + .015, head ? 5 : 3, .055, .17 * p, 2150);
      } else if (tool === 'gun') {
        meat(t, .65 * p, true);
        ticks(t, head ? 7 : 3, .045, .24 * p, 2900);
      } else {
        const heavy = tool === 'hammer' || tool === 'pipe';
        meat(t, (heavy ? .91 : .8) * p, heavy);
        tone(t, heavy ? 330 : 255, 90, .058, .34 * p, 'triangle');
        ticks(t, head ? 6 : (heavy ? 4 : 2), .02, .22 * p, 3250);
        if (tool === 'pipe') {
          tone(t + .009, 680, 635, .21, .052, 'triangle');
          tone(t + .016, 1220, 1140, .12, .018);
        }
        if (tool === 'hammer') noise(t + .028, .21, .18 * p, 420, 110, 'lowpass');
      }
    },
    fire() {
      if (!ready()) return;
      const t = ctx.currentTime + .002;
      noise(t, .065, .93, 4300, 1300, 'highpass');
      noise(t, .14, .95, 1350, 380, 'bandpass', .8);
      tone(t, 180, 33, .3, .84);
      tone(t, 760, 95, .046, .25, 'triangle');
      noise(t + .045, .24, .31, 750, 220, 'lowpass');
      ticks(t + .13, 2, .1, .08, 3900);
    },
    dry() {
      if (!ready()) return;
      const t = ctx.currentTime + .003;
      noise(t, .021, .22, 2600, 950, 'bandpass', 3);
      tone(t, 470, 190, .017, .12, 'triangle');
    },
    reload() {
      if (!ready()) return;
      const t = ctx.currentTime + .003;
      ticks(t, 2, .024, .12, 1700);
      noise(t + .12, .13, .12, 2100, 650, 'highpass', .6, .012);
      ticks(t + .31, 2, .03, .22, 2300);
      tone(t + .31, 375, 180, .035, .17, 'triangle');
      noise(t + .62, .06, .19, 1850, 460, 'bandpass', 2.4);
      ticks(t + .68, 2, .025, .15, 3300);
    },
    rip() {
      if (!ready()) return;
      const t = ctx.currentTime + .003;
      noise(t, .34, .5, 710, 160, 'bandpass', 1.4, .013);
      noise(t + .03, .25, .36, 1900, 700, 'lowpass', .8);
      for (let i = 0; i < 5; i++) {
        tone(t + i * .041, 175 + Math.random() * 95, 39, .055, .15, 'triangle');
        noise(t + i * .045, .035, .18, 2050, 600, 'bandpass', 2.1);
      }
      noise(t + .24, .12, .31, 760, 210, 'lowpass');
    },
    laugh() {
      if (!ready()) return;
      const t = ctx.currentTime + .015;
      // A short breathy snicker, without syllables or generated speech.
      for (let i = 0; i < 3; i++) {
        const at = t + i * .128;
        noise(at, .077, .145 - i * .02, 780, 520, 'bandpass', 1.5, .006);
        tone(at, 113 - i * 6, 77, .07, .075 - i * .01, 'triangle');
      }
    },
    stop() {
      for (const source of sources) { try { source.stop(); } catch (_) {} }
      sources.clear();
    }
  };
  return api;
})();

/* One first-person rig, with the weapon tip meeting the world-space hit point. */
class WeaponRig {
  constructor(scene, camera) {
    this.scene = scene; this.camera = camera;
    this.root = new THREE.Group(); scene.add(this.root);
    this.offhand = new THREE.Group(); scene.add(this.offhand);
    this.tool = 'none'; this.elapsed = 0; this.queue = []; this.active = null;
    this.aimPoint = null; this.recoil = 0; this.flashTime = 0; this.reloadTime = 0; this.reloadDuration = .9;
    this.resources = { geo: new Set(), mat: new Set() }; this.tools = {}; this.tips = {};
    this.shells = []; this.shellIndex = 0; this.bloodyTools = new Set();
    this._v = new THREE.Vector3(); this._q = new THREE.Quaternion();
    this._e = new THREE.Euler(); this._camQ = new THREE.Quaternion();
    this._idlePos = new THREE.Vector3(); this._idleQ = new THREE.Quaternion();
    this._restOff = new THREE.Vector3(); this._unit = new THREE.Vector3();
    this._materials(); this._build();
    this.setTool('none');
  }
  get pending() { return this.queue.length + (this.active ? 1 : 0); }
  _material(color, roughness = .5, metalness = 0) {
    const c = new THREE.Color(color);
    if (c.convertSRGBToLinear) c.convertSRGBToLinear();
    const m = new THREE.MeshStandardMaterial({ color: c, roughness, metalness });
    this.resources.mat.add(m); return m;
  }
  _materials() {
    this.skin = this._material('#c58e70', .66);
    this.skinLight = this._material('#dfa181', .61);
    this.skinDark = this._material('#a66c56', .72);
    this.sleeve = this._material('#202932', .86);
    this.cuff = this._material('#d4d0c4', .8);
    this.steel = this._material('#85919a', .24, .82);
    this.edge = this._material('#e2e9e7', .14, .91);
    this.iron = this._material('#353e46', .38, .76);
    this.black = this._material('#111719', .8, .02);
    this.wood = this._material('#85583b', .7);
    this.brass = this._material('#bda267', .29, .85);
    this.blood = this._material('#7f0b12', .19);
  }
  _mesh(geometry, material, parent, position = null, scale = null) {
    this.resources.geo.add(geometry);
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = false; m.receiveShadow = false;
    if (position) m.position.set(...position);
    if (scale) m.scale.set(...scale);
    parent.add(m); return m;
  }
  _box(x, y, z, mat, parent, pos) { return this._mesh(new THREE.BoxGeometry(x, y, z), mat, parent, pos); }
  _ball(r, mat, parent, pos, scale) { return this._mesh(new THREE.SphereGeometry(r, 12, 9), mat, parent, pos, scale); }
  _cylinder(top, bottom, length, mat, parent, pos, seg = 12) {
    return this._mesh(new THREE.CylinderGeometry(top, bottom, length, seg), mat, parent, pos);
  }
  _line(a, b, radius, material, parent) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
    const m = this._cylinder(radius, radius * .97, d.length(), material, parent,
      va.clone().add(vb).multiplyScalar(.5).toArray(), 8);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  }
  _hand(parent, grip = false, gun = false) {
    const arm = new THREE.Group(); parent.add(arm);
    const sleeve = this._cylinder(.073, .091, .29, this.sleeve, arm, [0, -.28, .024]);
    const cuff = this._cylinder(.067, .074, .04, this.cuff, arm, [0, -.123, .024]);
    const wrist = this._cylinder(.048, .055, .082, this.skin, arm, [0, -.073, .018]);
    sleeve.scale.z = .83; cuff.scale.z = .87; wrist.scale.z = .79;
    if (grip) {
      this._ball(.069, this.skin, arm, [-.022, .025, .005], [1.07, 1.34, .77]);
      for (let i = 0; i < 4; i++) {
        const f = this._mesh(new THREE.TorusGeometry(.039, .0128 - i * .0006, 7, 13, Math.PI * 1.63),
          this.skinLight, arm, [.008, -.013 + i * .025, -.006]);
        f.rotation.x = Math.PI / 2; f.rotation.z = -.26;
        this._ball(.014, this.skinLight, arm, [.041, -.011 + i * .025, -.018], [.8, .9, 1]);
      }
      const thumb = this._ball(.023, this.skinLight, arm, [.031, .071, .019], [.85, 1.65, .84]);
      thumb.rotation.z = -.74;
      this._line([.025, .072, .017], [.047, .032, .025], .019, this.skin, arm);
      if (gun) arm.rotation.x = .1;
    } else {
      this._ball(.08, this.skin, arm, [0, .025, -.004], [1, 1.05, .95]);
      for (let i = 0; i < 4; i++) {
        const x = -.052 + i * .033;
        this._ball(.025, this.skinLight, arm, [x, .079 - Math.abs(1.5 - i) * .003, -.022], [.84, .98, 1.12]);
        this._ball(.022, this.skin, arm, [x, .03, -.062], [.84, 1.16, .87]);
        this._line([x - .01, .047, -.071], [x + .007, .044, -.073], .0023, this.skinDark, arm);
      }
      const thumb = this._ball(.032, this.skinLight, arm, [.064, .013, -.007], [.77, 1.43, .84]);
      thumb.rotation.z = -.55;
      this._ball(.022, this.skin, arm, [.045, .051, -.035], [.9, 1.4, .9]);
    }
    return arm;
  }
  _build() {
    for (const name of ['hand', 'pipe', 'hammer', 'knife', 'gun']) {
      const g = new THREE.Group(); this.root.add(g); this.tools[name] = g;
    }
    this._hand(this.tools.hand);
    this._hand(this.offhand); this.tips.hand = new THREE.Vector3(0, .102, -.038);

    const pipe = this.tools.pipe; this._hand(pipe, true);
    this._cylinder(.034, .035, .82, this.iron, pipe, [0, .316, 0], 16);
    this._cylinder(.038, .038, .055, this.steel, pipe, [0, .67, 0], 16);
    const rim = this._mesh(new THREE.TorusGeometry(.031, .006, 8, 16), this.steel, pipe, [0, .732, 0]);
    rim.rotation.x = Math.PI / 2;
    this._cylinder(.025, .025, .001, this.black, pipe, [0, .733, 0], 16);
    for (let i = 0; i < 3; i++) this._cylinder(.038, .038, .018, this.black, pipe, [0, -.045 + i * .049, 0]);
    this.pipeBlood = this._ball(.035, this.blood, pipe, [.006, .652, .03], [1, 1.8, .16]);
    this.pipeBlood.visible = false; this.tips.pipe = new THREE.Vector3(0, .729, 0);

    const hammer = this.tools.hammer; this._hand(hammer, true);
    this._cylinder(.032, .038, .59, this.wood, hammer, [0, .23, 0], 12);
    for (let i = 0; i < 3; i++) this._cylinder(.038, .038, .024, this.black, hammer, [0, -.04 + i * .052, 0]);
    const head = this._box(.27, .124, .134, this.iron, hammer, [0, .54, 0]);
    this._cylinder(.069, .063, .079, this.steel, hammer, [.161, .54, 0]).rotation.z = Math.PI / 2;
    this._cylinder(.077, .077, .017, this.edge, hammer, [.205, .54, 0]).rotation.z = Math.PI / 2;
    this._box(.058, .03, .142, this.steel, hammer, [-.15, .538, 0]);
    this.hammerBlood = this._ball(.06, this.blood, hammer, [.217, .538, 0], [.03, .75, .86]);
    this.hammerBlood.visible = false; this.tips.hammer = new THREE.Vector3(.221, .54, 0);

    const knife = this.tools.knife; this._hand(knife, true);
    this._box(.047, .19, .038, this.black, knife, [0, .01, 0]);
    this._box(.142, .022, .067, this.iron, knife, [0, .114, 0]);
    for (const y of [-.056, .009, .071]) this._ball(.0055, this.brass, knife, [.027, y, 0], [.3, 1, 1]);
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-.054, .119); bladeShape.lineTo(.066, .119);
    bladeShape.lineTo(.064, .49); bladeShape.quadraticCurveTo(.052, .62, -.043, .724);
    bladeShape.lineTo(-.052, .63); bladeShape.lineTo(-.054, .119);
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: .016, bevelEnabled: true,
      bevelThickness: .004, bevelSize: .006, bevelSegments: 1, steps: 1, curveSegments: 10 });
    bladeGeo.translate(0, 0, -.008); this._mesh(bladeGeo, this.steel, knife);
    const edgeShape = new THREE.Shape();
    edgeShape.moveTo(.057, .14); edgeShape.lineTo(.067, .14); edgeShape.lineTo(.066, .49);
    edgeShape.quadraticCurveTo(.053, .62, -.043, .724); edgeShape.lineTo(-.027, .678);
    edgeShape.quadraticCurveTo(.047, .58, .055, .49); edgeShape.closePath();
    const edgeGeo = new THREE.ShapeGeometry(edgeShape, 12);
    const edgeFront = this._mesh(edgeGeo, this.edge, knife, [0, 0, .017]);
    const edgeBack = this._mesh(edgeGeo.clone(), this.edge, knife, [0, 0, -.017]); edgeBack.rotation.y = Math.PI;
    this.knifeBlood = this._box(.087, .142, .004, this.blood, knife, [.004, .512, .018]);
    this.knifeBlood.visible = false; this.tips.knife = new THREE.Vector3(-.043, .724, 0);

    const gun = this.tools.gun; this._hand(gun, true, true);
    const handle = this._box(.074, .165, .091, this.black, gun, [0, .005, .001]); handle.rotation.x = -.13;
    this._box(.093, .028, .1, this.iron, gun, [0, -.083, .012]);
    this._box(.112, .084, .31, this.iron, gun, [0, .14, -.092]);
    this._box(.089, .055, .215, this.black, gun, [0, .082, -.13]);
    this._box(.041, .009, .06, this.steel, gun, [.04, .185, -.071]);
    for (let i = 0; i < 5; i++) {
      this._box(.004, .044, .008, this.black, gun, [.057, .143, .018 + i * .013]);
      this._box(.004, .044, .008, this.black, gun, [-.057, .143, .018 + i * .013]);
    }
    this._cylinder(.028, .028, .143, this.iron, gun, [0, .143, -.282], 16).rotation.x = Math.PI / 2;
    this._mesh(new THREE.TorusGeometry(.024, .0045, 8, 16), this.edge, gun, [0, .143, -.357]);
    this._cylinder(.022, .022, .001, this.black, gun, [0, .143, -.356], 16).rotation.x = Math.PI / 2;
    this._box(.014, .019, .026, this.black, gun, [0, .19, -.224]);
    this._box(.061, .016, .022, this.black, gun, [0, .19, .044]);
    this._box(.036, .008, .02, this.steel, gun, [0, .195, .044]);
    this._line([0, .069, -.025], [0, .015, -.04], .009, this.iron, gun);
    this._line([0, .015, -.04], [0, .016, -.133], .009, this.iron, gun);
    this._line([0, .016, -.133], [0, .079, -.156], .009, this.iron, gun);
    this._box(.016, .037, .021, this.iron, gun, [0, .054, -.066]).rotation.x = -.35;
    this.tips.gun = new THREE.Vector3(0, .143, -.36);

    this.flash = new THREE.Group(); gun.add(this.flash); this.flash.position.copy(this.tips.gun);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffe49b, transparent: true, opacity: .94,
      blending: THREE.AdditiveBlending, depthWrite: false });
    this.resources.mat.add(flashMat);
    const outer = new THREE.MeshBasicMaterial({ color: 0xff8527, transparent: true, opacity: .66,
      blending: THREE.AdditiveBlending, depthWrite: false }); this.resources.mat.add(outer);
    const flare = this._mesh(new THREE.ConeGeometry(.043, .24, 7), flashMat, this.flash, [0, 0, -.11]);
    flare.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const ray = this._mesh(new THREE.ConeGeometry(.018, .17, 5), outer, this.flash, [0, 0, -.046]);
      ray.rotation.x = -Math.PI / 2 + Math.cos(i * Math.PI / 2) * .48;
      ray.rotation.z = Math.sin(i * Math.PI / 2) * .46;
    }
    this.flash.visible = false;
    this.flashLight = new THREE.PointLight(0xffaa58, 0, 2.6); this.flash.add(this.flashLight);
    const shellGeo = new THREE.CylinderGeometry(.009, .009, .033, 8); this.resources.geo.add(shellGeo);
    for (let i = 0; i < 8; i++) {
      const shell = new THREE.Mesh(shellGeo, this.brass); this.scene.add(shell); shell.visible = false;
      this.shells.push({ mesh: shell, life: 0, v: new THREE.Vector3(), spin: new THREE.Vector3() });
    }
  }
  _screen(nx, ny, distance, result) {
    const fov = Math.tan(this.camera.fov * Math.PI / 360);
    return result.set(nx * fov * this.camera.aspect * distance, ny * fov * distance, -distance)
      .applyQuaternion(this.camera.quaternion).add(this.camera.position);
  }
  _orientation(x, y, z, result) {
    this._e.set(x, y, z); result.setFromEuler(this._e);
    return result.premultiply(this.camera.quaternion);
  }
  setTool(tool) {
    const next = this.tools[tool] ? tool : 'none';
    if (this.tool !== next) this.cancel();
    this.tool = next;
    for (const [name, g] of Object.entries(this.tools)) g.visible = name === this.tool;
    this.root.visible = this.tool !== 'none';
    this.offhand.visible = this.tool === 'hand';
    return this;
  }
  aim(point) { this.aimPoint = point ? point.clone() : null; return this; }
  getMuzzleWorld(result = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return this.tools.gun.localToWorld(result.copy(this.tips.gun));
  }
  _ejectShell() {
    const shell = this.shells[this.shellIndex++ % this.shells.length];
    this.root.updateMatrixWorld(true);
    shell.mesh.position.set(.069, .145, -.017); this.tools.gun.localToWorld(shell.mesh.position);
    shell.mesh.quaternion.copy(this.root.quaternion);
    shell.v.set(.75 + Math.random() * .4, .4 + Math.random() * .35, .1 + Math.random() * .2)
      .applyQuaternion(this.camera.quaternion);
    shell.spin.set(10 + Math.random() * 8, 4 + Math.random() * 7, 8 + Math.random() * 10);
    shell.life = .85; shell.mesh.visible = true;
  }
  attack(tool, target, kind = 'tap', side = 1, onContact) {
    if (!this.tools[tool] || !target) return { contact: 0, duration: 0, accepted: false };
    if (this.tool !== tool) this.setTool(tool);
    if (tool === 'gun') {
      this.aim(target); this.recoil = Math.min(1.45, this.recoil + 1);
      this.flashTime = .046; this._ejectShell();
      if (onContact) onContact();
      return { contact: 0, duration: .18, accepted: true };
    }
    // A new tap starts the next blow as soon as the last blow has landed.
    // Never accumulate a long sequence that carries on after the player's taps.
    if (this.active && this.active.contacted) this.active = this.queue.shift() || null;
    if (this.active && this.queue.length >= 1) return { contact: 0, duration: 0, accepted: false };
    const swipe = tool === 'knife' && /swipe|slice|drag|slash/.test(kind);
    const duration = tool === 'hand' ? .295 : tool === 'pipe' ? .375 : tool === 'hammer' ? .41 : swipe ? .36 : .315;
    const contactAt = tool === 'hand' ? .105 : tool === 'pipe' ? .16 : tool === 'hammer' ? .185 : swipe ? .148 : .104;
    const action = { tool, target: target.clone(), kind, swipe, side: side < 0 ? -1 : 1,
      duration, contactAt, age: 0, contacted: false, onContact };
    let delay = this.active ? Math.max(0, this.active.contactAt + .028 - this.active.age) : 0;
    for (const a of this.queue) delay += a.contactAt + .028;
    if (!this.active) this.active = action; else this.queue.push(action);
    return { contact: delay + contactAt, duration: delay + duration, accepted: true };
  }
  reload(duration = .9) {
    this.reloadDuration = Math.max(.25, duration); this.reloadTime = this.reloadDuration;
  }
  _bloodOn(tool) {
    if (!PREF.blood) return;
    this.bloodyTools.add(tool);
    const mesh = tool === 'knife' ? this.knifeBlood : tool === 'hammer' ? this.hammerBlood : tool === 'pipe' ? this.pipeBlood : null;
    if (mesh) mesh.visible = true;
  }
  update(dt, time) {
    dt = Math.max(0, Math.min(.06, dt)); this.elapsed += dt;
    const t = Number.isFinite(time) ? time : this.elapsed;
    for (const shell of this.shells) if (shell.life > 0) {
      shell.life -= dt; shell.v.y -= dt * 4.2;
      shell.mesh.position.addScaledVector(shell.v, dt);
      shell.mesh.rotation.x += shell.spin.x * dt;
      shell.mesh.rotation.y += shell.spin.y * dt;
      shell.mesh.rotation.z += shell.spin.z * dt;
      if (shell.life <= 0) shell.mesh.visible = false;
    }
    this.flashTime = Math.max(0, this.flashTime - dt);
    this.flash.visible = this.tool === 'gun' && this.flashTime > 0;
    this.flashLight.intensity = this.flash.visible ? 2.4 : 0;
    this.recoil *= Math.exp(-dt * 18);
    this.reloadTime = Math.max(0, this.reloadTime - dt);
    this.knifeBlood.visible = PREF.blood && this.bloodyTools.has('knife');
    this.hammerBlood.visible = PREF.blood && this.bloodyTools.has('hammer');
    this.pipeBlood.visible = PREF.blood && this.bloodyTools.has('pipe');
    if (this.tool === 'none') return;
    const sway = Math.sin(t * 1.7) * .005, side = this.active && this.tool === 'hand' ? this.active.side : 1;
    const nx = this.tool === 'gun' ? .66 : .72;
    const ny = this.tool === 'gun' ? -.8 : -.84;
    const dist = 1.7;
    this._screen(nx * side, ny, dist, this._idlePos);
    this._idlePos.y += sway;
    if (this.tool === 'hand') this._orientation(-1.2, side * .22, -side * .18, this._idleQ);
    else if (this.tool === 'gun') this._orientation(-.05, -.1, -.06, this._idleQ);
    else this._orientation(-.27, -.1, -.21, this._idleQ);

    const a = this.active;
    if (a) {
      a.age += dt;
      if (!a.contacted && a.age >= a.contactAt) {
        a.contacted = true; this._bloodOn(a.tool);
        if (a.onContact) a.onContact();
      }
      const u = Math.min(1, a.age / a.duration), c = a.contactAt / a.duration;
      const qHit = this._q;
      if (a.tool === 'hand') this._orientation(-1.49, a.side * .1, -a.side * .14, qHit);
      else if (a.tool === 'knife' && !a.swipe) this._orientation(-1.54, a.side * .08, a.side * .15, qHit);
      else if (a.tool === 'knife') this._orientation(-.88, a.side * .11, -a.side * 1.12, qHit);
      else if (a.tool === 'hammer') this._orientation(-.92, -.17, -a.side * .76, qHit);
      else this._orientation(-1.02, a.side * .14, -a.side * .62, qHit);
      // Align the end of the blade/pipe/knuckles exactly with the selected surface.
      const hitPos = this._v.copy(this.tips[a.tool]).applyQuaternion(qHit).multiplyScalar(-1).add(a.target);
      const ease = x => x * x * (3 - 2 * x);
      if (u <= c) {
        const approach = ease(u / c);
        this.root.position.copy(this._idlePos).lerp(hitPos, approach);
        this.root.quaternion.copy(this._idleQ).slerp(qHit, approach);
        const arc = Math.sin(u / c * Math.PI);
        // A brief cocking arc makes swings read as forceful, without a long windup.
        this._unit.set(a.tool === 'hand' ? -.018 * a.side : .12 * a.side,
          a.tool === 'hand' ? -.022 : .13, .04).applyQuaternion(this.camera.quaternion);
        this.root.position.addScaledVector(this._unit, arc);
      } else {
        const retract = ease((u - c) / (1 - c));
        this.root.position.copy(hitPos).lerp(this._idlePos, retract);
        this.root.quaternion.copy(qHit).slerp(this._idleQ, retract);
        if (a.swipe) {
          this._unit.set(-a.side * .2, -.085, .025).applyQuaternion(this.camera.quaternion);
          this.root.position.addScaledVector(this._unit, Math.sin(retract * Math.PI));
        }
      }
      if (u >= 1 || (a.contacted && a.age >= a.contactAt + .028 && this.queue.length)) {
        this.active = this.queue.shift() || null;
      }
    } else {
      this.root.position.copy(this._idlePos); this.root.quaternion.copy(this._idleQ);
      if (this.tool === 'gun') {
        if (this.aimPoint) {
          this._unit.copy(this.aimPoint).sub(this.root.position).normalize();
          this._q.setFromUnitVectors(new THREE.Vector3(0, 0, -1), this._unit);
          // Preserve roll while aim follows the touched point.
          this.root.quaternion.slerp(this._q, .86);
        }
        this._unit.set(0, -.016 * this.recoil, .074 * this.recoil).applyQuaternion(this.camera.quaternion);
        this.root.position.add(this._unit);
        this._q.setFromEuler(this._e.set(.12 * this.recoil, 0, 0)); this.root.quaternion.multiply(this._q);
        if (this.reloadTime > 0) {
          const p = 1 - this.reloadTime / this.reloadDuration;
          const dip = Math.sin(p * Math.PI);
          this._unit.set(.07 * dip, -.19 * dip, .06 * dip).applyQuaternion(this.camera.quaternion);
          this.root.position.add(this._unit);
          this._q.setFromEuler(this._e.set(-.23 * dip, .35 * dip, -.48 * dip));
          this.root.quaternion.multiply(this._q);
        }
      }
    }
    if (this.tool === 'hand') {
      this._screen(-side * .72, -.88, 1.78, this._restOff);
      this.offhand.position.copy(this._restOff);
      this._orientation(-1.16, -side * .21, side * .2, this.offhand.quaternion);
      this.offhand.position.y += Math.sin(t * 1.7 + .9) * .004;
    }
  }
  cancel() {
    this.active = null; this.queue.length = 0; this.flashTime = 0; this.recoil = 0; this.reloadTime = 0;
    this.aimPoint = null;
    this.flash.visible = false; this.flashLight.intensity = 0;
    for (const shell of this.shells) { shell.life = 0; shell.mesh.visible = false; }
  }
  reset() {
    this.cancel(); this.bloodyTools.clear();
    this.knifeBlood.visible = this.hammerBlood.visible = this.pipeBlood.visible = false;
  }
  destroy() {
    this.cancel(); this.scene.remove(this.root); this.scene.remove(this.offhand);
    for (const shell of this.shells) this.scene.remove(shell.mesh);
    for (const geo of this.resources.geo) geo.dispose();
    for (const mat of this.resources.mat) mat.dispose();
  }
}


const FX=(function(){
 const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;
 const stain=M(new THREE.PlaneGeometry(8,8),new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:.46,polygonOffset:true,polygonOffsetFactor:-2}),scene,0,.014,0);stain.rotation.x=-Math.PI/2;stain.castShadow=false;
 const count=240,geo=new THREE.SphereGeometry(1,6,4),material=mat('#850d17',{roughness:.3});
 const pool=new THREE.InstancedMesh(geo,material,count);pool.instanceMatrix.setUsage(THREE.DynamicDrawUsage);pool.frustumCulled=false;scene.add(pool);const dummy=new THREE.Object3D();
 const drops=Array.from({length:count},()=>({p:V3(),v:V3(),age:0,life:0,size:.025}));let cursor=0;
 const chunks=[],retired=[],wounds=[];
 function splatter(p,size=.15){if(!PREF.blood)return;const x=(p.x/8+.5)*1024,y=(p.z/8+.5)*1024;ctx.fillStyle='#69101b';ctx.globalAlpha=.72;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x+rnd(-1,1)*size*100,y+rnd(-1,1)*size*100,size*120*rnd(.1,.65),size*90*rnd(.1,.6),rnd(0,TAU),0,TAU);ctx.fill();}ctx.globalAlpha=1;tex.needsUpdate=true;}
 function burst(p,n=V3(0,0,1),amount=12,style='blood'){
  if(!p)return;amount=clamp(Math.round(amount),1,65);for(let i=0;i<amount;i++){const d=drops[cursor++%count];d.p.copy(p);d.v.copy(n||V3(0,0,1)).multiplyScalar(rnd(.7,3.8)).add(V3(rnd(-1.6,1.6),rnd(-.5,2.4),rnd(-.5,1.5)));d.age=0;d.life=rnd(.28,.9);d.size=rnd(.014,.045);}
  if(amount>20)splatter(p,.12);
 }
 function chunk(obj,velocity=V3(rnd(-1.4,1.4),rnd(1,2.4),rnd(.3,1.2)),life=30){
  if(!obj)return;scene.updateMatrixWorld(true);scene.attach(obj);obj.userData.detached=true;obj.visible=true;
  const b=new THREE.Box3().setFromObject(obj),floor=Math.max(.025,(b.max.y-b.min.y)*.16);
  const item={obj,v:velocity.clone(),spin:V3(rnd(-4,4),rnd(-4,4),rnd(-4,4)),age:0,life:typeof life==='number'?life:30,held:false,floor};chunks.push(item);
  if(chunks.length>52){const old=chunks.shift();scene.remove(old.obj);retired.push(old.obj);}return item;
 }
 function wound(obj,p,n,size=.08,kind='hole'){
  if(!obj||!p)return;const grp=new THREE.Group();const blood=mat('#7c1018',{roughness:.3});
  const outer=M(new THREE.CircleGeometry(size,13),blood,grp);outer.castShadow=false;const core=M(new THREE.CircleGeometry(size*.64,11),mat('#29060d',{roughness:.55}),grp,0,0,.0015);core.castShadow=false;
  if(kind==='cut'){grp.scale.set(1,.23,1);outer.rotation.z=rnd(-.5,.5);}grp.position.copy(p).addScaledVector(n||V3(0,0,1),.009);grp.quaternion.setFromUnitVectors(V3(0,0,1),(n||V3(0,0,1)).clone().normalize());scene.add(grp);scene.updateMatrixWorld(true);obj.attach(grp);grp.userData.gore=true;wounds.push(grp);if(wounds.length>90){const old=wounds.shift();old.removeFromParent();disposeTree(old);}return grp;
 }
 function update(dt){
  pool.material.color.set(PREF.blood?'#850d17':'#aaa99a');
  for(let i=0;i<count;i++){const d=drops[i];d.age+=dt;if(d.age<d.life){d.v.y-=7*dt;d.p.addScaledVector(d.v,dt);if(d.p.y<.03){splatter(d.p,d.size*2);d.life=0;}dummy.position.copy(d.p);dummy.scale.set(d.size,d.size*(1+Math.min(2,d.v.length()*.25)),d.size);dummy.quaternion.setFromUnitVectors(V3(0,1,0),d.v.clone().normalize());}else dummy.scale.setScalar(0);dummy.updateMatrix();pool.setMatrixAt(i,dummy.matrix);}pool.instanceMatrix.needsUpdate=true;
  for(let i=chunks.length-1;i>=0;i--){const d=chunks[i];d.obj.traverse(o=>{if(o.userData.gore)o.visible=PREF.blood;});d.age+=dt;if(!d.held){d.v.y-=8.5*dt;d.obj.position.addScaledVector(d.v,dt);if(d.obj.position.y<d.floor){if(d.v.y<-1.2){splatter(d.obj.position,.12);d.v.y*=-.2;}else d.v.y=0;d.obj.position.y=d.floor;d.v.x*=Math.exp(-dt*4);d.v.z*=Math.exp(-dt*4);d.spin.multiplyScalar(Math.exp(-dt*4));}d.obj.rotation.x+=d.spin.x*dt;d.obj.rotation.y+=d.spin.y*dt;d.obj.rotation.z+=d.spin.z*dt;}
   if(d.age>d.life){d.obj.removeFromParent();retired.push(d.obj);chunks.splice(i,1);}}
  stain.visible=PREF.blood;wounds.forEach(w=>w.visible=PREF.blood);
 }
 function clear(){for(const o of [...chunks.map(c=>c.obj),...retired]){o.removeFromParent();disposeTree(o);}chunks.length=retired.length=0;for(const w of wounds){w.removeFromParent();disposeTree(w);}wounds.length=0;drops.forEach(d=>d.life=0);ctx.clearRect(0,0,1024,1024);tex.needsUpdate=true;update(0);}
 return {burst,chunk,wound,splatter,rip:()=>AUDIO.rip(),update,clear,chunks,get woundCount(){return wounds.length;}};
})();
/* New articulated Jade Emperor. Standalone segment inside the combat closure. */
class RichEmperor {
  constructor(){
    this.root=new THREE.Group();scene.add(this.root);
    this.parts=[];this.sections={};this.hp={};this.hits=0;this.pain=0;this.impact=0;this.zombie=false;
    this.neckDamage=0;this.headShots=0;this.wounds=0;this.hang=0;this.hangV=0;this.cutCount=0;this.faceBits=[];this.cavityBits=[];this.torn=new Set();
    this.materials=[];this.geometries=[];this.textures=[];
    const material=(c,o={})=>{const m=new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color(c).convertSRGBToLinear(),roughness:.65},o));this.materials.push(m);return m;};
    this.skin=material('#c79771');this.skinLit=material('#dfa980');this.skinDark=material('#a96850');
    this.flesh=material('#78232b',{roughness:.93});this.raw=material('#c8504a',{roughness:.9});this.blood=material('#430f19',{roughness:.4});this.bone=material('#d5bb99');
    this.ivory=material('#e8d9b8',{map:this._fabric('ivory'),roughness:.85});this.ivoryDark=material('#bd9d6e',{roughness:.87});
    this.jade=material('#294d3b',{roughness:.38});this.jadeLight=material('#648b59',{roughness:.35});this.red=material('#65282c',{roughness:.86});
    this.gold=material('#d9ab4c',{metalness:.72,roughness:.27});this.goldDark=material('#896222',{metalness:.6,roughness:.45});
    this.black=material('#25252a',{roughness:.54});this.hair=material('#4d4745',{roughness:.85});this.white=material('#f1e8d7',{roughness:.62});
    this.eyeWhite=material('#fff5df',{roughness:.4});this.pupil=material('#211b18',{roughness:.4});this.wet=material('#b8e6ed',{transparent:true,opacity:.72,roughness:.15,metalness:.12});
    this._makeBody();this._makeHead();this._makeArms();this._makeLegs();
    this.root.updateMatrixWorld(true);
  }
  _fabric(){
    const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#e5d6b2';x.fillRect(0,0,256,256);
    x.strokeStyle='rgba(116,84,36,.07)';x.lineWidth=.6;for(let i=0;i<256;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke();}
    x.strokeStyle='rgba(255,248,226,.21)';for(let i=0;i<256;i+=3){x.beginPath();x.moveTo(0,i);x.lineTo(256,i);x.stroke();}
    // Small repeated auspicious cloud curls, woven into the cloth rather than a decal.
    x.strokeStyle='rgba(126,94,40,.17)';x.lineWidth=1.7;
    for(let yy=18;yy<256;yy+=46)for(let xx=(yy%92?18:38);xx<256;xx+=52){x.beginPath();x.arc(xx,yy,6,.2,5.5);x.arc(xx+10,yy+2,5,3.7,7);x.stroke();x.beginPath();x.moveTo(xx-7,yy+7);x.quadraticCurveTo(xx+8,yy+13,xx+20,yy+5);x.stroke();}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.3,1.7);t.encoding=THREE.sRGBEncoding;this.textures.push(t);return t;
  }
  _group(part,parent,pos){const g=new THREE.Group();if(pos)g.position.set(...pos);(parent||this.root).add(g);this.sections[part]=g;g.userData.part=part;this.hp[part]=0;return g;}
  _mesh(geo,mat,parent,part,pos,scale){this.geometries.push(geo);const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;if(pos)m.position.set(...pos);if(scale)m.scale.set(...scale);parent.add(m);if(part){m.userData.part=part;this.parts.push(m);}return m;}
  _ball(parent,part,mat,pos,scale,seg=24){return this._mesh(new THREE.SphereGeometry(1,seg,Math.max(12,Math.round(seg*.65))),mat,parent,part,pos,scale);}
  _tube(parent,part,mat,points,r=.025,seg=24){const curve=new THREE.CatmullRomCurve3(points.map(p=>V3(...p)));return this._mesh(new THREE.TubeGeometry(curve,seg,r,7,false),mat,parent,part);}
  _cyl(parent,part,mat,pos,r1,r2,h){return this._mesh(new THREE.CylinderGeometry(r1,r2,h,20),mat,parent,part,pos);}
  _patch(parent,part,mat,points,z){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>shape.lineTo(p[0],p[1]));shape.closePath();return this._mesh(new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,steps:1}),mat,parent,part,[0,0,z]);}
  _splitSphere(part,mat,parent,upper){
    const geo=new THREE.SphereGeometry(1,40,28),p=geo.attributes.position,ix=geo.index.array,out=[];
    for(let i=0;i<ix.length;i+=3){const y=(p.getY(ix[i])+p.getY(ix[i+1])+p.getY(ix[i+2]))/3;if((y>.57)===upper)out.push(ix[i],ix[i+1],ix[i+2]);}
    geo.setIndex(out);return this._mesh(geo,mat,parent,part);
  }
  _makeBody(){
    this.body=this._group('belly',this.root,[0,1.42,0]);this.body.scale.set(1.10,.96,.86);
    this.bellyMesh=this._splitSphere('belly',this.ivory,this.body,false);this.chestMesh=this._splitSphere('chest',this.ivory,this.body,true);this.sections.chest=this.body;this.hp.chest=0;
    // A long overlapping imperial coat: two brocade panels sweep around the heavy belly.
    for(const s of [-1,1]){
      const g=this._mesh(new THREE.SphereGeometry(1.006,28,20,s<0?.70*Math.PI:-.18*Math.PI,.48*Math.PI,.27*Math.PI,.62*Math.PI),this.jade,this.body,'belly');
      this._tube(this.body,'belly',this.goldDark,[[s*.64,.64,.64],[s*.76,.28,.68],[s*.82,-.17,.56],[s*.71,-.57,.42]],.018);
      this._tube(this.body,'belly',this.gold,[[s*.62,.64,.66],[s*.75,.28,.70],[s*.80,-.17,.58],[s*.70,-.58,.44]],.012);
    }
    // Wide layered y-collar, angled over a deliberately stretched round robe.
    this.collar=new THREE.Group();this.collar.position.set(0,1.96,.64);this.root.add(this.collar);
    for(const s of [-1,1]){
      this._patch(this.collar,'chest',this.red,[[s*.42,.31],[s*.12,.17],[-s*.25,-.25],[-s*.10,-.35],[s*.31,.12]],.025);
      this._tube(this.collar,'chest',this.gold,[[s*.39,.30,.07],[s*.10,.14,.075],[-s*.22,-.26,.08]],.019);
      this._tube(this.collar,'chest',this.ivoryDark,[[s*.48,.08,.055],[s*.60,-.10,.10],[s*.66,-.23,.12]],.022);
    }
    const under=this._patch(this.collar,'chest',this.ivoryDark,[[-.18,.18],[.18,.18],[.08,-.04],[-.08,-.04]],.005);
    // A gold and jade imperial plaque, not a western tie.
    const chainPoints=[];
    for(let i=0;i<23;i++){const a=i/22,xx=lerp(-.57,.57,a),yy=2.30-.35*Math.sin(a*Math.PI),zz=.61+.23*Math.sin(a*Math.PI);chainPoints.push([xx,yy,zz]);const link=this._mesh(new THREE.TorusGeometry(.052,.018,7,12),i%2?this.goldDark:this.gold,this.root,'chest',[xx,yy,zz]);link.rotation.y=i%2?.78:-.38;link.rotation.z=.2*Math.sin(a*Math.PI*2);}
    this.medallion=new THREE.Group();this.medallion.position.set(0,1.92,.88);this.root.add(this.medallion);
    const coin=this._cyl(this.medallion,'chest',this.gold,[0,0,0],.18,.18,.07);coin.rotation.x=Math.PI/2;
    const insert=this._cyl(this.medallion,'chest',this.jadeLight,[0,0,.046],.123,.123,.024);insert.rotation.x=Math.PI/2;
    this._tube(this.medallion,'chest',this.gold,[[0,-.08,.065],[-.05,-.05,.065],[-.06,.035,.065],[0,.085,.065],[.07,.035,.065],[.04,-.04,.065],[0,-.065,.065]],.012,18);
    // Gilded embroidered dragon-cloud forms on the broad lower garment.
    this.embroidery=new THREE.Group();this.root.add(this.embroidery);
    for(const s of [-1,1]){
      this._tube(this.embroidery,'belly',this.goldDark,[[s*.47,1.75,.76],[s*.63,1.54,.83],[s*.50,1.33,.89],[s*.32,1.18,.86],[s*.53,1.08,.82],[s*.72,1.22,.74]],.020);
      this._tube(this.embroidery,'belly',this.gold,[[s*.45,1.76,.785],[s*.62,1.53,.851],[s*.49,1.32,.913],[s*.31,1.17,.884],[s*.51,1.08,.844],[s*.70,1.23,.77]],.012);
      this._ball(this.embroidery,'belly',this.gold,[s*.47,1.76,.783],[.045,.032,.018],12);
      for(let i=0;i<4;i++)this._tube(this.embroidery,'belly',this.gold,[[s*(.42+i*.048),1.38-i*.055,.91-i*.013],[s*(.55+i*.038),1.40-i*.065,.897-i*.02]],.009,6);
    }
    this._tube(this.root,'belly',this.ivoryDark,[[-.52,.64,.49],[-.26,.53,.58],[0,.50,.61],[.27,.53,.58],[.53,.65,.49]],.025);
    this._tube(this.root,'belly',this.red,[[-.54,.61,.50],[-.25,.50,.61],[0,.47,.63],[.26,.50,.61],[.54,.62,.50]],.032);
    this._tube(this.root,'belly',this.gold,[[-.54,.59,.535],[-.25,.48,.646],[0,.45,.668],[.26,.48,.646],[.54,.60,.535]],.011);
    this.neck=this._group('neck',this.root,[0,2.25,.0]);
    this.neckSkin=this._cyl(this.neck,'neck',this.skin,[0,.035,.17],.32,.34,.23);
    this.neckFront=this._ball(this.neck,'neck',this.skin,[0,.049,.48],[.275,.087,.26],28);
    this._ball(this.neck,'neck',this.skinDark,[0,-.065,.30],[.39,.075,.13],24);
    this.neckCord=this._cyl(this.root,null,this.raw,[0,2.25,.10],.029,.050,.20);this.neckCord.userData.gore=true;this.neckCord.visible=false;
  }
  _face(mesh){this.faceBits.push(mesh);return mesh;}
  _makeHead(){
    this.headHinge=new THREE.Group();this.headHinge.position.set(0,2.24,0);this.root.add(this.headHinge);
    this.head=this._group('head',this.headHinge,[0,.42,.045]);
    this.skull=this._ball(this.head,'head',this.skin,[0,0,0],[.59,.455,.46],48);
    this.headSurfaceOriginal=Array.from(this.skull.geometry.index.array);
    // Distinct jowls, two chins and the soft folds of an obese face.
    this.jowls=[];for(const s of [-1,1]){
      this.jowls.push(this._face(this._ball(this.head,'head',this.skinLit,[s*.30,-.12,.315],[.285,.235,.185],28)));
      this._face(this._ball(this.head,'head',this.skinDark,[s*.505,-.005,.003],[.10,.145,.075],20));
      this._face(this._ball(this.head,'head',this.skinLit,[s*.514,.002,.05],[.074,.107,.042],20));
      this._face(this._tube(this.head,'head',this.skinDark,[[s*.105,.025,.457],[s*.20,-.055,.499],[s*.20,-.19,.481]],.012,14));
    }
    this.chin=this._face(this._ball(this.head,'head',this.skinLit,[0,-.275,.27],[.38,.145,.26],28));
    this._face(this._ball(this.head,'head',this.skinDark,[0,-.365,.17],[.37,.055,.22],24));
    this._face(this._ball(this.head,'head',this.skin,[0,-.393,.115],[.34,.062,.205],24));
    this.nose=this._face(this._ball(this.head,'head',this.skinLit,[0,.01,.475],[.15,.126,.17],28));
    for(const s of [-1,1]){this._face(this._ball(this.head,'head',this.skinLit,[s*.10,-.041,.49],[.09,.067,.095],18));this._face(this._ball(this.head,'head',this.skinDark,[s*.07,-.076,.548],[.031,.014,.014],16));}
    this.eyes=[];this.brows=[];this.lids=[];this.tears=[];
    for(const s of [-1,1]){
      const eg=new THREE.Group();eg.position.set(s*.235,.114,.415);this.head.add(eg);
      const rim=this._face(this._ball(eg,'head',this.skinDark,[0,0,-.006],[.145,.105,.042],24));
      const white=this._face(this._ball(eg,'head',this.eyeWhite,[0,0,.014],[.121,.083,.043],24));
      const iris=this._face(this._ball(eg,'head',this.goldDark,[-s*.02,-.007,.052],[.045,.045,.014],20));
      const pupil=this._face(this._ball(eg,'head',this.pupil,[-s*.02,-.008,.066],[.023,.029,.008],16));
      this._face(this._ball(eg,'head',this.eyeWhite,[-s*.032,.009,.073],[.008,.010,.004],10));
      const lid=this._face(this._ball(eg,'head',this.skin,[0,.064,.048],[.143,.077,.018],24));
      this.lids.push(lid);this.eyes.push({group:eg,pupil,iris,white,side:s});
      const bg=new THREE.Group();bg.position.set(s*.24,.244,.412);this.head.add(bg);
      const brow=this._face(this._tube(bg,'head',this.hair,[[-.13,0,0],[0,.018,.017],[.13,.013,-.014]],.031,16));
      bg.rotation.z=s*.17;this.brows.push({group:bg,side:s});
      const streak=this._tube(this.head,null,this.wet,[[s*.24,.083,.47],[s*.28,-.018,.501],[s*.31,-.14,.484],[s*.30,-.265,.42]],.011,16);streak.visible=false;
      const drop=this._ball(this.head,null,this.wet,[s*.29,-.03,.512],[.022,.037,.014],14);drop.visible=false;this.tears.push({streak,drop,eye:white,side:s,phase:Math.random()});
    }
    this.mouthGroup=new THREE.Group();this.mouthGroup.position.set(0,-.205,.477);this.head.add(this.mouthGroup);
    this.mouth=this._face(this._ball(this.mouthGroup,'head',this.blood,[0,0,0],[.173,.036,.025],24));
    this.teeth=this._face(this._ball(this.mouthGroup,'head',this.white,[0,.003,.018],[.145,.018,.007],20));
    this.lowerLip=this._face(this._tube(this.mouthGroup,'head',this.skinDark,[[-.185,.018,.003],[0,-.025,.022],[.185,.073,-.004]],.015,18));
    this.mouthGroup.rotation.z=-.10;
    // A short imperial moustache, with curled points and a tiny grey tuft.
    for(const s of [-1,1]){
      this._face(this._tube(this.head,'head',this.hair,[[s*.02,-.098,.571],[s*.13,-.113,.555],[s*.23,-.142,.512],[s*.27,-.185,.469],[s*.31,-.174,.423]],.030,20));
      this._face(this._tube(this.head,'head',this.white,[[s*.04,-.103,.600],[s*.12,-.119,.582],[s*.19,-.141,.55]],.007,12));
    }
    this._face(this._ball(this.head,'head',this.hair,[0,-.312,.494],[.06,.052,.022],20));
    this.crown=new THREE.Group();this.crown.position.set(0,.405,0);this.crown.rotation.z=.025;this.head.add(this.crown);
    this._cyl(this.crown,'head',this.black,[0,.12,0],.33,.37,.30);
    this._cyl(this.crown,'head',this.goldDark,[0,-.018,0],.39,.39,.052);
    this._cyl(this.crown,'head',this.jade,[0,.006,0],.373,.373,.07);
    const board=this._mesh(new THREE.BoxGeometry(.91,.055,.77),this.black,this.crown,'head',[0,.29,-.01]);
    this._mesh(new THREE.BoxGeometry(.95,.035,.81),this.goldDark,this.crown,'head',[0,.267,-.01]);
    this._mesh(new THREE.BoxGeometry(.80,.012,.65),this.red,this.crown,'head',[0,.323,-.01]);
    for(let i=0;i<5;i++){const xx=(i-2)*.17,front=this._tube(this.crown,'head',this.goldDark,[[xx,.267,.375],[xx,.11,.405]],.004,8);for(let j=0;j<3;j++)this._ball(this.crown,'head',j%2?this.jadeLight:this.gold,[xx,.22-j*.055,.39+j*.006],[.017,.019,.017],10);}
    this._ball(this.crown,'head',this.jadeLight,[0,.092,.374],[.105,.050,.032],20);
    for(const s of [-1,1]){this._tube(this.crown,'head',this.gold,[[s*.31,.19,.28],[s*.38,.07,.15],[s*.36,-.04,.0]],.013,12);this._ball(this.crown,'head',this.red,[s*.37,-.09,0],[.045,.065,.04],16);}
  }
  _makeArms(){
    this.arms=[];
    for(const s of [-1,1]){
      const suffix=s<0?'L':'R',upper=this._group('arm'+suffix,this.root,[s*.98,2.12,.01]);
      this._ball(upper,'arm'+suffix,this.ivory,[0,-.25,0],[.29,.36,.28],28);
      this._tube(upper,'arm'+suffix,this.goldDark,[[-.14,-.43,.23],[0,-.47,.25],[.15,-.43,.23]],.014,14);
      const elbow=this._group('forearm'+suffix,upper,[0,-.54,0]);
      this._ball(elbow,'forearm'+suffix,this.ivory,[0,-.23,0],[.245,.31,.25],28);
      const cuff=this._cyl(elbow,'forearm'+suffix,this.red,[0,-.43,0],.244,.232,.16);
      this._cyl(elbow,'forearm'+suffix,this.gold,[0,-.475,0],.246,.236,.025);
      this._cyl(elbow,'forearm'+suffix,this.goldDark,[0,-.369,0],.246,.246,.018);
      for(let i=0;i<5;i++){const a=i/5*TAU;this._ball(elbow,'forearm'+suffix,this.jadeLight,[Math.cos(a)*.247,-.424,Math.sin(a)*.247],[.016,.03,.016],10);}
      const hand=this._group('hand'+suffix,elbow,[0,-.52,0]);
      this._ball(hand,'hand'+suffix,this.skinLit,[0,-.11,0],[.16,.19,.083],24);
      this._ball(hand,'hand'+suffix,this.skin,[s*.10,-.08,.022],[.07,.12,.073],20);
      const fingers=[];
      for(let i=0;i<4;i++){
        const fx=(i-1.5)*.074,fy=-.24+(i===0||i===3?.025:0),g=new THREE.Group();g.position.set(fx,fy,0);hand.add(g);
        this._ball(g,'hand'+suffix,this.skinLit,[0,-.056,0],[.038,.074,.037],16);
        const tipg=new THREE.Group();tipg.position.y=-.109;g.add(tipg);
        this._ball(tipg,'hand'+suffix,this.skinLit,[0,-.044,.008],[.035,.065,.034],16);
        this._ball(tipg,'hand'+suffix,this.ivoryDark,[0,-.062,.034],[.023,.026,.004],12);
        fingers.push({g,tip:tipg});
        if(i===1){const ring=this._mesh(new THREE.TorusGeometry(.040,.011,7,12),this.gold,g,'hand'+suffix,[0,-.041,0]);ring.rotation.x=Math.PI/2;this._ball(g,'hand'+suffix,this.jadeLight,[0,-.041,.05],[.026,.023,.016],12);}
      }
      const tg=new THREE.Group();tg.position.set(s*.142,-.052,.036);tg.rotation.z=s*.9;hand.add(tg);
      this._ball(tg,'hand'+suffix,this.skinLit,[0,-.06,0],[.049,.085,.045],16);this._ball(tg,'hand'+suffix,this.skinLit,[0,-.143,.015],[.042,.053,.04],16);
      this.arms.push({side:s,suffix,upper,elbow,hand,fingers,thumb:tg});
    }
  }
  _makeLegs(){
    this.legs=[];
    for(const s of [-1,1]){
      const suffix=s<0?'L':'R',thigh=this._group('thigh'+suffix,this.root,[s*.42,.70,.015]);
      this._ball(thigh,'thigh'+suffix,this.jade,[0,-.18,0],[.23,.27,.225],24);
      const leg=this._group('leg'+suffix,thigh,[0,-.34,0]);this._cyl(leg,'leg'+suffix,this.black,[0,-.09,0],.15,.13,.23);
      this._cyl(leg,'leg'+suffix,this.goldDark,[0,.01,0],.17,.17,.05);
      const foot=this._group('foot'+suffix,leg,[0,-.23,.08]);this._ball(foot,'foot'+suffix,this.black,[s*.018,-.032,.10],[.20,.102,.29],24);
      this._tube(foot,'foot'+suffix,this.goldDark,[[s*.17,-.085,-.03],[0,-.09,.32],[-s*.17,-.085,-.03]],.014,16);
      this._ball(foot,'foot'+suffix,this.goldDark,[0,.034,.225],[.11,.036,.055],16);
      this.legs.push({side:s,suffix,thigh,leg,foot});
    }
  }
  _attached(o){let n=o;while(n){if(n===this.root)return true;n=n.parent;}return false;}
  _removeParts(obj){obj.traverse(o=>{o.userData.detached=true;});for(let i=this.parts.length-1;i>=0;i--)if(this.parts[i].userData.detached)this.parts.splice(i,1);}
  _cutCap(parent,pos,r=.16){
    const cap=this._cyl(parent,null,this.flesh,pos,r,r,.025);const core=this._cyl(parent,null,this.raw,[pos[0],pos[1]-.018,pos[2]],r*.77,r*.77,.02);cap.userData.gore=core.userData.gore=true;
    this._cyl(parent,null,this.bone,[pos[0],pos[1]-.034,pos[2]],r*.20,r*.16,.05).userData.gore=true;
    return cap;
  }
  _detach(part,force){
    const g=this.sections[part];if(!g||!this._attached(g)||this.torn.has(part)||['belly','chest','neck','head'].includes(part))return false;
    g.updateWorldMatrix(true,true);const p=g.getWorldPosition(V3()),parent=g.parent,local=g.position.clone();this._removeParts(g);this.torn.add(part);
    this._cutCap(parent,[local.x,local.y+.02,local.z],part.startsWith('arm')?.22:part.startsWith('forearm')?.19:part.startsWith('hand')?.11:.15);
    this._cutCap(g,[0,.015,0],part.startsWith('arm')?.22:part.startsWith('forearm')?.19:part.startsWith('hand')?.11:.15);
    FX.chunk(g,force||V3(rnd(-1.6,1.6),rnd(1.8,3.0),rnd(1,3)),30);FX.burst(p,V3(0,1,1),22,'blood');FX.splatter(p,.18);if(FX.rip)FX.rip(p);
    return true;
  }
  _carveHead(point,normal,radius){
    this.head.updateWorldMatrix(true,true);const p=this.head.worldToLocal(point.clone()),q=this.head.getWorldQuaternion(new THREE.Quaternion()).invert(),n=normal.clone().applyQuaternion(q).normalize();
    if(p.y>.46){p.y=.25;p.z=.28;n.set(0,.3,1).normalize();}
    const geo=this.skull.geometry,attr=geo.attributes.position,idx=geo.index.array,out=[];let removed=0;
    for(let i=0;i<idx.length;i+=3){const v=V3();for(let j=0;j<3;j++)v.add(V3(attr.getX(idx[i+j])*.59,attr.getY(idx[i+j])*.455,attr.getZ(idx[i+j])*.46));v.multiplyScalar(1/3);if(v.distanceTo(p)<radius){removed++;}else out.push(idx[i],idx[i+1],idx[i+2]);}
    geo.setIndex(out);geo.computeVertexNormals();
    for(const f of this.faceBits){if(!this._attached(f)||!f.visible)continue;f.updateWorldMatrix(true,false);const fp=this.head.worldToLocal(f.getWorldPosition(V3()));if(fp.distanceTo(p)<radius*.88){this._removeParts(f);FX.chunk(f,normal.clone().multiplyScalar(rnd(1.5,3)).add(V3(rnd(-1,1),rnd(1,3),0)),20);}}
    if(!removed)return;
    for(const old of this.cavityBits){this._removeParts(old);old.removeFromParent();old.geometry.dispose();}this.cavityBits.length=0;
    if(out.length<1500){
      if(this._attached(this.crown)){this._removeParts(this.crown);FX.chunk(this.crown,V3(-1.2,2,1),30);}
      for(const f of this.faceBits)if(this._attached(f)){this._removeParts(f);FX.chunk(f,V3(rnd(-1.5,1.5),rnd(.6,2.4),rnd(.3,1.8)),24);}
      for(const [pos,scale] of [[[0,-.36,.12],[.16,.09,.13]],[[-.09,-.30,.10],[.07,.10,.08]],[[.11,-.33,.08],[.08,.07,.10]]]){const tissue=this._ball(this.head,'head',this.flesh,pos,scale,16);tissue.userData.gore=true;this.cavityBits.push(tissue);}
      const bone=this._cyl(this.head,'head',this.bone,[0,-.32,.09],.028,.036,.16);bone.rotation.z=.3;bone.userData.gore=true;this.cavityBits.push(bone);
    }else{
      const orientation=new THREE.Quaternion().setFromUnitVectors(V3(0,0,1),n),inner=p.clone().addScaledVector(n,-radius*.55),flesh=this._ball(this.head,'head',this.flesh,inner.toArray(),[radius*.72,radius*.72,radius*.18],24);flesh.quaternion.copy(orientation);flesh.userData.cavity=true;flesh.userData.gore=true;this.cavityBits.push(flesh);
      const rim=this._mesh(new THREE.TorusGeometry(radius*.65,radius*.050,7,24),this.raw,this.head,'head',p.clone().addScaledVector(n,-radius*.12).toArray());rim.quaternion.copy(orientation);rim.userData.gore=true;this.cavityBits.push(rim);
      for(let i=0;i<7;i++){const a=i/7*TAU,edge=V3(Math.cos(a)*radius*.69,Math.sin(a)*radius*.67,-radius*.12).applyQuaternion(orientation).add(p);const bone=this._ball(this.head,'head',this.bone,edge.toArray(),[.030,.039,.018],10);bone.rotation.set(rnd(-.8,.8),rnd(-.8,.8),a);bone.userData.gore=true;this.cavityBits.push(bone);}
    }
    const shard=this._ball(scene,null,this.skin,p.toArray(),[radius*.65,radius*.58,radius*.34],14);shard.position.copy(point);shard.quaternion.copy(this.head.getWorldQuaternion(new THREE.Quaternion()));FX.chunk(shard,normal.clone().multiplyScalar(2.5).add(V3(rnd(-1,1),2,0)),22);
    FX.burst(point,normal,35,'blood');FX.splatter(point,.25);this.cutCount++;
  }
  _hangHead(point,normal){
    if(this.neckDamage<2)return;this.neckSkin.visible=this.neckFront.visible=false;this.neckCord.visible=true;this.hangV+=2.5;this.hang=Math.max(this.hang,.45);
    if(!this.neckOpened){this.neckOpened=true;this._cutCap(this.root,[0,2.20,.03],.30);const hcap=this._cyl(this.head,'head',this.raw,[0,-.39,.03],.22,.24,.04);hcap.userData.gore=true;FX.burst(point,normal,30,'blood');FX.splatter(point,.22);}
  }
  applyDamage(info,tool,kind,power=1){
    let part=info.part||info.obj?.userData.part||'belly';if(!Object.prototype.hasOwnProperty.call(this.hp,part))part='belly';
    const pt=info.point.clone(),nn=(info.normal||V3(0,0,1)).clone();this.hits++;this.impact=Math.min(1.4,this.impact+.6);this.pain=Math.max(this.pain,Math.min(1,this.hits/10));
    const gun=tool==='gun',knife=tool==='knife',hammer=tool==='hammer',pipe=tool==='pipe',swipe=kind==='swipe'||kind==='slice'||kind==='cut'||kind==='slash';
    const amount=gun?1.35:knife?(swipe?1.1:.65):hammer?.9:pipe?.54:.19;this.hp[part]=(this.hp[part]||0)+amount*Math.max(.7,power);
    let severity=gun?18:knife?(swipe?15:12):hammer?15:pipe?9:3.5,fatal=false,detached;
    if(this.wounds<60){FX.wound(info.obj,pt,nn,gun?.12:knife?.13:hammer?.08:.047,knife?'cut':gun?'hole':'bruise');this.wounds++;}
    FX.burst(pt,nn,gun?25:knife?14:hammer?9:4,gun||knife?'blood':'hit');
    if(part==='head'){
      if(gun){this.headShots++;this._carveHead(pt,nn,this.headShots===1?.34:this.headShots===2?.45:Math.min(.65,.50+this.headShots*.027));fatal=true;}
      else if(knife&&this.hp.head>2.0){this._carveHead(pt,nn,.24);fatal=this.hp.head>3.1;}
      else if(hammer&&this.hp.head>3.4){this._carveHead(pt,nn,.22);fatal=true;}
    }
    if(part==='neck'&&knife){this.neckDamage+=swipe?1:.5;this._hangHead(pt,nn);fatal=this.neckDamage>=2;}
    if(part==='neck'&&gun){this.neckDamage+=1.5;this._hangHead(pt,nn);fatal=this.neckDamage>=2;}
    if(part==='chest'&&((gun&&this.hp.chest>=2.6)||(knife&&this.hp.chest>=2.0)))fatal=true;
    if(part==='belly'&&((gun&&this.hp.belly>=4.0)||(knife&&this.hp.belly>=4.3)))fatal=true;
    if(/^(arm|forearm|hand|thigh|leg|foot)/.test(part)){
      const limit=part.startsWith('hand')||part.startsWith('foot')?2.05:gun?2.65:knife?2.85:3.8;
      if(this.hp[part]>=limit&&this._detach(part,nn.clone().multiplyScalar(2).add(V3(0,2,0))))detached=part;
    }
    if(fatal)this.zombie=true;
    return {fatal,severity,detached};
  }
  tearPart(part,worldPoint,forceVector){
    if(!this.zombie&&(this.hp[part]||0)<.7)return false;
    if(part==='head'||part==='neck'){
      this.neckDamage=2;this._hangHead(worldPoint,V3(0,0,1));this.zombie=true;this.hits++;this.impact=1;return true;
    }
    if(part==='belly'||part==='chest'){
      if(this.cutCount>14)return false;const n=worldPoint.clone().sub(this.root.getWorldPosition(V3())).normalize();FX.wound(this.bellyMesh,worldPoint,n,.18,'cut');
      const c=this._ball(scene,null,this.raw,worldPoint.toArray(),[.14,.12,.10],16);c.userData.gore=true;FX.chunk(c,forceVector.clone().multiplyScalar(.6).add(V3(0,2,0)),24);FX.burst(worldPoint,n,16,'blood');this.cutCount++;return true;
    }
    this.impact=1;return this._detach(part,forceVector.clone().multiplyScalar(.8).add(V3(0,2,0)));
  }
  _armIK(a,target,bend){
    if(!this._attached(a.upper))return;const start=a.upper.position.clone(),delta=target.clone().sub(start),dist=clamp(delta.length(),.13,1.045),dir=delta.normalize(),l1=.54,l2=.52;
    const along=(dist*dist+l1*l1-l2*l2)/(2*dist),height=Math.sqrt(Math.max(.001,l1*l1-along*along));
    let side=bend.clone().sub(start).addScaledVector(dir,-bend.clone().sub(start).dot(dir)).normalize();if(side.lengthSq()<.1)side=V3(a.side,0,0);
    const elbow=start.clone().addScaledVector(dir,along).addScaledVector(side,height),v1=elbow.clone().sub(start).normalize();a.upper.quaternion.setFromUnitVectors(V3(0,-1,0),v1);
    if(this._attached(a.elbow)){const v2=target.clone().sub(elbow).normalize().applyQuaternion(a.upper.quaternion.clone().invert());a.elbow.quaternion.setFromUnitVectors(V3(0,-1,0),v2);}
    if(this._attached(a.hand)){const inv=a.upper.quaternion.clone().multiply(a.elbow.quaternion).invert(),desired=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,Math.PI*this.pain));a.hand.quaternion.copy(inv.multiply(desired));}
  }
  update(dt,time){
    this.impact=Math.max(0,this.impact-dt*1.9);const fear=clamp(this.hits/12,0,1),tremble=(.003+fear*.019)*(this.zombie?1.35:1);
    this.root.position.x=Math.sin(time*36)*tremble+Math.sin(time*51)*this.impact*.015;this.root.rotation.y=Math.sin(time*25)*tremble*.55;this.root.rotation.z=Math.sin(time*31)*tremble*.28;
    const jiggle=Math.sin(time*17)*this.impact*.025;this.body.scale.set(1.10+jiggle,.96-jiggle*.3,.86-jiggle*.2);
    if(this.neckDamage>=2){this.hangV+=(-this.hang*11+7.4)*dt;this.hangV*=Math.pow(.22,dt);this.hang+=this.hangV*dt;this.headHinge.rotation.z=this.hang+Math.sin(time*7)*.025;this.headHinge.rotation.x=.25+Math.sin(time*4)*.035;this.headHinge.position.y=2.17;}
    else{this.headHinge.rotation.z=Math.sin(time*22)*fear*.028+Math.sin(time*9)*this.impact*.08;this.headHinge.rotation.x=-this.impact*.10+Math.sin(time*20)*fear*.014;}
    this.head.updateWorldMatrix(true,true);
    for(const b of this.brows){b.group.rotation.z=lerp(b.side*.17,-b.side*.40,this.pain);b.group.position.y=.244+this.pain*.023+Math.sin(time*24)*fear*.004;}
    for(const e of this.eyes){if(this._attached(e.pupil)){e.pupil.position.x=-e.side*.02+Math.sin(time*13+e.side)*fear*.014;e.pupil.position.y=-.008-fear*.009;}if(this._attached(e.white))e.white.scale.y=.083*(1-fear*.19);}
    for(const l of this.lids){if(this._attached(l)){l.position.y=.064+fear*.030+this.impact*.013;l.scale.y=.077*(1-fear*.23);}}
    if(this._attached(this.mouth))this.mouth.scale.y=lerp(.036,.116,this.pain)*(1+Math.sin(time*18)*fear*.12);if(this._attached(this.teeth))this.teeth.position.y=lerp(.003,.062,this.pain);this.mouthGroup.rotation.z=lerp(-.10,.012,this.pain)+Math.sin(time*29)*fear*.04;
    if(this._attached(this.chin))this.chin.position.y=-.275-Math.sin(time*20)*fear*.003;
    for(const t of this.tears){const active=this.hits>=3&&this._attached(t.drop)&&this._attached(t.eye);t.streak.visible=t.drop.visible=active;if(active){const f=(time*.75+t.phase)%1;t.drop.position.set(t.side*(.26+f*.04),.061-f*.34,.49-f*.043);t.drop.scale.y=.027+f*.014;t.streak.material.opacity=.48+fear*.20;}}
    for(const a of this.arms){
      const s=a.side,p=this.pain,guard=this.head.localToWorld(V3(s*.48,-.28,.65));this.root.worldToLocal(guard);
      const idle=V3(s*1.27,1.20,.40),target=idle.lerp(guard,p*.96),alternation=Math.sin(time*3+s);
      target.x+=s*alternation*.04*p;target.y+=Math.sin(time*26+s)*fear*.015;target.z+=Math.sin(time*17+s)*this.impact*.05;
      this._armIK(a,target,V3(s*1.38,2.06,.52));
      for(let i=0;i<a.fingers.length;i++){const f=a.fingers[i];f.g.rotation.x=lerp(-.12,.08,p)+Math.sin(time*24+i)*fear*.045;f.tip.rotation.x=lerp(-.32,-.05,p)+Math.sin(time*31+i)*fear*.03;}
      a.thumb.rotation.z=s*lerp(.9,1.13,p);
    }
    for(const l of this.legs){if(this._attached(l.thigh)){l.thigh.rotation.z=l.side*(.06+Math.sin(time*18)*fear*.012);l.thigh.rotation.x=Math.sin(time*17+l.side)*fear*.016;}}
    if(this.neckCord.visible){this.head.updateWorldMatrix(true,false);const end=this.head.localToWorld(V3(0,-.40,.04));this.root.worldToLocal(end);const start=V3(0,2.21,.07),d=end.clone().sub(start);this.neckCord.position.copy(start.clone().add(end).multiplyScalar(.5));this.neckCord.scale.y=Math.max(.08,d.length()/.20);this.neckCord.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());}
    this.root.traverse(o=>{if(o.userData.gore&&o!==this.neckCord)o.visible=PREF.blood;});
    this.neckCord.visible=this.neckDamage>=2&&PREF.blood;
    this.root.updateMatrixWorld(true);
  }
  partWorld(name){
    const g=this.sections[name];if(!g||!this._attached(g))return null;
    if(name==='head')return this.head.localToWorld(V3(0,.10,.49));
    if(name==='belly')return this.body.localToWorld(V3(0,-.12,1));
    if(name==='chest')return this.root.localToWorld(V3(.20,2.15,.68));
    if(name==='neck')return this.neck.localToWorld(V3(0,.049,.74));
    return g.localToWorld(V3(0,name.startsWith('hand')?-.15:name.startsWith('foot')?-.02:-.18,.12));
  }
  destroy(){
    this.root.removeFromParent();const disposed=new Set();this.root.traverse(o=>{if(o.geometry&&!disposed.has(o.geometry)){o.geometry.dispose();disposed.add(o.geometry);}});
    this.geometries.forEach(g=>{if(!disposed.has(g)){g.dispose();disposed.add(g);}});this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.parts.length=0;
  }
}

const RIG=new WeaponRig(scene,camera);
const raycaster=new THREE.Raycaster();
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function pick(x,y,withChunks=true){
 if(!E)return null;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);raycaster.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);
 const items=E.parts.filter(o=>o.parent&&visible(o)&&!o.userData.detached);
 const hits=raycaster.intersectObjects(items,false);
 if(withChunks&&G.tool==='hand'){for(const c of FX.chunks){const hs=raycaster.intersectObject(c.obj,true);for(const h of hs)if(visible(h.object))hits.push({...h,chunk:c});}hits.sort((a,b)=>a.distance-b.distance);}
 if(!hits.length)return null;const h=hits[0],n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):V3(0,0,1);
 return {obj:h.object,part:h.object.userData.part||'belly',point:h.point.clone(),normal:n,local:h.object.worldToLocal(h.point.clone()),chunk:h.chunk||null};
}
function fit(){
 const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
 const top=$('.ftop').getBoundingClientRect().bottom+14,dock=G.mode==='submit'?$('#submitDock'):$('#dock'),bottom=dock.hidden?20:h-dock.getBoundingClientRect().top+8;
 const available=Math.max(150,h-top-bottom), span=Math.max(3.95*h/available,3.35/camera.aspect);
 const distance=span/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))+1.0;
 const center=1.78+(top-bottom)*span/(2*h);cameraBase.set(0,center,distance);camera.position.copy(cameraBase);camera.lookAt(0,center,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(fit,30);});
const hints={hand:'누르면 주먹 · 상처 난 팔다리를 꾹 잡고 당기면 뜯기',pipe:'누르거나 쓸어서 휘두르기',hammer:'누르면 찍기 · 쓸면 후려치기',knife:'누르면 찌르기 · 쓸면 베기',gun:'누르면 발사 · 꾹 누르면 연사'};
let hintUntil=0;
function hint(text,dur=3.5){$('#hint').textContent=text;$('#hint').classList.remove('off');hintUntil=G.time+dur;}
function updateGauge(){
 const f=clamp(G.hp/100,0,1);$('#gaugeFill').style.transform='scaleX('+f+')';$('#gaugeLag').style.transform='scaleX('+f+')';$('#gaugePct').textContent=Math.ceil(G.hp)+'%';
 $('#gaugePhase').textContent=G.zombie?'사주팔자가 지워졌습니다':'';
}
function updateAmmo(){const el=$('#ammo');el.textContent=G.reloading>0?'재장전':G.ammo;el.classList.toggle('reload',G.reloading>0);}
function reload(){if(G.reloading>0||G.ammo===8)return;G.reloading=1.15;updateAmmo();AUDIO.reload();if(RIG.reload)RIG.reload(1.15);}
function flash(amount=.3){const el=$('#flash');el.style.transition='none';el.style.opacity=amount;requestAnimationFrame(()=>{el.style.transition='opacity .1s';el.style.opacity=0;});}
function damage(info,tool,kind){
 if(!E||!info||info.chunk)return;
 if(!visible(info.obj)||!info.obj.parent||info.obj.userData.detached)return;
 // Preserve the original surface coordinate until actual weapon contact.
 info.point=info.obj.localToWorld(info.local.clone());
 const power=tool==='gun'?2:tool==='hammer'?1.5:1;
 const result=E.applyDamage(info,tool,kind,power)||{};
 G.stats.hits++;G.stats.tools[tool]=(G.stats.tools[tool]||0)+1;
 G.hp=result.fatal?0:Math.max(0,G.hp-(Number.isFinite(result.severity)?result.severity:{hand:3,pipe:9,hammer:14,knife:15,gun:18}[tool]));
 if(G.hp<=0){G.zombie=true;E.zombie=true;$('#afterFight').hidden=false;}
 AUDIO.onHit(tool,info.part,power);if(PREF.vibe&&navigator.vibrate)navigator.vibrate(tool==='gun'?14:9);
 if(PREF.shake)G.shake=Math.max(G.shake,tool==='hand'?.017:.04);updateGauge();
}
function attackInfo(info,kind='tap',fallback=null){
 if(!E||G.mode!=='fight'||G.paused)return;
 AUDIO.unlock();const tool=G.tool;
 if(tool==='gun'){
  if(G.reloading>0)return;if(G.ammo<=0){AUDIO.dry();reload();return;}G.ammo--;updateAmmo();AUDIO.fire();flash(.12);
  const target=info?info.point:planePoint(G.ptr?G.ptr.x:innerWidth*.5,G.ptr?G.ptr.y:innerHeight*.5,0);
  RIG.attack(tool,target,kind,1,()=>{if(info)damage(info,tool,'shot');});if(G.ammo<=0)reload();return;
 }
 if(info&&info.chunk)return;
 const target=info?info.point:(fallback||planePoint(G.ptr?G.ptr.x:innerWidth*.5,G.ptr?G.ptr.y:innerHeight*.48,.5)),round=G.round;
 RIG.attack(tool,target,kind,G.nextHand=-G.nextHand,()=>{if(round===G.round&&info)damage(info,tool,kind);});
}
function hitAt(x,y,kind='tap'){const info=pick(x,y,false);attackInfo(info,kind,planePoint(x,y,.5));return info&&info.part;}
function setTool(tool){cancelPointer();RIG.cancel();G.tool=tool;$$('.tool').forEach(b=>b.classList.toggle('on',b.dataset.tool===tool));RIG.setTool(tool);if(G.mode==='fight')hint(hints[tool]);}
function cancelPointer(){if(G.ptr&&G.ptr.chunk){G.ptr.chunk.held=false;G.ptr.chunk.v.set(0,0,0);}G.ptr=null;}
canvas.addEventListener('pointerdown',e=>{
 if(!E||G.ptr||G.paused||(e.pointerType==='mouse'&&e.button!==0))return;AUDIO.unlock();try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 const info=pick(e.clientX,e.clientY);const p=G.ptr={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,info,t0:G.time,lastCut:G.time,swiping:false,auto:G.time+.21,chunk:info&&info.chunk};
 if(p.chunk){p.chunk.held=true;p.depth=p.chunk.obj.position.z;p.offset=p.chunk.obj.position.clone().sub(planePoint(p.x,p.y,p.depth));return;}
 if(G.mode==='submit'){G.ptr=null;return;}
 if(G.tool==='gun')attackInfo(info,'shot');
});
canvas.addEventListener('pointermove',e=>{
 const p=G.ptr;if(!p||p.id!==e.pointerId)return;const dx=e.clientX-p.x0,dy=e.clientY-p.y0;p.x=e.clientX;p.y=e.clientY;
 if(p.chunk){p.chunk.obj.position.copy(planePoint(p.x,p.y,p.depth).add(p.offset));return;}
 if(G.mode!=='fight'||G.tool==='gun')return;
 const distance=Math.hypot(dx,dy);
 if(G.tool==='hand'&&G.time-p.t0>.25&&distance>80&&p.info&&/arm|forearm|hand|thigh|leg|foot|neck|belly|chest/.test(p.info.part)){
  if(E.tearPart&&E.tearPart(p.info.part,p.info.point,V3(dx*.016,-dy*.016,1.3))){AUDIO.rip();G.stats.hits++;G.hp=E.zombie?0:Math.max(0,G.hp-9);if(G.hp<=0){G.zombie=E.zombie=true;$('#afterFight').hidden=false;}updateGauge();p.swiping=true;p.info=null;return;}
 }
 if(distance>24&&(!p.swiping||G.time-p.lastCut>.15)){
  const info=p.swiping?pick(p.x,p.y,false):p.info;attackInfo(info,G.tool==='knife'?'slash':dy<-Math.abs(dx)?'upper':'swing');p.swiping=true;p.lastCut=G.time;
 }
});
function pointerUp(e){const p=G.ptr;if(!p||p.id!==e.pointerId)return;if(p.chunk){p.chunk.held=false;p.chunk.v.set((p.x-p.x0)*.012,(p.y0-p.y)*.012+1,1);}else if(e.type==='pointerup'&&G.mode==='fight'&&G.tool!=='gun'&&!p.swiping)attackInfo(p.info,G.tool==='knife'?'stab':'tap');G.ptr=null;}
canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',()=>cancelPointer());canvas.addEventListener('lostpointercapture',()=>cancelPointer());canvas.addEventListener('contextmenu',e=>e.preventDefault());
$$('.tool').forEach(b=>b.addEventListener('click',()=>{AUDIO.unlock();setTool(b.dataset.tool);}));
function savePrefs(){try{localStorage.setItem('palja.prefs',JSON.stringify(PREF));}catch(_){}}
function syncPrefs(){for(const k of Object.keys(PREF)){const el=$('#sw'+k[0].toUpperCase()+k.slice(1));if(el)el.setAttribute('aria-checked',String(PREF[k]));}$('#soundBtn').setAttribute('aria-pressed',String(!PREF.sound));AUDIO.setOn(PREF.sound);}
function toggle(k){PREF[k]=!PREF[k];savePrefs();syncPrefs();}
for(const k of Object.keys(PREF)){const el=$('#sw'+k[0].toUpperCase()+k.slice(1));if(el)el.addEventListener('click',()=>{AUDIO.unlock();toggle(k);});}
$('#soundBtn').addEventListener('click',()=>{AUDIO.unlock();toggle('sound');});
$('#settingsBtn').addEventListener('click',()=>{cancelPointer();RIG.cancel();G.paused=true;$('#settingsModal').hidden=false;});
function closeModal(){$('#settingsModal').hidden=true;G.paused=false;last=performance.now();}
$$('[data-close]').forEach(b=>b.addEventListener('click',closeModal));$('#settingsModal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
$('#resetFight').addEventListener('click',()=>{closeModal();startRound('fight');});$('#roundAgain').addEventListener('click',()=>startRound('fight'));$('#roundHome').addEventListener('click',()=>leave(false));$('#fightBack').addEventListener('click',()=>leave(false));$('#submitFight').addEventListener('click',()=>startRound('fight'));
let last=performance.now(),perfTime=0,perfFrames=0,lite=false;
function step(dt){
 G.time+=dt;if(G.paused)return;
 if(G.reloading>0){G.reloading=Math.max(0,G.reloading-dt);if(G.reloading===0){G.ammo=8;updateAmmo();}}
 if(G.ptr&&G.tool==='gun'&&G.time>=G.ptr.auto&&G.mode==='fight'){G.ptr.auto=G.time+.21;attackInfo(pick(G.ptr.x,G.ptr.y,false),'shot');}
 RIG.update(dt,G.time);if(E)E.update(dt,G.time);FX.update(dt);
 G.shake=Math.max(0,G.shake-dt*.24);camera.position.copy(cameraBase).add(V3(rnd(-G.shake,G.shake),rnd(-G.shake,G.shake),0));camera.lookAt(cameraBase.x,cameraBase.y,0);
 if(G.time>hintUntil)$('#hint').classList.add('off');
}
function frame(now){if(!G.running)return;G.raf=requestAnimationFrame(frame);const raw=(now-last)/1000;last=now;const dt=clamp(raw,0,.035);perfTime+=raw;perfFrames++;if(perfTime>2){if(perfTime/perfFrames>.055&&!lite){lite=true;renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;}perfTime=0;perfFrames=0;}step(dt);renderer.render(scene,camera);}
function pause(){G.running=false;cancelAnimationFrame(G.raf);cancelPointer();RIG.cancel();AUDIO.stop();}
function startRound(mode){
 cancelPointer();RIG.reset?RIG.reset():RIG.cancel();AUDIO.stop();G.round++;FX.clear();if(E){E.destroy?E.destroy():disposeTree(E.root);scene.remove(E.root);}E=new RichEmperor();
 G.mode=mode;G.hp=100;G.zombie=false;G.paused=false;G.ammo=8;G.reloading=0;G.shake=0;G.stats={hits:0,tools:{},start:G.time};$('#settingsModal').hidden=true;$('#ending').hidden=true;$('#afterFight').hidden=true;
 $('#dock').hidden=mode!=='fight';$('#submitDock').hidden=mode!=='submit';RIG.setTool('hand');G.tool='hand';$$('.tool').forEach(b=>b.classList.toggle('on',b.dataset.tool==='hand'));updateGauge();updateAmmo();syncPrefs();fit();
 if(mode==='fight')hint(hints.hand,5);else{RIG.setTool('none');AUDIO.unlock();AUDIO.laugh();}last=performance.now();
}
function enter(result,mode='fight'){G.result=result;$('#fight').hidden=false;$('#fallback').hidden=true;try{speechSynthesis.cancel();}catch(_){}AUDIO.unlock();startRound(mode);const face=$('#arcadeFace');if(face){face.target='_blank';face.rel='noopener';}if(!G.running){G.running=true;last=performance.now();G.raf=requestAnimationFrame(frame);}}
function leave(home){pause();G.round++;$('#settingsModal').hidden=true;$('#fight').hidden=true;const face=$('#arcadeFace');if(face){face.target='_top';face.removeAttribute('rel');}if(home)window.__paljaRestart();else window.__paljaLeave();}
addEventListener('blur',()=>{cancelPointer();RIG.cancel();AUDIO.stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelPointer();RIG.cancel();AUDIO.stop();}else{last=performance.now();if(G.running)fit();}});
window.PaljaGame={enter,leave,pause,tick(dt=1/60,draw=true){step(dt);if(draw)renderer.render(scene,camera);},hitAt,pick,project,screenPart(name){const p=E&&E.partWorld(name);return p?project(p):null;},setTool,get state(){return {E,G,FX,camera,renderer,scene};}};

})();

}
})();
