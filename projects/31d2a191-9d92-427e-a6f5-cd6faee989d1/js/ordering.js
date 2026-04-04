/* Global scope ordering functions */
(function() {
    let basket = [];
    
    // Selectors
    const sidebar = document.getElementById('order-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-order-btn');
    const closeBtn = document.getElementById('close-order-btn');
    const orderList = document.getElementById('order-items-list');
    const totalPriceEl = document.getElementById('order-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // API
    window.addToOrder = function(item) {
        const existingItem = basket.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            basket.push({...item, quantity: 1});
        }
        updateOrderUI();
        showSidebar();
    };

    function removeFromOrder(id) {
        basket = basket.filter(i => i.id !== id);
        updateOrderUI();
    }

    function updateQuantity(id, delta) {
        const item = basket.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromOrder(id);
            } else {
                updateOrderUI();
            }
        }
    }

    function updateOrderUI() {
        if (basket.length === 0) {
            orderList.innerHTML = '<div class="empty-cart-message">Your basket is empty.</div>';
            totalPriceEl.textContent = '£0.00';
            checkoutBtn.disabled = true;
            return;
        }

        orderList.innerHTML = '';
        let total = 0;

        basket.forEach(item => {
            total += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>£${item.price}</p>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
                </div>
            `;
            orderList.appendChild(itemEl);
        });

        totalPriceEl.textContent = `£${total.toFixed(2)}`;
        checkoutBtn.disabled = false;

        // Re-attach qty listeners
        const qtyBtns = orderList.querySelectorAll('.qty-btn');
        qtyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                updateQuantity(id, action === 'plus' ? 1 : -1);
            });
        });
    }

    function showSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event Listeners
    openBtn.addEventListener('click', showSidebar);
    closeBtn.addEventListener('click', hideSidebar);
    overlay.addEventListener('click', hideSidebar);

    checkoutBtn.addEventListener('click', () => {
        alert('Thank you for your order! In a real scenario, this would redirect to a secure payment gateway.');
        basket = [];
        updateOrderUI();
        hideSidebar();
    });

})();