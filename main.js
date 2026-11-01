const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s);

/* ===== Сцена: закат, облака, силуэт из блоков, искры ===== */
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const PAL=['255,138,31','61,111,224','25,181,165','224,69,63'];
const FX={hero:{bg:1,sky:1,sun:[.78,.82],em:70,h:.34},banner:{bg:1,sky:1,sun:[.85,1],em:35,h:.5},final:{bg:1,sky:1,sun:[.15,.9],em:50,h:.3},side:{bg:1,sky:1,sun:[.5,1],em:25,h:.35},page:{em:60}};
function fx(cv){
  const cfg=FX[cv.dataset.fx];if(!cfg)return;
  const ctx=cv.getContext('2d');let w=0,h=0,sky=null,E=[],C=[],vis=true,run=false,last=0;
  function build(){
    const dpr=Math.min(devicePixelRatio||1,2);
    cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    E=Array.from({length:cfg.em},()=>({x:Math.random()*w,y:Math.random()*h,r:1+Math.random()*2.2,v:8+Math.random()*22,ph:Math.random()*6.28,c:Math.random()<.8?'255,160,60':'255,215,140'}));
    if(!cfg.bg)return;
    C=Array.from({length:6},(_,i)=>({x:Math.random()*w,y:h*(.08+Math.random()*.42),rx:w*(.18+Math.random()*.18),ry:h*(.07+Math.random()*.07),sp:6+Math.random()*10}));
    sky=document.createElement('canvas');sky.width=w*dpr;sky.height=h*dpr;
    const s=sky.getContext('2d');s.scale(dpr,dpr);
    const c=Math.max(22,Math.min(40,w/38)),cols=Math.ceil(w/c)+1,maxR=Math.max(2,Math.floor(h*cfg.h/c)),r=rng(7),sx=cfg.sun[0]*w;
    let hh=maxR*.6;
    for(let i=0;i<cols;i++){
      hh=Math.max(2,Math.min(maxR,hh+(r()-.5)*3));const n=Math.round(hh);
      for(let j=0;j<n;j++){
        if(j>1&&r()<.08)continue;
        const x=i*c,y=h-(j+1)*c,near=Math.max(0,1-Math.abs(x+c/2-sx)/(w*.5));
        s.fillStyle=j===n-1?'#10141c':'#0a0d13';s.fillRect(x+1,y+1,c-2,c-2);
        if(j===n-1||r()<.06){s.fillStyle=`rgba(255,138,31,${.35*near+.05})`;s.fillRect(x+1,y+1,c-2,3)}
        if(j>0&&r()<.1){s.fillStyle=`rgba(${PAL[(r()*4)|0]},.32)`;s.fillRect(x+3,y+3,c-6,c-6)}
      }
    }
  }
  function size(){w=cv.clientWidth;h=cv.clientHeight;if(w&&h){build();draw(0)}}
  function draw(t){
    ctx.clearRect(0,0,w,h);
    if(cfg.bg){
      const sx=cfg.sun[0]*w,sy=cfg.sun[1]*h,g=ctx.createRadialGradient(sx,sy,0,sx,sy,w*.55);
      g.addColorStop(0,'rgba(255,150,50,.6)');g.addColorStop(.4,'rgba(255,100,20,.18)');g.addColorStop(1,'rgba(255,100,20,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      C.forEach(c=>{
        const x=((c.x+t*c.sp)%(w+c.rx*2))-c.rx,lit=.3*(1-Math.min(1,Math.abs(x-sx)/(w*.7)));
        ctx.save();ctx.translate(x,c.y);ctx.scale(1,c.ry/c.rx);
        let q=ctx.createRadialGradient(0,0,0,0,0,c.rx);q.addColorStop(0,'rgba(8,10,16,.85)');q.addColorStop(.55,'rgba(16,20,30,.5)');q.addColorStop(1,'rgba(16,20,30,0)');
        ctx.fillStyle=q;ctx.fillRect(-c.rx,-c.rx,c.rx*2,c.rx*2);
        q=ctx.createRadialGradient(0,c.rx*.45,0,0,c.rx*.45,c.rx*.8);q.addColorStop(0,`rgba(255,138,31,${lit})`);q.addColorStop(1,'rgba(255,138,31,0)');
        ctx.fillStyle=q;ctx.fillRect(-c.rx,-c.rx,c.rx*2,c.rx*2);ctx.restore();
      });
      if(sky)ctx.drawImage(sky,0,0,w,h);
    }
    E.forEach(e=>{
      const a=.35+.45*Math.sin(t*2+e.ph),x=e.x+Math.sin(t*.6+e.ph)*14;
      ctx.fillStyle=`rgba(${e.c},${a*.15})`;ctx.beginPath();ctx.arc(x,e.y,e.r*3.2,0,6.283);ctx.fill();
      ctx.fillStyle=`rgba(${e.c},${a})`;ctx.beginPath();ctx.arc(x,e.y,e.r,0,6.283);ctx.fill();
    });
  }
  function loop(ts){
    const t=ts/1000,dt=Math.min(.05,t-last||.016);last=t;
    E.forEach(e=>{e.y-=e.v*dt;if(e.y<-10){e.y=h+10;e.x=Math.random()*w}});
    draw(t);run=vis&&!reduce;if(run)requestAnimationFrame(loop);
  }
  new ResizeObserver(size).observe(cv);
  new IntersectionObserver(en=>{vis=en[0].isIntersecting;if(vis&&!run&&!reduce){run=true;requestAnimationFrame(loop)}}).observe(cv);
}
document.querySelectorAll('canvas[data-fx]').forEach(fx);

