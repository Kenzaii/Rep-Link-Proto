/**
 * Form Utilities
 * Form validation and handling utilities
 */

'use strict';

import { qs, qsa, addClass, removeClass, show, hide } from './dom.js';

/**
 * Form Validator
 * Handles form validation with real-time feedback
 */
export class FormValidator {
    constructor(form, options = {}) {
        this.form = qs(form);
        this.options = {
            validateOnBlur: true,
            validateOnInput: false,
            showErrors: true,
            ...options
        };
        
        this.rules = new Map();
        this.errors = new Map();
        
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupEventListeners();
        this.setupFormSubmission();
    }

    setupEventListeners() {
        const inputs = qsa('input, textarea, select', this.form);
        
        inputs.forEach(input => {
            if (this.options.validateOnBlur) {
                input.addEventListener('blur', () => this.validateField(input));
            }
            
            if (this.options.validateOnInput) {
                input.addEventListener('input', () => this.validateField(input));
            }
        });
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (event) => {
            if (!this.validateForm()) {
                event.preventDefault();
                this.focusFirstError();
            }
        });
    }

    addRule(fieldName, rule) {
        if (!this.rules.has(fieldName)) {
            this.rules.set(fieldName, []);
        }
        this.rules.get(fieldName).push(rule);
    }

    validateField(field) {
        const fieldName = field.name || field.id;
        if (!fieldName) return true;
        
        const fieldRules = this.rules.get(fieldName) || [];
        const errors = [];
        
        fieldRules.forEach(rule => {
            const error = rule(field.value, field);
            if (error) {
                errors.push(error);
            }
        });
        
        if (errors.length > 0) {
            this.setFieldError(field, errors[0]);
            return false;
        } else {
            this.clearFieldError(field);
            return true;
        }
    }

    validateForm() {
        const inputs = qsa('input, textarea, select', this.form);
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    setFieldError(field, error) {
        this.errors.set(field.name || field.id, error);
        
        if (this.options.showErrors) {
            addClass(field, 'form-input--error');
            this.showFieldError(field, error);
        }
    }

    clearFieldError(field) {
        this.errors.delete(field.name || field.id);
        
        if (this.options.showErrors) {
            removeClass(field, 'form-input--error');
            this.hideFieldError(field);
        }
    }

    showFieldError(field, error) {
        let errorElement = qs('.form-error', field.parentNode);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = error;
        show(errorElement);
    }

    hideFieldError(field) {
        const errorElement = qs('.form-error', field.parentNode);
        if (errorElement) {
            hide(errorElement);
        }
    }

    focusFirstError() {
        const firstError = qs('.form-input--error', this.form);
        if (firstError) {
            firstError.focus();
        }
    }

    getErrors() {
        return Object.fromEntries(this.errors);
    }

    clearAllErrors() {
        this.errors.clear();
        qsa('.form-input--error', this.form).forEach(field => {
            removeClass(field, 'form-input--error');
            this.hideFieldError(field);
        });
    }
}

/**
 * Validation Rules
 * Common validation rule functions
 */
export const ValidationRules = {
    required: (message = 'This field is required') => (value) => {
        if (!value || value.trim() === '') {
            return message;
        }
        return null;
    },

    email: (message = 'Please enter a valid email address') => (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return message;
        }
        return null;
    },

    minLength: (min, message) => (value) => {
        if (value && value.length < min) {
            return message || `Must be at least ${min} characters long`;
        }
        return null;
    },

    maxLength: (max, message) => (value) => {
        if (value && value.length > max) {
            return message || `Must be no more than ${max} characters long`;
        }
        return null;
    },

    pattern: (regex, message) => (value) => {
        if (value && !regex.test(value)) {
            return message || 'Invalid format';
        }
        return null;
    },

    phone: (message = 'Please enter a valid phone number') => (value) => {
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return message;
        }
        return null;
    },

    url: (message = 'Please enter a valid URL') => (value) => {
        if (value) {
            try {
                new URL(value);
            } catch {
                return message;
            }
        }
        return null;
    },

    number: (message = 'Please enter a valid number') => (value) => {
        if (value && isNaN(Number(value))) {
            return message;
        }
        return null;
    },

    min: (min, message) => (value) => {
        if (value && Number(value) < min) {
            return message || `Must be at least ${min}`;
        }
        return null;
    },

    max: (max, message) => (value) => {
        if (value && Number(value) > max) {
            return message || `Must be no more than ${max}`;
        }
        return null;
    },

    confirm: (targetField, message = 'Values do not match') => (value, field) => {
        const target = qs(`[name="${targetField}"]`, field.form);
        if (target && value !== target.value) {
            return message;
        }
        return null;
    },

    custom: (validator, message) => (value, field) => {
        if (!validator(value, field)) {
            return message;
        }
        return null;
    }
};

/**
 * Form Handler
 * Handles form submission and data processing
 */
export class FormHandler {
    constructor(form, options = {}) {
        this.form = qs(form);
        this.options = {
            method: 'POST',
            action: '',
            ajax: false,
            ...options
        };
        
        this.validator = null;
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupSubmission();
    }

    setupSubmission() {
        this.form.addEventListener('submit', (event) => {
            if (this.options.ajax) {
                event.preventDefault();
                this.handleAjaxSubmission();
            }
        });
    }

