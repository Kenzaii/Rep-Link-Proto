/**
 * Animation Utilities
 * Professional micro-animations and transitions
 */

'use strict';

import { qs, qsa, addClass, removeClass, debounce, throttle } from './dom.js';

/**
 * Animation Controller
 * Manages page animations and transitions
 */
export class AnimationController {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupFocusAnimations();
    }

    /**
     * Setup intersection observer for scroll-triggered animations
     */
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateIn(entry.target);
                }
            });
        }, options);

        // Observe elements with animation classes
        qsa('.animate-on-scroll').forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        const handleScroll = throttle(() => {
            this.updateScrollAnimations();
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Setup hover animations
     */
    setupHoverAnimations() {
        // Button hover animations
        qsa('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                addClass(btn, 'btn-hover');
            });
            
            btn.addEventListener('mouseleave', () => {
                removeClass(btn, 'btn-hover');
            });
        });

        // Card hover animations
        qsa('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                addClass(card, 'card-hover');
            });
            
            card.addEventListener('mouseleave', () => {
                removeClass(card, 'card-hover');
            });
        });
    }

    /**
     * Setup focus animations
     */
    setupFocusAnimations() {
        qsa('input, textarea, select, button, a').forEach(el => {
            el.addEventListener('focus', () => {
                addClass(el, 'focus-ring');
            });
            
            el.addEventListener('blur', () => {
                removeClass(el, 'focus-ring');
            });
        });
    }

    /**
     * Animate element in
     */
    animateIn(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        addClass(element, `animate-${animationType}`);
        
        // Remove from observer once animated
        this.intersectionObserver.unobserve(element);
    }

    /**
     * Update scroll-based animations
     */
    updateScrollAnimations() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Parallax effects (subtle)
        qsa('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        // Progress bars
        qsa('.progress-bar').forEach(bar => {
            const rect = bar.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                const progress = bar.dataset.progress || 0;
                bar.style.width = `${progress}%`;
            }
        });
    }

    /**
     * Animate element out
     */
    animateOut(element, callback) {
        const animationType = element.dataset.animationOut || 'fadeOut';
        addClass(element, `animate-${animationType}`);
        
        setTimeout(() => {
            if (callback) callback();
        }, 220); // Match animation duration
    }

    /**
     * Stagger animation for lists
     */
    staggerAnimation(container, selector = '.stagger-item', delay = 50) {
        const elements = qsa(selector, container);
        
        elements.forEach((el, index) => {
            setTimeout(() => {
                addClass(el, 'animate-slide-in-up');
            }, index * delay);
        });
    }

    /**
     * Loading animation
     */
    showLoading(element, message = 'Loading...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading"></div>
                <p>${message}</p>
            </div>
        `;
        
        element.appendChild(loading);
        addClass(loading, 'animate-fade-in');
    }

    hideLoading(element) {
        const loading = qs('.loading-overlay', element);
        if (loading) {
            addClass(loading, 'animate-fade-out');
            setTimeout(() => {
                if (loading.parentNode) {
                    loading.parentNode.removeChild(loading);
                }
            }, 150);
        }
    }
}

/**
 * Page Transition Manager
 * Handles page transitions and loading states
 */
export class PageTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.transitionDuration = 200;
    }

    /**
     * Transition to new page
     */
    async transitionTo(url, options = {}) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        try {
            // Show loading state
            this.showPageLoading();
            
            // Fetch new page content
            const response = await fetch(url);
            const html = await response.text();
            
            // Parse new content
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Get main content
            const newMain = newDoc.querySelector('main') || newDoc.body;
            const currentMain = qs('main') || qs('#main-content');
            
            if (currentMain && newMain) {
                // Animate out current content
                await this.animateOut(currentMain);
                
                // Replace content
                currentMain.innerHTML = newMain.innerHTML;
                
                // Animate in new content
                await this.animateIn(currentMain);
            }
            
            // Update page title
            const newTitle = newDoc.querySelector('title');
            if (newTitle) {
                document.title = newTitle.textContent;
            }
            
        } catch (error) {
            console.error('Page transition error:', error);
            this.showError('Failed to load page');
        } finally {
            this.hidePageLoading();
            this.isTransitioning = false;
        }
    }

    /**
     * Animate out current content
     */
    async animateOut(element) {
        return new Promise(resolve => {
            addClass(element, 'animate-fade-out');
            setTimeout(resolve, this.transitionDuration);
        });
    }

    /**
     * Animate in new content
     */
    async animateIn(element) {
        return new Promise(resolve => {
            addClass(element, 'animate-fade-in');
            setTimeout(resolve, this.transitionDuration);
        });
    }

    /**
     * Show page loading state
     */
    showPageLoading() {
        const loading = qs('.page-loading');
        if (loading) {
            show(loading);
        }
    }

    /**
     * Hide page loading state
     */
    hidePageLoading() {
        const loading = qs('.page-loading');
        if (loading) {
            hide(loading);
        }
    }

    /**
     * Show error state
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
}

/**
 * Micro-interaction Manager
 * Handles subtle micro-interactions
 */
export class MicroInteractionManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonInteractions();
        this.setupFormInteractions();
        this.setupCardInteractions();
        this.setupTooltipInteractions();
    }

    /**
     * Setup button micro-interactions
     */
    setupButtonInteractions() {
        qsa('.btn').forEach(btn => {
            btn.addEventListener('mousedown', () => {
                addClass(btn, 'btn--active');
            });
            
            btn.addEventListener('mouseup', () => {
                removeClass(btn, 'btn--active');
            });
            
            btn.addEventListener('mouseleave', () => {
                removeClass(btn, 'btn--active');
            });
        });
    }

    /**
     * Setup form micro-interactions
     */
    setupFormInteractions() {
        qsa('input, textarea, select').forEach(field => {
            // Floating label effect
            field.addEventListener('focus', () => {
                addClass(field, 'form-input--focused');
            });
            
            field.addEventListener('blur', () => {
                removeClass(field, 'form-input--focused');
                if (field.value) {
                    addClass(field, 'form-input--filled');
                } else {
                    removeClass(field, 'form-input--filled');
                }
            });
            
            // Check initial state
            if (field.value) {
                addClass(field, 'form-input--filled');
            }
        });
    }

    /**
     * Setup card micro-interactions
     */
    setupCardInteractions() {
        qsa('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                addClass(card, 'card--hover');
            });
            
            card.addEventListener('mouseleave', () => {
                removeClass(card, 'card--hover');
            });
        });
    }

    /**
     * Setup tooltip interactions
     */
    setupTooltipInteractions() {
        qsa('[data-tooltip]').forEach(element => {
            let tooltip = null;
            let timeout = null;
            
            element.addEventListener('mouseenter', () => {
                timeout = setTimeout(() => {
                    tooltip = this.createTooltip(element.dataset.tooltip);
                    document.body.appendChild(tooltip);
                    this.positionTooltip(tooltip, element);
                    addClass(tooltip, 'animate-scale-in');
                }, 500); // Delay before showing
            });
            
            element.addEventListener('mouseleave', () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (tooltip) {
                    addClass(tooltip, 'animate-scale-out');
                    setTimeout(() => {
                        if (tooltip.parentNode) {
                            tooltip.parentNode.removeChild(tooltip);
                        }
                    }, 150);
                }
            });
        });
    }

    /**
     * Create tooltip element
     */
    createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        return tooltip;
    }

    /**
     * Position tooltip relative to element
     */
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Adjust if tooltip goes off screen
        if (left < 8) {
            left = 8;
        } else if (left + tooltipRect.width > window.innerWidth - 8) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        
        if (top < 8) {
            top = rect.bottom + 8;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
}

/**
 * Animation Utilities
 * Helper functions for common animations
 */
export const AnimationUtils = {
    /**
     * Fade in element
     */
    fadeIn: (element, duration = 200) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Fade out element
     */
    fadeOut: (element, duration = 200) => {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Slide in from direction
     */
    slideIn: (element, direction = 'up', duration = 200) => {
        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.style.opacity = easeOut;
            element.style.transform = `translate(0, 0)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Scale in element
     */
    scaleIn: (element, duration = 200) => {
        element.style.transform = 'scale(0.9)';
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.style.opacity = easeOut;
            element.style.transform = `scale(${0.9 + (0.1 * easeOut)})`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Animate number counter
     */
    animateCounter: (element, target, duration = 1000) => {
        const start = parseInt(element.textContent) || 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Initialize animation controllers
export const animationController = new AnimationController();
export const pageTransitionManager = new PageTransitionManager();
export const microInteractionManager = new MicroInteractionManager();
