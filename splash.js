(function(){
const sl=$('#sl'),cv=$('#fw'),cx=cv.getContext('2d'),spl=$('#splash');sl.setAttribute('viewBox',LOGO.vb.join(' '));
sl.innerHTML=`<path class="fill" d="${LOGO.d}"/><path class="pen p2" pathLength="1" d="${LOGO.d}"/><path class="pen" pathLength="1" d="${LOGO.d}"/>`;
const st=$('#stars');for(let i=0;i<26;i++){const s=document.createElement('div'),z=6+Math.random()*12;s.className='st1';s.style.cssText=`left:${4+Math.random()*92}%;top:${Math.random()*92}%;width:${z}px;height:${z}px;animation:tw ${1.3+Math.random()*1.4}s ${.2+Math.random()*2.2}s infinite both`;s.innerHTML='<i></i>';st.appendChild(s)}
const pen=sl.querySelector('.pen:not(.p2)'),p2=sl.querySelector('.p2'),L=pen.getTotalLength(),dpr=Math.min(2,devicePixelRatio||1);
function rs(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}rs();addEventListener('resize',rs);
const D=3800,HOLD=2400,M=[[0,'Загружаем меню и атмосферу...'],[30,'Обжариваем зёрна...'],[60,'Готовим десерты...'],[88,'Почти готово...'],[100,'Добро пожаловать']];
const Pt=[];let lit=false,tl=0,last=0,t0=0,done=false,tx=-99,ty=-99,fl=0;
const emit=(x,y,a,v,l,s)=>Pt.push({x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0,m:l,s});
const col=k=>k<.15?[255,255,235]:k<.45?[255,235-(k-.15)/.3*50,170-(k-.15)/.3*100]:k<.8?[255-(k-.45)/.35*30,185-(k-.45)/.35*100,70-(k-.45)/.35*50]:[220-(k-.8)/.2*100,85-(k-.8)/.2*60,20];
function glow(x,y,r,a){const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,255,245,${a})`);g.addColorStop(.25,`rgba(255,226,140,${a*.8})`);g.addColorStop(.6,`rgba(255,140,30,${a*.3})`);g.addColorStop(1,'rgba(255,100,0,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,6.283);cx.fill()}
function frame(now){if(done)return;if(!t0){t0=now;last=now}const t=now-t0,dt=Math.min(.05,(now-last)/1000||.016);last=now;
cx.clearRect(0,0,innerWidth,innerHeight);cx.globalCompositeOperation='lighter';cx.lineCap='round';
if(t<D){const e=Math.pow(t/D,.92),pt=pen.getPointAtLength(e*L).matrixTransform(pen.getScreenCTM());pen.style.strokeDashoffset=1-e;p2.style.strokeDashoffset=1-Math.max(0,e-.03);tx=pt.x;ty=pt.y;fl=.85+Math.random()*.3;
 for(let i=0,n=Math.round(dt*300);i<n;i++)emit(tx,ty,Math.random()*6.283,50+Math.random()*230,350+Math.random()*650,.7+Math.random()*1.5);
 glow(tx,ty,26*fl,1);glow(tx,ty,9,1);cx.strokeStyle='rgba(255,246,210,.85)';cx.lineWidth=1.2;const rl=16*fl,ro=Math.random()*1.5;for(let k=0;k<4;k++){const a=ro+k*1.5708;cx.beginPath();cx.moveTo(tx,ty);cx.lineTo(tx+Math.cos(a)*rl,ty+Math.sin(a)*rl);cx.stroke()}}
else if(!lit){lit=true;pen.style.strokeDashoffset=0;p2.style.strokeDashoffset=0;sl.classList.add('lit');spl.classList.add('lit');tl=now;const X=innerWidth/2;for(let i=0;i<46;i++){const pt=pen.getPointAtLength(Math.random()*L).matrixTransform(pen.getScreenCTM());emit(pt.x,pt.y,Math.random()*6.283,30+Math.random()*130,700+Math.random()*900,.7+Math.random()*1.2)}}
for(let i=Pt.length-1;i>=0;i--){const p=Pt[i];p.l+=dt*1000;if(p.l>=p.m){Pt.splice(i,1);continue}const k=p.l/p.m,d=Math.pow(.3,dt);p.px=p.x;p.py=p.y;p.vx*=d;p.vy=p.vy*d+260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const c=col(k),a=Math.max(0,1-k*k);cx.strokeStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;cx.lineWidth=p.s*(1-k*.5);cx.beginPath();cx.moveTo(p.px,p.py);cx.lineTo(p.x,p.y);cx.stroke()}
const v=Math.min(100,t/(D+1200)*100),e=1-Math.pow(1-v/100,2),w=e*100;$('#pf').style.width=w+'%';$('#pp').textContent=Math.floor(w)+'%';$('#pt').textContent=M.filter(m=>w>=m[0]).pop()[1];
if(lit&&now-tl>1400+HOLD){done=true;spl.classList.add('out');document.body.classList.remove('lock');$('#sv').pause();setTimeout(()=>spl.remove(),1100);return}
requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();
