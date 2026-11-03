(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

// header + progress + active link
const nav=$('#nav'),bar=$('.progress i');
const links=$$('.menu a'),secs=links.map(a=>$(a.getAttribute('href')));
let tick=false;
function onScroll(){
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  nav.classList.toggle('is-s',y>30);
  bar.style.transform=`scaleX(${h>0?y/h:0})`;
  let cur=-1;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<innerHeight*.4)cur=i});
  links.forEach((a,i)=>a.classList.toggle('on',i===cur));
  if(!reduce){$$('[data-par]').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;el.style.translate=`0 ${(r.top-innerHeight/2)*parseFloat(el.dataset.par)}px`})}
  tick=false;
}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
onScroll();

// mobile menu
const burger=$('#burger'),menu=$('#menu');
const closeMenu=()=>{menu.classList.remove('open');burger.setAttribute('aria-expanded','false')};
burger.addEventListener('click',()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
links.forEach(a=>a.addEventListener('click',closeMenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

// reveal (staggered per parent)
const rv=$$('.reveal');
rv.forEach(el=>{const sib=[...el.parentElement.children].filter(c=>c.classList.contains('reveal'));el.style.setProperty('--d',(sib.indexOf(el)*.1)+'s')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
rv.forEach(el=>io.observe(el));

// counters
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;co.unobserve(e.target);
  const el=e.target,to=+el.dataset.count;
  if(reduce){el.textContent=to;return}
  const t0=performance.now();
  (function f(t){const p=Math.min((t-t0)/1200,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0);
}),{threshold:.6});
$$('[data-count]').forEach(el=>co.observe(el));

// tabs
const tabs=$$('[role=tab]');
function pick(t){
  tabs.forEach(b=>{const on=b===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;
    const p=$('#'+b.getAttribute('aria-controls'));p.hidden=!on;p.classList.toggle('is-on',on)});
}
tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>pick(t));
  t.addEventListener('keydown',e=>{
    const k={ArrowRight:1,ArrowLeft:-1}[e.key];if(!k)return;
    const n=tabs[(i+k+tabs.length)%tabs.length];n.focus();pick(n);e.preventDefault();
  });
});

// open now + today
const live=$('#liveNow');
function status(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
  const g=t=>parts.find(p=>p.type===t).value;
  const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday'));
  const m=(+g('hour')%24)*60+ +g('minute');
  const H={1:[420,1140],2:[420,1140],3:[420,1140],4:[420,1140],5:[480,960]};
  const h=H[day];const open=h&&m>=h[0]&&m<h[1];
  live.className='live '+(open?'open':'closed');
  $('span',live).textContent=open?'Aberto agora':'Fechado agora';
  $$('#hours tr').forEach(r=>r.classList.toggle('today',r.dataset.d.split(',').includes(String(day))));
}
status();setInterval(status,60000);

// lightbox
const lb=$('#lb'),lbi=$('img',lb),lbc=$('figcaption',lb);let lastF;
function openLb(b){lastF=b;lbi.src=b.dataset.lb;lbi.alt=$('img',b).alt;lbc.textContent=b.dataset.cap||'';lb.hidden=false;$('.lb__x',lb).focus();document.body.style.overflow='hidden'}
function closeLb(){lb.hidden=true;document.body.style.overflow='';lastF&&lastF.focus()}
$$('[data-lb]').forEach(b=>b.addEventListener('click',()=>openLb(b)));
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb__x'))closeLb()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)closeLb()});

// form -> WhatsApp
$('#form').addEventListener('submit',e=>{
  e.preventDefault();
  const f=e.target,nome=f.nome.value.trim(),err=$('#ferr');
  if(!nome){err.hidden=false;f.nome.focus();return}
  err.hidden=true;
  const msg=`Olá! Meu nome é ${nome} e tenho interesse em: ${f.int.value}. Gostaria de agendar um horário.`;
  window.open('https://wa.me/5511949084790?text='+encodeURIComponent(msg),'_blank','noopener');
});
$('#yr').textContent=new Date().getFullYear();
})();
