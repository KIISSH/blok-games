const Q=new URLSearchParams(location.search),GID=['snake','tetris','blast','g2048','tower','bridge','chain'].includes(Q.get('g'))?Q.get('g'):'snake';
const INFO={snake:['Змейка','Собирайте еду и не врезайтесь в стены и в себя.',['Стрелки или WASD','Свайп на телефоне']],
tetris:['Тетрис','Складывайте фигуры в полные линии.',['← → — движение','↑ — поворот','↓ — ускорить','Пробел — сбросить']],
blast:['Block Blast','Перетащите блок на поле 8×8.',['Тяните блоки мышью или пальцем','Полные строки и столбцы исчезают']],
g2048:['2048','Объединяйте плитки с одинаковыми числами.',['Стрелки или WASD','Свайп на телефоне']],
tower:['Башня','Ставьте блоки точно друг на друга и стройте башню как можно выше.',['Клик, касание или пробел — поставить блок','Точное попадание даёт бонус и комбо','Всё, что выступает, отрезается']],
bridge:['Мост','Зажмите, чтобы мост вырос, и отпустите, чтобы он упал.',['Зажмите мышь, палец или пробел','Мост должен дотянуться до площадки','Красная точка в центре даёт бонус']],
chain:['Цепочка','Одно нажатие запускает взрыв, а он взрывает шарики по цепочке.',['Мышь или касание — запустить взрыв','Поймайте цель уровня','Одна попытка на уровень']]};
const cv=$('#cv'),c=cv.getContext('2d'),COL=['#ff8a1f','#3d6fe0','#19b5a5','#e0453f','#4cd07d','#ffc15a','#b36bff'];
let cur,score=0,over=false,paused=false;
const best=()=>{const u=me();return u?(u.scores[GID]||0):guestBest(GID)};
function setScore(v){score=v;$('#score').textContent=v.toLocaleString('ru')}
function submit(){const k=db.ses(),us=db.get();
  if(k&&us[k]){if(score>(us[k].scores[GID]||0)){us[k].scores[GID]=score;db.set(us)}}
  else if(score>best())try{localStorage.setItem('best_'+GID,score)}catch(e){}
  $('#best').textContent=best().toLocaleString('ru')}
function end(){over=true;submit();$('#ovT').textContent='Игра окончена';$('#ovS').textContent='Очки: '+score.toLocaleString('ru');$('#again').style.display='';$('#ov').style.display='grid'}
function blk(x,y,s,col,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(x+1,y+1,s-2,s-2);c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x+1,y+1,s-2,3);c.fillRect(x+1,y+1,3,s-2);c.globalAlpha=1}
function grid(w,h,s){c.fillStyle='#10131a';c.fillRect(0,0,w*s,h*s);c.fillStyle='#181c26';for(let y=0;y<h;y++)for(let x=0;x<w;x++)c.fillRect(x*s+1,y*s+1,s-2,s-2)}

function snake(){
  const N=20,S=24;cv.width=cv.height=N*S;
  let sn=[{x:10,y:10},{x:9,y:10},{x:8,y:10}],d={x:1,y:0},q=[],f,acc=0,sp=130;
  const put=()=>{const e=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!sn.some(s=>s.x==x&&s.y==y))e.push({x,y});f=e.length?e[Math.random()*e.length|0]:null};put();
  return{
    tick(dt){acc+=dt;if(acc<sp)return;acc=0;if(q.length)d=q.shift();
      const h={x:sn[0].x+d.x,y:sn[0].y+d.y};
      const eat=!!f&&h.x==f.x&&h.y==f.y,body=eat?sn:sn.slice(0,-1);
      if(h.x<0||h.y<0||h.x>=N||h.y>=N||body.some(s=>s.x==h.x&&s.y==h.y))return end();
      sn.unshift(h);if(eat){setScore(score+10);sp=Math.max(65,sp-3);put();if(!f)end()}else sn.pop()},
    key(e){const m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]}[e.key];if(!m)return;
      const l=q.length?q[q.length-1]:d;if(m[0]==-l.x&&m[1]==-l.y)return;if(q.length<2)q.push({x:m[0],y:m[1]})},
    draw(){grid(N,N,S);if(f)blk(f.x*S,f.y*S,S,'#e0453f');sn.forEach((s,i)=>blk(s.x*S,s.y*S,S,i?'#4cd07d':'#e8e6e1'))}};
}

