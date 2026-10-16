/* Mount original offline Canvas games in an isolated, disposable stage.
   Keeps animation frames and listeners outside the React render cycle. */
import './wolf-retro.js';
import './domino.js';
import './zole.js';
import {loop} from './shared.js';

export function mountLegacy(kind, root, api) {
  root.replaceChildren();
  const abort = new AbortController();
  const stage = document.createElement('div');
  stage.className = 'stage-wrap stage-landscape legacy-stage';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', kind==='wolf'?'Wolf egg-catching arcade':'Domino board');
  canvas.setAttribute('role', 'img');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(800 * dpr);
  canvas.height = Math.round(540 * dpr);
  canvas.style.aspectRatio = '800 / 540';
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const notice = document.createElement('div');
  notice.className = 'legacy-notice';
  notice.hidden = true;
  stage.append(canvas, notice);
  const controlBar = document.createElement('div');
  controlBar.id = 'controls';
  controlBar.className = 'control-bar legacy-controls';
  const domRoot = document.createElement('div');
  domRoot.className = 'legacy-dom';
  domRoot.hidden = true;
  root.append(stage, controlBar, domRoot);
  const g = {over:false, score:0, update:()=>{}, draw:()=>{}, beep:api.beep};
  const btn = (label, callback) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ctrl-btn control';
    b.textContent = label;
    b.addEventListener('click', callback, {signal:abort.signal});
    controlBar.append(b);
    return b;
  };
  const points = score => { g.score = score; api.onScore(score); };
  const show = message => { notice.hidden = !message; notice.textContent = message || ''; };
  const t = key => api.t(key);
  const factories = {wolf:window.G63Wolf, domino:window.G63Domino, zole:window.G63Zole};
  const game = factories[kind];
  if (typeof game !== 'function') throw new Error('Game module not found: '+kind);
  game({g, ctx, btn, points, show, t, canvas, root:domRoot, controls:controlBar});
  if (g.dom) { stage.hidden = true; controlBar.hidden = true; }
  const stop = loop(dt => g.update?.(dt), () => {if (!g.dom) g.draw?.();});
  canvas.addEventListener('pointerdown', e => {
    if (typeof g.tap !== 'function') return;
    const r = canvas.getBoundingClientRect();
    g.tap((e.clientX - r.left)*800/r.width, (e.clientY-r.top)*540/r.height);
  }, {signal:abort.signal});
  window.addEventListener('keydown', e => {
    if (window.G63HelpOpen || e.target?.matches?.('input, select, textarea, [contenteditable], button')) return;
    if (g.key && ['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','1','2','3','4','5','6','7','8','9','w','e','s','d','p','P'].includes(e.key)) {
      e.preventDefault();
      g.key(e.key);
    }
  }, {signal:abort.signal});
  return {
    localize() { g.localize?.(); },
    destroy() { abort.abort(); stop(); g.cleanup?.(); if (g.audio?.close) g.audio.close().catch(()=>{}); root.replaceChildren(); }
  };
}
