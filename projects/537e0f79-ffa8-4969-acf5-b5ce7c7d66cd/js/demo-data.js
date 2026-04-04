// Demo Data Seeder for Bella Vista Restaurant Website

export class DemoDataSeeder {
    constructor() {
        this.seeded = false;
        this.init();
    }

    init() {
        // Check if demo data has already been seeded
        const isSeeded = localStorage.getItem('bellavistaDemoSeeded');

        if (!isSeeded) {
            console.log('Seeding demo data for Bella Vista restaurant...');
            this.seedAllData();
            localStorage.setItem('bellavistaDemoSeeded', 'true');
            this.seeded = true;
        } else {
            console.log('Demo data already seeded, skipping initialization.');
            this.seeded = true;
        }
    }

    seedAllData() {
        // Seed menu data
        this.seedMenuData();

        // Seed gallery data
        this.seedGalleryData();

        // Seed business information
        this.seedBusinessInfo();
    }

    seedMenuData() {
        const menuItems = [
            // Appetizers
            {
                name: "Bruschetta Trio",
                description: "Three varieties of our signature bruschetta: classic tomatoes, roasted garlic, and pesto.",
                price: 14.95,
                category: "appetizers",
                tags: ["vegetarian", "signature"],
                ingredients: ["baguette", "tomatoes", "garlic", "basil", "olive oil"]
            },
            {
                name: "Arancini Siciliani",
                description: "Crispy risotto balls stuffed with mozzarella, served with marinara sauce.",
                price: 12.95,
                category: "appetizers",
                tags: ["vegetarian"],
                ingredients: ["arborio rice", "mozzarella", "parmesan", "breadcrumbs"]
            },
            {
                name: "Antipasto Platter",
                description: "Selection of cured meats, cheeses, olives, and marinated vegetables.",
                price: 18.95,
                category: "appetizers",
                tags: ["seasonal"],
                ingredients: ["prosciutto", "salami", "mozzarella", "artichokes", "olives"]
            },
            {
                name: "Caprese Skewers",
                description: "Fresh mozzarella, cherry tomatoes, and basil drizzled with balsamic glaze.",
                price: 13.95,
                category: "appetizers",
                tags: ["vegetarian", "gluten-free"],
                ingredients: ["mozzarella", "cherry tomatoes", "basil", "balsamic"]
            },

            // Mains
            {
                name: "Spaghetti Carbonara",
                description: "Classic Roman pasta with eggs, Pecorino Romano, guanciale, and black pepper.",
                price: 22.95,
                category: "mains",
                tags: ["signature"],
                ingredients: ["spaghetti", "guanciale", "eggs", "pecorino", "black pepper"]
            },
            {
                name: "Osso Buco alla Milanese",
                description: "Braised veal shanks with saffron risotto and gremolata.",
                price: 34.95,
                category: "mains",
                tags: ["signature"],
                ingredients: ["veal shanks", "risotto", "saffron", "lemon", "parsley"]
            },
            {
                name: "Eggplant Parmigiana",
                description: "Layers of breaded eggplant, marinara sauce, and three cheeses.",
                price: 20.95,
                category: "mains",
                tags: ["vegetarian"],
                ingredients: ["eggplant", "marinara", "mozzarella", "parmesan", "ricotta"]
            },
            {
                name: "Risotto ai Funghi",
                description: "Creamy mushroom risotto with wild mushrooms and truffle oil.",
                price: 24.95,
                category: "mains",
                tags: ["vegetarian", "vegan-options"],
                ingredients: ["arborio rice", "wild mushrooms", "truffle oil", "white wine"]
            },
            {
                name: "Grilled Branzino",
                description: "Mediterranean sea bass with lemon, herbs, and olive oil.",
                price: 28.95,
                category: "mains",
                tags: ["gluten-free"],
                ingredients: ["sea bass", "lemon", "herbs", "olive oil", "rosemary"]
            },
            {
                name: "Chicken Piccata",
                description: "Tender chicken breast in lemon-caper sauce with angel hair pasta.",
                price: 26.95,
                category: "mains",
                tags: [],
                ingredients: ["chicken breast", "capers", "lemon", "white wine", "pasta"]
            },

            // Desserts
            {
                name: "Tiramisu Classico",
                description: "Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone.",
                price: 8.95,
                category: "desserts",
                tags: ["signature", "seasonal"],
                ingredients: ["mascarpone", "ladyfingers", "espresso", "coffee liqueur", "cocoa"]
            },
            {
                name: "Panna Cotta",
                description: "Silky vanilla panna cotta with seasonal berry compote.",
                price: 7.95,
                category: "desserts",
                tags: ["vegetarian", "gluten-free"],
                ingredients: ["cream", "vanilla", "berries", "gelatin"]
            },
            {
                name: "Gelato Selection",
                description: "Three scoops of house-made gelato in seasonal flavors.",
                price: 9.95,
                category: "desserts",
                tags: ["vegetarian", "gluten-free"],
                ingredients: ["house-made gelato", "seasonal flavors"]
            },
            {
                name: "Affogato",
                description: "Espresso poured over vanilla gelato.",
                price: 6.95,
                category: "desserts",
                tags: ["vegetarian", "gluten-free"],
                ingredients: ["espresso", "vanilla gelato"]
            },

            // Drinks
            {
                name: "House Wine Selection",
                description: "Red, white, or rosé from our curated Italian vineyards.",
                price: 8.95,
                category: "drinks",
                tags: ["gluten-free"],
                ingredients: ["Italian wine"]
            },
            {
                name: "Aperol Spritz",
                description: "Classic Italian aperitif with Aperol, Prosecco, and soda water.",
                price: 12.95,
                category: "drinks",
                tags: ["gluten-free"],
                ingredients: ["Aperol", "Prosecco", "soda water", "orange slice"]
            },
            {
                name: "Negroni",
                description: "Bold cocktail with gin, Campari, and sweet vermouth.",
                price: 14.95,
                category: "drinks",
                tags: ["gluten-free"],
                ingredients: ["gin", "Campari", "sweet vermouth", "orange twist"]
            },
            {
                name: "Italian Sodas",
                description: "Refreshing sparkling water with natural fruit essences.",
                price: 4.95,
                category: "drinks",
                tags: ["vegan", "gluten-free"],
                ingredients: ["sparkling water", "natural flavors"]
            },
            {
                name: "Espresso Bar",
                description: "Authentic Italian espresso and cappuccinos prepared by our expert baristas.",
                price: 3.95,
                category: "drinks",
                tags: ["gluten-free"],
                ingredients: ["espresso beans", "milk"]
            }
        ];

        // Store menu data globally for other components to access
        window.demoMenuData = menuItems;

        console.log(`Seeded ${menuItems.length} menu items`);
    }