function tetris(){
  const W=10,H=20,S=30;cv.width=W*S;cv.height=H*S;
  const SH={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
  const CC={I:'#19b5a5',O:'#ffc15a',T:'#b36bff',S:'#4cd07d',Z:'#e0453f',J:'#3d6fe0',L:'#ff8a1f'},K=Object.keys(SH);
  let g=Array.from({length:H},()=>Array(W).fill(null)),p,nx,lines=0,acc=0,bag=[];
  const lvl=()=>Math.floor(lines/10)+1;
  const take=()=>{if(!bag.length)bag=[...K].sort(()=>Math.random()-.5);const k=bag.pop();return{k,m:SH[k]}};
  const hit=(m,x,y)=>m.some((r,j)=>r.some((v,i)=>v&&(x+i<0||x+i>=W||y+j>=H||(y+j>=0&&g[y+j][x+i]))));
  const next=()=>{const n=$('#nx').getContext('2d'),s=24,m=nx.m,ox=(120-m[0].length*s)/2,oy=(100-m.length*s)/2;n.clearRect(0,0,120,100);n.fillStyle=CC[nx.k];m.forEach((r,j)=>r.forEach((v,i)=>v&&n.fillRect(ox+i*s+1,oy+j*s+1,s-2,s-2)))};
  const spawn=()=>{p=nx||take();nx=take();p={...p,x:Math.floor((W-p.m[0].length)/2),y:0};next();if(hit(p.m,p.x,p.y))end()};
  const lock=()=>{p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&p.y+j>=0)g[p.y+j][p.x+i]=CC[p.k]}));
    let n=0;g=g.filter(r=>r.some(v=>!v)||(n++,false));while(g.length<H)g.unshift(Array(W).fill(null));
    if(n){const L=lvl();lines+=n;setScore(score+[0,100,300,500,800][n]*L)}
    $('#extra').textContent='Уровень '+lvl()+' · линий '+lines;spawn()};
  const drop=()=>{if(hit(p.m,p.x,p.y+1))lock();else p.y++};
  const rot=()=>{const m=p.m[0].map((_,i)=>p.m.map(r=>r[i]).reverse());for(const d of[0,-1,1,-2,2])if(!hit(m,p.x+d,p.y)){p.m=m;p.x+=d;return}};
  $('#extra').textContent='Уровень 1 · линий 0';spawn();
  return{
    tick(dt){acc+=dt;if(acc>Math.max(80,800-(lvl()-1)*70)){acc=0;drop()}},
    key(e){const k=e.key;
      if(k=='ArrowLeft'||k=='a'){if(!hit(p.m,p.x-1,p.y))p.x--}
      else if(k=='ArrowRight'||k=='d'){if(!hit(p.m,p.x+1,p.y))p.x++}
      else if(k=='ArrowUp'||k=='w'){if(!e.repeat)rot()}
      else if(k=='ArrowDown'||k=='s'){drop();setScore(score+1);acc=0}
      else if(k==' '){if(e.repeat)return;let n=0;while(!hit(p.m,p.x,p.y+1)){p.y++;n++}setScore(score+n*2);lock();acc=0}},
    draw(){grid(W,H,S);g.forEach((r,y)=>r.forEach((v,x)=>v&&blk(x*S,y*S,S,v)));
      let gy=p.y;while(!hit(p.m,p.x,gy+1))gy++;
      p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v){blk((p.x+i)*S,(gy+j)*S,S,CC[p.k],.22);blk((p.x+i)*S,(p.y+j)*S,S,CC[p.k])}}))}};
}

