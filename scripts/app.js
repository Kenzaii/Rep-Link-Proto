/**
 * Rep-Link Application Bootstrap
 * Main entry point for the application with centralized auth management
 */

'use strict';

import { store } from './data/store.js';
import { Router } from './ui/router.js';
import { API } from './data/api.js';
import { EventBus } from './ui/event-bus.js';
import { Toast } from './ui/components.js';
import { Auth } from './features/auth.js';

// Global authentication functions
export function currentUser() {
    return store.get('auth')?.user || null;
}

export function isAuthed() {
    return !!store.get('auth')?.isAuthed;
}

export function siteRoot() {
    const p = location.pathname;
    const i = p.indexOf('/pages/');
    return i >= 0 ? p.slice(0, i) : '';
}

export function hrefFromRoot(path) {
    return `${siteRoot()}${path}`;
}

export function guardPage(requiredRole, redirect = '/pages/login.html') {
    const auth = store.get('auth');
    if (!auth?.isAuthed) {
        location.href = `${hrefFromRoot(redirect)}?next=${encodeURIComponent(location.pathname)}`;
        return false;
    }
    if (requiredRole && auth.user?.role !== requiredRole) {
        location.href = hrefFromRoot('/pages/403.html');
        return false;
    }
    return true;
}

export function dashboardHrefFor(user) {
    if (!user) return hrefFromRoot('/pages/login.html');
    return hrefFromRoot(user.role === 'business' ? '/pages/business-dashboard.html' : '/pages/rep-dashboard.html');
}

// Header rendering
export function renderHeader() {
    const el = document.querySelector('[data-header]');
    if (!el) return;
    const a = store.get('auth');
    const user = a?.user;
    el.innerHTML = `
        <div class="header__inner">
            <a class="logo" href="${hrefFromRoot('/index.html')}">Rep-Link</a>
            ${a?.isAuthed ? `
                <nav class="nav">
                    <a class="nav__link" href="${hrefFromRoot('/index.html')}">Home</a>
                    <a class="nav__link" href="${dashboardHrefFor(user)}">Dashboard</a>
                    <button class="nav__link" data-action="logout">Logout</button>
                </nav>
            ` : `
                <nav class="nav">
                    <a class="nav__link" href="${hrefFromRoot('/index.html')}">Home</a>
                    <a class="nav__link" href="${hrefFromRoot('/pages/login.html')}">Log in</a>
                    <a class="nav__link btn btn--primary" href="${hrefFromRoot('/pages/signup.html')}">Sign up</a>
                </nav>
            `}
        </div>`;
}

class App {
    constructor() {
        this.router = new Router();
        this.api = new API();
        this.eventBus = new EventBus();
        this.toast = new Toast();
        this.auth = new Auth(store, this.api, this.eventBus);
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize core systems
            await this.api.init();
            
            // Set up global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize authentication
            await this.auth.init();
            
            // Start the router
            this.router.init();
            
            // Show welcome message if first visit
            this.checkFirstVisit();
            
            console.log('Rep-Link application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.toast.show('Failed to initialize application', 'error');
        }
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Handle form submissions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Handle navigation clicks
        document.addEventListener('click', this.handleNavigationClick.bind(this));
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Handle window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Handle authentication state changes
        this.eventBus.on('auth:login', this.handleAuthLogin.bind(this));
        this.eventBus.on('auth:logout', this.handleAuthLogout.bind(this));
        this.eventBus.on('auth:error', this.handleAuthError.bind(this));
    }

    /**
     * Handle form submissions
     */
    handleFormSubmit(event) {
        const form = event.target;
        if (form.dataset.ajax === 'true') {
            event.preventDefault();
            this.handleAjaxForm(form);
        }
    }

    /**
     * Handle navigation clicks
     */
    handleNavigationClick(event) {
        const link = event.target.closest('a[href]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
            // Handle internal navigation
            event.preventDefault();
            this.router.navigate(href);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.focusSearch();
        }
        
        // Escape to close modals
        if (event.key === 'Escape') {
            this.closeModals();
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        // Save any pending data
        this.savePendingData();
    }

    /**
     * Handle online event
     */
    handleOnline() {
        this.toast.show('You are back online', 'success');
        this.eventBus.emit('app:online');
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        this.toast.show('You are offline', 'warning');
        this.eventBus.emit('app:offline');
    }

    /**
     * Handle authentication login
     */
    handleAuthLogin(user) {
        this.toast.show(`Welcome back, ${user.name}!`, 'success');
        this.eventBus.emit('app:user-login', user);
    }

    /**
     * Handle authentication logout
     */
    handleAuthLogout() {
        this.toast.show('You have been logged out', 'info');
        this.eventBus.emit('app:user-logout');
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        this.toast.show(`Authentication error: ${error.message}`, 'error');
        this.eventBus.emit('app:auth-error', error);
    }

    /**
     * Handle AJAX form submission
     */
    async handleAjaxForm(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const response = await this.api.request(form.action, {
                method: form.method || 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.success) {
                this.toast.show('Form submitted successfully', 'success');
                form.reset();
            } else {
                this.toast.show('Form submission failed', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.toast.show('Form submission failed', 'error');
        }
    }

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Close all modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal[aria-hidden="false"]');
        modals.forEach(modal => {
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    /**
     * Save pending data
     */
    savePendingData() {
        // Save any unsaved form data
        const forms = document.querySelectorAll('form[data-autosave]');
        forms.forEach(form => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            localStorage.setItem(`form-${form.id}`, JSON.stringify(data));
        });
    }

    /**
     * Check if this is the first visit
     */
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('rep-link-visited');
        if (!hasVisited) {
            localStorage.setItem('rep-link-visited', 'true');
            this.toast.show('Welcome to Rep-Link! Start by exploring opportunities or posting your first listing.', 'info', 8000);
        }
    }

    /**
     * Require authentication and specific role
     */
    requireAuthRole(role = null, redirect = '/pages/login.html') {
        const auth = store.get('auth');
        
        if (!auth?.isAuthed) {
            const currentPath = window.location.pathname;
            window.location.href = `${redirect}?next=${encodeURIComponent(currentPath)}`;
            return false;
        }
        
        if (role && auth.user.role !== role) {
            window.location.href = '/pages/403.html';
            return false;
        }
        
        return true;
    }

    /**
     * Guard page with role-based access control
     */
    guardPage(role) {
        const auth = store.get('auth');
        if (!auth?.isAuthed) {
            window.location.href = `/pages/login.html?next=${encodeURIComponent(window.location.pathname)}`;
        } else if (role && auth.user.role !== role) {
            window.location.href = '/pages/403.html';
        }
    }

    /**
     * Get application instance
     */
    static getInstance() {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = App.getInstance();
    });
} else {
    window.app = App.getInstance();
}

// Initialize header on every page
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
});

// Re-render header when auth changes
window.addEventListener('auth:changed', renderHeader);

// Global event delegation for logout (works after router swaps too)
document.addEventListener('click', (e) => {
    const out = e.target.closest('[data-action="logout"]');
    if (!out) return;
    e.preventDefault();
    store.clearAuth();
    renderHeader();
    location.href = hrefFromRoot('/index.html');
});

// Export for module usage
export { App };