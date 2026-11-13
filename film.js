'use strict';
const audio=document.getElementById('voice'),stage=document.getElementById('stage'),screen=document.getElementById('screen'),cover=document.getElementById('cover'),play=document.getElementById('play'),seek=document.getElementById('seek'),caption=document.getElementById('caption');
const T=window.FILM_TIMINGS,tl=gsap.timeline({paused:true});
function resize(){const scale=screen.clientWidth/960;stage.style.transform=`scale(${scale})`;stage.style.left='0';stage.style.top='0'}
new ResizeObserver(resize).observe(screen);resize();
new ResizeObserver(()=>{if(screen.clientWidth>0)parent.postMessage({type:'ma-film-size',height:Math.ceil(document.getElementById('player').getBoundingClientRect().height)+2},location.origin==='null'?'*':location.origin)}).observe(document.getElementById('player'));
const add=(selector,from,to,t)=>{gsap.set(selector,from);return tl.fromTo(selector,from,{...to,immediateRender:false},t)};
const rise=(sel,t,extra={})=>add(sel,{opacity:0,y:28},{opacity:1,y:0,duration:.7,ease:'power3.out',...extra},t);
const pop=(sel,t,extra={})=>add(sel,{opacity:0,scale:.65},{opacity:1,scale:1,duration:.65,ease:'back.out(1.4)',...extra},t);
T.scenes.forEach((s,i)=>{tl.set('#s'+i,{autoAlpha:0},0);tl.set('#s'+i,{autoAlpha:1},s.start);if(i<6)tl.to('#s'+i,{autoAlpha:0,y:-10,duration:.35},s.end-.35);else tl.set('#s'+i,{autoAlpha:1},s.end);if(i>0){rise('#s'+i+' .scene-label',s.start+.2);rise('#s'+i+' h2',s.start+.4)}});
add('.film-grid',{x:0,y:0},{x:30,y:-40,duration:T.duration,ease:'none'},0);
add('.ring-one',{rotation:0,scale:1},{rotation:25,scale:1.25,duration:T.duration,ease:'none'},0);
add('.ring-two',{x:0},{x:150,duration:T.duration,ease:'none'},0);
const s=T.scenes.map(v=>v.start),end=T.scenes.map(v=>v.end);
rise('.opening-line',.2);rise('.opening-title span',.5);add('.opening-title strong',{clipPath:'inset(0 100% 0 0)',x:-30},{clipPath:'inset(0 0% 0 0)',x:0,duration:.9,ease:'power3.out'},1.2);
pop('.shield-card',2.2,{duration:.9});add('.logo-orbit .orbit',{opacity:0,scale:.5},{opacity:1,scale:1,rotation:40,duration:1.3,ease:'power2.out'},2.1);
['.tag1','.tag2','.tag3'].forEach((c,i)=>rise(c,4+i*.8));rise('.opening-footer',8);add('.shield-card',{rotation:4,y:0},{rotation:-3,y:-10,duration:3,yoyo:true,repeat:2,ease:'sine.inOut'},3.5);
rise('.bubble-left',s[1]+1.1);add('.typing-dots i',{opacity:.3,y:0},{opacity:1,y:-3,stagger:.15,duration:.4,repeat:5,yoyo:true},s[1]+1.8);pop('.bridge-arrow',s[1]+3.2);rise('.bubble-right',s[1]+4);pop('.checkmark',s[1]+6.1);['.chip1','.chip2','.chip3'].forEach((c,i)=>pop(c,s[1]+7+i*.65));
['.product-a','.product-b','.product-c'].forEach((c,i)=>rise(c,s[2]+1.2+i*2.5));pop('.flow-a',s[2]+3.2);pop('.flow-b',s[2]+5.8);add('.mini-bars i',{scaleY:0,transformOrigin:'bottom'},{scaleY:1,duration:.7,stagger:.15,ease:'power2.out'},s[2]+8);rise('.product-note',s[2]+8.8);
const route=document.getElementById('route-draw'),length=route.getTotalLength();gsap.set(route,{strokeDasharray:length,strokeDashoffset:length});tl.to(route,{strokeDashoffset:0,duration:9,ease:'none'},s[3]+2);
['.stop1','.stop2','.stop3','.stop4'].forEach((c,i)=>pop(c,s[3]+1.6+i*2.6));pop('.traveller',s[3]+1.3);const proxy={progress:0};tl.to(proxy,{progress:1,duration:9,ease:'none',onUpdate(){const p=route.getPointAtLength(length*proxy.progress);gsap.set('.traveller',{x:p.x-100,y:p.y-390})}},s[3]+2);rise('.route-note',s[3]+11.5);
pop('.digital-orbit .orbit',s[4]+1.1);pop('.nika-card',s[4]+2.5);['.token1','.token2','.token3'].forEach((c,i)=>pop(c,s[4]+1.4+i*.9));rise('.chat-window',s[4]+5);rise('.chat-question',s[4]+6.2);rise('.chat-answer',s[4]+8);rise('.answer-line',s[4]+8.6,{stagger:1.3});pop('.human-check',s[4]+13);rise('.digital-note',s[4]+14.5);
['.squad1','.squad2','.squad3'].forEach((c,i)=>rise(c,s[5]+1.5+i*2.1));rise('.squad-message',s[5]+8.5);
add('.final-burst',{scale:.2,rotation:-20},{scale:1.5,rotation:20,duration:12,ease:'power1.out'},s[6]);rise('.final-title',s[6]+.4);['.fa1','.fa2','.fa3'].forEach((c,i)=>rise(c,s[6]+4+i*2.7));rise('.end-sign',s[6]+12.2);
tl.set({}, {}, T.duration);
const captions=[];let batch=[];for(const w of T.words){batch.push(w);if(batch.length>=8||/[.!?]$/.test(w.w)){captions.push({start:batch[0].t,end:w.t+w.d+.18,text:batch.map(v=>v.w).join(' ')});batch=[]}}if(batch.length)captions.push({start:batch[0].t,end:T.duration,text:batch.map(v=>v.w).join(' ')});
function clock(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
let lastCaption='',raf=0;
function sync(){const t=audio.currentTime;tl.time(t,false);seek.value=t;document.getElementById('clock').textContent=clock(t)+' / '+clock(T.duration);const cue=captions.find(c=>t>=c.start&&t<c.end);const text=cue?.text||(t>=T.duration-.5?'Манго Академия. Развиваемся вместе.':'');if(text!==lastCaption){caption.textContent=text||' ';lastCaption=text}document.getElementById('end-actions').hidden=t<s[6]+10;if(!audio.paused)raf=requestAnimationFrame(sync)}
async function start(){if(audio.ended)audio.currentTime=0;try{await audio.play();cover.hidden=true;play.textContent='Ⅱ';play.setAttribute('aria-label','Пауза');cancelAnimationFrame(raf);sync()}catch{caption.textContent='Не удалось включить звук. Нажмите «Воспроизвести» ещё раз.'}}
function pause(){audio.pause();cancelAnimationFrame(raf);play.textContent='▶';play.setAttribute('aria-label','Воспроизвести')}
cover.onclick=start;play.onclick=()=>audio.paused?start():pause();
document.getElementById('restart').onclick=()=>{audio.currentTime=0;start()};
seek.oninput=()=>{audio.currentTime=Number(seek.value);cover.hidden=true;cancelAnimationFrame(raf);sync()};
document.getElementById('mute').onclick=()=>{audio.muted=!audio.muted;const b=document.getElementById('mute');b.textContent=audio.muted?'Без звука':'Звук вкл.';b.setAttribute('aria-label',audio.muted?'Включить звук':'Выключить звук')};
document.getElementById('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.getElementById('player').requestFullscreen()}catch{caption.textContent='Полноэкранный режим недоступен в этом окне.'}};
audio.addEventListener('ended',()=>{pause();sync();document.getElementById('end-actions').hidden=false});audio.addEventListener('pause',()=>{play.textContent='▶';play.setAttribute('aria-label','Воспроизвести')});audio.addEventListener('error',()=>{caption.textContent='Аудиодорожка не загрузилась. Обновите страницу и попробуйте снова.'});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='ma-film-pause')pause()});
document.querySelectorAll('[data-film-action]').forEach(b=>b.onclick=()=>{pause();parent.postMessage({type:'ma-film-action',action:b.dataset.filmAction},location.origin==='null'?'*':location.origin)});
tl.time(0);seek.max=T.duration;
