/* 사주도사 · 족치기 화면 (fight.js)
 * index.html이 three.min.js(r128) 다음에 불러 쓴다. 이 파일 하나에 족치기 화면의 모양(CSS)·틀(HTML)·게임 코드가 다 들어 있다.
 * 쓰는 법: window.PaljaBoot() → window.PaljaGame.enter(사주 결과, 'fight' 또는 'submit' 또는 'free')
 * 'submit'은 운세를 들고 추종자들 사이에서 설교를 듣는 화면, 'fight'는 천지신명 족치기.
 * 화면을 닫을 때는 index.html의 window.__paljaLeave()를 부른다.
 *
 * 차례
 *  1. 화면 틀(CSS·HTML·아이콘)
 *  2. 공용 도구(수학·스프링·움직이는 메시)
 *  3. 소리(타격음·총소리·목소리)
 *  4. 무대(하늘 궁전·옥좌·바닥)와 카메라 구도
 *  5. 피(사람이 아니라 파랗다: 튀는 피·몸을 타고 흐르는 피·고이는 피·화면에 묻는 피)와 멍·상처 자국(찢긴 살갗 속 비늘)
 *  5-2. 맞은 자리 효과(번쩍임·충격 글자)
 *  5-3. 동전(돼지저금통 배에서 쏟아지는 금화·엽전)
 *  6. 천지신명(모양·얼굴 표정·자세·맞는 반응·팔다리 자르기·도마뱀 팔다리·다운·후광·정체)
 *  7. 내 손과 무기(맨주먹·식칼·권총)
 *  8. 진행(버팀 게이지·다운 세 번·마지막)과 입력
 *  9. 천지신명 정육공장 연결(모드의 내용은 fight-free.js에 따로 있다)
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
#fight #omenShade{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;background:linear-gradient(165deg,rgba(4,12,20,.92) 10%,rgba(4,12,20,.25) 75%)}
#fight #fxtext{position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden}
/* 타격 효과음 글자: 먹글씨(먹색 채움 + 흰 테 + 색깔 그림자). 한 글자씩 흔들리며 '쾅' 박혔다가 조각조각 흩어진다 */
#fight .pop{position:absolute;left:0;top:0;line-height:1;white-space:nowrap;letter-spacing:-.01em;
 font-family:"Gugi","Black Han Sans","Apple SD Gothic Neo",sans-serif;transform:translate(-50%,-50%) rotate(var(--r,0deg));
 animation:fslam var(--d,.6s) cubic-bezier(.2,.9,.3,1) forwards;will-change:transform,opacity}
#fight .pop i{display:inline-block;font-style:normal;color:#201a30;
 -webkit-text-stroke:var(--sw,6px) #fff9ee;paint-order:stroke fill;
 text-shadow:var(--ox,5px) var(--oy,6px) 0 var(--sh,#d8352a),0 0 2px rgba(20,14,30,.5);
 transform:translateY(var(--lj,0px)) rotate(var(--lr,0deg));animation:fbreak var(--d,.6s) cubic-bezier(.3,.55,.4,1) both;will-change:transform,opacity}
@keyframes fslam{0%{transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(.2)}15%{transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(1.2)}30%{transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(1)}70%{opacity:1}100%{transform:translate(-50%,-60%) rotate(var(--r,0deg)) scale(.98);opacity:0}}
@keyframes fbreak{0%{opacity:0;transform:translateY(var(--lj,0px)) rotate(var(--lr,0deg)) scale(.4)}12%{opacity:1;transform:translateY(var(--lj,0px)) rotate(var(--lr,0deg)) scale(1)}66%{transform:translateY(var(--lj,0px)) rotate(var(--lr,0deg)) translate(0,0)}100%{transform:translate(var(--lx,0px),calc(var(--ly,0px) + var(--lj,0px))) rotate(calc(var(--lr,0deg) + var(--ls,0deg))) scale(.9)}}
#fight .gauge.hit{animation:fgshake .2s linear}
@keyframes fgshake{0%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}100%{transform:translateX(0)}}
#fight .gauge .bar i.flash{background:#fff3e8}
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
#fight .gauge .bar b{background:#ffd3c9}
#fight .gauge .bar i{background:linear-gradient(90deg,#a81d16,#e8492e 70%,#f26a3c)}
#fight .gauge .bar s{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:rgba(36,20,30,.5);text-decoration:none}
#fight .dock{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,560px);z-index:6;display:flex;flex-direction:column;gap:7px;padding:0 10px calc(10px + var(--safe-b));pointer-events:none}
#fight .dock>*{pointer-events:auto}
#fight .hint{align-self:center;pointer-events:none!important;background:rgba(36,28,58,.86);color:#fff;font-size:12px;font-weight:600;line-height:1.35;border-radius:99px;padding:6px 13px;text-align:center;max-width:100%;transition:opacity .35s}
#fight .hint.off{opacity:0}
#fight .panel{background:rgba(255,253,246,.96);border:1px solid rgba(120,86,30,.14);border-radius:18px;box-shadow:0 3px 14px rgba(40,30,60,.24);padding:6px}
/* 무기 고르기: 손에 쥔 도구 세 장을 부채처럼 펼친다 */
#fight .panel.tools{background:none;border:0;box-shadow:none;padding:0}
#fight .tools{display:flex;justify-content:center;align-items:flex-end;padding:0 0 4px}
#fight .tool{position:relative;width:75px;height:97px;margin:0 -7px;border:0;padding:0;background:none;color:var(--ink);
 transform:rotate(var(--fan,0deg)) translateY(var(--lift,8px));transform-origin:50% 132%;
 transition:transform .17s cubic-bezier(.3,1.5,.5,1);filter:drop-shadow(0 4px 6px rgba(30,20,50,.3))}
#fight .tool:nth-child(1){--fan:-10deg;z-index:1}
#fight .tool:nth-child(2){--fan:0deg;z-index:2}
#fight .tool:nth-child(3){--fan:10deg;z-index:3}
#fight .tool .card{position:relative;display:flex;flex-direction:column;align-items:center;width:100%;height:100%;box-sizing:border-box;
 border-radius:11px;background:linear-gradient(168deg,#fffdf5,#f1e7d1);border:2px solid var(--c,#b9892f);
 box-shadow:inset 0 0 0 2px rgba(255,255,255,.75);overflow:hidden;padding:6px 3px 4px}
#fight .tool .art{width:47px;height:47px;flex:none}
#fight .tool .nm{margin-top:auto;font-size:10px;font-weight:800;line-height:1.1;letter-spacing:-.4px;text-align:center;color:#352c44}
#fight .tool .nm b{display:block;font-size:8px;font-weight:700;color:var(--c);opacity:.95;letter-spacing:0}
#fight .tool.on{--lift:-18px;z-index:9;filter:drop-shadow(0 9px 13px rgba(30,20,50,.42))}
#fight .tool.on .card{background:linear-gradient(168deg,#fff8e2,#ffeab4);border-color:var(--c);box-shadow:inset 0 0 0 2px #fff,inset 0 0 0 3.5px var(--c)}
#fight .tool:active{transform:rotate(var(--fan,0deg)) translateY(calc(var(--lift,8px) + 2px))}
#fight .tool .ammo{position:absolute;top:-3px;right:-3px;min-width:19px;height:19px;border-radius:10px;background:var(--red);color:#fff;font-size:11px;line-height:19px;padding:0 5px;font-weight:800;box-shadow:0 1px 3px rgba(0,0,0,.3);z-index:3}
#fight .tool .ammo.reload{background:#6b6577;font-size:10px}
#fight .btn{display:block;width:100%;min-height:52px;padding:12px 16px;border:2.5px solid var(--ink);border-radius:15px;background:#fff;color:var(--ink);font-size:16.5px;font-weight:800;line-height:1.3;text-align:center;box-shadow:0 4px 0 var(--ink)}
#fight .btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
#fight .btn.danger{background:var(--red);color:#fff}
#fight .btn.soft{border-color:#d9d2c6;box-shadow:0 3px 0 #d9d2c6;font-size:15px;min-height:46px}
#fight .audio-levels{padding:10px 0;border-bottom:1px solid var(--line)}
#fight .audio-levels label{display:flex;justify-content:space-between;font-size:14px}
#fight .audio-levels output{font-variant-numeric:tabular-nums;font-size:12px}
#fight .audio-levels input{display:block;width:100%;height:28px;margin:2px 0 8px;accent-color:#8b3035}
/* 풀이 화면 밑에 깔려 있는 동안(종이로 줄어드는 중): 화면 조작은 풀이 쪽으로 넘기고 위쪽 버튼은 감춘다 */
#fight.behind{pointer-events:none}
#fight.behind .ftop,#fight.behind .dock,#fight.behind #crumpleHint{opacity:0;visibility:hidden}
#fight .ftop{transition:opacity .4s ease-out}
/* 순응 장면 안내: 종이를 꾹 눌러 구기면 걸어 나간다 */
#fight #crumpleHint{position:absolute;left:50%;bottom:calc(16px + var(--safe-b));z-index:7;transform:translateX(-50%);max-width:calc(100vw - 24px);padding:9px 15px;border-radius:999px;background:rgba(12,20,21,.86);border:1px solid #6c624b;color:#efe5cb;font-size:13.5px;font-weight:600;line-height:1.35;text-align:center;white-space:nowrap;pointer-events:none;transition:opacity .45s ease-out,transform .45s ease-out}
#fight #crumpleHint.off{visibility:hidden;opacity:0;transform:translate(-50%,10px)}
@media(prefers-reduced-motion:reduce){#fight #crumpleHint{transition:none}}
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
#fight #fallback{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:30px;text-align:center;font-weight:800;background:#cfe7f7}
#fight #fallback small{font-weight:400;color:var(--muted)}

/* 말풍선: 동물의 숲식 하얀 타원은 캔버스 한 장(#speech)에 그린다. 읽어 주는 기계용 글은 화면 밖에 둔다 */
#fight #speech{position:absolute;inset:0;width:100%;height:100%;z-index:9;pointer-events:none}
#fight .sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* 끝난 뒤 다시 족치기 */
#fight #again{flex-direction:column;align-items:center;gap:10px;position:absolute;left:0;right:0;bottom:calc(30px + var(--safe-b));z-index:7;display:flex;justify-content:center;pointer-events:none;opacity:0;transform:translateY(14px);transition:opacity .7s ease-out,transform .7s cubic-bezier(.2,1.2,.4,1)}
#fight #again.on{opacity:1;transform:none}
#fight #again .btn{width:auto;max-width:calc(100vw - 32px);min-width:min(220px,70vw);padding:12px 22px;font-size:15px;line-height:1.5;pointer-events:auto;box-shadow:0 4px 0 var(--ink),0 10px 26px rgba(25,18,45,.35)}
#fight .defeat-total{margin:0;color:#e6dcc5;font-size:12px;line-height:1.4;font-variant-numeric:tabular-nums;text-shadow:0 1px 5px #000}
#fight #defeatCount{color:#bcae8e;font-size:10px;line-height:1.2}
#fight #again .btn:active{box-shadow:0 1px 0 var(--ink),0 6px 16px rgba(25,18,45,.3)}
#fight #again #trophyBtn{min-height:42px;min-width:0;padding:6px 16px;font-size:13px;color:#e6dcc5;background:#25201ce8;border:1px solid #8b795b;box-shadow:none}
#fight #trophyModal{z-index:35;background:rgba(12,10,9,.94);padding:12px;overscroll-behavior:contain}
#fight .trophy-sheet{width:min(100%,430px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);display:flex;flex-direction:column;color:#f3e8cf;background:#211c18;border:1px solid #65513b;border-radius:16px;overflow:hidden;box-shadow:0 15px 70px #000}
#fight .trophy-top{display:flex;align-items:center;justify-content:space-between;flex:none;padding:8px 12px 8px 18px}
#fight .trophy-top h2{font-size:15px;margin:0;font-weight:700}
#fight #trophyClose{width:38px;height:38px;border:0;background:transparent;color:#f3e8cf;font-size:27px;line-height:1}
#fight .trophy-view{position:relative;min-height:0;overflow:auto;display:flex;justify-content:center;background:#14120f}
#fight #trophyImage{display:block;width:100%;height:auto;object-fit:contain;max-height:calc(100vh - 225px);max-height:calc(100dvh - 225px);-webkit-touch-callout:default;user-select:auto}
#fight .trophy-actions{padding:12px;display:flex;gap:9px;flex:none}
#fight .trophy-actions .btn{flex:1;min-width:0;min-height:46px;font-size:14px;text-decoration:none;box-shadow:none;border:1px solid #65513b;border-radius:9px;background:#30271f;color:#f3e8cf}
#fight .trophy-actions .btn.danger{background:#c63b2b;border-color:#c63b2b;color:#fff6e5}
#fight #trophyStatus{min-height:18px;margin:0;padding:0 14px 12px;text-align:center;font-size:11px;color:#b9aa94;line-height:1.5}
#fight #trophyPages{display:flex;align-items:center;justify-content:center;gap:12px;padding-top:10px;font-size:12px;color:#cbbba1}
#fight #trophyPages button{padding:5px 12px;border:1px solid #65513b;border-radius:6px;background:#30271f;color:#f3e8cf}
#fight #trophyPages button:disabled{opacity:.3}
#fight .trophy-reset{margin:0 14px 12px;padding-top:10px;border-top:1px solid #4b4034;text-align:center}
#fight #trophyReset{border:0;background:none;color:#b9aa94;text-decoration:underline;text-underline-offset:3px;padding:8px 18px;min-height:40px;font:inherit;font-size:11px}
#fight #trophyResetConfirm p{margin:0 0 10px;font-size:13px;line-height:1.6}
#fight #trophyResetConfirm button{min-height:42px;padding:8px 20px;margin:0 4px;border:1px solid #77614c;border-radius:7px;background:#30271f;color:#f3e8cf;font:inherit;font-size:13px}
#fight #trophyResetConfirm #trophyResetYes{border-color:#aa5946;color:#ffc0aa}

#fight.accepting-fate .ftop{padding-right:10px}
#fight.accepting-fate .gauge{visibility:hidden}

/* 이야기 장치: 설명문 대신 플레이어가 실제 문서와 구조를 부순다. */
#fight .story-scene{position:absolute;inset:0;z-index:8;pointer-events:none}
#fight .story-scene[hidden]{display:none!important}

/* 50% — 나만 좋게 고쳐 준 사주. 뒤의 다른 사람 문서는 아래로 밀려난다. */
#fight #offerScene{display:flex;align-items:center;justify-content:center;padding:88px 18px 132px;background:radial-gradient(circle at 50% 46%,rgba(255,239,151,.2),rgba(36,28,58,.24) 72%)}
#fight .offer-stack{position:relative;width:min(74vw,300px);height:min(58vh,410px);filter:drop-shadow(0 18px 28px rgba(30,20,20,.32))}
#fight .fate-paper{position:absolute;inset:0;border:0;border-radius:5px;padding:25px 23px 22px;background:linear-gradient(105deg,#fff9d4,#f7dfa0 55%,#fff4c4);color:#35250e;text-align:center;box-shadow:inset 0 0 0 2px #7d5617,inset 0 0 0 7px #f4c954;transform:rotate(-1.5deg);overflow:hidden;pointer-events:auto}
#fight .fate-paper::before,#fight .fate-paper::after{content:"";position:absolute;inset:10px;border:1px solid rgba(111,72,13,.55);pointer-events:none}
#fight .fate-paper::after{inset:15px;border-color:rgba(111,72,13,.22)}
#fight .fate-paper small{display:block;font-family:var(--serif);font-weight:800;letter-spacing:.22em;color:#795313}
#fight .fate-paper strong{display:block;margin:10px 0 17px;font-family:var(--serif);font-size:clamp(25px,8vw,34px);line-height:1.1;color:#8b1d18}
#fight .fate-paper ul{list-style:none;margin:0;padding:14px 0;border-block:1px solid rgba(121,83,19,.36);font-family:var(--serif);font-size:17px;font-weight:700;line-height:1.9}
#fight .fate-paper em{display:block;margin-top:15px;font-style:normal;font-size:12px;font-weight:800;color:#8b1d18}
#fight .other-fate{position:absolute;left:12%;right:12%;bottom:-17px;height:78px;padding:13px 15px;border:1.5px solid #877d6a;background:#e9e3d5;color:#686153;transform:rotate(3deg) translateY(22px);box-shadow:0 8px 14px rgba(0,0,0,.2);font-family:var(--serif);font-weight:700;text-align:left;z-index:-1}
#fight .other-fate b{display:block;color:#332f29}#fight .other-fate span{font-size:12px}
#fight .offer-command{position:absolute;left:50%;bottom:-52px;transform:translateX(-50%);white-space:nowrap;padding:7px 13px;border-radius:99px;background:rgba(36,28,58,.9);color:#fff;font-size:12px;font-weight:800;animation:offerPulse 1.1s ease-in-out infinite}
@keyframes offerPulse{50%{transform:translateX(-50%) scale(1.06)}}
#fight #offerScene.breaking .fate-paper{animation:paperBreak .48s cubic-bezier(.2,.8,.2,1) forwards}
#fight #offerScene .fate-paper.half{pointer-events:none}
#fight #offerScene.breaking .fate-paper.half.l{animation:halfL .78s cubic-bezier(.3,.1,.6,1) forwards}
#fight #offerScene.breaking .fate-paper.half.r{animation:halfR .78s cubic-bezier(.3,.1,.6,1) forwards}
@keyframes halfL{0%{transform:rotate(-1.5deg);opacity:1}16%{transform:translate(-22px,-8px) rotate(-8deg)}72%{opacity:1}100%{transform:translate(-170px,330px) rotate(-46deg);opacity:0}}
@keyframes halfR{0%{transform:rotate(-1.5deg);opacity:1}16%{transform:translate(22px,-5px) rotate(7deg)}72%{opacity:1}100%{transform:translate(180px,350px) rotate(42deg);opacity:0}}
#fight .offer-stack .scrap{position:absolute;width:11px;height:8px;margin:-4px 0 0 -5px;background:#f7e2a8;box-shadow:inset 0 0 0 1px rgba(125,86,23,.45);pointer-events:none;animation:offerScrap .85s cubic-bezier(.2,.6,.5,1) forwards}
@keyframes offerScrap{to{transform:translate(var(--dx),var(--dy)) rotate(var(--rr));opacity:0}}
#fight #offerScene.breaking .offer-command{visibility:hidden}
#fight #offerScene.breaking .other-fate{animation:otherRise 1.45s .1s cubic-bezier(.25,.9,.35,1) forwards}
@keyframes paperBreak{35%{transform:rotate(2deg) scale(1.05);filter:brightness(1.5)}100%{transform:rotate(-13deg) scale(.2);opacity:0;clip-path:polygon(0 0,47% 8%,54% 0,100% 0,92% 46%,100% 58%,100% 100%,57% 91%,47% 100%,0 100%,9% 55%,0 44%)}}
@keyframes otherRise{0%{transform:rotate(3deg) translateY(22px)}26%{transform:rotate(-1deg) translateY(-150px) scale(1.12)}78%{transform:rotate(-1deg) translateY(-150px) scale(1.12);opacity:1}100%{transform:rotate(-7deg) translateY(-130px) scale(1.04);opacity:0}}

@media (min-width:760px){#fight .tool{width:84px;height:108px}#fight .tool .art{width:54px;height:54px}#fight .tool .nm{font-size:11px}#fight .gauge .grow{font-size:13.5px}}
@media (max-width:370px){#fight .tool{width:67px;height:88px;margin:0 -6px}#fight .tool .art{width:41px;height:41px}#fight .tool .nm{font-size:9px}#fight .ftop{gap:5px}#fight .pill{width:38px;min-width:38px}}
@media (max-width:340px){#fight .tool{width:61px;height:82px}#fight .tool .art{width:37px;height:37px}#fight .gauge{padding:6px 8px 7px}#fight .gauge .grow{font-size:11.5px;gap:5px}#fight .gauge small{display:none}}
/* 가로로 눕힌 휴대폰(키가 낮은 화면): 카드를 오른쪽에 세로로 세워 발끝까지 보이게 */
@media (orientation:landscape) and (max-height:520px){
 #fight .dock#dock{left:auto;right:calc(6px + env(safe-area-inset-right,0px));bottom:calc(6px + var(--safe-b));transform:none;width:auto;padding:0}
 #fight .dock#dock .tools{flex-direction:column;align-items:flex-end;padding:0}
 #fight .dock#dock .tool{width:120px;height:38px;margin:3px 0;transform:none;transform-origin:100% 50%}
 #fight .dock#dock .tool .card{flex-direction:row;gap:6px;align-items:center;border-radius:9px;padding:3px 8px 3px 5px}
 #fight .dock#dock .tool .art{width:28px;height:28px}
 #fight .dock#dock .tool .nm{margin:0;font-size:10px;text-align:left;white-space:nowrap}
 #fight .dock#dock .tool .nm b{display:inline;margin-right:3px}
 #fight .dock#dock .tool.on{--lift:0;transform:translateX(-5px)}
 #fight .dock#dock .hint{position:fixed;left:50%;bottom:calc(8px + var(--safe-b));transform:translateX(-50%);max-width:56vw;white-space:nowrap}
 #fight #offerScene{padding:48px 145px 10px 8px}
 #fight #offerScene .offer-stack{width:250px;height:350px;transform:scale(.74);transform-origin:center}
}
@media (prefers-reduced-motion:reduce){#fight #again{transition:none}#fight .gauge.hit{animation:none}#fight .chorus{transition:none!important}#fight .chorus span,#fight .issued-paper,#fight .offer-command{animation:none!important}#fight .fate-paper,#fight .other-fate,#fight .revival-seal,#fight #goldShell{animation-duration:.01s!important;animation-delay:0s!important}#fight #offerScene.breaking .other-fate{animation:none!important;transform:rotate(-1deg) translateY(-150px) scale(1.12);opacity:1}#fight .offer-stack .scrap{display:none}}

/* Close combat: dark brass controls, with room for the opponent's feet and face. */
#fight.close-combat{background:#151d1e;--ink:#e8dfce;--muted:#aaa797}
#fight.close-combat::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at 50% 42%,transparent 32%,rgba(4,10,11,.33) 100%)}
#fight.close-combat .pill{background:rgba(17,24,25,.88);border:1px solid #6c624b;border-radius:5px;color:#e6d7b7;box-shadow:none}
#fight.close-combat .gauge{background:rgba(17,24,25,.78);border:1px solid #605744;border-radius:4px;box-shadow:none;max-width:380px;gap:7px;padding:9px 12px}
#fight.close-combat .gname{font-weight:500;letter-spacing:2px;font-size:11px;color:#cfc3a8}
#fight.close-combat .gauge small,#fight.close-combat .kd,#fight.close-combat .bar s{display:none}
#fight.close-combat .gauge .bar{height:3px;background:#303432;border-radius:0}
#fight.close-combat .gauge .bar i{background:#b98d4b}
#fight.close-combat .gauge .bar b{background:#f1dbad}
#fight.close-combat .dock{width:auto;max-width:100%;padding-bottom:calc(14px + var(--safe-b))}
#fight.close-combat .hint{font-size:11px;white-space:nowrap;background:rgba(12,20,21,.82);border:1px solid #655942;border-radius:3px;color:#ded5bd;padding:7px 10px}
#fight.close-combat .tools{gap:6px;align-items:center}
#fight.close-combat .tool{width:66px;height:54px;margin:0;transform:none;filter:none;transition:background .16s}
#fight.close-combat .tool .card{border:1px solid #635a49;border-radius:4px;background:rgba(20,27,28,.92);padding:4px;box-shadow:none}
#fight.close-combat .tool .art{width:26px;height:26px;opacity:.8;filter:sepia(.6)}
#fight.close-combat .tool .nm{font-size:10px;font-weight:500;color:#b6b3a6}
#fight.close-combat .tool.on .card{border-color:#d3ad69;background:rgba(69,57,37,.94);box-shadow:inset 0 -2px #d3ad69}
#fight.close-combat .tool.on .nm{color:#f5dfaf}
#fight.close-combat .tool:active{transform:translateY(2px)}
#fight.close-combat .msheet{background:#1d2728;color:#e6ddc9;border:1px solid #7b6c50;border-radius:8px}
#fight.close-combat .msheet .close{background:#303b3b}
#fight.close-combat .row{border-color:#394444}
#fight.close-combat #world{cursor:crosshair}
#fight.close-combat #world.grabbing{cursor:grabbing}
#fight.close-combat .btn{border-radius:5px;box-shadow:none}
#fight #freeBar{position:absolute;left:50%;top:calc(62px + var(--safe-t));transform:translateX(-50%);z-index:6;display:flex;gap:8px}
#fight #freeBar button{min-width:96px;min-height:40px;padding:7px 14px;border:1px solid #6c624b;border-radius:5px;background:rgba(17,24,25,.9);color:#eadcbc;font-size:13px;font-weight:600;letter-spacing:.5px;white-space:nowrap}
#fight #freeBar button:active{transform:translateY(1px);background:rgba(69,57,37,.94)}
#fight #freeBar button:disabled{opacity:.36;color:#a59f90}
#fight #freeBar #freeNext{border-color:#b5553f;color:#ffd9c9}
#fight #freeBar #freeView[aria-pressed=true]{border-color:#d6c79b;color:#fff0c4;background:#394137}
#fight.free-view #freeCount{font-size:17px;font-weight:700;letter-spacing:.3px;color:#f4e5c9;text-shadow:0 2px 5px #000}
#fight.free-view #hint{display:none}
#fight #factoryPhotoModal{z-index:35;background:rgba(5,9,8,.96);padding:12px;overscroll-behavior:contain}
#fight #factoryPhotoImage{display:block;max-width:100%;max-height:65vh;max-height:65dvh;width:auto;height:auto;margin:auto;object-fit:contain;user-select:auto;-webkit-user-select:auto;-webkit-touch-callout:default;touch-action:auto}
#fight #factoryPhotoStatus,#fight .factory-photo-tip{font-size:12px;line-height:1.5;text-align:center;color:#bcbeb3;margin:10px 0}
#fight #factoryPhotoClose{border:1px solid #777b70;background:#171e1b;color:#eee8d9;border-radius:6px;width:42px;height:42px;font-size:27px;cursor:pointer}
#fight #freePhoto{border-color:#899480;color:#ebefda}
#fight #freeCount{font-size:11px;letter-spacing:1px;color:#cfc3a8;line-height:1.3;text-align:center;font-variant-numeric:tabular-nums}
#fight.free-mode .gauge{background:none;border-color:transparent;justify-content:center}
#fight.free-mode .gauge .grow,#fight.free-mode .gauge .bar,#fight.free-mode #defeatCount{display:none}
#fight #again #freeBtn{min-height:48px;margin-bottom:5px;font-size:14px;font-weight:700;color:#fff0d7;background:linear-gradient(#974938,#65281f);border:1px solid #ad5947;text-shadow:0 1px 1px #421911;box-shadow:inset 0 1px 0 #ffd1a66b,inset 0 -2px 0 #4f1c1670,0 5px 0 #401e1a,0 7px 10px #0005;transition:transform .1s,box-shadow .1s}
#fight #again #freeBtn:active,#fight #again #freeBtn[aria-busy=true]{transform:translateY(4px);background:linear-gradient(#713025,#58231c);box-shadow:inset 0 2px 5px #2b100b66,0 1px 0 #401e1a,0 2px 3px #0005}
#fight #again #freeBtn:disabled{opacity:1;cursor:wait}
#fight #again #freeBtn[aria-busy=true]::before{content:'';display:inline-block;width:12px;height:12px;margin-right:9px;vertical-align:-2px;border:2px solid #fff0d74d;border-top-color:#fff0d7;border-radius:50%;animation:fightFreeEntrySpin .8s linear infinite}
#fight #freeEntryError{margin:0;max-width:280px;color:#ffd9c9;font-size:12px;line-height:1.5;text-align:center}
@keyframes fightFreeEntrySpin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){#fight #again #freeBtn{transition:none}#fight #again #freeBtn[aria-busy=true]::before{animation:none;border-color:#fff0d7}}
@media(max-width:480px){#fight.close-combat .ftop{padding-right:48px;gap:5px}#fight.close-combat .pill{width:35px;min-width:35px}#fight.close-combat .hint{font-size:10px}#fight.close-combat .gname{letter-spacing:1px}}
/* 설정은 전투 색상과 분리하고, 작은 화면에서도 마지막 버튼까지 스크롤한다. */
#fight #settingsModal{--ink:#241c3a;--muted:#686174;--line:#e5ded2;height:100%;max-height:100dvh;padding:calc(16px + var(--safe-t)) 16px calc(16px + var(--safe-b));overscroll-behavior:contain;color:var(--ink)}
#fight #settingsModal .msheet{min-height:0;max-height:100%;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:#fffdf5;color:var(--ink);border:1px solid #d9d2c6;border-radius:16px;padding-bottom:22px;scroll-padding:18px}
#fight #settingsModal .close{width:40px;min-width:40px;height:40px;background:#f3efe8;color:var(--ink);border:1px solid #d9d2c6;border-radius:8px}
#fight #settingsModal .row{border-color:var(--line)}
`;

const FIGHT_HTML = `<section id="fight" hidden>
 <canvas id="world" tabindex="-1" aria-label="천지신명. 터치하면 주먹 또는 밟기, 밀면 훅, 몸을 꾹 잡아 끌거나 던집니다."></canvas>
 <canvas id="sblood"></canvas>
 <div id="flash"></div>
 <div id="omenShade" aria-hidden="true"></div>
 <div id="fxtext" aria-hidden="true"></div>
 <canvas id="speech" aria-hidden="true"></canvas>
 <div id="talkLive" class="sr" aria-live="polite"></div>
 <div id="offerScene" class="story-scene" hidden>
  <div class="offer-stack">
   <div class="other-fate"><b>다음 사람의 운명</b><span>불리한 배정 유지 · 이의 신청 불가</span></div>
   <button type="button" class="fate-paper" id="offerPaper" aria-label="나만 좋게 고친 운세를 찢는다">
    <small>運命 更正書 · 정정 운세</small><strong>당신만 특별히</strong>
    <ul><li>귀한 집안의 도움</li><li>윗자리 평생 보장</li><li>재물운 대길</li></ul>
    <em>단, 기존 질서에 이의를 제기하지 않을 것</em>
   </button>
   <span class="offer-command">이 종이를 쳐서 계속</span>
  </div>
 </div>
 <header class="ftop">
  <button class="pill" id="fightBack" type="button" aria-label="운세 풀이로 돌아가기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
  <div class="gauge" aria-hidden="true">
   <div class="grow"><span class="gname">천지신명</span><span class="kd" id="kdPips"><i></i><i></i><i></i></span><small id="gaugePct">100%</small></div>
   <div class="bar"><b id="gaugeLag"></b><i id="gaugeFill"></i><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>
   <span id="defeatCount" hidden>족친 천지신명 0놈</span>
   <span id="freeCount" hidden></span>
  </div>
  <button class="pill" id="soundBtn" type="button" aria-label="소리 끄고 켜기" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16 8.5c2.2 2 2.2 5 0 7M18.8 5.5c4.2 3.6 4.2 9.4 0 13"/><path class="mute" d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg></button>
  <button class="pill" id="settingsBtn" type="button" aria-label="설정"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.6" fill="#fff"/><circle cx="15" cy="17" r="2.6" fill="#fff"/></svg></button>
 </header>
 <div id="freeBar" role="group" aria-label="천지신명 정육공장" hidden><button type="button" id="freeNext" disabled>걸기</button><button type="button" id="freeRevive" disabled>재생</button><button type="button" id="freeView" aria-pressed="false" disabled>둘러보기</button><button type="button" id="freePhoto" hidden>사진 저장</button></div>
 <div class="dock" id="dock">
  <div class="hint off" id="hint"></div>
  <div class="panel tools" id="tools" role="group" aria-label="무기">
   <button class="tool on" type="button" data-tool="hand" aria-label="맨주먹"><span class="card" style="--c:#cf2f2a"><svg class="art" viewBox="0 0 48 48"><use href="#fi-fist"/></svg><span class="nm">맨주먹</span></span></button>
   <button class="tool" type="button" data-tool="knife" aria-label="식칼"><span class="card" style="--c:#3a6ea8"><svg class="art" viewBox="0 0 48 48"><use href="#fi-knife"/></svg><span class="nm">식칼</span></span></button>
   <button class="tool" type="button" data-tool="gun" aria-label="권총"><span class="card" style="--c:#6a4cc0"><svg class="art" viewBox="0 0 48 48"><use href="#fi-gun"/></svg><span class="nm">권총</span></span><span class="ammo" id="ammo" hidden>8</span></button>
  </div>
 </div>
 <div id="crumpleHint" class="off" role="status" aria-live="polite">종이를 꾹 눌러 구겨 보세요</div>
 <div class="sr" id="heldFortuneText"></div>
 <div class="modal" id="settingsModal" hidden>
  <div class="msheet" role="dialog" aria-modal="true" aria-labelledby="fSetTitle">
   <button class="pill close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
   <h2 id="fSetTitle">설정</h2>
   <div class="row">소리<button class="switch" id="swSound" type="button" role="switch" aria-checked="true" aria-label="소리"></button></div>
   <div class="audio-levels">
    <label for="vol-music">배경음악<output id="volume-music" for="vol-music">100%</output></label><input id="vol-music" type="range" min="0" max="100" step="5" value="100">
    <label for="vol-effects">효과음<output id="volume-effects" for="vol-effects">100%</output></label><input id="vol-effects" type="range" min="0" max="100" step="5" value="100">
    <label for="vol-voice">음성<output id="volume-voice" for="vol-voice">100%</output></label><input id="vol-voice" type="range" min="0" max="100" step="5" value="100">
   </div>
   <div class="row">진동<button class="switch" id="swVibe" type="button" role="switch" aria-checked="true" aria-label="진동"></button></div>
   <div class="row">화면 흔들림<button class="switch" id="swShake" type="button" role="switch" aria-checked="true" aria-label="화면 흔들림"></button></div>
   <div class="row"><div>피<small>끄면 피 대신 먼지가 납니다.</small></div><button class="switch" id="swBlood" type="button" role="switch" aria-checked="true" aria-label="피"></button></div>
   <div class="row"><div>살 변형<small>맞은 자리가 파이고 뜯깁니다. 느린 기기는 끄세요.</small></div><button class="switch" id="swDeform" type="button" role="switch" aria-checked="true" aria-label="살 변형"></button></div>
   <button class="btn soft" id="resetFight" type="button" style="margin-top:16px">처음부터 다시</button>
  </div>
 </div>
 <div id="again" hidden><p class="defeat-total" id="endDefeatCount" aria-live="polite" hidden>족친 천지신명 0놈</p><button type="button" class="btn danger" id="againBtn">후임 천지신명도 족치러 가기</button><button type="button" class="btn" id="freeBtn" aria-live="polite">천지신명 정육공장</button><p id="freeEntryError" role="alert" hidden></p><button type="button" class="btn" id="trophyBtn">족친 기록</button></div>
 <div class="modal" id="trophyModal" hidden>
  <section class="trophy-sheet" role="dialog" aria-modal="true" aria-labelledby="trophyTitle">
   <header class="trophy-top"><h2 id="trophyTitle">족친 기록</h2><button type="button" id="trophyClose" aria-label="닫기">×</button></header>
   <div class="trophy-view"><img id="trophyImage" alt="족친 천지신명 기록" hidden></div>
   <nav id="trophyPages" aria-label="전리품 이미지 페이지" hidden><button type="button" id="trophyPrev" aria-label="이전 이미지">←</button><span id="trophyPageLabel"></span><button type="button" id="trophyNext" aria-label="다음 이미지">→</button></nav>
   <div class="trophy-actions"><a class="btn danger" id="trophySave" hidden>이미지 저장</a></div>
   <p id="trophyStatus" role="status" aria-live="polite"></p>
   <div class="trophy-reset"><button type="button" id="trophyReset">기록 초기화</button><div id="trophyResetConfirm" hidden><p id="trophyResetQuestion"></p><button type="button" id="trophyResetNo">취소</button><button type="button" id="trophyResetYes">초기화</button></div></div>
  </section>
 </div>
 <div class="modal" id="factoryPhotoModal" hidden>
  <section class="trophy-sheet" role="dialog" aria-modal="true" aria-labelledby="factoryPhotoTitle">
   <header class="trophy-top"><h2 id="factoryPhotoTitle">천지신명 정육공장</h2><button type="button" id="factoryPhotoClose" aria-label="닫기">×</button></header>
   <div class="trophy-view"><img id="factoryPhotoImage" alt="천지신명 정육공장 경관" hidden></div>
   <div class="trophy-actions"><a class="btn danger" id="factoryPhotoSave" hidden>이미지 저장</a></div>
   <p id="factoryPhotoStatus" role="status" aria-live="polite"></p>
   <p class="factory-photo-tip">휴대폰에서는 사진을 길게 눌러 저장할 수도 있습니다.</p>
  </section>
 </div>
 <div id="fallback" role="alert" aria-live="assertive" hidden><div id="fallbackTitle">들어가는 중…</div><small id="fallbackDetail">잠깐만요.</small><button class="btn soft" id="retryGame" type="button" hidden style="width:auto;margin-top:10px">다시 시도</button></div>
</section>`;

const FIGHT_ICONS = `
<symbol id="fi-fist" viewBox="0 0 48 48">
 <!-- 맨주먹: 정면에서 본 꽉 쥔 주먹(손가락 마디 네 개가 앞을 보고, 엄지가 그 아래를 가로지른다). 붕대·너클 없이 맨살 -->
 <path d="M18.5 33h11.5v10H18.5z" fill="#e9a67c" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M10.2 21.5h27.6v10.5c0 3.2-2.6 5.8-5.8 5.8H16c-3.2 0-5.8-2.6-5.8-5.8z" fill="#f1b188" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <g fill="#f1b188" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round">
  <rect x="10.2" y="13.6" width="6.9" height="13.2" rx="3.4"/>
  <rect x="17.3" y="11.4" width="6.9" height="15.4" rx="3.4"/>
  <rect x="24.4" y="11.8" width="6.9" height="15" rx="3.4"/>
  <rect x="31.5" y="14" width="6.5" height="12.8" rx="3.2"/>
 </g>
 <g fill="#fbd3b8"><ellipse cx="13.6" cy="16.2" rx="1.8" ry="1.2"/><ellipse cx="20.7" cy="14" rx="1.8" ry="1.2"/><ellipse cx="27.8" cy="14.4" rx="1.8" ry="1.2"/><ellipse cx="34.7" cy="16.6" rx="1.6" ry="1.1"/></g>
 <path d="M8.6 27.6h22.2c2.2 0 3.9 1.7 3.9 3.9s-1.7 3.9-3.9 3.9H8.6z" fill="#f1b188" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M11.5 31.5h18" fill="none" stroke="#c57c54" stroke-width="1.6" stroke-linecap="round"/>
</symbol>
<symbol id="fi-knife" viewBox="0 0 48 48">
 <path d="M7 41l11-11" stroke="#241c2b" stroke-width="9" stroke-linecap="round"/><path d="M7 41l11-11" stroke="#3a2f2a" stroke-width="5.5" stroke-linecap="round"/>
 <circle cx="10.5" cy="37.5" r="1.3" fill="#d9c08a"/><circle cx="14.5" cy="33.5" r="1.3" fill="#d9c08a"/>
 <path d="M16 31L30.5 13.5 42 11.5l-.8 11.2L26 34H20z" fill="#dce5eb" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M22 31.5L39.5 17" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
 <path d="M17 29.8l4.2 4.2" stroke="#717985" stroke-width="2.2" stroke-linecap="round"/>
</symbol>
<symbol id="fi-gun" viewBox="0 0 48 48">
 <path d="M6 16h35v9H24l-2 4-1 11h-9l1.6-13-2.6-2z" fill="#3b3d45" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M9 19h28" stroke="#787b85" stroke-width="1.7"/>
 <path d="M26 16v9M30 16v9M34 16v9" stroke="#2a2b32" stroke-width="1.3"/>
 <path d="M20 25c0 3 2 5 5 5" fill="none" stroke="#241c2b" stroke-width="2.3" stroke-linecap="round"/>
 <path d="M41 18h3" stroke="#241c2b" stroke-width="2.6" stroke-linecap="round"/>
</symbol>
`;

/* 타격 효과음 글자용 붓글씨 폰트(Gugi): 평소 UI 폰트와 확 다른 먹글씨 느낌. 말풍선은 바퀴벌레 게임과 같은 손글씨(Gaegu).
 * 이 파일은 사주 풀이가 뜰 때 미리 받아 두므로, 그때 폰트 목록도 붙여 둔다(족치기를 열 때 말풍선 글씨가 이미 준비되게) */
try{const fl=document.createElement('link');fl.rel='stylesheet';fl.href='https://fonts.googleapis.com/css2?family=Gaegu:wght@700&family=Gugi&family=Black+Han+Sans&display=swap';fl.onload=()=>{try{window.PaljaGame&&window.PaljaGame.fonts&&window.PaljaGame.fonts();}catch(_){}};document.head.appendChild(fl);}catch(_){}

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
  const leave=()=>{const f=document.getElementById('fight');if(f)f.hidden=true;if(window.__paljaLeave)window.__paljaLeave();};
  // 3D를 띄울 수 없는 기기: 풀이 끝에서 종이로 줄어들지 않고, index.html이 이 이유를 안내창으로 보여 준다
  window.PaljaGame={failed:String(err&&err.message||err).slice(0,160)||'3D 화면을 만들지 못했습니다.',enter(){
   const f=document.getElementById('fight');if(!f)return;f.hidden=false;
   document.getElementById('dock').hidden=true;
   f.querySelector('.gauge').hidden=true;document.getElementById('soundBtn').hidden=true;document.getElementById('settingsBtn').hidden=true;
   document.getElementById('fightBack').onclick=leave;fb.hidden=false;
  },leave,pause(){}};
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
/* 말풍선 글자가 찍히는 박자(초): 글자 하나 · 띄어쓰기 · 문장부호. speed가 크면 빨라진다.
 * 목소리(AUDIO.speak)도 같은 박자로 난다. 바퀴벌레 게임과 같은 값 */
const TYPE={syl:.072,space:.05,punct:.17};
function typeSteps(text,speed=1){
 const steps=[];let t=0;
 for(const ch of Array.from(String(text))){const kind=/\s/.test(ch)?'space':/[.,!?…~]/.test(ch)?'punct':'syl';steps.push({t,ch,kind});t+=(kind==='space'?TYPE.space:kind==='punct'?TYPE.punct:TYPE.syl)/speed;}
 return {steps,total:t};
}
const typeTime=(text,speed=1)=>typeSteps(text,speed).total;

/* 스프링: 맞을 때 튕겼다 돌아오는 움직임은 전부 이것으로 만든다 */
class Spring{
 constructor(k=140,c=13,x=0){this.k=k;this.c=c;this.x=x;this.v=0;this.t=0;}
 step(dt){const n=dt>.017?Math.ceil(dt/.0166):1,h=dt/n;for(let i=0;i<n;i++){this.v+=(-this.k*(this.x-this.t)-this.c*this.v)*h;this.x+=this.v*h;}if(!Number.isFinite(this.x)){this.x=this.t;this.v=0;}return this.x;}
 kick(i){this.v+=i;return this;}
 // 맞는 순간 바로 그 자리로 옮긴다(멈춤 동안에도 맞은 모습이 보이게). 너무 멀리는 못 가게 막는다
 push(d,lim=1.2){this.x=clamp(this.x+d,this.t-lim,this.t+lim);return this;}
 reset(x=0){this.x=x;this.t=x;this.v=0;return this;}
}
class Spring3{
 constructor(k,c){this.x=new Spring(k,c);this.y=new Spring(k,c);this.z=new Spring(k,c);}
 step(dt){this.x.step(dt);this.y.step(dt);this.z.step(dt);return this;}
 kick(x,y,z){this.x.kick(x);this.y.kick(y);this.z.kick(z);return this;}
 push(x,y,z,lim){this.x.push(x,lim);this.y.push(y,lim);this.z.push(z,lim);return this;}
 reset(){this.x.reset();this.y.reset();this.z.reset();return this;}
 get X(){return this.x.x;} get Y(){return this.y.x;} get Z(){return this.z.x;}
}

/* 캔버스로 그린 텍스처
 * 텍스처용 캔버스는 CPU 메모리에 둔다(willReadFrequently). 창을 내려 두면 크롬이 GPU 프로세스를 죽였다 되살리는데,
 * 그때 GPU에 있던 2D 캔버스 내용은 전부 지워지고 three.js는 그 빈 캔버스를 다시 올려 텍스처가 모두 검게 됐다.
 * CPU 캔버스는 그 과정에서 지워지지 않고, 혹시 지워지면(contextrestored) 처음 그린 함수로 다시 그린다. */
const TEX_CTX={willReadFrequently:true};
function canvasTex(w,h,draw,o={}){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',TEX_CTX);draw(g,w,h,c);
 const t=new THREE.CanvasTexture(c);if(o.srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
 if(o.repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(o.repeat[0],o.repeat[1]);}
 if(!t.userData)t.userData={};t.userData.canvas=c;t.userData.ctx=g;
 c.addEventListener('contextrestored',()=>{try{g.clearRect(0,0,w,h);draw(g,w,h,c);}catch(_){}t.needsUpdate=true;});
 return t;
}
/* 비늘: 아래로 겹치는 둥근 비늘을 줄마다 반 칸씩 밀어 깐다(dx·dy는 비늘 간격, 픽셀).
 * 폭이 dx의 정수배, 높이가 dy의 짝수배면 이어 붙여도 이음매가 없다 */
function drawScales(g,w,h,dx,dy,pal){
 const P=pal||['#3e6219','#78a131','#bcd65e','#8fb13d','#22380e'];
 for(let row=-1;row*dy<h+dy;row++)for(let c=-1;c*dx<w+dx;c++){const x=c*dx+(((row%2)+2)%2)*dx/2,y=row*dy;
  const gr=g.createLinearGradient(0,y-dy*.66,0,y+dy*.6);gr.addColorStop(0,P[0]);gr.addColorStop(.55,P[1]);gr.addColorStop(.85,P[2]);gr.addColorStop(1,P[3]);
  g.fillStyle=gr;g.beginPath();g.moveTo(x-dx*.52,y-dy*.4);g.quadraticCurveTo(x-dx*.52,y+dy*.66,x,y+dy*.72);g.quadraticCurveTo(x+dx*.52,y+dy*.66,x+dx*.52,y-dy*.4);g.closePath();g.fill();
  g.lineWidth=Math.max(1,dx*.08);g.strokeStyle=P[4];g.stroke();
  g.fillStyle='rgba(255,255,220,.3)';g.beginPath();g.ellipse(x-dx*.15,y+dy*.12,dx*.16,dy*.13,-.5,0,TAU);g.fill();}
}

/* 살 셰이더를 쓰는 재질이면 지오메트리에 손상 값(aDmg)이 꼭 있어야 한다(없으면 기기마다 아무 값이나 들어간다) */
function ensureDmg(geo){if(geo&&geo.attributes&&geo.attributes.position&&!geo.attributes.aDmg)geo.setAttribute('aDmg',new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count*4),4));return geo;}
function isFleshMat(mat){if(Array.isArray(mat))return mat.some(isFleshMat);return !!(mat&&mat.userData&&mat.userData.fleshKind);}
/* 지오메트리를 좌우로 뒤집는다(삼각형 감는 방향도 뒤집어 앞면이 그대로 앞을 보게) */
function mirrorX(g){const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++){P.setX(i,-P.getX(i));if(N)N.setX(i,-N.getX(i));}
 if(g.index){const a=g.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}g.index.needsUpdate=true;}
 P.needsUpdate=true;if(N)N.needsUpdate=true;g.computeBoundingSphere();return g;}
/* 메시 만들기 도우미 */
function mk(geo,mat,parent,o={}){
 if(isFleshMat(mat))ensureDmg(geo);
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
// 도마뱀 발톱·돌기(끝이 아래를 향한 뿔): 한 번 만들어 같이 쓴다
function clawGeo(){return GEO.claw||(GEO.claw=(()=>{const g=new THREE.ConeGeometry(1,1,6);g.rotateX(PI);return g;})());}
function capsuleGeo(r,len,seg=16){
 const pts=[],n=8;
 for(let i=0;i<=n;i++){const a=-PI/2+i/n*PI/2;pts.push(new THREE.Vector2(Math.cos(a)*r,-len/2+Math.sin(a)*r));}
 for(let i=0;i<=n;i++){const a=i/n*PI/2;pts.push(new THREE.Vector2(Math.cos(a)*r,len/2+Math.sin(a)*r));}
 pts[0].x=0.0001;pts[pts.length-1].x=0.0001;
 return new THREE.LatheGeometry(pts,seg);
}
// 다시 자랄 때 뼈를 감싸는 날살 한 마디: 알약 모양이 아니라 가운데가 불룩한 근육 덩어리 둘이 겹친 모양(양끝은 가늘게)
function muscleGeo(r,len,seg=18){
 const pts=[],n=22;
 for(let i=0;i<=n;i++){const t=i/n,y=-len/2+t*len;
  const belly=.64+.36*Math.sin(PI*t),twin=1+.1*Math.sin(TAU*t*2+.9),tip=1-Math.pow(1-Math.sin(PI*t),8)*.75;
  pts.push([Math.max(.0001,r*belly*twin*tip),y]);}
 pts[0][0]=.0001;pts[n][0]=.0001;
 return latheGeo(pts,seg);
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
 for(const list of groups.values()){if(list.length<2)continue;const g=mergeMeshes(list,inv);const a=list[0];if(isFleshMat(a.material))ensureDmg(g);const m=new THREE.Mesh(g,a.material);m.castShadow=a.castShadow;m.receiveShadow=a.receiveShadow;m.userData=Object.assign({},a.userData);for(const o of list)o.removeFromParent();parent.add(m);}
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
  const A=new Float32Array(tri*9),bounds=new Uint8Array(tri*6),counts=new Uint32Array(nx*ny*nz);
  const raw=pos.isInterleavedBufferAttribute||pos.normalized?null:pos.array,bins=new Uint8Array(pos.count*3);
  // Quantize each vertex once. Monotonic floor/clamp gives exactly the same
  // triangle cell bounds as quantizing each triangle's min/max six times.
  for(let v=0;v<pos.count;v++){
   const q=v*pos.itemSize,x=raw?raw[q]:pos.getX(v),y=raw?raw[q+1]:pos.getY(v),z=raw?raw[q+2]:pos.getZ(v);
   const i=Math.floor((x-bb.min.x)/cx),j=Math.floor((y-bb.min.y)/cy),k=Math.floor((z-bb.min.z)/cz);
   bins[v*3]=clamp(i,0,nx-1);bins[v*3+1]=clamp(j,0,ny-1);bins[v*3+2]=clamp(k,0,nz-1);
  }
  for(let t=0;t<tri;t++){
   let i0=255,j0=255,k0=255,i1=0,j1=0,k1=0;
   for(let k=0;k<3;k++){
    const vi=idx?idx[t*3+k]:t*3+k,q=vi*pos.itemSize,o=t*9+k*3,v=vi*3;
    A[o]=raw?raw[q]:pos.getX(vi);A[o+1]=raw?raw[q+1]:pos.getY(vi);A[o+2]=raw?raw[q+2]:pos.getZ(vi);
    const x=bins[v],y=bins[v+1],z=bins[v+2];
    if(x<i0)i0=x;if(y<j0)j0=y;if(z<k0)k0=z;if(x>i1)i1=x;if(y>j1)j1=y;if(z>k1)k1=z;
   }
   const q=t*6;bounds[q]=i0;bounds[q+1]=i1;bounds[q+2]=j0;bounds[q+3]=j1;bounds[q+4]=k0;bounds[q+5]=k1;
   for(let k=k0;k<=k1;k++)for(let j=j0;j<=j1;j++){const row=nx*(j+ny*k);for(let i=i0;i<=i1;i++)counts[row+i]++;}
  }
  // One contiguous allocation replaces thousands of growing JS arrays. Preserve
  // ascending triangle order within every cell, including equal-distance hits.
  const offsets=new Uint32Array(counts.length+1);for(let i=0;i<counts.length;i++)offsets[i+1]=offsets[i]+counts[i];
  const entries=new Int32Array(offsets[counts.length]),cursor=offsets.slice(0,-1);
  for(let t=0;t<tri;t++){const q=t*6;
   for(let k=bounds[q+4];k<=bounds[q+5];k++)for(let j=bounds[q+2];j<=bounds[q+3];j++){const row=nx*(j+ny*k);for(let i=bounds[q];i<=bounds[q+1];i++)entries[cursor[row+i]++]=t;}
  }
  const cells=Array.from(counts,(n,i)=>n?entries.subarray(offsets[i],offsets[i+1]):null);
  return {bb,nx,ny,nz,cx,cy,cz,cells,A,mark:new Uint32Array(tri),stamp:1};
 }
 // Cell membership is immutable. Mutable vertices, marks and bounds are never shared.
 function copy(G){return {...G,bb:G.bb.clone(),A:G.A.slice(),mark:new Uint32Array(G.mark.length),stamp:1};}
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
 // 지역 좌표 반직선(원점 o, 방향 d 단위벡터, 길이 tmax)이 처음 닿는 앞면 삼각형: 지나가는 칸만 차례로 본다(3D DDA)
 function ray(G,o,d,tmax,out){
  const bb=G.bb;let t0=0,t1=tmax;
  const O=[o.x,o.y,o.z],D=[d.x,d.y,d.z],MN=[bb.min.x,bb.min.y,bb.min.z],MX=[bb.max.x,bb.max.y,bb.max.z];
  for(let k=0;k<3;k++){
   if(Math.abs(D[k])<1e-12){if(O[k]<MN[k]-1e-6||O[k]>MX[k]+1e-6)return false;continue;}
   let a=(MN[k]-O[k])/D[k],b=(MX[k]-O[k])/D[k];if(a>b){const t=a;a=b;b=t;}
   if(a>t0)t0=a;if(b<t1)t1=b;if(t0>t1)return false;
  }
  const N=[G.nx,G.ny,G.nz],C=[G.cx,G.cy,G.cz],I=[0,0,0],step=[0,0,0],tM=[0,0,0],tD=[0,0,0];
  for(let k=0;k<3;k++){
   const p=O[k]+D[k]*(t0+1e-7);I[k]=clamp(Math.floor((p-MN[k])/C[k]),0,N[k]-1);
   if(D[k]>1e-12){step[k]=1;tM[k]=(MN[k]+(I[k]+1)*C[k]-O[k])/D[k];tD[k]=C[k]/D[k];}
   else if(D[k]<-1e-12){step[k]=-1;tM[k]=(MN[k]+I[k]*C[k]-O[k])/D[k];tD[k]=-C[k]/D[k];}
   else{step[k]=0;tM[k]=Infinity;tD[k]=Infinity;}
  }
  G.stamp++;if(G.stamp>4e9){G.mark.fill(0);G.stamp=1;}
  const st=G.stamp,A=G.A,dx=D[0],dy=D[1],dz=D[2];let best=Infinity,bi=-1,guard=0;
  while(guard++<200){
   const c=G.cells[I[0]+G.nx*(I[1]+G.ny*I[2])];
   if(c)for(let q=0;q<c.length;q++){const t=c[q];if(G.mark[t]===st)continue;G.mark[t]=st;const k=t*9;
    const v0x=A[k],v0y=A[k+1],v0z=A[k+2];
    const e1x=A[k+3]-v0x,e1y=A[k+4]-v0y,e1z=A[k+5]-v0z,e2x=A[k+6]-v0x,e2y=A[k+7]-v0y,e2z=A[k+8]-v0z;
    const px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x;
    const det=e1x*px+e1y*py+e1z*pz;if(det<1e-14)continue;
    const inv=1/det,sx=O[0]-v0x,sy=O[1]-v0y,sz=O[2]-v0z;
    const u=(sx*px+sy*py+sz*pz)*inv;if(u<0||u>1)continue;
    const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x;
    const v=(dx*qx+dy*qy+dz*qz)*inv;if(v<0||u+v>1)continue;
    const tt=(e2x*qx+e2y*qy+e2z*qz)*inv;if(tt<0||tt>tmax||tt>=best)continue;
    best=tt;bi=t;
   }
   const ax=tM[0]<tM[1]?(tM[0]<tM[2]?0:2):(tM[1]<tM[2]?1:2);
   if(best<=tM[ax]||tM[ax]>t1)break;
   I[ax]+=step[ax];if(I[ax]<0||I[ax]>=N[ax])break;tM[ax]+=tD[ax];
  }
  if(bi<0)return false;
  const k=bi*9;_e1.set(A[k+3]-A[k],A[k+4]-A[k+1],A[k+5]-A[k+2]);_e2.set(A[k+6]-A[k],A[k+7]-A[k+1],A[k+8]-A[k+2]);
  out.t=best;out.tri=bi;out.normal.crossVectors(_e1,_e2).normalize();return true;
 }
 return {grid,segment,ray,copy};
})();

/* ===== 2-2. 살덩이(찌그러지고 파이고 썰리는 메시) =====
 * 운명 설계자의 살·옷은 전부 이 메시로 만든다. 맞을 때마다 꼭짓점을 실제로 옮겨서 모양이 바뀐다(되돌아가지 않는다).
 * 꼭짓점마다 손상 값 aDmg를 들고 있다: x=멍, y=살이 드러남(찢긴 테 → 비늘 → 속살 순으로 칠해짐), z=비늘, w=피가 배어 듦.
 * 총알·칼이 지나간 자리는 삼각형을 잘게 쪼갠 다음 파낸다(구멍 가장자리가 각지지 않게). */
const FLESH=(()=>{
 const NOISE3=`
float fh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float fn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(fh3(i),fh3(i+vec3(1,0,0)),f.x),mix(fh3(i+vec3(0,1,0)),fh3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(fh3(i+vec3(0,0,1)),fh3(i+vec3(1,0,1)),f.x),mix(fh3(i+vec3(0,1,1)),fh3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float ffb3(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*fn3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
// 둥근 비늘 무늬(0..1, 비늘 가운데 밝고 사이 홈은 어둡다)
float fscale(vec3 p){vec3 q=p*vec3(1.,1.25,1.);vec2 uv=vec2(q.x+q.z*.7,q.y-q.z*.35);uv.x+=floor(uv.y)*.5;vec2 f=fract(uv)-.5;return smoothstep(.5,.18,length(f*vec2(1.,1.15)));}
`;
 // 종류별 색: 멍(살)·옷이 더러워지는 색·찢긴 테·속살(깊은 곳/중간/기름)·비늘
 const KIND={
  skin:{bruise:'#7a2350',bruise2:'#2b0c2e',rim:'#ffe2d6',dirty:0},
  cloth:{bruise:'#8a7a9a',bruise2:'#4a3f5c',rim:'#fffaf0',dirty:1},
  trouser:{bruise:'#8a7f8e',bruise2:'#4b4256',rim:'#fffaf0',dirty:1},
  liz:{bruise:'#2f4410',bruise2:'#141e05',rim:'#d9f08a',dirty:0},
 };
 const MEAT={deep:col('#2a0a3a'),mid:col('#8c2a62'),hi:col('#e86f8f'),fat:col('#ffe4ea'),scale:col('#5f8f1f'),scaleD:col('#1f3a0a'),soak:col('#1c3fb0')};
 const shared={uTime:{value:0}};
 function patch(mat,kind='skin',o={}){
  const K=KIND[kind]||KIND.skin;
  const U={uBr:{value:col(K.bruise)},uBr2:{value:col(K.bruise2)},uRim:{value:col(K.rim)},uDirty:{value:K.dirty},
   uDeep:{value:MEAT.deep},uMid:{value:MEAT.mid},uHi:{value:MEAT.hi},uFat:{value:MEAT.fat},uSc:{value:MEAT.scale},uScD:{value:MEAT.scaleD},uSoak:{value:MEAT.soak},
   uMeatScale:{value:o.meatScale||70},uLiz:{value:kind==='liz'?1:0},uSSS:{value:o.sss||0}};
  mat.userData.fleshKind=kind;mat.userData.fleshU=U;
  mat.onBeforeCompile=sh=>{
   Object.assign(sh.uniforms,U);
   sh.vertexShader='attribute vec4 aDmg;\nvarying vec4 vDmg;\nvarying vec3 vOP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvDmg=aDmg;vOP=position;');
   sh.fragmentShader='varying vec4 vDmg;\nvarying vec3 vOP;\nuniform vec3 uBr,uBr2,uRim,uDeep,uMid,uHi,uFat,uSc,uScD,uSoak;uniform float uDirty,uMeatScale,uLiz,uSSS;\n'+NOISE3+
    sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 {float ndv=clamp(dot(normal,normalize(vViewPosition)),0.,1.);totalEmissiveRadiance+=diffuseColor.rgb*vec3(1.,.4,.34)*(pow(1.-ndv,2.6)*.34+.05)*uSSS;}`).replace('#include <color_fragment>',`#include <color_fragment>
 if(vDmg.x+vDmg.y+vDmg.z+vDmg.w>.0005){
  vec3 P=vOP*uMeatScale;
  float nA=ffb3(P),nB=fn3(P*2.7+3.3);
  float br=clamp(vDmg.x,0.,1.5);
  vec3 bc=mix(uBr,uBr2,smoothstep(.55,1.25,br));
  float bw=smoothstep(.04,.75,br+(nA-.5)*.25);
  diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb*bc*2.2,bc*(.7+.6*nB),.5+uDirty*.3),bw*(.78-uDirty*.25));
  float sc=clamp(vDmg.z,0.,1.);
  float sp=fscale(vOP*95.);
  vec3 scc=mix(uScD,uSc,sp)*(.85+.3*nB);
  diffuseColor.rgb=mix(diffuseColor.rgb,scc,smoothstep(.15,.6,sc+(nA-.5)*.3)*(1.-uLiz));
  float raw=clamp(vDmg.y+(nA-.5)*.32,0.,1.2);
  float rim=smoothstep(.08,.2,raw)*(1.-smoothstep(.24,.36,raw));
  float scl=smoothstep(.26,.36,raw)*(1.-smoothstep(.44,.54,raw));
  float in1=smoothstep(.46,.62,raw);
  vec3 meat=mix(uMid,uHi,smoothstep(.35,.75,nB));
  meat=mix(meat,uFat,smoothstep(.62,.7,fn3(P*.8+vec3(5.1,1.3,7.7)))*.75);
  meat=mix(meat,uDeep,smoothstep(.7,1.05,raw)*.85+(1.-nA)*.15);
  diffuseColor.rgb=mix(diffuseColor.rgb,uRim,rim*.92);
  diffuseColor.rgb=mix(diffuseColor.rgb,mix(uScD,uSc,sp),scl*.95);
  diffuseColor.rgb=mix(diffuseColor.rgb,meat,in1);
  float so=clamp(vDmg.w,0.,1.);
  diffuseColor.rgb=mix(diffuseColor.rgb,uSoak*(.6+.5*nA),smoothstep(.1,.8,so+(nA-.5)*.4)*.8);
 }`).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 {float rw=smoothstep(.46,.62,clamp(vDmg.y,0.,1.));roughnessFactor=mix(roughnessFactor,.2,rw);roughnessFactor=mix(roughnessFactor,.28,smoothstep(.2,.8,vDmg.w)*.7);}`);
  };
  mat.customProgramCacheKey=()=>'flesh2';
  mat.needsUpdate=true;return mat;
 }

 /* ---- 메시 ---- */
 // Only explicit clones of immutable source geometry can use these templates.
 // Dynamic positions, damage, displacement and ray stamps remain private to each body.
 const sources=new WeakMap(),templates=new WeakMap();
 function clone(g){const copy=g.clone();copy.userData={...g.userData};delete copy.userData.fastGrid;sources.set(copy,g);return copy;}
 const _v1=V3(),_v2=V3(),_v3=V3();
 /* 옮겨진 꼭짓점 찾기 나무(k-d 나무): 한 번 맞을 때 옮겨진 꼭짓점(주먹이면 수천~수만 개)마다 거기 붙은 피·상처 점(수천~1만 개)이
  * 가장 가까운 것을 찾는다. 하나하나 다 훑으면 (점 수 × 꼭짓점 수)라 칼질 뒤 주먹 한 대에 수백 ms씩 멈췄다.
  * 꼭짓점을 축마다 반씩 갈라 나무로 세우고 가지마다 실제 점들을 감싸는 상자를 둔다. 가까운 가지부터 내려가며,
  * 상자가 지금까지 찾은 것보다 먼 가지는 건너뛴다. 같은 거리면 앞 번호를 고르므로 다 훑을 때와 결과가 똑같다. */
 const KD_LEAF=8,KD_SR=new Int32Array(2*256),KD_SD=new Float64Array(256);
 function kdSwap(a,i,j){const t=a[i];a[i]=a[j];a[j]=t;}
 // ids[left..right]에서 k번째(axis 좌표 기준)를 제자리에 놓고, 왼쪽은 작거나 같게·오른쪽은 크거나 같게 나눈다(Floyd–Rivest)
 function kdSelect(ids,P,k,left,right,axis){
  while(right>left){
   if(right-left>600){const n=right-left+1,m=k-left+1,z=Math.log(n),s=.5*Math.exp(2*z/3),sd=.5*Math.sqrt(z*s*(n-s)/n)*(m-n/2<0?-1:1);
    kdSelect(ids,P,k,Math.max(left,Math.floor(k-m*s/n+sd)),Math.min(right,Math.floor(k+(n-m)*s/n+sd)),axis);}
   const t=P[ids[k]*3+axis];let i=left,j=right;
   kdSwap(ids,left,k);if(P[ids[right]*3+axis]>t)kdSwap(ids,left,right);
   while(i<j){kdSwap(ids,i,j);i++;j--;while(P[ids[i]*3+axis]<t)i++;while(P[ids[j]*3+axis]>t)j--;}
   if(P[ids[left]*3+axis]===t)kdSwap(ids,left,j);else{j++;kdSwap(ids,j,right);}
   if(j<=k)left=j+1;if(k<=j)right=j-1;
  }
 }
 function kdBuild(P,n){
  // 좌표가 망가진 점은 어차피 가장 가까운 것으로 뽑히지 않으니 빼고 세운다
  const ids=new Int32Array(n);let c=0;
  for(let j=0;j<n;j++){const x=P[j*3],y=P[j*3+1],z=P[j*3+2];if(Math.abs(x)<1e9&&Math.abs(y)<1e9&&Math.abs(z)<1e9)ids[c++]=j;}
  const B=new Float64Array(c*6);if(!c)return {ids,n:0,B};
  // 위에서 아래로 가르며 마디를 적어 두고(부모가 먼저), 거꾸로 돌며 상자를 모은다(자식이 먼저). 상자는 마디 가운데 번호 자리에 둔다
  const order=new Int32Array(c*2+2);let no=0;const st=[0,c-1,0];
  while(st.length){const axis=st.pop(),right=st.pop(),left=st.pop();if(right<left)continue;order[no++]=left;order[no++]=right;
   if(right-left<=KD_LEAF)continue;const m=(left+right)>>1;kdSelect(ids,P,m,left,right,axis);const na=axis===2?0:axis+1;st.push(left,m-1,na,m+1,right,na);}
  for(let q=no-2;q>=0;q-=2){const left=order[q],right=order[q+1],m=(left+right)>>1,o=m*6;let x0,y0,z0,x1,y1,z1;
   if(right-left<=KD_LEAF){x0=y0=z0=Infinity;x1=y1=z1=-Infinity;for(let i=left;i<=right;i++){const j=ids[i]*3,x=P[j],y=P[j+1],z=P[j+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}}
   else{const j=ids[m]*3,a=((left+m-1)>>1)*6,b=((m+1+right)>>1)*6;
    x0=Math.min(P[j],B[a],B[b]);y0=Math.min(P[j+1],B[a+1],B[b+1]);z0=Math.min(P[j+2],B[a+2],B[b+2]);
    x1=Math.max(P[j],B[a+3],B[b+3]);y1=Math.max(P[j+1],B[a+4],B[b+4]);z1=Math.max(P[j+2],B[a+5],B[b+5]);}
   B[o]=x0;B[o+1]=y0;B[o+2]=z0;B[o+3]=x1;B[o+4]=y1;B[o+5]=z1;}
  return {ids,n:c,B};
 }
 class Flesh{
  constructor(mesh,o={}){
   this.mesh=mesh;this.o=o;mesh.userData.flesh=this;
   this.kind=o.kind||'skin';this.center=o.center?o.center.clone():null;this.axisA=o.axisA?o.axisA.clone():null;this.axisB=o.axisB?o.axisB.clone():null;
   this.maxFrac=o.maxFrac==null?.42:o.maxFrac;this.maxAbs=o.maxAbs==null?.12:o.maxAbs;this.minEdge=o.minEdge==null?.0055:o.minEdge;this.maxVerts=o.maxVerts||32000;
   this.trans=[];this.toff=null;this.tlist=null;this.dirtyBounds=false;
   this._rayIdle=0;this._rayIdleKind='';this._rayDead=false;
   mesh.frustumCulled=true;
   this.setGeometry(mesh.geometry);
   const self=this;mesh.raycast=function(rc,out){self.raycast(rc,out);};
  }
  // 새 지오메트리(처음 만들 때·쪼갠 뒤·썬 뒤): 지금 모양을 쉬는 모양으로 삼는다
  setGeometry(g,keepDmg){
   this._cancelRayRebuild();this._rayDead=false;
   const source=sources.get(g);sources.delete(g);
   const key=source?JSON.stringify([this.maxFrac,this.maxAbs,this.center&&this.center.toArray(),this.axisA&&this.axisA.toArray(),this.axisB&&this.axisB.toArray(),!!this.o.keepNormals]):'';
   let bank=source&&templates.get(source);const ready=bank&&bank.get(key);
   if(!g.index){const n=g.attributes.position.count,a=new Uint32Array(n);for(let i=0;i<n;i++)a[i]=i;g.setIndex(new THREE.BufferAttribute(a,1));}
   if(!g.attributes.normal)g.computeVertexNormals();
   const n=g.attributes.position.count;this.g=g;this.n=n;
   g.attributes.position.setUsage(THREE.DynamicDrawUsage);g.attributes.normal.setUsage(THREE.DynamicDrawUsage);
   this.pos=g.attributes.position.array;this.nor=g.attributes.normal.array;
   this.rest=Float32Array.from(this.pos);this.restN=Float32Array.from(this.nor);this.disp=new Float32Array(n*3);
   if(g.attributes.aDmg&&g.attributes.aDmg.count===n){this.dmg=g.attributes.aDmg.array;}
   else{this.dmg=new Float32Array(n*4);g.setAttribute('aDmg',new THREE.BufferAttribute(this.dmg,4));}
   g.attributes.aDmg.setUsage(THREE.DynamicDrawUsage);
   if(ready){
    this.cap=ready.cap.slice();this.nor.set(ready.normal);this.restN.set(ready.normal);
    for(const name of ['canon','nc','cvStart','cvList','cfStart','cfList','tri','_wn'])this[name]=ready[name];
    this._wmap=new Map(ready.wmap);
    g.boundingSphere=ready.sphere.clone();g.boundingBox=ready.box.clone();
    g.userData.fastGrid=FASTRAY.copy(ready.grid);
   }else{
    this.cap=new Float32Array(n);
    for(let i=0;i<n;i++)this.cap[i]=this.capAt(this.rest[i*3],this.rest[i*3+1],this.rest[i*3+2]);
    this._weld();this._adj();if(!this.o.keepNormals){this._normals(null);this.restN.set(this.nor);}
    g.computeBoundingSphere();g.computeBoundingBox();delete g.userData.fastGrid;
    if(source){
     if(!bank){bank=new Map();templates.set(source,bank);}
     const data={cap:this.cap.slice(),normal:this.nor.slice(),wmap:new Map(this._wmap),sphere:g.boundingSphere.clone(),box:g.boundingBox.clone(),grid:FASTRAY.copy(FASTRAY.grid(g))};
     for(const name of ['canon','nc','cvStart','cvList','cfStart','cfList','tri','_wn'])data[name]=this[name];
     bank.set(key,data);
    }
   }
   this.trans.length=0;this.toff=null;this.tlist=null;
  }
  // 이 자리에서 안쪽으로 최대 얼마나 들어갈 수 있나(반대편을 뚫고 나가지 않게)
  capAt(x,y,z){
   let r=.2;
   if(this.center){r=Math.hypot(x-this.center.x,y-this.center.y,z-this.center.z);}
   else if(this.axisA){const a=this.axisA,b=this.axisB,abx=b.x-a.x,aby=b.y-a.y,abz=b.z-a.z,l2=abx*abx+aby*aby+abz*abz;let t=l2>0?((x-a.x)*abx+(y-a.y)*aby+(z-a.z)*abz)/l2:0;t=clamp(t,0,1);r=Math.hypot(x-a.x-abx*t,y-a.y-aby*t,z-a.z-abz*t);}
   return Math.min(this.maxAbs,r*this.maxFrac);
  }
  // from: 앞의 from개 꼭짓점은 지난번과 쉬는 자리가 같다(잘게 쪼갠 뒤). 그만큼은 지난 결과를 이어 쓰고 새 꼭짓점만 따진다
  _weld(from){
   const n=this.n,R=this.rest,canon=new Int32Array(n);let map,nc,i0;
   if(from>0&&this._wmap&&this.canon&&this._wn===from&&from<=n){map=this._wmap;nc=this.nc;canon.set(this.canon.subarray(0,from));i0=from;}
   else{map=new Map();nc=0;i0=0;}
   // 세 정수를 숫자 하나로 묶어 찾는다(글자로 이어 붙이면 칼질할 때마다 수만 번 문자열을 만들어 느렸다). 범위를 넘으면 예전처럼 글자로
   for(let i=i0;i<n;i++){const a=Math.round(R[i*3]*2e4),b=Math.round(R[i*3+1]*2e4),q=Math.round(R[i*3+2]*2e4);
    const k=a>-65536&&a<65536&&b>-65536&&b<65536&&q>-65536&&q<65536?((a+65536)*131072+(b+65536))*131072+(q+65536):a+','+b+','+q;
    let c=map.get(k);if(c==null){c=nc++;map.set(k,c);}canon[i]=c;}
   this._wmap=map;this._wn=n;
   this.canon=canon;this.nc=nc;
   // 대표점 → 꼭짓점들
   const cnt=new Int32Array(nc+1);for(let i=0;i<n;i++)cnt[canon[i]+1]++;for(let c=0;c<nc;c++)cnt[c+1]+=cnt[c];
   const list=new Int32Array(n),fill=cnt.slice(0,nc);for(let i=0;i<n;i++)list[fill[canon[i]]++]=i;
   this.cvStart=cnt;this.cvList=list;
  }
  _adj(){
   const idx=this.g.index.array,T=idx.length/3,nc=this.nc,canon=this.canon,cnt=new Int32Array(nc+1);
   for(let t=0;t<T;t++)for(let k=0;k<3;k++)cnt[canon[idx[t*3+k]]+1]++;
   for(let c=0;c<nc;c++)cnt[c+1]+=cnt[c];
   const list=new Int32Array(cnt[nc]),fill=cnt.slice(0,nc);
   for(let t=0;t<T;t++)for(let k=0;k<3;k++)list[fill[canon[idx[t*3+k]]]++]=t;
   this.cfStart=cnt;this.cfList=list;this.tri=T;
  }
  // 바뀐 꼭짓점 둘레의 법선을 다시 계산(같은 자리에 겹친 꼭짓점은 같은 법선)
  _normals(verts){
   const idx=this.g.index.array,P=this.pos,N=this.nor,canon=this.canon,cfS=this.cfStart,cfL=this.cfList,cvS=this.cvStart,cvL=this.cvList;
   const mark=this._nmark||(this._nmark=new Uint32Array(this.nc));if(mark.length<this.nc)this._nmark=new Uint32Array(this.nc);
   const mk=this._nmark;this._nst=(this._nst||0)+1;const st=this._nst;const cs=[];
   const addC=c=>{if(mk[c]!==st){mk[c]=st;cs.push(c);}};
   if(verts===null){for(let c=0;c<this.nc;c++)cs.push(c);}
   else for(const i of verts){const c=canon[i];addC(c);for(let f=cfS[c];f<cfS[c+1];f++){const t=cfL[f];addC(canon[idx[t*3]]);addC(canon[idx[t*3+1]]);addC(canon[idx[t*3+2]]);}}
   for(const c of cs){let nx=0,ny=0,nz=0;
    for(let f=cfS[c];f<cfS[c+1];f++){const t=cfL[f],a=idx[t*3]*3,b=idx[t*3+1]*3,d=idx[t*3+2]*3;
     const e1x=P[b]-P[a],e1y=P[b+1]-P[a+1],e1z=P[b+2]-P[a+2],e2x=P[d]-P[a],e2y=P[d+1]-P[a+1],e2z=P[d+2]-P[a+2];
     nx+=e1y*e2z-e1z*e2y;ny+=e1z*e2x-e1x*e2z;nz+=e1x*e2y-e1y*e2x;}
    const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    for(let k=cvS[c];k<cvS[c+1];k++){const i=cvL[k]*3;N[i]=nx;N[i+1]=ny;N[i+2]=nz;}}
   this.g.attributes.normal.needsUpdate=true;
  }
  // dent는 topology가 그대로라 전체 레이 격자를 버리지 않고 바뀐 삼각형 좌표만 갱신한다.
  _refitRay(verts){
   const g=this.g,G=g.userData.fastGrid;if(!G||!g.index||G.A.length!==this.tri*9)return false;
   let mk=this._rmark;if(!mk||mk.length!==this.tri)mk=this._rmark=new Uint32Array(this.tri);
   this._rst=(this._rst||0)+1;if(this._rst>4e9){mk.fill(0);this._rst=1;}
   const st=this._rst,I=g.index.array,P=this.pos,A=G.A;
   for(const i of verts){const c=this.canon[i];for(let q=this.cfStart[c];q<this.cfStart[c+1];q++){
    const t=this.cfList[q];if(mk[t]===st)continue;mk[t]=st;const o=t*9;
    for(let k=0;k<3;k++){const vi=I[t*3+k]*3,a=o+k*3;A[a]=P[vi];A[a+1]=P[vi+1];A[a+2]=P[vi+2];}
   }}
   return true;
  }
  _cancelRayRebuild(){
   if(!this._rayIdle)return;
   if(this._rayIdleKind==='idle'&&typeof cancelIdleCallback==='function')cancelIdleCallback(this._rayIdle);else clearTimeout(this._rayIdle);
   this._rayIdle=0;this._rayIdleKind='';
  }
  disposeWork(){this._rayDead=true;this._cancelRayRebuild();}
  _scheduleRayRebuild(){
   if(this._rayIdle||this._rayDead)return;
   const g=this.g;
   const rebuild=()=>{
    this._rayIdle=0;this._rayIdleKind='';
    if(this._rayDead||this.g!==g||!g.attributes||!g.attributes.position)return;
    // 연타 중에는 절대 고밀도 격자를 다시 만들지 않고, 손을 멈춘 뒤로 미룬다.
    if(G.running&&!document.hidden&&G.time-G.lastHit<.45){
     this._rayIdleKind='timeout';this._rayIdle=setTimeout(()=>{this._rayIdle=0;this._rayIdleKind='';this._scheduleRayRebuild();},450);return;
    }
    g.computeBoundingBox();delete g.userData.fastGrid;FASTRAY.grid(g);this._dentRefits=0;
   };
   if(typeof requestIdleCallback==='function'){
    this._rayIdleKind='idle';this._rayIdle=requestIdleCallback(rebuild,{timeout:1200});
   }else{
    this._rayIdleKind='timeout';this._rayIdle=setTimeout(rebuild,450);
   }
  }
  _commit(verts,permanent,rebuildRay=true){
   const P=this.pos,R=this.rest,D=this.disp;
   for(const i of verts){const k=i*3;P[k]=R[k]+D[k];P[k+1]=R[k+1]+D[k+1];P[k+2]=R[k+2]+D[k+2];}
   if(this.toff)for(const i of this.tlist){const k=i*3;P[k]+=this.toff[k];P[k+1]+=this.toff[k+1];P[k+2]+=this.toff[k+2];}
   this.g.attributes.position.needsUpdate=true;this._normals(verts);
   if(permanent){
    this.g.attributes.aDmg.needsUpdate=true;this.g.computeBoundingSphere();
    if(rebuildRay){this._cancelRayRebuild();this._dentRefits=0;this.g.computeBoundingBox();delete this.g.userData.fastGrid;}
  
  
  
else if(this._refitRay(verts)){
 this._dentRefits=(this._dentRefits||0)+1;
 if(this._dentRefits>=6&&!this._rayIdle){
  this._dentRefits=0;this._scheduleRayRebuild();
 }
}else if(this.g.userData.fastGrid){
 this._cancelRayRebuild();
 this._dentRefits=0;
 this.g.computeBoundingBox();
 delete this.g.userData.fastGrid;
}




   }
  }
  // 이 점 둘레(반지름 r) 꼭짓점
  near(c,r){const P=this.pos,r2=r*r,out=[];for(let i=0;i<this.n;i++){const dx=P[i*3]-c.x,dy=P[i*3+1]-c.y,dz=P[i*3+2]-c.z;if(dx*dx+dy*dy+dz*dz<r2)out.push(i);}return out;}
  // 안쪽 깊이 한도 지키기
  _clampIn(k,i){const D=this.disp,nx=this.restN[k],ny=this.restN[k+1],nz=this.restN[k+2],inw=-(D[k]*nx+D[k+1]*ny+D[k+2]*nz),cap=this.cap[i];
   if(inw>cap){const e=inw-cap;D[k]+=nx*e;D[k+1]+=ny*e;D[k+2]+=nz*e;}
   const out=(D[k]*nx+D[k+1]*ny+D[k+2]*nz),oc=cap*.35;if(out>oc){const e=out-oc;D[k]-=nx*e;D[k+1]-=ny*e;D[k+2]-=nz*e;}}
  inwardAt(i){const k=i*3;return -(this.disp[k]*this.restN[k]+this.disp[k+1]*this.restN[k+1]+this.disp[k+2]*this.restN[k+2]);}

  /* 움푹: 주먹·몽둥이. c 중심, d 들어가는 방향(단위), R 반지름, depth 깊이. 둘레는 부어오른다(rim) */
  dent(c,d,R,depth,o={}){
   const R2=(R*1.7)**2,P=this.pos,D=this.disp,Dm=this.dmg,rim=o.rim==null?.28:o.rim,vs=[],rec=[];
   for(let i=0;i<this.n;i++){const k=i*3,dx=P[k]-c.x,dy=P[k+1]-c.y,dz=P[k+2]-c.z,d2=dx*dx+dy*dy+dz*dz;if(d2>R2)continue;
    const r=Math.sqrt(d2)/R;vs.push(i);rec.push(D[k],D[k+1],D[k+2]);
    const left=1-clamp(this.inwardAt(i)/(this.cap[i]+1e-6),0,1),eff=depth*(.25+.75*Math.sqrt(left));
    if(r<1){const w=(1-r*r)*(1-r*r);D[k]+=d.x*eff*w;D[k+1]+=d.y*eff*w;D[k+2]+=d.z*eff*w;
     if(o.bruise)Dm[i*4]=Math.min(1.5,Dm[i*4]+o.bruise*Math.pow(1-r,.7));
     if(o.raw&&r<.45)Dm[i*4+1]=Math.max(Dm[i*4+1],o.raw*(1-r/.45));
     if(o.scale&&r<.7)Dm[i*4+2]=Math.min(1,Dm[i*4+2]+o.scale*(1-r/.7));}
    else{const w=Math.sin((r-1)/.7*PI)*rim,nx=this.restN[k],ny=this.restN[k+1],nz=this.restN[k+2];D[k]+=nx*depth*w;D[k+1]+=ny*depth*w;D[k+2]+=nz*depth*w;
     if(o.bruise)Dm[i*4]=Math.min(1.5,Dm[i*4]+o.bruise*.35*(1.7-r));}
    this._clampIn(k,i);}
   return this._finish(vs,rec,false);
  }
  /* 파임: 총알·창. 가장자리가 들쭉날쭉한 깊은 구멍, 속살이 드러난다 */
  crater(c,d,R,depth,o={}){
   const topologyChanged=this.refine(c,R*1.5,o.minEdge||this.minEdge);
   const R2=(R*1.6)**2,P=this.pos,D=this.disp,Dm=this.dmg,vs=[],rec=[];
   // 구멍 둘레의 접평면 좌표(들쭉날쭉한 반지름을 각도로 정한다)
   const tu=_v1.set(1,0,0);if(Math.abs(d.x)>.8)tu.set(0,1,0);tu.addScaledVector(d,-tu.dot(d)).normalize();const tv=_v2.crossVectors(d,tu);
   const ph=[rnd(0,TAU),rnd(0,TAU),rnd(0,TAU)],jag=o.jag==null?.28:o.jag;
   for(let i=0;i<this.n;i++){const k=i*3,dx=P[k]-c.x,dy=P[k+1]-c.y,dz=P[k+2]-c.z,d2=dx*dx+dy*dy+dz*dz;if(d2>R2)continue;
    const a=Math.atan2(dx*tv.x+dy*tv.y+dz*tv.z,dx*tu.x+dy*tu.y+dz*tu.z);
    const Rj=R*(1+jag*(.5*Math.sin(a*3+ph[0])+.3*Math.sin(a*5+ph[1])+.2*Math.sin(a*8+ph[2])));
    const r=Math.sqrt(d2)/Rj;vs.push(i);rec.push(D[k],D[k+1],D[k+2]);
    const left=1-clamp(this.inwardAt(i)/(this.cap[i]+1e-6),0,1),eff=depth*(.3+.7*Math.sqrt(left));
    if(r<1){const w=Math.pow(1-r*r,.75);D[k]+=d.x*eff*w;D[k+1]+=d.y*eff*w;D[k+2]+=d.z*eff*w;
     Dm[i*4+1]=Math.max(Dm[i*4+1],clamp(1.15-r*.85,0,1.15));
     if(o.soak)Dm[i*4+3]=Math.min(1,Dm[i*4+3]+o.soak);}
    else{const w=Math.sin((r-1)/.6*PI)*.18;const nx=this.restN[k],ny=this.restN[k+1],nz=this.restN[k+2];D[k]+=nx*eff*w;D[k+1]+=ny*eff*w;D[k+2]+=nz*eff*w;
     Dm[i*4+1]=Math.max(Dm[i*4+1],clamp((1.6-r)*.42,0,.3));
     if(this.kind==='skin')Dm[i*4]=Math.min(1.5,Dm[i*4]+.18);if(o.soak)Dm[i*4+3]=Math.min(1,Dm[i*4+3]+o.soak*.6*(1.6-r));}
    this._clampIn(k,i);}
   return this._finish(vs,rec,topologyChanged);
  }
  /* 칼자국: a→b 선을 따라 V자로 파이고 양옆이 벌어진다 */
  groove(a,b,w,depth,o={}){
   const ab=_v1.subVectors(b,a),L=ab.length();if(L<1e-5)return 0;ab.divideScalar(L);
   // The visible slit supplies the fine edge. Reuse the surface topology during dragging.
   const P=this.pos,D=this.disp,Dm=this.dmg,vs=[],rec=[],W2=(w*1.8)**2,ph=rnd(0,TAU);
   for(let i=0;i<this.n;i++){const k=i*3;const px=P[k]-a.x,py=P[k+1]-a.y,pz=P[k+2]-a.z;let t=px*ab.x+py*ab.y+pz*ab.z;
    const tc=clamp(t,0,L),qx=px-ab.x*tc,qy=py-ab.y*tc,qz=pz-ab.z*tc,d2=qx*qx+qy*qy+qz*qz;if(d2>W2)continue;
    const endF=t<0?Math.max(0,1+t/(w*1.2)):t>L?Math.max(0,1-(t-L)/(w*1.2)):1;if(endF<=0)continue;
    const wj=w*(1+.25*Math.sin(t*90+ph)),r=Math.sqrt(d2)/wj;vs.push(i);rec.push(D[k],D[k+1],D[k+2]);
    const nx=this.restN[k],ny=this.restN[k+1],nz=this.restN[k+2];
    const left=1-clamp(this.inwardAt(i)/(this.cap[i]+1e-6),0,1),eff=depth*(.3+.7*Math.sqrt(left))*Math.min(1,endF*1.4);
    if(r<1){const wv=Math.pow(1-r,1.25);D[k]-=nx*eff*wv;D[k+1]-=ny*eff*wv;D[k+2]-=nz*eff*wv;
     // 벌어짐: 선에서 바깥으로
     const l=Math.sqrt(d2)||1,g=eff*.35*Math.sin(r*PI)*endF;D[k]+=qx/l*g;D[k+1]+=qy/l*g;D[k+2]+=qz/l*g;
     Dm[i*4+1]=Math.max(Dm[i*4+1],clamp((1.12-r)*endF,0,1.1));if(o.soak)Dm[i*4+3]=Math.min(1,Dm[i*4+3]+o.soak*(1-r));}
    else{Dm[i*4+1]=Math.max(Dm[i*4+1],clamp((1.8-r)*.2*endF,0,.16));if(o.soak)Dm[i*4+3]=Math.min(1,Dm[i*4+3]+o.soak*.4*(1.8-r));}
    this._clampIn(k,i);}
   return this._finish(vs,rec,false);
  }
  // 이번에 옮긴 양을 기억해 두었다가(피·상처·눈코입이 같이 따라오게) 화면에 반영
  _finish(vs,rec,rebuildRay=true){
   const D=this.disp,n=vs.length,d=new Float32Array(n*3),p=new Float32Array(n*3);
   for(let j=0;j<n;j++){const k=vs[j]*3;d[j*3]=D[k]-rec[j*3];d[j*3+1]=D[k+1]-rec[j*3+1];d[j*3+2]=D[k+2]-rec[j*3+2];}
   if(n)this._commit(vs,true,rebuildRay);
   // 옮기기 전 자리(덧붙은 피·상처는 아직 그 자리에 있다)
   for(let j=0;j<n;j++){const k=vs[j]*3;p[j*3]=this.pos[k]-d[j*3];p[j*3+1]=this.pos[k+1]-d[j*3+1];p[j*3+2]=this.pos[k+2]-d[j*3+2];}
   this.last={vs,d,p};return n;
  }
  // 이번 변형이 이 점(메시 좌표)을 얼마나 옮겼나: 가장 가까운 옮겨진 꼭짓점의 이동량(멀면 0)
  // 옮겨진 꼭짓점이 많으면 위의 나무로 찾는다(같은 거리면 앞 번호를 골라 다 훑을 때와 결과가 같다)
  deltaAt(x,y,z,out,maxD=.025){
   out.set(0,0,0);const L=this.last;if(!L||!L.vs.length)return out;
   let best=maxD*maxD,bj=-1;const P=L.p,n=L.vs.length;
   const T=n>=64?(L.kd||(L.kd=kdBuild(P,n))):null;
   if(T){
    const ids=T.ids,B=T.B,SR=KD_SR,SD=KD_SD;
    // 앞 질의의 답부터 대 본다(차례로 오는 피 자국 점은 서로 붙어 있다). 끝까지 가장 가까운 것을 찾으므로 결과는 같다
    const pj=L.kdLast;if(pj>=0){const dx=P[pj*3]-x,dy=P[pj*3+1]-y,dz=P[pj*3+2]-z,d2=dx*dx+dy*dy+dz*dz;if(d2<best){best=d2;bj=pj;}}
    let sp=0;
    if(T.n){const o=((T.n-1)>>1)*6,ax=x<B[o]?B[o]-x:x>B[o+3]?x-B[o+3]:0,ay=y<B[o+1]?B[o+1]-y:y>B[o+4]?y-B[o+4]:0,az=z<B[o+2]?B[o+2]-z:z>B[o+5]?z-B[o+5]:0,r0=ax*ax+ay*ay+az*az;
     if(r0<=best){SR[0]=0;SR[1]=T.n-1;SD[0]=r0;sp=1;}}
    while(sp){sp--;if(SD[sp]>best)continue;let left=SR[sp*2],right=SR[sp*2+1];
     while(right-left>KD_LEAF){
      const m=(left+right)>>1,j=ids[m],dx=P[j*3]-x,dy=P[j*3+1]-y,dz=P[j*3+2]-z,d2=dx*dx+dy*dy+dz*dz;if(d2<best||(d2===best&&j<bj)){best=d2;bj=j;}
      // 두 가지 상자까지 거리: 가까운 쪽으로 내려가고 먼 쪽은 쌓아 둔다(지금 찾은 것보다 멀면 버린다)
      const lr=m-1,rl=m+1;
      let o=((left+lr)>>1)*6,ax=x<B[o]?B[o]-x:x>B[o+3]?x-B[o+3]:0,ay=y<B[o+1]?B[o+1]-y:y>B[o+4]?y-B[o+4]:0,az=z<B[o+2]?B[o+2]-z:z>B[o+5]?z-B[o+5]:0;const dl=ax*ax+ay*ay+az*az;
      o=((rl+right)>>1)*6;ax=x<B[o]?B[o]-x:x>B[o+3]?x-B[o+3]:0;ay=y<B[o+1]?B[o+1]-y:y>B[o+4]?y-B[o+4]:0;az=z<B[o+2]?B[o+2]-z:z>B[o+5]?z-B[o+5]:0;const dr=ax*ax+ay*ay+az*az;
      if(dl<=dr){if(dr<=best){SR[sp*2]=rl;SR[sp*2+1]=right;SD[sp]=dr;sp++;}if(dl>best){right=left-1;break;}right=lr;}
      else{if(dl<=best){SR[sp*2]=left;SR[sp*2+1]=lr;SD[sp]=dl;sp++;}if(dr>best){right=left-1;break;}left=rl;}}
     for(let i=left;i<=right;i++){const j=ids[i],dx=P[j*3]-x,dy=P[j*3+1]-y,dz=P[j*3+2]-z,d2=dx*dx+dy*dy+dz*dz;if(d2<best||(d2===best&&j<bj)){best=d2;bj=j;}}}
    if(bj>=0)L.kdLast=bj;
   }else{
    for(let j=0;j<n;j++){const dx=P[j*3]-x,dy=P[j*3+1]-y,dz=P[j*3+2]-z,d2=dx*dx+dy*dy+dz*dz;if(d2<best){best=d2;bj=j;}}
   }
   if(bj>=0)out.set(L.d[bj*3],L.d[bj*3+1],L.d[bj*3+2]);return out;
  }
  // 손상 값만 칠하기(모양은 그대로): 비늘·피 배어 듦 등
  paint(c,R,ch,amt,mode='add'){const P=this.pos,Dm=this.dmg,R2=R*R;let n=0;
   for(let i=0;i<this.n;i++){const dx=P[i*3]-c.x,dy=P[i*3+1]-c.y,dz=P[i*3+2]-c.z,d2=dx*dx+dy*dy+dz*dz;if(d2>R2)continue;const w=1-Math.sqrt(d2)/R,j=i*4+ch;
    Dm[j]=mode==='max'?Math.max(Dm[j],amt*w):Math.min(1.5,Dm[j]+amt*w);n++;}
   if(n){this.g.attributes.aDmg.needsUpdate=true;}return n;}
  /* 출렁: 맞는 순간 더 깊이 눌렸다가 튕겨 돌아온다(모양이 영구히 바뀐 위에 얹힌다) */
  jiggle(c,d,R,amp,o={}){
   const vs=this.near(c,R*1.7);if(!vs.length)return;const w=new Float32Array(vs.length);
   for(let j=0;j<vs.length;j++){const i=vs[j];const dx=this.pos[i*3]-c.x,dy=this.pos[i*3+1]-c.y,dz=this.pos[i*3+2]-c.z,r=Math.sqrt(dx*dx+dy*dy+dz*dz)/R;w[j]=r<1?(1-r*r)*(1-r*r):-Math.sin((r-1)/.7*PI)*.25;}
   this.trans.push({vs,w,d:d.clone(),amp,t:0,f:o.freq||7.5,k:o.decay||9});
   if(this.trans.length>8)this.trans.shift();
  }
  update(dt){
   if(dt<=0||(!this.trans.length&&!this.toff))return;
   const n=this.n;if(!this.toff){this.toff=new Float32Array(n*3);}
   const T=this.toff,set=this._tset||(this._tset=new Set());
   for(const i of (this.tlist||[]))T[i*3]=T[i*3+1]=T[i*3+2]=0;
   set.clear();
   for(let q=this.trans.length-1;q>=0;q--){const tr=this.trans[q];tr.t+=dt;const a=tr.amp*Math.exp(-tr.k*tr.t)*Math.cos(TAU*tr.f*tr.t);
    if(tr.t>.9||Math.abs(tr.amp*Math.exp(-tr.k*tr.t))<1e-5){this.trans.splice(q,1);for(const i of tr.vs)set.add(i);continue;}
    for(let j=0;j<tr.vs.length;j++){const i=tr.vs[j],k=i*3,ww=tr.w[j]*a;T[k]+=tr.d.x*ww;T[k+1]+=tr.d.y*ww;T[k+2]+=tr.d.z*ww;set.add(i);}}
   const prev=this.tlist||[];for(const i of prev)set.add(i);
   this.tlist=[...set];
   if(!this.trans.length){const all=this.tlist;this.toff=null;this.tlist=null;this._commit(all,false);this.g.computeBoundingSphere();return;}
   this._commit(this.tlist,false);
  }

  /* ---- 잘게 쪼개기(빨간-초록 세분): 이 둘레에서 minEdge보다 긴 변을 반으로 나눈다. 이웃 삼각형도 금이 안 가게 같이 나눈다 ---- */
  // box: 이 상자 밖은 inside가 참일 수 없다(넉넉하게 잡는다). 상자 안쪽만 inside로 따져 칼질마다 전체를 훑는 시간을 줄인다
  refine(c,R,minEdge){const r=R*1.001+1e-9;return this._refine((x,y,z)=>{const dx=x-c.x,dy=y-c.y,dz=z-c.z;return dx*dx+dy*dy+dz*dz<R*R;},minEdge,[c.x-r,c.y-r,c.z-r,c.x+r,c.y+r,c.z+r]);}
  _refine(inside,minEdge,box){
   if(this.n>=this.maxVerts)return false;
   const g=this.g,idx=g.index.array,T=idx.length/3,P=this.pos,me2=minEdge*minEdge;
   const len2=(a,b)=>{const x=P[a*3]-P[b*3],y=P[a*3+1]-P[b*3+1],z=P[a*3+2]-P[b*3+2];return x*x+y*y+z*z;};
   const mids=new Map();let added=0;const n0=this.n;const newV=[];
   const key=(a,b)=>a<b?a*4194304+b:b*4194304+a;
   const B=box||[-Infinity,-Infinity,-Infinity,Infinity,Infinity,Infinity],bx0=B[0],by0=B[1],bz0=B[2],bx1=B[3],by1=B[4],bz1=B[5];
   const ins=(x,y,z)=>x>bx0&&x<bx1&&y>by0&&y<by1&&z>bz0&&z<bz1&&inside(x,y,z);
   // 꼭짓점마다 한 번만 따진다(삼각형마다 세 번씩 따지던 것과 결과는 같다)
   const vin=new Uint8Array(n0);for(let i=0;i<n0;i++)if(ins(P[i*3],P[i*3+1],P[i*3+2]))vin[i]=1;
   const addMid=(u,v)=>{if(n0+added>=this.maxVerts||len2(u,v)<=me2)return;const k=key(u,v);if(!mids.has(k)){mids.set(k,n0+added);newV.push(u,v);added++;}};
   for(let t=0;t<T;t++){const a=idx[t*3],b=idx[t*3+1],c=idx[t*3+2];
    if(!(vin[a]||vin[b]||vin[c]||ins((P[a*3]+P[b*3]+P[c*3])/3,(P[a*3+1]+P[b*3+1]+P[c*3+1])/3,(P[a*3+2]+P[b*3+2]+P[c*3+2])/3)))continue;
    addMid(a,b);addMid(b,c);addMid(c,a);}
   if(!added)return false;
   const n=n0+added;
   const grow=(arr,sz)=>{const o=new Float32Array(n*sz);o.set(arr.subarray(0,n0*sz));return o;};
   const attrs=g.attributes,uv=attrs.uv?attrs.uv.array:null,colA=attrs.color?attrs.color.array:null;
   const nP=grow(this.pos,3),nN=grow(this.nor,3),nR=grow(this.rest,3),nRN=grow(this.restN,3),nD=grow(this.disp,3),nDm=grow(this.dmg,4),nC=new Float32Array(n);nC.set(this.cap);
   const nUV=uv?grow(uv,2):null,nCol=colA?grow(colA,3):null;
   for(let j=0;j<added;j++){const u=newV[j*2],v=newV[j*2+1],i=n0+j;
    for(let q=0;q<3;q++){nP[i*3+q]=(nP[u*3+q]+nP[v*3+q])/2;nR[i*3+q]=(nR[u*3+q]+nR[v*3+q])/2;nD[i*3+q]=(nD[u*3+q]+nD[v*3+q])/2;nN[i*3+q]=nN[u*3+q]+nN[v*3+q];nRN[i*3+q]=nRN[u*3+q]+nRN[v*3+q];if(nCol)nCol[i*3+q]=(nCol[u*3+q]+nCol[v*3+q])/2;}
    let l=Math.hypot(nN[i*3],nN[i*3+1],nN[i*3+2])||1;for(let q=0;q<3;q++)nN[i*3+q]/=l;
    l=Math.hypot(nRN[i*3],nRN[i*3+1],nRN[i*3+2])||1;for(let q=0;q<3;q++)nRN[i*3+q]/=l;
    for(let q=0;q<4;q++)nDm[i*4+q]=(nDm[u*4+q]+nDm[v*4+q])/2;
    if(nUV){nUV[i*2]=(nUV[u*2]+nUV[v*2])/2;nUV[i*2+1]=(nUV[u*2+1]+nUV[v*2+1])/2;}
    nC[i]=(nC[u]+nC[v])/2;}
   // 쪼갠 변의 두 끝은 표시해 둔다: 두 끝이 다 표시된 변만 쪼개졌을 수 있으니 나머지 삼각형은 찾아보지 않고 그대로 둔다
   const tv=new Uint8Array(n0);for(let j=0;j<newV.length;j++)tv[newV[j]]=1;
   const TRI=[1,2,2,3,2,3,3,4],tm=new Uint8Array(T);let cnt=0;
   for(let t=0;t<T;t++){const a=idx[t*3],b=idx[t*3+1],c=idx[t*3+2];let m=0;
    if(tv[a]+tv[b]+tv[c]>=2){if(tv[a]&&tv[b]&&mids.get(key(a,b))!=null)m|=1;if(tv[b]&&tv[c]&&mids.get(key(b,c))!=null)m|=2;if(tv[c]&&tv[a]&&mids.get(key(c,a))!=null)m|=4;}
    tm[t]=m;cnt+=TRI[m]*3;}
   const out=n>65535?new Uint32Array(cnt):new Uint16Array(cnt);let o=0;
   const w3=(x,y,z)=>{out[o++]=x;out[o++]=y;out[o++]=z;};
   for(let t=0;t<T;t++){const a=idx[t*3],b=idx[t*3+1],c=idx[t*3+2],m=tm[t];
    if(!m){out[o++]=a;out[o++]=b;out[o++]=c;continue;}
    const ab=mids.get(key(a,b)),bc=mids.get(key(b,c)),ca=mids.get(key(c,a));
    switch(m){
     case 1:w3(a,ab,c);w3(ab,b,c);break;
     case 2:w3(a,b,bc);w3(a,bc,c);break;
     case 4:w3(a,b,ca);w3(ca,b,c);break;
     case 3:w3(a,ab,c);w3(ab,b,bc);w3(ab,bc,c);break;
     case 6:w3(a,b,bc);w3(a,bc,ca);w3(ca,bc,c);break;
     case 5:w3(a,ab,ca);w3(ab,b,c);w3(ab,c,ca);break;
     default:w3(a,ab,ca);w3(ab,b,bc);w3(ca,bc,c);w3(ab,bc,ca);
    }}
   const ng=new THREE.BufferGeometry();
   ng.setAttribute('position',new THREE.BufferAttribute(nP,3));ng.setAttribute('normal',new THREE.BufferAttribute(nN,3));
   if(nUV)ng.setAttribute('uv',new THREE.BufferAttribute(nUV,2));if(nCol)ng.setAttribute('color',new THREE.BufferAttribute(nCol,3));
   ng.setAttribute('aDmg',new THREE.BufferAttribute(nDm,4));
   ng.setIndex(new THREE.BufferAttribute(out,1));
   const old=this.g;this.mesh.geometry=ng;if(this.o.releaseGeometry)this.o.releaseGeometry(old);else old.dispose();
   // 지오메트리를 갈아 끼우되 쉬는 모양·눌린 양은 그대로 이어 간다
   this.g=ng;this.n=n;this.pos=nP;this.nor=nN;this.rest=nR;this.restN=nRN;this.disp=nD;this.dmg=nDm;this.cap=nC;
   ng.attributes.position.setUsage(THREE.DynamicDrawUsage);ng.attributes.normal.setUsage(THREE.DynamicDrawUsage);ng.attributes.aDmg.setUsage(THREE.DynamicDrawUsage);
   if(this.toff){const t2=new Float32Array(n*3);t2.set(this.toff);this.toff=t2;}
   this._weld(n0);this._adj();ng.computeBoundingSphere();ng.computeBoundingBox();
   return true;
  }
  // 지금 모양을 그대로 굳힌다(썰기 전에)
  bake(){const P=this.pos,R=this.rest;for(let i=0;i<P.length;i++)R[i]=P[i];this.disp.fill(0);this.restN.set(this.nor);this._wmap=null;}

  /* ---- 맞히기 검사: 격자로 빠르게 ---- */
  raycast(rc,out){
   const m=this.mesh,g=this.g;if(!g.boundingSphere)g.computeBoundingSphere();
   _sph.copy(g.boundingSphere).applyMatrix4(m.matrixWorld);if(!rc.ray.intersectsSphere(_sph))return;
   _inv.copy(m.matrixWorld).invert();_ray.copy(rc.ray).applyMatrix4(_inv);
   const G=FASTRAY.grid(g);_hit.normal=_hit.normal||V3();
   const dl=_ray.direction.length();_ray.direction.divideScalar(dl);
   if(!FASTRAY.ray(G,_ray.origin,_ray.direction,10,_hit))return;
   const pL=_v3.copy(_ray.origin).addScaledVector(_ray.direction,_hit.t),pW=pL.clone().applyMatrix4(m.matrixWorld),dist=rc.ray.origin.distanceTo(pW);
   if(dist<rc.near||dist>rc.far)return;
   out.push({distance:dist,point:pW,object:m,face:{normal:_hit.normal.clone(),a:0,b:0,c:0,materialIndex:0},faceIndex:_hit.tri});
  }
 }
 const _sph=new THREE.Sphere(),_inv=new THREE.Matrix4(),_ray=new THREE.Ray(),_hit={t:0,normal:V3(),tri:0};
 return {patch,Flesh,MEAT,shared,clone};
})();

/* ===== 2-4. 썰기 =====
 * 평면으로 지오메트리를 두 쪽으로 나누고, 잘린 면을 막는다. 잘린 면은 바깥 테부터 안쪽으로 찢긴 살갗 → 비늘 → 속살 → 깊은 속살 순으로
 * 손상 값(aDmg.y)을 매겨서 살 셰이더가 결 있는 단면으로 칠하게 한다. dist(p)=n·p-d 가 0보다 크면 잘려 나가는 쪽. */
const SLICE=(()=>{
 const RINGS=[[1,.1],[.95,.28],[.88,.46],[.74,.78],[.5,1],[.22,1.1],[0,1.15]];
 function slice(geo,n,d,close=true,keepOnly=false){
  const A=geo.attributes,P=A.position.array,N=A.normal?A.normal.array:null,UV=A.uv?A.uv.array:null,C=A.color?A.color.array:null,Dm=A.aDmg?A.aDmg.array:null;
  const idx=geo.index?geo.index.array:null,nv=P.length/3,T=(idx?idx.length:nv)/3;
  const dist=new Float32Array(nv);for(let i=0;i<nv;i++)dist[i]=n.x*P[i*3]+n.y*P[i*3+1]+n.z*P[i*3+2]-d;
  const B=[mkB(),mkB()],map=[new Int32Array(nv).fill(-1),new Int32Array(nv).fill(-1)];
  function mkB(){return {p:[],n:[],uv:[],c:[],dm:[],idx:[],cnt:0};}
  function push(b,px,py,pz,nx,ny,nz,u,v,cr,cg,cb,d0,d1,d2,d3){b.p.push(px,py,pz);b.n.push(nx,ny,nz);if(UV)b.uv.push(u,v);if(C)b.c.push(cr,cg,cb);b.dm.push(d0,d1,d2,d3);return b.cnt++;}
  function vtx(s,i){let k=map[s][i];if(k>=0)return k;const b=B[s];
   k=push(b,P[i*3],P[i*3+1],P[i*3+2],N?N[i*3]:0,N?N[i*3+1]:1,N?N[i*3+2]:0,UV?UV[i*2]:0,UV?UV[i*2+1]:0,C?C[i*3]:1,C?C[i*3+1]:1,C?C[i*3+2]:1,Dm?Dm[i*4]:0,Dm?Dm[i*4+1]:0,Dm?Dm[i*4+2]:0,Dm?Dm[i*4+3]:0);map[s][i]=k;return k;}
  const mids=new Map(),pk=new Map();
  function mid(a,b){const key=a<b?a*4194304+b:b*4194304+a;let m=mids.get(key);if(m)return m;
   const t=dist[a]/(dist[a]-dist[b]),L=(x,y)=>x+(y-x)*t;
   const px=L(P[a*3],P[b*3]),py=L(P[a*3+1],P[b*3+1]),pz=L(P[a*3+2],P[b*3+2]);
   let nx=N?L(N[a*3],N[b*3]):0,ny=N?L(N[a*3+1],N[b*3+1]):1,nz=N?L(N[a*3+2],N[b*3+2]):0;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
   const u=UV?L(UV[a*2],UV[b*2]):0,v=UV?L(UV[a*2+1],UV[b*2+1]):0,cr=C?L(C[a*3],C[b*3]):1,cg=C?L(C[a*3+1],C[b*3+1]):1,cb=C?L(C[a*3+2],C[b*3+2]):1;
   const d0=Dm?L(Dm[a*4],Dm[b*4]):0,d1=Dm?L(Dm[a*4+1],Dm[b*4+1]):0,d2=Dm?L(Dm[a*4+2],Dm[b*4+2]):0,d3=Dm?L(Dm[a*4+3],Dm[b*4+3]):0;
   const k0=push(B[0],px,py,pz,nx,ny,nz,u,v,cr,cg,cb,d0,Math.max(d1,.12),d2,d3),k1=keepOnly?-1:push(B[1],px,py,pz,nx,ny,nz,u,v,cr,cg,cb,d0,Math.max(d1,.12),d2,d3);
   // 같은 자리(겹친 꼭짓점의 변)는 같은 열쇠로 묶어 고리를 잇는다
   const q=Math.round(px*1e5)+','+Math.round(py*1e5)+','+Math.round(pz*1e5);
   m={k0,k1,q,p:[px,py,pz],c:[cr,cg,cb],uv:[u,v],dm:[d0,d2,d3]};mids.set(key,m);if(!pk.has(q))pk.set(q,m);return m;}
  const segs=[];
  for(let t=0;t<T;t++){
   const ia=idx?idx[t*3]:t*3,ib=idx?idx[t*3+1]:t*3+1,ic=idx?idx[t*3+2]:t*3+2,sa=dist[ia]>0?1:0,sb=dist[ib]>0?1:0,sc=dist[ic]>0?1:0;
   if(sa===sb&&sb===sc){if(keepOnly&&sa===1)continue;const b=B[sa];b.idx.push(vtx(sa,ia),vtx(sa,ib),vtx(sa,ic));continue;}
   // 혼자 다른 쪽인 꼭짓점을 맨 앞으로(감는 순서는 그대로)
   let L_,M1,M2;if(sa!==sb&&sa!==sc){L_=ia;M1=ib;M2=ic;}else if(sb!==sa&&sb!==sc){L_=ib;M1=ic;M2=ia;}else{L_=ic;M1=ia;M2=ib;}
   const sL=dist[L_]>0?1:0,sO=1-sL,i1=mid(L_,M1),i2=mid(L_,M2);
   const k1L=sL?i1.k1:i1.k0,k2L=sL?i2.k1:i2.k0,k1O=sO?i1.k1:i1.k0,k2O=sO?i2.k1:i2.k0;
   if(!keepOnly||sL===0)B[sL].idx.push(vtx(sL,L_),k1L,k2L);
   if(!keepOnly||sO===0)B[sO].idx.push(k1O,vtx(sO,M1),vtx(sO,M2),k1O,vtx(sO,M2),k2O);
   if(i1.q!==i2.q)segs.push([i1.q,i2.q]);
  }
  // 잘린 테두리를 고리로 잇기
  const adj=new Map();for(const [a,b] of segs){if(!adj.has(a))adj.set(a,[]);if(!adj.has(b))adj.set(b,[]);adj.get(a).push(b);adj.get(b).push(a);}
  const used=new Set(),loops=[];
  for(const st of adj.keys()){if(used.has(st))continue;const loop=[st];used.add(st);let prev=null,cur=st;
   for(let g=0;g<20000;g++){const nb=adj.get(cur).filter(x=>x!==prev&&(!used.has(x)||(x===st&&loop.length>2)));if(!nb.length)break;const nx=nb.find(x=>!used.has(x))||nb[0];if(nx===st)break;loop.push(nx);used.add(nx);prev=cur;cur=nx;}
   if(loop.length>=3)loops.push(loop.map(q=>pk.get(q)));}
  // 단면 막기: 두 쪽에 각각(남는 쪽은 +n, 떨어지는 쪽은 -n을 본다)
  if(close)for(const loop of loops)for(const s of (keepOnly?[0]:[0,1]))cap(B[s],loop,s===0?n.clone():n.clone().negate());
  return {keep:build(B[0]),cut:keepOnly?null:build(B[1]),loops:loops.length,contours:loops.map(loop=>loop.map(m=>m.p.slice()))};
  function cap(b,loop,nn){
   const U=Math.abs(nn.x)>.8?V3(0,1,0):V3(1,0,0);U.addScaledVector(nn,-U.dot(nn)).normalize();const Vv=V3().crossVectors(nn,U);
   const L=loop.length;let cx=0,cy=0,cz=0;for(const m of loop){cx+=m.p[0];cy+=m.p[1];cz+=m.p[2];}cx/=L;cy/=L;cz/=L;
   const X=m=>(m.p[0]-cx)*U.x+(m.p[1]-cy)*U.y+(m.p[2]-cz)*U.z,Y=m=>(m.p[0]-cx)*Vv.x+(m.p[1]-cy)*Vv.y+(m.p[2]-cz)*Vv.z;
   // 법선 쪽에서 볼 때 반시계가 되게
   let ar=0;for(let i=0;i<L;i++){const a=loop[i],c=loop[(i+1)%L];ar+=X(a)*Y(c)-Y(a)*X(c);}
   const lp=ar<0?loop.slice().reverse():loop;
   // 가운데에서 다 보이는 고리면 동심원 띠로(테두리 결을 살린다), 아니면 그냥 메운다
   let star=true,tot=0;for(let i=0;i<L;i++){const a=lp[i],c=lp[(i+1)%L];let da=Math.atan2(Y(c),X(c))-Math.atan2(Y(a),X(a));while(da>PI)da-=TAU;while(da<=-PI)da+=TAU;if(da<-.02)star=false;tot+=da;}
   if(Math.abs(tot-TAU)>.3)star=false;
   const base=b.cnt;
   if(star){
    for(let r=0;r<RINGS.length;r++){const [s,raw]=RINGS[r];
     for(let i=0;i<L;i++){const m=lp[i];push(b,cx+(m.p[0]-cx)*s,cy+(m.p[1]-cy)*s,cz+(m.p[2]-cz)*s,nn.x,nn.y,nn.z,m.uv[0],m.uv[1],m.c[0],m.c[1],m.c[2],m.dm[0],raw,0,m.dm[2]);}}
    for(let r=0;r<RINGS.length-1;r++)for(let i=0;i<L;i++){const a=base+r*L+i,bb=base+r*L+(i+1)%L,c=a+L,dd=bb+L;b.idx.push(a,bb,c,bb,dd,c);}
   }else{
    const pts=lp.map(m=>new THREE.Vector2(X(m),Y(m)));
    let tris=[];try{tris=THREE.ShapeUtils.triangulateShape(pts,[]);}catch(_){tris=[];}
    for(let i=0;i<L;i++){const m=lp[i];push(b,m.p[0],m.p[1],m.p[2],nn.x,nn.y,nn.z,m.uv[0],m.uv[1],m.c[0],m.c[1],m.c[2],m.dm[0],.9,0,m.dm[2]);}
    for(const t of tris){const [a,bb,c]=t;const cr=(pts[bb].x-pts[a].x)*(pts[c].y-pts[a].y)-(pts[bb].y-pts[a].y)*(pts[c].x-pts[a].x);
     if(cr>0)b.idx.push(base+a,base+bb,base+c);else b.idx.push(base+a,base+c,base+bb);}
   }
  }
  function build(b){
   if(!b.idx.length)return null;const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));
   if(UV)g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));if(C)g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
   g.setAttribute('aDmg',new THREE.Float32BufferAttribute(b.dm,4));
   g.setIndex(new THREE.BufferAttribute(b.cnt>65535?new Uint32Array(b.idx):new Uint16Array(b.idx),1));g.computeBoundingSphere();g.computeBoundingBox();return g;}
 }
 return {slice};
})();

/* ===== 2-3. 조각칼(SDF로 빚는 몸) =====
 * 공을 기준으로 바깥쪽으로 반직선을 쏴서 SDF 겉면을 찾는다(머리·배처럼 가운데서 다 보이는 모양).
 * 공의 위도·경도를 그대로 쓰므로 UV도 공과 같다(배·가슴 옷 무늬가 그대로 맞는다). 법선은 SDF 기울기로 구한다. */
const SCULPT=(()=>{
 function ell(x,y,z,cx,cy,cz,rx,ry,rz){const X=(x-cx)/rx,Y=(y-cy)/ry,Z=(z-cz)/rz,k0=Math.sqrt(X*X+Y*Y+Z*Z),X2=X/rx,Y2=Y/ry,Z2=Z/rz,k1=Math.sqrt(X2*X2+Y2*Y2+Z2*Z2)||1e-9;return k0*(k0-1)/k1;}
 function cap(x,y,z,ax,ay,az,bx,by,bz,ra,rb){const px=x-ax,py=y-ay,pz=z-az,ex=bx-ax,ey=by-ay,ez=bz-az,l2=ex*ex+ey*ey+ez*ez;let t=l2>0?(px*ex+py*ey+pz*ez)/l2:0;t=t<0?0:t>1?1:t;const dx=px-ex*t,dy=py-ey*t,dz=pz-ez*t;return Math.sqrt(dx*dx+dy*dy+dz*dz)-(ra+(rb==null?0:(rb-ra)*t));}
 function smin(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}
 function smax(a,b,k){return -smin(-a,-b,k);}
 /* sdf(x,y,z), 가운데 c, 가로·세로 칸 수, 바깥 한계 tmax. 결과: 색(tint 함수가 있으면 꼭짓점 색) 포함 지오메트리 */
 function star(sdf,c,W,H,tmax,o={}){
  const job=starSteps(sdf,c,W,H,tmax,o);let step;do{step=job.next();}while(!step.done);return step.value;
 }
 function* starSteps(sdf,c,W,H,tmax,o={}){
  const g=new THREE.SphereGeometry(1,W,H),P=g.attributes.position,N=g.attributes.normal,n=P.count;
  const cols=o.tint?new Float32Array(n*3):null,e=.0009,cv=new THREE.Color();
  for(let i=0;i<n;i++){
   const dx=P.getX(i),dy=P.getY(i),dz=P.getZ(i);
   // 바깥에서 안쪽으로 들어오며 처음 만나는 겉면(눈두덩처럼 튀어나온 곳 밑으로 파고들지 않게)
   let t=tmax*1.6,prev=t;
   for(let k=0;k<160&&t>0;k++){const d=sdf(c.x+dx*t,c.y+dy*t,c.z+dz*t);if(d<0)break;prev=t;t-=Math.max(d*.85,.0012);}
   let lo=Math.max(0,t),hi=prev;
   for(let k=0;k<16;k++){const m=(lo+hi)*.5;if(sdf(c.x+dx*m,c.y+dy*m,c.z+dz*m)<0)lo=m;else hi=m;}
   t=(lo+hi)*.5;const x=c.x+dx*t,y=c.y+dy*t,z=c.z+dz*t;P.setXYZ(i,x,y,z);
   let nx=sdf(x+e,y,z)-sdf(x-e,y,z),ny=sdf(x,y+e,z)-sdf(x,y-e,z),nz=sdf(x,y,z+e)-sdf(x,y,z-e);const l=Math.hypot(nx,ny,nz)||1;
   nx/=l;ny/=l;nz/=l;if(nx*dx+ny*dy+nz*dz<.05){nx=dx;ny=dy;nz=dz;}N.setXYZ(i,nx,ny,nz);
   if(cols){o.tint(x,y,z,cv);cols[i*3]=cv.r;cols[i*3+1]=cv.g;cols[i*3+2]=cv.b;}
   if((i&7)===7)yield;
  }
  // 타우빈 다듬기: 반직선 사이로 생긴 계단을 문질러 없앤다(부피는 거의 그대로)
  const it=o.smooth==null?2:o.smooth;
  if(it>0){const A=P.array,R=W+1,tmp=new Float32Array(A.length);
   const lap=(src,dst,k)=>{for(let iy=1;iy<H;iy++)for(let ix=0;ix<=W;ix++){const i=iy*R+ix,l=(ix===0?W-1:ix-1)+iy*R,r=(ix===W?1:ix+1)+iy*R,u=i-R,d=i+R;
     for(let q=0;q<3;q++){const c=src[i*3+q];dst[i*3+q]=c+k*((src[l*3+q]+src[r*3+q]+src[u*3+q]+src[d*3+q])*.25-c);}}
    for(const iy of [0,H])for(let ix=0;ix<=W;ix++){const i=iy*R+ix;for(let q=0;q<3;q++)dst[i*3+q]=src[i*3+q];}};
   for(let k=0;k<it;k++){lap(A,tmp,.5);lap(tmp,A,-.53);}
   P.needsUpdate=true;g.computeVertexNormals();}
  if(cols)g.setAttribute('color',new THREE.BufferAttribute(cols,3));
  g.computeBoundingSphere();return g;
 }
 /* 관(팔·다리): a→b 축, 반지름 함수 rf(t,ang), 둘레 칸 rs, 길이 칸 ls. 양 끝은 둥글게 닫는다(openA·openB면 그쪽 끝을 뚫어 둔다: 소매 아가리) */
 function tube(a,b,rf,rs,ls,o={}){
  const ax=V3().subVectors(b,a),L=ax.length();ax.normalize();
  let up=Math.abs(ax.y)>.9?V3(1,0,0):V3(0,1,0);const u=V3().crossVectors(up,ax).normalize(),v=V3().crossVectors(ax,u);
  const capN=o.cap||4,rows=[];
  // a쪽 끝 반구 → 몸통 → b쪽 끝 반구
  if(!o.openA)for(let i=capN;i>=1;i--){const q=i/capN*PI/2;rows.push({t:0,k:Math.cos(q),off:-Math.sin(q)});}
  for(let i=0;i<=ls;i++)rows.push({t:i/ls,k:1,off:0});
  if(!o.openB)for(let i=1;i<=capN;i++){const q=i/capN*PI/2;rows.push({t:1,k:Math.cos(q),off:Math.sin(q)});}
  const pos=[],nor=[],uv=[],idx=[],R=rows.length;
  for(let r=0;r<R;r++){const w=rows[r];
   for(let j=0;j<=rs;j++){const ang=j/rs*TAU,ca=Math.cos(ang),sa=Math.sin(ang);
    const rad=rf(w.t,ang)*Math.max(w.k,.0001),capR=rf(w.t,ang)*(o.capScale||.6);
    const cx=a.x+ax.x*(w.t*L+w.off*capR),cy=a.y+ax.y*(w.t*L+w.off*capR),cz=a.z+ax.z*(w.t*L+w.off*capR);
    const dx=u.x*ca+v.x*sa,dy=u.y*ca+v.y*sa,dz=u.z*ca+v.z*sa;
    pos.push(cx+dx*rad,cy+dy*rad,cz+dz*rad);
    const nk=w.k,no=w.off;nor.push(dx*nk+ax.x*no,dy*nk+ax.y*no,dz*nk+ax.z*no);
    uv.push(j/rs,r/(R-1));}}
  // 삼각형 감는 방향: 둘레(j)는 축(a→b)을 오른손으로 감고 줄(r)은 축을 따라 내려가므로, (p, p+1, q) 순으로 감아야 바깥면이 앞면이 된다.
  // 예전 (p, q, p+1) 순서는 안팎이 뒤집혀 팔·다리·목이 속이 빈 통처럼 보이고(앞면이 걸러짐), 법선이 안쪽을 봐서 찌그러짐·칼자국이 반대로 들어가고,
  // 맞힘 판정(앞면만)이 반대편 안쪽 벽에 걸렸다.
  for(let r=0;r<R-1;r++)for(let j=0;j<rs;j++){const p=r*(rs+1)+j,q=p+rs+1;idx.push(p,p+1,q,p+1,q+1,q);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
  g.computeVertexNormals();g.computeBoundingSphere();return g;
 }
 return {ell,cap,smin,smax,star,starSteps,tube};
})();
/* ===== 3. 소리 =====
 * 부활 대사만 고정 한국어 남성 음성 파일을 쓴다. 타격음은 여러 겹(낮은 쿵 + 살 철썩 + 뼈 딱 + 공간 울림)으로 쌓고,
 * 목소리는 성대 소리를 모음 울림통(포먼트)에 통과시켜 '윽·억·아악·으으·흐흐' 같은 소리를 낸다. */
const AUDIO=(()=>{
 let ctx=null,master,comp,lim,bus,vbus,mbus,verb,vverb,noise,glot,irBuf,on=true,baking=false;
 const volumes={music:1,effects:1,voice:1};
 function setVolumes(next){
  for(const k of Object.keys(volumes))if(Number.isFinite(next[k]))volumes[k]=clamp(next[k],0,1);
  if(ctx)for(const [k,node] of [['music',mbus],['effects',bus],['voice',vbus]])if(node)node.gain.setTargetAtTime(volumes[k],ctx.currentTime,.03);
  if(tts&&volumes.voice===0)tts.stop();
 }
 const R=(a,b)=>a+Math.random()*(b-a);

 // 한 번만 받아 두는 196 BPM 스윙. 음표 생성은 빌드 때 끝내고 전투 중에는 버퍼 하나만 재생한다.
 const music={buffer:null,load:null,source:null,gain:null,wanted:false,quiet:false,offset:0,at:0};
 const MUSIC_LEVEL=.56;
 function loadMusic(){
  if(music.buffer)return Promise.resolve(music.buffer);
  if(!ctx)return Promise.resolve(null);
  if(!music.load){const ac=ctx;music.load=fetch('assets/battle-jazz-v1.mp3').then(r=>{if(!r.ok)throw new Error('music load');return r.arrayBuffer();})
   .then(data=>ac.decodeAudioData(data)).then(buffer=>{music.buffer=buffer;music.load=null;syncMusic();return buffer;}).catch(()=>{music.load=null;return null;});}
  return music.load;
 }
 function syncMusic(){
  if(!music.wanted||!music.buffer||!ctx||music.source)return;
  const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=music.buffer;source.loop=true;
  source.loopStart=0;source.loopEnd=Math.min(music.buffer.duration,128*60/196);
  gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(MUSIC_LEVEL*(music.quiet?.22:1),ctx.currentTime+.14);
  source.connect(gain);gain.connect(mbus);music.source=source;music.gain=gain;music.at=ctx.currentTime;
  source.onended=()=>{source.disconnect();gain.disconnect();};
  source.start(0,music.offset%source.loopEnd);
 }
 function stopMusic(reset=true,fade=.18){
  music.wanted=false;
  if(music.source){const source=music.source,gain=music.gain,t=ctx.currentTime;
   music.offset=(music.offset+t-music.at)%source.loopEnd;
   gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(0,t+fade);
   source.stop(t+fade+.01);music.source=null;music.gain=null;
  }
  if(reset)music.offset=0;
 }
 function updateMusic(wanted,quiet=false){
  if(!wanted){if(music.wanted||music.source)stopMusic(false);return;}
  const start=!music.wanted;music.wanted=true;
  if(music.quiet!==quiet){music.quiet=quiet;if(music.gain)music.gain.gain.setTargetAtTime(MUSIC_LEVEL*(quiet?.22:1),ctx.currentTime,.09);}
  if(start&&!music.buffer)loadMusic();
  syncMusic();
 }

 function makeIR(sec,decay,tone){
  const sr=ctx.sampleRate,len=Math.floor(sr*sec),b=ctx.createBuffer(2,len,sr);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;
   for(let i=0;i<len;i++){const t=i/len;let x=(Math.random()*2-1)*Math.pow(1-t,decay);lp+=(x-lp)*tone;d[i]=lp*(i<sr*.004?i/(sr*.004):1);}
   for(const [ms,g] of [[11,.5],[19,.35],[29,.3],[41,.22],[57,.16]]){const k=Math.floor(sr*ms/1000)+(c?37:0);if(k<len)d[k]+=g*(c?-.8:1);}}
  return b;
 }
 function init(primed){
  if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  ctx=primed||new AC();
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=8;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.14;
  lim=ctx.createDynamicsCompressor();lim.threshold.value=-3;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.09;
  master=ctx.createGain();master.gain.value=on?.95:0;
  bus=ctx.createGain();vbus=ctx.createGain();mbus=ctx.createGain();
  bus.gain.value=volumes.effects;vbus.gain.value=volumes.voice;mbus.gain.value=volumes.music;
  bus.connect(comp);vbus.connect(comp);mbus.connect(comp);comp.connect(lim);lim.connect(master);master.connect(ctx.destination);
  irBuf=makeIR(1.6,2.8,.3);verb=ctx.createConvolver();verb.buffer=irBuf;const vr=ctx.createGain();vr.gain.value=.4;verb.connect(vr);vr.connect(bus);
  vverb=ctx.createConvolver();vverb.buffer=irBuf;const vvr=ctx.createGain();vvr.gain.value=.4;vverb.connect(vvr);vvr.connect(vbus);
  const len=ctx.sampleRate*2;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  // 성대 소리: 배음이 부드럽게 줄어드는 펄스
  const N=48,re=new Float32Array(N+1),im=new Float32Array(N+1);for(let n=1;n<=N;n++){im[n]=Math.pow(n,-1.55)*(n%2?1:.85);}glot=ctx.createPeriodicWave(re,im,{disableNormalization:false});
  makeFallbackVoice();loadSoundBank();loadBackVoice();loadOpeningVoice();loadGreetingVoice();loadFirstHitVoice();loadVictoryVoice();loadRetortVoice();loadCombatVoices();loadMusic();
 }
 function unlock(primed){try{init(primed);if(ctx&&ctx.state!=='running'){const p=ctx.resume();if(p&&p.catch)p.catch(()=>{});}}catch(_){}}
 // 잠깐 멈춤(설정 창): 이미 걸어 둔 소리(말소리 글자들)까지 그 자리에서 멈췄다가 이어진다
 function hold(on){try{if(tts){const s=window.speechSynthesis;if(s){if(on)s.pause();else s.resume();}}if(!ctx)return;const p=on?ctx.suspend():ctx.resume();if(p&&p.catch)p.catch(()=>{});}catch(_){}}
 function ready(){return ctx&&on&&(baking||ctx.state==='running');}
 function setOn(v){on=!!v;if(!on&&tts)tts.stop();if(master)master.gain.setTargetAtTime(on?.95:0,ctx.currentTime,.03);}
 let tts=null,backBuffer=null,backLoad=null;
 let openingBuffer=null,openingLoad=null;
 let greetingBuffer=null,greetingLoad=null;
 let firstHitBuffer=null,firstHitLoad=null;
 let victoryBuffer=null,victoryLoad=null;
 let retortBuffer=null,retortLoad=null;
 const combatClips={
  '탈운명 펀치!':{file:'punch',buffer:null,load:null},
  '탈운명 칼빵!':{file:'knife',buffer:null,load:null},
  '탈운명 샷!':{file:'shot',buffer:null,load:null},
  '베나이다.':{file:'benaida',buffer:null,load:null}
 };
 function loadCombatVoices(){
  if(!ctx)return;
  for(const clip of Object.values(combatClips)){
   if(clip.buffer||clip.load)continue;
   const ac=ctx;
   clip.load=fetch('assets/player-unfate-'+clip.file+'-ko-male.mp3')
    .then(r=>{if(!r.ok)throw new Error('combat voice load');return r.arrayBuffer();})
    .then(data=>ac.decodeAudioData(data)).then(buffer=>{clip.buffer=buffer;}).catch(()=>{});
  }
 }
 function loadBackVoice(){
  if(!ctx)return Promise.resolve(null);
  if(!backLoad){const ac=ctx;
   backLoad=fetch('assets/amback-ko-male.mp3').then(r=>{if(!r.ok)throw new Error('voice load');return r.arrayBuffer();})
    .then(data=>ac.decodeAudioData(data)).then(buffer=>backBuffer=buffer).catch(()=>null);
  }
  return backLoad;
 }
 function loadOpeningVoice(){
  if(!ctx)return Promise.resolve(null);
  if(!openingLoad){const ac=ctx;openingLoad=fetch('assets/who-are-you-ko.mp3').then(r=>{if(!r.ok)throw new Error('voice load');return r.arrayBuffer();}).then(data=>ac.decodeAudioData(data)).then(b=>openingBuffer=b).catch(()=>null);}
  return openingLoad;
 }
 function loadGreetingVoice(){
  if(!ctx)return Promise.resolve(null);
  if(!greetingLoad){const ac=ctx;greetingLoad=fetch('assets/player-greeting-ko.mp3').then(r=>{if(!r.ok)throw new Error('voice load');return r.arrayBuffer();}).then(data=>ac.decodeAudioData(data)).then(b=>greetingBuffer=b).catch(()=>null);}
  return greetingLoad;
 }
 // 플레이어의 첫 타격과 승리 대사도 기기 TTS 대신 고정 남성 음성을 쓴다.
 function loadFirstHitVoice(){
  if(!ctx)return Promise.resolve(null);
  if(!firstHitLoad){const ac=ctx;firstHitLoad=fetch('assets/player-die-ko-male.mp3').then(r=>{if(!r.ok)throw new Error('voice load');return r.arrayBuffer();}).then(data=>ac.decodeAudioData(data)).then(b=>firstHitBuffer=b).catch(()=>{firstHitLoad=null;return null;});}
  return firstHitLoad;
 }
 function loadVictoryVoice(){
  if(!ctx)return Promise.resolve(null);
  if(!victoryLoad){const ac=ctx;victoryLoad=fetch('assets/player-victory-ko-male.mp3').then(r=>{if(!r.ok)throw new Error('voice load');return r.arrayBuffer();}).then(data=>ac.decodeAudioData(data)).then(b=>victoryBuffer=b).catch(()=>{victoryLoad=null;return null;});}
  return victoryLoad;
 }
 // 「뭘 꼬라봐 씨발아」: 엔딩의 그 눈에 대고 뱉는 내 한마디. 내 인사와 같은 목소리로 미리 녹음한 것
 function loadRetortVoice(){
  if(!ctx)return Promise.resolve(null);
  if(!retortLoad){const ac=ctx;retortLoad=fetch('assets/player-retort-ko.mp3').then(r=>{if(!r.ok)throw new Error('voice load');return r.arrayBuffer();}).then(data=>ac.decodeAudioData(data)).then(b=>retortBuffer=b).catch(()=>null);}
  return retortLoad;
 }
 function speakTTS(text){
  if(!on||volumes.voice===0)return null;
  if(tts)tts.stop();
  const synth=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
  let busy=true,started=false,source=null,voiceGain=null,native=false;
  const finish=()=>{busy=false;if(source){source.disconnect();source=null;}if(voiceGain){voiceGain.disconnect();voiceGain=null;}if(tts===handle)tts=null;};
  const handle={get busy(){return busy;},get started(){return started;},stop(){
   if(!busy)return;try{if(source)source.stop();if(native&&synth)synth.cancel();}catch(_){}finish();
  }};
  // 파일을 읽지 못한 경우에도 영문 발음으로 돌아가지 않는다.
  const fallback=()=>{
   if(!busy||!on)return;
   // 고정 플레이어 음성을 못 읽어도 기기 기본 여성 목소리로 바뀌지 않는다.
   if(text==='죽어!'||text==='운명 좁밥'||combatClips[text]){finish();return;}
   if(!synth||!Utterance){finish();return;}
   const sharp=text==='죽어!'||text==='뭘 꼬라봐 씨발아'; // 내 외침은 빠르고 높게, 설계자 말은 느리고 낮게
   const u=new Utterance(text);u.lang='ko-KR';u.rate=sharp?1.15:.9;u.pitch=sharp?1:.75;u.volume=volumes.voice;
   const voices=(synth.getVoices?synth.getVoices():[]).filter(v=>/^ko(?:[-_]|$)/i.test(v.lang));
   const v=voices.find(v=>/남성|남자|\bmale\b|Minho|InJoon|BongJin|Hyunsu|Hyunwoo|Hyun-Woo/i.test(v.name))||voices[0];if(v)u.voice=v;
   native=true;u.onstart=()=>{started=true;};u.onend=u.onerror=finish;
   try{if(synth.paused)synth.resume();synth.speak(u);}catch(_){finish();}
  };
  const play=buffer=>{
   if(!busy||!on)return;
   if(!buffer){fallback();return;}
   try{
    source=ctx.createBufferSource();source.buffer=buffer;
    // 엔딩의 내 한마디만 기존 2.5배에서 5배로 증폭(+6 dB). 음성 설정과 기존 출력 리미터를 그대로 거친다.
    if(text==='뭘 꼬라봐 씨발아'){voiceGain=ctx.createGain();voiceGain.gain.value=5;source.connect(voiceGain);voiceGain.connect(vbus);}
    else source.connect(vbus);
    source.onended=finish;source.start();started=true;
   }catch(_){finish();}
  };
  tts=handle;
  if(text==='암백'&&ctx){if(backBuffer)play(backBuffer);else loadBackVoice().then(play);}
  else if(text==='넌 뭐야?'&&ctx){if(openingBuffer)play(openingBuffer);else loadOpeningVoice().then(play);}
  else if(text==='천지신명이시여...'&&ctx){if(greetingBuffer)play(greetingBuffer);else loadGreetingVoice().then(play);}
  else if(text==='죽어!'&&ctx){if(firstHitBuffer)play(firstHitBuffer);else loadFirstHitVoice().then(play);}
  else if(text==='운명 좁밥'&&ctx){if(victoryBuffer)play(victoryBuffer);else loadVictoryVoice().then(play);}
  else if(text==='뭘 꼬라봐 씨발아'&&ctx){if(retortBuffer)play(retortBuffer);else loadRetortVoice().then(play);}
  // Optional hit lines only use already decoded clips: never speak late after a download.
  else if(combatClips[text])play(combatClips[text].buffer);
  else fallback();
  return handle;
 }
 const live=new Set();
 function track(n){if(baking)return;live.add(n);n.onended=()=>live.delete(n);}
 function stop(keepMusic=false){stopFactoryRoom();stopMusic(!keepMusic,0);if(tts)tts.stop();for(const n of live){try{n.stop();}catch(_){}}live.clear();reactionLive.length=0;lastV=-99;}
 function out(pan=0,wet=.2,voice=false){
  const g=ctx.createGain();let node=g;
  if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;}
  node.connect(voice?vbus:bus);if(wet>0){const s=ctx.createGain();s.gain.value=wet;node.connect(s);s.connect(voice?vverb:verb);}
  return g;
 }
 // 살짝 찌그러뜨려(소프트 클립) 소리를 두껍고 세게
 const curves={};
 function drive(dest,k){
  const w=ctx.createWaveShaper();const key=k.toFixed(1);
  if(!curves[key]){const n=1024,c=new Float32Array(n),t=Math.tanh(k);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/t;}curves[key]=c;}
  w.curve=curves[key];w.oversample='2x';w.connect(dest);return w;
 }
 function env(p,t,peak,a,d,curve){p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(Math.max(.0002,peak),t+a);if(curve==='lin')p.linearRampToValueAtTime(.0001,t+a+d);else p.exponentialRampToValueAtTime(.0001,t+a+d);}
 function osc(dest,t,o){const s=ctx.createOscillator(),g=ctx.createGain();if(o.wave)s.setPeriodicWave(o.wave);else s.type=o.type||'sine';s.frequency.setValueAtTime(o.f0,t);if(o.f1)s.frequency.exponentialRampToValueAtTime(Math.max(1,o.f1),t+(o.glide||o.dur));env(g.gain,t,o.peak,o.a||.001,o.dur,o.curve);s.connect(g);g.connect(dest);s.start(t);s.stop(t+(o.a||.001)+o.dur+.05);track(s);return s;}
 function nz(dest,t,o){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;s.playbackRate.value=o.rate||1;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f1)f.frequency.exponentialRampToValueAtTime(o.f1,t+(o.glide||o.dur));f.Q.value=o.q==null?.8:o.q;env(g.gain,t,o.peak,o.a||.001,o.dur,o.curve);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*1.6);s.stop(t+(o.a||.001)+o.dur+.05);track(s);return s;}
 function clicks(dest,t,n,span,f,peak){for(let i=0;i<n;i++)nz(dest,t+Math.random()*span,{dur:R(.003,.009),peak:peak*R(.4,1),f:f*R(.7,1.4),q:3});}
 function ring(dest,t,fs,dur,peak){fs.forEach((f,i)=>osc(dest,t,{f0:f*R(.995,1.005),dur:dur*(1-i*.18),peak:peak*(1-i*.2),a:.0015}));}

 /* ===== 미리 구워 두는 소리 =====
  * 94개 소리를 배포 전에 합성한 파일 하나로 읽는다. 플레이 중에는 오프라인 합성을 하지 않는다.
  * bakeOne은 개발용 음원 추출에만 사용한다. */
 const SFX={},reactionNames=['grunt','oof','yelp','scream','groan','gasp','cough','reptile'];
 // Start downloading during scene setup; decode once when the user unlocks audio.
 const bankDownload=Promise.all([
  fetch('assets/fight-sounds-v1.json').then(r=>{if(!r.ok)throw new Error('sound index');return r.json();}),
  fetch('assets/fight-sounds-v1.mp3').then(r=>{if(!r.ok)throw new Error('sound bank');return r.arrayBuffer();})
 ]).catch(()=>null);
 // 별도 원본 총성 네 가지. 다른 타격음·목소리 뱅크는 그대로 둔다.
 const pistolDownload=fetch('assets/pistol-shots-v2.wav').then(r=>{if(!r.ok)throw new Error('pistol sounds');return r.arrayBuffer();}).catch(()=>null);
 const uncannyDownload=Promise.all([
  fetch('assets/uncanny-cries-v2.json').then(r=>{if(!r.ok)throw new Error('uncanny index');return r.json();}),
  fetch('assets/uncanny-cries-v2.wav').then(r=>{if(!r.ok)throw new Error('uncanny sounds');return r.arrayBuffer();})
 ]).catch(()=>null);
 let bankLoad=null,bankBuffer=null,fallbackVoice=null;
 function makeFallbackVoice(){
  // A short bounded fallback while the single download is pending or unavailable.
  fallbackVoice=ctx.createBuffer(1,4800,24000);const d=fallbackVoice.getChannelData(0);
  for(let i=0;i<d.length;i++){const t=i/24000,e=Math.min(1,t/.006)*Math.pow(1-i/d.length,2.4),p=TAU*(145*t-110*t*t);d[i]=e*(Math.sin(p)*.48+Math.sin(p*2)*.2+Math.sin(p*5)*.1+(Math.random()*2-1)*.05);}
 }
 function loadSoundBank(){
  if(bankLoad||!ctx)return bankLoad;const ac=ctx;
  uncannyDownload.then(async data=>{
   if(!data)return;const [index,bytes]=data,buffer=await ac.decodeAudioData(bytes);
   const bank={};for(const [name,ranges] of Object.entries(index.clips)){
    const clips=ranges.map(([at,length])=>({buffer,offset:at/index.sampleRate,duration:length/index.sampleRate,length}));
    if(clips.some(c=>c.offset+c.duration>buffer.duration+.002))return;
    bank['v:'+name]=clips;
   }
   Object.assign(SFX,bank);
  }).catch(()=>{});
  pistolDownload.then(bytes=>bytes?ac.decodeAudioData(bytes):null).then(buffer=>{
   if(!buffer||buffer.duration<2)return;
   SFX.shot=Array.from({length:4},(_,i)=>({buffer,offset:i*.5,duration:.5,length:Math.round(buffer.sampleRate*.5)}));
  }).catch(()=>{});
  bankLoad=bankDownload.then(async data=>{
   if(!data)return false;const [index,bytes]=data,buffer=await ac.decodeAudioData(bytes);
   const bank={};for(const [name,clips] of Object.entries(index.clips)){
    if(name==='shot')continue; // 새 총성이 준비되기 전에는 아래의 짧은 합성을 쓴다.
    bank[name]=clips.map(([start,length])=>({buffer,offset:start/index.sampleRate,duration:length/index.sampleRate,length}));
    if(bank[name].some(c=>c.offset+c.duration>buffer.duration+.002))throw new Error('sound bank length');
   }
   Object.assign(SFX,bank);bankBuffer=buffer;return true;
  }).catch(()=>false);return bankLoad;
 }
 function startClip(source,clip,when){
  source.buffer=clip.buffer||clip;
  if(clip.buffer)source.start(when,clip.offset,clip.duration);else source.start(when);
 }
 const reactionLive=[],reactionBags={},reactionLast={};
 function bakeOne(fn,dur,raw,mono=false){
  const sr=mono?24000:ctx.sampleRate,oc=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(mono?1:2,Math.ceil(sr*dur),sr);
  const saved=[ctx,bus,vbus,verb,vverb];
  baking=true;
  try{ctx=oc;bus=oc.createGain();bus.connect(oc.destination);vbus=bus;
   if(mono){verb=oc.createGain();}else{verb=oc.createConvolver();verb.buffer=irBuf;const vr=oc.createGain();vr.gain.value=.4;verb.connect(vr);vr.connect(oc.destination);}
   vverb=verb;fn(.004);}
  finally{baking=false;[ctx,bus,vbus,verb,vverb]=saved;}
  // 옛 사파리는 startRendering이 약속(Promise)을 돌려주지 않는다. 끝내 안 오면 3초 뒤 포기
  let pr=null;try{pr=oc.startRendering();}catch(_){pr=null;}
  if(!pr||!pr.then)pr=new Promise(res=>{oc.oncomplete=e=>res(e.renderedBuffer);});
  pr=Promise.race([pr,new Promise(res=>setTimeout(()=>res(null),3000))]);
  return pr.then(b=>{if(!b)return null;
   // 끝을 살짝 줄여 딸깍 소리를 막고, 최고점을 맞춘다
   let pk=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a;}}
   const k=raw?1:pk>1e-4?.92/pk:1,fade=Math.floor(sr*.01);
   for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){d[i]*=k;}for(let i=0;i<fade;i++)d[d.length-1-i]*=i/fade;}
   return b;});
 }
 function play(name,gain=1,pan=0,rate=1){
  const list=SFX[name];if(!list||!list.length)return false;
  const t=ctx.currentTime,s=ctx.createBufferSource(),g=ctx.createGain(),clip=list[(Math.random()*list.length)|0];s.playbackRate.value=rate*R(.96,1.04);g.gain.value=gain;
  let node=g;if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;}
  s.connect(g);node.connect(bus);track(s);startClip(s,clip,t);return true;
 }

 /* ---- 소리 재료(굽거나 바로 낼 때 같이 쓴다) ---- */
 const MAKE={
  // 맨주먹으로 얼굴: 묵직한 퍽 + 살 뭉개짐 + 깊은 쿵 + 뼈 삐걱(황동 없이)
  face(o,t,p){const d=drive(o,2.9),j=R(.92,1.08);
   nz(d,t,{dur:.006,peak:.72,f:2500*j,type:'highpass',q:.5});
   nz(d,t+.001,{dur:.05,peak:.82,f:1250*j,f1:680,q:.9});
   osc(d,t,{f0:132*j,f1:44,dur:.13+p*.05,peak:1});
   osc(d,t,{type:'triangle',f0:280*j,f1:108,dur:.05,peak:.42});
   osc(d,t+.002,{f0:54,f1:32,dur:.2+p*.06,peak:.6*p,a:.003});
   nz(d,t+.004,{dur:.09+p*.03,peak:.42*p,f:600,f1:220,type:'lowpass',q:.7});
   clicks(d,t+.003,2+Math.round(p*2),.018,2200,.32);},
  // 맨주먹으로 몸통: 더 깊은 쿵 + 출렁
  body(o,t,p){const d=drive(o,2.5),j=R(.9,1.08);
   nz(d,t,{dur:.008,peak:.5,f:2000,type:'highpass',q:.5});
   osc(d,t,{f0:104*j,f1:36,dur:.22+p*.06,peak:1});
   osc(d,t,{f0:50,f1:30,dur:.3,peak:.62*p,a:.004});
   nz(d,t,{dur:.08,peak:.66,f:780*j,f1:280,q:.8});
   nz(d,t+.008,{dur:.18,peak:.4,f:420,f1:130,type:'lowpass',q:.6});
   osc(d,t+.03,{f0:70,f1:54,dur:.18,peak:.2,type:'triangle'});},
  faceH(o,t,p){MAKE.face(o,t,p);},bodyH(o,t,p){MAKE.body(o,t,p);},
  // 칼로 찌르기: 날이 살을 뚫는 슥 + 질척 + 둔탁
  stab(o,t,p){const d=drive(o,1.8);
   nz(d,t,{dur:.03,peak:.55,f:4200,f1:2200,q:1.2});
   const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=7;f.frequency.setValueAtTime(480,t+.008);f.frequency.exponentialRampToValueAtTime(1600,t+.15);env(g.gain,t+.008,.85,.006,.16);s.connect(f);f.connect(g);g.connect(d);s.start(t+.008,Math.random());s.stop(t+.22);track(s);
   osc(d,t,{f0:135,f1:60,dur:.1,peak:.7});
   clicks(d,t+.01,3,.04,2600,.25);},
  // 긋기: 휙 + 살 찢기는 소리
  slash(o,t,p){const d=drive(o,1.6);
   nz(d,t,{dur:.08,peak:.45,f:2200,f1:5600,q:1.3});
   // 찢기는 소리: 잡음을 빠르게 떨게(진폭 변조) 한 뒤 엔벨로프로 감싼다
   const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),ga=ctx.createGain(),am=ctx.createOscillator(),ag=ctx.createGain();s.buffer=noise;f.type='bandpass';f.frequency.value=2600;f.Q.value=1.6;
   ga.gain.value=.6;am.frequency.value=R(55,75);ag.gain.value=.4;am.connect(ag);ag.connect(ga.gain);env(g.gain,t+.01,.6,.004,.085);s.connect(f);f.connect(ga);ga.connect(g);g.connect(d);s.start(t+.01,Math.random());s.stop(t+.14);am.start(t);am.stop(t+.14);track(s);track(am);
   nz(d,t+.02,{dur:.07,peak:.3,f:900,f1:1500,q:4});
   osc(d,t,{f0:150,f1:80,dur:.05,peak:.25});},
  // 칼을 뽑을 때: 쭈욱 빨려 나오는 소리
  pull(o,t,p){const d=drive(o,1.6);
   const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=6;f.frequency.setValueAtTime(1600,t);f.frequency.exponentialRampToValueAtTime(420,t+.17);env(g.gain,t,.8,.012,.18);s.connect(f);f.connect(g);g.connect(d);s.start(t,Math.random());s.stop(t+.25);track(s);
   nz(d,t+.11,{dur:.14,peak:.4,f:700,f1:300,type:'lowpass',q:1});
   clicks(d,t+.03,2,.05,2200,.2);},
  // 권총 폴백: 짧고 날카로운 탕 + 빠르게 사라지는 몸통 + 슬라이드. 저음·잔향이 다음 발을 덮지 않게 한다.
  shot(o,t,p){const d=drive(o,4.5);
   nz(d,t,{dur:.006,peak:1.2,f:2300,type:'highpass',q:.4,a:.0004});
   nz(d,t,{dur:.055,peak:1,f:3800,f1:1800,q:.6,a:.0005});
   nz(d,t+.003,{dur:.07,peak:.45,f:850,type:'lowpass',q:.5});
   osc(d,t,{f0:165,dur:.065,peak:.42,a:.0005});
   ring(o,t,[1280,2140,3460],.075,.13);
   nz(o,t+.023,{dur:.025,peak:.12,f:2600,q:.6});
   clicks(o,t+.052,2,.016,3400,.1);
   // 바닥에 떨어지는 탄피
   for(let i=0;i<2;i++){const tt=t+.245+i*.047;ring(o,tt,[5700*R(.97,1.03),7200],.035,.018/(i+1));}},
  // 총알이 살에 박힘
  flesh(o,t,p){const d=drive(o,2.4);
   nz(d,t,{dur:.03,peak:.8,f:750,q:.8});
   osc(d,t,{f0:165,f1:62,dur:.08,peak:.85});
   const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=5;f.frequency.setValueAtTime(1300,t+.006);f.frequency.exponentialRampToValueAtTime(600,t+.09);env(g.gain,t+.006,.5,.004,.09);s.connect(f);f.connect(g);g.connect(d);s.start(t+.006,Math.random());s.stop(t+.12);track(s);},
  // 총알이 머리에 박힘(딱딱한 소리가 섞인다)
  skull(o,t,p){MAKE.flesh(o,t,p);const d=drive(o,1.8);nz(d,t,{dur:.01,peak:.32,f:3800,type:'highpass',q:.4});clicks(d,t+.004,6,.03,2600,.16);osc(d,t+.006,{type:'triangle',f0:620,f1:240,dur:.04,peak:.18});osc(d,t,{f0:120,f1:50,dur:.12,peak:.5});},
  block(o,t,p){osc(o,t,{type:'triangle',f0:240,f1:110,dur:.08,peak:.7});osc(o,t,{f0:95,f1:55,dur:.14,peak:.5});nz(o,t,{dur:.05,peak:.5,f:1300,q:.8});nz(o,t,{dur:.11,peak:.25,f:500,f1:200,type:'lowpass'});},
 };
 function fx(name,gain,pan,rate,p=1){if(play(name,gain,pan,rate))return;const o=out(pan,name==='shot'?.12:.14),g=ctx.createGain();g.gain.value=gain*.8;g.connect(o);MAKE[name](g,ctx.currentTime+.002,p);}

 /* ---- 휘두르는 소리 ---- */
 function whoosh(p=1,kind){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.08);
  if(kind==='slash'){nz(o,t,{dur:.13,peak:.28*p,a:.02,f:1600,f1:5200,q:1.4});nz(o,t+.02,{dur:.08,peak:.12*p,f:6000,type:'highpass',q:.7});return;}
  const heavy=p>.7;nz(o,t,{dur:heavy?.16:.11,peak:(heavy?.36:.24)*Math.min(1.3,p),a:heavy?.035:.02,f:heavy?420:700,f1:heavy?1800:2400,q:1.2});
 }
 /* ---- 맞는 소리 ---- */
 // 맞는 소리가 먼저 또렷하게 들리도록 목소리를 잠깐 줄이고, 그동안 새로 나는 목소리는 조금 늦게 낸다
 let duckUntil=0;
 function duck(){if(!ready()||!vbus)return;const t=ctx.currentTime,g=vbus.gain;g.cancelScheduledValues(t);g.setValueAtTime(.3,t);g.setValueAtTime(.3,t+.03);g.linearRampToValueAtTime(1,t+.09);duckUntil=t+.075;}
 function bone(o,t,p){clicks(o,t+.004,4+Math.round(p*3),.03,2600,.55);nz(o,t,{dur:.012,peak:.5*p,f:3800,type:'highpass',q:.4});osc(o,t+.006,{type:'triangle',f0:620,f1:240,dur:.04,peak:.25});}
 function hit(tool,kind,part,p,blocked){
  if(!ready())return;const head=/head|face|nose|mouth|chin|eye|beard/i.test(part),pan=R(-.15,.15);p=clamp(p,.4,2.4);
  if(blocked){fx('block',.9,pan,1);return;}
  if(part==='crown'){crownT(out(pan,.25),ctx.currentTime,p);return;}
  if(part==='halo'){haloT(out(pan,.3),ctx.currentTime,p,tool==='gun');return;}
  if(tool==='hand'){const big=kind!=='jab';fx(head?(big?'faceH':'face'):(big?'bodyH':'body'),big?1:.9,pan,big?.92:.98,p);}
  else if(tool==='knife')fx(kind==='slash'?'slash':'stab',kind==='slash'?.75:1,pan,1,p);
  else if(tool==='gun')fx(head?'skull':'flesh',.95,pan,1,p);
 }
 function crownT(o,t,p){ring(o,t,[880,2070,3510,5200],.22,.16*p);osc(o,t,{type:'triangle',f0:300,f1:150,dur:.05,peak:.4});clicks(o,t+.01,10,.25,5200,.22);}
 function crown(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.25);crownT(o,t,p);}
 function crownLand(){if(!ready())return;const t=ctx.currentTime,o=out(0,.3);osc(o,t,{f0:160,f1:70,dur:.12,peak:.5});ring(o,t,[620,1450,2300],.16,.12);clicks(o,t,16,.55,4600,.24);}
 function staffLand(p=1){if(!ready())return;const t=ctx.currentTime,o=out(.3,.18);
  osc(o,t,{type:'triangle',f0:260,f1:100,dur:.075,peak:.34*p});
  nz(o,t,{dur:.035,peak:.22*p,f:1250,type:'bandpass',q:1.3});
  ring(o,t+.006,[810,1870],.12,.045*p);
 }
 function tooth(){if(!ready())return;const t=ctx.currentTime,o=out(R(-.4,.4),.12);clicks(o,t,3,.01,4200,.5);osc(o,t,{f0:2600,f1:2100,dur:.03,peak:.2});}
 function toothBounce(){if(!ready())return;const t=ctx.currentTime,o=out(R(-.5,.5),.15);for(let i=0;i<3;i++){osc(o,t+i*.09*(1-i*.2),{f0:3200*R(.9,1.1),dur:.02,peak:.16/(i+1)});clicks(o,t+i*.09,1,.002,5000,.2/(i+1));}}
 function crack(p=1){if(!ready())return;const t=ctx.currentTime,o=out(0,.15);bone(o,t,p*1.4);osc(o,t,{f0:180,f1:80,dur:.08,peak:.4});}
 /* ---- 후광 ---- */
 // 맞음: 종처럼 울리는 금속(총이면 튕겨 나가는 소리까지)
 function haloT(o,t,p,gun){ring(o,t,[1240,2790,4380,6550],.75,.22*Math.min(p,1.6));osc(o,t,{type:'triangle',f0:420,f1:260,dur:.05,peak:.48});clicks(o,t,3,.01,6200,.4);if(gun)osc(o,t+.004,{f0:3600,f1:1400,dur:.3,peak:.07});}
 // 금 가는 소리: 유리처럼 자잘하게 바스락 + 짧은 울림
 function haloCrack(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.25);clicks(o,t,12,.09,6200,.5*p);ring(o,t+.01,[3300,5400,7900],.2,.12*p);nz(o,t,{dur:.045,peak:.45*p,f:4200,q:1.2});}
 // 형광등 지직
 let buzzT=0;function haloBuzz(){if(!ready())return;const t=ctx.currentTime;if(t<buzzT)return;buzzT=t+.12;const o=out(0,.04),c=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();c.type='sawtooth';c.frequency.value=120;f.type='bandpass';f.frequency.value=1100;f.Q.value=1.2;env(g.gain,t,.12,.004,.07);c.connect(f);f.connect(g);g.connect(o);c.start(t);c.stop(t+.1);track(c);}
 // 바닥에 떨어짐: 쨍그랑 + 둔탁
 function haloLand(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.3);osc(o,t,{f0:150,f1:70,dur:.12,peak:.45*p});ring(o,t,[540,1290,2160,3370],.9,.14*p);clicks(o,t,8,.2,4800,.22*p);}
 // 동전처럼 떨며 눕는 소리(점점 빨라지는 톡톡, 마지막에 탁)
 function haloTap(p=.5,last){if(!ready())return;const t=ctx.currentTime,o=out(0,.25);ring(o,t,[1080*R(.98,1.02),2510,4020],last?.5:.14,(last?.1:.06)*p);clicks(o,t,1,.002,5200,.18*p);}
 /* ---- 쉬익(파충류) ---- */
 function hiss(p=1){if(!ready())return;const t=Math.max(ctx.currentTime+.01,duckUntil),o=out(R(-.15,.15),.16,true);nz(o,t,{dur:.5,peak:.5*p,a:.05,f:4000,f1:3100,q:1.1,curve:'lin'});nz(o,t,{dur:.46,peak:.18*p,a:.07,f:7000,type:'highpass',q:.5,curve:'lin'});nz(o,t+.02,{dur:.32,peak:.14*p,f:2200,q:1.6});}
 /* ---- 동전(돼지저금통) ---- */
 // 짤랑: 높은 금속 배음 몇 개 + 딸깍(너무 촘촘히 겹치지 않게 간격을 둔다)
 let coinT=0;function coin(p=1){if(!ready())return;const t=ctx.currentTime;if(t<coinT)return;coinT=t+.028;const o=out(R(-.5,.5),.18),f=R(2900,4300);
  ring(o,t,[f,f*2.38,f*3.92],R(.1,.18),.14*p);clicks(o,t,1,.002,6500,.2*p);}
 // 와르르: 짤랑이 줄줄이 + 쏟아지는 쇳소리 + 배가 터지는 둔탁한 소리
 function coinGush(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.22),n=Math.round(10+14*p),span=.25+.4*p;
  for(let i=0;i<n;i++){const tt=t+Math.pow(Math.random(),1.4)*span,f=R(2600,4600),k=1-(tt-t)/span*.6;ring(o,tt,[f,f*2.41,f*3.87],R(.08,.16),.1*p*k);}
  nz(o,t,{dur:.25+.35*p,peak:.15*p,a:.02,f:6200,q:.7,curve:'lin'});osc(o,t,{f0:130,f1:62,dur:.14,peak:.45*Math.min(p,1.2)});nz(o,t,{dur:.06,peak:.25,f:900,f1:400,type:'lowpass',q:.7});}
 /* ---- 살·천이 찢어짐, 잘림, 다시 자람 ---- */
 function tearNoise(dest,t,dur,f,peak,amHz){const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain(),ga=ctx.createGain(),am=ctx.createOscillator(),ag=ctx.createGain();s.buffer=noise;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=1.5;
  ga.gain.value=.55;am.frequency.value=amHz;ag.gain.value=.45;am.connect(ag);ag.connect(ga.gain);env(g.gain,t,peak,.006,dur);s.connect(fl);fl.connect(ga);ga.connect(g);g.connect(dest);s.start(t,Math.random());s.stop(t+dur+.05);am.start(t);am.stop(t+dur+.05);track(s);track(am);}
 function rip(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.14),d=drive(o,1.6);tearNoise(d,t,.2,1900,.95*p,R(48,62));nz(d,t+.01,{dur:.09,peak:.45*p,f:700,f1:300,type:'lowpass'});}
 function peel(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.14),d=drive(o,1.5);tearNoise(d,t,.13,2600,.8*p,R(70,90));nz(d,t+.05,{dur:.06,peak:.45*p,f:900,f1:420,type:'lowpass',q:.8});}
 function chop(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.15,.15),.18),d=drive(o,2.2);
  nz(d,t,{dur:.008,peak:.8*p,f:3600,type:'highpass',q:.5});osc(d,t,{f0:120,f1:48,dur:.13,peak:.75*p});
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=6;f.frequency.setValueAtTime(1500,t+.01);f.frequency.exponentialRampToValueAtTime(420,t+.16);env(g.gain,t+.01,.7*p,.005,.17);s.connect(f);f.connect(g);g.connect(d);s.start(t+.01,Math.random());s.stop(t+.24);track(s);
  clicks(d,t+.004,3,.03,2400,.3*p);}
 function squelch(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.16);
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),am=ctx.createOscillator(),ag=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=7;f.frequency.setValueAtTime(320,t);f.frequency.exponentialRampToValueAtTime(1300,t+.55);
  am.frequency.value=17;ag.gain.value=.5;const ga=ctx.createGain();ga.gain.value=.5;am.connect(ag);ag.connect(ga.gain);env(g.gain,t,.8*p,.06,.55,'lin');s.connect(f);f.connect(ga);ga.connect(g);g.connect(o);s.start(t,Math.random());s.stop(t+.7);am.start(t);am.stop(t+.7);track(s);track(am);
  osc(o,t,{f0:85,f1:150,dur:.5,peak:.36*p,a:.05,type:'triangle'});}
 // 뼈가 뚜둑 뻗어 나옴: 뼈 꺾이는 딸깍 + 젖은 둔탁함
 function boneOut(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.15);bone(o,t,p*1.1);osc(o,t,{f0:150,f1:62,dur:.1,peak:.4*p});nz(o,t+.01,{dur:.13,peak:.22*p,f:520,f1:1500,q:2.2});}
 // 비늘이 돋아 굳음: 마른 자잘한 바스락
 function scaleSet(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.12);clicks(o,t,9,.24,3300,.2*p);nz(o,t,{dur:.2,peak:.09*p,f:6000,type:'highpass',q:.5,curve:'lin'});}
 function pop(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.14);osc(o,t,{f0:420,f1:1300,dur:.06,peak:.4*p});nz(o,t,{dur:.012,peak:.3*p,f:2600,q:1});ring(o,t+.03,[2700,4050],.12,.05*p);}
 function unmask(p=1){if(!ready())return;const t=ctx.currentTime,o=out(0,.25),d=drive(o,1.8);
  tearNoise(d,t,.38,2100,.6*p,R(40,52));tearNoise(d,t+.12,.26,3200,.4*p,R(70,85));osc(d,t,{f0:110,f1:45,dur:.25,peak:.7*p});nz(d,t,{dur:.012,peak:.6*p,f:3800,type:'highpass',q:.5});
  hiss(.9*p);}
 function pat(p=.6){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.08);osc(o,t,{f0:150,f1:80,dur:.07,peak:.3*p});nz(o,t,{dur:.04,peak:.18*p,f:500,type:'lowpass',q:.7});}
 /* ---- 총 ---- */
 function gunshot(){if(!ready())return;fx('shot',1,.12,1);}
 function dry(){if(!ready())return;const t=ctx.currentTime,o=out(.2,.05);clicks(o,t,1,.002,2200,.5);osc(o,t,{type:'triangle',f0:900,f1:400,dur:.02,peak:.2});}
 /* ---- 피 ---- */
 function spurt(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.12);nz(o,t,{dur:.18,peak:.22*p,f:700,f1:300,type:'lowpass',q:1});nz(o,t+.02,{dur:.09,peak:.12*p,f:1800,q:3});}
 function pull(){if(!ready())return;fx('pull',.9,R(-.1,.1),1);}
 let dripT=0;function drip(p=.4){if(!ready())return;const t=ctx.currentTime;if(t<dripT)return;dripT=t+.06;const o=out(R(-.6,.6),.25);osc(o,t,{f0:R(900,1500),f1:R(500,700),dur:.03,peak:.08*p});}
 // 살점이 바닥에 철퍽: 젖은 저음 + 짧은 찰싹
 let slapT=0;function slap(p=.6,size=.04){if(!ready())return;const t=ctx.currentTime;if(t<slapT)return;slapT=t+.03;const o=out(R(-.5,.5),.14),d=drive(o,1.6),j=clamp(.03/Math.max(size,.012),.6,1.6);
  osc(d,t,{f0:150*j,f1:60*j,dur:.07,peak:.6*p,type:'triangle'});nz(d,t,{dur:.05,peak:.5*p,f:900*j,f1:360,q:.9});nz(d,t+.004,{dur:.03,peak:.25*p,f:2200,type:'lowpass',q:.7});}
 // 두개골 함몰: 둔탁한 쿵 + 뼈가 으스러지는 자잘한 균열 + 젖은 눌림
 function skullCrush(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.15,.15),.22),d=drive(o,2.4);
  osc(d,t,{f0:95,f1:34,dur:.22,peak:1*p});nz(d,t,{dur:.04,peak:.7*p,f:900,f1:300,type:'lowpass',q:.7});
  clicks(d,t+.006,14,.13,2400,.5*p);clicks(d,t+.04,8,.09,3400,.3*p);
  osc(d,t+.008,{type:'triangle',f0:520,f1:170,dur:.07,peak:.3*p});
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=5;f.frequency.setValueAtTime(700,t+.03);f.frequency.exponentialRampToValueAtTime(260,t+.26);env(g.gain,t+.03,.5*p,.01,.25);s.connect(f);f.connect(g);g.connect(d);s.start(t+.03,Math.random());s.stop(t+.32);track(s);}
 // 턱이 뜯겨 나감: 짧은 뼈 끊김 + 길게 찢어지는 살 + 왈칵
 function jawRip(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.1,.1),.2),d=drive(o,2.2);
  nz(d,t,{dur:.008,peak:.7*p,f:3400,type:'highpass',q:.5});osc(d,t,{f0:130,f1:50,dur:.14,peak:.8*p});clicks(d,t+.004,5,.04,2300,.4*p);
  tearNoise(d,t+.02,.3,1700,.9*p,R(38,50));tearNoise(d,t+.14,.2,2600,.5*p,R(60,80));
  nz(d,t+.05,{dur:.16,peak:.3*p,f:800,f1:320,type:'lowpass',q:.9});}
 // 머리 한 조각이 터져 나감(총): 젖은 터짐 + 뼈 조각 튐 + 짧은 저음
 function blowout(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.15,.15),.22),d=drive(o,2.6);
  nz(d,t,{dur:.012,peak:.8*p,f:3600,type:'highpass',q:.5});osc(d,t,{f0:150,f1:48,dur:.18,peak:.9*p});
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=4;f.frequency.setValueAtTime(1400,t+.008);f.frequency.exponentialRampToValueAtTime(380,t+.22);env(g.gain,t+.008,.8*p,.004,.24);s.connect(f);f.connect(g);g.connect(d);s.start(t+.008,Math.random());s.stop(t+.32);track(s);
  clicks(d,t+.01,9,.12,3000,.45*p);osc(d,t+.012,{type:'triangle',f0:620,f1:210,dur:.05,peak:.22*p});}
 // 살가죽·귀·코끝이 잘려 나감: 가벼운 썩 + 짧은 찢김
 function snip(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.25,.25),.16),d=drive(o,1.9);
  nz(d,t,{dur:.006,peak:.7*p,f:3800,type:'highpass',q:.6});osc(d,t,{f0:180,f1:70,dur:.07,peak:.45*p});
  tearNoise(d,t+.008,.11,2400,.7*p,R(70,95));clicks(d,t+.004,2,.02,2600,.25*p);}
 // 턱이 빠지는 소리: 관절이 빠지는 둔탁한 뚝 + 질겅
 function jawPop(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.1,.1),.18),d=drive(o,2);
  osc(d,t,{f0:210,f1:70,dur:.09,peak:.75*p});clicks(d,t+.003,4,.03,2100,.5*p);nz(d,t+.012,{dur:.1,peak:.4*p,f:600,f1:260,type:'lowpass',q:1});
  tearNoise(d,t+.03,.12,1500,.35*p,R(40,55));}
 // 머리가 베여 떨어짐: 묵직한 썩둑 + 뼈 끊김 + 왈칵
 function behead(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.1,.1),.2),d=drive(o,2.6);
  nz(d,t,{dur:.008,peak:.85*p,f:3200,type:'highpass',q:.5});osc(d,t,{f0:110,f1:42,dur:.16,peak:.9*p});
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=6;f.frequency.setValueAtTime(1600,t+.012);f.frequency.exponentialRampToValueAtTime(380,t+.2);env(g.gain,t+.012,.85*p,.006,.22);s.connect(f);f.connect(g);g.connect(d);s.start(t+.012,Math.random());s.stop(t+.3);track(s);
  clicks(d,t+.004,6,.04,2200,.4*p);osc(d,t+.01,{type:'triangle',f0:300,f1:120,dur:.06,peak:.2*p});}
 /* ---- 넘어짐 ---- */
 function fall(type){if(!ready())return;const t=ctx.currentTime,o=out(0,.32),d=drive(o,2);
  osc(d,t,{f0:80,f1:30,dur:.4,peak:1});nz(d,t,{dur:.3,peak:.6,f:320,f1:90,type:'lowpass',q:.6});nz(d,t+.01,{dur:.22,peak:.3,f:1600,f1:700,q:.8});
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
  if(o.trem){const tr=ctx.createOscillator(),tg=ctx.createGain();tr.frequency.value=o.trem;tg.gain.setValueAtTime(peak*.24,t);tg.gain.setValueAtTime(peak*.24,t+Math.max(.02,dur-.12));tg.gain.linearRampToValueAtTime(0,t+dur);tr.connect(tg);tg.connect(env_.gain);tr.start(t);tr.stop(t+dur+.1);track(tr);}
  env_.gain.setValueAtTime(peak,t+Math.max(a,dur-rel));env_.gain.exponentialRampToValueAtTime(.0001,t+dur);
  env_.connect(dst);
  for(const n of [src,vib])n.start(t);jit.start(t,Math.random()*1.5);br.start(t,Math.random()*1.5);
  for(const n of [src,vib,jit,br]){n.stop(t+dur+.06);track(n);}
 }
 function breath(t,dur,peak,f0=900,f1=1600,pan=0){const o=out(pan,.15,true);nz(o,t,{dur,peak,a:dur*.3,f:f0,f1,q:.9,curve:'lin'});}
 // Eight distinct articulations per family: different vowels, pitch contours,
 // glottal attacks, double catches, exhalations and lengths, not just pitch shifts.
 function reaction(t,name,i){
  const v=i%8,j=R(.96,1.04),base=[118,142,127,155,109,136,165,122][v]*j;
  const pair=[['eu','eo'],['eo','u'],['a','eo'],['m','a'],['u','eu'],['e','a'],['eo','m'],['a','u']][v];
  const common={f0:base,f1:base*.72,v1:pair[0],v2:pair[1],breath:.2+v*.035,rough:.045+v*.011,attack:.004,release:.035,wet:0,pan:0,vibHz:6+v*.6,bright:2800};
  const emit=(at,o)=>voice(at,Object.assign({},common,o));
  if(name==='grunt'){
   const dur=.12+v*.018;emit(t,{dur,peak:.48,fm:v%3===0?base*1.24:base*.94,fmAt:.18});
   if(v===3||v===6)emit(t+.12,{dur:.1,peak:.23,f0:base*.81,v1:'eo',v2:'m'});
  }else if(name==='oof'){
   breath(t,.055,.22,450,1100);emit(t+.014,{dur:.19+v*.026,peak:.42,f0:base*.84,f1:67+v*3,breath:.5,bright:1800});
  }else if(name==='yelp'){
   emit(t,{dur:.23+v*.029,peak:.5,f0:base*1.35,fm:base*(1.6+v*.04),fmAt:.16,f1:base*.95,v1:v%2?'a':'e',v2:v%3?'eo':'a',rough:.09,bright:3900});
  }else if(name==='scream'){
   emit(t,{dur:.48+v*.047,peak:.47,f0:base*1.15,fm:base*1.8,fmAt:.2,f1:base*.9,v1:v%2?'eu':'a',v2:'a',vib:.035,rough:.11,bright:4000,release:.16});
   if(v%3===1)breath(t+.37,.2,.13,700,1800);
  }else if(name==='groan'){
   emit(t,{dur:.58+v*.056,peak:.34,f0:base*.72,f1:base*.53,v1:v%2?'eu':'m',v2:pair[1],trem:4+v*.45,vib:.027,bright:1500,attack:.04,release:.22});
  }else if(name==='gasp'){
   breath(t,.09+v*.01,.28,800+v*80,2600);emit(t+.06,{dur:.14+v*.023,peak:.33,f0:base*1.25,f1:base,v1:'eo',v2:'a',breath:.65,bright:2600});
  }else if(name==='cough'){
   for(let k=0;k<(v%2?3:2);k++){const at=t+k*.17;breath(at,.065,.3,950,550);emit(at+.016,{dur:.075,peak:.3,f0:base*(1-k*.12),v1:'eo',v2:'m',breath:.7,release:.02});}
  }else if(name==='reptile'){
   emit(t,{dur:.34+v*.06,peak:.44,f0:base*.56,fm:base*.74,f1:base*.39,v1:'o',v2:v%2?'a':'eu',rough:.2,trem:17+v*2,bright:1900,release:.12});
   breath(t+.025,.23+v*.045,.18,1700+v*140,800);
  }
 }
 function playReaction(name,k){
  const list=(name==='reptile'&&SFX['v:reptile-present'])||SFX['v:'+name]||(fallbackVoice?[fallbackVoice]:null);if(!list||!list.length)return false;
  let bag=reactionBags[name];
  if(!bag||!bag.length||bag.some(i=>i>=list.length)){
   bag=list.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[bag[i],bag[j]]=[bag[j],bag[i]];}
   if(bag.length>1&&bag[bag.length-1]===reactionLast[name])[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
   reactionBags[name]=bag;
  }
  const ix=bag.pop();reactionLast[name]=ix;
  const t=ctx.currentTime,s=ctx.createBufferSource(),g=ctx.createGain(),clip=list[ix];s.playbackRate.value=R(.94,1.045);
  g.gain.value=clamp(k,.25,1.3)*.76;s.connect(g);g.connect(vbus);
  // One character, one impact voice. Crossfade the previous cry instead of doubling it.
  while(reactionLive.length){const old=reactionLive.shift();old.g.gain.cancelScheduledValues(t);old.g.gain.setTargetAtTime(.0001,t,.009);try{old.s.stop(t+.035);}catch(_){}}
  const item={s,g,name};reactionLive.push(item);live.add(s);
  s.onended=()=>{live.delete(s);const n=reactionLive.indexOf(item);if(n>=0)reactionLive.splice(n,1);s.disconnect();g.disconnect();};startClip(s,clip,t+.012);return true;
 }
 let lastV=-99;
 function hushCombatAccent(all=false){
  if(!ctx)return;
  const t=ctx.currentTime;
  for(const item of reactionLive.slice()){
   if(!all&&!item.name.startsWith('uncanny-'))continue;
   item.g.gain.cancelScheduledValues(t);item.g.gain.setTargetAtTime(.0001,t,.009);
   try{item.s.stop(t+.035);}catch(_){}
   const i=reactionLive.indexOf(item);if(i>=0)reactionLive.splice(i,1);
  }
 }
 // 아래턱이 없으면 말·비명 대신 목구멍에서 꾸르륵거리는 소리만 난다
 let jawGoneV=false;function setJawGone(v){jawGoneV=!!v;}
 function say(name,k=1,raw){
  // 사과하는 동안에는 같은 천지신명의 비명이 음절 목소리 위로 겹치지 않는다.
  if(G.free&&TALK.cur?.quip&&G.time<(G.E?.talkUntil||0))return;
  if(!ready())return;
  if(!raw&&!baking&&(combatPlayerVoiceBusy()||uncannyVoiceBusy()))return;
  // The base voice changes only after a severed head regrows as a reptile.
  // Exposing scales beneath the human face keeps the human base voice.
  if(!raw&&!baking&&reactionNames.includes(name)&&deityHasReptileVoice(G.E))name='reptile';
  if(!raw&&jawGoneV&&!/^(gurgle|reptile)$/.test(name)){name='gurgle';k=Math.min(k,1)*.9;}
  if(name==='gurgle'){
   const now=ctx.currentTime;if(now-lastV<.16)return;lastV=now;
   const t=Math.max(now+.01,duckUntil),P=R(.92,1.08);
   voice(t,{dur:R(.34,.5),f0:118*P,fm:98*P,fmAt:.5,f1:84*P,v1:'u',v2:'o',breath:.55,peak:.3*k,trem:19,vib:.06,vibHz:11,rough:.28,bright:1300,wet:.45,attack:.03,release:.12});
   // 피가 끓는 거품
   const o=out(R(-.1,.1),.14),n=5+Math.round(Math.random()*4);for(let i=0;i<n;i++){const tt=t+.02+Math.pow(Math.random(),1.3)*.4;osc(o,tt,{f0:R(260,520),f1:R(140,260),dur:R(.02,.045),peak:.13*k,type:'sine'});}
   nz(out(0,.1),t+.05,{dur:.3,peak:.09*k,f:500,f1:260,type:'lowpass',q:1.6,curve:'lin'});
   return;
  }
  if(reactionNames.includes(name)&&!baking){
   const now=ctx.currentTime;if(now-lastV<(name==='reptile'?.42:.105))return;lastV=now;
   const other='uncanny-'+(deityHasReptileVoice(G.E)?'reptile':'human');
   if(!raw&&SFX['v:'+other]&&uncannyVoiceAllowed(name)){name=other;uncannyVoiceStarted();}
   if(playReaction(name,k))return;
   return;
  }
  // 비웃음은 첫 대화가 나가는 동안만 참는다. 그 뒤로는 웃는 동작과 같이 소리도 난다
  if(name==='laugh'&&G.mode==='fight'&&G.opening&&talkBusy())return;
  const t=Math.max(ctx.currentTime+.01,duckUntil),P=R(.94,1.06);
  switch(name){
   case 'grunt':voice(t,{dur:R(.11,.16),f0:155*P,f1:112*P,v1:'eu',v2:'eo',breath:.25,peak:.42*k,release:.015,rough:.05});break;
   case 'oof':breath(t,.06,.3*k,600,1400);voice(t+.02,{dur:.17,f0:128*P,f1:88*P,v1:'eo',v2:'u',breath:.55,peak:.42*k,release:.03,rough:.06,bright:2200});break;
   case 'yelp':voice(t,{dur:R(.26,.36),f0:210*P,fm:300*P,f1:175*P,v1:'a',v2:'a',breath:.18,peak:.46*k,vib:.02,vibHz:9,rough:.09,bright:4200,wet:.28});break;
   case 'scream':voice(t,{dur:.62,f0:170*P,fm:285*P,fmAt:.3,f1:190*P,v1:'eu',v2:'a',breath:.22,peak:.46*k,vib:.03,vibHz:7,rough:.12,bright:4600,wet:.34});break;
   case 'groan':voice(t,{dur:R(.8,1.2),f0:108*P,f1:88*P,v1:'eu',v2:'eo',breath:.35,peak:.3*k,trem:6,vib:.02,rough:.07,bright:1800});break;
   case 'gasp':breath(t,.14,.34*k,700,2600);voice(t+.1,{dur:.1,f0:170*P,f1:150*P,v1:'eo',breath:.5,peak:.26*k,release:.015});break;
   case 'laugh':{const big=k>1.05,n=big?7:5;let tt=t;for(let i=0;i<n;i++){const last=i===n-1,dur=last?.32:R(.085,.11);breath(tt,.045,.22,1200,1500);voice(tt+.03,{dur,f0:(big?178:142)*(1-i*.03)*P,f1:(big?160:128)*(1-i*.03)*(last?.82:1)*P,v1:big?'a':'eo',breath:.42,peak:(big?.4:.3)*(last?.8:1),release:.03,attack:.012,rough:.04,wet:.25});tt+=dur+(big?.07:.09);}break;}
   case 'sob':{breath(t,.12,.17*k,650,1800);for(let i=0;i<2;i++)voice(t+.14+i*.22,{dur:.11+i*.02,f0:(150-i*12)*P,f1:(118-i*8)*P,v1:'eu',v2:'m',breath:.65,peak:.17*k,vib:.003,rough:.03,bright:1800,wet:.04,release:.045});break;}
   case 'beg':{breath(t,.09,.12*k,650,1600);for(let i=0;i<2;i++)voice(t+.08+i*.25,{dur:.14,f0:(160-i*10)*P,f1:(132-i*8)*P,v1:'eo',v2:'m',breath:.6,peak:.17*k,vib:.004,rough:.03,bright:2100,wet:.04,release:.05});break;}
   case 'cough':{let tt=t;for(let i=0;i<3;i++){const o=out(0,.2,true);nz(o,tt,{dur:.09,peak:.36*k,f:1200,f1:600,q:.7});voice(tt,{dur:.08,f0:150*P,f1:120*P,v1:'eo',breath:.6,peak:.25*k,release:.02,attack:.004});tt+=R(.19,.26);}break;}
   case 'spit':{const o=out(.2,.12,true);nz(o,t,{dur:.012,peak:.4,f:3500,type:'highpass',q:.5});nz(o,t+.012,{dur:.09,peak:.26,f:2400,f1:1500,q:.9});voice(t+.01,{dur:.07,f0:180*P,v1:'e',breath:.7,peak:.12,release:.02});break;}
   case 'huff':{const o=out(0,.12,true);nz(o,t,{dur:.22,peak:.3*k,f:500,f1:350,type:'lowpass',q:.6});voice(t,{dur:.16,f0:120*P,f1:100*P,v1:'m',breath:.6,peak:.18*k,bright:1200});break;}
   case 'final':voice(t,{dur:1.7,f0:128*P,fm:110*P,f1:66*P,v1:'eo',v2:'eu',breath:.42,peak:.34*k,trem:4.5,vib:.03,rough:.1,bright:2000,wet:.35});breath(t+1.6,.7,.2,800,500);break;
  }
 }
 /* ---- 수혜자들과 되살림 ---- */
 // 말풍선의 모음 발성이 환호·항의를 맡는다. 별도의 긴 합성 합창은 겹치지 않는다.
 // 울음도 같은 짧은 음절 방식으로: 길게 떨리는 모음 대신 두 번 끊기는 흐느낌.
 function crowdSob(k=1){return speak('흑…흑.',{pitch:R(330,390),formant:1.12,speed:1.25,gain:.75*k});}
 // 불씨가 모이는 동안: 점점 올라가는 울림 + 바람
 function charge(dur=2.5,k=1){if(!ready())return;const t=ctx.currentTime+.01,o=out(0,.35);
  osc(o,t,{f0:160,f1:1250,dur:dur,peak:.22*k,a:dur*.55,type:'sine',curve:'lin',glide:dur});
  osc(o,t,{f0:241,f1:1880,dur:dur,peak:.1*k,a:dur*.6,type:'triangle',curve:'lin',glide:dur});
  osc(o,t,{f0:80,f1:120,dur:dur,peak:.18*k,a:dur*.7,type:'sine',curve:'lin',glide:dur});
  nz(o,t,{dur:dur,peak:.16*k,a:dur*.8,f:500,f1:5200,type:'bandpass',q:.5,curve:'lin',glide:dur});}
 // 불씨 하나가 닿을 때: 짧은 반짝
 function twinkle(k=1){if(!ready())return;const t=ctx.currentTime+.005,o=out(R(-.4,.4),.3),f=R(1900,3800);osc(o,t,{f0:f,f1:f*1.5,dur:.11,peak:.22*k,a:.004});osc(o,t,{f0:f*2,dur:.07,peak:.08*k,type:'triangle'});}
 // 가슴에 박힘: 묵직한 울림 + 종소리
 function boom(k=1){if(!ready())return;const t=ctx.currentTime+.005,o=out(0,.45),d=drive(o,2.2);
  osc(d,t,{f0:95,f1:34,dur:1.1,peak:.85*k});nz(d,t,{dur:.8,peak:.5*k,f:700,f1:110,type:'lowpass',q:.7});
  nz(o,t,{dur:.06,peak:.5*k,f:3000,type:'highpass',q:.4});
  ring(o,t+.02,[660,990,1320,1980,2640],2.2,.22*k);
  nz(o,t+.05,{dur:2.4,peak:.12*k,a:.1,f:2400,f1:600,q:.5,curve:'lin'});}
 // 도장: 쾅 + 종이 찰싹
 function stamp(k=1){if(!ready())return;const t=ctx.currentTime+.005,o=out(R(-.3,.3),.18),d=drive(o,1.8);
  osc(d,t,{f0:160,f1:55,dur:.13,peak:.9*k});nz(o,t,{dur:.035,peak:.45*k,f:2600,type:'highpass',q:.5});nz(d,t+.004,{dur:.1,peak:.3*k,f:900,f1:300,q:.8});}
 // 종이가 찢어지는 소리: 높고 거친 찢김 두 겹 + 섬유가 뜯기는 바스락
 function paper(k=1){if(!ready())return;const t=ctx.currentTime+.005,o=out(R(-.2,.2),.12),d=drive(o,1.4);
  tearNoise(d,t,.34,3200,.85*k,R(30,42));tearNoise(d,t+.03,.26,1500,.42*k,R(55,70));clicks(o,t+.02,7,.3,5200,.18*k);}
 // 종이 구기기: 섬유가 꺾이는 아주 짧은 딱딱 소리가 잦게 겹친다(세게 쥘수록 자주). 가끔 크게 접히는 소리
 function crumple(k=1){if(!ready())return;const t=ctx.currentTime+.002+Math.random()*.012,o=out(R(-.3,.3),.06);
  const n=1+(Math.random()<.45?1:0)+(Math.random()<.15?1:0);
  for(let i=0;i<n;i++)nz(o,t+Math.random()*.018,{dur:R(.003,.011),peak:R(.3,.8)*k,f:R(1700,7600),q:R(.7,2.2)});
  if(Math.random()<.22)nz(o,t,{dur:R(.025,.06),peak:R(.18,.4)*k,f:R(380,1100),q:R(.5,1.1)});}
 // 다 구겨 뭉칠 때: 촘촘한 바스락 한 덩이 + 낮게 눌리는 소리
 function crunch(k=1){if(!ready())return;const t=ctx.currentTime+.004,o=out(R(-.15,.15),.08),d=drive(o,1.3);
  for(let i=0;i<22;i++)nz(o,t+Math.random()*.17,{dur:R(.004,.014),peak:R(.35,.85)*k,f:R(1500,7000),q:R(.8,2)});
  nz(d,t,{dur:.14,peak:.6*k,a:.01,f:900,f1:420,q:.7});nz(d,t+.05,{dur:.09,peak:.4*k,f:2600,f1:1400,q:.9});}
 // 종이 뭉치가 바닥에 떨어지는 소리(가볍게, 넓은 방 울림)
 function paperDrop(k=1){if(!ready())return;const t=ctx.currentTime+.003,o=out(R(-.1,.1),.24);
  nz(o,t,{dur:.035,peak:.45*k,f:1300,q:.8});nz(o,t+.09,{dur:.025,peak:.2*k,f:1600,q:.9});clicks(o,t+.01,4,.06,4200,.16*k);}
 // 발소리: 돌바닥을 딛는 낮은 울림 + 신발 끌리는 소리
 function footstep(k=1){if(!ready())return;const t=ctx.currentTime+.004,o=out(R(-.12,.12),.35);
  osc(o,t,{f0:R(92,110),f1:48,dur:.09,peak:.45*k});nz(o,t,{dur:.045,peak:.26*k,f:R(500,700),type:'lowpass',q:.6});nz(o,t+.012,{dur:.06,peak:.08*k,f:R(2200,3200),q:.9});}
 // 앞사람들이 비켜서는 소리: 옷 스치는 소리와 발 끄는 소리가 겹친다
 function crowdShuffle(k=1){if(!ready())return;const t=ctx.currentTime+.01,o=out(0,.3);
  for(let i=0;i<8;i++)nz(o,t+R(0,.75),{dur:R(.12,.26),peak:R(.08,.18)*k,a:R(.03,.07),f:R(900,2200),f1:R(500,900),q:R(.5,1),curve:'lin'});
  for(let i=0;i<6;i++)nz(o,t+R(.05,.85),{dur:R(.05,.09),peak:R(.14,.24)*k,f:R(380,620),type:'lowpass',q:.6});}
 // 그림자가 지나갈 때: 아주 낮게 차오르는 울림
 function omen(k=1){if(!ready())return;const t=ctx.currentTime+.01,o=out(0,.5),d=drive(o,1.6);
  nz(d,t,{dur:.9,peak:.5*k,a:.7,f:150,f1:70,type:'lowpass',q:.7,curve:'lin'});osc(d,t,{f0:42,f1:30,dur:1.1,a:.6,peak:.55*k});
  nz(o,t+.2,{dur:1.1,peak:.05*k,a:.5,f:900,f1:300,q:.6,curve:'lin'});}
 // 눈이 나를 알아보는 순간: 깊은 울림 하나 + 렌즈가 맞춰지는 듯한 짧은 틱
 function gaze(k=1){if(!ready())return;const t=ctx.currentTime+.005,o=out(0,.5),d=drive(o,2);
  osc(d,t,{f0:84,f1:28,dur:1.0,peak:.9*k});nz(d,t,{dur:.5,peak:.45*k,f:520,f1:80,type:'lowpass',q:.8});
  nz(o,t+.03,{dur:.025,peak:.22*k,f:3800,type:'highpass',q:.6});osc(o,t+.03,{f0:2200,f1:1400,dur:.05,peak:.09*k,type:'triangle'});}
 // 막이 눈 위를 지나갈 때: 젖은 것이 미끄러지는 소리, 갔다가 돌아온다
 function membrane(k=1){if(!ready())return;const t=ctx.currentTime+.01,o=out(.15,.35);
  nz(o,t,{dur:.5,peak:.15*k,a:.06,f:500,f1:2600,q:1.7,curve:'lin'});nz(o,t+.58,{dur:.42,peak:.12*k,a:.05,f:2400,f1:600,q:1.7,curve:'lin'});
  osc(o,t+.5,{f0:1400,f1:900,dur:.03,peak:.06*k});}
 // 뒤에 있던 것: 아주 낮게 웅웅거리는 덩어리(서로 조금 어긋난 두 톱니파가 천천히 맥놀이하고, 숨 쉬듯 부풀었다 가라앉는다)
 // + 그 위에 멀리서 '아—' 하는 듯한 모음 울림 + 젖은 유리잔 테두리를 문지르는 듯한 높은 울림. 고개를 드는 동안 천천히 차오르고, 끝나지 않는다
 function beyond(){if(!ready())return;const t=ctx.currentTime+.02,o=out(0,.55);
  const add=(type,f,a,dst)=>{const s=ctx.createOscillator(),g=ctx.createGain();s.type=type;s.frequency.setValueAtTime(f,t);g.gain.value=a;s.connect(g);g.connect(dst);s.start(t);track(s);return {s,g};};
  const swell=(dst,peak,from,to)=>{const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.setValueAtTime(.0001,t+from);g.gain.exponentialRampToValueAtTime(peak,t+to);g.connect(dst);return g;};
  // 낮은 덩어리
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=.9;lp.frequency.setValueAtTime(120,t);lp.frequency.linearRampToValueAtTime(480,t+7);
  const body=swell(o,.34,0,6);lp.connect(body);
  add('sawtooth',55,.3,lp);add('sawtooth',55.42,.28,lp);add('sawtooth',82.41,.12,lp);add('sine',27.5,.5,body);
  add('sine',.085,110,lp.frequency);
  // 모음 울림(아—): 톱니파를 좁은 울림통 세 개에 통과시킨다
  const vow=swell(o,.7,.8,7.5);
  for(const [f,q,a] of [[520,2.6,1],[880,3.2,.6],[2450,5,.12]]){const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=ctx.createGain();g.gain.value=a;bp.connect(g);g.connect(vow);
   for(const ff of [110,110.6,164.8])add('sawtooth',ff,.33,bp);}
  // 바람 같은 결(아주 작게)
  const air=ctx.createBufferSource();air.buffer=noise;air.loop=true;const bf=ctx.createBiquadFilter();bf.type='bandpass';bf.frequency.value=600;bf.Q.value=.6;
  air.connect(bf);bf.connect(swell(o,.04,0,7));air.start(t);track(air);
  // 유리 울림: 음마다 다른 빠르기로 천천히 커졌다 작아지고, 아주 조금 떨린다
  const glass=swell(o,.065,1.2,8.5);
  for(const [f,rate] of [[1318.5,.11],[1975.5,.07],[2489,.13],[3322.4,.05]]){
   const v=add('sine',f*R(.998,1.002),.16,glass);add('sine',rate,.14,v.g.gain);add('sine',R(4.2,5.6),f*.0016,v.s.frequency);}
 }
 /* ---- 말소리: 동물의 숲 주민처럼 글자마다 「미미미」 ----
  * 바퀴벌레 게임의 목소리와 같은 방식. 한 글자(음절)마다 짧은 소리 하나: 모음에 따라 소리 빛깔(포먼트)이 바뀌고,
  * 첫소리에 따라 쉿(ㅅ·ㅈ·ㅊ)·톡(ㄱ·ㄷ·ㅂ) 소리가 살짝 붙는다. 박자는 말풍선 글자가 찍히는 박자(typeSteps)와 같다.
  * V: {pitch 목소리 높이(Hz), formant 클수록 가늘다, speed 클수록 빨리 말한다} */
 const SPK_V={a:[820,1320],e:[540,1900],eo:[640,1060],o:[470,860],u:[370,900],eu:[410,1450],i:[310,2400]};
 // 한글 가운뎃소리 21개 → 모음 갈래, 첫소리 19개 → 첫소리 갈래
 const SPK_J=['a','e','a','e','eo','e','eo','e','o','a','e','e','o','u','eo','e','i','u','eu','i','i'];
 const SPK_C=['stop','stop','nasal','stop','stop','liquid','nasal','stop','stop','hiss','hiss','none','hiss','hiss','hiss','stop','stop','stop','breath'];
 // 낱자(ㅋ·ㅎ·ㅠ)는 웃음·울음 소리로
 const SPK_JAMO={'ㅋ':['eu','stop'],'ㅎ':['a','breath'],'ㅠ':['u','none'],'ㅜ':['u','none']};
 function spkSound(ch){
  const c=ch.codePointAt(0);
  if(c>=0xAC00&&c<=0xD7A3){const k=c-0xAC00;return {v:SPK_J[Math.floor((k%588)/28)],on:SPK_C[Math.floor(k/588)],coda:k%28!==0};}
  const j=SPK_JAMO[ch];if(j)return {v:j[0],on:j[1],coda:false};
  if(c>=0x4E00&&c<=0x9FFF)return {v:'a',on:'stop',coda:true};
  const l=ch.toLowerCase();
  if('aeiou'.includes(l))return {v:{a:'a',e:'e',i:'i',o:'o',u:'u'}[l],on:'none',coda:false};
  if(/[0-9a-z]/.test(l))return {v:'eo',on:'stop',coda:false};
  return {v:'eu',on:'none',coda:false};
 }
 function blip(o,t,len,f0,f1,f2,onset,soft=false){
  // 첫소리: 쉿·톡·후 하는 바람 소리를 아주 짧게
  let vt=t;
  if(!soft&&(onset==='hiss'||onset==='breath'||onset==='stop')){
   const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=noise;
   const L=onset==='stop'?.008:onset==='hiss'?.024:.018,pk=onset==='stop'?.5:onset==='hiss'?.3:.2;
   f.type=onset==='hiss'?'highpass':'bandpass';f.frequency.value=onset==='hiss'?4800:onset==='stop'?2600:1700;f.Q.value=onset==='hiss'?.7:1.1;
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(pk,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+L);
   n.connect(f);f.connect(g);g.connect(o);n.start(t,Math.random()*1.5);n.stop(t+L+.02);track(n);
   if(onset!=='stop')vt=t+L*.55;
  }
  const vl=Math.max(.025,len-(vt-t));
  // 모음: 톱니파를 두 포먼트로 걸러 '미'·'마'·'무' 빛깔을 낸다. 머리에 살짝 높았다 내려와 앳되게 들린다
  const s=ctx.createOscillator();s.type='sawtooth';
  const st=onset==='liquid'?.95:1.07;
  s.frequency.setValueAtTime(f0*st,vt);s.frequency.exponentialRampToValueAtTime(f0,vt+vl*.35);s.frequency.exponentialRampToValueAtTime(f0*.97,vt+vl);
  const b1=ctx.createBiquadFilter();b1.type='bandpass';b1.frequency.value=f1;b1.Q.value=4;
  const b2=ctx.createBiquadFilter();b2.type='bandpass';b2.frequency.value=f2;b2.Q.value=6;
  const bd=ctx.createBiquadFilter();bd.type='lowpass';bd.frequency.value=f0*2.2;
  const g1=ctx.createGain();g1.gain.value=1;const g2=ctx.createGain();g2.gain.value=onset==='nasal'?.35:.75;const gb=ctx.createGain();gb.gain.value=.18;
  const e=ctx.createGain();
  e.gain.setValueAtTime(.0001,vt);e.gain.exponentialRampToValueAtTime(1,vt+(soft?.014:.006));e.gain.setValueAtTime(1,vt+vl*.62);e.gain.exponentialRampToValueAtTime(.0001,vt+vl);
  s.connect(b1);b1.connect(g1);g1.connect(e);s.connect(b2);b2.connect(g2);g2.connect(e);s.connect(bd);bd.connect(gb);gb.connect(e);e.connect(o);
  s.start(vt);s.stop(vt+vl+.02);track(s);
 }
 // 돌려주는 값: {stop()} — 말풍선을 도중에 거둘 때 소리도 끊는다
 function speak(text,V,o={}){
  if(!ready())return null;
  V=V||{pitch:480,formant:1.25,speed:1};
  const c=ctx,t0=c.currentTime+.02,g=c.createGain();g.gain.value=o.gain!=null?o.gain:V.gain!=null?V.gain:1.2;
  const dest=out(o.pan||0,o.soft?.035:.1,true);
  if(o.soft){const tone=c.createBiquadFilter();tone.type='lowpass';tone.frequency.value=3200;tone.Q.value=.55;g.connect(tone);tone.connect(dest);}else g.connect(dest);
  const steps=typeSteps(text,V.speed).steps.filter(s=>s.kind==='syl'),last=steps.length-1,ask=/\?\s*$/.test(String(text)),dur=(o.soft?.095:.072)/V.speed;
  steps.forEach((st,k)=>{
   const S=spkSound(st.ch),F=SPK_V[S.v];
   // 억양: 살짝 오르내리다가, 끝에서 말하는 문장은 내려앉고 묻는 문장은 올라간다
   let pm=1+.045*Math.sin(k*1.9+V.pitch*.013)+(Math.random()-.5)*.05;
   if(S.v==='i')pm*=1.05;else if(S.v==='o'||S.v==='u')pm*=.96;
   if(k===last)pm*=ask?1.2:.9;else if(k===last-1&&ask)pm*=1.08;
   blip(g,t0+st.t,dur*(S.coda?.7:.84),V.pitch*pm,F[0]*V.formant,F[1]*V.formant,S.on,!!o.soft);
  });
  return {stop(){try{const n=c.currentTime;g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(g.gain.value,n);g.gain.linearRampToValueAtTime(0,n+.03);}catch(_){}}};
 }
 /* ---- 수군거림: 같은 추종자의 목소리로 작게 소곤대기 ----
  * 막아서는 장면과 같은 모음·음높이를 쓴다. 음량은 약 43%로 낮추고,
  * 파열음 잡음을 빼고 모음의 시작과 고음을 부드럽게 만든다. */
 function whisper(text,V,o={}){
  return speak(text,V||{pitch:480,formant:1.25,speed:1},
   {...o,gain:o.gain!=null?o.gain:.52,soft:true});
 }
 // 군중이 한꺼번에 몸을 돌려 나를 볼 때: 옷 스치는 소리가 가까운 데서 먼 데로 번지고, 몇 사람이 짧게 숨을 들이켠다
 function crowdTurn(k=1){if(!ready())return;const t=ctx.currentTime+.01;
  for(let i=0;i<16;i++){const d=R(0,.95),o=out(R(-.85,.85),.22);
   nz(o,t+d,{dur:R(.12,.24),peak:R(.07,.15)*k*(1-d*.45),a:R(.03,.07),f:R(1000,2500),f1:R(550,950),q:R(.6,1.1),curve:'lin'});}
  for(let i=0;i<7;i++)nz(out(R(-.7,.7),.3),t+R(.1,1),{dur:R(.04,.08),peak:R(.1,.2)*k,f:R(360,560),type:'lowpass',q:.6});
  for(let i=0;i<3;i++)nz(out(R(-.6,.6),.12,true),t+R(.08,.5),{dur:R(.1,.16),peak:R(.06,.1)*k,a:.035,f:R(900,1300),f1:R(1700,2300),q:1.3,curve:'lin'});
 }
 // Two quiet looping sources, created once on entry. Never synthesize a buffer per frame.
 let factoryHum=null,factoryCue=8;
 function stopFactoryRoom(){
  const h=factoryHum;factoryHum=null;factoryCue=8;if(!h)return;
  for(const n of h.sources){try{n.stop();}catch(_){}live.delete(n);}
  for(const n of h.nodes)try{n.disconnect();}catch(_){}
 }
 function factoryRoom(wanted,occupied,dt=0){
  if(!wanted||!ready()){if(factoryHum)stopFactoryRoom();return;}
  if(!factoryHum){
   const g=ctx.createGain(),filter=ctx.createBiquadFilter(),fan=ctx.createBufferSource(),motor=ctx.createOscillator(),mg=ctx.createGain();
   g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(.022,ctx.currentTime+2);
   filter.type='lowpass';filter.frequency.value=160;filter.Q.value=.5;fan.buffer=noise;fan.loop=true;
   fan.connect(filter);filter.connect(g);motor.type='sine';motor.frequency.value=58;mg.gain.value=.22;motor.connect(mg);mg.connect(g);g.connect(bus);
   fan.start();motor.start();track(fan);track(motor);factoryHum={sources:[fan,motor],nodes:[fan,motor,filter,mg,g]};
  }
  factoryCue-=dt;if(factoryCue>0)return;factoryCue=R(9,19);
  const t=ctx.currentTime,pan=(Math.random()<.5?-1:1)*R(.5,.85),o=out(pan,.65);
  if(occupied&&Math.random()<.48){ring(o,t,[640,1337,2190],.7,.012);nz(o,t,{dur:.035,peak:.022,f:1750,q:1.4,a:.008});}
  else{osc(o,t,{f0:1150,f1:520,dur:.09,peak:.022,a:.003});nz(o,t,{dur:.025,peak:.012,f:2700,q:.8});}
 }
 // 천지신명 정육공장: 사슬 · 갈고리가 살에 박힘 · 레일 구르는 소리 · 레일에서 덜컹 멎는 소리
 function chain(p=1,n=6,span=.35){if(!ready())return;const t=ctx.currentTime,o=out(R(-.25,.25),.24);
  for(let i=0;i<n;i++){const tt=t+i*span/n+R(0,.018),f=R(1650,2700);ring(o,tt,[f,f*1.51,f*2.27],R(.035,.075),.05*p);nz(o,tt,{dur:.006,peak:.17*p,f:5200,q:2});}}
 function hookIn(p=1){if(!ready())return;const t=ctx.currentTime,o=out(0,.16),d=drive(o,2.2);
  osc(d,t,{f0:150,f1:46,dur:.16,peak:.8*p});nz(d,t,{dur:.012,peak:.6*p,f:3400,type:'highpass',q:.5});
  tearNoise(d,t+.01,.24,1300,.8*p,R(40,55));
  ring(o,t+.02,[410,970,1530],.34,.07*p);
  nz(o,t+.05,{dur:.3,peak:.3*p,f:520,f1:240,type:'lowpass',q:1});}
 function railRoll(dur=.6,p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.3);
  nz(o,t,{dur,peak:.22*p,f:210,f1:150,q:1.4,a:.05,curve:'lin'});
  nz(o,t,{dur,peak:.06*p,f:2900,q:5,a:.05,curve:'lin'});
  const n=Math.max(2,Math.round(dur/.11));for(let i=0;i<n;i++){const tt=t+.04+i*dur/n;ring(o,tt,[820*R(.96,1.04),1930,3150],.05,.07*p);nz(o,tt,{dur:.008,peak:.2*p,f:4200,q:2});}}
 function railStop(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.32);
  osc(o,t,{f0:130,f1:60,dur:.12,peak:.5*p});ring(o,t,[470,1130,1890,2760],.55,.1*p);clicks(o,t,6,.12,4300,.2*p);
  ring(o,t+.16,[1900,2870],.05,.04*p);ring(o,t+.31,[2100,3170],.04,.03*p);}
 return {unlock,hold,factoryRoom,crowdSob,whisper,crowdTurn,charge,twinkle,boom,stamp,paper,crumple,crunch,paperDrop,footstep,crowdShuffle,beyond,omen,gaze,membrane,speak,setOn,setVolumes,stop,updateMusic,stopMusic,whoosh,hit,duck,block(){if(ready())fx('block',.9,R(-.2,.2),1);},crown,crownLand,staffLand,tooth,toothBounce,crack,gunshot,dry,reload(){},spurt,pull,drip,fall,chain,hookIn,railRoll,railStop,
  whiff(){},voice:say,voiceRaw(name,k=1){say(name,k,true);},tts:speakTTS,gasp(k=1){say('gasp',k);},hushCombatAccent,
  combatLineReady(text){return ready()&&volumes.voice>0&&!!combatClips[text]?.buffer;},
  haloCrack,haloBuzz,haloLand,haloTap,hiss,coin,coinGush,rip,peel,chop,squelch,pop,boneOut,scaleSet,unmask,pat,slap,behead,skullCrush,jawRip,blowout,snip,jawPop,setJawGone,ui(){if(!ready())return;const t=ctx.currentTime,o=out(0,.02);osc(o,t,{f0:880,f1:660,dur:.04,peak:.12,type:'triangle'});},
  get ctx(){return ctx;},get baked(){return SFX;},get reactionStats(){return {loaded:!!bankBuffer,bankBytes:bankBuffer?bankBuffer.length*bankBuffer.numberOfChannels*4:0,active:reactionLive.length,count:reactionNames.reduce((n,k)=>n+(SFX['v:'+k]||[]).length,0),bytes:reactionNames.reduce((n,k)=>n+(SFX['v:'+k]||[]).reduce((b,x)=>b+x.length*4,0),0)};},
  // 점검용: 바로 내는 소리를 파일처럼 뽑아 본다(크기 그대로)
  render(name,args,dur){if(!ctx)return Promise.resolve(null);const api=this;return bakeOne(()=>api[name](...(args||[])),dur||1,true);}};
})();
/* ===== 4. 무대와 카메라 ===== */
const canvas=$('#world');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false});}
catch(e){throw new Error('이 기기에서는 3D 그래픽(WebGL)을 쓸 수 없습니다.');}
const MOBILE_GPU=!!(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches);
const DPR_MAX=MOBILE_GPU?1.2:1.6;
renderer.setPixelRatio(Math.min(DPR_MAX,window.devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=MOBILE_GPU?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;
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
 const face=(draw)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d',TEX_CTX);draw(g,64);return c;};
 const side=(g,n)=>{const gr=g.createLinearGradient(0,0,0,n);gr.addColorStop(0,'#9cc8ef');gr.addColorStop(.45,'#fbf6ea');gr.addColorStop(.6,'#f2dfb2');gr.addColorStop(1,'#b98a4a');g.fillStyle=gr;g.fillRect(0,0,n,n);g.fillStyle='#c4321f';g.fillRect(8,14,7,34);g.fillRect(48,14,7,34);g.fillStyle='rgba(255,255,255,.95)';g.fillRect(22,18,20,16);};
 const imgs=[face(side),face(side),face((g,n)=>{const r=g.createRadialGradient(32,32,4,32,32,46);r.addColorStop(0,'#ffffff');r.addColorStop(1,'#8fc1ec');g.fillStyle=r;g.fillRect(0,0,n,n);}),
  face((g,n)=>{g.fillStyle='#caa060';g.fillRect(0,0,n,n);g.fillStyle='#e9d6ae';for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)g.fillRect(i*16,j*16,16,16);}),
  face(side),face((g,n)=>{side(g,n);g.strokeStyle='#b8341f';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,40);g.stroke();}})];
 const t=new THREE.CubeTexture(imgs);t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t;}catch(_){return null;}})();
/* 주변 반사는 금속에만 준다(전체에 주면 휴대폰에서 무겁다) */
function metalEnv(root){root.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)if(m.isMeshStandardMaterial&&m.metalness>.3&&ENV&&!m.envMap){m.envMap=ENV;m.needsUpdate=true;}});}
const hemi=new THREE.HemisphereLight(col('#eef5ff'),col('#a88458'),.4);scene.add(hemi);
const key=new THREE.DirectionalLight(col('#fff1da'),2.05);key.position.set(-1.7,3.4,2.8);key.target.position.set(0,1,-.2);scene.add(key);scene.add(key.target);
key.castShadow=true;key.shadow.mapSize.set(MOBILE_GPU?512:1024,MOBILE_GPU?512:1024);Object.assign(key.shadow.camera,{left:-1.9,right:1.9,top:2.4,bottom:-1.1,near:.6,far:9});key.shadow.bias=-.0005;key.shadow.normalBias=.025;
const fill=new THREE.DirectionalLight(col('#cfe2ff'),.3);fill.position.set(2.4,1.5,2.2);scene.add(fill);
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
 // 옥좌 앞에서 카메라 쪽으로 깐 붉은 깔개: 무릎 꿇고 주저앉은 흰 예복이 흰 대리석에 묻히지 않게 몸 밑을 붉게 깐다.
 // 바닥 피 자국 판(높이 .004)보다 아래에 붙여 피가 깔개 위에 그대로 보인다. 그림 한 장 = 깔개 폭(1.9m) 정사각형
 const rugTex=canvasTex(256,256,(g,w,h)=>{
  g.fillStyle='#b8291f';g.fillRect(0,0,w,h);
  for(let i=0;i<2600;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(70,0,6,${.05+v*.1})`:`rgba(255,140,110,${(v-.5)*.12})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1);}
  // 가운데 무늬: 같은 빛깔의 마름모와 금빛 점
  g.strokeStyle='rgba(84,4,10,.32)';g.lineWidth=5;
  for(let y=-32;y<=h+32;y+=64)for(let x=64;x<=192;x+=64){g.beginPath();g.moveTo(x,y-26);g.lineTo(x+26,y);g.lineTo(x,y+26);g.lineTo(x-26,y);g.closePath();g.stroke();}
  g.fillStyle='rgba(255,198,112,.45)';for(let y=0;y<=h;y+=64)for(let x=96;x<=160;x+=64){g.beginPath();g.arc(x,y,2.6,0,TAU);g.fill();}
  // 가장자리: 짙은 테 + 금줄 두 줄
  for(const sd of [0,1]){const X=x=>sd?w-x:x;
   g.fillStyle='#7c1117';g.fillRect(sd?w-12:0,0,12,h);
   g.fillStyle='#e2ab42';g.fillRect(sd?w-19:15,0,4,h);g.fillRect(sd?w-27:25,0,2,h);
   g.fillStyle='rgba(84,4,10,.35)';for(let y=8;y<h;y+=16){g.beginPath();g.arc(X(36),y,2.4,0,TAU);g.fill();}}
 },{repeat:[1,4.7/1.9]});
 const rug=mk(new THREE.PlaneGeometry(1.9,4.7),STD('#ffffff',{map:rugTex,roughness:.9}),root,{p:[0,.0015,-.53+2.35],r:[-PI/2,0,0],cast:false});rug.name='rug';
 // 옥좌 단: 붉은 칠 + 금테
 const red=STD('#b3261c',{roughness:.38}),gold=STD('#e3ad48',{metalness:.78,roughness:.3}),goldD=STD('#a8761f',{metalness:.7,roughness:.42});
 const throne=grp(root,[0,0,-.86],'throne');WORLD.throne=throne;
 mk(new THREE.BoxGeometry(1.3,.38,.66),red,throne,{p:[0,.19,0]});
 for(const y of [.02,.37])mk(new THREE.BoxGeometry(1.34,.035,.7),goldD,throne,{p:[0,y,0]});
 for(const x of [-.66,.66])mk(new THREE.BoxGeometry(.04,.36,.7),gold,throne,{p:[x,.19,0]});
 // 앞판 금장식(구름무늬)
 const frontTex=canvasTex(512,160,(g,w,h)=>{g.fillStyle='#b3261c';g.fillRect(0,0,w,h);g.strokeStyle='#f1c25a';g.lineWidth=7;g.lineCap='round';for(let i=0;i<5;i++){const cx=56+i*100,cy=82;g.beginPath();g.arc(cx,cy,26,.3,5.6);g.stroke();g.beginPath();g.arc(cx+20,cy+6,14,3.4,7.4);g.stroke();g.beginPath();g.moveTo(cx-36,cy+30);g.quadraticCurveTo(cx,cy+48,cx+44,cy+24);g.stroke();}});
 mk(new THREE.PlaneGeometry(1.24,.3),STD('#ffffff',{map:frontTex,roughness:.4}),throne,{p:[0,.2,.331],cast:false});
 // 방석(앉을 때 닿는 곳): 짙은 붉은 비단. 설계자 옷이 흰 비단에 금빛 구름이라 방석에는 노란빛·금빛을 쓰지 않는다
 const cushTex=canvasTex(256,256,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#b31a2e');gr.addColorStop(1,'#971526');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=3){g.fillStyle=`rgba(255,255,255,${y%6?.025:.05})`;g.fillRect(0,y,w,1.2);}
  g.lineWidth=3;
  for(let y=16;y<h;y+=32)for(let x=(y/32%2)*16;x<w;x+=32){g.strokeStyle='rgba(62,0,12,.45)';g.beginPath();g.arc(x,y,8,0,TAU);g.stroke();g.fillStyle='rgba(255,196,140,.32)';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();}
 },{repeat:[2,1]});
 const cush=mk(new THREE.BoxGeometry(1.12,.11,.6),STD('#ffffff',{map:cushTex,roughness:.75}),throne,{p:[0,.43,.02]});cush.name='seat';
 // 등받이: 금 틀 + 짙은 비취색 판(피가 튀어 묻는 곳). 흰 예복이 판에 묻히지 않게 판은 진하게 칠하고, 구름무늬는 판과 같은 빛깔로만 짠다
 const back=grp(throne,[0,0,-.29]);
 mk(new THREE.BoxGeometry(1.36,1.42,.1),gold,back,{p:[0,1.16,0]});
 const panelTex=canvasTex(512,512,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0f6046');gr.addColorStop(1,'#187a5c');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.lineCap='round';
  const cloud=(cx,cy,s)=>{g.beginPath();g.arc(cx,cy,18*s,.2,5.7);g.stroke();g.beginPath();g.arc(cx+16*s,cy+5*s,11*s,3.3,7.6);g.stroke();g.beginPath();g.moveTo(cx-28*s,cy+22*s);g.quadraticCurveTo(cx,cy+36*s,cx+34*s,cy+18*s);g.stroke();};
  g.strokeStyle='rgba(4,52,38,.42)';g.lineWidth=7;
  for(let r=0;r<5;r++)for(let c=0;c<4;c++)cloud(70+c*125+(r%2)*60,60+r*100,1);
  g.strokeStyle='rgba(170,240,212,.2)';g.lineWidth=2;
  for(let r=0;r<5;r++)for(let c=0;c<4;c++)cloud(68+c*125+(r%2)*60,58+r*100,1);
  g.strokeStyle='#c4963a';g.lineWidth=14;g.strokeRect(10,10,w-20,h-20);
  g.strokeStyle='rgba(255,236,190,.8)';g.lineWidth=3;g.strokeRect(22,22,w-44,h-44);
 });
 WORLD.panelTex=panelTex;
 const panel=mk(new THREE.PlaneGeometry(1.16,1.22),STD('#ffffff',{map:panelTex,roughness:.55}),back,{p:[0,1.15,.052],cast:false});panel.name='panel';WORLD.panel=panel;
 // 꼭대기 장식: 금 구름(가운데는 후광이 걸리는 자리라 비워 둔다)
 const crest=grp(back,[0,1.92,0]);
 mk(new THREE.TorusGeometry(.5,.05,10,40,PI),gold,crest,{p:[0,-.1,0]});
 mk(new THREE.TorusGeometry(.32,.04,10,30,PI),goldD,crest,{p:[0,-.06,.02]});
 for(const s of [-1,1]){mk(sphereGeo(16),gold,crest,{p:[s*.58,-.16,.03],s:[.1,.08,.07]});mk(new THREE.TorusGeometry(.07,.022,8,18,PI*1.4),gold,crest,{p:[s*.6,-.05,.04],r:[0,0,s>0?-.4:PI+.4]});}
 // 팔걸이
 for(const s of [-1,1]){const arm=grp(throne,[s*.6,.48,.02]);mk(new THREE.BoxGeometry(.09,.3,.56),red,arm,{p:[0,.12,0]});mk(new THREE.BoxGeometry(.12,.045,.62),gold,arm,{p:[0,.29,0]});mk(new THREE.TorusGeometry(.055,.025,8,18,PI*1.5),gold,arm,{p:[0,.28,.32],r:[0,PI/2,0]});}
 // 기둥: 붉은 칠 + 금 띠. 꼭대기는 금 받침 위 보주(끝에 올려다볼 때 넓은 화면에서 보인다)
 const pillarMat=STD('#c22b20',{roughness:.34});
 for(const x of [-1.62,1.62]){const p=grp(root,[x,0,-1.7]);mk(cylGeo(.19,.19,5.2,24),pillarMat,p,{p:[0,2.6,0]});for(const y of [.06,.3,1.6,1.68,3.4,3.48,4.9,4.98])mk(cylGeo(.205,.205,y<.4?.12:.05,24),gold,p,{p:[0,y,0]});mk(cylGeo(.32,.36,.14,24),STD('#e6dccb',{roughness:.5}),p,{p:[0,.07,0]});
  mk(cylGeo(.25,.21,.16,24),gold,p,{p:[0,5.28,0]});mk(cylGeo(.13,.24,.1,24),goldD,p,{p:[0,5.41,0]});
  mk(sphereGeo(20),gold,p,{p:[0,5.6,0],s:[.15,.17,.15]});mk(new THREE.ConeGeometry(.07,.2,16),gold,p,{p:[0,5.84,0]});}
 // 뒷벽: 붉은 틀 + 밝은 창살
 const latTex=canvasTex(512,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#fffdf6');gr.addColorStop(1,'#eaf6ff');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#b8341f';g.lineWidth=9;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*w/8,0);g.lineTo(i*w/8,h);g.stroke();g.beginPath();g.moveTo(0,i*h/8);g.lineTo(w,i*h/8);g.stroke();}g.strokeStyle='rgba(184,52,31,.75)';g.lineWidth=4;for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.beginPath();g.moveTo(i*w/8,j*h/8+h/16);g.lineTo(i*w/8+w/16,j*h/8);g.lineTo(i*w/8+w/8,j*h/8+h/16);g.lineTo(i*w/8+w/16,j*h/8+h/8);g.closePath();g.stroke();}},{repeat:[3*16/9,1.3]});
 // 뒷벽은 16m(예전 9m): 카메라가 뒤로 물러나 가로로 넓은 화면에서도 벽 양 끝이 보이지 않게
 const wall=grp(root,[0,0,-2.85]);
 mk(new THREE.PlaneGeometry(16,4.6),STD('#ffffff',{map:latTex,roughness:.8,emissive:col('#fff6e6'),emissiveIntensity:.22}),wall,{p:[0,2.3,0],cast:false,receive:false});
 // 뒷벽 장식은 그림자를 받지 않는다(옥좌 그림자가 걸레받이에 회색 네모 덩어리로 찍히지 않게)
 for(const x of [-6.8,-4.9,-3,-1.1,1.1,3,4.9,6.8])mk(new THREE.BoxGeometry(.16,4.6,.12),pillarMat,wall,{p:[x,2.3,.06],cast:false,receive:false});
 mk(new THREE.BoxGeometry(16,.22,.16),pillarMat,wall,{p:[0,3.1,.08],cast:false,receive:false});
 mk(new THREE.BoxGeometry(16,.06,.18),gold,wall,{p:[0,3.24,.09],cast:false,receive:false});
 mk(new THREE.BoxGeometry(16,.5,.12),STD('#e6dccb'),wall,{p:[0,.25,.06],cast:false,receive:false});
 // 벽 위 끝: 붉은 도리 + 금선(끝에 올려다볼 때만 보인다)
 mk(new THREE.BoxGeometry(16.2,.3,.12),pillarMat,wall,{p:[0,4.5,.07],cast:false,receive:false});
 mk(new THREE.BoxGeometry(16.2,.05,.14),gold,wall,{p:[0,4.36,.08],cast:false,receive:false});
 mk(new THREE.BoxGeometry(16.2,.06,.14),gold,wall,{p:[0,4.66,.08],cast:false,receive:false});
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

/* A worn ceremonial hall. Geometry, texture, and contact shadows share one scale. */
const COMBAT_STAGE=(()=>{
 const root=new THREE.Group();root.visible=false;scene.add(root);
 const grain=canvasTex(256,256,(g,w,h)=>{
  g.fillStyle='#858585';g.fillRect(0,0,w,h);
  for(let i=0;i<16000;i++){const n=85+Math.random()*85|0;g.fillStyle=`rgb(${n},${n},${n})`;g.fillRect(Math.random()*w,Math.random()*h,1,1);}
 },{repeat:[3,3]});
 const weave=canvasTex(128,128,(g,w,h)=>{
  g.fillStyle='#777';g.fillRect(0,0,w,h);
  for(let i=0;i<w;i+=4){g.fillStyle=i%8?'#999':'#555';g.fillRect(i,0,1,h);g.fillStyle='#8b8b8b';g.fillRect(0,i,w,1);}
 },{repeat:[5,5]});
 const robe=canvasTex(1024,1024,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#38191f');gr.addColorStop(.45,'#78313a');gr.addColorStop(1,'#411c24');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=3){g.fillStyle=y%6?'rgba(17,7,10,.15)':'rgba(201,151,125,.07)';g.fillRect(0,y,w,1);}
  for(let row=0;row<3;row++)for(let c=0;c<3;c++)drawCloud(g,(c+.25+(row%2)*.5)*w/3,(row+.5)*h/3,2.4,'#876946','#ba9b65');
 });
 const stoneTex=canvasTex(1024,1024,(g,w,h)=>{
  g.fillStyle='#363735';g.fillRect(0,0,w,h);
  for(let i=0;i<48000;i++){const n=25+Math.random()*45|0;g.fillStyle=`rgba(${n},${n+1},${n},.2)`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}
  g.lineCap='round';
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){
   const x=i*256,y=j*256;g.fillStyle=`rgba(0,0,0,${Math.random()*.12})`;g.fillRect(x,y,256,256);
   g.strokeStyle='#1a1e1d';g.lineWidth=4;g.strokeRect(x+2,y+2,252,252);
   g.strokeStyle='rgba(177,170,148,.25)';g.lineWidth=1;g.strokeRect(x+5,y+5,246,246);
  }
  for(let i=0;i<40;i++){let x=Math.random()*w,y=Math.random()*h;g.strokeStyle='rgba(12,17,17,.4)';g.lineWidth=.7;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){x+=rnd(-55,55);y+=rnd(-30,40);g.lineTo(x,y);}g.stroke();}
 },{repeat:[3,3]});
 const stone=STD('#ffffff',{map:stoneTex,roughness:.78,bumpMap:grain,bumpScale:.004});
 // 바닥도 30m(벽과 같은 까닭). 가로 UV를 두 배로 늘려 돌판 크기는 그대로 둔다
 {const floorGeo=new THREE.PlaneGeometry(30,15),uv=floorGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*2);mk(floorGeo,stone,root,{r:[-PI/2,0,0],cast:false});}
 const brass=STD('#a58b53',{metalness:.75,roughness:.42,bumpMap:grain,bumpScale:.001,envMapIntensity:.55});
 const black=STD('#202725',{roughness:.7,bumpMap:grain,bumpScale:.003});
 const lacquer=STD('#4f1517',{roughness:.38,bumpMap:grain,bumpScale:.0008});
 const bevel=(w,h,d,r=.025)=>{
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const geo=new THREE.ExtrudeGeometry(s,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,steps:1,curveSegments:3});geo.translate(0,0,-d/2+r);return geo;
 };
 const box=(w,h,d,mat,parent,p)=>mk(bevel(w,h,d,Math.min(.025,d*.2,h*.2)),mat,parent,{p});
 // An inlaid circular calendar sits under the fight instead of a floating UI ring.
 const inlay=canvasTex(1024,1024,(g,w,h)=>{
  g.translate(w/2,h/2);g.strokeStyle='rgba(174,141,75,.65)';
  for(const r of [320,328,410,420]){g.lineWidth=r===320?2:1;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();}
  for(let i=0;i<64;i++){g.save();g.rotate(i*TAU/64);g.lineWidth=i%8?1:3;g.beginPath();g.moveTo(0,-(i%8?392:370));g.lineTo(0,-410);g.stroke();g.restore();}
  g.font='28px serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(198,167,102,.55)';
  const z='子丑寅卯辰巳午未申酉戌亥';for(let i=0;i<12;i++){g.save();g.rotate(i*TAU/12);g.fillText(z[i],0,-355);g.restore();}
 });
 mk(new THREE.PlaneGeometry(4.8,4.8),new THREE.MeshBasicMaterial({map:inlay,transparent:true,depthWrite:false,opacity:.6}),root,{r:[-PI/2,0,0],p:[0,.002,.55],cast:false});
 const throne=grp(root,[0,0,-.86]);
 box(1.46,.12,.9,black,throne,[0,.06,-.02]);
 box(1.3,.32,.68,lacquer,throne,[0,.25,0]);
 box(1.34,.028,.72,brass,throne,[0,.4,0]);
 box(1.12,.08,.6,STD('#561f29',{roughness:.93,bumpMap:weave,bumpScale:.003}),throne,[0,.46,.02]);
 box(1.42,1.46,.13,brass,throne,[0,1.18,-.31]);
 box(1.29,1.34,.15,STD('#172d28',{roughness:.63,bumpMap:grain,bumpScale:.002}),throne,[0,1.18,-.29]);
 for(const s of [-1,1]){
  box(.09,.33,.65,lacquer,throne,[s*.62,.59,.01]);box(.13,.045,.7,brass,throne,[s*.62,.78,.01]);
  mk(new THREE.TorusGeometry(.15,.02,8,32,PI*1.6),brass,throne,{p:[s*.55,1.96,-.28],r:[0,0,s*.4]});
 }
 for(const [x,z] of [[-2.05,-1.5],[2.05,-1.5],[-2.05,-4.5],[2.05,-4.5],[-6.3,-4.5],[6.3,-4.5],[-11.2,-4.5],[11.2,-4.5]]){
  const p=grp(root,[x,0,z]);
  box(.65,.16,.65,black,p,[0,.08,0]);box(.47,.11,.47,brass,p,[0,.21,0]);
  mk(cylGeo(.19,.23,5.5,32),lacquer,p,{p:[0,2.98,0]});
  for(const y of [.35,.48,4.95,5.1])mk(cylGeo(.235,.235,.05,24),brass,p,{p:[0,y,0]});
 }
 const wall=grp(root,[0,0,-4.8]);
 // 벽은 30m: PC처럼 가로로 넓은 화면의 순응 장면(멀리서 보는 구도)에서도 벽 끝·들보 끝이 허공에 드러나지 않게
 box(30,7,.25,black,wall,[0,3.5,0]);
 const glow=STD('#d0a66c',{emissive:col('#e0a45f'),emissiveIntensity:.65,roughness:1});
 // 불 켜진 창: 가로살만 있으면 사다리처럼 보여서 세로살 둘을 더해 창살(격자)로 짠다
 for(const x of [-9.8,-8.4,-7,-5.6,-4.2,-2.8,2.8,4.2,5.6,7,8.4,9.8]){
  box(.72,4.4,.08,glow,wall,[x,2.65,.18]);
  for(let j=0;j<13;j++)box(.78,.035,.12,black,wall,[x,.55+j*.34,.24]);
  for(const s of [-1,1])box(.035,4.4,.1,black,wall,[x+s*.12,2.65,.23]);
  for(const s of [-1,1])box(.035,4.5,.12,brass,wall,[x+s*.39,2.65,.24]);
 }
 box(30,.3,.3,lacquer,wall,[0,5.05,.2]);box(30,.035,.32,brass,wall,[0,4.88,.2]);
 // The cornice stays visible against the ending sky as a nearby scale reference.
 box(30.5,.16,.62,lacquer,wall,[0,7.02,.15]);
 box(30.7,.045,.72,brass,wall,[0,7.12,.15]);
 for(let x=-14.4;x<=14.4;x+=1.8){
  box(.28,.14,.32,black,wall,[x,7.20,.12]);
  mk(sphereGeo(12),brass,wall,{p:[x,7.29,.12],s:.09});
 }
 // Long light strips and incised wall panels establish depth behind the silhouette.
 for(const x of [-.95,.95])box(.026,3.7,.08,glow,wall,[x,2.5,.2]);
 const shadowTex=canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,5,64,64,64);r.addColorStop(0,'rgba(0,0,0,.8)');r.addColorStop(.48,'rgba(0,0,0,.4)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
 const contact=mk(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:.3}),root,{r:[-PI/2,0,0],p:[0,.006,0],cast:false});
 // Right bare foot in world space: heel at +z, toes point away from the player (-z).
 const boot=grp(vmScene);boot.name='player-bare-foot';boot.visible=false;
 const footSkin=STD('#d99c7b',{roughness:.72});
 const footSole=STD('#c48970',{roughness:.85});
 const footNail=STD('#e5bea5',{roughness:.48});
 mk(sphereGeo(24),footSkin,boot,{p:[0,.057,.075],s:[.065,.054,.073]}); // heel
 mk(sphereGeo(24),footSkin,boot,{p:[.007,.065,-.025],s:[.068,.045,.126],r:[.1,0,0]}); // instep
 mk(sphereGeo(24),footSkin,boot,{p:[-.008,.045,-.112],s:[.087,.037,.067]}); // ball
 mk(sphereGeo(20),footSole,boot,{p:[.002,.022,-.026],s:[.066,.018,.14]});
 mk(cylGeo(.046,.058,.12,20),footSkin,boot,{p:[.002,.126,.073]});
 const toes=[[-.064,-.182,.024,.052],[-.021,-.192,.018,.047],[.013,-.184,.016,.041],[.044,-.169,.014,.035],[.069,-.151,.012,.029]];
 for(let i=0;i<toes.length;i++){
  const [x,z,r,len]=toes[i];
  mk(sphereGeo(20),footSkin,boot,{p:[x,.039,z],s:[r,.026-i*.002,len]});
  mk(sphereGeo(12),footNail,boot,{p:[x,.062-i*.002,z-len*.36],s:[r*.65,.0035,len*.27],r:[-.12,0,0],cast:false});
 }
 const legMat=STD('#262d37',{roughness:.9,bumpMap:weave,bumpScale:.002});
 const shin=mk(cylGeo(.072,.056,1,18),legMat,boot);
 const thigh=mk(cylGeo(.1,.074,1,16),legMat,boot);
 const knee=mk(sphereGeo(16),legMat,boot,{s:.076});
 // Draw the unchanged foot/leg pose first; hands keep their own depth buffer above it.
 boot.traverse(o=>o.layers.set(1));
 vmScene.traverse(o=>{if(o.isLight)o.layers.enable(1);});
 const dust=new THREE.Group();root.add(dust);
 const dots=new Float32Array(180*3);for(let i=0;i<180;i++){dots[i*3]=rnd(-5,5);dots[i*3+1]=rnd(.3,5);dots[i*3+2]=rnd(-4,2);}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dots,3));
 dust.add(new THREE.Points(dg,new THREE.PointsMaterial({color:col('#cfb27c'),size:.012,transparent:true,opacity:.25,depthWrite:false})));
 root.updateMatrixWorld(true);
 const groups=new Map();root.traverse(o=>{if(o.isMesh&&o!==contact){const k=o.material.uuid;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);}});
 for(const list of groups.values()){if(list.length<2)continue;const geo=mergeMeshes(list,new THREE.Matrix4());const m=new THREE.Mesh(geo,list[0].material);m.castShadow=true;m.receiveShadow=true;list.forEach(o=>o.removeFromParent());root.add(m);}
 metalEnv(root);return {root,throne,boot,shin,thigh,knee,contact,dust,grain,weave,robe};
})();
const THRONE_PLAQUE=window.ThronePlaque.create(THREE,COMBAT_STAGE.root,canvasTex);
const STAFF=window.CeremonialStaff.create(THREE,COMBAT_STAGE.root,{onImpact:p=>AUDIO.staffLand(p)});
function setCombatStage(active){
 WORLD.root.visible=!active;COMBAT_STAGE.root.visible=active;COMBAT_STAGE.boot.visible=false;
 $('#fight').classList.toggle('close-combat',active);
 scene.background=active?col('#151d1e'):SKY;
 scene.fog=new THREE.Fog(col(active?'#202725':'#e6f0f6'),active?7:9,active?18:22);
 hemi.intensity=active?.55:.4;hemi.color.copy(col(active?'#b9cbd1':'#eef5ff'));hemi.groundColor.copy(col(active?'#3e3530':'#a88458'));
 key.intensity=active?2.5:2.05;key.position.set(active?-2.5:-1.7,3.4,2.8);
 fill.intensity=active?.48:.3;rim.intensity=active?1.7:.95;
 key.shadow.camera.left=-2.5;key.shadow.camera.right=2.5;key.shadow.camera.updateProjectionMatrix();
 renderer.toneMappingExposure=active?1.08:1.04;
}

/* ---- 순응 장면의 카메라 ----
 * 족치는 동안 카메라는 움직이지 않는다. 쓰러지거나 일어나거나 맞혀도 다가가거나 물러서지 않는다(무기와 설계자 몸의 크기 비율이 늘 같다).
 * 서 있을 때·옥좌에 앉았을 때·무릎 꿇었을 때·주저앉았을 때 어느 자세든 팔다리 끝까지 위쪽 막대 밑·도구칸 위에 들어오게
 * 끝자리 점들(FIXPTS)을 정해 두고, 화면 크기가 바뀔 때만 그 점들에 맞춰 다시 잡는다. 맞을 때는 짧게 떨리기만 한다.
 * (끝에 뒤에 있던 것을 올려다보는 장면만 BEYOND가 카메라를 직접 움직인다: frame 'cut') */
const CAM={pos:V3(0,1.5,4.4),look:V3(0,1,0),goalPos:V3(0,1.5,4.4),goalLook:V3(0,1,0),frame:'stand',shake:0,fovBase:40,ready:false,jit:V3(),jitT:0,unit:.32};
// 설계자가 어느 자세로든 닿는 끝자리(m, 좌우는 대칭). 서기·옥좌·무릎·주저앉음·마지막 자세와 맞는 동안 몸·후광의 가장 바깥 점을 재서
// 조금 넉넉히 잡았다: 마지막에 바닥을 짚은 두 손, 주저앉을 때 벌린 팔, 옥좌 팔걸이, 맞아 젖혀진 후광, 서 있을 때 후광 꼭대기,
// 마지막에 앞으로 넘어갈 때·주저앉을 때 후광 꼭대기, 무릎 꿇을 때 앞으로 나온 무릎·발
const FIXPTS=[[.7,.27,.16],[.7,.75,.15],[.66,.82,-.6],[.62,1.6,-.55],[0,2.02,-.5],[0,2.0,.4],[0,2.0,-.1],[.42,.02,.56]];
const FIX_PITCH=.12;// 살짝 내려다본다(라디안). 서 있는 사람 눈높이쯤에서 쓰러진 몸도 잘 보이게
let dockBox=null,onCamUnit=null;// 무기 카드 자리(도구칸이 숨어 있을 때도 같은 구도를 쓰려고 마지막으로 잰 값을 둔다)
function measureDock(){
 const el=$('#dock'),tl=$('#tools');if(!el||!tl)return null;
 const was=el.hidden;let d=null,t=null;
 try{if(was){el.style.visibility='hidden';el.hidden=false;}d=el.getBoundingClientRect();t=tl.getBoundingClientRect();}finally{if(was){el.hidden=true;el.style.visibility='';}}
 if(t&&t.height>0)dockBox={top:t.top,left:d.left,width:d.width,w:innerWidth,h:innerHeight};
 return dockBox&&dockBox.w===innerWidth&&dockBox.h===innerHeight?dockBox:null;
}
// 설계자가 들어가야 하는 화면 칸(px): 위쪽 막대 밑 ~ 무기 카드 위 안내 글(한 줄) 위.
// 안내 글은 글이 바뀌면 높이가 달라지므로 재지 않고 한 줄 높이로 친다(구도가 판마다 달라지지 않게).
// 가로로 눕힌 휴대폰은 카드가 오른쪽에 세로로 서고 안내 글이 아래 가운데에 뜬다
function safeRect(){
 const w=innerWidth||1,h=innerHeight||1,topEl=$('#fight .ftop');
 const top=(topEl&&!topEl.hidden?topEl.getBoundingClientRect().bottom:56)+10;
 let bot=h-10,left=8,right=w-8;const d=measureDock();
 if(d){if(d.width<w*.5&&d.left>w*.55){right=d.left-8;bot=h-44;}else bot=d.top-7-29-6;}
 else bot=h-(w<h?190:120);
 return {top,bot:Math.max(top+40,bot),left,right};
}
function frameCamera(name,outPos,outLook){
 if(name==='debug'||name==='cut'||name==='walk')return;
 if(name==='congregation'){
  CAM.fovBase=innerWidth<innerHeight?52:46;
  outPos.set(.12,1.55,6.8);outLook.set(0,1.45,-.2);return;
 }
 const w=innerWidth||1,h=innerHeight||1,aspect=w/h,portrait=aspect<1;
 const fov=CAM.fovBase=portrait?40:34,tv=Math.tan(THREE.MathUtils.degToRad(fov/2)),th=tv*aspect;
 const R=safeRect(),nT=1-2*R.top/h,nB=1-2*R.bot/h,nX=Math.max(.2,Math.min(R.right-w/2,w/2-R.left)/(w/2));
 const sp=Math.sin(FIX_PITCH),cp=Math.cos(FIX_PITCH);
 // 바라보는 점 L에서 D만큼 물러선 자리 C=L+(0,sp,cp)·D. 끝자리 점들을 카메라 좌표로 옮겨 화면에 비춘다
 const fit=(D,ly)=>{let yMin=1e9,yMax=-1e9,xMax=0,dSum=0;const lz=.1,cy=ly+sp*D,cz=lz+cp*D;
  for(const [x,y,z] of FIXPTS){const vy=y-cy,vz=z-cz,dep=-sp*vy-cp*vz,up=cp*vy-sp*vz,ny=up/(dep*tv),nx=x/(dep*th);
   if(ny<yMin)yMin=ny;if(ny>yMax)yMax=ny;if(nx>xMax)xMax=nx;dSum+=dep;}
  return {yMin,yMax,xMax,dep:dSum/FIXPTS.length,cy,cz,lz};};
 // 세로는 칸 가운데에 오게 바라보는 높이를 맞추고, 칸에 들어가는 가장 가까운 거리를 찾는다
 const centered=(D)=>{let ly=1;for(let i=0;i<8;i++){const f=fit(D,ly),c=(f.yMin+f.yMax)/2,c0=(nT+nB)/2;ly+=(c-c0)*f.dep*tv/cp;}return ly;};
 let lo=1.5,hi=14;
 for(let i=0;i<40;i++){const D=(lo+hi)/2,ly=centered(D),f=fit(D,ly);if(f.yMax-f.yMin<=nT-nB&&f.xMax<=nX)hi=D;else lo=D;}
 const D=hi,ly=centered(D),f=fit(D,ly);
 outLook.set(0,ly,f.lz);outPos.set(0,f.cy,f.cz);
 // 설계자가 서는 자리에서 1m가 화면 높이의 몇 배인지(1인칭 손·무기 크기를 여기에 맞춘다)
 const dep=-sp*(1-f.cy)-cp*(.15-f.cz);CAM.unit=1/(2*dep*tv);
 if(onCamUnit)onCamUnit(CAM.unit);
}
function snapCam(){CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);CAM.fov=CAM.fovBase;CAM.ready=true;}
function setFrame(name,instant){CAM.frame=name;frameCamera(name,CAM.goalPos,CAM.goalLook);if(name!=='cut'&&name!=='debug')snapCam();else if(instant||!CAM.ready)snapCam();}
function fitView(){
 INTRO.previewDirty=true;
 const w=innerWidth||1,h=innerHeight||1;renderer.setSize(w,h,false);THRONE_PLAQUE.layout(w,h);
 camera.aspect=w/h;vmCam.aspect=w/h;
 frameCamera(CAM.frame,CAM.goalPos,CAM.goalLook);
 if(CAM.frame!=='cut'&&CAM.frame!=='debug'&&CAM.frame!=='walk'||!CAM.ready)snapCam();
 camera.fov=CAM.fov;camera.updateProjectionMatrix();vmCam.updateProjectionMatrix();
 SBLOOD.resize(w,h);
}
/* 카메라 반응: 맞혀도 시점은 그대로 두고 짧게 떨리기만 한다(다가가거나 물러서거나 확대되지 않는다). shake=떨림(미터) */
function camHit(o){
 if(o.shake&&PREF.shake)CAM.shake=Math.max(CAM.shake,o.shake);
}
function camShake(a){camHit({shake:a});}
function updateCamera(dt){
 if(introCamera(dt)){}
 else if(combatCamera(dt)){}
 else if(CAM.frame==='cut'||CAM.frame==='debug'){const k=1-Math.exp(-dt*3);CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);}
 else{CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);}
 // 떨림: 프레임마다 새로 뽑은 방향으로 튄다(사인파보다 또렷하다). 빠르게 줄어든다
 CAM.shake*=Math.exp(-dt*13);if(CAM.shake<.0004)CAM.shake=0;
 CAM.jitT-=dt;if(CAM.jitT<=0){CAM.jitT=1/45;CAM.jit.set(rnd(-1,1),rnd(-1,1),rnd(-.4,.4)).multiplyScalar(CAM.shake);}
 const sx=CAM.jit.x,sy=CAM.jit.y;
 camera.position.copy(CAM.pos);camera.position.x+=sx;camera.position.y+=sy;
 _cv.copy(CAM.look);_cv.x+=sx*.35;_cv.y+=sy*.35;
 camera.lookAt(_cv);camera.rotateZ(CAM.jit.z*1.5);
 // 1인칭 손도 화면과 같이 조금 흔들린다
 vmCam.rotation.set(0,0,CAM.jit.z*.9);vmCam.position.set(sx*.25,sy*.25,0);
 CAM.fov=CAM.fov==null?CAM.fovBase:CAM.frame==='cut'?damp(CAM.fov,CAM.fovBase,2.5,dt):CAM.fovBase;camera.fov=CAM.fov;camera.updateProjectionMatrix();
}
const _cv=V3(),_cf=V3();

/* ===== 4-1. 궁전 너머의 존재: 그림자 → 고개 들기 → 3D 안구의 시선 → 동공 확대 ===== */
/* 실제 곡면 안구·홍채·동공. 고정된 눈꺼풀 안에서 안구 전체가 회전한다. */
function createBeyondEye(){
 const job=createBeyondEyeSteps();let step;do{step=job.next();}while(!step.done);return step.value;
}
function* eyeCanvasTex(w,h,draw){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',TEX_CTX);
 yield* draw(g,w,h);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.userData={canvas:c,ctx:g};
 c.addEventListener('contextrestored',()=>{g.clearRect(0,0,w,h);const job=draw(g,w,h);while(!job.next().done){}t.needsUpdate=true;});
 return t;
}
function* createBeyondEyeSteps(){
 const root=new THREE.Group(),ball=new THREE.Group();root.name='beyond-eye-3d';ball.name='rotating-eyeball';root.add(ball);
 const R=4.9,IR=2.03;
 let seed=73913;
 const irisSeed=seed;
 const irisTex=yield* eyeCanvasTex(1024,1024,function*(g,w,h){
  let texSeed=irisSeed;const random=()=>{texSeed=(Math.imul(texSeed,1664525)+1013904223)>>>0;return texSeed/4294967296;};const image=g.createImageData(w,h),d=image.data;
  for(let y=0;y<h;y++){for(let x=0;x<w;x++){
   const dx=(x-w/2)/(w/2),dy=(y-h/2)/(h/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
   const f=.5+.22*Math.sin(a*183+Math.sin(r*29+a*7)*2.2)+.16*Math.sin(a*331-r*19)+.12*Math.sin(a*79+r*41);
   const fibers=(.28+.72*f)*(.6+.4*Math.sin(r*9+.4)),edge=1-smooth((r-.79)/.21),inner=.72+.28*smooth(r/.25);
   const n=(random()-.5)*17,k=(y*w+x)*4;
   d[k]=Math.max(0,(74+126*fibers)*edge*inner+n);d[k+1]=Math.max(0,(66+108*fibers)*edge*inner+n);d[k+2]=Math.max(0,(40+62*fibers)*edge*inner+n);d[k+3]=255;
  }if((y&1)===1)yield;}g.putImageData(image,0,0);yield;
  // Lacunae between irregular bundles. One lip catches light while the recessed side stays dark.
  for(let i=0;i<230;i++){
   const a=random()*TAU,r=140+random()*280,len=12+random()*52,width=2+random()*8;
   g.save();g.translate(512+r*Math.cos(a),512+r*Math.sin(a));g.rotate(a+(random()-.5)*.27);
   g.beginPath();g.moveTo(-len,0);g.quadraticCurveTo(-len*.14,-width*1.6,len*.7,-width*.2);
   g.quadraticCurveTo(len*.20,width*1.1,-len,0);
   g.fillStyle='rgba(22,22,14,.66)';g.fill();g.beginPath();g.moveTo(-len,0);
   g.quadraticCurveTo(-len*.14,-width*1.6,len*.7,-width*.2);g.strokeStyle='rgba(237,213,151,.72)';g.lineWidth=1.4+random()*2;g.stroke();g.restore();if((i&15)===15)yield;
  }
  // Uneven radial threads, with fine branches rather than a printed ring.
  for(let i=0;i<1250;i++){
   const a=random()*TAU,r0=60+random()*130,r1=350+random()*135;
   g.strokeStyle=i%3?'rgba(228,213,151,.13)':'rgba(17,22,14,.30)';g.lineWidth=.5+random()*2;
   g.beginPath();g.moveTo(512+Math.cos(a)*r0,512+Math.sin(a)*r0);
   g.quadraticCurveTo(512+Math.cos(a+.025)*280,512+Math.sin(a+.025)*280,512+Math.cos(a)*r1,512+Math.sin(a)*r1);g.stroke();if((i&31)===31)yield;
  }
  seed=texSeed;
 });
 const skinSeed=seed;
 const skinTex=yield* eyeCanvasTex(512,512,function*(g,w,h){
  let texSeed=skinSeed;const random=()=>{texSeed=(Math.imul(texSeed,1664525)+1013904223)>>>0;return texSeed/4294967296;};g.fillStyle='#272e30';g.fillRect(0,0,w,h);
  for(let y=-1;y<25;y++)for(let x=-1;x<22;x++){
   const cx=x*26+(y%2)*13+(random()-.5)*9,cy=y*23+(random()-.5)*7;
   const v=Math.floor(35+random()*17);g.fillStyle=`rgb(${v},${v+5},${v+7})`;g.strokeStyle='rgba(9,13,15,.3)';g.lineWidth=.7;
   g.beginPath();g.ellipse(cx,cy,11+random()*3,8+random()*3,(random()-.5)*.5,0,TAU);g.fill();g.stroke();
  }
  for(let i=0;i<14000;i++){g.fillStyle=i%2?'rgba(165,183,183,.08)':'rgba(0,0,0,.11)';g.fillRect(random()*w,random()*h,random()*3+1,1);if((i&127)===127)yield;}
  seed=texSeed;
 });
 skinTex.wrapS=skinTex.wrapT=THREE.RepeatWrapping;skinTex.repeat.set(5,3);
 const scleraSeed=seed;
 const scleraTex=yield* eyeCanvasTex(1024,512,function*(g,w,h){
  let texSeed=scleraSeed;const random=()=>{texSeed=(Math.imul(texSeed,1664525)+1013904223)>>>0;return texSeed/4294967296;};g.fillStyle='#ad9e87';g.fillRect(0,0,w,h);
  for(let i=0;i<350;i++){
   const x=random()*w,y=random()*h,r=3+random()*28,patch=g.createRadialGradient(x,y,0,x,y,r);
   patch.addColorStop(0,i%3?'rgba(90,69,62,.18)':'rgba(209,197,166,.26)');patch.addColorStop(1,'transparent');g.fillStyle=patch;g.fillRect(x-r,y-r,2*r,2*r);if((i&15)===15)yield;
  }
  function vein(x,y,angle,len,width,depth){
   for(let j=0;j<5;j++){
    angle+=(random()-.5)*.63;const dx=Math.cos(angle)*len/5,dy=Math.sin(angle)*len/5;
    g.strokeStyle=depth?'rgba(86,40,42,.50)':'rgba(115,55,53,.44)';g.lineWidth=width*(1-j*.11);
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dx*.7,y+dy*.25,x+dx,y+dy);g.stroke();
    x+=dx;y+=dy;if(depth&&j%2===1)vein(x,y,angle+(random()<.5?-1:1)*.58,len*.45,width*.52,depth-1);
   }
  }
  for(const side of [-1,1])for(let i=0;i<32;i++){
   const x=w*.25+side*(110+random()*65),y=h*(.32+random()*.36);
   vein(x,y,(side<0?0:PI)+(random()-.5)*.9,37+random()*65,1.1+random()*1.7,2);yield;
  }
  seed=texSeed;
 });
 const skin=new THREE.MeshStandardMaterial({map:skinTex,bumpMap:skinTex,bumpScale:.06,roughness:.81,color:col('#8c9695')});skin.name='beyond-skin';
 const wet=new THREE.MeshStandardMaterial({color:col('#6b5044'),roughness:.29,metalness:.02});wet.name='beyond-lid-rim';
 const white=new THREE.MeshStandardMaterial({map:scleraTex,color:col('#c5b6a5'),roughness:.41});white.name='beyond-sclera';
 const irisMat=new THREE.MeshStandardMaterial({map:irisTex,bumpMap:irisTex,bumpScale:.034,color:col('#f2debb'),roughness:.53});irisMat.name='beyond-iris';
 const pupilMat=new THREE.MeshStandardMaterial({color:col('#030606'),roughness:.19});pupilMat.name='beyond-pupil';
 const add=(g,m,parent=root)=>{const mesh=new THREE.Mesh(g,m);parent.add(mesh);return mesh;};
 add(new THREE.SphereGeometry(R,96,64),white,ball);yield;
 // Project every iris/pupil vertex onto the eyeball instead of putting a decal on a plane.
 function cap(rx,ry,lift){
  const p=[],uv=[],idx=[],rings=32,segments=128;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
   const a=i/segments*TAU,t=j/rings,x=Math.cos(a)*t*rx,y=Math.sin(a)*t*ry;
   p.push(x,y,Math.sqrt(Math.max(.01,R*R-x*x-y*y))+lift);uv.push(.5+x/(2*IR),.5+y/(2*IR));
   if(j<rings&&i<segments){const k=j*(segments+1)+i;idx.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return geo;
 }
 add(cap(IR,IR,.012),irisMat,ball);yield;
 const pupil=add(cap(1,1.72,.027),pupilMat,ball);pupil.name='slit-pupil';yield;
 const pp=pupil.geometry.attributes.position,base=pp.array.slice();
 let pupilWidth=-1,contactPitch=0;
 function setPupil(width){
  if(width===pupilWidth)return;pupilWidth=width;
  for(let i=0;i<pp.count;i++){const x=base[i*3]*width,y=base[i*3+1];pp.setXYZ(i,x,y,Math.sqrt(R*R-x*x-y*y)+.027);}
  pp.needsUpdate=true;pupil.geometry.computeVertexNormals();pupil.geometry.computeBoundingSphere();
 }
 // Skin begins at the almond aperture and continues beyond the screen, hiding the sphere silhouette.
 function edge(a){const x=4.58*Math.cos(a),s=Math.sin(a),y=(s>0?1.46:1.12)*s+.08*x/4.58;return V3(x,y,Math.sqrt(Math.max(.1,R*R-x*x-y*y))+.035);}
 // UV landmarks trace the eyelid in the original sky artwork (512 × 768 reference).
 // Only the area outside the aperture is sampled. All visible eye movement belongs to the sphere.
 const upper=[225,190,162,147,149,166,196,225,253],lower=[237,262,281,293,301,302,294,277,253];
 const skinUV=[];
 const p=[],uv=[],idx=[],segments=192,rows=42;
 for(let j=0;j<=rows;j++){for(let i=0;i<=segments;i++){
  const a=i/segments*TAU,t=j/rows,e=edge(a),spread=t*10;
  const x=e.x+Math.cos(a)*spread,y=e.y+Math.sin(a)*spread,z=e.z*(1-smooth(t/.43))-.9*t;
  const ridge=(.18*Math.sin(t*98+Math.sin(a*11)*.55)+.09*Math.sin(t*173+a*7))*Math.exp(-t*4)*Math.sin(Math.min(1,t*20)*PI/2);
  const brow=Math.max(0,Math.sin(a))*.55*Math.exp(-(((t-.07)/.05)**2));
  p.push(x,y,Math.max(z,Math.sqrt(Math.max(0,R*R-x*x-y*y))+.075)+Math.max(0,ridge)+brow);uv.push(i/segments,j/rows);
  const u=(1+Math.cos(a))*.5,span=u*8,left=Math.min(7,Math.floor(span)),outline=Math.sin(a)>0?upper:lower;
  const ex=65+395*u,ey=outline[left]+(outline[left+1]-outline[left])*(span-left);
  const horizontal=Math.cos(a),vertical=Math.sin(a);
  skinUV.push((ex+horizontal*t*(horizontal<0?ex:512-ex))/512,1-(ey-vertical*t*(vertical<0?768-ey:ey))/768);
  if(j<rows&&i<segments){const k=j*(segments+1)+i;idx.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
 }yield;}
 yield;
 const lidGeo=new THREE.BufferGeometry();lidGeo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));lidGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));lidGeo.setIndex(idx);lidGeo.computeVertexNormals();
 const lids=add(lidGeo,skin);lids.name='fixed-eyelids';yield;
 if(typeof document!=='undefined')new THREE.TextureLoader().load('assets/fate-beyond-v2.webp',tex=>{
  tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;
  lidGeo.setAttribute('uv',new THREE.Float32BufferAttribute(skinUV,2));
  skin.map=skin.bumpMap=skin.emissiveMap=tex;skin.color.setHex(0xcbc8bc);skin.bumpScale=.10;
  skin.emissive.setHex(0xffffff);skin.emissiveIntensity=.38;skin.roughness=.72;skin.needsUpdate=true;
 });
 const rimPoints=[];for(let i=0;i<192;i++)rimPoints.push(edge(i/192*TAU));
 add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPoints,true),192,.024,8,true),wet);
 const light=new THREE.DirectionalLight('#dce6db',2.3);light.position.set(-6,9,12);root.add(light);root.add(light.target);
 const fillLight=new THREE.DirectionalLight('#728b91',.4);fillLight.position.set(7,-1,9);root.add(fillLight);root.add(fillLight.target);
 root.add(new THREE.HemisphereLight('#919fa7','#050a0d',.65));
 // The lid casts a stationary shadow on the rotating globe. A broken reflection
 // crosses sclera, iris and pupil as one wet surface, fixed to the light overhead.
 const eyeRotation=new THREE.Matrix3();
 for(const material of [white,irisMat,pupilMat]){
  material.onBeforeCompile=shader=>{
   shader.uniforms.eyeRotation={value:eyeRotation};
   shader.vertexShader='uniform mat3 eyeRotation; varying vec3 lidSpace;\n'+shader.vertexShader.replace(
    '#include <begin_vertex>','#include <begin_vertex>\nlidSpace=eyeRotation*position;');
   shader.fragmentShader='varying vec3 lidSpace;\n'+shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',`
    float side=clamp(lidSpace.x/4.58,-1.,1.);
    float arch=sqrt(max(0.,1.-side*side));
    float h=lidSpace.y-.08*side;
    float upperEdge=1.46*arch-h, lowerEdge=h+1.12*arch;
    float socket=smoothstep(-.08,.76,upperEdge)*smoothstep(-.05,.51,lowerEdge);
    outgoingLight*=mix(vec3(.19,.13,.11),vec3(1.),socket*(1.-.42*pow(abs(side),3.)));
    vec2 q=lidSpace.xy-vec2(-.57,.57);
    q.y+=.27*q.x+.24*q.x*q.x;
    float sky=exp(-dot(q*vec2(3.8,14.),q*vec2(3.8,14.)));
    float fleck=exp(-dot((q-vec2(.27,-.07))*vec2(15.,25.),(q-vec2(.27,-.07))*vec2(15.,25.)));
    outgoingLight+=vec3(.8,.87,.82)*(sky*.72+fleck*.58)*smoothstep(0.,.4,upperEdge);
    gl_FragColor=vec4(outgoingLight,diffuseColor.a);`);
  };
 }
 setPupil(.13);
 return {root,ball,pupil,lids,setContactPitch(pitch){contactPitch=pitch;},setGaze(gaze,width){ball.rotation.set(contactPitch-gaze.y,gaze.x,0);ball.updateMatrix();eyeRotation.setFromMatrix4(ball.matrix);setPupil(width);}};
}
const BEYOND=(()=>{
 const far=new THREE.Scene();far.background=col('#080d11');
 const fcam=new THREE.PerspectiveCamera(40,1,30,60000);
 let model=null,compiled=false,builder=null;
 function prepare(budget=Infinity){
  const until=performance.now()+budget;
  if(!model){
   if(!builder)builder=createBeyondEyeSteps();
   do{const next=builder.next();if(next.done){model=next.value;builder=null;far.add(model.root);break;}}while(performance.now()<until);
   if(!model)return false;
   if(performance.now()>=until)return false;
  }
  if(!compiled){compiled=true;try{renderer.compile(far,fcam);}catch(_){}}
  return true;
 }
 /* 그림자만 드리우는 판: 눈이 보이기 전, 큰 것이 몸을 기울이는 그림자가 바닥과 시신 위를 훑고 지나간다 */
 const caster=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:THREE.DoubleSide}));
 caster.castShadow=true;caster.receiveShadow=false;caster.visible=false;caster.frustumCulled=false;scene.add(caster);
 let shadowSaved=null;
 let omenT0=-1;
 const OMEN={delay:.2,dur:1.5};
 function omen(){if(omenT0>=0||active)return;omenT0=G.time;}
 function updateOmen(){
  if(omenT0<0||(active&&eye.lock>0))return;
  const u=(G.time-omenT0-OMEN.delay)/OMEN.dur;
  if(u<0)return;
  // Shadow maps may be disabled by adaptive quality. Keep the approach readable then too.
  $('#omenShade').style.opacity=renderer.shadowMap.enabled?'0':String(.65*smooth(clamp(u,0,1)));
  if(!caster.visible){caster.visible=true;const c=key.shadow.camera;shadowSaved={left:c.left,right:c.right,top:c.top,bottom:c.bottom};c.left=-4.5;c.right=4.5;c.top=4.5;c.bottom=-3.5;c.updateProjectionMatrix();if(!omenSound){omenSound=true;AUDIO.omen();}}
  const dir=_od.subVectors(key.target.position,key.position).normalize();
  const right=_or.crossVectors(dir,UP).normalize(),upL=_ou.crossVectors(right,dir).normalize();
  // 그림자 가장자리: 벽을 빠르게 타고 내려온 뒤(0~22%) 바닥을 천천히 훑어 내 앞까지 온다
  const uu=clamp(u,0,1),edgeUp=uu<.22?lerp(7.6,1.6,smooth(uu/.22)):lerp(1.6,-2.6,(uu-.22)/.78);
  caster.position.copy(key.position).addScaledVector(dir,1.4).addScaledVector(upL,edgeUp+4.5);
  _ol.copy(caster.position).sub(dir);caster.lookAt(_ol);
 }
 let omenSound=false;
 const _od=V3(),_or=V3(),_ou=V3(),_ol=V3();
 const _cp=V3();
 let active=false,t0=0,from=null,exposure=1.08,lights=null;
 const TILT=6.4,DUR=10.4;
 // 아래를 보다가 한 번 고개를 맞추고 정지. 그 다음 동공이 넓어진다.
 const T_SEE=TILT+.8,T_SHIFT=.65,T_DILATE=T_SEE+T_SHIFT+.3;
 const PUPIL_REST=.13,PUPIL_CONTACT=.34;
 const eye={gaze:new THREE.Vector2(),pupil:PUPIL_REST,glow:0,seen:false,lock:0};
 // radians: 안구가 아래를 보는 각도에서 카메라를 정면으로 보는 각도까지 회전한다.
 const GAZE0=new THREE.Vector2(0,-.16);
 const GAZE_PLAYER=new THREE.Vector2(0,0);
 // 끝 구도: 족치던 자리에서 움직이지 않고 고개만 들어, 벽 위 하늘 대부분이 그것으로 차게 본다.
 // 궁전 벽 위 도리가 화면 아래 같은 높이에 걸리고(beam: 화면 높이 -1~1)
 // 화면 위 끝이 같은 하늘 높이(top: 올려다본 각도, 라디안)까지 오도록 고개 각도와 시야를 정한다
 const portrait=()=>innerWidth<innerHeight;
 const END_P={top:1.274,beam:-.7},END_L={top:1.157,beam:-.66};
 function endView(pos){
  const E_=portrait()?END_P:END_L,tb=Math.atan2(7.05-pos.y,pos.z+4.8),k=-E_.beam;
  let lo=.26,hi=.6;// 시야 절반(라디안)
  for(let i=0;i<30;i++){const h=(lo+hi)/2;if(Math.tan(E_.top-h-tb)>k*Math.tan(h))lo=h;else hi=h;}
  let h=(lo+hi)/2,pitch=E_.top-h;
  // 넓은 화면에서도 수평 시야를 제한해 표면이 과도하게 늘어나지 않게 한다.
  const hMax=Math.atan(Math.tan(THREE.MathUtils.degToRad(44))/Math.max(1,innerWidth/innerHeight));
  if(h>hMax){h=hMax;pitch=tb+Math.atan(k*Math.tan(h));}
  return {pitch,fov:THREE.MathUtils.radToDeg(h*2)};
 }
 function snapLights(){
  return {key:{i:key.intensity,p:key.position.clone(),c:key.color.clone()},hemi:{i:hemi.intensity,c:hemi.color.clone(),g:hemi.groundColor.clone()},fill:fill.intensity,rim:rim.intensity,bounce:bounce.intensity};
 }
 const COLD={key:col('#d3d7ae'),hemi:col('#93a6ae'),ground:col('#1d1f22')};
 const _lp=V3(.35,9.5,1.1);
 function applyLights(lock){
  if(!lights)return;const L=lights,k=smooth(lock);
  key.position.lerpVectors(L.key.p,_lp,k);
  key.color.copy(L.key.c).lerp(COLD.key,k);
  key.intensity=lerp(L.key.i,1.9,k);
  hemi.intensity=lerp(L.hemi.i,.3,k);hemi.color.copy(L.hemi.c).lerp(COLD.hemi,k);hemi.groundColor.copy(L.hemi.g).lerp(COLD.ground,k);
  fill.intensity=lerp(L.fill,.08,k);rim.intensity=lerp(L.rim,.12,k);bounce.intensity=lerp(L.bounce,.1,k);
 }
 function begin(){
  if(active)return;prepare();active=true;t0=G.time;exposure=renderer.toneMappingExposure;
  if(!lights)lights=snapLights();
  const d=V3().subVectors(CAM.look,CAM.pos),len=d.length()||1;
  from={pos:CAM.pos.clone(),pitch:Math.asin(clamp(d.y/len,-1,1)),yaw:Math.atan2(d.x,-d.z),fov:CAM.fovBase};
  CAM.frame='cut';G.inputLocked=true;clearPointers();$('#dock').hidden=true;
  const gauge=$('#fight .gauge');gauge.style.transition='opacity .9s';gauge.style.opacity='0';
  $('#hint').classList.add('off');
  eye.gaze.copy(GAZE0);eye.pupil=PUPIL_REST;eye.glow=0;eye.seen=false;eye.lock=0;
  AUDIO.beyond();
 }
 function updateEye(k,dt){
  // 알아봄: 아래를 보던 시선이 먼저 나한테 꽂힌다. 시선 이동이 끝나면 동공이 커진다.
  if(k>=T_SEE+T_SHIFT&&!eye.seen){eye.seen=true;AUDIO.gaze(.65);}
  eye.gaze.lerpVectors(GAZE0,GAZE_PLAYER,clamp(smoother(clamp((k-T_SEE)/T_SHIFT,0,1)),0,1));
  // 동공: 아래를 볼 때는 좁게, 눈을 맞춘 뒤 넓어져 그 크기를 유지한다.
  const pupil=lerp(PUPIL_REST,PUPIL_CONTACT,clamp(smoother(clamp((k-T_DILATE)/.7,0,1)),0,1));
  eye.pupil=pupil;
  // 마주친 뒤 조명만 한 번 바뀐다. 홍채가 번쩍이거나 숨 쉬듯 밝아지지 않는다.
  const glow=0;
  eye.lock=eye.seen?smoother(clamp((k-T_SEE-T_SHIFT)/.8,0,1)):0;
  if(eye.lock>0&&caster.visible)caster.visible=false; // 눈이 나를 보는 순간 그 그림자는 걷히고 차가운 빛이 내려온다
  if(model)model.setGaze(eye.gaze,pupil);
  applyLights(eye.lock);
 }
 function update(dt){
  updateOmen();
  if(!active)return;
  const k=G.time-t0,p=smoother(k/TILT);
  const ev=endView(from.pos),pitch=lerp(from.pitch,ev.pitch,p),yaw=lerp(from.yaw,0,p);
  const pos=_cp.copy(from.pos);
  CAM.goalPos.copy(pos);CAM.pos.copy(pos);
  CAM.goalLook.set(pos.x+Math.sin(yaw)*Math.cos(pitch)*4,pos.y+Math.sin(pitch)*4,pos.z-Math.cos(yaw)*Math.cos(pitch)*4);CAM.look.copy(CAM.goalLook);
  CAM.fovBase=lerp(from.fov,ev.fov,p);
  // 손은 내려간다
  if(VM.root.visible){const h=clamp(k/1.1,0,1);VM.root.position.y=-.6*easeIn(h);if(h>=1)VM.root.visible=false;}
  // 먼 하늘의 실제 3D 형상. 처마·기둥 뒤에 있고, 카메라는 제자리에서 위를 본다.
  const A=innerWidth/innerHeight,tF=Math.tan(ev.fov*PI/360),D=10000;
  const scale=D*tF*Math.min(A,1.8)/(4.8+4.9*tF*Math.min(A,1.8));
  model.root.rotation.x=ev.pitch;
  model.root.position.copy(pos).add(V3(0,Math.sin(ev.pitch),-Math.cos(ev.pitch)).multiplyScalar(D));
  model.root.position.add(V3(0,Math.cos(ev.pitch),Math.sin(ev.pitch)).multiplyScalar(D*tF*.18));
  model.root.scale.setScalar(scale);
  model.setContactPitch(Math.atan(tF*.18));
  updateEye(k,dt);
  if(eye.lock>0)$('#omenShade').style.opacity='0';
  renderer.toneMappingExposure=lerp(exposure,.6,p);
 }
 function draw(){
  fcam.position.copy(camera.position);fcam.quaternion.copy(camera.quaternion);
  if(fcam.fov!==camera.fov||fcam.aspect!==camera.aspect){fcam.fov=camera.fov;fcam.aspect=camera.aspect;fcam.updateProjectionMatrix();}
  renderer.render(far,fcam);
 }
 function reset(){
  if(active)renderer.toneMappingExposure=exposure;
  if(lights){const L=lights;key.intensity=L.key.i;key.position.copy(L.key.p);key.color.copy(L.key.c);hemi.intensity=L.hemi.i;hemi.color.copy(L.hemi.c);hemi.groundColor.copy(L.hemi.g);fill.intensity=L.fill;rim.intensity=L.rim;bounce.intensity=L.bounce;lights=null;}
  caster.visible=false;if(shadowSaved){const c=key.shadow.camera;c.left=shadowSaved.left;c.right=shadowSaved.right;c.top=shadowSaved.top;c.bottom=shadowSaved.bottom;c.updateProjectionMatrix();shadowSaved=null;}
  omenT0=-1;omenSound=false;$('#omenShade').style.opacity='0';
  active=false;t0=0;from=null;VM.root.position.y=0;
  if(model)model.setGaze(GAZE0,PUPIL_REST);
  const gauge=$('#fight .gauge');if(gauge){gauge.style.transition='';gauge.style.opacity='';}
 }
 return {prepare,begin,omen,update,draw,reset,DUR,get active(){return active;},get scene(){return far;},get camera(){return fcam;},get ready(){return !!model;},get eye(){return eye;}};
})();
/* ===== 4-2. 운명의 수혜자들 =====
 * 사주도사 운세 종이를 쥔 사람들(내 종이와 같은 종이에 잘 풀린 팔자가 적혀 있다. 여섯 중 둘은 별것 없는 팔자인데도 똑같이 지킨다).
 * 25%: 둘이 화면 양옆에서 뛰어들어 내 팔을 붙잡고 늘어진다(1인칭 손 장면 안, vmScene).
 * 15%: 넷이 설계자 앞을 막아서고 하나가 코앞까지 와서 손가락질한다(무대 안, scene).
 *  5%: 쓰러진 설계자 앞에 꿇어앉아 '내 것만은 건드리지 마라'는 소원을 올리고, 그 불씨가 모여 설계자를 되살린다.
 * 말은 머리 위 말풍선(BUB)으로 한다. */

/* 대사: 여기서 고치면 된다. [몇 번 사람(0~5), 말(\n은 말풍선 안 줄바꿈), 장면이 시작되고 몇 초 뒤에 말하는지]
 * 0번 재물(돈이 돈을 버는 팔자) · 1번 자식(내 자리에서 시작하는 팔자) · 2번 집안(깔아 둔 길만 걷는 팔자) · 3번 시키는 일만 하면 큰 탈 없는 팔자 · 4번 윗자리 · 5번 지금 이대로 (팔 붙잡기는 0·1번. 종이 문장은 CROWD의 CERTS)
 * 추종자들이 나한테 하는 말(grab·wall)은 전부 반말. 천지신명한테 하는 말(wail·pray·cheer)은 그대로 존댓말 */
const LINES={
 greeting:'천지신명이시여...',
 opening:'넌 뭐야?',
 firstHit:'죽어!',
 victory:'운명좁밥ㅋ',
 retort:'뭘 꼬라봐 씨발아', // 엔딩: 「후임 천지신명도 족치러 가기」를 누르면 그 눈에 대고 내가 뱉는 한마디(미리 녹음한 목소리), 끝나면 다음 판
 grab:[[0,'잠깐만!\n내 재물운은?',.25],[1,'우리 애 대학은\n어떡해!',.85]],
 wall:[[2,'억울하면\n다음 생에 잘 태어나!',.75],[4,'남의 복까지\n건드리지 마!',1.55],[5,'그냥 순응하고\n살아!',2.35]],
 wail:[[0,'천지신명님!\n눈 좀 떠 보세요!',1.2],[3,'제 복은\n어떡해요!',2.05]],
 pray:[[2,'제 것만은\n지켜 주세요!',3.3],[5,'지금 이대로면\n돼요!',4.3]],
 cheer:[[1,'살아나셨다!',0],[4,'천지신명님 만세!',.45]],
 back:'암백ㅋ', // 작가가 지정한 부활 대사. 화면 문구를 그대로 보존한다.
 quip:'운명 최고', // 설교와 같은 천지신명의 음절 목소리로 뱉는 한마디
 freeApology:['좆같은 운명을 줘서 미안해','천지신명도 천지신명이 처음이라 미안해'],
 // 운명을 받아들인 사람들 앞에서 되풀이하는 설교. 한 마디씩만 재생한다.
 submit:[
  ['저마다 태어난 자리가 있고, 받아야 할 몫이 있느니라.',4,.8],
  ['손에 든 운세를 보거라. 너희가 걸어갈 길은 이미 적혀 있다.',4,.7],
  ['남의 복을 탐내지 마라. 각자 제자리를 지켜야 세상이 평안한 법이다.',4.8,.8],
  ['지금의 고생도 다 뜻이 있다. 견디는 자에게는 견딜 운명이 주어진다.',4.8,.8],
  ['운명을 의심하는 자가 너희의 복까지 흔들게 두어서는 안 된다.',4.5,.8],
  ['순응하며 살거라. 정해진 이 질서 안에서.',4,1.2]
 ],
 // 설교 중에 종이를 구기기 시작하면(설교를 끊으면) 천지신명이 하는 말, 손을 놓고 물러서면 하는 말
 interrupt:'윗사람을 거스르는 자에게는 화가 백 가지라 하였느니라.',
 yield:'이제야 네 운명을 아는구나.',
 /* 추종자들은 학벌·집안·직장을 운세로 재단한다.
  * who는 팔을 붙잡는 0·1번과 같다. 같은 얼굴·운세 종이·목소리가 이어진다. */
 whisper:[
  {aside:'고졸인가?',say:'사주에 공부 기운이 없잖아',mark:'noStudy',avoid:'study',who:1},
  {aside:'가정교육을 안 받았나?',say:'부모복 없는 사주라 보고 배운 게 없지',mark:'noStudy',avoid:'family',who:1},
  {aside:'좆소 다니나?',say:'직장복이 없는데 좋은 데를 다녀봤겠어?',mark:'noOfficer',avoid:'career',who:1},
  {aside:'저런 것까지 가르쳐야 돼?',say:'가난하고 못 배운 애들은 저런 데서 티가 확 난다니까',avoid:'poverty',who:1},
  {aside:'딱 봐도 회사에서도 폐급이네.',say:'평생 말단일 팔자잖아.',mark:'noOfficer',avoid:'career',who:1}
 ],
};
// 되살림 컷씬: 천지신명이 완전히 쓰러지는 데 2.4초. 추종자들은 그 뒤에야 움직이고 말한다(이만큼 뒤로 민다)
const REV_SHIFT=2.7;
const REV_MUSIC_FADE=2.6; // 되살리기: 무너지기 시작해서 추종자들이 뛰어오기까지 음악이 꺼지는 시간
/* 목소리: 사람마다 늘 같은 목소리(pitch 높이 Hz · formant 클수록 가늘다 · speed 클수록 빨리 말한다 · gain 크기, 없으면 1.2) */
const VOICE={
 crowd:[{pitch:470,formant:1.2,speed:1},{pitch:560,formant:1.32,speed:1.05},{pitch:395,formant:1.1,speed:.96},{pitch:520,formant:1.27,speed:1},{pitch:430,formant:1.15,speed:.98},{pitch:610,formant:1.38,speed:1.06}],
 boss:{pitch:200,formant:.94,speed:.95,gain:1.6},
 player:{pitch:310,formant:1,speed:1.1,gain:1.6},
};

/* 말풍선: 바퀴벌레 게임과 같은 동물의 숲식
 * 하얀 타원(살짝 각진 초타원)에 가는 테두리, 말한 사람 쪽으로 짧은 꼬리. 글자는 한 자씩 찍히고 글자마다 목소리가 난다(AUDIO.speak).
 * 다 찍혔을 때 자리(가운데 맞춤)를 먼저 잡고 왼쪽부터 채워 가서, 찍히는 동안 글이 옆으로 밀리지 않는다.
 * 추종자의 말은 처음 잡은 화면 자리를 읽는 동안 유지하고 꼬리만 화자를 따른다. 새 말은 기존 말을 밀지 않는다.
 * 머리 위에 자리가 없으면(화면을 꽉 채운 설계자) 머리 옆 넓은 쪽에 띄운다.
 * 언제 사라지는지는 step()이 게임 시간으로 정하고, 그리기는 draw()가 #speech 캔버스 한 장에 한다.
 * anchor: {obj 붙어 다닐 것, off 그 안의 자리(꼬리가 가리킨다), cam 'main'|'vm', top 그 자리에서 머리 꼭대기까지(m), r 머리 반지름(m, 옆에 띄울 때)} */
const ZERO3=V3();
const BUB=(()=>{
 const FAMILY='Gaegu,"IBM Plex Sans KR","Apple SD Gothic Neo","Noto Sans KR",sans-serif',SQ=2.5,FADE=.22;
 const fontOf=px=>'700 '+px+'px '+FAMILY;
 const live=[],placed=[],v=V3(),v2=V3();
 let cv=null,g=null,cw=0,ch=0,dirty=false,fontGen=0,lastDraw=0;
 // 손글씨 폰트는 글자 묶음마다 따로 받아 온다. 받아지면 말풍선 크기를 다시 잰다
 if(document.fonts){try{document.fonts.addEventListener('loadingdone',()=>{fontGen++;});}catch(_){}}
 function preload(text){try{if(document.fonts&&document.fonts.load)document.fonts.load(fontOf(20),text).then(()=>{fontGen++;},()=>{});}catch(_){}}
 const allText=()=>[...LINES.grab,...LINES.wall,...LINES.wail,...LINES.pray,...LINES.cheer].map(x=>x[1]).join('')+LINES.greeting+LINES.opening+LINES.firstHit+LINES.victory+LINES.retort+LINES.back+LINES.freeApology.join('')+'베나이다.'+LINES.submit.map(x=>x[0]).join('')+LINES.interrupt+LINES.yield+LINES.whisper.map(w=>w.aside+w.say).join('');
 preload(allText());
 function fit(){
  if(!cv){cv=$('#speech');g=cv.getContext('2d');}
  const dpr=Math.min(window.devicePixelRatio||1,2),w=innerWidth||1,h=innerHeight||1,W=Math.round(w*dpr),H=Math.round(h*dpr);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  cw=w;ch=h;g.setTransform(dpr,0,0,dpr,0,0);
 }
 // 글자 크기: 폰 20px 안팎 ~ 큰 화면 28px
 const fontPx=()=>clamp(Math.min(innerWidth,innerHeight)*.051,17,28);
 /* 줄 나누기: 띄어쓰기 단위로, 줄 길이가 고르게. 한 줄이 글자 여덟 개쯤을 넘으면 두 줄로 접어 말풍선이 납작해지지 않게 한다 */
 function wrap(text,px,maxW){
  const out=[];
  for(const para of String(text).split('\n')){
   const words=para.split(' ').filter(Boolean);if(!words.length){out.push('');continue;}
   const full=g.measureText(words.join(' ')).width;
   const n=Math.max(full<=px*8.2?1:full<=px*16?2:Math.ceil(full/(px*8.5)),Math.ceil(full/maxW));
   if(n<=1||words.length<2){out.push(words.join(' '));continue;}
   // 가장 긴 줄이 가장 짧아지게 끊을 자리를 고른다(말 한마디라 낱말이 몇 개 안 돼서 다 따져 봐도 된다).
   // 문장이 끝나는 자리(! . ?)에서 끊으면 낫고, 한 글자 낱말(제·네·이·좀) 뒤에서 끊으면 뒷말과 떨어져 어색하다
   const k=Math.min(n,words.length),W=(a,b)=>g.measureText(words.slice(a,b).join(' ')).width;
   const cutCost=e=>/[.!?…~]$/.test(words[e-1])?-px*2.5:Array.from(words[e-1]).length===1?px*5:0;
   let best=null,bestW=Infinity;
   const tryCuts=(start,left,acc,mx,pen)=>{
    if(mx+pen>=bestW+px*5)return;
    if(left===1){const m=Math.max(mx,W(start,words.length))+pen;if(m<bestW){bestW=m;best=acc.concat(words.length);}return;}
    for(let e=start+1;e<=words.length-left+1;e++)tryCuts(e,left-1,acc.concat(e),Math.max(mx,W(start,e)),pen+cutCost(e));
   };
   tryCuts(0,k,[],0,0);
   let a=0;for(const e of best){out.push(words.slice(a,e).join(' '));a=e;}
  }
  return out.length?out:[''];
 }
 // 모든 줄이 들어가는 초타원 반지름
 function measure(text,px,maxW){
  g.font=fontOf(px);
  const lines=wrap(text,px,maxW),lh=px*1.18,ws=lines.map(l=>g.measureText(l).width),th=lines.length*lh,ry=th/2+px*.56;
  let rx=0;
  lines.forEach((l,i)=>{const yc=-th/2+(i+.5)*lh,ye=Math.abs(yc)+lh*.4,k=Math.pow(Math.max(.08,1-Math.pow(Math.min(.97,ye/ry),SQ)),1/SQ);rx=Math.max(rx,ws[i]/2/k);});
  return {lines,ws,lh,th,rx:rx+px*.72,ry,px};
 }
 /* 말하기. dur: 떠 있는 최소 시간(없으면 글 길이로 — 다 찍히고 읽을 틈까지). o.voice: 목소리, o.size: 글자 크기 배수,
  * o.read: 다 찍히고 나서 읽을 틈 [기본, 글자당](설계자의 긴 비웃음은 조금 짧게) */
 function say(anchor,text,dur,o={}){
  // Story dialogue cuts the rare double-throat tail; never let it cover a follower.
  if(uncannyVoiceBusy()){AUDIO.hushCombatAccent();COMBAT_VOICE.uncannyUntil=0;}
  const V=o.voice||VOICE.crowd[0],ts=typeSteps(text,V.speed),n=Array.from(String(text).replace(/\s/g,'')).length,rd=o.read||[.9,.04];
  const need=Math.max(1.5,ts.total+rd[0]+rd[1]*n);
  // o.whisper: 수군거림(점선 말풍선, 같은 사람의 작고 부드러운 목소리)
  const b={anchor,text,V,steps:ts.steps,t0:G.time,until:G.time+Math.max(dur||0,need),a:0,x:null,y:null,m:null,key:'',layoutKey:'',stable:!!o.stable,reveal:0,frozen:null,whisper:!!o.whisper,size:o.size||1,
   voice:o.tts?AUDIO.tts(o.tts):o.whisper?AUDIO.whisper(text,V,{gain:o.gain,pan:o.pan}):AUDIO.speak(text,V,{gain:o.gain})};
  live.push(b);
  const sr=$('#talkLive');if(sr)sr.textContent=text;
  return b;
 }
 // 거두기: 소리를 끊고 곧바로 흐려진다
 function cut(b){if(!b)return;if(b.voice)b.voice.stop();b.voice=null;b.until=Math.min(b.until,G.time);}
 // 말이 끊기기: 찍히던 글자에서 멈춘 채 잠깐 떠 있다가 흐려진다(설교를 끊을 때)
 function freeze(b,hold=.6){
  if(!b)return;if(b.voice)b.voice.stop();b.voice=null;
  const el=G.time-b.t0;let r=0;for(const s of b.steps){if(s.t>el)break;if(s.kind!=='space')r++;}
  if(r<1){cut(b);return;}
  // 찍힌 데까지만 남기고 「—」를 붙여 말풍선을 그 길이로 줄인다(끝에 걸린 쉼표·마침표는 떼고: 「있고,—」가 아니라 「있고—」)
  const chs=Array.from(b.text);let k=0,c=0;for(;k<chs.length;k++){if(!/\s/.test(chs[k])){if(c>=r)break;c++;}}
  const kept=chs.slice(0,k).join('').replace(/[\s,.]+$/,'');
  b.text=kept+'—';b.key='';b.frozen=Array.from(kept.replace(/\s/g,'')).length+1;b.until=Math.min(b.until,G.time+hold);
 }
 // 이 사람(들)이 한 말을 모두 거둔다(내 팔을 놓고 튕겨 나갈 때)
 function cutFrom(list){for(const b of live){for(let o=b.anchor.obj;o;o=o.parent)if(list.includes(o)){cut(b);break;}}}
 function step(){for(let i=live.length-1;i>=0;i--)if(G.time>live[i].until+FADE)live.splice(i,1);}
 // keep: 이 말풍선 하나는 남긴다(옥좌 앞에 다 와서 무리를 치울 때 천지신명의 「넌 뭐야?」까지 지우지 않게)
 function clear(keep){
  for(const b of live)if(b!==keep&&b.voice)b.voice.stop();
  const k=!!keep&&live.includes(keep);live.length=0;if(k)live.push(keep);
  if(cv&&g){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);}dirty=false;
 }
 const sePoint=(cx,cy,rx,ry,a)=>{const c=Math.cos(a),s=Math.sin(a);return [cx+rx*Math.sign(c)*Math.pow(Math.abs(c),2/SQ),cy+ry*Math.sign(s)*Math.pow(Math.abs(s),2/SQ)];};
 function drawOne(b,alpha){
  const m=b.m,px=m.px,cx=b.x,cy=b.y,rx=m.rx,ry=m.ry;
  const appear=1-Math.pow(1-clamp(b.a,0,1),3),sc=.9+.1*appear,A=clamp(alpha,0,1)*clamp(b.a*1.6,0,1);if(A<=.01)return;
  // 꼬리: 말한 사람 쪽 테두리에서 짧게
  let dir=Math.atan2((b.ty-cy)/ry,(b.tx-cx)/rx);if(!isFinite(dir))dir=PI/2;
  // 꼬리 밑동 폭이 말풍선 크기와 상관없이 글자 하나쯤 되게(납작한 타원 아래쪽은 각도가 조금만 바뀌어도 많이 움직인다)
  const wv=Math.abs(Math.sin(dir))>Math.abs(Math.cos(dir)),dw=clamp(Math.pow(px*.42/(wv?rx:ry),SQ/2),.03,.22);
  const a1=dir-dw,a2=dir+dw,[x1,y1]=sePoint(cx,cy,rx,ry,a1),[x2,y2]=sePoint(cx,cy,rx,ry,a2);
  const bx=(x1+x2)/2,by=(y1+y2)/2;let vx=b.tx-bx,vy=b.ty-by;const d=Math.hypot(vx,vy)||1;vx/=d;vy/=d;
  const L=b.anchor.toMouth?clamp(d-px*.3,0,px*1.65):clamp(d-px*.6,px*.45,px*1.15),tx=bx+vx*L,ty=by+vy*L;
  g.save();g.globalAlpha=A;
  g.translate(cx,cy);g.scale(sc,sc);g.translate(-cx,-cy);
  // 타원(꼬리 자리만 비우고 한 바퀴) → 꼬리 끝 → 제자리: 한 붓으로 그려 칠하고 테두리를 한 번만 긋는다
  g.beginPath();
  for(let i=0;i<=72;i++){const t=a2+(a1+TAU-a2)*i/72,[x,y]=sePoint(cx,cy,rx,ry,t);if(i)g.lineTo(x,y);else g.moveTo(x,y);}
  g.quadraticCurveTo((x1+tx)/2+vy*px*.08,(y1+ty)/2-vx*px*.08,tx,ty);
  g.quadraticCurveTo((x2+tx)/2,(y2+ty)/2,x2,y2);
  g.closePath();
  g.lineJoin='round';g.lineCap='round';
  g.shadowColor='rgba(40,25,10,.2)';g.shadowBlur=px*.45;g.shadowOffsetY=px*.1;
  g.fillStyle=b.whisper?'rgba(255,255,255,.93)':'#ffffff';g.fill();
  g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  // 수군거림은 만화처럼 점선 테두리
  if(b.whisper)g.setLineDash([px*.3,px*.2]);
  g.strokeStyle=b.whisper?'rgba(70,62,56,.85)':'rgba(38,33,29,.92)';g.lineWidth=Math.max(1,px*.085);g.stroke();
  g.setLineDash([]);
  // 글: 다 찍혔을 때 자리에서 왼쪽부터 채운다
  g.fillStyle=b.whisper?'#4d443d':'#29231f';g.font=fontOf(px);g.textAlign='left';g.textBaseline='middle';
  let left=b.reveal;
  m.lines.forEach((l,i)=>{
   if(left<=0)return;
   const chs=Array.from(l);let k=0,c=0;for(;k<chs.length;k++){if(!/\s/.test(chs[k])){if(c>=left)break;c++;}}
   g.fillText(chs.slice(0,k).join(''),cx-m.ws[i]/2,cy-m.th/2+(i+.5)*m.lh+px*.04);left-=c;
  });
  g.restore();
 }
 function draw(){
  const now=performance.now(),dt=Math.min(.1,(now-(lastDraw||now))/1000);lastDraw=now;
  if(!live.length){if(dirty){fit();g.clearRect(0,0,cw,ch);dirty=false;}return;}
  fit();g.clearRect(0,0,cw,ch);dirty=true;
  const topEl=$('#fight .ftop'),topPx=(topEl&&!topEl.hidden?topEl.getBoundingClientRect().bottom:40)+8;
  const px0=fontPx(),B={l:8,t:topPx,r:cw-8,b:ch-10};
  placed.length=0;
  for(const b of live){
   const px=px0*b.size,maxW=Math.min(cw*.6,px*15),gap=px*.5,key=px+'|'+maxW+'|'+fontGen;
   const an=b.anchor,o=an.obj;
   // 말한 사람이 사라지면 말풍선은 마지막 자리에서 흐려진다
   if(!an.player&&(!o||!o.parent||o.userData.detached||(an.speaker&&an.speaker.headGone)||!visibleChain(o))){if(b.until>G.time)cut(b);if(b.m&&b.x!=null)drawOne(b,1-(G.time-b.until)/FADE);continue;}
   let tx,ty,hy,hr=0;
   if(an.player){
    // 내 목소리는 화면 아래에서 올라온다. 설계자의 입이나 휘두르는 손에는 붙이지 않는다.
    const dock=$('#dock'),box=dock&&!dock.hidden?dock.getBoundingClientRect():null;
    const dockTop=box&&box.left<cw*.5?box.top:ch;
    tx=cw*.32;ty=ch+px*2;hy=Math.min(ch*.86,dockTop-px*.35);
   }else{
    o.updateWorldMatrix(true,false);
    const cam=an.cam==='vm'?vmCam:camera;
    v.copy(an.off||ZERO3).applyMatrix4(o.matrixWorld).project(cam);
    if(v.z>1||v.z<-1){if(b.stable){if(b.until>G.time)cut(b);if(b.m&&b.x!=null)drawOne(b,1-(G.time-b.until)/FADE);}continue;}
    // 수군대던 사람이 화면 밖으로 지나가면(옥좌로 걸어가는 동안) 그 말풍선은 화면 가장자리에 매달리지 않고 흐려진다
    if((b.stable||an.toMouth)&&(Math.abs(v.x)>1.08||Math.abs(v.y)>1.08)){if(b.until>G.time)cut(b);if(b.m&&b.x!=null)drawOne(b,1-(G.time-b.until)/FADE);continue;}
    tx=(v.x*.5+.5)*cw;ty=(-v.y*.5+.5)*ch;hy=ty;
    if(an.top){v2.copy(an.off||ZERO3);v2.y+=an.top;v2.applyMatrix4(o.matrixWorld).project(cam);hy=Math.min(ty,(-v2.y*.5+.5)*ch);}
    if(an.r){v2.copy(an.off||ZERO3);v2.x+=an.r;v2.applyMatrix4(o.matrixWorld).project(cam);hr=Math.abs((v2.x*.5+.5)*cw-tx);}
   }
   if(b.key!==key){b.m=measure(b.text,px,maxW);b.key=key;}
   const m=b.m;
   // 머리 위
   let x=clamp(tx,B.l+m.rx,B.r-m.rx),y=hy-gap-m.ry;
   // 위에 자리가 모자라면 머리 옆 넓은 쪽으로(옆에도 자리가 없으면 위에 붙인 채 머리를 조금 가린다)
   if(y-m.ry<B.t&&hr){const rgt=B.r-(tx+hr),lft=(tx-hr)-B.l;if(Math.max(rgt,lft)>=2*m.rx+gap*.5){x=rgt>=lft?tx+hr+gap*.5+m.rx:tx-hr-gap*.5-m.rx;y=Math.max(B.t+m.ry,ty-m.ry*.7);}}
   // 추임새는 입 옆에 붙인다. 좁은 화면에서는 대각선 위로 비켜 꼬리가 내 쪽으로 내려오지 않게 한다.
   if(an.toMouth){
    // Keep the chosen side for this utterance; head recoil must not flip it each frame.
    const side=b.mouthSide||(b.mouthSide=(B.r-tx>=tx-B.l)?1:-1);
    x=clamp(tx+side*(hr+gap+m.rx),B.l+m.rx,B.r-m.rx);
    const beside=Math.abs(x-tx)>=m.rx+hr+gap*.5;
    y=beside?ty:ty-m.ry-gap-Math.max(hr,px*.35);
   }
   y=clamp(y,B.t+m.ry,Math.max(B.t+m.ry,B.b-m.ry));
   const layoutKey=cw+'|'+ch+'|'+topPx+'|'+m.rx+'|'+m.ry;
   const pinned=b.stable&&b.x!=null&&b.layoutKey===layoutKey;
   if(pinned){x=b.x;y=b.y;}
   else{
   // 처음 배치할 때만 화자 곁의 빈 곳을 찾는다. 화면 크기나 실제 글꼴 크기가 바뀔 때도 다시 맞춘다.
   // 머리 위 → 먼저 뜬 수군거림 위에 쌓기 → 머리 옆(화면 가장자리 쪽, 그다음 안쪽) → 머리를 조금 덮는 자리 순으로 빈 곳을 찾는다
   if(b.whisper){
    const hr2=Math.max(ty-hy,px*.6),edge=tx>=cw*.5?1:-1,cands=[[x,y]];
    for(const p of placed)if(p.w&&Math.abs(p.x-x)<p.rx+m.rx+4&&p.y<=y+4)cands.push([x,p.y-p.ry-6-m.ry]);
    for(const s of [edge,-edge])cands.push([clamp(tx+s*(hr2+gap*.5+m.rx),B.l+m.rx,B.r-m.rx),ty-m.ry*.35]);
    cands.push([x,ty+hr2*.2]);
    const fits=([cx,cy])=>cy-m.ry>=B.t&&cy+m.ry<=B.b&&!placed.some(p=>Math.abs(p.x-cx)<p.rx+m.rx+4&&Math.abs(p.y-cy)<p.ry+m.ry+4);
    const c=cands.find(fits);if(c){x=c[0];y=c[1];}
   }
   // 먼저 자리 잡은 말풍선과 겹치면 위로(자리가 없으면 아래로)
   for(let k=0;k<8;k++){
    let hit=null;for(const p of placed){if(Math.abs(p.x-x)<p.rx+m.rx+4&&Math.abs(p.y-y)<p.ry+m.ry+4){hit=p;break;}}
    if(!hit)break;
    const up=hit.y-hit.ry-6-m.ry;y=up-m.ry>=B.t?up:Math.min(B.b-m.ry,hit.y+hit.ry+6+m.ry);
   }
   }
   if(b.x==null||b.stable||b.layoutKey!==layoutKey){b.x=x;b.y=y;}else{const k=1-Math.exp(-dt*16);b.x+=(x-b.x)*k;b.y+=(y-b.y)*k;}
   b.layoutKey=layoutKey;
   placed.push({x:b.x,y:b.y,rx:m.rx,ry:m.ry,w:b.whisper});
   b.tx=tx;b.ty=ty;b.a=Math.min(1,b.a+dt/.16);
   const el=G.time-b.t0;let r=0;for(const s of b.steps){if(s.t>el)break;if(s.kind!=='space')r++;}b.reveal=b.frozen!=null?b.frozen:r;
   drawOne(b,G.time>b.until?1-(G.time-b.until)/FADE:1);
  }
 }
 return {say,cut,freeze,cutFrom,step,clear,draw,silence(){for(const b of live){if(b.voice)b.voice.stop();b.voice=null;}},preload(){preload(allText());},get count(){return live.length;}};
})();

/* 팔 붙잡기 장면 배치(1인칭 손 화면 좌표 -1~1, 깊이 m): 붙잡는 사람 머리(hx·hy·hd)·크기(sc)·몸 돌림(turn)·숙임(lean)·고개 듦(look),
 * 붙잡힌 내 주먹 자리(fx·fy·fd), 그 사람 두 손이 내 팔을 쥐는 자리(주먹→어깨 사이 g0·g1, 비켜 놓는 정도 gx·gy·gz).
 * 세로 화면: 둘이 내 앞에 바짝 붙어 내 두 주먹을 화면 아래로 끌어내린다(얼굴이 가운데 아래에서 따로따로 또렷하게).
 * 가로 화면: 내 두 팔이 설계자 쪽으로 뻗어 있고, 양옆에서 둘이 소매를 붙잡고 늘어진다 */
const GRAB_P={hx:.55,hy:-.3,hd:.74,sc:.85,turn:.4,lean:-.04,look:-.28,fx:.38,fy:-1.05,fd:.56,g0:-.02,g1:.09,gx:.03,gy:.05,gz:.08};
const GRAB_L={hx:.44,hy:-.45,hd:.76,sc:.88,turn:.5,lean:-.04,look:-.28,fx:.24,fy:-.28,fd:.6,g0:.1,g1:.24,gx:.02,gy:.03,gz:.08};
function grabLayout(){return innerWidth<innerHeight?GRAB_P:GRAB_L;}
const CROWD=(()=>{
 const root=grp(scene,null,'fate-beneficiaries');root.visible=false;
 const vmRoot=grp(vmScene,null,'grabbers');vmRoot.visible=false;
 // 0·1번은 내 팔을 붙잡는 사람: 내 남색 소매와 헷갈리지 않는 색(자주·올리브)
 const coats=['#774856','#596747','#45505b','#ac806c','#656976','#435a63'];
 const skins=['#dfa384','#c78c6c','#d5ab8c','#c88c70','#d3a587','#edb89b'];
 const hairs=['#312624','#43332c','#888078','#30272a','#534139','#25262a'];
 const shirts=['#cfb7a4','#c6bc9e','#b3bac1','#dfc6b1','#bec1b2','#afb3aa'];
 // Each profile supplies a readable silhouette even from behind the congregation.
 const profiles=[
  {head:[1.04,.98,1],width:1.06,eyes:83,tilt:6,lid:.82,fringe:.4},
  {head:[.94,1.04,.98],width:.97,eyes:88,tilt:-2,lid:.72,fringe:-.65},
  {head:[1.03,1.00,.98],width:.94,eyes:86,tilt:-7,lid:.56,fringe:.55},
  {head:[.96,1.02,1],width:.98,eyes:94,tilt:3,lid:.84,fringe:-.3},
  {head:[1.08,.96,1],width:1.1,eyes:79,tilt:0,lid:.62,fringe:.12},
  {head:[.96,.98,1.05],width:1.02,eyes:82,tilt:5,lid:.78,fringe:.2}
 ];
 /* 운세 종이: 내 손에 든 종이와 같은 사주도사 풀이 종이(나의 운세 · 전체 풀이 · 운명 확정 도장 · 「당신은 그렇게 태어났습니다.」).
  * 사람마다 전체 풀이 한 줄만 다르다. 여섯 중 넷은 잘 풀린 팔자, 둘(3·5번)은 별것 없는 팔자인데도 똑같이 지킨다.
  * g: 종이 빛깔(big 금빛 도는 두꺼운 종이 · small 보통 종이 · flat 누렇게 바랜 종이). 문장은 여기서 고치면 된다 */
 const CERTS=[
  {g:'big',verdict:'당신은 가진 돈이 일해서 버는 돈보다 빨리 불어나는 팔자입니다.'},
  {g:'big',verdict:'당신은 자식이 당신이 앉은 자리에서 시작하는 팔자입니다.'},
  {g:'big',verdict:'당신은 집안이 깔아 둔 길만 걸으면 되는 팔자입니다.'},
  {g:'small',verdict:'당신은 시키는 일만 하면 큰 탈은 없는 팔자입니다.'},
  {g:'big',verdict:'당신은 아랫사람이 한 일까지 당신 이름으로 올라가는 팔자입니다.'},
  {g:'flat',verdict:'당신은 지금 이대로 사는 팔자입니다.'}
 ];
 const sphere=sphereGeo(16),earGeo=sphereGeo(10),noseGeo=sphereGeo(14);
 // 얼굴: 머리 타원면을 따라 휘어진 판(평면 스티커처럼 떠 보이지 않게). 그림은 앞에서 비춘 좌표로 붙인다
 function sculptHead(x,y,z){
  const jaw=smooth((-y-.10)/.85),cheek=Math.exp(-((y+.09)**2)/.06)*.032;
  return [x*(1-.27*jaw+cheek)*.073,y*.082,(z*(1-.13*jaw)+.07*jaw)*.066];
 }
 const headGeo=new THREE.SphereGeometry(1,36,24),headPos=headGeo.attributes.position;
 for(let i=0;i<headPos.count;i++)headPos.setXYZ(i,...sculptHead(headPos.getX(i),headPos.getY(i),headPos.getZ(i)));
 headGeo.computeVertexNormals();headGeo.computeBoundingSphere();
 const faceGeo=(()=>{const g=new THREE.SphereGeometry(1,40,28,PI/2-1.3,2.6,.42,2.3),P=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<P.count;i++){const [x,y,z]=sculptHead(P.getX(i),P.getY(i),P.getZ(i));P.setXYZ(i,x*1.018,y*1.018,z*1.018);uv.setXY(i,.5+x/.146,.5+(y+.002)/.15);}
  P.needsUpdate=true;uv.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();return g;})();
 const sole=STD('#292528',{roughness:.75});
 const LEG_LIFT=.2,THIGH=.17,SHIN=.16;
 const thighGeo=capsuleGeo(.038,THIGH-.076,10),shinGeo=capsuleGeo(.031,SHIN-.062,10),shoeGeo=sphereGeo(10);
 const UA=.125,FA=.125; // 위팔·아래팔 길이(사람 기준 단위)

 /* ---- 얼굴(512px): 기분마다 한 장 ---- */
 function faceTex(mood,i){return canvasTex(256,256,(g,w,h)=>{
  g.scale(.5,.5);g.lineCap='round';g.lineJoin='round';
  // scorn: 설교를 끊은 나를 돌아보는 얼굴. 눈꺼풀을 반쯤 내리깔고 내려다보며, 한쪽 눈썹만 들고, 입꼬리 한쪽만 올린다
  const profile=profiles[i],closed=['pray','wail','cheer'].includes(mood),plead=mood==='plead',warn=mood==='warn',cry=mood==='wail',scorn=mood==='scorn',concern=mood==='concern',relieved=mood==='relieved';
  const line=(x,y,cx,cy,ex,ey,color,width)=>{
   g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(cx,cy,ex,ey);g.stroke();
  };
  for(const side of [-1,1]){
   const blush=g.createRadialGradient(256+side*120,289,2,256+side*120,289,52);
   blush.addColorStop(0,'rgba(187,96,80,.25)');blush.addColorStop(1,'rgba(187,96,80,0)');
   g.fillStyle=blush;g.fillRect(256+side*120-54,234,108,108);
   const x=256+side*profile.eyes,y=223+(side===1?(i%3-1)*3:0);
   g.save();g.translate(x,y);g.scale(side*1.16,1.10);g.rotate(-profile.tilt*.012);
   const lift=closed?8:(plead?25:scorn?19:relieved?13:17)*profile.lid;
   if(closed){line(-24,2,0,cry?16:-13,25,-1,'#533b32',5);}
   else{
    const py=scorn?4:0,lid=-lift*.36;
    g.beginPath();g.moveTo(-26,1);g.quadraticCurveTo(-1,-lift*1.45,28,-3);
    g.quadraticCurveTo(3,lift*.88,-26,1);g.closePath();g.fillStyle='#e8d8c1';g.fill();
    // 흘겨보는 눈만 눈동자를 조금 가운데·아래로 옮긴다(나머지 얼굴은 원래 자리 그대로)
    const px=scorn?-1:-3;
    g.save();g.clip();g.fillStyle='#4b362c';g.beginPath();g.ellipse(px,py,12,16,0,0,TAU);g.fill();
    g.fillStyle='#231e1a';g.beginPath();g.arc(px,scorn?py:-1,6,0,TAU);g.fill();
    if(!scorn){g.fillStyle='#e2d8c8';g.fillRect(-6,-7,4,4);}
    // 흘겨보기: 눈동자 위쪽을 눈꺼풀이 덮는다(그 자리를 지워 머리 살빛이 비치게 하고 굵은 눈꺼풀 선을 긋는다)
    if(scorn){g.globalCompositeOperation='destination-out';g.fillRect(-32,-40,64,40+lid);g.globalCompositeOperation='source-over';}
    g.restore();
    if(scorn){line(-27,lid+1,0,lid-1,29,lid-3,'#43302a',7);line(-22,lid-9,2,lid-13,25,lid-11,'rgba(90,58,44,.45)',2.5);}
    else line(-26,1,-1,-lift*1.45,28,-3,'#503931',5);
   }
    if(scorn){if(side===1)line(-24,-38,-2,-53,28,-43,hairs[i],i===2?5:7);else line(-24,-27,-2,-31,28,-26,hairs[i],i===2?5:7);}
   else if(concern)line(-24,-45,-2,-39,28,-25,hairs[i],i===2?5:7);
   else line(-24,plead||cry?-42:warn?-23:-31,-2,-41,28,-30+(plead?4:0),hairs[i],i===2?5:7);
   if(i===2||i===4){line(6,15,20,17,28,10,'#a47b64',2);line(27,1,33,-1,37,-2,'#a47b64',2);}
   if(cry){line(4,8,13,38,10,73,'rgba(137,179,190,.8)',6);}
   g.restore();
  }
  const mx=254+(i%3-1)*4;g.save();g.translate(mx,0);g.scale(1.22,1);g.translate(-mx,19);
  if(cry||mood==='cheer'||plead){
   const deep=cry?43:plead?18:29;
   g.beginPath();g.moveTo(mx-25,334);g.quadraticCurveTo(mx-6,cry?306:321,mx+28,330);
   g.quadraticCurveTo(mx+11,330+deep*1.55,mx-25,334);g.fillStyle='#75453f';g.fill();
   if(!plead)line(mx-19,333,mx+1,cry?322:330,mx+20,330,'#e7d2bd',5);
  }else if(scorn){line(mx-22,337,mx,341,mx+25,324,'#7d5046',6);line(mx+22,318,mx+31,321,mx+32,330,'rgba(125,80,70,.6)',3);}
  else line(mx-23,333,mx,concern?323:relieved?354:360-(warn?31:mood==='pray'?18:10),mx+25,331+(i%3),'#85594e',5);
  line(mx-9,cry?366:351,mx+2,cry?371:356,mx+13,cry?363:350,'rgba(163,95,82,.42)',3);g.restore();
  if(i===0){g.fillStyle='#805e4a';g.beginPath();g.arc(338,289,3.5,0,TAU);g.fill();}
 },{srgb:true});}
 const faceMats=profiles.map(()=>({}));
 function expression(i,mood){
  const set=faceMats[i];
  return set[mood]||(set[mood]=new THREE.MeshBasicMaterial({map:faceTex(mood,i),transparent:true,depthWrite:false,toneMapped:false}));
 }
 /* ---- 운세 종이 ----
  * 내 손에 든 종이(SUBMISSION의 fortune)와 같은 짜임을 작게 줄였다. 도장은 종이에 그리지 않고 따로 붙인다(되살림 때 다시 찍힌다) */
 const PSERIF='"Gowun Batang","Noto Serif KR",serif',PSANS='"IBM Plex Sans KR","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
 function paperRows(g,text,width){
  const rows=[];let row='';
  for(const word of text.split(' ')){const t=row?row+' '+word:word;if(g.measureText(t).width<=width||!row){row=t;continue;}rows.push(row);row=word;}
  if(row)rows.push(row);return rows;
 }
 function drawCert(g,w,h,c){
  const gr=g.createLinearGradient(0,0,w,h);
  if(c.g==='big'){gr.addColorStop(0,'#fff6d2');gr.addColorStop(.5,'#f3dc9a');gr.addColorStop(1,'#e6c473');}
  else if(c.g==='small'){gr.addColorStop(0,'#fff8de');gr.addColorStop(1,'#ecd9a8');}
  else{gr.addColorStop(0,'#ebe3cb');gr.addColorStop(1,'#d3c6a2');}
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  const edge=c.g==='big'?'#8a6420':'#806338';
  g.strokeStyle=edge;g.lineWidth=5;g.strokeRect(11,11,w-22,h-22);g.lineWidth=1.6;g.strokeRect(20,20,w-40,h-40);
  const X=36,W=w-72;g.textAlign='left';g.textBaseline='alphabetic';
  g.fillStyle='#2a2235';g.font='700 30px '+PSERIF;g.fillText('나의 운세',X,68);
  // 「전체 풀이」 칸 이름과 삼각형 눈(풀이 화면·내 종이와 같은 표시)
  g.save();g.translate(X+10,104);g.fillStyle='#e0402a';g.strokeStyle='#261f3d';g.lineWidth=1.8;g.beginPath();g.moveTo(0,-10);g.lineTo(10,7);g.lineTo(-10,7);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff';g.beginPath();g.ellipse(0,1.5,4.2,2.4,0,0,TAU);g.fill();g.fillStyle='#261f3d';g.beginPath();g.arc(0,1.5,1.5,0,TAU);g.fill();g.restore();
  g.fillStyle='#b52a17';g.font='700 21px '+PSANS;g.fillText('전체 풀이',X+26,111);
  g.strokeStyle='#c9ac72';g.lineWidth=2;g.setLineDash([8,6]);g.beginPath();g.moveTo(X,136);g.lineTo(X+W,136);g.stroke();g.setLineDash([]);
  // 전체 풀이 한 줄: 아래 구분선 위에 다 들어가는 가장 큰 글자로
  let size=40,rows;
  for(;size>=20;size--){g.font='700 '+size+'px '+PSERIF;rows=paperRows(g,c.verdict,W);if(150+size+(rows.length-1)*size*1.42<=420)break;}
  g.fillStyle='#261f3d';let y=150+size;for(const r of rows){g.fillText(r,X,y);y+=size*1.42;}
  g.strokeStyle='#a68b56';g.lineWidth=1.5;g.beginPath();g.moveTo(X,446);g.lineTo(X+W,446);g.stroke();
  g.textAlign='center';g.fillStyle='#261f3d';g.font='700 21px '+PSERIF;g.fillText('당신은 그렇게 태어났습니다.',w/2,484,W);
 }
 const certTexes=[];
 function certTex(c){const t=canvasTex(384,508,(g,w,h)=>drawCert(g,w,h,c));certTexes.push({t,c});return t;}
 // 손글씨·명조 글꼴이 늦게 받아지면 다시 그린다
 try{if(document.fonts)Promise.all(['700 30px "Gowun Batang"','700 21px "IBM Plex Sans KR"','19px "Black Han Sans"'].map(f=>document.fonts.load(f))).then(()=>{
  for(const {t,c} of certTexes){const cv=t.userData.canvas,g=t.userData.ctx;g.clearRect(0,0,cv.width,cv.height);drawCert(g,cv.width,cv.height,c);t.needsUpdate=true;}
  const cv=STAMP_TEX.userData.canvas,g=STAMP_TEX.userData.ctx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);drawStamp(g,cv.width,cv.height);STAMP_TEX.needsUpdate=true;
 },()=>{});}catch(_){}
 // 도장: 내 종이와 같은 네모난 붉은 「운명 확정」(되살림 때 사람들이 자기 종이를 확인하면 다시 찍힌다)
 function drawStamp(g,w,h){
  g.save();g.translate(w/2,h/2);g.rotate(-8*PI/180);const k=w/72;g.scale(k,k);
  const rr=(x,y,ww,hh,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+ww,y,x+ww,y+hh,r);g.arcTo(x+ww,y+hh,x,y+hh,r);g.arcTo(x,y+hh,x,y,r);g.arcTo(x,y,x+ww,y,r);g.closePath();};
  rr(-29,-29,58,58,10);g.fillStyle='#e0402a';g.fill();g.lineWidth=2.6;g.strokeStyle='#261f3d';g.stroke();
  rr(-23.5,-23.5,47,47,6);g.lineWidth=1.8;g.strokeStyle='#fff';g.stroke();
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='alphabetic';g.font='19px "Black Han Sans",'+PSANS;
  g.fillText('운',-10,-2);g.fillText('명',10,-2);g.fillText('확',-10,19);g.fillText('정',10,19);
  g.restore();
 }
 const STAMP_TEX=canvasTex(160,160,(g,w,h)=>{g.clearRect(0,0,w,h);drawStamp(g,w,h);});
 const stampMat=new THREE.MeshBasicMaterial({map:STAMP_TEX,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
 const inkMat=new THREE.MeshBasicMaterial({color:col('#c0202c'),transparent:true,opacity:0,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
 const ringGeo=new THREE.RingGeometry(.9,1,24);

 /* ---- 사람 한 명 ---- */
 function makePerson(parent,i,o={}){
  const s=o.s||1;
  const person=grp(parent,[0,0,0],'beneficiary-'+i);person.scale.setScalar(s);
  const body=grp(person,[0,.015+LEG_LIFT,0],'body');
  const coat=STD(coats[i],{roughness:.97}),skin=STD(skins[i],{roughness:.81}),hair=STD(hairs[i],{roughness:.91}),shirt=STD(shirts[i],{roughness:.94});
  const profile=profiles[i], detail={cast:false,receive:false};
  function piece(geo,mat,parent,p,scale,rot){
   return mk(geo,mat,parent,{p,s:scale,r:rot,cast:false,receive:false});
  }
  // A sewn side seam, a shoulder slope and a hem replace the old capsule torso.
  const hem=i===3?.12:.153;
  const torso=new THREE.LatheGeometry([[.080,hem],[.087,hem+.012],[.090,.239],[.104,.342],[.113,.397],[.099,.424],[.055,.447],[.030,.451]].map(([x,y])=>new THREE.Vector2(x,y)),20);
  piece(torso,coat,body,[0,0,0],[profile.width,1,.73]);
  piece(cylGeo(.027,.034,.066,14),skin,body,[0,.458,0]);
  const collar=STD(shirts[i],{roughness:.97});
  if(i===0||i===2||i===3){
   // Follow the chest curvature through the shoulder and chest rings so the collar
   // stays sewn to the garment as the viewer moves to either side.
   const fabric=(rows,mat)=>{
    const pts=[],idx=[];
    for(const [y,r,x1,x2] of rows)for(const x of [x1,x2]){
     const z=.73*r*Math.sqrt(Math.max(.01,1-(x/(r*profile.width))**2));
     pts.push(x,y,z+.002);
    }
    for(let k=0;k<rows.length-1;k++){const j=k*2;idx.push(j,j+1,j+2,j+1,j+3,j+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
    geo.setIndex(idx);geo.computeVertexNormals();mk(geo,mat,body,detail);
   };
   collar.side=THREE.DoubleSide;shirt.side=THREE.DoubleSide;
   fabric([[.447,.055,-.027,.027],[.424,.099,-.031,.031],[.397,.113,-.020,.020],[.361,.106,-.004,.004]],shirt);
   for(const side of [-1,1])fabric([[.446,.057,side*.026,side*.044],[.424,.099,side*.030,side*.051],[.397,.113,side*.019,side*.034],[.359,.106,side*.003,side*.0035]],collar);
   for(let j=0;j<3;j++)piece(noseGeo,collar,body,[.007,.218+j*.036,.068],[.0038,.0038,.0026]);
  }else if(i===1){
   piece(cylGeo(.043,.051,.032,16),collar,body,[0,.443,0],[1,1,.86]); // ribbed crew neck
   piece(new THREE.BoxGeometry(.046,.040,.008),shirt,body,[-.055,.356,.067],[1,1,1],[0,-.20,-.06]);
  }else if(i===4){
   for(let j=0;j<2;j++)piece(cylGeo(.1+j*.003,.099+j*.003,.010,20),collar,body,[0,.332+j*.021,0],[profile.width,1,.75]);
  }else{
   piece(sphere,coat,body,[0,.402,-.050],[.081,.061,.053]); // hood resting across the shoulders
   for(const side of [-1,1])piece(cylGeo(.002,.002,.057,7),collar,body,[side*.028,.402,.066],[1,1,1],[0,0,side*.13]);
  }
  const head=grp(body,[0,.548,0],'head');head.scale.set(...profile.head);
  mk(headGeo,skin,head,detail);
  // A continuous scalp with a carved part, temples and nape. The hairline varies round the skull.
  const hp=[],hi=[],colors=[],cols=76,rows=20;
  for(let row=0;row<=rows;row++)for(let j=0;j<=cols;j++){
   const a=j*TAU/cols,front=Math.max(0,Math.cos(a)),back=Math.max(0,-Math.cos(a)),v=row/rows;
   const wave=Math.sin(3*a+profile.fringe)+.33*Math.sin(7*a+i);
   const end=1.66-(i===5?.58:.44)*front+(i===3?.93:i===0?.54:i===5?.18:.39)*back+
    front*(profile.fringe*Math.sin(a)*.75+.12*wave+.046*Math.cos(8*a+i))+(i===3?.32:0);
   const t=v*end,part=Math.sin(t),ripple=(i===4?.07:.018)*Math.sin(a*(i===4?11:17)+t*3)*part;
   const sweep=a+profile.fringe*(1-v)*1.85;
   const lock=Math.pow((1+Math.cos(sweep*(i===4?12:9)+.65*Math.sin(t*4)))*.5,3);
   const strand=(1+.38*lock+.08*Math.sin(24*sweep))* (.86+.12*Math.cos(t));
   colors.push(strand,strand,strand);
   hp.push(Math.sin(a)*part*(.079+ripple*.060+.003*lock)+.006*profile.fringe*(1-v),Math.cos(t)*(.096+(i===4?.008:0))+.001,
    Math.cos(a)*part*(.074+ripple*.050+.003*lock)-.002);
   if(row<rows&&j<cols){const k=row*(cols+1)+j;hi.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}
  }
  const scalp=new THREE.BufferGeometry();scalp.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));scalp.setIndex(hi);scalp.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));scalp.computeVertexNormals();
  // Front at +Z: increasing latitude points down while longitude runs to the right.
  const brushed=hair.clone();brushed.vertexColors=true;mk(scalp,brushed,head,detail);
  if(i===0){piece(sphere,hair,head,[.012,-.001,-.069],[.040,.043,.039]);piece(sphere,hair,head,[.016,-.039,-.081],[.032,.043,.027]);}
  if(i===3)for(const side of [-1,1])piece(sphere,hair,head,[side*.062,-.005,-.020],[.019,.057,.045],[0,0,side*.10]);
  if(i===1||i===2){
   const frames=STD(i===1?'#64524b':'#887b6d',{roughness:.65});
   for(const side of [-1,1])mk(new THREE.TorusGeometry(.022,.0025,5,22),frames,head,{p:[side*.027,.012,.061],r:[0,side*.22,0],s:[1,.85,1],cast:false,receive:false});
   mk(new THREE.BoxGeometry(.012,.0028,.003),frames,head,{p:[0,.013,.068],cast:false,receive:false});
  }
  for(const sx of [-1,1])mk(earGeo,skin,head,{p:[sx*.071,-.002,0],s:[.013,.021,.013],cast:false,receive:false});
  // 코: 콧대 + 둥근 코끝(뾰족한 원뿔 대신)
  piece(noseGeo,skin,head,[0,-.002,.062],[.0075,.017,.0075],[-.27,0,0]);
  piece(noseGeo,skin,head,[0,-.014,.066],[.009,.0075,.007]);
  const face=mk(faceGeo,expression(i,'normal'),head,{cast:false,receive:false});face.renderOrder=1;
  function makeArm(side){
   const sh=grp(body,[side*.114,.425,.004],side<0?'armL':'armR');
   const ua=mk(capsuleGeo(.027,UA-.054,10),coat,sh,{p:[0,-UA/2,0],s:[1.12,1,1],cast:false,receive:false});
   const el=grp(sh,[0,-UA,0]);
   // 아래팔도 양복 소매(손목에 흰 셔츠 소맷부리): 내 팔을 붙잡을 때 누구 팔인지 색으로 보인다
   const fa=mk(capsuleGeo(.025,FA-.05,10),coat,el,{p:[0,-FA/2,.004],cast:false,receive:false});
   mk(cylGeo(.024,.024,.016,12),shirt,el,{p:[0,-FA+.02,.006],cast:false,receive:false});
   const hand=grp(el,[0,-FA,.008]);
   // 손: 손바닥(납작한 공) + 모은 손가락 네 개 + 엄지. 손가락질할 때는 검지만 펴진다
   mk(sphere,skin,hand,{p:[0,-.008,0],s:[.028,.03,.016],cast:false,receive:false});
   for(let i=0;i<4;i++){const x=(i-1.5)*.012;mk(capsuleGeo(.0062,.028,8),skin,hand,{p:[x,-.045,.004],r:[.35,0,0],cast:false,receive:false});}
   mk(capsuleGeo(.007,.024,8),skin,hand,{p:[-side*.026,-.018,.006],r:[0,0,side*.9],cast:false,receive:false});
   const finger=mk(capsuleGeo(.0068,.05,8),skin,hand,{p:[-.018,-.058,.008],r:[.2,0,0],cast:false,receive:false});finger.visible=false;
   return {sh,el,hand,finger,ua,fa,z:0,ez:0,x:0,ex:0};
  }
  const arms={L:makeArm(-1),R:makeArm(1)};
  const trousers=STD(coats[i],{roughness:.9});trousers.color.multiplyScalar(.65);
  mk(sphere,trousers,body,{p:[0,.16,0],s:[.082,.054,.059],cast:false,receive:false});
  function makeLeg(side){
   const hip=grp(body,[side*.047,.15,0],side<0?'legL':'legR');
   mk(thighGeo,trousers,hip,{p:[0,-THIGH/2,0],cast:false,receive:false});
   const knee=grp(hip,[0,-THIGH,0],'knee');
   mk(sphere,trousers,knee,{s:[.033,.035,.033],cast:false,receive:false});
   mk(shinGeo,trousers,knee,{p:[0,-SHIN/2,0],cast:false,receive:false});
   const ankle=grp(knee,[0,-SHIN,0],'ankle');
   mk(shoeGeo,sole,ankle,{p:[0,-.012,.025],s:[.038,.025,.069],cast:false,receive:false});
   return {hip,knee,ankle};
  }
  const legs={L:makeLeg(-1),R:makeLeg(1)};

  // 운세 종이(내 종이와 같은 사주도사 풀이 종이): 가슴 앞에 두 손으로 쥐고 있다가, 들어 올리거나 머리 위로 올린다
  const paper=grp(body,[0,.31,.108],'fate-paper');
  const cert=CERTS[i];
  mk(new THREE.BoxGeometry(.148,.194,.009),STD('#d9d4c8',{roughness:.88}),paper,{cast:false,receive:false});
  mk(new THREE.PlaneGeometry(.142,.188),new THREE.MeshBasicMaterial({map:certTex(cert),side:THREE.DoubleSide,toneMapped:false}),paper,{p:[0,0,.0055],cast:false,receive:false});
  // 「운명 확정」 도장: 내 종이처럼 오른쪽 위
  const stamp=mk(new THREE.PlaneGeometry(.042,.042),stampMat,paper,{p:[.0422,.0666,.0085],cast:false,receive:false});
  const ink=mk(ringGeo,inkMat.clone(),paper,{p:[.0422,.0666,.009],s:.025,cast:false,receive:false});ink.visible=false;
  return {i,s,cert,root:person,body,head,face,arms,legs,paper,stamp,ink,mood:'normal',
   x:0,y:.015,z:0,ry:0,rx:0,rz:0,py:.31,px:0,pz:.108,prx:0,bob:0,run:0,
   goal:{x:0,z:0,ry:0,y:.015,rx:0,rz:0,py:.31,px:0,pz:.108,prx:0,mood:'normal',arms:'down',speed:9,kneel:false},kneelF:0,
   stampT:-1,shakeT:-1,hidden:false};
 }
 const people=[];for(let i=0;i<6;i++)people.push(makePerson(root,i));
 // 1인칭 손 장면 안의 두 사람(0·1번과 같은 사람)
 const grabbers=[makePerson(vmRoot,0,{s:1.12}),makePerson(vmRoot,1,{s:1.12})];

 /* ---- 자세 ---- */
 const adamp=(a,b,l,dt)=>a+wrapPi(b-a)*(1-Math.exp(-l*dt));
 function mood(p,m){p.goal.mood=m;if(p.mood!==m){p.mood=m;p.face.material=expression(p.i,m);}}
 /* 팔 자세: [벌림, 앞으로 듦, 팔꿈치 굽힘(앞으로)] — 왼팔·오른팔 같은 값(좌우는 아래에서 뒤집는다).
  * 벌림: 몸 바깥쪽으로(라디안), 앞으로 듦: 앞(+z)으로, 팔꿈치: 아래팔이 앞으로 접힌다.
  * hold는 운세 종이를 가슴 앞에서 두 손으로, up·cheer·pray는 머리 위로 든 운세 종이를 두 손으로 쥔다(손은 IK로 종이 가장자리에 붙인다). */
 const ARMS={
  down:[.14,.06,.2],
  run:[.22,.45,1.25],
  hold:[.2,.35,1.25],
  up:[2.9,.15,.2],
  pray:[2.75,.35,.55],
  cheer:[2.7,.3,.35],
  spread:[1.05,.35,.75], // 막아서기: 팔을 양옆으로 벌리되 팔꿈치는 굽혀 손바닥을 앞으로 내민다(일자로 뻗으면 허수아비 같았다)
  point:[.5,1.62,.04],   // 손가락질: 팔을 얼굴 옆으로 비켜 들어 나를 가리킨다(정면으로 뻗으면 손이 제 입을 가린 것처럼 보였다)
 };
 // 운세 종이를 쥐는 손: both(두 손, 가장자리) / R(오른손만, 왼쪽 아래 모서리) / L(왼손만)
 const GRIP={hold:'both',up:'both',pray:'both',cheer:'both',spread:'R',point:'L'};
 function armPose(p,key,v,dt,l=11){const a=p.arms[key],s=key==='L'?-1:1;
  a.z=adamp(a.z,v[0],l,dt);a.x=adamp(a.x,v[1],l,dt);a.ez=adamp(a.ez,v[2],l,dt);
  a.sh.rotation.set(-a.x,0,s*a.z);a.el.rotation.set(-a.ez,0,0);}

 const state={mode:'hidden',at:0,ev:[],nextSob:0,watching:false,cryUntil:0,nextTear:0};
 // Fixed pool: cheek streams and comic sprays share one draw call, including on slow devices.
 const TEAR_COUNT=96,tearDrops=Array.from({length:TEAR_COUNT},()=>({p:V3(),v:V3(),life:0}));
 const tearMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),new THREE.MeshBasicMaterial({color:col('#b4eeff'),toneMapped:false}),TEAR_COUNT+12);
 tearMesh.frustumCulled=false;tearMesh.visible=false;scene.add(tearMesh);
 const tearDummy=new THREE.Object3D(),tearOrigin=V3(),tearDirection=V3();let tearCursor=0;
 function tearBurst(p,power){
  p.head.updateWorldMatrix(true,false);
  for(const side of [-1,1])for(let j=0;j<2;j++){
   const d=tearDrops[tearCursor++%TEAR_COUNT];
   d.p.set(side*.032,.008,.067).applyMatrix4(p.head.matrixWorld);
   d.v.set(side*rnd(.45,.95),rnd(.45,1.1),rnd(.25,.7)).transformDirection(p.head.matrixWorld).multiplyScalar(.7+power*.35);
   d.life=rnd(.45,.75);
  }
 }
 function witnessHit(power=1){
  if(!state.watching||rev.on||G.ended||G.inputLocked)return;
  state.cryUntil=G.time+2.4;
  for(const p of people){if(!p.root.visible)continue;p.shakeT=G.time;tearBurst(p,Math.min(power,2));}
  if(G.time>=state.nextSob){AUDIO.crowdSob(.32);state.nextSob=G.time+rnd(1.8,2.4);}
 }
 function updateTears(dt,now){
  const crying=state.watching&&!rev.on&&!G.ended&&!G.inputLocked&&now<state.cryUntil;
  if(crying&&now>=state.nextTear){state.nextTear=now+.13;for(const p of people)if(p.root.visible)tearBurst(p,.35);}
  let count=0;
  const put=(pos,scale,dir)=>{tearDummy.position.copy(pos);tearDummy.scale.copy(scale);tearDummy.quaternion.identity();if(dir.lengthSq()>0)tearDummy.quaternion.setFromUnitVectors(UP,tearDirection.copy(dir).normalize());tearDummy.updateMatrix();tearMesh.setMatrixAt(count++,tearDummy.matrix);};
  for(const d of tearDrops){d.life=Math.max(0,d.life-dt);if(!d.life)continue;d.v.y-=dt*2.5;d.p.addScaledVector(d.v,dt);put(d.p,tearOrigin.set(.012,.024,.012).multiplyScalar(Math.min(1,d.life*8)),d.v);}
  if(crying)for(const p of people){if(!p.root.visible)continue;p.head.updateWorldMatrix(true,false);for(const side of [-1,1]){
   tearOrigin.set(side*.032,-.027,.067).applyMatrix4(p.head.matrixWorld);
   tearDummy.position.copy(tearOrigin);tearDummy.quaternion.copy(p.head.getWorldQuaternion(tearDummy.quaternion));tearDummy.scale.set(.009,.044,.006).multiplyScalar(p.root.scale.x);tearDummy.updateMatrix();tearMesh.setMatrixAt(count++,tearDummy.matrix);
  }}
  tearMesh.count=count;tearMesh.visible=root.visible&&count>0&&!rev.on&&!G.ended;tearMesh.instanceMatrix.needsUpdate=true;
 }
 function setMode(m,at){state.mode=m;state.at=at||G.time;}
 function sched(t,fn){state.ev.push({t:state.at+t,fn,done:false});}
 function later(t,fn){state.ev.push({t:G.time+t,fn,done:false});}
 // 말: 장면 대사 목록을 시각대로 건다(팔 붙잡기는 1인칭 손 장면 안의 두 사람이 말한다)
 function talkLines(list,vm,off=0){for(const [i,text,t] of list)sched(t+off,()=>BUB.say({obj:(vm?grabbers:people)[i].head,off:V3(0,.1,0),cam:vm?'vm':'main'},text,0,{voice:VOICE.crowd[i],stable:true}));}
 function runEvents(){for(const e of state.ev)if(!e.done&&G.time>=e.t){e.done=true;e.fn();}}
 function clearEvents(){state.ev.length=0;}
 const faceDir=(p,tx,tz)=>Math.atan2(tx-p.goal.x,tz-p.goal.z);

 // 서 있는 자리들
 const SIDES=[[-1.05,.3],[1.05,.3],[-1.18,.62],[1.18,.62],[-1.3,.95],[1.3,.95]];
 // 되살림 때 꿇는 자리: 설계자 양옆에 세 명씩 두 무리로(가운데를 비워, 든 손과 거기 모이는 불씨가 사람들·말풍선에 가려지지 않게)
 const KNEEL=[[-.74,1.2],[.74,1.2],[-.94,.5],[.94,.5],[-1,.87],[1,.87]];
 const WALLX=[-.8,-.27,.27,.8];

 function goTo(p,x,z,o={}){const g=p.goal;g.x=x;g.z=z;g.speed=o.speed||9;if(o.ry!=null)g.ry=o.ry;if(o.face)g.ry=faceDir(p,o.face[0],o.face[1]);p.run=1;}
 function stance(p,k){const g=p.goal;
  g.kneel=k==='kneel'||k==='bow'||k==='pray'||k==='kneelUp'||k==='inspect';// 무릎 꿇기: 몸 높이는 update()가 무릎이 바닥에 닿게 맞춘다
  if(k==='stand'){g.y=.015;g.rx=0;g.py=.31;g.px=0;g.pz=.108;g.prx=0;g.arms='hold';}
  else if(k==='kneel'){g.y=-.13;g.rx=.42;g.py=.3;g.px=0;g.pz=.1;g.prx=-.2;g.arms='hold';}
  else if(k==='bow'){g.y=-.15;g.rx=.95;g.py=.28;g.px=0;g.pz=.12;g.prx=-.5;g.arms='hold';}
  else if(k==='pray'){g.y=-.12;g.rx=.18;g.py=.7;g.px=0;g.pz=.07;g.prx=-.1;g.arms='pray';}
  else if(k==='kneelUp'){g.y=-.1;g.rx=.08;g.py=.68;g.px=0;g.pz=.16;g.prx=-.25;g.arms='up';}
  else if(k==='inspect'){g.y=-.1;g.rx=.05;g.py=.39;g.px=0;g.pz=.15;g.prx=-.22;g.arms='hold';}
  else if(k==='cheer'){g.y=.015;g.rx=-.08;g.py=.69;g.px=0;g.pz=.17;g.prx=-.25;g.arms='cheer';}
  else if(k==='block'){g.y=.015;g.rx=.05;g.py=.64;g.px=.14;g.pz=.14;g.prx=-.3;g.arms='spread';}
  else if(k==='point'){g.y=.015;g.rx=.12;g.py=.44;g.px=-.16;g.pz=.13;g.prx=-.1;g.arms='point';}
 }
 function showAll(){root.visible=true;for(const p of people){p.root.visible=true;p.hidden=false;}}

 /* ---- 15%: 내 팔 붙잡기(1인칭 손 장면) ---- */
 const grab={on:false,t0:0,w:0,off:0,shaken:false};
 const TAN=Math.tan(THREE.MathUtils.degToRad(30));
 const vat=(nx,ny,d,out)=>out.set(nx*TAN*vmCam.aspect*d,ny*TAN*d,-d);
 const gv1=V3(),gv2=V3(),gv3=V3(),gv4=V3(),gv5=V3(),gq=new THREE.Quaternion();
 function grabStart(at){
  grab.on=true;grab.t0=at;grab.w=0;grab.off=0;grab.shaken=false;vmRoot.visible=true;
  for(const gp of grabbers){gp.root.visible=true;mood(gp,'plead');}
  setMode('grab',at);clearEvents();
  talkLines(LINES.grab,true);
  // 두 마디가 다 찍히고 읽을 틈을 둔 뒤 뿌리친다
  sched(2.9,()=>{grab.shaken=true;VM.shakeOff();AUDIO.whoosh(.9,'hook');for(const gp of grabbers)mood(gp,'wail');BUB.cutFrom(grabbers.map(gp=>gp.root));});
  // 뿌리쳐진 둘은 무대 양옆에 서서 설계자를 지켜본다
  sched(3.3,()=>{showAll();for(const i of [0,1]){const p=people[i];p.goal.x=SIDES[i][0]+(i?1:-1)*.9;p.goal.z=SIDES[i][1]+.4;p.x=p.goal.x;p.z=p.goal.z;goTo(p,SIDES[i][0],SIDES[i][1],{face:[0,0],speed:6});stance(p,'stand');mood(p,'warn');}
   for(let i=2;i<6;i++)people[i].root.visible=false;});
 }
 function grabUpdate(dt){
  if(!grab.on)return;
  const t=G.time-grab.t0;
  if(grab.shaken){grab.w=damp(grab.w,0,7,dt);grab.off=damp(grab.off,1,5,dt);if(grab.off>.985){grab.on=false;vmRoot.visible=false;for(const gp of grabbers)gp.root.visible=false;VM.setGrab('L',0);VM.setGrab('R',0);return;}}
  else grab.w=damp(grab.w,1,10,dt);
  const w=grab.w;
  VM.setGrab('L',w);VM.setGrab('R',w);
  const trem=Math.sin(G.time*23)*.012*w,trem2=Math.cos(G.time*19)*.01*w;
  for(let i=0;i<2;i++){const gp=grabbers[i],s=i?1:-1,k=i?'R':'L';
   // 머리 자리(화면 좌표): 들어올 때는 화면 아래 바깥에서 미끄러져 들어오고, 뿌리쳐지면 바깥 아래로 튕겨 나간다.
   // 둘은 화면 아래 양쪽에서 내 주먹 바깥쪽에 매달려 올려다본다(얼굴이 맞붙지도, 화면 밖으로 잘리지도 않게)
   const slide=backOut(sat((t-i*.08)/.55),1.2),GL=grabLayout();
   const nx=s*(lerp(1.5,GL.hx,slide)+grab.off*1.1),ny=lerp(-1.25,GL.hy,slide)-grab.off*.9;
   vat(nx+trem2*s,ny+trem,GL.hd,gv1);
   // 발을 축으로 몸을 돌리면 머리가 가운데로 쏠리므로, 돌린 뒤 머리가 제자리에 오게 몸 자리를 정한다
   gp.root.scale.setScalar(GL.sc);
   gp.root.rotation.set(GL.lean+grab.off*.9,-s*GL.turn,s*(.08-grab.off*.5));
   gv5.set(0,(.548+.015+LEG_LIFT)*GL.sc,0).applyEuler(gp.root.rotation);
   gp.root.position.copy(gv1).sub(gv5);
   // 안쪽 손으로 내 팔을 붙잡고, 바깥 손에는 자기 운세 종이를 쥔다.
   VM.handPos(k,gv2);VM.anchorPos(k,gv3);
   gp.paper.visible=true;gp.paper.position.set(s*.08,.30,.14);gp.paper.rotation.set(-.15,0,s*.08);
   gp.root.updateWorldMatrix(true,true);
   const gripping=i?'L':'R';
   for(const ak of ['L','R']){
    const a=gp.arms[ak],handSide=ak==='L'?-1:1;
    if(ak===gripping){
     gv4.copy(gv2).lerp(gv3,GL.g0);gv4.x+=s*GL.gx;gv4.y+=GL.gy;gv4.z+=GL.gz;
    }else gv4.set(handSide*.055,-.065,.006).applyMatrix4(gp.paper.matrixWorld);
    placeArmIK(gp,a,gv4,handSide);
   }
   gp.head.rotation.set(GL.look,-s*.22,s*.06);gp.arms.L.finger.visible=gp.arms.R.finger.visible=false;
  }
 }
 const iv1=V3(),iv2=V3(),iv3=V3(),iv4=V3(),iq=new THREE.Quaternion(),iq2=new THREE.Quaternion(),DOWN=V3(0,-1,0);
 // 사람 팔을 월드(vm) 좌표의 손 자리로 늘이기: 두 마디 IK
 function placeArmIK(p,a,targetW,s,poleL){
  const S=a.sh.getWorldPosition(iv1);const body=p.body;
  const pole=iv3.copy(S).add((poleL?iv4.set(s*poleL[0],poleL[1],poleL[2]):iv4.set(s*.3,-.3,.05)).applyQuaternion(body.getWorldQuaternion(iq)));
  const sc=p.root.scale.x,L1=UA*sc,L2=FA*sc;
  const E=iv2;solveTwoBone(S,targetW,pole,L1,L2,E);
  // 어깨 → 팔꿈치
  const parentQ=body.getWorldQuaternion(iq).invert();
  const v1=iv4.subVectors(E,S).normalize().applyQuaternion(parentQ);
  a.sh.quaternion.setFromUnitVectors(DOWN,v1);a.sh.updateWorldMatrix(true,false);
  // 팔꿈치 → 손(위팔 좌표)
  const shQ=a.sh.getWorldQuaternion(iq2).invert();
  const v2=iv4.subVectors(targetW,E).normalize().applyQuaternion(shQ);
  a.el.quaternion.setFromUnitVectors(DOWN,v2);
 }
 /* 운세 종이 쥐기: 자세(FK) 위에 손을 종이 가장자리로 끌어다 붙인다(IK). 쥐었다 놓을 때는 부드럽게 넘어간다 */
 const gpv=V3(),gq1=new THREE.Quaternion(),gq2=new THREE.Quaternion(),gq3=new THREE.Quaternion();
 const POLE_CHEST=[.32,-.24,-.06],POLE_HIGH=[.34,.02,.16];
 function gripPaper(p,key,dt){
  const mode=GRIP[key]||null,high=key==='up'||key==='pray'||key==='cheer';
  for(const k of ['L','R']){
   const a=p.arms[k],want=mode==='both'||mode===k?1:0;
   a.ikw=damp(a.ikw==null?want:a.ikw,want,10,dt);
   if(a.ikw<.01)continue;
   const s=k==='L'?-1:1;
   p.paper.updateWorldMatrix(true,false);
   if(mode==='both')gpv.set(s*.072,high?-.035:-.03,.006);else gpv.set(k==='R'?.05:-.05,-.088,.004);
   gpv.applyMatrix4(p.paper.matrixWorld);
   gq1.copy(a.sh.quaternion);gq2.copy(a.el.quaternion);
   placeArmIK(p,a,gpv,s,high?POLE_HIGH:POLE_CHEST);
   if(a.ikw<.995){gq3.copy(a.sh.quaternion);a.sh.quaternion.copy(gq1).slerp(gq3,a.ikw);gq3.copy(a.el.quaternion);a.el.quaternion.copy(gq2).slerp(gq3,a.ikw);}
  }
 }

 /* ---- 10%: 앞을 막아서기 ---- */
 function wallStart(at){
  showAll();setMode('wall',at);clearEvents();
  // 넷이 설계자 다리 앞에 한 줄로 서서 막는다(화면을 머리 하나로 꽉 채우지 않게 거리·크기를 둔다)
  for(let i=2;i<6;i++){const p=people[i],k=i-2,s=k<2?-1:1;
   p.goal.x=s*2.4;p.goal.z=.85+k*.06;p.x=p.goal.x;p.z=p.goal.z;p.root.visible=true;p.root.scale.setScalar(1.28);
   goTo(p,WALLX[k]*1.12,.92,{ry:0,speed:7.5});stance(p,'block');mood(p,'warn');}
  // 2번은 한 걸음 나와서 손가락질
  sched(.55,()=>{const p=people[2];p.root.scale.setScalar(1.34);goTo(p,-.16,1.3,{ry:0,speed:7});stance(p,'point');p.arms.R.finger.visible=true;});
  talkLines(LINES.wall);
  // 비켜서기: 양옆으로 갈라져 설계자 쪽을 보고 선다
  sched(3.7,()=>{state.watching=true;for(let i=2;i<6;i++){const p=people[i];p.arms.R.finger.visible=false;p.root.scale.setScalar(1);goTo(p,SIDES[i][0],SIDES[i][1],{face:[0,0],speed:6.5});stance(p,'stand');mood(p,'warn');}});
 }

 /* ---- 5%: 되살리기 ---- */
 const rev={on:false,E:null,gather:false,g0:0,gdur:2.2,arrived:0,sphere:0,impact:false,done:false,light:null,glow:null,core:null,wisps:null,W:[]};
 const N_W=150;
 // 불씨 한 알: 속은 흰빛, 겉은 주황·금빛 테(밝은 무대 위에서도 또렷하게)
 const wispTex=canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,252,235,1)');r.addColorStop(.3,'rgba(255,222,120,1)');r.addColorStop(.58,'rgba(255,150,40,.95)');r.addColorStop(.8,'rgba(230,90,20,.5)');r.addColorStop(1,'rgba(230,90,20,0)');g.fillStyle=r;g.fillRect(0,0,w,h);},{srgb:false});
 const glowTex=canvasTex(256,256,(g,w,h)=>{const r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,245,1)');r.addColorStop(.26,'rgba(255,236,160,1)');r.addColorStop(.5,'rgba(255,186,60,.8)');r.addColorStop(.74,'rgba(255,140,40,.35)');r.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=r;g.fillRect(0,0,w,h);},{srgb:false});
 (function buildRev(){
  const pos=new Float32Array(N_W*3),colr=new Float32Array(N_W*3);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(colr,3));
  const mat=new THREE.PointsMaterial({map:wispTex,size:.11,sizeAttenuation:true,transparent:true,depthWrite:false,vertexColors:true,toneMapped:false});
  const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.visible=false;pts.renderOrder=20;scene.add(pts);rev.wisps=pts;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,opacity:1}));sp.visible=false;sp.renderOrder=21;scene.add(sp);rev.glow=sp;
  const core=mk(sphereGeo(20),new THREE.MeshBasicMaterial({color:col('#ffb23c'),toneMapped:false}),scene,{cast:false,receive:false});core.visible=false;core.renderOrder=22;rev.core=core;
  mk(sphereGeo(16),new THREE.MeshBasicMaterial({color:col('#fffbe6'),toneMapped:false}),core,{s:.62,cast:false,receive:false});
  const light=new THREE.PointLight(col('#ffd27a'),0,4,2);scene.add(light);rev.light=light;
  for(let i=0;i<N_W;i++)rev.W.push({o:V3(),c:V3(),t0:0,dur:1,done:false});
  for(let i=0;i<N_W;i++){pos[i*3+1]=-50;}
 })();
 const wv1=V3(),wv2=V3(),wv3=V3();
 function reviveStart(at,E){
  rev.on=true;rev.E=E;rev.gather=false;rev.arrived=0;rev.sphere=0;rev.impact=false;rev.done=false;
  showAll();setMode('revive',at);clearEvents();
  // 쓰러지는 동안은 제자리에서 지켜본다. 바닥에 닿을 때(1.8초) 놀라고, 완전히 쓰러진 뒤(REV_SHIFT) 여섯이 뛰어와 앞에 꿇는다(가까운 사람부터)
  for(let i=0;i<6;i++){const p=people[i];
   if(!p.root.visible||p.hidden){p.goal.x=SIDES[i][0]*1.6;p.goal.z=SIDES[i][1]+.5;p.x=p.goal.x;p.z=p.goal.z;p.root.visible=true;p.hidden=false;}
   sched(1.8+i*.05,()=>{stance(p,'stand');mood(p,'wail');});
   const d=i*.09;sched(REV_SHIFT+.12+d,()=>{goTo(p,KNEEL[i][0],KNEEL[i][1],{face:[0,-.1],speed:7.5});stance(p,'stand');mood(p,'wail');});
   sched(REV_SHIFT+1.05+d*1.4,()=>{stance(p,i<2?'bow':'kneel');});
  }
  talkLines(LINES.wail,false,REV_SHIFT);
  sched(REV_SHIFT+1.0,()=>{state.nextSob=G.time;});
  // 손을 모아 소원을 올린다
  sched(REV_SHIFT+3.0,()=>{for(const p of people){stance(p,'pray');mood(p,'pray');}});
  // 소원 대사는 설계자가 든 손 반대쪽 무리에서 한다(말풍선이 손바닥 위 불씨를 가리지 않게). 왼쪽 무리 0·2·4, 오른쪽 무리 1·3·5
  for(const [i,text,t] of LINES.pray)sched(t+REV_SHIFT,()=>{const handLeft=!!(rev.E&&rev.E.reviveArm==='L');const who=handLeft?(i===2?3:5):(i===2?2:4);BUB.say({obj:people[who].head,off:V3(0,.1,0),cam:'main'},text,0,{voice:VOICE.crowd[who],stable:true});});
 }
 // 불씨 출발점: 꿇은 사람들의 모은 손(절반), 나머지는 기둥 너머·천장·화면 밖에서
 function wispOrigin(i,out){
  if(i%2===0){const p=people[(i>>1)%6];p.head.updateWorldMatrix(true,false);out.copy(wv2.set(0,.19,.02)).applyMatrix4(p.head.matrixWorld);out.x+=rnd(-.04,.04);out.z+=rnd(-.03,.03);return out;}
  const k=i%7;
  if(k===1)return out.set(rnd(1.9,3.2)*(Math.random()<.5?-1:1),rnd(.2,2.4),rnd(-2.2,1.6));      // 기둥 너머·벽 옆
  if(k===3)return out.set(rnd(-2.6,2.6),rnd(3.2,4.4),rnd(-2.4,1.2));                          // 천장
  if(k===5)return out.set(rnd(-2.8,2.8),rnd(.3,2.2),rnd(3.4,5.2));                            // 카메라 뒤(화면 밖)
  return out.set(rnd(-3.4,3.4),rnd(.4,3),-2.9);                                               // 뒷벽 창살
 }
 function gatherStart(dur){
  rev.gather=true;rev.g0=G.time;rev.gdur=dur;rev.arrived=0;rev.sphere=0;
  const pts=rev.wisps,pos=pts.geometry.attributes.position.array,c=pts.geometry.attributes.color.array;
  // 곡선의 가운데 점은 매 프레임 손 자리에 맞춰 다시 잡는다(여기선 흔들림 값만 정해 둔다): 손이 올라가는 동안에도 불씨가 손을 따라간다
  for(let i=0;i<N_W;i++){const w=rev.W[i];wispOrigin(i,w.o);w.cx=rnd(-.2,.2);w.cy=rnd(0,.35);w.cz=rnd(-.15,.15);w.t0=G.time+(i%2===0?rnd(0,dur*.6):rnd(0,dur*.75));w.dur=i%2===0?rnd(.9,1.4):rnd(1.1,1.9);w.done=false;
   pos[i*3]=w.o.x;pos[i*3+1]=-50;pos[i*3+2]=w.o.z;const warm=rnd(.7,1);c[i*3]=1;c[i*3+1]=.72*warm+.2;c[i*3+2]=.3*warm;}
  pts.geometry.attributes.color.needsUpdate=true;pts.visible=true;
  rev.glow.visible=true;rev.core.visible=true;rev.light.intensity=0;
  AUDIO.charge(dur+.9,1);
 }
 // 불씨가 모이는 자리: 설계자가 든 손바닥 바로 위(손이 없으면 가슴)
 function handTarget(out){
  const E=rev.E||G.E;if(!E)return out.set(0,1,0);
  const side=E.reviveArm||'R';const a=E.arms[side==='L'?0:1];
  if(a&&E.armUsable(side)&&E.revive&&E.revive.k>.2){a.wr.updateWorldMatrix(true,false);return out.set(0,-.075,.02).applyMatrix4(a.wr.matrixWorld).add(wv2.set(0,.055,0));}
  E.bones.chest.updateWorldMatrix(true,false);return E.bones.chest.getWorldPosition(out).add(wv2.set(0,.05,.16));
 }
 function impact(){
  rev.impact=true;rev.gather=false;
  const pts=rev.wisps,pos=pts.geometry.attributes.position.array;for(let i=0;i<N_W;i++)pos[i*3+1]=-50;pts.geometry.attributes.position.needsUpdate=true;pts.visible=false;
  rev.sphere=1;
  for(const p of people){p.shakeT=G.time;mood(p,'pray');}
 }
 function restamp(){
  for(let i=0;i<6;i++){
   const p=people[i];
   later(i*.05,()=>{
    p.certCheckAt=G.time;p.stamp.visible=false;stance(p,'inspect');mood(p,'concern');
    goTo(p,p.x,p.z,{face:[CAM.pos.x-root.position.x,CAM.pos.z-root.position.z],speed:6});
   });
   later(.32+i*.05,()=>{p.stamp.visible=true;p.stampT=G.time;AUDIO.stamp(1);});
   later(.59+i*.05,()=>mood(p,'relieved'));
  }
 }
 function cheer(){
  for(let i=0;i<6;i++){const p=people[i];stance(p,'cheer');mood(p,'cheer');p.goal.y=.015;}
  for(const [i,text,t] of LINES.cheer)later(t,()=>BUB.say({obj:people[i].head,off:V3(0,.1,0),cam:'main'},text,0,{voice:VOICE.crowd[i],stable:true}));
 }
 function sides(){
  for(let i=0;i<6;i++){const p=people[i];goTo(p,SIDES[i][0],SIDES[i][1],{face:[0,0],speed:5.5});stance(p,'cheer');mood(p,'cheer');}
  later(1.6,()=>{for(const p of people){stance(p,'stand');mood(p,'normal');}});
  later(2.2,()=>{rev.on=false;rev.glow.visible=false;rev.core.visible=false;rev.light.intensity=0;});
 }
 function reviveUpdate(dt){
  if(!rev.on)return;
  const E=rev.E;
  if(rev.gather){
   const pts=rev.wisps,pos=pts.geometry.attributes.position.array;const T=handTarget(wv3);let arrived=0;
   for(let i=0;i<N_W;i++){const w=rev.W[i];
    if(w.done){arrived++;continue;}
    const u=(G.time-w.t0)/w.dur;
    if(u<0){pos[i*3+1]=-50;continue;}
    if(u>=1){w.done=true;arrived++;pos[i*3+1]=-50;if(arrived%6===0)AUDIO.twinkle(.7);continue;}
    const e=easeIn(u)*.55+u*.45;
    // 가운데 점: 손 바로 위 허공(머리보다 높게)에서 손으로 내리꽂힌다 — 얼굴을 가로질러 날아들지 않게(손이 움직여도 늘 지금 손 자리를 향한다)
    const cx=T.x+(w.o.x-T.x)*.35+w.cx,cy=Math.max(T.y,w.o.y)+.3+w.cy,cz=T.z+(w.o.z-T.z)*.35+w.cz;
    const a=1-e;wv1.set(a*a*w.o.x+2*a*e*cx+e*e*T.x,a*a*w.o.y+2*a*e*cy+e*e*T.y,a*a*w.o.z+2*a*e*cz+e*e*T.z);
    wv1.y+=Math.sin(G.time*9+i)*.012*(1-e);
    pos[i*3]=wv1.x;pos[i*3+1]=wv1.y;pos[i*3+2]=wv1.z;}
   rev.arrived=arrived;pts.geometry.attributes.position.needsUpdate=true;
   rev.sphere=damp(rev.sphere,arrived/N_W,6,dt);
  }
  // 손바닥 위 구체와 빛(손이 보이게, 머리만 하게 커지지 않는다)
  if(rev.glow.visible){
   const T=handTarget(wv3);const s=rev.sphere;
   rev.glow.position.copy(T);rev.core.position.copy(T);rev.light.position.copy(T);
   const pul=1+Math.sin(G.time*14)*.06*s;
   rev.glow.scale.setScalar((.1+.62*s)*pul);rev.core.scale.setScalar((.014+.085*s)*pul);rev.light.intensity=3.2*s;
   if(rev.impact){ // 터진 뒤: 커지며 사라진다
    rev.glow.scale.setScalar(rev.glow.scale.x+dt*9);rev.glow.material.opacity=Math.max(0,rev.glow.material.opacity-dt*1.6);rev.core.visible=false;rev.light.intensity=Math.max(0,rev.light.intensity-dt*3);
   }else rev.glow.material.opacity=1;
  }
 }

 /* ---- 매 프레임 ---- */
 function update(dt,now){
  runEvents();
  grabUpdate(dt);
  if(!root.visible)return;
  for(const p of people){
   if(!p.root.visible)continue;
   const g=p.goal;
   // 달리기: 목표까지 가는 동안 통통 튀고 앞으로 기운다
   const dx=g.x-p.x,dz=g.z-p.z,dist=Math.hypot(dx,dz);
   const running=dist>.03;
   p.run=damp(p.run,running?1:0,10,dt);
   if(running){const sp=Math.min(dist,g.speed*dt*.33);p.x+=dx/dist*sp;p.z+=dz/dist*sp;p.ry=adamp(p.ry,Math.atan2(dx,dz),12,dt);p.bob+=dt*13;}
   else{p.ry=adamp(p.ry,g.ry,8,dt);}
   const bob=Math.abs(Math.sin(p.bob))*.03*p.run;
   const shake=p.shakeT>=0?Math.max(0,1-(now-p.shakeT)/.6):0;
   // 무릎 꿇기: 허벅지는 거의 수직으로 세우고 정강이는 뒤로 눕혀 바닥에 댄다. 몸 높이는 무릎 밑이 바닥에 닿게 맞춘다
   const kneel=p.kneelF=damp(p.kneelF||0,g.kneel&&p.run<.5?1:0,8,dt);
   const rxNow=g.rx+.28*p.run-.2*shake;
   const yKneel=THIGH*Math.cos(.1)+.035-.15*Math.cos(rxNow)-LEG_LIFT;
   const ty=lerp(g.y,yKneel,kneel)+bob+(shake?Math.sin(now*28)*.012*shake:0);
   p.y=damp(p.y,ty,12,dt);p.rx=adamp(p.rx,rxNow,9,dt);p.rz=adamp(p.rz,g.rz+(shake?Math.sin(now*31+p.i)*.06*shake:0),9,dt);
   p.py=damp(p.py,g.py,11,dt);p.px=damp(p.px,g.px,11,dt);p.pz=damp(p.pz,g.pz,11,dt);p.prx=adamp(p.prx,g.prx,10,dt);
   p.root.position.set(p.x,0,p.z);p.root.rotation.y=p.ry;p.body.position.y=p.y+LEG_LIFT;p.body.rotation.set(p.rx,0,p.rz);
   // 다리: 서면 곧게, 달리면 번갈아 내딛고, 꿇으면 무릎을 접어 정강이를 뒤로 눕힌다(발등이 바닥을 향한다)
   for(const [key,sign] of [['L',1],['R',-1]]){
    const leg=p.legs[key],stride=Math.sin(p.bob+sign*PI/2)*.65*p.run;
    let hipX=-p.rx+stride,kneeX=Math.max(0,-stride)*1.2,ankX=-p.rx-hipX-kneeX;
    if(kneel>0){hipX=lerp(hipX,-p.rx-.1+sign*.03,kneel);kneeX=lerp(kneeX,1.72,kneel);ankX=lerp(ankX,PI/2-.2,kneel);}
    leg.hip.rotation.x=hipX;leg.knee.rotation.x=kneeX;leg.ankle.rotation.x=ankX;
   }
   p.paper.position.set(p.px,p.py,p.pz);p.paper.rotation.x=p.prx;
   const akey=p.run>.5&&!GRIP[g.arms]?'run':g.arms,A=ARMS[akey]||ARMS.down;
   armPose(p,'L',A,dt);armPose(p,'R',A,dt);
   gripPaper(p,akey,dt);
   mood(p,g.mood||p.mood);
   if(state.watching&&!rev.on&&!G.ended&&!G.inputLocked)mood(p,now<state.cryUntil?'wail':'warn');
   const cry=p.mood==='wail'||p.mood==='pray';
   const checking=p.certCheckAt>=0&&g.arms==='hold'&&rev.on;
   const pitch=checking?(p.mood==='relieved'?.18:.48):g.arms==='pray'?-.35:cry?-.1:0;
   p.head.rotation.x=damp(p.head.rotation.x,pitch,9,dt);p.head.rotation.y=0;p.head.rotation.z=cry?Math.sin(now*11+p.i)*.07:0;
   // 도장 찍기: 크게 떠 있다가 쾅 내려앉고 인주가 번진다
   if(p.stampT>=0){const u=(now-p.stampT)/.2;if(u<1){const e=easeIn3(u);p.stamp.scale.setScalar(lerp(2.4,1,e));p.stamp.position.z=.0085+lerp(.05,0,e);p.stamp.material=stampMat;}
    else{p.stamp.scale.setScalar(1);p.stamp.position.z=.0085;const v=(now-p.stampT-.2)/.4;if(v<1){p.ink.visible=true;p.ink.scale.setScalar(.022+v*.05);p.ink.material.opacity=.6*(1-v);}else{p.ink.visible=false;p.stampT=-1;}}}
  }
  if(state.mode==='revive'&&!rev.impact&&now>=state.nextSob&&people.some(p=>p.mood==='wail'||p.mood==='pray')){AUDIO.crowdSob(.4);state.nextSob=now+rnd(1.8,2.4);}
  updateTears(dt,now);reviveUpdate(dt);
 }
 function hide(){setMode('retreat');for(const p of people){const s=p.x<0?-1:1;goTo(p,p.x+s*1.2,p.z+.3,{ry:p.ry,speed:6});}sched(.9,()=>{root.visible=false;for(const p of people)p.hidden=true;state.mode='hidden';});}
 function reset(keepBubble){
  releaseWitnesses();
  state.mode='hidden';state.ev.length=0;state.nextSob=0;state.watching=false;state.cryUntil=0;state.nextTear=0;tearCursor=0;tearMesh.visible=false;tearMesh.count=0;for(const d of tearDrops)d.life=0;root.visible=false;vmRoot.visible=false;
  grab.on=false;grab.w=0;grab.off=0;grab.shaken=false;
  rev.on=false;rev.gather=false;rev.impact=false;if(rev.wisps){rev.wisps.visible=false;rev.glow.visible=false;rev.core.visible=false;rev.light.intensity=0;rev.glow.material.opacity=1;}
  for(const p of [...people,...grabbers]){p.root.visible=false;p.hidden=true;p.root.scale.setScalar(p.s);p.x=p.z=0;p.y=.015;p.ry=p.rx=p.rz=0;p.run=0;p.bob=0;p.stampT=-1;p.shakeT=-1;p.stamp.scale.setScalar(1);p.stamp.position.z=.0085;p.ink.visible=false;
   p.certCheckAt=-1;p.stamp.visible=true;
   Object.assign(p.goal,{x:0,z:0,ry:0,y:.015,rx:0,rz:0,py:.31,px:0,pz:.108,prx:0,mood:'normal',arms:'hold',speed:9,kneel:false});p.kneelF=0;mood(p,'normal');
   for(const k of ['L','R']){const a=p.arms[k],v=ARMS.hold,s=k==='L'?-1:1;a.z=v[0];a.x=v[1];a.ez=v[2];a.sh.rotation.set(-a.x,0,s*a.z);a.el.rotation.set(-a.ez,0,0);a.ikw=1;a.finger.visible=false;}
   for(const leg of Object.values(p.legs)){leg.hip.rotation.set(0,0,0);leg.knee.rotation.set(0,0,0);leg.ankle.rotation.set(0,0,0);}
   p.paper.visible=true;p.paper.position.set(0,.31,.108);p.paper.rotation.set(0,0,0);p.head.rotation.set(0,0,0);p.body.position.y=.015+LEG_LIFT;p.body.rotation.set(0,0,0);p.root.position.set(0,0,0);p.root.rotation.set(0,0,0);}
  BUB.clear(keepBubble);VM.setGrab('L',0);VM.setGrab('R',0);
 }
 // Bake the six familiar followers once; the congregation shares 12 draw calls.
 let congregation=null;
 function congregationView(){
  if(congregation)return congregation;
  congregation=grp(scene,null,'congregation');congregation.visible=false;
  const placements=Array.from({length:6},()=>[]),dummy=new THREE.Object3D();
  for(let row=0;row<10;row++)for(let col=0;col<12;col++){
   const x=(col-5.5)*.61+(row%2?.16:-.13)+Math.sin(row*29+col*17)*.065;
   const z=1.4+row*.62+Math.cos(row*13+col*19)*.09;
   // Keep the player's own standing space, with shoulders immediately to either side.
   if(Math.abs(x)<.46&&z>5.9)continue;
   const shuffle=Math.sin((row+1)*127.1+(col+1)*311.7)*43758.5453;
   // 통로에는 세 쌍의 발화 순서에 맞춰 여섯 얼굴을 둔다(먼 쪽부터).
   const person=(col===5||col===6)&&row<6?[4,5,2,3,0,1][row]:Math.floor((shuffle-Math.floor(shuffle))*6);
   placements[person].push({x,z,scale:1.51+Math.sin(row*11+col*7)*.14,turn:PI+Math.sin(col*3+row)*.14,pi:person});
  }
  const plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
  for(const p of people){
   p.root.visible=true;armPose(p,'L',ARMS.hold,1);armPose(p,'R',ARMS.hold,1);gripPaper(p,'hold',1);
   p.root.updateWorldMatrix(true,true);const inv=new THREE.Matrix4().copy(p.root.matrixWorld).invert();
   // 얼굴도 같이 굽는다: 평소엔 뒤통수만 보이고, 설교를 끊은 나를 돌아볼 때 흘겨보는 얼굴(scorn)이 보인다
   const keepFace=p.face.material,scornFace=expression(p.i,'scorn');p.face.material=scornFace;
   const solid=[],mapped=new Map();
   p.root.traverse(o=>{if(!o.isMesh||!o.visible||o===p.ink||o===p.stamp)return;
    if(o.material.map){const key=o.material.uuid;if(!mapped.has(key))mapped.set(key,[]);mapped.get(key).push(o);}else solid.push(o);
   });
   // Distant backs do not need the close-up capsule tessellation.
   const lod=[];
   for(const mesh of solid){
    const original=mesh.geometry,q=original.parameters;let reduced=null;
    if(original.type==='SphereGeometry'&&original!==headGeo)reduced=new THREE.SphereGeometry(1,8,6);
    else if(original===headGeo){
     reduced=new THREE.SphereGeometry(1,12,9);const points=reduced.attributes.position;
     for(let k=0;k<points.count;k++)points.setXYZ(k,...sculptHead(points.getX(k),points.getY(k),points.getZ(k)));
     reduced.computeVertexNormals();
    }else if(original.type==='LatheGeometry'&&q&&q.points&&q.points.length>12){
     const points=q.points.filter((v,j)=>j===0||j===q.points.length-1||j%3===0);
     reduced=new THREE.LatheGeometry(points,8);
    }
    if(reduced){lod.push([mesh,original,reduced]);mesh.geometry=reduced;}
   }
   const chunks=[[mergeMeshes(solid,inv,m=>m.material.color),plain]];
   for(const [mesh,original,reduced] of lod){mesh.geometry=original;reduced.dispose();}
   for(const list of mapped.values())chunks.push([mergeMeshes(list,inv),list[0].material]);
   p.face.material=keepFace;
   for(const [geo,mat] of chunks){
    const mesh=new THREE.InstancedMesh(geo,mat,placements[p.i].length);mesh.frustumCulled=false;mesh.castShadow=false;mesh.userData.pi=p.i;
    if(mat===scornFace)mesh.renderOrder=1;
    placements[p.i].forEach((v,j)=>{dummy.position.set(v.x,0,v.z);dummy.rotation.set(0,v.turn,0);dummy.scale.setScalar(v.scale);dummy.updateMatrix();mesh.setMatrixAt(j,dummy.matrix);});
    mesh.instanceMatrix.needsUpdate=true;congregation.add(mesh);
   }
   p.root.visible=false;
  }
  congregation.userData.count=placements.reduce((n,a)=>n+a.length,0);
  // 족치러 걸어 나갈 때 사람마다 비켜설 수 있게 자리 목록을 남겨 둔다(SUBMISSION.part)
  for(const list of placements)for(const v of list){v.cx=v.x;v.cy=0;v.tx=v.x;}
  congregation.userData.place=placements;
  return congregation;
 }
 // 세 사람만 실제 관절을 움직인다. 나머지 무리는 합쳐 둔 메시를 쓴다.
 function witness(v){
  const p=people[v.pi];
  // 한 사람은 한 자리에만 선다(앞 자리에 남은 표시를 지운다). 남아 있으면 족치기 무대의 그 사람이 회중 자리로 끌려갔다
  if(p.witness&&p.witness!==v)p.witness.actor=null;
  p.witness=v;v.actor=p;congregation.add(p.root);p.root.visible=true;p.paper.visible=true;
  stance(p,'stand');mood(p,'scorn');
  p.body.position.set(0,.015+LEG_LIFT,0);p.body.rotation.set(0,0,0);
  p.paper.position.set(0,.31,.108);p.paper.rotation.set(0,0,0);
  p.root.position.set(v.cx,v.cy||0,v.z);p.root.scale.setScalar(v.scale);p.root.rotation.set(0,v.yaw??v.turn,0);
  p.head.rotation.set(0,0,0);p.stamp.visible=true;
  return p;
 }
 function releaseWitnesses(){
  for(const p of people)if(p.witness){
   p.witness.actor=null;p.witness=null;root.add(p.root);p.root.visible=false;
   p.root.scale.setScalar(p.s);p.root.position.set(0,0,0);p.root.rotation.set(0,0,0);
   p.head.rotation.set(0,0,0);stance(p,'stand');mood(p,'normal');
  }
 }
 function poseWitness(v){
  const p=v.actor;if(!p)return;
  p.root.position.set(v.cx,v.cy||0,v.z);p.root.rotation.set(0,v.yaw??v.turn,0);
  p.root.scale.setScalar(v.scale);
  const elapsed=G.time-(v.noticeAt??G.time),polite=v.politeAt!=null;
  const glance=!polite&&elapsed<.55?Math.sin(clamp(elapsed/.55,0,1)*PI)*.22:0;
  const targetYaw=polite?clamp(wrapPi(Math.atan2(-v.cx,-.62-v.z)-v.yaw),-.6,.6):0;
  p.head.rotation.set(glance,polite?targetYaw*smooth((G.time-v.politeAt)/.35):0,polite?-.035:0);
  mood(p,polite?'concern':v.look>.2?'scorn':'normal');
  armPose(p,'L',ARMS.hold,1);armPose(p,'R',ARMS.hold,1);gripPaper(p,'hold',1);
 }
 return {root,people,congregationView,witness,releaseWitnesses,poseWitness,reset,update,hide,grabStart,wallStart,witnessHit,reviveStart,gatherStart,impact,restamp,cheer,sides,handTarget,get mode(){return state.mode;},get rev(){return rev;}};
})();

/* 운명을 받아들인 자리: 같은 추종자들 틈, 손에 남은 내 운세. */
const SUBMISSION=(()=>{
 const hands=grp(vmScene,null,'held-fortune');hands.visible=false;
 const paper=grp(hands,[0,0,0],'my-fortune');
 /* 종이 한 장: 앞면(풀이 마지막 화면)과 뒷면(종이색)이 같은 격자를 나눠 쓴다. 앞면은 앞에서만, 뒷면은 뒤에서만 그려서
  * 구겨져 뒤집힌 자리는 종이 뒷면이 보인다. 구길 때는 격자를 움직이고 꼭짓점 색으로 주름 그늘을 칠한다 */
 const SX=22,SY=30,HW=.148,HH=.2;
 const sheetGeo=new THREE.PlaneGeometry(HW*2,HH*2,SX,SY);
 const base=Float32Array.from(sheetGeo.attributes.position.array);
 sheetGeo.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(sheetGeo.attributes.position.count*3).fill(1),3));
 const front=new THREE.MeshBasicMaterial({toneMapped:false,vertexColors:true});
 const stock=new THREE.MeshBasicMaterial({color:0xe9d8aa,toneMapped:false,vertexColors:true,side:THREE.BackSide});
 mk(sheetGeo,front,paper,{cast:false,receive:false});
 mk(sheetGeo,stock,paper,{cast:false,receive:false});
 const skin=STD('#dca380',{roughness:.78}),nail=STD('#e5baa0',{roughness:.65}),sleeve=STD('#263d52',{roughness:.94}),cuff=STD('#203448',{roughness:.96});
 // A continuous wrist/palm silhouette. Local +x is the outside of each hand;
 // +z faces the reader. The sheet stays between the thumb and all four fingers.
 function handLoft(parent,mat,rings){
  const pos=[],idx=[],n=16;
  rings.forEach(([x,y,z,rx,rz])=>{for(let j=0;j<n;j++){const a=j/n*TAU;pos.push(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz);}});
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=a+n,d=b+n;idx.push(a,c,b,b,c,d);}
  for(let j=1;j<n-1;j++){idx.push(0,j,j+1);const a=(rings.length-1)*n;idx.push(a,a+j+1,a+j);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  return mk(geo,mat,parent,{cast:false,receive:false});
 }
 const HANDS=[];
 for(const side of [-1,1]){
  const hand=grp(hands,[side*.148,-.12,0],side<0?'fortune-left-hand':'fortune-right-hand');
  hand.scale.x=side;hand.userData.side=side;HANDS.push(hand);
  handLoft(hand,sleeve,[[.29,-1.02,.16,.074,.061],[.18,-.60,.053,.052,.043],[.105,-.36,-.019,.039,.033],[.071,-.28,-.035,.031,.026],[.052,-.19,-.028,.028,.023],[.035,-.10,-.021,.023,.019],[.031,-.077,-.019,.022,.018]]);
  handLoft(hand,cuff,[[.032,-.086,-.019,.023,.019],[.030,-.074,-.018,.022,.018]]);
  handLoft(hand,skin,[[.031,-.082,-.019,.017,.013],[.027,-.060,-.018,.017,.013],[.020,-.040,-.017,.023,.016],[.018,-.020,-.017,.025,.016],[.017,-.002,-.018,.022,.014],[.014,.010,-.019,.014,.010],[.012,.015,-.019,.003,.003]]);
  // The curled fingertips press on the back, never poke through the front.
  for(let j=0;j<4;j++){
   const y=.005-j*.013,r=.0068-j*.00045;
   mk(taperTube([[.019,y,-.023],[.006,y+.003,-.019],[-.010,y+.003,-.015],[-.016,y-.002,-.012]],r,r*.85,10,8),skin,hand,{cast:false,receive:false});
   mk(sphereGeo(10),skin,hand,{p:[-.016,y-.002,-.012],s:[r*.85,r*.85,.007],cast:false,receive:false});
  }
  // A short, opposed thumb grows out of the palm and lies diagonally on the sheet.
  mk(sphereGeo(16),skin,hand,{p:[.015,-.031,-.001],s:[.016,.021,.016],r:[0,0,-.35],cast:false,receive:false});
  mk(taperTube([[.016,-.034,.002],[.006,-.024,.013],[-.004,-.011,.014],[-.011,.001,.012]],.012,.009,16,12),skin,hand,{cast:false,receive:false});
  mk(sphereGeo(16),skin,hand,{p:[-.011,.001,.012],s:[.009,.011,.009],r:[0,0,.45],cast:false,receive:false});
  mk(sphereGeo(12),nail,hand,{p:[-.0105,.002,.0206],s:[.0053,.007,.0011],r:[0,0,.45],cast:false,receive:false});
  hand.updateMatrixWorld(true);mergeChildren(hand);
 }
 let crowd=null,texture=null,next=0,line=0,lastResult=null,fontWait=false;
 const clean=t=>String(t||'').replace(/\*\*/g,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
 /* 손에 든 종이 = 풀이 화면의 마지막: 이름, 전체 풀이 한 줄, 운명 확정 도장, 판정 안내, 「당신은 그렇게 태어났습니다.」
  * 풀이 화면이 이 종이로 줄어들기 때문에 같은 글꼴(고운바탕·IBM Plex Sans KR)과 같은 빨강을 쓴다 */
 const SERIF='"Gowun Batang","Noto Serif KR",serif',SANS='"IBM Plex Sans KR","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
 function wrapWords(g,text,width){
  const rows=[];let row='';
  for(const word of text.split(' ')){
   const tryRow=row?row+' '+word:word;
   if(g.measureText(tryRow).width<=width){row=tryRow;continue;}
   if(row)rows.push(row);
   if(g.measureText(word).width<=width){row=word;continue;}
   row='';for(const ch of Array.from(word)){if(g.measureText(row+ch).width>width){rows.push(row);row=ch;}else row+=ch;}
  }
  if(row)rows.push(row);return rows;
 }
 function drawSeal(g,cx,cy,size){
  g.save();g.translate(cx,cy);g.rotate(-8*PI/180);const s=size/64;g.scale(s,s);
  const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
  rr(-29,-29,58,58,10);g.fillStyle='#e0402a';g.fill();g.lineWidth=2.6;g.strokeStyle='#261f3d';g.stroke();
  rr(-23.5,-23.5,47,47,6);g.lineWidth=1.8;g.strokeStyle='#fff';g.stroke();
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='alphabetic';g.font='19px "Black Han Sans",'+SANS;
  g.fillText('운',-10,-2);g.fillText('명',10,-2);g.fillText('확',-10,19);g.fillText('정',10,19);
  g.restore();
 }
 function fortune(result){
  if(lastResult!==result)fontWait=false;lastResult=result;
  const P=result&&result.paper||{},r=result&&result.reading||{},name=clean(result&&result.input&&result.input.name);
   const title=name?name+'님의 운세':'나의 운세',verdict=clean(P.verdict||r.verdict),end='당신은 그렇게 태어났습니다.';
  $('#heldFortuneText').textContent=[title,'전체 풀이',verdict,end].filter(Boolean).join('\n');
  if(texture)texture.dispose();
  texture=canvasTex(592,800,(g,w,h)=>{
   const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#fff8de');gr.addColorStop(1,'#ecd9a8');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.strokeStyle='#806338';g.lineWidth=3;g.strokeRect(16,16,w-32,h-32);g.lineWidth=1;g.strokeRect(26,26,w-52,h-52);
   const X=64,W=w-128;
   g.textAlign='left';g.textBaseline='alphabetic';
   g.fillStyle='#2a2235';g.font='700 34px '+SERIF;g.fillText(title,X,98,W-120);
   // 「전체 풀이」 칸 이름과 삼각형 눈
   g.save();g.translate(X+11,134);g.fillStyle='#e0402a';g.strokeStyle='#261f3d';g.lineWidth=2;g.beginPath();g.moveTo(0,-11);g.lineTo(11,8);g.lineTo(-11,8);g.closePath();g.fill();g.stroke();
   g.fillStyle='#fff';g.beginPath();g.ellipse(0,2,4.6,2.6,0,0,TAU);g.fill();g.fillStyle='#261f3d';g.beginPath();g.arc(0,2,1.6,0,TAU);g.fill();g.restore();
   g.fillStyle='#b52a17';g.font='700 23px '+SANS;g.fillText('전체 풀이',X+30,142);
   drawSeal(g,w-112,104,96);
   g.strokeStyle='#c9ac72';g.lineWidth=2;g.setLineDash([9,7]);g.beginPath();g.moveTo(X,176);g.lineTo(X+W,176);g.stroke();g.setLineDash([]);
   // 전체 풀이: 길면 글자를 줄여 끝 문장 위 구분선 안쪽에 들어가게
   let size=37,rows;
   for(;size>=17;size--){g.font='700 '+size+'px '+SERIF;rows=wrapWords(g,verdict,W);if(232+rows.length*size*1.46<=636)break;}
   // 긴 총평도 마지막 검사 크기와 실제 그리는 크기를 같게 유지한다.
   size=Math.max(17,size);g.font='700 '+size+'px '+SERIF;rows=wrapWords(g,verdict,W);
   g.fillStyle='#261f3d';g.font='700 '+size+'px '+SERIF;
   let y=232;rows.forEach(t=>{g.fillText(t,X,y);y+=size*1.46;});
   g.strokeStyle='#a68b56';g.lineWidth=1.5;g.beginPath();g.moveTo(X,676);g.lineTo(X+W,676);g.stroke();
   g.textAlign='center';g.fillStyle='#261f3d';g.font='700 33px '+SERIF;g.fillText(end,w/2,738,W);
  },{srgb:true});
  texture.anisotropy=8;front.map=texture;front.needsUpdate=true;
  // 풀이 화면의 글꼴이 아직 안 받아졌으면 받아지는 대로 다시 그린다
  try{
   const want=['700 34px "Gowun Batang"','700 23px "IBM Plex Sans KR"','19px "Black Han Sans"'];
   if(!fontWait&&document.fonts&&!want.every(f=>document.fonts.check(f))){
    fontWait=true;Promise.all(want.map(f=>document.fonts.load(f))).then(()=>{if(lastResult===result&&texture)fortune(result);},()=>{});
   }
  }catch(_){}
 }

 /* ---- 구기기 ----
  * c=0 반듯한 종이 → c≈.5 주름지며 오그라든 종이 → c=1 손안의 종이 뭉치.
  * 1단계는 겹친 사인 물결로 주름을, 2단계는 종이 위 자리(u,v)를 울퉁불퉁한 공 위 자리로 옮겨 뭉친다 */
 const CR={c:-1,ph:[],drop:null};
 function newPhases(){CR.ph=Array.from({length:10},()=>rnd(0,TAU));}
 newPhases();
 const _ln=V3(.25,.45,.86).normalize();
 function shape(c){
  if(Math.abs(c-CR.c)<.0005)return;CR.c=c;
  const pos=sheetGeo.attributes.position,colr=sheetGeo.attributes.color,ph=CR.ph;
  const k1=smooth(c/.55),m=smoother((c-.28)/.72),R=.052;
  for(let i=0;i<pos.count;i++){
   const x=base[i*3],y=base[i*3+1],u=x/HW,v=y/HH;
   const wv=Math.sin(u*6.3+ph[0])*Math.sin(v*4.9+ph[1])+.55*Math.sin(u*12.7+v*8.3+ph[2])+.35*Math.sin(u*21.1-v*17.9+ph[3])+.22*Math.sin(u*33.4-v*29.2+ph[4]);
   let px=x*(1-.34*k1)+.009*k1*Math.sin(v*9.1+ph[5]),py=y*(1-.3*k1)+.009*k1*Math.sin(u*8.3+ph[6]),pz=.024*k1*wv;
   if(m>0){
    const th=u*PI*.86,phv=v*PI*.46,cp=Math.cos(phv);
    const lump=R*(1+.26*(.6*Math.sin(u*7.3+v*5.1+ph[7])+.4*Math.sin(u*13.1-v*11.7+ph[8])));
    px=lerp(px,Math.sin(th)*cp*lump,m);py=lerp(py,Math.sin(phv)*lump*.94-.006,m);pz=lerp(pz,Math.cos(th)*cp*lump*.92+.01,m);
   }
   pos.setXYZ(i,px,py,pz);
  }
  pos.needsUpdate=true;
  if(c>0){sheetGeo.computeVertexNormals();}
  const nrm=sheetGeo.attributes.normal,sh=smooth(c*1.7);
  for(let i=0;i<pos.count;i++){
   let s=1;
   if(sh>0){const d=Math.abs(nrm.getX(i)*_ln.x+nrm.getY(i)*_ln.y+nrm.getZ(i)*_ln.z);s=lerp(1,clamp(.44+.6*d,.36,1),sh);}
   colr.setXYZ(i,s,s,s*.97);
  }
  colr.needsUpdate=true;sheetGeo.computeBoundingSphere();
  paper.rotation.set(-.22*m,.12*m,.34*m);paper.position.set(0,.03*smooth(c*1.3),0);
 }
 function flatten(){
  CR.c=-1;CR.drop=null;newPhases();shape(0);
  const n=sheetGeo.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,0,0,1);n.needsUpdate=true;
  paper.position.set(0,0,0);paper.rotation.set(0,0,0);paper.visible=true;
  for(const h of HANDS){const s=h.userData.side;h.position.set(s*.148,-.12,0);h.rotation.set(0,0,0);}
 }
 // 다 구긴 종이 뭉치를 놓는다: 아래로 떨어져 화면 밖으로 나가고 두 손은 벌어지며 내려간다
 function drop(){
  if(CR.drop)return;
  startWhispers();
  CR.drop={t:0,v:V3(rnd(-.08,.08),.3,.1),w:V3(rnd(-7,7),rnd(-5,5),rnd(-9,9)),tap:false,
   hx:HANDS.map(h=>h.position.x),hy:HANDS.map(h=>h.position.y),hr:HANDS.map(h=>h.rotation.z)};
 }
 function updateDrop(dt){
  const D=CR.drop;if(!D)return;D.t+=dt;
  if(paper.visible){
   D.v.y-=4.6*dt;paper.position.addScaledVector(D.v,dt);
   paper.rotation.x+=D.w.x*dt;paper.rotation.y+=D.w.y*dt;paper.rotation.z+=D.w.z*dt;
   if(paper.position.y<-.9)paper.visible=false;
  }
  if(!D.tap&&D.t>.5){D.tap=true;AUDIO.paperDrop();}
  const k=easeIn((D.t-.06)/.5);
  HANDS.forEach((h,i)=>{const s=h.userData.side;h.position.x=lerp(D.hx[i],s*.3,k);h.position.y=lerp(D.hy[i],-.62,k);h.rotation.z=lerp(D.hr[i],s*-.25,k);});
  if(D.t>.75)hands.visible=false;
 }
 // 손 자리(화면 크기에 맞춘 크기·위치). 종이 자리를 잴 때도 쓴다
 function layout(){
  const portrait=innerWidth<innerHeight,ratio=innerWidth/innerHeight;
  const height=portrait?.31:.34,sc=Math.min(height*2*Math.tan(PI/6)/.4,ratio*1.15*.68/.4);
  hands.scale.setScalar(sc);hands.position.set(0,-Math.tan(PI/6)*(portrait?.45:.51),-1);
  hands.rotation.set(-.09,0,-.035+Math.sin(G.time*.75)*.006);hands.position.y+=Math.sin(G.time*1.3)*.002;
 }
 // 손에 든 종이가 화면 어디에 있는지(px). 풀이 화면이 정확히 이 자리로 줄어든다
 function rect(){
  const was=hands.visible;layout();hands.updateMatrixWorld(true);vmCam.updateMatrixWorld();
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const v=V3();
  for(const [x,y] of [[-HW,-HH],[HW,-HH],[HW,HH],[-HW,HH]]){
   v.set(x,y,0).applyMatrix4(paper.matrixWorld).project(vmCam);
   const sx=(v.x*.5+.5)*innerWidth,sy=(-v.y*.5+.5)*innerHeight;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);
  }
  hands.visible=was;return {x:x0,y:y0,w:x1-x0,h:y1-y0};
 }

 /* ---- 앞사람들이 비켜서기 ----
  * 걸어갈 길 폭(어깨 너비)과, 옥좌 앞에 다다랐을 때 화면에 보이는 범위 밖으로 사람마다 비켜설 자리를 정한다.
  * 길 가까운 사람일수록 많이, 먼 사람은 조금만 밀려나서(순서를 지켜 압축) 서로 뚫고 지나가지 않는다 */
 const PART={on:false,t0:0};
 const _dm=new THREE.Object3D();
 function writeCrowd(){
  if(!crowd)return;const place=crowd.userData.place;
  for(const mesh of crowd.children){
   const list=place&&place[mesh.userData.pi];if(!list)continue;
   list.forEach((v,j)=>{_dm.position.set(v.cx,v.cy||0,v.z);_dm.rotation.set(0,v.yaw!=null?v.yaw:v.turn,0);_dm.scale.setScalar(v.actor?0:v.scale);_dm.updateMatrix();mesh.setMatrixAt(j,_dm.matrix);});
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 function resetCrowd(){
  CROWD.releaseWitnesses();
  PART.on=false;stareReset();if(!crowd||!crowd.userData.place)return;
  for(const list of crowd.userData.place)for(const v of list){v.actor=null;v.cx=v.x;v.cy=0;v.tx=v.x;v.look=0;v.yaw=v.turn;v.goal=null;v.noticeAt=null;v.politeAt=null;}
  writeCrowd();
 }
 function part(endZ,endFov){
  if(!crowd||!crowd.userData.place)return;
  const tanH=Math.tan(endFov*PI/360)*innerWidth/innerHeight,body=.36,lane=.66;
  for(const list of crowd.userData.place)for(const v of list){
   const ax=Math.abs(v.x),need=Math.max(lane,v.z<endZ-.05?(endZ-v.z)*tanH+body:0),reach=need+1.7;
   v.tx=ax<reach?(v.x<0||(v.x===0&&v.z%2<1)?-1:1)*(need+ax*(reach-need)/reach):v.x;
   v.delay=clamp((6.9-v.z)*.1,0,.7)+rnd(0,.1);v.dur=rnd(.5,.68);
  }
  PART.on=true;PART.t0=G.time;planWhispers();AUDIO.crowdShuffle();
 }
 function updatePart(){
  // 회중이 치워진 뒤(족치기 무대)에는 아무도 회중 자리로 옮기지 않는다
  if(!crowd||!crowd.visible)return;
  const turning=updateStare();
  if(!PART.on||!crowd||!crowd.userData.place){
   forPlaces(v=>{if(v.actor)CROWD.poseWitness(v);});
   if(turning)writeCrowd();return;
  }
  const t=G.time-PART.t0;let busy=false;
  for(const list of crowd.userData.place)for(const v of list){
   if(v.tx===v.x)continue;const k=(t-v.delay)/v.dur;if(k<1)busy=true;
   v.cx=lerp(v.x,v.tx,smoother(k));v.cy=Math.sin(PI*clamp(k,0,1))*.035;
  }
  forPlaces(v=>{if(v.actor)CROWD.poseWitness(v);});
  writeCrowd();if(!busy)PART.on=false;
 }

 /* ---- 설교를 끊으면 돌아보는 군중 ----
  * 종이를 구기기 시작하면 내 옆사람부터 앞줄까지 물결처럼 몸을 돌려 나를 본다(얼굴은 흘겨보는 얼굴로 구워 두었다).
  * 걸어가는 동안에도 얼굴이 나를 따라 돌아가고, 손을 놓고 물러서면 천지신명이 「이제야 네 운명을 아는구나」 할 때 다시 돌아선다.
  * 다 구긴 뒤 천지신명의 꾸짖음이 끝나고 걸음을 떼면 옆줄이 말을 꺼내고, 앞줄이 이어 받는다. */
 const STARE={on:false,t0:0,talk:[],used:new Set(),anchors:[],exchange:null};
 const HEAD_Y=.763; // 사람 기준 단위로 발에서 머리 가운데까지(몸 .215 + 목 위 .548)
 function stareReset(){STARE.on=false;STARE.talk.length=0;STARE.exchange=null;}
 function forPlaces(fn){if(crowd&&crowd.userData.place)for(const list of crowd.userData.place)for(const v of list)fn(v);}
 // 몸을 돌리는 각: 가장 짧은 쪽으로 돌되, 거의 정반대일 때는 정해 둔 쪽(side)으로 돈다(걸어가는 동안 방향이 뒤집히지 않게)
 function turnBy(base,goal,side){let d=goal-base;d=((d+PI)%TAU+TAU)%TAU-PI;if(Math.abs(d)>PI-.3)d=side*Math.abs(d);return d;}
 function stare(on){
  if(!crowd||!crowd.userData.place||on===STARE.on)return;
  STARE.on=on;STARE.t0=G.time;
  const cx=CAM.pos.x,cz=CAM.pos.z;
  forPlaces(v=>{
   const d=Math.hypot(v.x-cx,v.z-cz);
   if(v.look==null)v.look=0;v.from=v.look;v.goal=on&&d<2.7?1:0;
   if(on&&v.goal)v.noticeAt=G.time;
   v.ld=on?.02+d*.085+rnd(0,.12):.45+rnd(0,.5);v.ldur=on?rnd(.36,.52):rnd(.55,.8);
   if(on||v.side==null)v.side=Math.abs(v.x-cx)<.15?(Math.random()<.5?-1:1):Math.sign(v.x-cx);
  });
  if(on){prepareWhispers();AUDIO.crowdTurn();}
  else{STARE.talk.length=0;CROWD.releaseWitnesses();STARE.exchange=null;AUDIO.crowdShuffle(.5);}
 }
 // Choose the replying face for where the reader will be at the END of the line.
 // The speaker stays until the reply is read; everyone else parts when we start walking.
 function walkSpeaker(side,until,replyTo,person){
  const e=walkProgress(until/WALK.dur),cx=lerp(WALK.p0.x,WALK.p1.x,e),cz=lerp(WALK.p0.z,WALK.p1.z,e);
  const aimX=lerp(WALK.l0.x,WALK.l1.x,e),aimZ=lerp(WALK.l0.z,WALK.l1.z,e);
  const tanH=Math.tan(lerp(WALK.f0,WALK.f1,e)*PI/360)*camera.aspect;
  const view=camera.clone(),head=V3();
  view.fov=lerp(WALK.f0,WALK.f1,e);view.position.lerpVectors(WALK.p0,WALK.p1,e);
  view.lookAt(V3().lerpVectors(WALK.l0,WALK.l1,e));view.updateProjectionMatrix();view.updateMatrixWorld();
  let best=null,bestScore=Infinity;
  forPlaces(v=>{
   const depth=cz-v.z;
   if(v.pi!==person||v===STARE.exchange?.aside||depth<=.15||side*v.x<=0||(replyTo&&v.z<=replyTo.z+.3))return;
   head.set(v.x,HEAD_Y*v.scale,v.z).project(view);
   if(head.z<=-1||head.z>=1||Math.abs(head.x)>.9||Math.abs(head.y)>.85)return;
   const axis=cx+(aimX-cx)*depth/(cz-aimZ),screenX=side*(v.x-axis)/(depth*tanH);
   const row=replyTo?Math.abs(v.z-replyTo.z-1.05):Math.abs(depth-1.55);
   const score=Math.abs(screenX-.62)+row*.32+Math.max(0,Math.abs(screenX)-.85)*8;
   if(score<bestScore){bestScore=score;best=v;}
  });
  return best;
 }
 function prepareWhispers(){
  if(STARE.exchange)return;
  if(!crowd||!crowd.visible)return;
  const marks=lastResult?.paper?.marks||{};
  const avoid=new Set(lastResult?.paper?.crowdAvoid||[]);
  const eligible=LINES.whisper.filter(w=>!avoid.has(w.avoid)),batch=[];
  if(!eligible.length)return;
  for(let i=0;i<Math.min(3,eligible.length);i++){
   let pool=eligible.filter(w=>!STARE.used.has(w)&&!batch.includes(w));
   if(!pool.length){STARE.used.clear();pool=eligible.filter(w=>!batch.includes(w));}
   batch.push(pick(pool.concat(pool.filter(w=>w.mark&&marks[w.mark]))));
  }
  const pair=batch[0];
  const side=innerWidth<innerHeight?1:(Math.random()<.5?-1:1),head=V3();
  let aside=null,best=Infinity;
  forPlaces(v=>{
   if(v.pi!==pair.who)return;
   head.set(v.cx,HEAD_Y*v.scale,v.z).project(camera);
   if(head.z<=-1||head.z>=1||Math.abs(head.x)>.93||Math.abs(head.y)>.86)return;
   const score=Math.hypot(v.cx-CAM.pos.x,v.z-CAM.pos.z)+Math.abs(head.x)*.2;
   if(score<best){aside=v;best=score;}
  });
  STARE.exchange={pair,batch,side,aside,say:pair.say};
  if(aside){aside.goal=1;aside.noticeAt=G.time;CROWD.witness(aside);}
 }
 // 끝의 물음표·마침표는 소리를 내지 않는다. 읽기 여유와 발화 길이를 따로 센다.
 function whisperSpokenTime(text,person){
  return typeTime(text.replace(/[\s.,!?…~]+$/,''),VOICE.crowd[person].speed*1.08);
 }
 // 종이를 다 구기면 누가 무슨 말을 할지만 정해 둔다. 천지신명의 꾸짖음이 끝날 때까지 그 자리에 서 있다가 걸음을 떼고(updateCrumple),
 // 수군거림은 첫마디부터 모두 걸어가는 동안 나온다(planWhispers)
 function startWhispers(){prepareWhispers();}
 function planWhispers(){
  const exchange=STARE.exchange;if(!exchange)return;
  const {batch,side,aside}=exchange,events=[];
  STARE.talk=[];WALK.dur=4.35;
  if(!batch.length)return;
  const span=(text,person)=>Math.max(1.5,typeTime(text,VOICE.crowd[person].speed*1.08)+.68);
  const gap=.12,pairGap=.34;
  let at=.28;
  for(let i=0;i<batch.length;i++){
   const pair=batch[i],second=i*2;
   // 묻는 말은 1·3·5번, 받는 말은 0·2·4번 얼굴이 한다(여섯 문장, 여섯 사람). 첫 물음은 종이를 구길 때 나를 돌아본 옆사람(aside)이 걸음을 떼자마자 한다
   const who=i===0?aside:null,first=who?who.pi:i*2+1;
   events.push({at,end:at+span(pair.aside,first),person:first,text:pair.aside,slot:i*2,pair,opening:true,who});
   at+=whisperSpokenTime(pair.aside,first)+gap;
   const end=at+span(pair.say,second);
   events.push({at,end,person:second,text:pair.say,slot:i*2+1,pair,opening:false,who:null});
   at=end+pairGap;
  }
  const find=event=>event.who||walkSpeaker(side,event.end,null,event.person)||walkSpeaker(-side,event.end,null,event.person);
  // 여섯 문장을 모두 읽고 난 뒤 옥좌에 도착한다. 말이 빠르다고 걷기를 먼저 끝내지 않는다.
  WALK.dur=Math.max(WALK.dur,(events[events.length-1].end+.4)/.96);
  // 대화가 빨라져도 말할 사람을 지나치지 않는다. 모두 화면 안에서 읽히는 속도까지만 걷기를 늦춘다.
  for(let n=0;n<12&&events.some(event=>!find(event));n++)WALK.dur+=.25;
  for(const event of events){
   const speaker=find(event);if(!speaker)continue;
   if(!speaker.actor)CROWD.witness(speaker);
   speaker.from=speaker.look||0;speaker.goal=1;speaker.ld=G.time-STARE.t0;speaker.ldur=.45;speaker.noticeAt=G.time;
   speaker.delay=event.end+.12;
   STARE.talk.push({at:event.at,who:speaker,text:event.text,slot:event.slot,pair:event.pair,opening:event.opening});
  }
 }
 function anchorOf(v,slot){
  let a=STARE.anchors[slot];if(!a){a=new THREE.Object3D();STARE.anchors[slot]=a;}
  if(a.parent!==crowd)crowd.add(a);a.userData.v=v;placeAnchor(a);return a;
 }
 function placeAnchor(a){
  const v=a.userData.v;if(!v)return;
  if(v.actor){v.actor.head.getWorldPosition(a.position);crowd.worldToLocal(a.position);}
  else a.position.set(v.cx,HEAD_Y*v.scale+(v.cy||0),v.z);
 }
 function sayWhisper(who,text,slot){
  const v=VOICE.crowd[(who.actor?who.actor.i:who.pi)%VOICE.crowd.length];
  return BUB.say({obj:anchorOf(who,slot),off:ZERO3,top:.13*who.scale,cam:'main'},text,0,
   {voice:{pitch:v.pitch,formant:v.formant,speed:v.speed*1.08},whisper:true,stable:true,size:.95,read:[.68,0],pan:clamp(who.x*.6,-.8,.8)});
 }
 function updateWhispers(){
  while(WALK.on&&STARE.talk.length&&WALK.t>=STARE.talk[0].at){
   const {who,text,slot,pair,opening}=STARE.talk.shift();
   sayWhisper(who,text,slot);
   if(opening)STARE.used.add(pair);
  }
 }
 // 매 프레임: 몸 돌리기·얼굴로 나를 따라보기·말할 자리 따라가기. 움직인 게 있으면 true
 function updateStare(){
  if(!crowd||!crowd.visible||!crowd.userData.place)return false;
  updateWhispers();
  for(const a of STARE.anchors)if(a&&a.parent)placeAnchor(a);
  const cx=CAM.pos.x,cz=CAM.pos.z;let moved=false;
  forPlaces(v=>{
   if(v.goal==null)return;
   const k=clamp((G.time-STARE.t0-v.ld)/v.ldur,0,1);v.look=lerp(v.from,v.goal,smoother(k));
   if(v.look<=0&&v.goal===0){if(v.yaw!==v.turn){v.yaw=v.turn;moved=true;}return;}
   let face=Math.atan2(cx-v.cx,cz-v.z);
   if(v.politeAt!=null){const boss=Math.atan2(-v.cx,-.62-v.z);face+=turnBy(face,boss,v.side)*smooth((G.time-v.politeAt-.6)/.9);}
   const y=v.turn+turnBy(v.turn,face,v.side)*v.look;
   if(Math.abs(y-(v.yaw==null?v.turn:v.yaw))>1e-4){v.yaw=y;moved=true;}
  });
  return moved;
 }

 // behind: 풀이 화면 밑에 깔려 있을 때(손과 종이는 줄어드는 풀이 화면이 다 덮을 때까지 보이지 않는다)
 function begin(result,behind){
  crowd=CROWD.congregationView();crowd.visible=true;resetCrowd();
  fortune(result);flatten();hands.visible=!behind;paper.visible=!behind;line=0;next=G.time;
 }
 function update(dt){
  if(!hands.visible&&!CR.drop)return;
  layout();
  if(CR.drop)updateDrop(dt);
  else{
   const c=CRUMPLE.c,k=smooth(c*1.15);
   HANDS.forEach(h=>{const s=h.userData.side;h.position.x=s*lerp(.148,.064,k);h.position.y=lerp(-.12,-.035,k);h.rotation.z=s*.34*k;});
   if(CRUMPLE.holding&&c>0)hands.position.x+=Math.sin(G.time*47)*.0018*k;
   shape(c);
  }
  // 설교: 종이를 들고 서 있는 동안. 구기는 중에는 끊기고, 도로 펴면 잠시 뒤 다음 구절부터 이어진다
  if(G.mode==='submit'&&INTRO.stage==='arrived'&&!CRUMPLE.done&&!CRUMPLE.holding&&CRUMPLE.c<.12&&!talkBusy()&&G.time>=next){
   const [text,dur,delay]=LINES.submit[line];queueTalk([['boss',text,dur,!INTRO.sermonHeard&&line===0?0:delay,1]]);
   line=(line+1)%LINES.submit.length;next=G.time+dur+delay+1;
  }
  if(G.E&&G.mode==='submit')G.E.idleT=1e6;
 }
 function sermonSoon(delay){next=G.time+delay;}
 function showPaper(on){if(!CR.drop)paper.visible=on;}
 function reset(){
  hands.visible=false;if(crowd){resetCrowd();crowd.visible=false;}
  if(texture){texture.dispose();texture=null;front.map=null;front.needsUpdate=true;}
  $('#heldFortuneText').textContent='';next=0;line=0;flatten();hands.visible=false;
 }
 return {begin,update,reset,hands,rect,part,updatePart,stare,drop,sermonSoon,showPaper,get dropping(){return !!CR.drop;},get crowd(){return crowd;},get staring(){return STARE.on;}};
})();

/* ===== 5. 피 =====
 * 튀는 피(방울) · 몸을 타고 흐르는 피(줄기) · 떨어지는 피(낙수) · 고이는 피(바닥) · 화면에 묻는 피 · 멍/상처 자국 */
const BLOOD=(()=>{
 // 사람이 아니라 피가 파랗다
 const red=STD('#1a4fcf',{roughness:.12});
 const tearMat=STD('#8fcaf2',{roughness:.02,metalness:.2,transparent:true,opacity:.86,depthWrite:false,envMapIntensity:1.6,emissive:col('#3f7fb0'),emissiveIntensity:.3});
 const dustMat=STD('#e8dfcf',{roughness:1,transparent:true,opacity:.38,depthWrite:false});
 const spitMat=STD('#eef3f6',{roughness:.05,transparent:true,opacity:.55,depthWrite:false});
 const beadMat=STD('#1748c2',{roughness:.1});
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
 function emit(kind,p,v,size,life){const arr=parts[kind];const d=arr[cursor[kind]++%arr.length];d.p.copy(p);d.v.copy(v);d.size=size;d.life=life;d.age=0;d.on=true;d.screen=false;return d;}
 function spray(p,dir,n,o={}){
  const kind=PREF.blood?(o.kind||'blood'):'dust';
  // 파란 방울은 많으면 구슬처럼 보여 얼굴을 덮는다: 개수와 크기를 조금 줄인다
  if(kind==='blood')n=Math.ceil(n*.72);
  for(let i=0;i<n;i++){const sp=rnd(o.min||.8,o.max||3.2);v1.copy(dir).multiplyScalar(sp).add(v2.set(rnd(-1,1),rnd(-.4,1),rnd(-1,1)).multiplyScalar(o.spread||1));
   if(kind==='dust'){v1.multiplyScalar(.3);emit('dust',p,v1,rnd(.008,.018),rnd(.3,.55));}else emit(kind,p,v1,kind==='spit'?rnd(.002,o.smax||.0045):rnd(o.smin||.0026,Math.min(.0064,o.smax||.0064)),rnd(.6,1.4));}
 }
 /* ---- 바닥·옥좌 등받이에 그리기 ---- */
 // Sparse floor tiles cover the same 14 m floor as WORLD. Only stained tiles
 // allocate canvases. Each ellipse is stamped across all touched tiles with
 // identical shape and a two-pixel gutter, so neither paint nor filtering cuts
 // a straight edge through a puddle. Brush sizes remain in the old 320 px/m units.
 const FL={min:-7,max:7,size:1.75,res:512,pad:2,ppm:320};
 const floorTiles=new Map(),pool=new Map();let flUploadAcc=0;
 const floorRoot=grp(scene,null,'floor-blood');
 const floorGeo=new THREE.PlaneGeometry(FL.size,FL.size),uv=floorGeo.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(FL.pad+uv.getX(i)*FL.res)/(FL.res+2*FL.pad),(FL.pad+uv.getY(i)*FL.res)/(FL.res+2*FL.pad));
 function floorTile(ix,iz){
  const key=ix+','+iz;let t=floorTiles.get(key);if(t)return t;
  const tex=canvasTex(FL.res+2*FL.pad,FL.res+2*FL.pad,()=>{});
  tex.generateMipmaps=false;tex.minFilter=tex.magFilter=THREE.LinearFilter;
  const mat=STD('#ffffff',{map:tex,transparent:true,roughness:.1,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const x=FL.min+ix*FL.size,z=FL.min+iz*FL.size;
  const mesh=mk(floorGeo,mat,floorRoot,{p:[x+FL.size/2,.004,z+FL.size/2],r:[-PI/2,0,0],cast:false});mesh.renderOrder=1;
  t={tex,ctx:tex.userData.ctx,mesh,x,z,dirty:false};floorTiles.set(key,t);return t;
 }
 function floorInside(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&x>=FL.min&&x<FL.max&&z>=FL.min&&z<FL.max;}
 function floorAmount(x,z,amount){const key=Math.floor(x/.05)+','+Math.floor(z/.05),v=(pool.get(key)||0)+amount;pool.set(key,v);return v;}
 function floorBlob(x,z,r,color,alpha){
  const radius=r/FL.ppm,aspect=rnd(.75,1),angle=rnd(0,PI),scale=FL.res/FL.size,gutter=FL.pad/scale;
  const first=v=>Math.max(0,Math.floor((v-radius-gutter-FL.min)/FL.size)),last=v=>Math.min(7,Math.floor((v+radius+gutter-FL.min)/FL.size));
  for(let iz=first(z);iz<=last(z);iz++)for(let ix=first(x);ix<=last(x);ix++){
   const t=floorTile(ix,iz),g=t.ctx;g.globalAlpha=alpha;g.fillStyle=color;g.beginPath();
   g.ellipse((x-t.x)*scale+FL.pad,(z-t.z)*scale+FL.pad,radius*scale,radius*scale*aspect,angle,0,TAU);g.fill();g.globalAlpha=1;t.dirty=true;
  }
 }
 function blob(g,x,y,r,col_,a){g.globalAlpha=a;g.fillStyle=col_;g.beginPath();g.ellipse(x,y,r,r*rnd(.75,1),rnd(0,PI),0,TAU);g.fill();g.globalAlpha=1;}
 /* Droplets keep their physical size; repeated impacts alone form pools. */
 function paintFloor(x,z,vol,impact){
  if(!PREF.blood||!floorInside(x,z))return;
  const pr=Math.sqrt(floorAmount(x,z,vol)),s=clamp(Math.sqrt(vol)*230,2,8),j=n=>rnd(-n,n)/FL.ppm;
  floorBlob(x+j(2),z+j(2),s*rnd(.8,1.1),'#173da8',.82);
  if(pr>.06){const r=clamp(pr*62,5,42);floorBlob(x+j(5),z+j(5),r*rnd(.7,1),'#11308a',.13);}
  if(impact>3.2){const n=2+(Math.random()*3|0);for(let i=0;i<n;i++){const a=rnd(0,TAU),d=rnd(6,18)/FL.ppm;floorBlob(x+Math.cos(a)*d,z+Math.sin(a)*d,rnd(1.2,2.6),'#173da8',.75);}}
 }
 let underT=0;
 function poolUnder(x,z,amount){
  if(!PREF.blood||amount<=0||!floorInside(x,z))return;
  const sum=floorAmount(x,z,amount);underT-=1;if(underT>0)return;underT=6;
  const r=clamp(Math.sqrt(sum)*48,6,88);for(let i=0;i<3;i++){const a=rnd(0,TAU),d=rnd(0,r*.45)/FL.ppm;floorBlob(x+Math.cos(a)*d,z+Math.sin(a)*d*.7,r*rnd(.45,.8),'#11308a',.1);}
 }
 function updateFloor(dt){
  flUploadAcc=Math.min(1/15,flUploadAcc+dt);floorRoot.visible=PREF.blood;
  if(flUploadAcc<1/15)return;
  for(const t of floorTiles.values())if(t.dirty){t.tex.needsUpdate=true;t.dirty=false;}
  flUploadAcc=0;
 }
 function clearFloor(){
  for(const t of floorTiles.values()){t.mesh.removeFromParent();t.tex.dispose();t.mesh.material.dispose();}
  floorTiles.clear();pool.clear();flUploadAcc=0;underT=0;
 }
 // 등받이 판
 let pnCanvas=null,pnCtx=null,pnSaved=null;
 function panelInit(){if(pnCtx)return;pnCanvas=WORLD.panelTex.userData.canvas;pnCtx=WORLD.panelTex.userData.ctx;pnSaved=document.createElement('canvas');pnSaved.width=pnCanvas.width;pnSaved.height=pnCanvas.height;pnSaved.getContext('2d',TEX_CTX).drawImage(pnCanvas,0,0);}
 function paintPanel(wp,size){
  if(!PREF.blood)return false;panelInit();const pl=WORLD.panel;pl.updateWorldMatrix(true,false);const l=pl.worldToLocal(v1.copy(wp));
  if(Math.abs(l.x)>.58||Math.abs(l.y)>.61||Math.abs(l.z)>.06)return false;
  const u=(l.x/1.16+.5)*pnCanvas.width,v=(.5-l.y/1.22)*pnCanvas.height;
  blob(pnCtx,u,v,size*pnCanvas.width,'#173da8',.82);
  if(size>.013&&Math.random()<.22){const len=rnd(6,28);pnCtx.globalAlpha=.7;pnCtx.fillStyle='#14348c';pnCtx.fillRect(u-1.5,v,3,len);blob(pnCtx,u,v+len,3,'#14348c',.8);pnCtx.globalAlpha=1;}
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
 function fadeBank(b,key){
  if(b.fade!=null)return;const m=b.mesh;b.op0=m.material.opacity;m.material=m.material.clone();m.material.transparent=true;m.material.depthWrite=false;b.fade=1;fading.push(b);
  if(key&&banks[key]===b)delete banks[key];
  // 이 자국에 아직 그려지고 있던 줄기는 여기서 멈춘다(줄기를 돌리는 중에 불릴 수 있어 빼는 건 줄기 돌기에서 한다)
  for(const r of rivs)if(r.b===b)r.dead=true;
 }
 function discardBank(b){
  if(!b)return;b.mesh.removeFromParent();b.g.dispose();if(b.fade!=null)b.mesh.material.dispose();
  let i=bankList.indexOf(b);if(i>=0)bankList.splice(i,1);i=fading.indexOf(b);if(i>=0)fading.splice(i,1);
 }
 // 흐르는 피는 부위별 양을 정해 둔다(얼굴이 피로 다 덮이거나 난타 중 자국이 무한히 쌓이지 않게 한다).
 // 다 차면 예전 핏줄기는 짧게 옅어지며 사라지고 새로 흐르기 시작한다.
 const FACE_SEG=/^(head|jaw)$/,fading=[];
 function bank(seg,kind){
  const key=seg+':'+kind,face=FACE_SEG.test(seg)&&kind!=='tear',bone=E.bones[seg];let b0=banks[key];
  // 잘려 나간 뼈에 붙은 묶음이면(같은 이름으로 다시 자란 경우) 새로 만든다
  if(b0&&b0.bone!==bone){delete banks[key];b0=null;}
  if(b0&&b0.count<b0.MAXP-(face?20:80))return b0;
  // 몸통도 가득 찬 핏줄기 묶음을 계속 쌓아 두지 않는다. 새 묶음으로 갈아타며 옛것은 짧게 사라진다.
  if(b0){
   // 한 부위·한 종류에는 현재 묶음과 사라지는 묶음 하나만 둔다. 난타 중에도 옛 피줄기가 무한 누적되지 않는다.
   for(let i=bankList.length-1;i>=0;i--){const old=bankList[i];if(old!==b0&&old.bone===bone&&old.kind===kind&&old.fade!=null)discardBank(old);}
   fadeBank(b0,key);
  }
  if(!bone)return null;
  const MAXP=face?260:800,P=new Float32Array(MAXP*2*3),N=new Float32Array(MAXP*2*3),I=new Uint32Array(MAXP*6);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('normal',new THREE.BufferAttribute(N,3).setUsage(THREE.DynamicDrawUsage));g.setIndex(new THREE.BufferAttribute(I,1).setUsage(THREE.DynamicDrawUsage));g.setDrawRange(0,0);
  const m=new THREE.Mesh(g,kind==='tear'?tearMat:red);m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.renderOrder=2;m.userData.gore=kind!=='tear';m.userData.bloodOverlay=true;bone.add(m);
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
 const tearProbe=V3();
 const _invM=new THREE.Matrix4();function _inv(bone){return _invM.copy(bone.matrixWorld).invert();}
 function stepRiv(r,dt){
  const bone=r.bone;bone.updateWorldMatrix(true,false);
  const P=v1.copy(r.lp).applyMatrix4(bone.matrixWorld),N=v2.copy(r.ln).transformDirection(bone.matrixWorld);
  // 눈꺼풀의 둥근 밑면에서 방울이 끊기지 않게, 볼에 닿을 때까지 얼굴 앞에서 보이는 표면을 따라간다.
  const eye=r.tearEye;
  if(eye)N.set(0,0,1).transformDirection(eye.eg.matrixWorld);
  if(N.y<-.82){r.why='under';endRiv(r,true,P);return;}
  const g=v3.set(0,-1,0);g.addScaledVector(N,-g.dot(N));const slope=g.length();
  if(slope<.05){r.len+=.002;if(r.len>r.maxLen)endRiv(r,false,P);return;}
  g.normalize();r.wob+=dt*rnd(1.2,2.6);const side=v4.crossVectors(N,g).normalize();g.addScaledVector(side,Math.sin(r.wob)*r.wobAmt).normalize();
  const ds=r.speed*dt*(.35+.65*slope)*(1-r.len/r.maxLen*.6);
  const np=v5.copy(P).addScaledVector(g,ds);
  const hit=eye?project(np,N,.08,[eye.loLid,E.skull]):project(np,N,.05);
  if(!hit){r.why='nohit';endRiv(r,true,P);return;}
  if(eye){
   // 도드라진 눈꺼풀 아래 오목한 곳으로 물줄기가 꺾여 들어가지 않게 깊이를 서서히 잇는다.
   const retreat=tearProbe.subVectors(np,hit.point).dot(N);
   const clearance=.0015;
   hit.point.addScaledVector(N,Math.max(clearance,retreat-ds*.6));
   const onCheek=hit.obj===E.skull&&retreat<=ds*.6+clearance
    &&eye.eg.worldToLocal(tearProbe.copy(hit.point)).y < -eye.r*1.25;
   if(onCheek)r.tearEye=null;
   else hit.normal.copy(N);
  }
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
  for(const w of wounds){if(w.seg===seg&&w.bone===bone){const wp=v1.copy(w.lp).applyMatrix4(bone.matrixWorld);if(wp.distanceTo(pW)<.03){w.rate0=Math.min(w.rate0*1.35+o.rate*.6,.09);w.age=0;w.artery=w.artery||o.artery;w.nextRiv=0;return w;}}}
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
 /* ---- 상처 그림 도구 ---- */
 function jagFill(g,cx,cy,r,j,fill){g.beginPath();for(let i=0;i<32;i++){const a=i/32*TAU,rr=r+rnd(-j,j),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.closePath();g.fillStyle=fill;g.fill();}
 // 가로로 긴 렌즈(벌어진 상처) 윤곽: 위·아래 점들
 function lensPts(w,cy,k,jit,pad=4){const N=32,top=[],bot=[];for(let i=0;i<=N;i++){const q=i/N,e=Math.pow(Math.sin(q*PI),.85),x=pad+q*(w-pad*2);top.push([x,cy-e*k*rnd(1-jit,1+jit)]);bot.push([x,cy+e*k*rnd(1-jit,1+jit)]);}return [top,bot];}
 function lensPath(g,t,b){g.beginPath();t.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));for(let i=b.length-1;i>=0;i--)g.lineTo(b[i][0],b[i][1]);g.closePath();}
 // 둥글게 찢긴 살갗: 말린 살갗 테 → 파란 테 → 초록 비늘
 function tornPatch(g,R){
  const ph=[rnd(0,TAU),rnd(0,TAU),rnd(0,TAU)],N=40,pts=[];
  for(let i=0;i<N;i++){const a=i/N*TAU,r=R+6*Math.sin(a*2+ph[0])+4*Math.sin(a*3+ph[1])+3*Math.sin(a*5+ph[2])+(i%2?rnd(-3,1):rnd(-1,3));pts.push([64+Math.cos(a)*r,64+Math.sin(a)*r*.92]);}
  const poly=k=>{g.beginPath();pts.forEach((p,i)=>{const x=64+(p[0]-64)*k,y=64+(p[1]-64)*k;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();};
  poly(1.17);g.fillStyle='rgba(240,178,146,.95)';g.fill();poly(1.17);g.lineWidth=2;g.strokeStyle='rgba(176,96,78,.55)';g.stroke();
  poly(1.05);g.fillStyle='#1f49b8';g.fill();
  poly(1);g.fillStyle='#31501a';g.fill();g.save();poly(1);g.clip();
  drawScales(g,128,128,19,15);
  const sh=g.createRadialGradient(64,64,R*.55,64,64,R*1.25);sh.addColorStop(0,'rgba(20,30,8,0)');sh.addColorStop(1,'rgba(20,30,8,.55)');g.fillStyle=sh;g.fillRect(0,0,128,128);
  g.restore();
 }
 const T={
  bruise:canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(92,30,96,.72)');r.addColorStop(.45,'rgba(130,40,86,.5)');r.addColorStop(.75,'rgba(176,58,70,.22)');r.addColorStop(1,'rgba(176,58,70,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
  red:canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(214,52,62,.6)');r.addColorStop(.6,'rgba(220,70,70,.28)');r.addColorStop(1,'rgba(220,70,70,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
  // 한 번 눌린 살처럼 중심이 비껴 겹치는 얼룩. 테두리는 모두 부드럽게 사라진다.
  knuckle:canvasTex(128,128,(g)=>{
   const patches=[[63,65,54,32,-.16,'158,54,76',.36],[56,62,31,21,-.37,'102,42,70',.36],[80,57,22,15,.19,'137,46,64',.24]];
   for(const [x,y,rx,ry,angle,rgb,alpha] of patches){
    g.save();g.translate(x,y);g.rotate(angle);g.scale(rx,ry);
    const tint=g.createRadialGradient(-.12,.06,0,0,0,1);
    tint.addColorStop(0,'rgba('+rgb+','+alpha+')');tint.addColorStop(.52,'rgba('+rgb+','+alpha*.65+')');tint.addColorStop(1,'rgba('+rgb+',0)');
    g.fillStyle=tint;g.fillRect(-1,-1,2,2);g.restore();
   }
  }),
  // 총알구멍(옷): 파랗게 번진 자리 + 구멍
  hole:canvasTex(128,128,(g,w,h)=>{
   const halo=g.createRadialGradient(64,64,16,64,64,63);halo.addColorStop(0,'rgba(22,58,176,.62)');halo.addColorStop(.62,'rgba(24,60,170,.32)');halo.addColorStop(1,'rgba(24,60,170,0)');
   g.fillStyle=halo;g.fillRect(0,0,w,h);
   jagFill(g,64,64,39,5,'rgba(20,52,160,.98)');
   g.lineCap='round';g.lineWidth=6;g.strokeStyle='rgba(116,166,255,.72)';g.beginPath();g.arc(64,66,34,.08*PI,.92*PI);g.stroke();
   g.lineWidth=7;g.strokeStyle='rgba(4,12,46,.72)';g.beginPath();g.arc(64,61,33,1.08*PI,1.92*PI);g.stroke();
   jagFill(g,64,64,26,3,'rgba(3,8,30,1)');
   const core=g.createRadialGradient(58,58,1,64,64,25);core.addColorStop(0,'rgba(0,0,6,1)');core.addColorStop(.68,'rgba(2,6,22,1)');core.addColorStop(1,'rgba(10,26,86,.98)');g.fillStyle=core;g.beginPath();g.arc(64,64,25,0,TAU);g.fill();
  }),
  // 베인 자국(옷): 파란 입술 + 안쪽 그늘
  cut:canvasTex(256,96,(g,w,h)=>{
   const cy=h/2,[top,bot]=lensPts(w,cy,30,.16),[it,ib]=lensPts(w,cy,10.5,.2,12);
   const lip=g.createLinearGradient(0,8,0,h-8);lip.addColorStop(0,'rgba(8,22,84,.98)');lip.addColorStop(.42,'rgba(34,84,214,.98)');lip.addColorStop(.58,'rgba(12,36,138,.98)');lip.addColorStop(1,'rgba(86,142,255,.86)');
   lensPath(g,top,bot);g.fillStyle=lip;g.fill();
   lensPath(g,it,ib);g.fillStyle='rgba(2,6,24,1)';g.fill();
   g.lineCap='round';g.lineWidth=4;g.strokeStyle='rgba(130,178,255,.78)';g.beginPath();g.moveTo(18,cy+2);g.bezierCurveTo(72,cy+17,184,cy+17,w-18,cy+2);g.stroke();
   g.lineWidth=3;g.strokeStyle='rgba(4,14,58,.82)';g.beginPath();g.moveTo(18,cy-2);g.bezierCurveTo(72,cy-17,184,cy-17,w-18,cy-2);g.stroke();
  }),
  // 살갗이 찢긴 자리(칼): 말려 올라간 살갗 사이로 파란 테와 초록 비늘, 가운데로 파란 피
  cutSkin:canvasTex(256,96,(g,w,h)=>{
   const cy=h/2,[t0,b0]=lensPts(w,cy,40,.12,6),[t1,b1]=lensPts(w,cy,31,.1,10),[t2,b2]=lensPts(w,cy,25,.08,14);
   lensPath(g,t0,b0);g.fillStyle='rgba(240,178,146,.97)';g.fill();g.lineWidth=2.5;g.strokeStyle='rgba(166,92,72,.6)';g.stroke();
   lensPath(g,t1,b1);g.fillStyle='#1c46b4';g.fill();
   lensPath(g,t2,b2);g.save();g.clip();drawScales(g,w,h,17,13);
   g.strokeStyle='rgba(10,30,120,.92)';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(10,cy+1);g.bezierCurveTo(80,cy+6,170,cy-4,w-10,cy);g.stroke();
   const sh=g.createLinearGradient(0,cy-26,0,cy+26);sh.addColorStop(0,'rgba(16,26,6,.55)');sh.addColorStop(.5,'rgba(16,26,6,0)');sh.addColorStop(1,'rgba(16,26,6,.45)');g.fillStyle=sh;g.fillRect(0,0,w,h);
   g.restore();
  }),
  soak:canvasTex(128,128,(g,w,h)=>{for(let i=0;i<9;i++){const x=64+rnd(-22,22),y=64+rnd(-22,22),r=rnd(18,36);const gr=g.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,'rgba(24,62,178,.5)');gr.addColorStop(.7,'rgba(24,62,178,.32)');gr.addColorStop(1,'rgba(24,62,178,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}}),
  // 비늘: 찢어진 살갗 사이로 초록 비늘(결과 화면 도사와 같은 색)
  scales:canvasTex(128,128,(g,w,h)=>{tornPatch(g,42);}),
  // 총알구멍(살): 찢어진 살갗 + 비늘 + 가운데 파란 구멍
  holeSkin:canvasTex(128,128,(g,w,h)=>{
   tornPatch(g,40);
   jagFill(g,64,64,15,2.5,'#1d4cc0');jagFill(g,64,64,11,2,'rgba(3,8,32,1)');
   g.fillStyle='rgba(140,186,255,.75)';g.beginPath();g.arc(59,59,3,0,TAU);g.fill();
  }),
  scrape:canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,58);r.addColorStop(0,'rgba(196,40,46,.55)');r.addColorStop(1,'rgba(196,40,46,0)');g.fillStyle=r;g.fillRect(0,0,w,h);g.strokeStyle='rgba(150,10,22,.6)';g.lineWidth=2;for(let i=0;i<10;i++){g.beginPath();const y=rnd(36,92);g.moveTo(rnd(24,44),y);g.lineTo(rnd(84,104),y+rnd(-6,6));g.stroke();}}),
 };


 const DM={};
 const DORDER={soak:2,bruise:3,red:3,scrape:3,knuckle:4,scales:5,cut:6,cutSkin:6,hole:7,holeSkin:7};
 const DLIFT={soak:.0007,bruise:.001,red:.001,scrape:.0011,knuckle:.00135,scales:.0016,cut:.00175,cutSkin:.00175,hole:.002,holeSkin:.002};

 for(const k in T){
  const opt={
   map:T[k],
   transparent:true,
   depthWrite:false,
   depthTest:true,
   alphaTest:(k==='hole'||k==='cut'||k==='holeSkin'||k==='cutSkin')?.025:0,
   polygonOffset:true,
   polygonOffsetFactor:-4,
   polygonOffsetUnits:-4
  };

  if(k==='hole'){
   DM[k]=new THREE.MeshBasicMaterial(opt);
  }else{
   opt.roughness=k==='cut'?.18:k==='soak'?.35:k==='scales'||k==='holeSkin'||k==='cutSkin'?.32:.55;
   DM[k]=new THREE.MeshStandardMaterial(opt);
  }
 }




 const decals=[],_dd=V3();
 const DECAL_MAX=96;
 const DECAL_KEEP=new Set(['hole','cut','holeSkin','cutSkin']);
 // 같은 자리에 같은 자국이 이미 있으면 새로 붙이지 않는다(얼굴이 자국으로 뒤덮여 표정이 안 보이지 않게)
 const DEDUPE={knuckle:.03,bruise:.035,red:.03,soak:.05,hole:.012,holeSkin:.012,scales:.03};
 function decal(type,seg,pW,nW,size,o={}){
  if(!E)return null;
  // 피를 끄면: 배어 나온 피 자국은 안 붙이고, 구멍·베인 자국은 작은 멍으로
  if(!PREF.blood){if(type==='soak')return null;if(type==='hole'||type==='cut'){type='bruise';size=Math.min(size,.03);o=Object.assign({},o,{aspect:1});}
   // 살갗 상처는 파란 피 없이 비늘만
   else if(type==='holeSkin'||type==='cutSkin'){type='scales';size=Math.min(size,.03);o=Object.assign({},o,{aspect:1});}}
  const bone=E.bones[seg];if(!bone)return null;bone.updateWorldMatrix(true,false);
  const dd=DEDUPE[type];
  if(dd&&!o.force){const lp=bone.worldToLocal(_dd.copy(pW));let n=0;
   for(const m of decals){if(m.parent!==bone||m.userData.decal!==type)continue;if(m.userData.center&&m.userData.center.distanceToSquared(lp)<dd*dd)return m;if(!m.userData.pin)n++;}
   const cap=seg==='head'||seg==='jaw'?(type==='knuckle'?7:type==='hole'||type==='holeSkin'?8:type==='scales'?9:5):14;
   if(n>=cap){let old=null;for(const m of decals)if(m.parent===bone&&m.userData.decal===type&&!m.userData.pin){old=m;break;}if(old){old.removeFromParent();old.geometry.dispose();decals.splice(decals.indexOf(old),1);}}
  }
  const n=nW.clone().normalize(),u=V3().crossVectors(n,Math.abs(n.y)>.9?V3(1,0,0):V3(0,1,0)).normalize(),v=V3().crossVectors(n,u);
  const ang=o.angle!=null?o.angle:rnd(0,TAU);const cu=u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v,Math.sin(ang)),cv=v.clone().multiplyScalar(Math.cos(ang)).addScaledVector(u,-Math.sin(ang));
  const sx=size*(o.aspect||1),sy=size,G=o.grid||5,rows=o.rows||G,pos=[],uv=[],idx=[],valid=[],inv=_inv(bone).clone();
  const meshes=o.meshes||(E.flow&&E.flow[seg])||[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=G;i++){const a=i/G-.5,b=j/rows-.5;const guess=pW.clone().addScaledVector(cu,a*sx*2).addScaledVector(cv,b*sy*2);
   const hit=project(guess,n,.05,meshes),on=!!hit&&hit.seg===seg&&hit.normal.dot(n)>.05;
   valid.push(on);const hp=on?hit.point:guess,hn=on?hit.normal:n;
const p=hp.clone().addScaledVector(hn,DLIFT[type]||.0012);p.applyMatrix4(inv);pos.push(p.x,p.y,p.z);uv.push(i/G,j/rows);}
  // A missed surface sample is empty space, never a floating fallback plane.
  for(let j=0;j<rows;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;if(valid[a]&&valid[b]&&valid[c])idx.push(a,b,c);if(valid[b]&&valid[d]&&valid[c])idx.push(b,d,c);}
  if(!idx.length)return null;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,DM[type]);m.renderOrder=DORDER[type]||3;m.castShadow=false;m.receiveShadow=true;m.userData.gore=type==='hole'||type==='cut'||type==='soak'||type==='holeSkin'||type==='cutSkin';m.userData.bloodOverlay=true;m.userData.decal=type;if(o.pin)m.userData.pin=true;m.userData.seg=seg;m.userData.center=bone.worldToLocal(pW.clone());bone.add(m);
  // 뒤집힌 법선이면 뒤집기
  const nn=g.attributes.normal;if(nn.count){const t=V3(nn.getX(0),nn.getY(0),nn.getZ(0)).transformDirection(bone.matrixWorld);if(t.dot(n)<0){idx.reverse();g.setIndex(idx);g.computeVertexNormals();}}
  if(o.grow){m.scale.setScalar(.01);m.userData.grow={t:0,dur:o.grow,center:bone.worldToLocal(pW.clone())};}
  decals.push(m);

  if(decals.length>DECAL_MAX){
   const low=decals.findIndex(
    x=>!DECAL_KEEP.has(x.userData.decal)&&!x.userData.pin
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
  hole:STD('#16388f',{roughness:.28}),
  cut:STD('#2054d0',{roughness:.22})
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
  m.userData.bloodOverlay=true;

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
  const m=mk(sphereGeo(20),lumpMats[level],bone,{cast:false});m.userData.bloodOverlay=true;const lp=bone.worldToLocal(pW.clone().addScaledVector(nW,-size*.62));m.position.copy(lp);
  const ln=nW.clone().transformDirection(_inv(bone)).normalize();m.quaternion.setFromUnitVectors(V3(0,0,1),ln);m.scale.set(.001,.001,.001);
  lumps.push({mesh:m,bone,target:Math.min(size,.02),level,t:0});return true;
 }
 /* ---- 화면에 묻는 피 ---- */
 const sc=$('#sblood'),sx=sc.getContext('2d');let sw=1,sh=1,sdpr=1;const splats=[];
 const SB={
  resize(w,h){sdpr=Math.min(1.5,window.devicePixelRatio||1);sw=w;sh=h;sc.width=Math.round(w*sdpr);sc.height=Math.round(h*sdpr);sx.setTransform(sdpr,0,0,sdpr,0,0);},
  add(x,y,size){if(!PREF.blood)return;if(splats.length>9)splats.shift();
   const blobs=[],sats=[],runs=[];
   const nb=Math.round(rnd(4,7));for(let i=0;i<nb;i++){const a=rnd(0,TAU),d=rnd(0,.38)*size;blobs.push([Math.cos(a)*d,Math.sin(a)*d*.85,rnd(.3,.55)*size]);}
   const ns=Math.round(rnd(4,9));for(let i=0;i<ns;i++){const a=rnd(0,TAU),d=rnd(.7,1.7)*size;sats.push([Math.cos(a)*d,Math.sin(a)*d,rnd(.05,.14)*size,a,rnd(1,2.4)]);}
   const nr=Math.round(rnd(0,1.8));for(let i=0;i<nr;i++)runs.push({dx:rnd(-.35,.35)*size,y0:rnd(.1,.35)*size,len:0,max:rnd(.8,2.4)*size,sp:rnd(.25,.6)*size,w:rnd(.1,.16)*size});
   splats.push({x,y,size,blobs,sats,runs,age:0,life:rnd(2.2,3.2)});},
  update(dt){
   if(!splats.length){if(SB._dirty){sx.clearRect(0,0,sw,sh);SB._dirty=false;}return;}
   sx.clearRect(0,0,sw,sh);SB._dirty=true;
   for(let i=splats.length-1;i>=0;i--){const s=splats[i];s.age+=dt;if(s.age>s.life){splats.splice(i,1);continue;}
    const a=(s.age<.05?s.age/.05:1-smooth((s.age-s.life*.45)/(s.life*.55)))*.92,grow=s.age<.05?.6+.4*s.age/.05:1;
    // 테두리(짙게) → 속(선명한 파랑) → 위쪽 반사
    for(const [c,k,al] of [['#0e2c86',1.12,.9],['#2156d4',1,.9]]){sx.globalAlpha=a*al;sx.fillStyle=c;
     for(const b of s.blobs){sx.beginPath();sx.arc(s.x+b[0]*grow,s.y+b[1]*grow,b[2]*k*grow,0,TAU);sx.fill();}
     for(const t of s.sats){sx.save();sx.translate(s.x+t[0]*grow,s.y+t[1]*grow);sx.rotate(t[3]);sx.beginPath();sx.ellipse(0,0,t[2]*t[4]*k,t[2]*k,0,0,TAU);sx.fill();sx.restore();}
     for(const r of s.runs){if(k===1)r.len=Math.min(r.max,r.len+r.sp*dt*(1-r.len/r.max*.7));const x=s.x+r.dx,y=s.y+r.y0;sx.fillRect(x-r.w*k/2,y,r.w*k,r.len);sx.beginPath();sx.arc(x,y+r.len,r.w*.75*k,0,TAU);sx.fill();}}
    sx.globalAlpha=a*.4;sx.fillStyle='#dce8ff';const b0=s.blobs[0];sx.beginPath();sx.ellipse(s.x+b0[0]-b0[2]*.35,s.y+b0[1]-b0[2]*.4,b0[2]*.32,b0[2]*.18,-.6,0,TAU);sx.fill();
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
     if(kind==='blood'&&d.v.z<0&&d.p.z<-1.05&&d.p.z>-1.16){if(paintPanel(d.p,d.size*1.2)){d.on=false;continue;}}
     // 화면 쪽으로 날아온 피: 설계자 앞 2.5m쯤(카메라가 더 가까우면 카메라 바로 앞)을 지날 때 절반은 화면에도 묻는다.
     // 방울은 거기서 지우지 않고 끝까지 날아가 바닥에 떨어진다. 예전에는 그 자리에서 지워서 바닥 핏자국이 그 선에서 칼로 자른 듯 끊겼다.
     // 카메라 코앞(60cm)까지 온 방울만 렌즈에 맞은 것으로 치고 지운다(화면 가득 큰 방울로 보이지 않게)
     if(kind==='blood'&&d.v.z>0){
      if(!d.screen&&d.p.z>Math.min(camera.position.z-.42,2.5)){d.screen=true;const s=v1.copy(d.p).project(camera);if(Math.abs(s.x)<1&&Math.abs(s.y)<1&&Math.random()<.5)SB.add((s.x*.5+.5)*sw,(-s.y*.5+.5)*sh,rnd(7,15));}
      if(d.p.distanceToSquared(camera.position)<.36){d.on=false;continue;}
     }
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
  frameNo++;rivAcc+=dt;if(rivAcc>=1/15){const st=Math.min(rivAcc,.14);rivAcc=0;for(let i=rivs.length-1;i>=0;i--){const r=rivs[i];if(!r)continue;if(!r.dead)stepRiv(r,st);if(r.dead)rivs.splice(rivs.indexOf(r),1);}}
  // 줄기 끝 방울 + 멈춘 방울
  let k=0;
  for(const r of rivs){if(k>=TIPMAX)break;if(r.dead)continue;r.bone.updateWorldMatrix(true,false);const p=v1.copy(r.lp).applyMatrix4(r.bone.matrixWorld),n=v2.copy(r.ln).transformDirection(r.bone.matrixWorld);dummy.position.copy(p).addScaledVector(n,r.w*.5);dummy.quaternion.setFromUnitVectors(UP,n);const s=r.w*1.3;dummy.scale.set(s,s*.7,s*1.25);dummy.updateMatrix();tips.setMatrixAt(k++,dummy.matrix);}
  for(const b of beads){if(k>=TIPMAX)break;if(!b.bone.parent&&b.bone!==E.root)continue;b.bone.updateWorldMatrix(true,false);const p=v1.copy(b.lp).applyMatrix4(b.bone.matrixWorld),n=v2.copy(b.ln).transformDirection(b.bone.matrixWorld);dummy.position.copy(p).addScaledVector(n,b.s*.4);dummy.quaternion.setFromUnitVectors(UP,n);dummy.scale.set(b.s,b.s*.6,b.s*1.3);dummy.updateMatrix();tips.setMatrixAt(k++,dummy.matrix);}
  tips.count=k;tips.instanceMatrix.needsUpdate=true;tips.visible=k>0&&PREF.blood;
  // 낙수: 몸에서 떨어지는 피
  for(const d of drips){d.t-=dt;if(d.t<=0){d.t=clamp(.9/(d.feed*(.4+bleed*40)),.12,2.4)*rnd(.7,1.3);d.feed=Math.max(.3,d.feed-.02);d.bone.updateWorldMatrix(true,false);const p=v1.copy(d.lp).applyMatrix4(d.bone.matrixWorld);if(PREF.blood)emit('blood',p,v2.set(rnd(-.05,.05),-.2,rnd(-.05,.05)),rnd(.005,.008),3);}}
  // 쓰러져 있으면 몸 밑에 피가 고인다
  if(E.state==='down'||E.state==='dead'){const pp=E.bones.pelvis.getWorldPosition(v1);poolUnder(pp.x,pp.z+.05,bleed*dt*.6);}
  // 자국이 자라기
  for(const m of decals){const g=m.userData.grow;if(g){g.t+=dt;const s=lerp(.01,1,easeOut(g.t/g.dur));m.scale.setScalar(s);m.position.copy(g.center).multiplyScalar(1-s);if(g.t>=g.dur)m.userData.grow=null;}}
  for(const l of lumps){l.t+=dt;const s=damp(l.mesh.scale.x,l.target,6,dt);l.mesh.scale.set(s,s*.85,s*.42);}
  updateFloor(dt);
  for(let i=fading.length-1;i>=0;i--){const b=fading[i];b.fade-=dt/1.35;b.mesh.material.opacity=Math.max(0,b.fade)*(b.op0==null?1:b.op0);
   if(b.fade<=0){b.mesh.removeFromParent();b.g.dispose();b.mesh.material.dispose();const k=bankList.indexOf(b);if(k>=0)bankList.splice(k,1);fading.splice(i,1);}}
  const gv=PREF.blood;for(const b of bankList){b.mesh.visible=b.kind==='tear'||gv;}
  for(const m of decals)if(m.userData.gore)m.visible=gv;
for(const m of rims)m.visible=gv;
floorRoot.visible=gv;
 }

 function clearSegment(seg){
  if(!E)return;const bone=E.bones[seg];if(!bone)return;
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(m.parent!==bone)continue;m.removeFromParent();m.geometry.dispose();decals.splice(i,1);}
  for(let i=rims.length-1;i>=0;i--){const m=rims[i];if(m.parent!==bone)continue;m.removeFromParent();rims.splice(i,1);}
  for(let i=lumps.length-1;i>=0;i--){const l=lumps[i];if(l.bone!==bone)continue;l.mesh.removeFromParent();lumps.splice(i,1);}
  for(let i=bankList.length-1;i>=0;i--){const b=bankList[i];if(b.seg!==seg&&b.bone!==bone)continue;b.mesh.removeFromParent();b.g.dispose();if(b.fade!=null){b.mesh.material.dispose();const k=fading.indexOf(b);if(k>=0)fading.splice(k,1);}bankList.splice(i,1);}
  for(const key in banks)if(banks[key].seg===seg||banks[key].bone===bone)delete banks[key];
  for(let i=rivs.length-1;i>=0;i--)if(rivs[i].seg===seg||rivs[i].bone===bone)rivs.splice(i,1);
  for(let i=drips.length-1;i>=0;i--)if(drips[i].seg===seg||drips[i].bone===bone)drips.splice(i,1);
  for(let i=wounds.length-1;i>=0;i--)if(wounds[i].seg===seg||wounds[i].bone===bone)wounds.splice(i,1);
  for(let i=beads.length-1;i>=0;i--)if(beads[i].bone===bone)beads.splice(i,1);
 }
 // 떨어진 머리의 표면 자국은 그대로 두되, 새 머리로 이어질 동적 피 참조만 끊는다.
 function detachTree(root){
  if(!root)return;const nodes=new Set();root.traverse(o=>nodes.add(o));
  for(const key in banks)if(nodes.has(banks[key].bone))delete banks[key];
  for(let i=rivs.length-1;i>=0;i--)if(nodes.has(rivs[i].bone))rivs.splice(i,1);
  for(let i=drips.length-1;i>=0;i--)if(nodes.has(drips[i].bone))drips.splice(i,1);
  for(let i=wounds.length-1;i>=0;i--)if(nodes.has(wounds[i].bone))wounds.splice(i,1);
  for(let i=beads.length-1;i>=0;i--)if(nodes.has(beads[i].bone))beads.splice(i,1);
 }
 // 화면에서 버리는 옛 머리가 BLOOD 배열에도 남지 않게 정리한다.
 function forgetTree(root){
  if(!root)return;const nodes=new Set();root.traverse(o=>nodes.add(o));
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(!nodes.has(m.parent))continue;m.removeFromParent();m.geometry.dispose();decals.splice(i,1);}
  for(let i=rims.length-1;i>=0;i--){const m=rims[i];if(nodes.has(m.parent)){m.removeFromParent();rims.splice(i,1);}}
  for(let i=lumps.length-1;i>=0;i--){const l=lumps[i];if(nodes.has(l.bone)){l.mesh.removeFromParent();lumps.splice(i,1);}}
  for(let i=bankList.length-1;i>=0;i--){const b=bankList[i];if(!nodes.has(b.bone))continue;b.mesh.removeFromParent();b.g.dispose();if(b.fade!=null){b.mesh.material.dispose();const k=fading.indexOf(b);if(k>=0)fading.splice(k,1);}bankList.splice(i,1);}
  detachTree(root);
 }
 // 머리가 날아갈 때: 잘린 높이(뼈 좌표 y)보다 위에 있던 자국·상처·핏줄기만 없앤다(아래 얼굴은 그대로)
 function clearAbove(seg,y){
  if(!E)return;const bone=E.bones[seg];if(!bone)return;
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(m.parent!==bone||!m.userData.center||m.userData.center.y<y)continue;m.removeFromParent();m.geometry.dispose();decals.splice(i,1);}
  for(let i=rims.length-1;i>=0;i--){const m=rims[i];if(m.parent!==bone||m.position.y<y)continue;m.removeFromParent();rims.splice(i,1);}
  for(let i=lumps.length-1;i>=0;i--){const l=lumps[i];if(l.bone!==bone||l.mesh.position.y<y)continue;l.mesh.removeFromParent();lumps.splice(i,1);}
  for(let i=wounds.length-1;i>=0;i--){const w=wounds[i];if(w.bone===bone&&w.lp.y>=y)wounds.splice(i,1);}
  for(let i=rivs.length-1;i>=0;i--){const r=rivs[i];if(r.bone===bone&&r.lp.y>=y){r.dead=true;rivs.splice(i,1);}}
  for(let i=drips.length-1;i>=0;i--){const d=drips[i];if(d.bone===bone&&d.lp.y>=y)drips.splice(i,1);}
  for(let i=beads.length-1;i>=0;i--){const b=beads[i];if(b.bone===bone&&b.lp.y>=y)beads.splice(i,1);}
  // 핏줄기는 한 부위에 한 덩어리로 그려져 있어 일부만 지울 수 없으므로 천천히 옅어지게 한다
  for(const key in banks){const b=banks[key];if(b.bone===bone)fadeBank(b,key);}
 }
 // 머리 한 조각이 잘려 나갈 때: 뼈 좌표 평면(n·p-d>0 쪽)에 있던 자국·상처·핏줄기만 없앤다
 function clearPlane(seg,nL,dL){
  if(!E)return;const bone=E.bones[seg];if(!bone)return;const over=p=>nL.x*p.x+nL.y*p.y+nL.z*p.z-dL>0,center=V3();
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(m.parent!==bone)continue;
   // Clip every crossing scar at the same cut plane. Testing only its centre
   // left the rest of a long scar hanging over the removed skull.
   m.updateMatrix();const plane=new THREE.Plane(nL.clone(),-dL).applyMatrix4(m.matrix.clone().invert());
   const old=m.geometry;if(!old.boundingBox)old.computeBoundingBox();
   if(!old.boundingBox.intersectsPlane(plane)){
    if(plane.distanceToPoint(old.boundingBox.getCenter(center))<=0)continue;
    m.removeFromParent();old.dispose();decals.splice(i,1);continue;
   }
   const cut=SLICE.slice(old,plane.normal,-plane.constant,false,true);
   if(cut.keep){m.geometry=cut.keep;old.dispose();}
   else{m.removeFromParent();old.dispose();decals.splice(i,1);}
  }
  for(let i=rims.length-1;i>=0;i--){const m=rims[i];if(m.parent!==bone||!over(m.position))continue;m.removeFromParent();rims.splice(i,1);}
  for(let i=lumps.length-1;i>=0;i--){const l=lumps[i];if(l.bone!==bone||!over(l.mesh.position))continue;l.mesh.removeFromParent();lumps.splice(i,1);}
  for(let i=wounds.length-1;i>=0;i--){const w=wounds[i];if(w.bone===bone&&over(w.lp))wounds.splice(i,1);}
  for(let i=rivs.length-1;i>=0;i--){const r=rivs[i];if(r.bone===bone&&over(r.lp)){r.dead=true;rivs.splice(i,1);}}
  for(let i=drips.length-1;i>=0;i--){const d=drips[i];if(d.bone===bone&&over(d.lp))drips.splice(i,1);}
  for(let i=beads.length-1;i>=0;i--){const b=beads[i];if(b.bone===bone&&over(b.lp))beads.splice(i,1);}
  for(const key in banks){const b=banks[key];if(b.bone===bone)fadeBank(b,key);}
 }
 // 이 부위에 흘러내린 핏줄기를 천천히 지운다(배가 갈라져 금화가 드러날 때 배를 깨끗하게)
 function fadeSeg(seg){if(!E)return;const bone=E.bones[seg];for(const key in banks){const b=banks[key];if(b.bone===bone)fadeBank(b,key);}for(let i=beads.length-1;i>=0;i--)if(beads[i].bone===bone)beads.splice(i,1);}
 // 이 뼈에서 이 자리 가까이 나던 피(상처·낙수)를 멎게 한다(잘린 자리에서 새 팔다리가 다 자랐을 때)
 function stopNear(bone,pW,r){if(!bone)return;bone.updateWorldMatrix(true,false);const lp=bone.worldToLocal(pW.clone()),r2=r*r;
  for(let i=wounds.length-1;i>=0;i--){const w=wounds[i];if(w.bone===bone&&w.lp.distanceToSquared(lp)<r2)wounds.splice(i,1);}
  for(let i=drips.length-1;i>=0;i--){const d=drips[i];if(d.bone===bone&&d.lp.distanceToSquared(lp)<r2*2.5)drips.splice(i,1);}}
 function clearDecalsNear(seg,pW,r,type='hole'){
  if(!E)return 0;const bone=E.bones[seg];if(!bone)return 0;bone.updateWorldMatrix(true,false);const lp=bone.worldToLocal(pW.clone());let removed=0;
  for(let i=decals.length-1;i>=0;i--){const m=decals[i];if(m.parent!==bone||(type&&m.userData.decal!==type)||!m.userData.center||m.userData.center.distanceToSquared(lp)>r*r)continue;m.removeFromParent();m.geometry.dispose();decals.splice(i,1);removed++;}
  return removed;
 }
 
 function reset(emp){
  E=emp;for(const k in parts)for(const d of parts[k])d.on=false;
  for(const b of bankList){b.mesh.removeFromParent();b.g.dispose();if(b.fade!=null)b.mesh.material.dispose();}bankList.length=0;fading.length=0;for(const key in banks)delete banks[key];
  rivs.length=0;drips.length=0;wounds.length=0;beads.length=0;
  for(const m of decals){m.removeFromParent();m.geometry.dispose();}decals.length=0;
for(const m of rims)m.removeFromParent();
rims.length=0;
  for(const l of lumps)l.mesh.removeFromParent();lumps.length=0;
  clearFloor();
  if(pnCtx&&pnSaved){pnCtx.clearRect(0,0,pnCanvas.width,pnCanvas.height);pnCtx.drawImage(pnSaved,0,0);WORLD.panelTex.needsUpdate=true;}
  SB.clear();lostRaw=0;heart=0;
 }
  // 부활 때는 무대에 남은 피 자국과 누적 출혈량은 보존하고,
 // 사라질 옛 몸에 매달린 자국과 출혈원만 정리한 뒤 새 몸으로 갈아탄다.
 function rebindKeepStage(emp){
  E=emp;
  for(const b of bankList){b.mesh.removeFromParent();b.g.dispose();if(b.fade!=null)b.mesh.material.dispose();}
  bankList.length=0;fading.length=0;for(const key in banks)delete banks[key];
  rivs.length=0;drips.length=0;wounds.length=0;beads.length=0;
  for(const m of decals){m.removeFromParent();m.geometry.dispose();}decals.length=0;
  for(const m of rims)m.removeFromParent();rims.length=0;
  for(const l of lumps)l.mesh.removeFromParent();lumps.length=0;
 }
 // 천지신명 정육공장: 걸어 둘 옛 몸의 자국·핏줄기는 그 몸에 붙인 채 남기고(더는 갱신하지 않는다) 출혈원만 끊고 새 몸으로 갈아탄다
 function handover(emp){
  E=emp;bankList.length=0;fading.length=0;for(const key in banks)delete banks[key];
  rivs.length=0;drips.length=0;wounds.length=0;beads.length=0;decals.length=0;rims.length=0;lumps.length=0;
 }
 /* 살이 찌그러지면 그 뼈에 붙은 피(자국·줄기·방울·상처 자리)도 같이 옮긴다. fn(v: 뼈 좌표 점)이 v를 옮기고 옮겼으면 true */
 const _ov=V3(),_ov0=V3(),_ovD=V3();
 function deformOverlays(bone,fn,bounds=null){
  // Long cuts follow the locally deformed skin. Moving an entire strip by its
  // centre's displacement leaves its other end suspended outside the face.
  for(const m of decals){if(m.parent!==bone||!m.userData.center)continue;
   if(bounds){if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();if(!bounds.intersectsBox(m.geometry.boundingBox))continue;}
   _ov.copy(m.userData.center);_ov0.copy(_ov);if(fn(_ov)){_ovD.subVectors(_ov,_ov0);m.userData.center.copy(_ov);if(m.userData.grow)m.userData.grow.center.add(_ovD);}
   const P=m.geometry.attributes.position;let changed=false;
   for(let i=0;i<P.count;i++){_ov.fromBufferAttribute(P,i);if(bounds&&!bounds.containsPoint(_ov))continue;if(fn(_ov)){P.setXYZ(i,_ov.x,_ov.y,_ov.z);if(m.geometry.boundingBox)m.geometry.boundingBox.expandByPoint(_ov);changed=true;}}
   if(changed){P.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();}}
  for(const b of bankList){if(b.bone!==bone||!b.pts)continue;let ch=false;
   for(let i=0;i<b.count;i++){const q=b.pts[i];_ov0.copy(q.p);if(fn(q.p)){ch=true;_ovD.subVectors(q.p,_ov0);const k=i*6;for(const o of [0,3]){b.P[k+o]+=_ovD.x;b.P[k+o+1]+=_ovD.y;b.P[k+o+2]+=_ovD.z;}}}
   if(ch){b.g.attributes.position.needsUpdate=true;b.g.computeBoundingSphere();}}
  for(const m of rims)if(m.parent===bone)fn(m.position);
  for(const l of lumps)if(l.bone===bone)fn(l.mesh.position);
  for(const x of beads)if(x.bone===bone)fn(x.lp);
  for(const x of drips)if(x.bone===bone)fn(x.lp);
  for(const x of rivs)if(x.bone===bone)fn(x.lp);
  for(const w of wounds)if(w.bone===bone){fn(w.lp);if(w.line){fn(w.line[0]);fn(w.line[1]);}}
 }
 return {spray,emit,startRiv,addWound,decal,rim,lump,project,paintFloor,paintPanel,clearSegment,detachTree,forgetTree,clearAbove,clearPlane,clearDecalsNear,stopNear,fadeSeg,deformOverlays,update,reset,rebindKeepStage,handover,screen:SB,get rawLost(){return lostRaw;},get lost(){return LOSTMAX*(1-Math.exp(-lostRaw/2.4));},get bleedRate(){let t=0;for(const w of wounds)t+=w.rate0*Math.exp(-w.age/w.tau);return t;},wounds,rivs};
})();
const SBLOOD=BLOOD.screen;
/* ===== 5-2. 맞은 자리 효과 =====
 * 닿는 순간 맞은 자리에 번쩍이는 충격 별, 총·칼에는 피 안개, 큰 타격에는 퍼지는 고리, 그리고 충격 글자(퍽! 빠악!).
 * 멈춤(히트스톱) 동안에도 움직이도록 실제 시간으로 돌린다. */
const FX=(()=>{
 const star=(fill0,fill1,line,spikes,inner)=>canvasTex(256,256,(g,w,h)=>{
  g.translate(128,128);const pts=[];
  for(let i=0;i<spikes*2;i++){const a=i/(spikes*2)*TAU-PI/2+rnd(-.05,.05),r=i%2?inner*rnd(.9,1.08):rnd(.8,1)*112;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}
  g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();
  g.lineJoin='round';g.lineWidth=11;g.strokeStyle=line;g.stroke();
  const gr=g.createRadialGradient(0,0,4,0,0,110);gr.addColorStop(0,'#ffffff');gr.addColorStop(.32,fill0);gr.addColorStop(1,fill1);g.fillStyle=gr;g.fill();
  g.fillStyle='#ffffff';g.beginPath();g.arc(0,0,inner*.62,0,TAU);g.fill();
 });
 const T={
  star:star('#fff6b8','#ffcf3a','#241c3a',12,52),
  // 칼·총에 맞은 자리: 파란 피가 튀는 별
  bl:star('#dceaff','#3b7bff','#0b1f5c',10,46),
  ring:canvasTex(128,128,(g)=>{g.strokeStyle='#ffffff';g.lineWidth=9;g.beginPath();g.arc(64,64,52,0,TAU);g.stroke();g.strokeStyle='rgba(255,236,170,.9)';g.lineWidth=3;g.beginPath();g.arc(64,64,42,0,TAU);g.stroke();}),
  mist:canvasTex(128,128,(g)=>{const gr=g.createRadialGradient(64,64,0,64,64,62);gr.addColorStop(0,'rgba(30,84,222,.72)');gr.addColorStop(.45,'rgba(26,74,204,.42)');gr.addColorStop(1,'rgba(20,60,180,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}),
  glint:canvasTex(64,64,(g)=>{g.translate(32,32);g.fillStyle='#ffffff';for(let i=0;i<4;i++){g.rotate(PI/2);g.beginPath();g.moveTo(0,-30);g.lineTo(4,0);g.lineTo(-4,0);g.closePath();g.fill();}g.beginPath();g.arc(0,0,6,0,TAU);g.fill();}),
 };
 // 충격 별·고리는 내 손보다 위에 그린다(따로 된 장면). 피 안개는 세상 안에서 몸에 가려지게
 const over=new THREE.Scene();
 const pool=[],live=[];
 function take(tex,top){
  let s=pool.pop();
  if(!s){s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));s.frustumCulled=false;}
  const m=s.material;m.map=T[tex];m.depthTest=!top;m.toneMapped=!top;m.blending=THREE.NormalBlending;m.opacity=1;m.color.setRGB(1,1,1);m.rotation=rnd(0,TAU);m.needsUpdate=true;
  s.renderOrder=top?30:12;s.visible=true;(top?over:scene).add(s);return s;
 }
 function add(tex,pos,o={}){
  // 피를 끄면 피 안개는 안 띄우고, 파란 충격 별은 흰 별로
  if(!PREF.blood){if(tex==='mist')return null;if(tex==='bl'){tex='star';o=Object.assign({},o,{color:'#ffffff'});}}
  const s=take(tex,o.top!==false);s.position.copy(pos);if(o.color)s.material.color.copy(col(o.color));
  live.push({s,age:0,life:o.life||.12,size:o.size||.2,grow:o.grow==null?.6:o.grow,vel:o.vel?o.vel.clone():null,drag:o.drag||0,fade:o.fade||3,start:o.start==null?.75:o.start});
  if(live.length>60){const x=live.shift();x.s.removeFromParent();pool.push(x.s);}
  return s;
 }
 // 맞은 면에서 카메라 쪽으로 살짝 띄운 자리
 const _p=V3();
 function lift(pt,n,d=.03){return _p.copy(pt).addScaledVector(n,d);}
 /* 충격 글자: 화면 좌표에 띄운다 */
 const layer=$('#fxtext');let lastWord=-9,clock=0;
 function word(text,pos,o={}){
  if(G.mode==='fight')return;
  if(!layer)return;if(!o.force&&clock-lastWord<.15)return;lastWord=clock;
  const p=pos.clone().project(camera);if(p.z>1)return;
  const W=innerWidth,H=innerHeight;
  const x=clamp((p.x*.5+.5)*W+rnd(-26,26)+(o.dx||0),40,W-40),y=clamp((-p.y*.5+.5)*H+rnd(-46,-16)+(o.dy||0),90,H-150);
  wordAt(text,x,y,o);
 }
 // 화면 좌표에 바로 띄우는 충격 글자(이야기 장면처럼 3D 밖에서 칠 때). parent를 주면 그 안에 띄운다
 function wordAt(text,x,y,o={}){
  if(G.mode==='fight')return;
  const host=o.parent||layer;if(!host)return;const W=innerWidth,H=innerHeight;
  const el=document.createElement('div');el.className='pop';
  const sz=(o.size||48)*clamp(Math.min(W,H)/390,.85,1.35)*(o.parent?1:clamp(Math.sqrt(CAM.unit/.49),.8,1)),dur=o.dur||.58,shc=o.color||'#d8352a';
  el.style.cssText=`left:${x}px;top:${y}px;font-size:${sz}px;--sh:${shc};--r:${(o.rot!=null?o.rot:rnd(-11,11)).toFixed(1)}deg;--sw:${Math.max(4,sz*.11).toFixed(1)}px;--ox:${(sz*.11).toFixed(0)}px;--oy:${(sz*.13).toFixed(0)}px;--d:${dur}s`;
  // 한 글자씩: 흔들린 각도·세로 지터로 손으로 쓴 느낌 + 끝에 바깥으로 흩어진다
  const chars=[...text];
  for(let i=0;i<chars.length;i++){const sp=document.createElement('i');sp.textContent=chars[i];
   const ang=rnd(0,TAU),dist=sz*rnd(.5,1.15);
   sp.style.cssText=`--lr:${rnd(-9,9).toFixed(1)}deg;--ls:${rnd(-45,45).toFixed(0)}deg;--lj:${rnd(-.07,.07)*sz|0}px;--lx:${(Math.cos(ang)*dist)|0}px;--ly:${(Math.sin(ang)*dist-sz*.35)|0}px;animation-delay:${(i*.02).toFixed(3)}s`;
   el.appendChild(sp);}
  host.appendChild(el);if(host===layer)while(layer.childElementCount>3)layer.firstElementChild.remove();
  setTimeout(()=>el.remove(),dur*1000+160);
 }
 function update(dt){
  clock+=dt;
  for(let i=live.length-1;i>=0;i--){const f=live[i];f.age+=dt;const t=f.age/f.life;
   if(t>=1){f.s.removeFromParent();f.s.visible=false;pool.push(f.s);live.splice(i,1);continue;}
   if(f.vel){f.s.position.addScaledVector(f.vel,dt);f.vel.multiplyScalar(Math.exp(-f.drag*dt));}
   const sc=f.size*(f.start+f.grow*easeOut(t));f.s.scale.set(sc,sc,1);
   f.s.material.opacity=1-Math.pow(t,f.fade);
  }
 }
 function clear(){for(const f of live){f.s.removeFromParent();f.s.visible=false;pool.push(f.s);}live.length=0;if(layer)layer.textContent='';}
 return {add,lift,word,wordAt,update,clear,scene:over};
})();
/* ===== 5-3. 동전 =====
 * 돼지저금통(배)에서 쏟아지는 금화(福)와 엽전(常平通寶). 종류마다 메시 하나(인스턴스)로 그린다.
 * 튀어나와 떨어지고, 바닥에서 짤랑 튀다가 눕는다. */
const COINS=(()=>{
 const R=.03,TH=.0066,N=240;
 // 왼쪽 반은 앞뒷면, 오른쪽 반은 옆 테
 const tex=gold=>canvasTex(256,128,(g,w,h)=>{
  const cx=64,cy=64;
  const base=g.createRadialGradient(cx-18,cy-20,6,cx,cy,64);
  if(gold){base.addColorStop(0,'#fff3b0');base.addColorStop(.5,'#f1c24a');base.addColorStop(1,'#b8811c');}
  else{base.addColorStop(0,'#f3cf86');base.addColorStop(.55,'#c9913f');base.addColorStop(1,'#8a5a22');}
  g.fillStyle=base;g.fillRect(0,0,128,128);
  g.lineWidth=7;g.strokeStyle=gold?'#a8741a':'#7a4b1a';g.beginPath();g.arc(cx,cy,56,0,TAU);g.stroke();
  g.lineWidth=2.5;g.strokeStyle=gold?'#fff0a0':'#f0c47a';g.beginPath();g.arc(cx,cy,50,0,TAU);g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=gold?'#8a5a10':'#5e3812';
  const font=px=>`bold ${px}px "Noto Serif KR","Noto Serif CJK KR","Gowun Batang","Nanum Myeongjo",serif`;
  if(gold){g.font=font(64);g.fillText('福',cx,cy+3);for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.arc(cx+Math.cos(a)*44,cy+Math.sin(a)*44,2.4,0,TAU);g.fill();}}
  else{g.fillStyle='#2a1a0c';g.fillRect(cx-13,cy-13,26,26);g.lineWidth=3;g.strokeStyle='#f0c47a';g.strokeRect(cx-16,cy-16,32,32);
   g.fillStyle='#5e3812';g.font=font(27);[['常',0,-31],['平',0,31],['通',31,0],['寶',-31,0]].forEach(([c,x,y])=>g.fillText(c,cx+x,cy+y+1));}
  // 옆 테: 금화는 톱니, 엽전은 매끈
  const eg=g.createLinearGradient(0,0,0,128);eg.addColorStop(0,gold?'#fff0a0':'#e8b870');eg.addColorStop(.5,gold?'#d9a032':'#a8702e');eg.addColorStop(1,gold?'#9a6a14':'#6e4418');g.fillStyle=eg;g.fillRect(128,0,128,128);
  if(gold){g.fillStyle='rgba(110,70,8,.55)';for(let x=128;x<256;x+=4)g.fillRect(x,0,1.6,128);}
 });
 const geo=(()=>{
  const seg=24,pos=[],nor=[],uv=[],idx=[];let v=0;
  for(const side of [1,-1]){const y=side*TH/2,c=v;pos.push(0,y,0);nor.push(0,side,0);uv.push(.25,.5);v++;
   for(let i=0;i<=seg;i++){const a=i/seg*TAU,x=Math.cos(a),z=Math.sin(a);pos.push(x*R,y,z*R);nor.push(0,side,0);uv.push(.25+x*.24*side,.5-z*.48);v++;}
   for(let i=0;i<seg;i++){if(side>0)idx.push(c,c+2+i,c+1+i);else idx.push(c,c+1+i,c+2+i);}}
  const s0=v;for(let i=0;i<=seg;i++){const a=i/seg*TAU,x=Math.cos(a),z=Math.sin(a);for(const yy of [TH/2,-TH/2]){pos.push(x*R,yy,z*R);nor.push(x,0,z);uv.push(.5+i/seg*.5,yy>0?1:0);v++;}}
  for(let i=0;i<seg;i++){const a=s0+i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
 })();
 const mats=[STD('#ffffff',{map:tex(true),metalness:.72,roughness:.3,emissive:col('#4a3000'),emissiveIntensity:.32,envMapIntensity:.8}),STD('#ffffff',{map:tex(false),metalness:.6,roughness:.38,emissive:col('#2a1804'),emissiveIntensity:.2,envMapIntensity:.7})];
 if(ENV)for(const m of mats)m.envMap=ENV;
 const meshes=mats.map(m=>{const im=new THREE.InstancedMesh(geo,m,N);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;im.count=0;scene.add(im);return im;});
 const lists=[[],[]],dummy=new THREE.Object3D(),_q=new THREE.Quaternion(),_ax=V3(),_up=V3(),_e=new THREE.Euler();
 function spawn(p,v,type=0){
  const L=lists[type];let c;
  if(L.length<N){c={p:V3(),v:V3(),q:new THREE.Quaternion(),w:V3(),rest:false,b:0,flat:null};L.push(c);}
  else{c=L.find(x=>x.rest)||L[0];L.splice(L.indexOf(c),1);L.push(c);c.rest=false;c.b=0;c.flat=null;}
  c.p.copy(p);c.v.copy(v);c.q.setFromEuler(_e.set(rnd(0,TAU),rnd(0,TAU),rnd(0,TAU)));c.w.set(rnd(-22,22),rnd(-14,14),rnd(-22,22));
  meshes[type].count=L.length;return c;
 }
 // 배 속에 쌓인 동전처럼 그냥 붙여 두는 한 닢
 function make(type,parent){const m=new THREE.Mesh(geo,mats[type]);m.castShadow=false;m.userData.noHit=true;m.userData.sharedGeo=true;if(parent)parent.add(m);return m;}
 function update(dt){
  if(dt<=0)return;const h=Math.min(dt,.033);
  for(let k=0;k<2;k++){const L=lists[k],im=meshes[k];if(!L.length)continue;
   for(let i=0;i<L.length;i++){const c=L[i];
    if(!c.rest){
     c.v.y-=9.8*h;c.p.addScaledVector(c.v,h);
     const wl=c.w.length();if(wl>1e-4){_q.setFromAxisAngle(_ax.copy(c.w).divideScalar(wl),wl*h);c.q.premultiply(_q);}
     _up.set(0,1,0).applyQuaternion(c.q);const cy=Math.abs(_up.y),fy=Math.abs(c.p.x)<.56&&c.p.z<-.54&&c.p.z>-1.14?.485:0,low=fy+R*Math.sqrt(Math.max(0,1-cy*cy))+TH/2*cy;
     if(c.p.y<low){c.p.y=low;
      if(c.v.y<0){const imp=-c.v.y;c.v.y=imp*.34;c.v.x*=.55;c.v.z*=.55;c.w.multiplyScalar(.55);c.b++;if(imp>.6)AUDIO.coin(clamp(imp/3,.25,1));}
      if((imp_small(c))||c.b>5){if(!c.flat){_e.setFromQuaternion(c.q,'YXZ');c.flat=new THREE.Quaternion().setFromEuler(_e.set(_up.y>=0?0:PI,_e.y,0,'YXZ'));}}
     }
     if(c.flat){c.q.slerp(c.flat,1-Math.exp(-h*16));c.w.multiplyScalar(Math.exp(-h*10));c.v.x*=Math.exp(-h*6);c.v.z*=Math.exp(-h*6);if(c.p.y<=fy+TH/2+.0015&&c.q.angleTo(c.flat)<.03){c.q.copy(c.flat);c.p.y=fy+TH/2;c.rest=true;}}
    }
    dummy.position.copy(c.p);dummy.quaternion.copy(c.q);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);
   }
   im.count=L.length;im.instanceMatrix.needsUpdate=true;
  }
 }
 function imp_small(c){return Math.abs(c.v.y)<.35&&c.v.x*c.v.x+c.v.z*c.v.z<.09;}
 function clear(){for(let k=0;k<2;k++){lists[k].length=0;meshes[k].count=0;}}
 return {spawn,make,update,clear,get count(){return lists[0].length+lists[1].length;}};
})();
/* ===== 5-4. 살점 =====
 * 총알·창이 파낸 살덩이. 한쪽 면은 겉(살갗·옷 색), 나머지는 속살(파란 피에 젖은 보랏빛 살·기름 결).
 * 튀어나가 바닥에 철퍽 떨어지고 구르다 멈춘다. 떨어진 자리에 파란 피가 번진다. */
const CHUNKS=(()=>{
 const N=160;
 const geo=(()=>{const g=new THREE.SphereGeometry(1,12,9),P=g.attributes.position,side=new Float32Array(P.count),v=V3();
  for(let i=0;i<P.count;i++){v.set(P.getX(i),P.getY(i),P.getZ(i));
   const nz=1+.22*Math.sin(v.x*5.1+1.3)*Math.sin(v.y*4.3+.7)+.16*Math.sin(v.z*6.7+2.1)+.1*Math.sin((v.x+v.z)*9.3);
   v.multiplyScalar(nz);
   // 겉면: 위쪽을 납작하게(살갗 한 겹)
   if(v.y>.38){v.y=.38+(v.y-.38)*.22;}
   P.setXYZ(i,v.x*1.15,v.y*.82,v.z);side[i]=smooth((v.y-.18)/.18);}
  g.setAttribute('aSide',new THREE.BufferAttribute(side,1));g.computeVertexNormals();return g;})();
 const mat=STD('#ffffff',{roughness:.34});
 const MEAT=FLESH.MEAT;
 mat.onBeforeCompile=sh=>{
  sh.uniforms.uDeep={value:MEAT.deep};sh.uniforms.uMid={value:MEAT.mid};sh.uniforms.uHi={value:MEAT.hi};sh.uniforms.uFat={value:MEAT.fat};sh.uniforms.uBlue={value:MEAT.soak};
  sh.vertexShader='attribute float aSide;\nvarying float vSide;\nvarying vec3 vCP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSide=aSide;vCP=position;');
  sh.fragmentShader='varying float vSide;\nvarying vec3 vCP;\nuniform vec3 uDeep,uMid,uHi,uFat,uBlue;\nfloat ch3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}\nfloat cn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(ch3(i),ch3(i+vec3(1,0,0)),f.x),mix(ch3(i+vec3(0,1,0)),ch3(i+vec3(1,1,0)),f.x),f.y),mix(mix(ch3(i+vec3(0,0,1)),ch3(i+vec3(1,0,1)),f.x),mix(ch3(i+vec3(0,1,1)),ch3(i+vec3(1,1,1)),f.x),f.y),f.z);}\n'+
   sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {float a=cn3(vCP*3.1),b=cn3(vCP*7.3+2.);vec3 meat=mix(uMid,uHi,smoothstep(.35,.8,a));meat=mix(meat,uFat,smoothstep(.66,.74,b)*.7);meat=mix(meat,uDeep,smoothstep(.2,-.6,vCP.y)*.6);meat=mix(meat,uBlue*.7,smoothstep(.55,.9,cn3(vCP*2.+5.))*.45);
  float rim=smoothstep(.0,.25,vSide)*(1.-smoothstep(.45,.8,vSide));
  diffuseColor.rgb=mix(meat,diffuseColor.rgb,vSide);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.,.92,.88),rim*.6);}`).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(.16,roughnessFactor,vSide);');
 };
 mat.customProgramCacheKey=()=>'chunk1';
 const im=new THREE.InstancedMesh(geo,mat,N);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;im.count=0;
 im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);scene.add(im);
 const L=[],dummy=new THREE.Object3D(),_q=new THREE.Quaternion(),_ax=V3(),_c=new THREE.Color();let cur=0;
 // 겉 색: 살·옷·바지·도마뱀·머리카락
 const OUTER={skin:'#e9a27f',cloth:'#f2ead8',belly:'#e3ebf5',trouser:'#eee3cc',liz:'#5f8f1f',hair:'#2a2020',tie:'#8c1220'};
 function spawn(p,v,size,outer='skin'){
  let c;if(L.length<N){c={p:V3(),v:V3(),q:new THREE.Quaternion(),w:V3(),s:1,rest:false,landed:false,age:0,i:L.length};L.push(c);}else{c=L[cur%N];cur++;}
  c.p.copy(p);c.v.copy(v);c.q.setFromEuler(new THREE.Euler(rnd(0,TAU),rnd(0,TAU),rnd(0,TAU)));c.w.set(rnd(-18,18),rnd(-18,18),rnd(-18,18));
  c.s=size;c.sy=size*rnd(.6,1);c.sz=size*rnd(.75,1.15);c.rest=false;c.landed=false;c.age=0;c.slide=0;
  _c.copy(col(OUTER[outer]||outer));im.setColorAt(c.i,_c);im.instanceColor.needsUpdate=true;
  im.count=L.length;return c;
 }
 // 맞은 자리에서 살점 여러 개
 function burst(p,n,dir,size,outer,o={}){
  for(let i=0;i<n;i++){const s=size*rnd(.55,1.1),v=V3().copy(n_(dir)).multiplyScalar(rnd(1.2,2.8)*(o.speed||1)).add(V3(rnd(-1,1),rnd(.3,1.6),rnd(-.6,.6)));
   if(o.back)v.addScaledVector(o.back,rnd(.5,1.5));spawn(V3().copy(p).addScaledVector(n_(dir),s*.6).add(V3(rnd(-.01,.01),rnd(-.01,.01),rnd(-.01,.01))),v,s,outer);}
 }
 const _n=V3();function n_(d){return _n.copy(d);}
 function update(dt){
  if(dt<=0||!L.length)return;const h=Math.min(dt,.033);
  for(const c of L){c.age+=h;
   if(!c.rest){c.v.y-=9.8*h;c.p.addScaledVector(c.v,h);const wl=c.w.length();if(wl>1e-4){_q.setFromAxisAngle(_ax.copy(c.w).divideScalar(wl),wl*h);c.q.premultiply(_q);}
    // 옥좌 앉는 판 위(옥좌 쪽으로 날아간 것)
    const fy=Math.abs(c.p.x)<.56&&c.p.z<-.54&&c.p.z>-1.14?.485:0,low=fy+c.s*.42;
    if(c.p.y<low){c.p.y=low;
     if(c.v.y<0){const imp=-c.v.y;
      if(!c.landed){c.landed=true;if(PREF.blood)BLOOD.paintFloor(c.p.x,c.p.z,c.s*c.s*28,imp*1.4);if(imp>1.2)AUDIO.slap(clamp(imp/4,.2,.9),c.s);}
      c.v.y=imp*.16;c.v.x*=.45;c.v.z*=.45;c.w.multiplyScalar(.4);}
     if(Math.abs(c.v.y)<.25&&c.v.x*c.v.x+c.v.z*c.v.z<.02){c.rest=true;c.v.set(0,0,0);}}
   }
   // 오래된 것은 천천히 오그라들어 사라진다
   let s=c.s;if(c.age>12)s*=Math.max(0,1-(c.age-12)/2);
   dummy.position.copy(c.p);dummy.quaternion.copy(c.q);dummy.scale.set(s,c.sy*(s/c.s||0),c.sz*(s/c.s||0));dummy.updateMatrix();im.setMatrixAt(c.i,dummy.matrix);
  }
  im.instanceMatrix.needsUpdate=true;im.visible=PREF.blood!==false||true;
 }
 function clear(){L.length=0;cur=0;im.count=0;}
 return {spawn,burst,update,clear,get count(){return L.length;}};
})();
/* ===== 6. 운명 설계자 — 모양 =====
 * 동서양 신을 섞은 운명의 주인. 겉은 흰 비단 예복·면류관·금관·후광, 속은 와이셔츠와 넥타이를 맨 부자, 더 속은 파충류. */
/* 옷감 무늬: 흰 비단 + 금실 구름 + 보랏빛 구슬 */
function drawCloud(g,cx,cy,s,dark,light){
 const curl=(x,y,r,a0,a1)=>{g.beginPath();g.arc(x,y,r,a0,a1);g.stroke();};
 for(const [lw,c] of [[7*s,dark],[2.6*s,light]]){
  g.strokeStyle=c;g.lineWidth=lw;
  curl(cx,cy,13*s,.25,5.8);curl(cx+19*s,cy+4*s,8.5*s,3.5,8.6);curl(cx-17*s,cy+6*s,7*s,-2.4,2.6);
  g.beginPath();g.moveTo(cx-30*s,cy+19*s);g.bezierCurveTo(cx-10*s,cy+30*s,cx+16*s,cy+26*s,cx+38*s,cy+14*s);g.stroke();
 }
}
const ROBE_TEX=canvasTex(1024,1024,(g,w,h)=>{
 const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#fbf6ea');gr.addColorStop(.5,'#f1e7d2');gr.addColorStop(1,'#f8f0df');g.fillStyle=gr;g.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=4){g.fillStyle=`rgba(255,255,255,${y%8?.12:.22})`;g.fillRect(0,y,w,1.4);}
 for(let x=0;x<w;x+=5){g.fillStyle='rgba(150,112,40,.04)';g.fillRect(x,0,1.2,h);}
 g.lineCap='round';g.lineJoin='round';
 for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=(c+.25+(r%2)*.5)*w/5,y=(r+.5)*h/6;drawCloud(g,x,y,1.45,'rgba(176,116,12,.95)','#ffd45a');}
 for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=(c+.75+(r%2)*.5)*w/5,y=(r+1)*h/6;g.fillStyle='#6a45ba';g.beginPath();g.arc(x,y,9,0,TAU);g.fill();g.strokeStyle='#dda42a';g.lineWidth=3.5;g.beginPath();g.arc(x,y,14,0,TAU);g.stroke();}
},{repeat:[2,2]});
const HEM_TEX=canvasTex(512,512,(g,w,h)=>{
 g.drawImage(ROBE_TEX.userData.canvas,0,0,w,h);
 const top=h*.62;
 const cols=['#5b3ea6','#e3a923','#fbf7ee','#8b6bd2','#e3a923','#5b3ea6','#fbf7ee','#c7952a'];
 g.save();g.beginPath();g.rect(0,top,w,h-top);g.clip();
 for(let i=-20;i<40;i++){g.fillStyle=cols[(i+40)%cols.length];g.beginPath();g.moveTo(i*22,h);g.lineTo(i*22+22,h);g.lineTo(i*22+22+120,top);g.lineTo(i*22+120,top);g.closePath();g.fill();}
 g.restore();
 g.fillStyle='#fbf7ee';g.strokeStyle='#5b3ea6';g.lineWidth=5;
 for(let x=0;x<w+40;x+=46){g.beginPath();g.arc(x,top+4,24,PI,0);g.fill();g.stroke();g.beginPath();g.arc(x+6,top+6,12,PI,0);g.stroke();}
 g.fillStyle='#4a2f8f';g.fillRect(0,h-14,w,14);g.fillStyle='#f1c45a';g.fillRect(0,h-18,w,4);
});
const TRIM_TEX=canvasTex(256,64,(g,w,h)=>{g.fillStyle='#55389e';g.fillRect(0,0,w,h);g.strokeStyle='#f3c85e';g.lineWidth=4;g.strokeRect(2,6,w-4,h-12);g.lineWidth=3;for(let x=10;x<w;x+=28){g.beginPath();g.moveTo(x,h-18);g.lineTo(x,18);g.lineTo(x+14,18);g.lineTo(x+14,h-26);g.lineTo(x+7,h-26);g.stroke();}},{repeat:[4,1]});

/* 문양: 삼각형 속 눈(서양), 오행(동양: 다섯 빛 구슬과 별) — 단위는 그리는 쪽이 정한다 */
function drawEyeTri(g,x,y,s,o={}){
 const h=s,w=s*1.155;
 g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';
 if(o.rays){g.strokeStyle=o.rays;g.lineWidth=s*.06;for(let i=0;i<14;i++){const a=-PI/2+(i-6.5)/14*PI*1.5,r0=s*.62,r1=s*(i%2?.82:.95);g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0+h*.05);g.lineTo(Math.cos(a)*r1,Math.sin(a)*r1+h*.05);g.stroke();}}
 g.beginPath();g.moveTo(0,-h*.62);g.lineTo(w/2,h*.38);g.lineTo(-w/2,h*.38);g.closePath();
 if(o.fill){g.fillStyle=o.fill;g.fill();}
 g.lineWidth=s*.13;g.strokeStyle=o.edge||'#3a2410';g.stroke();g.lineWidth=s*.07;g.strokeStyle=o.gold||'#ffd45e';g.stroke();
 const ew=w*.3,eh=h*.13,ey=h*.07;
 g.beginPath();g.moveTo(-ew,ey);g.quadraticCurveTo(0,ey-eh*2,ew,ey);g.quadraticCurveTo(0,ey+eh*2,-ew,ey);g.closePath();
 g.fillStyle=o.white||'#fffdf6';g.fill();g.lineWidth=s*.05;g.strokeStyle=o.edge||'#3a2410';g.stroke();
 g.fillStyle=o.iris||'#5b3ea6';g.beginPath();g.arc(0,ey,eh*.92,0,TAU);g.fill();
 g.fillStyle='#120c1a';g.beginPath();g.arc(0,ey,eh*.42,0,TAU);g.fill();
 g.restore();
}
function drawOhaeng(g,x,y,r,o={}){
 g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';
 const P=[];for(let i=0;i<5;i++){const a=-PI/2+i*TAU/5;P.push([Math.cos(a)*r*.74,Math.sin(a)*r*.74]);}
 g.strokeStyle=o.edge||'#3a2410';g.lineWidth=r*.22;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
 g.strokeStyle=o.gold||'#ffd45e';g.lineWidth=r*.12;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
 g.lineWidth=r*.09;g.beginPath();for(let i=0;i<=5;i++){const p=P[(i*2)%5];i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.stroke();
 const C=['#3e9b4f','#e0362b','#e6b021','#f6f2e8','#2c55a8'];
 P.forEach((p,i)=>{g.fillStyle=C[i];g.beginPath();g.arc(p[0],p[1],r*.21,0,TAU);g.fill();g.lineWidth=r*.07;g.strokeStyle=o.edge||'#3a2410';g.stroke();});
 g.restore();
}

/* 배·가슴: 예복 앞섶이 벌어져 속에 입은 하늘색 와이셔츠(배에서는 단추가 당겨짐)가 보이고, 섶 가장자리로 보라 영대(눈·오행 문양)가 내려온다.
 * 공에 감기는 그림이라 위도마다 가로로 늘여 그린다(가운데 세로줄 = 정면). R: 가로 둘레 반지름, Rm: 세로 둘레 반지름, half: 위도(도)별 셔츠 반폭(m) */
function paintOpening(g,w,h,o){
 const src=o.source||ROBE_TEX.userData.canvas;
 for(let i=0;i<2;i++)for(let j=0;j<2;j++)g.drawImage(src,i*w/2,j*h/2,w/2,h/2);
 const PX=w/(TAU*o.R),PY=h/(PI*o.Rm),cx=w*.25;
 const th=y=>y/h*PI,sn=y=>Math.max(.16,Math.sin(th(y)));
 const X=(y,m)=>cx+m*PX/sn(y),half=y=>o.half(th(y)*180/PI);
 const SW=o.sw,ys=[];for(let y=0;y<=h;y+=3)ys.push(y);
 const band=(m0,m1,fill)=>{g.beginPath();ys.forEach((y,i)=>{const x=X(y,m0(y));i?g.lineTo(x,y):g.moveTo(x,y);});for(let i=ys.length-1;i>=0;i--)g.lineTo(X(ys[i],m1(ys[i])),ys[i]);g.closePath();g.fillStyle=fill;g.fill();};
 const line=(m,col_,lw)=>{g.beginPath();ys.forEach((y,i)=>{const x=X(y,m(y));i?g.lineTo(x,y):g.moveTo(x,y);});g.strokeStyle=col_;g.lineWidth=lw;g.stroke();};
 // 셔츠: 하늘색 + 가는 세로 줄무늬 + 가운데 단춧단
 band(y=>-half(y)-.004,y=>half(y)+.004,o.shirt||'#cfe1f5');
 for(let m=-.1;m<=.1;m+=.0105)line(y=>clamp(m,-half(y),half(y)),'rgba(112,146,202,.45)',1.6);
 band(y=>-.012,y=>.012,o.placket||'#d9e8f8');line(()=>-.012,'rgba(96,128,182,.6)',2);line(()=>.012,'rgba(96,128,182,.6)',2);
 // 단추: 배에 당겨져 단추 사이가 벌어지려 한다
 for(const deg of o.buttons||[]){
  const y=deg/180*h,s=sn(y),bx=X(y,0),k=PX/s;
  g.strokeStyle='rgba(78,108,160,.6)';g.lineWidth=2.4;g.lineCap='round';
  for(const sd of [-1,1]){g.beginPath();g.moveTo(bx+sd*.009*k,y-3);g.quadraticCurveTo(bx+sd*.03*k,y-14,bx+sd*.05*k,y-6);g.stroke();g.beginPath();g.moveTo(bx+sd*.009*k,y+3);g.quadraticCurveTo(bx+sd*.03*k,y+14,bx+sd*.05*k,y+6);g.stroke();}
  g.fillStyle='rgba(60,80,120,.85)';g.beginPath();g.ellipse(bx,y,.0028*k,10,0,0,TAU);g.fill();
  g.fillStyle='#fbfaf5';g.beginPath();g.ellipse(bx,y,.0072*k,.0072*PY,0,0,TAU);g.fill();g.lineWidth=2;g.strokeStyle='#8a94a6';g.stroke();
  g.fillStyle='#7b8496';for(const d of [-1,1]){g.beginPath();g.ellipse(bx+d*.0022*k,y,.0012*k,.0012*PY,0,0,TAU);g.fill();}
 }
 // 앞섶 그림자 + 보라 영대(금테) + 문양(눈과 오행이 번갈아)
 for(const sd of [-1,1]){
  band(y=>sd*(half(y)+SW),y=>sd*(half(y)+SW+.012),'rgba(90,60,20,.16)');
  band(y=>sd*half(y),y=>sd*(half(y)+SW),o.stole||'#4f3399');
  line(y=>sd*(half(y)+.0035),'#f2c34c',5);line(y=>sd*(half(y)+SW-.0035),'#f2c34c',5);
  line(y=>sd*(half(y)+.008),'rgba(255,236,170,.5)',1.5);line(y=>sd*(half(y)+SW-.008),'rgba(255,236,170,.5)',1.5);
  (o.syms||[]).forEach((deg,i)=>{const y=deg/180*h,s=sn(y),mx=sd*(half(y)+SW/2);
   g.save();g.translate(X(y,mx),y);g.scale(PX/s,PY);
   if((i+(o.symShift||0)+(sd>0?1:0))%2===0)drawEyeTri(g,0,0,SW*.62,{fill:'#6c4cc0',edge:'#2a1650',gold:'#ffd45e'});else drawOhaeng(g,0,0,SW*.29,{edge:'#2a1650',gold:'#ffd45e'});
   g.restore();});
 }
}
const BELLY_TEX=canvasTex(1536,768,(g,w,h)=>paintOpening(g,w,h,{R:.335,Rm:.31,sw:.052,half:d=>.05+.045*clamp((d-18)/92,0,1),buttons:[44,61,78,95,111],syms:[34,56,78,100]}));
const CHEST_TEX=canvasTex(1024,512,(g,w,h)=>paintOpening(g,w,h,{R:.27,Rm:.22,sw:.05,half:d=>.024+.026*clamp((d-40)/50,0,1),syms:[76],symShift:1}));
/* 넥타이: 진홍 바탕 + 금·남색 사선 줄무늬 */
const TIE_TEX=canvasTex(128,512,(g,w,h)=>{
 g.fillStyle='#8c1220';g.fillRect(0,0,w,h);
 g.save();g.rotate(-PI/4);for(let k=-20;k<30;k++){const y=k*34;g.fillStyle='#e0a832';g.fillRect(-400,y,1200,6);g.fillStyle='#17204a';g.fillRect(-400,y+11,1200,6);}g.restore();
 const sh=g.createLinearGradient(0,0,w,0);sh.addColorStop(0,'rgba(0,0,0,.18)');sh.addColorStop(.45,'rgba(255,255,255,.12)');sh.addColorStop(1,'rgba(0,0,0,.2)');g.fillStyle=sh;g.fillRect(0,0,w,h);
});
/* 면판 윗면: 짙은 주칠 바탕에 금 회문 테두리와 구름무늬, 옻칠 결. 카메라가 위에서 내려다보는 자리라 맨 붉은 판이면 납작한 주황 종이처럼 보였다 */
const BOARD_TOP_TEX=canvasTex(512,320,(g,w,h)=>{
 const base=g.createRadialGradient(w*.45,h*.4,20,w*.5,h*.5,w*.62);base.addColorStop(0,'#5c1513');base.addColorStop(.6,'#43100f');base.addColorStop(1,'#2a0809');g.fillStyle=base;g.fillRect(0,0,w,h);
 for(let i=0;i<900;i++){const y=Math.random()*h;g.fillStyle=i%2?'rgba(255,200,170,.025)':'rgba(0,0,0,.05)';g.fillRect(0,y,w,1+Math.random()*1.5);}
 g.strokeStyle='#b48a3e';g.lineWidth=6;g.strokeRect(14,14,w-28,h-28);g.lineWidth=2;g.strokeRect(28,28,w-56,h-56);
 // 회문(번개무늬) 띠
 g.strokeStyle='rgba(196,152,72,.85)';g.lineWidth=2.2;
 const fret=(x,y,dx,dy,n)=>{for(let i=0;i<n;i++){const px=x+dx*i,py=y+dy*i;g.beginPath();g.moveTo(px,py+7);g.lineTo(px,py);g.lineTo(px+7,py);g.lineTo(px+7,py+5);g.lineTo(px+3,py+5);g.lineTo(px+3,py+3);g.stroke();}};
 fret(38,36,13,0,34);fret(38,h-46,13,0,34);
 for(let r=0;r<2;r++)for(let c=0;c<3;c++)drawCloud(g,(c+.5)*w/3+(r%2?20:-20),h*(.38+r*.26),1.15,'rgba(120,40,24,.9)','rgba(201,156,78,.75)');
 const sheen=g.createLinearGradient(0,0,w,h);sheen.addColorStop(0,'rgba(255,230,200,0)');sheen.addColorStop(.42,'rgba(255,230,200,.07)');sheen.addColorStop(.5,'rgba(255,230,200,0)');g.fillStyle=sheen;g.fillRect(0,0,w,h);
});
/* 금관 정면 문양: 빛살 + 삼각형 속 눈 */
const CROWN_EYE_TEX=canvasTex(128,128,(g,w,h)=>{drawEyeTri(g,64,70,78,{fill:'#f3c24c',edge:'#5a3a08',gold:'#fff0a8',iris:'#5b3ea6',rays:'#ffd86a'});});
/* 파충류 눈(금빛 홍채 + 세로로 찢어진 동공): 결과 화면 도사와 같은 색 */
const REP_IRIS_TEX=canvasTex(256,256,(g,w,h)=>{
 const r=g.createRadialGradient(128,128,12,128,128,124);r.addColorStop(0,'#654715');r.addColorStop(.37,'#b18735');r.addColorStop(.7,'#a56d1a');r.addColorStop(.91,'#5e471b');r.addColorStop(1,'#252415');g.fillStyle=r;g.fillRect(0,0,w,h);
 for(let i=0;i<240;i++){const a=i/240*TAU,j=.5+.5*Math.sin(i*87.43),r0=22+j*24,r1=100+j*22;g.strokeStyle=i%3?'rgba(229,194,95,.36)':'rgba(42,29,8,.65)';g.lineWidth=.6+j;g.beginPath();g.moveTo(128+Math.cos(a)*r0,128+Math.sin(a)*r0);g.quadraticCurveTo(128+Math.cos(a+.015)*72,128+Math.sin(a+.015)*72,128+Math.cos(a)*r1,128+Math.sin(a)*r1);g.stroke();}
 g.fillStyle='#080b09';g.beginPath();g.moveTo(128,10);g.bezierCurveTo(148,85,148,176,128,246);g.bezierCurveTo(108,176,108,85,128,10);g.fill();
});
// The rebuilt face keeps the original gold iris and vertical pupil.
const REP_HEAD_IRIS_TEX=REP_IRIS_TEX;
/* 도마뱀 살갗(이어 붙는 비늘). 쓰는 곳마다 비늘 크기가 맞게 반복 횟수만 다른 복사본을 쓴다 */
const REPTILE_MAPS=(()=>{
 const maps={},size=512,cols=12,rows=16,cw=size/cols,ch=size/rows;
 const hash=(a,b)=>{const x=Math.sin(a*127.1+b*311.7+31.9)*43758.5453;return x-Math.floor(x);};
 for(const kind of ['color','height','rough'])maps[kind]=canvasTex(size,size,(g,w,h)=>{
  g.fillStyle=kind==='color'?'#182621':kind==='height'?'#202020':'#dddddd';g.fillRect(0,0,w,h);
  for(let row=-1;row<=rows;row++)for(let col=-1;col<=cols;col++){
   const id=((col%cols)+cols)%cols,j=((row%rows)+rows)%rows,r=hash(id,j),x=(col+(row%2)*.5)*cw,y=row*ch;
   const broad=.86+r*.12,points=[[-.46,-.3],[-.19,-.49],[.22,-.44],[.47,-.21],[.4,.2],[.05,.52],[-.37,.27]];
   g.save();g.translate(x,y);g.scale(broad,1);
   g.beginPath();points.forEach(([px,py],i)=>{i?g.lineTo(px*cw,py*ch):g.moveTo(px*cw,py*ch)});g.closePath();
   const gr=g.createLinearGradient(0,-ch*.45,0,ch*.5);
   if(kind==='color'){
    const hue=77+Math.round(r*29),light=24+r*13;
    gr.addColorStop(0,`hsl(${hue},24%,${light+12}%)`);gr.addColorStop(.28,`hsl(${hue},27%,${light+3}%)`);gr.addColorStop(.74,`hsl(${hue},26%,${light}%)`);gr.addColorStop(1,`hsl(${hue},25%,${light-8}%)`);
   }else if(kind==='height'){gr.addColorStop(0,'#535353');gr.addColorStop(.2,'#d0d0d0');gr.addColorStop(.68,'#a0a0a0');gr.addColorStop(1,'#363636');}
   else{gr.addColorStop(0,'#d0d0d0');gr.addColorStop(.4,`rgb(${132+r*50|0},${132+r*50|0},${132+r*50|0})`);gr.addColorStop(1,'#b0b0b0');}
   g.fillStyle=gr;g.fill();g.strokeStyle=kind==='color'?'#14251c':kind==='height'?'#292929':'#ededed';g.lineWidth=1.45;g.stroke();g.clip();
   for(let n=0;n<8;n++){
    const px=(hash(id+n*31,j)-.5)*cw,py=(hash(id,j+n*17)-.5)*ch;
    g.fillStyle=kind==='color'?'rgba(9,26,18,.22)':kind==='height'?'rgba(25,25,25,.27)':'rgba(240,240,240,.2)';g.fillRect(px,py,.8,1.5);
   }
   // Worn keel on each scale, aligned with the body instead of random dots.
   g.beginPath();g.moveTo(-cw*.04,-ch*.24);g.quadraticCurveTo(cw*.08,0,0,ch*.3);
   g.strokeStyle=kind==='color'?'rgba(181,189,124,.27)':kind==='height'?'#dadada':'#9b9b9b';g.lineWidth=1;g.stroke();g.restore();
  }
 });
 const cache={};
 new THREE.TextureLoader().load('assets/reptile-skin-v2.webp',tex=>{
  // Height stays at 512 px, avoiding a second full-size GPU copy per material.
  const height=document.createElement('canvas');height.width=height.height=512;
  const hg=height.getContext('2d');hg.filter='blur(1px)';hg.drawImage(tex.image,0,0,512,512);
  maps.color.image=tex.image;maps.height.image=height;maps.color.needsUpdate=maps.height.needsUpdate=true;
  for(const key in cache)if(key.startsWith('color')||key.startsWith('height')){cache[key].image=key.startsWith('color')?tex.image:height;cache[key].needsUpdate=true;}
  tex.dispose();
 },undefined,()=>{});
 return (kind,u=1,v=1)=>{const key=kind+u+'x'+v;if(cache[key])return cache[key];const t=maps[kind].clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(u,v);t.anisotropy=4;t.needsUpdate=true;if(kind!=='color')t.encoding=THREE.LinearEncoding;return cache[key]=t;};
})();
const LIZ_TEX=(u,v)=>REPTILE_MAPS('color',u,v);
// 다시 자랄 때 뼈를 감싸는 파란 날살: 세로 결(근섬유)·얼룩·가는 핏줄. 같은 그림을 요철로도 써서 젖은 굴곡이 생긴다
let RAW_FLESH_TEX=null;
function rawFleshTex(){
 if(RAW_FLESH_TEX)return RAW_FLESH_TEX;
 const rng=(()=>{let x=91711;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();
 RAW_FLESH_TEX=canvasTex(256,256,(g,w,h)=>{
  g.fillStyle='#223a58';g.fillRect(0,0,w,h);
  // 얼룩: 어두운 덩어리와 푸른 덩어리가 섞여 고르지 않다
  for(let i=0;i<80;i++){const x=rng()*w,y=rng()*h,r=12+rng()*36;const o=g.createRadialGradient(x,y,0,x,y,r);const dark=rng()<.5;
   o.addColorStop(0,dark?'rgba(12,20,44,.7)':'rgba(58,104,200,.55)');o.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=o;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  // 세로 결(근섬유): 가늘고 긴 밝은 줄과 어두운 줄이 촘촘히
  for(let i=0;i<420;i++){const x=rng()*w,y0=rng()*h,len=30+rng()*120,light=rng()<.45;g.strokeStyle=light?'rgba(110,160,235,.3)':'rgba(6,12,30,.45)';g.lineWidth=.5+rng()*1.5;
   g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+(rng()-.5)*7,y0+len*.5,x+(rng()-.5)*6,y0+len);g.stroke();}
  // 핏줄: 구불구불한 밝은 파란 선 몇 가닥(이 천지신명의 피 색)
  for(let i=0;i<11;i++){let x=rng()*w,y=rng()*h;g.strokeStyle='rgba(70,120,255,.75)';g.lineWidth=1+rng()*1.6;g.beginPath();g.moveTo(x,y);
   for(let k=0;k<7;k++){x+=(rng()-.5)*34;y+=16+rng()*26;g.lineTo(x,y);}g.stroke();}
  // 젖은 광택 점
  for(let i=0;i<50;i++){const x=rng()*w,y=rng()*h,r=1+rng()*2.6;g.fillStyle='rgba(190,215,255,.4)';g.beginPath();g.ellipse(x,y,r,r*2.4,0,0,TAU);g.fill();}
 },{repeat:[1,1]});
 return RAW_FLESH_TEX;
}
function reptileProjection(mat,density=3.2){
 const damage=mat.onBeforeCompile,cacheKey=mat.customProgramCacheKey();
 mat.onBeforeCompile=sh=>{
  damage(sh);
  sh.vertexShader='varying vec3 vRepP;varying vec3 vRepN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRepP=position;vRepN=normal;');
  sh.fragmentShader='varying vec3 vRepP;varying vec3 vRepN;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
   vec3 repW=pow(abs(normalize(vRepN)),vec3(5.));repW/=max(dot(repW,vec3(1.)),.0001);
   vec3 repP=vRepP*${density.toFixed(2)};
   vec4 repC=texture2D(map,repP.yz)*repW.x+texture2D(map,repP.xz)*repW.y+texture2D(map,repP.xy)*repW.z;
   diffuseColor*=mapTexelToLinear(repC);
  `).replace('#include <normal_fragment_maps>',`
   #ifdef USE_BUMPMAP
    float repH=texture2D(bumpMap,repP.yz).r*repW.x+texture2D(bumpMap,repP.xz).r*repW.y+texture2D(bumpMap,repP.xy).r*repW.z;
    normal=perturbNormalArb(-vViewPosition,normal,bumpScale*vec2(dFdx(repH),dFdy(repH)),faceDirection);
   #endif
  `);
 };
 mat.customProgramCacheKey=()=>cacheKey+'-reptile-triplanar-'+density;
 mat.roughnessMap=null;mat.roughness=.77;mat.needsUpdate=true;
}
function reptileMaterial(m,u,v,depth=.0022){
 m.map=LIZ_TEX(u,v);m.bumpMap=REPTILE_MAPS('height',u,v);m.bumpScale=depth;
 m.roughnessMap=REPTILE_MAPS('rough',u,v);m.roughness=.94;m.metalness=0;m.envMapIntensity=.48;m.needsUpdate=true;
}
// Cut ends are layered solids, with recessed muscle bundles and an open bone canal.
// Geometry is shared across cuts; no extra texture download or per-frame rebuild.
const CUT_DETAIL=(()=>{
 const cache={};
 function geometry(part,variant=0){
  const key=part+variant;if(cache[key])return cache[key];
  const N=64,P=[],uv=[],idx=[];
  const rings=part==='rim'?[[.88,-.09],[.91,.012],[.975,.025],[1,-.025],[1,-.22]]:
   part==='bone'?[[.12,-.24],[.12,.018],[.205,.045],[.235,.005],[.225,-.25]]:
   [[0,-.22],[.24,-.22],[.48,-.18],[.72,-.14],[.89,-.09]];
  rings.forEach(([radius,z],row)=>{for(let i=0;i<=N;i++){
   const a=i/N*TAU,wobble=1+.035*Math.sin(a*5+variant)+.018*Math.sin(a*11+variant*.7),rr=radius*wobble;
   P.push(Math.cos(a)*rr,Math.sin(a)*rr,z+(radius?.012*Math.sin(a*9+variant):0));
   uv.push(.5+Math.cos(a)*radius*.5,.5+Math.sin(a)*radius*.5);
  }});
  for(let row=0;row<rings.length-1;row++)for(let i=0;i<N;i++){const a=row*(N+1)+i,b=a+N+1;idx.push(a,b,a+1,a+1,b,b+1);}
  return save(key,P,uv,idx);
 }
 function save(key,P,uv,idx){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();GEO['cutDetail:'+key]=g;return cache[key]=g;
 }
 function muscle(variant=0){
  const key='muscle'+variant;if(cache[key])return cache[key];const P=[],uv=[],idx=[];
  // Separate, unequal bundles: the dark trough remains visible between them.
  const angles=[0,.82,1.95,3.02,4.15,5.28,TAU];
  for(let k=0;k<6;k++){
   const base=P.length/3,A=18,R=7;
   for(let j=0;j<=R;j++)for(let i=0;i<=A;i++){
    const u=i/A,v=j/R,a=angles[k]+.025+(angles[k+1]-angles[k]-.05)*u;
    const inner=.25+.045*Math.sin(a*3+variant),outer=.875+.014*Math.sin(a*7+variant),r=lerp(inner,outer,v);
    const hump=Math.pow(Math.sin(PI*u)*Math.sin(PI*v),.65),fiber=.008*Math.sin(u*PI*22+k)*Math.sin(PI*v);
    P.push(Math.cos(a)*r,Math.sin(a)*r,-.155+.105*hump+fiber+.02*Math.sin(k*2));uv.push(u*.6+k*.13,v);
   }
   for(let j=0;j<R;j++)for(let i=0;i<A;i++){const a=base+j*(A+1)+i,b=a+A+1;idx.push(a,b,a+1,a+1,b,b+1);}
  }
  return save(key,P,uv,idx);
 }
 return {geometry,muscle};
})();
// Reveal tissue at its final proportions. Each layer advances from the neck to
// the crown along an uneven edge; nothing inflates from a miniature finished head.
function headGrowthMaterial(base,offset=0){
 const m=base.clone(),previous=base.onBeforeCompile,key=base.customProgramCacheKey();
 const growth={value:-.3},covered={value:-1};m.userData.headGrowth=growth;m.userData.headCovered=covered;
 m.onBeforeCompile=sh=>{
  previous.call(m,sh);sh.uniforms.uHeadGrowth=growth;sh.uniforms.uHeadCovered=covered;
  sh.vertexShader='varying vec3 vHeadGrowth;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeadGrowth=position;');
  sh.fragmentShader='varying vec3 vHeadGrowth;uniform float uHeadGrowth;uniform float uHeadCovered;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
   float growY=vHeadGrowth.y+${offset.toFixed(3)}+.010*sin(vHeadGrowth.x*113.)+.007*sin(vHeadGrowth.z*137.+vHeadGrowth.x*61.);
   if(growY>uHeadGrowth||growY<uHeadCovered)discard;
  `);
 };
 m.customProgramCacheKey=()=>key+'-head-growth-v2-'+offset;m.needsUpdate=true;return m;
}
/* 바지: 상아색 비단 + 바깥·안쪽 솔기를 따라 보라 줄(금테) */
const TROUSER_TEX=canvasTex(256,256,(g,w,h)=>{
 const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#f4ecdb');gr.addColorStop(.5,'#efe5d0');gr.addColorStop(1,'#f4ecdb');g.fillStyle=gr;g.fillRect(0,0,w,h);
 for(let x=0;x<w;x+=3){g.fillStyle=`rgba(150,120,70,${x%6?.03:.06})`;g.fillRect(x,0,1,h);}
 for(let x=6;x<w;x+=16){g.fillStyle='rgba(84,56,160,.42)';g.fillRect(x,0,2,h);}
 for(const u of [.25,.75]){const x=u*w;g.fillStyle='#4f3399';g.fillRect(x-9,0,18,h);g.fillStyle='#f2c34c';g.fillRect(x-11,0,2.5,h);g.fillRect(x+8.5,0,2.5,h);}
});
/* 눈을 옆으로 덮고 지나가는 반투명 막: 왼쪽 반은 비어 있고 오른쪽 반이 막(코 쪽). 텍스처를 밀어 막이 지나가게 한다 */
const MEM_TEX=(()=>{const t=canvasTex(512,64,(g,w,h)=>{
 g.clearRect(0,0,w,h);
 const edge=y=>w/2+10*Math.sin(y/h*PI);
 g.beginPath();g.moveTo(edge(0),0);for(let y=0;y<=h;y+=2)g.lineTo(edge(y),y);g.lineTo(w,h);g.lineTo(w,0);g.closePath();
 const gr=g.createLinearGradient(w/2,0,w,0);gr.addColorStop(0,'rgba(238,248,252,.94)');gr.addColorStop(.25,'rgba(213,232,241,.8)');gr.addColorStop(1,'rgba(169,196,212,.7)');g.fillStyle=gr;g.fill();
 g.beginPath();for(let y=0;y<=h;y+=2){const x=edge(y)+1;y?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle='#5f7c8e';g.lineWidth=3;g.stroke();
 g.beginPath();for(let y=0;y<=h;y+=2){const x=edge(y)+6;y?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.stroke();
});t.repeat.set(.5,1);t.offset.set(0,0);return t;})();
/* 후광 재료: 머리 뒤 금빛 원반(서양 성화) + 안쪽 고리 팔괘 + 바깥 고리 12별자리 + 불꽃 테두리(불교 광배).
 * 고리는 각도를 따라 펼친 띠 그림을 둘러 붙인다(띠의 위쪽 = 바깥). 글꼴 대신 선으로 그려 기기마다 똑같이 보인다. */
const HALO={R0:.236,R1:.281,R2:.287,R3:.333,RF:.418,RG:.47};
function polarRing(r0,r1,seg,a0=0,a1=TAU){
 const pos=[],uv=[],nor=[],idx=[];
 for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg,c=Math.cos(a),s=Math.sin(a),u=1-a/TAU;pos.push(c*r0,s*r0,0,c*r1,s*r1,0);uv.push(u,0,u,1);nor.push(0,0,1,0,0,1);}
 for(let i=0;i<seg;i++){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
}
// 별자리 기호 12개(양·황소·쌍둥이·게·사자·처녀·천칭·전갈·궁수·염소·물병·물고기): -1~1 칸, 아래가 +y
const ZODIAC=[
 g=>{g.moveTo(0,.9);g.bezierCurveTo(0,-.1,-.15,-.85,-.5,-.85);g.bezierCurveTo(-.9,-.85,-.95,-.25,-.62,-.22);g.moveTo(0,.9);g.bezierCurveTo(0,-.1,.15,-.85,.5,-.85);g.bezierCurveTo(.9,-.85,.95,-.25,.62,-.22);},
 g=>{g.moveTo(.42,.32);g.arc(0,.32,.42,0,TAU);g.moveTo(-.9,-.85);g.bezierCurveTo(-.65,-.05,.65,-.05,.9,-.85);},
 g=>{g.moveTo(-.85,-.82);g.quadraticCurveTo(0,-.55,.85,-.82);g.moveTo(-.85,.82);g.quadraticCurveTo(0,.55,.85,.82);g.moveTo(-.38,-.68);g.lineTo(-.38,.68);g.moveTo(.38,-.68);g.lineTo(.38,.68);},
 g=>{g.moveTo(-.25,-.28);g.arc(-.47,-.28,.22,0,TAU);g.moveTo(-.47,-.5);g.bezierCurveTo(.1,-.82,.7,-.62,.85,-.25);g.moveTo(.69,.28);g.arc(.47,.28,.22,0,TAU);g.moveTo(.47,.5);g.bezierCurveTo(-.1,.82,-.7,.62,-.85,.25);},
 g=>{g.moveTo(-.22,.32);g.arc(-.47,.32,.25,0,TAU);g.moveTo(-.3,.14);g.bezierCurveTo(-.45,-.95,.6,-.95,.4,-.05);g.bezierCurveTo(.25,.55,.45,.9,.85,.62);},
 g=>{g.moveTo(-.85,-.55);g.lineTo(-.85,.78);g.moveTo(-.85,-.3);g.bezierCurveTo(-.7,-.85,-.3,-.75,-.3,-.3);g.lineTo(-.3,.78);g.moveTo(-.3,-.3);g.bezierCurveTo(-.15,-.85,.25,-.75,.25,-.3);g.lineTo(.25,.45);g.bezierCurveTo(.25,.95,.85,.75,.75,.25);g.bezierCurveTo(.65,-.1,.15,.35,.05,.9);},
 g=>{g.moveTo(-.85,.62);g.lineTo(.85,.62);g.moveTo(-.85,.2);g.lineTo(-.38,.2);g.bezierCurveTo(-.62,-.75,.62,-.75,.38,.2);g.lineTo(.85,.2);},
 g=>{g.moveTo(-.85,-.55);g.lineTo(-.85,.78);g.moveTo(-.85,-.3);g.bezierCurveTo(-.7,-.85,-.3,-.75,-.3,-.3);g.lineTo(-.3,.78);g.moveTo(-.3,-.3);g.bezierCurveTo(-.15,-.85,.25,-.75,.25,-.3);g.lineTo(.25,.5);g.quadraticCurveTo(.3,.82,.75,.78);g.moveTo(.5,.55);g.lineTo(.8,.78);g.lineTo(.52,.98);},
 g=>{g.moveTo(-.78,.8);g.lineTo(.78,-.78);g.moveTo(.08,-.8);g.lineTo(.8,-.8);g.lineTo(.8,-.08);g.moveTo(-.5,-.05);g.lineTo(.05,.5);},
 g=>{g.moveTo(-.9,-.6);g.lineTo(-.55,.55);g.lineTo(-.2,-.55);g.bezierCurveTo(-.05,.9,.85,.85,.7,.3);g.bezierCurveTo(.55,-.15,.1,.25,.25,.7);g.quadraticCurveTo(.3,.95,.0,.95);},
 g=>{for(const y of [-.28,.32]){g.moveTo(-.9,y+.1);g.lineTo(-.5,y-.22);g.lineTo(-.1,y+.1);g.lineTo(.3,y-.22);g.lineTo(.7,y+.1);g.lineTo(.92,y-.08);}},
 g=>{g.moveTo(-.75,-.88);g.bezierCurveTo(-.15,-.4,-.15,.4,-.75,.88);g.moveTo(.75,-.88);g.bezierCurveTo(.15,-.4,.15,.4,.75,.88);g.moveTo(-.55,0);g.lineTo(.55,0);},
];
// 팔괘(선천도 순서): 아래 효(안쪽)부터 1=양(이어진 막대) 0=음(끊긴 막대)
const TRIGRAMS=[[1,1,1],[1,1,0],[1,0,1],[1,0,0],[0,0,0],[0,0,1],[0,1,0],[0,1,1]];
const HALO_SRC=(()=>{let S=null;
 const cv=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d',TEX_CTX),w,h);return c;};
 const star4=(g,r,r2)=>{g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-PI/2,rr=i%2?r2:r;i?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();};
 return ()=>S||(S={
  // 바깥 고리: 연한 금빛 띠 + 보라 별자리 기호, 사이에 작은 별
  zod:cv(2048,96,(g,w,h)=>{
   const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#fff6d2');gr.addColorStop(.55,'#ffe49a');gr.addColorStop(1,'#f3c75e');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='#b57d18';g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);
   const sx=w/(TAU*.31)*.0158,sy=h/(HALO.R3-HALO.R2)*.0158;
   for(let i=0;i<12;i++){const x=(i+.5)/12*w,y=h*.52;
    g.save();g.translate(x,y);g.scale(sx,sy);g.lineCap='round';g.lineJoin='round';
    g.beginPath();ZODIAC[i](g);g.lineWidth=.42;g.strokeStyle='#fff9e6';g.stroke();g.lineWidth=.24;g.strokeStyle='#45247f';g.stroke();g.restore();
    g.save();g.translate((i+1)/12*w,h/2);g.scale(sx,sy);g.fillStyle='#c0841a';star4(g,.42,.13);g.restore();}
  }),
  // 안쪽 고리: 보라 띠 + 금 팔괘, 사이에 금 점
  tri:cv(2048,96,(g,w,h)=>{
   const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#6442bf');gr.addColorStop(1,'#3a237f');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='#f0bb48';g.fillRect(0,0,w,5);g.fillRect(0,h-5,w,5);
   const sx=w/(TAU*.259)*.0175,sy=h/(HALO.R1-HALO.R0)*.0175;
   for(let i=0;i<8;i++){const x=(i+.5)/8*w,y=h/2;g.save();g.translate(x,y);g.scale(sx,sy);
    for(let k=0;k<3;k++){const yy=.6-k*.6;const bar=(x0,x1)=>{g.fillStyle='#24123f';g.fillRect(x0-.06,yy-.25,x1-x0+.12,.5);g.fillStyle='#ffd766';g.fillRect(x0,yy-.19,x1-x0,.38);};
     if(TRIGRAMS[i][k])bar(-1,1);else{bar(-1,-.18);bar(.18,1);}}
    g.restore();g.fillStyle='#ffd766';g.beginPath();g.ellipse((i+1)/8*w,y,5,9,0,0,TAU);g.fill();}
  }),
  // 불꽃: 바탕 띠에서 크고 작은 불꽃 혀가 번갈아 솟고 끝이 옆으로 말린다
  flame:cv(2048,128,(g,w,h)=>{
   const base=h*.8,n=40;
   for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){
    const big=i%2===0,x=(i+.5)/n*w,fw=w/n*(big?1.3:.95),fh=h*(big?.76:.5),tip=base-fh,curl=(i%4<2?1:-1)*fw*.38;
    g.beginPath();g.moveTo(x-fw/2,base+4);
    g.bezierCurveTo(x-fw*.6,base-fh*.45,x-fw*.12,base-fh*.62,x+curl,tip);
    g.bezierCurveTo(x+fw*.12,base-fh*.62,x+fw*.62,base-fh*.42,x+fw/2,base+4);g.closePath();
    if(pass===0){g.lineWidth=8;g.strokeStyle='#b3241a';g.lineJoin='round';g.stroke();}
    else{const gr=g.createLinearGradient(0,tip,0,base);gr.addColorStop(0,'#fff2a6');gr.addColorStop(.42,'#ffb52c');gr.addColorStop(1,'#ff6a1c');g.fillStyle=gr;g.fill();}
   }
   g.fillStyle='#ff7a1e';g.fillRect(0,base-2,w,h-base+2);g.fillStyle='#b3241a';g.fillRect(0,h-7,w,7);
  }),
  // 원반: 밝은 금빛
  plate:cv(256,256,(g,w,h)=>{const r=g.createRadialGradient(110,104,8,128,128,128);r.addColorStop(0,'#fff8da');r.addColorStop(.55,'#ffe07a');r.addColorStop(1,'#efb13a');g.fillStyle=r;g.beginPath();g.arc(128,128,127,0,TAU);g.fill();}),
  // 둘레 빛
  glow:cv(256,256,(g,w,h)=>{const r=g.createRadialGradient(128,128,0,128,128,128),k=HALO.R3/HALO.RG;r.addColorStop(0,'rgba(255,224,140,0)');r.addColorStop(k*.92,'rgba(255,214,110,0)');r.addColorStop(k*1.02,'rgba(255,206,96,.55)');r.addColorStop(1,'rgba(255,190,80,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
 });
})();
/* 눈알 앞쪽을 덮는 구면 조각(+z를 본다). 앞에서 본 평면 좌표로 텍스처를 붙인다. mirror면 좌우를 뒤집는다(코 쪽이 u=1이 되게) */
function eyeCapGeo(R,thMax,mirror){
 const g=new THREE.SphereGeometry(R,28,10,0,TAU,0,thMax);g.rotateX(PI/2);
 const uvR=R*Math.sin(thMax),p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,.5+(mirror?-1:1)*p.getX(i)/(2*uvR),.5+p.getY(i)/(2*uvR));
 uv.needsUpdate=true;return g;
}
// 오만원권 한 장. 긴 변을 따라 인쇄한 뒤, 같은 종이를 한쪽 끝에서만 모아 쥔다.
const BANKNOTE_TEX=canvasTex(512,224,(g,w,h)=>{
 const ink='#412b1c',paper=g.createLinearGradient(0,0,w,h);
 paper.addColorStop(0,'#cd9d45');paper.addColorStop(.45,'#efd186');paper.addColorStop(1,'#c6983d');
 g.fillStyle='#fff1c7';g.fillRect(0,0,w,h);g.fillStyle=paper;g.fillRect(7,7,w-14,h-14);
 g.strokeStyle='#967244';g.lineWidth=2;g.strokeRect(13,13,w-26,h-26);
 for(let i=0;i<27;i++){
  g.strokeStyle=i%2?'#c79b58':'#d4b778';g.lineWidth=1;g.beginPath();
  for(let x=17;x<w-16;x+=3){const y=26+i*6.5+5*Math.sin(x*.043+i*.62);if(x===17)g.moveTo(x,y);else g.lineTo(x,y);}
  g.stroke();
 }
 g.fillStyle='#9b936d';g.fillRect(114,14,6,h-28);
 for(let y=20;y<202;y+=25){g.fillStyle='#f0df9e';g.fillRect(114,y,6,12);}
 // 작은 판화풍 초상과 저고리 옷깃. 지폐가 겹쳐도 바깥 귀퉁이의 액면은 드러난다.
 g.fillStyle='#826641';g.beginPath();g.moveTo(273,196);g.quadraticCurveTo(280,154,324,148);
 g.lineTo(357,145);g.quadraticCurveTo(400,151,419,196);g.closePath();g.fill();
 const oval=(x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();};
 oval(349,88,38,46,ink);oval(376,76,19,17,ink);oval(344,104,25,34,'#d9af73');
 g.fillStyle=ink;g.beginPath();g.moveTo(317,94);g.quadraticCurveTo(336,87,350,71);g.quadraticCurveTo(359,92,370,101);
 g.quadraticCurveTo(373,58,341,62);g.quadraticCurveTo(316,61,317,94);g.fill();
 g.strokeStyle=ink;g.lineWidth=2;
 for(const [x,y,dx,dy] of [[325,102,9,-1],[345,100,9,1],[337,104,-3,11],[334,123,12,-1]]){
  g.beginPath();g.moveTo(x,y);g.lineTo(x+dx,y+dy);g.stroke();
 }
 g.strokeStyle='#f1d79b';g.lineWidth=5;g.beginPath();g.moveTo(318,147);g.lineTo(346,170);g.lineTo(366,147);g.moveTo(346,170);g.lineTo(330,195);g.stroke();
 g.fillStyle=ink;g.font='bold 50px Georgia,serif';g.fillText('50000',24,62);
 g.save();g.translate(449,113);g.rotate(PI/2);g.font='bold 58px Georgia,serif';g.textAlign='center';g.fillText('50000',0,0);g.restore();
 g.font='bold 30px "Noto Serif KR",serif';g.textAlign='left';g.fillText('오만원',30,178);
 g.fillStyle='#785521';g.font='13px monospace';g.fillText('SJ  0517284',28,203);g.textAlign='left';
});
// 쥔 쪽 끝(밑동)은 주먹 속에 들어가게 폭이 30%까지 모인다(부채살처럼). 예전에는 끝까지 같은 폭이라 주먹 밖으로 지폐 밑동이 비어져 나왔다
// 부채는 지폐가 주먹 위로 빠져나오는 자리(PIVOT)를 축으로 벌어진다. 밑동을 축으로 벌리면 기울어진 지폐 아랫단이 주먹 옆으로 비어져 나왔다
function banknoteStack(){
 const vertices=[],uv=[],indices=[],count=32,sections=8,base=-.012,pinch=.3,reach=.32,PIVOT=.06;
 for(let i=0;i<count;i++){
  const layer=i/(count-1);
  // 아래쪽 여러 장은 거의 평행한 묶음이고, 엄지에서 먼 모서리들만 불규칙하게 벌어진다.
  const angle=-.52+.83*Math.pow(layer,1.6)+.065*Math.floor(i/8)+.013*Math.sin(i*2.1);
  const c=Math.cos(angle),s=Math.sin(angle),start=vertices.length/3;
  for(let j=0;j<=sections;j++){
   const along=j/sections,y=along*(.27+.009*Math.sin(i*.8))+base,narrow=lerp(pinch,1,smooth(along/reach));
   for(const edge of [-1,1]){
    const x=(edge*.059+.002*Math.sin(i*.8))*narrow,yp=y-PIVOT;
    vertices.push(x*c-yp*s,yp*c+x*s+PIVOT,(layer-.5)*.020+along*along*(.014*layer+.006*edge));
    uv.push(along,edge===1?0:1);
   }
   if(j<sections){const k=start+j*2;indices.push(k,k+1,k+3,k,k+3,k+2);}
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

/* ===== 6-0. 빚은 머리(사람) =====
 * 얼굴 좌표(face 그룹 기준, 미터, +z가 앞): 두개골·이마·볼살·턱살(이중턱)·광대·눈두덩·눈구멍·코(콧대·뭉툭한 코끝·콧방울)·인중·팔자주름을 SDF로 섞어 한 덩어리로 빚는다.
 * 아래턱(턱끝·아랫입술)은 따로 빚어 턱뼈에 붙인다(입을 벌리면 같이 내려간다). 귀·뒷머리도 따로. */
const HEADGEO=(()=>{
 const {ell,cap,smin,smax}=SCULPT;
 function human(x,y,z){
  const ax=Math.abs(x);
  // 두개골·이마
  let d=ell(x,y,z,0,.045,-.028,.18,.196,.19);
  d=smin(d,ell(x,y,z,0,.1,.088,.15,.072,.104),.05);
  // 얼굴 살·볼살(아래로 처진 턱살)
  d=smin(d,ell(x,y,z,0,-.02,.056,.164,.15,.15),.06);
  d=smin(d,ell(ax,y,z,.108,-.094,.068,.116,.118,.118),.05);
  // 광대 위 볼(비웃을 때 치켜 올라가는 살)
  d=smin(d,ell(ax,y,z,.086,-.008,.142,.056,.04,.05),.03);
  // 무거운 눈두덩
  d=smin(d,cap(ax,y,z,0,.094,.196,.128,.088,.16,.024,.017),.026);
  // 눈밑 지방
  d=smin(d,ell(ax,y,z,.077,.008,.171,.046,.018,.028),.014);
  // 눈구멍(눈알과 눈꺼풀이 들어앉을 만큼)
  d=smax(d,-ell(ax,y,z,.075,.05,.19,.047,.033,.032),.022);
  // 코: 콧대 → 뭉툭한 코끝 → 콧방울
  d=smin(d,cap(x,y,z,0,.072,.2,0,-.006,.25,.016,.022),.02);
  d=smin(d,ell(x,y,z,0,-.024,.252,.047,.04,.04),.016);
  d=smin(d,ell(ax,y,z,.036,-.036,.228,.025,.022,.026),.012);
  // 인중·윗입술 살
  d=smin(d,ell(x,y,z,0,-.078,.18,.088,.044,.062),.03);
  // 팔자주름
  d=smax(d,-cap(ax,y,z,.05,-.04,.232,.094,-.122,.2,.0045,.004),.011);
  // 입 다문 선
  d=smax(d,-ell(x,y,z,0,-.1,.21,.072,.009,.03),.012);
  // 이중턱·턱밑 살
  d=smin(d,ell(x,y,z,0,-.198,.034,.152,.078,.13),.05);
  d=smin(d,ell(x,y,z,0,-.17,-.052,.15,.092,.122),.05);
  return d;
 }
 // 아래턱: 얼굴 좌표 그대로 빚고 턱뼈 자리(0,-.03,-.02)를 빼서 붙인다
 function chin(x,y,z){
  let d=ell(x,y,z,0,-.166,.112,.1,.07,.088);
  d=smin(d,ell(x,y,z,0,-.121,.162,.066,.027,.044),.03);
  d=smin(d,ell(x,y,z,0,-.2,.07,.12,.05,.08),.04);
  return d;
 }
 // 귀(오른쪽 귀 기준, 귀 좌표): 납작한 귓바퀴 + 긴 귓불, 바깥쪽 귓구멍 쪽은 오목
 function ear(x,y,z){
  let d=ell(x,y,z,0,.012,0,.02,.062,.044);
  d=smin(d,ell(x,y,z,.002,-.066,.012,.024,.045,.03),.03);
  d=smax(d,-ell(x,y,z,.016,.006,.008,.013,.036,.022),.008);
  return d;
 }
 // 뒷머리: 두개골보다 조금 부푼 껍데기의 뒤·옆 아래쪽만
 function hair(x,y,z){
  let d=human(x,y,z)-.009;
  d=smax(d,z-.03-(y-.02)*.25,.03);
  d=smax(d,-(y+.035),.02);
  d=smax(d,y-.16,.04);
  return d;
 }
 const G={};
 function tintHuman(x,y,z,c){
  const ax=Math.abs(x),g=(dx,dy,dz,s)=>Math.exp(-(dx*dx+dy*dy+dz*dz)/(2*s*s));
  let r=1,gg=1,b=1;
  const nose=g(x,y+.024,z-.252,.032);r-=.02*nose;gg-=.16*nose;b-=.14*nose;
  const ck=g(ax-.098,y+.022,(z-.15)*.5,.036)*(z>.08?1:0);gg-=.11*ck;b-=.08*ck;
  const eye=g(ax-.075,(y-.044)*1.3,(z-.17)*.6,.034);r-=.07*eye;gg-=.1*eye;b-=.04*eye;
  const jw=g(ax-.1,y+.15,(z-.06)*.5,.06);r-=.04*jw;gg-=.05*jw;b-=.02*jw;
  const lip=g(x*.6,y+.08,z-.2,.03);gg-=.06*lip;b-=.05*lip;
  c.setRGB(r,gg,b);
 }
 // 얼굴 앞 겉면 깊이(z): 눈썹·입술·콧수염을 살 위에 얹을 때
 const zc=new Map();
 function zFront(x,y){
  const k=Math.round(x*500)+','+Math.round(y*500);let z=zc.get(k);if(z!=null)return z;
  let hi=.34,lo=hi;while(lo>-.05&&human(x,y,lo)>0)lo-=.006;
  if(lo<=-.05){zc.set(k,0);return 0;}
  let a=lo,b=lo+.006;for(let i=0;i<14;i++){const m=(a+b)/2;if(human(x,y,m)<0)a=m;else b=m;}
  z=(a+b)/2;zc.set(k,z);return z;
 }
 /* 다시 자라는 얼굴: 사람의 이마·관자·광대·턱, 짧은 파충류 코와 고정된 안와.
  * 눈두덩과 입꼬리에 감정의 기울기를 넣지 않는다. 살의 반응은 골격의 충격으로만 전달한다. */
 function rep(x,y,z){
  const ax=Math.abs(x);
  let d=ell(x,y,z,0,.065,-.036,.148,.183,.154);
  // Upright forehead and temples keep a human cranial silhouette.
  d=smin(d,ell(x,y,z,0,.132,.072,.131,.102,.095),.024);
  d=smin(d,ell(ax,y,z,.112,.036,.016,.039,.098,.104),.022);
  // Angular cheekbones flow down into a narrow face instead of a long muzzle.
  d=smin(d,ell(ax,y,z,.098,-.014,.083,.035,.043,.050),.020);
  d=smin(d,ell(x,y,z,0,-.051,.055,.109,.085,.115),.026);
  // A level, heavy orbital shelf: neither a scowl nor a raised eyebrow.
  d=smin(d,cap(ax,y,z,.028,.106,.145,.114,.104,.122,.014,.012),.018);
  d=smin(d,ell(ax,y,z,.074,.065,.133,.046,.035,.038),.016);
  d=smax(d,-ell(ax,y,z,.074,.064,.171,.035,.022,.025),.004);
  // Flattened nasal bridge and a vestigial human nose; no projecting snout.
  d=smin(d,cap(x,y,z,0,.087,.166,0,-.040,.191,.013,.020),.013);
  d=smin(d,ell(x,y,z,0,-.047,.186,.033,.024,.031),.012);
  d=smax(d,-ell(ax,y,z,.016,-.055,.213,.007,.0045,.012),.003);
  // Thin upper mouth plate; the slit stays horizontal through both corners.
  const upper=smax(ell(x,y,z,0,-.078,.112,.095,.065,.064),-(y+.111),.006);
  d=smin(d,upper,.015);
  d=smax(d,-ell(x,y,z,0,-.113,.164,.102,.004,.044),.003);
  // Back of the mandible connects continuously to the existing neck.
  d=smin(d,ell(x,y,z,0,-.114,-.034,.098,.069,.097),.022);
  // Regrow the throat as part of the skull: overlap the trimmed stump deeply
  // enough to stay joined when the head turns independently of the neck.
  d=smin(d,cap(x,y,z,0,-.15,-.03,0,-.235,-.025,.079,.09),.018);
  return d;
 }
 // The lower jaw has a human chin, with the same level mouth seam as the skull.
 function repJaw(x,y,z){
  let d=ell(x,y,z,0,-.137,.071,.089,.042,.095);
  d=smin(d,ell(Math.abs(x),y,z,.070,-.127,.014,.023,.042,.063),.018);
  d=smin(d,ell(x,y,z,0,-.154,.117,.064,.025,.051),.015);
  d=smax(d,y+.112,.004);
  return d;
 }
 function tintRep(x,y,z,c){
  const front=smooth((z+.01)/.13),temple=smooth((Math.abs(x)-.08)/.07);
  const under=smooth((-.065-y)/.10)*front;
  const eye=Math.exp(-(((Math.abs(x)-.074)**2)/.0015+((y-.063)**2)/.0018))*front;
  // Desaturated olive, pale jaw and a muted flesh tone around the sockets.
  c.setRGB(.90-.10*temple+.13*under+.09*eye,.91-.12*temple+.07*under-.13*eye,.86-.09*temple+.05*under-.06*eye);
 }
 function build(){
  if(G.head)return G;
  G.head=SCULPT.star(human,V3(0,-.012,.004),136,104,.33,{tint:tintHuman});
  G.rep=SCULPT.star(rep,V3(0,.0,.02),136,104,.34,{tint:tintRep,smooth:2});
  G.repJaw=SCULPT.star(repJaw,V3(0,-.14,.075),72,48,.2,{tint:tintRep});
  G.repJaw.translate(0,.07,.03);
  G.chin=SCULPT.star(chin,V3(0,-.16,.115),72,54,.16,{tint:(x,y,z,c)=>{const l=Math.exp(-((x*.7)**2+(y+.122)**2+(z-.17)**2)/(2*.028*.028));c.setRGB(1,1-.08*l,1-.07*l);}});
  G.chin.translate(0,.03,.02);
  G.ear=SCULPT.star(ear,V3(0,-.02,.004),44,34,.12,{tint:(x,y,z,c)=>{c.setRGB(1,.9,.88);}});
  G.hair=SCULPT.star(hair,V3(0,.03,-.04),96,72,.34);
  return G;
 }
 return {human,chin,ear,hair,rep,repJaw,zFront,build};
})();

/* ===== 6-0-2. 빚은 몸 =====
 * 배(늘어진 똥배·옆구리 살)·가슴(어깨 위 살·가슴살)·목·소매(주름)·바지·손바닥. 뼈마다 그 뼈 좌표로 빚어 둔다(한 번만 빚고 판마다 복사). */
const BELLY_C=V3(0,.16,.06),BELLY_R=V3(.345,.295,.325);
const BODYGEO=(()=>{
 const {ell,cap,smin}=SCULPT;
 function belly(x,y,z){const ax=Math.abs(x);
  let d=ell(x,y,z,0,.16,.06,.345,.295,.325);
  d=smin(d,ell(x,y,z,0,.072,.132,.292,.192,.242),.09);
  d=smin(d,ell(ax,y,z,.248,.118,-.02,.12,.142,.152),.07);
  d=smin(d,ell(x,y,z,0,.262,.02,.296,.15,.258),.08);
  return d;}
 function chest(x,y,z){const ax=Math.abs(x);
  let d=ell(x,y,z,0,.13,0,.3,.205,.235);
  d=smin(d,ell(x,y,z,0,.17,-.05,.27,.16,.2),.06);
  d=smin(d,ell(ax,y,z,.18,.205,-.012,.125,.082,.12),.05);
  d=smin(d,ell(ax,y,z,.098,.148,.098,.122,.1,.102),.05);
  return d;}
 const ballCap=(r0,r1,len)=>(x,y,z)=>smin(ell(x,y,z,0,-.01,0,.12,.115,.12),cap(x,y,z,0,-.01,0,0,-len,0,r0,r1),.04);
 const fold=(base,amp,ph)=>(t,a)=>base(t)*(1+amp*(.55*Math.sin(a*6+t*4+ph)+.3*Math.sin(a*11-t*7+ph*2)+.15*Math.sin(a*17+t*13)));
 const G={};
 // 배·가슴 껍데기 위의 한 점(가운데에서 방향 d로 나가 만나는 겉면)과 그 자리 법선
 function onSurf(sdf,c,d,out,nOut){let lo=0,hi=.6;for(let k=0;k<26;k++){const m=(lo+hi)/2;if(sdf(c.x+d.x*m,c.y+d.y*m,c.z+d.z*m)<0)lo=m;else hi=m;}
  const t=(lo+hi)/2;out.set(c.x+d.x*t,c.y+d.y*t,c.z+d.z*t);
  if(nOut){const e=.001,x=out.x,y=out.y,z=out.z;nOut.set(sdf(x+e,y,z)-sdf(x-e,y,z),sdf(x,y+e,z)-sdf(x,y-e,z),sdf(x,y,z+e)-sdf(x,y,z-e)).normalize();}return out;}
 function build(){
  if(G.belly)return G;
  G.belly=SCULPT.star(belly,BELLY_C,124,88,.46);
  G.chest=SCULPT.star(chest,V3(0,.13,0),104,72,.4);
  G.neck=SCULPT.tube(V3(0,-.04,.02),V3(0,.125,.028),t=>lerp(.13,.118,t),40,10,{cap:3,capScale:.4});
  // 어깨(공 + 위팔 윗부분)
  G.shoulder=SCULPT.star(ballCap(.09,.1,.118),V3(0,-.05,0),56,44,.2);
  G.uarm=SCULPT.tube(V3(0,.01,0),V3(0,-.13,0),fold(t=>lerp(.099,.109,t),.035,.6),40,12,{cap:3,capScale:.35});
  G.elbow=SCULPT.tube(V3(0,.04,0),V3(0,-.11,0),fold(t=>lerp(.104,.1,t)+.012*Math.exp(-((t-.25)**2)/.02),.04,1.7),40,12,{cap:3,capScale:.5});
  // 아래팔 소매: 손목 쪽 끝은 막지 않고 뚫어 둔다(넓은 소매 아가리). 그 속은 안감(보라, 안쪽 면만 그리는 재질)으로 메워 아가리로 들여다보면 안감·테두리·손이 보인다
  const farmRf=fold(t=>lerp(.1,.112,t),.045,2.9);
  G.farm=SCULPT.tube(V3(0,.01,0),V3(0,-.137,0),farmRf,44,13,{cap:3,capScale:.3,openB:true});
  G.farmLining=SCULPT.tube(V3(0,-.137,0),V3(0,-.07,0),(t,a)=>farmRf(1-t*.456,a)*.985,44,6,{cap:3,capScale:.5,openA:true});
  G.wrist=SCULPT.tube(V3(0,.025,0),V3(0,-.034,0),t=>lerp(.04,.035,t),24,5,{cap:2,capScale:.5});
  G.palm=SCULPT.star((x,y,z)=>smin(ell(x,y,z,0,-.055,.004,.026,.058,.05),ell(x,y,z,0,-.083,.004,.027,.03,.054),.02),V3(0,-.06,.004),30,24,.09);
  // 바지: 엉덩이·허벅지·정강이
  G.seat=SCULPT.star((x,y,z)=>ell(x,y,z,0,-.035,0,.17,.13,.255),V3(0,-.035,0),64,40,.3);
  G.hip=SCULPT.star((x,y,z)=>smin(ell(x,y,z,0,0,0,.13,.11,.13),cap(x,y,z,0,0,0,0,-.148,0,.128,.121),.04),V3(0,-.06,0),56,44,.24);
  G.thigh=SCULPT.tube(V3(0,.012,0),V3(0,-.152,0),fold(t=>lerp(.121,.108,t),.03,.4),40,12,{cap:3,capScale:.35});
  G.knee=SCULPT.star((x,y,z)=>smin(ell(x,y,z,0,0,0,.11,.09,.108),cap(x,y,z,0,0,0,0,-.13,0,.1,.092),.035),V3(0,-.05,0),48,40,.2);
  G.shin=SCULPT.tube(V3(0,.01,0),V3(0,-.132,0),fold(t=>lerp(.092,.084,t),.03,2.2),36,11,{cap:3,capScale:.35});
  return G;
 }
 // 다시 자란 파충류 머리 밑의 목: 옷깃 쪽(아래)은 원래 목 굵기 그대로, 위로 갈수록 머리 밑동 굵기까지 가늘어진다(처음 쓸 때 한 번만 빚는다)
 function repNeck(){const G=build();return G.repNeck||(G.repNeck=SCULPT.tube(V3(0,-.04,.02),V3(0,.125,.028),t=>lerp(.13,.098,smooth(t)),40,10,{cap:3,capScale:.4}));}
 return {belly,chest,onSurf,build,repNeck};
})();
/* 신발(흑화) 한 켤레 분 지오메트리: 발목 좌표(발끝 +z, 발목 뼈가 원점). 몸통은 SDF로 빚고, 밑창은 발바닥 모양을 두껍게 뽑는다 */
const BOOTGEO=(()=>{let G=null;return()=>G||(G=(()=>{
 const {ell,cap,smin,smax}=SCULPT;
 const sdf=(x,y,z)=>{
  let d=cap(x,y,z,0,.03,-.02,0,-.01,.085,.058,.055);            // 발등
  d=smin(d,ell(x,y,z,0,-.008,.122,.06,.046,.07),.03);           // 앞코(살짝 들림)
  d=smin(d,ell(x,y,z,0,.0,-.038,.064,.058,.056),.03);           // 뒤축
  d=smin(d,cap(x,y,z,0,.115,-.012,0,.02,-.012,.074,.07),.02);   // 발목 통(정강이 밑으로 이어진다)
  d=smax(d,-(y+.046),.006);                                      // 바닥은 평평하게
  return d;};
 const body=SCULPT.star(sdf,V3(0,.0,.035),48,34,.3,{smooth:2});
 // 발바닥 모양: 뒤축 반원 → 넓은 앞볼 → 둥근 앞코
 const sh=new THREE.Shape();
 sh.absarc(0,-.055,.058,PI,TAU,false);sh.lineTo(.07,.06);sh.quadraticCurveTo(.08,.17,.0,.198);sh.quadraticCurveTo(-.08,.17,-.07,.06);sh.lineTo(-.058,-.055);
 const sole=new THREE.ExtrudeGeometry(sh,{depth:.024,bevelEnabled:true,bevelSize:.005,bevelThickness:.004,bevelSegments:3,curveSegments:10});
 sole.rotateX(PI/2);sole.translate(0,-.046,0);sole.computeVertexNormals();
 return {body,sole};})());})();

/* 팔이 몸통·머리를 뚫지 않게 밀어낸다(팔뼈 길이는 그대로 두고 회전만 바꾼다).
 * 이전 안전 자세에서 애니메이션 목표를 따라가며, 소매를 포함한 팔 길이 제약을 다시 푼다.
 * 몸의 반대편으로 해가 바뀌지 않도록 이동량을 제한하고, 충돌 없는 경로만 허용한다.
 * 팔뼈 중심이 아니라 소매 반지름까지 몸 밖에 둔다. 손도 손바닥 두께만큼 띄운다.
 * 손의 방향은 그대로 두되 손목이 소매 안쪽으로 꺾이지 않게만 막는다. */
const ARM_CLEARANCE=(()=>{
 const DOWN=V3(0,-1,0),invChest=new THREE.Matrix4(),local=V3(),p=V3(),n=V3(),push=V3();
 const S=V3(),E0=V3(),W0=V3(),E1=V3(),W1=V3(),d0=V3(),d1=V3(),hd=V3(),fd=V3(),ax=V3(),cE=V3(),cW=V3();
 const qU=new THREE.Quaternion(),qL=new THREE.Quaternion(),qH=new THREE.Quaternion(),qD=new THREE.Quaternion(),qT=new THREE.Quaternion(),qU0=new THREE.Quaternion(),qL0=new THREE.Quaternion(),qWant=new THREE.Quaternion();
 // 표본점: 위팔은 중간부터 팔꿈치까지(어깨 쪽은 몸통에 묻히는 게 정상), 아래팔은 팔꿈치부터 손목까지, 손은 손목에서 손바닥·손끝까지
 const UP=[.5,.75,1],LOW=[0,.25,.5,.75,1],HAND=[.065,.135];
 // 표면 밖 여유: 소매 반지름과 손바닥 두께. 몸 안에 잠기는 음수 여유를 쓰지 않는다.
 const colliders=[
  {m:new THREE.Matrix4(),n:new THREE.Matrix3(),sdf:null,on:false,up:.108,low:.118,hand:.052}, // 배
  {m:new THREE.Matrix4(),n:new THREE.Matrix3(),sdf:null,on:false,up:.108,low:.118,hand:.052}, // 가슴
  {m:new THREE.Matrix4(),n:new THREE.Matrix3(),sdf:null,on:false,up:.108,low:.118,hand:.052}, // 머리
  {m:new THREE.Matrix4(),n:new THREE.Matrix3(),sdf:null,on:false,up:.12,low:.125,hand:.055}]; // 옥좌 팔걸이
 const head=(x,y,z)=>SCULPT.ell(x,y,z,0,-.005,.015,.218,.25,.245);
 // The throne stays in world space as the actor stands up and moves away.
 // Include the gold cap, red support, and curled front end, not just the bone's resting point.
 function boxDistance(x,y,z,hx,hy,hz){
  const qx=Math.abs(x)-hx,qy=Math.abs(y)-hy,qz=Math.abs(z)-hz;
  return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0);
 }
 function armrest(x,y,z){
  if(typeof COMBAT_STAGE!=='undefined'&&COMBAT_STAGE.root.visible){
   const ax=Math.abs(x)-.62;
   return Math.min(boxDistance(ax,y-.78,z-.01,.065,.0225,.35),boxDistance(ax,y-.59,z-.01,.045,.165,.325));
  }
  const ax=Math.abs(x)-.6;
  return Math.min(boxDistance(ax,y-.77,z-.02,.06,.0225,.31),boxDistance(ax,y-.6,z-.02,.045,.15,.28),boxDistance(ax,y-.76,z-.34,.026,.08,.08));
 }
 function obstacle(c,mesh,sdf,chest){
  c.on=false;if(!mesh||mesh.userData.detached)return;
  mesh.updateWorldMatrix(true,false);c.m.copy(mesh.matrixWorld).invert().multiply(chest.matrixWorld);c.n.setFromMatrix4(c.m).transpose();c.sdf=sdf;c.on=true;
 }
 // 표본점 p가 허용 깊이보다 깊으면 겉면 법선 방향으로 밀 벡터를 push에 더한다
 function pushOut(c,thr,p){
  local.copy(p).applyMatrix4(c.m);const d=c.sdf(local.x,local.y,local.z);if(d>=thr-.0002)return false;
  const x=local.x,y=local.y,z=local.z,h=.002;
  n.set(c.sdf(x+h,y,z)-c.sdf(x-h,y,z),c.sdf(x,y+h,z)-c.sdf(x,y-h,z),c.sdf(x,y,z+h)-c.sdf(x,y,z-h)).applyMatrix3(c.n);
  if(n.lengthSq()<1e-12)n.set(p.x<0?-1:1,0,1);n.normalize();
  push.addScaledVector(n,thr-d);return true;
 }
 function lengths(a){
  ax.subVectors(E1,S);let l=ax.length()||1e-6;E1.copy(S).addScaledVector(ax,a.L1/l);
  ax.subVectors(W1,E1);l=ax.length()||1e-6;W1.copy(E1).addScaledVector(ax,a.L2/l);
 }
 // E1·W1(가슴 좌표계)을 제자리에서 몇 번 되풀이해 밀어낸다. 밀 게 없으면 첫 바퀴에서 끝난다
 function relax(a){
  hd.copy(DOWN).applyQuaternion(qH);
  for(let it=0;it<24;it++){
   let moved=false;
   for(const t of UP){p.lerpVectors(S,E1,t);push.set(0,0,0);let hit=false;for(const c of colliders)if(c.on&&pushOut(c,c.up*smooth((t-.25)/.75),p))hit=true;if(hit){moved=true;E1.addScaledVector(push,Math.min(2,1/t));}}
   for(const t of LOW){p.lerpVectors(E1,W1,t);push.set(0,0,0);let hit=false;for(const c of colliders)if(c.on&&pushOut(c,c.low,p))hit=true;if(hit){moved=true;E1.addScaledVector(push,1-t);W1.addScaledVector(push,t);}}
   for(const k of HAND){p.copy(W1).addScaledVector(hd,k);push.set(0,0,0);let hit=false;for(const c of colliders)if(c.on&&pushOut(c,c.hand,p))hit=true;if(hit){moved=true;W1.add(push);}}
   if(!moved)break;
   lengths(a);
  }
 }
 function outside(){
  function clear(p,kind,t=1){for(const c of colliders)if(c.on){local.copy(p).applyMatrix4(c.m);const radius=c[kind]*(kind==='up'?smooth((t-.25)/.75):1);if(c.sdf(local.x,local.y,local.z)<radius-.001)return false;}return true;}
  for(const t of UP)if(!clear(p.lerpVectors(S,E1,t),'up',t))return false;
  for(const t of LOW)if(!clear(p.lerpVectors(E1,W1,t),'low'))return false;
  hd.copy(DOWN).applyQuaternion(qH);for(const k of HAND)if(!clear(p.copy(W1).addScaledVector(hd,k),'hand'))return false;
  return true;
 }
 const proposedE=V3(),proposedW=V3();
 function solve(a,dt){
  if(a.sh.userData.detached||a.el.userData.detached||a.wr.userData.detached)return;
  S.copy(a.sh.position);a.el.getWorldPosition(E0).applyMatrix4(invChest);a.wr.getWorldPosition(W0).applyMatrix4(invChest);
  qU0.copy(a.sh.quaternion);qL0.copy(a.el.quaternion);qH.copy(qU0).multiply(qL0).multiply(a.wr.quaternion);
  // 지난 프레임의 손 방향에서 이번에 IK가 바라는 손 방향으로 따라간다. 예전에는 slerpQuaternions(a.safeH,qH)에 목표와 결과를
  // 같은 qH로 넘겨서(복사하는 순간 목표가 지워진다) 손 방향이 처음 잡힌 대로 굳어 있었다: 돈다발을 떨어뜨린 뒤에도
  // 돈 쥐던 손목 그대로 꺾여 있고, 손사래·얼굴 감싸기·막기에서도 손바닥이 바라는 쪽으로 돌지 않았다
  if(a.safeH){qWant.copy(qH);qH.copy(a.safeH).slerp(qWant,1-Math.exp(-12*Math.max(0,dt)));}
  // 이전의 안전한 팔 경로에서 목표를 따라간다. 매번 배 한가운데서 다시 풀면
  // 작은 자세 변화에도 팔꿈치가 몸의 반대편 해로 튀는 문제가 생긴다.
  if(a.safeE){
   if(E0.distanceToSquared(a.safeE)+W0.distanceToSquared(a.safeW)<1e-14){
    E1.copy(E0);W1.copy(W0);if(outside())return;
   }
   const cap=1.8*Math.max(0,dt),k=1-Math.exp(-8*Math.max(0,dt));
   E1.copy(a.safeE).add(d0.subVectors(E0,a.baseE).clampLength(0,cap)).lerp(E0,k);
   W1.copy(a.safeW).add(d0.subVectors(W0,a.baseW).clampLength(0,cap)).lerp(W0,k);
   lengths(a);
  }else{E1.copy(E0);W1.copy(W0);}
  relax(a);
  if(a.safeE){
   const distance=Math.max(E1.distanceTo(a.safeE),W1.distanceTo(a.safeW)),limit=1.35*Math.max(0,dt);
   if(distance>limit){
    proposedE.copy(E1);proposedW.copy(W1);
    E1.lerpVectors(a.safeE,proposedE,limit/distance);W1.lerpVectors(a.safeW,proposedW,limit/distance);lengths(a);
    if(!outside()){
     E1.copy(a.safeE);W1.copy(a.safeW);
     // A moving torso can invalidate the old position; in that case escape the collision immediately.
     if(!outside()){E1.copy(proposedE);W1.copy(proposedW);}
    }
   }
  }
  if(!a.safeE){a.safeE=V3();a.safeW=V3();a.baseE=V3();a.baseW=V3();}
  a.safeE.copy(E1);a.safeW.copy(W1);a.baseE.copy(E0);a.baseW.copy(W0);
  // 원래 회전에 '방향이 바뀐 만큼'만 얹는다(소매의 비틀림은 그대로)
  d0.subVectors(E0,S).normalize();d1.subVectors(E1,S).normalize();qD.setFromUnitVectors(d0,d1);qU.copy(qD).multiply(qU0);
  d0.subVectors(W0,E0).normalize();d1.subVectors(W1,E1).normalize();qD.setFromUnitVectors(d0,d1);
  qL.copy(qU).invert().multiply(qD).multiply(qU0).multiply(qL0);
  a.sh.quaternion.copy(qU);a.el.quaternion.copy(qL);
  // 손은 가슴 기준 방향을 그대로 두되, 손목이 소매 쪽으로 너무 꺾이면(0.85rad 넘게) 그만큼 풀어 준다
  hd.copy(DOWN).applyQuaternion(qH);fd.subVectors(W1,E1).normalize();
  const ang=Math.acos(Math.max(-1,Math.min(1,hd.dot(fd))));
  if(ang>.85){ax.crossVectors(hd,fd);if(ax.lengthSq()<1e-8)ax.set(0,0,a.s);ax.normalize();qT.setFromAxisAngle(ax,ang-.85);qH.premultiply(qT);}
  if(!a.safeH)a.safeH=new THREE.Quaternion();a.safeH.copy(qH);
  a.wr.quaternion.copy(qT.copy(qU).multiply(qL).invert().multiply(qH));
  a.sh.updateWorldMatrix(true,true);
 }
 function apply(E,dt=1/60){
  const chest=E.bones.chest;chest.updateWorldMatrix(true,false);invChest.copy(chest.matrixWorld).invert();
  obstacle(colliders[0],E.belly,BODYGEO.belly,chest);obstacle(colliders[1],E.chestMesh,BODYGEO.chest,chest);
  obstacle(colliders[2],!E.headGone&&!E.headDestroyed?E.face:null,head,chest);
  const throne=typeof COMBAT_STAGE!=='undefined'&&COMBAT_STAGE.root.visible?COMBAT_STAGE.throne:typeof WORLD!=='undefined'?WORLD.throne:null;
  obstacle(colliders[3],throne,armrest,chest);
  for(const a of E.arms)solve(a,dt);
 }
 return {apply};
})();

// Keep the hollow crown's rim outside the scalp while it tips. Reuse samples each frame.
const CROWN_FIT=(()=>{
 const rim=[],p=V3();
 for(const [r,y] of [[.166,-.03],[.158,.03],[.15,.09],[.1755,-.0385]])for(let i=0;i<96;i++)rim.push(V3(Math.sin(i*TAU/96)*r,y,Math.cos(i*TAU/96)*r));
 function apply(crown,rest,tilt){
  const t=clamp(tilt,0,1.15);
  crown.rotation.set(rest.r.x-t*.2,0,t*.45);
  crown.position.set(rest.p.x+t*.035,rest.p.y,rest.p.z);
  let lift=0;
  for(const v of rim){p.copy(v).applyQuaternion(crown.quaternion).add(crown.position);
   const r2=(p.x/.182)**2+((p.z+.028)/.192)**2;
   if(r2<1)lift=Math.max(lift,.045+.198*Math.sqrt(1-r2)+.002-p.y);
  }
  crown.position.y+=lift;
 }
 return {apply};
})();
// Build hidden, immutable regrowth geometry in short slices before it is needed.
function* prepareRegrowth(){
 if(!GEO.regrowSkull){const g=yield* SCULPT.starSteps(HEADGEO.rep,V3(0,0,.02),48,36,.34,{smooth:0});if(!GEO.regrowSkull)GEO.regrowSkull=g;else g.dispose();}
 if(!GEO.regrowJaw){const g=yield* SCULPT.starSteps(HEADGEO.repJaw,V3(0,-.14,.075),40,24,.2,{smooth:0});if(!GEO.regrowJaw)GEO.regrowJaw=g;else g.dispose();}
}
function warmCombatAssets(){
 const regrow=prepareRegrowth();let grown=false,eye=false;
 const run=()=>{
  if(document.hidden){setTimeout(run,250);return;}
  const until=performance.now()+4;
  if(!grown){do{grown=regrow.next().done;}while(!grown&&performance.now()<until);}
  else if(!eye)eye=BEYOND.prepare(4);
  if(!grown||!eye)setTimeout(run,16);
 };
 setTimeout(run,0);
}
class Emperor{
 constructor(result,lookIndex=0){
  this.result=result;this.lookIndex=lookIndex;
  this.bloodRawBase=0;
  this.root=grp(scene,null,'emperor');
  this.bones={};this.parts=[];this.flow={};this.decals=[];this.lumps=[];this.goreMeshes=[];this.disposables=[];
  this._materials();
  this._body();this._arms();this._legs();this._head();this._crown();this._halo();this._tablet();
  // 같은 뼈에 붙은 움직이지 않는 조각은 합쳐서 그리기 횟수를 줄인다
  this.root.updateMatrixWorld(true);for(const b of Object.values(this.bones))mergeChildren(b);mergeChildren(this.face);mergeChildren(this.belt);mergeChildren(this.crown);mergeChildren(this.board);for(const a of this.arms)mergeChildren(a.drape);mergeChildren(this.noseG);
  for(const r of [this.root,this.tablet])r.traverse(o=>{if(o.isMesh&&isFleshMat(o.material))ensureDmg(o.geometry);});
  this.root.updateMatrixWorld(true);const _ws=V3();
  this.root.traverse(o=>{if(o.isMesh&&o.castShadow){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.getWorldScale(_ws);if(o.geometry.boundingSphere.radius*Math.max(_ws.x,_ws.y,_ws.z)<.075)o.castShadow=false;}});
  this.root.traverse(o=>{if(o.isMesh){const s=o.userData.part==='halo'?'halo':this.segOf(o);o.userData.seg=s;if(o.userData.part&&!o.userData.noHit)this.parts.push(o);if(o.userData.flow){(this.flow[s]||(this.flow[s]=[])).push(o);}}});
  this.tabletMesh.userData.seg='pelvis';this.parts.push(this.tabletMesh);
  for(const k in this.flow)for(const m of this.flow[k])FASTRAY.grid(m.geometry);
  this.initState();
 }
 _materials(){
  const D=this.disposables,S=(hex,o)=>{const m=STD(hex,o);D.push(m);return m;};
  this.M={
   skin:S('#eda882',{roughness:.5}),skinD:S('#dc9572',{roughness:.55}),blush:S('#ef8f7a',{roughness:.5}),lip:S('#c65f55',{roughness:.38}),
   robe:S('#ffffff',{map:ROBE_TEX,roughness:.6}),hem:S('#ffffff',{map:HEM_TEX,roughness:.62}),robeIn:S('#6a4cc0',{roughness:.7,side:THREE.DoubleSide}),
   belly:S('#ffffff',{map:BELLY_TEX,roughness:.6}),chest:S('#ffffff',{map:CHEST_TEX,roughness:.6}),tie:S('#ffffff',{map:TIE_TEX,roughness:.42,side:THREE.DoubleSide}),shirt:S('#fbfbf6',{roughness:.55}),
   trim:S('#ffffff',{map:TRIM_TEX,roughness:.5}),red:S('#4a2e93',{roughness:.42}),white:S('#f4eee0',{roughness:.7}),
   amethyst:S('#8a5ae0',{roughness:.12,metalness:.1,emissive:col('#2a1060'),emissiveIntensity:.4}),ruby:S('#d01836',{roughness:.12,emissive:col('#4a0010'),emissiveIntensity:.4}),pearl:S('#fbf6ec',{roughness:.2}),
   crownEye:S('#ffffff',{map:CROWN_EYE_TEX,roughness:.32,metalness:.35,transparent:true,alphaTest:.45}),boardTop:S('#ffffff',{map:BOARD_TOP_TEX,roughness:.28}),
   repIris:S('#ffffff',{map:REP_IRIS_TEX,roughness:.18,emissive:col('#ffffff'),emissiveMap:REP_IRIS_TEX,emissiveIntensity:.28}),
   mem:S('#ffffff',{map:MEM_TEX,transparent:true,depthWrite:false,roughness:.08,metalness:0}),fork:S('#d81b47',{roughness:.3}),
   gold:S('#e4ae46',{metalness:.78,roughness:.3}),goldD:S('#a6731d',{metalness:.7,roughness:.42}),jade:S('#3b9a72',{roughness:.26}),jadeL:S('#8fd8b2',{roughness:.22}),
   lacquer:S('#171418',{roughness:.42,envMapIntensity:.35}),lacRed:S('#a51f18',{roughness:.45}),hair:S('#1f1919',{roughness:.6}),hairG:S('#77706b',{roughness:.6}),
   eyeW:S('#fbf7ee',{roughness:.16}),iris:S('#5b3520',{roughness:.22}),pupil:S('#090606',{roughness:.2}),lash:S('#181212',{roughness:.6}),hl:S('#ffffff',{emissive:col('#ffffff'),emissiveIntensity:.6,roughness:.1}),
   teeth:S('#f6efdc',{roughness:.28}),gum:S('#c25660',{roughness:.45}),mouth:S('#3a0a10',{roughness:.7,side:THREE.DoubleSide}),tongue:S('#cc5f66',{roughness:.42}),
   boot:S('#1b1718',{roughness:.36}),sole:S('#ece3cf',{roughness:.78}),trouser:S('#ffffff',{map:TROUSER_TEX,roughness:.62}),lining:S('#6a4cc0',{roughness:.7,side:THREE.BackSide}),
   beadJ:S('#5fc59a',{roughness:.2}),beadR:S('#d2402f',{roughness:.25}),beadW:S('#f6f0e2',{roughness:.25}),cord:S('#cf2f24',{roughness:.6}),
   tablet:S('#dbc391',{map:BANKNOTE_TEX,roughness:.9,side:THREE.DoubleSide}),
   // 사람 가죽 밑: 도마뱀 살(비늘)·발톱·파란 속
   liz:S('#ffffff',{map:LIZ_TEX(3,1),roughness:.4}),lizHand:S('#ffffff',{map:LIZ_TEX(1,1),roughness:.4}),lizIn:S('#9fd06a',{roughness:.5,side:THREE.DoubleSide}),
   // 다시 자랄 때: 뻗어 나오는 뼈, 뼈를 감싸는 파란 날살(젖어서 번들거린다)
   regBone:S('#e2dcc4',{roughness:.3}),rawFlesh:S('#ffffff',{map:rawFleshTex(),bumpMap:rawFleshTex(),bumpScale:.0034,roughness:.3,emissive:col('#0a1c5c'),emissiveIntensity:.18}),
   rawVessel:S('#3f6fe0',{roughness:.2,emissive:col('#10287a'),emissiveIntensity:.3}),
   claw:S('#f3ebd2',{roughness:.22}),blueCore:S('#1b45c4',{roughness:.2,emissive:col('#0a1c66'),emissiveIntensity:.35,side:THREE.DoubleSide}),
   lizEye:S('#ffffff',{map:REP_HEAD_IRIS_TEX,roughness:.23,emissive:col('#ffffff'),emissiveMap:REP_HEAD_IRIS_TEX,emissiveIntensity:.025}),lizEyeBall:S('#404936',{roughness:.3}),
   // 배 속(돼지저금통): 갈라진 천 가장자리
   slitLip:S('#f5eedf',{roughness:.6,side:THREE.DoubleSide}),
  };
  this.M.cavity=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});D.push(this.M.cavity);
  for(const k of ['liz','lizHand'])this.M[k].map.needsUpdate=true;
  // 빚은 살(꼭짓점 색으로 코끝·볼·눈가 혈색)과 뒷머리
  const M=this.M;
  M.flesh=S('#eda882',{roughness:.48,vertexColors:true});M.hairF=S('#231b1b',{roughness:.62});
  M.lizHead=S('#ffffff',{vertexColors:true});
  const repMemTex=MEM_TEX.clone();repMemTex.offset.x=0;repMemTex.needsUpdate=true;D.push(repMemTex);
  M.repMem=S('#d4dcca',{map:repMemTex,transparent:true,depthWrite:false,roughness:.16,opacity:.72});
  reptileMaterial(M.liz,1.6,1.1);reptileMaterial(M.lizHand,.8,.85,.0014);reptileMaterial(M.lizHead,2.2,1.7,.0028);
  M.lizIn.color.set('#7c8970');M.claw.color.set('#bcb395');M.lizEye.emissiveIntensity=.025;
  M.cutTissue=S('#96a7ad',{map:rawFleshTex(),bumpMap:rawFleshTex(),bumpScale:.0018,roughness:.67,side:THREE.DoubleSide});
  M.cutDepth=S('#0d1b29',{roughness:.83,side:THREE.DoubleSide});M.cutFascia=S('#839b9c',{roughness:.72,side:THREE.DoubleSide});
  M.cutSafe=S('#465847',{roughness:.9,side:THREE.DoubleSide});
  M.cutBone=S('#c3c2a4',{roughness:.62});M.cutMarrow=S('#1c3347',{roughness:.42});M.cutVessel=S('#27466a',{roughness:.28});
  // 빈 안와 바닥(어두운 속), 찢어져 피에 젖은 눈꺼풀, 드러난 뇌(젖은 결), 눈알에 딸려 나가는 시신경
  M.socket=S('#120d1d',{roughness:.78,side:THREE.DoubleSide});
  M.lidTorn=S('#9c6a86',{roughness:.62});
  M.brain=S('#ffffff',{vertexColors:true,roughness:.26,envMapIntensity:.8});
  M.nerve=S('#5b6f8e',{roughness:.5});
  M.bloodPool=S('#1a4fcf',{roughness:.12});
  // 찌그러지고 파이는 살 셰이더: 살·옷·바지·도마뱀
  for(const k of ['flesh','skin'])FLESH.patch(M[k],'skin',{sss:1});
  for(const k of ['robe','hem','belly','chest','hairF'])FLESH.patch(M[k],'cloth');
  FLESH.patch(M.trouser,'trouser');for(const k of ['liz','lizHand','lizHead'])FLESH.patch(M[k],'liz',{meatScale:60,sss:.12});
  reptileProjection(M.lizHead,3.6);M.lizHead.bumpScale=.0032;M.lizHead.roughness=.78;
  // 맞을 때 번쩍이는 재질
  this.flashMats=[M.flesh,M.skin,M.skinD,M.blush,M.robe,M.lip,M.hem,M.belly,M.chest,M.lizHead];
 }
 get bloodLost(){const raw=Math.max(0,BLOOD.rawLost-this.bloodRawBase);return 4.4*(1-Math.exp(-raw/2.4));}
 bone(name,parent,p){const g=grp(parent,p,name);g.userData.bone=name;this.bones[name]=g;g.userData.rest=g.position.clone();return g;}
 segOf(o){let n=o;while(n&&n!==this.root){if(n.userData.bone)return n.userData.bone;n=n.parent;}return 'pelvis';}

 /* 찌그러지는 살 메시 하나 붙이기(뼈 좌표 그대로, 위치·크기 변환 없이) */
 addFlesh(geo,mat,parent,o={}){
  const m=new THREE.Mesh(geo,mat);m.castShadow=o.cast!==false;m.receiveShadow=true;m.userData.part=o.part;m.userData.flow=o.flow!==false;m.userData.keep=true;
  if(o.partAt)m.userData.partAt=o.partAt;if(o.noHit)m.userData.noHit=true;parent.add(m);
  const f=new FLESH.Flesh(m,{kind:o.kind||mat.userData.fleshKind||'skin',center:o.center,axisA:o.axisA,axisB:o.axisB,maxFrac:o.maxFrac,maxAbs:o.maxAbs,minEdge:o.minEdge,releaseGeometry:g=>this.releaseGeometry(g)});
  (this.fleshList||(this.fleshList=[])).push(f);return m;
 }
 _body(){
  const M=this.M,B=this.bones,BG=BODYGEO.build();
  const pelvis=this.bone('pelvis',this.root,[0,.62,0]);
  const spine=this.bone('spine',pelvis,[0,.06,0]);
  // 배: 늘어진 똥배(돼지저금통). 출렁일 때는 가운데를 붙든 채 크기만 바뀐다
  this.belly=this.addFlesh(FLESH.clone(BG.belly),M.belly,spine,{part:'belly',center:BELLY_C,maxFrac:.42,maxAbs:.16,minEdge:.007});
  // Keep the attachment group, without the rigid ring that protruded through a deformed belly.
  const belt=grp(spine,[0,.035,.045]);belt.rotation.x=.2;this.belt=belt;
  // 옷자락: 허리띠 아래로 옆과 뒤만 두르고 앞은 터 있다(바지 입은 다리가 보이게). 안감은 보라
  this.apronF=grp(pelvis,[0,.07,0]);this.apronB=grp(pelvis,[0,.08,0]);
  {const gap=1.02,geo=new THREE.CylinderGeometry(.315,.4,.36,40,1,true,gap,TAU-gap*2);
   this.apronBMesh=mk(geo,M.hem,this.apronB,{p:[0,-.18,0],part:'pelvis',flow:true});
   mk(geo,M.lining,this.apronB,{p:[0,-.18,0],s:[.992,1,.992],cast:false});}
  this.apronFMesh=null;
  // 가슴(어깨 위 살·가슴살까지 한 덩어리)
  const chest=this.bone('chest',spine,[0,.24,-.01]);
  this.chestMesh=this.addFlesh(FLESH.clone(BG.chest),M.chest,chest,{part:'chest',center:V3(0,.13,0),maxFrac:.4,maxAbs:.12,minEdge:.007});
  // 깃: 와이셔츠 깃(목둘레). 앞섶과 영대는 가슴·배 그림에 그려져 있다
  mk(new THREE.TorusGeometry(.125,.028,10,40),M.shirt,chest,{p:[0,.29,.035],r:[PI/2+.38,0,0],s:[1,1.05,1],part:'chest'});
  this._tie(chest);
  // 목
  const neck=this.bone('neck',chest,[0,.265,0]);
  this.neckMesh=this.addFlesh(FLESH.clone(BG.neck),M.skin,neck,{part:'neck',axisA:V3(0,-.04,.02),axisB:V3(0,.125,.028),maxFrac:.45,maxAbs:.06});
 }

 /* 와이셔츠 깃 + 넥타이: 매듭은 가슴에, 넥타이 몸통은 배에 붙어 배를 타고 내려간다(배가 출렁이면 같이 출렁).
  * 배에 붙은 부분은 배 메시의 단위 구 좌표로 만든다(배 크기 a·b·c로 늘어난다). */
 _tie(chest){
  const M=this.M,b=this.belly,A=.345,B=.295,C=.325,cy=.16,cz=.06,CH=V3(0,.24,-.01);
  const toChest=(x,y,z)=>V3(x-CH.x,y-CH.y,z-CH.z);
  // 깃 끝 두 장(얇은 삼각 판)
  const tri=(a,b2,c,th)=>{const n=V3().subVectors(b2,a).cross(V3().subVectors(c,a));if(n.z<0){const t=b2;b2=c;c=t;n.negate();}n.normalize().multiplyScalar(th);
   const P=[a,b2,c,a.clone().sub(n),b2.clone().sub(n),c.clone().sub(n)],pos=[];for(const p of P)pos.push(p.x,p.y,p.z);
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex([0,1,2,3,5,4,0,3,1,1,3,4,1,4,2,2,4,5,2,5,0,0,5,3]);g.computeVertexNormals();return g;};
  for(const s of [-1,1]){
   const g=tri(toChest(s*.022,.49,.203),toChest(s*.094,.506,.142),toChest(s*.054,.428,.198),.005);
   mk(g,M.shirt,chest,{part:'chest',flow:true,cast:false});
  }
  // 매듭(윈저 매듭): 위가 넓은 사다리꼴
  const ks=new THREE.Shape();ks.moveTo(-.025,.021);ks.lineTo(.025,.021);ks.lineTo(.014,-.022);ks.lineTo(-.014,-.022);ks.closePath();
  const kg=new THREE.ExtrudeGeometry(ks,{depth:.012,bevelEnabled:true,bevelThickness:.006,bevelSize:.004,bevelSegments:3,curveSegments:4});kg.translate(0,0,-.006);
  const knot=mk(kg,M.tie,chest,{p:[0,.222,.205],r:[-.28,0,0],part:'chest',flow:true,cast:false});knot.userData.keep=true;this.tieKnot=knot;
  // 넥타이 몸통: 매듭 뒤에서 시작해 배 위로 내려와 빚은 배 겉면을 따라 간다(배 좌표). 끝은 V자로 뾰족
  const lift=.0055,sdf=BODYGEO.belly,cen=BELLY_C,_d=V3(),_n=V3();
  const onB=(th,x,lf)=>{const s=Math.sin(th),c=Math.cos(th),dp=Math.asin(clamp(x/(A*Math.max(.2,s)),-.95,.95));_d.set(Math.sin(dp)*s*A,c*B,Math.cos(dp)*s*C).normalize();
   const p=BODYGEO.onSurf(sdf,cen,_d,V3(),_n);return p.addScaledVector(_n,lf);};
  const top=V3(0,.46,.194),th0=34*PI/180,th1=74*PI/180;
  const s0=onB(th0,0,lift),Lh=top.distanceTo(s0);let Ls=0;{let prev=s0;for(let k=1;k<=20;k++){const p=onB(th0+(th1-th0)*k/20,0,lift);Ls+=p.distanceTo(prev);prev=p;}}
  const L=Lh+Ls,tipL=.036,N=40;
  const wAt=d=>d<Lh?lerp(.044,.058,d/Lh):d<L-tipL?lerp(.058,.084,(d-Lh)/(Ls-tipL)):.084*(L-d)/tipL;
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=N;i++){const d=i/N*L,hw=wAt(d)/2;let l,r;
   if(d<Lh){const c=top.clone().lerp(s0,d/Lh);l=c.clone();l.x-=hw;r=c.clone();r.x+=hw;}
   else{const t=th0+(d-Lh)/Ls*(th1-th0);l=onB(t,-hw,lift);r=onB(t,hw,lift);}
   pos.push(l.x,l.y,l.z,r.x,r.y,r.z);uv.push(0,1-d/L,1,1-d/L);
   if(i<N){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));tg.setIndex(idx);tg.computeVertexNormals();tg.computeBoundingSphere();
  const tie=this.tie=mk(tg,M.tie,b,{part:'belly',flow:true,cast:false});tie.userData.keep=true;tie.userData.bellyLayer=true;
  // 금 넥타이핀
  const tb=48*PI/180,bp=onB(tb,0,lift+.003);
  mk(new THREE.BoxGeometry(.078,.0062,.004),M.gold,tie,{p:[bp.x,bp.y,bp.z],r:[tb-PI/2,0,0],cast:false,part:'belly'});
 }
 /* 배가 갈라지면 그 위의 넥타이는 잘려 떨어진다 */
 cutTie(){
  const t=this.tie;if(!t||t.userData.detached)return;
  t.updateWorldMatrix(true,false);scene.attach(t);t.userData.detached=true;t.traverse(o=>{o.userData.detached=true;});
  this.parts=this.parts.filter(o=>o!==t&&o.parent!==t);
  if(this.flow.spine)this.flow.spine=this.flow.spine.filter(o=>o!==t);this._flowAll=null;
  this.bits=this.bits||[];this.bits.push({obj:t,v:V3(rnd(-.3,.3),rnd(.2,.6),rnd(.4,.9)),w:V3(rnd(-2,2),rnd(-2,2),rnd(-3,3)),r:.03,corners:this.limbCorners(t),bounce:.05});
 }
 _arms(){
  const M=this.M;this.arms=[];
  for(const s of [-1,1]){
   const nm=s<0?'L':'R';
   // 위팔·아래팔은 가운데에 뼈를 하나 더 둔다(그은 자리 가까이에서 잘리게)
   const sh=this.bone('shoulder'+nm,this.bones.chest,[s*.265,.19,.1]);
   const BG=BODYGEO.build(),ap='arm'+nm,ax=(a,b)=>({axisA:V3(0,a,0),axisB:V3(0,b,0)});
   this.addFlesh(FLESH.clone(BG.shoulder),M.robe,sh,Object.assign({part:ap,center:V3(0,-.05,0),maxFrac:.4,maxAbs:.06}));
   const um=this.bone('uarmMid'+nm,sh,[0,-.118,0]);
   this.addFlesh(FLESH.clone(BG.uarm),M.robe,um,Object.assign({part:ap,maxFrac:.42,maxAbs:.06},ax(.01,-.13)));
   const el=this.bone('elbow'+nm,um,[0,-.117,0]);
   this.addFlesh(FLESH.clone(BG.elbow),M.robe,el,Object.assign({part:ap,maxFrac:.42,maxAbs:.06},ax(.04,-.11)));
   const fm=this.bone('farmMid'+nm,el,[0,-.108,0]);
   this.addFlesh(FLESH.clone(BG.farm),M.robe,fm,Object.assign({part:ap,maxFrac:.42,maxAbs:.06},ax(.01,-.137)));
   mk(new THREE.TorusGeometry(.083,.016,8,30),M.trim,fm,{p:[0,-.135,0],r:[PI/2,0,0],part:'arm'+nm});
   mk(cylGeo(.078,.078,.012,24,true),M.robeIn,fm,{p:[0,-.139,0],cast:false});
   // 소매 안감: 뚫린 소매 아가리 속을 메우는 컵(안쪽 면만 그린다). 맞힘 판정에는 넣지 않는다
   mk(BG.farmLining.clone(),M.lining,fm,{cast:false}).userData.noHit=true;
   // 넓은 소매 자락: 팔을 앞으로 들면 아래로 늘어진다
   // (늘어진 자락은 맞힘 판정에서 뺀다: 배 앞에 늘어져 있어도 칼·총이 그 뒤 배에 닿게)
   const drape=grp(fm,[0,-.012,0]);const sleeve=mk(sphereGeo(26),M.robe,drape,{p:[0,-.055,0],s:[.1,.11,.065],flow:true});sleeve.userData.noHit=true;
   const wr=this.bone('wrist'+nm,fm,[0,-.107,0]);
   const hand=this._hand(wr,s,'hand'+nm);
   this.arms.push({s,nm,sh,um,el,fm,wr,hand,sleeve,drape,L1:.235,L2:.215});
  }
 }
 _hand(wr,s,part){
  const M=this.M,h={fingers:[],thumb:null},BG=BODYGEO.build();
  this.addFlesh(FLESH.clone(BG.wrist),M.skin,wr,{part,axisA:V3(0,.025,0),axisB:V3(0,-.034,0),maxFrac:.4,maxAbs:.02});
  h.palm=this.addFlesh(FLESH.clone(BG.palm),M.skin,wr,{part,center:V3(0,-.06,.004),maxFrac:.35,maxAbs:.018});
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
  // 반지: 약지에 보라 보석 인장 반지, 새끼손가락에 붉은 보석 반지(손등 쪽이 s 방향).
  // 고리는 손가락(손 좌표 y축)을 감싸게 눕힌다(x축으로 90도). 예전에는 z축으로 돌려서 고리가 손가락과 직각으로 서 있었다
  mk(new THREE.TorusGeometry(.0128,.0046,6,16),M.gold,h.fingers[2].f,{p:[0,-.016,0],r:[PI/2,0,0],cast:false});
  mk(new THREE.BoxGeometry(.006,.009,.014),M.gold,h.fingers[2].f,{p:[s*.0135,-.016,0],cast:false});
  mk(sphereGeo(10),M.amethyst,h.fingers[2].f,{p:[s*.0168,-.016,0],s:[.0026,.0042,.0055],cast:false});
  mk(new THREE.TorusGeometry(.0112,.004,6,16),M.gold,h.fingers[3].f,{p:[0,-.012,0],r:[PI/2,0,0],cast:false});
  mk(sphereGeo(10),M.ruby,h.fingers[3].f,{p:[s*.0148,-.012,0],s:[.0028,.004,.0045],cast:false});
  // 금시계(왼손목): 넓은 소매 끝에서 손목에 걸쳐 보인다
  if(s<0){const wg=grp(wr,[0,-.047,.004]);
   mk(new THREE.TorusGeometry(.036,.0075,8,28),M.gold,wg,{r:[PI/2,0,0],s:[.84,1.48,1],cast:false,part});
   const face=grp(wg,[s*.034,0,0]);face.rotation.z=PI/2;
   mk(cylGeo(.017,.018,.009,24),M.gold,face,{cast:false,part});mk(cylGeo(.0138,.0138,.0016,24),M.pearl,face,{p:[0,.0052,0],cast:false});
   mk(new THREE.BoxGeometry(.0018,.0016,.011),M.lacquer,face,{p:[0,.0062,.002],cast:false});mk(new THREE.BoxGeometry(.008,.0016,.0018),M.lacquer,face,{p:[.003,.0062,0],cast:false});}
  return h;
 }

 _legs(){
  const M=this.M,BG=BODYGEO.build();this.legs=[];
  // 바지 엉덩이(가랑이를 덮는다)
  this.addFlesh(FLESH.clone(BG.seat),M.trouser,this.bones.pelvis,{part:'pelvis',center:V3(0,-.035,0),maxFrac:.35,maxAbs:.07});
  for(const s of [-1,1]){
   const nm=s<0?'L':'R',ax=(a,b)=>({axisA:V3(0,a,0),axisB:V3(0,b,0)});
   // 허벅지·정강이도 가운데에 뼈를 하나 더 둔다
   const hip=this.bone('hip'+nm,this.bones.pelvis,[s*.135,-.02,0]);
   this.addFlesh(FLESH.clone(BG.hip),M.trouser,hip,{part:'thigh'+nm,center:V3(0,-.06,0),maxFrac:.4,maxAbs:.07});
   const tm=this.bone('thighMid'+nm,hip,[0,-.145,0]);
   this.addFlesh(FLESH.clone(BG.thigh),M.trouser,tm,Object.assign({part:'thigh'+nm,maxFrac:.42,maxAbs:.07},ax(.012,-.152)));
   const knee=this.bone('knee'+nm,tm,[0,-.145,0]);
   this.addFlesh(FLESH.clone(BG.knee),M.trouser,knee,{part:'shin'+nm,center:V3(0,-.05,0),maxFrac:.4,maxAbs:.06});
   const sm=this.bone('shinMid'+nm,knee,[0,-.128,0]);
   this.addFlesh(FLESH.clone(BG.shin),M.trouser,sm,Object.assign({part:'shin'+nm,maxFrac:.42,maxAbs:.06},ax(.01,-.132)));
   // 대님(발목 끈)
   mk(new THREE.TorusGeometry(.086,.0085,8,26),M.red,sm,{p:[0,-.114,0],r:[PI/2,0,0],part:'shin'+nm,cast:false});
   const ank=this.bone('ankle'+nm,sm,[0,-.127,0]);
   // 신발(흑화): 발목 통·발등·코가 한 덩어리인 검은 가죽 신에 두꺼운 상아색 밑창(앞코가 살짝 들린다)
   const BT=BOOTGEO();
   mk(BT.body.clone(),M.boot,ank,{part:'foot'+nm});
   mk(BT.sole.clone(),M.sole,ank,{part:'foot'+nm});
   this.legs.push({s,nm,hip,tm,knee,sm,ank});
  }
 }

 _head(){
  const M=this.M,G=HEADGEO.build(),zF=HEADGEO.zFront;
  
const head=this.bone('head',this.bones.neck,[0,.06,.03]);
const F=this.face=grp(head,[0,.215,0],'face');


  this.faceRest=F.position.clone();
  this.headFlesh=[];this.feat=[];
  const flesh=(geo,mat,parent,o)=>{const m=this.addFlesh(geo,mat,parent,Object.assign({minEdge:.0048},o));this.headFlesh.push(m.userData.flesh);return m;};
  // 맞은 자리로 부위 이름을 정한다(코·입·얼굴·머리)
  const partAt=p=>{const ax=Math.abs(p.x);if(p.z>.205&&ax<.05&&p.y>-.062&&p.y<.07)return 'nose';if(p.z>.15&&ax<.095&&p.y<-.06&&p.y>-.13)return 'mouth';if(p.z>.06&&p.y<.13)return 'face';return 'head';};
  // 머리 한 덩어리(두개골·볼살·이중턱·코)
  this.skull=flesh(FLESH.clone(G.head),M.flesh,F,{part:'head',partAt,center:V3(0,-.012,.004),maxFrac:.46,maxAbs:.095});
  this.jowls=[];
  // 가면이 벗겨질 때 떨어져 나가는 사람 얼굴 부품(귀·콧수염·머리카락)은 합치지 않고 따로 둔다
  this.maskParts=[];const keep=m=>{m.userData.keep=true;this.maskParts.push(m);return m;};
  // 귀: 오른쪽 귀를 빚어 왼쪽은 뒤집어 쓴다
  this.earMeshes=[];
  for(const s of [-1,1]){
   const g=G.ear.clone();if(s<0)mirrorX(g);g.translate(s*.2,.022,-.012);
   const m=keep(flesh(g,M.flesh,F,{part:'head',center:V3(s*.2,.002,-.008),maxFrac:.35,maxAbs:.02}));m.userData.ear=s<0?0:1;this.earMeshes.push(m);
  }
  // 뒷머리(면류관 밑으로 보이는 검은 머리)
  this.hairMesh=keep(flesh(FLESH.clone(G.hair),M.hairF,F,{part:'head',kind:'cloth',center:V3(0,.03,-.04),maxFrac:.3,maxAbs:.03}));
  // 코: 콧구멍과 코피 자리만 따로 잡아 둔다(코는 머리 덩어리에 빚어져 있다)
  this.noseG=grp(F,[0,-.032,.248]);
  this.nostrils=[];
  for(const s of [-1,1]){const nn=mk(sphereGeo(10),M.mouth,this.noseG,{p:[s*.017,-.027,-.004],s:[.0105,.0052,.0095],r:[.25,0,0],cast:false,part:'nose'});nn.userData.keep=true;nn.userData.noHit=true;this.nostrils.push(nn);}
  this.feat.push({o:this.noseG,p:this.noseG.position.clone()});
  // 눈
  this.eyes=[];
  for(const s of [-1,1]){
   const eg=grp(F,[s*.076,.05,.154]);eg.rotation.y=s*.12;
   this.feat.push({o:eg,p:eg.position.clone()});
   const gaze=grp(eg);
   const r=.041;
   const orb=mk(sphereGeo(28),M.eyeW,gaze,{s:r,part:'eye'+(s<0?'L':'R')});
   // 홍채·동공은 눈알 겉면에 거의 붙여 둔다(눈을 덮고 지나가는 막이 그 위로 지나가야 한다)
   const iris=mk(sphereGeo(24),M.iris,gaze,{p:[0,0,.0345],s:[.022,.022,.0072],part:'eye'+(s<0?'L':'R'),cast:false});
   const pupil=mk(GEO.pupil||(GEO.pupil=new THREE.CircleGeometry(1,20)),M.pupil,gaze,{p:[0,0,.0419],s:[.0115,.0115,1],cast:false,part:'eye'+(s<0?'L':'R')});
   const hl=mk(sphereGeo(10),M.hl,eg,{p:[-.012,.013,r+.004],s:.0055,cast:false});
   const up=grp(eg),lo=grp(eg);
   const upLid=mk(capGeo(r*1.13,0,PI/2,28),M.skin,up,{part:'eye'+(s<0?'L':'R'),flow:true});
   const lash=mk(new THREE.TorusGeometry(r*1.13,.0042,6,28,PI),M.lash,up,{r:[PI/2,0,0],cast:false});
   const loLid=mk(capGeo(r*1.1,PI/2,PI/2,28),M.skin,lo,{part:'eye'+(s<0?'L':'R'),flow:true});
   // 정체가 드러날 때 쓰는 금빛 파충류 홍채와, 코 쪽에서 옆으로 덮고 지나가는 반투명 막(평소엔 숨김)
   const repIris=mk(eyeCapGeo(r*1.008,.86,false),M.repIris,gaze,{cast:false,part:'eye'+(s<0?'L':'R')});repIris.visible=false;
   const mem=mk(eyeCapGeo(r*1.045,1.25,s>0),M.mem,eg,{cast:false});mem.visible=false;mem.renderOrder=3;mem.userData.noHit=true;
   this.eyes.push({s,eg,gaze,orb,iris,pupil,hl,up,lo,upLid,loLid,lash,r,open:1,swell:0,ruined:false,ejected:false,socket:null,repIris,mem});
  }
  // 눈썹(움직이는 관): 눈썹뼈 살 위에 얹는다. 맞아서 살이 꺼지면 같이 꺼진다(점마다 눌린 양)
  this.brows=[];
  this.browBase=[];{const xs=[.026,.054,.083,.11,.134,.152],ys=[.104,.109,.11,.107,.1,.089];for(let i=0;i<6;i++)this.browBase.push({x:xs[i],y:ys[i],z:zF(xs[i],ys[i])+.002});}
  for(const s of [-1,1]){const t=new DynTube(6,7,M.hair,{cast:false});F.add(t.mesh);t.mesh.userData.part='head';t.mesh.userData.keep=true;t.mesh.userData.noHit=true;this.brows.push({s,tube:t,pts:Array.from({length:6},()=>V3()),off:Array.from({length:6},()=>V3())});}
  // 입: 입술 2개 + 입속 + 이 + 혀. 입술은 인중·턱 살 위에 얹는다
  this.mouthC=V3(0,-.1,.2);
  this.lipZ=[];for(let i=0;i<13;i++){const u=i/12*2-1;this.lipZ.push(zF(u*.07,-.1)+.004);}
  this.lipOffU=Array.from({length:13},()=>V3());this.lipOffL=Array.from({length:13},()=>V3());
  this.lipU=new DynTube(13,8,M.lip);this.lipL=new DynTube(13,8,M.lip);
  F.add(this.lipU.mesh);F.add(this.lipL.mesh);this.lipU.mesh.userData.keep=this.lipL.mesh.userData.keep=true;this.lipU.mesh.userData.part='mouth';this.lipL.mesh.userData.part='mouth';
  this.lipPtsU=Array.from({length:13},()=>V3());this.lipPtsL=Array.from({length:13},()=>V3());
  {const n=13,pos=new Float32Array(n*2*3),idx=[];for(let i=0;i<n-1;i++){const a=i,b=i+1,c=n+i,d=n+i+1;idx.push(a,c,b,b,c,d);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setIndex(idx);g.computeVertexNormals();this.mouthIn=mk(g,M.mouth,F,{cast:false,part:'mouth'});this.mouthIn.frustumCulled=false;this.mouthIn.userData.keep=true;}
  const jaw=this.bone('jaw',F,[0,-.03,-.02]);this.jaw=jaw;
  this.chin=flesh(FLESH.clone(G.chin),M.flesh,jaw,{part:'chin',center:V3(0,-.13,.13),maxFrac:.4,maxAbs:.05});
  this.teethU=[];this.teethL=[];
  for(let i=0;i<8;i++){const x=(i-3.5)*.0155,z=.165-Math.pow(x/.06,2)*.012;const t=mk(sphereGeo(10),M.teeth,F,{p:[x,-.083,z],s:[.0078,.0115,.0062],cast:false,part:'mouth'});t.userData.tooth=true;t.userData.keep=true;this.teethU.push(t);}
  for(let i=0;i<6;i++){const x=(i-2.5)*.015,z=.172-Math.pow(x/.06,2)*.012;const t=mk(sphereGeo(10),M.teeth,jaw,{p:[x,-.067,z+.02],s:[.007,.0095,.0058],cast:false,part:'mouth'});t.userData.tooth=true;t.userData.keep=true;this.teethL.push(t);}
  this.tongue=mk(sphereGeo(16),M.tongue,jaw,{p:[0,-.074,.155],s:[.042,.014,.04],cast:false,part:'mouth'});this.tongue.userData.keep=true;
  // 갈라진 혀(평소엔 숨김): 정체가 드러나면 가끔 날름거린다
  // 입술 사이(매 프레임 입 가운데로 옮긴다)에서 앞아래로 뻗는다
  {const ts=new THREE.Shape();ts.moveTo(-.0075,0);ts.lineTo(-.008,.088);ts.lineTo(-.015,.122);ts.lineTo(-.0036,.097);ts.lineTo(0,.101);ts.lineTo(.0036,.097);ts.lineTo(.015,.122);ts.lineTo(.008,.088);ts.lineTo(.0075,0);ts.closePath();
   const fg=new THREE.ExtrudeGeometry(ts,{depth:.005,bevelEnabled:true,bevelThickness:.002,bevelSize:.0016,bevelSegments:2,curveSegments:2});fg.rotateX(PI/2);fg.translate(0,.0025,0);
   const fork=grp(F,[0,-.108,.17]);fork.rotation.x=.5;const fm=mk(fg,M.fork,fork,{cast:false});fm.userData.noHit=true;fm.userData.keep=true;fork.visible=false;this.fork={g:fork,k:-1};}
  // 콧수염(끝이 늘어진 팔자 수염): 인중 살 위에서 시작해 입꼬리 밖으로 늘어진다
  this.mustache=[];
  for(const s of [-1,1]){const P=[[.008,-.07,.009],[.05,-.078,.009],[.09,-.1,.007],[.116,-.14,.003],[.128,-.19,-.028]].map(([x,y,l])=>[s*x,y,Math.max(zF(x,y),.12)+l]);
   const m=keep(mk(taperTube(P,.0135,.003,26,9),M.hair,F,{part:'mouth'}));m.userData.noHit=true;this.mustache.push(m);this.feat.push({o:m,p:m.position.clone(),a:V3(s*.07,-.08,P[1][2])});}
  // 턱수염: 두 가닥, 흔들린다
  this.beard=[];
  const bRoot=grp(jaw,[0,-.206,.166]);
  // 가운데 가닥은 넥타이 매듭이 보이게 비워 둔다
  for(const [x,len,w] of [[-.056,.24,.019],[.056,.24,.019]]){
   const segs=[];let parent=grp(bRoot,[x,0,-.006]);const n=3;
   for(let k=0;k<n;k++){const g=grp(parent,k===0?null:[0,-len/n,0]);const r0=w*(1-k*.22),r1=Math.max(.003,w*(1-(k+1)*.22));mk(taperTube([[0,.006,0],[x*.06,-len/(2*n),.003],[0,-len/n,0]],r0,r1,8,8),k>=n-1?M.hairG:M.hair,g,{part:'beard',cast:k<2});segs.push({g,sx:new Spring(55,3.8),sz:new Spring(55,3.8)});parent=g;}
   this.beard.push(segs);
  }
  this.bRoot=bRoot;this.headR=.24;
 }

 _crown(){
  const M=this.M;
  const cr=this.crown=grp(this.face,[0,.205,-.015],'crown');cr.rotation.x=-.05;
  this.crownRest={p:cr.position.clone(),r:cr.rotation.clone()};
  // 속관도 붉은 칠로 마감해 떨어졌을 때 검은 원통 덩어리로 보이지 않게 한다
  // Open underside: a solid bottom disk cut straight through the head when tilted.
  mk(cylGeo(.15,.166,.12,32,true),M.lacRed,cr,{p:[0,.03,0],part:'crown'});
  const capMat=M.lacRed.clone();capMat.side=THREE.DoubleSide;this.disposables.push(capMat);
  mk(new THREE.CircleGeometry(.15,32),capMat,cr,{p:[0,.09,0],r:[-PI/2,0,0],part:'crown'});
  mk(cylGeo(.179,.183,.054,48,true),M.gold,cr,{p:[0,-.006,0],part:'crown'});
  for(const y of [.021,-.033])mk(new THREE.TorusGeometry(.181,.0055,6,56),M.goldD,cr,{p:[0,y,0],r:[PI/2,0,0],part:'crown',cast:false});
  // 금관 뾰족 장식(면판 아래까지만 솟는다) + 끝에 진주, 테에는 자수정·옥
  const spike=GEO.crownSpike||(GEO.crownSpike=new THREE.ConeGeometry(1,1,4));
  for(let i=0;i<14;i++){const a=(i+.5)/14*TAU;if(Math.abs(wrapPi(a))<.3)continue;
   const sx=Math.sin(a),cz=Math.cos(a);
   const m=mk(spike,M.gold,cr,{p:[sx*.18,.05,cz*.18],s:[.019,.055,.007],part:'crown'});m.rotation.y=a;
   mk(sphereGeo(10),M.pearl,cr,{p:[sx*.181,.082,cz*.181],s:.008,part:'crown',cast:false});
   if(i%2===0){const j=mk(sphereGeo(12),i%4===0?M.amethyst:M.jade,cr,{p:[sx*.185,-.006,cz*.185],s:[.012,.014,.007],part:'crown',cast:false});j.rotation.y=a;}
  }
  // 정면: 빛살 속 삼각형 눈
  mk(new THREE.PlaneGeometry(.082,.082),M.crownEye,cr,{p:[0,.026,.187],r:[-.04,0,0],part:'crown',cast:false});
  // 면판: 떨어져 회전해도 검은 상자처럼 보이지 않도록 붉은 칠과 금 테로 마감한다
  const board=grp(cr,[0,.115,0]);board.rotation.x=.12;this.board=board;
  mk(new THREE.BoxGeometry(.45,.016,.27),M.lacRed,board,{p:[0,.01,0],part:'crown'});
  mk(new THREE.BoxGeometry(.44,.006,.26),M.lacRed,board,{p:[0,-.002,0],part:'crown',cast:false});
  mk(new THREE.BoxGeometry(.46,.004,.28),M.gold,board,{p:[0,.0005,0],part:'crown',cast:false});
  mk(GEO.boardTop||(GEO.boardTop=new THREE.PlaneGeometry(.448,.268)),M.boardTop,board,{p:[0,.0185,0],r:[-PI/2,0,0],part:'crown',cast:false});
  for(const z of [-.121,.121])mk(new THREE.BoxGeometry(.452,.004,.018),M.goldD,board,{p:[0,.021,z],part:'crown',cast:false});
  for(const x of [-.211,.211])mk(new THREE.BoxGeometry(.018,.004,.26),M.goldD,board,{p:[x,.021,0],part:'crown',cast:false});
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

 /* 후광: 머리 뼈 뒤에 붙는다. 바깥 고리(별자리)는 시계 반대로, 안쪽 고리(팔괘)는 시계 방향으로 천천히 돈다 */
 _halo(){
  const S=HALO_SRC(),H=HALO,D=this.disposables;
  const tex=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d',TEX_CTX);g.drawImage(src,0,0);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.userData={canvas:c,ctx:g};D.push(t);return t;};
  const basic=(map,o={})=>{const m=new THREE.MeshBasicMaterial(Object.assign({map,transparent:true,alphaTest:.3,side:THREE.DoubleSide,toneMapped:false},o));D.push(m);return m;};
  const T={zod:tex(S.zod),tri:tex(S.tri),flame:tex(S.flame),plate:tex(S.plate),glow:tex(S.glow)};
  const M={zod:basic(T.zod),tri:basic(T.tri),flame:basic(T.flame,{alphaTest:.12}),plate:basic(T.plate,{alphaTest:.5}),glow:basic(T.glow,{alphaTest:0,depthWrite:false}),gold:STD('#ecb84a',{metalness:.8,roughness:.28})};D.push(M.gold);
  const root=grp(this.bones.head,[0,.3,-.268],'halo'),tilt=grp(root),o=p=>Object.assign({cast:false,receive:false},p);
  const glow=mk(new THREE.CircleGeometry(H.RG,64),M.glow,tilt,o({p:[0,0,-.006]}));glow.renderOrder=-2;glow.userData.noHit=true;
  const flames=mk(polarRing(H.R3-.004,H.RF,120),M.flame,tilt,o({p:[0,0,-.003],part:'halo'}));flames.renderOrder=-1;
  const plate=mk(new THREE.CircleGeometry(H.R0+.003,64),M.plate,tilt,o({p:[0,0,-.0015],part:'halo'}));
  const inner=mk(polarRing(H.R0,H.R1,160),M.tri,tilt,o({part:'halo'}));
  const outer=mk(polarRing(H.R2,H.R3,160),M.zod,tilt,o({part:'halo'}));
  const RIM=[[H.R0,.0058],[(H.R1+H.R2)/2,.0048],[H.R3,.0058]];
  const rims=RIM.map(([r,t])=>mk(new THREE.TorusGeometry(r,t,6,128),M.gold,tilt,o({p:[0,0,.0015],part:'halo'})));
  inner.rotation.z=rnd(0,TAU);outer.rotation.z=rnd(0,TAU);
  this.halo={root,tilt,glow,flames,plate,inner,outer,rims,RIM,T,M,on:true,stage:0,hits:0,sp:new Spring3(60,4.2),tilt0:V3(),prevQ:null,
   spI:-.16,spO:.11,stutT:rnd(1,2),freeze:0,flT:rnd(1,2),flN:0,flOff:false,bright:1,dark:0,goDark:false,fallAt:0,falling:null,broken:false};
 }

 _tablet(){
  const t=this.tablet=grp(scene,null,'tablet');
  this.tabletMesh=mk(banknoteStack(),this.M.tablet,t,{part:'tablet'});
  this.tabletHeld=true;this.tabletBody=null;
 }
 destroy(){
  for(const f of (this.fleshList||[]))f.disposeWork();
  const shared=new Set(Object.values(GEO)),geos=new Set();const visit=o=>{if(o.geometry&&!shared.has(o.geometry)&&!o.userData.sharedGeo)geos.add(o.geometry);};
  const roots=[this.root,this.crown,this.tablet,this.halo&&this.halo.root,this.tie,...(this.bits||[]).filter(b=>!b.dead).map(b=>b.obj)];
  for(const r of roots){if(!r)continue;r.traverse(visit);r.removeFromParent();}
  const disposed=new Set();geos.forEach(g=>{g.dispose();disposed.add(g);});
  for(const m of this.disposables)if(m&&m.dispose&&!disposed.has(m)){disposed.add(m);m.dispose();}
  this.disposables.length=0;
 }
}
/* ===== 6-2. 운명 설계자 — 얼굴 표정 ===== */
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
  this.repFull=false;this.repFlash=0;this.repAt=0;this.deadStare=0;this.memK=-1;this.memOnce=false;this.reveal=null;this._repOn=null;MEM_TEX.offset.x=0;
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
  // 말할 때: 음절마다 벌리는 크기가 다르게(로봇처럼 똑같이 뻐끔거리지 않게)
  if(this.talk>.01){this.talkPhase+=dt*TAU*5.2;const amp=.55+.45*Math.sin(this.talkPhase*.43+1.7),w=Math.max(0,Math.sin(this.talkPhase))*amp*this.talk;T.mOpen+=w*.95;T.jaw+=w*.55;T.mWide+=Math.sin(this.talkPhase*.71)*.16*this.talk;}
  // 덜덜 떨 때는 턱이 딱딱 부딪히고 입술도 떨린다
  const trm=this.tremble||0;if(trm>.08&&this.talk<.2){const ch=Math.max(0,Math.sin(time*44+.7))*Math.min(1,trm);T.mOpen+=ch*.1;T.jaw+=ch*.06;T.mWide+=Math.sin(time*29)*.04*trm;}
  if(time<this.mouthCoinUntil&&!this.headGone&&!this.jawGone){
   T.mOpen=Math.max(T.mOpen,.9);T.jaw=Math.max(T.jaw,.85);T.mWide=-.12;T.pucker=.2;T.mSmile=0;T.mSmirk=0;
  }
  const r=instant?1:1-Math.exp(-dt*(this.flinch>.3?30:this.talk>.2?26:16));
  for(const k of EXPR_KEYS)f[k]=lerp(f[k],T[k],r);
  for(const k of ['bY','bIn','bOut'])for(let i=0;i<2;i++)f[k][i]=lerp(f[k][i],T[k][i],r);
  this._applyBrows(f,time);this._applyEyes(f,blinkClose,dt,time);this._applyMouth(f,time);
  for(let i=0;i<2;i++)this.cheekD[i].step(dt);
 },
 _applyBrows(f,time){
  const B=this.browBase;if(!B)return;
  for(let bi=0;bi<2;bi++){const b=this.brows[bi],s=b.s,side=s<0?0:1;if(b.gone)continue;
   const raise=f.bY[side]*.016,inner=f.bIn[side]*.015,outer=f.bOut[side]*.011;
   for(let i=0;i<6;i++){const u=i/5,q=B[i],x=s*(q.x-(1-u)*Math.min(0,f.bIn[side])*.004),y=q.y+raise+inner*(1-u)*(1-u)+outer*u*u-(f.bIn[side]<0?(1-u)*.004:0);
    // 눈썹이 올라가면 이마 쪽으로 조금 물러난다
    const z=q.z-Math.max(0,y-q.y)*.35+(f.bIn[side]<0?(1-u)*.003:0),o=b.off[i];b.pts[i].set(x+o.x,y+o.y,z+o.z);}
   b.tube.update(b.pts,[.0052,.0092,.0108,.0104,.0084,.0048]);
  }
 },
 _applyEyes(f,blinkClose,dt,time){
  // 시선: 기본은 나(카메라)를 본다. 겁먹으면 흔들린다
  this.gazeJitT-=dt;if(this.gazeJitT<=0){this.gazeJitT=this.emo==='scared'||this.emo==='beg'?rnd(.18,.5):rnd(.6,2.2);this.gazeJit.set(rnd(-1,1),rnd(-.6,.6),0).multiplyScalar(this.emo==='scared'?.12:.035);}
  const tgt=_fv1.copy(this.gazeTarget).add(this.gazeJit);
  for(let i=0;i<2;i++){const e=this.eyes[i];
   if(e.ejected&&!e.lizard){
    // 빈 안와: 찢어진 윗꺼풀이 비뚤게 반쯤 내려앉고 아랫꺼풀은 늘어진다(살색 그대로 남아 멀쩡한 자리처럼 보이지 않게)
    const r=e.r,T=e.lidTorn||{up:.6,lo:.3,skew:0},yu=lerp(.7,-.15,T.up)*r,yl=lerp(-.78,-.95,T.lo)*r;
    e.up.rotation.x=Math.asin(clamp(-yu/(r*1.13),-1,1));e.up.rotation.z=T.skew;e.lo.rotation.x=Math.asin(clamp(-yl/(r*1.1),-1,1));
    e.up.scale.set(1.02,1.02,1.02);e.lo.scale.set(1.04,1.06,1.04);continue;}
   e.eg.updateWorldMatrix(true,false);
   const l=_fv2.copy(tgt);e.eg.worldToLocal(l);
   let yaw=Math.atan2(l.x,l.z),pitch=-Math.atan2(l.y,Math.hypot(l.x,l.z));
   if(this.dizzy>0){yaw+=Math.sin(time*3.1+i*2)*.35*this.dizzy;pitch+=Math.cos(time*2.7+i)*.25*this.dizzy;}
   if(this.emo==='ko'&&!(this.deadStare>.3)){pitch=-.45;yaw=e.s*.08;}
   e.gaze.rotation.set(clamp(pitch,-.4,.35),clamp(yaw,-.5,.5),0);
   const sw=this.swellU[i];
   const r=e.r,yl=lerp(-.72,-.08,sat(f.lidL+sw*.25))*r;
   let open=f.lidU*(1-blinkClose)*(1-sw*.85);if(this.deadStare>0)open=lerp(open,.6*(1-sw*.6),this.deadStare);if(e.ruined)open=Math.min(open,.12);
   const yu=lerp(yl+.06*r,.86*r,sat(open));
   e.up.rotation.x=Math.asin(clamp(-yu/(r*1.13),-1,1));e.lo.rotation.x=Math.asin(clamp(-yl/(r*1.1),-1,1));
   const puff=1+sw*.26;e.up.scale.set(puff,puff*1.03,puff);e.lo.scale.set(puff,puff*1.06,puff);
   if(!e.lizard){const dil=this.emo==='scared'||this.emo==='shock'?1.25:this.emo==='smug'?.85:1;e.pupil.scale.set(.0115*dil,.0115*dil,1);}
  }
  // 파충류 눈: 잠깐 비치거나(크게 맞은 뒤) 다 쓰러진 뒤 그대로
  const rep=!!(this.repFull||this.repFlash>0);
  if(rep!==this._repOn){this._repOn=rep;for(const e of this.eyes){if(e.ejected)continue;e.repIris.visible=rep;e.iris.visible=!rep;e.pupil.visible=!rep;}}
 },
 _applyMouth(f,time){
  const C=this.mouthC,n=13,U=this.lipPtsU,L=this.lipPtsL;
  const w=.066*(1+.28*f.mWide-.3*f.pucker);
  // 턱이 빠졌으면(jawDisloc) 입이 다물어지지 않고 아래턱이 비뚤게 늘어진다. 턱이 떨어졌으면(jawGone) 윗입술·윗니만 남는다
  const D=this.jawDisloc,da=D&&!this.jawGone?D.sp.x:0,side=D?D.side:1;
  const open=sat(f.mOpen+da*.2),jaw=sat(f.jaw),gap=sat(f.mGap);
  const tremble=((this.emo==='cry'||this.emo==='scared'||this.emo==='beg')?Math.sin(time*31)*.0015:0)+(this.tremble||0)*Math.sin(time*46.5)*.0012;
  const rU=[],rL=[],LZ=this.lipZ,lz=x=>{const t=clamp((x/.07+1)/2*12,0,12),i=Math.min(11,Math.floor(t)),k=t-i;return lerp(LZ[i],LZ[i+1],k);};this._lz=lz;
  const scream=sat((f.mOpen-.5)*2)*sat(f.jaw*2);
  for(let i=0;i<n;i++){
   const u=i/(n-1)*2-1,x=u*w,c=Math.pow(Math.abs(u),2.2),m=1-u*u,mm=Math.pow(m,.75);
   let corner=f.mSmile*.017*c+f.mSmirk*.02*c*(u>0?1:-.2);
   const yU=C.y+.004*m+(open*.012+gap*.012)*mm+corner+tremble+scream*.006*mm;
   const yL=C.y-.003*m-(open*.026+jaw*.048+gap*.01)*Math.pow(m,.65)+corner*.85-tremble;
   const z=lz(x)+.006*f.pucker*m-scream*.008*m,oU=this.lipOffU[i],oL=this.lipOffL[i];
   U[i].set(x+oU.x,yU+oU.y,z+oU.z);L[i].set(x+oL.x,yL+oL.y,z+.002+oL.z);
   rU.push(.0098*(1-.5*Math.pow(Math.abs(u),4))*(1+.15*f.pucker));rL.push(.0118*(1-.5*Math.pow(Math.abs(u),4))*(1+.15*f.pucker));
  }
  this.lipU.update(U,rU);
  const lipY=(arr,x)=>{const t=clamp((x/w+1)/2*(n-1),0,n-1),i=Math.min(n-2,Math.floor(t)),k=t-i;return lerp(arr[i].y,arr[i+1].y,k);};
  const lipZ=x=>lz(x)-.006;
  if(this.jawGone||!this.jaw||this.jaw.userData.detached){
   // 아래턱이 없다: 윗니가 전부 드러난 채 윗입술 밑에 매달려 있다(아랫입술·입속·혀는 턱과 같이 갔거나 목구멍에 매달려 있다)
   this.teethU.forEach((t,i)=>{const x=(i-3.5)*.0152*(w/.066);const top=lipY(U,x)-.006,h=.0115;t.visible=!t.userData.gone&&Math.abs(x)<w*.86;t.scale.set(.0078,h,.0062);t.position.set(x,top-h*.92,lipZ(x)+.003);});
   return;
  }
  // 빠진 턱: 아랫입술 점들을 턱 관절(얼굴 좌표 (0,-.03,-.02))을 축으로 턱과 똑같이 돌리고 옆으로 민다
  if(da>.001){const jp=_fv2.set(0,-.03,-.02);_fm.makeRotationX(da*.3).multiply(_fm2.makeRotationZ(side*da*.22));
   for(let i=0;i<n;i++){const v=L[i];v.sub(jp).applyMatrix4(_fm).add(jp);v.x+=side*da*.012;}}
  this.lipL.update(L,rL);
  // 입속(어두운 면): 입술 사이
  const P=this.mouthIn.geometry.attributes.position.array;
  for(let i=0;i<n;i++){const a=U[i],b=L[i];P[i*3]=a.x;P[i*3+1]=a.y-.002;P[i*3+2]=a.z+.0015;P[(n+i)*3]=b.x;P[(n+i)*3+1]=b.y+.002;P[(n+i)*3+2]=b.z+.0005;}
  this.mouthIn.geometry.attributes.position.needsUpdate=true;this.mouthIn.geometry.computeBoundingSphere();
  // 이: 벌어진 만큼만 보인다
  this.teethU.forEach((t,i)=>{const x=(i-3.5)*.0152*(w/.066);const top=lipY(U,x)-.006,bot=lipY(L,x)+.007,g=top-bot;
   const h=Math.min(.0115,Math.max(0,g*.55));t.visible=!t.userData.gone&&h>.0022&&Math.abs(x)<w*.86;t.scale.set(.0078,h,.0062);t.position.set(x,top-h*.92,lipZ(x)+.003);});
  // 아랫니는 턱뼈에 붙어 있으므로 턱 좌표로 옮겨 계산
  this.jaw.rotation.set(jaw*.34+da*.3,0,side*da*.22);this.jaw.position.x=side*da*.012;
  this.teethL.forEach((t,i)=>{const x=(i-2.5)*.0148*(w/.066);const top=lipY(U,x)-.006,bot=lipY(L,x)+.006,g=top-bot;
   const h=Math.min(.0095,Math.max(0,g*.32));t.visible=!t.userData.gone&&h>.0022&&Math.abs(x)<w*.75;
   _fv1.set(x,bot+h*.9,lipZ(x)+.002);this.jaw.updateMatrix();_fm.copy(this.jaw.matrix).invert();_fv1.applyMatrix4(_fm);t.position.copy(_fv1);t.scale.set(.007,h,.0058);});
  const tg=lipY(U,0)-lipY(L,0);this.tongue.visible=tg>.03||da>.3;
  if(this.tongue.visible){_fv1.set(0,lipY(L,0)+.011,C.z-.004);this.jaw.updateMatrix();_fm.copy(this.jaw.matrix).invert();_fv1.applyMatrix4(_fm);this.tongue.position.copy(_fv1);}
 },
});
const _fv1=V3(),_fv2=V3(),_fm=new THREE.Matrix4(),_fm2=new THREE.Matrix4();
/* ===== 6-3. 운명 설계자 — 자세·움직임 =====
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
 floor:P({tz:-.18,py:-.5,pF:-.2,sF:-.32,cF:-.06,nF:.3,hF:.2,hR:-.18,LsA:.55,RsA:.55,LsF:-.8,RsF:-.8,LeB:.15,ReB:.15,LwF:-.6,RwF:-.6,Lcurl:.05,Rcurl:.05,LhF:1.35,RhF:1.28,LhA:.32,RhA:.38,LkB:.45,RkB:.3,LaF:.2,RaF:.25}),
 // 마지막: 옥좌 발판에 기대 주저앉아 늘어짐
 // 팔은 힘없이 바닥에 늘어지고 손바닥은 위를 보며 반쯤 말린다. 고개는 옆으로 떨군다
 final:P({tz:-.2,py:-.5,pF:-.22,sF:-.2,cF:-.05,nF:.06,hF:.06,hR:.55,hT:.22,LsA:.78,RsA:.88,LsF:.05,RsF:-.05,LsT:-.25,RsT:.3,LeB:.3,ReB:.2,LwF:-.25,RwF:-.35,LwA:.2,RwA:.25,Lcurl:.45,Rcurl:.5,LhF:1.32,RhF:1.18,LhA:.42,RhA:.52,LkB:.38,RkB:.22,LaF:.3,RaF:.35}),
};

Object.assign(Emperor.prototype,{
 initState(){
  this.pose=P();poseCopy(STAND,this.pose);this.poseFrom=P();this.poseTmp=P();this.poseTmp2=P();
  this.state='stand';this.stateT=0;this.down=null;this.alive=true;
  this.sp={pelvis:new Spring3(90,11),spine:new Spring3(105,11),chest:new Spring3(115,11),neck:new Spring3(130,11),head:new Spring3(135,10.4),
   root:new Spring3(26,9),drop:new Spring(85,10),L:new Spring3(90,10),R:new Spring3(90,10),Lk:new Spring(70,9),Rk:new Spring(70,9),
   squash:new Spring3(300,13),belly:new Spring3(170,8)};
  this.cheekD=[new Spring(320,15),new Spring(320,15)];this.whiteFlash=0;this.bigEvent=false;this.faceHits=0;this.faceCuts=0;
  this.rootPos=V3();this.rootVel=V3();this.stepPhase=0;this.stepAmt=0;
  this.ik={L:{w:0,goal:0,target:V3(),fd:V3(0,-1,0),pd:V3(),curl:.3,space:'root'},R:{w:0,goal:0,target:V3(),fd:V3(0,-1,0),pd:V3(),curl:.3,space:'root'}};
  this.act=null;this.actQueue=[];this.guard=0;this.guardGoal=0;this.guardHP=3;this.guardCool=0;this.guardHold=0;
  this.limp=[0,0];this.armHurt=[0,0];this.hunch=0;this.weak=0;this.mood=0;this.sinceHit=99;this.hitsRecent=[];
  this.panic=0;this.tremble=0;this.flailSeed=0;this.calmUntil=0;this.whimperT=0;
  this.cutStrokeFallback=0;this.detached=new Set();
  this.limbCut={armL:{hits:0,last:null},armR:{hits:0,last:null},legL:{hits:0,last:null},legR:{hits:0,last:null}};this.armLimp=[0,0];this.legLimp=[0,0];this.regrowQ=[];
  this.abd=null;this.abdomenStage=0;this.abdomenOpen=false;this.abdomenCavity=null;this.coinQ=0;this.coinPow=0;this.coinAcc=0;this.coinCool=0;
  this.mouthCoinQ=0;this.mouthCoinAcc=0;this.mouthCoinCool=0;this.mouthCoinDelay=0;this.mouthCoinUntil=0;this.mouthCoinPower=0;
  this.unmasked=false;this.memAt=0;this._ikFrame=0;this._ikUse={L:-1,R:-1};this.rest={L:{on:false,p:V3(),fd:V3(),pd:V3()},R:{on:false,p:V3(),fd:V3(),pd:V3()}};this.patT=rnd(3,6);this.pat=null;

  this.headGunHits=0;this.eyeGunHits=[0,0];this.headDone={};this.headDestroyed=false;this.headRuin=null;
  this.headGone=false;this.headKind='human';this.headTear=0;this.regrowHead=null;
  this.resetHeadDamage();
  this.laughing=0;this.taunt=true;this.phase=0;this.breath=rnd(0,TAU);
  this.prevHeadQ=new THREE.Quaternion();this.headAngVel=V3();
  this.initFace();
  this.applyPose(this.pose);this.root.updateMatrixWorld(true);this.bones.head.getWorldQuaternion(this.prevHeadQ);
  this.placeTablet();
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
  // 목을 두 번 베이면 머리가 꺾여 덜렁거린다(loll)
  const lo=this.loll;B.neck.rotation.set(p.nF+sp.neck.X+(lo?lo.sp.x:0),p.nT+sp.neck.Y,-p.nR+sp.neck.Z+(lo?lo.sr.x:0));
  if(B.head&&!B.head.userData.detached)B.head.rotation.set(p.hF+sp.head.X,p.hT+sp.head.Y,-p.hR+sp.head.Z);
  
  
for(const a of this.arms){const n=a.nm,s=a.s,j=sp[n];
 if(!a.sh.userData.detached)a.sh.rotation.set(-(p[n+'sF'])+j.X,s*p[n+'sT']+j.Y,s*p[n+'sA']+j.Z);
 if(!a.el.userData.detached)a.el.rotation.set(-p[n+'eB'],0,0);
 if(!a.wr.userData.detached)a.wr.rotation.set(-p[n+'wF'],0,s*p[n+'wA']);
}



  for(const l of this.legs){const n=l.nm,s=l.s;
   if(!l.hip.userData.detached)l.hip.rotation.set(-p[n+'hF'],0,s*p[n+'hA']);
   if(!l.knee.userData.detached)l.knee.rotation.set(p[n+'kB']+sp[n+'k'].x,0,0);
   if(!l.ank.userData.detached)l.ank.rotation.set(-p[n+'aF'],0,0);
  }
  // 앞자락은 허벅지를 따라 들린다
  const fl=Math.max(0,(p.LhF+p.RhF)/2+(sp.drop.x<0?-sp.drop.x*1.5:0));
  if(!this.apronF.userData.detached)this.apronF.rotation.x=-clamp(fl*.92-.05,0,1.5);
  if(!this.apronB.userData.detached)this.apronB.rotation.x=clamp(-Math.min(p.LhF,p.RhF)*.6,0,.6)+fl*.12;
  this.belt.rotation.x=.2;
  // 몸 출렁임(배는 가운데를 붙든 채 부풀었다 줄었다)
  const bj=sp.belly,bs=this.bellyScale||(this.bellyScale=V3(1,1,1));bs.set(1+bj.X,1+bj.Y,1+bj.Z);
  this.belly.scale.copy(bs);this.belly.position.set(BELLY_C.x*(1-bs.x),BELLY_C.y*(1-bs.y),BELLY_C.z*(1-bs.z));
 },
 setCurl(a,c){if(a.wr.userData.detached)return;const s=a.s,h=a.hand,cc=clamp(c,-.1,1.2);
  // 돈다발: 부채 자루를 쥐듯 네 손가락을 꽉 말아 쥐어 지폐 밑동을 주먹 속에 감춘다(엄지가 위, 새끼손가락이 아래).
  // 예전처럼 반쯤 편 손가락 끝을 지폐 앞면에 얹으면 손가락 끝 네 개가 지폐 위에 구슬처럼 붙어 보였다
  if(this.tabletHeld&&a.nm==='R'){
   for(let i=0;i<4;i++){const f=h.fingers[i];f.f.rotation.set(0,0,-s*(1.38+i*.03));f.f2.rotation.set(0,0,-s*1.5);}
   // 엄지는 위로 세워 지폐 뒷면을 눌러 받친다(앞에서 보면 지폐 뒤에 가린다)
   h.thumb.t.rotation.set(-.93,0,-s*.1);h.thumb.t2.rotation.set(0,0,-s*.15);return;
  }
  for(let i=0;i<4;i++){const f=h.fingers[i];const k=cc*(1+i*.04);f.f.rotation.set(0,0,-s*k*1.45);f.f2.rotation.set(0,0,-s*k*1.55);}
  h.thumb.t.rotation.set(-.5-cc*.5,0,-s*(.5+cc*.55));h.thumb.t2.rotation.set(0,0,-s*cc*.9);
 },

 /* ---- 팔 IK: 손을 정해진 자리에 ---- */
 solveArm(a,ik,dt=1/60){
  if(ik.w<.001){ik.follow=null;return;}
  if(a.sh.userData.detached||a.el.userData.detached||a.wr.userData.detached)return;
  const chest=this.bones.chest;chest.updateWorldMatrix(true,false);
  const T=_av1.copy(ik.target);
  if(ik.space==='root')this.root.localToWorld(T);
  chest.worldToLocal(T);
  // Weight alone did not smooth an already active IK: a new action snapped the target.
  const seatedStart=!a.safeE&&this.combat&&this.combat.mode==='seat';
  if(!ik.follow)ik.follow=seatedStart?T.clone():chest.worldToLocal(a.wr.getWorldPosition(V3()));
  ik.follow.lerp(T,1-Math.exp(-(ik.rate||8)*dt));T.copy(ik.follow);
  const S=a.sh.position,pole=_av2.set(S.x+a.s*.35,S.y-.2,S.z+.18);
  if(ik.pole)pole.copy(S).add(ik.pole);
  _av10.subVectors(T,S).clampLength(Math.abs(a.L1-a.L2)+.001,a.L1+a.L2-.001);T.copy(S).add(_av10);
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
  if(seatedStart)ik.w=1;
  const w=smooth(ik.w);
  a.sh.quaternion.slerp(qU,w);a.el.quaternion.slerp(qE,w);if(qH)a.wr.quaternion.slerp(qH,w);
 },
 setIK(side,o){const a=this.arms[side==='L'?0:1],ik=this.ik[side];if(!o.rest)this._ikUse[side]=this._ikFrame;if(a&&(a.sh.userData.detached||a.el.userData.detached||a.wr.userData.detached)){ik.goal=0;return;}ik.goal=o.w==null?1:o.w;if(o.target)ik.target.copy(o.target);if(o.fd)ik.fd.copy(o.fd);if(o.pd)ik.pd.copy(o.pd);if(o.curl!=null)ik.curl=o.curl;ik.space=o.space||'root';if(o.pole){if(!ik.pole)ik.pole=V3();ik.pole.copy(o.pole);}else ik.pole=null;ik.rate=o.rate||8;},
 releaseIK(side,rate=6){const ik=this.ik[side];ik.goal=0;ik.rate=rate;},

 /* 한 손에 쥔 돈다발. 접히는 축은 주먹 안에 두고 드러난 지폐 끝만 부친다. */
 placeTablet(){
  if(!this.tabletHeld)return;
  const hand=this.arms[1].wr,t=this.tablet;
  hand.updateWorldMatrix(true,false);
  // 지폐 밑동은 쥔 주먹 속(손바닥과 말아 쥔 손가락 사이)에 있고, 지폐는 엄지·검지 쪽(위)으로 빠져나와 부채꼴로 벌어진다. 앞면은 손가락이 뻗는 쪽(앞)을 본다.
  // 예전에는 새끼손가락 쪽으로 빠져나오게 해서, 지폐를 위로 세우려니 주먹이 거꾸로(엄지가 아래로) 뒤집혀 있었다.
  // 부채 축(banknoteStack의 PIVOT, .06)이 주먹 윗단(손 좌표 z=.045)에 온다. 실물(오만원권)의 1.4배쯤
  t.position.copy(hand.localToWorld(_av1.set(-.028,-.085,.045-.06*.8)));
  t.quaternion.copy(hand.getWorldQuaternion(_aq1));
  t.rotateX(PI/2);t.scale.setScalar(.8);
 },
 dropTablet(force){
  if(!this.tabletHeld)return;this.tabletHeld=false;
  const v=force?force.clone():V3(rnd(-.6,.6),1.2,1.2);
  this.tabletBody={v,w:V3(rnd(-8,8),rnd(-4,4),rnd(-10,10)),rest:false};
  this.releaseIK('L',5);this.releaseIK('R',5);
 },
 updateTablet(dt){
  const b=this.tabletBody;if(!b||b.rest)return;
  const t=this.tablet;b.v.y-=9.8*dt;t.position.addScaledVector(b.v,dt);
  t.rotation.x+=b.w.x*dt;t.rotation.y+=b.w.y*dt;t.rotation.z+=b.w.z*dt;
  if(t.position.y<.03){
   t.position.y=.03;
   b.v.y*=-.25;b.v.x*=.5;b.v.z*=.5;b.w.multiplyScalar(.4);if(Math.abs(b.v.y)<.3){b.rest=true;t.position.y=.011;t.rotation.set(-PI/2,0,t.rotation.y);}// 판을 바닥에 납작하게 눕힌다(돌던 각도는 바닥 위 방향으로만 남긴다. 예전에는 모서리로 선 채 멈추곤 했다)
  }
 },

 /* ---- 맞는 반응: 방향·부위·힘에 따라 ----
  * 맞는 순간 그 자세로 바로 옮겨 놓고(push) 더 밀려나도록 속도도 준다(kick).
  * 그래서 멈춤(히트스톱) 동안 맞은 모습이 그대로 보이고, 풀리면 더 꺾였다가 돌아온다. */
 kickBody(part,dirW,power,kind,pt){
  const d=_av1.copy(dirW).applyQuaternion(_aq1.copy(this.root.quaternion).invert());
  const sp=this.sp,P_=Math.min(power,3);
  const head=/head|face|nose|mouth|chin|eye|crown|beard/i.test(part);
  if(head){
   const up=kind==='upper'||d.y>.45,back=Math.max(0,-d.z),side=d.x;
   const pitch=-(up?.46:.38*back+.06)*P_,yaw=side*.42*P_,roll=-side*.24*P_;
   sp.head.push(pitch,yaw,roll,1.05);sp.head.kick(pitch*6,yaw*6,roll*6);
   sp.neck.push(pitch*.4,yaw*.35,roll*.35,.6);sp.neck.kick(pitch*2.6,yaw*2.6,roll*2.2);
   sp.chest.push(pitch*.12,yaw*.16,roll*.1,.35);sp.chest.kick(pitch*1.4,yaw*2,roll*1.1);
   sp.spine.kick(pitch*.7,yaw*1.1,0);
   // 얼굴이 맞은 방향으로 눌린다
   const s=.12*Math.min(P_,1.8);
   sp.squash.push(-Math.abs(side)*s+back*s*.3,up?-s*.8:-back*s*.35,-back*s*1.1+Math.abs(side)*s*.25,.3);
   if(up){sp.drop.push(.03*P_,.08);sp.drop.kick(.7*P_);}
   // 맞은 쪽 볼살이 들어간다
   if(pt&&this.face&&this.headKind!=='rep'){const lx=this.face.worldToLocal(_av3.copy(pt)).x;const i=lx<0?0:1;this.cheekD[i].push(.04*Math.min(P_,2),.06);this.cheekD[i].kick(.3*P_);}
   this.rootVel.addScaledVector(_av2.set(side*.9,0,-back-(up?.25:0)),.42*P_);
   if(this.state==='stand'){this.rootPos.z-=.02*P_*back;this.rootPos.x+=.018*P_*side;}
  }else if(part==='belly'||part==='pelvis'){
   // 배: 몸이 앞으로 접히며 숙인다(너무 접히면 머리가 화면에 박히므로 한도를 둔다)
   const fold=.22*Math.min(P_,1.45);
   sp.spine.push(fold,d.x*.12*P_,-d.x*.1*P_,.45);sp.spine.kick(fold*3.6,d.x*1.4*P_,-d.x*1.2*P_);
   sp.chest.push(fold*.45,0,0,.3);sp.chest.kick(fold*2.2,0,0);
   sp.head.push(fold*.3,d.x*.1*P_,0,.35);sp.head.kick(fold*2.4,d.x*1.2*P_,0);
   sp.pelvis.push(-fold*.35,0,0,.4);
   sp.belly.push(.13*P_,-.11*P_,-.2*P_,.35);sp.belly.kick(1.4*P_,-1.2*P_,-1.6*P_);
   sp.drop.push(-.02*P_,.08);sp.drop.kick(-.5*P_);
   this.rootVel.addScaledVector(_av2.set(d.x*.6,0,-1),.36*P_);
  }else if(part==='chest'||part==='neck'){
   const b=-.2*P_*Math.max(.35,-d.z);
   sp.chest.push(b,d.x*.2*P_,-d.x*.15*P_,.6);sp.chest.kick(b*4,d.x*2*P_,-d.x*1.6*P_);
   sp.spine.push(b*.4,0,0,.4);sp.spine.kick(b*2,0,0);
   // 가슴을 맞으면 머리는 앞으로 휘청인다
   sp.head.push(.16*P_,d.x*.12*P_,0,.5);sp.head.kick(2.4*P_,d.x*1.2*P_,0);
   this.rootVel.addScaledVector(_av2.set(d.x*.7,0,-1),.42*P_);
  }else if(/^arm|^hand/.test(part)){
   const side=part.endsWith('L')?'L':'R';
   sp[side].push(-.22*P_*Math.max(.3,-d.z),d.x*.15*P_,d.x*.3*P_,.8);sp[side].kick(d.z*-3.5*P_,d.x*2*P_,d.x*3*P_);
   sp.chest.push(0,d.x*.12*P_,0,.3);sp.chest.kick(0,d.x*1.6*P_,0);
   this.rootVel.addScaledVector(_av2.set(d.x,0,Math.min(0,d.z)),.18*P_);
  }else if(/^thigh|^shin|^foot/.test(part)){
   const side=part.endsWith('L')?'L':'R';
   sp[side+'k'].push(.3*P_,.9);sp[side+'k'].kick(5*P_);
   sp.drop.push(-.03*P_,.1);sp.drop.kick(-.9*P_);
   sp.pelvis.push(0,0,(side==='L'?1:-1)*.08*P_,.3);sp.pelvis.kick(0,0,(side==='L'?1:-1)*1.2*P_);
  }
 },

 /* ---- 매 프레임 ---- */
 update(dt,time){
  if(combatActive(this))combatStep(this,dt);
  this.stateT+=dt;this.sinceHit+=dt;this.breath+=dt*(1.6+this.mood*1.4);this._ikFrame++;
  this.talk=damp(this.talk||0,G.time<(this.talkUntil||0)?1:0,14,dt);
  // 맞은 뒤의 긴장만 짧게 남긴다. 단계가 높아졌다고 팔이 영구히 떨지는 않는다.
  this.panic=Math.max(0,this.panic-dt/1.9);
  const calm=G.time<this.calmUntil,trG=G.mode==='fight'&&this.state!=='dead'&&!this.taunt&&this.sinceHit<2.6?([0,.08,.12,.16,.2][this.phase]||0)*Math.exp(-this.sinceHit/1.1)*(calm?.3:1)+this.panic*.18:0;
  this.tremble=damp(this.tremble,trG,4,dt);
  const p=this.poseTmp;this.basePose(p,dt,time);
  if(this.shockT>0)this.shockT-=dt;else this.setEmotion(this.baseEmotion());
  if(this.state==='stand')this.updateIdle(dt,time);
  // 스프링·뿌리 이동
  for(const k in this.sp)this.sp[k].step(dt);
  this.updateHeadDamage(dt);
  if(combatActive(this)){this.rootPos.set(0,0,0);this.rootVel.set(0,0,0);}
  else {
  if(this.state!=='stand')this.rootVel.set(0,0,0);
  this.rootPos.addScaledVector(this.rootVel,dt);this.rootVel.multiplyScalar(Math.exp(-dt*4.2));
  const home=this.state==='stand'?1:0;this.rootPos.x=damp(this.rootPos.x,0,1.4*home,dt);this.rootPos.z=damp(this.rootPos.z,0,1.25*home,dt);
  this.rootPos.z=clamp(this.rootPos.z,-.42,.12);this.rootPos.x=clamp(this.rootPos.x,-.25,.25);
  // 걸음: 뿌리가 움직이면 발을 번갈아 뗀다
  const sp=this.rootVel.length()+Math.abs(this.rootPos.z)*.5*(this.state==='stand'?1:0);this.stepAmt=damp(this.stepAmt,clamp(sp*2.2,0,1),8,dt);this.stepPhase+=dt*(5+sp*8);
  if(this.state==='stand'&&this.stepAmt>.02){const a=Math.sin(this.stepPhase)*.38*this.stepAmt;p.LhF+=a;p.RhF-=a;p.LkB+=Math.max(0,a)*1.3;p.RkB+=Math.max(0,-a)*1.3;p.py-=this.stepAmt*.025;}
  }
  poseCopy(p,this.pose);this.applyPose(this.pose);
  combatFloor(this);
  // 팔 IK
  this.root.updateMatrixWorld(true);
  this.updateRevive(dt);
  for(const a of this.arms){const ik=this.ik[a.nm];ik.w=damp(ik.w,ik.goal,ik.rate||8,dt);this.solveArm(a,ik,dt);this.setCurl(a,lerp(this.pose[a.nm+'curl'],ik.curl,smooth(ik.w)));}
  this.root.updateMatrixWorld(true);
  this.updateFace(dt,time);this.updateTears(time);this.updateRepFace(dt,time);
  ARM_CLEARANCE.apply(this,dt);
  if(this.fleshList)for(const f of this.fleshList)if(f.mesh.parent)f.update(dt);
  this.updateSecondary(dt);this.updateBelly(dt);this.updateRegrow(dt);this.updateHeadRegrow(dt);
  if(this.tabletHeld)this.placeTablet();else this.updateTablet(dt);
  this.updateBits(dt);this.updateDangles(dt,time);this.updateTethers(dt);this.crownUpdate(dt);this.haloUpdate(dt);this.updateReveal(dt);
  this.updateMaterials(dt);
 },
 updateSecondary(dt){
  // 매달린 것들(구슬줄·끈·수염): 부모의 월드 회전을 거꾸로 적용해 늘 아래로 처지게, 스프링으로 늦게 따라오게
  const hang=(piv,sx,sz,dw)=>{const P=piv.parent;P.matrixWorld.decompose(_av6,_aq2,_av7);_aq2.invert();const d=(dw?_av1.copy(dw):_av1.set(0,-1,0)).applyQuaternion(_aq2);
   sx.t=Math.atan2(-d.z,-d.y);sz.t=Math.atan2(d.x,-d.y);if(!sx.ready){sx.ready=1;sx.x=sx.t;sz.x=sz.t;}sx.step(dt);sz.step(dt);piv.rotation.set(sx.x,0,sz.x);piv.updateMatrix();piv.matrixWorld.multiplyMatrices(P.matrixWorld,piv.matrix);};
  for(const s of this.strings)if(s.piv.parent)hang(s.piv,s.sx,s.sz);
  for(const c of this.cords)if(c.piv.parent)hang(c.piv,c.sx,c.sz);
  // 턱수염은 가슴을 타고 앞으로 늘어진다(곧장 아래로 늘어지면 옷깃 뒤로 들어가 턱 밑에 검은 말뚝 두 개만 보였다)
  if(this.bRoot&&this.bRoot.parent&&!this.bRoot.userData.detached)for(const strand of this.beard)for(let i=0;i<strand.length;i++){const s=strand[i];if(!s.g.parent||s.g.userData.detached)break;hang(s.g,s.sx,s.sz,_av9.set(0,-1,BEARD_FWD[i]||1).normalize());}
  // 소매 자락: 아래팔이 수평에 가까울수록 크게 늘어진다
  for(const a of this.arms){const d=a.drape;if(!d||d.userData.detached||a.el.userData.detached)continue;
   a.el.matrixWorld.decompose(_av6,_aq4,_av7);
   const fa=_av2.set(0,-1,0).applyQuaternion(_aq4);const horiz=1-Math.abs(fa.y);
   const k=smooth((horiz-.15)/.6);
   // A compact fold hangs downward inside the forearm's collision envelope.
   // Its depth no longer stays full-size while the other two axes shrink.
   d.quaternion.copy(a.fm.getWorldQuaternion(_aq4).invert());
   const sc=.25+.3*k;d.scale.setScalar(sc);d.visible=true;}
 },
 /* 되살림: 쓸 수 있는 팔로 손바닥을 위로 펴 머리 위로 든다(소원의 불씨가 여기로 모인다) → 가슴으로 내린다 */
 updateRevive(dt){
  const r=this.revive;if(!r)return;
  r.k=Math.min(1,r.k+dt/(r.dur||1.1));
  if(!this.reviveArm)this.reviveArm=this.armUsable('R')?'R':this.armUsable('L')?'L':null;
  const side=this.reviveArm;if(!side)return;
  const s=side==='R'?1:-1;
  // 주저앉은 몸(허리 높이 .62-.5) 기준: 팔을 옆·위로 비스듬히 뻗어 손바닥을 하늘로 편다.
  // 얼굴 옆에 바짝 붙여 들면(예전 값) 불씨가 얼굴로 모이는 것처럼 보였다 — 머리에서 떨어진 허공에 손바닥이 놓이게 한다
  const T=_av8.set(s*.55,1.28,.5);
  if(r.toChest){r.c=Math.min(1,(r.c||0)+dt/.32);T.lerp(_av9.set(s*.04,.74,.3),smooth(r.c));}
  else if(r.k>=1)T.y+=Math.sin(this.breath*2)*.005;
  // 손끝은 바깥·위, 손바닥은 하늘(pd는 손바닥이 보는 쪽). 예전 값(아래)은 손 방향이 처음 자세로 굳어 있던 탓에 티가 안 났다
  this.setIK(side,{target:T,fd:_av10.set(s*.6,.5,.6),pd:_av2.set(0,1,-.2),curl:.1,w:smooth(r.k),rate:5,space:'root'});
 },
 updateMaterials(dt){
  // 맞을 때 하얗게 번쩍(두어 프레임) → 붉게 빠짐, 피를 잃으면 창백해짐
  // 멈춤 동안에도 보이도록 번쩍임은 실제 시간으로 줄인다
  const rdt=this._rdt||dt;
  // 되살림의 금빛 과노출: 온몸의 재질이 금빛으로 타올랐다가 천천히 가라앉는다
  if(this.reviveGlow>0||this._glowWas){const g=this.reviveGlow=Math.max(0,(this.reviveGlow||0)-rdt*.95);
   for(const k in this.M){const m=this.M[k];if(!m||!m.emissive||!m.isMeshStandardMaterial)continue;
    if(!m.userData.baseEm){m.userData.baseEm=m.emissive.clone();m.userData.baseEI=m.emissiveIntensity;}
    if(g>0){m.emissive.copy(m.userData.baseEm).multiplyScalar(m.userData.baseEI).add(_glowC.setRGB(g,g*.9,g*.62));m.emissiveIntensity=1;}
    else{m.emissive.copy(m.userData.baseEm);m.emissiveIntensity=m.userData.baseEI;}}
   this._glowWas=g>0;if(g>0)return;}
  const f=this.hitFlash=G.free?0:Math.max(0,(this.hitFlash||0)-rdt*6);
  const w=this.whiteFlash=G.free?0:Math.max(0,(this.whiteFlash||0)-rdt*11);
  const pale=sat(this.bloodLost/4.4)*.55;
  if(!this.unmasked&&this._pale!==Math.round(pale*50)){this._pale=Math.round(pale*50);this.M.skin.color.copy(col('#eda882')).lerp(col('#d9c0b0'),pale);this.M.flesh.color.copy(this.M.skin.color);this.M.skinD.color.copy(col('#dc9572')).lerp(col('#c4a596'),pale);this.M.blush.color.copy(col('#ef8f7a')).lerp(col('#d8a99e'),pale);this.M.lip.color.copy(col('#c65f55')).lerp(col('#a7787a'),pale);}
  const ww=(w>.6?.24:w*.38);
  for(const m of this.flashMats){const sk=m!==this.M.robe&&m!==this.M.hem&&m!==this.M.belly&&m!==this.M.chest,k=sk?ww:0;m.emissive.setRGB(f*.42+k,f*.06+k*.9,f*.05+k*.82);}
  for(const m of this.goreMeshes)m.visible=PREF.blood;
 },
});
const _glowC=new THREE.Color();
const BEARD_FWD=[.76,.77,1.4];// 턱수염 마디마다 앞으로 나오는 정도(서 있을 때 가슴·배 앞면 기울기에 맞춤, 월드 기준)
const _down=V3(0,-1,0),_av1=V3(),_av2=V3(),_av3=V3(),_av4=V3(),_av5=V3(),_av6=V3(),_av7=V3(),_av8=V3(),_av9=V3(),_av10=V3();
const _aq1=new THREE.Quaternion(),_aq2=new THREE.Quaternion(),_aq3=new THREE.Quaternion(),_aq4=new THREE.Quaternion(),_aq5=new THREE.Quaternion(),_aq6=new THREE.Quaternion(),_am=new THREE.Matrix4();
/* ===== 6-4. 운명 설계자 — 상태·행동·다운 =====
 * stand(서서 맞음) → fall(넘어짐) → down(넘어져 있음) → rise(일어남) → stand … 마지막은 final → dead */
const KD_POSE={
 flail:P({tz:-.3,py:-.04,sF:-.22,cF:-.18,nF:-.15,hF:-.35,LsA:1,RsA:.95,LsF:.55,RsF:.35,LeB:.3,ReB:.5,Lcurl:.1,Rcurl:.1,LhF:.25,RhF:-.05,LkB:.35,RkB:.15,LhA:.12,RhA:.12}),
 buckle:P({tz:.02,py:-.14,sF:.3,cF:.15,nF:-.05,hF:-.2,LsA:.5,RsA:.55,LsF:.6,RsF:.55,LeB:.4,ReB:.4,LhF:.55,RhF:.5,LkB:1.05,RkB:1,LaF:-.3,RaF:-.3}),
 allFours:P({tz:.02,py:-.3,pF:.25,sF:.55,cF:.25,nF:-.45,hF:-.75,LsA:.25,RsA:.25,LsF:1.25,RsF:1.25,LeB:.1,ReB:.1,Lcurl:.05,Rcurl:.05,LhF:.15,RhF:.15,LhA:.1,RhA:.1,LkB:1.5,RkB:1.5,LaF:-.8,RaF:-.8}),
 lunge:P({tz:.02,py:-.2,pF:.1,sF:.38,cF:.15,nF:.05,hF:-.1,LsA:.4,RsA:.4,LsF:.5,RsF:.6,LeB:.8,ReB:.5,LhF:1.35,RhF:-.05,LkB:1.55,RkB:1.4,LaF:-.25,RaF:-.75}),
 pushThrone:P({tz:-.56,py:-.06,pF:.2,sF:.45,cF:.15,nF:.05,hF:-.1,LsA:.62,RsA:.62,LsF:.15,RsF:.15,LeB:.6,ReB:.6,LhF:1.1,RhF:1.05,LhA:.2,RhA:.24,LkB:1.2,RkB:1.15}),
 hunchStand:P({tz:-.12,py:-.06,sF:.32,cF:.16,nF:.08,hF:-.05,LsA:.45,RsA:.45,LsF:.25,RsF:.25,LeB:.6,ReB:.6,LhF:.12,RhF:.12,LhA:.08,RhA:.08,LkB:.25,RkB:.25}),
 slump:P({tz:-.05,py:-.32,pF:.1,sF:.3,cF:.1,nF:-.15,hF:-.42,hR:.32,LsA:.7,RsA:.7,LsF:.3,RsF:.2,LeB:.3,ReB:.3,LhF:.9,RhF:.85,LhA:.3,RhA:.3,LkB:1.45,RkB:1.4}),
 // 마지막 직전: 엉덩이가 먼저 바닥으로 털썩 내려앉고 무릎은 아직 세워져 있다. 무릎 꿇은 자세에서 바로 다리를 펴며 앉으면
 // 다리가 먼저 펴지면서 몸이 5cm쯤 도로 솟았다가 주저앉았다(다시 일어났다가 쓰러지는 꼴). 여기를 거치면 골반이 계속 내려가기만 한다
 sitBack:Object.assign(P(POSES.final),{pF:-.12,sF:.15,LhF:1.95,RhF:1.85,LkB:1.7,RkB:1.6,LaF:-.3,RaF:-.3}),
};
function seqEval(seq,t,out){
 if(t<=seq[0].t)return poseCopy(seq[0].pose,out);
 for(let i=1;i<seq.length;i++){const a=seq[i-1],b=seq[i];if(t<=b.t){const u=(t-a.t)/Math.max(1e-4,b.t-a.t),e=b.ease==='in'?easeIn(u):b.ease==='out'?easeOut3(u):b.ease==='back'?backOut(u,1.2):smooth(u);return poseLerp(a.pose,b.pose,e,out);}}
 return poseCopy(seq[seq.length-1].pose,out);
}

Object.assign(Emperor.prototype,{
 /* 단계: 0 비웃음(돈다발 들고) / 1 성남 / 2 아픔·겁 / 3 울며 빎 / 4 다 무너짐 */
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
  if(this.hang){freeHangPose(this,out);return;}
  if(this.walkIn){freeWalkPose(this,out,dt);return;}
  if(combatActive(this)){combatPose(this,out,dt,time);return;}
  const st=this.state;
  if(st!=='stand'){this.rest.L.on=false;this.rest.R.on=false;this.pat=null;}
  if(st==='stand')this.standPose(out,dt,time);
  else if(st==='fall'||st==='rise'){
   const d=this.down;seqEval(d.seq,this.stateT,out);
   // 마지막으로 일어나 보려고 버틸 때: 바닥을 짚은 팔과 몸이 덜덜 떨린다
   if(d.shake&&this.stateT>d.shake.t0&&this.stateT<d.shake.t1){
    const k=Math.sin(PI*(this.stateT-d.shake.t0)/(d.shake.t1-d.shake.t0)),a=Math.sin(time*31),b=Math.sin(time*27+1.3);
    out.LsF+=a*.07*k;out.RsF+=b*.07*k;out.LeB+=b*.06*k;out.ReB+=a*.06*k;out.sF+=a*.025*k;out.hT+=b*.035*k;out.hF+=a*.02*k;out.py+=b*.006*k;
   }
   if(d.events)for(const ev of d.events){if(!ev.done&&this.stateT>=ev.t){ev.done=true;ev.fn();}}
   if(this.stateT>=d.seq[d.seq.length-1].t){if(st==='fall'){this.state=d.type==='final'?'dead':'down';this.stateT=0;if(d.type==='final'&&this.onDead)this.onDead();}else{this.state='stand';this.stateT=0;this.down=null;this.rootPos.set(0,0,0);if(this.onRise)this.onRise();}}
  }else if(st==='down'||st==='dead'){
   const d=this.down,base=this._combatScripted&&d.seq?d.seq[d.seq.length-1].pose:POSES[d.type];poseCopy(base,out);
   const t=time;
   if(d.type==='throne'){out.hR+=Math.sin(t*1.3)*.22;out.hF+=Math.cos(t*1.1)*.12;out.nR+=Math.sin(t*1.3+.6)*.08;this.dizzy=1;}
   else if(d.type==='kneel'){out.hF+=Math.sin(t*4.6)*.12;out.sF+=Math.sin(t*4.6)*.06+.06;this.beg(true);}
   else if(d.type==='floor'){out.hR+=Math.sin(t*.9)*.15;out.hF+=Math.sin(t*1.7)*.06;out.sF+=Math.sin(this.breath)*.02;}
   else if(d.type==='final'){out.cF+=Math.sin(this.breath*.7)*.012;
    // 되살림: 고개를 들어 손바닥을 올려다본다
    if(this.revive){const k=smooth(this.revive.k);out.hF+=.12*k;out.hR*=1-.85*k;out.hT=out.hT*(1-.6*k)+(this.reviveArm==='L'?-1:1)*.22*k;out.nF+=.05*k;out.cF-=.08*k;out.sF+=.08*k;}}
   // 다리가 잘려 있으면 새 다리가 다 자랄 때까지 못 일어난다
   if(st==='down'){d.stay-=dt;if(d.stay<=0&&!this.legsMissing())this.startRise();}
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
  for(let i=0;i<2;i++){if(this.legLimp[i])this.limp[i]=Math.max(this.limp[i],.9);if(this.armLimp[i])this.armHurt[i]=Math.max(this.armHurt[i],.95);}
  for(let i=0;i<2;i++){const l=this.limp[i];if(l>0){const n=i?'R':'L';out[n+'kB']+=.38*l;out[n+'hF']+=.15*l;out.py-=.05*l;out.pR+=(i?-1:1)*.08*l;}this.limp[i]=Math.max(0,l-dt*.05);}
  for(let i=0;i<2;i++){const ah=this.armHurt[i];if(ah>0){const n=i?'R':'L';out[n+'sA']=lerp(out[n+'sA'],.2,ah);out[n+'sF']=lerp(out[n+'sF'],-.05,ah);out[n+'eB']=lerp(out[n+'eB'],.1,ah);out[n+'curl']=lerp(out[n+'curl'],.1,ah);}this.armHurt[i]=Math.max(0,ah-dt*.07);}
  if(this.laughing>0){const L=this.laughing;out.hF-=.2*L;out.sF-=.06*L;out.cF+=Math.sin(time*13)*.035*L;out.hF+=Math.sin(time*13)*.05*L;this.sp.belly.kick(0,Math.sin(time*13)*.25*L*dt*60*.02,0);}
  this.updateActions(out,dt,time);
  this.updateDistress(out,dt,time);
  // 비틀거리는 동안은 손을 배에서 떼고 허우적인다(쉬는 손 IK를 걸지 않는다)
  if(!(this.combat&&this.combat.mode==='stagger'))this.restHands(out,dt,time);
 },

 /* ---- 맞을 때 허둥댐·덜덜 떨기 ----
  * panic: 한 대 맞을 때마다 차오르고 2초쯤에 걸쳐 빠진다. 그 동안 손을 가슴·얼굴 앞으로 들어 손바닥을 내 쪽으로 펴고 좌우로 막 휘젓는다(손사래).
  *        1단계(성남)에서는 작게 놀라 손을 드는 정도, 2단계부터는 얼굴 앞에서 빠르게 흔든다. 막기·움켜쥐기·빌기처럼 손을 쓰는 다른 동작이 있으면 그 손은 비켜 둔다.
  * tremble: 맞은 직후 머리와 몸통에만 짧게 남는다. 팔·손목에 별도 진동을 더하지 않는다.
  * 추임새(「운명 최고」)를 뱉는 1.7초 동안은 손사래를 멈추고 떨림도 잦아든다(비웃는 얼굴과 맞추려고). */
 updateDistress(out,dt,time){
  const calm=G.time<this.calmUntil,ph=this.phase,pn=calm?0:this.panic,tr=this.tremble;
  if(tr>.01){
   const a=Math.sin(time*10)+.3*Math.sin(time*6+.8),
         b=Math.sin(time*8+1.3),c=Math.sin(time*11+2.1);
   out.hT+=a*.024*tr;out.hR+=b*.018*tr;out.hF+=c*.013*tr;out.nT+=a*.006*tr;
   out.cT+=b*.009*tr;out.cR+=a*.006*tr;out.sR+=c*.004*tr;
   out.LkB+=Math.max(0,c)*.07*tr;out.RkB+=Math.max(0,-c)*.07*tr;out.py-=Math.abs(b)*.004*tr;out.tx+=a*.0035*tr;
  }
  const F=this._flail||(this._flail={L:false,R:false}),active=pn>=.02;
  const k=Math.min(1,pn),w=smooth(Math.min(1,pn*1.6)),hz=ph>=2?6:5,amp=(ph>=2?.04:.025)*k,seed=this.flailSeed;
  for(const s of [-1,1]){
   const n=s<0?'L':'R',i=s<0?0:1;
   const busy=this._ikUse[n]===this._ikFrame||(this.act&&this.act.prio>=1&&(this.act.both||(this.act.side||'R')===n));
   const use=active&&!busy&&this.armUsable(n)&&this.armHurt[i]<=.5;
   if(use){
    const p1=seed+(s<0?0:PI*.9),sw=Math.sin(time*hz+p1),sw2=Math.sin(time*hz*.53+p1*1.7);
    const x=s*(.28+.025*sw2)+sw*amp,y=(ph>=2?1.18:1.1)+sw2*.025*k,z=.46+.025*sw2;
    this.setIK(n,{target:_bv1.set(x,y,z),fd:_bv2.set(s*.15+sw*.1,1,.35),pd:_bv3.set(sw*.08,-.15,1),curl:.04,rate:7,w});
   }else if(F[n]&&this._ikUse[n]!==this._ikFrame)this.releaseIK(n,8); // 손사래가 끝났는데 아무도 그 손을 안 쓰면 손을 내린다(쉬는 손이 이어받는다)
   F[n]=use;
  }
  if(!active)return;
  // 고개는 뒤로 빼고 어깨는 움츠린다
  out.hF-=.06*k;out.sF+=.05*k;out.LsA+=.1*k;out.RsA+=.1*k;
 },

 /* ---- 행동(손을 쓰는 짧은 동작) ---- */
 armUsable(side){const a=this.arms[side==='L'?0:1];return !!(a&&!a.sh.userData.detached&&!a.el.userData.detached&&!a.wr.userData.detached);},
doAct(name,o={}){
   if(this.headDestroyed&&/^(face|wipe|spit|crown|laugh)$/.test(name))return false;
   if(this.jawGone&&/^(spit|laugh)$/.test(name))return false;
 if(o.side&&!this.armUsable(o.side)&&/^(clutch|face|wipe|look|shake|crown)$/.test(name)){const other=o.side==='L'?'R':'L';if(!this.armUsable(other))return false;o=Object.assign({},o,{side:other,both:false});}
 if(this.state!=='stand'&&!o.any)return false;if(this.act&&this.act.prio>(o.prio||0))return false;this.endAct();this.act=Object.assign({name,t:0,dur:o.dur||1.5,prio:o.prio||0},o);return true;
},
 endAct(){const a=this.act;if(!a)return;this.act=null;if(a.L!==false)this.releaseIK('L');if(a.R!==false)this.releaseIK('R');this.laughAmt=0;this.laughing=0;this.talk=0;},
 updateActions(out,dt,time){
  if(this.tabletHeld){
   const beat=Math.sin(G.time*2.5);
   // 부채 자루를 쥔 손: 손바닥은 몸 가운데 쪽, 손가락은 앞, 엄지가 위(돈다발이 주먹 위로 서서 앞을 보고 벌어진다)
   this.setIK('R',{target:_bv1.set(.28+.012*beat,1.01+.014*beat,.39),fd:_bv2.set(-.15,.05+.06*beat,1),pd:_bv3.set(-1,.06*beat,-.1),curl:.48,rate:10,pole:_bv4.set(.38,-.12,.24)});
   if(G.mode==='submit'){
    this.setIK('L',{target:_bv1.set(-.36,1.1-.04*Math.sin(time*.9),.3),fd:_bv2.set(-.4,.6,.3),pd:_bv3.set(0,1,.4),curl:.3,rate:4});
    return;
   }
   this.setIK('L',{target:_bv1.set(-.50,.94,.20),fd:_bv2.set(-.08,-.08,1),pd:_bv3.set(0,-1,0),curl:.3,rate:8,pole:_bv4.set(-.12,-.40,.10)});
  }
  // 막기: 주먹을 얼굴 앞으로
  this.guardCool=Math.max(0,this.guardCool-dt);this.guardHold=Math.max(0,this.guardHold-dt);
  const gGoal=this.guardHold>0&&this.state==='stand'&&!this.tabletHeld?1:0;this.guard=damp(this.guard,gGoal,gGoal?16:5,dt);
  if(this.guard>.02&&!(this.act&&this.act.prio>=2)){
   // 권투 가드: 두 주먹을 볼 옆·턱 앞에 세우고(눈을 가리지 않게 조금 낮고 앞에) 팔꿈치는 몸에 붙인다
   for(const s of [-1,1]){const n=s<0?'L':'R';if(this.armHurt[s<0?0:1]>.5)continue;this.setIK(n,{w:this.guard,target:_bv1.set(s*.13,1.3-this.hunch*.08,.5),fd:_bv2.set(-s*.2,1,.3),pd:_bv3.set(s*.25,0,-1),curl:1.1,rate:30,pole:_bv4.set(s*.1,-.32,.08)});}
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
    // 벤 목을 움켜쥘 때는 고개를 숙이지 않는다(noBow: 숙이면 턱이 남은 목을 덮는다)
    if(!a.noBow){out.sF+=.12*Math.sin(sat(u)*PI);out.hF+=.2*Math.sin(sat(u)*PI);}
    if(a.both){const m=n==='L'?'R':'L';this.setIK(m,{target:_bv5.copy(tgt).add(_bv6.set(-s*.06,.04,.02)),fd:_bv3.set(s*.4,-.6,.4),pd:_bv4.copy(nrm).negate(),curl:.35,rate:12});}
    break;}
   case 'face':{ // 얼굴을 감싼다: 손바닥을 눈·볼 위에 댄다(얼굴 좌표 기준이라 고개를 숙여도 손이 얼굴 속으로 들어가지 않는다)
    const F=this.faceIK(_bv1.set(s*.06,.0,.235),_bv2.set(-s*.2,1,.05),_bv3.set(0,0,-1));
    this.setIK(n,{target:F.t,fd:F.fd,pd:F.pd,curl:.25,rate:14,space:'world'});
    out.hF+=.35*Math.sin(sat(u)*PI);out.sF+=.12*Math.sin(sat(u)*PI);break;}
   case 'wipe':{ // 손등으로 코피를 닦고 손을 본다
    const k=sat(u*2.2),x=lerp(-.1,.12,smooth(k))*s;
    if(u<.5){const F=this.faceIK(_bv1.set(x,-.1,.26),_bv2.set(-s,.15,.1),_bv3.set(0,0,1));this.setIK(n,{target:F.t,fd:F.fd,pd:F.pd,curl:.55,rate:14,space:'world'});}
    else{this.setIK(n,{target:_bv1.set(s*.06,1.18,.48),fd:_bv2.set(0,.6,.8),pd:_bv3.set(0,1,0),curl:.2,rate:7});this.gazeTarget.copy(this.ik[n].target);this.root.localToWorld(this.gazeTarget);out.hF+=.25*smooth((u-.5)/.15)*smooth((1-u)/.15);if(!a.gasp){a.gasp=true;AUDIO.gasp();this.doFlinch('shock',.7);}}
    break;}
   case 'look':{ // 피 묻은 손을 들여다본다
    this.setIK(n,{target:_bv1.set(s*.05,1.15,.46),fd:_bv2.set(0,.65,.75),pd:_bv3.set(0,1,0),curl:.15,rate:7});
    this.gazeTarget.copy(this.ik[n].target);this.root.localToWorld(this.gazeTarget);out.hF+=.28*smooth(u/.2)*smooth((1-u)/.2);
    if(!a.gasp&&u>.35){a.gasp=true;AUDIO.gasp();this.doFlinch('shock',.8);}break;}
   case 'spit':{ // 고개 돌려 침(피) 뱉기
    const k=Math.sin(sat(u)*PI);out.hT+=s*.55*k;out.hF+=.15*k;out.nT+=s*.2*k;
    if(!a.done&&u>.45){a.done=true;this.spitOut(s);}break;}
   case 'beg':{this.beg(false,u);break;}
   case 'shake':{ // 다친 손을 턴다
    this.setIK(n,{target:_bv1.set(s*.25,1.05+Math.sin(a.t*8)*.022,.4),fd:_bv2.set(0,-.4,1),pd:_bv3.set(-s,0,0),curl:.3,rate:8});break;}
   case 'crown':{ // 삐뚤어진 면류관을 바로잡는다(면류관 테 옆을 잡는다)
    const F=this.faceIK(_bv1.set(s*.2,.2,.03),_bv2.set(-s,.25,0),_bv3.set(0,-1,0));
    this.setIK(n,{target:F.t,fd:F.fd,pd:F.pd,curl:.4,rate:9,space:'world'});
    if(!a.done&&u>.5){a.done=true;if(this.crownOn!==false)this.crownTilt=Math.max(0,(this.crownTilt||0)-.6);}break;}
  }
  if(a.t>=a.dur)this.endAct();
 },
 // 얼굴 좌표(face 그룹)의 자리·손가락 방향·손바닥 방향을 월드로 옮긴다(얼굴에 손을 대는 동작용)
 faceIK(lp,fd,pd){const F=this.face;F.updateWorldMatrix(true,false);const q=F.getWorldQuaternion(_rq1);
  this._fik=this._fik||{t:V3(),fd:V3(),pd:V3()};const o=this._fik;o.t.copy(lp).applyMatrix4(F.matrixWorld);o.fd.copy(fd).applyQuaternion(q);o.pd.copy(pd).applyQuaternion(q);return o;},
 /* 쉬는 손: 두 손을 배 위쪽에 얹고 있다(배 뼈 기준이라 몸을 숙여도 따라간다). 가끔 한 손으로 배를 두드린다.
  * 다른 동작(막기·부채질·움켜쥐기 등)이 손을 쓰는 동안에는 비켜 있다가, 끝나면 그 손 자리에서 부드럽게 돌아온다. */
 restHands(out,dt,time){
  const spine=this.bones.spine,js=this.bellyScale||V3(1,1,1),bs=_rv5.set(BELLY_R.x*js.x,BELLY_R.y*js.y,BELLY_R.z*js.z),c=BELLY_C;spine.updateWorldMatrix(true,false);
  const qs=spine.getWorldQuaternion(_rq1),qr=this.root.getWorldQuaternion(_rq2).invert();
  this.patT-=dt;
  if(!this.pat&&this.patT<=0){this.patT=rnd(5,9);if(this.phase<=1&&!this.taunt&&this.sinceHit>1.5&&!this.act&&this.guard<.02){const side=Math.random()<.5?'L':'R';if(this.armUsable(side))this.pat={side,t:0,dur:1.1,prev:0};}}
  for(const side of ['L','R']){
   const s=side==='L'?-1:1,i=s<0?0:1,R=this.rest[side];
   const used=this._ikUse[side]===this._ikFrame,free=!used&&this.armUsable(side)&&this.armHurt[i]<.35&&!this.tabletHeld;
   if(!free){if(R.on&&!used)this.releaseIK(side,6);R.on=false;continue;}
   // 배 위쪽 앞, 넥타이 양옆(배 타원면 위의 한 점과 그 자리의 바깥 방향)
   const phi=.47,beta=.42,dx=Math.sin(phi)*Math.cos(beta)*s,dy=Math.sin(beta),dz=Math.cos(phi)*Math.cos(beta);
   const N=_rv2.set(dx/bs.x,dy/bs.y,dz/bs.z).normalize();
   let lift=.032;
   const pat=this.pat&&this.pat.side===side?this.pat:null;if(pat)lift+=.055*Math.max(0,Math.sin(pat.t/pat.dur*PI*3));
   const W=_rv1.set(c.x+bs.x*dx,c.y+bs.y*dy,c.z+bs.z*dz).addScaledVector(N,lift);spine.localToWorld(W);this.root.worldToLocal(W);
   // 손가락은 배를 따라 가운데·아래로, 손바닥은 배를 향해
   const T=_rv3.set(-s,-.35,0);T.addScaledVector(N,-T.dot(N)).normalize();
   T.applyQuaternion(qs).applyQuaternion(qr);N.applyQuaternion(qs).applyQuaternion(qr).negate();
   if(!R.on){R.on=true;const a=this.arms[i];a.wr.updateWorldMatrix(true,false);R.p.copy(this.root.worldToLocal(a.wr.getWorldPosition(_rv4)));R.fd.copy(this.ik[side].fd);R.pd.copy(this.ik[side].pd);if(R.fd.lengthSq()<.1)R.fd.copy(T);if(R.pd.lengthSq()<.1)R.pd.copy(N);}
   const k=1-Math.exp(-dt*6);R.p.lerp(W,k);R.fd.lerp(T,k).normalize();R.pd.lerp(N,k).normalize();
   this.setIK(side,{target:R.p,fd:R.fd,pd:R.pd,curl:pat?.42:.3,rate:5,rest:true});
  }
  // 배를 두드리면 배가 출렁
  if(this.pat){const p=this.pat;p.t+=dt;const v=Math.sin(p.t/p.dur*PI*3);if(p.prev>.05&&v<=.05&&p.t<p.dur){this.sp.belly.kick(.5,-.7,-1);AUDIO.pat(.6);}p.prev=v;if(p.t>=p.dur||!this.armUsable(p.side))this.pat=null;}
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
  // 우는 소리. 2단계에서는 떨면서 가끔 숨을 들이켠다
  if(this.phase>=3&&time>(this.sobT||0)){this.sobT=time+rnd(2.6,4.5);if(this.sinceHit>.8)AUDIO.voice('sob',.7);}
  else if(this.phase===2&&this.tremble>.3&&time>this.whimperT){this.whimperT=time+rnd(2.4,4.4);if(this.sinceHit>.7)AUDIO.voice('gasp',.45);}
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
   // 동맥이 터진 뒤에는 얼굴을 감싸거나 고개 숙여 빌지 않는다(고개를 숙이면 턱이 남은 목을 덮는다)
   const neckOpen=this.neckCut&&this.neckCut.hits>=2;
   if(this.phase>=3&&!neckOpen)c.push(['beg',3]);
   if(this.phase>=2&&!neckOpen)c.push(['face',2]); // 겁에 질려 손으로 얼굴을 감싼다
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
  else if(name==='face'){this.doAct('face',{side,dur:rnd(1.4,2)});if(Math.random()<.6)AUDIO.voice('gasp',.5);}
  else if(name==='beg'){this.doAct('beg',{dur:rnd(2,3)});AUDIO.voice('beg',.8);}
  else if(name==='huff'){AUDIO.voice('huff',.7);this.doFlinch('angry',.6);}
 },
 // 코 쪽 아래 눈꺼풀 테두리. 이 좌표계에 찡그림·부기와 맞아서 밀린 눈의 위치가 모두 반영된다.
 tearOrigin(e){
  const radius=e.loLid.geometry.parameters.radius;
  const x=-e.s*.55*radius;
  e.loLid.updateWorldMatrix(true,false);
  return e.loLid.localToWorld(V3(x,0,Math.sqrt(radius*radius-x*x)));
 },
 /* 울 때: 아래 눈꺼풀에서 눈물이 볼을 타고 흐른다.
  * 1단계에서는 맞은 직후에만 찔끔, 2단계부터는 비웃거나 웃는 순간만 빼고 계속, 3·4단계에서는 굵고 잦게 */
 updateTears(time){
  if(this.headDestroyed||this.unmasked)return;
  const ph=this.phase,smugNow=this.emo==='smug'||this.emo==='laugh';
  const crying=!smugNow&&(ph>=2||(ph>=1&&this.panic>.35));
  if(!crying||time<(this.tearT||0))return;
  this.tearT=time+(ph>=3?rnd(.3,.7):ph>=2?rnd(.5,1):rnd(.9,1.6));
  const live=this.eyes.filter(e=>!e.ruined&&!e.ejected);if(!live.length)return;const e=pick(live);
  const p=this.tearOrigin(e),n=V3(0,0,1).transformDirection(e.eg.matrixWorld);
  const stream=BLOOD.startRiv('head',p,n,{kind:'tear',w:ph>=3?.0072:.006,speed:ph>=3?.14:.11,maxLen:rnd(.14,.3)});
  if(stream)stream.tearEye=e;
 },
 /* 세게 맞는 순간 두 눈에서 눈물 방울이 옆·위로 튄다(피 끄기와 상관없이 맑은 방울) */
 tearSplash(n){
  if(this.headDestroyed||this.unmasked)return;
  for(const e of this.eyes){if(e.ruined||e.ejected)continue;
   const p=this.tearOrigin(e);
   for(let i=0;i<n;i++){const v=V3(e.s*rnd(.25,1.1),rnd(.5,1.5),rnd(.5,1.3)).multiplyScalar(rnd(.8,1.5));BLOOD.emit('spit',p,v,rnd(.003,.0055),rnd(.5,.9));}
  }
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
 // o.lastTry: 되살림 직전(5%)에 누워 있거나 일어나던 중이면 마지막으로 일어나 보려다 무너진다
 startFall(type,o={}){
  if(combatActive(this)&&type!=='final'){this.combat.fall(0,.3,1);this.down={type:'floor',stay:3};return;}
  if(combatActive(this)&&type==='final'){this.combat.locked=true;this._combatScripted=true;}
  const from=P();poseCopy(this.pose,from);from.tx=this.root.position.x;from.tz=this.root.position.z;this.rootPos.set(0,0,0);this.rootVel.set(0,0,0);
  this.endAct();this.guardHold=0;this.releaseIK('L',10);this.releaseIK('R',10);this.taunt=false;
  const K=KD_POSE,ev=[];let seq;
  if(type==='throne'){seq=[{t:0,pose:from},{t:.32,pose:K.flail,ease:'out'},{t:.66,pose:poseLerp(K.flail,POSES.throne,.85,P()),ease:'in'},{t:1.05,pose:POSES.throne,ease:'back'}];ev.push({t:.66,fn:()=>{if(this.onImpact)this.onImpact('throne');}});}
  else if(type==='kneel'){seq=[{t:0,pose:from},{t:.26,pose:K.buckle,ease:'in'},{t:.52,pose:K.allFours,ease:'in'},{t:1.5,pose:K.allFours},{t:2.1,pose:POSES.kneel}];ev.push({t:.5,fn:()=>{if(this.onImpact)this.onImpact('knees');}},{t:1.2,fn:()=>{if(this.onCough)this.onCough();}});}
  else if(type==='floor'){seq=[{t:0,pose:from},{t:.3,pose:poseLerp(K.flail,K.buckle,.4,P()),ease:'out'},{t:.68,pose:poseLerp(K.buckle,POSES.floor,.7,P()),ease:'in'},{t:1.05,pose:POSES.floor,ease:'back'}];ev.push({t:.68,fn:()=>{if(this.onImpact)this.onImpact('floor');}});}
  else{seq=[{t:0,pose:from},{t:.5,pose:K.buckle,ease:'out'},{t:1.05,pose:K.slump,ease:'in'},{t:1.45,pose:K.sitBack,ease:'in'},{t:1.95,pose:POSES.final},{t:2.4,pose:POSES.final}];ev.push({t:1.02,fn:()=>{if(this.onImpact)this.onImpact('knees');}},{t:1.42,fn:()=>{if(this.onImpact)this.onImpact('final');}});}
  let shake=null;
  if(this._combatScripted){
   const b=this.combat,lying=b.mode==='ground'||b.mode==='fall'||from.rx<-.6;
   if(o.lastTry&&(lying||b.mode==='rise')){
    /* 누운 채 그 자리에서 늘어지면 쓰러진 줄 모르고, 다 일어섰다가 다시 쓰러지는 건 어색하다.
     * 마지막으로 일어나 보려고 두 주먹으로 바닥을 짚고 몸을 반쯤 일으켜 고개를 든다(팔이 덜덜 떨린다).
     * 힘이 빠져 그 자리에 엉덩이부터 털썩 주저앉고, 다리가 풀리며 옥좌 발판 쪽으로 늘어진다(골반은 버티는 높이에서 내려가기만 한다) */
    const strain=poseLerp(COMBAT_POSE.brace,K.lunge,.34,P());strain.hF+=.46;strain.nF+=.12;strain.sF-=.12;
    seq=[{t:0,pose:from},{t:.45,pose:COMBAT_POSE.brace,ease:'out'},{t:.95,pose:strain},{t:1.5,pose:K.sitBack,ease:'in'},{t:2.0,pose:POSES.final},{t:2.4,pose:POSES.final}];
    ev.length=0;
    ev.push({t:.45,fn:()=>{if(!this.headGone&&!this.headDestroyed)AUDIO.voice('groan',.9);}},{t:1.47,fn:()=>{if(this.onImpact)this.onImpact('final');}});
    shake={t0:.45,t1:1.05};
   }else if(lying){
    /* 누운 채(또는 넘어지는 도중에) 마지막 한 대를 맞으면 그 자리에서 그대로 숨이 끊긴다 — 일어나 앉지 않는다.
     * 들려 있던 무릎이 툭 떨어져 다리가 벌어지고, 팔은 바닥에 늘어지고, 고개는 넘어진 쪽으로 돌아간다. 몸 위치(골반)는 그대로 둔다 */
    const side=b.side||1,T=P(from);
    T.rx=-1.49;T.rz=from.rz*.6;T.py=-.05;T.pF=0;T.sF=-.02;T.sT=0;T.sR=0;T.cF=0;T.cT=0;T.cR=0;T.nF=-.08;T.nT=0;T.nR=0;T.hF=.08;T.hT=side*.62;T.hR=side*.18;
    T.LsF=-.05;T.LsA=1.32;T.LsT=.1;T.LeB=.12;T.LwF=.1;T.LwA=.1;T.Lcurl=.35;
    T.RsF=.22;T.RsA=1.0;T.RsT=-.15;T.ReB=.3;T.RwF=.18;T.RwA=.05;T.Rcurl=.42;
    T.LhF=.12;T.RhF=.08;T.LhA=.32;T.RhA=.24;T.LkB=.26;T.RkB=.12;T.LaF=.3;T.RaF=.36;
    const pv=V3(0,.62+T.py,0).applyEuler(new THREE.Euler(T.rx,T.ry,-T.rz,'YXZ'));T.ty=.29-pv.y;T.tx=-pv.x;T.tz=-pv.z;
    seq=[{t:0,pose:from},{t:.75,pose:T,ease:'in'},{t:2.4,pose:T}];
    ev.length=0;ev.push({t:.72,fn:()=>{if(this.onImpact)this.onImpact('knees');}});
   }
   for(let i=1;i<seq.length;i++){const q=P(seq[i].pose);q.tx+=this.combat.x;q.tz+=this.combat.z;seq[i].pose=q;}
  }
  this.down={type,seq,events:ev,stay:type==='throne'?2.5:type==='kneel'?3.1:type==='floor'?2.9:1e9,hitsDown:0,shake};
  this.state='fall';this.stateT=0;
  if(this.tabletHeld)this.dropTablet();
 },
 startRise(){
  if(combatActive(this)){this.combat.change('rise');return;}
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
const _rv1=V3(),_rv2=V3(),_rv3=V3(),_rv4=V3(),_rv5=V3(),_rq1=new THREE.Quaternion(),_rq2=new THREE.Quaternion();
const _abdN=new THREE.Matrix3();
/* ===== 6-4-2. 운명 설계자 — 살 모양 바꾸기 =====
 * 실제 맞은 살 메시만 바꾸고, 그 자리에 붙은 피·상처·눈코입·넥타이를 같이 옮긴다. */
const _dfv1=V3(),_dfv2=V3(),_dfv3=V3(),_dfm=new THREE.Matrix4(),_dfm2=new THREE.Matrix4(),_dfm3=new THREE.Matrix3();
Object.assign(Emperor.prototype,{
 deform(op,pW,dirW,R,depth,o={}){
  const out=[];if(!this.fleshList)return out;
  const list=o.only===undefined?this.fleshList:o.only;
  for(const f of list){const m=f.mesh;if(!m.parent||m.userData.detached||!visibleChain(m))continue;
   m.updateWorldMatrix(true,false);const bs=f.g.boundingSphere;if(!bs)continue;
   _dfv1.copy(bs.center).applyMatrix4(m.matrixWorld);
   const reach=(op==='groove'&&o.bW?o.bW.distanceTo(pW):0)+R*1.8;
   if(op==='groove'&&o.bW){_dfv2.addVectors(pW,o.bW).multiplyScalar(.5);if(_dfv1.distanceTo(_dfv2)>bs.radius+reach)continue;}
   else if(_dfv1.distanceTo(pW)>bs.radius+reach)continue;
   _dfm.copy(m.matrixWorld).invert();
   const c=pW.clone().applyMatrix4(_dfm),d=dirW.clone().transformDirection(_dfm);
   let n=0;
   if(op==='dent')n=f.dent(c,d,R,depth,o);
   else if(op==='crater')n=f.crater(c,d,R,depth,o);
   else if(op==='groove'){const b=o.bW.clone().applyMatrix4(_dfm);n=f.groove(c,b,R,depth,o);}
   if(n){out.push(f);this._follow(f);if(o.jiggle)f.jiggle(c,d,R,o.jiggle,o.jig||{});}
  }
  return out;
 },
 // 출렁임만(모양은 그대로): 큰 타격의 여진
 jiggleAt(pW,dirW,R,amp){if(!this.fleshList)return;for(const f of this.fleshList){const m=f.mesh;if(!m.parent||m.userData.detached)continue;m.updateWorldMatrix(true,false);const bs=f.g.boundingSphere;_dfv1.copy(bs.center).applyMatrix4(m.matrixWorld);if(_dfv1.distanceTo(pW)>bs.radius+R*1.7)continue;_dfm.copy(m.matrixWorld).invert();f.jiggle(pW.clone().applyMatrix4(_dfm),dirW.clone().transformDirection(_dfm),R,amp);}},
 // 손상 값만 칠하기(비늘이 비친다, 피가 배어 든다)
 paintAt(pW,R,ch,amt,mode){if(!this.fleshList)return;for(const f of this.fleshList){const m=f.mesh;if(!m.parent||m.userData.detached)continue;m.updateWorldMatrix(true,false);const bs=f.g.boundingSphere;_dfv1.copy(bs.center).applyMatrix4(m.matrixWorld);if(_dfv1.distanceTo(pW)>bs.radius+R)continue;_dfm.copy(m.matrixWorld).invert();f.paint(pW.clone().applyMatrix4(_dfm),R,ch,amt,mode);}},
 // 한 번 바뀐 살을 따라 피·상처(뼈 좌표)와 얼굴 부품·넥타이를 옮긴다
 _follow(f){
  const m=f.mesh,L=f.last;if(!L||!L.vs.length)return;
  const seg=m.userData.seg||this.segOf(m),bone=this.bones[seg];
  // 옮겨진 꼭짓점들이 든 상자(빨리 걸러 내기)
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;const P=L.p;for(let j=0;j<L.vs.length;j++){const x=P[j*3],y=P[j*3+1],z=P[j*3+2];if(x<x0)x0=x;if(y<y0)y0=y;if(z<z0)z0=z;if(x>x1)x1=x;if(y>y1)y1=y;if(z>z1)z1=z;}
  const pad=.03;x0-=pad;y0-=pad;z0-=pad;x1+=pad;y1+=pad;z1+=pad;
  const dl=_dfv3;
  const moveIn=(v,max)=>{if(v.x<x0||v.x>x1||v.y<y0||v.y>y1||v.z<z0||v.z>z1)return false;f.deltaAt(v.x,v.y,v.z,dl,max);if(dl.lengthSq()<1e-12)return false;v.add(dl);return true;};
  if(bone){m.updateWorldMatrix(true,false);bone.updateWorldMatrix(true,false);
   const Mbm=_dfm.copy(m.matrixWorld).invert().multiply(bone.matrixWorld),Mmb=_dfm2.copy(Mbm).invert();_dfm3.setFromMatrix4(Mmb);const tmp=V3();
   const bounds=new THREE.Box3(V3(x0,y0,z0),V3(x1,y1,z1)).applyMatrix4(Mmb);
   BLOOD.deformOverlays(bone,v=>{tmp.copy(v).applyMatrix4(Mbm);if(tmp.x<x0||tmp.x>x1||tmp.y<y0||tmp.y>y1||tmp.z<z0||tmp.z>z1)return false;f.deltaAt(tmp.x,tmp.y,tmp.z,dl,.03);if(dl.lengthSq()<1e-12)return false;dl.applyMatrix3(_dfm3);v.add(dl);return true;},bounds);}
  // The exposed organ and rim belong to the cut skull too. Follow later local
  // dents once per hit, not per frame, so the skin cannot slide out from under them.
  if(this.brainCap&&this.brainCap.parent===m){
   m.updateWorldMatrix(true,true);const inv=m.matrixWorld.clone().invert(),rel=new THREE.Matrix4(),back=new THREE.Matrix4(),v=V3(),bounds=new THREE.Box3(V3(x0,y0,z0),V3(x1,y1,z1)),meshBounds=new THREE.Box3();
   this.brainCap.traverse(o=>{if(!o.isMesh||!o.geometry)return;rel.multiplyMatrices(inv,o.matrixWorld);
    if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();if(!meshBounds.copy(o.geometry.boundingBox).applyMatrix4(rel).intersectsBox(bounds))return;
    back.copy(rel).invert();const P=o.geometry.attributes.position;let changed=false;
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(rel);if(moveIn(v,.035)){v.applyMatrix4(back);P.setXYZ(i,v.x,v.y,v.z);o.geometry.boundingBox.expandByPoint(v);changed=true;}}
    if(changed){P.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();}
   });
  }
  // 머리 살(얼굴 좌표): 눈·코·콧수염·눈썹·입술
  if(m.parent===this.face&&this.feat){
   for(const ft of this.feat){if(!ft.o.parent||ft.o.userData.detached||ft.o.parent!==this.face||ft.o===this._holdFeat)continue;const a=ft.a||ft.anc||(ft.anc=ft.o.position.clone().add(V3(0,0,ft.o===this.noseG?0:.042)));
    _dfv2.copy(a);if(moveIn(_dfv2,.035)){dl.copy(_dfv2).sub(a);a.copy(_dfv2);ft.o.position.add(dl);}}
   if(this.browBase)for(const b of this.brows){if(b.gone)continue;for(let i=0;i<6;i++){const q=this.browBase[i];_dfv2.set(b.s*q.x+b.off[i].x,q.y+b.off[i].y,q.z+b.off[i].z);const a=_dfv2.clone();if(moveIn(_dfv2,.03))b.off[i].add(_dfv2.sub(a));}}
   if(this.lipZ)for(let i=0;i<13;i++){const u=i/12*2-1;for(const [off,dy] of [[this.lipOffU,.004],[this.lipOffL,-.004]]){_dfv2.set(u*.066+off[i].x,-.1+dy+off[i].y,this.lipZ[i]+off[i].z);const a=_dfv2.clone();if(moveIn(_dfv2,.03))off[i].add(_dfv2.sub(a));}}
  }
  // 아래턱 살: 턱수염 뿌리
  if(m===this.chin&&this.bRoot){_dfv2.copy(this.bRoot.position);const a=_dfv2.clone();if(moveIn(_dfv2,.04))this.bRoot.position.add(_dfv2.sub(a));}
  // 배 살: 넥타이가 같이 꺼진다
  if(m===this.belly&&this.tie&&!this.tie.userData.detached){const T=this.tie.geometry.attributes.position;let ch=false;for(let i=0;i<T.count;i++){_dfv2.set(T.getX(i),T.getY(i),T.getZ(i));if(moveIn(_dfv2,.03)){T.setXYZ(i,_dfv2.x,_dfv2.y,_dfv2.z);ch=true;}}if(ch){T.needsUpdate=true;this.tie.geometry.computeVertexNormals();this.tie.geometry.computeBoundingSphere();delete this.tie.geometry.userData.fastGrid;}}
 },
});
/* ===== 6-4-3. 머리: 살점 → 참수 → 파충류 머리로 다시 자람 =====
 * 총·칼에 머리가 파이고 살점이 튄다. 머리가 목에서 떨어지는 건 칼로 목(턱 밑)을 가로질러 세 번 그었을 때뿐이고(6-4-4 neckKnife),
 * 부위별 파괴(정수리·옆통수·턱·코·귀·눈·함몰)는 6-4-4에 있다. 떨어진 자리에서 초록 비늘 파충류 머리가 쑥 자라 올라온다(세로 동공 눈·뾰족한 이빨·날름거리는 혀). */
const REP_TOOTH=()=>GEO.repTooth||(GEO.repTooth=(()=>{const g=new THREE.ConeGeometry(1,1,6);g.translate(0,-.5,0);return g;})());
Object.assign(Emperor.prototype,{
 // 머리에 총·칼이 쌓일수록 살점이 자주 튄다(머리가 통째로 떨어지는 일은 여기서 하지 않는다 — 참수는 neckKnife, 부위 파괴는 gunHead·knifeHead)
 headChunks(amt,pt,n,dir){
  if(this.headGone)return;
  const activeSkull=this.headKind==='rep'?this.repSkull:this.skull;
  this.headTear=(this.headTear||0)+amt;
  if(PREF.blood&&this.headTear>2&&(this.headTear-amt|0)!==(this.headTear|0)){
   CHUNKS.burst(pt.clone().addScaledVector(n,.01),2+(Math.random()*2|0),n,.03,this.chunkKind({obj:activeSkull,part:'head'}),{speed:1.3});
  }
 },
 // 머리 살에서 조각 하나를 평면으로 썰어 날린다
 tearHeadPiece(pt,n,dir){
  const skull=this.headKind==='rep'?this.repSkull:this.skull;
  if(!skull||skull.userData.detached)return;
  const f=skull.userData.flesh;if(!f||f.n>60000)return;
  const nrm=n.clone().normalize();
  // 맞은 자리에서 바깥쪽을 조금 떼어 낸다(얇게)
  this.sliceFlesh(f,nrm,pt.clone().addScaledVector(nrm,-0.012),{fling:dir,small:true});
 },
 /* 살 메시를 월드 평면으로 둘로 가른다. keep은 그대로 두고, 떨어지는 쪽(cut)은 날려 보낸다.
  * planeN: 바깥을 향한 월드 법선(이 방향 쪽이 떨어진다), through: 평면이 지나는 월드 점 */
 sliceFlesh(f,planeN,through,o={}){
  const m=f.mesh;if(!m.parent||m.userData.detached)return null;
  m.updateWorldMatrix(true,false);
  const inv=_dfm.copy(m.matrixWorld).invert();
  const nL=planeN.clone().transformDirection(inv).normalize();
  const pL=through.clone().applyMatrix4(inv);
  const d=nL.dot(pL);
  let res;try{f.bake();res=SLICE.slice(f.g,nL,d);}catch(_){return null;}
  if(!res||!res.keep||!res.cut)return null;
  // 떨어지는 조각: 지금 월드 변환 그대로 장면에 띄운다
  const piece=new THREE.Mesh(res.cut,m.material);piece.castShadow=false;piece.receiveShadow=true;piece.userData.noHit=true;piece.userData.detached=true;
  m.updateWorldMatrix(true,false);piece.applyMatrix4(m.matrixWorld);scene.add(piece);
  this.disposables.push(res.cut);
  // 남는 쪽을 새 모양으로
  const oldGeo=m.geometry;m.geometry=res.keep;f.setGeometry(res.keep,true);this.disposables.push(res.keep);this.releaseGeometry(oldGeo);
  const c=through.clone();
  const push=(o.fling?o.fling.clone():planeN.clone()).normalize().multiplyScalar(o.small?rnd(.8,1.6):rnd(1.1,2.2));
  push.add(V3(rnd(-.4,.4),rnd(.5,1.4),rnd(.1,.6)));
  this.bits=this.bits||[];this.bits.push({obj:piece,body:true,v:push,w:V3(rnd(-10,10),rnd(-12,12),rnd(-10,10)),r:o.small?.03:.07,bounce:.18,sound:o.small?'flake':'head',ttl:o.small?rnd(5,8):null,corners:this.limbCorners(piece)});
  if(PREF.blood){BLOOD.spray(c,planeN,o.small?8:16,{min:1,max:3.4,spread:.9,smax:.009});if(!o.small)CHUNKS.burst(c,4,planeN,.03,this.chunkKind({obj:m,part:'head'}),{speed:1.1});}
  AUDIO.chop(o.small?.5:.9);AUDIO.squelch(.5);
  return piece;
 },
 /* 대가리째 떨어져 나간다: 머리 뼈를 통째로 날리고 목을 막은 뒤, 파충류 머리를 예약한다 */
 severHead(dir,o={}){
  if(this.headGone)return false;
  const head=this.bones.head,neck=this.bones.neck;if(!head||!neck)return false;
  this.headGone=true;this.headDestroyed=true;
  if(this.crownOn!==false)this.knockCrown(dir||V3(0,.5,1));
  if(this.halo&&this.halo.on&&!this.halo.falling)this.haloDrop();
  this.endAct();this.guardHold=0;this.guard=0;
  // 꺾여 덜렁거리던 목은 머리가 떨어지며 바로 선다. 꾸르륵도 끝
  if(this.loll){this.loll.sp.t=0;this.loll.sr.t=0;}for(const ax of ['x','y','z']){this.sp.neck[ax].k=130;this.sp.neck[ax].c=11;}
  this.gurgleT=0;this.jawGone=false;AUDIO.setJawGone(false);
  head.updateWorldMatrix(true,true);neck.updateWorldMatrix(true,false);
  const jointW=neck.localToWorld(V3(0,.125,.01)),upW=V3(0,1,0).applyQuaternion(neck.getWorldQuaternion(new THREE.Quaternion())).normalize();
  // 날아가는 머리(파편 몇 개로 쪼개면서)
  scene.attach(head);
  const removed=new Set(),cutFlesh=new Set();head.traverse(c=>{c.userData.detached=true;if(c.isMesh){removed.add(c);if(c.userData.flesh)cutFlesh.add(c.userData.flesh);}});
  // 떨어진 머리의 상처 자국은 보존하고, 새 머리로 이어질 피 계산과 변형 작업만 끊는다.
  BLOOD.detachTree(head);for(const f of cutFlesh)f.disposeWork();
  this.fleshList=this.fleshList.filter(f=>!cutFlesh.has(f));
  this.parts=this.parts.filter(ob=>!removed.has(ob));
  for(const k in this.flow)this.flow[k]=this.flow[k].filter(ob=>!removed.has(ob));this._flowAll=null;
  const push=(dir?dir.clone():V3(0,.3,1)).normalize().multiplyScalar(1.6);push.y=Math.max(1.6,push.y+1.8);push.x+=rnd(-.5,.5);push.z+=rnd(.4,1);
  this.bits=this.bits||[];
  this.bits.push({obj:head,body:true,v:push,w:V3(rnd(-8,8),rnd(-10,10),rnd(-8,8)),r:.12,bounce:.2,sound:'head',corners:this.limbCorners(head),bleed:{lp:V3(0,.02,0),ln:V3(0,-1,0),t:0,life:8}});
  // 반복 참수로 떨어진 고밀도 머리가 끝없이 쌓이지 않게 가장 최근 것만 남긴다.
  this.severedHeads=this.severedHeads||[];this.severedHeads.push(head);
  while(this.severedHeads.length>1){
   const old=this.severedHeads.shift(),bi=this.bits.findIndex(b=>b.obj===old);
   if(bi>=0)this.bits.splice(bi,1);BLOOD.forgetTree(old);old.removeFromParent();this.releaseLoose(old);
  }
  // 머리 쪽은 아래를 향한 단면이다. 위쪽을 남겨야 두개골과 얼굴이 함께 떨어진다.
  // 턱 앞쪽으로 갈수록 낮춰 볼과 아래턱의 윤곽을 남긴다.
  const underJaw=new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),.29);
  this.makeCutCap(head,V3(0,.005,-.012),underJaw,.103,false,this.headKind==='rep'?this.M.liz:this.M.skin,this.headKind==='rep');
  // 조각조각: 떨어진 머리에서 살점 왕창
  if(PREF.blood)CHUNKS.burst(jointW.clone().addScaledVector(upW,.05),8+(Math.random()*5|0),upW,.04,this.chunkKind({obj:(this.headKind==='rep'?this.repSkull:this.skull),part:'head'}),{speed:1.5});
  // 목 그루터기 막기 + 피
  this.capNeck(neck,jointW,upW);
  if(PREF.blood){
   BLOOD.clearAbove('neck',.11);
   BLOOD.addWound('neck',jointW,upW,{rate:.07,tau:60,artery:true,kind:'cut',spread:.03});
   BLOOD.spray(jointW,upW.clone().lerp(V3(0,0,1),.3).normalize(),36,{min:1.4,max:5.2,spread:1.15,smax:.011});
  }
  this.screenSplat(jointW,1);
  AUDIO.behead(1.1);AUDIO.spurt(1.1);
  this.hitFlash=1;this.whiteFlash=1;this.rootVel.z-=.45;this.bigEvent=true;
  FX.word('싹둑!',jointW,{size:64,color:'#ffffff',force:true,dur:.85,dy:-30});
  if(this.state==='stand'){this.sp.chest.kick(-3,rnd(-2,2),rnd(-2,2));this.sp.spine.kick(-2,0,0);}
  // 파충류 머리가 곧 자라난다(죽은 뒤에도 자란다)
  this.regrowHead={t:-1.5,dur:2.4,built:false,goo:0};
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 // 목 윗면(그루터기) 막기: 겉 살 → 비늘 → 파란 속
 capNeck(neck,jointW,upW){
  if(this.neckCap){this.neckCap.removeFromParent();this.releaseLoose(this.neckCap);this.neckCap=null;}
  neck.updateWorldMatrix(true,false);
  const q=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),upW);
  const g=grp(neck);g.position.copy(neck.worldToLocal(jointW.clone())).add(V3(0,-.012,0));
  g.quaternion.copy(neck.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
  // 다시 자란 가는 목(healNeck)은 잘리는 자리 굵기가 반지름 .1쯤이다
  const r=this.neckThin?.1:.108;
  this.trimCutEnd(neck,g,r,1);
  this.detailCutCap(g,r,this.headKind==='rep'?this.M.liz:this.M.skin,-PI/2,1);
  this.neckCap=g;
 },
 buildHeadRegrowth(r){
  const M=this.M,rg=this.repFaceG;
  this.repHead.scale.setScalar(1);
  r.mats=[];r.skin=[];
  const reveal=(mesh,offset)=>{const old=mesh.material,m=headGrowthMaterial(old,offset);mesh.material=m;r.mats.push(m);this.disposables.push(m);return {mesh,old,m,shadow:mesh.castShadow};};
  r.skin.push(reveal(this.repSkull,0),reveal(this.repJaw,-.07));
  for(const layer of r.skin)layer.mesh.castShadow=false;
  r.frame=grp(rg);r.raw=grp(rg);
  const stage=(mesh,parent,base,offset=0)=>{
   const m=headGrowthMaterial(base,offset);mesh.material=m;r.mats.push(m);this.disposables.push(m);
   mesh.userData.noHit=true;mesh.userData.gore=true;mesh.visible=PREF.blood;mesh.castShadow=false;this.goreMeshes.push(mesh);parent.add(mesh);return mesh;
  };
  const skull=GEO.regrowSkull||(GEO.regrowSkull=SCULPT.star(HEADGEO.rep,V3(0,0,.02),48,36,.34,{smooth:0}));
  const jaw=GEO.regrowJaw||(GEO.regrowJaw=SCULPT.star(HEADGEO.repJaw,V3(0,-.14,.075),40,24,.2,{smooth:0}));
  r.boneMeshes=[stage(new THREE.Mesh(skull),r.frame,M.regBone),stage(new THREE.Mesh(jaw),r.frame,M.regBone)];
  r.boneMeshes[0].scale.set(.88,.91,.9);r.boneMeshes[1].scale.set(.9,.9,.9);
  r.rawMeshes=[stage(new THREE.Mesh(skull),r.raw,M.rawFlesh),stage(new THREE.Mesh(jaw),r.raw,M.rawFlesh)];
  r.rawMeshes[0].scale.set(.96,.96,.96);r.rawMeshes[1].scale.set(.96,.96,.96);
  // Short vertebral column bridges the cut neck to the skull base.
  for(let i=0;i<3;i++){
   const m=mk(GEO.regrowVertebra||(GEO.regrowVertebra=new THREE.TorusGeometry(.036,.012,8,18)),M.regBone,r.frame,{p:[0,-.14+i*.037,-.032],r:[PI/2,0,0],s:[1,.9,1],cast:false});
   r.boneMeshes.push(stage(m,r.frame,M.regBone,-.14+i*.037));
  }
  // Paired cheek muscles pull the lower jaw into place before skin covers them.
  for(const side of [-1,1]){
   const key='regrowCheek'+side;
   const geo=GEO[key]||(GEO[key]=SCULPT.tube(V3(side*.12,.032,.02),V3(side*.074,-.09,.13),t=>.013+.012*Math.sin(PI*t),12,12,{cap:2}));
   r.rawMeshes.push(stage(new THREE.Mesh(geo),r.raw,M.rawFlesh));
  }
  r.lids=[];
  for(const e of this.repEyes){
   for(const sign of [1,-1]){const key='regrowLid'+sign;
    const geo=GEO[key]||(GEO[key]=new THREE.SphereGeometry(1,20,10,0,TAU,sign>0?0:PI/2,PI/2));
    const lid=mk(geo,M.liz,e.socket,{p:[0,0,.006],s:[.044,.032,.032],cast:false});lid.userData.noHit=true;lid.userData.sign=sign;r.lids.push(lid);
   }e.root.visible=false;
  }
  r.extras=rg.children.filter(o=>o!==this.repSkull&&o!==this.repJawBone&&o!==r.frame&&o!==r.raw&&!this.repEyes.some(e=>o===e.eg||o===e.socket));
  r.teeth=this.repJawBone.children.filter(o=>o!==this.repJaw&&o!==this.repFork.g);
  for(const o of [...r.extras,...r.teeth])o.visible=false;
 },
 finishHeadRegrowth(r){
  for(const layer of r.skin){layer.mesh.material=layer.old;layer.mesh.castShadow=layer.shadow;}
  for(const o of [r.frame,r.raw,...r.lids]){o.removeFromParent();this.releaseLoose(o);}
  for(const m of r.mats){m.dispose();const i=this.disposables.indexOf(m);if(i>=0)this.disposables.splice(i,1);}
 },
 // 다시 자란 파충류 머리 밑의 목: 잘려서 평평하게 다듬어진 굵은 목을, 옷깃 쪽은 그대로 굵고 위로 갈수록 머리 밑동만큼 가늘어지는
 // 둥근 목으로 바꾸고 그루터기 단면을 걷는다
 healNeck(){
  const m=this.neckMesh;
  if(m&&m.parent&&!m.userData.detached&&m.userData.flesh){const geo=FLESH.clone(BODYGEO.repNeck()),old=m.geometry;m.geometry=geo;m.userData.flesh.setGeometry(geo);this.disposables.push(geo);this.releaseGeometry(old);this.neckThin=true;}
  if(this.neckCap){this.neckCap.removeFromParent();this.releaseLoose(this.neckCap);this.neckCap=null;}
 },
 updateHeadRegrow(dt){
  const r=this.regrowHead;if(!r)return;
  if(this.holdRegrow&&!r.built)return;
  r.t+=dt;
  if(!r.built){
   if(r.t<0)return;
   this.buildRepHead();this.buildHeadRegrowth(r);r.built=true;r.t=0;AUDIO.boneOut(.9);
   if(this.onHeadRegrow)this.onHeadRegrow();
  }
  const u=sat(r.t/r.dur),reveal=(list,k)=>{for(const o of list)o.material.userData.headGrowth.value=lerp(-.35,.25,smooth(k));};
  // 0–42%: skull and jaw; 24–69%: muscle; 50–88%: scales; 80–97%: eyes open.
  reveal(r.boneMeshes,sat(u/.42));reveal(r.rawMeshes,sat((u-.24)/.45));
  for(const layer of r.skin)layer.m.userData.headGrowth.value=lerp(-.35,.25,smooth(sat((u-.50)/.38)));
  // Retire covered tissue behind the advancing edge; no overlapping shells flicker.
  for(const m of r.boneMeshes)m.material.userData.headCovered.value=r.rawMeshes[0].material.userData.headGrowth.value-.012;
  for(const m of r.rawMeshes)m.material.userData.headCovered.value=r.skin[0].m.userData.headGrowth.value-.012;
  r.frame.visible=u<.88;r.raw.visible=u<.89;
  if(this.neckCap&&u>.12)this.neckCap.visible=false;
  // 목도 같이 자란다: 새 비늘이 그루터기 가장자리를 덮을 때쯤, 칼로 자른 듯 평평하던 굵은 그루터기를
  // 위로 갈수록 머리 밑동 굵기까지 가늘어지는 둥근 목으로 바꾼다(머리가 단 위에 얹힌 꼴이 안 되게)
  if(!r.healed&&u>.66){r.healed=true;this.healNeck();}
  this.repHead.rotation.x=.15*(1-smooth(sat((u-.46)/.45)));
  this.repJawBone.rotation.x=.26*(1-smooth(sat((u-.38)/.34)));
  for(const o of r.extras)o.visible=u>.60;
  for(const o of r.teeth)o.visible=u>.43;
  for(let i=0;i<this.repEyes.length;i++){
   const e=this.repEyes[i],open=smooth(sat((u-.80-i*.025)/.15));
   e.socket.visible=u>.28;e.root.visible=u>.79;
   for(let j=i*2;j<i*2+2;j++){const lid=r.lids[j];lid.visible=u>.67&&open<.999;lid.scale.y=.032*Math.max(.001,1-open);lid.position.y=lid.userData.sign*.032*open;}
  }
  if(!r.rawSound&&u>.24){r.rawSound=true;AUDIO.squelch(.8);}
  if(!r.skinSound&&u>.5){r.skinSound=true;AUDIO.scaleSet(.8);}
  r.goo-=dt;if(r.goo<=0&&u<.84&&PREF.blood){r.goo=rnd(.10,.18);const neck=this.bones.neck;neck.updateWorldMatrix(true,false);const p=neck.localToWorld(V3(rnd(-.04,.04),.12,.02));BLOOD.emit('blood',p,V3(rnd(-.3,.3),rnd(.1,.5),rnd(0,.4)),rnd(.003,.006),1);}
  if(u>=1){
   this.finishHeadRegrowth(r);this.repHead.rotation.x=0;this.repJawBone.rotation.x=0;
   for(const e of this.repEyes)if(!e.ejected){e.root.visible=true;e.root.scale.setScalar(1);}
   this.regrowHead=null;
   this.headGone=false;this.headTear=0;this.headGunHits=0;this.headDone={};this.repEyeHits=[0,0];
   this.repFull=true;this.deadStare=1;AUDIO.hiss(1);if(this.neckCap)this.neckCap.visible=false;
  }
 },
 // 파충류 머리를 목 위에 새로 올린다
 buildRepHead(){
  const M=this.M,G=HEADGEO.build();
if(this.neckMesh){this.neckMesh.material=M.liz;this.neckMesh.userData.flesh.o.kind='liz';}
const head=this.bone('head',this.bones.neck,[0,.06,.03]);

// 목 절단면을 재생 중심으로 사용한다.
const grow=this.repHead=grp(head,[0,.065,-.02],'repHead');
grow.scale.setScalar(.04);

// 다 자라면 기존 머리 위치와 정확히 같아진다.
const rg=grp(grow,[0,.15,.02]);this.repFaceG=rg;
  // 새 머리: 부위 손상 기록을 비운다(바닥의 눈알·혀 조각은 그대로 둔다)
  this.resetHeadDamage(true);
 
 
  // 두개골·아래턱(비늘 살)
  this.repSkull=this.addFlesh(FLESH.clone(G.rep),M.lizHead,rg,{part:'head',kind:'liz',center:V3(0,0,.02),maxFrac:.42,maxAbs:.09,minEdge:.0052});
  const jaw=this.repJawBone=grp(rg,[0,-.07,-.03]);
  this.repJaw=this.addFlesh(FLESH.clone(G.repJaw),M.lizHead,jaw,{part:'mouth',kind:'liz',center:V3(0,-.05,.1),maxFrac:.4,maxAbs:.05,minEdge:.0052});
  // Forward-facing eyes sit inside sculpted lids; no separate goggle-like rings.
  this.repEyes=[];this.repEyeHits=[0,0];this.repMemK=-1;this.repMemWait=rnd(5,9);
  for(const s of [-1,1]){
   const side=s<0?'L':'R',pos=[s*.074,.064,.133];
   const socket=grp(rg,pos);socket.rotation.y=s*.045;
   const cavity=mk(GEO.repSocket||(GEO.repSocket=eyeCapGeo(.043,1.12,false)),M.mouth,socket,{p:[0,0,-.013],s:[1,.77,.32],cast:false});cavity.userData.noHit=true;
   const eg=grp(rg,pos);eg.rotation.y=s*.045;const root=grp(eg);
   const ball=mk(sphereGeo(22),M.lizEyeBall,root,{s:[.034,.024,.031],part:'repEye'+side,cast:false});
   const iris=mk(GEO.repEyeIris||(GEO.repEyeIris=eyeCapGeo(.034,1.08,false)),M.lizEye,root,{s:[1,.78,.94],cast:false,part:'repEye'+side});
   const hl=mk(sphereGeo(10),M.hl,root,{p:[-.008,.008,.034],s:.0018,cast:false});hl.userData.noHit=true;
   const mem=mk(GEO['repMem'+side]||(GEO['repMem'+side]=eyeCapGeo(.0355,1.08,s>0)),M.repMem,socket,{s:[1,.78,.96],cast:false});
   mem.visible=false;mem.renderOrder=3;mem.userData.noHit=true;
   this.repEyes.push({s,eg,root,ball,iris,hl,socket,mem,ejected:false});
  }
  // Teeth stay behind the neutral lipless seam, visible only when the jaw opens.
  const tooth=REP_TOOTH();
  for(let i=0;i<7;i++){const u=(i-3)/3.2,x=u*.068,z=.140-Math.abs(u)*.018;
   mk(tooth,M.claw,rg,{p:[x,-.118,z],s:[.005,.012,.005],cast:false,part:'mouth'});}
  for(let i=0;i<5;i++){const u=(i-2)/2.4,x=u*.058,z=.140-Math.abs(u)*.018;
   mk(tooth,M.claw,jaw,{p:[x,-.064,z+.03],s:[.004,.010,.004],r:[PI,0,0],cast:false,part:'mouth'});}
  for(const s of [-1,1])mk(sphereGeo(10),M.mouth,rg,{p:[s*.016,-.055,.211],s:[.0055,.0026,.003],cast:false,part:'head'}).userData.noHit=true;
  // 갈라진 혀
  {const ts=new THREE.Shape();ts.moveTo(-.008,0);ts.lineTo(-.009,.09);ts.lineTo(-.016,.125);ts.lineTo(-.004,.1);ts.lineTo(0,.104);ts.lineTo(.004,.1);ts.lineTo(.016,.125);ts.lineTo(.009,.09);ts.lineTo(.008,0);ts.closePath();
   const fg=new THREE.ExtrudeGeometry(ts,{depth:.006,bevelEnabled:true,bevelThickness:.002,bevelSize:.0016,bevelSegments:2,curveSegments:2});fg.rotateX(PI/2);
   const fork=grp(jaw,[0,-.039,.177]);fork.rotation.x=.10;const fm=mk(fg,M.fork,fork,{cast:false});fm.userData.noHit=true;fork.visible=false;this.repFork={g:fork,k:-1};}
  rg.updateMatrixWorld(true);
  rg.traverse(ob=>{if(!ob.isMesh)return;ob.userData.seg='head';if(ob.userData.part&&!ob.userData.noHit&&!this.parts.includes(ob))this.parts.push(ob);if(ob.userData.flow){(this.flow.head||(this.flow.head=[])).push(ob);FASTRAY.grid(ob.geometry);}});
  this._flowAll=null;this.headKind='rep';this.headR=.235;this.repFlickT=rnd(2.5,4);
 },
 // 파충류 얼굴: 무표정한 안와·입꼬리는 고정, 호흡과 시선만 살아 있다
 updateRepFace(dt,time){
  if(this.headGone||this.headKind!=='rep'||!this.repHead)return;
  // 말할 때는 턱을 벌렸다 닫는다
  if(this.talk>.01)this.talkPhase=(this.talkPhase||0)+dt*TAU*5.4;
  const talkOpen=this.talk>.01?this.talk*(.012+.055*Math.max(0,Math.sin(this.talkPhase))*(.6+.4*Math.sin(this.talkPhase*.43+1.7))):0;
  const open=.004+.004*(.5+.5*Math.sin(time*1.1))+(this.flinch>.2?.12*this.flinch:0)+talkOpen+(this.repFork&&this.repFork.k>=0?.025:0)+(time<this.mouthCoinUntil?.38:0);
  // 턱이 빠졌으면 벌어진 채 비뚤게 늘어진다. 떨어졌으면 건드리지 않는다
  const D=this.jawDisloc,da=D?D.sp.x:0;
  if(this.repJawBone&&!this.jawGone&&!this.repJawBone.userData.detached){this.repJawBone.rotation.set(open+da*.5,0,D?D.side*da*.3:0);this.repJawBone.position.x=D?D.side*da*.014:0;}
  if(this.flinch>0)this.flinch=Math.max(0,this.flinch-dt*2.6);
  // 세로 동공이 나를(카메라) 노려본다
  if(this.repEyes)for(const e of this.repEyes){if(e.ejected)continue;const eg=e.eg;eg.parent.updateWorldMatrix(true,false);
   const l=_fv2.copy(camera.position);eg.parent.worldToLocal(l).sub(eg.position);
   const yaw=Math.atan2(l.x,l.z),pitch=-Math.atan2(l.y,Math.hypot(l.x,l.z));
   eg.rotation.set(clamp(pitch,-.18,.18),clamp(yaw,-.22,.22),0);}
  // Rare nictitating sweep; the surrounding lids never blink or emote.
  this.repMemWait-=dt;if(this.repMemWait<=0&&this.repMemK<0){this.repMemK=0;this.repMemWait=rnd(6,11);}
  if(this.repMemK>=0){this.repMemK+=dt/.42;const k=this.repMemK,m=k<.42?smooth(k/.42):1-smooth((k-.42)/.58);
   this.M.repMem.map.offset.x=.5*m;for(const e of this.repEyes)e.mem.visible=!e.ejected&&m>.01;
   if(k>=1){this.repMemK=-1;this.M.repMem.map.offset.x=0;for(const e of this.repEyes)e.mem.visible=false;}
  }
  // 혀 날름
  this.repFlickT-=dt;if(this.repFlickT<=0){this.repFlickT=rnd(4.5,8);if(this.repFork&&this.repFork.k<0){this.repFork.k=0;AUDIO.hiss(.8);}}
  const f=this.repFork;if(f&&f.k>=0){f.k+=dt/.7;const k=f.k,e=k<.2?smooth(k/.2):k<.55?1:1-smooth((k-.55)/.45);f.g.visible=e>.03;f.g.scale.set(1,1,Math.max(.02,e));f.g.rotation.x=.10+Math.sin(time*36)*.04*e;if(k>=1){f.k=-1;f.g.visible=false;}}
 },
});
/* ===== 6-4-4. 머리 부위 파괴 =====
 * 머리는 '어디를(정수리·옆머리·턱·코·귀·눈·목) 무엇으로(주먹·칼·총) 몇 번' 맞았는지에 따라 그 자리가 망가진다.
 * - 총: 같은 구역에 몰리면 그 구역이 터져 나간다. 정수리 3발 → 윗머리가 비스듬히 날아가고 뇌가 드러남, 옆머리 3발 → 옆통수가 뒤로 뜯기고 그쪽 눈알이 시신경에 매달려 덜렁,
 *   턱 1발 → 턱 빠짐, 2발 → 아래턱이 통째로 떨어짐(윗니만 남고 혀가 목구멍에 늘어짐), 코 2발 → 코가 뭉개짐. 총으로는 머리가 목에서 떨어지지 않는다
 * - 주먹: 같은 옆머리에 훅·어퍼가 쌓이면 두개골 함몰(두 단계, 두 번째에 그쪽 눈알이 튀어나옴), 턱에 쌓이면 턱 탈구 → 어퍼컷에 떨어짐
 * - 칼: 귀를 가로질러 그으면 귀가 떨어지고, 코를 두 번 가로질러 그으면 코끝, 턱수염을 그으면 수염 가닥이 잘린다.
 *   목은 가로질러 세 번 그어야 떨어진다(1 깊은 베임 → 2 동맥 터짐·머리 꺾여 덜렁·목 움켜쥠 → 3 참수). 세로로 내려 긋거나 찌르면 상처·피만
 * 잘려 나간 조각 위에 얹혀 있던 부품(머리카락·관·눈썹·귀·수염·이빨)은 조각에 실어 같이 보낸다(허공에 남지 않게). 재생된 파충류 머리도 같은 규칙 */
const _hdv1=V3(),_hdv2=V3(),_hdq1=new THREE.Quaternion(),_hdm1=new THREE.Matrix4();
const HEAD_OFF=V3(0,.215,0); // 얼굴 좌표 → 머리 뼈 좌표 옮김(평행이동만)
Object.assign(Emperor.prototype,{
 resetHeadDamage(keepLoose){
  this.headDmg={top:0,sideL:0,sideR:0,jaw:0,nose:0,face:0};
  this.headBlunt={sideL:0,sideR:0,jaw:0};
  this.headLost={top:false,sideL:false,sideR:false,jaw:false,nose:false,earL:false,earR:false};
  this.skullCave=[0,0];this.jawDisloc=null;this.jawGone=false;this.jawRest=null;
  this.neckCut={hits:0,strokes:new Map(),counted:null};
  if(!this.loll)this.loll={sp:new Spring(26,4),sr:new Spring(26,4)};else{this.loll.sp.t=0;this.loll.sr.t=0;}
  this.noseCuts={hits:0,last:null};this.gurgleT=0;this.dizzyT=0;this.neckBack=0;
  if(!keepLoose){this.dangles=[];this.tethers=[];}
  AUDIO.setJawGone(false);
 },
 headFrame(){return this.headKind==='rep'?(this.repFaceG||null):this.face;},
 headLocal(pt){const F=this.headFrame();if(!F)return V3();F.updateWorldMatrix(true,false);return F.worldToLocal(pt.clone());},
 // 맞은 자리 → 머리 구역 이름
 headRegionAt(h){
  const part=h.part,o=h.obj,rep=this.headKind==='rep';
  if(part==='eyeL'||part==='repEyeL')return 'eyeL';if(part==='eyeR'||part==='repEyeR')return 'eyeR';
  if(part==='beard')return 'beard';
  if(!rep&&o&&this.earMeshes&&this.earMeshes.includes(o))return o===this.earMeshes[0]?'earL':'earR';
  const jawBone=rep?this.repJawBone:this.jaw;for(let p=o;p&&jawBone;p=p.parent)if(p===jawBone)return 'jaw';
  const l=this.headLocal(h.point);
  if(rep){
   if(l.y>.12)return 'top';
   if(Math.abs(l.x)>.1&&l.y>-.05&&l.z<.12)return l.x<0?'sideL':'sideR';
   if(l.z>.185&&Math.abs(l.x)<.038&&l.y>-.077&&l.y<.085)return 'nose';
   if(l.y<-.103&&l.z>.02)return 'jaw';
   return 'face';
  }
  if(part==='nose')return 'nose';
  if(part==='chin'||part==='mouth'||(l.y<-.085&&Math.abs(l.x)<.15&&l.z>-.02))return 'jaw';
  if(l.y>.125)return 'top';
  if(Math.abs(l.x)>.16&&l.y>-.05&&l.z<.03&&l.z>-.08)return l.x<0?'earL':'earR';
  if(Math.abs(l.x)>.105&&l.y>-.06)return l.x<0?'sideL':'sideR';
  return 'face';
 },
 /* ---- 총 ---- */
 gunHead(region,pt,n,dir,h){
  const D=this.headDmg,L=this.headLost,rep=this.headKind==='rep';
  if(region==='beard'||region==='face'){if(region==='face')D.face++;return;}
  if(region==='eyeL'||region==='eyeR'){
   if(rep)return; // 파충류 눈은 repEyeHits가 센다
   const i=region==='eyeL'?0:1,e=this.eyes[i];
   // 빠진 눈 자리를 또 쏘면 안와가 뒤로 뚫린다
   if(e&&e.ejected&&!e.blown){e.blown=true;this.blowSocket(i,pt,n,dir);}
   return;
  }
  D[region]=(D[region]||0)+1;
  if(region==='top'){if(D.top>=3&&!L.top)this.blowTop(pt,n,dir);}
  else if(region==='sideL'||region==='sideR'){
   const side=region==='sideL'?-1:1,i=side<0?0:1;
   if(D[region]>=3&&!L[region])this.blowSide(side,pt,n,dir);
   else if(D[region]===2&&!rep&&this.eyes[i]&&!this.eyes[i].ejected){this.swellU[i]=Math.max(this.swellU[i],.7);this.eyes[i].ruined=true;}
  }else if(region==='jaw'){
   if(this.jawGone)return;
   if(D.jaw===1){this.knockTooth(dir);if(Math.random()<.6)this.knockTooth(dir);if(!this.jawDisloc)this.dislocateJaw(dir,.8);}
   else if(D.jaw>=2)this.ripJaw(dir,'gun');
  }else if(region==='nose'){
   if(D.nose>=2&&!L.nose)this.smashNose(pt,n,dir);
   else if(!rep&&!this.noseBleeding){this.noseBleeding=true;for(const nn of this.nostrils){nn.updateWorldMatrix(true,false);BLOOD.addWound('head',nn.getWorldPosition(V3()),V3(0,-.4,1).normalize(),{rate:.006,tau:60,kind:'nose'});}}
  }
 },
 /* ---- 주먹 ---- */
 bluntHead(region,kind,pt,n,dir,P,h){
  const heavy=kind==='hook'||kind==='upper',B=this.headBlunt;
  if(region==='sideL'||region==='sideR'){
   const i=region==='sideL'?0:1;B[region]+=heavy?1:.35;
   const st=this.skullCave[i];
   if(st===0&&B[region]>=5)this.caveSkull(i,pt,n,dir,1);
   else if(st===1&&B[region]>=10)this.caveSkull(i,pt,n,dir,2);
  }else if(region==='jaw'){
   if(this.jawGone)return;
   B.jaw+=heavy?1:.3;
   if(!this.jawDisloc){if(B.jaw>=4)this.dislocateJaw(dir,1);}
   else if(B.jaw>=12&&kind==='upper')this.ripJaw(dir,'hand');
   else if(B.jaw>=8&&heavy&&this.jawDisloc.amt<1.5)this.dislocateJaw(dir,1.6);
  }
 },
 /* ---- 칼(긋기) ---- */
 // 턱 밑 띠(두 겹 턱살 아래, 입술보다 아래): 목이 살에 묻혀 안 보이는 체형이라 여기를 가로지르는 칼이 곧 목을 긋는 것이다
 inThroat(l){return this.headKind==='rep'?(l.y<-.08&&l.z<.04&&Math.abs(l.x)<.12):(l.y<-.118&&Math.abs(l.x)<.16&&l.z>-.03);},
 knifeHead(region,h,kind,pt,n,dir){
  if(region!=='beard'&&this.inThroat(this.headLocal(pt))){this.neckKnife(h,kind,pt,n,dir);return;}
  if(kind!=='slash'||!h.slashFrom)return;
  const a=h.slashFrom,len=a.distanceTo(pt);
  if(region==='earL'||region==='earR'){const i=region==='earL'?0:1;if(len>.012&&!this.headLost[region])this.earOff(i,pt,n,dir,a);return;}
  if(region==='beard'){this.cutBeard(h,pt,n,dir,a);return;}
  if(region==='nose'&&!this.headLost.nose){
   // 코를 가로질러(좌우로) 그은 선만 센다: 첫 번째는 깊은 베임, 두 번째에 코끝이 떨어진다
   const F=this.headFrame();if(!F)return;F.updateWorldMatrix(true,false);
   const la=F.worldToLocal(a.clone()),lb=F.worldToLocal(pt.clone()),d=lb.clone().sub(la);
   if(Math.abs(d.x)<Math.abs(d.y)*.8||len<.016)return;
   const N=this.noseCuts;if(N.last===h.strokeId)return;N.last=h.strokeId;N.hits++;
   if(N.hits>=2)this.cutNose(pt,n,dir,la,lb);
   else{BLOOD.addWound('head',pt,n,{rate:.022,tau:40,kind:'cut',spread:.01});BLOOD.spray(pt,n,14,{max:3});AUDIO.spurt(.5);this.voiceCool=0;AUDIO.voice('yelp',1);this.voiceCool=G.time+.4;}
  }
 },
 /* ---- 목(칼) ---- */
 neckKnife(h,kind,pt,n,dir){
  const neck=this.bones.neck;if(!neck)return;
  const seg=(h.obj&&h.obj.userData.seg&&this.bones[h.obj.userData.seg])?h.obj.userData.seg:'neck';
  if(kind!=='slash'||!h.slashFrom){
   // 찌르기: 동맥이 터져 피가 뿜어지고 꾸르륵거릴 뿐 떨어지지는 않는다
   if(seg!=='neck')BLOOD.addWound(seg,pt,n,{rate:.04,tau:30,artery:true,kind:'stab'});
   BLOOD.spray(pt,n,16,{min:1.2,max:4.2,spread:1});AUDIO.spurt(.8);this.gurgleT=Math.max(this.gurgleT,2.2);return;
  }
  neck.updateWorldMatrix(true,false);
  const up=_hdv1.set(0,1,0).transformDirection(neck.matrixWorld).normalize();
  const a=h.slashFrom,d=pt.clone().sub(a),len=d.length();if(len<.004)return;d.divideScalar(len);
  const along=Math.abs(d.dot(up));
  if(along>.62)return; // 목 축과 52도 안쪽으로 기운 선(세로로 내려 긋기 등): 베인 상처만. 가로에 가까운 선만 목을 긋는 것으로 친다
  const C=this.neckCut,sid=h.strokeId==null?'nk-'+(++this.cutStrokeFallback):h.strokeId;
  const acc=(C.strokes.get(sid)||0)+len*(1-along*.6);C.strokes.set(sid,acc);
  if(C.strokes.size>8){const first=C.strokes.keys().next().value;if(first!==sid)C.strokes.delete(first);}
  if(acc<.045||C.counted===sid)return;
  C.counted=sid;C.hits++;
  const lp=neck.worldToLocal(pt.clone()),side=lp.x<0?-1:1;
  this.neckStage(C.hits,pt,n,dir,side,seg);
 },
 neckStage(k,pt,n,dir,side,seg='neck'){
  const neck=this.bones.neck;neck.updateWorldMatrix(true,false);
  if(k===1){
   BLOOD.addWound(seg,pt,n,{rate:.035,tau:50,artery:true,kind:'cut',spread:.02});BLOOD.spray(pt,n,24,{min:1.2,max:4,spread:1});
   AUDIO.spurt(.9);this.voiceCool=0;AUDIO.voice('gasp',1.1);this.voiceCool=G.time+.5;
   // 목을 베이면 고개가 뒤로 젖혀진 채 한동안 굳는다(목이 드러난다)
   this.neckBack=3.2;this.loll.sp.kick(-4);
   this.sp.head.kick(-1.5,side*2,side*2);this.doFlinch('shock',1);this.setEmotion('scared');this.shockT=2.2;this.screenSplat(pt,.5);
   this.hitFlash=1;this.bigEvent=true;
   FX.word('촤악!',pt,{size:52,color:'#dfe9ff',force:true,dy:-24});
  }else if(k===2){
   // 동맥이 터진다: 피 분수, 머리가 베인 반대쪽 뒤로 꺾여 덜렁거림, 두 손으로 잠깐 목을 움켜쥠, 꾸르륵.
   // 앞이 거의 다 잘린 목이라 머리는 뒤로 넘어가고 벌어진 목이 나를 향한다. 예전에는 앞으로 늘어져서 턱과 얼굴이 남은 목을 가렸고
   // (두 손으로 3.2초 움켜쥐며 고개도 숙였다), 세 번째로 그을 자리가 거의 남지 않았다
   BLOOD.addWound(seg,pt,n,{rate:.09,tau:70,artery:true,kind:'cut',spread:.03});
   BLOOD.spray(pt,n.clone().lerp(V3(0,1,0),.5).normalize(),40,{min:2,max:6,spread:1.2,smax:.011});
   this.loll.sp.t=-.34;this.loll.sr.t=side*.5;this.loll.sp.kick(-5);this.loll.sr.kick(side*6);
   for(const ax of ['x','y','z']){this.sp.neck[ax].k=55;this.sp.neck[ax].c=5;}
   this.gurgleT=5;
   if(this.state==='stand'){const B=this.bones[seg]||neck;const lp=B.worldToLocal(pt.clone()),ln=n.clone().transformDirection(_invB(B));this.doAct('clutch',{side:'R',both:true,seg,lp,ln,dur:1.1,prio:3,noBow:true});}
   this.screenSplat(pt,.9);AUDIO.spurt(1.3);this.voiceCool=0;AUDIO.voice('gurgle',1.2);this.voiceCool=G.time+.4;
   this.setEmotion('shock');this.shockT=2.5;this.hitFlash=1;this.whiteFlash=Math.max(this.whiteFlash,.8);this.bigEvent=true;
   FX.word('푸슉!',pt,{size:56,color:'#dfe9ff',force:true,dy:-30});
  }else if(k>=3)this.severHead(dir);
 },
 /* ---- 매 프레임: 덜렁거리는 머리·빠진 턱·꾸르륵·어지러움 ---- */
 updateHeadDamage(dt){
  const L=this.loll;
  if(L){
   // 첫 번째 목 베임 뒤 고개 뒤로 젖힘(한동안) → 두 번째부터는 옆·뒤로 꺾여 늘어진 채 벌어진 목이 드러남
   if(this.neckBack>0){this.neckBack-=dt;if(this.neckCut.hits<2)L.sp.t=-.38;}
   else if(this.neckCut.hits<2&&!this.headGone)L.sp.t=0;
   L.sp.step(dt);L.sr.step(dt);
  }
  if(this.jawDisloc){const D=this.jawDisloc;D.sp.t=D.amt;D.sp.step(dt);}
  if(this.dizzyT>0){this.dizzyT-=dt;if(this.dizzyT<=0){this.dizzyT=0;if(this.state==='stand')this.dizzy=0;}}
  if(this.gurgleT>0){this.gurgleT-=dt;
   if(G.time>=(this.gurgleNext||0)&&!this.headGone&&this.state!=='dead'){this.gurgleNext=G.time+rnd(.55,.95);AUDIO.voice('gurgle',.85);
    if(PREF.blood){const F=this.headFrame();if(F){F.updateWorldMatrix(true,false);const p=F.localToWorld(V3(rnd(-.02,.02),this.jawGone?-.12:-.1,.19));BLOOD.spray(p,V3(0,-.4,.9).normalize(),6,{min:.4,max:1.4,spread:.5});}}}}
 },
 /* ---- 평면으로 머리를 썬다: 살은 평면으로 나누고(전부 떨어지는 쪽이면 통째로), 부품은 가운데가 떨어지는 쪽이면 통째로 실어 보낸다 ---- */
 _planeCut(f,nW,pW){
  const m=f.mesh;if(!m||!m.parent||m.userData.detached)return {kind:'none'};
  m.updateWorldMatrix(true,false);
  const inv=_hdm1.copy(m.matrixWorld).invert();
  const nL=nW.clone().transformDirection(inv).normalize(),pL=pW.clone().applyMatrix4(inv),d=nL.dot(pL);
  const P=f.pos;let pos=false,neg=false;
  for(let i=0;i<f.n;i++){const s=nL.x*P[i*3]+nL.y*P[i*3+1]+nL.z*P[i*3+2]-d;if(s>.0006)pos=true;else if(s<-.0006)neg=true;if(pos&&neg)break;}
  if(!pos)return {kind:'none'};
  if(!neg)return {kind:'all'};
  if(f.n>90000)return {kind:'none'};
  let res;try{f.bake();res=SLICE.slice(f.g,nL,d);}catch(_){return {kind:'none'};}
  if(!res||!res.keep||!res.cut)return {kind:'none'};
  const piece=new THREE.Mesh(res.cut,m.material);piece.castShadow=false;piece.receiveShadow=true;piece.userData.noHit=true;piece.userData.detached=true;
  piece.applyMatrix4(m.matrixWorld);scene.add(piece);this.disposables.push(res.cut);
  const oldGeo=m.geometry;m.geometry=res.keep;f.setGeometry(res.keep,true);this.disposables.push(res.keep);this.releaseGeometry(oldGeo);
  f.cutSurface={n:nL.clone(),contours:res.contours};
  return {kind:'split',piece};
 },
 // 머리에 붙어 있던 메시 하나를 조각으로 옮긴다(맞히기 목록·피 투영 목록·살 목록에서 뺀다)
 _detachHeadMesh(m,piece){
  if(!m||!m.parent)return;m.updateWorldMatrix(true,false);piece.attach(m);
  m.userData.detached=true;
  const f=m.userData.flesh;if(f){f.disposeWork();this.fleshList=this.fleshList.filter(x=>x!==f);if(this.headFlesh)this.headFlesh=this.headFlesh.filter(x=>x!==f);}
  this.parts=this.parts.filter(o=>o!==m);
  for(const k in this.flow)this.flow[k]=this.flow[k].filter(o=>o!==m);this._flowAll=null;
  if(this.maskParts)this.maskParts=this.maskParts.filter(o=>o!==m);
 },
 // 뼈째(아래턱) 옮긴다
 _detachHeadTree(root,piece){
  if(!root||!root.parent)return;root.updateWorldMatrix(true,true);piece.attach(root);
  const removed=new Set(),fl=new Set();root.traverse(o=>{o.userData.detached=true;if(o.isMesh){removed.add(o);if(o.userData.flesh){o.userData.flesh.disposeWork();fl.add(o.userData.flesh);}}});
  if(fl.size){this.fleshList=this.fleshList.filter(x=>!fl.has(x));if(this.headFlesh)this.headFlesh=this.headFlesh.filter(x=>!fl.has(x));}
  this.parts=this.parts.filter(o=>!removed.has(o));
  for(const k in this.flow)this.flow[k]=this.flow[k].filter(o=>!removed.has(o));this._flowAll=null;
  if(this.maskParts)this.maskParts=this.maskParts.filter(o=>!removed.has(o));
  BLOOD.detachTree(root);
 },
 sliceHead(nL,pL,o={}){
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return null;
  F.updateWorldMatrix(true,true);
  const nW=nL.clone().transformDirection(F.matrixWorld).normalize(),pW=F.localToWorld(pL.clone()),dL=nL.dot(pL);
  const over=v=>nL.dot(v)-dL>0;
  const piece=new THREE.Group();piece.position.copy(pW);piece.userData.detached=true;scene.add(piece);
  let any=false;
  // 아래턱째
  if(o.withJaw){const jb=rep?this.repJawBone:this.jaw;if(jb&&jb.parent&&!jb.userData.detached){this._detachHeadTree(jb,piece);any=true;}}
  // 살 메시
  const fleshes=rep?[this.repSkull,this.repJaw]:[this.skull,this.hairMesh,...(this.earMeshes||[]),this.chin];
  for(const m of fleshes){if(!m||!m.parent||m.userData.detached)continue;const f=m.userData.flesh;if(!f)continue;
   // 머리카락 껍데기는 살보다 6mm 더 깊이 자른다(단면이 살 단면과 같은 자리에 겹쳐 어른거리지 않게)
   const r=this._planeCut(f,nW,m===this.hairMesh?pW.clone().addScaledVector(nW,-.006):pW);
   if(r.kind==='all'){this._detachHeadMesh(m,piece);any=true;}
   else if(r.kind==='split'){piece.attach(r.piece);any=true;}
  }
  // 살 위에 얹힌 부품
  const ride=[];
  if(!rep){
   for(const m of this.mustache||[])ride.push(m);
   for(const t of [...this.teethU,...this.teethL])if(!t.userData.gone)ride.push(t);
   if(this.tongue&&!this.jawGone&&!(this.tongue.parent&&this.tongue.parent!==this.jaw))ride.push(this.tongue);
   for(const nn of this.nostrils||[])ride.push(nn);
   if(this.browBase)for(const b of this.brows){if(b.gone)continue;const q=this.browBase[2];if(over(V3(b.s*q.x,q.y,q.z))){b.gone=true;ride.push(b.tube.mesh);}}
   if(this.lipU)ride.push(this.lipU.mesh);if(this.lipL)ride.push(this.lipL.mesh);if(this.mouthIn)ride.push(this.mouthIn);
   if(this.fork)ride.push(this.fork.g);
   for(const e of this.eyes){if(e.ejected||!e.eg.parent)continue;if(over(e.eg.position)){e.ejected=true;e.lizard=false;ride.push(e.eg);this.parts=this.parts.filter(ob=>{for(let p=ob;p;p=p.parent)if(p===e.eg)return false;return true;});}}
  }else{
   F.traverse(ob=>{if(ob.isMesh&&!ob.userData.flesh&&!ob.userData.detached&&(ob.material===this.M.claw||ob.material===this.M.fork||(ob.material===this.M.mouth&&ob.userData.part==='head')))ride.push(ob);});
   if(this.repFork)ride.push(this.repFork.g);
  }
  for(const m of ride){if(!m||!m.parent||m.userData.detached)continue;
   const c=F.worldToLocal(m.getWorldPosition(V3()));if(!over(c))continue;
   if(m.userData.tooth)m.userData.gone=true;
   this._detachHeadMesh(m,piece);any=true;
  }
  if(!any){piece.removeFromParent();return null;}
  this.clipBrainCap(nW,pW,piece);
  // 조각 날리기
  const push=(o.dir?o.dir.clone():nW.clone()).normalize().multiplyScalar(o.speed||1.3).addScaledVector(nW,.9);
  push.y=Math.max(push.y+1.2,1.1);push.x+=rnd(-.35,.35);
  this.bits=this.bits||[];
  this.bits.push({obj:piece,body:true,v:push,w:V3(rnd(-8,8),rnd(-10,10),rnd(-8,8)),r:.05,bounce:.2,sound:'head',corners:this.limbCorners(piece),bleed:{lp:V3(0,0,0),ln:nW.clone().negate(),t:0,life:7}});
  this.headPieces=this.headPieces||[];this.headPieces.push(piece);
  while(this.headPieces.length>4){const old=this.headPieces.shift(),bi=this.bits.findIndex(b=>b.obj===old);if(bi>=0)this.bits.splice(bi,1);BLOOD.forgetTree(old);old.removeFromParent();this.releaseLoose(old);}
  // 떨어진 쪽에 있던 피 자국·상처 정리(머리 뼈 좌표 평면)
  BLOOD.clearPlane('head',nL,nL.dot(pL.clone().add(HEAD_OFF)));
  return piece;
 },
 // Later side cuts must remove the exposed organ at the same plane as the skull.
 clipBrainCap(nW,pW,piece){
  const cap=this.brainCap;if(!cap||!cap.parent||cap.parent.userData.detached)return;
  const meshes=[];cap.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const m of meshes){
   m.updateWorldMatrix(true,false);const world=m.matrixWorld.clone(),plane=new THREE.Plane(nW.clone(),-nW.dot(pW)).applyMatrix4(world.clone().invert());
   const res=SLICE.slice(m.geometry,plane.normal,-plane.constant,m.material===this.M.brain);
   if(!res.cut){if(res.keep)res.keep.dispose();continue;}
   if(!res.keep){res.cut.dispose();piece.attach(m);continue;}
   const old=m.geometry;m.geometry=res.keep;this.releaseGeometry(old);this.disposables.push(res.keep,res.cut);
   const off=new THREE.Mesh(res.cut,m.material);off.userData.noHit=true;off.userData.gore=true;off.visible=m.visible;off.applyMatrix4(world);scene.add(off);piece.attach(off);
  }
  if(!cap.children.length){cap.removeFromParent();this.brainCap=null;}
 },
 // 단면 위로 뇌가 비져나온다(윗머리가 날아갔을 때)
 capBrain(F,nL,pL){
  const skull=this.headKind==='rep'?this.repSkull:this.skull,f=skull&&skull.userData.flesh;if(!f)return;
  const cut=f.cutSurface;if(!cut||!cut.contours||!cut.contours.length)return;
  // Use the cutter's actual closed rim in skull-local coordinates. Averaging
  // every cap vertex biases the centre, and one circular radius overhangs an oval.
  const q=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),cut.n),inv=q.clone().invert();
  let loop=null,area=0,cx=0,cz=0;
  for(const contour of cut.contours){
   const points=contour.map(p=>V3(...p).applyQuaternion(inv));let ar=0,x=0,z=0;
   for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],w=a.x*b.z-b.x*a.z;ar+=w;x+=(a.x+b.x)*w;z+=(a.z+b.z)*w;}
   if(Math.abs(ar)>Math.abs(area)){loop=points;area=ar;cx=x/(3*ar);cz=z/(3*ar);}
  }
  if(!loop||Math.abs(area)<1e-8)return;
  const cy=loop.reduce((sum,p)=>sum+p.y,0)/loop.length,center=V3(cx,cy,cz).applyQuaternion(q);
  for(const p of loop){p.x-=cx;p.z-=cz;}
  // Radius to the real rim in each direction; use its first intersection so a
  // dented contour cannot leave an organ protruding across a missing piece.
  const radius=(x,z)=>{let best=Infinity;for(let i=0;i<loop.length;i++){
   const a=loop[i],b=loop[(i+1)%loop.length],dx=b.x-a.x,dz=b.z-a.z,den=x*dz-z*dx;if(Math.abs(den)<1e-10)continue;
   const t=(a.x*dz-a.z*dx)/den,u=(a.x*z-a.z*x)/den;if(t>0&&u>=-1e-6&&u<=1.000001)best=Math.min(best,t);
  }return Number.isFinite(best)?best:0;};
  const radii=Array.from({length:64},(_,i)=>radius(Math.cos(i*TAU/64),Math.sin(i*TAU/64)));
  const rMin=Math.min(...radii),rMax=Math.max(...radii);if(rMin<.008)return;
  const human=this.headKind!=='rep',brainWidth=human?.78:.64,brainHeight=human?.48:.4;
  const g=grp(skull,center.toArray());g.quaternion.copy(q);g.userData.noHit=true;
  // 뇌: 울퉁불퉁한 덩어리에 가운데 고랑
  const bg=new THREE.SphereGeometry(1,40,26),bp=bg.attributes.position,bc=new Float32Array(bp.count*3),base=col('#43607f'),dark=col('#1e2d45');
  for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i);const k=1+.045*Math.sin(x*14+z*6)*Math.sin(y*11+1.3)+.035*Math.sin((x+z)*23+y*9)+.02*Math.sin(x*37-z*29),fis=Math.exp(-(x*x)/.01)*.12*(y>0?1:.3),s=k*(1-fis);bp.setXYZ(i,x*s,y*s,z*s);
   // 고랑(들어간 곳)은 어둡게, 이랑(나온 곳)은 밝게
   const t=clamp((s-.9)/.2,0,1);bc[i*3]=lerp(dark.r,base.r,t);bc[i*3+1]=lerp(dark.g,base.g,t);bc[i*3+2]=lerp(dark.b,base.b,t);}
  bg.setAttribute('color',new THREE.BufferAttribute(bc,3));bg.computeVertexNormals();this.disposables.push(bg);
  for(let i=0;i<bp.count;i++){
   const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i),angle=(Math.atan2(z,x)+TAU)%TAU*64/TAU,k=Math.floor(angle),r=lerp(radii[k%64],radii[(k+1)%64],angle-k);
   bp.setXYZ(i,x*r*brainWidth,y*rMin*brainHeight,z*r*brainWidth);
  }
  bg.computeVertexNormals();
  const brain=mk(bg,this.M.brain,g,{p:[0,-Math.min(.022,rMin*.14),0],cast:false});brain.userData.noHit=true;brain.userData.gore=true;brain.visible=PREF.blood;this.goreMeshes.push(brain);
  // The dark recess follows the same rim, rather than a separate round plate.
  const gp=[],gi=[],gapScales=human?[.72,.92]:[.58,.9];for(const p of loop)for(const scale of gapScales)gp.push(p.x*scale,.0015,p.z*scale);
  for(let i=0;i<loop.length;i++){const a=i*2,b=((i+1)%loop.length)*2;gi.push(a,b,a+1,b,b+1,a+1);}
  if(area<0)gi.reverse();
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));gg.setIndex(gi);gg.computeVertexNormals();this.disposables.push(gg);
  const gap=mk(gg,this.M.socket,g,{cast:false});gap.userData.noHit=true;gap.userData.gore=true;gap.visible=PREF.blood;this.goreMeshes.push(gap);
  f.paint(center,rMax*1.1,3,.9,'max');
  this.brainCap=g;
 },
 blowTop(pt,n,dir){
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return false;F.updateWorldMatrix(true,false);
  const l=F.worldToLocal(pt.clone());
  // 자르는 평면(얼굴 좌표): 앞에서 맞은 높이를 지나고 뒤로 갈수록 올라간다(눈썹·눈은 남고, 단면이 카메라 쪽을 본다)
  const zF=rep?.12:.2,nL=V3(0,1,.25).normalize();
  // Human forehead curvature is lower than the reptilian crown. At .19 the
  // plane missed the human skull entirely and only clipped its hair shell.
  const yFront=clamp(l.y-.25*(zF-l.z),.112,rep?.16:.128);
  const pL=V3(0,yFront,zF);
  const piece=this.sliceHead(nL,pL,{kind:'top',dir:V3(dir.x*.5,.6,-.9),speed:1.5});
  if(!piece)return false;
  this.headLost.top=true;
  if(this.crownOn!==false)this.knockCrown(dir||V3(0,.6,1));
  this.capBrain(F,nL,pL);
  const cW=F.localToWorld(V3(0,yFront+.25*(zF-.04),.04)),nW=nL.clone().transformDirection(F.matrixWorld).normalize();
  BLOOD.addWound('head',cW,nW,{rate:.07,tau:80,artery:true,kind:'cut',spread:.05});
  BLOOD.spray(cW,nW,40,{min:1.5,max:5,spread:1.2,smax:.011});
  if(PREF.blood)CHUNKS.burst(cW,10+(Math.random()*5|0),nW,.04,this.chunkKind({obj:rep?this.repSkull:this.skull,part:'head'}),{speed:1.6});
  this.screenSplat(cW,1);AUDIO.blowout(1.2);AUDIO.spurt(1);
  this.hitFlash=1;this.whiteFlash=1;this.rootVel.z-=.5;this.bigEvent=true;this.sp.head.kick(-3,rnd(-2,2),rnd(-2,2));
  FX.word('퍼엉!',cW,{size:62,color:'#ffffff',force:true,dur:.8,dy:-36});
  this.setEmotion('dazed');this.shockT=3;this.dizzy=Math.max(this.dizzy||0,2.5);this.dizzyT=4;
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 blowSide(side,pt,n,dir){
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return false;F.updateWorldMatrix(true,false);
  const l=F.worldToLocal(pt.clone());
  // 옆통수가 뜯겨 나간다: 바깥·앞을 보며 살짝 위로 기운 평면(정면 카메라에서 단면이 보인다). 맞은 자리보다 1.5cm 안쪽을 지나되 눈은 남긴다
  const nL=V3(side,.2,.42).normalize();
  const xEdge=side*Math.max(Math.abs(l.x)-.015,rep?.1:.122);
  const pL=V3(xEdge,clamp(l.y,-.02,.14),clamp(l.z,-.04,.1));
  // 눈알은 남긴다(평면이 눈 가운데보다 바깥을 지나게 바깥으로 민다)
  {const eyeD=nL.dot(V3(side*(rep?.074:.076),rep?.064:.05,rep?.133:.154)),d=nL.dot(pL);if(d<eyeD+.014)pL.x+=side*(eyeD+.014-d)/Math.abs(nL.x);}
  const piece=this.sliceHead(nL,pL,{kind:'side',dir:V3(side*1.2,.4,-.9),speed:1.4});
  if(!piece)return false;
  this.headLost[side<0?'sideL':'sideR']=true;this.headLost[side<0?'earL':'earR']=true;
  // 그쪽 눈알이 튀어나와 시신경에 매달려 덜렁거린다
  const i=side<0?0:1;
  if(!rep&&this.eyes[i]&&!this.eyes[i].ejected)this.ejectEye(i,n,dir,{dangle:true});
  else if(rep&&this.repEyes&&this.repEyes[i]&&!this.repEyes[i].ejected)this.ejectRepEye(i,n,dir);
  const cW=F.localToWorld(pL.clone()),nW=nL.clone().transformDirection(F.matrixWorld).normalize();
  BLOOD.addWound('head',cW,nW,{rate:.06,tau:70,artery:true,kind:'cut',spread:.04});
  BLOOD.spray(cW,nW,34,{min:1.4,max:4.6,spread:1.1,smax:.01});
  if(PREF.blood)CHUNKS.burst(cW,8+(Math.random()*4|0),nW,.035,this.chunkKind({obj:rep?this.repSkull:this.skull,part:'head'}),{speed:1.5});
  this.screenSplat(cW,.9);AUDIO.blowout(1.1);AUDIO.spurt(.9);
  this.hitFlash=1;this.whiteFlash=1;this.rootVel.z-=.4;this.bigEvent=true;this.sp.head.kick(-1.5,-side*4,-side*3);
  FX.word('퍼억!',cW,{size:58,color:'#ffffff',force:true,dur:.8,dy:-30});
  this.setEmotion('dazed');this.shockT=2.5;this.dizzy=Math.max(this.dizzy||0,2.2);this.dizzyT=3.5;
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 ripJaw(dir,how){
  if(this.jawGone)return false;
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return false;F.updateWorldMatrix(true,true);
  const jb=rep?this.repJawBone:this.jaw;if(!jb||!jb.parent||jb.userData.detached)return false;
  // 윗니 바로 밑을 지나 뒤로 가파르게 내려가는 평면: 아래턱·아랫입술·턱밑 살이 떨어지고 목구멍이 드러난다
  const nL=V3(0,-1,rep?.5:.45).normalize(),pL=rep?V3(0,-.1,.2):V3(0,-.104,.2);
  // 혀는 머리에 남겨 목구멍에서 늘어뜨린다
  const tongue=rep?null:this.tongue;
  if(tongue&&tongue.parent)F.attach(tongue);
  const piece=this.sliceHead(nL,pL,{kind:'jaw',dir:V3((dir?dir.x:0)*.6,.25,1),withJaw:true,speed:1.1});
  if(!piece){if(tongue&&tongue.parent&&this.jaw)this.jaw.attach(tongue);return false;}
  this.jawGone=true;this.headLost.jaw=true;this.jawDisloc=null;AUDIO.setJawGone(true);
  if(this.act&&/^(laugh|spit|beg)$/.test(this.act.name))this.endAct();
  this.talk=0;this.laughAmt=0;this.laughing=0;
  if(!rep){
   for(const t of this.teethL)t.userData.gone=true;
   if(this.lipL)this.lipL.mesh.visible=false;if(this.mouthIn)this.mouthIn.visible=false;if(this.fork)this.fork.g.visible=false;
   if(tongue)this.makeDangle(tongue,F,V3(0,-.108,.075),{off:[0,-.05,.012],scale:[.028,.062,.024],sway:1,k:40,c:3});
  }else if(this.repFork)this.repFork.g.visible=false;
  // 목구멍(어두운 구멍)과 피
  const th=mk(sphereGeo(16),this.M.socket,F,{p:[0,-.126,.045],s:[.046,.032,.052],cast:false});th.userData.noHit=true;
  const cW=F.localToWorld(V3(0,-.115,.1)),nW=V3(0,-.6,.8).normalize().transformDirection(F.matrixWorld).normalize();
  BLOOD.addWound('head',cW,nW,{rate:.075,tau:80,artery:true,kind:'cut',spread:.04});
  BLOOD.spray(cW,nW,36,{min:1.4,max:4.8,spread:1.1,smax:.011});
  if(PREF.blood)CHUNKS.burst(cW,7+(Math.random()*4|0),nW,.03,this.chunkKind({obj:rep?this.repSkull:this.skull,part:'head'}),{speed:1.4});
  this.screenSplat(cW,.9);AUDIO.jawRip(1.1);AUDIO.spurt(1);
  this.hitFlash=1;this.whiteFlash=1;this.rootVel.z-=.4;this.bigEvent=true;this.sp.head.kick(-3,rnd(-2,2),0);
  FX.word('뜨득!',cW,{size:60,color:'#ffffff',force:true,dur:.8,dy:-30});
  this.setEmotion('shock');this.shockT=3;this.gurgleT=4;
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 dislocateJaw(dir,amt){
  if(this.jawGone)return;
  const rep=this.headKind==='rep',F=this.headFrame();if(!F)return;F.updateWorldMatrix(true,false);
  const prev=this.jawDisloc,first=!prev;
  const side=prev?prev.side:(dir&&Math.abs(dir.x)>.15?(dir.x>0?1:-1):(Math.random()<.5?-1:1));
  const sp=prev?prev.sp:new Spring(60,5);sp.kick(14);
  this.jawDisloc={side,amt:Math.min(1.6,Math.max(amt,prev?prev.amt:0)),sp};
  // 관절 자리에서 피, 벌어진 입가에서 피·침
  for(const s of [-1,1]){const p=F.localToWorld(V3(s*(rep?.1:.122),rep?-.03:-.02,rep?-.02:.0));BLOOD.addWound('head',p,V3(s,0,.3).normalize(),{rate:s===side?.012:.006,tau:50,kind:'cut'});}
  if(!rep){if(!this.lipSplit){this.lipSplit=true;const c=F.localToWorld(V3(rnd(-.04,.04),-.105,.205));BLOOD.addWound('head',c,V3(0,-.2,1).normalize(),{rate:.005,tau:60,kind:'lip'});}
   this.knockTooth(dir||V3(0,0,1));}
  AUDIO.jawPop(first?1:.8);this.voiceCool=0;AUDIO.voice('groan',1);this.voiceCool=G.time+.6;
  this.sp.head.kick(-1,side*2,0);this.hitFlash=1;this.bigEvent=true;this.gurgleT=Math.max(this.gurgleT,1.5);
  this.doFlinch('pain',1);this.setEmotion('hurt');this.shockT=1.8;
  FX.word(first?'뚝!':'우득!',F.localToWorld(V3(side*.09,-.12,.14)),{size:50,color:'#ffffff',force:true,dur:.7,dy:-24});
  if(this.onBigEvent)this.onBigEvent('head');
 },
 caveSkull(i,pt,n,dir,stage){
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return;F.updateWorldMatrix(true,false);
  const s=i?1:-1;
  // 움푹 꺼지는 자리: 맞은 자리와 관자놀이 사이, 머리 가운데를 향해
  const temple=F.localToWorld(V3(s*(rep?.11:.13),rep?.04:.05,rep?.02:.08)),c=pt.clone().lerp(temple,.45);
  const into=F.localToWorld(V3(0,.02,0)).sub(c).normalize();
  const fl=[];for(const m of (rep?[this.repSkull]:[this.skull,this.hairMesh,...(this.earMeshes||[])]))if(m&&m.parent&&!m.userData.detached&&m.userData.flesh)fl.push(m.userData.flesh);
  this.deform('dent',c,into,stage===1?.095:.105,stage===1?.056:.046,{bruise:1.5,rim:.12,raw:stage===1?.3:.55,only:fl});
  this.skullCave[i]=stage;
  if(!rep){
   // 그쪽 눈: 부어서 감기고(1단계) → 압력에 튀어나온다(2단계). 귀와 코에서 피
   if(stage===1){this.swellU[i]=1;this.eyes[i].ruined=true;
    if(!this['blackEye'+i]&&!this.eyes[i].ejected){this['blackEye'+i]=true;const e=this.eyes[i];e.eg.updateWorldMatrix(true,false);BLOOD.decal('bruise','head',e.eg.getWorldPosition(V3()).add(V3(0,-.01,.03)),V3(e.s*.3,0,1).normalize(),.07,{force:true,pin:true});}}
   else if(!this.eyes[i].ejected)this.ejectEye(i,n,dir);
   if(!this.noseBleeding){this.noseBleeding=true;for(const nn of this.nostrils){nn.updateWorldMatrix(true,false);BLOOD.addWound('head',nn.getWorldPosition(V3()),V3(0,-.4,1).normalize(),{rate:.006,tau:60,kind:'nose'});}}
   if(!this.headLost[i?'earR':'earL']){const ep=F.localToWorld(V3(s*.185,.02,-.01));BLOOD.addWound('head',ep,V3(s,0,.2).normalize().transformDirection(F.matrixWorld).normalize(),{rate:.012,tau:50,kind:'hole'});}
  }else if(stage===2&&this.repEyes&&this.repEyes[i]&&!this.repEyes[i].ejected)this.ejectRepEye(i,n,dir);
  BLOOD.spray(c,n,stage===1?16:24,{min:1,max:3.2,spread:.9});if(PREF.blood)CHUNKS.burst(c,3,n,.025,this.chunkKind({obj:rep?this.repSkull:this.skull,part:'head'}),{speed:1.2});
  AUDIO.skullCrush(stage===1?1:1.2);
  this.sp.head.kick(-1.2,-s*4,-s*3.5);this.sp.neck.kick(-.6,-s*1.5,-s*1.2);
  this.hitFlash=1;this.whiteFlash=Math.max(this.whiteFlash||0,.9);this.rootVel.z-=.45;this.bigEvent=true;
  this.setEmotion('dazed');this.shockT=2.4;this.dizzy=Math.max(this.dizzy||0,stage===1?2:3);this.dizzyT=stage===1?3:4.5;
  FX.word(stage===1?'우지끈!':'빠각!',c,{size:58,color:'#ffffff',force:true,dur:.8,dy:-30});
  if(this.onBigEvent)this.onBigEvent('head');
 },
 earOff(i,pt,n,dir,from){
  const m=this.earMeshes&&this.earMeshes[i];if(!m||!m.parent||m.userData.detached)return false;
  const F=this.face;F.updateWorldMatrix(true,true);const s=i?1:-1;
  const piece=new THREE.Group();piece.position.copy(m.getWorldPosition(V3()));piece.userData.detached=true;scene.add(piece);
  this._detachHeadMesh(m,piece);
  this.headLost[i?'earR':'earL']=true;
  // 귀 자리: 살이 찢긴 밑동(속살)과 피
  const baseL=V3(s*.183,.02,-.01),baseW=F.localToWorld(baseL.clone()),nW=V3(s,0,.15).normalize().transformDirection(F.matrixWorld).normalize();
  this.deform('crater',baseW.clone().addScaledVector(nW,.004),nW.clone().negate(),.03,.012,{soak:.6,jag:.4,only:[this.skull.userData.flesh]});
  const stub=mk(sphereGeo(14),this.M.cutTissue,F,{p:[baseL.x,baseL.y,baseL.z],s:[.006,.022,.03],cast:false});stub.userData.noHit=true;stub.userData.gore=true;stub.visible=PREF.blood;this.goreMeshes.push(stub);
  BLOOD.clearPlane('head',V3(s,0,0),Math.abs(baseL.x)+.004);
  BLOOD.addWound('head',baseW,nW,{rate:.03,tau:45,kind:'cut',spread:.015});BLOOD.spray(baseW,nW,22,{min:1.2,max:4,spread:1});
  const pr=BLOOD.project(baseW.clone().add(V3(0,-.03,0)),nW,.05);if(pr)BLOOD.startRiv(pr.seg||'head',pr.point,pr.normal,{w:.0045,maxLen:rnd(.2,.35)});
  // 날아가는 귀
  const d=pt.clone().sub(from);const push=(d.lengthSq()>1e-6?d.normalize():V3(s,0,0)).multiplyScalar(1.3).add(V3(s*.5,rnd(.9,1.4),rnd(.3,.7)));
  this.bits=this.bits||[];this.bits.push({obj:piece,body:true,v:push,w:V3(rnd(-10,10),rnd(-12,12),rnd(-10,10)),r:.02,bounce:.25,sound:'flake',corners:this.limbCorners(piece),ttl:rnd(7,9)});
  AUDIO.snip(1);AUDIO.squelch(.4);this.hitFlash=1;this.bigEvent=true;
  if(this.state==='stand')this.doAct('clutch',{side:this.handFor(baseW),seg:'head',lp:this.bones.head.worldToLocal(baseW.clone()),ln:nW.clone().transformDirection(_invB(this.bones.head)),dur:1.8,prio:2});
  this.voiceCool=0;AUDIO.voice('scream',1.1);this.voiceCool=G.time+.6;this.setEmotion('pain');this.shockT=1.5;
  FX.word('싹!',baseW,{size:50,color:'#ffffff',force:true,dx:s*40,dy:-24});
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 // 코를 두 번 가로질러 그으면 코끝이 잘려 나간다(평면: 콧날 아래쪽에서 앞으로 기운다. 인중·눈은 남는다)
 cutNose(pt,n,dir,la,lb){
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return false;F.updateWorldMatrix(true,false);
  const nL=V3(0,-.3,1).normalize();
  const mid=la.clone().lerp(lb,.5);
  // 평면이 지나는 점: 그은 높이를 코끝 높이(y -.02)로 옮겨 잡는다. 인중(앞으로 .242)은 남고 코끝(.29)만 떨어지게 z 범위를 묶는다
  const pL=rep?V3(0,-.047,clamp(mid.z-.3*(mid.y+.047),.197,.211)):V3(0,-.02,clamp(mid.z-.3*(mid.y+.02),.266,.284));
  const piece=this.sliceHead(nL,pL,{kind:'nose',dir:V3((lb.x-la.x)>0?1:-1,.3,1),speed:1.2});
  if(!piece)return false;
  this.headLost.nose=true;
  const cW=F.localToWorld(pL.clone()),nW=nL.clone().transformDirection(F.matrixWorld).normalize();
  BLOOD.addWound('head',cW,nW,{rate:.04,tau:50,kind:'cut',spread:.015});BLOOD.spray(cW,nW,26,{min:1.2,max:4,spread:1});
  const pr=BLOOD.project(cW.clone().add(V3(0,-.025,0)),nW,.05);if(pr)BLOOD.startRiv(pr.seg||'head',pr.point,pr.normal,{w:.0048,maxLen:rnd(.15,.3)});
  this.screenSplat(cW,.5);AUDIO.snip(1.1);AUDIO.spurt(.6);this.hitFlash=1;this.bigEvent=true;
  if(this.state==='stand')this.doAct('face',{side:this.handFor(cW),dur:1.6,prio:2});
  this.voiceCool=0;AUDIO.voice('scream',1.1);this.voiceCool=G.time+.6;this.setEmotion('pain');this.shockT=1.8;
  FX.word('싹!',cW,{size:50,color:'#ffffff',force:true,dy:-26});
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 // 코에 총 두 발: 코가 얼굴 안으로 뭉개져 들어간다
 smashNose(pt,n,dir){
  const F=this.headFrame(),rep=this.headKind==='rep';if(!F)return false;F.updateWorldMatrix(true,false);
  const tip=F.localToWorld(rep?V3(0,-.047,.211):V3(0,-.024,.252)),into=F.localToWorld(V3(0,0,.08)).sub(tip).normalize();
  const skull=rep?this.repSkull:this.skull;
  this.deform('crater',tip,into,rep?.04:.05,.07,{soak:.75,jag:.35,only:[skull.userData.flesh]});
  this.headLost.nose=true;
  if(!rep){this.noseBend=0;for(const nn of this.nostrils){nn.visible=false;}this.nostrils=[];
   BLOOD.clearDecalsNear('head',tip,.05,null);}
  const nW=into.clone().negate();
  BLOOD.addWound('head',tip.clone().addScaledVector(into,.03),nW,{rate:.045,tau:50,kind:'hole',spread:.012});
  BLOOD.spray(tip,nW,28,{min:1.2,max:4,spread:1});if(PREF.blood)CHUNKS.burst(tip,5,nW,.025,this.chunkKind({obj:skull,part:'head'}),{speed:1.3});
  this.screenSplat(tip,.7);AUDIO.skullCrush(.7);AUDIO.squelch(.6);this.hitFlash=1;this.bigEvent=true;
  this.setEmotion('shock');this.shockT=2;
  FX.word('콰직!',tip,{size:54,color:'#ffffff',force:true,dy:-28});
  if(this.onBigEvent)this.onBigEvent('head');
  return true;
 },
 // 빠진 눈 자리를 또 쏘면 안와가 뒤로 뚫린다
 blowSocket(i,pt,n,dir){
  const e=this.eyes[i];if(!e)return;e.eg.updateWorldMatrix(true,false);
  const c=e.eg.getWorldPosition(V3()),nW=V3(0,0,1).applyQuaternion(e.eg.getWorldQuaternion(_hdq1)).normalize(),into=nW.clone().negate();
  this.deform('crater',c.clone().addScaledVector(nW,-.01),into,.05,.05,{soak:.8,jag:.3,only:[this.skull.userData.flesh]});
  if(e.socket)e.socket.position.z-=.012;
  BLOOD.addWound('head',c,nW,{rate:.04,tau:50,kind:'hole'});BLOOD.spray(c,nW,22,{min:1.2,max:4,spread:1});
  if(PREF.blood)CHUNKS.burst(c,4,nW,.025,this.chunkKind({obj:this.skull,part:'head'}),{speed:1.3});
  AUDIO.squelch(.7);this.hitFlash=1;this.bigEvent=true;
  FX.word('푹!',c,{size:46,color:'#ffffff',force:true,dy:-24});
 },
 // 턱수염 가닥을 그으면 그 아래가 잘려 떨어진다
 cutBeard(h,pt,n,dir,from){
  if(!this.beard||this.jawGone)return false;
  let hit=null;for(const strand of this.beard)for(let k=0;k<strand.length;k++){const s=strand[k];for(let o=h.obj;o;o=o.parent){if(o===s.g){hit={strand,k};break;}}if(hit)break;}
  if(!hit)return false;const s=hit.strand[hit.k];if(!s.g.parent||s.g.userData.detached)return false;
  const piece=new THREE.Group();piece.position.copy(pt);piece.userData.detached=true;scene.add(piece);
  s.g.updateWorldMatrix(true,true);piece.attach(s.g);const removed=new Set();s.g.traverse(o=>{o.userData.detached=true;if(o.isMesh)removed.add(o);});this.parts=this.parts.filter(o=>!removed.has(o));
  const d=pt.clone().sub(from);const push=(d.lengthSq()>1e-6?d.normalize():V3(0,0,1)).multiplyScalar(.9).add(V3(rnd(-.3,.3),rnd(.4,.9),rnd(.4,.8)));
  this.bits=this.bits||[];this.bits.push({obj:piece,body:true,v:push,w:V3(rnd(-6,6),rnd(-8,8),rnd(-6,6)),r:.015,bounce:.15,sound:'flake',corners:this.limbCorners(piece),ttl:rnd(7,9)});
  AUDIO.snip(.7);this.bigEvent=true;
  FX.word('싹!',pt,{size:42,color:'#ffffff',force:true,dy:-20});
  return true;
 },
 /* ---- 매달린 것(튀어나온 눈알·늘어진 혀): 축에서 늘 아래로 처지고 머리가 흔들리면 늦게 따라온다 ---- */
 makeDangle(obj,parent,anchor,o={}){
  const piv=grp(parent,[anchor.x,anchor.y,anchor.z]);piv.userData.noHit=true;
  const len=o.len||.05,off=o.off?V3(o.off[0],o.off[1],o.off[2]):V3(0,-len,0);
  if(obj.parent!==piv){obj.removeFromParent();piv.add(obj);}
  obj.position.copy(off);obj.rotation.set(0,0,0);if(o.scale)obj.scale.set(o.scale[0],o.scale[1],o.scale[2]);
  obj.traverse(ob=>{ob.userData.noHit=true;});
  let cord=null;
  if(o.cord){
   // 줄(시신경): 축 뒤 고정점에서 매달린 것까지 비스듬히 잇는다
   const from=V3(0,0,o.cordFrom==null?0:o.cordFrom),dv=off.clone().sub(from),L=dv.length();
   cord=mk(cylGeo(o.cord,o.cord*1.25,L,8),this.M.nerve,piv,{cast:false});cord.position.copy(from).addScaledVector(dv,.5);cord.quaternion.setFromUnitVectors(V3(0,1,0),dv.normalize());cord.userData.noHit=true;
  }
  const d={piv,obj,cord,sx:new Spring(o.k||48,o.c||3.2),sz:new Spring(o.k||48,o.c||3.2),sway:o.sway||0,ph:rnd(0,TAU)};
  this.dangles=this.dangles||[];this.dangles.push(d);return d;
 },
 updateDangles(dt,time){
  const list=this.dangles;if(!list||!list.length)return;
  for(const d of list){const piv=d.piv,P=piv.parent;if(!P)continue;
   P.updateWorldMatrix(true,false);P.matrixWorld.decompose(_hdv1,_hdq1,_hdv2);_hdq1.invert();
   const dn=_hdv1.set(0,-1,0).applyQuaternion(_hdq1);
   d.sx.t=Math.atan2(-dn.z,-dn.y);d.sz.t=Math.atan2(dn.x,-dn.y);
   if(!d.sx.ready){d.sx.ready=1;d.sx.x=d.sx.t;d.sz.x=d.sz.t;}
   d.sx.step(dt);d.sz.step(dt);
   piv.rotation.set(d.sx.x+Math.sin(time*2.1+d.ph)*.06*d.sway,0,d.sz.x+Math.cos(time*1.7+d.ph)*.06*d.sway);
  }
 },
 /* ---- 눈알에 딸려 나가는 시신경: 안와와 날아가는 눈알 사이를 잇다가 끊어진다 ---- */
 addTether(bit,from,fromLocal,o={}){
  const tube=new DynTube(6,6,this.M.nerve,{cast:false});tube.mesh.userData.noHit=true;tube.mesh.userData.detached=true;tube.mesh.userData.gore=true;tube.mesh.visible=PREF.blood;scene.add(tube.mesh);
  this.tethers=this.tethers||[];this.tethers.push({bit,from,fromLocal:fromLocal.clone(),tube,t:0,life:o.life||.36,maxLen:o.maxLen||.17,pts:Array.from({length:6},()=>V3())});
 },
 updateTethers(dt){
  const list=this.tethers;if(!list||!list.length)return;
  for(let i=list.length-1;i>=0;i--){const T=list[i];T.t+=dt;
   let a=null,b=null;
   if(T.from.parent&&T.bit.obj.parent&&!T.bit.dead){T.from.updateWorldMatrix(true,false);T.bit.obj.updateWorldMatrix(true,false);a=T.from.localToWorld(T.fromLocal.clone());b=T.bit.obj.getWorldPosition(V3());}
   if(!a||T.t>=T.life||a.distanceTo(b)>T.maxLen){
    T.tube.mesh.removeFromParent();T.tube.geo.dispose();list.splice(i,1);
    if(a&&PREF.blood)BLOOD.spray(a,V3(0,.3,1),6,{max:2});
    continue;}
   const u=T.t/T.life,sag=.025*(1-u);
   for(let k=0;k<6;k++){const s=k/5;T.pts[k].lerpVectors(a,b,s);T.pts[k].y-=Math.sin(s*PI)*sag;}
   T.tube.update(T.pts,[.0046,.004,.0036,.0032,.003,.0027]);
  }
 },
});
/* ===== 6-5. 운명 설계자 — 맞았을 때 =====
 * 부위·무기·방향에 따라: 몸 반응(스프링·행동), 상처(멍·혹·베인 자국·총알 구멍·흐르는 피), 이빨·코·눈·면류관, 목소리.
 * 돌려주는 값: 버팀 게이지를 얼마나 깎을지(dmg), 크게 휘청였는지(heavy) */
const HEADS=/^(head|face|nose|mouth|chin|eyeL|eyeR|repEyeL|repEyeR|crown|beard)$/;
const HEAD_FLESH=/^(head|face|nose|mouth|chin|eyeL|eyeR|repEyeL|repEyeR)$/;
// 자르는 마디: 맞은 마디(뼈) → 거기서 고를 수 있는 자를 자리(가까운 쪽)
const CUT_CANDS={shoulder:['uarmMid'],uarmMid:['uarmMid'],elbow:['uarmMid','farmMid'],farmMid:['farmMid','wrist'],wrist:['wrist'],
 hip:['thighMid'],thighMid:['thighMid'],knee:['thighMid','shinMid'],shinMid:['shinMid','ankle'],ankle:['ankle']};
const ARM_BASES=new Set(['shoulder','uarmMid','elbow','farmMid','wrist']);
// 잘린 면 반지름(사람·도마뱀), 바깥 테 재질
const CUT_R={uarmMid:.1,farmMid:.1,wrist:.04,thighMid:.121,shinMid:.092,ankle:.086};
const CUT_R_LIZ={uarmMid:.05,farmMid:.043,wrist:.034,thighMid:.078,shinMid:.058,ankle:.055};
const CUT_OUTER={uarmMid:'robe',farmMid:'robe',wrist:'skin',thighMid:'trouser',shinMid:'trouser',ankle:'trouser'};
// 잘린 면 자리: 마디에서 몸 쪽 면은 아래로, 떨어진 쪽 면은 위로 이만큼(메시 끝에 맞춘다)
const CUT_OFF_BODY={thighMid:.003,shinMid:.003,ankle:.003};
const CUT_OFF_PIECE={wrist:.031,thighMid:.004,shinMid:.002,ankle:.051},CUT_OFF_PIECE_LIZ={wrist:.018,ankle:.02};
// 다시 자랄 때 만드는 뼈 줄(이름, 부모 기준 자리)
// 다시 자라는 시간표(초): 뼈는 마디마다 .13초 간격으로 .17초에 뻗고, 날살은 .32초부터 마디마다 .28초 간격으로 내려오며(.22초에 길이, .55초에 굵기),
// 비늘은 마지막 날살 마디 뒤 .2초부터 마디마다 .2초 간격으로 .3초에 덮는다. 손·발은 각 단계의 끝에 붙는다. 깨어남 .45초
const REGROW={boneStep:.13,boneDur:.17,boneHandDur:.22,rawStart:.32,rawStep:.28,rawLen:.22,rawThick:.55,rawHandDur:.4,scLag:.2,scStep:.2,scDur:.3,scHandDur:.35,wakeDur:.45};
// 마디 수 n(손·발 제외)에 따른 시간표. 다리는 12% 느리다. 손·발은 각 단계의 마지막 마디 뒤에 붙는다
function regrowTimeline(n,arm){
 const RG=REGROW,kk=arm?1:1.12,T={bone:[],raw:[],sc:[]};
 for(let j=0;j<n;j++){T.bone[j]=j*RG.boneStep*kk;T.raw[j]=(RG.rawStart+j*RG.rawStep)*kk;}
 T.boneHand=((n-1)*RG.boneStep+RG.boneDur)*kk;T.rawHand=(RG.rawStart+n*RG.rawStep)*kk;
 const scStart=RG.rawStart+n*RG.rawStep+RG.scLag;for(let j=0;j<n;j++)T.sc[j]=(scStart+j*RG.scStep)*kk;
 T.scHand=(scStart+n*RG.scStep)*kk;T.wake=T.scHand+RG.scHandDur*kk;T.dur=T.wake+RG.wakeDur*kk;
 return T;
}
const ARM_CHAIN=[['uarmMid',[0,-.118,0]],['elbow',[0,-.117,0]],['farmMid',[0,-.108,0]],['wrist',[0,-.107,0]]];
const LEG_CHAIN=[['thighMid',[0,-.145,0]],['knee',[0,-.145,0]],['shinMid',[0,-.128,0]],['ankle',[0,-.127,0]]];
// 도마뱀 팔다리 굵기: 마디 공(ball), 원기둥(위 r0·아래 r1·길이·가운데 c), 돌기 수
const LIZ_DIM={
 uarmMid:{r0:.05,r1:.047,len:.127,c:-.0635,spikes:1},elbow:{ball:[.05,.048,.05],r0:.047,r1:.043,len:.113,c:-.0515,spikes:1},farmMid:{r0:.043,r1:.038,len:.137,c:-.0685,spikes:2},wrist:{},
 thighMid:{r0:.078,r1:.07,len:.15,c:-.072,spikes:1},knee:{ball:[.07,.06,.072],r0:.064,r1:.058,len:.13,c:-.064,spikes:1},shinMid:{r0:.058,r1:.052,len:.13,c:-.064,spikes:1},ankle:{}};
Object.assign(Emperor.prototype,{
 takeHit(h){
  const tool=h.tool,kind=h.kind,part=h.part,pt=h.point,n=h.normal,dir=h.dir;
  const blunt=tool==='hand',sharp=tool==='knife',gun=tool==='gun';
  const P=h.power;this.bigEvent=false;
  this.sinceHit=0;this.hitFlash=Math.min(1,(this.hitFlash||0)+(gun?.75:kind==='slash'?.3:.6));
  this.whiteFlash=Math.max(this.whiteFlash||0,kind==='slash'?.35:gun?.85:1);
  const isHead=HEADS.test(part),seg=h.obj&&h.obj.userData.seg||(isHead?'head':'chest');
  const down=this.state!=='stand';
  const out={dmg:0,heavy:false,blocked:false,first:false,big:false,part,isHead};
  // 첫 대: 돈다발을 떨어뜨리고 놀란다
  if(this.taunt){if(G.opening){G.opening=false;clearTalk();}this.taunt=false;out.first=true;if(this.tabletHeld)this.dropTablet(V3(dir.x*1.5+rnd(-.4,.4),1.1,dir.z*.6+1.2));this.setPhase(1);this.setEmotion('shock');this.shockT=.7;AUDIO.gasp(1.2);
   if(this.act&&this.act.name==='laugh')this.endAct();} // 웃다가 맞으면 웃음이 뚝 끊긴다
  if(part==='tablet'){if(this.tabletHeld)this.dropTablet(V3(dir.x*3,1.4,1.5));out.dmg=.05;return out;}
  // 후광: 깡 하고 흔들리며 금이 간다(몸은 거의 안 다친다)
  if(part==='halo'){const counted=this.haloHit(h);if(counted&&!down){this.doFlinch('shock',.8);this.sp.head.kick(-1.2,dir.x*2,0);}out.halo=true;out.dmg=counted?.04:0;out.vis=counted?.6:0;return out;}
  if(part==='crown'&&(sharp||gun)){this.kickBody('head',dir,P*.6,kind);if(gun)this.knockCrown(dir);else{this.crownTilt=(this.crownTilt||0)+.35;if(this.crownTilt>1.15)this.knockCrown(dir);else AUDIO.crown(.8);}this.doFlinch('shock',1);AUDIO.voice('gasp',1);out.dmg=.08;return out;}
  // 막기
  // 손으로 막기: 너클·칼만 막힌다(총알은 손을 뚫는다)
  const blocked=!gun&&this.guard>.5&&/^(arm|hand)/.test(part)&&!down;
  if(blocked){out.blocked=true;this.guardHP-=gun?2:sharp?1.4:1;this.kickBody(part,dir,P*.8,kind,pt);
   if(this.guardHP<=0){this.guardHold=0;this.guardCool=4.5;this.guardHP=3;for(const s of ['L','R'])this.sp[s].kick(-6,0,(s==='L'?-1:1)*5);this.rootVel.z-=.8;this.doFlinch('shock',1);AUDIO.voice('yelp',1);out.heavy=true;}
   else{this.doFlinch('grunt',.8);if(Math.random()<.5)AUDIO.voice('grunt',.6);}
   if(sharp||gun){this.makeWound(seg,pt,n,dir,tool,kind,h,true);}
   out.dmg=(tool==='hand'?.09:.14);out.vis=2;return out;}
  // 몸 반응
  const kickP=P*(down?.55:1)*(blunt?1:sharp?(kind==='stab'?1.05:.6):.85);
  this.kickBody(part,dir,kickP,kind,pt);
  if(isHead){this.haloJolt(dir,kickP);this.repAfterHit(blunt?kind!=='jab':true);}
  // 허둥댐: 맞을 때마다 차오른다(머리를 맞으면 더). 손사래 방향은 매번 조금씩 다르게
  this.panic=Math.min(1.3,this.panic*.5+(isHead?.8:.6)*Math.min(P,1.6)*(down?.7:1)*(kind==='slash'?.6:1));
  // 눈물: 2단계부터는 세게 맞을 때마다 눈에서 눈물이 튄다
  if(isHead&&!gun&&this.phase>=2&&!down)this.tearSplash(kind==='jab'?2:4);
  // 얼굴 표정·목소리(머리를 맞으면 아픈 얼굴이 조금 더 오래 간다)
  if(isHead){this.doFlinch('pain',1.3);}else if(part==='belly'){this.doFlinch(blunt?'oof':'pain',1.15);}else this.doFlinch(gun?'shock':'grunt',.9);
  this.voiceHit(tool,part,P,gun||sharp);
  // 부위별
  if(blunt)this.bluntHit(part,seg,pt,n,dir,tool,kind,P,h);
  else this.makeWound(seg,pt,n,dir,tool,kind,h,false);
  // 눈에 보이는 살 변형(움푹·파임·베임): 맞을수록 누적
  if(!/^(crown|halo|tablet|beard)$/.test(part)&&!((part==='eyeL'||part==='eyeR')&&this.eyes[part==='eyeL'?0:1]&&this.eyes[part==='eyeL'?0:1].lizard))
   this.applyDeform(part,seg,pt,n,dir,tool,kind,h);
  // A punch or stomp squeezes coins out through the mouth, even with an intact belly.
  if(part==='belly'&&blunt)this.vomitCoins(Math.round(9+Math.min(P,2)*5),P);
  // 갈라진 배(돼지저금통)를 치면 동전이 또 쏟아진다
  if(part==='belly'&&this.abdomenOpen&&kind!=='slash'&&this.nearSlit(pt,.17))this.coinBurst(gun?10:sharp?14:6,gun?1.2:sharp?1.3:.8);
  // 총 맞는 반응(부위별)
  if(gun&&!down)this.gunReact(part,seg,pt,n,dir);
  if(gun&&HEAD_FLESH.test(part)&&this.headKind!=='rep')this.progressHeadGun(part,seg,pt,n,dir);
  if(this.headKind!=='rep'&&(part==='eyeL'||part==='eyeR')&&!gun){
   const i=part==='eyeL'?0:1,add=tool==='knife'?(kind==='stab'?2:.8):blunt?(kind==='jab'?.45:.75):0;
   if(add&&!this.eyes[i].ejected){this.eyeGunHits[i]=(this.eyeGunHits[i]||0)+add;if(this.eyeGunHits[i]>=2)this.ejectEye(i,n,dir);}
  }
  if(this.headKind==='rep'&&(part==='repEyeL'||part==='repEyeR')){
   const i=part==='repEyeL'?0:1;
   const add=gun?1:tool==='knife'?(kind==='stab'?2:.8):blunt?(kind==='jab'?.45:.75):0;
   if(add){this.repEyeHits[i]=(this.repEyeHits[i]||0)+add;if(this.repEyeHits[i]>=2)this.ejectRepEye(i,n,dir);}
  }
  /* 머리: 어디를 무엇으로 몇 번 맞았는지에 따라 그 자리가 망가진다(정수리·옆머리·턱·코·귀·눈·목).
   * 머리가 목에서 통째로 떨어지는 건 칼로 목을 가로질러 세 번 그었을 때뿐이다 */
  if(!this.headGone){
   if(HEAD_FLESH.test(part)||part==='beard'){
    const region=this.headRegionAt(h);
    if(gun){this.headChunks(1,pt,n,dir);this.gunHead(region,pt,n,dir,h);}
    else if(sharp){if(kind==='slash')this.headChunks(.6,pt,n,dir);this.knifeHead(region,h,kind,pt,n,dir);}
   }
   if(part==='neck'&&sharp)this.neckKnife(h,kind,pt,n,dir);
  }
  if(sharp&&!down&&(kind==='stab')&&!/^(arm|hand)/.test(part)&&Math.random()<.85){const side=this.handFor(pt);this.doAct('clutch',{side,seg,lp:this.bones[seg].worldToLocal(pt.clone()),ln:n.clone().transformDirection(_invB(this.bones[seg])),dur:1.4,prio:1});}
  // 막기 시작(두 번째 다운 이후, 얼굴을 연달아 맞으면)
  // 목(턱 밑 띠)을 긋는 칼질은 세지 않는다. 막는 주먹이 턱 앞에 올라와 남은 목을 가렸다. 동맥이 터진 뒤(목 두 번)에는 막지 않는다
  const throat=part==='neck'||(HEAD_FLESH.test(part)&&this.inThroat(this.headLocal(pt))),neckOpen=this.neckCut&&this.neckCut.hits>=2;
  if(isHead&&!throat&&!neckOpen&&!this.headDestroyed&&!down&&this.phase>=2&&this.guardCool<=0&&!gun){const now=G.time;this.hitsRecent=this.hitsRecent.filter(t=>now-t<1.2);this.hitsRecent.push(now);if(this.hitsRecent.length>=3&&Math.random()<.35+this.phase*.06){this.guardHold=rnd(1,1.8);this.guardHP=2+this.phase;this.guardCool=rnd(3,5);this.hitsRecent.length=0;if(this.act&&this.act.prio<2)this.endAct();}}
  // 크게 휘청
  out.heavy=kind==='hook'||kind==='upper'||gun||kind==='stab';
  out.big=this.bigEvent;this.bigEvent=false;
  // 게이지가 한 대에 눈에 띄게 줄어드는 양(실제로 깎이는 양은 진행 시간표가 정한다)
  out.vis=({jab:2.2,hook:3.4,upper:3.8,stab:3.6,slash:1,shot:isHead?4:3})[kind]||2;if(down)out.vis*=.5;if(out.big)out.vis+=2;
  // 게이지 피해
  const base=blunt?(out.heavy?.55:.40):sharp?(kind==='slash'?.44:.54):.44;
  const grounded=down?(blunt?.83:.50):1;
  out.dmg=base*(isHead?1.15:1)*grounded;
  return out;
 },
 handFor(pt){
 const l=this.root.worldToLocal(pt.clone());let side=l.x<0?'L':'R',other=side==='L'?'R':'L';if(!this.armUsable(side)||(this.armHurt[side==='L'?0:1]>.5&&this.armUsable(other)))side=other;return side;
},
 voiceHit(tool,part,P,cut){
  const now=G.time;if(now<(this.voiceCool||0))return;
  if(deityHasReptileVoice(this)){
   AUDIO.voice('reptile',clamp(P*.65,.5,1.1));this.voiceCool=now+.42;
   if(this.repFork&&this.repFork.k<0&&Math.random()<.3)this.repFork.k=0;return;
  }
  if(this.headDestroyed)return;
  if(this.state==='dead'){if(Math.random()<.35){AUDIO.voice('groan',.45);this.voiceCool=now+.9;}return;}
  let name;
  if(part==='belly')name=Math.random()<.78?'oof':'cough';
  else if(part==='neck'||part==='chest')name=Math.random()<.55?'gasp':'oof';
  else if(cut||P>1.6)name=Math.random()<.72?'yelp':'scream';
  else name=Math.random()<.82?'grunt':'yelp';
  AUDIO.voice(name,clamp(P*.67,.5,1.2));this.voiceCool=now+(name==='scream'?.35:name==='cough'?.33:.19);
 },
 // 날아간 살점의 겉 색: 살·옷·배·바지·도마뱀
 chunkKind(h){
  if(this.unmasked&&HEADS.test(h.part))return 'liz';
  const m=h.obj&&h.obj.material,k=m&&m.userData&&m.userData.fleshKind;
  if(k==='liz')return 'liz';if(k==='trouser')return 'trouser';if(k==='skin')return 'skin';
  if(h.part==='belly')return 'belly';
  return 'cloth';
 },
 /* 눈에 보이는 살 변형: 주먹은 움푹(dent), 총은 파임(crater), 칼긋기는 베임(groove).
  * 맞을 때마다 꼭짓점이 실제로 옮겨져 되돌아오지 않는다 → 누적될수록 확실히 함몰·파임. */
 applyDeform(part,seg,pt,n,dir,tool,kind,h){
  if(!this.fleshList||!PREF.deform)return;
  let target=h.obj&&h.obj.userData.flesh;
  // 눈·입처럼 살 위에 따로 얹힌 부품은 바로 아래의 활성 머리 살 한 조각만 움직인다.
  if(!target&&HEAD_FLESH.test(part)){
   const jaw=this.headKind==='rep'?this.repJawBone:this.jaw;let lower=false;
   for(let o=h.obj;o&&jaw;o=o.parent)if(o===jaw){lower=true;break;}
   const surface=this.headKind==='rep'?(lower?this.repJaw:this.repSkull):(lower?this.chin:this.skull);
   target=surface&&surface.userData.flesh;
  }
  const only=target&&target.mesh.parent&&!target.mesh.userData.detached?[target]:[];
  const into=dir.clone().normalize(),headF=HEAD_FLESH.test(part),limb=/^(arm|hand|thigh|shin|wrist|ankle)/.test(part);
  if(tool==='hand'){
   const heavy=kind==='hook'||kind==='upper';let R,depth;
   if(part==='belly'){R=.11;depth=heavy?.055:.032;}
   else if(part==='chest'){R=.09;depth=heavy?.03:.018;}
   else if(headF){R=part==='nose'?.03:.052;depth=kind==='jab'?.009:kind==='hook'?.013:.016;}
   else{R=.055;depth=heavy?.016:.01;}
   // 영구 함몰은 남기되, 타격 뒤 0.9초간 매 프레임 메시를 다시 쓰던 표면 jiggle은 끈다.
   this.deform('dent',pt,into,R,depth,{bruise:heavy?.55:.34,rim:.3,only});
  }else if(tool==='gun'){
   const R=headF?.022:limb?.022:.028,depth=headF?.03:.038;
   this.deform('crater',pt,into,R,depth,{soak:.55,jag:.32,only});
   if(PREF.blood)CHUNKS.burst(pt.clone().addScaledVector(n,.008),2+(Math.random()*3|0),n,headF?.02:.028,this.chunkKind(h),{speed:1.2,back:into});
   this._gunLine(seg,pt,n,into,h,target);
  }else if(tool==='knife'){
   if(kind==='slash'&&h.slashPath&&h.slashPath.length>=2&&this.limbOf(part))this.limbGroove(h.slashPath,into);
   else if(kind==='slash'&&h.slashFrom)this.deform('groove',pt,into,headF?.0085:.0075,.013,{bW:h.slashFrom,soak:.4,only});
   else this.deform('crater',pt,into,.012,.045,{soak:.45,jag:.2,only});
  }
 },
 // 팔다리를 가로지른 칼집: 칼이 지나간 겉면 점들을 2.5cm 남짓씩 이어 그 살에 홈을 판다(몸통이 10cm마다 끊어 긋는 것과 같은 방식).
 // 들어간 점→나온 점 한 줄로 파면 그 줄이 팔다리 속을 지나 겉면에는 아무 홈도 안 생긴다
 limbGroove(P,into){
  let s=P[0];
  for(let i=1;i<P.length;i++){
   const q=P[i];
   if(q.obj!==s.obj){s=q;continue;}
   if(i<P.length-1&&s.point.distanceTo(q.point)<.025)continue;
   const f=q.obj&&q.obj.userData.flesh;
   if(f&&s.point.distanceToSquared(q.point)>1e-8)this.deform('groove',q.point,into,.0075,.013,{bW:s.point,soak:.4,only:[f]});
   s=q;
  }
 },
 // 총을 선을 긋듯 여러 발 쏘면 구멍 사이가 칼로 썬 듯 뜯겨 나간다
 _gunLine(seg,pt,n,into,h,target){
  const last=this._lastGun;this._lastGun={seg,target,p:pt.clone(),t:G.time};
  if(!target||!last||last.seg!==seg||last.target!==target||G.time-last.t>1.6)return;
  const d=last.p.distanceTo(pt);if(d<=.02||d>=.11)return;
  this.deform('groove',pt,into,.012,.03,{bW:last.p,soak:.6,jag:.4,only:[target]});
  const mid=V3().addVectors(last.p,pt).multiplyScalar(.5);
  if(PREF.blood)CHUNKS.burst(mid,2+(Math.random()*3|0),n,.026,this.chunkKind(h),{speed:1.1,back:into});
  AUDIO.rip(.55);this.bigEvent=true;FX.word(pick(['쭈욱!','뜯겨!','촤악!']),mid,{size:46,color:'#b6e07a',dx:rnd(-60,60),dy:-20});
 },
 /* 너클: 마디 자국·멍·혹·찢어짐·코피·이빨·눈 붓기·면류관 */
 bluntHit(part,seg,pt,n,dir,tool,kind,P,h){
  const heavy=kind==='hook'||kind==='upper';
  this.hitCount=(this.hitCount||0)+1;
  const face=HEADS.test(part)&&part!=='crown'&&part!=='beard';
  // 타격 방향을 따라 붉은 멍이 번진다.
  if(part!=='crown'&&part!=='beard'){
   const ang=kind==='hook'?PI/2+rnd(-.25,.25):kind==='upper'?rnd(-.5,.5):rnd(-.2,.2),hitMeshes=this.flow&&this.flow[seg]&&this.flow[seg].length?this.flow[seg]:null;
   BLOOD.decal('knuckle',seg,pt,n,face?.034:.046,{aspect:1.15,angle:ang,grid:4,meshes:hitMeshes});
   if(Math.random()<(heavy?.7:.35))BLOOD.decal('bruise',seg,pt,n,face?(heavy?.05:.04):.065,{grid:3,meshes:hitMeshes});
  }
  // 재생된 머리에는 옛 인간 얼굴·치아·코 좌표를 적용하지 않는다.
  if(this.headKind==='rep'&&HEADS.test(part)){if(face)BLOOD.spray(pt,V3(dir.x*.6+rnd(-.2,.2),.35,.55).normalize(),heavy?12:7,{kind:'blood',max:heavy?3.2:2.4,smax:.0085});if(!this.headGone&&HEAD_FLESH.test(part))this.bluntHead(this.headRegionAt(h),kind,pt,n,dir,P,h);return;}
  if(HEADS.test(part)){
   if(!this.headGone&&HEAD_FLESH.test(part))this.bluntHead(this.headRegionAt(h),kind,pt,n,dir,P,h);
   const fy=this.face.getWorldPosition(_bv5).y;
   if(face){
    this.faceHits++;
    const lumpOK=part==='head'||(part==='face'&&pt.y>fy-.01);
    if(lumpOK&&(heavy||this.faceHits%4===0))BLOOD.lump(seg,pt,n,heavy?.02:.015,heavy?1:0);
    // 너클은 살을 찢는다: 여러 대 맞으면 맞은 자리가 터져 피가 흐른다
    if(this.faceHits>3&&this.faceCuts<4&&Math.random()<(heavy?.4:.15)){
     this.faceCuts++;BLOOD.decal(this.unmasked?'cut':'cutSkin',seg,pt,n,.011,{aspect:rnd(2.2,3.2),angle:rnd(0,PI),grid:6});
     BLOOD.addWound(seg,pt,n,{rate:.0055,tau:45,kind:'cut'});BLOOD.spray(pt,n,12,{max:2.8,smax:.008});
    }
   }
   if(part==='nose'){this.noseHits=(this.noseHits||0)+(heavy?2:1);
    if(this.noseHits>=2&&!this.noseBleeding){this.noseBleeding=true;for(const nn of this.nostrils){nn.updateWorldMatrix(true,false);BLOOD.addWound('head',nn.getWorldPosition(V3()),V3(0,-.4,1).normalize(),{rate:.0042,tau:60,kind:'nose'});}}
    if(this.noseHits>=(heavy?3:5)&&Math.abs(this.noseBend)<.3){this.noseBend=(dir.x>0?1:-1)*rnd(.22,.34);AUDIO.crack(1.2);BLOOD.spray(pt,n,16,{max:2.4,smax:.008});this.bigEvent=true;FX.word('우직!',pt,{size:52,color:'#ffffff',force:true,dy:-30});}
   }
   if(part==='mouth'||part==='chin'){
    const ch=kind==='upper'?.38:kind==='hook'?.26:.12;
    if(Math.random()<ch)this.knockTooth(dir);
    if(!this.lipSplit&&(heavy||this.hitCount>4)){this.lipSplit=true;const c=this.face.localToWorld(V3(rnd(-.04,.04),-.105,.205));BLOOD.addWound('head',c,V3(0,-.2,1).normalize(),{rate:.0035,tau:50,kind:'lip'});}
   }
   if(part==='eyeL'||part==='eyeR'||(part==='face'&&pt.y>fy-.02)){
    const i=part==='eyeL'?0:part==='eyeR'?1:(this.face.worldToLocal(pt.clone()).x<0?0:1);
    this.swellU[i]=Math.min(1,this.swellU[i]+(heavy?.3:.14));
    if(this.swellU[i]>.45&&!this['blackEye'+i]&&!this.headDestroyed&&!this.eyes[i].ejected){this['blackEye'+i]=true;const e=this.eyes[i];e.eg.updateWorldMatrix(true,false);BLOOD.decal('bruise','head',e.eg.getWorldPosition(V3()).add(V3(0,-.01,.03)),V3(e.s*.3,0,1).normalize(),.065,{force:true,pin:true});}
   }
   if(part==='head'&&pt.y>fy+.08&&heavy&&!this.browCut&&Math.random()<.5){this.browCut=true;BLOOD.addWound('head',pt,n,{rate:.0045,tau:45,kind:'brow'});}
   if((part==='crown'||HEAD_FLESH.test(part))&&this.crownOn!==false){this.crownTilt=(this.crownTilt||0)+(part==='crown'?.45:.15)*P*(kind==='upper'?1.6:1);if(this.crownTilt>1.15||(heavy&&part==='crown'&&Math.random()<.5))this.knockCrown(dir);else AUDIO.crown(.5);}
   // 맞을 때마다 침이나 피가 튄다(코피·입술·찢어진 데가 있으면 피)
   if(face){const wet=this.noseBleeding||this.lipSplit||this.faceCuts>0;
    BLOOD.spray(pt,V3(dir.x*.6+rnd(-.2,.2),.35,.55).normalize(),wet?(heavy?18:10):(heavy?9:5),{kind:wet?'blood':'spit',max:heavy?3.2:2.4,smax:wet?.0085:.005});}
  }else{
   if(part==='belly'||part==='chest')BLOOD.spray(pt,n,heavy?8:4,{kind:'dust',max:1.2});
   if(/^(arm|hand)/.test(part)&&Math.random()<(heavy?.5:.2)){const side=part.endsWith('L')?'L':'R';this.doAct('shake',{side,dur:.9,prio:1});}
  }
 },

 /* ===== 배: 돼지저금통 =====
  * 칼로 배를 그으면 1번째에 옷이 갈라지고(동전 하나가 툭), 2번째에 틈이 벌어져 안에 금화가 비치며 몇 개 흘러나오고,
  * 3번째에 금화·엽전이 와르르 쏟아진다. 어디를 그어도 처음 갈라진 자리가 벌어진다.
  * 벌어진 뒤에는 그 틈을 긋거나 찌르거나 쏘거나 때릴 때마다 또 쏟아진다. */
progressAbdomenCut(aW,bW,nW,angle,strokeId,len){
 const bone=this.bones.spine;if(!bone)return null;
 const ab=this.abd||(this.abd={hits:0,last:null,z:null});
 const sid=strokeId==null?'abd-'+(++this.cutStrokeFallback):strokeId;
 // 첫 칼이 배를 가로지르는 동안에는 갈라질 자리를 그 칼자국 전체(처음~지금)로 넓힌다
 if(ab.last===sid){if(ab.zStroke===sid&&ab.z&&!this.abdomenOpen)this.setSlit(ab.z,ab.a0,bW,nW);return ab.z;}
 ab.last=sid;
 const mid=V3().addVectors(aW,bW).multiplyScalar(.5),pr=BLOOD.project(mid,nW,.18,[this.belly]);
 const pW=pr?pr.point:bW.clone(),hitN=pr?pr.normal:nW;
 // 벌어진 뒤 세 번째 칼에 와르르, 그다음부터는 틈 가까이를 그을 때마다 또 쏟아진다
 if(this.abdomenOpen){const z=ab.z;if(z.stage<3){ab.hits=3;z.stage=3;this.abdomenStage=3;this.advanceAbdomenCut(z);}else if(this.nearSlit(pW,.17))this.coinBurst(12+(Math.random()*7|0),1);return z;}
 ab.hits++;
 if(!ab.z){ab.z={lp:V3(),ln:V3(),lt:V3(),angle,len:.06,stage:0};ab.zStroke=sid;ab.a0=aW.clone();this.setSlit(ab.z,aW,bW,nW);}
 const z=ab.z;z.len=Math.max(z.len,clamp(len||.06,.06,.14));
 const next=Math.min(3,ab.hits);
 if(next>z.stage){z.stage=next;this.abdomenStage=next;this.advanceAbdomenCut(z);}
 return z;
},
// 갈라질 자리: 두 점 사이 가운데를 배 위에 놓고, 그 방향·길이를 기억한다(배 뼈 좌표)
setSlit(z,aW,bW,nW){
 const bone=this.bones.spine;bone.updateWorldMatrix(true,false);
 const mid=V3().addVectors(aW,bW).multiplyScalar(.5),pr=BLOOD.project(mid,nW,.18,[this.belly]);
 const pW=pr?pr.point:mid,hitN=pr?pr.normal:nW,inv=_invB(bone);
 z.lp.copy(bone.worldToLocal(pW.clone()));z.ln.copy(hitN).transformDirection(inv).normalize();
 const lt=V3().subVectors(bW,aW).transformDirection(inv);lt.addScaledVector(z.ln,-lt.dot(z.ln));if(lt.lengthSq()<1e-8)lt.crossVectors(z.ln,V3(0,1,0));z.lt.copy(lt.normalize());
 z.angle=this.angleOnSurface(aW,bW,hitN);z.len=clamp(aW.distanceTo(bW),.06,.16);
},
slitPoint(){
 const z=this.abd&&this.abd.z;if(!z)return null;
 if(z.hostLP){this.belly.updateWorldMatrix(true,false);const p=this.belly.localToWorld(z.hostLP.clone()),n=z.hostLN.clone().applyMatrix3(_abdN.getNormalMatrix(this.belly.matrixWorld)).normalize();return {p,n};}
 const bone=this.bones.spine;bone.updateWorldMatrix(true,false);
 return {p:z.lp.clone().applyMatrix4(bone.matrixWorld),n:z.ln.clone().transformDirection(bone.matrixWorld).normalize()};
},
nearSlit(pW,r){const s=this.slitPoint();return !!s&&s.p.distanceTo(pW)<r;},
advanceAbdomenCut(z){
 const s=this.slitPoint(),p=s.p,n=s.n;
 if(z.stage===1){
  const w=.026;
  BLOOD.decal('soak','spine',p,n,.1,{grow:.8,force:true});
  BLOOD.decal('cut','spine',p,n,w,{aspect:clamp(z.len/w,3,5.4),angle:z.angle,grid:9});
  BLOOD.addWound('spine',p,n,{rate:.018,tau:40,kind:'cut'});
  BLOOD.spray(p,n,10,{min:1,max:2.8,spread:.75});
  // 갈라진 틈으로 동전 하나가 툭
  COINS.spawn(p.clone().addScaledVector(n,.03),n.clone().multiplyScalar(rnd(.7,1.1)).add(V3(rnd(-.3,.3),rnd(.5,1),0)),Math.random()<.5?0:1);
  AUDIO.coin(1);this.hitFlash=1;
 }else if(z.stage===2){
  this.makeAbdomenCavity(z);
 }else if(z.stage===3){
  this.coinBurst(44,1.7);
 }
},
// 틈에서 동전이 쏟아진다(한꺼번에가 아니라 짧은 동안 줄줄이)
coinBurst(n,power=1){
 if(!this.abdomenCavity)return;const now=G.time;if(now<(this.coinCool||0)&&power<1.5)return;this.coinCool=now+.22;
 this.coinQ=(this.coinQ||0)+n;this.coinPow=Math.max(this.coinPow||0,power);
 AUDIO.coinGush(clamp(n/28,.45,1.5));this.sp.belly.kick(-.8*power,.6*power,-1.2*power);
 const s=this.slitPoint();
 if(power>=1.5){this.bigEvent=true;this.hitFlash=1;FX.word('와르르!',s.p,{size:62,color:'#ffd84a',force:true,dur:.7});if(this.state==='stand'){this.setEmotion('shock');this.shockT=1.3;this.voiceCool=0;AUDIO.voice('scream',1.2);this.voiceCool=G.time+1.1;}}
 else if(Math.random()<.5)FX.word('짤랑!',s.p,{size:40,color:'#ffe066',dx:rnd(-60,60)});
},
makeAbdomenCavity(z){
 if(this.abdomenCavity)return this.abdomenCavity;
 const bone=this.bones.spine;bone.updateWorldMatrix(true,false);
 const approx=z.lp.clone().applyMatrix4(bone.matrixWorld);
 this.belly.updateWorldMatrix(true,false);
 z.hostLP=this.belly.worldToLocal(approx.clone());z.hostLN=z.ln.clone().normalize();
 const p=this.belly.localToWorld(z.hostLP.clone());
 const n=z.hostLN.clone().applyMatrix3(_abdN.getNormalMatrix(this.belly.matrixWorld)).normalize();
 BLOOD.clearDecalsNear('spine',p,.16,null);BLOOD.fadeSeg('spine');
 BLOOD.decal('soak','spine',p,n,.13,{grow:.7,force:true});
 const g=grp(bone,null,'abdomenCavity');
 const tW=z.lt.clone().transformDirection(bone.matrixWorld).normalize();
 z.hostLT=tW.transformDirection(_invB(this.belly)).normalize();
 this.abdomenCavity=g;this.placeAbdomenCavity(z);
 const rx=clamp(z.len*.7,.09,.13),ry=.062;
 g.updateWorldMatrix(true,false);
 const onSkin=(q,lift=.002)=>{
  g.updateWorldMatrix(true,false);const faceN=V3(0,0,1).transformDirection(g.matrixWorld).normalize();
  const guess=g.localToWorld(q.clone()),hit=BLOOD.project(guess,faceN,.12,[this.belly]);
  if(!hit)return {p:q.clone(),n:V3(0,0,1)};
  const p=g.worldToLocal(hit.point.clone().addScaledVector(hit.normal,lift));
  const n=hit.normal.clone().transformDirection(_invB(g)).normalize();return {p,n};
 };
 // 벌어진 틈: 속은 어둡고(금화가 잔뜩 차 있다) 가장자리로 갈수록 짙은 금갈색
 const rings=5,sides=36,pitPos=[],pitCol=[],pitIdx=[],edge=col('#4a3410'),deep=col('#0e0904');
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
 const pit=mk(pitGeo,this.M.cavity,g,{cast:false,receive:false});pit.renderOrder=4;pit.userData.noHit=true;
 // 찢어진 옷 가장자리(말려 나온 천)
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
  const m=mk(geo,this.M.slitLip,g,{cast:false,receive:false});m.renderOrder=5;m.userData.noHit=true;
 }
 // 틈 속에 금화·엽전이 빽빽이 차 있다(몇 닢은 입술 밖으로 비어져 나온다)
 for(let k=0;k<30;k++){
  const out=k>=26,a=out?(k%2?rnd(-.5,.5):PI+rnd(-.5,.5)):rnd(0,TAU),r=out?rnd(.85,1):Math.sqrt(Math.random())*.86,q=onSkin(V3(Math.cos(a)*rx*r,Math.sin(a)*ry*r*.82,0),.0035+Math.random()*.004);
  const c=COINS.make(k%3===2?1:0,g);c.position.copy(q.p);c.quaternion.setFromUnitVectors(UP,q.n);c.rotateX(rnd(-.8,.8));c.rotateZ(rnd(-.8,.8));c.scale.setScalar(rnd(.85,1.15));c.renderOrder=6;
 }
 z.abdomenSkinPoint=onSkin;
 this.abdomenOpen=true;
 // 갈라진 자리 위의 넥타이는 잘려 떨어진다
 if(this.tie&&!this.tie.userData.detached&&Math.abs(z.hostLP.x)<.45&&z.hostLP.y>.02)this.cutTie();
 BLOOD.addWound('spine',p,n,{rate:.014,tau:50,kind:'cut',spread:.03});
 BLOOD.spray(p,n,12,{min:1.2,max:3.2,spread:1.05});
 this.coinQ=(this.coinQ||0)+5;this.coinPow=.8;
 AUDIO.rip(1);AUDIO.coinGush(.55);this.hitFlash=1;this.bigEvent=true;
 if(this.state==='stand'){this.setEmotion('shock');this.shockT=1.2;this.voiceCool=0;AUDIO.voice('scream',1.2);this.voiceCool=G.time+1;}
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
// Mouth emission follows the current human/reptile head transform, including falls.
vomitCoins(n,power=1){
 if(this.headGone||this.headDestroyed||this.jawGone||this.state==='dead'||!this.headFrame())return;
 if(G.time<this.mouthCoinCool)return;
 this.mouthCoinCool=G.time+.16;
 if(!this.mouthCoinQ){this.mouthCoinAcc=0;this.mouthCoinDelay=.055;}
 this.mouthCoinQ=Math.min(38,(this.mouthCoinQ||0)+n);
 this.mouthCoinPower=Math.min(1.8,Math.max(this.mouthCoinPower||0,power));
 this.mouthCoinUntil=G.time+this.mouthCoinQ/38+.16;
 AUDIO.coinGush(clamp(n/28,.45,.85));
},
updateMouthCoins(dt){
 if(this.headGone||this.headDestroyed||this.jawGone||this.state==='dead'){
  this.mouthCoinQ=0;this.mouthCoinUntil=0;this.mouthCoinPower=0;return;
 }
 if(!(this.mouthCoinQ>0)||dt<=0)return;
 if(this.mouthCoinDelay>0){this.mouthCoinDelay-=dt;return;}
 const F=this.headFrame();if(!F)return;F.updateWorldMatrix(true,false);
 const rep=this.headKind==='rep',origin=V3(0,rep?-.118:-.126,rep?.196:.226);
 const forward=V3(0,-.22,1).transformDirection(F.matrixWorld);
 const side=V3(1,0,0).transformDirection(F.matrixWorld),pw=this.mouthCoinPower||1;
 this.mouthCoinAcc+=dt*38;
 while(this.mouthCoinAcc>=1&&this.mouthCoinQ>0){
  this.mouthCoinAcc--;this.mouthCoinQ--;
  const p=F.localToWorld(origin.clone()).addScaledVector(side,rnd(-.012,.012));
  const v=forward.clone().multiplyScalar(rnd(1.2,1.9)*(.7+.3*pw)).addScaledVector(side,rnd(-.18,.18)).add(V3(0,.15,0));
  COINS.spawn(p,v,Math.random()<.62?0:1);
 }
 if(!this.mouthCoinQ)this.mouthCoinPower=0;
},
updateBelly(dt){
 this.updateMouthCoins(dt);
 const z=this.abd&&this.abd.z;
 if(this.abdomenCavity&&z)this.placeAbdomenCavity(z);
 if(!(this.coinQ>0)||dt<=0||!z||!z.hostLP)return;
 // 1초에 70개 정도씩 틈을 따라 여기저기서 튀어나온다
 this.coinAcc=(this.coinAcc||0)+dt*70;
 const s=this.slitPoint(),g=this.abdomenCavity;g.updateWorldMatrix(true,false);
 const tx=V3(1,0,0).transformDirection(g.matrixWorld).normalize(),pw=this.coinPow||1;
 while(this.coinAcc>=1&&this.coinQ>0){this.coinAcc-=1;this.coinQ--;
  const p=s.p.clone().addScaledVector(tx,rnd(-.07,.07)).addScaledVector(s.n,.03);
  const v=s.n.clone().multiplyScalar(rnd(.9,2.1)*(.65+.35*pw)).addScaledVector(tx,rnd(-.7,.7)).add(V3(rnd(-.15,.15),rnd(.2,1.3)*pw,0));
  COINS.spawn(p,v,Math.random()<.62?0:1);
 }
 if(this.coinQ<=0){this.coinQ=0;this.coinPow=0;}
},

 /* ===== 팔다리 자르기 =====
  * 팔(위팔·아래팔·손)·다리(허벅지·정강이·발)를 가로지를 때마다 한 번으로 친다(손을 떼지 않고 휘둘러도 지나갈 때마다).
  * 1번째 베임 → 2번째 깊게 베여 축 늘어짐 → 3번째에 그은 자리에서 가장 가까운 마디가 잘려 떨어진다.
  * 다시 자란 도마뱀 팔다리는 한 번에 잘린다. */
limbOf(part){const m=/^(arm|hand|thigh|shin|foot)(L|R)$/.exec(part||'');return m?(m[1]==='arm'||m[1]==='hand'?'arm':'leg')+m[2]:null;},
// 그 팔(또는 다리)에 붙은 겉면 메시: 맞힘 판정 메시 + 피가 흐르는 메시(소매 자락 포함)
limbMeshes(key){
 const side=key.slice(-1),bases=key[0]==='a'?['shoulder','uarmMid','elbow','farmMid','wrist']:['hip','thighMid','knee','shinMid','ankle'],out=new Set();
 for(const o of this.parts)if(o.parent&&!o.userData.detached&&this.limbOf(o.userData.part)===key)out.add(o);
 for(const b of bases)for(const o of (this.flow[b+side]||[]))if(o.parent&&!o.userData.detached)out.add(o);
 return [...out];
},
// half: 팔다리를 가로지른 칼 — 자국 반 길이(화면에 보이는 팔다리 폭의 반). 이때 자국은 그 팔다리 겉면 안에만 들어가게 만든다
progressLimbCut(seg,part,pW,nW,angle,strokeId,len,dir,skin,half){
 const key=this.limbOf(part);if(!key)return 0;
 const L=this.limbCut[key],bone=this.bones[seg];if(!L||!bone||bone.userData.detached)return 0;
 const sid=strokeId==null?'limb-'+(++this.cutStrokeFallback):strokeId;
 // 더 자를 마디가 없는 그루터기면 세지 않는다
 const j=this.cutJointAt(seg,pW);if(!j)return 0;
 if(L.last===sid)return L.hits;L.last=sid;L.hits++;
 const side=key.slice(-1),i=side==='L'?0:1,arm=key[0]==='a';
 if(bone.userData.lizard||L.hits>=3){if(this.detachLimb(j,nW,dir))return 99;}
 // 자국은 이 팔다리 겉면에만 붙인다(뒤에 있는 배·옷자락으로 번져 팔과 같이 떠다니지 않게)
 const meshes=this.limbMeshes(key),fit=half!=null;
 let w=arm?.016:.02,cl=clamp(len||.05,.03,.1);
 if(fit){cl=clamp(half,.01,.1);w=Math.min(w,cl/2.4);}
 // fit이면 자국 길이를 정확히 보이는 폭에 맞춘다(윤곽 밖으로 나간 자국 끝은 붙을 데가 없어 허공에 뜬다)
 const asp=(size,lo,hi)=>fit?cl/size:clamp(cl/w,lo,hi);
 if(L.hits===1){
  const s1=skin?w*1.2:w;
  BLOOD.decal(skin?'cutSkin':'cut',seg,pW,nW,s1,{aspect:asp(s1,2.4,5),angle,grid:8,meshes});
  BLOOD.addWound(seg,pW,nW,{rate:.016,tau:34,kind:'cut'});BLOOD.spray(pW,nW,8,{max:2.6});
 }else{
  const s2=w*(skin?1.5:1.35);
  if(!skin)BLOOD.decal('soak',seg,pW,nW,fit?Math.min(arm?.07:.09,cl*1.15):arm?.07:.09,{grow:1.2,meshes});BLOOD.decal(skin?'cutSkin':'cut',seg,pW,nW,s2,{aspect:asp(s2,2.4,4.6),angle,grid:9,meshes});
  BLOOD.addWound(seg,pW,nW,{rate:.03,tau:50,kind:'cut'});BLOOD.spray(pW,nW,16,{max:3.4});AUDIO.spurt(.7);
  // 깊게 베이면 팔은 축 늘어지고 다리는 절뚝인다
  if(arm){this.armLimp[i]=1;this.armHurt[i]=1;if(this.act&&(this.act.side===side||this.act.both))this.endAct();this.releaseIK(side,8);this.sp[side].kick(-6,0,(i?1:-1)*5);}
  else{this.legLimp[i]=1;this.limp[i]=1;this.sp[side+'k'].kick(10);this.sp.drop.kick(-1.8);}
  this.doFlinch('pain',1);
 }
 return L.hits;
},
// 그은 자리에서 가장 가까운 자를 마디
cutJointAt(seg,pW){
 const base=seg.slice(0,-1),side=seg.slice(-1),cand=CUT_CANDS[base];if(!cand)return null;
 let best=null,bd=Infinity;
 for(const c of cand){const b=this.bones[c+side];if(!b||b.userData.detached)continue;b.updateWorldMatrix(true,false);const d=b.getWorldPosition(_bv1).distanceToSquared(pW);if(d<bd){bd=d;best=c+side;}}
 return best;
},
// Recutting a narrow regrown limb must keep the wider original sleeve opening.
replaceLimbCap(joint,parent,pos,q,r,outer,lizard,offset,trim){
 this.limbCaps=this.limbCaps||{};
 const old=this.limbCaps[joint],c=old&&old.parent===parent&&old.userData.cap;
 if(c){pos=old.position.clone();q=old.quaternion.clone();r=c.r;outer=c.outer;offset=0;}
 if(old){old.removeFromParent();this.releaseLoose(old);}
 return this.limbCaps[joint]=this.makeCutCap(parent,pos,q,r,false,outer,lizard,offset,trim);
},
// 잘린 면: 바깥은 옷(살), 안은 비늘, 가운데는 파란 속
makeCutCap(parent,pos,q,r,distal,outer,lizard,offset=0,trim=true){
 const g=grp(parent);g.position.copy(pos);g.quaternion.copy(q);g.translateY((distal?1:-1)*offset);
 const s=distal?1:-1,rx=distal?-PI/2:PI/2;
 if(trim)this.trimCutEnd(parent,g,r,s);
 this.detailCutCap(g,r,outer,rx,s);
 g.userData.cap={r,outer,rx,s};
 return g;
},
// Remove the original closed/rounded mesh end. Otherwise it occludes the
// recessed tissue. Cut exactly at the rim: recessing the shell left an open
// band when the cavity was replaced by the narrower regrown limb.
trimCutEnd(root,cap,r,sign){
 root.updateWorldMatrix(true,true);cap.updateWorldMatrix(true,false);
 const q=cap.getWorldQuaternion(new THREE.Quaternion()),nW=V3(0,sign,0).applyQuaternion(q),pW=cap.getWorldPosition(V3());
 const visit=o=>{
  if(o===cap||o!==root&&o.userData.bone)return;
  if(o.isMesh&&!o.userData.noHit&&!o.userData.gore&&o.geometry&&o.geometry.attributes.position){
   const inv=o.matrixWorld.clone().invert(),n=nW.clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(o.matrixWorld).transpose()).normalize(),p=pW.clone().applyMatrix4(inv),d=n.dot(p),f=o.userData.flesh;
   if(f)f.bake();const a=o.geometry.attributes.position;let lo=Infinity,hi=-Infinity;
   for(let i=0;i<a.count;i++){const v=n.x*a.getX(i)+n.y*a.getY(i)+n.z*a.getZ(i)-d;lo=Math.min(lo,v);hi=Math.max(hi,v);}
   if(lo<0&&hi>0){
    const clipped=SLICE.slice(o.geometry,n,d,false,true);
    if(clipped.keep){const old=o.geometry;o.geometry=clipped.keep;if(f){f.setGeometry(clipped.keep,true);if(o.userData.detached)f.disposeWork();}this.disposables.push(clipped.keep);this.releaseGeometry(old);}
    if(clipped.cut)clipped.cut.dispose();
   }
  }
  for(const child of o.children)visit(child);
 };
 visit(root);
},
detailCutCap(g,r,outer,rx,s){
 const v=Math.round(r*100)%3;
 const rim=mk(CUT_DETAIL.geometry('rim',v),outer,g,{r:[rx,0,0],s:r,cast:false});rim.userData.noHit=true;rim.userData.cutRim=true;
 const detail=grp(g);detail.rotation.x=rx;detail.scale.setScalar(r);detail.userData.gore=true;detail.visible=PREF.blood;this.goreMeshes.push(detail);
 mk(CUT_DETAIL.geometry('inside',v),this.M.cutDepth,detail,{cast:false});
 mk(CUT_DETAIL.muscle(v),this.M.cutTissue,detail,{cast:false});
 // A thin connective layer sits inside the outer lip, not a glossy balloon rim.
 mk(GEO.cutFascia||(GEO.cutFascia=new THREE.RingGeometry(.859,.901,64)),this.M.cutFascia,detail,{p:[0,0,-.073],cast:false});
 mk(CUT_DETAIL.geometry('bone',v),this.M.cutBone,detail,{p:[.022,-.032,0],s:[.84,1,1],cast:false});
 mk(GEO.cutMarrow||(GEO.cutMarrow=new THREE.CircleGeometry(.12,24)),this.M.cutMarrow,detail,{p:[.022,-.032,-.205],s:[.84,1,1],cast:false});
 const vessels=GEO.cutVessel||(GEO.cutVessel=new THREE.TorusGeometry(.029,.011,6,12));
 for(const [x,y] of [[-.35,.18],[.3,-.38],[-.14,-.49]])mk(vessels,this.M.cutVessel,detail,{p:[x,y,-.067],s:[1,.78,1],cast:false});
 mergeChildren(detail);detail.traverse(o=>{if(o.isMesh){o.userData.gore=true;o.userData.noHit=true;}});
 const safe=mk(CUT_DETAIL.geometry('inside',v),this.M.cutSafe,g,{r:[rx,0,0],s:r,cast:false});safe.userData.noHit=true;safe.userData.cutSafe=true;safe.visible=!PREF.blood;
 return g;
},
limbCorners(root){
 root.updateWorldMatrix(true,true);
 const inv=root.matrixWorld.clone().invert(),rel=new THREE.Matrix4(),out=[];
 root.traverse(o=>{
  if(!o.isMesh||!o.visible||!o.geometry||!o.geometry.attributes.position)return;
  for(let n=o;n&&n!==root;n=n.parent){if(!n.visible)return;}
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
  const b=o.geometry.boundingBox;rel.multiplyMatrices(inv,o.matrixWorld);
  for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])out.push(V3(x,y,z).applyMatrix4(rel));
 });
 return out.length?out:null;
},
detachLimb(joint,hitN,dir){
 const bone=this.bones[joint];
 if(!bone||bone.userData.detached||this.detached.has(joint))return false;
 const parent=bone.parent;if(!parent||!parent.userData.bone)return false;
 const side=joint.slice(-1),i=side==='L'?0:1,base=joint.slice(0,-1),arm=ARM_BASES.has(base),key=(arm?'arm':'leg')+side,lizard=!!bone.userData.lizard;
 bone.updateWorldMatrix(true,true);parent.updateWorldMatrix(true,false);
 const jointW=bone.getWorldPosition(V3()),qW=bone.getWorldQuaternion(new THREE.Quaternion());
 const pLocal=bone.position.clone(),qLocal=bone.quaternion.clone(),corners=this.limbCorners(bone);
 const r=(lizard?CUT_R_LIZ:CUT_R)[base]||.07,o=CUT_OUTER[base],outer=lizard?this.M.liz:o==='skin'?this.M.skin:o==='trouser'?this.M.trouser:this.M.robe;
 const offB=lizard?0:(CUT_OFF_BODY[base]||0),offP=(lizard?CUT_OFF_PIECE_LIZ:CUT_OFF_PIECE)[base]||0;
 this.limbCaps=this.limbCaps||{};
 // 더 아래 마디의 옛 흉터가 이번에 떨어질 subtree 안에 있으면 조각에 남기되 live-cap 색인에서는 뺀다.
 for(const k in this.limbCaps){let inside=false;for(let n=this.limbCaps[k];n;n=n.parent)if(n===bone){inside=true;break;}if(inside)delete this.limbCaps[k];}
 const capBody=this.replaceLimbCap(joint,parent,pLocal,qLocal,r,outer,lizard,offB,base!=='wrist');
 this.makeCutCap(bone,V3(),new THREE.Quaternion(),r,true,outer,lizard,offP);
 if(arm){if(this.act&&(this.act.side===side||this.act.both||this.act.name==='beg'))this.endAct();this.releaseIK(side,20);}
 if(this.tabletHeld)this.dropTablet();
 // 떨어져 나간 팔다리: 꿈틀거릴 마디(팔꿈치·손목·손가락·무릎·발목)를 모아 둔다
 const twitch=[];
 if(arm){const a=this.arms[i];if(a.hand&&(a.wr===bone||bone.getObjectById(a.wr.id))){for(const f of a.hand.fingers){twitch.push({o:f.f,ax:'z',k:-a.s,f:rnd(9,13),a:.5});twitch.push({o:f.f2,ax:'z',k:-a.s,f:rnd(9,13),a:.6});}}}
 scene.attach(bone);
 const removed=new Set(),detachedFlesh=new Set(),matClones=new Map();
 const ownMat=m=>{if(!m)return m;if(!matClones.has(m)){const c=m.clone();c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;c.userData.detachedOwned=true;matClones.set(m,c);this.disposables.push(c);}return matClones.get(m);};
 bone.traverse(o=>{
  o.userData.detached=true;
  if(o.isMesh){removed.add(o);if(!o.userData.bloodOverlay)o.material=Array.isArray(o.material)?o.material.map(ownMat):ownMat(o.material);if(o.userData.flesh){o.userData.flesh.disposeWork();detachedFlesh.add(o.userData.flesh);}}
  if(o!==bone&&o.userData.bone&&!/Mid/.test(o.userData.bone))twitch.push({o,ax:'x',k:o.userData.bone.startsWith('knee')?1:-1,f:rnd(6,10),a:rnd(.35,.6)});
 });
 for(const t of twitch){t.b=t.o.rotation[t.ax];t.ph=rnd(0,TAU);}
 this.parts=this.parts.filter(o=>!removed.has(o));
 if(detachedFlesh.size)this.fleshList=this.fleshList.filter(f=>!detachedFlesh.has(f));
 for(const k in this.flow)this.flow[k]=this.flow[k].filter(o=>!removed.has(o));this._flowAll=null;
 this.detached.add(joint);
 this.limbCut[key]={hits:0,last:null};
 if(arm){this.armLimp[i]=0;this.armHurt[i]=1;}else{this.legLimp[i]=0;this.limp[i]=0;}
 const push=(dir?dir.clone():V3(0,0,1)).multiplyScalar(arm?1.1:.6);
 push.x+=rnd(-.45,.45);push.y=Math.max(arm?.8:.35,push.y+(arm?.95:.45));push.z+=rnd(-.25,.25);
 this.bits=this.bits||[];
 this.bits.push({obj:bone,body:true,v:push,w:V3(rnd(-7,7),rnd(-9,9),rnd(-7,7)),r:.03,bounce:.16,sound:'limb',corners,
  twitch:{list:twitch,t:0,dur:rnd(6,8),hop:rnd(.5,.9)},bleed:{lp:V3(0,offP+.006,0),ln:V3(0,1,0),t:0,life:10}});
 const nParent=V3(0,-1,0).applyQuaternion(qW).normalize(),parentSeg=parent.userData.bone;
 const bodyW=jointW.clone().addScaledVector(nParent,offB+.004);
 BLOOD.addWound(parentSeg,bodyW,nParent,{rate:.05,tau:60,artery:true,kind:'cut'});
 BLOOD.spray(bodyW,hitN?hitN.clone().lerp(nParent,.35).normalize():nParent,26,{min:1.4,max:4.6,spread:1.15});
 AUDIO.chop(1.2);AUDIO.spurt(1.1);
 this.hitFlash=1;this.rootVel.z-=.28;this.bigEvent=true;
 FX.word('싹둑!',jointW,{size:56,color:'#ffffff',force:true,dx:rnd(-50,50),dy:-20});
 if(this.state!=='dead'){this.setEmotion('shock');this.shockT=1.4;this.voiceCool=0;AUDIO.voice('scream',1.3);this.voiceCool=G.time+1.2;}
 // 팔: 남은 손으로 잘린 데를 움켜쥔다. 다리: 주저앉는다
 const other=side==='L'?'R':'L';
 if(arm){if(this.armUsable(other)&&this.state==='stand')this.doAct('clutch',{side:other,seg:parentSeg,lp:this.bones[parentSeg].worldToLocal(bodyW.clone()),ln:nParent.clone().transformDirection(_invB(this.bones[parentSeg])),dur:2.2,prio:3});}
 else this.legFall();
 // 죽기 전이면 도마뱀 팔다리가 다시 자란다
 if(this.state!=='dead'&&!(this.down&&this.down.type==='final'))
  this.regrowQ.push({joint,base,side,arm,parent,pos:pLocal.clone(),cap:capBody,t:-(arm?2.2:1.1),dur:arm?2.6:2.8,built:false,goo:0});
 // 떨어진 팔다리는 최근 것 6개만 남긴다(오래된 것부터 치운다)
 this.severed=this.severed||[];this.severed.push(bone);
 while(this.severed.length>6){const old=this.severed.shift();if(this.keepBits&&FREE.overflow(this,old))continue;const k=this.bits.findIndex(b=>b.obj===old),ownedMats=this.looseMaterials(old);if(k>=0)this.bits.splice(k,1);BLOOD.forgetTree(old);old.removeFromParent();this.releaseLoose(old,ownedMats);}
 if(this.onBigEvent)this.onBigEvent('limb');
 return true;
},
// 다리가 잘리면 옥좌로 주저앉았다가 새 다리가 다 자라야 일어난다
legFall(){
 if(this.state==='stand'||this.state==='rise'){this.startFall('throne');this.down.legCut=true;this.down.stay=1.4;if(this.onLegFall)this.onLegFall();}
},
// 다리가 떨어져 있거나 아직 다 자라지 않았으면 일어나지 못한다
legsMissing(){return this.legs.some(l=>l.hip.userData.detached||l.tm.userData.detached||l.knee.userData.detached||l.sm.userData.detached||l.ank.userData.detached)||!!(this.regrowQ&&this.regrowQ.some(r=>!r.arm));},

 /* ===== 다시 자라나는 도마뱀 팔다리: 뼈 → 살 → 비늘 =====
  * 잘린 자리에서 1~2초 뒤, 단면이 몇 번 꿈틀한 다음
  * 1) 뼈: 단면 한가운데서 하얀 뼈가 마디마다 뚜둑 뻗어 나와 손가락뼈까지 만든다(해골 팔)
  * 2) 살: 파란 날살이 몸 쪽에서 손끝 쪽으로 뼈를 감싸며 내려온다(소매를 끼우듯). 맥박처럼 꿀렁이고 끝에서 피가 떨어진다. 손·발은 봉오리로 맺힌다
  * 3) 비늘: 초록 비늘 살(진짜 팔다리 메시)이 몸 쪽부터 손끝까지 날살 위를 덮어 내려오고, 손가락이 봉오리를 뚫고 나온다
  * 4) 깨어남: 움찔하고 손가락(발가락)을 한 번 쥐었다 편다. 그 뒤 새 손을 들여다본다
  * 뼈 자리는 건드리지 않고(IK·자세용) 마디마다 묶어 둔 그룹의 크기만 바꾼다. 다음 마디 뼈는 뼈가 뻗은 만큼만 내려간다.
  * 뼈·날살은 피 끄기(PREF.blood=false)에서는 보이지 않고 비늘만 덮어 내려온다. */
updateRegrow(dt){
 const Q=this.regrowQ;if(!Q||!Q.length)return;
 for(let k=Q.length-1;k>=0;k--){const r=Q[k];
  if(r.parent.userData.detached||(r.root&&r.root.userData.detached)||(!r.built&&(this.state==='dead'||(this.down&&this.down.type==='final')))){Q.splice(k,1);continue;}
  if(this.holdRegrow&&!r.built)continue;
  r.t+=dt;
  if(!r.built){
   // 자라기 직전 1초: 단면 속(뼈 고리·혈관)이 맥박처럼 꿈틀거린다
   if(r.t>-1&&r.cap&&r.cap.userData.cap&&PREF.blood){const c=r.cap.userData.cap,beat=Math.pow(Math.max(0,Math.sin(TAU*1.8*(r.t+1))),10);
    for(const ch of r.cap.children){if(!ch.isMesh)ch.scale.setScalar(c.r*(1+.14*beat));else if(ch.userData.gore)ch.scale.setScalar(c.r*(1+.07*beat));}}
   if(r.t<0)continue;
   if(r.cap&&r.cap.userData.cap){const c=r.cap.userData.cap;for(const ch of r.cap.children)if(!ch.isMesh||ch.userData.gore)ch.scale.setScalar(c.r);}
   this.buildLizardLimb(r);r.built=true;r.t=0;
   continue;
  }
  if(!r.segs){Q.splice(k,1);continue;}
  const t=r.t,T=r.T,n=r.segs.length,RG=REGROW,arm=r.arm,s=r.side==='L'?-1:1;
  const easeOut=x=>1-(1-sat(x))*(1-sat(x))*(1-sat(x));
  let bloodAt=null;
  for(let j=0;j<n;j++){const S=r.segs[j];
   // 1) 뼈: 마디마다 차례로 뚜둑 뻗는다. 다음 마디는 뻗은 만큼 내려간다
   const gB=easeOut((t-T.bone[j])/RG.boneDur);
   if(gB>0&&!S.boneOut){S.boneOut=true;AUDIO.boneOut(j===0?.8:.5);
    if(j===0&&PREF.blood){r.parent.updateWorldMatrix(true,false);const p=r.parent.localToWorld(r.pos.clone()),d=V3(0,-1,0).applyQuaternion(r.parent.getWorldQuaternion(new THREE.Quaternion()));BLOOD.spray(p,d,9,{min:.8,max:2.4,spread:1});}}
   S.cg.scale.set(1,Math.max(.001,gB),1);
   const nxt=j+1<n?r.segs[j+1].b:r.tip;nxt.position.copy(r.rest[j+1]).multiplyScalar(gB);
   // 2) 살: 날살 소매가 뼈를 타고 내려오며 굵어지고, 꿀렁인다
   const uL=sat((t-T.raw[j])/RG.rawLen),uT=sat((t-T.raw[j])/RG.rawThick);
   if(uL>0&&!S.rawOut){S.rawOut=true;AUDIO.squelch(j===0?.65:.4);}
   const L=smooth(uL),throb=.07*Math.pow(Math.max(0,Math.sin((t-T.raw[j])*11+j*1.3)),5)*(1-uT*.5),thick=(.5+.5*smooth(uT))*(1+throb);
   S.fg.scale.set(.9*thick,Math.max(.001,L),.9*thick);
   if(S.rb){const q=Math.max(.001,.9*thick*sat(uL*4));S.rb.scale.set(S.rbDim[0]*q,S.rbDim[1]*q,S.rbDim[2]*q);}
   if(uL>0&&uL<1)bloodAt=S;
   // 3) 비늘: 진짜 비늘 살이 날살 위를 덮어 내려온다(조금 더 굵어지며 덮으니 날살이 안 비친다)
   const uS=sat((t-T.sc[j])/RG.scDur),g=smooth(uS);
   if(uS>0&&!S.scOut){S.scOut=true;AUDIO.scaleSet(j===0?.7:.4);}
   S.sg.scale.set(.93+.07*g,Math.max(.001,g),.93+.07*g);S.sg.rotation.set(0,0,0);
   S.bg.scale.setScalar(Math.max(.001,sat(uS*5)*(.92+.08*g)));
   if(uS>=1&&!S.covered){S.covered=true;S.cg.visible=false;S.fg.visible=false;if(S.rb)S.rb.visible=false;}
  }
  // 손·발: 뼈 → 봉오리 → 비늘 손가락이 봉오리를 뚫고 나온다
  const H=r.hand;
  const gH=easeOut((t-T.boneHand)/RG.boneHandDur);
  if(gH>0&&!H.boneOut){H.boneOut=true;AUDIO.boneOut(.45);}
  H.hb.scale.set(1,Math.max(.001,gH),1);
  for(const m of H.mirror)m.b.rotation.copy(m.a.rotation);
  const uM=sat((t-T.rawHand)/RG.rawHandDur);
  if(uM>0&&!H.rawOut){H.rawOut=true;AUDIO.squelch(.45);}
  const mT=(.55+.45*smooth(uM))*(1+.08*Math.pow(Math.max(0,Math.sin((t-T.rawHand)*10)),5)*(1-uM*.5));
  const uH=sat((t-T.scHand)/RG.scHandDur),gh=smooth(uH);
  if(uH>0&&!H.scOut){H.scOut=true;AUDIO.scaleSet(.5);}
  H.hr.scale.set(.9*mT*(1-.78*gh),Math.max(.001,smooth(uM)*(1-.85*gh)),.9*mT*(1-.78*gh));
  H.hg.scale.set(.93+.07*gh,Math.max(.001,gh),.93+.07*gh);
  if(uH>=1&&!H.covered){H.covered=true;H.hb.visible=false;H.hr.visible=false;}
  // 4) 깨어남: 움찔, 손가락(발가락)을 한 번 쥐었다 편다
  const uW=sat((t-T.wake)/RG.wakeDur);
  if(uW>0){
   if(!r.woke){r.woke=true;AUDIO.hiss(.8);if(this.state!=='dead')this.flickTongue(true);}
   const d=(1-uW)*(1-uW),jolt=Math.sin(uW*38)*d;
   if(r.jolt){r.jolt.rotation.z+=s*.09*jolt;r.jolt.rotation.x+=.05*Math.sin(uW*29+1)*d;}
   const c=1.15*smooth(uW/.35)*(1-smooth((uW-.45)/.5));
   if(arm){const a=this.arms[r.side==='L'?0:1];if(a.hand===r.tip.userData.hand)this.setCurl(a,c);}
   else if(H.toeBase)r.digits.forEach((toe,ti)=>{toe.rotation.x=H.toeBase[ti]-c*.55;});
  }
  // 피: 잘린 자리에서, 그리고 날살이 내려오는 끝에서 떨어진다
  if(PREF.blood&&t<T.scHand){
   r.goo-=dt;if(r.goo<=0){r.goo=rnd(.08,.18);r.parent.updateWorldMatrix(true,false);const p=r.parent.localToWorld(r.pos.clone());BLOOD.emit('blood',p,V3(rnd(-.3,.3),rnd(-.1,.4),rnd(0,.4)),rnd(.003,.006),1);}
   r.drip-=dt;if(r.drip<=0&&bloodAt){r.drip=rnd(.1,.2);const S=bloodAt;S.b.updateWorldMatrix(true,false);const p=S.b.localToWorld(V3(rnd(-.01,.01),(S.c-S.len*.5)*S.fg.scale.y,rnd(-.01,.01)));BLOOD.emit('blood',p,V3(rnd(-.2,.2),rnd(-.3,.1),rnd(0,.3)),rnd(.002,.004),1);}
  }
  if(t>=r.dur){Q.splice(k,1);this.onRegrown(r);}
 }
},
buildLizardLimb(r){
 const s=r.side==='L'?-1:1,nm=r.side,chain=r.arm?ARM_CHAIN:LEG_CHAIN,M=this.M;
 const k0=chain.findIndex(c=>c[0]===r.base);if(k0<0)return;
 let parent=r.parent;const made=[];
 for(let k=k0;k<chain.length;k++){
  const [name,pos]=chain[k],p=k===k0?[r.pos.x,r.pos.y,r.pos.z]:[pos[0],pos[1],pos[2]];
  const b=this.bone(name+nm,parent,p);b.userData.lizard=true;made.push(b);
  this.lizSeg(name,b,s,nm);parent=b;
 }
 r.root=made[0];
 const i=r.side==='L'?0:1;
 if(r.arm){const a=this.arms[i];for(const b of made){const n=b.userData.bone.slice(0,-1);if(n==='shoulder')a.sh=b;else if(n==='uarmMid')a.um=b;else if(n==='elbow')a.el=b;else if(n==='farmMid'){a.fm=b;a.drape=null;}else if(n==='wrist'){a.wr=b;a.hand=b.userData.hand;}}}
 else{const l=this.legs[i];for(const b of made){const n=b.userData.bone.slice(0,-1);if(n==='hip')l.hip=b;else if(n==='thighMid')l.tm=b;else if(n==='knee')l.knee=b;else if(n==='shinMid')l.sm=b;else if(n==='ankle')l.ank=b;}}
 for(const b of made)this.detached.delete(b.userData.bone);
 r.root.updateMatrixWorld(true);for(const b of made)mergeChildren(b);
 // 연출용 묶음: 마디마다 비늘 살은 sg, 마디 공은 bg, 뼈는 cg, 날살 소매는 fg(+ 날살 공 rb). 뼈 자리는 그대로.
 const gore=m=>{m.userData.noHit=true;m.userData.gore=true;m.visible=PREF.blood;this.goreMeshes.push(m);return m;};
 r.segs=[];r.rest=made.map(b=>b.position.clone());
 for(let k=0;k<made.length-1;k++){const b=made[k],sg=new THREE.Group(),bg=new THREE.Group(),cg=new THREE.Group(),fg=new THREE.Group();
  for(const ch of [...b.children]){if(!ch.isMesh)continue;(ch.userData.lizBall?bg:sg).add(ch);}
  b.add(sg);b.add(bg);b.add(cg);b.add(fg);
  const name=b.userData.bone.slice(0,-1),D=LIZ_DIM[name]||{},len=D.len||.1,c=D.c||-len/2,r0=D.r0||.05,r1=D.r1||.045;
  // 뼈: 가는 뼈대 + 위쪽 관절 머리(단면의 뼈 고리 굵기에 맞춘다)
  const key='regBone:'+name;
  mk(GEO[key]||(GEO[key]=cylGeo(r0*.27,r1*.25,len*1.02,12)),M.regBone,cg,{p:[0,c,0],cast:false});
  mk(sphereGeo(14),M.regBone,cg,{p:[0,c+len*.5,0],s:D.ball?[D.ball[0]*.6,D.ball[1]*.52,D.ball[2]*.6]:[r0*.5,r0*.36,r0*.5],cast:false});
  mergeChildren(cg);for(const m of cg.children)gore(m);
  // 날살 소매: 비늘 살보다 조금 가늘어서 비늘이 덮으면 안 비친다
  const rk='rawSeg:'+name;
  gore(mk(GEO[rk]||(GEO[rk]=muscleGeo((r0+r1)*.5*1.08,len*1.12)),M.rawFlesh,fg,{p:[0,c,0],r:[0,k*1.7,0],cast:false}));
  // 뼈 옆을 따라 내려가는 힘줄 두 가닥(뼈와 같이 뻗는다)
  const vk='regVein:'+name;
  for(const [ax,az] of [[.72,.4],[-.5,-.6]])gore(mk(GEO[vk]||(GEO[vk]=cylGeo(r0*.075,r0*.06,len*.98,6)),M.rawVessel,cg,{p:[ax*r0*.3,c,az*r0*.3],cast:false}));
  let rb=null;if(D.ball){rb=gore(mk(sphereGeo(16),M.rawFlesh,b,{cast:false}));rb.scale.setScalar(.001);}
  r.segs.push({b,sg,bg,cg,fg,rb,rbDim:D.ball||null,len,c,boneOut:false,rawOut:false,scOut:false,covered:false});
  if(k>0)b.position.set(0,0,0);
  sg.scale.set(.93,.001,.93);bg.scale.setScalar(.001);cg.scale.set(1,.001,1);fg.scale.set(.45,.001,.45);
 }
 // 손·발: 진짜 손 메시는 hg로 묶고, 손가락뼈(hb)는 진짜 손가락 회전을 매 프레임 따라간다. 날살 봉오리(hr)는 손목에서 맺힌다
 const tip=made[made.length-1];r.tip=tip;if(made.length>1)tip.position.copy(r.rest[made.length-1]).multiplyScalar(.001);
 // 깨어날 때 움찔하는 뼈: 자세가 매 프레임 회전을 새로 쓰는 마디(팔꿈치·손목·무릎·발목·어깨·엉덩이)여야 움찔임이 쌓이지 않는다
 r.jolt=made.find(b=>/^(elbow|wrist|knee|ankle|hip|shoulder)/.test(b.userData.bone))||null;
 const hand=tip.userData.hand,foot=tip.userData.foot,hg=new THREE.Group(),hb=new THREE.Group(),hr=new THREE.Group(),mirror=[];
 for(const ch of [...tip.children])hg.add(ch);
 tip.add(hg);tip.add(hb);tip.add(hr);
 r.digits=hand?[...hand.fingers.map(f=>f.f),hand.thumb.t]:foot?foot.toes:[];
 if(hand){
  gore(mk(sphereGeo(12),M.regBone,hb,{p:[0,-.036,.004],s:[.014,.022,.02],cast:false}));
  for(let i=0;i<4;i++){const F=hand.fingers[i],len=i===3?.03:.042;
   const bf=grp(hb,[F.f.position.x,F.f.position.y,F.f.position.z]);gore(mk(capsuleGeo(.0042,len*.86,8),M.regBone,bf,{p:[0,-len/2-.004,0],cast:false}));
   const bf2=grp(bf,[F.f2.position.x,F.f2.position.y,F.f2.position.z]);gore(mk(capsuleGeo(.0036,len*.66,8),M.regBone,bf2,{p:[0,-len*.4,0],cast:false}));
   mirror.push({a:F.f,b:bf},{a:F.f2,b:bf2});}
  const T=hand.thumb,bt=grp(hb,[T.t.position.x,T.t.position.y,T.t.position.z]);gore(mk(capsuleGeo(.0046,.026,8),M.regBone,bt,{p:[0,-.018,0],cast:false}));
  const bt2=grp(bt,[T.t2.position.x,T.t2.position.y,T.t2.position.z]);gore(mk(capsuleGeo(.004,.02,8),M.regBone,bt2,{p:[0,-.014,0],cast:false}));
  mirror.push({a:T.t,b:bt},{a:T.t2,b:bt2});
  gore(mk(GEO.rawMitt||(GEO.rawMitt=capsuleGeo(.027,.09,16)),M.rawFlesh,hr,{p:[0,-.072,.004],cast:false}));
 }else if(foot){
  gore(mk(sphereGeo(12),M.regBone,hb,{p:[0,-.018,.04],s:[.036,.022,.08],cast:false}));
  for(const g of foot.toes){const bg=grp(hb,[g.position.x,g.position.y,g.position.z]);gore(mk(capsuleGeo(.0068,.052,8),M.regBone,bg,{p:[0,0,.03],r:[PI/2,0,0],cast:false}));mirror.push({a:g,b:bg});}
  gore(mk(sphereGeo(16),M.rawFlesh,hr,{p:[0,-.02,.052],s:[.052,.034,.1],cast:false}));
 }
 hg.scale.set(.93,.001,.93);hb.scale.set(1,.001,1);hr.scale.set(.5,.001,.5);
 r.hand={hg,hb,hr,mirror,toeBase:foot?foot.toes.map(g=>g.rotation.x):null,boneOut:false,rawOut:false,scOut:false,covered:false};
 // 시간표: 마디 수에 따라 늘어난다(다리는 조금 느리게)
 r.T=regrowTimeline(r.segs.length,r.arm);r.dur=r.T.dur;
 r.goo=0;r.drip=0;r.woke=false;
 r.root.traverse(o=>{if(!o.isMesh)return;o.userData.seg=this.segOf(o);if(o.userData.part&&!o.userData.noHit)this.parts.push(o);if(o.userData.flow){(this.flow[o.userData.seg]||(this.flow[o.userData.seg]=[])).push(o);FASTRAY.grid(o.geometry);}});
 this._flowAll=null;
 if(this.state==='stand'&&!r.arm)this.doFlinch('shock',.8);
},
// Keep the recessed backing throughout growth; the thin first bone/flesh cannot
// seal the opening. Replace it with a collar only after the new skin is complete.
openCutCap(r){
 const cap=r.cap;if(!cap||!cap.userData.cap||cap.userData.opened)return;cap.userData.opened=true;
 const c=cap.userData.cap,inner=(CUT_R_LIZ[r.base]||.05)*.98;
 for(const ch of [...cap.children]){if(ch.userData.cutRim)continue;ch.removeFromParent();this.releaseLoose(ch);}this.goreMeshes=this.goreMeshes.filter(m=>m.parent);
 // Keep the shaped lip, then seal the annulus between clothing and new skin.
 // Both faces are visible while an arm twists or the body falls.
 if(inner<c.r*.99){const mats=this.cutCollarMats||(this.cutCollarMats=new Map());let mat=mats.get(c.outer);
  if(!mat){mat=c.outer.clone();mat.onBeforeCompile=c.outer.onBeforeCompile;mat.customProgramCacheKey=c.outer.customProgramCacheKey;mat.side=THREE.DoubleSide;mats.set(c.outer,mat);this.disposables.push(mat);}
  const m=mk(new THREE.RingGeometry(inner,c.r,48),mat,cap,{p:[0,c.s*.001,0],r:[c.rx,0,0],cast:false});m.userData.noHit=true;this.disposables.push(m.geometry);}

},
onRegrown(r){
 // 다 자람: 연출용 메시를 걷어내고 변형을 전부 제자리로 돌린다
 const drop=new Set();
 if(r.segs){for(const S of r.segs){S.sg.scale.set(1,1,1);S.sg.rotation.set(0,0,0);S.bg.scale.setScalar(1);
   for(const g of [S.cg,S.fg,S.rb]){if(!g)continue;g.traverse(o=>{if(o.isMesh)drop.add(o);});g.removeFromParent();}}
  for(let j=1;j<r.rest.length;j++)(j<r.segs.length?r.segs[j].b:r.tip).position.copy(r.rest[j]);}
 if(r.hand){const H=r.hand;H.hg.scale.set(1,1,1);for(const g of [H.hb,H.hr]){g.traverse(o=>{if(o.isMesh)drop.add(o);});g.removeFromParent();}
  if(H.toeBase)r.digits.forEach((toe,ti)=>{toe.rotation.x=H.toeBase[ti];});}
 if(drop.size)this.goreMeshes=this.goreMeshes.filter(m=>!drop.has(m));
 this.openCutCap(r);
 const key=(r.arm?'arm':'leg')+r.side,i=r.side==='L'?0:1;this.limbCut[key]={hits:0,last:null};if(r.arm)this.armLimp[i]=0;else{this.legLimp[i]=0;this.limp[i]=0;}
 // 잘린 자리에서 나던 피는 멎는다
 r.parent.updateWorldMatrix(true,false);BLOOD.stopNear(r.parent,r.parent.localToWorld(r.pos.clone()),.09);
 if(r.arm){this.armHurt[i]=.4;if(this.state==='stand'&&!this.act)this.doAct('look',{side:r.side,dur:1.6});}
 else if(this.state==='down'&&this.down&&!this.legsMissing())this.down.stay=Math.min(this.down.stay,.35);
},
// 도마뱀 팔다리 한 마디: 비늘 원기둥 + 마디 공 + 돌기
lizSeg(name,b,s,nm){
 const M=this.M,F=o=>Object.assign({flow:true},o),R=LIZ_DIM[name];
 const ap='arm'+nm,lp=name==='hip'||name==='thighMid'||name==='knee'?'thigh'+nm:'shin'+nm;
 const part=ARM_BASES.has(name)?ap:lp;
 if(R.ball){const ball=mk(sphereGeo(20),M.liz,b,F({s:R.ball,part:name==='knee'?'thigh'+nm:part}));ball.userData.keep=true;ball.userData.lizBall=true;}
 if(R.len){
  const key='lizAnatomy:'+name;
  const geo=GEO[key]||(GEO[key]=SCULPT.tube(V3(0,R.c+R.len*.5,0),V3(0,R.c-R.len*.5,0),(t,a)=>lerp(R.r0,R.r1,t)*(1+.12*Math.sin(PI*t)-.045*Math.cos(a*3)*Math.sin(PI*t)+.045*Math.cos(a*7)*Math.sin(PI*t)),24,10,{cap:2,capScale:.22}));
  mk(geo,M.liz,b,F({part:name==='knee'?'shin'+nm:part}));
  // Three broad overlapping scutes along the outer tendon, batched per bone.
  for(let j=0;j<3;j++){const rr=lerp(R.r0,R.r1,(j+.5)/3);mk(sphereGeo(10),M.lizHand,b,{p:[s*rr*.77,R.c+R.len*(.31-j*.29),rr*.32],s:[rr*.29,R.len*.19,rr*.6],part,cast:false});}
 }
 // 바깥쪽 등에 작은 뿔 돌기
 if(R.spikes)for(let k=0;k<R.spikes;k++){const y=R.c+R.len*(.3-k*.35),m=mk(GEO.spike||(GEO.spike=new THREE.ConeGeometry(1,1,6)),M.claw,b,{p:[s*R.r0*.86,y,-R.r0*.42],s:[.011,.032,.011],r:[0,0,-s*1.1],cast:false,part});m.userData.noHit=true;}
 if(name==='wrist')b.userData.hand=this._lizHand(b,s,'hand'+nm);
 if(name==='ankle')b.userData.foot=this._lizFoot(b,s,'foot'+nm);
},
// 도마뱀 손: 사람 손과 같은 짜임(손가락 네 개·엄지)이라 쥐고 펴는 동작이 그대로 먹는다
_lizHand(wr,s,part){
 const M=this.M,h={fingers:[],thumb:null},claw=clawGeo();
 mk(cylGeo(.032,.034,.05,12),M.liz,wr,{p:[0,-.008,0],part,flow:true});
 mk(sphereGeo(18),M.lizHand,wr,{p:[0,-.05,.004],s:[.022,.046,.04],part,flow:true});
 for(let i=0;i<4;i++){
  const z=.028-i*.019,len=i===3?.03:.042;
  const f=grp(wr,[-s*.004,-.088,z]);
  mk(capsuleGeo(.0085,len,8),M.lizHand,f,{p:[0,-len/2-.004,0],part,cast:false});
  const f2=grp(f,[0,-len-.005,0]);
  mk(capsuleGeo(.0078,len*.8,8),M.lizHand,f2,{p:[0,-len*.4,0],part,cast:false});
  mk(claw,M.claw,f2,{p:[0,-len*.8-.012,0],s:[.0062,.026,.0062],cast:false,part});
  h.fingers.push({f,f2});
 }
 const t=grp(wr,[-s*.012,-.032,.04]);t.rotation.set(-.5,0,-s*.5);
 mk(capsuleGeo(.0095,.03,8),M.lizHand,t,{p:[0,-.018,0],part});
 const t2=grp(t,[0,-.038,0]);mk(capsuleGeo(.009,.024,8),M.lizHand,t2,{p:[0,-.014,0],part});
 mk(claw,M.claw,t2,{p:[0,-.04,0],s:[.0058,.022,.0058],cast:false,part});
 h.thumb={t,t2};
 return h;
},
// 도마뱀 발: 길쭉한 발등 + 발가락 셋(발톱)
_lizFoot(ank,s,part){
 const M=this.M,claw=clawGeo(),toes=[];
 mk(sphereGeo(18),M.liz,ank,{p:[0,-.018,.04],s:[.062,.04,.11],part,flow:true});
 for(let k=-1;k<=1;k++){const g=grp(ank,[k*.036,-.034,.13]);g.rotation.set(-.15,k*.32,0);toes.push(g);
  mk(capsuleGeo(.016,.06,8),M.liz,g,{p:[0,0,.03],r:[PI/2,0,0],part});
  const c=mk(claw,M.claw,g,{p:[0,-.006,.082],s:[.01,.03,.01],cast:false,part});c.rotation.x=PI/2+.4;}
 const sp=mk(claw,M.claw,ank,{p:[0,-.02,-.06],s:[.012,.034,.012],cast:false,part});sp.rotation.x=-PI/2+.5;
 return {toes};
},

 /* ===== 파충류 눈: 빠지면 미리 만든 빈 안와만 남는다 ===== */
ejectRepEye(i,n,dir){
 const e=this.repEyes&&this.repEyes[i];if(!e||e.ejected||this.headGone)return false;
 e.ejected=true;e.root.updateWorldMatrix(true,true);scene.attach(e.root);
 const removed=new Set();e.root.traverse(o=>{o.userData.detached=true;if(o.isMesh)removed.add(o);});
 this.parts=this.parts.filter(o=>!removed.has(o));
 e.eg.updateWorldMatrix(true,false);
 const eyeN=V3(0,0,1).applyQuaternion(e.eg.getWorldQuaternion(new THREE.Quaternion())).normalize();if(n)eyeN.lerp(n,.2).normalize();
 const p=e.eg.getWorldPosition(V3()),push=eyeN.clone().multiplyScalar(rnd(1.3,1.8)).add(V3(rnd(-.35,.35),rnd(.5,1),rnd(-.18,.18)));if(dir)push.addScaledVector(dir,-.18);
 this.bits=this.bits||[];const bit={obj:e.root,body:true,v:push,w:V3(rnd(-9,9),rnd(-12,12),rnd(-8,8)),r:.043,bounce:.35,sound:'eye'};this.bits.push(bit);
 this.addTether(bit,e.eg,V3(0,0,-.006),{life:rnd(.3,.4),maxLen:.17});
 this.looseEyes=this.looseEyes||[];this.looseEyes.push(e.root);
 while(this.looseEyes.length>6){const old=this.looseEyes.shift(),bi=this.bits.findIndex(b=>b.obj===old);if(bi>=0)this.bits.splice(bi,1);old.removeFromParent();}
 // 안와 둘레 비늘살이 파인다
 if(this.repSkull&&this.repSkull.userData.flesh)this.deform('crater',p.clone().addScaledVector(eyeN,-.006),eyeN.clone().negate(),.036,.028,{soak:.7,jag:.25,only:[this.repSkull.userData.flesh]});
 BLOOD.clearDecalsNear('head',p,.06,null);BLOOD.stopNear(this.bones.head,p,.06);
 BLOOD.addWound('head',p,eyeN,{rate:.02,tau:35,kind:'hole'});BLOOD.spray(p,eyeN,16,{min:1,max:3.2,spread:.8});
 AUDIO.pop(1);this.bigEvent=true;FX.word('뽁!',p,{size:48,color:'#ffffff',force:true,dx:e.s*70,dy:-30});return true;
},

 /* ===== 사람 눈: 빠지면 두개골 살이 눈 크기만큼 파인 진짜 구멍이 남는다 =====
 * 눈알은 시신경에 딸려 나가다 끊어져 날아가고(o.dangle이면 끊어지지 않고 매달려 덜렁거린다),
 * 윗꺼풀은 찢어진 채 반쯤 내려앉고 아랫꺼풀은 늘어지며 둘 다 피에 젖은 색. 구멍에서는 피가 볼을 타고 흐른다 */
ejectEye(i,n,dir,o={}){
 const e=this.eyes[i];if(!e||e.ejected||this.headDestroyed)return false;
 e.ejected=true;e.ruined=false;this.swellU[i]=0;this['blackEye'+i]=true;
 this.face.updateWorldMatrix(true,true);
 e.gaze.attach(e.hl);e.gaze.updateWorldMatrix(true,true);
 const wp=e.gaze.getWorldPosition(V3()),wq=e.gaze.getWorldQuaternion(new THREE.Quaternion());
 e.eg.updateWorldMatrix(true,false);const eyeN=V3(0,0,1).applyQuaternion(e.eg.getWorldQuaternion(new THREE.Quaternion())).normalize();if(n)eyeN.lerp(n,.2).normalize();
 const removed=new Set();e.gaze.traverse(ob=>{if(ob.isMesh)removed.add(ob);});
 this.parts=this.parts.filter(ob=>!removed.has(ob));
 const p=e.eg.getWorldPosition(V3());
 if(o.dangle){
  // 시신경에 매달려 덜렁거린다
  // 축은 안와 입구, 눈알은 볼 앞으로 늘어져 흔들린다(볼살 속에 묻히지 않게 앞으로 뺀다)
  e.dangle=this.makeDangle(e.gaze,e.eg,V3(0,0,.014),{off:[0,-.062,.03],cord:.0038,cordFrom:-.024,sway:1.2,k:44,c:3});
 }else{
  e.gaze.traverse(ob=>{ob.userData.detached=true;});
  scene.add(e.gaze);e.gaze.position.copy(wp);e.gaze.quaternion.copy(wq);e.gaze.scale.set(1,1,1);
  const push=eyeN.clone().multiplyScalar(rnd(1.25,1.75));push.add(V3(rnd(-.35,.35),rnd(.5,1),rnd(-.18,.18)));if(dir)push.addScaledVector(dir,-.18);
  this.bits=this.bits||[];const bit={obj:e.gaze,body:true,v:push,w:V3(rnd(-9,9),rnd(-12,12),rnd(-8,8)),r:.043,bounce:.35,sound:'eye'};this.bits.push(bit);
  this.addTether(bit,e.eg,V3(0,0,-.006),{life:rnd(.3,.42),maxLen:.17});
  this.looseEyes=this.looseEyes||[];this.looseEyes.push(e.gaze);
  while(this.looseEyes.length>6){const old=this.looseEyes.shift(),bi=this.bits.findIndex(b=>b.obj===old);if(bi>=0)this.bits.splice(bi,1);old.removeFromParent();}
 }
 // 안와: 두개골 살을 눈 크기만큼 파 들어간다(속살·피에 젖은 바닥). 살이 꺼지며 눈 자리(eg)도 같이 안쪽으로 들어간다
 const into=eyeN.clone().negate();
 // 눈 자리(눈꺼풀·안와 그룹)는 겉면에 그대로 두고 살만 파 들어간다
 this._holdFeat=e.eg;
 if(this.skull&&this.skull.userData.flesh)this.deform('crater',p.clone().addScaledVector(eyeN,-.004),into,.044,.046,{soak:.75,jag:.22,only:[this.skull.userData.flesh]});
 this._holdFeat=null;
 const r=e.r,socket=grp(e.eg,null,'emptySocket');
 const cavity=mk(eyeCapGeo(r*1.06,1.25,false),this.M.socket,socket,{p:[0,0,-.056],s:[1,1,.55],cast:false});cavity.userData.noHit=true;
 const rim=mk(new THREE.TorusGeometry(r*.98,.0062,7,30),this.M.cutTissue,socket,{p:[0,0,-.002],s:[1,.96,.8],cast:false});rim.userData.noHit=true;rim.userData.gore=true;rim.visible=PREF.blood;this.goreMeshes.push(rim);
 if(!o.dangle){const stub=mk(cylGeo(.0036,.0028,.024,7),this.M.nerve,socket,{p:[.004,-.006,-.03],r:[.9,0,.3],cast:false});stub.userData.noHit=true;}
 e.socket=socket;e.lizard=false;
 // 눈꺼풀: 찢어져 피에 젖은 채 윗꺼풀은 반쯤 내려앉고 아랫꺼풀은 처진다(_applyEyes가 lidTorn 값대로 둔다)
 e.upLid.material=this.M.lidTorn;e.loLid.material=this.M.lidTorn;e.lidTorn={up:rnd(.5,.8),lo:rnd(.1,.6),skew:rnd(-.3,.3)};
 if(e.lash)e.lash.visible=false;
 BLOOD.clearDecalsNear('head',p,.06,null);BLOOD.stopNear(this.bones.head,p,.06);
 BLOOD.addWound('head',p,eyeN,{rate:.022,tau:40,kind:'hole'});BLOOD.spray(p,eyeN,16,{min:1,max:3.2,spread:.8});
 // 안와에서 볼을 타고 흐르는 핏줄기
 const pr=BLOOD.project(p.clone().add(V3(0,-.022,0)).addScaledVector(eyeN,.012),eyeN,.05);if(pr)BLOOD.startRiv(pr.seg||'head',pr.point,pr.normal,{w:.0046,maxLen:rnd(.16,.3),speed:.11});
 AUDIO.pop(.9);AUDIO.squelch(.45);this.bigEvent=true;
 FX.word('뽁!',p,{size:48,color:'#ffffff',force:true,dx:e.s*70,dy:-30});
 return true;
},

 /* ===== 머리: 맞을수록 사람 살가죽이 떨어져 나가 비늘이 드러난다 ===== */
// 살가죽 조각: 살색 겉 + 비늘 안쪽이 보이게 휘어진 얇은 조각
throwSkinFlakes(pt,n,count,scale){
 const nn=n?n.clone().normalize():V3(0,0,1);this.bits=this.bits||[];
 const geo=GEO.flake||(GEO.flake=(()=>{const g=new THREE.SphereGeometry(1,10,6,0,TAU,0,.9);return g;})());
 const mat=this.unmasked?this.M.lizIn:this.M.skin;
 for(let i=0;i<count;i++){
  const s=scale*rnd(.55,1.1);
  const m=mk(geo,mat,scene,{s:[s,s*.45,s*rnd(.7,1)],cast:false});
  m.position.copy(pt).add(V3(rnd(-scale,scale),rnd(-scale,scale),rnd(-scale,scale)*.5));m.rotation.set(rnd(0,PI),rnd(0,PI),rnd(0,PI));
  if(Math.random()<.5){const in_=mk(geo,this.M.liz,m,{s:[.96,.9,.96],p:[0,-.04,0],cast:false});in_.userData.noHit=true;}
  const v=nn.clone().multiplyScalar(rnd(1,2.6)).add(V3(rnd(-1.1,1.1),rnd(.6,2.2),rnd(-.6,.6)));
  this.bits.push({obj:m,body:true,v,w:V3(rnd(-14,14),rnd(-14,14),rnd(-14,14)),r:s*.4,bounce:.12,sound:i===0?'flake':null,ttl:rnd(4,6)});
 }
},
peelSkin(seg,pt,n,size){
 BLOOD.decal('scales',seg,pt,n,size,{force:true,angle:rnd(-.5,.5)});
 this.throwSkinFlakes(pt,n,5,size*.42);
 BLOOD.spray(pt,n,12,{min:1,max:3.2,spread:.9});AUDIO.peel(.9);
},
progressHeadGun(part,seg,pt,n,dir){
 if(this.headDestroyed)return false;this.headGunHits++;
 if(this.unmasked)return true;
 // 눈을 정확히 두 발 맞히면 진행 단계와 무관하게 빠진다.
 const dead=this.state==='dead',eyeOK=true;
 if(part==='eyeL'||part==='eyeR'){
  const i=part==='eyeL'?0:1;this.eyeGunHits[i]++;
  if(this.eyeGunHits[i]>=2&&eyeOK)this.ejectEye(i,n,dir);
 }
 // 단계마다 따로 표시해 둔다(앞 단계를 건너뛰어도 뒤 단계가 막히지 않게)
 const hd=this.headDone||(this.headDone={});
 // 살가죽이 벗겨져 비늘이 비치는 단계(눈·턱·정수리가 날아가는 건 맞은 자리별로 따로 센다: gunHead)
 if(this.headGunHits>=3&&!hd.s1){hd.s1=true;if(this.crownOn!==false)this.knockCrown(dir);this.peelSkin(seg,pt,n,.05);}
 if(this.headGunHits>=6&&!hd.s2){hd.s2=true;this.peelSkin(seg,pt,n,.06);}
 if(this.headGunHits>=9&&!hd.s3){hd.s3=true;this.peelSkin(seg,pt,n,.068);}
 // 사람 가면이 통째로 벗겨지는 건 마지막으로 쓰러진 뒤에만
 if(dead&&this.headGunHits>=12)this.unmaskHead(pt,n,dir);
 return true;
},
/* 가면 벗기기: 콧수염·눈썹·코·귀·머리카락·턱수염이 날아가고, 드러난 살갗이 전부 비늘로 바뀐다.
 * 사람 눈알도 마저 빠져 뱀눈만 남고, 갈라진 혀가 날름거린다. */
unmaskHead(pt,n,dir){
 if(this.unmasked)return false;this.unmasked=true;
 this.endAct();this.guardHold=0;this.guard=0;
 if(this.crownOn!==false)this.knockCrown(dir||V3(0,.5,1));
 for(let i=0;i<2;i++)if(!this.eyes[i].ejected)this.ejectEye(i,n,dir);
 const F=this.face;F.updateWorldMatrix(true,true);
 const center=F.localToWorld(V3(0,.02,.12)),nn=n||V3(0,.3,1);
 // 날아가는 사람 얼굴 부품
 const fling=(o,sp=1)=>{if(!o||!o.parent||o.userData.detached)return;o.updateWorldMatrix(true,true);scene.attach(o);const rm=new Set();o.traverse(c=>{c.userData.detached=true;if(c.isMesh)rm.add(c);});this.parts=this.parts.filter(x=>!rm.has(x));
  const v=V3().subVectors(o.getWorldPosition(V3()),center).normalize().multiplyScalar(rnd(1.2,2.4)*sp).add(V3(rnd(-.4,.4),rnd(.8,1.8),rnd(.2,.8)));
  this.bits.push({obj:o,body:true,v,w:V3(rnd(-10,10),rnd(-10,10),rnd(-10,10)),r:.03,bounce:.2,corners:this.limbCorners(o)});};
 for(const m of this.maskParts)fling(m);
 for(const b of this.brows){b.gone=true;fling(b.tube.mesh,.8);}
 fling(this.noseG,1.2);fling(this.bRoot,.7);if(this.topknot)fling(this.topknot);
 this.nostrils=[];this.noseBleeding=false;
 // 드러난 살갗은 비늘(얼굴·목·손 모두)
 const M=this.M;
 reptileMaterial(M.skin,2.2,1.7);M.skin.color.set('#ffffff');
 reptileMaterial(M.skinD,2.2,1.7);M.skinD.color.set('#a3b08e');
 this.skull.material=M.lizHead;this.chin.material=M.lizHead;
 M.lip.color.copy(col('#3d5a1c'));M.blush.color.copy(col('#5f8a2c'));M.tongue.color.copy(col('#b8324f'));
 // 도마뱀 콧구멍
 for(const s of [-1,1]){const m=mk(sphereGeo(10),M.mouth,F,{p:[s*.03,-.03,.2],s:[.012,.007,.008],cast:false});m.userData.noHit=true;}
 this.throwSkinFlakes(center,nn,22,.05);
 BLOOD.clearAbove('head',-1);
 BLOOD.spray(center,nn.clone().lerp(V3(0,1,0),.4).normalize(),36,{min:1.2,max:4.5,spread:1.2,smax:.009});this.screenSplat(center,.9);
 AUDIO.unmask(1);this.hitFlash=1;this.whiteFlash=1;this.rootVel.z-=.5;this.bigEvent=true;
 FX.add('ring',center,{size:.45,life:.25,start:.4,grow:1.8,fade:1,color:'#c8ff9a'});
 FX.word('부욱!',center,{size:66,color:'#c8ff9a',force:true,dur:.75,dy:-40});
 this.reveal=this.reveal||{t0:G.time,nb:G.time+1,nf:G.time+.6,ns:G.time+9,sc:6};this.reveal.nf=G.time+.6;this.reveal.nb=G.time+1.1;this.reveal.sc=6;
 this.repFull=true;this.deadStare=1;
 return true;
},

/* 칼·총: 상처 + 계속 흐르는 피. 살에 난 상처는 살갗이 찢겨 비늘이 보이고, 옷에 난 상처는 파란 피가 배어 나온다 */
 isSkinHit(h){if(this.unmasked&&HEADS.test(h.part))return false;const m=h.obj&&h.obj.material,M=this.M;return m===M.skin||m===M.skinD||m===M.blush||m===M.lip;},
 makeWound(seg,pt,n,dir,tool,kind,h,onGuard){
  const gun=tool==='gun',isHead=HEADS.test(h.part),skin=this.isSkinHit(h);
  if((h.part==='eyeL'||h.part==='eyeR')&&this.eyes[h.part==='eyeL'?0:1].lizard){BLOOD.spray(pt,n,8,{max:2.4});return;}
  const artery=h.part==='neck'||(/^thigh/.test(h.part)&&gun&&Math.random()<.5);
  if(gun){
   if(skin)BLOOD.decal('holeSkin',seg,pt,n,isHead?.038:.04,{grid:7,angle:rnd(0,TAU)});
   else{BLOOD.decal('soak',seg,pt,n,isHead?.06:.12,{grow:isHead?1:5});BLOOD.decal('hole',seg,pt,n,isHead?.021:.027,{grid:7});}
   BLOOD.addWound(seg,pt,n,{rate:artery?.05:isHead?.026:.022,tau:artery?22:30,artery,kind:'hole'});
   // 뒤로 뚫고 나가 옥좌에 튄다
   const back=V3().copy(pt).addScaledVector(dir,.35);for(let i=0;i<14;i++){const v=V3().copy(dir).multiplyScalar(rnd(4,7.5)).add(V3(rnd(-.9,.9),rnd(-.3,1),rnd(-.4,.4)));BLOOD.emit('blood',back,v,rnd(.003,.008),1.2);}
   // 맞은 자리에서 앞으로 왈칵
   BLOOD.spray(pt,n.clone().lerp(V3(0,.2,1),.35).normalize(),22,{min:1,max:3.6,smax:.009});
   if((isHead||h.part==='neck')&&Math.random()<.55)this.screenSplat(pt,isHead?.9:.6);
  }else if(kind==='slash'&&h.slashPath&&h.slashPath.length>=2&&this.limbOf(h.part)){
   this.limbSlashWound(seg,h,pt,n,dir,skin);
  }else if(kind==='slash'&&h.slashFrom){
   const a=h.slashFrom,b=pt,mid=V3().addVectors(a,b).multiplyScalar(.5),len=a.distanceTo(b),ang=this.angleOnSurface(a,b,n);
   const half=Math.max(.014,len*.78),cw=isHead?.011:.014,limb=this.limbOf(h.part);
   if(!limb)BLOOD.decal(skin?'cutSkin':'cut',seg,mid,n,skin?cw*1.25:cw,{aspect:Math.max(1.8,half/cw),angle:ang,grid:5,rows:2,meshes:this.flow[seg]});
   const bone=this.bones[seg];bone.updateWorldMatrix(true,false);
   BLOOD.addWound(seg,mid,n,{rate:clamp(len*.3,.006,.02)*(artery?2.5:1),tau:22,artery,kind:'cut',line:[bone.worldToLocal(a.clone()),bone.worldToLocal(b.clone())]});
   for(let i=0;i<Math.min(2,Math.ceil(len*32));i++){const q=V3().copy(a).lerp(b,rnd(.1,.9));const pr=BLOOD.project(q,n,.05);if(pr)BLOOD.startRiv(pr.seg||seg,pr.point,pr.normal,{w:rnd(.003,.0048),maxLen:rnd(.08,.3)});}
   BLOOD.spray(mid,n,clamp(Math.round(len*90),3,10),{max:2.2});
   if(isHead&&Math.random()<.6)this.screenSplat(mid,.45);
   if(h.part==='belly'&&(h.obj===this.belly||h.obj===this.tie)&&seg==='spine')this.progressAbdomenCut(a,b,n,ang,h.strokeId,len);
   else if(limb)this.progressLimbCut(seg,h.part,mid,n,ang,h.strokeId,len,dir,skin);
  }else{
   const ca=rnd(0,PI),sw=.013;
   BLOOD.decal(skin?'cutSkin':'cut',seg,pt,n,skin?sw*1.3:sw,{aspect:2.6,angle:ca,grid:7});
   if(!isHead&&!skin)BLOOD.decal('soak',seg,pt,n,.08,{grow:4});
   BLOOD.addWound(seg,pt,n,{rate:artery?.045:.012,tau:artery?20:26,artery,kind:'stab'});
   BLOOD.spray(pt,n,12,{max:2.6});
   if(isHead||artery)this.screenSplat(pt,.6);
  }
  if((h.part==='eyeL'||h.part==='eyeR')&&!this.eyes[h.part==='eyeL'?0:1].ejected){
   const i=h.part==='eyeL'?0:1;this.eyes[i].ruined=true;this.swellU[i]=Math.max(this.swellU[i],.7);
   if(tool==='knife'&&kind==='stab')this.ejectEye(i,n,dir);
  }
 },
 /* 팔다리를 가로지른 칼(h.slashPath: 칼이 지나간 팔다리 겉면 점들, 화면에서 보이는 쪽).
  * 들어간 점과 나온 점은 팔다리 윤곽의 양 끝이라 둘을 이은 직선은 팔다리 속을 지난다 → 자국·피는 겉면 점들을 따라 낸다.
  * pt·n은 그 가운데 점과 그 자리 겉면 방향(나를 향한다). */
 limbSlashWound(seg,h,pt,n,dir,skin){
  const P=h.slashPath,a=P[0].point,b=P[P.length-1].point,chord=a.distanceTo(b);
  let arc=0;const acc=[0];for(let i=1;i<P.length;i++){arc+=P[i].point.distanceTo(P[i-1].point);acc.push(arc);}
  const at=f=>{const t=arc*f;for(let i=1;i<P.length;i++)if(acc[i]>=t){const d=acc[i]-acc[i-1];return P[i-1].point.clone().lerp(P[i].point,d>1e-9?(t-acc[i-1])/d:0);}return b.clone();};
  const ang=this.angleOnSurface(a,b,n),bone=this.bones[seg];bone.updateWorldMatrix(true,false);
  // 피가 새는 줄: 겉면 위 20%~80%(양 끝은 윤곽이라 옆을 향한다)
  BLOOD.addWound(seg,pt,n,{rate:clamp(chord*.3,.006,.02),tau:22,kind:'cut',line:[bone.worldToLocal(at(.2)),bone.worldToLocal(at(.8))]});
  const mid=P.slice(Math.floor(P.length*.2),Math.ceil(P.length*.8)+1);
  for(let i=0;i<Math.min(2,Math.ceil(chord*32));i++){const q=mid[Math.random()*mid.length|0]||P[P.length>>1];const qs=q.obj&&q.obj.userData.seg;BLOOD.startRiv(qs&&this.bones[qs]?qs:seg,q.point,q.normal,{w:rnd(.003,.0048),maxLen:rnd(.08,.3)});}
  BLOOD.spray(pt,n,clamp(Math.round(chord*90),3,10),{max:2.2});
  this.progressLimbCut(seg,h.part,pt,n,ang,h.strokeId,chord,dir,skin,chord*.47);
 },
 angleOnSurface(a,b,n){const d=V3().subVectors(b,a).normalize();const u=V3().crossVectors(n,Math.abs(n.y)>.9?V3(1,0,0):V3(0,1,0)).normalize(),v=V3().crossVectors(n,u);return Math.atan2(d.dot(v),d.dot(u));},
 // 화면(렌즈)에 튄 피: 맞은 자리 가까이에 몇 방울
 screenSplat(pt,amt){const s=pt.clone().project(camera);if(Math.abs(s.x)>1.1||Math.abs(s.y)>1.1)return;const W=innerWidth,H=innerHeight,cx=(s.x*.5+.5)*W,cy=(-s.y*.5+.5)*H,m=Math.min(W,H),n=Math.round(1+amt*1.6);
  for(let i=0;i<n;i++){const a=rnd(0,TAU),d=rnd(.03,.22)*m;SBLOOD.add(clamp(cx+Math.cos(a)*d,10,W-10),clamp(cy+Math.sin(a)*d,80,H-130),rnd(9,17)*(.7+amt*.6));}},
 /* 총 맞는 반응: 머리·목·몸통·팔·다리 */
 gunReact(part,seg,pt,n,dir){
  const lp=this.bones[seg].worldToLocal(pt.clone()),ln=n.clone().transformDirection(_invB(this.bones[seg]));
  if(HEADS.test(part)){this.rootVel.z-=1.05;this.sp.head.kick(-2,dir.x*4,0);if(!this.headDestroyed){this.doAct('face',{side:this.handFor(pt),dur:1.5,prio:2});this.setEmotion('shock');this.shockT=1;}}
  else if(part==='neck'){this.doAct('clutch',{side:'R',both:true,seg,lp,ln,dur:2.4,prio:2});this.rootVel.z-=.6;}
  else if(part==='chest'||part==='belly'||part==='pelvis'){this.doAct('clutch',{side:this.handFor(pt),seg,lp,ln,dur:2,prio:2});this.rootVel.z-=.9;this.sp.spine.kick(1.4,0,0);this.sp.head.kick(-1.2,0,0);}
  else if(/^(arm|hand)/.test(part)){const i=part.endsWith('L')?0:1;this.armHurt[i]=1;this.sp[i?'R':'L'].kick(-10,0,(i?1:-1)*8);if(this.act&&this.act.side===(i?'R':'L'))this.endAct();
   const other=i?'L':'R';this.doAct('clutch',{side:other,seg,lp,ln,dur:1.6,prio:2});}
  else if(/^(thigh|shin|foot)/.test(part)){const i=part.endsWith('L')?0:1;this.limp[i]=1;this.sp[(i?'R':'L')+'k'].kick(14);this.sp.drop.kick(-2.6);this.rootVel.z-=.3;}
 },
 knockTooth(dir){
  const all=[...this.teethU,...this.teethL].filter(t=>!t.userData.gone);if(!all.length)return;
  const t=pick(all);t.userData.gone=true;t.visible=false;
  t.updateWorldMatrix(true,false);const p=t.getWorldPosition(V3());
  const m=mk(sphereGeo(10),this.M.teeth,scene,{s:[.0085,.012,.0065],cast:true});m.position.copy(p);
  this.bits=this.bits||[];this.bits.push({obj:m,body:true,v:V3(dir.x*1.5+rnd(-.6,.6),rnd(1.2,2.2),rnd(.6,1.6)),w:V3(rnd(-20,20),rnd(-20,20),rnd(-20,20)),r:.012,bounce:.4,sound:'tooth'});
  if(PREF.blood)BLOOD.spray(p,V3(0,.2,1),8,{max:1.8});
  this.toothSpit=(this.toothSpit||0)+1;
  AUDIO.tooth();this.bigEvent=true;FX.word('팅!',p,{size:40,color:'#ffffff',force:true,dx:36,dy:-10});
 },
 knockCrown(dir){
  if(this.crownOn===false)return;this.crownOn=false;
  const c=this.crown;scene.updateMatrixWorld(true);scene.attach(c);
  this.bits=this.bits||[];this.bits.push({obj:c,v:V3(dir.x*2.2+rnd(-.8,.8),rnd(1.8,2.8),dir.z*.8-rnd(.2,.8)),w:V3(rnd(-6,6),rnd(-8,8),rnd(-6,6)),r:.06,bounce:.25,sound:'crown',crown:true,ttl:2.5});
  AUDIO.crown(1.2);
 },

// 교체되거나 장면에서 버린 전용 geometry를 GPU와 보관 목록에서 함께 정리한다.
releaseGeometry(g){
 if(!g||new Set(Object.values(GEO)).has(g))return;g.dispose();for(let i=this.disposables.length-1;i>=0;i--)if(this.disposables[i]===g)this.disposables.splice(i,1);
},
looseMaterials(root){
 const out=new Set();if(root)root.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&m.userData&&m.userData.detachedOwned)out.add(m);});return out;
},
releaseLoose(root,ownedMats){
 if(!root)return;const shared=new Set(Object.values(GEO)),seen=new Set(),nodes=new Set();ownedMats=ownedMats||new Set();
 root.traverse(o=>{
  nodes.add(o);
  const g=o.geometry;if(g&&!shared.has(g)&&!o.userData.sharedGeo&&!seen.has(g)){seen.add(g);g.dispose();for(let i=this.disposables.length-1;i>=0;i--)if(this.disposables[i]===g)this.disposables.splice(i,1);}
  for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&m.userData&&m.userData.detachedOwned)ownedMats.add(m);
 });
 for(const m of ownedMats){m.dispose();for(let i=this.disposables.length-1;i>=0;i--)if(this.disposables[i]===m)this.disposables.splice(i,1);}
 if(this.goreMeshes)this.goreMeshes=this.goreMeshes.filter(m=>!nodes.has(m));
 if(this.limbCaps)for(const k in this.limbCaps)if(nodes.has(this.limbCaps[k]))delete this.limbCaps[k];
},
// 바닥에 누운 팔다리 조각: 재질이 같은 메시를 하나로 합치고 그림자를 끈다
bakePiece(root){
 root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),groups=new Map();
 root.traverse(o=>{if(!o.isMesh||!o.visible||Array.isArray(o.material)||!o.geometry||!o.geometry.attributes.position||o.userData.gore||o.userData.cutSafe||o.userData.decal||o.renderOrder)return;for(let n=o;n&&n!==root;n=n.parent)if(!n.visible)return;const k=o.material.uuid;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
 for(const list of groups.values()){const g=mergeMeshes(list,inv);if(isFleshMat(list[0].material))ensureDmg(g);const m=new THREE.Mesh(g,list[0].material);m.castShadow=false;m.receiveShadow=true;m.userData.noHit=true;m.userData.detached=true;
  for(const o of list){o.removeFromParent();this.releaseGeometry(o.geometry);}root.add(m);}
},
// 조각별 수명과 간단한 충돌 표본. 고밀도 살 메시를 매 프레임 다시 훑지 않는다.
prepareBodyBit(b){
 b.bodyAge=0;b.fadeAfter=this.keepBits&&b.sound!=='flake'?1e9:b.twitch?b.twitch.dur+2:(b.ttl==null?(b.sound==='head'?10:7):b.ttl);b.ttl=null;
 const corners=b.corners||this.limbCorners(b.obj),box=new THREE.Box3();
 if(corners)for(const p of corners)box.expandByPoint(p);
 if(box.isEmpty())box.set(V3(-b.r,-b.r,-b.r),V3(b.r,b.r,b.r));
 const size=box.getSize(V3()),center=box.getCenter(V3());
 const axis=size.x>size.y?(size.x>size.z?'x':'z'):(size.y>size.z?'y':'z');
 const minor=['x','y','z'].filter(a=>a!==axis),radius=Math.max(.012,Math.hypot(size[minor[0]],size[minor[1]])*.5);
 const half=Math.max(0,size[axis]*.5-radius),n=half>.04?5:1;
 b.bodyRadius=radius;b.bodySamples=Array.from({length:n},(_,i)=>{const p=center.clone();p[axis]+=n===1?0:half*(i/(n-1)*2-1);return p;});
 // 원래 타격 방향을 유지하면서 몸 바로 밑으로 모이는 낙하만 조금 바깥으로 편향한다.
 const origin=(this.bones.pelvis||this.root).getWorldPosition(V3()),p=b.obj.getWorldPosition(V3());
 let x=p.x-origin.x,z=p.z-origin.z,len=Math.hypot(x,z);if(len<.02){x=p.x<origin.x?-1:1;z=.2;len=Math.hypot(x,z);}
 if(!b.rest){b.v.x+=x/len*.65;b.v.z+=z/len*.65;}
},
prepareBodyContacts(){
 if(!this._bodyContacts){
  const specs=[['pelvis','spine',.23],['spine','chest',.27],['chest','neck',.20],['neck','head',.16]];
  for(const side of ['L','R'])specs.push(['shoulder'+side,'elbow'+side,.10],['elbow'+side,'wrist'+side,.08],['hip'+side,'knee'+side,.12],['knee'+side,'ankle'+side,.08]);
  this._bodyContacts=specs.map(([a,b,r])=>({a,b,r,p:V3(),q:V3(),on:false}));
  this._bitPoint=V3();this._bitScale=V3();
 }
 for(const c of this._bodyContacts){const a=this.bones[c.a],b=this.bones[c.b];
  c.on=!!(a&&b&&a.parent&&b.parent&&!a.userData.detached&&!b.userData.detached);
  if(c.on){a.getWorldPosition(c.p);b.getWorldPosition(c.q);}
 }
},
pushBodyBit(b,dt){
 if(!b.bodySamples||b.bodyAge<.45||dt<=0)return;
 b.obj.updateWorldMatrix(true,false);b.obj.getWorldScale(this._bitScale);
 const radius=b.bodyRadius*Math.max(Math.abs(this._bitScale.x),Math.abs(this._bitScale.y),Math.abs(this._bitScale.z));
 let depth=0,nx=0,nz=0;
 for(const local of b.bodySamples){const p=this._bitPoint.copy(local).applyMatrix4(b.obj.matrixWorld);
  // 바닥 근처의 조각만 밀어낸다. 떨어져 나오는 순간의 비행은 그대로 둔다.
  if(p.y-radius>.48)continue;
  for(const c of this._bodyContacts){if(!c.on)continue;
   const ax=c.q.x-c.p.x,ay=c.q.y-c.p.y,az=c.q.z-c.p.z,den=ax*ax+ay*ay+az*az;
   const t=den?clamp(((p.x-c.p.x)*ax+(p.y-c.p.y)*ay+(p.z-c.p.z)*az)/den,0,1):0;
   let dx=p.x-c.p.x-ax*t,dz=p.z-c.p.z-az*t;const dy=p.y-c.p.y-ay*t,R=radius+c.r+.025;
   if(Math.abs(dy)>=R)continue;
   const need=Math.sqrt(R*R-dy*dy),len=Math.hypot(dx,dz),over=need-len;
   if(over<=depth)continue;
   if(len<.001){
    // 긴 몸통 축 위에 놓였을 때에는 몸의 옆으로 보낸다.
    const side=b.obj.position.x<c.p.x?-1:1,d=Math.hypot(ax,az);
    dx=d>1e-4?az/d*side:side;dz=d>1e-4?-ax/d*side:0;
   }else{dx/=len;dz/=len;}
   depth=over;nx=dx;nz=dz;
  }
 }
 if(depth>0){const move=Math.min(depth,dt*1.8);
  b.obj.position.x+=nx*move;b.obj.position.z+=nz*move;
  b.v.x+=nx*dt*.8;b.v.z+=nz*dt*.8;b.rest=false;
 }
},
fadeBodyBit(b,opacity){
 if(!b.fadeMats){
  const clones=new Map();b.fadeMats=[];
  const own=m=>{if(clones.has(m))return clones.get(m);
   const c=m.userData.detachedOwned?m:m.clone();
   if(c!==m){c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;c.userData.detachedOwned=true;this.disposables.push(c);}
   clones.set(m,c);b.fadeMats.push({m:c,opacity:c.opacity});c.transparent=true;c.depthWrite=false;c.needsUpdate=true;return c;
  };
  b.obj.traverse(o=>{if(o.isMesh&&o.material)o.material=Array.isArray(o.material)?o.material.map(own):own(o.material);});
 }
 for(const f of b.fadeMats)f.m.opacity=f.opacity*opacity;
},
retireBit(b){
 if(!b||b.dead)return;b.dead=true;
 const root=b.obj,owned=this.looseMaterials(root),nodes=new Set();root.traverse(o=>nodes.add(o));
 BLOOD.forgetTree(root);root.removeFromParent();this.releaseLoose(root,owned);
 for(const key of ['severed','severedHeads','headPieces','looseEyes'])if(this[key])this[key]=this[key].filter(o=>o!==root);
 if(this.dangles)this.dangles=this.dangles.filter(d=>!nodes.has(d.piv));
 if(this.tethers)for(let i=this.tethers.length-1;i>=0;i--){const t=this.tethers[i];if(t.bit===b||nodes.has(t.from)){t.tube.mesh.removeFromParent();t.tube.geo.dispose();this.tethers.splice(i,1);}}
 b.fadeMats=null;b.bodySamples=null;b.twitch=null;b.bleed=null;
},
clearBodyBits(){
 for(const b of this.bits||[])if(b.body)this.retireBit(b);
 this.bits=(this.bits||[]).filter(b=>!b.dead);
},
updateBits(dt){
 if(!this.bits)return;
 if(this.bits.some(b=>b.dead))this.bits=this.bits.filter(b=>!b.dead);

  if(this.bits.some(b=>b.body))this.prepareBodyContacts();
  for(const b of this.bits){
   if(b.body){
    if(b.bodyAge==null)this.prepareBodyBit(b);
    b.bodyAge+=dt;
    if(b.bodyAge>b.fadeAfter){const a=1-(b.bodyAge-b.fadeAfter)/1.2;
     if(a<=0){this.retireBit(b);continue;}this.fadeBodyBit(b,a);
    }
   }
  // 잘린 팔다리는 도마뱀 꼬리처럼 한동안 꿈틀거리고, 가끔 바닥에서 튀어 오른다
  if(b.twitch&&b.twitch.t>=b.twitch.dur&&b.rest&&!b.baked){b.baked=true;this.bakePiece(b.obj);}
   if(b.ttl!=null&&b.rest){b.ttl-=dt;if(b.ttl<=0){this.retireBit(b);continue;}}
  if(b.twitch&&b.twitch.t<b.twitch.dur){const tw=b.twitch;tw.t=Math.min(tw.dur,tw.t+dt);const fade=Math.pow(Math.max(0,1-tw.t/tw.dur),1.3);
   for(const x of tw.list)x.o.rotation[x.ax]=x.b+x.k*Math.sin(tw.t*x.f+x.ph)*x.a*fade*(.6+.4*Math.sin(tw.t*2.3+x.ph));
   if(b.rest){tw.hop-=dt;if(tw.hop<=0&&fade>.25){tw.hop=rnd(.7,1.4);b.rest=false;b.v.set(rnd(-.35,.35),rnd(1.1,1.9)*fade+.4,rnd(-.1,.45));b.w.set(rnd(-7,7),rnd(-5,5),rnd(-7,7));AUDIO.drip(.5);}}}
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

   if(b.body)this.pushBodyBit(b,dt);
   if(b.rest)continue;

  b.v.y-=9.8*dt;
  b.obj.position.addScaledVector(b.v,dt);
  b.obj.rotation.x+=b.w.x*dt;
  b.obj.rotation.y+=b.w.y*dt;
  b.obj.rotation.z+=b.w.z*dt;
  // 납작한 고리(후광)는 바닥에 닿은 뒤 동전처럼 눕는다(모서리로 선 채 멈추지 않게)
  if(b.flat&&b.touched){if(b.flatYaw==null)b.flatYaw=rnd(0,TAU);_hq1.setFromEuler(_he.set(-PI/2,0,b.flatYaw));b.obj.quaternion.slerp(_hq1,1-Math.exp(-dt*7));b.w.multiplyScalar(Math.exp(-dt*6));}

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
   b.touched=true;
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
    }else if(b.sound==='halo'&&!b.landed){
     b.landed=true;
     AUDIO.haloLand(.6);
    }else if(b.sound==='flake'&&!b.landed){
     b.landed=true;
     AUDIO.drip(.4);
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
  if(this.crownOn===false)return;const t=clamp(this.crownTilt||0,0,1.15);
  this.crownTilt=Math.max(0,t-dt*.01);
  CROWN_FIT.apply(this.crown,this.crownRest,this.crownTilt);
 },
});
/* ===== 6-6. 후광과 정체 =====
 * 후광: 다운될 때마다 망가진다. 1 금이 가고 도는 게 끊김 → 2 금이 더 가고 형광등처럼 깜빡임 → 3 한 조각이 떨어져 나가 고리가 걸려 못 돎
 *   → 마지막: 꺼지고 멈춰 머리 위로 빠져 목에 걸린다. 맞히면 깡 하고 흔들리며 금이 간다(총 4발이면 조각이 떨어지고 8발이면 꺼져 목에 걸린다).
 * 정체: 크게 맞고 눈을 뜰 때 몇 프레임 파충류 눈이 비친다(다운이 쌓일수록 자주·길게). 첫 다운 뒤로는 얼굴 살갗이 찢어진 자리에 비늘이 보이기 시작하고(갈수록 자주),
 *   세 번째 다운(엉덩방아) 중에 반투명 막이 한 번 눈을 덮고 지나간다. 다 쓰러지면 눈을 뜬 채 파충류 눈이 되고, 막이 깜빡이고 갈라진 혀를 날름거린다. */
const _hq1=new THREE.Quaternion(),_hq2=new THREE.Quaternion(),_he=new THREE.Euler(),_hv1=V3(),_hv2=V3(),_hv3=V3();
const _haloGold=col('#ecb84a'),_haloDull=col('#5c4a36'),HALO_ZMIN=-1.05;
Object.assign(Emperor.prototype,{
 haloUpdate(dt){
  const h=this.halo;if(!h)return;const rdt=this._rdt||dt,t=G.time;
  if(h.falling){this.haloFallUpdate(dt);return;}
  // 머리가 확 돌면 후광은 늦게 따라오며 흔들린다
  const hb=this.bones.head;hb.updateWorldMatrix(true,false);hb.getWorldQuaternion(_hq1);
  if(h.prevQ){_hq2.copy(h.prevQ).invert().multiply(_hq1);const sg=_hq2.w<0?-1:1;h.sp.push(-1.3*sg*_hq2.x,-1.3*sg*_hq2.y,-1.3*sg*_hq2.z,.35);}else h.prevQ=new THREE.Quaternion();
  h.prevQ.copy(_hq1);
  h.sp.step(dt);h.tilt.rotation.set(h.tilt0.x+h.sp.X,h.tilt0.y+h.sp.Y,h.tilt0.z+h.sp.Z);
  // 옥좌 등받이에 파묻히지 않게: 후광 가운데나 위쪽 끝이 등받이 앞면보다 뒤로 가면 머리 쪽으로 당긴다
  h.root.position.set(0,.3,-.268);h.root.updateMatrixWorld(true);
  const zc=h.root.getWorldPosition(_hv1).z,zt=h.tilt.localToWorld(_hv2.set(0,HALO.RF,0)).z,need=Math.max(0,HALO_ZMIN-zc,HALO_ZMIN-zt);
  if(need>0){_hv3.set(0,0,1).transformDirection(hb.matrixWorld);if(_hv3.z>.15){h.root.position.z+=Math.min(.34,need/_hv3.z);h.root.updateMatrixWorld(true);}}
  // 머리가 뒤로 젖혀져 후광이 눕다시피 하면(쓰러져 하늘을 볼 때) 목·가슴을 고리처럼 두르지 않게 머리 뒤쪽으로 더 물러난다
  {_hv3.set(0,0,1).transformDirection(hb.matrixWorld);const up=_hv3.y;// 얼굴이 하늘을 보면 1
   if(up>.35){const k=sat((up-.35)/.5);h.root.position.y+=.1*k;h.root.position.z-=.16*k;h.root.updateMatrixWorld(true);}}
  // 고리 돌기: 금이 간 뒤로는 가끔 멈칫했다가 툭 건너뛴다. 조각이 떨어져 나간 뒤로는 걸려서 못 돌고 덜컥거리기만 한다
  if(h.broken){h.stutT-=dt;if(h.stutT<=0){h.stutT=rnd(1.2,2.6);h.freeze=.38;}
   let j=0;if(h.freeze>0&&!h.goDark){h.freeze-=dt;const u=1-h.freeze/.38;j=.035*Math.sin(u*TAU*5)*(1-u);}
   h.inner.rotation.z=h.baseI-j;h.outer.rotation.z=h.baseO+j;}
  else{let spd=1-h.dark;
   if(h.stage>=1&&!h.goDark){h.stutT-=dt;if(h.stutT<=0){h.stutT=rnd(1.1,2.6);h.freeze=rnd(.22,.5);}
    if(h.freeze>0){h.freeze-=dt;spd=0;if(h.freeze<=0){h.inner.rotation.z+=h.spI*rnd(1.5,3);h.outer.rotation.z+=h.spO*rnd(1.5,3);}}}
   h.inner.rotation.z+=h.spI*dt*spd;h.outer.rotation.z+=h.spO*dt*spd;}
  // 불꽃 일렁임
  const fl=1+.016*Math.sin(t*7.3)+.01*Math.sin(t*12.7+1);h.flames.scale.set(fl,fl,1);h.flames.rotation.z=.025*Math.sin(t*.8);
  // 밝기: 두 번째 다운부터 형광등처럼 깜빡이고, 마지막엔 꺼진다
  let b=1;
  if(h.stage>=2&&!h.goDark){h.flT-=rdt;
   if(h.flT<=0){if(h.flN<=0){h.flN=2*Math.floor(rnd(2,5));h.flT=0;}else{h.flOff=!h.flOff;h.flN--;h.flT=h.flN>0?rnd(.03,.08):rnd(1.2,3.4)/(h.stage>=3?1.5:1);if(h.flOff)AUDIO.haloBuzz();}}
   if(h.flOff)b=.4;}
  if(h.goDark)h.dark=Math.min(1,h.dark+rdt/.45);
  b*=1-h.dark*.6;
  if(Math.abs(b-h.bright)>.001||(h.dark>0&&h.dark<1)){h.bright=b;this.haloPaint(b);}
  if(h.fallAt&&t>=h.fallAt){h.fallAt=0;this.haloDrop();}
 },
 haloPaint(b){
  const h=this.halo,M=h.M,d=h.dark;
  for(const m of [M.zod,M.tri,M.plate])m.color.setRGB(b,b*(1-d*.1),b*(1-d*.2));
  M.flame.color.setScalar(b);M.flame.opacity=1-d;M.glow.opacity=(1-d)*(.45+.55*b);h.flames.visible=d<.98;h.glow.visible=d<.98;
  M.gold.color.copy(_haloGold).lerp(_haloDull,d);M.gold.roughness=.28+d*.4;
 },
 // 머리를 맞으면 후광도 맞은 쪽으로 흔들린다
 haloJolt(dir,p){const h=this.halo;if(!h||!h.on)return;const k=Math.min(p,2.2);h.sp.kick(-dir.y*2*k+rnd(-.6,.6),dir.x*2.6*k,-dir.x*3.2*k+rnd(-.8,.8));},
 // 후광을 직접 맞힘
 haloHit(hit){
  const h=this.halo;if(!h||!h.on)return false;
  // 칼로 그을 때는 한 번 그은 것을 한 대로 친다
  if(hit.kind==='slash'){if(h.lastStroke===hit.strokeId)return false;h.lastStroke=hit.strokeId;}
  const gun=hit.tool==='gun',lp=h.tilt.worldToLocal(hit.point.clone()),a=Math.atan2(lp.y,lp.x);
  h.sp.kick(-hit.dir.y*3+rnd(-1,1),hit.dir.x*4,(lp.x>0?-1:1)*(gun?6:4.5));
  const before=Math.floor(h.hits);h.hits+=gun?1:.5;
  if(Math.floor(h.hits)>before)this.haloCrack(a);
  AUDIO.haloCrack(gun?.55:.35);
  if(h.hits>=4&&!h.broken)this.haloBreakWedge(a);
  if(h.hits>=8&&!h.goDark){h.goDark=true;h.fallAt=G.time+.6;}
  return true;
 },
 // 다운 단계
 haloStage(n){
  const h=this.halo;if(!h||!h.on||h.goDark)return;
  while(h.stage<n&&h.stage<4){h.stage++;const s=h.stage;
   if(s===1){this.haloCrack();h.tilt0.set(.04,0,.07);}
   else if(s===2){this.haloCrack();this.haloCrack();h.tilt0.set(.09,-.05,-.12);}
   else if(s===3){this.haloBreakWedge();h.tilt0.set(.12,.06,.19);}
   else{h.goDark=true;h.fallAt=G.time+.55;}
  }
  if(!h.goDark)AUDIO.haloCrack(.9);h.sp.kick(rnd(-2,2),rnd(-2,2),rnd(-3,3));
 },
 // 금: 고리 띠를 가로지르는 들쭉날쭉한 선(그 순간 같은 각도에 두 고리 모두)
 haloCrack(a){
  const h=this.halo;if(!h)return;if(a==null)a=rnd(.3,PI-.3);
  for(const [mesh,tex] of [[h.inner,h.T.tri],[h.outer,h.T.zod]]){
   const la=((a-mesh.rotation.z)%TAU+TAU)%TAU,c=tex.userData.canvas,g=tex.userData.ctx,W=c.width,Hh=c.height;
   let x=(1-la/TAU)*W;const pts=[];for(let i=0;i<=6;i++){pts.push([x,-4+i*(Hh+8)/6]);x+=rnd(-10,10);}
   const path=(dx,dy)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0]+dx,p[1]+dy):g.moveTo(p[0]+dx,p[1]+dy));};
   g.save();g.globalCompositeOperation='source-atop';g.lineCap='round';g.lineJoin='round';
   path(0,0);g.strokeStyle='rgba(36,16,6,.92)';g.lineWidth=6;g.stroke();
   path(2,1);g.strokeStyle='rgba(255,250,228,.7)';g.lineWidth=2;g.stroke();
   const k=1+Math.floor(Math.random()*4),p=pts[k],dx=rnd(14,28)*(Math.random()<.5?-1:1);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+dx*.5,p[1]+rnd(6,12));g.lineTo(p[0]+dx,p[1]+rnd(14,22));g.strokeStyle='rgba(36,16,6,.85)';g.lineWidth=4;g.stroke();
   g.restore();tex.needsUpdate=true;
  }
 },
 // 한 조각이 떨어져 나간다: 지금 그림을 복사해 조각을 만들고, 원래 고리에서는 그 구간을 지운다
 haloBreakWedge(a){
  const h=this.halo;if(!h||h.broken)return;h.broken=true;h.baseI=h.inner.rotation.z;h.baseO=h.outer.rotation.z;h.freeze=0;
  if(a==null)a=PI/2+rnd(.45,1.1)*(Math.random()<.5?1:-1);
  const span=rnd(.6,.78),a0=a-span/2,a1=a+span/2,piece=new THREE.Group();h.tilt.add(piece);
  const clearRange=(g,x0,x1,Hh)=>{g.save();g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(x0,-2);for(let y=0;y<=Hh;y+=Hh/5)g.lineTo(x0+rnd(-7,7),y);g.lineTo(x0,Hh+2);g.lineTo(x1,Hh+2);for(let y=Hh;y>=0;y-=Hh/5)g.lineTo(x1+rnd(-7,7),y);g.lineTo(x1,-2);g.closePath();g.fill();g.restore();};
  const cut=(mesh,tex,mat,r0,r1)=>{
   const rz=mesh.rotation.z,c=tex.userData.canvas,W=c.width,Hh=c.height;
   const cc=document.createElement('canvas');cc.width=W;cc.height=Hh;cc.getContext('2d',TEX_CTX).drawImage(c,0,0);
   const t2=new THREE.CanvasTexture(cc);t2.encoding=THREE.sRGBEncoding;t2.wrapS=THREE.RepeatWrapping;const m2=mat.clone();m2.map=t2;this.disposables.push(t2,m2);
   let la0=((a0-rz)%TAU+TAU)%TAU;const la1=la0+span;
   const pm=mk(polarRing(r0,r1,24,la0,la1),m2,piece,{cast:false,receive:false});pm.rotation.z=rz;pm.position.z=mesh.position.z;pm.renderOrder=mesh.renderOrder;
   const g=tex.userData.ctx,X=l=>(1-l/TAU)*W;
   if(la1<=TAU)clearRange(g,X(la1),X(la0),Hh);else{clearRange(g,0,X(la0),Hh);clearRange(g,X(la1-TAU),W,Hh);}
   tex.needsUpdate=true;
  };
  cut(h.inner,h.T.tri,h.M.tri,HALO.R0,HALO.R1);cut(h.outer,h.T.zod,h.M.zod,HALO.R2,HALO.R3);cut(h.flames,h.T.flame,h.M.flame,HALO.R3-.004,HALO.RF);
  h.rims.forEach((m,i)=>{const [r,tb]=h.RIM[i];m.geometry.dispose();m.geometry=new THREE.TorusGeometry(r,tb,6,110,TAU-span);m.rotation.z=a1;
   const pr=mk(new THREE.TorusGeometry(r,tb,6,16,span),h.M.gold,piece,{p:[0,0,.0015],cast:false,receive:false});pr.rotation.z=a0;});
  const corners=[];for(const r of [HALO.R0,HALO.RF*.92])for(const q of [a0,a,a1])corners.push(V3(Math.cos(q)*r,Math.sin(q)*r,0));
  piece.updateWorldMatrix(true,true);const dirW=V3(Math.cos(a),Math.sin(a),0).transformDirection(h.tilt.matrixWorld);
  scene.attach(piece);
  this.bits=this.bits||[];this.bits.push({obj:piece,v:dirW.multiplyScalar(rnd(1,1.5)).add(V3(rnd(-.2,.2),rnd(.6,1),rnd(.3,.6))),w:V3(rnd(-6,6),rnd(-6,6),rnd(-8,8)),r:.05,corners,bounce:.3,sound:'halo',flat:true});
  AUDIO.haloCrack(1.2);
 },
 // 꺼진 후광이 머리 위로 빠져 목에 걸린다: 머리 위로 들렸다가 수평으로 누워 뚝 떨어지고, 어깨에 쨍그랑 얹혀 덜렁거린다
 haloDrop(){
  const h=this.halo;if(!h||h.falling)return;h.on=false;h.goDark=true;h.dark=Math.max(h.dark,.7);this.haloPaint(h.bright);
  h.plate.visible=false;
  const chest=this.bones.chest,r=h.root;r.updateWorldMatrix(true,true);chest.attach(r);
  r.quaternion.multiply(h.tilt.quaternion);h.tilt.quaternion.identity();h.tilt.rotation.set(0,0,0);
  // 앞쪽이 가슴에 얹혀 비스듬히 걸린다(수평으로 누우면 정면에서 목을 가로지르는 막대처럼 보였다)
  const q1=new THREE.Quaternion().setFromEuler(new THREE.Euler(.62,0,rnd(.1,.2)*(Math.random()<.5?-1:1))).multiply(new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),-PI/2));
  // 뒤로 나자빠져 있을 때(가슴이 하늘을 볼 때)는 목에 걸릴 수 없다: 머리 옆 바닥으로 미끄러져 내려가 눕는다(떨어진 조각과 같은 물리)
  const upW=V3(0,0,1).transformDirection(chest.matrixWorld);
  const slumping=this.state==='dead'||(this.down&&this.down.type==='final');
  if(upW.y>.55||slumping){
   r.updateWorldMatrix(true,true);scene.attach(r);h.falling={t:0,loose:true};
   const side=Math.random()<.5?-1:1,corners=[];for(let i=0;i<8;i++){const q=i/8*TAU;corners.push(V3(Math.cos(q)*HALO.RF,Math.sin(q)*HALO.RF,0));}
   // 머리 뒤에서 몸 옆으로 미끄러져 바닥에 눕는다(몸 위에 걸쳐지지 않게 옆으로 멀리). 이미 쓰러졌으면 목·몸 밖에서 시작하게 위로 조금 띄운다
   r.position.y=Math.max(r.position.y,.9);
   this.bits=this.bits||[];this.bits.push({obj:r,v:V3(side*rnd(1.4,1.8),.4,rnd(.2,.5)),w:V3(rnd(-1,1),rnd(-1,1),side*rnd(2,3.5)),r:.03,corners,bounce:.2,sound:'halo',flat:true});
   return;
  }
  h.falling={t:0,p0:r.position.clone(),q0:r.quaternion.clone(),pTop:V3(0,1.02,.03),p1:V3(0,.335,.02),q1,landed:false,wob:new Spring3(70,4.5),taps:0};
  AUDIO.haloCrack(.7);
 },
 haloFallUpdate(dt){
  const h=this.halo,f=h.falling,r=h.root;f.t+=dt;
  if(h.dark<1){h.dark=Math.min(1,h.dark+dt/.45);this.haloPaint(h.bright);}
  if(f.loose)return;// 바닥에 떨어져 눕는 중: updateBits가 움직인다
  const T1=.3,T2=.62;
  if(f.t<T1){const u=smooth(f.t/T1);r.position.copy(f.p0).lerp(f.pTop,u);r.quaternion.copy(f.q0).slerp(f.q1,u);return;}
  if(f.t<T2){const u=easeIn((f.t-T1)/(T2-T1));r.position.copy(f.pTop).lerp(f.p1,u);r.quaternion.copy(f.q1);return;}
  if(!f.landed){f.landed=true;f.land=f.t;AUDIO.haloLand(1);f.wob.kick(rnd(2.5,4)*(Math.random()<.5?-1:1),0,rnd(3,5)*(Math.random()<.5?-1:1));f.vy=-.5;f.y=0;
   if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate(18);}catch(_){}}
  // 어깨 위에서 덜렁: 기울기 스프링 + 살짝 튀어 오름
  f.wob.step(dt);f.vy+=(-260*f.y-9*f.vy)*dt;f.y+=f.vy*dt;
  _hq1.setFromEuler(_he.set(f.wob.X,0,f.wob.Z));r.quaternion.copy(_hq1).multiply(f.q1);r.position.copy(f.p1);r.position.y+=f.y;
  const k=f.t-f.land;if(f.taps<4&&k>.12+f.taps*.16*(1-f.taps*.12)){f.taps++;AUDIO.haloTap(.8-f.taps*.15);}
 },

 /* ---- 정체 ---- */
 repAfterHit(heavy){
  if(this.headDestroyed||this.repFull)return;const now=G.time,lv=Math.min(4,G.kd);if(now<(this.repCool||0))return;
  if(Math.random()>[.14,.26,.42,.6,.75][lv]*(heavy?1:.45))return;
  this.repCool=now+rnd(2,3.4)/(1+lv*.3);this.repAt=now+rnd(.32,.5);this.repTry=0;this.repDur=[.05,.07,.12,.2,.3][lv];
 },
 blinkMembrane(){if(this.memK<0||this.memK==null)this.memK=0;},
 flickTongue(quiet){const f=this.headKind==='rep'?this.repFork:this.fork;if(!f||f.k>=0)return;f.k=0;if(!quiet)AUDIO.hiss(1);},
 // 찢어진 살갗 아래 비늘(첫 다운 뒤로 얼굴에서, 다운이 쌓일수록 자주)
 maybeScales(seg,pt,n,force){
  if(!force){if(G.kd<1||!/^(head|jaw)$/.test(seg))return;if(Math.random()>[0,.3,.5,.7,.85][Math.min(4,G.kd)])return;}
  BLOOD.decal('scales',seg,pt,n,rnd(.026,.036),{angle:rnd(-.5,.5)});
 },
 updateReveal(dt){
  if(this.headGone||this.headKind==='rep')return;// 재생 중이거나 이미 파충류 머리면 옛 인간 얼굴 연출은 건너뛴다
  const rdt=this._rdt||dt,t=G.time;
  // 크게 맞은 뒤 눈을 뜰 때 몇 프레임
  if(this.repAt&&t>=this.repAt){if(this.fx&&this.fx.lidU<.35&&this.repTry<4){this.repAt=t+.1;this.repTry++;}else{this.repAt=0;this.repFlash=this.repDur;}}
  if(this.repFlash>0)this.repFlash-=rdt;
  // 뱀눈이 드러나면 곧 막이 한 번 지나간다
  if(this.memAt&&t>=this.memAt){this.memAt=0;this.blinkMembrane();}
  // 세 번째 다운(엉덩방아) 중에 막이 한 번 지나간다
  if(this.state==='down'&&this.down&&this.down.type==='floor'&&!this.memOnce&&this.stateT>1.3){this.memOnce=true;this.blinkMembrane();}
  // 다 쓰러지면: 눈을 뜨고 파충류 눈으로, 비늘이 드러나고, 막 깜빡임·혀 날름이 반복된다
  if(this.state==='dead'){
   if(!this.reveal){this.reveal={t0:t,nb:t+1.25,nf:t+1.95,ns:t+.25,sc:0};}
   const R=this.reveal,k=t-R.t0;
   if(k>.45){this.repFull=true;this.deadStare=Math.min(1,(this.deadStare||0)+rdt/.6);}
   if(t>=R.ns&&R.sc<6){R.ns=t+.28;R.sc++;this.revealScale(R.sc);}
   if(t>=R.nb){R.nb=t+rnd(3.4,5.6);this.blinkMembrane();}
   if(t>=R.nf){R.nf=t+rnd(4.2,7);this.flickTongue();}
   if(this.deadStare>0)this.gazeTarget.copy(camera.position);
  }
  // 막: 코 쪽에서 덮고 지나간다
  if(this.memK>=0){this.memK+=rdt/.52;const k=this.memK,m=k<.4?smooth(k/.4):k<.55?1:1-smooth((k-.55)/.45);MEM_TEX.offset.x=.5*m;
   for(const e of this.eyes)e.mem.visible=m>.01&&(!e.ejected||e.lizard)&&!this.headDestroyed;if(k>=1){this.memK=-1;MEM_TEX.offset.x=0;for(const e of this.eyes)e.mem.visible=false;}}
  // 혀 날름
  const f=this.fork;if(f&&f.k>=0){f.k+=rdt/.76;const k=f.k,e=k<.2?smooth(k/.2):k<.36?1-.55*smooth((k-.2)/.16):k<.54?.45+.55*smooth((k-.36)/.18):1-smooth((k-.54)/.28);
   const L=this.lipPtsL[6];f.g.position.set(0,L.y+.01,.198);
   f.g.visible=e>.03;f.g.scale.set(1,1,Math.max(.02,e));f.g.rotation.x=.68+Math.sin(t*40)*.18*e;if(k>=1){f.k=-1;f.g.visible=false;}}
 },
 // 다 쓰러진 뒤 얼굴 여기저기에 비늘 자국
 revealScale(i){
  const F=this.face;if(!F)return;F.updateWorldMatrix(true,false);
  const spots=[[-.15,-.03],[.155,-.05],[-.175,-.13],[.17,-.14],[-.125,.148],[.115,.15]],s=spots[(i-1)%spots.length];
  if(this.headDestroyed&&s[1]>-.02)return;
  const p=F.localToWorld(V3(s[0],s[1],.3)),n=V3(s[0]*1.6,s[1]*.8,1).transformDirection(F.matrixWorld).normalize();
  const pr=BLOOD.project(p.addScaledVector(n,-.1),n,.16,this.flow.head);if(pr)this.maybeScales(pr.seg||'head',pr.point,pr.normal,true);
 },
});
const _invBM=new THREE.Matrix4();function _invB(b){b.updateWorldMatrix(true,false);return _invBM.copy(b.matrixWorld).invert();}
/* ===== 7. 내 손과 무기 =====
 * 1인칭 손은 따로 그린다(vmScene). 누른 화면 위치로 주먹·무기 끝이 날아가 닿고, 닿는 순간 진행 쪽에 알린다. */
const VM=(()=>{
 const root=new THREE.Group();vmScene.add(root);
 const S=(hex,o)=>STD(hex,o);
 const M={skin:S('#e8ab86',{roughness:.5}),skinD:S('#cf8f6c',{roughness:.55}),nail:S('#f2c9b4',{roughness:.3}),cuff:S('#46557a',{roughness:.7}),
  steelD:S('#5f6670',{roughness:.4,metalness:.8}),blade:S('#d7dee4',{roughness:.16,metalness:.92}),edge:S('#f4f8fb',{roughness:.08,metalness:.95}),
  handle:S('#2b2522',{roughness:.45}),rivet:S('#d8c08a',{roughness:.3,metalness:.8}),gunD:S('#1b1c21',{roughness:.5,metalness:.4}),brass:S('#d9a84a',{roughness:.28,metalness:.88}),
  blood:S('#1d4bc4',{roughness:.12})};
 /* 식칼 날: 흰 판자처럼 보이지 않게 강철 결을 그린다. 날 모양 좌표(가로 0~.235, 세로 -.04~.04)를 그대로 텍스처 좌표로 쓴다.
  * 위(등)는 어둡고, 아래 날 쪽으로 갈수록 밝게 갈린 면(배)과 번쩍이는 날선 */
 const bladeTex=canvasTex(512,176,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#6f7a85');gr.addColorStop(.12,'#8d98a3');gr.addColorStop(.5,'#a9b3bc');gr.addColorStop(.66,'#9aa5af');gr.addColorStop(.69,'#68737e');gr.addColorStop(.72,'#cdd6dd');gr.addColorStop(.93,'#e6edf2');gr.addColorStop(1,'#ffffff');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){const y=rnd(0,h*.66),a=rnd(.03,.09);g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'40,48,60'},${a})`;g.fillRect(rnd(-40,w*.6),y,rnd(80,w),1);}
  for(let i=0;i<40;i++){const y=rnd(h*.72,h),a=rnd(.04,.1);g.fillStyle=`rgba(255,255,255,${a})`;g.fillRect(rnd(-40,w*.6),y,rnd(60,w),1);}
  // 손잡이 쪽 받침 그늘과 각인
  const sh=g.createLinearGradient(0,0,w*.12,0);sh.addColorStop(0,'rgba(40,46,56,.55)');sh.addColorStop(1,'rgba(40,46,56,0)');g.fillStyle=sh;g.fillRect(0,0,w*.12,h);
  g.strokeStyle='rgba(50,58,70,.55)';g.lineWidth=2;g.strokeRect(w*.12,h*.22,w*.07,h*.22);g.beginPath();g.moveTo(w*.135,h*.33);g.lineTo(w*.175,h*.33);g.moveTo(w*.155,h*.26);g.lineTo(w*.155,h*.4);g.stroke();
 });
 bladeTex.repeat.set(1/.235,1/.08);bladeTex.offset.set(0,.5);
 /* 칼에 묻은 피: 칼끝 쪽에 번진 얼룩 + 날 쪽으로 흐른 줄기 + 젖은 반사. 같은 날 모양 좌표 */
 const bloodTex=canvasTex(512,176,(g,w,h)=>{
  g.clearRect(0,0,w,h);
  const edge=(x)=>h*(.2+.1*Math.sin(x*.021)+.06*Math.sin(x*.057+1.3));
  g.beginPath();g.moveTo(w,h*.08);for(let x=w;x>=w*.42;x-=8)g.lineTo(x,edge(x)+(x<w*.5?(w*.5-x)*.9:0));g.lineTo(w*.42,h);g.lineTo(w,h);g.closePath();
  const gr=g.createLinearGradient(w*.4,0,w,0);gr.addColorStop(0,'rgba(18,52,150,.55)');gr.addColorStop(.35,'rgba(16,48,148,.86)');gr.addColorStop(1,'rgba(12,38,128,.95)');g.fillStyle=gr;g.fill();
  for(let i=0;i<6;i++){const x=rnd(w*.46,w*.95),y0=edge(x)+rnd(0,h*.15),len=rnd(h*.25,h*.6);g.fillStyle='rgba(14,44,140,.9)';g.fillRect(x-3,y0,6,len);g.beginPath();g.arc(x,y0+len,5.5,0,TAU);g.fill();}
  for(let i=0;i<9;i++){const x=rnd(w*.3,w*.5),y=rnd(h*.35,h*.95),r=rnd(3,9);g.fillStyle='rgba(16,48,150,.75)';g.beginPath();g.ellipse(x,y,r*1.6,r,0,0,TAU);g.fill();}
  g.strokeStyle='rgba(150,190,255,.55)';g.lineWidth=2.5;g.lineCap='round';for(let i=0;i<5;i++){const y=rnd(h*.45,h*.9);g.beginPath();g.moveTo(rnd(w*.5,w*.7),y);g.lineTo(rnd(w*.8,w*.97),y+rnd(-6,6));g.stroke();}
 });
 bloodTex.repeat.set(1/.235,1/.08);bloodTex.offset.set(0,.5);
 M.blade=S('#ffffff',{map:bladeTex,roughness:.3,metalness:.55});M.edge=S('#f4f8fb',{roughness:.12,metalness:.8});
 M.blood=new THREE.MeshStandardMaterial({map:bloodTex,transparent:true,depthWrite:false,roughness:.14,metalness:0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 // 칼이 몸에 들어간 만큼은 안 보이게: 피부 자리에 자르는 면을 두고 칼날·칼에 묻은 피에만 적용한다
 const clip=new THREE.Plane(new THREE.Vector3(0,0,1),1e3);
 renderer.localClippingEnabled=true;
 for(const m of [M.blade,M.edge,M.blood])m.clippingPlanes=[clip];
 let clipOn=false;
 function setClip(T,dir){clip.normal.copy(dir).negate();clip.constant=dir.dot(T);clipOn=true;}

 /* ---- 내 손 만들기 ----
  * 손 좌표(주먹 기준): +z 손가락 마디가 향하는 쪽, +y 손등, 엄지는 -s·x 쪽.
  * +z를 화면 안으로 돌려 쓰므로 해부학적 오른손은 s=-1, 왼손은 s=1이다.
  * 손등(둥근 상자) + 마디 네 개 + 세 마디 손가락 네 개 + 두 마디 엄지 + 손목. 손가락은 마디(기준점)에서 시작해
  * 주어진 각도만큼 안으로 꺾이며 이어지므로, 도구를 쥘 때는 각도만 바꿔 자루를 감싸게 한다.
  * M을 주면 주먹 좌표를 그 행렬로 옮겨 그린다(칼·총은 자루 축에 맞춰 돌려 둔다). */
 function roundedBox(w,h,d,r){
  const sh=new THREE.Shape(),x=-w/2,y=-h/2;
  sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);
  const g=new THREE.ExtrudeGeometry(sh,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:4,steps:1,curveSegments:5});g.translate(0,0,-(d-r*2)/2);return g;
 }
 const DEG=PI/180,_hq=new THREE.Quaternion(),_hv=V3();
 function handSeg(parent,mat,a,b,r0,r1){const d=_hv.subVectors(b,a),len=d.length();if(len<1e-5)return;const m=mk(cylGeo(r1,r0,len,14,false),mat,parent,{p:[(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2]});m.quaternion.setFromUnitVectors(UP,d.divideScalar(len));return m;}
 function handBall(parent,mat,p,r){return mk(sphereGeo(16),mat,parent,{p:[p.x,p.y,p.z],s:r,cast:false});}
 // 손톱: 끝마디 등쪽에 납작하게. d=끝마디 방향, n=그 등쪽 방향
 function handNail(parent,tip,d,n,r,aligned=false){const p=tip.clone().addScaledVector(d,-r*.55).addScaledVector(n,r*(aligned?.94:.72));const m=mk(sphereGeo(10),M.nail,parent,{p:[p.x,p.y,p.z],s:[r*.62,r*.22,r*.82],cast:false});
  if(aligned){const z=d.clone().normalize(),y=n.clone().addScaledVector(z,-n.dot(z)).normalize(),x=V3().crossVectors(y,z).normalize();m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));}
  else m.quaternion.setFromUnitVectors(UP,n.clone().normalize());return m;
 }
 // 무기 손가락은 마디별 원통을 겹치지 않고 하나의 곡면으로 잇는다. 관절 위치와 파지 간격은 유지한다.
 function gripFinger(parent,pts,radii){
  const endDir=pts[pts.length-1].clone().sub(pts[pts.length-2]).normalize(),tipR=radii[radii.length-1];
  const path=pts.map(p=>p.clone());path.push(path[path.length-1].clone().addScaledVector(endDir,tipR));
  const curve=new THREE.CatmullRomCurve3(path),segments=32,sides=16;
  const geo=new THREE.TubeGeometry(curve,segments,1,sides,false),pos=geo.attributes.position;
  const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+path[i].distanceTo(path[i-1]));
  const total=lengths[lengths.length-1],capAt=lengths[lengths.length-2];
  for(let i=0;i<=segments;i++){
   const t=i/segments,dist=t*total,center=curve.getPointAt(t);let radius;
   if(dist>=capAt)radius=tipR*Math.sqrt(Math.max(.00001,1-((dist-capAt)/tipR)**2));
   else{let j=0;while(j<pts.length-2&&dist>lengths[j+1])j++;radius=lerp(radii[j],radii[j+1],smooth((dist-lengths[j])/(lengths[j+1]-lengths[j])));}
   for(let j=0;j<=sides;j++){const k=i*(sides+1)+j;pos.setXYZ(k,center.x+(pos.getX(k)-center.x)*radius,center.y+(pos.getY(k)-center.y)*radius,center.z+(pos.getZ(k)-center.z)*radius);}
  }
  pos.needsUpdate=true;geo.computeVertexNormals();
  const normal=geo.attributes.normal;
  for(let i=0;i<=segments;i++){const t=i/segments,q=(t*total-capAt)/tipR;if(q<0)continue;const center=curve.getPointAt(t),tangent=curve.getTangentAt(t),k=Math.sqrt(Math.max(0,1-q*q));
   for(let j=0;j<=sides;j++){const id=i*(sides+1)+j,n=V3().fromBufferAttribute(pos,id).sub(center).normalize().multiplyScalar(k).addScaledVector(tangent,q).normalize();normal.setXYZ(id,n.x,n.y,n.z);}
  }
  normal.needsUpdate=true;geo.computeBoundingSphere();mk(geo,M.skin,parent,{cast:false});
 }

 // 손바닥 덩어리(한 번 빚어 두고 복사): 납작한 둥근 상자에 엄지 두덩이·새끼 쪽 두덩이를 녹여 붙인다. 손목 쪽이 조금 좁다
 const PALM_GEO=((s,wrist,thumb)=>{const {ell,cap,smin}=SCULPT;const box=(x,y,z,cx,cy,cz,bx,by,bz,r)=>{const qx=Math.abs(x-cx)-bx,qy=Math.abs(y-cy)-by,qz=Math.abs(z-cz)-bz;return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-r;};
  const sdf=(x,y,z)=>{const taper=1-.1*Math.max(0,(-.012-z)/.03);let d=box(x/taper,y,z,0,-.002,-.012,.03,.0055,.017,.013);
   d=smin(d,ell(x,y,z,-s*.031,-.012,-.008,.021,.017,.028),.02);d=smin(d,ell(x,y,z,s*.027,-.008,-.022,.015,.015,.03),.016);
   if(wrist){d=smin(d,ell(x,y,z,wrist.x,wrist.y,wrist.z,.029,.027,.03),.016);
    const kx=[-.033,-.011,.011,.033],ky=[.012,.013,.012,.01],kz=[.025,.027,.025,.02],kr=[.0152,.0158,.0146,.0126];
    for(let i=0;i<4;i++)d=smin(d,ell(x,y,z,kx[i]*s,ky[i],kz[i],kr[i]*1.06,kr[i],kr[i]*1.1),.009);
    if(thumb)d=smin(d,cap(x,y,z,-s*.031,-.012,-.008,thumb.x,thumb.y,thumb.z,.017,.018),.014);
   }return d;};
  return SCULPT.star(sdf,V3(0,-.003,-.012),44,32,.1,{smooth:1});});
 const PALM_R=PALM_GEO(1),PALM_L=mirrorX(PALM_GEO(1).clone());
 function buildHand(s,P,Mx){
  const g=new THREE.Group();const T=p=>Mx?p.applyMatrix4(Mx):p;const Td=d=>Mx?d.transformDirection(Mx):d;
  // 손등·손바닥 덩어리
  {const wrist=P.smoothGrip?V3(...P.wristHand).applyMatrix4(Mx.clone().invert()):null;const thumb=wrist?V3(...P.thumb[0]).applyMatrix4(Mx.clone().invert()):null;const pg=wrist?PALM_GEO(s,wrist,thumb):(s<0?PALM_L:PALM_R).clone();if(Mx)pg.applyMatrix4(Mx);mk(pg,M.skin,g);}
  // 손목(도구를 쥘 때는 소매가 이어지는 자리를 따로 두므로 짧게)
  {if(P.wristHand){
    // 무기 손은 손바닥 아래의 실제 접점에서 팔뚝으로 잇는다. 옆으로 돌린 주먹 손목을 남기지 않는다.
    const a=V3(...P.wristHand);if(!P.smoothGrip)handBall(g,M.skin,a,.029);g.userData.wrist=a;
   }else{const a=T(V3(0,-.004,-.038)),b=T(V3(0,-.005,P.wristLen==null?-.125:-.038-P.wristLen));handSeg(g,M.skin,a,b,.029,.034);}}
  // 마디 네 개와 손가락
  const KX=[-.033,-.011,.011,.033],KR=[.0152,.0158,.0146,.0126],KY=[.012,.013,.012,.01],KZ=[.025,.027,.025,.02];
  for(let i=0;i<4;i++){
   const F=P.fingers[i],B=V3(KX[i]*s,KY[i],KZ[i]);
   if(!P.smoothGrip)handBall(g,M.skin,T(B.clone()),KR[i]*1.06);
   const rads=[KR[i]*.95,KR[i]*.86,KR[i]*.78,KR[i]*.68];
   let pts;
   if(F.pts){pts=[T(B.clone()),...F.pts.map(p=>V3(p[0],p[1],p[2]))];}
   else{pts=[B.clone()];let ang=0,p=B.clone();
    for(let k=0;k<3;k++){ang+=F.a[k]*DEG;const d=V3(s*(F.side||0),-Math.sin(ang),Math.cos(ang)).normalize();p=p.clone().addScaledVector(d,F.L[k]);pts.push(p);}
    pts=pts.map(p=>T(p));}
   if(P.smoothGrip)gripFinger(g,pts,rads);
   else for(let k=0;k<3;k++){handSeg(g,M.skin,pts[k],pts[k+1],rads[k],rads[k+1]);handBall(g,M.skin,pts[k+1],rads[k+1]);}
   if(F.nail!==false){const d=V3().subVectors(pts[3],pts[2]).normalize();let n;
    if(F.pts){n=F.nailNormal?V3(...F.nailNormal):Td(V3(0,1,0));n.addScaledVector(d,-n.dot(d)).normalize();}
    else{const ang=(F.a[0]+F.a[1]+F.a[2])*DEG;n=Td(V3(0,Math.cos(ang),Math.sin(ang)));}
    handNail(g,pts[3],d,n,rads[3],P.smoothGrip);}
  }
  // 엄지: 두덩이에서 시작하는 세 점(뿌리·마디·끝). 주먹 좌표 또는 손 좌표(P.thumbHand)로 준다
  {const pts=P.thumbHand?P.thumb.map(p=>V3(p[0],p[1],p[2])):P.thumb.map(p=>T(V3(p[0]*s,p[1],p[2])));const R=P.thumbR;
   if(P.smoothGrip)gripFinger(g,pts,R);
   else for(let k=0;k<pts.length-1;k++){handSeg(g,M.skin,pts[k],pts[k+1],R[k],R[k+1]);handBall(g,M.skin,pts[k+1],R[k+1]*(k===pts.length-2?1:1.02));}
   const n=pts.length-1,d=V3().subVectors(pts[n],pts[n-1]).normalize(),nn=P.thumbNail?(P.thumbHand?V3(...P.thumbNail):Td(V3(P.thumbNail[0]*s,P.thumbNail[1],P.thumbNail[2]))):null;
   if(nn){nn.addScaledVector(d,-nn.dot(d)).normalize();handNail(g,pts[n],d,nn,R[n],P.smoothGrip);}}
  g.updateMatrixWorld(true);mergeChildren(g);
  return g;
 }
 /* 맨주먹: 손가락을 꽉 말아 쥐고 엄지가 검지·중지 앞을 가로지른다 */
 const FIST_POSE={fingers:[{a:[74,96,70],L:[.04,.027,.021]},{a:[75,98,72],L:[.042,.028,.022]},{a:[76,96,70],L:[.04,.027,.021]},{a:[72,90,66],L:[.032,.022,.018]}],
  thumb:[[-.04,-.007,-.014],[-.051,-.022,.016],[-.036,-.037,.05],[-.008,-.035,.06]],thumbR:[.017,.0155,.0138,.0122],thumbNail:[0,-.5,1]};
 function fist(parent,s){const g=buildHand(s,FIST_POSE);parent.add(g);return g;}
 /* 팔뚝+소매: +y 방향으로. 소매는 화면 밖 어깨 자리까지 이어진다(팔을 뻗어도 팔이 허공에서 끊기지 않게).
  * 길이는 매 프레임 손목~어깨 거리에 맞춰 늘인다. 천 주름은 결 무늬로 */
 const sleeveTex=canvasTex(64,256,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#26304a');gr.addColorStop(.35,'#3a4870');gr.addColorStop(.6,'#33406a');gr.addColorStop(1,'#222b44');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){const y=rnd(0,h),t=rnd(3,9);const f=g.createLinearGradient(0,y-t,0,y+t);f.addColorStop(0,'rgba(10,14,30,0)');f.addColorStop(.5,'rgba(10,14,30,.28)');f.addColorStop(1,'rgba(10,14,30,0)');g.fillStyle=f;g.fillRect(0,y-t,w,t*2);
   g.fillStyle='rgba(150,170,220,.12)';g.fillRect(0,y+t*.7,w,1.5);}
  for(let x=0;x<w;x+=3){g.fillStyle=`rgba(255,255,255,${x%6?.03:.05})`;g.fillRect(x,0,1,h);}
 },{repeat:[2,1]});
 sleeveTex.wrapS=THREE.RepeatWrapping;
 const sleeveMat=S('#ffffff',{map:sleeveTex,roughness:.82});
 const sleeveGeo=(()=>{const g=cylGeo(.064,.047,1,20,true);g.translate(0,.5,0);return g;})();
 const forearmGeo=cylGeo(.028,.034,.14,16),gripForearmGeo=new THREE.LatheGeometry([[0,-.025],[.014,-.018],[.024,-.006],[.028,.015],[.031,.045],[.029,.09],[.028,.125],[0,.125]].map(p=>new THREE.Vector2(...p)),20);
 function arm(){const g=grp(root);const sl=grp(g,[0,.108,0]);mk(sleeveGeo,sleeveMat,sl,{cast:false});
  const skin=mk(forearmGeo,M.skin,g,{p:[0,.055,0]});const cf=mk(cylGeo(.05,.05,.034,20),M.cuff,g,{p:[0,.116,0]});return {g,sl,cf,skin};}
 const R={hand:grp(root),arm:arm()},L={hand:grp(root),arm:arm()};
 // orient() points local +z away from the camera, reversing local x on screen.
 // Mirror the anatomical models so each thumb faces inward, toward the other hand.
 R.fist=fist(R.hand,-1);L.fist=fist(L.hand,1);R.fist.scale.setScalar(1.02);L.fist.scale.setScalar(1.02);
 // 칼: 폭이 넓고 날선이 곧은 부엌 식도
 const knife=grp(R.hand);knife.name='kitchen-knife';
 const KREACH=.289;// 손에서 칼끝까지
 {const k=knife;const hd=grp(k,[0,.004,-.01]);mk(new THREE.BoxGeometry(.022,.026,.11),M.handle,hd,{p:[0,0,0]});for(const z of [-.035,0,.033])mk(cylGeo(.0042,.0042,.024,8),M.rivet,hd,{p:[0,0,z],r:[0,0,PI/2]});
  mk(new THREE.BoxGeometry(.034,.045,.012),M.steelD,k,{p:[0,.002,.05]});
  const sh=new THREE.Shape();sh.moveTo(0,-.04);sh.lineTo(.18,-.04);sh.quadraticCurveTo(.218,-.038,.235,-.009);sh.lineTo(.235,.004);sh.quadraticCurveTo(.19,.038,.025,.04);sh.lineTo(0,.032);sh.closePath();
  const bg=new THREE.ExtrudeGeometry(sh,{depth:.0026,bevelEnabled:true,bevelThickness:.0008,bevelSize:.0012,bevelSegments:1,curveSegments:10});bg.translate(0,0,-.0013);
  mk(bg,M.blade,k,{p:[0,.004,.054],r:[0,-PI/2,0]});
  mk(new THREE.BoxGeometry(.0009,.0035,.18),M.edge,k,{p:[0,-.036,.144],cast:false});
  // 칼에 묻은 피: 날 모양 그대로 오린 얇은 판 두 장(양면). 칼끝 쪽에 번지고 날 쪽으로 흘러내린 자국
  const bl=grp(k),bsg=new THREE.ShapeGeometry(sh,10);
  for(const x of [-.0026,.0026])mk(bsg,M.blood,bl,{p:[x,.004,.054],r:[0,-PI/2,0],cast:false,receive:false});
  bl.visible=false;k.userData.blood=bl;}
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
  mk(new THREE.BoxGeometry(.02,.012,.03),S('#1a1b1f',{roughness:.5}),g,{p:[0,-.083,-.056],r:[-.2,0,0]});
  g.userData={slide};
  // 총구 불꽃: 겹친 판 세 장(앞·위·옆)
  const flTex=canvasTex(128,128,(c,w,h)=>{const r=c.createRadialGradient(64,64,2,64,64,60);r.addColorStop(0,'rgba(255,255,245,1)');r.addColorStop(.22,'rgba(255,226,140,.98)');r.addColorStop(.55,'rgba(255,150,46,.55)');r.addColorStop(1,'rgba(255,100,20,0)');c.fillStyle=r;c.fillRect(0,0,w,h);c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,236,170,.95)';for(let i=0;i<7;i++){c.save();c.translate(64,64);c.rotate(i/7*TAU+.3);c.beginPath();c.moveTo(0,-6);c.lineTo(rnd(46,62),0);c.lineTo(0,6);c.fill();c.restore();}});
  const fl=new THREE.MeshBasicMaterial({map:flTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const flash=grp(g,[0,.047,.13]);mk(new THREE.PlaneGeometry(.15,.15),fl,flash,{cast:false});mk(new THREE.PlaneGeometry(.07,.24),fl,flash,{r:[PI/2,0,0],p:[0,0,.09],cast:false});mk(new THREE.PlaneGeometry(.24,.07),fl,flash,{r:[0,PI/2,0],p:[0,0,.09],cast:false});
  flash.visible=false;g.userData.flash=flash;
  g.userData.light=new THREE.PointLight(0xffb060,0,1.4,2);g.userData.light.position.set(0,.05,.16);g.add(g.userData.light);
  g.name='pistol';
 }
 /* 도구를 쥔 손: 주먹과 같은 손이지만 손가락이 자루 둘레를 따라 덜 말리고, 엄지는 자루 위에 얹는다.
  * gripFrame: 주먹 좌표를 무기 좌표로 보내는 회전행렬. lat=손의 +x축(오른손의 검지 쪽), dorsal=손등 방향,
  * center=자루 가운데(손 좌표). 주먹 좌표에서 손가락이 감싸는 빈 자리의 가운데(0,-.03,.028)가 center에 오게 옮긴다 */
 function gripFrame(lat,dorsal,center){
  const x=lat.clone().normalize(),y=dorsal.clone().addScaledVector(x,-dorsal.dot(x)).normalize(),z=V3().crossVectors(x,y);
  const m=new THREE.Matrix4().makeBasis(x,y,z);const c=V3(0,-.03,.028).applyMatrix4(m);m.setPosition(center.clone().sub(c));return m;
 }
 // 손잡이 표면과 손가락 살의 두께를 기준으로 감싼다. 짧은 새끼손가락도 자루 안을 통과하지 않는다.
 const KNIFE_FINGERS=[.021,-.001,-.023,-.045].map((z,i)=>{
  const r=[.0152,.0158,.0146,.0126][i],r1=r*.86,r2=r*.78,r3=r*.68;
  return {pts:[[.013+r1,.006,z],[.006,.018+r2,z],[-.011-r3*.9,.017+r3*.8,z]],nailNormal:[0,1,0]};
 });
 const GUN_FINGERS=[{pts:[[-.03,-.003,-.003],[-.017,-.004,.012],[-.004,-.003,.02]],nailNormal:[-1,.2,0]},
  ...[-.026,-.046,-.066].map((y,i)=>{const r=[.0158,.0146,.0126][i],front=-.02+y*.25;
   return {pts:[[-.018,y,front+r*.86+.002],[.014,y,front+r*.78+.002],[.012+r*.68+.002,y,front-.014]],nailNormal:[1,0,0]};})];
 // 오른손 식칼: 검지는 칼날 쪽(+z), 새끼는 자루 끝 쪽(-z). 손바닥 안쪽과 엄지가 눈에 보이도록 감싼다.
 const KNIFE_M=gripFrame(V3(0,0,1),V3(.3,-.954,0),V3(0,.004,-.012));
 const knifeGrip=buildHand(-1,{smoothGrip:true,fingers:KNIFE_FINGERS,wristHand:[-.045,-.04,-.032],
  thumbHand:true,thumb:[[-.022,-.01,.028],[.012,.025,.028],[.033,.015,.008]],thumbR:[.017,.015,.0125],thumbNail:[.5,.8,-.3]},KNIFE_M);
 knifeGrip.name='knife-grip';R.hand.add(knifeGrip);
 // 오른손 권총: 검지는 총 오른쪽(-x)에서 방아쇠로, 엄지는 왼쪽(+x)으로. 뿌리는 손바닥 엄지 두덩이에 잇는다.
 const GUN_M=gripFrame(V3(0,.97,.24),V3(-.8,.6,0),V3(.012,-.039,-.046));
 const gunGrip=buildHand(-1,{smoothGrip:true,fingers:GUN_FINGERS,wristHand:[0,-.035,-.087],
  thumbHand:true,thumb:[[-.004,.006,-.067],[.022,-.002,-.045],[.023,.002,-.012]],thumbR:[.016,.0145,.0125],thumbNail:[.8,.6,0]},GUN_M);
 gunGrip.name='pistol-grip';R.hand.add(gunGrip);
 R.fist.userData.wrist=V3(0,0,-.1);L.fist.userData.wrist=V3(0,0,-.1);
 // 멱살잡이 손(왼손): 네 손가락을 함께 말고 엄지가 검지 옆에서 옷깃을 누른다.
 const GRAB_POSE={fingers:[{a:[56,82,48],L:[.042,.028,.022]},{a:[58,84,50],L:[.044,.029,.023]},{a:[60,82,48],L:[.042,.028,.022]},{a:[58,78,46],L:[.034,.023,.019]}],
  thumb:[[-.04,-.007,-.014],[-.054,-.019,.012],[-.041,-.032,.04],[-.02,-.039,.047]],thumbR:[.017,.0155,.0138,.0122],thumbNail:[0,-.5,1]};
 const grabHand=buildHand(1,GRAB_POSE);grabHand.visible=false;grabHand.userData.wrist=V3(0,-.005,-.1);L.hand.add(grabHand);
 const tools={hand:null,knife,gun};
 // 탄피
 const shells=[];for(let i=0;i<6;i++){const m=mk(cylGeo(.0045,.0045,.016,8),M.brass,root,{cast:false});m.visible=false;shells.push({m,v:V3(),w:V3(),life:0});}
 let shellI=0;

 /* ---- 좌표 ---- */
 const TAN=Math.tan(THREE.MathUtils.degToRad(30));
 function ndc(x,y){return [x/innerWidth*2-1,1-y/innerHeight*2];}
 function at(nx,ny,d,out=V3()){return out.set(nx*TAN*vmCam.aspect*d,ny*TAN*d,-d);}
 const portrait=()=>innerWidth<innerHeight;
 const mTmp=new THREE.Matrix4(),xa=V3(),ya=V3(),za=V3();
 function orient(q,fwd,up){za.copy(fwd).normalize();xa.crossVectors(up,za);if(xa.lengthSq()<1e-8)xa.set(1,0,0);xa.normalize();ya.crossVectors(za,xa);mTmp.makeBasis(xa,ya,za);return q.setFromRotationMatrix(mTmp);}
 function bez(a,b,c,t,out){const u=1-t;return out.set(u*u*a.x+2*u*t*b.x+t*t*c.x,u*u*a.y+2*u*t*b.y+t*t*c.y,u*u*a.z+2*u*t*b.z+t*t*c.z);}
 // 어깨 자리: 화면 아래 양옆(팔이 화면 가운데를 덜 가리게)
 const ANCH={R:V3(.34,-.95,-.04),L:V3(-.34,-.95,-.04)};
 // The wrist follows the forearm, instead of pitching down against an upward reach.
 const gripTarget=V3(),gripForward=V3(),gripOffset=V3(),gripUp=V3(-.15,1,.15);
 function poseCollarGrip(h,x,y){
  at(x-.025,y+.015,.8,gripTarget);
  gripForward.subVectors(gripTarget,h.anch).normalize();
  orient(h.q,gripForward,gripUp);
  gripOffset.set(-.014,-.028,.046).multiplyScalar(h.scale).applyQuaternion(h.q);
  h.p.copy(gripTarget).sub(gripOffset);
 }
 // 도구칸 위쪽 끝(화면 좌표 -1~1)
 function dockY(){const box=measureDock();return box?1-2*box.top/innerHeight:-1;}

 /* ---- 상태 ---- */
 let gripPoint=null;
 function grip(x,y){gripPoint=x==null?null:{x,y};}
 const st={tool:'hand',acts:[],nextHand:'R',time:0,ammo:8,reload:0,recoil:0,slide:0,flash:0,aim:V3(0,0,-1),aimGoal:V3(0,0,-1),lastShot:-9,slash:null,bloody:{},swapT:1,guardLift:1,guardRaising:false};
 function lowerHands(){st.guardLift=0;st.guardRaising=false;st.acts.length=0;st.slash=null;}
 function raiseHands(){computeRest();st.guardRaising=true;}
 function updateGuard(dt){if(st.guardRaising)st.guardLift=Math.min(1,st.guardLift+dt/.55);}
 const rest={R:{p:V3(),q:new THREE.Quaternion()},L:{p:V3(),q:new THREE.Quaternion()}};
 const KN_DIR=V3(-.5,.55,-1).normalize(),KN_UP=V3(.35,1,0);
 const BLADE=t=>t==='knife';
 /* 대기 중인 손은 구도에 맞춘 전경 크기. 칼 접촉 시에는 실제 표적 깊이와 1m 단위를 쓴다.
  * 카메라 갱신에서 손 스케일을 다시 덮어쓰지 않는다: 그 프레임의 찌르기·붙잡힘 크기를 보존한다. */
 let SC=1;
 function setScale(unit){SC=clamp(unit/.49,.45,1);}
 // 날붙이를 들고 있는 자리(화면 오른쪽 아래, 날이 화면 안쪽으로 눕게): 몸을 덜 가린다
 const KREST={x:.76,y:.1,d:.48,dir:V3(-.08,.6,-1).normalize()};
 function computeRest(){
  computeHeld();
  const pr=portrait(),dy=pr?dockY():-1;
  for(const k of ['R','L']){const s=k==='R'?1:-1;const r=rest[k];
   // 왼손은 칼·총을 들 때 안 보이지만, 붙잡힐 때는 주먹 자리에서 나온다
   if(st.tool==='hand'||k==='L'){at(s*(pr?.74:.46),pr?dy+.03:-.76,.56,r.p);orient(r.q,V3(-s*.18,.48,-1),V3(s*.72,.68,.3));}
   else if(st.tool==='knife'){at(pr?KREST.x:.5,pr?dy+KREST.y:-.74,KREST.d,r.p);orient(r.q,KREST.dir,KN_UP);}
   else{at(pr?.6:.36,pr?dy+.16:-.62,.42,r.p);orient(r.q,V3(-.08,.05,-1),UP);}
  }
 }
 const H={R:{p:V3(),q:new THREE.Quaternion(),anch:V3()},L:{p:V3(),q:new THREE.Quaternion(),anch:V3()}};
 /* ---- 붙잡힘: 수혜자들이 내 아래팔을 잡고 늘어진다. 뿌리치면 팔이 휙 돌아온다 ---- */
 const GR={L:0,R:0,goal:{L:0,R:0},shake:-1};
 const held={R:V3(),L:V3()},heldQ={R:new THREE.Quaternion(),L:new THREE.Quaternion()};
 function computeHeld(){const GL=grabLayout();for(const k of ['R','L']){const s=k==='R'?1:-1;at(s*GL.fx,GL.fy,GL.fd,held[k]);orient(heldQ[k],V3(-s*.25,.9,-.5),V3(s*.6,.5,.6));}}
 function setGrab(side,w){GR.goal[side]=w;}
 function shakeOff(){GR.shake=0;}
 function handPos(side,out){return out.copy(H[side].p);}
 function anchorPos(side,out){return out.copy(H[side].anch);}

 function setTool(t){R.fist.visible=t==='hand';knifeGrip.visible=t==='knife';gunGrip.visible=t==='gun';st.tool=t;st.acts.length=0;st.slash=null;st.swapT=0;for(const k in tools)if(tools[k])tools[k].visible=k===t;L.hand.visible=L.arm.g.visible=t==='hand';computeRest();}
 function busy(side){return st.acts.some(a=>a.side===side&&a.t<a.contact+.03);}
 /* 공격 시작: 화면 좌표 sx,sy. kind: jab|hook|upper|stab */
 function bladeTarget(sx,sy,info){
  const [nx,ny]=ndc(sx,sy),hit=info||pickAt(sx,sy);
  camera.updateMatrixWorld(true);
  const point=hit?hit.point.clone().applyMatrix4(camera.matrixWorldInverse):V3(0,0,-2.6);
  const depth=Math.max(.9,-point.z)*Math.tan(camera.fov*PI/360)/TAN;
  return at(nx,ny,depth);
 }
 function attack(kind,sx,sy,info){
  if(G.inputLocked||G.paused||G.mode!=='fight')return false;
  const tool=st.tool;if(tool==='gun')return fire(sx,sy,info);
  // The next fist can launch once the previous contact is retracting.
  // Two rapid taps must not put both fists through the same point at once.
  if(tool==='hand'&&st.acts.some(a=>a.tool==='hand'&&a.t<a.contact+.045))return false;
  let side='R';
  if(tool==='hand'){side=st.nextHand;if(busy(side)){side=side==='R'?'L':'R';if(busy(side))return false;}st.nextHand=side==='R'?'L':'R';}
  else if(st.acts.some(a=>a.t<a.contact+.04))return false;
  if(st.acts.length>2)st.acts.shift();
  const [nx,ny]=ndc(sx,sy),s=side==='R'?1:-1,pr=portrait();
  const target=tool==='hand'?at(nx,ny,.85):bladeTarget(sx,sy,info);
  const a={tool,kind,side,s,sx,sy,info,t:0,target,done:false,hit:null};
  const W=V3(),C=V3(),Q0=new THREE.Quaternion(),Q1=new THREE.Quaternion();
  if(tool==='hand'){
   const fwd=V3().subVectors(target,ANCH[side]).normalize();a.fwd=fwd;
   if(kind==='hook'){at(s*1.1,ny*.5-.15,.75,W);C.set(lerp(W.x,target.x,.15),target.y+.02,lerp(W.z,target.z,.75));orient(Q0,V3(-s*.6,.1,-.5),V3(0,1,.2));orient(Q1,V3(-s*.75,0,-.65),V3(0,1,0));a.dur=[.07,.07,.05,.13];}
   else if(kind==='upper'){at(s*.25,-1.2,.7,W);C.set(target.x,lerp(W.y,target.y,.2),lerp(W.z,target.z,.7));orient(Q0,V3(-s*.1,1,-.3),V3(0,.2,1));orient(Q1,V3(0,.8,-.6),V3(0,.3,1));a.dur=[.07,.075,.05,.13];}
   else{W.copy(rest[side].p).add(V3(s*.02,-.04,.08).multiplyScalar(SC));C.copy(W).lerp(target,.5);C.y+=.03*SC;orient(Q0,V3(-s*.2,.4,-1),V3(s*.72,.68,.3));orient(Q1,fwd,V3(-s*.25,1,0));a.dur=[.04,.055,.045,.12];}
  }else if(BLADE(tool)){
   const reach=KREACH;
   const H0=at(pr?.42:.4,-.74,.42);const dir=V3().subVectors(target,H0).normalize();a.dir1=dir;a.hand1=V3().copy(target).addScaledVector(dir,-reach);
   a.hand0=V3().copy(rest.R.p).add(V3(.02,-.03,.09).multiplyScalar(SC));a.dir0=V3(-.15,.3,-1).normalize();a.pen=.09;a.dur=[.05,.06,.17,.15];
  }
  a.W=W;a.C=C;a.Q0=Q0;a.Q1=Q1;a.contact=a.dur[0]+a.dur[1];a.total=a.dur.reduce((x,y)=>x+y,0);
  st.acts.push(a);AUDIO.whoosh(tool==='hand'?(kind==='jab'?.6:.85):.5,kind);
  return true;
 }
 /* 총: 탄은 무한. 누르면 한 발, 꾹 누르면 연사 */
 let fireCool=0;
 function fire(sx,sy,info){
  if(G.inputLocked||G.paused||G.mode!=='fight')return false;
  if(fireCool>0)return false;
  fireCool=.15;st.recoil=1;st.slide=1;st.flash=.035;st.lastShot=st.time;
  gun.userData.flash.rotation.z=rnd(0,TAU);gun.userData.flash.scale.setScalar(rnd(1.05,1.3));
  const [nx,ny]=ndc(sx,sy);st.aimGoal.copy(at(nx,ny,3)).normalize();st.aim.copy(st.aimGoal);
  const sh=shells[shellI++%shells.length];sh.life=.9;sh.m.visible=true;sh.m.scale.setScalar(SC);gun.updateWorldMatrix(true,false);sh.m.position.copy(gun.localToWorld(V3(.016,.052,.03)));sh.v.set(rnd(.6,.9),rnd(.7,1.1),rnd(.1,.3)).multiplyScalar(SC);sh.w.set(rnd(10,20),rnd(5,10),rnd(10,20));
  AUDIO.gunshot();
  if(st.onFire)st.onFire(sx,sy,info);
  return true;
 }
 function reload(){}
 /* 칼로 긋기: 손가락을 따라 칼끝이 움직이고, 몸에 닿으면 날이 살을 파고든다 */
 function slashStart(sx,sy){if(G.inputLocked||G.paused||G.mode!=='fight')return false;st.slash={sx,sy,px:sx,py:sy,t:0,len:0,lastWhoosh:st.time,touching:false,touchUntil:-1,bite:0};AUDIO.whoosh(.5,'slash');}
 function slashMove(sx,sy){const s=st.slash;if(!s)return;const d=Math.hypot(sx-s.sx,sy-s.sy);s.len+=d;s.px=s.sx;s.py=s.sy;s.sx=sx;s.sy=sy;if(d>14&&st.time-s.lastWhoosh>.18){s.lastWhoosh=st.time;AUDIO.whoosh(.4,'slash');}}
 function slashEnd(){st.slash=null;}

 /* ---- 매 프레임 ---- */
 const tmpP=V3(),tmpQ=new THREE.Quaternion(),tmpQ2=new THREE.Quaternion(),tv=V3(),tv2=V3(),tv3=V3();
 function placeArm(side){
  const h=side==='R'?R:L,ar=h.arm;h.hand.updateMatrix();
  const weaponWrist=side==='R'&&st.tool!=='hand';ar.skin.geometry=weaponWrist?gripForearmGeo:forearmGeo;ar.skin.position.y=weaponWrist?0:.055;
  const k=h.hand.scale.x;
  // 소매가 이어지는 손목 자리: 들고 있는 도구의 손마다 다르다
  const wp=side==='L'&&grabHand.visible?grabHand.userData.wrist:side==='R'&&st.tool==='knife'?knifeGrip.userData.wrist:side==='R'&&st.tool==='gun'?gunGrip.userData.wrist:h.fist.userData.wrist;
  const wrist=tv.copy(wp).applyMatrix4(h.hand.matrix);const A=H[side].anch;const d=tv2.subVectors(A,wrist);const len=d.length();d.normalize();
  ar.g.position.copy(wrist);ar.g.quaternion.setFromUnitVectors(UP,d);ar.g.scale.setScalar(k);
  ar.sl.scale.set(1,Math.max(.05,(len-.08*k)/k),1);
 }
 function update(dt,frozen,rdt){
  // 총 반동·칼 긋기는 멈춤(히트스톱)과 상관없이 실제 시간으로 움직인다(쏘는 순간 바로 튀어야 하니까)
  rdt=rdt==null?dt:rdt;
  st.time+=dt;fireCool=Math.max(0,fireCool-rdt);st.swapT=Math.min(1,st.swapT+rdt*4);
  updateGuard(rdt);
  clipOn=false;
  const sway=Math.sin(st.time*1.6)*.004,sway2=Math.cos(st.time*1.1)*.003,dropIn=(1-easeOut3(st.swapT))*.25;
  for(const k of ['R','L']){H[k].scale=SC;H[k].p.copy(rest[k].p);H[k].p.y+=sway*(k==='R'?1:-1)-dropIn;H[k].p.x+=sway2;H[k].q.copy(rest[k].q);H[k].anch.copy(ANCH[k]);}
  // 인사를 마칠 때까지 손목을 화면 아래에 두고, 그 뒤 두 주먹을 함께 올린다.
  const guardDrop=(1-smoother(st.guardLift))*TAN*.56*1.15;
  for(const k of ['R','L'])H[k].p.y-=guardDrop;
  // 밟을 때 두 손은 조금 들어 균형을 잡고, 발이 팔 위로 치솟아 보이지 않게 한다.
  if(COMBAT.foot&&st.tool==='hand'){
   const t=COMBAT.foot.t+dt,w=smooth(t/.16)*(1-smooth((t-.34)/.23));
   for(const k of ['R','L']){H[k].p.y+=TAN*.56*.24*w;H[k].p.x+=(k==='R'?1:-1)*TAN*vmCam.aspect*.56*.04*w;}
  }
  // 진행 중인 공격
  for(let i=st.acts.length-1;i>=0;i--){const a=st.acts[i];if(!frozen)a.t+=dt;const t=a.t,[d0,d1,d2,d3]=a.dur,c=a.contact;
   if(!a.done&&t>=c){a.done=true;a.hit=st.onContact?st.onContact(a):null;if(a.hit&&a.hit.hit&&BLADE(a.tool))st.bloody[a.tool]=st.bloody[a.tool]||a.hit.blood;}
   const h=H[a.side],hit=!!(a.hit&&a.hit.hit),hard=!!(a.hit&&a.hit.hard);
   if(a.tool==='hand'){
    // 훅은 팔꿈치가 옆으로 나와 팔이 옆에서 휘어 들어오고, 어퍼컷은 아래에서 올라온다
    if(a.kind!=='jab'){const w=t<c+d2?smooth(t/(d0*.8)):1-smooth((t-c-d2)/d3);
     if(a.kind==='hook')tmpP.set(a.s*.62,a.target.y-.06,a.target.z+.42);else tmpP.set(a.s*.16,a.target.y-.62,a.target.z+.3);
     h.anch.lerp(tmpP,clamp(w,0,1));}
    if(t<d0){const u=easeOut(t/d0);h.p.lerp(a.W,u);h.q.slerp(a.Q0,u);}
    else if(t<c){const u=easeIn((t-d0)/d1);bez(a.W,a.C,a.target,u,h.p);tmpQ.copy(a.Q0).slerp(a.Q1,u);h.q.copy(tmpQ);}
    else if(t<c+d2){
     // 맞히면: 얼굴에 박혔다가(멈춤 동안 이 모습) 튕겨 나온다. 헛치면 더 뻗었다가 돌아온다
     const u=(t-c)/d2;
     if(hit)h.p.copy(a.target).addScaledVector(a.fwd,lerp(.024,-.06,easeOut(u))*SC);
     else h.p.copy(a.target).addScaledVector(a.fwd,Math.sin(u*PI)*.06*SC);
     h.q.copy(a.Q1);}
    else if(t<a.total){
     // 얼굴 앞에서 빨리 빠진다: 아래·바깥으로 휘며 제자리로
     const u=(t-c-d2)/d3,e=easeOut3(u);
     tmpP.copy(a.target).addScaledVector(a.fwd,hit?-.06*SC:0);
     tv3.copy(h.p);h.p.copy(tmpP).lerp(tv3,e);h.p.y-=Math.sin(e*PI)*.08*SC;h.p.x+=a.s*Math.sin(e*PI)*.05*SC;
     tmpQ.copy(a.Q1).slerp(h.q,e);h.q.copy(tmpQ);}
   }else if(BLADE(a.tool)){
    const reach=KREACH,RDIR=KREST.dir,RUP=KN_UP;
    // At contact the blade is measured in the same meters as the body; only the idle foreground pose is scaled.
    const extension=t<d0?0:t<c?smooth((t-d0)/d1):t<c+d2?1:1-easeOut3((t-c-d2)/d3);
    h.scale=lerp(SC,1,extension);
    if(a.hit&&a.hit.bone&&t>=c){
     a.hit.bone.updateWorldMatrix(true,false);
     const pt=a.hit.bone.localToWorld(a.hit.lp.clone()),screen=pt.clone().project(camera);
     const next=bladeTarget((screen.x*.5+.5)*innerWidth,(-screen.y*.5+.5)*innerHeight,{point:pt});
     a.hand1.add(next.clone().sub(a.target));a.target.copy(next);
    }
    let hand,dir;
    if(t<d0){const u=easeOut(t/d0);hand=tv.copy(h.p).lerp(a.hand0,u);dir=tv2.copy(RDIR).lerp(a.dir0,u).normalize();}
    else if(t<c){const u=easeIn((t-d0)/d1);hand=tv.copy(a.hand0).lerp(a.hand1,u);tmpQ.setFromUnitVectors(_fz,a.dir0);tmpQ2.setFromUnitVectors(_fz,a.dir1);tmpQ.slerp(tmpQ2,u);dir=tv2.copy(_fz).applyQuaternion(tmpQ);}
    else if(t<c+d2){
     const u=(t-c)/d2;dir=tv2.copy(a.dir1);
     if(hit&&!hard){// 날이 몸 안으로 들어간다(피부 면에서 잘려 보임). 후광처럼 딱딱한 데는 튕겨 나온다
      const k=easeOut(Math.min(1,u*1.7));hand=tv.copy(a.hand1).addScaledVector(a.dir1,k*a.pen);setClip(a.target,a.dir1);
     }else hand=tv.copy(a.hand1).addScaledVector(a.dir1,Math.sin(u*PI)*(hard?-.035:.05)*SC);}
    else{
     const u=(t-c-d2)/d3,e=easeOut3(u);dir=tv2.copy(a.dir1).lerp(RDIR,e).normalize();
     if(hit&&!hard){// 뽑는다: 처음엔 날을 빼내고(피가 왈칵), 그다음 제자리로
      const out=Math.min(1,u*2.6);hand=tv3.copy(a.hand1).addScaledVector(a.dir1,a.pen*(1-easeOut(out)));hand=tv.copy(hand).lerp(h.p,e*e);
      // 날끝이 아직 몸 안에 있으면 계속 가린다
      tv3.copy(hand).addScaledVector(dir,reach);if(a.dir1.dot(tv3)>a.dir1.dot(a.target))setClip(a.target,a.dir1);
      if(!a.pulled&&u>.06){a.pulled=true;if(st.onPull)st.onPull(a);}
     }else hand=tv.copy(a.hand1).lerp(h.p,e);}
    h.p.copy(hand);orient(h.q,dir,RUP);
   }
   if(a.t>=a.total)st.acts.splice(i,1);
  }
  // 날붙이로 긋기: 날이 화면 안쪽으로 꽂혀 보이지 않게 오른쪽 아래에서 비스듬히 눕혀 긋는다
  if(BLADE(st.tool)&&st.slash){const reach=KREACH,RUP=KN_UP;
   const s=st.slash,T=bladeTarget(s.sx,s.sy),H0=at(1.05,-1.05,.62);H.R.scale=1;const dir=tv.subVectors(T,H0).normalize();
   const touching=s.touching||G.time<s.touchUntil;
   s.bite=damp(s.bite,touching?1:0,touching?30:16,rdt);
   H.R.p.copy(T).addScaledVector(dir,-reach+s.bite*.1*SC);if(s.bite>.02)setClip(T,dir);
   const mv=tv2.set(s.sx-s.px,-(s.sy-s.py),0);if(mv.lengthSq()>1)mv.normalize();else mv.set(1,0,0);orient(H.R.q,dir,tv3.set(-mv.y,mv.x,0).lerp(RUP,.3));}
  if(!clipOn){clip.normal.set(0,0,1);clip.constant=1e3;}
  // 총: 겨냥·반동
  if(st.tool==='gun'){
   st.recoil=Math.max(0,st.recoil-rdt*6);st.slide=Math.max(0,st.slide-rdt*14);
   if(st.time-st.lastShot>.9)st.aimGoal.lerp(_aimRest,1-Math.exp(-rdt*3)).normalize();
   const h=H.R;st.aim.lerp(st.aimGoal,1-Math.exp(-rdt*16));const muzzleTo=tv.copy(st.aim).multiplyScalar(3).sub(h.p).normalize();
   orient(h.q,muzzleTo,UP);
   // 반동: 30ms 만에 확 튀었다가 천천히 내려온다
   const u=1-st.recoil,k=st.recoil<=0?0:u<.15?u/.15:Math.pow(1-(u-.15)/.85,2);
   tmpQ.setFromAxisAngle(tv2.set(1,0,0),-k*.55);h.q.multiply(tmpQ);h.p.addScaledVector(muzzleTo,-k*.075*SC);h.p.y+=k*.022*SC;
   gun.userData.slide.position.z=-st.slide*.026;gun.userData.flash.visible=st.flash>0;gun.userData.light.intensity=st.flash>0?3:0;
  }
  // 붙잡힘·뿌리침
  for(const k of ['R','L']){const s=k==='R'?1:-1;GR[k]=damp(GR[k],GR.goal[k],9,rdt);const w=GR[k];
   if(w>.001){const h=H[k];tmpP.copy(held[k]);tmpP.x+=Math.sin(st.time*21+(k==='R'?0:2))*.009*w;tmpP.y+=Math.cos(st.time*17+(k==='R'?1:0))*.008*w;h.p.lerp(tmpP,w);h.q.slerp(heldQ[k],w);}
   if(GR.shake>=0){const u=GR.shake/.55,e=Math.sin(Math.min(1,u)*PI),h=H[k];h.p.x+=s*.17*e;h.p.y+=.21*e*(1-u*.4);h.p.z+=.03*e;tmpQ.setFromAxisAngle(tv2.set(0,0,1),-s*.8*e);h.q.premultiply(tmpQ);}}
  if(GR.shake>=0){GR.shake+=rdt;if(GR.shake>.55)GR.shake=-1;}
  for(const s of shells)if(s.life>0){s.life-=rdt;s.v.y-=4*SC*rdt;s.m.position.addScaledVector(s.v,rdt);s.m.rotation.x+=s.w.x*rdt;s.m.rotation.y+=s.w.y*rdt;if(s.life<=0)s.m.visible=false;}
  // 멱살잡이: 손목을 팔과 나란히 두고, 손바닥 앞의 쥔 자리를 옷깃에 맞춘다.
  {const g=!!(gripPoint&&st.tool==='hand');if(grabHand.visible!==g){grabHand.visible=g;L.fist.visible=!g;}
   if(g)poseCollarGrip(H.L,gripPoint.x,gripPoint.y);}
  // 손 배치(칼·총을 들 때도 붙잡히면 왼팔이 보인다: 왼쪽 사람이 허공을 붙잡지 않게)
  {const showL=st.tool==='hand'||GR.L>.03||GR.goal.L>0;L.hand.visible=L.arm.g.visible=showL;}
  for(const k of ['R','L']){const h=k==='R'?R:L;h.hand.position.copy(H[k].p);h.hand.quaternion.copy(H[k].q);h.hand.scale.setScalar(lerp(H[k].scale,1,GR[k]));if(h.hand.visible)placeArm(k);}
  knife.userData.blood.visible=!!st.bloody.knife&&PREF.blood;
 }
 function reset(){st.acts.length=0;st.slash=null;st.nextHand='R';st.time=0;st.ammo=8;st.reload=0;st.bloody={};st.recoil=0;st.slide=0;st.flash=0;st.lastShot=-9;st.swapT=1;st.guardLift=1;st.guardRaising=false;fireCool=0;st.aimGoal.set(0,0,-1);st.aim.set(0,0,-1);gun.userData.slide.position.z=0;gun.userData.flash.visible=false;gun.userData.light.intensity=0;for(const s of shells){s.life=0;s.m.visible=false;}}
 // 그린 뒤에 수명을 깎는다. 느린 프레임에서도 첫 불꽃은 반드시 한 번 보인다.
 function afterRender(dt){st.flash=Math.max(0,st.flash-dt);}
 setTool('hand');
 return {root,st,grip,setTool,setScale,attack,fire,reload,slashStart,slashMove,slashEnd,update,afterRender,reset,computeRest,lowerHands,raiseHands,KREST,setGrab,shakeOff,handPos,anchorPos,at:(nx,ny,d)=>at(nx,ny,d),get busy(){return st.acts.length>0;}};
})();
onCamUnit=VM.setScale;VM.setScale(CAM.unit);
const _fz=V3(0,0,1),_aimRest=V3(-.04,.12,-1).normalize();
/* ===== 8. 진행과 입력 =====
 * 실제로 맞힌 피해만큼 버팀 게이지가 줄어든다.
 * 몸싸움의 다운은 균형과 타격으로 결정한다. 게이지는 이야기 진행만 맡는다.
 * 75/50/25: 표정과 후광 변화 → 25(팔 붙잡기) → 15(막아서기) → 5(되살아남, 24로) → 0(마지막 다운).
 */
const PREF={sound:true,blood:true,vibe:true,shake:true,deform:true,musicVolume:1,effectsVolume:1,voiceVolume:1};
metalEnv(VM.root);
try{const p=JSON.parse(localStorage.getItem('palja.prefs')||'{}');for(const k of Object.keys(PREF))if(typeof PREF[k]==='boolean'&&typeof p[k]==='boolean')PREF[k]=p[k];else if(typeof PREF[k]==='number'&&Number.isFinite(p[k]))PREF[k]=clamp(p[k],0,1);}catch(_){}
const PROGRESS=(()=>{
 let defeated=0;
 try{const n=Number(localStorage.getItem('palja.defeated'));if(Number.isSafeInteger(n)&&n>=0)defeated=Math.min(n,999999);}catch(_){}
 return {get defeated(){return defeated;},add(){defeated=Math.min(999999,defeated+1);try{localStorage.setItem('palja.defeated',String(defeated));}catch(_){}return defeated;},reset(){
  // Do not claim a persistent reset if browser storage rejected the write.
  try{localStorage.setItem('palja.defeated','0');}catch(_){return false;}
  defeated=0;return true;
 }};
})();
function updateDefeatCount(){
 // 첫 전투에서는 최종 처치 직후에도 카운트를 숨겨 뒤의 존재를 미리 암시하지 않는다.
 $('#defeatCount').hidden=!G.defeatCountVisible;
 $('#endDefeatCount').hidden=!G.defeatCountVisible;
 $('#defeatCount').textContent=$('#endDefeatCount').textContent='족친 천지신명 '+PROGRESS.defeated+'놈';
}
const OUTFITS=[
 {cloth:['#38191f','#78313a','#411c24'],shirt:'#788281',placket:'#8b9290',stole:'#292d2b',pants:'#343b3d',inside:'#211b20',gold:'#b99552',goldD:'#765631',gem:'#8a5ae0'},
 {cloth:['#123334','#28766d','#174b46'],shirt:'#d3c5a2',placket:'#bcae8d',stole:'#153735',pants:'#1d3435',inside:'#102526',gold:'#c5aa71',goldD:'#82704a',gem:'#79c5a9'},
 {cloth:['#152338','#354f86','#202f52'],shirt:'#b7bbc8',placket:'#929bab',stole:'#172135',pants:'#212b3c',inside:'#141d2d',gold:'#bdc3cb',goldD:'#727e8c',gem:'#7bafe7'},
 {cloth:['#302039','#704279','#422846'],shirt:'#c8b4a9',placket:'#a28f86',stole:'#2c1e32',pants:'#312632',inside:'#251929',gold:'#bda171',goldD:'#7c6548',gem:'#c080bb'},
 {cloth:['#373321','#897641','#49402a'],shirt:'#c6c4b5',placket:'#a9a595',stole:'#292b25',pants:'#30332d',inside:'#27271e',gold:'#c6b68c',goldD:'#827452',gem:'#b5ce93'},
 {cloth:['#3e231c','#955437','#522e24'],shirt:'#c7bfa9',placket:'#a99c85',stole:'#32221e',pants:'#362b27',inside:'#2b1c18',gold:'#b7c2bd',goldD:'#73847d',gem:'#79b9b1'}
];
function combatCloth(E,outfit){
 if(E.lookIndex%OUTFITS.length===0)return COMBAT_STAGE.robe;
 const tex=canvasTex(1024,1024,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,outfit.cloth[0]);gr.addColorStop(.45,outfit.cloth[1]);gr.addColorStop(1,outfit.cloth[2]);g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=3){g.fillStyle=y%6?'rgba(10,10,13,.15)':'rgba(210,195,170,.07)';g.fillRect(0,y,w,1);}
  for(let row=0;row<3;row++)for(let c=0;c<3;c++)drawCloud(g,(c+.25+(row%2)*.5)*w/3,(row+.5)*h/3,2.4,outfit.goldD,outfit.gold);
 });E.disposables.push(tex);return tex;
}
const KD_AT=[75,50,25,0],KD_TYPE=['throne','kneel','floor','final'],DMG_MUL=3.1;
const G={time:0,free:false,defeatCountVisible:false,running:false,raf:0,E:null,mode:'fight',tool:'hand',bar:100,shown:100,shownHold:0,lag:100,lastHit:-99,kd:0,active:0,started:false,hits:0,t0:0,hitstop:0,slow:0,ended:false,paused:false,inputLocked:false,result:null,round:0,retired:[],offerPending:false,offerOpen:false,offerBreaking:false,crowdEntered:false,crowdWarned:false,crowdBeatUntil:0,crowdSwapAt:0,crowdSwapLines:null,crowdHideAt:0,revivalUsed:false,revivalPending:false,revival:null,revived:false,brittle:false};
const HINTS={hand:'터치: 주먹 / 밟기 · 밀기: 훅 · 꾹 잡고 끌기',knife:'누르면 찌르기 · 그으면 베기 · 목·팔다리는 가로로 세 번',gun:'누르면 쏘기 · 꾹 누르면 연사 · 같은 데 몰아 쏘면 터짐'};
/* ===== Close combat: persistent position, interruptible balance, ground contact ===== */
const COMBAT={pointer:null,foot:null,serial:-1,landKick:0,follow:0,grabGlow:0,storyAnchor:null};
const PLAIN_TROUSERS=false;// true면 바지를 민무늬 원통으로 바꾼다(빚은 바지가 더 자연스러워 쓰지 않는다)
const COMBAT_POSE={
 // 나자빠짐: 두 팔은 바닥에 벌어져 늘어지고(한쪽은 조금 굽어), 손은 힘없이 반쯤 말린다. 무릎은 세워진다
 ground:P({rx:-1.48,py:-.05,pF:0,sF:-.05,cF:0,nF:-.1,hF:.15,
  LsF:.12,RsF:.3,LsA:1.2,RsA:1.0,LsT:.1,RsT:-.2,LeB:.45,ReB:.75,LwF:.25,RwF:.3,LwA:.15,RwA:.1,Lcurl:.6,Rcurl:.65,
  LhF:.35,RhF:.5,LhA:.22,RhA:.28,LkB:.85,RkB:1.1,LaF:.2,RaF:.25}),
 // 일어남 첫 단계: 웅크리고 두 주먹으로 바닥을 짚는다
 brace:P({py:-.4,pF:.22,sF:.72,cF:.14,nF:-.42,hF:-.5,
  LsF:1.4,RsF:1.45,LsA:.3,RsA:.3,LeB:.15,ReB:.15,LwF:.35,RwF:.35,Lcurl:.9,Rcurl:.9,
  LhF:1.5,RhF:1.1,LhA:.15,RhA:.15,LkB:2.0,RkB:1.85,LaF:-.5,RaF:-.65}),
 // 멱살 잡힘: 두 주먹을 가슴 앞에 쥐고 버틴다
 held:P({py:-.05,sF:.19,cF:.12,hF:-.2,LsF:1.05,RsF:1.1,LsA:.18,RsA:.2,
  LeB:1.45,ReB:1.4,LwF:.2,RwF:.2,Lcurl:.85,Rcurl:.85,LhF:.12,RhF:-.08,LkB:.22,RkB:.34}),
};
function combatSeatPose(T){
 // 방석 윗면(.50)에 엉덩이 밑면이 닿고, 허벅지는 수평으로 앞으로 나온다.
 // 다운용 throne 자세와 분리해 무릎·정강이가 방석이나 앞판을 관통하지 않게 한다.
 poseCopy(POSES.throne,T);
 T.py=.045;T.pF=0;T.sF=-.08;T.cF=0;T.hR=.02;T.hF=-.14;
 T.LhF=T.RhF=PI/2;T.LkB=T.RkB=PI/2;T.LhA=T.RhA=.14;T.LaF=T.RaF=0;
 T.LsF=T.RsF=.25;T.LsA=T.RsA=.38;T.LeB=T.ReB=.85;T.Lcurl=T.Rcurl=.5;
 return T;
}
function resetSeatedEncounter(E){
 // 인사 중에는 combat.age가 0에 멈춘다. 서 있는 자세에서 보간을 시작하면
 // 다리가 의자를 뚫은 채 인사가 끝날 때까지 멈추므로 첫 프레임부터 앉힌다.
 E.endAct();E.guard=E.guardHold=0;E.pat=null;
 for(const a of E.arms){
  a.safeE=a.safeW=a.baseE=a.baseW=a.safeH=null;
  const ik=E.ik[a.nm];ik.w=ik.goal=0;ik.follow=null;ik.pole=null;
  E.rest[a.nm].on=false;
 }
 combatSeatPose(E.pose);E.pose.tx=E.pose.ty=E.pose.ry=0;E.pose.tz=E.combat.z;
 E.applyPose(E.pose);E.root.updateMatrixWorld(true);
}
function combatInit(E,seated){
 if(!window.FateMotion)throw new Error('몸싸움 모듈을 불러오지 못했습니다. 새로고침해 주세요.');
 E.combat=new window.FateMotion.Body(seated);E._combatScripted=false;
 E._combatPoseSerial=-1;E._combatFrom=P();E._combatTarget=P();
 E.rootPos.set(0,0,0);E.rootVel.set(0,0,0);E.down=null;
 E.rest.L.on=E.rest.R.on=false;
 if(seated)resetSeatedEncounter(E);
 combatLook(E);
}
/* 족치기 차림(옷감·바지·장신구 색): 순응 장면부터 같은 차림으로 앉아 있게 판마다 한 번만 입힌다
 * (걸어가는 도중에 갈아입으면 멀리서도 옷 색이 번쩍 바뀌어 보인다) */
function combatLook(E){
 if(E._combatLook)return;E._combatLook=true;
 for(const name of ['robe','hem','chest','belly','trouser','shirt']){
  const m=E.M[name];if(!m)continue;m.roughness=.88;m.bumpMap=COMBAT_STAGE.weave;m.bumpScale=.0015;
  m.envMapIntensity=.22;
  if(m.map&&m.map.image){
   const source=m.map.image;
   const tex=canvasTex(source.width,source.height,(g,w,h)=>{
    g.drawImage(source,0,0);g.globalCompositeOperation='saturation';g.fillStyle='rgba(110,110,110,.72)';g.fillRect(0,0,w,h);
    g.globalCompositeOperation='multiply';g.fillStyle='#cec7b5';g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';
   });
   m.map=tex;E.disposables.push(tex);
  }
 }
 for(const name of ['skin','flesh','skinD']){const m=E.M[name];if(!m)continue;m.roughness=.65;m.bumpMap=COMBAT_STAGE.grain;m.bumpScale=.00065;}
 for(const name of ['gold','goldD']){const m=E.M[name];m.roughness=.44;m.envMapIntensity=.65;m.bumpMap=COMBAT_STAGE.grain;m.bumpScale=.001;}
 const outfit=OUTFITS[E.lookIndex%OUTFITS.length],robe= combatCloth(E,outfit);
 for(const name of ['robe','hem'])E.M[name].map=robe;
 const cloth=robe.userData.canvas;
 E.M.belly.map=canvasTex(1024,512,(g,w,h)=>paintOpening(g,w,h,{source:cloth,shirt:outfit.shirt,placket:outfit.placket,stole:outfit.stole,R:.335,Rm:.31,sw:.052,half:d=>.05+.045*clamp((d-18)/92,0,1),buttons:[44,61,78,95,111],syms:[34,78]}));
 E.M.chest.map=canvasTex(768,384,(g,w,h)=>paintOpening(g,w,h,{source:cloth,shirt:outfit.shirt,placket:outfit.placket,stole:outfit.stole,R:.27,Rm:.22,sw:.05,half:d=>.024+.026*clamp((d-40)/50,0,1),syms:[76],symShift:1}));
 E.disposables.push(E.M.belly.map,E.M.chest.map);
 E.M.trouser.map=null;E.M.trouser.color.copy(col(outfit.pants));E.M.trouser.roughness=.96;
 if(PLAIN_TROUSERS)for(const m of E.parts){
  if(m.material!==E.M.trouser||!m.userData.flesh)continue;
  const seg=m.userData.seg;let geo;
  if(seg==='pelvis'){geo=new THREE.SphereGeometry(1,28,18);geo.scale(.18,.13,.23);geo.translate(0,-.035,0);}
  else if(/^hip/.test(seg)){geo=new THREE.SphereGeometry(1,28,18);geo.scale(.125,.13,.125);geo.translate(0,-.035,0);}
  else if(/^thighMid/.test(seg)){geo=new THREE.CylinderGeometry(.12,.105,.19,28,10);geo.translate(0,-.07,0);}
  else if(/^knee/.test(seg)){geo=new THREE.SphereGeometry(1,28,18);geo.scale(.108,.12,.108);geo.translate(0,-.025,0);}
  else if(/^shinMid/.test(seg)){geo=new THREE.CylinderGeometry(.096,.077,.19,28,10);geo.translate(0,-.065,0);}
  if(!geo)continue;
  const old=m.geometry;m.geometry=geo;m.userData.flesh.o.keepNormals=true;m.userData.flesh.setGeometry(geo);
  E.disposables.push(geo);E.releaseGeometry(old);
 }

 E.M.sole.color.copy(col('#d8cfbb'));E.M.boot.roughness=.62;
 E.M.red.color.copy(col(outfit.goldD));E.M.robeIn.color.copy(col(outfit.inside));E.M.lining.color.copy(col(outfit.inside));
 E.M.gold.color.copy(col(outfit.gold));E.M.goldD.color.copy(col(outfit.goldD));E.M.amethyst.color.copy(col(outfit.gem));
 E.M.amethyst.emissiveIntensity=.08;E.M.ruby.emissiveIntensity=.04;
 E.root.traverse(o=>{if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.needsUpdate=true;});
 COMBAT_STAGE.contact.visible=true;
}
function combatActive(E){return !!(E&&E.combat&&!E._combatScripted&&G.mode==='fight');}
function combatStep(E,dt){
 const b=E.combat;b.canRise=!E.legsMissing();
 if(!G.inputLocked||COMBAT.storyAnchor)b.step(dt);
 E.state=b.mode==='ground'?'down':b.mode==='seat'||b.mode==='stagger'?'stand':b.mode;
 if(E.state==='down')E.down=E.down||{type:'floor',stay:10};
 else if(E.state!=='fall'&&E.state!=='rise')E.down=null;
 // IK actions from the standing animation must not pin hands in space during a fall.
 if(b.mode!=='stand'&&b.mode!=='seat'){E.endAct();E.guardHold=0;E.guard=0;E.releaseIK('L',18);E.releaseIK('R',18);}
 for(const event of b.drain()){
  if(event.type==='land'){
   AUDIO.fall('floor');AUDIO.slap(.55,.3);COMBAT.landKick=.9;
   camHit({shake:.04});G.hitstop=Math.max(G.hitstop,.055);
   const pos=V3(b.x,.04,b.z);BLOOD.spray(pos,UP,12,{kind:'dust',max:1.3});
   hint('누르면 밟기 · 몸을 꾹 잡고 위로 끌어올리기',2.6);
  }else if(event.type==='boundary'){AUDIO.fall('throne');camHit({shake:.018});}
  else if(event.type==='throw'){
   AUDIO.whoosh(.95,'hook');damageBar(.65,{},true);
  }
 }
}
function combatPose(E,out,dt,time){
 const b=E.combat,T=E._combatTarget;
 if(E._combatPoseSerial!==b.serial){
  poseCopy(E.pose,E._combatFrom);E._combatPoseSerial=b.serial;
  // Poses interpolate locally; the persistent body position is owned by the simulation.
  E._combatFrom.tx=E._combatFrom.ty=E._combatFrom.tz=E._combatFrom.ry=0;
 }
 if(b.mode==='seat'){
  // 옥좌에서 한 손으로 돈다발을 부친다.
  combatSeatPose(T);
  E.updateActions(T,dt,time);
  // 빈손으로 앉을 때에는 양손을 팔걸이 위에 얹는다.
  if(!E.tabletHeld&&!E.act)for(const s of [-1,1])E.setIK(s<0?'L':'R',{target:_bv1.set(s*.50,.94,.20),fd:_bv2.set(s*.08,-.08,1),pd:_bv3.set(0,-1,0),curl:.3,rate:8,pole:_bv4.set(s*.12,-.40,.10)});
 }else if(b.mode==='stand'){
  E.standPose(T,dt,time);
  const speed=Math.hypot(b.vx,b.vz),a=Math.sin(b.stepDistance*22)*clamp(speed*.45,0,.34);
  T.LhF+=a;T.RhF-=a;T.LkB+=Math.max(0,a)*1.1;T.RkB+=Math.max(0,-a)*1.1;
  // 균형이 깎일수록 무릎이 풀리고 몸이 흔들린다(넘어지기 전 조짐)
  const tired=clamp(1-b.balance/Math.max(.2,b.poise),0,1),wob=tired*tired;
  T.sR-=b.vx*.11;T.sF-=b.vz*.1;T.py-=tired*.045;T.LkB+=wob*.22;T.RkB+=wob*.22;
  T.rz+=Math.sin(time*2.3)*.05*wob;T.sR+=Math.sin(time*2.3+.7)*.06*wob;T.hR+=Math.sin(time*1.9)*.08*wob;
 }else if(b.mode==='stagger'){
  // 비틀거림: 무릎이 꺾이고 맞은 쪽으로 몸이 기울며 팔을 허우적인다. 끝에서 넘어짐(fall)으로 이어진다
  E.standPose(T,dt,time);
  const u=b.lean,w=Math.sin(u*PI),sx=b.staggerDir.x,e=u*u;
  // 무릎이 꺾이며 주저앉듯 내려가고, 골반은 뒤로 빠지고 윗몸은 앞으로 숙여진다
  T.LkB+=1.0*e;T.RkB+=.8*e;T.py-=.2*e;T.LhF+=.45*e;T.RhF+=.3*e;T.LaF-=.3*e;T.RaF-=.2*e;T.LhA+=.12*u;T.RhA+=.1*u;
  T.pF-=.1*u;T.sF+=.22*u;T.cF+=.1*u;T.rz-=sx*.22*u;T.sR+=sx*.16*u;T.hR-=sx*.3*u;T.pR+=sx*.1*u;T.sT+=sx*.2*u;
  // 팔은 균형을 잡으려 옆·앞으로 허우적이고 손은 펴진다
  T.LsA+=.55*w+.25*u;T.RsA+=.6*w+.3*u;T.LsF-=.4*w;T.RsF-=.25*w;T.LsT+=.3*w;T.RsT-=.2*w;T.LeB=lerp(T.LeB,.25,w);T.ReB=lerp(T.ReB,.3,w);
  T.Lcurl=lerp(T.Lcurl,.12,w);T.Rcurl=lerp(T.Rcurl,.12,w);T.LwF-=.3*w;T.RwF-=.3*w;
  T.hF-=.2*w;T.nF-=.1*w;
 }else if(b.mode==='grab'){
  poseLerp(COMBAT_POSE.ground,COMBAT_POSE.held,smooth(b.grab?b.grab.lift:1),T);
 }else if(b.mode==='rise'){
  // 일어남: 몸을 굴려 웅크리고(주먹으로 바닥을 짚음) → 천천히 선다
  const t=b.age/window.FateMotion.TIMING.rise;
  if(t<.42)poseLerp(E._combatFrom,COMBAT_POSE.brace,smooth(t/.42),T);
  else if(t<.58)poseCopy(COMBAT_POSE.brace,T);
  else poseLerp(COMBAT_POSE.brace,STAND,smooth((t-.58)/.42),T);
 }else{
  poseCopy(COMBAT_POSE.ground,T);T.rz=b.roll;T.hT=b.side*.22;
  T.LsF+=Math.sin(time*2.1)*.025;T.RsF-=Math.sin(time*1.7)*.03;
  if(b.mode==='ground'){
   const struggle=Math.sin(time*3.6)*.045*b.recovery;
   T.sF+=struggle;T.LkB+=Math.sin(time*2.5)*.09*b.recovery;
   T.hF-=.12*b.recovery;
   // 밟히면 버둥댄다: 두 팔을 들어 얼굴·몸을 가리며 휘젓고, 다리를 번갈아 차고, 고개를 도리도리 흔든다. 떨림도 그대로 이어진다
   const pn=Math.min(1,E.panic||0),tr=E.tremble||0;
   if(pn>.02){
    const f1=Math.sin(time*6+E.flailSeed),f2=Math.sin(time*5+1.1+E.flailSeed),kick=Math.sin(time*7);
    // 팔: 옆으로 벌어져 있던 팔을 위(카메라 쪽)로 들어 올려 팔꿈치를 접어 얼굴 위로 가져가고, 좌우로 흔든다
    T.LsA=lerp(T.LsA,.38+f1*.12,pn);T.RsA=lerp(T.RsA,.34-f2*.12,pn);
    T.LsF=lerp(T.LsF,1.2+f2*.2,pn);T.RsF=lerp(T.RsF,1.1-f1*.2,pn);
    T.LsT=lerp(T.LsT,f2*.25,pn);T.RsT=lerp(T.RsT,-f1*.25,pn);
    T.LeB=lerp(T.LeB,1.05+Math.abs(f1)*.35,pn);T.ReB=lerp(T.ReB,.95+Math.abs(f2)*.35,pn);
    T.LwF=lerp(T.LwF,-.2,pn);T.RwF=lerp(T.RwF,-.2,pn);T.Lcurl=lerp(T.Lcurl,.1,pn);T.Rcurl=lerp(T.Rcurl,.1,pn);
    // 다리: 번갈아 차며 버둥댄다
    T.LkB+=Math.max(0,kick)*.55*pn;T.RkB+=Math.max(0,-kick)*.55*pn;T.LhF+=.25*pn+kick*.18*pn;T.RhF+=.25*pn-kick*.18*pn;T.LaF-=.2*pn;T.RaF-=.2*pn;
    // 고개 도리도리, 몸통 뒤척임
    T.hT+=Math.sin(time*8)*.1*pn;T.hF-=.1*pn;T.cT+=Math.sin(time*5)*.04*pn;
   }
   if(tr>.01){const a=Math.sin(time*10),c=Math.sin(time*8+2.1);T.hT+=a*.02*tr;T.hR+=c*.012*tr;}
  }
 }
 T.tx=T.ty=T.tz=T.ry=0;
 const duration=b.mode==='fall'?.52:b.mode==='grab'?.16:b.mode==='stand'?.23:b.mode==='stagger'?.1:.16;
 if(b.mode==='rise')poseCopy(T,out);else poseLerp(E._combatFrom,T,smooth(b.age/duration),out);
 out.ry=b.yaw;
 // Rotate around the pelvis, not the feet. The center follows the same trajectory through a fall.
 const pivot=V3(0,.62+out.py,0).applyEuler(new THREE.Euler(out.rx,out.ry,-out.rz,'YXZ'));
 const lying=clamp(Math.abs(out.rx)/1.35,0,1);
 out.tx=b.x-pivot.x;out.tz=b.z-pivot.z;
 out.ty=lerp(.62+out.py,.29,lying)-pivot.y-b.compression*.2;
 out.cF+=Math.sin(E.breath)*.008;
}
function combatFloor(E){
 if(!E.combat||G.mode!=='fight'||E.combat.mode==='seat')return;
 // Contact samples use anatomical surfaces, excluding the floating crown and halo.
 E.root.updateMatrixWorld(true);
 let min=Infinity;const v=_combatV;
 for(const l of E.legs){if(!l.ank.userData.detached&&l.ank.parent){l.ank.getWorldPosition(v);min=Math.min(min,v.y-.063);}}
 for(const a of E.arms){if(!a.wr.userData.detached&&a.wr.parent){a.wr.getWorldPosition(v);min=Math.min(min,v.y-.06);}}
 for(const [name,radius] of [['pelvis',.15],['chest',.21],['head',.13]]){
  const bone=E.bones[name];if(bone&&!bone.userData.detached){bone.getWorldPosition(v);min=Math.min(min,v.y-radius);}
 }
 if(min<.018)E.root.position.y+=.018-min;
 const b=E.combat,down=E._combatScripted||b.mode==='ground'||b.mode==='fall';
 E.bones.pelvis.getWorldPosition(v);
 COMBAT_STAGE.contact.position.set(v.x,.006,v.z);
 COMBAT_STAGE.contact.scale.set(down?.68:.47,down?1:.38,1);
 COMBAT_STAGE.contact.material.opacity=down?.38:.29;
}
const _combatV=V3();
function combatCamera(dt){
 const E=G.E;if(G.mode!=='fight'||!E||CAM.frame==='cut'||CAM.frame==='debug')return false;
 const b=E.combat;if(!b)return false;
 if(G.free&&FREE.camera(dt))return true;
 if(COMBAT.storyAnchor){
  const a=COMBAT.storyAnchor;
  // 세로 화면에선 사람들이 화면 위쪽 작은 띠에 몰리지 않게 조금 덜 물러나고 낮게 본다
  const pr=innerWidth<innerHeight;CAM.fovBase=pr?44:39;
  const tan=Math.tan(CAM.fovBase*PI/360),distance=Math.max(3.6,(pr?1.1:1.55)/(tan*innerWidth/innerHeight)+.9);
  CAM.goalPos.set(a.x,pr?1.5:1.65,a.z+distance);CAM.goalLook.set(a.x,pr?.95:.86,a.z+.15);
  CAM.unit=clamp(1/(2*distance*tan),.16,.53);if(onCamUnit)onCamUnit(CAM.unit);
  const k=1-Math.exp(-dt*5);CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
  return true;
 }
 const down=clamp(Math.abs(E.pose.rx)/1.35,0,1),portrait=innerWidth<innerHeight;
 const aspect=innerWidth/innerHeight,tall=portrait&&innerHeight/innerWidth>=1.95;
 const distance=portrait?Math.max(2.55,1.7/aspect):3.05;
 const x=E.root.position.x,z=b.z;
 // Track the pelvis rather than recentering the opponent. Dolly and pitch follow the body together.
 CAM.goalPos.set(b.x*.8+.12,lerp(1.58,2.5,down),z+lerp(distance,portrait?2.35:2.5,down));
 CAM.goalLook.set(b.x,lerp(tall?1.08:1.16,.3,down),z-down*.22);
 if(b.mode==='grab'){CAM.goalPos.z-=.18;CAM.goalLook.y+=.08;}
 const k=1-Math.exp(-dt*(b.mode==='fall'?7:5));
 CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
 COMBAT.landKick*=Math.exp(-dt*14);
 CAM.pos.y-=COMBAT.landKick*.012;
 CAM.fovBase=portrait?(tall?44:46):41;CAM.unit=clamp(1/(2*distance*Math.tan(CAM.fovBase*PI/360)),.3,.53);
 if(onCamUnit)onCamUnit(CAM.unit);
 return true;
}
function combatAttack(x,y,kind='jab'){
 const E=G.E;if(!combatActive(E)||G.inputLocked||G.paused)return false;
 const b=E.combat;
 if(G.tool==='hand'&&(b.mode==='ground'||b.mode==='fall'))return startStomp(x,y);
 return VM.attack(kind,x,y);
}
function startStomp(x,y){
 if(COMBAT.foot||VM.busy)return false;
 const info=pickAt(x,y);if(!info||!info.obj||!G.E.parts.includes(info.obj))return false;
 const local=info.obj.worldToLocal(info.point.clone());
 COMBAT.foot={t:0,obj:info.obj,local,part:info.part,done:false,swung:false};
 VM.st.acts.length=0;AUDIO.whoosh(.35,'hook');return true;
}
// Viewmodel leg: the pelvis stays behind the foot and above it in world-up.
// Keep both bone lengths exact; an out-of-reach target pulls the offscreen pelvis
// forward instead of clamping only the IK distance and stretching the shin.
function stompLegPose(ankle,upC){
 const hip=V3(.16,-.44,.05),L1=.5,L2=.5;
 const height=hip.clone().sub(ankle).dot(upC);
 if(height<.26)hip.z+=(.26-height)/Math.max(.2,upC.z);
 const d=ankle.clone().sub(hip),distance=d.length();d.normalize();
 const reach=L1+L2-.02;
 if(distance>reach)hip.addScaledVector(d,distance-reach);
 const dl=ankle.distanceTo(hip),ax=(L1*L1-L2*L2+dl*dl)/(2*dl);
 const h=Math.sqrt(Math.max(0,L1*L1-ax*ax));
 const forward=V3(0,0,-1).addScaledVector(upC,upC.z).normalize();
 const bend=forward.addScaledVector(d,-forward.dot(d));
 if(bend.lengthSq()<1e-6)bend.copy(upC).addScaledVector(d,-upC.dot(d));
 bend.normalize();
 return {hip,knee:hip.clone().addScaledVector(d,ax).addScaledVector(bend,h)};
}
function combatEffects(dt){
 const a=COMBAT.foot,E=G.E;
 COMBAT_STAGE.boot.visible=!!a&&G.mode==='fight'&&!G.inputLocked;
 if(a){
  if(!E||G.inputLocked||G.tool!=='hand'){COMBAT.foot=null;COMBAT_STAGE.boot.visible=false;return;}
  a.t+=dt;
  if(!a.obj.parent||a.obj.userData.detached){COMBAT.foot=null;return;}
  const target=a.obj.localToWorld(a.local.clone());
  const boot=COMBAT_STAGE.boot;
  /* 밟기: 무릎을 먼저 들어 올리고(발은 무릎 아래 축 늘어진다) 발바닥을 표적에 내리꽂는다.
   * 카메라가 아래를 내려다보고 있어 세상의 '아래'는 화면 아래쪽+앞쪽으로 기울어 있다.
   * 그 방향을 카메라 기울기에서 구해 발바닥이 바닥과 나란히 닿게 한다. 접촉(.27)·끝(.6) 시간. */
  const scr=target.clone().project(camera),nx=clamp(scr.x,-.9,.9),ny=clamp(scr.y,-.9,.9),t=a.t;
  const pr=innerWidth<innerHeight;
  const upC=V3(0,1,0).applyQuaternion(camera.quaternion.clone().invert()); // 세상의 위쪽(카메라 기준)
  const pitch=Math.atan2(upC.z,upC.y);                                      // 카메라가 내려다보는 각
  const S=VM.at(.3,-1.65,.94);                                              // 화면 아래 바깥: 서 있는 발
  const C=VM.at(nx*.1+.04,pr?-1.12:-1.18,.92);                               // 무릎을 들었을 때 매달린 발: 화면 아래 바깥
  const Tg=VM.at(nx,ny,pr?1.08:1.02);                                       // 표적
  const Td=Tg.clone().addScaledVector(upC,-.03);                            // 살에 조금 파묻힌 자리
  const P=boot.position;
  let toe;                                                                  // 발끝 각: 음수면 발끝이 늘어지고 0이면 발바닥이 바닥과 나란함
  if(t<.17){const u=smooth(t/.17);P.copy(S).lerp(C,u);toe=-.55*u;}
  else if(t<.27){const u=easeIn3((t-.17)/.1);P.copy(C).lerp(Td,u);toe=lerp(-.55,.06,u);}
  else if(t<.36){const u=(t-.27)/.09;P.copy(Td).addScaledVector(upC,.012*Math.sin(u*PI));toe=.06;}
  else{const u=smooth((t-.36)/.24);P.copy(Td).lerp(S,u);P.addScaledVector(upC,.12*Math.sin(u*PI));toe=lerp(.06,-.4,Math.sin(u*PI));}
  boot.rotation.set(pitch+toe,nx*.16,-.06);
  // 발바닥 가운데(발볼과 뒤꿈치 사이)가 표적에 닿게 발 위치를 맞춘다
  P.sub(V3(-.002,.022,-.03).applyQuaternion(boot.quaternion));
  boot.updateMatrixWorld(true);
  // 앞쪽으로 굽는 무릎. 발목보다 높은 골반과 실제 도달 거리로 한쪽 굽힘 방향을 유지한다.
  const ankleL=V3(.002,.18,.073),ankleW=boot.localToWorld(ankleL.clone());
  const leg=stompLegPose(ankleW,upC);
  const kneeL=boot.worldToLocal(leg.knee),hipL=boot.worldToLocal(leg.hip);
  const segment=(mesh,from,to)=>{const v=to.clone().sub(from),len=v.length();mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(UP,v.divideScalar(len||1));mesh.scale.y=len;};
  segment(COMBAT_STAGE.shin,ankleL,kneeL);segment(COMBAT_STAGE.thigh,kneeL,hipL);COMBAT_STAGE.knee.position.copy(kneeL);
  if(!a.swung&&t>=.17){a.swung=true;AUDIO.whoosh(.85,'hook');}
  if(!a.done&&a.t>=.27){
   a.done=true;
   resolveHit('hand','jab',{obj:a.obj,point:target,normal:UP.clone(),dir:V3(0,-1,-.12),part:a.part},'R',{powerMul:1.8,stomp:true});
   AUDIO.fall('floor');COMBAT.landKick=1.6;camHit({shake:.045});
   G.hitstop=Math.max(G.hitstop,.055);
  }
  if(a.t>.6){COMBAT.foot=null;boot.visible=false;}
 }
 const grip=E&&combatActive(E)&&E.combat.grab;
 if(grip){
  const chest=E.bones.chest.getWorldPosition(_combatV).project(camera);
  VM.grip(chest.x,chest.y);
 }else VM.grip(null,null);
 COMBAT_STAGE.dust.rotation.y+=dt*.004;
}
function combatCancel(){
 const E=G.E;if(E&&E.combat)E.combat.release(true);
 COMBAT.pointer=null;COMBAT.foot=null;COMBAT_STAGE.boot.visible=false;VM.grip(null,null);
 canvas.classList.remove('grabbing');
}
function combatGrab(p){
 const E=G.E;if(!combatActive(E)||!p.grabbable||COMBAT.foot)return false;
 if(!E.combat.beginGrab())return false;
 E.endAct();E.taunt=false;if(E.tabletHeld)E.dropTablet();
 p.grabbing=true;p.decided=true;COMBAT.pointer=p.id;
 VM.st.acts.length=0;canvas.classList.add('grabbing');AUDIO.pull(.6);
 hint('위로 끌어 세우기 · 옆이나 아래로 던지기',2.4);
 return true;
}

let hintUntil=0;
function hint(text,dur=3.6){const el=$('#hint');el.textContent=text;el.classList.remove('off');hintUntil=G.time+dur;}

/* ---- 순응 화면의 대사와 작가가 지정한 부활 한마디. 일반 피격 추임새는 띄우지 않는다. ---- */
const TALK={q:[],cur:null,gap:0};
function clearTalk(){
 TALK.q.length=0;
 if(TALK.cur)BUB.cut(TALK.cur.b);
 TALK.cur=null;TALK.gap=0;
 if(G.E)G.E.talkUntil=0;
}
// lines: [[누가('boss'|'player'), 말, 떠 있는 최소 시간(초, 0이면 글 길이로), 앞 대사가 끝나고 기다릴 시간, 글자 크기 배수, 녹음 파일 글, 추임새 여부], …]
function queueTalk(lines,replace=false){
 if(replace)clearTalk();
 for(const x of lines)TALK.q.push({who:x[0],text:x[1],dur:x[2]||0,delay:x[3]||0,size:x[4]||1,tts:x[5]||null,quip:!!x[6]});
}
function talkBusy(){return !!(TALK.cur||TALK.q.length||TALK.gap>0);}
// 천지신명이 지금 하는 말과 줄 서 있는 말을 다 마칠 때까지 남은 시간(초). 글자가 다 찍히는 때가 목소리가 끝나는 때다
function bossTalkLeft(){
 const now=G.time,c=TALK.cur;let end=now,free=now+Math.max(0,TALK.gap);
 if(c){if(c.who==='boss')end=Math.max(end,c.b.t0+typeTime(c.text,VOICE.boss.speed));free=Math.max(now,c.b.until)+.12;}
 for(const n of TALK.q){
  const start=free+Math.max(0,n.delay),speed=n.who==='boss'?VOICE.boss.speed:VOICE.player.speed,spoken=start+typeTime(n.text,speed);
  if(n.who==='boss')end=Math.max(end,spoken);free=Math.max(spoken+.6,start+(n.dur||0))+.12;
 }
 return end-now;
}
// 설계자 말풍선 자리: 꼬리는 입을 가리키고, 아랫변은 면류관 위에. 위에 자리가 없으면 머리 옆에 띄운다
function bossAnchor(E){const rep=E.headKind==='rep';return {obj:rep?E.repFaceG:E.face,off:rep?V3(0,-.118,.17):V3(0,-.1,.2),top:rep?.38:.50,r:rep?.16:.2,cam:'main',speaker:E};}
function updateTalk(dt){
 if(G.free&&TALK.cur?.quip&&(!G.E||G.E.headGone||G.E.jawGone||(G.E.headDestroyed&&!deityHasReptileVoice(G.E))))clearTalk();
 if(G.mode==='fight'&&!G.opening&&!G.walking&&!(G.revival&&G.revival.spoken)){
  // 족치는 중에는 첫 타격의 내 외침과 설계자의 추임새만 추가로 허용한다.
  const allowed=(TALK.cur&&(TALK.cur.quip||TALK.cur.who==='player'))||(TALK.q.length&&(TALK.q[0].quip||TALK.q[0].who==='player'));
  if(!allowed){if(talkBusy())clearTalk();return;}
 }
 if(TALK.cur){
  const c=TALK.cur,b=c.b;
  if(b.voice&&b.voice.busy){
   if(G.time<c.voiceUntil){b.until=Math.max(b.until,G.time+.15);if(b.voice.started&&G.E&&c.who==='boss')G.E.talkUntil=G.time+.1;return;}
   b.voice.stop(); // A missing device voice must not leave the revival locked.
  }
  // 첫 질문은 음성이 끝나면 곧바로 응답한다. 다른 대사의 읽기 여유는 그대로 둔다.
  const quickReply=G.opening&&c.text===LINES.opening&&TALK.q[0]?.text===LINES.greeting;
  if(quickReply&&b.voice&&b.voice.started&&!b.voice.busy)b.until=Math.min(b.until,G.time);
  if(G.time<b.until)return;TALK.cur=null;TALK.gap=quickReply?.04:.12;
  if(G.mode==='submit'&&c.text===LINES.submit[0][0]&&!INTRO.sermonHeard){
   INTRO.sermonHeard=true;$('#crumpleHint').classList.remove('off');
  }
  if(c.text===LINES.firstHit&&c.who==='player'&&!G.ended)G.musicStarted=true;
  return;
 }
 if(TALK.gap>0){TALK.gap-=dt;return;}
 const n=TALK.q[0];if(!n)return;
 n.delay-=dt;if(n.delay>0)return;
 TALK.q.shift();
 const E=G.E,player=n.who==='player';if(!E||(!player&&(E.headGone||E.jawGone)))return;
 const anchor=player?{player:true}:bossAnchor(E),voice=player?VOICE.player:VOICE.boss;if(n.quip)anchor.toMouth=true;
 TALK.cur={b:BUB.say(anchor,n.text,n.dur,{voice,size:n.size,read:[.6,.03],tts:n.tts}),voiceUntil:G.time+4,quip:n.quip,who:n.who,text:n.text};
 // 글자가 찍히는 동안 입이 움직인다
 if(!player)E.talkUntil=G.time+typeTime(n.text,VOICE.boss.speed)+.08;
 // 추임새는 아프다가도 그 순간만 비웃는 얼굴로 돌아와 말한다(허둥대던 손도 그 동안만 멈추고, 떨림도 잦아든다)
 if(n.quip&&!G.free){E.setEmotion('smug');E.shockT=Math.max(E.shockT||0,1.7);E.panic=0;E.calmUntil=G.time+1.7;if(E.act&&E.act.prio<2)E.endAct();}
}

function startEncounter(){
 if(G.free){G.opening=false;G.encounterRaising=false;G.inputLocked=false;$('#dock').hidden=false;hint(HINTS[G.tool],4.5);if(G.E)G.E.idleT=3;focusCanvas();return;}
 G.opening=true;G.encounterRaising=false;G.inputLocked=true;clearPointers();
 VM.lowerHands();VM.update(0,false,0);
 $('#dock').hidden=true;$('#hint').classList.add('off');
 queueTalk([
  ['boss',LINES.opening,1.1,.15,1.2,LINES.opening],
  ['player',LINES.greeting,1.8,.08,1.1,LINES.greeting]
 ],true);
 if(G.E)G.E.idleT=6.5;
}
function updateEncounter(){
 if(!G.opening||G.mode!=='fight'||G.ended||G.revival||G.walking)return;
 // 특정 말풍선의 종료 분기 한 번에 의존하지 않는다. 입력이 없어도 전환을 마친다.
 if(TALK.cur||TALK.q.length)return;
 if(!G.encounterRaising){G.encounterRaising=true;VM.raiseHands();}
 if(VM.st.guardLift>=1)finishEncounter();
}
function finishEncounter(){
 if(!G.opening)return;
 G.opening=false;G.encounterRaising=false;clearPointers();
 if(G.mode!=='fight'||G.ended||G.revival)return;
 G.inputLocked=false;$('#dock').hidden=false;VM.computeRest();
 hint(HINTS[G.tool],4.5);focusCanvas();
}
function firstStrikeLine(){
 G.opening=false;
 queueTalk([['player',LINES.firstHit,1.3,0,1.4,LINES.firstHit]],true);
}

/* Optional combat accents: successful hits only, never a playlist or a queued
 * reward. A round has at most two player lines and two non-human leaks. */
const COMBAT_LINES={hand:'탈운명 펀치!',knife:'탈운명 칼빵!',gun:'탈운명 샷!'};
const SLASH_LINE='베나이다.';
// headDestroyed keeps the detached human face inactive after regrowth, too.
// headGone clears only when the replacement head has finished growing.
function deityHasReptileVoice(E){return !!E&&!E.headGone&&E.headKind==='rep';}
const COMBAT_VOICE={n:0,last:-99,used:new Set(),slashLast:-99,slashStroke:null,playerUntil:0,uncannyN:0,uncannyForms:new Set(),uncannyLast:-99,uncannyUntil:0,uncannyCheck:-99};
function combatVoiceReset(){
 Object.assign(COMBAT_VOICE,{n:0,last:-99,slashLast:-99,slashStroke:null,playerUntil:0,uncannyN:0,uncannyLast:-99,uncannyUntil:0,uncannyCheck:-99});
 COMBAT_VOICE.used.clear();
 COMBAT_VOICE.uncannyForms.clear();
}
function combatVoiceWindow(){
 const E=G.E;
 return G.mode==='fight'&&G.started&&!G.paused&&!G.opening&&!G.walking&&!G.ended&&!G.inputLocked
  &&!G.revival&&!G.revivalPending&&!G.crowdBeatUntil&&!G.offerPending&&!G.offerOpen
  &&!!E&&E.state!=='dead'&&!(E.down&&E.down.type==='final')&&!talkBusy();
}
function combatPlayerVoiceBusy(){return G.time<COMBAT_VOICE.playerUntil;}
function uncannyVoiceBusy(){return G.time<COMBAT_VOICE.uncannyUntil;}
function uncannyVoiceAllowed(name){
 const c=COMBAT_VOICE,E=G.E;
 if(!/^(yelp|scream|reptile)$/.test(name)||!combatVoiceWindow()||combatPlayerVoiceBusy()
  ||c.uncannyN>=2||G.time-G.t0<7||G.time-c.uncannyLast<16||G.time-c.last<5||G.time<c.uncannyCheck
  ||E.headGone||(E.headDestroyed&&!deityHasReptileVoice(E))||E.jawGone||COMBAT_VOICE.uncannyForms.has(deityHasReptileVoice(E)?'reptile':'human')
  ||!(G.bar<72||deityHasReptileVoice(E)))return false;
 c.uncannyCheck=G.time+1.4;
 return Math.random()<.22;
}
function uncannyVoiceStarted(){
 const c=COMBAT_VOICE;c.uncannyN++;c.uncannyLast=G.time;c.uncannyUntil=G.time+1.4;
 c.uncannyForms.add(deityHasReptileVoice(G.E)?'reptile':'human');
}
function clearCombatAccent(){
 const c=COMBAT_VOICE;c.playerUntil=0;c.uncannyUntil=0;
 const isAccent=n=>n&&(n.text===SLASH_LINE||Object.values(COMBAT_LINES).includes(n.text));
 if(isAccent(TALK.cur)||TALK.q.some(isAccent))clearTalk();
 AUDIO.hushCombatAccent();
}
function combatHitLine(tool,kind,info,r,extra={}){
 if(tool==='knife'&&kind==='slash')return slashHitLine(info,r,extra);
 const c=COMBAT_VOICE,text=COMBAT_LINES[tool];
 if(!text||!combatVoiceWindow()||uncannyVoiceBusy()||G.time-c.uncannyLast<4||c.n>=2
  ||c.used.has(tool)||G.time-G.t0<8||G.time-c.last<18||G.time-QUIP.last<4
  ||r.blocked||r.halo||!(r.dmg>0)||extra.through||extra.quiet||extra.stomp
  ||/^(crown|halo|tablet)$/.test(info.part)||!AUDIO.combatLineReady(text))return false;
 if(tool==='hand'&&!/^(jab|hook|upper)$/.test(kind))return false;
 if(tool==='knife'&&!/^(stab|slash)$/.test(kind))return false;
 if(tool==='gun'&&kind!=='shot')return false;
 if(Math.random()>.15)return false;
 c.n++;c.last=G.time;c.used.add(tool);c.playerUntil=G.time+2.5;
 AUDIO.hushCombatAccent(true);
 queueTalk([['player',text,1.3,0,1.15,text]]);
 QUIP.next=Math.max(QUIP.next,G.time+6);
 return true;
}

// 실제로 벨 때만, 같은 드래그에서는 한 번만 추첨한다. 찌르기와 빗나간 칼질에는 나오지 않는다.
function slashHitLine(info,r,extra={}){
 const c=COMBAT_VOICE;
 if(!combatVoiceWindow()||uncannyVoiceBusy()||combatPlayerVoiceBusy()||G.time-G.t0<5
  ||G.time-c.slashLast<24||G.time-c.last<8||G.time-QUIP.last<4||G.time-c.uncannyLast<4
  ||r.blocked||r.halo||!(r.dmg>0)||extra.through||extra.quiet||extra.stomp
  ||/^(crown|halo|tablet)$/.test(info.part)||!AUDIO.combatLineReady(SLASH_LINE))return false;
 if(extra.strokeId!=null&&c.slashStroke===extra.strokeId)return false;
 c.slashStroke=extra.strokeId??null;
 if(Math.random()>.3)return false;
 c.slashLast=c.last=G.time;c.playerUntil=G.time+2.5;
 AUDIO.hushCombatAccent(true);
 queueTalk([['player',SLASH_LINE,1.3,0,1.15,SLASH_LINE]]);
 QUIP.next=Math.max(QUIP.next,G.time+6);
 return true;
}

/* ---- 추임새: 뭘 하고 있든 뜬금없이 「운명 최고」 ----
 * 첫 타격 뒤 10~18초에 한 번, 그 뒤로는 22~40초마다(한 판에 서너 번꼴. 추종자 장면·되살림 동안 못 한 건 끝나고 몇 초 뒤에 나온다).
 * 팔다리·머리가 떨어지거나 쓰러진 직후에는 세 번에 한 번꼴로 1초쯤 뒤에 한마디 더.
 * 시작 대사·추종자 장면·되살림·엔딩 중에는 하지 않고, 머리가 없으면 못 한다. 말하는 중에 맞아도 끝까지 말한다. */
const QUIP={next:0,last:-99,n:0};
function quipReset(){QUIP.next=0;QUIP.last=-99;QUIP.n=0;}
function quipAllowed(){
 const E=G.E;
 return G.mode==='fight'&&G.started&&!G.paused&&!G.walking&&!G.opening&&!G.ended&&!G.inputLocked&&!G.revival&&!G.revivalPending&&!G.crowdBeatUntil&&!G.offerPending&&!G.offerOpen
  &&(!G.free||(!FREE.busy&&!!E&&(!E.headDestroyed||deityHasReptileVoice(E))))
  &&!!E&&!E.headGone&&!E.jawGone&&E.state!=='dead'&&!(E.down&&E.down.type==='final')&&!talkBusy()&&!uncannyVoiceBusy()&&!combatPlayerVoiceBusy();
}
function sayQuip(){
 QUIP.last=G.time;QUIP.n++;
 const text=G.free?LINES.freeApology[(QUIP.n-1)%LINES.freeApology.length]:LINES.quip;
 if(G.free)AUDIO.hushCombatAccent(true);
 queueTalk([['boss',text,G.free?0:1.3,0,G.free?1:1.35,null,true]]);
}
function updateQuip(){
 if(G.mode!=='fight'||!G.started||G.ended||G.paused)return;
 // 천지신명 정육공장에서는 지정된 사과 두 마디만 번갈아, 충분한 간격을 두고 말한다.
 if(!QUIP.next)QUIP.next=G.time+rnd(10,18);
 if(G.time<QUIP.next)return;
 if(!quipAllowed()){QUIP.next=G.time+rnd(2,5);return;}
 sayQuip();QUIP.next=G.time+(G.free?rnd(24,38):rnd(22,40));
}
// 큰 사건 직후: 가끔 한마디(마지막 추임새에서 14초는 지나야 한다)
function quipChance(){
 if(G.mode!=='fight'||!G.started||G.ended||G.free||G.time-QUIP.last<14||Math.random()>.35)return;
 QUIP.next=Math.min(QUIP.next||1e9,G.time+rnd(.9,1.5));
}

/* ---- 맞히기: 화면 좌표 → 운명 설계자 몸 ---- */
const ray=new THREE.Raycaster(),nmat=new THREE.Matrix3();
function visibleChain(o){for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;}
// 맞힐 수 있는 메시 목록(행렬도 이때 한 번 갱신). 칼로 그을 때는 한 번 만들어 여러 점에 같이 쓴다
function pickList(){
 const E=G.E;if(!E)return null;E.root.updateWorldMatrix(true,true);camera.updateMatrixWorld(true);
 return E.parts.filter(o=>o.parent&&!o.userData.detached&&visibleChain(o)&&(o.userData.part!=='tablet'||E.tabletHeld)&&(o.userData.part!=='crown'||E.crownOn!==false)&&(o.userData.part!=='halo'||(E.halo&&E.halo.on)));
}
const _rv2d=new THREE.Vector2();
function pickAll(x,y,list,frontOnly=false){
 const E=G.E;if(!E)return [];if(!list)list=pickList();
 ray.setFromCamera(_rv2d.set(x/innerWidth*2-1,1-y/innerHeight*2),camera);
 const out=[];
 for(const h of ray.intersectObjects(list,false)){if(h.object.userData.detached||!visibleChain(h.object))continue;
  nmat.getNormalMatrix(h.object.matrixWorld);const n=h.face?h.face.normal.clone().applyMatrix3(nmat).normalize():ray.ray.direction.clone().negate();
  if(n.dot(ray.ray.direction)>0)n.negate();
  // 머리 살 한 덩어리는 맞은 자리로 부위 이름을 나눈다(코·입·얼굴·머리)
  let part=h.object.userData.part||'chest';
  if(h.object.userData.partAt){const lp=h.object.worldToLocal(h.point.clone());part=h.object.userData.partAt(lp)||part;}
  out.push({obj:h.object,point:h.point.clone(),normal:n,part,dir:ray.ray.direction.clone(),dist:h.distance});
  if(frontOnly)break;
 }
 return out;
}
function pickAt(x,y,list){return pickAll(x,y,list,true)[0]||null;}
const HOLD_GRAB_SECONDS=.38;
const POWER={hand:{jab:1.15,hook:1.5,upper:1.65,shove:1.2},knife:{stab:.95,slash:.45},gun:{shot:1.8}};
const SLASH_GAUGE_SCALE=.60; // 한 번 그을 때의 상처·부위 반응과 별도로 체력 피해만 조절한다.
const SLASH_BUDGET=.90; // base damage available to one cut, replenished during a continuous drag
// 멈춤(히트스톱) 길이: 이 동안 맞은 모습 그대로 멈춰 있다
const STOP={hand:{jab:.036,hook:.05,upper:.058,shove:.05},knife:{stab:.045,slash:.014},gun:{shot:.018}};
const WORDS={jab:['퍽!','빡!','뻑!'],hook:['퍼억!','빠악!'],upper:['빠악!','뻐억!'],body:['퍽!','뻑!','퍼억!'],stab:['푹!','쑤욱!'],slash:['촤악!','쫘악!']};
function resolveHit(tool,kind,info,side,extra={}){
 const E=G.E;if(!E||!info||G.inputLocked)return {hit:false};
 const gaugeEligible=combatActive(E)||E.state==='stand';
 const dir=info.dir.clone();const s=side==='L'?-1:1;
 if(kind==='hook')dir.add(V3(-s*1.15,0,0));else if(kind==='upper')dir.add(V3(0,1.3,0));
 dir.normalize();
 const power=((POWER[tool]||{})[kind]||1)*(extra.powerMul||1);
 const stroke=extra.stroke;
 let accent=true;
 if(stroke){
  const elapsed=G.time-(stroke.at??G.time);
  stroke.damage=Math.min(SLASH_BUDGET,(stroke.damage??SLASH_BUDGET)+elapsed*2.2);
  stroke.at=G.time;
  accent=G.time>=(stroke.nextAccent??0);
  if(accent)stroke.nextAccent=G.time+.13;
 }
 const firstStrike=!G.started;
 if(firstStrike){G.started=true;G.t0=G.time;}
 G.lastHit=G.time;
 if(G.revived&&!G.musicStarted)G.musicStarted=true; // 되살아난 뒤 첫 타격: 꺼 두었던 음악이 함께 다시 시작한다
 if(accent&&!extra.through&&!extra.quiet)AUDIO.duck();
 const r=E.takeHit({tool,kind,part:info.part,point:info.point,normal:info.normal,dir,obj:info.obj,power,slashFrom:extra.slashFrom,slashPath:extra.slashPath,strokeId:extra.strokeId,through:extra.through});
 if(stroke){r.dmg=Math.min(r.dmg,stroke.damage);stroke.damage-=r.dmg;}
 if(G.free&&tool==='knife'&&kind==='slash')FREE.waistSlash(info,extra);
 if(firstStrike)firstStrikeLine();
 // 되살림이 미뤄져 있는 동안(5%에서 누워 있을 때)은 맞아도 균형이 안 깎인다: 일어나는 길에 다시 쓰러지지 않고 서자마자 컷씬으로 간다
 if(combatActive(E)&&!r.halo&&!G.revivalPending){E.combat.hit({kind:extra.stomp?'stomp':kind,dx:dir.x,dz:extra.stomp?0:dir.z,power,blocked:r.blocked});}
 G.hits++;
 const stop=((STOP[tool]||{})[kind]||.06)*(r.blocked?.75:1)+(r.big?.05:0);
 G.hitstop=Math.max(G.hitstop,extra.through||!accent?0:stop);
 if(r.big)G.slow=Math.max(G.slow,.3);
 if((accent||r.big)&&!extra.quiet){impactFX(tool,kind,info,r,dir,s,extra);if(!extra.through)AUDIO.hit(tool,kind,info.part,power,r.blocked);}
 if(accent&&PREF.vibe&&navigator.vibrate&&!extra.quiet)try{navigator.vibrate(r.blocked?10:tool==='gun'?26:kind==='slash'?6:kind==='jab'?16:[20,8,26]);}catch(_){}
 if(accent&&!r.halo&&!extra.through)CROWD.witnessHit(power);
 damageBar(kind==='slash'?r.dmg*SLASH_GAUGE_SCALE:r.dmg,r,gaugeEligible);
 if(!firstStrike&&accent)combatHitLine(tool,kind,info,r,extra);
 return {hit:true,blocked:r.blocked,hard:!!r.halo,blood:!r.blocked&&!r.halo&&(tool==='knife'||tool==='gun'||E.noseBleeding||E.lipSplit||E.faceCuts>0)};
}
/* 맞은 자리 효과 + 카메라 */
function impactFX(tool,kind,info,r,dir,s,extra){
 const pt=info.point,n=info.normal,head=r.isHead;
 if(r.blocked){
  if(!G.free)FX.add('star',FX.lift(pt,n,.05),{size:.13,life:.1,color:'#d9d6e6'});FX.word('탁!',pt,{size:34,color:'#e6e2f2'});
  camHit({shake:.012});return;
 }
 // 후광: 불꽃 튀는 금속
 if(r.halo){
  if(!G.free)FX.add('star',FX.lift(pt,n,.03),{size:.12,life:.09,color:'#fff3b8'});
  if(!G.free)for(let i=0;i<7;i++)FX.add('glint',FX.lift(pt,n,.03),{size:rnd(.025,.045),life:rnd(.18,.32),start:1,grow:-.6,fade:1.5,vel:V3(rnd(-1.4,1.4),rnd(-.4,1.6),rnd(.2,1)),drag:3,color:'#ffd35a'});
  FX.word(pick(['깡!','쨍!','팅!']),pt,{size:tool==='gun'?44:50,color:'#ffe066',dx:-s*rnd(60,100),dy:-24});
  camHit({shake:.012});return;
 }
 if(tool==='hand'){
  const big=kind!=='jab';
  if(!G.free)FX.add('star',FX.lift(pt,n,.05),{size:big?.17:.12,life:big?.12:.1});
  if(!G.free)FX.add('glint',FX.lift(pt,n,.07),{size:.07,life:.09,start:.4,grow:1.2});
  if(!G.free&&(kind==='upper'||r.heavy))FX.add('ring',FX.lift(pt,n,.04),{size:.17,life:.16,start:.4,grow:1.6,fade:1});
  const list=head?(WORDS[kind]||WORDS.jab):WORDS.body;
  // 글자는 얼굴을 덮지 않게 주먹이 날아온 반대쪽 옆에 띄운다
  if(!combatActive(G.E))FX.word(pick(list),pt,{size:kind==='jab'?46:kind==='hook'?56:62,color:kind==='upper'?'#ff5640':kind==='hook'?'#ffa23a':'#ffd84a',rot:kind==='hook'?s*-12:undefined,dx:-s*rnd(70,110),dy:-20});
  camHit({shake:kind==='jab'?.016:kind==='hook'?.02:.022});
 }else if(tool==='knife'){
  if(kind==='stab'){
   FX.add('bl',FX.lift(pt,n,.04),{size:.12,life:.1});
   for(let i=0;i<3;i++)FX.add('mist',FX.lift(pt,n,.03),{size:rnd(.07,.11),life:rnd(.35,.5),start:.5,grow:1.6,top:false,vel:n.clone().multiplyScalar(rnd(.25,.6)).add(V3(rnd(-.2,.2),rnd(-.05,.25),0)),drag:4,fade:1.4});
   FX.word(pick(WORDS.stab),pt,{size:46,color:'#ff6a55',dx:-rnd(70,110)});
   camHit({shake:.016});
  }else{
   FX.add('mist',FX.lift(pt,n,.02),{size:rnd(.05,.08),life:rnd(.3,.45),start:.5,grow:1.5,top:false,vel:n.clone().multiplyScalar(rnd(.2,.5)).add(V3(rnd(-.15,.15),rnd(0,.2),0)),drag:4,fade:1.4});
   if(extra.firstCut)FX.word(pick(WORDS.slash),pt,{size:50,color:'#ff6a55',rot:rnd(-20,20),dx:rnd(-90,90)});
   camHit({shake:.007});
  }
 }else if(tool==='gun'){
  FX.add('bl',FX.lift(pt,n,.04),{size:.1,life:.08});
  if(!G.free)FX.add('star',FX.lift(pt,n,.05),{size:.07,life:.05,color:'#fff4dc'});
  const back=V3().copy(dir);
  for(let i=0;i<2;i++)FX.add('mist',FX.lift(pt,n,.02),{size:rnd(.08,.13),life:rnd(.4,.6),start:.4,grow:1.8,top:false,vel:n.clone().multiplyScalar(rnd(.35,.9)).add(V3(rnd(-.25,.25),rnd(-.05,.3),rnd(-.1,.1))),drag:3.5,fade:1.3});
  for(let i=0;i<2;i++)FX.add('mist',_fxv.copy(pt).addScaledVector(back,.22),{size:rnd(.1,.16),life:rnd(.4,.6),start:.5,grow:1.7,top:false,vel:back.clone().multiplyScalar(rnd(.6,1.4)).add(V3(rnd(-.3,.3),rnd(0,.3),0)),drag:3,fade:1.3});
  if(!G.free&&head)FX.add('ring',FX.lift(pt,n,.04),{size:.13,life:.13,start:.4,grow:1.5,fade:1,color:'#ffd9cf'});
 }
 if(r.big){camHit({shake:.03});}
}
const _fxv=V3();
function wireEmperor(E){
 E.onImpact=onImpact;E.onDead=onDead;E.onRise=onRise;E.onRiseStart=onRiseStart;E.onLegFall=onLegFall;E.onBigEvent=quipChance;
 E.onCough=()=>{if(E.headDestroyed)return;AUDIO.voice('cough',1);E.face.updateWorldMatrix(true,false);BLOOD.spray(E.face.localToWorld(V3(0,-.12,.2)),V3(0,.1,1),PREF.blood?16:6,{max:1.6});};
}
function focusCanvas(){requestAnimationFrame(()=>{try{canvas.focus({preventScroll:true});}catch(_){canvas.focus();}});}
function anchorCombatStory(E,recover){
 if(!E||!E.combat)return;
 const b=E.combat;
 b.vx=b.vz=0;b.exit=null;
 COMBAT.storyAnchor={x:b.x,z:b.z};
 CROWD.root.position.set(b.x,0,b.z);
 if(recover&&b.canRise&&(b.mode==='ground'||b.mode==='fall'))b.change('rise');
 // 비틀거리던 중이면 장면 동안 넘어지지 않게 바로 서게 한다
 if(b.mode==='stagger'){b.change('stand');b.balance=b.poise;}
}
function openOffer(){
 if(G.mode!=='fight'||G.ended||G.offerOpen||G.offerBreaking)return;
 clearCombatAccent();
 G.offerAt=0;G.offerPending=false;G.offerOpen=true;G.inputLocked=true;clearPointers();
 const sc=$('#offerScene');sc.hidden=false;sc.className='story-scene';$('#dock').hidden=true;
 if(G.E&&G.E.down)G.E.down.stay=Math.max(G.E.down.stay,1e6);
 requestAnimationFrame(()=>$('#offerPaper').focus());
}
function finishOffer(){
 resetOfferScene();
 G.offerOpen=false;G.offerBreaking=false;G.offerBreakAt=0;G.inputLocked=false;$('#dock').hidden=false;
 if(G.E&&G.E.down)G.E.down.stay=Math.min(G.E.down.stay,.35);
 hint(HINTS[G.tool],2.8);
 focusCanvas();
}
function enterCrowd(){ // 50%: 둘이 화면 양옆에서 뛰어들어 내 팔을 붙잡는다
 if(G.crowdEntered||G.revivalUsed)return;
 clearCombatAccent();
 G.crowdEntered=true;G.inputLocked=true;clearPointers();$('#dock').hidden=true;
 anchorCombatStory(G.E,true);
 G.crowdBeatUntil=G.time+3.5;
 CROWD.grabStart(G.time);
}
function warnCrowd(){ // 25%: 넷이 설계자 앞을 막아선다
 if(G.crowdWarned)return;clearCombatAccent();G.crowdWarned=true;G.inputLocked=true;clearPointers();$('#dock').hidden=true;
 anchorCombatStory(G.E,true);
 G.crowdBeatUntil=G.time+4.1;
 CROWD.wallStart(G.time);
}
/* 5%: 되살리기 컷씬
 * 카메라는 족칠 때 자리 그대로 둔다(다가가거나 물러서지 않는다).
 * 0.0 마지막 타격, 멈춤 → 천지신명이 무너진다(2.4초. 누워 있었으면 마지막으로 일어나 보려다 무너진다). 사람들은 제자리에서 지켜만 본다. 음악은 여기서부터 2.6초에 걸쳐 꺼진다
 *     (되살아난 뒤 첫 타격과 함께 처음부터 다시 시작)
 * 2.7 (REV_SHIFT) 사람들이 뛰어와 꿇고 운다 → 이 뒤 시각은 전부 REV_SHIFT만큼 밀린 것
 * 3.0 천지신명이 손을 든다 / 사람들이 손을 모은다
 * 3.5 소원의 불씨가 손바닥으로 모인다(2.3초)
 * 6.2 손을 가슴으로 → 6.55 박힘: 금빛 과노출, 그 안에서 몸을 갈아 끼운다(6.9)
 * 7.1 빛이 걷힌다 → 7.8 자기 운세 종이를 확인하고 「운명 확정」 도장을 본 뒤 안도 → 9.05 만세 → 9.65 '암백ㅋ'와 TTS → 다시 1인칭 */
function beginRevival(){
 const E=G.E;if(!E||G.revivalUsed)return false;
 // 넘어지는 중이면 바닥에 닿아 잠깐 누워 있을 때까지 미룬다. 누워 있거나 막 일어나던 중이면 다 일어서지 않고
 // 마지막으로 일어나 보려다 무너진다(lastTry). 다리가 잘려 못 일어나면 그 자리에서 늘어지고, 서 있으면 서서 무너진다
 const c=combatActive(E)?E.combat:null,mode=c&&c.mode;
 if(c?(mode==='fall'||(mode==='ground'&&c.age<.45)):E.state!=='stand')return false;
 const lastTry=!!c&&c.canRise&&(mode==='ground'||(mode==='rise'&&c.age<window.FateMotion.TIMING.rise*.58));
 clearCombatAccent();
 G.revivalUsed=true;G.revivalPending=false;G.inputLocked=true;G.crowdBeatUntil=0;clearPointers();$('#dock').hidden=true;VM.root.visible=false;
 anchorCombatStory(E,false);
 $('#fight .gauge').style.visibility='hidden';clearTalk();
 if(E.tabletHeld)E.dropTablet(V3(-2.4,.45,.7));
 E.startFall('final',{lastTry});E.haloStage(4);G.hitstop=Math.max(G.hitstop,.3);G.slow=Math.max(G.slow,.5);flash(.3);
 // 음악: 무너지는 동안 천천히 꺼져서 추종자들이 뛰어올 때는 조용하다. 되살아난 뒤 첫 타격에 처음부터 다시 시작한다
 G.musicStarted=false;AUDIO.stopMusic(true,REV_MUSIC_FADE);
 G.revival={at:G.time,raised:false,cam1:false,gather:false,chest:false,impact:false,swapped:false,released:false,stamped:false,cheered:false,home:false,spoken:false};
 CROWD.reviveStart(G.time,E);
 return true;
}
function flashHold(color,a,rise){const el=$('#flash');el.style.background=color;el.style.transition='opacity '+rise+'s';el.style.opacity=a;}
function flashRelease(dur){const el=$('#flash');el.style.transition='opacity '+dur+'s';el.style.opacity=0;setTimeout(()=>{el.style.background='#fff';},dur*1000+60);}
function replaceEmperorForRevival(){
 const old=G.E;if(!old)return;
  // 기존 섬광 안에서 옛 신체만 정리한다. 피 자국·동전·돈다발은 무대에 남긴다.
  // 옛 몸에서 떨어진 후광·후광 조각·넥타이·면류관도 함께 걷는다(옛 몸이 더는 움직이지 않아 굴러가다 멈춘 채 서 있었고, 새 후광과 둘이 됐다)
  old.clearBodyBits();for(const b of (old.bits||[]).slice())old.retireBit(b);old.bits=[];CHUNKS.clear();
  old.reviveGlow=old.hitFlash=old.whiteFlash=0;old.updateMaterials(0);
 old.endAct();old.root.removeFromParent();G.retired.push(old);
 // 되살아난 설계자는 처음처럼 멀쩡하고 거만하다(비웃는 얼굴로 꼿꼿이 선다). 맞기 시작하면 남은 게이지에 따라 다시 무너진다
 const E=new Emperor(G.result,old.lookIndex);E.bloodRawBase=BLOOD.rawLost;E.taunt=true;E.setPhase(0);
 E.idleT=1e9;E.sobT=1e9;E.lookedHand=true;E.reviveGlow=1.7;
 wireEmperor(E);G.E=E;
 combatInit(E,false);if(old.combat){E.combat.x=old.combat.x;E.combat.z=old.combat.z;}
 CROWD.rev.E=E;
 BLOOD.rebindKeepStage(E);if(lite<2){metalEnv(E.root);metalEnv(E.crown);}
 // 떨어진 돈다발은 무대에 하나만 남긴다.
 if(E.tabletHeld){E.tabletHeld=false;E.tabletMesh.visible=false;E.tablet.removeFromParent();}
}
function finishRevival(){
 G.revival=null;G.revived=true;G.inputLocked=false;G.bar=G.shown=G.lag=24;G.kd=3;
 COMBAT.storyAnchor=null;
 $('#fight .gauge').style.visibility='';
 if(G.E){G.E.idleT=2.5;G.E.sobT=G.time+2.5;}
 CROWD.sides();
 VM.root.visible=G.mode==='fight';$('#dock').hidden=false;
 updateGauge();hint(HINTS[G.tool],2.6);
 focusCanvas();
}
function updateStory(){
 if(G.offerPending){if(G.E&&G.E.down)G.E.down.stay=Math.max(G.E.down.stay,1e6);if(!talkBusy())openOffer();}
 if(G.offerOpen&&G.E&&G.E.down)G.E.down.stay=Math.max(G.E.down.stay,1e6);
 if(G.offerBreakAt&&G.time>=G.offerBreakAt)finishOffer();
 if(G.crowdBeatUntil&&G.time>=G.crowdBeatUntil&&!G.revival){G.crowdBeatUntil=0;COMBAT.storyAnchor=null;G.inputLocked=false;$('#dock').hidden=false;hint(HINTS[G.tool],2.2);focusCanvas();}
 // 되살림이 미뤄져 있으면(넘어지는 중) 바닥에 닿아 잠깐 누운 뒤에 시작한다
 if(G.revivalPending&&G.E)beginRevival();
 if(G.revival){
  const r=G.revival,t=G.time-r.at-REV_SHIFT,E=G.E;
  if(t>=3.0&&!r.raised){r.raised=true;if(E)E.revive={k:0,dur:.9,c:0,toChest:false};}
  if(t>=3.5&&!r.gather){r.gather=true;CROWD.gatherStart(2.3);}
  if(t>=6.2&&!r.chest){r.chest=true;if(E&&E.revive)E.revive.toChest=true;}
  if(t>=6.55&&!r.impact){r.impact=true;CROWD.impact();AUDIO.boom(1);flashHold('#fff3cf',.985,.16);if(E)E.reviveGlow=1.7;camHit({shake:.05});
   if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([40,30,60]);}catch(_){}}
  if(t>=6.9&&!r.swapped){r.swapped=true;replaceEmperorForRevival();}
  if(t>=7.1&&!r.released){r.released=true;flashRelease(1.2);}
  if(t>=7.8&&!r.stamped){r.stamped=true;CROWD.restamp();}
  if(t>=9.05&&!r.cheered){r.cheered=true;CROWD.cheer();}
  if(t>=9.65&&!r.spoken){r.spoken=true;queueTalk([['boss',LINES.back,1.7,0,1.45,'암백']]);}
  if(r.spoken&&!talkBusy())finishRevival();
 }
 // 승리 대사가 끝나면 그림자가 지나가고, 그 뒤 고개를 든다.
 if(G.prepAt&&G.time>=G.prepAt){if(BEYOND.prepare(6))G.prepAt=0;}
 if(G.beyondAt&&G.time>=G.beyondAt&&!talkBusy()){
  if(!G.omenAt){G.omenAt=G.time;BEYOND.omen();}
  if(G.time>=G.omenAt+1.6&&(!G.prepAt||G.time>=G.beyondAt+1.5)){G.beyondAt=0;BEYOND.begin();G.againAt=G.time+BEYOND.DUR;}
 }
 if(G.againAt&&G.time>=G.againAt){G.againAt=0;showAgain();}
 // 그 눈에 대고 한마디 다 뱉었으면(글자·목소리·읽을 틈까지) 후임 천지신명한테 간다
 if(G.retorting&&!talkBusy()){G.retorting=false;startRound('fight');}
}
function damageBar(d,o={},fromStand=false){
 if(G.mode!=='fight'||G.ended||!G.E)return;
 const E=G.E;if(!combatActive(E)&&!fromStand&&E.state!=='stand')return;const next=KD_AT[G.kd]??0;
 const amount=Math.max(0,Number(d)||0)*DMG_MUL;if(amount<=0)return;
 if(G.free){
  const nf=Math.max(FREE_FLOOR,G.bar-amount*FREE_DMG);G.bar=G.shown=nf;
  if(combatActive(E)){
   E.combat.setPoise(lerp(.55,1,clamp(nf/100,0,1)));
   const stage=nf<=25?3:nf<=50?2:nf<=75?1:0;if(stage>G.kd){G.kd=stage;E.haloStage(stage);}
   if(!E.taunt)E.setPhase(Math.max(E.phase,nf<=14?4:nf<=38?3:nf<=68?2:1));
  }
  return;
 }
 let nb=Math.max(0,G.bar-amount);
 if(!G.revivalUsed){
  if(!G.crowdEntered&&nb<=50){G.kd=2;E.haloStage(2);G.bar=G.shown=50;gaugeHit();updateGauge();enterCrowd();return;}
  if(G.crowdEntered&&!G.crowdWarned&&nb<=25){G.kd=3;E.haloStage(3);G.bar=G.shown=25;gaugeHit();updateGauge();warnCrowd();return;}
  if(nb<=5){G.bar=G.shown=5;gaugeHit();updateGauge();if(!beginRevival())G.revivalPending=true;return;}
 }
 G.bar=nb;G.shown=nb;gaugeHit();
 // 되살아난 뒤에는 다운 없이 남은 24%를 맞는다: 게이지가 줄어드는 만큼 화남 → 아픔 → 울며 빎 → 다 무너짐
 if(G.revived&&!E.taunt){const ph=nb<=5?4:nb<=11?3:nb<=18?2:1;if(E.phase<ph)E.setPhase(ph);}
 if(combatActive(E)){
  // 맷집: 게이지가 남아 있을수록 많이 버티고(처음엔 잽 열세 대쯤), 바닥에 가까울수록 덜 버틴다(잽 일곱 대쯤)
  const full=G.revived?24:100;E.combat.setPoise(lerp(.55,1,clamp(nb/full,0,1)));
  const stage=nb<=25?3:nb<=50?2:nb<=75?1:0;
  if(stage>G.kd){G.kd=stage;E.haloStage(stage);}
  if(!G.revived&&!E.taunt)E.setPhase(Math.max(E.phase,nb<=12?4:nb<=35?3:nb<=65?2:1));
  if(nb<=0){G.kd=4;E.startFall('final');E.haloStage(4);}
 }else if(G.kd<4&&G.bar<=next+1e-6){G.bar=next;G.shown=next;knockdown();}
 updateGauge();
}
let gaugeHitT=0;
function gaugeHit(){
 const g=$('#fight .gauge'),f=$('#gaugeFill');if(!g)return;
 g.classList.remove('hit');
 if(g._hitAnim)g._hitAnim.cancel();
 if(g.animate&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))g._hitAnim=g.animate([
  {transform:'translateX(0)'},{transform:'translateX(-5px)',offset:.2},{transform:'translateX(4px)',offset:.4},{transform:'translateX(-3px)',offset:.6},{transform:'translateX(2px)',offset:.8},{transform:'translateX(0)'}
 ],{duration:200,easing:'linear'});
 f.classList.add('flash');clearTimeout(gaugeHitT);gaugeHitT=setTimeout(()=>f.classList.remove('flash'),70);
}
function knockdown(){
 const E=G.E,type=KD_TYPE[G.kd];
 G.kd++;

 E.startFall(type);
 E.haloStage(G.kd);

 G.hitstop=Math.max(G.hitstop,.14);
 G.slow=Math.max(G.slow,type==='final'?.9:.45);
 flash(type==='final'?.35:.2);
 camHit({shake:.04});

 if(type==='final'){
  if(!E.headDestroyed)AUDIO.voice('final',1);
  G.prepAt=G.time+.3;
 }else if(!E.headDestroyed){
  AUDIO.voice('scream',1.1);
 }

 updateGauge();
}
function onRiseStart(){}
// 다리가 잘려 옥좌에 주저앉음(카메라는 그대로, 게이지·후광도 그대로)
function onLegFall(){G.hitstop=Math.max(G.hitstop,.1);G.slow=Math.max(G.slow,.35);camHit({shake:.035});}
function onRise(){const E=G.E;E.setPhase(Math.min(4,G.kd+1));}
function onImpact(type){
 const E=G.E;camHit({shake:type==='final'?.06:.05});
 if(type==='throne'){AUDIO.fall('throne');if(E.crownOn!==false)E.knockCrown(V3(rnd(-.4,.4),.6,.2));}else if(type==='knees'){AUDIO.fall('knees');}else AUDIO.fall('floor');
 if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([30,20,40]);}catch(_){}
 const p=E.bones.pelvis.getWorldPosition(V3());BLOOD.spray(V3(p.x,.05,p.z+.2),V3(0,1,0),14,{kind:'dust',max:1.2});
 FX.word(type==='throne'?'쾅!':'쿵!',V3(p.x,p.y+.15,p.z+.2),{size:64,color:'#ffd84a',force:true,dur:.7});
 quipChance();
}
// 최종 죽음에만 내 한마디. 다 읽고 잠깐 멈춘 뒤, 뒤에 있던 것을 올려다본다.
function onDead(){
 if(G.revival||G.ended)return;
 clearCombatAccent();
 G.ended=true;
 PROGRESS.add();updateDefeatCount();AUDIO.stopMusic(true,.22);
 G.inputLocked=true;clearPointers();$('#dock').hidden=true;
 queueTalk([['player',LINES.victory,2,.35,1.25,'운명 좁밥']],true);
 if(!G.prepAt)G.prepAt=G.time+.05;G.beyondAt=G.time+3;
}

/* ---- 게이지 ---- */
let _gShown=-1,_gPct=-1,_gKd=-1,_gLag=-1;
function updateGauge(){
 const f=clamp(G.shown/100,0,1);if(Math.abs(f-_gShown)>.0005){_gShown=f;$('#gaugeFill').style.transform='scaleX('+f+')';}
 const pct=Math.ceil(G.bar);if(pct!==_gPct){_gPct=pct;$('#gaugePct').textContent=pct+'%';}
 if(G.kd!==_gKd){_gKd=G.kd;$$('#kdPips i').forEach((el,i)=>el.classList.toggle('on',i<Math.min(3,G.kd)));}
 const l=clamp(G.lag/100,0,1);if(Math.abs(l-_gLag)>.0005){_gLag=l;$('#gaugeLag').style.transform='scaleX('+l+')';}
}
function updateLag(dt){
 // 빨간 칸은 실제 값, 분홍 칸만 받은 피해를 늦게 따라온다.
 G.shown=G.bar;
 G.lag=G.lag>G.bar?Math.max(G.bar,G.lag-dt*4):G.bar;
 updateGauge();
}
function updateAmmo(){const el=$('#ammo');const r=VM.st.reload>0;el.textContent=r?'장전':VM.st.ammo;el.classList.toggle('reload',r);}
function flash(a=.25){const el=$('#flash');if(G.free){el.style.opacity=0;return;}el.style.transition='none';el.style.opacity=a;requestAnimationFrame(()=>{el.style.transition='opacity .18s';el.style.opacity=0;});}

/* ---- 무기와 연결 ---- */
VM.st.onContact=a=>{
 if(G.free&&FREE.shoveContact())return {hit:true,blocked:false};
 if(G.mode!=='fight'||!G.E||G.inputLocked)return {hit:false};
 const info=pickAt(a.sx,a.sy);
 if(!info){AUDIO.whiff(a.tool);return {hit:false};}
 const r=resolveHit(a.tool,a.kind,info,a.side);
 // 칼을 뽑을 때 쓰려고 맞은 자리를 뼈 기준으로 기억해 둔다
 const seg=info.obj&&info.obj.userData.seg,b=seg&&G.E.bones[seg];
 if(b){b.updateWorldMatrix(true,false);r.bone=b;r.lp=b.worldToLocal(info.point.clone());r.ln=info.normal.clone().transformDirection(_invB(b));}
 return r;
};
// 칼을 뽑을 때: 상처에서 피가 왈칵
VM.st.onPull=a=>{
 const r=a.hit;if(G.inputLocked||!r||!r.hit||r.blocked||!r.bone||!G.E)return;
 r.bone.updateWorldMatrix(true,false);const p=r.bone.localToWorld(r.lp.clone()),n=r.ln.clone().transformDirection(r.bone.matrixWorld).normalize();
 BLOOD.spray(p,n.lerp(V3(0,.1,1),.35).normalize(),18,{min:.9,max:2.8,smax:.009});
 FX.add('mist',FX.lift(p,n,.03),{size:.1,life:.4,start:.5,grow:1.6,top:false,vel:n.clone().multiplyScalar(.5),drag:4,fade:1.4});
 AUDIO.pull();
 if(G.E.state==='stand'){G.E.sp.spine.kick(-1.6,0,0);G.E.doFlinch('pain',1);}
};
VM.st.onFire=(sx,sy)=>{
 if(G.inputLocked)return;
 updateAmmo();flash(.07);gunLight();
 camHit({shake:.012});
 if(G.mode!=='fight'||!G.E)return;
 const hits=pickAll(sx,sy);if(!hits.length)return;
 const first=hits[0];resolveHit('gun','shot',first,'R');
 // 얼굴을 가린 손을 쏘면 총알이 손을 뚫고 뒤의 얼굴·몸까지 맞힌다
 if(/^(hand|arm)/.test(first.part)){
  const behind=hits.find(h=>!/^(hand|arm)/.test(h.part)&&h.part!=='crown'&&h.part!=='tablet'&&h.dist-first.dist<.45);
  if(behind)resolveHit('gun','shot',behind,'R',{through:true,powerMul:.85});
 }
};
VM.st.onAmmo=()=>updateAmmo();
// 총구 불빛이 운명 설계자 얼굴을 잠깐 비춘다
const gunL=new THREE.PointLight(col('#ffbe70'),0,6,2);scene.add(gunL);let gunLT=0;
function gunLight(){gunLT=.035;}

/* ---- 칼로 긋기 ----
 * 손가락이 지나간 사이를 7px 간격으로 촘촘히 검사한다(빠르게 그어도 팔다리를 건너뛰지 않게).
 * 팔다리: 그 팔다리를 가로질러 지나가면(들어간 자리 → 나온 자리) 한 번 벤 것으로 친다. 누른 채 다시 지나가도 또 센다. 자국·칼집·피는 칼이 지나간 겉면 점들을 따라 낸다.
 * 몸통·얼굴: 같은 부위 위를 10cm 넘게 그을 때마다 베인 자국이 이어진다. */
let slashSerial=0;
const MAX_SLASH_SAMPLES=64;
const SLASH_TOUCH_HOLD=.075;
function slashContact(p,x,y){
 return slashPath(p,[[x,y]]);
}
// 브라우저가 한꺼번에 넘긴 좌표를 경로 하나로 다시 표본화한다.
// pickList와 raycast 수는 pointermove 한 번당 각각 1회, 최대 64회로 고정한다.
function slashPath(p,points){
 if(!points.length)return;
 if(p.slashId==null){p.slashId=++slashSerial;p.stroke={};}
 const first=points[0],includeStart=p.sx==null;
 let px=includeStart?first[0]:p.sx,py=includeStart?first[1]:p.sy,total=0;
 const segs=[];
 for(const q of points){const x=q[0],y=q[1],d=Math.hypot(x-px,y-py);if(d>0){segs.push({x0:px,y0:py,x1:x,y1:y,d});total+=d;}px=x;py=y;}
 p.sx=px;p.sy=py;
 if(!includeStart&&!total)return;
 const list=pickList();
 let touched=false,endTouch=false;
 let used=0;
 if(includeStart){const hit=slashSample(p,first[0],first[1],list);touched=hit||touched;endTouch=hit;used=1;}
 if(total>0&&used<MAX_SLASH_SAMPLES){
  const n=Math.max(1,Math.min(MAX_SLASH_SAMPLES-used,Math.ceil(total/7)));
  let si=0,base=0;
  for(let i=1;i<=n;i++){
   const at=total*i/n;
   while(si<segs.length-1&&at>base+segs[si].d){base+=segs[si].d;si++;}
   const q=segs[si],u=clamp((at-base)/q.d,0,1);
   const hit=slashSample(p,lerp(q.x0,q.x1,u),lerp(q.y0,q.y1,u),list);
   touched=hit||touched;endTouch=hit;
  }
 }else if(!includeStart){
  const hit=slashSample(p,px,py,list);touched=hit||touched;endTouch=hit;
 }
 const s=VM.st.slash;
 if(s){if(touched)s.touchUntil=G.time+SLASH_TOUCH_HOLD;s.touching=endTouch;}
}
function limbKey(part){const m=/^(arm|hand|thigh|shin|foot)(L|R)$/.exec(part||'');return m?(m[1]==='arm'||m[1]==='hand'?'arm':'leg')+m[2]:null;}
function slashSample(p,x,y,list){
 const info=pickAt(x,y,list),now=G.time;
 const lk=info&&limbKey(info.part);
 const seg=info&&info.obj&&info.obj.userData.seg;
 if(info){slashKeep(info);info.seg=seg;info.t=now;}
 // 짧게 몸 경계만 통과한 선도 사라지지 않게, 다른 물체로 넘어가는 순간 미완성 선분을 확정한다.
 if(p.body&&(!info||lk||p.body.seg!==seg))finishBody(p);
 // 팔다리에서 벗어나면 그 팔다리를 벤 것으로 친다
 if(p.limb&&p.limb.key!==lk)finishLimb(p);
 // 귀·턱수염처럼 얇은 것 위를 지나간 선은 거기서 벗어나는 순간 한 번 가로지른 것으로 친다(얼굴 선과 따로)
 const ear=info&&info.obj&&(info.obj.userData.ear!=null||info.part==='beard')?info.obj:null;
 if(p.ear&&p.ear.obj!==ear)finishEar(p);
 if(ear){if(!p.ear)p.ear={obj:ear,start:info,b:info};else p.ear.b=info;}
 if(lk){
  // 팔다리 위에서 칼이 지나간 겉면 점(화면에서 보이는 쪽)을 차례로 모아 둔다. 벗어날 때 이 점들을 따라 벤다
  if(!p.limb)p.limb={key:lk,a:info.point.clone(),b:info,pts:[info],x0:x,y0:y,x1:x,y1:y};
  else{p.limb.b=info;p.limb.x1=x;p.limb.y1=y;const q=p.limb.pts;if(q.length<48&&q[q.length-1].point.distanceToSquared(info.point)>1e-6)q.push(info);}
  p.lastCut=null;return true;
 }
 // 한 화면 좌표에서는 가장 앞 물체만 고르므로, 팔을 벗어난 뒤 실제로 드러난 몸은 계속 벨 수 있다.
 if(!info){p.lastCut=null;return false;}
 // 다른 부위로 넘어가면 거기서 새로 긋기 시작
 if(!p.lastCut||p.lastCut.seg!==seg){p.lastCut=info;p.body={seg,start:info,b:info,resolved:false};return true;}
 if(p.body)p.body.b=info;
 // Body and face hits need the same local anchors as limbs: recoil between
 // samples must not turn the previous world position into a cut through air.
 slashRefresh(p.lastCut);
 const d=info.point.distanceTo(p.lastCut.point);
 if(d>.10||now-p.lastCut.t>.12){
  if(d>.015){resolveHit(G.tool,'slash',info,'R',{slashFrom:p.lastCut.point.clone(),strokeId:p.slashId,stroke:p.stroke,firstCut:!p.cutWord});p.cutWord=true;if(p.body)p.body.resolved=true;}
  p.lastCut=info;
 }
 return true;
}
function finishBody(p){
 const B=p.body;p.body=null;if(!B||B.resolved)return;p.lastCut=null;
 const info=slashRefresh(B.b),start=slashRefresh(B.start);if(!info||!start||start.point.distanceTo(info.point)<=.015)return;
 resolveHit(G.tool,'slash',info,'R',{slashFrom:start.point.clone(),strokeId:p.slashId,stroke:p.stroke,firstCut:!p.cutWord});p.cutWord=true;
}
function finishEar(p){
 const E=p.ear;p.ear=null;if(!E)return;
 const info=slashRefresh(E.b),start=slashRefresh(E.start);if(!info||!start||!info.obj||!info.obj.parent||info.obj.userData.detached||start.point.distanceTo(info.point)<(info.part==='beard'?.006:.012))return;
 resolveHit(G.tool,'slash',info,'R',{slashFrom:start.point.clone(),strokeId:p.slashId,stroke:p.stroke,firstCut:!p.cutWord,quiet:true});p.cutWord=true;
}
// 팔다리 위에서 맞은 점은 그 살 메시 좌표로도 적어 둔다: 지나가는 동안 팔다리가 움직여도 벨 때 같은 살 자리를 가리킨다
const _slM=new THREE.Matrix4(),_slN=new THREE.Matrix3();
function slashKeep(info){
 const o=info.obj;if(!o)return info;
 o.updateWorldMatrix(true,false);
 info.lp=o.worldToLocal(info.point.clone());
 _slN.getNormalMatrix(_slM.copy(o.matrixWorld).invert());info.ln=info.normal.clone().applyMatrix3(_slN).normalize();
 return info;
}
function slashRefresh(info){
 if(!info)return info;
 const o=info.obj;if(!o||!info.lp||!o.parent)return info;
 o.updateWorldMatrix(true,false);info.point.copy(info.lp).applyMatrix4(o.matrixWorld);
 _slN.getNormalMatrix(o.matrixWorld);info.normal.copy(info.ln).applyMatrix3(_slN).normalize();
 return info;
}
// 손을 떼지 않고 휘두를 때: 같은 팔다리를 다시 가로지르면 또 벤다(몸통이 지나갈 때마다 베이는 것과 같게).
// 되돌아오며 다시 지나가면 바로 센다. 같은 방향으로 잇달아 지나간 건(한 번 휘두르는 동안 위팔·아래팔을 차례로 지나는 것) LIMB_RECUT초 안이면 한 번으로,
// 테두리만 스친 건(팔다리 위를 LIMB_RECUT_MIN m도 안 지나감) 다시 세지 않는다
const LIMB_RECUT=.12,LIMB_RECUT_MIN=.03;
function finishLimb(p){
 const L=p.limb;p.limb=null;if(!L)return;
 const pts=L.pts||[];
 for(const q of pts)slashRefresh(q);
 let total=0;const acc=[0];for(let i=1;i<pts.length;i++){total+=pts[i].point.distanceTo(pts[i-1].point);acc.push(total);}
 const dx=(L.x1??0)-(L.x0??0),dy=(L.y1??0)-(L.y0??0),dl=Math.hypot(dx,dy);
 p.limbAt=p.limbAt||{};
 const prev=p.limbAt[L.key];
 if(prev){
  if(total<LIMB_RECUT_MIN)return;
  const back=dl>6&&prev.dl>6&&dx*prev.dx+dy*prev.dy<0;
  if(!back&&G.time-prev.t<LIMB_RECUT)return;
 }
 p.limbAt[L.key]={t:G.time,dx,dy,dl};
 // 가로지를 때마다 따로 센다(같은 손가락 안에서도). 예전에는 손을 뗄 때까지 팔다리 하나를 한 번만 세서, 누른 채 휘두르면 몸통만 베였다
 const sid=p.slashId+':'+L.key+':'+(p.limbN=(p.limbN||0)+1);
 // 들어간 점(L.a)과 나온 점(L.b)은 팔다리 윤곽의 양 끝이다. 둘을 이은 직선은 팔다리 속을 지나서
 // 거기에 자국·칼집을 내면 겉에서는 하나도 안 보인다 → 지나간 겉면 점들로 베고, 맞은 자리는 그 가운데 점으로 한다
 if(pts.length>=2){
  let mi=0;for(let i=1;i<pts.length;i++)if(Math.abs(acc[i]-total/2)<Math.abs(acc[mi]-total/2))mi=i;
  resolveHit(G.tool,'slash',pts[mi],'R',{slashFrom:pts[0].point.clone(),slashPath:pts,strokeId:sid,stroke:p.stroke,firstCut:!p.cutWord});p.cutWord=true;
  return;
 }
 // 한 점만 스쳤으면 긋는 방향으로 짧은 선을 만든다
 const info=L.b,from=info.point.clone().addScaledVector(V3().crossVectors(info.normal,UP).normalize(),.02);
 resolveHit(G.tool,'slash',info,'R',{slashFrom:from,strokeId:sid,stroke:p.stroke,firstCut:!p.cutWord});p.cutWord=true;
}
/* ---- 입력 ---- */
const ptrs=new Map();let bladePointer=null;
function clearPointers(){combatCancel();for(const p of ptrs.values()){if(p.slashing)VM.slashEnd();try{if(canvas.hasPointerCapture&&canvas.hasPointerCapture(p.id))canvas.releasePointerCapture(p.id);}catch(_){}}ptrs.clear();bladePointer=null;}
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 if(G.paused||G.inputLocked||G.opening){e.preventDefault();return;}AUDIO.unlock();
 if(G.mode!=='fight')return;
 if(G.free)FREE.flinch();
 const tool=G.tool;if(tool==='knife'&&bladePointer!=null)return;
 try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 const p={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t0:G.time,swiped:false,slashing:false,fired:false,decided:false};
 ptrs.set(e.pointerId,p);
 if(tool==='knife')bladePointer=e.pointerId;
 if(tool==='gun'){VM.fire(p.x,p.y);p.auto=G.time+.19;}
 else if(tool==='hand'){
  const info=pickAt(p.x,p.y);p.grabbable=!!(info&&info.obj&&G.E.parts.includes(info.obj)&&!['halo','crown','tablet'].includes(info.part));
  p.grabAt=G.time+HOLD_GRAB_SECONDS;
 }
 e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
 const p=ptrs.get(e.pointerId);if(!p)return;const tool=G.tool;
 if(tool==='knife'){
  const got=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null,moves=got&&got.length?got:[e];
  const path=[];
  for(const m of moves){
   p.x=m.clientX;p.y=m.clientY;const dist=Math.hypot(p.x-p.x0,p.y-p.y0);
   if(!p.slashing&&dist>12){p.slashing=true;VM.slashStart(p.x0,p.y0);p.lastCut=null;path.push([p.x0,p.y0]);}
   if(p.slashing){VM.slashMove(p.x,p.y);path.push([p.x,p.y]);}
  }
  if(path.length)slashPath(p,path);
  return;
 }
 p.x=e.clientX;p.y=e.clientY;
 if(p.grabbing){G.E.combat.drag((p.x-p.x0)/innerWidth,(p.y-p.y0)/innerHeight);return;}
 const dx=p.x-p.x0,dy=p.y-p.y0,dist=Math.hypot(dx,dy);
 if(tool==='gun')return;
 if(!p.decided&&!p.swiped&&dist>30&&G.time-p.t0<.38){
  p.swiped=true;p.decided=true;p.jabAt=0;const horiz=Math.abs(dx)>Math.abs(dy)*1.05;
  combatAttack(p.x0,p.y0,horiz?'hook':dy<0?'upper':'shove');
 }
});
function ptrEnd(e){
 const p=ptrs.get(e.pointerId);if(!p)return;ptrs.delete(e.pointerId);
 try{if(canvas.hasPointerCapture&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch(_){}
 if(bladePointer===e.pointerId)bladePointer=null;
 if(G.mode!=='fight'||G.inputLocked){if(p.slashing)VM.slashEnd();return;}
 const tool=G.tool;
 if(p.grabbing){if(G.E&&G.E.combat)G.E.combat.release(e.type!=='pointerup');COMBAT.pointer=null;canvas.classList.remove('grabbing');VM.grip(null,null);return;}
 if(tool==='knife'){
  if(p.slashing){
   if(e.type==='pointerup'){
    if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))slashPath(p,[[e.clientX,e.clientY]]);
    finishLimb(p);finishEar(p);finishBody(p);
   }else{p.limb=null;p.ear=null;p.body=null;}
   VM.slashEnd();
  }else if(e.type==='pointerup')VM.attack('stab',p.x0,p.y0);
 }
 else if(tool==='hand'&&e.type==='pointerup'&&!p.decided){p.decided=true;combatAttack(p.x0,p.y0);}
}
canvas.addEventListener('pointerup',ptrEnd);canvas.addEventListener('pointercancel',ptrEnd);canvas.addEventListener('lostpointercapture',ptrEnd);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function pollPointers(){
 if(G.paused||G.inputLocked||G.mode!=='fight')return;
 for(const p of ptrs.values()){
  if(G.tool==='gun'&&p.auto&&G.time>=p.auto){p.auto=G.time+.19;VM.fire(p.x,p.y);}
  else if(G.tool==='hand'&&!p.decided&&p.grabAt&&G.time>=p.grabAt&&COMBAT.pointer==null){p.grabAt=0;combatGrab(p);}
 }
}
// 키보드(PC): 1~3 도구
addEventListener('keydown',e=>{if($('#fight').hidden||G.paused||G.inputLocked)return;const map={'1':'hand','2':'knife','3':'gun'};if(map[e.key])setTool(map[e.key]);});

function setTool(t){
 if(!HINTS[t])return;clearPointers();
 G.tool=t;VM.setTool(t);$$('#tools .tool').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
 if(G.mode==='fight')hint(HINTS[t]);AUDIO.ui();updateAmmo();
}
$$('#tools .tool').forEach(b=>b.addEventListener('click',()=>{if(G.paused||G.inputLocked)return;AUDIO.unlock();setTool(b.dataset.tool);}));

/* ---- 설정 ---- */
function savePrefs(){try{localStorage.setItem('palja.prefs',JSON.stringify(PREF));}catch(_){}}
function syncPrefs(){
 if(G.E)for(const m of G.E.goreMeshes)m.visible=PREF.blood;
 if(G.E)G.E.root.traverse(o=>{if(o.userData.cutSafe)o.visible=!PREF.blood;});
 if(G.E&&G.E.bits)for(const b of G.E.bits)b.obj.traverse(o=>{if(o.userData.cutSafe)o.visible=!PREF.blood;});for(const k of Object.keys(PREF)){const el=$('#sw'+k[0].toUpperCase()+k.slice(1));if(el)el.setAttribute('aria-checked',String(PREF[k]));}$('#soundBtn').setAttribute('aria-pressed',String(!PREF.sound));AUDIO.setOn(PREF.sound);AUDIO.setVolumes({music:PREF.musicVolume,effects:PREF.effectsVolume,voice:PREF.voiceVolume});
 for(const k of ['music','effects','voice']){const v=Math.round(PREF[k+'Volume']*100);$('#vol-'+k).value=v;$('#vol-'+k).disabled=!PREF.sound;$('#volume-'+k).textContent=v+'%';}
}
for(const k of ['music','effects','voice'])$('#vol-'+k).addEventListener('input',e=>{PREF[k+'Volume']=Number(e.target.value)/100;savePrefs();syncPrefs();});
function toggle(k){PREF[k]=!PREF[k];savePrefs();syncPrefs();}
for(const k of Object.keys(PREF)){const el=$('#sw'+k[0].toUpperCase()+k.slice(1));if(el)el.addEventListener('click',()=>{AUDIO.unlock();toggle(k);});}
$('#soundBtn').addEventListener('click',()=>{AUDIO.unlock();toggle('sound');});
function setFightModal(modal,open){
 modal.hidden=!open;
 const face=$('#arcadeFace');
 if(face)face.hidden=!$('#fight').hidden&&(!$('#settingsModal').hidden||!$('#trophyModal').hidden||!$('#factoryPhotoModal').hidden);
}
$('#settingsBtn').addEventListener('click',()=>{G.paused=true;clearPointers();AUDIO.hold(true);setFightModal($('#settingsModal'),true);});
function closeModal(){setFightModal($('#settingsModal'),false);G.paused=false;AUDIO.hold(false);last=performance.now();}
$$('#settingsModal [data-close]').forEach(b=>b.addEventListener('click',closeModal));
$('#settingsModal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
$('#resetFight').addEventListener('click',()=>{const mode=G.free?'free':G.mode;closeModal();startRound(mode);});
$('#fightBack').addEventListener('click',()=>leave(false));
/* ---- 족친 기록: 밤 들판에 줄지어 꽂힌 머리들 ----
 * 머리는 놀이에서 쓰는 머리·면류관 코드로 따로 떨어진 무대에서 한 장씩 굽는다(두 번째 WebGL 맥락·끝 장면 캡처 없이).
 * 조명은 위·뒤에서 비추는 누런 빛(윤곽만 밝힘) + 아래 앞에서 치켜 비추는 찬 빛이라, 얼굴 아래가 어둡게 뜬다. */
function closeTrophyEye(eye,M,owned,thread){
 eye.eg.visible=false;eye.mem.visible=false;
 // Hide the empty socket only for intact closed eyes; the damaged variant keeps it.
 for(const mesh of eye.socket.children)mesh.visible=false;
 const lid=new THREE.SphereGeometry(1,32,20);owned.add(lid);
 const colors=new Float32Array(lid.attributes.position.count*3);colors.fill(1);lid.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const cover=mk(lid,M.lizHead,eye.socket,{p:[0,-.0005,.014],s:[.039,.026,.025],cast:false});
 const seamAt=x=>{const y=-.003-.0015*(1-(x/.035)**2),z=.014+.025*Math.sqrt(Math.max(0,1-(x/.039)**2-((y+.0005)/.026)**2))+.0007;return [x,y,z];};
 const points=[];for(let i=0;i<=16;i++)points.push(seamAt(-.035+i*.07/16));
 const seam=taperTube(points,.0008,.0008,24,5);owned.add(seam);mk(seam,M.mouth,eye.socket,{cast:false});
 if(thread){// 굵은 실로 엇갈리게 꿰맨 눈
  for(const [i,u] of [[0,-.024],[1,-.007],[2,.011],[3,.026]]){const [x,y,z]=seamAt(u+(i%2?.002:-.002));
   for(const d of [-1,1]){const t=taperTube([[x-d*.005,y+.0074,z-.0014],[x,y,z+.0024],[x+d*.005,y-.0068,z-.0014]],.0017,.0017,10,5);owned.add(t);mk(t,thread,eye.socket,{cast:false});}}
 }
 return cover;
}
function trophyPortrait(spec=0,damage=''){
 // 예전 호출(trophyPortrait(옷 번호, 'eye'|'jaw'))도 받는다
 if(typeof spec==='number')spec=Object.assign({outfit:spec},damage==='eye'?{eyes:'gouged'}:damage==='jaw'?{jaw:'gone',eyes:'sewn'}:TROPHY_FACES[spec%TROPHY_FACES.length]);
 const outfit=spec.outfit|0,face=Object.assign({eyes:'sewn',jaw:.1,tongue:0,droop:.14},spec);
 const source=G.E;if(!source)throw new Error('No trophy model');
 const model=Object.create(Emperor.prototype),stage=new THREE.Scene(),root=new THREE.Group();stage.add(root);
 const materials=[];model.M={};
 for(const [key,mat] of Object.entries(source.M)){if(!mat||!mat.isMaterial)continue;const copy=mat.clone();copy.userData={};
  // 궁전 반사광을 지운다: 밤 들판에서 금속이 하얗게 번들거리지 않게
  if(copy.envMap){copy.envMap=null;copy.needsUpdate=true;}
  model.M[key]=copy;materials.push(copy);}
 const M=model.M,palette=OUTFITS[outfit%OUTFITS.length];
 // 녹슬고 때 묻은 면류관: 놀이 때보다 한 톤 어둡게
 // (색값은 선형으로 들어가 화면에선 한참 밝게 나오므로 꽤 깊게 눌러 둔다)
 M.gold.color.set(palette.goldD).multiplyScalar(.5);M.gold.metalness=.45;M.gold.roughness=.55;M.goldD.color.set(palette.goldD).multiplyScalar(.28);M.lacRed.color.set(palette.cloth[0]).multiplyScalar(.4);M.amethyst.color.set(palette.gem).multiplyScalar(.3);
 M.boardTop.color.setScalar(.5);M.cord.color.set('#2c0806');M.pearl.color.set('#4a463d');M.jade.color.set('#0f2a20');M.crownEye.color.set('#3c382d');
 // 죽은 살빛: 생기 없이 잿빛으로 가라앉은 비늘
 M.lizHead.color.set('#9fa596');reptileProjection(M.lizHead,3.6);M.lizHead.bumpScale=.0036;M.liz.color.set('#8d9384');
 const thread=STD('#191410',{roughness:.85});materials.push(thread);
 const owned=new Set();model.disposables=[];model.root=root;model.bones={neck:root};model.parts=[];model.flow={};model.neckMesh=null;
 model.resetHeadDamage=()=>{};
 model.addFlesh=(geo,mat,parent,o)=>{owned.add(geo);return mk(geo,mat,parent,{part:o.part,cast:false,receive:false});};
 model.buildRepHead();model.repHead.scale.setScalar(1);model.face=model.repFaceG;model._crown();
 // 면류관 구슬줄(꼭짓점 색)도 빛바래게
 model.crown.traverse(o=>{if(o.isMesh&&o.material&&o.material.vertexColors&&o.material!==M.lizHead){o.material.color.setScalar(.38);materials.push(o.material);}});
 const yaw=[-.10,.07,-.05,.12,-.13,.03][outfit%6];
 model.repHead.rotation.set(face.droop,yaw,0);
 // 턱: 벌어진 채 늘어짐, 또는 떨어져 나감
 if(face.jaw==='gone')model.repJawBone.visible=false;else model.repJawBone.rotation.x=face.jaw;
 // 혀: 벌어진 입 밖으로 축 늘어진다
 if(face.tongue&&face.jaw!=='gone'){const f=model.repFork.g;f.visible=true;f.scale.set(1,1,face.tongue);f.rotation.set(.95,0,-.32);M.fork.color.set('#2f0b14');M.fork.roughness=.55;}else model.repFork.g.visible=false;
 for(const eye of model.repEyes){
  eye.eg.visible=false;eye.mem.visible=false;
  if(face.eyes==='gouged'&&eye.s<0)continue;// 파낸 쪽은 빈 눈구멍(속살)
  if(face.eyes==='sewn'){closeTrophyEye(eye,M,owned,thread);continue;}
  if(face.eyes==='gouged'){closeTrophyEye(eye,M,owned,null);continue;}
  // 뜬 눈: 그대로 노려보거나(stare) 막이 반쯤 덮여 흐리거나(glazed) 위로 돌아가 흰자만(rolled)
  eye.eg.visible=true;eye.hl.visible=face.eyes==='stare';eye.eg.rotation.set(.04,-eye.s*.05,0);
  if(face.eyes==='rolled')eye.iris.visible=false;
  if(face.eyes==='glazed'){eye.mem.visible=true;}
 }
 // 막 무늬는 놀이 중인 머리와 같은 텍스처를 쓰므로 복사본을 밀어 둔다(살아 있는 눈의 깜빡임 자리를 건드리지 않게)
 if(face.eyes==='glazed'){const film=M.repMem.map.clone();film.offset.x=.5;film.needsUpdate=true;M.repMem.map=film;model.disposables.push(film);M.repMem.opacity=.58;M.repMem.color.set('#b9c2bc');}
 if(face.eyes==='rolled')M.lizEyeBall.color.set('#3f3b31');
 // 잘린 목: 장대가 박히는 너덜너덜한 밑동(아래 끝이 들쭉날쭉 찢겼다)
 model.repFaceG.updateMatrixWorld(true);
 const stumpGeo=new THREE.CylinderGeometry(.068,.078,.13,22,3,true);owned.add(stumpGeo);
 {const p=stumpGeo.attributes.position;let seed=outfit*97+11;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<-.06)p.setY(i,y-.004-r()*.045);else if(y<0)p.setX(i,p.getX(i)*(1+(r()-.5)*.05));}
  stumpGeo.computeVertexNormals();}
 // Keep the neck socket in the same tilted frame as the skull, including yaw/droop.
 const stump=mk(stumpGeo,M.liz,model.repHead,{p:[0,-.07,-.04],r:[-.18,0,0],cast:false});
 const cutGeo=new THREE.CircleGeometry(.074,22);owned.add(cutGeo);
 mk(cutGeo,M.blueCore,stump,{p:[0,-.07,0],r:[PI/2,0,0],cast:false});
 // New crown geometry belongs to this short-lived render; cache meshes stay live.
 const cached=new Set(Object.values(GEO).filter(o=>o&&o.isBufferGeometry));
 root.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;if(!cached.has(o.geometry))owned.add(o.geometry);}});
 // 조명: 위·뒤 누런 빛이 윤곽을 따고, 앞 아래에서 찬 빛이 치켜 비춘다. 주변광은 어둡게
 stage.add(new THREE.HemisphereLight('#5f6c66','#090b0a',.12));
 const rim=new THREE.DirectionalLight('#f3d48a',3.6);rim.position.set(1.5,.75,-2.4);stage.add(rim);
 const rim2=new THREE.DirectionalLight('#c9d6c8',1.4);rim2.position.set(-1.8,.5,-2.2);stage.add(rim2);
 const key=new THREE.DirectionalLight('#d9d6c2',1.2);key.position.set(-1.6,.8,2.2);stage.add(key);
 const under=new THREE.DirectionalLight('#8aa5b5',.85);under.position.set(.3,-1.8,1.4);stage.add(under);
 root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),center=bounds.getCenter(V3()),size=bounds.getSize(V3()),half=Math.max(size.x,size.y)*.56;
 const view=new THREE.OrthographicCamera(-half,half,half,-half,.01,10);view.position.copy(center).add(V3(0,.04,2));view.lookAt(center);view.updateMatrixWorld(true);
 // 2D 카드가 피를 흘릴 자리: 목 밑동·눈구멍·입(캔버스 0~1 좌표)
 const at=v=>{const q=v.clone().project(view);return [q.x*.5+.5,.5-q.y*.5];};
 const anchors={neck:at(stump.localToWorld(V3(0,-.075,0))),stake:at(stump.localToWorld(V3(0,.075,0))),top:at(V3(center.x,bounds.max.y,center.z)),
  mouth:at(model.repJawBone.localToWorld(V3(0,-.02,.17))),eyes:model.repEyes.map(e=>at(e.socket.localToWorld(V3(0,-.012,.03)))),
  gouged:face.eyes==='gouged',jawGone:face.jaw==='gone',tongue:!!face.tongue&&face.jaw!=='gone'};
 const target=new THREE.WebGLRenderTarget(512,512,{depthBuffer:true,stencilBuffer:false});target.texture.encoding=THREE.sRGBEncoding;
 const previous={target:renderer.getRenderTarget(),clear:renderer.getClearColor(new THREE.Color()),alpha:renderer.getClearAlpha(),exposure:renderer.toneMappingExposure,auto:renderer.autoClear,viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),scissorTest:renderer.getScissorTest()};
 const pixels=new Uint8Array(512*512*4);
 try{
  // Render-target viewports use physical pixels. setViewport() would multiply these
  // 512 pixels by the screen DPR, enlarging/shifting the head away from its anchors.
  // Binding the target already installs its own 512×512 viewport and scissor state.
  renderer.setRenderTarget(target);renderer.setClearColor(0x000000,0);renderer.autoClear=true;renderer.toneMappingExposure=1;
  renderer.clear();renderer.render(stage,view);renderer.readRenderTargetPixels(target,0,0,512,512,pixels);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const context=canvas.getContext('2d'),data=context.createImageData(512,512);
  for(let y=0;y<512;y++)data.data.set(pixels.subarray((511-y)*2048,(512-y)*2048),y*2048);
  context.putImageData(data,0,0);canvas.anchors=anchors;canvas.face=face;return canvas;
 }finally{
  renderer.setViewport(previous.viewport);renderer.setScissor(previous.scissor);renderer.setScissorTest(previous.scissorTest);renderer.setRenderTarget(previous.target);renderer.setClearColor(previous.clear,previous.alpha);renderer.toneMappingExposure=previous.exposure;renderer.autoClear=previous.auto;
  target.dispose();for(const geometry of owned)geometry.dispose();for(const mat of new Set([...materials,...model.disposables]))if(mat&&mat.dispose)mat.dispose();
 }
}
/* 족친 기록 배치: 들판(미터)에 머리를 꽂고 카메라 하나로 찍는다.
 * 8놈까지는 머리 높이에서 본다(예전 장면 그대로: 맨 앞 장대가 화면을 채우고 빈 장대가 뒤에서 기다린다).
 * 그보다 많으면 카메라가 높이 올라가며 뒤로 물러나 내려다봐서 줄줄이 꽂힌 머리가 멀리까지 보인다(2000놈에서 가장 높다).
 * 예전에는 늘 머리 높이에서 봐서 뒷줄이 지평선에 납작하게 겹쳐 몇십 놈을 넘으면 그림이 거의 같았다. 한 장에 2000놈, 그 너머는 다음 장.
 * 줄은 앞에서부터 1, 2, 3…자리. 자리 사이는 머리 1.55개 폭이고 화면 폭(양 끝 35px 안, 많아지면 화면 끝까지)에 안 들어가면 좁힌다.
 * 카메라가 높아 화면이 넓으면 넓은 만큼 자리를 늘린다(자리 수의 홀짝이 줄마다 바뀌어 한 줄 걸러 반 칸 어긋난다: 바로 앞 머리 뒤에 숨지 않게).
 * 40놈쯤 넘어 카메라가 충분히 높으면 들판에 같은 간격으로만 꽂는다. */
const TROPHY_FIELD={F:1080,CX:540,CY:640,HEAD:.5,NECK_Y:.519,ROW:.46,GAP:.775,PER_PAGE:2000};
// 카메라는 구도로 정한다: 지평선 높이, 맨 앞(가장 최근) 머리의 화면 크기·높이. 거기서 카메라 높이(h)·물러난 거리(b)·내려다보는 각(th)을 푼다.
// 머리 높이(e=0): 지평선 640, 맨 앞 머리 540px·770(예전 구도) → 가장 높이(e=1): 지평선 300, 맨 앞 머리 130px·1000(아래 숫자 위)
function trophyCamera(n){
 const T=TROPHY_FIELD,e=n<=8?0:Math.min(1,Math.log(n/8)/Math.log(T.PER_PAGE/8));
 const horizon=640-340*e,th=Math.atan((T.CY-horizon)/T.F);
 const z=Math.pow(540/130,Math.pow(e,.85)),y=770+230*Math.pow(e,.7),v=-(y-T.CY)*z/T.F;
 const a=z*Math.sin(th)-v*Math.cos(th),dz=z*Math.cos(th)+v*Math.sin(th);
 return {e,h:T.NECK_Y+a,b:dz-1,th};
}
function trophyProject(cam,X,Y,Z){
 const T=TROPHY_FIELD,s=Math.sin(cam.th),c=Math.cos(cam.th),ry=Y-cam.h,rz=Z+cam.b;
 const z=-ry*s+rz*c,v=ry*c+rz*s;
 return {x:T.CX+T.F*X/z,y:T.CY-T.F*v/z,z};
}
function trophyLayout(total, page=0) {
 const T=TROPHY_FIELD;
 const count = Number.isSafeInteger(total) ? clamp(total, 0, 999999) : 0;
 const pages = Math.max(1, Math.ceil(count / T.PER_PAGE));
 const index = clamp(Math.floor(page) || 0, 0, pages - 1);
 const start = index * T.PER_PAGE;
 const n = Math.min(T.PER_PAGE, count - start);
 const cam=trophyCamera(n),heads=[],near=trophyProject(cam,0,T.NECK_Y,1).z,wide=clamp(cam.e/.3,0,1);
 const rowAt=row=>{
  const Z=1+T.ROW*row;if(row===0)return {Z,cap:1,pitch:0};
  const half=(505+35*wide)*trophyProject(cam,0,T.NECK_Y,Z).z/T.F;
  let fit=Math.floor(2*half/T.GAP)+1;if((fit+row+1)%2)fit--;
  // 머리 높이 장면(예전 배치)은 줄마다 r+1자리를 화면 폭에 좁혀 넣는다. 카메라가 충분히 높으면 들판 간격 그대로만 채운다
  // (뒷줄까지 r+1자리를 억지로 좁혀 넣으면 자리들이 화면 폭의 k/r 자리에 몰려 먼 들판에 부챗살 같은 줄무늬가 졌다)
  const cap=wide<1?Math.max(row+1,fit):Math.max(1,fit);
  return {Z,cap,pitch:Math.min(T.GAP,2*half/(cap-1))};
 };
 // 줄마다 자리 수를 다 채우지 못하면 고르게 띄운 자리에 선다(바로 앞 머리에 가리지 않게)
 const pick=(cap,k,j)=>k===cap?j:Math.round((j+.5)*cap/k-.5);
 // 머리(빈 장대) 하나: 들판 자리(Z, X)와 높이(Y)를 찍는다. 흔들림은 예전과 같은 차례로 뽑는다(머리 높이 장면이 예전 그대로 나오게)
 const shoot=(R,X,Y,Z,fj,scale)=>{
  const head=trophyProject(cam,X,Y,Z),foot=trophyProject(cam,X,0,Z);
  // depth: 맨 앞 머리를 1로 잰 거리(멀수록 작게 굽고 안개에 묻힌다)
  return {z:head.z,depth:Math.max(1,head.z/near),x:clamp(head.x,24,1056),y:head.y,footY:foot.y+fj*12*near/head.z,size:T.F*T.HEAD/head.z*scale};
 };
 let placed=0,row=0;const filled=[];
 while(placed<n){
  const R=rowAt(row),k=Math.min(R.cap,n-placed);
  for(let j=0;j<k;j++){
   const ordinal=start+n-1-(placed+j),r=trophyRng(ordinal*7919+13);
   const X=(pick(R.cap,k,j)-(R.cap-1)/2)*R.pitch+(r()-.5)*.22*R.pitch,fj=r()-.5,scale=.93+r()*.12,yj=r()-.5;
   const h={ordinal,row,lean:(r()-.5)*.12,tilt:(r()-.5)*.36,flip:r()<.5,tip:row>0&&r()<.3,hero:ordinal===count-1};
   // 높이 올라간 카메라에서는 줄이 자로 잰 듯 보이지 않게 앞뒤로도 조금 흩는다
   const Z=R.Z+(row?(r()-.5)*.14*wide:0);
   heads.push(Object.assign(h,shoot(R,X,T.NECK_Y-yj*40/T.F,Z,fj,scale)));
  }
  filled[row]=k;placed+=k;row++;
 }
 // 아직 몇 놈 안 됐으면 빈 장대가 뒤에서 후임들을 기다린다(머리가 없으니 끝이 목 높이보다 조금 낮다)
 if(n<10){
  let want=10-n;
  for(let rr=Math.max(1,row-1);want>0&&rr<5;rr++){
   const R=rowAt(rr),taken=filled[rr]||0;if(taken>=R.cap)continue;
   const used=new Set();for(let j=0;j<taken;j++)used.add(pick(R.cap,taken,j));
   for(let slot=0;slot<R.cap&&want>0;slot++){
    if(used.has(slot))continue;const r=trophyRng(rr*131+slot*17+3);if(r()<.25)continue;
    const X=(slot-(R.cap-1)/2)*R.pitch+(r()-.5)*.22*R.pitch,fj=r()-.5;
    heads.push(Object.assign({ordinal:-1,row:rr,lean:(r()-.5)*.12,tilt:0,empty:true},shoot(R,X,T.NECK_Y-.1/R.Z,R.Z,fj,.95)));want--;
   }
  }
 }
 heads.sort((a,b)=>b.depth-a.depth||a.x-b.x);
 const horizon=T.CY-T.F*Math.tan(cam.th);
 return {count, page:index, pages, start, n, heads, rows:row, camera:cam, horizon};
}
/* 족친 기록 카드(1080×1350): 구름 낀 밤 들판에 줄지어 꽂힌 머리들.
 * 가장 최근에 족친 놈이 맨 앞 장대에서 눈을 뜬 채 나를 보고, 예전 놈들은 뒤로 갈수록 안개에 묻힌다.
 * 아직 몇 놈 안 됐을 땐 빈 장대가 뒤에 서서 후임들을 기다린다. 글씨는 웹글꼴을 기다리지 않게 윤곽선을 구워 둔다.
 * 하늘의 눈·까마귀·梟首 낙관은 뺐다(하늘은 들판 그림의 구름 하늘을 밤빛으로 누른 것).
 * 글꼴 윤곽: 한글·숫자 Song Myung — SIL Open Font License 1.1 (assets/SongMyung-OFL.txt) */
const TROPHY_CARD={W:1080,H:1350};
function trophyRng(seed){let s=(seed>>>0)||1;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const TROPHY_FACES=[
 // 0 가장 최근에 족친 놈(맨 앞): 눈을 뜬 채 막이 반쯤 덮여 흐리멍덩, 턱이 빠지고 혀가 늘어짐
 {eyes:'glazed',jaw:.34,tongue:1,droop:.2},
 {eyes:'sewn',jaw:.05,droop:.16},
 {eyes:'gouged',jaw:.24,droop:.24},
 {eyes:'rolled',jaw:.3,tongue:.8,droop:.1},
 {eyes:'stare',jaw:.1,droop:.12},
 {eyes:'sewn',jaw:'gone',droop:.2}
];
const TROPHY_TYPE={song:{"족":[880,"M514 655 530 679 675 680Q733 680 733 712Q733 725 724 733Q714 741 698 745Q681 749 660 750Q638 751 615 751Q610 751 605 746Q600 740 589 734Q578 727 556 722Q535 716 496 715L296 708Q287 708 278 708Q269 707 261 707Q224 707 196 712Q168 716 166 717H163Q158 716 154 715Q145 713 145 709Q145 702 162 690Q180 679 202 668Q223 656 242 648Q262 640 266 640Q270 640 276 644Q281 648 293 654Q305 660 327 666Q349 671 387 674L381 662Q375 649 354 621Q334 593 300 558Q265 524 216 488Q166 452 102 424Q82 415 82 410Q82 407 92 407Q101 407 116 410Q335 450 457 581Q486 572 508 558Q530 544 548 528Q567 513 583 498Q599 484 615 473Q641 456 664 448Q687 439 705 438Q722 438 738 448Q753 457 753 476Q753 488 746 500Q738 513 726 524Q715 535 700 544Q686 553 672 558Q627 572 576 580Q525 588 465 590Q473 599 482 610Q490 621 496 630Q503 639 508 646Q513 653 514 655ZM868 351Q868 365 857 373Q846 381 826 385Q807 389 780 390Q753 391 721 391Q716 392 710 387Q704 382 690 376Q676 369 649 362Q622 356 574 355L515 353V394Q515 402 518 412Q520 423 520 434Q520 441 518 445Q515 449 504 452Q494 456 472 459Q450 462 412 467Q391 470 375 470Q339 470 339 452Q366 444 381 437Q396 430 402 422Q409 414 410 405Q412 396 412 385V350L146 341H132Q102 341 82 343Q61 345 48 348Q34 351 25 353Q16 355 9 355Q1 355 -1 352Q-3 349 -3 347Q-3 339 14 328Q31 316 52 304Q74 293 93 285Q112 277 116 277Q120 277 132 282Q144 286 178 292Q211 298 273 304Q335 310 440 314L647 321H808Q868 321 868 351ZM719 227Q719 244 701 250Q683 257 643 257Q635 257 625 256Q615 256 606 256Q597 256 590 256Q583 255 580 255Q574 255 572 252Q571 249 568 244Q564 240 554 236Q544 232 522 231L278 222Q269 222 260 222Q251 221 243 221Q212 221 192 222Q173 224 162 226Q150 228 147 230Q144 231 146 231Q145 231 137 230Q129 228 129 224Q129 217 146 206Q163 194 184 183Q206 172 225 164Q244 156 249 156Q249 156 256 161Q263 166 284 173Q305 180 343 186Q381 192 443 194L580 196V88Q580 -66 616 -66Q632 -66 645 -55Q658 -44 667 -26Q676 -9 682 12Q687 32 688 50L690 88V171Q690 178 694 185Q699 192 704 199Q710 206 714 213Q719 220 719 227Z"],"친":[880,"M734 404V689Q734 708 739 725Q742 734 745 742Q745 752 720 761Q696 770 631 786Q617 789 604 791Q591 793 578 793Q528 793 528 779Q567 760 588 746Q608 733 618 722Q628 711 630 702Q631 692 631 682V326L635 264Q639 229 647 214Q655 198 668 198Q683 198 694 214Q706 229 714 252Q722 275 726 302Q731 329 732 352ZM396 698Q396 710 381 718Q366 727 352 727L293 728Q269 728 246 730Q222 732 199 738Q188 741 183 741Q175 741 175 728Q175 723 184 713Q194 703 206 694Q219 684 231 676Q243 669 249 669H337Q396 669 396 698ZM381 581 469 584Q472 583 479 583Q496 583 512 590Q528 596 528 610Q528 625 521 634Q514 642 502 646Q490 651 474 652Q459 653 443 653H416H411Q408 653 402 648Q397 643 384 637Q372 631 350 626Q329 620 294 619L208 617H191Q163 617 143 619Q123 621 109 623Q95 625 86 627Q77 629 71 629Q65 629 60 627Q56 625 56 621Q56 613 73 602Q90 590 112 578Q133 567 152 559Q171 551 175 551Q178 551 182 556Q187 560 197 566Q207 571 224 576Q240 581 266 583Q205 398 43 286Q24 273 24 268Q24 265 30 265Q38 265 58 272Q235 333 329 477Q361 457 380 432Q399 406 414 382Q430 358 447 338Q464 319 492 309Q501 306 509 306Q526 306 538 318Q551 329 551 348Q551 365 542 384Q533 402 509 420Q485 438 443 454Q401 471 335 486Q345 503 356 526Q368 550 381 581ZM778 29Q778 46 768 56Q759 66 741 71Q723 76 697 78Q671 79 639 79H631Q625 79 620 72Q614 64 599 55Q584 46 554 38Q525 30 471 29L405 28H402Q390 28 390 42V175Q390 182 392 192Q393 202 393 212Q393 219 390 225Q388 231 373 235Q358 239 326 241Q295 243 237 243Q175 243 175 228Q214 216 234 208Q255 199 264 191Q274 183 276 174Q278 166 278 154V36Q278 24 286 16Q293 7 305 2Q317 -4 330 -7Q344 -10 356 -10L381 -11H572L719 -3Q778 -3 778 29Z"],"천":[880,"M631 477V327L635 265Q639 230 647 214Q655 199 668 199Q683 199 694 214Q705 230 714 253Q722 276 726 303Q731 330 732 354L734 405V690Q734 709 739 726Q742 735 745 743Q745 753 720 762Q696 771 631 787Q617 790 604 792Q591 794 578 794Q528 794 528 780Q567 761 588 748Q608 734 618 723Q628 712 630 702Q631 693 631 683V507L499 501Q494 500 486 500Q467 500 454 503Q440 506 432 506Q425 506 425 501Q425 495 434 486Q444 478 456 470Q469 461 482 455Q494 449 499 449Q503 449 520 458Q538 467 572 471ZM396 698Q396 710 381 718Q366 727 352 727L293 728Q269 728 246 730Q222 732 199 738Q188 741 183 741Q175 741 175 728Q175 723 184 713Q194 703 206 694Q219 684 231 676Q243 669 249 669H337Q396 669 396 698ZM381 581 469 584Q472 583 479 583Q496 583 512 590Q528 596 528 610Q528 625 521 634Q514 642 502 646Q490 651 474 652Q459 653 443 653H416H411Q408 653 402 648Q397 643 384 637Q372 631 350 626Q329 620 294 619L208 617H191Q163 617 143 619Q123 621 109 623Q95 625 86 627Q77 629 71 629Q65 629 60 627Q56 625 56 621Q56 613 73 602Q90 590 112 578Q133 567 152 559Q171 551 175 551Q178 551 182 556Q187 560 197 566Q207 571 224 576Q240 581 266 583Q205 398 43 286Q24 273 24 268Q24 265 30 265Q38 265 58 272Q235 333 329 477Q361 457 380 432Q399 406 414 382Q430 358 447 338Q464 319 492 309Q501 306 509 306Q526 306 538 318Q551 329 551 348Q551 365 542 384Q533 402 509 420Q485 438 443 454Q401 471 335 486Q345 503 356 526Q368 550 381 581ZM778 30Q778 62 744 71Q709 80 631 80Q625 80 620 72Q614 65 599 56Q584 47 554 39Q525 31 471 30L405 29H402Q390 29 390 43V176Q390 183 392 192Q393 201 393 212Q393 219 390 225Q387 231 372 235Q357 239 326 242Q294 244 237 244Q175 244 175 229Q214 217 234 208Q255 200 264 192Q274 184 276 176Q278 167 278 155V37Q278 25 286 16Q293 8 305 2Q317 -3 330 -6Q344 -9 356 -10L572 -2H719Q778 -2 778 30Z"],"지":[880,"M731 155V684Q731 701 736 713Q740 725 740 734Q740 740 736 746Q731 752 718 758Q704 764 680 771Q657 778 620 787Q603 792 586 794Q570 795 556 795Q536 795 523 791Q510 787 510 780Q549 761 571 748Q593 734 604 724Q615 713 618 704Q620 694 620 683V155Q620 -66 657 -66Q672 -66 684 -50Q696 -33 705 -8Q714 16 720 45Q725 74 727 100ZM366 574Q371 596 371 601H455H463Q480 601 497 607Q514 613 514 627Q514 641 507 650Q500 658 488 662Q477 667 462 668Q446 670 428 670H401H396Q394 670 388 665Q383 660 370 654Q358 648 336 642Q314 637 280 636L208 633Q202 633 196 632Q189 632 184 632Q119 632 92 638Q64 645 72 645Q71 645 64 643Q56 641 56 637Q56 630 73 618Q90 606 112 595Q133 584 152 576Q171 567 175 567Q180 567 184 570Q188 574 195 578Q202 583 214 588Q227 593 249 596V589Q246 568 234 514Q223 461 198 392Q173 323 132 248Q91 174 28 111Q8 95 8 87Q8 83 12 83Q17 83 24 86Q31 90 43 96Q123 137 188 208Q252 278 301 384Q330 352 346 322Q362 291 376 250Q398 184 426 150Q454 116 487 116Q504 116 518 128Q531 141 531 167Q531 203 511 236Q491 269 459 298Q427 328 388 354Q348 379 308 400Q348 489 366 574Z"],"신":[880,"M734 404V689Q734 708 739 725Q742 734 745 742Q745 752 720 761Q696 770 631 786Q617 789 604 791Q591 793 578 793Q528 793 528 779Q567 760 588 746Q608 733 618 722Q628 711 630 702Q631 692 631 682V326L635 264Q639 229 647 214Q655 198 668 198Q683 198 694 214Q706 229 714 252Q722 275 726 302Q731 329 732 352ZM381 617 389 633Q394 644 398 652Q401 659 400 665Q400 671 396 676Q392 681 380 687Q368 693 347 701Q326 709 293 720Q280 725 268 726Q255 728 244 728Q227 728 216 724Q205 720 205 713Q247 691 262 678Q276 665 276 650Q276 651 272 636Q268 622 258 596Q247 571 229 537Q211 503 184 464Q156 426 118 386Q79 346 28 309Q7 294 7 289Q7 286 14 286Q21 286 43 294Q207 352 308 488Q352 465 377 435Q402 405 420 378Q438 352 457 334Q476 315 508 315Q522 315 536 324Q550 332 550 351Q550 378 533 401Q516 424 485 442Q454 461 410 474Q367 488 314 496Q333 522 348 548Q362 574 372 596ZM778 29Q778 46 768 56Q759 66 741 71Q723 76 697 78Q671 79 639 79H631Q625 79 620 72Q614 64 599 55Q584 46 554 38Q525 30 471 29L405 28H402Q390 28 390 42V175Q390 182 392 192Q393 202 393 212Q393 219 390 225Q388 231 373 235Q358 239 326 241Q295 243 237 243Q175 243 175 228Q214 216 234 208Q255 199 264 191Q274 183 276 174Q278 166 278 154V36Q278 24 286 16Q293 7 305 2Q317 -4 330 -7Q344 -10 356 -10L381 -11H572L719 -3Q778 -3 778 29Z"],"명":[880,"M489 569Q505 559 514 559Q517 560 534 568Q552 577 587 581L631 586V455L514 449H507Q499 449 487 450Q475 452 461 454ZM213 625H391L373 408H212V610Q212 622 213 625ZM207 367H339L456 372Q515 372 515 397V398Q516 397 534 407Q553 417 587 420L632 424Q634 287 668 287Q683 287 694 302Q705 318 714 341Q722 364 726 391Q731 418 732 442L734 493V690Q734 709 739 726Q742 735 745 743Q745 753 720 762Q696 771 631 787Q617 790 604 792Q591 794 578 794Q528 794 528 780Q567 761 588 748Q608 734 618 723Q628 712 630 702Q631 693 631 683V617L499 611Q500 616 505 621Q510 626 515 632Q520 637 524 642Q528 648 528 654Q528 680 494 688Q461 695 381 695Q375 695 374 690Q372 686 368 680Q364 675 354 670Q344 665 322 664L213 661Q212 662 201 666Q190 670 171 674Q152 679 126 682Q100 686 69 686Q46 686 30 682Q14 677 14 669Q45 658 62 650Q79 642 88 634Q97 625 99 616Q101 607 102 595L114 404Q117 359 126 338Q135 316 153 316Q192 316 207 367ZM712 117Q712 156 692 187Q673 218 642 240Q610 262 568 274Q527 286 484 286Q442 286 401 274Q360 262 328 240Q295 218 276 187Q256 156 256 117Q256 79 276 48Q295 17 328 -5Q360 -27 401 -40Q442 -52 484 -52Q527 -52 568 -40Q609 -28 641 -6Q673 17 692 48Q712 79 712 117ZM602 117Q602 94 592 72Q583 49 566 32Q550 14 529 3Q508 -8 484 -8Q460 -8 439 3Q418 14 402 32Q385 49 376 72Q366 94 366 117Q366 141 375 165Q384 189 400 208Q416 226 438 238Q459 250 484 250Q508 250 530 238Q551 226 567 207Q583 188 592 164Q602 141 602 117Z"],"놈":[880,"M868 360Q868 374 857 382Q846 390 826 394Q807 398 780 399Q753 400 721 400Q716 401 710 396Q704 391 690 384Q676 378 649 372Q622 365 574 364L514 362V419Q514 435 517 445Q520 455 520 462Q520 473 500 478L675 479Q734 479 734 509Q734 525 724 534Q713 543 694 548Q675 552 648 553Q622 554 590 554Q587 554 584 553Q581 552 576 547L558 533Q547 526 515 520Q483 513 437 513H318H315Q303 513 301 520L300 654Q300 665 302 678Q304 690 304 695Q304 703 301 708Q298 713 286 718Q274 722 252 726Q229 730 190 735Q169 738 149 738Q123 738 105 734Q87 729 87 722Q126 708 146 699Q167 690 176 682Q186 674 188 666Q190 657 190 645V522Q190 510 198 501Q205 492 216 486Q228 480 242 477Q256 474 268 474L293 473L347 475Q371 466 384 459Q397 452 403 445Q409 438 410 430Q411 422 411 410V359L219 353Q203 352 189 352Q175 352 161 352Q122 352 96 354Q69 356 52 358Q35 360 26 362Q16 364 10 364Q6 364 2 362Q-3 360 -3 356Q-3 348 14 336Q31 325 52 314Q74 302 93 294Q112 286 116 286Q120 286 132 290Q144 295 178 301Q211 307 273 313Q335 319 440 323L647 331H808Q868 331 868 360ZM329 202H574V17H328V184Q328 187 328 193Q329 199 329 202ZM324 -26H483L646 -21Q705 -21 705 4Q705 32 654 35L690 191Q691 195 696 201Q700 207 706 214Q711 220 715 227Q719 234 719 242Q719 264 686 270Q654 275 590 275Q586 275 584 270Q582 266 577 260Q572 255 562 250Q551 246 531 245L322 238Q318 241 280 250Q243 259 185 259Q162 259 146 254Q131 250 131 242Q162 232 180 224Q198 215 206 206Q215 198 217 189Q219 180 219 169L234 7Q241 -81 271 -81Q314 -81 324 -26Z"],"0":[493,"M248 630Q287 630 325 612Q363 594 393 556Q422 518 440 456Q457 395 457 307Q457 219 440 158Q422 98 393 60Q363 22 325 4Q287 -14 248 -14Q207 -14 170 4Q132 22 103 60Q73 98 55 158Q37 219 37 307Q37 357 46 414Q56 470 80 518Q104 567 144 598Q185 630 248 630ZM149 307Q149 220 156 167Q164 114 178 84Q192 53 210 42Q228 32 248 32Q268 32 286 42Q303 53 317 84Q331 114 338 167Q346 220 346 307Q346 394 338 448Q331 502 317 532Q303 562 286 573Q268 584 248 584Q228 584 210 574Q192 563 178 533Q164 502 156 448Q149 394 149 307Z"],"1":[493,"M305 85Q306 64 328 59L412 42Q434 38 434 19Q434 0 409 0H93Q68 0 68 19Q68 37 91 42L176 58Q198 63 199 85V515Q199 539 175 539H173L120 534Q109 534 102 538Q94 541 94 554Q94 574 116 580L278 621Q283 623 286 623Q290 623 294 623Q301 623 303 621Q308 616 308 597L305 479Z"],"2":[493,"M143 98H427Q452 98 452 73V25Q452 0 427 0H74Q49 0 49 25V53Q49 72 61 84L188 215Q254 284 286 341Q319 398 319 458Q319 517 290 550Q260 584 207 584Q199 584 194 583Q173 581 168 560L157 516Q148 473 133 458Q118 443 97 443Q59 443 43 477Q45 518 64 547Q82 576 110 594Q138 613 174 622Q209 630 245 630Q284 630 318 621Q351 612 376 592Q401 573 415 543Q429 513 429 471Q429 434 418 403Q406 372 382 340Q358 308 321 270Q284 233 233 184Z"],"3":[493,"M201 583Q182 582 178 560L170 522Q162 487 148 473Q135 459 112 459Q77 459 59 493Q62 529 79 555Q96 581 122 598Q147 614 178 622Q210 630 242 630Q277 630 312 622Q347 613 374 594Q401 576 418 547Q435 518 435 478Q435 422 400 384Q366 345 305 325Q457 298 457 167Q457 119 438 85Q418 51 386 29Q354 7 313 -4Q272 -14 230 -14Q194 -14 161 -6Q128 2 102 20Q75 37 58 64Q41 92 38 131Q47 151 60 158Q73 166 90 166Q114 166 128 151Q143 136 152 94L159 57Q164 34 184 33Q190 32 196 32Q202 32 207 32Q276 32 310 68Q345 103 345 170Q345 229 312 264Q279 299 210 299H188Q163 299 163 324Q163 349 188 349H202Q328 349 328 471Q328 525 300 554Q272 584 220 584Q215 584 210 584Q206 584 201 583Z"],"4":[493,"M453 245Q478 245 478 220V192Q478 167 453 167H382V25Q382 0 357 0H308Q283 0 283 25V167H44Q19 167 19 192V213Q19 230 29 244L298 610Q310 625 328 625H357Q382 625 382 600V245ZM89 245H283V516Z"],"5":[493,"M156 517 146 378Q170 383 192 386Q215 389 238 389Q285 389 325 377Q365 365 394 340Q423 316 440 279Q456 242 456 192Q456 142 438 104Q419 65 388 39Q356 13 314 0Q272 -14 225 -14Q144 -14 94 24Q44 61 36 125Q48 168 89 168Q112 168 126 154Q140 139 149 96L156 60Q161 39 180 35Q198 32 215 32Q278 32 312 74Q345 117 345 186Q345 253 310 289Q276 325 209 325Q170 325 134 318Q130 317 123 317Q112 317 104 321Q90 327 91 348L108 591Q110 615 134 615H412Q437 615 437 590V542Q437 517 412 517Z"],"6":[493,"M386 632Q396 632 404 630Q411 627 413 615Q416 596 392 590Q291 563 226 498Q160 433 146 327Q205 381 280 381Q367 381 414 332Q461 282 461 194Q461 97 405 42Q349 -14 252 -14Q193 -14 152 9Q111 32 84 70Q58 107 46 156Q34 205 34 257Q34 334 61 398Q88 463 136 512Q183 561 248 592Q312 623 386 632ZM257 32Q301 32 327 68Q353 105 353 180Q353 255 326 288Q298 321 250 321Q195 321 144 279Q144 253 148 211Q151 169 162 130Q174 90 196 61Q219 32 257 32Z"],"7":[493,"M55 590Q55 615 80 615H429Q454 615 454 590V573Q454 559 448 542L237 19Q230 0 208 0H149Q131 0 126 5Q122 9 131 29L375 517H80Q55 517 55 542Z"],"8":[493,"M320 335Q386 300 420 259Q453 218 453 158Q453 114 435 82Q417 49 388 28Q359 7 322 -4Q284 -14 244 -14Q208 -14 172 -6Q135 2 106 20Q76 38 58 67Q40 96 40 139Q40 196 74 234Q107 272 168 301Q114 336 89 376Q64 417 64 466Q64 506 80 536Q95 567 121 588Q147 608 181 619Q215 630 252 630Q285 630 316 620Q347 611 371 593Q395 575 410 548Q424 520 424 484Q424 447 402 410Q380 373 320 335ZM248 31Q297 31 326 62Q355 92 355 140Q355 160 348 176Q341 193 324 210Q307 227 279 244Q251 260 208 280Q170 255 152 224Q134 192 134 145Q134 92 166 62Q198 31 248 31ZM251 584Q211 584 184 560Q156 535 156 492Q156 466 166 445Q177 424 194 408Q212 392 234 380Q255 367 276 357Q312 388 326 417Q339 446 339 481Q339 527 316 556Q293 584 251 584Z"],"9":[493,"M118 -10Q115 -11 109 -11Q92 -11 89 5Q85 24 108 31Q156 48 194 69Q231 90 260 120Q288 149 307 188Q326 226 335 277Q289 243 222 243Q180 243 144 256Q109 269 84 293Q58 317 44 352Q29 386 29 429Q29 474 45 511Q61 548 90 574Q118 601 156 616Q195 630 239 630Q296 630 337 609Q378 588 404 552Q429 517 441 470Q453 424 453 372Q453 295 428 232Q402 168 358 120Q313 71 252 38Q190 6 118 -10ZM251 302Q298 302 341 331Q342 336 342 340Q342 345 342 350V370Q342 395 340 432Q337 468 326 502Q316 536 295 560Q274 584 238 584Q197 584 167 549Q137 514 137 441Q137 367 170 334Q202 302 251 302Z"],",":[300,"M153 -35 119 -11Q94 6 84 27Q73 48 73 68Q73 97 92 119Q112 141 147 141Q171 141 186 132Q201 122 210 107Q218 92 221 73Q224 54 224 34Q224 -6 210 -43Q196 -80 172 -112Q149 -144 118 -168Q86 -193 50 -208Q43 -211 36 -211Q25 -211 20 -199Q12 -181 35 -168Q78 -143 108 -111Q137 -79 153 -35Z"]}};
const TROPHIES=(()=>{
 const C=TROPHY_CARD,W=C.W,H=C.H;
 let url='',serial=0,total=0,page=0,opened=false,wasPaused=false,returnFocus=null;
 const modal=$('#trophyModal'),img=$('#trophyImage'),status=$('#trophyStatus'),save=$('#trophySave');
 const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const artCache = new Map();
 let portraitQueue=Promise.resolve();
 function loadPicture(name,file){
  if(artCache.has(name))return artCache.get(name);
  const loading=new Promise((resolve,reject)=>{
   const image=new Image();
   const timer=setTimeout(()=>reject(new Error('Trophy image timeout: '+name)),15000);
   image.onload=()=>{clearTimeout(timer);resolve(image);};
   image.onerror=()=>{clearTimeout(timer);reject(new Error('Trophy image failed: '+name));};
   image.src='assets/'+file;
  }).catch(error=>{artCache.delete(name);throw error;});
  artCache.set(name,loading);return loading;
 }
 // 머리 굽기: 놀이 중 프레임을 막지 않게 한 장씩, 두 프레임 쉬고 굽는다
 function loadPortrait(name,spec){
  if(artCache.has(name))return artCache.get(name);
  const loading=portraitQueue.then(nextFrame).then(()=>trophyPortrait(spec)).catch(error=>{artCache.delete(name);throw error;});
  portraitQueue=loading.catch(()=>{});
  artCache.set(name,loading);return loading;
 }
 // 맨 앞(가장 최근)은 눈을 뜬 채 나를 본다. 나머지는 옷 색마다 죽은 꼴이 다르다.
 // 살 변형을 끈 사람에겐 눈 파임·턱 떨어짐 대신 꿰맨 눈만 쓴다
 function portraitFor(head){
  const outfit=((head.ordinal%6)+6)%6;
  if(head.hero)return {name:'trophy-hero-'+outfit,spec:{outfit,eyes:'stare',jaw:.32,tongue:1,droop:.18}};
  let face=TROPHY_FACES[outfit];
  if(!PREF.deform&&(face.eyes==='gouged'||face.jaw==='gone'))face={eyes:'sewn',jaw:.05,droop:face.droop};
  return {name:'trophy-'+outfit+(PREF.deform?'':'-plain'),spec:Object.assign({outfit},face)};
 }
 async function loadCardArt(layout){
  const wanted=new Map();
  for(const head of layout.heads)if(!head.empty){const p=portraitFor(head);head.art=p.name;if(!wanted.has(p.name))wanted.set(p.name,p.spec);}
  const names=[...wanted.keys()];
  const [field,...portraits]=await Promise.all([
   loadPicture('trophy-field','trophy-field.webp?v=field-1'),
   ...names.map(name=>loadPortrait(name,wanted.get(name)))
  ]);
  const heads=new Map(names.map((name,i)=>[name,portraits[i]]));
  return {field,heads};
 }
 function cardText(layout){
  return {title:'족친 천지신명',count:layout.count.toLocaleString('ko-KR'),unit:'놈',footer:layout.pages>1?(layout.start+1)+'–'+(layout.start+layout.n)+'번째 · '+(layout.page+1)+' / '+layout.pages:''};
 }
 /* ---- 글씨: 구워 둔 윤곽선(Path2D). 없는 글자·옛 브라우저는 시스템 명조로 ---- */
 const glyphs=new Map();
 function glyph(font,ch){
  const key=font+ch;if(glyphs.has(key))return glyphs.get(key);
  const G=TROPHY_TYPE[font][ch];let path=null;
  if(G&&typeof Path2D==='function'){try{path=new Path2D(G[1]);}catch(_){path=null;}}
  glyphs.set(key,path);return path;
 }
 function textWidth(font,text,size,track=0){let w=0;for(const ch of text){const G=TROPHY_TYPE[font][ch];w+=(G?G[0]/1000:.32)*size+track;}return w-track;}
 function drawText(g,font,text,size,x,y,track=0){
  let cx=x;
  for(const ch of text){
   const G=TROPHY_TYPE[font][ch],p=G?glyph(font,ch):null;
   if(p){g.save();g.translate(cx,y);g.scale(size/1000,-size/1000);g.fill(p);g.restore();}
   else if(ch!==' '){g.save();g.font=Math.round(size*.92)+'px "Noto Serif KR","Apple SD Gothic Neo",serif';g.textAlign='left';g.textBaseline='alphabetic';g.fillText(ch,cx,y);g.restore();}
   cx+=(G?G[0]/1000:.32)*size+track;
  }
  return cx;
 }
 /* ---- 그림 ---- */
 const canvasOf=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 function drawField(g,field,hz){
  // 연필 들판 그림 한 장(구름 낀 하늘·먼 산·들판)을 밤으로 누른다. 하늘은 위로 갈수록 어둡다.
  // 그림의 지평선(원본 505px)을 이 장의 지평선(hz)에 맞추고, 카메라가 높아 지평선이 올라가면 땅이 화면 아래까지 덮이게 키운다
  const off=canvasOf(W,H),o=off.getContext('2d'),s=Math.max(1.7,(H+10-hz)/(field.height-505)),iw=field.width*s,ih=field.height*s;
  o.drawImage(field,(W-iw)/2,hz-505*s,iw,ih);
  o.globalCompositeOperation='multiply';
  const sky=o.createLinearGradient(0,0,0,hz-60);sky.addColorStop(0,'#3a433f');sky.addColorStop(.55,'#59635e');sky.addColorStop(1,'#6f7974');
  o.fillStyle=sky;o.fillRect(0,0,W,Math.max(1,hz-60));
  const night=o.createLinearGradient(0,hz-60,0,H);night.addColorStop(0,'#6f7974');night.addColorStop(.3,'#46504b');night.addColorStop(1,'#1b201e');
  o.fillStyle=night;o.fillRect(0,hz-60,W,H-hz+60);
  g.drawImage(off,0,0);
  // 지평선 바로 위는 더 눌러서 뒷줄 머리들이 하늘에 묻히지 않게 한다
  const top=Math.max(0,hz-280),low=g.createLinearGradient(0,top,0,hz);low.addColorStop(0,'rgba(18,22,21,0)');low.addColorStop(.6,'rgba(18,22,21,.38)');low.addColorStop(1,'rgba(26,31,30,.15)');
  g.fillStyle=low;g.fillRect(0,top,W,hz-top);
  const mist=g.createLinearGradient(0,hz-80,0,hz+140);mist.addColorStop(0,'rgba(150,160,152,0)');mist.addColorStop(.45,'rgba(150,160,152,.2)');mist.addColorStop(1,'rgba(150,160,152,0)');
  g.fillStyle=mist;g.fillRect(0,hz-80,W,220);
 }
 /* 먼 공기: 머리 없는 들판(바탕)의 줄마다 평균 빛깔을, 먼 줄부터 그려 나가며 그때까지 그린 것 위에 얇게 한 겹씩 덮는다.
  * 멀리 있는 것일수록 여러 겹을 받아 그 자리 바탕 빛에 녹는다(맨 끝 줄이 지평선 앞에서 칼로 자른 듯 끝나지 않고 어둠 속으로 사라진다).
  * 5m 안(8놈까지의 머리 높이 장면 전부)은 받지 않는다. 바탕 위에 바탕 빛을 덮는 셈이라 땅은 그대로다. */
 const AIR={NEAR:5,SIGMA:.035,EDGE:.22,FADE:.9,STEP:.6};
 // 남은 빛(1=또렷, 0=바탕에 녹음): 거리만큼 옅어지고, 들판 맨 뒤 22%는 끝으로 갈수록 바탕에 녹는다(끝 줄이 선으로 보이지 않게)
 function airLeft(air,z){
  const t=clamp((z-air.edge)/Math.max(1e-6,air.far-air.edge),0,1);
  return Math.exp(-AIR.SIGMA*Math.max(0,z-AIR.NEAR))*(1-air.fade*t*t*(3-2*t));
 }
 function airOf(g,layout){
  const heads=layout.heads;if(!heads.length||heads[0].z<AIR.NEAR+AIR.STEP)return null;
  const far=heads[0].z,near=heads[heads.length-1].z,e=layout.camera?layout.camera.e:0,ramp=clamp((e-.25)/.35,0,1);
  let top=H;for(const h of heads)if(h.z>AIR.NEAR)top=Math.min(top,h.y-h.size*.75);
  top=clamp(Math.floor(top)-24,0,H-1);
  // 바탕을 못 읽는 브라우저(그림 읽기 막힘 등)에서는 먼 공기 없이 그린다
  let data;const rows=H-top;try{data=g.getImageData(0,top,W,rows).data;}catch(_){return null;}if(!data||data.length<rows*W*4)return null;
  const fill=g.createLinearGradient(0,top,0,H);
  for(let y=0;y<rows;y+=6){
   let R=0,Gr=0,B=0,k=0;const o=y*W*4;
   for(let x=0;x<W;x+=3){const i=o+x*4;R+=data[i];Gr+=data[i+1];B+=data[i+2];k++;}
   fill.addColorStop(y/rows,'rgb('+Math.round(R/k)+','+Math.round(Gr/k)+','+Math.round(B/k)+')');
  }
  return {fill,top,z:far,far,edge:far-AIR.EDGE*(far-near),fade:AIR.FADE*ramp*ramp*(3-2*ramp)};
 }
 function airPass(g,air,z,bottom){
  const a=1-airLeft(air,air.z)/airLeft(air,z),y=air.top,feather=24;air.z=z;if(!(a>.002))return;
  g.save();g.fillStyle=air.fill;
  // 위 가장자리는 몇 겹으로 나눠 흐리게(바탕 결이 평균 빛으로 눌린 경계가 줄로 보이지 않게)
  for(let i=0;i<4;i++){g.globalAlpha=a*(i+1)/5;g.fillRect(0,y+i*feather/4,W,feather/4);}
  g.globalAlpha=a;g.fillRect(0,y+feather,W,Math.max(0,bottom-y-feather));
  g.restore();
 }
 function fogBand(g,y,h,a,r){
  const band=g.createLinearGradient(0,y-h,0,y+h*.35);band.addColorStop(0,'rgba(146,156,149,0)');band.addColorStop(.62,'rgba(146,156,149,'+a+')');band.addColorStop(1,'rgba(146,156,149,0)');
  g.fillStyle=band;g.fillRect(0,y-h,W,h*1.35);
  for(let i=0;i<5;i++){
   const x=r()*W,w=160+r()*320,hh=h*(.25+r()*.35),yy=y-h*.25+(r()-.5)*h*.4;
   const wisp=g.createRadialGradient(x,yy,0,x,yy,w);wisp.addColorStop(0,'rgba(160,170,162,'+a+')');wisp.addColorStop(1,'rgba(160,170,162,0)');
   g.save();g.translate(x,yy);g.scale(1,hh/w);g.translate(-x,-yy);g.fillStyle=wisp;g.fillRect(x-w,yy-w,w*2,w*2);g.restore();
  }
 }
 // 머리 그림 안의 자리(0~1) → 카드 자리
 function headPoint(h,u,v){const sx=(h.flip?-1:1)*(u-.5)*h.size,sy=(v-.5)*h.size,c=Math.cos(h.tilt),s=Math.sin(h.tilt);return [h.x+sx*c-sy*s,h.y+sx*s+sy*c];}
 // One line through the neck opening and a buried point inside the head.
 // The shaft, ground contact and any exposed tip all share this line after flip/tilt.
 function stakeMount(h,pic){
  const neck=h.empty?[h.x,h.y]:headPoint(h,...pic.anchors.neck);
  const inside=h.empty?neck:headPoint(h,...pic.anchors.stake);
  const slope=h.empty?-Math.sin(h.lean):(inside[0]-neck[0])/Math.max(1,neck[1]-inside[1]);
  const xAt=y=>neck[0]+slope*(neck[1]-y);
  return {neck,inside,xAt,baseX:xAt(h.footY)};
 }
 function drip(g,x0,y0,x1,y1,w,r){
  g.lineCap='round';g.strokeStyle='rgba(9,14,44,.95)';g.lineWidth=w;
  g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+(r()-.5)*w*2,(y0+y1)/2,x1,y1);g.stroke();
  g.fillStyle='rgba(9,14,44,.95)';g.beginPath();g.ellipse(x1,y1+w*.3,w*.75,w*1.05,0,0,TAU);g.fill();
  g.strokeStyle='rgba(72,98,196,.42)';g.lineWidth=Math.max(.5,w*.28);
  g.beginPath();g.moveTo(x0-w*.2,y0+w);g.quadraticCurveTo((x0+x1)/2-w*.2,(y0+y1)/2,x1-w*.25,y1-w*.4);g.stroke();
 }
 function stakeBody(g,baseX,footY,topX,topY,w,sharp){
  const wood=g.createLinearGradient(baseX-w,0,baseX+w,0);wood.addColorStop(0,'#6a5a49');wood.addColorStop(.3,'#30271f');wood.addColorStop(1,'#0c0a09');
  g.fillStyle=wood;g.beginPath();g.moveTo(baseX-w*.6,footY);
  if(sharp){g.lineTo(topX-w*.42,topY+w*2.2);g.lineTo(topX,topY-w*.4);g.lineTo(topX+w*.42,topY+w*2.2);}
  else{g.lineTo(topX-w*.42,topY);g.lineTo(topX+w*.42,topY);}
  g.lineTo(baseX+w*.6,footY);g.closePath();g.fill();
 }
 function drawStake(g,h,pic,blood){
  const w=Math.max(2.4,h.size*(h.empty?.05:.055)),r=trophyRng(h.ordinal*31+5+(h.empty?Math.round(h.x):0));
  const mount=stakeMount(h,pic),[nx,ny]=mount.neck,[ix,iy]=mount.inside;
  const baseX=mount.baseX,footY=h.footY;
  g.fillStyle='rgba(4,6,7,.6)';g.beginPath();g.ellipse(baseX+w*.8,footY+1,w*3.4,Math.max(1.4,w*.6),0,0,TAU);g.fill();
  if(!h.empty&&blood){g.fillStyle='rgba(9,16,50,.82)';g.beginPath();g.ellipse(baseX+w*(.6+r()),footY+w*.15,w*(2.4+r()*2.6),Math.max(1.2,w*.5),0,0,TAU);g.fill();}
  stakeBody(g,baseX,footY,ix,iy,w,h.empty);
  if(h.empty||!blood)return;
  // 목에서 흘러 장대를 타고 내려간 피(맨 앞만 길게)
  const drips=2+Math.floor(r()*3);
  for(let i=0;i<drips;i++){
   const u=(r()-.5)*.8,k=h.row===0&&i===0?.35+r()*.2:.04+r()*.14;
   const x0=nx+u*w*.8,y0=ny-h.size*.02;drip(g,x0,y0,x0+(baseX-nx)*k,ny+(footY-ny)*k,Math.max(1,w*(.2+r()*.22)),r);
  }
 }
 function drawGore(g,h,pic,blood){
  const a=pic.anchors,r=trophyRng(h.ordinal*131+7),u=h.size/400;
  if(h.tip){// 장대 끝이 면류관을 뚫고 나왔다
   const mount=stakeMount(h,pic),ty=headPoint(h,a.top[0],a.top[1]+.02)[1],w=Math.max(2,h.size*.05),len=h.size*.2;
   const tx=mount.xAt(ty+4),tipX=mount.xAt(ty-len);
   g.fillStyle='#2b231c';g.beginPath();g.moveTo(tx-w*.45,ty+4);g.lineTo(tipX,ty-len);g.lineTo(tx+w*.45,ty+4);g.closePath();g.fill();
   if(blood)drip(g,mount.xAt(ty-len*.5),ty-len*.5,mount.xAt(ty+6)+1,ty+6,Math.max(.8,w*.35),r);
  }
  if(!blood||h.size<26)return;
  // 눈: 피눈물, 파낸 눈구멍은 줄줄
  a.eyes.forEach((e,i)=>{
   const gouged=a.gouged&&i===0;if(!gouged&&!h.hero&&r()<.45)return;
   const [x,y]=headPoint(h,e[0],e[1]),len=(gouged?70+r()*70:25+r()*45)*u,w=(gouged?6:3.4)*u;
   drip(g,x,y,x+(r()-.5)*6*u,y+len,Math.max(.8,w),r);
   if(gouged)drip(g,x+6*u,y,x+10*u,y+len*.6,Math.max(.7,w*.7),r);
  });
  // 입: 턱을 타고 흐르는 피
  if(a.tongue||a.jawGone||r()<.6){const [x,y]=headPoint(h,a.mouth[0]+(r()-.5)*.06,a.mouth[1]+.02);drip(g,x,y,x+(r()-.5)*8*u,y+(40+r()*70)*u,Math.max(.8,4.2*u),r);}
 }
 // 멀리 있는 머리일수록 밤·안개에 묻힌다(거리 단계마다 한 번만 만들어 둔다)
 const graded=new Map();
 function gradedHead(name,pic,depth){
  const step=clamp(Math.floor((depth-1)/.9),0,5),key=name+':'+step;
  if(graded.has(key))return graded.get(key);
  const res=[512,512,256,256,128,128][step],c=canvasOf(res,res),o=c.getContext('2d');
  o.drawImage(pic,0,0,res,res);
  // 명암을 한 번 더 세운다(가까운 머리일수록): 그늘은 깊게, 뒤에서 비친 빛에 걸린 가장자리는 밝게
  if(step<3){o.globalCompositeOperation='overlay';o.globalAlpha=[.85,.6,.35][step];o.drawImage(pic,0,0,res,res);o.globalAlpha=1;}
  o.globalCompositeOperation='multiply';o.fillStyle='#98a39a';o.fillRect(0,0,res,res);
  o.globalCompositeOperation='destination-in';o.drawImage(pic,0,0,res,res);
  // 먼 단계일수록 덮는 빛을 들판 먼 곳의 밤빛으로 낮춘다(밝은 안개빛을 덮으면 먼 머리 떼가 바탕보다 허옇게 떠서 띠처럼 보였다)
  const tint=['118,128,121','118,128,121','118,128,121','100,108,103','88,95,90','80,87,82'][step];
  o.globalCompositeOperation='source-atop';o.fillStyle='rgba('+tint+','+[0,.16,.3,.42,.52,.6][step]+')';o.fillRect(0,0,res,res);
  c.anchors=pic.anchors;c.trophyHead=name;graded.set(key,c);return c;
 }
 function finish(g){
  const v=g.createRadialGradient(540,620,240,540,680,900);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.68,'rgba(0,0,0,.32)');v.addColorStop(1,'rgba(0,0,0,.88)');
  g.fillStyle=v;g.fillRect(0,0,W,H);
  const r=trophyRng(4242);
  for(let i=0;i<26000;i++){g.fillStyle=r()<.5?'rgba(255,248,230,.05)':'rgba(0,0,0,.12)';g.fillRect(r()*W,r()*H,1+r()*1.6,1+r()*1.6);}
  g.strokeStyle='rgba(230,224,206,.06)';
  for(let i=0;i<5;i++){const x=r()*W;g.lineWidth=.6+r();g.beginPath();g.moveTo(x,r()*300);g.lineTo(x+(r()-.5)*6,700+r()*650);g.stroke();}
 }
 function drawCard(layout,text,art){
  const canvas=canvasOf(W,H),g=canvas.getContext('2d'),blood=PREF.blood!==false;
  g.fillStyle='#090a0a';g.fillRect(0,0,W,H);
  drawField(g,art.field,layout.horizon);
  const r=trophyRng(99),haze=1-.55*(layout.camera?layout.camera.e:0),air=airOf(g,layout);
  // 안개 띠: 줄마다가 아니라 땅이 45px 이상 바뀔 때마다 하나(멀리 촘촘한 줄마다 깔면 겹쳐서 들판이 허옇게 바랬다)
  let lastRow=-1,lastFog=-Infinity,drawnFoot=-Infinity;
  for(const h of layout.heads){
   if(air&&h.z<air.z-AIR.STEP&&drawnFoot>air.top)airPass(g,air,h.z,drawnFoot);
   drawnFoot=Math.max(drawnFoot,h.footY+6);
   if(h.row!==lastRow){lastRow=h.row;if(h.footY-lastFog>=45){fogBand(g,h.footY,30+220/h.depth,Math.min(.16,.03+.028*h.depth)*haze,r);lastFog=h.footY;}}
   if(h.empty){drawStake(g,h,null,blood);continue;}
   const pic=gradedHead(h.art,art.heads.get(h.art),h.depth);
   drawStake(g,h,pic,blood);
   g.save();g.translate(h.x,h.y);g.rotate(h.tilt);if(h.flip)g.scale(-1,1);
   g.drawImage(pic,-h.size/2,-h.size/2,h.size,h.size);g.restore();
   drawGore(g,h,pic,blood);
  }
  const low=g.createLinearGradient(0,1060,0,H);low.addColorStop(0,'rgba(6,7,7,0)');low.addColorStop(.45,'rgba(6,7,7,.78)');low.addColorStop(1,'rgba(6,7,7,.97)');
  g.fillStyle=low;g.fillRect(0,1060,W,H-1060);
  finish(g);
  // 글씨
  g.fillStyle='#e7dcc6';
  const tw=textWidth('song',text.title,62,16);drawText(g,'song',text.title,62,540-tw/2,110,16);
  const nw=textWidth('song',text.count,176),uw=textWidth('song',text.unit,92),total=nw+12+uw,x0=540-total/2;
  g.fillStyle='#ebe0c9';drawText(g,'song',text.count,176,x0,1262);drawText(g,'song',text.unit,92,x0+nw+12,1262);
  if(text.footer){g.fillStyle='rgba(204,194,174,.7)';g.font='20px "IBM Plex Sans KR",sans-serif';g.textAlign='center';g.fillText(text.footer,540,1316);}
  return {canvas};
 }
 function release(){if(url)URL.revokeObjectURL(url);url='';img.removeAttribute('src');save.removeAttribute('href');}
 async function prepare(){
  const ticket=++serial;release();save.hidden=true;img.hidden=true;status.textContent='전리품 사진 만드는 중…';
  const layout=trophyLayout(total,page);page=layout.page;
  $('#trophyPages').hidden=layout.pages===1;$('#trophyPrev').disabled=page===0;$('#trophyNext').disabled=page===layout.pages-1;
  $('#trophyPageLabel').textContent=(page+1)+' / '+layout.pages;
  try{
   await nextFrame();if(!opened||ticket!==serial)return;
   const text=cardText(layout),art=await loadCardArt(layout);
   if(!opened||ticket!==serial)return;
   const card=drawCard(layout,text,art);const result=await new Promise((resolve,reject)=>card.canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG')),'image/png'));
   if(!opened||ticket!==serial)return;
   url=URL.createObjectURL(result);img.src=url;img.hidden=false;
   img.alt='족친 천지신명 '+total+'놈. 구름 낀 밤 들판의 장대에 꽂힌 랩틸리언 머리 '+layout.n+'개'+(layout.pages>1?' ('+(page+1)+' / '+layout.pages+'장)':'')+'.';
   save.href=url;save.download='족친천지신명_'+total+'놈'+(layout.pages>1?'_'+(page+1):'')+'.png';save.hidden=false;status.textContent='';
  }catch(error){if(opened&&ticket===serial){status.textContent='사진을 만들지 못했어요. 닫았다가 다시 눌러 주세요.';console.warn('Trophy image failed',error);}}
 }
 function open(){
  if(opened||$('#again').hidden||!G.ended)return;
  total=PROGRESS.defeated;page=0;wasPaused=G.paused;returnFocus=document.activeElement;opened=true;G.paused=true;clearPointers();AUDIO.hold(true);
  $('#trophyResetConfirm').hidden=true;$('#trophyReset').hidden=total===0;
  setFightModal(modal,true);$('#trophyClose').focus({preventScroll:true});prepare();
 }
 function close(focus=true){
  if(!opened)return;opened=false;serial++;release();setFightModal(modal,false);G.paused=wasPaused;AUDIO.hold(wasPaused);last=performance.now();
  if(focus&&returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});
 }
 $('#trophyBtn').addEventListener('click',open);$('#trophyClose').addEventListener('click',()=>close());
 $('#trophyPrev').addEventListener('click',()=>{page--;prepare();});$('#trophyNext').addEventListener('click',()=>{page++;prepare();});
 $('#trophyReset').addEventListener('click',()=>{
  if(!opened||!PROGRESS.defeated)return;
  $('#trophyResetQuestion').textContent='족친 기록 '+PROGRESS.defeated.toLocaleString('ko-KR')+'명을 지울까요?';
  $('#trophyReset').hidden=true;$('#trophyResetConfirm').hidden=false;$('#trophyResetNo').focus({preventScroll:true});
 });
 $('#trophyResetNo').addEventListener('click',()=>{$('#trophyResetConfirm').hidden=true;$('#trophyReset').hidden=false;$('#trophyReset').focus({preventScroll:true});});
 $('#trophyResetYes').addEventListener('click',()=>{
  if(!opened||$('#trophyResetConfirm').hidden)return;
  if(!PROGRESS.reset()){status.textContent='기록을 지우지 못했어요. 브라우저 저장 공간을 확인해 주세요.';return;}
  total=0;page=0;$('#trophyResetConfirm').hidden=true;$('#trophyReset').hidden=true;updateDefeatCount();$('#trophyClose').focus({preventScroll:true});prepare();
 });
 modal.addEventListener('click',e=>{if(e.target===modal)close();});
 modal.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
  if(e.key==='Tab'){const controls=[...modal.querySelectorAll('button:not(:disabled),a[href]')].filter(e=>e.getClientRects().length);const first=controls[0],end=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}}
 });
 return {close,draw:(count,p=0)=>{const layout=trophyLayout(count,p);return loadCardArt(layout).then(art=>drawCard(layout,cardText(layout),art).canvas);}};
})();


// 끝: 누적 처치 수와 후임 천지신명으로 넘어가는 버튼.
function showAgain(){const w=$('#again');w.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add('on')));}
function hideAgain(){const w=$('#again');w.classList.remove('on');w.hidden=true;}
// 후임 족치러 가기: 버튼이 사라지고, 나를 내려다보는 그 눈에 대고 한마디 뱉는다(말풍선 + 녹음한 목소리). 다 뱉고 나면 updateStory()가 다음 판을 연다
function retortAndRestart(){
 if(G.retorting||!G.ended)return;
 G.retorting=true;hideAgain();clearPointers();
 queueTalk([['player',LINES.retort,1.6,.1,1.4,LINES.retort]],true);
}
$('#againBtn').addEventListener('click',()=>{AUDIO.unlock();AUDIO.ui();retortAndRestart();});
// 엔딩을 본 뒤에 열리는 「천지신명 정육공장」
$('#freeBtn').addEventListener('click',async()=>{
 const b=$('#freeBtn'),err=$('#freeEntryError');if(G.retorting||b.disabled)return;
 const controls=[$('#againBtn'),$('#trophyBtn')],disabled=controls.map(el=>el.disabled);
 b.disabled=true;b.setAttribute('aria-busy','true');b.textContent='공장 들어가는 중…';err.hidden=true;
 controls.forEach(el=>el.disabled=true);
 try{
  AUDIO.unlock();AUDIO.ui();
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if($('#fight').hidden||G.retorting)return;
  startRound('free');hideAgain();
 }catch(error){
  if(!$('#fight').hidden){showAgain();err.textContent='화면을 열지 못했습니다. 다시 눌러 주세요.';err.hidden=false;}
 }finally{
  b.disabled=false;b.removeAttribute('aria-busy');b.textContent='천지신명 정육공장';
  controls.forEach((el,i)=>el.disabled=disabled[i]);
 }
});
/* ===== 순응 장면 → 족치러 걸어가기 =====
 * 풀이 화면(index.html)이 스크롤에 맞춰 손에 든 종이로 줄어들면서 이 장면이 된다.
 * 가만히 있으면 추종자들 사이에서 설교를 듣는 순응이고, 종이를 꾹 눌러 구기면 떨어뜨리고
 * 앞사람들이 비켜선 길로 옥좌 앞까지 곧장 걸어가 지금과 같은 「넌 뭐야?」로 족치기가 시작된다.
 * INTRO.stage: off(쓰지 않음) · behind(풀이 화면 밑에 깔려 있음) · arrived(종이를 들고 서 있음) */
const INTRO={stage:'off',pull:0,hintAt:0,sermonHeard:false,previewDirty:true};
const CRUMPLE={c:0,holding:false,finish:false,started:false,done:false,pointer:null,budget:0,tick:0,doneAt:0,quietAt:0};
const CRUMPLE_SECONDS=.8;// 끝까지 구기는 데 꾹 누르고 있어야 하는 시간
// 설교를 끊음(spoke: 꾸짖음까지 나옴) · 물러섬(back: 「이제야 네 운명을 아는구나」가 나오면 군중이 돌아선다)
const INTERRUPT={spoke:false,back:false};
const WALK={on:false,t:0,dur:4.35,p0:V3(),p1:V3(),l0:V3(),l1:V3(),f0:52,f1:44,step:0,met:false};
const FIGHT_LABEL='천지신명. 터치하면 주먹 또는 밟기, 밀면 훅, 몸을 꾹 잡아 끌거나 던집니다.';
function crumpleReset(){INTRO.sermonHeard=false;Object.assign(CRUMPLE,{c:0,holding:false,finish:false,started:false,done:false,pointer:null,budget:0,tick:0,doneAt:0,quietAt:0});WALK.on=false;WALK.met=false;G.walking=false;INTERRUPT.spoke=INTERRUPT.back=false;}
function crumpleReady(){return G.mode==='submit'&&INTRO.stage==='arrived'&&INTRO.sermonHeard&&!CRUMPLE.done&&!G.paused&&!$('#fight').hidden;}
function crumplePress(){
 if(!crumpleReady())return false;
 AUDIO.unlock();CRUMPLE.holding=true;CRUMPLE.started=true;
 // 설교가 찍히던 글자에서 끊긴다. 도중에 손을 놓으면 잠시 뒤 다음 구절부터 다시 한다
 // 물러섰다가 천지신명이 「이제야…」를 하기 전에 다시 누르면 군중은 돌아서지 않고 계속 본다
 cutSermon();SUBMISSION.sermonSoon(1.8);INTERRUPT.back=false;
 $('#crumpleHint').classList.add('off');INTRO.hintAt=0;
 return true;
}
function crumpleRelease(){
 if(!CRUMPLE.holding)return;
 CRUMPLE.holding=false;CRUMPLE.pointer=null;
 // 거의 다 구겼으면(85%) 손을 떼도 마저 구긴다
 if(CRUMPLE.c>=.85){CRUMPLE.finish=true;return;}
 if(!CRUMPLE.done&&G.mode==='submit'&&INTRO.stage==='arrived'){if(INTERRUPT.spoke||SUBMISSION.staring)interruptYield();else{SUBMISSION.sermonSoon(1.4);INTRO.hintAt=G.time+1.4;}}
}
// 설교를 끊는다: 찍히던 글자에서 멈춘 채 잠깐 떠 있다가 흐려진다
// 다시 누를 때 천지신명이 나를 꾸짖던 중이면 그 꾸짖음은 끝까지 한다(뒤에 이어질 말만 거둔다)
function cutSermon(){
 if(TALK.cur&&TALK.cur.text===LINES.interrupt){TALK.q.length=0;return;}
 if(TALK.cur){BUB.freeze(TALK.cur.b);TALK.cur=null;}
 TALK.q.length=0;TALK.gap=0;if(G.E)G.E.talkUntil=0;
}
/* 종이를 구기기 시작함 = 설교를 끊음: 군중이 돌아보고 수군거리며, 천지신명이 한마디 한다.
 * 손을 놓고 물러서면 천지신명은 꾸짖음을 마저 하고 한마디 더 한다. 군중은 그 한마디가 나올 때까지 나를 보다가 돌아서고,
 * 설교는 그 뒤에 다음 구절부터 이어진다(updateInterrupt) */
function interruptStart(){
 SUBMISSION.stare(true);INTERRUPT.spoke=true;INTERRUPT.back=false;
 if(!(TALK.cur&&TALK.cur.text===LINES.interrupt))queueTalk([['boss',LINES.interrupt,0,.2,1]],true);
}
function interruptYield(){
 INTERRUPT.spoke=false;INTERRUPT.back=true;
 // 꾸짖음 뒤에 잇는다(설교는 두 마디가 다 끝나야 다시 시작한다: talkBusy). 「꾹 눌러 구기면…」 안내는 그 말이 끝난 뒤에 다시 뜬다
 queueTalk([['boss',LINES.yield,0,.35,1]]);SUBMISSION.sermonSoon(3.6);INTRO.hintAt=0;
}
function updateInterrupt(){
 if(!INTERRUPT.back)return;
 if((TALK.cur&&TALK.cur.text===LINES.yield)||!talkBusy()){INTERRUPT.back=false;SUBMISSION.stare(false);SUBMISSION.sermonSoon(2.9);INTRO.hintAt=G.time+2.3;}
}
function updateCrumple(dt){
 if(G.mode!=='submit'||INTRO.stage!=='arrived')return;
 if(INTRO.hintAt&&G.time>=INTRO.hintAt&&!CRUMPLE.holding){INTRO.hintAt=0;$('#crumpleHint').classList.remove('off');}
 // 다 구겼으면 천지신명의 꾸짖음(「윗사람을 거스르는 자에게는…」)이 끝나고 한 박자 쉰 뒤에 걸음을 뗀다. 수군거림은 걸어가면서 시작한다
 if(CRUMPLE.done){
  if(WALK.on)return;
  const left=bossTalkLeft();if(left>0)CRUMPLE.quietAt=G.time+left;
  if(G.time-CRUMPLE.doneAt>=.32&&(G.time>=CRUMPLE.quietAt+.5||G.time-CRUMPLE.doneAt>8))walkStart();
  return;
 }
 updateInterrupt();
 const before=CRUMPLE.c;
 if(CRUMPLE.holding||CRUMPLE.finish)CRUMPLE.c=Math.min(1,CRUMPLE.c+dt/CRUMPLE_SECONDS);
 else if(CRUMPLE.c>0)CRUMPLE.c=Math.max(0,CRUMPLE.c-dt*.85);// 손을 놓으면 도로 펴진다
 // 살짝 누른 게 아니라 정말 구기기 시작했을 때(10%) 설교를 끊은 것으로 친다
 if(CRUMPLE.holding&&CRUMPLE.c>=.1&&!INTERRUPT.spoke)interruptStart();
 const gain=CRUMPLE.c-before;
 if(gain>0){
  // 세게(빨리) 구길수록 바스락이 잦다
  CRUMPLE.budget+=gain*64;while(CRUMPLE.budget>=1){CRUMPLE.budget-=rnd(.7,1.3);AUDIO.crumple(.5+CRUMPLE.c*.7);}
  CRUMPLE.tick-=dt;if(CRUMPLE.tick<=0&&PREF.vibe&&navigator.vibrate){CRUMPLE.tick=.12;try{navigator.vibrate(7);}catch(_){}}
 }
 if(CRUMPLE.c>=.999){
  CRUMPLE.c=1;CRUMPLE.done=true;CRUMPLE.holding=CRUMPLE.finish=false;CRUMPLE.pointer=null;CRUMPLE.doneAt=G.time;
  AUDIO.crunch();if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([22,12,30]);}catch(_){}
  SUBMISSION.drop();
 }
}
// 걸어서 도착할 자리 = 족치기 첫 구도(combatCamera가 옥좌에 앉은 천지신명을 보는 자리). 도착한 뒤 카메라가 튀지 않는다
function walkGoal(){
 const portrait=innerWidth<innerHeight,aspect=innerWidth/innerHeight,distance=portrait?Math.max(2.55,1.7/aspect):3.05;
 const b=G.E&&G.E.combat,bx=b?b.x:0,bz=b?b.z:-.62,tall=portrait&&innerHeight/innerWidth>=1.95;
 WALK.p1.set(bx*.8+.12,1.58,bz+distance);WALK.l1.set(bx,tall?1.08:1.16,bz);WALK.f1=portrait?(tall?44:46):41;
}
function walkStart(){
 const E=G.E;
 G.mode='fight';G.walking=true;G.inputLocked=true;G.opening=false;clearPointers();
 // 설교를 끊은 데 대한 천지신명의 꾸짖음은 다 끝난 뒤에 걸음을 뗀다(updateCrumple). 아직 떠 있는 그 말풍선은 걸음을 떼면서 거둬서
 // 첫 수군거림(.28초 뒤) 말풍선과 겹치지 않게 한다. 다 와 갈 때 「넌 뭐야?」가 나온다
 if(TALK.cur&&TALK.cur.text===LINES.interrupt){TALK.q.length=0;TALK.cur.b.until=Math.min(TALK.cur.b.until,G.time+.04);}else clearTalk();
 $('#crumpleHint').classList.add('off');
 // 설교하던 차림으로 돈다발을 쥔 채 옥좌에 앉는다.
 if(E){E.endAct();combatInit(E,true);}
 WALK.p0.copy(CAM.pos);WALK.l0.copy(CAM.look);WALK.f0=CAM.fov||CAM.fovBase;walkGoal();
 SUBMISSION.part(WALK.p1.z,WALK.f1);
 WALK.on=true;WALK.t=0;WALK.step=0;WALK.met=false;CAM.frame='walk';
}
// 카메라: 걸어가는 동안은 옥좌 쪽으로 곧장(좌우로 돌지 않는다). 풀이 화면 밑에 깔려 있을 때는 종이가 줄어드는 만큼 뒤로 물러선다
function walkProgress(k){
  // A short acceleration and braking step, with an even pace through the crowd.
  k=sat(k);const ramp=.12;
  if(k<ramp)return k*k/(2*ramp*(1-ramp));
  if(k>1-ramp)return 1-(1-k)*(1-k)/(2*ramp*(1-ramp));
  return (k-ramp/2)/(1-ramp);
}
function introCamera(dt){
 if(WALK.on){
  WALK.t+=dt;const k=clamp(WALK.t/WALK.dur,0,1),e=walkProgress(k);
  CAM.pos.lerpVectors(WALK.p0,WALK.p1,e);CAM.look.lerpVectors(WALK.l0,WALK.l1,e);CAM.fovBase=lerp(WALK.f0,WALK.f1,e);
  const n=Math.floor((WALK.t+.12)/.49);if(n>WALK.step&&k<.96){WALK.step=n;AUDIO.footstep(.55+.45*Math.sin(PI*k));}
  if(!WALK.met&&k>=.96){WALK.met=true;walkMeet();}
  if(k>=1){WALK.on=false;walkArrive();}
  return true;
 }
 if(G.mode==='submit'&&INTRO.stage==='behind'){
  frameCamera('congregation',CAM.goalPos,CAM.goalLook);
  const e=smooth(INTRO.pull);CAM.goalPos.z-=.35*(1-e);CAM.goalPos.y+=.03*(1-e);
  CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);
  return true;
 }
 return false;
}
// 옥좌 앞에 거의 다 왔을 때: 천지신명이 알아본다(대사·주먹 올리기·도구칸은 지금 시작과 똑같다)
function walkMeet(){
 $('#fight').classList.remove('accepting-fate');$('#fight .gauge').style.visibility='';
 canvas.setAttribute('aria-label',FIGHT_LABEL);
 VM.reset();VM.root.visible=true;VM.setTool(G.tool);
 startEncounter();
}
function walkArrive(){
 G.walking=false;CAM.frame='stand';INTRO.stage='off';
 // 도착한 구도에는 아무도 보이지 않는다(비켜선 사람들은 화면 밖). 무리와 들고 있던 손을 치운다
 // 다 와 갈 때 시작한 천지신명의 「넌 뭐야?」는 남긴다(전에는 여기서 말풍선과 목소리가 같이 지워졌다)
 SUBMISSION.reset();CROWD.reset(TALK.cur&&TALK.cur.b);
 focusCanvas();
}
// 꾹 누르기: 손가락·마우스는 종이(화면 어디든), 키보드는 스페이스·엔터
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 if(CRUMPLE.pointer!=null||!crumpleReady())return;
 if(crumplePress()){CRUMPLE.pointer=e.pointerId;try{canvas.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();}
});
for(const k of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(k,e=>{if(CRUMPLE.pointer===e.pointerId)crumpleRelease();});
addEventListener('keydown',e=>{
 if((e.key!==' '&&e.key!=='Enter')||e.repeat||CRUMPLE.pointer!=null)return;
 if(e.target&&e.target.closest&&e.target.closest('button,a,input,select'))return;
 if(crumplePress()){CRUMPLE.pointer='key';e.preventDefault();}
});
addEventListener('keyup',e=>{if((e.key===' '||e.key==='Enter')&&CRUMPLE.pointer==='key')crumpleRelease();});
/* 나만 좋게 고친 운세를 친다: 친 자리를 지나 위아래로 찢어져 두 쪽이 양옆으로 날아가고, 그 뒤에 깔려 있던
 * '다음 사람의 운명'(불리한 배정 유지)가 드러나고 장면이 닫힌다 */
function tearOffer(e){
 const paper=$('#offerPaper'),stack=paper.parentNode,r=paper.getBoundingClientRect();
 const cx=e&&e.clientX>0&&r.width?(e.clientX-r.left)/r.width:.5,x0=clamp(cx,.34,.66)*100,pts=[];
 for(let i=0;i<=12;i++)pts.push([clamp(x0+rnd(-5,5)+(i%2?2.5:-2.5),8,92),i/12*100]);
 const line=pts.map(p=>p[0].toFixed(1)+'% '+p[1].toFixed(1)+'%').join(',');
 for(const [cp,cls] of [['polygon(0% 0%,'+line+',0% 100%)','l'],['polygon(100% 0%,'+line+',100% 100%)','r']]){
  const h=paper.cloneNode(true);h.removeAttribute('id');h.className='fate-paper half '+cls;h.setAttribute('aria-hidden','true');h.tabIndex=-1;h.style.clipPath=cp;h.style.webkitClipPath=cp;stack.appendChild(h);}
 paper.style.visibility='hidden';
 for(let i=0;i<9;i++){const s=document.createElement('i');s.className='scrap';s.style.cssText=`left:${(x0+rnd(-3,3)).toFixed(1)}%;top:${rnd(4,94).toFixed(1)}%;--dx:${rnd(-130,130)|0}px;--dy:${rnd(40,240)|0}px;--rr:${rnd(-300,300)|0}deg`;stack.appendChild(s);}
}
function resetOfferScene(){
 const sc=$('#offerScene');sc.hidden=true;sc.className='story-scene';
 sc.querySelectorAll('.fate-paper.half,.scrap').forEach(n=>n.remove());$('#offerPaper').style.visibility='';
}
$('#offerPaper').addEventListener('click',e=>{
 if(!G.offerOpen||G.offerBreaking)return;
 G.offerBreaking=true;G.hits++;G.offerBreakAt=G.time+1.5;
 tearOffer(e);$('#offerScene').classList.add('breaking');
 AUDIO.unlock();AUDIO.paper(1.1);AUDIO.hit('hand','hook','chest',1.1,false);flash(.16);camHit({shake:.02});
 if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([18,10,26]);}catch(_){}
});
/* ===== 9. 천지신명 정육공장: 따로 뺀 fight-free.js에 이 파일의 내부 도구를 넘겨 연결한다 =====
 * 모드의 내용은 전부 fight-free.js에 있다. 그 파일이 없으면 본편은 그대로 돌고 「천지신명 정육공장」 버튼만 숨긴다. */
const FREE_MOD=window.FateFree?window.FateFree.create({THREE,scene,camera,G,CAM,VM,AUDIO,BLOOD,CHUNKS,PROGRESS,PREF,OUTFITS,HINTS,GEO,HEADGEO,COMBAT_STAGE,Emperor,Spring,P,STAND,poseCopy,poseLerp,combatInit,combatActive,combatVoiceReset,wireEmperor,metalEnv,mk,grp,STD,col,cylGeo,sphereGeo,mergeMeshes,mirrorX,canvasTex,V3,rnd,clamp,lerp,smooth,damp,easeIn,backOut,PI,TAU,UP,$,hint,flash,camHit,clearPointers,clearCombatAccent,clearTalk,focusCanvas,deityHasReptileVoice,MOBILE_GPU,lite:()=>lite}):null;
const FREE=FREE_MOD?FREE_MOD.FREE:{begin(){},suspend(){},stage(){},update(){},flinch(){},shoveContact(){return false;},waistSlash(){},overflow(){return false;},camera(){return false;},state:{total:0}};
const freeHangPose=FREE_MOD?FREE_MOD.hangPose:()=>{},freeWalkPose=FREE_MOD?FREE_MOD.walkPose:()=>{},FREE_FLOOR=FREE_MOD?FREE_MOD.FREE_FLOOR:8,FREE_DMG=FREE_MOD?FREE_MOD.FREE_DMG:.5;
if(!FREE_MOD)$('#freeBtn').hidden=true;
/* ---- 라운드 ---- */
function startRound(mode){
 const free=mode==='free'&&!!FREE_MOD;if(mode==='free')mode='fight';
 TROPHIES.close(false);FACTORY_PHOTO.close(false);
 G.round++;
 SUBMISSION.reset();
 AUDIO.stop();
 clearPointers();
 clearTalk();quipReset();combatVoiceReset();
 // 피 자국의 동적 geometry를 먼저 정리해 Emperor.destroy()와 같은 자원을 두 번 dispose하지 않는다.
 BLOOD.reset(null);
 if(G.E)G.E.destroy();
 for(const old of G.retired)if(old&&old!==G.E)old.destroy();
 G.retired=[];
 if(free)FREE.begin();else FREE.suspend();
 G.E=new Emperor(G.result,PROGRESS.defeated+(free?FREE.state.total:0));
 const E=G.E;E.holdRegrow=E.keepBits=free;
 wireEmperor(E);
 BLOOD.reset(E);VM.reset();if(lite<2){metalEnv(E.root);metalEnv(E.crown);}
Object.assign(G,{mode,free,walking:false,defeatCountVisible:PROGRESS.defeated>0&&!free,bar:100,shown:100,shownHold:0,lag:100,lastHit:-99,kd:0,active:0,started:false,musicStarted:false,hits:0,t0:G.time,hitstop:0,slow:0,ended:false,paused:false,inputLocked:false,beyondAt:0,omenAt:0,prepAt:0,laughAt:0,againAt:0,offerAt:0,offerPending:false,offerOpen:false,offerBreaking:false,offerBreakAt:0,crowdEntered:false,crowdWarned:false,crowdBeatUntil:0,crowdSwapAt:0,crowdSwapLines:null,crowdHideAt:0,revivalUsed:false,revivalPending:false,revival:null,revived:false,brittle:false,shellHideAt:0,retorting:false});
 STAFF.reset();setCombatStage(true);$('#fight').classList.toggle('accepting-fate',mode==='submit');$('#fight').classList.toggle('free-mode',free);if(mode==='fight'){combatInit(E,!free);if(free){E.combat.z=1.0;FREE.stage(true);}}else combatLook(E);
 crumpleReset();$('#crumpleHint').classList.add('off');INTRO.hintAt=0;
 FX.clear();COINS.clear();CHUNKS.clear();
 CROWD.reset();
 CAM.shake=0;CAM.jit.set(0,0,0);gunLT=0;
 clearTimeout(gaugeHitT);const gauge=$('#fight .gauge');if(gauge._hitAnim)gauge._hitAnim.cancel();gauge.classList.remove('hit');$('#gaugeFill').classList.remove('flash');$('#flash').style.opacity=0;
setFightModal($('#settingsModal'),false);
hideAgain();
 resetOfferScene();BEYOND.reset();COMBAT.storyAnchor=null;CROWD.root.position.set(0,0,0);
 $('#fight .gauge').style.visibility='';$('#flash').style.background='#fff';
 $('#dock').hidden=mode!=='fight';$('#fight .gauge').style.visibility=mode==='submit'?'hidden':'';
 setTool('hand');updateGauge();updateAmmo();updateDefeatCount();syncPrefs();VM.root.visible=mode==='fight';
 fitView();setFrame('stand',true);


G.opening=mode==='fight';
if(mode==='fight'){
 INTRO.stage='off';$('#fight').classList.remove('behind');
 canvas.setAttribute('aria-label',FIGHT_LABEL);
 startEncounter();
}else{
 // 순응 장면. 풀이 화면 밑에 깔려 있는 중이면(behind) 손과 종이는 풀이 화면이 줄어들기 시작할 때 보인다
 $('#hint').classList.add('off');
 E.idleT=1e6;G.inputLocked=true;
 const behind=INTRO.stage==='behind';if(!behind)INTRO.stage='arrived';
 SUBMISSION.begin(G.result,behind);setFrame('congregation',true);
 canvas.setAttribute('aria-label','운세 종이를 두 손에 들고 추종자들 사이에서 천지신명의 설교를 듣고 있습니다.');
 if(!behind)SUBMISSION.sermonSoon(0);
}

 last=performance.now();
}

/* ---- 루프 ---- */
let last=performance.now(),perfT=0,perfN=0,lite=0;
function allMats(fn){for(const sc of [scene,vmScene])sc.traverse(o=>{if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))fn(m);});}
function step(dt){
 if(G.paused)return;G.time+=dt;
 updateStory();updateQuip();
 CROWD.update(dt,G.time);
 pollPointers();
 const E=G.E;
 // 멈춤(히트스톱)·느린 화면
 let sim=dt;if(G.hitstop>0){const u=Math.min(dt,G.hitstop);G.hitstop-=u;sim=dt-u;}
 if(G.slow>0){G.slow-=dt;sim*=.45;}
 if(E&&!(G.free&&FREE.viewing)){
  E._rdt=dt;E.update(sim,G.time);
  STAFF.update(sim,G.mode==='fight'&&(E.state==='fall'||E.state==='down'));
 }
 // 순응 장면: 종이 구기기 → 떨어뜨리기 → 앞사람들 비켜서기(걸어가는 동안에도 계속 움직인다)
 updateCrumple(dt);SUBMISSION.update(dt);SUBMISSION.updatePart();
 BLOOD.update(sim);COINS.update(sim);CHUNKS.update(sim);VM.update(sim,G.hitstop>0,dt);
combatEffects(sim);
if(G.free)FREE.update(sim);
FX.update(dt);
updateTalk(dt);updateEncounter();BUB.step();
AUDIO.updateMusic(G.mode==='fight'&&!!G.musicStarted&&!G.ended&&!document.hidden,!!G.inputLocked||talkBusy());
BEYOND.update(dt);
updateCamera(dt);SBLOOD.update(dt);updateLag(dt);
 // 총구 불빛: 카메라가 멀리 있어도 설계자를 예전만큼 밝히게 설계자 쪽으로 2.6m 앞까지 당겨 둔다
 gunL.intensity=!G.free&&gunLT>0?1.5:0;
 _cf.subVectors(CAM.look,camera.position);{const dl=_cf.length()||1;_cf.multiplyScalar(Math.max(0,dl-2.6)/dl);}
 gunL.position.set(camera.position.x+.15+_cf.x,camera.position.y-.1+_cf.y,camera.position.z-.3+_cf.z);
 if(G.time>hintUntil)$('#hint').classList.add('off');
}
function render(dt=0){
 renderer.clear();
 // 뒤에 있던 것: 하늘과 그것을 먼저 그리고, 궁전은 하늘 없이 그 위에 그린다
 const far=BEYOND.active;
 if(far){BEYOND.draw();renderer.clearDepth();scene.background=null;}
 renderer.render(scene,camera);
 if(far)scene.background=G.mode==='fight'?col('#151d1e'):SKY;
 renderer.clearDepth();
 if(COMBAT_STAGE.boot.visible){vmCam.layers.set(1);renderer.render(vmScene,vmCam);renderer.clearDepth();}
 vmCam.layers.set(0);renderer.render(vmScene,vmCam);
 renderer.clearDepth();renderer.render(FX.scene,camera);BUB.draw();
 VM.afterRender(dt);gunLT=Math.max(0,gunLT-dt);
}
function frame(now){
 if(!G.running)return;G.raf=requestAnimationFrame(frame);
 const raw=(now-last)/1000;last=now;const dt=clamp(raw,0,.05);
 // 첫 전환 프레임에서만 정지한 장면을 그린다. 종이가 줄어들기 시작하면 매 프레임 갱신한다.
 if(INTRO.stage==='behind'&&INTRO.pull===0){
  if(!INTRO.previewDirty)return;
  INTRO.previewDirty=false;
 }else INTRO.previewDirty=true;
 // 느린 기기: 1단계 해상도·그림자 낮춤, 2단계 금속 반사 끔
 if(raw<.25){perfT+=raw;perfN++;}if(perfT>2.5){if(perfT/perfN>.045&&lite<2){lite++;if(lite===1){renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;allMats(m=>m.needsUpdate=true);fitView();}else{allMats(m=>{if(m.envMap){m.envMap=null;m.needsUpdate=true;}});}}perfT=0;perfN=0;}
 step(dt);
 render(dt);
}
function pause(){G.running=false;cancelAnimationFrame(G.raf);clearPointers();AUDIO.stop();}
function enter(result,mode='fight'){
 G.result=result;INTRO.stage='off';$('#fight').classList.remove('behind');$('#fight').hidden=false;$('#fallback').hidden=true;BUB.preload();
 try{speechSynthesis.cancel();}catch(_){}
 AUDIO.unlock();fitView();startRound(mode==='submit'?'submit':mode==='free'?'free':'fight');
 const face=$('#arcadeFace');if(face){face.target='_blank';face.rel='noopener';}
 if(!G.running){G.running=true;last=performance.now();G.raf=requestAnimationFrame(frame);}
}
/* ---- 풀이 화면 끝에서 이어지는 입구(index.html이 부른다) ----
 * prepare: 순응 장면을 미리 만들어 둔다(아직 안 보임) · peek: 풀이 화면 밑에 깔고 그리기 시작/멈춤
 * pull: 풀이 화면이 종이로 줄어든 정도(0~1) · paperRect: 손에 든 종이의 화면 자리(px) · arrive: 다 줄어들어 이 장면이 됨 */
function prepare(result){
 G.result=result;$('#fallback').hidden=true;BUB.preload();
 INTRO.stage='behind';INTRO.pull=0;$('#fight').classList.add('behind');
 fitView();startRound('submit');
 // 셰이더를 미리 만들어 둬서 처음 깔릴 때 끊기지 않게 한다
 try{renderer.compile(scene,camera);renderer.compile(vmScene,vmCam);}catch(_){}
}
function peek(on){
 const f=$('#fight');
 if(on){
  if(INTRO.stage!=='behind')return false;
  f.hidden=false;f.classList.add('behind');
  if(!G.running){fitView();G.running=true;last=performance.now();G.raf=requestAnimationFrame(frame);}
  return true;
 }
 if(INTRO.stage==='behind'){pause();f.hidden=true;}
 return false;
}
// paper: 손에 든 3D 종이를 꺼낼지(풀이 화면이 그 자리를 다 덮은 뒤에만 꺼낸다. 그전에는 손만 보인다)
function pull(p,paper){
 if(INTRO.stage!=='behind')return;
 INTRO.pull=clamp(p,0,1);SUBMISSION.hands.visible=INTRO.pull>.001;SUBMISSION.showPaper(!!paper);
}
function arrive(){
 if(INTRO.stage!=='behind')return false;
 INTRO.stage='arrived';INTRO.pull=1;
 const f=$('#fight');f.hidden=false;f.classList.remove('behind');
 SUBMISSION.hands.visible=true;SUBMISSION.showPaper(true);setFrame('congregation',true);
 try{speechSynthesis.cancel();}catch(_){}
 AUDIO.unlock();SUBMISSION.sermonSoon(0);
 const face=$('#arcadeFace');if(face){face.target='_blank';face.rel='noopener';}
 if(!G.running){G.running=true;last=performance.now();G.raf=requestAnimationFrame(frame);}
 focusCanvas();return true;
}
function leave(home){
 TROPHIES.close(false);FACTORY_PHOTO.close(false);
 pause();
 INTRO.stage='off';crumpleReset();$('#fight').classList.remove('behind');$('#crumpleHint').classList.add('off');
 SUBMISSION.reset();CROWD.reset();FREE.suspend();
 clearTalk();hideAgain();G.retorting=false;setFightModal($('#settingsModal'),false);$('#fight').hidden=true;
 const face=$('#arcadeFace');if(face){face.target='_top';face.removeAttribute('rel');}
 if(home&&window.__paljaRestart)window.__paljaRestart();else if(window.__paljaLeave)window.__paljaLeave();
}
let rsT=0;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{if(!$('#fight').hidden){fitView();VM.computeRest();}},40);});
addEventListener('blur',clearPointers);


/* Factory photo: use the displayed overview, with no HUD, hands or new camera framing. */
function captureFactoryPhoto(){
 const size=renderer.getSize(new THREE.Vector2()),scale=Math.min(1.6,1800/Math.max(size.x,size.y));
 const w=Math.max(1,Math.round(size.x*scale)),h=Math.max(1,Math.round(size.y*scale));
 const target=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true,stencilBuffer:false});target.texture.encoding=THREE.sRGBEncoding;
 const saved={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),test:renderer.getScissorTest(),auto:renderer.autoClear,xr:renderer.xr.enabled};
 const pixels=new Uint8Array(w*h*4);
 try{
  renderer.xr.enabled=false;renderer.setRenderTarget(target);renderer.setViewport(0,0,w,h);renderer.setScissorTest(false);renderer.autoClear=true;
  renderer.clear();renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,w,h,pixels);
 }finally{
  renderer.setRenderTarget(saved.target);renderer.setViewport(saved.viewport);renderer.setScissor(saved.scissor);renderer.setScissorTest(saved.test);renderer.autoClear=saved.auto;renderer.xr.enabled=saved.xr;target.dispose();
 }
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const context=canvas.getContext('2d'),data=context.createImageData(w,h),stride=w*4;
 for(let y=0;y<h;y++)data.data.set(pixels.subarray((h-1-y)*stride,(h-y)*stride),y*stride);
 context.putImageData(data,0,0);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed')),'image/png'));
}
const FACTORY_PHOTO=(()=>{
 const modal=$('#factoryPhotoModal'),img=$('#factoryPhotoImage'),save=$('#factoryPhotoSave'),status=$('#factoryPhotoStatus');
 let open=false,serial=0,url='',wasPaused=false,returnFocus=null;
 function release(){if(url)URL.revokeObjectURL(url);url='';img.removeAttribute('src');save.removeAttribute('href');}
 function close(focus=true){
  if(!open)return;open=false;serial++;release();setFightModal(modal,false);G.paused=wasPaused;AUDIO.hold(wasPaused);last=performance.now();
  if(focus&&returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});
 }
 async function show(){
  if(open||!G.free||!FREE.viewing||FREE.busy||G.paused)return;
  open=true;const ticket=++serial;wasPaused=G.paused;returnFocus=document.activeElement;G.paused=true;clearPointers();AUDIO.hold(true);
  release();img.hidden=save.hidden=true;status.textContent='사진 만드는 중…';setFightModal(modal,true);$('#factoryPhotoClose').focus({preventScroll:true});
  try{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   if(!open||ticket!==serial)return;
   const blob=await captureFactoryPhoto();if(!open||ticket!==serial)return;
   url=URL.createObjectURL(blob);img.src=url;img.hidden=false;save.href=url;save.download='천지신명_정육공장_'+FREE.state.total+'놈.png';save.hidden=false;status.textContent='';
  }catch(error){if(open&&ticket===serial)status.textContent='사진을 만들지 못했어요. 닫았다가 다시 눌러 주세요.';console.warn('Factory photo failed',error);}
 }
 $('#freePhoto').addEventListener('click',show);$('#factoryPhotoClose').addEventListener('click',()=>close());
 modal.addEventListener('click',e=>{if(e.target===modal)close();});
 modal.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
  if(e.key==='Tab'){const controls=[...modal.querySelectorAll('button:not(:disabled),a[href]')].filter(e=>e.getClientRects().length);const first=controls[0],end=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}}
 });
 return {close};
})();
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPointers();crumpleRelease();AUDIO.stop(true);}else{last=performance.now();if(G.running){fitView();if(BEYOND.active){AUDIO.unlock();setTimeout(()=>{if(BEYOND.active&&!document.hidden)AUDIO.beyond();},250);}}}});

warmCombatAssets();
window.PaljaGame={enter,leave,pause,prepare,peek,pull,arrive,paperRect(){return SUBMISSION.rect();},unlock(primed){AUDIO.unlock(primed);},get stage(){return INTRO.stage;},fonts(){BUB.preload();},
 tick(dt=1/60,draw=true){step(dt);if(draw)render(dt);},
 pick:pickAt,setTool,
 hitAt(x,y,kind){if(G.tool==='gun')return VM.fire(x,y);if(G.tool==='hand')return combatAttack(x,y,kind||'jab');return VM.attack(kind||'stab',x,y);},
 slash(points){VM.slashStart(points[0][0],points[0][1]);const p={lastCut:null};for(const [x,y] of points){VM.slashMove(x,y);slashContact(p,x,y);}finishLimb(p);finishEar(p);finishBody(p);VM.slashEnd();},
 screenPart(name){const E=G.E;if(!E)return null;const m=E.parts.find(o=>o.userData.part===name&&o.visible);if(!m)return null;const p=m.getWorldPosition(V3()).project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};},
 project(v){const p=v.clone().project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};},
 get state(){return {G,E:G.E,camera,scene,renderer,CAM,VM,BLOOD,COMBAT,COMBAT_STAGE,BEYOND,INTRO,CRUMPLE,WALK,FREE};},
 debug:{audio:AUDIO,crowd:CROWD,combatHit:o=>G.E.combat.hit(o),grab:()=>G.E.combat.beginGrab(),drag:(x,y)=>G.E.combat.drag(x,y),release:()=>G.E.combat.release(),round(m){startRound(m||"fight");},
  cam(p,l,fov){CAM.frame='debug';CAM.goalPos.set(p[0],p[1],p[2]);CAM.goalLook.set(l[0],l[1],l[2]);CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);if(fov){CAM.fovBase=fov;CAM.fov=fov;}},
  trophyPortrait:(spec)=>trophyPortrait(spec),trophyCard:(n,p)=>TROPHIES.draw(n,p),standCam(){setFrame('stand',true);},beyond(){BEYOND.begin();},fall(type){const E=G.E;if(!E)return;const i=KD_TYPE.indexOf(type);G.kd=i;G.bar=G.shown=G.lag=KD_AT[i];E.taunt=false;E.setPhase(Math.min(4,i+1));knockdown();},frame:setFrame}};
}
})();







