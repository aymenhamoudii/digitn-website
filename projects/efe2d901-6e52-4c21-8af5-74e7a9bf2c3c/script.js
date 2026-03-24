// Burger Builder - JavaScript

// Ingredient data with name, calories, and CSS class
const ingredients = [
    { id: 'top-bun', name: 'Top Bun', icon: '🥯', calories: 120, class: 'top-bun' },
    { id: 'lettuce', name: 'Lettuce', icon: '🥬', calories: 10, class: 'lettuce' },
    { id: 'tomato', name: 'Tomato', icon: '🍅', calories: 20, class: 'tomato' },
    { id: 'cheese', name: 'Cheese', icon: '🧀', calories: 80, class: 'cheese' },
    { id: 'patty', name: 'Patty', icon: '🥩', calories: 250, class: 'patty' },
    { id: 'onion', name: 'Onion', icon: '🧅', calories: 15, class: 'onion' },
    { id: 'bacon', name: 'Bacon', icon: '🥓', calories: 100, class: 'bacon' },
    { id: 'pickle', name: 'Pickle', icon: '🥒', calories: 5, class: 'pickle' },
    { id: 'egg', name: 'Egg', icon: '🥚', calories: 70, class: 'egg' },
    { id: 'bottom-bun', name: 'Bottom Bun', icon: '🥯', calories: 120, class: 'bottom-bun' }
];

// State
let burgerStack = [];
let totalCalories = 0;

// DOM Elements
const ingredientsGrid = document.getElementById('ingredientsGrid');
const burgerStackEl = document.getElementById('burgerStack');
const calorieNumber = document.querySelector('.calorie-number');
const layerCount = document.getElementById('layerCount');
const resetBtn = document.getElementById('resetBtn');

// Initialize the app
function init() {
    createIngredientButtons();
    setupEventListeners();
}

// Create ingredient buttons
function createIngredientButtons() {
    ingredientsGrid.innerHTML = '';
    
    ingredients.forEach(ingredient => {
        const btn = document.createElement('button');
        btn.className = 'ingredient-btn';
        btn.dataset.item = ingredient.id;
        btn.innerHTML = `
            <span class="icon">${ingredient.icon}</span>
            <span class="name">${ingredient.name}</span>
            <span class="calories">+${ingredient.calories} kcal</span>
        `;
        btn.addEventListener('click', () => addIngredient(ingredient));
        ingredientsGrid.appendChild(btn);
    });
}

// Add ingredient to burger
function addIngredient(ingredient) {
    // Remove empty message if it exists
    const emptyMsg = document.querySelector('.empty-message');
    if (emptyMsg) {
        emptyMsg.remove();
    }

    // Add to stack
    burgerStack.push(ingredient);
    totalCalories += ingredient.calories;

    // Create layer element
    const layer = document.createElement('div');
    layer.className = `burger-layer ${ingredient.class}`;
    layer.dataset.index = burgerStack.length - 1;
    layer.title = 'Click to remove this layer';
    layer.addEventListener('click', () => removeIngredient(burgerStack.length - 1));

    // Add to DOM
    burgerStackEl.appendChild(layer);

    // Update stats
    updateStats();
}

// Remove ingredient from burger
function removeIngredient(index) {
    const removedIngredient = burgerStack[index];
    totalCalories -= removedIngredient.calories;
    burgerStack.splice(index, 1);

    // Re-render the burger stack
    renderBurgerStack();
    updateStats();
}

// Re-render the burger stack
function renderBurgerStack() {
    burgerStackEl.innerHTML = '';
    
    if (burgerStack.length === 0) {
        burgerStackEl.innerHTML = '<div class="empty-message">Start clicking ingredients to build your burger!</div>';
        return;
    }

    burgerStack.forEach((ingredient, index) => {
        const layer = document.createElement('div');
        layer.className = `burger-layer ${ingredient.class}`;
        layer.dataset.index = index;
        layer.title = 'Click to remove this layer';
        layer.addEventListener('click', () => removeIngredient(index));
        burgerStackEl.appendChild(layer);
    });
}

// Update calorie and layer count displays
function updateStats() {
    // Animate calorie counter
    animateValue(calorieNumber, totalCalories);
    layerCount.textContent = burgerStack.length;
}

// Animate number value
function animateValue(element, endValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 300;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);
        
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Reset burger
function resetBurger() {
    burgerStack = [];
    totalCalories = 0;
    
    burgerStackEl.innerHTML = '<div class="empty-message">Start clicking ingredients to build your burger!</div>';
    updateStats();
}

// Setup event listeners
function setupEventListeners() {
    resetBtn.addEventListener('click', resetBurger);
}

// Start the app
init();