function blast(){
  const N=8,S=52,B=16,TY=B+N*S+20;cv.width=N*S+2*B;cv.height=TY+124;
  const SHP=['1','11','111','1111','11111','1/1','1/1/1','1/1/1/1','1/1/1/1/1','11/11','111/111/111','11/10','11/01','10/11','01/11','111/100','111/001','100/100/111','001/001/111','010/111','111/010','110/011','011/110'].map(s=>s.split('/').map(r=>[...r].map(Number)));
  let g=Array.from({length:N},()=>Array(N).fill(null)),tray=[],dr=null;
  const gen=()=>tray=[0,1,2].map(()=>({m:SHP[Math.random()*SHP.length|0],col:COL[Math.random()*COL.length|0]}));
  const fits=(m,x,y)=>m.every((r,j)=>r.every((v,i)=>!v||(x+i>=0&&y+j>=0&&x+i<N&&y+j<N&&!g[y+j][x+i])));
  const can=m=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(fits(m,x,y))return 1;return 0};
  const cell=()=>{const p=tray[dr.i];return[Math.round((dr.x-p.m[0].length*S/2-B)/S),Math.round((dr.y-p.m.length*S/2-dr.o-B)/S)]};
  const place=(i,gx,gy)=>{const p=tray[i];let n=0;
    p.m.forEach((r,j)=>r.forEach((v,k)=>{if(v){g[gy+j][gx+k]=p.col;n++}}));
    const R=[],Cs=[];for(let y=0;y<N;y++)if(g[y].every(v=>v))R.push(y);for(let x=0;x<N;x++)if(g.every(r=>r[x]))Cs.push(x);
    R.forEach(y=>g[y]=Array(N).fill(null));Cs.forEach(x=>g.forEach(r=>r[x]=null));
    const L=R.length+Cs.length;setScore(score+n+L*L*10);tray[i]=null;if(tray.every(t=>!t))gen();
    if(!tray.some(t=>t&&can(t.m)))end()};
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]};
  cv.onpointerdown=e=>{if(paused||over)return;const[x,y]=pos(e);if(y<TY-10)return;
    const i=Math.min(2,Math.max(0,Math.floor((x-B)/(N*S/3))));
    if(tray[i]){dr={i,x,y,o:e.pointerType=='mouse'?0:70};cv.setPointerCapture(e.pointerId)}};
  cv.onpointermove=e=>{if(dr)[dr.x,dr.y]=pos(e)};
  cv.onpointerup=e=>{if(!dr)return;const[gx,gy]=cell();if(!paused&&!over&&fits(tray[dr.i].m,gx,gy))place(dr.i,gx,gy);dr=null};
  cv.onpointercancel=()=>dr=null;
  gen();
  return{draw(){
    c.clearRect(0,0,cv.width,cv.height);c.fillStyle='#10131a';c.fillRect(B-4,B-4,N*S+8,N*S+8);
    g.forEach((r,y)=>r.forEach((v,x)=>{if(v)blk(B+x*S,B+y*S,S,v);else{c.fillStyle='#181c26';c.fillRect(B+x*S+1,B+y*S+1,S-2,S-2)}}));
    if(dr){const[gx,gy]=cell(),p=tray[dr.i];if(fits(p.m,gx,gy))p.m.forEach((r,j)=>r.forEach((v,i)=>v&&blk(B+(gx+i)*S,B+(gy+j)*S,S,p.col,.35)))}
    tray.forEach((p,i)=>{if(!p||(dr&&dr.i==i))return;const s=26,ox=B+N*S/6*(2*i+1)-p.m[0].length*s/2,oy=TY+60-p.m.length*s/2,a=can(p.m)?1:.35;
      p.m.forEach((r,j)=>r.forEach((v,k)=>v&&blk(ox+k*s,oy+j*s,s,p.col,a)))});
    if(dr){const p=tray[dr.i],ox=dr.x-p.m[0].length*S/2,oy=dr.y-p.m.length*S/2-dr.o;p.m.forEach((r,j)=>r.forEach((v,i)=>v&&blk(ox+i*S,oy+j*S,S,p.col,.92)))}}};
}

