// Always-on header for Rep-Link (works on every page, GH Pages-safe)
(function(){
  // 1) Absolute repo base
  var META = document.querySelector('meta[name="site-base"]');
  var BASE = (META && META.content) ? META.content.replace(/\/+$/,'')
           : (function(){
               var segs = location.pathname.split('/').filter(Boolean);
               return (location.hostname.endsWith('github.io') && segs.length>0)
                  ? (location.origin + '/' + segs[0])
                  : location.origin;
             })();
  function abs(p){ if(!p) return BASE; if(/^(?:[a-z]+:)?\/\//i.test(p)) return p; if(p[0]!=="/") p="/"+p; return BASE+p; }

  // 2) Ensure header slot + tag document (used by CSS to hide legacy navs)
  if (!document.querySelector('[data-header]')) {
    var hdr = document.createElement('header'); hdr.setAttribute('data-header','');
    document.body.insertBefore(hdr, document.body.firstChild);
  }
  document.documentElement.classList.add('has-modern-header');
  document.body.classList.add('has-modern-header');

  // 3) Inject header CSS (loads last to override)
  function addCss(path){
    if ([...document.styleSheets].some(s=>{try{return (s.href||'').endsWith(path);}catch{return false;}})) return;
    var l=document.createElement('link'); l.rel='stylesheet'; l.href=abs(path); document.head.appendChild(l);
  }
  addCss('/styles/header.css');
  addCss('/styles/overrides.css');
  addCss('/styles/mobile-menu.css?v=4');

  // 4) Paint an immediate, minimal fallback header (so user sees a nav instantly)
  var host = document.querySelector('[data-header]');
  if (host && !host.firstElementChild){
    host.innerHTML = `
      <div class="site-header">
        <div class="container header__inner">
          <div class="brand"><a class="logo" href="${abs('/index.html')}">RepLink</a></div>
          <nav class="nav nav--desktop">
            <a class="nav__link" href="${abs('/index.html')}">Home</a>
            <a class="nav__link" href="${abs('/pages/login.html')}">Log in</a>
            <a class="nav__link btn btn--primary" href="${abs('/pages/signup.html')}">Sign up</a>
          </nav>
          <button class="header__burger" type="button" data-fallback-burger aria-controls="fbNav" aria-expanded="false" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </button>
        </div>
        <div class="nav__overlay" data-fb-overlay hidden></div>
        <aside id="fbNav" class="nav__panel" data-fb-panel hidden>
          <header class="nav__panel__hdr"><span>Menu</span>
            <button class="nav__close" data-fb-close type="button" aria-label="Close">✕</button>
          </header>
          <nav class="nav nav--mobile">
            <a class="nav__link" href="${abs('/index.html')}">Home</a>
            <a class="nav__link" href="${abs('/pages/login.html')}">Log in</a>
            <a class="nav__link btn btn--primary" href="${abs('/pages/signup.html')}">Sign up</a>
          </nav>
        </aside>
      </div>`;
    // tiny fallback toggle
    var burger = document.querySelector('[data-fallback-burger]');
    var panel  = document.querySelector('[data-fb-panel]');
    var ovl    = document.querySelector('[data-fb-overlay]');
    var close  = document.querySelector('[data-fb-close]');
    function open(){ panel.hidden=false; ovl.hidden=false; burger.setAttribute('aria-expanded','true'); document.documentElement.style.overflow='hidden'; }
    function shut(){ panel.hidden=true;  ovl.hidden=true;  burger.setAttribute('aria-expanded','false'); document.documentElement.style.overflow=''; }
    burger && burger.addEventListener('click', ()=> panel.hidden?open():shut());
    close  && close.addEventListener('click', shut);
    ovl    && ovl.addEventListener('click', shut);
    var mq = matchMedia('(min-width:1024px)'); function closeOnDesktop(){ if(mq.matches) shut(); }
    mq.addEventListener?.('change', closeOnDesktop); window.addEventListener('resize', closeOnDesktop);
  }

  // 5) Load real header renderer + burger (idempotent, module)
  function addModule(path){
    if ([...document.scripts].some(s=> (s.src||'').endsWith(path))) return;
    var s=document.createElement('script'); s.type='module'; s.src=abs(path); document.body.appendChild(s);
  }
  addModule('/scripts/app.js');
  addModule('/scripts/ui/mobileNav.js');

  // 6) Ask app.js to render when ready (replaces fallback with full header)
  function ping(){ window.dispatchEvent(new Event('auth:changed')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(ping,50), {once:true});
  else setTimeout(ping,50);
})();
