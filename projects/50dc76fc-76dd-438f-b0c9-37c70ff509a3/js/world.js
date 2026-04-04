/**
 * world.js
 * Manages the parallax scrolling layers for the environment.
 */

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Define parallax layers
        this.layers = [
            { id: 'sky', speedMult: 0.1, y: 0, height: 200, color: '#000033' },
            { id: 'mountains', speedMult: 0.3, y: 100, height: 150, color: '#330033' },
            { id: 'cityline', speedMult: 0.6, y: 150, height: 100, color: '#111122' },
            { id: 'road', speedMult: 1.0, y: 200, height: 300, color: '#1a1a1a' }
        ];

        // Offset tracking for infinite scrolling
        this.layers.forEach(layer => layer.offset = 0);
    }

    update(dt, playerSpeed) {
        this.layers.forEach(layer => {
            // Speed of layer depends on player speed and its multiplier
            const movement = (playerSpeed * layer.speedMult) * (dt / 16.67);
            layer.offset = (layer.offset + movement) % this.width;
        });
    }

    draw(ctx) {
        // Clear background
        ctx.fillStyle = '#000022'; // Deep space blue
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Stars (Simple dots)
        this.drawStars(ctx);

        // Draw each parallax layer
        this.layers.forEach(layer => {
            if (layer.id === 'road') {
                this.drawRoad(ctx, layer);
            } else {
                this.drawGenericLayer(ctx, layer);
            }
        });
    }

    drawStars(ctx) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 200 + this.layers[0].offset) % this.width;
            const y = (i * 150) % 200;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    drawGenericLayer(ctx, layer) {
        ctx.fillStyle = layer.color;
        
        // Use two chunks to create seamless loop
        const drawChunk = (xOffset) => {
            // Simulated jagged/blocky silhouette for pixel look
            ctx.beginPath();
            ctx.moveTo(xOffset, layer.y + layer.height);
            for (let x = 0; x <= this.width; x += 50) {
                const h = Math.sin(x / 100 + layer.offset / 100) * 20 + layer.height;
                ctx.lineTo(x + xOffset, layer.y + layer.height - h);
            }
            ctx.lineTo(xOffset + this.width, layer.y + layer.height);
            ctx.fill();
        };

        drawChunk(-layer.offset);
        drawChunk(this.width - layer.offset);
    }

    drawRoad(ctx, layer) {
        // Main Asphalt
        ctx.fillStyle = '#111';
        ctx.fillRect(0, layer.y, this.width, layer.height);
        
        // Road Markings (Horizontal lines for side-scrolling effect)
        ctx.fillStyle = '#ffcc00';
        const lineW = 60;
        const lineH = 10;
        const gap = 40;
        const step = lineW + gap;

        // Draw multiple lanes
        for (let lane = 0; lane < 3; lane++) {
            const laneY = layer.y + (lane + 1) * (layer.height / 4) - 5;
            for (let x = -step; x < this.width + step; x += step) {
                ctx.fillRect(x - (layer.offset % step), laneY, lineW, lineH);
            }
        }

        // Road Edges (Neon curb glow)
        ctx.fillStyle = '#00ffff'; // Cyber Blue
        ctx.fillRect(0, layer.y - 4, this.width, 4);
        ctx.fillRect(0, layer.y + layer.height, this.width, 4);
    }
}
