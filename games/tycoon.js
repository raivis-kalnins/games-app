/* City Tycoon - original compact property-and-rent board game. Offline, no ads,
   no cash purchases; a simpler design inspired by classic property games. */
import {canvasStage,loop,hud,status,controls,overlay,roundRect,text} from './shared.js';
export const SPACES=[
 {name:'GO',type:'start'},
 {name:'Rīga',type:'city',price:105,group:0},
 {name:'Tallinn',type:'city',price:115,group:0},
 {name:'Helsinki',type:'city',price:125,group:1},
 {name:'Stockholm',type:'city',price:140,group:1},
 {name:'CHANCE',type:'chance'},
 {name:'Oslo',type:'city',price:150,group:2},
 {name:'Copenhagen',type:'city',price:165,group:2},
 {name:'Hamburg',type:'city',price:185,group:3},
 {name:'Amsterdam',type:'city',price:190,group:3},
 {name:'TAX',type:'tax'},
 {name:'London',type:'city',price:210,group:4},
 {name:'Paris',type:'city',price:225,group:4},
 {name:'Prague',type:'city',price:245,group:5},
 {name:'Vienna',type:'city',price:260,group:5},
 {name:'CHANCE',type:'chance'},
 {name:'Rome',type:'city',price:275,group:6},
 {name:'Madrid',type:'city',price:290,group:6},
 {name:'Lisbon',type:'city',price:310,group:7},
 {name:'Zurich',type:'city',price:325,group:7}
];
export function cellIndex(i){if(i<=5)return[5, i];if(i<=10)return[10-i,5];if(i<=15)return[0,15-i];return[i-15,0]}
export function rent(space,level=0){return Math.round(space.price*.13*(1+level*1.25))}
export function mountGame(root,api){root.replaceChildren();const ac=new AbortController(),signal=ac.signal;
 const {wrapper,canvas,ctx}=canvasStage(root,730,730,'stage-square tycoon-stage');
 const info=hud(root,'<span>🟢 £<b data-money0>1200</b></span><span data-turn>🎲</span><span>🟣 £<b data-money1>1200</b></span>');
 const log=status(root,'');log.setAttribute('aria-live','polite');
 const st={players:[],owner:[],houses:[],turn:0,phase:'roll',offer:-1,die:[1,1],round:0,time:0,gameOver:false,message:''};
 const [buyBtn,passBtn,upgradeBtn]=[0,1,2].map(i=>document.createElement('button'));
 const bar=controls(root,[{label:api.locale('🎲 Roll dice','🎲 Mest kauliņus'),name:api.locale('Roll','Mest'),press:roll,primary:true}],signal);
 const rollBtn=bar.querySelector('button');bar.append(buyBtn,passBtn,upgradeBtn);[buyBtn,passBtn,upgradeBtn].forEach(b=>{b.className='ctrl-btn';b.type='button'});
 buyBtn.textContent=api.locale('Buy property','Pirkt īpašumu');passBtn.textContent=api.locale('Pass','Izlaist');upgradeBtn.textContent=api.locale('Upgrade','Uzlabot');
 buyBtn.addEventListener('click',()=>resolveOffer(true),{signal});passBtn.addEventListener('click',()=>resolveOffer(false),{signal});upgradeBtn.addEventListener('click',upgrade,{signal});
 function tell(en,lv){log.textContent=api.locale(en,lv)}
 function refresh(){info.querySelector('[data-money0]').textContent=st.players[0]?.money||0;info.querySelector('[data-money1]').textContent=st.players[1]?.money||0;info.querySelector('[data-turn]').textContent=`🎲 ${st.turn===0?api.locale('Your turn','Tavs gājiens'):api.locale('Computer','Dators')} · ${st.die[0]}+${st.die[1]}`;
   rollBtn.disabled=st.turn!==0||st.phase!=='roll'||st.gameOver;buyBtn.hidden=st.phase!=='offer'||st.turn!==0;passBtn.hidden=buyBtn.hidden;
   upgradeBtn.hidden=st.phase!=='own'||st.turn!==0;upgradeBtn.disabled=st.offer<0||st.players[0].money<Math.round(SPACES[st.offer].price*.6)||st.houses[st.offer]>=3;
 }
 function reset(){st.players=[{pos:0,money:1200},{pos:0,money:1200}];st.owner=Array(20).fill(-1);st.houses=Array(20).fill(0);st.turn=0;st.phase='roll';st.offer=-1;st.die=[1,1];st.round=0;st.time=0;st.gameOver=false;st.message='';wrapper.querySelector('.overlay-center')?.remove();tell('Roll the dice to buy cities and collect rent.','Met kauliņus, pērc pilsētas un saņem īres naudu.');refresh()}
 function winner(w,why){st.gameOver=true;st.phase='end';refresh();api.onScore(w===0?Math.max(1,st.players[0].money):0);overlay(wrapper,w===0?api.locale('You win!','Tu uzvarēji!'):api.locale('Computer wins!','Dators uzvarēja!'),why,reset,api.locale)}
 function passTurn(){if(st.gameOver)return;st.turn=1-st.turn;st.phase='roll';st.offer=-1;st.time=st.turn===1?.9:0;refresh()}
 function resolveOffer(yes){if(st.phase!=='offer')return;const p=st.players[st.turn],i=st.offer,s=SPACES[i];if(yes&&p.money>=s.price){p.money-=s.price;st.owner[i]=st.turn;api.beep(620,.1);tell(`${s.name} purchased for £${s.price}.`,`${s.name} nopirkta par £${s.price}.`)}else tell('Property not purchased.','Īpašums netika nopirkts.');passTurn()}
 function upgrade(){if(st.phase!=='own'||st.turn!==0)return;const i=st.offer,cost=Math.round(SPACES[i].price*.6),p=st.players[0];if(p.money>=cost&&st.houses[i]<3){p.money-=cost;st.houses[i]++;api.beep(720,.12);tell('City upgraded — rent increased.','Pilsēta uzlabota — īres maksa palielināta.')}passTurn()}
 function landed(){const p=st.players[st.turn],i=p.pos,s=SPACES[i],name=s.name;
  st.offer=i;
  if(s.type==='start'){tell('Collect £200 as you pass GO!','Saņem £200, šķērsojot SĀKUMU!');passTurn();return}
  if(s.type==='chance'){const change=[120,-90,150,-60,80][Math.floor(Math.random()*5)];p.money+=change;tell(change>0?`Lucky card! +£${change}`:`Unexpected expense £${-change}`,change>0?`Veiksmes kārts! +£${change}`:`Negaidīti izdevumi £${-change}`);passTurn();return}
  if(s.type==='tax'){p.money-=115;tell('City tax: £115.','Pilsētas nodoklis: £115.');afterPayment();return}
  if(st.owner[i]>=0&&st.owner[i]!==st.turn){const paid=Math.min(p.money,rent(s,st.houses[i]));p.money-=paid;st.players[1-st.turn].money+=paid;tell(`Rent paid in ${name}: £${paid}`,`Īre ${name}: £${paid}`);afterPayment();return}
  if(st.owner[i]===st.turn){st.phase='own';tell(`Your ${name}. Upgrade for £${Math.round(s.price*.6)} or pass.`,`Tava ${name}. Uzlabo par £${Math.round(s.price*.6)} vai izlaid.`);if(st.turn===1){if(p.money>s.price+270&&st.houses[i]<3){p.money-=Math.round(s.price*.6);st.houses[i]++}passTurn()}else refresh();return}
  if(st.turn===1){if(p.money>s.price+170){p.money-=s.price;st.owner[i]=1;tell(`Computer buys ${name}.`,`Dators nopērk ${name}.`)}else tell('Computer passes.','Dators izlaiž.');passTurn();return}
  if(p.money<s.price){tell('Not enough cash to buy this city.','Nepietiek naudas šīs pilsētas iegādei.');passTurn();return}
  st.phase='offer';tell(`${name} costs £${s.price} · rent £${rent(s)}. Buy?`,`${name} maksā £${s.price} · īre £${rent(s)}. Pirkt?`);refresh();
 }
 function afterPayment(){if(st.players[st.turn].money<=0)winner(1-st.turn,api.locale('Opponent has run out of money.','Pretiniekam vairs nav naudas.'));else passTurn()}
 function roll(){if(st.phase!=='roll'||st.gameOver)return;st.die=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];const p=st.players[st.turn],old=p.pos,np=old+st.die[0]+st.die[1];p.pos=np%20;if(np>=20)p.money+=200;api.beep(360,.06);st.round++;
  if(st.round>=70){winner(st.players[0].money>=st.players[1].money?0:1,api.locale('Time limit — wealthiest player wins.','Gājienu limits — uzvar bagātākais.'));return}
  landed();refresh();}
 function step(dt){if(st.turn===1&&st.phase==='roll'&&!st.gameOver){st.time-=dt;if(st.time<=0){st.time=.8;roll()}}}
 canvas.addEventListener('click',e=>{if(st.phase==='roll'&&st.turn===0)return;},{signal});
 function draw(){ctx.clearRect(0,0,730,730);roundRect(ctx,0,0,730,730,25,'#293254');roundRect(ctx,10,10,710,710,21,'#e9e8dd');const cell=113,offset=26;
  const col=['#52bb8b','#b58df0','#58a6ea','#eda765','#e97591','#8ba3f5','#edcb71','#5ecdc4'];
  for(let i=0;i<20;i++){const [r,c]=cellIndex(i),x=offset+c*cell,y=offset+r*cell,s=SPACES[i],owner=st.owner[i];roundRect(ctx,x+2,y+2,cell-4,cell-4,8,owner===0?'#d3f4e5':owner===1?'#f2d9ef':'#fffdfa');
   ctx.strokeStyle='#a7adc2';ctx.lineWidth=1;ctx.strokeRect(x+4,y+4,cell-8,cell-8);
   roundRect(ctx,x+5,y+5,cell-10,13,3,s.type==='city'?col[s.group]:s.type==='start'?'#36b6a4':'#b5bfd4');
   ctx.fillStyle='#253451';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(s.name.length>11?s.name.slice(0,10):s.name,x+cell/2,y+47);
   if(s.type==='city'){ctx.font='bold 13px system-ui';ctx.fillText('£'+s.price,x+cell/2,y+69);ctx.font='bold 11px system-ui';ctx.fillText(owner<0?'':owner===0?'● YOU':'● CPU',x+cell/2,y+86);if(st.houses[i])ctx.fillText('⌂'.repeat(st.houses[i]),x+cell/2,y+102)}
   else text(ctx,s.type==='start'?'↗':s.type==='tax'?'£':'?',x+cell/2,y+86,29,'#5c537c');
   for(let j=0;j<2;j++)if(st.players[j].pos===i){ctx.fillStyle=j===0?'#14a68c':'#9248d8';ctx.shadowColor='#0003';ctx.shadowBlur=5;ctx.beginPath();ctx.arc(x+cell/2+(j?15:-15),y+27,8.5,0,7);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke()}
  }
  const inner=offset+cell,centre=cell*4;const gg=ctx.createLinearGradient(inner,inner,inner+centre,inner+centre);gg.addColorStop(0,'#222e5c');gg.addColorStop(1,'#215e67');roundRect(ctx,inner,inner,centre,centre,15,gg);
  text(ctx,'CITY TYCOON',365,257,40,'#f7f9fb');text(ctx,api.locale('Buy • Build • Collect rent','Pērc • Būvē • Iekasē īri'),365,295,18,'#b8e7df');
  roundRect(ctx,259,339,214,95,18,'#e9faf5');text(ctx,'🎲 '+st.die.join('  +  '),365,397,34,'#23365c');
  text(ctx,st.turn===0?api.locale('YOUR TURN','TAVS GĀJIENS'):api.locale('COMPUTER TURN','DATORA GĀJIENS'),365,470,18,'#f6fff5');
  text(ctx,api.locale('🟢 You  vs  🟣 Computer','🟢 Tu  pret  🟣 Datoru'),365,513,16,'#dcf1ed');
 }
 reset();const stop=loop(step,draw);return()=>{stop();ac.abort()}
}
