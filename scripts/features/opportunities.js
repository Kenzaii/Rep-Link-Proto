/**
 * Opportunities Feature
 * Handles opportunity browsing, searching, and management
 */

'use strict';

import { API } from '../data/api.js';
import { Store } from '../data/store.js';
import { EventBus } from '../ui/event-bus.js';
import { Toast } from '../ui/components.js';
import { qs, qsa, ce, addClass, removeClass, debounce } from '../ui/dom.js';

/**
 * Opportunities Manager
 * Handles opportunity-related functionality
 */
export class OpportunitiesManager {
    constructor(api, store, eventBus) {
        this.api = api;
        this.store = store;
        this.eventBus = eventBus;
        this.toast = new Toast();
        
        this.opportunities = [];
        this.filteredOpportunities = [];
        this.currentFilters = {};
        this.searchQuery = '';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        this.init();
    }

    /**
     * Initialize opportunities manager
     */
    init() {
        this.setupEventListeners();
        this.loadOpportunities();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = qs('.search-bar__input');
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.searchOpportunities(query);
            }, 300);
            
            searchInput.addEventListener('input', (event) => {
                debouncedSearch(event.target.value);
            });
        }

        // Filter functionality
        qsa('.filter-select').forEach(select => {
            select.addEventListener('change', (event) => {
                this.updateFilter(event.target.name, event.target.value);
            });
        });

        // Tag filters
        qsa('.tag').forEach(tag => {
            tag.addEventListener('click', (event) => {
                this.toggleTagFilter(event.target.textContent);
            });
        });

        // Pagination
        qsa('.pagination__item').forEach(item => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const page = parseInt(event.target.dataset.page);
                if (page) {
                    this.goToPage(page);
                }
            });
        });

        // Opportunity card clicks
        document.addEventListener('click', (event) => {
            const opportunityCard = event.target.closest('.opportunity-card');
            if (opportunityCard) {
                const opportunityId = opportunityCard.dataset.opportunityId;
                if (opportunityId) {
                    this.viewOpportunity(opportunityId);
                }
            }
        });
    }

    /**
     * Load opportunities from API
     */
    async loadOpportunities() {
        try {
            const response = await this.api.request('opportunities/list');
            if (response.success) {
                this.opportunities = response.data;
                this.filteredOpportunities = [...this.opportunities];
                this.renderOpportunities();
                this.updatePagination();
            }
        } catch (error) {
            console.error('Failed to load opportunities:', error);
            this.toast.show('Failed to load opportunities', 'error');
        }
    }

    /**
     * Search opportunities
     */
    searchOpportunities(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    /**
     * Update filter
     */
    updateFilter(filterName, filterValue) {
        if (filterValue === '') {
            delete this.currentFilters[filterName];
        } else {
            this.currentFilters[filterName] = filterValue;
        }
        this.applyFilters();
    }

    /**
     * Toggle tag filter
     */
    toggleTagFilter(tag) {
        const tagFilters = this.currentFilters.tags || [];
        const index = tagFilters.indexOf(tag);
        
        if (index > -1) {
            tagFilters.splice(index, 1);
        } else {
            tagFilters.push(tag);
        }
        
        if (tagFilters.length === 0) {
            delete this.currentFilters.tags;
        } else {
            this.currentFilters.tags = tagFilters;
        }
        
        this.applyFilters();
        this.updateTagFilters();
    }

    /**
     * Apply all filters
     */
    applyFilters() {
        this.filteredOpportunities = this.opportunities.filter(opportunity => {
            // Search filter
            if (this.searchQuery) {
                const searchableText = [
                    opportunity.title,
                    opportunity.description,
                    opportunity.brief,
                    ...(opportunity.tags || [])
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(this.searchQuery)) {
                    return false;
                }
            }

            // Category filter
            if (this.currentFilters.category && opportunity.category !== this.currentFilters.category) {
                return false;
            }

            // Location filter
            if (this.currentFilters.location && opportunity.location !== this.currentFilters.location) {
                return false;
            }

            // Remote filter
            if (this.currentFilters.remote !== undefined) {
                const isRemote = this.currentFilters.remote === 'true';
                if (opportunity.remote !== isRemote) {
                    return false;
                }
            }

            // Commission type filter
            if (this.currentFilters.commissionType && opportunity.commissionType !== this.currentFilters.commissionType) {
                return false;
            }

            // Tags filter
            if (this.currentFilters.tags && this.currentFilters.tags.length > 0) {
                const hasMatchingTag = this.currentFilters.tags.some(tag => 
                    opportunity.tags && opportunity.tags.includes(tag)
                );
                if (!hasMatchingTag) {
                    return false;
                }
            }

            return true;
        });

        this.currentPage = 1;
        this.renderOpportunities();
        this.updatePagination();
    }

    /**
     * Update tag filter UI
     */
    updateTagFilters() {
        qsa('.tag').forEach(tag => {
            const tagText = tag.textContent;
            const isActive = this.currentFilters.tags && this.currentFilters.tags.includes(tagText);
            
            if (isActive) {
                addClass(tag, 'tag--active');
            } else {
                removeClass(tag, 'tag--active');
            }
        });
    }

    /**
     * Render opportunities
     */
    renderOpportunities() {
        const container = qs('.opportunities-grid');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageOpportunities = this.filteredOpportunities.slice(startIndex, endIndex);

        if (pageOpportunities.length === 0) {
            container.innerHTML = this.renderNoResults();
            return;
        }

        container.innerHTML = pageOpportunities.map(opportunity => 
            this.renderOpportunityCard(opportunity)
        ).join('');

        // Add stagger animation
        qsa('.opportunity-card', container).forEach((card, index) => {
            card.style.animationDelay = `${index * 50}ms`;
            addClass(card, 'stagger-item');
        });
    }

    /**
     * Render opportunity card
     */
    renderOpportunityCard(opportunity) {
        const business = this.getBusinessById(opportunity.businessId);
        const commissionText = this.formatCommission(opportunity.commission);
        
        return `
            <div class="opportunity-card" data-opportunity-id="${opportunity.id}">
                <div class="opportunity-card__header">
                    <div>
                        <h3 class="opportunity-card__title">${opportunity.title}</h3>
                        <p class="opportunity-card__company">${business?.name || 'Unknown Company'}</p>
                    </div>
                    <div class="opportunity-card__commission">${commissionText}</div>
                </div>
                
                <p class="opportunity-card__description">${opportunity.description}</p>
                
                <div class="opportunity-card__tags">
                    ${(opportunity.tags || []).map(tag => 
                        `<span class="tag">${tag}</span>`
                    ).join('')}
                </div>
                
                <div class="opportunity-card__meta">
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${opportunity.location}
                    </span>
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        ${this.formatDate(opportunity.createdAt)}
                    </span>
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        ${opportunity.applications || 0} applications
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Render no results message
     */
    renderNoResults() {
        return `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <h3>No opportunities found</h3>
                <p>Try adjusting your search criteria or filters.</p>
                <button class="btn btn--primary" onclick="this.clearFilters()">Clear Filters</button>
            </div>
        `;
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {};
        this.searchQuery = '';
        
        // Reset form inputs
        qs('.search-bar__input').value = '';
        qsa('.filter-select').forEach(select => {
            select.value = '';
        });
        
        this.applyFilters();
        this.updateTagFilters();
    }

    /**
     * Update pagination
     */
    updatePagination() {
        const pagination = qs('.pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredOpportunities.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <a href="#" class="pagination__item ${this.currentPage === 1 ? 'pagination__item--disabled' : ''}" 
               data-page="${this.currentPage - 1}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
            </a>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <a href="#" class="pagination__item ${i === this.currentPage ? 'pagination__item--active' : ''}" 
                   data-page="${i}">${i}</a>
            `;
        }
        
        // Next button
        paginationHTML += `
            <a href="#" class="pagination__item ${this.currentPage === totalPages ? 'pagination__item--disabled' : ''}" 
               data-page="${this.currentPage + 1}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
            </a>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Add event listeners
        qsa('.pagination__item', pagination).forEach(item => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const page = parseInt(event.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.goToPage(page);
                }
            });
        });
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderOpportunities();
        this.updatePagination();
        
        // Scroll to top of opportunities
        const container = qs('.opportunities-grid');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * View opportunity details
     */
    viewOpportunity(opportunityId) {
        // Navigate to opportunity detail page
        window.location.href = `opportunity-detail.html?id=${opportunityId}`;
    }

    /**
     * Get business by ID
     */
    getBusinessById(businessId) {
        // This would typically come from the store or API
        const businesses = this.store.get('businesses', []);
        return businesses.find(business => business.id === businessId);
    }

    /**
     * Format commission display
     */
    formatCommission(commission) {
        if (commission.structure === 'fixed') {
            return `$${commission.amount.toLocaleString()}`;
        } else if (commission.structure === 'milestone') {
            const total = commission.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
            return `$${total.toLocaleString()} total`;
        }
        return 'Contact for details';
    }

    /**
     * Format date display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Get opportunities by business ID
     */
    async getOpportunitiesByBusiness(businessId) {
        try {
            const response = await this.api.request('opportunities/list', {
                query: { businessId }
            });
            
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load business opportunities:', error);
        }
        return [];
    }

    /**
     * Create new opportunity
     */
    async createOpportunity(opportunityData) {
        try {
            const response = await this.api.request('opportunities/create', {
                method: 'POST',
                body: JSON.stringify(opportunityData)
            });
            
            if (response.success) {
                this.toast.show('Opportunity created successfully', 'success');
                this.loadOpportunities(); // Refresh the list
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to create opportunity');
            }
        } catch (error) {
            console.error('Failed to create opportunity:', error);
            this.toast.show(error.message || 'Failed to create opportunity', 'error');
            return null;
        }
    }

    /**
     * Update opportunity
     */
    async updateOpportunity(opportunityId, updateData) {
        try {
            const response = await this.api.request(`opportunities/update/${opportunityId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            if (response.success) {
                this.toast.show('Opportunity updated successfully', 'success');
                this.loadOpportunities(); // Refresh the list
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update opportunity');
            }
        } catch (error) {
            console.error('Failed to update opportunity:', error);
            this.toast.show(error.message || 'Failed to update opportunity', 'error');
            return null;
        }
    }

    /**
     * Delete opportunity
     */
    async deleteOpportunity(opportunityId) {
        try {
            const response = await this.api.request(`opportunities/delete/${opportunityId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                this.toast.show('Opportunity deleted successfully', 'success');
                this.loadOpportunities(); // Refresh the list
                return true;
            } else {
                throw new Error(response.error || 'Failed to delete opportunity');
            }
        } catch (error) {
            console.error('Failed to delete opportunity:', error);
            this.toast.show(error.message || 'Failed to delete opportunity', 'error');
            return false;
        }
    }
}
