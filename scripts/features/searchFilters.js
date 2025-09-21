/**
 * Search and Filters Feature
 * Handles search functionality and filtering
 */

'use strict';

import { qs, qsa, debounce } from '../ui/dom.js';

/**
 * Search and Filters Manager
 * Handles search and filtering functionality
 */
export class SearchFiltersManager {
    constructor() {
        this.searchQuery = '';
        this.filters = {};
        this.sortBy = 'relevance';
        this.sortOrder = 'desc';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFiltersFromURL();
    }

    setupEventListeners() {
        // Search input
        const searchInput = qs('.search-bar__input');
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.setSearchQuery(query);
            }, 300);
            
            searchInput.addEventListener('input', (event) => {
                debouncedSearch(event.target.value);
            });
        }

        // Filter selects
        qsa('.filter-select').forEach(select => {
            select.addEventListener('change', (event) => {
                this.setFilter(event.target.name, event.target.value);
            });
        });

        // Tag filters
        qsa('.tag').forEach(tag => {
            tag.addEventListener('click', (event) => {
                this.toggleTagFilter(event.target.textContent);
            });
        });

        // Sort options
        const sortSelect = qs('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (event) => {
                this.setSort(event.target.value);
            });
        }

        // Clear filters
        const clearBtn = qs('.btn--clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    setSearchQuery(query) {
        this.searchQuery = query;
        this.updateURL();
        this.emitSearchEvent();
    }

    setFilter(filterName, filterValue) {
        if (filterValue === '') {
            delete this.filters[filterName];
        } else {
            this.filters[filterName] = filterValue;
        }
        this.updateURL();
        this.emitSearchEvent();
    }

    toggleTagFilter(tag) {
        const tagFilters = this.filters.tags || [];
        const index = tagFilters.indexOf(tag);
        
        if (index > -1) {
            tagFilters.splice(index, 1);
        } else {
            tagFilters.push(tag);
        }
        
        if (tagFilters.length === 0) {
            delete this.filters.tags;
        } else {
            this.filters.tags = tagFilters;
        }
        
        this.updateURL();
        this.emitSearchEvent();
        this.updateTagFilters();
    }

    setSort(sortValue) {
        const [sortBy, sortOrder] = sortValue.split('_');
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.updateURL();
        this.emitSearchEvent();
    }

    clearAllFilters() {
        this.searchQuery = '';
        this.filters = {};
        this.sortBy = 'relevance';
        this.sortOrder = 'desc';
        
        // Reset form inputs
        const searchInput = qs('.search-bar__input');
        if (searchInput) searchInput.value = '';
        
        qsa('.filter-select').forEach(select => {
            select.value = '';
        });
        
        const sortSelect = qs('.sort-select');
        if (sortSelect) sortSelect.value = 'relevance_desc';
        
        this.updateURL();
        this.emitSearchEvent();
        this.updateTagFilters();
    }

    updateURL() {
        const params = new URLSearchParams();
        
        if (this.searchQuery) {
            params.set('search', this.searchQuery);
        }
        
        Object.entries(this.filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else {
                params.set(key, value);
            }
        });
        
        if (this.sortBy !== 'relevance' || this.sortOrder !== 'desc') {
            params.set('sort', `${this.sortBy}_${this.sortOrder}`);
        }
        
        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newURL);
    }

    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        this.searchQuery = params.get('search') || '';
        this.sortBy = 'relevance';
        this.sortOrder = 'desc';
        
        // Load filters from URL
        params.forEach((value, key) => {
            if (key === 'search') return;
            if (key === 'sort') {
                const [sortBy, sortOrder] = value.split('_');
                this.sortBy = sortBy;
                this.sortOrder = sortOrder;
                return;
            }
            
            if (key === 'tags') {
                this.filters.tags = value.split(',');
            } else {
                this.filters[key] = value;
            }
        });
        
        this.updateFormInputs();
        this.updateTagFilters();
    }

    updateFormInputs() {
        // Update search input
        const searchInput = qs('.search-bar__input');
        if (searchInput) {
            searchInput.value = this.searchQuery;
        }
        
        // Update filter selects
        Object.entries(this.filters).forEach(([key, value]) => {
            const select = qs(`[name="${key}"]`);
            if (select) {
                select.value = value;
            }
        });
        
        // Update sort select
        const sortSelect = qs('.sort-select');
        if (sortSelect) {
            sortSelect.value = `${this.sortBy}_${this.sortOrder}`;
        }
    }

    updateTagFilters() {
        qsa('.tag').forEach(tag => {
            const tagText = tag.textContent;
            const isActive = this.filters.tags && this.filters.tags.includes(tagText);
            
            if (isActive) {
                tag.classList.add('tag--active');
            } else {
                tag.classList.remove('tag--active');
            }
        });
    }

    emitSearchEvent() {
        const event = new CustomEvent('search:updated', {
            detail: {
                searchQuery: this.searchQuery,
                filters: this.filters,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            }
        });
        
        document.dispatchEvent(event);
    }

    getSearchParams() {
        return {
            searchQuery: this.searchQuery,
            filters: this.filters,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder
        };
    }
}
