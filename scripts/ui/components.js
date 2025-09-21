/**
 * UI Components
 * Reusable UI components for the application
 */

'use strict';

import { qs, qsa, ce, addClass, removeClass, show, hide, createIcon } from './dom.js';

// Header component is now handled centrally in app.js

/**
 * Toast Component
 * Displays temporary messages to the user
 */
export class Toast {
    constructor() {
        this.container = qs('#toast-container') || this.createContainer();
        this.toasts = new Map();
    }

    createContainer() {
        const container = ce('div', {
            id: 'toast-container',
            className: 'toast-container',
            'aria-live': 'polite',
            'aria-atomic': 'true'
        });
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            addClass(toast, 'animate-slide-in-up');
        });

        // Auto-dismiss
        const timeout = setTimeout(() => {
            this.dismiss(toast);
        }, duration);

        // Store reference
        this.toasts.set(toast, { timeout, type });

        return toast;
    }

    createToast(message, type) {
        const toast = ce('div', {
            className: `toast toast--${type}`,
            role: 'alert'
        });

        const icon = this.getIcon(type);
        const content = ce('div', { className: 'toast__content' });
        
        content.appendChild(icon);
        
        const messageDiv = ce('div', { className: 'toast__message' });
        messageDiv.innerHTML = message;
        content.appendChild(messageDiv);

        const closeBtn = ce('button', {
            className: 'toast__close',
            'aria-label': 'Close notification'
        });
        closeBtn.appendChild(createIcon('close', { width: '16', height: '16' }));
        closeBtn.addEventListener('click', () => this.dismiss(toast));
        
        content.appendChild(closeBtn);
        toast.appendChild(content);

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: createIcon('check', { width: '20', height: '20', className: 'toast__icon' }),
            error: createIcon('close', { width: '20', height: '20', className: 'toast__icon' }),
            warning: createIcon('minus', { width: '20', height: '20', className: 'toast__icon' }),
            info: createIcon('plus', { width: '20', height: '20', className: 'toast__icon' })
        };
        return icons[type] || icons.info;
    }

    dismiss(toast) {
        if (!toast || !toast.parentNode) return;

        const toastData = this.toasts.get(toast);
        if (toastData) {
            clearTimeout(toastData.timeout);
            this.toasts.delete(toast);
        }

        addClass(toast, 'animate-slide-in-down');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 120);
    }

    dismissAll() {
        qsa('.toast', this.container).forEach(toast => {
            this.dismiss(toast);
        });
    }
}

/**
 * Modal Component
 * Displays modal dialogs
 */
export class Modal {
    constructor(options = {}) {
        this.options = {
            closable: true,
            backdrop: true,
            keyboard: true,
            focus: true,
            ...options
        };
        
        this.modal = null;
        this.backdrop = null;
        this.isOpen = false;
        this.focusableElements = [];
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
    }

    show(content, title = '') {
        if (this.isOpen) return;

        this.createModal(content, title);
        document.body.appendChild(this.modal);
        
        // Focus management
        if (this.options.focus) {
            this.setupFocusManagement();
        }

        // Show modal
        requestAnimationFrame(() => {
            addClass(this.modal, 'modal--open');
        });

        this.isOpen = true;
        document.body.style.overflow = 'hidden';

        // Event listeners
        this.setupEventListeners();
    }

    createModal(content, title) {
        this.modal = ce('div', { className: 'modal' });
        
        if (this.options.backdrop) {
            this.backdrop = ce('div', { className: 'modal__backdrop' });
            this.modal.appendChild(this.backdrop);
        }

        const modalContent = ce('div', { className: 'modal__content' });
        
        if (title || this.options.closable) {
            const header = ce('div', { className: 'modal__header' });
            
            if (title) {
                const titleEl = ce('h2', { className: 'modal__title', textContent: title });
                header.appendChild(titleEl);
            }
            
            if (this.options.closable) {
                const closeBtn = ce('button', {
                    className: 'modal__close',
                    'aria-label': 'Close modal'
                });
                closeBtn.appendChild(createIcon('close', { width: '20', height: '20' }));
                closeBtn.addEventListener('click', () => this.hide());
                header.appendChild(closeBtn);
            }
            
            modalContent.appendChild(header);
        }

        const body = ce('div', { className: 'modal__body' });
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        modalContent.appendChild(body);

        this.modal.appendChild(modalContent);
    }

    setupFocusManagement() {
        this.focusableElements = qsa(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            this.modal
        );
        
        this.firstFocusableElement = this.focusableElements[0];
        this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
        
        if (this.firstFocusableElement) {
            this.firstFocusableElement.focus();
        }
    }

    setupEventListeners() {
        // Backdrop click
        if (this.backdrop && this.options.closable) {
            this.backdrop.addEventListener('click', () => this.hide());
        }

        // Keyboard events
        if (this.options.keyboard) {
            this.handleKeydown = this.handleKeydown.bind(this);
            document.addEventListener('keydown', this.handleKeydown);
        }
    }

    handleKeydown(event) {
        if (event.key === 'Escape' && this.options.closable) {
            this.hide();
        } else if (event.key === 'Tab') {
            this.handleTabKey(event);
        }
    }

