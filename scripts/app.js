/**
 * Rep-Link Application Bootstrap
 * Main entry point for the application
 */

'use strict';

import { Router } from './ui/router.js';
import { Store } from './data/store.js';
import { API } from './data/api.js';
import { EventBus } from './ui/event-bus.js';
import { Toast } from './ui/components.js';
import { Auth } from './features/auth.js';

class App {
    constructor() {
        this.router = new Router();
        this.store = new Store();
        this.api = new API();
        this.eventBus = new EventBus();
        this.toast = new Toast();
        this.auth = new Auth(this.store, this.api, this.eventBus);
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize core systems
            await this.store.init();
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
     * Handle AJAX form submissions
     */
    async handleAjaxForm(form) {
        const formData = new FormData(form);
        const action = form.dataset.action;
        
        try {
            const response = await this.api.request(action, {
                method: 'POST',
                body: formData
            });
            
            if (response.success) {
                this.toast.show(response.message || 'Success!', 'success');
                form.reset();
                
                // Trigger custom event
                this.eventBus.emit('form:success', { form, response });
            } else {
                this.toast.show(response.message || 'An error occurred', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.toast.show('An error occurred while submitting the form', 'error');
        }
    }

    /**
     * Handle navigation clicks
     */
    handleNavigationClick(event) {
        const link = event.target.closest('a[href]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Handle internal navigation
        if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
            event.preventDefault();
            this.router.navigate(href);
        }
        
        // Handle external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
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
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.querySelector('.search-bar__input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Close all open modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        // Save any pending data
        this.store.save();
    }

    /**
     * Handle online status
     */
    handleOnline() {
        this.toast.show('Connection restored', 'success');
        this.eventBus.emit('app:online');
    }

    /**
     * Handle offline status
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
        this.toast.show(error.message || 'Authentication error', 'error');
    }

    /**
     * Check if this is the user's first visit
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
     * @param {string} role - Required role ('rep' or 'business')
     * @param {string} redirect - Redirect URL if not authenticated
     * @returns {boolean} True if authenticated and has required role
     */
    requireAuthRole(role = null, redirect = '/pages/login.html') {
        const auth = this.store.get('auth');
        
        if (!auth?.isAuthed) {
            // Store the current page as the redirect target after login
            const currentPath = window.location.pathname;
            window.location.href = `${redirect}?next=${encodeURIComponent(currentPath)}`;
            return false;
        }
        
        if (role && auth.user.role !== role) {
            // User is authenticated but doesn't have the required role
            window.location.href = '/pages/403.html';
            return false;
        }
        
        return true;
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

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = App.getInstance();
    });
} else {
    window.app = App.getInstance();
}

// Export for module usage
export { App };
