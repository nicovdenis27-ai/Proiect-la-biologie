(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // meniu pe telefon
  var btn=document.querySelector('.btn-meniu'),lista=document.querySelector('nav ul');
  btn.addEventListener('click',function(){
    var d=lista.classList.toggle('deschis');btn.setAttribute('aria-expanded',d);});
  lista.addEventListener('click',function(e){
    if(e.target.tagName==='A'){lista.classList.remove('deschis');btn.setAttribute('aria-expanded',false);}});

  // marchează pagina curentă în meniu
  var cur=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('nav a').forEach(function(a){
    if(a.getAttribute('href').split('/').pop()===cur)a.classList.add('activ');});

  // apariție la scroll, cu decalaj între elementele unui grup
  document.querySelectorAll('[data-stagger]').forEach(function(g){
    Array.prototype.forEach.call(g.children,function(el){
      el.setAttribute('data-reveal','');});});
  var elemente=document.querySelectorAll('[data-reveal],[data-anim]');
  if(reduce||!('IntersectionObserver' in window)){
    elemente.forEach(function(e){e.classList.add('vizibil');});
  }else{
    // in jos: elementele apar; in sus: cele care ies pe la marginea de jos dispar
    var obsRev=new IntersectionObserver(function(intrari){
      intrari.forEach(function(i){
        if(i.isIntersecting){i.target.classList.add('vizibil');}
        else if(i.boundingClientRect.top>0){i.target.classList.remove('vizibil');}});
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    elemente.forEach(function(e){obsRev.observe(e);});
  }

  // scroll: bară de progres, umbră antet, paralaxă ilustrații
  var bara=document.querySelector('.progres'),antet=document.querySelector('header.top'),
      para=[],ocupat=false;
  function actualizeaza(){
    var y=window.scrollY,h=document.documentElement.scrollHeight-window.innerHeight;
    bara.style.transform='scaleX('+(h>0?y/h:0)+')';
    antet.classList.toggle('umbra',y>10);
    if(!reduce){para.forEach(function(s){
      var r=s.getBoundingClientRect(),c=(r.top+r.height/2-window.innerHeight/2);
      s.style.setProperty('--py',(c*-.12).toFixed(1)+'px');
      s.style.setProperty('--rot',(c*.03).toFixed(1)+'deg');
      var p=Math.min(1,Math.max(0,1-(r.top+r.height/2)/window.innerHeight));
      s.style.setProperty('--sc',(.85+.3*p).toFixed(3));});}
    ocupat=false;
  }
  window.addEventListener('scroll',function(){
    if(!ocupat){ocupat=true;requestAnimationFrame(actualizeaza);}},{passive:true});
  window.addEventListener('resize',actualizeaza);
  actualizeaza();

  // mărime text (accesibilitate)
  var marime=100;
  try{marime=parseFloat(localStorage.getItem('marime'))||100}catch(e){}
  function seteaza(m){marime=Math.min(150,Math.max(90,m));
    document.documentElement.style.fontSize=marime+'%';
    try{localStorage.setItem('marime',marime)}catch(e){}}
  seteaza(marime);
  document.querySelectorAll('[data-text]').forEach(function(b){
    b.addEventListener('click',function(){seteaza(marime+(b.dataset.text==='+'?10:-10));});});

  // oprește tremurul de pe Parkinson
  var t=document.querySelector('[data-tremur]'),p=document.querySelector('.half.par');
  if(t&&p){t.addEventListener('click',function(){
    var o=p.classList.toggle('oprit');t.textContent=o?'Pornește mișcarea':'Oprește mișcarea';});}
})();

/* ===== GSAP (paralaxă la scroll) + Anime.js (animații mici) ===== */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var G=window.gsap,A=window.anime;

  if(G&&window.ScrollTrigger){
    G.registerPlugin(ScrollTrigger);
    // 1. pagina de start: cele două jumătăți se mișcă în direcții opuse la scroll
    G.utils.toArray('.half > a').forEach(function(el,i){
      G.to(el,{yPercent:i?16:-16,ease:'none',
        scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    });
    // 2. ilustrațiile: urcă, coboară și se rotesc în ritm cu scrollul
    G.utils.toArray('[data-parallax]').forEach(function(s){
      var alz=s.classList.contains('anim-alz');
      G.fromTo(s,{y:-50,rotation:alz?-20:0,x:alz?0:-24},
                 {y:70,rotation:alz?30:0,x:alz?0:24,ease:'none',
        scrollTrigger:{trigger:s.closest('.pagina-cap'),start:'top bottom',end:'bottom top',scrub:.8}});
    });
    // 3. cardul de text alunecă în sus peste antet
    G.utils.toArray('.text').forEach(function(t){
      G.fromTo(t,{y:60},{y:-20,ease:'none',
        scrollTrigger:{trigger:t,start:'top bottom',end:'top 25%',scrub:true}});
    });
    // 4. paralaxă ușoară la mișcarea mouse-ului, pe pagina de start
    var hero=document.querySelector('.hero');
    if(hero&&window.matchMedia('(pointer:fine)').matches){
      var mx=G.utils.toArray('.half > a').map(function(el){return G.quickTo(el,'x',{duration:.8,ease:'power3.out'});});
      hero.addEventListener('mousemove',function(e){
        var k=(e.clientX/window.innerWidth-.5)*24;
        mx.forEach(function(f,i){f(i?k*-1:k);});});
      hero.addEventListener('mouseleave',function(){mx.forEach(function(f){f(0);});});
    }
  }

  if(A&&window.gsap&&window.ScrollTrigger){
    // helper: pornește la intrare (jos și sus), resetează când ieși în sus
    function laScroll(el,pornire,reset,start){
      reset();
      ScrollTrigger.create({trigger:el,start:start||'top 85%',
        onEnter:pornire,onEnterBack:pornire,onLeaveBack:reset});
    }
    // 5. titlurile: literele apar pe rând
    document.querySelectorAll('.pagina-cap h1').forEach(function(h){
      var text=h.textContent;h.setAttribute('aria-label',text);h.textContent='';
      text.split('').forEach(function(ch){
        var s=document.createElement('span');s.className='litera';s.setAttribute('aria-hidden','true');
        s.textContent=ch;h.appendChild(s);});
      var litere=h.querySelectorAll('.litera');
      laScroll(h,function(){
        A.remove(litere);
        A({targets:litere,translateY:[40,0],opacity:[0,1],rotate:[8,0],
           easing:'easeOutBack',duration:800,delay:A.stagger(45)});
      },function(){A.set(litere,{opacity:0,translateY:40});});
    });
    // 6. listele: punctele intră pe rând, din stânga
    document.querySelectorAll('.text ul').forEach(function(ul){
      var li=ul.querySelectorAll('li');
      laScroll(ul,function(){
        A.remove(li);
        A({targets:li,translateX:[-28,0],opacity:[0,1],easing:'easeOutCubic',
           duration:600,delay:A.stagger(90)});
      },function(){A.set(li,{opacity:0,translateX:-28});});
    });
    // 7. click pe ilustrația Alzheimer: undă de cercuri
    var alz=document.querySelector('.anim-alz');
    if(alz){alz.addEventListener('click',function(){
      A({targets:alz.querySelectorAll('.inel'),scale:[1,1.25,1],easing:'easeInOutSine',
         duration:900,delay:A.stagger(140)});});}
    // 8. butoanele: mic efect de apăsare
    document.querySelectorAll('.tools button,.oprire').forEach(function(b){
      b.addEventListener('click',function(){
        A({targets:b,scale:[1,.86,1],duration:350,easing:'easeOutElastic(1,.7)'});});});
  }
})();

/* ===== animații și stil suplimentar ===== */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,A=window.anime;
  var tools=document.querySelector('.tools'),meniu=document.querySelector('.btn-meniu');

  // 1. temă deschisă / întunecată
  if(tools){
    var tema='deschis';
    try{tema=localStorage.getItem('tema')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'intunecat':'deschis');}catch(e){}
    var bt=document.createElement('button');bt.className='btn-tema';bt.setAttribute('aria-label','Schimbă tema');
    function aplica(t){tema=t;document.documentElement.setAttribute('data-tema',t);bt.textContent=t==='intunecat'?'☀':'☾';
      try{localStorage.setItem('tema',t)}catch(e){}}
    bt.addEventListener('click',function(){
      aplica(tema==='intunecat'?'deschis':'intunecat');
      if(A&&!reduce)A({targets:bt,rotate:[-180,0],scale:[.6,1],duration:600,easing:'easeOutBack'});});
    tools.insertBefore(bt,meniu);aplica(tema);
  }

  // 2. buton „sus”
  var sus=document.createElement('button');sus.className='sus';sus.setAttribute('aria-label','Înapoi sus');
  sus.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
  sus.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});});
  document.body.appendChild(sus);

  // 3. indicator „derulează” pe pagina de start
  var hero=document.querySelector('.hero'),cue=null;
  if(hero){cue=document.createElement('div');cue.className='deruleaza';cue.setAttribute('aria-hidden','true');hero.appendChild(cue);
    // lumină care urmărește mouse-ul
    hero.querySelectorAll('.half').forEach(function(h){
      h.addEventListener('mousemove',function(e){var r=h.getBoundingClientRect();
        h.style.setProperty('--mx',(e.clientX-r.left)+'px');h.style.setProperty('--my',(e.clientY-r.top)+'px');});});}

  function scroll(){var y=window.scrollY;sus.classList.toggle('arata',y>600);if(cue)cue.classList.toggle('ascuns',y>80);}
  window.addEventListener('scroll',scroll,{passive:true});scroll();

  // 4. tranziție între pagini (fade)
  if(!reduce){
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href]');
      if(!a||a.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey)return;
      var href=a.getAttribute('href');
      if(!href||href.charAt(0)==='#'||/^(https?:|mailto:|tel:)/.test(href))return;
      e.preventDefault();document.body.classList.add('iese');
      setTimeout(function(){location.href=a.href;},280);});
    window.addEventListener('pageshow',function(){document.body.classList.remove('iese');});
  }

  // 5. Anime.js: logo-ul „bate” o dată la încărcare, cifrele din antet apar pe rând
  if(A&&!reduce){
    A({targets:'.brand svg',scale:[.5,1],rotate:[-90,0],duration:900,easing:'easeOutElastic(1,.6)',delay:300});
    A({targets:'nav li',translateY:[-14,0],opacity:[0,1],duration:600,easing:'easeOutCubic',delay:A.stagger(90,{start:400})});
    A({targets:'.tools button',scale:[0,1],duration:500,easing:'easeOutBack',delay:A.stagger(70,{start:700})});
  }
})();