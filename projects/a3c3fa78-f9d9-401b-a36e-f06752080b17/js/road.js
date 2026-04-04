/**
 * Procedural Road class
 * Simulates movement by scrolling minimalist road segments and lines
 */

class Road {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Road parameters
    this.margin = 0.15; // 15% margin for shoulder
    this.width = canvas.width * (1 - (this.margin * 2));
    this.x = canvas.width * this.margin;
    
    // Scrolling logic
    this.offset = 0;
    this.lineLength = 60;
    this.lineGap = 40;
    this.lineSpeedFactor = 1.0;
  }

  update(playerSpeed, dt) {
    // Road scrolls based on player speed
    this.offset += playerSpeed * dt;
    
    // Loop the line pattern
    if (this.offset > (this.lineLength + this.lineGap)) {
      this.offset %= (this.lineLength + this.lineGap);
    }
  }

  draw() {
    this.ctx.save();
    
    // 1. Draw Asphalt (Dark background already set in CSS, but let's add depth)
    this.ctx.fillStyle = 'hsl(0, 0%, 12%)';
    this.ctx.fillRect(this.x, 0, this.width, this.canvas.height);

    // 2. Road Edges (Shoulders)
    this.ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.15)';
    this.ctx.lineWidth = 4;
    
    // Left edge
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, 0);
    this.ctx.lineTo(this.x, this.canvas.height);
    this.ctx.stroke();

    // Right edge
    this.ctx.beginPath();
    this.ctx.moveTo(this.x + this.width, 0);
    this.ctx.lineTo(this.x + this.width, this.canvas.height);
    this.ctx.stroke();

    // 3. Lane Lines (Center dashed line)
    this.ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([this.lineLength, this.lineGap]);
    this.ctx.lineDashOffset = -this.offset;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, -100);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height + 100);
    this.ctx.stroke();
    
    this.ctx.restore();
  }
}
