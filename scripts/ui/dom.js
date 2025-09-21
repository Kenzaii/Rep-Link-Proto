/**
 * DOM Utilities
 * Helper functions for DOM manipulation and queries
 */

'use strict';

/**
 * Query selector with optional context
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null}
 */
export function qs(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Query selector all with optional context
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList}
 */
export function qsa(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Create element with optional attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} content - Element content
 * @returns {Element}
 */
export function ce(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });
    
    // Set content
    if (content) {
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    element.appendChild(document.createTextNode(item));
                } else if (item instanceof Element) {
                    element.appendChild(item);
                }
            });
        }
    }
    
    return element;
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 * @returns {Function} Cleanup function
 */
export function on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    return () => {
        element.removeEventListener(event, handler, options);
    };
}

/**
 * Remove event listener
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function off(element, event, handler, options = {}) {
    element.removeEventListener(event, handler, options);
}

/**
 * Add class to element
 * @param {Element} element - Target element
 * @param {string} className - Class name to add
 */
export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

/**
 * Remove class from element
 * @param {Element} element - Target element
 * @param {string} className - Class name to remove
 */
export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

/**
 * Toggle class on element
 * @param {Element} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add/remove
 */
export function toggleClass(element, className, force) {
    if (element && className) {
        element.classList.toggle(className, force);
    }
}

/**
 * Check if element has class
 * @param {Element} element - Target element
 * @param {string} className - Class name to check
 * @returns {boolean}
 */
export function hasClass(element, className) {
    return element && element.classList.contains(className);
}

/**
 * Set element attributes
 * @param {Element} element - Target element
 * @param {Object} attributes - Attributes to set
 */
export function setAttributes(element, attributes) {
    if (element && attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
}

/**
 * Get element attributes
 * @param {Element} element - Target element
 * @param {string|Array} attributes - Attribute names
 * @returns {Object|string}
 */
export function getAttributes(element, attributes) {
    if (!element) return null;
    
    if (typeof attributes === 'string') {
        return element.getAttribute(attributes);
    }
    
    if (Array.isArray(attributes)) {
        const result = {};
        attributes.forEach(attr => {
            result[attr] = element.getAttribute(attr);
        });
        return result;
    }
    
    return null;
}

/**
 * Show element
 * @param {Element} element - Target element
 * @param {string} display - Display style (default: 'block')
 */
export function show(element, display = 'block') {
    if (element) {
        element.style.display = display;
        element.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Hide element
 * @param {Element} element - Target element
 */
export function hide(element) {
    if (element) {
        element.style.display = 'none';
        element.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Toggle element visibility
 * @param {Element} element - Target element
 * @param {boolean} force - Force show/hide
 * @param {string} display - Display style when showing
 */
export function toggleVisibility(element, force, display = 'block') {
    if (element) {
        const isHidden = element.style.display === 'none' || element.getAttribute('aria-hidden') === 'true';
        const shouldShow = force !== undefined ? force : isHidden;
        
        if (shouldShow) {
            show(element, display);
        } else {
            hide(element);
        }
    }
}

/**
 * Get element dimensions
 * @param {Element} element - Target element
 * @returns {Object}
 */
export function getDimensions(element) {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        x: rect.x,
        y: rect.y
    };
}

/**
 * Scroll element into view
 * @param {Element} element - Target element
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(element, options = {}) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            ...options
        });
    }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function}
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Wait for element to be in DOM
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, context = document, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = qs(selector, context);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = qs(selector, context);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(context, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Create SVG icon
 * @param {string} iconName - Icon name
 * @param {Object} attributes - SVG attributes
 * @returns {SVGElement}
 */
export function createIcon(iconName, attributes = {}) {
    const icons = {
        search: `<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>`,
        mail: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        phone: `<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        star: `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        heart: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        check: `<polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        close: `<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        plus: `<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        minus: `<line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        arrowRight: `<line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12,5 19,12 12,19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        arrowLeft: `<line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        arrowUp: `<line x1="12" y1="19" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="5,12 12,5 19,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
        arrowDown: `<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="19,12 12,19 5,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
    };
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    
    // Set default attributes
    Object.entries({
        width: '24',
        height: '24',
        ...attributes
    }).forEach(([key, value]) => {
        svg.setAttribute(key, value);
    });
    
    if (icons[iconName]) {
        svg.innerHTML = icons[iconName];
    }
    
    return svg;
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'SGD') {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {Object} options - Format options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    
    return new Intl.DateTimeFormat('en-SG', defaultOptions).format(new Date(date));
}

/**
 * Format relative time
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now - target) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}
