// Simple store implementation (non-module)
var store = window.store || {
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
window.store = store;

// Simple path resolution (non-module)
function rootPrefix() {
  const path = location.pathname;
  const pathParts = path.split('/').filter(Boolean);
  
  // If we're on the root index page, return empty string
  if (path === '/' || path === '/index.html' || pathParts.length === 0) {
    return '';
  }
  
  // If we're in a pages subdirectory, return the path up to pages
  const pagesIndex = path.indexOf('/pages/');
  if (pagesIndex >= 0) {
    return path.slice(0, pagesIndex);
  }
  
  // For other cases, return empty string (root)
  return '';
}

function resolve(pathFromRoot) {
  return `${rootPrefix()}${pathFromRoot}`;
}

function href(path){
  // If path is already absolute (starts with /), use it as-is
  if (path.startsWith('/')) {
    return path;
  }
  // Otherwise, resolve relative to root
  const result = resolve(path);
  return result;
}

function dashboardFor(user){ 
  return href(user?.role==='business'?'/pages/business-dashboard.html':'/pages/rep-dashboard.html'); 
}

function profileHref(user){
  return href(user?.role === 'business' ? '/pages/business-profile.html' : '/pages/rep-profile.html');
}

function renderHeader(){
  alert('renderHeader() called!');
  console.log('renderHeader() called!');
  const slot = document.querySelector('[data-header]');
  if(!slot) {
    alert('No [data-header] element found!');
    console.log('No [data-header] element found!');
    return;
  }
  alert('Found [data-header] element!');
  console.log('Found [data-header] element:', slot);

  const auth = store?.get?.('auth') || { isAuthed:false };
  const user = auth.user;
  
  console.log('Auth state:', auth);
  console.log('User:', user);

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
  console.log('Selected nav:', selectedNav);
  console.log('Auth isAuthed:', auth.isAuthed);
  
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
  
          console.log('Setting innerHTML:', headerHTML);
          
          // Simple test: try inserting just a hamburger button first
          const testHTML = `
            <div class="site-header" style="background: red !important; position: relative !important; z-index: 9999 !important;">
              <div class="container header__inner">
                <div class="brand">
                  <a class="logo" href="${href('/index.html')}">RepLink</a>
                </div>
                <button class="header__burger" type="button" style="background: red !important; border: 2px solid yellow !important; display: inline-flex !important; visibility: visible !important; opacity: 1 !important;">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                </button>
              </div>
            </div>
          `;
          
          console.log('TEST: Setting simple test HTML:', testHTML);
          slot.innerHTML = testHTML;
          console.log('TEST: innerHTML set, slot content:', slot.innerHTML);
          
          // Check if the test hamburger button exists
          const testHamburger = slot.querySelector('.header__burger');
          if (testHamburger) {
            console.log('TEST: Hamburger button found:', testHamburger);
          } else {
            console.log('TEST: No hamburger button found in slot');
          }
  
  // Check if the hamburger button exists
  const hamburger = slot.querySelector('.header__burger');
  if (hamburger) {
    console.log('Hamburger button found:', hamburger);
    hamburger.style.background = 'red !important';
    hamburger.style.border = '2px solid yellow !important';
    hamburger.style.display = 'inline-flex !important';
    hamburger.style.visibility = 'visible !important';
    hamburger.style.opacity = '1 !important';
    console.log('Hamburger styles applied');
  } else {
    console.log('No hamburger button found in slot');
  }
  
  // Temporary test: make header visible with red background
  const siteHeader = slot.querySelector('.site-header');
  if (siteHeader) {
    siteHeader.style.background = 'red !important';
    siteHeader.style.position = 'relative !important';
    siteHeader.style.zIndex = '9999 !important';
    console.log('Header found and styled:', siteHeader);
  } else {
    console.log('No .site-header element found in slot');
  }
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