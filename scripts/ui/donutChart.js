/**
 * Donut Chart Component
 * Lightweight canvas-based donut chart with animation support
 */

'use strict';

export class DonutChart {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.values = options.values || [];
        this.colors = options.colors || [];
        this.thickness = options.thickness || 28;
        this.centerText = options.centerText || '';
        this.animationDuration = options.animationDuration || 180;
        
        // Set up canvas for high DPI displays
        this.setupCanvas();
        
        // Draw initial chart
        this.draw();
    }
    
    /**
     * Set up canvas for high DPI displays
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    /**
     * Draw the donut chart
     */
    draw() {
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(centerX, centerY) - 4;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Calculate total
        const sum = this.values.reduce((a, b) => a + b, 0) || 1;
        
        // Draw segments
        let startAngle = -Math.PI / 2; // Start from top
        
        this.values.forEach((value, index) => {
            if (value <= 0) return;
            
            const angle = (value / sum) * Math.PI * 2;
            
            // Draw arc
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getColor(index);
            this.ctx.lineWidth = this.thickness;
            this.ctx.lineCap = 'round';
            this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            this.ctx.stroke();
            
            startAngle += angle;
        });
        
        // Draw center text
        if (this.centerText) {
            this.ctx.fillStyle = this.getComputedColor('--ink-900') || '#0f172a';
            this.ctx.font = '600 28px ui-sans-serif, system-ui, -apple-system, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.centerText, centerX, centerY);
        }
    }
    
    /**
     * Get color for segment
     */
    getColor(index) {
        if (this.colors[index]) {
            return this.getComputedColor(this.colors[index]) || this.colors[index];
        }
        return this.getDefaultColor(index);
    }
    
    /**
     * Get computed CSS color value
     */
    getComputedColor(cssVar) {
        if (cssVar.startsWith('var(')) {
            return getComputedStyle(document.documentElement)
                .getPropertyValue(cssVar.slice(4, -1))
                .trim();
        }
        return cssVar;
    }
    
    /**
     * Get default color for segment
     */
    getDefaultColor(index) {
        const defaultColors = [
            'var(--brand-blue-500)',
            'var(--brand-green-500)',
            'var(--ink-500)',
            'var(--brand-blue-600)',
            'var(--brand-green-600)'
        ];
        return this.getComputedColor(defaultColors[index % defaultColors.length]) || '#64748b';
    }
    
    /**
     * Update chart data
     */
    update(values, colors = null, centerText = null) {
        this.values = values || this.values;
        this.colors = colors || this.colors;
        this.centerText = centerText !== null ? centerText : this.centerText;
        this.draw();
    }
    
    /**
     * Animate chart (simple implementation)
     */
    animate(values, colors = null, centerText = null) {
        const startValues = [...this.values];
        const endValues = values || this.values;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate values
            const currentValues = startValues.map((start, index) => {
                const end = endValues[index] || 0;
                return start + (end - start) * eased;
            });
            
            this.update(currentValues, colors, centerText);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Resize chart
     */
    resize() {
        this.setupCanvas();
        this.draw();
    }
    
    /**
     * Destroy chart
     */
    destroy() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
