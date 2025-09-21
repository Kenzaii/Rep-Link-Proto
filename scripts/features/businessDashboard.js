/**
 * Business Dashboard
 * Business dashboard with products, requests, and onboarding
 */

import { api } from '../data/api.js';
import { store } from '../data/store.js';
import { requireBusiness } from './guards.js';

let mockApplications = []; // In-memory storage for prototype

export function initBusinessDashboard() {
    // Check authentication
    if (!requireBusiness()) return;

    loadDashboardData();
    setupEventListeners();
}

async function loadDashboardData() {
    try {
        const [products, onboarding, campaigns] = await Promise.all([
            api.products(),
            api.onboarding(),
            api.campaigns()
        ]);

        const auth = store.get('auth');
        const businessId = auth.user.id;

        // Filter data for this business
        const businessProducts = products.filter(p => p.businessId === businessId);
        const businessOnboarding = onboarding.filter(o => o.businessId === businessId);
        const businessCampaigns = campaigns.filter(c => c.businessId === businessId);
        
        // Render dashboard sections
        renderProducts(businessProducts);
        renderRequestsApprovals();
        renderOnboarding(businessOnboarding);
        renderPayments(businessCampaigns);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-section');
    if (!container) return;

    container.innerHTML = `
        <div class="section-header">
            <h3>Products</h3>
            <button id="add-product-btn" class="btn btn--primary btn--small">Add Product</button>
        </div>
        <div id="products-list" class="products-grid">
            ${products.map(product => `
                <div class="product-card">
                    <div class="product-card__header">
                        <h4 class="product-card__title">${product.name}</h4>
                        <span class="badge badge--${product.status === 'approved' ? 'success' : 'warning'}">${product.status}</span>
                    </div>
                    <div class="product-card__details">
                        <div class="detail-item">
                            <span class="detail-label">Price:</span>
                            <span class="detail-value">$${product.price}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Commission:</span>
                            <span class="detail-value">$${product.commission}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Delivery:</span>
                            <span class="detail-value">${product.delivery}</span>
                        </div>
                    </div>
                    <div class="product-card__actions">
                        <button class="btn btn--secondary btn--small" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="btn btn--danger btn--small" onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRequestsApprovals() {
    const container = document.getElementById('requests-approvals');
    if (!container) return;

    if (mockApplications.length === 0) {
        container.innerHTML = '<p class="text-muted">No pending applications.</p>';
        return;
    }

    container.innerHTML = `
        <h3>Requests / Approvals</h3>
        <div class="applications-table">
            <table>
                <thead>
                    <tr>
                        <th>Rep Name</th>
                        <th>Opportunity</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockApplications.map(app => `
                        <tr>
                            <td>${app.repName}</td>
                            <td>${app.opportunityTitle}</td>
                            <td>${app.appliedDate}</td>
                            <td><span class="badge badge--warning">${app.status}</span></td>
                            <td>
                                <button class="btn btn--success btn--small" onclick="approveApplication('${app.id}')">Approve</button>
                                <button class="btn btn--danger btn--small" onclick="rejectApplication('${app.id}')">Reject</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderOnboarding(onboarding) {
    const container = document.getElementById('onboarding-section');
    if (!container) return;

    const newClients = onboarding.filter(o => o.status === 'new');
    const ongoingClients = onboarding.filter(o => o.status === 'ongoing');
    const completedClients = onboarding.filter(o => o.status === 'completed');

    container.innerHTML = `
        <h3>Onboarding Clients</h3>
        <div class="onboarding-boards">
            <div class="onboarding-board">
                <h4>New (${newClients.length})</h4>
                <div class="client-cards">
                    ${newClients.map(client => renderClientCard(client)).join('')}
                </div>
            </div>
            <div class="onboarding-board">
                <h4>Ongoing (${ongoingClients.length})</h4>
                <div class="client-cards">
                    ${ongoingClients.map(client => renderClientCard(client)).join('')}
                </div>
            </div>
            <div class="onboarding-board">
                <h4>Completed (${completedClients.length})</h4>
                <div class="client-cards">
                    ${completedClients.map(client => renderClientCard(client)).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderClientCard(client) {
    return `
        <div class="client-card">
            <div class="client-card__header">
                <h5 class="client-card__name">${client.client.name}</h5>
                <span class="badge badge--${client.status === 'completed' ? 'success' : client.status === 'ongoing' ? 'warning' : 'info'}">${client.status}</span>
            </div>
            <div class="client-card__details">
                <div class="detail-item">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${client.offering.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Segment:</span>
                    <span class="detail-value">${client.offering.segment}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${client.client.phone}</span>
                </div>
            </div>
            <div class="client-card__comms">
                <h6>Communications:</h6>
                <ul>
                    ${client.comms.map(comm => `<li>${comm}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function renderPayments(campaigns) {
    const container = document.getElementById('payments-section');
    if (!container) return;

    const pendingPayments = campaigns.flatMap(c => 
        c.milestones.filter(m => m.status === 'pending')
    );
    const releasedPayments = campaigns.flatMap(c => 
        c.milestones.filter(m => m.status === 'released')
    );

    container.innerHTML = `
        <h3>Payments</h3>
        <div class="payments-summary">
            <div class="payment-stat">
                <div class="payment-stat__value">$${pendingPayments.reduce((sum, p) => sum + p.amount, 0)}</div>
                <div class="payment-stat__label">Pending</div>
            </div>
            <div class="payment-stat">
                <div class="payment-stat__value">$${releasedPayments.reduce((sum, p) => sum + p.amount, 0)}</div>
                <div class="payment-stat__label">Released</div>
            </div>
        </div>
        <div class="payments-list">
            <h4>Recent Payments</h4>
            ${[...pendingPayments, ...releasedPayments].slice(0, 5).map(payment => `
                <div class="payment-item">
                    <div class="payment-item__info">
                        <span class="payment-item__milestone">${payment.name}</span>
                        <span class="payment-item__amount">$${payment.amount}</span>
                    </div>
                    <span class="badge badge--${payment.status === 'released' ? 'success' : 'warning'}">${payment.status}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function setupEventListeners() {
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }

    // Quick links
    const profileLink = document.getElementById('profile-link');
    const agreementsLink = document.getElementById('agreements-link');

    if (profileLink) {
        profileLink.addEventListener('click', () => {
            location.href = '/pages/business-profile.html';
        });
    }

    if (agreementsLink) {
        agreementsLink.addEventListener('click', () => {
            showInfo('Agreements section coming soon!');
        });
    }
}

function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal__backdrop"></div>
        <div class="modal__content">
            <div class="modal__header">
                <h3 class="modal__title">Add Product</h3>
                <button class="modal__close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal__body">
                <form id="add-product-form">
                    <div class="form-group">
                        <label for="product-name" class="form-label">Product Name *</label>
                        <input type="text" id="product-name" name="name" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="product-price" class="form-label">Price *</label>
                        <input type="number" id="product-price" name="price" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="product-commission" class="form-label">Commission *</label>
                        <input type="number" id="product-commission" name="commission" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="product-specs" class="form-label">Specifications</label>
                        <textarea id="product-specs" name="specs" class="form-textarea"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="product-delivery" class="form-label">Delivery Method</label>
                        <input type="text" id="product-delivery" name="delivery" class="form-input">
                    </div>
                </form>
            </div>
            <div class="modal__footer">
                <button class="btn btn--secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn--primary" onclick="addProduct()">Add Product</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Global functions for product management
window.addProduct = function() {
    const form = document.getElementById('add-product-form');
    const formData = new FormData(form);
    
    const newProduct = {
        id: 'prod-' + Date.now(),
        businessId: store.get('auth').user.id,
        name: formData.get('name'),
        price: parseInt(formData.get('price')),
        commission: parseInt(formData.get('commission')),
        specs: formData.get('specs'),
        delivery: formData.get('delivery'),
        status: 'pending'
    };

    // In a real app, this would be saved to the server
    showSuccess('Product added successfully!');
    document.querySelector('.modal').remove();
    
    // Refresh products list
    setTimeout(() => {
        loadDashboardData();
    }, 1000);
};

window.editProduct = function(productId) {
    showInfo('Edit product functionality coming soon!');
};

window.deleteProduct = function(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        showSuccess('Product deleted successfully!');
        // In a real app, this would delete from server
        setTimeout(() => {
            loadDashboardData();
        }, 1000);
    }
};

window.approveApplication = function(appId) {
    const app = mockApplications.find(a => a.id === appId);
    if (app) {
        app.status = 'approved';
        showSuccess('Application approved!');
        renderRequestsApprovals();
    }
};

window.rejectApplication = function(appId) {
    const app = mockApplications.find(a => a.id === appId);
    if (app) {
        app.status = 'rejected';
        showSuccess('Application rejected!');
        renderRequestsApprovals();
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
document.addEventListener('DOMContentLoaded', initBusinessDashboard);
