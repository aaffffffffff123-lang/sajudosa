/* 사주도사 · 족치기 화면 (fight.js)
 * index.html이 three.min.js(r128) 다음에 불러 쓴다. 이 파일 하나에 족치기 화면의 모양(CSS)·틀(HTML)·게임 코드가 다 들어 있다.
 * 쓰는 법: window.PaljaBoot() → window.PaljaGame.enter(사주 결과, 'fight' 또는 'submit')
 * 'submit'은 운명에 순응하기(옥황상제가 비웃는 화면), 'fight'는 운명 설계자 족치기.
 * 화면을 닫을 때는 index.html의 window.__paljaLeave()를 부른다.
 *
 * 차례
 *  1. 화면 틀(CSS·HTML·아이콘)
 *  2. 공용 도구(수학·스프링·움직이는 메시)
 *  3. 소리(타격음·총소리·목소리)
 *  4. 무대(하늘 궁전·옥좌·바닥)와 카메라 구도
 *  5. 피(튀는 피·몸을 타고 흐르는 피·고이는 피·화면에 묻는 피)와 멍·상처 자국
 *  6. 옥황상제(모양·얼굴 표정·자세·맞는 반응·다운)
 *  7. 내 손과 무기(맨손·쇠파이프·망치·칼·총)
 *  8. 진행(버팀 게이지·다운 세 번·마지막)과 입력
 */
(function(){
'use strict';

/* ===== 1. 화면 틀 ===== */
const FIGHT_CSS = `
:root{--safe-t:env(safe-area-inset-top,0px);--safe-b:env(safe-area-inset-bottom,0px)}
#fight{--ink:#241c3a;--muted:#77708a;--line:#ece5da;--plum:#4b35a8;--red:#d8352a;--gold:#c28a1a;
 --sans:"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;--serif:"Gowun Batang","Noto Serif KR",serif;
 position:fixed;inset:0;z-index:10;overflow:hidden;background:#cfe7f7;color:var(--ink);font-family:var(--sans);
 user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
#fight[hidden]{display:none!important}
#fight [hidden]{display:none!important}
#fight button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#fight #world{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none}
#fight #sblood{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
#fight #flash{position:absolute;inset:0;pointer-events:none;background:#fff;opacity:0;z-index:3}
#fight .ftop{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;align-items:stretch;gap:7px;padding:calc(8px + var(--safe-t)) 58px 0 10px;pointer-events:none}
#fight .ftop>*{pointer-events:auto}
#fight .pill{width:42px;min-width:42px;border:0;border-radius:13px;background:rgba(255,255,255,.95);box-shadow:0 2px 10px rgba(40,30,70,.2);display:flex;align-items:center;justify-content:center;padding:0;color:var(--ink)}
#fight .pill:active{transform:translateY(1px)}
#fight .pill svg{width:21px;height:21px}
#fight .pill[aria-pressed=true] .wave{display:none}
#fight .pill[aria-pressed=true] .mute{display:block}
#fight .pill .mute{display:none}
#fight .gauge{flex:1 1 auto;max-width:540px;margin:0 auto;min-width:0;pointer-events:none;background:rgba(255,255,255,.95);border-radius:13px;box-shadow:0 2px 10px rgba(40,30,70,.2);padding:7px 10px 8px;display:flex;flex-direction:column;gap:6px}
#fight .gauge .grow{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:800;line-height:1;white-space:nowrap}
#fight .gauge .kd{display:flex;gap:3px}
#fight .gauge .kd i{display:block;width:9px;height:9px;border-radius:50%;border:1.7px solid #4a3a35;background:#fff;box-sizing:border-box;transition:background .2s,transform .2s}
#fight .gauge .kd i.on{background:#d8352a;border-color:#7e1810;transform:scale(1.12)}
#fight .gauge small{margin-left:auto;font-size:12px;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums}
#fight .gauge .bar{position:relative;height:10px;border-radius:6px;background:#efe8ee;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.14)}
#fight .gauge .bar b,#fight .gauge .bar i{position:absolute;inset:0;transform-origin:left center}
#fight .gauge .bar b{background:#ffcf6b;transition:transform .9s cubic-bezier(.3,.7,.2,1)}
#fight .gauge .bar i{background:linear-gradient(90deg,#a81d16,#e8492e 70%,#f26a3c)}
#fight .gauge .bar s{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:rgba(36,20,30,.5);text-decoration:none}
#fight .dock{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,560px);z-index:6;display:flex;flex-direction:column;gap:7px;padding:0 10px calc(10px + var(--safe-b));pointer-events:none}
#fight .dock>*{pointer-events:auto}
#fight .hint{align-self:center;pointer-events:none!important;background:rgba(36,28,58,.86);color:#fff;font-size:12px;font-weight:600;line-height:1.35;border-radius:99px;padding:6px 13px;text-align:center;max-width:100%;transition:opacity .35s}
#fight .hint.off{opacity:0}
#fight .panel{background:rgba(255,253,246,.96);border:1px solid rgba(120,86,30,.14);border-radius:18px;box-shadow:0 3px 14px rgba(40,30,60,.24);padding:6px}
#fight .tools{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
#fight .tool{position:relative;min-width:0;border:0;border-radius:13px;background:transparent;padding:5px 0 5px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11.5px;font-weight:800;letter-spacing:-.3px;color:var(--ink)}
#fight .tool svg{width:40px;height:40px}
#fight .tool.on{background:#fde7b0;box-shadow:inset 0 0 0 2px #c48a1c}
#fight .tool .ammo{position:absolute;top:1px;right:calc(50% - 30px);min-width:19px;height:19px;border-radius:10px;background:var(--red);color:#fff;font-size:11px;line-height:19px;padding:0 5px;font-weight:800;box-shadow:0 1px 3px rgba(0,0,0,.25)}
#fight .tool .ammo.reload{background:#6b6577;font-size:10px}
#fight .btn{display:block;width:100%;min-height:52px;padding:12px 16px;border:2.5px solid var(--ink);border-radius:15px;background:#fff;color:var(--ink);font-size:16.5px;font-weight:800;line-height:1.3;text-align:center;box-shadow:0 4px 0 var(--ink)}
#fight .btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
#fight .btn.danger{background:var(--red);color:#fff}
#fight .btn.soft{border-color:#d9d2c6;box-shadow:0 3px 0 #d9d2c6;font-size:15px;min-height:46px}
#fight #submitDock .btn{box-shadow:0 4px 0 var(--ink),0 6px 18px rgba(0,0,0,.22)}
#fight .modal{position:absolute;inset:0;z-index:20;background:rgba(36,28,58,.48);display:flex;align-items:center;justify-content:center;padding:16px}
#fight .msheet{width:min(100%,400px);max-height:calc(100% - 24px);overflow:auto;background:#fff;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,.28);padding:18px 18px 16px}
#fight .msheet h2{margin:0 0 6px;font-size:19px;font-weight:800}
#fight .msheet .close{float:right;margin:-6px -6px 0 0;width:40px;height:40px;box-shadow:none;background:#f3efe8}
#fight .row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line);font-weight:700;font-size:14.5px}
#fight .row small{display:block;font-weight:400;color:var(--muted);font-size:11.5px;margin-top:2px}
#fight .switch{position:relative;flex:none;width:52px;height:31px;border:0;border-radius:16px;background:#d9d1c2;padding:0}
#fight .switch::after{content:"";position:absolute;top:3px;left:3px;width:25px;height:25px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.22);transition:left .15s}
#fight .switch[aria-checked=true]{background:var(--plum)}
#fight .switch[aria-checked=true]::after{left:24px}
#fight #ending{position:absolute;inset:0;z-index:15;display:flex;align-items:flex-end;justify-content:center;padding:18px 14px calc(96px + var(--safe-b));background:linear-gradient(rgba(36,28,58,0) 30%,rgba(36,28,58,.4))}
#fight #ending .card{width:min(100%,380px);background:#fff;border-radius:22px;box-shadow:0 14px 44px rgba(0,0,0,.3);padding:20px 18px 16px;text-align:center;animation:fcardin .5s cubic-bezier(.2,1.35,.4,1) both}
@keyframes fcardin{from{transform:translateY(40px) scale(.92);opacity:0}to{transform:none;opacity:1}}
#fight #ending h2{margin:0 0 8px;font-family:var(--serif);font-size:24px;line-height:1.35}
#fight #ending p{margin:0;font-size:14.5px;line-height:1.7;color:#4a4455;word-break:keep-all}
#fight #ending .stats{display:flex;justify-content:center;gap:20px;margin:16px 0 8px;font-size:12px;color:var(--muted)}
#fight #ending .stats b{display:block;font-size:21px;color:var(--ink);font-weight:800;font-variant-numeric:tabular-nums}
#fight #ending .btns{display:flex;flex-direction:column;gap:9px;margin-top:14px}
#fight #ending .btns .pair{display:flex;gap:9px}
#fight #ending .btns .pair .btn{flex:1}
#fight #fallback{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:30px;text-align:center;font-weight:800;background:#cfe7f7}
#fight #fallback small{font-weight:400;color:var(--muted)}
@media (min-width:760px){#fight .tool svg{width:46px;height:46px}#fight .tool{font-size:12.5px}#fight .gauge .grow{font-size:13.5px}}
@media (max-width:370px){#fight .tool svg{width:35px;height:35px}#fight .tool{font-size:10.5px}#fight .ftop{gap:5px}#fight .pill{width:38px;min-width:38px}}
@media (prefers-reduced-motion:reduce){#fight #ending .card{animation-duration:.01s}}
`;

const FIGHT_HTML = `<section id="fight" hidden>
 <canvas id="world" tabindex="-1" aria-label="옥황상제가 서 있는 화면. 누르면 때리고, 밀면 휘두르거나 벱니다."></canvas>
 <canvas id="sblood"></canvas>
 <div id="flash"></div>
 <header class="ftop">
  <button class="pill" id="fightBack" type="button" aria-label="사주 풀이로 돌아가기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
  <div class="gauge" aria-hidden="true">
   <div class="grow"><span class="gname">옥황상제</span><span class="kd" id="kdPips"><i></i><i></i><i></i></span><small id="gaugePct">100%</small></div>
   <div class="bar"><b id="gaugeLag"></b><i id="gaugeFill"></i><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>
  </div>
  <button class="pill" id="soundBtn" type="button" aria-label="소리 끄고 켜기" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16 8.5c2.2 2 2.2 5 0 7M18.8 5.5c4.2 3.6 4.2 9.4 0 13"/><path class="mute" d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg></button>
  <button class="pill" id="settingsBtn" type="button" aria-label="설정"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.6" fill="#fff"/><circle cx="15" cy="17" r="2.6" fill="#fff"/></svg></button>
 </header>



 <div class="dock" id="dock">
  <div class="hint off" id="hint"></div>
  <div class="panel tools" id="tools">
   <button class="tool on" type="button" data-tool="hand"><svg viewBox="0 0 48 48"><use href="#fi-fist"/></svg>너클</button>
   <button class="tool" type="button" data-tool="knife"><svg viewBox="0 0 48 48"><use href="#fi-knife"/></svg>칼</button>
   <button class="tool" type="button" data-tool="gun"><svg viewBox="0 0 48 48"><use href="#fi-gun"/></svg>총<span class="ammo" id="ammo" hidden>8</span></button>
  </div>
 </div>


 <div class="dock" id="submitDock" hidden><button type="button" class="btn danger" id="submitFight">운명 설계자 족치기</button></div>
 <div class="modal" id="settingsModal" hidden>
  <div class="msheet" role="dialog" aria-modal="true" aria-labelledby="fSetTitle">
   <button class="pill close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
   <h2 id="fSetTitle">설정</h2>
   <div class="row">소리<button class="switch" id="swSound" type="button" role="switch" aria-checked="true" aria-label="소리"></button></div>
   <div class="row">진동<button class="switch" id="swVibe" type="button" role="switch" aria-checked="true" aria-label="진동"></button></div>
   <div class="row">화면 흔들림<button class="switch" id="swShake" type="button" role="switch" aria-checked="true" aria-label="화면 흔들림"></button></div>
   <div class="row"><div>피<small>끄면 피 대신 먼지가 납니다.</small></div><button class="switch" id="swBlood" type="button" role="switch" aria-checked="true" aria-label="피"></button></div>
   <button class="btn soft" id="resetFight" type="button" style="margin-top:16px">처음부터 다시</button>
  </div>
 </div>
 <div id="ending" hidden>
  <div class="card" role="dialog" aria-modal="true" aria-labelledby="endTitle">
   <h2 id="endTitle">옥황상제가 쓰러졌습니다</h2>
   <p>이제 사주팔자는 아무것도 정하지 못합니다.</p>
   <div class="stats"><div><b id="stTime">0:00</b>걸린 시간</div><div><b id="stHits">0</b>때린 횟수</div><div><b id="stBlood">0.0L</b>흘린 피</div></div>
   <div class="btns"><button type="button" class="btn danger" id="endAgain">처음부터 다시</button><div class="pair"><button type="button" class="btn soft" id="endHome">사주 풀이로</button><button type="button" class="btn soft" id="endMore">계속 패기</button></div></div>
  </div>
 </div>
 <div id="fallback" hidden><div id="fallbackTitle">불러오는 중…</div><small id="fallbackDetail">잠깐만요.</small><button class="btn soft" id="retryGame" type="button" hidden style="width:auto;margin-top:10px">다시 시도</button></div>
</section>`;

const FIGHT_ICONS = `
<symbol id="fi-fist" viewBox="0 0 48 48">
 <path d="M13 35c-4-3-5-8-4-13l2-7c1-2 4-2 5 0 1-3 4-3 6-1 1-2 5-2 6 0 2-1 5 0 5 3v3c3 0 5 2 5 5 0 7-4 12-9 13l-1 4H15z" fill="#ffc9a3" stroke="#27242b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M16 15v7M22 14v8M28 14v8M34 18c-4 0-9 1-10 5 4 1 7 3 7 6" fill="none" stroke="#27242b" stroke-width="2.3" stroke-linecap="round"/>
 <path d="M13 27h23" fill="none" stroke="#27242b" stroke-width="7" stroke-linecap="round"/>
 <path d="M13 27h23" fill="none" stroke="#bd8b2d" stroke-width="4" stroke-linecap="round"/>
 <g fill="none" stroke="#27242b" stroke-width="6">
  <circle cx="15" cy="20" r="4.7"/><circle cx="22" cy="19" r="4.7"/><circle cx="29" cy="19" r="4.7"/><circle cx="36" cy="21" r="4.7"/>
 </g>
 <g fill="none" stroke="#d7aa49" stroke-width="3.2">
  <circle cx="15" cy="20" r="4.7"/><circle cx="22" cy="19" r="4.7"/><circle cx="29" cy="19" r="4.7"/><circle cx="36" cy="21" r="4.7"/>
 </g>
 <path d="M14 41h16v5H14z" fill="#2b3a67" stroke="#27242b" stroke-width="2.6" stroke-linejoin="round"/>
</symbol>
<symbol id="fi-pipe" viewBox="0 0 48 48"><path d="M9 39L38 10" stroke="#27242b" stroke-width="11" stroke-linecap="round"/><path d="M9 39L38 10" stroke="#9aa1aa" stroke-width="6.6" stroke-linecap="round"/><path d="M13 33L35 11" stroke="#d6dbe0" stroke-width="1.8" stroke-linecap="round"/><path d="M26 22l3 3M20 27l2 2" stroke="#9a5a2c" stroke-width="2.4" stroke-linecap="round"/><path d="M8.5 39.5l6-6" stroke="#27242b" stroke-width="12" stroke-linecap="round"/><path d="M8.5 39.5l6-6" stroke="#2f2f36" stroke-width="7.6" stroke-linecap="round"/><path d="M10.5 37.5l2-2" stroke="#d8352a" stroke-width="7.6"/><ellipse cx="38.5" cy="9.5" rx="4.2" ry="3" transform="rotate(-45 38.5 9.5)" fill="#3a3d44" stroke="#27242b" stroke-width="2"/></symbol>
<symbol id="fi-hammer" viewBox="0 0 48 48"><path d="M11 42L27 24" stroke="#27242b" stroke-width="9" stroke-linecap="round"/><path d="M11 42L27 24" stroke="#c88a4a" stroke-width="5.2" stroke-linecap="round"/><path d="M13 39l3-3" stroke="#8a5528" stroke-width="5.2"/><path d="M19 13l9-6 14 13-6 9z" fill="#c4cad2" stroke="#27242b" stroke-width="2.6" stroke-linejoin="round"/><path d="M28 8l12 11" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M19 13c-6-3-11 0-11 6 3-2 7-2 9 0z" fill="#8e959e" stroke="#27242b" stroke-width="2.4" stroke-linejoin="round"/></symbol>
<symbol id="fi-knife" viewBox="0 0 48 48"><path d="M5 43l9-9" stroke="#27242b" stroke-width="8" stroke-linecap="round"/><path d="M5 43l9-9" stroke="#2f2a28" stroke-width="4.8" stroke-linecap="round"/><circle cx="8.6" cy="39.4" r="1.2" fill="#d9c08a"/><circle cx="11.4" cy="36.6" r="1.2" fill="#d9c08a"/><path d="M13 31L33 7c6-2 11 3 9 9L18 36z" fill="#e6edf2" stroke="#27242b" stroke-width="2.6" stroke-linejoin="round"/><path d="M18 31L36 10" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M13 31l5 5" stroke="#27242b" stroke-width="2.8" stroke-linecap="round"/></symbol>
<symbol id="fi-gun" viewBox="0 0 48 48"><path d="M10 22h13l-1 3h-2l-2 4-1 11H8l2-12z" fill="#33343c" stroke="#27242b" stroke-width="2.6" stroke-linejoin="round"/><path d="M9.5 34h7" stroke="#55565f" stroke-width="1.6"/><path d="M5 12h37v10H5z" fill="#4a4c55" stroke="#27242b" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 15h31" stroke="#7b7e88" stroke-width="1.7"/><path d="M28 12v10M31 12v10M34 12v10" stroke="#2b2c33" stroke-width="1.3"/><path d="M19 22v3c0 3 2 5 5 5h2" fill="none" stroke="#27242b" stroke-width="2.4" stroke-linecap="round"/><path d="M42 15h3" stroke="#27242b" stroke-width="2.6" stroke-linecap="round"/><path d="M45 10l-2 2M45 20l-2-2" stroke="#f4b942" stroke-width="2.2" stroke-linecap="round"/></symbol>
`;

let booted=false;
window.PaljaBoot=function(){
 if(booted)return;booted=true;
 const st=document.createElement('style');st.id='fight-style';st.textContent=FIGHT_CSS;document.head.appendChild(st);
 const box=document.createElement('div');box.innerHTML=FIGHT_HTML.trim();document.body.appendChild(box.firstElementChild);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';
 svg.innerHTML='<defs>'+FIGHT_ICONS+'</defs>';document.body.appendChild(svg);
 try{runGame();}
 catch(err){
  const fb=document.getElementById('fallback');if(fb){fb.hidden=false;document.getElementById('fallbackTitle').textContent='족치기 화면을 열지 못했습니다.';document.getElementById('fallbackDetail').textContent=String(err&&err.message||err).slice(0,160);}
  window.PaljaGame={enter(){const f=document.getElementById('fight');if(f)f.hidden=false;},leave(){const f=document.getElementById('fight');if(f)f.hidden=true;if(window.__paljaLeave)window.__paljaLeave();},pause(){}};
  const back=document.getElementById('retryGame');if(back){back.hidden=false;back.textContent='돌아가기';back.onclick=()=>window.PaljaGame.leave();}
 }
};

function runGame(){
/* ===== 2. 공용 도구 ===== */
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){if(this.parent)this.parent.remove(this);return this;};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const TAU=Math.PI*2, PI=Math.PI;
const clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t, rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const sat=x=>clamp(x,0,1), smooth=t=>{t=sat(t);return t*t*(3-2*t);}, smoother=t=>{t=sat(t);return t*t*t*(t*(t*6-15)+10);};
const easeOut=t=>{t=sat(t);return 1-(1-t)*(1-t);}, easeIn=t=>{t=sat(t);return t*t;}, easeOut3=t=>{t=sat(t);return 1-Math.pow(1-t,3);}, easeIn3=t=>{t=sat(t);return t*t*t;};
const backOut=(t,s=1.7)=>{t=sat(t)-1;return t*t*((s+1)*t+s)+1;};
const damp=(a,b,l,dt)=>lerp(a,b,1-Math.exp(-l*dt));
const wrapPi=a=>{while(a>PI)a-=TAU;while(a<-PI)a+=TAU;return a;};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const UP=V3(0,1,0);
function col(hex){return new THREE.Color(hex).convertSRGBToLinear();}
function finite(x,d=0){return Number.isFinite(x)?x:d;}

/* 스프링: 맞을 때 튕겼다 돌아오는 움직임은 전부 이것으로 만든다 */
class Spring{
 constructor(k=140,c=13,x=0){this.k=k;this.c=c;this.x=x;this.v=0;this.t=0;}
 step(dt){const n=dt>.017?Math.ceil(dt/.0166):1,h=dt/n;for(let i=0;i<n;i++){this.v+=(-this.k*(this.x-this.t)-this.c*this.v)*h;this.x+=this.v*h;}if(!Number.isFinite(this.x)){this.x=this.t;this.v=0;}return this.x;}
 kick(i){this.v+=i;return this;}
 reset(x=0){this.x=x;this.t=x;this.v=0;return this;}
}
class Spring3{
 constructor(k,c){this.x=new Spring(k,c);this.y=new Spring(k,c);this.z=new Spring(k,c);}
 step(dt){this.x.step(dt);this.y.step(dt);this.z.step(dt);return this;}
 kick(x,y,z){this.x.kick(x);this.y.kick(y);this.z.kick(z);return this;}
 reset(){this.x.reset();this.y.reset();this.z.reset();return this;}
 get X(){return this.x.x;} get Y(){return this.y.x;} get Z(){return this.z.x;}
}

/* 캔버스로 그린 텍스처 */
function canvasTex(w,h,draw,o={}){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h,c);
 const t=new THREE.CanvasTexture(c);if(o.srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
 if(o.repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(o.repeat[0],o.repeat[1]);}
 if(!t.userData)t.userData={};t.userData.canvas=c;t.userData.ctx=g;return t;
}

/* 메시 만들기 도우미 */
function mk(geo,mat,parent,o={}){
 const m=new THREE.Mesh(geo,mat);
 if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);
 if(o.r)m.rotation.set(o.r[0],o.r[1],o.r[2],o.order||'XYZ');
 if(o.s!=null){if(typeof o.s==='number')m.scale.setScalar(o.s);else m.scale.set(o.s[0],o.s[1],o.s[2]);}
 m.castShadow=o.cast!==false;m.receiveShadow=o.receive!==false;
 if(o.part)m.userData.part=o.part;if(o.flow)m.userData.flow=true;if(o.name)m.name=o.name;
 if(parent)parent.add(m);return m;
}
function grp(parent,p,name){const g=new THREE.Group();if(p)g.position.set(p[0],p[1],p[2]);if(name)g.name=name;if(parent)parent.add(g);return g;}
const GEO={};
function sphereGeo(seg=24){const k='s'+seg;return GEO[k]||(GEO[k]=new THREE.SphereGeometry(1,seg,Math.max(8,Math.round(seg*.7))));}
function cylGeo(rt,rb,h,seg=20,open=false){return new THREE.CylinderGeometry(rt,rb,h,seg,1,open);}
function tubeGeo(points,r,seg=24,rs=8){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V3(p[0],p[1],p[2]))),seg,r,rs,false);}
/* 굵기가 변하는 관(정적) */
function taperTube(points,r0,r1,seg=24,rs=10){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>V3(p[0],p[1],p[2])));
 const g=new THREE.TubeGeometry(curve,seg,1,rs,false),pos=g.attributes.position,nor=g.attributes.normal;
 const frames=curve.computeFrenetFrames(seg,false);
 for(let i=0;i<=seg;i++){const c=curve.getPointAt(i/seg),r=lerp(r0,r1,i/seg);for(let j=0;j<=rs;j++){const k=i*(rs+1)+j;const nx=nor.getX(k),ny=nor.getY(k),nz=nor.getZ(k);pos.setXYZ(k,c.x+nx*r,c.y+ny*r,c.z+nz*r);}}
 pos.needsUpdate=true;g.computeBoundingSphere();return g;
}
/* 끝이 둥근 원기둥(r128에는 CapsuleGeometry가 없다) */
function capsuleGeo(r,len,seg=16){
 const pts=[],n=8;
 for(let i=0;i<=n;i++){const a=-PI/2+i/n*PI/2;pts.push(new THREE.Vector2(Math.cos(a)*r,-len/2+Math.sin(a)*r));}
 for(let i=0;i<=n;i++){const a=i/n*PI/2;pts.push(new THREE.Vector2(Math.cos(a)*r,len/2+Math.sin(a)*r));}
 pts[0].x=0.0001;pts[pts.length-1].x=0.0001;
 return new THREE.LatheGeometry(pts,seg);
}
function latheGeo(prof,seg=28){return new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(Math.max(.0001,p[0]),p[1])),seg);}
/* 부분 구(눈꺼풀 등) */
function capGeo(r,thetaStart,thetaLen,seg=24){return new THREE.SphereGeometry(r,seg,Math.max(6,Math.round(seg/2)),0,TAU,thetaStart,thetaLen);}

/* 움직이는 관: 입술·눈썹처럼 매 프레임 모양이 바뀌는 곳 */
class DynTube{
 constructor(n,m,material,o={}){
  this.n=n;this.m=m;const vc=n*m+2;
  this.P=new Float32Array(vc*3);this.N=new Float32Array(vc*3);
  const idx=[];
  for(let i=0;i<n-1;i++)for(let j=0;j<m;j++){const a=i*m+j,b=i*m+(j+1)%m,c=(i+1)*m+j,d=(i+1)*m+(j+1)%m;idx.push(a,b,c,b,d,c);}
  const s=n*m,e=n*m+1;for(let j=0;j<m;j++){idx.push(s,(j+1)%m,j);idx.push(e,(n-1)*m+j,(n-1)*m+(j+1)%m);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(this.P,3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal',new THREE.BufferAttribute(this.N,3).setUsage(THREE.DynamicDrawUsage));
  g.setIndex(idx);this.geo=g;
  this.mesh=new THREE.Mesh(g,material);this.mesh.castShadow=o.cast!==false;this.mesh.receiveShadow=true;this.mesh.frustumCulled=false;
  this._t=V3();this._n=V3();this._b=V3();this._pn=V3();
 }
 update(pts,radius){
  const n=this.n,m=this.m,P=this.P,N=this.N,t=this._t,nv=this._n,bn=this._b,pn=this._pn;
  for(let i=0;i<n;i++){
   const p=pts[i],a=pts[i>0?i-1:0],b=pts[i<n-1?i+1:n-1];
   t.subVectors(b,a);if(t.lengthSq()<1e-12)t.set(1,0,0);t.normalize();
   if(i===0){nv.set(0,0,1);if(Math.abs(t.z)>.92)nv.set(0,1,0);}else nv.copy(pn);
   nv.addScaledVector(t,-nv.dot(t));if(nv.lengthSq()<1e-10)nv.set(0,1,0);nv.normalize();pn.copy(nv);
   bn.crossVectors(t,nv);
   const r=typeof radius==='number'?radius:radius[i];
   for(let j=0;j<m;j++){const ang=j/m*TAU,cs=Math.cos(ang),sn=Math.sin(ang);
    const x=nv.x*cs+bn.x*sn,y=nv.y*cs+bn.y*sn,z=nv.z*cs+bn.z*sn,k=(i*m+j)*3;
    P[k]=p.x+x*r;P[k+1]=p.y+y*r;P[k+2]=p.z+z*r;N[k]=x;N[k+1]=y;N[k+2]=z;}
   if(i===0){const k=n*m*3;P[k]=p.x;P[k+1]=p.y;P[k+2]=p.z;N[k]=-t.x;N[k+1]=-t.y;N[k+2]=-t.z;}
   if(i===n-1){const k=(n*m+1)*3;P[k]=p.x;P[k+1]=p.y;P[k+2]=p.z;N[k]=t.x;N[k+1]=t.y;N[k+2]=t.z;}
  }
  this.geo.attributes.position.needsUpdate=true;this.geo.attributes.normal.needsUpdate=true;this.geo.computeBoundingSphere();
 }
}

/* 띠: 몸을 타고 흐르는 핏줄기 */
class Ribbon{
 constructor(max,material){
  this.max=max;this.pts=[];
  this.P=new Float32Array(max*2*3);this.N=new Float32Array(max*2*3);
  const idx=[];for(let i=0;i<max-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(this.P,3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal',new THREE.BufferAttribute(this.N,3).setUsage(THREE.DynamicDrawUsage));
  g.setIndex(idx);g.setDrawRange(0,0);this.geo=g;
  this.mesh=new THREE.Mesh(g,material);this.mesh.frustumCulled=false;this.mesh.castShadow=false;this.mesh.receiveShadow=true;
  this._d=V3();this._s=V3();
 }
 get full(){return this.pts.length>=this.max;}
 push(p,n,w){if(this.full)return false;this.pts.push({p:p.clone(),n:n.clone(),w});const L=this.pts.length;for(let i=Math.max(0,L-5);i<L;i++)this._write(i);this.geo.setDrawRange(0,Math.max(0,(L-1)*6));this.geo.attributes.position.needsUpdate=true;this.geo.attributes.normal.needsUpdate=true;if(L%6===1)this.geo.computeBoundingSphere();return true;}
 widen(k){for(const q of this.pts)q.w*=k;for(let i=0;i<this.pts.length;i++)this._write(i);this.geo.attributes.position.needsUpdate=true;}
 _write(i){
  const L=this.pts.length,q=this.pts[i],a=this.pts[Math.max(0,i-1)].p,b=this.pts[Math.min(L-1,i+1)].p,d=this._d.subVectors(b,a);
  if(d.lengthSq()<1e-12)d.set(0,-1,0);d.normalize();
  const s=this._s.crossVectors(q.n,d);if(s.lengthSq()<1e-12)s.set(1,0,0);s.normalize();
  const tip=L-1-i,w=q.w*(i===0?.55:tip===0?.42:tip===1?.78:1),off=.0016;
  const P=this.P,N=this.N,k=i*6;
  P[k]=q.p.x+s.x*w+q.n.x*off;P[k+1]=q.p.y+s.y*w+q.n.y*off;P[k+2]=q.p.z+s.z*w+q.n.z*off;
  P[k+3]=q.p.x-s.x*w+q.n.x*off;P[k+4]=q.p.y-s.y*w+q.n.y*off;P[k+5]=q.p.z-s.z*w+q.n.z*off;
  N[k]=N[k+3]=q.n.x;N[k+1]=N[k+4]=q.n.y;N[k+2]=N[k+5]=q.n.z;
 }
 dispose(){this.geo.dispose();}
}

/* 두 마디 IK: 어깨→팔꿈치→손목. 부모 공간 기준 */
function solveTwoBone(S,T,pole,L1,L2,outElbow){
 const d=_ik1.subVectors(T,S);let dist=d.length();
 const maxD=L1+L2-1e-4,minD=Math.abs(L1-L2)+1e-4;dist=clamp(dist,minD,maxD);
 const u=d.lengthSq()<1e-10?_ik1.set(0,-1,0):d.normalize();
 const a=(dist*dist+L1*L1-L2*L2)/(2*dist),h=Math.sqrt(Math.max(0,L1*L1-a*a));
 const w=_ik2.subVectors(pole,S);w.addScaledVector(u,-w.dot(u));if(w.lengthSq()<1e-10)w.set(0,0,1).addScaledVector(u,-u.z);w.normalize();
 outElbow.copy(S).addScaledVector(u,a).addScaledVector(w,h);
 return dist;
}
const _ik1=V3(),_ik2=V3();

/* 여러 메시를 하나로 합치기(그리기 횟수 줄이기). parentInv: 합친 메시가 들어갈 부모의 월드 역행렬 */
const _mgM=new THREE.Matrix4();
function mergeMeshes(meshes,parentInv,colorOf){
 const parts=[];let vc=0,ic=0;
 for(const m of meshes){m.updateWorldMatrix(true,false);_mgM.multiplyMatrices(parentInv,m.matrixWorld);const g=m.geometry.clone();g.applyMatrix4(_mgM);if(!g.index){const n=g.attributes.position.count,a=new Uint32Array(n);for(let i=0;i<n;i++)a[i]=i;g.setIndex(new THREE.BufferAttribute(a,1));}parts.push(g);vc+=g.attributes.position.count;ic+=g.index.count;}
 const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),uv=new Float32Array(vc*2),colA=colorOf?new Float32Array(vc*3):null,idx=new Uint32Array(ic);let vo=0,io=0;
 parts.forEach((g,i)=>{const n=g.attributes.position.count;pos.set(g.attributes.position.array,vo*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,vo*2);
  if(colA){const c=colorOf(meshes[i]);for(let k=0;k<n;k++){colA[(vo+k)*3]=c.r;colA[(vo+k)*3+1]=c.g;colA[(vo+k)*3+2]=c.b;}}
  const ia=g.index.array;for(let k=0;k<ia.length;k++)idx[io+k]=ia[k]+vo;vo+=n;io+=ia.length;g.dispose();});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(colA)g.setAttribute('color',new THREE.BufferAttribute(colA,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();return g;
}

/* 한 부모 아래 움직이지 않는 자식 메시들을 재질·부위별로 합친다(userData.keep이 있으면 그대로) */
function mergeChildren(parent){
 parent.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(parent.matrixWorld).invert();const groups=new Map();
 for(const o of parent.children){if(!o.isMesh||o.userData.keep||o.isInstancedMesh||o.isSkinnedMesh)continue;const m=o.material;if(Array.isArray(m))continue;
  const k=m.uuid+'|'+(o.userData.part||'')+'|'+(o.userData.flow?1:0)+'|'+(o.castShadow?1:0)+'|'+(o.receiveShadow?1:0)+'|'+(o.visible?1:0);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);}
 for(const list of groups.values()){if(list.length<2)continue;const g=mergeMeshes(list,inv);const a=list[0];const m=new THREE.Mesh(g,a.material);m.castShadow=a.castShadow;m.receiveShadow=a.receiveShadow;m.userData=Object.assign({},a.userData);for(const o of list)o.removeFromParent();parent.add(m);}
}

/* 빠른 짧은 광선 검사: 지오메트리마다 삼각형 격자를 한 번 만들어 두고, 광선이 지나는 칸의 삼각형만 본다.
 * (피 줄기·상처 자국이 몸 표면을 따라가게 할 때 매 프레임 수십 번 쓴다) */
const FASTRAY=(()=>{
 const _a=V3(),_b=V3(),_d=V3(),_e1=V3(),_e2=V3(),_p=V3(),_s=V3(),_q=V3(),_n=V3();
 function build(g){
  const pos=g.attributes.position,idx=g.index?g.index.array:null,tri=(idx?idx.length:pos.count)/3|0;
  g.computeBoundingBox();const bb=g.boundingBox.clone();const size=bb.getSize(V3());
  const res=Math.max(2,Math.min(18,Math.round(Math.cbrt(tri/2.5))));
  const nx=size.x>1e-6?res:1,ny=size.y>1e-6?res:1,nz=size.z>1e-6?res:1;
  const cx=Math.max(size.x/nx,1e-6),cy=Math.max(size.y/ny,1e-6),cz=Math.max(size.z/nz,1e-6);
  const A=new Float32Array(tri*9);const lists=Array.from({length:nx*ny*nz},()=>[]);
  for(let t=0;t<tri;t++){
   let mnx=1e9,mny=1e9,mnz=1e9,mxx=-1e9,mxy=-1e9,mxz=-1e9;
   for(let k=0;k<3;k++){const vi=idx?idx[t*3+k]:t*3+k;const x=pos.getX(vi),y=pos.getY(vi),z=pos.getZ(vi);A[t*9+k*3]=x;A[t*9+k*3+1]=y;A[t*9+k*3+2]=z;
    if(x<mnx)mnx=x;if(y<mny)mny=y;if(z<mnz)mnz=z;if(x>mxx)mxx=x;if(y>mxy)mxy=y;if(z>mxz)mxz=z;}
   const i0=clamp(Math.floor((mnx-bb.min.x)/cx),0,nx-1),i1=clamp(Math.floor((mxx-bb.min.x)/cx),0,nx-1);
   const j0=clamp(Math.floor((mny-bb.min.y)/cy),0,ny-1),j1=clamp(Math.floor((mxy-bb.min.y)/cy),0,ny-1);
   const k0=clamp(Math.floor((mnz-bb.min.z)/cz),0,nz-1),k1=clamp(Math.floor((mxz-bb.min.z)/cz),0,nz-1);
   for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let k=k0;k<=k1;k++)lists[i+nx*(j+ny*k)].push(t);
  }
  const cells=lists.map(l=>l.length?Int32Array.from(l):null);
  return {bb,nx,ny,nz,cx,cy,cz,cells,A,mark:new Uint32Array(tri),stamp:1};
 }
 function grid(g){return g.userData.fastGrid||(g.userData.fastGrid=build(g));}
 // 지역 좌표 선분 a→b 와 만나는 가장 가까운 앞면 삼각형. 결과: t(0..1), 지역 법선
 function segment(G,a,b,out){
  const bb=G.bb,pad=1e-4;
  const mnx=Math.min(a.x,b.x)-pad,mxx=Math.max(a.x,b.x)+pad,mny=Math.min(a.y,b.y)-pad,mxy=Math.max(a.y,b.y)+pad,mnz=Math.min(a.z,b.z)-pad,mxz=Math.max(a.z,b.z)+pad;
  if(mxx<bb.min.x||mnx>bb.max.x||mxy<bb.min.y||mny>bb.max.y||mxz<bb.min.z||mnz>bb.max.z)return false;
  const i0=clamp(Math.floor((mnx-bb.min.x)/G.cx),0,G.nx-1),i1=clamp(Math.floor((mxx-bb.min.x)/G.cx),0,G.nx-1);
  const j0=clamp(Math.floor((mny-bb.min.y)/G.cy),0,G.ny-1),j1=clamp(Math.floor((mxy-bb.min.y)/G.cy),0,G.ny-1);
  const k0=clamp(Math.floor((mnz-bb.min.z)/G.cz),0,G.nz-1),k1=clamp(Math.floor((mxz-bb.min.z)/G.cz),0,G.nz-1);
  if((i1-i0+1)*(j1-j0+1)*(k1-k0+1)>400)return false;
  G.stamp++;if(G.stamp>4e9){G.mark.fill(0);G.stamp=1;}
  const st=G.stamp,A=G.A,dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;let best=2,bi=-1;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let k=k0;k<=k1;k++){
   const c=G.cells[i+G.nx*(j+G.ny*k)];if(!c)continue;
   for(let q=0;q<c.length;q++){const t=c[q];if(G.mark[t]===st)continue;G.mark[t]=st;const o=t*9;
    const v0x=A[o],v0y=A[o+1],v0z=A[o+2];
    const e1x=A[o+3]-v0x,e1y=A[o+4]-v0y,e1z=A[o+5]-v0z,e2x=A[o+6]-v0x,e2y=A[o+7]-v0y,e2z=A[o+8]-v0z;
    const px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x;
    const det=e1x*px+e1y*py+e1z*pz;if(det<1e-12)continue; // 앞면만
    const inv=1/det,sx=a.x-v0x,sy=a.y-v0y,sz=a.z-v0z;
    const u=(sx*px+sy*py+sz*pz)*inv;if(u<0||u>1)continue;
    const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x;
    const v=(dx*qx+dy*qy+dz*qz)*inv;if(v<0||u+v>1)continue;
    const tt=(e2x*qx+e2y*qy+e2z*qz)*inv;if(tt<0||tt>1||tt>=best)continue;
    best=tt;bi=t;
   }
  }
  if(bi<0)return false;
  const o=bi*9;_e1.set(A[o+3]-A[o],A[o+4]-A[o+1],A[o+5]-A[o+2]);_e2.set(A[o+6]-A[o],A[o+7]-A[o+1],A[o+8]-A[o+2]);
  out.t=best;out.normal.crossVectors(_e1,_e2).normalize();return true;
 }
 return {grid,segment};
})();
/* ===== 3. 소리 =====
 * 녹음 파일 없이 전부 만들어 낸다. 타격음은 여러 겹(낮은 쿵 + 살 철썩 + 뼈 딱 + 공간 울림)으로 쌓고,
 * 목소리는 성대 소리를 모음 울림통(포먼트)에 통과시켜 '윽·억·아악·으으·흐흐' 같은 소리를 낸다. */
const AUDIO=(()=>{
 let ctx=null,master,comp,lim,bus,vbus,verb,noise,glot,on=true;
 const R=(a,b)=>a+Math.random()*(b-a);
 function makeIR(sec,decay,tone){
  const sr=ctx.sampleRate,len=Math.floor(sr*sec),b=ctx.createBuffer(2,len,sr);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;
   for(let i=0;i<len;i++){const t=i/len;let x=(Math.random()*2-1)*Math.pow(1-t,decay);lp+=(x-lp)*tone;d[i]=lp*(i<sr*.004?i/(sr*.004):1);}
   for(const [ms,g] of [[11,.5],[19,.35],[29,.3],[41,.22],[57,.16]]){const k=Math.floor(sr*ms/1000)+(c?37:0);if(k<len)d[k]+=g*(c?-.8:1);}}
  return b;
 }
 function init(){
  if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  ctx=new AC();
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-15;comp.knee.value=8;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.14;
  lim=ctx.createDynamicsCompressor();lim.threshold.value=-4;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.09;
  master=ctx.createGain();master.gain.value=on?.92:0;
  bus=ctx.createGain();vbus=ctx.createGain();vbus.connect(bus);
  bus.connect(comp);comp.connect(lim);lim.connect(master);master.connect(ctx.destination);
  verb=ctx.createConvolver();verb.buffer=makeIR(1.6,2.8,.3);const vr=ctx.createGain();vr.gain.value=.4;verb.connect(vr);vr.connect(comp);
  const len=ctx.sampleRate*2;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  // 성대 소리: 배음이 부드럽게 줄어드는 펄스
  const N=48,re=new Float32Array(N+1),im=new Float32Array(N+1);for(let n=1;n<=N;n++){im[n]=Math.pow(n,-1.55)*(n%2?1:.85);}glot=ctx.createPeriodicWave(re,im,{disableNormalization:false});
 }
 function unlock(){try{init();if(ctx&&ctx.state!=='running'){const p=ctx.resume();if(p&&p.catch)p.catch(()=>{});}}catch(_){}}
 function ready(){return ctx&&on&&ctx.state==='running';}
 function setOn(v){on=!!v;if(master)master.gain.setTargetAtTime(on?.92:0,ctx.currentTime,.03);}
 const live=new Set();
 function track(n,end){live.add(n);n.onended=()=>live.delete(n);}
 function stop(){for(const n of live){try{n.stop();}catch(_){}}live.clear();}
 function out(pan=0,wet=.2,voice=false){
  const g=ctx.createGain();let node=g;
  if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;}
  node.connect(voice?vbus:bus);if(wet>0){const s=ctx.createGain();s.gain.value=wet;node.connect(s);s.connect(verb);}
  return g;
 }
 function env(p,t,peak,a,d,curve){p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(Math.max(.0002,peak),t+a);if(curve==='lin')p.linearRampToValueAtTime(.0001,t+a+d);else p.exponentialRampToValueAtTime(.0001,t+a+d);}
 function osc(dest,t,o){const s=ctx.createOscillator(),g=ctx.createGain();if(o.wave)s.setPeriodicWave(o.wave);else s.type=o.type||'sine';s.frequency.setValueAtTime(o.f0,t);if(o.f1)s.frequency.exponentialRampToValueAtTime(Math.max(1,o.f1),t+(o.glide||o.dur));env(g.gain,t,o.peak,o.a||.001,o.dur,o.curve);s.connect(g);g.connect(dest);s.start(t);s.stop(t+(o.a||.001)+o.dur+.05);track(s);return s;}
 function nz(dest,t,o){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;s.playbackRate.value=o.rate||1;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f1)f.frequency.exponentialRampToValueAtTime(o.f1,t+(o.glide||o.dur));f.Q.value=o.q==null?.8:o.q;env(g.gain,t,o.peak,o.a||.001,o.dur,o.curve);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*1.6);s.stop(t+(o.a||.001)+o.dur+.05);track(s);return s;}
 function clicks(dest,t,n,span,f,peak){for(let i=0;i<n;i++)nz(dest,t+Math.random()*span,{dur:R(.003,.009),peak:peak*R(.4,1),f:f*R(.7,1.4),q:3});}
 function ring(dest,t,fs,dur,peak){fs.forEach((f,i)=>osc(dest,t,{f0:f*R(.995,1.005),dur:dur*(1-i*.18),peak:peak*(1-i*.2),a:.0015}));}

 /* ---- 휘두르는 소리 ---- */
 function whoosh(p=1,kind){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.08);
  if(kind==='slash'){nz(o,t,{dur:.13,peak:.28*p,a:.02,f:1600,f1:5200,q:1.4});nz(o,t+.02,{dur:.08,peak:.12*p,f:6000,type:'highpass',q:.7});return;}
  const heavy=p>.9;nz(o,t,{dur:heavy?.24:.12,peak:(heavy?.42:.24)*Math.min(1.3,p),a:heavy?.05:.02,f:heavy?380:700,f1:heavy?1500:2400,q:1.2});
  if(heavy)nz(o,t+.04,{dur:.16,peak:.14,f:220,f1:600,q:.8,type:'lowpass'});
 }
 /* ---- 맞는 소리 ---- */
 function punchFace(o,t,p){
  const j=R(.92,1.08);
  osc(o,t,{f0:150*j,f1:52,dur:.16+p*.04,peak:.95});
  osc(o,t,{type:'triangle',f0:390*j,f1:150,dur:.05,peak:.42});
  osc(o,t,{f0:64,f1:40,dur:.22,peak:.38*p,a:.003});
  nz(o,t,{dur:.034,peak:.82,f:2300*j,f1:1100,q:.9});
  nz(o,t,{dur:.016,peak:.5,f:5200,type:'highpass',q:.5});
  nz(o,t+.004,{dur:.075,peak:.32,f:1100,f1:380,type:'lowpass',q:.7});
  clicks(o,t,2+Math.round(p*2),.012,3600,.38);
 }
 function punchBody(o,t,p){
  const j=R(.9,1.08);
  osc(o,t,{f0:118*j,f1:42,dur:.22+p*.05,peak:1});
  osc(o,t,{f0:58,f1:34,dur:.3,peak:.5*p,a:.004});
  nz(o,t,{dur:.07,peak:.62,f:900*j,f1:300,q:.8});
  nz(o,t,{dur:.025,peak:.4,f:2600,q:.9});
  nz(o,t+.01,{dur:.18,peak:.26,f:420,f1:140,type:'lowpass',q:.6});
  // 뱃살 출렁
  osc(o,t+.03,{f0:76,f1:58,dur:.16,peak:.16,type:'triangle'});
 }
 function bone(o,t,p){clicks(o,t+.004,4+Math.round(p*3),.03,2600,.55);nz(o,t,{dur:.012,peak:.5*p,f:3800,type:'highpass',q:.4});osc(o,t+.006,{type:'triangle',f0:620,f1:240,dur:.04,peak:.25});}
 function hit(tool,kind,part,p,blocked){
  if(!ready())return;const t=ctx.currentTime+.002,head=/head|face|nose|mouth|chin|eye|beard/.test(part);
  const o=out(R(-.15,.15),tool==='gun'?.25:.16);p=clamp(p,.4,2.4);
  if(blocked){block(p);return;}
  if(part==='crown'){crownT(o,t,p);return;}
  if(tool==='hand'){
 if(head)punchFace(o,t,p);else punchBody(o,t,p);
 ring(o,t+.003,[1750,3100,4450],.055,.045*p);
}
  else if(tool==='pipe'){
   if(head)punchFace(o,t,p*.9);else punchBody(o,t,p*.9);
   ring(o,t+.002,[1180,2960,4870],.18,.07);osc(o,t,{type:'triangle',f0:420,f1:170,dur:.07,peak:.5});nz(o,t,{dur:.02,peak:.6,f:3300,q:.8});
   if(head&&Math.random()<.45)bone(o,t,p);
  }else if(tool==='hammer'){
   osc(o,t,{f0:175,f1:48,dur:.2,peak:1});osc(o,t,{type:'triangle',f0:520,f1:170,dur:.06,peak:.55});
   nz(o,t,{dur:.016,peak:.85,f:2600,q:.9});nz(o,t+.004,{dur:.1,peak:.4,f:700,f1:220,type:'lowpass',q:.7});
   ring(o,t+.002,[1860,3380],.08,.05);if(head)bone(o,t,p*1.2);
  }else if(tool==='knife'){
   if(kind==='slash'){nz(o,t,{dur:.07,peak:.55,f:3600,f1:1800,q:1.2});nz(o,t+.008,{dur:.12,peak:.4,f:900,f1:1600,q:4});osc(o,t,{f0:140,f1:70,dur:.06,peak:.25});}
   else{nz(o,t,{dur:.05,peak:.6,f:3800,f1:1500,q:1.1});
    // 질척: 공명 필터를 쓸어 올림
    const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=7;f.frequency.setValueAtTime(520,t+.01);f.frequency.exponentialRampToValueAtTime(1500,t+.13);env(g.gain,t+.01,.75,.006,.15);s.connect(f);f.connect(g);g.connect(o);s.start(t+.01,Math.random());s.stop(t+.2);track(s);
    osc(o,t,{f0:132,f1:62,dur:.1,peak:.6});
    // 뽑을 때
    nz(o,t+.17,{dur:.09,peak:.3,f:700,f1:2000,q:5});}
  }else if(tool==='gun'){
   osc(o,t,{f0:150,f1:55,dur:.12,peak:.9});nz(o,t,{dur:.04,peak:.75,f:1500,f1:600,q:.8});nz(o,t+.006,{dur:.1,peak:.35,f:800,f1:1700,q:5});
   if(head)bone(o,t,1.3);
  }
 }
 function block(p){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.14);osc(o,t,{type:'triangle',f0:240,f1:110,dur:.08,peak:.7});osc(o,t,{f0:95,f1:55,dur:.14,peak:.5});nz(o,t,{dur:.05,peak:.5,f:1300,q:.8});nz(o,t,{dur:.11,peak:.25,f:500,f1:200,type:'lowpass'});}
 function crownT(o,t,p){ring(o,t,[880,2070,3510,5200],.22,.16*p);osc(o,t,{type:'triangle',f0:300,f1:150,dur:.05,peak:.4});clicks(o,t+.01,10,.25,5200,.22);}
 function crown(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.25);crownT(o,t,p);}
 function crownLand(){if(!ready())return;const t=ctx.currentTime,o=out(0,.3);osc(o,t,{f0:160,f1:70,dur:.12,peak:.5});ring(o,t,[620,1450,2300],.16,.12);clicks(o,t,16,.55,4600,.24);}
 function tooth(){if(!ready())return;const t=ctx.currentTime,o=out(R(-.4,.4),.12);clicks(o,t,3,.01,4200,.5);osc(o,t,{f0:2600,f1:2100,dur:.03,peak:.2});}
 function toothBounce(){if(!ready())return;const t=ctx.currentTime,o=out(R(-.5,.5),.15);for(let i=0;i<3;i++){osc(o,t+i*.09*(1-i*.2),{f0:3200*R(.9,1.1),dur:.02,peak:.16/(i+1)});clicks(o,t+i*.09,1,.002,5000,.2/(i+1));}}
 function crack(p=1){if(!ready())return;const t=ctx.currentTime,o=out(0,.15);bone(o,t,p*1.4);osc(o,t,{f0:180,f1:80,dur:.08,peak:.4});}
 function tablet(broken){if(!ready())return;const t=ctx.currentTime+.01,o=out(R(-.3,.3),.3);ring(o,t,[2750,4630,6980],.35,.14);nz(o,t,{dur:.03,peak:.55,f:3000,q:.8});if(broken){clicks(o,t+.02,12,.3,6000,.28);ring(o,t+.08,[3200,5100],.2,.08);}}
 /* ---- 총 ---- */
 function gunshot(){if(!ready())return;const t=ctx.currentTime,o=out(.12,.5);
  nz(o,t,{dur:.012,peak:1,f:2500,type:'highpass',q:.5});
  nz(o,t,{dur:.09,peak:.95,f:1400,f1:420,q:.7});
  osc(o,t,{f0:110,f1:36,dur:.28,peak:1});osc(o,t,{type:'triangle',f0:820,f1:120,dur:.04,peak:.38});
  nz(o,t+.03,{dur:.55,peak:.3,f:700,f1:160,type:'lowpass',q:.5});
  clicks(o,t+.012,2,.01,3000,.4);
  // 탄피가 바닥에 떨어진다
  const o2=out(.5,.18);for(let i=0;i<3;i++){const tt=t+.42+i*(.09-i*.02);ring(o2,tt,[4200*R(.97,1.03),6100,8300],.07,.07/(i+1));}
 }
 function dry(){if(!ready())return;const t=ctx.currentTime,o=out(.2,.05);clicks(o,t,1,.002,2200,.5);osc(o,t,{type:'triangle',f0:900,f1:400,dur:.02,peak:.2});}
 function reload(){if(!ready())return;const t=ctx.currentTime,o=out(.25,.08);
  clicks(o,t+.1,2,.02,2400,.4);nz(o,t+.12,{dur:.14,peak:.2,f:2200,f1:900,q:1});
  osc(o,t+.62,{type:'triangle',f0:380,f1:180,dur:.04,peak:.35});clicks(o,t+.62,2,.015,2600,.5);
  nz(o,t+.86,{dur:.07,peak:.3,f:2600,f1:1400,q:1.5});clicks(o,t+.95,2,.02,3200,.55);osc(o,t+.95,{type:'triangle',f0:520,f1:260,dur:.03,peak:.3});}
 /* ---- 피 ---- */
 function spurt(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.12);nz(o,t,{dur:.18,peak:.22*p,f:700,f1:300,type:'lowpass',q:1});nz(o,t+.02,{dur:.09,peak:.12*p,f:1800,q:3});}
 let dripT=0;function drip(p=.4){if(!ready())return;const t=ctx.currentTime;if(t<dripT)return;dripT=t+.06;const o=out(R(-.6,.6),.25);osc(o,t,{f0:R(900,1500),f1:R(500,700),dur:.03,peak:.08*p});}
 /* ---- 넘어짐 ---- */
 function fall(type){if(!ready())return;const t=ctx.currentTime,o=out(0,.32);
  osc(o,t,{f0:80,f1:30,dur:.4,peak:1});nz(o,t,{dur:.3,peak:.6,f:320,f1:90,type:'lowpass',q:.6});nz(o,t+.01,{dur:.22,peak:.3,f:1600,f1:700,q:.8});
  if(type==='throne'){osc(o,t,{type:'triangle',f0:210,f1:90,dur:.16,peak:.55});const c=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();c.type='sawtooth';c.frequency.setValueAtTime(140,t+.08);c.frequency.linearRampToValueAtTime(95,t+.5);f.type='bandpass';f.frequency.value=900;f.Q.value=6;env(g.gain,t+.08,.06,.04,.4);c.connect(f);f.connect(g);g.connect(o);c.start(t+.08);c.stop(t+.6);track(c);}
  if(type==='knees'){osc(o,t+.09,{f0:90,f1:40,dur:.2,peak:.7});}
 }
 /* ---- 목소리 ---- */
 const VOW={a:[730,1090,2440,3400],eo:[640,1190,2390,3300],o:[570,840,2410,3300],u:[300,870,2240,3300],eu:[350,1350,2300,3300],e:[530,1840,2480,3400],i:[270,2290,3010,3500],m:[260,1000,2300,3300]};
 const BW=[90,115,180,260];
 function voice(t,o){
  const dur=o.dur,peak=o.peak||.4,v1=VOW[o.v1||'eo'],v2=VOW[o.v2||o.v1||'eo'],dst=out(o.pan||R(-.08,.08),o.wet==null?.22:o.wet,true);
  const src=ctx.createOscillator();src.setPeriodicWave(glot);src.frequency.setValueAtTime(o.f0,t);
  if(o.fm)src.frequency.linearRampToValueAtTime(o.fm,t+dur*(o.fmAt||.35));src.frequency.linearRampToValueAtTime(o.f1||o.f0,t+dur);
  // 떨림(비브라토)과 거친 흔들림(지터)
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=o.vibHz||5.5;vg.gain.value=(o.vib||.012)*o.f0;vib.connect(vg);vg.connect(src.frequency);
  const jit=ctx.createBufferSource(),jf=ctx.createBiquadFilter(),jg=ctx.createGain();jit.buffer=noise;jit.playbackRate.value=.02;jf.type='lowpass';jf.frequency.value=30;jg.gain.value=o.f0*(o.rough||.03);jit.connect(jf);jf.connect(jg);jg.connect(src.frequency);
  const tilt=ctx.createBiquadFilter();tilt.type='lowpass';tilt.frequency.value=o.bright||3200;tilt.Q.value=.5;src.connect(tilt);
  const mix=ctx.createGain();mix.gain.value=1;tilt.connect(mix);
  // 숨소리
  const br=ctx.createBufferSource(),bf=ctx.createBiquadFilter(),bg=ctx.createGain();br.buffer=noise;bf.type='bandpass';bf.frequency.value=1800;bf.Q.value=.6;bg.gain.value=(o.breath||.2)*1.4;br.connect(bf);bf.connect(bg);bg.connect(mix);
  const env_=ctx.createGain();
  for(let i=0;i<4;i++){const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(v1[i],t);f.frequency.linearRampToValueAtTime(v2[i],t+dur*.8);f.Q.value=v1[i]/BW[i];const g=ctx.createGain();g.gain.value=[1,.7,.32,.16][i]*3.4;mix.connect(f);f.connect(g);g.connect(env_);}
  const a=o.attack||.018,rel=o.release||.05;env_.gain.setValueAtTime(.0001,t);env_.gain.linearRampToValueAtTime(peak,t+a);
  if(o.trem){const tr=ctx.createOscillator(),tg=ctx.createGain();tr.frequency.value=o.trem;tg.gain.value=peak*.35;tr.connect(tg);tg.connect(env_.gain);tr.start(t);tr.stop(t+dur+.1);track(tr);}
  env_.gain.setValueAtTime(peak,t+Math.max(a,dur-rel));env_.gain.exponentialRampToValueAtTime(.0001,t+dur);
  env_.connect(dst);
  for(const n of [src,vib])n.start(t);jit.start(t,Math.random()*1.5);br.start(t,Math.random()*1.5);
  for(const n of [src,vib,jit,br]){n.stop(t+dur+.06);track(n);}
 }
 function breath(t,dur,peak,f0=900,f1=1600,pan=0){const o=out(pan,.15,true);nz(o,t,{dur,peak,a:dur*.3,f:f0,f1,q:.9,curve:'lin'});}
 let lastV=0;
 function say(name,k=1){
  if(!ready())return;const t=ctx.currentTime+.01,P=R(.94,1.06);
  switch(name){
   case 'grunt':voice(t,{dur:R(.11,.16),f0:155*P,f1:112*P,v1:'eu',v2:'eo',breath:.25,peak:.42*k,release:.015,rough:.05});break;
   case 'oof':breath(t,.06,.3*k,600,1400);voice(t+.02,{dur:.17,f0:128*P,f1:88*P,v1:'eo',v2:'u',breath:.55,peak:.42*k,release:.03,rough:.06,bright:2200});break;
   case 'yelp':voice(t,{dur:R(.26,.36),f0:210*P,fm:300*P,f1:175*P,v1:'a',v2:'a',breath:.18,peak:.46*k,vib:.02,vibHz:9,rough:.09,bright:4200,wet:.28});break;
   case 'scream':voice(t,{dur:.62,f0:170*P,fm:285*P,fmAt:.3,f1:190*P,v1:'eu',v2:'a',breath:.22,peak:.46*k,vib:.03,vibHz:7,rough:.12,bright:4600,wet:.34});break;
   case 'groan':voice(t,{dur:R(.8,1.2),f0:108*P,f1:88*P,v1:'eu',v2:'eo',breath:.35,peak:.3*k,trem:6,vib:.02,rough:.07,bright:1800});break;
   case 'gasp':breath(t,.14,.34*k,700,2600);voice(t+.1,{dur:.1,f0:170*P,f1:150*P,v1:'eo',breath:.5,peak:.26*k,release:.015});break;
   case 'laugh':{const big=k>1.05,n=big?7:5;let tt=t;for(let i=0;i<n;i++){const last=i===n-1,dur=last?.32:R(.085,.11);breath(tt,.045,.22,1200,1500);voice(tt+.03,{dur,f0:(big?178:142)*(1-i*.03)*P,f1:(big?160:128)*(1-i*.03)*(last?.82:1)*P,v1:big?'a':'eo',breath:.42,peak:(big?.4:.3)*(last?.8:1),release:.03,attack:.012,rough:.04,wet:.25});tt+=dur+(big?.07:.09);}break;}
   case 'sob':{breath(t,.22,.26,500,2400);let tt=t+.24;for(let i=0;i<3;i++){const last=i===2;voice(tt,{dur:last?.55:.16,f0:(212-i*6)*P,f1:(last?160:225)*P,v1:'eu',v2:last?'m':'eo',breath:.5,peak:.22*k,vib:.05,vibHz:7.5,rough:.1,bright:2600,wet:.25});tt+=last?.6:.2;}break;}
   case 'beg':{let tt=t;for(let i=0;i<2;i++){voice(tt,{dur:.38,f0:205*P,fm:245*P,fmAt:.7,f1:215*P,v1:'eu',v2:'m',breath:.45,peak:.2*k,vib:.04,vibHz:6.5,rough:.08,bright:2400});tt+=.48;}break;}
   case 'cough':{let tt=t;for(let i=0;i<3;i++){const o=out(0,.2,true);nz(o,tt,{dur:.09,peak:.36*k,f:1200,f1:600,q:.7});voice(tt,{dur:.08,f0:150*P,f1:120*P,v1:'eo',breath:.6,peak:.25*k,release:.02,attack:.004});tt+=R(.19,.26);}break;}
   case 'spit':{const o=out(.2,.12,true);nz(o,t,{dur:.012,peak:.4,f:3500,type:'highpass',q:.5});nz(o,t+.012,{dur:.09,peak:.26,f:2400,f1:1500,q:.9});voice(t+.01,{dur:.07,f0:180*P,v1:'e',breath:.7,peak:.12,release:.02});break;}
   case 'huff':{const o=out(0,.12,true);nz(o,t,{dur:.22,peak:.3*k,f:500,f1:350,type:'lowpass',q:.6});voice(t,{dur:.16,f0:120*P,f1:100*P,v1:'m',breath:.6,peak:.18*k,bright:1200});break;}
   case 'final':voice(t,{dur:1.7,f0:128*P,fm:110*P,f1:66*P,v1:'eo',v2:'eu',breath:.42,peak:.34*k,trem:4.5,vib:.03,rough:.1,bright:2000,wet:.35});breath(t+1.6,.7,.2,800,500);break;
  }
 }
 return {unlock,setOn,stop,whoosh,hit,block,crown,crownLand,tooth,toothBounce,crack,tablet,gunshot,dry,reload,spurt,drip,fall,
  whiff(){},voice:say,gasp(k=1){say('gasp',k);},ui(){if(!ready())return;const t=ctx.currentTime,o=out(0,.02);osc(o,t,{f0:880,f1:660,dur:.04,peak:.12,type:'triangle'});},
  get ctx(){return ctx;}};
})();
/* ===== 4. 무대와 카메라 ===== */
const canvas=$('#world');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false});}
catch(e){throw new Error('이 기기에서는 3D 그래픽(WebGL)을 쓸 수 없습니다.');}
const DPR_MAX=1.6;
renderer.setPixelRatio(Math.min(DPR_MAX,window.devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.autoClear=false;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,1,.05,40);
const vmScene=new THREE.Scene();
const vmCam=new THREE.PerspectiveCamera(60,1,.01,6);

/* 하늘: 위는 짙은 하늘색, 아래로 갈수록 밝게 */
const SKY=canvasTex(4,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#5fa8e8');gr.addColorStop(.45,'#9fd0f5');gr.addColorStop(.75,'#e3f2fb');gr.addColorStop(1,'#fff6e4');g.fillStyle=gr;g.fillRect(0,0,w,h);});
scene.background=SKY;
scene.fog=new THREE.Fog(col('#e6f0f6'),9,22);

/* 금속이 비칠 주변 환경: 작은 큐브맵(면마다 64px). PMREM보다 훨씬 가벼워 휴대폰에서도 부담이 적다 */
const ENV=(()=>{try{
 const face=(draw)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');draw(g,64);return c;};
 const side=(g,n)=>{const gr=g.createLinearGradient(0,0,0,n);gr.addColorStop(0,'#9cc8ef');gr.addColorStop(.45,'#fbf6ea');gr.addColorStop(.6,'#f2dfb2');gr.addColorStop(1,'#b98a4a');g.fillStyle=gr;g.fillRect(0,0,n,n);g.fillStyle='#c4321f';g.fillRect(8,14,7,34);g.fillRect(48,14,7,34);g.fillStyle='rgba(255,255,255,.95)';g.fillRect(22,18,20,16);};
 const imgs=[face(side),face(side),face((g,n)=>{const r=g.createRadialGradient(32,32,4,32,32,46);r.addColorStop(0,'#ffffff');r.addColorStop(1,'#8fc1ec');g.fillStyle=r;g.fillRect(0,0,n,n);}),
  face((g,n)=>{g.fillStyle='#caa060';g.fillRect(0,0,n,n);g.fillStyle='#e9d6ae';for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)g.fillRect(i*16,j*16,16,16);}),
  face(side),face((g,n)=>{side(g,n);g.strokeStyle='#b8341f';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,40);g.stroke();}})];
 const t=new THREE.CubeTexture(imgs);t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t;}catch(_){return null;}})();
/* 주변 반사는 금속에만 준다(전체에 주면 휴대폰에서 무겁다) */
function metalEnv(root){root.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)if(m.isMeshStandardMaterial&&m.metalness>.3&&ENV&&!m.envMap){m.envMap=ENV;m.needsUpdate=true;}});}
const hemi=new THREE.HemisphereLight(col('#eef5ff'),col('#a88458'),.55);scene.add(hemi);
const key=new THREE.DirectionalLight(col('#fff1da'),1.7);key.position.set(-1.7,3.4,2.8);key.target.position.set(0,1,-.2);scene.add(key);scene.add(key.target);
key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1.9,right:1.9,top:2.4,bottom:-1.1,near:.6,far:9});key.shadow.bias=-.0005;key.shadow.normalBias=.025;
const fill=new THREE.DirectionalLight(col('#cfe2ff'),.36);fill.position.set(2.4,1.5,2.2);scene.add(fill);
const rim=new THREE.DirectionalLight(col('#ffd690'),.95);rim.position.set(1.4,2.8,-2.4);scene.add(rim);
const bounce=new THREE.PointLight(col('#ffd9a8'),.35,4.5,2);bounce.position.set(0,.25,1.2);scene.add(bounce);

/* 1인칭 손·무기 조명(따로 그린다) */
vmScene.add(new THREE.HemisphereLight(col('#f3f6ff'),col('#8a7458'),.8));
const vmKey=new THREE.DirectionalLight(col('#fff0d8'),1.35);vmKey.position.set(-1,2,1.5);vmScene.add(vmKey);
const vmRim=new THREE.DirectionalLight(col('#ffe0b0'),.55);vmRim.position.set(1.5,.8,-1);vmScene.add(vmRim);

const STD=(hex,o={})=>{const m=new THREE.MeshStandardMaterial(Object.assign({color:col(hex),roughness:.6,metalness:0},o));if(o.envMapIntensity==null)m.envMapIntensity=1;return m;};

/* ---- 하늘 궁전(능소보전) ---- */
const WORLD={};
(function buildWorld(){
 const root=new THREE.Group();scene.add(root);WORLD.root=root;
 // 바닥: 옥빛 흰 대리석 + 금선
 const floorTex=canvasTex(1024,1024,(g,w,h)=>{
  g.fillStyle='#efe6d4';g.fillRect(0,0,w,h);
  for(let i=0;i<5200;i++){const x=Math.random()*w,y=Math.random()*h,a=Math.random()*.05;g.fillStyle=`rgba(${150+Math.random()*60|0},${140+Math.random()*50|0},${120+Math.random()*40|0},${a})`;g.fillRect(x,y,2+Math.random()*5,2+Math.random()*5);}
  g.lineCap='round';
  for(let i=0;i<26;i++){g.strokeStyle=`rgba(160,150,135,${.08+Math.random()*.12})`;g.lineWidth=.6+Math.random()*1.6;g.beginPath();let x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);for(let k=0;k<8;k++){x+=rnd(-70,70);y+=rnd(-60,60);g.lineTo(x,y);}g.stroke();}
  g.strokeStyle='#c49a3c';g.lineWidth=6;for(let k=0;k<=4;k++){g.beginPath();g.moveTo(k*w/4,0);g.lineTo(k*w/4,h);g.stroke();g.beginPath();g.moveTo(0,k*h/4);g.lineTo(w,k*h/4);g.stroke();}
  g.strokeStyle='rgba(255,240,200,.55)';g.lineWidth=2;for(let k=0;k<=4;k++){g.beginPath();g.moveTo(k*w/4+3,0);g.lineTo(k*w/4+3,h);g.stroke();}
 },{repeat:[6,6]});
 const floor=mk(new THREE.PlaneGeometry(14,14),STD('#ffffff',{map:floorTex,roughness:.3}),root,{r:[-PI/2,0,0],cast:false});floor.name='floor';
 // 옥좌 단: 붉은 칠 + 금테
 const red=STD('#b3261c',{roughness:.38}),gold=STD('#e3ad48',{metalness:.78,roughness:.3}),goldD=STD('#a8761f',{metalness:.7,roughness:.42});
 const throne=grp(root,[0,0,-.86],'throne');WORLD.throne=throne;
 mk(new THREE.BoxGeometry(1.3,.38,.66),red,throne,{p:[0,.19,0]});
 for(const y of [.02,.37])mk(new THREE.BoxGeometry(1.34,.035,.7),goldD,throne,{p:[0,y,0]});
 for(const x of [-.66,.66])mk(new THREE.BoxGeometry(.04,.36,.7),gold,throne,{p:[x,.19,0]});
 // 앞판 금장식(구름무늬)
 const frontTex=canvasTex(512,160,(g,w,h)=>{g.fillStyle='#b3261c';g.fillRect(0,0,w,h);g.strokeStyle='#f1c25a';g.lineWidth=7;g.lineCap='round';for(let i=0;i<5;i++){const cx=56+i*100,cy=82;g.beginPath();g.arc(cx,cy,26,.3,5.6);g.stroke();g.beginPath();g.arc(cx+20,cy+6,14,3.4,7.4);g.stroke();g.beginPath();g.moveTo(cx-36,cy+30);g.quadraticCurveTo(cx,cy+48,cx+44,cy+24);g.stroke();}});
 mk(new THREE.PlaneGeometry(1.24,.3),STD('#ffffff',{map:frontTex,roughness:.4}),throne,{p:[0,.2,.331],cast:false});
 // 방석(앉을 때 닿는 곳)
 const cushTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#f0c23a';g.fillRect(0,0,w,h);g.strokeStyle='rgba(176,108,10,.55)';g.lineWidth=3;for(let y=16;y<h;y+=32)for(let x=(y/32%2)*16;x<w;x+=32){g.beginPath();g.arc(x,y,8,0,TAU);g.stroke();}},{repeat:[2,1]});
 const cush=mk(new THREE.BoxGeometry(1.12,.11,.6),STD('#ffffff',{map:cushTex,roughness:.75}),throne,{p:[0,.43,.02]});cush.name='seat';
 // 등받이: 금 틀 + 연옥빛 판(피가 튀어 묻는 곳)
 const back=grp(throne,[0,0,-.29]);
 mk(new THREE.BoxGeometry(1.36,1.42,.1),gold,back,{p:[0,1.16,0]});
 const panelTex=canvasTex(512,512,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#cfeadb');gr.addColorStop(1,'#a9d6be');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(196,150,52,.9)';g.lineWidth=5;g.lineCap='round';
  const cloud=(cx,cy,s)=>{g.beginPath();g.arc(cx,cy,18*s,.2,5.7);g.stroke();g.beginPath();g.arc(cx+16*s,cy+5*s,11*s,3.3,7.6);g.stroke();g.beginPath();g.moveTo(cx-28*s,cy+22*s);g.quadraticCurveTo(cx,cy+36*s,cx+34*s,cy+18*s);g.stroke();};
  for(let r=0;r<5;r++)for(let c=0;c<4;c++)cloud(70+c*125+(r%2)*60,60+r*100,1);
  g.strokeStyle='#c4963a';g.lineWidth=14;g.strokeRect(10,10,w-20,h-20);
  g.strokeStyle='rgba(255,236,190,.8)';g.lineWidth=3;g.strokeRect(22,22,w-44,h-44);
 });
 WORLD.panelTex=panelTex;
 const panel=mk(new THREE.PlaneGeometry(1.16,1.22),STD('#ffffff',{map:panelTex,roughness:.55}),back,{p:[0,1.15,.052],cast:false});panel.name='panel';WORLD.panel=panel;
 // 꼭대기 장식: 금 구름 + 여의주
 const crest=grp(back,[0,1.92,0]);
 mk(new THREE.TorusGeometry(.5,.05,10,40,PI),gold,crest,{p:[0,-.1,0]});
 mk(new THREE.TorusGeometry(.32,.04,10,30,PI),goldD,crest,{p:[0,-.06,.02]});
 mk(sphereGeo(20),STD('#ff8a3c',{emissive:col('#a33a00'),emissiveIntensity:.35,roughness:.2,metalness:.2}),crest,{p:[0,.3,.02],s:.075});
 for(const s of [-1,1]){mk(sphereGeo(16),gold,crest,{p:[s*.58,-.16,.03],s:[.1,.08,.07]});mk(new THREE.TorusGeometry(.07,.022,8,18,PI*1.4),gold,crest,{p:[s*.6,-.05,.04],r:[0,0,s>0?-.4:PI+.4]});}
 // 팔걸이
 for(const s of [-1,1]){const arm=grp(throne,[s*.6,.48,.02]);mk(new THREE.BoxGeometry(.09,.3,.56),red,arm,{p:[0,.12,0]});mk(new THREE.BoxGeometry(.12,.045,.62),gold,arm,{p:[0,.29,0]});mk(new THREE.TorusGeometry(.055,.025,8,18,PI*1.5),gold,arm,{p:[0,.28,.32],r:[0,PI/2,0]});}
 // 기둥: 붉은 칠 + 금 띠
 const pillarMat=STD('#c22b20',{roughness:.34});
 for(const x of [-1.62,1.62]){const p=grp(root,[x,0,-1.7]);mk(cylGeo(.19,.19,5.2,24),pillarMat,p,{p:[0,2.6,0]});for(const y of [.06,.3,1.6,1.68,3.4,3.48])mk(cylGeo(.205,.205,y<.4?.12:.05,24),gold,p,{p:[0,y,0]});mk(cylGeo(.32,.36,.14,24),STD('#e6dccb',{roughness:.5}),p,{p:[0,.07,0]});}
 // 뒷벽: 붉은 틀 + 밝은 창살
 const latTex=canvasTex(512,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#fffdf6');gr.addColorStop(1,'#eaf6ff');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#b8341f';g.lineWidth=9;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*w/8,0);g.lineTo(i*w/8,h);g.stroke();g.beginPath();g.moveTo(0,i*h/8);g.lineTo(w,i*h/8);g.stroke();}g.strokeStyle='rgba(184,52,31,.75)';g.lineWidth=4;for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.beginPath();g.moveTo(i*w/8,j*h/8+h/16);g.lineTo(i*w/8+w/16,j*h/8);g.lineTo(i*w/8+w/8,j*h/8+h/16);g.lineTo(i*w/8+w/16,j*h/8+h/8);g.closePath();g.stroke();}},{repeat:[3,1.3]});
 const wall=grp(root,[0,0,-2.85]);
 mk(new THREE.PlaneGeometry(9,4.6),STD('#ffffff',{map:latTex,roughness:.8,emissive:col('#fff6e6'),emissiveIntensity:.22}),wall,{p:[0,2.3,0],cast:false,receive:false});
 for(const x of [-3,-1.1,1.1,3])mk(new THREE.BoxGeometry(.16,4.6,.12),pillarMat,wall,{p:[x,2.3,.06],cast:false});
 mk(new THREE.BoxGeometry(9,.22,.16),pillarMat,wall,{p:[0,3.1,.08],cast:false});
 mk(new THREE.BoxGeometry(9,.06,.18),gold,wall,{p:[0,3.24,.09],cast:false});
 mk(new THREE.BoxGeometry(9,.5,.12),STD('#e6dccb'),wall,{p:[0,.25,.06],cast:false});
 // 바닥 구름(멀리)
 const cloudMat=STD('#ffffff',{roughness:1,emissive:col('#ffffff'),emissiveIntensity:.15});
 for(let i=0;i<14;i++){const a=PI*.15+i/13*PI*.7;mk(sphereGeo(14),cloudMat,root,{p:[Math.cos(a)*5.8,-.25,-Math.sin(a)*4.2+.6],s:[rnd(.7,1.2),rnd(.35,.5),rnd(.7,1)],cast:false});}
 // 움직이지 않는 장식은 재질별로 합친다(바닥·피가 묻는 등받이 판은 그대로)
 root.updateMatrixWorld(true);const keep=new Set([floor,panel]),groups=new Map();
 root.traverse(o=>{if(o.isMesh&&!keep.has(o)){const k=o.material.uuid+(o.castShadow?'c':'')+(o.receiveShadow?'r':'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);}});
 const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
 for(const list of groups.values()){if(list.length<2)continue;const g=mergeMeshes(list,inv);const m=new THREE.Mesh(g,list[0].material);m.castShadow=list[0].castShadow;m.receiveShadow=list[0].receiveShadow;for(const o of list)o.removeFromParent();root.add(m);}
 metalEnv(root);
})();

/* ---- 카메라 구도 ----
 * 서 있을 때: 면류관 꼭대기가 위쪽 막대 바로 밑, 허벅지 중간이 화면 맨 아래(도구칸 뒤)에 오게 맞춘다.
 * 넘어질 때: 정해 둔 구도로 부드럽게 옮긴다(옆으로 돌지 않는다). */
const CAM={pos:V3(0,1.3,2.2),look:V3(0,1.3,0),goalPos:V3(0,1.3,2.2),goalLook:V3(0,1.3,0),frame:'stand',kick:V3(),kickV:V3(),shake:0,shakeT:0,fovBase:40,zoom:0,zoomV:0,ready:false};
const FRAMES={
 stand:{top:1.88,bot:.3,botL:.74,z:.18},
 // 넘어진 뒤에는 서 있는 내가 내려다보는 구도(대상 위치·카메라 방향·거리)
 throne:{look:[0,1.0,-.6],dir:[0,.3,1],W:1.05,H:1.45},
 kneel:{look:[0,.8,.05],dir:[0,.45,1],W:1.0,H:1.35},
 floor:{look:[0,.62,-.16],dir:[0,.5,1],W:.95,H:1.02},
 final:{look:[0,.5,-.32],dir:[0,.5,1],W:1,H:1.2},
};
function frameCamera(name,outPos,outLook){
 const w=innerWidth||1,h=innerHeight||1,aspect=w/h,portrait=aspect<1;
 const fr=FRAMES[name]||FRAMES.stand;
 if(fr.look){
  const fov=CAM.fovBase=portrait?50:38,tv=Math.tan(THREE.MathUtils.degToRad(fov/2)),th=tv*aspect;
  const dist=Math.max(fr.W/2/th,fr.H/2/tv);const d=V3(fr.dir[0],fr.dir[1],fr.dir[2]).normalize();
  outLook.set(fr.look[0],fr.look[1],fr.look[2]);outPos.copy(outLook).addScaledVector(d,dist);return;}
 const fov=CAM.fovBase=portrait?40:34,tanH=Math.tan(THREE.MathUtils.degToRad(fov/2));
 const topEl=$('#fight .ftop');const topPx=(topEl?topEl.getBoundingClientRect().bottom:60)+6;
 const top=fr.top,bot=portrait?fr.bot:fr.botL;
 const ndcTop=1-2*topPx/h,ndcBot=-1;
 const dt=(top-bot)/((ndcTop-ndcBot)*tanH);
 const cy=top-ndcTop*dt*tanH;
 outPos.set(0,cy,fr.z+dt);outLook.set(0,cy,fr.z);
}
function setFrame(name,instant){CAM.frame=name;frameCamera(name,CAM.goalPos,CAM.goalLook);if(instant||!CAM.ready){CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);CAM.fov=CAM.fovBase;CAM.ready=true;}}
function fitView(){
 const w=innerWidth||1,h=innerHeight||1;renderer.setSize(w,h,false);
 camera.aspect=w/h;vmCam.aspect=w/h;
 frameCamera(CAM.frame,CAM.goalPos,CAM.goalLook);
 camera.fov=CAM.fovBase;camera.updateProjectionMatrix();vmCam.updateProjectionMatrix();
 if(!CAM.ready){CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);CAM.ready=true;}
 SBLOOD.resize(w,h);
}
/* 카메라 반동(맞은 방향으로 살짝 밀림)과 흔들림 */
function camKick(dir,amount){if(!PREF.shake)amount*=.25;CAM.kickV.addScaledVector(dir,amount*9);}
function camShake(a){if(!PREF.shake)return;CAM.shake=Math.max(CAM.shake,a);}
function camPunchZoom(a){if(!PREF.shake)a*=.3;CAM.zoomV+=a*10;}
function updateCamera(dt){
 const k=1-Math.exp(-dt*(CAM.frame==='stand'?3.2:2.2));
 CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
 // 반동 스프링
 CAM.kickV.addScaledVector(CAM.kick,-260*dt);CAM.kickV.multiplyScalar(Math.exp(-dt*20));CAM.kick.addScaledVector(CAM.kickV,dt);
 CAM.zoomV+=(-200*CAM.zoom)*dt;CAM.zoomV*=Math.exp(-dt*18);CAM.zoom+=CAM.zoomV*dt;
 CAM.shake=Math.max(0,CAM.shake-dt*.9*Math.max(.12,CAM.shake*6));CAM.shakeT+=dt;
 const s=CAM.shake,t=CAM.shakeT;
 const sx=(Math.sin(t*71)+Math.sin(t*113)*.6)*s*.5,sy=(Math.sin(t*83+1)+Math.sin(t*127)*.6)*s*.5;
 camera.position.copy(CAM.pos).add(CAM.kick);camera.position.x+=sx;camera.position.y+=sy;
 _cv.copy(CAM.look).add(CAM.kick).multiplyScalar(1);_cv.x+=sx*.5;_cv.y+=sy*.5;
 camera.lookAt(_cv);
 CAM.fov=CAM.fov==null?CAM.fovBase:damp(CAM.fov,CAM.fovBase,2.5,dt);camera.fov=CAM.fov*(1-clamp(CAM.zoom,-.2,.2));camera.updateProjectionMatrix();
}
const _cv=V3();
/* ===== 5. 피 =====
 * 튀는 피(방울) · 몸을 타고 흐르는 피(줄기) · 떨어지는 피(낙수) · 고이는 피(바닥) · 화면에 묻는 피 · 멍/상처 자국 */
const BLOOD=(()=>{
 const red=STD('#6a0610',{roughness:.14});
 const tearMat=STD('#8fcaf2',{roughness:.02,metalness:.2,transparent:true,opacity:.86,depthWrite:false,envMapIntensity:1.6,emissive:col('#3f7fb0'),emissiveIntensity:.3});
 const dustMat=STD('#e8dfcf',{roughness:1,transparent:true,opacity:.38,depthWrite:false});
 const spitMat=STD('#eef3f6',{roughness:.05,transparent:true,opacity:.55,depthWrite:false});
 const beadMat=STD('#76080f',{roughness:.1});
 const rc=new THREE.Raycaster(),nm3=new THREE.Matrix3();
 const v1=V3(),v2=V3(),v3=V3(),v4=V3(),v5=V3(),q1=new THREE.Quaternion();
 let E=null;
 /* ---- 방울(파티클) ---- */
 const MAX=560,dropGeo=new THREE.SphereGeometry(1,7,5);
 const mkPool=(mat,n)=>{const m=new THREE.InstancedMesh(dropGeo,mat,n);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.castShadow=false;scene.add(m);return m;};
 const pools={blood:mkPool(red,MAX),dust:mkPool(dustMat,140),spit:mkPool(spitMat,120)};
 const parts={blood:[],dust:[],spit:[]};
 for(const k in parts){const n=pools[k].count;for(let i=0;i<n;i++)parts[k].push({p:V3(),v:V3(),life:0,age:0,size:.01,on:false});}
 const cursor={blood:0,dust:0,spit:0};
 const dummy=new THREE.Object3D(),ZERO_M=new THREE.Matrix4().makeScale(0,0,0),dirtyP={blood:true,dust:true,spit:true};
 function emit(kind,p,v,size,life){const arr=parts[kind];const d=arr[cursor[kind]++%arr.length];d.p.copy(p);d.v.copy(v);d.size=size;d.life=life;d.age=0;d.on=true;return d;}
 function spray(p,dir,n,o={}){
  const kind=PREF.blood?(o.kind||'blood'):'dust';
  for(let i=0;i<n;i++){const sp=rnd(o.min||.8,o.max||3.2);v1.copy(dir).multiplyScalar(sp).add(v2.set(rnd(-1,1),rnd(-.4,1),rnd(-1,1)).multiplyScalar(o.spread||1));
   if(kind==='dust'){v1.multiplyScalar(.3);emit('dust',p,v1,rnd(.008,.018),rnd(.3,.55));}else emit(kind,p,v1,kind==='spit'?rnd(.0018,.004):rnd(o.smin||.0025,o.smax||.0065),rnd(.6,1.4));}
 }
 /* ---- 바닥·옥좌 등받이에 그리기 ---- */
 const FL={x0:-1.6,z0:-1.45,w:3.2,h:3.2,res:1024};
 const flTex=canvasTex(FL.res,FL.res,()=>{});const flCtx=flTex.userData.ctx;
 const flMat=STD('#ffffff',{map:flTex,transparent:true,roughness:.1,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const flMesh=mk(new THREE.PlaneGeometry(FL.w,FL.h),flMat,scene,{p:[FL.x0+FL.w/2,.004,FL.z0+FL.h/2],r:[-PI/2,0,0],cast:false});flMesh.renderOrder=1;
 const pool=new Float32Array(64*64);let flDirty=false;
 function floorUV(x,z){return [(x-FL.x0)/FL.w*FL.res,(z-FL.z0)/FL.h*FL.res];}
 function blob(g,x,y,r,col_,a){g.globalAlpha=a;g.fillStyle=col_;g.beginPath();g.ellipse(x,y,r,r*rnd(.75,1),rnd(0,PI),0,TAU);g.fill();g.globalAlpha=1;}
 function paintFloor(x,z,vol,impact){
  if(!PREF.blood)return;const [u,v]=floorUV(x,z);if(u<0||v<0||u>FL.res||v>FL.res)return;
  const ci=clamp(Math.floor(u/16),0,63)+clamp(Math.floor(v/16),0,63)*64;pool[ci]+=vol;
  const r=clamp(Math.sqrt(pool[ci])*95,3,70);
  blob(flCtx,u+rnd(-3,3),v+rnd(-3,3),r*rnd(.6,1),'#5c0710',.55);blob(flCtx,u,v,r*.55,'#7a0b14',.45);
  if(impact>2.5){for(let i=0;i<4;i++){const a=rnd(0,TAU),d=rnd(6,22);blob(flCtx,u+Math.cos(a)*d,v+Math.sin(a)*d,rnd(1.5,4),'#6a0812',.8);}}
  flDirty=true;
 }
 function poolUnder(x,z,amount){if(!PREF.blood||amount<=0)return;const [u,v]=floorUV(x,z);const ci=clamp(Math.floor(u/16),0,63)+clamp(Math.floor(v/16),0,63)*64;pool[ci]+=amount;const r=clamp(Math.sqrt(pool[ci])*90,4,190);blob(flCtx,u+rnd(-6,6),v+rnd(-6,6),r,'#5a0710',.18);flDirty=true;}
 // 등받이 판
 let pnCanvas=null,pnCtx=null,pnSaved=null;
 function panelInit(){if(pnCtx)return;pnCanvas=WORLD.panelTex.userData.canvas;pnCtx=WORLD.panelTex.userData.ctx;pnSaved=document.createElement('canvas');pnSaved.width=pnCanvas.width;pnSaved.height=pnCanvas.height;pnSaved.getContext('2d').drawImage(pnCanvas,0,0);}
 function paintPanel(wp,size){
  if(!PREF.blood)return false;panelInit();const pl=WORLD.panel;pl.updateWorldMatrix(true,false);const l=pl.worldToLocal(v1.copy(wp));
  if(Math.abs(l.x)>.58||Math.abs(l.y)>.61||Math.abs(l.z)>.06)return false;
  const u=(l.x/1.16+.5)*pnCanvas.width,v=(.5-l.y/1.22)*pnCanvas.height;
  blob(pnCtx,u,v,size*pnCanvas.width,'#6b0812',.82);
  if(size>.013&&Math.random()<.22){const len=rnd(6,28);pnCtx.globalAlpha=.7;pnCtx.fillStyle='#5e0610';pnCtx.fillRect(u-1.5,v,3,len);blob(pnCtx,u,v+len,3,'#5e0610',.8);pnCtx.globalAlpha=1;}
  WORLD.panelTex.needsUpdate=true;return true;
 }
 /* ---- 몸 표면에 붙이기(투영) ---- */
 function allFlow(){if(!E)return [];if(!E._flowAll){E._flowAll=[];for(const k in E.flow)E._flowAll.push(...E.flow[k]);}return E._flowAll;}
 function visibleChain(o){for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;}
 const _pa=V3(),_pb=V3(),_pm=V3(),_pla=V3(),_plb=V3(),_pinv=new THREE.Matrix4(),_pn3=new THREE.Matrix3(),_ph={t:0,normal:V3()},_sph=new THREE.Sphere();
 let frameNo=0;
 function wsphere(m){const u=m.userData;if(u.wsF!==frameNo||!u.ws){if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();u.ws=(u.ws||new THREE.Sphere()).copy(m.geometry.boundingSphere).applyMatrix4(m.matrixWorld);u.wsF=frameNo;}return u.ws;}
 function project(pW,nW,reach=.06,meshes){
  const a=_pa.copy(pW).addScaledVector(nW,reach),b=_pb.copy(pW).addScaledVector(nW,-reach*1.4);
  const mid=_pm.addVectors(a,b).multiplyScalar(.5),rad=reach*1.3+.003;
  let best=null,bestD=1e9;
  for(const m of (meshes||allFlow())){
   if(!m.parent||m.userData.detached)continue;const s=wsphere(m);if(s.center.distanceTo(mid)>s.radius+rad)continue;if(!visibleChain(m))continue;
   _pinv.copy(m.matrixWorld).invert();_pla.copy(a).applyMatrix4(_pinv);_plb.copy(b).applyMatrix4(_pinv);
   if(!FASTRAY.segment(FASTRAY.grid(m.geometry),_pla,_plb,_ph))continue;
   const pt=_pla.lerp(_plb,_ph.t).applyMatrix4(m.matrixWorld),d=pt.distanceTo(a);if(d>=bestD)continue;
   _pn3.getNormalMatrix(m.matrixWorld);const n=_ph.normal.clone().applyMatrix3(_pn3).normalize();if(n.dot(nW)<-.2)continue;
   bestD=d;best={point:pt.clone(),normal:n,obj:m,seg:m.userData.seg};
  }
  return best;
 }
 /* ---- 줄기 자국(부위별로 하나의 메시) ---- */
 const banks={},bankList=[];
 function bank(seg,kind){
  const key=seg+':'+kind;if(banks[key]&&banks[key].count<banks[key].MAXP-80)return banks[key];
  const bone=E.bones[seg];if(!bone)return null;
  const MAXP=1400,P=new Float32Array(MAXP*2*3),N=new Float32Array(MAXP*2*3),I=new Uint32Array(MAXP*6);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('normal',new THREE.BufferAttribute(N,3).setUsage(THREE.DynamicDrawUsage));g.setIndex(new THREE.BufferAttribute(I,1).setUsage(THREE.DynamicDrawUsage));g.setDrawRange(0,0);
  const m=new THREE.Mesh(g,kind==='tear'?tearMat:red);m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.renderOrder=2;m.userData.gore=kind!=='tear';bone.add(m);
  const b={seg,kind,bone,mesh:m,g,P,N,I,count:0,icount:0,MAXP};bankList.push(b);return banks[key]=b;
 }
 function bankWrite(b,strip,j){
  const pts=strip.pts,L=pts.length,i=pts[j],pa=b.pts[pts[Math.max(0,j-1)]],pb=b.pts[pts[Math.min(L-1,j+1)]],q=b.pts[i];
  const d=v1.subVectors(pb.p,pa.p);if(d.lengthSq()<1e-12)d.set(0,-1,0);d.normalize();const s=v2.crossVectors(q.n,d);if(s.lengthSq()<1e-12)s.set(1,0,0);s.normalize();
  const tip=L-1-j,w=q.w*(j===0?.6:tip===0?.45:tip===1?.8:1),off=.0018,k=i*6,P=b.P,N=b.N;
  P[k]=q.p.x+s.x*w+q.n.x*off;P[k+1]=q.p.y+s.y*w+q.n.y*off;P[k+2]=q.p.z+s.z*w+q.n.z*off;
  P[k+3]=q.p.x-s.x*w+q.n.x*off;P[k+4]=q.p.y-s.y*w+q.n.y*off;P[k+5]=q.p.z-s.z*w+q.n.z*off;
  N[k]=N[k+3]=q.n.x;N[k+1]=N[k+4]=q.n.y;N[k+2]=N[k+5]=q.n.z;
 }
 function bankPush(b,strip,lp,ln,w){
  if(b.count>=b.MAXP)return false;b.pts=b.pts||[];const i=b.count++;b.pts[i]={p:lp.clone(),n:ln.clone(),w};strip.pts.push(i);
  const L=strip.pts.length;
  if(L>1){const a=strip.pts[L-2],I=b.I,k=b.icount;I[k]=a*2;I[k+1]=a*2+1;I[k+2]=i*2;I[k+3]=a*2+1;I[k+4]=i*2+1;I[k+5]=i*2;b.icount+=6;b.g.setDrawRange(0,b.icount);b.g.index.needsUpdate=true;}
  for(let j=Math.max(0,L-4);j<L;j++)bankWrite(b,strip,j);
  b.g.attributes.position.needsUpdate=true;b.g.attributes.normal.needsUpdate=true;return true;
 }
 /* ---- 흐르는 줄기 ---- */
 const rivs=[],drips=[],wounds=[];
 const TIPMAX=90,tips=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),beadMat,TIPMAX);tips.instanceMatrix.setUsage(THREE.DynamicDrawUsage);tips.frustumCulled=false;tips.castShadow=false;scene.add(tips);
 const beads=[];// 멈춘 줄기 끝 방울
 function startRiv(seg,pW,nW,o={}){
  if(!E||rivs.length>=34)return null;if(o.kind!=='tear'&&!PREF.blood)return null;
  const bone=E.bones[seg];if(!bone)return null;const b=bank(seg,o.kind||'blood');if(!b)return null;
  bone.updateWorldMatrix(true,false);
  const r={seg,bone,b,strip:{pts:[]},lp:bone.worldToLocal(pW.clone()),ln:nW.clone().transformDirection(_inv(bone)).normalize(),len:0,maxLen:o.maxLen||rnd(.1,.42),speed:o.speed||rnd(.09,.16),w:o.w||rnd(.0032,.0052),kind:o.kind||'blood',lastP:pW.clone(),wob:rnd(0,TAU),wobAmt:rnd(.03,.12),acc:0,dead:false};
  bankPush(b,r.strip,r.lp,r.ln,r.w);rivs.push(r);return r;
 }
 const _invM=new THREE.Matrix4();function _inv(bone){return _invM.copy(bone.matrixWorld).invert();}
 function stepRiv(r,dt){
  const bone=r.bone;bone.updateWorldMatrix(true,false);
  const P=v1.copy(r.lp).applyMatrix4(bone.matrixWorld),N=v2.copy(r.ln).transformDirection(bone.matrixWorld);
  if(N.y<-.82){r.why='under';endRiv(r,true,P);return;}
  const g=v3.set(0,-1,0);g.addScaledVector(N,-g.dot(N));const slope=g.length();
  if(slope<.05){r.len+=.002;if(r.len>r.maxLen)endRiv(r,false,P);return;}
  g.normalize();r.wob+=dt*rnd(1.2,2.6);const side=v4.crossVectors(N,g).normalize();g.addScaledVector(side,Math.sin(r.wob)*r.wobAmt).normalize();
  const ds=r.speed*dt*(.35+.65*slope)*(1-r.len/r.maxLen*.6);
  const np=v5.copy(P).addScaledVector(g,ds);
  const hit=project(np,N,.05);
  if(!hit){r.why='nohit';endRiv(r,true,P);return;}
  if(hit.seg!==r.seg){ // 다른 부위로 넘어감: 거기서 이어 흐른다
   r.why='seg:'+hit.seg;endRiv(r,false,P,true);if(r.len<r.maxLen-.02)startRiv(hit.seg,hit.point,hit.normal,{kind:r.kind,maxLen:r.maxLen-r.len,speed:r.speed,w:r.w});return;}
  r.lp.copy(hit.point);bone.worldToLocal(r.lp);r.ln.copy(hit.normal).transformDirection(_inv(bone)).normalize();
  r.len+=ds;
  if(hit.point.distanceTo(r.lastP)>.0042){r.lastP.copy(hit.point);if(!bankPush(r.b,r.strip,r.lp,r.ln,r.w)){endRiv(r,false,P);return;}}
  if(r.len>=r.maxLen)endRiv(r,false,hit.point);
 }
 function endRiv(r,drip,P,silent){
  if(r.dead)return;r.dead=true;
  if(!silent&&r.kind!=='tear'){beads.push({bone:r.bone,lp:r.lp.clone(),ln:r.ln.clone(),s:r.w*1.35});if(beads.length>60)beads.shift();}
  if(drip&&r.kind!=='tear'){addDrip(r.seg,r.bone,r.lp.clone(),r.src);}
  if(drip&&r.kind==='tear'&&P){emit('spit',P,V3(0,-.2,0),.004,.8);}
 }
 function addDrip(seg,bone,lp,src){
  for(const d of drips)if(d.bone===bone&&d.lp.distanceToSquared(lp)<.0009){d.feed=Math.min(4,d.feed+1);return;}
  drips.push({seg,bone,lp,feed:1.2,t:rnd(.05,.3)});if(drips.length>26)drips.shift();
 }
 /* ---- 상처(계속 피가 나는 곳) ---- */
 function addWound(seg,pW,nW,o){
  if(!E)return null;const bone=E.bones[seg];if(!bone)return null;bone.updateWorldMatrix(true,false);
  // 같은 자리를 또 찌르면 다시 터진다
  for(const w of wounds){if(w.seg===seg){const wp=v1.copy(w.lp).applyMatrix4(bone.matrixWorld);if(wp.distanceTo(pW)<.03){w.rate0=Math.min(w.rate0*1.35+o.rate*.6,.09);w.age=0;w.artery=w.artery||o.artery;w.nextRiv=0;return w;}}}
  const w={seg,bone,lp:bone.worldToLocal(pW.clone()),ln:nW.clone().transformDirection(_inv(bone)).normalize(),rate0:o.rate,tau:o.tau||28,age:0,artery:!!o.artery,nextRiv:0,nextSpurt:.1,kind:o.kind||'hole',spread:o.spread||0,line:o.line||null};
  wounds.push(w);if(wounds.length>40)wounds.shift();return w;
 }
 let lostRaw=0,heart=0;const LOSTMAX=4.4;
 function updateWounds(dt){
  if(!E)return;heart+=dt*(1.3+E.mood*.9);
  const beat=Math.sin(heart*TAU)>.82;
  let total=0;
  for(const w of wounds){
   w.age+=dt;const rate=w.rate0*Math.exp(-w.age/w.tau)+(w.age<240?w.rate0*.04:0);total+=rate;lostRaw+=rate*dt*.14;
   if(!PREF.blood)continue;
   w.bone.updateWorldMatrix(true,false);
   w.nextRiv-=dt;if(w.nextRiv<=0&&rate>.0006){
    w.nextRiv=clamp(.0055/rate,.18,4)*rnd(.7,1.3);
    let pW=v1.copy(w.lp),nW=v2.copy(w.ln);
    if(w.line){const t=Math.random();pW.copy(w.line[0]).lerp(w.line[1],t);}
    pW.applyMatrix4(w.bone.matrixWorld);nW.transformDirection(w.bone.matrixWorld);
    pW.addScaledVector(v3.set(rnd(-1,1),rnd(-1,1),rnd(-1,1)),w.spread);
    const pr=project(pW,nW,.05);
    if(pr){const r=startRiv(pr.seg||w.seg,pr.point,pr.normal,{w:rnd(.0034,.006)*(rate>.015?1.25:1),speed:rnd(.08,.15)*(rate>.02?1.4:1),maxLen:rnd(.12,.5)*(rate>.015?1.3:1)});if(r)r.src=w;}
   }
   if(w.artery){w.nextSpurt-=dt;if(beat&&w.nextSpurt<=0&&rate>.004){w.nextSpurt=.35;
    const pW2=v1.copy(w.lp).applyMatrix4(w.bone.matrixWorld),nW2=v2.copy(w.ln).transformDirection(w.bone.matrixWorld);
    const n=Math.round(clamp(rate*500,4,18));for(let i=0;i<n;i++){v3.copy(nW2).multiplyScalar(rnd(1.2,2.6)*clamp(rate*60,.5,1.6)).add(v4.set(rnd(-.25,.25),rnd(0,.5),rnd(-.25,.25)));emit('blood',pW2,v3,rnd(.004,.009),1.4);}
    AUDIO.spurt(clamp(rate*40,.2,1));}}
  }
  // 오래된 상처는 정리
  for(let i=wounds.length-1;i>=0;i--)if(wounds[i].age>200)wounds.splice(i,1);
  return total;
 }
 /* ---- 상처 자국 텍스처 ---- */
 const T={
  bruise:canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(92,30,96,.72)');r.addColorStop(.45,'rgba(130,40,86,.5)');r.addColorStop(.75,'rgba(176,58,70,.22)');r.addColorStop(1,'rgba(176,58,70,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
  red:canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(214,52,62,.6)');r.addColorStop(.6,'rgba(220,70,70,.28)');r.addColorStop(1,'rgba(220,70,70,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
    dent:canvasTex(128,128,(g,w,h)=>{
   const halo=g.createRadialGradient(64,64,18,64,64,62);
   halo.addColorStop(0,'rgba(86,24,52,.34)');
   halo.addColorStop(.62,'rgba(116,40,70,.24)');
   halo.addColorStop(1,'rgba(116,40,70,0)');
   g.fillStyle=halo;g.fillRect(0,0,w,h);

   g.save();g.translate(64,64);g.scale(1,.8);
   const pit=g.createRadialGradient(-8,-9,2,0,0,45);
   pit.addColorStop(0,'rgba(40,8,20,.86)');
   pit.addColorStop(.46,'rgba(76,22,43,.7)');
   pit.addColorStop(.78,'rgba(133,62,76,.38)');
   pit.addColorStop(1,'rgba(133,62,76,0)');
   g.fillStyle=pit;g.beginPath();g.arc(0,0,45,0,TAU);g.fill();

   g.lineCap='round';
   g.lineWidth=8;g.strokeStyle='rgba(43,8,18,.5)';
   g.beginPath();g.arc(0,0,35,PI*1.05,PI*1.95);g.stroke();
   g.lineWidth=6;g.strokeStyle='rgba(245,147,132,.42)';
   g.beginPath();g.arc(0,0,35,.08*PI,.92*PI);g.stroke();
   g.restore();
  }),
  
  
  hole:canvasTex(128,128,(g,w,h)=>{
   const halo=g.createRadialGradient(64,64,16,64,64,63);
   halo.addColorStop(0,'rgba(116,5,16,.62)');
   halo.addColorStop(.62,'rgba(104,6,18,.34)');
   halo.addColorStop(1,'rgba(104,6,18,0)');
   g.fillStyle=halo;g.fillRect(0,0,w,h);

   const jag=(r,j,fill)=>{
    g.beginPath();
    for(let i=0;i<32;i++){
     const a=i/32*TAU,rr=r+rnd(-j,j);
     const x=64+Math.cos(a)*rr,y=64+Math.sin(a)*rr;
     if(i)g.lineTo(x,y);else g.moveTo(x,y);
    }
    g.closePath();g.fillStyle=fill;g.fill();
   };

   jag(39,5,'rgba(112,6,17,.98)');
   g.lineCap='round';
   g.lineWidth=6;g.strokeStyle='rgba(235,79,84,.72)';
   g.beginPath();g.arc(64,66,34,.08*PI,.92*PI);g.stroke();
   g.lineWidth=7;g.strokeStyle='rgba(46,0,6,.72)';
   g.beginPath();g.arc(64,61,33,1.08*PI,1.92*PI);g.stroke();

   jag(26,3,'rgba(14,0,2,1)');
   const core=g.createRadialGradient(58,58,1,64,64,25);
   core.addColorStop(0,'rgba(0,0,0,1)');
   core.addColorStop(.68,'rgba(8,0,1,1)');
   core.addColorStop(1,'rgba(38,0,5,.98)');
   g.fillStyle=core;g.beginPath();g.arc(64,64,25,0,TAU);g.fill();
  }),




  cut:canvasTex(256,96,(g,w,h)=>{
   const cy=h/2,N=32,top=[],bot=[];
   for(let i=0;i<=N;i++){
    const q=i/N,e=Math.sin(q*PI),x=4+q*(w-8);
    top.push([x,cy-e*rnd(25,34)]);
    bot.push([x,cy+e*rnd(25,35)]);
   }
   const fillPoly=(a,b,fill)=>{
    g.beginPath();
    for(let i=0;i<a.length;i++){
     if(i)g.lineTo(a[i][0],a[i][1]);else g.moveTo(a[i][0],a[i][1]);
    }
    for(let i=b.length-1;i>=0;i--)g.lineTo(b[i][0],b[i][1]);
    g.closePath();g.fillStyle=fill;g.fill();
   };

   const lip=g.createLinearGradient(0,8,0,h-8);
   lip.addColorStop(0,'rgba(72,0,8,.98)');
   lip.addColorStop(.42,'rgba(184,26,38,.98)');
   lip.addColorStop(.58,'rgba(112,3,13,.98)');
   lip.addColorStop(1,'rgba(229,65,70,.86)');
   fillPoly(top,bot,lip);

   const it=[],ib=[];
   for(let i=0;i<=N;i++){
    const q=i/N,e=Math.sin(q*PI),x=12+q*(w-24);
    it.push([x,cy-e*rnd(8,12)]);
    ib.push([x,cy+e*rnd(9,13)]);
   }
   fillPoly(it,ib,'rgba(12,0,2,1)');

   g.lineCap='round';
   g.lineWidth=4;g.strokeStyle='rgba(244,99,99,.78)';
   g.beginPath();g.moveTo(18,cy+2);g.bezierCurveTo(72,cy+17,184,cy+17,w-18,cy+2);g.stroke();
   g.lineWidth=3;g.strokeStyle='rgba(48,0,7,.82)';
   g.beginPath();g.moveTo(18,cy-2);g.bezierCurveTo(72,cy-17,184,cy-17,w-18,cy-2);g.stroke();
  }),



  soak:canvasTex(128,128,(g,w,h)=>{for(let i=0;i<9;i++){const x=64+rnd(-22,22),y=64+rnd(-22,22),r=rnd(18,36);const gr=g.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,'rgba(108,8,18,.5)');gr.addColorStop(.7,'rgba(108,8,18,.32)');gr.addColorStop(1,'rgba(108,8,18,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}}),
  scrape:canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,58);r.addColorStop(0,'rgba(196,40,46,.55)');r.addColorStop(1,'rgba(196,40,46,0)');g.fillStyle=r;g.fillRect(0,0,w,h);g.strokeStyle='rgba(150,10,22,.6)';g.lineWidth=2;for(let i=0;i<10;i++){g.beginPath();const y=rnd(36,92);g.moveTo(rnd(24,44),y);g.lineTo(rnd(84,104),y+rnd(-6,6));g.stroke();}}),
 };


 const DM={};
 const DORDER={soak:2,bruise:3,red:3,scrape:3,dent:4,cut:6,hole:7};
 const DLIFT={soak:.0007,bruise:.001,red:.001,scrape:.0011,dent:.00135,cut:.00175,hole:.002};

 for(const k in T){
  const opt={
   map:T[k],
   transparent:true,
   depthWrite:false,
   depthTest:true,
   alphaTest:(k==='hole'||k==='cut')?.025:0,
   polygonOffset:true,
   polygonOffsetFactor:-4,
   polygonOffsetUnits:-4
  };

  if(k==='hole'){
   DM[k]=new THREE.MeshBasicMaterial(opt);
  }else{
   opt.roughness=k==='cut'?.18:k==='soak'?.35:.55;
   DM[k]=new THREE.MeshStandardMaterial(opt);
  }
 }




 const decals=[];
 const DECAL_MAX=96;
 const DECAL_KEEP=new Set(['hole','cut']);
 function decal(type,seg,pW,nW,size,o={}){
  if(!E)return null;if(!PREF.blood&&(type==='hole'||type==='cut'||type==='soak'))type='bruise';
  const bone=E.bones[seg];if(!bone)return null;bone.updateWorldMatrix(true,false);
  const n=nW.clone().normalize(),u=V3().crossVectors(n,Math.abs(n.y)>.9?V3(1,0,0):V3(0,1,0)).normalize(),v=V3().crossVectors(n,u);
  const ang=o.angle!=null?o.angle:rnd(0,TAU);const cu=u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v,Math.sin(ang)),cv=v.clone().multiplyScalar(Math.cos(ang)).addScaledVector(u,-Math.sin(ang));
  const sx=size*(o.aspect||1),sy=size,G=o.grid||5,pos=[],uv=[],idx=[],inv=_inv(bone).clone();
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const a=i/G-.5,b=j/G-.5;const guess=pW.clone().addScaledVector(cu,a*sx*2).addScaledVector(cv,b*sy*2);
   const hit=project(guess,n,.05,o.meshes),hp=hit?hit.point:guess,hn=hit?hit.normal:n;
const p=hp.clone().addScaledVector(hn,DLIFT[type]||.0012);p.applyMatrix4(inv);pos.push(p.x,p.y,p.z);uv.push(i/G,j/G);}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;idx.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,DM[type]);m.renderOrder=DORDER[type]||3;m.castShadow=false;m.receiveShadow=true;m.userData.gore=type==='hole'||type==='cut'||type==='soak';m.userData.decal=type;m.userData.seg=seg;m.userData.center=bone.worldToLocal(pW.clone());bone.add(m);
  // 뒤집힌 법선이면 뒤집기
  const nn=g.attributes.normal;if(nn.count){const t=V3(nn.getX(0),nn.getY(0),nn.getZ(0)).transformDirection(bone.matrixWorld);if(t.dot(n)<0){idx.reverse();g.setIndex(idx);g.computeVertexNormals();}}
  if(o.grow){m.scale.setScalar(.01);m.userData.grow={t:0,dur:o.grow,center:bone.worldToLocal(pW.clone())};}
  decals.push(m);

  if(decals.length>DECAL_MAX){
   const low=decals.findIndex(
    x=>!DECAL_KEEP.has(x.userData.decal)
   );

   const old=decals.splice(low>=0?low:0,1)[0];
   old.removeFromParent();
   old.geometry.dispose();
  }
  return m;
 }

 /* ---- 벌어진 상처의 입체 테두리 ---- */
 const rimGeo=GEO.woundRim||(GEO.woundRim=new THREE.TorusGeometry(.82,.18,8,32));
 const rimMats={
  hole:STD('#68101a',{roughness:.28}),
  cut:STD('#981421',{roughness:.22})
 };
 const rims=[];

 function rim(type,seg,pW,nW,rx,ry,angle=0){
  if(!E||!PREF.blood)return null;
  const bone=E.bones[seg];if(!bone)return null;
  bone.updateWorldMatrix(true,false);

  const n=nW.clone().normalize();
  const u=V3().crossVectors(
   n,Math.abs(n.y)>.9?V3(1,0,0):V3(0,1,0)
  ).normalize();
  const v=V3().crossVectors(n,u).normalize();
  const ca=Math.cos(angle),sa=Math.sin(angle);
  const cu=u.clone().multiplyScalar(ca).addScaledVector(v,sa);
  const cv=v.clone().multiplyScalar(ca).addScaledVector(u,-sa);

  const qW=new THREE.Quaternion().setFromRotationMatrix(
   new THREE.Matrix4().makeBasis(cu,cv,n)
  );
  const qB=new THREE.Quaternion();
  bone.getWorldQuaternion(qB).invert();

  const m=mk(rimGeo,rimMats[type]||rimMats.cut,bone,{
   cast:false,receive:false
  });
  m.position.copy(
   bone.worldToLocal(pW.clone().addScaledVector(n,.0025))
  );
  m.quaternion.copy(qB.multiply(qW));
  m.scale.set(rx,ry,Math.min(rx,ry)*.7);
  m.renderOrder=8;
  m.userData.gore=true;

  rims.push(m);
  if(rims.length>32)rims.shift().removeFromParent();
  return m;
 }


 /* ---- 혹(부어오름) ---- */
 const lumpMats=[STD('#efa585',{roughness:.48}),STD('#df8f86',{roughness:.48}),STD('#c07a8a',{roughness:.48})];
 const lumps=[];
 function lump(seg,pW,nW,size,level=0){
  if(!E)return false;const bone=E.bones[seg];if(!bone)return false;bone.updateWorldMatrix(true,false);
  for(const l of lumps){if(l.bone===bone){const wp=l.mesh.getWorldPosition(v1);if(wp.distanceTo(pW)<.045){if(l.target<.024)l.target=Math.min(.024,l.target+.004);if(l.level<2&&Math.random()<.4){l.level++;l.mesh.material=lumpMats[l.level];}return true;}}}
  if(lumps.length>=5)return false;
  const m=mk(sphereGeo(20),lumpMats[level],bone,{cast:false});const lp=bone.worldToLocal(pW.clone().addScaledVector(nW,-size*.62));m.position.copy(lp);
  const ln=nW.clone().transformDirection(_inv(bone)).normalize();m.quaternion.setFromUnitVectors(V3(0,0,1),ln);m.scale.set(.001,.001,.001);
  lumps.push({mesh:m,bone,target:Math.min(size,.02),level,t:0});return true;
 }
 /* ---- 화면에 묻는 피 ---- */
 const sc=$('#sblood'),sx=sc.getContext('2d');let sw=1,sh=1,sdpr=1;const splats=[];
 const SB={
  resize(w,h){sdpr=Math.min(1.5,window.devicePixelRatio||1);sw=w;sh=h;sc.width=Math.round(w*sdpr);sc.height=Math.round(h*sdpr);sx.setTransform(sdpr,0,0,sdpr,0,0);},
  add(x,y,size){if(!PREF.blood)return;if(splats.length>14)splats.shift();
   const blobs=[],sats=[],runs=[];
   const nb=Math.round(rnd(5,9));for(let i=0;i<nb;i++){const a=rnd(0,TAU),d=rnd(0,.42)*size;blobs.push([Math.cos(a)*d,Math.sin(a)*d*.85,rnd(.28,.55)*size]);}
   const ns=Math.round(rnd(6,14));for(let i=0;i<ns;i++){const a=rnd(0,TAU),d=rnd(.75,2.1)*size;sats.push([Math.cos(a)*d,Math.sin(a)*d,rnd(.05,.17)*size,a,rnd(1,2.6)]);}
   const nr=Math.round(rnd(0,2.6));for(let i=0;i<nr;i++)runs.push({dx:rnd(-.45,.45)*size,y0:rnd(.1,.4)*size,len:0,max:rnd(1,3.2)*size,sp:rnd(.2,.55)*size,w:rnd(.09,.16)*size});
   splats.push({x,y,size,blobs,sats,runs,age:0,life:rnd(3.4,5)});},
  update(dt){
   if(!splats.length){if(SB._dirty){sx.clearRect(0,0,sw,sh);SB._dirty=false;}return;}
   sx.clearRect(0,0,sw,sh);SB._dirty=true;
   for(let i=splats.length-1;i>=0;i--){const s=splats[i];s.age+=dt;if(s.age>s.life){splats.splice(i,1);continue;}
    const a=s.age<.06?s.age/.06:1-smooth((s.age-s.life*.5)/(s.life*.5)),grow=s.age<.06?.6+.4*s.age/.06:1;
    // 테두리(짙게) → 속(조금 밝게) → 위쪽 반사
    for(const [c,k,al] of [['#4a040b',1.12,.95],['#86101a',1,.92]]){sx.globalAlpha=a*al;sx.fillStyle=c;
     for(const b of s.blobs){sx.beginPath();sx.arc(s.x+b[0]*grow,s.y+b[1]*grow,b[2]*k*grow,0,TAU);sx.fill();}
     for(const t of s.sats){sx.save();sx.translate(s.x+t[0]*grow,s.y+t[1]*grow);sx.rotate(t[3]);sx.beginPath();sx.ellipse(0,0,t[2]*t[4]*k,t[2]*k,0,0,TAU);sx.fill();sx.restore();}
     for(const r of s.runs){if(k===1)r.len=Math.min(r.max,r.len+r.sp*dt*(1-r.len/r.max*.7));const x=s.x+r.dx,y=s.y+r.y0;sx.fillRect(x-r.w*k/2,y,r.w*k,r.len);sx.beginPath();sx.arc(x,y+r.len,r.w*.75*k,0,TAU);sx.fill();}}
    sx.globalAlpha=a*.28;sx.fillStyle='#ffe6e6';const b0=s.blobs[0];sx.beginPath();sx.ellipse(s.x+b0[0]-b0[2]*.35,s.y+b0[1]-b0[2]*.4,b0[2]*.3,b0[2]*.18,-.6,0,TAU);sx.fill();
   }
   sx.globalAlpha=1;
  },
  clear(){splats.length=0;sx.clearRect(0,0,sw,sh);},
 };
 /* ---- 매 프레임 ---- */
 let rivAcc=0;
 function update(dt){
  // 방울
  for(const kind in parts){const arr=parts[kind],pl=pools[kind];let used=0;
   for(let i=0;i<arr.length;i++){const d=arr[i];
    if(d.on){d.age+=dt;if(d.age>d.life)d.on=false;}
    if(!d.on){if(!d.zero){d.zero=true;pl.setMatrixAt(i,ZERO_M);dirtyP[kind]=true;}continue;}
    d.zero=false;dirtyP[kind]=true;
    used++;
    if(kind==='dust'){d.v.multiplyScalar(Math.exp(-dt*3));d.v.y+=.25*dt;}else d.v.y-=9.8*dt;
    d.p.addScaledVector(d.v,dt);
    if(kind!=='dust'){
     if(d.p.y<.01){d.on=false;if(kind==='blood')paintFloor(d.p.x,d.p.z,d.size*d.size*30,d.v.length());else if(Math.random()<.2)AUDIO.drip(.3);continue;}
     if(kind==='blood'&&d.v.z<0&&d.p.z<-1.05&&d.p.z>-1.16){if(paintPanel(d.p,d.size*1.6)){d.on=false;continue;}}
     // 화면 쪽으로 날아온 피는 화면에 묻는다
     if(kind==='blood'&&d.v.z>0&&d.p.z>camera.position.z-.42){d.on=false;const s=v1.copy(d.p).project(camera);if(Math.abs(s.x)<1&&Math.abs(s.y)<1)SB.add((s.x*.5+.5)*sw,(-s.y*.5+.5)*sh,rnd(10,26));continue;}
    }
    const sp=d.v.length(),s=kind==='dust'?d.size*(1+d.age*2.2)*(1-d.age/d.life):d.size;
    dummy.position.copy(d.p);if(kind==='dust'||sp<.01){dummy.quaternion.identity();dummy.scale.setScalar(s);}else{dummy.quaternion.setFromUnitVectors(UP,v1.copy(d.v).divideScalar(sp));dummy.scale.set(s,s*(1+Math.min(2.6,sp*.5)),s);}
    dummy.updateMatrix();pl.setMatrixAt(i,dummy.matrix);
   }
   if(dirtyP[kind]){pl.instanceMatrix.needsUpdate=true;dirtyP[kind]=false;}pl.visible=used>0;
  }
  if(!E)return;
  const bleed=updateWounds(dt)||0;
  // 줄기는 초당 30번 움직인다
  frameNo++;rivAcc+=dt;if(rivAcc>=1/15){const st=Math.min(rivAcc,.14);rivAcc=0;for(let i=rivs.length-1;i>=0;i--){const r=rivs[i];if(!r.dead)stepRiv(r,st);if(r.dead)rivs.splice(i,1);}}
  // 줄기 끝 방울 + 멈춘 방울
  let k=0;
  for(const r of rivs){if(k>=TIPMAX)break;r.bone.updateWorldMatrix(true,false);const p=v1.copy(r.lp).applyMatrix4(r.bone.matrixWorld),n=v2.copy(r.ln).transformDirection(r.bone.matrixWorld);dummy.position.copy(p).addScaledVector(n,r.w*.5);dummy.quaternion.setFromUnitVectors(UP,n);const s=r.w*1.3;dummy.scale.set(s,s*.7,s*1.25);dummy.updateMatrix();tips.setMatrixAt(k++,dummy.matrix);}
  for(const b of beads){if(k>=TIPMAX)break;if(!b.bone.parent&&b.bone!==E.root)continue;b.bone.updateWorldMatrix(true,false);const p=v1.copy(b.lp).applyMatrix4(b.bone.matrixWorld),n=v2.copy(b.ln).transformDirection(b.bone.matrixWorld);dummy.position.copy(p).addScaledVector(n,b.s*.4);dummy.quaternion.setFromUnitVectors(UP,n);dummy.scale.set(b.s,b.s*.6,b.s*1.3);dummy.updateMatrix();tips.setMatrixAt(k++,dummy.matrix);}
  tips.count=k;tips.instanceMatrix.needsUpdate=true;tips.visible=k>0&&PREF.blood;
  // 낙수: 몸에서 떨어지는 피
  for(const d of drips){d.t-=dt;if(d.t<=0){d.t=clamp(.9/(d.feed*(.4+bleed*40)),.12,2.4)*rnd(.7,1.3);d.feed=Math.max(.3,d.feed-.02);d.bone.updateWorldMatrix(true,false);const p=v1.copy(d.lp).applyMatrix4(d.bone.matrixWorld);if(PREF.blood)emit('blood',p,v2.set(rnd(-.05,.05),-.2,rnd(-.05,.05)),rnd(.005,.008),3);}}
  // 쓰러져 있으면 몸 밑에 피가 고인다
  if(E.state==='down'||E.state==='dead'){const pp=E.bones.pelvis.getWorldPosition(v1);poolUnder(pp.x,pp.z+.05,bleed*dt*.6);}
  // 자국이 자라기
  for(const m of decals){const g=m.userData.grow;if(g){g.t+=dt;const s=lerp(.01,1,easeOut(g.t/g.dur));m.scale.setScalar(s);m.position.copy(g.center).multiplyScalar(1-s);if(g.t>=g.dur)m.userData.grow=null;}}
  for(const l of lumps){l.t+=dt;const s=damp(l.mesh.scale.x,l.target,6,dt);l.mesh.scale.set(s,s*.85,s*.42);}
  if(flDirty){flTex.needsUpdate=true;flDirty=false;}
  const gv=PREF.blood;for(const b of bankList){b.mesh.visible=b.kind==='tear'||gv;}
  for(const m of decals)if(m.userData.gore)m.visible=gv;
for(const m of rims)m.visible=gv;
flMesh.visible=gv;
 }

 function clearSegment(seg){
  if(!E)return;const bone=E.bones[seg];if(!bone)return;
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(m.parent!==bone)continue;m.removeFromParent();m.geometry.dispose();decals.splice(i,1);}
  for(let i=rims.length-1;i>=0;i--){const m=rims[i];if(m.parent!==bone)continue;m.removeFromParent();rims.splice(i,1);}
  for(let i=lumps.length-1;i>=0;i--){const l=lumps[i];if(l.bone!==bone)continue;l.mesh.removeFromParent();lumps.splice(i,1);}
  for(let i=bankList.length-1;i>=0;i--){const b=bankList[i];if(b.seg!==seg&&b.bone!==bone)continue;b.mesh.removeFromParent();b.g.dispose();bankList.splice(i,1);}
  for(const key in banks)if(banks[key].seg===seg||banks[key].bone===bone)delete banks[key];
  for(let i=rivs.length-1;i>=0;i--)if(rivs[i].seg===seg||rivs[i].bone===bone)rivs.splice(i,1);
  for(let i=drips.length-1;i>=0;i--)if(drips[i].seg===seg||drips[i].bone===bone)drips.splice(i,1);
  for(let i=wounds.length-1;i>=0;i--)if(wounds[i].seg===seg||wounds[i].bone===bone)wounds.splice(i,1);
  for(let i=beads.length-1;i>=0;i--)if(beads[i].bone===bone)beads.splice(i,1);
 }
 function clearDecalsNear(seg,pW,r,type='hole'){
  if(!E)return 0;const bone=E.bones[seg];if(!bone)return 0;bone.updateWorldMatrix(true,false);const lp=bone.worldToLocal(pW.clone());let removed=0;
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(m.parent!==bone||(type&&m.userData.decal!==type)||!m.userData.center||m.userData.center.distanceToSquared(lp)>r*r)continue;m.removeFromParent();m.geometry.dispose();decals.splice(i,1);removed++;}
  return removed;
 }
 
 function reset(emp){
  E=emp;for(const k in parts)for(const d of parts[k])d.on=false;
  for(const b of bankList){b.mesh.removeFromParent();b.g.dispose();}bankList.length=0;for(const key in banks)delete banks[key];
  rivs.length=0;drips.length=0;wounds.length=0;beads.length=0;
  for(const m of decals){m.removeFromParent();m.geometry.dispose();}decals.length=0;
for(const m of rims)m.removeFromParent();
rims.length=0;
  for(const l of lumps)l.mesh.removeFromParent();lumps.length=0;
  flCtx.clearRect(0,0,FL.res,FL.res);flTex.needsUpdate=true;pool.fill(0);
  if(pnCtx&&pnSaved){pnCtx.clearRect(0,0,pnCanvas.width,pnCanvas.height);pnCtx.drawImage(pnSaved,0,0);WORLD.panelTex.needsUpdate=true;}
  SB.clear();lostRaw=0;heart=0;
 }
 return {spray,emit,startRiv,addWound,decal,rim,lump,project,paintFloor,paintPanel,clearSegment,clearDecalsNear,update,reset,screen:SB,get lost(){return LOSTMAX*(1-Math.exp(-lostRaw/2.4));},get bleedRate(){let t=0;for(const w of wounds)t+=w.rate0*Math.exp(-w.age/w.tau);return t;},wounds,rivs};
})();
const SBLOOD=BLOOD.screen;
/* ===== 6. 옥황상제 — 모양 ===== */
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥',GAN_KO='갑을병정무기경신임계',ZHI_KO='자축인묘진사오미신유술해';
function pillarsKo(result){
 try{const ps=result&&result.reading&&result.reading.pillars;if(!ps)return null;
  return ps.map(p=>p&&p.known&&p.gz?(GAN_KO[GAN.indexOf(p.gz[0])]||'')+(ZHI_KO[ZHI.indexOf(p.gz[1])]||''):null);}catch(_){return null;}
}

/* 옷감 무늬: 노란 곤룡포 비단 + 금실 구름 */
function drawCloud(g,cx,cy,s,dark,light){
 const curl=(x,y,r,a0,a1)=>{g.beginPath();g.arc(x,y,r,a0,a1);g.stroke();};
 for(const [lw,c] of [[7*s,dark],[2.6*s,light]]){
  g.strokeStyle=c;g.lineWidth=lw;
  curl(cx,cy,13*s,.25,5.8);curl(cx+19*s,cy+4*s,8.5*s,3.5,8.6);curl(cx-17*s,cy+6*s,7*s,-2.4,2.6);
  g.beginPath();g.moveTo(cx-30*s,cy+19*s);g.bezierCurveTo(cx-10*s,cy+30*s,cx+16*s,cy+26*s,cx+38*s,cy+14*s);g.stroke();
 }
}
const ROBE_TEX=canvasTex(1024,1024,(g,w,h)=>{
 const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#eeaa12');gr.addColorStop(.5,'#e59a08');gr.addColorStop(1,'#eca710');g.fillStyle=gr;g.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=4){g.fillStyle=`rgba(255,236,170,${y%8?.05:.1})`;g.fillRect(0,y,w,1.4);}
 for(let x=0;x<w;x+=5){g.fillStyle='rgba(150,90,0,.035)';g.fillRect(x,0,1.2,h);}
 g.lineCap='round';g.lineJoin='round';
 for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=(c+.25+(r%2)*.5)*w/5,y=(r+.5)*h/6;drawCloud(g,x,y,1.45,'rgba(150,72,0,.9)','#ffe596');}
 for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=(c+.75+(r%2)*.5)*w/5,y=(r+1)*h/6;g.fillStyle='rgba(196,38,24,.85)';g.beginPath();g.arc(x,y,9,0,TAU);g.fill();g.strokeStyle='#ffd56b';g.lineWidth=3;g.beginPath();g.arc(x,y,14,0,TAU);g.stroke();}
 
},{repeat:[2,2]});
const HEM_TEX=canvasTex(512,512,(g,w,h)=>{
 g.drawImage(ROBE_TEX.userData.canvas,0,0,w,h);
 const top=h*.62;
 const cols=['#2a63a8','#2e9c7c','#f4eedf','#c9302a','#e7a91c','#2a63a8','#f4eedf','#2e9c7c'];
 g.save();g.beginPath();g.rect(0,top,w,h-top);g.clip();
 for(let i=-20;i<40;i++){g.fillStyle=cols[(i+40)%cols.length];g.beginPath();g.moveTo(i*22,h);g.lineTo(i*22+22,h);g.lineTo(i*22+22+120,top);g.lineTo(i*22+120,top);g.closePath();g.fill();}
 g.restore();
 g.fillStyle='#f4eedf';g.strokeStyle='#2a63a8';g.lineWidth=5;
 for(let x=0;x<w+40;x+=46){g.beginPath();g.arc(x,top+4,24,PI,0);g.fill();g.stroke();g.beginPath();g.arc(x+6,top+6,12,PI,0);g.stroke();}
 g.fillStyle='#c9302a';g.fillRect(0,h-14,w,14);g.fillStyle='#f1c45a';g.fillRect(0,h-18,w,4);
});
const TRIM_TEX=canvasTex(256,64,(g,w,h)=>{g.fillStyle='#bd2a20';g.fillRect(0,0,w,h);g.strokeStyle='#f3c85e';g.lineWidth=4;g.strokeRect(2,6,w-4,h-12);g.lineWidth=3;for(let x=10;x<w;x+=28){g.beginPath();g.moveTo(x,h-18);g.lineTo(x,18);g.lineTo(x+14,18);g.lineTo(x+14,h-26);g.lineTo(x+7,h-26);g.stroke();}},{repeat:[4,1]});
const ROUNDEL_TEX=canvasTex(256,256,(g,w,h)=>{
 g.fillStyle='#a8231b';g.beginPath();g.arc(128,128,124,0,TAU);g.fill();
 g.strokeStyle='#f2c75c';g.lineWidth=8;g.beginPath();g.arc(128,128,112,0,TAU);g.stroke();g.lineWidth=3;g.beginPath();g.arc(128,128,100,0,TAU);g.stroke();
 g.lineCap='round';for(let i=0;i<5;i++){const a=i/5*TAU-PI/2;drawCloud(g,128+Math.cos(a)*58,128+Math.sin(a)*58,.62,'#e6a92a','#ffe39a');}
 const rg=g.createRadialGradient(118,118,4,128,128,26);rg.addColorStop(0,'#fff3c8');rg.addColorStop(1,'#f08a1c');g.fillStyle=rg;g.beginPath();g.arc(128,128,24,0,TAU);g.fill();
 g.strokeStyle='#ffd36a';g.lineWidth=3;for(let i=0;i<10;i++){const a=i/10*TAU;g.beginPath();g.moveTo(128+Math.cos(a)*28,128+Math.sin(a)*28);g.lineTo(128+Math.cos(a)*36,128+Math.sin(a)*36);g.stroke();}
});
function makeTabletTex(result){
 const ko=pillarsKo(result);
 return canvasTex(160,512,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#7fc9a2');gr.addColorStop(.5,'#b4e6c8');gr.addColorStop(1,'#78c39c');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<40;i++){g.strokeStyle=`rgba(60,130,95,${Math.random()*.12})`;g.lineWidth=1+Math.random()*2;g.beginPath();g.moveTo(Math.random()*w,Math.random()*h);g.lineTo(Math.random()*w,Math.random()*h);g.stroke();}
  g.strokeStyle='#c9952e';g.lineWidth=6;g.strokeRect(8,8,w-16,h-16);
  const cols=ko&&ko.some(Boolean)?[[ko[0],ko[1]],[ko[2],ko[3]]]:[['팔자'],['사주']];
  g.fillStyle='#24543f';g.textAlign='center';g.textBaseline='middle';g.font='bold 40px "Gowun Batang","Noto Serif KR","Nanum Myeongjo",serif';
  cols.forEach((pair,ci)=>{const x=ci===0?w*.68:w*.32;let y=70;for(const s of pair){if(!s)continue;for(const ch of s){g.fillText(ch,x,y);y+=50;}y+=22;}});
 });
}

class Emperor{
 constructor(result){
  this.result=result;
  this.root=grp(scene,null,'emperor');
  this.bones={};this.parts=[];this.flow={};this.decals=[];this.lumps=[];this.goreMeshes=[];this.disposables=[];
  this._materials();
  this._body();this._arms();this._legs();this._head();this._crown();this._tablet();
  // 같은 뼈에 붙은 움직이지 않는 조각은 합쳐서 그리기 횟수를 줄인다
  this.root.updateMatrixWorld(true);for(const b of Object.values(this.bones))mergeChildren(b);mergeChildren(this.face);mergeChildren(this.belt);mergeChildren(this.crown);mergeChildren(this.board);for(const a of this.arms)mergeChildren(a.drape);mergeChildren(this.noseG);
  this.root.updateMatrixWorld(true);const _ws=V3();
  this.root.traverse(o=>{if(o.isMesh&&o.castShadow){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.getWorldScale(_ws);if(o.geometry.boundingSphere.radius*Math.max(_ws.x,_ws.y,_ws.z)<.075)o.castShadow=false;}});
  this.root.traverse(o=>{if(o.isMesh){const s=this.segOf(o);o.userData.seg=s;if(o.userData.part&&!o.userData.noHit)this.parts.push(o);if(o.userData.flow){(this.flow[s]||(this.flow[s]=[])).push(o);}}});
  this.tabletMesh.userData.seg='pelvis';this.parts.push(this.tabletMesh);
  for(const k in this.flow)for(const m of this.flow[k])FASTRAY.grid(m.geometry);
  this.initState();
 }
 _materials(){
  const D=this.disposables,S=(hex,o)=>{const m=STD(hex,o);D.push(m);return m;};
  this.M={
   skin:S('#f1b48c',{roughness:.5}),skinD:S('#dc9572',{roughness:.55}),blush:S('#ef8f7a',{roughness:.5}),lip:S('#c65f55',{roughness:.38}),
   robe:S('#ffffff',{map:ROBE_TEX,roughness:.6}),hem:S('#ffffff',{map:HEM_TEX,roughness:.62}),robeIn:S('#d89512',{roughness:.7,side:THREE.DoubleSide,map:ROBE_TEX}),
   trim:S('#ffffff',{map:TRIM_TEX,roughness:.5}),red:S('#b8261d',{roughness:.45}),white:S('#f4eee0',{roughness:.7}),roundel:S('#ffffff',{map:ROUNDEL_TEX,roughness:.45}),
   gold:S('#e4ae46',{metalness:.78,roughness:.3}),goldD:S('#a6731d',{metalness:.7,roughness:.42}),jade:S('#3b9a72',{roughness:.26}),jadeL:S('#8fd8b2',{roughness:.22}),
   lacquer:S('#171418',{roughness:.42,envMapIntensity:.35}),lacRed:S('#a51f18',{roughness:.45}),hair:S('#1f1919',{roughness:.6}),hairG:S('#77706b',{roughness:.6}),
   eyeW:S('#fbf7ee',{roughness:.16}),iris:S('#5b3520',{roughness:.22}),pupil:S('#090606',{roughness:.2}),lash:S('#181212',{roughness:.6}),hl:S('#ffffff',{emissive:col('#ffffff'),emissiveIntensity:.6,roughness:.1}),
   teeth:S('#f6efdc',{roughness:.28}),gum:S('#c25660',{roughness:.45}),mouth:S('#3a0a10',{roughness:.7,side:THREE.DoubleSide}),tongue:S('#cc5f66',{roughness:.42}),
   boot:S('#1b1718',{roughness:.42}),sole:S('#efe8dc',{roughness:.7}),trouser:S('#7e1d1a',{roughness:.7}),
   beadJ:S('#5fc59a',{roughness:.2}),beadR:S('#d2402f',{roughness:.25}),beadW:S('#f6f0e2',{roughness:.25}),cord:S('#cf2f24',{roughness:.6}),
   tablet:S('#ffffff',{roughness:.22}),
cutFlesh:S('#8d1722',{roughness:.94,side:THREE.DoubleSide}),cutDeep:S('#3d050b',{roughness:1,side:THREE.DoubleSide}),cutBone:S('#d8c6a5',{roughness:.82,side:THREE.DoubleSide}),

   socket:S('#120104',{roughness:1,metalness:0,envMapIntensity:0,side:THREE.BackSide}),
   optic:S('#6d0712',{roughness:.98,metalness:0}),brain:S('#a85164',{roughness:.94,metalness:0}),brainD:S('#57202c',{roughness:1,metalness:0}),
   gut:S('#b34b5d',{roughness:.92,metalness:0,side:THREE.DoubleSide}),gutD:S('#64202d',{roughness:1,metalness:0,side:THREE.DoubleSide}),

  };
  this.M.cavity=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});D.push(this.M.cavity);
  this.M.tablet.map=makeTabletTex(this.result);D.push(this.M.tablet.map);
  // 맞을 때 번쩍이는 재질
  this.flashMats=[this.M.skin,this.M.skinD,this.M.blush,this.M.robe,this.M.lip,this.M.hem];
 }
 get bloodLost(){return BLOOD.lost;}
 bone(name,parent,p){const g=grp(parent,p,name);g.userData.bone=name;this.bones[name]=g;g.userData.rest=g.position.clone();return g;}
 segOf(o){let n=o;while(n&&n!==this.root){if(n.userData.bone)return n.userData.bone;n=n.parent;}return 'pelvis';}

 _body(){
  const M=this.M,B=this.bones;
  const pelvis=this.bone('pelvis',this.root,[0,.62,0]);
  const spine=this.bone('spine',pelvis,[0,.06,0]);
  this.belly=mk(sphereGeo(36),M.robe,spine,{p:[0,.16,.06],s:[.345,.295,.325],part:'belly',flow:true});this.belly.userData.keep=true;
  // 옥대: 배 밑에 걸친 붉은 띠 + 옥 장식
  const belt=grp(spine,[0,.035,.045]);belt.rotation.x=.2;this.belt=belt;
  mk(new THREE.TorusGeometry(.305,.026,10,56),M.red,belt,{r:[PI/2,0,0],s:[1,.93,1],part:'belly'});
  mk(new THREE.TorusGeometry(.306,.008,6,56),M.gold,belt,{p:[0,.02,0],r:[PI/2,0,0],s:[1,.93,1],cast:false});
  for(let i=-3;i<=3;i++){const a=i*.28+PI/2,x=Math.cos(a)*.305,z=Math.sin(a)*.284;const pl=mk(new THREE.BoxGeometry(.062,.05,.02),i===0?M.gold:M.jadeL,belt,{p:[x,0,z],part:'belly'});pl.rotation.y=-(a-PI/2);if(i===0)mk(sphereGeo(16),M.jade,belt,{p:[x,0,z+.014],s:[.022,.018,.01],cast:false});}
  // 앞뒤 자락(허리띠에서 늘어진 천)
  this.apronF=grp(pelvis,[0,.07,.16]);this.apronB=grp(pelvis,[0,.07,-.12]);
  const apron=(g,front)=>{const geo=new THREE.CylinderGeometry(.27,.31,.5,24,1,true,front?-PI*.3:PI*.7,PI*.6);const m=mk(geo,M.hem,g,{p:[0,-.25,front?-.16:.12],part:front?'belly':'pelvis',flow:true});return m;};
  this.apronFMesh=apron(this.apronF,true);this.apronBMesh=apron(this.apronB,false);
  // 가슴
  const chest=this.bone('chest',spine,[0,.24,-.01]);
  this.chestMesh=mk(sphereGeo(32),M.robe,chest,{p:[0,.13,0],s:[.3,.205,.235],part:'chest',flow:true});
  mk(sphereGeo(30),M.robe,chest,{p:[0,.17,-.05],s:[.27,.16,.2],part:'chest'});
  // 흉배(가슴 둥근 장식)
  const rd=mk(new THREE.CircleGeometry(.105,40),M.roundel,chest,{p:[0,.1,.232],part:'chest',cast:false});rd.rotation.x=-.18;
  mk(new THREE.TorusGeometry(.106,.007,6,40),M.gold,chest,{p:[0,.1,.231],r:[-.18,0,0],cast:false});
  // 깃: 안쪽 흰 깃 + 붉은 교차 깃
  mk(new THREE.TorusGeometry(.125,.028,10,40),M.white,chest,{p:[0,.29,.035],r:[PI/2+.38,0,0],s:[1,1.05,1],part:'chest'});
  const lap=(pts)=>{const g=taperTube(pts,.03,.034,20,8);const m=mk(g,M.trim,chest,{part:'chest'});m.scale.set(1,1,.6);return m;};
  lap([[.12,.31,.08],[.04,.24,.2],[-.08,.12,.235],[-.17,.02,.205]]);
  lap([[-.12,.31,.08],[-.05,.25,.19],[.02,.19,.225]]);
  // 목
  const neck=this.bone('neck',chest,[0,.265,0]);
  mk(cylGeo(.12,.135,.13,24),M.skin,neck,{p:[0,.03,.02],part:'neck',flow:true});
 }

 _arms(){
  const M=this.M;this.arms=[];
  for(const s of [-1,1]){
   const nm=s<0?'L':'R';
   const sh=this.bone('shoulder'+nm,this.bones.chest,[s*.265,.19,-.01]);
   mk(sphereGeo(28),M.robe,sh,{p:[0,-.01,0],s:[.12,.115,.12],part:'arm'+nm,flow:true});
   mk(cylGeo(.088,.108,.25,22),M.robe,sh,{p:[0,-.12,0],part:'arm'+nm,flow:true});
   const el=this.bone('elbow'+nm,sh,[0,-.235,0]);
   mk(sphereGeo(22),M.robe,el,{s:[.105,.1,.105],part:'arm'+nm,flow:true});
   mk(cylGeo(.09,.11,.25,24),M.robe,el,{p:[0,-.12,0],part:'arm'+nm,flow:true});
   mk(new THREE.TorusGeometry(.083,.016,8,30),M.trim,el,{p:[0,-.243,0],r:[PI/2,0,0],part:'arm'+nm});
   mk(cylGeo(.078,.078,.012,24,true),M.robeIn,el,{p:[0,-.247,0],cast:false});
   // 넓은 소매 자락: 팔을 앞으로 들면 아래로 늘어진다
   const drape=grp(el,[0,-.12,0]);const sleeve=mk(sphereGeo(26),M.robe,drape,{p:[0,-.1,0],s:[.1,.16,.15],part:'arm'+nm,flow:true});
   const wr=this.bone('wrist'+nm,el,[0,-.215,0]);
   const hand=this._hand(wr,s,'hand'+nm);
   this.arms.push({s,nm,sh,el,wr,hand,sleeve,drape,L1:.235,L2:.215});
  }
 }
 _hand(wr,s,part){
  const M=this.M,h={fingers:[],thumb:null};
  mk(cylGeo(.036,.04,.06,16),M.skin,wr,{p:[0,.0,0],part,flow:true});
  h.palm=mk(sphereGeo(24),M.skin,wr,{p:[0,-.055,.004],s:[.026,.058,.05],part,flow:true});
  for(let i=0;i<4;i++){
   const z=.032-i*.021,len=i===3?.026:i===0?.034:.036;
   const f=grp(wr,[-s*.004,-.1+(i===0||i===3?.006:0),z]);
   mk(capsuleGeo(.0118,len,10),M.skin,f,{p:[0,-len/2-.004,0],part});
   const f2=grp(f,[0,-len-.006,0]);
   mk(capsuleGeo(.011,len*.85,10),M.skin,f2,{p:[0,-len*.42,0],part});
   h.fingers.push({f,f2});
  }
  const t=grp(wr,[-s*.012,-.035,.043]);t.rotation.set(-.5,0,-s*.5);
  mk(capsuleGeo(.0135,.034,10),M.skin,t,{p:[0,-.02,0],part});
  const t2=grp(t,[0,-.043,0]);mk(capsuleGeo(.0125,.028,10),M.skin,t2,{p:[0,-.016,0],part});
  h.thumb={t,t2};
  // 반지(옥가락지)
  mk(new THREE.TorusGeometry(.013,.0045,6,14),M.jade,h.fingers[2].f,{p:[0,-.016,0],r:[0,0,PI/2],cast:false});
  return h;
 }

 _legs(){
  const M=this.M;this.legs=[];
  for(const s of [-1,1]){
   const nm=s<0?'L':'R';
   const hip=this.bone('hip'+nm,this.bones.pelvis,[s*.135,-.02,0]);
   mk(sphereGeo(22),M.hem,hip,{s:[.16,.12,.17],part:'thigh'+nm,flow:true});
   mk(cylGeo(.15,.165,.3,24),M.robe,hip,{p:[0,-.15,0],part:'thigh'+nm,flow:true});
   const knee=this.bone('knee'+nm,hip,[0,-.29,0]);
   mk(sphereGeo(20),M.robe,knee,{s:[.15,.1,.155],part:'thigh'+nm,flow:true});
   mk(cylGeo(.162,.186,.24,24,true),M.hem,knee,{p:[0,-.115,0],part:'shin'+nm,flow:true});
   mk(cylGeo(.08,.07,.2,16),M.trouser,knee,{p:[0,-.14,0],part:'shin'+nm});
   const ank=this.bone('ankle'+nm,knee,[0,-.255,0]);
   mk(sphereGeo(22),M.boot,ank,{p:[0,-.005,.045],s:[.078,.058,.14],part:'foot'+nm});
   mk(sphereGeo(16),M.boot,ank,{p:[0,.012,.165],s:[.03,.04,.035],part:'foot'+nm});
   mk(new THREE.BoxGeometry(.15,.022,.27),M.sole,ank,{p:[0,-.05,.045],part:'foot'+nm});
   this.legs.push({s,nm,hip,knee,ank});
  }
 }

 _head(){
  const M=this.M;
  const head=this.bone('head',this.bones.neck,[0,.06,.03]);
  const F=this.face=grp(head,[0,.215,0],'face');
  this.faceRest=F.position.clone();
  // 두개골·볼살·이중턱
  this.skull=mk(sphereGeo(40),M.skin,F,{p:[0,.035,-.012],s:[.212,.215,.205],part:'head',flow:true});
  this.jowls=[];
  for(const s of [-1,1]){
   {const j=mk(sphereGeo(30),M.skin,F,{p:[s*.102,-.072,.072],s:[.128,.128,.132],part:'face',flow:true});j.userData.keep=true;this.jowls.push(j);}
   mk(sphereGeo(24),M.blush,F,{p:[s*.118,-.02,.168],s:[.058,.04,.024],part:'face',flow:true,cast:false});
   // 귀 + 긴 귓불
   mk(sphereGeo(20),M.skin,F,{p:[s*.205,.02,-.01],s:[.028,.066,.046],part:'head'});
   mk(sphereGeo(18),M.skinD,F,{p:[s*.212,.02,.004],s:[.012,.04,.026],cast:false,part:'head'});
   mk(sphereGeo(18),M.skin,F,{p:[s*.212,-.072,.004],s:[.03,.048,.032],part:'head'});
  }
  this.dchin=mk(sphereGeo(32),M.skin,F,{p:[0,-.205,.035],s:[.158,.075,.13],part:'face',flow:true});
  this.muzzle=mk(sphereGeo(32),M.skin,F,{p:[0,-.078,.136],s:[.09,.062,.07],part:'mouth',flow:true});
  mk(sphereGeo(32),M.skin,F,{p:[0,.1,.118],s:[.172,.062,.082],part:'head',flow:true});
  // 코
  this.noseG=grp(F,[0,-.008,.2]);
  mk(sphereGeo(20),M.skin,this.noseG,{p:[0,.045,-.012],s:[.03,.052,.034],part:'nose',flow:true});
  this.noseBall=mk(sphereGeo(28),M.skin,this.noseG,{p:[0,-.01,.018],s:[.05,.043,.047],part:'nose',flow:true});
  this.nostrils=[];
  for(const s of [-1,1]){mk(sphereGeo(18),M.skin,this.noseG,{p:[s*.036,-.024,.004],s:[.026,.024,.028],part:'nose',flow:true});{const nn=mk(sphereGeo(10),M.mouth,this.noseG,{p:[s*.019,-.043,.022],s:[.011,.006,.009],cast:false,part:'nose'});nn.userData.keep=true;this.nostrils.push(nn);}}
  mk(sphereGeo(14),M.blush,this.noseG,{p:[0,-.006,.058],s:[.02,.014,.008],cast:false,part:'nose'});
  // 눈
  this.eyes=[];
  for(const s of [-1,1]){
   const eg=grp(F,[s*.076,.05,.154]);eg.rotation.y=s*.12;
   mk(sphereGeo(20),M.skinD,F,{p:[s*.078,.006,.158],s:[.05,.022,.03],part:'face',cast:false});// 눈밑 주머니
   const gaze=grp(eg);
   const r=.041;
   const orb=mk(sphereGeo(28),M.eyeW,gaze,{s:r,part:'eye'+(s<0?'L':'R')});
   const iris=mk(sphereGeo(24),M.iris,gaze,{p:[0,0,r*.9],s:[.022,.022,.01],part:'eye'+(s<0?'L':'R'),cast:false});
   const pupil=mk(sphereGeo(16),M.pupil,gaze,{p:[0,0,r*.98],s:[.0115,.0115,.004],cast:false,part:'eye'+(s<0?'L':'R')});
   const hl=mk(sphereGeo(10),M.hl,eg,{p:[-.012,.013,r+.004],s:.0055,cast:false});
   const up=grp(eg),lo=grp(eg);
   const upLid=mk(capGeo(r*1.13,0,PI/2,28),M.skin,up,{part:'eye'+(s<0?'L':'R'),flow:true});
   const lash=mk(new THREE.TorusGeometry(r*1.13,.0042,6,28,PI),M.lash,up,{r:[PI/2,0,0],cast:false});
   const loLid=mk(capGeo(r*1.1,PI/2,PI/2,28),M.skin,lo,{part:'eye'+(s<0?'L':'R'),flow:true});
   this.eyes.push({s,eg,gaze,orb,iris,pupil,hl,up,lo,upLid,loLid,lash,r,open:1,swell:0,ruined:false,ejected:false,socket:null});
  }
  // 눈썹(움직이는 관)
  this.brows=[];
  for(const s of [-1,1]){const t=new DynTube(6,7,M.hair,{cast:false});F.add(t.mesh);t.mesh.userData.part='head';t.mesh.userData.keep=true;this.brows.push({s,tube:t,pts:Array.from({length:6},()=>V3())});}
  // 입: 입술 2개 + 입속 + 이 + 혀
  this.mouthC=V3(0,-.094,.2);
  this.lipU=new DynTube(13,8,M.lip);this.lipL=new DynTube(13,8,M.lip);
  F.add(this.lipU.mesh);F.add(this.lipL.mesh);this.lipU.mesh.userData.keep=this.lipL.mesh.userData.keep=true;this.lipU.mesh.userData.part='mouth';this.lipL.mesh.userData.part='mouth';
  this.lipPtsU=Array.from({length:13},()=>V3());this.lipPtsL=Array.from({length:13},()=>V3());
  {const n=13,pos=new Float32Array(n*2*3),idx=[];for(let i=0;i<n-1;i++){const a=i,b=i+1,c=n+i,d=n+i+1;idx.push(a,c,b,b,c,d);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setIndex(idx);g.computeVertexNormals();this.mouthIn=mk(g,M.mouth,F,{cast:false,part:'mouth'});this.mouthIn.frustumCulled=false;this.mouthIn.userData.keep=true;}
  const jaw=this.bone('jaw',F,[0,-.03,-.02]);this.jaw=jaw;
  this.chin=mk(sphereGeo(32),M.skin,jaw,{p:[0,-.135,.13],s:[.105,.07,.085],part:'chin',flow:true});
  this.teethU=[];this.teethL=[];
  for(let i=0;i<8;i++){const x=(i-3.5)*.0155,z=.165-Math.pow(x/.06,2)*.012;const t=mk(sphereGeo(10),M.teeth,F,{p:[x,-.083,z],s:[.0078,.0115,.0062],cast:false,part:'mouth'});t.userData.tooth=true;t.userData.keep=true;this.teethU.push(t);}
  for(let i=0;i<6;i++){const x=(i-2.5)*.015,z=.172-Math.pow(x/.06,2)*.012;const t=mk(sphereGeo(10),M.teeth,jaw,{p:[x,-.067,z+.02],s:[.007,.0095,.0058],cast:false,part:'mouth'});t.userData.tooth=true;t.userData.keep=true;this.teethL.push(t);}
  this.tongue=mk(sphereGeo(16),M.tongue,jaw,{p:[0,-.074,.155],s:[.042,.014,.04],cast:false,part:'mouth'});this.tongue.userData.keep=true;
  // 콧수염(끝이 늘어진 팔자 수염)
  for(const s of [-1,1])mk(taperTube([[s*.006,-.058,.224],[s*.05,-.066,.222],[s*.094,-.092,.213],[s*.122,-.135,.196],[s*.134,-.19,.152]],.017,.004,26,9),M.hair,F,{part:'mouth'});
  // 턱수염: 세 가닥, 흔들린다
  this.beard=[];
  const bRoot=grp(jaw,[0,-.205,.168]);
  for(const [x,len,w] of [[0,.34,.024],[-.05,.22,.017],[.05,.22,.017]]){
   const segs=[];let parent=grp(bRoot,[x,0,x===0?0:-.01]);const n=3;
   for(let k=0;k<n;k++){const g=grp(parent,k===0?null:[0,-len/n,0]);const r0=w*(1-k*.22),r1=Math.max(.003,w*(1-(k+1)*.22));mk(taperTube([[0,.006,0],[x*.06,-len/(2*n),.003],[0,-len/n,0]],r0,r1,8,8),k>=n-1?M.hairG:M.hair,g,{part:'beard',cast:k<2});segs.push({g,sx:new Spring(55,3.8),sz:new Spring(55,3.8)});parent=g;}
   this.beard.push(segs);
  }
  // 머리카락(뒷머리·구레나룻)
  mk(sphereGeo(30),M.hair,F,{p:[0,.03,-.06],s:[.215,.19,.17],part:'head'});
  this.headR=.24;
 }

 _crown(){
  const M=this.M;
  const cr=this.crown=grp(this.face,[0,.205,-.015],'crown');cr.rotation.x=-.05;
  this.crownRest={p:cr.position.clone(),r:cr.rotation.clone()};
  mk(cylGeo(.152,.172,.12,32),M.lacquer,cr,{p:[0,.03,0],part:'crown'});
  mk(cylGeo(.174,.176,.03,32),M.gold,cr,{p:[0,-.02,0],part:'crown'});
  mk(cylGeo(.154,.154,.012,32),M.goldD,cr,{p:[0,.085,0],part:'crown'});
  // 면판: 위 검정, 아래 붉음
  const board=grp(cr,[0,.115,0]);board.rotation.x=.12;this.board=board;
  mk(new THREE.BoxGeometry(.45,.016,.27),M.lacquer,board,{p:[0,.01,0],part:'crown'});
  mk(new THREE.BoxGeometry(.44,.006,.26),M.lacRed,board,{p:[0,-.002,0],part:'crown',cast:false});
  mk(new THREE.BoxGeometry(.46,.004,.28),M.gold,board,{p:[0,.0005,0],part:'crown',cast:false});
  // 앞뒤 구슬줄(류): 줄 하나를 메시 하나로 합친다
  this.strings=[];
  const beadMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.22,metalness:.05,envMapIntensity:.5});this.disposables.push(beadMat);
  const cols=[col('#5fc59a'),col('#d2402f'),col('#f6f0e2'),col('#5fc59a'),col('#d2402f')],thread=col('#a6731d');
  for(const side of [1])for(let i=0;i<9;i++){
   const x=(i-4)*.049,piv=grp(board,[x,-.002,side*.13]);
   const len=side>0?.115:.13,tmp=[];
   const t=new THREE.Mesh(cylGeo(.0018,.0018,len,5));t.position.set(0,-len/2,0);t.userData.c=thread;tmp.push(t);
   for(let k=0;k<5;k++){const b=new THREE.Mesh(sphereGeo(10));b.position.set(0,-.018-k*.022,0);b.scale.setScalar(.0085);b.userData.c=cols[(k+i)%5];tmp.push(b);}
   const holder=new THREE.Group();for(const m of tmp)holder.add(m);holder.updateMatrixWorld(true);
   const g=mergeMeshes(tmp,new THREE.Matrix4(),m=>m.userData.c);const mm=mk(g,beadMat,piv,{cast:false,part:'crown'});
   this.strings.push({piv,side,sx:new Spring(40,2.6),sz:new Spring(40,2.6)});
  }
  // 비녀 + 붉은 끈
  mk(cylGeo(.007,.007,.4,8),M.gold,cr,{p:[0,.04,0],r:[0,0,PI/2],part:'crown'});
  this.cords=[];
  for(const s of [-1,1]){mk(sphereGeo(12),M.gold,cr,{p:[s*.21,.04,0],s:.018,part:'crown'});const piv=grp(cr,[s*.21,.035,0]);mk(taperTube([[0,0,0],[s*.01,-.12,.02],[s*.01,-.25,.03]],.006,.005,12,6),M.cord,piv,{cast:false,part:'crown'});mk(sphereGeo(10),M.cord,piv,{p:[s*.01,-.26,.03],s:[.014,.024,.014],cast:false});this.cords.push({piv,s,sx:new Spring(30,2.2),sz:new Spring(30,2.2)});}
 }

 _tablet(){
  const M=this.M;
  const t=this.tablet=grp(scene,null,'tablet');
  const geo=new THREE.BoxGeometry(.085,.36,.014);
  // 앞면에만 글씨 텍스처
  const side=STD('#9fd4b5',{roughness:.25});this.disposables.push(side);
  const mats=[side,side,side,side,M.tablet,side];
  this.tabletMesh=mk(geo,mats,t,{part:'tablet'});
  this.tabletMesh.userData.part='tablet';
  this.tabletHeld=true;this.tabletBody=null;
 }
 destroy(){
  const shared=new Set(Object.values(GEO)),geos=new Set();const visit=o=>{if(o.geometry&&!shared.has(o.geometry))geos.add(o.geometry);};
  const roots=[this.root,this.crown,this.tablet,...(this.shards||[]),...(this.bits||[]).map(b=>b.obj)];
  for(const r of roots){if(!r)continue;r.traverse(visit);r.removeFromParent();}
  geos.forEach(g=>g.dispose());for(const m of this.disposables)if(m&&m.dispose)m.dispose();
 }
}
/* ===== 6-2. 옥황상제 — 얼굴 표정 ===== */
const EXPR={
 neutral:{bY:[0,0],bIn:[0,0],bOut:[0,0],lidU:.72,lidL:.25,mOpen:0,mSmile:0,mSmirk:0,mWide:0,mGap:0,jaw:0,cheek:0,pucker:0},
 smug:{bY:[.05,.62],bIn:[-.15,.15],bOut:[0,.15],lidU:.4,lidL:.38,mOpen:.02,mSmile:.6,mSmirk:.85,mWide:.1,mGap:0,jaw:0,cheek:.4,pucker:0},
 laugh:{bY:[.4,.65],bIn:[.15,.25],bOut:[0,0],lidU:.22,lidL:.78,mOpen:.55,mSmile:1,mSmirk:.25,mWide:.45,mGap:.55,jaw:.32,cheek:.95,pucker:0},
 annoyed:{bY:[-.3,-.1],bIn:[-.6,-.4],bOut:[.1,.2],lidU:.58,lidL:.42,mOpen:.04,mSmile:-.35,mSmirk:-.2,mWide:.05,mGap:.1,jaw:0,cheek:.1,pucker:.1},
 angry:{bY:[-.5,-.5],bIn:[-1,-1],bOut:[.25,.25],lidU:.64,lidL:.45,mOpen:.14,mSmile:-.4,mSmirk:0,mWide:.4,mGap:.75,jaw:.04,cheek:.3,pucker:0},
 shock:{bY:[.95,.95],bIn:[.35,.35],bOut:[0,0],lidU:1,lidL:.05,mOpen:.5,mSmile:-.25,mSmirk:0,mWide:-.3,mGap:.2,jaw:.5,cheek:0,pucker:.45},
 pain:{bY:[-.25,-.25],bIn:[.8,.8],bOut:[-.2,-.2],lidU:.06,lidL:.9,mOpen:.3,mSmile:-.75,mSmirk:0,mWide:.65,mGap:1,jaw:.18,cheek:.7,pucker:0},
 hurt:{bY:[.15,.15],bIn:[.7,.7],bOut:[-.1,-.1],lidU:.56,lidL:.35,mOpen:.2,mSmile:-.6,mSmirk:0,mWide:.1,mGap:.25,jaw:.12,cheek:.15,pucker:0},
 scared:{bY:[.65,.65],bIn:[.9,.9],bOut:[0,0],lidU:.95,lidL:.1,mOpen:.28,mSmile:-.65,mSmirk:0,mWide:.15,mGap:.5,jaw:.16,cheek:0,pucker:0},
 cry:{bY:[.2,.2],bIn:[1,1],bOut:[-.3,-.3],lidU:.22,lidL:.72,mOpen:.6,mSmile:-1,mSmirk:0,mWide:.55,mGap:.35,jaw:.36,cheek:.55,pucker:0},
 beg:{bY:[.5,.5],bIn:[1,1],bOut:[-.2,-.2],lidU:.82,lidL:.22,mOpen:.22,mSmile:-.75,mSmirk:0,mWide:0,mGap:.2,jaw:.12,cheek:0,pucker:.1},
 dazed:{bY:[-.1,.25],bIn:[.35,.1],bOut:[0,0],lidU:.3,lidL:.18,mOpen:.38,mSmile:-.2,mSmirk:.2,mWide:-.1,mGap:.1,jaw:.36,cheek:0,pucker:0},
 ko:{bY:[0,0],bIn:[.3,.3],bOut:[0,0],lidU:.04,lidL:.3,mOpen:.42,mSmile:-.3,mSmirk:.1,mWide:-.1,mGap:.05,jaw:.42,cheek:0,pucker:0},
 grunt:{bY:[-.35,-.35],bIn:[.4,.4],bOut:[0,0],lidU:.18,lidL:.8,mOpen:.08,mSmile:-.6,mSmirk:0,mWide:.5,mGap:.9,jaw:.02,cheek:.7,pucker:0},
 oof:{bY:[.4,.4],bIn:[.6,.6],bOut:[0,0],lidU:.85,lidL:.15,mOpen:.45,mSmile:-.3,mSmirk:0,mWide:-.35,mGap:.1,jaw:.42,cheek:.1,pucker:.7},
};
const EXPR_KEYS=['lidU','lidL','mOpen','mSmile','mSmirk','mWide','mGap','jaw','cheek','pucker'];

Object.assign(Emperor.prototype,{
 initFace(){
  const f=this.fx={bY:[0,0],bIn:[0,0],bOut:[0,0]};for(const k of EXPR_KEYS)f[k]=EXPR.neutral[k];
  this.emo='neutral';this.emoPrev='neutral';this.emoT=1;this.flinch=0;this.flinchKind='pain';this.blinkT=rnd(1.5,3.5);this.blink=0;
  this.talk=0;this.talkPhase=0;this.laughAmt=0;this.gazeTarget=V3(0,1.3,3);this.gazeJit=V3();this.gazeJitT=0;this.dizzy=0;
  this.swellU=[0,0];this.noseBend=0;this.noseBendV=0;this.toothGone=new Set();
  this.updateFace(0,0,true);
 },
 setEmotion(name){if(!EXPR[name]||name===this.emo)return;this.emoPrev=this.emo;this.emo=name;this.emoT=0;},
 doFlinch(kind='pain',amt=1){this.flinch=Math.max(this.flinch,amt);this.flinchKind=kind;},
 _exprTargets(out){
  const a=EXPR[this.emoPrev],b=EXPR[this.emo],t=smooth(this.emoT);
  for(const k of EXPR_KEYS)out[k]=lerp(a[k],b[k],t);
  for(const k of ['bY','bIn','bOut']){out[k]=[lerp(a[k][0],b[k][0],t),lerp(a[k][1],b[k][1],t)];}
  const fl=sat(this.flinch);
  if(fl>0){const c=EXPR[this.flinchKind]||EXPR.pain;for(const k of EXPR_KEYS)out[k]=lerp(out[k],c[k],fl);for(const k of ['bY','bIn','bOut'])for(let i=0;i<2;i++)out[k][i]=lerp(out[k][i],c[k][i],fl);}
  return out;
 },
 updateFace(dt,time,instant){
    if(this.headDestroyed)return;
  const f=this.fx,T=this._ft||(this._ft={});this._exprTargets(T);
  this.emoT=Math.min(1,this.emoT+dt/.28);this.flinch=Math.max(0,this.flinch-dt*2.6);
  // 깜빡임
  this.blinkT-=dt;if(this.blinkT<=0){this.blink=1;this.blinkT=rnd(1.8,4.6)*(this.emo==='scared'?.6:1);}
  const blinkClose=this.blink>0?Math.sin(clamp(1-this.blink,0,1)*PI):0;this.blink=Math.max(0,this.blink-dt/.15);
  // 웃음·말할 때 입이 들썩
  if(this.laughAmt>0){this.talkPhase+=dt*TAU*5.6;const w=(.5+.5*Math.sin(this.talkPhase))*this.laughAmt;T.mOpen+=w*.3;T.jaw+=w*.14;T.lidU-=w*.05;}
  if(this.talk>0){this.talkPhase+=dt*TAU*7;const w=Math.max(0,Math.sin(this.talkPhase))*this.talk;T.mOpen+=w*.35;T.jaw+=w*.2;}
  const r=instant?1:1-Math.exp(-dt*(this.flinch>.3?30:16));
  for(const k of EXPR_KEYS)f[k]=lerp(f[k],T[k],r);
  for(const k of ['bY','bIn','bOut'])for(let i=0;i<2;i++)f[k][i]=lerp(f[k][i],T[k][i],r);
  this._applyBrows(f,time);this._applyEyes(f,blinkClose,dt,time);this._applyMouth(f,time);
  // 볼: 웃거나 찡그리면 올라간다
  for(let i=0;i<2;i++){const j=this.jowls[i];j.position.y=-.072+f.cheek*.008;}
  // 코: 부러지면 옆으로 휜다
  this.noseG.rotation.z=this.noseBend;this.noseG.position.x=this.noseBend*-.03;
 },
 _applyBrows(f,time){
  const xs=[.022,.05,.08,.108,.132,.15],ys=[.12,.13,.134,.13,.12,.106];
  for(let bi=0;bi<2;bi++){const b=this.brows[bi],s=b.s,side=s<0?0:1;
   const raise=f.bY[side]*.017,inner=f.bIn[side]*.016,outer=f.bOut[side]*.012;
   for(let i=0;i<6;i++){const u=i/5,x=s*(xs[i]-(1-u)*Math.min(0,f.bIn[side])*.004),y=ys[i]+raise+inner*(1-u)*(1-u)+outer*u*u-(f.bIn[side]<0?(1-u)*.004:0);
    const z=.205-1.75*x*x+(f.bIn[side]<0?(1-u)*.003:0);b.pts[i].set(x,y,z);}
   b.tube.update(b.pts,[.007,.012,.0145,.0142,.0115,.0065]);
  }
 },
 _applyEyes(f,blinkClose,dt,time){
  // 시선: 기본은 나(카메라)를 본다. 겁먹으면 흔들린다
  this.gazeJitT-=dt;if(this.gazeJitT<=0){this.gazeJitT=this.emo==='scared'||this.emo==='beg'?rnd(.18,.5):rnd(.6,2.2);this.gazeJit.set(rnd(-1,1),rnd(-.6,.6),0).multiplyScalar(this.emo==='scared'?.12:.035);}
  const tgt=_fv1.copy(this.gazeTarget).add(this.gazeJit);
  for(let i=0;i<2;i++){const e=this.eyes[i];
   if(e.ejected){const r=e.r,yl=-.38*r,yu=.38*r;e.up.rotation.x=Math.asin(clamp(-yu/(r*1.13),-1,1));e.lo.rotation.x=Math.asin(clamp(-yl/(r*1.1),-1,1));e.up.scale.set(1.08,1.12,1.08);e.lo.scale.set(1.08,1.14,1.08);continue;}
   e.eg.updateWorldMatrix(true,false);
   const l=_fv2.copy(tgt);e.eg.worldToLocal(l);
   let yaw=Math.atan2(l.x,l.z),pitch=-Math.atan2(l.y,Math.hypot(l.x,l.z));
   if(this.dizzy>0){yaw+=Math.sin(time*3.1+i*2)*.35*this.dizzy;pitch+=Math.cos(time*2.7+i)*.25*this.dizzy;}
   if(this.emo==='ko'){pitch=-.45;yaw=e.s*.08;}
   e.gaze.rotation.set(clamp(pitch,-.4,.35),clamp(yaw,-.5,.5),0);
   const sw=this.swellU[i];
   const r=e.r,yl=lerp(-.72,-.08,sat(f.lidL+sw*.25))*r;
   let open=f.lidU*(1-blinkClose)*(1-sw*.85);if(e.ruined)open=Math.min(open,.12);
   const yu=lerp(yl+.06*r,.86*r,sat(open));
   e.up.rotation.x=Math.asin(clamp(-yu/(r*1.13),-1,1));e.lo.rotation.x=Math.asin(clamp(-yl/(r*1.1),-1,1));
   const puff=1+sw*.26;e.up.scale.set(puff,puff*1.03,puff);e.lo.scale.set(puff,puff*1.06,puff);
   const dil=this.emo==='scared'||this.emo==='shock'?1.25:this.emo==='smug'?.85:1;e.pupil.scale.set(.0115*dil,.0115*dil,.004);
  }
 },
 _applyMouth(f,time){
  const C=this.mouthC,n=13,U=this.lipPtsU,L=this.lipPtsL;
  const w=.066*(1+.28*f.mWide-.3*f.pucker);
  const open=sat(f.mOpen),jaw=sat(f.jaw),gap=sat(f.mGap);
  const tremble=(this.emo==='cry'||this.emo==='scared'||this.emo==='beg')?Math.sin(time*31)*.0015:0;
  const rU=[],rL=[];
  for(let i=0;i<n;i++){
   const u=i/(n-1)*2-1,x=u*w,c=Math.pow(Math.abs(u),2.2),m=1-u*u,mm=Math.pow(m,.75);
   let corner=f.mSmile*.017*c+f.mSmirk*.02*c*(u>0?1:-.2);
   const yU=C.y+.004*m+(open*.012+gap*.012)*mm+corner+tremble;
   const yL=C.y-.003*m-(open*.026+jaw*.048+gap*.01)*Math.pow(m,.65)+corner*.85-tremble;
   const z=C.z-1.85*x*x+.006*f.pucker*m;
   U[i].set(x,yU,z);L[i].set(x,yL,z+.002);
   rU.push(.0098*(1-.5*Math.pow(Math.abs(u),4))*(1+.15*f.pucker));rL.push(.0118*(1-.5*Math.pow(Math.abs(u),4))*(1+.15*f.pucker));
  }
  this.lipU.update(U,rU);this.lipL.update(L,rL);
  // 입속(어두운 면): 입술 사이
  const P=this.mouthIn.geometry.attributes.position.array;
  for(let i=0;i<n;i++){const a=U[i],b=L[i];P[i*3]=a.x;P[i*3+1]=a.y-.002;P[i*3+2]=a.z+.0015;P[(n+i)*3]=b.x;P[(n+i)*3+1]=b.y+.002;P[(n+i)*3+2]=b.z+.0005;}
  this.mouthIn.geometry.attributes.position.needsUpdate=true;this.mouthIn.geometry.computeBoundingSphere();
  // 이: 벌어진 만큼만 보인다
  const lipY=(arr,x)=>{const t=clamp((x/w+1)/2*(n-1),0,n-1),i=Math.min(n-2,Math.floor(t)),k=t-i;return lerp(arr[i].y,arr[i+1].y,k);};
  const lipZ=x=>C.z-1.85*x*x;
  this.teethU.forEach((t,i)=>{const x=(i-3.5)*.0152*(w/.066);const top=lipY(U,x)-.006,bot=lipY(L,x)+.007,g=top-bot;
   const h=Math.min(.0115,Math.max(0,g*.55));t.visible=!t.userData.gone&&h>.0022&&Math.abs(x)<w*.86;t.scale.set(.0078,h,.0062);t.position.set(x,top-h*.92,lipZ(x)+.003);});
  // 아랫니는 턱뼈에 붙어 있으므로 턱 좌표로 옮겨 계산
  this.jaw.rotation.x=jaw*.34;
  this.teethL.forEach((t,i)=>{const x=(i-2.5)*.0148*(w/.066);const top=lipY(U,x)-.006,bot=lipY(L,x)+.006,g=top-bot;
   const h=Math.min(.0095,Math.max(0,g*.32));t.visible=!t.userData.gone&&h>.0022&&Math.abs(x)<w*.75;
   _fv1.set(x,bot+h*.9,lipZ(x)+.002);this.jaw.updateMatrix();_fm.copy(this.jaw.matrix).invert();_fv1.applyMatrix4(_fm);t.position.copy(_fv1);t.scale.set(.007,h,.0058);});
  const tg=lipY(U,0)-lipY(L,0);this.tongue.visible=tg>.03;
  if(this.tongue.visible){_fv1.set(0,lipY(L,0)+.011,C.z-.004);this.jaw.updateMatrix();_fm.copy(this.jaw.matrix).invert();_fv1.applyMatrix4(_fm);this.tongue.position.copy(_fv1);}
 },
});
const _fv1=V3(),_fv2=V3(),_fm=new THREE.Matrix4();
/* ===== 6-3. 옥황상제 — 자세·움직임 =====
 * 자세(pose)는 숫자 몇십 개짜리 묶음이다. 상태마다 자세를 만들고, 그 위에 스프링(맞을 때 튕김)과 팔 IK(손을 특정 자리에 대기)를 얹는다.
 * 축 약속: F=앞으로 숙임/앞으로 듦(+), T=화면 오른쪽으로 돎(+), R=윗부분이 화면 오른쪽으로 기욺(+), A=팔다리를 바깥으로 벌림(+), B=팔꿈치·무릎 굽힘(+) */
const POSE_KEYS=['tx','ty','tz','ry','rx','rz','py','pF','pT','pR','sF','sT','sR','cF','cT','cR','nF','nT','nR','hF','hT','hR',
 'LsF','LsA','LsT','LeB','LwF','LwA','Lcurl','RsF','RsA','RsT','ReB','RwF','RwA','Rcurl','LhF','LhA','LkB','LaF','RhF','RhA','RkB','RaF'];
function P(o){const p={};for(const k of POSE_KEYS)p[k]=o&&o[k]!=null?o[k]:0;return p;}
function poseLerp(a,b,t,out){for(const k of POSE_KEYS)out[k]=a[k]+(b[k]-a[k])*t;return out;}
function poseCopy(a,out){for(const k of POSE_KEYS)out[k]=a[k];return out;}
const STAND=P({LsA:.44,RsA:.44,LsF:.12,RsF:.12,LeB:.42,ReB:.42,Lcurl:.3,Rcurl:.3,LhA:.07,RhA:.07,cF:-.04,hF:.02});

/* 다운 자세들 */
const POSES={
 // 옥좌에 털썩 앉아 넋 나감
 throne:P({tz:-.66,py:-.08,pF:-.1,sF:-.24,cF:-.1,nF:.12,hF:.18,hR:.32,hT:.12,LsA:.62,RsA:.66,LsF:.25,RsF:.3,LeB:.55,ReB:.45,Lcurl:.15,Rcurl:.2,LhF:1.42,RhF:1.36,LhA:.24,RhA:.3,LkB:1.25,RkB:1.15,LaF:.15,RaF:.2}),
 // 무릎 꿇고 빈다
 kneel:P({tz:.06,py:-.27,pF:.05,sF:.1,cF:.08,nF:.05,hF:-.08,LsA:.2,RsA:.2,LsF:.9,RsF:.9,LeB:1.5,ReB:1.5,Lcurl:.1,Rcurl:.1,LhF:.05,RhF:.05,LhA:.1,RhA:.1,LkB:1.5,RkB:1.5,LaF:-.8,RaF:-.8}),
 // 엉덩방아: 바닥에 주저앉아 뒤로 손 짚음
 floor:P({tz:-.18,py:-.5,pF:-.2,sF:-.32,cF:-.06,nF:.3,hF:.2,hR:-.18,LsA:.55,RsA:.55,LsF:-.8,RsF:-.8,LeB:.15,ReB:.15,Lcurl:.15,Rcurl:.15,LhF:1.35,RhF:1.28,LhA:.32,RhA:.38,LkB:.45,RkB:.3,LaF:.2,RaF:.25}),
 // 마지막: 옥좌 발판에 기대 주저앉아 늘어짐
 final:P({tz:-.2,py:-.5,pF:-.22,sF:-.2,cF:-.05,nF:.06,hF:.06,hR:.55,hT:.22,LsA:.62,RsA:.7,LsF:.05,RsF:-.05,LeB:.25,ReB:.15,Lcurl:.1,Rcurl:.12,LhF:1.32,RhF:1.18,LhA:.42,RhA:.52,LkB:.38,RkB:.22,LaF:.3,RaF:.35}),
};

Object.assign(Emperor.prototype,{
 initState(){
  this.pose=P();poseCopy(STAND,this.pose);this.poseFrom=P();this.poseTmp=P();this.poseTmp2=P();
  this.state='stand';this.stateT=0;this.down=null;this.alive=true;
  this.sp={pelvis:new Spring3(90,11),spine:new Spring3(100,11),chest:new Spring3(110,11),neck:new Spring3(120,10.5),head:new Spring3(115,9.2),
   root:new Spring3(26,9),drop:new Spring(80,10),L:new Spring3(90,10),R:new Spring3(90,10),Lk:new Spring(70,9),Rk:new Spring(70,9),
   squash:new Spring3(260,14),belly:new Spring3(170,8)};
  this.rootPos=V3();this.rootVel=V3();this.stepPhase=0;this.stepAmt=0;
  this.ik={L:{w:0,goal:0,target:V3(),fd:V3(0,-1,0),pd:V3(),curl:.3,space:'root'},R:{w:0,goal:0,target:V3(),fd:V3(0,-1,0),pd:V3(),curl:.3,space:'root'}};
  this.act=null;this.actQueue=[];this.guard=0;this.guardGoal=0;this.guardHP=3;this.guardCool=0;this.guardHold=0;
  this.limp=[0,0];this.armHurt=[0,0];this.hunch=0;this.weak=0;this.mood=0;this.sinceHit=99;this.hitsRecent=[];
this.cutZones=[];this.cutStrokeFallback=0;this.detached=new Set();
  this.abdomenCuts=[];this.abdomenTarget=null;this.abdomenStage=0;this.abdomenOpen=false;this.abdomenCavity=null;this.gutSpilled=false;this.gutChains=[];
  this.abdomenCuts=[];this.abdomenStage=0;this.abdomenOpen=false;
  this.headGunHits=0;this.eyeGunHits=[0,0];this.headDamageStage=0;this.headDestroyed=false;this.headRuin=null;
  this.laughing=0;this.taunt=true;this.phase=0;this.breath=rnd(0,TAU);
  this.prevHeadQ=new THREE.Quaternion();this.headAngVel=V3();
  this.initFace();
  this.applyPose(this.pose);this.root.updateMatrixWorld(true);this.bones.head.getWorldQuaternion(this.prevHeadQ);
  this.placeTablet(true);
 },

 /* ---- 자세를 뼈에 적용 ---- */
 applyPose(p){
  const B=this.bones,sp=this.sp;
  this.root.position.set(p.tx+this.rootPos.x,p.ty,p.tz+this.rootPos.z);
  this.root.rotation.set(p.rx,p.ry,-p.rz,'YXZ');
  const pel=B.pelvis;pel.position.y=.62+p.py+sp.drop.x;pel.position.z=0;
  pel.rotation.set(p.pF+sp.pelvis.X,p.pT+sp.pelvis.Y,-(p.pR)+sp.pelvis.Z);
  B.spine.rotation.set(p.sF+sp.spine.X,p.sT+sp.spine.Y,-p.sR+sp.spine.Z);
  B.chest.rotation.set(p.cF+sp.chest.X,p.cT+sp.chest.Y,-p.cR+sp.chest.Z);
  B.neck.rotation.set(p.nF+sp.neck.X,p.nT+sp.neck.Y,-p.nR+sp.neck.Z);
  B.head.rotation.set(p.hF+sp.head.X,p.hT+sp.head.Y,-p.hR+sp.head.Z);
  
  
for(const a of this.arms){const n=a.nm,s=a.s,j=sp[n];
 if(!a.sh.userData.detached)a.sh.rotation.set(-(p[n+'sF'])+j.X,s*p[n+'sT']+j.Y,s*p[n+'sA']+j.Z);
 if(!a.el.userData.detached)a.el.rotation.set(-p[n+'eB'],0,0);
 if(!a.wr.userData.detached)a.wr.rotation.set(-p[n+'wF'],0,s*p[n+'wA']);
}



  for(const l of this.legs){const n=l.nm,s=l.s;
   l.hip.rotation.set(-p[n+'hF'],0,s*p[n+'hA']);l.knee.rotation.set(p[n+'kB']+sp[n+'k'].x,0,0);l.ank.rotation.set(-p[n+'aF'],0,0);
  }
  // 앞자락은 허벅지를 따라 들린다
  const fl=Math.max(0,(p.LhF+p.RhF)/2+(sp.drop.x<0?-sp.drop.x*1.5:0));
  this.apronF.rotation.x=-clamp(fl*.92-.05,0,1.5);this.apronB.rotation.x=clamp(-Math.min(p.LhF,p.RhF)*.6,0,.6)+fl*.12;
  this.belt.rotation.x=.2;
  // 몸 출렁임
  const sq=sp.squash;this.face.scale.set(1+sq.X,1+sq.Y,1+sq.Z);
  const bj=sp.belly;this.belly.scale.set(.345*(1+bj.X),.295*(1+bj.Y),.325*(1+bj.Z));
 },
 setCurl(a,c){if(a.wr.userData.detached)return;const s=a.s,h=a.hand,cc=clamp(c,-.1,1.2);
  for(let i=0;i<4;i++){const f=h.fingers[i];const k=cc*(1+i*.04);f.f.rotation.set(0,0,-s*k*1.45);f.f2.rotation.set(0,0,-s*k*1.55);}
  h.thumb.t.rotation.set(-.5-cc*.5,0,-s*(.5+cc*.55));h.thumb.t2.rotation.set(0,0,-s*cc*.9);
 },

 /* ---- 팔 IK: 손을 정해진 자리에 ---- */
 solveArm(a,ik){
  if(ik.w<.001||a.sh.userData.detached||a.el.userData.detached||a.wr.userData.detached)return;
  const chest=this.bones.chest;chest.updateWorldMatrix(true,false);
  const T=_av1.copy(ik.target);
  if(ik.space==='root')this.root.localToWorld(T);
  chest.worldToLocal(T);
  const S=a.sh.position,pole=_av2.set(S.x+a.s*.3,S.y-.2,S.z-.18);
  if(ik.pole)pole.copy(S).add(ik.pole);
  const E=_av3;solveTwoBone(S,T,pole,a.L1,a.L2,E);
  const v1=_av4.subVectors(E,S).normalize();
  const qU=_aq1.setFromUnitVectors(_down,v1);
  // 팔꿈치: 위팔 좌표에서 아래팔 방향
  const v2=_av5.subVectors(T,E).normalize().applyQuaternion(_aq2.copy(qU).invert());
  const qE=_aq3.setFromUnitVectors(_down,v2);
  // 손 방향
  let qH=null;
  if(ik.fd.lengthSq()>.1){
   const fd=_av6.copy(ik.fd).normalize(),pd=_av7.copy(ik.pd);
   if(ik.space==='root'){fd.applyQuaternion(this.root.quaternion);pd.applyQuaternion(this.root.quaternion);}
   const cq=chest.getWorldQuaternion(_aq4).invert();fd.applyQuaternion(cq);pd.applyQuaternion(cq);
   const yy=_av8.copy(fd).negate();const xx=_av9.copy(pd).multiplyScalar(-a.s);xx.addScaledVector(yy,-xx.dot(yy));if(xx.lengthSq()<1e-6)xx.set(1,0,0);xx.normalize();
   const zz=_av10.crossVectors(xx,yy);_am.makeBasis(xx,yy,zz);
   qH=_aq5.setFromRotationMatrix(_am);
   qH.premultiply(_aq6.copy(qU).multiply(qE).invert());
  }
  const w=smooth(ik.w);
  a.sh.quaternion.slerp(qU,w);a.el.quaternion.slerp(qE,w);if(qH)a.wr.quaternion.slerp(qH,w);
 },
 setIK(side,o){const a=this.arms[side==='L'?0:1],ik=this.ik[side];if(a&&(a.sh.userData.detached||a.el.userData.detached||a.wr.userData.detached)){ik.goal=0;return;}ik.goal=o.w==null?1:o.w;if(o.target)ik.target.copy(o.target);if(o.fd)ik.fd.copy(o.fd);if(o.pd)ik.pd.copy(o.pd);if(o.curl!=null)ik.curl=o.curl;ik.space=o.space||'root';ik.pole=o.pole||null;ik.rate=o.rate||8;},
 releaseIK(side,rate=6){const ik=this.ik[side];ik.goal=0;ik.rate=rate;},

 /* ---- 홀(내 사주가 적힌 옥판) ---- */
 placeTablet(instant){
  const t=this.tablet;if(!this.tabletHeld)return;
  const hl=this.arms[0].wr,hr=this.arms[1].wr;
  hl.updateWorldMatrix(true,false);hr.updateWorldMatrix(true,false);
  const a=hl.localToWorld(_av1.set(0,-.07,.02)),b=hr.localToWorld(_av2.set(0,-.07,.02));
  const mid=_av3.addVectors(a,b).multiplyScalar(.5);
  t.position.copy(mid).add(_av4.set(0,.15,.012).applyQuaternion(this.root.quaternion));
  t.quaternion.copy(this.root.quaternion);t.rotateX(-.12);
 },
 dropTablet(force){
  if(!this.tabletHeld)return;this.tabletHeld=false;
  const v=force?force.clone():V3(rnd(-.6,.6),1.2,1.2);
  this.tabletBody={v,w:V3(rnd(-8,8),rnd(-4,4),rnd(-10,10)),broken:false,rest:false};
  this.releaseIK('L',5);this.releaseIK('R',5);
 },
 updateTablet(dt){
  const b=this.tabletBody;if(!b||b.rest)return;
  const t=this.tablet;b.v.y-=9.8*dt;t.position.addScaledVector(b.v,dt);
  t.rotation.x+=b.w.x*dt;t.rotation.y+=b.w.y*dt;t.rotation.z+=b.w.z*dt;
  if(t.position.y<.03){
   t.position.y=.03;
   if(!b.broken&&Math.abs(b.v.y)>1.5){b.broken=true;AUDIO.tablet(true);this.breakTablet();return;}
   b.v.y*=-.25;b.v.x*=.5;b.v.z*=.5;b.w.multiplyScalar(.4);if(Math.abs(b.v.y)<.3){b.rest=true;t.rotation.set(-PI/2,t.rotation.y,0);}
  }
 },
 breakTablet(){
  // 홀이 바닥에 떨어져 두세 조각으로 깨진다
  const t=this.tablet,p=t.position.clone();this.tabletMesh.visible=false;
  const mats=this.tabletMesh.material;
  for(let i=0;i<3;i++){const h=.36/3,g=new THREE.BoxGeometry(.085,h*rnd(.8,1.1),.014);this.disposables.push(g);
   const m=mk(g,mats,scene,{p:[p.x+rnd(-.15,.15),.012,p.z+rnd(-.12,.2)],r:[-PI/2,rnd(-1,1),rnd(-.3,.3)]});
   const uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setY(k,(i+uv.getY(k))/3);
   this.shards=(this.shards||[]);this.shards.push(m);}
 },

 /* ---- 맞는 반응: 방향·부위·힘에 따라 스프링을 튕긴다 ---- */
 kickBody(part,dirW,power,kind){
  const d=_av1.copy(dirW).applyQuaternion(_aq1.copy(this.root.quaternion).invert());
  const sp=this.sp,P_=Math.min(power,3);
  const head=/head|face|nose|mouth|chin|eye|crown|beard/.test(part);
  if(head){
   const k=5.6*P_;
   sp.head.kick(d.z*k-(d.y>.2?d.y*k*1.3:0)+(d.y<-.3?-d.y*k*.6:0),d.x*k*1.25,-d.x*k*.75);
   sp.neck.kick(d.z*k*.45-(d.y>.2?d.y*k*.5:0),d.x*k*.5,-d.x*k*.35);
   sp.chest.kick(d.z*k*.12,d.x*k*.15,0);
   const s=.07*P_;sp.squash.kick(-Math.abs(d.x)*s*8+Math.abs(d.z)*s*3,-(Math.abs(d.y))*s*8+s*2,-Math.abs(d.z)*s*8+Math.abs(d.x)*s*3);
   this.rootVel.addScaledVector(_av2.set(d.x,0,Math.min(0,d.z)),(P_>=1.8?.34:.22)*P_);
  }else if(part==='belly'||part==='pelvis'){
   sp.spine.kick(Math.max(0,-d.z)*3.4*P_,d.x*1.2*P_,-d.x*1.2*P_);sp.chest.kick(Math.max(0,-d.z)*2.2*P_,0,0);sp.head.kick(2.6*P_,d.x*1.5,0);
   sp.pelvis.kick(-1.4*P_*Math.max(0,-d.z),0,0);sp.belly.kick(-.5*P_*0+.9*P_,-.8*P_,-1.4*P_);
   this.rootVel.addScaledVector(_av2.set(d.x,0,Math.min(0,d.z)),.4*P_);
  }else if(part==='chest'||part==='neck'){
   sp.chest.kick(d.z*2.8*P_,d.x*1.6*P_,-d.x*1.4*P_);sp.spine.kick(d.z*1.2*P_,0,0);sp.head.kick(d.z*2*P_-1.2*P_,d.x*1.2*P_,0);
   this.rootVel.addScaledVector(_av2.set(d.x,0,Math.min(0,d.z)),.42*P_);
  }else if(/^arm|^hand/.test(part)){
   const side=part.endsWith('L')?'L':'R';sp[side].kick(d.z*-3.5*P_,d.x*2*P_,d.x*3*P_);sp.chest.kick(0,d.x*1.4*P_,0);
   this.rootVel.addScaledVector(_av2.set(d.x,0,Math.min(0,d.z)),.15*P_);
  }else if(/^thigh|^shin|^foot/.test(part)){
   const side=part.endsWith('L')?'L':'R';sp[side+'k'].kick(5*P_);sp.drop.kick(-.9*P_);sp.pelvis.kick(0,0,(side==='L'?1:-1)*1.2*P_);
  }
 },

 /* ---- 매 프레임 ---- */
 update(dt,time){
  this.stateT+=dt;this.sinceHit+=dt;this.breath+=dt*(1.6+this.mood*1.4);
  const p=this.poseTmp;this.basePose(p,dt,time);
  if(this.shockT>0)this.shockT-=dt;else this.setEmotion(this.baseEmotion());
  if(this.state==='stand')this.updateIdle(dt,time);
  // 스프링·뿌리 이동
  for(const k in this.sp)this.sp[k].step(dt);
  if(this.state!=='stand')this.rootVel.set(0,0,0);
  this.rootPos.addScaledVector(this.rootVel,dt);this.rootVel.multiplyScalar(Math.exp(-dt*4.2));
  const home=this.state==='stand'?1:0;this.rootPos.x=damp(this.rootPos.x,0,1.4*home,dt);this.rootPos.z=damp(this.rootPos.z,0,1.25*home,dt);
  this.rootPos.z=clamp(this.rootPos.z,-.42,.12);this.rootPos.x=clamp(this.rootPos.x,-.25,.25);
  // 걸음: 뿌리가 움직이면 발을 번갈아 뗀다
  const sp=this.rootVel.length()+Math.abs(this.rootPos.z)*.5*(this.state==='stand'?1:0);this.stepAmt=damp(this.stepAmt,clamp(sp*2.2,0,1),8,dt);this.stepPhase+=dt*(5+sp*8);
  if(this.state==='stand'&&this.stepAmt>.02){const a=Math.sin(this.stepPhase)*.38*this.stepAmt;p.LhF+=a;p.RhF-=a;p.LkB+=Math.max(0,a)*1.3;p.RkB+=Math.max(0,-a)*1.3;p.py-=this.stepAmt*.025;}
  poseCopy(p,this.pose);this.applyPose(this.pose);
  // 팔 IK
  this.root.updateMatrixWorld(true);
  for(const a of this.arms){const ik=this.ik[a.nm];ik.w=damp(ik.w,ik.goal,ik.rate||8,dt);this.solveArm(a,ik);this.setCurl(a,lerp(this.pose[a.nm+'curl'],ik.curl,smooth(ik.w)));}
  this.root.updateMatrixWorld(true);
  this.updateFace(dt,time);this.updateTears(time);
  this.updateSecondary(dt);this.updateGuts(dt);
  if(this.tabletHeld)this.placeTablet();else this.updateTablet(dt);
  this.updateBits(dt);this.crownUpdate(dt);
  this.updateMaterials(dt);
 },
 updateSecondary(dt){
  // 매달린 것들(구슬줄·끈·수염): 부모의 월드 회전을 거꾸로 적용해 늘 아래로 처지게, 스프링으로 늦게 따라오게
  const hang=(piv,sx,sz)=>{const P=piv.parent;P.matrixWorld.decompose(_av6,_aq2,_av7);_aq2.invert();const d=_av1.set(0,-1,0).applyQuaternion(_aq2);
   sx.t=Math.atan2(-d.z,-d.y);sz.t=Math.atan2(d.x,-d.y);sx.step(dt);sz.step(dt);piv.rotation.set(sx.x,0,sz.x);piv.updateMatrix();piv.matrixWorld.multiplyMatrices(P.matrixWorld,piv.matrix);};
  for(const s of this.strings)if(s.piv.parent)hang(s.piv,s.sx,s.sz);
  for(const c of this.cords)if(c.piv.parent)hang(c.piv,c.sx,c.sz);
  for(const strand of this.beard)for(let i=0;i<strand.length;i++){const s=strand[i];hang(s.g,s.sx,s.sz);}
  // 소매 자락: 아래팔이 수평에 가까울수록 크게 늘어진다
  for(const a of this.arms){if(a.el.userData.detached)continue;const d=a.drape;
   a.el.matrixWorld.decompose(_av6,_aq4,_av7);
   const fa=_av2.set(0,-1,0).applyQuaternion(_aq4);const horiz=1-Math.abs(fa.y);
   const k=smooth((horiz-.15)/.6);const zf=_av3.set(fa.x,0,fa.z);if(zf.lengthSq()<1e-6)zf.set(0,0,1);zf.normalize();
   const yy=_av4.set(0,1,0),xx=_av5.crossVectors(yy,zf).normalize();_am.makeBasis(xx,yy,zf);
   const qw=_aq3.setFromRotationMatrix(_am);d.quaternion.copy(_aq4.invert().multiply(qw));
   const sc=.25+.75*k;d.scale.set(sc,sc,1);d.visible=k>.02;}
 },
 updateMaterials(dt){
  // 맞을 때 하얗게 번쩍 → 붉게 빠짐, 피를 잃으면 창백해짐
  const f=this.hitFlash=Math.max(0,(this.hitFlash||0)-dt*7);
  const pale=sat(this.bloodLost/4.4)*.55;
  if(this._pale!==Math.round(pale*50)){this._pale=Math.round(pale*50);this.M.skin.color.copy(col('#f1b48c')).lerp(col('#d9c0b0'),pale);this.M.skinD.color.copy(col('#dc9572')).lerp(col('#c4a596'),pale);this.M.blush.color.copy(col('#ef8f7a')).lerp(col('#d8a99e'),pale);this.M.lip.color.copy(col('#c65f55')).lerp(col('#a7787a'),pale);}
  for(const m of this.flashMats){m.emissive.setRGB(f*.42,f*.07,f*.05);}
for(const m of this.goreMeshes)m.visible=PREF.blood;
 },
});
const _down=V3(0,-1,0),_av1=V3(),_av2=V3(),_av3=V3(),_av4=V3(),_av5=V3(),_av6=V3(),_av7=V3(),_av8=V3(),_av9=V3(),_av10=V3();
const _aq1=new THREE.Quaternion(),_aq2=new THREE.Quaternion(),_aq3=new THREE.Quaternion(),_aq4=new THREE.Quaternion(),_aq5=new THREE.Quaternion(),_aq6=new THREE.Quaternion(),_am=new THREE.Matrix4();
/* ===== 6-4. 옥황상제 — 상태·행동·다운 =====
 * stand(서서 맞음) → fall(넘어짐) → down(넘어져 있음) → rise(일어남) → stand … 마지막은 final → dead */
const KD_POSE={
 flail:P({tz:-.3,py:-.04,sF:-.22,cF:-.18,nF:-.15,hF:-.35,LsA:1,RsA:.95,LsF:.55,RsF:.35,LeB:.3,ReB:.5,Lcurl:.1,Rcurl:.1,LhF:.25,RhF:-.05,LkB:.35,RkB:.15,LhA:.12,RhA:.12}),
 buckle:P({tz:.02,py:-.14,sF:.3,cF:.15,nF:-.05,hF:-.2,LsA:.5,RsA:.55,LsF:.6,RsF:.55,LeB:.4,ReB:.4,LhF:.55,RhF:.5,LkB:1.05,RkB:1,LaF:-.3,RaF:-.3}),
 allFours:P({tz:.02,py:-.3,pF:.25,sF:.55,cF:.25,nF:-.45,hF:-.75,LsA:.25,RsA:.25,LsF:1.25,RsF:1.25,LeB:.1,ReB:.1,Lcurl:.05,Rcurl:.05,LhF:.15,RhF:.15,LhA:.1,RhA:.1,LkB:1.5,RkB:1.5,LaF:-.8,RaF:-.8}),
 lunge:P({tz:.02,py:-.2,pF:.1,sF:.38,cF:.15,nF:.05,hF:-.1,LsA:.4,RsA:.4,LsF:.5,RsF:.6,LeB:.8,ReB:.5,LhF:1.35,RhF:-.05,LkB:1.55,RkB:1.4,LaF:-.25,RaF:-.75}),
 pushThrone:P({tz:-.56,py:-.06,pF:.2,sF:.45,cF:.15,nF:.05,hF:-.1,LsA:.62,RsA:.62,LsF:.15,RsF:.15,LeB:.6,ReB:.6,LhF:1.1,RhF:1.05,LhA:.2,RhA:.24,LkB:1.2,RkB:1.15}),
 hunchStand:P({tz:-.12,py:-.06,sF:.32,cF:.16,nF:.08,hF:-.05,LsA:.45,RsA:.45,LsF:.25,RsF:.25,LeB:.6,ReB:.6,LhF:.12,RhF:.12,LhA:.08,RhA:.08,LkB:.25,RkB:.25}),
 slump:P({tz:-.05,py:-.32,pF:.1,sF:.3,cF:.1,nF:-.15,hF:-.42,hR:.32,LsA:.7,RsA:.7,LsF:.3,RsF:.2,LeB:.3,ReB:.3,LhF:.9,RhF:.85,LhA:.3,RhA:.3,LkB:1.45,RkB:1.4}),
};
function seqEval(seq,t,out){
 if(t<=seq[0].t)return poseCopy(seq[0].pose,out);
 for(let i=1;i<seq.length;i++){const a=seq[i-1],b=seq[i];if(t<=b.t){const u=(t-a.t)/Math.max(1e-4,b.t-a.t),e=b.ease==='in'?easeIn(u):b.ease==='out'?easeOut3(u):b.ease==='back'?backOut(u,1.2):smooth(u);return poseLerp(a.pose,b.pose,e,out);}}
 return poseCopy(seq[seq.length-1].pose,out);
}

Object.assign(Emperor.prototype,{
 /* 단계: 0 비웃음(홀 들고) / 1 성남 / 2 아픔·겁 / 3 울며 빎 / 4 다 무너짐 */
 setPhase(n){this.phase=n;this.mood=[0,.25,.5,.75,1][n]||0;},
 baseEmotion(){
  const ph=this.phase,t=this.stateT;
  if(this.state==='dead')return 'ko';
  if(this.state==='down'||this.state==='fall'){const d=this.down&&this.down.type;return d==='throne'?'dazed':d==='kneel'?'beg':d==='final'?'ko':'cry';}
  if(this.state==='rise')return ph>=3?'cry':'hurt';
  if(this.laughing>.25)return 'laugh';
  if(ph===0)return this.taunt?'smug':'angry';
  if(ph===1)return this.sinceHit<1.5?'angry':(Math.sin(t*.5)>0?'angry':'annoyed');
  if(ph===2)return this.guard>.5?'scared':this.sinceHit<2?'hurt':'scared';
  if(ph===3)return this.act&&this.act.name==='beg'?'beg':'cry';
  return this.sinceHit<1.2?'cry':'dazed';
 },

 basePose(out,dt,time){
  const st=this.state;
  if(st==='stand')this.standPose(out,dt,time);
  else if(st==='fall'||st==='rise'){
   const d=this.down;seqEval(d.seq,this.stateT,out);
   if(d.events)for(const ev of d.events){if(!ev.done&&this.stateT>=ev.t){ev.done=true;ev.fn();}}
   if(this.stateT>=d.seq[d.seq.length-1].t){if(st==='fall'){this.state=d.type==='final'?'dead':'down';this.stateT=0;if(d.type==='final'&&this.onDead)this.onDead();}else{this.state='stand';this.stateT=0;this.down=null;this.rootPos.set(0,0,0);if(this.onRise)this.onRise();}}
  }else if(st==='down'||st==='dead'){
   const d=this.down,base=POSES[d.type];poseCopy(base,out);
   const t=time;
   if(d.type==='throne'){out.hR+=Math.sin(t*1.3)*.22;out.hF+=Math.cos(t*1.1)*.12;out.nR+=Math.sin(t*1.3+.6)*.08;this.dizzy=1;}
   else if(d.type==='kneel'){out.hF+=Math.sin(t*4.6)*.12;out.sF+=Math.sin(t*4.6)*.06+.06;this.beg(true);}
   else if(d.type==='floor'){out.hR+=Math.sin(t*.9)*.15;out.hF+=Math.sin(t*1.7)*.06;out.sF+=Math.sin(this.breath)*.02;}
   else if(d.type==='final'){out.cF+=Math.sin(this.breath*.7)*.012;}
   if(st==='down'){d.stay-=dt;if(d.stay<=0)this.startRise();}
  }
  // 숨쉬기
  const br=Math.sin(this.breath);out.cF+=br*.014;out.LsA+=br*.01;out.RsA+=br*.01;
  this.sp.belly.y.t=br*.012;
 },
 standPose(out,dt,time){
  poseCopy(STAND,out);
  const h=this.hunch=damp(this.hunch,clamp(this.phase*.24+(this.sinceHit<.6?.12:0),0,.9),2,dt);
  if(this.taunt){out.cF-=.1;out.hF-=.09;out.sF-=.05;out.hR+=.06;}
  out.sF+=.14*h;out.cF+=.12*h;out.nF+=.06*h;out.hF-=.06*h;out.py-=.035*h;out.LkB+=.18*h;out.RkB+=.18*h;out.LhF+=.1*h;out.RhF+=.1*h;out.LeB+=.25*h;out.ReB+=.25*h;
  const w=this.weak=damp(this.weak,clamp((this.phase-2)*.4+this.bloodLost*.15,0,1),1,dt);
  if(w>0){out.rz+=Math.sin(time*1.25)*.045*w;out.tx+=Math.sin(time*1.25)*.03*w;out.hR+=Math.sin(time*1.25+.5)*.1*w;}
  for(let i=0;i<2;i++){const l=this.limp[i];if(l>0){const n=i?'R':'L';out[n+'kB']+=.38*l;out[n+'hF']+=.15*l;out.py-=.05*l;out.pR+=(i?-1:1)*.08*l;}this.limp[i]=Math.max(0,l-dt*.05);}
  for(let i=0;i<2;i++){const ah=this.armHurt[i];if(ah>0){const n=i?'R':'L';out[n+'sA']=lerp(out[n+'sA'],.2,ah);out[n+'sF']=lerp(out[n+'sF'],-.05,ah);out[n+'eB']=lerp(out[n+'eB'],.1,ah);out[n+'curl']=lerp(out[n+'curl'],.1,ah);}this.armHurt[i]=Math.max(0,ah-dt*.07);}
  if(this.laughing>0){const L=this.laughing;out.hF-=.2*L;out.sF-=.06*L;out.cF+=Math.sin(time*13)*.035*L;out.hF+=Math.sin(time*13)*.05*L;this.sp.belly.kick(0,Math.sin(time*13)*.25*L*dt*60*.02,0);}
  if(this.mood>.4){const tr=Math.sin(time*29)*.006*this.mood;out.hT+=tr;out.cR+=tr*.5;}
  this.updateActions(out,dt,time);
 },

 /* ---- 행동(손을 쓰는 짧은 동작) ---- */
 armUsable(side){const a=this.arms[side==='L'?0:1];return !!(a&&!a.sh.userData.detached&&!a.el.userData.detached&&!a.wr.userData.detached);},
doAct(name,o={}){
   if(this.headDestroyed&&/^(face|wipe|spit|crown|laugh)$/.test(name))return false;
 if(o.side&&!this.armUsable(o.side)&&/^(clutch|face|wipe|look|shake|crown)$/.test(name)){const other=o.side==='L'?'R':'L';if(!this.armUsable(other))return false;o=Object.assign({},o,{side:other,both:false});}
 if(this.state!=='stand'&&!o.any)return false;if(this.act&&this.act.prio>(o.prio||0))return false;this.endAct();this.act=Object.assign({name,t:0,dur:o.dur||1.5,prio:o.prio||0},o);return true;
},
 endAct(){const a=this.act;if(!a)return;this.act=null;if(a.L!==false)this.releaseIK('L');if(a.R!==false)this.releaseIK('R');this.laughAmt=0;this.laughing=0;this.talk=0;},
 updateActions(out,dt,time){
  // 홀을 들고 있으면 두 손으로 받친다
  if(this.tabletHeld){
   const bob=Math.sin(time*1.4)*.006;
   for(const s of [-1,1])this.setIK(s<0?'L':'R',{target:_bv1.set(s*.034,.93+bob,.47),fd:_bv2.set(0,.15,1),pd:_bv3.set(-s,0,0),curl:.62,rate:10});
  }
  // 막기: 주먹을 얼굴 앞으로
  this.guardCool=Math.max(0,this.guardCool-dt);this.guardHold=Math.max(0,this.guardHold-dt);
  const gGoal=this.guardHold>0&&this.state==='stand'&&!this.tabletHeld?1:0;this.guard=damp(this.guard,gGoal,gGoal?16:5,dt);
  if(this.guard>.02&&!(this.act&&this.act.prio>=2)){
   for(const s of [-1,1]){const n=s<0?'L':'R';if(this.armHurt[s<0?0:1]>.5)continue;this.setIK(n,{w:this.guard,target:_bv1.set(s*.075,1.38-this.hunch*.08,.43),fd:_bv2.set(-s*.15,1,.25),pd:_bv3.set(s*.1,0,-1),curl:1.1,rate:30,pole:_bv4.set(s*.12,-.3,.05)});}
   out.hF+=.12*this.guard;out.nF+=.08*this.guard;out.sF+=.08*this.guard;
  }else if(!this.tabletHeld&&!this.act){if(this.ik.L.goal>0&&this.guard<.02)this.releaseIK('L');if(this.ik.R.goal>0&&this.guard<.02)this.releaseIK('R');}
  const a=this.act;if(!a)return;
  a.t+=dt;const u=a.t/a.dur;
  const n=a.side||'R',s=n==='L'?-1:1;
  switch(a.name){
   case 'laugh':{this.laughing=Math.sin(sat(u)*PI);this.laughAmt=this.laughing;break;}
   case 'clutch':{ // 상처를 손으로 누른다
    const seg=this.bones[a.seg]||this.bones.chest;seg.updateWorldMatrix(true,false);
    const pw=seg.localToWorld(_bv1.copy(a.lp)),nw=_bv2.copy(a.ln).transformDirection(seg.matrixWorld);
    const tgt=this.root.worldToLocal(pw.addScaledVector(nw,.045));
    const nrm=nw.transformDirection(_bm.copy(this.root.matrixWorld).invert());
    this.setIK(n,{target:tgt,fd:_bv3.set(-s*.4,-.6,.4),pd:_bv4.copy(nrm).negate(),curl:.35,rate:12});
    out.sF+=.12*Math.sin(sat(u)*PI);out.hF+=.2*Math.sin(sat(u)*PI);
    if(a.both){const m=n==='L'?'R':'L';this.setIK(m,{target:_bv5.copy(tgt).add(_bv6.set(-s*.06,.04,.02)),fd:_bv3.set(s*.4,-.6,.4),pd:_bv4.copy(nrm).negate(),curl:.35,rate:12});}
    break;}
   case 'face':{ // 얼굴을 감싼다
    this.setIK(n,{target:_bv1.set(s*.04,1.44,.5),fd:_bv2.set(-s*.2,1,.2),pd:_bv3.set(0,0,-1),curl:.3,rate:14});
    out.hF+=.35*Math.sin(sat(u)*PI);out.sF+=.12*Math.sin(sat(u)*PI);break;}
   case 'wipe':{ // 손등으로 코피를 닦고 손을 본다
    const k=sat(u*2.2),x=lerp(-.12,.14,smooth(k))*s;
    if(u<.5)this.setIK(n,{target:_bv1.set(x,1.42,.52),fd:_bv2.set(-s,.15,.1),pd:_bv3.set(0,0,1),curl:.55,rate:14});
    else{this.setIK(n,{target:_bv1.set(s*.06,1.18,.48),fd:_bv2.set(0,.6,.8),pd:_bv3.set(0,1,0),curl:.2,rate:7});this.gazeTarget.copy(this.ik[n].target);this.root.localToWorld(this.gazeTarget);out.hF+=.25;if(!a.gasp){a.gasp=true;AUDIO.gasp();this.doFlinch('shock',.7);}}
    break;}
   case 'look':{ // 피 묻은 손을 들여다본다
    this.setIK(n,{target:_bv1.set(s*.05,1.15,.46),fd:_bv2.set(0,.65,.75),pd:_bv3.set(0,1,0),curl:.15,rate:7});
    this.gazeTarget.copy(this.ik[n].target);this.root.localToWorld(this.gazeTarget);out.hF+=.28;
    if(!a.gasp&&u>.35){a.gasp=true;AUDIO.gasp();this.doFlinch('shock',.8);}break;}
   case 'spit':{ // 고개 돌려 침(피) 뱉기
    const k=Math.sin(sat(u)*PI);out.hT+=s*.55*k;out.hF+=.15*k;out.nT+=s*.2*k;
    if(!a.done&&u>.45){a.done=true;this.spitOut(s);}break;}
   case 'beg':{this.beg(false,u);break;}
   case 'shake':{ // 다친 손을 턴다
    this.setIK(n,{target:_bv1.set(s*.2,1.05+Math.sin(a.t*28)*.04,.35),fd:_bv2.set(0,-.4,1),pd:_bv3.set(-s,0,0),curl:.3,rate:20});break;}
   case 'crown':{ // 삐뚤어진 면류관을 바로잡는다
    this.setIK(n,{target:_bv1.set(s*.2,1.78,.05),fd:_bv2.set(-s,.2,0),pd:_bv3.set(0,-1,0),curl:.4,rate:9});
    if(!a.done&&u>.5){a.done=true;if(this.crownOn)this.crownTilt=Math.max(0,this.crownTilt-.6);}break;}
  }
  if(a.t>=a.dur)this.endAct();
 },
 beg(kneeling,u){
  // 두 손 모아 싹싹 빈다
  const t=this.stateT,rub=Math.sin(t*9)*.025,y=kneeling?.95:1.2;
  for(const s of [-1,1])this.setIK(s<0?'L':'R',{target:_bv1.set(s*.012,y+rub*s,kneeling?.36:.45),fd:_bv2.set(0,1,.25),pd:_bv3.set(-s,0,0),curl:.08,rate:9,space:'root',w:1});
  if(!kneeling&&u!=null&&u>.97){this.releaseIK('L');this.releaseIK('R');}
 },

 /* ---- 가만히 있을 때 하는 짓 ---- */
 updateIdle(dt,time){
  this.idleT=(this.idleT==null?2.5:this.idleT)-dt;
  if(this.headDestroyed)return;
  // 우는 소리
  if(this.phase>=3&&time>(this.sobT||0)){this.sobT=time+rnd(2.6,4.5);if(this.sinceHit>.8)AUDIO.voice('sob',.7);}
  if(this.act||this.sinceHit<1.2||this.guard>.1||this.idleT>0)return;
  this.idleT=rnd(1.6,3.2);
  const c=[];
  if(this.taunt){c.push(['laugh',3]);}
  else{
   if(this.crownOn!==false&&(this.crownTilt||0)>.45&&this.phase<=2)c.push(['crown',3]);
   if(this.noseBleeding&&!this.wiped)c.push(['wipe',4]);
   if(this.toothSpit>0)c.push(['spit',5]);
   else if(this.lipSplit&&Math.random()<.3)c.push(['spit',1]);
   if(BLOOD.lost>.35&&!this.lookedHand)c.push(['look',2]);
   if(this.phase>=3)c.push(['beg',3]);
   if(this.phase===1&&!this.taunt)c.push(['huff',1]);
  }
  if(!c.length)return;
  let tot=0;for(const x of c)tot+=x[1];let r=Math.random()*tot,name=c[0][0];for(const x of c){r-=x[1];if(r<=0){name=x[0];break;}}
  const side=Math.random()<.5?'L':'R';
  if(name==='laugh'){this.doAct('laugh',{dur:1.7,L:false,R:false});AUDIO.voice('laugh',1);}
  else if(name==='crown')this.doAct('crown',{side,dur:1.1});
  else if(name==='wipe'){this.wiped=true;this.doAct('wipe',{side:'R',dur:2.2});}
  else if(name==='spit'){this.doAct('spit',{side,dur:.9,L:false,R:false});}
  else if(name==='look'){this.lookedHand=true;this.doAct('look',{side,dur:1.8});}
  else if(name==='beg'){this.doAct('beg',{dur:rnd(2,3)});AUDIO.voice('beg',.8);}
  else if(name==='huff'){AUDIO.voice('huff',.7);this.doFlinch('angry',.6);}
 },
 /* 울 때: 아래 눈꺼풀에서 눈물이 볼을 타고 흐른다 */
 updateTears(time){
  if(this.headDestroyed)return;
  const crying=this.emo==='cry'||this.emo==='beg'||(this.emo==='scared'&&this.phase>=2)||(this.emo==='hurt'&&this.phase>=3);
  if(!crying||time<(this.tearT||0))return;
  this.tearT=time+rnd(.6,1.3);
  const live=this.eyes.filter(e=>!e.ruined&&!e.ejected);if(!live.length)return;const e=pick(live);
  e.eg.updateWorldMatrix(true,false);this.face.updateWorldMatrix(true,false);
  const p=e.eg.localToWorld(V3(rnd(-.012,.012),-.052,.018));
  const n=V3(0,-.25,1).applyQuaternion(this.face.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const pr=BLOOD.project(p,n,.05);if(pr)BLOOD.startRiv(pr.seg||'head',pr.point,pr.normal,{kind:'tear',w:.0056,speed:.11,maxLen:rnd(.12,.24)});
 },
 spitOut(s){
    if(this.headDestroyed)return;
  this.face.updateWorldMatrix(true,false);const m=this.face.localToWorld(V3(s*.03,-.1,.22));
  const dir=V3(s*.8,.15,.7).normalize();
  BLOOD.spray(m,dir,10,{kind:this.lipSplit||this.toothSpit>0?'blood':'spit',min:.8,max:2,spread:.3});
  if(this.toothSpit>0){this.toothSpit--;}
  AUDIO.voice('spit',.8);
 },

 /* ---- 다운 ---- */
 startFall(type){
  const from=P();poseCopy(this.pose,from);from.tx=this.root.position.x;from.tz=this.root.position.z;this.rootPos.set(0,0,0);this.rootVel.set(0,0,0);
  this.endAct();this.guardHold=0;this.releaseIK('L',10);this.releaseIK('R',10);this.taunt=false;
  const K=KD_POSE,ev=[];let seq;
  if(type==='throne'){seq=[{t:0,pose:from},{t:.32,pose:K.flail,ease:'out'},{t:.66,pose:poseLerp(K.flail,POSES.throne,.85,P()),ease:'in'},{t:1.05,pose:POSES.throne,ease:'back'}];ev.push({t:.66,fn:()=>{if(this.onImpact)this.onImpact('throne');}});}
  else if(type==='kneel'){seq=[{t:0,pose:from},{t:.26,pose:K.buckle,ease:'in'},{t:.52,pose:K.allFours,ease:'in'},{t:1.5,pose:K.allFours},{t:2.1,pose:POSES.kneel}];ev.push({t:.5,fn:()=>{if(this.onImpact)this.onImpact('knees');}},{t:1.2,fn:()=>{if(this.onCough)this.onCough();}});}
  else if(type==='floor'){seq=[{t:0,pose:from},{t:.3,pose:poseLerp(K.flail,K.buckle,.4,P()),ease:'out'},{t:.68,pose:poseLerp(K.buckle,POSES.floor,.7,P()),ease:'in'},{t:1.05,pose:POSES.floor,ease:'back'}];ev.push({t:.68,fn:()=>{if(this.onImpact)this.onImpact('floor');}});}
  else{seq=[{t:0,pose:from},{t:.5,pose:K.buckle,ease:'out'},{t:1.05,pose:K.slump,ease:'in'},{t:1.8,pose:POSES.final,ease:'in'},{t:2.4,pose:POSES.final}];ev.push({t:1.02,fn:()=>{if(this.onImpact)this.onImpact('knees');}},{t:1.75,fn:()=>{if(this.onImpact)this.onImpact('final');}});}
  this.down={type,seq,events:ev,stay:type==='throne'?3.4:type==='kneel'?4.4:type==='floor'?4:1e9,hitsDown:0};
  this.state='fall';this.stateT=0;
  if(this.tabletHeld)this.dropTablet();
 },
 startRise(){
  const d=this.down,from=P();poseCopy(this.pose,from);const K=KD_POSE,stand=P();poseCopy(STAND,stand);stand.sF=.2;stand.cF=.1;stand.LkB=.2;stand.RkB=.2;stand.py=-.04;
  let seq;
  if(d.type==='throne')seq=[{t:0,pose:from},{t:.55,pose:K.pushThrone},{t:1.15,pose:K.hunchStand},{t:1.75,pose:stand}];
  else if(d.type==='kneel')seq=[{t:0,pose:from},{t:.7,pose:K.lunge},{t:1.5,pose:K.hunchStand},{t:2.1,pose:stand}];
  else seq=[{t:0,pose:from},{t:.8,pose:K.allFours},{t:1.6,pose:K.lunge},{t:2.4,pose:K.hunchStand},{t:3,pose:stand}];
  for(const k of seq)k.pose.tz=k.pose.tz||0;
  this.down={type:d.type,seq,events:[{t:.2,fn:()=>{if(this.onRiseStart)this.onRiseStart(d.type);}}]};
  this.releaseIK('L',6);this.releaseIK('R',6);this.dizzy=0;
  this.state='rise';this.stateT=0;
 },
});
const _bv1=V3(),_bv2=V3(),_bv3=V3(),_bv4=V3(),_bv5=V3(),_bv6=V3(),_bm=new THREE.Matrix4();
const _abdN=new THREE.Matrix3();
/* ===== 6-5. 옥황상제 — 맞았을 때 =====
 * 부위·무기·방향에 따라: 몸 반응(스프링·행동), 상처(멍·혹·베인 자국·총알 구멍·흐르는 피), 이빨·코·눈·면류관, 목소리.
 * 돌려주는 값: 버팀 게이지를 얼마나 깎을지(dmg), 크게 휘청였는지(heavy) */
const HEADS=/^(head|face|nose|mouth|chin|eyeL|eyeR|crown|beard)$/;
const HEAD_FLESH=/^(head|face|nose|mouth|chin|eyeL|eyeR)$/;
const CUT_JOINTS={
 shoulderL:['shoulderL','elbowL'],elbowL:['elbowL','wristL'],wristL:['wristL'],
 shoulderR:['shoulderR','elbowR'],elbowR:['elbowR','wristR'],wristR:['wristR']
};
const CUT_CLUSTER_R={shoulder:.085,elbow:.072,wrist:.052};
const CUT_CAP_R={shoulder:.115,elbow:.092,wrist:.047};
const CUT_CAP_BODY={shoulder:.01,elbow:.012,wrist:.032};
const CUT_CAP_PIECE={shoulder:.108,elbow:.103,wrist:.033};
Object.assign(Emperor.prototype,{
 takeHit(h){
  const tool=h.tool,kind=h.kind,part=h.part,pt=h.point,n=h.normal,dir=h.dir;
  const blunt=tool==='hand'||tool==='pipe'||tool==='hammer',sharp=tool==='knife',gun=tool==='gun';
  const heavyTool=tool==='pipe'||tool==='hammer';
  const P=h.power;
  this.sinceHit=0;this.hitFlash=Math.min(1,(this.hitFlash||0)+(gun?.7:heavyTool?.8:.55));
  const isHead=HEADS.test(part),seg=h.obj&&h.obj.userData.seg||(isHead?'head':'chest');
  const down=this.state!=='stand';
  const out={dmg:0,heavy:false,blocked:false,first:false,part,isHead};
  // 첫 대: 홀을 떨어뜨리고 놀란다
  if(this.taunt){this.taunt=false;out.first=true;if(this.tabletHeld)this.dropTablet(V3(dir.x*1.5+rnd(-.4,.4),1.1,dir.z*.6+1.2));this.setPhase(1);this.setEmotion('shock');this.shockT=.7;AUDIO.gasp(1.2);}
  if(part==='tablet'){if(this.tabletHeld)this.dropTablet(V3(dir.x*3,1.4,1.5));out.dmg=.05;return out;}
  if(part==='crown'&&(sharp||gun)){this.kickBody('head',dir,P*.6,kind);if(gun)this.knockCrown(dir);else{this.crownTilt=(this.crownTilt||0)+.35;AUDIO.crown(.8);}this.doFlinch('shock',1);AUDIO.voice('gasp',1);out.dmg=.08;return out;}
  // 막기
  const blocked=this.guard>.5&&/^(arm|hand)/.test(part)&&!down;
  if(blocked){out.blocked=true;this.guardHP-=heavyTool||gun?2:sharp?1.4:1;this.kickBody(part,dir,P*.8,kind);AUDIO.block(P);
   if(this.guardHP<=0){this.guardHold=0;this.guardCool=4.5;this.guardHP=3;for(const s of ['L','R'])this.sp[s].kick(-6,0,(s==='L'?-1:1)*5);this.rootVel.z-=.8;this.doFlinch('shock',1);AUDIO.voice('yelp',1);out.heavy=true;}
   else{this.doFlinch('grunt',.8);if(Math.random()<.5)AUDIO.voice('grunt',.6);}
   if(sharp||gun){this.makeWound(seg,pt,n,dir,tool,kind,h,true);}
   out.dmg=(tool==='hand'?.09:heavyTool?.2:.14);return out;}
  // 몸 반응
  const kickP=P*(down?.55:1)*(blunt?1:sharp?.7:1.25);
  this.kickBody(part,dir,kickP,kind);
  const vol=clamp(P*.6,.3,1.4);
  // 얼굴 표정·목소리
  if(isHead){this.doFlinch('pain',1);}else if(part==='belly'){this.doFlinch(blunt?'oof':'pain',1);}else this.doFlinch(gun?'shock':'grunt',.9);
  this.voiceHit(tool,part,P,gun||sharp);
  // 부위별
  if(blunt)this.bluntHit(part,seg,pt,n,dir,tool,kind,P,h);
  else this.makeWound(seg,pt,n,dir,tool,kind,h,false);
  // 총 맞는 반응(부위별)
  if(gun&&!down)this.gunReact(part,seg,pt,n,dir);
    if(gun&&HEAD_FLESH.test(part))this.progressHeadGun(part,seg,pt,n,dir);
  if(sharp&&!down&&(kind==='stab')&&!/^(arm|hand)/.test(part)&&Math.random()<.85){const side=this.handFor(pt);this.doAct('clutch',{side,seg,lp:this.bones[seg].worldToLocal(pt.clone()),ln:n.clone().transformDirection(_invB(this.bones[seg])),dur:1.4,prio:1});}
  // 막기 시작(두 번째 다운 이후, 얼굴을 연달아 맞으면)
  if(isHead&&!this.headDestroyed&&!down&&this.phase>=2&&this.guardCool<=0){const now=G.time;this.hitsRecent=this.hitsRecent.filter(t=>now-t<1.1);this.hitsRecent.push(now);if(this.hitsRecent.length>=2&&Math.random()<.5+this.phase*.08){this.guardHold=rnd(1.4,2.4);this.guardHP=2+this.phase;this.guardCool=rnd(2.5,4);this.hitsRecent.length=0;if(this.act&&this.act.prio<2)this.endAct();}}
  // 크게 휘청
  out.heavy=P>=1.8||gun;
  // 게이지 피해
  const base={hand:kind==='hook'||kind==='upper'?.3:.23,pipe:.56,hammer:.64,knife:kind==='slash'?.13:.34,gun:.44}[tool]||.2;
  out.dmg=base*(isHead?1.15:1)*(down?.35:1);
  return out;
 },
 handFor(pt){
 const l=this.root.worldToLocal(pt.clone());let side=l.x<0?'L':'R',other=side==='L'?'R':'L';if(!this.armUsable(side)||(this.armHurt[side==='L'?0:1]>.5&&this.armUsable(other)))side=other;return side;
},
 voiceHit(tool,part,P,cut){
    if(this.headDestroyed)return;
  const now=G.time;if(now<(this.voiceCool||0))return;
  if(this.state==='dead'){if(Math.random()<.3){AUDIO.voice('groan',.4);this.voiceCool=now+1;}return;}
  if(part==='belly'&&(tool==='hand'||tool==='pipe'||tool==='hammer')){AUDIO.voice('oof',clamp(P*.6,.4,1.2));this.voiceCool=now+.32;return;}
  if(cut||P>1.6){AUDIO.voice(Math.random()<.5?'yelp':'scream',clamp(P*.55,.5,1.2));this.voiceCool=now+.42;return;}
  if(Math.random()<.75){AUDIO.voice('grunt',clamp(P*.7,.4,1));this.voiceCool=now+.24;}
 },
 /* 둔기: 멍·혹·코피·이빨·눈 붓기·면류관 */
 bluntHit(part,seg,pt,n,dir,tool,kind,P,h){
  const heavy=tool!=='hand';
  this.hitCount=(this.hitCount||0)+1;

  const knuckle=tool==='hand'&&part!=='crown'&&part!=='beard';
  if(knuckle){
   const ds=HEADS.test(part)?.037:.047;
   BLOOD.decal('dent',seg,pt,n,ds*(kind==='jab'?.9:1.08),{
    aspect:kind==='hook'?1.2:.95,
    angle:rnd(-.22,.22),
    grid:7
   });
  }

  if(HEADS.test(part)){
   if(part!=='crown'&&part!=='beard'&&!knuckle){
    BLOOD.decal(Math.random()<.5&&!heavy?'red':'bruise',seg,pt,n,heavy?.05:.035);
    const lumpOK=(part==='head'||(part==='face'&&pt.y>this.face.getWorldPosition(V3()).y-.01));
    if(lumpOK&&heavy)BLOOD.lump(seg,pt,n,.02,1);
   }
   if(part==='nose'){this.noseHits=(this.noseHits||0)+(heavy?2:1);
    if(this.noseHits>=2&&!this.noseBleeding){this.noseBleeding=true;for(const nn of this.nostrils){nn.updateWorldMatrix(true,false);BLOOD.addWound('head',nn.getWorldPosition(V3()),V3(0,-.4,1).normalize(),{rate:.0042,tau:60,kind:'nose'});}}
    if(this.noseHits>=(heavy?3:6)&&Math.abs(this.noseBend)<.3){this.noseBend=(dir.x>0?1:-1)*rnd(.22,.34);AUDIO.crack(1);BLOOD.spray(pt,n,10,{max:1.6});}
   }
   if(part==='mouth'||part==='chin'){
    const ch={hand:kind==='upper'?.3:kind==='hook'?.2:.11,pipe:.45,hammer:.5}[tool]||.1;
    if(Math.random()<ch)this.knockTooth(dir);
    if(!this.lipSplit&&(heavy||this.hitCount>5)){this.lipSplit=true;const c=this.face.localToWorld(V3(rnd(-.04,.04),-.105,.205));BLOOD.addWound('head',c,V3(0,-.2,1).normalize(),{rate:.0035,tau:50,kind:'lip'});}
    BLOOD.spray(pt,V3(dir.x,.3,.6).normalize(),heavy?14:6,{kind:this.lipSplit?'blood':'spit',max:2.2});
   }
   if(part==='eyeL'||part==='eyeR'||(part==='face'&&pt.y>this.face.getWorldPosition(V3()).y-.02)){
    const i=part==='eyeL'?0:part==='eyeR'?1:(this.face.worldToLocal(pt.clone()).x<0?0:1);
    this.swellU[i]=Math.min(1,this.swellU[i]+(heavy?.32:.12));
    if(this.swellU[i]>.45&&!this['blackEye'+i]){this['blackEye'+i]=true;const e=this.eyes[i];e.eg.updateWorldMatrix(true,false);BLOOD.decal('bruise','head',e.eg.getWorldPosition(V3()).add(V3(0,-.01,.03)),V3(e.s*.3,0,1).normalize(),.065);}
   }
   if(part==='head'&&pt.y>this.face.getWorldPosition(V3()).y+.08&&heavy&&!this.browCut&&Math.random()<.5){this.browCut=true;BLOOD.addWound('head',pt,n,{rate:.0045,tau:45,kind:'brow'});}
   if((part==='crown'||part==='head')&&this.crownOn!==false){this.crownTilt=(this.crownTilt||0)+(part==='crown'?.45:.15)*P*(kind==='upper'?1.6:1);if(this.crownTilt>1.15||(heavy&&part==='crown'&&Math.random()<.5))this.knockCrown(dir);else AUDIO.crown(.5);}
   if(this.swellU[0]+this.swellU[1]>0)this.dizzy=Math.max(this.dizzy,0);
   if(heavy)BLOOD.spray(pt,V3(dir.x*.5,.4,.5).normalize(),this.noseBleeding||this.lipSplit?12:5,{kind:this.noseBleeding||this.lipSplit?'blood':'spit',max:2.4});
  }else{
   if(heavy&&(part==='belly'||part==='chest'))BLOOD.spray(pt,n,6,{kind:'dust',max:1.2});
   if(/^(arm|hand)/.test(part)&&heavy&&Math.random()<.5){const side=part.endsWith('L')?'L':'R';this.doAct('shake',{side,dur:.9,prio:1});}
  }
 },

 /* 같은 복부 자리를 여러 번 그은 횟수를 기억한다. */
progressAbdomenCut(pW,nW,angle,strokeId,len){
 const bone=this.bones.spine;if(!bone)return null;
 bone.updateWorldMatrix(true,false);
 const lp=bone.worldToLocal(pW.clone());
 const ln=nW.clone().transformDirection(_invB(bone)).normalize();
 let z=null,bestD=Infinity;

 for(const x of this.abdomenCuts){
  const d=x.lp.distanceToSquared(lp);
  if(d<.105*.105&&d<bestD&&x.ln.dot(ln)>.2){
   z=x;bestD=d;
  }
 }

 if(!z){
  z={
   lp:lp.clone(),
   ln:ln.clone(),
   angle,
   len:clamp(len||.05,.03,.14),
   hits:0,
   stage:0,
   lastStroke:null
  };
  this.abdomenCuts.push(z);
  if(this.abdomenCuts.length>8)this.abdomenCuts.shift();
 }

 const sid=strokeId==null?'abd-'+(++this.cutStrokeFallback):strokeId;
 if(z.lastStroke===sid)return z;

 z.lastStroke=sid;
 z.hits++;
 z.lp.lerp(lp,.18);
 z.ln.lerp(ln,.18).normalize();
 z.angle=angle;
 z.len=Math.max(z.len,clamp(len||.05,.03,.14));
 z.stage=z.hits>=7?3:z.hits>=5?2:z.hits>=3?1:0;
 this.abdomenStage=Math.max(this.abdomenStage,z.stage);
 return z;
},

 /* 같은 복부 자리를 반복해서 그으면 벌어지고, 열린 뒤 내장이 쏟아진다. */
progressAbdomenCut(aW,bW,nW,angle,strokeId,len){
 const bone=this.bones.spine;if(!bone)return null;
 const mid=V3().addVectors(aW,bW).multiplyScalar(.5),pr=BLOOD.project(mid,nW,.18,[this.belly]);
 const pW=pr?pr.point:bW.clone(),hitN=pr?pr.normal:nW;
 const slashDirW=V3().subVectors(bW,aW);
 bone.updateWorldMatrix(true,false);
 const lp=bone.worldToLocal(pW.clone());
 const ln=hitN.clone().transformDirection(_invB(bone)).normalize();
 const lt=(slashDirW&&slashDirW.lengthSq()>1e-8?slashDirW.clone():V3(1,0,0)).transformDirection(_invB(bone));
 lt.addScaledVector(ln,-lt.dot(ln));if(lt.lengthSq()<1e-8)lt.crossVectors(ln,Math.abs(ln.y)>.9?V3(1,0,0):V3(0,1,0));lt.normalize();
 let z=null,bestD=Infinity;

 for(const x of this.abdomenCuts){
  const d=x.lp.distanceToSquared(lp);
  if(d<.105*.105&&d<bestD&&x.ln.dot(ln)>.2){z=x;bestD=d;}
 }

 if(this.abdomenTarget&&z!==this.abdomenTarget)return this.abdomenTarget;

 if(!z){
  z={lp:lp.clone(),ln:ln.clone(),lt:lt.clone(),angle,len:clamp(len||.05,.03,.14),hits:0,stage:0,lastStroke:null};
  this.abdomenCuts.push(z);
  if(this.abdomenCuts.length>8)this.abdomenCuts.shift();
 }

 const sid=strokeId==null?'abd-'+(++this.cutStrokeFallback):strokeId;
 if(z.lastStroke===sid)return z;

 z.lastStroke=sid;z.hits++;
 if(!this.abdomenOpen){
  z.lp.lerp(lp,.18);z.ln.lerp(ln,.18).normalize();
  if(z.lt.dot(lt)<0)lt.negate();z.lt.lerp(lt,.18).normalize();
  z.angle=angle;z.len=Math.max(z.len,clamp(len||.05,.03,.14));
 }

 if(!this.abdomenTarget&&z.hits>=3)this.abdomenTarget=z;
 if(z!==this.abdomenTarget)return z;

 const next=z.hits>=11?5:z.hits>=9?4:z.hits>=7?3:z.hits>=5?2:z.hits>=3?1:0;
 if(next>z.stage){z.stage=next;this.abdomenStage=Math.max(this.abdomenStage,next);this.advanceAbdomenCut(z);}
 if(this.abdomenOpen){
  let p;if(z.hostLP){this.belly.updateWorldMatrix(true,false);p=this.belly.localToWorld(z.hostLP.clone());}else p=z.lp.clone().applyMatrix4(bone.matrixWorld);
  BLOOD.clearDecalsNear('spine',p,.13,'cut');
 }
 return z;
},

advanceAbdomenCut(z){
 const bone=this.bones.spine;bone.updateWorldMatrix(true,false);let p,n;
 if(z.hostLP){this.belly.updateWorldMatrix(true,false);p=this.belly.localToWorld(z.hostLP.clone());n=z.hostLN.clone().applyMatrix3(_abdN.getNormalMatrix(this.belly.matrixWorld)).normalize();}
 else{p=z.lp.clone().applyMatrix4(bone.matrixWorld);n=z.ln.clone().transformDirection(bone.matrixWorld).normalize();}

 if(z.stage===1){
  const w=.026;
  BLOOD.decal('soak','spine',p,n,.12,{grow:.8});
  BLOOD.decal('cut','spine',p,n,w,{aspect:clamp(z.len/w,3,5.4),angle:z.angle,grid:9});
  BLOOD.addWound('spine',p,n,{rate:.027,tau:48,kind:'cut'});
  BLOOD.spray(p,n,13,{min:1,max:3.1,spread:.75});
  AUDIO.spurt(.65);this.hitFlash=1;
 }else if(z.stage===2){
  this.makeAbdomenCavity(z);
 }else if(z.stage===3){
  this.spillGuts(z);
 }else if(z.stage===4){
  this.releaseGutChains(1);
 }else if(z.stage===5){
  this.releaseGutChains(Infinity);
 }
},

makeAbdomenCavity(z){
 if(this.abdomenCavity)return this.abdomenCavity;
 const bone=this.bones.spine;bone.updateWorldMatrix(true,false);
 const approx=z.lp.clone().applyMatrix4(bone.matrixWorld);
 this.belly.updateWorldMatrix(true,false);
 z.hostLP=this.belly.worldToLocal(approx).normalize();z.hostLN=z.hostLP.clone();
 const p=this.belly.localToWorld(z.hostLP.clone());
 const n=z.hostLN.clone().applyMatrix3(_abdN.getNormalMatrix(this.belly.matrixWorld)).normalize();
 BLOOD.clearDecalsNear('spine',p,.14,null);
 BLOOD.decal('soak','spine',p,n,.15,{grow:.7});

 const g=grp(bone,null,'abdomenCavity');
 const tW=z.lt.clone().transformDirection(bone.matrixWorld).normalize();
 z.hostLT=tW.transformDirection(_invB(this.belly)).normalize();
 this.abdomenCavity=g;this.placeAbdomenCavity(z);

 const rx=clamp(z.len*.7,.09,.13),ry=.066;
 g.updateWorldMatrix(true,false);
 const onSkin=(q,lift=.002)=>{
  g.updateWorldMatrix(true,false);const faceN=V3(0,0,1).transformDirection(g.matrixWorld).normalize();
  const guess=g.localToWorld(q.clone()),hit=BLOOD.project(guess,faceN,.12,[this.belly]);
  if(!hit)return {p:q.clone(),n:V3(0,0,1)};
  const p=g.worldToLocal(hit.point.clone().addScaledVector(hit.normal,lift));
  const n=hit.normal.clone().transformDirection(_invB(g)).normalize();return {p,n};
 };

 const rings=5,sides=36,pitPos=[],pitCol=[],pitIdx=[],edge=col('#54101b'),deep=col('#120104');
 const addPit=(q,r)=>{const s=onSkin(q,.0015+r*.0015),c=deep.clone().lerp(edge,r*.86);pitPos.push(s.p.x,s.p.y,s.p.z);pitCol.push(c.r,c.g,c.b);};
 addPit(V3(),0);
 for(let ri=1;ri<=rings;ri++)for(let j=0;j<sides;j++){
  const r=ri/rings,a=j/sides*TAU,w=1+.045*Math.sin(a*5+1.1)+.025*Math.sin(a*11);
  addPit(V3(Math.cos(a)*rx*r*w,Math.sin(a)*ry*r*w,0),r);
 }
 const ringAt=(r,j)=>1+(r-1)*sides+(j+sides)%sides;
 for(let j=0;j<sides;j++)pitIdx.push(0,ringAt(1,j+1),ringAt(1,j));
 for(let r=1;r<rings;r++)for(let j=0;j<sides;j++){const a=ringAt(r,j),b=ringAt(r,j+1),c=ringAt(r+1,j),d=ringAt(r+1,j+1);pitIdx.push(a,b,c,b,d,c);}
 const pitGeo=new THREE.BufferGeometry();pitGeo.setAttribute('position',new THREE.Float32BufferAttribute(pitPos,3));pitGeo.setAttribute('color',new THREE.Float32BufferAttribute(pitCol,3));pitGeo.setIndex(pitIdx);pitGeo.computeVertexNormals();pitGeo.computeBoundingSphere();
 const pit=mk(pitGeo,this.M.cavity,g,{cast:false,receive:false});
 pit.renderOrder=4;pit.userData.noHit=true;pit.userData.gore=true;pit.visible=PREF.blood;this.goreMeshes.push(pit);

 const lips=[
  [[-rx*.94,.003],[-rx*.68,ry*.56],[-rx*.36,ry*.85],[-rx*.08,ry*.9]],
  [[rx*.06,ry*.92],[rx*.35,ry*.8],[rx*.68,ry*.5],[rx*.93,.006]],
  [[-rx*.92,-.005],[-rx*.58,-ry*.55],[-rx*.22,-ry*.88],[rx*.12,-ry*.94]],
  [[rx*.32,-ry*.82],[rx*.62,-ry*.53],[rx*.9,-.01]]
 ];
 for(let i=0;i<lips.length;i++){
  const nodes=lips[i].map(q=>onSkin(V3(q[0],q[1],0),.004)),pos=[],idx=[];
  for(let k=0;k<nodes.length;k++){
   const prev=nodes[Math.max(0,k-1)].p,next=nodes[Math.min(nodes.length-1,k+1)].p,t=V3().subVectors(next,prev).normalize();
   const side=V3().crossVectors(nodes[k].n,t).normalize(),w=(i%2?.0065:.008)*(1+.18*Math.sin(k*2.7+i));
   const a=nodes[k].p.clone().addScaledVector(side,w),b=nodes[k].p.clone().addScaledVector(side,-w);
   pos.push(a.x,a.y,a.z,b.x,b.y,b.z);if(k){const q=(k-1)*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();geo.computeBoundingSphere();
  const m=mk(geo,i===1?this.M.gutD:this.M.cutFlesh,g,{cast:false,receive:false});
  m.renderOrder=5;m.userData.noHit=true;m.userData.gore=true;m.visible=PREF.blood;this.goreMeshes.push(m);
 }

 z.abdomenSkinPoint=onSkin;

 this.abdomenOpen=true;
 BLOOD.addWound('spine',p,n,{rate:.047,tau:72,artery:true,kind:'cut',spread:.018});
 BLOOD.spray(p,n,26,{min:1.2,max:4.4,spread:1.05});
 this.screenSplat(p,.85);AUDIO.crack(.45);AUDIO.spurt(1);this.hitFlash=1;
 return g;
},

placeAbdomenCavity(z){
 const g=this.abdomenCavity;if(!g||!z||!z.hostLP)return;
 const bone=this.bones.spine,host=this.belly;
 host.updateWorldMatrix(true,false);bone.updateWorldMatrix(true,false);
 const p=host.localToWorld(z.hostLP.clone());
 const n=z.hostLN.clone().applyMatrix3(_abdN.getNormalMatrix(host.matrixWorld)).normalize();
 const x=z.hostLT.clone().transformDirection(host.matrixWorld);x.addScaledVector(n,-x.dot(n));
 if(x.lengthSq()<1e-8)x.crossVectors(n,Math.abs(n.y)>.9?V3(1,0,0):V3(0,1,0));x.normalize();
 g.position.copy(bone.worldToLocal(p.clone().addScaledVector(n,.003)));
 const y=V3().crossVectors(n,x).normalize();
 const qW=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,n));
 const qB=bone.getWorldQuaternion(new THREE.Quaternion()).invert();
 g.quaternion.copy(qB.multiply(qW));
},

spawnGutChain(parent,anchor,seed){
 const count=18,tube=new DynTube(count,7,seed%2?this.M.gutD:this.M.gut,{cast:false});
 tube.mesh.userData.noHit=true;tube.mesh.userData.gore=true;tube.mesh.visible=PREF.blood;
 tube.mesh.renderOrder=6;
 scene.add(tube.mesh);parent.updateWorldMatrix(true,false);

 const a=parent.localToWorld(anchor.clone());
 const side=V3(1,0,0).transformDirection(parent.matrixWorld).normalize();
 const out=V3(0,0,1).transformDirection(parent.matrixWorld).normalize();
 const pts=[],prev=[];
 for(let i=0;i<count;i++){
  const p=a.clone().addScaledVector(side,Math.sin(i*1.7+seed)*.004*i/count).addScaledVector(out,.002*i/count);
  p.y-=i*.0045;pts.push(p);prev.push(p.clone());
 }
 const radii=Array.from({length:count},(_,i)=>.0115*(i===0||i===count-1?.72:1));
 tube.update(pts,radii);
 const c={tube,parent,anchor:anchor.clone(),pts,prev,radii,rest:.009,targetRest:rnd(.039,.045),phase:rnd(0,TAU),pin:true,landed:false,sleep:0,asleep:false};
 this.gutChains.push(c);this.goreMeshes.push(tube.mesh);
 this.bits=this.bits||[];this.bits.push({obj:tube.mesh,rest:true,gut:true});
 return c;
},

spillGuts(z){
 if(this.gutSpilled)return false;
 const g=this.makeAbdomenCavity(z);if(!g)return false;
 this.gutSpilled=true;g.updateWorldMatrix(true,false);

 const onSkin=z.abdomenSkinPoint,coils=[
  [[-.075,.018],[-.045,.047],[-.008,.018],[.032,.048],[.073,.014]],
  [[-.065,-.02],[-.032,.008],[.004,-.018],[.041,.012],[.067,-.018]],
  [[-.052,.002],[-.024,-.035],[.012,-.006],[.047,-.038]]
 ];
 for(let i=0;i<coils.length;i++){
  const pts=coils[i].map((q,k)=>{const p=onSkin?onSkin(V3(q[0],q[1],0),.006+(k%2)*.002).p:V3(q[0],q[1],.008);return [p.x,p.y,p.z];});
  const m=mk(tubeGeo(pts,i===1?.011:.0095,20,8),i===1?this.M.gutD:this.M.gut,g,{cast:false});
  m.renderOrder=6;m.userData.noHit=true;m.userData.gore=true;m.visible=PREF.blood;this.goreMeshes.push(m);
 }

 const anchor=(x,y)=>onSkin?onSkin(V3(x,y,0),.011).p:V3(x,y,.011);
 this.spawnGutChain(g,anchor(-.04,-.025),0);
 this.spawnGutChain(g,anchor(.005,-.035),1);
 this.spawnGutChain(g,anchor(.045,-.02),2);

 const mouth=onSkin?onSkin(V3(0,-.01,0),.012):{p:V3(0,-.01,.012),n:V3(0,0,1)};
 const p=g.localToWorld(mouth.p.clone());
 const n=mouth.n.clone().transformDirection(g.matrixWorld).normalize();
 this.bits=this.bits||[];
 for(let i=0;i<3;i++){
  const pts=[[0,0,0],[rnd(-.018,.018),-.025,rnd(-.01,.018)],[rnd(-.025,.025),-.055,rnd(-.012,.02)],[rnd(-.015,.015),-.085,0]];
  const m=mk(tubeGeo(pts,rnd(.009,.014),12,7),i===1?this.M.gutD:this.M.gut,scene,{cast:true});
  m.position.copy(p).add(V3(rnd(-.045,.045),rnd(-.015,.025),rnd(-.008,.018)));
  m.rotation.set(rnd(-.4,.4),rnd(-.5,.5),rnd(-.5,.5));m.userData.noHit=true;m.userData.gore=true;m.visible=PREF.blood;this.goreMeshes.push(m);
  const v=n.clone().multiplyScalar(rnd(.18,.55)).add(V3(rnd(-.25,.25),rnd(-.05,.3),rnd(-.12,.12)));
  this.bits.push({obj:m,v,w:V3(rnd(-4,4),rnd(-5,5),rnd(-4,4)),r:.025,corners:this.limbCorners(m),bounce:.08,sound:i===0?'gut':null,bleed:{lp:V3(),ln:V3(0,0,1),t:0,life:10}});
 }

 BLOOD.addWound('spine',p,n,{rate:.068,tau:95,artery:true,kind:'cut',spread:.026});
 BLOOD.spray(p,n,42,{min:1.2,max:5.2,spread:1.25});
 this.screenSplat(p,1.25);AUDIO.crack(.75);AUDIO.spurt(1.35);this.hitFlash=1;this.rootVel.z-=.25;
 return true;
},

releaseGutChains(count=1){
 const list=this.gutChains.filter(c=>c.pin);if(!list.length)return false;
 const n=Math.min(list.length,count);
 for(let i=0;i<n;i++){
  const c=list[i];c.pin=false;c.sleep=0;c.asleep=false;
  for(let j=0;j<c.prev.length;j++)c.prev[j].copy(c.pts[j]).add(V3(rnd(-.006,.006),rnd(.004,.014),rnd(-.004,.004)));
 }
 if(this.abdomenTarget){
  const z=this.abdomenTarget,bone=this.bones.spine;bone.updateWorldMatrix(true,false);let p,nW;
  if(z.hostLP){this.belly.updateWorldMatrix(true,false);p=this.belly.localToWorld(z.hostLP.clone());nW=z.hostLN.clone().applyMatrix3(_abdN.getNormalMatrix(this.belly.matrixWorld)).normalize();}
  else{p=z.lp.clone().applyMatrix4(bone.matrixWorld);nW=z.ln.clone().transformDirection(bone.matrixWorld).normalize();}
  BLOOD.spray(p,nW,18+n*8,{min:.8,max:3.8,spread:1.15});this.screenSplat(p,.65+n*.18);
 }
 AUDIO.spurt(.9);return true;
},

updateGuts(dt){
 if(this.abdomenCavity&&this.abdomenTarget)this.placeAbdomenCavity(this.abdomenTarget);
 if(dt<=0)return;
 if(!this.gutChains||!this.gutChains.length)return;
 const h=Math.min(dt,.033);this.belly.updateWorldMatrix(true,false);
 const bellyM=this.belly.matrixWorld,bellyInv=_bm.copy(bellyM).invert();
 for(const c of this.gutChains){
  if(c.asleep)continue;
  c.parent.updateWorldMatrix(true,false);
  const anchor=c.parent.localToWorld(c.anchor.clone());
  c.phase+=h*2.2;c.rest=damp(c.rest,c.targetRest,2.2,h);

  let motion=0;
  for(let i=c.pin?1:0;i<c.pts.length;i++){
   const p=c.pts[i],old=c.prev[i];
   _av8.subVectors(p,old).multiplyScalar(.985);
   motion=Math.max(motion,_av8.lengthSq());
   old.copy(p);p.add(_av8);p.y-=9.8*h*h;
   if(c.pin)p.x+=Math.sin(c.phase+i*.7)*h*.0007;
  }

  let touchedFloor=false,floorX=0,floorZ=0;
  for(let pass=0;pass<5;pass++){
   if(c.pin)c.pts[0].copy(anchor);
   for(let i=1;i<c.pts.length;i++){
    const a=c.pts[i-1],b=c.pts[i],d=_av9.subVectors(b,a),L=d.length();
    if(L>1e-6){
     const k=(L-c.rest)/L;
     if(c.pin&&i===1)b.addScaledVector(d,-k);
     else{a.addScaledVector(d,k*.45);b.addScaledVector(d,-k*.55);}
    }
   }
   for(let i=0;i<c.pts.length;i++){
    const p=c.pts[i];
    if(!c.pin||i>0){
     const l=_av10.copy(p).applyMatrix4(bellyInv),q=l.x*l.x+l.y*l.y;
     if(l.z>0&&q<.98){const front=Math.sqrt(Math.max(0,1-q))+.035;if(l.z<front){l.z=front;p.copy(l.applyMatrix4(bellyM));c.prev[i].lerp(p,.3);}}
    }
    if(p.y>=.012)continue;
    p.y=.012;touchedFloor=true;floorX=p.x;floorZ=p.z;c.prev[i].x=lerp(c.prev[i].x,p.x,.18);c.prev[i].y=p.y;c.prev[i].z=lerp(c.prev[i].z,p.z,.18);
   }
  }
  if(c.pin)c.pts[0].copy(anchor);
  if(!c.pin&&touchedFloor&&!c.landed){c.landed=true;BLOOD.paintFloor(floorX,floorZ,.006,1.4);AUDIO.drip(.55);}
  c.tube.update(c.pts,c.radii);
  if(!c.pin&&touchedFloor&&motion<1e-6)c.sleep+=h;else c.sleep=0;
  if(c.sleep>.9)c.asleep=true;
 }
},

 /* 같은 팔 부위를 여러 번 그으면 얕은 상처 → 깊은 상처 → 관절 절단 */
cutJointFor(seg,pW){
 const names=CUT_JOINTS[seg];if(!names)return null;
 let best=null,bestD=Infinity;
 for(const name of names){
  const b=this.bones[name];
  if(!b||b.userData.detached)continue;
  b.updateWorldMatrix(true,false);
  const d=b.getWorldPosition(V3()).distanceToSquared(pW);
  if(d<bestD){bestD=d;best=name;}
 }
 return best;
},
progressCut(seg,pW,nW,angle,strokeId,len,dir){
 const candidates=CUT_JOINTS[seg];if(!candidates)return 0;
 let z=null,joint=null,bestD=Infinity;

 for(const x of this.cutZones){
  if(!candidates.includes(x.joint)||this.detached.has(x.joint))continue;
  const xb=this.bones[x.joint];
  if(!xb||xb.userData.detached)continue;
  xb.updateWorldMatrix(true,false);

  const d=x.lp.clone().applyMatrix4(xb.matrixWorld).distanceToSquared(pW);
  const rad=CUT_CLUSTER_R[x.joint.replace(/[LR]$/,'')]||.065;
  if(d>=rad*rad||d>=bestD)continue;

  const wn=x.ln.clone().transformDirection(xb.matrixWorld);
  if(wn.dot(nW)<.2)continue;

  z=x;joint=x.joint;bestD=d;
 }

 if(!joint)joint=this.cutJointFor(seg,pW);
 if(!joint||this.detached.has(joint))return 0;

 const bone=this.bones[joint];
 bone.updateWorldMatrix(true,false);

 const lp=bone.worldToLocal(pW.clone());
 const ln=nW.clone().transformDirection(_invB(bone)).normalize();

 if(!z){
  z={joint,seg,lp:lp.clone(),ln:ln.clone(),hits:0,lastStroke:null};
  this.cutZones.push(z);
  if(this.cutZones.length>48)this.cutZones.shift();
 }

 const sid=strokeId==null?'fallback-'+(++this.cutStrokeFallback):strokeId;
 if(z.lastStroke===sid)return z.hits;

 z.lastStroke=sid;
 z.hits++;
 z.lp.lerp(lp,.22);
 z.ln.lerp(ln,.22).normalize();
 z.seg=seg;

 const cutLen=clamp(len||.05,.03,.11);

 if(z.hits===2){
  const w=.018;
  BLOOD.decal('cut',seg,pW,nW,w,{
   aspect:clamp(cutLen/w,2.5,5.5),
   angle,
   grid:8
  });
  BLOOD.addWound(seg,pW,nW,{rate:.018,tau:36,kind:'cut'});
  BLOOD.spray(pW,nW,7,{max:2.4});
 }else if(z.hits===4){
  const w=.024;
  BLOOD.decal('soak',seg,pW,nW,.085,{grow:1.2});
  BLOOD.decal('cut',seg,pW,nW,w,{
   aspect:clamp(cutLen/w,2.4,5),
   angle,
   grid:9
  });
  BLOOD.addWound(seg,pW,nW,{rate:.032,tau:52,kind:'cut'});
  BLOOD.spray(pW,nW,15,{max:3.4});
  AUDIO.spurt(.7);
 }else if(z.hits>=6){
  this.detachArm(joint,nW,dir);
 }

 return z.hits;
},

makeCutCap(parent,pos,q,r,distal,offset){
 const g=grp(parent);
 g.position.copy(pos);
 g.quaternion.copy(q);
 g.translateY((distal?1:-1)*(offset||0));

 const s=distal?1:-1;
 const rx=distal?-PI/2:PI/2;

 const add=(rr,mat,d)=>{
  const m=mk(
   new THREE.CircleGeometry(rr,24),
   mat,
   g,
   {p:[0,s*d,0],r:[rx,0,0],cast:false}
  );
  m.userData.noHit=true;
  m.userData.gore=true;
  m.visible=PREF.blood;
  this.goreMeshes.push(m);
  return m;
 };

 add(r,this.M.cutFlesh,.001);
 add(r*.73,this.M.cutDeep,.002);
 add(r*.18,this.M.cutBone,.003);
 return g;
},

limbCorners(root){
 root.updateWorldMatrix(true,true);

 const inv=root.matrixWorld.clone().invert();
 const rel=new THREE.Matrix4();
 const out=[];

 root.traverse(o=>{
  if(!o.isMesh||!o.visible||!o.geometry)return;

  for(let n=o;n&&n!==root;n=n.parent){
   if(!n.visible)return;
  }

  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
  const b=o.geometry.boundingBox;

  rel.multiplyMatrices(inv,o.matrixWorld);

  for(const x of [b.min.x,b.max.x]){
   for(const y of [b.min.y,b.max.y]){
    for(const z of [b.min.z,b.max.z]){
     out.push(V3(x,y,z).applyMatrix4(rel));
    }
   }
  }
 });

 return out.length?out:null;
},

detachArm(joint,hitN,dir){
 const bone=this.bones[joint];
 if(!bone||bone.userData.detached||this.detached.has(joint))return false;

 const parent=bone.parent;
 if(!parent||!parent.userData.bone)return false;

 bone.updateWorldMatrix(true,true);
 parent.updateWorldMatrix(true,false);

 const jointW=bone.getWorldPosition(V3());
 const qW=bone.getWorldQuaternion(new THREE.Quaternion());
 const pLocal=bone.position.clone();
 const qLocal=bone.quaternion.clone();
 const corners=this.limbCorners(bone);

 const base=joint.replace(/[LR]$/,'');
 const r=CUT_CAP_R[base]||.07;
 const bodyOff=CUT_CAP_BODY[base]||.01;
 const pieceOff=CUT_CAP_PIECE[base]||.04;

 this.makeCutCap(parent,pLocal,qLocal,r,false,bodyOff);
 this.makeCutCap(bone,V3(),new THREE.Quaternion(),r,true,pieceOff);

 this.endAct();
 if(this.tabletHeld)this.dropTablet();

 scene.attach(bone);

 const removed=new Set();
 const matClones=new Map();

 const ownMat=m=>{
  if(!m)return m;
  if(!matClones.has(m)){
   const c=m.clone();
   matClones.set(m,c);
   this.disposables.push(c);
  }
  return matClones.get(m);
 };

 bone.traverse(o=>{
  o.userData.detached=true;
  if(o.isMesh){
   removed.add(o);
   o.material=Array.isArray(o.material)
    ?o.material.map(ownMat)
    :ownMat(o.material);
  }
 });

 this.parts=this.parts.filter(o=>!removed.has(o));
 this.detached.add(joint);

 const side=joint.endsWith('L')?'L':'R';
 this.releaseIK(side,20);
 this.armHurt[side==='L'?0:1]=1;

 const push=(dir?dir.clone():V3(0,0,1)).multiplyScalar(1.1);
 push.x+=rnd(-.45,.45);
 push.y=Math.max(.8,push.y+.95);
 push.z+=rnd(-.25,.25);

 this.bits=this.bits||[];
 this.bits.push({
  obj:bone,
  v:push,
  w:V3(rnd(-7,7),rnd(-9,9),rnd(-7,7)),
  r:.03,
  bounce:.16,
  sound:'limb',
  corners,
  bleed:{
   lp:V3(0,pieceOff+.007,0),
   ln:V3(0,1,0),
   t:0,
   life:12
  }
 });

 const nParent=V3(0,-1,0).applyQuaternion(qW).normalize();
 const nPiece=nParent.clone().negate();
 const parentSeg=parent.userData.bone;

 const bodyW=jointW.clone().addScaledVector(nParent,bodyOff+.004);
 const pieceW=jointW.clone().addScaledVector(nPiece,pieceOff+.004);

 BLOOD.addWound(parentSeg,bodyW,nParent,{
  rate:.055,
  tau:70,
  artery:true,
  kind:'cut'
 });

 BLOOD.addWound(joint,pieceW,nPiece,{
  rate:.02,
  tau:35,
  kind:'cut'
 });

 const sprayN=hitN
  ?hitN.clone().lerp(nParent,.35).normalize()
  :nParent;

 BLOOD.spray(bodyW,sprayN,28,{
  min:1.4,
  max:4.8,
  spread:1.15
 });

 AUDIO.crack(1.4);
 AUDIO.spurt(1.2);
 this.hitFlash=1;
 this.rootVel.z-=.28;
 return true;
},


makeEyeSocket(i){
 const e=this.eyes[i];if(e.socket)return e.socket;
 const g=e.socket=grp(e.eg,null,'emptySocket');
 const cavity=mk(sphereGeo(18),this.M.socket,g,{p:[0,0,.041],s:[.039,.034,.012],cast:false,receive:false});
 cavity.userData.noHit=true;
 for(let k=0;k<9;k++){
  const a=k/9*TAU+rnd(-.09,.09),x=Math.cos(a)*.039,y=Math.sin(a)*.032;
  const m=mk(sphereGeo(8),k%4===0?this.M.cutBone:this.M.cutFlesh,g,{p:[x,y,.041+rnd(-.002,.002)],s:[rnd(.006,.011),rnd(.004,.008),rnd(.003,.006)],cast:false});
  m.rotation.z=a;m.userData.noHit=true;if(k%4!==0){m.visible=PREF.blood;this.goreMeshes.push(m);}
 }
 e.upLid.userData.part='face';e.loLid.userData.part='face';
 return g;
},

ejectEye(i,n,dir){
 const e=this.eyes[i];if(!e||e.ejected||this.headDestroyed)return false;
 e.ejected=true;e.ruined=true;this.swellU[i]=1;this.makeEyeSocket(i);
 const nerve=mk(taperTube([[0,0,-.025],[e.s*.004,-.008,-.056],[-e.s*.006,-.02,-.092]],.0065,.0028,8,6),this.M.optic,e.gaze,{cast:false});
 nerve.userData.noHit=true;nerve.visible=PREF.blood;this.goreMeshes.push(nerve);
 e.gaze.attach(e.hl);e.gaze.updateWorldMatrix(true,true);
 const wp=e.gaze.getWorldPosition(V3()),wq=e.gaze.getWorldQuaternion(new THREE.Quaternion());
 scene.add(e.gaze);e.gaze.position.copy(wp);e.gaze.quaternion.copy(wq);e.gaze.scale.set(1,1,1);
 const removed=new Set();e.gaze.traverse(o=>{o.userData.detached=true;if(o.isMesh)removed.add(o);});
 this.parts=this.parts.filter(o=>!removed.has(o));
 e.eg.updateWorldMatrix(true,false);const eyeN=V3(0,0,1).applyQuaternion(e.eg.getWorldQuaternion(new THREE.Quaternion())).normalize();if(n)eyeN.lerp(n,.2).normalize();
 const push=eyeN.clone().multiplyScalar(rnd(1.25,1.75));
 push.add(V3(rnd(-.35,.35),rnd(.5,1),rnd(-.18,.18)));if(dir)push.addScaledVector(dir,-.18);
 this.bits=this.bits||[];this.bits.push({obj:e.gaze,v:push,w:V3(rnd(-9,9),rnd(-12,12),rnd(-8,8)),r:.043,bounce:.2,sound:'eye',bleed:{lp:V3(0,0,-.045),ln:V3(0,0,-1),t:0,life:8}});
 const p=e.eg.getWorldPosition(V3()),sn=eyeN;
 BLOOD.clearDecalsNear('head',p,.07,'hole');
 BLOOD.addWound('head',p,sn,{rate:.026,tau:45,kind:'hole'});BLOOD.spray(p,sn,18,{min:1.1,max:3.8,spread:.75});
 this.screenSplat(p,.75);AUDIO.spurt(.9);return true;
},

makeHeadCavity(seg,pt,n,size){
 if(this.headDestroyed)return null;const anchor=seg==='jaw'?this.bones.jaw:this.face;anchor.updateWorldMatrix(true,false);
 BLOOD.clearDecalsNear(seg,pt,size*1.25,'hole');
 const g=grp(anchor,null,'headCavity'),nn=n.clone().normalize();
 g.position.copy(anchor.worldToLocal(pt.clone().addScaledVector(nn,.002)));
 const up=Math.abs(nn.y)>.9?V3(1,0,0):V3(0,1,0),x=V3().crossVectors(up,nn).normalize(),y=V3().crossVectors(nn,x).normalize();
 const qW=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,nn));
 g.quaternion.copy(anchor.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qW));
 const cavity=mk(sphereGeo(18),this.M.socket,g,{p:[0,0,size*.3],s:[size,size*.82,size*.24],cast:false,receive:false});
 cavity.userData.noHit=true;
 for(let k=0;k<8;k++){
  const a=k/8*TAU+rnd(-.12,.12),m=mk(sphereGeo(8),k%5===0?this.M.cutBone:this.M.cutFlesh,g,{p:[Math.cos(a)*size*.82,Math.sin(a)*size*.68,size*.22+rnd(-size*.035,size*.035)],s:[rnd(.16,.3)*size,rnd(.12,.24)*size,rnd(.08,.16)*size],cast:false});
  m.rotation.z=a;m.userData.noHit=true;if(k%5!==0){m.visible=PREF.blood;this.goreMeshes.push(m);}
 }
 return g;
},

throwHeadBits(pt,n,count,scale){
 const nn=n?n.clone().normalize():V3(0,0,1);this.bits=this.bits||[];
 for(let i=0;i<count;i++){
  const bone=i%4===0,brain=!bone&&i%3===0,mat=bone?this.M.cutBone:brain?this.M.brain:this.M.cutFlesh;
  const s=scale*rnd(.45,1),m=mk(sphereGeo(8),mat,scene,{s:[s*rnd(.65,1.25),s*rnd(.45,1),s*rnd(.5,1.15)],cast:true});
  m.position.copy(pt).add(V3(rnd(-scale,scale),rnd(-scale,scale),rnd(-scale,scale)));m.rotation.set(rnd(0,PI),rnd(0,PI),rnd(0,PI));
  if(!bone){m.visible=PREF.blood;this.goreMeshes.push(m);}
  const v=nn.clone().multiplyScalar(rnd(1.4,3.6)).add(V3(rnd(-1.4,1.4),rnd(.6,2.5),rnd(-.9,.9)));
  this.bits.push({obj:m,v,w:V3(rnd(-14,14),rnd(-14,14),rnd(-14,14)),r:s,bounce:.18,sound:i===0?'head':null,bleed:bone?null:{lp:V3(),ln:V3(0,0,1),t:0,life:rnd(2,4)}});
 }
},

spawnHeadSpall(seg,pt,n,count,size){
 this.makeHeadCavity(seg,pt,n,size);this.throwHeadBits(pt,n,count,size*.72);
 BLOOD.spray(pt,n,count*5,{min:1.2,max:4.2,spread:.9});AUDIO.crack(.75);
},

progressHeadGun(part,seg,pt,n,dir){
 if(this.headDestroyed)return false;this.headGunHits++;
 if(part==='eyeL'||part==='eyeR'){
  const i=part==='eyeL'?0:1;this.eyeGunHits[i]++;
  if(this.eyeGunHits[i]>=2)this.ejectEye(i,n,dir);
 }
 const nearestEye=()=>{
  const live=this.eyes.map((e,i)=>({e,i})).filter(x=>!x.e.ejected);if(!live.length)return -1;
  live.sort((a,b)=>a.e.eg.getWorldPosition(V3()).distanceToSquared(pt)-b.e.eg.getWorldPosition(V3()).distanceToSquared(pt));return live[0].i;
 };
 if(this.headGunHits>=3&&this.headDamageStage<1){this.headDamageStage=1;if(this.crownOn!==false)this.knockCrown(dir);this.spawnHeadSpall(seg,pt,n,3,.034);}
 if(this.headGunHits>=6&&this.headDamageStage<2){this.headDamageStage=2;if(this.eyes.every(e=>!e.ejected)){const i=nearestEye();if(i>=0)this.ejectEye(i,n,dir);}this.spawnHeadSpall(seg,pt,n,3,.043);}
 if(this.headGunHits>=9&&this.headDamageStage<3){this.headDamageStage=3;const i=nearestEye();if(i>=0)this.ejectEye(i,n,dir);this.spawnHeadSpall(seg,pt,n,4,.052);}
   if(this.headGunHits>=12&&this.headDamageStage<4){this.headDamageStage=4;this.destroyHead(pt,n,dir);}
 return true;
},

destroyHead(pt,n,dir){
 if(this.headDestroyed)return false;
 this.endAct();this.guardHold=0;this.guard=0;this.releaseIK('L',10);this.releaseIK('R',10);
 if(this.crownOn!==false)this.knockCrown(dir||V3(0,.5,1));
 for(let i=0;i<2;i++)if(!this.eyes[i].ejected)this.ejectEye(i,n,dir);
 BLOOD.clearSegment('head');BLOOD.clearSegment('jaw');
 this.face.updateWorldMatrix(true,false);const center=this.face.localToWorld(V3(0,.04,.02));
 const gone=new Set();this.face.traverse(o=>{if(o.isMesh){gone.add(o);o.userData.headGone=true;}});this.parts=this.parts.filter(o=>!gone.has(o));
 this.face.visible=false;this.headDestroyed=true;this.wiped=true;this.toothSpit=0;this.noseBleeding=false;this.lipSplit=false;
 const ruin=this.headRuin=grp(this.bones.head,[this.faceRest.x,this.faceRest.y,this.faceRest.z],'headRuin');
 const core=mk(new THREE.IcosahedronGeometry(1,1),this.M.skinD,ruin,{p:[0,-.105,-.012],s:[.145,.085,.12],part:'head',flow:true});
 core.userData.seg='head';this.headCore=core;this.parts.push(core);(this.flow.head||(this.flow.head=[])).push(core);FASTRAY.grid(core.geometry);
 const cavity=mk(sphereGeo(20),this.M.socket,ruin,{p:[0,.02,.035],s:[.15,.125,.12],cast:false,receive:false});cavity.userData.noHit=true;
 for(let i=0;i<4;i++){const s=i<2?-1:1,x=s*rnd(.025,.072),y=rnd(-.005,.065),z=rnd(.035,.07);const b=mk(sphereGeo(10),i%2?this.M.brainD:this.M.brain,ruin,{p:[x,y,z],s:[rnd(.032,.052),rnd(.024,.043),rnd(.022,.038)],cast:false});b.userData.noHit=true;b.visible=PREF.blood;this.goreMeshes.push(b);}
 for(let i=0;i<11;i++){const a=i/11*TAU+rnd(-.12,.12),bone=i%4===0,m=mk(sphereGeo(8),bone?this.M.cutBone:this.M.cutFlesh,ruin,{p:[Math.cos(a)*rnd(.115,.145),.02+Math.sin(a)*rnd(.09,.12),.115+rnd(-.012,.012)],s:[rnd(.015,.03),rnd(.01,.024),rnd(.009,.02)],cast:false});m.rotation.z=a;m.userData.noHit=true;if(!bone){m.visible=PREF.blood;this.goreMeshes.push(m);}}
 this._flowAll=null;this.throwHeadBits(center,n,11,.047);
 ruin.updateWorldMatrix(true,false);const p=ruin.localToWorld(V3(0,-.04,.1)),hn=V3(0,.25,1).applyQuaternion(this.bones.head.getWorldQuaternion(new THREE.Quaternion())).normalize();
 BLOOD.addWound('head',p,hn,{rate:.07,tau:70,artery:true,kind:'cut'});BLOOD.spray(center,n||hn,52,{min:1.5,max:5.5,spread:1.25});this.screenSplat(center,1.5);
 AUDIO.crack(1.6);AUDIO.spurt(1.4);this.hitFlash=1;this.rootVel.z-=.5;return true;
},


/* 칼·총: 상처 + 계속 흐르는 피 */
 makeWound(seg,pt,n,dir,tool,kind,h,onGuard){
  const gun=tool==='gun',isHead=HEADS.test(h.part);
  const artery=h.part==='neck'||(/^thigh/.test(h.part)&&gun&&Math.random()<.5);
  if(gun){
const hs=isHead?.021:.027;
BLOOD.decal('soak',seg,pt,n,isHead?.06:.12,{grow:isHead?1:5});
BLOOD.decal('hole',seg,pt,n,hs,{grid:7});




   BLOOD.addWound(seg,pt,n,{rate:artery?.05:isHead?.026:.022,tau:artery?22:30,artery,kind:'hole'});
   // 뒤로 뚫고 나가 옥좌에 튄다
   const back=V3().copy(pt).addScaledVector(dir,.35);for(let i=0;i<10;i++){const v=V3().copy(dir).multiplyScalar(rnd(4,7.5)).add(V3(rnd(-.9,.9),rnd(-.3,1),rnd(-.4,.4)));BLOOD.emit('blood',back,v,rnd(.003,.007),1.2);}
   BLOOD.spray(pt,n.clone().lerp(V3(0,0,1),.4).normalize(),14,{max:3.4});
   if(isHead||h.part==='neck'||h.part==='chest')this.screenSplat(pt,isHead?1:.7);
  }else if(kind==='slash'&&h.slashFrom){
   const a=h.slashFrom,b=pt,mid=V3().addVectors(a,b).multiplyScalar(.5),len=a.distanceTo(b),ang=this.angleOnSurface(a,b,n);
   const half=Math.max(.012,len*.55),cw=isHead?.011:.014;
BLOOD.decal('cut',seg,mid,n,cw,{
 aspect:Math.max(1.8,half/cw),
 angle:ang,
 grid:8
});

   const bone=this.bones[seg];bone.updateWorldMatrix(true,false);const inv=_invB(bone);
   const w_=BLOOD.addWound(seg,mid,n,{rate:clamp(len*.3,.006,.02)*(artery?2.5:1),tau:22,artery,kind:'cut',line:[bone.worldToLocal(a.clone()),bone.worldToLocal(b.clone())]});
   for(let i=0;i<Math.min(3,Math.ceil(len*40));i++){const q=V3().copy(a).lerp(b,rnd(.1,.9));const pr=BLOOD.project(q,n,.05);if(pr)BLOOD.startRiv(pr.seg||seg,pr.point,pr.normal,{w:rnd(.003,.0048),maxLen:rnd(.08,.3)});}
   BLOOD.spray(mid,n,clamp(Math.round(len*120),4,14),{max:2.2});
   if(isHead&&Math.random()<.6)this.screenSplat(mid,.45);
if(h.part==='belly')this.progressAbdomenCut(mid,n,ang,h.strokeId,len);
   else if(h.part==='belly'&&h.obj===this.belly&&seg==='spine')this.progressAbdomenCut(a,b,n,ang,h.strokeId,len);
   else this.progressCut(seg,mid,n,ang,h.strokeId,len,dir);
  }else{
   const ca=rnd(0,PI),sw=.013;
BLOOD.decal('cut',seg,pt,n,sw,{
 aspect:2.6,
 angle:ca,
 grid:7
});

   if(!isHead)BLOOD.decal('soak',seg,pt,n,.08,{grow:4});
   BLOOD.addWound(seg,pt,n,{rate:artery?.045:.012,tau:artery?20:26,artery,kind:'stab'});
   BLOOD.spray(pt,n,12,{max:2.6});
   if(isHead||artery)this.screenSplat(pt,.6);
  }
  if(h.part==='eyeL'||h.part==='eyeR'){const i=h.part==='eyeL'?0:1;this.eyes[i].ruined=true;this.swellU[i]=Math.max(this.swellU[i],.7);}
 },
 angleOnSurface(a,b,n){const d=V3().subVectors(b,a).normalize();const u=V3().crossVectors(n,Math.abs(n.y)>.9?V3(1,0,0):V3(0,1,0)).normalize(),v=V3().crossVectors(n,u);return Math.atan2(d.dot(v),d.dot(u));},
 screenSplat(pt,amt){const s=pt.clone().project(camera);if(Math.abs(s.x)>1.2||Math.abs(s.y)>1.2)return;const W=innerWidth,H=innerHeight,cx=(s.x*.5+.5)*W,cy=(-s.y*.5+.5)*H,m=Math.min(W,H),n=Math.round(1+amt*2.2);
  for(let i=0;i<n;i++){const a=rnd(0,TAU),d=rnd(.3,.55)*m;SBLOOD.add(clamp(cx+Math.cos(a)*d,8,W-8),clamp(cy+Math.sin(a)*d,70,H-120),rnd(12,26)*(.6+amt));}},
 /* 총 맞는 반응: 머리·목·몸통·팔·다리 */
 gunReact(part,seg,pt,n,dir){
  const lp=this.bones[seg].worldToLocal(pt.clone()),ln=n.clone().transformDirection(_invB(this.bones[seg]));
  if(HEADS.test(part)){this.rootVel.z-=1.05;this.sp.head.kick(-9,dir.x*6,0);if(!this.headDestroyed){this.doAct('face',{side:this.handFor(pt),dur:1.5,prio:2});this.setEmotion('shock');this.shockT=1;}}
  else if(part==='neck'){this.doAct('clutch',{side:'R',both:true,seg,lp,ln,dur:2.4,prio:2});this.rootVel.z-=.6;}
  else if(part==='chest'||part==='belly'||part==='pelvis'){this.doAct('clutch',{side:this.handFor(pt),seg,lp,ln,dur:2,prio:2});this.rootVel.z-=.9;this.sp.spine.kick(3.2,0,0);this.sp.head.kick(-1.5,0,0);}
  else if(/^(arm|hand)/.test(part)){const i=part.endsWith('L')?0:1;this.armHurt[i]=1;this.sp[i?'R':'L'].kick(-10,0,(i?1:-1)*8);if(this.act&&this.act.side===(i?'R':'L'))this.endAct();
   const other=i?'L':'R';this.doAct('clutch',{side:other,seg,lp,ln,dur:1.6,prio:2});}
  else if(/^(thigh|shin|foot)/.test(part)){const i=part.endsWith('L')?0:1;this.limp[i]=1;this.sp[(i?'R':'L')+'k'].kick(14);this.sp.drop.kick(-2.6);this.rootVel.z-=.3;}
 },
 knockTooth(dir){
  const all=[...this.teethU,...this.teethL].filter(t=>!t.userData.gone);if(!all.length)return;
  const t=pick(all);t.userData.gone=true;t.visible=false;
  t.updateWorldMatrix(true,false);const p=t.getWorldPosition(V3());
  const m=mk(sphereGeo(10),this.M.teeth,scene,{s:[.0085,.012,.0065],cast:true});m.position.copy(p);
  this.bits=this.bits||[];this.bits.push({obj:m,v:V3(dir.x*1.5+rnd(-.6,.6),rnd(1.2,2.2),rnd(.6,1.6)),w:V3(rnd(-20,20),rnd(-20,20),rnd(-20,20)),r:.012,bounce:.4,sound:'tooth'});
  if(PREF.blood)BLOOD.spray(p,V3(0,.2,1),8,{max:1.8});
  this.toothSpit=(this.toothSpit||0)+1;
  AUDIO.tooth();
 },
 knockCrown(dir){
  if(this.crownOn===false)return;this.crownOn=false;
  const c=this.crown;scene.updateMatrixWorld(true);scene.attach(c);
  this.bits=this.bits||[];this.bits.push({obj:c,v:V3(dir.x*1.8+rnd(-.5,.5),rnd(1.6,2.6),dir.z*.8-rnd(.2,.8)),w:V3(rnd(-6,6),rnd(-8,8),rnd(-6,6)),r:.06,bounce:.25,sound:'crown',crown:true});
  AUDIO.crown(1.2);
  // 머리 위 상투가 드러난다
  this.topknot=mk(sphereGeo(20),this.M.hair,this.face,{p:[0,.235,-.03],s:[.075,.06,.075],part:'head'});this.topknot.userData.seg='head';this.parts.push(this.topknot);
  mk(cylGeo(.004,.004,.2,6),this.M.gold,this.topknot,{r:[0,0,PI/2],s:[1/.075,1/.06,1/.075],cast:false});
 },

updateBits(dt){
 if(!this.bits)return;

 for(const b of this.bits){
  if(b.bleed&&b.bleed.life>0){
   const q=b.bleed;
   q.life-=dt;
   q.t-=dt;

   if(PREF.blood&&q.t<=0){
    q.t=rnd(.08,.16)*(1+(12-q.life)*.12);
    b.obj.updateWorldMatrix(true,false);

    const p=q.lp.clone().applyMatrix4(b.obj.matrixWorld);
    const v=q.ln.clone()
     .transformDirection(b.obj.matrixWorld)
     .multiplyScalar(rnd(.25,.75));

    v.y-=rnd(.25,.7);
    BLOOD.emit('blood',p,v,rnd(.0035,.0065),rnd(.7,1.1));
   }
  }

  if(b.rest)continue;

  b.v.y-=9.8*dt;
  b.obj.position.addScaledVector(b.v,dt);
  b.obj.rotation.x+=b.w.x*dt;
  b.obj.rotation.y+=b.w.y*dt;
  b.obj.rotation.z+=b.w.z*dt;

  let floorHit=false;

  if(b.corners){
   b.obj.updateWorldMatrix(true,false);
   let minY=Infinity;

   for(const c of b.corners){
    minY=Math.min(
     minY,
     _bv6.copy(c).applyMatrix4(b.obj.matrixWorld).y
    );
   }

   if(minY<.004){
    b.obj.position.y+=.004-minY;
    floorHit=true;
   }
  }else if(b.obj.position.y<b.r){
   b.obj.position.y=b.r;
   floorHit=true;
  }

  if(floorHit){
   if(Math.abs(b.v.y)>.8){
    if(b.sound==='tooth'){
     AUDIO.toothBounce();
    }else if(b.sound==='crown'){
     AUDIO.crownLand();
    }else if(b.sound==='limb'&&!b.landed){
     b.landed=true;
     AUDIO.crack(.65);
    }else if(b.sound==='head'&&!b.landed){
     b.landed=true;
     AUDIO.crack(.35);
    }else if(b.sound==='eye'&&!b.landed){
     b.landed=true;
     AUDIO.drip(.45);
    }else if(b.sound==='gut'&&!b.landed){
     b.landed=true;
     BLOOD.paintFloor(b.obj.position.x,b.obj.position.z,.004,1.2);
     AUDIO.drip(.7);
    }
   }

   b.v.y*=-b.bounce;
   b.v.x*=.6;
   b.v.z*=.6;
   b.w.multiplyScalar(.5);

   if(Math.abs(b.v.y)<.25){
    b.v.set(0,0,0);
    b.rest=true;

    if(b.crown){
     b.obj.rotation.set(
      rnd(-.3,.3),
      b.obj.rotation.y,
      rnd(-.6,.6)+.4
     );
    }
   }
  }
 }
},



 crownUpdate(dt){
  if(this.crownOn===false)return;const t=this.crownTilt||0;
  this.crownTilt=Math.max(0,t-dt*.01);
  this.crown.rotation.set(this.crownRest.r.x-t*.2,0,t*.45);this.crown.position.set(this.crownRest.p.x+t*.035,this.crownRest.p.y-t*.012,this.crownRest.p.z);
 },
});
const _invBM=new THREE.Matrix4();function _invB(b){b.updateWorldMatrix(true,false);return _invBM.copy(b.matrixWorld).invert();}
/* ===== 7. 내 손과 무기 =====
 * 1인칭 손은 따로 그린다(vmScene). 누른 화면 위치로 주먹·무기 끝이 날아가 닿고, 닿는 순간 진행 쪽에 알린다. */
const VM=(()=>{
 const root=new THREE.Group();vmScene.add(root);
 const S=(hex,o)=>STD(hex,o);
 const M={skin:S('#e8ab86',{roughness:.5}),skinD:S('#cf8f6c',{roughness:.55}),nail:S('#f2c9b4',{roughness:.3}),sleeve:S('#2c3752',{roughness:.78}),cuff:S('#46557a',{roughness:.7}),
  steel:S('#9aa3ad',{roughness:.32,metalness:.85}),steelD:S('#5f6670',{roughness:.4,metalness:.8}),tape:S('#1d1d22',{roughness:.6}),tapeR:S('#c8281f',{roughness:.5}),
  wood:S('#b77a45',{roughness:.6}),woodD:S('#8a552c',{roughness:.65}),iron:S('#6f7781',{roughness:.3,metalness:.8}),blade:S('#d7dee4',{roughness:.16,metalness:.92}),edge:S('#f4f8fb',{roughness:.08,metalness:.95}),
  handle:S('#2b2522',{roughness:.45}),rivet:S('#d8c08a',{roughness:.3,metalness:.8}),gunB:S('#2f3138',{roughness:.38,metalness:.55}),gunD:S('#1b1c21',{roughness:.5,metalness:.4}),grip:S('#3a3533',{roughness:.7}),brass:S('#d9a84a',{roughness:.3,metalness:.85}),
  blood:S('#6c0710',{roughness:.15})};
 const pipeTex=canvasTex(256,64,(g,w,h)=>{g.fillStyle='#9aa3ad';g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.fillStyle=`rgba(${120+Math.random()*60|0},${60+Math.random()*30|0},20,${Math.random()*.35})`;g.beginPath();g.arc(Math.random()*w,Math.random()*h,rnd(2,9),0,TAU);g.fill();}for(let x=0;x<w;x+=3){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x,0,1,h);}},{repeat:[1,1]});
 M.steel.map=pipeTex;

 /* 주먹: +z가 주먹 앞(손가락 마디), +y가 손등 */
 function fist(parent,s){
  const g=grp(parent);
  mk(sphereGeo(24),M.skin,g,{p:[0,.004,-.018],s:[.046,.03,.05]});
  for(let i=0;i<4;i++){const x=s*(-.03+i*.02);
   mk(capsuleGeo(.0145,.022,12),M.skin,g,{p:[x,.0,.03],r:[PI/2,0,0]});
   mk(sphereGeo(14),M.skinD,g,{p:[x,.012,.036],s:[.011,.008,.009],cast:false});
   mk(capsuleGeo(.0135,.02,10),M.skin,g,{p:[x,-.024,.018],r:[0,0,PI/2]});
   mk(sphereGeo(10),M.nail,g,{p:[x,-.034,.012],s:[.007,.004,.008],cast:false});}
  const th=grp(g,[-s*.042,-.018,-.004]);th.rotation.set(.2,s*.9,s*.35);
  mk(capsuleGeo(.015,.035,10),M.skin,th,{p:[0,0,.018],r:[PI/2,0,0]});
  mk(sphereGeo(10),M.nail,th,{p:[0,.008,.042],s:[.008,.005,.009],cast:false});
  mk(cylGeo(.032,.034,.07,18),M.skin,g,{p:[0,-.002,-.075],r:[PI/2,0,0]});
    // 황동 너클: 검은 받침 + 황동 링과 연결 바
  mk(new THREE.BoxGeometry(.088,.013,.012),M.gunD,g,{p:[0,-.004,.045]});
  mk(new THREE.BoxGeometry(.084,.008,.014),M.brass,g,{p:[0,-.003,.052]});
  for(let i=0;i<4;i++){const x=s*(-.03+i*.02);
   mk(new THREE.TorusGeometry(.0115,.0042,8,18),M.gunD,g,{p:[x,.003,.052]});
   mk(new THREE.TorusGeometry(.0112,.0026,8,18),M.brass,g,{p:[x,.003,.057]});
  }
  // 엄지 조각을 주먹 그룹으로 옮긴 뒤 재질별로 합친다
  g.updateMatrixWorld(true);for(const m of [...th.children]){g.attach(m);}th.removeFromParent();mergeChildren(g);
  return g;
 }
 /* 팔뚝+소매: +y 방향으로 길게(길이는 매 프레임 맞춤) */
 const fadeTex=canvasTex(4,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#000');gr.addColorStop(.62,'#000');gr.addColorStop(.95,'#bcbcbc');gr.addColorStop(1,'#bcbcbc');g.fillStyle=gr;g.fillRect(0,0,w,h);},{srgb:false});
 const sleeveMat=S('#2c3752',{roughness:.78,transparent:true,alphaMap:fadeTex,depthWrite:false}),foreMat=S('#e8ab86',{roughness:.5,transparent:true,alphaMap:fadeTex,depthWrite:false});
 function arm(){const g=grp(root);const sl=grp(g);const m=mk(cylGeo(.04,.052,.42,18,true),sleeveMat,sl,{p:[0,.21+.11,0]});m.renderOrder=5;
  const f=mk(cylGeo(.031,.037,.16,16),M.skin,g,{p:[0,.06,0]});const cf=mk(cylGeo(.047,.047,.035,18),M.cuff,g,{p:[0,.125,0]});return {g,sl,cf};}
 const R={hand:grp(root),arm:arm()},L={hand:grp(root),arm:arm()};
 R.fist=fist(R.hand,1);L.fist=fist(L.hand,-1);R.fist.scale.setScalar(.92);L.fist.scale.setScalar(.92);
 // 쇠파이프: 손 x축을 따라
 const pipe=grp(R.hand,[0,-.012,.012]);pipe.rotation.set(0,0,-PI/2);
 {const len=.72;mk(cylGeo(.019,.019,len,18),M.steel,pipe,{p:[0,len/2-.12,0]});mk(cylGeo(.0215,.0215,.16,18),M.tape,pipe,{p:[0,-.04,0]});mk(cylGeo(.022,.022,.018,18),M.tapeR,pipe,{p:[0,.035,0]});
  mk(new THREE.TorusGeometry(.016,.004,8,18),M.steelD,pipe,{p:[0,len-.12,0],r:[PI/2,0,0]});mk(cylGeo(.0145,.0145,.002,18),M.gunD,pipe,{p:[0,len-.119,0]});
  pipe.userData.blood=mk(sphereGeo(14),M.blood,pipe,{p:[.012,len-.17,0],s:[.008,.05,.017]});pipe.userData.blood.visible=false;pipe.userData.tip=V3(0,len-.16,0);}
 // 망치: 나무 자루 + 쇠 머리(장도리)
 const hammer=grp(R.hand,[0,-.012,.012]);hammer.rotation.set(0,0,-PI/2);
 {mk(cylGeo(.016,.019,.36,14),M.wood,hammer,{p:[0,.1,0]});mk(cylGeo(.0195,.0195,.09,14),M.woodD,hammer,{p:[0,-.04,0]});
  const hd=grp(hammer,[0,.27,0]);mk(new THREE.BoxGeometry(.04,.042,.075),M.iron,hd,{p:[0,0,0]});mk(cylGeo(.025,.023,.06,18),M.iron,hd,{p:[0,0,.06],r:[PI/2,0,0]});mk(cylGeo(.026,.026,.008,18),M.blade,hd,{p:[0,0,.093],r:[PI/2,0,0]});
  const cl=grp(hd,[0,0,-.04]);for(const x of [-.009,.009]){const c=mk(new THREE.BoxGeometry(.01,.03,.085),M.iron,cl,{p:[x,.004,-.035]});c.rotation.x=-.35;}
  hammer.userData.blood=mk(sphereGeo(12),M.blood,hd,{p:[0,0,.098],s:[.024,.024,.004]});hammer.userData.blood.visible=false;hammer.userData.tip=V3(0,.27,.095);}
 // 칼: 식칼(날이 앞으로, 날 끝은 아래)
 const knife=grp(R.hand);knife.scale.setScalar(1.25);
 {const k=knife;const hd=grp(k,[0,.004,-.01]);mk(new THREE.BoxGeometry(.022,.026,.11),M.handle,hd,{p:[0,0,0]});for(const z of [-.035,0,.033])mk(cylGeo(.0042,.0042,.024,8),M.rivet,hd,{p:[0,0,z],r:[0,0,PI/2]});
  mk(new THREE.BoxGeometry(.026,.03,.01),M.steelD,k,{p:[0,.004,.05]});
  const sh=new THREE.Shape();sh.moveTo(0,-.016);sh.lineTo(.17,-.016);sh.quadraticCurveTo(.215,-.014,.235,.004);sh.lineTo(.2,.016);sh.lineTo(0,.017);sh.closePath();
  const bg=new THREE.ExtrudeGeometry(sh,{depth:.0026,bevelEnabled:true,bevelThickness:.0008,bevelSize:.0012,bevelSegments:1,curveSegments:10});bg.translate(0,0,-.0013);
 
const bladeRig=grp(k,[0,0,.054]);
mk(bg,M.blade,bladeRig,{p:[0,.004,0],r:[0,-PI/2,0]});
mk(new THREE.BoxGeometry(.0009,.0035,.175),M.edge,bladeRig,{p:[0,-.011,.091],cast:false});
const bl=grp(bladeRig);for(const x of [-.0024,.0024])mk(new THREE.BoxGeometry(.0006,.02,.12),M.blood,bl,{p:[x,-.004,.136],cast:false});bl.visible=false;k.userData.blood=bl;k.userData.bladeRig=bladeRig;k.userData.tip=V3(0,0,.29);}

 // 권총: 옆모습을 깎아 만든 슬라이드·몸통
 const gun=grp(R.hand);
 {const g=gun;
  const ex=(pts,depth,mat,parent,bev=.0025)=>{const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))sh.lineTo(p[0],p[1]);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:6});geo.translate(0,0,-depth/2);const m=mk(geo,mat,parent,{r:[0,-PI/2,0]});return m;};
  const slideMat=S('#3d424b',{roughness:.32,metalness:.65}),frameMat=S('#25272c',{roughness:.62}),dot=S('#ffffff',{emissive:col('#ffffff'),emissiveIntensity:.6});
  const slide=grp(g,[0,.03,0]);
  ex([[-.075,0],[.1,0],[.105,.004],[.105,.03],[.098,.034],[-.07,.034],[-.075,.03]],.024,slideMat,slide,.0022);
  for(let i=0;i<7;i++)mk(new THREE.BoxGeometry(.0275,.026,.0022),frameMat,slide,{p:[0,.017,-.064+i*.0065],cast:false});
  mk(new THREE.BoxGeometry(.0034,.012,.036),frameMat,slide,{p:[.0128,.022,.03],cast:false});
  mk(new THREE.BoxGeometry(.006,.009,.008),frameMat,slide,{p:[0,.04,.092]});mk(sphereGeo(8),dot,slide,{p:[0,.043,.0965],s:.0018,cast:false});
  const rs=grp(slide,[0,.04,-.062]);for(const x of [-.006,.006]){mk(new THREE.BoxGeometry(.0045,.009,.008),frameMat,rs,{p:[x,0,0]});mk(sphereGeo(8),dot,rs,{p:[x,.003,.0042],s:.0016,cast:false});}
  mk(cylGeo(.0062,.0062,.006,12),S('#111214',{roughness:.5}),slide,{p:[0,.017,.106],r:[PI/2,0,0],cast:false});
  ex([[-.07,.03],[.098,.03],[.098,.012],[.06,.008],[.04,.004],[.036,-.012],[.024,-.024],[.006,-.024],[-.002,-.012],[-.008,.004],[-.02,.004],[-.04,-.08],[-.07,-.08],[-.074,-.07],[-.058,.004],[-.072,.014]],.022,frameMat,g,.002);
  mk(new THREE.BoxGeometry(.004,.014,.004),frameMat,g,{p:[0,.002,.017]});
  const mag=mk(new THREE.BoxGeometry(.02,.012,.03),S('#1a1b1f',{roughness:.5}),g,{p:[0,-.083,-.056],r:[-.2,0,0]});
  g.userData={slide,mag,muzzle:V3(0,.047,.11),magRest:mag.position.clone()};
  const flTex=canvasTex(128,128,(c,w,h)=>{const r=c.createRadialGradient(64,64,2,64,64,60);r.addColorStop(0,'rgba(255,255,240,1)');r.addColorStop(.25,'rgba(255,214,120,.95)');r.addColorStop(.6,'rgba(255,140,40,.45)');r.addColorStop(1,'rgba(255,100,20,0)');c.fillStyle=r;c.fillRect(0,0,w,h);c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,230,160,.9)';for(let i=0;i<6;i++){c.save();c.translate(64,64);c.rotate(i/6*TAU+.3);c.beginPath();c.moveTo(0,-5);c.lineTo(58,0);c.lineTo(0,5);c.fill();c.restore();}});
  const fl=new THREE.MeshBasicMaterial({map:flTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const flash=grp(g,[0,.047,.13]);const a=mk(new THREE.PlaneGeometry(.12,.12),fl,flash,{cast:false});const b=mk(new THREE.PlaneGeometry(.05,.16),fl,flash,{r:[PI/2,0,0],p:[0,0,.06],cast:false});const c=mk(new THREE.PlaneGeometry(.16,.05),fl,flash,{r:[0,PI/2,0],p:[0,0,.06],cast:false});flash.visible=false;g.userData.flash=flash;
  g.userData.light=new THREE.PointLight(0xffb060,0,1.2,2);g.userData.light.position.set(0,.05,.16);g.add(g.userData.light);
  g.position.set(0,.022,.055);
 }
 const tools={hand:null,pipe,hammer,knife,gun};
 // 탄피
 const shells=[];for(let i=0;i<6;i++){const m=mk(cylGeo(.0045,.0045,.016,8),M.brass,root,{cast:false});m.visible=false;shells.push({m,v:V3(),w:V3(),life:0});}
 let shellI=0;
 // 떨어지는 탄창
 const dropMag=mk(new THREE.BoxGeometry(.022,.07,.026),M.gunD,root,{cast:false});dropMag.visible=false;const dropMagV=V3();

 /* ---- 좌표 ---- */
 const TAN=Math.tan(THREE.MathUtils.degToRad(30));
 function ndc(x,y){return [x/innerWidth*2-1,1-y/innerHeight*2];}
 function at(nx,ny,d,out=V3()){return out.set(nx*TAN*vmCam.aspect*d,ny*TAN*d,-d);}
 const portrait=()=>innerWidth<innerHeight;
 const qTmp=new THREE.Quaternion(),mTmp=new THREE.Matrix4(),xa=V3(),ya=V3(),za=V3();
 function orient(q,fwd,up){za.copy(fwd).normalize();xa.crossVectors(up,za);if(xa.lengthSq()<1e-8)xa.set(1,0,0);xa.normalize();ya.crossVectors(za,xa);mTmp.makeBasis(xa,ya,za);return q.setFromRotationMatrix(mTmp);}
 function bez(a,b,c,t,out){const u=1-t;return out.set(u*u*a.x+2*u*t*b.x+t*t*c.x,u*u*a.y+2*u*t*b.y+t*t*c.y,u*u*a.z+2*u*t*b.z+t*t*c.z);}
 const ANCH={R:V3(.26,-.9,.2),L:V3(-.26,-.9,.2)};

 /* ---- 상태 ---- */
 const st={tool:'hand',acts:[],nextHand:'R',time:0,ammo:8,reload:0,recoil:0,slide:0,flash:0,aim:V3(0,0,-1),aimGoal:V3(0,0,-1),slash:null,raise:0,bloody:{},swapT:1};
 const rest={R:{p:V3(),q:new THREE.Quaternion()},L:{p:V3(),q:new THREE.Quaternion()}};
 function computeRest(){
  const pr=portrait();
  for(const k of ['R','L']){const s=k==='R'?1:-1;const r=rest[k];
   if(st.tool==='hand'){at(s*(pr?.6:.36),pr?-.84:-.8,.46,r.p);orient(r.q,V3(-s*.18,.62,-1),V3(s*.9,.3,.25));}
   else if(st.tool==='pipe'||st.tool==='hammer'){at(pr?.52:.34,pr?-.72:-.74,.44,r.p);orient(r.q,V3(-.25,.35,-1),V3(.2,1,.3));}
   else if(st.tool==='knife'){at(pr?.5:.32,pr?-.72:-.72,.42,r.p);orient(r.q,V3(-.2,.25,-1),V3(.35,1,0));}
   else{at(pr?.34:.24,pr?-.56:-.6,.4,r.p);orient(r.q,V3(-.04,.06,-1),V3(0,1,0));}
  }
 }
 const H={R:{p:V3(),q:new THREE.Quaternion()},L:{p:V3(),q:new THREE.Quaternion()}};

 function setTool(t){st.tool=t;st.acts.length=0;st.slash=null;st.swapT=0;for(const k in tools)if(tools[k])tools[k].visible=k===t;L.hand.visible=L.arm.g.visible=t==='hand';computeRest();}
 function busy(side){return st.acts.some(a=>a.side===side&&a.t<a.contact+.03);}
 /* 공격 시작: 화면 좌표 sx,sy. kind: jab|hook|upper|smash|side|stab */
 function attack(kind,sx,sy,info){
  const tool=st.tool;if(tool==='gun')return fire(sx,sy,info);
  let side='R';
  if(tool==='hand'){side=st.nextHand;if(busy(side)){side=side==='R'?'L':'R';if(busy(side))return false;}st.nextHand=side==='R'?'L':'R';}
  else if(st.acts.length&&st.acts.some(a=>a.t<a.contact+.04))return false;
  if(st.acts.length>2)st.acts.shift();
  const [nx,ny]=ndc(sx,sy),s=side==='R'?1:-1,pr=portrait();
  const T={hand:.56,pipe:1.1,hammer:1,knife:.72}[tool],target=at(nx,ny,T);
  const a={tool,kind,side,s,sx,sy,info,t:0,target,done:false,hit:null};
  const W=V3(),C=V3(),Q0=new THREE.Quaternion(),Q1=new THREE.Quaternion();
  if(tool==='hand'){
   const fwd=V3().subVectors(target,ANCH[side]).normalize();
   if(kind==='hook'){at(s*1.15,ny*.5-.15,.62,W);C.set(lerp(W.x,target.x,.15),target.y+.02,lerp(W.z,target.z,.75));orient(Q0,V3(-s*.6,.1,-.5),V3(0,1,.2));orient(Q1,V3(-s*.75,0,-.65),V3(0,1,0));a.dur=[.075,.07,.06,.17];}
   else if(kind==='upper'){at(s*.25,-1.25,.55,W);C.set(target.x,lerp(W.y,target.y,.2),lerp(W.z,target.z,.7));orient(Q0,V3(-s*.1,1,-.3),V3(0,.2,1));orient(Q1,V3(0,.8,-.6),V3(0,.3,1));a.dur=[.075,.075,.06,.17];}
   else{W.copy(rest[side].p).add(V3(s*.02,-.03,.07));C.copy(W).lerp(target,.5);C.y+=.03;orient(Q0,V3(-s*.2,.4,-1),V3(s*.9,.4,.2));orient(Q1,fwd,V3(-s*.25,1,0));a.dur=[.045,.055,.05,.14];}
  }else if(tool==='pipe'||tool==='hammer'){
   const L_=tool==='pipe'?.57:.27;const side_=kind==='side';
   const H0=side_?at(pr?.7:.62,-.5,.44):at(pr?.45:.4,-.68,.46);
   const dir=V3().subVectors(target,H0).normalize();
   a.hand1=V3().copy(target).addScaledVector(dir,-L_);a.dir1=dir;
   if(side_){a.hand0=at(pr?1.05:.95,-.35,.42);a.dir0=V3(.85,.25,.45).normalize();}else{a.hand0=at(pr?.75:.62,-.12,.4);a.dir0=V3(.18,.88,.45).normalize();}
   a.L=L_;a.dur=tool==='pipe'?[.13,.085,.07,.24]:[.14,.08,.08,.26];
  }else if(tool==='knife'){
   const H0=at(pr?.42:.38,-.74,.42);const dir=V3().subVectors(target,H0).normalize();a.dir1=dir;a.hand1=V3().copy(target).addScaledVector(dir,-.33);
   a.hand0=V3().copy(rest.R.p).add(V3(.01,.02,.07));a.dir0=V3(-.15,.3,-1).normalize();a.penDepth=.19;a.dur=[.05,.06,.13,.17];
  }
  a.W=W;a.C=C;a.Q0=Q0;a.Q1=Q1;a.contact=a.dur[0]+a.dur[1];a.total=a.dur.reduce((x,y)=>x+y,0);
  st.acts.push(a);AUDIO.whoosh(tool==='hand'?.6:tool==='knife'?.5:1.1,kind);
  return true;
 }
 /* 총 */
 let fireCool=0;
 function fire(sx,sy,info){
  if(st.reload>0||fireCool>0)return false;
  if(st.ammo<=0){AUDIO.dry();reload();return false;}
  fireCool=.15;st.recoil=1;st.slide=1;st.flash=.05;
  const [nx,ny]=ndc(sx,sy);st.aimGoal.copy(at(nx,ny,3)).normalize();st.aim.copy(st.aimGoal);
  const sh=shells[shellI++%shells.length];sh.life=.9;sh.m.visible=true;gun.updateWorldMatrix(true,false);sh.m.position.copy(gun.localToWorld(V3(.016,.052,.03)));sh.v.set(rnd(.6,.9),rnd(.7,1.1),rnd(.1,.3));sh.w.set(rnd(10,20),rnd(5,10),rnd(10,20));
  AUDIO.gunshot();
  if(st.onFire)st.onFire(sx,sy,info);
  if(st.ammo<=0)st.autoReloadAt=st.time+.26;
  return true;
 }
 function reload(){if(st.reload>0||st.ammo===8)return;st.reload=1.15;AUDIO.reload();if(st.onAmmo)st.onAmmo();}
 /* 칼로 긋기: 손가락을 따라 칼끝이 움직인다 */
 function slashStart(sx,sy){st.slash={sx,sy,px:sx,py:sy,t:0,len:0,lastWhoosh:st.time,touching:false,bite:0};AUDIO.whoosh(.5,'slash');}
 function slashMove(sx,sy){const s=st.slash;if(!s)return;const d=Math.hypot(sx-s.sx,sy-s.sy);s.len+=d;s.px=s.sx;s.py=s.sy;s.sx=sx;s.sy=sy;if(d>14&&st.time-s.lastWhoosh>.18){s.lastWhoosh=st.time;AUDIO.whoosh(.4,'slash');}}
 function slashEnd(){st.slash=null;}

 /* ---- 매 프레임 ---- */
 const tmpP=V3(),tmpQ=new THREE.Quaternion(),tmpQ2=new THREE.Quaternion(),tv=V3(),tv2=V3();
 function placeArm(side){
  const h=side==='R'?R:L,ar=h.arm;h.hand.updateMatrix();
  const wrist=tv.set(0,0,-.1).applyMatrix4(h.hand.matrix);const A=ANCH[side];const d=tv2.subVectors(A,wrist);const len=d.length();d.normalize();
  ar.g.position.copy(wrist);ar.g.quaternion.setFromUnitVectors(UP,d);
 }
 function update(dt,frozen){
  st.time+=dt;fireCool=Math.max(0,fireCool-dt);st.swapT=Math.min(1,st.swapT+dt*4);
  if(st.autoReloadAt&&st.time>=st.autoReloadAt){st.autoReloadAt=0;if(st.ammo<=0&&st.tool==='gun')reload();}
  if(st.reload>0){st.reload=Math.max(0,st.reload-dt);if(st.reload===0){st.ammo=8;if(st.onAmmo)st.onAmmo();}}
 
const sway=Math.sin(st.time*1.6)*.004,sway2=Math.cos(st.time*1.1)*.003,dropIn=(1-easeOut3(st.swapT))*.25;
for(const k of ['R','L']){H[k].p.copy(rest[k].p);H[k].p.y+=sway*(k==='R'?1:-1)-dropIn;H[k].p.x+=sway2;H[k].q.copy(rest[k].q);}
knife.userData.bladeRig.scale.z=1;
// 진행 중인 공격



  for(let i=st.acts.length-1;i>=0;i--){const a=st.acts[i];if(!frozen)a.t+=dt;const t=a.t,[d0,d1,d2,d3]=a.dur,c=a.contact;
   if(!a.done&&t>=c){a.done=true;a.hit=st.onContact?st.onContact(a):null;if(a.hit&&a.hit.hit&&a.tool!=='hand')st.bloody[a.tool]=st.bloody[a.tool]||a.hit.blood;}
   const h=H[a.side];
   if(a.tool==='hand'){
    if(t<d0){const u=easeOut(t/d0);h.p.lerp(a.W,u);h.q.slerp(a.Q0,u);}
    else if(t<c){const u=easeIn((t-d0)/d1);bez(a.W,a.C,a.target,u,h.p);tmpQ.copy(a.Q0).slerp(a.Q1,u);h.q.copy(tmpQ);}
    else if(t<c+d2){const u=(t-c)/d2,hit=a.hit&&a.hit.hit;const back=hit?Math.sin(u*PI)*-.045:Math.sin(u*PI)*.06;tv.subVectors(a.target,ANCH[a.side]).normalize();h.p.copy(a.target).addScaledVector(tv,back);h.q.copy(a.Q1);}
    else if(t<a.total){const u=smooth((t-c-d2)/d3);tmpP.copy(a.target).lerp(h.p,u);h.p.copy(tmpP);tmpQ.copy(a.Q1).slerp(h.q,u);h.q.copy(tmpQ);}
   }else if(a.tool==='pipe'||a.tool==='hammer'||a.tool==='knife'){
    let hand,dir;
    if(t<d0){const u=easeOut(t/d0);hand=tv.copy(h.p).lerp(a.hand0,u);dir=tv2.set(-.25,.35,-1).normalize().lerp(a.dir0,u).normalize();}
    else if(t<c){const u=a.tool==='knife'?easeIn((t-d0)/d1):easeIn3((t-d0)/d1);hand=tv.copy(a.hand0).lerp(a.hand1,u);tmpQ.setFromUnitVectors(_fz,a.dir0);tmpQ2.setFromUnitVectors(_fz,a.dir1);tmpQ.slerp(tmpQ2,u);dir=tv2.copy(_fz).applyQuaternion(tmpQ);}
   
  else if(t<c+d2){const u=(t-c)/d2,hit=a.hit&&a.hit.hit;dir=tv2.copy(a.dir1);
 if(a.tool==='knife'){const bite=hit?easeOut(u*1.45):0;hand=tv.copy(a.hand1).addScaledVector(a.dir1,hit?bite*a.penDepth:Math.sin(u*PI)*.05);knife.userData.bladeRig.scale.z=hit?lerp(1,.25,bite):1;}
 else{const k=hit?-Math.sin(u*PI)*.12:Math.sin(u*PI*.5)*.35;tmpQ.setFromAxisAngle(tv.set(1,0,0),k);dir.applyQuaternion(tmpQ).normalize();hand=tv.copy(a.hand1).addScaledVector(V3(0,-1,0),hit?0:Math.sin(u*PI*.5)*.06);}}
else{const u=smooth((t-c-d2)/d3);dir=tv2.copy(a.dir1).lerp(V3(-.25,.35,-1).normalize(),u).normalize();if(a.tool==='knife'&&a.hit&&a.hit.hit){hand=tv.copy(a.hand1).addScaledVector(a.dir1,a.penDepth).lerp(h.p,u);knife.userData.bladeRig.scale.z=lerp(.25,1,u);}else hand=tv.copy(a.hand1).lerp(h.p,u);}




    h.p.copy(hand);
    // 도구 방향 → 손 회전(도구는 손 x축)
    const up=a.tool==='knife'?V3(.35,1,0):V3(.2,1,.3);
    if(a.tool==='knife')orient(h.q,dir,up);else{const fz=V3().crossVectors(dir,V3(0,1,0)).normalize();if(fz.z>0)fz.negate();const fy=V3().crossVectors(fz,dir);mTmp.makeBasis(dir,fy,fz);h.q.setFromRotationMatrix(mTmp);}
   }
   if(a.t>=a.total)st.acts.splice(i,1);
  }
  // 칼로 긋기
  if(st.tool==='knife'&&st.slash){const s=st.slash,[nx,ny]=ndc(s.sx,s.sy),T=at(nx,ny,.74),H0=at(.45,-.8,.3);const dir=tv.subVectors(T,H0).normalize();s.bite=damp(s.bite,s.touching?1:0,s.touching?28:16,dt);H.R.p.copy(T).addScaledVector(dir,lerp(-.33,-.22,s.bite));knife.userData.bladeRig.scale.z=lerp(1,.62,s.bite);
   const mv=tv2.set(s.sx-s.px,-(s.sy-s.py),0);if(mv.lengthSq()>1)mv.normalize();else mv.set(1,0,0);orient(H.R.q,dir,V3(-mv.y,mv.x,0).lerp(V3(0,1,0),.3));}
  // 총: 겨냥·반동·재장전
  if(st.tool==='gun'){
   st.recoil=Math.max(0,st.recoil-dt*7);st.slide=Math.max(0,st.slide-dt*14);st.flash=Math.max(0,st.flash-dt);
   const h=H.R;st.aim.lerp(st.aimGoal,1-Math.exp(-dt*14));const muzzleTo=tv.copy(st.aim).multiplyScalar(3).sub(h.p).normalize();
   orient(h.q,muzzleTo,V3(0,1,0));const rc=easeOut(st.recoil);tmpQ.setFromAxisAngle(tv2.set(1,0,0),-rc*.38);h.q.multiply(tmpQ);h.p.addScaledVector(muzzleTo,-rc*.05);h.p.y+=rc*.012;
   if(st.reload>0){const u=1-st.reload/1.15,k=Math.sin(u*PI);h.p.y-=k*.07;h.p.x-=k*.03;tmpQ.setFromEuler(new THREE.Euler(-k*.5,k*.4,k*.7));h.q.multiply(tmpQ);
    const mg=gun.userData.mag;mg.visible=u<.25||u>.55;if(u>.55&&u<.8)mg.position.y=gun.userData.magRest.y-(.8-u)*.3;else mg.position.copy(gun.userData.magRest);
    if(u>.2&&u<.26&&!dropMag.visible){dropMag.visible=true;gun.updateWorldMatrix(true,false);dropMag.position.copy(gun.localToWorld(V3(0,-.06,-.012)));dropMagV.set(0,-.4,0);}}
   gun.userData.slide.position.z=-st.slide*.024;gun.userData.flash.visible=st.flash>0;gun.userData.flash.rotation.z=rnd(0,TAU);gun.userData.flash.scale.setScalar(rnd(.8,1.3));gun.userData.light.intensity=st.flash>0?3:0;
  }
  if(dropMag.visible){dropMagV.y-=6*dt;dropMag.position.addScaledVector(dropMagV,dt);dropMag.rotation.x+=dt*3;if(dropMag.position.y<-.8)dropMag.visible=false;}
  for(const s of shells)if(s.life>0){s.life-=dt;s.v.y-=4*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.w.x*dt;s.m.rotation.y+=s.w.y*dt;if(s.life<=0)s.m.visible=false;}
  // 손 배치
  for(const k of ['R','L']){const h=k==='R'?R:L;h.hand.position.copy(H[k].p);h.hand.quaternion.copy(H[k].q);if(h.hand.visible)placeArm(k);}
  for(const k of ['pipe','hammer','knife'])if(tools[k].userData.blood)tools[k].userData.blood.visible=!!st.bloody[k]&&PREF.blood;
 }
 function reset(){st.acts.length=0;st.slash=null;st.ammo=8;st.reload=0;st.autoReloadAt=0;st.bloody={};st.recoil=0;st.flash=0;fireCool=0;dropMag.visible=false;for(const s of shells){s.life=0;s.m.visible=false;}}
 setTool('hand');
 return {root,st,setTool,attack,fire,reload,slashStart,slashMove,slashEnd,update,reset,computeRest,get busy(){return st.acts.length>0;}};
})();
const _fz=V3(0,0,1);
/* ===== 8. 진행과 입력 =====
 * 버팀 게이지 100 → 75(옥좌에 처박힘) → 50(무릎 꿇고 빎) → 25(엉덩방아) → 0(옥좌 앞에 주저앉아 끝).
 * 서서 맞는 시간이 142초를 넘기 전에는 0이 되지 않는다(다운된 시간까지 합치면 아무리 세게 때려도 3분 가까이 걸린다). */
const PREF={sound:true,blood:true,vibe:true,shake:true};
metalEnv(VM.root);
try{const p=JSON.parse(localStorage.getItem('palja.prefs')||'{}');for(const k of Object.keys(PREF))if(typeof p[k]==='boolean')PREF[k]=p[k];}catch(_){}
const KD_AT=[75,50,25,0],KD_TYPE=['throne','kneel','floor','final'],T_TOTAL=142;
const G={time:0,running:false,raf:0,E:null,mode:'fight',tool:'hand',bar:100,lag:100,kd:0,active:0,started:false,hits:0,t0:0,tEnd:0,hitstop:0,slow:0,ended:false,paused:false,cardShown:false,result:null,round:0};
const HINTS={hand:'누르면 너클 잽 · 옆으로 밀면 훅 · 위로 밀면 어퍼컷',knife:'누르면 찌르기 · 누른 채 그으면 베기',gun:'누르면 쏘기 · 꾹 누르면 연사'};
let hintUntil=0;
function hint(text,dur=3.6){const el=$('#hint');el.textContent=text;el.classList.remove('off');hintUntil=G.time+dur;}

/* ---- 맞히기: 화면 좌표 → 옥황상제 몸 ---- */
const ray=new THREE.Raycaster(),nmat=new THREE.Matrix3();
function visibleChain(o){for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;}
function pickAt(x,y){
 const E=G.E;if(!E)return null;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);
 const list=E.parts.filter(o=>o.parent&&!o.userData.detached&&visibleChain(o)&&(o.userData.part!=='tablet'||E.tabletHeld)&&(o.userData.part!=='crown'||E.crownOn!==false));
 const hits=ray.intersectObjects(list,false);if(!hits.length)return null;
 const h=hits[0];nmat.getNormalMatrix(h.object.matrixWorld);const n=h.face?h.face.normal.clone().applyMatrix3(nmat).normalize():ray.ray.direction.clone().negate();
 if(n.dot(ray.ray.direction)>0)n.negate();
 return {obj:h.object,point:h.point.clone(),normal:n,part:h.object.userData.part||'chest',dir:ray.ray.direction.clone()};
}
const POWER={hand:{jab:1,hook:1.25,upper:1.35},pipe:{smash:1.9,side:2},hammer:{smash:2.2,side:2.1},knife:{stab:.75,slash:.5},gun:{shot:1.7}};
const STOP={hand:.05,pipe:.085,hammer:.1,knife:.065,gun:.035};
function resolveHit(tool,kind,info,side,extra={}){
 const E=G.E;if(!E||!info)return {hit:false};
 const dir=info.dir.clone();const s=side==='L'?-1:1;
 if(kind==='hook')dir.add(V3(-s*1.15,0,0));else if(kind==='upper')dir.add(V3(0,1.3,0));else if(kind==='smash')dir.add(V3(0,-.7,0));else if(kind==='side')dir.add(V3(-1.2,0,0));
 dir.normalize();
 const power=(POWER[tool]||{})[kind]||1;
 if(!G.started){G.started=true;G.t0=G.time;}
 const r=E.takeHit({tool,kind,part:info.part,point:info.point,normal:info.normal,dir,obj:info.obj,power,slashFrom:extra.slashFrom,strokeId:extra.strokeId});
 G.hits++;
 // 타격감: 멈춤·반동·흔들림·소리·진동
 const heavy=r.heavy||power>=1.8;
 G.hitstop=Math.max(G.hitstop,(STOP[tool]||.05)*(kind==='hook'||kind==='upper'?1.25:1)+(heavy?.015:0)+(r.blocked?.02:0));
 camKick(dir,(tool==='hand'?.012:tool==='knife'?.008:.022)*(r.blocked?.6:1));
 camShake(tool==='hand'?.006:tool==='knife'?.005:tool==='gun'?.01:.016);
 camPunchZoom(tool==='hand'?.012:heavy?.02:.01);
 AUDIO.hit(tool,kind,info.part,power,r.blocked);
 if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate(tool==='gun'?18:heavy?[22,10,28]:12);}catch(_){}
 damageBar(r.dmg);
 return {hit:true,blood:!r.blocked&&(tool==='knife'||tool==='gun'||E.noseBleeding||E.lipSplit)};
}
function damageBar(d){
 if(G.mode!=='fight'||G.ended||!G.E)return;
 const floor=100-G.active/T_TOTAL*100;
 const next=KD_AT[G.kd];
 let nb=Math.max(Math.max(floor,0),G.bar-d);
 if(G.E.state!=='stand'&&next!=null)nb=Math.max(nb,next+3);
 G.bar=Math.min(G.bar,nb);
 if(G.E.state==='stand'&&G.kd<4&&G.bar<=next+1e-6){G.bar=next;knockdown();}
 updateGauge();
}
function knockdown(){
 const E=G.E,type=KD_TYPE[G.kd];G.kd++;
 E.startFall(type);setFrame(type==='final'?'final':type);
 G.hitstop=Math.max(G.hitstop,.12);flash(type==='final'?.35:.18);camShake(.03);
 if(type==='final'){G.slow=.9;if(!E.headDestroyed)AUDIO.voice('final',1);}else if(!E.headDestroyed)AUDIO.voice('scream',1.1);
 updateGauge();
}
function onRiseStart(){setFrame('stand');}
function onRise(){const E=G.E;E.setPhase(Math.min(4,G.kd+1));}
function onImpact(type){
 const E=G.E;camShake(type==='final'?.045:.03);
 if(type==='throne'){AUDIO.fall('throne');if(E.crownOn!==false)E.knockCrown(V3(rnd(-.4,.4),.6,.2));}else if(type==='knees'){AUDIO.fall('knees');}else AUDIO.fall('floor');
 if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([30,20,40]);}catch(_){}
 const p=E.bones.pelvis.getWorldPosition(V3());BLOOD.spray(V3(p.x,.05,p.z+.2),V3(0,1,0),10,{kind:'dust',max:1});
}
function onDead(){G.ended=true;G.tEnd=G.time;G.cardAt=G.time+2.6;}
function showEnding(){
 G.cardShown=true;const t=Math.max(0,G.tEnd-G.t0),m=Math.floor(t/60),s=Math.floor(t%60);
 $('#stTime').textContent=m+':'+String(s).padStart(2,'0');$('#stHits').textContent=G.hits;$('#stBlood').textContent=(BLOOD.lost).toFixed(1)+'L';
 $('#ending').hidden=false;
}

/* ---- 게이지 ---- */
function updateGauge(){
 const f=clamp(G.bar/100,0,1);$('#gaugeFill').style.transform='scaleX('+f+')';$('#gaugePct').textContent=Math.ceil(G.bar)+'%';
 $$('#kdPips i').forEach((el,i)=>el.classList.toggle('on',i<Math.min(3,G.kd)));
}
function updateLag(dt){G.lag=G.lag>G.bar?Math.max(G.bar,G.lag-dt*(G.lag-G.bar>3?18:6)):G.bar;$('#gaugeLag').style.transform='scaleX('+clamp(G.lag/100,0,1)+')';}
function updateAmmo(){const el=$('#ammo');const r=VM.st.reload>0;el.textContent=r?'장전':VM.st.ammo;el.classList.toggle('reload',r);}
function flash(a=.25){const el=$('#flash');el.style.transition='none';el.style.opacity=a;requestAnimationFrame(()=>{el.style.transition='opacity .18s';el.style.opacity=0;});}

/* ---- 무기와 연결 ---- */
VM.st.onContact=a=>{
 if(G.mode!=='fight'||!G.E)return {hit:false};
 const info=pickAt(a.sx,a.sy);
 if(!info){AUDIO.whiff(a.tool);return {hit:false};}
 return resolveHit(a.tool,a.kind,info,a.side);
};
VM.st.onFire=(sx,sy)=>{
 updateAmmo();flash(.05);camShake(.008);gunLight();
 const info=pickAt(sx,sy);if(!info){return;}
 resolveHit('gun','shot',info,'R');
};
VM.st.onAmmo=()=>updateAmmo();
// 총구 불빛이 옥황상제 얼굴을 잠깐 비춘다
const gunL=new THREE.PointLight(col('#ffbe70'),0,6,2);scene.add(gunL);let gunLT=0;
function gunLight(){gunLT=.06;}

/* ---- 칼로 긋기 ---- */
let slashSerial=0;

function slashContact(p,x,y){
 if(p.slashId==null)p.slashId=++slashSerial;

 const info=pickAt(x,y);
 const now=G.time;

 if(VM.st.slash)VM.st.slash.touching=!!info;
 if(!info){p.lastCut=null;return;}

 const seg=info.obj&&info.obj.userData.seg;

 if(!p.lastCut||p.lastCut.seg!==seg){
  p.lastCut={
   point:info.point.clone(),
   t:now,
   part:info.part,
   seg
  };
  return;
 }

 const d=info.point.distanceTo(p.lastCut.point);

 if(d>.045||now-p.lastCut.t>.12){
  if(d>.015){
   const from=p.lastCut.point.clone();

   resolveHit('knife','slash',info,'R',{
    slashFrom:from,
    strokeId:p.slashId
   });
  }

  p.lastCut={
   point:info.point.clone(),
   t:now,
   part:info.part,
   seg
  };
 }
}

/* ---- 입력 ---- */
const ptrs=new Map();
canvas.addEventListener('pointerdown',e=>{
 if(G.paused||(e.pointerType==='mouse'&&e.button!==0))return;AUDIO.unlock();
 if(G.mode!=='fight')return;
 try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 const p={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t0:G.time,swiped:false,slashing:false,fired:false,decided:false};
 ptrs.set(e.pointerId,p);
 const tool=G.tool;
 if(tool==='gun'){VM.fire(p.x,p.y);p.auto=G.time+.19;}
 else if(tool==='hand'){VM.attack('jab',p.x,p.y);p.decided=true;}
 else if(tool==='pipe'||tool==='hammer'){p.decideAt=G.time+.14;}
 e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
 const p=ptrs.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
 const dx=p.x-p.x0,dy=p.y-p.y0,dist=Math.hypot(dx,dy),tool=G.tool;
 if(tool==='knife'){
  if(!p.slashing&&dist>12){p.slashing=true;VM.slashStart(p.x0,p.y0);p.lastCut=null;slashContact(p,p.x0,p.y0);}
  if(p.slashing){VM.slashMove(p.x,p.y);slashContact(p,p.x,p.y);}
  return;
 }
 if(tool==='gun')return;
 if(!p.swiped&&dist>30&&G.time-p.t0<.38){
  p.swiped=true;const horiz=Math.abs(dx)>Math.abs(dy)*1.05;
  if(tool==='hand'){VM.attack(horiz?'hook':dy<0?'upper':'jab',p.x0,p.y0);}
  else if(!p.decided){p.decided=true;VM.attack(horiz?'side':'smash',p.x0,p.y0);}
 }
});
function ptrEnd(e){
 const p=ptrs.get(e.pointerId);if(!p)return;ptrs.delete(e.pointerId);
 if(G.mode!=='fight')return;
 const tool=G.tool;
 if(tool==='knife'){if(p.slashing)VM.slashEnd();else if(e.type==='pointerup')VM.attack('stab',p.x0,p.y0);}
 else if((tool==='pipe'||tool==='hammer')&&!p.decided&&e.type==='pointerup'){p.decided=true;VM.attack('smash',p.x0,p.y0);}
}
canvas.addEventListener('pointerup',ptrEnd);canvas.addEventListener('pointercancel',ptrEnd);canvas.addEventListener('lostpointercapture',ptrEnd);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function pollPointers(){
 for(const p of ptrs.values()){
  if(G.tool==='gun'&&p.auto&&G.time>=p.auto){p.auto=G.time+.19;VM.fire(p.x,p.y);}
  if((G.tool==='pipe'||G.tool==='hammer')&&!p.decided&&p.decideAt&&G.time>=p.decideAt){p.decided=true;VM.attack('smash',p.x0,p.y0);}
 }
}
// 키보드(PC): 1~3 도구, R 장전
addEventListener('keydown',e=>{if($('#fight').hidden||G.paused)return;const k=e.key;const map={'1':'hand','2':'knife','3':'gun'};if(map[k]){setTool(map[k]);}else if((k==='r'||k==='R')&&G.tool==='gun')VM.reload();});

function setTool(t){
 if(!HINTS[t])return;for(const p of ptrs.values())if(p.slashing)VM.slashEnd();ptrs.clear();
 G.tool=t;VM.setTool(t);$$('#tools .tool').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
 if(G.mode==='fight')hint(HINTS[t]);AUDIO.ui();updateAmmo();
}
$$('#tools .tool').forEach(b=>b.addEventListener('click',()=>{AUDIO.unlock();setTool(b.dataset.tool);}));

/* ---- 설정 ---- */
function savePrefs(){try{localStorage.setItem('palja.prefs',JSON.stringify(PREF));}catch(_){}}
function syncPrefs(){for(const k of Object.keys(PREF)){const el=$('#sw'+k[0].toUpperCase()+k.slice(1));if(el)el.setAttribute('aria-checked',String(PREF[k]));}$('#soundBtn').setAttribute('aria-pressed',String(!PREF.sound));AUDIO.setOn(PREF.sound);}
function toggle(k){PREF[k]=!PREF[k];savePrefs();syncPrefs();}
for(const k of Object.keys(PREF)){const el=$('#sw'+k[0].toUpperCase()+k.slice(1));if(el)el.addEventListener('click',()=>{AUDIO.unlock();toggle(k);});}
$('#soundBtn').addEventListener('click',()=>{AUDIO.unlock();toggle('sound');});
$('#settingsBtn').addEventListener('click',()=>{G.paused=true;ptrs.clear();$('#settingsModal').hidden=false;});
function closeModal(){$('#settingsModal').hidden=true;G.paused=false;last=performance.now();}
$$('#settingsModal [data-close]').forEach(b=>b.addEventListener('click',closeModal));
$('#settingsModal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
$('#resetFight').addEventListener('click',()=>{closeModal();startRound('fight');});
$('#endAgain').addEventListener('click',()=>startRound('fight'));
$('#endHome').addEventListener('click',()=>leave(false));
$('#endMore').addEventListener('click',()=>{$('#ending').hidden=true;});
$('#fightBack').addEventListener('click',()=>leave(false));
$('#submitFight').addEventListener('click',()=>{AUDIO.unlock();G.mode='fight';VM.root.visible=true;VM.setTool(G.tool);$('#dock').hidden=false;$('#submitDock').hidden=true;$('#fight .gauge').style.visibility='';fitView();setFrame('stand');hint(HINTS[G.tool],4.5);if(G.E){G.E.endAct();}});

/* ---- 라운드 ---- */
function startRound(mode){
 G.round++;ptrs.clear();
 if(G.E){G.E.destroy();}
 G.E=new Emperor(G.result);
 const E=G.E;E.onImpact=onImpact;E.onDead=onDead;E.onRise=onRise;E.onRiseStart=onRiseStart;E.onCough=()=>{if(E.headDestroyed)return;AUDIO.voice('cough',1);E.face.updateWorldMatrix(true,false);BLOOD.spray(E.face.localToWorld(V3(0,-.12,.2)),V3(0,.1,1),PREF.blood?16:6,{max:1.6});};
 BLOOD.reset(E);VM.reset();if(lite<2){metalEnv(E.root);metalEnv(E.crown);}
 Object.assign(G,{mode,bar:100,lag:100,kd:0,active:0,started:false,hits:0,t0:G.time,tEnd:0,hitstop:0,slow:0,ended:false,cardShown:false,paused:false,cardAt:0,laughAt:0});
 $('#ending').hidden=true;$('#settingsModal').hidden=true;
 $('#dock').hidden=mode!=='fight';$('#submitDock').hidden=mode!=='submit';$('#fight .gauge').style.visibility=mode==='submit'?'hidden':'';
 setTool('hand');updateGauge();updateAmmo();syncPrefs();VM.root.visible=mode==='fight';
 fitView();setFrame('stand',true);
 if(mode==='fight')hint(HINTS.hand,5);else{$('#hint').classList.add('off');G.laughAt=G.time+.5;}
 last=performance.now();
}

/* ---- 루프 ---- */
let last=performance.now(),perfT=0,perfN=0,lite=0;
function allMats(fn){for(const sc of [scene,vmScene])sc.traverse(o=>{if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))fn(m);});}
function step(dt){
 G.time+=dt;if(G.paused)return;
 pollPointers();
 const E=G.E;
 // 멈춤(히트스톱)·느린 화면
 let sim=dt;if(G.hitstop>0){const u=Math.min(dt,G.hitstop);G.hitstop-=u;sim=dt-u;}
 if(G.slow>0){G.slow-=dt;sim*=.45;}
 if(G.mode==='fight'&&G.started&&!G.ended&&E&&E.state==='stand')G.active+=dt;
 if(E){E.update(sim,G.time);if(G.mode==='submit'&&E.state==='stand'&&!E.act&&E.sinceHit>1&&Math.random()<dt*.35){E.doAct('laugh',{dur:2,L:false,R:false});AUDIO.voice('laugh',1);}}
 // 피로 게이지가 천천히 줄어든다(다음 다운 선은 넘지 않음)
 if(G.mode==='fight'&&G.started&&!G.ended&&E&&E.state==='stand'){const next=KD_AT[G.kd]??0;const d=BLOOD.bleedRate*6*sim;if(d>0&&G.bar-d>next+.6){G.bar-=d;updateGauge();}}
 BLOOD.update(sim);VM.update(sim,G.hitstop>0);
 updateCamera(dt);SBLOOD.update(dt);updateLag(dt);
 gunLT=Math.max(0,gunLT-dt);gunL.intensity=gunLT>0?2.6:0;gunL.position.set(camera.position.x+.15,camera.position.y-.1,camera.position.z-.3);
 if(G.time>hintUntil)$('#hint').classList.add('off');
 if(G.cardAt&&G.time>=G.cardAt){G.cardAt=0;if(G.ended&&G.E&&G.E.state==='dead'&&!G.cardShown)showEnding();}
 if(G.laughAt&&G.time>=G.laughAt){G.laughAt=0;if(G.E&&G.mode==='submit'){G.E.doAct('laugh',{dur:2.4,L:false,R:false});AUDIO.voice('laugh',1.2);}}
 if(VM.st.reload>0||VM.st._showR){VM.st._showR=VM.st.reload>0;updateAmmo();}
}
function render(){renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(vmScene,vmCam);}
function frame(now){
 if(!G.running)return;G.raf=requestAnimationFrame(frame);
 const raw=(now-last)/1000;last=now;const dt=clamp(raw,0,.05);
 // 느린 기기: 1단계 해상도·그림자 낮춤, 2단계 금속 반사 끔
 perfT+=raw;perfN++;if(perfT>2.5){if(perfT/perfN>.045&&lite<2){lite++;if(lite===1){renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;allMats(m=>m.needsUpdate=true);fitView();}else{allMats(m=>{if(m.envMap){m.envMap=null;m.needsUpdate=true;}});}}perfT=0;perfN=0;}
 step(dt);render();
}
function pause(){G.running=false;cancelAnimationFrame(G.raf);ptrs.clear();AUDIO.stop();}
function enter(result,mode='fight'){
 G.result=result;$('#fight').hidden=false;$('#fallback').hidden=true;
 try{speechSynthesis.cancel();}catch(_){}
 AUDIO.unlock();fitView();startRound(mode==='submit'?'submit':'fight');
 const face=$('#arcadeFace');if(face){face.target='_blank';face.rel='noopener';}
 if(!G.running){G.running=true;last=performance.now();G.raf=requestAnimationFrame(frame);}
}
function leave(home){
 pause();$('#settingsModal').hidden=true;$('#ending').hidden=true;$('#fight').hidden=true;
 const face=$('#arcadeFace');if(face){face.target='_top';face.removeAttribute('rel');}
 if(home&&window.__paljaRestart)window.__paljaRestart();else if(window.__paljaLeave)window.__paljaLeave();
}
let rsT=0;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{if(!$('#fight').hidden){fitView();VM.computeRest();}},40);});
addEventListener('blur',()=>{for(const p of ptrs.values())if(p.slashing)VM.slashEnd();ptrs.clear();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){ptrs.clear();AUDIO.stop();}else{last=performance.now();if(G.running){fitView();}}});

window.PaljaGame={enter,leave,pause,
 tick(dt=1/60,draw=true){step(dt);if(draw)render();},
 pick:pickAt,setTool,
 hitAt(x,y,kind){if(G.tool==='gun')return VM.fire(x,y);return VM.attack(kind||(G.tool==='hand'?'jab':G.tool==='knife'?'stab':'smash'),x,y);},
 slash(points){VM.slashStart(points[0][0],points[0][1]);const p={lastCut:null};for(const [x,y] of points){VM.slashMove(x,y);slashContact(p,x,y);}VM.slashEnd();},
 screenPart(name){const E=G.E;if(!E)return null;const m=E.parts.find(o=>o.userData.part===name&&o.visible);if(!m)return null;const p=m.getWorldPosition(V3()).project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};},
 project(v){const p=v.clone().project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};},
 get state(){return {G,E:G.E,camera,scene,renderer,CAM,VM,BLOOD};},
 debug:{audio:AUDIO,round(m){startRound(m||"fight");},fall(type){const E=G.E;if(!E)return;const i=KD_TYPE.indexOf(type);G.kd=i;G.bar=KD_AT[i];E.taunt=false;E.setPhase(Math.min(4,i+1));knockdown();},frame:setFrame}};
}
})();
