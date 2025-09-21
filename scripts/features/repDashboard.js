/**
 * Rep Dashboard
 * Sales rep dashboard with KPIs, opportunities, and campaigns
 */

import { api } from '../data/api.js';
import { store } from '../data/store.js';
import { requireRep } from './guards.js';

export function initRepDashboard() {
    // Check authentication
    if (!requireRep()) return;

    loadDashboardData();
    setupEventListeners();
}

async function loadDashboardData() {
    try {
        const [campaigns, opportunities] = await Promise.all([
            api.campaigns(),
            api.opportunities()
        ]);

        const auth = store.get('auth');
        const repId = auth.user.id;

        // Filter campaigns for this rep
        const repCampaigns = campaigns.filter(c => c.repId === repId);
        
        // Calculate KPIs
        const kpis = calculateKPIs(repCampaigns);
        
        // Render dashboard
        renderKPIs(kpis);
        renderCurrentOpportunities(opportunities);
        renderSignedCampaigns(repCampaigns);
        renderSalesTracker(repCampaigns);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

function calculateKPIs(campaigns) {
    let totalSales = 0;
    let dealsClosed = 0;
    let commissionsEarned = 0;
    let commissionsPending = 0;

    campaigns.forEach(campaign => {
        campaign.milestones.forEach(milestone => {
            if (milestone.status === 'released') {
                commissionsEarned += milestone.amount;
                totalSales += milestone.amount;
            } else if (milestone.status === 'pending') {
                commissionsPending += milestone.amount;
            }
        });
        
        if (campaign.status === 'active') {
            dealsClosed++;
        }
    });

    return {
        totalSales,
        dealsClosed,
        commissionsEarned,
        commissionsPending
    };
}

function renderKPIs(kpis) {
    const kpiContainer = document.getElementById('kpi-cards');
    if (!kpiContainer) return;

    kpiContainer.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-value">$${kpis.totalSales.toLocaleString()}</div>
            <div class="kpi-label">Total Sales</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${kpis.dealsClosed}</div>
            <div class="kpi-label">Deals Closed</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">$${kpis.commissionsEarned.toLocaleString()}</div>
            <div class="kpi-label">Commissions Earned</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">$${kpis.commissionsPending.toLocaleString()}</div>
            <div class="kpi-label">Pending</div>
        </div>
    `;
}

function renderCurrentOpportunities(opportunities) {
    const container = document.getElementById('current-opportunities');
    if (!container) return;

    const openOpportunities = opportunities.filter(opp => opp.status === 'open');
    
    if (openOpportunities.length === 0) {
        container.innerHTML = '<p class="text-muted">No current opportunities available.</p>';
        return;
    }

    container.innerHTML = openOpportunities.map(opp => `
        <div class="opportunity-card">
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
                ${opp.requirements.map(req => `<span class="tag">${req}</span>`).join('')}
            </div>
            <div class="opportunity-card__meta">
                <span class="badge badge--info">${opp.sector}</span>
                <button class="btn btn--primary btn--small" onclick="applyToOpportunity('${opp.id}')">
                    Apply
                </button>
            </div>
        </div>
    `).join('');
}

function renderSignedCampaigns(campaigns) {
    const container = document.getElementById('signed-campaigns');
    if (!container) return;

    if (campaigns.length === 0) {
        container.innerHTML = '<p class="text-muted">No signed campaigns yet.</p>';
        return;
    }

    container.innerHTML = campaigns.map(campaign => {
        const paidMilestones = campaign.milestones.filter(m => m.status === 'released');
        const pendingMilestones = campaign.milestones.filter(m => m.status === 'pending');
        
        return `
            <div class="campaign-card">
                <div class="campaign-card__header">
                    <h3 class="campaign-card__title">Campaign ${campaign.id}</h3>
                    <span class="badge badge--${campaign.status === 'active' ? 'success' : 'warning'}">${campaign.status}</span>
                </div>
                <div class="campaign-card__milestones">
                    <h4>Milestones</h4>
                    ${campaign.milestones.map(milestone => `
                        <div class="milestone-item">
                            <span class="milestone-name">${milestone.name}</span>
                            <span class="milestone-amount">$${milestone.amount}</span>
                            <span class="badge badge--${milestone.status === 'released' ? 'success' : 'warning'}">${milestone.status}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="campaign-card__summary">
                    <div class="summary-item">
                        <span class="summary-label">Paid:</span>
                        <span class="summary-value">$${paidMilestones.reduce((sum, m) => sum + m.amount, 0)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Pending:</span>
                        <span class="summary-value">$${pendingMilestones.reduce((sum, m) => sum + m.amount, 0)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSalesTracker(campaigns) {
    const container = document.getElementById('sales-tracker');
    if (!container) return;

    const salesItems = campaigns.flatMap(campaign => 
        campaign.milestones.map(milestone => ({
            ...milestone,
            campaignId: campaign.id,
            status: milestone.status === 'released' ? 'Completed' : 
                   milestone.status === 'pending' ? 'Pending payment' : 'Pending delivery verification'
        }))
    );

    if (salesItems.length === 0) {
        container.innerHTML = '<p class="text-muted">No sales tracked yet.</p>';
        return;
    }

    container.innerHTML = salesItems.map(item => `
        <div class="sales-item">
            <div class="sales-item__info">
                <h4 class="sales-item__title">${item.name}</h4>
                <p class="sales-item__campaign">Campaign ${item.campaignId}</p>
            </div>
            <div class="sales-item__amount">$${item.amount}</div>
            <div class="sales-item__status">
                <span class="badge badge--${item.status === 'Completed' ? 'success' : 'warning'}">${item.status}</span>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Quick links
    const trainingLink = document.getElementById('training-link');
    const agreementsLink = document.getElementById('agreements-link');
    const profileLink = document.getElementById('profile-link');

    if (trainingLink) {
        trainingLink.addEventListener('click', () => {
            showInfo('Training materials will be available soon!');
        });
    }

    if (agreementsLink) {
        agreementsLink.addEventListener('click', () => {
            showInfo('Agreements section coming soon!');
        });
    }

    if (profileLink) {
        profileLink.addEventListener('click', () => {
            location.href = '/pages/rep-profile.html';
        });
    }
}

// Global function for opportunity application
window.applyToOpportunity = async function(opportunityId) {
    try {
        // Mock application - in real app this would create a campaign
        showSuccess('Application submitted successfully!');
        
        // Refresh opportunities list
        setTimeout(() => {
            loadDashboardData();
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

function showInfo(message) {
    alert(message); // Simple alert for now
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initRepDashboard);
