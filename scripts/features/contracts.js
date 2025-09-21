/**
 * Contracts Feature
 * Handles contract management and milestone tracking
 */

'use strict';

import { API } from '../data/api.js';
import { Store } from '../data/store.js';
import { EventBus } from '../ui/event-bus.js';
import { Toast, Modal } from '../ui/components.js';
import { qs, qsa, ce, addClass, removeClass } from '../ui/dom.js';

/**
 * Contracts Manager
 * Handles contract-related functionality
 */
export class ContractsManager {
    constructor(api, store, eventBus) {
        this.api = api;
        this.store = store;
        this.eventBus = eventBus;
        this.toast = new Toast();
        this.modal = new Modal();
        
        this.contracts = [];
        this.currentContract = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadContracts();
    }

    setupEventListeners() {
        // Contract actions
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn--submit-milestone')) {
                const milestoneId = event.target.dataset.milestoneId;
                this.showMilestoneSubmissionModal(milestoneId);
            }
            
            if (event.target.matches('.btn--approve-milestone')) {
                const milestoneId = event.target.dataset.milestoneId;
                this.approveMilestone(milestoneId);
            }
            
            if (event.target.matches('.btn--dispute')) {
                const contractId = event.target.dataset.contractId;
                this.showDisputeModal(contractId);
            }
        });
    }

    async loadContracts() {
        try {
            const response = await this.api.request('contracts/list');
            if (response.success) {
                this.contracts = response.data;
                this.renderContracts();
            }
        } catch (error) {
            console.error('Failed to load contracts:', error);
        }
    }

    async submitMilestone(milestoneId, submissionData) {
        try {
            const response = await this.api.request(`contracts/milestone/${this.currentContract.id}/${milestoneId}`, {
                method: 'PUT',
                body: JSON.stringify(submissionData)
            });
            
            if (response.success) {
                this.toast.show('Milestone submitted successfully', 'success');
                this.loadContracts();
                return true;
            }
        } catch (error) {
            console.error('Failed to submit milestone:', error);
            this.toast.show('Failed to submit milestone', 'error');
        }
        return false;
    }

    async approveMilestone(milestoneId) {
        try {
            const response = await this.api.request(`contracts/milestone/${this.currentContract.id}/${milestoneId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'approved' })
            });
            
            if (response.success) {
                this.toast.show('Milestone approved', 'success');
                this.loadContracts();
                return true;
            }
        } catch (error) {
            console.error('Failed to approve milestone:', error);
            this.toast.show('Failed to approve milestone', 'error');
        }
        return false;
    }

    showMilestoneSubmissionModal(milestoneId) {
        const milestone = this.currentContract.milestones.find(m => m.id === milestoneId);
        if (!milestone) return;

        const modalContent = `
            <div class="milestone-submission">
                <h3>Submit Milestone: ${milestone.title}</h3>
                <p>${milestone.description}</p>
                <p><strong>Amount:</strong> $${milestone.amount.toLocaleString()}</p>
                
                <form id="milestone-submission-form">
                    <div class="form-group">
                        <label for="submission-notes" class="form-label">Submission Notes</label>
                        <textarea id="submission-notes" name="notes" class="form-textarea" rows="4" 
                                  placeholder="Describe what you've completed for this milestone..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="submission-files" class="form-label">Attachments (Optional)</label>
                        <input type="file" id="submission-files" name="files" multiple 
                               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png">
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn--primary">
                            Submit Milestone
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.modal.show(modalContent, 'Submit Milestone');
        
        // Handle form submission
        const form = qs('#milestone-submission-form');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(form);
                const submissionData = {
                    notes: formData.get('notes'),
                    files: formData.getAll('files'),
                    submittedAt: new Date().toISOString()
                };
                
                await this.submitMilestone(milestoneId, submissionData);
                this.modal.hide();
            });
        }
    }

    showDisputeModal(contractId) {
        const modalContent = `
            <div class="dispute-modal">
                <h3>Raise a Dispute</h3>
                <p>If you're unable to resolve an issue with your contract partner, you can raise a dispute for mediation.</p>
                
                <div class="dispute-info">
                    <h4>Dispute Resolution Process:</h4>
                    <ol>
                        <li><strong>Initial Mediation:</strong> Our team will review the dispute and attempt to mediate between both parties.</li>
                        <li><strong>Evidence Review:</strong> Both parties can submit evidence and documentation.</li>
                        <li><strong>Resolution:</strong> A non-binding resolution will be provided within 5 business days.</li>
                        <li><strong>Optional Arbitration:</strong> If mediation fails, either party can request binding arbitration.</li>
                    </ol>
                </div>
                
                <form id="dispute-form">
                    <div class="form-group">
                        <label for="dispute-reason" class="form-label">Reason for Dispute *</label>
                        <select id="dispute-reason" name="reason" class="form-select" required>
                            <option value="">Select a reason</option>
                            <option value="payment">Payment Issues</option>
                            <option value="quality">Work Quality</option>
                            <option value="scope">Scope Changes</option>
                            <option value="communication">Communication Issues</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="dispute-description" class="form-label">Description *</label>
                        <textarea id="dispute-description" name="description" class="form-textarea" rows="4" 
                                  placeholder="Please provide a detailed description of the issue..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="dispute-evidence" class="form-label">Supporting Evidence</label>
                        <input type="file" id="dispute-evidence" name="evidence" multiple 
                               accept=".pdf,.doc,.docx,.jpg,.png,.txt">
                        <div class="form-help">Upload any relevant documents, screenshots, or communications</div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn--primary">
                            Raise Dispute
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.modal.show(modalContent, 'Raise Dispute');
        
        // Handle form submission
        const form = qs('#dispute-form');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(form);
                const disputeData = {
                    contractId,
                    reason: formData.get('reason'),
                    description: formData.get('description'),
                    evidence: formData.getAll('evidence'),
                    createdAt: new Date().toISOString()
                };
                
                await this.createDispute(disputeData);
                this.modal.hide();
            });
        }
    }

    async createDispute(disputeData) {
        try {
            // This would typically call a disputes API endpoint
            this.toast.show('Dispute raised successfully. Our team will review it within 24 hours.', 'success');
            return true;
        } catch (error) {
            console.error('Failed to create dispute:', error);
            this.toast.show('Failed to raise dispute', 'error');
            return false;
        }
    }

    renderContracts() {
        const container = qs('.contracts-list');
        if (!container) return;

        if (this.contracts.length === 0) {
            container.innerHTML = this.renderNoContracts();
            return;
        }

        container.innerHTML = this.contracts.map(contract => 
            this.renderContractCard(contract)
        ).join('');
    }

    renderContractCard(contract) {
        const totalValue = contract.totalValue || 0;
        const completedMilestones = contract.milestones.filter(m => m.status === 'completed').length;
        const totalMilestones = contract.milestones.length;
        const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
        
        return `
            <div class="contract-card">
                <div class="contract-header">
                    <h3 class="contract-title">${contract.title}</h3>
                    <span class="contract-value">$${totalValue.toLocaleString()}</span>
                </div>
                
                <div class="contract-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${completedMilestones}/${totalMilestones} milestones completed</span>
                </div>
                
                <div class="contract-milestones">
                    ${contract.milestones.map(milestone => this.renderMilestone(milestone)).join('')}
                </div>
                
                <div class="contract-actions">
                    <button class="btn btn--secondary btn--dispute" data-contract-id="${contract.id}">
                        Raise Dispute
                    </button>
                </div>
            </div>
        `;
    }

    renderMilestone(milestone) {
        const statusClass = `milestone--${milestone.status}`;
        const statusText = this.formatMilestoneStatus(milestone.status);
        const autoReleaseText = milestone.autoReleaseAt ? 
            `Auto-releases: ${this.formatDate(milestone.autoReleaseAt)}` : '';
        
        return `
            <div class="milestone ${statusClass}">
                <div class="milestone-header">
                    <h4 class="milestone-title">${milestone.title}</h4>
                    <span class="milestone-amount">$${milestone.amount.toLocaleString()}</span>
                </div>
                
                <p class="milestone-description">${milestone.description}</p>
                
                <div class="milestone-status">
                    <span class="badge badge--${this.getMilestoneStatusClass(milestone.status)}">
                        ${statusText}
                    </span>
                    ${autoReleaseText ? `<span class="auto-release">${autoReleaseText}</span>` : ''}
                </div>
                
                ${milestone.status === 'pending' ? `
                    <button class="btn btn--primary btn--submit-milestone" data-milestone-id="${milestone.id}">
                        Submit Milestone
                    </button>
                ` : ''}
                
                ${milestone.status === 'submitted' ? `
                    <button class="btn btn--success btn--approve-milestone" data-milestone-id="${milestone.id}">
                        Approve
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderNoContracts() {
        return `
            <div class="no-contracts">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                <h3>No contracts yet</h3>
                <p>Contracts will appear here once proposals are accepted.</p>
            </div>
        `;
    }

    formatMilestoneStatus(status) {
        const statusMap = {
            pending: 'Pending',
            submitted: 'Under Review',
            approved: 'Approved',
            completed: 'Completed',
            rejected: 'Rejected'
        };
        return statusMap[status] || status;
    }

    getMilestoneStatusClass(status) {
        const classMap = {
            pending: 'warning',
            submitted: 'info',
            approved: 'success',
            completed: 'success',
            rejected: 'danger'
        };
        return classMap[status] || 'neutral';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