    setValidator(validator) {
        this.validator = validator;
    }

    async handleAjaxSubmission() {
        if (this.validator && !this.validator.validateForm()) {
            return;
        }

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(this.options.action || this.form.action, {
                method: this.options.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.handleSuccess(result);
            } else {
                this.handleError(result);
            }
        } catch (error) {
            this.handleError({ message: 'An error occurred while submitting the form' });
        }
    }

    handleSuccess(result) {
        // Trigger success event
        this.form.dispatchEvent(new CustomEvent('form:success', {
            detail: result
        }));
        
        // Reset form if specified
        if (this.options.resetOnSuccess) {
            this.form.reset();
        }
    }

    handleError(result) {
        // Trigger error event
        this.form.dispatchEvent(new CustomEvent('form:error', {
            detail: result
        }));
        
        // Show field errors if provided
        if (result.errors && this.validator) {
            Object.entries(result.errors).forEach(([field, error]) => {
                const input = qs(`[name="${field}"]`, this.form);
                if (input) {
                    this.validator.setFieldError(input, error);
                }
            });
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData.entries());
    }

    setFormData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = qs(`[name="${key}"]`, this.form);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            }
        });
    }

    reset() {
        this.form.reset();
        if (this.validator) {
            this.validator.clearAllErrors();
        }
    }
}

/**
 * Form Builder
 * Programmatically build forms
 */
export class FormBuilder {
    constructor() {
        this.fields = [];
        this.options = {};
    }

    addField(field) {
        this.fields.push(field);
        return this;
    }

    setOptions(options) {
        this.options = { ...this.options, ...options };
        return this;
    }

    build() {
        const form = document.createElement('form');
        
        // Set form attributes
        Object.entries(this.options).forEach(([key, value]) => {
            if (key === 'className') {
                form.className = value;
            } else {
                form.setAttribute(key, value);
            }
        });
        
        // Add fields
        this.fields.forEach(fieldConfig => {
            const field = this.createField(fieldConfig);
            form.appendChild(field);
        });
        
        return form;
    }

    createField(config) {
        const { type, name, label, placeholder, required, options, ...attrs } = config;
        
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';
        
        // Label
        if (label) {
            const labelEl = document.createElement('label');
            labelEl.className = 'form-label';
            labelEl.textContent = label;
            labelEl.setAttribute('for', name);
            fieldGroup.appendChild(labelEl);
        }
        
        // Input
        let input;
        
        switch (type) {
            case 'select':
                input = document.createElement('select');
                input.className = 'form-select';
                
                if (placeholder) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = placeholder;
                    input.appendChild(option);
                }
                
                options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = option.label;
                    input.appendChild(optionEl);
                });
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'form-textarea';
                input.placeholder = placeholder;
                break;
                
            default:
                input = document.createElement('input');
                input.className = 'form-input';
                input.type = type;
                input.placeholder = placeholder;
        }
        
        input.name = name;
        input.id = name;
        
        if (required) {
            input.required = true;
        }
        
        // Set additional attributes
        Object.entries(attrs).forEach(([key, value]) => {
            input.setAttribute(key, value);
        });
        
        fieldGroup.appendChild(input);
        
        return fieldGroup;
    }
}

/**
 * File Upload Handler
 * Handles file uploads with progress and validation
 */
export class FileUploadHandler {
    constructor(input, options = {}) {
        this.input = qs(input);
        this.options = {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [],
            multiple: false,
            ...options
        };
        
        this.files = [];
        this.init();
    }

    init() {
        if (!this.input) return;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener('change', (event) => {
            this.handleFiles(event.target.files);
        });
        
        // Drag and drop
        this.input.addEventListener('dragover', (event) => {
            event.preventDefault();
            addClass(this.input, 'file-input--dragover');
        });
        
        this.input.addEventListener('dragleave', () => {
            removeClass(this.input, 'file-input--dragover');
        });
        
        this.input.addEventListener('drop', (event) => {
            event.preventDefault();
            removeClass(this.input, 'file-input--dragover');
            this.handleFiles(event.dataTransfer.files);
        });
    }

    handleFiles(fileList) {
        const files = Array.from(fileList);
        const validFiles = [];
        const errors = [];
        
        files.forEach(file => {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(validation.error);
            }
        });
        
        this.files = validFiles;
        
        // Trigger events
        this.input.dispatchEvent(new CustomEvent('files:validated', {
            detail: { files: validFiles, errors }
        }));
        
        if (validFiles.length > 0) {
            this.input.dispatchEvent(new CustomEvent('files:selected', {
                detail: { files: validFiles }
            }));
        }
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.options.maxSize) {
            return {
                valid: false,
                error: `File ${file.name} is too large. Maximum size is ${this.formatFileSize(this.options.maxSize)}`
            };
        }
        
        // Check file type
        if (this.options.allowedTypes.length > 0) {
            const fileType = file.type;
            const fileName = file.name.toLowerCase();
            const isAllowed = this.options.allowedTypes.some(type => 
                fileType.includes(type) || fileName.endsWith(type)
            );
            
            if (!isAllowed) {
                return {
                    valid: false,
                    error: `File ${file.name} is not an allowed file type`
                };
            }
        }
        
        return { valid: true };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFiles() {
        return this.files;
    }

    clear() {
        this.files = [];
        this.input.value = '';
    }
}
