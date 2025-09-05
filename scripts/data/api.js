/**
 * API
 * Mock API layer for prototype - simulates backend communication
 */

'use strict';

import { Store } from './store.js';

/**
 * API Class
 * Handles all API communication with mock data
 */
export class API {
    constructor() {
        this.baseURL = '';
        this.timeout = 10000;
        this.store = null;
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        
        this.setupNetworkListeners();
    }

    /**
     * Initialize the API
     * @param {Store} store - Store instance
     */
    async init(store = null) {
        this.store = store;
        console.log('API initialized successfully');
    }

    /**
     * Set up network status listeners
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Make an API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>}
     */
    async request(endpoint, options = {}) {
        const requestId = this.generateRequestId();
        const request = {
            id: requestId,
            endpoint,
            options: {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            },
            timestamp: Date.now()
        };

        // Add to queue if offline
        if (!this.isOnline) {
            this.requestQueue.push(request);
            return this.createOfflineResponse();
        }

        try {
            // Simulate network delay
            await this.simulateDelay();
            
            // Route to appropriate handler
            const response = await this.routeRequest(endpoint, request.options);
            
            return {
                success: true,
                data: response,
                requestId,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: error.message,
                requestId,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Route request to appropriate handler
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async routeRequest(endpoint, options) {
        const [resource, action] = endpoint.split('/').filter(Boolean);
        
        switch (resource) {
            case 'auth':
                return this.handleAuth(action, options);
            case 'users':
                return this.handleUsers(action, options);
            case 'businesses':
                return this.handleBusinesses(action, options);
            case 'opportunities':
                return this.handleOpportunities(action, options);
            case 'proposals':
                return this.handleProposals(action, options);
            case 'contracts':
                return this.handleContracts(action, options);
            case 'messages':
                return this.handleMessages(action, options);
            case 'faq':
                return this.handleFAQ(action, options);
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    }

    /**
     * Handle authentication requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleAuth(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'login':
                return this.mockLogin(data);
            case 'register':
                return this.mockRegister(data);
            case 'logout':
                return this.mockLogout();
            case 'verify':
                return this.mockVerifyToken();
            default:
                throw new Error(`Unknown auth action: ${action}`);
        }
    }

    /**
     * Handle user requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleUsers(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'list':
                return this.getUsers();
            case 'get':
                return this.getUser(options.params?.id);
            case 'create':
                return this.createUser(data);
            case 'update':
                return this.updateUser(options.params?.id, data);
            case 'delete':
                return this.deleteUser(options.params?.id);
            default:
                throw new Error(`Unknown users action: ${action}`);
        }
    }

    /**
     * Handle business requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleBusinesses(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'list':
                return this.getBusinesses();
            case 'get':
                return this.getBusiness(options.params?.id);
            case 'create':
                return this.createBusiness(data);
            case 'update':
                return this.updateBusiness(options.params?.id, data);
            default:
                throw new Error(`Unknown businesses action: ${action}`);
        }
    }

    /**
     * Handle opportunity requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleOpportunities(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'list':
                return this.getOpportunities(options.query);
            case 'get':
                return this.getOpportunity(options.params?.id);
            case 'create':
                return this.createOpportunity(data);
            case 'update':
                return this.updateOpportunity(options.params?.id, data);
            case 'delete':
                return this.deleteOpportunity(options.params?.id);
            case 'search':
                return this.searchOpportunities(options.query);
            default:
                throw new Error(`Unknown opportunities action: ${action}`);
        }
    }

    /**
     * Handle proposal requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleProposals(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'list':
                return this.getProposals(options.query);
            case 'get':
                return this.getProposal(options.params?.id);
            case 'create':
                return this.createProposal(data);
            case 'update':
                return this.updateProposal(options.params?.id, data);
            case 'delete':
                return this.deleteProposal(options.params?.id);
            default:
                throw new Error(`Unknown proposals action: ${action}`);
        }
    }

    /**
     * Handle contract requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleContracts(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'list':
                return this.getContracts(options.query);
            case 'get':
                return this.getContract(options.params?.id);
            case 'create':
                return this.createContract(data);
            case 'update':
                return this.updateContract(options.params?.id, data);
            case 'milestone':
                return this.updateMilestone(options.params?.id, options.params?.milestoneId, data);
            default:
                throw new Error(`Unknown contracts action: ${action}`);
        }
    }

    /**
     * Handle message requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleMessages(action, options) {
        const data = this.parseRequestBody(options.body);
        
        switch (action) {
            case 'list':
                return this.getMessages(options.query);
            case 'get':
                return this.getMessage(options.params?.id);
            case 'create':
                return this.createMessage(data);
            case 'threads':
                return this.getMessageThreads(options.query);
            default:
                throw new Error(`Unknown messages action: ${action}`);
        }
    }

    /**
     * Handle FAQ requests
     * @param {string} action - Action type
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    async handleFAQ(action, options) {
        switch (action) {
            case 'list':
                return this.getFAQ();
            case 'categories':
                return this.getFAQCategories();
            default:
                throw new Error(`Unknown FAQ action: ${action}`);
        }
    }

    // Mock data methods
    async mockLogin(data) {
        const { email, password } = data;
        
        // Simulate authentication
        if (email && password) {
            const user = {
                id: '1',
                email,
                name: 'John Doe',
                role: 'rep',
                avatar: null,
                createdAt: new Date().toISOString()
            };
            
            const token = this.generateToken();
            
            return {
                user,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
        }
        
        throw new Error('Invalid credentials');
    }

    async mockRegister(data) {
        const { email, password, name, role } = data;
        
        if (email && password && name && role) {
            const user = {
                id: this.generateId(),
                email,
                name,
                role,
                avatar: null,
                createdAt: new Date().toISOString()
            };
            
            const token = this.generateToken();
            
            return {
                user,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
        }
        
        throw new Error('Invalid registration data');
    }

    async mockLogout() {
        return { success: true };
    }

    async mockVerifyToken() {
        const token = localStorage.getItem('auth-token');
        if (token) {
            return {
                valid: true,
                user: {
                    id: '1',
                    email: 'john@example.com',
                    name: 'John Doe',
                    role: 'rep'
                }
            };
        }
        return { valid: false };
    }

    async getUsers() {
        return this.loadMockData('users');
    }

    async getUser(id) {
        const users = await this.getUsers();
        return users.find(user => user.id === id);
    }

    async createUser(data) {
        const user = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString()
        };
        
        const users = await this.getUsers();
        users.push(user);
        await this.saveMockData('users', users);
        
        return user;
    }

    async updateUser(id, data) {
        const users = await this.getUsers();
        const index = users.findIndex(user => user.id === id);
        
        if (index > -1) {
            users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
            await this.saveMockData('users', users);
            return users[index];
        }
        
        throw new Error('User not found');
    }

    async deleteUser(id) {
        const users = await this.getUsers();
        const filtered = users.filter(user => user.id !== id);
        await this.saveMockData('users', filtered);
        return { success: true };
    }

    async getBusinesses() {
        return this.loadMockData('businesses');
    }

    async getBusiness(id) {
        const businesses = await this.getBusinesses();
        return businesses.find(business => business.id === id);
    }

    async createBusiness(data) {
        const business = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString()
        };
        
        const businesses = await this.getBusinesses();
        businesses.push(business);
        await this.saveMockData('businesses', businesses);
        
        return business;
    }

    async updateBusiness(id, data) {
        const businesses = await this.getBusinesses();
        const index = businesses.findIndex(business => business.id === id);
        
        if (index > -1) {
            businesses[index] = { ...businesses[index], ...data, updatedAt: new Date().toISOString() };
            await this.saveMockData('businesses', businesses);
            return businesses[index];
        }
        
        throw new Error('Business not found');
    }

    async getOpportunities(query = {}) {
        let opportunities = await this.loadMockData('opportunities');
        
        // Apply filters
        if (query.category) {
            opportunities = opportunities.filter(opp => opp.category === query.category);
        }
        
        if (query.location) {
            opportunities = opportunities.filter(opp => opp.location === query.location);
        }
        
        if (query.remote) {
            opportunities = opportunities.filter(opp => opp.remote === query.remote);
        }
        
        if (query.search) {
            const search = query.search.toLowerCase();
            opportunities = opportunities.filter(opp => 
                opp.title.toLowerCase().includes(search) ||
                opp.description.toLowerCase().includes(search)
            );
        }
        
        return opportunities;
    }

    async getOpportunity(id) {
        const opportunities = await this.getOpportunities();
        return opportunities.find(opp => opp.id === id);
    }

    async createOpportunity(data) {
        const opportunity = {
            id: this.generateId(),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        const opportunities = await this.getOpportunities();
        opportunities.push(opportunity);
        await this.saveMockData('opportunities', opportunities);
        
        return opportunity;
    }

    async updateOpportunity(id, data) {
        const opportunities = await this.getOpportunities();
        const index = opportunities.findIndex(opp => opp.id === id);
        
        if (index > -1) {
            opportunities[index] = { ...opportunities[index], ...data, updatedAt: new Date().toISOString() };
            await this.saveMockData('opportunities', opportunities);
            return opportunities[index];
        }
        
        throw new Error('Opportunity not found');
    }

    async deleteOpportunity(id) {
        const opportunities = await this.getOpportunities();
        const filtered = opportunities.filter(opp => opp.id !== id);
        await this.saveMockData('opportunities', filtered);
        return { success: true };
    }

    async searchOpportunities(query) {
        return this.getOpportunities(query);
    }

    async getProposals(query = {}) {
        return this.loadMockData('proposals');
    }

    async getProposal(id) {
        const proposals = await this.getProposals();
        return proposals.find(proposal => proposal.id === id);
    }

    async createProposal(data) {
        const proposal = {
            id: this.generateId(),
            ...data,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        const proposals = await this.getProposals();
        proposals.push(proposal);
        await this.saveMockData('proposals', proposals);
        
        return proposal;
    }

    async updateProposal(id, data) {
        const proposals = await this.getProposals();
        const index = proposals.findIndex(proposal => proposal.id === id);
        
        if (index > -1) {
            proposals[index] = { ...proposals[index], ...data, updatedAt: new Date().toISOString() };
            await this.saveMockData('proposals', proposals);
            return proposals[index];
        }
        
        throw new Error('Proposal not found');
    }

    async deleteProposal(id) {
        const proposals = await this.getProposals();
        const filtered = proposals.filter(proposal => proposal.id !== id);
        await this.saveMockData('proposals', filtered);
        return { success: true };
    }

    async getContracts(query = {}) {
        return this.loadMockData('contracts');
    }

    async getContract(id) {
        const contracts = await this.getContracts();
        return contracts.find(contract => contract.id === id);
    }

    async createContract(data) {
        const contract = {
            id: this.generateId(),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        const contracts = await this.getContracts();
        contracts.push(contract);
        await this.saveMockData('contracts', contracts);
        
        return contract;
    }

    async updateContract(id, data) {
        const contracts = await this.getContracts();
        const index = contracts.findIndex(contract => contract.id === id);
        
        if (index > -1) {
            contracts[index] = { ...contracts[index], ...data, updatedAt: new Date().toISOString() };
            await this.saveMockData('contracts', contracts);
            return contracts[index];
        }
        
        throw new Error('Contract not found');
    }

    async updateMilestone(contractId, milestoneId, data) {
        const contracts = await this.getContracts();
        const contract = contracts.find(c => c.id === contractId);
        
        if (contract && contract.milestones) {
            const milestone = contract.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                Object.assign(milestone, data);
                await this.saveMockData('contracts', contracts);
                return milestone;
            }
        }
        
        throw new Error('Milestone not found');
    }

    async getMessages(query = {}) {
        return this.loadMockData('messages');
    }

    async getMessage(id) {
        const messages = await this.getMessages();
        return messages.find(message => message.id === id);
    }

    async createMessage(data) {
        const message = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString()
        };
        
        const messages = await this.getMessages();
        messages.push(message);
        await this.saveMockData('messages', messages);
        
        return message;
    }

    async getMessageThreads(query = {}) {
        const messages = await this.getMessages();
        const threads = {};
        
        messages.forEach(message => {
            const threadId = message.threadId;
            if (!threads[threadId]) {
                threads[threadId] = [];
            }
            threads[threadId].push(message);
        });
        
        return Object.values(threads);
    }

    async getFAQ() {
        return this.loadMockData('faq');
    }

    async getFAQCategories() {
        const faq = await this.getFAQ();
        const categories = [...new Set(faq.map(item => item.category))];
        return categories;
    }

    // Utility methods
    async loadMockData(type) {
        try {
            const response = await fetch(`/mock/${type}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn(`Failed to load mock data for ${type}:`, error);
        }
        
        // Return empty array as fallback
        return [];
    }

    async saveMockData(type, data) {
        // In a real app, this would save to the backend
        // For the prototype, we'll just store in localStorage
        localStorage.setItem(`mock-${type}`, JSON.stringify(data));
    }

    parseRequestBody(body) {
        if (!body) return {};
        
        if (body instanceof FormData) {
            const data = {};
            for (const [key, value] of body.entries()) {
                data[key] = value;
            }
            return data;
        }
        
        if (typeof body === 'string') {
            try {
                return JSON.parse(body);
            } catch (error) {
                return {};
            }
        }
        
        return body;
    }

    async simulateDelay(min = 100, max = 500) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    generateToken() {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    createOfflineResponse() {
        return {
            success: false,
            error: 'You are offline. This request will be processed when you reconnect.',
            offline: true
        };
    }

    async processQueue() {
        if (this.requestQueue.length === 0) return;
        
        const requests = [...this.requestQueue];
        this.requestQueue = [];
        
        for (const request of requests) {
            try {
                await this.request(request.endpoint, request.options);
            } catch (error) {
                console.error('Failed to process queued request:', error);
            }
        }
    }

    /**
     * Connect Singpass (Mock)
     * Simulates MyInfo retrieval for form filling
     * @returns {Promise<Object>} Singpass user data
     */
    async connectSingpassMock() {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await fetch('/mock/singpass_user.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                success: true,
                data: {
                    name: data.name,
                    nric_masked: data.nric_masked,
                    dob: data.dob,
                    email: data.email,
                    mobile: data.mobile,
                    address: data.address,
                    nationality: data.nationality,
                    sex: data.sex,
                    race: data.race,
                    marital_status: data.marital_status,
                    occupation: data.occupation,
                    employer_name: data.employer_name,
                    employment_status: data.employment_status
                }
            };
        } catch (error) {
            console.error('Failed to connect Singpass:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
