// Guarantees <header data-header> + header CSS + header scripts are present,
// and works both at repo root and under /pages/ (GitHub Pages safe).
(function(){
  const isSub = location.pathname.includes('/pages/');
  const css = (p) => (isSub ? '..' : '.') + p;
  const js  = (p) => (isSub ? '..' : '.') + p;

  // 1) Ensure placeholder
  if (!document.querySelector('[data-header]')) {
    const h = document.createElement('header');
    h.setAttribute('data-header', '');
    document.body.insertBefore(h, document.body.firstChild);
  }

  // 2) Ensure header.css is loaded (for spacing/visibility)
  const needHeaderCss = ![...document.styleSheets].some(s => {
    try { return (s.href||'').endsWith('/styles/header.css'); } catch { return false; }
  });
  if (needHeaderCss) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = css('/styles/header.css');
    document.head.appendChild(link);
  }

  // 3) Ensure core scripts are loaded (idempotent)
  const needs = (src) => ![...document.scripts].some(s => (s.src||'').endsWith(src));
  // Don't inject app.js if it's already loaded to avoid redeclaration errors
  if (needs('/scripts/app.js') && !window.store) {
    const s = document.createElement('script');
    s.src = js('/scripts/app.js'); document.body.appendChild(s);
  }
  if (needs('/scripts/ui/mobileNav.js')) {
    const s = document.createElement('script');
    s.type = 'module'; s.src = js('/scripts/ui/mobileNav.js'); document.body.appendChild(s);
  }

  // 4) After DOM ready, ask app.js to render if it hasn't yet
  function tryRender() {
    const host = document.querySelector('[data-header]');
    if (!host) {
      return;
    }
    // If header hasn't been populated by app.js, ping it again.
    if (!host.firstElementChild && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:changed'));
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryRender, { once:true });
  } else {
    tryRender();
  }
})();