function g2048(){
  const N=4,T=100,P=12;cv.width=cv.height=N*T+(N+1)*P;
  const CL=['#1b202a','#3b4254','#4a5a8a','#3d6fe0','#19b5a5','#4cd07d','#ffc15a','#ff8a1f','#e0453f','#ff5c8a','#b36bff','#e8e6e1'];
  let b=Array.from({length:N},()=>Array(N).fill(0)),won=0;
  const add=()=>{const e=[];b.forEach((r,y)=>r.forEach((v,x)=>!v&&e.push([x,y])));if(!e.length)return;const[x,y]=e[Math.random()*e.length|0];b[y][x]=Math.random()<.9?2:4};
  const line=r=>{const a=r.filter(v=>v);let s=0;for(let i=0;i<a.length-1;i++)if(a[i]==a[i+1]){a[i]*=2;s+=a[i];a.splice(i+1,1)}while(a.length<N)a.push(0);return[a,s]};
  const alive=()=>b.some((r,y)=>r.some((v,x)=>!v||(x<N-1&&v==r[x+1])||(y<N-1&&v==b[y+1][x])));
  const mv=d=>{let ch=0,sc=0;
    for(let i=0;i<N;i++){let r=d<2?b[i].slice():b.map(q=>q[i]);if(d%2)r.reverse();let[a,s]=line(r);if(d%2)a.reverse();sc+=s;
      for(let j=0;j<N;j++){const y=d<2?i:j,x=d<2?j:i;if(b[y][x]!=a[j]){ch=1;b[y][x]=a[j]}}}
    if(ch){setScore(score+sc);add();if(!alive())return end();
      if(!won&&b.some(r=>r.includes(2048))){won=1;paused=true;$('#ovT').textContent='Вы собрали 2048!';$('#ovS').textContent='Нажмите P или «Продолжить», чтобы играть дальше';$('#again').style.display='none';$('#ov').style.display='grid';$('#pauseBtn').textContent='Продолжить'}}};
  add();add();
  return{
    key(e){const d={ArrowLeft:0,a:0,ArrowRight:1,d:1,ArrowUp:2,w:2,ArrowDown:3,s:3}[e.key];if(d!==undefined)mv(d)},
    draw(){c.fillStyle='#10131a';c.fillRect(0,0,cv.width,cv.height);c.textAlign='center';c.textBaseline='middle';
      b.forEach((r,y)=>r.forEach((v,x)=>{const i=v?Math.min(11,Math.log2(v)):0,px=P+x*(T+P),py=P+y*(T+P);
        c.fillStyle=CL[i];c.fillRect(px,py,T,T);
        if(v){c.fillStyle=i==6||i==11?'#1a0f00':'#fff';c.font=`700 ${v<100?44:v<1000?38:30}px Oswald`;c.fillText(v,px+T/2,py+T/2+3)}}))}};
}


