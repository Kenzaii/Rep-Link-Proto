/**
 * Dashboard Feature
 * Handles dashboard data and widgets
 */

'use strict';

import { API } from '../data/api.js';
import { Store } from '../data/store.js';
import { EventBus } from '../ui/event-bus.js';
import { Toast } from '../ui/components.js';
import { qs, qsa, ce, addClass, removeClass } from '../ui/dom.js';

/**
 * Dashboard Manager
 * Handles dashboard functionality
 */
export class DashboardManager {
    constructor(api, store, eventBus) {
        this.api = api;
        this.store = store;
        this.eventBus = eventBus;
        this.toast = new Toast();
        
        this.dashboardData = {};
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.currentUser = this.store.get('auth.user');
        this.setupEventListeners();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // Refresh dashboard
        const refreshBtn = qs('.btn--refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }

        // Quick actions
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn--quick-action')) {
                const action = event.target.dataset.action;
                this.handleQuickAction(action);
            }
        });
    }

    async loadDashboardData() {
        try {
            if (this.currentUser?.role === 'rep') {
                await this.loadRepDashboard();
            } else if (this.currentUser?.role === 'business') {
                await this.loadBusinessDashboard();
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.toast.show('Failed to load dashboard data', 'error');
        }
    }

    async loadRepDashboard() {
        try {
            // Load rep-specific data
            const [opportunities, proposals, contracts, messages] = await Promise.all([
                this.api.request('opportunities/list'),
                this.api.request('proposals/list', { query: { repId: this.currentUser.id } }),
                this.api.request('contracts/list', { query: { repId: this.currentUser.id } }),
                this.api.request('messages/list', { query: { repId: this.currentUser.id } })
            ]);

            this.dashboardData = {
                opportunities: opportunities.success ? opportunities.data : [],
                proposals: proposals.success ? proposals.data : [],
                contracts: contracts.success ? contracts.data : [],
                messages: messages.success ? messages.data : []
            };

            this.renderRepDashboard();
        } catch (error) {
            console.error('Failed to load rep dashboard:', error);
        }
    }

    async loadBusinessDashboard() {
        try {
            // Load business-specific data
            const [opportunities, proposals, contracts, messages] = await Promise.all([
                this.api.request('opportunities/list', { query: { businessId: this.currentUser.id } }),
                this.api.request('proposals/list', { query: { businessId: this.currentUser.id } }),
                this.api.request('contracts/list', { query: { businessId: this.currentUser.id } }),
                this.api.request('messages/list', { query: { businessId: this.currentUser.id } })
            ]);

            this.dashboardData = {
                opportunities: opportunities.success ? opportunities.data : [],
                proposals: proposals.success ? proposals.data : [],
                contracts: contracts.success ? contracts.data : [],
                messages: messages.success ? messages.data : []
            };

            this.renderBusinessDashboard();
        } catch (error) {
            console.error('Failed to load business dashboard:', error);
        }
    }

    renderRepDashboard() {
        const container = qs('.dashboard-content');
        if (!container) return;

        const stats = this.calculateRepStats();
        
        container.innerHTML = `
            <div class="dashboard-header">
                <h1>Sales Rep Dashboard</h1>
                <p>Welcome back, ${this.currentUser.name}!</p>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>$${stats.totalEarned.toLocaleString()}</h3>
                        <p>Total Commission Earned</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>$${stats.pendingEarnings.toLocaleString()}</h3>
                        <p>Pending Earnings</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.activeContracts}</h3>
                        <p>Active Contracts</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.unreadMessages}</h3>
                        <p>Unread Messages</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-widgets">
                <div class="widget">
                    <h3>Recent Opportunities</h3>
                    <div class="opportunities-list">
                        ${this.renderRecentOpportunities()}
                    </div>
                </div>
                
                <div class="widget">
                    <h3>Active Contracts</h3>
                    <div class="contracts-list">
                        ${this.renderActiveContracts()}
                    </div>
                </div>
            </div>
            
            <div class="singpass-section">
                <h3>Personal Details from Singpass</h3>
                <div class="singpass-data">
                    <div class="data-item">
                        <label>Name:</label>
                        <span>${this.currentUser.singpass?.name || 'Not available'}</span>
                    </div>
                    <div class="data-item">
                        <label>NRIC (Masked):</label>
                        <span>${this.currentUser.singpass?.uin_masked || 'Not available'}</span>
                    </div>
                    <div class="data-item">
                        <label>Phone:</label>
                        <span>${this.currentUser.phone || 'Not available'}</span>
                    </div>
                    <div class="data-item">
                        <label>Email:</label>
                        <span>${this.currentUser.email || 'Not available'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderBusinessDashboard() {
        const container = qs('.dashboard-content');
        if (!container) return;

        const stats = this.calculateBusinessStats();
        
        container.innerHTML = `
            <div class="dashboard-header">
                <h1>Business Dashboard</h1>
                <p>Welcome back, ${this.currentUser.name}!</p>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.activeListings}</h3>
                        <p>Active Listings</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalApplicants}</h3>
                        <p>Total Applicants</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>$${stats.totalSpent.toLocaleString()}</h3>
                        <p>Total Spent</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.unreadMessages}</h3>
                        <p>Unread Messages</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-widgets">
                <div class="widget">
                    <h3>Recent Proposals</h3>
                    <div class="proposals-list">
                        ${this.renderRecentProposals()}
                    </div>
                </div>
                
                <div class="widget">
                    <h3>Active Contracts</h3>
                    <div class="contracts-list">
                        ${this.renderActiveContracts()}
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button class="btn btn--primary btn--quick-action" data-action="post-opportunity">
                        Post New Opportunity
                    </button>
                    <button class="btn btn--secondary btn--quick-action" data-action="view-proposals">
                        View All Proposals
                    </button>
                    <button class="btn btn--secondary btn--quick-action" data-action="view-contracts">
                        View All Contracts
                    </button>
                </div>
            </div>
        `;
    }

    calculateRepStats() {
        const contracts = this.dashboardData.contracts || [];
        const messages = this.dashboardData.messages || [];
        
        const totalEarned = contracts.reduce((sum, contract) => {
            return sum + contract.milestones
                .filter(m => m.status === 'completed')
                .reduce((milestoneSum, milestone) => milestoneSum + milestone.amount, 0);
        }, 0);
        
        const pendingEarnings = contracts.reduce((sum, contract) => {
            return sum + contract.milestones
                .filter(m => m.status === 'submitted')
                .reduce((milestoneSum, milestone) => milestoneSum + milestone.amount, 0);
        }, 0);
        
        const activeContracts = contracts.filter(c => c.status === 'active').length;
        const unreadMessages = messages.filter(m => !m.read).length;
        
        return {
            totalEarned,
            pendingEarnings,
            activeContracts,
            unreadMessages
        };
    }

    calculateBusinessStats() {
        const opportunities = this.dashboardData.opportunities || [];
        const proposals = this.dashboardData.proposals || [];
        const contracts = this.dashboardData.contracts || [];
        const messages = this.dashboardData.messages || [];
        
        const activeListings = opportunities.filter(o => o.status === 'active').length;
        const totalApplicants = proposals.length;
        
        const totalSpent = contracts.reduce((sum, contract) => {
            return sum + contract.milestones
                .filter(m => m.status === 'completed')
                .reduce((milestoneSum, milestone) => milestoneSum + milestone.amount, 0);
        }, 0);
        
        const unreadMessages = messages.filter(m => !m.read).length;
        
        return {
            activeListings,
            totalApplicants,
            totalSpent,
            unreadMessages
        };
    }

    renderRecentOpportunities() {
        const opportunities = (this.dashboardData.opportunities || []).slice(0, 5);
        
        if (opportunities.length === 0) {
            return '<p>No recent opportunities</p>';
        }
        
        return opportunities.map(opp => `
            <div class="opportunity-item">
                <h4>${opp.title}</h4>
                <p>${opp.category} • ${opp.location}</p>
                <span class="opportunity-status status--${opp.status}">${opp.status}</span>
            </div>
        `).join('');
    }

    renderRecentProposals() {
        const proposals = (this.dashboardData.proposals || []).slice(0, 5);
        
        if (proposals.length === 0) {
            return '<p>No recent proposals</p>';
        }
        
        return proposals.map(proposal => `
            <div class="proposal-item">
                <h4>${proposal.cover.substring(0, 50)}...</h4>
                <p>Status: <span class="proposal-status status--${proposal.status}">${proposal.status}</span></p>
            </div>
        `).join('');
    }

    renderActiveContracts() {
        const contracts = (this.dashboardData.contracts || []).filter(c => c.status === 'active').slice(0, 5);
        
        if (contracts.length === 0) {
            return '<p>No active contracts</p>';
        }
        
        return contracts.map(contract => {
            const completedMilestones = contract.milestones.filter(m => m.status === 'completed').length;
            const totalMilestones = contract.milestones.length;
            const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
            
            return `
                <div class="contract-item">
                    <h4>${contract.title}</h4>
                    <div class="contract-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span>${completedMilestones}/${totalMilestones} milestones</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    handleQuickAction(action) {
        switch (action) {
            case 'post-opportunity':
                window.location.href = 'post-opportunity.html';
                break;
            case 'view-proposals':
                window.location.href = 'proposals.html';
                break;
            case 'view-contracts':
                window.location.href = 'contracts.html';
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    }
}
