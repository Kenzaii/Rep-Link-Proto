// Import path helpers
import { siteBase, hrefAbs } from './boot/siteBase.js';
export function href(p){ return hrefAbs(p); } // use absolute URL everywhere

// Store implementation
export const store = {
  get: (path) => {
    if (path === 'auth') {
      const state = localStorage.getItem('replink_state_v1');
      if (state) {
        const parsed = JSON.parse(state);
        return parsed.auth || { isAuthed: false, user: null, token: null };
      }
      return { isAuthed: false, user: null, token: null };
    }
    return null;
  },
  clearAuth: () => {
    const state = localStorage.getItem('replink_state_v1');
    if (state) {
      const parsed = JSON.parse(state);
      parsed.auth = { isAuthed: false, user: null, token: null };
      localStorage.setItem('replink_state_v1', JSON.stringify(parsed));
    }
    window.dispatchEvent(new Event('auth:changed'));
  }
};


function dashboardFor(user){ 
  return href(user?.role==='business'?'/pages/business-dashboard.html':'/pages/rep-dashboard.html'); 
}

function profileHref(user){
  return href(user?.role === 'business' ? '/pages/business-profile.html' : '/pages/rep-profile.html');
}

function renderHeader(){
  const slot = document.querySelector('[data-header]');
  if(!slot) {
    return;
  }

  const auth = store?.get?.('auth') || { isAuthed:false };
  const user = auth.user;

  const navAuthed = `
    <nav class="nav nav--desktop">
      <a class="nav__link" href="${href('/pages/opportunities.html')}">Browse Opportunities</a>
      <a class="nav__link" href="${dashboardFor(user)}">Dashboard</a>
      <a class="nav__link" href="${profileHref(user)}">Profile</a>
      <div class="user-info">
        <span class="user-name">${user?.name || 'User'}</span>
        <span class="user-role">${user?.role === 'business' ? 'Business' : 'Sales Rep'}</span>
      </div>
      <button class="nav__link" data-action="logout" type="button">Logout</button>
      <button class="header__burger" type="button" data-action="nav-toggle" aria-controls="siteNav" aria-expanded="false" aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </button>
    </nav>`;

  const navAnon = `
    <nav class="nav nav--desktop">
      <a class="nav__link btn btn--secondary" href="${href('/pages/opportunities.html')}">For Reps – Start Selling</a>
      <a class="nav__link btn btn--primary" href="${href('/pages/signup.html?role=business')}">For Business Partners – Start Listing</a>
      <a class="nav__link" href="${href('/pages/login.html')}">Log in / Sign up</a>
      <button class="header__burger" type="button" data-action="nav-toggle" aria-controls="siteNav" aria-expanded="false" aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </button>
    </nav>`;

  const selectedNav = auth.isAuthed ? navAuthed : navAnon;
  
  const headerHTML = `
    <div class="site-header">
      <div class="container header__inner">
        <div class="brand">
          <a class="logo" href="${href('/index.html')}">RepLink</a>
        </div>
        ${selectedNav}
      </div>

      <!-- mobile overlay/panel live outside container for full-width click target -->
      <div class="nav__overlay" data-nav-overlay hidden></div>
      <aside id="siteNav" class="nav__panel" data-nav-panel hidden>
        <header class="nav__panel__hdr">
          <span>Menu</span>
          <button class="nav__close" data-nav-close type="button" aria-label="Close menu">✕</button>
        </header>
        <nav class="nav nav--mobile">
          ${auth.isAuthed ? `
            <a class="nav__link" href="${href('/pages/opportunities.html')}">Browse Opportunities</a>
            <a class="nav__link" href="${dashboardFor(user)}">Dashboard</a>
            <a class="nav__link" href="${profileHref(user)}">Profile</a>
            <button class="nav__link" data-action="logout" type="button">Logout</button>
          ` : `
            <a class="nav__link btn btn--secondary" href="${href('/pages/opportunities.html')}">For Reps – Start Selling</a>
            <a class="nav__link btn btn--primary" href="${href('/pages/signup.html?role=business')}">For Business Partners – Start Listing</a>
            <a class="nav__link" href="${href('/pages/login.html')}">Log in / Sign up</a>
          `}
        </nav>
      </aside>
    </div>
  `;
  
          slot.innerHTML = headerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
});

window.addEventListener('auth:changed', () => {
  renderHeader();
});

document.addEventListener('click', (e)=>{
  const out=e.target.closest('[data-action="logout"]'); if(out){ e.preventDefault(); store?.clearAuth?.(); renderHeader(); location.href=href('/index.html'); }
});