function tower(){
  const W=360,H=560,BH=26,GY=H-44,W0=190,TOL=8;cv.width=W;cv.height=H;
  const by=k=>GY-(k+1)*BH,st=[{x:(W-W0)/2,w:W0,col:COL[0]}];
  let cu=null,dir=-1,speed=0,combo=0,camY=0,deb=[],fl=[],tx=[],dead=0,lt=performance.now();
  const rb=(x,y,w,h,col,a=1)=>{c.globalAlpha=a;c.fillStyle=col;c.fillRect(x+1,y+1,w-2,h-2);c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x+1,y+1,w-2,3);if(w>8)c.fillRect(x+1,y+1,3,h-2);c.globalAlpha=1};
  const spawn=()=>{const p=st[st.length-1],n=st.length;dir=-dir;speed=Math.min(470,200+n*5);cu={x:dir>0?0:W-p.w,w:p.w,col:COL[n%COL.length]}};
  const drop=()=>{
    if(!cu||dead)return;
    const p=st[st.length-1],y=by(st.length),off=cu.x-p.x;
    if(Math.abs(off)<=TOL){ // точно в цель: блок встаёт ровно, после трёх подряд башня понемногу расширяется
      combo++;let x=p.x,w=p.w;
      if(combo>=3&&w<W0){const d=Math.min(6,W0-w);w+=d;x=Math.max(0,Math.min(W-w,x-d/2))}
      st.push({x,w,col:cu.col});fl.push({x,y,w,t:0});tx.push({s:combo>1?'Идеально ×'+combo:'Идеально!',y,t:0});
      setScore(score+1+Math.min(combo,5));
    }else{
      const L=Math.max(cu.x,p.x),R=Math.min(cu.x+cu.w,p.x+p.w),ov=R-L;
      if(ov<=0){dead=1;combo=0;deb.push({x:cu.x,y,w:cu.w,vy:0,vx:dir*50,col:cu.col});cu=null;$('#extra').textContent='';return}
      combo=0;st.push({x:L,w:ov,col:cu.col});
      deb.push(off>0?{x:R,y,w:cu.x+cu.w-R,vy:0,vx:50,col:cu.col}:{x:cu.x,y,w:L-cu.x,vy:0,vx:-50,col:cu.col});
      setScore(score+1);
    }
    $('#extra').textContent=combo>1?'Комбо ×'+combo:'';spawn();
  };
  cv.onpointerdown=e=>{if(paused||over)return;e.preventDefault();drop()};
  spawn();
  return{
    tick(dt){
      if(dead){dead+=dt;if(dead>900)end();return}
      if(!cu)return;
      cu.x+=dir*speed*dt/1000;
      if(cu.x<=0){cu.x=0;dir=1}else if(cu.x+cu.w>=W){cu.x=W-cu.w;dir=-1}
    },
    key(e){if(e.repeat)return;if([' ','ArrowUp','ArrowDown','Enter','w','s'].includes(e.key))drop()},
    draw(){
      const now=performance.now(),dt=Math.min(.05,(now-lt)/1000);lt=now;
      if(!paused){
        camY+=(Math.max(0,.45*H-GY+st.length*BH)-camY)*Math.min(1,dt*5);
        deb.forEach(d=>{d.vy+=1500*dt;d.y+=d.vy*dt;d.x+=d.vx*dt});deb=deb.filter(d=>d.y+camY<H+40);
        fl.forEach(f=>f.t+=dt);fl=fl.filter(f=>f.t<.45);tx.forEach(t=>t.t+=dt);tx=tx.filter(t=>t.t<.9);
      }
      c.fillStyle='#10131a';c.fillRect(0,0,W,H);
      c.fillStyle='#161a24';for(let y=(GY+camY)%BH-BH;y<H;y+=BH)c.fillRect(0,y,W,1);
      const gy=GY+camY;if(gy<H){c.fillStyle='#0a0d13';c.fillRect(0,gy,W,H-gy);c.fillStyle='#ff8a1f';c.fillRect(0,gy,W,2)}
      c.textBaseline='alphabetic';c.textAlign='center';
      c.fillStyle='rgba(232,230,225,.1)';c.font='700 96px Oswald,Impact,sans-serif';c.fillText(score,W/2,112);
      st.forEach((b,k)=>{const y=by(k)+camY;if(y<H&&y>-BH)rb(b.x,y,b.w,BH,b.col)});
      if(cu)rb(cu.x,by(st.length)+camY,cu.w,BH,cu.col);
      deb.forEach(d=>rb(d.x,d.y+camY,d.w,BH,d.col,.85));
      fl.forEach(f=>{const k=f.t/.45,e=k*10;c.globalAlpha=1-k;c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(f.x-e+1,f.y+camY+1-e,f.w+2*e-2,BH+2*e-2);c.globalAlpha=1});
      tx.forEach(t=>{c.globalAlpha=1-t.t/.9;c.fillStyle='#ffc15a';c.font='700 22px Oswald,Impact,sans-serif';c.fillText(t.s,W/2,t.y+camY-BH-16-t.t*40);c.globalAlpha=1});
      if(st.length==1&&cu&&!paused){c.fillStyle='rgba(232,230,225,.8)';c.font='500 16px Rubik,Arial,sans-serif';c.fillText('Нажмите, чтобы поставить блок',W/2,190)}
    }};
}


