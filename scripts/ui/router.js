/**
 * Router
 * Simple client-side router for single-page application navigation
 */

'use strict';

import { qs, qsa, show, hide } from './dom.js';

/**
 * Router Class
 * Handles client-side routing and page navigation
 */
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentPage = null;
        this.history = [];
        this.maxHistorySize = 50;
        
        this.init();
    }

    /**
     * Initialize the router
     */
    init() {
        // Set up popstate listener for browser back/forward
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Handle initial route
        this.handleRoute(window.location.pathname);
    }

    /**
     * Add a route
     * @param {string} path - Route path
     * @param {Function} handler - Route handler function
     * @param {Object} options - Route options
     */
    addRoute(path, handler, options = {}) {
        this.routes.set(path, {
            handler,
            options: {
                title: options.title || '',
                requiresAuth: options.requiresAuth || false,
                roles: options.roles || [],
                ...options
            }
        });
    }

    /**
     * Remove a route
     * @param {string} path - Route path
     */
    removeRoute(path) {
        this.routes.delete(path);
    }

    /**
     * Navigate to a route
     * @param {string} path - Target path
     * @param {Object} state - Navigation state
     * @param {boolean} replace - Replace current history entry
     */
    navigate(path, state = {}, replace = false) {
        // Clean up current page
        this.cleanupCurrentPage();
        
        // Update URL
        if (replace) {
            window.history.replaceState(state, '', path);
        } else {
            window.history.pushState(state, '', path);
            this.addToHistory(path, state);
        }
        
        // Handle the new route
        this.handleRoute(path, state);
    }

    /**
     * Handle route changes
     * @param {string} path - Route path
     * @param {Object} state - Route state
     */
    async handleRoute(path, state = {}) {
        try {
            // Find matching route
            const route = this.findRoute(path);
            
            if (!route) {
                this.handleNotFound(path);
                return;
            }
            
            // Check authentication requirements
            if (route.options.requiresAuth && !this.isAuthenticated()) {
                this.navigate('/login', { returnTo: path });
                return;
            }
            
            // Check role requirements
            if (route.options.roles.length > 0 && !this.hasRequiredRole(route.options.roles)) {
                this.navigate('/unauthorized');
                return;
            }
            
            // Update current route
            this.currentRoute = route;
            
            // Update page title
            if (route.options.title) {
                document.title = `${route.options.title} - Rep-Link`;
            }
            
            // Execute route handler
            await route.handler(path, state);
            
            // Update navigation state
            this.updateNavigationState(path);
            
        } catch (error) {
            console.error('Route handling error:', error);
            this.handleError(error);
        }
    }

    /**
     * Find matching route for path
     * @param {string} path - Route path
     * @returns {Object|null}
     */
    findRoute(path) {
        // Exact match first
        if (this.routes.has(path)) {
            return this.routes.get(path);
        }
        
        // Pattern matching
        for (const [routePath, route] of this.routes) {
            if (this.matchRoute(routePath, path)) {
                return route;
            }
        }
        
        return null;
    }

    /**
     * Match route pattern with path
     * @param {string} pattern - Route pattern
     * @param {string} path - Actual path
     * @returns {boolean}
     */
    matchRoute(pattern, path) {
        // Convert pattern to regex
        const regex = pattern
            .replace(/\//g, '\\/')
            .replace(/:([^\/]+)/g, '([^\/]+)')
            .replace(/\*/g, '.*');
        
        return new RegExp(`^${regex}$`).test(path);
    }

    /**
     * Handle popstate events (browser back/forward)
     * @param {PopStateEvent} event - PopState event
     */
    handlePopState(event) {
        this.handleRoute(window.location.pathname, event.state || {});
    }

    /**
     * Handle 404 errors
     * @param {string} path - Requested path
     */
    handleNotFound(path) {
        console.warn(`Route not found: ${path}`);
        
        // Try to load 404 page
        this.loadPage('/404', { path });
    }

    /**
     * Handle routing errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Router error:', error);
        
        // Try to load error page
        this.loadPage('/error', { error: error.message });
    }

    /**
     * Load a page
     * @param {string} path - Page path
     * @param {Object} data - Page data
     */
    async loadPage(path, data = {}) {
        try {
            // Show loading state
            this.showLoading();
            
            // Fetch page content
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`Failed to load page: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Parse and insert content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main') || doc.body;
            
            // Update page content
            const main = qs('main') || qs('#main-content');
            if (main) {
                main.innerHTML = mainContent.innerHTML;
            }
            
            // Hide loading state
            this.hideLoading();
            
            // Trigger page load event
            this.emit('page:loaded', { path, data });
            
        } catch (error) {
            console.error('Page load error:', error);
            this.hideLoading();
            this.showError('Failed to load page');
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const loading = qs('.loading-overlay');
        if (loading) {
            show(loading);
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = qs('.loading-overlay');
        if (loading) {
            hide(loading);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorContainer = qs('.error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="btn btn--primary">Retry</button>
                </div>
            `;
            show(errorContainer);
        }
    }

    /**
     * Update navigation state
     * @param {string} path - Current path
     */
    updateNavigationState(path) {
        // Update active navigation links
        qsa('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href === path || (href !== '/' && path.startsWith(href))) {
                addClass(link, 'active');
            } else {
                removeClass(link, 'active');
            }
        });
    }

    /**
     * Add to navigation history
     * @param {string} path - Path
     * @param {Object} state - State
     */
    addToHistory(path, state) {
        this.history.push({ path, state, timestamp: Date.now() });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Get navigation history
     * @returns {Array}
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Go back in history
     */
    back() {
        if (this.history.length > 1) {
            window.history.back();
        }
    }

    /**
     * Go forward in history
     */
    forward() {
        window.history.forward();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        // This would integrate with your auth system
        return localStorage.getItem('auth-token') !== null;
    }

    /**
     * Check if user has required role
     * @param {Array} roles - Required roles
     * @returns {boolean}
     */
    hasRequiredRole(roles) {
        // This would integrate with your auth system
        const userRole = localStorage.getItem('user-role');
        return roles.includes(userRole);
    }

    /**
     * Clean up current page
     */
    cleanupCurrentPage() {
        if (this.currentPage && typeof this.currentPage.cleanup === 'function') {
            this.currentPage.cleanup();
        }
    }

    /**
     * Emit router event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data) {
        window.dispatchEvent(new CustomEvent(`router:${event}`, { detail: data }));
    }

    /**
     * Get current route information
     * @returns {Object}
     */
    getCurrentRoute() {
        return {
            path: window.location.pathname,
            route: this.currentRoute,
            state: window.history.state
        };
    }
}
