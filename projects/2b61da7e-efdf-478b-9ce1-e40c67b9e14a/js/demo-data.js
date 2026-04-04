// Seed realistic demo data into localStorage automatically on first load
function initDemoData() {
    if (!localStorage.getItem('team_demo_seeded')) {
        
        // Detailed Employee Data
        const employees = [
            { id: '1', name: 'Alex Morgan', role: 'Senior Frontend Engineer', dept: 'Engineering', status: 'Active', color: 'var(--pastel-mint)' },
            { id: '2', name: 'Jordan Lee', role: 'Product Manager', dept: 'Product', status: 'Active', color: 'var(--pastel-peach)' },
            { id: '3', name: 'Taylor Swift', role: 'UX Designer', dept: 'Design', status: 'On Leave', color: 'var(--pastel-lilac)' },
            { id: '4', name: 'Casey Smith', role: 'Backend Engineer', dept: 'Engineering', status: 'Active', color: 'var(--pastel-blue)' },
            { id: '5', name: 'Jamie Doe', role: 'Marketing Lead', dept: 'Marketing', status: 'Active', color: 'var(--pastel-yellow)' },
            { id: '6', name: 'Riley Jones', role: 'Data Analyst', dept: 'Data', status: 'Active', color: 'var(--pastel-mint)' },
            { id: '7', name: 'Quinn Davis', role: 'HR Manager', dept: 'Human Resources', status: 'Active', color: 'var(--pastel-peach)' },
            { id: '8', name: 'Avery Wilson', role: 'DevOps Engineer', dept: 'Engineering', status: 'Active', color: 'var(--pastel-lilac)' },
            { id: '9', name: 'Sam Taylor', role: 'Account Executive', dept: 'Sales', status: 'Active', color: 'var(--pastel-blue)' },
            { id: '10', name: 'Drew Chen', role: 'QA Engineer', dept: 'Engineering', status: 'On Leave', color: 'var(--pastel-yellow)' },
            { id: '11', name: 'Parker Stone', role: 'Creative Director', dept: 'Design', status: 'Active', color: 'var(--pastel-mint)' },
            { id: '12', name: 'Logan Hayes', role: 'Full Stack Developer', dept: 'Engineering', status: 'Active', color: 'var(--pastel-lilac)' }
        ];

        // Recent Activity Feed
        const activities = [
            { id: '1', user: 'Alex Morgan', action: 'pushed code to main branch', time: '10 mins ago', icon: '💻', color: 'var(--pastel-mint)' },
            { id: '2', user: 'Quinn Davis', action: 'approved PTO request for Taylor', time: '2 hours ago', icon: '✅', color: 'var(--pastel-peach)' },
            { id: '3', user: 'Jordan Lee', action: 'created new epic: Q3 Roadmap', time: '4 hours ago', icon: '🗺️', color: 'var(--pastel-lilac)' },
            { id: '4', user: 'Jamie Doe', action: 'published the Fall campaign', time: 'Yesterday', icon: '📢', color: 'var(--pastel-yellow)' },
            { id: '5', user: 'Casey Smith', action: 'resolved server incident #402', time: 'Yesterday', icon: '🔧', color: 'var(--pastel-blue)' },
            { id: '6', user: 'Parker Stone', action: 'uploaded new brand assets', time: '2 days ago', icon: '🎨', color: 'var(--pastel-mint)' }
        ];

        // Department Performance Data for charts
        const performanceData = [
            { dept: 'Engineering', score: 92 },
            { dept: 'Product', score: 88 },
            { dept: 'Design', score: 95 },
            { dept: 'Marketing', score: 78 },
            { dept: 'Sales', score: 85 }
        ];

        // Top level dashboard metrics
        const metrics = {
            totalActive: 48,
            pendingRequests: 7,
            departments: 6,
            avgPerformance: 87.6
        };

        // Write to localStorage
        localStorage.setItem('team_employees', JSON.stringify(employees));
        localStorage.setItem('team_activities', JSON.stringify(activities));
        localStorage.setItem('team_performance', JSON.stringify(performanceData));
        localStorage.setItem('team_metrics', JSON.stringify(metrics));
        
        // Flag to prevent re-seeding
        localStorage.setItem('team_demo_seeded', 'true');
    }
}

// Execute immediately when script loads to ensure data is ready before app logic
initDemoData();