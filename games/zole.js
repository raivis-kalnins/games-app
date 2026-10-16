/* Latvian Zole, 3-seat local player vs independent computer opponents.
 * 26 cards, 14 permanent trumps, follow-suit, talon, normal and solo bids.
 * Scoring follows the common Latvian big/solo +1/+2/+3, +5/+6/+7 variant.
 */
window.G63Zole = function ({g, root, canvas, controls, points, show, t}) {
  const SUITS=['♣','♠','♥','♦'],RANKS=['A','10','K','9'],PIPS={A:11,'10':10,K:4,Q:3,J:2,'9':0,'8':0,'7':0};
  const TRUMPS=['♣Q','♠Q','♥Q','♦Q','♣J','♠J','♥J','♦J','♦A','♦10','♦K','♦9','♦8','♦7'];
  const ids=[];for(const s of SUITS){for(const r of RANKS)ids.push({s,r,id:s+r});for(const r of ['Q','J'])ids.push({s,r,id:s+r})}for(const r of ['8','7'])ids.push({s:'♦',r,id:'♦'+r});
  const suit=c=>TRUMPS.includes(c.id)?'T':c.s;
  const power=c=>suit(c)==='T'?100-TRUMPS.indexOf(c.id):20-RANKS.indexOf(c.r);
  const strength=hand=>hand.reduce((p,c)=>p+(suit(c)==='T'?1.5+(power(c)>93?1:0):c.r==='A'?1.5:c.r==='10'?.5:0),0);
  let hands=[[],[],[]],talon=[],discards=[],dealer=2,round=0,turn=0,leader=0,table=[],taken=[{pts:0,tricks:0},{pts:0,tricks:0},{pts:0,tricks:0}],match=[0,0,0],
      declarer=0,mode='big',phase='bid',selected=[],info='',cpuDelay=0,shownTrick=null,lastResult='',waiting=null;
  canvas.hidden=true;root.hidden=false;controls.replaceChildren();g.dom=true;g.draw=null;
  const bar=document.createElement('div');bar.className='z-action-bar';root.append(bar);
  const page=document.createElement('section');page.className='zole-table';page.setAttribute('aria-label','Zole card table');root.prepend(page);
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[j],a[i]]=[a[i],a[j]]}return a}
  function sortHand(a){return a.sort((x,y)=>power(y)-power(x)||x.id.localeCompare(y.id))}
  function infoText(k){return t(k)}
  function startDeal(){let deck=shuffle(ids.map(x=>({...x})));hands=[deck.splice(0,8),deck.splice(0,8),deck.splice(0,8)].map(sortHand);talon=deck;
    table=[];discards=[];dealer=(dealer+1)%3;leader=(dealer+1)%3;turn=leader;mode='big';declarer=0;phase='bid';selected=[];waiting=null;cpuDelay=.65;
    taken=[0,1,2].map(()=>({pts:0,tricks:0}));round++;g.over=false;
    info=t('chooseBid');render()}
  function botBid(p){const s=strength(hands[p]);return s>12?'solo':s>7.7?'big':null}
  function bid(option){if(phase!=='bid')return;g.beep?.(460,.085);declarer=0;mode=option;
    if(option==='pass'){
      const b1=botBid(1),b2=botBid(2);
      if(b1||b2){declarer=b1&&b2?(strength(hands[1])>strength(hands[2])?1:2):b1?1:2;mode=declarer===1?b1:b2}
      else {mode='table';declarer=-1}
    }
    if(mode==='big'){
      hands[declarer].push(...talon);talon=[];sortHand(hands[declarer]);
      if(declarer===0){phase='bury';info=t('buryTwo');render();return}
      // CPU buries cards unlikely to win tricks, prioritising high-point discards.
      let choices=[...hands[declarer]].sort((a,b)=>{const score=c=>(suit(c)!=='T'?10:0)+ (c.r==='10'?6:c.r==='K'?4:0)-power(c)*.09;return score(b)-score(a)});
      discards=choices.slice(0,2);hands[declarer]=sortHand(hands[declarer].filter(c=>!discards.includes(c)))
    }
    phase='play';turn=leader;info=mode==='table'?t('tableBid'):declarer===0?t('youDeclarer'):t('defendAgainst');render();
  }
  function bury(){if(phase!=='bury'||selected.length!==2)return;g.beep?.(490,.085);discards=selected.map(i=>hands[0][i]);hands[0]=sortHand(hands[0].filter((_,i)=>!selected.includes(i)));selected=[];phase='play';turn=leader;info=t('youDeclarer');render()}
  function valid(hand,lead){if(!lead)return [...hand];const s=suit(lead);const follow=hand.filter(c=>suit(c)===s);return follow.length?follow:[...hand]}
  function winner(cards){const led=suit(cards[0].card);let best=cards[0];for(const c of cards.slice(1)){
    if(suit(c.card)==='T'&&suit(best.card)!=='T'||(suit(c.card)===suit(best.card)&&power(c.card)>power(best.card)))best=c;
    else if(suit(best.card)!=='T'&&suit(c.card)===led&&suit(best.card)!==led)best=c;
  }return best.p}
  function chooseAI(p){const hand=hands[p],opts=valid(hand,table[0]?.card),isBig=p===declarer,isTeam=declarer!==-1&&(p!==declarer);
    if(!table.length){return [...opts].sort((a,b)=>{
      const f=c=>{const v=PIPS[c.r],tr=suit(c)==='T';return (tr?(isBig?power(c)*.25:power(c)*.16):0)+ (v>4?(isBig?2:-2):0) +(isBig&&tr&&power(c)>95?12:0)};
      return f(b)-f(a)
    })[0]}
    const trickWinner=winner(table),partnerWinning=isTeam&&trickWinner!==declarer,opponentWinning=isBig?trickWinner!==p:trickWinner===declarer;
    const winOpts=opts.filter(c=>winner([...table,{p,card:c}])===p);
    if(partnerWinning){ // give useful eyes to an already winning teammate, unless declarer can overtrump later
      return [...opts].sort((a,b)=>(PIPS[b.r]*1.6-power(b)*.03)-(PIPS[a.r]*1.6-power(a)*.03))[0]
    }
    if(winOpts.length){const cards=[...winOpts].sort((a,b)=>power(a)-power(b));if(opponentWinning||isBig||mode==='table')return cards[0]}
    return [...opts].sort((a,b)=>PIPS[a.r]-PIPS[b.r]||power(a)-power(b))[0]
  }
  function play(p,cardId){if(phase!=='play'||turn!==p)return;
    const idx=hands[p].findIndex(c=>c.id===cardId);if(idx<0)return;
    const available=valid(hands[p],table[0]?.card);if(!available.some(c=>c.id===cardId)){info=t('followSuit');render();return}
    const card=hands[p].splice(idx,1)[0];table.push({p,card});g.beep?.(p===0?580:340,.065);
    if(table.length===3){shownTrick=[...table];const win=winner(table),pts=table.reduce((n,o)=>n+PIPS[o.card.r],0);taken[win].pts+=pts;taken[win].tricks++;
      leader=win;turn=win;phase='trick';cpuDelay=.85;info=`${t('trickTo')} ${name(win)} · ${pts} ${t('cardPoints')}`;
    }else {turn=(p+1)%3;info=turn===0?t('yourTurn'):t('computerTurn');cpuDelay=.6}
    render()
  }
  function name(i){return i===0?t('you'):i===1?'CPU 1':'CPU 2'}
  function tally(){let tallyPoints=[...taken.map(o=>o.pts)];if(mode==='big')tallyPoints[declarer]+=discards.reduce((n,c)=>n+PIPS[c.r],0);
    else if(mode==='solo')tallyPoints[(declarer+1)%3]+=talon.reduce((n,c)=>n+PIPS[c.r],0);
    if(mode==='table'){let loser=[0,1,2].sort((a,b)=>taken[b].tricks-taken[a].tricks||tallyPoints[b]-tallyPoints[a])[0];match[loser]-=4;for(let i=0;i<3;i++)if(i!==loser)match[i]+=2;
      lastResult=`${name(loser)} · ${t('tableLoss')}`;
    }else{const pts=mode==='big'?tallyPoints[declarer]:taken[declarer].pts;const tr=taken[declarer].tricks;let stake;
      if(tr===8)stake=mode==='big'?3:7;else if(tr===0)stake=mode==='big'?-4:-8;else if(pts>=91)stake=mode==='big'?2:6;else if(pts>=61)stake=mode==='big'?1:5;else if(pts<=30)stake=mode==='big'?-3:-7;else stake=mode==='big'?-2:-6;
      match[declarer]+=stake*2;for(let i=0;i<3;i++)if(i!==declarer)match[i]-=stake;
      lastResult=`${name(declarer)} · ${pts}/120 ${t('cardPoints')} · ${stake>0?'+':''}${stake*2} ${t('score')}`;
    }
    points(Math.max(0,match[0]));g.beep?.(match[0]>=0?760:200,.18);phase='result';g.over=true;info=t('finished');render()
  }
  function cardHTML(c,index,enabled,selectedCard){const red=c.s==='♥'||c.s==='♦';return `<button type="button" class="z-card ${red?'red':''} ${selectedCard?'selected':''}" data-index="${index}" ${enabled?'':'disabled'} aria-label="${c.r} ${c.s}"><small>${c.r}</small><strong>${c.s}</strong><small>${c.r}</small></button>`}
  function btnHTML(action,key,disabled=false){return `<button type="button" class="z-button" data-action="${action}" ${disabled?'disabled':''}>${t(key)}</button>`}
  function render(){if(!root.isConnected)return;const validIds=phase==='play'&&turn===0?new Set(valid(hands[0],table[0]?.card).map(c=>c.id)):new Set();
    const views=[1,2].map(i=>`<div class="z-opponent"><div class="z-op-name">${name(i)} <span>${hands[i].length} ${t('cardsWord')}</span></div><div class="z-backs">${hands[i].map(()=>'<i>✦</i>').join('')}</div></div>`).join('');
    const cards=table.map(x=>`<div class="z-played"><span>${name(x.p)}</span><div class="z-card face ${(x.card.s==='♥'||x.card.s==='♦')?'red':''}"><small>${x.card.r}</small><strong>${x.card.s}</strong></div></div>`).join('');
    const handsHTML=hands[0].map((c,i)=>cardHTML(c,i,phase==='bury'||validIds.has(c.id),selected.includes(i))).join('');
    page.innerHTML=`<div class="z-top"><div>${t('round')} ${round} · ${t('you')}: <b>${match[0]}</b> · CPU 1: ${match[1]} · CPU 2: ${match[2]}</div><span>${mode==='table'?t('tableBid'):mode==='solo'?t('playSolo'):mode==='big'&&phase!=='bid'?t('playBig'):t('chooseBid')}</span></div>
      <div class="z-opponents">${views}</div>
      <div class="z-felt"><div class="z-felt-label">${t('trumps')}: Q → J → ♦</div><div class="z-trick">${cards||'<div class="z-empty">♣ ♥ ♠ ♦</div>'}</div></div>
      <div class="z-msg" role="status">${info}</div>
      <div class="z-hand-label">${t('yourHand')} · ${hands[0].length} ${t('cardsWord')}</div>
      <div class="z-hand">${handsHTML}</div>`;
    let opts='';if(phase==='bid')opts=btnHTML('big','playBig')+btnHTML('solo','playSolo')+btnHTML('pass','pass');
    else if(phase==='bury')opts=btnHTML('bury','confirmBury',selected.length!==2)+`<span>${selected.length}/2</span>`;
    else if(phase==='result')opts=`<strong class="z-result">${lastResult}</strong>`+btnHTML('again','nextDeal');
    else if(phase==='play')opts=`<span class="z-hint">${turn===0?t('yourTurn'):t('computerTurn')}</span>`;
    bar.innerHTML=opts
  }
  function selectCard(i){if(phase==='bury'){const p=selected.indexOf(i);if(p>=0)selected.splice(p,1);else if(selected.length<2)selected.push(i);render()}
    else if(phase==='play'&&turn===0)play(0,hands[0][i]?.id)}
  page.addEventListener('click',ev=>{const b=ev.target.closest('.z-card[data-index]');if(b&&!b.disabled)selectCard(Number(b.dataset.index))});
  bar.addEventListener('click',ev=>{const b=ev.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;
    if(a==='big'||a==='solo'||a==='pass')bid(a);else if(a==='bury')bury();else if(a==='again')startDeal()});
  g.update=dt=>{if(phase==='play'&&turn!==0){cpuDelay-=dt;if(cpuDelay<=0){const c=chooseAI(turn);if(c)play(turn,c.id)}}
    else if(phase==='trick'){cpuDelay-=dt;if(cpuDelay<=0){table=[];shownTrick=null;if(hands.every(x=>x.length===0))tally();else{phase='play';info=turn===0?t('yourTurn'):t('computerTurn');cpuDelay=.65;render()}}}}
  g.localize=render;g.cleanup=()=>{canvas.hidden=false;root.hidden=true;page.replaceChildren();bar.replaceChildren()};
  g.draw=()=>{};startDeal();return g;
};
