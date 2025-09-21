let open=false, T=200;
const $ = (s)=>document.querySelector(s);
const els=()=>({btn:$('[data-action="nav-toggle"]'), panel:$('[data-nav-panel]'), overlay:$('[data-nav-overlay]')});
const first=(c)=>c?.querySelector('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
const last=(c)=>{const a=c?.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'); return a?.[a.length-1];};

function on(){ const {btn,panel,overlay}=els(); if(!btn||!panel) return;
  open=true; btn.setAttribute('aria-expanded','true'); panel.hidden=false; overlay&&(overlay.hidden=false);
  requestAnimationFrame(()=>{ panel.classList.add('is-open'); overlay&&overlay.classList.add('is-open'); });
  document.body.classList.add('no-scroll'); setTimeout(()=>first(panel)?.focus(),0);
}
function off(focusBack=true){ const {btn,panel,overlay}=els(); if(!btn||!panel) return;
  open=false; btn.setAttribute('aria-expanded','false'); panel.classList.remove('is-open'); overlay&&overlay.classList.remove('is-open');
  document.body.classList.remove('no-scroll'); setTimeout(()=>{ panel.hidden=true; overlay&&(overlay.hidden=true); if(focusBack) btn.focus(); },T);
}
document.addEventListener('click',(e)=>{
  const t=e.target.closest('[data-action="nav-toggle"]'); if(t){ e.preventDefault(); return open?off():on(); }
  if(open && (e.target.closest('[data-nav-overlay]')||e.target.closest('[data-nav-close]'))) { e.preventDefault(); off(); }
  if(open && e.target.closest('[data-nav-panel] a')) off(false);
});
document.addEventListener('keydown',(e)=>{ if(!open) return; if(e.key==='Escape'){e.preventDefault();off();} else if(e.key==='Tab'){ const p=els().panel, f=first(p), l=last(p); if(!f||!l) return; if(e.shiftKey&&document.activeElement===f){e.preventDefault();l.focus();} else if(!e.shiftKey&&document.activeElement===l){e.preventDefault();f.focus();} }});
window.addEventListener('auth:changed',()=>off(false));

// Close mobile nav when switching to desktop
const mql = window.matchMedia('(min-width: 1024px)');
function closeOnDesktop(){
  const panel = document.querySelector('[data-nav-panel]');
  const overlay = document.querySelector('[data-nav-overlay]');
  const burger = document.querySelector('[data-action="nav-toggle"]');
  if (!panel || !overlay) return;
  if (mql.matches){
    panel.setAttribute('hidden','');
    overlay.setAttribute('hidden','');
    document.documentElement.style.overflow = '';  // unlock scroll
    if (burger) burger.setAttribute('aria-expanded','false');
  }
}
mql.addEventListener?.('change', closeOnDesktop);
window.addEventListener('resize', closeOnDesktop);
closeOnDesktop();
