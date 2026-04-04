/**
 * Traffic Manager class
 * Handles randomized spawning and lifecycle of enemy vehicles
 */

class TrafficManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Enemy settings
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2000; // 2 seconds between spawns
    
    // Possible lanes (based on road layout)
    this.laneWidth = (canvas.width * 0.7) / 2; // 70% road width / 2 lanes
    this.roadLeftEdge = canvas.width * 0.15;
    
    // Enemy car types
    this.carTypes = [
      { color: 'hsl(0, 80%, 60%)', speed: 2, height: 70, width: 40 },
      { color: 'hsl(210, 80%, 60%)', speed: 3, height: 65, width: 40 },
      { color: 'hsl(280, 80%, 60%)', speed: 1.5, height: 80, width: 45 }
    ];
  }

  update(playerSpeed, dt) {
    // 1. Spawning Logic
    this.spawnTimer += dt;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
      
      // Decrease spawn interval as game progresses
      this.spawnInterval = Math.max(500, this.spawnInterval - 10);
    }

    // 2. Update existing enemies
    this.enemies.forEach((enemy, index) => {
      // Enemy speed is relative to player speed + their own movement
      // If player is stopped, enemies move down at their base speed
      // If player is moving fast, enemies seem to zoom backwards
      const relativeMovement = playerSpeed - enemy.speed;
      enemy.y += relativeMovement;

      // 3. Remove if off-screen
      if (enemy.y > this.canvas.height + 200 || enemy.y < -500) {
        this.enemies.splice(index, 1);
      }
    });
  }

  spawnEnemy() {
    const type = this.carTypes[Math.floor(Math.random() * this.carTypes.length)];
    const lane = Math.floor(Math.random() * 2); // 0 or 1
    
    const x = this.roadLeftEdge + (lane * this.laneWidth) + (this.laneWidth / 2) - (type.width / 2);
    
    // Spawn off-screen top
    const y = -200;

    this.enemies.push({
      ...type,
      x,
      y,
      lane
    });
  }

  draw() {
    this.enemies.forEach(enemy => {
      this.ctx.save();
      
      // Glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = enemy.color;
      
      // Body
      this.ctx.fillStyle = enemy.color;
      this.ctx.beginPath();
      this.ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 4);
      this.ctx.fill();
      
      // Windshield
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(enemy.x + 5, enemy.y + 10, enemy.width - 10, 15);
      
      // Headlights (facing player)
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, 8, 3);
      this.ctx.fillRect(enemy.x + enemy.width - 13, enemy.y + enemy.height - 5, 8, 3);
      
      this.ctx.restore();
    });
  }

  reset() {
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2000;
  }
}
