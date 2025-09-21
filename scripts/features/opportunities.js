/**
 * Opportunities Page
 * Browse and filter opportunities for reps
 */

import { api } from '../data/api.js';
import { requireAuth } from './guards.js';

let allOpportunities = [];
let filteredOpportunities = [];

export function initOpportunities() {
    // Check authentication
    if (!requireAuth()) return;

    loadOpportunities();
    setupFilters();
}

async function loadOpportunities() {
    try {
        allOpportunities = await api.opportunities();
        filteredOpportunities = [...allOpportunities];
        renderOpportunities();
    } catch (error) {
        console.error('Failed to load opportunities:', error);
        showError('Failed to load opportunities');
    }
}

function setupFilters() {
    const sectorFilter = document.getElementById('sector-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search-input');

    if (sectorFilter) {
        sectorFilter.addEventListener('change', applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function applyFilters() {
    const sectorFilter = document.getElementById('sector-filter')?.value;
    const typeFilter = document.getElementById('type-filter')?.value;
    const searchInput = document.getElementById('search-input')?.value.toLowerCase();

    filteredOpportunities = allOpportunities.filter(opp => {
        const matchesSector = !sectorFilter || opp.sector === sectorFilter;
        const matchesType = !typeFilter || opp.type === typeFilter;
        const matchesSearch = !searchInput || 
            opp.title.toLowerCase().includes(searchInput) ||
            opp.company.toLowerCase().includes(searchInput) ||
            opp.short.toLowerCase().includes(searchInput);

        return matchesSector && matchesType && matchesSearch;
    });

    renderOpportunities();
}

function renderOpportunities() {
    const container = document.getElementById('opportunities-grid');
    if (!container) return;

    if (filteredOpportunities.length === 0) {
        container.innerHTML = '<p class="text-muted">No opportunities match your filters.</p>';
        return;
    }

    container.innerHTML = filteredOpportunities.map(opp => `
        <div class="opportunity-card" onclick="viewOpportunity('${opp.id}')">
            <div class="opportunity-card__header">
                <div>
                    <h3 class="opportunity-card__title">${opp.title}</h3>
                    <p class="opportunity-card__company">${opp.company}</p>
                </div>
                <div class="opportunity-card__commission">
                    ${opp.commissionType === 'Fixed' ? `$${opp.commission[0].amount}` : 'Milestone'}
                </div>
            </div>
            <p class="opportunity-card__description">${opp.short}</p>
            <div class="opportunity-card__tags">
                <span class="tag tag--active">${opp.sector}</span>
                <span class="tag">${opp.type}</span>
                ${opp.requirements.map(req => `<span class="tag">${req}</span>`).join('')}
            </div>
            <div class="opportunity-card__meta">
                <span class="badge badge--success">${opp.status}</span>
                <button class="btn btn--primary btn--small" onclick="event.stopPropagation(); applyToOpportunity('${opp.id}')">
                    Apply
                </button>
            </div>
        </div>
    `).join('');
}

// Global functions
window.viewOpportunity = function(opportunityId) {
    location.href = `/pages/campaign.html?id=${opportunityId}`;
};

window.applyToOpportunity = async function(opportunityId) {
    try {
        // Mock application
        showSuccess('Application submitted successfully!');
        
        // In a real app, this would create a campaign record
        setTimeout(() => {
            loadOpportunities();
        }, 1000);
    } catch (error) {
        console.error('Failed to apply to opportunity:', error);
        showError('Failed to submit application');
    }
};

function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    if (successEl) {
        successEl.textContent = message;
        successEl.classList.remove('hidden');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initOpportunities);