function bridge(){
  const W=360,H=560,PY=H-150,PS=22,MAXL=380;cv.width=W;cv.height=H;
  let id=0;const mk=(x,w)=>({x,w,col:COL[id++%COL.length]}),plats=[mk(20,70)];
  let ci=0,camX=0,camT=0,st='idle',L=0,ang=0,sbx=0,px=90-PS,py=0,vy=0,ok=false,tgt=0,dead=0,pc=0,tx=[],lt=performance.now();
  const spawn=()=>{const l=plats[plats.length-1],gap=40+Math.random()*(140+Math.min(score*2,60)),w=Math.max(24,(100-score*1.2)*(.45+Math.random()*.55));plats.push(mk(l.x+l.w+gap,w))};
  const press=()=>{if(st!=='idle')return;const p=plats[ci];sbx=p.x+p.w;st='grow';L=0;ang=0};
  const release=()=>{if(st==='grow')st='fall'};
  const land=()=>{
    const n=plats[ci+1],e=sbx+L;let bonus=0;
    if(Math.abs(e-(n.x+n.w/2))<=5){pc++;bonus=Math.min(10,2*pc);tx.push({s:'Идеально +'+bonus,x:n.x+n.w/2,t:0})}else pc=0;
    setScore(score+1+bonus);$('#extra').textContent=pc>1?'Идеально подряд: '+pc:'';
    ci++;if(ci>2){plats.shift();ci--}spawn();camT=plats[ci].x+plats[ci].w-90;st='scroll';
  };
  spawn();
  cv.onpointerdown=e=>{if(paused||over)return;e.preventDefault();cv.setPointerCapture(e.pointerId);press()};
  cv.onpointerup=cv.onpointercancel=release;
  window.onblur=release;
  const rb=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x+1,y+1,w-2,h-2);c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x+1,y+1,w-2,3);if(w>8)c.fillRect(x+1,y+1,3,h-2)};
  return{
    tick(dt){const s=dt/1000;
      if(st=='grow')L=Math.min(MAXL,L+300*s);
      else if(st=='fall'){ang+=s*Math.PI/2/.4;if(ang>=Math.PI/2){ang=Math.PI/2;
        const n=plats[ci+1],e=sbx+L;ok=e>=n.x&&e<=n.x+n.w;tgt=ok?n.x+n.w-PS:e-PS;st='walk'}}
      else if(st=='walk'){px+=240*s;if(px>=tgt){px=tgt;if(ok)land();else{st='drop';vy=0;pc=0}}}
      else if(st=='drop'){vy+=1500*s;py+=vy*s;dead+=dt;if(dead>900)end()}
      else if(st=='scroll'){camX+=(camT-camX)*Math.min(1,s*7);if(Math.abs(camT-camX)<.5){camX=camT;st='idle';L=0;ang=0}}
    },
    key(e){if(!e.repeat&&[' ','ArrowUp','w'].includes(e.key))press()},
    keyup(e){if([' ','ArrowUp','w'].includes(e.key))release()},
    draw(){
      const now=performance.now(),dt=Math.min(.05,(now-lt)/1000);lt=now;
      if(!paused){tx.forEach(t=>t.t+=dt);tx=tx.filter(t=>t.t<.9)}
      c.fillStyle='#10131a';c.fillRect(0,0,W,H);
      c.fillStyle='#161a24';for(let x=-((camX*.5)%26);x<W;x+=26)c.fillRect(x,0,1,H);
      c.textBaseline='alphabetic';c.textAlign='center';
      c.fillStyle='rgba(232,230,225,.1)';c.font='700 96px Oswald,Impact,sans-serif';c.fillText(score,W/2,112);
      plats.forEach((p,k)=>{const x=p.x-camX;if(x>W||x+p.w<0)return;
        c.fillStyle='#1b202a';c.fillRect(x,PY,p.w,H-PY);rb(x,PY,p.w,14,p.col);
        if(k>ci){c.fillStyle='#e0453f';c.fillRect(x+p.w/2-5,PY,10,4)}});
      if(st!='idle'||L>0){c.save();c.translate(sbx-camX,PY);c.rotate(ang);c.fillStyle='#e8e6e1';c.fillRect(-2,-L,4,L);c.restore()}
      const y0=PY-PS+py,x0=px-camX;c.fillStyle='#ff8a1f';c.fillRect(x0+1,y0+1,PS-2,PS-2);c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x0+1,y0+1,PS-2,3);c.fillStyle='#fff';c.fillRect(x0+PS-10,y0+7,5,5);
      tx.forEach(t=>{c.globalAlpha=1-t.t/.9;c.fillStyle='#ffc15a';c.font='700 22px Oswald,Impact,sans-serif';c.fillText(t.s,t.x-camX,PY-34-t.t*40);c.globalAlpha=1});
      if(score==0&&st=='idle'&&!paused){c.fillStyle='rgba(232,230,225,.8)';c.font='500 16px Rubik,Arial,sans-serif';c.fillText('Зажмите, чтобы вырос мост,',W/2,200);c.fillText('и отпустите, чтобы он упал',W/2,224)}
    }};
}

