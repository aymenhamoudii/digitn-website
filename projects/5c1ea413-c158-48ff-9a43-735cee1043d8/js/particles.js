/**
 * Snake Game - Particle Effects Module
 * Visual effects for eating food
 */

(function() {
    'use strict';

    var canvas, ctx;
    var particles = [];
    var animationId = null;

    // Particle colors
    var COLORS = [
        '#E8B4B8', // dusty rose
        '#F2D0D3', // light dusty rose
        '#A8C5A8', // sage
        '#C4DBC4'  // light sage
    ];

    /**
     * Initialize particles canvas
     */
    function initParticles() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
    }

    /**
     * Particle class
     */
    function Particle(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }

    /**
     * Update particle position
     */
    Particle.prototype.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.97;
    };

    /**
     * Draw particle
     */
    Particle.prototype.draw = function(context) {
        if (!context || this.life <= 0) return;
        
        context.globalAlpha = this.life;
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
    };

    /**
     * Trigger particle burst
     */
    function triggerParticles(x, y, type) {
        if (!canvas) {
            initParticles();
        }
        
        if (!canvas || !ctx) return;
        
        var particleCount = type === 'eat' ? 12 : 8;
        
        for (var i = 0; i < particleCount; i++) {
            particles.push(new Particle(x, y));
        }
        
        // Start animation if not running
        if (!animationId) {
            animateParticles();
        }
    }

    /**
     * Animate particles
     */
    function animateParticles() {
        if (!ctx) return;
        
        // Clear particles area (only the game area, not overlays)
        var gameOverlay = document.getElementById('startOverlay');
        if (gameOverlay && !gameOverlay.classList.contains('hidden')) {
            // Game not started, don't draw particles
            animationId = requestAnimationFrame(animateParticles);
            return;
        }
        
        // Redraw game first
        if (window.draw) {
            window.draw();
        }
        
        // Draw particles on top
        for (var i = particles.length - 1; i >= 0; i--) {
            var particle = particles[i];
            particle.update();
            particle.draw(ctx);
            
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        if (particles.length > 0) {
            animationId = requestAnimationFrame(animateParticles);
        } else {
            animationId = null;
        }
    }

    /**
     * Clear all particles
     */
    function clearParticles() {
        particles = [];
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // Expose functions to window
    window.triggerParticles = triggerParticles;
    window.clearParticles = clearParticles;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }

})();