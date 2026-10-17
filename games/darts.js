import {canvasStage,loop,controls,hud,overlay,rand,clamp,text,element,status} from './shared.js';
const ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
/* Clockwise dart numbering: 20 is at 12 o'clock. */
export function hitAt(x,y){const dx=x-260,dy=y-260,r=Math.hypot(dx,dy);
 if(r>213)return {points:0,double:false,ring:'miss',number:0};
 if(r<11)return {points:50,double:true,ring:'bull',number:25};
 if(r<23)return {points:25,double:false,ring:'outer bull',number:25};
 const angle=Math.atan2(dx,-dy),i=(Math.round(angle/(Math.PI/10))+20)%20,n=ORDER[i];
 if(r>=196)return {points:n*2,double:true,ring:'double',number:n};
 if(r>=119&&r<=133)return {points:n*3,double:false,ring:'triple',number:n};
 return {points:n,double:false,ring:'single',number:n};
}
export function scoreAt(x,y){return hitAt(x,y).points}
export function mountGame(root,api){root.replaceChildren();
 const ac=new AbortController(),signal=ac.signal;
 const {wrapper,canvas,ctx,point}=canvasStage(root,520,520,'stage-square');
 const boardHUD=hud(root,'<span>🎯 <b data-darts-remaining>301</b> / 301</span><span>↗ <b data-darts-left>3</b> darts</span><span>🏆 <b data-darts-wins>0</b> wins</span>');
 const announcement=status(root,'');announcement.setAttribute('aria-live','polite');announcement.classList.add('darts-announcement');
 const choices=element('div','darts-difficulty');root.append(choices);
 let difficulty='club',remaining=301,throws=3,wins=Math.max(0,api.best||0),lastVisit=301,aim={x:260,y:260},thrown=[],elapsed=0,wind=0,ended=false,locked=0,bust=false;
 const labels={easy:api.locale('Casual','Viegli'),club:api.locale('Club','Klubs'),hard:api.locale('Pro','Profesionālis')};
 const spreads={easy:14,club:28,hard:43};
 function update(){boardHUD.querySelector('[data-darts-remaining]').textContent=remaining;boardHUD.querySelector('[data-darts-left]').textContent=throws;boardHUD.querySelector('[data-darts-wins]').textContent=wins}
 function notice(en,lv){announcement.textContent=api.locale(en,lv)}
 function setMode(value){difficulty=value;for(const b of choices.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.difficulty===value));reset()}
 for(const id of ['easy','club','hard']){const b=element('button','darts-mode',labels[id]);b.type='button';b.dataset.difficulty=id;b.addEventListener('click',()=>setMode(id),{signal});choices.append(b)}
 function reset(){remaining=301;throws=3;lastVisit=301;aim={x:260,y:260};thrown=[];elapsed=0;wind=rand(-1,1);ended=false;locked=0;bust=false;notice('1. Tap a number on the board to aim. 2. Press THROW. Finish on a double.','1. Pieskaries sektoram, lai mērķētu. 2. Spied MEST. Pabeidz ar dubulto sektoru.');update();for(const b of choices.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.difficulty===difficulty))}
 function aiming(e){if(ended||locked)return;const p=point(e);aim={x:clamp(p.x,24,496),y:clamp(p.y,24,496)}; const target=hitAt(aim.x,aim.y);notice(target.points?`Target: ${target.number} (${target.ring}) = ${target.points}`:'Tap inside the board to select a scoring sector.',target.points?`Mērķis: ${target.number} (${target.ring}) = ${target.points} punkti`:'Pieskaries sektoram uz dēļa, lai izvēlētos punktus.')}
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);aiming(e)},{signal});
 canvas.addEventListener('pointermove',e=>{if(e.buttons)aiming(e)},{signal});
 const sway=()=>({x:Math.sin(elapsed*3.1+wind)*spreads[difficulty]*.47+Math.sin(elapsed*6.3)*spreads[difficulty]*.19,
   y:Math.cos(elapsed*2.7+wind)*spreads[difficulty]*.42+Math.sin(elapsed*5.6)*spreads[difficulty]*.17});
 function normal(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
 function nextVisit(){thrown=[];throws=3;lastVisit=remaining;wind=rand(-1.1,1.1);bust=false;notice('Next visit — take your time.','Nākamais gājiens — mērķē uzmanīgi.');update()}
 function shoot(){if(ended||locked||window.G63HelpOpen)return;
   const drift=sway(),spread=spreads[difficulty]*.68;
   const x=aim.x+drift.x+normal()*spread, y=aim.y+drift.y+normal()*spread;
   const hit=hitAt(x,y);thrown.push({x,y,score:hit.points,age:0});throws--;
   const next=remaining-hit.points;
   if(next<0||next===1||(next===0&&!hit.double)){
     bust=true;remaining=lastVisit;throws=0;api.beep(155,.19);
     notice('BUST — visit does not count.','PĀRSNIEGTS! Gājiens netiek ieskaitīts.');
   }else{remaining=next;api.beep(hit.points?520+Math.min(hit.points,60)*4:180,.11);
     notice(hit.points?`${hit.points} (${hit.ring}) · ${remaining} remaining`: 'Miss — 0 points',hit.points?`${hit.points} (${hit.ring}) · atlikums ${remaining}`:'Garām — 0 punktu');
   }
   update();
   if(remaining===0&&!bust){wins++;api.onScore(wins);ended=true;api.beep(980,.3);
     overlay(wrapper,api.locale('301 — you win!','301 — tu uzvarēji!'),api.locale(`Wins: ${wins}`,`Uzvaras: ${wins}`),reset,api.locale);return}
   if(!throws){locked=1.25}
 }
 controls(root,[{label:api.locale('🎯 THROW','🎯 MEST'),name:api.locale('Throw a dart','Mest šautriņu'),press:shoot,primary:true},
   {label:api.locale('⌖ Centre','⌖ Centrs'),press:()=>{aim={x:260,y:260}}}],signal);
 window.addEventListener('keydown',e=>{if(e.target.closest?.('input,select,textarea,button'))return;
   if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();shoot()}
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){
     e.preventDefault();aim.x=clamp(aim.x+(e.code==='ArrowLeft'?-8:e.code==='ArrowRight'?8:0),20,500);
     aim.y=clamp(aim.y+(e.code==='ArrowUp'?-8:e.code==='ArrowDown'?8:0),20,500)}
 },{signal});
 function sector(r0,r1,i,color){const from=(i-.5)*Math.PI/10-Math.PI/2,to=(i+.5)*Math.PI/10-Math.PI/2;
   ctx.beginPath();ctx.arc(260,260,r1,from,to);ctx.arc(260,260,r0,to,from,true);ctx.closePath();ctx.fillStyle=color;ctx.fill()}
 function draw(){
   ctx.clearRect(0,0,520,520);
   const wood=ctx.createRadialGradient(260,240,60,260,250,390);wood.addColorStop(0,'#364055');wood.addColorStop(1,'#151c2e');ctx.fillStyle=wood;ctx.fillRect(0,0,520,520);
   ctx.shadowColor='#0009';ctx.shadowBlur=20;ctx.fillStyle='#8c684d';ctx.beginPath();ctx.arc(260,260,236,0,7);ctx.fill();ctx.shadowBlur=0;
   ctx.fillStyle='#141c22';ctx.beginPath();ctx.arc(260,260,217,0,7);ctx.fill();
   for(let i=0;i<20;i++){const base=i%2?'#f0e7cd':'#232b25',col=i%2?'#418a61':'#d14f55';
     sector(23,119,i,base);sector(119,133,i,col);sector(133,196,i,base);sector(196,213,i,col);
     const a=i*Math.PI/10-Math.PI/2;text(ctx,String(ORDER[i]),260+Math.cos(a)*226,265+Math.sin(a)*226,15,'#f5eadd')}
   ctx.fillStyle='#54875a';ctx.beginPath();ctx.arc(260,260,23,0,7);ctx.fill();
   ctx.fillStyle='#d74e56';ctx.beginPath();ctx.arc(260,260,11,0,7);ctx.fill();
   ctx.strokeStyle='#bda98c';ctx.lineWidth=1.5;for(const r of [23,119,133,196,213]){ctx.beginPath();ctx.arc(260,260,r,0,7);ctx.stroke()}
   // Thin radial wires make the rings and doubles clearly readable.
   ctx.strokeStyle='#c3bba955';ctx.lineWidth=1;
   for(let i=0;i<20;i++){const a=(i+.5)*Math.PI/10-Math.PI/2;ctx.beginPath();ctx.moveTo(260+Math.cos(a)*23,260+Math.sin(a)*23);ctx.lineTo(260+Math.cos(a)*213,260+Math.sin(a)*213);ctx.stroke()}
   for(let i=0;i<thrown.length;i++){const d=thrown[i];ctx.save();ctx.translate(d.x,d.y);ctx.rotate(-.45);
     ctx.fillStyle='#fee6a2';ctx.beginPath();ctx.arc(0,0,5,0,7);ctx.fill();ctx.strokeStyle='#d9edff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(19,-21);ctx.stroke();
     ctx.fillStyle='#97cbea';ctx.beginPath();ctx.moveTo(19,-21);ctx.lineTo(27,-25);ctx.lineTo(23,-17);ctx.fill();ctx.restore()}
   if(!ended){ctx.strokeStyle='#ffe49a';ctx.lineWidth=2;ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(aim.x,aim.y,9,0,7);ctx.stroke();ctx.setLineDash([]);const d=sway(),x=aim.x+d.x,y=aim.y+d.y;
     ctx.shadowColor='#63f2df';ctx.shadowBlur=14;ctx.strokeStyle='#8fffe5';ctx.lineWidth=2.6;
     ctx.beginPath();ctx.arc(x,y,12,0,7);ctx.moveTo(x-22,y);ctx.lineTo(x-8,y);ctx.moveTo(x+8,y);ctx.lineTo(x+22,y);ctx.moveTo(x,y-22);ctx.lineTo(x,y-8);ctx.moveTo(x,y+8);ctx.lineTo(x,y+22);ctx.stroke();ctx.shadowBlur=0;
     ctx.fillStyle='#b3fff2';ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill()}
   text(ctx,api.locale('TAP SECTOR → THROW','IZVĒLIES SEKTORU → MEST'),260,20,13,'#c5faec')
   if(locked){ctx.fillStyle='#070d19b8';ctx.fillRect(0,225,520,63);text(ctx,bust?api.locale('BUST','PĀRSNIEGTS!'):api.locale('Next visit…','Nākamais gājiens…'),260,265,22,'#fff')}
 }
 reset();const stop=loop(dt=>{elapsed+=dt;thrown.forEach(d=>d.age+=dt);if(locked){locked=Math.max(0,locked-dt);if(!locked&&!ended)nextVisit()}},draw);
 return()=>{stop();ac.abort()};
}
