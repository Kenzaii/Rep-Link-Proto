/**
 * Campaign Page
 * View campaign details and milestones
 */

import { api } from '../data/api.js';
import { requireAuth } from './guards.js';

export function initCampaign() {
    // Check authentication
    if (!requireAuth()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const opportunityId = urlParams.get('id');
    
    if (!opportunityId) {
        showError('No opportunity ID provided');
        return;
    }

    loadCampaignDetails(opportunityId);
}

async function loadCampaignDetails(opportunityId) {
    try {
        const opportunities = await api.opportunities();
        const opportunity = opportunities.find(opp => opp.id === opportunityId);
        
        if (!opportunity) {
            showError('Opportunity not found');
            return;
        }

        renderCampaignDetails(opportunity);
    } catch (error) {
        console.error('Failed to load campaign details:', error);
        showError('Failed to load campaign details');
    }
}

function renderCampaignDetails(opportunity) {
    const container = document.getElementById('campaign-details');
    if (!container) return;

    container.innerHTML = `
        <div class="campaign-header">
            <div class="campaign-header__info">
                <h1 class="campaign-title">${opportunity.title}</h1>
                <p class="campaign-company">${opportunity.company}</p>
                <div class="campaign-tags">
                    <span class="badge badge--info">${opportunity.sector}</span>
                    <span class="badge badge--neutral">${opportunity.type}</span>
                    <span class="badge badge--success">${opportunity.status}</span>
                </div>
            </div>
            <div class="campaign-header__actions">
                <button id="apply-btn" class="btn btn--primary btn--large">Apply to Campaign</button>
            </div>
        </div>

        <div class="campaign-content">
            <div class="campaign-section">
                <h2>Description</h2>
                <p class="campaign-description">${opportunity.short}</p>
            </div>

            <div class="campaign-section">
                <h2>Commission Structure</h2>
                <div class="commission-info">
                    <div class="commission-type">
                        <strong>Type:</strong> ${opportunity.commissionType}
                    </div>
                    ${opportunity.commissionType === 'Milestone' ? `
                        <div class="milestones-list">
                            <h3>Milestones</h3>
                            ${opportunity.commission.map(milestone => `
                                <div class="milestone-item">
                                    <div class="milestone-info">
                                        <span class="milestone-name">${milestone.name}</span>
                                        <span class="milestone-amount">$${milestone.amount}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="fixed-commission">
                            <div class="commission-amount">$${opportunity.commission[0].amount}</div>
                            <div class="commission-label">Fixed Commission</div>
                        </div>
                    `}
                </div>
            </div>

            <div class="campaign-section">
                <h2>Requirements</h2>
                <ul class="requirements-list">
                    ${opportunity.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    // Setup apply button
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => applyToCampaign(opportunity.id));
    }
}

async function applyToCampaign(opportunityId) {
    try {
        // Mock application
        showSuccess('Application submitted successfully! You will be notified when the business reviews your application.');
        
        // Disable apply button
        const applyBtn = document.getElementById('apply-btn');
        if (applyBtn) {
            applyBtn.textContent = 'Application Submitted';
            applyBtn.disabled = true;
            applyBtn.classList.remove('btn--primary');
            applyBtn.classList.add('btn--secondary');
        }
    } catch (error) {
        console.error('Failed to apply to campaign:', error);
        showError('Failed to submit application');
    }
}

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
document.addEventListener('DOMContentLoaded', initCampaign);
