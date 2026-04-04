/**
 * player.js
 * Implements the player vehicle control, movement, and drawing.
 */

export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Base vehicle dimensions
        this.width = 120;
        this.height = 60;
        
        this.reset();
        this.bindControls();
    }

    reset() {
        // Initial position
        this.x = 100;
        this.y = this.canvasHeight / 2 - this.height / 2;
        
        // Stats
        this.health = 100;
        this.nitro = 0;
        this.speed = 100; // In arbitrary units, world scrolling depends on this
        this.maxSpeed = 250;
        this.acceleration = 0.5;
        this.deceleration = 0.3;
        
        // Physics / Movement
        this.velocity = { x: 0, y: 0 };
        this.isBoosting = false;
        
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        };
    }

    bindControls() {
        this.keyMap = {
            'ArrowUp': 'up',
            'w': 'up',
            'W': 'up',
            'ArrowDown': 'down',
            's': 'down',
            'S': 'down',
            'ArrowLeft': 'left',
            'a': 'left',
            'A': 'left',
            'ArrowRight': 'right',
            'd': 'right',
            'D': 'right',
            ' ': 'space'
        };
    }

    handleKeyDown(e) {
        if (this.keyMap[e.key]) {
            this.input[this.keyMap[e.key]] = true;
        }
    }

    handleKeyUp(e) {
        if (this.keyMap[e.key]) {
            this.input[this.keyMap[e.key]] = false;
        }
    }

    update(dt, upgrades) {
        // Apply upgrades from shop
        const upgradeSpeedMult = 1 + (upgrades.speed.level - 1) * 0.2;
        const upgradeHandlingMult = 1 + (upgrades.handling.level - 1) * 0.2;
        
        // Movement constants
        const moveSpeed = 6 * upgradeHandlingMult;
        const baseTopSpeed = this.maxSpeed * upgradeSpeedMult;
        
        // Horizontal logic (Speed control)
        if (this.input.right) {
            this.speed += this.acceleration;
        } else if (this.input.left) {
            this.speed -= this.acceleration * 1.5;
        } else {
            this.speed -= this.deceleration;
        }

        // Clamp Speed
        if (this.speed < 80) this.speed = 80;
        if (this.speed > baseTopSpeed) this.speed = baseTopSpeed;

        // Nitro Boost
        if (this.input.space && this.nitro > 0) {
            this.isBoosting = true;
            this.speed += this.acceleration * 3;
            this.nitro -= 1;
        } else {
            this.isBoosting = false;
            if (this.nitro < 100) this.nitro += 0.05; // Auto recharge slowly
        }

        // Vertical Movement (Lane shifting/Fine steering)
        if (this.input.up) {
            this.y -= moveSpeed;
        } else if (this.input.down) {
            this.y += moveSpeed;
        }

        // Boundary Clamping (Don't leave the road)
        const roadTop = 150;
        const roadBottom = this.canvasHeight - 150;
        
        if (this.y < roadTop) this.y = roadTop;
        if (this.y > roadBottom - this.height) this.y = roadBottom - this.height;
    }

    takeDamage(amount, upgrades) {
        // Apply shield/chassis upgrade to damage reduction
        const shieldLevel = upgrades?.shield?.level || 1;
        const reduction = (shieldLevel - 1) * 0.1;
        this.health -= amount * (1 - reduction);
        if (this.health < 0) this.health = 0;
    }

    refillNitro() {
        this.nitro = Math.min(100, this.nitro + 30);
    }

    getCollisionBox() {
        // Slightly smaller than visual width/height for fairer collisions
        const padding = 10;
        return {
            x: this.x + padding,
            y: this.y + padding,
            w: this.width - (padding * 2),
            h: this.height - (padding * 2)
        };
    }

    draw(ctx) {
        ctx.save();
        
        // Translate to player center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Add slight tilt based on Y movement
        if (this.input.up) ctx.rotate(-0.05);
        if (this.input.down) ctx.rotate(0.05);

        // Visual Effects: Boost flames
        if (this.isBoosting) {
            this.drawFlames(ctx);
        }

        // Draw Car Body (Pixel Art Simulation)
        ctx.fillStyle = this.isBoosting ? '#ff0066' : '#cc00cc'; // Neon Pink/Purple
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Cabin/Windshield
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-this.width / 4, -this.height / 2, this.width / 2, this.height / 2);
        
        // Details (Racing Stripes)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.width / 2, -5, this.width, 10);
        
        // Wheels
        ctx.fillStyle = '#111';
        ctx.fillRect(-this.width / 2 + 10, -this.height / 2 - 5, 25, 15); // Front left
        ctx.fillRect(this.width / 2 - 35, -this.height / 2 - 5, 25, 15); // Front right
        ctx.fillRect(-this.width / 2 + 10, this.height / 2 - 10, 25, 15); // Back left
        ctx.fillRect(this.width / 2 - 35, this.height / 2 - 10, 25, 15); // Back right

        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(this.width / 2 - 10, -this.height / 2 + 5, 10, 15);
        ctx.fillRect(this.width / 2 - 10, this.height / 2 - 20, 10, 15);

        ctx.restore();
    }

    drawFlames(ctx) {
        ctx.fillStyle = '#ffcc00';
        for (let i = 0; i < 3; i++) {
            const size = 15 + Math.random() * 20;
            ctx.fillRect(-this.width / 2 - size, -10 + i * 5, size, 10);
        }
    }
}
