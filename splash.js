(function(){
const sl=$('#sl'),cv=$('#fw'),cx=cv.getContext('2d');sl.setAttribute('viewBox',LOGO.vb.join(' '));
sl.innerHTML=`<path class="fill" d="${LOGO.d}"/><path class="pen p2" pathLength="1" d="${LOGO.d}"/><path class="pen" pathLength="1" d="${LOGO.d}"/><circle class="tip" r="2.2" cx="-50" cy="-50"/>`;
const pen=sl.querySelector('.pen:not(.p2)'),p2=sl.querySelector('.p2'),tip=sl.querySelector('.tip'),L=pen.getTotalLength();
const dpr=Math.min(2,devicePixelRatio||1);function rs(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}rs();addEventListener('resize',rs);
const D=2900,HOLD=2000,M=[[0,'Загружаем меню и атмосферу...'],[30,'Обжариваем зёрна...'],[60,'Готовим десерты...'],[88,'Почти готово...'],[100,'Добро пожаловать']];
const Pt=[];let ea=0,lit=false,tl=0,last=0,t0=performance.now(),done=false;
const emit=(x,y,a,v,l,s)=>Pt.push({x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0,m:l,s});
const col=k=>k<.12?[255,255,238]:k<.4?[255,255-(k-.12)/.28*45,238-(k-.12)/.28*140]:k<.75?[255-(k-.4)/.35*25,210-(k-.4)/.35*105,98-(k-.4)/.35*78]:[230-(k-.75)/.25*110,105-(k-.75)/.25*80,20];
function ignite(){const r=sl.getBoundingClientRect(),X=r.left+r.width/2,Y=r.top+r.height/2;let n=0;const iv=setInterval(()=>{for(let i=0;i<40;i++){const pt=pen.getPointAtLength(Math.random()*L).matrixTransform(pen.getScreenCTM()),a=Math.atan2(pt.y-Y,pt.x-X)+(Math.random()-.5)*1.2;emit(pt.x,pt.y,a,70+Math.random()*340,900+Math.random()*1500,.8+Math.random()*1.8)}if(++n>10)clearInterval(iv)},75);
[[0,-.7,0],[.95,-.1,300],[-.95,-.2,560],[.2,.7,820]].forEach(([dx,dy,d])=>setTimeout(()=>{const bx=X+dx*r.width*.6,by=Y+dy*r.height*.7;for(let i=0;i<120;i++)emit(bx,by,Math.random()*6.283,60+Math.random()*320,1200+Math.random()*1400,1+Math.random()*2)},d))}
function frame(now){if(done)return;const t=now-t0,dt=Math.min(.05,(now-last)/1000||.016);last=now;
if(t<D){const e=Math.pow(t/D,.92),pt=pen.getPointAtLength(e*L);pen.style.strokeDashoffset=1-e;p2.style.strokeDashoffset=1-Math.max(0,e-.03);tip.setAttribute('cx',pt.x);tip.setAttribute('cy',pt.y)}
else if(!lit){lit=true;pen.style.strokeDashoffset=0;p2.style.strokeDashoffset=0;tip.style.display='none';sl.classList.add('lit');ignite();tl=now}
cx.clearRect(0,0,innerWidth,innerHeight);cx.globalCompositeOperation='lighter';cx.lineCap='round';
for(let i=Pt.length-1;i>=0;i--){const p=Pt[i];p.l+=dt*1000;if(p.l>=p.m){Pt.splice(i,1);continue}const k=p.l/p.m,d=Math.pow(.32,dt);p.px=p.x;p.py=p.y;p.vx*=d;p.vy=p.vy*d+150*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const c=col(k),a=Math.max(0,1-k*k);cx.strokeStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;cx.lineWidth=p.s*(1-k*.5);cx.beginPath();cx.moveTo(p.px,p.py);cx.lineTo(p.x,p.y);cx.stroke();if(k<.35){cx.fillStyle=`rgba(255,240,200,${a*.5})`;cx.beginPath();cx.arc(p.x,p.y,p.s*1.3,0,6.283);cx.fill()}}
const pp=Math.min(100,t/(D+2000)*100),e=1-Math.pow(1-pp/100,2.2),v=e*100;$('#pf').style.width=v+'%';$('#pp').textContent=Math.floor(v)+'%';$('#pt').textContent=M.filter(m=>v>=m[0]).pop()[1];
if(lit&&Pt.length===0&&now-tl>1200){if(!ea)ea=now;if(now-ea>HOLD){done=true;$('#splash').classList.add('out');document.body.classList.remove('lock');$('#sv').pause();return}}
requestAnimationFrame(frame)}
requestAnimationFrame(n=>{t0=n;last=n;frame(n)});
})();
