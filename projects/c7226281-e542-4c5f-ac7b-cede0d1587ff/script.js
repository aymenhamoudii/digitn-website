// Talking Tom Game - JavaScript

class TalkingTomGame {
  constructor() {
    // Game state
    this.friendship = 10;
    this.friendshipLevel = 1;
    this.soundEnabled = true;
    this.isInteracting = false;
    
    // DOM elements
    this.friendshipBar = document.getElementById('friendship-bar');
    this.friendshipLevelEl = document.getElementById('friendship-level');
    this.tom = document.getElementById('tom');
    this.heartsContainer = document.getElementById('hearts');
    this.sparklesContainer = document.getElementById('sparkles');
    this.soundToggle = document.getElementById('sound-toggle');
    
    // Tom's parts
    this.headZone = document.getElementById('head-zone');
    this.bellyZone = document.getElementById('belly-zone');
    this.pawLeft = document.getElementById('paw-left');
    this.pawRight = document.getElementById('paw-right');
    this.tailZone = document.getElementById('tail-zone');
    this.chinZone = document.getElementById('chin-zone');
    this.noseZone = document.getElementById('nose-zone');
    
    // Eye elements for expressions
    this.eyeLeft = document.getElementById('eye-left');
    this.eyeRight = document.getElementById('eye-right');
    this.mouth = document.querySelector('.mouth');
    this.mouthLeft = document.getElementById('mouth-left');
    this.mouthRight = document.getElementById('mouth-right');
    
    // Sound context
    this.audioContext = null;
    
    this.init();
  }
  
  init() {
    this.initAudio();
    this.bindEvents();
    this.updateFriendshipUI();
  }
  
