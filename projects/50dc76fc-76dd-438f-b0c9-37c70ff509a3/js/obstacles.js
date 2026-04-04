/**
 * obstacles.js
 * Spawns and manages hazards/collectables on the road.
 */

class Obstacle {
    constructor(type, x, y, width, height, color) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.hit = false;
        this.pulse = 0;
    }

    getCollisionBox() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    update(dt, playerSpeed) {
        this.x -= (playerSpeed / 16.67) * dt;
        this.pulse += 0.1;
    }

    draw(ctx) {
        if (this.hit) return;

        ctx.save();
        if (this.type === 'coin') {
            this.drawCoin(ctx);
        } else if (this.type === 'nitro') {
            this.drawNitro(ctx);
        } else {
            this.drawCar(ctx);
        }
        ctx.restore();
    }

    drawCoin(ctx) {
        const offset = Math.sin(this.pulse) * 5;
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y + offset, this.width, this.height);
        ctx.strokeStyle = '#ff9900';
        ctx.strokeRect(this.x + 4, this.y + 4 + offset, this.width - 8, this.height - 8);
    }

    drawNitro(ctx) {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    drawCar(ctx) {
        // Simple enemy car (rectangle with details)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Windshield
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 10, this.y + 10, 20, this.height - 20);
        
        // Tail lights
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 2, this.y + 5, 4, 10);
        ctx.fillRect(this.x + 2, this.y + this.height - 15, 4, 10);
    }
}

export class ObstacleManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
        
        this.types = [
            { id: 'hazard', w: 100, h: 50, color: '#555555' },
            { id: 'coin', w: 30, h: 30, color: '#ffff00' },
            { id: 'nitro', w: 40, h: 40, color: '#00ffff' }
        ];
    }

    reset() {
        this.items = [];
        this.spawnTimer = 0;
        this.minSpawnInterval = 800;
        this.maxSpawnInterval = 2000;
    }

    update(dt, playerSpeed) {
        // Speed up spawn as game gets harder?
        const currentInterval = Math.max(this.minSpawnInterval, this.maxSpawnInterval - (playerSpeed * 2));
        
        this.spawnTimer += dt;
        if (this.spawnTimer > currentInterval) {
            this.spawn();
            this.spawnTimer = 0;
        }

        // Update movement & Cleanup
        this.items.forEach((item, index) => {
            item.update(dt, playerSpeed);
            if (item.x + item.width < 0) {
                this.items.splice(index, 1);
            }
        });
    }

    spawn() {
        const rand = Math.random();
        let typeInfo;
        
        if (rand < 0.6) typeInfo = this.types[0]; // 60% Hazard
        else if (rand < 0.9) typeInfo = this.types[1]; // 30% Coin
        else typeInfo = this.types[2]; // 10% Nitro

        const y = 150 + Math.random() * (this.height - 300 - typeInfo.h);
        
        this.items.push(new Obstacle(
            typeInfo.id,
            this.width + 50,
            y,
            typeInfo.w,
            typeInfo.h,
            typeInfo.color
        ));
    }

    draw(ctx) {
        this.items.forEach(item => item.draw(ctx));
    }
}
