/**
 * Player Car class
 * Handles player vehicle physics, movement, and rendering
 */

class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Initializing dimensions (minimalist box)
    this.width = 40;
    this.height = 70;
    
    // Position (centered horizontally, bottom of screen)
    this.x = (this.canvas.width / 2) - (this.width / 2);
    this.y = this.canvas.height - this.height - 100;
    
    // Movement Stats (Upgradeable)
    this.baseSpeed = 0; // Current velocity (forward)
    this.maxSpeed = 8;
    this.acceleration = 0.15;
    this.deceleration = 0.05;
    
    // Lateral Handling (Upgradeable)
    this.lateralSpeed = 5;
    this.targetLateralSpeed = 5;
    
    // Visual parameters
    this.glowColor = 'hsl(180, 100%, 50%)';
    this.bodyColor = 'white';
    
    // State management
    this.isCrashed = false;
  }

  update(input, dt) {
    if (this.isCrashed) return;

    // 1. Vertical Movement (Endless simulation speed up/down)
    if (input.keys.up) {
      this.baseSpeed = Math.min(this.baseSpeed + this.acceleration, this.maxSpeed);
    } else if (input.keys.down) {
      this.baseSpeed = Math.max(this.baseSpeed - this.acceleration * 2, 0);
    } else {
      // Natural slowing down
      this.baseSpeed = Math.max(this.baseSpeed - this.deceleration, 0);
    }

    // 2. Lateral Movement (Handling)
    const direction = input.getDirection();
    this.x += direction.x * this.lateralSpeed;

    // 3. Keep within road boundaries
    // Let's assume a 15% margin on each side for road shoulders
    const roadMargin = this.canvas.width * 0.15;
    const minX = roadMargin;
    const maxX = this.canvas.width - roadMargin - this.width;

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    
    // Vertical limits (stay in bottom third)
    const minY = this.canvas.height * 0.6;
    const maxY = this.canvas.height - this.height - 40;
    
    this.y += direction.y * this.lateralSpeed;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;
  }

  draw() {
    this.ctx.save();
    
    // Drawing the vehicle - Neon Minimalist Style
    
    // Glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = this.glowColor;
    
    // Main Body
    this.ctx.fillStyle = this.bodyColor;
    this.ctx.beginPath();
    this.ctx.roundRect(this.x, this.y, this.width, this.height, 4);
    this.ctx.fill();
    
    // Detail Lines (Windshield etc)
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.x + 5, this.y + 10, this.width - 10, 15);
    
    // Tail lights
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.x + 5, this.y + this.height - 5, 8, 3);
    this.ctx.fillRect(this.x + this.width - 13, this.y + this.height - 5, 8, 3);
    
    this.ctx.restore();
  }

  reset() {
    this.x = (this.canvas.width / 2) - (this.width / 2);
    this.y = this.canvas.height - this.height - 100;
    this.baseSpeed = 0;
    this.isCrashed = false;
  }
}