/* ===== Падающие фигуры на главной ===== */
const rain=$('#rain');
if(rain&&!reduce){
  const S=[[[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,0,0],[1,1,1]],[[0,1,1],[1,1,0]]],C=['#ff8a1f','#3d6fe0','#e8e6e1','#e0453f','#4cd07d'];
  for(let i=0;i<9;i++){
    const sh=S[i%5],d=document.createElement('div');d.className='pc';
    d.style.cssText=`left:${(i*11.3)%95}%;--s:${18+(i%3)*8}px;--c:${C[i%5]};--r:${(i%2?1:-1)*(40+i*9)}deg;animation-duration:${14+(i*3)%12}s;animation-delay:-${(i*2.7)%20}s;grid-template-columns:repeat(${sh[0].length},var(--s))`;
    d.innerHTML=sh.flat().map(v=>v?'<b></b>':'<span></span>').join('');rain.appendChild(d);
  }
}

/* ===== Текст постепенно белеет при прокрутке ===== */
const rv=$('.reveal');
if(rv){
  rv.innerHTML=rv.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(' ');
  const ws=[...rv.querySelectorAll('.w')];
  const upd=()=>{const r=rv.getBoundingClientRect(),vh=innerHeight,p=Math.min(1,Math.max(0,(vh*.85-r.top)/(vh*.35+r.height))),n=Math.round(p*ws.length);ws.forEach((w,i)=>w.classList.toggle('lit',i<n))};
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
}

