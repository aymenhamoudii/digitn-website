function initDemoData() {
    if (!localStorage.getItem('demoSeeded')) {
        const menuItems = [
            { name: 'Grilled Salmon', description: 'Fresh salmon grilled to perfection with herbs.', price: 25 },
            { name: 'Caesar Salad', description: 'Crisp romaine with parmesan and Caesar dressing.', price: 12 },
            { name: 'Chicken Alfredo', description: 'Creamy Alfredo sauce over fettuccine with grilled chicken.', price: 18 },
            { name: 'Cheeseburger', description: 'Juicy beef burger with lettuce, tomato, and cheese.', price: 15 },
            { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and cocoa.', price: 8 }
        ];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));

        const contactDemo = {
            name: 'Demo User',
            email: 'demo@example.com',
            message: 'Looking forward to dining with you!'
        };
        localStorage.setItem('contactDemo', JSON.stringify(contactDemo));
        localStorage.setItem('demoSeeded', 'true');
    }
}

// Call the function to seed demo data
initDemoData();