/* Two player double-six DRAW Dominoes with rule-driven CPU, offline. */
window.G63Domino = function ({g, ctx:c, btn, points, show, t, canvas}) {
  let hand=[],cpu=[],stock=[],chain=[],ends=null,turn=0,tick=0,roundOver=false,matches=[0,0],selected=-1,choice=null,turnsWithoutMove=0,rounds=0;
  function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function pip(tile){return tile[0]+tile[1]}
  function matchesEnd(tile,side){if(!ends)return true;return tile.includes(side==='L'?ends[0]:ends[1])}
  function playable(tile){return matchesEnd(tile,'L')||matchesEnd(tile,'R')}
  function allTiles(){let a=[];for(let i=0;i<7;i++)for(let j=i;j<7;j++)a.push([i,j]);return shuffle(a)}
  function newRound(){let a=allTiles();hand=a.splice(0,7);cpu=a.splice(0,7);stock=a;chain=[];ends=null;roundOver=false;turn=rounds++%2;selected=-1;choice=null;turnsWithoutMove=0;tick=.6;g.over=false;show('');sync();}
  function winner(w){roundOver=true;g.over=true;let p0=hand.reduce((n,x)=>n+pip(x),0),p1=cpu.reduce((n,x)=>n+pip(x),0);
    if(w===null)w=p0===p1?-1:p0<p1?0:1;
    if(w>=0){const pts=w===0?p1:p0;matches[w]+=pts;if(w===0)points(matches[0]);g.beep?.(w===0?860:230,.19);}
    show((w<0?t('draw'):w===0?t('win'):t('lose'))+' · '+matches[0]+' : '+matches[1]);sync();
  }
  function place(player,index,side){if(roundOver||turn!==player)return false;const arr=player===0?hand:cpu,tile=arr[index];if(!tile||!matchesEnd(tile,side))return false;
    arr.splice(index,1);g.beep?.(player===0?570:360,.065);let oriented=[...tile];if(ends){const number=side==='L'?ends[0]:ends[1];if(side==='L'&&oriented[1]!==number)oriented.reverse();if(side==='R'&&oriented[0]!==number)oriented.reverse();if(side==='L')ends[0]=oriented[0];else ends[1]=oriented[1];}else ends=[oriented[0],oriented[1]];
    if(side==='L')chain.unshift(oriented);else chain.push(oriented);selected=-1;choice=null;turnsWithoutMove=0;
    if(!arr.length){winner(player);return true}turn=1-player;tick=.62;sync();return true;
  }
  function drawFromStock(player){const h=player===0?hand:cpu;if(stock.length){h.push(stock.pop());g.beep?.(250,.045);turnsWithoutMove=0;return true}turn=1-player;tick=.5;turnsWithoutMove++;if(turnsWithoutMove>=2)winner(null);return false}
  function actBot(){if(roundOver||turn!==1)return;const options=[];cpu.forEach((tile,i)=>{for(const side of ['L','R'])if(matchesEnd(tile,side)){
    const next=ends?side==='L'?(tile[0]===ends[0]?tile[1]:tile[0]):(tile[0]===ends[1]?tile[1]:tile[0]):tile[0];
    const retain=cpu.filter((_,j)=>j!==i).filter(other=>other.includes(next)).length;
    options.push({i,side,value:pip(tile)*2+retain*4+(tile[0]===tile[1]?2:0)})
  }});
  if(!options.length){drawFromStock(1);tick=.28;sync();return}
  options.sort((a,b)=>b.value-a.value);const chosen=options[0];place(1,chosen.i,chosen.side)
  }
  const buttons=[];function b(label,action){btn(label,action);buttons.push(document.querySelector('#controls .control:last-child'))}
  b('◀ LEFT',()=>{if(selected>=0)place(0,selected,'L')});
  b('RIGHT ▶',()=>{if(selected>=0)place(0,selected,'R')});
  b('＋ DRAW',()=>{if(roundOver||turn!==0||hand.some(playable))return;drawFromStock(0);sync()});
  b('⏭ PASS',()=>{if(roundOver||turn!==0||stock.length||hand.some(playable))return;drawFromStock(0);sync()});
  b('↻ NEXT',()=>{if(roundOver)newRound()});
  g.localize=()=>{buttons[0].title=t('left');buttons[1].title=t('right');buttons[2].title=t('drawTile');buttons[3].title=t('pass');buttons[4].title=t('nextDeal');sync()};
  function sync(){buttons[0].disabled=buttons[1].disabled=selected<0||turn!==0||roundOver;buttons[2].disabled=roundOver||turn!==0||hand.some(playable)||!stock.length;buttons[3].disabled=roundOver||turn!==0||hand.some(playable)||!!stock.length;buttons[4].disabled=!roundOver}
  function tap(x,y){if(y<420||y>530||turn!==0||roundOver)return;const step=Math.min(86,715/Math.max(hand.length,1));const width=(hand.length-1)*step+68,start=400-width/2;const index=Math.round((x-start-34)/step);if(index<0||index>=hand.length)return;const tile=hand[index];if(!playable(tile))return;
    const canL=matchesEnd(tile,'L'),canR=matchesEnd(tile,'R');if(canL&&!canR){place(0,index,'L');return}if(canR&&!canL){place(0,index,'R');return}
    if(selected===index){place(0,index,'R');return}selected=index;sync();
  }
  g.tap=tap;g.key=k=>{if('123456789'.includes(k)&&k.length===1)tap(400-(Math.min(86,715/Math.max(hand.length,1))*(hand.length-1)+68)/2+34+(Number(k)-1)*Math.min(86,715/Math.max(hand.length,1)),470);if(k==='ArrowLeft'&&selected>=0)place(0,selected,'L');if(k==='ArrowRight'&&selected>=0)place(0,selected,'R');if(k===' '&&buttons[2]&&!buttons[2].disabled)drawFromStock(0)};
  g.update=dt=>{if(roundOver)return;if(turn===1){tick-=dt;if(tick<=0)actBot()}};
  function rectangle(x,y,w,h,color,r=7){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
  const dots={0:[],1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
  function domino(x,y,w,h,values,select=false,back=false){
    c.save();c.shadowColor='#061417cc';c.shadowBlur=14;c.shadowOffsetY=5;
    rectangle(x+1,y+3,w,h,back?'#2f6176':'#eee4cd',7);
    c.restore();rectangle(x+2,y+2,w-4,h-4,back?'#294960':'#fffdf0',6);
    c.lineWidth=select?4:1.4;c.strokeStyle=select?'#f3d788':back?'#65c1ba':'#cfc5ac';c.beginPath();c.roundRect(x+1,y+1,w-2,h-2,7);c.stroke();
    if(back){
      rectangle(x+7,y+7,w-14,h-14,'#23465a',5);
      c.strokeStyle='#78b9b9';c.lineWidth=1.8;
      c.beginPath();c.moveTo(x+w/2,y+12);c.lineTo(x+w-12,y+h/2);c.lineTo(x+w/2,y+h-12);c.lineTo(x+12,y+h/2);c.closePath();c.stroke();
      c.fillStyle='#d3e5d0';c.textAlign='center';c.font='bold 15px system-ui';c.fillText('63',x+w/2,y+h/2+5);return;
    }
    const vertical=h>w,half=vertical?h/2:w/2;
    c.strokeStyle='#cec4af';c.lineWidth=2;c.beginPath();
    if(vertical){c.moveTo(x+8,y+half);c.lineTo(x+w-8,y+half)}else{c.moveTo(x+half,y+7);c.lineTo(x+half,y+h-7)}c.stroke();
    for(let i=0;i<2;i++){
      const v=values[i],cx=vertical?x+w/2:x+(i+.5)*half,cy=vertical?y+(i+.5)*half:y+h/2;
      const radius=vertical?3.7:2.7;
      for(const [dx,dy] of dots[v]){
        const px=cx+dx*(vertical?w*.17:half*.19),py=cy+dy*(vertical?half*.19:h*.24);
        c.beginPath();c.arc(px,py,radius,0,7);c.fillStyle='#20445a';c.fill();
        c.beginPath();c.arc(px-1,py-1,radius*.38,0,7);c.fillStyle='#7aa5b0';c.fill();
      }
    }
  }
  function draw(){
    const base=c.createLinearGradient(0,0,800,540);base.addColorStop(0,'#172a41');base.addColorStop(.55,'#15545a');base.addColorStop(1,'#11293e');c.fillStyle=base;c.fillRect(0,0,800,540);
    // walnut rim around the softly lit emerald-green felt
    rectangle(9,9,782,521,'#354e54',23);rectangle(18,18,764,502,'#0b3b43',19);
    const felt=c.createRadialGradient(400,255,15,400,255,520);felt.addColorStop(0,'#277568');felt.addColorStop(1,'#0e4148');c.fillStyle=felt;c.beginPath();c.roundRect(24,24,752,490,16);c.fill();
    c.strokeStyle='#ffffff13';c.lineWidth=1.5;c.beginPath();c.roundRect(30,30,740,478,14);c.stroke();
    // top: titles, match totals and computer's remaining covered tiles
    c.fillStyle='#f4eacb';c.textAlign='left';c.font='900 24px system-ui';c.fillText('✦ DOMINO 63',45,59);
    c.fillStyle='#b7dacd';c.font='600 12px system-ui';c.fillText(t('computer')+' · '+cpu.length+' '+t('cardsWord'),46,82);
    const small=Math.min(30,355/Math.max(cpu.length,1));
    for(let i=0;i<cpu.length;i++)domino(44+i*small,92,26,38,null,false,true);
    rectangle(559,43,188,68,'#102f44df',12);
    c.fillStyle='#d0e0d7';c.textAlign='center';c.font='700 12px system-ui';c.fillText(t('score'),653,64);
    c.fillStyle='#fef5df';c.font='900 24px system-ui';c.fillText(matches[0]+'  :  '+matches[1],653,91);
    c.fillStyle=turn===0?'#9ef5dc':'#fae7b2';c.font='700 15px system-ui';
    c.fillText(roundOver?t('finished'):turn===0?t('yourTurn'):t('computerTurn'),400,133);
    // timeline connects tiles along left-to-right rows with alternating direction.
    const per=9,rowHeight=60;
    if(chain.length){
      for(let i=0;i<chain.length;i++){
        const row=Math.floor(i/per),col=i%per,n=Math.min(per,chain.length-row*per);
        const displayCol=row%2? n-col-1:col;
        const x=400-(n*74-8)/2+displayCol*74;
        const y=155+row*rowHeight;
        domino(x,y,66,40,chain[i]);
      }
      rectangle(34,286,105,48,'#103b43bd',10);rectangle(661,286,105,48,'#103b43bd',10);
      c.fillStyle='#b4e5d9';c.font='700 11px system-ui';c.textAlign='center';
      c.fillText(t('left'),87,301);c.fillText(t('right'),715,301);
      c.fillStyle='#fff6d6';c.font='900 23px system-ui';c.fillText(String(ends[0]),87,326);c.fillText(String(ends[1]),715,326);
    }else{
      c.fillStyle='#a6e3d5';c.textAlign='center';c.font='800 24px system-ui';c.fillText('✦ '+t('yourTurn')+' ✦',400,250);
      c.fillStyle='#b3d3cb';c.font='14px system-ui';c.fillText('6 · 6',400,284);
    }
    // bottom tray: selected ivory dominoes, highlighted legal moves.
    rectangle(26,397,748,128,'#10283acb',14);
    c.fillStyle='#b5cec9';c.textAlign='left';c.font='700 13px system-ui';
    c.fillText(t('yourHand')+'  ·  '+hand.length+'  ·  '+t('stock')+': '+stock.length,43,419);
    const step=Math.min(84,704/Math.max(hand.length,1)),width=(hand.length-1)*step+68,start=400-width/2;
    hand.forEach((tile,i)=>{
      const good=playable(tile)&&turn===0&&!roundOver,x=start+i*step;
      domino(x,435+(selected===i?-11:0),68,80,tile,selected===i);
      if(good){rectangle(x+8,430,52,3,'#a5f5d4',2)}
    });
    if(selected>=0){rectangle(292,361,216,31,'#103543ec',10);c.fillStyle='#fff4cf';c.font='bold 13px system-ui';c.textAlign='center';c.fillText(t('chooseSide')+'  ◀ ▶',400,381)}
  }
  g.draw=draw;newRound();g.localize();return g;
};
