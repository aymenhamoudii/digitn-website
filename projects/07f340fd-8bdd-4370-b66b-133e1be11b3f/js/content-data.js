// ============================================
// THE COPPER FORK - Restaurant Landing Page
// Content Data - Demo Content Seeder
// ============================================

(function() {
    'use strict';
    
    // Check if content has already been seeded
    const CONTENT_SEEDED_KEY = 'copperForkContentSeeded';
    
    function seedContent() {
        if (localStorage.getItem(CONTENT_SEEDED_KEY)) {
            loadContent();
            return;
        }
        
        // About Section Content
        const aboutText1 = "The Copper Fork began as a humble dream in 1987, when James and Catherine Morrison transformed an old carriage house into a gathering place for the community. What started as a small family restaurant has become a landmark of fine dining, yet our core philosophy remains unchanged: serve food that honors the ingredient, the craft, and the guest.";
        
        const aboutText2 = "Today, under the guidance of Executive Chef Marcus Rivera, we continue to push the boundaries of seasonal American cuisine. Our ingredients come from local farms within a 50-mile radius, and our menu changes weekly to reflect what's at the peak of freshness. Every dish tells a story of tradition, innovation, and the love of good food.";
        
        // Menu Data
        const menuData = {
            starters: [
                {
                    name: "Burrata & Heirloom Tomatoes",
                    price: "$18",
                    description: "Fresh burrata, vine-ripened tomatoes, aged balsamic, basil oil"
                },
                {
                    name: "Pan-Seared Scallops",
                    price: "$24",
                    description: "Diver scallops, cauliflower purée, brown butter, capers"
                },
                {
                    name: "Roasted Bone Marrow",
                    price: "$22",
                    description: "Grass-fed marrow, herb gremolata, grilled sourdough"
                },
                {
                    name: "French Onion Soup",
                    price: "$14",
                    description: "Caramelized onions, gruyère crouton, sherry"
                }
            ],
            mains: [
                {
                    name: "Dry-Aged Ribeye",
                    price: "$58",
                    description: "28-day dry-aged, truffle butter, roasted fingerlings, seasonal vegetables"
                },
                {
                    name: "Pan-Roasted Salmon",
                    price: "$42",
                    description: "Wild-caught salmon, lemon beurre blanc, asparagus, quinoa"
                },
                {
                    name: "Braised Short Rib",
                    price: "$48",
                    description: "Red wine reduction, celery root purée, glazed carrots"
                },
                {
                    name: "Roasted Chicken",
                    price: "$36",
                    description: "Free-range chicken, herb jus, baby potatoes, haricots verts"
                }
            ],
            desserts: [
                {
                    name: "Chocolate Lava Cake",
                    price: "$14",
                    description: "Valrhona chocolate, vanilla bean ice cream, raspberry coulis"
                },
                {
                    name: "Crème Brûlée",
                    price: "$12",
                    description: "Classic vanilla custard, caramelized sugar, fresh berries"
                },
                {
                    name: "Seasonal Fruit Tart",
                    price: "$13",
                    description: "Buttery crust, pastry cream, fresh seasonal fruits"
                },
                {
                    name: "Cheese Selection",
                    price: "$18",
                    description: "Artisanal cheeses, honeycomb, candied walnuts, fig compote"
                }
            ]
        };
        
        // Hours data
        const hoursData = {
            weekday: "Monday - Thursday: 5pm - 10pm",
            weekend: "Friday - Saturday: 5pm - 11pm"
        };
        
        // Store content in localStorage
        localStorage.setItem('aboutText1', aboutText1);
        localStorage.setItem('aboutText2', aboutText2);
        localStorage.setItem('menuData', JSON.stringify(menuData));
        localStorage.setItem('hoursData', JSON.stringify(hoursData));
        localStorage.setItem(CONTENT_SEEDED_KEY, 'true');
        
        // Load the content into the DOM
        loadContent();
    }
    
    function loadContent() {
        // Load About content
        const aboutText1 = localStorage.getItem('aboutText1');
        const aboutText2 = localStorage.getItem('aboutText2');
        
        if (aboutText1 && document.getElementById('aboutText1')) {
            document.getElementById('aboutText1').textContent = aboutText1;
        }
        if (aboutText2 && document.getElementById('aboutText2')) {
            document.getElementById('aboutText2').textContent = aboutText2;
        }
        
        // Load Hours
        const hoursData = JSON.parse(localStorage.getItem('hoursData') || '{}');
        if (hoursData.weekday && document.getElementById('hoursWeekday')) {
            document.getElementById('hoursWeekday').textContent = hoursData.weekday;
        }
        if (hoursData.weekend && document.getElementById('hoursWeekend')) {
            document.getElementById('hoursWeekend').textContent = hoursData.weekend;
        }
        
        // Load Menu
        const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
        renderMenu(menuData);
        
        // Initialize reservation form
        initReservationForm();
    }
    
    function renderMenu(menuData) {
        const menuCategories = document.getElementById('menuCategories');
        if (!menuCategories) return;
        
        const categories = [
            { key: 'starters', title: 'Starters' },
            { key: 'mains', title: 'Main Courses' },
            { key: 'desserts', title: 'Desserts' }
        ];
        
        let menuHTML = '';
        
        categories.forEach(category => {
            const items = menuData[category.key] || [];
            
            menuHTML += `
                <div class="menu-category fade-in">
                    <h3 class="menu-category-title">${category.title}</h3>
                    <div class="menu-items">
            `;
            
            items.forEach(item => {
                menuHTML += `
                    <div class="menu-item">
                        <div class="menu-item-details">
                            <div class="menu-item-header">
                                <span class="menu-item-name">${escapeHtml(item.name)}</span>
                                <span class="menu-item-price">${escapeHtml(item.price)}</span>
                            </div>
                            <p class="menu-item-description">${escapeHtml(item.description)}</p>
                        </div>
                    </div>
                `;
            });
            
            menuHTML += `
                    </div>
                </div>
            `;
        });
        
        menuCategories.innerHTML = menuHTML;
    }
    
    function initReservationForm() {
        // Populate date input with today and next 30 days
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date();
            const minDate = today.toISOString().split('T')[0];
            dateInput.min = minDate;
            
            const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            dateInput.value = minDate;
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
        
        // Populate time select
        const timeSelect = document.getElementById('time');
        if (timeSelect) {
            const times = [
                '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', 
                '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', 
                '9:00 PM', '9:30 PM'
            ];
            
            times.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            });
            
            // Set default time
            timeSelect.value = '7:00 PM';
        }
        
        // Populate guests select
        const guestsSelect = document.getElementById('guests');
        if (guestsSelect) {
            for (let i = 1; i <= 8; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + (i === 1 ? ' Guest' : ' Guests');
                guestsSelect.appendChild(option);
            }
            
            // Set default
            guestsSelect.value = '2';
        }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', seedContent);
    } else {
        seedContent();
    }
    
    // Expose for global access
    window.initReservationForm = initReservationForm;
})();
