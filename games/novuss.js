/* Original accessible Novuss mini-game. Simplified house rules, not a certified
   federation competition simulator. Physical discs, 4 pockets, AI opponent. */
import {canvasStage,loop,hud,status,controls,overlay,clamp,roundRect,text} from './shared.js';
const SIZE=700,R=13,CR=20,HOLES=[[37,37],[663,37],[37,663],[663,663]],EDGE=45;
export function initialDiscs(){const a=[];for(let i=0;i<8;i++){
 a.push({id:'h'+i,owner:0,x:235+i*32,y:115,vx:0,vy:0,r:R});
 a.push({id:'c'+i,owner:1,x:235+i*32,y:585,vx:0,vy:0,r:R});
 }return a;}
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),signal=ac.signal;
 const {wrapper,canvas,ctx,point}=canvasStage(root,SIZE,SIZE,'stage-square novuss-stage');
 const scoreboard=hud(root,'<span>🟢 <b data-you>8</b> '+api.locale('your discs','tavi kauliņi')+'</span><span data-turn>🎯</span><span>🟠 <b data-ai>8</b> '+api.locale('computer','dators')+'</span>');
 const info=status(root,'');info.setAttribute('aria-live','polite');
 const st={discs:[],striker:null,turn:0,drag:null,shooting:false,first:null,pocketed:[],scratch:false,aiDelay:0,finished:false,shots:0};
 const who=i=>i?api.locale('Computer','Dators'):api.locale('You','Tu');
 function tell(en,lv){info.textContent=api.locale(en,lv)}
 function update(){scoreboard.querySelector('[data-you]').textContent=st.discs.filter(d=>d.owner===0).length;scoreboard.querySelector('[data-ai]').textContent=st.discs.filter(d=>d.owner===1).length;scoreboard.querySelector('[data-turn]').textContent='🎯 '+who(st.turn)}
 function striker(){return{x:350,y:st.turn?68:632,vx:0,vy:0,r:CR,id:'striker',owner:-1}}
 function reset(){st.discs=initialDiscs();st.turn=0;st.drag=null;st.shooting=false;st.aiDelay=0;st.striker=striker();st.pocketed=[];st.scratch=false;st.finished=false;st.shots=0;wrapper.querySelector('.overlay-center')?.remove();tell('Aim with the striker at your green discs. Pull and release to strike.','Mērķē ar lielo ripu uz saviem zaļajiem kauliņiem. Pavelc un atlaid, lai sistu.');update()}
 const all=()=>st.striker?[...st.discs,st.striker]:st.discs;
 const moving=()=>all().some(b=>Math.hypot(b.vx,b.vy)>4);
 function getTarget(i){const a=st.discs.filter(d=>d.owner===i);return a[Math.floor(Math.random()*a.length)]}
 function aishoot(){if(st.turn!==1||st.finished||st.shooting)return;const aim=getTarget(1);if(!aim){finish(1);return}
  const s=st.striker||striker();st.striker=s;s.x=clamp(aim.x+(Math.random()-.5)*70,120,580);s.y=68;
  const dx=aim.x-s.x+(Math.random()-.5)*35,dy=aim.y-s.y;const norm=Math.hypot(dx,dy)||1;
  s.vx=dx/norm*680;s.vy=dy/norm*680;st.shooting=true;st.shots++;api.beep(240,.06);
 }
 function finish(winner){st.finished=true;api.onScore(winner===0?Math.max(1,12-st.shots):0);overlay(wrapper,(winner===0?api.locale('You win!','Tu uzvarēji!'):api.locale('Computer wins!','Dators uzvarēja!')),api.locale('All discs pocketed.','Visi savas krāsas kauliņi iesisti lūzās.'),reset,api.locale)}
 function endTurn(){const own=st.pocketed.includes(st.turn);if(st.discs.every(d=>d.owner!==st.turn)){finish(st.turn);return}
  if(!own||st.scratch){st.turn=1-st.turn;tell(st.scratch?'Striker in pocket — turn lost.':`${who(st.turn)} to shoot.`,st.scratch?'Ripa iekrita lūzā — gājiens zaudēts.':`${who(st.turn)} gājiens.`)}
  else tell('Own disc pocketed — another shot!','Savas krāsas kauliņš lūzā — sit vēlreiz!');
  st.shooting=false;st.pocketed=[];st.scratch=false;st.first=null;st.striker=striker();st.aiDelay=st.turn===1?1.05:0;update();}
 function physics(dt){if(st.finished)return;if(st.aiDelay>0){st.aiDelay-=dt;if(st.aiDelay<=0&&!st.shooting)aishoot()}
  const bodies=all();for(let n=0;n<5;n++){const d=dt/5;
    for(const b of bodies){b.x+=b.vx*d;b.y+=b.vy*d;const fr=Math.pow(.988,d*60);b.vx*=fr;b.vy*=fr;if(Math.hypot(b.vx,b.vy)<5)b.vx=b.vy=0;}
    for(let i=st.discs.length-1;i>=0;i--){const b=st.discs[i];if(HOLES.some(([x,y])=>Math.hypot(b.x-x,b.y-y)<37)){st.pocketed.push(b.owner);st.discs.splice(i,1);api.beep(610,.07)}}
    if(st.striker&&HOLES.some(([x,y])=>Math.hypot(st.striker.x-x,st.striker.y-y)<37)){st.striker=null;st.scratch=true;api.beep(130,.12)}
    for(const b of all()){if(b.x<EDGE+b.r){b.x=EDGE+b.r;b.vx=Math.abs(b.vx)*.83}if(b.x>SIZE-EDGE-b.r){b.x=SIZE-EDGE-b.r;b.vx=-Math.abs(b.vx)*.83}
      if(b.y<EDGE+b.r){b.y=EDGE+b.r;b.vy=Math.abs(b.vy)*.83}if(b.y>SIZE-EDGE-b.r){b.y=SIZE-EDGE-b.r;b.vy=-Math.abs(b.vy)*.83}}
    const arr=all();for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const a=arr[i],b=arr[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.01,min=a.r+b.r;
      if(dist>=min)continue;const nx=dx/dist,ny=dy/dist,dep=min-dist;a.x-=nx*dep*.5;a.y-=ny*dep*.5;b.x+=nx*dep*.5;b.y+=ny*dep*.5;
      const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rel>0){const v=rel*.94;a.vx-=v*nx;a.vy-=v*ny;b.vx+=v*nx;b.vy+=v*ny}}
  }
  if(st.shooting&&!moving())endTurn();
 }
 function shoot(p){const b=st.striker;if(!b||!st.drag)return;const dx=b.x-p.x,dy=b.y-p.y,len=Math.hypot(dx,dy);st.drag=null;
   if(len<18)return;const vel=clamp(len*11.6,230,1350);b.vx=dx/len*vel;b.vy=dy/len*vel;st.shooting=true;st.shots++;api.beep(340,.08)}
 canvas.addEventListener('pointerdown',e=>{if(st.turn||st.finished||st.shooting||!st.striker)return;const p=point(e);if(Math.hypot(p.x-st.striker.x,p.y-st.striker.y)<55){st.drag=p;canvas.setPointerCapture(e.pointerId)}else if(p.y>570){st.striker.x=clamp(p.x,90,610);st.drag=p;canvas.setPointerCapture(e.pointerId)}},{signal});
 canvas.addEventListener('pointermove',e=>{if(st.drag)st.drag=point(e)},{signal});canvas.addEventListener('pointerup',e=>shoot(point(e)),{signal});canvas.addEventListener('pointercancel',()=>st.drag=null,{signal});
 controls(root,[{label:api.locale('↻ New game','↻ Jauna spēle'),press:reset}],signal);
 function discDraw(b){ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#07181077';ctx.shadowBlur=8;
   const grad=ctx.createRadialGradient(-6,-7,1,0,0,b.r);grad.addColorStop(0,b.owner<0?'#fff4da':b.owner===0?'#93ffdd':'#ffbe85');grad.addColorStop(1,b.owner<0?'#b0aaa4':b.owner===0?'#157f77':'#c16a43');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,b.r,0,7);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=b.owner<0?'#e7dbc5':'#ffffff99';ctx.lineWidth=2;ctx.stroke();
   if(b.owner>=0){ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fillStyle='#133b37';ctx.fill()}else{ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.strokeStyle='#625e63';ctx.lineWidth=3;ctx.stroke()}
   ctx.restore()}
 function draw(){roundRect(ctx,0,0,700,700,25,'#604137');roundRect(ctx,12,12,676,676,22,'#ba925f');roundRect(ctx,41,41,618,618,9,'#d4c095');roundRect(ctx,53,53,594,594,8,'#f0dcad');
   const grad=ctx.createRadialGradient(350,320,20,350,350,450);grad.addColorStop(0,'#f4dda6');grad.addColorStop(1,'#cda976');ctx.fillStyle=grad;ctx.fillRect(65,65,570,570);
   ctx.strokeStyle='#946f4b';ctx.lineWidth=3;ctx.strokeRect(67,67,566,566);ctx.beginPath();ctx.arc(350,350,91,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(65,155);ctx.lineTo(635,155);ctx.moveTo(65,545);ctx.lineTo(635,545);ctx.stroke();
   for(const [x,y] of HOLES){ctx.shadowColor='#24130777';ctx.shadowBlur=10;ctx.fillStyle='#1d2c31';ctx.beginPath();ctx.arc(x,y,28,0,7);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#f9dda6';ctx.lineWidth=5;ctx.stroke()}
   for(const d of st.discs)discDraw(d);if(st.striker)discDraw(st.striker);
   if(st.drag&&st.striker){const s=st.striker,dx=s.x-st.drag.x,dy=s.y-st.drag.y,len=Math.hypot(dx,dy);if(len>1){const nx=dx/len,ny=dy/len;ctx.lineWidth=3;ctx.strokeStyle='#236d68';ctx.setLineDash([9,7]);ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+nx*220,s.y+ny*220);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#775343';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(s.x-nx*15,s.y-ny*15);ctx.lineTo(s.x-nx*(20+len*.8),s.y-ny*(20+len*.8));ctx.stroke()}}
   text(ctx,'63 NOVUSS CLUB',350,34,15,'#fff1d8');text(ctx,api.locale('Drag the striker to shoot','Velc ripu, lai sistu'),350,675,14,'#fff5de');
 }
 reset();const stop=loop(physics,draw);return()=>{stop();ac.abort()}
}
