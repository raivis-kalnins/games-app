/* Original Latvian Cirks / Snakes & Ladders mini-game: human versus computer. */
import {canvasStage,loop,controls,hud,status,overlay,roundRect,text} from './shared.js';
export const LADDERS={3:22,8:30,21:42,28:55,50:69,71:92};
export const SNAKES={27:6,36:16,48:26,62:40,79:57,95:73,98:76};
const cell=61.8,x0=41,y0=41;
export function boardXY(n){n=Math.max(1,Math.min(100,n));const row=Math.floor((n-1)/10),index=(n-1)%10,col=row%2===0?index:9-index;return{x:x0+(col+.5)*cell,y:y0+(9-row+.5)*cell}}
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),signal=ac.signal;
 const {wrapper,canvas,ctx}=canvasStage(root,700,700,'stage-square cirks-stage');
 const stats=hud(root,'<span>🟢 <b data-you>1</b>/100</span><span>🎲 <b data-die>–</b></span><span>🟣 <b data-cpu>1</b>/100</span>');
 const msg=status(root,api.locale('Roll the dice and reach square 100.','Met kauliņu un pirmais sasniedz 100. lauciņu.'));
 const st={pos:[1,1],turn:0,rolling:false,die:1,queue:[],timer:0,delay:0,ended:false,animate:0,win:0};
 const bar=controls(root,[{label:api.locale('🎲 Roll dice','🎲 Mest kauliņu'),press:()=>roll(0),primary:true},{label:api.locale('↻ New game','↻ Jauna spēle'),press:reset}],signal);
 const rollButton=bar.querySelector('button');
 function refresh(){stats.querySelector('[data-you]').textContent=st.pos[0];stats.querySelector('[data-cpu]').textContent=st.pos[1];stats.querySelector('[data-die]').textContent=st.die;rollButton.disabled=st.turn!==0||st.rolling||st.ended;api.onScore(st.pos[0])}
 function reset(){st.pos=[1,1];st.turn=0;st.rolling=false;st.die=1;st.queue=[];st.timer=0;st.delay=0;st.ended=false;st.animate=0;st.win=0;wrapper.querySelector('.overlay-center')?.remove();msg.textContent=api.locale('Your move — roll the dice!','Tavs gājiens — met kauliņu!');refresh()}
 function roll(who){if(st.rolling||st.turn!==who||st.ended)return;st.die=1+Math.floor(Math.random()*6);const dest=st.pos[who]+st.die;st.rolling=true;st.queue=dest<=100?Array.from({length:st.die},(_,i)=>st.pos[who]+i+1):[];st.timer=.15;api.beep(370,.08);msg.textContent=who?api.locale(`Computer rolled ${st.die}.`,`Dators uzmeta ${st.die}.`):api.locale(`You rolled ${st.die}.`,`Tu uzmeti ${st.die}.`);refresh()}
 function endMove(){const pos=st.pos[st.turn];if(pos===100){st.ended=true;const player=st.turn;api.onScore(player===0?100:st.pos[0]);overlay(wrapper,player===0?api.locale('You won the race!','Tu uzvarēji!'):api.locale('Computer wins!','Dators uzvarēja!'),api.locale('Reached square 100.','Sasniegts 100. lauciņš.'),reset,api.locale);refresh();return}
  if(LADDERS[pos]){st.pos[st.turn]=LADDERS[pos];msg.textContent=api.locale('Ladder! Climb higher!','Kāpnes! Uzkāp augstāk!');api.beep(700,.12)}else if(SNAKES[pos]){st.pos[st.turn]=SNAKES[pos];msg.textContent=api.locale('Slide down the snake!','Čūska! Noslīdi lejā!');api.beep(180,.13)}
  else msg.textContent=st.turn===0?api.locale('Computer turn…','Datora gājiens…'):api.locale('Your turn — roll again!','Tavs gājiens — met vēlreiz!');
  if(st.pos[st.turn]===100){st.ended=true;const win=st.turn;api.onScore(win===0?100:st.pos[0]);overlay(wrapper,win===0?api.locale('You won the race!','Tu uzvarēji!'):api.locale('Computer wins!','Dators uzvarēja!'),api.locale('Reached square 100.','Sasniegts 100. lauciņš.'),reset,api.locale);refresh();return}
  st.turn=1-st.turn;st.rolling=false;st.delay=st.turn===1?.9:0;refresh()}
 function step(dt){st.animate+=dt;if(st.ended)return;if(st.rolling){st.timer-=dt;if(st.timer<=0){if(st.queue.length){st.pos[st.turn]=st.queue.shift();st.timer=.11;api.beep(360+(st.pos[st.turn]%6)*30,.028);refresh()}else endMove()}}
  else if(st.turn===1){st.delay-=dt;if(st.delay<=0)roll(1)}}
 function snake(from,to,color){const a=boardXY(from),b=boardXY(to);ctx.strokeStyle=color;ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x,b.y);const mid=(a.y+b.y)*.5;ctx.bezierCurveTo(b.x-72,mid+22,a.x+68,mid-22,a.x,a.y);ctx.stroke();ctx.strokeStyle='#fef5efbb';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.arc(a.x,a.y,11,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(a.x-4,a.y-3,2.5,0,7);ctx.arc(a.x+3,a.y-3,2.5,0,7);ctx.fill()}
 function ladder(from,to){const a=boardXY(from),b=boardXY(to),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len*8,ny=dx/len*8;
  ctx.strokeStyle='#946f44';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(a.x+nx,a.y+ny);ctx.lineTo(b.x+nx,b.y+ny);ctx.moveTo(a.x-nx,a.y-ny);ctx.lineTo(b.x-nx,b.y-ny);ctx.stroke();ctx.strokeStyle='#f7e1ad';ctx.lineWidth=4;
  for(let t=0.09;t<1;t+=.11){const x=a.x+dx*t,y=a.y+dy*t;ctx.beginPath();ctx.moveTo(x+nx,y+ny);ctx.lineTo(x-nx,y-ny);ctx.stroke()}}
 function draw(){roundRect(ctx,0,0,700,700,21,'#28314e');roundRect(ctx,22,22,656,656,18,'#f4f6ee');
  for(let i=1;i<=100;i++){const {x,y}=boardXY(i),col=(i-1)%10,row=Math.floor((i-1)/10);roundRect(ctx,x-cell/2+1,y-cell/2+1,cell-2,cell-2,6,(row+col)%2?'#d4eff0':'#f9dfda');ctx.fillStyle='#32465e';ctx.font='bold 12px system-ui';ctx.textAlign='left';ctx.fillText(String(i),x-cell/2+6,y-cell/2+16)}
  for(const [a,b] of Object.entries(LADDERS))ladder(Number(a),b);
  for(const [a,b] of Object.entries(SNAKES))snake(Number(a),b,Number(a)%2?'#b864a5':'#42a58e');
  st.pos.forEach((n,p)=>{const {x,y}=boardXY(n);ctx.save();ctx.translate(x+(p?-10:10),y+(p?8:-8));ctx.shadowColor='#0007';ctx.shadowBlur=10;ctx.fillStyle=p?'#8653cf':'#11a58e';ctx.beginPath();ctx.arc(0,0,12,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0;text(ctx,String(p+1),0,5,11,'#fff');ctx.restore()});
  roundRect(ctx,220,8,260,31,13,'#293959e9');text(ctx,api.locale('CIRKS • RACE TO 100','CIRKS • LĪDZ 100'),350,29,17,'#f8fff8');}
 reset();const stop=loop(step,draw);return()=>{stop();ac.abort()}
}
