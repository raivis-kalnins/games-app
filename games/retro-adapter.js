/* Adapters for stand-alone LCD Wolf, Draw Dominoes and Latvian Zole engines. */
import './wolf-retro.js';
import './domino.js';
import './zole.js';

export function mountGame(type,root,api){
 root.replaceChildren();const ac=new AbortController(),signal=ac.signal;const dpr=Math.min(2,devicePixelRatio||1);
 const frame=document.createElement('div');frame.className='stage-wrap stage-landscape legacy-stage';
 const canvas=document.createElement('canvas');canvas.width=800*dpr;canvas.height=540*dpr;canvas.style.aspectRatio='800 / 540';canvas.setAttribute('aria-label','Interactive '+type+' game');
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);frame.append(canvas);
 const zRoot=document.createElement('div');zRoot.className='zole-host';zRoot.hidden=true;
 const msg=document.createElement('div');msg.className='legacy-message';msg.setAttribute('aria-live','polite');frame.append(msg);
 const controls=document.createElement('div');controls.id='controls';controls.className='control-bar legacy-controls';root.append(frame,zRoot,controls);
 const g={score:0,time:0,over:false};
 const show=s=>{msg.textContent=s||'';msg.hidden=!s;};
 const points=n=>{g.score=n;api.onScore(n)};
 const btn=(label,action)=>{const b=document.createElement('button');b.type='button';b.className='control ctrl-btn';b.textContent=label;controls.append(b);b.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='mouse'||e.pointerType==='pen'){e.preventDefault();action()}},{signal});b.addEventListener('click',e=>{if(e.detail===0)action()},{signal});return b};
 const options={g,ctx,btn,points,show,t:api.t,canvas,root:zRoot,controls};
 if(type==='wolf')window.G63Wolf(options);
 if(type==='domino')window.G63Domino(options);
 if(type==='zole'){msg.hidden=true;window.G63Zole(options)}
 canvas.addEventListener('pointerdown',e=>{if(!g.tap||g.over&&type!=='wolf')return;const r=canvas.getBoundingClientRect();g.tap((e.clientX-r.left)*800/r.width,(e.clientY-r.top)*540/r.height)},{signal});
 window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();g.key?.(e.key)},{signal});
 let active=true,last=performance.now(),raf=0;
 function tick(now){if(!active)return;const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){g.time+=dt;g.update?.(dt)}g.draw?.();raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick);
 return ()=>{active=false;cancelAnimationFrame(raf);ac.abort();g.cleanup?.();if(g.audio?.close)g.audio.close().catch(()=>{})};
}
