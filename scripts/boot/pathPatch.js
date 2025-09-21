// Rewrites any absolute "/..." href/src into a GH-Pages-safe relative path at runtime.
(function(){
  const isSub = location.pathname.toLowerCase().includes('/pages/');
  const base = isSub ? '..' : '.';

  function fixAttr(node, attr){
    const v = node.getAttribute(attr);
    if(!v || !v.startsWith('/')) return;
    // Convert "/x/y" -> "../x/y" (when under /pages/) or "./x/y" (at root)
    node.setAttribute(attr, `${base}${v}`);
  }

  function patch(){
    // CSS/JS/IMG
    document.querySelectorAll('link[href^="/"], script[src^="/"], img[src^="/"]').forEach(el=>{
      if(el.hasAttribute('href')) fixAttr(el,'href');
      if(el.hasAttribute('src'))  fixAttr(el,'src');
    });
    // In-page links (keep hash/mailto/etc. intact)
    document.querySelectorAll('a[href^="/"]').forEach(a=> fixAttr(a,'href'));
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch, {once:true});
  } else {
    patch();
  }

  // Expose a quick helper
  window.__patch_paths__ = patch;
})();
