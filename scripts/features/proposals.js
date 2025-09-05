/**
 * Proposals Feature
 * Handles proposal creation, management, and status updates
 */

'use strict';

import { API } from '../data/api.js';
import { Store } from '../data/store.js';
import { EventBus } from '../ui/event-bus.js';
import { Toast, Modal } from '../ui/components.js';
import { qs, qsa, ce, addClass, removeClass } from '../ui/dom.js';

/**
 * Proposals Manager
 * Handles proposal-related functionality
 */
export class ProposalsManager {
    constructor(api, store, eventBus) {
        this.api = api;
        this.store = store;
        this.eventBus = eventBus;
        this.toast = new Toast();
        this.modal = new Modal();
        
        this.proposals = [];
        this.currentOpportunity = null;
        
        this.init();
    }

    /**
     * Initialize proposals manager
     */
    init() {
        this.setupEventListeners();
        this.loadProposals();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Proposal submission
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn--apply') || event.target.closest('.btn--apply')) {
                const opportunityId = event.target.dataset.opportunityId || 
                                    event.target.closest('[data-opportunity-id]')?.dataset.opportunityId;
                if (opportunityId) {
                    this.showProposalModal(opportunityId);
                }
            }
        });

        // Proposal status updates
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn--accept-proposal')) {
                const proposalId = event.target.dataset.proposalId;
                if (proposalId) {
                    this.acceptProposal(proposalId);
                }
            }
            
            if (event.target.matches('.btn--reject-proposal')) {
                const proposalId = event.target.dataset.proposalId;
                if (proposalId) {
                    this.rejectProposal(proposalId);
                }
            }
        });
    }

    /**
     * Load proposals from API
     */
    async loadProposals() {
        try {
            const response = await this.api.request('proposals/list');
            if (response.success) {
                this.proposals = response.data;
                this.renderProposals();
            }
        } catch (error) {
            console.error('Failed to load proposals:', error);
            this.toast.show('Failed to load proposals', 'error');
        }
    }

    /**
     * Show proposal submission modal
     */
    async showProposalModal(opportunityId) {
        try {
            // Load opportunity details
            const oppResponse = await this.api.request(`opportunities/get/${opportunityId}`);
            if (!oppResponse.success) {
                throw new Error('Failed to load opportunity details');
            }
            
            this.currentOpportunity = oppResponse.data;
            
            const modalContent = this.createProposalModalContent();
            this.modal.show(modalContent, 'Submit Proposal');
            
        } catch (error) {
            console.error('Failed to show proposal modal:', error);
            this.toast.show('Failed to load opportunity details', 'error');
        }
    }

    /**
     * Create proposal modal content
     */
    createProposalModalContent() {
        const opportunity = this.currentOpportunity;
        const commissionText = this.formatCommission(opportunity.commission);
        
        return `
            <div class="proposal-modal">
                <div class="opportunity-summary">
                    <h3>${opportunity.title}</h3>
                    <p class="commission-info">Commission: ${commissionText}</p>
                    <p class="opportunity-brief">${opportunity.brief}</p>
                </div>
                
                <form id="proposal-form" class="proposal-form">
                    <input type="hidden" name="oppId" value="${opportunity.id}">
                    
                    <div class="form-group">
                        <label for="cover-letter" class="form-label">Cover Letter *</label>
                        <textarea 
                            id="cover-letter" 
                            name="cover" 
                            class="form-textarea" 
                            rows="6" 
                            placeholder="Explain why you're the right fit for this opportunity. Highlight your relevant experience and approach."
                            required
                        ></textarea>
                        <div class="form-help">Minimum 100 characters</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Terms & Availability</label>
                        <div class="terms-grid">
                            <div class="form-group">
                                <label for="availability" class="form-label">Availability</label>
                                <select id="availability" name="availability" class="form-select" required>
                                    <option value="">Select availability</option>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="project-based">Project-based</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="start-date" class="form-label">Start Date</label>
                                <input 
                                    type="date" 
                                    id="start-date" 
                                    name="startDate" 
                                    class="form-input" 
                                    required
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="duration" class="form-label">Estimated Duration</label>
                                <select id="duration" name="duration" class="form-select" required>
                                    <option value="">Select duration</option>
                                    <option value="1-2 weeks">1-2 weeks</option>
                                    <option value="1 month">1 month</option>
                                    <option value="2-3 months">2-3 months</option>
                                    <option value="3-6 months">3-6 months</option>
                                    <option value="6+ months">6+ months</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Attachments (Optional)</label>
                        <div class="file-upload">
                            <input type="file" id="attachments" name="attachments" multiple accept=".pdf,.doc,.docx,.txt">
                            <label for="attachments" class="file-upload-label">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14,2 14,8 20,8"></polyline>
                                </svg>
                                Choose files or drag and drop
                            </label>
                            <div class="file-list"></div>
                        </div>
                        <div class="form-help">PDF, DOC, DOCX, TXT files only. Max 10MB per file.</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="commissionAcceptance" required>
                            <span class="checkmark"></span>
                            I accept the commission structure and terms for this opportunity
                        </label>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn--primary">
                            Submit Proposal
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Submit proposal
     */
    async submitProposal(formData) {
        try {
            const response = await this.api.request('proposals/create', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            if (response.success) {
                this.toast.show('Proposal submitted successfully!', 'success');
                this.modal.hide();
                this.loadProposals(); // Refresh proposals list
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to submit proposal');
            }
        } catch (error) {
            console.error('Failed to submit proposal:', error);
            this.toast.show(error.message || 'Failed to submit proposal', 'error');
            return null;
        }
    }

    /**
     * Accept proposal
     */
    async acceptProposal(proposalId) {
        try {
            const response = await this.api.request(`proposals/update/${proposalId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'accepted' })
            });
            
            if (response.success) {
                this.toast.show('Proposal accepted successfully', 'success');
                this.loadProposals(); // Refresh proposals list
                
                // Create contract
                await this.createContractFromProposal(proposalId);
                
                return true;
            } else {
                throw new Error(response.error || 'Failed to accept proposal');
            }
        } catch (error) {
            console.error('Failed to accept proposal:', error);
            this.toast.show(error.message || 'Failed to accept proposal', 'error');
            return false;
        }
    }

    /**
     * Reject proposal
     */
    async rejectProposal(proposalId) {
        try {
            const response = await this.api.request(`proposals/update/${proposalId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'rejected' })
            });
            
            if (response.success) {
                this.toast.show('Proposal rejected', 'info');
                this.loadProposals(); // Refresh proposals list
                return true;
            } else {
                throw new Error(response.error || 'Failed to reject proposal');
            }
        } catch (error) {
            console.error('Failed to reject proposal:', error);
            this.toast.show(error.message || 'Failed to reject proposal', 'error');
            return false;
        }
    }

    /**
     * Create contract from accepted proposal
     */
    async createContractFromProposal(proposalId) {
        try {
            const proposal = this.proposals.find(p => p.id === proposalId);
            if (!proposal) {
                throw new Error('Proposal not found');
            }
            
            const opportunity = this.currentOpportunity;
            if (!opportunity) {
                throw new Error('Opportunity not found');
            }
            
            const contractData = {
                oppId: opportunity.id,
                repId: proposal.repId,
                businessId: opportunity.businessId,
                type: opportunity.commissionType,
                title: opportunity.title,
                milestones: opportunity.commission.milestones || [],
                totalValue: this.calculateTotalValue(opportunity.commission)
            };
            
            const response = await this.api.request('contracts/create', {
                method: 'POST',
                body: JSON.stringify(contractData)
            });
            
            if (response.success) {
                this.toast.show('Contract created successfully', 'success');
                this.eventBus.emit('contract:created', response.data);
            }
        } catch (error) {
            console.error('Failed to create contract:', error);
            this.toast.show('Failed to create contract', 'error');
        }
    }

    /**
     * Render proposals list
     */
    renderProposals() {
        const container = qs('.proposals-list');
        if (!container) return;

        if (this.proposals.length === 0) {
            container.innerHTML = this.renderNoProposals();
            return;
        }

        container.innerHTML = this.proposals.map(proposal => 
            this.renderProposalCard(proposal)
        ).join('');
    }

    /**
     * Render proposal card
     */
    renderProposalCard(proposal) {
        const opportunity = this.getOpportunityById(proposal.oppId);
        const rep = this.getRepById(proposal.repId);
        const statusClass = `proposal--${proposal.status}`;
        
        return `
            <div class="proposal-card ${statusClass}">
                <div class="proposal-header">
                    <div class="proposal-info">
                        <h3 class="proposal-title">${opportunity?.title || 'Unknown Opportunity'}</h3>
                        <p class="proposal-rep">by ${rep?.name || 'Unknown Rep'}</p>
                    </div>
                    <div class="proposal-status">
                        <span class="badge badge--${this.getStatusBadgeClass(proposal.status)}">
                            ${this.formatStatus(proposal.status)}
                        </span>
                    </div>
                </div>
                
                <div class="proposal-content">
                    <p class="proposal-cover">${proposal.cover}</p>
                    
                    <div class="proposal-terms">
                        <div class="term-item">
                            <strong>Availability:</strong> ${proposal.terms.availability}
                        </div>
                        <div class="term-item">
                            <strong>Start Date:</strong> ${this.formatDate(proposal.terms.startDate)}
                        </div>
                        <div class="term-item">
                            <strong>Duration:</strong> ${proposal.terms.estimatedDuration}
                        </div>
                    </div>
                    
                    ${proposal.attachments && proposal.attachments.length > 0 ? `
                        <div class="proposal-attachments">
                            <strong>Attachments:</strong>
                            <ul>
                                ${proposal.attachments.map(attachment => 
                                    `<li><a href="#" class="attachment-link">${attachment.name}</a></li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="proposal-actions">
                    <div class="proposal-meta">
                        <span>Submitted: ${this.formatDate(proposal.submittedAt)}</span>
                    </div>
                    
                    ${proposal.status === 'pending' ? `
                        <div class="proposal-buttons">
                            <button class="btn btn--secondary btn--reject-proposal" data-proposal-id="${proposal.id}">
                                Reject
                            </button>
                            <button class="btn btn--primary btn--accept-proposal" data-proposal-id="${proposal.id}">
                                Accept
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render no proposals message
     */
    renderNoProposals() {
        return `
            <div class="no-proposals">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                <h3>No proposals yet</h3>
                <p>Proposals will appear here once they are submitted.</p>
            </div>
        `;
    }

    /**
     * Get opportunity by ID
     */
    getOpportunityById(opportunityId) {
        const opportunities = this.store.get('opportunities', []);
        return opportunities.find(opp => opp.id === opportunityId);
    }

    /**
     * Get rep by ID
     */
    getRepById(repId) {
        const users = this.store.get('users', []);
        return users.find(user => user.id === repId && user.role === 'rep');
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            pending: 'warning',
            accepted: 'success',
            rejected: 'danger',
            withdrawn: 'neutral'
        };
        return statusClasses[status] || 'neutral';
    }

    /**
     * Format status
     */
    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
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
     * Calculate total value
     */
    calculateTotalValue(commission) {
        if (commission.structure === 'fixed') {
            return commission.amount;
        } else if (commission.structure === 'milestone') {
            return commission.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
        }
        return 0;
    }

    /**
     * Format date display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Get proposals by opportunity ID
     */
    async getProposalsByOpportunity(opportunityId) {
        try {
            const response = await this.api.request('proposals/list', {
                query: { oppId: opportunityId }
            });
            
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load opportunity proposals:', error);
        }
        return [];
    }

    /**
     * Get proposals by rep ID
     */
    async getProposalsByRep(repId) {
        try {
            const response = await this.api.request('proposals/list', {
                query: { repId }
            });
            
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load rep proposals:', error);
        }
        return [];
    }
}
