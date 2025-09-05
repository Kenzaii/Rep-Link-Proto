/**
 * Messaging Feature
 * Handles real-time messaging and conversation management
 */

'use strict';

import { API } from '../data/api.js';
import { Store } from '../data/store.js';
import { EventBus } from '../ui/event-bus.js';
import { Toast } from '../ui/components.js';
import { qs, qsa, ce, addClass, removeClass, debounce } from '../ui/dom.js';

/**
 * Messaging Manager
 * Handles messaging functionality
 */
export class MessagingManager {
    constructor(api, store, eventBus) {
        this.api = api;
        this.store = store;
        this.eventBus = eventBus;
        this.toast = new Toast();
        
        this.messages = [];
        this.threads = [];
        this.currentThread = null;
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadThreads();
    }

    setupEventListeners() {
        // Message sending
        const messageForm = qs('#message-form');
        if (messageForm) {
            messageForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.sendMessage();
            });
        }

        // Thread selection
        document.addEventListener('click', (event) => {
            if (event.target.matches('.thread-item')) {
                const threadId = event.target.dataset.threadId;
                this.selectThread(threadId);
            }
        });
    }

    async loadThreads() {
        try {
            const response = await this.api.request('messages/threads');
            if (response.success) {
                this.threads = response.data;
                this.renderThreads();
            }
        } catch (error) {
            console.error('Failed to load threads:', error);
        }
    }

    async selectThread(threadId) {
        this.currentThread = threadId;
        await this.loadMessages(threadId);
        this.renderMessages();
        this.updateThreadSelection();
    }

    async loadMessages(threadId) {
        try {
            const response = await this.api.request('messages/list', {
                query: { threadId }
            });
            if (response.success) {
                this.messages = response.data;
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }

    async sendMessage() {
        const messageInput = qs('#message-input');
        const message = messageInput.value.trim();
        
        if (!message || !this.currentThread) return;

        try {
            const response = await this.api.request('messages/create', {
                method: 'POST',
                body: JSON.stringify({
                    threadId: this.currentThread,
                    body: message,
                    type: 'text'
                })
            });

            if (response.success) {
                messageInput.value = '';
                this.loadMessages(this.currentThread);
                this.renderMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.toast.show('Failed to send message', 'error');
        }
    }

    renderThreads() {
        const container = qs('.threads-list');
        if (!container) return;

        container.innerHTML = this.threads.map(thread => 
            this.renderThreadItem(thread)
        ).join('');
    }

    renderThreadItem(thread) {
        const lastMessage = thread.messages[thread.messages.length - 1];
        const otherUser = this.getOtherUser(thread);
        
        return `
            <div class="thread-item ${thread.id === this.currentThread ? 'thread-item--active' : ''}" 
                 data-thread-id="${thread.id}">
                <div class="thread-avatar">
                    <img src="${otherUser?.avatar || '/assets/img/default-avatar.png'}" alt="${otherUser?.name}">
                </div>
                <div class="thread-content">
                    <div class="thread-header">
                        <h4 class="thread-name">${otherUser?.name || 'Unknown User'}</h4>
                        <span class="thread-time">${this.formatTime(lastMessage?.timestamp)}</span>
                    </div>
                    <p class="thread-preview">${lastMessage?.body || 'No messages yet'}</p>
                </div>
            </div>
        `;
    }

    renderMessages() {
        const container = qs('.messages-container');
        if (!container) return;

        container.innerHTML = this.messages.map(message => 
            this.renderMessage(message)
        ).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    renderMessage(message) {
        const isOwn = message.fromId === this.currentUser?.id;
        const sender = this.getUserById(message.fromId);
        
        return `
            <div class="message ${isOwn ? 'message--own' : 'message--other'}">
                <div class="message-avatar">
                    <img src="${sender?.avatar || '/assets/img/default-avatar.png'}" alt="${sender?.name}">
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${sender?.name || 'Unknown User'}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-body">${message.body}</div>
                </div>
            </div>
        `;
    }

    updateThreadSelection() {
        qsa('.thread-item').forEach(item => {
            if (item.dataset.threadId === this.currentThread) {
                addClass(item, 'thread-item--active');
            } else {
                removeClass(item, 'thread-item--active');
            }
        });
    }

    getOtherUser(thread) {
        // Implementation depends on how threads are structured
        return thread.participants?.find(p => p.id !== this.currentUser?.id);
    }

    getUserById(userId) {
        const users = this.store.get('users', []);
        return users.find(user => user.id === userId);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
}