function chain(){
  const W=360,H=540,BR=9,ER=64;cv.width=W;cv.height=H;
  let lvl=0,balls=[],ex=[],tx=[],ph='aim',need=0,caught=0,tm=0,gp=null,down=false,msg='',lt=performance.now();
  const R=a=>Math.random()*a,rad=e=>{const t=e.t;return t<.35?ER*t/.35:t<1.65?ER:Math.max(0,ER*(2-t)/.35)};
  const level=()=>{lvl++;const M=Math.min(50,14+lvl*3);need=Math.min(M-3,Math.ceil(M*Math.min(.93,.05+.04*lvl)));caught=0;ex=[];tx=[];
    balls=Array.from({length:M},()=>{const a=R(6.283),v=40+R(50)+Math.min(lvl*2,30);return{x:BR+R(W-2*BR),y:BR+R(H-2*BR),vx:Math.cos(a)*v,vy:Math.sin(a)*v,col:COL[R(COL.length)|0]}});
    ph='aim';$('#extra').textContent='Уровень '+lvl+' · цель '+need+' из '+M};
  const fire=(x,y)=>{if(ph!='aim')return;ph='boom';ex.push({x,y,t:0,col:'#ffc15a'})};
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
  cv.onpointermove=e=>{gp=pos(e)};
  cv.onpointerdown=e=>{if(paused||over)return;e.preventDefault();gp=pos(e);down=true;cv.setPointerCapture(e.pointerId)};
  cv.onpointerup=e=>{if(!down)return;down=false;if(paused||over)return;const[x,y]=pos(e);fire(x,y);if(e.pointerType!='mouse')gp=null};
  cv.onpointercancel=()=>{down=false;gp=null};
  cv.onpointerleave=()=>{if(!down)gp=null};
  level();
  return{
    tick(dt){const s=dt/1000;
      balls.forEach(b=>{b.x+=b.vx*s;b.y+=b.vy*s;
        if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)}else if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)}
        if(b.y<BR){b.y=BR;b.vy=Math.abs(b.vy)}else if(b.y>H-BR){b.y=H-BR;b.vy=-Math.abs(b.vy)}});
      if(ph=='boom'){
        ex.forEach(e=>e.t+=s);
        for(let i=balls.length-1;i>=0;i--){const b=balls[i];
          if(ex.some(e=>{const r=rad(e),dx=e.x-b.x,dy=e.y-b.y;return r>0&&dx*dx+dy*dy<(r+BR)*(r+BR)})){
            balls.splice(i,1);caught++;const pts=10+5*(caught-1);setScore(score+pts);
            ex.push({x:b.x,y:b.y,t:0,col:b.col});tx.push({s:'+'+pts,x:b.x,y:b.y,t:0})}}
        ex=ex.filter(e=>e.t<2);
        if(!ex.length){tm=0;if(caught>=need){const bonus=lvl*50;setScore(score+bonus);msg='Уровень пройден! +'+bonus;ph='won'}else{msg='Поймано '+caught+' из '+need;ph='lost'}}
      }else if(ph=='won'){tm+=s;if(tm>1.2)level()}
      else if(ph=='lost'){tm+=s;if(tm>1)end()}
    },
    draw(){
      const now=performance.now(),dt=Math.min(.05,(now-lt)/1000);lt=now;
      if(!paused){tx.forEach(t=>{t.t+=dt;t.y-=24*dt});tx=tx.filter(t=>t.t<.8)}
      c.fillStyle='#10131a';c.fillRect(0,0,W,H);c.fillStyle='#161a24';
      for(let x=0;x<W;x+=30)c.fillRect(x,0,1,H);for(let y=0;y<H;y+=30)c.fillRect(0,y,W,1);
      balls.forEach(b=>{c.fillStyle=b.col;c.beginPath();c.arc(b.x,b.y,BR,0,6.283);c.fill();c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=2;c.stroke()});
      ex.forEach(e=>{const r=rad(e);if(r<=0)return;c.globalAlpha=.3;c.fillStyle=e.col;c.beginPath();c.arc(e.x,e.y,r,0,6.283);c.fill();c.globalAlpha=.9;c.strokeStyle=e.col;c.lineWidth=2;c.stroke();c.globalAlpha=1});
      if(gp&&ph=='aim'&&!paused){c.strokeStyle='rgba(255,193,90,.6)';c.lineWidth=2;c.setLineDash([6,6]);c.beginPath();c.arc(gp[0],gp[1],ER,0,6.283);c.stroke();c.setLineDash([])}
      c.textBaseline='alphabetic';
      tx.forEach(t=>{c.globalAlpha=1-t.t/.8;c.fillStyle='#fff';c.font='700 16px Oswald,Impact,sans-serif';c.textAlign='center';c.fillText(t.s,t.x,t.y-12);c.globalAlpha=1});
      c.font='700 18px Oswald,Impact,sans-serif';c.textAlign='left';c.fillStyle='#8a909c';c.fillText('Уровень '+lvl,12,26);
      c.textAlign='right';c.fillStyle=caught>=need?'#4cd07d':'#e8e6e1';c.fillText('Поймано '+caught+' / '+need,W-12,26);
      c.textAlign='center';
      if(ph=='aim'&&lvl==1&&score==0){c.fillStyle='rgba(232,230,225,.8)';c.font='500 16px Rubik,Arial,sans-serif';c.fillText('Нажмите — и цепляйте шарики!',W/2,H-22)}
      if(ph=='won'||ph=='lost'){c.fillStyle='rgba(8,10,14,.7)';c.fillRect(0,H/2-34,W,64);c.fillStyle=ph=='won'?'#4cd07d':'#ff7a6e';c.font='700 28px Oswald,Impact,sans-serif';c.fillText(msg,W/2,H/2+8)}
    }};
}

