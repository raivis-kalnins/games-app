import {canvasStage,loop,controls,hud,overlay,rand,clamp,roundRect,text} from './shared.js';
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),s=ac.signal;const {wrapper,canvas,ctx,point}=canvasStage(root,600,510,'stage-wide'),info=hud(root,'<span>⭐ <b id="boat-score">0</b></span><span>❤️ <b id="boat-lives">3</b></span>');let x=300,score=0,lives=3,t=0,spawn=0,objects=[],dir=0,ended=false,invul=0,goalX=null;
function reset(){x=300;score=0;lives=3;t=spawn=invul=0;objects=[];dir=0;goalX=null;ended=false;update();api.onScore(0)}
function update(){info.querySelector('#boat-score').textContent=score;info.querySelector('#boat-lives').textContent=lives}
function toggle(v){return active=>{if(active)dir=v;else if(dir===v)dir=0}}
controls(root,[{label:'◀',name:'Steer left',hold:toggle(-1)},{label:'▶',name:'Steer right',hold:toggle(1)}],s);
const down=e=>{if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){e.preventDefault();dir=['ArrowLeft','KeyA'].includes(e.code)?-1:1}},up=e=>{if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){e.preventDefault();dir=0}};window.addEventListener('keydown',down,{signal:s});window.addEventListener('keyup',up,{signal:s});
canvas.addEventListener('pointerdown',e=>{goalX=point(e).x},{signal:s});canvas.addEventListener('pointermove',e=>{if(e.buttons)goalX=point(e).x},{signal:s});
function canal(y,offset=t){return 300+44*Math.sin((y+offset*89)/180)+23*Math.sin((y+offset*77)/95)}
function hit(){if(invul>0)return;lives--;invul=1.4;api.beep(150,.2);update();if(lives<=0){ended=true;overlay(wrapper,api.locale('Trip finished!','Brauciens beidzies!'),`${score} ${api.locale('points collected','savākti punkti')}`,reset,api.locale)}}
function step(dt){if(ended)return;t+=dt;invul=Math.max(0,invul-dt);if(goalX!==null){x+=(goalX-x)*Math.min(1,dt*5);if(Math.abs(goalX-x)<2)goalX=null}else x+=dir*260*dt;
const left=canal(410)-128,right=canal(410)+128;x=clamp(x,50,550);if(x<left||x>right)hit();spawn+=dt;if(spawn>1.2){spawn=0;const yy=-35,cx=canal(yy);objects.push({x:cx+rand(-104,104),y:yy,type:Math.random()<.64?'star':'gondola',hit:false})}
for(const o of objects){o.y+=155*dt;if(!o.hit&&Math.abs(o.y-415)<25&&Math.abs(o.x-x)<26){o.hit=true;if(o.type==='star'){score+=10;api.onScore(score);api.beep(760,.07);update()}else hit()}}objects=objects.filter(o=>o.y<540&&!o.hit)}
function building(x,y,n){roundRect(ctx,x,y,74,103,6,['#e8a178','#e3ca93','#d57f78','#d2b6aa'][n%4]);roundRect(ctx,x+10,y+16,19,30,2,'#436b8d');roundRect(ctx,x+42,y+16,19,30,2,'#436b8d');roundRect(ctx,x+24,y+65,23,38,4,'#766a72');roundRect(ctx,x-3,y-9,80,12,2,'#c57467')}
function draw(){ctx.fillStyle='#c2bc96';ctx.fillRect(0,0,600,510);for(let i=0;i<8;i++){let y=(i*126+(t*45)%126)-100;building(0,y,i);building(523,y,i+2)}ctx.beginPath();ctx.moveTo(canal(0)-143,0);for(let y=0;y<=510;y+=8)ctx.lineTo(canal(y)-143,y);for(let y=510;y>=0;y-=8)ctx.lineTo(canal(y)+143,y);ctx.closePath();ctx.fillStyle='#236f87';ctx.fill();ctx.strokeStyle='#fff1bb';ctx.lineWidth=7;ctx.stroke();
 for(let j=0;j<20;j++){let y=((j*71+t*116)%560)-30;let cx=canal(y);ctx.strokeStyle='#a6eff344';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-42,y);ctx.quadraticCurveTo(cx,y-8,cx+43,y);ctx.stroke()}
 for(const o of objects){if(o.type==='star'){text(ctx,'★',o.x,o.y+10,31,'#ffdc72')}else{ctx.save();ctx.translate(o.x,o.y);roundRect(ctx,-13,-27,26,55,11,'#2a2c40');roundRect(ctx,-9,-18,18,28,7,'#e6b888');ctx.restore()}}
 if(invul===0||Math.floor(invul*8)%2===0){ctx.save();ctx.translate(x,415);ctx.fillStyle='#e5f4f0';ctx.beginPath();ctx.ellipse(0,29,24,8,0,0,7);ctx.fill();roundRect(ctx,-18,-37,36,74,16,'#e3b87b');roundRect(ctx,-11,-27,22,48,11,'#624976');roundRect(ctx,-3,-49,6,58,2,'#fdf2cf');ctx.restore()}
 roundRect(ctx,175,12,250,42,10,'#123848cf');text(ctx,api.locale('VENICE CANALS','VENĒCIJAS KANĀLI'),300,39,20,'#fff6d9')}
const stop=loop(step,draw);return()=>{stop();ac.abort()}}
