import { rootPrefix, resolve } from './paths.js';

(function(){
  function scan(){
    const abs = [...document.querySelectorAll('link[href^="/"],script[src^="/"],img[src^="/"],a[href^="/"]')];
    const missing = [...document.querySelectorAll('img,script,link')].filter(n=>{
      const attr = n.tagName==='LINK'?'href':'src';
      const v = n.getAttribute(attr);
      return v && !v.startsWith('http') && !v.startsWith('data:') && !v.startsWith('mailto:') && !v.startsWith('#') && !v.includes('://') && !v.startsWith('.') && !v.startsWith('/');
    });
    return { rootPrefix: rootPrefix(), absCount: abs.length, missingCount: missing.length, abs, missing };
  }
  window.__paths_diag__ = () => {
    const d = scan();
    console.group('[Rep-Link] Path diagnostics');
    console.log('rootPrefix()', d.rootPrefix);
    console.log('Absolute URL elements:', d.absCount, d.abs);
    console.log('Suspicious relative elements (no ./ or ../):', d.missingCount, d.missing);
    console.groupEnd();
    return d;
  };
})();
