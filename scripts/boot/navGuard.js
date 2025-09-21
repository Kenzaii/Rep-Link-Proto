// Always-on mobile drawer + fallback (absolute URLs for GH Pages)
(function(){
  // Base (meta wins; else auto-detect repo)
  var META = document.querySelector('meta[name="site-base"]');
  var BASE = (META && META.content) ? META.content.replace(/\/+$/,'')
           : (function(){ var s=location.pathname.split('/').filter(Boolean);
               return (location.hostname.endsWith('github.io') && s.length>0)
                 ? location.origin+'/'+s[0] : location.origin; })();

  function abs(p){ if(!p) return BASE; if(/^(?:[a-z]+:)?\/\//i.test(p)) return p; if(p[0]!=="/") p="/"+p; return BASE+p; }

  // Ensure slot + theme flag
  if(!document.querySelector('[data-header]')){
    var hdr=document.createElement('header'); hdr.setAttribute('data-header','');
    document.body.insertBefore(hdr, document.body.firstChild);
  }
  document.documentElement.classList.add('has-modern-header');
  document.body.classList.add('has-modern-header');

  // Inject CSS last
  function addCss(path){
    if ([...document.styleSheets].some(s=>{try{return (s.href||'').includes(path);}catch{return false;}})) return;
    var l=document.createElement('link'); l.rel='stylesheet'; l.href=abs(path); document.head.appendChild(l);
  }
  addCss('/styles/header.css');
  addCss('/styles/overrides.css');
  addCss('/styles/mobile-menu.css?v=5'); // <- important

  // Minimal header shell if empty
  var host=document.querySelector('[data-header]');
  if(host && !host.firstElementChild){
    host.innerHTML = `
      <div class="site-header">
        <div class="container header__inner">
          <div class="brand"><a class="logo" href="${abs('/index.html')}">RepLink</a></div>
          <nav class="nav nav--desktop">
            <a class="nav__link" href="${abs('/index.html')}">Home</a>
            <a class="nav__link" href="${abs('/pages/login.html')}">Log in</a>
            <a class="nav__link btn btn--primary" href="${abs('/pages/signup.html')}">Sign up</a>
          </nav>
          <button class="header__burger" type="button" data-action="nav-toggle" aria-controls="siteNav" aria-expanded="false" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </button>
        </div>
        <div class="nav__overlay" data-nav-overlay hidden></div>
        <aside id="siteNav" class="nav__panel" data-nav-panel hidden>
          <header class="nav__panel__hdr"><span>Menu</span>
            <button class="nav__close" data-nav-close type="button" aria-label="Close">✕</button>
          </header>
          <nav class="nav nav--mobile" data-mobile-menu>
            <!-- fallback list inserted below if empty -->
          </nav>
        </aside>
      </div>`;
  }

  // Fallback list if the app header hasn't populated yet
  function ensureFallback(){
    var body = document.querySelector('[data-mobile-menu]');
    if(!body) return;
    if (body.children.length) return; // already populated by app
    body.innerHTML = `
      <a class="nav__link" href="${abs('/index.html')}">Home</a>
      <a class="nav__link" href="${abs('/pages/login.html')}">Log in</a>
      <a class="nav__link btn--primary" href="${abs('/pages/signup.html')}">Sign up</a>
      <a class="nav__link" href="${abs('/pages/help/index.html')}">Help Center</a>
    `;
  }
  ensureFallback();

  // Wire up basic open/close (works even before app.js loads)
  var burger = document.querySelector('[data-action="nav-toggle"]');
  var panel  = document.querySelector('[data-nav-panel]');
  var overlay= document.querySelector('[data-nav-overlay]');
  var close  = document.querySelector('[data-nav-close]');
  function open(){ panel.hidden=false; overlay.hidden=false; burger?.setAttribute('aria-expanded','true'); document.documentElement.style.overflow='hidden'; }
  function shut(){ panel.hidden=true;  overlay.hidden=true;  burger?.setAttribute('aria-expanded','false'); document.documentElement.style.overflow=''; }
  burger && burger.addEventListener('click', ()=> panel.hidden?open():shut());
  overlay && overlay.addEventListener('click', shut);
  close   && close.addEventListener('click', shut);

  // Load real header + drawer logic (idempotent)
  function addModule(path){
    if ([...document.scripts].some(s => (s.src||'').endsWith(path))) return;
    var s=document.createElement('script'); s.type='module'; s.src=abs(path); document.body.appendChild(s);
  }
  addModule('/scripts/app.js');
  addModule('/scripts/ui/mobileNav.js');

  // When the app renders header, keep our CSS and close states; if mobile list is empty, the fallback remains.
  function ping(){ window.dispatchEvent(new Event('auth:changed')); ensureFallback(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(ping,50), {once:true});
  else setTimeout(ping,50);

})();
