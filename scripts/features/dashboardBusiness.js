/**
 * Business Dashboard Module
 * Handles the business dashboard functionality
 */

'use strict';

import { API } from '../data/api.js';
import { store } from '../data/store.js';
import { Toast } from '../ui/components.js';
import { currentUser, isAuthed } from '../app.js';

class BusinessDashboard {
    constructor() {
        this.api = new API();
        this.toast = new Toast();
        this.data = null;
        this.init();
    }

    async init() {
        try {
            // Check authentication
            this.checkAuth();
            
            // Load dashboard data
            await this.loadData();
            
            // Render dashboard
            this.renderDashboard();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize business dashboard:', error);
            this.toast.show('Failed to load dashboard data', 'error');
        }
    }

    checkAuth() {
        if (!isAuthed() || currentUser()?.role !== 'business') {
            // For demo purposes, allow access but show a warning
            console.warn('User not authenticated as business, but allowing access for demo');
            return;
        }
    }

    async loadData() {
        try {
            const response = await fetch('/mock/dashboard_business.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            throw error;
        }
    }

    renderDashboard() {
        this.renderSalesReps();
        this.renderProducts();
        this.renderRequests();
        this.renderApprovals();
    }

    renderSalesReps() {
        const container = document.getElementById('repsGrid');
        if (!container) return;

        const reps = this.data.reps;
        container.innerHTML = reps.map(rep => `
            <div class="rep-card">
                <button class="rep-card__star" aria-label="Mark priority" data-rep-id="${rep.id}">
                    ${rep.star ? '★' : '☆'}
                </button>
                <img class="avatar" src="${rep.avatar}" alt="${rep.name}" loading="lazy">
                <div class="rep-card__name">${rep.name}</div>
                <div class="rep-card__role">${rep.productLine}</div>
                <div class="rep-card__sales">Sales this month <strong>${rep.sales}</strong></div>
            </div>
        `).join('');
    }

    renderProducts() {
        const container = document.getElementById('productList');
        if (!container) return;

        const products = this.data.products;
        container.innerHTML = products.map(product => `
            <li class="product">
                <div class="thumb"></div>
                <div class="meta">
                    <div class="name">${product.name}</div>
                    <div class="sub">${product.commission}% • SGD ${product.price}</div>
                </div>
                <span class="trend ${product.delta >= 0 ? 'positive' : 'negative'}">${product.delta}%</span>
                <span class="pill ${product.status === 'Active' ? 'pill--active' : 'pill--pending'}">
                    ${product.status}
                </span>
            </li>
        `).join('');
    }

    renderRequests() {
        const container = document.getElementById('requestList');
        if (!container) return;

        const requests = this.data.requests;
        container.innerHTML = requests.map(request => `
            <div class="mini-card">
                <img class="avatar" src="${request.avatar}" alt="${request.name}" loading="lazy">
                <div class="meta">
                    <div class="name">${request.name}</div>
                </div>
                <div class="actions">
                    <button class="btn btn--success" data-approve="${request.id}">Approve</button>
                    <button class="btn btn--secondary" data-decline="${request.id}">Decline</button>
                </div>
            </div>
        `).join('');
    }

    renderApprovals() {
        const container = document.getElementById('approvalList');
        if (!container) return;

        const approvals = this.data.productApprovals;
        container.innerHTML = approvals.map(approval => `
            <div class="mini-card">
                <img class="avatar" src="${approval.avatar}" alt="${approval.name}" loading="lazy">
                <div class="meta">
                    <div class="name">${approval.name}</div>
                </div>
                <div class="actions">
                    <button class="btn btn--success" data-approve="${approval.id}">Approve</button>
                    <button class="btn btn--secondary" data-decline="${approval.id}">Decline</button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Star buttons for sales reps
        document.addEventListener('click', (e) => {
            const starButton = e.target.closest('.rep-card__star');
            if (starButton) {
                const repId = starButton.dataset.repId;
                this.toggleStar(repId, starButton);
            }
        });

        // Approve/Decline buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-approve], [data-decline]');
            if (button) {
                const id = button.dataset.approve || button.dataset.decline;
                const action = button.dataset.approve ? 'approve' : 'decline';
                this.handleApprovalAction(id, action, button);
            }
        });

        // Product management buttons
        const uploadBtn = document.getElementById('btnUpload');
        const editBtn = document.getElementById('btnEdit');
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.handleUploadProduct();
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.handleEditProducts();
            });
        }

        // Chat button
        const chatButton = document.querySelector('.fab-chat');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                this.openChat();
            });
        }

        // Logout button is handled by Header component
    }

    toggleStar(repId, button) {
        const rep = this.data.reps.find(r => r.id === repId);
        if (!rep) return;

        rep.star = !rep.star;
        button.textContent = rep.star ? '★' : '☆';
        
        const action = rep.star ? 'marked as priority' : 'removed from priority';
        this.toast.show(`${rep.name} ${action}`, 'info');
    }

    handleApprovalAction(id, action, button) {
        const card = button.closest('.mini-card');
        const name = card.querySelector('.name').textContent;
        
        // Optimistic update
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        
        // Simulate API call
        setTimeout(() => {
            card.remove();
            this.toast.show(`${name} ${action}d successfully`, 'success');
        }, 1000);
    }

    handleUploadProduct() {
        this.toast.show('Product upload feature coming soon!', 'info');
        // In a real app, this would open a product upload modal
    }

    handleEditProducts() {
        this.toast.show('Product editing feature coming soon!', 'info');
        // In a real app, this would open a product management page
    }

    openChat() {
        // For prototype, just show a toast
        this.toast.show('Chat feature coming soon!', 'info');
        
        // In a real app, this would open a chat modal or navigate to messages
        // window.location.href = 'messages.html';
    }

}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BusinessDashboard();
});
