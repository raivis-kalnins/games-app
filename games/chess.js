/* Self-contained chess, legal move filter incl. castling, en passant and promotion,
 * and a depth-two material/position minimax opponent. No external service. */
import {element} from './shared.js';
const back=['R','N','B','Q','K','B','N','R'];
export const symbols={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};
const cost={P:100,N:315,B:325,R:505,Q:900,K:30000};
export function initial(){const b=Array.from({length:8},()=>Array(8).fill(''));for(let x=0;x<8;x++){b[0][x]='b'+back[x];b[1][x]='bP';b[6][x]='wP';b[7][x]='w'+back[x]}return{b,side:'w',ep:null,castle:{wK:true,wQ:true,bK:true,bQ:true},half:0}}
const inside=(x,y)=>x>=0&&x<8&&y>=0&&y<8;
const enemy=(p,s)=>!!p&&p[0]!==s;
function attacks(s,x,y,tx,ty,b){const p=b[y][x];if(!p||p[0]!==s)return false;const type=p[1],dx=tx-x,dy=ty-y;const adx=Math.abs(dx),ady=Math.abs(dy);
 if(type==='P')return adx===1&&dy===(s==='w'?-1:1);
 if(type==='N')return adx===1&&ady===2||adx===2&&ady===1;
 if(type==='K')return Math.max(adx,ady)===1;
 if(type==='R'&&dx!==0&&dy!==0)return false;
 if(type==='B'&&adx!==ady)return false;
 if(type==='Q'&&!(dx===0||dy===0||adx===ady))return false;
 const stepx=Math.sign(dx),stepy=Math.sign(dy);for(let cx=x+stepx,cy=y+stepy;cx!==tx||cy!==ty;cx+=stepx,cy+=stepy)if(b[cy]?.[cx])return false;
 return true}
