/* Original four-lane egg-catching arcade. Eggs visibly fall into the correctly
 * aligned basket; missed eggs fall and break. Progressive 12-level speed. */
window.G63Wolf = function({g,ctx:c,btn,points,show,t}) {
  const W=800,H=540;
  const lanes=[
    {sx:172,sy:160,ex:325,ey:227,side:-1,upper:true},
    {sx:628,sy:160,ex:475,ey:227,side:1,upper:true},
    {sx:172,sy:337,ex:336,ey:362,side:-1,upper:false},
    {sx:628,sy:337,ex:464,ey:362,side:1,upper:false}
  ];
  let position=0,mode='A',running=true,misses=0,eggs=[],splats=[],caught=[],spawnLeft=.6,elapsed=0,level=1,score=0;
  let basket={x:349,y:227},wiggle=0,celebrate=0;
  const sounds=(hz,d=.07)=>g.beep?.(hz,d);
  const buttons=[];
  function sync(){buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i<4?position===i:i===4?mode==='A':i===5?mode==='B':!running)));}
  function add(label,fn){const b=btn(label,()=>{fn();sync()});buttons.push(b)}
  function choose(i){if(g.over||!running)return;position=Math.max(0,Math.min(3,i));sounds(340,.028)}
  function newMode(m){mode=m;start()}
  function start(){position=0;running=true;misses=0;eggs=[];splats=[];caught=[];spawnLeft=.9;elapsed=0;level=mode==='A'?1:3;score=0;celebrate=0;g.over=false;g.score=0;basket={x:lanes[0].ex,y:lanes[0].ey};show('');sync()}
  add('1 ↖',()=>choose(0));add('2 ↗',()=>choose(1));add('3 ↙',()=>choose(2));add('4 ↘',()=>choose(3));
  add('A',()=>newMode('A'));add('B',()=>newMode('B'));
  add('⏯',()=>{if(g.over){start();return}running=!running;show(running?'':t('paused'))});
  g.key=k=>{const v={'1':0,'2':1,'3':2,'4':3,w:0,e:1,s:2,d:3};
    if(k in v)choose(v[k]);else if(k==='ArrowUp')choose(position>=2?position-2:position);
    else if(k==='ArrowDown')choose(position<2?position+2:position);
    else if(k==='ArrowLeft')choose(position%2?position-1:position);
    else if(k==='ArrowRight')choose(position%2===0?position+1:position);
    else if(k===' '||k==='p'||k==='P'){if(g.over)start();else{running=!running;show(running?'':t('paused'))}}
    sync();
  };
  g.tap=(x,y)=>{if(g.over){start();return}if(x>100&&x<700&&y>135&&y<430)choose((y>280?2:0)+(x>400?1:0));sync()};
  g.localize=()=>{buttons[4].title=t('gameA');buttons[5].title=t('gameB');buttons[6].title=t('pause');if(!running&&!g.over)show(t('paused'))};
  function interval(){return Math.max(.165,.62*Math.pow(.89,level-1))}
  function period(){return Math.max(.31,1.6*Math.pow(.88,level-1))}
  function endEgg(e){if(position===e.lane){caught.push({x:lanes[e.lane].ex,y:lanes[e.lane].ey-4,age:0});score++;g.score=score;points(score);celebrate=.35;
      sounds(620+score%4*45,.07);const newLevel=(mode==='B'?3:1)+Math.floor(score/12);
      if(newLevel>level){level=Math.min(12,newLevel);celebrate=1;sounds(880,.15)}
    }else{misses++;splats.push({x:lanes[e.lane].ex,y:lanes[e.lane].ey-4,age:0});sounds(125,.15);
      if(misses>=4){g.over=true;running=false;show(t('gameOver')+' · '+t('score')+': '+score)}
    }}
  g.update=dt=>{wiggle+=dt;const target=lanes[position];const ease=Math.min(1,dt*17);
    basket.x+=(target.ex-basket.x)*ease;basket.y+=(target.ey-basket.y)*ease;celebrate=Math.max(0,celebrate-dt);
    splats.forEach(a=>a.age+=dt);splats=splats.filter(a=>a.age<.85);
    caught.forEach(a=>a.age+=dt);caught=caught.filter(a=>a.age<.26);
    if(!running||g.over)return;
    elapsed+=dt;spawnLeft-=dt;
    if(spawnLeft<=0){const available=[0,1,2,3].filter(i=>!eggs.some(e=>e.lane===i&&e.step<3));
      if(available.length){eggs.push({lane:available[Math.floor(Math.random()*available.length)],step:0,clock:0});spawnLeft=period()*(.79+Math.random()*.34)}else spawnLeft=.12;
    }
    const tick=interval();for(const e of eggs){e.clock+=dt;while(e.clock>=tick&&!e.done){e.clock-=tick;e.step++;
       if(e.step>=6){e.done=true;endEgg(e)}}}
    eggs=eggs.filter(e=>!e.done)
  };
  function fill(v){c.fillStyle=v}
  function stroke(v,w=2){c.strokeStyle=v;c.lineWidth=w;c.lineCap='round';c.lineJoin='round'}
  function path(points,color,width=3){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);stroke(color,width);c.stroke()}
  function oval(x,y,rx,ry,color,rotate=0){c.beginPath();c.ellipse(x,y,rx,ry,rotate,0,Math.PI*2);fill(color);c.fill()}
  function txt(str,x,y,size=20,color='#28453d',family='system-ui',weight=800){fill(color);c.textAlign='center';c.font=`${weight} ${size}px ${family}`;c.fillText(str,x,y)}
  function chicken(x,y,mirror){c.save();c.translate(x,y);c.scale(mirror?-1:1,1);
    oval(-7,1,24,17,'#385d4d');oval(6,-15,15,17,'#365746');
    fill('#385d4d');c.beginPath();c.moveTo(-26,1);c.lineTo(-40,-21);c.lineTo(-23,-10);c.lineTo(-37,-27);c.lineTo(-12,-10);c.closePath();c.fill();
    oval(-9,-3,13,7,'#6a8973',-.45);oval(3,-31,5,5,'#af594d');oval(12,-28,5,6,'#af594d');
    fill('#e2aa66');c.beginPath();c.moveTo(18,-16);c.lineTo(33,-10);c.lineTo(17,-6);c.fill();
    oval(10,-18,5,6,'#f9f3dd');oval(11,-18,2.5,3,'#1e3030');
    path([[-14,16],[-17,24]],'#3d6253',3);path([[0,17],[4,24]],'#3d6253',3);c.restore()}
  function egg(x,y,rot=0){c.save();c.translate(x,y);c.rotate(rot);c.shadowColor='#233c3470';c.shadowBlur=4;
    oval(0,0,8.8,12,'#e8ebd7',-.12);c.shadowBlur=0;oval(-2,-3,3,5,'#ffffff66',-.1);c.restore()}
  function drawWolf(){const x=400,y=305,arm=basket;
    c.save();c.translate(x,y);
    // wolf boots and tail
    path([[-12,75],[-37,105],[-13,105],[4,78]],'#334f42',19);path([[15,76],[37,106],[60,106],[25,75]],'#334f42',15);
    fill('#344d40');c.beginPath();c.moveTo(-23,44);c.quadraticCurveTo(-66,73,-83,42);c.quadraticCurveTo(-62,67,-41,21);c.fill();
    oval(0,34,36,60,'#375a4a');oval(6,43,23,41,'#b0c7ad');
    // oversized pointed ears and dark tuft, entirely original silhouettes
    fill('#344f42');c.beginPath();c.moveTo(-36,-41);c.lineTo(-45,-122);c.lineTo(-14,-93);c.lineTo(13,-117);c.lineTo(31,-53);c.quadraticCurveTo(43,-15,17,-5);c.lineTo(-28,-8);c.closePath();c.fill();
    fill('#9cb59f');c.beginPath();c.moveTo(-33,-92);c.lineTo(-38,-109);c.lineTo(-20,-91);c.fill();c.beginPath();c.moveTo(14,-89);c.lineTo(15,-103);c.lineTo(24,-75);c.fill();
    oval(13,-34,36,18,'#acc5ac');oval(39,-36,9,6,'#263a35');
    for(const eye of [-9,12]){oval(eye,-64,6,10,'#f1f4dd');oval(eye+1,-63,2.4,4,'#223d36')}
    path([[9,-14],[26,-11]],'#233b31',3);
    // scarf and contrasting neck for a more complete character
    path([[-26,-5],[4,0],[28,-9]],'#c15346',8);
    c.restore();
    const shoulderX=400+(position%2?16:-16),shoulderY=296;
    const handX=basket.x,handY=basket.y+8;
    path([[shoulderX,shoulderY],[shoulderX+(handX-shoulderX)*.47,handY+25],[handX,handY]],'#365747',15);
    oval(handX,handY,12,10,'#a6c2a7');
    // basket exactly reaches the end of the active egg lane
    c.save();c.translate(basket.x,basket.y+10);c.shadowColor='#264e3c66';c.shadowBlur=6;
    fill('#ae7047');c.beginPath();c.moveTo(-24,-2);c.lineTo(24,-2);c.lineTo(18,26);c.quadraticCurveTo(0,31,-18,26);c.closePath();c.fill();
    c.shadowBlur=0;stroke('#dfb780',6);c.beginPath();c.moveTo(-27,-2);c.lineTo(27,-2);c.stroke();
    for(let xx=-12;xx<=12;xx+=12)path([[xx,5],[xx,23]],'#d49c62',3);
    path([[-15,11],[15,11]],'#935731',2);c.restore();
  }
  function draw(){c.clearRect(0,0,W,H);
    const edge=c.createLinearGradient(0,0,W,H);edge.addColorStop(0,'#e9e6d7');edge.addColorStop(.48,'#f7f3e5');edge.addColorStop(1,'#c2c0af');fill(edge);c.fillRect(0,0,W,H);
    fill('#e06460');c.fillRect(0,0,800,19);c.fillRect(0,518,800,22);
    c.shadowColor='#00000044';c.shadowBlur=12;fill('#435a51');c.beginPath();c.roundRect(42,51,716,433,9);c.fill();c.shadowBlur=0;
    const lcd=c.createLinearGradient(0,71,0,465);lcd.addColorStop(0,'#c0d4c5');lcd.addColorStop(.65,'#afc9b7');lcd.addColorStop(1,'#9ebda8');fill(lcd);c.fillRect(53,62,694,409);
    for(let y=64;y<470;y+=4){fill('#ffffff08');c.fillRect(54,y,691,1)}
    stroke('#50675c',3);c.strokeRect(66,75,668,378);
    fill('#5b7a64');c.fillRect(84,435,632,7);
    txt('63',108,108,26,'#405e51','system-ui',950);txt('EGG CATCH',400,34,17,'#a04c4b');
    txt(String(score).padStart(4,'0'),401,119,49,'#334f40','monospace',850);
    txt(t('game'+mode),405,139,11,'#546f60','monospace');
    txt('LV '+level,246,116,16,'#466b5c','monospace');
    fill('#66857555');c.fillRect(198,122,98,6);fill('#547b63');c.fillRect(198,122,98*(score%12)/12,6);
    for(let i=0;i<4;i++){fill(i<misses?'#a04c4b':'#6b8a75');c.beginPath();c.arc(542+i*24,112,7,0,7);c.fill();}
    lanes.forEach((lane,i)=>{
      chicken(lane.sx+(lane.side===1?31:-31),lane.sy-22,lane.side>0);
      path([[lane.sx,lane.sy+20],[lane.ex,lane.ey+5]],'#756c57',8);
      path([[lane.sx,lane.sy+34],[lane.ex,lane.ey+19]],'#86795f',4);
      for(let k=1;k<=5;k++){
        const p=k/6,x=lane.sx+(lane.ex-lane.sx)*p,y=lane.sy+25+(lane.ey-lane.sy)*p;
        oval(x,y,8,6,'#5f806a2a');stroke('#668d7288',1.3);c.beginPath();c.ellipse(x,y,8,6,-.25,0,7);c.stroke();
      }
      if(i===position){oval(lane.ex,lane.ey+11,31,22,'#f4fcd050')}
    });
    for(const e of caught){c.save();c.globalAlpha=Math.max(0,1-e.age/.28);egg(e.x,e.y+e.age*108,.05);c.restore()}
    drawWolf();
    for(const e of eggs){const lane=lanes[e.lane],p=Math.min(.995,(e.step+e.clock/interval())/6);egg(lane.sx+(lane.ex-lane.sx)*p,lane.sy+21+(lane.ey-4-lane.sy-21)*p,p*.2)}
    for(const s of splats){c.save();c.globalAlpha=1-s.age/.85;
      if(s.age<.28)egg(s.x+Math.sin(s.age*12)*9,s.y+s.age*145,s.age*4);
      else{fill('#f3f0d4');oval(s.x,s.y+32,15+s.age*10,5,'#f0eeda');stroke('#e5d8a0',3);c.beginPath();c.arc(s.x,s.y+32,14+s.age*10,0,Math.PI);c.stroke()}
      c.restore()}
    if(celebrate>.3){txt('✦ +1 ✦',400,171,18,'#538167')}
    if(!running||g.over){fill('#e6f1d6dc');c.beginPath();c.roundRect(265,206,270,102,14);c.fill();txt(g.over?t('gameOver'):t('paused'),400,244,30,'#30483c','system-ui');txt(g.over?t('restart'):t('resume'),400,278,15,'#49685a')}
    for(let i=0;i<4;i++){const x=211+i*126;txt(String(i+1),x-16,507,18,'#625e53','monospace');const dx=i%2?1:-1,dy=i<2?-1:1;path([[x+5,505],[x+19*dx,505+11*dy]],'#6e6b60',3);path([[x+19*dx,505+11*dy],[x+19*dx-7*dx,505+11*dy]],'#6e6b60',2);path([[x+19*dx,505+11*dy],[x+19*dx,505+11*dy-7*dy]],'#6e6b60',2)}
  }
  g.draw=draw;start();g.localize();return g;
};