/* ===== Живые картинки на карточках игр ===== */
function demo(id,n,frames,ms){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML='<b></b>'.repeat(n*n);const b=el.children;let i=0;
  const show=()=>{const m=frames[i%frames.length];for(let k=0;k<n*n;k++)b[k].className=m[k]||'';i++};
  show();if(!reduce)setInterval(show,ms);
}
{ // змейка бежит по кольцу
  const p=[];for(let c=1;c<=5;c++)p.push([1,c]);for(let r=2;r<=5;r++)p.push([r,5]);for(let c=4;c>=1;c--)p.push([5,c]);for(let r=4;r>=2;r--)p.push([r,1]);
  const f=p.map((_,k)=>{const m={};if(k%2==0)m[3*7+3]='r';[1,2,3,4].forEach(d=>{const q=p[(k-d+p.length)%p.length];m[q[0]*7+q[1]]='g'});const h=p[k];m[h[0]*7+h[1]]='w';return m});
  demo('tSnake',7,f,260);demo('hSnake',7,f,260);
}
{ // палка падает в стакан и сжигает линии
  const base={};for(let c=0;c<5;c++){base[4*6+c]='r';base[5*6+c]='a'}
  const f=[0,1,2].map(k=>{const m={...base};for(let r=k;r<k+4;r++)m[r*6+5]='u';return m});
  const fl={};for(let c=0;c<6;c++){fl[4*6+c]='w';fl[5*6+c]='w'}
  f.push(fl,{},{[5*6+2]:'u',[5*6+3]:'u'});demo('tTetris',6,f,500);demo('hTetris',6,f,500);
}
{ // блоки ставятся, строка очищается
  const base={};for(let r=0;r<3;r++)for(let c=3;c<6;c++)base[r*6+c]='u';base[0]='r';base[1]='r';
  const f=[];for(let c=0;c<=6;c++){const m={...base};for(let k=0;k<c;k++)m[4*6+k]='a';f.push(m)}
  const fl={...base};for(let c=0;c<6;c++)fl[4*6+c]='w';f.push(fl,{...base});demo('tBlast',6,f,380);demo('hBlast',6,f,380);
}

/* ===== Регистрация, вход, профиль (данные хранятся только в этом браузере) ===== */
const GN={snake:'Змейка',tetris:'Тетрис',blast:'Block Blast',g2048:'2048',tower:'Башня',bridge:'Мост',chain:'Цепочка'};
const guestBest=g=>{try{return+(localStorage.getItem('best_'+g)||0)||0}catch(e){return 0}};
const GC={snake:['#4cd07d','rgba(76,208,125,.4)'],tetris:['#ff8a1f','rgba(255,138,31,.4)'],blast:['#3d6fe0','rgba(61,111,224,.45)'],g2048:['#b36bff','rgba(179,107,255,.4)'],tower:['#19b5a5','rgba(25,181,165,.4)'],bridge:['#ffc15a','rgba(255,193,90,.4)'],chain:['#ff5c8a','rgba(255,92,138,.4)']};
const TOP={snake:[['Артём',420],['Лена',380],['Макс',310],['Соня',250],['Влад',190]],
 tetris:[['Макс',18400],['Артём',15200],['Соня',9800],['Лена',7600],['Влад',4100]],
 blast:[['Лена',5200],['Влад',4700],['Артём',3900],['Макс',2800],['Соня',1500]],
 g2048:[['Лена',4120],['Макс',3340],['Артём',2780],['Соня',1960],['Влад',1100]],
 tower:[['Лена',96],['Макс',71],['Артём',52],['Соня',34],['Влад',18]],
 bridge:[['Лена',64],['Макс',47],['Артём',31],['Соня',20],['Влад',9]],
 chain:[['Лена',15000],['Макс',9000],['Артём',5000],['Соня',2500],['Влад',1000]]};
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const db={get:()=>{try{const u=JSON.parse(localStorage.getItem('users'));return u&&typeof u==='object'?u:{}}catch(e){return{}}},set:u=>{try{localStorage.setItem('users',JSON.stringify(u))}catch(e){}},
 ses:()=>{try{return localStorage.getItem('session')}catch(e){return null}},setSes:k=>{try{k?localStorage.setItem('session',k):localStorage.removeItem('session')}catch(e){}}};
async function hash(pw,salt){
  const d=new TextEncoder().encode(salt+':'+pw);
  if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',d);return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  let h=5381;for(const c of salt+pw)h=((h<<5)+h+c.charCodeAt(0))>>>0;return'x'+h;
}
const me=()=>{const k=db.ses(),u=db.get();return k&&has(u,k)?u[k]:null};
{const u=me();if(u)document.querySelectorAll('.nav a[href="profile.html"]').forEach(a=>a.textContent=u.name)}

