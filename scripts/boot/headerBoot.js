// Ensure the RepLink header renders on every page (GH Pages safe)
(function(){
  // --- Absolute base for your repo ---
  var META = document.querySelector('meta[name="site-base"]');
  var SITE_BASE = (META && META.content) ? META.content.replace(/\/+$/,'')
                 : (function(){
                     var segs = location.pathname.split('/').filter(Boolean);
                     // https://kenzaii.github.io/Rep-Link-Proto/...
                     if (location.hostname.endsWith('github.io') && segs.length>0) {
                       return location.origin + '/' + segs[0];
                     }
                     return location.origin; // other hosts
                   })();

  function abs(p){
    if (!p) return SITE_BASE;
    if (/^(?:[a-z]+:)?\/\//i.test(p)) return p; // already absolute
    if (p[0] !== '/') p = '/' + p;
    return SITE_BASE + p;
  }

  // --- Ensure a header slot exists ---
  if (!document.querySelector('[data-header]')) {
    var hdr = document.createElement('header');
    hdr.setAttribute('data-header','');
    document.body.insertBefore(hdr, document.body.firstChild);
  }
  document.documentElement.classList.add('has-modern-header');
  document.body.classList.add('has-modern-header');

  // --- Ensure header styles are present (loaded LAST wins) ---
  function need(href){
    return ![...document.styleSheets].some(s=>{ try{ return (s.href||'').endsWith(href); }catch(e){ return false; }});
  }
  function addCss(path){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = abs(path);
    document.head.appendChild(link);
  }
  if (need('/styles/header.css'))    addCss('/styles/header.css');
  if (need('/styles/overrides.css')) addCss('/styles/overrides.css');

  // --- Ensure scripts (idempotent) ---
  function hasSrcEnds(end){ return !![...document.scripts].find(s => (s.src||'').endsWith(end)); }
  function addModule(path){
    if (hasSrcEnds(path)) return;
    var s = document.createElement('script');
    s.type = 'module'; s.src = abs(path);
    document.body.appendChild(s);
  }
  addModule('/scripts/app.js');             // renders header, manages auth
  addModule('/scripts/ui/mobileNav.js');    // burger drawer logic

  // --- Kick a re-render if DOMContentLoaded already passed ---
  function ping(){
    var host = document.querySelector('[data-header]');
    if (host && !host.firstElementChild) {
      // app.js listens to this to re-render header
      window.dispatchEvent(new Event('auth:changed'));
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ping, { once:true });
  } else {
    setTimeout(ping, 50);
  }
})();
