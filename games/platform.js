/* Star Hopper: original three-stage side-scrolling platform mini-game.
 * No Nintendo artwork, characters, names, sounds or other copyrighted assets. */
import {canvasStage,loop,controls,keyboard,hud,status,overlay,clamp,roundRect,text} from './shared.js';
const W=800,H=450,GRAV=1120,SPEED=290,LEAP=505;
export function makeLevel(index){const end=2150+index*120,holes=[[510,590],[1120,1230],[1660,1770]].map(([a,b])=>[a+index*24,b+index*24]);
 const pads=[{x:205,y:320,w:132},{x:385,y:274,w:118},{x:652,y:300,w:125},{x:850,y:251,w:140},{x:1080,y:312,w:125},{x:1320,y:270,w:146},{x:1510,y:312,w:145},{x:1800,y:267,w:145}].map((p,i)=>({...p,x:p.x+index*20,y:p.y-(index===2?((i%2)*15):0)}));
 const coins=[];for(let i=0;i<end;i+=145){coins.push({x:180+i,y:230-(i%3)*31,taken:false})}
 const foes=[330,750,985,1430,1580,1890].map((x,i)=>({x:x+index*30,y:354,vx:(i%2?75:-75)*(1+index*.15),alive:true}));
 return{end,holes,pads,coins,foes};}
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),signal=ac.signal;const {wrapper,canvas,ctx}=canvasStage(root,W,H,'stage-wide platform-stage');
 const info=hud(root,'<span>⭐ <b data-stars>0</b></span><span>🏞️ <b data-level>1</b>/3</span><span>♥ <b data-hearts>3</b></span>');
 const msg=status(root,api.locale('Move with ← → and jump with ↑ / Space.','Pārvietojies ar ← →, lec ar ↑ / atstarpes taustiņu.'));
 const st={level:0,world:null,player:{x:70,y:310,vy:0,vx:0,grounded:false},cam:0,stars:0,hearts:3,invincible:0,ended:false,frame:0};
 const keys={left:false,right:false,jump:false};
 function update(){info.querySelector('[data-stars]').textContent=st.stars;info.querySelector('[data-level]').textContent=st.level+1;info.querySelector('[data-hearts]').textContent=st.hearts;api.onScore(st.stars)}
 function reset(){st.level=0;st.stars=0;st.hearts=3;st.ended=false;st.world=makeLevel(0);st.player={x:70,y:300,vx:0,vy:0,grounded:false};st.invincible=1.4;st.cam=0;keys.left=keys.right=keys.jump=false;wrapper.querySelector('.overlay-center')?.remove();update()}
 function next(){st.level++;if(st.level>=3){st.ended=true;api.onScore(st.stars+150);overlay(wrapper,api.locale('All stages completed!','Visi līmeņi pabeigti!'),`⭐ ${st.stars}`,reset,api.locale);return}
  st.world=makeLevel(st.level);st.player={x:70,y:305,vx:0,vy:0,grounded:false};st.cam=0;st.invincible=1.5;update();msg.textContent=api.locale('New stage — keep going!','Jauns līmenis — turpini!')}
 function hurt(){if(st.invincible>0||st.ended)return;st.hearts--;st.invincible=1.5;api.beep(145,.2);if(st.hearts<=0){st.ended=true;overlay(wrapper,api.locale('Try again!','Mēģini vēlreiz!'),`⭐ ${st.stars}`,reset,api.locale)}else{st.player.x=Math.max(70,Math.floor(st.player.x/250)*250-100);st.player.y=245;st.player.vy=0}update()}
 const groundAt=x=>!st.world.holes.some(([a,b])=>x>a&&x<b);
 function jump(){if(st.player.grounded&&!st.ended){st.player.vy=-LEAP;st.player.grounded=false;api.beep(440,.075)}}
 const wasDown=e=>{if(window.G63HelpOpen||e.target.closest?.('input,textarea,select,button'))return;const v=e.type==='keydown';if(['ArrowLeft','KeyA'].includes(e.code)){keys.left=v;e.preventDefault()}if(['ArrowRight','KeyD'].includes(e.code)){keys.right=v;e.preventDefault()}
  if(['ArrowUp','Space','KeyW'].includes(e.code)){if(v&&!e.repeat)jump();keys.jump=v;e.preventDefault()}};
 window.addEventListener('keydown',wasDown,{signal});window.addEventListener('keyup',wasDown,{signal});
 controls(root,[{label:'◀',hold:on=>{keys.left=on},name:api.locale('Move left','Pa kreisi')},{label:'▶',hold:on=>{keys.right=on},name:api.locale('Move right','Pa labi')},{label:'⬆ '+api.locale('Jump','Lēkt'),press:jump,primary:true}],signal);
 function updateWorld(dt){if(st.ended)return;st.frame+=dt;st.invincible=Math.max(0,st.invincible-dt);
  const p=st.player,px=p.x,previousBottom=p.y+38;
  p.vx=(Number(keys.right)-Number(keys.left))*SPEED;p.x=clamp(p.x+p.vx*dt,18,st.world.end+30);p.vy+=GRAV*dt;p.y+=p.vy*dt;p.grounded=false;
  const surfaces=[];
  if(groundAt(p.x)&&groundAt(p.x+9)&&groundAt(p.x-9))surfaces.push({y:388,left:0,right:st.world.end+50});
  for(const pad of st.world.pads)surfaces.push({y:pad.y,left:pad.x,right:pad.x+pad.w});
  for(const s of surfaces){if(p.vy>=0&&p.x+13>s.left&&p.x-13<s.right&&previousBottom<=s.y+11&&p.y+38>=s.y){p.y=s.y-38;p.vy=0;p.grounded=true;}}
  if(p.y>535){hurt();if(!st.ended){p.x=Math.max(70,p.x-140);p.y=100;p.vy=0}return}
  for(const c of st.world.coins){if(!c.taken&&Math.hypot(p.x-c.x,p.y+13-c.y)<25){c.taken=true;st.stars+=10;api.beep(730,.06);update()}}
  for(const f of st.world.foes){if(!f.alive)continue;f.x+=f.vx*dt;if(!groundAt(f.x+Math.sign(f.vx)*24)||f.x<95||f.x>st.world.end-60)f.vx*=-1;
    if(Math.abs(p.x-f.x)<29&&Math.abs(p.y+22-f.y)<27){if(p.vy>110&&previousBottom<f.y-8){f.alive=false;p.vy=-LEAP*.62;st.stars+=25;api.beep(640,.08);update()}else hurt();}}
  if(p.x>=st.world.end-35)next();st.cam=clamp(p.x-250,0,st.world.end-W+50);
 }
 function draw(){const hue=['#70d2e7','#ffd7a7','#b9a7ea'][st.level];const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,hue);g.addColorStop(1,['#b1e9da','#f6c996','#e3b7df'][st.level]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   const cam=st.cam;
   for(let i=0;i<8;i++){const x=((i*225-cam*.23)%1250+1250)%1250-190,y=60+(i%3)*55;ctx.globalAlpha=.7;roundRect(ctx,x,y,104,25,16,'#ffffff');roundRect(ctx,x+15,y-13,60,25,17,'#ffffff')}ctx.globalAlpha=1;
   ctx.save();ctx.translate(-cam*.36,0);for(let i=-1;i<18;i++){const x=i*310;ctx.fillStyle='#4ea99980';ctx.beginPath();ctx.ellipse(x+90,407,192,132,0,0,7);ctx.fill()}ctx.restore();
   ctx.save();ctx.translate(-cam,0);
   for(let x=0;x<st.world.end;x+=80){if(!groundAt(x+36))continue;roundRect(ctx,x,388,80,95,5,'#684b55');ctx.fillStyle='#4c8349';ctx.fillRect(x,388,80,13);ctx.fillStyle='#f6b76a55';ctx.fillRect(x+2,410,23,6);ctx.fillRect(x+43,430,26,5)}
   for(const pad of st.world.pads){roundRect(ctx,pad.x,pad.y,pad.w,22,6,'#6a526d');roundRect(ctx,pad.x,pad.y,pad.w,9,5,'#53b777');ctx.fillStyle='#ffffff30';ctx.fillRect(pad.x+9,pad.y+5,pad.w-18,2)}
   for(const c of st.world.coins)if(!c.taken){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Math.sin(st.frame*4+c.x)*.22);ctx.shadowBlur=12;ctx.shadowColor='#fff0a4';ctx.fillStyle='#ffcb5c';ctx.beginPath();ctx.ellipse(0,0,10,13,0,0,7);ctx.fill();ctx.strokeStyle='#fff3b5';ctx.lineWidth=3;ctx.stroke();text(ctx,'★',0,5,13,'#a36439');ctx.restore()}
   for(const f of st.world.foes){if(!f.alive)continue;ctx.save();ctx.translate(f.x,f.y);roundRect(ctx,-18,-22,36,34,12,'#8847ac');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-7,-8,5,0,7);ctx.arc(7,-8,5,0,7);ctx.fill();ctx.fillStyle='#302346';ctx.fillRect(-8,-8,3,5);ctx.fillRect(5,-8,3,5);ctx.fillStyle='#562f79';ctx.fillRect(-17,11,12,5);ctx.fillRect(5,11,12,5);ctx.restore()}
   const p=st.player;ctx.save();ctx.translate(p.x,p.y);if(st.invincible>0&&Math.floor(st.frame*9)%2===0)ctx.globalAlpha=.52;
   ctx.fillStyle='#163b54';ctx.fillRect(-12,30,10,7);ctx.fillRect(4,30,12,7);
   roundRect(ctx,-17,2,34,29,10,'#177f91');roundRect(ctx,-14,-17,28,27,13,'#f7d19e');ctx.fillStyle='#163b54';ctx.fillRect(-8,-5,4,6);ctx.fillRect(5,-5,4,6);
   ctx.fillStyle='#5949a5';ctx.beginPath();ctx.moveTo(-18,-16);ctx.lineTo(-8,-27);ctx.lineTo(12,-24);ctx.lineTo(20,-12);ctx.closePath();ctx.fill();ctx.strokeStyle='#71f4d6';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-13,10);ctx.lineTo(12,10);ctx.stroke();ctx.restore();
   ctx.fillStyle='#fff';ctx.fillRect(st.world.end-20,190,6,198);ctx.fillStyle='#ff6d98';ctx.beginPath();ctx.moveTo(st.world.end-20,193);ctx.lineTo(st.world.end-20,242);ctx.lineTo(st.world.end+58,218);ctx.closePath();ctx.fill();ctx.restore();
   roundRect(ctx,18,16,156,31,15,'#152d5388');text(ctx,`${api.locale('STAGE','LĪMENIS')} ${st.level+1}/3`,96,37,16);
 }
 reset();const stop=loop(updateWorld,draw);return()=>{stop();ac.abort();keys.left=keys.right=false};
}
