import {canvasStage,loop,controls,keyboard,hud,overlay,rand,roundRect,text} from './shared.js';
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),s=ac.signal,{wrapper,canvas,ctx,point}=canvasStage(root,480,620,'stage-portrait');const info=hud(root,'<span>🏁 <b id="formula-dist">0 m</b></span><span>⚡ <b id="formula-speed">180 km/h</b></span><span>✦ LV <b id="formula-level">1/12</b></span>');const xs=[118,200,280,362];let lane=1,cars=[],distance=0,time=0,road=0,ended=false,reportTime=0,level=1,levelFlash=0,spawnTimer=0;
function reset(){lane=1;cars=[];distance=time=road=reportTime=spawnTimer=0;level=1;levelFlash=0;ended=false;wrapper.querySelector('.overlay-center')?.remove();api.onScore(0)}
function steer(n){if(!ended){lane=Math.max(0,Math.min(3,lane+n));api.beep(320,.024)}}
controls(root,[{label:'◀',name:'Steer left',press:()=>steer(-1)},{label:'▶',name:'Steer right',press:()=>steer(1)}],s);
keyboard(s,{ArrowLeft:()=>steer(-1),ArrowRight:()=>steer(1),KeyA:()=>steer(-1),KeyD:()=>steer(1)});
canvas.addEventListener('pointerdown',e=>steer(point(e).x<240?-1:1),{signal:s});
function step(dt){if(ended)return;time+=dt;const speed=225+Math.min(170,distance/58),scroll=speed*dt;road=(road+scroll)%85;distance+=scroll/10;reportTime+=dt;levelFlash=Math.max(0,levelFlash-dt);
 const nextLevel=Math.min(12,1+Math.floor(distance/240));if(nextLevel>level){level=nextLevel;levelFlash=1.6;api.beep(860,.1)}
 if(reportTime>.4){api.onScore(distance);reportTime=0}info.querySelector('#formula-dist').textContent=Math.floor(distance)+' m';info.querySelector('#formula-speed').textContent=Math.floor(170+speed/7)+' km/h';info.querySelector('#formula-level').textContent=level+'/12';
 spawnTimer-=dt;
 if(spawnTimer<=0&&!cars.some(c=>c.y<145)){
   const first=Math.floor(rand(0,4));const colour=['#eb6c71','#e7c75b','#92d4df','#9d94eb'];cars.push({lane:first,x:xs[first],y:-75,color:colour[Math.floor(rand(0,4))],shifted:false});
   if(level>=4&&Math.random()<Math.min(.68,(level-3)*.085)){const available=[0,1,2,3].filter(n=>n!==first);const second=available[Math.floor(rand(0,available.length))];cars.push({lane:second,x:xs[second],y:-75,color:colour[Math.floor(rand(0,4))],shifted:true})}
   spawnTimer=Math.max(.56,1.45-level*.055)*(0.85+Math.random()*.24);
 }
 cars.forEach(c=>{c.y+=scroll*1.15;
   // Rivals occasionally switch to an adjacent lane well before reaching the player.
   if(!c.shifted&&level>=6&&c.y>65&&c.y<150&&Math.random()<dt*.8){const direction=Math.random()<.5?-1:1;const next=c.lane+direction;if(next>=0&&next<4&&!cars.some(o=>o!==c&&o.lane===next&&Math.abs(o.y-c.y)<140))c.lane=next;c.shifted=true;}
   c.x+=(xs[c.lane]-c.x)*Math.min(1,dt*5.5);
 });cars=cars.filter(c=>c.y<700);
 if(cars.some(c=>Math.abs(c.x-xs[lane])<35&&Math.abs(c.y-520)<63)){ended=true;api.beep(145,.3);api.onScore(distance);overlay(wrapper,api.locale('Race over!','Sacīkstes beigušās!'),api.locale(`${Math.floor(distance)} metres driven. Level ${level}.`,`Nobraukti ${Math.floor(distance)} metri. ${level}. līmenis.`),reset,api.locale)}
}
function car(x,y,color,player=false){ctx.save();ctx.translate(x,y);roundRect(ctx,-20,-31,40,63,11,color);roundRect(ctx,-17,-17,34,24,6,player?'#a6eee1':'#9dc0d1');roundRect(ctx,-25,-22,8,16,3,'#152236');roundRect(ctx,17,-22,8,16,3,'#152236');roundRect(ctx,-25,14,8,17,3,'#152236');roundRect(ctx,17,14,8,17,3,'#152236');if(player){roundRect(ctx,-22,-36,44,7,2,'#ffe286');roundRect(ctx,-18,23,36,8,2,'#222d4c')}ctx.restore()}
function draw(){ctx.fillStyle='#183e40';ctx.fillRect(0,0,480,620);for(let i=0;i<13;i++){const y=(i*84+road*1.6)%700-70;roundRect(ctx,9,y,52,48,5,i%2?'#38496b':'#4a7290');roundRect(ctx,419,y,52,48,5,i%2?'#365873':'#637595')}
 roundRect(ctx,73,0,334,620,0,'#303949');ctx.fillStyle='#faf5d6';ctx.fillRect(78,0,5,620);ctx.fillRect(397,0,5,620);
 for(let i=1;i<4;i++)for(let y=-90+road;y<640;y+=85)roundRect(ctx,77+i*80,y,4,43,1,'#b2b7bb88');
 cars.forEach(c=>car(c.x,c.y,c.color));car(xs[lane],520,'#7c65ef',true);roundRect(ctx,158,14,164,35,10,'#1a243bcd');text(ctx,'63 GRAND PRIX',240,38,19,'#f2f7fc');roundRect(ctx,164,51,152,5,2,'#43577b');roundRect(ctx,164,51,152*(distance%240)/240,5,2,'#66e0cd');if(levelFlash>0){ctx.globalAlpha=Math.min(1,levelFlash);roundRect(ctx,159,83,162,34,10,'#123d4d');text(ctx,'LEVEL '+level,240,106,20,'#7affd3');ctx.globalAlpha=1;}}
const stop=loop(step,draw);return()=>{stop();ac.abort()}}
