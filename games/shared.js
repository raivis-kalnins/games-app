export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const rand=(a,b)=>Math.random()*(b-a)+a;
export function canvasStage(root,w,h,size='stage-landscape'){
 const wrapper=document.createElement('div');wrapper.className='stage-wrap '+size;
 const canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive game stage');
 const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.aspectRatio=`${w} / ${h}`;
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);wrapper.append(canvas);root.append(wrapper);
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*w/r.width,y:(e.clientY-r.top)*h/r.height}};
 return {wrapper,canvas,ctx,w,h,point};
}
export function loop(step,draw){let frame=0,last=performance.now(),active=true;function tick(now){if(!active)return;const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden&&!window.G63HelpOpen)step(dt);draw();frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick);return()=>{active=false;cancelAnimationFrame(frame)}}
export function element(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e}
export function controls(root,buttons,signal){const bar=element('div','control-bar');buttons.forEach(b=>{if(!b){bar.append(element('span','ctrl-spacer'));return}const x=element('button','ctrl-btn'+(b.primary?' primary':''));x.type='button';x.textContent=b.label;x.setAttribute('aria-label',b.name||b.label);bar.append(x);if(b.hold){let active=false;x.addEventListener('pointerdown',ev=>{ev.preventDefault();active=true;b.hold(true);x.setPointerCapture?.(ev.pointerId)},{signal});const release=()=>{if(active){active=false;b.hold(false)}};x.addEventListener('pointerup',release,{signal});x.addEventListener('pointercancel',release,{signal});x.addEventListener('lostpointercapture',release,{signal})}else if(b.press)x.addEventListener('click',b.press,{signal})});root.append(bar);return bar}
export function keyboard(signal,map){window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;if(window.G63HelpOpen)return;const f=map[e.code];if(f){e.preventDefault();if(!e.repeat||f.repeat)f()||null}},{signal})}
export function hud(root,html){const el=element('div','hud-inset',html);root.append(el);return el}
export function status(root,html){const el=element('div','game-status',html);root.append(el);return el}
export function overlay(stage,title,info,restart,locale){const box=element('div','overlay-center');box.innerHTML=`<div class="game-over-box"><h3>${title}</h3><p>${info}</p><button type="button" class="btn-primary">↻ ${locale('Play again','Spēlēt vēlreiz')}</button></div>`;stage.append(box);box.querySelector('button').addEventListener('click',()=>{box.remove();restart()});return box}
export function roundRect(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
export function text(ctx,s,x,y,size=18,color='#fff',align='center'){ctx.fillStyle=color;ctx.font=`700 ${size}px system-ui,sans-serif`;ctx.textAlign=align;ctx.fillText(s,x,y)}
