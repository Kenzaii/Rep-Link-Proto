(function(){
  const isSub = location.pathname.toLowerCase().includes('/pages/');
  const base = isSub ? '..' : '.';
  const ABS_RE = /^(?:[a-z]+:)?\/\//i;

  function dedupeFull(v){
    if (!v) return v;
    // If the string contains 'http' more than once, keep the last absolute URL
    const hits = v.match(/https?:\/\/[^\s'"<>]+/gi);
    if (hits && hits.length > 1) return hits[hits.length - 1];
    // If it contains 'http' but not at start, trim to the first absolute
    const pos = v.indexOf('http');
    if (!ABS_RE.test(v) && pos > 0) return v.slice(pos);
    return v;
  }

  function fixAttr(node, attr){
    let v = node.getAttribute(attr);
    if (!v) return;
    v = dedupeFull(v);

    // convert "/x" → "../x" or "./x" for GH Pages
    if (v.startsWith('/')) v = `${base}${v}`;

    node.setAttribute(attr, v);
  }

  function patch(){
    document.querySelectorAll('link[href],script[src],img[src],a[href]').forEach(el=>{
      if (el.hasAttribute('href')) fixAttr(el,'href');
      if (el.hasAttribute('src'))  fixAttr(el,'src');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch, { once: true });
  } else {
    patch();
  }

  // Manual trigger for debugging
  window.__patch_paths__ = patch;
})();