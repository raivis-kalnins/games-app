/* Games 63 - two-player 8-ball pool. Two team colours, fifteen racked balls,
   six pockets, local alternating turns and a lightweight foul/win system. */
import {canvasStage,loop,hud,status,controls,overlay,clamp,roundRect,text} from './shared.js';
const R=10.2;
const POCKETS=[[30,30],[360,30],[690,30],[30,395],[360,395],[690,395]];
export function poolRack(){
  const out=[];
  for(let row=0;row<5;row++)for(let i=0;i<=row;i++){
    out.push({x:448+row*19.1,y:212+(i-row/2)*21.3,n:0});
  }
  const nums=[1,9,2,10,3,11,4,12,8,13,5,14,6,15,7];
  out.forEach((b,i)=>b.n=nums[i]);
  return out;
}
export function mountGame(root,api){
 root.replaceChildren();const ac=new AbortController(),signal=ac.signal;
 const {wrapper,canvas,ctx,point}=canvasStage(root,720,425,'stage-wide pool-stage');
 const info=hud(root,'<span class="pool-player" data-pool-p1>🔵 '+api.locale('Player 1','Spēlētājs 1')+' <b data-p1>0</b>/7</span><span class="pool-turn" data-turn>🎱 '+api.locale('Break','Sākums')+'</span><span class="pool-player" data-pool-p2>🟠 '+api.locale('Player 2','Spēlētājs 2')+' <b data-p2>0</b>/7</span>');
 const message=status(root,'');message.setAttribute('aria-live','polite');
 const state={balls:[],turn:0,assigned:null,drag:null,shot:false,potted:[],scratch:false,firstTouch:null,ended:false,prev:0,everShot:false};
 const names=()=>[api.locale('Player 1','Spēlētājs 1'),api.locale('Player 2','Spēlētājs 2')];
 const group=n=>n===8?'black':n<=7?'blue':'orange';
 const pocket=(b)=>POCKETS.some(([x,y])=>Math.hypot(b.x-x,b.y-y)<34);
 const cue=()=>state.balls.find(b=>b.n===0);
 const moving=()=>state.balls.some(b=>Math.hypot(b.vx,b.vy)>3.5);
 function tell(en,lv){message.textContent=api.locale(en,lv)}
 function counts(p){return state.balls.filter(b=>group(b.n)=== (state.assigned?.[p]|| (p===0?'blue':'orange'))).length}
 function update(){info.querySelector('[data-p1]').textContent=7-counts(0);info.querySelector('[data-p2]').textContent=7-counts(1);
   for(const n of [0,1])info.querySelector(`[data-pool-p${n+1}]`).classList.toggle('playing',state.turn===n);
   info.querySelector('[data-turn]').textContent=`🎱 ${names()[state.turn]} · ${state.assigned?api.locale('turn','gājiens'):api.locale('open table','brīvs galds')}`;}
 function reset(){state.balls=[{x:173,y:212,n:0,vx:0,vy:0},...poolRack().map(b=>({...b,vx:0,vy:0}))];state.turn=0;state.assigned=null;state.drag=null;state.shot=false;state.potted=[];state.scratch=false;state.firstTouch=null;state.ended=false;state.prev=0;state.everShot=false;wrapper.querySelector('.overlay-center')?.remove();tell('Player 1 breaks. Pull back from the white ball, then release.','Sāk 1. spēlētājs. Velc atpakaļ no baltās bumbas un atlaid.');update();}
 function winner(p,reason){state.ended=true;api.onScore((api.best||0)+1);api.beep(850,.23);overlay(wrapper,names()[p]+' '+api.locale('wins!','uzvar!'),reason,reset,api.locale);tell(names()[p]+' '+api.locale('wins!','uzvar!'));}
 function resolve(){if(!state.shot)return;state.shot=false;
   const pot=state.potted.filter(n=>n>0&&n!==8);
   if(!state.assigned&&pot.length){const g=group(pot[0]);state.assigned=state.turn===0?[g,g==='blue'?'orange':'blue']:[g==='blue'?'orange':'blue',g];}
   const own=state.assigned?.[state.turn];const black=state.potted.includes(8),clear=counts(state.turn)===0;
   if(black){const good=clear&&!state.scratch;winner(good?state.turn:1-state.turn,good?api.locale('All your balls and the 8 ball are pocketed.','Iesisti visi savas krāsas kauliņi un astotnieks.'):api.locale('8 ball pocketed too early or with a foul.','Astotnieks iesists par agru vai ar sodu.'));return;}
   const correct=pot.some(n=>group(n)===state.assigned?.[state.turn]);
   // A scratch or a failure to pocket one's own colour passes the turn.
   const foul=state.scratch||(state.assigned&&state.firstTouch!==null&&state.firstTouch!==8&&group(state.firstTouch)!==own);
   if(foul||!correct){state.turn=1-state.turn;tell(foul?'Foul / scratch — next player.':'Next player — aim and shoot.',foul?'Sods — nākamais spēlētājs.':'Nākamais spēlētājs — mērķē un sit.');}
   else tell('Nice pocket! You shoot again.','Labs sitiens! Tev ir vēl viens gājiens.');
   state.scratch=false;state.potted=[];state.firstTouch=null;
   if(!cue())respawnCue();update();
 }
 function respawnCue(){let y=212;while(state.balls.some(b=>Math.hypot(b.x-173,b.y-y)<R*2.4)&&y<365)y+=26;state.balls.push({x:173,y,n:0,vx:0,vy:0})}
 function step(dt){if(state.ended)return;
   for(let sub=0;sub<5;sub++){
     const sd=dt/5;
     for(const b of state.balls){b.x+=b.vx*sd;b.y+=b.vy*sd;const f=Math.pow(.979,sd*60);b.vx*=f;b.vy*=f;if(Math.hypot(b.vx,b.vy)<4)b.vx=b.vy=0;}
     for(let i=state.balls.length-1;i>=0;i--){const b=state.balls[i];if(pocket(b)){state.balls.splice(i,1);if(b.n===0)state.scratch=true;else state.potted.push(b.n);api.beep(b.n===0?160:650,.075);continue;}
       if(b.x<40+R){b.x=40+R;b.vx=Math.abs(b.vx)*.88}if(b.x>680-R){b.x=680-R;b.vx=-Math.abs(b.vx)*.88}
       if(b.y<40+R){b.y=40+R;b.vy=Math.abs(b.vy)*.88}if(b.y>385-R){b.y=385-R;b.vy=-Math.abs(b.vy)*.88}}
     for(let i=0;i<state.balls.length;i++)for(let j=i+1;j<state.balls.length;j++){
       const a=state.balls[i],b=state.balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001;
       if(d<R*2){const nx=dx/d,ny=dy/d,over=R*2-d;a.x-=nx*over/2;b.x+=nx*over/2;a.y-=ny*over/2;b.y+=ny*over/2;
         const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
         if(rel>0){if(state.shot&&state.firstTouch===null&&((a.n===0&&b.n!==0)||(b.n===0&&a.n!==0)))state.firstTouch=a.n===0?b.n:a.n;
           a.vx-=rel*nx*.97;a.vy-=rel*ny*.97;b.vx+=rel*nx*.97;b.vy+=rel*ny*.97;}}}
   }
   if(state.shot&&!moving())resolve();
 }
 function release(e){if(!state.drag||!cue()||state.ended)return;const b=cue(),end=point(e),dx=b.x-end.x,dy=b.y-end.y,len=Math.hypot(dx,dy);state.drag=null;
   if(len<15)return;const power=clamp(len*5.2,80,900);b.vx=dx/len*power;b.vy=dy/len*power;state.shot=true;state.firstTouch=null;state.potted=[];api.beep(260,.055);}
 canvas.addEventListener('pointerdown',e=>{if(state.ended||moving()||state.shot||!cue())return;const p=point(e),b=cue();if(Math.hypot(p.x-b.x,p.y-b.y)<64){state.drag=p;canvas.setPointerCapture(e.pointerId)}},{signal});
 canvas.addEventListener('pointermove',e=>{if(state.drag)state.drag=point(e)},{signal});
 canvas.addEventListener('pointerup',release,{signal});canvas.addEventListener('pointercancel',()=>state.drag=null,{signal});
 controls(root,[{label:api.locale('↻ New rack','↻ Jauns galds'),press:reset}],signal);
 function drawBall(b){const blue=b.n>=1&&b.n<=7,striped=b.n>=9;
   ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#0007';ctx.shadowBlur=3;
   ctx.fillStyle=b.n===0?'#f7f7ee':b.n===8?'#111b2a':blue?'#278bc1':'#f3f0e4';ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.shadowBlur=0;
   if(striped){ctx.save();ctx.beginPath();ctx.arc(0,0,R-.7,0,7);ctx.clip();ctx.fillStyle='#eb923f';ctx.fillRect(-R,-4.8,R*2,9.6);ctx.restore()}
   if(b.n!==0){ctx.fillStyle=b.n===8?'#faf1e2':'#fff9eb';ctx.beginPath();ctx.arc(0,0,4.8,0,7);ctx.fill();ctx.font='bold 7px system-ui';ctx.fillStyle='#152232';ctx.textAlign='center';ctx.fillText(String(b.n),0,2.4)}
   ctx.fillStyle='#fff9';ctx.beginPath();ctx.arc(-3.5,-4.5,2.7,0,7);ctx.fill();ctx.restore();}
 function draw(){ctx.clearRect(0,0,720,425);
   roundRect(ctx,0,0,720,425,24,'#50382e');roundRect(ctx,16,15,688,394,20,'#c19a60');roundRect(ctx,31,30,658,365,12,'#0d5a4c');
   let grass=ctx.createRadialGradient(370,190,35,365,210,430);grass.addColorStop(0,'#17725d');grass.addColorStop(1,'#0c443d');ctx.fillStyle=grass;ctx.fillRect(41,41,638,344);
   ctx.strokeStyle='#b3e5ce60';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(236,40);ctx.lineTo(236,385);ctx.stroke();ctx.beginPath();ctx.arc(236,212,72,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.beginPath();ctx.arc(236,212,3,0,7);ctx.fillStyle='#b3e5ce66';ctx.fill();
   for(const [x,y] of POCKETS){ctx.fillStyle='#101b23';ctx.beginPath();ctx.arc(x,y,23,0,7);ctx.fill();ctx.strokeStyle='#e5c891';ctx.lineWidth=4;ctx.stroke()}
   for(const b of state.balls)drawBall(b);
   const b=cue();if(state.drag&&b){const dx=b.x-state.drag.x,dy=b.y-state.drag.y,len=Math.hypot(dx,dy);if(len>1){const nx=dx/len,ny=dy/len;ctx.strokeStyle='#fff5c1';ctx.setLineDash([6,8]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+nx*195,b.y+ny*195);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#dbc18a';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(b.x-nx*16,b.y-ny*16);ctx.lineTo(b.x-nx*(40+len*.7),b.y-ny*(40+len*.7));ctx.stroke()}}
   text(ctx,'GAMES 63 • 8-BALL POOL',193,17,12,'#f7e9d2');}
 reset();const stop=loop(step,draw);
 return()=>{stop();ac.abort()};
}
