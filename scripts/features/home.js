/**
 * Home Page Features
 * Partners slider and other home page functionality
 */

import { api } from '../data/api.js';

export function initHome() {
    loadPartnersSlider();
}

async function loadPartnersSlider() {
    try {
        const partners = await api.partners();
        const slider = document.getElementById('partnerSlider');
        
        if (!slider) return;

        slider.innerHTML = partners.map(partner => `
            <div class="partner-item" style="flex-shrink: 0; padding: 1rem; scroll-snap-align: start;">
                <div class="partner-logo" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 60px;
                    padding: 0 2rem;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    font-weight: var(--font-weight-medium);
                    color: var(--text-primary);
                    white-space: nowrap;
                ">
                    ${partner.name}
                </div>
            </div>
        `).join('');

        // Add scroll behavior
        slider.style.display = 'flex';
        slider.style.gap = '1rem';
        slider.style.overflowX = 'auto';
        slider.style.scrollSnapType = 'x proximity';
        slider.style.paddingBottom = '1rem';
        
    } catch (error) {
        console.error('Failed to load partners:', error);
        // Fallback content
        const slider = document.getElementById('partnerSlider');
        if (slider) {
            slider.innerHTML = `
                <div class="partner-item" style="flex-shrink: 0; padding: 1rem;">
                    <div class="partner-logo" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 60px;
                        padding: 0 2rem;
                        background: var(--bg-secondary);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border);
                        font-weight: var(--font-weight-medium);
                        color: var(--text-primary);
                    ">
                        TechCorp Solutions
                    </div>
                </div>
                <div class="partner-item" style="flex-shrink: 0; padding: 1rem;">
                    <div class="partner-logo" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 60px;
                        padding: 0 2rem;
                        background: var(--bg-secondary);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border);
                        font-weight: var(--font-weight-medium);
                        color: var(--text-primary);
                    ">
                        Fish n Meat
                    </div>
                </div>
                <div class="partner-item" style="flex-shrink: 0; padding: 1rem;">
                    <div class="partner-logo" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 60px;
                        padding: 0 2rem;
                        background: var(--bg-secondary);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border);
                        font-weight: var(--font-weight-medium);
                        color: var(--text-primary);
                    ">
                        Pro Wrap
                    </div>
                </div>
                <div class="partner-item" style="flex-shrink: 0; padding: 1rem;">
                    <div class="partner-logo" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 60px;
                        padding: 0 2rem;
                        background: var(--bg-secondary);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border);
                        font-weight: var(--font-weight-medium);
                        color: var(--text-primary);
                    ">
                        Yacht Marina
                    </div>
                </div>
            `;
            slider.style.display = 'flex';
            slider.style.gap = '1rem';
            slider.style.overflowX = 'auto';
            slider.style.scrollSnapType = 'x proximity';
            slider.style.paddingBottom = '1rem';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initHome);