function threatened(st,x,y,by){for(let yy=0;yy<8;yy++)for(let xx=0;xx<8;xx++)if(attacks(by,xx,yy,x,y,st.b))return true;return false}
export function inCheck(st,s){for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(st.b[y][x]===s+'K')return threatened(st,x,y,s==='w'?'b':'w');return true}
function raw(st,x,y){const b=st.b,p=b[y][x],s=p?.[0],t=p?.[1],out=[];if(!p)return out;const add=(xx,yy,special)=>{if(!inside(xx,yy)||b[yy][xx]?.[0]===s||b[yy][xx]?.[1]==='K')return false;out.push({x,y,xx,yy,special});return !b[yy][xx]};
 const walk=(dirs,max=7)=>{dirs.forEach(([dx,dy])=>{for(let i=1;i<=max;i++){const xx=x+dx*i,yy=y+dy*i;if(!inside(xx,yy))break;if(!add(xx,yy))break}})};
 if(t==='P'){const d=s==='w'?-1:1;if(inside(x,y+d)&&!b[y+d][x]){add(x,y+d);if(y===(s==='w'?6:1)&&!b[y+d*2][x])add(x,y+d*2,'double')}for(const xx of [x-1,x+1])if(inside(xx,y+d)&&enemy(b[y+d][xx],s))add(xx,y+d);else if(st.ep&&st.ep.x===xx&&st.ep.y===y+d)out.push({x,y,xx,yy:y+d,special:'ep'});}
 else if(t==='N')walk([[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]],1);
 else if(t==='B')walk([[1,1],[1,-1],[-1,1],[-1,-1]]);
 else if(t==='R')walk([[1,0],[-1,0],[0,1],[0,-1]]);
 else if(t==='Q')walk([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
 else if(t==='K'){
 walk([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],1);
 if(x===4&&y===(s==='w'?7:0)&&!inCheck(st,s)){const rank=y,opp=s==='w'?'b':'w';
 if(st.castle[s+'K']&&b[rank][7]===s+'R'&&!b[rank][5]&&!b[rank][6]&&!threatened(st,5,rank,opp)&&!threatened(st,6,rank,opp))out.push({x,y,xx:6,yy:rank,special:'castleK'});
 if(st.castle[s+'Q']&&b[rank][0]===s+'R'&&!b[rank][1]&&!b[rank][2]&&!b[rank][3]&&!threatened(st,3,rank,opp)&&!threatened(st,2,rank,opp))out.push({x,y,xx:2,yy:rank,special:'castleQ'});
 }}return out}
export function applyMove(st,m){const b=st.b.map(row=>row.slice()),piece=b[m.y][m.x],side=piece[0],captured=b[m.yy][m.xx],castle={...st.castle};b[m.y][m.x]='';b[m.yy][m.xx]=piece;let ep=null;
 if(piece[1]==='K'){castle[side+'K']=false;castle[side+'Q']=false;if(m.special==='castleK'){b[m.yy][5]=b[m.yy][7];b[m.yy][7]=''}if(m.special==='castleQ'){b[m.yy][3]=b[m.yy][0];b[m.yy][0]=''}}
 if(piece[1]==='R'){if(m.x===0&&m.y===(side==='w'?7:0))castle[side+'Q']=false;if(m.x===7&&m.y===(side==='w'?7:0))castle[side+'K']=false}
 if(captured?.[1]==='R'){const o=captured[0];if(m.xx===0&&m.yy===(o==='w'?7:0))castle[o+'Q']=false;if(m.xx===7&&m.yy===(o==='w'?7:0))castle[o+'K']=false}
 if(m.special==='ep')b[m.y][m.xx]='';if(m.special==='double')ep={x:m.x,y:(m.y+m.yy)/2};
 if(piece[1]==='P'&&(m.yy===0||m.yy===7))b[m.yy][m.xx]=side+'Q';
 return{b,side:side==='w'?'b':'w',ep,castle,half:piece[1]==='P'||captured?0:st.half+1}}
export function legalMoves(st,s=st.side){let out=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(st.b[y][x]?.[0]===s){for(const m of raw(st,x,y)){const next=applyMove(st,m);if(!inCheck(next,s))out.push(m)}}return out}
function score(st){let n=0;for(let y=0;y<8;y++)for(let x=0;x<8;x++){let p=st.b[y][x];if(!p)continue;const val=cost[p[1]]+(p[1]==='P'?(p[0]==='b'?y:7-y)*4:0)+Math.round((3.5-Math.abs(x-3.5))*2+(3.5-Math.abs(y-3.5))*2);n+=(p[0]==='b'?val:-val)}return n}
function mini(st,d,alpha,beta){const ms=legalMoves(st);if(!ms.length)return inCheck(st,st.side)?(st.side==='b'?-999999:999999):0;if(!d)return score(st);ms.sort((a,b)=>{const x=st.b[a.yy][a.xx],y=st.b[b.yy][b.xx];return (y?cost[y[1]]:0)-(x?cost[x[1]]:0)});
 const max=st.side==='b';let best=max?-1e8:1e8;for(const m of ms){const sc=mini(applyMove(st,m),d-1,alpha,beta);if(max){best=Math.max(best,sc);alpha=Math.max(alpha,sc)}else{best=Math.min(best,sc);beta=Math.min(beta,sc)}if(beta<=alpha)break}return best}
export function computerMove(st){const moves=legalMoves(st,'b');if(!moves.length)return null;let best=-Infinity,opts=[];for(const m of moves){const next=applyMove(st,m);const v=mini(next,1,-1e8,1e8)+(Math.random()-.5)*5;if(v>best){best=v;opts=[m]}}return opts[0]}
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),s=ac.signal;let st=initial(),sel=null,turns=0,won=0,wait=false,last=null,pending=null,done=false;
 const wrap=element('div','chess-wrap');wrap.innerHTML='<div class="hud-inset"><span class="chess-turn"></span><span class="chess-score"></span></div><div class="chessboard" role="grid" aria-label="Chess board"></div><div class="game-status chess-help" aria-live="polite"></div>';root.append(wrap);
 const grid=wrap.querySelector('.chessboard'),help=wrap.querySelector('.chess-help'),status=wrap.querySelector('.chess-turn'),wins=wrap.querySelector('.chess-score');
 function opts(){return sel?legalMoves(st,'w').filter(m=>m.x===sel[0]&&m.y===sel[1]):[]}
 // Keep all 64 board nodes mounted. Replacing innerHTML after every tap used to
 // recalculate implicit grid row sizes, lose touch focus and visibly jump squares.
 const cells=Array.from({length:8},(_,y)=>Array.from({length:8},(_,x)=>{
   const b=element('button','chess-cell '+((x+y)%2?'dark':'light'));
   b.type='button';b.setAttribute('role','gridcell');b.dataset.x=String(x);b.dataset.y=String(y);
   const piece=element('span','chess-piece');piece.setAttribute('aria-hidden','true');b.append(piece);grid.append(b);
   return b;
 }));
 function draw(){const ms=opts(),legal=new Set(ms.map(m=>m.xx+':'+m.yy));const check=inCheck(st,st.side);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
   const piece=st.b[y][x],cell=cells[y][x],target=cell.firstChild;
   let cc='chess-cell '+((x+y)%2?'dark':'light');
   if(piece)cc+=' '+(piece[0]==='w'?'white-piece':'black-piece');
   if(sel&&sel[0]===x&&sel[1]===y)cc+=' selected';
   if(legal.has(x+':'+y))cc+=' legal'+(piece?' has-piece':'');
   if(piece===st.side+'K'&&check)cc+=' in-check';
   if(last?.x===x&&last?.y===y)cc+=' last-from';
   if(last?.xx===x&&last?.yy===y)cc+=' last-to';
   if(cell.className!==cc)cell.className=cc;
   const symbol=symbols[piece]||'';if(target.textContent!==symbol)target.textContent=symbol;
   const label=String.fromCharCode(97+x)+(8-y)+' '+(piece||'empty');
   if(cell.getAttribute('aria-label')!==label)cell.setAttribute('aria-label',label);
   cell.setAttribute('aria-selected',String(!!sel&&sel[0]===x&&sel[1]===y));
  }
  status.textContent=done?api.locale('Game finished','Spēle beigusies'):wait?api.locale('Computer is thinking…','Dators domā…'):api.locale('White to move','Balto gājiens');
  wins.textContent='🏆 '+won;
  help.textContent=done?api.locale('Restart to play again.','Sāc vēlreiz, lai spēlētu.'):check?api.locale('Check! Protect your king.','Šahs! Sargā karali.'):api.locale('Select a piece, then a highlighted square.','Izvēlies figūru un pēc tam izcelto lauciņu.')
 }
 function finish(){const moves=legalMoves(st);if(!moves.length){done=true;if(st.side==='b'){won++;api.onScore(won)}const text=inCheck(st,st.side)?st.side==='b'?api.locale('Checkmate — you win!','Mats — tu uzvarēji!'):api.locale('Checkmate — computer wins','Mats — dators uzvarēja'):api.locale('Stalemate — draw','Pats — neizšķirts');help.textContent=text;return true}if(st.half>=100){done=true;help.textContent=api.locale('Draw — 50 move rule.','Neizšķirts — 50 gājienu noteikums.');return true}return false}
 function click(x,y){if(wait||done)return;const ms=opts(),move=ms.find(m=>m.xx===x&&m.yy===y);if(move){last=move;st=applyMove(st,move);sel=null;turns++;api.beep(480,.045);if(finish()){draw();return}wait=true;draw();pending=setTimeout(()=>{if(s.aborted)return;const cm=computerMove(st);if(cm){last=cm;st=applyMove(st,cm);api.beep(320,.04)}wait=false;finish();draw()},390);return}sel=st.b[y][x]?.[0]==='w'?[x,y]:null;draw()}
 grid.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b)click(Number(b.dataset.x),Number(b.dataset.y))},{signal:s});const restart=element('button','button-wide',api.locale('↻ New chess match','↻ Jauna šaha partija'));restart.type='button';restart.addEventListener('click',()=>{if(pending)clearTimeout(pending);st=initial();sel=null;last=null;wait=done=false;draw()},{signal:s});root.append(restart);draw();return()=>{ac.abort();if(pending)clearTimeout(pending)}}
