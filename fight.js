/* 사주도사 · 족치기 화면 (fight.js)
 * index.html이 three.min.js(r128) 다음에 불러 쓴다. 이 파일 하나에 족치기 화면의 모양(CSS)·틀(HTML)·게임 코드가 다 들어 있다.
 * 쓰는 법: window.PaljaBoot() → window.PaljaGame.enter(사주 결과, 'fight' 또는 'submit')
 * 'submit'은 운명에 순응하기(운명 설계자가 비웃는 화면), 'fight'는 운명 설계자 족치기.
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
 *  6. 운명 설계자(모양·얼굴 표정·자세·맞는 반응·팔다리 자르기·도마뱀 팔다리·다운·후광·정체)
 *  7. 내 손과 무기(개운 너클·살풀이 식칼·액막이 권총)
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
/* 무기 고르기: 부적/화투 카드를 부채처럼 펼친다(나 기르기식 격자 버튼과 완전히 다른 짜임) */
#fight .panel.tools{background:none;border:0;box-shadow:none;padding:0}
#fight .tools{display:flex;justify-content:center;align-items:flex-end;padding:0 0 4px}
#fight .tool{position:relative;width:75px;height:97px;margin:0 -7px;border:0;padding:0;background:none;color:var(--ink);
 transform:rotate(var(--fan,0deg)) translateY(var(--lift,8px));transform-origin:50% 132%;
 transition:transform .17s cubic-bezier(.3,1.5,.5,1);filter:drop-shadow(0 4px 6px rgba(30,20,50,.3))}
#fight .tool:nth-child(1){--fan:-13deg;z-index:1}
#fight .tool:nth-child(2){--fan:-4.4deg;z-index:2}
#fight .tool:nth-child(3){--fan:4.4deg;z-index:3}
#fight .tool:nth-child(4){--fan:13deg;z-index:4}
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

#fight .talk{
 position:absolute;left:50%;z-index:9;
 width:max-content;max-width:min(86vw,390px);
 padding:9px 13px 10px;
 border:2px solid var(--ink);border-radius:15px;
 background:rgba(255,253,246,.97);
 box-shadow:0 4px 0 var(--ink),0 8px 22px rgba(25,18,45,.18);
 pointer-events:none;opacity:0;
 transition:opacity .12s,transform .12s;
 word-break:keep-all
}
#fight .talk.boss{
 top:calc(70px + var(--safe-t));
 transform:translate(-50%,-7px)
}
#fight .talk.player{
 bottom:calc(126px + var(--safe-b));
 transform:translate(-50%,7px);
 background:rgba(36,28,58,.94);color:#fff;
 border-color:#fff;
 box-shadow:0 4px 0 #fff,0 8px 22px rgba(25,18,45,.24)
}
#fight .talk.on{opacity:1;transform:translate(-50%,0)}
#fight .talk b{
 display:block;margin-bottom:2px;
 font-size:10px;line-height:1.2;
 color:var(--red);letter-spacing:.04em
}
#fight .talk.player b{color:#ffd84a}
#fight .talk span{
 display:block;font-size:15px;
 font-weight:800;line-height:1.42
}

#fight #submitDock{width:min(100%,420px)}
#fight .submit-result{
 background:rgba(255,253,246,.98);
 border:2.5px solid var(--ink);border-radius:19px;
 box-shadow:0 5px 0 var(--ink),0 12px 28px rgba(25,18,45,.25);
 padding:14px;text-align:center
}
#fight .submit-result small{
 display:block;font-size:11px;font-weight:800;
 color:var(--red);letter-spacing:.08em
}
#fight .submit-result strong{
 display:block;margin:3px 0 5px;
 font-family:var(--serif);font-size:25px
}
#fight .submit-result p{
 margin:0 0 10px;font-size:13px;
 line-height:1.55;color:#595164
}
#fight .submit-result .submit-meta{
 margin-bottom:10px;
 font-size:12px;font-weight:800;color:var(--muted)
}
#fight .submit-result .btns{
 display:flex;flex-direction:column;gap:8px
}

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
#fight #offerScene.breaking .other-fate{animation:otherRise .65s .08s ease-out forwards}
@keyframes paperBreak{35%{transform:rotate(2deg) scale(1.05);filter:brightness(1.5)}100%{transform:rotate(-13deg) scale(.2);opacity:0;clip-path:polygon(0 0,47% 8%,54% 0,100% 0,92% 46%,100% 58%,100% 100%,57% 91%,47% 100%,0 100%,9% 55%,0 44%)}}
@keyframes otherRise{to{transform:rotate(0) translateY(-102px);opacity:.95}}

/* 머리 위 말풍선: 무대 안 사람에게 붙어 다닌다 */
#fight #bubbles{position:absolute;inset:0;z-index:9;pointer-events:none;overflow:hidden}
#fight .bub{position:absolute;left:0;top:0;width:max-content;max-width:min(64vw,300px);padding:7px 11px 8px;border:2px solid var(--ink);border-radius:13px;background:rgba(255,253,246,.97);box-shadow:0 3px 0 var(--ink),0 6px 16px rgba(25,18,45,.16);font-size:clamp(12px,3.3vw,14.5px);font-weight:800;line-height:1.38;word-break:keep-all;opacity:0;transition:opacity .12s;will-change:transform}
#fight .bub::after{content:"";position:absolute;left:50%;bottom:-8px;width:11px;height:11px;background:rgba(255,253,246,.97);border:2px solid var(--ink);border-top:0;border-left:0;transform:translateX(-50%) rotate(45deg)}
#fight .bub span{display:block;transform:scale(.72);transition:transform .16s cubic-bezier(.2,1.5,.45,1)}
#fight .bub.on{opacity:1}#fight .bub.on span{transform:scale(1)}

/* 보스가 죽어도 계속 운명을 찍는 발급기. 이것까지 부숴야 끝난다. */
#fight #printerScene{z-index:12;display:flex;align-items:flex-end;justify-content:center;padding:80px 18px calc(94px + var(--safe-b));background:linear-gradient(rgba(23,17,35,.05),rgba(23,17,35,.68))}
#fight .printer-wrap{position:relative;width:min(86vw,370px);text-align:center}
#fight .printer-note{display:inline-block;margin-bottom:8px;padding:6px 12px;border-radius:99px;background:#241c3a;color:#fff;font-size:12px;font-weight:800}
#fight .fate-printer{position:relative;width:100%;min-height:190px;border:3px solid #241c3a;border-radius:19px;background:linear-gradient(#d6d0c5,#9c968d);box-shadow:0 7px 0 #241c3a,0 20px 34px rgba(0,0,0,.35);padding:24px 20px 17px;color:#241c3a;pointer-events:auto}
#fight .fate-printer:active{transform:translateY(3px);box-shadow:0 4px 0 #241c3a,0 12px 24px rgba(0,0,0,.32)}
#fight .printer-slot{height:22px;margin:0 auto 15px;border:3px solid #241c3a;border-radius:4px;background:#17121e;box-shadow:inset 0 0 8px #000}
#fight .issued-paper{margin:-4px auto 13px;width:88%;padding:10px 11px;border:1.5px solid #8e826c;background:#fff8db;font-family:var(--serif);font-size:12px;line-height:1.55;text-align:left;box-shadow:0 3px 0 rgba(36,28,58,.25);animation:printPaper 1.1s steps(5,end) infinite}
#fight .issued-paper b{display:inline-block;min-width:45%;color:#941e18}
@keyframes printPaper{from{transform:translateY(-12px)}to{transform:translateY(2px)}}
#fight .printer-core{font-size:20px;font-weight:900;letter-spacing:.08em}
#fight #printerScene.hit1 .fate-printer{transform:rotate(-1deg)}#fight #printerScene.hit2 .fate-printer{transform:rotate(1.5deg);filter:contrast(1.2)}
#fight #printerScene.destroyed .fate-printer{animation:printerDie .65s ease-in forwards}
@keyframes printerDie{35%{transform:scale(1.05) rotate(-2deg);filter:brightness(2)}100%{transform:translateY(80px) rotate(9deg) scale(.5);opacity:0}}
#fight .printer-stamp{margin-top:12px;font-family:var(--serif);font-size:17px;font-weight:900;color:#b51f18;opacity:0;transform:scale(1.7) rotate(-5deg)}
#fight #printerScene.destroyed .printer-stamp{animation:stampIn .3s .35s ease-out forwards}
@keyframes stampIn{to{opacity:1;transform:scale(1) rotate(-5deg)}}

