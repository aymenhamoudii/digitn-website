// Pizza Maker - JavaScript Logic

class PizzaMaker {
    constructor() {
        // Pizza state
        this.pizza = {
            sauce: null,
            cheese: [],
            toppings: []
        };
        
        // Score state
        this.score = {
            sauce: 0,
            cheese: 0,
            toppings: 0,
            balance: 0,
            total: 0
        };
        
        // DOM elements
        this.pizzaSurface = document.getElementById('pizza-surface');
        this.pizzaBase = document.getElementById('pizza-base');
        this.sauceDisplay = document.getElementById('sauce-display');
        this.cheeseDisplay = document.getElementById('cheese-display');
        this.toppingsCount = document.getElementById('toppings-count');
        
        // Score displays
        this.scoreValue = document.getElementById('score-value');
        this.sauceScore = document.getElementById('sauce-score');
        this.cheeseScore = document.getElementById('cheese-score');
        this.toppingsScore = document.getElementById('toppings-score');
        this.balanceScore = document.getElementById('balance-score');
        
        // Modals
        this.ovenModal = document.getElementById('oven-modal');
        this.resultModal = document.getElementById('result-modal');
        
        // Initialize
        this.initDragDrop();
        this.initButtons();
        this.initMenu();
        this.initShare();
    }
    
