/* RepLink: Forced header/nav that works on every page (GH Pages safe) */
(function(){
  // --- Absolute base (meta wins; else auto-detect repo) ---
  var META = document.querySelector('meta[name="site-base"]');
  var BASE = (META && META.content) ? META.content.replace(/\/+$/,'')
           : (function(){ var s=location.pathname.split('/').filter(Boolean);
               return (location.hostname.endsWith('github.io') && s.length>0)
                 ? location.origin + '/' + s[0] : location.origin; })();
  function abs(p){ if(!p) return BASE; if(/^(?:[a-z]+:)?\/\//i.test(p)) return p; if(p[0]!=="/") p="/"+p; return BASE+p; }

  // --- Kill legacy static navs that might clash ---
  (function hideLegacy(){
    document.documentElement.classList.add('has-modern-header');
    document.body.classList.add('has-modern-header');
    var css = `
      .has-modern-header .navbar,
      .has-modern-header header.navbar,
      .has-modern-header nav.navbar,
      .has-modern-header #navbar{display:none !important;}
    `;
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  })();

  // --- Inline CSS (wins with !important) ---
  var style = document.createElement('style');
  style.id = 'replink-header-inline';
  style.textContent = `
    :root{
      --rl-blue:#05AADC; --rl-green:#19AF6E; --rl-navy-1:#0A1E32; --rl-navy-2:#0F1E32;
      --rl-text:#E6F0FA; --rl-border:rgba(255,255,255,.10);
    }
    .rl-header{position:sticky;top:0;z-index:1000;background:linear-gradient(180deg,var(--rl-navy-1),var(--rl-navy-2))!important;color:var(--rl-text)!important;border-bottom:1px solid var(--rl-border)!important}
    .rl-inner{height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px}
    .rl-brand{color:var(--rl-text)!important;text-decoration:none!important;font-weight:800;font-size:20px}
    .rl-desktop{display:none;gap:16px;align-items:center}
    .rl-desktop a{color:var(--rl-text)!important;text-decoration:none!important;padding:8px 10px;border-radius:10px}
    .rl-desktop a:hover{background:rgba(255,255,255,.06)}
    .rl-burger{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid var(--rl-border);background:transparent;color:var(--rl-text)}
    @media(min-width:1024px){.rl-desktop{display:flex!important}.rl-burger{display:none!important}}
    /* Overlay + panel */
    [data-rl-overlay]{position:fixed;inset:0;background:rgba(7,19,31,.55);backdrop-filter:blur(1px);z-index:1099}
    [data-rl-overlay][hidden]{display:none!important}
    [data-rl-panel]{position:fixed;top:0;right:0;bottom:0;width:min(88vw,380px);background:linear-gradient(180deg,var(--rl-navy-1),var(--rl-navy-2));color:var(--rl-text);border-left:1px solid var(--rl-border);box-shadow:0 10px 30px rgba(0,0,0,.35);z-index:1100;display:flex;flex-direction:column}
    [data-rl-panel][hidden]{display:none!important}
    .rl-panel-hdr{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--rl-border);font-weight:700}
    .rl-close{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid var(--rl-border);background:transparent;color:var(--rl-text)}
    .rl-mobile{display:block!important;padding:12px!important;overflow:auto;max-height:calc(100dvh - 64px)}
    /* FORCE one item per row */
    .rl-mobile a,.rl-mobile button{display:block!important;width:100%!important;text-align:left!important;white-space:normal!important;margin:8px 0!important;padding:14px 16px!important;color:var(--rl-text)!important;text-decoration:none!important;font-weight:600;background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:12px!important;box-shadow:none!important}
    .rl-mobile a:hover,.rl-mobile button:hover{background:rgba(255,255,255,.10)!important}
    .rl-mobile .btn-primary{background:var(--rl-blue)!important;color:#07131f!important;border-color:transparent!important}
  `;
  document.head.appendChild(style);

  // --- Ensure a header slot at top of body ---
  var mount = document.querySelector('[data-header]');
  if(!mount){ mount = document.createElement('header'); mount.setAttribute('data-header',''); document.body.insertBefore(mount, document.body.firstChild); }

  // --- Build header HTML (desktop + mobile) ---
  mount.innerHTML = `
    <div class="rl-header">
      <div class="container rl-inner">
        <a class="rl-brand" href="${abs('/index.html')}">RepLink</a>
        <nav class="rl-desktop" aria-label="Primary">
          <a href="${abs('/index.html')}">Home</a>
          <a href="${abs('/pages/login.html')}">Log in</a>
          <a href="${abs('/pages/signup.html')}">Sign up</a>
          <a href="${abs('/pages/help/index.html')}">Help</a>
        </nav>
        <button class="rl-burger" type="button" data-rl-toggle aria-controls="rlNav" aria-expanded="false" aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>
      <div class="rl-overlay" data-rl-overlay hidden></div>
      <aside id="rlNav" class="rl-panel" data-rl-panel hidden>
        <div class="rl-panel-hdr">
          <span>Menu</span>
          <button class="rl-close" data-rl-close type="button" aria-label="Close">✕</button>
        </div>
        <nav class="rl-mobile" data-rl-body>
          <!-- Stacked fallback links (will be replaced by app if you later wire auth) -->
          <a href="${abs('/index.html')}">Home</a>
          <a href="${abs('/pages/login.html')}">Log in</a>
          <a class="btn-primary" href="${abs('/pages/signup.html')}">Sign up</a>
          <a href="${abs('/pages/help/index.html')}">Help Center</a>
        </nav>
      </aside>
    </div>
  `;

  // --- Toggle wiring (works independently of any other JS) ---
  var burger = mount.querySelector('[data-rl-toggle]');
  var panel  = mount.querySelector('[data-rl-panel]');
  var overlay= mount.querySelector('[data-rl-overlay]');
  var close  = mount.querySelector('[data-rl-close]');
  function open(){ panel.hidden=false; overlay.hidden=false; burger.setAttribute('aria-expanded','true'); document.documentElement.style.overflow='hidden'; }
  function shut(){ panel.hidden=true;  overlay.hidden=true;  burger.setAttribute('aria-expanded','false'); document.documentElement.style.overflow=''; }
  burger && burger.addEventListener('click', ()=> panel.hidden ? open() : shut());
  overlay && overlay.addEventListener('click', shut);
  close   && close.addEventListener('click', shut);

  // Auto-close if viewport becomes desktop
  var mq = matchMedia('(min-width:1024px)');
  function closeOnDesktop(){ if(mq.matches) shut(); }
  mq.addEventListener?.('change', closeOnDesktop);
  window.addEventListener('resize', closeOnDesktop);
})();
