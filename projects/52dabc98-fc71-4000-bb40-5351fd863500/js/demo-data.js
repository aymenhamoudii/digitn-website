// demo-data.js - Global scope, seeds realistic initial data
function initDemoData() {
    // Only seed if not already present to simulate real persistence
    if (!localStorage.getItem('auraDemoSeeded')) {
        
        // 1. Menu Data
        const menuItems = [
            {
                id: 'm1',
                name: 'Obsidian Scallops',
                description: 'Diver scallops dusted with black garlic ash, resting on a bed of smoked parsnip puree and micro-sorrel.',
                price: '$48',
                image: 'https://images.unsplash.com/photo-1599335191763-71881e133d1b?auto=format&fit=crop&w=600&q=80',
                notes: 'A study in contrasts. The sweetness of the scallop is balanced by the earthy bitterness of the ash.',
                tags: ['Seafood', 'Smoked', 'Signature']
            },
            {
                id: 'm2',
                name: 'Ethereal Truffle',
                description: 'Hand-rolled pasta spheres filled with liquid white truffle emulsion, finished with shaved black winter truffles.',
                price: '$65',
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
                notes: 'Our modern interpretation of carbonara. The spheres burst on the palate delivering intense umami.',
                tags: ['Pasta', 'Vegetarian', 'Rich']
            },
            {
                id: 'm3',
                name: 'Crimson Venison',
                description: 'Sous-vide venison loin, juniper berry reduction, charred leeks, and a tart cherry compote.',
                price: '$72',
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
                notes: 'Sourced from the highlands, cooked for 12 hours to achieve perfect tenderness while retaining the deep red hue.',
                tags: ['Game', 'Hearty', 'Spiced']
            },
            {
                id: 'm4',
                name: 'Abyssal Cod',
                description: 'Miso-glazed black cod, squid ink risotto, edamame foam, and delicate nori crisp.',
                price: '$58',
                image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dd36?auto=format&fit=crop&w=600&q=80',
                notes: 'The squid ink provides a stunning visual depth while the miso glaze brings sweetness and complexity.',
                tags: ['Seafood', 'Umami', 'Delicate']
            },
            {
                id: 'm5',
                name: 'Golden Orbit',
                description: 'A delicate sphere of spun sugar enclosing dark chocolate mousse and passionfruit gel center.',
                price: '$28',
                image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
                notes: 'Must be shattered with the spoon to reveal the hidden layers within.',
                tags: ['Dessert', 'Chocolate', 'Interactive']
            },
            {
                id: 'm6',
                name: 'Forest Floor',
                description: 'Matcha moss, meringue mushrooms, dark chocolate soil, and pistachio sponge cake.',
                price: '$32',
                image: 'https://images.unsplash.com/photo-1495147466023-ce5aaca3b247?auto=format&fit=crop&w=600&q=80',
                notes: 'A trompe l\'oeil dessert designed to resemble a magical woodland setting.',
                tags: ['Dessert', 'Botanical', 'Sweet']
            }
        ];

        // 2. Gallery Data
        const galleryImages = [
            { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', title: 'The Dining Room', desc: 'Minimalist elegance' },
            { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', title: 'Preparation', desc: 'Precision in every cut' },
            { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', title: 'The Cellar', desc: 'Curated vintages' },
            { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80', title: 'Service', desc: 'Attentive, invisible' },
            { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', title: 'Ambience', desc: 'Shadows and gold' }
        ];

        // 3. Reviews Data
        const reviews = [
            {
                author: 'Eleanor Vance',
                title: 'Culinary Critic',
                rating: 5,
                text: 'Aura transcends the mere act of dining. The Obsidian Scallops were a revelation, balancing texture and deep, complex flavors in a way I have rarely experienced.'
            },
            {
                author: 'Marcus Sterling',
                title: 'Gastronome Quarterly',
                rating: 5,
                text: 'The physical space is as much a masterpiece as the food. The dark, tactile aesthetic creates an intimate bubble where every sense is heightened.'
            },
            {
                author: 'Sophia Chen',
                title: 'Private Guest',
                rating: 4,
                text: 'The Forest Floor dessert is a technical marvel. The attention to detail is staggering. Booking was seamless, though securing a weekend table requires patience.'
            },
            {
                author: 'Julian Thorne',
                title: 'Design Digest',
                rating: 5,
                text: 'Finally, a restaurant that understands lighting. The neumorphic design elements translate perfectly from their digital presence to the physical menus.'
            }
        ];

        // Save to local storage
        localStorage.setItem('auraMenuData', JSON.stringify(menuItems));
        localStorage.setItem('auraGalleryData', JSON.stringify(galleryImages));
        localStorage.setItem('auraReviewsData', JSON.stringify(reviews));
        
        // Mark as seeded
        localStorage.setItem('auraDemoSeeded', 'true');
        console.log('Demo data seeded successfully.');
    }
}