const GAMES={snake,tetris,blast,g2048,tower,bridge,chain};
function start(){if(cur&&!over)submit();over=false;paused=false;setScore(0);$('#ov').style.display='none';$('#again').style.display='none';$('#extra').textContent='';$('#pauseBtn').textContent='Пауза';cur=GAMES[GID]();$('#best').textContent=best().toLocaleString('ru')}
function pause(){if(over)return;paused=!paused;$('#ovT').textContent='Пауза';$('#ovS').textContent='Нажмите P или кнопку';$('#again').style.display='none';$('#ov').style.display=paused?'grid':'none';$('#pauseBtn').textContent=paused?'Продолжить':'Пауза'}
$('#gTitle').textContent=INFO[GID][0];document.title=INFO[GID][0]+' — БЛОК';$('#gDesc').textContent=INFO[GID][1];
$('#ctrl').innerHTML=INFO[GID][2].map(t=>`<li>${t}</li>`).join('');
$('#nx').style.display=GID=='tetris'?'block':'none';if(me())$('#guest').style.display='none';
$('#restart').onclick=$('#again').onclick=function(){this.blur();start()};$('#pauseBtn').onclick=function(){this.blur();pause()};
addEventListener('keyup',e=>{if(e.key==' ')e.preventDefault();
  const k=CODE[e.code]||(e.key.length==1?e.key.toLowerCase():e.key);if(cur&&cur.keyup&&!over)cur.keyup({key:k})});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&!over)pause()});
addEventListener('pagehide',()=>{if(!over)submit()});
const CODE={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyP:'p'};
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  const k=CODE[e.code]||(e.key.length==1?e.key.toLowerCase():e.key);
  if(k=='p'||k=='Escape'){if(!e.repeat)pause();return}
  if(!paused&&!over&&cur.key)cur.key({key:k,repeat:e.repeat})});
let tx,ty;cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
cv.addEventListener('touchend',e=>{if(['blast','tower','bridge','chain'].includes(GID)||paused||over)return;const t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24){if(GID=='tetris')cur.key({key:'ArrowUp'});return}
  cur.key({key:Math.abs(dx)>Math.abs(dy)?(dx>0?'ArrowRight':'ArrowLeft'):(dy>0?'ArrowDown':'ArrowUp')})});
start();let last=0;
(function loop(ts){const dt=Math.min(100,ts-last);last=ts;if(!paused&&!over&&cur.tick)cur.tick(dt);cur.draw();requestAnimationFrame(loop)})(0);
