/**
 * Rep Dashboard Module
 * Handles the sales representative dashboard functionality
 */

'use strict';

import { DonutChart } from '../ui/donutChart.js';
import { API } from '../data/api.js';
import { store } from '../data/store.js';
import { Toast } from '../ui/components.js';
import { currentUser, isAuthed } from '../app.js';

class RepDashboard {
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
            console.error('Failed to initialize rep dashboard:', error);
            this.toast.show('Failed to load dashboard data', 'error');
        }
    }

    checkAuth() {
        if (!isAuthed() || currentUser()?.role !== 'rep') {
            // For demo purposes, allow access but show a warning
            console.warn('User not authenticated as rep, but allowing access for demo');
            return;
        }
    }

    async loadData() {
        try {
            const response = await fetch('/mock/dashboard_rep.json');
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
        this.renderKPIs();
        this.renderDonutChart();
        this.renderOpportunities();
        this.renderCampaigns();
    }

    renderKPIs() {
        const kpis = this.data.kpis;
        
        // Update KPI values
        const kpiValues = document.querySelectorAll('.kpi__value');
        if (kpiValues.length >= 4) {
            kpiValues[0].textContent = kpis.totalSalesThisMonth;
            kpiValues[1].textContent = kpis.totalCommissions;
            kpiValues[2].textContent = kpis.dealsClosed;
            kpiValues[3].textContent = kpis.activeCampaigns;
        }
    }

    renderDonutChart() {
        const canvas = document.getElementById('salesDonut');
        if (!canvas) return;

        const salesData = this.data.salesByCategory;
        const values = [salesData.fnb, salesData.retail, salesData.other];
        const colors = [
            'var(--brand-blue-500)',
            'var(--brand-green-500)',
            'var(--ink-500)'
        ];

        const donut = new DonutChart(canvas, {
            values: values,
            colors: colors,
            centerText: `${salesData.percent}%`,
            thickness: 28
        });

        // Animate the chart
        donut.animate(values, colors, `${salesData.percent}%`);
    }

    renderOpportunities() {
        const container = document.getElementById('opportunityList');
        if (!container) return;

        const opportunities = this.data.opportunities;
        container.innerHTML = opportunities.map(opp => `
            <div class="partner">
                <div class="logo">${opp.logoSvg}</div>
                <div class="title">${opp.name}</div>
                <div class="sub">${opp.product}</div>
                <div class="pct">${opp.commission}%</div>
                <button class="btn btn--primary" data-opp-id="${opp.id}">
                    ${opp.enrolled ? 'Manage' : 'Sign Up'}
                </button>
            </div>
        `).join('');
    }

    renderCampaigns() {
        const container = document.getElementById('campaignList');
        if (!container) return;

        const campaigns = this.data.campaigns;
        container.innerHTML = campaigns.map(campaign => `
            <li class="campaign">
                <div class="icn">${campaign.iconSvg}</div>
                <div class="meta">
                    <div class="name">${campaign.name}</div>
                    <div class="sub">${campaign.subtitle}</div>
                </div>
                <span class="pill ${campaign.status === 'Active' ? 'pill--active' : 'pill--pending'}">
                    ${campaign.status}
                </span>
                <div class="progress">
                    <div style="width: ${campaign.progress}%"></div>
                </div>
            </li>
        `).join('');
    }

    setupEventListeners() {
        // Opportunity buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-opp-id]');
            if (button) {
                const oppId = button.dataset.oppId;
                this.handleOpportunityClick(oppId, button);
            }
        });

        // Chat button
        const chatButton = document.querySelector('.fab-chat');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                this.openChat();
            });
        }

        // Logout button is handled by Header component

        // Window resize for donut chart
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('salesDonut');
            if (canvas && canvas.donutChart) {
                canvas.donutChart.resize();
            }
        });
    }

    handleOpportunityClick(oppId, button) {
        const opportunity = this.data.opportunities.find(opp => opp.id === oppId);
        if (!opportunity) return;

        if (opportunity.enrolled) {
            // Navigate to manage page
            window.location.href = `opportunity-detail.html?id=${oppId}`;
        } else {
            // Show sign up modal or navigate to sign up
            this.toast.show(`Signing up for ${opportunity.name}...`, 'info');
            
            // Simulate sign up process
            setTimeout(() => {
                opportunity.enrolled = true;
                button.textContent = 'Manage';
                this.toast.show(`Successfully signed up for ${opportunity.name}!`, 'success');
            }, 1500);
        }
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
    new RepDashboard();
});
