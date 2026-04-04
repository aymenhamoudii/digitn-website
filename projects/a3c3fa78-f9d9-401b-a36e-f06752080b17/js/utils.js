/**
 * Utility functions for the Neon Drive game
 */

const Utils = {
  /**
   * Random number between min and max (inclusive)
   */
  randomRange: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  /**
   * Clamp a value between min and max
   */
  clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

  /**
   * Simple linear interpolation
   */
  lerp: (a, b, t) => a + (b - a) * t,

  /**
   * Check if two rects intersect
   */
  rectIntersect: (r1, r2) => {
    return !(
      r2.x > r1.x + r1.w ||
      r2.x + r2.w < r1.x ||
      r2.y > r1.y + r1.h ||
      r2.y + r2.h < r1.y
    );
  }
};

// Expose for other scripts
window.Utils = Utils;
