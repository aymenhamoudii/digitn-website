/**
 * Input Handling System
 * Manages keyboard states and directional vectors
 */

class InputHandler {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => this.handleKey(e, true));
    window.addEventListener('keyup', (e) => this.handleKey(e, false));
  }

  handleKey(e, isPressed) {
    const key = e.key.toLowerCase();
    
    switch(key) {
      case 'arrowup':
      case 'w':
        this.keys.up = isPressed;
        break;
      case 'arrowdown':
      case 's':
        this.keys.down = isPressed;
        break;
      case 'arrowleft':
      case 'a':
        this.keys.left = isPressed;
        break;
      case 'arrowright':
      case 'd':
        this.keys.right = isPressed;
        break;
    }
  }

  /**
   * Returns a normalized direction vector based on current keys
   */
  getDirection() {
    const dx = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    const dy = (this.keys.down ? 1 : 0) - (this.keys.up ? 1 : 0);
    
    // Simple normalization for diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      return { x: dx / length, y: dy / length };
    }
    
    return { x: dx, y: dy };
  }
}

// Global input instance
const input = new InputHandler();