/* 순응: 내 불행을 받은 것과 타인의 불행에 도장을 찍는 것을 분리한다. */
#fight .submit-workflow{background:rgba(255,253,246,.98);border:2.5px solid var(--ink);border-radius:19px;box-shadow:0 5px 0 var(--ink),0 12px 28px rgba(25,18,45,.25);padding:14px;text-align:center}
#fight .fate-receipt{padding:10px;border:1.5px solid #b7aa8c;background:#eee9dc;color:#6c6558;font-family:var(--serif);font-weight:700;transform:rotate(-1deg)}
#fight .fate-receipt b{float:right;color:#8a7d68;font-size:11px;border:1px solid currentColor;padding:2px 5px;transform:rotate(4deg)}
#fight .next-fate{position:relative;margin:12px 0 10px;padding:17px 14px;border:2px solid #4f4637;background:#fff6d6;font-family:var(--serif);text-align:left;box-shadow:0 3px 0 #4f4637}
#fight .next-fate small{display:block;color:#8b1d18;font-weight:800;letter-spacing:.1em}#fight .next-fate strong{display:block;margin:5px 0;font-size:20px}#fight .next-fate p{margin:0;font-size:12px;line-height:1.55;color:#5d5548}
#fight .seal-actions{display:grid;grid-template-columns:1.35fr 1fr;gap:8px}
#fight .seal-btn{min-height:58px;border:2.5px solid #7c1714;border-radius:13px;background:#c52b21;color:#fff;font-size:15px;font-weight:900;box-shadow:0 4px 0 #65100e}
#fight .seal-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #65100e}
#fight .seal-btn::before{content:"印";display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-right:7px;border:2px solid currentColor;border-radius:50%;font-family:var(--serif)}
#fight .break-seal{min-height:58px;border:2px solid #241c3a;border-radius:13px;background:#fff;font-size:14px;font-weight:900;box-shadow:0 4px 0 #241c3a}
#fight .submit-workflow.stamped .next-fate{animation:stampPaper .5s ease-out both}
@keyframes stampPaper{40%{filter:brightness(1.7);transform:scale(1.04)}100%{transform:scale(.96);filter:sepia(.35)}}
#fight .submit-result .alias{margin:5px 0 10px;font-size:11px;color:var(--muted)}
#fight #endKicker{display:block;margin-bottom:5px;color:var(--red);font-size:11px;font-weight:900;letter-spacing:.16em}
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
 #fight #printerScene{align-items:center;padding:48px 14px 8px}
 #fight #printerScene .printer-wrap{width:min(70vw,350px);transform:scale(.78)}
 #fight #submitDock{left:auto;right:10px;bottom:8px;transform:none;width:min(48vw,390px);max-height:calc(100vh - 68px);overflow:auto;padding:0 4px 6px}
 #fight #submitDock .submit-workflow,#fight #submitDock .submit-result{padding:10px}
}
@media (prefers-reduced-motion:reduce){#fight #ending .card{animation-duration:.01s}#fight .gauge.hit{animation:none}#fight .chorus{transition:none!important}#fight .chorus span,#fight .issued-paper,#fight .offer-command{animation:none!important}#fight .fate-paper,#fight .other-fate,#fight .revival-seal,#fight #goldShell,#fight .fate-printer,#fight .printer-stamp,#fight .submit-workflow.stamped .next-fate{animation-duration:.01s!important;animation-delay:0s!important}}
`;

const FIGHT_HTML = `<section id="fight" hidden>
 <canvas id="world" tabindex="-1" aria-label="운명 설계자가 서 있는 화면. 누르면 때리고, 밀면 휘두르거나 벱니다."></canvas>
 <canvas id="sblood"></canvas>
 <div id="flash"></div>
 <div id="fxtext" aria-hidden="true"></div>
 <div id="bubbles" aria-hidden="true"></div>
 <div id="talk" class="talk" aria-live="polite" aria-hidden="true">
 <b id="talkWho"></b>
 <span id="talkText"></span>
</div>
 <div id="offerScene" class="story-scene" hidden>
  <div class="offer-stack">
   <div class="other-fate"><b>다음 사람의 사주</b><span>불리한 배정 유지 · 이의 신청 불가</span></div>
   <button type="button" class="fate-paper" id="offerPaper" aria-label="나만 좋게 고친 사주를 찢는다">
    <small>運命 更正書 · 정정 사주</small><strong>당신만 특별히</strong>
    <ul><li>귀한 집안의 도움</li><li>윗자리 평생 보장</li><li>재물운 대길</li></ul>
    <em>단, 기존 질서에 이의를 제기하지 않을 것</em>
   </button>
   <span class="offer-command">이 종이를 쳐서 계속</span>
  </div>
 </div>
 <div id="printerScene" class="story-scene" hidden>
  <div class="printer-wrap">
   <div class="printer-note">설계자가 쓰러졌는데도 계속 찍혀 나온다.</div>
   <button type="button" class="fate-printer" id="fatePrinter" aria-label="운명 발급기를 세 번 쳐서 부순다" aria-describedby="issuedMap">
    <div class="printer-slot"></div>
    <div class="issued-paper" id="issuedMap"><b>물려받은 특혜</b> 집안복<br><b>저임금·착취</b> 재물운 부족<br><b>법률 비용의 격차</b> 송사를 피할 팔자<br><b>함께 바꾸려는 행동</b> 관재수</div>
    <div class="printer-core">운명 자동 발급 중</div>
   </button>
   <div class="printer-stamp">運命 發給 中斷 · 운명 발급 중단</div>
  </div>
 </div>
 <header class="ftop">
  <button class="pill" id="fightBack" type="button" aria-label="사주 풀이로 돌아가기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
  <div class="gauge" aria-hidden="true">
   <div class="grow"><span class="gname">운명 설계자</span><span class="kd" id="kdPips"><i></i><i></i><i></i></span><small id="gaugePct">100%</small></div>
   <div class="bar"><b id="gaugeLag"></b><i id="gaugeFill"></i><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>
  </div>
  <button class="pill" id="soundBtn" type="button" aria-label="소리 끄고 켜기" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16 8.5c2.2 2 2.2 5 0 7M18.8 5.5c4.2 3.6 4.2 9.4 0 13"/><path class="mute" d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg></button>
  <button class="pill" id="settingsBtn" type="button" aria-label="설정"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.6" fill="#fff"/><circle cx="15" cy="17" r="2.6" fill="#fff"/></svg></button>
 </header>
 <div class="dock" id="dock">
  <div class="hint off" id="hint"></div>
  <div class="panel tools" id="tools" role="group" aria-label="무기">
   <button class="tool on" type="button" data-tool="hand" aria-label="인간의 맨주먹"><span class="card" style="--c:#cf2f2a"><svg class="art" viewBox="0 0 48 48"><use href="#fi-fist"/></svg><span class="nm"><b>인간의</b>맨주먹</span></span></button>
   <button class="tool" type="button" data-tool="spear" aria-label="민중의 죽창"><span class="card" style="--c:#2f9a46"><svg class="art" viewBox="0 0 48 48"><use href="#fi-spear"/></svg><span class="nm"><b>민중의</b>죽창</span></span></button>
   <button class="tool" type="button" data-tool="knife" aria-label="살풀이 식칼"><span class="card" style="--c:#3a6ea8"><svg class="art" viewBox="0 0 48 48"><use href="#fi-knife"/></svg><span class="nm"><b>살풀이</b>식칼</span></span></button>
   <button class="tool" type="button" data-tool="gun" aria-label="액막이 권총"><span class="card" style="--c:#6a4cc0"><svg class="art" viewBox="0 0 48 48"><use href="#fi-gun"/></svg><span class="nm"><b>액막이</b>권총</span></span><span class="ammo" id="ammo" hidden>8</span></button>
  </div>
 </div>
 <div class="dock" id="submitDock" hidden>
  <div class="submit-workflow" id="submitWorkflow">
   <div class="fate-receipt">나의 운명 <b>수령 완료</b></div>
   <div class="next-fate"><small>다음 분 것도 확인해 주시죠.</small><strong>불리한 운명 배정서</strong><p>낮은 자리 · 부족한 재물운 · 말없이 견딜 팔자<br>이대로 확정하시겠습니까?</p></div>
   <div class="seal-actions"><button type="button" class="seal-btn" id="fateSeal">확인 도장 찍기</button><button type="button" class="break-seal" id="breakSeal">도장을 부순다</button></div>
  </div>
  <div class="submit-result" id="submitCertificate" hidden>
   <small>운명 배정 절차 완료</small>
   <strong>기존 질서 유지에 협조했습니다</strong>
   <p>내 몫을 받은 데서 멈추지 않고<br>다음 사람의 불리한 운명까지 확정했습니다.</p>
   <div class="submit-meta">처리 결과: 정상 · 보상: 없음</div>
   <div class="alias">공유용 별칭: 운명 이완용</div>
   <div class="btns"><button type="button" class="btn soft" id="submitShare">처리 내역 공유하기</button><button type="button" class="btn danger" id="submitFight">이제 와서 도장을 부순다</button></div>
  </div>
</div>
 <div class="modal" id="settingsModal" hidden>
  <div class="msheet" role="dialog" aria-modal="true" aria-labelledby="fSetTitle">
   <button class="pill close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
   <h2 id="fSetTitle">설정</h2>
   <div class="row">소리<button class="switch" id="swSound" type="button" role="switch" aria-checked="true" aria-label="소리"></button></div>
   <div class="row">진동<button class="switch" id="swVibe" type="button" role="switch" aria-checked="true" aria-label="진동"></button></div>
   <div class="row">화면 흔들림<button class="switch" id="swShake" type="button" role="switch" aria-checked="true" aria-label="화면 흔들림"></button></div>
   <div class="row"><div>피<small>끄면 피 대신 먼지가 납니다.</small></div><button class="switch" id="swBlood" type="button" role="switch" aria-checked="true" aria-label="피"></button></div>
   <div class="row"><div>살 변형<small>맞은 자리가 파이고 뜯깁니다. 느린 기기는 끄세요.</small></div><button class="switch" id="swDeform" type="button" role="switch" aria-checked="true" aria-label="살 변형"></button></div>
   <button class="btn soft" id="resetFight" type="button" style="margin-top:16px">처음부터 다시</button>
  </div>
 </div>
 <div id="ending" hidden>
  <div class="card" role="dialog" aria-modal="true" aria-labelledby="endTitle">
   <small id="endKicker">운명 발급 중단</small>
   <h2 id="endTitle">운명 설계자의 운명을 설계했습니다</h2>
<p>운명은 좁밥이었습니다.</p>
   <div class="stats"><div><b id="stTime">0:00</b>걸린 시간</div><div><b id="stHits">0</b>때린 횟수</div><div><b id="stBlood">0.0L</b>흘린 피</div></div>
   <div class="btns"><button type="button" class="btn danger" id="endAgain">처음부터 다시</button><div class="pair"><button type="button" class="btn soft" id="endHome">사주 풀이로</button><button type="button" class="btn soft" id="endMore">계속 패기</button></div></div>
  </div>
 </div>
 <div id="fallback" role="alert" aria-live="assertive" hidden><div id="fallbackTitle">불러오는 중…</div><small id="fallbackDetail">잠깐만요.</small><button class="btn soft" id="retryGame" type="button" hidden style="width:auto;margin-top:10px">다시 시도</button></div>
</section>`;

const FIGHT_ICONS = `
<symbol id="fi-fist" viewBox="0 0 48 48">
 <g stroke="#7c818a" stroke-width="2.2"><path d="M9 11l5 4M39 33l-5 4" stroke-linecap="round"/><circle cx="11" cy="12.5" r="3.1" fill="#b7bcc4"/><circle cx="37" cy="35.5" r="3.1" fill="#b7bcc4"/></g>
 <path d="M12 17l3 3M33 28l3 3" stroke="#ffd24a" stroke-width="2.4" stroke-linecap="round"/>
 <path d="M13 36c-4-3-5-8.4-4-13l1.6-7.4c.5-2.3 3.4-2.1 3.8.2l.5 2.6c.2-2.8 3.3-2.8 3.8 0 .3-2.4 3.4-2.4 3.8.2.5-2.1 3.5-1.8 3.7.5l.3 4c2.4 0 4.1 2 4.1 4.7 0 6.2-3.6 11-8.3 12.3L25.5 40H14z" fill="#f1b188" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M15.6 18.2l.6 5.2M20.6 16.6l.4 6M25.6 17l.3 5.6" fill="none" stroke="#c57c54" stroke-width="1.9" stroke-linecap="round"/>
 <g fill="#fbf4e3" stroke="#241c2b" stroke-width="1.5"><rect x="11.4" y="23.2" width="21" height="4.4" rx="1.4" transform="rotate(5 22 25.4)"/><rect x="12.4" y="29.4" width="17.8" height="3.7" rx="1.2" transform="rotate(5 21 31.2)"/></g>
</symbol>
<symbol id="fi-spear" viewBox="0 0 48 48">
 <path d="M8 42L35 13" stroke="#241c2b" stroke-width="7.4" stroke-linecap="round"/>
 <path d="M8 42L35 13" stroke="#c7ad63" stroke-width="4.8" stroke-linecap="round"/>
 <g stroke="#89702f" stroke-width="2" stroke-linecap="round"><path d="M14.5 37l2.6-2.6M20.8 30.4l2.6-2.6M27 24l2.6-2.6"/></g>
 <path d="M33 15l9-9-2.2 11.4L32 16z" fill="#efe3be" stroke="#241c2b" stroke-width="2.3" stroke-linejoin="round"/>
 <g stroke="#5e4a2c" stroke-width="2.1" stroke-linecap="round"><path d="M30.5 19.5l3.4-3.4M32.4 21.4l3.4-3.4"/></g>
 <path d="M13 39c-3.2-1-5.2 1-7.4 0 1.1-2.1 1.1-4.2 0-6.3 3.2 1 5.2-1 7.4 0-1.1 2.1-1.1 4.2 0 6.3z" fill="#d8352a" stroke="#241c2b" stroke-width="1.7" stroke-linejoin="round"/>
</symbol>
<symbol id="fi-knife" viewBox="0 0 48 48">
 <path d="M8 40l9-9" stroke="#241c2b" stroke-width="8" stroke-linecap="round"/><path d="M8 40l9-9" stroke="#3a2f2a" stroke-width="5" stroke-linecap="round"/>
 <circle cx="11.5" cy="36.5" r="1.3" fill="#d9c08a"/><circle cx="14.5" cy="33.5" r="1.3" fill="#d9c08a"/>
 <path d="M16 31L33 14c5-1 9 2.2 9 7.2V25c0 3-2 5-5 5H21z" fill="#e7eef3" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M20 29L35.5 16" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
 <path d="M16 31l5 4" stroke="#241c2b" stroke-width="2.5" stroke-linecap="round"/>
 <path d="M17 33c-4 .2-7 3.2-6 7.2 2-2 4-1.1 6 0-1.2-3 .8-5.2 0-7.2z" fill="#fbf6ec" stroke="#241c2b" stroke-width="1.6" stroke-linejoin="round"/>
</symbol>
<symbol id="fi-gun" viewBox="0 0 48 48">
 <path d="M6 16h35v9H24l-2 4-1 11h-9l1.6-13-2.6-2z" fill="#3b3d45" stroke="#241c2b" stroke-width="2.6" stroke-linejoin="round"/>
 <path d="M9 19h28" stroke="#787b85" stroke-width="1.7"/>
 <path d="M26 16v9M30 16v9M34 16v9" stroke="#2a2b32" stroke-width="1.3"/>
 <path d="M20 25c0 3 2 5 5 5" fill="none" stroke="#241c2b" stroke-width="2.3" stroke-linecap="round"/>
 <path d="M41 18h3" stroke="#241c2b" stroke-width="2.6" stroke-linecap="round"/>
 <g transform="rotate(13 14 41)"><rect x="9" y="35" width="10" height="12.5" rx="1.2" fill="#f4c73e" stroke="#241c2b" stroke-width="1.8"/><path d="M14 37v8.5M11.6 40h4.8M11.6 43h4.8" stroke="#c0291d" stroke-width="1.5" stroke-linecap="round"/></g>
 <path d="M12 34l1.6 2.2" stroke="#241c2b" stroke-width="1.6" stroke-linecap="round"/>
</symbol>
`;

let booted=false;
window.PaljaBoot=function(){
 if(booted)return;booted=true;
 // 타격 효과음 글자용 붓글씨 폰트(Gugi): 평소 UI 폰트와 확 다른 먹글씨 느낌
 try{const fl=document.createElement('link');fl.rel='stylesheet';fl.href='https://fonts.googleapis.com/css2?family=Gugi&family=Black+Han+Sans&display=swap';document.head.appendChild(fl);}catch(_){}
 const st=document.createElement('style');st.id='fight-style';st.textContent=FIGHT_CSS;document.head.appendChild(st);
 const box=document.createElement('div');box.innerHTML=FIGHT_HTML.trim();document.body.appendChild(box.firstElementChild);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';
 svg.innerHTML='<defs>'+FIGHT_ICONS+'</defs>';document.body.appendChild(svg);
 try{runGame();}
 catch(err){
  const fb=document.getElementById('fallback');if(fb){fb.hidden=false;document.getElementById('fallbackTitle').textContent='족치기 화면을 열지 못했습니다.';document.getElementById('fallbackDetail').textContent=String(err&&err.message||err).slice(0,160);}
  let fallbackSealTimer=0,fallbackRound=0;
  const leave=()=>{fallbackRound++;clearTimeout(fallbackSealTimer);fallbackSealTimer=0;const f=document.getElementById('fight');if(f)f.hidden=true;if(window.__paljaLeave)window.__paljaLeave();};
  const fightUnavailable=()=>{fallbackRound++;clearTimeout(fallbackSealTimer);fallbackSealTimer=0;document.getElementById('submitDock').hidden=true;fb.hidden=false;document.getElementById('fallbackTitle').textContent='족치기 모드는 3D 그래픽이 필요합니다.';document.getElementById('fallbackDetail').textContent='순응하지 않는 선택은 확인했습니다. WebGL을 지원하는 브라우저에서 다시 열어 주세요.';requestAnimationFrame(()=>document.getElementById('retryGame').focus());};
  const shareFallback=async()=>{const text='저는 다음 사람의 불리한 운명 배정에 확인 도장을 찍었습니다.\n공유용 별칭: 운명 이완용\n처리 결과: 기존 질서 유지 · 보상: 없음';try{if(navigator.share)await navigator.share({title:'운명 배정 처리 내역',text});else if(navigator.clipboard)await navigator.clipboard.writeText(text);else throw 0;}catch(e){if(e&&e.name==='AbortError')return;window.prompt('아래 문구를 복사하세요.',text);}};
  window.PaljaGame={enter(result,mode='fight'){
   const f=document.getElementById('fight');if(!f)return;const round=++fallbackRound;clearTimeout(fallbackSealTimer);fallbackSealTimer=0;f.hidden=false;document.getElementById('dock').hidden=true;
   const top=f.querySelector('.ftop'),g=f.querySelector('.gauge');top.hidden=false;g.hidden=mode==='submit';document.getElementById('soundBtn').hidden=true;document.getElementById('settingsBtn').hidden=true;
   document.getElementById('fightBack').onclick=leave;
   if(mode!=='submit'){fb.hidden=false;requestAnimationFrame(()=>document.getElementById('retryGame').focus());return;}
   fb.hidden=true;document.getElementById('world').hidden=true;document.getElementById('sblood').hidden=true;
   const dock=document.getElementById('submitDock'),flow=document.getElementById('submitWorkflow'),cert=document.getElementById('submitCertificate');dock.hidden=false;flow.hidden=false;flow.classList.remove('stamped');cert.hidden=true;
   requestAnimationFrame(()=>document.getElementById('fateSeal').focus());
   document.getElementById('fateSeal').onclick=()=>{if(flow.classList.contains('stamped'))return;flow.classList.add('stamped');fallbackSealTimer=setTimeout(()=>{fallbackSealTimer=0;if(round!==fallbackRound||f.hidden)return;flow.hidden=true;cert.hidden=false;requestAnimationFrame(()=>document.getElementById('submitShare').focus());},520);};
   document.getElementById('breakSeal').onclick=fightUnavailable;document.getElementById('submitFight').onclick=fightUnavailable;document.getElementById('submitShare').onclick=shareFallback;
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
 return {grid,segment,ray};
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
   this.maxFrac=o.maxFrac==null?.42:o.maxFrac;this.maxAbs=o.maxAbs==null?.12:o.maxAbs;this.minEdge=o.minEdge==null?.0055:o.minEdge;this.maxVerts=o.maxVerts||70000;
   this.trans=[];this.toff=null;this.tlist=null;this.dirtyBounds=false;
   this._rayIdle=0;this._rayIdleKind='';this._rayDead=false;
   mesh.frustumCulled=true;
   this.setGeometry(mesh.geometry);
   const self=this;mesh.raycast=function(rc,out){self.raycast(rc,out);};
  }
  // 새 지오메트리(처음 만들 때·쪼갠 뒤·썬 뒤): 지금 모양을 쉬는 모양으로 삼는다
  setGeometry(g,keepDmg){
   this._cancelRayRebuild();this._rayDead=false;
   if(!g.index){const n=g.attributes.position.count,a=new Uint32Array(n);for(let i=0;i<n;i++)a[i]=i;g.setIndex(new THREE.BufferAttribute(a,1));}
   if(!g.attributes.normal)g.computeVertexNormals();
   const n=g.attributes.position.count;this.g=g;this.n=n;
   g.attributes.position.setUsage(THREE.DynamicDrawUsage);g.attributes.normal.setUsage(THREE.DynamicDrawUsage);
   this.pos=g.attributes.position.array;this.nor=g.attributes.normal.array;
   this.rest=Float32Array.from(this.pos);this.restN=Float32Array.from(this.nor);this.disp=new Float32Array(n*3);
   if(g.attributes.aDmg&&g.attributes.aDmg.count===n){this.dmg=g.attributes.aDmg.array;}
   else{this.dmg=new Float32Array(n*4);g.setAttribute('aDmg',new THREE.BufferAttribute(this.dmg,4));}
   g.attributes.aDmg.setUsage(THREE.DynamicDrawUsage);
   this.cap=new Float32Array(n);
   for(let i=0;i<n;i++)this.cap[i]=this.capAt(this.rest[i*3],this.rest[i*3+1],this.rest[i*3+2]);
   this._weld();this._adj();if(!this.o.keepNormals){this._normals(null);this.restN.set(this.nor);}
   g.computeBoundingSphere();g.computeBoundingBox();delete g.userData.fastGrid;
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
   const topologyChanged=this.refineSeg(a,b,w*1.8,o.minEdge||Math.max(.0035,this.minEdge*.7));
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
   return this._finish(vs,rec,topologyChanged);
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
  refineSeg(a,b,R,minEdge){const ab=_v3.subVectors(b,a),L2=ab.lengthSq();const ax=a.x,ay=a.y,az=a.z,bx=ab.x,by=ab.y,bz=ab.z,r=R*1.001+1e-9;
   return this._refine((x,y,z)=>{let t=L2>0?((x-ax)*bx+(y-ay)*by+(z-az)*bz)/L2:0;t=clamp(t,0,1);const dx=x-ax-bx*t,dy=y-ay-by*t,dz=z-az-bz*t;return dx*dx+dy*dy+dz*dz<R*R;},minEdge,
    [Math.min(ax,b.x)-r,Math.min(ay,b.y)-r,Math.min(az,b.z)-r,Math.max(ax,b.x)+r,Math.max(ay,b.y)+r,Math.max(az,b.z)+r]);}
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
   const addMid=(u,v)=>{if(len2(u,v)<=me2)return;const k=key(u,v);if(!mids.has(k)){mids.set(k,n0+added);newV.push(u,v);added++;}};
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
 return {patch,Flesh,MEAT,shared};
})();

/* ===== 2-4. 썰기 =====
 * 평면으로 지오메트리를 두 쪽으로 나누고, 잘린 면을 막는다. 잘린 면은 바깥 테부터 안쪽으로 찢긴 살갗 → 비늘 → 속살 → 깊은 속살 순으로
 * 손상 값(aDmg.y)을 매겨서 살 셰이더가 결 있는 단면으로 칠하게 한다. dist(p)=n·p-d 가 0보다 크면 잘려 나가는 쪽. */
const SLICE=(()=>{
 const RINGS=[[1,.1],[.95,.28],[.88,.46],[.74,.78],[.5,1],[.22,1.1],[0,1.15]];
 function slice(geo,n,d){
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
   const k0=push(B[0],px,py,pz,nx,ny,nz,u,v,cr,cg,cb,d0,Math.max(d1,.12),d2,d3),k1=push(B[1],px,py,pz,nx,ny,nz,u,v,cr,cg,cb,d0,Math.max(d1,.12),d2,d3);
   // 같은 자리(겹친 꼭짓점의 변)는 같은 열쇠로 묶어 고리를 잇는다
   const q=Math.round(px*1e5)+','+Math.round(py*1e5)+','+Math.round(pz*1e5);
   m={k0,k1,q,p:[px,py,pz],c:[cr,cg,cb],uv:[u,v],dm:[d0,d2,d3]};mids.set(key,m);if(!pk.has(q))pk.set(q,m);return m;}
  const segs=[];
  for(let t=0;t<T;t++){
   const ia=idx?idx[t*3]:t*3,ib=idx?idx[t*3+1]:t*3+1,ic=idx?idx[t*3+2]:t*3+2,sa=dist[ia]>0?1:0,sb=dist[ib]>0?1:0,sc=dist[ic]>0?1:0;
   if(sa===sb&&sb===sc){const b=B[sa];b.idx.push(vtx(sa,ia),vtx(sa,ib),vtx(sa,ic));continue;}
   // 혼자 다른 쪽인 꼭짓점을 맨 앞으로(감는 순서는 그대로)
   let L_,M1,M2;if(sa!==sb&&sa!==sc){L_=ia;M1=ib;M2=ic;}else if(sb!==sa&&sb!==sc){L_=ib;M1=ic;M2=ia;}else{L_=ic;M1=ia;M2=ib;}
   const sL=dist[L_]>0?1:0,sO=1-sL,i1=mid(L_,M1),i2=mid(L_,M2);
   const k1L=sL?i1.k1:i1.k0,k2L=sL?i2.k1:i2.k0,k1O=sO?i1.k1:i1.k0,k2O=sO?i2.k1:i2.k0;
   B[sL].idx.push(vtx(sL,L_),k1L,k2L);
   B[sO].idx.push(k1O,vtx(sO,M1),vtx(sO,M2),k1O,vtx(sO,M2),k2O);
   if(i1.q!==i2.q)segs.push([i1.q,i2.q]);
  }
  // 잘린 테두리를 고리로 잇기
  const adj=new Map();for(const [a,b] of segs){if(!adj.has(a))adj.set(a,[]);if(!adj.has(b))adj.set(b,[]);adj.get(a).push(b);adj.get(b).push(a);}
  const used=new Set(),loops=[];
  for(const st of adj.keys()){if(used.has(st))continue;const loop=[st];used.add(st);let prev=null,cur=st;
   for(let g=0;g<20000;g++){const nb=adj.get(cur).filter(x=>x!==prev&&(!used.has(x)||(x===st&&loop.length>2)));if(!nb.length)break;const nx=nb.find(x=>!used.has(x))||nb[0];if(nx===st)break;loop.push(nx);used.add(nx);prev=cur;cur=nx;}
   if(loop.length>=3)loops.push(loop.map(q=>pk.get(q)));}
  // 단면 막기: 두 쪽에 각각(남는 쪽은 +n, 떨어지는 쪽은 -n을 본다)
  for(const loop of loops)for(const s of [0,1])cap(B[s],loop,s===0?n.clone():n.clone().negate());
  return {keep:build(B[0]),cut:build(B[1]),loops:loops.length};
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
 /* 관(팔·다리): a→b 축, 반지름 함수 rf(t,ang), 둘레 칸 rs, 길이 칸 ls. 양 끝은 둥글게 닫는다 */
 function tube(a,b,rf,rs,ls,o={}){
  const ax=V3().subVectors(b,a),L=ax.length();ax.normalize();
  let up=Math.abs(ax.y)>.9?V3(1,0,0):V3(0,1,0);const u=V3().crossVectors(up,ax).normalize(),v=V3().crossVectors(ax,u);
  const capN=o.cap||4,rows=[];
  // 아래 끝 반구 → 몸통 → 위 끝 반구
  for(let i=capN;i>=1;i--){const q=i/capN*PI/2;rows.push({t:0,k:Math.cos(q),off:-Math.sin(q)});}
  for(let i=0;i<=ls;i++)rows.push({t:i/ls,k:1,off:0});
  for(let i=1;i<=capN;i++){const q=i/capN*PI/2;rows.push({t:1,k:Math.cos(q),off:Math.sin(q)});}
  const pos=[],nor=[],uv=[],idx=[],R=rows.length;
  for(let r=0;r<R;r++){const w=rows[r];
   for(let j=0;j<=rs;j++){const ang=j/rs*TAU,ca=Math.cos(ang),sa=Math.sin(ang);
    const rad=rf(w.t,ang)*Math.max(w.k,.0001),capR=rf(w.t,ang)*(o.capScale||.6);
    const cx=a.x+ax.x*(w.t*L+w.off*capR),cy=a.y+ax.y*(w.t*L+w.off*capR),cz=a.z+ax.z*(w.t*L+w.off*capR);
    const dx=u.x*ca+v.x*sa,dy=u.y*ca+v.y*sa,dz=u.z*ca+v.z*sa;
    pos.push(cx+dx*rad,cy+dy*rad,cz+dz*rad);
    const nk=w.k,no=w.off;nor.push(dx*nk+ax.x*no,dy*nk+ax.y*no,dz*nk+ax.z*no);
    uv.push(j/rs,r/(R-1));}}
  for(let r=0;r<R-1;r++)for(let j=0;j<rs;j++){const p=r*(rs+1)+j,q=p+rs+1;idx.push(p,q,p+1,p+1,q,q+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
  g.computeVertexNormals();g.computeBoundingSphere();return g;
 }
 return {ell,cap,smin,smax,star,tube};
})();
/* ===== 3. 소리 =====
 * 녹음 파일 없이 전부 만들어 낸다. 타격음은 여러 겹(낮은 쿵 + 살 철썩 + 뼈 딱 + 공간 울림)으로 쌓고,
 * 목소리는 성대 소리를 모음 울림통(포먼트)에 통과시켜 '윽·억·아악·으으·흐흐' 같은 소리를 낸다. */
const AUDIO=(()=>{
 let ctx=null,master,comp,lim,bus,vbus,verb,noise,glot,irBuf,on=true,baking=false;
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
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=8;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.14;
  lim=ctx.createDynamicsCompressor();lim.threshold.value=-3;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.09;
  master=ctx.createGain();master.gain.value=on?.95:0;
  bus=ctx.createGain();vbus=ctx.createGain();vbus.connect(bus);
  bus.connect(comp);comp.connect(lim);lim.connect(master);master.connect(ctx.destination);
  irBuf=makeIR(1.6,2.8,.3);verb=ctx.createConvolver();verb.buffer=irBuf;const vr=ctx.createGain();vr.gain.value=.4;verb.connect(vr);vr.connect(comp);
  const len=ctx.sampleRate*2;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  // 성대 소리: 배음이 부드럽게 줄어드는 펄스
  const N=48,re=new Float32Array(N+1),im=new Float32Array(N+1);for(let n=1;n<=N;n++){im[n]=Math.pow(n,-1.55)*(n%2?1:.85);}glot=ctx.createPeriodicWave(re,im,{disableNormalization:false});
  bakeAll();
 }
 function unlock(){try{init();if(ctx&&ctx.state!=='running'){const p=ctx.resume();if(p&&p.catch)p.catch(()=>{});}}catch(_){}}
 function ready(){return ctx&&on&&(baking||ctx.state==='running');}
 function setOn(v){on=!!v;if(master)master.gain.setTargetAtTime(on?.95:0,ctx.currentTime,.03);}
 const live=new Set();
 function track(n){if(baking)return;live.add(n);n.onended=()=>live.delete(n);}
 function stop(){for(const n of live){try{n.stop();}catch(_){}}live.clear();}
 function out(pan=0,wet=.2,voice=false){
  const g=ctx.createGain();let node=g;
  if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;}
  node.connect(voice?vbus:bus);if(wet>0){const s=ctx.createGain();s.gain.value=wet;node.connect(s);s.connect(verb);}
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
  * 타격음·총소리는 시작할 때 한 번 여러 벌 만들어 둔다(무거운 처리를 해도 되고, 연사할 때 휴대폰이 덜 버거워한다).
  * 굽는 동안에는 ctx·bus·verb를 잠깐 오프라인 것으로 바꿔 끼운다. 다 구워지기 전에는 바로 만들어 낸다. */
 const SFX={};
 function bakeOne(fn,dur,raw){
  const sr=ctx.sampleRate,oc=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,Math.ceil(sr*dur),sr);
  const saved=[ctx,bus,vbus,verb];
  baking=true;
  try{ctx=oc;bus=oc.createGain();bus.connect(oc.destination);vbus=bus;verb=oc.createConvolver();verb.buffer=irBuf;const vr=oc.createGain();vr.gain.value=.4;verb.connect(vr);vr.connect(oc.destination);fn(.004);}
  finally{baking=false;[ctx,bus,vbus,verb]=saved;}
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
 function bakeAll(){
  if(!(window.OfflineAudioContext||window.webkitOfflineAudioContext))return;
  // 처음 화면이 뜰 때 한꺼번에 굽지 않고 조금씩 나눠 굽는다(휴대폰에서 멈칫하지 않게)
  const jobs=[['face',3,1,.45],['shot',4,1,1.1],['body',3,1,.55],['stab',3,1,.5],['flesh',3,1,.4],['faceH',3,1.5,.55],['bodyH',2,1.5,.6],['slash',3,1,.32],['pull',2,1,.45],['skull',2,1,.45],['block',2,1,.35]];
  const queue=[];for(const [name,n,p,dur] of jobs){SFX[name]=[];for(let i=0;i<n;i++)queue.push([name,p,dur]);}
  const next=()=>{const j=queue.shift();if(!j)return;const [name,p,dur]=j;
   let pr;try{pr=bakeOne(t=>MAKE[name](out(0,name==='shot'?.38:.14),t,p),dur);}catch(_){pr=null;}
   if(!pr){setTimeout(next,30);return;}
   pr.then(b=>{if(b)SFX[name].push(b);},()=>{}).then(()=>setTimeout(next,16));};
  next();
 }
 function play(name,gain=1,pan=0,rate=1){
  const list=SFX[name];if(!list||!list.length)return false;
  const t=ctx.currentTime,s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=list[(Math.random()*list.length)|0];s.playbackRate.value=rate*R(.96,1.04);g.gain.value=gain;
  let node=g;if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;}
  s.connect(g);node.connect(bus);s.start(t);track(s);return true;
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
  // 권총: 날카로운 탁 + 폭발 + 낮은 쿵 + 큰 방 울림 + 슬라이드 철컥
  shot(o,t,p){const d=drive(o,4.5);
   nz(d,t,{dur:.005,peak:1,f:3000,type:'highpass',q:.4});
   nz(d,t,{dur:.075,peak:1,f:6500,f1:900,type:'lowpass',q:.6});
   nz(d,t+.01,{dur:.3,peak:.45,f:900,f1:180,type:'lowpass',q:.5});
   osc(d,t,{f0:96,f1:40,dur:.24,peak:1});
   osc(d,t,{type:'square',f0:190,f1:70,dur:.05,peak:.35});
   osc(d,t,{type:'triangle',f0:900,f1:140,dur:.035,peak:.35});
   clicks(o,t+.05,2,.012,3200,.35);nz(o,t+.062,{dur:.025,peak:.25,f:2600,q:2});
   // 바닥에 떨어지는 탄피
   for(let i=0;i<3;i++){const tt=t+.42+i*(.09-i*.02);ring(o,tt,[4200*R(.97,1.03),6100,8300],.07,.07/(i+1));}},
  // 총알이 살에 박힘
  flesh(o,t,p){const d=drive(o,2.4);
   nz(d,t,{dur:.03,peak:.8,f:750,q:.8});
   osc(d,t,{f0:165,f1:62,dur:.08,peak:.85});
   const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=5;f.frequency.setValueAtTime(1300,t+.006);f.frequency.exponentialRampToValueAtTime(600,t+.09);env(g.gain,t+.006,.5,.004,.09);s.connect(f);f.connect(g);g.connect(d);s.start(t+.006,Math.random());s.stop(t+.12);track(s);},
  // 총알이 머리에 박힘(딱딱한 소리가 섞인다)
  skull(o,t,p){MAKE.flesh(o,t,p);const d=drive(o,1.8);nz(d,t,{dur:.01,peak:.32,f:3800,type:'highpass',q:.4});clicks(d,t+.004,6,.03,2600,.16);osc(d,t+.006,{type:'triangle',f0:620,f1:240,dur:.04,peak:.18});osc(d,t,{f0:120,f1:50,dur:.12,peak:.5});},
  block(o,t,p){osc(o,t,{type:'triangle',f0:240,f1:110,dur:.08,peak:.7});osc(o,t,{f0:95,f1:55,dur:.14,peak:.5});nz(o,t,{dur:.05,peak:.5,f:1300,q:.8});nz(o,t,{dur:.11,peak:.25,f:500,f1:200,type:'lowpass'});},
 };
 function fx(name,gain,pan,rate,p=1){if(play(name,gain,pan,rate))return;const o=out(pan,name==='shot'?.38:.14),g=ctx.createGain();g.gain.value=gain*.8;g.connect(o);MAKE[name](g,ctx.currentTime+.002,p);}

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
  else if(tool==='spear'){if(kind==='slash')spearDrag(clamp(p,.5,1.6));else{spearStab(clamp(p,.6,1.8));if(!head)slap(.4,.05);}}
  else if(tool==='gun')fx(head?'skull':'flesh',.95,pan,1,p);
 }
 function crownT(o,t,p){ring(o,t,[880,2070,3510,5200],.22,.16*p);osc(o,t,{type:'triangle',f0:300,f1:150,dur:.05,peak:.4});clicks(o,t+.01,10,.25,5200,.22);}
 function crown(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.3,.3),.25);crownT(o,t,p);}
 function crownLand(){if(!ready())return;const t=ctx.currentTime,o=out(0,.3);osc(o,t,{f0:160,f1:70,dur:.12,peak:.5});ring(o,t,[620,1450,2300],.16,.12);clicks(o,t,16,.55,4600,.24);}
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
 function pop(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.14);osc(o,t,{f0:420,f1:1300,dur:.06,peak:.4*p});nz(o,t,{dur:.012,peak:.3*p,f:2600,q:1});ring(o,t+.03,[2700,4050],.12,.05*p);}
 function unmask(p=1){if(!ready())return;const t=ctx.currentTime,o=out(0,.25),d=drive(o,1.8);
  tearNoise(d,t,.38,2100,.6*p,R(40,52));tearNoise(d,t+.12,.26,3200,.4*p,R(70,85));osc(d,t,{f0:110,f1:45,dur:.25,peak:.7*p});nz(d,t,{dur:.012,peak:.6*p,f:3800,type:'highpass',q:.5});
  hiss(.9*p);}
 function pat(p=.6){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.08);osc(o,t,{f0:150,f1:80,dur:.07,peak:.3*p});nz(o,t,{dur:.04,peak:.18*p,f:500,type:'lowpass',q:.7});}
 function tablet(broken){if(!ready())return;const t=ctx.currentTime+.01,o=out(R(-.3,.3),.3);ring(o,t,[2750,4630,6980],.35,.14);nz(o,t,{dur:.03,peak:.55,f:3000,q:.8});if(broken){clicks(o,t+.02,12,.3,6000,.28);ring(o,t+.08,[3200,5100],.2,.08);}}
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
 // 창으로 찌르기: 날카로운 쉭 + 꿰뚫는 질척 + 묵직한 쿵
 function spearStab(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.15,.15),.16),d=drive(o,2.4);
  nz(d,t,{dur:.025,peak:.7,f:5200,f1:2600,q:1.3});
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='bandpass';f.Q.value=7;f.frequency.setValueAtTime(420,t+.01);f.frequency.exponentialRampToValueAtTime(1500,t+.17);env(g.gain,t+.01,.9*p,.006,.18);s.connect(f);f.connect(g);g.connect(d);s.start(t+.01,Math.random());s.stop(t+.24);track(s);
  osc(d,t,{f0:128,f1:52,dur:.14,peak:.85*p});osc(d,t+.002,{f0:60,f1:36,dur:.2,peak:.5*p,a:.004});
  clicks(d,t+.012,3,.05,2200,.3);}
 // 창을 끌며 긋기: 길게 찢기는 소리 + 질척
 function spearDrag(p=1){if(!ready())return;const t=ctx.currentTime,o=out(R(-.2,.2),.14),d=drive(o,2);tearNoise(d,t,.28,1700,.85*p,R(40,56));
  nz(d,t+.02,{dur:.14,peak:.4*p,f:800,f1:340,type:'lowpass',q:.8});osc(d,t,{f0:120,f1:70,dur:.1,peak:.3*p});}
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
  if(o.trem){const tr=ctx.createOscillator(),tg=ctx.createGain();tr.frequency.value=o.trem;tg.gain.value=peak*.35;tr.connect(tg);tg.connect(env_.gain);tr.start(t);tr.stop(t+dur+.1);track(tr);}
  env_.gain.setValueAtTime(peak,t+Math.max(a,dur-rel));env_.gain.exponentialRampToValueAtTime(.0001,t+dur);
  env_.connect(dst);
  for(const n of [src,vib])n.start(t);jit.start(t,Math.random()*1.5);br.start(t,Math.random()*1.5);
  for(const n of [src,vib,jit,br]){n.stop(t+dur+.06);track(n);}
 }
 function breath(t,dur,peak,f0=900,f1=1600,pan=0){const o=out(pan,.15,true);nz(o,t,{dur,peak,a:dur*.3,f:f0,f1,q:.9,curve:'lin'});}
 let lastV=0;
 function say(name,k=1){
  if(!ready())return;const t=Math.max(ctx.currentTime+.01,duckUntil),P=R(.94,1.06);
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

 /* ---- 수혜자들과 되살림 ---- */
 // 웅성거림: 짧은 애원 목소리 서넛이 겹친다
 function murmur(k=1){if(!ready())return;const t=Math.max(ctx.currentTime+.01,duckUntil);for(let i=0;i<4;i++){const tt=t+i*R(.06,.14),P=R(.9,1.12);voice(tt,{dur:R(.22,.38),f0:(170+i*22)*P,fm:(215+i*20)*P,fmAt:.6,f1:(185+i*16)*P,v1:pick(['eo','a','e']),v2:'m',breath:.4,peak:.14*k,vib:.03,vibHz:6.5,rough:.07,bright:2600,pan:R(-.5,.5)});}}
 // 환호: 여럿이 '와—' 하고 올라갔다 내려온다
 function cheer(k=1){if(!ready())return;const t=Math.max(ctx.currentTime+.01,duckUntil);for(let i=0;i<6;i++){const tt=t+R(0,.22),P=R(.85,1.2),f0=(190+i*28)*P;voice(tt,{dur:R(.55,.85),f0:f0,fm:f0*1.35,fmAt:.3,f1:f0*1.15,v1:'a',v2:'a',breath:.25,peak:.16*k,vib:.02,vibHz:5,rough:.05,bright:3400,wet:.3,pan:R(-.6,.6)});}
  const o=out(0,.25);nz(o,t,{dur:.9,peak:.12*k,a:.12,f:1600,f1:2600,q:.6,curve:'lin'});}
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
 return {unlock,murmur,cheer,charge,twinkle,boom,stamp,setOn,stop,whoosh,hit,duck,block(){if(ready())fx('block',.9,R(-.2,.2),1);},crown,crownLand,tooth,toothBounce,crack,tablet,gunshot,dry,reload(){},spurt,pull,drip,fall,
  whiff(){},voice:say,gasp(k=1){say('gasp',k);},haloCrack,haloBuzz,haloLand,haloTap,hiss,coin,coinGush,rip,peel,chop,squelch,pop,unmask,pat,slap,spearStab,spearDrag,behead,ui(){if(!ready())return;const t=ctx.currentTime,o=out(0,.02);osc(o,t,{f0:880,f1:660,dur:.04,peak:.12,type:'triangle'});},
  get ctx(){return ctx;},get baked(){return SFX;},
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
 // 꼭대기 장식: 금 구름(가운데는 후광이 걸리는 자리라 비워 둔다)
 const crest=grp(back,[0,1.92,0]);
 mk(new THREE.TorusGeometry(.5,.05,10,40,PI),gold,crest,{p:[0,-.1,0]});
 mk(new THREE.TorusGeometry(.32,.04,10,30,PI),goldD,crest,{p:[0,-.06,.02]});
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
 * 서 있을 때: 면류관 꼭대기가 위쪽 막대 바로 밑, 발바닥이 화면 맨 아래에 오게 맞춘다(무릎까지 도구칸 위로 보여 다리를 벨 수 있다).
 * 넘어질 때: 정해 둔 구도로 부드럽게 옮긴다(옆으로 돌지 않는다). */
const CAM={pos:V3(0,1.3,2.2),look:V3(0,1.3,0),goalPos:V3(0,1.3,2.2),goalLook:V3(0,1.3,0),frame:'stand',kick:V3(),kickV:V3(),shake:0,shakeT:0,fovBase:40,zoom:0,zoomV:0,ready:false,
 rot:new Spring3(330,24),push:new Spring(300,22),jit:V3(),jitT:0};
const FRAMES={
 stand:{top:1.88,bot:0,botL:0,z:.18},
 // 넘어진 뒤에는 서 있는 내가 내려다보는 구도(대상 위치·카메라 방향·거리)
 throne:{look:[0,1.0,-.6],dir:[0,.3,1],W:1.05,H:1.45},
 kneel:{look:[0,.8,.05],dir:[0,.45,1],W:1.0,H:1.35},
 floor:{look:[0,.62,-.16],dir:[0,.5,1],W:.95,H:1.02},
 final:{look:[0,.5,-.32],dir:[0,.5,1],W:1,H:1.2},
 revival:{look:[0,.92,-.08],dir:[0,.2,1],W:1.02,H:1.88},
};
function frameCamera(name,outPos,outLook){
 if(name==='debug'||name==='cut')return;
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
/* 카메라 반응: 맞힐 때 화면이 같이 움직여야 손맛이 난다.
 * kick=맞은 방향으로 밀림, rot=고개가 들리고 돌아감(라디안), push=앞으로 쏠림(미터), shake=떨림(미터), zoom=시야 조임 */
function camHit(o){
 const k=PREF.shake?1:.25;
 if(o.dir&&o.kick)CAM.kickV.addScaledVector(o.dir,o.kick*9*k);
 if(o.pitch||o.yaw||o.roll){CAM.rot.push((o.pitch||0)*k,(o.yaw||0)*k,(o.roll||0)*k,.12);CAM.rot.kick((o.pitch||0)*6*k,(o.yaw||0)*6*k,(o.roll||0)*6*k);}
 if(o.push){CAM.push.push(o.push*k,.2);}
 if(o.zoom)CAM.zoomV+=o.zoom*10*(PREF.shake?1:.3);
 if(o.shake&&PREF.shake)CAM.shake=Math.max(CAM.shake,o.shake);
}
function camKick(dir,amount){camHit({dir,kick:amount});}
function camShake(a){camHit({shake:a});}
function camPunchZoom(a){camHit({zoom:a});}
function updateCamera(dt){
 const k=1-Math.exp(-dt*(CAM.rate||(CAM.frame==='stand'?3.2:2.2)));
 CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
 // 반동 스프링
 CAM.kickV.addScaledVector(CAM.kick,-260*dt);CAM.kickV.multiplyScalar(Math.exp(-dt*20));CAM.kick.addScaledVector(CAM.kickV,dt);
 CAM.zoomV+=(-200*CAM.zoom)*dt;CAM.zoomV*=Math.exp(-dt*18);CAM.zoom+=CAM.zoomV*dt;
 CAM.rot.step(dt);CAM.push.step(dt);
 // 떨림: 프레임마다 새로 뽑은 방향으로 튄다(사인파보다 또렷하다). 빠르게 줄어든다
 CAM.shake*=Math.exp(-dt*11);if(CAM.shake<.0004)CAM.shake=0;
 CAM.jitT-=dt;if(CAM.jitT<=0){CAM.jitT=1/45;CAM.jit.set(rnd(-1,1),rnd(-1,1),rnd(-.4,.4)).multiplyScalar(CAM.shake);}
 const sx=CAM.jit.x,sy=CAM.jit.y;
 _cf.subVectors(CAM.look,CAM.pos).normalize();
 camera.position.copy(CAM.pos).add(CAM.kick).addScaledVector(_cf,CAM.push.x);camera.position.x+=sx;camera.position.y+=sy;
 _cv.copy(CAM.look).add(CAM.kick);_cv.x+=sx*.35;_cv.y+=sy*.35;
 camera.lookAt(_cv);
 const r=CAM.rot;camera.rotateX(r.X);camera.rotateY(r.Y);camera.rotateZ(r.Z+CAM.jit.z*1.5);
 // 1인칭 손도 화면과 같이 조금 흔들린다
 vmCam.rotation.set(r.X*.6,r.Y*.6,(r.Z+CAM.jit.z*1.5)*.6);vmCam.position.set(sx*.25,sy*.25,0);
 CAM.fov=CAM.fov==null?CAM.fovBase:damp(CAM.fov,CAM.fovBase,2.5,dt);camera.fov=CAM.fov*(1-clamp(CAM.zoom,-.2,.2));camera.updateProjectionMatrix();
}
const _cv=V3(),_cf=V3();

/* ===== 4-2. 운명의 수혜자들 =====
 * 大吉 보증서를 쥔 사람들(여섯 중 둘은 小吉·平, 별것 없는데도 똑같이 지킨다).
 * 12%: 둘이 화면 양옆에서 뛰어들어 내 팔을 붙잡고 늘어진다(1인칭 손 장면 안, vmScene).
 * 10%: 넷이 설계자 앞을 막아서고 하나가 코앞까지 와서 손가락질한다(무대 안, scene).
 *  8%: 쓰러진 설계자 앞에 꿇어앉아 '내 것만은 건드리지 마라'는 소원을 올리고, 그 불씨가 모여 설계자를 되살린다.
 * 말은 머리 위 말풍선(BUB)으로 한다. */
const ZERO3=V3();
const BUB=(()=>{
 const live=[],v=V3();
 let layer=null;
 const L=()=>layer||(layer=$('#bubbles'));
 function say(anchor,text,dur=1.6,o={}){
  const el=document.createElement('div');el.className='bub'+(o.cls?' '+o.cls:'');
  const s=document.createElement('span');s.textContent=text;el.appendChild(s);L().appendChild(el);
  const b={el,anchor,until:G.time+dur};live.push(b);
  requestAnimationFrame(()=>{if(b.el.parentNode)b.el.classList.add('on');});
  return b;
 }
 function clear(){for(const b of live)b.el.remove();live.length=0;}
 function update(){
  if(!live.length)return;
  const W=innerWidth,H=innerHeight;const topEl=$('#fight .ftop');const topPx=(topEl&&!topEl.hidden?topEl.getBoundingClientRect().bottom:50)+4;
  for(let i=live.length-1;i>=0;i--){const b=live[i];
   if(G.time>b.until){b.el.remove();live.splice(i,1);continue;}
   if(G.time>b.until-.14)b.el.classList.remove('on');
   const a=b.anchor;if(!a.obj||!a.obj.parent){b.el.style.opacity='0';continue;}
   a.obj.updateWorldMatrix(true,false);v.copy(a.off||ZERO3).applyMatrix4(a.obj.matrixWorld);
   v.project(a.cam==='vm'?vmCam:camera);
   if(v.z>1||v.z<-1){b.el.style.opacity='0';continue;}
   let x=(v.x*.5+.5)*W,y=(-v.y*.5+.5)*H;
   const bw=b.el.offsetWidth||120,bh=b.el.offsetHeight||40;
   x=clamp(x,bw/2+6,W-bw/2-6);y=clamp(y,bh+topPx,H-8);
   b.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
  }
 }
 return {say,clear,update,get count(){return live.length;}};
})();

const CROWD=(()=>{
 const root=grp(scene,null,'fate-beneficiaries');root.visible=false;
 const vmRoot=grp(vmScene,null,'grabbers');vmRoot.visible=false;
 const coats=['#2b4a6e','#5a6b4c','#7a3f4b','#4c3f72','#6b5140','#2f5c66'];
 const skins=['#e6a884','#cf8f6c','#f0b490','#bf7f61','#d99b78','#f2c09e'];
 const hairs=['#231c1a','#4a382d','#7a716a','#2b2524','#5c4439','#171516'];
 const shirts=['#f3efe4','#eef3f6','#f6eee2','#f2f2ee','#efeadc','#f4efe6'];
 const ties=['#9c2231','#2c4f8c','#b0702a','#36663f','#7a2d6a','#8a2b2b'];
 // 보증서: big=大吉(금빛), small=小吉(연노랑), flat=平(누런 종이)
 const CERTS=[{g:'big',label:'평생 재물운'},{g:'big',label:'집안복 대길'},{g:'big',label:'자녀운 상승'},{g:'small',label:'큰 탈은 없음'},{g:'big',label:'윗자리 대길'},{g:'flat',label:'지금 이대로'}];
 const sphere=sphereGeo(16),earGeo=sphereGeo(10),noseGeo=new THREE.ConeGeometry(.017,.05,8);
 const sole=STD('#292528',{roughness:.75});
 const UA=.125,FA=.125; // 위팔·아래팔 길이(사람 기준 단위)

 /* ---- 얼굴(512px): 기분마다 한 장 ---- */
 function faceTex(mood){return canvasTex(512,512,(g,w,h)=>{
  g.clearRect(0,0,w,h);g.lineCap='round';g.lineJoin='round';
  const ink='#2a1f1c',brow='#3a2622';
  const eye=(x,y,open,sz=1)=>{ // 눈: 흰자+홍채+동공+하이라이트
   if(open<=0){g.strokeStyle=ink;g.lineWidth=14;g.beginPath();g.arc(x,y+6,26*sz,PI*1.1,PI*1.9);g.stroke();return;}
   g.fillStyle='#fffdf8';g.beginPath();g.ellipse(x,y,30*sz,22*open*sz,0,0,TAU);g.fill();
   g.strokeStyle=ink;g.lineWidth=5;g.stroke();
   g.save();g.beginPath();g.ellipse(x,y,30*sz,22*open*sz,0,0,TAU);g.clip();
   g.fillStyle='#5a3a24';g.beginPath();g.arc(x+2,y+3,13*sz,0,TAU);g.fill();
   g.fillStyle='#120a08';g.beginPath();g.arc(x+2,y+3,7*sz,0,TAU);g.fill();
   g.fillStyle='#fff';g.beginPath();g.arc(x-3,y-4,4*sz,0,TAU);g.fill();g.restore();
   // 윗눈꺼풀 선
   g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.ellipse(x,y,30*sz,22*open*sz,0,PI*1.05,PI*1.95);g.stroke();
  };
  const browL=(x0,y0,x1,y1,x2,y2)=>{g.strokeStyle=brow;g.lineWidth=15;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x1,y1,x2,y2);g.stroke();};
  const blush=(a)=>{g.fillStyle=`rgba(236,110,110,${a})`;for(const x of [112,400]){g.beginPath();g.ellipse(x,268,34,18,0,0,TAU);g.fill();}};
  const tears=()=>{g.strokeStyle='#5fb0ea';g.lineWidth=12;for(const x of [124,388]){g.beginPath();g.moveTo(x,236);g.quadraticCurveTo(x-6,300,x-4,372);g.stroke();g.fillStyle='#7cc3f2';g.beginPath();g.ellipse(x-4,382,12,16,0,0,TAU);g.fill();}};
  const mouth=(kind)=>{g.fillStyle='#5a1b1f';g.strokeStyle='#3a1416';g.lineWidth=7;g.beginPath();
   if(kind==='small'){g.moveTo(206,352);g.quadraticCurveTo(256,372,306,352);g.quadraticCurveTo(256,382,206,352);}
   else if(kind==='open'){g.ellipse(256,362,40,46,0,0,TAU);}
   else if(kind==='wide'){g.ellipse(256,366,66,52,0,0,TAU);}
   else if(kind==='shout'){g.moveTo(190,336);g.lineTo(322,336);g.lineTo(300,398);g.lineTo(212,398);g.closePath();}
   else if(kind==='smile'){g.moveTo(186,338);g.quadraticCurveTo(256,428,326,338);g.quadraticCurveTo(256,364,186,338);}
   g.closePath();g.fill();g.stroke();
   if(kind==='wide'||kind==='shout'||kind==='smile'){g.fillStyle='#fff8ec';g.beginPath();if(kind==='smile'){g.moveTo(200,342);g.quadraticCurveTo(256,362,312,342);g.lineTo(306,352);g.quadraticCurveTo(256,372,206,352);}else{g.rect(kind==='wide'?208:204,kind==='wide'?326:340,kind==='wide'?96:104,18);}g.closePath();g.fill();}
   if(kind==='wide'){g.fillStyle='#c9405a';g.beginPath();g.ellipse(256,396,30,16,0,0,TAU);g.fill();}
  };
  if(mood==='normal'){eye(152,192,1);eye(360,192,1);browL(104,142,150,128,196,140);browL(316,140,362,128,408,142);mouth('small');}
  else if(mood==='plead'){eye(152,198,1.15,1.05);eye(360,198,1.15,1.05);browL(104,150,146,118,196,132);browL(316,132,366,118,408,150);mouth('open');blush(.35);}
  else if(mood==='warn'){eye(152,196,.8);eye(360,196,.8);browL(100,126,150,138,200,164);browL(312,164,362,138,412,126);mouth('shout');}
  else if(mood==='wail'){eye(152,196,0);eye(360,196,0);browL(104,160,152,126,200,142);browL(312,142,360,126,408,160);tears();mouth('wide');blush(.45);}
  else if(mood==='pray'){eye(152,196,0);eye(360,196,0);browL(108,156,152,128,198,140);browL(314,140,360,128,404,156);mouth('open');blush(.35);}
  else{ // cheer
   g.strokeStyle=ink;g.lineWidth=14;for(const x of [152,360]){g.beginPath();g.arc(x,206,28,PI*1.1,PI*1.9);g.stroke();}
   browL(104,146,152,130,200,146);browL(312,146,360,130,408,146);mouth('smile');blush(.5);
  }
 },{srgb:true});}
 const faceMats={};
 for(const mood of ['normal','plead','warn','wail','pray','cheer'])faceMats[mood]=new THREE.MeshBasicMaterial({map:faceTex(mood),transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});

 /* ---- 보증서 ---- */
 function certTex(c){return canvasTex(320,420,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,w,h);
  if(c.g==='big'){gr.addColorStop(0,'#fff5aa');gr.addColorStop(.48,'#e8b83e');gr.addColorStop(1,'#fff0a0');}
  else if(c.g==='small'){gr.addColorStop(0,'#fdf6d6');gr.addColorStop(1,'#f1e3a8');}
  else{gr.addColorStop(0,'#e9e2cf');gr.addColorStop(1,'#d6cdb4');}
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  const line=c.g==='big'?'#5b3510':c.g==='small'?'#7a5a24':'#6a6356';
  g.strokeStyle=line;g.lineWidth=15;g.strokeRect(12,12,w-24,h-24);g.strokeStyle='rgba(255,255,225,.8)';g.lineWidth=4;g.strokeRect(29,29,w-58,h-58);
  g.fillStyle=line;g.textAlign='center';g.font='900 30px "Noto Serif KR",serif';g.fillText('運命 保證書',w/2,70);
  g.fillStyle=c.g==='big'?'#7d1515':c.g==='small'?'#8a4a14':'#4f4a40';g.font='900 74px serif';g.fillText(c.g==='big'?'大吉':c.g==='small'?'小吉':'平',w/2,177);
  g.fillStyle='#39230d';g.font='900 35px "Noto Serif KR",serif';g.fillText(c.label,w/2,245);
  g.strokeStyle='rgba(91,53,16,.5)';g.lineWidth=3;g.beginPath();g.moveTo(52,278);g.lineTo(w-52,278);g.stroke();
  g.strokeStyle='rgba(125,21,21,.35)';g.lineWidth=4;g.beginPath();g.arc(w/2,337,43,0,TAU);g.stroke();
 });}
 // 도장: 붉은 '確定'(가장자리가 번진 둥근 인주)
 const STAMP_TEX=canvasTex(160,160,(g,w,h)=>{
  g.clearRect(0,0,w,h);g.translate(80,80);
  g.fillStyle='rgba(176,20,30,.93)';g.beginPath();for(let i=0;i<40;i++){const a=i/40*TAU,r=62+Math.sin(i*2.7)*2.5+Math.cos(i*5.1)*1.8;i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
  g.fillStyle='rgba(255,230,210,.95)';g.beginPath();g.arc(0,0,52,0,TAU);g.fill();
  g.fillStyle='rgba(176,20,30,.95)';g.beginPath();g.arc(0,0,46,0,TAU);g.fill();
  g.fillStyle='#ffd9b0';g.textAlign='center';g.textBaseline='middle';g.font='900 42px serif';g.fillText('確定',0,2);
 });
 const stampMat=new THREE.MeshBasicMaterial({map:STAMP_TEX,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
 const inkMat=new THREE.MeshBasicMaterial({color:col('#c0202c'),transparent:true,opacity:0,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
 const ringGeo=new THREE.RingGeometry(.9,1,24);

 /* ---- 사람 한 명 ---- */
 function makePerson(parent,i,o={}){
  const s=o.s||1;
  const person=grp(parent,[0,0,0],'beneficiary-'+i);person.scale.setScalar(s);
  const body=grp(person,[0,.015,0],'body');
  const coat=STD(coats[i],{roughness:.78}),skin=STD(skins[i],{roughness:.62}),hair=STD(hairs[i],{roughness:.8}),shirt=STD(shirts[i],{roughness:.8}),tie=STD(ties[i],{roughness:.55});
  mk(capsuleGeo(.095,.16,14),coat,body,{p:[0,.28,0],s:[1.12,1,.72],cast:false,receive:false});
  mk(capsuleGeo(.036,.17,10),coat,body,{p:[0,.415,0],r:[0,0,PI/2],s:[1.1,1,1],cast:false,receive:false});
  mk(new THREE.BoxGeometry(.056,.2,.012),shirt,body,{p:[0,.325,.068],cast:false,receive:false});
  mk(new THREE.ConeGeometry(.02,.12,5),tie,body,{p:[0,.33,.077],r:[0,0,PI],cast:false,receive:false});
  mk(cylGeo(.027,.031,.055,10),skin,body,{p:[0,.485,0],cast:false,receive:false});
  const head=grp(body,[0,.585,0],'head');
  mk(sphere,skin,head,{s:[.068,.084,.062],cast:false,receive:false});
  mk(sphere,hair,head,{p:[0,.05,-.012],s:[.072,.048,.066],cast:false,receive:false});
  mk(sphere,hair,head,{p:[0,.064,.03],s:[.05,.028,.03],cast:false,receive:false});
  for(const sx of [-1,1])mk(earGeo,skin,head,{p:[sx*.066,-.002,0],s:[.014,.024,.012],cast:false,receive:false});
  mk(noseGeo,skin,head,{p:[0,-.004,.068],r:[PI/2,0,0],cast:false,receive:false});
  const face=mk(new THREE.PlaneGeometry(.136,.146),faceMats.normal,head,{p:[0,-.002,.064],cast:false,receive:false});
  function makeArm(side){
   const sh=grp(body,[side*.114,.425,.004],side<0?'armL':'armR');
   const ua=mk(capsuleGeo(.027,UA-.054,10),coat,sh,{p:[0,-UA/2,0],s:[1.12,1,1],cast:false,receive:false});
   const el=grp(sh,[0,-UA,0]);
   const fa=mk(capsuleGeo(.023,FA-.05,10),skin,el,{p:[0,-FA/2,.004],cast:false,receive:false});
   const hand=grp(el,[0,-FA,.008]);
   mk(sphere,skin,hand,{s:[.031,.038,.026],cast:false,receive:false});
   const finger=mk(capsuleGeo(.009,.05,8),skin,hand,{p:[0,-.045,.006],cast:false,receive:false});finger.visible=false;
   return {sh,el,hand,finger,ua,fa,z:0,ez:0,x:0,ex:0};
  }
  const arms={L:makeArm(-1),R:makeArm(1)};
  // 보증서: 가슴 앞에 두 손으로 쥐고 있다가, 들어 올리거나 머리 위로 올린다
  const paper=grp(body,[0,.31,.108],'fate-paper');
  const cert=CERTS[i];
  mk(new THREE.BoxGeometry(.148,.194,.009),STD('#d9d4c8',{roughness:.88}),paper,{cast:false,receive:false});
  mk(new THREE.PlaneGeometry(.142,.188),new THREE.MeshBasicMaterial({map:certTex(cert),side:THREE.DoubleSide,toneMapped:false}),paper,{p:[0,0,.0055],cast:false,receive:false});
  const stamp=mk(new THREE.PlaneGeometry(.066,.066),stampMat,paper,{p:[0,-.06,.0085],cast:false,receive:false});
  const ink=mk(ringGeo,inkMat.clone(),paper,{p:[0,-.06,.009],s:.03,cast:false,receive:false});ink.visible=false;
  for(const sx of [-1,1])mk(sphere,skin,paper,{p:[sx*.068,-.07,.014],s:[.019,.026,.014],cast:false,receive:false});
  return {i,s,cert,root:person,body,head,face,arms,paper,stamp,ink,mood:'normal',
   x:0,y:.015,z:0,ry:0,rx:0,rz:0,py:.31,px:0,pz:.108,prx:0,bob:0,run:0,
   goal:{x:0,z:0,ry:0,y:.015,rx:0,rz:0,py:.31,px:0,pz:.108,prx:0,mood:'normal',arms:'down',speed:9},
   stampT:-1,shakeT:-1,hidden:false};
 }
 const people=[];for(let i=0;i<6;i++)people.push(makePerson(root,i));
 // 1인칭 손 장면 안의 두 사람(0·1번과 같은 사람)
 const grabbers=[makePerson(vmRoot,0,{s:1.3}),makePerson(vmRoot,1,{s:1.3})];

 /* ---- 자세 ---- */
 const adamp=(a,b,l,dt)=>a+wrapPi(b-a)*(1-Math.exp(-l*dt));
 function mood(p,m){p.goal.mood=m;if(p.mood!==m){p.mood=m;p.face.material=faceMats[m]||faceMats.normal;}}
 // 팔: z=어깨 벌림(옆), x=어깨 앞뒤, ez=팔꿈치 안쪽 굽힘
 const ARMS={
  down:{L:[.74,.22,.02],R:[-.74,-.22,.02]},
  run:{L:[.5,.2,.5],R:[-.5,-.2,.5]},
  hold:{L:[.38,.46,.55],R:[-.38,-.46,.55]},          // 가슴 앞에 두 손으로 쥐기
  up:{L:[-PI+.18,.05,.1],R:[PI-.18,-.05,.1]},        // 두 팔 번쩍
  pray:{L:[-PI+.26,.62,.15],R:[PI-.26,-.62,.15]},    // 머리 위에서 두 손 모음
  spread:{L:[1.42,.05,.12],R:[-1.42,-.05,.12]},      // 양팔 벌려 막기
  point:{L:[.6,.2,.1],R:[-.22,0,-1.5]},              // 오른팔을 앞으로 뻗어 손가락질
  cheer:{L:[-PI+.3,.18,.2],R:[PI-.3,-.18,.2]},
 };
 function armPose(p,key,v,dt,l=11){const a=p.arms[key];a.z=adamp(a.z,v[0],l,dt);a.ez=adamp(a.ez,v[1],l,dt);a.x=adamp(a.x,v[2],l,dt);a.sh.rotation.set(a.x,0,a.z);a.el.rotation.set(0,0,a.ez);}

 const state={mode:'hidden',at:0,ev:[],nextSob:0,nextMurmur:0};
 function setMode(m,at){state.mode=m;state.at=at||G.time;}
 function sched(t,fn){state.ev.push({t:state.at+t,fn,done:false});}
 function runEvents(){for(const e of state.ev)if(!e.done&&G.time>=e.t){e.done=true;e.fn();}}
 function clearEvents(){state.ev.length=0;}
 const faceDir=(p,tx,tz)=>Math.atan2(tx-p.goal.x,tz-p.goal.z);

 // 서 있는 자리들
 const SIDES=[[-1.05,.3],[1.05,.3],[-1.18,.62],[1.18,.62],[-1.3,.95],[1.3,.95]];
 const KNEEL=[[-.5,.86],[.5,.86],[-.92,.52],[.92,.52],[-.27,1.16],[.27,1.16]];
 const WALLX=[-.8,-.27,.27,.8];

 function goTo(p,x,z,o={}){const g=p.goal;g.x=x;g.z=z;g.speed=o.speed||9;if(o.ry!=null)g.ry=o.ry;if(o.face)g.ry=faceDir(p,o.face[0],o.face[1]);p.run=1;}
 function stance(p,k){const g=p.goal;
  if(k==='stand'){g.y=.015;g.rx=0;g.py=.31;g.px=0;g.pz=.108;g.prx=0;g.arms='hold';}
  else if(k==='kneel'){g.y=-.13;g.rx=.42;g.py=.3;g.px=0;g.pz=.1;g.prx=-.2;g.arms='hold';}
  else if(k==='bow'){g.y=-.15;g.rx=.95;g.py=.28;g.px=0;g.pz=.12;g.prx=-.5;g.arms='hold';}
  else if(k==='pray'){g.y=-.12;g.rx=.18;g.py=.7;g.px=0;g.pz=.07;g.prx=-.1;g.arms='pray';}
  else if(k==='kneelUp'){g.y=-.1;g.rx=.08;g.py=.68;g.px=0;g.pz=.16;g.prx=-.25;g.arms='up';}
  else if(k==='cheer'){g.y=.015;g.rx=-.08;g.py=.69;g.px=0;g.pz=.17;g.prx=-.25;g.arms='cheer';}
  else if(k==='block'){g.y=.015;g.rx=.05;g.py=.64;g.px=.14;g.pz=.14;g.prx=-.3;g.arms='spread';}
  else if(k==='point'){g.y=.015;g.rx=.12;g.py=.44;g.px=-.16;g.pz=.13;g.prx=-.1;g.arms='point';}
 }
 function showAll(){root.visible=true;for(const p of people){p.root.visible=true;p.hidden=false;}}

 /* ---- 12%: 내 팔 붙잡기(1인칭 손 장면) ---- */
 const grab={on:false,t0:0,w:0,off:0,shaken:false};
 const TAN=Math.tan(THREE.MathUtils.degToRad(30));
 const vat=(nx,ny,d,out)=>out.set(nx*TAN*vmCam.aspect*d,ny*TAN*d,-d);
 const gv1=V3(),gv2=V3(),gv3=V3(),gv4=V3(),gv5=V3(),gq=new THREE.Quaternion();
 function grabStart(at){
  grab.on=true;grab.t0=at;grab.w=0;grab.off=0;grab.shaken=false;vmRoot.visible=true;
  for(const gp of grabbers){gp.root.visible=true;mood(gp,'plead');}
  setMode('grab',at);clearEvents();
  const a0={obj:grabbers[0].head,off:V3(0,.09,0),cam:'vm'},a1={obj:grabbers[1].head,off:V3(0,.09,0),cam:'vm'};
  sched(.42,()=>BUB.say(a0,'잠깐만요! 저 사람 없어지면 제 사주는요?',1.5));
  sched(.95,()=>BUB.say(a1,'우리 애 것도 좋게 나왔단 말이에요!',1.5));
  sched(1.85,()=>BUB.say(a0,'우리 복까지 망치지 마세요!',1.3));
  sched(.05,()=>{AUDIO.murmur(1);});sched(1.1,()=>AUDIO.murmur(.8));
  sched(2.35,()=>{grab.shaken=true;VM.shakeOff();AUDIO.whoosh(.9,'hook');for(const gp of grabbers)mood(gp,'wail');});
  // 뿌리쳐진 둘은 무대 양옆에 서서 설계자를 지켜본다
  sched(2.75,()=>{showAll();for(const i of [0,1]){const p=people[i];p.goal.x=SIDES[i][0]+(i?1:-1)*.9;p.goal.z=SIDES[i][1]+.4;p.x=p.goal.x;p.z=p.goal.z;goTo(p,SIDES[i][0],SIDES[i][1],{face:[0,0],speed:6});stance(p,'stand');mood(p,'warn');}
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
   // 머리 자리(화면 좌표): 들어올 때는 화면 밖에서 미끄러져 들어오고, 뿌리쳐지면 바깥 아래로 튕겨 나간다
   const slide=backOut(sat((t-i*.08)/.55),1.2);
   const nx=s*(lerp(1.4,.76,slide)+grab.off*1.1),ny=lerp(-1.15,-.36,slide)-grab.off*.9;
   vat(nx+trem2*s,ny+trem,.6,gv1);
   gp.root.position.set(gv1.x,gv1.y-.585*gp.s,gv1.z);
   gp.root.rotation.set(-.08+grab.off*.9,-s*.42,s*(.1-grab.off*.5));
   // 두 손으로 내 아래팔을 움켜쥔다(아래팔 위의 두 점)
   VM.handPos(k,gv2);VM.anchorPos(k,gv3);
   gp.root.updateWorldMatrix(true,false);
   for(const ak of ['L','R']){const a=gp.arms[ak];const f=ak==='L'?(i?.1:.24):(i?.24:.1);
    gv4.copy(gv2).lerp(gv3,f);gv4.x+=s*.025;gv4.y+=.015;gv4.z+=.05; // 손목 바로 아래, 팔 앞면을 감아쥔 손(카메라 쪽)
    placeArmIK(gp,a,gv4,s);}
   gp.head.rotation.set(-.22,-s*.3,0);gp.paper.visible=false;gp.arms.L.finger.visible=gp.arms.R.finger.visible=false;
  }
 }
 const iv1=V3(),iv2=V3(),iv3=V3(),iv4=V3(),iq=new THREE.Quaternion(),iq2=new THREE.Quaternion(),DOWN=V3(0,-1,0);
 // 사람 팔을 월드(vm) 좌표의 손 자리로 늘이기: 두 마디 IK
 function placeArmIK(p,a,targetW,s){
  const S=a.sh.getWorldPosition(iv1);const body=p.body;
  const pole=iv3.copy(S).add(iv4.set(s*.25,-.1,.2).applyQuaternion(body.getWorldQuaternion(iq)));
  const L1=UA*p.s,L2=FA*p.s;
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

 /* ---- 10%: 앞을 막아서기 ---- */
 function wallStart(at){
  showAll();setMode('wall',at);clearEvents();
  for(let i=2;i<6;i++){const p=people[i],k=i-2,s=k<2?-1:1;
   p.goal.x=s*2.4;p.goal.z=1.0+k*.08;p.x=p.goal.x;p.z=p.goal.z;p.root.visible=true;p.root.scale.setScalar(1.4);
   goTo(p,WALLX[k]*1.15,1.1,{ry:0,speed:7.5});stance(p,'block');mood(p,'warn');}
  // 2번은 코앞까지 와서 손가락질
  sched(.55,()=>{const p=people[2];p.root.scale.setScalar(1.55);goTo(p,-.2,1.6,{ry:0,speed:7});stance(p,'point');p.arms.R.finger.visible=true;});
  const an=i=>({obj:people[i].head,off:V3(0,.1,0),cam:'main'});
  sched(.75,()=>BUB.say(an(2),'억울하면 당신 것만 다시 써달라고 해요.',1.9));
  sched(1.2,()=>BUB.say(an(4),'저 사람 액운이 우리한테 붙잖아요!',1.5));
  sched(2.0,()=>BUB.say(an(5),'저 사람 하나 때문에 우리 팔자까지 망가져요!',1.5));
  sched(.1,()=>AUDIO.murmur(1.1));sched(1.3,()=>AUDIO.murmur(.9));
  // 비켜서기: 양옆으로 갈라져 설계자 쪽을 보고 선다
  sched(2.95,()=>{for(let i=2;i<6;i++){const p=people[i];p.arms.R.finger.visible=false;p.root.scale.setScalar(1);goTo(p,SIDES[i][0],SIDES[i][1],{face:[0,0],speed:6.5});stance(p,'stand');mood(p,'warn');}});
 }

 /* ---- 8%: 되살리기 ---- */
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
  // 여섯이 뛰어와 설계자 앞에 꿇는다(가까운 사람부터)
  for(let i=0;i<6;i++){const p=people[i];
   if(!p.root.visible||p.hidden){p.goal.x=SIDES[i][0]*1.6;p.goal.z=SIDES[i][1]+.5;p.x=p.goal.x;p.z=p.goal.z;p.root.visible=true;p.hidden=false;}
   const d=i*.09;sched(.12+d,()=>{goTo(p,KNEEL[i][0],KNEEL[i][1],{face:[0,-.1],speed:7.5});stance(p,'stand');mood(p,'wail');});
   sched(1.05+d*1.4,()=>{stance(p,i<2?'bow':'kneel');});
  }
  const an=i=>({obj:people[i].head,off:V3(0,.1,0),cam:'main'});
  sched(1.3,()=>BUB.say(an(0),'설계자님! 눈을 뜨세요!',1.5));
  sched(1.75,()=>BUB.say(an(3),'제 팔자는 어떡해요!',1.4));
  sched(2.3,()=>BUB.say(an(1),'아이고, 이러다 다 끝장나요!',1.4));
  sched(1.0,()=>{state.nextSob=G.time;});
  // 손을 모아 소원을 올린다
  sched(3.0,()=>{for(const p of people){stance(p,'pray');mood(p,'pray');}});
  sched(3.3,()=>BUB.say(an(2),'제 것만은 건드리지 마세요!',1.5));
  sched(3.9,()=>BUB.say(an(4),'우리 애 것만이라도요!',1.4));
  sched(4.5,()=>BUB.say(an(5),'저는 바라는 것도 없어요. 지금 이대로만요!',1.7));
  sched(5.3,()=>BUB.say(an(3),'이대로만 있게 해 주세요!',1.4));
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
  for(let i=0;i<N_W;i++){const w=rev.W[i];wispOrigin(i,w.o);w.c.copy(w.o).lerp(handTarget(wv3),.45);w.c.y+=rnd(.25,.8);w.c.x+=rnd(-.5,.5);w.t0=G.time+(i%2===0?rnd(0,dur*.6):rnd(0,dur*.75));w.dur=i%2===0?rnd(.9,1.4):rnd(1.1,1.9);w.done=false;
   pos[i*3]=w.o.x;pos[i*3+1]=-50;pos[i*3+2]=w.o.z;const warm=rnd(.7,1);c[i*3]=1;c[i*3+1]=.72*warm+.2;c[i*3+2]=.3*warm;}
  pts.geometry.attributes.color.needsUpdate=true;pts.visible=true;
  rev.glow.visible=true;rev.core.visible=true;rev.light.intensity=0;
  AUDIO.charge(dur+.9,1);
 }
 // 불씨가 모이는 자리: 설계자가 든 손바닥 위(손이 없으면 가슴)
 function handTarget(out){
  const E=rev.E||G.E;if(!E)return out.set(0,1,0);
  const side=E.reviveArm||'R';const a=E.arms[side==='L'?0:1];
  if(a&&E.armUsable(side)&&E.revive&&E.revive.k>.2){a.wr.updateWorldMatrix(true,false);return out.set(0,-.07,.02).applyMatrix4(a.wr.matrixWorld).add(wv2.set(0,.07,0));}
  E.bones.chest.updateWorldMatrix(true,false);return E.bones.chest.getWorldPosition(out).add(wv2.set(0,.05,.16));
 }
 function impact(){
  rev.impact=true;rev.gather=false;
  const pts=rev.wisps,pos=pts.geometry.attributes.position.array;for(let i=0;i<N_W;i++)pos[i*3+1]=-50;pts.geometry.attributes.position.needsUpdate=true;pts.visible=false;
  rev.sphere=1;
  for(const p of people){p.shakeT=G.time;mood(p,'pray');}
 }
 function restamp(){
  for(let i=0;i<6;i++){const p=people[i];sched(i*.11,()=>{p.stampT=G.time;AUDIO.stamp(1);goTo(p,p.x,p.z,{face:[CAM.pos.x,CAM.pos.z],speed:6});stance(p,'cheer');mood(p,'cheer');});}
 }
 function cheer(){
  for(let i=0;i<6;i++){const p=people[i];stance(p,'cheer');mood(p,'cheer');p.goal.y=.015;}
  const an=i=>({obj:people[i].head,off:V3(0,.1,0),cam:'main'});
  AUDIO.cheer(1.2);
  sched(0,()=>BUB.say(an(1),'살아나셨다!',1.3));
  sched(.35,()=>BUB.say(an(4),'설계자님 만세!',1.4));
  sched(.8,()=>BUB.say(an(0),'역시 운명은 정해져 있었어!',1.6));
  sched(1.35,()=>BUB.say(an(2),'제 大吉 그대로예요!',1.4));
  sched(1.2,()=>AUDIO.cheer(.9));
 }
 function sides(){
  for(let i=0;i<6;i++){const p=people[i];goTo(p,SIDES[i][0],SIDES[i][1],{face:[0,0],speed:5.5});stance(p,'cheer');mood(p,'cheer');}
  sched(1.6,()=>{for(const p of people){stance(p,'stand');mood(p,'normal');}});
  sched(2.2,()=>{rev.on=false;rev.glow.visible=false;rev.core.visible=false;rev.light.intensity=0;});
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
    const a=1-e;wv1.set(a*a*w.o.x+2*a*e*w.c.x+e*e*T.x,a*a*w.o.y+2*a*e*w.c.y+e*e*T.y,a*a*w.o.z+2*a*e*w.c.z+e*e*T.z);
    wv1.y+=Math.sin(G.time*9+i)*.012*(1-e);
    pos[i*3]=wv1.x;pos[i*3+1]=wv1.y;pos[i*3+2]=wv1.z;}
   rev.arrived=arrived;pts.geometry.attributes.position.needsUpdate=true;
   rev.sphere=damp(rev.sphere,arrived/N_W,6,dt);
  }
  // 손바닥 위 구체와 빛
  if(rev.glow.visible){
   const T=handTarget(wv3);const s=rev.sphere;
   rev.glow.position.copy(T);rev.core.position.copy(T);rev.light.position.copy(T);
   const pul=1+Math.sin(G.time*14)*.06*s;
   rev.glow.scale.setScalar((.12+1.25*s)*pul);rev.core.scale.setScalar((.012+.11*s)*pul);rev.light.intensity=3.2*s;
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
   const ty=g.y+bob+(shake?Math.sin(now*28)*.012*shake:0);
   p.y=damp(p.y,ty,12,dt);p.rx=adamp(p.rx,g.rx+.28*p.run-.2*shake,9,dt);p.rz=adamp(p.rz,g.rz+(shake?Math.sin(now*31+p.i)*.06*shake:0),9,dt);
   p.py=damp(p.py,g.py,11,dt);p.px=damp(p.px,g.px,11,dt);p.pz=damp(p.pz,g.pz,11,dt);p.prx=adamp(p.prx,g.prx,10,dt);
   p.root.position.set(p.x,0,p.z);p.root.rotation.y=p.ry;p.body.position.y=p.y;p.body.rotation.set(p.rx,0,p.rz);
   p.paper.position.set(p.px,p.py,p.pz);p.paper.rotation.x=p.prx;
   const A=ARMS[p.run>.5&&!['pray','up','cheer'].includes(g.arms)?'run':g.arms]||ARMS.down;
   armPose(p,'L',A.L,dt);armPose(p,'R',A.R,dt);
   mood(p,g.mood||p.mood);
   const cry=p.mood==='wail'||p.mood==='pray';
   p.head.rotation.set(g.arms==='pray'?-.35:cry?-.1:0,0,cry?Math.sin(now*11+p.i)*.07:0);
   // 도장 찍기: 크게 떠 있다가 쾅 내려앉고 인주가 번진다
   if(p.stampT>=0){const u=(now-p.stampT)/.2;if(u<1){const e=easeIn3(u);p.stamp.scale.setScalar(lerp(2.4,1,e));p.stamp.position.z=.0085+lerp(.05,0,e);p.stamp.material=stampMat;}
    else{p.stamp.scale.setScalar(1);p.stamp.position.z=.0085;const v=(now-p.stampT-.2)/.4;if(v<1){p.ink.visible=true;p.ink.scale.setScalar(.03+v*.075);p.ink.material.opacity=.6*(1-v);}else{p.ink.visible=false;p.stampT=-1;}}}
  }
  if(state.mode==='revive'&&!rev.impact&&now>=state.nextSob&&people.some(p=>p.mood==='wail'||p.mood==='pray')){AUDIO.voice('sob',.4);state.nextSob=now+rnd(.6,1.0);}
  reviveUpdate(dt);
 }
 function hide(){setMode('retreat');for(const p of people){const s=p.x<0?-1:1;goTo(p,p.x+s*1.2,p.z+.3,{ry:p.ry,speed:6});}sched(.9,()=>{root.visible=false;for(const p of people)p.hidden=true;state.mode='hidden';});}
 function reset(){
  state.mode='hidden';state.ev.length=0;state.nextSob=0;root.visible=false;vmRoot.visible=false;
  grab.on=false;grab.w=0;grab.off=0;grab.shaken=false;
  rev.on=false;rev.gather=false;rev.impact=false;if(rev.wisps){rev.wisps.visible=false;rev.glow.visible=false;rev.core.visible=false;rev.light.intensity=0;rev.glow.material.opacity=1;}
  for(const p of [...people,...grabbers]){p.root.visible=false;p.hidden=true;p.root.scale.setScalar(p.s);p.x=p.z=0;p.y=.015;p.ry=p.rx=p.rz=0;p.run=0;p.bob=0;p.stampT=-1;p.shakeT=-1;p.stamp.scale.setScalar(1);p.stamp.position.z=.0085;p.ink.visible=false;
   Object.assign(p.goal,{x:0,z:0,ry:0,y:.015,rx:0,rz:0,py:.31,px:0,pz:.108,prx:0,mood:'normal',arms:'hold',speed:9});mood(p,'normal');
   for(const k of ['L','R']){const a=p.arms[k],v=ARMS.hold[k];a.z=v[0];a.ez=v[1];a.x=v[2];a.sh.rotation.set(a.x,0,a.z);a.el.rotation.set(0,0,a.ez);a.finger.visible=false;}
   p.paper.visible=true;p.paper.position.set(0,.31,.108);p.paper.rotation.set(0,0,0);p.head.rotation.set(0,0,0);p.body.position.y=.015;p.body.rotation.set(0,0,0);p.root.position.set(0,0,0);p.root.rotation.set(0,0,0);}
  BUB.clear();VM.setGrab('L',0);VM.setGrab('R',0);
 }
 return {root,people,reset,update,hide,grabStart,wallStart,reviveStart,gatherStart,impact,restamp,cheer,sides,handTarget,get mode(){return state.mode;},get rev(){return rev;}};
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
 function emit(kind,p,v,size,life){const arr=parts[kind];const d=arr[cursor[kind]++%arr.length];d.p.copy(p);d.v.copy(v);d.size=size;d.life=life;d.age=0;d.on=true;return d;}
 function spray(p,dir,n,o={}){
  const kind=PREF.blood?(o.kind||'blood'):'dust';
  // 파란 방울은 많으면 구슬처럼 보여 얼굴을 덮는다: 개수와 크기를 조금 줄인다
  if(kind==='blood')n=Math.ceil(n*.72);
  for(let i=0;i<n;i++){const sp=rnd(o.min||.8,o.max||3.2);v1.copy(dir).multiplyScalar(sp).add(v2.set(rnd(-1,1),rnd(-.4,1),rnd(-1,1)).multiplyScalar(o.spread||1));
   if(kind==='dust'){v1.multiplyScalar(.3);emit('dust',p,v1,rnd(.008,.018),rnd(.3,.55));}else emit(kind,p,v1,kind==='spit'?rnd(.002,o.smax||.0045):rnd(o.smin||.0026,Math.min(.0064,o.smax||.0064)),rnd(.6,1.4));}
 }
 /* ---- 바닥·옥좌 등받이에 그리기 ---- */
 const FL={x0:-1.6,z0:-1.45,w:3.2,h:3.2,res:1024};
 const flTex=canvasTex(FL.res,FL.res,()=>{});const flCtx=flTex.userData.ctx;
 const flMat=STD('#ffffff',{map:flTex,transparent:true,roughness:.1,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const flMesh=mk(new THREE.PlaneGeometry(FL.w,FL.h),flMat,scene,{p:[FL.x0+FL.w/2,.004,FL.z0+FL.h/2],r:[-PI/2,0,0],cast:false});flMesh.renderOrder=1;
 const pool=new Float32Array(64*64);let flDirty=false,flUploadAcc=0;
 function floorUV(x,z){return [(x-FL.x0)/FL.w*FL.res,(z-FL.z0)/FL.h*FL.res];}
 function blob(g,x,y,r,col_,a){g.globalAlpha=a;g.fillStyle=col_;g.beginPath();g.ellipse(x,y,r,r*rnd(.75,1),rnd(0,PI),0,TAU);g.fill();g.globalAlpha=1;}
 function paintFloor(x,z,vol,impact){
  if(!PREF.blood)return;const [u,v]=floorUV(x,z);if(u<0||v<0||u>FL.res||v>FL.res)return;
  const ci=clamp(Math.floor(u/16),0,63)+clamp(Math.floor(v/16),0,63)*64;pool[ci]+=vol;
  const r=clamp(Math.sqrt(pool[ci])*95,3,70);
  blob(flCtx,u+rnd(-3,3),v+rnd(-3,3),r*rnd(.6,1),'#13328f',.55);blob(flCtx,u,v,r*.55,'#1a45bd',.45);
  if(impact>2.5){for(let i=0;i<4;i++){const a=rnd(0,TAU),d=rnd(6,22);blob(flCtx,u+Math.cos(a)*d,v+Math.sin(a)*d,rnd(1.5,4),'#173da8',.8);}}
  flDirty=true;
 }
 function poolUnder(x,z,amount){if(!PREF.blood||amount<=0)return;const [u,v]=floorUV(x,z);const ci=clamp(Math.floor(u/16),0,63)+clamp(Math.floor(v/16),0,63)*64;pool[ci]+=amount;const r=clamp(Math.sqrt(pool[ci])*90,4,190);blob(flCtx,u+rnd(-6,6),v+rnd(-6,6),r,'#12308a',.18);flDirty=true;}
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
 // 얼굴에 흐르는 피는 양을 정해 둔다(얼굴이 피로 다 덮이면 표정이 안 보인다).
 // 다 차면 예전 핏줄기는 2초 동안 옅어지며 사라지고 새로 흐르기 시작한다
 const FACE_SEG=/^(head|jaw)$/,fading=[];
 function bank(seg,kind){
  const key=seg+':'+kind,face=FACE_SEG.test(seg)&&kind!=='tear',bone=E.bones[seg];let b0=banks[key];
  // 잘려 나간 뼈에 붙은 묶음이면(같은 이름으로 다시 자란 경우) 새로 만든다
  if(b0&&b0.bone!==bone){delete banks[key];b0=null;}
  if(b0&&b0.count<b0.MAXP-(face?20:80))return b0;
  if(b0&&face)fadeBank(b0,key);
  if(!bone)return null;
  const MAXP=face?260:1400,P=new Float32Array(MAXP*2*3),N=new Float32Array(MAXP*2*3),I=new Uint32Array(MAXP*6);
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
  // 너클 자국: 고리 네 개가 눌린 붉은 자국과 둘레 멍
  knuckle:canvasTex(256,128,(g,w,h)=>{
   const halo=g.createRadialGradient(128,64,10,128,64,122);halo.addColorStop(0,'rgba(150,36,66,.32)');halo.addColorStop(.7,'rgba(170,52,70,.16)');halo.addColorStop(1,'rgba(170,52,70,0)');
   g.save();g.scale(1,.5);g.fillStyle=halo;g.beginPath();g.arc(128,128,124,0,TAU);g.fill();g.restore();
   for(let i=0;i<4;i++){const x=50+i*52+rnd(-3,3),y=64+(i===0||i===3?6:0)+rnd(-3,3);
    const f=g.createRadialGradient(x,y,2,x,y,22);f.addColorStop(0,'rgba(120,20,48,.55)');f.addColorStop(1,'rgba(150,30,56,0)');g.fillStyle=f;g.beginPath();g.arc(x,y,22,0,TAU);g.fill();
    g.lineWidth=7;g.strokeStyle='rgba(176,22,40,.78)';g.beginPath();g.ellipse(x,y,18,15,0,0,TAU);g.stroke();
    g.lineWidth=2.5;g.strokeStyle='rgba(255,170,160,.35)';g.beginPath();g.ellipse(x,y+3,17,14,0,.15*PI,.85*PI);g.stroke();}
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
  const sx=size*(o.aspect||1),sy=size,G=o.grid||5,pos=[],uv=[],idx=[],inv=_inv(bone).clone();
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const a=i/G-.5,b=j/G-.5;const guess=pW.clone().addScaledVector(cu,a*sx*2).addScaledVector(cv,b*sy*2);
   const hit=project(guess,n,.05,o.meshes),hp=hit?hit.point:guess,hn=hit?hit.normal:n;
const p=hp.clone().addScaledVector(hn,DLIFT[type]||.0012);p.applyMatrix4(inv);pos.push(p.x,p.y,p.z);uv.push(i/G,j/G);}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;idx.push(a,b,c,b,d,c);}
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
     if(kind==='blood'&&d.v.z<0&&d.p.z<-1.05&&d.p.z>-1.16){if(paintPanel(d.p,d.size*1.6)){d.on=false;continue;}}
     // 화면 쪽으로 날아온 피는 화면에 묻는다
     if(kind==='blood'&&d.v.z>0&&d.p.z>camera.position.z-.42){d.on=false;const s=v1.copy(d.p).project(camera);if(Math.abs(s.x)<1&&Math.abs(s.y)<1&&Math.random()<.5)SB.add((s.x*.5+.5)*sw,(-s.y*.5+.5)*sh,rnd(7,15));continue;}
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
  flUploadAcc=Math.min(1/15,flUploadAcc+dt);
if(flDirty&&flUploadAcc>=1/15){
 flTex.needsUpdate=true;
 flDirty=false;
 flUploadAcc=0;
}
  for(let i=fading.length-1;i>=0;i--){const b=fading[i];b.fade-=dt/2;b.mesh.material.opacity=Math.max(0,b.fade)*(b.op0==null?1:b.op0);
   if(b.fade<=0){b.mesh.removeFromParent();b.g.dispose();b.mesh.material.dispose();const k=bankList.indexOf(b);if(k>=0)bankList.splice(k,1);fading.splice(i,1);}}
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
  flCtx.clearRect(0,0,FL.res,FL.res);
flTex.needsUpdate=true;
flDirty=false;
flUploadAcc=0;
pool.fill(0);
  if(pnCtx&&pnSaved){pnCtx.clearRect(0,0,pnCanvas.width,pnCanvas.height);pnCtx.drawImage(pnSaved,0,0);WORLD.panelTex.needsUpdate=true;}
  SB.clear();lostRaw=0;heart=0;
 }
 // 부활 때는 무대에 남은 피·살점·잔해와 누적 출혈량은 보존하고,
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
 /* 살이 찌그러지면 그 뼈에 붙은 피(자국·줄기·방울·상처 자리)도 같이 옮긴다. fn(v: 뼈 좌표 점)이 v를 옮기고 옮겼으면 true */
 const _ov=V3();
 function deformOverlays(bone,fn){
  for(const m of decals){if(m.parent!==bone)continue;const P=m.geometry.attributes.position;let ch=false;for(let i=0;i<P.count;i++){_ov.set(P.getX(i),P.getY(i),P.getZ(i));if(fn(_ov)){P.setXYZ(i,_ov.x,_ov.y,_ov.z);ch=true;}}if(ch){P.needsUpdate=true;m.geometry.computeBoundingSphere();}if(m.userData.center)fn(m.userData.center);}
  for(const b of bankList){if(b.bone!==bone||!b.pts)continue;let ch=false;
   for(let i=0;i<b.count;i++){const q=b.pts[i];if(fn(q.p)){ch=true;const k=i*6;for(const o of [0,3]){_ov.set(b.P[k+o],b.P[k+o+1],b.P[k+o+2]);fn(_ov);b.P[k+o]=_ov.x;b.P[k+o+1]=_ov.y;b.P[k+o+2]=_ov.z;}}}
   if(ch){b.g.attributes.position.needsUpdate=true;b.g.computeBoundingSphere();}}
  for(const m of rims)if(m.parent===bone)fn(m.position);
  for(const l of lumps)if(l.bone===bone)fn(l.mesh.position);
  for(const x of beads)if(x.bone===bone)fn(x.lp);
  for(const x of drips)if(x.bone===bone)fn(x.lp);
  for(const x of rivs)if(x.bone===bone)fn(x.lp);
  for(const w of wounds)if(w.bone===bone){fn(w.lp);if(w.line){fn(w.line[0]);fn(w.line[1]);}}
 }
 return {spray,emit,startRiv,addWound,decal,rim,lump,project,paintFloor,paintPanel,clearSegment,detachTree,forgetTree,clearAbove,clearDecalsNear,stopNear,fadeSeg,deformOverlays,update,reset,rebindKeepStage,screen:SB,get rawLost(){return lostRaw;},get lost(){return LOSTMAX*(1-Math.exp(-lostRaw/2.4));},get bleedRate(){let t=0;for(const w of wounds)t+=w.rate0*Math.exp(-w.age/w.tau);return t;},wounds,rivs};
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
  if(!layer)return;if(!o.force&&clock-lastWord<.15)return;lastWord=clock;
  const p=pos.clone().project(camera);if(p.z>1)return;
  const W=innerWidth,H=innerHeight;
  const x=clamp((p.x*.5+.5)*W+rnd(-26,26)+(o.dx||0),40,W-40),y=clamp((-p.y*.5+.5)*H+rnd(-46,-16)+(o.dy||0),90,H-150);
  const el=document.createElement('div');el.className='pop';
  const sz=(o.size||48)*clamp(Math.min(W,H)/390,.85,1.35),dur=o.dur||.58,shc=o.color||'#d8352a';
  el.style.cssText=`left:${x}px;top:${y}px;font-size:${sz}px;--sh:${shc};--r:${(o.rot!=null?o.rot:rnd(-11,11)).toFixed(1)}deg;--sw:${Math.max(4,sz*.11).toFixed(1)}px;--ox:${(sz*.11).toFixed(0)}px;--oy:${(sz*.13).toFixed(0)}px;--d:${dur}s`;
  // 한 글자씩: 흔들린 각도·세로 지터로 손으로 쓴 느낌 + 끝에 바깥으로 흩어진다
  const chars=[...text];
  for(let i=0;i<chars.length;i++){const sp=document.createElement('i');sp.textContent=chars[i];
   const ang=rnd(0,TAU),dist=sz*rnd(.5,1.15);
   sp.style.cssText=`--lr:${rnd(-9,9).toFixed(1)}deg;--ls:${rnd(-45,45).toFixed(0)}deg;--lj:${rnd(-.07,.07)*sz|0}px;--lx:${(Math.cos(ang)*dist)|0}px;--ly:${(Math.sin(ang)*dist-sz*.35)|0}px;animation-delay:${(i*.02).toFixed(3)}s`;
   el.appendChild(sp);}
  layer.appendChild(el);while(layer.childElementCount>3)layer.firstElementChild.remove();
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
 return {add,lift,word,update,clear,scene:over};
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
   let s=c.s;if(c.age>40)s*=Math.max(0,1-(c.age-40)/4);
   dummy.position.copy(c.p);dummy.quaternion.copy(c.q);dummy.scale.set(s,c.sy*(s/c.s||0),c.sz*(s/c.s||0));dummy.updateMatrix();im.setMatrixAt(c.i,dummy.matrix);
  }
  im.instanceMatrix.needsUpdate=true;im.visible=PREF.blood!==false||true;
 }
 function clear(){L.length=0;cur=0;im.count=0;}
 return {spawn,burst,update,clear,get count(){return L.length;}};
})();
/* ===== 6. 운명 설계자 — 모양 =====
 * 동서양 신을 섞은 운명의 주인. 겉은 흰 비단 예복·면류관·금관·후광, 속은 와이셔츠와 넥타이를 맨 부자, 더 속은 파충류. */
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥',GAN_KO='갑을병정무기경신임계',ZHI_KO='자축인묘진사오미신유술해';
function pillarsKo(result){
 try{const ps=result&&result.reading&&result.reading.pillars;if(!ps)return null;
  return ps.map(p=>p&&p.known&&p.gz?(GAN_KO[GAN.indexOf(p.gz[0])]||'')+(ZHI_KO[ZHI.indexOf(p.gz[1])]||''):null);}catch(_){return null;}
}

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
 const src=ROBE_TEX.userData.canvas;
 for(let i=0;i<2;i++)for(let j=0;j<2;j++)g.drawImage(src,i*w/2,j*h/2,w/2,h/2);
 const PX=w/(TAU*o.R),PY=h/(PI*o.Rm),cx=w*.25;
 const th=y=>y/h*PI,sn=y=>Math.max(.16,Math.sin(th(y)));
 const X=(y,m)=>cx+m*PX/sn(y),half=y=>o.half(th(y)*180/PI);
 const SW=o.sw,ys=[];for(let y=0;y<=h;y+=3)ys.push(y);
 const band=(m0,m1,fill)=>{g.beginPath();ys.forEach((y,i)=>{const x=X(y,m0(y));i?g.lineTo(x,y):g.moveTo(x,y);});for(let i=ys.length-1;i>=0;i--)g.lineTo(X(ys[i],m1(ys[i])),ys[i]);g.closePath();g.fillStyle=fill;g.fill();};
 const line=(m,col_,lw)=>{g.beginPath();ys.forEach((y,i)=>{const x=X(y,m(y));i?g.lineTo(x,y):g.moveTo(x,y);});g.strokeStyle=col_;g.lineWidth=lw;g.stroke();};
 // 셔츠: 하늘색 + 가는 세로 줄무늬 + 가운데 단춧단
 band(y=>-half(y)-.004,y=>half(y)+.004,'#cfe1f5');
 for(let m=-.1;m<=.1;m+=.0105)line(y=>clamp(m,-half(y),half(y)),'rgba(112,146,202,.45)',1.6);
 band(y=>-.012,y=>.012,'#d9e8f8');line(()=>-.012,'rgba(96,128,182,.6)',2);line(()=>.012,'rgba(96,128,182,.6)',2);
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
  band(y=>sd*half(y),y=>sd*(half(y)+SW),'#4f3399');
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
/* 금관 정면 문양: 빛살 + 삼각형 속 눈 */
const CROWN_EYE_TEX=canvasTex(128,128,(g,w,h)=>{drawEyeTri(g,64,70,78,{fill:'#f3c24c',edge:'#5a3a08',gold:'#fff0a8',iris:'#5b3ea6',rays:'#ffd86a'});});
/* 파충류 눈(금빛 홍채 + 세로로 찢어진 동공): 결과 화면 도사와 같은 색 */
const REP_IRIS_TEX=canvasTex(128,128,(g,w,h)=>{
 const r=g.createRadialGradient(52,46,4,64,64,62);r.addColorStop(0,'#fff7a8');r.addColorStop(.4,'#ffd21c');r.addColorStop(.85,'#e08a00');r.addColorStop(1,'#a85600');
 g.fillStyle=r;g.beginPath();g.arc(64,64,62,0,TAU);g.fill();g.lineWidth=5;g.strokeStyle='#7a3e00';g.stroke();
 g.fillStyle='#120c1a';g.beginPath();g.moveTo(64,8);g.bezierCurveTo(79,40,79,88,64,120);g.bezierCurveTo(49,88,49,40,64,8);g.fill();
 g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.arc(86,38,9,0,TAU);g.fill();
});
/* 도마뱀 살갗(이어 붙는 비늘). 쓰는 곳마다 비늘 크기가 맞게 반복 횟수만 다른 복사본을 쓴다 */
const LIZ_SRC=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#31501a';g.fillRect(0,0,w,h);drawScales(g,w,h,25.6,256/14,['#3c6418','#6f9e2c','#b6d65a','#86ad38','#24400f']);});
const LIZ_TEX=(()=>{const cache={};return (u,v)=>{const k=u+'x'+v;if(cache[k])return cache[k];const t=LIZ_SRC.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(u,v);return cache[k]=t;};})();
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
 /* 도마뱀 머리(다시 자라는 머리): 납작하고 뒤가 넓은 두개골, 길게 튀어나온 주둥이, 불거진 눈두덩, 볼 비늘판, 콧구멍 틈, 입 선 */
 function rep(x,y,z){
  const ax=Math.abs(x);
  // 뒤가 넓고 납작한 두개골 + 길고 각진 주둥이
  let d=ell(x,y,z,0,.07,-.035,.158,.155,.188);
  d=smin(d,cap(x,y,z,0,.012,.05,0,-.03,.266,.104,.043),.018);
  d=smin(d,ell(x,y,z,0,.03,.14,.108,.071,.104),.022);
  // 바깥으로 뻗은 안와 융기와 덜 둥근 볼판
  d=smin(d,cap(ax,y,z,.018,.112,.16,.132,.084,.105,.034,.014),.006);
  d=smin(d,ell(ax,y,z,.102,-.036,.05,.078,.068,.092),.022);
  // 깊고 경계가 분명한 눈구멍 + 이마에서 콧등으로 이어지는 능선
  d=smax(d,-ell(ax,y,z,.091,.049,.153,.049,.04,.039),.005);
  d=smin(d,cap(x,y,z,0,.084,.11,0,.028,.274,.024,.013),.006);
  d=smax(d,-ell(ax,y,z,.021,-.016,.272,.008,.0055,.013),.005);
  d=smax(d,-cap(ax,y,z,0,-.062,.262,.112,-.058,.04,.0055,.006),.008);
  d=smin(d,ell(x,y,z,0,-.125,-.025,.13,.1,.13),.035);
  return d;
 }
 // 도마뱀 아래턱(턱뼈 자리 (0,-.07,-.03)를 빼서 붙인다)
 function repJaw(x,y,z){
  let d=cap(x,y,z,0,-.075,.02,0,-.07,.235,.068,.034);
  d=smin(d,ell(x,y,z,0,-.1,.06,.085,.04,.1),.04);
  return d;
 }
 function tintRep(x,y,z,c){
  // 비늘맵의 색을 살리고 정수리·턱밑·안와에만 약한 색 차이를 준다.
  const top=smooth((y+.02)/.12),belly=smooth((-.05-y)/.06)*smooth((z+.05)/.1);
  const brow=Math.exp(-(((Math.abs(x)-.09)**2)/(2*.032*.032)+((y-.095)**2)/(2*.018*.018)));
  c.setRGB(.93-.06*top+.05*belly+.09*brow,.99-.03*top+.02*belly+.05*brow,.90-.08*top+.05*belly-.08*brow);
 }
 function build(){
  if(G.head)return G;
  G.head=SCULPT.star(human,V3(0,-.012,.004),136,104,.33,{tint:tintHuman});
  G.rep=SCULPT.star(rep,V3(0,.0,.02),136,104,.34,{tint:tintRep,smooth:0});
  G.repJaw=SCULPT.star(repJaw,V3(0,-.075,.12),72,48,.2,{tint:(x,y,z,c)=>{c.setRGB(1.02,1.0,.56);}});
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
  G.farm=SCULPT.tube(V3(0,.01,0),V3(0,-.137,0),fold(t=>lerp(.1,.112,t),.045,2.9),44,13,{cap:3,capScale:.3});
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
 return {belly,chest,onSurf,build};
})();

class Emperor{
 constructor(result){
  this.result=result;
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
   crownEye:S('#ffffff',{map:CROWN_EYE_TEX,roughness:.32,metalness:.35,transparent:true,alphaTest:.45}),
   repIris:S('#ffffff',{map:REP_IRIS_TEX,roughness:.18,emissive:col('#ffffff'),emissiveMap:REP_IRIS_TEX,emissiveIntensity:.28}),
   mem:S('#ffffff',{map:MEM_TEX,transparent:true,depthWrite:false,roughness:.08,metalness:0}),fork:S('#d81b47',{roughness:.3}),
   gold:S('#e4ae46',{metalness:.78,roughness:.3}),goldD:S('#a6731d',{metalness:.7,roughness:.42}),jade:S('#3b9a72',{roughness:.26}),jadeL:S('#8fd8b2',{roughness:.22}),
   lacquer:S('#171418',{roughness:.42,envMapIntensity:.35}),lacRed:S('#a51f18',{roughness:.45}),hair:S('#1f1919',{roughness:.6}),hairG:S('#77706b',{roughness:.6}),
   eyeW:S('#fbf7ee',{roughness:.16}),iris:S('#5b3520',{roughness:.22}),pupil:S('#090606',{roughness:.2}),lash:S('#181212',{roughness:.6}),hl:S('#ffffff',{emissive:col('#ffffff'),emissiveIntensity:.6,roughness:.1}),
   teeth:S('#f6efdc',{roughness:.28}),gum:S('#c25660',{roughness:.45}),mouth:S('#3a0a10',{roughness:.7,side:THREE.DoubleSide}),tongue:S('#cc5f66',{roughness:.42}),
   boot:S('#1b1718',{roughness:.36}),sole:S('#3a2a20',{roughness:.6}),trouser:S('#ffffff',{map:TROUSER_TEX,roughness:.62}),lining:S('#6a4cc0',{roughness:.7,side:THREE.BackSide}),
   beadJ:S('#5fc59a',{roughness:.2}),beadR:S('#d2402f',{roughness:.25}),beadW:S('#f6f0e2',{roughness:.25}),cord:S('#cf2f24',{roughness:.6}),
   tablet:S('#ffffff',{roughness:.22}),
   // 사람 가죽 밑: 도마뱀 살(비늘)·발톱·파란 속
   liz:S('#ffffff',{map:LIZ_TEX(3,1),roughness:.4}),lizHand:S('#ffffff',{map:LIZ_TEX(1,1),roughness:.4}),lizIn:S('#9fd06a',{roughness:.5,side:THREE.DoubleSide}),
   claw:S('#f3ebd2',{roughness:.22}),blueCore:S('#1b45c4',{roughness:.2,emissive:col('#0a1c66'),emissiveIntensity:.35,side:THREE.DoubleSide}),
   lizEye:S('#ffffff',{map:REP_IRIS_TEX,roughness:.12,emissive:col('#ffffff'),emissiveMap:REP_IRIS_TEX,emissiveIntensity:.45}),lizEyeBall:S('#3a4a12',{roughness:.3}),
   // 배 속(돼지저금통): 갈라진 천 가장자리
   slitLip:S('#f5eedf',{roughness:.6,side:THREE.DoubleSide}),
  };
  this.M.cavity=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});D.push(this.M.cavity);
  for(const k of ['liz','lizHand'])this.M[k].map.needsUpdate=true;
  this.M.tablet.map=makeTabletTex(this.result);D.push(this.M.tablet.map);
  // 빚은 살(꼭짓점 색으로 코끝·볼·눈가 혈색)과 뒷머리
  const M=this.M;
  M.flesh=S('#eda882',{roughness:.48,vertexColors:true});M.hairF=S('#231b1b',{roughness:.62});
  M.lizHead=S('#ffffff',{map:LIZ_TEX(4,3),roughness:.68,vertexColors:true});
  // 찌그러지고 파이는 살 셰이더: 살·옷·바지·도마뱀
  for(const k of ['flesh','skin'])FLESH.patch(M[k],'skin',{sss:1});
  for(const k of ['robe','hem','belly','chest','hairF'])FLESH.patch(M[k],'cloth');
  FLESH.patch(M.trouser,'trouser');for(const k of ['liz','lizHand','lizHead'])FLESH.patch(M[k],'liz',{meatScale:60,sss:.5});
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
  this.belly=this.addFlesh(BG.belly.clone(),M.belly,spine,{part:'belly',center:BELLY_C,maxFrac:.42,maxAbs:.16,minEdge:.007});
  // 옥대: 배 밑에 걸친 보라 띠 + 옥 장식
  const belt=grp(spine,[0,.035,.045]);belt.rotation.x=.2;this.belt=belt;
  mk(new THREE.TorusGeometry(.305,.026,10,56),M.red,belt,{r:[PI/2,0,0],s:[1,.93,1],part:'belly'});
  mk(new THREE.TorusGeometry(.306,.008,6,56),M.gold,belt,{p:[0,.02,0],r:[PI/2,0,0],s:[1,.93,1],cast:false});
  for(let i=-3;i<=3;i++){const a=i*.28+PI/2,x=Math.cos(a)*.305,z=Math.sin(a)*.284;const pl=mk(new THREE.BoxGeometry(.062,.05,.02),i===0?M.gold:M.jadeL,belt,{p:[x,0,z],part:'belly'});pl.rotation.y=-(a-PI/2);if(i===0)mk(sphereGeo(16),M.jade,belt,{p:[x,0,z+.014],s:[.022,.018,.01],cast:false});}
  // 옷자락: 허리띠 아래로 옆과 뒤만 두르고 앞은 터 있다(바지 입은 다리가 보이게). 안감은 보라
  this.apronF=grp(pelvis,[0,.07,0]);this.apronB=grp(pelvis,[0,.08,0]);
  {const gap=1.02,geo=new THREE.CylinderGeometry(.315,.4,.36,40,1,true,gap,TAU-gap*2);
   this.apronBMesh=mk(geo,M.hem,this.apronB,{p:[0,-.18,0],part:'pelvis',flow:true});
   mk(geo,M.lining,this.apronB,{p:[0,-.18,0],s:[.992,1,.992],cast:false});}
  this.apronFMesh=null;
  // 가슴(어깨 위 살·가슴살까지 한 덩어리)
  const chest=this.bone('chest',spine,[0,.24,-.01]);
  this.chestMesh=this.addFlesh(BG.chest.clone(),M.chest,chest,{part:'chest',center:V3(0,.13,0),maxFrac:.4,maxAbs:.12,minEdge:.007});
  // 깃: 와이셔츠 깃(목둘레). 앞섶과 영대는 가슴·배 그림에 그려져 있다
  mk(new THREE.TorusGeometry(.125,.028,10,40),M.shirt,chest,{p:[0,.29,.035],r:[PI/2+.38,0,0],s:[1,1.05,1],part:'chest'});
  this._tie(chest);
  // 목
  const neck=this.bone('neck',chest,[0,.265,0]);
  this.neckMesh=this.addFlesh(BG.neck.clone(),M.skin,neck,{part:'neck',axisA:V3(0,-.04,.02),axisB:V3(0,.125,.028),maxFrac:.45,maxAbs:.06});
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
   const sh=this.bone('shoulder'+nm,this.bones.chest,[s*.265,.19,-.01]);
   const BG=BODYGEO.build(),ap='arm'+nm,ax=(a,b)=>({axisA:V3(0,a,0),axisB:V3(0,b,0)});
   this.addFlesh(BG.shoulder.clone(),M.robe,sh,Object.assign({part:ap,center:V3(0,-.05,0),maxFrac:.4,maxAbs:.06}));
   const um=this.bone('uarmMid'+nm,sh,[0,-.118,0]);
   this.addFlesh(BG.uarm.clone(),M.robe,um,Object.assign({part:ap,maxFrac:.42,maxAbs:.06},ax(.01,-.13)));
   const el=this.bone('elbow'+nm,um,[0,-.117,0]);
   this.addFlesh(BG.elbow.clone(),M.robe,el,Object.assign({part:ap,maxFrac:.42,maxAbs:.06},ax(.04,-.11)));
   const fm=this.bone('farmMid'+nm,el,[0,-.108,0]);
   this.addFlesh(BG.farm.clone(),M.robe,fm,Object.assign({part:ap,maxFrac:.42,maxAbs:.06},ax(.01,-.137)));
   mk(new THREE.TorusGeometry(.083,.016,8,30),M.trim,fm,{p:[0,-.135,0],r:[PI/2,0,0],part:'arm'+nm});
   mk(cylGeo(.078,.078,.012,24,true),M.robeIn,fm,{p:[0,-.139,0],cast:false});
   // 넓은 소매 자락: 팔을 앞으로 들면 아래로 늘어진다
   // (늘어진 자락은 맞힘 판정에서 뺀다: 배 앞에 늘어져 있어도 칼·총이 그 뒤 배에 닿게)
   const drape=grp(fm,[0,-.012,0]);const sleeve=mk(sphereGeo(26),M.robe,drape,{p:[0,-.1,0],s:[.1,.16,.15],flow:true});sleeve.userData.noHit=true;
   const wr=this.bone('wrist'+nm,fm,[0,-.107,0]);
   const hand=this._hand(wr,s,'hand'+nm);
   this.arms.push({s,nm,sh,um,el,fm,wr,hand,sleeve,drape,L1:.235,L2:.215});
  }
 }
 _hand(wr,s,part){
  const M=this.M,h={fingers:[],thumb:null},BG=BODYGEO.build();
  this.addFlesh(BG.wrist.clone(),M.skin,wr,{part,axisA:V3(0,.025,0),axisB:V3(0,-.034,0),maxFrac:.4,maxAbs:.02});
  h.palm=this.addFlesh(BG.palm.clone(),M.skin,wr,{part,center:V3(0,-.06,.004),maxFrac:.35,maxAbs:.018});
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
  // 반지: 약지에 보라 보석 인장 반지, 새끼손가락에 붉은 보석 반지(손등 쪽이 s 방향)
  mk(new THREE.TorusGeometry(.0128,.0046,6,16),M.gold,h.fingers[2].f,{p:[0,-.016,0],r:[0,0,PI/2],cast:false});
  mk(new THREE.BoxGeometry(.006,.009,.014),M.gold,h.fingers[2].f,{p:[s*.0135,-.016,0],cast:false});
  mk(sphereGeo(10),M.amethyst,h.fingers[2].f,{p:[s*.0168,-.016,0],s:[.0026,.0042,.0055],cast:false});
  mk(new THREE.TorusGeometry(.0112,.004,6,16),M.gold,h.fingers[3].f,{p:[0,-.012,0],r:[0,0,PI/2],cast:false});
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
  this.addFlesh(BG.seat.clone(),M.trouser,this.bones.pelvis,{part:'pelvis',center:V3(0,-.035,0),maxFrac:.35,maxAbs:.07});
  for(const s of [-1,1]){
   const nm=s<0?'L':'R',ax=(a,b)=>({axisA:V3(0,a,0),axisB:V3(0,b,0)});
   // 허벅지·정강이도 가운데에 뼈를 하나 더 둔다
   const hip=this.bone('hip'+nm,this.bones.pelvis,[s*.135,-.02,0]);
   this.addFlesh(BG.hip.clone(),M.trouser,hip,{part:'thigh'+nm,center:V3(0,-.06,0),maxFrac:.4,maxAbs:.07});
   const tm=this.bone('thighMid'+nm,hip,[0,-.145,0]);
   this.addFlesh(BG.thigh.clone(),M.trouser,tm,Object.assign({part:'thigh'+nm,maxFrac:.42,maxAbs:.07},ax(.012,-.152)));
   const knee=this.bone('knee'+nm,tm,[0,-.145,0]);
   this.addFlesh(BG.knee.clone(),M.trouser,knee,{part:'shin'+nm,center:V3(0,-.05,0),maxFrac:.4,maxAbs:.06});
   const sm=this.bone('shinMid'+nm,knee,[0,-.128,0]);
   this.addFlesh(BG.shin.clone(),M.trouser,sm,Object.assign({part:'shin'+nm,maxFrac:.42,maxAbs:.06},ax(.01,-.132)));
   // 대님(발목 끈)
   mk(new THREE.TorusGeometry(.084,.013,8,26),M.red,sm,{p:[0,-.108,0],r:[PI/2,0,0],part:'shin'+nm,cast:false});
   const ank=this.bone('ankle'+nm,sm,[0,-.127,0]);
   mk(sphereGeo(22),M.boot,ank,{p:[0,-.005,.045],s:[.078,.058,.14],part:'foot'+nm});
   mk(sphereGeo(16),M.boot,ank,{p:[0,.012,.165],s:[.03,.04,.035],part:'foot'+nm});
   mk(new THREE.BoxGeometry(.15,.022,.27),M.sole,ank,{p:[0,-.05,.045],part:'foot'+nm});
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
  this.skull=flesh(G.head.clone(),M.flesh,F,{part:'head',partAt,center:V3(0,-.012,.004),maxFrac:.46,maxAbs:.095});
  this.jowls=[];
  // 가면이 벗겨질 때 떨어져 나가는 사람 얼굴 부품(귀·콧수염·머리카락)은 합치지 않고 따로 둔다
  this.maskParts=[];const keep=m=>{m.userData.keep=true;this.maskParts.push(m);return m;};
  // 귀: 오른쪽 귀를 빚어 왼쪽은 뒤집어 쓴다
  this.earMeshes=[];
  for(const s of [-1,1]){
   const g=G.ear.clone();if(s<0)mirrorX(g);g.translate(s*.2,.022,-.012);
   const m=keep(flesh(g,M.flesh,F,{part:'head',center:V3(s*.2,.002,-.008),maxFrac:.35,maxAbs:.02}));this.earMeshes.push(m);
  }
  // 뒷머리(면류관 밑으로 보이는 검은 머리)
  this.hairMesh=keep(flesh(G.hair.clone(),M.hairF,F,{part:'head',kind:'cloth',center:V3(0,.03,-.04),maxFrac:.3,maxAbs:.03}));
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
  this.chin=flesh(G.chin.clone(),M.flesh,jaw,{part:'chin',center:V3(0,-.13,.13),maxFrac:.4,maxAbs:.05});
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
  // 속관(검은 칠) 위에 서양 금관을 씌우고, 그 위에 면류관 판을 얹는다
  mk(cylGeo(.15,.166,.12,32),M.lacquer,cr,{p:[0,.03,0],part:'crown'});
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
  for(const f of (this.fleshList||[]))f.disposeWork();
  const shared=new Set(Object.values(GEO)),geos=new Set();const visit=o=>{if(o.geometry&&!shared.has(o.geometry)&&!o.userData.sharedGeo)geos.add(o.geometry);};
  const roots=[this.root,this.crown,this.tablet,this.halo&&this.halo.root,this.tie,...(this.shards||[]),...(this.bits||[]).filter(b=>!b.dead).map(b=>b.obj)];
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
  if(this.talk>0){this.talkPhase+=dt*TAU*7;const w=Math.max(0,Math.sin(this.talkPhase))*this.talk;T.mOpen+=w*.35;T.jaw+=w*.2;}
  const r=instant?1:1-Math.exp(-dt*(this.flinch>.3?30:16));
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
   if(e.ejected&&!e.lizard){const r=e.r,yl=-.38*r,yu=.38*r;e.up.rotation.x=Math.asin(clamp(-yu/(r*1.13),-1,1));e.lo.rotation.x=Math.asin(clamp(-yl/(r*1.1),-1,1));e.up.scale.set(1.08,1.12,1.08);e.lo.scale.set(1.08,1.14,1.08);continue;}
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
  const open=sat(f.mOpen),jaw=sat(f.jaw),gap=sat(f.mGap);
  const tremble=(this.emo==='cry'||this.emo==='scared'||this.emo==='beg')?Math.sin(time*31)*.0015:0;
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
  this.lipU.update(U,rU);this.lipL.update(L,rL);
  // 입속(어두운 면): 입술 사이
  const P=this.mouthIn.geometry.attributes.position.array;
  for(let i=0;i<n;i++){const a=U[i],b=L[i];P[i*3]=a.x;P[i*3+1]=a.y-.002;P[i*3+2]=a.z+.0015;P[(n+i)*3]=b.x;P[(n+i)*3+1]=b.y+.002;P[(n+i)*3+2]=b.z+.0005;}
  this.mouthIn.geometry.attributes.position.needsUpdate=true;this.mouthIn.geometry.computeBoundingSphere();
  // 이: 벌어진 만큼만 보인다
  const lipY=(arr,x)=>{const t=clamp((x/w+1)/2*(n-1),0,n-1),i=Math.min(n-2,Math.floor(t)),k=t-i;return lerp(arr[i].y,arr[i+1].y,k);};
  const lipZ=x=>lz(x)-.006;
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
 floor:P({tz:-.18,py:-.5,pF:-.2,sF:-.32,cF:-.06,nF:.3,hF:.2,hR:-.18,LsA:.55,RsA:.55,LsF:-.8,RsF:-.8,LeB:.15,ReB:.15,Lcurl:.15,Rcurl:.15,LhF:1.35,RhF:1.28,LhA:.32,RhA:.38,LkB:.45,RkB:.3,LaF:.2,RaF:.25}),
 // 마지막: 옥좌 발판에 기대 주저앉아 늘어짐
 final:P({tz:-.2,py:-.5,pF:-.22,sF:-.2,cF:-.05,nF:.06,hF:.06,hR:.55,hT:.22,LsA:.62,RsA:.7,LsF:.05,RsF:-.05,LeB:.25,ReB:.15,Lcurl:.1,Rcurl:.12,LhF:1.32,RhF:1.18,LhA:.42,RhA:.52,LkB:.38,RkB:.22,LaF:.3,RaF:.35}),
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
  this.cutStrokeFallback=0;this.detached=new Set();
  this.limbCut={armL:{hits:0,last:null},armR:{hits:0,last:null},legL:{hits:0,last:null},legR:{hits:0,last:null}};this.armLimp=[0,0];this.legLimp=[0,0];this.regrowQ=[];
  this.abd=null;this.abdomenStage=0;this.abdomenOpen=false;this.abdomenCavity=null;this.coinQ=0;this.coinPow=0;this.coinAcc=0;this.coinCool=0;
  this.unmasked=false;this.memAt=0;this._ikFrame=0;this._ikUse={L:-1,R:-1};this.rest={L:{on:false,p:V3(),fd:V3(),pd:V3()},R:{on:false,p:V3(),fd:V3(),pd:V3()}};this.patT=rnd(3,6);this.pat=null;

  this.headGunHits=0;this.eyeGunHits=[0,0];this.headDone={};this.headDestroyed=false;this.headRuin=null;
  this.headGone=false;this.headKind='human';this.headTear=0;this.regrowHead=null;
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
  this.apronF.rotation.x=-clamp(fl*.92-.05,0,1.5);this.apronB.rotation.x=clamp(-Math.min(p.LhF,p.RhF)*.6,0,.6)+fl*.12;
  this.belt.rotation.x=.2;
  // 몸 출렁임(배는 가운데를 붙든 채 부풀었다 줄었다)
  const bj=sp.belly,bs=this.bellyScale||(this.bellyScale=V3(1,1,1));bs.set(1+bj.X,1+bj.Y,1+bj.Z);
  this.belly.scale.copy(bs);this.belly.position.set(BELLY_C.x*(1-bs.x),BELLY_C.y*(1-bs.y),BELLY_C.z*(1-bs.z));
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
 setIK(side,o){const a=this.arms[side==='L'?0:1],ik=this.ik[side];if(!o.rest)this._ikUse[side]=this._ikFrame;if(a&&(a.sh.userData.detached||a.el.userData.detached||a.wr.userData.detached)){ik.goal=0;return;}ik.goal=o.w==null?1:o.w;if(o.target)ik.target.copy(o.target);if(o.fd)ik.fd.copy(o.fd);if(o.pd)ik.pd.copy(o.pd);if(o.curl!=null)ik.curl=o.curl;ik.space=o.space||'root';ik.pole=o.pole||null;ik.rate=o.rate||8;},
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
  this.stateT+=dt;this.sinceHit+=dt;this.breath+=dt*(1.6+this.mood*1.4);this._ikFrame++;
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
  this.updateRevive(dt);
  for(const a of this.arms){const ik=this.ik[a.nm];ik.w=damp(ik.w,ik.goal,ik.rate||8,dt);this.solveArm(a,ik);this.setCurl(a,lerp(this.pose[a.nm+'curl'],ik.curl,smooth(ik.w)));}
  this.root.updateMatrixWorld(true);
  this.updateFace(dt,time);this.updateTears(time);this.updateRepFace(dt,time);
  if(this.fleshList)for(const f of this.fleshList)if(f.mesh.parent)f.update(dt);
  this.updateSecondary(dt);this.updateBelly(dt);this.updateRegrow(dt);this.updateHeadRegrow(dt);
  if(this.tabletHeld)this.placeTablet();else this.updateTablet(dt);
  this.updateBits(dt);this.crownUpdate(dt);this.haloUpdate(dt);this.updateReveal(dt);
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
  for(const a of this.arms){const d=a.drape;if(!d||d.userData.detached||a.el.userData.detached)continue;
   a.el.matrixWorld.decompose(_av6,_aq4,_av7);
   const fa=_av2.set(0,-1,0).applyQuaternion(_aq4);const horiz=1-Math.abs(fa.y);
   const k=smooth((horiz-.15)/.6);const zf=_av3.set(fa.x,0,fa.z);if(zf.lengthSq()<1e-6)zf.set(0,0,1);zf.normalize();
   const yy=_av4.set(0,1,0),xx=_av5.crossVectors(yy,zf).normalize();_am.makeBasis(xx,yy,zf);
   const qw=_aq3.setFromRotationMatrix(_am);d.quaternion.copy(_aq4.invert().multiply(qw));
   const sc=.25+.38*k;d.scale.set(sc,sc,1);d.visible=k>.02;}
 },
 /* 되살림: 쓸 수 있는 팔로 손바닥을 위로 펴 머리 위로 든다(소원의 불씨가 여기로 모인다) → 가슴으로 내린다 */
 updateRevive(dt){
  const r=this.revive;if(!r)return;
  r.k=Math.min(1,r.k+dt/(r.dur||1.1));
  if(!this.reviveArm)this.reviveArm=this.armUsable('R')?'R':this.armUsable('L')?'L':null;
  const side=this.reviveArm;if(!side)return;
  const s=side==='R'?1:-1;
  const T=_av8.set(-s*.24,1.32,.24);
  if(r.toChest){r.c=Math.min(1,(r.c||0)+dt/.32);T.lerp(_av9.set(-s*.04,.92,.36),smooth(r.c));}
  else if(r.k>=1)T.y+=Math.sin(this.breath*31)*.012;
  this.setIK(side,{target:T,fd:_av10.set(-s*.35,.3,1),pd:UP,curl:.12,w:smooth(r.k),rate:3,space:'root'});
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
  const f=this.hitFlash=Math.max(0,(this.hitFlash||0)-rdt*6);
  const w=this.whiteFlash=Math.max(0,(this.whiteFlash||0)-rdt*11);
  const pale=sat(this.bloodLost/4.4)*.55;
  if(!this.unmasked&&this._pale!==Math.round(pale*50)){this._pale=Math.round(pale*50);this.M.skin.color.copy(col('#eda882')).lerp(col('#d9c0b0'),pale);this.M.flesh.color.copy(this.M.skin.color);this.M.skinD.color.copy(col('#dc9572')).lerp(col('#c4a596'),pale);this.M.blush.color.copy(col('#ef8f7a')).lerp(col('#d8a99e'),pale);this.M.lip.color.copy(col('#c65f55')).lerp(col('#a7787a'),pale);}
  const ww=(w>.6?.24:w*.38);
  for(const m of this.flashMats){const sk=m!==this.M.robe&&m!==this.M.hem&&m!==this.M.belly&&m!==this.M.chest,k=sk?ww:0;m.emissive.setRGB(f*.42+k,f*.06+k*.9,f*.05+k*.82);}
  for(const m of this.goreMeshes)m.visible=PREF.blood;
 },
});
const _glowC=new THREE.Color();
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
  if(st!=='stand'){this.rest.L.on=false;this.rest.R.on=false;this.pat=null;}
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
   else if(d.type==='final'){out.cF+=Math.sin(this.breath*.7)*.012;
    // 되살림: 고개를 들어 손바닥을 올려다본다
    if(this.revive){const k=smooth(this.revive.k);out.hF-=.5*k;out.hR*=1-.85*k;out.hT=out.hT*(1-.6*k)-(this.reviveArm==='L'?-1:1)*.18*k;out.nF-=.12*k;out.cF-=.16*k;out.sF+=.08*k;}}
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
  if(this.mood>.4){const tr=Math.sin(time*29)*.006*this.mood;out.hT+=tr;out.cR+=tr*.5;}
  this.updateActions(out,dt,time);this.restHands(out,dt,time);
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
 /* 쉬는 손: 두 손을 배 위쪽에 얹고 있다(배 뼈 기준이라 몸을 숙여도 따라간다). 가끔 한 손으로 배를 두드린다.
  * 다른 동작(막기·홀·움켜쥐기 등)이 손을 쓰는 동안에는 비켜 있다가, 끝나면 그 손 자리에서 부드럽게 돌아온다. */
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
  if(this.headDestroyed||this.unmasked)return;
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
const _rv1=V3(),_rv2=V3(),_rv3=V3(),_rv4=V3(),_rv5=V3(),_rq1=new THREE.Quaternion(),_rq2=new THREE.Quaternion();
const _abdN=new THREE.Matrix3();
/* ===== 6-4-2. 운명 설계자 — 살 모양 바꾸기 =====
 * 맞은 자리(월드) 둘레의 살 메시를 모두 같은 모양으로 바꾸고, 그 자리에 붙은 피·상처·눈코입·넥타이를 같이 옮긴다. */
const _dfv1=V3(),_dfv2=V3(),_dfv3=V3(),_dfm=new THREE.Matrix4(),_dfm2=new THREE.Matrix4(),_dfm3=new THREE.Matrix3();
Object.assign(Emperor.prototype,{
 deform(op,pW,dirW,R,depth,o={}){
  const out=[];if(!this.fleshList)return out;
  for(const f of this.fleshList){const m=f.mesh;if(!m.parent||m.userData.detached||!visibleChain(m))continue;
   if(o.only&&!o.only.includes(f))continue;
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
   BLOOD.deformOverlays(bone,v=>{tmp.copy(v).applyMatrix4(Mbm);if(tmp.x<x0||tmp.x>x1||tmp.y<y0||tmp.y>y1||tmp.z<z0||tmp.z>z1)return false;f.deltaAt(tmp.x,tmp.y,tmp.z,dl,.03);if(dl.lengthSq()<1e-12)return false;dl.applyMatrix3(_dfm3);v.add(dl);return true;});}
  // 머리 살(얼굴 좌표): 눈·코·콧수염·눈썹·입술
  if(m.parent===this.face&&this.feat){
   for(const ft of this.feat){if(!ft.o.parent)continue;const a=ft.a||ft.anc||(ft.anc=ft.o.position.clone().add(V3(0,0,ft.o===this.noseG?0:.042)));
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
/* ===== 6-4-3. 머리: 조각조각 뜯기 → 썰려 떨어짐 → 파충류 머리로 다시 자람 =====
 * 총·창에 머리가 파이고 살점이 뜯겨 나가다가, 목을 베이거나 머리가 너무 상하면 대가리째 떨어져 나간다.
 * 그 자리에서 초록 비늘 파충류 머리가 쑥 자라 올라온다(세로 동공 눈·뾰족한 이빨·날름거리는 혀). */
const REP_TOOTH=()=>GEO.repTooth||(GEO.repTooth=(()=>{const g=new THREE.ConeGeometry(1,1,6);g.translate(0,-.5,0);return g;})());
Object.assign(Emperor.prototype,{
 // 머리에 누적되는 손상(총·창·베임). 일정 이상이면 떨어져 나간다
 headWear(amt,pt,n,dir){
  if(this.headGone)return;
  const activeSkull=this.headKind==='rep'?this.repSkull:this.skull;
  this.headTear=(this.headTear||0)+amt;
  // 중간중간 살점이 큼직하게 뜯겨 나간다("조각조각")
  if(PREF.blood&&this.headTear>2&&(this.headTear-amt|0)!==(this.headTear|0)){
   CHUNKS.burst(pt.clone().addScaledVector(n,.01),2+(Math.random()*2|0),n,.03,this.chunkKind({obj:activeSkull,part:'head'}),{speed:1.3});
   if(Math.random()<.5)this.tearHeadPiece(pt,n,dir);
  }
  if(this.headTear>=7)this.severHead(dir,{torn:true});
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
  this.bits=this.bits||[];this.bits.push({obj:piece,v:push,w:V3(rnd(-10,10),rnd(-12,12),rnd(-10,10)),r:o.small?.03:.07,bounce:.18,sound:o.small?'flake':'head',ttl:o.small?rnd(5,8):null,corners:this.limbCorners(piece)});
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
  this.bits.push({obj:head,v:push,w:V3(rnd(-8,8),rnd(-10,10),rnd(-8,8)),r:.12,bounce:.2,sound:'head',corners:this.limbCorners(head),bleed:{lp:V3(0,.02,0),ln:V3(0,-1,0),t:0,life:8}});
  // 반복 참수로 떨어진 고밀도 머리가 끝없이 쌓이지 않게 가장 최근 것만 남긴다.
  this.severedHeads=this.severedHeads||[];this.severedHeads.push(head);
  while(this.severedHeads.length>1){
   const old=this.severedHeads.shift(),bi=this.bits.findIndex(b=>b.obj===old);
   if(bi>=0)this.bits.splice(bi,1);BLOOD.forgetTree(old);old.removeFromParent();this.releaseLoose(old);
  }
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
  this.regrowHead={t:-1.5,dur:1.7,built:false,goo:0};
  return true;
 },
 // 목 윗면(그루터기) 막기: 겉 살 → 비늘 → 파란 속
 capNeck(neck,jointW,upW){
  if(this.neckCap){const old=new Set();this.neckCap.traverse(o=>old.add(o));this.goreMeshes=this.goreMeshes.filter(o=>!old.has(o));this.neckCap.removeFromParent();this.neckCap=null;}
  neck.updateWorldMatrix(true,false);
  const q=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),upW);
  const g=grp(neck);g.position.copy(neck.worldToLocal(jointW.clone())).add(V3(0,-.012,0));
  g.quaternion.copy(neck.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
  const disc=GEO.capDisc||(GEO.capDisc=new THREE.CircleGeometry(1,28));
  const add=(r,mat,d,gore)=>{const mm=mk(disc,mat,g,{p:[0,d,0],r:[-PI/2,0,0],s:r,cast:false});mm.userData.noHit=true;if(gore){mm.userData.gore=true;mm.visible=PREF.blood;this.goreMeshes.push(mm);}return mm;};
  add(.108,this.M.skin,.001);add(.086,this.M.liz,.002);add(.042,this.M.blueCore,.003,true);
  this.neckCap=g;
 },
 updateHeadRegrow(dt){
  const r=this.regrowHead;if(!r)return;
  r.t+=dt;
  if(!r.built){
 if(r.t<0)return;

 this.buildRepHead();
 r.built=true;
 r.t=0;
 AUDIO.squelch(1.1);

 if(this.onHeadRegrow)this.onHeadRegrow();
}
  const u=sat(r.t/r.dur),e=Math.max(.02,backOut(u,1.5)),wig=Math.sin(r.t*22)*.08*(1-u);
  this.repHead.scale.set(e*(1+wig),e,e*(1-wig));
  r.goo-=dt;if(r.goo<=0&&u<1&&PREF.blood){r.goo=rnd(.07,.15);const neck=this.bones.neck;neck.updateWorldMatrix(true,false);const p=neck.localToWorld(V3(rnd(-.04,.04),.12,.02));BLOOD.emit('blood',p,V3(rnd(-.3,.3),rnd(.1,.5),rnd(0,.4)),rnd(.004,.007),1);}
  if(u>=1){
   this.repHead.scale.setScalar(1);this.regrowHead=null;
   this.headGone=false;this.headTear=0;this.headGunHits=0;this.headDone={};this.repEyeHits=[0,0];
   this.repFull=true;this.deadStare=1;AUDIO.hiss(1);if(this.neckCap)this.neckCap.visible=false;
  }
 },
 // 파충류 머리를 목 위에 새로 올린다
 buildRepHead(){
  const M=this.M,G=HEADGEO.build();
const head=this.bone('head',this.bones.neck,[0,.06,.03]);

// 목 절단면을 재생 중심으로 사용한다.
const grow=this.repHead=grp(head,[0,.065,-.02],'repHead');
grow.scale.setScalar(.04);

// 다 자라면 기존 머리 위치와 정확히 같아진다.
const rg=grp(grow,[0,.15,.02]);
 
 
  // 두개골·아래턱(비늘 살)
  this.repSkull=this.addFlesh(G.rep.clone(),M.lizHead,rg,{part:'head',kind:'liz',center:V3(0,0,.02),maxFrac:.42,maxAbs:.09,minEdge:.0052});
  const jaw=this.repJawBone=grp(rg,[0,-.07,-.03]);
  this.addFlesh(G.repJaw.clone(),M.lizHead,jaw,{part:'mouth',kind:'liz',center:V3(0,-.05,.1),maxFrac:.4,maxAbs:.05,minEdge:.0052});
  // 세로 동공 눈. 눈알 뒤에는 처음부터 어두운 빈 안와를 따로 둔다.
  this.repEyes=[];this.repEyeHits=[0,0];
  for(const s of [-1,1]){
   const side=s<0?'L':'R',pos=[s*.094,.052,.11];
   const socket=grp(rg,pos);socket.rotation.y=s*.18;
   const cavity=mk(GEO.repSocket||(GEO.repSocket=eyeCapGeo(.0445,1.12,false)),M.mouth,socket,{p:[0,0,-.012],s:[1,.84,.28],cast:false});cavity.userData.noHit=true;
   const rim=mk(GEO.repSocketRim||(GEO.repSocketRim=new THREE.TorusGeometry(.0415,.0048,6,28)),M.lizIn,socket,{p:[0,0,-.001],s:[1,.82,1],cast:false});rim.userData.noHit=true;
   const eg=grp(rg,pos);eg.rotation.y=s*.18;const root=grp(eg);
   const ball=mk(sphereGeo(22),M.lizEyeBall,root,{s:[.043,.033,.035],part:'repEye'+side,cast:false});
   const iris=mk(GEO.repEyeIris||(GEO.repEyeIris=eyeCapGeo(.0404,1.0,false)),M.lizEye,root,{s:[1.065,.82,.87],cast:false,part:'repEye'+side});
   const hl=mk(sphereGeo(10),M.hl,root,{p:[-.012,.011,.037],s:.0054,cast:false});hl.userData.noHit=true;
   this.repEyes.push({s,eg,root,ball,iris,hl,socket,ejected:false});
  }
  // 윗니(뾰족한 원뿔) + 아랫니
  const tooth=REP_TOOTH();
  for(let i=0;i<7;i++){const u=(i-3)/3.2,x=u*.07,z=.2-Math.abs(u)*.03;
   mk(tooth,M.claw,rg,{p:[x,-.095,z],s:[.009,.03,.009],cast:false,part:'mouth'});}
  for(let i=0;i<5;i++){const u=(i-2)/2.4,x=u*.06,z=.2-Math.abs(u)*.03;
   const t=mk(tooth,M.claw,jaw,{p:[x,-.03,z+.02],s:[.008,.024,.008],r:[PI,0,0],cast:false,part:'mouth'});}
  // 콧구멍 틈
  for(const s of [-1,1])mk(sphereGeo(10),M.mouth,rg,{p:[s*.022,-.012,.258],s:[.01,.006,.008],cast:false,part:'head'}).userData.noHit=true;
  // 갈라진 혀
  {const ts=new THREE.Shape();ts.moveTo(-.008,0);ts.lineTo(-.009,.09);ts.lineTo(-.016,.125);ts.lineTo(-.004,.1);ts.lineTo(0,.104);ts.lineTo(.004,.1);ts.lineTo(.016,.125);ts.lineTo(.009,.09);ts.lineTo(.008,0);ts.closePath();
   const fg=new THREE.ExtrudeGeometry(ts,{depth:.006,bevelEnabled:true,bevelThickness:.002,bevelSize:.0016,bevelSegments:2,curveSegments:2});fg.rotateX(PI/2);
   const fork=grp(jaw,[0,-.04,.16]);fork.rotation.x=.55;const fm=mk(fg,M.fork,fork,{cast:false});fm.userData.noHit=true;fork.visible=false;this.repFork={g:fork,k:-1};}
  rg.updateMatrixWorld(true);
  rg.traverse(ob=>{if(!ob.isMesh)return;ob.userData.seg='head';if(ob.userData.part&&!ob.userData.noHit&&!this.parts.includes(ob))this.parts.push(ob);if(ob.userData.flow){(this.flow.head||(this.flow.head=[])).push(ob);FASTRAY.grid(ob.geometry);}});
  this._flowAll=null;this.headKind='rep';this.headR=.2;this.repFlickT=rnd(1,2.5);
 },
 // 파충류 얼굴: 턱 숨쉬기·가끔 혀 날름·눈이 나를 본다
 updateRepFace(dt,time){
  if(this.headGone||this.headKind!=='rep'||!this.repHead)return;
  const open=.1+.09*Math.max(0,Math.sin(time*1.1))+(this.flinch>.2?.25*this.flinch:0);
  if(this.repJawBone)this.repJawBone.rotation.x=open;
  if(this.flinch>0)this.flinch=Math.max(0,this.flinch-dt*2.6);
  // 세로 동공이 나를(카메라) 노려본다
  if(this.repEyes)for(const e of this.repEyes){if(e.ejected)continue;const eg=e.eg;eg.parent.updateWorldMatrix(true,false);
   const l=_fv2.copy(camera.position);eg.parent.worldToLocal(l).sub(eg.position);
   const yaw=Math.atan2(l.x,l.z),pitch=-Math.atan2(l.y,Math.hypot(l.x,l.z));
   eg.rotation.set(clamp(pitch,-.38,.38),clamp(e.s*.1+yaw,-.5,.6),0);}
  // 혀 날름
  this.repFlickT-=dt;if(this.repFlickT<=0){this.repFlickT=rnd(1.8,3.6);if(this.repFork&&this.repFork.k<0){this.repFork.k=0;AUDIO.hiss(.8);}}
  const f=this.repFork;if(f&&f.k>=0){f.k+=dt/.7;const k=f.k,e=k<.2?smooth(k/.2):k<.55?1:1-smooth((k-.55)/.45);f.g.visible=e>.03;f.g.scale.set(1,1,Math.max(.02,e));f.g.rotation.x=.55+Math.sin(time*36)*.2*e;if(k>=1){f.k=-1;f.g.visible=false;}}
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
  // 첫 대: 홀을 떨어뜨리고 놀란다
  if(this.taunt){this.taunt=false;out.first=true;if(this.tabletHeld)this.dropTablet(V3(dir.x*1.5+rnd(-.4,.4),1.1,dir.z*.6+1.2));this.setPhase(1);this.setEmotion('shock');this.shockT=.7;AUDIO.gasp(1.2);}
  if(part==='tablet'){if(this.tabletHeld)this.dropTablet(V3(dir.x*3,1.4,1.5));out.dmg=.05;return out;}
  // 후광: 깡 하고 흔들리며 금이 간다(몸은 거의 안 다친다)
  if(part==='halo'){const counted=this.haloHit(h);if(counted&&!down){this.doFlinch('shock',.8);this.sp.head.kick(-1.2,dir.x*2,0);}out.halo=true;out.dmg=counted?.04:0;out.vis=counted?.6:0;return out;}
  if(part==='crown'&&(sharp||gun)){this.kickBody('head',dir,P*.6,kind);if(gun)this.knockCrown(dir);else{this.crownTilt=(this.crownTilt||0)+.35;AUDIO.crown(.8);}this.doFlinch('shock',1);AUDIO.voice('gasp',1);out.dmg=.08;return out;}
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
  // 얼굴 표정·목소리
  if(isHead){this.doFlinch('pain',1);}else if(part==='belly'){this.doFlinch(blunt?'oof':'pain',1);}else this.doFlinch(gun?'shock':'grunt',.9);
  this.voiceHit(tool,part,P,gun||sharp||tool==='spear');
  // 부위별
  if(blunt)this.bluntHit(part,seg,pt,n,dir,tool,kind,P,h);
  else this.makeWound(seg,pt,n,dir,tool,kind,h,false);
  // 눈에 보이는 살 변형(움푹·파임·베임): 맞을수록 누적
  if(!/^(crown|halo|tablet|beard)$/.test(part)&&!((part==='eyeL'||part==='eyeR')&&this.eyes[part==='eyeL'?0:1]&&this.eyes[part==='eyeL'?0:1].lizard))
   this.applyDeform(part,seg,pt,n,dir,tool,kind,h);
  // 갈라진 배(돼지저금통)를 치면 동전이 또 쏟아진다
  if(part==='belly'&&this.abdomenOpen&&kind!=='slash'&&this.nearSlit(pt,.17))this.coinBurst(gun?10:sharp?14:6,gun?1.2:sharp?1.3:.8);
  // 총 맞는 반응(부위별)
  if(gun&&!down)this.gunReact(part,seg,pt,n,dir);
  if(gun&&HEAD_FLESH.test(part)&&this.headKind!=='rep')this.progressHeadGun(part,seg,pt,n,dir);
  if(this.headKind!=='rep'&&(part==='eyeL'||part==='eyeR')&&!gun){
   const i=part==='eyeL'?0:1,add=(tool==='knife'||tool==='spear')?(kind==='stab'?2:.8):blunt?(kind==='jab'?.45:.75):0;
   if(add&&!this.eyes[i].ejected){this.eyeGunHits[i]=(this.eyeGunHits[i]||0)+add;if(this.eyeGunHits[i]>=2)this.ejectEye(i,n,dir);}
  }
  if(this.headKind==='rep'&&(part==='repEyeL'||part==='repEyeR')){
   const i=part==='repEyeL'?0:1;
   const add=gun?1:(tool==='knife'||tool==='spear')?(kind==='stab'?2:.8):blunt?(kind==='jab'?.45:.75):0;
   if(add){this.repEyeHits[i]=(this.repEyeHits[i]||0)+add;if(this.repEyeHits[i]>=2)this.ejectRepEye(i,n,dir);}
  }
  // 머리가 조각조각 뜯기고, 심해지면 떨어져 나간다 / 목을 베면 바로 썰린다
  if(!this.headGone){
   if(HEAD_FLESH.test(part)){
    if(gun)this.headWear(1,pt,n,dir);
    else if(tool==='spear')this.headWear(kind==='slash'?1.3:2.3,pt,n,dir);
    else if(sharp&&kind==='slash')this.headWear(1.15,pt,n,dir);
   }
   if(part==='neck'&&(sharp||tool==='spear'))this.severHead(dir);
  }
  if(sharp&&!down&&(kind==='stab')&&!/^(arm|hand)/.test(part)&&Math.random()<.85){const side=this.handFor(pt);this.doAct('clutch',{side,seg,lp:this.bones[seg].worldToLocal(pt.clone()),ln:n.clone().transformDirection(_invB(this.bones[seg])),dur:1.4,prio:1});}
  // 막기 시작(두 번째 다운 이후, 얼굴을 연달아 맞으면)
  if(isHead&&!this.headDestroyed&&!down&&this.phase>=2&&this.guardCool<=0&&!gun){const now=G.time;this.hitsRecent=this.hitsRecent.filter(t=>now-t<1.2);this.hitsRecent.push(now);if(this.hitsRecent.length>=3&&Math.random()<.35+this.phase*.06){this.guardHold=rnd(1,1.8);this.guardHP=2+this.phase;this.guardCool=rnd(3,5);this.hitsRecent.length=0;if(this.act&&this.act.prio<2)this.endAct();}}
  // 크게 휘청
  out.heavy=kind==='hook'||kind==='upper'||gun||kind==='stab';
  out.big=this.bigEvent;this.bigEvent=false;
  // 게이지가 한 대에 눈에 띄게 줄어드는 양(실제로 깎이는 양은 진행 시간표가 정한다)
  out.vis=({jab:2.2,hook:3.4,upper:3.8,stab:3.6,slash:1,shot:isHead?4:3})[kind]||2;if(down)out.vis*=.5;if(out.big)out.vis+=2;
  // 게이지 피해
  const base={hand:kind==='hook'||kind==='upper'?.3:.23,knife:kind==='slash'?.13:.34,spear:kind==='slash'?.2:.5,gun:.44}[tool]||.2;
  out.dmg=base*(isHead?1.15:1)*(down?.35:1);
  return out;
 },
 handFor(pt){
 const l=this.root.worldToLocal(pt.clone());let side=l.x<0?'L':'R',other=side==='L'?'R':'L';if(!this.armUsable(side)||(this.armHurt[side==='L'?0:1]>.5&&this.armUsable(other)))side=other;return side;
},
 voiceHit(tool,part,P,cut){
  if(this.headKind==='rep'){const now=G.time;if(now<(this.voiceCool||0))return;this.voiceCool=now+.6;if(Math.random()<.55){if(this.repFork&&this.repFork.k<0)this.repFork.k=0;AUDIO.hiss(.85);}return;}
  if(this.headDestroyed)return;
  const now=G.time;if(now<(this.voiceCool||0))return;
  if(this.state==='dead'){if(Math.random()<.35){if(this.repFull&&Math.random()<.65)this.flickTongue();else AUDIO.voice('groan',.4);this.voiceCool=now+1;}return;}
  if(part==='belly'&&tool==='hand'){AUDIO.voice('oof',clamp(P*.6,.4,1.2));this.voiceCool=now+.32;return;}
  if(cut||P>1.6){AUDIO.voice(Math.random()<.5?'yelp':'scream',clamp(P*.55,.5,1.2));this.voiceCool=now+.42;return;}
  if(Math.random()<.8){AUDIO.voice('grunt',clamp(P*.75,.45,1.1));this.voiceCool=now+.22;}
 },
 // 날아간 살점의 겉 색: 살·옷·배·바지·도마뱀
 chunkKind(h){
  if(this.unmasked&&HEADS.test(h.part))return 'liz';
  const m=h.obj&&h.obj.material,k=m&&m.userData&&m.userData.fleshKind;
  if(k==='liz')return 'liz';if(k==='trouser')return 'trouser';if(k==='skin')return 'skin';
  if(h.part==='belly')return 'belly';
  return 'cloth';
 },
 /* 눈에 보이는 살 변형: 주먹은 움푹(dent), 총·창은 파임(crater), 칼·창긋기는 베임(groove).
  * 맞을 때마다 꼭짓점이 실제로 옮겨져 되돌아오지 않는다 → 누적될수록 확실히 함몰·파임. */
 applyDeform(part,seg,pt,n,dir,tool,kind,h){
  if(!this.fleshList||!PREF.deform)return;
  const into=dir.clone().normalize(),headF=HEAD_FLESH.test(part),limb=/^(arm|hand|thigh|shin|wrist|ankle)/.test(part);
  if(tool==='hand'){
   const heavy=kind==='hook'||kind==='upper';let R,depth;
   if(part==='belly'){R=.11;depth=heavy?.055:.032;}
   else if(part==='chest'){R=.09;depth=heavy?.03:.018;}
   else if(headF){R=part==='nose'?.03:.052;depth=kind==='jab'?.009:kind==='hook'?.013:.016;}
   else{R=.055;depth=heavy?.016:.01;}
   // 영구 함몰은 남기되, 타격 뒤 0.9초간 매 프레임 메시를 다시 쓰던 표면 jiggle은 끈다.
   this.deform('dent',pt,into,R,depth,{bruise:heavy?.55:.34,rim:.3});
  }else if(tool==='gun'){
   const R=headF?.022:limb?.022:.028,depth=headF?.03:.038;
   this.deform('crater',pt,into,R,depth,{soak:.55,jag:.32});
   if(PREF.blood)CHUNKS.burst(pt.clone().addScaledVector(n,.008),2+(Math.random()*3|0),n,headF?.02:.028,this.chunkKind(h),{speed:1.2,back:into});
   this._gunLine(seg,pt,n,into,h);
  }else if(tool==='spear'){
   if(kind==='slash'&&h.slashFrom){
    this.deform('groove',pt,into,.013,.03,{bW:h.slashFrom,soak:.45,jag:.3});
    if(PREF.blood)CHUNKS.burst(pt,2+(Math.random()*2|0),n,.024,this.chunkKind(h),{speed:1});
   }else{
    this.deform('crater',pt,into,.02,headF?.045:.06,{soak:.6,jag:.26});
    if(PREF.blood)CHUNKS.burst(pt.clone().addScaledVector(n,.01),3+(Math.random()*3|0),n,.03,this.chunkKind(h),{speed:1.45,back:into});
   }
  }else if(tool==='knife'){
   if(kind==='slash'&&h.slashFrom)this.deform('groove',pt,into,headF?.0085:.0075,.013,{bW:h.slashFrom,soak:.4});
   else this.deform('crater',pt,into,.012,.045,{soak:.45,jag:.2});
  }
 },
 // 총을 선을 긋듯 여러 발 쏘면 구멍 사이가 칼로 썬 듯 뜯겨 나간다
 _gunLine(seg,pt,n,into,h){
  const last=this._lastGun;this._lastGun={seg,p:pt.clone(),t:G.time};
  if(!last||last.seg!==seg||G.time-last.t>1.6)return;
  const d=last.p.distanceTo(pt);if(d<=.02||d>=.11)return;
  this.deform('groove',pt,into,.012,.03,{bW:last.p,soak:.6,jag:.4});
  const mid=V3().addVectors(last.p,pt).multiplyScalar(.5);
  if(PREF.blood)CHUNKS.burst(mid,2+(Math.random()*3|0),n,.026,this.chunkKind(h),{speed:1.1,back:into});
  AUDIO.rip(.55);this.bigEvent=true;FX.word(pick(['쭈욱!','뜯겨!','촤악!']),mid,{size:46,color:'#b6e07a',dx:rnd(-60,60),dy:-20});
 },
 /* 너클: 마디 자국·멍·혹·찢어짐·코피·이빨·눈 붓기·면류관 */
 bluntHit(part,seg,pt,n,dir,tool,kind,P,h){
  const heavy=kind==='hook'||kind==='upper';
  this.hitCount=(this.hitCount||0)+1;
  const face=HEADS.test(part)&&part!=='crown'&&part!=='beard';
  // 너클 자국: 마디 네 개가 눌린 붉은 자국. 잽은 가로, 훅은 세로로 찍힌다
  if(part!=='crown'&&part!=='beard'){
   const ang=kind==='hook'?PI/2+rnd(-.25,.25):kind==='upper'?rnd(-.5,.5):rnd(-.2,.2),hitMeshes=this.flow&&this.flow[seg]&&this.flow[seg].length?this.flow[seg]:null;
   BLOOD.decal('knuckle',seg,pt,n,face?.034:.046,{aspect:1.7,angle:ang,grid:4,meshes:hitMeshes});
   if(Math.random()<(heavy?.7:.35))BLOOD.decal('bruise',seg,pt,n,face?(heavy?.05:.04):.065,{grid:3,meshes:hitMeshes});
  }
  // 재생된 머리에는 옛 인간 얼굴·치아·코 좌표를 적용하지 않는다.
  if(this.headKind==='rep'&&HEADS.test(part)){if(face)BLOOD.spray(pt,V3(dir.x*.6+rnd(-.2,.2),.35,.55).normalize(),heavy?12:7,{kind:'blood',max:heavy?3.2:2.4,smax:.0085});return;}
  if(HEADS.test(part)){
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
   if((part==='crown'||part==='head')&&this.crownOn!==false){this.crownTilt=(this.crownTilt||0)+(part==='crown'?.45:.15)*P*(kind==='upper'?1.6:1);if(this.crownTilt>1.15||(heavy&&part==='crown'&&Math.random()<.5))this.knockCrown(dir);else AUDIO.crown(.5);}
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
updateBelly(dt){
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
  * 팔(위팔·아래팔·손)·다리(허벅지·정강이·발)를 가로질러 그으면 한 번 그을 때마다 한 번으로 친다.
  * 1번째 베임 → 2번째 깊게 베여 축 늘어짐 → 3번째에 그은 자리에서 가장 가까운 마디가 잘려 떨어진다.
  * 다시 자란 도마뱀 팔다리는 한 번에 잘린다. */
limbOf(part){const m=/^(arm|hand|thigh|shin|foot)(L|R)$/.exec(part||'');return m?(m[1]==='arm'||m[1]==='hand'?'arm':'leg')+m[2]:null;},
progressLimbCut(seg,part,pW,nW,angle,strokeId,len,dir,skin){
 const key=this.limbOf(part);if(!key)return 0;
 const L=this.limbCut[key],bone=this.bones[seg];if(!L||!bone||bone.userData.detached)return 0;
 const sid=strokeId==null?'limb-'+(++this.cutStrokeFallback):strokeId;
 // 더 자를 마디가 없는 그루터기면 세지 않는다
 const j=this.cutJointAt(seg,pW);if(!j)return 0;
 if(L.last===sid)return L.hits;L.last=sid;L.hits++;
 const side=key.slice(-1),i=side==='L'?0:1,arm=key[0]==='a';
 if(bone.userData.lizard||L.hits>=3){if(this.detachLimb(j,nW,dir))return 99;}
 const w=arm?.016:.02,cl=clamp(len||.05,.03,.1);
 if(L.hits===1){
  BLOOD.decal(skin?'cutSkin':'cut',seg,pW,nW,skin?w*1.2:w,{aspect:clamp(cl/w,2.4,5),angle,grid:8});
  BLOOD.addWound(seg,pW,nW,{rate:.016,tau:34,kind:'cut'});BLOOD.spray(pW,nW,8,{max:2.6});
 }else{
  if(!skin)BLOOD.decal('soak',seg,pW,nW,arm?.07:.09,{grow:1.2});BLOOD.decal(skin?'cutSkin':'cut',seg,pW,nW,w*(skin?1.5:1.35),{aspect:clamp(cl/w,2.4,4.6),angle,grid:9});
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
// 잘린 면: 바깥은 옷(살), 안은 비늘, 가운데는 파란 속
makeCutCap(parent,pos,q,r,distal,outer,lizard,offset=0){
 const g=grp(parent);g.position.copy(pos);g.quaternion.copy(q);g.translateY((distal?1:-1)*offset);
 const s=distal?1:-1,rx=distal?-PI/2:PI/2,disc=GEO.capDisc||(GEO.capDisc=new THREE.CircleGeometry(1,28));
 const add=(rr,mat,d,gore)=>{const m=mk(disc,mat,g,{p:[0,s*d,0],r:[rx,0,0],s:rr,cast:false});m.userData.noHit=true;if(gore){m.userData.gore=true;m.visible=PREF.blood;this.goreMeshes.push(m);}return m;};
 add(r,outer,.001);add(r*.8,lizard?this.M.lizIn:this.M.liz,.002);add(r*.36,this.M.blueCore,.003,true);
 g.userData.cap={r,outer,rx,s};
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
 const oldCap=this.limbCaps[joint];
 if(oldCap){oldCap.removeFromParent();this.releaseLoose(oldCap);}
 const capBody=this.makeCutCap(parent,pLocal,qLocal,r,false,outer,lizard,offB);this.limbCaps[joint]=capBody;
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
 this.bits.push({obj:bone,v:push,w:V3(rnd(-7,7),rnd(-9,9),rnd(-7,7)),r:.03,bounce:.16,sound:'limb',corners,
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
  this.regrowQ.push({joint,base,side,arm,parent,pos:pLocal.clone(),cap:capBody,t:-(arm?2.2:1.1),dur:arm?1.9:1.8,built:false,goo:0});
 // 떨어진 팔다리는 최근 것 8개만 남긴다(오래된 것부터 치운다)
 this.severed=this.severed||[];this.severed.push(bone);
 while(this.severed.length>6){const old=this.severed.shift(),k=this.bits.findIndex(b=>b.obj===old),ownedMats=this.looseMaterials(old);if(k>=0)this.bits.splice(k,1);BLOOD.forgetTree(old);old.removeFromParent();this.releaseLoose(old,ownedMats);}
 return true;
},
// 다리가 잘리면 옥좌로 주저앉았다가 새 다리가 다 자라야 일어난다
legFall(){
 if(this.state==='stand'||this.state==='rise'){this.startFall('throne');this.down.legCut=true;this.down.stay=1.4;if(this.onLegFall)this.onLegFall();}
},
legsMissing(){return this.legs.some(l=>l.hip.userData.detached||l.tm.userData.detached||l.knee.userData.detached||l.sm.userData.detached||l.ank.userData.detached);},

 /* ===== 다시 자라나는 도마뱀 팔다리 =====
  * 잘린 자리에서 2초쯤 뒤 초록 비늘 팔다리가 쑥 자라 나온다. 뼈 이름이 같아서 자세·IK가 그대로 움직인다. */
updateRegrow(dt){
 const Q=this.regrowQ;if(!Q||!Q.length)return;
 for(let k=Q.length-1;k>=0;k--){const r=Q[k];
  if(r.parent.userData.detached||(r.root&&r.root.userData.detached)||(!r.built&&(this.state==='dead'||(this.down&&this.down.type==='final')))){Q.splice(k,1);continue;}
  r.t+=dt;
  if(!r.built){if(r.t<0)continue;this.buildLizardLimb(r);r.built=true;r.t=0;AUDIO.squelch(1);}
  const u=sat(r.t/r.dur),e=Math.max(.02,backOut(u,1.5)),wig=Math.sin(r.t*26)*.08*(1-u);
  r.root.scale.set(e*(1+wig),e,e*(1-wig));
  r.goo-=dt;if(r.goo<=0&&u<1&&PREF.blood){r.goo=rnd(.06,.14);r.parent.updateWorldMatrix(true,false);const p=r.parent.localToWorld(r.pos.clone());BLOOD.emit('blood',p,V3(rnd(-.3,.3),rnd(-.1,.4),rnd(0,.4)),rnd(.003,.006),1);}
  if(u>=1){r.root.scale.setScalar(1);Q.splice(k,1);this.onRegrown(r);}
 }
},
buildLizardLimb(r){
 const s=r.side==='L'?-1:1,nm=r.side,chain=r.arm?ARM_CHAIN:LEG_CHAIN;
 const k0=chain.findIndex(c=>c[0]===r.base);if(k0<0)return;
 let parent=r.parent;const made=[];
 for(let k=k0;k<chain.length;k++){
  const [name,pos]=chain[k],p=k===k0?[r.pos.x,r.pos.y,r.pos.z]:[pos[0],pos[1],pos[2]];
  const b=this.bone(name+nm,parent,p);b.userData.lizard=true;made.push(b);
  this.lizSeg(name,b,s,nm);parent=b;
 }
 r.root=made[0];r.root.scale.setScalar(.02);
 const i=r.side==='L'?0:1;
 if(r.arm){const a=this.arms[i];for(const b of made){const n=b.userData.bone.slice(0,-1);if(n==='shoulder')a.sh=b;else if(n==='uarmMid')a.um=b;else if(n==='elbow')a.el=b;else if(n==='farmMid'){a.fm=b;a.drape=null;}else if(n==='wrist'){a.wr=b;a.hand=b.userData.hand;}}}
 else{const l=this.legs[i];for(const b of made){const n=b.userData.bone.slice(0,-1);if(n==='hip')l.hip=b;else if(n==='thighMid')l.tm=b;else if(n==='knee')l.knee=b;else if(n==='shinMid')l.sm=b;else if(n==='ankle')l.ank=b;}}
 for(const b of made)this.detached.delete(b.userData.bone);
 r.root.updateMatrixWorld(true);for(const b of made)mergeChildren(b);
 r.root.traverse(o=>{if(!o.isMesh)return;o.userData.seg=this.segOf(o);if(o.userData.part&&!o.userData.noHit)this.parts.push(o);if(o.userData.flow){(this.flow[o.userData.seg]||(this.flow[o.userData.seg]=[])).push(o);FASTRAY.grid(o.geometry);}});
 this._flowAll=null;
 // 잘린 면 마개는 옷(살) 테만 남겨 새 팔다리가 그 속에서 나오게 한다
 const cap=r.cap;if(cap&&cap.userData.cap){const c=cap.userData.cap,inner=(CUT_R_LIZ[r.base]||.05)*.98;
  for(const ch of [...cap.children])ch.removeFromParent();this.goreMeshes=this.goreMeshes.filter(m=>m.parent);
  if(inner<c.r*.95){const m=mk(new THREE.RingGeometry(inner,c.r,28),c.outer,cap,{p:[0,c.s*.001,0],r:[c.rx,0,0],cast:false});m.userData.noHit=true;this.disposables.push(m.geometry);}}
 if(this.state==='stand'&&!r.arm)this.doFlinch('shock',.8);
},
onRegrown(r){
 AUDIO.pop(1);const key=(r.arm?'arm':'leg')+r.side,i=r.side==='L'?0:1;this.limbCut[key]={hits:0,last:null};if(r.arm)this.armLimp[i]=0;else{this.legLimp[i]=0;this.limp[i]=0;}
 // 잘린 자리에서 나던 피는 멎는다
 r.parent.updateWorldMatrix(true,false);BLOOD.stopNear(r.parent,r.parent.localToWorld(r.pos.clone()),.09);
 r.root.updateWorldMatrix(true,false);const p=r.root.getWorldPosition(V3());
 FX.add('glint',p,{size:.12,life:.25,start:.4,grow:1.4,color:'#c8ff9a'});
 if(r.arm){this.armHurt[i]=.4;if(this.state==='stand'&&!this.act)this.doAct('look',{side:r.side,dur:1.6});}
 else if(this.state==='down'&&this.down&&!this.legsMissing())this.down.stay=Math.min(this.down.stay,.35);
 if(this.state!=='dead'&&Math.random()<.6)this.flickTongue();
},
// 도마뱀 팔다리 한 마디: 비늘 원기둥 + 마디 공 + 돌기
lizSeg(name,b,s,nm){
 const M=this.M,F=o=>Object.assign({flow:true},o),R=LIZ_DIM[name];
 const ap='arm'+nm,lp=name==='hip'||name==='thighMid'||name==='knee'?'thigh'+nm:'shin'+nm;
 const part=ARM_BASES.has(name)?ap:lp;
 if(R.ball)mk(sphereGeo(20),M.liz,b,F({s:R.ball,part:name==='knee'?'thigh'+nm:part}));
 if(R.len)mk(cylGeo(R.r0,R.r1,R.len,16),M.liz,b,F({p:[0,R.c,0],part:name==='knee'?'shin'+nm:part}));
 // 바깥쪽 등에 작은 뿔 돌기
 if(R.spikes)for(let k=0;k<R.spikes;k++){const y=R.c+R.len*(.3-k*.35),m=mk(GEO.spike||(GEO.spike=new THREE.ConeGeometry(1,1,6)),M.claw,b,{p:[s*R.r0*.86,y,-R.r0*.42],s:[.011,.032,.011],r:[0,0,-s*1.1],cast:false,part});m.userData.noHit=true;}
 if(name==='wrist')b.userData.hand=this._lizHand(b,s,'hand'+nm);
 if(name==='ankle')this._lizFoot(b,s,'foot'+nm);
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
 const M=this.M,claw=clawGeo();
 mk(sphereGeo(18),M.liz,ank,{p:[0,-.018,.04],s:[.062,.04,.11],part,flow:true});
 for(let k=-1;k<=1;k++){const g=grp(ank,[k*.036,-.034,.13]);g.rotation.set(-.15,k*.32,0);
  mk(capsuleGeo(.016,.06,8),M.liz,g,{p:[0,0,.03],r:[PI/2,0,0],part});
  const c=mk(claw,M.claw,g,{p:[0,-.006,.082],s:[.01,.03,.01],cast:false,part});c.rotation.x=PI/2+.4;}
 const sp=mk(claw,M.claw,ank,{p:[0,-.02,-.06],s:[.012,.034,.012],cast:false,part});sp.rotation.x=-PI/2+.5;
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
 this.bits=this.bits||[];this.bits.push({obj:e.root,v:push,w:V3(rnd(-9,9),rnd(-12,12),rnd(-8,8)),r:.043,bounce:.35,sound:'eye'});
 this.looseEyes=this.looseEyes||[];this.looseEyes.push(e.root);
 while(this.looseEyes.length>6){const old=this.looseEyes.shift(),bi=this.bits.findIndex(b=>b.obj===old);if(bi>=0)this.bits.splice(bi,1);old.removeFromParent();}
 BLOOD.clearDecalsNear('head',p,.06,null);BLOOD.stopNear(this.bones.head,p,.06);
 BLOOD.addWound('head',p,eyeN,{rate:.014,tau:30,kind:'hole'});BLOOD.spray(p,eyeN,14,{min:1,max:3,spread:.75});
 AUDIO.pop(1);this.bigEvent=true;FX.word('뽁!',p,{size:48,color:'#ffffff',force:true,dx:e.s*70,dy:-30});return true;
},

 /* ===== 사람 눈: 빠지면 새 눈이 아니라 빈 안와만 남는다 ===== */
ejectEye(i,n,dir){
 const e=this.eyes[i];if(!e||e.ejected||this.headDestroyed)return false;
 e.ejected=true;e.ruined=false;this.swellU[i]=0;this['blackEye'+i]=true;
 e.gaze.attach(e.hl);e.gaze.updateWorldMatrix(true,true);
 const wp=e.gaze.getWorldPosition(V3()),wq=e.gaze.getWorldQuaternion(new THREE.Quaternion());
 scene.add(e.gaze);e.gaze.position.copy(wp);e.gaze.quaternion.copy(wq);e.gaze.scale.set(1,1,1);
 const removed=new Set();e.gaze.traverse(o=>{o.userData.detached=true;if(o.isMesh)removed.add(o);});
 this.parts=this.parts.filter(o=>!removed.has(o));
 e.eg.updateWorldMatrix(true,false);const eyeN=V3(0,0,1).applyQuaternion(e.eg.getWorldQuaternion(new THREE.Quaternion())).normalize();if(n)eyeN.lerp(n,.2).normalize();
 const push=eyeN.clone().multiplyScalar(rnd(1.25,1.75));push.add(V3(rnd(-.35,.35),rnd(.5,1),rnd(-.18,.18)));if(dir)push.addScaledVector(dir,-.18);
 this.bits=this.bits||[];this.bits.push({obj:e.gaze,v:push,w:V3(rnd(-9,9),rnd(-12,12),rnd(-8,8)),r:.043,bounce:.35,sound:'eye'});
 // 눈알 뒤에는 새 눈이 아니라 빈 안와만 남긴다.
 const r=e.r,socket=grp(e.eg,null,'emptySocket');
 const cavity=mk(eyeCapGeo(r*.99,1.18,false),this.M.mouth,socket,{p:[0,0,-.012],s:[1,1,.28],cast:false});cavity.userData.noHit=true;
 const rim=mk(new THREE.TorusGeometry(r*.92,.0048,6,28),this.M.mouth,socket,{p:[0,0,-.001],cast:false});rim.userData.noHit=true;
 e.socket=socket;e.lizard=false;
 const p=e.eg.getWorldPosition(V3());
 BLOOD.clearDecalsNear('head',p,.06,null);BLOOD.stopNear(this.bones.head,p,.06);
 BLOOD.addWound('head',p,eyeN,{rate:.012,tau:30,kind:'hole'});BLOOD.spray(p,eyeN,12,{min:1,max:3,spread:.75});
 AUDIO.pop(.9);this.bigEvent=true;
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
  this.bits.push({obj:m,v,w:V3(rnd(-14,14),rnd(-14,14),rnd(-14,14)),r:s*.4,bounce:.12,sound:i===0?'flake':null,ttl:rnd(4,6)});
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
 const nearestEye=()=>{
  const live=this.eyes.map((e,i)=>({e,i})).filter(x=>!x.e.ejected);if(!live.length)return -1;
  live.sort((a,b)=>a.e.eg.getWorldPosition(V3()).distanceToSquared(pt)-b.e.eg.getWorldPosition(V3()).distanceToSquared(pt));return live[0].i;
 };
 // 단계마다 따로 표시해 둔다(앞 단계를 건너뛰어도 뒤 단계가 막히지 않게)
 const hd=this.headDone||(this.headDone={});
 if(this.headGunHits>=3&&!hd.s1){hd.s1=true;if(this.crownOn!==false)this.knockCrown(dir);this.peelSkin(seg,pt,n,.05);}
 if(this.headGunHits>=6&&!hd.s2&&(G.kd>=2||dead)){hd.s2=true;if(this.eyes.every(e=>!e.ejected)){const i=nearestEye();if(i>=0)this.ejectEye(i,n,dir);}this.peelSkin(seg,pt,n,.06);}
 if(this.headGunHits>=9&&!hd.s3&&(G.kd>=3||dead)){hd.s3=true;if(dead){const i=nearestEye();if(i>=0)this.ejectEye(i,n,dir);}this.peelSkin(seg,pt,n,.068);}
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
 const fling=(o,sp=1)=>{if(!o||!o.parent)return;o.updateWorldMatrix(true,true);scene.attach(o);const rm=new Set();o.traverse(c=>{c.userData.detached=true;if(c.isMesh)rm.add(c);});this.parts=this.parts.filter(x=>!rm.has(x));
  const v=V3().subVectors(o.getWorldPosition(V3()),center).normalize().multiplyScalar(rnd(1.2,2.4)*sp).add(V3(rnd(-.4,.4),rnd(.8,1.8),rnd(.2,.8)));
  this.bits.push({obj:o,v,w:V3(rnd(-10,10),rnd(-10,10),rnd(-10,10)),r:.03,bounce:.2,corners:this.limbCorners(o)});};
 for(const m of this.maskParts)fling(m);
 for(const b of this.brows){b.gone=true;fling(b.tube.mesh,.8);}
 fling(this.noseG,1.2);fling(this.bRoot,.7);if(this.topknot)fling(this.topknot);
 this.nostrils=[];this.noseBleeding=false;
 // 드러난 살갗은 비늘(얼굴·목·손 모두)
 const M=this.M;
 M.skin.map=LIZ_TEX(6,3);M.skin.color.set('#ffffff');M.skin.needsUpdate=true;
 M.skinD.map=LIZ_TEX(6,3);M.skinD.color.copy(col('#b8d090'));M.skinD.needsUpdate=true;
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
  }else if(kind==='slash'&&h.slashFrom){
   const a=h.slashFrom,b=pt,mid=V3().addVectors(a,b).multiplyScalar(.5),len=a.distanceTo(b),ang=this.angleOnSurface(a,b,n);
   const half=Math.max(.014,len*.78),cw=isHead?.011:.014,limb=this.limbOf(h.part);
   if(!limb)BLOOD.decal(skin?'cutSkin':'cut',seg,mid,n,skin?cw*1.25:cw,{aspect:Math.max(1.8,half/cw),angle:ang,grid:8});
   const bone=this.bones[seg];bone.updateWorldMatrix(true,false);
   BLOOD.addWound(seg,mid,n,{rate:clamp(len*.3,.006,.02)*(artery?2.5:1),tau:22,artery,kind:'cut',line:[bone.worldToLocal(a.clone()),bone.worldToLocal(b.clone())]});
   for(let i=0;i<Math.min(3,Math.ceil(len*40));i++){const q=V3().copy(a).lerp(b,rnd(.1,.9));const pr=BLOOD.project(q,n,.05);if(pr)BLOOD.startRiv(pr.seg||seg,pr.point,pr.normal,{w:rnd(.003,.0048),maxLen:rnd(.08,.3)});}
   BLOOD.spray(mid,n,clamp(Math.round(len*120),4,14),{max:2.2});
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
   if((tool==='knife'||tool==='spear')&&kind==='stab')this.ejectEye(i,n,dir);
  }
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
  this.bits=this.bits||[];this.bits.push({obj:m,v:V3(dir.x*1.5+rnd(-.6,.6),rnd(1.2,2.2),rnd(.6,1.6)),w:V3(rnd(-20,20),rnd(-20,20),rnd(-20,20)),r:.012,bounce:.4,sound:'tooth'});
  if(PREF.blood)BLOOD.spray(p,V3(0,.2,1),8,{max:1.8});
  this.toothSpit=(this.toothSpit||0)+1;
  AUDIO.tooth();this.bigEvent=true;FX.word('팅!',p,{size:40,color:'#ffffff',force:true,dx:36,dy:-10});
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
  const g=o.geometry;if(g&&!shared.has(g)&&!seen.has(g)){seen.add(g);g.dispose();for(let i=this.disposables.length-1;i>=0;i--)if(this.disposables[i]===g)this.disposables.splice(i,1);}
  for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&m.userData&&m.userData.detachedOwned)ownedMats.add(m);
 });
 for(const m of ownedMats){m.dispose();for(let i=this.disposables.length-1;i>=0;i--)if(this.disposables[i]===m)this.disposables.splice(i,1);}
 if(this.goreMeshes)this.goreMeshes=this.goreMeshes.filter(m=>!nodes.has(m));
 if(this.limbCaps)for(const k in this.limbCaps)if(nodes.has(this.limbCaps[k]))delete this.limbCaps[k];
},
// 바닥에 누운 팔다리 조각: 재질이 같은 메시를 하나로 합치고 그림자를 끈다
bakePiece(root){
 root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),groups=new Map();
 root.traverse(o=>{if(!o.isMesh||!o.visible||Array.isArray(o.material)||!o.geometry||!o.geometry.attributes.position||o.userData.gore||o.userData.decal||o.renderOrder)return;for(let n=o;n&&n!==root;n=n.parent)if(!n.visible)return;const k=o.material.uuid;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
 for(const list of groups.values()){const g=mergeMeshes(list,inv);if(isFleshMat(list[0].material))ensureDmg(g);const m=new THREE.Mesh(g,list[0].material);m.castShadow=false;m.receiveShadow=true;m.userData.noHit=true;m.userData.detached=true;
  for(const o of list){o.removeFromParent();this.releaseGeometry(o.geometry);}root.add(m);}
},
updateBits(dt){
 if(!this.bits)return;
 if(this.bits.some(b=>b.dead))this.bits=this.bits.filter(b=>!b.dead);

 for(const b of this.bits){
  // 잘린 팔다리는 도마뱀 꼬리처럼 한동안 꿈틀거리고, 가끔 바닥에서 튀어 오른다
  if(b.twitch&&b.twitch.t>=b.twitch.dur&&b.rest&&!b.baked){b.baked=true;this.bakePiece(b.obj);}
  if(b.ttl!=null&&b.rest){b.ttl-=dt;if(b.ttl<=0){b.dead=true;b.obj.removeFromParent();this.releaseLoose(b.obj);continue;}}
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
  if(this.crownOn===false)return;const t=this.crownTilt||0;
  this.crownTilt=Math.max(0,t-dt*.01);
  this.crown.rotation.set(this.crownRest.r.x-t*.2,0,t*.45);this.crown.position.set(this.crownRest.p.x+t*.035,this.crownRest.p.y-t*.012,this.crownRest.p.z);
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
  this.bits=this.bits||[];this.bits.push({obj:piece,v:dirW.multiplyScalar(rnd(1,1.5)).add(V3(rnd(-.2,.2),rnd(.6,1),rnd(.3,.6))),w:V3(rnd(-6,6),rnd(-6,6),rnd(-8,8)),r:.05,corners,bounce:.3,sound:'halo'});
  AUDIO.haloCrack(1.2);
 },
 // 꺼진 후광이 머리 위로 빠져 목에 걸린다: 머리 위로 들렸다가 수평으로 누워 뚝 떨어지고, 어깨에 쨍그랑 얹혀 덜렁거린다
 haloDrop(){
  const h=this.halo;if(!h||h.falling)return;h.on=false;h.goDark=true;h.dark=Math.max(h.dark,.7);this.haloPaint(h.bright);
  h.plate.visible=false;
  const chest=this.bones.chest,r=h.root;r.updateWorldMatrix(true,true);chest.attach(r);
  r.quaternion.multiply(h.tilt.quaternion);h.tilt.quaternion.identity();h.tilt.rotation.set(0,0,0);
  const q1=new THREE.Quaternion().setFromEuler(new THREE.Euler(.3,0,rnd(.1,.2)*(Math.random()<.5?-1:1))).multiply(new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),-PI/2));
  h.falling={t:0,p0:r.position.clone(),q0:r.quaternion.clone(),pTop:V3(0,1.02,.03),p1:V3(0,.335,.02),q1,landed:false,wob:new Spring3(70,4.5),taps:0};
  AUDIO.haloCrack(.7);
 },
 haloFallUpdate(dt){
  const h=this.halo,f=h.falling,r=h.root;f.t+=dt;
  if(h.dark<1){h.dark=Math.min(1,h.dark+dt/.45);this.haloPaint(h.bright);}
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
  tape:S('#e7ddc8',{roughness:.86}),bamboo:S('#c7ad63',{roughness:.5}),bambooD:S('#9c8038',{roughness:.55}),bambooTip:S('#efe4c0',{roughness:.4}),rope:S('#6b5330',{roughness:.82}),
  blood:S('#1d4bc4',{roughness:.12}),bloodD:S('#163aa0',{roughness:.14})};
 // 칼이 몸에 들어간 만큼은 안 보이게: 피부 자리에 자르는 면을 두고 칼날·칼에 묻은 피에만 적용한다
 const clip=new THREE.Plane(new THREE.Vector3(0,0,1),1e3);
 renderer.localClippingEnabled=true;
 for(const m of [M.blade,M.edge,M.blood,M.bambooTip,M.bloodD])m.clippingPlanes=[clip];
 let clipOn=false;
 function setClip(T,dir){clip.normal.copy(dir).negate();clip.constant=dir.dot(T);clipOn=true;}

 /* 인간의 맨주먹(붕대 감은 큰 주먹): +z가 주먹 앞(손가락 마디), +y가 손등. 황동 없이 더 크고 묵직하게 */
 function fist(parent,s){
  const g=grp(parent);
  mk(sphereGeo(24),M.skin,g,{p:[0,.004,-.016],s:[.054,.038,.058]});
  for(let i=0;i<4;i++){const x=s*(-.036+i*.024);
   mk(capsuleGeo(.017,.026,12),M.skin,g,{p:[x,.002,.036],r:[PI/2,0,0]});          // 첫마디(앞으로)
   mk(sphereGeo(14),M.skinD,g,{p:[x,.018,.044],s:[.014,.01,.012],cast:false});    // 마디 혹
   mk(capsuleGeo(.016,.024,10),M.skin,g,{p:[x,-.028,.022],r:[0,0,PI/2]});         // 둘째마디(아래로 말림)
   mk(sphereGeo(10),M.nail,g,{p:[x,-.042,.016],s:[.008,.005,.009],cast:false});}
  const th=grp(g,[-s*.05,-.022,-.004]);th.rotation.set(.2,s*.9,s*.35);
  mk(capsuleGeo(.018,.04,10),M.skin,th,{p:[0,0,.022],r:[PI/2,0,0]});
  mk(sphereGeo(10),M.nail,th,{p:[0,.01,.05],s:[.009,.006,.01],cast:false});
  mk(cylGeo(.038,.04,.08,18),M.skin,g,{p:[0,-.002,-.085],r:[PI/2,0,0]});          // 손목
  // 손등·마디에 감은 천(붕대): 운명에 맞서는 각오
  for(const z of [.03,-.006,-.04]){const m=mk(cylGeo(.057,.057,.018,18,true),M.tape,g,{p:[0,.002,z],r:[PI/2,0,0],cast:false});m.scale.set(1,.72,1);}
  mk(new THREE.BoxGeometry(.028,.055,.02),M.tape,g,{p:[0,.006,-.004],r:[.1,0,0],cast:false});
  // 엄지 조각을 주먹 그룹으로 옮긴 뒤 재질별로 합친다
  g.updateMatrixWorld(true);for(const m of [...th.children]){g.attach(m);}th.removeFromParent();mergeChildren(g);
  return g;
 }
 /* 팔뚝+소매: +y 방향으로. 소매 끝은 투명하게 사라진다 */
 const fadeTex=canvasTex(4,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#000');gr.addColorStop(.55,'#000');gr.addColorStop(.92,'#bcbcbc');gr.addColorStop(1,'#bcbcbc');g.fillStyle=gr;g.fillRect(0,0,w,h);},{srgb:false});
 const sleeveMat=S('#2c3752',{roughness:.78,transparent:true,alphaMap:fadeTex,depthWrite:false});
 function arm(){const g=grp(root);const sl=grp(g);const m=mk(cylGeo(.036,.046,.36,18,true),sleeveMat,sl,{p:[0,.18+.1,0]});m.renderOrder=5;
  mk(cylGeo(.028,.034,.14,16),M.skin,g,{p:[0,.055,0]});const cf=mk(cylGeo(.042,.042,.03,18),M.cuff,g,{p:[0,.115,0]});return {g,sl,cf};}
 const R={hand:grp(root),arm:arm()},L={hand:grp(root),arm:arm()};
 R.fist=fist(R.hand,1);L.fist=fist(L.hand,-1);R.fist.scale.setScalar(1.02);L.fist.scale.setScalar(1.02);
 // 칼: 식칼(날이 앞으로, 날 끝은 아래)
 const knife=grp(R.hand);knife.scale.setScalar(1.25);
 const KREACH=.29*1.25;// 손에서 칼끝까지
 {const k=knife;const hd=grp(k,[0,.004,-.01]);mk(new THREE.BoxGeometry(.022,.026,.11),M.handle,hd,{p:[0,0,0]});for(const z of [-.035,0,.033])mk(cylGeo(.0042,.0042,.024,8),M.rivet,hd,{p:[0,0,z],r:[0,0,PI/2]});
  mk(new THREE.BoxGeometry(.026,.03,.01),M.steelD,k,{p:[0,.004,.05]});
  const sh=new THREE.Shape();sh.moveTo(0,-.016);sh.lineTo(.17,-.016);sh.quadraticCurveTo(.215,-.014,.235,.004);sh.lineTo(.2,.016);sh.lineTo(0,.017);sh.closePath();
  const bg=new THREE.ExtrudeGeometry(sh,{depth:.0026,bevelEnabled:true,bevelThickness:.0008,bevelSize:.0012,bevelSegments:1,curveSegments:10});bg.translate(0,0,-.0013);
  mk(bg,M.blade,k,{p:[0,.004,.054],r:[0,-PI/2,0]});
  mk(new THREE.BoxGeometry(.0009,.0035,.175),M.edge,k,{p:[0,-.011,.145],cast:false});
  // 칼에 묻은 피: 날 양면 앞쪽
  const bl=grp(k);for(const x of [-.0024,.0024]){mk(new THREE.BoxGeometry(.0006,.022,.12),M.blood,bl,{p:[x,-.003,.215],cast:false});mk(sphereGeo(8),M.blood,bl,{p:[x,-.012,.17],s:[.0008,.006,.02],cast:false});}
  bl.visible=false;k.userData.blood=bl;}
 // 민중의 죽창(쪼갠 대나무를 날카롭게 깎은 창): +z가 창끝, 손은 원점 근처를 쥔다
 const spear=grp(R.hand);
 {const sp=spear;
  mk(cylGeo(.0155,.017,.6,14),M.bamboo,sp,{p:[0,0,.2],r:[PI/2,0,0]});                                  // 대나무 자루
  for(const z of [-.06,.06,.18,.3,.42])mk(new THREE.TorusGeometry(.0172,.0035,6,16),M.bambooD,sp,{p:[0,0,z],cast:false}); // 대나무 마디
  mk(cylGeo(.0001,.0158,.15,12),M.bambooTip,sp,{p:[0,.006,.52],r:[PI/2,0,0]});                           // 쪼개져 뾰족한 끝
  mk(new THREE.CircleGeometry(.0158,14),M.bambooTip,sp,{p:[0,.012,.5],r:[-PI/2.5,0,0],s:[1,2.2,1],cast:false}); // 비스듬히 깎인 단면
  for(const z of [.41,.43,.448])mk(new THREE.TorusGeometry(.0182,.0026,6,16),M.rope,sp,{p:[0,0,z],cast:false}); // 끝을 묶은 노끈
  const bl=grp(sp);mk(cylGeo(.0001,.0168,.1,10),M.bloodD,bl,{p:[0,.006,.55],r:[PI/2,0,0],cast:false});mk(sphereGeo(8),M.bloodD,bl,{p:[0,-.004,.45],s:[.007,.004,.03],cast:false});bl.visible=false;sp.userData.blood=bl;
 }
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
  const fl=new THREE.MeshBasicMaterial({map:flTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const flash=grp(g,[0,.047,.13]);mk(new THREE.PlaneGeometry(.15,.15),fl,flash,{cast:false});mk(new THREE.PlaneGeometry(.07,.24),fl,flash,{r:[PI/2,0,0],p:[0,0,.09],cast:false});mk(new THREE.PlaneGeometry(.24,.07),fl,flash,{r:[0,PI/2,0],p:[0,0,.09],cast:false});
  flash.visible=false;g.userData.flash=flash;
  g.userData.light=new THREE.PointLight(0xffb060,0,1.4,2);g.userData.light.position.set(0,.05,.16);g.add(g.userData.light);
  g.position.set(0,.022,.055);g.scale.setScalar(1.08);
 }
 const tools={hand:null,knife,spear,gun};
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
 // 도구칸 위쪽 끝(화면 좌표 -1~1)
 function dockY(){const el=$('#tools');if(!el||!el.offsetParent)return -1;return 1-2*el.getBoundingClientRect().top/innerHeight;}

 /* ---- 상태 ---- */
 const st={tool:'hand',acts:[],nextHand:'R',time:0,ammo:8,reload:0,recoil:0,slide:0,flash:0,aim:V3(0,0,-1),aimGoal:V3(0,0,-1),lastShot:-9,slash:null,bloody:{},swapT:1};
 const rest={R:{p:V3(),q:new THREE.Quaternion()},L:{p:V3(),q:new THREE.Quaternion()}};
 const KN_DIR=V3(-.5,.55,-1).normalize(),KN_UP=V3(.35,1,0);
 const SP_DIR=V3(-.28,.26,-1).normalize(),SP_UP=V3(.22,1,0);
 const BLADE=t=>t==='knife'||t==='spear';
 const REACH={knife:.29*1.25,spear:.6};
 // 날붙이를 들고 있는 자리(화면 오른쪽 아래, 날이 화면 안쪽으로 눕게): 몸을 덜 가린다
 const KREST={x:.9,y:.1,d:.48,dir:V3(-.08,.6,-1).normalize()};
 const SREST={x:.86,y:.16,d:.46,dir:V3(-.06,.34,-1).normalize()};
 function computeRest(){
  computeHeld();
  const pr=portrait(),dy=pr?dockY():-1;
  for(const k of ['R','L']){const s=k==='R'?1:-1;const r=rest[k];
   if(st.tool==='hand'){at(s*(pr?.74:.46),pr?dy+.03:-.76,.56,r.p);orient(r.q,V3(-s*.3,.8,-1),V3(s*.85,.4,.2));}
   else if(st.tool==='knife'){at(pr?KREST.x:.5,pr?dy+KREST.y:-.74,KREST.d,r.p);orient(r.q,KREST.dir,KN_UP);}
   else if(st.tool==='spear'){at(pr?SREST.x:.5,pr?dy+SREST.y:-.72,SREST.d,r.p);orient(r.q,SREST.dir,SP_UP);}
   else{at(pr?.6:.36,pr?dy+.16:-.62,.42,r.p);orient(r.q,V3(-.08,.05,-1),UP);}
  }
 }
 const H={R:{p:V3(),q:new THREE.Quaternion(),anch:V3()},L:{p:V3(),q:new THREE.Quaternion(),anch:V3()}};
 /* ---- 붙잡힘: 수혜자들이 내 아래팔을 잡고 늘어진다. 뿌리치면 팔이 휙 돌아온다 ---- */
 const GR={L:0,R:0,goal:{L:0,R:0},shake:-1};
 const held={R:V3(),L:V3()},heldQ={R:new THREE.Quaternion(),L:new THREE.Quaternion()};
 function computeHeld(){const pr=portrait();for(const k of ['R','L']){const s=k==='R'?1:-1;at(s*(pr?.5:.38),pr?-.66:-.62,.5,held[k]);orient(heldQ[k],V3(-s*.25,.9,-.5),V3(s*.6,.5,.6));}}
 function setGrab(side,w){GR.goal[side]=w;}
 function shakeOff(){GR.shake=0;}
 function handPos(side,out){return out.copy(H[side].p);}
 function anchorPos(side,out){return out.copy(H[side].anch);}

 function setTool(t){st.tool=t;st.acts.length=0;st.slash=null;st.swapT=0;for(const k in tools)if(tools[k])tools[k].visible=k===t;L.hand.visible=L.arm.g.visible=t==='hand';computeRest();}
 function busy(side){return st.acts.some(a=>a.side===side&&a.t<a.contact+.03);}
 /* 공격 시작: 화면 좌표 sx,sy. kind: jab|hook|upper|stab */
 function attack(kind,sx,sy,info){
  const tool=st.tool;if(tool==='gun')return fire(sx,sy,info);
  let side='R';
  if(tool==='hand'){side=st.nextHand;if(busy(side)){side=side==='R'?'L':'R';if(busy(side))return false;}st.nextHand=side==='R'?'L':'R';}
  else if(st.acts.some(a=>a.t<a.contact+.04))return false;
  if(st.acts.length>2)st.acts.shift();
  const [nx,ny]=ndc(sx,sy),s=side==='R'?1:-1,pr=portrait();
  const target=at(nx,ny,tool==='hand'?.85:.72);
  const a={tool,kind,side,s,sx,sy,info,t:0,target,done:false,hit:null};
  const W=V3(),C=V3(),Q0=new THREE.Quaternion(),Q1=new THREE.Quaternion();
  if(tool==='hand'){
   const fwd=V3().subVectors(target,ANCH[side]).normalize();a.fwd=fwd;
   if(kind==='hook'){at(s*1.1,ny*.5-.15,.75,W);C.set(lerp(W.x,target.x,.15),target.y+.02,lerp(W.z,target.z,.75));orient(Q0,V3(-s*.6,.1,-.5),V3(0,1,.2));orient(Q1,V3(-s*.75,0,-.65),V3(0,1,0));a.dur=[.07,.07,.05,.13];}
   else if(kind==='upper'){at(s*.25,-1.2,.7,W);C.set(target.x,lerp(W.y,target.y,.2),lerp(W.z,target.z,.7));orient(Q0,V3(-s*.1,1,-.3),V3(0,.2,1));orient(Q1,V3(0,.8,-.6),V3(0,.3,1));a.dur=[.07,.075,.05,.13];}
   else{W.copy(rest[side].p).add(V3(s*.02,-.04,.08));C.copy(W).lerp(target,.5);C.y+=.03;orient(Q0,V3(-s*.2,.4,-1),V3(s*.9,.4,.2));orient(Q1,fwd,V3(-s*.25,1,0));a.dur=[.04,.055,.045,.12];}
  }else if(BLADE(tool)){
   const sp=tool==='spear',reach=REACH[tool];
   const H0=at(pr?.42:.4,-.74,sp?.52:.42);const dir=V3().subVectors(target,H0).normalize();a.dir1=dir;a.hand1=V3().copy(target).addScaledVector(dir,-reach);
   a.hand0=V3().copy(rest.R.p).add(V3(.02,-.03,.09));a.dir0=(sp?SP_DIR.clone():V3(-.15,.3,-1).normalize());a.pen=sp?.22:.12;a.dur=sp?[.06,.085,.15,.18]:[.05,.06,.17,.15];
  }
  a.W=W;a.C=C;a.Q0=Q0;a.Q1=Q1;a.contact=a.dur[0]+a.dur[1];a.total=a.dur.reduce((x,y)=>x+y,0);
  st.acts.push(a);AUDIO.whoosh(tool==='hand'?(kind==='jab'?.6:.85):.5,kind);
  return true;
 }
 /* 총: 탄은 무한. 누르면 한 발, 꾹 누르면 연사 */
 let fireCool=0;
 function fire(sx,sy,info){
  if(fireCool>0)return false;
  fireCool=.15;st.recoil=1;st.slide=1;st.flash=.035;st.lastShot=st.time;
  const [nx,ny]=ndc(sx,sy);st.aimGoal.copy(at(nx,ny,3)).normalize();st.aim.copy(st.aimGoal);
  const sh=shells[shellI++%shells.length];sh.life=.9;sh.m.visible=true;gun.updateWorldMatrix(true,false);sh.m.position.copy(gun.localToWorld(V3(.016,.052,.03)));sh.v.set(rnd(.6,.9),rnd(.7,1.1),rnd(.1,.3));sh.w.set(rnd(10,20),rnd(5,10),rnd(10,20));
  AUDIO.gunshot();
  if(st.onFire)st.onFire(sx,sy,info);
  return true;
 }
 function reload(){}
 /* 칼로 긋기: 손가락을 따라 칼끝이 움직이고, 몸에 닿으면 날이 살을 파고든다 */
 function slashStart(sx,sy){st.slash={sx,sy,px:sx,py:sy,t:0,len:0,lastWhoosh:st.time,touching:false,touchUntil:-1,bite:0};AUDIO.whoosh(.5,'slash');}
 function slashMove(sx,sy){const s=st.slash;if(!s)return;const d=Math.hypot(sx-s.sx,sy-s.sy);s.len+=d;s.px=s.sx;s.py=s.sy;s.sx=sx;s.sy=sy;if(d>14&&st.time-s.lastWhoosh>.18){s.lastWhoosh=st.time;AUDIO.whoosh(.4,'slash');}}
 function slashEnd(){st.slash=null;}

 /* ---- 매 프레임 ---- */
 const tmpP=V3(),tmpQ=new THREE.Quaternion(),tmpQ2=new THREE.Quaternion(),tv=V3(),tv2=V3(),tv3=V3();
 function placeArm(side){
  const h=side==='R'?R:L,ar=h.arm;h.hand.updateMatrix();
  const wrist=tv.set(0,0,-.1).applyMatrix4(h.hand.matrix);const A=H[side].anch;const d=tv2.subVectors(A,wrist);d.normalize();
  ar.g.position.copy(wrist);ar.g.quaternion.setFromUnitVectors(UP,d);
 }
 function update(dt,frozen,rdt){
  // 총 반동·칼 긋기는 멈춤(히트스톱)과 상관없이 실제 시간으로 움직인다(쏘는 순간 바로 튀어야 하니까)
  rdt=rdt==null?dt:rdt;
  st.time+=dt;fireCool=Math.max(0,fireCool-rdt);st.swapT=Math.min(1,st.swapT+rdt*4);
  clipOn=false;
  const sway=Math.sin(st.time*1.6)*.004,sway2=Math.cos(st.time*1.1)*.003,dropIn=(1-easeOut3(st.swapT))*.25;
  for(const k of ['R','L']){H[k].p.copy(rest[k].p);H[k].p.y+=sway*(k==='R'?1:-1)-dropIn;H[k].p.x+=sway2;H[k].q.copy(rest[k].q);H[k].anch.copy(ANCH[k]);}
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
     if(hit)h.p.copy(a.target).addScaledVector(a.fwd,lerp(.024,-.06,easeOut(u)));
     else h.p.copy(a.target).addScaledVector(a.fwd,Math.sin(u*PI)*.06);
     h.q.copy(a.Q1);}
    else if(t<a.total){
     // 얼굴 앞에서 빨리 빠진다: 아래·바깥으로 휘며 제자리로
     const u=(t-c-d2)/d3,e=easeOut3(u);
     tmpP.copy(a.target).addScaledVector(a.fwd,hit?-.06:0);
     tv3.copy(h.p);h.p.copy(tmpP).lerp(tv3,e);h.p.y-=Math.sin(e*PI)*.08;h.p.x+=a.s*Math.sin(e*PI)*.05;
     tmpQ.copy(a.Q1).slerp(h.q,e);h.q.copy(tmpQ);}
   }else if(BLADE(a.tool)){
    const reach=REACH[a.tool],RDIR=a.tool==='spear'?SP_DIR:KN_DIR,RUP=a.tool==='spear'?SP_UP:KN_UP;
    let hand,dir;
    if(t<d0){const u=easeOut(t/d0);hand=tv.copy(h.p).lerp(a.hand0,u);dir=tv2.copy(RDIR).lerp(a.dir0,u).normalize();}
    else if(t<c){const u=easeIn((t-d0)/d1);hand=tv.copy(a.hand0).lerp(a.hand1,u);tmpQ.setFromUnitVectors(_fz,a.dir0);tmpQ2.setFromUnitVectors(_fz,a.dir1);tmpQ.slerp(tmpQ2,u);dir=tv2.copy(_fz).applyQuaternion(tmpQ);}
    else if(t<c+d2){
     const u=(t-c)/d2;dir=tv2.copy(a.dir1);
     if(hit&&!hard){// 날이 몸 안으로 들어간다(피부 면에서 잘려 보임). 후광처럼 딱딱한 데는 튕겨 나온다
      const k=easeOut(Math.min(1,u*1.7));hand=tv.copy(a.hand1).addScaledVector(a.dir1,k*a.pen);setClip(a.target,a.dir1);
     }else hand=tv.copy(a.hand1).addScaledVector(a.dir1,Math.sin(u*PI)*(hard?-.035:.05));}
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
  if(BLADE(st.tool)&&st.slash){const sp=st.tool==='spear',reach=REACH[st.tool],RUP=sp?SP_UP:KN_UP;
   const s=st.slash,[nx,ny]=ndc(s.sx,s.sy),T=at(nx,ny,.74),H0=at(sp?.95:1.05,-1.05,sp?.68:.62);const dir=tv.subVectors(T,H0).normalize();
   const touching=s.touching||G.time<s.touchUntil;
   s.bite=damp(s.bite,touching?1:0,touching?30:16,rdt);
   H.R.p.copy(T).addScaledVector(dir,-reach+s.bite*.1);if(s.bite>.02)setClip(T,dir);
   const mv=tv2.set(s.sx-s.px,-(s.sy-s.py),0);if(mv.lengthSq()>1)mv.normalize();else mv.set(1,0,0);orient(H.R.q,dir,tv3.set(-mv.y,mv.x,0).lerp(RUP,.3));}
  if(!clipOn){clip.normal.set(0,0,1);clip.constant=1e3;}
  // 총: 겨냥·반동
  if(st.tool==='gun'){
   st.recoil=Math.max(0,st.recoil-rdt*6);st.slide=Math.max(0,st.slide-rdt*14);st.flash=Math.max(0,st.flash-rdt);
   if(st.time-st.lastShot>.9)st.aimGoal.lerp(_aimRest,1-Math.exp(-rdt*3)).normalize();
   const h=H.R;st.aim.lerp(st.aimGoal,1-Math.exp(-rdt*16));const muzzleTo=tv.copy(st.aim).multiplyScalar(3).sub(h.p).normalize();
   orient(h.q,muzzleTo,UP);
   // 반동: 30ms 만에 확 튀었다가 천천히 내려온다
   const u=1-st.recoil,k=st.recoil<=0?0:u<.15?u/.15:Math.pow(1-(u-.15)/.85,2);
   tmpQ.setFromAxisAngle(tv2.set(1,0,0),-k*.55);h.q.multiply(tmpQ);h.p.addScaledVector(muzzleTo,-k*.075);h.p.y+=k*.022;
   gun.userData.slide.position.z=-st.slide*.026;const fl=gun.userData.flash;fl.visible=st.flash>0;fl.rotation.z=rnd(0,TAU);fl.scale.setScalar(rnd(1.05,1.45));gun.userData.light.intensity=st.flash>0?3:0;
  }
  // 붙잡힘·뿌리침
  for(const k of ['R','L']){const s=k==='R'?1:-1;GR[k]=damp(GR[k],GR.goal[k],9,rdt);const w=GR[k];
   if(w>.001){const h=H[k];tmpP.copy(held[k]);tmpP.x+=Math.sin(st.time*21+(k==='R'?0:2))*.009*w;tmpP.y+=Math.cos(st.time*17+(k==='R'?1:0))*.008*w;h.p.lerp(tmpP,w);h.q.slerp(heldQ[k],w);}
   if(GR.shake>=0){const u=GR.shake/.55,e=Math.sin(Math.min(1,u)*PI),h=H[k];h.p.x+=s*.17*e;h.p.y+=.21*e*(1-u*.4);h.p.z+=.03*e;tmpQ.setFromAxisAngle(tv2.set(0,0,1),-s*.8*e);h.q.premultiply(tmpQ);}}
  if(GR.shake>=0){GR.shake+=rdt;if(GR.shake>.55)GR.shake=-1;}
  for(const s of shells)if(s.life>0){s.life-=rdt;s.v.y-=4*rdt;s.m.position.addScaledVector(s.v,rdt);s.m.rotation.x+=s.w.x*rdt;s.m.rotation.y+=s.w.y*rdt;if(s.life<=0)s.m.visible=false;}
  // 손 배치
  for(const k of ['R','L']){const h=k==='R'?R:L;h.hand.position.copy(H[k].p);h.hand.quaternion.copy(H[k].q);if(h.hand.visible)placeArm(k);}
  knife.userData.blood.visible=!!st.bloody.knife&&PREF.blood;spear.userData.blood.visible=!!st.bloody.spear&&PREF.blood;
 }
 function reset(){st.acts.length=0;st.slash=null;st.nextHand='R';st.time=0;st.ammo=8;st.reload=0;st.bloody={};st.recoil=0;st.slide=0;st.flash=0;st.lastShot=-9;st.swapT=1;fireCool=0;st.aimGoal.set(0,0,-1);st.aim.set(0,0,-1);gun.userData.slide.position.z=0;gun.userData.flash.visible=false;gun.userData.light.intensity=0;for(const s of shells){s.life=0;s.m.visible=false;}}
 setTool('hand');
 return {root,st,setTool,attack,fire,reload,slashStart,slashMove,slashEnd,update,reset,computeRest,KREST,setGrab,shakeOff,handPos,anchorPos,get busy(){return st.acts.length>0;}};
})();
const _fz=V3(0,0,1),_aimRest=V3(-.04,.12,-1).normalize();
/* ===== 8. 진행과 입력 =====
 * 실제로 맞힌 피해만큼 버팀 게이지가 줄어든다.
 * 100 → 75(옥좌) → 50(무릎) → 25(엉덩방아) → 0(마지막 다운). */
const PREF={sound:true,blood:true,vibe:true,shake:true,deform:true};
metalEnv(VM.root);
try{const p=JSON.parse(localStorage.getItem('palja.prefs')||'{}');for(const k of Object.keys(PREF))if(typeof p[k]==='boolean')PREF[k]=p[k];}catch(_){}
const KD_AT=[75,50,25,0],KD_TYPE=['throne','kneel','floor','final'];
const G={time:0,running:false,raf:0,E:null,mode:'fight',tool:'hand',bar:100,shown:100,shownHold:0,lag:100,lastHit:-99,kd:0,active:0,started:false,hits:0,t0:0,tEnd:0,hitstop:0,slow:0,ended:false,paused:false,inputLocked:false,cardShown:false,result:null,round:0,retired:[],offerPending:false,offerOpen:false,offerBreaking:false,crowdEntered:false,crowdWarned:false,crowdBeatUntil:0,crowdSwapAt:0,crowdSwapLines:null,crowdHideAt:0,revivalUsed:false,revivalPending:false,revival:null,revived:false,brittle:false,printerShown:false,printerHits:0};
const HINTS={hand:'누르면 맨주먹 잽 · 옆으로 밀면 훅 · 위로 밀면 어퍼컷',spear:'누르면 찔러 꿰뚫기 · 그으면 긁어 베기',knife:'누르면 찌르기 · 그으면 베기 · 팔다리는 세 번 그으면 잘림',gun:'누르면 쏘기 · 꾹 누르면 연사'};
let hintUntil=0;
function hint(text,dur=3.6){const el=$('#hint');el.textContent=text;el.classList.remove('off');hintUntil=G.time+dur;}

/* ---- 전투 대사: 조작을 멈추지 않고, 새 사건이 오면 지난 대사를 끊는다 ---- */
const TALK={q:[],cur:null,left:0,gap:0};

function clearTalk(){
 TALK.q.length=0;
 TALK.cur=null;
 TALK.left=TALK.gap=0;

 const el=$('#talk');
 if(el){
  el.className='talk';
  el.setAttribute('aria-hidden','true');
 }
}

function queueTalk(lines,replace=false){
 if(replace)clearTalk();

 for(const x of lines){
  TALK.q.push({
   who:x[0],
   text:x[1],
   dur:x[2]||2.2,
   delay:x[3]||0
  });
 }
}

function talkBusy(){return !!(TALK.cur||TALK.q.length||TALK.gap>0);}

function updateTalk(dt){
 const el=$('#talk');
 if(!el)return;

 if(TALK.cur){
  TALK.left-=dt;
  if(TALK.left>0)return;

  TALK.cur=null;
  TALK.gap=.12;
  el.classList.remove('on');
  el.setAttribute('aria-hidden','true');
  return;
 }

 if(TALK.gap>0){
  TALK.gap-=dt;
  return;
 }

 const n=TALK.q[0];
 if(!n)return;

 n.delay-=dt;
 if(n.delay>0)return;

 TALK.q.shift();
 TALK.cur=n;
 TALK.left=n.dur;

 el.className='talk '+n.who;
 $('#talkWho').textContent=n.who==='boss'?'운명 설계자':'나';
 $('#talkText').textContent=n.text;
 el.setAttribute('aria-hidden','false');

 requestAnimationFrame(()=>{
  if(TALK.cur===n)el.classList.add('on');
 });
}

function onHeadRegrowTalk(){
 if(G.ended||G.headTalked||G.inputLocked||G.revival)return;

 G.headTalked=true;

 queueTalk([
  ['boss','정해진 것은 몇 번이고 제자리로 돌아온다.',2.4,0],
  ['player','그럼 몇 번이고 자르면 되지.',1.9,.15]
 ]);
}

/* ---- 맞히기: 화면 좌표 → 운명 설계자 몸 ---- */
const ray=new THREE.Raycaster(),nmat=new THREE.Matrix3();
function visibleChain(o){for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;}
// 맞힐 수 있는 메시 목록(행렬도 이때 한 번 갱신). 칼로 그을 때는 한 번 만들어 여러 점에 같이 쓴다
function pickList(){
 const E=G.E;if(!E)return null;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 return E.parts.filter(o=>o.parent&&!o.userData.detached&&visibleChain(o)&&(o.userData.part!=='tablet'||E.tabletHeld)&&(o.userData.part!=='crown'||E.crownOn!==false)&&(o.userData.part!=='halo'||(E.halo&&E.halo.on)));
}
const _rv2d=new THREE.Vector2();
function pickAll(x,y,list){
 const E=G.E;if(!E)return [];if(!list)list=pickList();
 ray.setFromCamera(_rv2d.set(x/innerWidth*2-1,1-y/innerHeight*2),camera);
 const out=[];
 for(const h of ray.intersectObjects(list,false)){if(h.object.userData.detached)continue;
  nmat.getNormalMatrix(h.object.matrixWorld);const n=h.face?h.face.normal.clone().applyMatrix3(nmat).normalize():ray.ray.direction.clone().negate();
  if(n.dot(ray.ray.direction)>0)n.negate();
  out.push({obj:h.object,point:h.point.clone(),normal:n,part:h.object.userData.part||'chest',dir:ray.ray.direction.clone(),dist:h.distance});
 }
 return out;
}
function pickAt(x,y,list){return pickAll(x,y,list)[0]||null;}
const POWER={hand:{jab:1.15,hook:1.5,upper:1.65},knife:{stab:.95,slash:.45},spear:{stab:1.5,slash:.7},gun:{shot:1.8}};
// 멈춤(히트스톱) 길이: 이 동안 맞은 모습 그대로 멈춰 있다
const STOP={hand:{jab:.036,hook:.05,upper:.058},knife:{stab:.045,slash:.014},spear:{stab:.065,slash:.02},gun:{shot:.018}};
const WORDS={jab:['퍽!','빡!','뻑!'],hook:['퍼억!','빠악!'],upper:['빠악!','뻐억!'],body:['퍽!','뻑!','퍼억!'],stab:['푹!','쑤욱!'],slash:['촤악!','쫘악!'],spearStab:['푸욱!','콰직!','꾸욱!'],spearSlash:['쫘아악!','촤악!']};
function resolveHit(tool,kind,info,side,extra={}){
 const E=G.E;if(!E||!info||G.inputLocked)return {hit:false};
 const gaugeEligible=E.state==='stand';
 const firstContact=!G.started&&!extra.through&&!extra.quiet;
 const dir=info.dir.clone();const s=side==='L'?-1:1;
 if(kind==='hook')dir.add(V3(-s*1.15,0,0));else if(kind==='upper')dir.add(V3(0,1.3,0));
 dir.normalize();
 const power=((POWER[tool]||{})[kind]||1)*(extra.powerMul||1);
 if(!G.started){G.started=true;G.t0=G.time;}
 G.lastHit=G.time;
 if(!extra.through&&!extra.quiet)AUDIO.duck();
 const r=E.takeHit({tool,kind,part:info.part,point:info.point,normal:info.normal,dir,obj:info.obj,power,slashFrom:extra.slashFrom,strokeId:extra.strokeId,through:extra.through});
G.hits++;

if(firstContact){
 queueTalk([
  ['boss','감히 운명에 손을 대?',1.9,0]
 ]);
}

const stop=((STOP[tool]||{})[kind]||.06)*(r.blocked?.75:1)+(r.big?.05:0);
 G.hitstop=Math.max(G.hitstop,extra.through?0:stop);
 if(r.big)G.slow=Math.max(G.slow,.3);
 if(!extra.quiet){impactFX(tool,kind,info,r,dir,s,extra);if(!extra.through)AUDIO.hit(tool,kind,info.part,power,r.blocked);}
 if(PREF.vibe&&navigator.vibrate&&!extra.quiet)try{navigator.vibrate(r.blocked?10:tool==='gun'?26:kind==='slash'?6:kind==='jab'?16:[20,8,26]);}catch(_){}
 damageBar(r.dmg,r,gaugeEligible);
 return {hit:true,blocked:r.blocked,hard:!!r.halo,blood:!r.blocked&&!r.halo&&(tool==='knife'||tool==='spear'||tool==='gun'||E.noseBleeding||E.lipSplit||E.faceCuts>0)};
}
/* 맞은 자리 효과 + 카메라 */
function impactFX(tool,kind,info,r,dir,s,extra){
 const pt=info.point,n=info.normal,head=r.isHead;
 if(r.blocked){
  FX.add('star',FX.lift(pt,n,.05),{size:.13,life:.1,color:'#d9d6e6'});FX.word('탁!',pt,{size:34,color:'#e6e2f2'});
  camHit({shake:.012,push:-.035,dir,kick:.012});return;
 }
 // 후광: 불꽃 튀는 금속
 if(r.halo){
  FX.add('star',FX.lift(pt,n,.03),{size:.12,life:.09,color:'#fff3b8'});
  for(let i=0;i<7;i++)FX.add('glint',FX.lift(pt,n,.03),{size:rnd(.025,.045),life:rnd(.18,.32),start:1,grow:-.6,fade:1.5,vel:V3(rnd(-1.4,1.4),rnd(-.4,1.6),rnd(.2,1)),drag:3,color:'#ffd35a'});
  FX.word(pick(['깡!','쨍!','팅!']),pt,{size:tool==='gun'?44:50,color:'#ffe066',dx:-s*rnd(60,100),dy:-24});
  camHit({dir,kick:.01,shake:.012,push:.025,zoom:.008});return;
 }
 if(tool==='hand'){
  const big=kind!=='jab';
  FX.add('star',FX.lift(pt,n,.05),{size:big?.17:.12,life:big?.12:.1});
  FX.add('glint',FX.lift(pt,n,.07),{size:.07,life:.09,start:.4,grow:1.2});
  if(kind==='upper'||r.heavy)FX.add('ring',FX.lift(pt,n,.04),{size:.17,life:.16,start:.4,grow:1.6,fade:1});
  const list=head?WORDS[kind]:WORDS.body;
  // 글자는 얼굴을 덮지 않게 주먹이 날아온 반대쪽 옆에 띄운다
  FX.word(pick(list),pt,{size:kind==='jab'?46:kind==='hook'?56:62,color:kind==='upper'?'#ff5640':kind==='hook'?'#ffa23a':'#ffd84a',rot:kind==='hook'?s*-12:undefined,dx:-s*rnd(70,110),dy:-20});
  if(kind==='jab')camHit({dir,kick:.018,shake:.016,push:.055,pitch:rnd(-.004,.004),roll:rnd(-.006,.006),zoom:.012});
  else if(kind==='hook')camHit({dir,kick:.022,shake:.02,push:.04,yaw:s*.022,roll:s*.018,zoom:.014});
  else camHit({dir,kick:.02,shake:.022,push:.035,pitch:.024,zoom:.016});
 }else if(tool==='knife'){
  if(kind==='stab'){
   FX.add('bl',FX.lift(pt,n,.04),{size:.12,life:.1});
   for(let i=0;i<3;i++)FX.add('mist',FX.lift(pt,n,.03),{size:rnd(.07,.11),life:rnd(.35,.5),start:.5,grow:1.6,top:false,vel:n.clone().multiplyScalar(rnd(.25,.6)).add(V3(rnd(-.2,.2),rnd(-.05,.25),0)),drag:4,fade:1.4});
   FX.word(pick(WORDS.stab),pt,{size:46,color:'#ff6a55',dx:-rnd(70,110)});
   camHit({dir,kick:.012,shake:.016,push:.07,zoom:.016});
  }else{
   FX.add('mist',FX.lift(pt,n,.02),{size:rnd(.05,.08),life:rnd(.3,.45),start:.5,grow:1.5,top:false,vel:n.clone().multiplyScalar(rnd(.2,.5)).add(V3(rnd(-.15,.15),rnd(0,.2),0)),drag:4,fade:1.4});
   if(extra.firstCut)FX.word(pick(WORDS.slash),pt,{size:50,color:'#ff6a55',rot:rnd(-20,20),dx:rnd(-90,90)});
   camHit({shake:.007,yaw:rnd(-.004,.004)});
  }
 }else if(tool==='spear'){
  if(kind==='stab'){
   FX.add('bl',FX.lift(pt,n,.04),{size:.16,life:.12});FX.add('star',FX.lift(pt,n,.05),{size:.09,life:.06,color:'#fff4dc'});
   for(let i=0;i<4;i++)FX.add('mist',FX.lift(pt,n,.03),{size:rnd(.09,.14),life:rnd(.4,.6),start:.5,grow:1.8,top:false,vel:n.clone().multiplyScalar(rnd(.35,.8)).add(V3(rnd(-.25,.25),rnd(-.05,.3),0)),drag:4,fade:1.4});
   FX.add('ring',FX.lift(pt,n,.04),{size:.17,life:.15,start:.4,grow:1.6,fade:1,color:'#ffd9cf'});
   FX.word(pick(WORDS.spearStab),pt,{size:58,color:'#ff5640',dx:-rnd(80,120),dy:-20});
   camHit({dir,kick:.02,shake:.024,push:.11,zoom:.02});
  }else{
   for(let i=0;i<2;i++)FX.add('mist',FX.lift(pt,n,.02),{size:rnd(.07,.11),life:rnd(.35,.5),start:.5,grow:1.6,top:false,vel:n.clone().multiplyScalar(rnd(.25,.6)).add(V3(rnd(-.2,.2),rnd(0,.25),0)),drag:4,fade:1.4});
   if(extra.firstCut)FX.word(pick(WORDS.spearSlash),pt,{size:56,color:'#ff5640',rot:rnd(-18,18),dx:rnd(-90,90)});
   camHit({shake:.012,yaw:rnd(-.006,.006),push:.03});
  }
 }else if(tool==='gun'){
  FX.add('bl',FX.lift(pt,n,.04),{size:.1,life:.08});
  FX.add('star',FX.lift(pt,n,.05),{size:.07,life:.05,color:'#fff4dc'});
  const back=V3().copy(dir);
  for(let i=0;i<2;i++)FX.add('mist',FX.lift(pt,n,.02),{size:rnd(.08,.13),life:rnd(.4,.6),start:.4,grow:1.8,top:false,vel:n.clone().multiplyScalar(rnd(.35,.9)).add(V3(rnd(-.25,.25),rnd(-.05,.3),rnd(-.1,.1))),drag:3.5,fade:1.3});
  for(let i=0;i<2;i++)FX.add('mist',_fxv.copy(pt).addScaledVector(back,.22),{size:rnd(.1,.16),life:rnd(.4,.6),start:.5,grow:1.7,top:false,vel:back.clone().multiplyScalar(rnd(.6,1.4)).add(V3(rnd(-.3,.3),rnd(0,.3),0)),drag:3,fade:1.3});
  if(head)FX.add('ring',FX.lift(pt,n,.04),{size:.13,life:.13,start:.4,grow:1.5,fade:1,color:'#ffd9cf'});
 }
 if(r.big){camHit({shake:.03,roll:rnd(-.012,.012)});}
}
const _fxv=V3();
function wireEmperor(E){
 E.onImpact=onImpact;E.onDead=onDead;E.onRise=onRise;E.onRiseStart=onRiseStart;E.onLegFall=onLegFall;E.onHeadRegrow=onHeadRegrowTalk;
 E.onCough=()=>{if(E.headDestroyed)return;AUDIO.voice('cough',1);E.face.updateWorldMatrix(true,false);BLOOD.spray(E.face.localToWorld(V3(0,-.12,.2)),V3(0,.1,1),PREF.blood?16:6,{max:1.6});};
}
function focusCanvas(){requestAnimationFrame(()=>{try{canvas.focus({preventScroll:true});}catch(_){canvas.focus();}});}
function openOffer(){
 if(G.mode!=='fight'||G.ended||G.offerOpen||G.offerBreaking)return;
 G.offerAt=0;G.offerPending=false;G.offerOpen=true;G.inputLocked=true;clearPointers();
 const sc=$('#offerScene');sc.hidden=false;sc.className='story-scene';$('#dock').hidden=true;
 if(G.E&&G.E.down)G.E.down.stay=Math.max(G.E.down.stay,1e6);
 requestAnimationFrame(()=>$('#offerPaper').focus());
}
function finishOffer(){
 const sc=$('#offerScene');sc.hidden=true;sc.className='story-scene';
 G.offerOpen=false;G.offerBreaking=false;G.offerBreakAt=0;G.inputLocked=false;$('#dock').hidden=false;
 if(G.E&&G.E.down)G.E.down.stay=Math.min(G.E.down.stay,.35);
 queueTalk([['player','니들이 정한 팔자, 니들이 살아.',1.9,.08]]);
 hint(HINTS[G.tool],2.8);
 focusCanvas();
}
function enterCrowd(){ // 12%: 둘이 화면 양옆에서 뛰어들어 내 팔을 붙잡는다
 if(G.crowdEntered||G.revivalUsed)return;
 G.crowdEntered=true;G.inputLocked=true;clearPointers();$('#dock').hidden=true;
 G.crowdBeatUntil=G.time+3.0;
 CROWD.grabStart(G.time);
}
function warnCrowd(){ // 10%: 넷이 설계자 앞을 막아선다
 if(G.crowdWarned)return;G.crowdWarned=true;G.inputLocked=true;clearPointers();$('#dock').hidden=true;
 G.crowdBeatUntil=G.time+3.3;
 CROWD.wallStart(G.time);
}
/* 8%: 되살리기 컷씬
 * 0.0 마지막 타격, 멈춤 → 카메라가 꿇는 사람들 등 뒤로 빠진다 → 설계자가 무너진다(2.4초)
 * 3.0 설계자가 손을 든다 / 사람들이 손을 모은다
 * 3.5 소원의 불씨가 손바닥으로 모인다(2.3초)
 * 6.2 손을 가슴으로 → 6.55 박힘: 금빛 과노출, 그 안에서 몸을 갈아 끼운다(6.9)
 * 7.25 빛이 걷힌다 → 7.7 보증서에 도장이 다시 찍힌다 → 8.5 만세 → 8.9 설계자 대사 → 끝나면 다시 1인칭 */
function beginRevival(){
 const E=G.E;if(!E||G.revivalUsed||E.state!=='stand')return false;
 G.revivalUsed=true;G.revivalPending=false;G.inputLocked=true;G.crowdBeatUntil=0;clearPointers();$('#dock').hidden=true;VM.root.visible=false;
 $('#fight .gauge').style.visibility='hidden';clearTalk();
 if(E.tabletHeld)E.dropTablet(V3(-2.4,.45,.7));
 E.startFall('final');E.haloStage(4);G.hitstop=Math.max(G.hitstop,.3);G.slow=Math.max(G.slow,.5);flash(.3);
 G.revival={at:G.time,raised:false,cam1:false,gather:false,chest:false,impact:false,swapped:false,released:false,stamped:false,cheered:false,spoken:false};
 CAM.frame='cut';CAM.rate=1.5;cutCam(0);
 CROWD.reviveStart(G.time,E);
 return true;
}
// 컷씬 카메라: 꿇은 사람들 등 너머로 설계자(0) → 든 손으로 다가감(1) → 몸통(2) → 얼굴(3)
function cutCam(n){
 const pr=innerWidth<innerHeight,f=pr?1.5:1;
 if(n===0){CAM.goalPos.set(0,1.78,2.6*f+.3);CAM.goalLook.set(0,.88,-.1);}
 else if(n===1){CAM.goalPos.set(.32,1.58,2.55*f+.2);CAM.goalLook.set(-.1,1.02,-.05);}
 else if(n===2){CAM.goalPos.set(0,1.28,2.35*f);CAM.goalLook.set(0,1.0,0);}
 else{CAM.goalPos.set(.1,1.4,2.05*f);CAM.goalLook.set(0,1.18,0);}
}
function flashHold(color,a,rise){const el=$('#flash');el.style.background=color;el.style.transition='opacity '+rise+'s';el.style.opacity=a;}
function flashRelease(dur){const el=$('#flash');el.style.transition='opacity '+dur+'s';el.style.opacity=0;setTimeout(()=>{el.style.background='#fff';},dur*1000+60);}
function replaceEmperorForRevival(){
 const old=G.E;if(!old)return;
 old.endAct();old.root.removeFromParent();G.retired.push(old);
 const E=new Emperor(G.result);E.bloodRawBase=BLOOD.rawLost;E.taunt=false;E.setPhase(4);
 E.idleT=1e9;E.sobT=1e9;E.lookedHand=true;E.reviveGlow=1.7;
 wireEmperor(E);G.E=E;
 BLOOD.rebindKeepStage(E);if(lite<2){metalEnv(E.root);metalEnv(E.crown);}
 if(E.tabletHeld)E.dropTablet(V3(rnd(-.2,.2),.7,.6));
}
function finishRevival(){
 G.revival=null;G.revived=true;G.inputLocked=false;G.bar=G.shown=G.lag=30;G.kd=3;
 CAM.rate=0;setFrame('stand');$('#fight .gauge').style.visibility='';
 if(G.E){G.E.idleT=2.5;G.E.sobT=G.time+2.5;}
 CROWD.sides();
 VM.root.visible=G.mode==='fight';$('#dock').hidden=false;
 updateGauge();hint(HINTS[G.tool],2.6);
 focusCanvas();
}
function showPrinter(){
 if(G.printerShown)return;G.printerShown=true;G.printerPending=false;G.inputLocked=true;clearPointers();
 $('#dock').hidden=true;CROWD.hide();const sc=$('#printerScene');sc.hidden=false;sc.className='story-scene';
 requestAnimationFrame(()=>$('#fatePrinter').focus());
}
function updateStory(){
 if(G.offerPending){if(G.E&&G.E.down)G.E.down.stay=Math.max(G.E.down.stay,1e6);if(!talkBusy())openOffer();}
 if(G.offerOpen&&G.E&&G.E.down)G.E.down.stay=Math.max(G.E.down.stay,1e6);
 if(G.offerBreakAt&&G.time>=G.offerBreakAt)finishOffer();
 if(G.crowdBeatUntil&&G.time>=G.crowdBeatUntil&&!G.revival){G.crowdBeatUntil=0;G.inputLocked=false;$('#dock').hidden=false;hint(HINTS[G.tool],2.2);focusCanvas();}
 if(G.revivalPending&&G.E&&G.E.state==='stand')beginRevival();
 if(G.revival){
  const r=G.revival,t=G.time-r.at,E=G.E;
  if(t>=3.0&&!r.raised){r.raised=true;if(E)E.revive={k:0,dur:1.1,c:0,toChest:false};}
  if(t>=3.5&&!r.gather){r.gather=true;CROWD.gatherStart(2.3);}
  if(t>=3.7&&!r.cam1){r.cam1=true;CAM.rate=1.2;cutCam(1);}
  if(t>=6.2&&!r.chest){r.chest=true;if(E&&E.revive)E.revive.toChest=true;}
  if(t>=6.55&&!r.impact){r.impact=true;CROWD.impact();AUDIO.boom(1);flashHold('#fff3cf',.985,.16);if(E)E.reviveGlow=1.7;camHit({shake:.05,zoom:.03});CAM.rate=2.2;cutCam(2);
   if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([40,30,60]);}catch(_){}}
  if(t>=6.9&&!r.swapped){r.swapped=true;replaceEmperorForRevival();}
  if(t>=7.1&&!r.released){r.released=true;flashRelease(1.2);CAM.rate=1.6;cutCam(3);}
  if(t>=7.9&&!r.stamped){r.stamped=true;CROWD.restamp();CAM.rate=1.4;cutCam(2);}
  if(t>=8.5&&!r.cheered){r.cheered=true;CROWD.cheer();}
  if(t>=8.9&&!r.spoken){r.spoken=true;queueTalk([['boss','그래. 다들 자기 것만은 건드리지 말라지.',1.65,.05],['boss','그 소리면 충분하다.',1.45,.08]]);CAM.rate=2.4;setFrame('stand');}
  if(t>=10.6&&r.spoken&&!talkBusy())finishRevival();
 }
 if(G.printerPending&&!talkBusy())showPrinter();
 if(G.printerDoneAt&&G.time>=G.printerDoneAt){G.printerDoneAt=0;$('#printerScene').hidden=true;showEnding();}
 if(G.sealAt&&G.time>=G.sealAt){G.sealAt=0;$('#submitWorkflow').hidden=true;$('#submitCertificate').hidden=false;requestAnimationFrame(()=>$('#submitShare').focus());}
}
function damageBar(d,o={},fromStand=false){
 if(G.mode!=='fight'||G.ended||!G.E)return;
 const E=G.E;if(!fromStand&&E.state!=='stand')return;const next=KD_AT[G.kd]??0;
 const amount=Math.max(0,Number(d)||0);if(amount<=0)return;
 let nb=Math.max(0,G.bar-amount);
 if(G.kd===3&&!G.revivalUsed){
  if(!G.crowdEntered&&nb<=12){G.bar=G.shown=12;gaugeHit();updateGauge();enterCrowd();return;}
  if(G.crowdEntered&&!G.crowdWarned&&nb<=10){G.bar=G.shown=10;gaugeHit();updateGauge();warnCrowd();return;}
  if(nb<=8){G.bar=G.shown=8;gaugeHit();updateGauge();if(!beginRevival())G.revivalPending=true;return;}
 }
 G.bar=nb;G.shown=nb;gaugeHit();
 if(G.kd<4&&G.bar<=next+1e-6){G.bar=next;G.shown=next;knockdown();}
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
 setFrame(type==='final'?'final':type);
 E.haloStage(G.kd);

 G.hitstop=Math.max(G.hitstop,.14);
 G.slow=Math.max(G.slow,type==='final'?.9:.45);
 flash(type==='final'?.35:.2);
 camHit({shake:.04,roll:rnd(-.02,.02),zoom:.03});

 if(type==='final'){
  if(!E.headDestroyed)AUDIO.voice('final',1);
 }else if(!E.headDestroyed){
  AUDIO.voice('scream',1.1);
 }

 if(type==='throne'){
  queueTalk([
   ['boss','네 팔자엔 반항 같은 건 없었는데.',1.9,.15],
   ['player','남의 고생을 운명이라고 부르지 마.',1.9,.15]
  ]);
 }else if(type==='kneel'){
  queueTalk([
   ['boss','잠깐. 네 팔자만 좋게 다시 써주마.',2,.15]
  ]);
  G.offerPending=true;
 }else if(type==='floor'){
  queueTalk([
   ['boss','운명은… 원래 해석하기 나름이니라.',2.1,.15],
   ['player','니 운명은 내가 오늘 설계해준다.',2,.15]
  ]);
 }else{
  queueTalk([
   ['boss','네가 이러면 질서가 무너진다!',1.25,0],
   ['player','그게 목적이야.',.9,.08]
  ]);
 }

 updateGauge();
}
function onRiseStart(){setFrame('stand');}
// 다리가 잘려 옥좌에 주저앉음: 다운과 같은 구도로(게이지·후광은 그대로)
function onLegFall(){setFrame('throne');G.hitstop=Math.max(G.hitstop,.1);G.slow=Math.max(G.slow,.35);camHit({shake:.035,roll:rnd(-.02,.02),zoom:.02});}
function onRise(){const E=G.E;E.setPhase(Math.min(4,G.kd+1));}
function onImpact(type){
 const E=G.E;camHit({shake:type==='final'?.06:.05,pitch:-.012,roll:rnd(-.015,.015)});
 if(type==='throne'){AUDIO.fall('throne');if(E.crownOn!==false)E.knockCrown(V3(rnd(-.4,.4),.6,.2));}else if(type==='knees'){AUDIO.fall('knees');}else AUDIO.fall('floor');
 if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([30,20,40]);}catch(_){}
 const p=E.bones.pelvis.getWorldPosition(V3());BLOOD.spray(V3(p.x,.05,p.z+.2),V3(0,1,0),14,{kind:'dust',max:1.2});
 FX.word(type==='throne'?'쾅!':'쿵!',V3(p.x,p.y+.15,p.z+.2),{size:64,color:'#ffd84a',force:true,dur:.7});
}
function onDead(){
 if(G.revival||G.ended)return;
 G.ended=true;
 G.tEnd=G.time;
 G.inputLocked=true;clearPointers();G.printerPending=true;$('#dock').hidden=true;

 queueTalk([
  ['boss','운명을 거슬러주세요…',2,.15],
  ['boss','운명은 뻥이었습니다. ㅠㅠ',2.2,.18]
 ]);
}
function showEnding(){
 clearTalk();
 G.cardShown=true;const t=Math.max(0,G.tEnd-G.t0),m=Math.floor(t/60),s=Math.floor(t%60);
 $('#stTime').textContent=m+':'+String(s).padStart(2,'0');$('#stHits').textContent=G.hits;$('#stBlood').textContent=(BLOOD.lost).toFixed(1)+'L';
 $('#ending').hidden=false;
 requestAnimationFrame(()=>$('#endAgain').focus());
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
function flash(a=.25){const el=$('#flash');el.style.transition='none';el.style.opacity=a;requestAnimationFrame(()=>{el.style.transition='opacity .18s';el.style.opacity=0;});}

/* ---- 무기와 연결 ---- */
VM.st.onContact=a=>{
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
 camHit({pitch:.028,roll:rnd(-.012,.012),shake:.012,zoom:.022});
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
 * 팔다리: 그 팔다리를 가로질러 지나가면(들어간 자리 → 나온 자리) 한 번 벤 것으로 친다.
 * 몸통·얼굴: 같은 부위 위를 4.5cm 넘게 그을 때마다 베인 자국이 이어진다. */
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
 if(p.slashId==null)p.slashId=++slashSerial;
 const first=points[0],includeStart=p.sx==null;
 let px=includeStart?first[0]:p.sx,py=includeStart?first[1]:p.sy,total=0;
 const segs=[];
 for(const q of points){const x=q[0],y=q[1],d=Math.hypot(x-px,y-py);if(d>0){segs.push({x0:px,y0:py,x1:x,y1:y,d});total+=d;}px=x;py=y;}
 p.sx=px;p.sy=py;
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
 // 팔다리에서 벗어나면 그 팔다리를 벤 것으로 친다
 if(p.limb&&p.limb.key!==lk)finishLimb(p);
 if(lk){
  if(!p.limb)p.limb={key:lk,a:info.point.clone(),b:info};else p.limb.b=info;
  p.lastCut=null;return true;
 }
 // 팔다리를 벤 칼은 그 뒤로 몸통을 베지 않는다(팔 너머 배가 같이 갈라지지 않게)
 if(!info||(p.limbDone&&p.limbDone.size)){p.lastCut=null;return !!info;}
 const seg=info.obj&&info.obj.userData.seg;
 // 다른 부위로 넘어가면 거기서 새로 긋기 시작
 if(!p.lastCut||p.lastCut.seg!==seg){p.lastCut={point:info.point.clone(),t:now,part:info.part,seg};return true;}
 const d=info.point.distanceTo(p.lastCut.point);
 if(d>.045||now-p.lastCut.t>.12){
  if(d>.015){resolveHit(G.tool,'slash',info,'R',{slashFrom:p.lastCut.point.clone(),strokeId:p.slashId,firstCut:!p.cutWord});p.cutWord=true;}
  p.lastCut={point:info.point.clone(),t:now,part:info.part,seg};
 }
 return true;
}
function finishLimb(p){
 const L=p.limb;p.limb=null;if(!L)return;
 p.limbDone=p.limbDone||new Set();if(p.limbDone.has(L.key))return;p.limbDone.add(L.key);
 const info=L.b;let from=L.a;
 // 한 점만 스쳤으면 긋는 방향으로 짧은 선을 만든다
 if(from.distanceToSquared(info.point)<1e-6)from=info.point.clone().addScaledVector(V3().crossVectors(info.normal,UP).normalize(),.02);
 resolveHit(G.tool,'slash',info,'R',{slashFrom:from,strokeId:p.slashId,firstCut:!p.cutWord});p.cutWord=true;
}
/* ---- 입력 ---- */
const ptrs=new Map();let bladePointer=null;
function clearPointers(){for(const p of ptrs.values()){if(p.slashing)VM.slashEnd();try{if(canvas.hasPointerCapture&&canvas.hasPointerCapture(p.id))canvas.releasePointerCapture(p.id);}catch(_){}}ptrs.clear();bladePointer=null;}
canvas.addEventListener('pointerdown',e=>{
 if(G.paused||G.inputLocked||(e.pointerType==='mouse'&&e.button!==0))return;AUDIO.unlock();
 if(G.mode!=='fight')return;
 const tool=G.tool;if((tool==='knife'||tool==='spear')&&bladePointer!=null)return;
 try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 const p={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t0:G.time,swiped:false,slashing:false,fired:false,decided:false};
 ptrs.set(e.pointerId,p);
 if(tool==='knife'||tool==='spear')bladePointer=e.pointerId;
 if(tool==='gun'){VM.fire(p.x,p.y);p.auto=G.time+.19;}
 else if(tool==='hand')p.jabAt=G.time+.38;
 e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
 const p=ptrs.get(e.pointerId);if(!p)return;const tool=G.tool;
 if(tool==='knife'||tool==='spear'){
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
 p.x=e.clientX;p.y=e.clientY;const dx=p.x-p.x0,dy=p.y-p.y0,dist=Math.hypot(dx,dy);
 if(tool==='gun')return;
 if(!p.decided&&!p.swiped&&dist>30&&G.time-p.t0<.38){
  p.swiped=true;p.decided=true;p.jabAt=0;const horiz=Math.abs(dx)>Math.abs(dy)*1.05;
  VM.attack(horiz?'hook':dy<0?'upper':'jab',p.x0,p.y0);
 }
});
function ptrEnd(e){
 const p=ptrs.get(e.pointerId);if(!p)return;ptrs.delete(e.pointerId);
 try{if(canvas.hasPointerCapture&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch(_){}
 if(bladePointer===e.pointerId)bladePointer=null;
 if(G.mode!=='fight'||G.inputLocked){if(p.slashing)VM.slashEnd();return;}
 const tool=G.tool;
 if(tool==='knife'||tool==='spear'){
  if(p.slashing){
   if(e.type==='pointerup'){if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))slashPath(p,[[e.clientX,e.clientY]]);finishLimb(p);}
   VM.slashEnd();
  }else if(e.type==='pointerup')VM.attack('stab',p.x0,p.y0);
 }
 else if(tool==='hand'&&e.type==='pointerup'&&!p.decided){p.decided=true;VM.attack('jab',p.x0,p.y0);}
}
canvas.addEventListener('pointerup',ptrEnd);canvas.addEventListener('pointercancel',ptrEnd);canvas.addEventListener('lostpointercapture',ptrEnd);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function pollPointers(){
 for(const p of ptrs.values()){
  if(G.tool==='gun'&&p.auto&&G.time>=p.auto){p.auto=G.time+.19;VM.fire(p.x,p.y);}
  else if(G.tool==='hand'&&!p.decided&&p.jabAt&&G.time>=p.jabAt){p.decided=true;p.jabAt=0;VM.attack('jab',p.x0,p.y0);}
 }
}
// 키보드(PC): 1~3 도구
addEventListener('keydown',e=>{if($('#fight').hidden||G.paused||G.inputLocked)return;const map={'1':'hand','2':'spear','3':'knife','4':'gun'};if(map[e.key])setTool(map[e.key]);});

function setTool(t){
 if(!HINTS[t])return;clearPointers();
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
$('#settingsBtn').addEventListener('click',()=>{G.paused=true;clearPointers();$('#settingsModal').hidden=false;});
function closeModal(){$('#settingsModal').hidden=true;G.paused=false;last=performance.now();}
$$('#settingsModal [data-close]').forEach(b=>b.addEventListener('click',closeModal));
$('#settingsModal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
$('#resetFight').addEventListener('click',()=>{closeModal();startRound('fight');});
$('#endAgain').addEventListener('click',()=>startRound('fight'));
$('#endHome').addEventListener('click',()=>leave(false));
$('#endMore').addEventListener('click',()=>{$('#ending').hidden=true;G.inputLocked=false;$('#dock').hidden=false;hint('끝난 운명도 더 팰 수 있습니다.',2.5);focusCanvas();});
$('#fightBack').addEventListener('click',()=>leave(false));
function startFightFromSubmit(){
 AUDIO.unlock();
 AUDIO.stop();
 clearTalk();
 G.sealAt=0;
 $('#submitWorkflow').classList.remove('stamped');

 G.mode='fight';
 G.inputLocked=false;
 VM.root.visible=true;

 $('#dock').hidden=false;
 $('#submitDock').hidden=true;
 $('#fight .gauge').style.visibility='';

 VM.setTool(G.tool);
 fitView();
 setFrame('stand');
 hint(HINTS[G.tool],4.5);

 if(G.E)G.E.endAct();
 focusCanvas();

 queueTalk([
  ['boss','뭐냐. 네 운명은 이미 정해졌—',1.45,.1],
  ['player','니 운명은 내가 오늘 설계해준다.',2,.1]
 ]);
}
function resetSubmitWorkflow(){
 const w=$('#submitWorkflow');w.hidden=false;w.classList.remove('stamped');$('#submitCertificate').hidden=true;G.sealAt=0;
}
$('#submitFight').addEventListener('click',startFightFromSubmit);
$('#breakSeal').addEventListener('click',startFightFromSubmit);
$('#fateSeal').addEventListener('click',()=>{
 if(G.mode!=='submit'||G.sealAt||$('#submitWorkflow').classList.contains('stamped'))return;
 AUDIO.unlock();AUDIO.ui();$('#submitWorkflow').classList.add('stamped');G.sealAt=G.time+.55;
});
$('#offerPaper').addEventListener('click',()=>{
 if(!G.offerOpen||G.offerBreaking)return;
 G.offerBreaking=true;G.hits++;G.offerBreakAt=G.time+.62;$('#offerScene').classList.add('breaking');AUDIO.crack(1.1);flash(.22);
});
$('#fatePrinter').addEventListener('click',()=>{
 if(!G.printerShown||G.printerDoneAt||G.printerHits>=3)return;
 AUDIO.unlock();G.printerHits++;G.hits++;const sc=$('#printerScene');sc.classList.remove('hit1','hit2');
 if(G.printerHits<3){sc.classList.add('hit'+G.printerHits);AUDIO.crack(.65);flash(.12);}
 else{sc.classList.add('destroyed');AUDIO.haloCrack(1.15);flash(.3);G.tEnd=G.time;G.printerDoneAt=G.time+.95;}
});

$('#submitShare').addEventListener('click',async()=>{
 const text=
  '저는 다음 사람의 불리한 운명 배정에 확인 도장을 찍었습니다.\n'+
  '공유용 별칭: 운명 이완용\n'+
  '처리 결과: 기존 질서 유지 · 보상: 없음';

 const b=$('#submitShare');

 try{
  if(navigator.share){
   await navigator.share({
    title:'운명 배정 처리 내역',
    text
   });
  }else if(navigator.clipboard){
   await navigator.clipboard.writeText(text);
  }else{
   throw new Error('share');
  }

  b.textContent=navigator.share
   ?'부역 사실 공유 완료'
   :'부역 사실 복사 완료';
 }catch(err){
  if(err&&err.name==='AbortError')return;
  window.prompt('아래 문구를 복사하세요.',text);
 }
});

/* ---- 라운드 ---- */
function startRound(mode){
 G.round++;
 AUDIO.stop();
 clearPointers();
 clearTalk();
 // 피 자국의 동적 geometry를 먼저 정리해 Emperor.destroy()와 같은 자원을 두 번 dispose하지 않는다.
 BLOOD.reset(null);
 if(G.E)G.E.destroy();
 for(const old of G.retired)if(old&&old!==G.E)old.destroy();
 G.retired=[];
 G.E=new Emperor(G.result);
 const E=G.E;
 wireEmperor(E);
 BLOOD.reset(E);VM.reset();if(lite<2){metalEnv(E.root);metalEnv(E.crown);}
Object.assign(G,{mode,bar:100,shown:100,shownHold:0,lag:100,lastHit:-99,kd:0,active:0,started:false,hits:0,t0:G.time,tEnd:0,hitstop:0,slow:0,ended:false,cardShown:false,paused:false,inputLocked:false,cardAt:0,laughAt:0,submitWaiting:mode==='submit',headTalked:false,offerAt:0,offerPending:false,offerOpen:false,offerBreaking:false,offerBreakAt:0,crowdEntered:false,crowdWarned:false,crowdBeatUntil:0,crowdSwapAt:0,crowdSwapLines:null,crowdHideAt:0,revivalUsed:false,revivalPending:false,revival:null,revived:false,brittle:false,shellHideAt:0,printerShown:false,printerHits:0,printerPending:false,printerDoneAt:0,sealAt:0});
 FX.clear();COINS.clear();CHUNKS.clear();
 CROWD.reset();
 CAM.kick.set(0,0,0);CAM.kickV.set(0,0,0);CAM.rot.reset();CAM.push.reset();CAM.shake=0;CAM.zoom=CAM.zoomV=0;CAM.jit.set(0,0,0);gunLT=0;
 clearTimeout(gaugeHitT);const gauge=$('#fight .gauge');if(gauge._hitAnim)gauge._hitAnim.cancel();gauge.classList.remove('hit');$('#gaugeFill').classList.remove('flash');$('#flash').style.opacity=0;
 $('#ending').hidden=true;
$('#settingsModal').hidden=true;
$('#submitShare').textContent='처리 내역 공유하기';
 resetSubmitWorkflow();
 for(const id of ['offerScene','printerScene']){$('#'+id).hidden=true;$('#'+id).className='story-scene';}
 CAM.rate=0;$('#fight .gauge').style.visibility='';$('#flash').style.background='#fff';
 $('#dock').hidden=mode!=='fight';$('#submitDock').hidden=true;$('#fight .gauge').style.visibility=mode==='submit'?'hidden':'';
 setTool('hand');updateGauge();updateAmmo();syncPrefs();VM.root.visible=mode==='fight';
 fitView();setFrame('stand',true);


if(mode==='fight'){
 hint(HINTS.hand,5);

 queueTalk([
  ['boss','네 자리는 이미 정해져 있다. 괜히 거스르지 말거라.',2.6,.35],
  ['player','운명 족치러 왔다.',1.7,.18]
 ]);
}else{
 $('#hint').classList.add('off');
 E.idleT=3.2;
 G.laughAt=G.time+.5;

 queueTalk([
  ['boss','그래. 네 팔자대로만 살거라.',2.1,.25],
  ['boss','너 같은 사람이 제자리를 지켜줘야 이 사회가 안정되는 법이지.',3,.15],
  ['boss','윗자리는 대대손손 편하고.',2,.2],
  ['boss','븅~신ㅋㅋ',1.5,.3]
 ]);
}

 last=performance.now();
}

/* ---- 루프 ---- */
let last=performance.now(),perfT=0,perfN=0,lite=0;
function allMats(fn){for(const sc of [scene,vmScene])sc.traverse(o=>{if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))fn(m);});}
function step(dt){
 if(G.paused)return;G.time+=dt;
 updateStory();
 CROWD.update(dt,G.time);
 pollPointers();
 const E=G.E;
 // 멈춤(히트스톱)·느린 화면
 let sim=dt;if(G.hitstop>0){const u=Math.min(dt,G.hitstop);G.hitstop-=u;sim=dt-u;}
 if(G.slow>0){G.slow-=dt;sim*=.45;}
 if(E){
  E._rdt=dt;E.update(sim,G.time);
  if(G.mode==='submit'){
   // 네 줄의 비웃음과 몸짓이 실제로 전부 끝난 뒤에만 다음 운명 문서를 건넨다.
   if(G.submitWaiting&&!G.laughAt&&!E.act&&!talkBusy()){G.submitWaiting=false;resetSubmitWorkflow();$('#submitDock').hidden=false;requestAnimationFrame(()=>$('#fateSeal').focus());}
   else if(!G.submitWaiting&&E.state==='stand'&&!E.act&&E.sinceHit>1&&Math.random()<dt*.35){E.doAct('laugh',{dur:2,L:false,R:false});AUDIO.voice('laugh',1);}
  }
 }
 BLOOD.update(sim);COINS.update(sim);CHUNKS.update(sim);VM.update(sim,G.hitstop>0,dt);
FX.update(dt);
updateTalk(dt);
updateCamera(dt);SBLOOD.update(dt);updateLag(dt);
 gunLT=Math.max(0,gunLT-dt);gunL.intensity=gunLT>0?1.5:0;gunL.position.set(camera.position.x+.15,camera.position.y-.1,camera.position.z-.3);
 if(G.time>hintUntil)$('#hint').classList.add('off');
 if(G.cardAt&&G.time>=G.cardAt){G.cardAt=0;if(G.ended&&G.E&&G.E.state==='dead'&&!G.cardShown)showEnding();}
 if(G.laughAt&&G.time>=G.laughAt){G.laughAt=0;if(G.E&&G.mode==='submit'){G.E.doAct('laugh',{dur:2.4,L:false,R:false});AUDIO.voice('laugh',1.2);}}
}
function render(){renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(vmScene,vmCam);renderer.clearDepth();renderer.render(FX.scene,camera);BUB.update();}
function frame(now){
 if(!G.running)return;G.raf=requestAnimationFrame(frame);
 const raw=(now-last)/1000;last=now;const dt=clamp(raw,0,.05);
 // 느린 기기: 1단계 해상도·그림자 낮춤, 2단계 금속 반사 끔
 if(raw<.25){perfT+=raw;perfN++;}if(perfT>2.5){if(perfT/perfN>.045&&lite<2){lite++;if(lite===1){renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;allMats(m=>m.needsUpdate=true);fitView();}else{allMats(m=>{if(m.envMap){m.envMap=null;m.needsUpdate=true;}});}}perfT=0;perfN=0;}
 step(dt);render();
}
function pause(){G.running=false;cancelAnimationFrame(G.raf);clearPointers();AUDIO.stop();}
function enter(result,mode='fight'){
 G.result=result;$('#fight').hidden=false;$('#fallback').hidden=true;
 try{speechSynthesis.cancel();}catch(_){}
 AUDIO.unlock();fitView();startRound(mode==='submit'?'submit':'fight');
 const face=$('#arcadeFace');if(face){face.target='_blank';face.rel='noopener';}
 if(!G.running){G.running=true;last=performance.now();G.raf=requestAnimationFrame(frame);}
}
function leave(home){
 pause();
 CROWD.reset();
 clearTalk();$('#settingsModal').hidden=true;$('#ending').hidden=true;$('#fight').hidden=true;
 const face=$('#arcadeFace');if(face){face.target='_top';face.removeAttribute('rel');}
 if(home&&window.__paljaRestart)window.__paljaRestart();else if(window.__paljaLeave)window.__paljaLeave();
}
let rsT=0;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{if(!$('#fight').hidden){fitView();VM.computeRest();}},40);});
addEventListener('blur',clearPointers);
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPointers();AUDIO.stop();}else{last=performance.now();if(G.running){fitView();}}});

window.PaljaGame={enter,leave,pause,
 tick(dt=1/60,draw=true){step(dt);if(draw)render();},
 pick:pickAt,setTool,
 hitAt(x,y,kind){if(G.tool==='gun')return VM.fire(x,y);return VM.attack(kind||(G.tool==='hand'?'jab':G.tool==='knife'?'stab':'smash'),x,y);},
 slash(points){VM.slashStart(points[0][0],points[0][1]);const p={lastCut:null};for(const [x,y] of points){VM.slashMove(x,y);slashContact(p,x,y);}finishLimb(p);VM.slashEnd();},
 screenPart(name){const E=G.E;if(!E)return null;const m=E.parts.find(o=>o.userData.part===name&&o.visible);if(!m)return null;const p=m.getWorldPosition(V3()).project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};},
 project(v){const p=v.clone().project(camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};},
 get state(){return {G,E:G.E,camera,scene,renderer,CAM,VM,BLOOD};},
 debug:{audio:AUDIO,round(m){startRound(m||"fight");},
  cam(p,l,fov){CAM.frame='debug';CAM.goalPos.set(p[0],p[1],p[2]);CAM.goalLook.set(l[0],l[1],l[2]);CAM.pos.copy(CAM.goalPos);CAM.look.copy(CAM.goalLook);if(fov){CAM.fovBase=fov;CAM.fov=fov;}},
  standCam(){setFrame('stand',true);},fall(type){const E=G.E;if(!E)return;const i=KD_TYPE.indexOf(type);G.kd=i;G.bar=G.shown=G.lag=KD_AT[i];E.taunt=false;E.setPhase(Math.min(4,i+1));knockdown();},frame:setFrame}};
}
})();