  // Initialize Web Audio API for sound effects
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }
  
  // Play a sound effect
  playSound(type) {
    if (!this.soundEnabled || !this.audioContext) return;
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    switch(type) {
      case 'purr':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;
        
      case 'meow':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
        break;
        
      case 'happy':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;
        
      case 'pop':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
        break;
        
      case 'swish':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;
    }
  }
  
  // Bind click/touch events
  bindEvents() {
    // Head - Pet
    this.headZone.addEventListener('click', () => this.petHead());
    
    // Belly - Rub
    this.bellyZone.addEventListener('click', () => this.rubBelly());
    
    // Paws - Play
    this.pawLeft.addEventListener('click', () => this.playWithPaw('left'));
    this.pawRight.addEventListener('click', () => this.playWithPaw('right'));
    
    // Tail - Swish
    this.tailZone.addEventListener('click', () => this.swishTail());
    
    // Chin - Scratch
    this.chinZone.addEventListener('click', () => this.scratchChin());
    
    // Nose - Boop
    this.noseZone.addEventListener('click', () => this.boopNose());
    
    // Sound toggle
    this.soundToggle.addEventListener('click', () => this.toggleSound());
    
    // Tom hover - get attention
    this.tom.addEventListener('mouseenter', () => this.getAttention());
    this.tom.addEventListener('mouseleave', () => this.calmDown());
  }
  
  // Pet the head
  petHead() {
    if (this.isInteracting) return;
    this.isInteracting = true;
    
    this.playSound('purr');
    this.showExpression('happy');
    this.createHearts(5);
    this.addFriendship(15);
    this.tom.classList.add('bouncing');
    
    setTimeout(() => {
      this.tom.classList.remove('bouncing');
      this.isInteracting = false;
    }, 500);
  }
  
  // Rub the belly
  rubBelly() {
    if (this.isInteracting) return;
    this.isInteracting = true;
    
    this.playSound('happy');
    this.showExpression('happy');
    this.createHearts(8);
    this.createSparkles(10);
    this.addFriendship(20);
    this.tom.classList.add('rolling');
    
    setTimeout(() => {
      this.tom.classList.remove('rolling');
      this.isInteracting = false;
    }, 600);
  }
  
  // Play with paw
  playWithPaw(side) {
    if (this.isInteracting) return;
    this.isInteracting = true;
    
    const paw = side === 'left' ? this.pawLeft : this.pawRight;
    
    this.playSound('pop');
    this.showExpression('surprised');
    this.createSparkles(5);
    this.addFriendship(10);
    
    paw.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      paw.style.transform = '';
      this.isInteracting = false;
    }, 300);
  }
  
  // Swish tail
  swishTail() {
    if (this.isInteracting) return;
    this.isInteracting = true;
    
    this.playSound('swish');
    this.showExpression('happy');
    this.addFriendship(5);
    
    const tail = document.querySelector('.tail-segments');
    tail.style.animationDuration = '0.3s';
    
    setTimeout(() => {
      tail.style.animationDuration = '2s';
      this.isInteracting = false;
    }, 500);
  }
  
  // Scratch chin
  scratchChin() {
    if (this.isInteracting) return;
    this.isInteracting = true;
    
    this.playSound('meow');
    this.showExpression('happy');
    this.createHearts(6);
    this.addFriendship(12);
    this.tom.classList.add('shaking');
    
    setTimeout(() => {
      this.tom.classList.remove('shaking');
      this.isInteracting = false;
    }, 500);
  }
  
  // Boop nose
  boopNose() {
    if (this.isInteracting) return;
    this.isInteracting = true;
    
    this.playSound('pop');
    this.showExpression('surprised');
    this.tom.classList.add('shrinking');
    
    setTimeout(() => {
      this.tom.classList.remove('shrinking');
      this.showExpression('normal');
      this.isInteracting = false;
    }, 300);
  }
  
  // Get attention on hover
  getAttention() {
    if (this.isInteracting) return;
    this.showExpression('surprised');
  }
  
  // Calm down on mouse leave
  calmDown() {
    if (!this.isInteracting) {
      this.showExpression('normal');
    }
  }
  
  // Show facial expression
  showExpression(type) {
    // Reset all expressions
    this.eyeLeft.className = 'eye eye-left';
    this.eyeRight.className = 'eye eye-right';
    this.mouth.className = 'mouth';
    
    switch(type) {
      case 'happy':
        this.eyeLeft.classList.add('happy');
        this.eyeRight.classList.add('happy');
        this.mouth.classList.add('happy');
        break;
      case 'surprised':
        this.eyeLeft.classList.add('surprised');
        this.eyeRight.classList.add('surprised');
        break;
      case 'closed':
        this.eyeLeft.classList.add('closed');
        this.eyeRight.classList.add('closed');
        break;
      default:
        // Normal expression - do nothing (classes reset above)
        break;
    }
  }
  
  // Create floating hearts
  createHearts(count) {
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.style.left = `${Math.random() * 200 + 40}px`;
      heart.style.top = `${Math.random() * 100 + 50}px`;
      heart.style.animationDelay = `${i * 0.1}s`;
      this.heartsContainer.appendChild(heart);
      
      setTimeout(() => heart.remove(), 1500 + i * 100);
    }
  }
  
  // Create sparkles
  createSparkles(count) {
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${Math.random() * 200 + 40}px`;
      sparkle.style.top = `${Math.random() * 200 + 100}px`;
      sparkle.style.animationDelay = `${i * 0.05}s`;
      this.sparklesContainer.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 800 + i * 50);
    }
  }
  
  // Add friendship points
  addFriendship(amount) {
    this.friendship += amount;
    if (this.friendship >= 100) {
      this.friendship = 100;
      this.friendshipLevel++;
    }
    this.updateFriendshipUI();
  }
  
  // Update friendship UI
  updateFriendshipUI() {
    this.friendshipBar.style.width = `${this.friendship}%`;
    this.friendshipLevelEl.textContent = `Level ${this.friendshipLevel}`;
    
    // Change color based on level
    if (this.friendshipLevel >= 5) {
      this.friendshipBar.style.background = 'linear-gradient(90deg, #ff6b9d, #ffd93d)';
    } else if (this.friendshipLevel >= 3) {
      this.friendshipBar.style.background = 'linear-gradient(90deg, #ff7b54, #ffd93d)';
    } else {
      this.friendshipBar.style.background = 'linear-gradient(90deg, var(--primary), var(--accent))';
    }
  }
  
  // Toggle sound
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundToggle.classList.toggle('muted', !this.soundEnabled);
    
    if (this.soundEnabled && this.audioContext) {
      this.playSound('pop');
    }
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.tomGame = new TalkingTomGame();
});

// Also handle audio context on first user interaction
document.addEventListener('click', () => {
  if (window.tomGame && window.tomGame.audioContext) {
    if (window.tomGame.audioContext.state === 'suspended') {
      window.tomGame.audioContext.resume();
    }
  }
}, { once: true });
