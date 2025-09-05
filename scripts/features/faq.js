/**
 * FAQ Feature
 * Handles FAQ display and search
 */

'use strict';

import { API } from '../data/api.js';
import { qs, qsa, ce, addClass, removeClass, debounce } from '../ui/dom.js';

/**
 * FAQ Manager
 * Handles FAQ functionality
 */
export class FAQManager {
    constructor(api) {
        this.api = api;
        this.faqData = [];
        this.filteredFAQ = [];
        this.currentCategory = 'all';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFAQ();
    }

    setupEventListeners() {
        // FAQ search
        const searchInput = qs('.faq-search');
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.searchFAQ(query);
            }, 300);
            
            searchInput.addEventListener('input', (event) => {
                debouncedSearch(event.target.value);
            });
        }

        // Category filters
        qsa('.faq-category').forEach(category => {
            category.addEventListener('click', (event) => {
                const categoryName = event.target.dataset.category;
                this.filterByCategory(categoryName);
            });
        });

        // FAQ item clicks
        document.addEventListener('click', (event) => {
            if (event.target.matches('.faq-item__question')) {
                const faqItem = event.target.closest('.faq-item');
                this.toggleFAQItem(faqItem);
            }
        });
    }

    async loadFAQ() {
        try {
            const response = await this.api.request('faq/list');
            if (response.success) {
                this.faqData = response.data;
                this.filteredFAQ = [...this.faqData];
                this.renderFAQ();
                this.renderCategories();
            }
        } catch (error) {
            console.error('Failed to load FAQ:', error);
        }
    }

    searchFAQ(query) {
        if (!query.trim()) {
            this.filteredFAQ = [...this.faqData];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredFAQ = this.faqData.filter(item => 
                item.question.toLowerCase().includes(searchTerm) ||
                item.answer.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderFAQ();
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredFAQ = [...this.faqData];
        } else {
            this.filteredFAQ = this.faqData.filter(item => item.category === category);
        }
        
        this.renderFAQ();
        this.updateCategorySelection();
    }

    toggleFAQItem(faqItem) {
        const isOpen = faqItem.classList.contains('faq-item--open');
        
        // Close all other items
        qsa('.faq-item--open').forEach(item => {
            if (item !== faqItem) {
                removeClass(item, 'faq-item--open');
            }
        });
        
        // Toggle current item
        if (isOpen) {
            removeClass(faqItem, 'faq-item--open');
        } else {
            addClass(faqItem, 'faq-item--open');
        }
    }

    renderFAQ() {
        const container = qs('.faq-list');
        if (!container) return;

        if (this.filteredFAQ.length === 0) {
            container.innerHTML = this.renderNoResults();
            return;
        }

        container.innerHTML = this.filteredFAQ.map(item => 
            this.renderFAQItem(item)
        ).join('');
    }

    renderFAQItem(item) {
        return `
            <div class="faq-item">
                <div class="faq-item__question">
                    <h3>${item.question}</h3>
                    <svg class="faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </div>
                <div class="faq-item__answer">
                    <p>${item.answer}</p>
                </div>
            </div>
        `;
    }

    renderNoResults() {
        return `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <h3>No FAQ items found</h3>
                <p>Try adjusting your search criteria or category filter.</p>
            </div>
        `;
    }

    renderCategories() {
        const container = qs('.faq-categories');
        if (!container) return;

        const categories = ['all', ...new Set(this.faqData.map(item => item.category))];
        
        container.innerHTML = categories.map(category => `
            <button class="faq-category ${category === this.currentCategory ? 'faq-category--active' : ''}" 
                    data-category="${category}">
                ${category === 'all' ? 'All Categories' : category}
            </button>
        `).join('');
    }

    updateCategorySelection() {
        qsa('.faq-category').forEach(category => {
            if (category.dataset.category === this.currentCategory) {
                addClass(category, 'faq-category--active');
            } else {
                removeClass(category, 'faq-category--active');
            }
        });
    }
}