    // Drag and Drop functionality
    initDragDrop() {
        const toppingItems = document.querySelectorAll('.topping-item');
        const pizzaContainer = document.getElementById('pizza-container');
        
        toppingItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('topping', item.dataset.topping);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            
            // Click to add as well
            item.addEventListener('click', () => {
                this.addTopping(item.dataset.topping);
            });
        });
        
        pizzaContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.pizzaBase.classList.add('drag-over');
        });
        
        pizzaContainer.addEventListener('dragleave', () => {
            this.pizzaBase.classList.remove('drag-over');
        });
        
        pizzaContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.pizzaBase.classList.remove('drag-over');
            const topping = e.dataTransfer.getData('topping');
            if (topping) {
                this.addTopping(topping);
            }
        });
    }
    
    // Add topping to pizza
    addTopping(toppingType) {
        const type = toppingType.split('-')[0];
        
        // Handle sauces
        if (['tomato', 'bbq', 'white'].includes(toppingType)) {
            if (this.pizza.sauce) {
                // Remove old sauce
                this.pizzaSurface.classList.remove(`has-${this.pizza.sauce}`);
            }
            this.pizza.sauce = toppingType;
            this.pizzaSurface.classList.add(`has-${toppingType}`);
            this.sauceDisplay.textContent = this.formatName(toppingType);
            this.updateScore();
            return;
        }
        
        // Handle cheese
        if (['mozzarella', 'parmesan', 'cheddar'].includes(toppingType)) {
            if (!this.pizza.cheese.includes(toppingType)) {
                this.pizza.cheese.push(toppingType);
            }
            
            // Add visual cheese
            const cheeseCount = this.pizza.cheese.length;
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i + (Math.random() - 0.5) * 0.5;
                const radius = 80 + Math.random() * 40;
                const x = 200 + Math.cos(angle) * radius;
                const y = 200 + Math.sin(angle) * radius;
                
                this.createToppingElement(toppingType, x, y);
            }
            
            this.updateCheeseDisplay();
            this.updateScore();
            return;
        }
        
        // Handle regular toppings
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.random() * 100;
        const x = 200 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius;
        
        this.pizza.toppings.push(toppingType);
        this.createToppingElement(toppingType, x, y);
        
        this.toppingsCount.textContent = this.pizza.toppings.length;
        this.updateScore();
    }
    
    // Create visual topping element
    createToppingElement(type, x, y) {
        const topping = document.createElement('div');
        topping.className = `pizza-topping ${type}`;
        topping.style.left = `${x}px`;
        topping.style.top = `${y}px`;
        topping.style.transform = 'translate(-50%, -50%)';
        this.pizzaSurface.appendChild(topping);
        
        // Add slight random rotation for natural look
        topping.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
    }
    
    // Update cheese display
    updateCheeseDisplay() {
        if (this.pizza.cheese.length === 0) {
            this.cheeseDisplay.textContent = 'None';
        } else {
            this.cheeseDisplay.textContent = this.pizza.cheese.map(c => this.formatName(c)).join(', ');
        }
    }
    
    // Format name
    formatName(name) {
        return name.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Update score
    updateScore() {
        // Sauce score
        this.score.sauce = this.pizza.sauce ? 20 : 0;
        
        // Cheese score
        this.score.cheese = this.pizza.cheese.length * 15;
        
        // Toppings score
        this.score.toppings = Math.min(this.pizza.toppings.length * 8, 50);
        
        // Balance score
        this.score.balance = this.calculateBalance();
        
        // Total
        this.score.total = this.score.sauce + this.score.cheese + this.score.toppings + this.score.balance;
        
        // Update display
        this.scoreValue.textContent = this.score.total;
        this.sauceScore.textContent = this.score.sauce;
        this.cheeseScore.textContent = this.score.cheese;
        this.toppingsScore.textContent = this.score.toppings;
        this.balanceScore.textContent = this.score.balance;
    }
    
    // Calculate balance score
    calculateBalance() {
        if (!this.pizza.sauce && this.pizza.cheese.length === 0 && this.pizza.toppings.length === 0) {
            return 0;
        }
        
        // Perfect balance: sauce + cheese + moderate toppings
        let balance = 0;
        
        // Has base
        if (this.pizza.sauce) balance += 10;
        
        // Has cheese
        if (this.pizza.cheese.length > 0) balance += 10;
        
        // Good topping count (3-7 is ideal)
        const toppingCount = this.pizza.toppings.length;
        if (toppingCount >= 3 && toppingCount <= 7) {
            balance += 10;
        } else if (toppingCount > 0 && toppingCount < 3) {
            balance += 5;
        }
        
        return balance;
    }
    
    // Initialize buttons
    initButtons() {
        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearPizza();
        });
        
        // Bake button
        document.getElementById('bake-btn').addEventListener('click', () => {
            this.bakePizza();
        });
        
        // New pizza button
        document.getElementById('new-pizza-btn').addEventListener('click', () => {
            this.resultModal.classList.remove('active');
            this.clearPizza();
        });
        
        // Share result button
        document.getElementById('share-result-btn').addEventListener('click', () => {
            this.shareResult();
        });
    }
    
    // Clear pizza
    clearPizza() {
        this.pizza = {
            sauce: null,
            cheese: [],
            toppings: []
        };
        
        this.pizzaSurface.className = 'pizza-surface';
        this.pizzaSurface.innerHTML = '';
        this.pizzaBase.classList.remove('baked');
        
        this.sauceDisplay.textContent = 'None';
        this.cheeseDisplay.textContent = 'None';
        this.toppingsCount.textContent = '0';
        
        this.updateScore();
    }
    
    // Bake pizza
    bakePizza() {
        if (!this.pizza.sauce && this.pizza.toppings.length === 0 && this.pizza.cheese.length === 0) {
            alert('Add some toppings before baking!');
            return;
        }
        
        this.ovenModal.classList.add('active');
        
        // Create oven pizza preview
        const ovenPizza = document.getElementById('oven-pizza');
        
        // Simulate baking
        let bakeTime = 0;
        const bakeDuration = 8;
        const progressFill = document.getElementById('progress-fill');
        const bakeTimeDisplay = document.getElementById('bake-time');
        const bakeStatus = document.getElementById('bake-status');
        
        ovenPizza.classList.add('baking');
        
        const bakeInterval = setInterval(() => {
            bakeTime++;
            const progress = (bakeTime / bakeDuration) * 100;
            progressFill.style.width = `${progress}%`;
            bakeTimeDisplay.textContent = bakeTime;
            
            if (bakeTime === 2) {
                bakeStatus.textContent = 'Baking...';
            } else if (bakeTime === 5) {
                bakeStatus.textContent = 'Almost done!';
            } else if (bakeTime >= bakeDuration) {
                clearInterval(bakeInterval);
                bakeStatus.textContent = 'Done!';
                ovenPizza.classList.remove('baking');
                
                setTimeout(() => {
                    this.finishBaking();
                }, 1000);
            }
        }, 1000);
    }
    
    // Finish baking
    finishBaking() {
        this.ovenModal.classList.remove('active');
        
        // Mark pizza as baked
        this.pizzaBase.classList.add('baked');
        
        // Darken toppings
        const toppings = this.pizzaSurface.querySelectorAll('.pizza-topping');
        toppings.forEach(t => {
            t.style.filter = 'brightness(0.8)';
        });
        
        // Show result modal
        this.showResult();
    }
    
    // Show result
    showResult() {
        const finalPizza = document.getElementById('final-pizza');
        const finalScore = document.getElementById('final-score');
        const scoreMessage = document.getElementById('score-message');
        
        // Clone pizza appearance
        finalPizza.style.background = this.pizza.sauce 
            ? `var(--dough)` 
            : '#f5deb3';
        finalPizza.style.position = 'relative';
        
        // Add sauce color
        if (this.pizza.sauce) {
            const sauceColor = this.pizza.sauce === 'tomato-sauce' ? '#e63946' :
                              this.pizza.sauce === 'bbq-sauce' ? '#8b4513' : '#fffaf0';
            finalPizza.style.background = `linear-gradient(135deg, ${sauceColor} 0%, ${sauceColor} 100%)`;
        }
        
        finalScore.textContent = this.score.total;
        scoreMessage.textContent = this.getScoreMessage();
        
        this.resultModal.classList.add('active');
    }
    
    // Get score message
    getScoreMessage() {
        const score = this.score.total;
        if (score >= 90) return "Perfect! You're a master pizza chef! 🌟";
        if (score >= 70) return "Great job! Delicious pizza! 🍕";
        if (score >= 50) return "Good work! Nice pizza! 👍";
        if (score >= 30) return "Not bad! Keep practicing! 💪";
        return "Keep experimenting! You'll get better! 🔄";
    }
    
    // Initialize menu presets
    initMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const preset = item.dataset.preset;
                this.loadPreset(preset);
            });
        });
    }
    
    // Load preset pizza
    loadPreset(preset) {
        this.clearPizza();
        
        const presets = {
            'margherita': {
                sauce: 'tomato-sauce',
                cheese: ['mozzarella'],
                toppings: ['basil']
            },
            'pepperoni': {
                sauce: 'tomato-sauce',
                cheese: ['mozzarella'],
                toppings: ['pepperoni', 'pepperoni', 'pepperoni']
            },
            'hawaiian': {
                sauce: 'tomato-sauce',
                cheese: ['mozzarella'],
                toppings: ['pineapple', 'bacon']
            },
            'bbq-chicken': {
                sauce: 'bbq-sauce',
                cheese: ['mozzarella', 'cheddar'],
                toppings: ['bacon', 'onions']
            },
            'vegetarian': {
                sauce: 'tomato-sauce',
                cheese: ['mozzarella'],
                toppings: ['mushrooms', 'olives', 'peppers', 'onions']
            },
            'supreme': {
                sauce: 'tomato-sauce',
                cheese: ['mozzarella', 'parmesan'],
                toppings: ['pepperoni', 'mushrooms', 'olives', 'peppers', 'onions', 'bacon']
            }
        };
        
        const pizza = presets[preset];
        if (!pizza) return;
        
        // Add sauce
        if (pizza.sauce) {
            this.addTopping(pizza.sauce);
        }
        
        // Add cheese
        pizza.cheese.forEach(cheese => {
            this.addTopping(cheese);
        });
        
        // Add toppings
        pizza.toppings.forEach(topping => {
            this.addTopping(topping);
        });
    }
    
    // Initialize share functionality
    initShare() {
        document.getElementById('share-facebook').addEventListener('click', () => {
            this.shareToFacebook();
        });
        
        document.getElementById('share-twitter').addEventListener('click', () => {
            this.shareToTwitter();
        });
        
        document.getElementById('share-copy').addEventListener('click', () => {
            this.copyShareLink();
        });
    }
    
    // Share to Facebook
    shareToFacebook() {
        const text = `I made a pizza with ${this.score.total} points on Pizza Maker! 🍕`;
        const url = 'https://pizza-maker.example.com';
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    }
    
    // Share to Twitter
    shareToTwitter() {
        const text = `I made a pizza with ${this.score.total} points on Pizza Maker! 🍕 Check it out!`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
    
    // Copy share link
    copyShareLink() {
        const text = `I made a pizza with ${this.score.total} points on Pizza Maker! 🍕`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    }
    
    // Share result
    shareResult() {
        this.copyShareLink();
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new PizzaMaker();
});