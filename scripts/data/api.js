/**
 * API
 * Resilient API layer with fallback users for prototype
 */

'use strict';

function rootPrefix() {
    // If we're on /pages/*.html, root is everything before "/pages/"
    const p = location.pathname;
    const i = p.indexOf('/pages/');
    return i >= 0 ? p.slice(0, i) : '';
}

async function getJSONWithFallback(paths) {
    for (const url of paths) {
        try {
            const r = await fetch(url, { cache: 'no-store' });
            if (r.ok) return await r.json();
        } catch (_) { /* try next */ }
    }
    throw new Error('all-paths-failed');
}

// Fallback users — works even without /mock/users.json (prototype only)
const FALLBACK_USERS = [
    {
        id: 'u-rep-001',
        name: 'Demo Rep',
        email: 'rep@replink.dev',
        role: 'rep',
        avatar: '/assets/img/rep1.svg',
        phone: '+65 9123 4567',
        nric: 'S1234567A',
        address: '123 Main Street, Singapore 123456',
        bio: 'Experienced sales representative with 5+ years in B2B sales',
        singpassLinked: true,
        createdAt: '2024-01-15T08:00:00.000Z'
    },
    {
        id: 'u-biz-001',
        name: 'Demo Business',
        email: 'business@replink.dev',
        role: 'business',
        avatar: '/assets/img/rep2.svg',
        company: 'Rep-Link Demo Co.',
        phone: '+65 9876 5432',
        address: '456 Business Ave, Singapore 654321',
        bio: 'Business owner with 10+ years in technology sector',
        singpassLinked: true,
        createdAt: '2024-01-10T09:00:00.000Z'
    }
];

export const api = {
    async get(path) {
        const root = rootPrefix();
        const candidates = [
            `${root}${path}`,
            path,
            `../${path.replace(/^\//, '')}`,
            `./${path.replace(/^\//, '')}`
        ];
        const r = await getJSONWithFallback(candidates);
        if (!r) throw new Error(`Fetch ${path} failed`);
        return r;
    },

    async users() { return this.get('/mock/users.json'); },
    async opportunities() { return this.get('/mock/opportunities.json'); },
    async products() { return this.get('/mock/products.json'); },
    async campaigns() { return this.get('/mock/campaigns.json'); },
    async onboarding() { return this.get('/mock/onboarding.json'); },
    async partners() { return this.get('/mock/partners.json'); },
    async singpassRep() { return this.get('/mock/singpass/rep.json'); },
    async singpassBiz() { return this.get('/mock/singpass/business.json'); },
    async helpIndex() { return this.get('/mock/help/articles.json'); },
    async helpFAQ() { return this.get('/mock/help/faq.json'); },

    async login(email, password) {
        const users = await this.users().catch(() => [
            { id: 'u-rep-001', name: 'Demo Rep', email: 'rep@replink.dev', role: 'rep', __pw: 'RepLink#2025' },
            { id: 'u-biz-001', name: 'Demo Business', email: 'business@replink.dev', role: 'business', company: 'Rep-Link Demo Co.', __pw: 'RepLink#2025' }
        ]);
        const em = String(email || '').trim().toLowerCase();
        const u = users.find(x => String(x.email).toLowerCase() === em);
        await new Promise(r => setTimeout(r, 200));
        const expected = u?.password ?? u?.__pw;
        if (!u) throw new Error('No such user');
        if (String(expected) !== String(password)) throw new Error('Incorrect password');
        const { password: _1, __pw: _2, ...safe } = u;
        return safe;
    }
};