if($('#authView')){
  let mode='reg',cur='snake';
  const av=$('#authView'),pv=$('#profView'),err=$('#err');
  const setMode=m=>{mode=m;document.querySelectorAll('.mode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('#confWrap').classList.toggle('hide',m!=='reg');$('#submit').textContent=m==='reg'?'Создать профиль':'Войти';err.textContent=''};
  document.querySelectorAll('.mode button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  $('#authForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const name=$('#fName').value.trim(),pw=$('#fPass').value,key=name.toLowerCase(),users=db.get();
    if(!/^[A-Za-zА-Яа-яЁё0-9_-]{3,16}$/.test(name))return err.textContent='Имя: от 3 до 16 символов, только буквы, цифры, _ и -';
    if(mode==='reg'){
      if(pw.length<6)return err.textContent='Пароль должен быть не короче 6 символов';
      if(pw!==$('#fConf').value)return err.textContent='Пароли не совпадают';
      if(has(users,key))return err.textContent='Это имя уже занято, выберите другое';
      const salt=Math.random().toString(36).slice(2);
      users[key]={name,salt,hash:await hash(pw,salt),created:Date.now(),scores:Object.fromEntries(Object.keys(GN).map(g=>[g,guestBest(g)]))};db.set(users);
    }else{
      const u=has(users,key)?users[key]:null;
      if(!u||u.hash!==await hash(pw,u.salt))return err.textContent='Неверное имя или пароль';
    }
    db.setSes(key);location.reload();
  });
  $('#logout').onclick=()=>{db.setSes(null);location.reload()};
  const rank=(g,u)=>{const l=TOP[g].map(r=>({n:r[0],p:r[1]}));l.push({n:u.name,p:u.scores[g]||0,you:1});l.sort((a,b)=>b.p-a.p);return l};
  function render(u){
    const tabs=$('#gtabs');tabs.innerHTML='';
    Object.keys(GN).forEach(g=>{
      const pos=rank(g,u).findIndex(r=>r.you)+1,b=document.createElement('button');
      b.className='gtab'+(g===cur?' on':'');b.style.cssText=`--c:${GC[g][0]};--cg:${GC[g][1]}`;
      b.innerHTML=`<h4>${GN[g]}</h4><span>Рекорд: ${(u.scores[g]||0).toLocaleString('ru')}</span><span>Место: ${pos}</span>`;
      b.onclick=()=>{cur=g;render(u)};tabs.appendChild(b);
    });
    const l=rank(cur,u),max=Math.max(1,l[0].p);
    $('#rows').innerHTML=l.map((r,i)=>`<tr class="${r.you?'you':''}"><td><span class="pl ${i<3?'p'+(i+1):''}">${i+1}</span></td><td>${r.n}${r.you?' (вы)':''}</td><td>${r.p.toLocaleString('ru')}<div class="meter"><i style="width:${r.p/max*100}%"></i></div></td></tr>`).join('');
  }
  const u=me();
  if(u){
    av.classList.add('hide');pv.classList.remove('hide');
    $('#pAva').textContent=u.name[0].toUpperCase();$('#pName').textContent=u.name;
    $('#pSince').textContent='В рейтинге с '+new Date(u.created).toLocaleDateString('ru');
    $('#pGames').textContent=Object.keys(GN).length;$('#pPts').textContent=Object.keys(GN).reduce((a,g)=>a+(u.scores[g]||0),0).toLocaleString('ru');
    $('#pPlaces').innerHTML=Object.keys(GN).map(g=>`<li style="--c:${GC[g][0]}"><span>${GN[g]}</span><b>#${rank(g,u).findIndex(r=>r.you)+1}</b></li>`).join('');
    render(u);
  }
  setMode('reg');
}

/* ===== Парящие фигуры ===== */
{const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,0,0],[1,1,1]],[[0,1,1],[1,1,0]]];
 document.querySelectorAll('[data-fl]').forEach(el=>{const sh=SH[+el.dataset.fl];el.className='fl';el.style.setProperty('--s',(el.dataset.s||30)+'px');el.style.gridTemplateColumns=`repeat(${sh[0].length},var(--s))`;el.style.animationDelay=(el.dataset.d||0)+'s';el.innerHTML=sh.flat().map(v=>v?'<b></b>':'<span></span>').join('')})}

