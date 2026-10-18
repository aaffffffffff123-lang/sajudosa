/*
 * 사주도사 · 족치기 2D
 * ------------------------------------------------------------
 * - Three.js / WebGL을 전혀 쓰지 않는 Canvas2D 전투 모듈
 * - 기존 진입 계약 유지:
 *     window.PaljaBoot()
 *     window.PaljaGame.enter(result, 'fight' | 'submit')
 * - 전투 중 문서, 영수증, 통계 카드 없음
 * - 12% / 10% / 8% 부역자 개입 뒤 30%로 부활
 * - 모바일 세로 화면 우선, DPR 제한, 포인터 생명주기 정리
 */
(function (global) {
  'use strict';

  if (global.__PALJA_FIGHT_2D__) return;
  global.__PALJA_FIGHT_2D__ = true;

  const SCRIPT_BASE = (() => {
    try { return new URL('.', document.currentScript && document.currentScript.src || location.href).href; }
    catch (_) { return ''; }
  })();

  const STYLE = `
:root{--safe-t:env(safe-area-inset-top,0px);--safe-b:env(safe-area-inset-bottom,0px)}
#fight{--ink:#21192f;--paper:#fff9e9;--plum:#49319c;--red:#d8372b;--gold:#e5a91f;--cyan:#2aa8c8;
 position:fixed;inset:0;z-index:10;overflow:hidden;background:#b7dff0;color:var(--ink);
 font-family:"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;
 user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
#fight[hidden],#fight [hidden]{display:none!important}
#fight button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#fight button:focus-visible{outline:3px solid #fff;outline-offset:3px}
#fight #world{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none}
#fight #flash{position:absolute;inset:0;z-index:2;pointer-events:none;background:#fff;opacity:0}
#fight .ftop{position:absolute;z-index:6;left:0;right:0;top:0;display:flex;align-items:stretch;gap:7px;
 padding:calc(8px + var(--safe-t)) 56px 0 9px;pointer-events:none}
#fight .ftop>*{pointer-events:auto}
#fight .pill{width:42px;min-width:42px;height:42px;border:1px solid rgba(47,35,67,.12);border-radius:13px;
 background:rgba(255,253,246,.93);box-shadow:0 3px 12px rgba(28,20,50,.2);display:grid;place-items:center;padding:0}
#fight .pill:active{transform:translateY(2px)}
#fight .pill svg{width:21px;height:21px;display:block}
#fight .pill .mute{display:none}#fight .pill[aria-pressed=true] .wave{display:none}#fight .pill[aria-pressed=true] .mute{display:block}
#fight .gauge{height:42px;flex:1;min-width:0;max-width:520px;margin:0 auto;padding:7px 10px;border-radius:13px;
 background:rgba(20,14,34,.76);box-shadow:0 3px 14px rgba(9,5,18,.3);backdrop-filter:blur(8px);pointer-events:none}
#fight .grow{display:flex;align-items:center;gap:7px;height:13px;font-size:11px;font-weight:900;line-height:1;white-space:nowrap}
#fight .grow>span:first-child{color:#fff8e1;letter-spacing:.02em}#fight .grow small{display:none}
#fight .kd{display:none;gap:3px}#fight .kd i{width:7px;height:7px;border:1.5px solid #4c3f4e;border-radius:50%;background:#fff}
#fight .kd i.on{background:#d8372b;border-color:#8c1b15}
#fight .bar{position:relative;height:8px;margin-top:6px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.13);box-shadow:inset 0 1px 2px rgba(0,0,0,.28)}
#fight .bar b,#fight .bar i{position:absolute;inset:0;transform-origin:left center;will-change:transform}
#fight .bar b{background:#f7b8b1}#fight .bar i{background:linear-gradient(90deg,#9b1715,#e6432f 68%,#fa7942)}
#fight .dock{position:absolute;left:50%;bottom:0;z-index:7;transform:translateX(-50%);width:min(100%,520px);
 padding:0 10px calc(8px + var(--safe-b));pointer-events:none}
#fight .dock>*{pointer-events:auto}
#fight .hint{width:max-content;max-width:calc(100vw - 20px);margin:0 auto 4px;padding:5px 11px;border-radius:99px;
 background:rgba(31,24,45,.82);color:#fff;font-size:11px;font-weight:750;line-height:1.35;text-align:center;
 opacity:1;transform:translateY(0);transition:.22s opacity,.22s transform;pointer-events:none!important}
#fight .hint.off{opacity:0;transform:translateY(5px)}
#fight .tools{height:78px;display:flex;align-items:flex-end;justify-content:center;gap:5px;pointer-events:none!important}
#fight .tool{--c:#cf342b;position:relative;width:82px;height:62px;border:0;padding:0;background:none;pointer-events:auto;
 transform:translateY(8px) rotate(var(--fan,0deg));transform-origin:50% 120%;transition:transform .14s cubic-bezier(.2,1.3,.45,1);filter:drop-shadow(0 4px 5px rgba(27,20,43,.28))}
#fight .tool:nth-child(1){--fan:-5deg}#fight .tool:nth-child(2){--fan:0deg}#fight .tool:nth-child(3){--fan:5deg}
#fight .tool .card{height:58px;display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 10px;border:2px solid var(--c);
 border-radius:13px;background:linear-gradient(155deg,#fffdf5,#eee1c8);box-shadow:inset 0 0 0 2px rgba(255,255,255,.75)}
#fight .tool svg{width:31px;height:31px;flex:none}#fight .tool .nm{font-size:11px;font-weight:900;white-space:nowrap}
#fight .tool.on{z-index:3;transform:translateY(-5px) rotate(var(--fan,0deg));filter:drop-shadow(0 8px 9px rgba(27,20,43,.34))}
#fight .tool.on .card{background:linear-gradient(155deg,#fff9dc,#ffe49f);box-shadow:inset 0 0 0 2px #fff}
#fight .tool:active{transform:translateY(-1px) rotate(var(--fan,0deg)) scale(.97)}
#fight .talk{position:absolute;left:50%;top:calc(62px + var(--safe-t));z-index:8;transform:translate(-50%,-5px);
 width:max-content;max-width:min(82vw,380px);padding:8px 12px;border:2px solid var(--ink);border-radius:14px;background:rgba(255,253,245,.96);
 box-shadow:0 4px 0 var(--ink),0 8px 20px rgba(25,18,45,.18);font-weight:850;font-size:14px;line-height:1.4;
 text-align:center;pointer-events:none;opacity:0;transition:.14s opacity,.14s transform}
#fight .talk.on{opacity:1;transform:translate(-50%,0)}
#fight .talk b{display:none}
#fight .modal{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(27,20,43,.56)}
#fight .msheet{width:min(100%,390px);padding:17px;border-radius:20px;background:#fffdf5;box-shadow:0 18px 48px rgba(0,0,0,.3)}
#fight .msheet h2{margin:2px 0 7px;font-size:20px}#fight .msheet .close{float:right;margin:-5px -5px 0 0}
#fight .row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 2px;border-bottom:1px solid #e8dfcc;font-size:14px;font-weight:800}
#fight .row small{display:block;margin-top:2px;color:#7c7386;font-size:11px;font-weight:500}
#fight .switch{position:relative;width:51px;height:30px;border:0;border-radius:99px;background:#d3cbbd;padding:0;flex:none}
#fight .switch::after{content:"";position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:left .14s}
#fight .switch[aria-checked=true]{background:#49319c}#fight .switch[aria-checked=true]::after{left:24px}
#fight .btn{min-height:47px;border:2px solid var(--ink);border-radius:13px;padding:10px 14px;background:#fff;font-size:14px;font-weight:900;box-shadow:0 4px 0 var(--ink)}
#fight .btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}#fight .btn.danger{background:#d8372b;color:#fff}
#fight #ending{position:absolute;inset:0;z-index:15;display:flex;align-items:flex-end;justify-content:center;padding:18px 12px calc(91px + var(--safe-b));
 pointer-events:none;background:linear-gradient(transparent 35%,rgba(27,20,43,.46))}
#fight #ending .end-strip{width:min(100%,390px);padding:15px;border:1px solid rgba(255,255,255,.19);border-radius:18px;background:rgba(20,14,34,.88);
 box-shadow:0 18px 46px rgba(0,0,0,.42);backdrop-filter:blur(12px);color:#fff;text-align:center;pointer-events:auto}
#fight #ending h2{margin:0;font-family:"Gowun Batang",serif;font-size:20px;line-height:1.35}#fight #ending p{margin:4px 0 11px;font-size:13px;font-weight:750;color:#d9d0e2}
#fight #ending .btns{display:flex;gap:7px}#fight #ending .btns .btn{flex:1}
#fight #submitDock{width:min(100%,420px)}
#fight .submit-panel{padding:15px;border:1px solid rgba(255,255,255,.2);border-radius:18px;background:rgba(20,14,34,.9);box-shadow:0 16px 40px rgba(0,0,0,.4);backdrop-filter:blur(12px);color:#fff;text-align:center}
#fight .submit-panel small{display:block;color:#e8ba54;font-size:10px;font-weight:900;letter-spacing:.12em}#fight .submit-panel strong{display:block;margin:4px 0 5px;font-family:"Gowun Batang",serif;font-size:21px}#fight .submit-panel p{margin:0 0 10px;font-size:12px;line-height:1.5;color:#d1c7dc}
#fight .submit-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
#fight .submit-done{font-size:13px;font-weight:800;line-height:1.55}
#fight #fallback{position:absolute;inset:0;z-index:30;display:grid;place-content:center;gap:10px;padding:28px;text-align:center;background:#c8e6f2;font-weight:850}
@media(max-width:370px){#fight .ftop{gap:5px;padding-right:50px}#fight .pill{width:38px!important;min-width:38px!important}#fight .tool{width:74px!important}#fight .tool .card{padding-inline:7px!important}#fight .tool .nm{font-size:10px!important}}
@media(orientation:landscape) and (max-height:540px){#fight .dock#dock{left:auto;right:8px;bottom:8px;transform:none;width:104px;padding:0}#fight .tools{height:auto!important;display:flex;flex-direction:column!important;gap:4px!important}#fight .tool{width:100px!important;height:45px!important;transform:none!important}#fight .tool .card{height:43px!important;justify-content:flex-start!important}#fight .tool svg{width:26px!important;height:26px!important}#fight .hint{position:fixed;left:50%;bottom:8px;transform:translateX(-50%)}#fight #ending{padding:55px 124px 8px 12px}}
@media(prefers-reduced-motion:reduce){#fight .tool{transition:none}#fight .talk{transition:none}}
`;

  const ICONS = `
<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden"><defs>
 <symbol id="fi2-fist" viewBox="0 0 48 48"><path d="M11 36c-4-4-3-11-1-17l1-4c.7-2.4 3.7-1.9 3.8.5l.1 4c.2-3.8 4.2-4 4.5-.2.2-3.7 4.3-3.7 4.6.1.4-3.1 4.4-2.9 4.5.5l.2 5c4.9-1.2 7.1 2.7 5.4 6.6-2.4 5.8-7.1 8.6-13.6 8.6H13z" fill="#efad83" stroke="#21192f" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 19l.4 6m4-7v6m4.3-6v6" stroke="#bd704e" stroke-width="1.8" stroke-linecap="round"/><path d="M12 27c7-2 14-2 21 0" stroke="#fff6dd" stroke-width="3.7"/></symbol>
 <symbol id="fi2-knife" viewBox="0 0 48 48"><path d="M7 41l12-12" stroke="#241c2b" stroke-width="8" stroke-linecap="round"/><path d="M8 40l11-11" stroke="#754a2e" stroke-width="4" stroke-linecap="round"/><path d="M17 31L30 13l12-3-2 12-15 12z" fill="#e9f1f5" stroke="#21192f" stroke-width="2.5" stroke-linejoin="round"/><path d="M23 30l15-15" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></symbol>
 <symbol id="fi2-gun" viewBox="0 0 48 48"><path d="M5 15h37v10H24l-3 5-1 11h-9l2-14-4-2H5z" fill="#41434b" stroke="#21192f" stroke-width="2.5" stroke-linejoin="round"/><path d="M9 19h29m-8-4v10m5-10v10" stroke="#898d98" stroke-width="1.5"/><path d="M20 25c0 4 2 6 6 6" fill="none" stroke="#21192f" stroke-width="2.2" stroke-linecap="round"/></symbol>
</defs></svg>`;

  const HTML = `
<section id="fight" hidden>
 <canvas id="world" tabindex="0" aria-label="운명 설계자와 싸우는 화면"></canvas>
 <div id="flash" aria-hidden="true"></div>
 <div id="talk" class="talk" aria-live="polite"><b id="talkWho"></b><span id="talkText"></span></div>
 <header class="ftop">
  <button class="pill" id="fightBack" type="button" aria-label="사주 풀이로 돌아가기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
  <div class="gauge" aria-hidden="true"><div class="grow"><span>운명 설계자</span><span class="kd" id="kdPips"><i></i><i></i><i></i></span><small id="gaugePct"></small></div><div class="bar"><b id="gaugeLag"></b><i id="gaugeFill"></i></div></div>
  <button class="pill" id="soundBtn" type="button" aria-label="소리 끄고 켜기" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16 8.5c2.2 2 2.2 5 0 7M18.8 5.5c4.2 3.6 4.2 9.4 0 13"/><path class="mute" d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg></button>
  <button class="pill" id="settingsBtn" type="button" aria-label="설정"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="#fff"/><circle cx="15" cy="17" r="2.5" fill="#fff"/></svg></button>
 </header>
 <div class="dock" id="dock">
  <div class="hint off" id="hint"></div>
  <div class="tools" id="tools" role="group" aria-label="무기">
   <button class="tool on" type="button" data-tool="hand" aria-label="맨주먹" style="--c:#ca342c"><span class="card"><svg viewBox="0 0 48 48"><use href="#fi2-fist"/></svg><span class="nm">맨주먹</span></span></button>
   <button class="tool" type="button" data-tool="knife" aria-label="식칼" style="--c:#36749f"><span class="card"><svg viewBox="0 0 48 48"><use href="#fi2-knife"/></svg><span class="nm">식칼</span></span></button>
   <button class="tool" type="button" data-tool="gun" aria-label="권총" style="--c:#6547aa"><span class="card"><svg viewBox="0 0 48 48"><use href="#fi2-gun"/></svg><span class="nm">권총</span></span></button>
  </div>
 </div>
 <div class="dock" id="submitDock" hidden>
  <div class="submit-panel" id="submitWorkflow"><small>운명 설계자의 제안</small><strong>정해 준 대로 살겠습니까?</strong><p>당신이 비켜나면 다음 사람도 같은 자리에 묶입니다.</p><div class="submit-actions"><button class="btn" id="fateSeal" type="button">그대로 둔다</button><button class="btn danger" id="breakSeal" type="button">설계자를 팬다</button></div></div>
  <div class="submit-panel submit-done" id="submitCertificate" hidden>그래. 네 팔자대로만 살거라.<br><button class="btn danger" id="submitFight" type="button" style="margin-top:10px;width:100%">마음 바꿔서 팬다</button></div>
 </div>
 <div class="modal" id="settingsModal" hidden>
  <div class="msheet" role="dialog" aria-modal="true" aria-labelledby="fSetTitle">
   <button class="pill close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
   <h2 id="fSetTitle">설정</h2>
   <div class="row">소리<button class="switch" id="swSound" type="button" role="switch" aria-checked="true" aria-label="소리"></button></div>
   <div class="row">진동<button class="switch" id="swVibe" type="button" role="switch" aria-checked="true" aria-label="진동"></button></div>
   <div class="row">화면 흔들림<button class="switch" id="swShake" type="button" role="switch" aria-checked="true" aria-label="화면 흔들림"></button></div>
   <div class="row"><div>푸른 피<small>끄면 금빛 먼지만 튑니다.</small></div><button class="switch" id="swBlood" type="button" role="switch" aria-checked="true" aria-label="푸른 피"></button></div>
   <div class="row"><div>과장 변형<small>맞는 순간 얼굴과 몸이 크게 찌그러집니다.</small></div><button class="switch" id="swDeform" type="button" role="switch" aria-checked="true" aria-label="과장 변형"></button></div>
   <button class="btn" id="resetFight" type="button" style="width:100%;margin-top:14px">처음부터 다시</button>
  </div>
 </div>
 <div id="ending" hidden><div class="end-strip" role="dialog" aria-modal="true" aria-labelledby="endTitle"><h2 id="endTitle">운명 설계자의 운명을 설계했습니다</h2><p>운명은 좁밥이었습니다.</p><div class="btns"><button class="btn danger" id="endAgain" type="button">다시 패기</button><button class="btn" id="endMore" type="button">계속 패기</button><button class="btn" id="endHome" type="button">나가기</button></div></div></div>
 <div id="fallback" hidden><div id="fallbackTitle">화면을 준비하지 못했습니다.</div><small id="fallbackDetail"></small><button class="btn" id="retryGame" type="button">돌아가기</button></div>
</section>`;

  let booted = false;
  let runtime = null;

  global.PaljaBoot = function PaljaBoot() {
    if (booted) return;
    booted = true;
    try {
      if (!document.getElementById('fight-style-2d')) {
        const style = document.createElement('style');
        style.id = 'fight-style-2d';
        style.textContent = STYLE;
        document.head.appendChild(style);
      }
      if (!document.getElementById('fight')) {
        const holder = document.createElement('div');
        holder.innerHTML = HTML.trim();
        document.body.appendChild(holder.firstElementChild);
        holder.innerHTML = ICONS;
        document.body.appendChild(holder.firstElementChild);
      }
      runtime = createRuntime();
      global.PaljaGame = runtime.api;
    } catch (error) {
      installFallback(error);
    }
  };

  function installFallback(error) {
    const fight = document.getElementById('fight');
    const fallback = document.getElementById('fallback');
    if (fallback) {
      fallback.hidden = false;
      const detail = document.getElementById('fallbackDetail');
      if (detail) detail.textContent = String(error && error.message || error).slice(0, 180);
    }
    const leave = function () {
      if (fight) fight.hidden = true;
      if (global.__paljaLeave) global.__paljaLeave();
    };
    const retry = document.getElementById('retryGame');
    if (retry) retry.onclick = leave;
    global.PaljaGame = { enter: function () { if (fight) fight.hidden = false; }, leave: leave, pause: function () {} };
  }

  function createRuntime() {
    const $ = function (selector) { return document.querySelector(selector); };
    const $$ = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };
    const canvas = $('#world');
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) throw new Error('Canvas2D를 열 수 없습니다.');

    const ART = {
      boss: new Image(), court: new Image(), crowd: new Image(),
      bossReady: false, courtReady: false, crowdReady: false,
      bossBuffer: document.createElement('canvas'), bossBufferCtx: null, maskKey: ''
    };
    ART.boss.decoding = ART.court.decoding = ART.crowd.decoding = 'async';
    ART.bossBuffer.width = 512; ART.bossBuffer.height = 768;
    ART.bossBufferCtx = ART.bossBuffer.getContext('2d', { alpha: true, desynchronized: true });
    ART.boss.onload = () => { ART.bossReady = true; ART.maskKey = ''; draw(); };
    ART.court.onload = () => { ART.courtReady = true; draw(); };
    ART.crowd.onload = () => { ART.crowdReady = true; draw(); };
    ART.boss.onerror = () => { ART.bossReady = false; };
    ART.court.onerror = () => { ART.courtReady = false; };
    ART.crowd.onerror = () => { ART.crowdReady = false; };
    ART.boss.src = SCRIPT_BASE + 'assets/fate-designer-2d.webp';
    ART.court.src = SCRIPT_BASE + 'assets/fate-court-2d.webp';
    ART.crowd.src = SCRIPT_BASE + 'assets/fate-beneficiary-2d-sprites.webp';

    const clamp = (n, a, b) => n < a ? a : n > b ? b : n;
    const lerp = (a, b, t) => a + (b - a) * t;
    const sat = n => clamp(n, 0, 1);
    const smooth = n => { n = sat(n); return n * n * (3 - 2 * n); };
    const out3 = n => 1 - Math.pow(1 - sat(n), 3);
    const inOut = n => { n = sat(n); return n < .5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2; };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = list => list[(Math.random() * list.length) | 0];
    const TAU = Math.PI * 2;

    const prefDefaults = { sound: true, vibe: true, shake: true, blood: true, deform: true };
    let PREF = Object.assign({}, prefDefaults);
    try { PREF = Object.assign(PREF, JSON.parse(localStorage.getItem('palja2d.prefs') || '{}')); } catch (_) {}

    const VIEW = { w: 1, h: 1, dpr: 1, cx: .5, floor: 1, s: 1, safeBottom: 0, portrait: true };
    const G = {
      result: null, mode: 'fight', state: 'idle', previousState: '', stateT: 0, time: 0,
      running: false, raf: 0, last: performance.now(), paused: false, docPaused: false,
      hp: 100, shown: 100, lag: 100, tool: 'hand', phase: 0, hits: 0,
      crowdGrab: false, crowdWall: false, revivalUsed: false, revived: false,
      inputLocked: false, hitstop: 0, flash: 0, flashColor: '#fff', shake: 0,
      boss: { x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, squash: 0, squashV: 0 },
      impact: null, weapon: null, damage: [], trails: [], eventFlags: new Set(),
      hintUntil: 0, talkUntil: 0, endless: false, round: 0, submitDone: false, downCount: 0, downReturn: 'fight',
      anatomy: freshAnatomy(), detached: [], looseEyes: [], coins: []
    };

    function freshAnatomy() {
      return {
        eyes: { eyeL: { hits: 0, state: 'in', t: 0 }, eyeR: { hits: 0, state: 'in', t: 0 } },
        bellyCuts: 0, bellyStage: 0, headDamage: 0, headState: 'normal', headT: 0,
        headCycles: 0, limbCuts: { armL: 0, armR: 0, legL: 0, legR: 0 }, missing: new Set()
      };
    }

    const pointers = new Map();
    let resizeTimer = 0;

    class ParticlePool {
      constructor(size) {
        this.items = Array.from({ length: size }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, spin: 0, rot: 0, drag: 0, gravity: 0, color: '#fff', kind: 'dot', alpha: 1 }));
        this.cursor = 0;
      }
      clear() { for (const p of this.items) p.active = false; }
      spawn(x, y, options) {
        let p = null;
        for (let n = 0; n < this.items.length; n++) {
          const i = (this.cursor + n) % this.items.length;
          if (!this.items[i].active) { p = this.items[i]; this.cursor = (i + 1) % this.items.length; break; }
        }
        if (!p) { p = this.items[this.cursor]; this.cursor = (this.cursor + 1) % this.items.length; }
        const o = options || {};
        p.active = true; p.x = x; p.y = y; p.vx = o.vx || 0; p.vy = o.vy || 0;
        p.life = p.max = o.life || .5; p.size = o.size || 4; p.spin = o.spin || 0; p.rot = o.rot || 0;
        p.drag = o.drag == null ? 1.6 : o.drag; p.gravity = o.gravity == null ? 480 : o.gravity;
        p.color = o.color || '#fff'; p.kind = o.kind || 'dot'; p.alpha = o.alpha == null ? 1 : o.alpha;
        return p;
      }
      step(dt) {
        for (const p of this.items) if (p.active) {
          p.life -= dt;
          if (p.life <= 0) { p.active = false; continue; }
          const drag = Math.exp(-p.drag * dt);
          p.vx *= drag; p.vy = p.vy * drag + p.gravity * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
        }
      }
      draw(c) {
        for (const p of this.items) if (p.active) {
          const q = sat(p.life / p.max);
          c.save(); c.globalAlpha = p.alpha * Math.min(1, q * 2.2); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.color;
          if (p.kind === 'streak') { c.scale(1, .25); c.beginPath(); c.ellipse(0, 0, p.size * (1.6 - q * .3), p.size, 0, 0, TAU); c.fill(); }
          else if (p.kind === 'shard') { c.beginPath(); c.moveTo(-p.size, -p.size * .25); c.lineTo(p.size * 1.5, 0); c.lineTo(-p.size * .4, p.size * .45); c.closePath(); c.fill(); }
          else if (p.kind === 'spark') { c.fillRect(-p.size * 1.8, -p.size * .22, p.size * 3.6, p.size * .44); }
          else { c.beginPath(); c.arc(0, 0, p.size * (.55 + .45 * q), 0, TAU); c.fill(); }
          c.restore();
        }
      }
    }

    class EffectPool {
      constructor(size) { this.items = Array.from({ length: size }, () => ({ active: false })); this.cursor = 0; }
      clear() { for (const e of this.items) e.active = false; }
      add(kind, x, y, options) {
        let e = this.items.find(v => !v.active);
        if (!e) { e = this.items[this.cursor]; this.cursor = (this.cursor + 1) % this.items.length; }
        const o = options || {};
        Object.assign(e, { active: true, kind, x, y, life: o.life || .45, max: o.life || .45, size: o.size || 50, color: o.color || '#fff4b2', text: o.text || '', rot: o.rot || 0, dx: o.dx || 0, dy: o.dy || 0 });
        return e;
      }
      step(dt) { for (const e of this.items) if (e.active && (e.life -= dt) <= 0) e.active = false; }
      draw(c) {
        for (const e of this.items) if (e.active) {
          const p = 1 - e.life / e.max, q = sat(e.life / e.max);
          c.save(); c.translate(e.x + e.dx * out3(p), e.y + e.dy * out3(p)); c.rotate(e.rot);
          if (e.kind === 'ring') {
            c.globalAlpha = q; c.strokeStyle = e.color; c.lineWidth = Math.max(2, 8 * q); c.beginPath(); c.arc(0, 0, e.size * (.25 + p * 1.15), 0, TAU); c.stroke();
          } else if (e.kind === 'slash') {
            c.globalAlpha = Math.min(1, q * 2); c.strokeStyle = e.color; c.lineWidth = Math.max(2, e.size * .12 * q); c.lineCap = 'round'; c.beginPath(); c.moveTo(-e.size * .7, e.size * .28); c.quadraticCurveTo(0, -e.size * .35, e.size * .78, -e.size * .25); c.stroke();
          } else if (e.kind === 'word') {
            const sc = p < .18 ? lerp(.25, 1.18, p / .18) : lerp(1.18, .95, (p - .18) / .82);
            c.scale(sc, sc); c.globalAlpha = Math.min(1, q * 2.8); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${e.size}px "Black Han Sans","Apple SD Gothic Neo",sans-serif`;
            c.lineJoin = 'round'; c.strokeStyle = '#fff8df'; c.lineWidth = Math.max(5, e.size * .13); c.strokeText(e.text, 0, 0); c.fillStyle = '#20182e'; c.fillText(e.text, 0, 0);
            c.strokeStyle = e.color; c.lineWidth = Math.max(2, e.size * .065); c.strokeText(e.text, 4, 5);
          }
          c.restore();
        }
      }
    }

    const particles = new ParticlePool(260);
    const effects = new EffectPool(40);

    const AUDIO = (() => {
      let ac = null, master = null, noiseBuffer = null;
      function context() {
        if (!PREF.sound) return null;
        if (!ac) {
          const AC = global.AudioContext || global.webkitAudioContext;
          if (!AC) return null;
          ac = new AC(); master = ac.createGain(); master.gain.value = .72; master.connect(ac.destination);
          noiseBuffer = ac.createBuffer(1, Math.max(1, (ac.sampleRate * .5) | 0), ac.sampleRate);
          const data = noiseBuffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function env(gain, at, peak, end) { gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), at + .006); gain.gain.exponentialRampToValueAtTime(.0001, end); }
      function tone(freq, duration, type, volume, bend) {
        const a = context(); if (!a) return;
        const at = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
        osc.type = type || 'sine'; osc.frequency.setValueAtTime(freq, at); if (bend) osc.frequency.exponentialRampToValueAtTime(Math.max(25, bend), at + duration);
        env(gain, at, volume || .12, at + duration); osc.connect(gain); gain.connect(master); osc.start(at); osc.stop(at + duration + .02);
      }
      function noise(duration, volume, frequency, q) {
        const a = context(); if (!a || !noiseBuffer) return;
        const at = a.currentTime, src = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain();
        src.buffer = noiseBuffer; filter.type = 'bandpass'; filter.frequency.value = frequency || 700; filter.Q.value = q || .65;
        env(gain, at, volume || .12, at + duration); src.connect(filter); filter.connect(gain); gain.connect(master); src.start(at); src.stop(at + duration + .02);
      }
      return {
        unlock: context,
        ui() { tone(470, .045, 'sine', .045, 620); },
        hit(kind, heavy) {
          if (kind === 'hand') { noise(heavy ? .11 : .07, heavy ? .22 : .16, heavy ? 210 : 300, .55); tone(heavy ? 82 : 112, heavy ? .13 : .08, 'sine', .16, 48); }
          else if (kind === 'knife') { noise(.13, .17, 1350, 1.1); tone(260, .08, 'sawtooth', .055, 95); }
          else { noise(.1, .26, 850, .35); tone(118, .16, 'square', .12, 42); tone(1350, .035, 'square', .04, 520); }
        },
        whiff(kind) { if (kind === 'knife') noise(.09, .045, 1800, .9); else noise(.055, .035, 750, .7); },
        block() { tone(430, .08, 'square', .09, 190); noise(.06, .06, 2100, 3); },
        fall() { tone(76, .3, 'sine', .2, 32); noise(.22, .16, 120, .45); },
        crowd() { noise(.34, .07, 520, .45); tone(165, .18, 'sawtooth', .055, 115); },
        revive() { tone(180, 1.25, 'sine', .06, 720); tone(360, .85, 'triangle', .065, 980); },
        boom() { tone(95, .45, 'sine', .24, 28); noise(.32, .22, 150, .4); },
        suspend() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); },
        resume() { if (PREF.sound && ac && ac.state === 'suspended') ac.resume().catch(() => {}); }
      };
    })();

    function savePrefs() { try { localStorage.setItem('palja2d.prefs', JSON.stringify(PREF)); } catch (_) {} }
    function syncPrefs() {
      for (const key of Object.keys(prefDefaults)) {
        const el = $('#sw' + key[0].toUpperCase() + key.slice(1));
        if (el) el.setAttribute('aria-checked', String(!!PREF[key]));
      }
      $('#soundBtn').setAttribute('aria-pressed', String(!PREF.sound));
    }
    function togglePref(key) { PREF[key] = !PREF[key]; savePrefs(); syncPrefs(); if (key === 'sound') { if (PREF.sound) AUDIO.resume(); else AUDIO.suspend(); } else AUDIO.ui(); }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width || innerWidth), h = Math.max(1, rect.height || innerHeight);
      const coarse = !!(global.matchMedia && global.matchMedia('(pointer:coarse)').matches);
      let dpr = Math.min(global.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
      const maxPixels = 2900000;
      if (w * h * dpr * dpr > maxPixels) dpr = Math.sqrt(maxPixels / (w * h));
      dpr = Math.max(1, dpr);
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      VIEW.w = w; VIEW.h = h; VIEW.dpr = dpr; VIEW.cx = w * .5; VIEW.portrait = h >= w;
      VIEW.safeBottom = readSafeBottom();
      VIEW.floor = VIEW.portrait ? Math.min(h - 112 - VIEW.safeBottom, h * .86) : h - 35;
      VIEW.s = clamp(Math.min(w / 430, h / 820), VIEW.portrait ? .73 : .58, VIEW.portrait ? 1.22 : .9);
      draw();
    }
    function readSafeBottom() {
      const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;left:-999px;bottom:0;padding-bottom:env(safe-area-inset-bottom,0px)'; document.body.appendChild(probe);
      const n = parseFloat(getComputedStyle(probe).paddingBottom) || 0; probe.remove(); return n;
    }

    function setState(name) {
      G.previousState = G.state; G.state = name; G.stateT = 0; G.eventFlags.clear();
      G.inputLocked = !['fight', 'fight2', 'endless'].includes(name);
      if (G.inputLocked) clearPointers();
    }
    function once(key, at, fn) { if (G.stateT >= at && !G.eventFlags.has(key)) { G.eventFlags.add(key); fn(); } }

    function resetRound(mode) {
      clearPointers(); particles.clear(); effects.clear();
      Object.assign(G, {
        mode: mode === 'submit' ? 'submit' : 'fight', state: 'idle', previousState: '', stateT: 0,
        hp: 100, shown: 100, lag: 100, tool: 'hand', phase: 0, hits: 0,
        crowdGrab: false, crowdWall: false, revivalUsed: false, revived: false,
        inputLocked: false, hitstop: 0, flash: 0, shake: 0, impact: null, weapon: null,
        damage: [], trails: [], eventFlags: new Set(), hintUntil: 0, talkUntil: 0,
        endless: false, submitDone: false, downCount: 0, downReturn: 'fight', anatomy: freshAnatomy(), detached: [], looseEyes: [], coins: []
      });
      Object.assign(G.boss, { x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, squash: 0, squashV: 0 });
      $('#ending').hidden = true; $('#settingsModal').hidden = true; $('#submitDock').hidden = true; $('#dock').hidden = mode === 'submit';
      $('#hint').classList.add('off'); $('#talk').classList.remove('on');
      $('#submitWorkflow').hidden = false; $('#submitCertificate').hidden = true; $('.gauge').hidden = mode === 'submit';
      setTool('hand', true); syncPrefs(); updateGauge(true);
      if (mode === 'submit') { setState('submit'); $('#submitDock').hidden = false; }
      else { setState('intro'); hint('몸을 눌러 때리세요.', 4); }
      G.round++;
    }

    function startFightFromSubmit() {
      $('#submitDock').hidden = true; $('#dock').hidden = false; $('.gauge').hidden = false;
      $('#talk').classList.remove('on'); G.talkUntil = 0;
      G.mode = 'fight'; G.hp = G.shown = G.lag = 100; G.damage.length = 0; G.phase = 0; G.anatomy = freshAnatomy(); G.detached.length = 0; G.looseEyes.length = 0; ART.maskKey = ''; updateGauge(true);
      setState('intro'); hint('몸을 눌러 때리세요.', 4); flash('#fff7c5', .32); AUDIO.boom();
    }

    function updateEvents(dt) {
      G.stateT += dt;
      if (G.state === 'intro') {
        if (G.stateT >= .72) setState('fight');
      } else if (G.state === 'down') {
        once('body', .05, () => { AUDIO.fall(); G.shake = Math.max(G.shake, 13); vibrate(24); });
        if (G.stateT >= .58) setState(G.downReturn || (G.revived ? 'fight2' : 'fight'));
      } else if (G.state === 'crowd_grab') {
        once('rush', .08, () => { AUDIO.crowd(); G.shake = Math.max(G.shake, 10); vibrate([25, 20, 35]); });
        once('line', .32, () => talk('잠깐만요! 저 사람 없어지면 제 사주는요?', 1.2));
        once('grip', .48, () => { AUDIO.block(); G.shake = Math.max(G.shake, 7); });
        if (G.stateT >= 1.75) setState('fight');
      } else if (G.state === 'crowd_wall') {
        once('wall', .08, () => { AUDIO.crowd(); G.shake = Math.max(G.shake, 9); });
        once('line', .46, () => talk('저 사람 하나 때문에 우리 팔자까지 망가져요!', 1.25));
        once('scatter', 1.38, () => { AUDIO.boom(); G.shake = Math.max(G.shake, 13); spawnCrowdBurst(); });
        if (G.stateT >= 2.1) setState('fight');
      } else if (G.state === 'revival') {
        once('drop', .12, () => { AUDIO.fall(); G.shake = Math.max(G.shake, 15); vibrate([35, 25, 45]); });
        once('cry1', 1.05, () => talk('설계자님! 눈을 뜨세요!', 1.15));
        once('gather', 2.55, () => { AUDIO.revive(); spawnReviveLights(); });
        once('cry2', 2.7, () => talk('제 것만은 건드리지 마세요!', 1.2));
        for (let i = 0; i < 6; i++) once('stamp' + i, 5.05 + i * .1, () => AUDIO.block());
        once('impact', 5.88, () => { flash('#fff3b0', .88); AUDIO.boom(); G.shake = 24; vibrate([45, 35, 80]); });
        once('replace', 6.05, () => { G.damage.length = 0; G.phase = 0; G.anatomy = freshAnatomy(); G.detached.length = 0; G.looseEyes.length = 0; ART.maskKey = ''; Object.assign(G.boss, { x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, squash: 0, squashV: 0 }); });
        once('return', 6.28, () => { G.hp = G.shown = G.lag = 30; G.revived = true; updateGauge(true); talk('운명은 뻥이었습니다. ㅠㅠ', 1.05); });
        if (G.stateT >= 7.4) setState('fight2');
      } else if (G.state === 'defeat') {
        once('fall', .05, () => { AUDIO.fall(); G.shake = 20; vibrate([35, 20, 55]); });
        if (G.stateT >= 2.55) { setState('ended'); $('#ending').hidden = false; requestAnimationFrame(() => $('#endAgain').focus()); }
      }
    }

    function phaseFromHp() {
      const scaleMax = G.revived ? 30 : 100;
      const ratio = G.hp / scaleMax;
      const p = ratio <= .22 ? 4 : ratio <= .46 ? 3 : ratio <= .7 ? 2 : ratio <= .88 ? 1 : 0;
      if (p > G.phase) G.phase = p;
    }

    function canStrike() { return ['fight', 'fight2', 'endless'].includes(G.state) && !G.paused && !G.docPaused; }

    function applyDamage(amount, hit, attack) {
      if (!hit) return false;
      if (G.state === 'crowd_wall' || G.state === 'crowd_grab' || G.state === 'revival') { blockedAt(hit.screenX, hit.screenY); return false; }
      if (!canStrike()) return false;
      let damage = Math.max(.05, amount);
      if (hit.part === 'head') damage *= 1.2;
      else if (hit.part === 'crown') { blockedAt(hit.screenX, hit.screenY); return false; }
      if (G.state === 'endless') damage = 0;
      const previousHp = G.hp;
      let next = Math.max(0, G.hp - damage);
      if (!G.revivalUsed) {
        if (!G.crowdGrab && next <= 12) {
          G.hp = G.shown = 12; G.crowdGrab = true; updateGauge(true); setState('crowd_grab'); return true;
        }
        if (G.crowdGrab && !G.crowdWall && next <= 10) {
          G.hp = G.shown = 10; G.crowdWall = true; updateGauge(true); setState('crowd_wall'); return true;
        }
        if (G.crowdWall && next <= 8) {
          G.hp = G.shown = 8; G.revivalUsed = true; updateGauge(true); setState('revival'); return true;
        }
      }
      G.hp = next; G.shown = next; phaseFromHp(); updateGauge();
      if (!G.revived && G.state !== 'endless' && G.downCount < 3) {
        const threshold = [75, 50, 25][G.downCount];
        if (previousHp > threshold && next <= threshold) {
          G.downCount++; G.downReturn = G.state; setState('down');
        }
      }
      if (G.revived && G.hp <= 0 && G.state !== 'endless') setState('defeat');
      return true;
    }

    function strike(tool, attack, sx, sy, options) {
      const hit = locateScreen(sx, sy);
      if (!hit) { AUDIO.whiff(tool); showWeapon(tool, attack, sx, sy, false); return false; }
      const o = options || {};
      let amount = 1;
      if (tool === 'hand') amount = attack === 'hook' ? 3.05 : attack === 'upper' ? 3.35 : 2.15;
      else if (tool === 'knife') amount = attack === 'slash' ? .82 : 3.85;
      else amount = 2.7;
      if (o.power != null) amount *= o.power;
      const accepted = applyDamage(amount, hit, attack);
      if (!accepted) return false;
      G.hits++;
      addDamage(hit, tool, attack, o.angle, o.trackAnatomy !== false);
      reactToHit(hit, tool, attack, amount);
      showWeapon(tool, attack, sx, sy, true, o.angle);
      return true;
    }

    function reactToHit(hit, tool, attack, amount) {
      const b = G.boss, side = hit.localX >= 0 ? 1 : -1;
      const heavy = tool === 'gun' || attack === 'hook' || attack === 'upper' || attack === 'stab';
      b.vx += -side * (heavy ? 185 : 105); b.vy += attack === 'upper' ? -145 : heavy ? -55 : -25;
      b.vr += -side * (heavy ? 1.15 : .55); b.squashV += heavy ? 4.2 : 2.5;
      G.impact = { t: 0, max: heavy ? .24 : .16, localX: hit.localX, localY: hit.localY, part: hit.part, side, tool, attack, strength: heavy ? 1 : .66 };
      G.hitstop = Math.max(G.hitstop, tool === 'gun' ? .034 : heavy ? .058 : .028);
      G.shake = Math.max(G.shake, heavy ? 12 : 7);
      AUDIO.hit(tool, heavy); vibrate(heavy ? 28 : 13);
      spawnHitParticles(hit.screenX, hit.screenY, tool, heavy, side);
      if (tool === 'hand') effects.add('ring', hit.screenX, hit.screenY, { size: heavy ? 48 : 32, life: .26, color: heavy ? '#ffe068' : '#fff7dc' });
      else if (tool === 'knife') effects.add('slash', hit.screenX, hit.screenY, { size: attack === 'slash' ? 70 : 42, life: .28, color: '#8fb7ff', rot: attack === 'slash' ? (G.weapon && G.weapon.angle || 0) : -.7 });
      else effects.add('ring', hit.screenX, hit.screenY, { size: 42, life: .2, color: '#ffd385' });
    }

    function blockedAt(x, y) {
      AUDIO.block(); G.shake = Math.max(G.shake, 4); effects.add('ring', x, y, { size: 26, life: .2, color: '#ffe28a' });
      for (let i = 0; i < 7; i++) particles.spawn(x, y, { vx: rnd(-170, 170), vy: rnd(-190, 20), gravity: 420, drag: 2, life: rnd(.2, .38), size: rnd(2, 5), color: '#ffd65c', kind: 'spark' });
    }

    function addDamage(hit, tool, attack, angle, trackAnatomy) {
      const record = {
        part: hit.part, x: hit.localX, y: hit.localY, kind: tool === 'hand' ? 'bruise' : tool === 'gun' ? 'hole' : 'cut',
        size: tool === 'gun' ? rnd(5, 8) : attack === 'stab' ? rnd(7, 11) : tool === 'knife' ? rnd(8, 13) : rnd(12, 22),
        angle: Number.isFinite(angle) ? angle : rnd(-1.2, 1.2), seed: Math.random(), drip: tool === 'hand' ? 0 : rnd(7, 26)
      };
      G.damage.push(record);
      if (G.damage.length > 150) G.damage.shift();
      if (trackAnatomy) advanceAnatomy(hit, tool, attack);
    }

    function advanceAnatomy(hit, tool, attack) {
      const a = G.anatomy;
      if (hit.part === 'head' && a.headState === 'normal') {
        const weight = tool === 'knife' && attack === 'stab' ? 2.15 : tool === 'gun' ? 1.35 : tool === 'knife' ? 1.1 : .8;
        a.headDamage += weight;
        const eyeKey = hit.eyeKey, eye = eyeKey && a.eyes[eyeKey];
        if (eye) {
          eye.hits += weight;
          if (eye.state === 'in' && eye.hits >= 2.6) detachEye(eyeKey);
        }
        if (a.headDamage >= 11.5) breakHead();
      }
      if (hit.part === 'belly' && tool === 'knife') {
        a.bellyCuts = Math.min(7, a.bellyCuts + 1);
        const stage = a.bellyCuts >= 7 ? 7 : a.bellyCuts >= 5 ? 5 : a.bellyCuts >= 3 ? 3 : 0;
        if (stage > a.bellyStage) {
          a.bellyStage = stage; G.shake = Math.max(G.shake, stage === 7 ? 16 : 9);
          const p = localToScreen(0, -329); effects.add('ring', p.x, p.y, { size: stage === 7 ? 64 : 38, life: .34, color: '#3e7bff' });
        }
      }
      if (Object.prototype.hasOwnProperty.call(a.limbCuts, hit.part) && !a.missing.has(hit.part)) {
        a.limbCuts[hit.part] += tool === 'knife' ? (attack === 'stab' ? .75 : 1.05) : tool === 'gun' ? .6 : .16;
        const need = 3;
        if (a.limbCuts[hit.part] >= need) detachLimb(hit.part);
      }
    }

    function detachEye(key) {
      const eye = G.anatomy.eyes[key]; if (!eye || eye.state !== 'in') return;
      eye.state = 'gone'; eye.t = 0;
      const side = key === 'eyeL' ? -1 : 1, p = localToScreen(side * 20, -578);
      G.looseEyes.push({ x: p.x, y: p.y, vx: side * rnd(80, 170), vy: rnd(-240, -135), r: 0, vr: side * rnd(7, 13), life: 2.2 });
      for (let i = 0; i < 14; i++) particles.spawn(p.x, p.y, { vx: side * rnd(15, 235), vy: rnd(-245, 30), gravity: 650, drag: 1.6, life: rnd(.35, .85), size: rnd(2, 6), color: pick(['#103597', '#174dd1', '#3e7bff', '#8fb7ff']), kind: i % 3 ? 'dot' : 'streak' });
      flash('#8fb7ff', .22); G.shake = Math.max(G.shake, 13);
    }

    function breakHead() {
      const a = G.anatomy; if (a.headState !== 'normal') return;
      a.headState = 'breaking'; a.headT = 0; a.headCycles++;
      const p = localToScreen(0, -568);
      for (let i = 0; i < 38; i++) particles.spawn(p.x, p.y, { vx: rnd(-420, 420), vy: rnd(-450, 90), gravity: 720, drag: 1.45, life: rnd(.45, 1.15), size: rnd(3, 9), color: pick(['#081c59', '#103597', '#3e7bff', '#d8bd68']), kind: i % 4 ? 'dot' : 'shard', spin: rnd(-12, 12) });
      effects.add('ring', p.x, p.y, { size: 92, life: .42, color: '#8fb7ff' });
      flash('#dce7ff', .62); G.shake = Math.max(G.shake, 23); G.hitstop = Math.max(G.hitstop, .11); vibrate([38, 22, 52]);
    }

    function detachLimb(part) {
      const a = G.anatomy; if (a.missing.has(part)) return;
      a.missing.add(part); ART.maskKey = '';
      const anchors = { armL: [-142, -286], armR: [142, -286], legL: [-66, -83], legR: [66, -83] };
      const q = anchors[part], p = localToScreen(q[0], q[1]), side = /L$/.test(part) ? -1 : 1;
      G.detached.push({ part, x: p.x, y: p.y, vx: side * rnd(160, 290), vy: rnd(-330, -190), r: 0, vr: side * rnd(5, 10), life: 2.8 });
      for (let i = 0; i < 24; i++) particles.spawn(p.x, p.y, { vx: side * rnd(20, 330), vy: rnd(-300, 60), gravity: 690, drag: 1.4, life: rnd(.38, .95), size: rnd(3, 8), color: pick(['#081c59', '#103597', '#174dd1', '#8fb7ff']), kind: i % 3 ? 'dot' : 'streak', spin: rnd(-10, 10) });
      flash('#c7d8ff', .34); G.shake = Math.max(G.shake, 18); vibrate([28, 20, 38]);
    }

    function spawnHitParticles(x, y, tool, heavy, side) {
      const count = tool === 'gun' ? 18 : tool === 'knife' ? 13 : heavy ? 12 : 7;
      const blood = PREF.blood && tool !== 'hand';
      for (let i = 0; i < count; i++) {
        const a = rnd(-Math.PI * .85, -Math.PI * .15), speed = rnd(80, heavy ? 410 : 260);
        particles.spawn(x, y, { vx: Math.cos(a) * speed - side * rnd(10, 100), vy: Math.sin(a) * speed, gravity: blood ? 620 : 480, drag: rnd(1.2, 2.8), life: rnd(.28, .78), size: rnd(2, blood ? 7 : 5), color: blood ? pick(['#081c59', '#103597', '#174dd1', '#3e7bff', '#8fb7ff']) : pick(['#e9bf55', '#f4dda0', '#8b7652']), kind: i % 4 ? 'dot' : 'streak', spin: rnd(-8, 8) });
      }
    }
    function spawnCrowdBurst() {
      for (let i = 0; i < 28; i++) particles.spawn(VIEW.cx + rnd(-150, 150), VIEW.floor - rnd(110, 310), { vx: rnd(-420, 420), vy: rnd(-380, -80), gravity: 720, drag: 1.5, life: rnd(.45, .95), size: rnd(3, 8), color: pick(['#f4d66d', '#9277d4', '#fff5cc']), kind: i % 3 ? 'shard' : 'dot', spin: rnd(-10, 10) });
    }
    function spawnReviveLights() {
      const p = localToScreen(0, -285);
      for (let i = 0; i < 50; i++) {
        const a = i / 50 * TAU + rnd(-.1, .1), d = rnd(100, 270);
        particles.spawn(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * .6, { vx: -Math.cos(a) * d * .65, vy: -Math.sin(a) * d * .38, gravity: -16, drag: .8, life: rnd(1.4, 2.5), size: rnd(2, 6), color: pick(['#ffe986', '#fff8ce', '#f0b827']), kind: 'spark', spin: a });
      }
    }

    function showWeapon(tool, attack, x, y, hit, angle) {
      G.weapon = { tool, attack, x, y, hit, age: 0, max: tool === 'gun' ? .14 : attack === 'slash' ? .22 : .28, side: x < VIEW.cx ? -1 : 1, angle: angle || 0 };
    }

    function localToScreen(x, y) {
      const tr = bossTransform();
      const cs = Math.cos(tr.r), sn = Math.sin(tr.r), X = x * tr.s, Y = y * tr.s;
      return { x: tr.x + X * cs - Y * sn, y: tr.y + X * sn + Y * cs };
    }
    function screenToLocal(x, y) {
      const tr = bossTransform(), dx = x - tr.x, dy = y - tr.y, cs = Math.cos(-tr.r), sn = Math.sin(-tr.r);
      return { x: (dx * cs - dy * sn) / tr.s, y: (dx * sn + dy * cs) / tr.s };
    }
    function bossTransform() {
      const pose = bossPose();
      return { x: VIEW.cx + pose.x, y: VIEW.floor + pose.y, r: pose.r, s: VIEW.s, pose };
    }
    function bossPose() {
      const b = G.boss, t = G.time, active = ['fight', 'fight2', 'intro', 'submit', 'endless'].includes(G.state);
      const idle = active ? Math.sin(t * 1.7) * 2.2 : 0;
      let x = b.x, y = b.y + idle, r = b.r, fall = 0, alpha = 1, headShift = 0;
      if (G.state === 'revival') {
        if (G.stateT < 6.05) { fall = smooth(G.stateT / 1.35); r += fall * .92; x += fall * 92; y += fall * 54; }
        else { const come = smooth((G.stateT - 6.05) / .62); alpha = come; y += (1 - come) * 28; }
      } else if (G.state === 'down') {
        const q = sat(G.stateT / .58), drop = Math.sin(q * Math.PI);
        r += (G.downCount % 2 ? -.42 : .42) * drop; x += (G.downCount % 2 ? -32 : 32) * drop; y += 38 * drop;
      } else if (G.state === 'defeat' || G.state === 'ended') {
        fall = smooth(G.stateT / .95); r -= fall * 1.1; x -= fall * 96; y += fall * 64;
      }
      if (G.impact) headShift = (1 - G.impact.t / G.impact.max) * G.impact.side * -18 * G.impact.strength;
      return { x, y, r, fall, alpha, headShift, squash: PREF.deform ? b.squash : 0 };
    }

    function pointSeg(px, py, ax, ay, bx, by) {
      const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay, vv = vx * vx + vy * vy || 1;
      const q = clamp((wx * vx + wy * vy) / vv, 0, 1), dx = px - (ax + vx * q), dy = py - (ay + vy * q); return Math.hypot(dx, dy);
    }
    function ellipseHit(x, y, cx, cy, rx, ry) { const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy <= 1; }
    function locateLocal(x, y) {
      let part = null;
      if (ART.bossReady) {
        if (ellipseHit(x, y, 0, -626, 105, 38)) part = 'crown';
        else if (G.anatomy.headState !== 'gone' && G.anatomy.headState !== 'regen' && ellipseHit(x, y, 0, -568, 78, 84)) part = 'head';
        else if (ellipseHit(x, y, 0, -455, 137, 86)) part = 'chest';
        else if (ellipseHit(x, y, 0, -337, 126, 96)) part = 'belly';
        else if (!G.anatomy.missing.has('armL') && pointSeg(x, y, -117, -449, -164, -241) <= 61) part = 'armL';
        else if (!G.anatomy.missing.has('armR') && pointSeg(x, y, 117, -449, 164, -241) <= 61) part = 'armR';
        else if (!G.anatomy.missing.has('legL') && pointSeg(x, y, -58, -178, -72, -15) <= 49) part = 'legL';
        else if (!G.anatomy.missing.has('legR') && pointSeg(x, y, 58, -178, 72, -15) <= 49) part = 'legR';
      } else {
        if (ellipseHit(x, y, 0, -578, 83, 33)) part = 'crown';
        else if (ellipseHit(x, y, 0, -474, 91, 104)) part = 'head';
        else if (ellipseHit(x, y, 0, -306, 123, 111)) part = y < -305 ? 'chest' : 'belly';
        else if (pointSeg(x, y, -108, -343, -142, -171) <= 42) part = 'armL';
        else if (pointSeg(x, y, 108, -343, 142, -171) <= 42) part = 'armR';
        else if (pointSeg(x, y, -53, -145, -62, -20) <= 47) part = 'legL';
        else if (pointSeg(x, y, 53, -145, 62, -20) <= 47) part = 'legR';
      }
      return part;
    }
    function locateScreen(x, y) {
      const p = screenToLocal(x, y), part = locateLocal(p.x, p.y);
      let eyeKey = null;
      if (ART.bossReady && part === 'head') {
        if (ellipseHit(p.x, p.y, -20, -578, 17, 12)) eyeKey = 'eyeL';
        else if (ellipseHit(p.x, p.y, 20, -578, 17, 12)) eyeKey = 'eyeR';
      }
      return part ? { part, eyeKey, localX: p.x, localY: p.y, screenX: x, screenY: y } : null;
    }

    function updatePhysics(dt) {
      const b = G.boss, sub = dt > .018 ? Math.ceil(dt / .016) : 1, h = dt / sub;
      for (let i = 0; i < sub; i++) {
        b.vx += (-b.x * 135 - b.vx * 17) * h; b.x += b.vx * h;
        b.vy += (-b.y * 165 - b.vy * 20) * h; b.y += b.vy * h;
        b.vr += (-b.r * 115 - b.vr * 15) * h; b.r += b.vr * h;
        b.squashV += (-b.squash * 190 - b.squashV * 18) * h; b.squash += b.squashV * h;
      }
      b.x = clamp(b.x, -58, 58); b.y = clamp(b.y, -28, 36); b.r = clamp(b.r, -.22, .22); b.squash = clamp(b.squash, -.17, .22);
      if (G.impact) { G.impact.t += dt; if (G.impact.t >= G.impact.max) G.impact = null; }
      if (G.weapon) { G.weapon.age += dt; if (G.weapon.age >= G.weapon.max) G.weapon = null; }
      for (let i = G.trails.length - 1; i >= 0; i--) { const tr = G.trails[i]; tr.life -= dt; if (tr.life <= 0) G.trails.splice(i, 1); }
      updateAnatomy(dt);
    }

    function updateAnatomy(dt) {
      const a = G.anatomy;
      if (a.headState !== 'normal') {
        a.headT += dt;
        if (a.headState === 'breaking' && a.headT >= .18) { a.headState = 'gone'; a.headT = 0; ART.maskKey = ''; }
        else if (a.headState === 'gone' && a.headT >= .48) { a.headState = 'regen'; a.headT = 0; ART.maskKey = ''; AUDIO.revive(); }
        else if (a.headState === 'regen' && a.headT >= 1.85) {
          a.headState = 'normal'; a.headT = 0; a.headDamage = 0;
          a.eyes.eyeL = { hits: 0, state: 'in', t: 0 }; a.eyes.eyeR = { hits: 0, state: 'in', t: 0 };
          G.damage = G.damage.filter(d => d.part !== 'head'); ART.maskKey = '';
          const p = localToScreen(0, -568); effects.add('ring', p.x, p.y, { size: 70, life: .34, color: '#ffe68a' }); flash('#fff1b7', .42);
        }
      }
      stepLoose(G.detached, dt, 760);
      stepLoose(G.looseEyes, dt, 610);
    }
    function stepLoose(list, dt, gravity) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i]; p.life -= dt; if (p.life <= 0) { list.splice(i, 1); continue; }
        p.vy += gravity * dt; p.vx *= Math.exp(-.65 * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y > VIEW.h + 140) list.splice(i, 1);
      }
    }

    function updateGauge(force) {
      const f = sat(G.shown / 100), l = sat(G.lag / 100);
      $('#gaugeFill').style.transform = `scaleX(${f})`; $('#gaugeLag').style.transform = `scaleX(${l})`;
      $('#gaugePct').textContent = '';
      const pips = $$('#kdPips i'); pips.forEach((el, i) => el.classList.toggle('on', i < (G.crowdGrab ? 1 : 0) + (G.crowdWall ? 1 : 0) + (G.revivalUsed ? 1 : 0)));
      if (force) { G.shown = G.hp; G.lag = G.hp; }
    }

    function step(dt) {
      if (G.paused || G.docPaused) return;
      dt = clamp(dt, 0, .05); G.time += dt;
      if (G.hitstop > 0) { G.hitstop = Math.max(0, G.hitstop - dt); dt *= .08; }
      updateEvents(dt); pollPointers(); updatePhysics(dt); particles.step(dt); effects.step(dt);
      G.flash = Math.max(0, G.flash - dt * 3.5); G.shake *= Math.exp(-12 * dt);
      G.shown += (G.hp - G.shown) * (1 - Math.exp(-26 * dt)); G.lag += (G.hp - G.lag) * (1 - Math.exp(-3.2 * dt)); updateGauge();
      if (G.hintUntil && G.time >= G.hintUntil) { G.hintUntil = 0; $('#hint').classList.add('off'); }
      if (G.talkUntil && G.time >= G.talkUntil) { G.talkUntil = 0; $('#talk').classList.remove('on'); }
    }

    function frame(now) {
      if (!G.running) return;
      G.raf = requestAnimationFrame(frame); const dt = clamp((now - G.last) / 1000, 0, .05); G.last = now;
      step(dt); draw();
    }

    function draw() {
      const dpr = VIEW.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, VIEW.w, VIEW.h);
      const shake = PREF.shake ? G.shake : 0, sx = shake ? rnd(-shake, shake) : 0, sy = shake ? rnd(-shake * .7, shake * .7) : 0;
      ctx.save(); ctx.translate(sx, sy);
      drawBackdrop(ctx); if (!ART.courtReady) drawThrone(ctx); drawCrowdBack(ctx); drawBoss(ctx); drawDetachedParts(ctx); particles.draw(ctx); effects.draw(ctx); drawSlashTrails(ctx); drawCrowdFront(ctx); drawWeapon(ctx); drawVignette(ctx);
      ctx.restore();
      const flashEl = $('#flash'); flashEl.style.background = G.flashColor; flashEl.style.opacity = String(G.flash);
    }

    function drawBackdrop(c) {
      if (ART.courtReady) {
        const iw = ART.court.naturalWidth || ART.court.width, ih = ART.court.naturalHeight || ART.court.height;
        const cover = Math.max(VIEW.w / iw, VIEW.h / ih), sw = VIEW.w / cover, sh = VIEW.h / cover;
        const sourceX = (iw - sw) * .5, sourceY = clamp((ih - sh) * .43, 0, Math.max(0, ih - sh));
        c.drawImage(ART.court, sourceX, sourceY, sw, sh, 0, 0, VIEW.w, VIEW.h);
        const shade = c.createLinearGradient(0, 0, 0, VIEW.h); shade.addColorStop(0, 'rgba(18,12,31,.13)'); shade.addColorStop(.6, 'rgba(22,14,35,.05)'); shade.addColorStop(1, 'rgba(18,10,28,.28)'); c.fillStyle = shade; c.fillRect(0, 0, VIEW.w, VIEW.h);
        return;
      }
      const g = c.createLinearGradient(0, 0, 0, VIEW.h); g.addColorStop(0, '#6eb8dc'); g.addColorStop(.45, '#d8f1f4'); g.addColorStop(.72, '#ffe3af'); g.addColorStop(1, '#745879');
      c.fillStyle = g; c.fillRect(0, 0, VIEW.w, VIEW.h);
      const sunX = VIEW.w * .72, sunY = VIEW.h * .16, rg = c.createRadialGradient(sunX, sunY, 4, sunX, sunY, VIEW.w * .34); rg.addColorStop(0, 'rgba(255,252,201,.96)'); rg.addColorStop(.16, 'rgba(255,221,110,.5)'); rg.addColorStop(1, 'rgba(255,221,110,0)'); c.fillStyle = rg; c.fillRect(0, 0, VIEW.w, VIEW.h * .6);
      c.save(); c.globalAlpha = .38; c.fillStyle = '#fff';
      for (let row = 0; row < 3; row++) { const y = VIEW.h * (.16 + row * .18), speed = (G.time * (4 + row * 2)) % (VIEW.w + 180); for (let j = -1; j < 3; j++) cloud(c, j * (VIEW.w * .58) + speed - 180, y + Math.sin(j * 4 + row) * 15, 54 + row * 10); }
      c.restore();
      const horizon = VIEW.floor + 4; c.fillStyle = '#6b5174'; c.fillRect(0, horizon, VIEW.w, VIEW.h - horizon);
      const floor = c.createLinearGradient(0, horizon, 0, VIEW.h); floor.addColorStop(0, '#dbc79e'); floor.addColorStop(1, '#745769'); c.fillStyle = floor; c.fillRect(0, horizon - 2, VIEW.w, VIEW.h - horizon + 2);
      c.strokeStyle = 'rgba(58,39,65,.24)'; c.lineWidth = 1;
      for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(VIEW.cx + i * 34, horizon); c.lineTo(VIEW.cx + i * VIEW.w * .26, VIEW.h); c.stroke(); }
      for (let i = 0; i < 7; i++) { const p = i / 7, y = horizon + (VIEW.h - horizon) * p * p; c.beginPath(); c.moveTo(0, y); c.lineTo(VIEW.w, y); c.stroke(); }
      drawPalaceEdges(c, horizon);
    }
    function cloud(c, x, y, r) { c.beginPath(); c.arc(x, y, r * .46, 0, TAU); c.arc(x + r * .45, y - r * .15, r * .62, 0, TAU); c.arc(x + r, y, r * .48, 0, TAU); c.ellipse(x + r * .5, y + r * .12, r * 1.05, r * .42, 0, 0, TAU); c.fill(); }
    function drawPalaceEdges(c, horizon) {
      c.save(); c.fillStyle = '#3b2c58'; c.strokeStyle = '#d7a938'; c.lineWidth = 3;
      const pw = Math.max(38, VIEW.w * .105);
      for (const side of [-1, 1]) {
        const x = side < 0 ? 0 : VIEW.w - pw;
        c.fillRect(x, VIEW.h * .12, pw, horizon - VIEW.h * .12); c.strokeRect(x + (side < 0 ? -3 : 3), VIEW.h * .12, pw, horizon - VIEW.h * .12);
        c.fillStyle = '#e0b640'; c.fillRect(x, VIEW.h * .22, pw, 10); c.fillRect(x, VIEW.h * .53, pw, 10); c.fillStyle = '#3b2c58';
      }
      c.restore();
    }

    function drawThrone(c) {
      const s = VIEW.s, x = VIEW.cx, y = VIEW.floor;
      c.save(); c.translate(x, y); c.scale(s, s);
      c.fillStyle = 'rgba(33,20,48,.22)'; c.beginPath(); c.ellipse(0, 9, 170, 32, 0, 0, TAU); c.fill();
      c.fillStyle = '#42286d'; c.strokeStyle = '#21192f'; c.lineWidth = 7; roundRect(c, -142, -420, 284, 405, 31); c.fill(); c.stroke();
      c.fillStyle = '#6c49a5'; roundRect(c, -115, -392, 230, 341, 20); c.fill();
      c.strokeStyle = '#e5b73f'; c.lineWidth = 8; c.beginPath(); c.moveTo(-111, -354); c.quadraticCurveTo(0, -440, 111, -354); c.stroke();
      c.fillStyle = '#e5b73f'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 40, -392 + Math.abs(i) * 8, 8, 0, TAU); c.fill(); }
      c.fillStyle = '#332047'; roundRect(c, -171, -42, 342, 45, 12); c.fill();
      c.restore();
    }

    function drawBoss(c) {
      const tr = bossTransform(), pose = tr.pose;
      c.save(); c.globalAlpha = pose.alpha; c.translate(tr.x, tr.y); c.scale(tr.s, tr.s); c.rotate(tr.r);
      c.fillStyle = 'rgba(25,14,34,.32)'; c.beginPath(); c.ellipse(0, 8, 138, 25, 0, 0, TAU); c.fill();
      if (ART.bossReady) drawBossAsset(c, pose);
      else { drawLeg(c, -1); drawLeg(c, 1); drawRobe(c); drawArm(c, -1); drawArm(c, 1); drawHead(c, pose); drawDamage(c, 'body', pose); }
      c.restore();
    }

    const BOSS_ART = { x: -220, y: -650, w: 440, h: 660 };
    function drawBossAsset(c, pose) {
      const buffer = ART.bossBuffer, b = ART.bossBufferCtx;
      const anatomy = G.anatomy, hideHead = anatomy.headState === 'gone' || anatomy.headState === 'regen' || anatomy.headState === 'breaking' && anatomy.headT > .15;
      const maskKey = (hideHead ? 'h|' : 'n|') + Array.from(anatomy.missing).sort().join(',');
      if (ART.maskKey !== maskKey) {
        ART.maskKey = maskKey;
        b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.clearRect(0, 0, buffer.width, buffer.height);
        b.drawImage(ART.boss, 0, 0, buffer.width, buffer.height);
        if (hideHead || anatomy.missing.size) {
          b.globalCompositeOperation = 'destination-out'; b.fillStyle = '#000';
          if (hideHead) { b.beginPath(); b.ellipse(256, 103, 132, 126, 0, 0, TAU); b.fill(); }
          for (const part of anatomy.missing) maskAssetPart(b, part);
          b.globalCompositeOperation = 'source-over';
        }
      }
      c.save();
      const sq = pose.squash || 0; c.translate(0, sq * 18); c.transform(1 + sq * .23, 0, -sq * .08, 1 - sq * .14, 0, 0);
      if (anatomy.headState === 'breaking') {
        const k = sat(anatomy.headT / .18); c.translate(rnd(-7, 7) * k, 0); c.transform(1 + k * .08, 0, -k * .06, 1 - k * .1, 0, 0);
      }
      c.drawImage(buffer, BOSS_ART.x, BOSS_ART.y, BOSS_ART.w, BOSS_ART.h);
      c.restore();
      if (anatomy.headState === 'regen') drawRegrowingHead(c, anatomy.headT);
      drawDamage(c, 'body'); if (!hideHead) drawDamage(c, 'head'); drawAnatomyOverlays(c);
    }
    function maskAssetPart(b, part) {
      b.beginPath();
      if (part === 'armL') { b.moveTo(0, 235); b.lineTo(150, 240); b.lineTo(185, 465); b.lineTo(104, 608); b.lineTo(0, 612); }
      else if (part === 'armR') { b.moveTo(512, 235); b.lineTo(362, 240); b.lineTo(327, 465); b.lineTo(408, 608); b.lineTo(512, 612); }
      else if (part === 'legL') { b.moveTo(74, 572); b.lineTo(242, 560); b.lineTo(232, 768); b.lineTo(72, 768); }
      else if (part === 'legR') { b.moveTo(438, 572); b.lineTo(270, 560); b.lineTo(280, 768); b.lineTo(440, 768); }
      else return;
      b.closePath(); b.fill();
    }
    function drawRegrowingHead(c, time) {
      const t = clamp(time, 0, 1.85), grow = smooth((t - .32) / 1.06), reveal = smooth((t - 1.35) / .48);
      c.save(); c.translate(0, -568); c.globalAlpha = 1 - reveal * .35;
      c.fillStyle = '#182340'; c.strokeStyle = '#07132e'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 6, 28 + grow * 30, 10 + grow * 72, 0, 0, TAU); c.fill(); c.stroke();
      if (t > 1.02) { const jaw = smooth((t - 1.02) / .35); c.fillStyle = '#607658'; c.beginPath(); c.moveTo(-48 * jaw, -26); c.quadraticCurveTo(0, 30, 64 * jaw, -18); c.quadraticCurveTo(26, -68, 0, -75); c.quadraticCurveTo(-28, -66, -48 * jaw, -26); c.fill(); c.stroke(); }
      if (t > 1.36) { c.fillStyle = '#dbe8a6'; for (const side of [-1, 1]) { c.beginPath(); c.ellipse(side * 23, -49, 9, 6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#171020'; c.fillRect(side * 23 - 1.5, -55, 3, 12); c.fillStyle = '#dbe8a6'; } }
      if (t > 1.6 && t < 1.78) { c.strokeStyle = '#cf426d'; c.lineWidth = 4; c.beginPath(); c.moveTo(20, -4); c.quadraticCurveTo(55, 5, 73, -10); c.stroke(); }
      c.restore();
      if (reveal > 0 && ART.bossReady) {
        c.save(); c.globalAlpha = reveal; c.globalCompositeOperation = 'screen'; c.filter = `brightness(${1.75 - reveal * .75}) sepia(${1 - reveal}) saturate(1.5)`;
        c.drawImage(ART.boss, 0, 0, 1024, 390, BOSS_ART.x, BOSS_ART.y, BOSS_ART.w, BOSS_ART.h * 390 / 1536); c.restore();
      }
    }

    function drawAnatomyOverlays(c) {
      const a = G.anatomy;
      if (a.headState === 'normal' || a.headState === 'breaking') {
        for (const side of [-1, 1]) {
          const key = side < 0 ? 'eyeL' : 'eyeR'; if (a.eyes[key].state !== 'gone') continue;
          c.save(); c.translate(side * 20, -578); c.rotate(side * .08);
          c.fillStyle = '#071829'; c.strokeStyle = '#3e7bff'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 13, 8, 0, 0, TAU); c.fill(); c.stroke();
          c.fillStyle = 'rgba(5,42,72,.8)'; c.beginPath(); c.ellipse(0, 3, 6, 3, 0, 0, TAU); c.fill(); c.restore();
        }
      }
      if (a.bellyStage) drawBellyOpening(c, a.bellyStage);
      if (a.headState === 'gone') {
        c.save(); c.translate(0, -492); c.fillStyle = '#071729'; c.strokeStyle = '#3e7bff'; c.lineWidth = 5;
        c.beginPath(); c.ellipse(0, 0, 55, 17, 0, 0, TAU); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(39,179,200,.78)'; c.lineWidth = 4;
        for (const side of [-1, 1]) { c.beginPath(); c.moveTo(side * 17, -3); c.quadraticCurveTo(side * 28, -38, side * (20 + Math.sin(G.time * 10) * 5), -61); c.stroke(); }
        c.restore();
      }
      for (const part of a.missing) drawLimbStump(c, part);
    }

    function drawBellyOpening(c, stage) {
      const cuts = stage === 3 ? 3 : stage === 5 ? 5 : 7;
      c.save(); c.translate(0, -329); c.lineCap = 'round';
      if (stage >= 7) {
        const pulse = 1 + Math.sin(G.time * 4.3) * .035;
        c.save(); c.scale(pulse, 1 / pulse); c.fillStyle = '#061522'; c.strokeStyle = '#3e7bff'; c.lineWidth = 5;
        c.beginPath(); c.ellipse(0, 2, 57, 45, -.08, 0, TAU); c.fill(); c.stroke();
        c.strokeStyle = '#174dd1'; c.lineWidth = 8;
        c.beginPath(); c.arc(-12, 2, 22, -.4, Math.PI * 1.35); c.arc(15, 5, 20, Math.PI * .55, Math.PI * 2.1); c.stroke();
        c.strokeStyle = '#8fb7ff'; c.lineWidth = 2; c.stroke(); c.restore();
      }
      c.strokeStyle = '#071a2b'; c.lineWidth = 6;
      for (let i = 0; i < cuts; i++) {
        const y = -27 + i * 9, len = stage >= 7 ? 49 : 28 + i * 3;
        c.beginPath(); c.moveTo(-len, y + (i % 2 ? 3 : 0)); c.quadraticCurveTo(0, y + 7, len, y - 2); c.stroke();
      }
      c.strokeStyle = '#8fb7ff'; c.lineWidth = 2;
      for (let i = 0; i < cuts; i++) { const y = -27 + i * 9; c.beginPath(); c.moveTo(-30, y); c.quadraticCurveTo(0, y + 5, 30, y - 1); c.stroke(); }
      if (PREF.blood) { c.strokeStyle = 'rgba(19,126,157,.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(29, 21); c.quadraticCurveTo(23, 51, 28, 73); c.stroke(); }
      c.restore();
    }

    function drawLimbStump(c, part) {
      const points = { armL: [-126, -433, -.35], armR: [126, -433, .35], legL: [-60, -158, 0], legR: [60, -158, 0] };
      const p = points[part]; if (!p) return;
      c.save(); c.translate(p[0], p[1]); c.rotate(p[2]); c.fillStyle = '#071827'; c.strokeStyle = '#3e7bff'; c.lineWidth = 4;
      c.beginPath(); c.ellipse(0, 0, part.indexOf('arm') === 0 ? 35 : 31, 17, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#176b87'; for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * 12, 0, 5, 0, TAU); c.fill(); } c.restore();
    }

    function drawDetachedParts(c) {
      for (const p of G.detached) {
        const alpha = sat(p.life / .45); c.save(); c.globalAlpha = alpha; c.translate(p.x, p.y); c.rotate(p.r);
        const arm = p.part.indexOf('arm') === 0, side = /L$/.test(p.part) ? -1 : 1; c.scale(side, 1);
        c.fillStyle = '#eee5d7'; c.strokeStyle = '#171526'; c.lineWidth = 5;
        c.beginPath(); c.moveTo(-13, -17); c.quadraticCurveTo(arm ? 30 : 20, -28, arm ? 62 : 37, -6); c.lineTo(arm ? 58 : 31, 19); c.quadraticCurveTo(23, 29, -15, 14); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#6f7465'; c.beginPath(); c.ellipse(arm ? 61 : 35, 5, arm ? 18 : 15, arm ? 23 : 18, .2, 0, TAU); c.fill(); c.stroke();
        c.strokeStyle = '#d1b46c'; c.lineWidth = 4; c.beginPath(); c.moveTo(-4, -12); c.lineTo(44, 13); c.stroke(); c.restore();
      }
      for (const p of G.looseEyes) {
        c.save(); c.globalAlpha = sat(p.life / .35); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = '#dce9a7'; c.strokeStyle = '#101522'; c.lineWidth = 3;
        c.beginPath(); c.ellipse(0, 0, 9, 6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#101522'; c.fillRect(-1.5, -6, 3, 12);
        c.strokeStyle = '#2daec2'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, 1); c.quadraticCurveTo(-20, 8, -27, 18); c.stroke(); c.restore();
      }
    }

    function drawLeg(c, side) {
      const hurt = G.phase >= 4 ? (side < 0 ? -7 : 8) : 0;
      c.save(); c.translate(side * 56, -125); c.rotate(side * (.04 + hurt * .005));
      c.fillStyle = '#281b3d'; c.strokeStyle = '#171020'; c.lineWidth = 5; roundRect(c, -38, -34, 76, 148, 33); c.fill(); c.stroke();
      c.fillStyle = '#15121b'; roundRect(c, side < 0 ? -54 : -42, 77, 96, 42, 15); c.fill(); c.stroke();
      c.strokeStyle = '#d8ae3e'; c.lineWidth = 4; c.beginPath(); c.moveTo(-27, 17); c.lineTo(27, 17); c.stroke();
      c.restore();
    }

    function robePath(c) { c.beginPath(); c.moveTo(-96, -386); c.quadraticCurveTo(-145, -348, -137, -255); c.lineTo(-155, -95); c.quadraticCurveTo(-96, -57, 0, -48); c.quadraticCurveTo(96, -57, 155, -95); c.lineTo(137, -255); c.quadraticCurveTo(145, -348, 96, -386); c.quadraticCurveTo(0, -420, -96, -386); c.closePath(); }
    function drawRobe(c) {
      const sq = G.boss.squash;
      c.save(); c.translate(0, sq * 22); c.scale(1 + sq * .35, 1 - sq * .22);
      robePath(c); const rg = c.createLinearGradient(-145, -380, 140, -80); rg.addColorStop(0, '#382063'); rg.addColorStop(.48, '#6843a0'); rg.addColorStop(1, '#2a194b'); c.fillStyle = rg; c.strokeStyle = '#21152d'; c.lineWidth = 7; c.fill(); c.stroke();
      c.save(); robePath(c); c.clip(); c.globalAlpha = .26; c.strokeStyle = '#f4d66a'; c.lineWidth = 2;
      for (let y = -370; y < -70; y += 34) for (let x = -140; x < 140; x += 34) { c.beginPath(); c.arc(x + ((y / 34) & 1 ? 17 : 0), y, 8, 0, TAU); c.stroke(); }
      c.restore();
      c.fillStyle = '#e3b743'; c.strokeStyle = '#21152d'; c.lineWidth = 5; roundRect(c, -112, -242, 224, 35, 12); c.fill(); c.stroke();
      c.fillStyle = '#9d2e39'; c.beginPath(); c.moveTo(-24, -232); c.lineTo(24, -232); c.lineTo(18, -142); c.lineTo(0, -119); c.lineTo(-18, -142); c.closePath(); c.fill(); c.stroke();
      drawRobeTears(c);
      c.restore();
    }
    function drawRobeTears(c) {
      const tears = [];
      if (G.phase >= 2) tears.push([-63, -310, 32, 22, -.35]);
      if (G.phase >= 3) tears.push([58, -276, 40, 27, .5], [-16, -170, 34, 22, -.12]);
      if (G.phase >= 4) tears.push([-84, -178, 34, 25, .2], [78, -143, 28, 20, -.7]);
      for (const t of tears) {
        c.save(); c.translate(t[0], t[1]); c.rotate(t[4]); c.fillStyle = '#304f23'; c.strokeStyle = '#180f26'; c.lineWidth = 5;
        c.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = i % 2 ? 1 : .73; c.lineTo(Math.cos(a) * t[2] * r, Math.sin(a) * t[3] * r); } c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = '#9bc754'; c.lineWidth = 2; for (let y = -t[3]; y < t[3]; y += 9) { c.beginPath(); c.arc(-8, y, 10, 0, Math.PI); c.arc(9, y, 10, 0, Math.PI); c.stroke(); }
        c.restore();
      }
    }

    function drawArm(c, side) {
      const flinch = G.impact && (G.impact.part === (side < 0 ? 'armL' : 'armR')) ? (1 - G.impact.t / G.impact.max) * .22 : 0;
      c.save(); c.translate(side * 108, -344); c.rotate(side * (-.12 - flinch));
      c.strokeStyle = '#21152d'; c.lineWidth = 76; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(side * 34, 74, side * 31, 170); c.stroke();
      c.strokeStyle = '#563687'; c.lineWidth = 65; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(side * 34, 74, side * 31, 170); c.stroke();
      c.strokeStyle = '#e0b340'; c.lineWidth = 7; c.beginPath(); c.moveTo(side * 12, 28); c.quadraticCurveTo(side * 32, 77, side * 28, 126); c.stroke();
      c.translate(side * 31, 171); c.fillStyle = '#e7a879'; c.strokeStyle = '#21152d'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, 34, 41, side * .18, 0, TAU); c.fill(); c.stroke();
      c.restore();
    }

    function drawHead(c, pose) {
      const impact = G.impact && G.impact.part === 'head' ? G.impact : null;
      const k = impact ? 1 - impact.t / impact.max : 0, dx = pose.headShift, tilt = impact ? -impact.side * .12 * k : Math.sin(G.time * 1.3) * .012;
      c.save(); c.translate(dx, -476); c.rotate(tilt); c.scale(1 + Math.abs(k) * .12 * (PREF.deform ? 1 : 0), 1 - Math.abs(k) * .08 * (PREF.deform ? 1 : 0));
      c.fillStyle = '#e8aa7d'; c.strokeStyle = '#21152d'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 88, 99, 0, 0, TAU); c.fill(); c.stroke();
      if (G.phase >= 3) drawScalePatch(c, 44, -22, 31, 37);
      drawEars(c); drawFace(c, k, impact); drawBeard(c); drawHeadDamage(c);
      c.restore();
      drawCrown(c, dx, tilt);
    }
    function drawEars(c) { c.fillStyle = '#dc966e'; c.strokeStyle = '#21152d'; c.lineWidth = 5; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 87, 5, 16, 25, 0, 0, TAU); c.fill(); c.stroke(); } }
    function drawFace(c, hitK, impact) {
      const hurt = G.phase, blink = hitK > .15 || (Math.sin(G.time * .73) > .992);
      c.strokeStyle = '#21152d'; c.lineCap = 'round';
      c.lineWidth = 8; c.beginPath(); c.moveTo(-57, -35 + hurt * 2); c.quadraticCurveTo(-34, -49 + hurt * 4, -10, -35); c.moveTo(10, -35); c.quadraticCurveTo(35, -50 + hurt, 58, -32 + hurt * 2); c.stroke();
      if (blink) { c.lineWidth = 5; c.beginPath(); c.moveTo(-52, -8); c.quadraticCurveTo(-33, -1, -14, -9); c.moveTo(14, -9); c.quadraticCurveTo(33, -2, 52, -8); c.stroke(); }
      else {
        for (const s of [-1, 1]) { c.fillStyle = '#fff9ec'; c.strokeStyle = '#21152d'; c.lineWidth = 4; c.beginPath(); c.ellipse(s * 33, -9, 19, 15 - hurt * .8, s * .05, 0, TAU); c.fill(); c.stroke(); c.fillStyle = hurt >= 3 ? '#a8c942' : '#5b3d91'; c.beginPath(); c.arc(s * 31 + (impact ? -impact.side * 4 : 0), -7, 8, 0, TAU); c.fill(); c.fillStyle = '#171020'; c.beginPath(); c.arc(s * 31, -7, 4, 0, TAU); c.fill(); }
      }
      c.fillStyle = '#d28a63'; c.strokeStyle = '#21152d'; c.lineWidth = 4; c.beginPath(); c.moveTo(-8, -3); c.quadraticCurveTo(-18, 25, 0, 31); c.quadraticCurveTo(18, 26, 8, -2); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#742a34'; c.lineWidth = 5; c.beginPath();
      if (G.state === 'submit' || (G.phase === 0 && !impact)) c.arc(0, 38, 30, .12, Math.PI - .12);
      else if (hurt >= 3) c.arc(0, 64, 25, Math.PI + .15, TAU - .15);
      else { c.moveTo(-27, 48); c.quadraticCurveTo(0, 39 + hurt * 4, 27, 48); }
      c.stroke();
      if (hurt >= 2) { c.fillStyle = 'rgba(58,38,92,.28)'; c.beginPath(); c.ellipse(-41, 17, 23, 14, -.2, 0, TAU); c.fill(); }
    }
    function drawBeard(c) {
      c.fillStyle = '#f5f1ef'; c.strokeStyle = '#21152d'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(-72, 43); c.quadraticCurveTo(-64, 112, -28, 142); c.lineTo(-6, 125); c.lineTo(9, 154); c.lineTo(24, 124); c.lineTo(43, 136); c.quadraticCurveTo(72, 97, 72, 43); c.quadraticCurveTo(42, 73, 0, 62); c.quadraticCurveTo(-42, 73, -72, 43); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#c9c1d4'; c.lineWidth = 3; c.beginPath(); c.moveTo(-42, 72); c.quadraticCurveTo(-31, 105, -19, 124); c.moveTo(-10, 76); c.quadraticCurveTo(-2, 113, 5, 140); c.moveTo(26, 75); c.quadraticCurveTo(30, 105, 24, 126); c.stroke();
      c.fillStyle = '#f7f3f0'; c.strokeStyle = '#21152d'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 44); c.quadraticCurveTo(-27, 25, -66, 45); c.quadraticCurveTo(-41, 72, 0, 50); c.quadraticCurveTo(41, 72, 66, 45); c.quadraticCurveTo(27, 25, 0, 44); c.closePath(); c.fill(); c.stroke();
    }
    function drawCrown(c, dx, tilt) {
      c.save(); c.translate(dx, -562); c.rotate(tilt); c.fillStyle = '#281a46'; c.strokeStyle = '#21152d'; c.lineWidth = 6;
      c.beginPath(); c.moveTo(-61, 8); c.lineTo(-48, -48); c.lineTo(-18, -29); c.lineTo(0, -67); c.lineTo(20, -28); c.lineTo(50, -50); c.lineTo(64, 9); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#e3b43b'; c.lineWidth = 7; c.beginPath(); c.moveTo(-54, 1); c.lineTo(55, 1); c.stroke();
      c.fillStyle = '#f2d15f'; for (const p of [[-45,-38], [0,-57], [47,-40]]) { c.beginPath(); c.arc(p[0], p[1], 7, 0, TAU); c.fill(); }
      c.restore();
      c.save(); c.translate(dx, -607); c.rotate(tilt); c.strokeStyle = `rgba(242,193,61,${G.phase >= 3 ? .25 : .68})`; c.lineWidth = 7; c.beginPath(); c.ellipse(0, 0, 92, 23, 0, 0, TAU); c.stroke(); c.restore();
    }
    function drawScalePatch(c, x, y, w, h) {
      c.save(); c.beginPath(); c.ellipse(x, y, w, h, .25, 0, TAU); c.clip(); c.fillStyle = '#3f6324'; c.fillRect(x - w, y - h, w * 2, h * 2); c.strokeStyle = '#b3d85b'; c.lineWidth = 2;
      for (let yy = y - h; yy < y + h; yy += 9) for (let xx = x - w; xx < x + w; xx += 13) { c.beginPath(); c.arc(xx + (((yy / 9) | 0) & 1 ? 6 : 0), yy, 7, 0, Math.PI); c.stroke(); }
      c.restore();
    }

    function damageGroup(mark) { return mark.part === 'head' ? 'head' : 'body'; }
    function drawDamage(c, group) {
      for (const d of G.damage) if (damageGroup(d) === group && !G.anatomy.missing.has(d.part)) drawDamageMark(c, d);
    }
    function drawHeadDamage(c) {
      for (const d of G.damage) if (damageGroup(d) === 'head') drawDamageMark(c, Object.assign({}, d, { x: d.x, y: d.y + 476 }));
    }
    function drawDamageMark(c, d) {
      c.save(); c.translate(d.x, d.y); c.rotate(d.angle);
      if (d.kind === 'bruise') {
        const rg = c.createRadialGradient(-d.size * .2, -d.size * .2, 1, 0, 0, d.size); rg.addColorStop(0, 'rgba(75,36,92,.5)'); rg.addColorStop(.58, 'rgba(38,82,120,.31)'); rg.addColorStop(1, 'rgba(42,40,80,0)'); c.fillStyle = rg; c.beginPath(); c.ellipse(0, 0, d.size * 1.25, d.size * .72, 0, 0, TAU); c.fill();
      } else if (d.kind === 'cut') {
        c.strokeStyle = '#081c59'; c.lineWidth = Math.max(3, d.size * .32); c.lineCap = 'round'; c.beginPath(); c.moveTo(-d.size * 1.5, 0); c.quadraticCurveTo(0, d.size * .28, d.size * 1.5, -d.size * .12); c.stroke();
        c.strokeStyle = '#3e7bff'; c.lineWidth = Math.max(1.5, d.size * .12); c.stroke();
        if (PREF.blood) { c.strokeStyle = 'rgba(23,77,209,.82)'; c.lineWidth = 3; c.beginPath(); c.moveTo(d.size * .3, 2); c.quadraticCurveTo(d.size * .15, d.drip * .65, d.size * .1, d.drip); c.stroke(); }
      } else {
        c.fillStyle = '#08152f'; c.beginPath(); c.arc(0, 0, d.size, 0, TAU); c.fill(); c.strokeStyle = '#8fb7ff'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, d.size * 1.45, d.seed * TAU, d.seed * TAU + Math.PI * 1.35); c.stroke();
        if (PREF.blood) { c.strokeStyle = 'rgba(16,53,151,.86)'; c.lineWidth = 3; c.beginPath(); c.moveTo(1, d.size); c.quadraticCurveTo(-3, d.drip * .6, 2, d.drip); c.stroke(); }
      }
      c.restore();
    }

    const CROWD_CELL = 512;
    const CROWD_POSES = {
      run: [0, 0], grab: [1, 0], block: [2, 0], point: [3, 0],
      wail: [0, 1], kneel: [0, 1], pray: [1, 1], stamp: [2, 1], cheer: [3, 1]
    };
    function drawCrowdSprite(c, x, y, scale, pose, alpha) {
      const cell = CROWD_POSES[pose];
      if (!ART.crowdReady || !cell) return false;
      const inward = x < VIEW.cx ? 1 : -1;
      const kneeling = ['kneel', 'pray', 'wail', 'stamp', 'cheer'].includes(pose);
      const baseSize = pose === 'run' || pose === 'grab' ? 440 : kneeling ? 365 : 400;
      const size = baseSize * scale, bottom = (kneeling ? 5 : 10) * scale;
      c.save();
      c.globalAlpha *= alpha == null ? 1 : alpha;
      c.translate(x, y);
      c.scale(inward, 1);
      c.drawImage(ART.crowd, cell[0] * CROWD_CELL, cell[1] * CROWD_CELL, CROWD_CELL, CROWD_CELL, -size * .5, bottom - size, size, size);
      c.restore();
      return true;
    }
    function drawCrowdFigure(c, x, y, scale, pose, alpha) {
      if (drawCrowdSprite(c, x, y, scale, pose, alpha)) return;
      const inward = x < VIEW.cx ? 1 : -1;
      c.save(); c.globalAlpha *= alpha == null ? 1 : alpha; c.translate(x, y); c.scale(scale, scale);
      const kneeling = ['kneel', 'pray', 'wail', 'stamp'].includes(pose), lean = pose === 'run' ? inward * -.17 : pose === 'wail' ? inward * .08 : 0;
      c.rotate(lean); c.fillStyle = '#312245'; c.strokeStyle = '#171020'; c.lineWidth = 5;
      c.beginPath(); c.ellipse(0, -126, 34, 39, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#b98c72'; c.beginPath(); c.ellipse(0, -126, 26, 30, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#584083'; roundRect(c, -37, -95, 74, kneeling ? 80 : 112, 25); c.fill(); c.stroke();
      c.strokeStyle = '#d9ad3f'; c.lineWidth = 4; c.beginPath(); c.moveTo(-31, -73); c.lineTo(31, -73); c.stroke();
      c.strokeStyle = '#21152d'; c.lineWidth = 17; c.lineCap = 'round'; c.beginPath();
      if (pose === 'block') { c.moveTo(-25, -76); c.lineTo(-62, -73); c.moveTo(25, -76); c.lineTo(62, -73); }
      else if (pose === 'point') { c.moveTo(-25, -76); c.lineTo(-48, -44); c.moveTo(25, -76); c.lineTo(inward * 78, -24); }
      else if (pose === 'wail') { c.moveTo(-25, -76); c.lineTo(inward * 9, -132); c.moveTo(25, -76); c.lineTo(46, -35); }
      else if (pose === 'pray' || pose === 'stamp') { c.moveTo(-25, -76); c.lineTo(-8, -83); c.moveTo(25, -76); c.lineTo(8, pose === 'stamp' ? -56 : -83); }
      else if (pose === 'cheer') { c.moveTo(-25, -76); c.lineTo(-47, -137); c.moveTo(25, -76); c.lineTo(47, -137); }
      else if (pose === 'run') { c.moveTo(-25, -76); c.lineTo(-52, -42); c.moveTo(25, -76); c.lineTo(49, -108); }
      else { c.moveTo(-25, -76); c.lineTo(-47, -118); c.moveTo(25, -76); c.lineTo(47, -118); }
      c.stroke();
      c.strokeStyle = '#171020'; c.lineWidth = 20; c.beginPath();
      if (kneeling) { c.moveTo(-18, -18); c.lineTo(-48, 13); c.moveTo(18, -18); c.lineTo(48, 13); }
      else { c.moveTo(-18, 3); c.lineTo(-25, 59); c.moveTo(18, 3); c.lineTo(25, 59); }
      c.stroke();
      c.fillStyle = '#21152d'; c.beginPath(); c.arc(-10, -129, 3, 0, TAU); c.arc(10, -129, 3, 0, TAU); c.fill();
      if (pose === 'stamp' || pose === 'cheer') {
        c.save(); c.translate(pose === 'cheer' ? 0 : -24, pose === 'cheer' ? -162 : -74); c.rotate(inward * .08);
        c.fillStyle = '#efe4bf'; c.strokeStyle = '#21152d'; c.lineWidth = 3; c.fillRect(-19, -13, 38, 27); c.strokeRect(-19, -13, 38, 27);
        if (pose === 'stamp') { c.fillStyle = '#b32934'; c.fillRect(1, -1, 12, 10); }
        c.restore();
      }
      c.restore();
    }
    function drawCrowdBack(c) {
      if (G.state !== 'revival') return;
      const y = VIEW.floor + 9, s = VIEW.s * .72, enter = out3(G.stateT / .82);
      for (let i = 0; i < 6; i++) {
        const side = i < 3 ? -1 : 1, rank = i % 3, x = VIEW.cx + side * (94 + rank * 54) * VIEW.s;
        let pose = 'run';
        if (G.stateT >= .82 && G.stateT < 5.05) pose = ['wail', 'pray', 'kneel'][i % 3];
        else if (G.stateT >= 5.05 && G.stateT < 5.88) pose = G.stateT >= 5.05 + i * .1 && G.stateT < 5.48 + i * .1 ? 'stamp' : 'pray';
        else if (G.stateT >= 5.88 && G.stateT < 6.42) pose = 'pray';
        else if (G.stateT >= 6.42) pose = 'cheer';
        drawCrowdFigure(c, x, y + rank * 4, s * (1 - rank * .055), pose, enter);
      }
    }
    function drawCrowdFront(c) {
      if (G.state === 'crowd_grab') {
        const p = G.stateT < .28 ? out3(G.stateT / .28) : G.stateT > 1.25 ? 1 - smooth((G.stateT - 1.25) / .5) : 1;
        drawGrabScene(c, -1, p); drawGrabScene(c, 1, p);
      } else if (G.state === 'crowd_wall') {
        const p = out3(G.stateT / .42), leave = G.stateT > 1.38 ? smooth((G.stateT - 1.38) / .72) : 0;
        const y = VIEW.floor + 12, s = VIEW.s * .92;
        for (let i = 0; i < 4; i++) {
          const side = i < 2 ? -1 : 1, x = VIEW.cx + (i - 1.5) * 92 * VIEW.s + side * leave * VIEW.w * .42;
          drawCrowdFigure(c, x, y + Math.abs(i - 1.5) * 6, s, i === 0 ? 'point' : 'block', p * (1 - leave * .35));
        }
      }
    }
    function drawGrabScene(c, side, p) {
      const wristX = VIEW.cx + side * Math.min(VIEW.w * .22, 104), wristY = Math.min(VIEW.floor - 64, VIEW.h * .7);
      const figureX = wristX + side * Math.min(VIEW.w * .18, 138 * VIEW.s);
      const actorX = lerp(side < 0 ? -70 : VIEW.w + 70, figureX, p), spritePose = G.stateT < .48 ? 'run' : 'grab';
      if (!ART.crowdReady) drawCrowdFigure(c, actorX, VIEW.floor + 8, VIEW.s * .78, 'block', p);
      c.save(); c.globalAlpha = p; c.lineCap = 'round';
      c.strokeStyle = '#181224'; c.lineWidth = 52 * VIEW.s; c.beginPath(); c.moveTo(VIEW.cx + side * 35, VIEW.h + 24); c.quadraticCurveTo(VIEW.cx + side * 62, VIEW.h * .82, wristX, wristY); c.stroke();
      c.strokeStyle = '#274a79'; c.lineWidth = 43 * VIEW.s; c.stroke();
      c.fillStyle = '#d39a76'; c.strokeStyle = '#181224'; c.lineWidth = 4; c.beginPath(); c.ellipse(wristX, wristY, 24 * VIEW.s, 30 * VIEW.s, side * .22, 0, TAU); c.fill(); c.stroke();
      if (!ART.crowdReady) {
        const handStartX = lerp(side < 0 ? -20 : VIEW.w + 20, figureX - side * 7, p), handStartY = VIEW.floor - 71 * VIEW.s;
        c.strokeStyle = '#21152d'; c.lineWidth = 17 * VIEW.s; c.beginPath(); c.moveTo(handStartX, handStartY); c.quadraticCurveTo(lerp(handStartX, wristX, .55), wristY - 18, wristX - side * 5, wristY); c.stroke();
        c.strokeStyle = '#6b4b91'; c.lineWidth = 12 * VIEW.s; c.stroke();
        c.fillStyle = '#c89472'; c.strokeStyle = '#181224'; c.lineWidth = 3; c.beginPath(); c.ellipse(wristX - side * 5, wristY, 15 * VIEW.s, 18 * VIEW.s, side * .35, 0, TAU); c.fill(); c.stroke();
      }
      c.restore();
      if (ART.crowdReady) drawCrowdFigure(c, actorX, VIEW.floor + 8, VIEW.s * .88, spritePose, p);
    }

    function drawSlashTrails(c) {
      for (const tr of G.trails) {
        const a = sat(tr.life / tr.max); c.save(); c.globalAlpha = a; c.strokeStyle = '#effcff'; c.lineWidth = 10 * a + 2; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = '#35b9d6'; c.shadowBlur = 14;
        c.beginPath(); c.moveTo(tr.x1, tr.y1); c.lineTo(tr.x2, tr.y2); c.stroke(); c.restore();
      }
    }
    function drawWeapon(c) {
      const w = G.weapon; if (!w) return;
      const p = sat(w.age / w.max), reach = 1 - out3(p), side = w.side;
      if (w.tool === 'hand') drawFist(c, w, reach, side);
      else if (w.tool === 'knife') drawKnife(c, w, reach, side);
      else drawGun(c, w, p, side);
    }
    function drawFist(c, w, reach, side) {
      const startX = side < 0 ? 38 : VIEW.w - 38, startY = VIEW.h + 42; const x = lerp(startX, w.x, reach), y = lerp(startY, w.y, reach);
      c.save(); c.translate(x, y); c.rotate(side * -.25 + (1 - reach) * side * .2); c.scale(VIEW.s, VIEW.s);
      c.strokeStyle = '#21152d'; c.lineWidth = 58; c.lineCap = 'round'; c.beginPath(); c.moveTo(side * 8, 130); c.lineTo(0, 38); c.stroke();
      c.strokeStyle = '#e9a474'; c.lineWidth = 48; c.stroke();
      c.fillStyle = '#eda979'; c.strokeStyle = '#21152d'; c.lineWidth = 5; roundRect(c, -42, -26, 84, 72, 22); c.fill(); c.stroke();
      c.fillStyle = '#d98c64'; for (let i = 0; i < 4; i++) { roundRect(c, -37 + i * 19, -31, 18, 34, 8); c.fill(); c.stroke(); }
      c.fillStyle = '#fff6df'; c.fillRect(-41, 27, 82, 13); c.strokeRect(-41, 27, 82, 13); c.restore();
    }
    function drawKnife(c, w, reach, side) {
      const startX = side < 0 ? 16 : VIEW.w - 16, startY = VIEW.h + 30, x = lerp(startX, w.x, reach), y = lerp(startY, w.y, reach);
      c.save(); c.translate(x, y); c.rotate((w.attack === 'slash' ? w.angle : -1.0) + Math.PI * .15); c.scale(VIEW.s, VIEW.s);
      c.fillStyle = '#774b2d'; c.strokeStyle = '#21152d'; c.lineWidth = 5; roundRect(c, -20, 38, 40, 94, 12); c.fill(); c.stroke();
      const gr = c.createLinearGradient(-13, -115, 30, 35); gr.addColorStop(0, '#fff'); gr.addColorStop(.42, '#dce8ed'); gr.addColorStop(1, '#8da1aa'); c.fillStyle = gr; c.beginPath(); c.moveTo(-17, 45); c.lineTo(-25, -100); c.lineTo(6, -132); c.lineTo(27, -94); c.lineTo(20, 45); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(-9, 31); c.lineTo(-12, -94); c.stroke(); c.restore();
    }
    function drawGun(c, w, p, side) {
      const recoil = Math.sin(Math.min(1, p * 3) * Math.PI) * 17, x = w.x - side * 65, y = VIEW.h - 82 + recoil;
      c.save(); c.translate(x, y); c.scale(side, 1); c.rotate(-.12); c.fillStyle = '#3c3e47'; c.strokeStyle = '#17121f'; c.lineWidth = 5; roundRect(c, -18, -35, 116, 44, 8); c.fill(); c.stroke(); c.fillStyle = '#24252c'; c.beginPath(); c.moveTo(20, 7); c.lineTo(66, 7); c.lineTo(54, 86); c.lineTo(18, 82); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#8f94a1'; c.fillRect(-4, -27, 78, 7);
      if (p < .36) { c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(102, -13, 0, 102, -13, 48); gr.addColorStop(0, '#fff'); gr.addColorStop(.2, '#ffe780'); gr.addColorStop(1, 'rgba(255,117,20,0)'); c.fillStyle = gr; c.beginPath(); c.arc(102, -13, 48, 0, TAU); c.fill(); }
      c.restore();
    }
    function drawVignette(c) { const rg = c.createRadialGradient(VIEW.cx, VIEW.h * .47, Math.min(VIEW.w, VIEW.h) * .24, VIEW.cx, VIEW.h * .47, Math.max(VIEW.w, VIEW.h) * .72); rg.addColorStop(0, 'rgba(26,15,37,0)'); rg.addColorStop(1, 'rgba(26,15,37,.26)'); c.fillStyle = rg; c.fillRect(0, 0, VIEW.w, VIEW.h); }

    function roundRect(c, x, y, w, h, r) { r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

    function hint(text, seconds) { const el = $('#hint'); el.textContent = text; el.classList.remove('off'); G.hintUntil = G.time + (seconds || 2); }
    function talk(text, seconds) { const el = $('#talk'); $('#talkText').textContent = text; el.classList.add('on'); G.talkUntil = G.time + (seconds || 1.6); }
    function flash(color, amount) { G.flashColor = color || '#fff'; G.flash = Math.max(G.flash, amount == null ? .25 : amount); }
    function vibrate(pattern) { if (PREF.vibe && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (_) {} } }

    function clientPoint(event) { const r = canvas.getBoundingClientRect(); return { x: (event.clientX - r.left) * VIEW.w / r.width, y: (event.clientY - r.top) * VIEW.h / r.height }; }
    function clearPointers() {
      for (const p of pointers.values()) { try { if (canvas.hasPointerCapture && canvas.hasPointerCapture(p.id)) canvas.releasePointerCapture(p.id); } catch (_) {} }
      pointers.clear();
    }
    function pointerDown(event) {
      if (G.paused || G.docPaused || (event.pointerType === 'mouse' && event.button !== 0)) return;
      AUDIO.unlock(); const q = clientPoint(event);
      if (!canStrike()) { if (['crowd_grab', 'crowd_wall', 'revival'].includes(G.state)) blockedAt(q.x, q.y); return; }
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
      const p = { id: event.pointerId, x0: q.x, y0: q.y, x: q.x, y: q.y, px: q.x, py: q.y, t0: G.time, fired: false, acted: false, moved: 0, slashHits: 0, slashParts: new Set(), lastSlashX: NaN, lastSlashY: NaN, nextAuto: G.time };
      pointers.set(event.pointerId, p);
      if (G.tool === 'gun') { fireGun(p); p.nextAuto = G.time + .19; }
      event.preventDefault();
    }
    function pointerMove(event) {
      const p = pointers.get(event.pointerId); if (!p) return;
      const q = clientPoint(event), dx = q.x - p.x, dy = q.y - p.y; p.px = p.x; p.py = p.y; p.x = q.x; p.y = q.y; p.moved += Math.hypot(dx, dy);
      if (G.tool === 'hand' && !p.acted) {
        const totalX = p.x - p.x0, totalY = p.y - p.y0, dist = Math.hypot(totalX, totalY);
        if (dist > 28 && G.time - p.t0 < .42) { p.acted = true; const attack = Math.abs(totalX) > Math.abs(totalY) * .9 ? 'hook' : totalY < 0 ? 'upper' : 'jab'; strike('hand', attack, p.x, p.y); }
      } else if (G.tool === 'knife') {
        if (p.moved > 9) slashSegment(p, p.px, p.py, p.x, p.y);
      }
    }
    function pointerEnd(event) {
      const p = pointers.get(event.pointerId); if (!p) return; pointers.delete(event.pointerId);
      try { if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch (_) {}
      if (!canStrike()) return;
      if (G.tool === 'hand' && !p.acted && event.type === 'pointerup') { p.acted = true; strike('hand', 'jab', p.x, p.y); }
      else if (G.tool === 'knife' && p.moved <= 9 && event.type === 'pointerup') strike('knife', 'stab', p.x0, p.y0);
    }
    function pollPointers() {
      for (const p of pointers.values()) {
        if (G.tool === 'gun' && G.time >= p.nextAuto) { fireGun(p); p.nextAuto += .19; }
        else if (G.tool === 'hand' && !p.acted && G.time - p.t0 > .13) { p.acted = true; strike('hand', 'jab', p.x, p.y); }
      }
    }
    function fireGun(p) { p.fired = true; strike('gun', 'shot', p.x, p.y); }
    function slashSegment(p, x1, y1, x2, y2) {
      const len = Math.hypot(x2 - x1, y2 - y1); if (len < 1) return;
      if (!p.slashParts) p.slashParts = new Set();
      const angle = Math.atan2(y2 - y1, x2 - x1); G.trails.push({ x1, y1, x2, y2, life: .2, max: .2 }); if (G.trails.length > 30) G.trails.shift();
      showWeapon('knife', 'slash', x2, y2, false, angle);
      const n = Math.min(70, Math.max(1, Math.ceil(len / 5)));
      for (let i = 0; i <= n && p.slashHits < 10; i++) {
        const q = i / n, x = lerp(x1, x2, q), y = lerp(y1, y2, q), hit = locateScreen(x, y); if (!hit) continue;
        const far = !Number.isFinite(p.lastSlashX) || Math.hypot(x - p.lastSlashX, y - p.lastSlashY) >= 22;
        if (!far) continue; p.lastSlashX = x; p.lastSlashY = y; p.slashHits++;
        const trackAnatomy = !p.slashParts.has(hit.part);
        if (strike('knife', 'slash', x, y, { angle, power: p.slashHits === 1 ? 1.2 : .85, trackAnatomy })) p.slashParts.add(hit.part);
      }
    }

    function setTool(tool, silent) {
      if (!['hand', 'knife', 'gun'].includes(tool)) return;
      clearPointers(); G.tool = tool; $$('#tools .tool').forEach(el => el.classList.toggle('on', el.dataset.tool === tool));
      if (!silent) { AUDIO.ui(); hint(tool === 'hand' ? '누르면 주먹 · 빠르게 밀면 훅/어퍼' : tool === 'knife' ? '그어서 베기 · 눌렀다 떼면 찌르기' : '누르고 있으면 계속 발사', 2.7); }
    }

    function enter(result, mode) {
      G.result = result || null; $('#fight').hidden = false; $('#fallback').hidden = true;
      try { if (global.speechSynthesis) global.speechSynthesis.cancel(); } catch (_) {}
      resize(); resetRound(mode === 'submit' ? 'submit' : 'fight');
      const face = $('#arcadeFace'); if (face) { face.target = '_blank'; face.rel = 'noopener'; }
      AUDIO.unlock(); G.docPaused = false; G.paused = false;
      if (!G.running) { G.running = true; G.last = performance.now(); G.raf = requestAnimationFrame(frame); }
      requestAnimationFrame(() => { try { canvas.focus({ preventScroll: true }); } catch (_) { canvas.focus(); } });
    }
    function pause() { G.running = false; cancelAnimationFrame(G.raf); clearPointers(); AUDIO.suspend(); }
    function leave(home) {
      pause(); $('#settingsModal').hidden = true; $('#ending').hidden = true; $('#fight').hidden = true;
      const face = $('#arcadeFace'); if (face) { face.target = '_top'; face.removeAttribute('rel'); }
      if (home && global.__paljaRestart) global.__paljaRestart(); else if (global.__paljaLeave) global.__paljaLeave();
    }
    function resumeLoop() { if (!G.running && !$('#fight').hidden) { G.running = true; G.last = performance.now(); G.raf = requestAnimationFrame(frame); } }

    canvas.addEventListener('pointerdown', pointerDown, { passive: false });
    canvas.addEventListener('pointermove', pointerMove, { passive: false });
    canvas.addEventListener('pointerup', pointerEnd); canvas.addEventListener('pointercancel', pointerEnd); canvas.addEventListener('lostpointercapture', pointerEnd);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    $$('#tools .tool').forEach(el => el.addEventListener('click', () => { AUDIO.unlock(); setTool(el.dataset.tool); }));
    $('#fightBack').addEventListener('click', () => leave(false));
    $('#soundBtn').addEventListener('click', () => { AUDIO.unlock(); togglePref('sound'); });
    $('#settingsBtn').addEventListener('click', () => { clearPointers(); G.paused = true; $('#settingsModal').hidden = false; });
    $$('#settingsModal [data-close]').forEach(el => el.addEventListener('click', closeSettings));
    $('#settingsModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeSettings(); });
    function closeSettings() { $('#settingsModal').hidden = true; G.paused = false; G.last = performance.now(); AUDIO.resume(); }
    for (const key of Object.keys(prefDefaults)) { const el = $('#sw' + key[0].toUpperCase() + key.slice(1)); if (el) el.addEventListener('click', () => togglePref(key)); }
    $('#resetFight').addEventListener('click', () => { closeSettings(); resetRound(G.mode); });
    $('#endAgain').addEventListener('click', () => resetRound('fight'));
    $('#endHome').addEventListener('click', () => leave(false));
    $('#endMore').addEventListener('click', () => { $('#ending').hidden = true; G.endless = true; G.hp = G.shown = G.lag = 1; G.phase = 4; G.revived = true; setState('endless'); hint('끝난 운명도 더 팰 수 있습니다.', 2.3); });
    $('#fateSeal').addEventListener('click', () => { G.submitDone = true; $('#submitWorkflow').hidden = true; $('#submitCertificate').hidden = false; AUDIO.ui(); talk('븅~신ㅋㅋ', 1.45); });
    $('#breakSeal').addEventListener('click', startFightFromSubmit); $('#submitFight').addEventListener('click', startFightFromSubmit);
    addEventListener('keydown', e => {
      if ($('#fight').hidden || G.paused) return;
      const map = { '1': 'hand', '2': 'knife', '3': 'gun' }; if (map[e.key]) setTool(map[e.key]);
      else if (e.key === 'Escape') { if (!$('#settingsModal').hidden) closeSettings(); else { G.paused = true; $('#settingsModal').hidden = false; } }
    });
    addEventListener('blur', clearPointers);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { G.docPaused = true; clearPointers(); AUDIO.suspend(); }
      else { G.docPaused = false; G.last = performance.now(); AUDIO.resume(); resize(); resumeLoop(); }
    });
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 50); });

    function debugSetHP(value) { G.hp = G.shown = G.lag = clamp(Number(value) || 0, 0, 100); updateGauge(true); draw(); return G.hp; }
    function debugDamage(amount, part, tool) {
      if (G.state === 'intro') setState(G.revived ? 'fight2' : 'fight');
      const p = screenPart(part || 'chest'); if (!p) return false;
      const old = G.tool, chosen = tool || G.tool, attack = chosen === 'gun' ? 'shot' : chosen === 'knife' ? 'stab' : 'hook';
      const base = chosen === 'gun' ? 2.7 : chosen === 'knife' ? 3.85 : 3.05;
      if (tool) G.tool = tool;
      const ok = strike(chosen, attack, p.x, p.y, { power: amount == null ? 1 : Math.max(.01, Number(amount) || 0) / base });
      G.tool = old; return ok;
    }
    function debugEvent(name) {
      if (name === 'grab') { G.crowdGrab = true; G.hp = G.shown = G.lag = 12; setState('crowd_grab'); }
      else if (name === 'wall') { G.crowdGrab = G.crowdWall = true; G.hp = G.shown = G.lag = 10; setState('crowd_wall'); }
      else if (name === 'revival') { G.crowdGrab = G.crowdWall = G.revivalUsed = true; G.hp = G.shown = G.lag = 8; setState('revival'); }
      else if (name === 'defeat') { G.revived = true; G.hp = G.shown = G.lag = 0; setState('defeat'); }
      updateGauge(true); draw(); return G.state;
    }
    function screenPart(name) {
      const points = ART.bossReady
        ? { head: [0, -568], eyeL: [-20, -578], eyeR: [20, -578], crown: [0, -626], chest: [0, -455], belly: [0, -337], armL: [-150, -305], armR: [150, -305], legL: [-65, -88], legR: [65, -88] }
        : { head: [0, -474], crown: [0, -578], chest: [0, -337], belly: [0, -248], armL: [-136, -246], armR: [136, -246], legL: [-58, -77], legR: [58, -77] };
      const p = points[name]; return p ? localToScreen(p[0], p[1]) : null;
    }

    syncPrefs(); resize();

    const api = {
      enter, leave, pause,
      tick(dt, shouldDraw) { step(dt == null ? 1 / 60 : dt); if (shouldDraw !== false) draw(); },
      setTool,
      hitAt(x, y, kind) { return strike(G.tool, kind || (G.tool === 'hand' ? 'jab' : G.tool === 'knife' ? 'stab' : 'shot'), x, y); },
      slash(points) { if (!points || points.length < 2) return false; const p = { slashHits: 0, lastSlashX: NaN, lastSlashY: NaN }; for (let i = 1; i < points.length; i++) slashSegment(p, points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]); return p.slashHits > 0; },
      screenPart,
      project(v) { if (Array.isArray(v)) return localToScreen(v[0] || 0, v[1] || 0); if (v && typeof v === 'object') return localToScreen(v.x || 0, v.y || 0); return localToScreen(0, 0); },
      get state() { return { G, view: VIEW, canvas, ctx, particles, effects }; },
      debug: { round(mode) { resetRound(mode || 'fight'); }, setHP: debugSetHP, damage: debugDamage, event: debugEvent, resize, draw, pauseState() { G.paused = !G.paused; return G.paused; } }
    };
    return { api };
  }
})(window);
