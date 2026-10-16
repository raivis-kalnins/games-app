import {canvasStage,loop,hud,status,overlay,clamp,roundRect,text} from './shared.js';
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),s=ac.signal;const {wrapper,canvas,ctx,point}=canvasStage(root,720,425,'stage-wide');const info=hud(root,'<span>🎱 <b id="snooker-points">0</b></span><span>● <b id="snooker-balls">16</b> balls</span>');status(root,api.locale('Drag back from the white ball and release to shoot.','Velc prom no baltās bumbas un atlaid, lai sistu.'));
const R=10,pockets=[{x:29,y:29},{x:360,y:29},{x:691,y:29},{x:29,y:396},{x:360,y:396},{x:691,y:396}];let balls,score,drag,shot,ended,scratch;
function ball(x,y,color,points=1,cue=false){return{x,y,vx:0,vy:0,color,points,cue}}
function reset(){balls=[ball(159,285,'#fff',0,true),ball(232,273,'#eac34f',2),ball(232,149,'#40985c',3),ball(232,212,'#9a6b48',4),ball(356,212,'#4994d7',5),ball(401,212,'#ed9db0',6),ball(632,212,'#222a31',7)];for(let row=0;row<4;row++)for(let j=0;j<=row;j++)balls.push(ball(449+row*20,212+(j-row/2)*23,'#cd4a59',1));score=0;drag=null;shot=false;ended=false;scratch=false;update();api.onScore(0)}
function update(){info.querySelector('#snooker-points').textContent=score;info.querySelector('#snooker-balls').textContent=balls.filter(b=>!b.cue).length}
function moving(){return balls.some(b=>Math.abs(b.vx)+Math.abs(b.vy)>5)}
function cue(){return balls.find(b=>b.cue)}
function anyPotted(){for(let i=balls.length-1;i>=0;i--){const b=balls[i];if(pockets.some(p=>Math.hypot(b.x-p.x,b.y-p.y)<22)){if(b.cue){scratch=true;balls.splice(i,1);api.beep(160,.12)}else{score+=b.points;api.onScore(score);api.beep(790,.1);balls.splice(i,1);update()}}}}
function step(dt){if(ended)return;const sub=4,st=dt/sub;for(let n=0;n<sub;n++){
 for(const b of balls){b.x+=b.vx*st;b.y+=b.vy*st;const f=Math.pow(.984,st*60);b.vx*=f;b.vy*=f;if(Math.hypot(b.vx,b.vy)<5)b.vx=b.vy=0}
 anyPotted();
 for(const b of balls){if(b.x<38+R){b.x=38+R;b.vx=Math.abs(b.vx)*.87}if(b.x>682-R){b.x=682-R;b.vx=-Math.abs(b.vx)*.87}if(b.y<38+R){b.y=38+R;b.vy=Math.abs(b.vy)*.87}if(b.y>387-R){b.y=387-R;b.vy=-Math.abs(b.vy)*.87}}
 for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>0&&d<R*2){const nx=dx/d,ny=dy/d,overlap=R*2-d;a.x-=nx*overlap/2;b.x+=nx*overlap/2;a.y-=ny*overlap/2;b.y+=ny*overlap/2;const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rel>0){a.vx-=rel*nx*.96;a.vy-=rel*ny*.96;b.vx+=rel*nx*.96;b.vy+=rel*ny*.96}}}
 }
 if(!moving()){
  if(scratch&&!cue()){let y=280;while(balls.some(b=>Math.hypot(b.x-160,b.y-y)<R*2.3)&&y>70)y-=24;balls.unshift(ball(160,y,'#fff',0,true));scratch=false}
  if(shot){shot=false;update();if(!balls.some(b=>!b.cue)){ended=true;api.onScore(score);overlay(wrapper,api.locale('Table cleared!','Galds iztīrīts!'),`${score} ${api.locale('points','punkti')}`,reset,api.locale)}}
 }
}
canvas.addEventListener('pointerdown',e=>{if(ended||moving()||shot||!cue())return;const p=point(e),b=cue();if(Math.hypot(p.x-b.x,p.y-b.y)<55){drag=p;canvas.setPointerCapture(e.pointerId)}},{signal:s});
canvas.addEventListener('pointermove',e=>{if(drag)drag=point(e)},{signal:s});
canvas.addEventListener('pointerup',e=>{if(!drag||!cue())return;const b=cue(),end=point(e),dx=b.x-end.x,dy=b.y-end.y,len=Math.hypot(dx,dy);if(len>14){const power=clamp(len*5.8,65,920);b.vx=dx/len*power;b.vy=dy/len*power;shot=true;api.beep(275,.08)}drag=null},{signal:s});
canvas.addEventListener('pointercancel',()=>drag=null,{signal:s});
function draw(){roundRect(ctx,0,0,720,425,20,'#57392d');roundRect(ctx,18,18,684,389,20,'#99704a');roundRect(ctx,32,32,656,361,17,'#145d47');for(let x=80;x<700;x+=95){ctx.fillStyle='#ffffff09';ctx.fillRect(x,38,2,350)}ctx.strokeStyle='#c4e3bf55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(235,40);ctx.lineTo(235,385);ctx.stroke();ctx.beginPath();ctx.arc(235,213,72,-Math.PI/2,Math.PI/2);ctx.stroke();
 for(const p of pockets){ctx.fillStyle='#09171c';ctx.beginPath();ctx.arc(p.x,p.y,24,0,7);ctx.fill();ctx.strokeStyle='#ceaf80';ctx.lineWidth=4;ctx.stroke()}
 for(const b of balls){const g=ctx.createRadialGradient(b.x-4,b.y-4,1,b.x,b.y,R);g.addColorStop(0,'#ffffffbb');g.addColorStop(.45,b.color);g.addColorStop(1,b.color);ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,R,0,7);ctx.fill();ctx.strokeStyle='#1117';ctx.lineWidth=1;ctx.stroke()}
 const b=cue();if(drag&&b){const dx=b.x-drag.x,dy=b.y-drag.y,length=Math.hypot(dx,dy);if(length>5){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+dx/length*160,b.y+dy/length*160);ctx.strokeStyle='#e8e4a9bb';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(b.x-dx/length*14,b.y-dy/length*14);ctx.lineTo(b.x-dx/length*(50+length*.4),b.y-dy/length*(50+length*.4));ctx.strokeStyle='#dcb980';ctx.lineWidth=6;ctx.stroke()}}
 text(ctx,'63 SNOOKER CLUB',360,18,13,'#f5e2ca')}
reset();const stop=loop(step,draw);return()=>{stop();ac.abort()}}
