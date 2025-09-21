/**
 * Signup Flow
 * 2-step signup with mock Singpass integration
 */

import { api } from '../data/api.js';
import { store } from '../data/store.js';

let signupData = {};

export function initSignup() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || 'rep';
    
    // Set initial role from URL parameter
    signupData.role = role;
    
    // Update role selection if present
    const roleRadios = document.querySelectorAll('input[name="role"]');
    roleRadios.forEach(radio => {
        if (radio.value === role) {
            radio.checked = true;
        }
    });

    // Handle step navigation
    const step1Form = document.getElementById('step1-form');
    const step2Form = document.getElementById('step2-form');
    const singpassBtn = document.getElementById('singpass-btn');
    const continueBtn = document.getElementById('continue-btn');

    if (step1Form) {
        step1Form.addEventListener('submit', handleStep1);
    }

    if (singpassBtn) {
        singpassBtn.addEventListener('click', handleSingpassLink);
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', handleStep2);
    }

    // Handle role changes to show/hide appropriate fields
    const roleRadios = document.querySelectorAll('input[name="role"]');
    roleRadios.forEach(radio => {
        radio.addEventListener('change', handleRoleChange);
    });

    // Show appropriate step
    showStep(1);
    handleRoleChange();
}

function showStep(step) {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    if (step === 1) {
        step1?.classList.remove('hidden');
        step2?.classList.add('hidden');
    } else {
        step1?.classList.add('hidden');
        step2?.classList.remove('hidden');
    }
}

function handleRoleChange() {
    const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
    const repFields = document.getElementById('rep-fields');
    const businessFields = document.getElementById('business-fields');
    
    if (selectedRole === 'business') {
        repFields?.classList.add('hidden');
        businessFields?.classList.remove('hidden');
    } else {
        repFields?.classList.remove('hidden');
        businessFields?.classList.add('hidden');
    }
}

function handleStep1(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    signupData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        role: formData.get('role') || signupData.role
    };

    // Validate required fields
    if (!signupData.fullName || !signupData.email || !signupData.password) {
        showError('Please fill in all required fields');
        return;
    }

    showStep(2);
}

async function handleSingpassLink() {
    try {
        const singpassData = signupData.role === 'business' 
            ? await api.singpassBiz()
            : await api.singpassRep();

        // Prefill form fields
        if (signupData.role === 'business') {
            document.getElementById('company')?.setAttribute('value', singpassData.company);
            document.getElementById('uen')?.setAttribute('value', singpassData.uen);
            document.getElementById('billingEmail')?.setAttribute('value', singpassData.billingEmail);
            document.getElementById('contact')?.setAttribute('value', singpassData.contact);
        } else {
            document.getElementById('address')?.setAttribute('value', singpassData.address);
            document.getElementById('nationalId')?.setAttribute('value', singpassData.nationalId);
            document.getElementById('bankAccount')?.setAttribute('value', singpassData.bankAccount);
        }

        // Mark fields as prefilled
        const prefilledFields = document.querySelectorAll('[data-singpass]');
        prefilledFields.forEach(field => {
            field.classList.add('prefilled');
            field.setAttribute('readonly', 'true');
        });

        showSuccess('Singpass data linked successfully!');
    } catch (error) {
        showError('Failed to link Singpass data. Please try again.');
        console.error('Singpass error:', error);
    }
}

function handleStep2() {
    // Collect additional data from step 2
    const formData = new FormData(document.getElementById('step2-form'));
    
    if (signupData.role === 'business') {
        signupData.company = formData.get('company');
        signupData.uen = formData.get('uen');
        signupData.billingEmail = formData.get('billingEmail');
        signupData.contact = formData.get('contact');
    } else {
        signupData.address = formData.get('address');
        signupData.nationalId = formData.get('nationalId');
        signupData.bankAccount = formData.get('bankAccount');
    }

    // Create user profile (mock - no persistence)
    const newUser = {
        id: `u-${signupData.role}-${Date.now()}`,
        name: signupData.fullName,
        email: signupData.email,
        phone: signupData.phone,
        role: signupData.role,
        ...signupData
    };

    // Auto-login the new user
    store.setAuth({
        isAuthed: true,
        user: newUser,
        token: 'mock-token-' + Date.now()
    });

    // Redirect to appropriate dashboard
    const dashboardUrl = signupData.role === 'business' 
        ? '/pages/business-dashboard.html'
        : '/pages/rep-dashboard.html';
    
    showSuccess('Account created successfully! Redirecting...');
    setTimeout(() => {
        location.href = dashboardUrl;
    }, 1500);
}

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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSignup);