    handleTabKey(event) {
        if (this.focusableElements.length === 0) return;

        if (event.shiftKey) {
            if (document.activeElement === this.firstFocusableElement) {
                event.preventDefault();
                this.lastFocusableElement.focus();
            }
        } else {
            if (document.activeElement === this.lastFocusableElement) {
                event.preventDefault();
                this.firstFocusableElement.focus();
            }
        }
    }

    hide() {
        if (!this.isOpen) return;

        removeClass(this.modal, 'modal--open');
        
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
            this.cleanup();
        }, 150);

        this.isOpen = false;
        document.body.style.overflow = '';
    }

    cleanup() {
        if (this.handleKeydown) {
            document.removeEventListener('keydown', this.handleKeydown);
        }
        
        this.modal = null;
        this.backdrop = null;
        this.focusableElements = [];
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
    }
}

/**
 * Stepper Component
 * Multi-step form navigation
 */
export class Stepper {
    constructor(container, options = {}) {
        this.container = qs(container);
        this.options = {
            steps: [],
            currentStep: 0,
            ...options
        };
        
        this.steps = this.options.steps;
        this.currentStep = this.options.currentStep;
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.createStepper();
        this.updateProgress();
    }

    createStepper() {
        this.container.innerHTML = '';
        
        // Progress bar
        const progressContainer = ce('div', { className: 'stepper__progress' });
        this.progressBar = ce('div', { className: 'stepper__progress-bar' });
        progressContainer.appendChild(this.progressBar);
        this.container.appendChild(progressContainer);

        // Steps
        const stepsContainer = ce('div', { className: 'stepper__steps' });
        
        this.steps.forEach((step, index) => {
            const stepEl = ce('div', { className: 'stepper__step' });
            
            const stepNumber = ce('div', { 
                className: 'stepper__step-number',
                textContent: index + 1
            });
            stepEl.appendChild(stepNumber);
            
            const stepLabel = ce('div', { 
                className: 'stepper__step-label',
                textContent: step.title || `Step ${index + 1}`
            });
            stepEl.appendChild(stepLabel);
            
            stepsContainer.appendChild(stepEl);
        });
        
        this.container.appendChild(stepsContainer);
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateProgress();
            return true;
        }
        return false;
    }

    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateProgress();
            return true;
        }
        return false;
    }

    goTo(step) {
        if (step >= 0 && step < this.steps.length) {
            this.currentStep = step;
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress = (this.currentStep / (this.steps.length - 1)) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Update step states
        const stepElements = qsa('.stepper__step', this.container);
        stepElements.forEach((stepEl, index) => {
            removeClass(stepEl, 'stepper__step--active', 'stepper__step--completed');
            
            if (index < this.currentStep) {
                addClass(stepEl, 'stepper__step--completed');
            } else if (index === this.currentStep) {
                addClass(stepEl, 'stepper__step--active');
            }
        });
    }

    getCurrentStep() {
        return this.currentStep;
    }

    getCurrentStepData() {
        return this.steps[this.currentStep];
    }

    isFirstStep() {
        return this.currentStep === 0;
    }

    isLastStep() {
        return this.currentStep === this.steps.length - 1;
    }
}

/**
 * Tabs Component
 * Tabbed interface
 */
export class Tabs {
    constructor(container, options = {}) {
        this.container = qs(container);
        this.options = {
            activeTab: 0,
            ...options
        };
        
        this.tabs = [];
        this.activeTab = this.options.activeTab;
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.createTabs();
        this.showTab(this.activeTab);
    }

    createTabs() {
        const tabsList = ce('div', { className: 'tabs__list', role: 'tablist' });
        const tabsContent = ce('div', { className: 'tabs__content' });
        
        // Create tab buttons
        this.tabs.forEach((tab, index) => {
            const tabButton = ce('button', {
                className: 'tabs__tab',
                role: 'tab',
                'aria-selected': 'false',
                'aria-controls': `tabpanel-${index}`,
                id: `tab-${index}`,
                textContent: tab.title
            });
            
            tabButton.addEventListener('click', () => this.showTab(index));
            tabsList.appendChild(tabButton);
            
            // Create tab panel
            const tabPanel = ce('div', {
                className: 'tabs__panel',
                role: 'tabpanel',
                id: `tabpanel-${index}`,
                'aria-labelledby': `tab-${index}`,
                hidden: true
            });
            
            if (typeof tab.content === 'string') {
                tabPanel.innerHTML = tab.content;
            } else {
                tabPanel.appendChild(tab.content);
            }
            
            tabsContent.appendChild(tabPanel);
        });
        
        this.container.appendChild(tabsList);
        this.container.appendChild(tabsContent);
    }