    seedGalleryData() {
        const galleryImages = [
            {
                src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Restaurant interior with elegant lighting",
                caption: "Our warm and inviting dining room"
            },
            {
                src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Wooden tables with fresh flowers",
                caption: "Elegant table setting with seasonal arrangements"
            },
            {
                src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Kitchen open concept cooking area",
                caption: "Our open kitchen where culinary artistry comes alive"
            },
            {
                src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Spaghetti Carbonara dish presentation",
                caption: "Signature Spaghetti Carbonara - our most popular dish"
            },
            {
                src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Fresh pizza with colorful toppings",
                caption: "Artisan pizza with premium ingredients"
            },
            {
                src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Healthy salad with fresh vegetables",
                caption: "Fresh Caprese Salad with heirloom tomatoes"
            },
            {
                src: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Wine glasses with Italian red wine",
                caption: "Curated wine selection from Italian vineyards"
            },
            {
                src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                alt: "Tiramisu dessert presentation",
                caption: "Decadent Tiramisu - the perfect end to your meal"
            }
        ];

        // Store gallery data globally for other components to access
        window.demoGalleryData = galleryImages;

        console.log(`Seeded ${galleryImages.length} gallery images`);
    }

    seedBusinessInfo() {
        const businessInfo = {
            address: "123 Culinary Street\nDowntown District\nCity, State 12345",
            phone: "(234) 567-8900",
            email: "info@bellavista.com",
            hours: {
                monday: { open: "5:00 PM", close: "10:00 PM" },
                tuesday: { open: "5:00 PM", close: "10:00 PM" },
                wednesday: { open: "5:00 PM", close: "10:00 PM" },
                thursday: { open: "5:00 PM", close: "10:00 PM" },
                friday: { open: "5:00 PM", close: "11:00 PM" },
                saturday: { open: "5:00 PM", close: "11:00 PM" },
                sunday: { open: "4:00 PM", close: "9:00 PM" }
            },
            established: "2015",
            specialties: ["Handmade Pasta", "Wood-fired Pizza", "Authentic Risotto", "Fresh Seafood"]
        };

        // Store business info in localStorage for potential future use
        localStorage.setItem('bellavistaBusinessInfo', JSON.stringify(businessInfo));

        console.log('Seeded business information');
    }
}

// Initialize demo data seeder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DemoDataSeeder();
});