/* ===== Список игр на главной ===== */
document.querySelectorAll('[data-top]').forEach(el=>el.textContent=Math.max(...TOP[el.dataset.top].map(r=>r[1])).toLocaleString('ru'));
{const un=$('.units');if(un){const bar=$('.track i'),up=()=>{const sw=un.scrollWidth,cw=un.clientWidth;bar.style.width=Math.min(100,cw/sw*100)+'%';bar.style.left=(un.scrollLeft/sw*100)+'%'};un.addEventListener('scroll',up,{passive:true});addEventListener('resize',up);up()}}

{ // башня: блоки ставятся друг на друга, лишнее обрезается
  const n=6,row=(r,a,b,c)=>{const o={};for(let x=a;x<b;x++)o[r*n+x]=c;return o};
  const L=[[1,5,'t'],[1,5,'u'],[2,5,'a'],[2,4,'g'],[1,4,'r']],f=[];
  for(let k=0;k<=L.length;k++){let m={};for(let i=0;i<k;i++)Object.assign(m,row(5-i,L[i][0],L[i][1],L[i][2]));f.push(m)}
  f.push({...f[f.length-1]},{});demo('tTower',n,f,520);demo('hTower',n,f,520)}
{ // мост: палка растёт, падает, герой идёт по ней
  const n=7,P={};for(let r=5;r<7;r++)for(const c of[0,1,5,6])P[r*n+c]='u';
  const fr=[{[4*n]:'a'},{[4*n]:'a',[4*n+1]:'y'},{[4*n]:'a',[4*n+1]:'y',[3*n+1]:'y'},{[4*n]:'a',[4*n+1]:'y',[3*n+1]:'y',[2*n+1]:'y'},
    {[4*n]:'a',[4*n+2]:'y',[4*n+3]:'y',[4*n+4]:'y'},{[4*n+2]:'a',[4*n+3]:'y',[4*n+4]:'y'},{[4*n+4]:'a',[4*n+3]:'y',[4*n+2]:'y'},{[4*n+5]:'a'},{[4*n+5]:'a'}].map(m=>({...P,...m}));
  demo('tBridge',n,fr,420);demo('hBridge',n,fr,420)}
{ // цепочка: один взрыв цепляет шарики
  const n=6,ix=(r,c)=>r*n+c,D={[ix(0,1)]:'r',[ix(0,4)]:'u',[ix(2,2)]:'g',[ix(3,3)]:'t',[ix(4,4)]:'u',[ix(3,5)]:'r',[ix(5,3)]:'g'};
  const box=(r0,r1,c0,c1,k)=>{const o={};for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)o[ix(r,c)]=k;return o};
  const keep={[ix(0,1)]:'r',[ix(0,4)]:'u'},ctr={[ix(2,2)]:'w',[ix(3,3)]:'w',[ix(4,4)]:'w',[ix(3,5)]:'w',[ix(5,3)]:'w'};
  const fr=[D,{...D,[ix(2,2)]:'w'},{...keep,...box(1,3,1,3,'a'),[ix(2,2)]:'w'},{...keep,...box(1,4,1,4,'a'),[ix(2,2)]:'w',[ix(3,3)]:'w'},
    {...keep,...box(1,5,1,5,'a'),...ctr},{...keep,...ctr},{...keep},{}];
  demo('tChain',n,fr,420);demo('hChain',n,fr,420)}
{const f=[{12:'u',13:'u',15:'a'},{14:'g',15:'a',12:'u'},{15:'r',13:'u',8:'a'}];demo('tG2048',4,f,700);demo('hG2048',4,f,700)}

/* ===== Закреплённый блок игр: прокрутка вниз двигает карточки вбок ===== */
{const sec=$('.hs'),un=$('.units');
 if(sec&&un){const HD=65,K=1.6;
  const max=()=>Math.max(0,un.scrollWidth-un.clientWidth);
  const upd=()=>{const m=max(),dist=m*K,r=sec.getBoundingClientRect();un.scrollLeft=dist?Math.min(1,Math.max(0,(HD-r.top)/dist))*m:0};
  const size=()=>{sec.style.height=(innerHeight-HD+max()*K)+'px';upd()};
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',size);addEventListener('load',size);size()}}