    showTab(index) {
        if (index < 0 || index >= this.tabs.length) return;
        
        // Update tab buttons
        const tabButtons = qsa('.tabs__tab', this.container);
        tabButtons.forEach((button, i) => {
            const isActive = i === index;
            button.setAttribute('aria-selected', isActive);
            if (isActive) {
                addClass(button, 'tabs__tab--active');
            } else {
                removeClass(button, 'tabs__tab--active');
            }
        });
        
        // Update tab panels
        const tabPanels = qsa('.tabs__panel', this.container);
        tabPanels.forEach((panel, i) => {
            if (i === index) {
                show(panel);
            } else {
                hide(panel);
            }
        });
        
        this.activeTab = index;
    }

    addTab(title, content) {
        this.tabs.push({ title, content });
        this.init(); // Recreate tabs
    }

    removeTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.tabs.splice(index, 1);
            if (this.activeTab >= this.tabs.length) {
                this.activeTab = Math.max(0, this.tabs.length - 1);
            }
            this.init(); // Recreate tabs
        }
    }

    getActiveTab() {
        return this.activeTab;
    }

    getActiveTabData() {
        return this.tabs[this.activeTab];
    }
}

/**
 * Dropdown Component
 * Dropdown menu
 */
export class Dropdown {
    constructor(container, options = {}) {
        this.container = qs(container);
        this.options = {
            items: [],
            placeholder: 'Select an option',
            ...options
        };
        
        this.isOpen = false;
        this.selectedItem = null;
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.createDropdown();
        this.setupEventListeners();
    }

    createDropdown() {
        this.container.innerHTML = '';
        addClass(this.container, 'dropdown');
        
        // Trigger button
        this.trigger = ce('button', {
            className: 'dropdown__trigger',
            type: 'button',
            'aria-expanded': 'false',
            'aria-haspopup': 'true'
        });
        
        const triggerText = ce('span', { 
            className: 'dropdown__text',
            textContent: this.options.placeholder
        });
        this.trigger.appendChild(triggerText);
        
        const triggerIcon = createIcon('arrowDown', { width: '16', height: '16' });
        this.trigger.appendChild(triggerIcon);
        
        this.container.appendChild(this.trigger);
        
        // Menu
        this.menu = ce('div', { className: 'dropdown__menu' });
        
        this.options.items.forEach((item, index) => {
            const menuItem = ce('button', {
                className: 'dropdown__item',
                type: 'button',
                textContent: item.label || item,
                'data-value': item.value || item
            });
            
            menuItem.addEventListener('click', () => this.selectItem(item, index));
            this.menu.appendChild(menuItem);
        });
        
        this.container.appendChild(this.menu);
    }

    setupEventListeners() {
        this.trigger.addEventListener('click', () => this.toggle());
        
        // Close on outside click
        document.addEventListener('click', (event) => {
            if (!this.container.contains(event.target)) {
                this.close();
            }
        });
        
        // Keyboard navigation
        this.trigger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggle();
            } else if (event.key === 'Escape') {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        addClass(this.container, 'dropdown--open');
        this.trigger.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
    }

    close() {
        removeClass(this.container, 'dropdown--open');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }

    selectItem(item, index) {
        this.selectedItem = item;
        
        const triggerText = qs('.dropdown__text', this.trigger);
        triggerText.textContent = item.label || item;
        
        this.close();
        
        // Trigger change event
        this.container.dispatchEvent(new CustomEvent('change', {
            detail: { item, index }
        }));
    }

    getSelectedItem() {
        return this.selectedItem;
    }

    setSelectedItem(item) {
        const index = this.options.items.findIndex(i => 
            (i.value || i) === (item.value || item)
        );
        
        if (index > -1) {
            this.selectItem(item, index);
        }
    }
}

/**
 * Card Component
 * Reusable card component
 */
export class Card {
    constructor(options = {}) {
        this.options = {
            title: '',
            subtitle: '',
            content: '',
            footer: '',
            className: '',
            ...options
        };
        
        this.element = this.createCard();
    }

    createCard() {
        const card = ce('div', { className: `card ${this.options.className}` });
        
        if (this.options.title || this.options.subtitle) {
            const header = ce('div', { className: 'card__header' });
            
            if (this.options.title) {
                const title = ce('h3', { 
                    className: 'card__title',
                    textContent: this.options.title
                });
                header.appendChild(title);
            }
            
            if (this.options.subtitle) {
                const subtitle = ce('p', { 
                    className: 'card__subtitle',
                    textContent: this.options.subtitle
                });
                header.appendChild(subtitle);
            }
            
            card.appendChild(header);
        }
        
        if (this.options.content) {
            const body = ce('div', { className: 'card__body' });
            
            if (typeof this.options.content === 'string') {
                body.innerHTML = this.options.content;
            } else {
                body.appendChild(this.options.content);
            }
            
            card.appendChild(body);
        }
        
        if (this.options.footer) {
            const footer = ce('div', { className: 'card__footer' });
            
            if (typeof this.options.footer === 'string') {
                footer.innerHTML = this.options.footer;
            } else {
                footer.appendChild(this.options.footer);
            }
            
            card.appendChild(footer);
        }
        
        return card;
    }

    getElement() {
        return this.element;
    }

    updateContent(content) {
        const body = qs('.card__body', this.element);
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
    }

    addClass(className) {
        addClass(this.element, className);
    }

    removeClass(className) {
        removeClass(this.element, className);
    }
}
